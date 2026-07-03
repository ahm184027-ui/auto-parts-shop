import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Users, MessageSquare, Star, Settings,
  LogOut, Menu, X, TrendingUp, DollarSign, AlertTriangle, ChevronRight,
  Search, Plus, Edit2, Trash2, Eye, BarChart3, Inbox, ToggleLeft
} from "lucide-react";
import { trpc } from "@/providers/trpc";

function useAdminAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("adminAuth")) navigate("/admin/login");
  }, [navigate]);
}

function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
    { icon: BarChart3, label: "Inventory", path: "/admin/inventory" },
    { icon: Users, label: "Customers", path: "/admin/customers" },
    { icon: MessageSquare, label: "AI Chats", path: "/admin/chats" },
    { icon: Star, label: "Feedback", path: "/admin/feedback" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-[#0d0d0d] border-r border-white/5 z-50 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-white">Admin Panel</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden p-1 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ==================== DASHBOARD ====================
function Dashboard() {
  const { data: stats } = trpc.admin.getDashboardStats.useQuery();
  const { data: recentOrders } = trpc.order.list.useQuery({ page: 1, limit: 5 });

  const statCards = [
    { label: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "blue" },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "green" },
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: TrendingUp, color: "orange" },
    { label: "Low Stock Items", value: stats?.lowStock || 0, icon: AlertTriangle, color: "red" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#111] rounded-2xl border border-white/5 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`w-5 h-5 text-${card.color}-400`} />
              <span className={`text-xs text-${card.color}-400 bg-${card.color}-500/10 px-2 py-0.5 rounded-full`}>Live</span>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
          <h3 className="font-semibold text-white mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders?.items?.length === 0 && <p className="text-sm text-gray-500">No orders yet</p>}
            {recentOrders?.items?.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">PKR {Number(order.grandTotal).toLocaleString()}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    order.status === "delivered" ? "bg-green-500/20 text-green-400" :
                    order.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>{order.status.replace(/_/g, " ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Stats */}
        <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
          <h3 className="font-semibold text-white mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {stats?.paymentMethodStats?.length === 0 && <p className="text-sm text-gray-500">No data</p>}
            {stats?.paymentMethodStats?.map((pm: any) => (
              <div key={pm.method} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-gray-400 capitalize">{pm.method.replace(/_/g, " ")}</span>
                <div className="text-right">
                  <p className="text-sm text-white">{pm.count} orders</p>
                  <p className="text-xs text-gray-500">PKR {Number(pm.total).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== PRODUCTS ====================
function ProductsAdmin() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.product.list.useQuery({ search: search || undefined, page, limit: 20 });
  const deleteProduct = trpc.product.delete.useMutation({ onSuccess: () => refetch() });
  const utils = trpc.useUtils();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#111] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Product</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">SKU</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Price</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Stock</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              )}
              {data?.items?.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image || ""} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#0d0d0d]" />
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.carBrand} {product.carModel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono">{product.sku}</td>
                  <td className="px-4 py-3 text-white">PKR {Number(product.sellingPrice).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400">{product.stockQuantity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      product.stockStatus === "in_stock" ? "bg-green-500/20 text-green-400" :
                      product.stockStatus === "low_stock" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>{product.stockStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-blue-400">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this product?")) deleteProduct.mutate({ id: product.id }); }}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-sm text-gray-400 hover:text-white disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {data.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages} className="text-sm text-gray-400 hover:text-white disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== ORDERS ====================
function OrdersAdmin() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const { data, refetch } = trpc.order.list.useQuery({ status: status || undefined, page, limit: 20 });
  const updateStatus = trpc.order.updateStatus.useMutation({ onSuccess: () => refetch() });

  const statuses = ["", "order_received", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-[#111] border border-white/10 rounded-xl text-white text-sm focus:outline-none">
          {statuses.map(s => (
            <option key={s} value={s}>{s ? s.replace(/_/g, " ").toUpperCase() : "All Statuses"}</option>
          ))}
        </select>
      </div>

      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Order</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Customer</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Total</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Payment</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium font-mono">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white">{order.fullName}</p>
                    <p className="text-xs text-gray-500">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">PKR {Number(order.grandTotal).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400 capitalize">{order.paymentMethod.replace(/_/g, " ")}</span>
                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                      order.paymentStatus === "verified" ? "bg-green-500/20 text-green-400" :
                      order.paymentStatus === "rejected" ? "bg-red-500/20 text-red-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>{order.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value as any })}
                      className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-2 py-1 focus:outline-none"
                    >
                      {statuses.filter(s => s).map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders?id=${order.id}`} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-blue-400 transition-colors inline-block">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-sm text-gray-400 hover:text-white disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {data.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages} className="text-sm text-gray-400 hover:text-white disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== INVENTORY ====================
function InventoryAdmin() {
  const [filter, setFilter] = useState<"all" | "low_stock" | "out_of_stock" | "featured">("all");
  const { data, refetch } = trpc.admin.getInventory.useQuery({ filter, page: 1, limit: 50 });
  const updateStock = trpc.admin.updateStock.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(["all", "low_stock", "out_of_stock", "featured"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              filter === f ? "bg-blue-600 text-white" : "bg-[#111] text-gray-400 border border-white/10 hover:text-white"
            }`}
          >
            {f.replace(/_/g, " ").toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Product</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">SKU</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Stock</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Min Alert</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white">{product.name}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono">{product.sku}</td>
                  <td className="px-4 py-3 text-white">{product.stockQuantity}</td>
                  <td className="px-4 py-3 text-gray-400">{product.minStockAlert}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      product.stockStatus === "in_stock" ? "bg-green-500/20 text-green-400" :
                      product.stockStatus === "low_stock" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>{product.stockStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        const newQty = prompt("Enter new stock quantity:", String(product.stockQuantity));
                        if (newQty && !isNaN(Number(newQty))) {
                          const qty = Number(newQty);
                          let status: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
                          if (qty === 0) status = "out_of_stock";
                          else if (qty <= product.minStockAlert) status = "low_stock";
                          updateStock.mutate({ productId: product.id, stockQuantity: qty, stockStatus: status });
                        }
                      }}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== CHATS ====================
function ChatsAdmin() {
  const { data } = trpc.admin.getChatLogs.useQuery({ page: 1, limit: 20 });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">AI Chat Logs</h2>
      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Customer</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Car Details</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Requested Part</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No chat logs yet</td></tr>}
              {data?.items?.map((chat: any) => (
                <tr key={chat.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-white">{chat.userName || "Anonymous"}</p>
                    <p className="text-xs text-gray-500">{chat.userPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{chat.carBrand} {chat.carModel} {chat.carYear}</td>
                  <td className="px-4 py-3 text-white">{chat.requestedPart}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(chat.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== FEEDBACK ====================
function FeedbackAdmin() {
  const { data } = trpc.admin.getFeedback.useQuery({ page: 1, limit: 20 });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Customer Feedback</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.items?.length === 0 && <p className="text-gray-500 col-span-2">No feedback yet</p>}
        {data?.items?.map((fb: any) => (
          <div key={fb.id} className="bg-[#111] rounded-2xl border border-white/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < fb.rating ? "text-yellow-400" : "text-gray-600"}`} fill={i < fb.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-xs text-gray-500">{new Date(fb.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-white mb-1">{fb.name}</p>
            <p className="text-sm text-gray-400">{fb.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== SETTINGS ====================
function SettingsAdmin() {
  const { data: settings } = trpc.settings.getAll.useQuery();
  const setSetting = trpc.settings.set.useMutation();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  const handleSave = (key: string) => {
    setSetting.mutate({ key, value: localSettings[key] || "" });
  };

  const fields = [
    { key: "shopName", label: "Shop Name", type: "text" },
    { key: "shopAddress", label: "Address", type: "text" },
    { key: "shopPhone", label: "Phone", type: "text" },
    { key: "shopWhatsapp", label: "WhatsApp", type: "text" },
    { key: "shopEmail", label: "Email", type: "email" },
    { key: "easypaisaNumber", label: "Easypaisa Number", type: "text" },
    { key: "jazzcashNumber", label: "JazzCash Number", type: "text" },
    { key: "bankName", label: "Bank Name", type: "text" },
    { key: "bankAccountTitle", label: "Account Title", type: "text" },
    { key: "bankAccountNumber", label: "Account Number", type: "text" },
    { key: "bankIban", label: "IBAN", type: "text" },
    { key: "deliveryCharge", label: "Delivery Charge (PKR)", type: "text" },
    { key: "openingHours", label: "Opening Hours", type: "text" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Website Settings</h2>
      <div className="bg-[#111] rounded-2xl border border-white/5 p-6 space-y-4 max-w-2xl">
        {fields.map((field) => (
          <div key={field.key} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
              <input
                type={field.type}
                value={localSettings[field.key] || ""}
                onChange={(e) => setLocalSettings({ ...localSettings, [field.key]: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => handleSave(field.key)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== CUSTOMERS ====================
function CustomersAdmin() {
  const { data: ordersData } = trpc.order.list.useQuery({ page: 1, limit: 100 });
  
  const customers = ordersData?.items?.reduce((acc: any[], order: any) => {
    const existing = acc.find(c => c.phone === order.phone);
    if (existing) {
      existing.orders += 1;
      existing.total += Number(order.grandTotal);
    } else {
      acc.push({ name: order.fullName, phone: order.phone, orders: 1, total: Number(order.grandTotal) });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Customers</h2>
      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Name</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Phone</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Orders</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {!customers?.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No customers yet</td></tr>}
              {customers?.map((c: any, i: number) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white">{c.name}</td>
                  <td className="px-4 py-3 text-gray-400">{c.phone}</td>
                  <td className="px-4 py-3 text-white">{c.orders}</td>
                  <td className="px-4 py-3 text-white font-medium">PKR {c.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN DASHBOARD LAYOUT ====================
export default function AdminDashboard() {
  useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitles: Record<string, string> = {
    "/admin/dashboard": "Dashboard",
    "/admin/products": "Products",
    "/admin/orders": "Orders",
    "/admin/inventory": "Inventory",
    "/admin/customers": "Customers",
    "/admin/chats": "AI Chat Logs",
    "/admin/feedback": "Feedback",
    "/admin/settings": "Settings",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/5 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">{pageTitles[location.pathname] || "Admin"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              View Website
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductsAdmin />} />
            <Route path="/orders" element={<OrdersAdmin />} />
            <Route path="/inventory" element={<InventoryAdmin />} />
            <Route path="/customers" element={<CustomersAdmin />} />
            <Route path="/chats" element={<ChatsAdmin />} />
            <Route path="/feedback" element={<FeedbackAdmin />} />
            <Route path="/settings" element={<SettingsAdmin />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
