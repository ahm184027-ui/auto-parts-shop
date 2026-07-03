import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Truck, Store, MapPin, Check, Phone, MessageSquare, Mail, Upload } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/providers/trpc";

type PaymentMethod = "easypaisa" | "jazzcash" | "bank_transfer" | "cod";
type DeliveryMethod = "pickup" | "local_delivery" | "courier";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrder = trpc.order.create.useMutation();

  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    city: "Karachi",
    notes: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("courier");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [orderNumber, setOrderNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const deliveryCharge = deliveryMethod === "pickup" ? 0 : subtotal > 5000 ? 0 : 200;
  const serviceFee = 0;
  const grandTotal = subtotal + deliveryCharge + serviceFee;

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
          <Link to="/products" className="text-blue-400 hover:underline">Browse Products</Link>
        </div>
      </div>
    );
  }

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Required";
    if (!formData.phone.trim()) newErrors.phone = "Required";
    if (!formData.address.trim()) newErrors.address = "Required";
    if (!formData.city.trim()) newErrors.city = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateDetails()) setStep("payment");
  };

  const handlePlaceOrder = async () => {
    try {
      const result = await createOrder.mutateAsync({
        fullName: formData.fullName,
        phone: formData.phone,
        whatsapp: formData.whatsapp || undefined,
        email: formData.email || undefined,
        address: formData.address,
        city: formData.city,
        deliveryMethod,
        paymentMethod,
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image || undefined,
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: Number(item.product.sellingPrice),
          totalPrice: Number(item.product.sellingPrice) * item.quantity,
        })),
        subtotal,
        deliveryCharge,
        serviceFee,
        grandTotal,
        notes: formData.notes || undefined,
      });
      setOrderNumber(result.orderNumber);
      clearCart();
      setStep("success");
    } catch (err) {
      console.error("Order failed:", err);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-400 mb-2">Thank you for your order.</p>
          <p className="text-sm text-gray-500 mb-6">Order Number: <span className="text-blue-400 font-mono">{orderNumber}</span></p>
          
          <div className="bg-[#111] rounded-2xl border border-white/5 p-5 mb-6 text-left space-y-2">
            <p className="text-sm text-gray-400">We'll contact you at <span className="text-white">{formData.phone}</span> to confirm your order.</p>
            {paymentMethod !== "cod" && (
              <p className="text-sm text-gray-400">Please complete payment and share screenshot via WhatsApp.</p>
            )}
          </div>

          <div className="flex gap-3">
            <Link to={`/track-order?order=${orderNumber}&phone=${formData.phone}`} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors">
              Track Order
            </Link>
            <Link to="/" className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back */}
        <button onClick={() => step === "payment" ? setStep("details") : navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> {step === "payment" ? "Back to Details" : "Back to Cart"}
        </button>

        <h1 className="text-2xl font-bold text-white mb-8">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === "details" ? "text-blue-400" : "text-green-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "details" ? "bg-blue-600/20" : "bg-green-600/20"}`}>
              {step === "details" ? "1" : <Check className="w-4 h-4" />}
            </div>
            <span className="text-sm font-medium">Details</span>
          </div>
          <div className="flex-1 h-px bg-white/10" />
          <div className={`flex items-center gap-2 ${step === "payment" ? "text-blue-400" : "text-gray-600"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "payment" ? "bg-blue-600/20" : "bg-white/5"}`}>
              2
            </div>
            <span className="text-sm font-medium">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            {step === "details" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-[#111] rounded-2xl border border-white/5 p-5 space-y-4">
                  <h2 className="font-semibold text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /> Delivery Information</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Full Name *</label>
                      <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 ${errors.fullName ? "border-red-500" : "border-white/10"}`} placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Phone *</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 ${errors.phone ? "border-red-500" : "border-white/10"}`} placeholder="03XX-XXXXXXX" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">WhatsApp</label>
                      <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" placeholder="03XX-XXXXXXX" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Email</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Optional" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Address *</label>
                    <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none ${errors.address ? "border-red-500" : "border-white/10"}`} rows={2} placeholder="Complete delivery address" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">City *</label>
                      <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                        <option>Karachi</option>
                        <option>Lahore</option>
                        <option>Islamabad</option>
                        <option>Rawalpindi</option>
                        <option>Faisalabad</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                      <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Optional" />
                    </div>
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
                  <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-blue-400" /> Delivery Method</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: "pickup" as const, label: "Shop Pickup", desc: "Free", icon: Store },
                      { value: "local_delivery" as const, label: "Local Delivery", desc: "PKR 200", icon: Truck },
                      { value: "courier" as const, label: "Courier", desc: "PKR 200", icon: MapPin },
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setDeliveryMethod(method.value)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          deliveryMethod === method.value
                            ? "border-blue-500 bg-blue-600/10"
                            : "border-white/5 bg-white/5 hover:border-white/10"
                        }`}
                      >
                        <method.icon className={`w-5 h-5 mb-2 ${deliveryMethod === method.value ? "text-blue-400" : "text-gray-500"}`} />
                        <p className="text-sm font-medium text-white">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleContinue} className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition-colors">
                  Continue to Payment
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Payment Methods */}
                <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
                  <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-400" /> Payment Method</h2>
                  <div className="space-y-3">
                    {[
                      { value: "cod" as const, label: "Cash on Delivery (COD)", desc: "Pay when you receive", icon: Phone },
                      { value: "easypaisa" as const, label: "Easypaisa", desc: "Send to: 03XX-XXXXXXX", icon: MessageSquare },
                      { value: "jazzcash" as const, label: "JazzCash", desc: "Send to: 03XX-XXXXXXX", icon: MessageSquare },
                      { value: "bank_transfer" as const, label: "Bank Transfer", desc: "Account: XXXXXXXX", icon: CreditCard },
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value)}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          paymentMethod === method.value
                            ? "border-blue-500 bg-blue-600/10"
                            : "border-white/5 bg-white/5 hover:border-white/10"
                        }`}
                      >
                        <method.icon className={`w-5 h-5 ${paymentMethod === method.value ? "text-blue-400" : "text-gray-500"}`} />
                        <div>
                          <p className="text-sm font-medium text-white">{method.label}</p>
                          <p className="text-xs text-gray-500">{method.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {paymentMethod !== "cod" && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-sm text-yellow-400 mb-2">Please send payment to the account above and upload the screenshot.</p>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-colors">
                        <Upload className="w-4 h-4" /> Upload Screenshot
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={createOrder.isPending}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {createOrder.isPending ? "Placing Order..." : `Place Order - PKR ${grandTotal.toLocaleString()}`}
                </button>
              </motion.div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-[#111] rounded-2xl border border-white/5 p-5 space-y-3">
              <h2 className="font-semibold text-white">Order Summary</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3 py-2 border-b border-white/5">
                    <img src={item.product.image || ""} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#0d0d0d]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{item.product.name}</p>
                      <p className="text-[10px] text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-xs text-white font-medium">PKR {(Number(item.product.sellingPrice) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-white">PKR {subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-400"><span>Delivery</span><span className={deliveryCharge === 0 ? "text-green-400" : "text-white"}>{deliveryCharge === 0 ? "FREE" : `PKR ${deliveryCharge}`}</span></div>
                <div className="flex justify-between font-semibold"><span className="text-white">Total</span><span className="text-white text-lg">PKR {grandTotal.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
