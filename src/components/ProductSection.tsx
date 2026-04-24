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
    <section id="produk" className="py-48 bg-slate-50 w-full border-y border-slate-200 relative overflow-hidden">
      {/* Decorative Brand Colors */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-dstech-red/5 blur-[100px] rounded-full -mr-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-dstech-blue/5 blur-[100px] rounded-full -ml-48"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-32 gap-12">
          <div className="max-w-3xl text-center md:text-left">
            <h3 className="text-dstech-red font-black tracking-[0.4em] uppercase text-xs mb-6">ALL SOLUTIONS IN ONE PLACE</h3>
            <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.85] text-slate-900 uppercase">Katalog <br /><span className="text-dstech-blue">Layanan Lengkap</span></h2>
            <p className="mt-8 text-xl text-slate-500 font-bold max-w-xl leading-relaxed">Dari Keamanan Fisik hingga Infrastruktur Digital, kami menyediakan solusi terintegrasi untuk Bisnis Anda.</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="/shop" className="h-24 px-12 flex items-center gap-4 group bg-white border-4 border-dstech-red text-dstech-red rounded-3xl font-black text-2xl hover:bg-dstech-red hover:text-white transition-all shadow-xl shadow-red-500/10 active:scale-95">
              Belanja Sekarang <ShoppingCart className="w-8 h-8" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {FULL_PRODUCT_LIST.map((prod) => (
            <div key={prod.id} className="group flex flex-col border-2 border-slate-100 rounded-[56px] p-12 hover:border-dstech-blue/30 hover:bg-white transition-all duration-500 relative overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-2xl h-full">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-12">
                   <div className={`w-20 h-20 rounded-[30px] ${prod.bg} ${prod.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm border border-white`}>
                      {prod.icon}
                   </div>
                   <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-slate-500 transition-colors">
                    {prod.tag}
                   </span>
                </div>
                <h3 className="text-3xl font-black mb-6 text-slate-900 leading-tight group-hover:text-dstech-red transition-all transform group-hover:translate-x-2">{prod.name}</h3>
                <p className="text-slate-500 text-lg mb-12 font-bold leading-relaxed">{prod.desc}</p>
              </div>
              
              <div className="pt-10 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</span>
                  <span className={`text-lg font-black ${prod.color}`}>{prod.type}</span>
                </div>
                <a href="/shop" className="h-16 px-8 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-dstech-blue transition-colors group/btn shadow-xl shadow-slate-900/20 active:scale-95">
                  Pesan Sekarang <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Affiliate Promotion - More Visible Red/Blue */}
        <div className="mt-40 relative group">
           <div className="absolute -inset-4 bg-gradient-to-r from-dstech-blue via-dstech-red to-dstech-blue rounded-[72px] blur-3xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
           <div className="relative p-16 md:p-32 rounded-[72px] bg-slate-900 flex flex-col lg:flex-row items-center justify-between gap-24 overflow-hidden border-8 border-white/5 shadow-2xl">
              <div className="text-center lg:text-left relative z-10 max-w-3xl">
                 <div className="inline-block px-6 py-2 rounded-full bg-dstech-red text-white text-[11px] font-black tracking-widest uppercase mb-12 shadow-lg shadow-red-500/40 transform rotate-1">BECOME OUR PARTNER</div>
                 <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9] text-white">Bangun Karir Digital <br /><span className="text-dstech-blue italic">Bersama Kami.</span></h2>
                 <p className="text-slate-400 text-xl font-bold leading-relaxed">Dapatkan komisi profesional hingga 20% untuk setiap produk dan jasa yang terjual melalui jaringan Anda.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-8 w-full sm:w-auto relative z-10">
                 <a href="/affiliate/register" className="h-28 px-20 flex items-center justify-center rounded-3xl bg-dstech-red text-white font-black text-2xl hover:scale-110 transition-transform shadow-2xl shadow-red-500/50">Daftar Sekarang</a>
                 <a href="/affiliate" className="h-28 px-16 flex items-center justify-center rounded-3xl border-4 border-white/20 bg-white/5 text-white font-bold text-xl hover:bg-white/10 transition-all">Portal Mitra</a>
              </div>
           </div>
        </div>
      </div>
    </section>
  )
}
