import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { MessageCircle, X, Send, Bot, User, Loader2, Phone, MapPin, Car, ShoppingCart, Mic, MicOff } from "lucide-react";
import type { ChatMessage, Product } from "@/types";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/contexts/CartContext";
import { onOpenAiAssistant } from "@/lib/chatbot-events";

const SESSION_ID = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

type Lang = "en" | "ur";

const URDU_SCRIPT_RE = /[؀-ۿ]/;

const T = {
  en: {
    online: "Online",
    title: "Auto Parts Assistant",
    placeholder: "Type your message...",
    welcome: "Hello! I'm your Auto Parts Assistant. I can help you find the right spare parts for your car. What car brand do you have?",
    quickPrice: "Check Price",
    quickOrder: "Order",
    quickLocation: "Location",
    quickPriceInput: "Check price",
    quickOrderInput: "Place order",
    quickLocationInput: "Shop location",
    askModel: (brand: string) => `Great! You have a ${brand}. What model is it? (e.g., Corolla, Civic, Alto, Sportage)`,
    askYear: (brand: string, model: string) => `Got it - ${brand} ${model}. Which year model? (e.g., 2020, 2018)`,
    askPart: (brand: string, model: string, year: string) => `Perfect! ${brand} ${model} ${year}. What part are you looking for? (e.g., oil filter, brake pads, headlight)`,
    checking: (part: string, brand: string, model: string, year: string) => `Thanks! Let me check our real inventory for ${part} for your ${brand} ${model} ${year}...`,
    notFound: (part: string, brand: string, model: string) => `Sorry, I couldn't find "${part}" for your ${brand} ${model} right now. Our team has been notified and will check availability with our suppliers. Would you like to leave your contact details so we can follow up?`,
    outOfStock: (part: string, brand: string, model: string) => `We have "${part}" listed for your ${brand} ${model}, but it's currently out of stock. Our team has been notified — would you like to leave your contact details so we can notify you when it's back, or suggest an alternative?`,
    foundResults: (brand: string, model: string, year: string, lines: string) => `Good news! Here's what we have for your ${brand} ${model} ${year}:\n\n${lines}\n\nWould you like to place an order, or need more details?`,
    lowStockLabel: "low stock",
    inStockLabel: "in stock",
    askDetails: "To proceed, could you please share:\n\n1. Your full name\n2. Phone number\n3. Delivery address\n\n(You can type it all in one message.)",
    askContactOnly: "Sure — please share your name, phone number, and address so our team can follow up.",
    qualityGuide: "Quick guide to quality types:\n\n- **Genuine**: manufacturer-made, best quality, comes with warranty\n- **OEM**: original-equipment quality at a better price\n- **Aftermarket**: budget-friendly, reliable for daily use\n\nWould you like to place an order?",
    fallbackConfirm: "You can browse the full catalog on our Products page, call us, or visit our shop in Rawalpindi. Would you like to place an order or get more details?",
    thankYou: (brand: string, model: string, year: string, part: string, ref: string) => `Thank you! Our team will contact you shortly to confirm your order.\n\nYour request:\n- Car: ${brand} ${model} (${year})\n- Part: ${part}\n\nOrder reference: #${ref}`,
    anythingElse: "Is there anything else I can help you find for your car?",
    addToCart: (name: string) => `Add "${name}" to Cart`,
    micUnsupported: "Voice input isn't supported in this browser.",
    micListening: "Listening...",
    micError: "Couldn't hear that clearly — please try again or type your message.",
    micDenied: "Microphone access was blocked. Please allow it in your browser settings to use voice input.",
  },
  ur: {
    online: "آن لائن",
    title: "آٹو پارٹس اسسٹنٹ",
    placeholder: "اپنا پیغام یہاں لکھیں...",
    welcome: "السلام علیکم! میں آپ کا آٹو پارٹس اسسٹنٹ ہوں۔ میں آپ کی گاڑی کے لیے صحیح پرزے تلاش کرنے میں مدد کر سکتا ہوں۔ آپ کی گاڑی کونسے برانڈ کی ہے؟",
    quickPrice: "قیمت چیک کریں",
    quickOrder: "آرڈر کریں",
    quickLocation: "لوکیشن",
    quickPriceInput: "قیمت بتائیں",
    quickOrderInput: "آرڈر دینا ہے",
    quickLocationInput: "دکان کا پتا",
    askModel: (brand: string) => `بہت خوب! آپ کے پاس ${brand} ہے۔ ماڈل کونسا ہے؟ (مثلاً کرولا، سِوک، آلٹو، سپورٹیج)`,
    askYear: (brand: string, model: string) => `ٹھیک ہے - ${brand} ${model}۔ ماڈل سال کونسا ہے؟ (مثلاً 2020، 2018)`,
    askPart: (brand: string, model: string, year: string) => `بہترین! ${brand} ${model} ${year}۔ آپ کو کونسا پرزہ چاہیے؟ (مثلاً آئل فلٹر، بریک پیڈز، ہیڈ لائٹ)`,
    checking: (part: string, brand: string, model: string, year: string) => `شکریہ! میں آپ کی ${brand} ${model} ${year} کے لیے "${part}" ہمارے اصل اسٹاک میں چیک کرتا ہوں...`,
    notFound: (part: string, brand: string, model: string) => `معذرت، ابھی آپ کی ${brand} ${model} کے لیے "${part}" دستیاب نہیں۔ ہماری ٹیم کو مطلع کر دیا گیا ہے اور وہ سپلائرز سے چیک کرے گی۔ کیا آپ اپنی رابطہ تفصیلات دینا چاہیں گے تاکہ ہم آپ سے رابطہ کر سکیں؟`,
    outOfStock: (part: string, brand: string, model: string) => `آپ کی ${brand} ${model} کے لیے "${part}" ہماری فہرست میں موجود ہے، لیکن فی الحال اسٹاک ختم ہے۔ ہماری ٹیم کو مطلع کر دیا گیا ہے — کیا آپ اپنی تفصیلات دینا چاہیں گے تاکہ دستیاب ہونے پر ہم بتائیں، یا کوئی متبادل تجویز کریں؟`,
    foundResults: (brand: string, model: string, year: string, lines: string) => `اچھی خبر! آپ کی ${brand} ${model} ${year} کے لیے یہ دستیاب ہے:\n\n${lines}\n\nکیا آپ آرڈر دینا چاہیں گے یا مزید تفصیلات چاہیے؟`,
    lowStockLabel: "کم اسٹاک",
    inStockLabel: "دستیاب",
    askDetails: "آگے بڑھنے کے لیے، براہ کرم بتائیں:\n\n1. آپ کا پورا نام\n2. فون نمبر\n3. ڈیلیوری ایڈریس\n\n(آپ سب کچھ ایک ہی پیغام میں لکھ سکتے ہیں۔)",
    askContactOnly: "ضرور — براہ کرم اپنا نام، فون نمبر اور ایڈریس بتائیں تاکہ ہماری ٹیم رابطہ کر سکے۔",
    qualityGuide: "کوالٹی اقسام کی مختصر رہنمائی:\n\n- **جینوئن**: کمپنی کا بنایا ہوا، بہترین کوالٹی، وارنٹی کے ساتھ\n- **او ای ایم**: اصل کوالٹی، بہتر قیمت میں\n- **آفٹر مارکیٹ**: کم قیمت، روزمرہ استعمال کے لیے قابلِ بھروسہ\n\nکیا آپ آرڈر دینا چاہیں گے؟",
    fallbackConfirm: "آپ ہماری پراڈکٹس پیج پر پورا کیٹلاگ دیکھ سکتے ہیں، ہمیں کال کر سکتے ہیں، یا راولپنڈی میں ہماری دکان پر تشریف لا سکتے ہیں۔ کیا آپ آرڈر دینا چاہیں گے یا مزید تفصیلات چاہیے؟",
    thankYou: (brand: string, model: string, year: string, part: string, ref: string) => `شکریہ! ہماری ٹیم جلد آپ سے رابطہ کر کے آرڈر کنفرم کرے گی۔\n\nآپ کی درخواست:\n- گاڑی: ${brand} ${model} (${year})\n- پرزہ: ${part}\n\nآرڈر ریفرنس: #${ref}`,
    anythingElse: "کیا آپ کی گاڑی کے لیے مزید کوئی مدد چاہیے؟",
    addToCart: (name: string) => `"${name}" کارٹ میں شامل کریں`,
    micUnsupported: "اس براؤزر میں صوتی ان پٹ دستیاب نہیں۔",
    micListening: "سن رہا ہوں...",
    micError: "سمجھ نہیں آیا — دوبارہ کوشش کریں یا ٹائپ کریں۔",
    micDenied: "مائیکروفون کی اجازت نہیں ملی۔ براہِ کرم براؤزر سیٹنگز میں اجازت دیں۔",
  },
} as const;

const CONFIRM_KEYWORDS = {
  order: ["order", "buy", "yes", "haan", "han", "chahiye", "kharidna", "آرڈر", "خریدنا", "ہاں", "چاہیے"],
  details: ["detail", "contact", "tafseel", "raabta", "تفصیل", "رابطہ"],
  quality: ["genuine", "oem", "aftermarket", "quality", "کوالٹی", "جینوئن", "آفٹر مارکیٹ"],
};

function containsAny(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

function detectLang(text: string): Lang | null {
  if (URDU_SCRIPT_RE.test(text)) return "ur";
  return null;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [step, setStep] = useState<"welcome" | "brand" | "model" | "year" | "part" | "confirm" | "details" | "done">("welcome");
  const [chatData, setChatData] = useState({ brand: "", model: "", year: "", part: "" });
  const [matches, setMatches] = useState<Product[]>([]);
  const [leadSaved, setLeadSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const utils = trpc.useUtils();
  const saveChat = trpc.settings.saveChat.useMutation();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const t = T[lang];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setMicSupported(Boolean(SpeechRecognitionCtor));
  }, []);

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: Date.now() }]);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      addMessage("assistant", T[lang].welcome);
      setStep("brand");
    }
  };

  useEffect(() => onOpenAiAssistant(handleOpen), [messages.length]);

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    setLang(next);
    if (messages.length === 0) {
      addMessage("assistant", T[next].welcome);
      setStep("brand");
    }
  };

  const persistLead = (isConverted: boolean, extra?: { name?: string; phone?: string; address?: string }) => {
    if (leadSaved) return;
    setLeadSaved(true);
    saveChat.mutate({
      sessionId: SESSION_ID,
      userName: extra?.name,
      userPhone: extra?.phone,
      userAddress: extra?.address,
      carBrand: chatData.brand || undefined,
      carModel: chatData.model || undefined,
      carYear: chatData.year || undefined,
      requestedPart: chatData.part || undefined,
      messages: JSON.stringify(messages),
      isConverted,
    });
  };

  const searchInventory = async (part: string) => {
    setIsTyping(true);
    try {
      const result = await utils.product.list.fetch({
        search: `${chatData.brand} ${chatData.model} ${part}`.trim(),
        limit: 5,
      });
      let items = result.items;

      if (items.length === 0) {
        // Broaden the search: drop the model, keep brand + part
        const broader = await utils.product.list.fetch({ search: `${chatData.brand} ${part}`.trim(), limit: 5 });
        items = broader.items;
      }

      setIsTyping(false);
      const inStock = items.filter((p) => p.stockStatus !== "out_of_stock");
      setMatches(inStock.length > 0 ? inStock : items);

      if (items.length === 0) {
        addMessage("assistant", t.notFound(part, chatData.brand, chatData.model));
        persistLead(false);
      } else if (inStock.length === 0) {
        addMessage("assistant", t.outOfStock(part, chatData.brand, chatData.model));
        persistLead(false);
      } else {
        const lines = inStock
          .map((p, i) => `${i + 1}. **${p.name}** — ${p.qualityType.toUpperCase()} — PKR ${Number(p.sellingPrice).toLocaleString()} (${p.stockStatus === "low_stock" ? t.lowStockLabel : t.inStockLabel})`)
          .join("\n");
        addMessage("assistant", t.foundResults(chatData.brand, chatData.model, chatData.year, lines));
      }
      setStep("confirm");
    } catch {
      setIsTyping(false);
      addMessage("assistant", lang === "ur" ? "معذرت، ابھی اسٹاک چیک کرنے میں مسئلہ ہو رہا ہے۔ براہِ کرم دوبارہ کوشش کریں یا ہمیں کال کریں۔" : "Sorry, I'm having trouble checking our inventory right now. Please try again in a moment or call us directly.");
      setStep("confirm");
    }
  };

  const processResponse = async (userInput: string) => {
    const lower = userInput.toLowerCase();
    const detected = detectLang(userInput);
    if (detected && detected !== lang) setLang(detected);
    const tt = detected ? T[detected] : t;

    if (step === "brand") {
      setChatData(prev => ({ ...prev, brand: userInput }));
      addMessage("assistant", tt.askModel(userInput));
      setStep("model");
    } else if (step === "model") {
      setChatData(prev => ({ ...prev, model: userInput }));
      addMessage("assistant", tt.askYear(chatData.brand, userInput));
      setStep("year");
    } else if (step === "year") {
      setChatData(prev => ({ ...prev, year: userInput }));
      addMessage("assistant", tt.askPart(chatData.brand, chatData.model, userInput));
      setStep("part");
    } else if (step === "part") {
      setChatData(prev => ({ ...prev, part: userInput }));
      addMessage("assistant", tt.checking(userInput, chatData.brand, chatData.model, chatData.year));
      await searchInventory(userInput);
    } else if (step === "confirm") {
      if (containsAny(lower, CONFIRM_KEYWORDS.order)) {
        addMessage("assistant", tt.askDetails);
        setStep("details");
      } else if (containsAny(lower, CONFIRM_KEYWORDS.details)) {
        addMessage("assistant", tt.askContactOnly);
        setStep("details");
      } else if (containsAny(lower, CONFIRM_KEYWORDS.quality)) {
        addMessage("assistant", tt.qualityGuide);
      } else {
        addMessage("assistant", tt.fallbackConfirm);
      }
    } else if (step === "details") {
      const match = matches[0];
      const phoneMatch = userInput.match(/(\+?92|0)?3\d{2}[\s-]?\d{7}/);
      persistLead(Boolean(match && match.stockStatus !== "out_of_stock"), {
        name: userInput.split("\n")[0],
        phone: phoneMatch?.[0],
        address: userInput,
      });
      addMessage("assistant", tt.thankYou(chatData.brand, chatData.model, chatData.year, chatData.part, `APS${Date.now().toString(36).toUpperCase()}`));
      setStep("done");
    } else {
      addMessage("assistant", tt.anythingElse);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setIsOpen(false);
    navigate("/cart");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage("user", input);
    processResponse(input);
    setInput("");
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const startListening = () => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setMicSupported(false);
      addMessage("assistant", t.micUnsupported);
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang === "ur" ? "ur-PK" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setInput(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        addMessage("assistant", t.micDenied);
      } else if (event.error !== "aborted") {
        addMessage("assistant", t.micError);
      }
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      addMessage("assistant", t.micError);
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

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
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t.title}</h3>
                <p className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> {t.online}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/10 rounded-lg overflow-hidden text-[10px] font-medium">
                <button
                  onClick={() => switchLang("en")}
                  className={`px-2 py-1 transition-colors ${lang === "en" ? "bg-white text-blue-700" : "text-white/80 hover:bg-white/10"}`}
                >
                  EN
                </button>
                <button
                  onClick={() => switchLang("ur")}
                  className={`px-2 py-1 transition-colors ${lang === "ur" ? "bg-white text-blue-700" : "text-white/80 hover:bg-white/10"}`}
                >
                  اردو
                </button>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
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
                <div
                  dir={URDU_SCRIPT_RE.test(msg.content) ? "rtl" : "ltr"}
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white/5 text-gray-200 border border-white/5 rounded-bl-sm"
                  }`}
                >
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
            {step === "confirm" && matches.length > 0 && matches[0].stockStatus !== "out_of_stock" && (
              <button
                onClick={() => handleAddToCart(matches[0])}
                className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs text-white font-medium transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> {t.addToCart(matches[0].name)}
              </button>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? t.micListening : t.placeholder}
              dir={lang === "ur" ? "rtl" : "ltr"}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            {micSupported && (
              <button
                type="button"
                onClick={startListening}
                title={t.placeholder}
                className={`p-2 rounded-xl transition-colors ${isListening ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-white/10 hover:bg-white/20"}`}
              >
                {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
              </button>
            )}
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>

          {/* Quick actions */}
          <div className="px-3 pb-3 flex gap-1.5 overflow-x-auto">
            <button onClick={() => { setInput(t.quickPriceInput); }} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-1">
              <Car className="w-3 h-3" /> {t.quickPrice}
            </button>
            <button onClick={() => { setInput(t.quickOrderInput); }} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-1">
              <Phone className="w-3 h-3" /> {t.quickOrder}
            </button>
            <button onClick={() => { setInput(t.quickLocationInput); }} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {t.quickLocation}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
