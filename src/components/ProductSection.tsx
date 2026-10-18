"use client"

import React from 'react'
import { ShoppingCart, ArrowRight, Zap, Target, Layers, Globe, Shield, Cpu, Monitor, PhoneCall, Layout, Briefcase, Lock, Wifi, Users } from "lucide-react"

const FULL_PRODUCT_LIST = [
  { 
    id: 'cctv', 
    name: 'CCTV & Security System', 
    type: 'ONETIME', 
    tag: 'Keamanan',
    icon: <Shield className="w-6 h-6" />,
    desc: 'Pengadaan & Instalasi CCTV Resolusi Tinggi (Analogue/IP) untuk Corporate & Industrial.',
    color: 'text-dstech-red',
    bg: 'bg-dstech-red/10'
  },
  { 
    id: 'smarthome', 
    name: 'Rumah Pintar (Smart Home)', 
    type: 'ONETIME', 
    tag: 'Hunian Cerdas',
    icon: <Cpu className="w-6 h-6" />,
    desc: 'Integrasi Lampu, Saklar, & Audio cerdas yang dikontrol via Smartphone (Google Nest compatible).',
    color: 'text-dstech-blue',
    bg: 'bg-dstech-blue/10'
  },
  { 
    id: 'doorlock', 
    name: 'Kunci Digital & Access Control', 
    type: 'ONETIME', 
    tag: 'Security',
    icon: <Lock className="w-6 h-6" />,
    desc: 'Smart Doorlock dengan Fingerprint, RFID, & Bluetooth untuk efisiensi akses gedung.',
    color: 'text-dstech-red',
    bg: 'bg-dstech-red/10'
  },
  { 
    id: 'networking', 
    name: 'Jaringan & Fiber Optik', 
    type: 'ONETIME', 
    tag: 'IT Infra',
    icon: <Wifi className="w-6 h-6" />,
    desc: 'Instalasi Network Kabel & Wireless, Splicing Fiber Optik, serta pengadaan Bandwidth.',
    color: 'text-dstech-blue',
    bg: 'bg-dstech-blue/10'
  },
  { 
    id: 'pabx', 
    name: 'Sistem Telepon PABX', 
    type: 'ONETIME', 
    tag: 'Komunikasi',
    icon: <PhoneCall className="w-6 h-6" />,
    desc: 'Solusi komunikasi internal kantor (PBX) untuk integrasi sambungan telepon kabel.',
    color: 'text-dstech-red',
    bg: 'bg-dstech-red/10'
  },
  { 
    id: 'attendance', 
    name: 'Mesin Absensi (Fingerprint)', 
    type: 'ONETIME', 
    tag: 'Keamanan',
    icon: <Zap className="w-6 h-6" />,
    desc: 'Sistem absensi sidik jari & wajah untuk manajemen tenaga kerja yang akurat.',
    color: 'text-dstech-blue',
    bg: 'bg-dstech-blue/10'
  },
  { 
    id: 'visual', 
    name: 'Videotron & Running Text', 
    type: 'ONETIME', 
    tag: 'Visual Ads',
    icon: <Monitor className="w-6 h-6" />,
    desc: 'Pengadaan Videotron (Indoor/Outdoor), Video Wall, dan LED Running Text.',
    color: 'text-dstech-red',
    bg: 'bg-dstech-red/10'
  },
  { 
    id: 'parking', 
    name: 'Sistem Perparkiran (Barrier Gate)', 
    type: 'ONETIME', 
    tag: 'Parking',
    icon: <Target className="w-6 h-6" />,
    desc: 'Palang otomatis dengan sistem parkir mandiri & integrasi kartu akses.',
    color: 'text-dstech-blue',
    bg: 'bg-dstech-blue/10'
  },
  { 
    id: 'website', 
    name: 'Website & Digital Suite', 
    type: 'RECURRING', 
    tag: 'Software',
    icon: <Globe className="w-6 h-6" />,
    desc: 'Pembuatan Website Bisnis, Hosting, Domain, & Email Bisnis Terkelola.',
    color: 'text-dstech-red',
    bg: 'bg-dstech-red/10'
  },
  { 
    id: 'pos', 
    name: 'Software POS (Program Kasir)', 
    type: 'RECURRING', 
    tag: 'Software',
    icon: <Layout className="w-6 h-6" />,
    desc: 'Aplikasi kasir terintegrasi stok & laporan keuangan untuk UKM maupun Retail.',
    color: 'text-dstech-blue',
    bg: 'bg-dstech-blue/10'
  },
  { 
    id: 'property', 
    name: 'Agent Penjualan Properti', 
    type: 'SERVICE', 
    tag: 'Real Estate',
    icon: <Briefcase className="w-6 h-6" />,
    desc: 'Kerjasama pemasaran properti perumahan dengan konsep Smarthome System.',
    color: 'text-dstech-red',
    bg: 'bg-dstech-red/10'
  },
  { 
    id: 'manpower', 
    name: 'Penyediaan Tenaga Kerja', 
    type: 'SERVICE', 
    tag: 'HR Solution',
    icon: <Users className="w-6 h-6" />,
    desc: 'Suplai tenaga kerja (Manpower Supply) profesional untuk kebutuhan operasional.',
    color: 'text-dstech-blue',
    bg: 'bg-dstech-blue/10'
  },
]

export default function ProductSection() {
  return (
    <section id="produk" className="py-16 sm:py-24 md:py-32 bg-slate-50 w-full border-y border-slate-200 relative overflow-hidden">
      {/* Decorative Brand Colors */}
      <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-dstech-red/5 blur-[100px] rounded-full pointer-events-none -mr-48"></div>
      <div className="absolute bottom-0 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-dstech-blue/5 blur-[100px] rounded-full pointer-events-none -ml-48"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 sm:gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <span className="inline-block px-3.5 py-1 rounded-full bg-dstech-red/10 text-dstech-red font-bold tracking-widest uppercase text-[11px] mb-3">
              ALL SOLUTIONS IN ONE PLACE
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-900 uppercase">
              Katalog <br className="hidden sm:inline" />
              <span className="text-dstech-blue">Layanan Lengkap</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed">
              Dari Keamanan Fisik hingga Infrastruktur Digital, kami menyediakan solusi terintegrasi untuk Bisnis & Hunian Anda.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <a 
              href="/shop" 
              className="h-12 sm:h-14 px-6 sm:px-8 flex items-center gap-2.5 bg-white border-2 border-dstech-red text-dstech-red rounded-2xl font-bold text-sm sm:text-base hover:bg-dstech-red hover:text-white transition-all shadow-md shadow-red-500/10 active:scale-95"
            >
              <ShoppingCart className="w-5 h-5" /> Belanja Sekarang
            </a>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FULL_PRODUCT_LIST.map((prod) => (
            <div 
              key={prod.id} 
              className="group flex flex-col border border-slate-200/80 rounded-3xl p-6 sm:p-8 hover:border-dstech-blue/40 hover:bg-white transition-all duration-300 relative overflow-hidden bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-xl h-full"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                   <div className={`w-14 h-14 rounded-2xl ${prod.bg} ${prod.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm border border-white`}>
                      {prod.icon}
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
                    {prod.tag}
                   </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-3 text-slate-900 leading-snug group-hover:text-dstech-red transition-colors">
                  {prod.name}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm mb-6 font-medium leading-relaxed">
                  {prod.desc}
                </p>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto gap-3">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kategori</span>
                  <span className={`text-xs sm:text-sm font-black ${prod.color}`}>{prod.type}</span>
                </div>
                <a 
                  href="/shop" 
                  className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-dstech-blue transition-colors group/btn shadow-md active:scale-95"
                >
                  <span>Pesan</span> <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

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
                   Dapatkan komisi profesional hingga 20% untuk setiap produk dan jasa yang terjual melalui jaringan Anda.
                 </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto relative z-10">
                 <a 
                   href="/affiliate/register" 
                   className="h-12 sm:h-14 px-6 sm:px-8 flex items-center justify-center rounded-2xl bg-dstech-red hover:bg-red-700 text-white font-bold text-sm sm:text-base transition-all shadow-xl shadow-red-500/30 active:scale-95 text-center"
                 >
                   Daftar Sekarang
                 </a>
                 <a 
                   href="/affiliate" 
                   className="h-12 sm:h-14 px-6 sm:px-8 flex items-center justify-center rounded-2xl border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-sm sm:text-base transition-all text-center"
                 >
                   Portal Mitra
                 </a>
              </div>
           </div>
        </div>
      </div>
    </section>
  )
}
