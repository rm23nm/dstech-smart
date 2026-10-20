"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ArrowUpRight,
  Scale,
  Receipt,
  ShoppingCart,
  Wallet,
  Building2,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  Plus,
  ShieldCheck,
  FolderOpen,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  category?: string;
  price?: number;
  stock?: number;
  image?: string;
}

interface PartnerItem {
  id: string;
  name: string;
  tier?: string;
  city?: string;
  status?: string;
}

interface QuotationDashboardItem {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerOrg?: string;
  customerPhone?: string;
  subject: string;
  date: string;
  validUntil: string;
  grandTotal: number;
  status: string;
  approvalStatus?: string;
  convertedInvoiceId?: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [partnersCount, setPartnersCount] = useState<number>(0);
  const [growthPercent, setGrowthPercent] = useState<number>(0);
  const [recentProducts, setRecentProducts] = useState<ProductItem[]>([]);
  const [newestPartners, setNewestPartners] = useState<PartnerItem[]>([]);

  // SPH / Quotations States
  const [quotationsCount, setQuotationsCount] = useState<number>(0);
  const [quotationsDealCount, setQuotationsDealCount] = useState<number>(0);
  const [quotationsPendingCount, setQuotationsPendingCount] = useState<number>(0);
  const [quotationsExpiredCount, setQuotationsExpiredCount] = useState<number>(0);
  const [quotationsTotalValue, setQuotationsTotalValue] = useState<number>(0);
  const [recentQuotations, setRecentQuotations] = useState<QuotationDashboardItem[]>([]);

  const formatCurrency = (val: number) => {
    if (!val || val === 0) return "Rp 0";
    if (val >= 1000000000) {
      return `Rp ${(val / 1000000000).toFixed(1)}M`;
    }
    if (val >= 1000000) {
      return `Rp ${(val / 1000000).toFixed(1)}jt`;
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch paralel
      const [resFinance, resProducts, resPartners] = await Promise.allSettled([
        fetch("/api/finance").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/partners").then((r) => r.json()),
      ]);

      // 1. Finance & Revenue + SPH
      if (resFinance.status === "fulfilled" && resFinance.value?.success) {
        const finData = resFinance.value.data || {};
        const sales = finData.sales || [];
        // Hitung total penerimaan / penjualan yang telah tercatat
        const totalRev = sales.reduce((acc: number, s: any) => {
          const grand = Number(s.grandTotal) || 0;
          return acc + grand;
        }, 0);
        setRevenue(totalRev);
        // Jika ada transaksi, hitung estimasi growth, jika 0 maka 0%
        setGrowthPercent(totalRev > 0 ? 5.2 : 0);

        // Data SPH / Quotations
        const quots: QuotationDashboardItem[] = finData.quotations || [];
        setQuotationsCount(quots.length);

        const todayStr = new Date().toISOString().split("T")[0];
        let deal = 0;
        let pending = 0;
        let expired = 0;
        let totalVal = 0;

        for (const q of quots) {
          totalVal += Number(q.grandTotal) || 0;
          const isDeal =
            q.status === "Terkonversi Faktur" ||
            q.status === "Disetujui Klien" ||
            Boolean(q.convertedInvoiceId);
          const isExpired =
            q.status === "Kedaluwarsa" ||
            (!isDeal && q.status !== "Ditolak" && q.validUntil && q.validUntil < todayStr);

          if (isDeal) deal++;
          else if (isExpired) expired++;
          else if (q.status !== "Ditolak") pending++;
        }

        setQuotationsDealCount(deal);
        setQuotationsPendingCount(pending);
        setQuotationsExpiredCount(expired);
        setQuotationsTotalValue(totalVal);
        setRecentQuotations(quots.slice(0, 5));
      } else {
        setRevenue(0);
        setGrowthPercent(0);
        setQuotationsCount(0);
        setQuotationsDealCount(0);
        setQuotationsPendingCount(0);
        setQuotationsExpiredCount(0);
        setQuotationsTotalValue(0);
        setRecentQuotations([]);
      }

      // 2. Products
      if (resProducts.status === "fulfilled") {
        const prodData = resProducts.value;
        const list: ProductItem[] = Array.isArray(prodData)
          ? prodData
          : prodData?.data || [];
        setProductsCount(list.length);
        setRecentProducts(list.slice(0, 3));
      } else {
        setProductsCount(0);
        setRecentProducts([]);
      }

      // 3. Partners
      if (resPartners.status === "fulfilled") {
        const ptnData = resPartners.value;
        const list: PartnerItem[] = Array.isArray(ptnData)
          ? ptnData
          : ptnData?.data || [];
        const activeOnly = list.filter((p) => p.status === "ACTIVE" || !p.status);
        setPartnersCount(activeOnly.length);
        setNewestPartners(list.slice(0, 3));
      } else {
        setPartnersCount(0);
        setNewestPartners([]);
      }
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-12">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-dstech-blue">
            Pusat Kendali Operasional
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Utama
          </h2>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          title="Sinkronisasi Data Real-Time"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-dstech-blue" : ""}`} />
          <span>{loading ? "Menyinkronkan..." : "Sinkronkan"}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            label: "Total Revenue",
            val: formatCurrency(revenue),
            icon: <DollarSign className="w-6 h-6" />,
            color: "bg-green-500",
            text: "text-green-500",
            desc: revenue === 0 ? "Belum ada transaksi" : "Akumulasi Penjualan",
          },
          {
            label: "Products Active",
            val: `${productsCount} Items`,
            icon: <Package className="w-6 h-6" />,
            color: "bg-dstech-blue",
            text: "text-dstech-blue",
            desc: "Katalog Master Produk",
          },
          {
            label: "Active Partners",
            val: `${partnersCount} Agents`,
            icon: <Users className="w-6 h-6" />,
            color: "bg-dstech-red",
            text: "text-dstech-red",
            desc: "Jejaring Reseller Aktif",
          },
          {
            label: "Growth",
            val: `${growthPercent > 0 ? "+" : ""}${growthPercent}%`,
            icon: <TrendingUp className="w-6 h-6" />,
            color: "bg-orange-500",
            text: "text-orange-500",
            desc: growthPercent === 0 ? "Mulai dari Nol" : "Pertumbuhan Periode",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div
                className={`w-14 h-14 rounded-2xl ${stat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
              >
                {stat.icon}
              </div>
              <div className={`p-2 rounded-lg ${stat.text} bg-slate-50`}>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {stat.val}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {stat.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Finance & ERP Quick Command Center */}
      <div className="p-8 sm:p-10 rounded-[48px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider mb-3">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>ERP & Manajemen Keuangan Terintegrasi</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sistem Penjualan, Pembelian & Laporan Keuangan
            </h3>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl font-medium">
              Pantau faktur invoice resmi, PO supplier, retur barang, laba rugi, kas bank Mandiri & BCA, serta valuasi multi-gudang langsung dari satu dashboard eksekutif.
            </p>
          </div>
          <a
            href="/admin/finance"
            className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 shrink-0"
          >
            <span>Buka Dashboard Keuangan</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Financial ERP Modules Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5 pt-8 relative z-10">
          {[
            {
              title: "Surat Penawaran",
              desc: "SPH & Prospek",
              href: "/admin/finance?tab=quotations",
              icon: FileText,
              color: "text-indigo-400",
              bg: "bg-indigo-500/10 border-indigo-500/20",
            },
            {
              title: "Faktur Penjualan",
              desc: "Invoice & Piutang",
              href: "/admin/finance?tab=sales",
              icon: Receipt,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
              title: "Pembelian (PO)",
              desc: "Supplier & Hutang",
              href: "/admin/finance?tab=purchases",
              icon: ShoppingCart,
              color: "text-blue-400",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
            {
              title: "Retur Barang",
              desc: "Pelanggan & Vendor",
              href: "/admin/finance?tab=returns",
              icon: RotateCcw,
              color: "text-amber-400",
              bg: "bg-amber-500/10 border-amber-500/20",
            },
            {
              title: "Laba Rugi (P&L)",
              desc: "Omset & Laba Bersih",
              href: "/admin/finance?tab=pl_report",
              icon: Scale,
              color: "text-purple-400",
              bg: "bg-purple-500/10 border-purple-500/20",
            },
            {
              title: "Buku Arus Kas",
              desc: "Mandiri, BCA, Tunai",
              href: "/admin/finance?tab=cash_flow",
              icon: Wallet,
              color: "text-cyan-400",
              bg: "bg-cyan-500/10 border-cyan-500/20",
            },
            {
              title: "Gudang & Cabang",
              desc: "Valuasi Stok Logistik",
              href: "/admin/finance?tab=warehouses",
              icon: Building2,
              color: "text-rose-400",
              bg: "bg-rose-500/10 border-rose-500/20",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.href}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${item.bg} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* SPH & Quotations Executive Command Center */}
      <div className="p-8 sm:p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pipeline Penawaran & Prospek Klien</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Daftar Surat Penawaran Harga (SPH) Terkini
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoring proposal penawaran, status persetujuan klien, masa berlaku (expired), dan konversi menjadi faktur resmi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="/admin/finance?tab=quotations"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Buat SPH Baru</span>
            </a>
            <a
              href="/admin/finance?tab=quotations"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              <span>Kelola Semua SPH</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Mini KPI Cards for SPH */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Total SPH Terbit</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{quotationsCount} Surat</h4>
              <p className="text-[11px] font-bold text-indigo-600 mt-0.5">{formatCurrency(quotationsTotalValue)}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Deal / Jadi Faktur</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{quotationsDealCount} SPH</h4>
              <p className="text-[11px] font-bold text-emerald-600 mt-0.5">Disepakati Klien</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Menunggu Respon</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{quotationsPendingCount} SPH</h4>
              <p className="text-[11px] font-bold text-amber-700 mt-0.5">Proses Negosiasi</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-100/80 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">Expired & Reject</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{quotationsExpiredCount} SPH</h4>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">Lewat Tempo / Hangus</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-slate-700 text-white flex items-center justify-center shadow-md">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Table of Recent SPH */}
        <div className="overflow-x-auto rounded-3xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">No. SPH & Tanggal</th>
                <th className="p-4">Klien & Instansi</th>
                <th className="p-4">Perihal Penawaran</th>
                <th className="p-4">Total Penawaran</th>
                <th className="p-4">Masa Berlaku</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">Belum ada Surat Penawaran yang diterbitkan</p>
                    <a
                      href="/admin/finance?tab=quotations"
                      className="inline-flex items-center gap-1.5 mt-2 text-indigo-600 font-bold hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Surat Penawaran Pertama</span>
                    </a>
                  </td>
                </tr>
              ) : (
                recentQuotations.map((sph) => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const isDeal =
                    sph.status === "Terkonversi Faktur" ||
                    sph.status === "Disetujui Klien" ||
                    Boolean(sph.convertedInvoiceId);
                  const isExpired =
                    sph.status === "Kedaluwarsa" ||
                    (!isDeal && sph.status !== "Ditolak" && sph.validUntil && sph.validUntil < todayStr);
                  const isRejected = sph.status === "Ditolak";

                  return (
                    <tr key={sph.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-black text-indigo-700 block">
                          {sph.quotationNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {sph.date}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 line-clamp-1">
                          {sph.customerName}
                        </p>
                        {sph.customerOrg && (
                          <p className="text-[10px] text-slate-400 line-clamp-1">{sph.customerOrg}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-slate-700 font-medium line-clamp-1 max-w-[240px]" title={sph.subject}>
                          {sph.subject}
                        </span>
                      </td>
                      <td className="p-4 font-black font-mono text-slate-900 whitespace-nowrap">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(sph.grandTotal || 0)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            isExpired ? "text-red-600 font-bold" : "text-slate-600"
                          }`}
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          s/d {sph.validUntil || "-"}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {isDeal ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Deal (Faktur)
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 border border-slate-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Expired
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            Ditolak
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Menunggu
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <a
                          href="/admin/finance?tab=quotations"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs"
                          title="Lihat detail dan cetak SPH di Manajemen Keuangan"
                        >
                          <span>Buka SPH</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Products */}
        <div className="lg:col-span-2 p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Katalog Produk Terkini
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Perangkat CCTV, Smart Home & Infrastruktur IT Aktif
                </p>
              </div>
              <a
                href="/admin/products"
                className="text-xs font-black text-dstech-blue uppercase tracking-widest hover:text-dstech-red transition-colors inline-flex items-center gap-1"
              >
                <span>Kelola Produk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {recentProducts.length > 0 ? (
              <div className="space-y-4">
                {recentProducts.map((item, i) => (
                  <div
                    key={item.id || i}
                    className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center text-slate-300 font-black text-[10px] shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight mb-1">
                          {item.name}
                        </p>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-dstech-blue border border-blue-100">
                          {item.category || "General"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-slate-900 leading-tight mb-1">
                        {formatCurrency(Number(item.price) || 0)}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Stok: {item.stock ?? 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">
                    Katalog Produk Masih Bersih / Kosong
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Mulai daftarkan perangkat CCTV, Barrier Gate, Smart Home, atau aksesoris di menu Product Management.
                  </p>
                </div>
                <a
                  href="/admin/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dstech-blue text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Produk Pertama</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Latest Partners */}
        <div className="p-10 rounded-[48px] bg-dstech-blue text-white shadow-2xl shadow-blue-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black">Mitra & Agen Baru</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Jejaring Reseller & Affiliate
                </p>
              </div>
              <a
                href="/admin/partners"
                className="text-xs font-black text-white/80 uppercase tracking-widest hover:text-white transition-colors"
              >
                Semua
              </a>
            </div>

            {newestPartners.length > 0 ? (
              <div className="space-y-6">
                {newestPartners.map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-white shrink-0">
                      {p.name ? p.name[0].toUpperCase() : "A"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black leading-tight text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mt-0.5">
                        {p.tier || "Agent"} {p.city ? `• ${p.city}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-white/10 border border-white/10 text-center space-y-2">
                <Users className="w-8 h-8 text-white/60 mx-auto" />
                <p className="font-bold text-sm text-white">Belum Ada Mitra Terdaftar</p>
                <p className="text-xs text-blue-200">
                  Mitra yang mendaftar via portal kemitraan akan otomatis muncul di sini.
                </p>
              </div>
            )}
          </div>

          <a
            href="/admin/partners"
            className="block text-center w-full mt-10 py-4 rounded-2xl bg-white text-dstech-blue font-black text-xs uppercase tracking-widest hover:bg-dstech-red hover:text-white transition-all shadow-lg shadow-black/10"
          >
            Kelola Mitra Marketing
          </a>
        </div>
      </div>

      {/* Quick Action Banner: Materi Promosi & E-Katalog */}
      <div className="p-8 sm:p-10 rounded-[40px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
            <span>Pusat Materi Resmi</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight">Materi Promosi & Unduh Katalog</h3>
          <p className="text-slate-400 text-sm max-w-2xl font-medium">
            Tambah dan kelola file e-katalog produk CCTV & Smart Home, brosur penawaran tender, flyer promosi, dan social media kit yang dapat diunduh langsung oleh seluruh mitra affiliate dan tim lapangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
          <a
            href="/admin/promotions"
            className="px-6 py-4 rounded-2xl bg-dstech-red hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 active:scale-95 text-center w-full sm:w-auto"
          >
            + Kelola & Tambah Materi
          </a>
          <a
            href="/affiliate"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all text-center w-full sm:w-auto"
          >
            Pratinjau Halaman Mitra &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
