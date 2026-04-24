"use client"

import React from 'react'
import Image from 'next/image'
import { CheckCircle2, Share2, Wallet, Megaphone, ArrowLeft, MoveRight } from 'lucide-react'

export default function LearnMorePage() {
  const steps = [
    {
      title: "1. Daftar & Verifikasi",
      desc: "Buat akun agent Anda secara gratis. Lengkapi profil dan data bank untuk pencairan komisi.",
      icon: <CheckCircle2 className="w-8 h-8 text-dstech-accent" />
    },
    {
      title: "2. Bagikan Link/Produk",
      desc: "Gunakan link referral unik Anda atau tawarkan produk DSTech Smart ke relasi, kantor, atau teman.",
      icon: <Share2 className="w-8 h-8 text-dstech-accent" />
    },
    {
      title: "3. Transaksi Sukses",
      desc: "Ketika client melakukan pembelian dan pembayaran dikonfirmasi, komisi Anda akan langsung tercatat.",
      icon: <Megaphone className="w-8 h-8 text-dstech-accent" />
    },
    {
      title: "4. Cairkan Komisi",
      desc: "Tarik komisi Anda setiap saat setelah melewati batas minimum penarikan langsung ke rekening bank Anda.",
      icon: <Wallet className="w-8 h-8 text-dstech-accent" />
    }
  ]

  return (
    <div className="min-h-screen bg-dstech-dark text-white font-sans selection:bg-dstech-accent selection:text-black">
      {/* Hero Section Page */}
      <header className="py-24 px-6 md:px-12 border-b border-white/5 relative overflow-hidden">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="space-y-6 max-w-2xl text-center md:text-left">
               <a href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-dstech-accent font-bold transition-colors mb-8">
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
               </a>
               <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                  Cara Kerja <br />
                  <span className="text-dstech-accent underline decoration-white/20 underline-offset-8">Program Agent.</span>
               </h1>
               <p className="text-xl text-zinc-400 font-medium leading-relaxed">
                  Kami percaya bahwa setiap koneksi berharga. Bagikan solusi teknologi kami dan nikmati keuntungan yang berkelanjutan bersama DSTech Smart.
               </p>
            </div>
            <div className="w-full max-w-md aspect-video rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center relative group">
               <div className="absolute inset-0 bg-dstech-accent/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-dstech-accent flex items-center justify-center text-black mb-4">
                     <Share2 className="w-10 h-10" />
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest text-zinc-400">Tutorial Video Segera Hadir</span>
               </div>
            </div>
         </div>
      </header>

      {/* Step by Step */}
      <section className="py-32 px-6 md:px-12">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black mb-20 text-center uppercase tracking-widest">4 Langkah Mudah</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {steps.map((step, i) => (
                  <div key={i} className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-dstech-accent/30 transition-all group relative">
                     <div className="mb-8 p-6 inline-block rounded-3xl bg-zinc-900 border border-white/10 group-hover:bg-dstech-accent group-hover:text-black transition-all">
                        {step.icon}
                     </div>
                     <h3 className="text-2xl font-black mb-4 group-hover:text-dstech-accent transition-colors">{step.title}</h3>
                     <p className="text-zinc-500 font-medium leading-relaxed leading-relaxed">{step.desc}</p>
                     <div className="absolute top-10 right-10 text-6xl font-black text-white/[0.03] group-hover:text-dstech-accent/5 transition-colors">0{i+1}</div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Commission Table / Info */}
      <section className="py-32 bg-white/5 px-6 md:px-12">
         <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Berapa Banyak Yang Bisa <br /><span className="text-dstech-accent">Anda Dapatkan?</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
               <div className="p-8 rounded-[32px] bg-zinc-950 border border-white/10">
                  <p className="text-dstech-accent font-black text-sm tracking-widest uppercase mb-4">SECURITY SYSTEM</p>
                  <h4 className="text-3xl font-black mb-2 text-white">10 - 15%</h4>
                  <p className="text-zinc-500 text-sm font-medium">CCTV, Smart Doorlock, Alarm, Barrier Gate.</p>
               </div>
               <div className="p-8 rounded-[32px] bg-zinc-950 border border-white/10">
                  <p className="text-zinc-400 font-black text-sm tracking-widest uppercase mb-4">IT & SOFTWARE</p>
                  <h4 className="text-3xl font-black mb-2 text-white">15 - 20%</h4>
                  <p className="text-zinc-500 text-sm font-medium">Website Bisnis, Hosting, Software POS (Kasir).</p>
               </div>
            </div>
            <p className="text-zinc-500 font-medium italic">"Contoh: Penjualan paket CCTV Rp 10.000.000 = Komisi Rp 1.000.000 - Rp 1.500.000 bersih untuk Anda."</p>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 md:px-12 text-center relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-dstech-accent/10 blur-[120px] rounded-full -z-10"></div>
         <div className="max-w-4xl mx-auto space-y-10">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter">Mulai Langkah Pertama <br />Anda <span className="text-dstech-accent">Hari Ini.</span></h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <a href="/affiliate/register" className="h-20 px-16 flex items-center justify-center rounded-2xl bg-dstech-accent text-black font-black text-xl hover:scale-105 transition-transform shadow-[0_0_50px_rgba(0,229,255,0.3)]">
                  Daftar Sekarang <MoveRight className="ml-3 w-6 h-6" />
               </a>
            </div>
         </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center text-zinc-600 font-bold text-xs tracking-widest uppercase">
         PT. DSTech Smart Perkasa &copy; 2025
      </footer>
    </div>
  )
}
