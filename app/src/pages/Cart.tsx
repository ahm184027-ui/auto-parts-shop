import { Link } from "react-router";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const deliveryCharge = subtotal > 5000 ? 0 : 200;
  const serviceFee = 0;
  const grandTotal = subtotal + deliveryCharge + serviceFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-8">Shopping Cart ({items.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 bg-[#111] rounded-2xl border border-white/5 p-4"
              >
                <Link to={`/product/${item.product.slug}`} className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-[#0d0d0d]">
                  <img src={item.product.image || ""} alt={item.product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.slug}`} className="text-sm font-medium text-white hover:text-blue-400 transition-colors line-clamp-2">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{item.product.carBrand} {item.product.carModel}</p>
                  <p className="text-sm font-bold text-white mt-1">PKR {Number(item.product.sellingPrice).toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-white/5 rounded-l-lg transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, Math.min(item.product.stockQuantity, item.quantity + 1))}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="p-1.5 hover:bg-white/5 rounded-r-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {item.quantity >= item.product.stockQuantity && (
                    <p className="text-[11px] text-yellow-500 mt-1">Only {item.product.stockQuantity} unit(s) in stock</p>
                  )}
                </div>
              </motion.div>
            ))}

            <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Clear Cart
            </button>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Order Summary</h2>
              
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-green-400" : "text-white"}>
                    {deliveryCharge === 0 ? "FREE" : `PKR ${deliveryCharge}`}
                  </span>
                </div>
                {serviceFee > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Service Fee</span>
                    <span className="text-white">PKR {serviceFee}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-white">PKR {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {subtotal < 5000 && (
                <p className="text-xs text-gray-500">Add PKR {(5000 - subtotal).toLocaleString()} more for free delivery</p>
              )}

              <Link
                to="/checkout"
                className="block w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold text-center transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/products"
                className="block w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium text-center transition-colors text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
