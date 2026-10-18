"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowRight,
  Zap,
  Target,
  Layers,
  Globe,
  Shield,
  Cpu,
  Monitor,
  PhoneCall,
  Layout,
  Briefcase,
  Lock,
  Wifi,
  Users,
  Eye,
  CheckCircle2,
  X,
  Phone,
  ShieldCheck,
  Star,
  Sparkles,
} from "lucide-react";

interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
  commission?: string;
  image?: string;
  desc?: string;
}

const DEFAULT_SOLUTIONS = [
  {
    id: "cctv",
    name: "CCTV & Security System",
    type: "ONETIME",
    tag: "Keamanan",
    icon: <Shield className="w-6 h-6" />,
    desc: "Pengadaan & Instalasi CCTV Resolusi Tinggi (Analogue/IP) untuk Corporate & Industrial.",
    color: "text-dstech-red",
    bg: "bg-dstech-red/10",
  },
  {
    id: "smarthome",
    name: "Rumah Pintar (Smart Home)",
    type: "ONETIME",
    tag: "Hunian Cerdas",
    icon: <Cpu className="w-6 h-6" />,
    desc: "Integrasi Lampu, Saklar, & Audio cerdas yang dikontrol via Smartphone (Google Nest compatible).",
    color: "text-dstech-blue",
    bg: "bg-dstech-blue/10",
  },
  {
    id: "doorlock",
    name: "Kunci Digital & Access Control",
    type: "ONETIME",
    tag: "Security",
    icon: <Lock className="w-6 h-6" />,
    desc: "Smart Doorlock dengan Fingerprint, RFID, & Bluetooth untuk efisiensi akses gedung.",
    color: "text-dstech-red",
    bg: "bg-dstech-red/10",
  },
  {
    id: "networking",
    name: "Jaringan & Fiber Optik",
    type: "ONETIME",
    tag: "IT Infra",
    icon: <Wifi className="w-6 h-6" />,
    desc: "Instalasi Network Kabel & Wireless, Splicing Fiber Optik, serta pengadaan Bandwidth.",
    color: "text-dstech-blue",
    bg: "bg-dstech-blue/10",
  },
  {
    id: "pabx",
    name: "Sistem Telepon PABX",
    type: "ONETIME",
    tag: "Komunikasi",
    icon: <PhoneCall className="w-6 h-6" />,
    desc: "Solusi komunikasi internal kantor (PBX) untuk integrasi sambungan telepon kabel.",
    color: "text-dstech-red",
    bg: "bg-dstech-red/10",
  },
  {
    id: "attendance",
    name: "Mesin Absensi (Fingerprint)",
    type: "ONETIME",
    tag: "Keamanan",
    icon: <Zap className="w-6 h-6" />,
    desc: "Sistem absensi sidik jari & wajah untuk manajemen tenaga kerja yang akurat.",
    color: "text-dstech-blue",
    bg: "bg-dstech-blue/10",
  },
  {
    id: "visual",
    name: "Videotron & Running Text",
    type: "ONETIME",
    tag: "Visual Ads",
    icon: <Monitor className="w-6 h-6" />,
    desc: "Pengadaan Videotron (Indoor/Outdoor), Video Wall, dan LED Running Text.",
    color: "text-dstech-red",
    bg: "bg-dstech-red/10",
  },
  {
    id: "parking",
    name: "Sistem Perparkiran (Barrier Gate)",
    type: "ONETIME",
    tag: "Parking",
    icon: <Target className="w-6 h-6" />,
    desc: "Palang otomatis dengan sistem parkir mandiri & integrasi kartu akses.",
    color: "text-dstech-blue",
    bg: "bg-dstech-blue/10",
  },
  {
    id: "website",
    name: "Website & Digital Suite",
    type: "RECURRING",
    tag: "Software",
    icon: <Globe className="w-6 h-6" />,
    desc: "Pembuatan Website Bisnis, Hosting, Domain, & Email Bisnis Terkelola.",
    color: "text-dstech-red",
    bg: "bg-dstech-red/10",
  },
  {
    id: "pos",
    name: "Software POS (Program Kasir)",
    type: "RECURRING",
    tag: "Software",
    icon: <Layout className="w-6 h-6" />,
    desc: "Aplikasi kasir terintegrasi stok & laporan keuangan untuk UKM maupun Retail.",
    color: "text-dstech-blue",
    bg: "bg-dstech-blue/10",
  },
  {
    id: "property",
    name: "Agent Penjualan Properti",
    type: "SERVICE",
    tag: "Real Estate",
    icon: <Briefcase className="w-6 h-6" />,
    desc: "Kerjasama pemasaran properti perumahan dengan konsep Smarthome System.",
    color: "text-dstech-red",
    bg: "bg-dstech-red/10",
  },
  {
    id: "manpower",
    name: "Penyediaan Tenaga Kerja",
    type: "SERVICE",
    tag: "HR Solution",
    icon: <Users className="w-6 h-6" />,
    desc: "Suplai tenaga kerja (Manpower Supply) profesional untuk kebutuhan operasional.",
    color: "text-dstech-blue",
    bg: "bg-dstech-blue/10",
  },
];

export default function ProductSection() {
  const [activeTab, setActiveTab] = useState<"inventory" | "solutions">("inventory");
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);

  // Fetch dynamic products from /api/products
  useEffect(() => {
    fetch("/api/products?t=" + Date.now())
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      })
      .catch((err) => console.error("Gagal memuat produk beranda:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatRupiah = (val: number) => {
    return "Rp " + val.toLocaleString("id-ID");
  };

  return (
    <section id="produk" className="py-16 sm:py-24 md:py-32 bg-slate-50 w-full border-y border-slate-200 relative overflow-hidden">
      {/* Decorative Ambient Accents */}
      <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-dstech-red/5 blur-[100px] rounded-full pointer-events-none -mr-48"></div>
      <div className="absolute bottom-0 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-dstech-blue/5 blur-[100px] rounded-full pointer-events-none -ml-48"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative z-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6 sm:gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <span className="inline-block px-3.5 py-1 rounded-full bg-dstech-red/10 text-dstech-red font-bold tracking-widest uppercase text-[11px] mb-3">
              OFFICIAL HARDWARE & DIGITAL SOLUTIONS
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-900 uppercase">
              Katalog Produk <br className="hidden sm:inline" />
              <span className="text-dstech-blue">& Layanan Unggulan</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed">
              Produk hardware keamanan resmi bergaransi dan paket integrasi IT terpadu langsung dari inventaris PT. DSTech Smart Perkasa.
            </p>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-end">
            <Link
              href="/shop"
              className="h-12 sm:h-14 px-6 sm:px-8 flex items-center gap-2.5 bg-dstech-red text-white rounded-2xl font-bold text-sm sm:text-base hover:bg-red-700 transition-all shadow-md shadow-red-500/20 active:scale-95"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Buka E-Store Lengkap</span>
            </Link>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm max-w-fit mx-auto md:mx-0 mb-10">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "inventory"
                ? "bg-dstech-blue text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Produk Inventori ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("solutions")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "solutions"
                ? "bg-dstech-blue text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Solusi & Layanan Korporat (12)</span>
          </button>
        </div>

        {/* Tab Content 1: Dynamic Inventory Products */}
        {activeTab === "inventory" && (
          <div className="animate-in fade-in duration-300">
            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-bold text-sm">Sedang memuat data produk inventori resmi...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="group bg-white border border-slate-200/90 hover:border-dstech-blue/50 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl shadow-sm cursor-pointer relative"
                  >
                    {/* Thumbnail Image */}
                    <div className="h-60 relative overflow-hidden bg-slate-100 flex items-center justify-center">
                      <Image
                        src={prod.image || "/service-cctv.png"}
                        alt={prod.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-dstech-blue shadow-sm">
                          {prod.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-sm">
                          Resmi
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-7 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>5.0</span>
                        </div>
                        {prod.stock !== undefined && (
                          <span className="text-[11px] font-bold text-slate-400">
                            Stok: <strong className="text-slate-700">{prod.stock} unit</strong>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 leading-snug group-hover:text-dstech-blue transition-colors line-clamp-2">
                        {prod.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed flex-1">
                        {prod.desc || "Perangkat teknologi resmi bergaransi untuk kebutuhan residensial dan industrial."}
                      </p>

                      {/* Footer Card */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Harga</span>
                          <span className="text-lg sm:text-xl font-black text-dstech-blue">
                            {formatRupiah(prod.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(prod);
                            }}
                            className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            Detail
                          </button>
                          <a
                            href={`https://wa.me/6282259494242?text=${encodeURIComponent(
                              `Halo CS DSTech Smart, saya ingin order produk: ${prod.name} (${formatRupiah(prod.price)}). Mohon info stok dan prosedurnya.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="h-10 px-4 rounded-xl bg-dstech-red hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-500/20 active:scale-95 transition-all"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Pesan</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Comprehensive Solution Grid */}
        {activeTab === "solutions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in duration-300">
            {DEFAULT_SOLUTIONS.map((prod) => (
              <div
                key={prod.id}
                className="group flex flex-col border border-slate-200/80 rounded-3xl p-6 sm:p-8 hover:border-dstech-blue/40 hover:bg-white transition-all duration-300 relative overflow-hidden bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-xl h-full"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl ${prod.bg} ${prod.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm border border-white`}
                    >
                      {prod.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
                      {prod.tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mb-3 text-slate-900 leading-snug group-hover:text-dstech-red transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm mb-6 font-medium leading-relaxed">{prod.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kategori</span>
                    <span className={`text-xs sm:text-sm font-black ${prod.color}`}>{prod.type}</span>
                  </div>
                  <a
                    href="https://wa.me/6282259494242?text=Halo%20DSTech%20Smart,%20saya%20ingin%20konsultasi%20layanan%20ini."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-dstech-blue transition-colors group/btn shadow-md active:scale-95"
                  >
                    <span>Konsultasi</span> <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Affiliate Promotion Banner */}
        <div className="mt-16 sm:mt-24 relative group">
          <div className="relative p-6 sm:p-12 md:p-16 rounded-3xl sm:rounded-[40px] bg-slate-900 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 overflow-hidden border border-slate-800 shadow-2xl">
            <div className="text-center lg:text-left relative z-10 max-w-2xl">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-dstech-red text-white text-[10px] sm:text-[11px] font-bold tracking-widest uppercase mb-4 shadow-md shadow-red-500/30">
                BECOME OUR PARTNER
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight text-white">
                Bangun Karir Digital <br />
                <span className="text-dstech-blue italic">Bersama Kami.</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-base font-medium leading-relaxed">
                Dapatkan komisi profesional hingga 20% untuk setiap produk dan jasa yang terjual melalui jaringan referral Anda.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto relative z-10">
              <Link
                href="/affiliate/register"
                className="h-12 sm:h-14 px-6 sm:px-8 flex items-center justify-center rounded-2xl bg-dstech-red hover:bg-red-700 text-white font-bold text-sm sm:text-base transition-all shadow-xl shadow-red-500/30 active:scale-95 text-center"
              >
                Daftar Sekarang
              </Link>
              <Link
                href="/affiliate"
                className="h-12 sm:h-14 px-6 sm:px-8 flex items-center justify-center rounded-2xl border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-sm sm:text-base transition-all text-center"
              >
                Portal Mitra
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK VIEW DETAIL MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-[32px] sm:rounded-[40px] max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="relative h-72 sm:h-80 w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                  <Image
                    src={selectedProduct.image || "/service-cctv.png"}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-dstech-blue font-black text-xs uppercase tracking-wider shadow-md">
                      {selectedProduct.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Garansi Resmi 1 Tahun</span>
                  </div>
                  <span className="text-slate-400">100% Original</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dstech-red">
                    PRODUK RESMI DSTECH SMART
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 leading-snug">
                    {selectedProduct.name}
                  </h2>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Harga</span>
                    <span className="text-2xl sm:text-3xl font-black text-dstech-blue">
                      {formatRupiah(selectedProduct.price)}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                    Stok Tersedia
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Deskripsi Produk</h4>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {selectedProduct.desc || "Perangkat teknologi resmi berkualitas prima dari PT. DSTech Smart Perkasa."}
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs font-bold text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Unit Baru & Bergaransi Resmi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Bisa Konsultasi Instalasi Lapangan</span>
                  </li>
                </ul>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <a
                    href={`https://wa.me/6282259494242?text=${encodeURIComponent(
                      `Halo CS DSTech Smart, saya ingin order produk:\n*${selectedProduct.name}*\nHarga: ${formatRupiah(
                        selectedProduct.price
                      )}\n\nMohon info ketersediaan stok dan rekening pembayaran resmi.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-13 py-3.5 rounded-2xl bg-dstech-red hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-red-500/25 active:scale-95 transition-all text-center"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Pesan Langsung via WhatsApp</span>
                  </a>

                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
