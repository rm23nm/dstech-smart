"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Receipt,
  ShoppingCart,
  RotateCcw,
  Warehouse,
  Building2,
  FileText,
  Printer,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Send,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Package,
  Phone,
  MapPin,
  RefreshCw,
  Wallet,
  Scale,
} from "lucide-react";

interface SaleItem {
  id: string;
  productName: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  date: string;
  dueDate: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: "Lunas" | "Belum Lunas" | "Sebagian" | "Jatuh Tempo";
  paidAmount: number;
  remainingAmount: number;
  warehouseId: string;
  branchId: string;
  salesPerson: string;
  notes: string;
}

interface PurchaseItem {
  id: string;
  productName: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierContact: string;
  date: string;
  expectedDelivery: string;
  items: PurchaseItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  status: "Draf" | "Dalam Pengiriman" | "Diterima & Lunas" | "Dibatalkan";
  paymentStatus: string;
  warehouseId: string;
  notes: string;
}

interface SalesReturn {
  id: string;
  returnNumber: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  productName: string;
  qty: number;
  unit: string;
  price: number;
  totalRefund: number;
  reason: string;
  resolution: string;
  status: string;
  handledBy: string;
}

interface PurchaseReturn {
  id: string;
  returnNumber: string;
  poNumber: string;
  supplierName: string;
  date: string;
  productName: string;
  qty: number;
  unit: string;
  price: number;
  totalCredit: number;
  reason: string;
  resolution: string;
  status: string;
  handledBy: string;
}

interface CashTransaction {
  id: string;
  date: string;
  type: "IN" | "OUT";
  category: string;
  amount: number;
  account: string;
  reference: string;
  description: string;
  balanceAfter: number;
}

interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  type: string;
  address: string;
  pic: string;
  phone: string;
  totalItemTypes: number;
  totalValuation: number;
  status: string;
}

interface BranchItem {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  head: string;
  phone: string;
  status: string;
}

interface ExpenseItem {
  id: string;
  date: string;
  category: string;
  amount: number;
  recipient: string;
  notes: string;
}

interface FinanceSummary {
  totalSalesRevenue: number;
  totalSalesPaid: number;
  totalAccountsReceivable: number;
  totalPurchasesCost: number;
  totalAccountsPayable: number;
  totalOperatingExpenses: number;
  grossProfit: number;
  netProfit: number;
  currentCashBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  totalSalesCount: number;
  totalPurchasesCount: number;
  totalWarehouseCount: number;
  totalBranchCount: number;
}

export default function AdminFinanceERPPage() {
  const [activeTab, setActiveTab] = useState<
    "sales" | "purchases" | "returns" | "pl_report" | "cash_flow" | "warehouses"
  >("sales");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [sales, setSales] = useState<SaleInvoice[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [returnsSales, setReturnsSales] = useState<SalesReturn[]>([]);
  const [returnsPurchase, setReturnsPurchase] = useState<PurchaseReturn[]>([]);
  const [cashFlow, setCashFlow] = useState<CashTransaction[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [summary, setSummary] = useState<FinanceSummary>({
    totalSalesRevenue: 0,
    totalSalesPaid: 0,
    totalAccountsReceivable: 0,
    totalPurchasesCost: 0,
    totalAccountsPayable: 0,
    totalOperatingExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    currentCashBalance: 0,
    totalCashIn: 0,
    totalCashOut: 0,
    totalSalesCount: 0,
    totalPurchasesCount: 0,
    totalWarehouseCount: 0,
    totalBranchCount: 0,
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");

  // Modal States
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState<boolean>(false);
  const [isNewPoModalOpen, setIsNewPoModalOpen] = useState<boolean>(false);
  const [isNewCashModalOpen, setIsNewCashModalOpen] = useState<boolean>(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SaleInvoice | null>(null);

  // New Sale Form State
  const [saleForm, setSaleForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    paymentMethod: "Transfer Bank Mandiri PT DSTech Smart Perkasa",
    items: [
      { id: "1", productName: "", qty: 1, unit: "Unit", price: 0, total: 0 },
    ],
    discount: 0,
    taxRate: 11,
    paidAmount: 0,
    notes: "",
  });

  // New PO Form State
  const [poForm, setPoForm] = useState({
    supplierName: "",
    supplierContact: "",
    date: new Date().toISOString().split("T")[0],
    expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    paymentStatus: "Hutang Usaha",
    items: [
      { id: "1", productName: "", qty: 1, unit: "Unit", price: 0, total: 0 },
    ],
    notes: "",
  });

  // New Cash Transaction Form
  const [cashForm, setCashForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "IN" as "IN" | "OUT",
    category: "Penerimaan Penjualan",
    amount: 0,
    account: "Bank Mandiri PT DSTech Smart Perkasa",
    reference: "",
    description: "",
    recordAsExpense: false,
    recipient: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const fetchFinanceData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/finance");
      if (res.ok) {
        const d = await res.json();
        if (d.data) {
          setSales(d.data.sales || []);
          setPurchases(d.data.purchases || []);
          setReturnsSales(d.data.returns_sales || []);
          setReturnsPurchase(d.data.returns_purchase || []);
          setCashFlow(d.data.cash_flow || []);
          setWarehouses(d.data.warehouses || []);
          setBranches(d.data.branches || []);
          setExpenses(d.data.expenses || []);
          if (d.data.summary) setSummary(d.data.summary);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data keuangan:", err);
      showToast("Gagal menyambung ke database keuangan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Handler Sale Form Dynamic Items
  const handleAddSaleItem = () => {
    setSaleForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: String(Date.now()), productName: "", qty: 1, unit: "Unit", price: 0, total: 0 },
      ],
    }));
  };

  const handleRemoveSaleItem = (idx: number) => {
    if (saleForm.items.length <= 1) return;
    setSaleForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleSaleItemChange = (idx: number, field: string, val: any) => {
    setSaleForm((prev) => {
      const updated = [...prev.items];
      const item = { ...updated[idx], [field]: val };
      if (field === "qty" || field === "price") {
        item.total = Number(item.qty || 0) * Number(item.price || 0);
      }
      updated[idx] = item;
      return { ...prev, items: updated };
    });
  };

  const calculateSaleTotals = () => {
    const subtotal = saleForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const afterDiscount = Math.max(0, subtotal - Number(saleForm.discount || 0));
    const taxAmount = (afterDiscount * Number(saleForm.taxRate || 0)) / 100;
    const grandTotal = afterDiscount + taxAmount;
    return { subtotal, afterDiscount, taxAmount, grandTotal };
  };

  const handleCreateSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, taxAmount, grandTotal } = calculateSaleTotals();

    if (saleForm.items.some((it) => !it.productName || it.price <= 0)) {
      showToast("Mohon isi nama produk dan harga valid untuk semua baris item!");
      return;
    }

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "sale",
          payload: {
            customerName: saleForm.customerName,
            customerPhone: saleForm.customerPhone,
            customerAddress: saleForm.customerAddress,
            date: saleForm.date,
            dueDate: saleForm.dueDate,
            paymentMethod: saleForm.paymentMethod,
            items: saleForm.items,
            subtotal,
            discount: Number(saleForm.discount),
            taxRate: Number(saleForm.taxRate),
            taxAmount,
            grandTotal,
            paidAmount: Number(saleForm.paidAmount),
            notes: saleForm.notes,
          },
        }),
      });

      if (res.ok) {
        showToast("Faktur Penjualan baru berhasil diterbitkan!");
        setIsNewSaleModalOpen(false);
        setSaleForm({
          customerName: "",
          customerPhone: "",
          customerAddress: "",
          date: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
          paymentMethod: "Transfer Bank Mandiri PT DSTech Smart Perkasa",
          items: [{ id: "1", productName: "", qty: 1, unit: "Unit", price: 0, total: 0 }],
          discount: 0,
          taxRate: 11,
          paidAmount: 0,
          notes: "",
        });
        fetchFinanceData();
      } else {
        showToast("Gagal menyimpan faktur penjualan");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  // Handler Cash Form Submit
  const handleCreateCashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cashForm.amount <= 0) {
      showToast("Jumlah nominal transaksi kas harus lebih dari Rp 0!");
      return;
    }

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "cash_flow",
          payload: cashForm,
        }),
      });

      if (res.ok) {
        showToast("Transaksi kas berhasil dibukukan!");
        setIsNewCashModalOpen(false);
        setCashForm({
          date: new Date().toISOString().split("T")[0],
          type: "IN",
          category: "Penerimaan Penjualan",
          amount: 0,
          account: "Bank Mandiri PT DSTech Smart Perkasa",
          reference: "",
          description: "",
          recordAsExpense: false,
          recipient: "",
        });
        fetchFinanceData();
      } else {
        showToast("Gagal mencatat transaksi kas");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-2xl border border-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[36px] bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-sky-600 to-transparent"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                DSTech Financial & Supply Chain ERP
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                • Database Prefix: dstech_finance_
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Manajemen Keuangan & ERP Terpadu
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pusat kendali arus kas, penjualan, faktur tagihan, purchase order supplier, retur barang, laporan laba rugi, serta kontrol multi-gudang dan cabang PT. DSTech Smart Perkasa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsNewSaleModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-dstech-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Faktur Penjualan</span>
            </button>
            <button
              onClick={() => setIsNewCashModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Catat Kas Masuk/Keluar</span>
            </button>
            <button
              onClick={fetchFinanceData}
              disabled={isLoading}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRICS SUITE */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Total Omset */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Omset</span>
            <div className="p-1.5 rounded-xl bg-blue-50 text-dstech-blue">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
            {formatRupiah(summary.totalSalesRevenue)}
          </h3>
          <p className="text-[10px] text-slate-500 font-semibold">{summary.totalSalesCount} Faktur Penjualan</p>
        </div>

        {/* Metric 2: Total Belanja HPP */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Belanja HPP</span>
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
            {formatRupiah(summary.totalPurchasesCost)}
          </h3>
          <p className="text-[10px] text-slate-500 font-semibold">{summary.totalPurchasesCount} PO Supplier</p>
        </div>

        {/* Metric 3: Laba Bersih */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Laba Bersih</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-black text-emerald-600 truncate">
            {formatRupiah(summary.netProfit)}
          </h3>
          <p className="text-[10px] text-emerald-700 font-semibold">
            Margin:{" "}
            {summary.totalSalesRevenue > 0
              ? `${Math.round((summary.netProfit / summary.totalSalesRevenue) * 100)}%`
              : "0%"}
          </p>
        </div>

        {/* Metric 4: Saldo Kas Riil */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Saldo Kas & Bank</span>
            <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-black text-purple-700 truncate">
            {formatRupiah(summary.currentCashBalance)}
          </h3>
          <p className="text-[10px] text-slate-500 font-semibold">Kas Berjalan</p>
        </div>

        {/* Metric 5: Piutang Usaha */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Piutang Klien</span>
            <div className="p-1.5 rounded-xl bg-sky-50 text-sky-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-black text-sky-700 truncate">
            {formatRupiah(summary.totalAccountsReceivable)}
          </h3>
          <p className="text-[10px] text-slate-500 font-semibold">Belum Tertagih</p>
        </div>

        {/* Metric 6: Hutang Supplier */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Hutang Vendor</span>
            <div className="p-1.5 rounded-xl bg-red-50 text-red-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-black text-red-700 truncate">
            {formatRupiah(summary.totalAccountsPayable)}
          </h3>
          <p className="text-[10px] text-slate-500 font-semibold">Jatuh Tempo PO</p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "sales"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Receipt className="w-4 h-4 text-dstech-blue" />
            <span>Penjualan & Faktur</span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-[10px]">
              {sales.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "purchases"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-amber-500" />
            <span>Pembelian & PO</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[10px]">
              {purchases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("returns")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "returns"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <RotateCcw className="w-4 h-4 text-red-500" />
            <span>Retur Barang</span>
            <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-[10px]">
              {returnsSales.length + returnsPurchase.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pl_report")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "pl_report"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Laporan Laba Rugi</span>
          </button>

          <button
            onClick={() => setActiveTab("cash_flow")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "cash_flow"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Wallet className="w-4 h-4 text-purple-500" />
            <span>Buku Arus Kas</span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-[10px]">
              {cashFlow.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("warehouses")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "warehouses"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Warehouse className="w-4 h-4 text-sky-500" />
            <span>Gudang & Cabang</span>
            <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-[10px]">
              {warehouses.length} GD / {branches.length} BR
            </span>
          </button>
        </div>

        {/* TAB 1: PENJUALAN & FAKTUR */}
        {activeTab === "sales" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nomor faktur INV-..., nama klien, atau catatan proyek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-dstech-red focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none"
                >
                  <option value="Semua">Semua Status Bayar</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Lunas">Belum Lunas</option>
                </select>

                <button
                  onClick={() => setIsNewSaleModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Penjualan</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">No. Faktur</th>
                    <th className="p-3">Pelanggan / Klien</th>
                    <th className="p-3">Tanggal & Tempo</th>
                    <th className="p-3">Rincian Item</th>
                    <th className="p-3">Grand Total</th>
                    <th className="p-3">Status Bayar</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales
                    .filter((s) => {
                      const matchQuery =
                        s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.customerName.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchStatus = statusFilter === "Semua" || s.paymentStatus === statusFilter;
                      return matchQuery && matchStatus;
                    })
                    .map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-black text-slate-900 whitespace-nowrap">
                          <span className="font-mono text-dstech-blue">{sale.invoiceNumber}</span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{sale.customerName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{sale.customerPhone}</p>
                        </td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          <p className="font-medium">{sale.date}</p>
                          <p className="text-[10px] text-slate-400">Tempo: {sale.dueDate}</p>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            {sale.items.map((it, idx) => (
                              <p key={idx} className="text-[11px] text-slate-700 font-medium">
                                • {it.productName} ({it.qty} {it.unit})
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-black text-slate-900">{formatRupiah(sale.grandTotal)}</p>
                          {sale.remainingAmount > 0 && (
                            <p className="text-[10px] text-red-600 font-bold">
                              Sisa Piutang: {formatRupiah(sale.remainingAmount)}
                            </p>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              sale.paymentStatus === "Lunas"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {sale.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedInvoiceForPrint(sale)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-dstech-blue hover:bg-dstech-blue hover:text-white font-bold text-[11px] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Faktur</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PEMBELIAN & PURCHASE ORDER (PO) */}
        {activeTab === "purchases" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nomor PO, supplier, atau barang belanja..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => setIsNewPoModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Buat PO Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">No. PO</th>
                    <th className="p-3">Supplier / Vendor</th>
                    <th className="p-3">Tanggal Order</th>
                    <th className="p-3">Rincian Barang</th>
                    <th className="p-3">Total Belanja</th>
                    <th className="p-3">Status Pengiriman</th>
                    <th className="p-3">Status Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-black text-amber-700 whitespace-nowrap">
                        {po.poNumber}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        <p>{po.supplierName}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{po.supplierContact}</p>
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        <p className="font-medium">{po.date}</p>
                        <p className="text-[10px] text-slate-400">Est. Tiba: {po.expectedDelivery}</p>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {po.items.map((it, idx) => (
                            <p key={idx} className="text-[11px] text-slate-700 font-medium">
                              • {it.productName} ({it.qty} {it.unit})
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-black text-slate-900 whitespace-nowrap">
                        {formatRupiah(po.grandTotal)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            po.status === "Diterima & Lunas"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-bold text-slate-700">
                        {po.paymentStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RETUR PENJUALAN & RETUR PEMBELIAN */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Retur Penjualan (Dari Pelanggan) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <h3 className="font-black text-sm text-slate-900">Retur Penjualan (Dari Klien)</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{returnsSales.length} Kasus</span>
                </div>

                <div className="space-y-2">
                  {returnsSales.map((ret) => (
                    <div key={ret.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-red-600">{ret.returnNumber}</span>
                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-md">
                          {ret.status}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs">
                        {ret.customerName} (Ref: {ret.invoiceNumber})
                      </p>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-xs space-y-1">
                        <p className="font-bold text-slate-800">
                          {ret.productName} ({ret.qty} {ret.unit})
                        </p>
                        <p className="text-[11px] text-slate-500">Alasan: {ret.reason}</p>
                        <p className="text-[11px] text-dstech-blue font-bold">Solusi: {ret.resolution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retur Pembelian (Ke Vendor / Supplier) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <h3 className="font-black text-sm text-slate-900">Retur Pembelian (Ke Supplier)</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{returnsPurchase.length} Kasus</span>
                </div>

                <div className="space-y-2">
                  {returnsPurchase.map((ret) => (
                    <div key={ret.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-amber-700">{ret.returnNumber}</span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                          {ret.status}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs">
                        {ret.supplierName} (Ref: {ret.poNumber})
                      </p>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-xs space-y-1">
                        <p className="font-bold text-slate-800">
                          {ret.productName} ({ret.qty} {ret.unit})
                        </p>
                        <p className="text-[11px] text-slate-500">Alasan: {ret.reason}</p>
                        <p className="text-[11px] text-amber-800 font-bold">Klaim: {ret.resolution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LAPORAN LABA RUGI (INCOME STATEMENT / P&L) */}
        {activeTab === "pl_report" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-black tracking-wide">
                    Laporan Laba Rugi Komprehensif (Income Statement)
                  </h3>
                  <p className="text-xs text-slate-400">Periode: Berjalan Oktober 2026 • PT. DSTech Smart Perkasa</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Laporan P&L</span>
                </button>
              </div>

              {/* P&L Breakdown Table */}
              <div className="space-y-4 text-xs font-medium">
                {/* 1. Pendapatan */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-black text-blue-400 border-b border-white/10 pb-1">
                    <span>1. PENDAPATAN OPERASIONAL</span>
                    <span>{formatRupiah(summary.totalSalesRevenue)}</span>
                  </div>
                  <div className="pl-4 space-y-1 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>• Penjualan Perangkat CCTV, Access Control, IoT & Jaringan</span>
                      <span>{formatRupiah(summary.totalSalesRevenue)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. HPP */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-black text-amber-400 border-b border-white/10 pb-1">
                    <span>2. HARGA POKOK PENJUALAN (HPP & BELANJA STOK)</span>
                    <span>({formatRupiah(summary.totalPurchasesCost)})</span>
                  </div>
                  <div className="pl-4 space-y-1 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>• Pembelian Stok Kamera IP, NVR, Storage & Kabel Belden</span>
                      <span>({formatRupiah(summary.totalPurchasesCost)})</span>
                    </div>
                  </div>
                </div>

                {/* LABA KOTOR */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-sm font-black text-white">
                  <span>LABA KOTOR (GROSS PROFIT)</span>
                  <span className="text-emerald-400">{formatRupiah(summary.grossProfit)}</span>
                </div>

                {/* 3. Beban Operasional */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-black text-red-400 border-b border-white/10 pb-1">
                    <span>3. BEBAN OPERASIONAL & UMUM</span>
                    <span>({formatRupiah(summary.totalOperatingExpenses)})</span>
                  </div>
                  <div className="pl-4 space-y-1.5 text-slate-300">
                    {expenses.map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between">
                        <span>• {exp.category}</span>
                        <span>({formatRupiah(exp.amount)})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LABA BERSIH */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-emerald-900 border border-emerald-500/40 flex items-center justify-between text-base font-black text-white shadow-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span>LABA BERSIH BERJALAN (NET PROFIT)</span>
                  </div>
                  <span className="text-xl text-emerald-300">{formatRupiah(summary.netProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BUKU ARUS KAS (CASH FLOW) */}
        {activeTab === "cash_flow" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Kas Masuk (IN)</p>
                  <p className="text-sm font-black text-emerald-800">{formatRupiah(summary.totalCashIn)}</p>
                </div>
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                  <p className="text-[10px] font-bold text-red-700 uppercase">Kas Keluar (OUT)</p>
                  <p className="text-sm font-black text-red-800">{formatRupiah(summary.totalCashOut)}</p>
                </div>
              </div>

              <button
                onClick={() => setIsNewCashModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Catat Transaksi Kas</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Tipe</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Keterangan / Deskripsi</th>
                    <th className="p-3">Rekening Akun</th>
                    <th className="p-3 text-right">Nominal (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cashFlow.map((cash) => (
                    <tr key={cash.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-medium text-slate-500 whitespace-nowrap">{cash.date}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                            cash.type === "IN"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cash.type === "IN" ? (
                            <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-red-600" />
                          )}
                          <span>{cash.type === "IN" ? "Masuk" : "Keluar"}</span>
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800 whitespace-nowrap">{cash.category}</td>
                      <td className="p-3 text-slate-600">
                        <p className="font-medium text-slate-900">{cash.description}</p>
                        {cash.reference && (
                          <p className="text-[10px] font-mono text-slate-400">Ref: {cash.reference}</p>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 font-medium whitespace-nowrap">{cash.account}</td>
                      <td
                        className={`p-3 text-right font-black whitespace-nowrap ${
                          cash.type === "IN" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {cash.type === "IN" ? "+" : "-"} {formatRupiah(cash.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: MULTI-GUDANG & CABANG */}
        {activeTab === "warehouses" && (
          <div className="space-y-6">
            {/* Gudang Operasional */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-dstech-blue" />
                  <h3 className="font-black text-sm text-slate-900">Daftar Titik Gudang & Logistik</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{warehouses.length} Lokasi</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {warehouses.map((wh) => (
                  <div key={wh.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-dstech-blue bg-blue-100 px-2 py-0.5 rounded-md">
                        {wh.code}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {wh.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{wh.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{wh.address}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">PIC Gudang</p>
                        <p className="font-bold text-slate-800">{wh.pic}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Valuasi Stok</p>
                        <p className="font-black text-slate-900">{formatRupiah(wh.totalValuation)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kantor Cabang */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <h3 className="font-black text-sm text-slate-900">Kantor Pusat & Kantor Cabang DSTech</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{branches.length} Cabang</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {branches.map((br) => (
                  <div key={br.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        {br.code}
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        {br.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{br.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{br.address}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Pimpinan Cabang</p>
                        <p className="font-bold text-slate-800">{br.head}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Wilayah</p>
                        <p className="font-bold text-slate-800">{br.city}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: BUAT FAKTUR PENJUALAN BARU */}
      {isNewSaleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsNewSaleModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dstech-blue">
                  Formulir Penjualan & Invoicing
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">Terbitkan Faktur Penjualan Baru</h3>
              </div>
              <button
                onClick={() => setIsNewSaleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSaleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Klien / Pelanggan:</label>
                  <input
                    type="text"
                    required
                    placeholder="PT. / Instansi / Nama Pribadi"
                    value={saleForm.customerName}
                    onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp / Telp:</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={saleForm.customerPhone}
                    onChange={(e) => setSaleForm({ ...saleForm, customerPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Metode Pembayaran:</label>
                  <select
                    value={saleForm.paymentMethod}
                    onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="Transfer Bank Mandiri PT DSTech Smart Perkasa">
                      Transfer Bank Mandiri PT DSTech
                    </option>
                    <option value="Transfer Bank BCA DSTech">Transfer Bank BCA DSTech</option>
                    <option value="Tunai / Kas Langsung">Tunai / Kas Langsung</option>
                    <option value="Tempo 14 Hari">Tempo 14 Hari</option>
                    <option value="Tempo 30 Hari">Tempo 30 Hari</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Pemasangan / Proyek:</label>
                <input
                  type="text"
                  placeholder="Lokasi lengkap pengiriman atau instalasi..."
                  value={saleForm.customerAddress}
                  onChange={(e) => setSaleForm({ ...saleForm, customerAddress: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              {/* Items Table Repeater */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                    Daftar Produk / Jasa yang Dijual ({saleForm.items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSaleItem}
                    className="text-dstech-blue font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {saleForm.items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Nama Barang / Jasa..."
                          value={it.productName}
                          onChange={(e) => handleSaleItemChange(idx, "productName", e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          required
                          placeholder="Qty"
                          value={it.qty}
                          onChange={(e) => handleSaleItemChange(idx, "qty", Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Satuan"
                          value={it.unit}
                          onChange={(e) => handleSaleItemChange(idx, "unit", e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          required
                          placeholder="Harga (Rp)"
                          value={it.price}
                          onChange={(e) => handleSaleItemChange(idx, "price", Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {saleForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSaleItem(idx)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations Box */}
              {(() => {
                const { subtotal, taxAmount, grandTotal } = calculateSaleTotals();
                return (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Subtotal:</span>
                      <span className="font-bold">{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Diskon Potongan (Rp):</label>
                        <input
                          type="number"
                          min={0}
                          value={saleForm.discount}
                          onChange={(e) => setSaleForm({ ...saleForm, discount: Number(e.target.value) })}
                          className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">PPN (%):</label>
                        <input
                          type="number"
                          min={0}
                          value={saleForm.taxRate}
                          onChange={(e) => setSaleForm({ ...saleForm, taxRate: Number(e.target.value) })}
                          className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Nominal Pajak PPN ({saleForm.taxRate}%):</span>
                      <span className="font-bold">{formatRupiah(taxAmount)}</span>
                    </div>
                    <div className="border-t border-white/20 pt-2 flex items-center justify-between text-base font-black">
                      <span className="text-amber-400">GRAND TOTAL:</span>
                      <span className="text-xl text-emerald-400">{formatRupiah(grandTotal)}</span>
                    </div>

                    <div className="pt-2">
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Jumlah Dibayar Sekarang (DP / Lunas):
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={grandTotal}
                        value={saleForm.paidAmount}
                        onChange={(e) => setSaleForm({ ...saleForm, paidAmount: Number(e.target.value) })}
                        className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-emerald-300 text-sm font-black"
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewSaleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dstech-red hover:bg-red-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan & Terbitkan Faktur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CATAT KAS MASUK / KELUAR */}
      {isNewCashModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsNewCashModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">
                  Buku Kas & Bank
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">Catat Transaksi Arus Kas</h3>
              </div>
              <button
                onClick={() => setIsNewCashModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCashSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Arah Transaksi:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCashForm({ ...cashForm, type: "IN" })}
                    className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      cashForm.type === "IN"
                        ? "bg-emerald-600 text-white shadow"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    + Kas Masuk (IN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashForm({ ...cashForm, type: "OUT" })}
                    className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      cashForm.type === "OUT"
                        ? "bg-red-600 text-white shadow"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    - Kas Keluar (OUT)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nominal Transaksi (Rp):</label>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="Contoh: 1500000"
                  value={cashForm.amount || ""}
                  onChange={(e) => setCashForm({ ...cashForm, amount: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-black text-base text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Keuangan:</label>
                <select
                  value={cashForm.category}
                  onChange={(e) => setCashForm({ ...cashForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="Penerimaan Penjualan">Penerimaan Penjualan / DP Proyek</option>
                  <option value="Pelunasan Piutang Klien">Pelunasan Piutang Klien</option>
                  <option value="Pembelian Stok Gudang">Pembelian Stok Gudang</option>
                  <option value="Gaji & Insentif Lapangan">Gaji & Insentif Lapangan</option>
                  <option value="Transport, BBM & Tol">Transport, BBM & Tol</option>
                  <option value="Listrik, Internet & Workshop">Listrik, Internet & Workshop</option>
                  <option value="Peralatan K3 & Alat Kerja">Peralatan K3 & Alat Kerja</option>
                  <option value="Biaya Operasional Lainnya">Biaya Operasional Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rekening Akun:</label>
                <select
                  value={cashForm.account}
                  onChange={(e) => setCashForm({ ...cashForm, account: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="Bank Mandiri PT DSTech Smart Perkasa">
                    Bank Mandiri PT DSTech Smart Perkasa
                  </option>
                  <option value="Bank BCA DSTech">Bank BCA DSTech</option>
                  <option value="Kas Kecil (Petty Cash)">Kas Kecil (Petty Cash Kantor)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi / Catatan:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Keterangan lengkap pengeluaran/pemasukan..."
                  value={cashForm.description}
                  onChange={(e) => setCashForm({ ...cashForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCashModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Transaksi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CETAK FAKTUR PENJUALAN RESMI (PRINT PREVIEW) */}
      {selectedInvoiceForPrint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedInvoiceForPrint(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-dstech-blue" />
                Format Faktur Resmi PT. DSTech Smart Perkasa
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* FAKTUR CONTENT CONTAINER (Siap Cetak) */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white space-y-6 text-slate-800">
              {/* Kop Surat Perusahaan */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black text-dstech-red tracking-tight">
                      PT. DSTECH SMART PERKASA
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600">
                    Solusi Security System, CCTV, Access Control, IoT & IT Infrastructure
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed max-w-md">
                    Perum Bukit Cilegon Asri Blok DB No. 19, Kel. Bagendung, Kec. Cilegon, Kota Cilegon - Banten
                    <br />
                    WhatsApp CS: 0822-5949-4242 | Email: cs@dstechsmart.com | Website: https://dstechsmart.com
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="px-3 py-1 rounded-md bg-slate-900 text-white font-black text-xs uppercase tracking-wider inline-block">
                    FAKTUR PENJUALAN
                  </span>
                  <p className="font-mono font-black text-sm text-dstech-blue">
                    {selectedInvoiceForPrint.invoiceNumber}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Tanggal: {selectedInvoiceForPrint.date}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Jatuh Tempo: {selectedInvoiceForPrint.dueDate}
                  </p>
                </div>
              </div>

              {/* Data Klien */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tagihan Kepada:</p>
                  <p className="font-black text-slate-900 text-sm mt-0.5">
                    {selectedInvoiceForPrint.customerName}
                  </p>
                  <p className="text-slate-600 mt-0.5">{selectedInvoiceForPrint.customerPhone}</p>
                  <p className="text-slate-500">{selectedInvoiceForPrint.customerAddress}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status Pembayaran:</p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-black uppercase ${
                      selectedInvoiceForPrint.paymentStatus === "Lunas"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {selectedInvoiceForPrint.paymentStatus}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Metode: {selectedInvoiceForPrint.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Tabel Item Faktur */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Deskripsi Produk / Layanan</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-center">Satuan</th>
                      <th className="p-2.5 text-right">Harga Satuan</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoiceForPrint.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{it.productName}</td>
                        <td className="p-2.5 text-center font-bold">{it.qty}</td>
                        <td className="p-2.5 text-center text-slate-600">{it.unit}</td>
                        <td className="p-2.5 text-right font-medium">{formatRupiah(it.price)}</td>
                        <td className="p-2.5 text-right font-black">{formatRupiah(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rincian Perhitungan */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-3 border-t border-slate-200 text-xs">
                <div className="space-y-2 max-w-sm">
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] space-y-1">
                    <p className="font-bold text-dstech-blue">Instruksi Pembayaran Resmi Transfer Bank:</p>
                    <p className="text-slate-700">
                      • <strong>Bank Mandiri</strong>: 163-00-1122334-5 a/n PT DSTech Smart Perkasa
                    </p>
                    <p className="text-slate-700">
                      • <strong>Bank BCA</strong>: 295-888-9900 a/n PT DSTech Smart Perkasa
                    </p>
                    <p className="text-[10px] text-slate-500 italic mt-1">
                      Harap sertakan nomor faktur ({selectedInvoiceForPrint.invoiceNumber}) pada berita transfer.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 sm:w-72">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900">{formatRupiah(selectedInvoiceForPrint.subtotal)}</span>
                  </div>
                  {selectedInvoiceForPrint.discount > 0 && (
                    <div className="flex items-center justify-between text-red-600">
                      <span>Diskon:</span>
                      <span className="font-bold">- {formatRupiah(selectedInvoiceForPrint.discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-600">
                    <span>PPN ({selectedInvoiceForPrint.taxRate}%):</span>
                    <span className="font-bold text-slate-900">{formatRupiah(selectedInvoiceForPrint.taxAmount)}</span>
                  </div>
                  <div className="border-t-2 border-slate-900 pt-2 flex items-center justify-between text-sm font-black text-slate-900">
                    <span>TOTAL TAGIHAN:</span>
                    <span className="text-base text-dstech-blue">{formatRupiah(selectedInvoiceForPrint.grandTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>Sudah Dibayar:</span>
                    <span className="font-bold text-emerald-600">{formatRupiah(selectedInvoiceForPrint.paidAmount)}</span>
                  </div>
                  {selectedInvoiceForPrint.remainingAmount > 0 && (
                    <div className="flex items-center justify-between text-red-600 text-[11px] font-bold">
                      <span>Sisa Piutang:</span>
                      <span>{formatRupiah(selectedInvoiceForPrint.remainingAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 text-center text-xs">
                <div>
                  <p className="text-slate-500">Penerima / Klien</p>
                  <div className="h-16"></div>
                  <p className="font-bold text-slate-900 underline">{selectedInvoiceForPrint.customerName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Hormat Kami,</p>
                  <p className="text-[10px] font-bold text-slate-400">PT. DSTech Smart Perkasa</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="px-2 py-0.5 rounded border border-emerald-500 text-emerald-600 font-mono text-[9px] uppercase font-black">
                      [Terkonfirmasi Sistem DSTech]
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 underline">Direktur Keuangan & Operasional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
