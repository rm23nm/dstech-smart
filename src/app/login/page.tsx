"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Users, Briefcase, Lock, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role")?.toUpperCase();

  const [role, setRole] = useState<"ADMIN" | "EMPLOYEE" | "PARTNER">("PARTNER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialRoleParam === "ADMIN" || initialRoleParam === "EMPLOYEE" || initialRoleParam === "PARTNER") {
      setRole(initialRoleParam);
    }
  }, [initialRoleParam]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Mohon isi email dan password dengan benar.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        if (role === "PARTNER") {
          const partnerSession = {
            isLoggedIn: true,
            role: "PARTNER",
            name: email.split("@")[0].replace(/[._]/g, " ").toUpperCase(),
            email: email.trim(),
            refCode: `DST-${Math.floor(1000 + Math.random() * 9000)}`,
            loginTime: new Date().toISOString(),
          };
          localStorage.setItem("dstech_partner_auth", JSON.stringify(partnerSession));
          localStorage.setItem("dstech_auth_token", `dstech_tok_${Date.now()}`);
          setIsSubmitting(false);
          router.push("/affiliate");
        } else if (role === "ADMIN") {
          const adminSession = {
            isLoggedIn: true,
            role: "ADMIN",
            name: "Administrator DSTech",
            email: email.trim(),
            loginTime: new Date().toISOString(),
          };
          localStorage.setItem("dstech_admin_auth", JSON.stringify(adminSession));
          localStorage.setItem("dstech_auth_token", `dstech_admin_tok_${Date.now()}`);
          setIsSubmitting(false);
          router.push("/admin");
        } else {
          const employeeSession = {
            isLoggedIn: true,
            role: "EMPLOYEE",
            name: email.split("@")[0].replace(/[._]/g, " ").toUpperCase() || "Teknisi DSTech",
            email: email.trim(),
            loginTime: new Date().toISOString(),
          };
          localStorage.setItem("dstech_employee_auth", JSON.stringify(employeeSession));
          localStorage.setItem("dstech_auth_token", `dstech_emp_tok_${Date.now()}`);
          setIsSubmitting(false);
          router.push("/employee");
        }
      }
    }, 600);
  };

  return (
    <div className="w-full max-w-md space-y-10">
      <div className="text-center lg:text-left">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-dstech-blue hover:text-dstech-red mb-4">
          &larr; Kembali ke Beranda
        </Link>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Selamat Datang</h2>
        <p className="text-slate-400 font-bold mt-2">Masuk ke Portal sesuai peran Anda.</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-3 gap-2.5 p-2 bg-slate-100 rounded-3xl">
        <button
          type="button"
          onClick={() => setRole("PARTNER")}
          className={`py-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
            role === "PARTNER"
              ? "bg-white text-dstech-blue shadow-md font-black"
              : "text-slate-500 hover:text-slate-800 font-bold"
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-wider leading-none">Mitra</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("EMPLOYEE")}
          className={`py-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
            role === "EMPLOYEE"
              ? "bg-white text-dstech-red shadow-md font-black"
              : "text-slate-500 hover:text-slate-800 font-bold"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-wider leading-none">Karyawan</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("ADMIN")}
          className={`py-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
            role === "ADMIN"
              ? "bg-white text-slate-900 shadow-md font-black"
              : "text-slate-500 hover:text-slate-800 font-bold"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-wider leading-none">Admin</span>
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-2">
              Email / ID Pengguna
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={
                  role === "PARTNER"
                    ? "partner@dstechsmart.com"
                    : role === "ADMIN"
                    ? "admin@dstechsmart.com"
                    : "karyawan@dstechsmart.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-dstech-blue focus:bg-white transition-all font-bold text-sm outline-none"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-dstech-blue focus:bg-white transition-all font-bold text-sm outline-none"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-dstech-blue focus:ring-0"
            />
            <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors">
              Ingat Saya
            </span>
          </label>
          <a href="#" className="text-xs font-black text-dstech-red hover:underline">
            Lupa Password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`h-14 w-full rounded-2xl flex items-center justify-center gap-3 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl active:scale-95 ${
            role === "ADMIN"
              ? "bg-slate-900 hover:bg-black shadow-slate-900/30"
              : role === "EMPLOYEE"
              ? "bg-dstech-red hover:bg-red-700 shadow-red-500/30"
              : "bg-dstech-blue hover:bg-blue-700 shadow-blue-500/30"
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Masuk Sebagai {role === "PARTNER" ? "Mitra" : role === "ADMIN" ? "Admin" : "Karyawan"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-6 border-t border-slate-100 text-center space-y-2">
        {role === "PARTNER" && (
          <p className="text-xs text-slate-500 font-medium">
            Belum terdaftar sebagai Mitra Afiliasi?{" "}
            <Link href="/affiliate/register" className="font-bold text-dstech-blue hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        )}
        <p className="text-xs text-slate-400 font-medium">
          Butuh bantuan akses?{" "}
          <a href="https://wa.me/6282259494242" target="_blank" rel="noopener noreferrer" className="text-dstech-blue hover:underline font-bold">
            Hubungi CS WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Side: Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-dstech-blue relative flex-col justify-between p-16 xl:p-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_#e31e2430_0%,_transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="w-44 h-14 relative brightness-200">
            <Image src="/logo.png" alt="DSTech Logo" fill className="object-contain" priority />
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-6xl xl:text-7xl font-black text-white leading-none tracking-tighter">
            Digital Command <br /> <span className="text-white/60">Center.</span>
          </h1>
          <p className="text-lg text-white/70 font-medium max-w-lg leading-relaxed">
            Akses terpusat untuk Manajemen Inventaris, Jaringan Kemitraan Afiliasi, dan Kendali Operasional PT. DSTech Smart Perkasa.
          </p>
          <div className="space-y-4 pt-6 border-t border-white/10">
            {[
              "Enkripsi Keamanan Sesi 256-bit",
              "Monitoring Transaksi & Referral Real-time",
              "Integrasi Terisolasi Prefix dstech_",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-dstech-red shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
          &copy; 2026 PT. DSTech Smart Perkasa &bull; Solusi Keamanan Terpadu
        </div>
      </div>

      {/* Right Side: Login Form with Suspense Boundary */}
      <div className="flex-1 bg-white p-6 sm:p-12 md:p-16 flex flex-col justify-center items-center relative">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-dstech-blue animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-400">Memuat portal login...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
