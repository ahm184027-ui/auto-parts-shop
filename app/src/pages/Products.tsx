import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link, useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Filter, SlidersHorizontal, Search, X, Grid3X3, List, ShoppingCart, Eye, Check } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { Product } from "@/types";
import { VEHICLE_BRANDS, YEARS } from "@/types";
import { useCart } from "@/contexts/CartContext";

function ProductCard({ product, view, onQuickView }: { product: Product; view: "grid" | "list"; onQuickView: (p: Product) => void }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const qualityColor = {
    genuine: "bg-green-500/20 text-green-400 border-green-500/30",
    oem: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    aftermarket: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  }[product.qualityType];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (view === "list") {
    return (
      <Link to={`/product/${product.slug}`} className="group flex gap-4 bg-[#111] rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all p-4">
        <div className="w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-[#0d0d0d]">
          <img src={product.image || "/images/products/engine/oil-filter-generic.jpg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase border ${qualityColor}`}>{product.qualityType}</span>
            <span className="text-[10px] text-gray-500">{product.carBrand} {product.carModel}</span>
          </div>
          <h3 className="text-base font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">{product.name}</h3>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white">PKR {Number(product.sellingPrice).toLocaleString()}</span>
              {product.marketPriceMax && <span className="text-xs text-gray-500 line-through">PKR {Number(product.marketPriceMax).toLocaleString()}</span>}
              {product.stockStatus === "out_of_stock" && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">Out of Stock</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.preventDefault(); onQuickView(product); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={handleAddToCart} disabled={product.stockQuantity === 0} className="p-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-lg text-white transition-colors">
                {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.slug}`} className="group bg-[#111] rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 overflow-hidden">
      <div className="aspect-square overflow-hidden bg-[#0d0d0d] relative">
        <img src={product.image || "/images/products/engine/oil-filter-generic.jpg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${qualityColor}`}>{product.qualityType}</span>
        </div>
        {product.stockStatus === "low_stock" && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Low Stock</span>
          </div>
        )}
        {product.stockStatus === "out_of_stock" && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">Out of Stock</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/70 to-transparent">
          <button onClick={(e) => { e.preventDefault(); onQuickView(product); }} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs flex items-center justify-center gap-1 transition-colors">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
          <button onClick={handleAddToCart} disabled={product.stockQuantity === 0} className="p-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-lg text-white transition-colors">
            {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{product.carBrand} {product.carModel}</p>
        <h3 className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">{product.name}</h3>
        <div className="flex items-end gap-2">
          <span className="text-lg font-bold text-white">PKR {Number(product.sellingPrice).toLocaleString()}</span>
          {product.marketPriceMax && <span className="text-xs text-gray-500 line-through">PKR {Number(product.marketPriceMax).toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  );
}

function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="font-semibold text-white">Quick View</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="aspect-square rounded-xl overflow-hidden bg-[#0d0d0d]">
            <img src={product.image || "/images/products/engine/oil-filter-generic.jpg"} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{product.carBrand} {product.carModel}</p>
            <h2 className="text-lg font-semibold text-white mb-2">{product.name}</h2>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-xl font-bold text-white">PKR {Number(product.sellingPrice).toLocaleString()}</span>
              {product.marketPriceMax && <span className="text-sm text-gray-500 line-through mb-0.5">PKR {Number(product.marketPriceMax).toLocaleString()}</span>}
            </div>
            <p className="text-sm text-gray-400 mb-4 line-clamp-4">{product.description}</p>
            <div className="flex gap-3">
              <button
                onClick={() => { addToCart(product, 1); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
                disabled={product.stockQuantity === 0}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-xl text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />} {added ? "Added" : "Add to Cart"}
              </button>
              <button
                onClick={() => navigate(`/product/${product.slug}`)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [model, setModel] = useState(searchParams.get("model") || "");
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [qualityType, setQualityType] = useState(searchParams.get("quality") || "");
  const [sortBy, setSortBy] = useState<"name" | "price_asc" | "price_desc" | "newest">("newest");

  const showBrandPicker = searchParams.get("view") === "brands" && !brand;

  const { data: categoriesData } = trpc.category.list.useQuery();
  const { data: productsData, isLoading } = trpc.product.list.useQuery({
    categoryId: slug ? categoriesData?.find(c => c.slug === slug)?.id : undefined,
    brand: brand || undefined,
    model: model || undefined,
    year: year ? Number(year) : undefined,
    qualityType: qualityType || undefined,
    search: search || undefined,
    sortBy,
    page,
    limit: 24,
  });

  const selectedBrandData = VEHICLE_BRANDS.find(b => b.name === brand);
  const currentCategory = slug ? categoriesData?.find(c => c.slug === slug) : null;

  const applyFilters = () => {
    setPage(1);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applySidebarFilters = () => {
    setPage(1);
    setFiltersOpen(false);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectBrand = (name: string) => {
    setBrand(name);
    searchParams.delete("view");
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearch("");
    setBrand("");
    setModel("");
    setYear("");
    setQualityType("");
    setPage(1);
  };

  const hasFilters = search || brand || model || year || qualityType;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img
          src={currentCategory?.image || "/images/hero/hero-bg.jpg"}
          alt={currentCategory?.name || "Products"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {currentCategory?.name || "All Products"}
            </h1>
            <p className="text-gray-400 text-sm">
              {productsData?.total || 0} products available
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Vehicle Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] rounded-2xl border border-white/5 p-4 mb-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-400 mr-2">Find parts for:</span>
            <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); }} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">Select Brand</option>
              {VEHICLE_BRANDS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
            </select>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" disabled={!brand}>
              <option value="">Select Model</option>
              {selectedBrandData?.models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">Select Year</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
              Find Parts
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-colors flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 shrink-0 ${filtersOpen ? "block" : "hidden lg:block"}`}>
            <div className="bg-[#111] rounded-2xl border border-white/5 p-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-blue-400 hover:text-blue-300">Reset</button>
                )}
              </div>

              {/* Search */}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Part name..." className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Quality Type */}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-2 block">Quality</label>
                <div className="space-y-2">
                  {["genuine", "oem", "aftermarket"].map(q => (
                    <label key={q} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="quality" value={q} checked={qualityType === q} onChange={(e) => setQualityType(e.target.value)} className="accent-blue-500" />
                      <span className="text-sm text-gray-300 capitalize">{q}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="quality" value="" checked={!qualityType} onChange={() => setQualityType("")} className="accent-blue-500" />
                    <span className="text-sm text-gray-300">All</span>
                  </label>
                </div>
              </div>

              {/* Categories */}
              {categoriesData && (
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-2 block">Categories</label>
                  <div className="space-y-1.5">
                    <Link to="/products" className={`block text-sm py-1.5 px-2 rounded-lg transition-colors ${!slug ? "bg-blue-600/20 text-blue-400" : "text-gray-300 hover:bg-white/5"}`}>
                      All Products
                    </Link>
                    {categoriesData.map(cat => (
                      <Link key={cat.id} to={`/category/${cat.slug}`} className={`block text-sm py-1.5 px-2 rounded-lg transition-colors ${slug === cat.slug ? "bg-blue-600/20 text-blue-400" : "text-gray-300 hover:bg-white/5"}`}>
                        {cat.name} ({cat.productCount || 0})
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={applySidebarFilters} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1" ref={resultsRef}>
            {showBrandPicker && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">Shop by Brand</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {VEHICLE_BRANDS.map((b) => (
                    <button
                      key={b.name}
                      onClick={() => selectBrand(b.name)}
                      className="p-4 bg-[#111] border border-white/5 hover:border-blue-500/30 rounded-xl text-center transition-colors"
                    >
                      <p className="text-white font-medium">{b.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{b.models.length} models</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">
                Showing {productsData?.items?.length || 0} of {productsData?.total || 0} products
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 flex items-center gap-1">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none">
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
                <div className="hidden md:flex bg-white/5 rounded-lg border border-white/10">
                  <button onClick={() => setView("grid")} className={`p-2 rounded-l-lg ${view === "grid" ? "bg-blue-600 text-white" : "text-gray-400"}`}><Grid3X3 className="w-4 h-4" /></button>
                  <button onClick={() => setView("list")} className={`p-2 rounded-r-lg ${view === "list" ? "bg-blue-600 text-white" : "text-gray-400"}`}><List className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className={`grid gap-4 ${view === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`bg-[#111] rounded-2xl border border-white/5 animate-pulse ${view === "list" ? "h-32" : "aspect-[3/4]"}`} />
                ))}
              </div>
            ) : productsData?.items?.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-2">No products found</p>
                <p className="text-sm text-gray-600">Try adjusting your filters</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${view === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
                {productsData?.items?.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <ProductCard product={product as Product} view={view} onQuickView={setQuickViewProduct} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {productsData && productsData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm disabled:opacity-50 hover:bg-white/10 transition-colors">
                  Previous
                </button>
                <span className="text-sm text-gray-400 px-4">Page {page} of {productsData.totalPages}</span>
                <button onClick={() => setPage(p => Math.min(productsData.totalPages, p + 1))} disabled={page >= productsData.totalPages} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm disabled:opacity-50 hover:bg-white/10 transition-colors">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
