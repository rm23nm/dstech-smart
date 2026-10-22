"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail, MapPin, Send, MessageCircle, Clock, Globe, CheckCircle2, AlertCircle, Loader2, Navigation, ExternalLink, Smartphone } from 'lucide-react'


export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [service, setService] = useState('CCTV & Security System')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  })

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message })
    setTimeout(() => {
      setToast({ show: false, type: 'success', message: '' })
    }, 4000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !message.trim()) {
      showToast('error', 'Mohon isi nama dan pesan Anda sebelum mengirim.')
      return
    }

    setIsSending(true)

    const waNumber = '6282259494242'
    const waText = `Halo CS PT. DSTech Smart Perkasa,\n\nSaya ingin konsultasi mengenai layanan: *${service}*\n\n*Nama:* ${name.trim()}\n*Email:* ${email.trim() || '-'}\n*Kebutuhan:*\n${message.trim()}\n\nMohon info estimasi penawaran dan jadwal konsultasinya. Terima kasih.`

    setTimeout(() => {
      setIsSending(false)
      showToast('success', 'Membuka WhatsApp resmi CS DSTech Smart...')
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`, '_blank')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900 text-white shadow-2xl animate-bounce">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 md:px-12 w-full max-w-7xl mx-auto border-b border-slate-100 bg-white/95 backdrop-blur-xl sticky top-0 z-40">
        <Link href="/" className="relative w-36 h-10 block">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
        </Link>
        <div className="hidden md:flex items-center gap-8 font-black text-xs uppercase tracking-widest text-slate-500">
           <Link href="/" className="hover:text-dstech-red transition-colors">Beranda</Link>
           <Link href="/shop" className="hover:text-dstech-red transition-colors">Toko Online</Link>
           <Link href="/affiliate" className="hover:text-dstech-red transition-colors">Program Partner</Link>
           <Link href="/login" className="hover:text-dstech-blue transition-colors">Portal Login</Link>
        </div>
        <a 
          href="https://wa.me/6282259494242?text=Halo%20CS%20DSTech%20Smart%2C%20saya%20butuh%20bantuan%20cepat." 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-dstech-blue hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
           Fast Support
        </a>
      </nav>

      {/* Header */}
      <header className="py-20 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-dstech-red/5 blur-[120px] rounded-full"></div>
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 leading-none">HUBUNGI <span className="text-dstech-red">KAMI</span></h1>
            <p className="text-lg md:text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
               Siap membantu transformasi digital dan keamanan bisnis Anda. Tim ahli PT. DSTech Smart Perkasa siap melayani konsultasi dan instalasi.
            </p>
         </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
         {/* Contact Form */}
         <div className="space-y-8">
            <div>
               <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Kirim Pesan Konsultasi</h2>
               <p className="text-slate-500 font-bold text-sm">Lengkapi formulir di bawah ini, pesan akan langsung diteruskan ke WhatsApp CS resmi kami.</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Nama Lengkap *</label>
                     <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama Anda" 
                      required
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-dstech-blue transition-all font-bold placeholder:text-slate-300 outline-none text-sm" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Bisnis</label>
                     <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@office.com" 
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-dstech-blue transition-all font-bold placeholder:text-slate-300 outline-none text-sm" 
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Layanan Yang Diminati</label>
                  <select 
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-dstech-blue transition-all font-bold text-slate-700 outline-none text-sm"
                  >
                     <option value="CCTV & Security System">CCTV & Security System</option>
                     <option value="Networking & Fiber Optik">Networking & Fiber Optik</option>
                     <option value="Smart Home & Automation">Smart Home & Automation</option>
                     <option value="Smart Doorlock & Access Control">Smart Doorlock & Access Control</option>
                     <option value="Sistem Telepon PABX">Sistem Telepon PABX</option>
                     <option value="Software & IT Solutions">Software & IT Solutions</option>
                     <option value="Kemitraan & Lainnya">Kemitraan & Lainnya</option>
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Pesan / Detail Kebutuhan *</label>
                  <textarea 
                    rows={5} 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan lokasi pengerjaan, estimasi jumlah titik atau perangkat yang dibutuhkan..." 
                    required
                    className="w-full p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 focus:border-dstech-blue transition-all font-bold placeholder:text-slate-300 outline-none resize-none text-sm"
                  ></textarea>
               </div>

               <button 
                type="submit" 
                disabled={isSending}
                className="h-16 w-full rounded-2xl bg-dstech-red hover:bg-red-600 text-white font-black text-base flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-red-500/30 disabled:opacity-50"
               >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyiapkan Pesan WhatsApp...
                    </>
                  ) : (
                    <>
                      Kirim ke WhatsApp CS <Send className="w-5 h-5" />
                    </>
                  )}
               </button>
            </form>
         </div>

         {/* Contact Info & Map */}
         <div className="space-y-12">
            <div className="grid grid-cols-1 gap-8">
               <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-dstech-blue/10 text-dstech-blue flex items-center justify-center flex-shrink-0 group-hover:bg-dstech-blue group-hover:text-white transition-all shadow-sm">
                     <Phone className="w-7 h-7" />
                  </div>
                  <div>
                     <h4 className="text-base font-black text-slate-900 mb-1 uppercase tracking-tight">Telepon / WhatsApp</h4>
                     <p className="text-lg text-slate-700 font-bold">0822-5949-4242</p>
                     <p className="text-slate-400 font-medium text-xs">Tersedia Senin - Sabtu (08.00 - 17.00 WIB)</p>
                  </div>
               </div>

               <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-dstech-red/10 text-dstech-red flex items-center justify-center flex-shrink-0 group-hover:bg-dstech-red group-hover:text-white transition-all shadow-sm">
                     <Mail className="w-7 h-7" />
                  </div>
                  <div>
                     <h4 className="text-base font-black text-slate-900 mb-1 uppercase tracking-tight">Email Support</h4>
                     <p className="text-lg text-slate-700 font-bold">cs@dstechsmart.com</p>
                     <p className="text-slate-400 font-medium text-xs">Balasan maksimal dalam 24 jam kerja.</p>
                  </div>
               </div>

               <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 group-hover:bg-dstech-blue group-hover:text-white transition-all shadow-sm">
                     <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                     <h4 className="text-base font-black text-slate-900 mb-1 uppercase tracking-tight">Alamat Kantor</h4>
                     <p className="text-sm text-slate-600 font-bold leading-relaxed">
                        PERUM BUKIT CILEGON ASRI BLOK DB NO. 19, KEL. BAGENDUNG, KEC. CILEGON, KOTA CILEGON - BANTEN
                     </p>
                  </div>
               </div>
            </div>

            {/* Google Map Embed & Lokasi Kantor */}
            <div className="space-y-4">
               <div className="aspect-video w-full rounded-3xl bg-slate-100 border-2 border-slate-200 relative overflow-hidden shadow-lg">
                  <iframe 
                    src="https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1sPT.+DSTech+Smart+Perkasa+Perumahan+Bukit+Cilegon+Asri+Bagendung+Cilegon!6i15!3m1!1sid!5m1!1sid"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Peta Lokasi Kantor PT. DSTech Smart Perkasa"
                    className="w-full h-full object-cover"
                  ></iframe>
               </div>

               {/* Quick Info & Tombol Buka di Google Maps */}
               <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                     <Navigation className="w-4 h-4 text-dstech-blue shrink-0" />
                     <div>
                        <p className="font-bold text-slate-900">Koordinat Peta Kantor Pusat</p>
                        <p className="text-[11px] text-slate-500 font-mono">Perumahan Bukit Cilegon Asri Blok DB No. 19, Bagendung, Cilegon</p>
                     </div>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Perumahan+Bukit+Cilegon+Asri+Blok+DB+No.+19+Bagendung+Cilegon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                     <span>Buka Petunjuk Arah (Maps)</span>
                     <ExternalLink className="w-3.5 h-3.5" />
                  </a>
               </div>
            </div>
         </div>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-center">
         <Image src="/logo.png" alt="Logo" width={140} height={40} className="mx-auto brightness-200 opacity-60 mb-5" />
         <div className="flex justify-center mb-6">
            <a 
              href="/dstech-smart-app.apk" 
              download="dstech-smart-app.apk"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 px-4 py-2 rounded-xl transition-all shadow-sm"
            >
               <Smartphone className="w-4 h-4 text-emerald-400" />
               <span>Download Aplikasi Android (6.2 MB)</span>
            </a>
         </div>
         <p className="text-white/40 text-xs font-bold tracking-wider">
           &copy; {new Date().getFullYear()} PT. DSTech Smart Perkasa. Seluruh Hak Cipta Dilindungi.
         </p>
      </footer>
    </div>
  )
}

