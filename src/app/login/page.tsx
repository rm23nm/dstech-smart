"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Shield, Users, Briefcase, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE' | 'PARTNER'>('PARTNER')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated redirection based on role
    if (role === 'ADMIN') router.push('/admin')
    else if (role === 'EMPLOYEE') router.push('/employee')
    else router.push('/affiliate')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Side: Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-dstech-blue relative flex-col justify-between p-20 overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_#e31e2430_0%,_transparent_50%)]"></div>
         <div className="relative z-10">
            <div className="w-48 h-16 relative brightness-200">
               <Image src="/logo.png" alt="DSTech Logo" fill className="object-contain" />
            </div>
         </div>

         <div className="relative z-10 space-y-10">
            <h1 className="text-7xl font-black text-white leading-none tracking-tighter">
               Digital Command <br /> <span className="text-white/60">Center.</span>
            </h1>
            <p className="text-xl text-white/50 font-bold max-w-lg leading-relaxed">
               Akses terpusat untuk Manajemen Inventaris, Jaringan Kemitraan, dan Kendali Operasional PT. DSTech Smart Perkasa.
            </p>
            <div className="space-y-6 pt-10 border-t border-white/10">
               {[
                  "Enkripsi Data 256-bit",
                  "Monitoring Transaksi Real-time",
                  "Integrasi API & Cloud System"
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-white font-black text-sm uppercase tracking-widest">
                     <CheckCircle2 className="w-5 h-5 text-dstech-red" /> {item}
                  </div>
               ))}
            </div>
         </div>

         <div className="relative z-10 text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">
            &copy; 2025 PT. DSTech Smart Perkasa
         </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 bg-white p-6 md:p-20 flex flex-col justify-center items-center relative">
         <div className="w-full max-w-md space-y-12">
            <div className="text-center lg:text-left">
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Selamat Datang</h2>
               <p className="text-slate-400 font-bold mt-2">Masuk ke Portal sesuai peran Anda.</p>
            </div>

            {/* Role Selector Tabs */}
            <div className="grid grid-cols-3 gap-3 p-2 bg-slate-100 rounded-[32px]">
               <button 
                  onClick={() => setRole('PARTNER')}
                  className={`py-4 rounded-[24px] flex flex-col items-center gap-2 transition-all ${role === 'PARTNER' ? 'bg-white text-dstech-blue shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  <Users className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Mitra</span>
               </button>
               <button 
                  onClick={() => setRole('EMPLOYEE')}
                  className={`py-4 rounded-[24px] flex flex-col items-center gap-2 transition-all ${role === 'EMPLOYEE' ? 'bg-white text-dstech-red shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  <Briefcase className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Karyawan</span>
               </button>
               <button 
                  onClick={() => setRole('ADMIN')}
                  className={`py-4 rounded-[24px] flex flex-col items-center gap-2 transition-all ${role === 'ADMIN' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  <Shield className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Admin</span>
               </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Email / Username</label>
                     <div className="relative">
                        <input 
                           type="text" 
                           placeholder="johndoe@office.com" 
                           className="w-full h-16 pl-8 pr-6 rounded-3xl bg-slate-50 border-2 border-slate-100 focus:border-dstech-blue transition-all font-bold outline-none"
                           required
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Password</label>
                     <div className="relative">
                        <input 
                           type="password" 
                           placeholder="••••••••" 
                           className="w-full h-16 pl-8 pr-6 rounded-3xl bg-slate-50 border-2 border-slate-100 focus:border-dstech-blue transition-all font-bold outline-none"
                           required
                        />
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between px-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                     <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 text-dstech-blue focus:ring-0" />
                     <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Ingat Saya</span>
                  </label>
                  <a href="#" className="text-sm font-black text-dstech-red hover:underline">Lupa Password?</a>
               </div>

               <button 
                  type="submit" 
                  className={`h-20 w-full rounded-full flex items-center justify-center gap-4 text-white font-black text-xl transition-all hover:scale-105 shadow-2xl active:translate-y-1 ${
                     role === 'ADMIN' ? 'bg-slate-900 shadow-slate-900/40' : 
                     role === 'EMPLOYEE' ? 'bg-dstech-red shadow-red-500/40' : 
                     'bg-dstech-blue shadow-blue-500/40'
                  }`}
               >
                  Masuk Portal <ArrowRight className="w-6 h-6" />
               </button>
            </form>

            <div className="mt-20 pt-10 border-t border-slate-100 text-center">
               <p className="text-sm text-slate-400 font-bold">Butuh bantuan akses? <a href="/contact" className="text-dstech-blue hover:underline">Hubungi Tim IT</a></p>
            </div>
         </div>
      </div>
    </div>
  )
}
