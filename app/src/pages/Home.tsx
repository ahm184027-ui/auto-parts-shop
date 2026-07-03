import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  Search, ChevronRight, Shield, Camera, Truck, BadgeCheck,
  Wrench, Battery, Disc, Lightbulb, Droplets, Cog, Frame,
  Star, Phone, MapPin, Clock, ArrowRight
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { Product, Category } from "@/types";

// Fade in animation component
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Category card
function CategoryCard({ category }: { category: Category }) {
  return (
    <Link to={`/category/${category.slug}`} className="group relative overflow-hidden rounded-2xl bg-[#111] border border-white/5 hover:border-blue-500/30 transition-all duration-500">
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={category.image || "/images/categories/engine-parts.jpg"}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2">{category.description}</p>
        <div className="mt-3 flex items-center gap-1 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View Parts <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

// Product card
function ProductCard({ product }: { product: Product }) {
  const qualityColor = {
    genuine: "bg-green-500/20 text-green-400 border-green-500/30",
    oem: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    aftermarket: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  }[product.qualityType];

  return (
    <Link to={`/product/${product.slug}`} className="group bg-[#111] rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 overflow-hidden">
      <div className="aspect-square overflow-hidden bg-[#0d0d0d] relative">
        <img
          src={product.image || "/images/products/engine/oil-filter-generic.jpg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${qualityColor}`}>
            {product.qualityType}
          </span>
        </div>
        {product.stockStatus === "low_stock" && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              Low Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{product.carBrand} {product.carModel}</p>
        <h3 className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-lg font-bold text-white">PKR {Number(product.sellingPrice).toLocaleString()}</span>
          {product.marketPriceMax && (
            <span className="text-xs text-gray-500 line-through mb-0.5">PKR {Number(product.marketPriceMax).toLocaleString()}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] px-2 py-0.5 rounded ${product.stockQuantity > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : "Out of Stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Main Home Page
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const { data: categoriesData } = trpc.category.list.useQuery();
  const { data: featuredProducts } = trpc.product.getFeatured.useQuery();

  const brands = ["Toyota", "Honda", "Suzuki", "Hyundai", "Kia", "Nissan", "BMW", "Mercedes"];
  const models: Record<string, string[]> = {
    Toyota: ["Corolla", "Yaris", "Vitz", "Aqua", "Prius", "Fortuner", "Hilux"],
    Honda: ["Civic", "City", "BR-V", "HR-V", "Vezel", "Accord"],
    Suzuki: ["Alto", "Cultus", "Swift", "Wagon R", "Mehran"],
    Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe"],
    Kia: ["Sportage", "Picanto", "Stonic", "Sorento"],
    Nissan: ["Dayz", "Note", "Juke", "Sunny"],
    BMW: ["3 Series", "5 Series"],
    Mercedes: ["C-Class", "E-Class"],
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedBrand) params.set("brand", selectedBrand);
    if (selectedModel) params.set("model", selectedModel);
    window.location.href = `/products?${params.toString()}`;
  };

  return (
    <div>
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/images/hero/hero-bg.jpg"
            alt="Auto Parts Warehouse"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/50 to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-16">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium">
                <BadgeCheck className="w-4 h-4" /> Genuine Auto Parts &middot; Pakistan
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6"
            >
              Buy Genuine Auto
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Spare Parts Online
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl leading-relaxed"
            >
              Save time, avoid market hassle, and get trusted spare parts delivered to your door. 
              Compatible parts for all major car brands in Pakistan.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              onSubmit={handleSearch}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8"
            >
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by part name (e.g., oil filter, brake pads)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <select
                  value={selectedBrand}
                  onChange={(e) => { setSelectedBrand(e.target.value); setSelectedModel(""); }}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="">All Brands</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="">All Models</option>
                  {selectedBrand && models[selectedBrand]?.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <button
                  type="submit"
                  className="px-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>
            </motion.form>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              {[
                { icon: Shield, label: "Verified Products" },
                { icon: Camera, label: "Real Images" },
                { icon: Truck, label: "Fast Delivery" },
                { icon: BadgeCheck, label: "Pakistan Prices" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-sm text-gray-400">
                  <badge.icon className="w-4 h-4 text-blue-400" />
                  {badge.label}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/products"
                className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition-all hover:shadow-lg hover:shadow-orange-500/20 flex items-center gap-2"
              >
                Shop Parts <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Visit Shop
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES SECTION ==================== */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="text-blue-400 text-sm font-medium uppercase tracking-wider">Browse by Category</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">Find Parts by Category</h2>
              <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
                We have organized our inventory into categories to help you find exactly what you need for your vehicle.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoriesData?.map((category, i) => (
              <FadeIn key={category.id} delay={i * 0.1}>
                <CategoryCard category={category} />
              </FadeIn>
            ))}
            {!categoriesData && Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] bg-[#111] rounded-2xl border border-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURED PRODUCTS ==================== */}
      <section className="py-20 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-orange-400 text-sm font-medium uppercase tracking-wider">Popular Parts</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">Featured Products</h2>
              </div>
              <Link to="/products" className="hidden md:flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts?.slice(0, 8).map((product, i) => (
              <FadeIn key={product.id} delay={i * 0.05}>
                <ProductCard product={product as Product} />
              </FadeIn>
            ))}
            {!featuredProducts && Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#111] rounded-2xl border border-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="text-blue-400 text-sm font-medium uppercase tracking-wider">Why Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">Why Choose Auto Parts Shop</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Verified Genuine Parts",
                desc: "Every product is verified for authenticity. We source directly from manufacturers and authorized distributors.",
              },
              {
                icon: Camera,
                title: "Real Product Images",
                desc: "What you see is what you get. All products are photographed in-house with accurate descriptions.",
              },
              {
                icon: BadgeCheck,
                title: "Pakistan Market Prices",
                desc: "Competitive pricing based on local market rates. No hidden charges, transparent pricing always.",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Same-day delivery in Karachi. 2-3 days for other cities via trusted courier partners.",
              },
              {
                icon: Star,
                title: "Quality Grades",
                desc: "Choose from Genuine, OEM, or Aftermarket options. Each clearly labeled with warranty info.",
              },
              {
                icon: Wrench,
                title: "Compatibility Check",
                desc: "Every part shows exact car brand, model, and year compatibility before you buy.",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="p-6 bg-[#111] rounded-2xl border border-white/5 hover:border-blue-500/20 transition-colors group">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                    <item.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SHOP VISIT / CTA ==================== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/sections/shop-counter.jpg" alt="Shop" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/80 to-[#0a0a0a]/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <FadeIn>
              <span className="text-orange-400 text-sm font-medium uppercase tracking-wider">Visit Our Shop</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-6">
                Prefer to Shop In Person?
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Visit our physical store to see products firsthand. Our expert staff will help you find 
                the exact parts for your vehicle and answer any questions.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span>Main Auto Market, Karachi, Pakistan</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span>03XX-XXXXXXX</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span>Monday - Saturday: 9:00 AM - 8:00 PM</span>
                </div>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition-all"
              >
                Get Directions <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
