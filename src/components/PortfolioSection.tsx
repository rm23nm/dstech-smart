"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink, Play, Video, X, Filter, Sparkles } from "lucide-react";

export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  description: string;
  category: string;
  image: string;
  videoUrl?: string;
  date?: string;
  featured?: boolean;
}

const DEFAULT_PORTFOLIOS: PortfolioItem[] = [
  {
    id: "dstech_port_1",
    title: "CCTV System & Networking",
    client: "PT. POSCO ENERGY CILEGON",
    description: "Instalasi sistem keamanan terpadu dan infrastruktur jaringan fiber optik untuk area operasional energi.",
    category: "Industrial",
    image: "/portfolio-industrial.png",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    date: "2024",
    featured: true,
  },
  {
    id: "dstech_port_2",
    title: "Smart Home Integration",
    client: "Perumahan Cilegon Hills",
    description: "Implementasi konsep Smart Home System (Smart Lock, Lighting, & Centralized Control) untuk klaster premium.",
    category: "Residential",
    image: "/portfolio-residential.png",
    videoUrl: "",
    date: "2024",
    featured: true,
  },
  {
    id: "dstech_port_3",
    title: "Access Control & Security",
    client: "RS KURNIA CILEGON",
    description: "Penyediaan sistem akses kontrol pintu (Digital Lock) dan pengadaan perangkat IT pendukung medis.",
    category: "Public Service",
    image: "/portfolio-medical.png",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    date: "2023",
    featured: true,
  },
  {
    id: "dstech_port_4",
    title: "CCTV & Maintenance",
    client: "Hotel Pesona Merak",
    description: "Maintenance rutin dan penambahan titik CCTV untuk memastikan keamanan area perhotelan.",
    category: "Hospitality",
    image: "/portfolio-industrial.png",
    videoUrl: "",
    date: "2023",
    featured: false,
  },
  {
    id: "dstech_port_5",
    title: "Barier Gate System",
    client: "Perum Metro Royal Cilegon",
    description: "Pemasangan palang otomatis (Barier Gate) dengan sistem akses kartu RFID untuk perumahan.",
    category: "Residential",
    image: "/portfolio-residential.png",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    date: "2024",
    featured: true,
  },
  {
    id: "dstech_port_6",
    title: "IT Infrastructure & PC Server",
    client: "Krakatau Sarana Prima",
    description: "Pembangunan infrastruktur IT dan pengadaan komputer profesional untuk operasional kantor.",
    category: "Corporate",
    image: "/portfolio-industrial.png",
    videoUrl: "",
    date: "2023",
    featured: false,
  },
];

// Helper to extract clean embed URL for YouTube
function getEmbedUrl(url: string): string {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0`;
  }
  return url;
}

function isDirectVideo(url: string): boolean {
  if (!url) return false;
  return url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("/uploads/");
}

export default function PortfolioSection() {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>(DEFAULT_PORTFOLIOS);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [activeVideo, setActiveVideo] = useState<{ title: string; client: string; videoUrl: string } | null>(null);

  // Fetch dynamic portfolios from backend API
  useEffect(() => {
    async function loadPortfolios() {
      try {
        const res = await fetch("/api/portfolios");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPortfolios(data);
          }
        }
      } catch (err) {
        console.warn("Using fallback default portfolios:", err);
      }
    }
    loadPortfolios();
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveVideo(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute unique categories
  const categories = ["Semua", ...Array.from(new Set(portfolios.map((p) => p.category).filter(Boolean)))];

  // Filter items
  const filteredPortfolios =
    selectedCategory === "Semua"
      ? portfolios
      : portfolios.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id="portofolio" className="py-16 sm:py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-red-50 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-dstech-blue/10 text-dstech-blue font-black tracking-widest uppercase text-[11px] mb-3">
              <Sparkles className="w-3.5 h-3.5" /> JEJAK LANGKAH & PENGALAMAN REAL
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-900 mb-3">
              DOKUMENTASI <span className="text-dstech-blue">PROYEK</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base md:text-lg font-medium">
              Bukti nyata dedikasi PT. DSTech Smart Perkasa dalam instalasi Security System, CCTV, Smart Home, & IT Infrastructure. Dilengkapi foto & video dokumentasi lapangan.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm text-center">
              <p className="text-3xl font-black text-dstech-blue mb-0.5">500+</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Selesai</p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-12 scrollbar-hide">
          <div className="flex items-center gap-2 px-1">
            <Filter className="w-4 h-4 text-slate-400 mr-1 hidden sm:inline" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPortfolios.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col h-full bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:border-dstech-red/30 transition-all duration-300 hover:shadow-xl shadow-sm"
            >
              {/* Image Container */}
              <div className="h-52 sm:h-60 w-full overflow-hidden relative bg-slate-100">
                <Image
                  src={item.image || "/portfolio-industrial.png"}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-wider text-dstech-red">
                    {item.category}
                  </span>
                </div>

                {/* Video Indicator / Play Button Overlay */}
                {item.videoUrl && (
                  <button
                    onClick={() =>
                      setActiveVideo({
                        title: item.title,
                        client: item.client,
                        videoUrl: item.videoUrl!,
                      })
                    }
                    className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors cursor-pointer group/btn"
                    title="Putar Video Dokumentasi Lapangan"
                  >
                    <div className="w-13 h-13 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transform group-hover/btn:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5 shadow-sm">
                      <Video className="w-3.5 h-3.5 text-red-400" /> Video Dokumentasi
                    </span>
                  </button>
                )}
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-dstech-blue font-black text-[10px] tracking-widest uppercase">
                    {item.client}
                  </p>
                  {item.date && (
                    <span className="text-[10px] font-bold text-slate-400">Tahun {item.date}</span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-black mb-2.5 text-slate-900 leading-snug group-hover:text-dstech-red transition-colors">
                  {item.title}
                </h3>

                <p className="text-slate-500 leading-relaxed font-medium text-xs sm:text-sm mb-6 flex-1 line-clamp-3">
                  {item.description}
                </p>

                {/* Actions Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {item.videoUrl ? (
                    <button
                      onClick={() =>
                        setActiveVideo({
                          title: item.title,
                          client: item.client,
                          videoUrl: item.videoUrl!,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-black uppercase tracking-wider"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Putar Video</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      Dokumentasi Foto
                    </span>
                  )}

                  <a
                    href={`https://wa.me/6282259494242?text=${encodeURIComponent(
                      `Halo DSTech Smart, saya tertarik dengan proyek instalasi "${item.title}" di ${item.client}. Bisa berikan konsultasi dan estimasi biaya serupa?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider hover:text-dstech-blue transition-colors ml-auto sm:ml-0"
                  >
                    <span>Konsultasi Proyek</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Lightbox Player Modal */}
        {activeVideo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
            onClick={() => setActiveVideo(null)}
          >
            <div
              className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-dstech-accent flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Video Dokumentasi Proyek
                  </span>
                  <h3 className="text-white font-black text-sm sm:text-base mt-0.5">
                    {activeVideo.title} — <span className="text-zinc-400 font-medium">{activeVideo.client}</span>
                  </h3>
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Frame */}
              <div className="relative aspect-video w-full bg-black">
                {isDirectVideo(activeVideo.videoUrl) ? (
                  <video
                    src={activeVideo.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={getEmbedUrl(activeVideo.videoUrl)}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                )}
              </div>

              {/* Footer Modal */}
              <div className="p-4 sm:p-5 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
                <p>Dokumentasi resmi hasil instalasi PT. DSTech Smart Perkasa.</p>
                <a
                  href={`https://wa.me/6282259494242?text=${encodeURIComponent(
                    `Halo DSTech, saya sudah melihat video dokumentasi "${activeVideo.title}". Saya ingin berdiskusi terkait kebutuhan instalasi kami.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-dstech-blue hover:bg-blue-600 text-white font-bold transition-all flex items-center gap-2"
                >
                  <span>Diskusikan Proyek Serupa</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Coverage & Info Bar */}
        <div className="mt-16 sm:mt-20 p-6 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center md:text-left leading-relaxed">
            <div className="space-y-2">
              <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">Wilayah Layanan</h4>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Banten (Cilegon, Serang, Merak, Pandeglang) & Area Jabodetabek.
              </p>
            </div>
            <div className="space-y-2 border-slate-200 md:border-x px-0 md:px-8">
              <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">Sektor Utama</h4>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Industrial, Medis, Pendidikan, Properti Hunian & Perkantoran.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">Pengalaman Sejak 2017</h4>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Melayani Masyarakat, Pemerintahan, BUMN, & Swasta dengan standar profesional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
