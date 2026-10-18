"use client"
import React from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

const REAL_PORTFOLIOS = [
  { 
    id: '1', 
    title: 'CCTV System & Networking', 
    client: 'PT. POSCO ENERGY CILEGON',
    description: 'Instalasi sistem keamanan terpadu dan infrastruktur jaringan fiber optik untuk area operasional energi.',
    category: 'Industrial',
    image: '/portfolio-industrial.png' 
  },
  { 
    id: '2', 
    title: 'Smart Home Integration', 
    client: 'Perumahan Cilegon Hills',
    description: 'Implementasi konsep Smart Home System (Smart Lock, Lighting, & Centralized Control) untuk klaster premium.',
    category: 'Residential',
    image: '/portfolio-residential.png' 
  },
  { 
    id: '3', 
    title: 'Access Control & Security', 
    client: 'RS KURNIA CILEGON',
    description: 'Penyediaan sistem akses kontrol pintu (Digital Lock) dan pengadaan perangkat IT pendukung medis.',
    category: 'Public Service',
    image: '/portfolio-medical.png' 
  },
  { 
    id: '4', 
    title: 'CCTV & Maintenance', 
    client: 'Hotel Pesona Merak',
    description: 'Maintenance rutin dan penambahan titik CCTV untuk memastikan keamanan area perhotelan.',
    category: 'Hospitality',
    image: '/portfolio-industrial.png' 
  },
  { 
    id: '5', 
    title: 'Barier Gate System', 
    client: 'Perum Metro Royal Cilegon',
    description: 'Pemasangan palang otomatis (Barier Gate) dengan sistem akses kartu untuk perumahan.',
    category: 'Residential',
    image: '/portfolio-residential.png' 
  },
  { 
    id: '6', 
    title: 'IT Infrastructure', 
    client: 'Krakatau Sarana Prima',
    description: 'Pembangunan infrastruktur IT dan pengadaan komputer profesional untuk operasional kantor.',
    category: 'Corporate',
    image: '/portfolio-industrial.png' 
  }
]

export default function PortfolioSection() {
  return (
    <section id="portofolio" className="py-16 sm:py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <span className="inline-block px-3.5 py-1 rounded-full bg-dstech-blue/10 text-dstech-blue font-bold tracking-widest uppercase text-[11px] mb-3">
              JEJAK LANGKAH & PENGALAMAN
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-900 mb-3">
              PROYEK <span className="text-dstech-blue">TERPILIH</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base md:text-lg font-medium">
              Dedikasi PT. DSTech Smart Perkasa dalam membangun infrastruktur teknologi andal di berbagai sektor.
            </p>
          </div>
          <div className="hidden lg:block">
             <div className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm text-center">
                <p className="text-3xl font-black text-dstech-blue mb-0.5">500+</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Selesai</p>
             </div>
          </div>
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {REAL_PORTFOLIOS.map((item) => (
            <div 
              key={item.id} 
              className="group flex flex-col h-full bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:border-dstech-red/30 transition-all duration-300 hover:shadow-xl shadow-sm"
            >
              <div className="h-52 sm:h-60 w-full overflow-hidden relative bg-slate-100">
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 left-4">
                   <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-slate-100 shadow-sm text-[10px] font-bold uppercase tracking-wider text-dstech-red">
                      {item.category}
                   </span>
                </div>
              </div>
              <div className="p-6 sm:p-7 flex-1 flex flex-col">
                <p className="text-dstech-blue font-bold text-[10px] tracking-widest uppercase mb-2">{item.client}</p>
                <h3 className="text-lg sm:text-xl font-black mb-2.5 text-slate-900 leading-snug group-hover:text-dstech-red transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium text-xs sm:text-sm mb-6 flex-1">
                  {item.description}
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                   <a 
                     href="https://wa.me/6282259494242"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider hover:text-dstech-red transition-colors"
                   >
                      <span>Konsultasi Proyek</span> <ExternalLink className="w-3.5 h-3.5" />
                   </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Coverage & Info Bar */}
        <div className="mt-16 sm:mt-20 p-6 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center md:text-left leading-relaxed">
              <div className="space-y-2">
                 <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">Wilayah Layanan</h4>
                 <p className="text-slate-600 text-xs sm:text-sm font-medium">Banten (Cilegon, Serang, Merak, Pandeglang) & Area Jabodetabek.</p>
              </div>
              <div className="space-y-2 border-slate-200 md:border-x px-0 md:px-8">
                 <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">Sektor Utama</h4>
                 <p className="text-slate-600 text-xs sm:text-sm font-medium">Industrial, Medis, Pendidikan, Properti Hunian & Perkantoran.</p>
              </div>
              <div className="space-y-2">
                 <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">Pengalaman Sejak 2017</h4>
                 <p className="text-slate-600 text-xs sm:text-sm font-medium">Melayani Masyarakat, Pemerintahan, BUMN, & Swasta dengan standar profesional.</p>
              </div>
           </div>
        </div>
      </div>
    </section>
  )
}
