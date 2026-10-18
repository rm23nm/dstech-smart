"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, Phone, Banknote, ArrowRight, ShieldCheck, MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Cilegon')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg('Mohon lengkapi seluruh formulir pendaftaran.')
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Format email tidak valid.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Daftarkan ke API partners
      const resPartner = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          city: city.trim(),
          tier: 'Silver Agent',
          status: 'ACTIVE',
        }),
      })

      const dataPartner = await resPartner.json()

      if (!resPartner.ok || !dataPartner.success) {
        throw new Error(dataPartner.message || 'Gagal mendaftarkan akun mitra.')
      }

      // 2. Daftarkan juga ke API users (role: AFFILIATE)
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            role: 'AFFILIATE',
            status: 'ACTIVE',
          }),
        })
      } catch (userErr) {
        console.warn('Sync to users non-blocking warning:', userErr)
      }

      const registeredPartner = dataPartner.data
      const refCode = registeredPartner?.referralCode || `DSTECH-${Math.floor(1000 + Math.random() * 9000)}`

      // 3. Simpan sesi login mitra di localStorage
      if (typeof window !== 'undefined') {
        const partnerSession = {
          isLoggedIn: true,
          role: 'PARTNER',
          name: name.trim(),
          email: email.trim().toLowerCase(),
          refCode: refCode,
          phone: phone.trim(),
          city: city.trim(),
          loginTime: new Date().toISOString(),
        }
        localStorage.setItem('dstech_partner_auth', JSON.stringify(partnerSession))
        localStorage.setItem('dstech_auth_token', `dstech_tok_${Date.now()}`)
      }

      setSuccessMsg(`Pendaftaran berhasil! Kode Referral Anda: ${refCode}. Mengalihkan ke dashboard...`)

      setTimeout(() => {
        router.push('/affiliate')
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kendala saat mendaftar. Silakan coba kembali.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dstech-dark text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-dstech-accent/10 rounded-full blur-[120px] -z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-dstech-accent/5 rounded-full blur-[120px] -z-0"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12">
        
        {/* Left Side: Info */}
        <div className="space-y-10">
          <div className="space-y-4">
             <Link href="/" className="inline-block">
               <Image src="/logo.png" alt="Logo" width={140} height={40} className="brightness-200 mb-8" />
             </Link>
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
               Jadi Partner <br />
               <span className="text-dstech-accent">Masa Depan.</span>
             </h1>
             <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-md">
               Bergabunglah dengan jaringan profesional PT. DSTech Smart Perkasa dan mulai hasilkan komisi nyata dari setiap solusi teknologi yang Anda rekomendasikan.
             </p>
          </div>

          <div className="space-y-6">
             <div className="flex items-start gap-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-dstech-accent/10 flex items-center justify-center text-dstech-accent shrink-0">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-1">PROSES INSTAN</h4>
                   <p className="text-sm text-zinc-500 font-medium">Pendaftaran instan, kode referral otomatis aktif dalam hitungan detik.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-dstech-accent/10 flex items-center justify-center text-dstech-accent shrink-0">
                   <Banknote className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-1">KOMISI TERTINGGI</h4>
                   <p className="text-sm text-zinc-500 font-medium">Dapatkan komisi hingga 10% - 20% untuk paket Security System & IT.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-1 rounded-[42px] bg-gradient-to-br from-white/10 to-transparent">
           <div className="bg-zinc-900/80 backdrop-blur-xl p-8 md:p-12 rounded-[40px] shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                 <h2 className="text-2xl font-black tracking-tight">Form Pendaftaran Mitra</h2>
                 <p className="text-sm text-zinc-500 font-medium">Lengkapi data diri Anda untuk membuat akun agen resmi.</p>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleRegister}>
                 <div className="space-y-3">
                    <div className="relative group">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-dstech-accent transition-colors" />
                       <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama Lengkap" 
                        required
                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-dstech-accent/50 focus:bg-dstech-accent/5 transition-all outline-none"
                       />
                    </div>
                    
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-dstech-accent transition-colors" />
                       <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Alamat Email" 
                        required
                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-dstech-accent/50 focus:bg-dstech-accent/5 transition-all outline-none"
                       />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative group">
                         <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-dstech-accent transition-colors" />
                         <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Nomor WhatsApp" 
                          required
                          className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-dstech-accent/50 focus:bg-dstech-accent/5 transition-all outline-none"
                         />
                      </div>

                      <div className="relative group">
                         <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-dstech-accent transition-colors" />
                         <input 
                          type="text" 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Kota / Domisili" 
                          className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-dstech-accent/50 focus:bg-dstech-accent/5 transition-all outline-none"
                         />
                      </div>
                    </div>

                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-dstech-accent transition-colors" />
                       <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Kata Sandi Akun" 
                        required
                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-dstech-accent/50 focus:bg-dstech-accent/5 transition-all outline-none"
                       />
                    </div>
                 </div>

                 <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 rounded-2xl bg-dstech-accent hover:bg-cyan-300 text-black font-black text-base flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,229,255,0.25)] disabled:opacity-50"
                    >
                       {isSubmitting ? (
                         <>
                           <Loader2 className="w-5 h-5 animate-spin" />
                           Mendaftarkan Akun...
                         </>
                       ) : (
                         <>
                           Daftar Sekarang <ArrowRight className="w-5 h-5" />
                         </>
                       )}
                    </button>
                    <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-4">
                       Dengan mendaftar, Anda menyetujui program kemitraan resmi PT. DSTech Smart Perkasa
                    </p>
                 </div>
              </form>

              <div className="text-center pt-4 border-t border-white/5">
                 <p className="text-zinc-500 text-sm font-bold">
                   Sudah punya akun? <Link href="/login?role=partner" className="text-dstech-accent hover:underline">Masuk di sini</Link>
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
