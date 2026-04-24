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
    <section id="portofolio" className="py-40 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <h3 className="text-dstech-blue font-black tracking-[0.4em] uppercase text-xs mb-4 text-dstech-red">JEJAK LANGKAH</h3>
            <h2 className="text-4xl md:text-[80px] font-black tracking-tighter leading-[1.1] mb-6 text-slate-900">PROYEK <span className="text-slate-200">TERPILIH</span></h2>
            <p className="text-slate-500 max-w-lg text-lg font-bold">Dedikasi DSTech Smart dalam membangun infrastruktur teknologi di berbagai sektor.</p>
          </div>
          <div className="hidden lg:block">
             <div className="px-8 py-6 rounded-[32px] bg-slate-50 border border-slate-100 shadow-sm">
                <p className="text-4xl font-black text-dstech-blue mb-1">500+</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Selesai</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {REAL_PORTFOLIOS.map((item) => (
            <div key={item.id} className="group flex flex-col h-full bg-white border border-slate-100 rounded-[44px] overflow-hidden hover:border-dstech-red/20 transition-all duration-500 hover:shadow-2xl shadow-sm">
              <div className="h-72 w-full overflow-hidden relative">
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out grayscale group-hover:grayscale-0"
                />
                <div className="absolute top-8 left-8">
                   <span className="px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-dstech-red">
                      {item.category}
                   </span>
                </div>
              </div>
              <div className="p-10 flex-1 flex flex-col">
                <p className="text-dstech-blue font-black text-[10px] tracking-widest uppercase mb-4">{item.client}</p>
                <h3 className="text-2xl font-black mb-4 text-slate-900 leading-tight group-hover:text-dstech-red transition-colors">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed font-bold text-sm mb-10 flex-1">
                  {item.description}
                </p>
                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                   <button className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest hover:text-dstech-red transition-colors">
                      Lihat Detail <ExternalLink className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-32 p-12 rounded-[48px] bg-slate-50 border border-slate-100 shadow-inner">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left leading-relaxed">
              <div className="space-y-4">
                 <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs">Wilayah Layanan</h4>
                 <p className="text-slate-500 font-bold">Banten (Cilegon, Serang, Merak, Pandeglang) & Area Jabodetabek.</p>
              </div>
              <div className="space-y-4 border-slate-200 md:border-x px-0 md:px-12">
                 <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs">Sektor Utama</h4>
                 <p className="text-slate-500 font-bold">Industrial, Medis, Pendidikan, Properti, & Corporate.</p>
              </div>
              <div className="space-y-4">
                 <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs">Pengalaman</h4>
                 <p className="text-slate-500 font-bold">Melayani Masyarakat, Pemerintahan, BUMN, & Swasta sejak 2017.</p>
              </div>
           </div>
        </div>
      </div>
    </section>
  )
}
