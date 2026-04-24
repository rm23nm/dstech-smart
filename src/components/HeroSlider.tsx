"use client"

import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

export default function HeroSlider() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ])

  return (
    <div className="relative w-full max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-2xl mt-8 cursor-grab active:cursor-grabbing border border-zinc-200 dark:border-zinc-800" ref={emblaRef}>
      <div className="flex touch-pan-y">
        
        {/* Slide 1: Image Marketing */}
        <div className="flex-[0_0_100%] min-w-0 relative h-[400px] md:h-[500px] bg-gradient-to-r from-dstech-blue to-blue-900 group">
          {/* Fallback image style since actual images aren't uploaded yet */}
          <div className="absolute inset-0 bg-black/40 mix-blend-multiply z-10" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20 text-white">
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-lg">
              Solusi Teknologi<br />
              <span className="text-dstech-red">Tanpa Batas</span>
            </h2>
            <p className="text-lg md:text-xl max-w-2xl text-zinc-100 font-medium drop-shadow">
              Kembangkan skala usaha anda ke ranah digital bersama pakar teknologi terbaik kami.
            </p>
          </div>
        </div>

        {/* Slide 2: Video Slide */}
        <div className="flex-[0_0_100%] min-w-0 relative h-[400px] md:h-[500px] bg-black">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          >
            <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20 text-white">
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-lg">
              Platform Cerdas<br />Untuk Era Modern
            </h2>
            <p className="text-lg md:text-xl max-w-2xl text-zinc-200 font-medium drop-shadow">
              Kami memadukan efisiensi dan keamanan. Tonton sekilas bagaimana kami mengubah ide menjadi realita.
            </p>
          </div>
        </div>

        {/* Slide 3: Promotion / Referral Focus */}
        <div className="flex-[0_0_100%] min-w-0 relative h-[400px] md:h-[500px] bg-gradient-to-br from-dstech-red to-red-900">
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20 text-white">
            <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider mb-6 animate-pulse">BERGBUNG BERSAMA KAMI</span>
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-lg">
              Sistem Referral<br />Menguntungkan!
            </h2>
            <p className="text-lg md:text-xl max-w-2xl text-zinc-100 font-medium drop-shadow">
              Dapatkan komisi untuk setiap pembelian satu kali (One-time) atau pendapatan rutin tahunan (Annual) dari layanan kami.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
