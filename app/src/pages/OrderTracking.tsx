import { useState } from "react";
import { useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, RotateCcw, MapPin } from "lucide-react";
import { trpc } from "@/providers/trpc";

const STATUS_STEPS = [
  { status: "order_received", label: "Order Received", icon: Package },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle },
  { status: "packed", label: "Packed", icon: Package },
  { status: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const prefilledOrder = searchParams.get("order") || "";
  const prefilledPhone = searchParams.get("phone") || "";
  const [orderNumber, setOrderNumber] = useState(prefilledOrder);
  const [phone, setPhone] = useState(prefilledPhone);
  const [submitted, setSubmitted] = useState(!!prefilledOrder && !!prefilledPhone);

  const { data: order, isLoading } = trpc.order.track.useQuery(
    { orderNumber, phone },
    { enabled: submitted && !!orderNumber && !!phone }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const getCurrentStep = () => {
    if (!order) return -1;
    const statusOrder = ["order_received", "payment_pending", "payment_verified", "confirmed", "packed", "out_for_delivery", "delivered"];
    const idx = statusOrder.indexOf(order.status);
    if (idx <= 2) return 0;
    if (idx === 3) return 1;
    if (idx === 4) return 2;
    if (idx === 5) return 3;
    if (idx === 6) return 4;
    return -1;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Track Your Order</h1>
          <p className="text-gray-400">Enter your order number and phone number to check status</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] rounded-2xl border border-white/5 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => { setOrderNumber(e.target.value); setSubmitted(false); }}
              placeholder="Order Number (e.g., APSXXXXXX)"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSubmitted(false); }}
              placeholder="Phone Number"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Track
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
          </div>
        )}

        {submitted && !isLoading && !order && (
          <div className="text-center py-12 bg-[#111] rounded-2xl border border-white/5">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Order Not Found</h3>
            <p className="text-sm text-gray-500">Please check your order number and phone number</p>
          </div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Order Info */}
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Order Number</p>
                  <p className="text-lg font-bold text-white font-mono">{order.orderNumber}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  order.status === "delivered" ? "bg-green-500/20 text-green-400" :
                  order.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                  "bg-blue-500/20 text-blue-400"
                }`}>
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Name</p>
                  <p className="text-white">{order.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p className="text-white">{order.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Delivery</p>
                  <p className="text-white capitalize">{order.deliveryMethod.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Payment</p>
                  <p className="text-white capitalize">{order.paymentMethod.replace(/_/g, " ")}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            {order.status !== "cancelled" && order.status !== "returned" && (
              <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
                <h3 className="font-semibold text-white mb-6">Order Progress</h3>
                <div className="relative">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10" />
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, i) => {
                      const currentStep = getCurrentStep();
                      const isActive = i <= currentStep;
                      const isCurrent = i === currentStep;
                      return (
                        <div key={step.status} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 ${
                            isActive ? "bg-blue-600 border-blue-500" : "bg-[#1a1a1a] border-white/10"
                          } ${isCurrent ? "ring-4 ring-blue-500/20" : ""}`}>
                            <step.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-600"}`} />
                          </div>
                          <p className={`text-xs mt-2 text-center max-w-[80px] ${isActive ? "text-white" : "text-gray-600"}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
              <h3 className="font-semibold text-white mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-white/5">
                    {item.productImage && (
                      <img src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover bg-[#0d0d0d]" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-white">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.sku} &middot; x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-white">PKR {Number(item.totalPrice).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1 text-sm">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-white">PKR {Number(order.subtotal).toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-400"><span>Delivery</span><span className="text-white">PKR {Number(order.deliveryCharge).toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold text-base pt-1"><span className="text-white">Total</span><span className="text-white">PKR {Number(order.grandTotal).toLocaleString()}</span></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
