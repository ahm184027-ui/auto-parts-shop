import { Routes, Route } from "react-router";
import { CartProvider } from "@/contexts/CartContext";
import { TRPCProvider } from "@/providers/trpc";
import { Toaster } from "@/components/ui/sonner";

// Layout
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatBot from "@/components/chatbot/ChatBot";

// Pages
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderTracking from "@/pages/OrderTracking";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import PolicyPage from "@/pages/PolicyPage";

function App() {
  return (
    <TRPCProvider>
      <CartProvider>
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <Toaster position="top-center" richColors />
          <Routes>
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            
            {/* Public routes */}
            <Route path="*" element={
              <>
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/category/:slug" element={<Products />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/track-order" element={<OrderTracking />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/return-policy" element={<PolicyPage settingKey="returnPolicy" />} />
                    <Route path="/privacy-policy" element={<PolicyPage settingKey="privacyPolicy" />} />
                    <Route path="/terms" element={<PolicyPage settingKey="termsAndConditions" />} />
                  </Routes>
                </main>
                <Footer />
                <ChatBot />
              </>
            } />
          </Routes>
        </div>
      </CartProvider>
    </TRPCProvider>
  );
}

export default App;
