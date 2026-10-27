"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Radio,
  Tv,
  Eye,
  Heart,
  Share2,
  ShoppingBag,
  ArrowLeft,
  Flame,
  Sparkles,
  Send,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number | string;
  category?: string;
  brand?: string;
  image?: string;
  stock?: number;
  desc?: string;
}

interface LiveStreamData {
  isLive: boolean;
  title: string;
  description: string;
  streamType: "smartpro_ai" | "youtube" | "custom_embed";
  smartProUrl: string;
  youtubeId: string;
  currentProductId: string;
  featuredProductIds: string[];
  bannerNotice: string;
  viewerCount: number;
  likesCount: number;
  startedAt: string;
  currentProduct?: Product;
  featuredProducts?: Product[];
  allProducts?: Product[];
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isHost?: boolean;
}

const SAMPLE_CHATS: ChatMessage[] = [
  { id: "1", user: "Rizky Pratama", text: "Kameranya sudah support audio 2 arah gak kak?", time: "08:10" },
  { id: "2", user: "Dani (AI Host)", text: "Halo Kak Rizky! Betul sekali, sudah built-in mic & speaker berkualitas jernih ya kak.", time: "08:11", isHost: true },
  { id: "3", user: "Siti Rahma", text: "Bisa kirim ke Serang & Cilegon hari ini?", time: "08:12" },
  { id: "4", user: "Dani (AI Host)", text: "Bisa banget kak Siti, wilayah Cilegon & Serang ada pengiriman armada ekspres langsung dari kantor kami!", time: "08:13", isHost: true },
  { id: "5", user: "Budi Santoso", text: "Garansinya berapa lama untuk paket CCTV ini?", time: "08:14" },
  { id: "6", user: "Dani (AI Host)", text: "Garansi resmi DSTech Smart 1-2 Tahun ganti baru ya Kak Budi, teknisi kami siap bantu!", time: "08:15", isHost: true },
];

export default function LiveStreamingPublicPage() {
  const [data, setData] = useState<LiveStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(2450);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>(SAMPLE_CHATS);
  const [inputChat, setInputChat] = useState("");
  const [activeCatalogOpen, setActiveCatalogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/livestream?t=" + Date.now());
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setLikes(json.data.likesCount || 2450);
        if (!selectedProduct && json.data.currentProduct) {
          setSelectedProduct(json.data.currentProduct);
        }
      }
    } catch (e) {
      console.error("Gagal load live data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000); // Polling update siaran
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.success && d.data) setSiteSettings(d.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const handleSendLike = async () => {
    setLikes((prev) => prev + 1);
    const newHeart = { id: Date.now() + Math.random(), left: Math.floor(Math.random() * 60) + 20 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);

    try {
      await fetch("/api/livestream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      });
    } catch {}
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: "Anda",
      text: inputChat.trim(),
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setChats((prev) => [...prev, newMsg]);
    setInputChat("");

    // AI Host auto-response simulation after 2 seconds
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user: "Dani (AI Host)",
        text: `Terima kasih atas pertanyaannya! Untuk info detail & pemesanan produk promo ini, silakan klik tombol 'Pesan via WhatsApp' ya kak!`,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isHost: true,
      };
      setChats((prev) => [...prev, autoReply]);
    }, 2500);
  };

  const getWhatsAppOrderUrl = (product: Product) => {
    const phone = siteSettings?.whatsappNumber || "6282259494242";
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    const priceFormatted =
      typeof product.price === "number" ? `Rp ${product.price.toLocaleString("id-ID")}` : product.price;

    const text = `Halo Tim CS DSTech Smart, saya sedang menonton Siaran Live Streaming E-Store dan ingin memesan produk promo berikut:
- *Nama Produk*: ${product.name}
- *Harga Promo Live*: ${priceFormatted}
- *ID Produk*: ${product.id}

Mohon informasi ketersediaan stok & jadwal instalasi teknisi. Terima kasih!`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  };

  const currentDisplayProduct = selectedProduct || data?.currentProduct || data?.allProducts?.[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke E-Store</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-rose-400">
              {data?.isLive ? "LIVE STREAMING" : "SIARAN SELESAI"}
            </span>
            <div className="h-4 w-px bg-slate-800 mx-1"></div>
            <div className="flex items-center gap-1 text-slate-300 text-xs font-bold">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>{data?.viewerCount || 184}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: data?.title || "Live Streaming DSTech Smart",
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Tautan live streaming berhasil disalin!");
              }
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-xs font-bold flex items-center gap-1.5"
            title="Bagikan Siaran"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Bagikan</span>
          </button>

          <Link
            href="/shop"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Buka Katalog Lengkap
          </Link>
        </div>
      </header>

      {/* Main Streaming Theater Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Video Player + Host Info (8 Cols on LG) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-black border border-slate-800/80 rounded-3xl overflow-hidden aspect-video sm:aspect-[16/10] relative shadow-2xl flex flex-col justify-center items-center group">
            {data?.streamType === "smartpro_ai" ? (
              <iframe
                src={data?.smartProUrl || "https://smartpro.dstechsmart.com/virtual-host.html"}
                className="w-full h-full border-0"
                allow="camera; microphone; autoplay; display-capture"
                title="SmartPro Virtual Host"
              />
            ) : data?.streamType === "youtube" && data?.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${data.youtubeId}?autoplay=1&mute=0`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube Live"
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <Tv className="w-16 h-16 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-300">Siaran Sedang Beristirahat</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Host akan segera kembali. Jelajahi produk promo spesial di etalase sebelah kanan!
                </p>
              </div>
            )}

            {/* Overlays on Player */}
            <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-black text-rose-400 border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                DSTECH LIVE
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-indigo-300 border border-white/10 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                AI SmartPro Host
              </span>
            </div>

            {/* Floating Like Particles */}
            <div className="absolute right-6 bottom-16 w-24 h-48 pointer-events-none overflow-hidden">
              {floatingHearts.map((h) => (
                <div
                  key={h.id}
                  style={{ left: `${h.left}%` }}
                  className="absolute bottom-0 text-rose-500 animate-bounce duration-1000 text-2xl transition-all"
                >
                  ❤️
                </div>
              ))}
            </div>

            {/* Floating Heart Button */}
            <button
              onClick={handleSendLike}
              className="absolute right-4 bottom-4 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-rose-600 text-rose-400 hover:text-white border border-white/10 backdrop-blur-md shadow-2xl transition-all active:scale-90 flex items-center gap-2 font-black text-xs group"
              title="Kirim Suka / Like"
            >
              <Heart className="w-5 h-5 fill-current text-rose-500 group-hover:text-white group-hover:scale-125 transition-transform" />
              <span>{likes}</span>
            </button>
          </div>

          {/* Title & Promotion Banner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white">{data?.title}</h1>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{data?.description}</p>
              </div>
              <button
                onClick={() => setActiveCatalogOpen(true)}
                className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Keranjang Kuning ({data?.allProducts?.length || 0})
              </button>
            </div>

            {data?.bannerNotice && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{data.bannerNotice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right / Bottom: Pinned Product Card & Live Chat (4 Cols on LG) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* PINNED PRODUCT CARD */}
          {currentDisplayProduct && (
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/40 rounded-3xl p-4 shadow-xl relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-black tracking-wider uppercase bg-rose-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  SEDANG DIPROMOSIKAN
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {currentDisplayProduct.brand || "DSTech Smart"}
                </span>
              </div>

              <div className="flex gap-3">
                <div className="w-24 h-24 bg-slate-900/90 rounded-2xl overflow-hidden shrink-0 relative border border-slate-800 flex items-center justify-center p-1.5">
                  <img
                    src={currentDisplayProduct.image || "/service-cctv.png"}
                    alt={currentDisplayProduct.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/service-cctv.png";
                    }}
                    className="max-h-full max-w-full object-contain mx-auto"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-white line-clamp-2">{currentDisplayProduct.name}</h3>
                  <div className="mt-1">
                    <span className="text-sm font-black text-emerald-400">
                      {typeof currentDisplayProduct.price === "number"
                        ? `Rp ${currentDisplayProduct.price.toLocaleString("id-ID")}`
                        : currentDisplayProduct.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3 h-3" /> Garansi Resmi
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-sky-400" /> Siap Pasang
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={getWhatsAppOrderUrl(currentDisplayProduct)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  Pesan via WA
                </a>

                <Link
                  href="/shop"
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all text-center"
                >
                  <ShoppingBag className="w-4 h-4 text-rose-400" />
                  Lihat di E-Store
                </Link>
              </div>
            </div>
          )}

          {/* LIVE CHAT STREAM */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 flex flex-col h-80 flex-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                Live Chat Penonton
              </span>
              <span className="text-[10px] text-slate-500">Otomatis Terhubung ke Dani AI</span>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {chats.map((c) => (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-2xl ${
                    c.isHost
                      ? "bg-indigo-950/60 border border-indigo-500/30 text-indigo-100"
                      : "bg-slate-950/70 border border-slate-800/80 text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-bold text-[11px] ${
                        c.isHost ? "text-indigo-400 flex items-center gap-1" : "text-amber-400"
                      }`}
                    >
                      {c.isHost && <Sparkles className="w-3 h-3" />}
                      {c.user}
                    </span>
                    <span className="text-[9px] text-slate-500">{c.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{c.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Tanyakan produk ke host..."
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* DRAWER / MODAL KERANJANG KUNING ETALASE LIVE */}
      {activeCatalogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Etalase Produk Live ({data?.allProducts?.length || 0})</h3>
              </div>
              <button
                onClick={() => setActiveCatalogOpen(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {(data?.allProducts || []).map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setActiveCatalogOpen(false);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center ${
                    selectedProduct?.id === p.id
                      ? "bg-rose-600/20 border-rose-500/60"
                      : "bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="w-16 h-16 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                    <img src={p.image || "/kop_surat_dstech.jpg"} alt={p.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-rose-400">NO. {idx + 1}</span>
                      <span className="text-[10px] text-slate-500">{p.brand || "DSTech"}</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">
                      {typeof p.price === "number" ? `Rp ${p.price.toLocaleString("id-ID")}` : p.price}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
