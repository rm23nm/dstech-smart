"use client"

import React from 'react'
import Image from 'next/image'
import { User, Mail, Lock, Phone, Banknote, ArrowRight, ShieldCheck } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-dstech-dark text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-dstech-accent/10 rounded-full blur-[120px] -z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-dstech-accent/5 rounded-full blur-[120px] -z-0"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Info */}
        <div className="space-y-10">
          <div className="space-y-4">
             <Image src="/logo.png" alt="Logo" width={140} height={40} className="brightness-200 mb-8" />
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
               Jadi Partner <br />
               <span className="text-dstech-accent">Masa Depan.</span>
             </h1>
             <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-md">
               Bergabunglah dengan jaringan profesional DSTech Smart dan mulai hasilkan pendapatan dari setiap solusi teknologi yang Anda tawarkan.
             </p>
          </div>

          <div className="space-y-6">
             <div className="flex items-start gap-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-dstech-accent/10 flex items-center justify-center text-dstech-accent shrink-0">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-1">PROSES CEPAT</h4>
                   <p className="text-sm text-zinc-500 font-medium">Pendaftaran instan, mulai hasilkan link Anda dalam hitungan menit.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-dstech-accent/10 flex items-center justify-center text-dstech-accent shrink-0">
                   <Banknote className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-1">KOMISI TERTINGGI</h4>
                   <p className="text-sm text-zinc-500 font-medium">Dapatkan komisi hingga 20% untuk paket Security System & IT.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-1 rounded-[42px] bg-gradient-to-br from-white/10 to-transparent">
           <div className="bg-zinc-900/80 backdrop-blur-xl p-10 md:p-12 rounded-[40px] shadow-2xl space-y-8">
              <div className="text-center space-y-2">
                 <h2 className="text-2xl font-black tracking-tight">Form Pendaftaran</h2>
                 <p className="text-sm text-zinc-500 font-medium">Lengkapi data diri Anda untuk membuat akun agent.</p>
              </div>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                 <div className="space-y-4">
                    <div className="relative group">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-dstech-accent transition-colors" />
                       <input 
                        type="text" 
                        placeholder="Nama Lengkap" 
                        className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-dstech-accent/50 focus:bg-dstech-accent/5 transition-all outline-none"
                       />
                    </div>
                    
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-dstech-accent transition-colors" />
                       <input 
                        type="email" 
                        placeholder="Alamat Email" 
                        className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-dstech-accent/50 focus:bg-dstech-accent/5 transition-all outline-none"
                       />
                    </div>

                    <div className="relative group">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-dstech-accent transition-colors" />
                       <input 
                        type="tel" 
                        placeholder="Nomor WhatsApp" 
                        className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-dstech-accent/50 focus:bg-dstech-accent/5 transition-all outline-none"
                       />
                    </div>

                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-dstech-accent transition-colors" />
                       <input 
                        type="password" 
                        placeholder="Kata Sandi" 
                        className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-dstech-accent/50 focus:bg-dstech-accent/5 transition-all outline-none"
                       />
                    </div>
                 </div>

                 <div className="pt-4">
                    <button className="w-full h-16 rounded-2xl bg-dstech-accent text-black font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(0,229,255,0.2)]">
                       Daftar Sekarang <ArrowRight className="w-6 h-6" />
                    </button>
                    <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-6">
                       Dengan mendaftar, Anda menyetujui <span className="text-zinc-400 underline cursor-pointer">Syarat & Ketentuan</span>
                    </p>
                 </div>
              </form>

              <div className="text-center pt-4 border-t border-white/5">
                 <p className="text-zinc-500 text-sm font-bold">Sudah punya akun? <a href="/login" className="text-dstech-accent hover:underline">Masuk di sini</a></p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
