"use client"

import React from 'react'
import Image from 'next/image'
import { Phone, Mail, MapPin, Send, MessageCircle, Clock, Globe } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 md:px-12 w-full max-w-7xl mx-auto border-b border-slate-100 bg-white/95 backdrop-blur-xl sticky top-0 z-50">
        <a href="/" className="relative w-32 h-10">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </a>
        <div className="hidden md:flex items-center gap-8 font-black text-xs uppercase tracking-widest text-slate-500">
           <a href="/" className="hover:text-dstech-red">Beranda</a>
           <a href="/shop" className="hover:text-dstech-red">Toko Online</a>
           <a href="/affiliate" className="hover:text-dstech-red">Program Partner</a>
        </div>
        <a href="https://wa.me/6282259494242" className="bg-dstech-blue text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95">
           Fast Support
        </a>
      </nav>

      {/* Header */}
      <header className="py-24 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-dstech-red/5 blur-[120px] rounded-full"></div>
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-none">HUBUNGI <span className="text-dstech-red">KAMI</span></h1>
            <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
               Siap membantu transformasi digital dan keamanan bisnis Anda. Tim ahli kami siap melayani kebutuhan instalasi dan pengadaan perangkat IT.
            </p>
         </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-32">
         {/* Contact Form */}
         <div className="space-y-12">
            <div>
               <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Kirim Pesan</h2>
               <p className="text-slate-500 font-bold">Lengkapi formulir di bawah ini, tim kami akan segera menghubungi Anda.</p>
            </div>
            
            <form className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nama Lengkap</label>
                     <input type="text" placeholder="Masukkan nama Anda" className="w-full h-16 px-8 rounded-3xl bg-slate-50 border-2 border-slate-100 focus:border-dstech-blue transition-all font-bold placeholder:text-slate-300 outline-none" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Bisnis</label>
                     <input type="email" placeholder="example@office.com" className="w-full h-16 px-8 rounded-3xl bg-slate-50 border-2 border-slate-100 focus:border-dstech-blue transition-all font-bold placeholder:text-slate-300 outline-none" />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Layanan Yang Diminati</label>
                  <select className="w-full h-16 px-8 rounded-3xl bg-slate-50 border-2 border-slate-100 focus:border-dstech-blue transition-all font-bold text-slate-500 outline-none appearance-none">
                     <option>Pilih Layanan</option>
                     <option>CCTV & Security System</option>
                     <option>Networking & Jaringan</option>
                     <option>Smart Home Integration</option>
                     <option>Software & Website</option>
                     <option>Lainnya</option>
                  </select>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Pesan Anda</label>
                  <textarea rows={6} placeholder="Tuliskan detail kebutuhan atau pertanyaan Anda..." className="w-full p-8 rounded-[40px] bg-slate-50 border-2 border-slate-100 focus:border-dstech-blue transition-all font-bold placeholder:text-slate-300 outline-none resize-none"></textarea>
               </div>
               <button type="submit" className="h-20 w-full rounded-3xl bg-dstech-red text-white font-black text-xl flex items-center justify-center gap-4 hover:scale-105 transition-transform shadow-2xl shadow-red-500/40">
                  Kirim Sekarang <Send className="w-6 h-6" />
               </button>
            </form>
         </div>

         {/* Contact Info */}
         <div className="space-y-16">
            <div className="grid grid-cols-1 gap-12">
               <div className="flex items-start gap-8 group">
                  <div className="w-16 h-16 rounded-2xl bg-dstech-blue/10 text-dstech-blue flex items-center justify-center flex-shrink-0 group-hover:bg-dstech-blue group-hover:text-white transition-all shadow-sm">
                     <Phone className="w-8 h-8" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Telepon / WhatsApp</h4>
                     <p className="text-lg text-slate-500 font-bold transition-colors">0822-5949-4242</p>
                     <p className="text-slate-400 font-medium text-sm">Tersedia Senin - Sabtu (08.00 - 17.00)</p>
                  </div>
               </div>

               <div className="flex items-start gap-8 group">
                  <div className="w-16 h-16 rounded-2xl bg-dstech-red/10 text-dstech-red flex items-center justify-center flex-shrink-0 group-hover:bg-dstech-red group-hover:text-white transition-all shadow-sm">
                     <Mail className="w-8 h-8" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Email Support</h4>
                     <p className="text-lg text-slate-500 font-bold">cs@dstechsmart.com</p>
                     <p className="text-slate-400 font-medium text-sm">Balasan maksimal dalam 24 jam kerja.</p>
                  </div>
               </div>

               <div className="flex items-start gap-8 group">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 group-hover:bg-dstech-blue group-hover:text-white transition-all shadow-sm">
                     <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Alamat Kantor</h4>
                     <p className="text-lg text-slate-500 font-bold leading-relaxed">
                        PERUM BUKIT CILEGON ASRI BLOK DB NO. 19 KEL. BAGENDUNG KEC. CILEGON - BANTEN
                     </p>
                  </div>
               </div>
            </div>

            {/* Map Placeholder */}
            <div className="aspect-video rounded-[56px] bg-slate-100 border-4 border-slate-50 relative overflow-hidden group shadow-inner">
               <div className="absolute inset-0 flex items-center justify-center text-slate-300 flex-col gap-4">
                  <div className="w-20 h-2 bg-slate-200 rounded-full"></div>
                  <p className="font-black text-[10px] uppercase tracking-widest">Interactive Map Loading...</p>
               </div>
               <div className="absolute inset-x-8 bottom-8 p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-white shadow-xl flex items-center justify-between transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <div className="flex items-center gap-4">
                     <Globe className="w-8 h-8 text-dstech-red" />
                     <p className="text-sm font-black text-slate-900 leading-tight">DSTech Smart Headquarters <br /><span className="text-slate-400 italic">Cilegon, Banten</span></p>
                  </div>
               </div>
            </div>
         </div>
      </main>

      <footer className="py-20 bg-slate-900 text-center">
         <Image src="/logo.png" alt="Logo" width={140} height={40} className="mx-auto brightness-200 opacity-60 mb-8" />
         <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">PT. DSTech Smart Perkasa &copy; 2025</p>
      </footer>
    </div>
  )
}
