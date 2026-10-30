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
  FolderTree,
  FolderKanban,
  FileDown,
  BookOpen,
  Scale,
  Wrench,
  Warehouse,
  CalendarCheck,
  FileSignature,
  Banknote,
  ShoppingBag,
  Mail,
  Target,
  Radio,
  Video,
  MessageSquare,
  Sparkles,
  Building2,
} from "lucide-react";
import { checkUserPermission } from "@/utils/dstech_permissions";
import GlobalCallListener from "@/components/GlobalCallListener";

interface SearchResult {
  title: string;
  category: "Navigasi" | "Produk" | "Mitra" | "User" | "Pengaturan" | "Keuangan" | "Operasional";
  url: string;
  desc: string;
}

const SEARCH_CATALOG: SearchResult[] = [
  { title: "Dashboard Overview", category: "Navigasi", url: "/admin", desc: "Ringkasan metrik omset, stok, dan partner" },
  { title: "Kantor Virtual AI (3D Simulation)", category: "Operasional", url: "/admin/virtual-office", desc: "Simulasi 3D kantor digital interaktif, divisi armada karyawan AI & komando direktur" },
  { title: "Email & Webmail Perusahaan", category: "Operasional", url: "/admin/mail", desc: "Kelola akun email resmi, kotak masuk webmail dan kirim email via SMTP SSL" },
  { title: "Kontrak Kerja & Rekrutmen", category: "Operasional", url: "/admin/contracts", desc: "Kelola kontrak kerja staf bulanan/tahunan dan teknisi harian (Tipe 1 & 2), cetak PKWT resmi A4" },
  { title: "Rekap Absensi Karyawan & Teknisi", category: "Operasional", url: "/admin/attendance", desc: "Pantau presensi masuk/pulang, titik GPS Google Maps, dan riwayat kehadiran" },
  { title: "Download Laporan Absensi (Excel & PDF)", category: "Operasional", url: "/admin/attendance", desc: "Unduh file CSV/Excel dan cetak lembar rekapitulasi kehadiran A4 resmi" },
  { title: "Pesan Tim & Chat Mandiri (DStech Connect)", category: "Operasional", url: "/admin/chat", desc: "Pesan instan tim ala WhatsApp, panggilan audio/video WebRTC, berbagi invoice & SPK penugasan" },
  { title: "Video Meeting & Ruang Rapat Online", category: "Operasional", url: "/admin/meetings", desc: "Ruang rapat video conference interaktif smartphone staf, survey online & briefing teknisi" },
  { title: "Briefing Pagi Teknisi (Meeting)", category: "Operasional", url: "/meeting/briefing-pagi-teknisi", desc: "Ruang video meeting koordinasi pagi teknisi lapangan" },
  { title: "Penggajian & Rekap Gaji (Payroll)", category: "Keuangan", url: "/admin/payroll", desc: "Rekapitulasi gaji bulanan staf & teknisi, setting auto payday, cetak slip & rekap A4 resmi" },
  { title: "Kalkulator Gaji & Slip Gaji (Payroll)", category: "Keuangan", url: "/admin/payroll", desc: "Hitung otomatis gaji pokok, upah lembur, uang kehadiran, dan cetak slip gaji A4" },
  { title: "Persetujuan Lembur Teknisi (Overtime)", category: "Operasional", url: "/admin/attendance", desc: "Verifikasi dan persetujuan pengajuan jam lembur teknisi proyek lapangan" },
  { title: "Cetak Rekap Presensi Bulanan", category: "Operasional", url: "/admin/attendance", desc: "Unduh dan cetak rekap absensi staf resmi ber-Kop Surat DSTech" },
  { title: "Jadwal & Tiket Maintenance", category: "Operasional", url: "/admin/maintenance", desc: "Kelola jadwal kunjungan rutin, servis darurat CCTV, dan penugasan teknisi lapangan" },
  { title: "Surat Tugas & BAST Maintenance", category: "Operasional", url: "/admin/maintenance", desc: "Cetak Berita Acara Kunjungan Pemeliharaan & SPK Teknisi ber-Kop Surat DSTech" },
  { title: "Keuangan & ERP Dashboard", category: "Keuangan", url: "/admin/finance", desc: "Ringkasan finansial, omset penjualan, pembelian PO, laba rugi, dan arus kas" },
  { title: "CRM & Prospek Klien", category: "Keuangan", url: "/admin/crm", desc: "Pipeline penjualan leads, Kanban prospek, aktivitas meeting/survey & deal closing" },
  { title: "Faktur & Penjualan", category: "Keuangan", url: "/admin/finance", desc: "Kelola faktur penjualan, status pelunasan, PPN, dan cetak invoice resmi" },
  { title: "Pembelian & Purchase Order (PO)", category: "Keuangan", url: "/admin/finance", desc: "Kelola pesanan pembelian material ke supplier dan status hutang" },
  { title: "Retur Penjualan & Pembelian", category: "Keuangan", url: "/admin/finance", desc: "Kelola klaim retur barang garansi pelanggan dan retur supplier" },
  { title: "Laporan Laba Rugi (P&L)", category: "Keuangan", url: "/admin/finance", desc: "Laporan pendapatan kotor, HPP / beban pokok, dan laba bersih operasional" },
  { title: "Buku Arus Kas (Cash Flow)", category: "Keuangan", url: "/admin/finance", desc: "Mutasi kas masuk dan keluar Bank Mandiri, BCA, dan Kas Tunai / Petty Cash" },
  { title: "Multi-Gudang & Cabang", category: "Keuangan", url: "/admin/finance", desc: "Valuasi stok antar gudang utama Cilegon, Serang, dan transit proyek" },
  { title: "Manajemen Stok & Gudang", category: "Operasional", url: "/admin/inventory", desc: "Kelola kartu stok real-time, stok per gudang Cilegon/Serang, stock opname, dan approval material teknisi" },
  { title: "Pengelolaan Aset Perusahaan", category: "Operasional", url: "/admin/assets", desc: "Inventaris alat kerja teknisi, armada operasional, depresiasi dan mutasi PIC" },
  { title: "Daftar Klien & Pelanggan (Customers)", category: "Keuangan", url: "/admin/finance", desc: "Direktori klien B2B industri, komersial, instansi, PIC, kontak WhatsApp, dan piutang" },
  { title: "Daftar Supplier & Vendor (Vendors)", category: "Keuangan", url: "/admin/finance", desc: "Direktori vendor CCTV, kabel, biometrik, PIC sales, rekening bank transfer PO, dan hutang" },
  { title: "Manajemen Pesanan E-Store (Orders)", category: "Operasional", url: "/admin/orders", desc: "Kelola pesanan marketplace pembeli, konfirmasi bukti transfer lunas, dan input resi armada DSTech" },
  { title: "Manajemen Produk (CRUD)", category: "Produk", url: "/admin/products", desc: "Tambah, edit, hapus inventori CCTV & Smart Home" },
  { title: "Kategori & Sub-Kategori", category: "Produk", url: "/admin/categories", desc: "Kelola klasifikasi kategori dan sub-kategori produk" },
  { title: "Portofolio Proyek", category: "Navigasi", url: "/admin/portfolios", desc: "Kelola dokumentasi proyek selesai, foto & video instalasi" },
  { title: "Materi Promosi & Katalog", category: "Navigasi", url: "/admin/promotions", desc: "Kelola e-katalog produk dan brosur unduhan mitra" },
  { title: "Live Streaming Studio", category: "Produk", url: "/admin/live-stream", desc: "Studio siaran langsung E-Store, sinkronisasi SmartPro AI Virtual Host, dan pin produk promo" },
  { title: "KMS Teknisi (SOP & K3)", category: "Navigasi", url: "/admin/kms", desc: "Kelola SOP instalasi CCTV, standar K3, firmware NVR & kontak PIC" },
  { title: "SOP Pemasangan IP Camera", category: "Navigasi", url: "/admin/kms", desc: "Dokumen standar SOP teknisi lapangan" },
  { title: "Standar Keselamatan Kerja K3", category: "Navigasi", url: "/admin/kms", desc: "Pedoman APD dan keselamatan kerja ketinggian" },
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

  // Current Admin User Session
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [unreadMailCount, setUnreadMailCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("dstech_admin_auth");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.role !== "SUPERADMIN" && parsed.role !== "ADMIN") {
            parsed.role = "ADMIN";
          }
          setCurrentUser(parsed);
        } catch {}
      } else {
        setCurrentUser({ name: "Administrator", role: "ADMIN" });
      }
    }

    fetch("/api/settings?t=" + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.data && data.data.logoUrl) {
          setLogoUrl(data.data.logoUrl);
        }
      })
      .catch((err) => console.error("Gagal load logo admin:", err));

    // Ambil jumlah pesanan baru / perlu tindakan
    fetch("/api/orders?t=" + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.data)) {
          const needAction = data.data.filter(
            (o: any) => o.status === "PAYMENT_PENDING" || o.status === "PAID" || o.status === "PROCESSING"
          ).length;
          setPendingOrdersCount(needAction);
        }
      })
      .catch((err) => console.error("Gagal load orders count:", err));

    // Ambil jumlah email belum dibaca di inbox
    fetch("/api/mail/messages?folder=inbox&t=" + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && typeof data.unreadInboxCount === "number") {
          setUnreadMailCount(data.unreadInboxCount);
        }
      })
      .catch((err) => console.error("Gagal load mail count:", err));
  }, []);

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
      id: "dashboard",
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      id: "virtual-office",
      label: "🏢 Kantor Virtual AI",
      href: "/admin/virtual-office",
      icon: Building2,
      active: pathname.startsWith("/admin/virtual-office"),
    },
    {
      id: "finance",
      label: "Keuangan & ERP",
      href: "/admin/finance",
      icon: Scale,
      active: pathname.startsWith("/admin/finance"),
    },
    {
      id: "crm",
      label: "CRM & Prospek Klien",
      href: "/admin/crm",
      icon: Target,
      active: pathname.startsWith("/admin/crm"),
    },
    {
      id: "maintenance",
      label: "Jadwal & Maintenance",
      href: "/admin/maintenance",
      icon: Wrench,
      active: pathname.startsWith("/admin/maintenance"),
    },
    {
      id: "attendance",
      label: "Rekap Absensi Staf",
      href: "/admin/attendance",
      icon: CalendarCheck,
      active: pathname.startsWith("/admin/attendance"),
    },
    {
      id: "chat",
      label: "💬 Pesan Tim (Chat)",
      href: "/admin/chat",
      icon: MessageSquare,
      active: pathname.startsWith("/admin/chat") || pathname.startsWith("/chat"),
    },
    {
      id: "meetings",
      label: "📹 Video Meeting",
      href: "/admin/meetings",
      icon: Video,
      active: pathname.startsWith("/admin/meetings") || pathname.startsWith("/meeting"),
    },
    {
      id: "payroll",
      label: "Penggajian & Rekap Gaji",
      href: "/admin/payroll",
      icon: Banknote,
      active: pathname.startsWith("/admin/payroll"),
    },
    {
      id: "contracts",
      label: "Kontrak Kerja & Rekrutmen",
      href: "/admin/contracts",
      icon: FileSignature,
      active: pathname.startsWith("/admin/contracts"),
    },
    {
      id: "inventory",
      label: "Manajemen Stok & Gudang",
      href: "/admin/inventory",
      icon: Warehouse,
      active: pathname.startsWith("/admin/inventory"),
    },
    {
      id: "assets",
      label: "Aset & Alat Kerja",
      href: "/admin/assets",
      icon: Wrench,
      active: pathname.startsWith("/admin/assets"),
    },
    {
      id: "products",
      label: "Product Management",
      href: "/admin/products",
      icon: Package,
      active: pathname.startsWith("/admin/products"),
    },
    {
      id: "orders",
      label: "Pesanan E-Store",
      href: "/admin/orders",
      icon: ShoppingBag,
      active: pathname.startsWith("/admin/orders"),
    },
    {
      id: "mail",
      label: "Email Perusahaan",
      href: "/admin/mail",
      icon: Mail,
      active: pathname.startsWith("/admin/mail"),
    },
    {
      id: "categories",
      label: "Kategori & Sub-Kategori",
      href: "/admin/categories",
      icon: FolderTree,
      active: pathname.startsWith("/admin/categories"),
    },
    {
      id: "portfolios",
      label: "Portofolio Proyek",
      href: "/admin/portfolios",
      icon: FolderKanban,
      active: pathname.startsWith("/admin/portfolios"),
    },
    {
      id: "promotions",
      label: "Materi Promosi & Katalog",
      href: "/admin/promotions",
      icon: FileDown,
      active: pathname.startsWith("/admin/promotions"),
    },
    {
      id: "livestream",
      label: "🔴 Live Streaming",
      href: "/admin/live-stream",
      icon: Radio,
      active: pathname.startsWith("/admin/live-stream"),
    },
    {
      id: "kms",
      label: "KMS Teknisi (SOP & K3)",
      href: "/admin/kms",
      icon: BookOpen,
      active: pathname.startsWith("/admin/kms"),
    },
    {
      id: "users",
      label: "User Management",
      href: "/admin/users",
      icon: UserCog,
      active: pathname.startsWith("/admin/users"),
    },
    {
      id: "partners",
      label: "Affiliate Network",
      href: "/admin/partners",
      icon: Users,
      active: pathname.startsWith("/admin/partners"),
    },
    {
      id: "settings",
      label: "Site Settings",
      href: "/admin/settings",
      icon: Settings,
      active: pathname.startsWith("/admin/settings"),
    },
  ];

  // Saring menu sidebar berdasarkan hak akses permissions pengguna
  const visibleNavLinks = navLinks.filter((item) => {
    if (!currentUser) return true;
    return checkUserPermission(currentUser.permissions, currentUser.role, item.id, "view");
  });

  const currentActiveMenu = navLinks.find((item) => item.active);
  const isAccessDenied =
    currentUser &&
    currentActiveMenu &&
    !checkUserPermission(currentUser.permissions, currentUser.role, currentActiveMenu.id, "view");

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-80 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-30">
        <div className="p-8 flex flex-col items-center border-b border-slate-100">
          <Link href="/admin" className="relative w-36 h-10 mb-2 block">
            <Image src={logoUrl || "/logo.png"} alt="DSTech Logo" fill className="object-contain" priority />
          </Link>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-dstech-blue" /> Admin Control Center
          </span>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {visibleNavLinks.map((item) => {
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
                {item.id === "orders" && pendingOrdersCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-dstech-red text-white shadow-sm animate-pulse">
                    {pendingOrdersCount}
                  </span>
                ) : item.id === "mail" && unreadMailCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-sm animate-pulse">
                    {unreadMailCount}
                  </span>
                ) : (
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive
                        ? "opacity-80 translate-x-0.5"
                        : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("dstech_open_copilot"))}
            className="flex items-center justify-between p-3.5 w-full rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-dstech-blue hover:from-blue-100 hover:to-indigo-100 font-bold text-xs transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-dstech-blue animate-pulse" />
              <span>Bantuan AI Copilot</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-blue-700 font-bold border border-blue-100 shadow-2xs">
              Tanya Panduan
            </span>
          </button>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            id="admin-logout-btn"
            className="flex items-center gap-3.5 p-3.5 w-full rounded-2xl text-red-600 hover:bg-red-50 font-bold text-sm transition-all group cursor-pointer"
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
                <Image src={logoUrl || "/logo.png"} alt="DSTech Logo" fill className="object-contain" />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
              {visibleNavLinks.map((item) => {
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
                    {item.id === "orders" && pendingOrdersCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-dstech-red text-white shadow-sm">
                        {pendingOrdersCount}
                      </span>
                    ) : item.id === "mail" && unreadMailCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-sm">
                        {unreadMailCount}
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-5 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent("dstech_open_copilot"));
                }}
                className="flex items-center justify-between p-3.5 w-full rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-dstech-blue font-bold text-xs"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-dstech-blue" />
                  <span>Bantuan AI Copilot</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-blue-700 font-bold border border-blue-100">
                  Tanya Panduan
                </span>
              </button>

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

            {/* Tombol Akses Bantuan AI Copilot (Hanya saat admin membutuhkan bantuan fitur) */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("dstech_open_copilot"))}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-dstech-blue border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Buka panduan modul & tanya Copilot Operasional"
            >
              <Sparkles className="w-3.5 h-3.5 text-dstech-blue" />
              <span>Bantuan AI</span>
            </button>

            {/* Profile Pill */}
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-100">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-dstech-blue to-indigo-600 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20">
                {currentUser?.name
                  ? currentUser.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "AD"}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-black text-slate-900 leading-tight">
                  {currentUser?.name || "Admin DSTech"}
                </p>
                <p className="text-[10px] font-bold text-dstech-blue uppercase tracking-wider">
                  {currentUser?.role || "Super User"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-6 sm:p-10 flex-1">
          {isAccessDenied ? (
            <div className="p-8 sm:p-12 text-center max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl my-12 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-5 border border-rose-200 shadow-sm">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Akses Menu Dibatasi</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Akun Anda (<strong className="text-slate-800">{currentUser?.name || "Pengguna"}</strong>) belum diberikan izin (Permission: View) untuk membuka halaman <strong className="text-slate-800">{currentActiveMenu?.label}</strong>.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 text-left text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pengguna:</span>
                  <span className="font-bold text-slate-800">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Role:</span>
                  <span className="font-bold text-slate-800">{currentUser?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Akses:</span>
                  <span className="font-bold text-rose-600">Dibatasi Administrator</span>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/admin"
                  className="px-6 py-3 rounded-2xl bg-dstech-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/20"
                >
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
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
      {/* Listener Panggilan Masuk Global Lintas Halaman */}
      <GlobalCallListener />
    </div>
  );
}
