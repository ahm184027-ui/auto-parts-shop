import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { ShoppingCart, Menu, X, Search, Phone } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/products" },
    { label: "Brands", href: "/products?view=brands" },
    { label: "Track Order", href: "/track-order" },
    { label: "Contact", href: "/contact" },
  ];

  const isTransparent = !scrolled && location.pathname === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? "bg-transparent"
          : "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5"
      }`}
    >
      {/* Top bar */}
      <div className={`${isTransparent ? "hidden" : "hidden md:block"} border-b border-white/5 bg-[#111]`}>
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 03XX-XXXXXXX</span>
            <span>Mon-Sat: 9AM - 8PM</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="hover:text-blue-400 transition-colors">Track Order</Link>
            <Link to="/contact" className="hover:text-blue-400 transition-colors">Help</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-lg tracking-tight leading-tight ${isTransparent ? "text-white" : "text-white"}`}>
                Auto Parts
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-gray-500 -mt-0.5">Shop</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-300 hover:text-blue-400 ${
                  location.pathname === link.href ? "text-blue-400" : "text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-300" />
            </button>
            
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-300" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <Link
              to="/admin/login"
              className="hidden md:block px-4 py-1.5 text-sm font-medium bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              Admin
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#111] border-b border-white/10 p-4">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <input
              type="text"
              placeholder="Search by part name, brand, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#111] border-b border-white/10 p-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="block py-2 text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin/login"
            className="block py-2 text-sm font-medium text-blue-400"
          >
            Admin Login
          </Link>
        </div>
      )}
    </header>
  );
}
