"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ChevronDown, 
  RotateCcw, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  ShoppingBag, 
  Headphones, 
  PhoneCall,
  ArrowRight
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  department?: "SALES" | "TECHNICAL" | "COMPLAINT";
  departmentLabel?: string;
  readyForHandover?: boolean;
  handoverReason?: string;
  handoverSummary?: string;
  whatsappUrl?: string;
  targetWhatsappNumber?: string;
  matchedProducts?: Array<{
    id: string;
    name: string;
    price: string | number;
    category: string;
  }>;
  quickReplies?: string[];
}

const DEFAULT_GREETING: ChatMessage = {
  id: "msg_welcome",
  sender: "ai",
  text: "Halo! Saya Dani, Virtual AI Consultant resmi PT. DSTech Smart Perkasa. 👋\n\nAda yang bisa saya bantu hari ini? Anda bisa menanyakan spesifikasi produk CCTV, solusi Smart Home & Barrier Gate, bantuan kendala teknis, atau permohonan survei & penawaran.",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  quickReplies: [
    "📹 Rekomendasi Paket CCTV",
    "🚪 Pasang Smart Doorlock",
    "🚧 Barrier Gate Otomatis",
    "🛠️ Kendala Teknis / Perbaikan",
    "⚠️ Komplain Pesanan Toko"
  ]
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_GREETING]);
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [hasUnread, setHasUnread] = useState(true);
  const [showTeaser, setShowTeaser] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setShowTeaser(false);
    }
  }, [messages, isOpen]);

  // Teaser bubble timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowTeaser(true);
    }, 4500);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Muat riwayat chat dari localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dstech_ai_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
      const savedName = localStorage.getItem("dstech_ai_client_name");
      const savedPhone = localStorage.getItem("dstech_ai_client_phone");
      if (savedName) setVisitorName(savedName);
      if (savedPhone) setVisitorPhone(savedPhone);
    } catch (e) {}
  }, []);

  // Simpan riwayat chat ke localStorage
  const saveChatHistory = (newMsgs: ChatMessage[]) => {
    try {
      localStorage.setItem("dstech_ai_chat_history", JSON.stringify(newMsgs.slice(-20)));
    } catch (e) {}
  };

  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || inputMessage).trim();
    if (!msg || loading) return;

    setInputMessage("");

    const userMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      sender: "user",
      text: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: updatedMessages.map(m => ({ sender: m.sender, text: m.text })),
          visitorInfo: {
            name: visitorName || undefined,
            phone: visitorPhone || undefined
          }
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;

        if (d.client_name && !visitorName) {
          setVisitorName(d.client_name);
          localStorage.setItem("dstech_ai_client_name", d.client_name);
        }
        if (d.client_phone && !visitorPhone) {
          setVisitorPhone(d.client_phone);
          localStorage.setItem("dstech_ai_client_phone", d.client_phone);
        }

        const aiMsg: ChatMessage = {
          id: "ai_" + Date.now(),
          sender: "ai",
          text: d.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          department: d.department,
          departmentLabel: d.department_label,
          readyForHandover: d.ready_for_handover,
          handoverReason: d.handover_reason,
          handoverSummary: d.handover_summary,
          whatsappUrl: d.whatsapp_url,
          targetWhatsappNumber: d.target_whatsapp_number,
          matchedProducts: d.matched_products,
          quickReplies: d.quick_replies
        };

        const finalMsgs = [...updatedMessages, aiMsg];
        setMessages(finalMsgs);
        saveChatHistory(finalMsgs);
      } else {
        throw new Error(json.error || "Gagal mendapatkan balasan dari AI");
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "ai_err_" + Date.now(),
        sender: "ai",
        text: "Mohon maaf, sistem AI kami sedang dalam pemeliharaan singkat. Anda dapat langsung berkonsultasi via WhatsApp tim kami melalui tombol di bawah.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        readyForHandover: true,
        departmentLabel: "Customer Care & Sales PT. DSTech Smart Perkasa",
        whatsappUrl: `https://wa.me/6282259494242?text=${encodeURIComponent("Halo PT. DSTech Smart Perkasa, saya ingin konsultasi mengenai: " + msg)}`
      };
      const finalMsgs = [...updatedMessages, errorMsg];
      setMessages(finalMsgs);
      saveChatHistory(finalMsgs);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    if (confirm("Reset seluruh percakapan dengan AI Dani?")) {
      setMessages([DEFAULT_GREETING]);
      localStorage.removeItem("dstech_ai_chat_history");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden font-sans">
      {/* Floating Teaser Pop-up Bubble (sebelum chat dibuka) */}
      {!isOpen && showTeaser && (
        <div className="absolute bottom-20 right-0 w-72 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button 
            onClick={() => setShowTeaser(false)} 
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-black text-slate-900">Dani (AI DSTech)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Butuh rekomendasi CCTV, Smart Home, atau penawaran resmi? Tanyakan langsung pada saya di sini!
              </p>
              <button
                onClick={() => {
                  setIsOpen(true);
                  setShowTeaser(false);
                }}
                className="mt-2.5 text-[11px] font-black text-dstech-blue hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Mulai Chat Sekarang</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-dstech-blue via-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white/20"
          aria-label="Buka Live Chat AI DSTech"
        >
          {/* Pulsing ring animation */}
          <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping opacity-75"></span>
          
          <div className="relative flex items-center justify-center">
            <Bot className="w-7 h-7 transition-transform group-hover:scale-110" />
            <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1.5 -right-1.5 animate-bounce" />
          </div>

          {/* Badge Unread Notification */}
          {hasUnread && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </button>
      )}

      {/* Main Chat Modal Box */}
      {isOpen && (
        <div className="relative w-[92vw] sm:w-[410px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header Widget */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white tracking-wide">Dani — AI Consultant</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Gemini 2.5
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Online 24/7 • PT. DSTech Smart Perkasa</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset Percakapan"
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup Chat"
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader Context Info */}
          <div className="bg-blue-50/70 border-b border-blue-100/60 px-4 py-2 flex items-center justify-between text-[11px] text-blue-900 shrink-0">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>AI First: Kebutuhan Anda dianalisis sebelum diarahkan ke tim ahli</span>
            </span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m) => {
              const isAi = m.sender === "ai";
              return (
                <div key={m.id} className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}>
                  <div className={`flex items-start gap-2 max-w-[88%] ${isAi ? "flex-row" : "flex-row-reverse"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      isAi ? "bg-blue-600 text-white shadow-sm" : "bg-slate-800 text-white"
                    }`}>
                      {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div className="space-y-2">
                      <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                        isAi 
                          ? "bg-white text-slate-800 border border-slate-100 rounded-tl-xs" 
                          : "bg-dstech-blue text-white rounded-tr-xs font-medium"
                      }`}>
                        {m.text}
                      </div>

                      {/* Rekomendasi Produk Terkait jika ada */}
                      {isAi && m.matchedProducts && m.matchedProducts.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Produk Rekomendasi Terkait:
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {m.matchedProducts.map((p, idx) => (
                              <div key={idx} className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-xs flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                                  <p className="text-[11px] font-mono font-bold text-dstech-blue">{p.price}</p>
                                </div>
                                <a
                                  href={`/shop?search=${encodeURIComponent(p.name)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-dstech-blue hover:bg-blue-100 text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all"
                                >
                                  <span>Lihat</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* KARTU SMART HANDOVER KE TIM WHATSAPP */}
                      {isAi && m.readyForHandover && m.whatsappUrl && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-white to-slate-50 border-2 border-emerald-500/40 shadow-md space-y-2.5 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Kebutuhan Siap Diteruskan</span>
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              m.department === "TECHNICAL" 
                                ? "bg-amber-100 text-amber-800" 
                                : m.department === "COMPLAINT" 
                                ? "bg-rose-100 text-rose-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {m.department === "TECHNICAL" ? "🔧 Teknisi" : m.department === "COMPLAINT" ? "⚠️ Komplain" : "💼 Sales SPH"}
                            </span>
                          </div>

                          <div className="text-xs text-slate-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 font-medium">
                            <p className="text-[11px] font-bold text-emerald-900 mb-1">
                              Tim Dituju: {m.departmentLabel || "Customer Care"}
                            </p>
                            <p className="text-[11px] text-slate-600 italic">
                              "{m.handoverSummary?.slice(0, 120)}..."
                            </p>
                          </div>

                          <a
                            href={m.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
                          >
                            <PhoneCall className="w-4 h-4" />
                            <span>Lanjutkan ke WhatsApp {m.department === "TECHNICAL" ? "Tim Teknisi" : m.department === "COMPLAINT" ? "Tim Komplain" : "Tim Sales"}</span>
                          </a>
                        </div>
                      )}

                      {/* Quick Reply Chips */}
                      {isAi && m.quickReplies && m.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {m.quickReplies.map((qr, qidx) => (
                            <button
                              key={qidx}
                              type="button"
                              onClick={() => handleSendMessage(qr)}
                              className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-dstech-blue text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                            >
                              {qr}
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="block text-[10px] text-slate-400 mt-1">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-100 rounded-tl-xs shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs text-slate-500 ml-1 font-medium">Dani sedang menganalisis kebutuhan Anda...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Department Shortcuts Bar */}
          <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Pilihan Cepat:</span>
            <button
              type="button"
              onClick={() => handleSendMessage("Saya mau minta penawaran paket CCTV untuk pengadaan baru")}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:text-dstech-blue text-slate-700 font-bold shrink-0 transition-all cursor-pointer"
            >
              💼 Sales / SPH
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("Saya ada kendala teknis pada perangkat yang sudah terpasang, tolong teknisi bantu")}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-bold shrink-0 transition-all cursor-pointer"
            >
              🔧 Maintenance Teknis
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("Saya mau mengajukan komplain pesanan e-store saya yang bermasalah")}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold shrink-0 transition-all cursor-pointer"
            >
              ⚠️ Komplain Pesanan
            </button>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pertanyaan atau kebutuhan Anda di sini..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue text-slate-900 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-2xl bg-dstech-blue hover:bg-blue-700 active:scale-95 text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              aria-label="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
