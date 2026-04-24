import Image from "next/image";
import ProductSection from "@/components/ProductSection";
import PortfolioSection from "@/components/PortfolioSection";
import { MoveRight, Shield, Cpu, Target, Users, CheckCircle2, ShoppingCart, Phone, Mail, MapPin, Globe, MessageCircle, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans overflow-hidden selection:bg-dstech-red selection:text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 md:px-12 w-full max-w-7xl mx-auto fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative w-40 h-14 flex items-center justify-center">
            <Image src="/logo.png" alt="PT. DSTech Smart Perkasa Logo" fill className="object-contain" priority />
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-8 font-black text-xs uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-dstech-red transition-colors border-b-2 border-transparent hover:border-dstech-red py-1">Beranda</a>
          <a href="#tentang" className="hover:text-dstech-blue transition-colors border-b-2 border-transparent hover:border-dstech-blue py-1">Profil</a>
          <a href="/shop" className="hover:text-dstech-red transition-colors border-b-2 border-transparent hover:border-dstech-red py-1">E-Store</a>
          <a href="#portofolio" className="hover:text-dstech-blue transition-colors border-b-2 border-transparent hover:border-dstech-blue py-1">Portofolio</a>
          <a href="/affiliate" className="bg-dstech-blue text-white px-5 py-2 rounded-full hover:bg-dstech-red transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20">
            Program Partner
          </a>
        </div>
        <div className="flex items-center gap-4">
           <a 
            href="https://wa.me/6282259494242"
            className="hidden sm:flex bg-dstech-red hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-500/30 active:scale-95"
          >
            Konsultasi <Phone className="w-4 h-4 ml-2" />
          </a>
        </div>
      </nav>

      {/* Hero Section - More Prominent Red/Blue */}
      <main className="flex-1 flex flex-col items-center justify-center pt-64 pb-32 relative bg-slate-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-dstech-blue/5 blur-[120px] rounded-full -mr-20 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-dstech-red/5 blur-[120px] rounded-full -ml-20 -z-0"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-10 transform -rotate-1 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-dstech-red animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">The Best Solution Smart Technology</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.85] text-slate-900">
            <span className="text-dstech-blue">SECURITY</span> SYSTEM<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-dstech-red via-dstech-blue to-dstech-red">& TECHNOLOGY</span>
          </h1>
          
          <p className="max-w-4xl mx-auto text-xl md:text-2xl text-slate-500 mb-16 leading-relaxed font-bold">
             Partner Strategis Digitalisasi Industri & Hunian. Menghadirkan Inovasi Security System & IT Infrastructure Terdepan Sejak 2017.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center mb-32 group">
            <a href="/shop" className="h-24 w-full sm:w-80 flex items-center justify-center gap-4 rounded-[32px] bg-dstech-red text-white font-black text-2xl transition-all hover:scale-105 shadow-2xl shadow-red-500/40 active:translate-y-1">
              Buka Toko Online <ShoppingCart className="w-8 h-8" />
            </a>
            <a href="/affiliate" className="h-24 w-full sm:w-80 flex items-center justify-center gap-4 rounded-[32px] border-4 border-dstech-blue/30 bg-white text-dstech-blue font-black text-2xl transition-all hover:bg-dstech-blue hover:text-white hover:border-dstech-blue shadow-2xl shadow-blue-500/10">
              Daftar Agen <MoveRight className="w-8 h-8" />
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 w-full max-w-6xl mx-auto pt-20 border-t border-slate-200 relative z-10">
               {[
                 { val: "500+", label: "Project Selesai", color: "text-dstech-red" },
                 { val: "2017", label: "Tahun Berdiri", color: "text-dstech-blue" },
                 { val: "18+", label: "Produk & Layanan", color: "text-dstech-red" },
                 { val: "BANTEN", label: "Area Operasional", color: "text-dstech-blue" }
               ].map((stat, i) => (
                 <div key={stat.label} className="flex flex-col items-center text-center group cursor-default">
                    <span className={`text-4xl md:text-6xl font-black ${stat.color} mb-3 transition-transform group-hover:scale-110`}>{stat.val}</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                 </div>
               ))}
          </div>
        </div>
      </main>

      {/* Profil Section - Full Info */}
      <section id="tentang" className="py-48 relative bg-white">
         <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center mb-40">
               <div className="relative group order-2 lg:order-1">
                  <div className="absolute -inset-10 bg-gradient-to-tr from-dstech-blue/20 to-dstech-red/20 rounded-[80px] blur-3xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative aspect-square rounded-[64px] overflow-hidden border-8 border-white shadow-2xl bg-slate-50 p-4">
                     <div className="absolute inset-0 bg-dstech-blue/5"></div>
                     <Image src="/about_image.png" alt="DSTech Leadership" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                     <div className="absolute inset-0 bg-gradient-to-t from-dstech-blue/80 via-transparent to-transparent"></div>
                     <div className="absolute bottom-16 left-12 right-12 text-white">
                        <p className="text-5xl font-black italic tracking-tighter mb-4 leading-none text-white shadow-sm">"Kepuasan Pelanggan adalah masa depan kami"</p>
                        <div className="w-20 h-2 bg-dstech-red mb-4"></div>
                        <p className="font-black tracking-[0.4em] text-[10px] uppercase">MOTO UTAMA PERUSAHAAN</p>
                     </div>
                  </div>
               </div>
               <div className="space-y-12 order-1 lg:order-2">
                  <div className="space-y-8">
                     <span className="inline-block px-5 py-2 rounded-full bg-dstech-red/10 text-dstech-red text-[11px] font-black tracking-widest uppercase border border-dstech-red/20">Sejarah & Kredibilitas</span>
                     <h2 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter text-slate-900">Digital <br /><span className="text-dstech-blue">Transformation</span></h2>
                     <p className="text-xl text-slate-500 leading-relaxed font-bold">
                        PT. DSTech Smart Perkasa didirikan oleh tenaga profesional berpengalaman di bidang Teknologi Informasi & Security System. Kami melayani masyarakat, pemerintahan, BUMN, hingga Industri Internasional.
                     </p>
                     <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-dstech-red text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20"><Star className="w-6 h-6" /></div>
                           <div>
                              <h4 className="text-xl font-black text-slate-800">Legal & Berizin</h4>
                              <p className="text-slate-500 font-medium">Berdasar NIB: 1909220127034 & NPWP: 60.648.216.4-102.000</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-dstech-blue text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20"><Target className="w-6 h-6" /></div>
                           <div>
                              <h4 className="text-xl font-black text-slate-800">Expert Team</h4>
                              <p className="text-slate-500 font-medium">Tim dengan jam terbang tinggi melayani ribuan titik instalasi.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="p-16 rounded-[60px] bg-slate-50 border-2 border-slate-100 group hover:border-dstech-blue/50 transition-all duration-500 relative overflow-hidden">
                  <div className="relative z-10">
                     <div className="w-20 h-20 rounded-3xl bg-dstech-blue text-white flex items-center justify-center mb-10 shadow-2xl shadow-blue-500/40"><Users className="w-10 h-10" /></div>
                     <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">VISI</h3>
                     <p className="text-xl text-slate-500 font-bold leading-relaxed">
                        Menjadi perusahaan skala nasional & internasional yang berfokus pada profesionalisme dan kepuasan pelanggan dengan kualitas kerja terbaik.
                     </p>
                  </div>
               </div>
               <div className="p-16 rounded-[60px] bg-dstech-red text-white group transition-all duration-500 relative overflow-hidden shadow-2xl shadow-red-500/30">
                  <div className="relative z-10">
                     <div className="w-20 h-20 rounded-3xl bg-white text-dstech-red flex items-center justify-center mb-10 shadow-2xl"><Target className="w-10 h-10" /></div>
                     <h3 className="text-4xl font-black text-white mb-6 tracking-tight">MISI KAMI</h3>
                     <ul className="space-y-4 text-white/80 font-bold">
                        <li className="flex gap-3"><span>•</span> Memberikan layanan tepat, akurat, dan dapat dipercaya.</li>
                        <li className="flex gap-3"><span>•</span> Membangun SDM kompeten di lingkungan kerja perusahaan.</li>
                        <li className="flex gap-3"><span>•</span> Berpartisipasi aktif dalam pembangunan Negara Indonesia.</li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Catalog Section - All Products listed */}
      <ProductSection />

      {/* Testimonials Section - New */}
      <section className="py-48 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dstech-red to-dstech-blue"></div>
         <div className="max-w-7xl mx-auto px-6 text-center mb-32">
            <span className="text-dstech-red font-black tracking-widest uppercase text-xs">TRUSTED BY LEADERS</span>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mt-6">KLIEN & <span className="text-dstech-blue italic">TESTIMONI</span></h2>
         </div>
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
            {[
               { name: "PT. POSCO ENERGY", text: "Instalasi CCTV & Jaringan Fiber Optik sangat profesional. Monitoring operasional kami kini jauh lebih efisien.", client: "Cilegon", stars: 5 },
               { name: "RS KURNIA", text: "Sistem access control (Digital Lock) yang dipasang sangat membantu keamanan area medis kami. Support timnya luar biasa.", client: "Cilegon", stars: 5 },
               { name: "CILEGON HILLS", text: "Konsep Smarthome System dari DSTech menambah nilai jual properti kami secara signifikan. Sangat inovatif.", client: "Premium Housing", stars: 5 }
            ].map((t, idx) => (
               <div key={idx} className="p-12 rounded-[48px] bg-white text-slate-900 flex flex-col items-center text-center shadow-2xl transform hover:-translate-y-2 transition-transform">
                  <div className="flex gap-1 mb-8">
                     {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-6 h-6 fill-dstech-red text-dstech-red" />)}
                  </div>
                  <p className="text-xl font-bold italic mb-10 leading-relaxed">"{t.text}"</p>
                  <div>
                     <h4 className="text-2xl font-black text-dstech-blue leading-none">{t.name}</h4>
                     <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">{t.client}</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

      <PortfolioSection />

      {/* Enhanced Footer with Complete Contact Info */}
      <footer className="bg-white border-t-8 border-dstech-blue pt-40 pb-20 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-dstech-red/5 blur-[120px] rounded-full -mr-20"></div>
         
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-24 mb-32 relative z-10">
            <div className="lg:col-span-2 space-y-12">
               <div className="relative w-64 h-24 mb-10">
                  <Image src="/logo.png" alt="DSTech Logo" fill className="object-contain" />
               </div>
               <p className="text-2xl text-slate-500 font-black leading-tight max-w-xl">
                  Penyedia Solusi Teknologi Keamanan & Informasi Terpercaya untuk Skala Nasional & Internasional.
               </p>
               <div className="flex gap-6">
                  <a href="#" className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-dstech-red hover:bg-dstech-red hover:text-white transition-all shadow-lg"><Globe className="w-8 h-8" /></a>
                  <a href="#" className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-dstech-blue hover:bg-dstech-blue hover:text-white transition-all shadow-lg"><MessageCircle className="w-8 h-8" /></a>
               </div>
            </div>
            
            <div className="space-y-10">
               <h4 className="text-dstech-red font-black tracking-widest text-xs uppercase">KONTAK UTAMA</h4>
               <ul className="space-y-8 font-bold text-lg">
                  <li className="flex items-start gap-4">
                     <Phone className="w-6 h-6 text-dstech-blue flex-shrink-0 mt-1" />
                     <div className="flex flex-col">
                        <span>0822-5949-4242</span>
                        <span className="text-slate-400 text-sm">Customer Service</span>
                     </div>
                  </li>
                  <li className="flex items-start gap-4">
                     <Mail className="w-6 h-6 text-dstech-red flex-shrink-0 mt-1" />
                     <div className="flex flex-col">
                        <span>cs@dstechsmart.com</span>
                        <span className="text-slate-400 text-sm">Official Support</span>
                     </div>
                  </li>
               </ul>
            </div>
            
            <div className="space-y-10">
               <h4 className="text-dstech-blue font-black tracking-widest text-xs uppercase">ALAMAT KANTOR</h4>
               <ul className="space-y-4 text-slate-500 font-bold leading-relaxed">
                  <li className="flex items-start gap-4">
                     <MapPin className="w-8 h-8 text-dstech-red flex-shrink-0" />
                     <span>
                        PERUM BUKIT CILEGON ASRI BLOK DB NO. 19 KEL. BAGENDUNG KEC. CILEGON, KOTA CILEGON - BANTEN
                     </span>
                  </li>
               </ul>
               <div className="pt-10 border-t border-slate-100 italic font-black text-slate-300">
                  PT. DSTech Smart Perkasa <br /> Since 2017
               </div>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Copyright &copy; 2025 PT. DSTech Smart Perkasa. All Rights Reserved.</p>
            <div className="flex gap-10 text-[xs] font-black uppercase tracking-widest text-dstech-blue">
               <a href="/admin" className="hover:text-dstech-red transition-colors">Admin Portal</a>
               <a href="#" className="hover:text-dstech-red transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-dstech-red transition-colors">Terms of Service</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
