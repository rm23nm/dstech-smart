import React from 'react'
import { LayoutDashboard, Package, Image as ImageIcon, Users, LogOut, Bell, Shield } from 'lucide-react'

export const metadata = {
  title: 'Command Center - DSTech Smart',
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#020617] text-zinc-100 font-sans w-full overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-[#020617] border-r border-white/5 relative z-20">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dstech-accent flex items-center justify-center">
                   <Shield className="w-5 h-5 text-black" />
                </div>
                <span className="font-black text-xl tracking-tighter">DSTech <span className="text-dstech-accent">Admin</span></span>
             </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-8">
          <p className="px-8 text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase mb-6">MENU UTAMA</p>
          <ul className="space-y-2 px-4">
            <li>
              <a href="/superadmin" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-dstech-accent/10 text-dstech-accent font-bold transition-all border border-dstech-accent/20">
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </a>
            </li>
            <li>
              <a href="/superadmin/products" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all font-bold">
                <Package className="w-5 h-5" />
                Produk & Komisi
              </a>
            </li>
            <li>
              <a href="/superadmin/portfolios" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all font-bold">
                <ImageIcon className="w-5 h-5" />
                Manajemen Portfolio
              </a>
            </li>
            <li>
              <a href="#affiliates" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all font-bold">
                <Users className="w-5 h-5" />
                Daftar Affiliate
              </a>
            </li>
          </ul>
        </nav>

        <div className="p-6 border-t border-white/5">
          <a href="/" className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black text-sm uppercase tracking-widest">
            <LogOut className="w-5 h-5" />
            Sign Out
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full h-screen overflow-hidden relative">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-dstech-accent/5 rounded-full blur-[120px] -z-0"></div>

        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-black tracking-tight text-white">Console Performa <span className="text-zinc-500 text-sm ml-2 font-medium">v2.5.0</span></h1>
          </div>
          <div className="flex items-center gap-6">
             <button className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                <Bell className="w-5 h-5 text-zinc-400" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-zinc-950"></span>
             </button>
             <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                <div className="text-right hidden sm:block">
                   <p className="text-sm font-black text-white leading-none">Super User</p>
                   <p className="text-[10px] font-bold text-dstech-accent uppercase tracking-widest mt-1">Authorized Access</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-dstech-accent to-blue-600 flex items-center justify-center text-black font-black">
                   AD
                </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative z-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

