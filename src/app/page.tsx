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
