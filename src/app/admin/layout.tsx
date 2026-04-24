import React from "react";
import { LayoutDashboard, Package, Users, Settings, LogOut, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-10 flex flex-col items-center border-b border-slate-50">
          <div className="relative w-32 h-10 mb-2">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Control Center</span>
        </div>
        
        <nav className="flex-1 p-8 space-y-4">
          <a href="/admin" className="flex items-center justify-between p-5 rounded-3xl bg-dstech-blue text-white font-black text-sm shadow-xl shadow-blue-500/20 group">
            <div className="flex items-center gap-4">
               <LayoutDashboard className="w-5 h-5" /> Dashboard
            </div>
            <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="/admin/products" className="flex items-center justify-between p-5 rounded-3xl text-slate-500 hover:bg-slate-50 hover:text-dstech-red font-bold text-sm transition-all group">
            <div className="flex items-center gap-4">
               <Package className="w-5 h-5" /> Product Management
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </a>
          <a href="/admin/partners" className="flex items-center justify-between p-5 rounded-3xl text-slate-500 hover:bg-slate-50 hover:text-dstech-red font-bold text-sm transition-all group">
            <div className="flex items-center gap-4">
               <Users className="w-5 h-5" /> Affiliate Network
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </a>
          <a href="/admin/settings" className="flex items-center justify-between p-5 rounded-3xl text-slate-500 hover:bg-slate-50 hover:text-dstech-red font-bold text-sm transition-all group">
            <div className="flex items-center gap-4">
               <Settings className="w-5 h-5" /> Site Settings
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </a>
        </nav>

        <div className="p-8 border-t border-slate-50">
          <button className="flex items-center gap-4 p-5 w-full rounded-3xl text-red-500 hover:bg-red-50 font-black text-sm transition-all">
            <LogOut className="w-5 h-5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-28 bg-white border-b border-slate-200 px-12 flex items-center justify-between sticky top-0 z-10">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome, Administrator</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">DSTech Smart Perkasa Portal</p>
           </div>
           <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-dstech-red shadow-lg shadow-red-500/20"></div>
                 <div>
                    <p className="text-sm font-black text-slate-900 leading-none">Admin Profile</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Super User</p>
                 </div>
              </div>
           </div>
        </header>
        <div className="p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
