import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Star } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { whatsAppLink } from "@/lib/utils";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", rating: 5, message: "" });
  const [submitted, setSubmitted] = useState(false);
  const submitFeedback = trpc.settings.submitFeedback.useMutation();
  const { data: settings } = trpc.settings.getAll.useQuery();

  const shopAddress = settings?.shopAddress || "Main Auto Market, Karachi, Pakistan";
  const mapEmbedUrl = settings?.googleMapsUrl?.includes("output=embed")
    ? settings.googleMapsUrl
    : `https://www.google.com/maps?q=${encodeURIComponent(shopAddress)}&output=embed`;
  const directionsUrl = settings?.googleMapsUrl && settings.googleMapsUrl !== "https://maps.google.com"
    ? settings.googleMapsUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopAddress)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback.mutateAsync(formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", phone: "", rating: 5, message: "" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero */}
        <div className="relative h-64 rounded-3xl overflow-hidden mb-12">
          <img src="/images/sections/shop-counter.jpg" alt="Shop" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">Contact Us</h1>
              <p className="text-gray-300">We are here to help you find the right parts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Shop Address</h3>
                  <p className="text-sm text-gray-400">{shopAddress}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Phone / WhatsApp</h3>
                  <a href={`tel:${settings?.shopPhone || ""}`} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">{settings?.shopPhone || "03XX-XXXXXXX"}</a>
                  <a
                    href={whatsAppLink(settings?.shopWhatsapp, "Hi, I'd like to ask about a spare part.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-green-400 mt-2 hover:underline w-fit"
                  >
                    <MessageCircle className="w-3 h-3" /> Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Email</h3>
                  <a href={`mailto:${settings?.shopEmail || ""}`} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">{settings?.shopEmail || "info@autopartsshop.pk"}</a>
                </div>
              </div>
            </div>

            <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Opening Hours</h3>
                  <p className="text-sm text-gray-400 whitespace-pre-line">{settings?.openingHours || "Mon - Sat: 9:00 AM - 8:00 PM"}</p>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
              <iframe
                title="Shop location"
                src={mapEmbedUrl}
                className="w-full h-48 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 text-sm text-blue-400 hover:bg-white/5 transition-colors border-t border-white/5"
              >
                <MapPin className="w-4 h-4" /> Get Directions
              </a>
            </div>
          </motion.div>

          {/* Feedback Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
                  <p className="text-gray-400">Your feedback has been submitted successfully.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-4 text-blue-400 hover:underline text-sm">Send another message</button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-white mb-2">Send us a Message</h2>
                  <p className="text-sm text-gray-400 mb-6">Have a question or feedback? We'd love to hear from you.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Name *</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm" placeholder="Your name" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Email</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm" placeholder="Optional" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm" placeholder="03XX-XXXXXXX" />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setFormData({...formData, rating: star})} className={`p-1 transition-colors ${star <= formData.rating ? "text-yellow-400" : "text-gray-600"}`}>
                            <Star className="w-6 h-6" fill={star <= formData.rating ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Message *</label>
                      <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm resize-none" rows={4} placeholder="Your message..." />
                    </div>

                    <button type="submit" disabled={submitFeedback.isPending} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      <Send className="w-4 h-4" /> {submitFeedback.isPending ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
