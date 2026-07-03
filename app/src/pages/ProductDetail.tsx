import { useState } from "react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Zap, Phone, ArrowLeft, Shield, Truck, RotateCcw, Check, Star, MessageCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types";

function ProductCardSmall({ product }: { product: Product }) {
  const qualityColor = {
    genuine: "bg-green-500/20 text-green-400",
    oem: "bg-blue-500/20 text-blue-400",
    aftermarket: "bg-orange-500/20 text-orange-400",
  }[product.qualityType];

  return (
    <Link to={`/product/${product.slug}`} className="group bg-[#111] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all overflow-hidden">
      <div className="aspect-square overflow-hidden bg-[#0d0d0d]">
        <img src={product.image || ""} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
      <div className="p-3">
        <span className={`text-[9px] px-1.5 py-0.5 rounded ${qualityColor} uppercase`}>{product.qualityType}</span>
        <h4 className="text-xs font-medium text-white mt-1 line-clamp-2 group-hover:text-blue-400 transition-colors">{product.name}</h4>
        <p className="text-sm font-bold text-white mt-1">PKR {Number(product.sellingPrice).toLocaleString()}</p>
      </div>
    </Link>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = trpc.product.getBySlug.useQuery({ slug: slug || "" });
  const { data: relatedProducts } = trpc.product.getRelated.useQuery(
    { productId: product?.id || 0, categoryId: product?.categoryId || 0 },
    { enabled: !!product }
  );
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 text-center">
        <p className="text-gray-400">Product not found</p>
        <Link to="/products" className="text-blue-400 hover:underline mt-4 inline-block">Back to Products</Link>
      </div>
    );
  }

  const p = product as Product;
  const qualityColor = {
    genuine: "bg-green-500/20 text-green-400 border-green-500/30",
    oem: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    aftermarket: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  }[p.qualityType];

  const handleAddToCart = () => {
    addToCart(p, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const specs = p.specifications?.split("\n") || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-400 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-[200px]">{p.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden"
          >
            <div className="aspect-square bg-[#0d0d0d] relative">
              <img
                src={p.image || "/images/products/engine/oil-filter-generic.jpg"}
                alt={p.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase border ${qualityColor}`}>
                  {p.qualityType}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm text-blue-400 font-medium mb-1">{p.carBrand} {p.carModel} {p.yearFrom}-{p.yearTo}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{p.name}</h1>
              <p className="text-sm text-gray-400">SKU: {p.sku}</p>
            </div>

            {/* Price */}
            <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
              <div className="flex items-end gap-3 mb-3">
                <span className="text-3xl font-bold text-white">PKR {Number(p.sellingPrice).toLocaleString()}</span>
                {p.marketPriceMax && (
                  <span className="text-lg text-gray-500 line-through mb-1">PKR {Number(p.marketPriceMax).toLocaleString()}</span>
                )}
              </div>
              {p.marketPriceMin && p.marketPriceMax && (
                <p className="text-xs text-gray-500 mb-3">Market price range: PKR {Number(p.marketPriceMin).toLocaleString()} - {Number(p.marketPriceMax).toLocaleString()}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-lg ${p.stockQuantity > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {p.stockQuantity > 0 ? `In Stock (${p.stockQuantity} units)` : "Out of Stock"}
                </span>
                {p.warranty && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400">
                    Warranty: {p.warranty}
                  </span>
                )}
                {p.condition === "new" && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400">
                    Brand New
                  </span>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white/5 rounded-xl border border-white/10">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-white/5 rounded-l-xl transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(p.stockQuantity, quantity + 1))} className="p-3 hover:bg-white/5 rounded-r-xl transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={p.stockQuantity <= 0}
                  className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    added
                      ? "bg-green-600 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {added ? <><Check className="w-5 h-5" /> Added</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                </button>
              </div>

              {/* Buy Now / WhatsApp */}
              <div className="flex gap-3 mt-3">
                <a
                  href={`https://wa.me/03XXXXXXXXX?text=I'm interested in ${p.name} (SKU: ${p.sku})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-600/30 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Inquiry
                </a>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, text: "Verified Product" },
                { icon: Truck, text: "Fast Delivery" },
                { icon: RotateCcw, text: p.returnPolicy || "7 Day Return" },
                { icon: Star, text: "Quality Assured" },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm text-gray-400">
                  <badge.icon className="w-4 h-4 text-blue-400 shrink-0" />
                  {badge.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Description & Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Product Description</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{p.description || "No description available."}</p>
            </div>

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Specifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {specs.map((spec, i) => {
                    const [key, value] = spec.split(":");
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 shrink-0 w-24">{key?.trim()}</span>
                        <span className="text-sm text-white">{value?.trim()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Compatibility */}
          <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Compatibility</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Brand</span>
                <span className="text-sm text-white font-medium">{p.carBrand}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Model</span>
                <span className="text-sm text-white font-medium">{p.carModel}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Year Range</span>
                <span className="text-sm text-white font-medium">{p.yearFrom} - {p.yearTo}</span>
              </div>
              {p.engineVariant && (
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Engine</span>
                  <span className="text-sm text-white font-medium">{p.engineVariant}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Condition</span>
                <span className="text-sm text-white font-medium capitalize">{p.condition}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Quality</span>
                <span className="text-sm text-white font-medium capitalize">{p.qualityType}</span>
              </div>
              {p.warranty && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-400">Warranty</span>
                  <span className="text-sm text-white font-medium">{p.warranty}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => (
                <ProductCardSmall key={rp.id} product={rp as Product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
