"use client"

import React from 'react'
import Image from 'next/image'
import { ShoppingCart, Heart, Search, Filter, ArrowRight, Zap, Target, Globe, Layers } from 'lucide-react'

const ALL_PRODUCTS = [
  { 
    id: '1', 
    name: 'CCTV Package 4CH HD', 
    category: 'Security', 
    price: 3500000, 
    image: '/portfolio-industrial.png',
    desc: 'Lengkap dengan DVR, HDD 1TB, & Kabel 50m.',
    commission: '10%'
  },
  { 
    id: '2', 
    name: 'Smart Doorlock X-100', 
    category: 'Smart Home', 
    price: 1850000, 
    image: '/portfolio-residential.png',
    desc: 'Fingerprint, RFID, & Bluetooth App control.',
    commission: '15%'
  },
  { 
    id: '3', 
    name: 'Website UMKM Go Digital', 
    category: 'Software', 
    price: 2500000, 
    image: '/portfolio-industrial.png',
    desc: 'Gratis Domain .com + Hosting selama 1 tahun.',
    commission: '20%'
  },
  { 
    id: '4', 
    name: 'Fingerprint Attendance', 
    category: 'Security', 
    price: 1200000, 
    image: '/portfolio-medical.png',
    desc: 'Kapasitas 1000 user, laporan Excel otomatis.',
    commission: '10%'
  },
  { 
    id: '5', 
    name: 'Barrier Gate System', 
    category: 'Parking', 
    price: 8500000, 
    image: '/portfolio-industrial.png',
    desc: 'Sudah termasuk loop detector & remote kontrol.',
    commission: '10%'
  },
  { 
    id: '6', 
    name: 'PABX System 8 Extension', 
    category: 'Communication', 
    price: 4500000, 
    image: '/portfolio-medical.png',
    desc: 'Ideal untuk kantor kecil & ruko bertingkat.',
    commission: '15%'
  }
]

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Header / Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
               <Image src="/logo.png" alt="Logo" width={100} height={30} />
            </a>
            
            <div className="hidden lg:flex items-center gap-10 text-sm font-black uppercase tracking-widest text-slate-500">
               <a href="/" className="hover:text-dstech-red transition-colors">Beranda</a>
               <a href="/shop" className="text-dstech-red">Toko Online</a>
               <a href="/affiliate" className="hover:text-dstech-red transition-colors">Affiliate</a>
            </div>

            <div className="flex items-center gap-6">
               <button className="relative p-2 text-slate-400 hover:text-dstech-red transition-colors">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-dstech-red text-white text-[10px] font-black rounded-full flex items-center justify-center">0</span>
               </button>
               <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <Search className="w-5 h-5" />
               </div>
            </div>
         </div>
      </nav>

      {/* Hero Banner */}
      <header className="py-20 px-6 max-w-7xl mx-auto">
         <div className="relative rounded-[60px] overflow-hidden bg-slate-50 border border-slate-100 p-12 md:p-24 shadow-sm">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,_#0047AB10_0%,_transparent_60%)]"></div>
            <div className="relative z-10 space-y-8 max-w-2xl">
               <div className="inline-block px-4 py-2 rounded-full bg-dstech-red/10 border border-dstech-red/20 text-dstech-red text-xs font-black tracking-widest uppercase">E-STORE DSTECH SMART</div>
               <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-slate-900">Digitalize Your <br /><span className="text-dstech-blue">Future Today.</span></h1>
               <p className="text-xl text-slate-500 font-bold">Katalog perangkat keamanan dan infrastruktur IT cerdas dengan harga kompetitif dan dukungan mitra ahli.</p>
               <button className="h-20 px-12 rounded-2xl bg-dstech-red text-white font-black text-xl hover:scale-105 transition-transform shadow-xl shadow-red-500/20">Lihat Koleksi Terbaru</button>
            </div>
         </div>
      </header>

      {/* Main Shop Area */}
      <main className="max-w-7xl mx-auto px-6 py-20">
         <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 space-y-12">
               <div className="space-y-6">
                  <h4 className="text-xs font-black tracking-[0.3em] uppercase text-slate-400">KATEGORI</h4>
                  <ul className="space-y-4 font-bold text-sm">
                     <li className="flex items-center justify-between text-slate-900 border-l-4 border-dstech-red pl-4">Semua Produk <span className="text-xs text-slate-400">24</span></li>
                     <li className="pl-4 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">Security System <span className="text-xs text-slate-400">12</span></li>
                     <li className="pl-4 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">Smart Home <span className="text-xs text-slate-400">5</span></li>
                     <li className="pl-4 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">Software <span className="text-xs text-slate-400">4</span></li>
                     <li className="pl-4 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">Networking <span className="text-xs text-slate-400">3</span></li>
                  </ul>
               </div>

               <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-dstech-blue uppercase tracking-widest mb-4">AFFILIATE PORTAL</p>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">Dapatkan komisi untuk setiap penjualan melalui link referral Anda.</p>
                  <div className="mt-6 flex items-center gap-2 text-dstech-red font-black text-sm cursor-pointer hover:gap-4 transition-all">
                     Cek Dashboard <ArrowRight className="w-4 h-4" />
                  </div>
               </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1 space-y-12">
               <div className="flex items-center justify-between">
                  <p className="text-slate-500 font-bold tracking-tight">Menampilkan <span className="text-slate-900">6</span> dari 24 Produk</p>
                  <div className="flex items-center gap-4">
                     <button className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase text-slate-900 bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                        <Filter className="w-4 h-4" /> Filter
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ALL_PRODUCTS.map((prod) => (
                    <div key={prod.id} className="group bg-white border border-slate-100 rounded-[48px] overflow-hidden flex flex-col hover:border-dstech-red/20 transition-all duration-500 hover:shadow-2xl shadow-sm h-full">
                       <div className="h-64 relative overflow-hidden bg-slate-100 flex items-center justify-center p-8">
                          <Image src={prod.image} alt={prod.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-105 group-hover:brightness-100" />
                          <div className="absolute top-6 right-6 flex flex-col gap-2">
                             <button className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-sm">
                                <Heart className="w-6 h-6" />
                             </button>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-lg">Detail Produk</button>
                          </div>
                       </div>

                       <div className="p-10 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                             <span className="text-[10px] font-black text-dstech-blue uppercase tracking-widest">{prod.category}</span>
                             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Fee:</span>
                                <span className="text-[10px] font-black text-dstech-red">{prod.commission}</span>
                             </div>
                          </div>
                          <h3 className="text-2xl font-black mb-4 text-slate-900 leading-tight group-hover:text-dstech-red transition-colors">{prod.name}</h3>
                          <p className="text-sm text-slate-500 font-bold mb-8 flex-1">{prod.desc}</p>
                          
                          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                             <p className="text-2xl font-black text-dstech-blue">Rp {prod.price.toLocaleString('id-ID')}</p>
                             <button className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-dstech-red group-hover:text-white group-hover:border-dstech-red transition-all shadow-sm">
                                <ShoppingCart className="w-6 h-6" />
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Pagination Simulation */}
               <div className="pt-20 flex justify-center border-t border-slate-100">
                  <button className="h-16 px-12 rounded-2xl border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 hover:border-slate-300 transition-all">Muat Produk Lainnya</button>
               </div>
            </div>
         </div>
      </main>

      {/* Footer */}
      <footer className="py-24 bg-slate-900 border-t border-slate-800 text-center px-12">
         <Image src="/logo.png" alt="Logo" width={140} height={40} className="mx-auto brightness-200 mb-10 opacity-60" />
         <p className="text-slate-400 text-sm max-w-lg mx-auto font-bold uppercase tracking-widest">
            PT. DSTech Smart Perkasa <br /> <span className="text-slate-600 text-[10px]">Innovating Technology Since 2017</span>
         </p>
      </footer>
    </div>
  )
}
