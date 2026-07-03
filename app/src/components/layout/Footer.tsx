import { Link } from "react-router";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-lg text-white">Auto Parts Shop</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted source for genuine auto spare parts in Pakistan. 
              Quality products, competitive prices, and fast delivery.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-blue-600/20 hover:text-blue-400 transition-all">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "All Products", href: "/products" },
                { label: "Categories", href: "/products" },
                { label: "Track Order", href: "/track-order" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Categories</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Engine Parts", href: "/category/engine-parts" },
                { label: "Brake System", href: "/category/brake-system" },
                { label: "Electrical Parts", href: "/category/electrical-parts" },
                { label: "Lights", href: "/category/lights" },
                { label: "Oils & Fluids", href: "/category/oils-fluids" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">Main Auto Market, Karachi, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-sm text-gray-400">03XX-XXXXXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-sm text-gray-400">info@autopartsshop.pk</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-sm text-gray-400">Mon-Sat: 9AM - 8PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Auto Parts Shop. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Return Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
