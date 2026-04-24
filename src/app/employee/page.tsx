import React from "react";
import { ListChecks, Clock, Tool, MapPin, Package, Bell, ChevronRight, User } from "lucide-react";
import Image from "next/image";

export default function EmployeeDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar for Employee */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-10 border-b border-slate-50">
          <div className="relative w-32 h-10 mb-2">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="text-[10px] font-black text-dstech-red uppercase tracking-widest">Employee Portal</span>
        </div>
        
        <nav className="flex-1 p-8 space-y-4">
          <a href="#" className="flex items-center gap-4 p-5 rounded-3xl bg-dstech-red text-white font-black text-sm shadow-xl shadow-red-500/20">
            <ListChecks className="w-5 h-5" /> Penugasan Saya
          </a>
          <a href="#" className="flex items-center gap-4 p-5 rounded-3xl text-slate-500 hover:bg-slate-50 hover:text-dstech-blue font-bold text-sm transition-all group">
            <Package className="w-5 h-5" /> Stok Barang
          </a>
          <a href="#" className="flex items-center gap-4 p-5 rounded-3xl text-slate-500 hover:bg-slate-50 hover:text-dstech-blue font-bold text-sm transition-all group">
            <Clock className="w-5 h-5" /> Presensi & Lembur
          </a>
        </nav>

        <div className="p-8 border-t border-slate-50">
           <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-dstech-red flex items-center justify-center text-white"><User className="w-5 h-5" /></div>
              <div>
                 <p className="text-xs font-black">Ikhsan Maulidi</p>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Technical Staff</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 space-y-12">
        <header className="flex justify-between items-center">
           <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Halo, Ikhsan!</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Cek jadwal tugas teknis hari ini</p>
           </div>
           <button className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center relative shadow-sm">
              <Bell className="w-6 h-6 text-slate-400" />
              <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-dstech-red rounded-full border-2 border-white"></span>
           </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Active Tasks */}
           <div className="lg:col-span-2 space-y-8 text-white">
              <div className="p-10 rounded-[48px] bg-dstech-blue shadow-2xl shadow-blue-500/30 space-y-8">
                 <h3 className="text-2xl font-black">Tugas Aktif (On Progress)</h3>
                 <div className="p-8 rounded-[40px] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between">
                    <div className="space-y-2">
                       <p className="text-white font-black text-xl">Instalasi CCTV (4 Titik)</p>
                       <p className="text-white/60 font-bold text-sm flex items-center gap-2"><MapPin className="w-4 h-4" /> Kawasan Industrial Krakatau Posco</p>
                    </div>
                    <button className="h-14 px-8 rounded-2xl bg-white text-dstech-blue font-black text-xs uppercase tracking-widest">Update Status</button>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-slate-900">
                 <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Stock Warning</p>
                    <h4 className="text-4xl font-black text-dstech-red">Low!</h4>
                    <p className="text-sm font-bold text-slate-500 mt-2">Kabel UTP Cat6 tersisa 2 Roll.</p>
                 </div>
                 <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Total Jam Kerja</p>
                    <h4 className="text-4xl font-black text-dstech-blue">168h</h4>
                    <p className="text-sm font-bold text-slate-500 mt-2">Bulan April (Sesuai Target)</p>
                 </div>
              </div>
           </div>

           {/* Announcements */}
           <div className="p-10 rounded-[48px] bg-white border border-slate-100 space-y-10 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900">Pengumuman</h3>
              <div className="space-y-6">
                 {[
                   { title: "Standard Baru K3", date: "Hari ini", cat: "PROSEDUR" },
                   { title: "Libur Lebaran 2025", date: "Kemarin", cat: "HR INFO" },
                   { title: "Udpate Firmware DVR", date: "2 hari lalu", cat: "TECHNICAL" }
                 ].map((an, i) => (
                   <div key={i} className="group p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-dstech-red/30 transition-all cursor-pointer">
                      <p className="text-[9px] font-black text-dstech-red uppercase tracking-widest mb-2">{an.cat}</p>
                      <h4 className="font-black text-slate-900 leading-tight mb-2 group-hover:text-dstech-red transition-colors">{an.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{an.date}</p>
                   </div>
                 ))}
              </div>
              <button className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">Buka Portal KMS <ChevronRight className="w-4 h-4" /></button>
           </div>
        </div>
      </main>
    </div>
  );
}
