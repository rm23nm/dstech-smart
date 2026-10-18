"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  UserCog,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  X,
  Menu,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface SearchResult {
  title: string;
  category: "Navigasi" | "Produk" | "Mitra" | "User" | "Pengaturan";
  url: string;
  desc: string;
}

const SEARCH_CATALOG: SearchResult[] = [
  { title: "Dashboard Overview", category: "Navigasi", url: "/admin", desc: "Ringkasan metrik omset, stok, dan partner" },
  { title: "Manajemen Produk (CRUD)", category: "Produk", url: "/admin/products", desc: "Tambah, edit, hapus inventori CCTV & Smart Home" },
  { title: "CCTV Hikvision 4CH", category: "Produk", url: "/admin/products", desc: "Paket CCTV Security 4 Channel HD" },
  { title: "Smart Doorlock X-100", category: "Produk", url: "/admin/products", desc: "Doorlock biometrik RFID & Fingerprint" },
  { title: "Running Text LED Red Outdoor", category: "Produk", url: "/admin/products", desc: "Display running text outdoor WiFi" },
  { title: "Fingerprint ZKTeco", category: "Produk", url: "/admin/products", desc: "Mesin absensi sidik jari & RFID" },
  { title: "User Management", category: "User", url: "/admin/users", desc: "Kelola akun Superadmin, Admin, Teknisi, & Klien" },
  { title: "Daftar Akun Karyawan & Teknisi", category: "User", url: "/admin/users", desc: "Manajemen hak akses staf operasional" },
  { title: "Affiliate Network & Komisi", category: "Mitra", url: "/admin/partners", desc: "Daftar agen referral dan persetujuan komisi" },
  { title: "Ahmad Rizky Pratama (Gold Agent)", category: "Mitra", url: "/admin/partners", desc: "Mitra referral wilayah Cilegon" },
  { title: "Siti Sarah Nuraini (Platinum)", category: "Mitra", url: "/admin/partners", desc: "Mitra referral wilayah Serang" },
  { title: "Pengaturan Situs & Kontak", category: "Pengaturan", url: "/admin/settings", desc: "Atur WhatsApp CS, Email, Alamat kantor Cilegon" },
  { title: "Profil PT DSTech Smart Perkasa", category: "Pengaturan", url: "/admin/settings", desc: "Legalitas NIB, NPWP, & Akun Media Sosial" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mobile sidebar state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Logout modal state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = SEARCH_CATALOG.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("dstech_admin_auth");
        localStorage.removeItem("dstech_auth_token");
        sessionStorage.clear();
      }
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      router.push("/login");
    }, 600);
  };

  const navLinks = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Product Management",
      href: "/admin/products",
      icon: Package,
      active: pathname.startsWith("/admin/products"),
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: UserCog,
      active: pathname.startsWith("/admin/users"),
    },
    {
      label: "Affiliate Network",
      href: "/admin/partners",
      icon: Users,
      active: pathname.startsWith("/admin/partners"),
    },
    {
      label: "Site Settings",
      href: "/admin/settings",
      icon: Settings,
      active: pathname.startsWith("/admin/settings"),
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-80 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-30">
        <div className="p-8 flex flex-col items-center border-b border-slate-100">
          <Link href="/admin" className="relative w-36 h-10 mb-2 block">
            <Image src="/logo.png" alt="DSTech Logo" fill className="object-contain" priority />
          </Link>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-dstech-blue" /> Admin Control Center
          </span>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all group ${
                  isActive
                    ? "bg-dstech-blue text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-600 hover:bg-slate-50 hover:text-dstech-blue"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-dstech-blue"}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isActive
                      ? "opacity-80 translate-x-0.5"
                      : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            id="admin-logout-btn"
            className="flex items-center gap-3.5 p-4 w-full rounded-2xl text-red-600 hover:bg-red-50 font-bold text-sm transition-all group cursor-pointer"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Keluar (Log Out)</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="relative w-32 h-9">
                <Image src="/logo.png" alt="DSTech Logo" fill className="object-contain" />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = item.active;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3.5 rounded-xl font-bold text-sm transition-all ${
                      isActive
                        ? "bg-dstech-blue text-white shadow-md shadow-blue-500/20"
                        : "text-slate-600 hover:bg-slate-50 hover:text-dstech-blue"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            <div className="p-5 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="flex items-center gap-3 p-3.5 w-full rounded-xl text-red-600 hover:bg-red-50 font-bold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Log Out)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-24 bg-white border-b border-slate-200 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                Admin Control Center
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 hidden sm:block">
                PT. DSTech Smart Perkasa — Security & IT Solutions
              </p>
            </div>
          </div>

          {/* Interactive Global Search & Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Quick Search Bar */}
            <div ref={searchRef} className="relative w-44 sm:w-72 md:w-80">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari produk, user, mitra..."
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  id="admin-global-search-input"
                  className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Dropdown Results */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Hasil Pencarian ({searchResults.length})</span>
                    <span className="text-[10px] text-slate-400">Tekan pilihan untuk navigasi</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {searchResults.length > 0 ? (
                      searchResults.map((res, idx) => (
                        <Link
                          key={idx}
                          href={res.url}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="p-3 hover:bg-blue-50/50 flex items-start gap-3 transition-colors block text-left group"
                        >
                          <div className="mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 group-hover:bg-dstech-blue group-hover:text-white transition-colors">
                            {res.category}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-dstech-blue transition-colors truncate">
                              {res.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {res.desc}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-dstech-blue group-hover:translate-x-0.5 transition-all self-center" />
                        </Link>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Tidak ada hasil yang sesuai dengan kata kunci &quot;{searchQuery}&quot;.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-100">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-dstech-blue to-indigo-600 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20">
                AD
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-black text-slate-900 leading-tight">Admin DSTech</p>
                <p className="text-[10px] font-bold text-dstech-blue uppercase tracking-wider">Super User</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-6 sm:p-10 flex-1">
          {children}
        </div>
      </main>

      {/* Modal Dialog Konfirmasi Logout */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isLoggingOut && setIsLogoutModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/10">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 text-center mb-2">
              Konfirmasi Keluar Sistem
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-8 leading-relaxed">
              Apakah Anda yakin ingin keluar dari Admin Control Center PT. DSTech Smart Perkasa? Sesi login aktif Anda akan diakhiri.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleConfirmLogout}
                id="confirm-logout-btn"
                className="flex-1 py-3.5 px-4 rounded-2xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700 shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Ya, Keluar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
