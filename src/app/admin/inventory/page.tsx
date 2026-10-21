"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Warehouse,
  Package,
  Search,
  Filter,
  ArrowRightLeft,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Clock,
  MapPin,
  Building2,
  TrendingDown,
  DollarSign,
  History,
  Check,
  X,
  FileText,
  User,
  Truck,
  Layers,
  ChevronRight,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  address: string;
  pic: string;
  phone: string;
  type: string;
  status: string;
}

interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  warehouseStock: { [warehouseId: string]: number };
  valuation: number;
  status: "Aman" | "Menipis" | "Habis";
  minStock: number;
  isService?: boolean;
  hasConversion?: boolean;
  subUnit?: string;
  conversionRatio?: number;
  subStockTotal?: number;
  conversionLabel?: string;
  location?: string;
  image?: string;
  desc?: string;
}

interface MaterialRequestItem {
  materialId: string;
  materialName: string;
  qty: number;
  unit: string;
  selectedUnit?: string;
}

interface MaterialRequest {
  id: string;
  items?: MaterialRequestItem[];
  materialId?: string;
  materialName?: string;
  qty?: number;
  unit?: string;
  taskTitle: string;
  requestedBy: string;
  date: string;
  status: string;
  notes: string;
  approvedAt?: string;
  approvedBy?: string;
  warehouseDispatched?: string;
  approvalNotes?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

interface InventoryLog {
  id: string;
  type: "STOCK_OPNAME" | "WAREHOUSE_TRANSFER" | "MATERIAL_DISPATCH";
  productId?: string;
  productName?: string;
  warehouseId?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  prevStock?: number;
  newStock?: number;
  difference?: number;
  qty?: number;
  unit?: string;
  reason?: string;
  notes?: string;
  adjustedBy?: string;
  transferredBy?: string;
  approvedBy?: string;
  taskTitle?: string;
  requestedBy?: string;
  createdAt: string;
}

export default function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState<"stock" | "requests" | "logs" | "warehouses">("stock");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [items, setItems] = useState<InventoryProduct[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalValuation: 0,
    criticalStockCount: 0,
    warehouseCount: 3,
  });

  // Filter states
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("all");

  // Modal Stock Opname
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState<boolean>(false);
  const [opnameForm, setOpnameForm] = useState({
    productId: "",
    warehouseId: "dstech_wh_1",
    actualStock: 0,
    reason: "Koreksi Fisik Berkala (Stock Opname)",
    notes: "",
  });
  const [selectedProductForOpname, setSelectedProductForOpname] = useState<InventoryProduct | null>(null);

  // Modal Transfer Gudang
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferForm, setTransferForm] = useState({
    productId: "",
    fromWarehouseId: "dstech_wh_1",
    toWarehouseId: "dstech_wh_3",
    qty: 1,
    notes: "Pengisian stok unit armada mobil teknisi",
  });
  const [selectedProductForTransfer, setSelectedProductForTransfer] = useState<InventoryProduct | null>(null);

  // Modal Approval Request
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [selectedRequestForApproval, setSelectedRequestForApproval] = useState<MaterialRequest | null>(null);
  const [approvalWarehouse, setApprovalWarehouse] = useState<string>("dstech_wh_1");
  const [approvalNotes, setApprovalNotes] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const fetchInventoryData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/inventory");
      const json = await res.json();
      if (json.success) {
        setItems(json.items || []);
        setWarehouses(json.warehouses || []);
        setRequests(json.requests || []);
        setLogs(json.logs || []);
        if (json.summary) setSummary(json.summary);
      } else {
        showToast("Gagal memuat data inventori");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.isService) return false;

      // Filter gudang
      if (selectedWarehouseFilter !== "all") {
        const whStock = item.warehouseStock?.[selectedWarehouseFilter] || 0;
        if (whStock <= 0 && stockStatusFilter === "all") {
          // Tetap tampilkan agar admin tahu stok 0 di gudang ini
        }
      }

      // Filter search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCat = item.category?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchLoc) return false;
      }

      // Filter kategori
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Filter status stok
      if (stockStatusFilter === "critical" && item.status === "Aman") {
        return false;
      }
      if (stockStatusFilter === "empty" && item.status !== "Habis") {
        return false;
      }
      if (stockStatusFilter === "safe" && item.status !== "Aman") {
        return false;
      }

      return true;
    });
  }, [items, selectedWarehouseFilter, searchQuery, selectedCategory, stockStatusFilter]);

  // Categories list for filter
  const categoriesList = useMemo(() => {
    const setCat = new Set<string>();
    items.forEach((i) => {
      if (i.category && !i.isService) setCat.add(i.category);
    });
    return Array.from(setCat);
  }, [items]);

  // Stock Opname Handler
  const handleOpenOpname = (prod: InventoryProduct) => {
    setSelectedProductForOpname(prod);
    const targetWh = selectedWarehouseFilter !== "all" ? selectedWarehouseFilter : "dstech_wh_1";
    const currentWhStock = prod.warehouseStock?.[targetWh] || 0;
    setOpnameForm({
      productId: prod.id,
      warehouseId: targetWh,
      actualStock: currentWhStock,
      reason: "Koreksi Fisik Berkala (Stock Opname)",
      notes: "",
    });
    setIsOpnameModalOpen(true);
  };

  const handleSubmitOpname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForOpname) return;

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stock_opname",
          productId: opnameForm.productId,
          warehouseId: opnameForm.warehouseId,
          actualStock: opnameForm.actualStock,
          reason: opnameForm.reason,
          notes: opnameForm.notes,
          adjustedBy: "Superadmin / Admin Gudang",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Stock Opname berhasil disimpan!");
        setIsOpnameModalOpen(false);
        fetchInventoryData();
      } else {
        showToast("Gagal: " + (json.error || "Gagal update"));
      }
    } catch {
      showToast("Kesalahan jaringan saat submit opname");
    }
  };

  // Transfer Handler
  const handleOpenTransfer = (prod: InventoryProduct) => {
    setSelectedProductForTransfer(prod);
    setTransferForm({
      productId: prod.id,
      fromWarehouseId: "dstech_wh_1",
      toWarehouseId: "dstech_wh_3",
      qty: 1,
      notes: "Pengisian stok unit armada mobil teknisi",
    });
    setIsTransferModalOpen(true);
  };

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForTransfer) return;

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "warehouse_transfer",
          productId: transferForm.productId,
          fromWarehouseId: transferForm.fromWarehouseId,
          toWarehouseId: transferForm.toWarehouseId,
          qty: transferForm.qty,
          notes: transferForm.notes,
          transferredBy: "Logistik Officer",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Transfer berhasil!");
        setIsTransferModalOpen(false);
        fetchInventoryData();
      } else {
        showToast("Gagal: " + (json.error || "Error transfer"));
      }
    } catch {
      showToast("Kesalahan jaringan saat transfer");
    }
  };

  // Approval Request Handler
  const handleOpenApproval = (req: MaterialRequest) => {
    setSelectedRequestForApproval(req);
    setApprovalWarehouse("dstech_wh_1");
    setApprovalNotes("Material telah dicek dan diserahterimakan lengkap ke teknisi.");
    setIsApprovalModalOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedRequestForApproval) return;

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_request",
          requestId: selectedRequestForApproval.id,
          warehouseId: approvalWarehouse,
          notes: approvalNotes,
          approvedBy: "Kepala Logistik & Gudang",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast("Permohonan berhasil disetujui & stok gudang otomatis terpotong!");
        setIsApprovalModalOpen(false);
        fetchInventoryData();
      } else {
        showToast("Gagal approve: " + (json.error || "Error"));
      }
    } catch {
      showToast("Kesalahan jaringan saat approve request");
    }
  };

  const handleRejectRequest = async (req: MaterialRequest) => {
    const reason = prompt("Masukkan alasan penolakan permohonan material ini:", "Stok fisik di gudang sedang habis / menunggu kiriman supplier");
    if (!reason) return;

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject_request",
          requestId: req.id,
          reason,
          rejectedBy: "Kepala Logistik & Gudang",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast("Permohonan telah ditolak.");
        fetchInventoryData();
      } else {
        showToast("Gagal tolak: " + (json.error || "Error"));
      }
    } catch {
      showToast("Kesalahan jaringan saat tolak request");
    }
  };

  const getWarehouseName = (id?: string) => {
    if (!id) return "-";
    const wh = warehouses.find((w) => w.id === id);
    return wh ? wh.name.replace("DSTech - ", "").replace("Gudang Utama DSTech - ", "") : id;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-dstech-blue text-[11px] font-black tracking-wider uppercase">
              Operasional & Logistik
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Multi-Gudang Terpadu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Manajemen Stok & Gudang
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Kelola kartu stok riil per gudang, stock opname fisik, mutasi antar cabang, dan persetujuan material teknisi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchInventoryData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Katalog Barang</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{summary.totalItems}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Item Produk & Material Fisik</p>
          <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-dstech-blue transition-all duration-300" />
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Aset Gudang</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{formatRupiah(summary.totalValuation)}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Total Valuasi Nilai Stok Fisik</p>
          <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-emerald-500 transition-all duration-300" />
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Perhatian</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">{summary.criticalStockCount}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Item Stok Menipis / Habis</p>
          <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-amber-500 transition-all duration-300" />
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Warehouse className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Titik Logistik</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">{summary.warehouseCount}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Cilegon, Serang & Armada Mobile</p>
          <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-purple-500 transition-all duration-300" />
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("stock")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "stock"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Package className="w-4 h-4 text-dstech-blue" />
          <span>Kartu Stok Barang Real-Time</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
            {filteredItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "requests"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ClipboardCheck className="w-4 h-4 text-amber-500" />
          <span>Permohonan Material Teknisi</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-[10px] font-black">
            {requests.filter((r) => !r.status.includes("Disetujui")).length} Menunggu
          </span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "logs"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <History className="w-4 h-4 text-purple-500" />
          <span>Riwayat Mutasi & Opname</span>
          <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-[10px]">
            {logs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("warehouses")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "warehouses"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-500" />
          <span>Daftar Titik Gudang & Armada</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[10px]">
            {warehouses.length}
          </span>
        </button>
      </div>

      {/* TAB 1: KARTU STOK BARANG REAL-TIME */}
      {activeTab === "stock" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Filter Titik Gudang */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Titik Gudang Logistik:
                </label>
                <select
                  value={selectedWarehouseFilter}
                  onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                >
                  <option value="all">🏢 Semua Titik Gudang (Konsolidasi)</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      📍 {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Cari Nama Barang / Lokasi:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Kabel, Doorlock, CCTV, BNC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 text-xs focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                  />
                </div>
              </div>

              {/* Filter Kategori */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Kategori Barang:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Status Stok */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Status Ketersediaan:
                </label>
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="critical">⚠️ Stok Menipis / Kritis</option>
                  <option value="empty">❌ Stok Habis (0)</option>
                  <option value="safe">✓ Stok Aman</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Inventory Items */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Informasi Barang / Material</th>
                    <th className="px-4 py-3.5">Kategori</th>
                    <th className="px-4 py-3.5 text-center">Gudang Utama (CLG)</th>
                    <th className="px-4 py-3.5 text-center">Cabang (SRG)</th>
                    <th className="px-4 py-3.5 text-center">Mobil Lapangan</th>
                    <th className="px-4 py-3.5 text-center">Total Stok</th>
                    <th className="px-4 py-3.5 text-right">Nilai Aset</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold">Tidak ada barang yang cocok dengan filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const wh1Stock = item.warehouseStock?.dstech_wh_1 || 0;
                      const wh2Stock = item.warehouseStock?.dstech_wh_2 || 0;
                      const wh3Stock = item.warehouseStock?.dstech_wh_3 || 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden relative">
                                {item.image ? (
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                  <Package className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3" />
                                  <span>{item.location || "Gudang Utama DSTech"}</span>
                                  {item.hasConversion && item.subUnit && (
                                    <span className="font-bold text-dstech-blue bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                                      {item.conversionLabel}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold text-[10px]">
                              {item.category}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center font-bold">
                            <span className={wh1Stock <= 0 ? "text-red-500" : "text-slate-800"}>
                              {wh1Stock} {item.unit}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center font-bold">
                            <span className={wh2Stock <= 0 ? "text-slate-400" : "text-slate-800"}>
                              {wh2Stock} {item.unit}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center font-bold">
                            <span className={wh3Stock <= 0 ? "text-slate-400" : "text-dstech-blue"}>
                              {wh3Stock} {item.unit}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="inline-block px-3 py-1 rounded-xl bg-slate-100 font-black text-slate-900 text-xs">
                              {item.stock} {item.unit}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-right font-black text-slate-900">
                            {formatRupiah(item.valuation)}
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                item.status === "Habis"
                                  ? "bg-red-100 text-red-700"
                                  : item.status === "Menipis"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {item.status === "Habis" && <XCircle className="w-3 h-3" />}
                              {item.status === "Menipis" && <AlertTriangle className="w-3 h-3" />}
                              {item.status === "Aman" && <Check className="w-3 h-3" />}
                              <span>{item.status}</span>
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenOpname(item)}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Penyesuaian Fisik (Stock Opname)"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5 text-dstech-blue" />
                                <span>Opname</span>
                              </button>

                              <button
                                onClick={() => handleOpenTransfer(item)}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Transfer Antar Titik Gudang / Armada"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
                                <span>Transfer</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERMOHONAN MATERIAL TEKNISI */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3">
            <ClipboardCheck className="w-5 h-5 text-dstech-blue shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-dstech-blue">Pusat Persetujuan Pengambilan Material Lapangan</h4>
              <p className="text-slate-600 font-medium mt-0.5">
                Setiap permohonan material yang diajukan oleh teknisi dari portal lapangan akan masuk ke sini. Saat admin menyetujui, stok fisik di titik gudang yang dipilih akan otomatis terpotong.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">ID & Tanggal</th>
                    <th className="px-4 py-3.5">Teknisi Pemohon</th>
                    <th className="px-4 py-3.5">Terkait Proyek / Tugas</th>
                    <th className="px-4 py-3.5">Daftar Material Diminta</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Otorisasi Logistik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <ClipboardCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold">Belum ada permohonan material dari teknisi.</p>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => {
                      const isApproved = req.status.includes("Disetujui");
                      const isRejected = req.status.includes("Ditolak");
                      const isPending = !isApproved && !isRejected;

                      const itemsList = req.items && req.items.length > 0 
                        ? req.items 
                        : [{ materialId: req.materialId || "", materialName: req.materialName || "-", qty: req.qty || 0, unit: req.unit || "Pcs" }];

                      return (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="font-mono text-xs font-black text-slate-900">{req.id}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{req.date}</p>
                          </td>

                          <td className="px-4 py-3.5 font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{req.requestedBy}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <p className="font-bold text-dstech-blue">{req.taskTitle}</p>
                            {req.notes && <p className="text-[10px] text-slate-500 mt-0.5">Catatan: {req.notes}</p>}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="space-y-1">
                              {itemsList.map((it, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-dstech-blue shrink-0" />
                                  <span className="font-bold text-slate-900">{it.materialName}</span>
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-extrabold text-[10px] text-slate-700">
                                    {it.qty} {it.selectedUnit || it.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                isApproved
                                  ? "bg-emerald-100 text-emerald-700"
                                  : isRejected
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700 animate-pulse"
                              }`}
                            >
                              {isApproved && <Check className="w-3 h-3" />}
                              {isRejected && <X className="w-3 h-3" />}
                              {isPending && <Clock className="w-3 h-3" />}
                              <span>{req.status}</span>
                            </span>
                            {isApproved && req.warehouseDispatched && (
                              <p className="text-[9px] text-slate-400 mt-1">
                                Gudang: {getWarehouseName(req.warehouseDispatched)}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenApproval(req)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Setujui & Potong Stok</span>
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(req)}
                                  className="p-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition cursor-pointer"
                                  title="Tolak Permohonan"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 font-medium">
                                <span>{isApproved ? "Diserahterimakan" : "Dibatalkan"}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RIWAYAT MUTASI & OPNAME */}
      {activeTab === "logs" && (
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              <span>Log Audit Aktivitas Stok Gudang</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">{logs.length} Catatan</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Waktu & Tanggal</th>
                  <th className="px-4 py-3.5">Jenis Aktivitas</th>
                  <th className="px-4 py-3.5">Barang / Material</th>
                  <th className="px-4 py-3.5">Titik Gudang Terkait</th>
                  <th className="px-4 py-3.5 text-center">Mutasi / Selisih</th>
                  <th className="px-4 py-3.5">Keterangan / Alasan</th>
                  <th className="px-5 py-3.5 text-right">Petugas / PIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold">Belum ada riwayat mutasi atau stock opname.</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString("id-ID")}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            log.type === "STOCK_OPNAME"
                              ? "bg-blue-100 text-blue-700"
                              : log.type === "WAREHOUSE_TRANSFER"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {log.type === "STOCK_OPNAME"
                            ? "Stock Opname"
                            : log.type === "WAREHOUSE_TRANSFER"
                            ? "Transfer Gudang"
                            : "Pengeluaran Material"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {log.productName || log.taskTitle || "-"}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {log.warehouseId && <span>{getWarehouseName(log.warehouseId)}</span>}
                        {log.fromWarehouseId && (
                          <span>
                            {getWarehouseName(log.fromWarehouseId)} ➔ {getWarehouseName(log.toWarehouseId)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center font-black">
                        {log.type === "STOCK_OPNAME" && (
                          <span className={log.difference && log.difference < 0 ? "text-red-600" : "text-emerald-600"}>
                            {log.difference && log.difference > 0 ? `+${log.difference}` : log.difference}{" "}
                            {log.unit}
                          </span>
                        )}
                        {log.type === "WAREHOUSE_TRANSFER" && (
                          <span className="text-purple-600">
                            {log.qty} {log.unit}
                          </span>
                        )}
                        {log.type === "MATERIAL_DISPATCH" && (
                          <span className="text-emerald-600">Terpotong</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {log.reason || log.notes || "-"}
                      </td>

                      <td className="px-5 py-3.5 text-right font-bold text-slate-800">
                        {log.adjustedBy || log.transferredBy || log.approvedBy || "Admin"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DAFTAR TITIK GUDANG & ARMADA */}
      {activeTab === "warehouses" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-dstech-blue transition group relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-dstech-blue bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    {wh.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {wh.type}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {wh.status}
                </span>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-base">{wh.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{wh.address}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">PIC Gudang</p>
                  <p className="font-bold text-slate-800">{wh.pic}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Kontak Telepon</p>
                  <p className="font-medium text-slate-700">{wh.phone}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: STOCK OPNAME (PENYESUAIAN FISIK) */}
      {isOpnameModalOpen && selectedProductForOpname && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-sm">Stock Opname / Koreksi Fisik</h3>
              </div>
              <button
                onClick={() => setIsOpnameModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOpname} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nama Barang</p>
                <p className="font-black text-slate-900 text-sm mt-0.5">{selectedProductForOpname.name}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Kategori: {selectedProductForOpname.category} • Satuan: {selectedProductForOpname.unit}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Titik Gudang yang Dihitung Fisiknya:</label>
                <select
                  value={opnameForm.warehouseId}
                  onChange={(e) => {
                    const whId = e.target.value;
                    const cur = selectedProductForOpname.warehouseStock?.[whId] || 0;
                    setOpnameForm({ ...opnameForm, warehouseId: whId, actualStock: cur });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      📍 {w.name} (Tercatat Saat Ini: {selectedProductForOpname.warehouseStock?.[w.id] || 0} {selectedProductForOpname.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Jumlah Stok Fisik Riil Terhitung ({selectedProductForOpname.unit}):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    required
                    value={opnameForm.actualStock}
                    onChange={(e) => setOpnameForm({ ...opnameForm, actualStock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-black text-slate-900 text-sm bg-white"
                  />
                  <span className="px-3 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 shrink-0">
                    {selectedProductForOpname.unit}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Tercatat Sebelumnya: {selectedProductForOpname.warehouseStock?.[opnameForm.warehouseId] || 0}</span>
                  <span className="font-bold">
                    Selisih:{" "}
                    {opnameForm.actualStock - (selectedProductForOpname.warehouseStock?.[opnameForm.warehouseId] || 0) > 0 ? "+" : ""}
                    {opnameForm.actualStock - (selectedProductForOpname.warehouseStock?.[opnameForm.warehouseId] || 0)}{" "}
                    {selectedProductForOpname.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan Penyesuaian:</label>
                <select
                  value={opnameForm.reason}
                  onChange={(e) => setOpnameForm({ ...opnameForm, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-white"
                >
                  <option value="Koreksi Fisik Berkala (Stock Opname)">Koreksi Fisik Berkala (Stock Opname)</option>
                  <option value="Penerimaan Barang Baru dari Supplier">Penerimaan Barang Baru dari Supplier</option>
                  <option value="Barang Rusak / Cacat / Hilang">Barang Rusak / Cacat / Hilang</option>
                  <option value="Koreksi Kesalahan Input Admin">Koreksi Kesalahan Input Admin</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional):</label>
                <input
                  type="text"
                  placeholder="Contoh: Dihitung oleh tim logistik Cilegon saat audit akhir bulan"
                  value={opnameForm.notes}
                  onChange={(e) => setOpnameForm({ ...opnameForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpnameModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-dstech-blue hover:bg-blue-600 text-white font-black cursor-pointer shadow-sm"
                >
                  Simpan Hasil Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSFER ANTAR GUDANG */}
      {isTransferModalOpen && selectedProductForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-300" />
                <h3 className="font-black text-sm">Transfer Antar Titik Logistik / Armada</h3>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransfer} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80">
                <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider">Barang yang Dipindahkan</p>
                <p className="font-black text-slate-900 text-sm mt-0.5">{selectedProductForTransfer.name}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Satuan: {selectedProductForTransfer.unit} • Total Stok Seluruh Gudang: {selectedProductForTransfer.stock}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gudang Asal (Sumber):</label>
                  <select
                    value={transferForm.fromWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (Tersedia: {selectedProductForTransfer.warehouseStock?.[w.id] || 0})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gudang Tujuan:</label>
                  <select
                    value={transferForm.toWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Jumlah yang Ditransfer ({selectedProductForTransfer.unit}):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={selectedProductForTransfer.warehouseStock?.[transferForm.fromWarehouseId] || 1}
                    required
                    value={transferForm.qty}
                    onChange={(e) => setTransferForm({ ...transferForm, qty: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-black text-slate-900 text-sm bg-white"
                  />
                  <span className="px-3 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 shrink-0">
                    {selectedProductForTransfer.unit}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Maksimal transfer: {selectedProductForTransfer.warehouseStock?.[transferForm.fromWarehouseId] || 0} {selectedProductForTransfer.unit} dari gudang asal.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Mutasi:</label>
                <input
                  type="text"
                  placeholder="Contoh: Dibawa tim teknisi untuk instalasi project kawasan industri"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black cursor-pointer shadow-sm"
                >
                  Eksekusi Transfer Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: APPROVAL PERMOHONAN MATERIAL */}
      {isApprovalModalOpen && selectedRequestForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-300" />
                <h3 className="font-black text-sm">Persetujuan & Pengeluaran Material Gudang</h3>
              </div>
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-800">{selectedRequestForApproval.id}</span>
                  <span className="text-[10px] text-slate-500">{selectedRequestForApproval.date}</span>
                </div>
                <p className="font-bold text-slate-800">
                  Pemohon: <span className="text-slate-900">{selectedRequestForApproval.requestedBy}</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Terkait Tugas/Proyek: <span className="font-bold text-dstech-blue">{selectedRequestForApproval.taskTitle}</span>
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rincian Material yang Diminta:</label>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  {(selectedRequestForApproval.items || [
                    {
                      materialId: selectedRequestForApproval.materialId || "",
                      materialName: selectedRequestForApproval.materialName || "-",
                      qty: selectedRequestForApproval.qty || 1,
                      unit: selectedRequestForApproval.unit || "Pcs",
                    },
                  ]).map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">• {it.materialName}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-black text-slate-900">
                        {it.qty} {it.selectedUnit || it.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Keluarkan dari Titik Gudang Mana:
                </label>
                <select
                  value={approvalWarehouse}
                  onChange={(e) => setApprovalWarehouse(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      📍 {w.name} ({w.pic})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Stok barang pada gudang yang dipilih akan otomatis terpotong saat tombol setujui diklik.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Serah Terima:</label>
                <input
                  type="text"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApprovalModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApproval}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Setujui & Potong Stok Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
