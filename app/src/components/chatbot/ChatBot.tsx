import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Phone, MapPin, Car } from "lucide-react";
import type { ChatMessage } from "@/types";

const SESSION_ID = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState<"welcome" | "brand" | "model" | "year" | "part" | "confirm" | "details">("welcome");
  const [chatData, setChatData] = useState({ brand: "", model: "", year: "", part: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: Date.now() }]);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      addMessage("assistant", "Hello! I'm your Auto Parts Assistant. I can help you find the right spare parts for your car. What car brand do you have?");
      setStep("brand");
    }
  };

  const processResponse = (userInput: string) => {
    const lower = userInput.toLowerCase();
    
    if (step === "brand") {
      setChatData(prev => ({ ...prev, brand: userInput }));
      addMessage("assistant", `Great! You have a ${userInput}. What model is it? (e.g., Corolla, Civic, Alto, Sportage)`);
      setStep("model");
    } else if (step === "model") {
      setChatData(prev => ({ ...prev, model: userInput }));
      addMessage("assistant", `Got it - ${chatData.brand} ${userInput}. Which year model? (e.g., 2020, 2018)`);
      setStep("year");
    } else if (step === "year") {
      setChatData(prev => ({ ...prev, year: userInput }));
      addMessage("assistant", `Perfect! ${chatData.brand} ${chatData.model} ${userInput}. What part are you looking for? (e.g., oil filter, brake pads, headlight)`);
      setStep("part");
    } else if (step === "part") {
      setChatData(prev => ({ ...prev, part: userInput }));
      addMessage("assistant", `Thanks! I'm checking our inventory for ${userInput} for your ${chatData.brand} ${chatData.model} ${chatData.year}...`);
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        addMessage("assistant", `We have several options for ${userInput} compatible with your car:\n\n1. **Genuine** - Best quality, manufacturer warranty\n2. **OEM** - Original Equipment quality, great value\n3. **Aftermarket** - Budget-friendly, reliable\n\nPrices range from PKR 800 to PKR 18,000 depending on the quality and brand.\n\nWould you like me to help you place an order or need more details?`);
        setStep("confirm");
      }, 1500);
    } else if (step === "confirm" || step === "details") {
      if (lower.includes("order") || lower.includes("buy") || lower.includes("yes")) {
        addMessage("assistant", `To proceed with your order, could you please share:\n\n1. Your full name\n2. Phone number\n3. City\n4. Delivery address`);
        setStep("details");
      } else if (lower.includes("price") || lower.includes("cost")) {
        addMessage("assistant", `For your ${chatData.brand} ${chatData.model} ${chatData.year} ${chatData.part}:\n\n- **Genuine**: PKR 1,500 - 3,500\n- **OEM**: PKR 1,000 - 2,200\n- **Aftermarket**: PKR 800 - 1,500\n\nAll prices include GST. Delivery charges are PKR 200 only.`);
      } else {
        addMessage("assistant", `I understand you're looking for ${chatData.part} for your ${chatData.brand} ${chatData.model}. You can:\n\n1. Browse our products at autosparts.pk\n2. Call us at 03XX-XXXXXXX\n3. Visit our shop in Karachi\n\nWould you like to place an order?`);
      }
    } else {
      addMessage("assistant", `Thank you for the details! Our team will contact you shortly to confirm your order.\n\nYour request:\n- Car: ${chatData.brand} ${chatData.model} (${chatData.year})\n- Part: ${chatData.part}\n- Name: ${userInput.split("\n")[0] || userInput}\n\nOrder reference: #APS${Date.now().toString(36).toUpperCase()}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    addMessage("user", input);
    processResponse(input);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 transition-transform animate-pulse"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Auto Parts Assistant</h3>
                <p className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white/5 text-gray-200 border border-white/5 rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 bg-orange-500/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-orange-400" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>

          {/* Quick actions */}
          <div className="px-3 pb-3 flex gap-1.5 overflow-x-auto">
            <button onClick={() => { setInput("Check price"); }} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-1">
              <Car className="w-3 h-3" /> Check Price
            </button>
            <button onClick={() => { setInput("Place order"); }} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-1">
              <Phone className="w-3 h-3" /> Order
            </button>
            <button onClick={() => { setInput("Shop location"); }} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </button>
          </div>
        </div>
      )}
    </>
  );
}
