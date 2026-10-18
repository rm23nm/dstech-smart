"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Link as LinkIcon,
  Download,
  TrendingUp,
  ShoppingBag,
  Globe,
  Copy,
  CheckCircle2,
  Lock,
  LogOut,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Loader2,
  ExternalLink,
  Store
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PartnerSession {
  isLoggedIn: boolean;
  role: string;
  name: string;
  email: string;
  refCode: string;
  loginTime: string;
}

export default function AffiliateDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<PartnerSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [copied, setCopied] = useState(false);

  // Quick Login form state if not logged in
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Check auth on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const partnerAuth = localStorage.getItem("dstech_partner_auth");
      const adminAuth = localStorage.getItem("dstech_admin_auth");

      if (partnerAuth) {
        try {
          const parsed = JSON.parse(partnerAuth);
          if (parsed.isLoggedIn) {
            setSession(parsed);
            setIsCheckingAuth(false);
            return;
          }
        } catch {
          // parse error
        }
      } else if (adminAuth) {
        try {
          const parsed = JSON.parse(adminAuth);
          if (parsed.isLoggedIn) {
            setSession({
              isLoggedIn: true,
              role: "ADMIN",
              name: parsed.name || "Administrator",
              email: parsed.email || "admin@dstechsmart.com",
              refCode: "DST-ADMIN-01",
              loginTime: parsed.loginTime,
            });
            setIsCheckingAuth(false);
            return;
          }
        } catch {
          // parse error
        }
      }
      setSession(null);
      setIsCheckingAuth(false);
    }
  }, []);

  // Quick inline login
  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Email dan password wajib diisi.");
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      const partnerData: PartnerSession = {
        isLoggedIn: true,
        role: "PARTNER",
        name: loginEmail.split("@")[0].replace(/[._]/g, " ").toUpperCase(),
        email: loginEmail.trim(),
        refCode: `DST-PART-${Math.floor(1000 + Math.random() * 9000)}`,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem("dstech_partner_auth", JSON.stringify(partnerData));
      localStorage.setItem("dstech_auth_token", `dstech_tok_${Date.now()}`);
      setSession(partnerData);
      setIsLoggingIn(false);
    }, 600);
  };

  // Logout handler
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("dstech_partner_auth");
      localStorage.removeItem("dstech_auth_token");
    }
    setSession(null);
  };

  // Copy referral link
  const handleCopyLink = () => {
    const link = `https://dstechsmart.com/shop?ref=${session?.refCode || "DST-0822"}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Loading state during auth check
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-dstech-blue animate-spin mb-4" />
        <h2 className="text-xl font-black text-slate-800">Memeriksa Akses Kemitraan...</h2>
        <p className="text-slate-400 text-xs mt-1">Mengamankan sesi portal PT. DSTech Smart Perkasa</p>
      </div>
    );
  }

  // Not Logged In: Show Protected Gatekeeper Screen
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans">
        <div className="max-w-xl w-full bg-white rounded-3xl sm:rounded-[40px] border border-slate-200/80 shadow-2xl p-8 sm:p-12 space-y-8 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-3">
            <div className="relative w-36 h-12 mx-auto mb-2">
              <Image src="/logo.png" alt="DSTech Logo" fill className="object-contain" priority />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Portal Mitra Memerlukan Login
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Halaman ini khusus untuk Mitra Afiliasi resmi. Silakan masuk dengan akun mitra Anda untuk mengakses link referral, statistik komisi, dan laporan penjualan.
            </p>
          </div>

          {loginError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Quick Login Form */}
          <form onSubmit={handleQuickLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Email Akun Mitra
              </label>
              <input
                type="email"
                required
                placeholder="nama@partner.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full h-13 px-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-dstech-blue focus:bg-white font-bold text-sm outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full h-13 px-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-dstech-blue focus:bg-white font-bold text-sm outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-13 rounded-2xl bg-dstech-blue hover:bg-dstech-red text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Masuk ke Dashboard Mitra</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <Link
              href="/login?role=partner"
              className="text-dstech-blue hover:text-dstech-red font-bold flex items-center gap-1"
            >
              Buka Halaman Login Penuh <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/affiliate/register"
              className="text-slate-500 hover:text-slate-900 font-bold"
            >
              Belum punya akun? <span className="text-dstech-red font-black">Daftar Mitra</span>
            </Link>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              &larr; Kembali ke Beranda Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Logged In: Show Partner Command Center
  const referralUrl = `https://dstechsmart.com/shop?ref=${session.refCode}`;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - Branded for Partners */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col sticky top-0 lg:h-screen bg-white z-20">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between lg:block">
          <div>
            <Link href="/" className="relative w-32 h-9 mb-2 block">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
            </Link>
            <span className="text-[10px] font-black text-dstech-blue uppercase tracking-widest flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Partner Command Center
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="lg:hidden p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <a
            href="#"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-dstech-blue text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20"
          >
            <TrendingUp className="w-4 h-4" /> Statistik Performa
          </a>
          <a
            href="#referral-tool"
            className="flex items-center gap-3.5 p-4 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-dstech-red font-bold text-xs uppercase tracking-wider transition-all"
          >
            <LinkIcon className="w-4 h-4" /> Link Referral
          </a>
          <a
            href="#marketing-assets"
            className="flex items-center gap-3.5 p-4 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-dstech-red font-bold text-xs uppercase tracking-wider transition-all"
          >
            <Download className="w-4 h-4" /> Asset Marketing
          </a>
          <Link
            href="/shop"
            target="_blank"
            className="flex items-center gap-3.5 p-4 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-dstech-blue font-bold text-xs uppercase tracking-wider transition-all"
          >
            <Store className="w-4 h-4" /> Buka E-Store DSTech
          </Link>
        </nav>

        {/* User Profile Badge & Logout */}
        <div className="p-6 border-t border-slate-100 bg-white space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Akun Aktif</p>
            <h4 className="text-sm font-black text-slate-900 truncate mt-0.5">{session.name}</h4>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">
              KODE: {session.refCode}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full h-11 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 lg:p-12 space-y-10 overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Halo, {session.name}!
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
              Status Kemitraan: <span className="text-emerald-500 font-black">Verified & Active</span> &bull; ID: {session.refCode}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/shop"
              className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-dstech-red text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Katalog Produk</span>
            </Link>
          </div>
        </header>

        {/* Top Earnings Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-dstech-blue/5 rounded-full -mr-8 -mt-8 transition-all group-hover:scale-150"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Total Komisi Didapat</p>
            <h3 className="text-3xl sm:text-4xl font-black text-dstech-blue">Rp 12.850.000</h3>
            <p className="text-xs font-bold text-slate-500 mt-3 flex items-center gap-1.5">
              Siap Cair: <span className="text-emerald-600 font-black">Rp 4.200.000</span>
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Total Transaksi Referral</p>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">42 Penjualan</h3>
            <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Naik 12% bulan ini
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-dstech-red text-white shadow-xl shadow-red-500/20 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-black text-white/70 uppercase tracking-wider mb-2">Kunjungan Referral</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white">1.248 Klik</h3>
            <p className="text-xs font-bold text-white/80 mt-3">Conversion Rate: 3.4%</p>
          </div>
        </div>

        {/* Affiliate Tools */}
        <div id="referral-tool" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Referral Link Tool */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white space-y-6 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Tautan Referral Anda</h3>
                <p className="text-xs font-bold text-slate-400">Bagikan untuk melacak komisi penjualan otomatis</p>
              </div>
            </div>

            <p className="text-slate-500 font-medium text-xs sm:text-sm leading-relaxed">
              Gunakan link unik ini pada sosial media, status WhatsApp, atau promosi klien Anda. Setiap pembelian hardware atau layanan yang berasal dari tautan ini akan memberikan komisi langsung ke akun Anda.
            </p>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-14 px-4 rounded-2xl bg-slate-50 flex items-center font-mono font-bold text-xs sm:text-sm text-slate-700 border border-slate-200 overflow-hidden truncate">
                {referralUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="h-14 px-5 rounded-2xl bg-slate-900 hover:bg-dstech-red text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-md shrink-0"
                title="Salin Tautan"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Tersalin!" : "Salin"}</span>
              </button>
            </div>
          </div>

          {/* Marketing Assets */}
          <div id="marketing-assets" className="p-8 rounded-3xl border border-slate-200 bg-white space-y-6 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-dstech-red flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Materi Promosi & Katalog</h3>
                <p className="text-xs font-bold text-slate-400">Unduh brosur resmi untuk presentasi ke klien</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href="/about-image.png"
                download
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-dstech-blue flex items-center justify-between transition-all group"
              >
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 group-hover:text-dstech-blue block">
                    Katalog CCTV & Smart Home
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">PDF Brosur Produk</span>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-dstech-blue shrink-0" />
              </a>

              <a
                href="/logo.png"
                download
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-dstech-red flex items-center justify-between transition-all group"
              >
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 group-hover:text-dstech-red block">
                    Social Media Kit
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Banner & Feed Template</span>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-dstech-red shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Sales History */}
        <div className="p-8 sm:p-10 rounded-3xl border border-slate-200 bg-white space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900">Riwayat Penjualan Terakhir</h3>
              <p className="text-xs font-medium text-slate-500">Daftar transaksi yang menggunakan kode referral {session.refCode}</p>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto">
              Realtime Synced
            </span>
          </div>

          <div className="space-y-3">
            {[
              { prod: "Paket CCTV Hikvision 4CH HD (Kawasan Industri Cilegon)", date: "16 Okt, 2026", fee: "Rp 350.000", status: "Paid" },
              { prod: "Smart Doorlock X-100 Biometric (Perumahan Citra)", date: "14 Okt, 2026", fee: "Rp 277.500", status: "Pending" },
              { prod: "Mesin Fingerprint ZKTeco (Kantor Logistik)", date: "10 Okt, 2026", fee: "Rp 240.000", status: "Paid" }
            ].map((sale, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <ShoppingBag className="w-5 h-5 text-dstech-blue" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{sale.prod}</p>
                    <p className="text-[10px] font-medium text-slate-400">{sale.date}</p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0">
                  <p className="font-black text-sm text-dstech-red">{sale.fee}</p>
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      sale.status === "Paid"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}
                  >
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
