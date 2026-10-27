"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  Tv,
  Play,
  Square,
  Sparkles,
  ShoppingBag,
  Eye,
  Heart,
  Share2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Pin,
  Settings,
  Flame,
  MessageSquare,
  Globe,
  Layers,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number | string;
  category?: string;
  brand?: string;
  image?: string;
  stock?: number;
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
  updatedAt: string;
  showInStore: boolean;
  currentProduct?: Product;
  featuredProducts?: Product[];
  allProducts?: Product[];
}

export default function AdminLiveStreamPage() {
  const [data, setData] = useState<LiveStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingSmartpro, setSyncingSmartpro] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"studio" | "products" | "settings">("studio");
  const [searchProduct, setSearchProduct] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [streamType, setStreamType] = useState<"smartpro_ai" | "youtube" | "custom_embed">("smartpro_ai");
  const [smartProUrl, setSmartProUrl] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [bannerNotice, setBannerNotice] = useState("");
  const [showInStore, setShowInStore] = useState(true);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      const res = await fetch("/api/livestream");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setTitle(json.data.title || "");
        setDescription(json.data.description || "");
        setStreamType(json.data.streamType || "smartpro_ai");
        setSmartProUrl(json.data.smartProUrl || "https://smartpro.dstechsmart.com/virtual-host.html");
        setYoutubeId(json.data.youtubeId || "");
        setBannerNotice(json.data.bannerNotice || "");
        setShowInStore(json.data.showInStore ?? true);
      }
    } catch (e) {
      console.error(e);
      showToast("Gagal memuat status live stream", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Polling status setiap 10 detik
    return () => clearInterval(interval);
  }, []);

  const handleToggleLive = async () => {
    if (!data) return;
    try {
      setSaving(true);
      const res = await fetch("/api/livestream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_live", isLive: !data.isLive }),
      });
      const json = await res.json();
      if (json.success) {
        setData({ ...data, isLive: json.isLive });
        showToast(json.isLive ? "🔴 Siaran Live Berhasil Dimulai!" : "⏹️ Siaran Live Diakhiri.");
      } else {
        showToast(json.error || "Gagal mengubah status siaran", "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPinnedProduct = async (productId: string) => {
    try {
      const res = await fetch("/api/livestream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_product", productId }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("📌 Produk berhasil di-pin untuk live stream!");
        loadData();
      }
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleSyncSmartPro = async () => {
    try {
      setSyncingSmartpro(true);
      const res = await fetch("/api/livestream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_smartpro" }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("⚡ Katalog berhasil disinkronkan ke AI Virtual Host SmartPro!");
      } else {
        showToast(json.error || "Gagal sinkronisasi ke SmartPro", "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setSyncingSmartpro(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/livestream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          streamType,
          smartProUrl,
          youtubeId,
          bannerNotice,
          showInStore,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Pengaturan Live Streaming berhasil disimpan!");
        loadData();
      } else {
        showToast(json.error || "Gagal menyimpan", "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Memuat Studio Live Streaming...</p>
        </div>
      </div>
    );
  }

  const isLive = data?.isLive ?? false;
  const filteredProducts = (data?.allProducts || []).filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchProduct.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-medium border animate-in slide-in-from-top duration-300 ${
            toast.type === "success"
              ? "bg-emerald-600/95 border-emerald-400"
              : "bg-rose-600/95 border-rose-400"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header Studio */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
              isLive
                ? "bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-rose-500/30 animate-pulse"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Live Streaming Studio</h1>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  ON-AIR LIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  OFFLINE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sinkronisasi siaran langsung terpadu dengan Virtual AI Host SmartPro WA Gateway ke E-Store DSTech Smart.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={handleSyncSmartPro}
            disabled={syncingSmartpro}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs flex items-center gap-2 transition-all"
            title="Sinkronkan katalog website ke SmartPro"
          >
            <RefreshCw className={`w-4 h-4 ${syncingSmartpro ? "animate-spin" : ""}`} />
            Sync Katalog SmartPro
          </button>

          <Link
            href="/shop"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Buka E-Store (/shop)
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            onClick={handleToggleLive}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-xl transition-all active:scale-95 ${
              isLive
                ? "bg-slate-800 hover:bg-rose-950 text-rose-400 border border-rose-800 hover:border-rose-600"
                : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-600/30"
            }`}
          >
            {isLive ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                Akhiri Siaran
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Mulai Live Streaming
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Siaran</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-3 h-3 rounded-full ${isLive ? "bg-emerald-500 animate-ping" : "bg-slate-600"}`}></span>
            <span className="text-lg font-black text-white">{isLive ? "Aktif di E-Store" : "Siaran Nonaktif"}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Penonton Live</p>
          <div className="flex items-center gap-2 mt-1">
            <Eye className="w-5 h-5 text-indigo-400" />
            <span className="text-xl font-black text-white">{data?.viewerCount || 0}</span>
            <span className="text-xs text-slate-400">Pemirsa</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Apresiasi Penonton</p>
          <div className="flex items-center gap-2 mt-1">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-500/30" />
            <span className="text-xl font-black text-white">{data?.likesCount || 0}</span>
            <span className="text-xs text-slate-400">Suka</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Produk Ter-Pin</p>
          <div className="flex items-center gap-2 mt-1">
            <Flame className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-200 truncate">
              {data?.currentProduct?.name || "Belum dipilih"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("studio")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === "studio"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Tv className="w-4 h-4" />
          Monitor Studio Live
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === "products"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Etalase Produk Live ({data?.allProducts?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === "settings"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Settings className="w-4 h-4" />
          Konfigurasi Server & SmartPro
        </button>
      </div>

      {/* TAB 1: STUDIO MONITOR */}
      {activeTab === "studio" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player Screen Monitor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-black border border-slate-800 rounded-3xl overflow-hidden aspect-video relative flex flex-col items-center justify-center group shadow-2xl">
              {streamType === "smartpro_ai" ? (
                <iframe
                  src={smartProUrl || "https://smartpro.dstechsmart.com/virtual-host.html"}
                  className="w-full h-full border-0"
                  allow="camera; microphone; autoplay; display-capture"
                  title="SmartPro Virtual Host"
                />
              ) : streamType === "youtube" && youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube Live"
                />
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <Tv className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="font-bold text-sm">Pratinjau Live Tidak Tersedia</p>
                  <p className="text-xs mt-1">Periksa konfigurasi URL pada tab Konfigurasi.</p>
                </div>
              )}

              {/* Watermark / Badge Overlay */}
              <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-black text-rose-400 border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  STUDIO PREVIEW
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-slate-300 border border-white/10">
                  {streamType === "smartpro_ai" ? "🤖 AI Virtual Host" : "📺 YouTube Stream"}
                </span>
              </div>

              {/* Quick Monitor Toolbar */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <a
                  href={smartProUrl || "https://smartpro.dstechsmart.com/virtual-host.html"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs text-white font-bold backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-lg transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Full Studio SmartPro
                </a>
              </div>
            </div>

            {/* Current Broadcast Info */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{data?.title || "Judul Live"}</h3>
                <span className="text-xs text-slate-400">
                  Mulai: {data?.startedAt ? new Date(data.startedAt).toLocaleTimeString("id-ID") : "-"}
                </span>
              </div>
              <p className="text-xs text-slate-400">{data?.description}</p>
              {data?.bannerNotice && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4 shrink-0 text-amber-400" />
                  {data.bannerNotice}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Pinned Product & Quick Switch */}
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                  <Pin className="w-4 h-4 text-rose-400" />
                  Produk Ter-Pin Saat Ini
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  Tampil di Layar Penonton
                </span>
              </div>

              {data?.currentProduct ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="w-full h-44 bg-slate-900/90 rounded-xl overflow-hidden relative flex items-center justify-center p-2 border border-slate-800">
                    <img
                      src={data.currentProduct.image || "/service-cctv.png"}
                      alt={data.currentProduct.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/service-cctv.png";
                      }}
                      className="max-h-full max-w-full object-contain mx-auto"
                    />
                    <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                      PINNED
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {data.currentProduct.brand || "DSTech Smart"} • {data.currentProduct.category}
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-2">{data.currentProduct.name}</h4>
                    <p className="text-base font-black text-emerald-400 mt-1">
                      {typeof data.currentProduct.price === "number"
                        ? `Rp ${data.currentProduct.price.toLocaleString("id-ID")}`
                        : data.currentProduct.price}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed border-slate-800 rounded-2xl text-slate-500">
                  <p className="text-xs">Belum ada produk yang di-pin.</p>
                  <p className="text-[11px] mt-1">Pilih produk di bawah untuk mempromosikannya.</p>
                </div>
              )}

              {/* Quick Switch Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-2 block">Ganti Produk Cepat:</label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(data?.allProducts || []).slice(0, 8).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSetPinnedProduct(p.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        data?.currentProductId === p.id
                          ? "bg-rose-600/20 border-rose-500/50 text-rose-200"
                          : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        <p className="text-[10px] text-emerald-400 font-semibold">
                          {typeof p.price === "number" ? `Rp ${p.price.toLocaleString("id-ID")}` : p.price}
                        </p>
                      </div>
                      {data?.currentProductId === p.id ? (
                        <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded">AKTIF</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 hover:text-white">Pin ➔</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ETALASE PRODUK LIVE */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="w-full sm:w-80">
              <input
                type="text"
                placeholder="Cari produk katalog..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="text-xs text-slate-400">
              Klik <strong>"Pin ke Siaran"</strong> pada produk mana pun untuk langsung menampilkannya di live E-Store.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const isPinned = data?.currentProductId === p.id;
              return (
                <div
                  key={p.id}
                  className={`bg-slate-900/70 border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                    isPinned
                      ? "border-rose-500 ring-2 ring-rose-500/20 shadow-lg shadow-rose-500/10"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="w-full h-36 bg-slate-950 rounded-xl overflow-hidden relative">
                      <img
                        src={p.image || "/kop_surat_dstech.jpg"}
                        alt={p.name}
                        className="w-full h-full object-contain p-2"
                      />
                      {isPinned && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white">
                          PINNED DI LIVE
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {p.brand || "DSTech Smart"} • {p.category}
                      </span>
                      <h4 className="text-xs font-bold text-white line-clamp-2 mt-0.5">{p.name}</h4>
                      <p className="text-sm font-black text-emerald-400 mt-1">
                        {typeof p.price === "number" ? `Rp ${p.price.toLocaleString("id-ID")}` : p.price}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleSetPinnedProduct(p.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isPinned
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-default"
                          : "bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white"
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                      {isPinned ? "Sedang Ditampilkan" : "Pin ke Siaran"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS & SMARTPRO CONFIG */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-rose-400" />
              Pengaturan Siaran Live & Integrasi SmartPro
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Atur detail siaran yang akan ditampilkan kepada pengunjung E-Store DSTech Smart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Judul Siaran Live</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Deskripsi / Penjelasan Singkat</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Teks Banner Promo Live di E-Store</label>
                <input
                  type="text"
                  value={bannerNotice}
                  onChange={(e) => setBannerNotice(e.target.value)}
                  placeholder="Contoh: 🔥 PROMO LIVE: Diskon 15% & Gratis Konsultasi Khusus Hari Ini!"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Sumber Siaran / Tipe Player</label>
                <select
                  value={streamType}
                  onChange={(e) => setStreamType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="smartpro_ai">🤖 SmartPro AI Virtual Host (Rekomendasi)</option>
                  <option value="youtube">📺 YouTube Live Stream</option>
                  <option value="custom_embed">🌐 Custom URL Embed</option>
                </select>
              </div>

              {streamType === "smartpro_ai" && (
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">URL SmartPro Virtual Host</label>
                  <input
                    type="url"
                    value={smartProUrl}
                    onChange={(e) => setSmartProUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    placeholder="https://smartpro.dstechsmart.com/virtual-host.html"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pastikan server SmartPro WA Gateway aktif melayani modul Virtual Host AI.
                  </p>
                </div>
              )}

              {streamType === "youtube" && (
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">YouTube Video / Live ID</label>
                  <input
                    type="text"
                    value={youtubeId}
                    onChange={(e) => setYoutubeId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    placeholder="Contoh: dQw4w9WgXcQ"
                  />
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInStore}
                    onChange={(e) => setShowInStore(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded bg-slate-950 border-slate-800 focus:ring-rose-500"
                  />
                  <span className="text-xs font-semibold text-slate-300">
                    Tampilkan Banner Live di Halaman E-Store (/shop)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
