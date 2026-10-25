"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  ExternalLink,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  Send,
  Wrench,
  DollarSign,
  ArrowRight,
  Sparkles,
  CreditCard,
  UserCheck,
  RotateCcw
} from "lucide-react";

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  qty: number;
  image?: string;
  category?: string;
}

interface ShippingAddress {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

interface TimelineItem {
  status: string;
  title: string;
  description: string;
  timestamp: string;
}

interface ComplaintData {
  category: string;
  description: string;
  expectedSolution: string;
  proofImage?: string | null;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  submittedAt: string;
  resolvedAt?: string | null;
  adminNotes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  includeInstallation: boolean;
  installationFee: number;
  shippingCourier: string;
  shippingCost: number;
  trackingNumber?: string;
  courierPhone?: string;
  paymentMethod: string;
  paymentBank: string;
  paymentProof?: string | null;
  paymentProofUploadedAt?: string | null;
  uniqueCode?: number;
  notes?: string;
  subtotal: number;
  grandTotal: number;
  status: "PAYMENT_PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURN";
  hasComplaint?: boolean;
  complaint?: ComplaintData;
  trackingTimeline: TimelineItem[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState<boolean>(false);
  const [isPreviewProofOpen, setIsPreviewProofOpen] = useState<boolean>(false);
  const [proofImageSrc, setProofImageSrc] = useState<string | null>(null);

  // Form Proses Pesanan
  const [actionType, setActionType] = useState<"confirm_payment" | "process_packing" | "ship_order" | "deliver_order" | "cancel_order" | "return_order">("confirm_payment");
  const [shipCourier, setShipCourier] = useState<string>("Armada Teknisi DSTech (Cilegon, Serang & Banten)");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [courierPhone, setCourierPhone] = useState<string>("");
  const [actionNote, setActionNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tanggapan Komplain
  const [complaintAdminNotes, setComplaintAdminNotes] = useState<string>("");
  const [isResolvingComplaint, setIsResolvingComplaint] = useState<boolean>(false);

  const handleResolveComplaint = async (orderId: string, status: "IN_PROGRESS" | "RESOLVED") => {
    setIsResolvingComplaint(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          action: "resolve_complaint",
          complaintStatus: status,
          note:
            complaintAdminNotes.trim() ||
            (status === "RESOLVED"
              ? "Komplain telah berhasil diselesaikan oleh Customer Support."
              : "Komplain sedang dalam penanganan oleh Customer Support."),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        showToast(
          `✓ Status komplain berhasil diubah menjadi: ${status === "RESOLVED" ? "Selesai" : "Sedang Diproses"}!`
        );
        setSelectedOrder(data.data);
        fetchOrders();
      } else {
        alert("Gagal update komplain: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Error update komplain: " + err.message);
    } finally {
      setIsResolvingComplaint(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders?t=" + Date.now());
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat daftar pesanan:", err);
      showToast("Gagal memuat daftar pesanan dari server");
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // Metrik KPI 7 Kategori
  const totalOrdersCount = orders.length;
  const pendingPaymentCount = orders.filter((o) => o.status === "PAYMENT_PENDING").length;
  const packingCount = orders.filter((o) => o.status === "PAID" || o.status === "PROCESSING").length;
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;
  const returnCount = orders.filter((o) => o.status === "RETURN").length;
  const complaintCount = orders.filter((o) => o.hasComplaint || !!o.complaint).length;
  const totalOmsetSelesai = orders
    .filter((o) => o.status === "PAID" || o.status === "PROCESSING" || o.status === "SHIPPED" || o.status === "DELIVERED")
    .reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);

  // Filter & Search
  const filteredOrders = orders.filter((order) => {
    // Status Filter 8 Kategori
    if (statusFilter !== "ALL") {
      if (statusFilter === "PROCESSING") {
        if (order.status !== "PROCESSING" && order.status !== "PAID") return false;
      } else if (statusFilter === "COMPLAINT") {
        if (!order.hasComplaint && !order.complaint) return false;
      } else if (order.status !== statusFilter) {
        return false;
      }
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrderNum = order.orderNumber?.toLowerCase().includes(q);
      const matchName = order.customerName?.toLowerCase().includes(q);
      const matchPhone = order.customerPhone?.toLowerCase().includes(q);
      const matchCity = order.shippingAddress?.city?.toLowerCase().includes(q);
      const matchItem = order.items?.some((i) => i.productName?.toLowerCase().includes(q));
      if (!matchOrderNum && !matchName && !matchPhone && !matchCity && !matchItem) {
        return false;
      }
    }

    return true;
  });

  const getStatusBadge = (status: Order["status"], paymentProof?: string | null) => {
    switch (status) {
      case "PAYMENT_PENDING":
        return paymentProof ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-xs animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Menunggu Verifikasi
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" /> Belum Bayar
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Pembayaran Diterima
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" /> Sedang Dikemas
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3.5 h-3.5 text-purple-600" /> Dikirim
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" /> Selesai
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Dibatalkan
          </span>
        );
      case "RETURN":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300">
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" /> Pengembalian / Retur
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const handleOpenProcessModal = (order: Order, defaultAction?: typeof actionType) => {
    setSelectedOrder(order);
    if (defaultAction) {
      setActionType(defaultAction);
    } else {
      if (order.status === "PAYMENT_PENDING" || order.status === "PAID") {
        setActionType(order.status === "PAYMENT_PENDING" ? "confirm_payment" : "process_packing");
      } else if (order.status === "PROCESSING") {
        setActionType("ship_order");
      } else if (order.status === "SHIPPED") {
        setActionType("deliver_order");
      } else {
        setActionType("confirm_payment");
      }
    }
    setShipCourier(order.shippingCourier || "Armada Teknisi DSTech (Cilegon, Serang & Banten)");
    setTrackingNumber(order.trackingNumber || "");
    setCourierPhone(order.courierPhone || "");
    setActionNote("");
    setIsProcessModalOpen(true);
  };

  const handleExecuteOrderAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setSubmitting(true);
      const payload: any = {
        id: selectedOrder.id,
        orderNumber: selectedOrder.orderNumber,
        action: actionType,
        note: actionNote.trim() || undefined,
      };

      if (actionType === "ship_order") {
        payload.shippingCourier = shipCourier;
        payload.trackingNumber = trackingNumber.trim() || `SJ-DSP-${Date.now().toString().slice(-6)}`;
        payload.courierPhone = courierPhone.trim();
      }

      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.success) {
        showToast(`Pesanan #${selectedOrder.orderNumber} berhasil diperbarui!`);
        setIsProcessModalOpen(false);
        fetchOrders();
      } else {
        alert(data.error || "Gagal memperbarui status pesanan");
      }
    } catch (err: any) {
      console.error(err);
      alert("Terjadi kesalahan jaringan saat memproses pesanan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactWhatsApp = (order: Order) => {
    const rawPhone = order.customerPhone.replace(/[^0-9]/g, "");
    let phoneNum = rawPhone;
    if (phoneNum.startsWith("0")) {
      phoneNum = "62" + phoneNum.slice(1);
    }

    const itemNames = order.items.map((i) => `• ${i.productName} (${i.qty}x)`).join("%0A");
    const msg = `Halo Bpk/Ibu *${encodeURIComponent(order.customerName)}*,%0A%0AKami dari Tim Operasional *PT. DSTech Smart Perkasa* mengonfirmasi pesanan e-store Anda:%0A*No. Pesanan:* ${order.orderNumber}%0A*Total:* ${encodeURIComponent(formatRupiah(order.grandTotal))}%0A*Rincian Barang:*%0A${itemNames}%0A%0AStatus saat ini: *${order.status}*.%0AInformasi & konfirmasi lanjutan dapat kami bantu melalui pesan ini. Terima kasih!`;

    window.open(`https://wa.me/${phoneNum}?text=${msg}`, "_blank");
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/80 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-dstech-blue uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" /> Admin Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-dstech-red" />
            Manajemen Pesanan E-Store
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola seluruh order pembelian hardware & jasa, verifikasi bukti transfer, cetak surat jalan, dan update resi ekspedisi / armada.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-dstech-blue" : "text-slate-500"}`} />
            <span>Segarkan Data</span>
          </button>

          <Link
            href="/shop"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka E-Store Marketplace</span>
          </Link>
        </div>
      </div>

      {/* Metrik KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Pesanan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Pesanan</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{totalOrdersCount}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Seluruh pesanan masuk</span>
          </div>
        </div>

        {/* Menunggu Pembayaran */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
            <span>Menunggu Bayar</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-700">{pendingPaymentCount}</span>
            <span className="text-xs text-amber-600/80 block mt-0.5">Belum transfer / konfirmasi</span>
          </div>
        </div>

        {/* Perlu Diproses / Siap Kirim */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-700 text-xs font-bold">
            <span>Perlu Tindakan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-700">{packingCount}</span>
            <span className="text-xs text-blue-600/80 block mt-0.5">Lunas &amp; perlu dikemas</span>
          </div>
        </div>

        {/* Sedang Dikirim */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
            <span>Sedang Dikirim</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-700">{shippedCount}</span>
            <span className="text-xs text-purple-600/80 block mt-0.5">Armada / kurir aktif</span>
          </div>
        </div>

        {/* Total Omset Selesai */}
        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg shadow-slate-900/10 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
            <span>Akumulasi Omset</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-black text-emerald-400">{formatRupiah(totalOmsetSelesai)}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">{deliveredCount} transaksi selesai</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: "All", count: totalOrdersCount },
            { id: "PAYMENT_PENDING", label: "Belum Bayar", count: pendingPaymentCount },
            { id: "PROCESSING", label: "Sedang Dikemas", count: packingCount, highlight: packingCount > 0 },
            { id: "SHIPPED", label: "Dikirim", count: shippedCount },
            { id: "DELIVERED", label: "Selesai", count: deliveredCount },
            { id: "CANCELLED", label: "Dibatalkan", count: cancelledCount },
            { id: "RETURN", label: "Pengembalian", count: returnCount, highlight: returnCount > 0 },
            { id: "COMPLAINT", label: "Komplain", count: complaintCount, highlight: complaintCount > 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                statusFilter === tab.id
                  ? tab.highlight
                    ? "bg-dstech-red text-white shadow-md shadow-red-500/20"
                    : "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  statusFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. order, pemesan, kota..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-dstech-blue focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Tabel Daftar Pesanan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-dstech-blue animate-spin mb-3" />
            <p className="text-slate-600 font-bold text-sm">Memuat data pesanan e-store...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-800">Belum Ada Pesanan yang Sesuai</h3>
            <p className="text-slate-400 text-xs max-w-sm mt-1">
              Tidak ditemukan pesanan dengan kriteria filter atau pencarian saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-5">No. Pesanan &amp; Tanggal</th>
                  <th className="py-4 px-5">Pelanggan &amp; Alamat</th>
                  <th className="py-4 px-5">Barang &amp; Layanan</th>
                  <th className="py-4 px-5">Total Transaksi</th>
                  <th className="py-4 px-5">Pengiriman &amp; Resi</th>
                  <th className="py-4 px-5">Bukti Bayar</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* No Pesanan & Tanggal */}
                    <td className="py-4 px-5 align-top">
                      <div className="font-mono font-black text-slate-900 text-xs">
                        {order.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="mt-1.5">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </td>

                    {/* Pelanggan */}
                    <td className="py-4 px-5 align-top">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-dstech-blue shrink-0" />
                        <span>{order.customerName}</span>
                      </div>
                      <button
                        onClick={() => handleContactWhatsApp(order)}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 mt-1 cursor-pointer"
                        title="Hubungi via WhatsApp"
                      >
                        <Phone className="w-3 h-3 text-emerald-500" />
                        <span>{order.customerPhone}</span>
                      </button>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-start gap-1 max-w-[200px] leading-tight">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {order.shippingAddress?.address}, {order.shippingAddress?.city}
                        </span>
                      </div>
                    </td>

                    {/* Barang & Layanan */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1 max-w-[240px]">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="font-semibold text-slate-800 truncate" title={item.productName}>
                              {item.qty}x {item.productName}
                            </span>
                            <span className="text-slate-500 shrink-0">
                              {formatRupiah(item.price * item.qty)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.includeInstallation && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                          <Wrench className="w-3 h-3" /> Termasuk Pasang Teknisi (+{formatRupiah(order.installationFee)})
                        </div>
                      )}
                    </td>

                    {/* Total Biaya & Kode Unik */}
                    <td className="py-4 px-5 align-top">
                      <div className="font-black text-slate-900 text-xs font-mono">
                        {formatRupiah(order.grandTotal)}
                      </div>
                      {order.uniqueCode ? (
                        <div className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1 mt-1">
                          <span>Kode Unik:</span>
                          <span className="font-black text-amber-900">+{order.uniqueCode}</span>
                        </div>
                      ) : null}
                      <div className="text-[10px] text-slate-400 mt-1">
                        Subtotal: {formatRupiah(order.subtotal)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Ongkir: {formatRupiah(order.shippingCost)}
                      </div>
                    </td>

                    {/* Pengiriman & Resi */}
                    <td className="py-4 px-5 align-top">
                      <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-dstech-blue shrink-0" />
                        <span className="truncate max-w-[150px]" title={order.shippingCourier}>
                          {order.shippingCourier.replace(" (Cilegon, Serang & Banten)", "")}
                        </span>
                      </div>
                      <div className="mt-1">
                        {order.trackingNumber ? (
                          <span className="font-mono text-[10px] font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {order.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 italic">
                            Belum ada no. resi
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Bukti Bayar */}
                    <td className="py-4 px-5 align-top">
                      {order.paymentProof ? (
                        <button
                          onClick={() => {
                            setProofImageSrc(order.paymentProof!);
                            setIsPreviewProofOpen(true);
                          }}
                          className="group relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 block hover:border-dstech-blue transition-all cursor-pointer"
                          title="Klik untuk memperbesar bukti transfer"
                        >
                          <Image
                            src={order.paymentProof}
                            alt="Bukti Transfer"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic font-semibold">
                          Belum diunggah
                        </span>
                      )}
                    </td>

                    {/* Status & Komplain */}
                    <td className="py-4 px-5 align-top">
                      <div>{getStatusBadge(order.status, order.paymentProof)}</div>
                      {order.complaint && (
                        <div className="mt-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              order.complaint.status === "RESOLVED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                            }`}
                          >
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Komplain: {order.complaint.status === "RESOLVED" ? "Selesai" : "Aktif"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Tombol Aksi */}
                    <td className="py-4 px-5 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === "PAYMENT_PENDING" && order.paymentProof && (
                          <button
                            onClick={() => handleOpenProcessModal(order, "confirm_payment")}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer animate-pulse"
                            title="Verifikasi Bukti Transfer & Konfirmasi Pembayaran"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Verifikasi</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenProcessModal(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-dstech-blue text-white font-black text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        >
                          <span>Proses</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleContactWhatsApp(order)}
                          className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
                          title="Hubungi WhatsApp Pelanggan"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PROSES PESANAN & SURAT JALAN */}
      {isProcessModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-dstech-blue uppercase tracking-widest block">
                  Operasional E-Store
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Proses Pesanan #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsProcessModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteOrderAction} className="p-6 space-y-6">
              {/* Ringkasan Singkat Pesanan */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Status Terkini:</span>
                  <div>{getStatusBadge(selectedOrder.status, selectedOrder.paymentProof)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Pelanggan:</span>
                  <span className="text-xs font-black text-slate-900">
                    {selectedOrder.customerName} ({selectedOrder.customerPhone})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Total Tagihan:</span>
                  <div className="text-right">
                    <span className="text-xs font-black text-dstech-red font-mono">
                      {formatRupiah(selectedOrder.grandTotal)}
                    </span>
                    {selectedOrder.uniqueCode && (
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded block mt-0.5">
                        Termasuk Kode Unik: +{selectedOrder.uniqueCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Panel Komplain Pelanggan jika ada */}
                {selectedOrder.complaint && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Komplain Pelanggan: {selectedOrder.complaint.category}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          selectedOrder.complaint.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                        }`}
                      >
                        Status: {selectedOrder.complaint.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-amber-200">
                      <strong>Keluhan:</strong> {selectedOrder.complaint.description}
                    </div>

                    {selectedOrder.complaint.expectedSolution && (
                      <div className="text-xs text-amber-900">
                        Solusi Diharapkan: <strong>{selectedOrder.complaint.expectedSolution}</strong>
                      </div>
                    )}

                    {selectedOrder.complaint.proofImage && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Foto Bukti Kendala:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setProofImageSrc(selectedOrder.complaint!.proofImage!);
                            setIsPreviewProofOpen(true);
                          }}
                          className="text-xs text-dstech-blue font-bold underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Lihat Foto
                        </button>
                      </div>
                    )}

                    {/* Tindak Lanjut CS */}
                    <div className="pt-2 border-t border-amber-200 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Catatan Tanggapan / Solusi dari CS:
                      </label>
                      <input
                        type="text"
                        value={complaintAdminNotes}
                        onChange={(e) => setComplaintAdminNotes(e.target.value)}
                        placeholder="Contoh: Unit pengganti sudah dikirim / Jadwal teknisi perbaikan besok..."
                        className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl font-medium focus:outline-none focus:border-amber-500"
                      />
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isResolvingComplaint}
                          onClick={() => handleResolveComplaint(selectedOrder.id, "IN_PROGRESS")}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs cursor-pointer shadow-xs"
                        >
                          Tandai Sedang Diproses
                        </button>
                        <button
                          type="button"
                          disabled={isResolvingComplaint}
                          onClick={() => handleResolveComplaint(selectedOrder.id, "RESOLVED")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs"
                        >
                          ✓ Tandai Komplain Selesai
                        </button>
                        <a
                          href={`https://wa.me/${(selectedOrder.customerPhone || "").replace(/^0/, "62")}?text=${encodeURIComponent(
                            `Halo Bpk/Ibu ${selectedOrder.customerName}, kami dari CS PT DSTech Smart Perkasa ingin menindaklanjuti komplain pesanan #${selectedOrder.orderNumber}: "${selectedOrder.complaint.category}".`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 font-black text-xs flex items-center gap-1 hover:bg-emerald-100"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" /> WhatsApp Klien
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.paymentProof && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-300 bg-white shrink-0">
                        <Image
                          src={selectedOrder.paymentProof}
                          alt="Bukti Transfer"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-black text-amber-950 block">Bukti Transfer Pelanggan</span>
                        <span className="text-[10px] text-amber-800">Cek mutasi bank nominal {formatRupiah(selectedOrder.grandTotal)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProofImageSrc(selectedOrder.paymentProof!);
                        setIsPreviewProofOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Perbesar Bukti</span>
                    </button>
                  </div>
                )}

                <div className="text-xs text-slate-600 border-t border-slate-200 pt-2 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedOrder.shippingAddress?.recipientName} - {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.province} {selectedOrder.shippingAddress?.postalCode}
                  </span>
                </div>
              </div>

              {/* Pilihan Tindakan Admin */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Langkah Tindakan Selanjutnya:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                      actionType === "confirm_payment"
                        ? "border-blue-500 bg-blue-50/50 text-blue-900 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionType"
                      value="confirm_payment"
                      checked={actionType === "confirm_payment"}
                      onChange={() => setActionType("confirm_payment")}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-black text-xs block">1. Konfirmasi Pembayaran Sah</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Tervalidasi lunas di rekening bank resmi PT DSTech.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                      actionType === "process_packing"
                        ? "border-indigo-500 bg-indigo-50/50 text-indigo-900 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionType"
                      value="process_packing"
                      checked={actionType === "process_packing"}
                      onChange={() => setActionType("process_packing")}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-black text-xs block">2. Kemas Barang (Gudang QC)</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Siapkan dari stok gudang &amp; cek kelayakan unit.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                      actionType === "ship_order"
                        ? "border-purple-500 bg-purple-50/50 text-purple-900 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionType"
                      value="ship_order"
                      checked={actionType === "ship_order"}
                      onChange={() => setActionType("ship_order")}
                      className="mt-1 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-black text-xs block">3. Kirimkan Pesanan</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Input resi kurir / serahkan ke Armada Teknisi DSTech.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                      actionType === "deliver_order"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionType"
                      value="deliver_order"
                      checked={actionType === "deliver_order"}
                      onChange={() => setActionType("deliver_order")}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-black text-xs block">4. Tandai Selesai / Sampai</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Barang diterima pelanggan, garansi 1 tahun aktif.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                      actionType === "return_order"
                        ? "border-amber-500 bg-amber-50/50 text-amber-900 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionType"
                      value="return_order"
                      checked={actionType === "return_order"}
                      onChange={() => setActionType("return_order")}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-black text-xs block">5. Proses Pengembalian / Retur</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Pengembalian barang atau refund garansi disetujui.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                      actionType === "cancel_order"
                        ? "border-rose-500 bg-rose-50/50 text-rose-900 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionType"
                      value="cancel_order"
                      checked={actionType === "cancel_order"}
                      onChange={() => setActionType("cancel_order")}
                      className="mt-1 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="font-black text-xs block">6. Batalkan Pesanan</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Batalkan transaksi pesanan secara permanen.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Khusus Pengiriman (Jika memilih ship_order) */}
              {actionType === "ship_order" && (
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-black text-purple-800">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span>Detail Ekspedisi / Armada Pengantaran</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Kurir / Metode Pengiriman:
                      </label>
                      <select
                        value={shipCourier}
                        onChange={(e) => setShipCourier(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-purple-600"
                      >
                        <option value="Armada Teknisi DSTech (Cilegon, Serang & Banten)">
                          Armada Teknisi DSTech (Cilegon, Serang &amp; Banten)
                        </option>
                        <option value="JNE Express / J&T Regular">JNE Express / J&amp;T Regular</option>
                        <option value="Instant Kurir Khusus Industri / Pabrik">
                          Instant Kurir Khusus Industri / Pabrik
                        </option>
                        <option value="Ambil Sendiri di Kantor DSTech Cilegon">
                          Ambil Sendiri di Kantor DSTech Cilegon
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Nomor Resi / No. Surat Jalan:
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Contoh: DSP-SJ-20261025 / JNE12345"
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-purple-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Kontak Teknisi / Driver Pengantar (Opsional):
                      </label>
                      <input
                        type="text"
                        value={courierPhone}
                        onChange={(e) => setCourierPhone(e.target.value)}
                        placeholder="Nama staf teknisi & No WA kurir"
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Catatan Tindakan */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Catatan untuk Timeline Pelacakan Pelanggan (Opsional):
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Berikan catatan tambahan jika ada instruksi khusus..."
                  rows={2}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-dstech-blue focus:bg-white transition-all"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenProcessModal(selectedOrder, "cancel_order")}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  Batalkan Pesanan Ini
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProcessModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <span>Simpan &amp; Perbarui Status</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW BUKTI TRANSFER */}
      {isPreviewProofOpen && proofImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-xl w-full">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-dstech-blue" />
                Bukti Pembayaran Pelanggan
              </span>
              <button
                onClick={() => setIsPreviewProofOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-center max-h-[75vh] overflow-y-auto">
              <div className="relative w-full max-h-[70vh] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proofImageSrc}
                  alt="Bukti Transfer Pembeli"
                  className="rounded-xl shadow-lg max-h-[70vh] object-contain border border-slate-200"
                />
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Pastikan nominal transfer sesuai dengan mutasi rekening korporat.
              </span>
              <button
                onClick={() => setIsPreviewProofOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
