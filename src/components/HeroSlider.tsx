"use client"

import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Shield, Cpu, Users, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

const SLIDES = [
  {
    id: 1,
    badge: "Enterprise Security Solution",
    badgeIcon: <Shield className="w-3.5 h-3.5" />,
    badgeColor: "bg-dstech-red/20 text-red-300 border-red-500/30",
    title: "Inovasi Security System",
    titleHighlight: "& CCTV Terdepan",
    desc: "Sistem monitoring real-time beresolusi tinggi untuk perumahan, industri, rumah sakit, dan gedung komersial.",
    ctaText: "Lihat Solusi",
    ctaLink: "#produk",
    bgGradient: "from-slate-950 via-slate-900 to-blue-950",
    glowColor: "bg-dstech-blue/20"
  },
  {
    id: 2,
    badge: "Future Living Automation",
    badgeIcon: <Cpu className="w-3.5 h-3.5" />,
    badgeColor: "bg-dstech-blue/20 text-blue-300 border-blue-500/30",
    title: "Smart Home System",
    titleHighlight: "& Akses Digital",
    desc: "Integrasi cerdas smart doorlock, pencahayaan otomatis, dan sensor keamanan gedung dalam genggaman Anda.",
    ctaText: "Katalog Smart Home",
    ctaLink: "/shop",
    bgGradient: "from-slate-950 via-blue-950 to-slate-900",
    glowColor: "bg-dstech-red/20"
  },
  {
    id: 3,
    badge: "Partner & Affiliate Program",
    badgeIcon: <Users className="w-3.5 h-3.5" />,
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    title: "Bangun Karir & Bisnis",
    titleHighlight: "Bersama DSTech",
    desc: "Dapatkan komisi profesional hingga 20% untuk setiap proyek instalasi dan penjualan produk teknologi.",
    ctaText: "Gabung Program Mitra",
    ctaLink: "/affiliate",
    bgGradient: "from-slate-950 via-slate-900 to-red-950",
    glowColor: "bg-dstech-blue/20"
  }
]

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  return (
    <div className="relative w-full max-w-7xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {SLIDES.map((slide) => (
            <div
              key={slide.id}
              className={`flex-[0_0_100%] min-w-0 relative h-[340px] sm:h-[420px] md:h-[480px] bg-gradient-to-br ${slide.bgGradient} flex items-center justify-center`}
            >
              {/* Subtle tech background glow */}
              <div className={`absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 ${slide.glowColor} blur-[90px] rounded-full pointer-events-none`} />
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              <div className="relative z-10 w-full px-5 sm:px-12 md:px-16 text-center sm:text-left flex flex-col items-center sm:items-start justify-center max-w-4xl">
                {/* Badge */}
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md text-[11px] font-bold uppercase tracking-widest mb-4 sm:mb-6 ${slide.badgeColor}`}>
                  {slide.badgeIcon}
                  <span>{slide.badge}</span>
                </div>

                {/* Heading */}
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-3 sm:mb-5">
                  {slide.title} <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-dstech-red via-red-400 to-dstech-blue">
                    {slide.titleHighlight}
                  </span>
                </h2>

                {/* Description */}
                <p className="text-xs sm:text-base md:text-lg text-slate-300 font-medium max-w-2xl leading-relaxed mb-6 sm:mb-8 line-clamp-3 sm:line-clamp-none">
                  {slide.desc}
                </p>

                {/* CTA Button */}
                <div className="flex items-center gap-3">
                  <a
                    href={slide.ctaLink}
                    className="h-11 sm:h-12 px-5 sm:px-7 rounded-xl bg-dstech-red hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-lg shadow-red-500/30 active:scale-95"
                  >
                    {slide.ctaText} <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="https://wa.me/6282259494242"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all"
                  >
                    Hubungi Kami
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next desktop arrows */}
      <button
        onClick={scrollPrev}
        aria-label="Previous Slide"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Next Slide"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators (Dots) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-20">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all rounded-full ${
              selectedIndex === idx
                ? "w-7 h-2 bg-dstech-red"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
