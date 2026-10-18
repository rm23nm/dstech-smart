"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  X,
  ExternalLink,
  Sparkles,
  Truck,
  Eye,
  SlidersHorizontal,
  Award,
  Package,
  Star,
  Download,
  FileText,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
  commission?: string;
  commissionRate?: number;
  commissionType?: string;
  image?: string;
  desc?: string;
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "dstech_prod_1",
    name: "Smart Doorlock X-100 Luxury Series",
    category: "Smart Home",
    price: 1850000,
    stock: 24,
    commission: "15%",
    image: "/portfolio-residential.png",
    desc: "Smart Doorlock dengan Fingerprint, RFID Card, Digital Passcode & Kontrol Aplikasi Bluetooth Smartphone.",
  },
  {
    id: "dstech_prod_2",
    name: "CCTV Hikvision 4CH HD Ultra Clear",
    category: "Security",
    price: 3500000,
    stock: 12,
    commission: "10%",
    image: "/service-cctv.png",
    desc: "Paket CCTV 4 Channel Resolusi Full HD lengkap dengan DVR pintar, HDD 1TB, dan kabel coaxial 50m.",
  },
  {
    id: "dstech_prod_3",
    name: "Fingerprint 20 Face Attendance System",
    category: "Security",
    price: 12500000,
    stock: 15,
    commission: "10%",
    image: "/about-image.png",
    desc: "Mesin absensi biometrik pengenal wajah & sidik jari berkecepatan tinggi dengan integrasi laporan Excel instan.",
  },
  {
    id: "dstech_prod_4",
    name: "Barrier Gate System Automatic High-Speed",
    category: "Parking",
    price: 18500000,
    stock: 5,
    commission: "10%",
    image: "/portfolio-industrial.png",
    desc: "Palang parkir otomatis kecepatan tinggi (1.8s) dengan loop detector anti-tabrak & integrasi kartu RFID RFID.",
  },
  {
    id: "dstech_prod_5",
    name: "Website UMKM & Digital Enterprise Suite",
    category: "Software",
    price: 2500000,
    stock: 99,
    commission: "20%",
    image: "/service-it.png",
    desc: "Paket pembuatan website bisnis profesional responsif, domain .com gratis, hosting cepat, & email bisnis.",
  },
  {
    id: "dstech_prod_6",
    name: "PABX System 8 Extension Office PBX",
    category: "Communication",
    price: 4500000,
    stock: 8,
    commission: "15%",
    image: "/portfolio-medical.png",
    desc: "Sistem komunikasi telepon internal kantor berkapasitas 8 extension dengan kejernihan suara audio prima.",
  },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch promotions & catalogs
  const fetchPromotions = async () => {
    try {
      const res = await fetch("/api/promotions?t=" + Date.now());
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setPromotions(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat katalog promosi:", err);
    }
  };

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dstech_product_wishlist");
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Gagal memuat wishlist:", e);
    }
  }, []);

  // Fetch live products from /api/products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?t=" + Date.now());
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat produk dari API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Toggle wishlist
  const toggleWishlist = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
      showToast("Produk dihapus dari daftar disukai.");
    } else {
      updated = [...wishlist, productId];
      showToast("❤️ Produk berhasil ditambahkan ke daftar disukai!");
    }
    setWishlist(updated);
    try {
      localStorage.setItem("dstech_product_wishlist", JSON.stringify(updated));
    } catch (err) {
      console.error("Gagal menyimpan wishlist:", err);
    }
  };

  // Derive available categories
  const categories = ["Semua", ...Array.from(new Set(products.map((p) => p.category || "Lainnya")))];

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchCategory = activeCategory === "Semua" || prod.category === activeCategory;
    const matchSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.desc && prod.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (prod.category && prod.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchWishlist = !showOnlyWishlist || wishlist.includes(prod.id);
    return matchCategory && matchSearch && matchWishlist;
  });

  const featuredProduct = products[0] || FALLBACK_PRODUCTS[0];

  const formatRupiah = (val: number) => {
    return "Rp " + val.toLocaleString("id-ID");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-dstech-red selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900/95 text-white font-bold text-sm shadow-2xl backdrop-blur-md border border-slate-700 animate-in slide-in-from-bottom-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <nav className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-32 sm:w-40 h-10 sm:h-12">
              <Image src="/logo.png" alt="PT. DSTech Smart Logo" fill className="object-contain object-left" priority />
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-600">
            <Link href="/" className="hover:text-dstech-red transition-colors">
              Beranda
            </Link>
            <Link href="/shop" className="text-dstech-red border-b-2 border-dstech-red py-1">
              E-Store (Toko Online)
            </Link>
            <Link href="/affiliate" className="hover:text-dstech-blue transition-colors">
              Program Partner
            </Link>
            <Link href="/#portofolio" className="hover:text-dstech-red transition-colors">
              Portofolio Proyek
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Button */}
            <button
              onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
              title="Lihat Produk Disukai"
              className={`relative p-2.5 sm:p-3 rounded-2xl transition-all border ${
                showOnlyWishlist
                  ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600"
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Hubungi WhatsApp CS */}
            <a
              href="https://wa.me/6282259494242"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-dstech-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CS Order</span>
            </a>
          </div>
        </div>
      </nav>

      {/* LUXURY HERO SECTION */}
      <header className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white pt-12 sm:pt-20 pb-20 sm:pb-28 px-4 sm:px-6 md:px-12 overflow-hidden border-b border-slate-800 shadow-2xl">
        {/* Ambient Lights & Grid Pattern */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-dstech-red/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-900/60 to-slate-900/80 border border-blue-500/30 backdrop-blur-md shadow-inner">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-blue-200">
                  EXCLUSIVE OFFICIAL STORE &bull; PT. DSTECH SMART PERKASA
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] text-white">
                Inovasi Teknologi <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                  Premium & Cerdas.
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Pusat pengadaan perangkat keamanan high-grade, CCTV ultra-clear, smart home automation berstandar industri, dan solusi IT enterprise dengan garansi resmi serta jaminan instalasi teknisi ahli tersertifikasi.
              </p>

              {/* Badges / Guarantees */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-200">100% Original & Garansi</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-200">Teknisi Tersertifikasi</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm col-span-2 sm:col-span-1">
                  <Truck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-200">Pengiriman Cepat</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3.5 justify-center lg:justify-start pt-2">
                <a
                  href="#katalog-produk"
                  className="h-13 sm:h-14 px-7 rounded-2xl bg-gradient-to-r from-dstech-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/30 transition-all active:scale-95 w-full sm:w-auto"
                >
                  <span>Jelajahi Koleksi</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    fetchPromotions();
                    setIsCatalogModalOpen(true);
                  }}
                  className="h-13 sm:h-14 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Unduh E-Katalog PDF</span>
                </button>

                <a
                  href="https://wa.me/6282259494242?text=Halo%20DSTech%20Smart,%20saya%20ingin%20konsultasi%20pengadaan%20perangkat."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-13 sm:h-14 px-6 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 w-full sm:w-auto"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Konsultasi WA</span>
                </a>
              </div>
            </div>

            {/* Right Showcase: Featured Product Luxury Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative p-6 sm:p-8 rounded-[36px] bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/15 shadow-2xl backdrop-blur-xl overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-[80px]"></div>

                {/* Badge Top */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    PRODUK UNGGULAN PILIHAN
                  </span>
                  <span className="text-xs font-bold text-slate-400">Tersedia Stok</span>
                </div>

                {/* Image */}
                <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-800/80 mb-6 flex items-center justify-center border border-white/10">
                  <Image
                    src={featuredProduct.image || "/service-cctv.png"}
                    alt={featuredProduct.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-cyan-300 font-bold text-xs border border-cyan-500/30">
                      {featuredProduct.category}
                    </span>
                    <button
                      onClick={(e) => toggleWishlist(featuredProduct.id, e)}
                      className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-rose-400 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishlist.includes(featuredProduct.id) ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-snug line-clamp-2">
                  {featuredProduct.name}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                  {featuredProduct.desc}
                </p>

                {/* Price & Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Harga Spesial</span>
                    <span className="text-xl sm:text-2xl font-black text-cyan-400">
                      {formatRupiah(featuredProduct.price)}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(featuredProduct)}
                    className="h-11 px-5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Eye className="w-4 h-4 text-dstech-blue" />
                    <span>Lihat Detail</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CATALOG AREA */}
      <main id="katalog-produk" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-16 sm:py-24">
        {/* Controls: Search, Filter Wishlist, Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-dstech-blue font-bold text-xs uppercase tracking-widest mb-1.5">
              <Package className="w-4 h-4" />
              <span>Katalog Resmi Terverifikasi</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              {showOnlyWishlist ? "Produk Disukai (Favorit Anda)" : "Semua Produk & Perangkat"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Menampilkan {filteredProducts.length} dari {products.length} produk resmi yang terdaftar di inventaris.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[260px] sm:min-w-[320px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari produk, CCTV, doorlock..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-slate-200 focus:border-dstech-blue focus:ring-4 focus:ring-blue-100 text-sm font-semibold outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Wishlist Toggle */}
            <button
              onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
              className={`h-12 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all shadow-sm ${
                showOnlyWishlist
                  ? "bg-rose-600 border-rose-600 text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Heart className={`w-4 h-4 ${showOnlyWishlist ? "fill-white" : ""}`} />
              <span>{showOnlyWishlist ? "Tampilkan Semua" : `Favorit (${wishlist.length})`}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all shadow-sm ${
                activeCategory === cat
                  ? "bg-dstech-blue text-white shadow-md shadow-blue-500/25"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto p-8">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak Ada Produk yang Ditemukan</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Tidak ada produk yang sesuai dengan kriteria pencarian atau filter kategori Anda.
            </p>
            <button
              onClick={() => {
                setActiveCategory("Semua");
                setSearchQuery("");
                setShowOnlyWishlist(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-dstech-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm"
            >
              Reset Filter & Tampilkan Semua
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((prod) => {
              const isLiked = wishlist.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="group bg-white border border-slate-200/90 hover:border-dstech-blue/50 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl shadow-sm cursor-pointer relative"
                >
                  {/* Image & Badges */}
                  <div className="h-60 relative overflow-hidden bg-slate-100 flex items-center justify-center">
                    <Image
                      src={prod.image || "/service-cctv.png"}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Category Pill Top Left */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-dstech-blue shadow-sm">
                        {prod.category}
                      </span>
                    </div>

                    {/* Wishlist Heart Button Top Right */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={(e) => toggleWishlist(prod.id, e)}
                        title={isLiked ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                        className={`w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all shadow-sm active:scale-90 ${
                          isLiked
                            ? "bg-rose-50 border-rose-300 text-rose-600 shadow-rose-500/20"
                            : "bg-white/80 hover:bg-white border-slate-200 text-slate-400 hover:text-rose-500"
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>
                    </div>

                    {/* Hover Quick Action */}
                    <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(prod);
                        }}
                        className="w-full py-3 rounded-xl bg-slate-900/90 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 backdrop-blur-md shadow-lg"
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>Lihat Rincian & Pesan</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>5.0</span>
                        <span className="text-slate-400 font-normal text-[11px]">(Resmi)</span>
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
                      {prod.desc || "Perangkat resmi bergaransi untuk kebutuhan residensial dan industrial."}
                    </p>

                    {/* Price & Order Button */}
                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Harga</span>
                        <span className="text-lg sm:text-xl font-black text-dstech-blue">
                          {formatRupiah(prod.price)}
                        </span>
                      </div>

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
              );
            })}
          </div>
        )}
      </main>

      {/* PRODUCT DETAIL MODAL (QUICK VIEW) */}
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

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Garansi Resmi 1 Tahun</span>
                  </div>
                  <button
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        wishlist.includes(selectedProduct.id) ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                    <span>{wishlist.includes(selectedProduct.id) ? "Favorit Anda" : "Sukai"}</span>
                  </button>
                </div>
              </div>

              {/* Product Info & Specifications */}
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dstech-red">
                    OFFICIAL HARDWARE &bull; DSTECH SMART
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 leading-snug">
                    {selectedProduct.name}
                  </h2>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Harga Satuan</span>
                    <span className="text-2xl sm:text-3xl font-black text-dstech-blue">
                      {formatRupiah(selectedProduct.price)}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                    Tersedia
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Deskripsi & Spesifikasi</h4>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {selectedProduct.desc || "Perangkat teknologi resmi berkualitas prima dari PT. DSTech Smart Perkasa. Didesain untuk keandalan maksimal dan efisiensi operasional jangka panjang."}
                  </p>
                </div>

                {/* Key Points */}
                <ul className="space-y-2.5 text-xs font-bold text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Unit 100% Baru & Original dengan Segel Resmi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Termasuk Panduan Pemasangan & Setup Sistem</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Tersedia Jasa Pemasangan oleh Tim Teknisi DSTech</span>
                  </li>
                </ul>

                {/* Direct Action Buttons */}
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
                    Kembali ke Katalog
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UNDUH E-KATALOG & BROSUR RESMI */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCatalogModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-dstech-red flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Unduh E-Katalog & Brosur Resmi</h3>
                <p className="text-xs font-bold text-slate-400">Pilih dokumen resmi PT. DSTech Smart Perkasa untuk diunduh</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {promotions.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-bold text-sm">
                  Memuat katalog & brosur resmi...
                </div>
              ) : (
                promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-dstech-blue transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-dstech-blue font-black text-[10px] uppercase tracking-wider">
                          {promo.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {promo.fileType} &bull; {promo.fileSize}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">{promo.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{promo.description}</p>
                    </div>

                    <a
                      href={promo.fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-dstech-blue hover:bg-dstech-red text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0 self-stretch sm:self-auto justify-center"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh File</span>
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-medium text-center sm:text-left">Butuh penawaran custom atau tender instansi?</span>
              <a
                href="https://wa.me/6282259494242?text=Halo%20DSTech%20Smart,%20saya%20ingin%20minta%20penawaran%20resmi%20katalog."
                target="_blank"
                rel="noopener noreferrer"
                className="text-dstech-red font-black hover:underline flex items-center gap-1"
              >
                Hubungi Tim Sales &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="relative w-36 h-10">
              <Image src="/logo.png" alt="DSTech Logo" fill className="object-contain object-left brightness-200" />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium">
            &copy; {new Date().getFullYear()} PT. DSTech Smart Perkasa &bull; Solusi Keamanan & IT Infrastructure Terpercaya
          </p>
          <div className="flex gap-6 text-xs font-bold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <Link href="/affiliate" className="hover:text-white transition-colors">
              Program Mitra
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Portal Staf
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
