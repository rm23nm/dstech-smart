import React from "react";
import { DollarSign, Link as LinkIcon, Download, TrendingUp, ShoppingBag, Globe, Copy, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function AffiliateDashboard() {
  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      {/* Sidebar - Branded for Partners */}
      <aside className="w-80 border-r border-slate-100 flex flex-col sticky top-0 h-screen bg-slate-50/50">
        <div className="p-10 border-b border-slate-100 bg-white">
          <div className="relative w-32 h-10 mb-2">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="text-[10px] font-black text-dstech-blue uppercase tracking-widest">Partner Command Center</span>
        </div>
        
        <nav className="flex-1 p-8 space-y-4">
          <a href="#" className="flex items-center gap-4 p-5 rounded-3xl bg-dstech-blue text-white font-black text-sm shadow-xl shadow-blue-500/30 transition-all active:scale-95">
            <TrendingUp className="w-5 h-5" /> Statistik Performa
          </a>
          <a href="#" className="flex items-center gap-4 p-5 rounded-3xl text-slate-500 hover:bg-white hover:text-dstech-red hover:shadow-sm font-bold text-sm transition-all group">
             <LinkIcon className="w-5 h-5" /> Link Referral
          </a>
          <a href="#" className="flex items-center gap-4 p-5 rounded-3xl text-slate-500 hover:bg-white hover:text-dstech-red hover:shadow-sm font-bold text-sm transition-all group">
             <Download className="w-5 h-5" /> Asset Marketing
          </a>
          <a href="#" className="flex items-center gap-4 p-5 rounded-3xl text-slate-500 hover:bg-white hover:text-dstech-red hover:shadow-sm font-bold text-sm transition-all group">
             <DollarSign className="w-5 h-5" /> Pencairan Komisi
          </a>
        </nav>

        <div className="p-8 border-t border-slate-100 bg-white">
           <div className="p-6 rounded-3xl bg-dstech-red text-white">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Peringkat Anda</p>
              <h4 className="text-xl font-black italic tracking-tighter">GOLD PARTNER</h4>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-12 bg-white space-y-12 overflow-y-auto">
        <header className="flex justify-between items-center">
           <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Halo, Partner!</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Status Kemitraan: <span className="text-green-500">Verified & Active</span></p>
           </div>
           <div className="flex gap-4">
              <button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-dstech-red transition-all shadow-xl">Buka Toko Produk</button>
           </div>
        </header>

        {/* Top Earnings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-10 rounded-[48px] bg-slate-50 border-2 border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-dstech-blue/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Total Komisi</p>
              <h3 className="text-4xl font-black text-dstech-blue">Rp 12.850K</h3>
              <p className="text-sm font-bold text-slate-500 mt-4 flex items-center gap-2">Siap Cair: <span className="text-slate-900">Rp 4.2M</span></p>
           </div>
           <div className="p-10 rounded-[48px] bg-slate-50 border-2 border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Total Penjualan</p>
              <h3 className="text-4xl font-black text-slate-900">42 Transaksi</h3>
              <p className="text-sm font-bold text-slate-500 mt-4 flex items-center gap-2 text-green-500"><TrendingUp className="w-4 h-4" /> 12% Naik bulan ini</p>
           </div>
           <div className="p-10 rounded-[48px] bg-dstech-red text-white shadow-2xl shadow-red-500/20">
              <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-4">Referral Visits</p>
              <h3 className="text-4xl font-black text-white">1,248 Cliicks</h3>
              <p className="text-sm font-bold text-white/80 mt-4">Conversion Rate: 3.4%</p>
           </div>
        </div>

        {/* Affiliate Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Referral Link Tool */}
           <div className="p-12 rounded-[56px] border border-slate-100 bg-white space-y-10 shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-3xl bg-dstech-blue/10 text-dstech-blue flex items-center justify-center"><LinkIcon className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-black tracking-tight">Referral Link</h3>
              </div>
              <p className="text-slate-500 font-bold leading-relaxed">Gunakan link unik ini untuk mempromosikan produk DSTech di sosial media Anda.</p>
              <div className="flex gap-4">
                 <div className="flex-1 h-20 px-8 rounded-3xl bg-slate-50 flex items-center font-bold text-slate-500 border-2 border-slate-100 overflow-hidden truncate">
                    https://dstechsmart.com/shop?ref=PART-0822
                 </div>
                 <button className="h-20 w-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center hover:bg-dstech-red transition-all active:scale-95 shadow-xl">
                    <Copy className="w-8 h-8" />
                 </button>
              </div>
           </div>

           {/* Marketing Assets */}
           <div className="p-12 rounded-[56px] border border-slate-100 bg-slate-50/50 space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-3xl bg-dstech-red/10 text-dstech-red flex items-center justify-center"><Download className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-black tracking-tight">Marketing Assets</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-6 rounded-3xl bg-white border border-slate-100 flex items-center justify-between hover:border-dstech-blue transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <Image src="/logo.png" alt="Logo" width={40} height={12} className="opacity-30 group-hover:opacity-100" />
                       <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Catalogs 2025</span>
                    </div>
                    <Download className="w-4 h-4 text-slate-300 group-hover:text-dstech-blue" />
                 </div>
                 <div className="p-6 rounded-3xl bg-white border border-slate-100 flex items-center justify-between hover:border-dstech-blue transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <Globe className="w-5 h-5 text-slate-300 group-hover:text-dstech-red" />
                       <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Social Media Kits</span>
                    </div>
                    <Download className="w-4 h-4 text-slate-300 group-hover:text-dstech-blue" />
                 </div>
              </div>
           </div>
        </div>

        {/* Performance Chart / Sales History Placeholder */}
        <div className="p-12 rounded-[56px] border border-slate-100 bg-slate-900 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-dstech-blue/10 -z-0"></div>
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8 relative z-10">
              <h3 className="text-3xl font-black tracking-tight">Riwayat Penjualan Terakhir</h3>
              <div className="flex gap-4">
                 <span className="px-6 py-2 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest">Update 2m ago</span>
              </div>
           </div>
           <div className="space-y-4 relative z-10">
              {[
                { prod: "CCTV Package (POSCO)", date: "12 Apr, 2025", fee: "Rp 350.000", status: "Paid" },
                { prod: "Smart Doorlock (Cilegon Hills)", date: "10 Apr, 2025", fee: "Rp 277.500", status: "Pending" },
                { prod: "Fingerprint System (RS Kurnia)", date: "09 Apr, 2025", fee: "Rp 240.000", status: "Paid" }
              ].map((sale, i) => (
                <div key={i} className="flex items-center justify-between p-8 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 group-hover:text-dstech-red transition-colors"><ShoppingBag className="w-6 h-6" /></div>
                      <div>
                         <p className="font-black text-lg leading-none mb-1">{sale.prod}</p>
                         <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{sale.date}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-lg text-dstech-red leading-none mb-2">{sale.fee}</p>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${sale.status === 'Paid' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                         {sale.status}
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
}
