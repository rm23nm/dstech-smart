"use client"

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, Image as ImageIcon, Users, LogOut, Bell, Shield, FolderTree, Menu, X, ExternalLink, ArrowRight, CheckCircle2, BookOpen, Scale } from 'lucide-react'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dstech_admin_auth')
      localStorage.removeItem('dstech_auth_token')
    }
    router.push('/login?role=admin')
  }

  const navItems = [
    { label: 'Dashboard', href: '/superadmin', icon: LayoutDashboard, exact: true },
    { label: 'Keuangan & ERP', href: '/superadmin/finance', icon: Scale, exact: false },
    { label: 'Produk & Komisi', href: '/superadmin/products', icon: Package, exact: false },
    { label: 'Kategori & Sub-Kategori', href: '/superadmin/categories', icon: FolderTree, exact: false },
    { label: 'User Management', href: '/admin/users', icon: Users, exact: false },
    { label: 'Affiliate Network', href: '/admin/partners', icon: Users, exact: false },
    { label: 'Manajemen Portfolio', href: '/superadmin/portfolios', icon: ImageIcon, exact: false },
    { label: 'Materi Promosi & Katalog', href: '/admin/promotions', icon: Package, exact: false },
    { label: 'KMS Teknisi (SOP & K3)', href: '/superadmin/kms', icon: BookOpen, exact: false },
    { label: 'Site Settings', href: '/admin/settings', icon: Shield, exact: false },
  ]

  const isItemActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="flex h-screen bg-[#020617] text-zinc-100 font-sans w-full overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-[#020617] border-r border-white/5 relative z-20">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <Link href="/superadmin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-dstech-accent flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="font-black text-xl tracking-tighter text-white">DSTech <span className="text-dstech-accent">Superadmin</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-8">
          <p className="px-8 text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase mb-4">KONTROL SISTEM UTAMA</p>
          <ul className="space-y-1.5 px-4">
            {navItems.map((item) => {
              const active = isItemActive(item)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
                      active
                        ? 'bg-dstech-accent/15 text-dstech-accent border border-dstech-accent/30 shadow-sm'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-dstech-accent' : 'text-zinc-500'}`} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="px-4 mt-6">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Portal Standar</p>
              <Link
                href="/admin"
                className="flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-dstech-accent transition-colors"
              >
                <span>Ke Admin Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full h-screen overflow-hidden relative">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-dstech-accent/5 rounded-full blur-[120px] -z-0"></div>

        <header className="h-20 flex items-center justify-between px-6 md:px-8 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
              Superadmin Console <span className="text-zinc-500 text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 hidden sm:inline">v2.5.0</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
             <button className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                <Bell className="w-4 h-4 text-zinc-400" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-zinc-950"></span>
             </button>
             <div className="flex items-center gap-3 border-l border-white/10 pl-4 md:pl-6">
                <div className="text-right hidden sm:block">
                   <p className="text-sm font-black text-white leading-none">Super User</p>
                   <p className="text-[10px] font-bold text-dstech-accent uppercase tracking-widest mt-1">Authorized Access</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-dstech-accent to-blue-600 flex items-center justify-center text-black font-black text-sm">
                   SA
                </div>
             </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-b border-white/10 p-4 space-y-2 relative z-30 animate-fadeIn">
            {navItems.map((item) => {
              const active = isItemActive(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${
                    active ? 'bg-dstech-accent/15 text-dstech-accent' : 'text-zinc-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsLogoutModalOpen(true)
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs"
              >
                <LogOut className="w-4 h-4" />
                Keluar Sesi
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Modal Konfirmasi Logout */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <LogOut className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Konfirmasi Keluar Sesi</h3>
              <p className="text-xs text-zinc-400 font-medium mt-1">
                Apakah Anda yakin ingin keluar dari konsol Superadmin PT. DSTech Smart Perkasa?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


