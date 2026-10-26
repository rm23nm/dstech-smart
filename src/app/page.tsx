"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import ProductSection from "@/components/ProductSection";
import PortfolioSection from "@/components/PortfolioSection";
import HeroSlider from "@/components/HeroSlider";
import { 
  MoveRight, 
  Shield, 
  Cpu, 
  Target, 
  Users, 
  CheckCircle2, 
  ShoppingCart, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  MessageCircle, 
  Star,
  Menu,
  X,
  ArrowRight,
  LogIn,
  Smartphone,
  Download
} from "lucide-react";

import Link from "next/link";

interface SiteSettings {
  companyName: string;
  tagline: string;
  whatsapp: string;
  whatsappDisplay: string;
  email: string;
  phone: string;
  address: string;
  googleMapsUrl: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  logoUrl?: string;
  logoWhiteUrl?: string;
  faviconUrl?: string;
  logoHeight?: number;
}

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: "PT. DSTech Smart Perkasa",
  tagline: "Penyedia Solusi Teknologi Keamanan, Smart Home & IT Infrastructure Terpercaya untuk Perumahan, Korporat & Industri.",
  whatsapp: "6282259494242",
  whatsappDisplay: "+62 822-5949-4242",
  email: "cs@dstechsmart.com",
  phone: "0822-5949-4242",
  address: "PERUM BUKIT CILEGON ASRI BLOK DB NO. 19, KEL. BAGENDUNG, KEC. CILEGON, KOTA CILEGON - BANTEN",
  googleMapsUrl: "https://maps.google.com/?q=Perum+Bukit+Cilegon+Asri+Cilegon+Banten",
  instagram: "https://instagram.com/dstechsmart",
  facebook: "https://facebook.com/dstechsmart",
  linkedin: "https://linkedin.com/company/dstechsmart",
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && json.data) {
          setSettings((prev) => ({
            ...prev,
            ...json.data,
            companyName: json.data.companyName || prev.companyName,
            tagline: json.data.tagline || prev.tagline,
            whatsapp: json.data.whatsapp || prev.whatsapp,
            whatsappDisplay: json.data.whatsappDisplay || json.data.phone || prev.whatsappDisplay,
            email: json.data.email || prev.email,
            phone: json.data.phone || json.data.whatsappDisplay || prev.phone,
            address: json.data.address || prev.address,
            googleMapsUrl: json.data.googleMapsUrl || prev.googleMapsUrl,
          }));
        }
      })
      .catch((err) => {
        console.error("Gagal memuat pengaturan situs dinamis:", err);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-dstech-red selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="relative w-32 sm:w-44 h-10 sm:h-12 flex items-center">
              <Image 
                src={settings.logoUrl || "/logo.png"} 
                alt={settings.companyName || "PT. DSTech Smart Perkasa Logo"} 
                fill 
                className="object-contain object-left" 
                priority 
              />
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 font-black text-xs uppercase tracking-widest text-slate-600">
            <a href="#" className="hover:text-dstech-red transition-colors border-b-2 border-transparent hover:border-dstech-red py-1">Beranda</a>
            <a href="#tentang" className="hover:text-dstech-blue transition-colors border-b-2 border-transparent hover:border-dstech-blue py-1">Profil</a>
            <a href="#produk" className="hover:text-dstech-red transition-colors border-b-2 border-transparent hover:border-dstech-red py-1">Layanan</a>
            <a href="/shop" className="hover:text-dstech-blue transition-colors border-b-2 border-transparent hover:border-dstech-blue py-1">E-Store</a>
            <a href="#portofolio" className="hover:text-dstech-red transition-colors border-b-2 border-transparent hover:border-dstech-red py-1">Portofolio</a>
            <a href="/affiliate" className="bg-dstech-blue text-white px-5 py-2 rounded-full hover:bg-dstech-red transition-all shadow-md shadow-blue-500/20">
              Program Partner
            </a>
          </div>

          {/* Action Button & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              id="btn-header-login"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 hover:text-dstech-blue bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200 active:scale-95 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-dstech-blue" />
              <span>Login</span>
            </Link>

            <a 
              href={`https://wa.me/${(settings.whatsapp || "6282259494242").replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-dstech-red hover:bg-red-700 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Konsultasi</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-5 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-3 font-bold text-sm text-slate-700">
              <a 
                href="#" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-slate-50 hover:text-dstech-red transition-colors"
              >
                Beranda
              </a>
              <a 
                href="#tentang" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-slate-50 hover:text-dstech-blue transition-colors"
              >
                Profil Perusahaan
              </a>
              <a 
                href="#produk" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-slate-50 hover:text-dstech-red transition-colors"
              >
                Katalog Layanan
              </a>
              <a 
                href="/shop" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-slate-50 hover:text-dstech-blue transition-colors"
              >
                E-Store (Toko Online)
              </a>
              <a 
                href="#portofolio" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-slate-50 hover:text-dstech-red transition-colors"
              >
                Portofolio Proyek
              </a>
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/${(settings.whatsapp || "6282259494242").replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp CS ({settings.phone || settings.whatsappDisplay})</span>
                </a>

                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-md transition-all active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <LogIn className="w-4 h-4 text-dstech-blue" />
                    <span>Masuk ke Portal Login</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <a 
                  href="/affiliate" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-dstech-blue text-white text-center font-bold text-xs uppercase tracking-wider shadow-sm"
                >
                  Program Partner & Affiliate
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-24 sm:pt-32 md:pt-36 pb-16 sm:pb-24 relative bg-slate-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-dstech-blue/5 blur-[100px] rounded-full pointer-events-none -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-dstech-red/5 blur-[100px] rounded-full pointer-events-none -ml-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 text-center relative z-10 w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-dstech-red animate-ping"></span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-600">The Best Solution Smart Technology</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4 sm:mb-6 text-slate-900 leading-tight">
            <span className="text-dstech-blue">SECURITY</span> SYSTEM<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-dstech-red via-dstech-blue to-dstech-red">& TECHNOLOGY</span>
          </h1>
          
          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-sm sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-12 leading-relaxed font-medium">
             Partner Strategis Digitalisasi Industri, Bisnis & Hunian. Menghadirkan Inovasi Security System & IT Infrastructure Terdepan Sejak 2017.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 w-full justify-center mb-12 sm:mb-16 max-w-lg sm:max-w-none mx-auto">
            <a 
              href="/shop" 
              className="h-12 sm:h-14 w-full sm:w-64 flex items-center justify-center gap-2.5 rounded-2xl bg-dstech-red text-white font-bold text-sm sm:text-base transition-all hover:bg-red-700 shadow-xl shadow-red-500/25 active:scale-95"
            >
              <ShoppingCart className="w-5 h-5" /> Buka Toko Online
            </a>
            <a 
              href="/affiliate" 
              className="h-12 sm:h-14 w-full sm:w-64 flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dstech-blue bg-white text-dstech-blue font-bold text-sm sm:text-base transition-all hover:bg-dstech-blue hover:text-white shadow-lg shadow-blue-500/10 active:scale-95"
            >
              Daftar Agen Mitra <MoveRight className="w-5 h-5" />
            </a>
          </div>

          {/* HERO SLIDER COMPONENT */}
          <div className="w-full mb-12 sm:mb-16">
            <HeroSlider />
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 w-full max-w-5xl mx-auto pt-10 sm:pt-14 border-t border-slate-200">
               {[
                 { val: "500+", label: "Project Selesai", color: "text-dstech-red" },
                 { val: "2017", label: "Tahun Berdiri", color: "text-dstech-blue" },
                 { val: "18+", label: "Produk & Layanan", color: "text-dstech-red" },
                 { val: "BANTEN", label: "Area Operasional", color: "text-dstech-blue" }
               ].map((stat) => (
                 <div key={stat.label} className="p-4 sm:p-6 rounded-2xl bg-white/70 border border-slate-100 flex flex-col items-center text-center shadow-sm">
                    <span className={`text-2xl sm:text-4xl md:text-5xl font-black ${stat.color} mb-1 sm:mb-2`}>{stat.val}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                 </div>
               ))}
          </div>
        </div>
      </main>

      {/* Profil Section */}
      <section id="tentang" className="py-16 sm:py-24 md:py-32 relative bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center mb-16 sm:mb-24">
               {/* Left Column Image */}
               <div className="relative group order-2 lg:order-1">
                  <div className="relative aspect-[4/3] sm:aspect-square rounded-3xl sm:rounded-[48px] overflow-hidden border-4 sm:border-8 border-white shadow-xl bg-slate-50">
                     <Image 
                       src="/about_image.png" 
                       alt="DSTech Leadership" 
                       fill 
                       className="object-cover group-hover:scale-105 transition-transform duration-700" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-dstech-blue/90 via-dstech-blue/30 to-transparent"></div>
                     <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 text-white">
                        <p className="text-xl sm:text-3xl md:text-4xl font-black italic tracking-tight mb-2 sm:mb-3 leading-tight text-white drop-shadow">
                          "Kepuasan Pelanggan adalah masa depan kami"
                        </p>
                        <div className="w-16 h-1.5 bg-dstech-red mb-2"></div>
                        <p className="font-bold tracking-[0.3em] text-[9px] sm:text-[10px] uppercase text-slate-200">MOTO UTAMA PERUSAHAAN</p>
                     </div>
                  </div>
               </div>

               {/* Right Column Text */}
               <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-dstech-red/10 text-dstech-red text-[11px] font-bold tracking-wider uppercase border border-dstech-red/20">
                    Sejarah & Kredibilitas
                  </span>
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900">
                    Digital <br />
                    <span className="text-dstech-blue">Transformation</span>
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                     PT. DSTech Smart Perkasa didirikan oleh tenaga profesional berpengalaman di bidang Teknologi Informasi & Security System. Kami melayani masyarakat, instansi pemerintahan, BUMN, hingga Industri Internasional.
                  </p>
                  <div className="flex flex-col gap-4 sm:gap-6 pt-2">
                     <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-dstech-red text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/20">
                          <Star className="w-5 h-5" />
                        </div>
                        <div>
                           <h4 className="text-base sm:text-lg font-bold text-slate-800">Legalitas Resmi & Terdaftar</h4>
                           <p className="text-xs sm:text-sm text-slate-500 font-medium">NIB: 1909220127034 & NPWP: 60.648.216.4-102.000</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-dstech-blue text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                           <h4 className="text-base sm:text-lg font-bold text-slate-800">Tim Ahli Berpengalaman</h4>
                           <p className="text-xs sm:text-sm text-slate-500 font-medium">Teknisi profesional bersertifikat yang telah menangani ratusan instalasi.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Visi & Misi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
               <div className="p-6 sm:p-10 rounded-3xl sm:rounded-[40px] bg-slate-50 border border-slate-100 hover:border-dstech-blue/40 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-dstech-blue text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">VISI KAMI</h3>
                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                     Menjadi perusahaan skala nasional & internasional yang berfokus pada profesionalisme dan kepuasan pelanggan dengan standar kualitas terbaik di era digital.
                  </p>
               </div>
               <div className="p-6 sm:p-10 rounded-3xl sm:rounded-[40px] bg-dstech-red text-white shadow-xl shadow-red-500/20">
                  <div className="w-14 h-14 rounded-2xl bg-white text-dstech-red flex items-center justify-center mb-6 shadow-md">
                    <Target className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">MISI KAMI</h3>
                  <ul className="space-y-2.5 text-white/90 text-sm sm:text-base font-medium">
                     <li className="flex gap-2.5 items-start">
                       <CheckCircle2 className="w-4 h-4 mt-1 flex-shrink-0 text-white" />
                       <span>Memberikan layanan tepat, akurat, dan dapat dipercaya bagi seluruh mitra.</span>
                     </li>
                     <li className="flex gap-2.5 items-start">
                       <CheckCircle2 className="w-4 h-4 mt-1 flex-shrink-0 text-white" />
                       <span>Membangun SDM kompeten dan berintegritas tinggi di bidang teknologi cerdas.</span>
                     </li>
                     <li className="flex gap-2.5 items-start">
                       <CheckCircle2 className="w-4 h-4 mt-1 flex-shrink-0 text-white" />
                       <span>Berpartisipasi aktif dalam pembangunan infrastruktur digital Indonesia.</span>
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* Catalog Section */}
      <ProductSection />

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dstech-red via-dstech-blue to-dstech-red"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 text-center mb-12 sm:mb-20">
            <span className="text-dstech-red font-black tracking-widest uppercase text-xs">TRUSTED BY LEADERS</span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mt-3">
              KLIEN & <span className="text-dstech-blue italic">TESTIMONI</span>
            </h2>
         </div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
            {[
               { name: "PT. POSCO ENERGY", text: "Instalasi CCTV & Jaringan Fiber Optik sangat profesional. Monitoring operasional kami kini jauh lebih efisien dan real-time.", client: "Cilegon Industrial Area", stars: 5 },
               { name: "RS KURNIA", text: "Sistem access control (Digital Lock) yang dipasang sangat membantu keamanan area medis kami. Respon tim support sangat cepat.", client: "Fasilitas Kesehatan", stars: 5 },
               { name: "CILEGON HILLS", text: "Konsep Smarthome System dari DSTech menambah nilai jual properti kami secara signifikan. Sangat inovatif dan handal.", client: "Premium Housing Cluster", stars: 5 }
            ].map((t, idx) => (
               <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex gap-1 mb-4">
                       {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-sm sm:text-base font-medium italic text-slate-700 mb-6 leading-relaxed">"{t.text}"</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                     <h4 className="text-lg font-black text-dstech-blue leading-none">{t.name}</h4>
                     <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mt-1.5">{t.client}</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Portfolio Section */}
      <PortfolioSection />

      {/* Local SEO & Services Hub: Serang, Cilegon, Banten & Nasional */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden border-t border-slate-800">
        {/* Glow ambient */}
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
              <MapPin className="w-3.5 h-3.5" />
              Jangkauan Layanan Wilayah: Serang • Cilegon • Banten • Nasional
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Pusat Solusi <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-300">CCTV, Barrier Gate, Fingerprint &amp; IT Software</span> Terpercaya
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              PT. DSTech Smart Perkasa melayani survey lokasi, pengadaan perangkat bergaransi resmi, serta jasa instalasi teknis profesional untuk pabrik industri, instansi pemerintah, perkantoran, perumahan cluster, dan ruko komersial.
            </p>
          </div>

          {/* 5 Service Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {/* Card 1: CCTV AI */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-red-500/50 transition-all group flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-red-400 transition-colors">
                  Jasa Pasang CCTV Serang &amp; Cilegon AI System
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Pengadaan paket CCTV Hikvision, Dahua, dan Ezviz Full HD hingga 4K. Dilengkapi fitur ColorVu malam berwarna, deteksi AI pergerakan manusia &amp; kendaraan, audio 2 arah, dan pantauan live streaming via HP.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">CCTV Kota Serang</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">CCTV Industri Cilegon</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Thermal Camera</span>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-800/80 mt-6 flex justify-between items-center text-xs">
                <span className="text-slate-400">Garansi 1 Tahun Resmi</span>
                <Link href="/shop" className="text-red-400 font-bold hover:underline inline-flex items-center gap-1">
                  Lihat Paket <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Barrier Gate */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all group flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">
                  Barrier Gate &amp; Palang Parkir Otomatis Banten
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Pemasangan palang parkir otomatis servo kecepatan 1.8 detik untuk perumahan cluster, pabrik, dan gedung parkir komersial. Mendukung integrasi kartu akses RFID tapping, sensor loop keselamatan, dan sistem manless tiket.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Palang Parkir Serang</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Barrier Gate Cilegon</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Akses RFID Cluster</span>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-800/80 mt-6 flex justify-between items-center text-xs">
                <span className="text-slate-400">Bahan Baja Tahan Karat</span>
                <Link href="/shop" className="text-blue-400 font-bold hover:underline inline-flex items-center gap-1">
                  Konsultasi Gate <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Fingerprint & Face Recognition */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                  Mesin Absensi Fingerprint &amp; Face Recognition
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Solusi absensi biometrik sidik jari dan pengenal wajah anti-pemalsuan foto untuk perkantoran dan pabrik. Terintegrasi dengan sistem Access Door Lock kunci magnetik pintu kaca, kayu, dan besi.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Absensi Fingerprint Serang</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Smart Doorlock Banten</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Access Control Kantor</span>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-800/80 mt-6 flex justify-between items-center text-xs">
                <span className="text-slate-400">Software Payroll Ready</span>
                <Link href="/shop" className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1">
                  Pilih Mesin <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 4: Software House */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all group flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                  Jasa Pembuatan Software, ERP &amp; POS Kasir Banten
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Software house terpercaya untuk pembuatan aplikasi web kustom, sistem ERP manajemen keuangan &amp; inventori, software kasir POS ritel &amp; resto, aplikasi WhatsApp Gateway SmartPro, hingga portal informasi terpadu.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Software House Serang</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Aplikasi Kasir POS</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">SmartPro WA Gateway</span>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-800/80 mt-6 flex justify-between items-center text-xs">
                <span className="text-slate-400">Custom Sesuai Kebutuhan</span>
                <Link href="/contact" className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1">
                  Diskusi Sistem <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 5: IT Infrastructure & Fiber Optik */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all group flex flex-col justify-between shadow-xl md:col-span-2 lg:col-span-2">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">
                  Infrastruktur IT, Tarik Kabel Fiber Optik &amp; Jaringan Komputer Kantor
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Spesialis penggelaran backbone kabel Fiber Optik (FO), penyambungan fusion splicing, pengujian redaman OTDR, instalasi titik LAN internet kantor, penataan server rack PABX, hingga pengadaan running text &amp; Videotron LED display outdoor di kawasan industri Cikande, Cilegon, Merak, dan Bojonegara.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-800 text-purple-300 border border-purple-500/20">Fiber Optik Banten</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-800 text-purple-300 border border-purple-500/20">Instalasi Jaringan LAN Serang</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-800 text-purple-300 border border-purple-500/20">Splicing &amp; OTDR Cilegon</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-800 text-purple-300 border border-purple-500/20">Server &amp; PABX Pabrik</span>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-800/80 mt-6 flex justify-between items-center text-xs">
                <span className="text-slate-400">Uji Redaman Standar Sertifikasi</span>
                <Link href="/contact" className="text-purple-400 font-bold hover:underline inline-flex items-center gap-1">
                  Minta Penawaran SPH <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Area Coverage Badge Bar */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center lg:text-left">
              <h4 className="text-sm sm:text-base font-black text-white">
                Wilayah Jangkauan Layanan Lapangan (Survey &amp; Instalasi Teknisi Langsung):
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                <strong>Kota Serang</strong> (Cipocok Jaya, Curug, Kasemen, Serang, Taktakan, Walantaka) • <strong>Kota Cilegon</strong> (Cibeber, Citangkil, Ciwandan, Gerogol, Jombang, Pulomerak, Purwakarta) • <strong>Kabupaten Serang &amp; Industri</strong> (Cikande, Bojonegara, Anyer, Kramatwatu, Ciruas, Kragilan) • <strong>Banten &amp; Jabodetabek</strong> (Tangerang, Balaraja, Pandeglang, Lebak Rangkasbitung, DKI Jakarta) &amp; Pengiriman Perangkat ke Seluruh Indonesia.
              </p>
            </div>
            <a
              href={`https://wa.me/${(settings.whatsapp || "6282259494242").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Halo PT. DSTech Smart Perkasa, saya ingin konsultasi dan survey pemasangan (CCTV / Barrier Gate / Fingerprint / Software / IT) untuk wilayah Serang / Cilegon.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs sm:text-sm hover:from-red-500 hover:to-rose-500 transition-all shadow-xl shadow-red-600/30 flex items-center gap-2 flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              Jadwalkan Survey Lokasi Gratis
            </a>
          </div>
        </div>
      </section>

      {/* Section: Pusat Distributor & Supplier Resmi Multi-Merek CCTV Terlengkap (Tugas 220) */}
      <section className="py-20 sm:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
        {/* Glow ambient */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10 space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Pusat Distributor, Supplier &amp; Grosir CCTV Resmi Banten
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Distributor &amp; Supplier Resmi <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300">Semua Merek CCTV</span> Terkemuka
            </h2>
            <p className="text-slate-400 text-xs sm:text-base leading-relaxed">
              PT. DSTech Smart Perkasa merupakan mitra supplier dan distributor terpercaya untuk pengadaan perangkat CCTV skala retail, reseller, toko komputer, instalatur, kontraktor tender, pabrik industri, hingga instansi pemerintahan di Serang, Cilegon, Banten, dan seluruh Indonesia.
            </p>
          </div>

          {/* Grid Brand CCTV Terlengkap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Brand 1: Hikvision */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-red-500/60 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-bl-full pointer-events-none"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                    Market Leader
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready Stock
                  </span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-red-400 transition-colors">
                  HIKVISION
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Distributor Resmi Hikvision Serang &amp; Banten</strong>. Menyediakan kamera CCTV ColorVu malam berwarna, AcuSense AI, Turbo HD 2MP-5MP, IP Camera 4K, NVR, DVR, dan Thermal Camera industri.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">ColorVu Audio</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">AcuSense AI</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">NVR Enterprise</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Garansi 2 Tahun</span>
                <Link href="/shop" className="text-red-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                  Cek Produk <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Brand 2: Dahua Technology */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-bl-full pointer-events-none"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Global Top Tier
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready Stock
                  </span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">
                  DAHUA
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Distributor &amp; Supplier Dahua Banten</strong>. Solusi Full-Color LED, WizSense AI, kamera TiOC 3-in-1 (Active Deterrence sirine &amp; lampu strobo), HDCVI Cooper, dan PTZ Speed Dome kawasan pabrik.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Full-Color 24/7</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">TiOC Active Sirine</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">WizSense AI</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Garansi 2 Tahun</span>
                <Link href="/shop" className="text-blue-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                  Cek Produk <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Brand 3: HiLook */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-bl-full pointer-events-none"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    By Hikvision
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Best Seller
                  </span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                  HILOOK
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Distributor &amp; Master Dealer HiLook Resmi</strong>. Solusi paket CCTV hemat dengan durabilitas teruji dari Hikvision. Sangat diminati untuk rumah tinggal, toko sembako, ruko, dan sekolah.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Paket 4CH / 8CH</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">1080P Full HD</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Harga Terjangkau</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Garansi 2 Tahun</span>
                <Link href="/shop" className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                  Cek Produk <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Brand 4: Ezviz */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-bl-full pointer-events-none"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Smart Wi-Fi
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Terlaris
                  </span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
                  EZVIZ
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Distributor Ezviz Banten &amp; Supplier Wi-Fi Cam</strong>. Kamera pintar tanpa kabel: Ezviz C6N Pan-Tilt, C3W Pro Color Night Vision, H8c Outdoor 360, serta Battery Camera tenaga surya solar panel.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Ezviz C6N &amp; H8c</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Audio 2 Arah HP</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Baterai &amp; Solar</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Garansi 1 Tahun</span>
                <Link href="/shop" className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                  Cek Produk <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Brand 5: Imou */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/60 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/10 rounded-bl-full pointer-events-none"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    IoT Wireless
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Populer
                  </span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-orange-400 transition-colors">
                  IMOU
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Supplier &amp; Distributor Imou CCTV Serang</strong>. Produk smart wireless terpopuler: Imou Ranger 2 auto-tracking, Cruiser Dual Lens, Bullet 2C tahan cuaca hujan, dan kamera 4G Simcard tanpa internet WiFi.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Ranger 2 Pan Tilt</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Cruiser 360 IP66</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">CCTV 4G Simcard</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Garansi 1 Tahun</span>
                <Link href="/shop" className="text-orange-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                  Cek Produk <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Brand 6: Uniview (UNV) */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/10 rounded-bl-full pointer-events-none"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    Enterprise IP
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Proyek / B2B
                  </span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors">
                  UNIVIEW (UNV)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Distributor Uniview (UNV) Banten</strong>. Pionir IP Video Surveillance berkelas industri tinggi dengan fitur SIP (Smart Intrusion Prevention), LightHunter kejernihan malam ultra jernih, dan server NVR rack-mount.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">LightHunter Tech</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">UNV NVR Enterprise</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">CCTV Pabrik</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Garansi 2 Tahun</span>
                <Link href="/shop" className="text-cyan-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                  Cek Produk <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Brand 7: Tiandy */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/60 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-bl-full pointer-events-none"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30">
                    Starlight AI
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Certified
                  </span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-violet-400 transition-colors">
                  TIANDY
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Supplier &amp; Partner Tiandy CCTV</strong>. Terkenal dengan keunggulan Super Starlight (rekaman malam tetap terang meski minim pencahayaan) serta kecerdasan buatan analisa kendaraan &amp; pelat nomor (ANPR).
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Super Starlight</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">ANPR Plat Nomor</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Color Maker</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Garansi 2 Tahun</span>
                <Link href="/shop" className="text-violet-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                  Cek Produk <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Brand 8: SPC & Others */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/10 rounded-bl-full pointer-events-none"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Ekonomis &amp; Pro
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Garansi Nasional
                  </span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-rose-400 transition-colors">
                  SPC &amp; BRAND LAIN
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Distributor SPC CCTV, Hanwha/Samsung &amp; Bosch</strong>. Menyediakan kamera CCTV ekonomis SPC bergaransi resmi luas, serta perangkat high-end Hanwha Vision dan Panasonic untuk fasilitas perbankan.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">SPC Indonesia</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Hanwha Vision</span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Bosch Security</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Garansi 1-3 Tahun</span>
                <Link href="/shop" className="text-rose-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                  Cek Produk <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Banner B2B Supplier / Grosir / Kemitraan Toko & Reseller */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 border border-red-500/30 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
                <span>🤝 Peluang Kemitraan Reseller, Instalatur &amp; Tender Proyek B2B</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Butuh Pasokan CCTV Harga Distributor, Grosir, atau Penawaran SPH Tender Resmi?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Kami siap menjadi supplier utama bagi toko komputer, teknisi freelance, kontraktor MEP, pengembang perumahan, maupun pengadaan kantor BUMN &amp; swasta. Dapatkan faktur pajak PPN 11%, surat dukungan distributor, dan harga margin terbaik.
              </p>
            </div>
            <a
              href={`https://wa.me/${(settings.whatsapp || "6282259494242").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Halo PT. DSTech Smart Perkasa, saya ingin minta daftar harga grosir distributor CCTV (Hikvision, Dahua, Hilook, Ezviz, Imou, Uniview) untuk pengadaan / reseller.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-red-500/30 flex items-center gap-3 shrink-0 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Minta Price List Distributor</span>
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t-4 border-dstech-blue pt-16 sm:pt-24 pb-12 overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 relative z-10">
            {/* Col 1: About */}
            <div className="space-y-6">
               <div className="relative w-40 sm:w-52 h-12 sm:h-16">
                  <Image src={settings.logoWhiteUrl || settings.logoUrl || "/logo.png"} alt={settings.companyName || "DSTech Logo"} fill className="object-contain object-left" />
               </div>
               <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
                  {settings.tagline}
               </p>
               <div className="flex gap-3 pt-2">
                  <a 
                    href="https://dstechsmart.com" 
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-dstech-red hover:bg-dstech-red hover:text-white transition-all shadow-sm"
                    aria-label="Website"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                  <a 
                    href={`https://wa.me/${(settings.whatsapp || "6282259494242").replace(/[^0-9]/g, "")}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-dstech-blue hover:bg-dstech-blue hover:text-white transition-all shadow-sm"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
               </div>
            </div>
            
            {/* Col 2: Contact */}
            <div className="space-y-4 sm:space-y-6">
               <h4 className="text-dstech-red font-black tracking-wider text-xs uppercase">KONTAK UTAMA</h4>
               <ul className="space-y-4 font-medium text-sm">
                  <li>
                     <a 
                       href={`https://wa.me/${(settings.whatsapp || "6282259494242").replace(/[^0-9]/g, "")}`} 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-start gap-3 hover:text-dstech-red transition-colors"
                     >
                        <Phone className="w-5 h-5 text-dstech-blue flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-800">{settings.phone || settings.whatsappDisplay}</span>
                           <span className="text-slate-400 text-xs">Customer Service (WhatsApp)</span>
                        </div>
                     </a>
                  </li>
                  <li>
                     <a 
                       href={`mailto:${settings.email}`} 
                       className="flex items-start gap-3 hover:text-dstech-red transition-colors"
                     >
                        <Mail className="w-5 h-5 text-dstech-red flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-800">{settings.email}</span>
                           <span className="text-slate-400 text-xs">Official Support Email</span>
                        </div>
                     </a>
                  </li>
               </ul>
            </div>
            
            {/* Col 3: Address & Coverage */}
            <div className="space-y-4 sm:space-y-6">
               <h4 className="text-dstech-blue font-black tracking-wider text-xs uppercase">ALAMAT &amp; WILAYAH LAYANAN</h4>
               <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  <MapPin className="w-5 h-5 text-dstech-red flex-shrink-0 mt-0.5" />
                  <span>
                     {settings.address}
                  </span>
               </div>

               <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider">
                     <Globe className="w-3.5 h-3.5 text-dstech-blue" />
                     <span>Cakupan Layanan:</span>
                     <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Nasional</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                     Banten (Cilegon, Serang, Tangerang), Jabodetabek, dan <strong className="text-slate-800 font-bold">Seluruh Wilayah Indonesia</strong>.
                  </p>
               </div>

               <div className="pt-2 text-xs font-bold text-slate-400">
                  {settings.companyName} &bull; Est. 2017
               </div>
            </div>

            {/* Col 4: Mobile App Download */}
            <div className="space-y-4 p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-2xl border border-slate-700/70 shadow-xl relative overflow-hidden group">
               <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                     Mobile App
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">v1.0.0 &bull; 6.2 MB</span>
               </div>
               <div>
                  <h4 className="text-white font-black text-sm tracking-tight flex items-center gap-2">
                     <Smartphone className="w-4 h-4 text-emerald-400" />
                     DSTech Smart Android
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                     Unduh aplikasi resmi untuk akses cepat operasional, kuitansi, faktur, dan manajemen langsung dari HP Anda.
                  </p>
               </div>
               <a 
                 href="/dstech-smart-app.apk"
                 download="dstech-smart-app.apk"
                 className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
               >
                  <Download className="w-4 h-4" />
                  <span>Download APK Android</span>
               </a>
            </div>
         </div>
         
         {/* Bottom Footer Bar */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-slate-500 text-xs font-medium">
              &copy; {new Date().getFullYear()} {settings.companyName}. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 sm:gap-6 text-xs font-bold text-slate-500">
               <a 
                 href="/dstech-smart-app.apk" 
                 download="dstech-smart-app.apk" 
                 className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold transition-colors bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
               >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download APK (6.2 MB)</span>
               </a>
               <a href="/admin" className="hover:text-dstech-blue transition-colors">Admin Portal</a>
               <a href="/shop" className="hover:text-dstech-red transition-colors">E-Store</a>
               <a href="/affiliate" className="hover:text-dstech-blue transition-colors">Partner</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
