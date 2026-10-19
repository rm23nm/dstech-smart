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
  Users,
  Truck,
  Edit3,
  Trash2,
  Mail,
  Landmark,
  UserPlus,
  PenTool,
  CheckCheck,
  Eraser,
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
  paymentStatus: string;
  paidAmount: number;
  remainingAmount: number;
  invoiceType?: "Standar" | "DP";
  dpPercentage?: number;
  dpAmount?: number;
  dpStatus?: string;
  dpPaidAmount?: number;
  dpNotes?: string;
  warehouseId: string;
  branchId: string;
  salesPerson: string;
  notes: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedTitle?: string;
  approvedAt?: string;
  verificationCode?: string;
  signatureImage?: string;
  approvalNotes?: string;
}

interface QuotationItem {
  id: string;
  productName: string;
  qty: number;
  unit: string;
  price: number;
  discount: number;
  total: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  clientId?: string;
  customerName: string;
  customerOrg?: string;
  customerPhone: string;
  customerAddress: string;
  subject: string;
  date: string;
  validUntil: string;
  validityDays: number;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  terms: string;
  status: "Draf" | "Terkirim" | "Disetujui Klien" | "Ditolak" | "Terkonversi Faktur" | string;
  convertedInvoiceId?: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedTitle?: string;
  approvedAt?: string;
  verificationCode?: string;
  signatureImage?: string;
  approvalNotes?: string;
  notes?: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch: string;
  isDefault?: boolean;
  status: string;
}

interface FinanceSettings {
  letterheadUrl: string;
  letterheadEnabled: boolean;
  watermarkOpacity: number;
  signerName?: string;
  signerTitle?: string;
  masterSignatureUrl?: string;
  masterStampUrl?: string;
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
  type?: string;
  address: string;
  city?: string;
  pic: string;
  phone?: string;
  totalItemTypes?: number;
  totalValuation: number;
  status: string;
  notes?: string;
}

interface BranchItem {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  head: string;
  phone?: string;
  email?: string;
  coverage?: string;
  status: string;
  notes?: string;
}

interface ExpenseItem {
  id: string;
  date: string;
  category: string;
  amount: number;
  recipient: string;
  notes: string;
}

interface ClientItem {
  id: string;
  name: string;
  category: string;
  pic: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  npwp: string;
  status: "VIP" | "Aktif" | "Prospek";
  totalInvoiced: number;
  totalPaid: number;
  unpaidReceivable: number;
  notes: string;
}

interface SupplierItem {
  id: string;
  name: string;
  category: string;
  pic: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  bankAccount: string;
  paymentTerms: string;
  status: "Mitra Utama" | "Mitra Aktif" | "Mitra Lokal" | string;
  totalPurchases: number;
  unpaidPayable: number;
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
  totalClientsCount?: number;
  totalSuppliersCount?: number;
  totalQuotationsCount?: number;
  totalQuotationsValue?: number;
  totalQuotationsPending?: number;
  totalQuotationsApproved?: number;
}

export default function AdminFinanceERPPage() {
  const [activeTab, setActiveTab] = useState<
    "sales" | "quotations" | "purchases" | "returns" | "pl_report" | "cash_flow" | "warehouses" | "clients" | "suppliers"
  >("sales");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [sales, setSales] = useState<SaleInvoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [returnsSales, setReturnsSales] = useState<SalesReturn[]>([]);
  const [returnsPurchase, setReturnsPurchase] = useState<PurchaseReturn[]>([]);
  const [cashFlow, setCashFlow] = useState<CashTransaction[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
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
    totalClientsCount: 0,
    totalSuppliersCount: 0,
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [clientSearchQuery, setClientSearchQuery] = useState<string>("");
  const [clientCategoryFilter, setClientCategoryFilter] = useState<string>("Semua");
  const [supplierSearchQuery, setSupplierSearchQuery] = useState<string>("");

  // Modal States
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState<boolean>(false);
  const [isNewPoModalOpen, setIsNewPoModalOpen] = useState<boolean>(false);
  const [isNewCashModalOpen, setIsNewCashModalOpen] = useState<boolean>(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SaleInvoice | null>(null);
  const [cashAccountFilter, setCashAccountFilter] = useState<string>("ALL");

  // Bank Accounts & Settings States
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: "dstech_bank_1",
      bankName: "Bank Mandiri",
      accountNumber: "163-00-1122334-5",
      accountHolder: "PT. DSTech Smart Perkasa",
      branch: "KCP Cilegon City Square",
      isDefault: true,
      status: "Aktif",
    },
    {
      id: "dstech_bank_2",
      bankName: "Bank BCA",
      accountNumber: "295-888-9900",
      accountHolder: "PT. DSTech Smart Perkasa",
      branch: "KCU Cilegon",
      isDefault: false,
      status: "Aktif",
    },
  ]);

  const getDefaultBankAccLabel = () => {
    const def = bankAccounts.find((b) => b.isDefault && b.status === "Aktif") || bankAccounts.find((b) => b.status === "Aktif") || bankAccounts[0];
    return def ? `${def.bankName} - ${def.accountNumber} (${def.accountHolder})` : "Kas Tunai Operasional";
  };

  const getDefaultTransferLabel = () => {
    const def = bankAccounts.find((b) => b.isDefault && b.status === "Aktif") || bankAccounts.find((b) => b.status === "Aktif") || bankAccounts[0];
    return def ? `Transfer ${def.bankName} (${def.accountNumber} - ${def.accountHolder})` : "Transfer Bank Resmi DSTech";
  };

  const [financeSettings, setFinanceSettings] = useState<FinanceSettings>({
    letterheadUrl: "/kop_surat_dstech.jpg",
    letterheadEnabled: true,
    watermarkOpacity: 0.15,
    signerName: "H. Agus Supriyadi, S.T., M.Kom.",
    signerTitle: "Direktur Keuangan & Operasional",
    masterSignatureUrl: "",
    masterStampUrl: "",
  });

  // Terima Pembayaran Modal State
  const [isPayInvoiceModalOpen, setIsPayInvoiceModalOpen] = useState<boolean>(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<SaleInvoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Edit Sale Modal State
  const [isEditSaleModalOpen, setIsEditSaleModalOpen] = useState<boolean>(false);
  const [editingSale, setEditingSale] = useState<SaleInvoice | null>(null);

  // Bank Account Settings Modal State
  const [isBankAccountsModalOpen, setIsBankAccountsModalOpen] = useState<boolean>(false);
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);
  const [bankAccountForm, setBankAccountForm] = useState({
    bankName: "Bank Mandiri",
    accountNumber: "",
    accountHolder: "PT. DSTech Smart Perkasa",
    branch: "Cilegon",
    isDefault: false,
    status: "Aktif",
  });

  // Letterhead Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [tempSettings, setTempSettings] = useState<FinanceSettings>({
    letterheadUrl: "/kop_surat_dstech.jpg",
    letterheadEnabled: true,
    watermarkOpacity: 0.15,
    signerName: "H. Agus Supriyadi, S.T., M.Kom.",
    signerTitle: "Direktur Keuangan & Operasional",
    masterSignatureUrl: "",
    masterStampUrl: "",
  });

  // Approval & Digital Signature Modal States
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [selectedInvoiceForApproval, setSelectedInvoiceForApproval] = useState<SaleInvoice | null>(null);
  const [approvalMode, setApprovalMode] = useState<"canvas" | "master" | "upload">("canvas");
  const [signerNameInput, setSignerNameInput] = useState<string>("H. Agus Supriyadi, S.T., M.Kom.");
  const [signerTitleInput, setSignerTitleInput] = useState<string>("Direktur Keuangan & Operasional");
  const [approvalNotesInput, setApprovalNotesInput] = useState<string>("Disetujui untuk diterbitkan secara sah kepada klien.");
  const [uploadedSignatureBase64, setUploadedSignatureBase64] = useState<string>("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<boolean>(false);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  // Master Client Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [clientForm, setClientForm] = useState({
    name: "",
    category: "B2B Industri",
    pic: "",
    phone: "",
    email: "",
    address: "",
    city: "Cilegon",
    npwp: "",
    status: "Aktif" as "VIP" | "Aktif" | "Prospek",
    notes: "",
  });

  // Master Supplier Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    category: "CCTV, NVR & Security Hardware",
    pic: "",
    phone: "",
    email: "",
    address: "",
    city: "Cilegon",
    bankAccount: "",
    paymentTerms: "Net 30 Hari",
    status: "Mitra Aktif",
    notes: "",
  });

  // Master Warehouse Modal State
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState<boolean>(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseItem | null>(null);
  const [warehouseForm, setWarehouseForm] = useState({
    code: "",
    name: "",
    type: "Gudang Pusat",
    address: "",
    city: "Cilegon",
    pic: "",
    phone: "",
    totalItemTypes: 0,
    totalValuation: 0,
    status: "Aktif",
    notes: "",
  });

  // Master Branch Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [branchForm, setBranchForm] = useState({
    code: "",
    name: "",
    city: "Cilegon",
    address: "",
    head: "",
    phone: "",
    email: "",
    coverage: "",
    status: "Kantor Cabang",
    notes: "",
  });

  // Quotations States & Modals
  const [quotationSearchQuery, setQuotationSearchQuery] = useState<string>("");
  const [quotationStatusFilter, setQuotationStatusFilter] = useState<string>("Semua");
  const [isNewQuotationModalOpen, setIsNewQuotationModalOpen] = useState<boolean>(false);
  const [isEditQuotationModalOpen, setIsEditQuotationModalOpen] = useState<boolean>(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [selectedQuotationForPrint, setSelectedQuotationForPrint] = useState<Quotation | null>(null);
  const [selectedQuotationForConvert, setSelectedQuotationForConvert] = useState<Quotation | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState<boolean>(false);
  const [convertForm, setConvertForm] = useState({
    invoiceType: "Standar" as "Standar" | "DP",
    dpPercentage: 50,
    dpNotes: "Pengajuan Uang Muka (DP 50%) Pelaksanaan Proyek",
  });

  const [quotationForm, setQuotationForm] = useState({
    clientId: "",
    customerName: "",
    customerOrg: "",
    customerPhone: "",
    customerAddress: "",
    subject: "Penawaran Pengadaan & Instalasi Sistem CCTV AI & Smart Security",
    date: new Date().toISOString().split("T")[0],
    validityDays: 14,
    items: [
      { id: "1", productName: "", qty: 1, unit: "Unit", price: 0, discount: 0, total: 0 },
    ],
    discount: 0,
    taxRate: 11,
    terms: "1. Harga sudah termasuk pengiriman, instalasi kabel pelindung pipa konduit, dan uji kelayakan sistem.\n2. Garansi resmi unit perangkat selama 2 (dua) tahun dan garansi pemeliharaan teknis selama 6 (enam) bulan.\n3. Skema Pembayaran: Down Payment (DP) 50% saat penerbitan SPK, Pelunasan 50% setelah penandatanganan Berita Acara Serah Terima (BAST).\n4. Penawaran harga ini berlaku selama 14 (empat belas) hari kalender sejak tanggal diterbitkan.",
    notes: "",
  });

  // New Sale Form State
  const [saleForm, setSaleForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    paymentMethod: "Transfer Bank Mandiri PT DSTech Smart Perkasa",
    invoiceType: "Standar" as "Standar" | "DP",
    dpPercentage: 50,
    dpAmount: 0,
    dpNotes: "Pengajuan Uang Muka (DP 50%) Pelaksanaan Instalasi & Pengadaan",
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
    account: "",
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

  const angkaTerbilang = (nilai: number): string => {
    const bilangan = [
      "",
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
      "Enam",
      "Tujuh",
      "Delapan",
      "Sembilan",
      "Sepuluh",
      "Sebelas",
    ];
    nilai = Math.floor(Math.abs(nilai));
    if (nilai < 12) return bilangan[nilai];
    if (nilai < 20) return angkaTerbilang(nilai - 10) + " Belas";
    if (nilai < 100) return angkaTerbilang(Math.floor(nilai / 10)) + " Puluh " + angkaTerbilang(nilai % 10);
    if (nilai < 200) return "Seratus " + angkaTerbilang(nilai - 100);
    if (nilai < 1000) return angkaTerbilang(Math.floor(nilai / 100)) + " Ratus " + angkaTerbilang(nilai % 100);
    if (nilai < 2000) return "Seribu " + angkaTerbilang(nilai - 1000);
    if (nilai < 1000000) return angkaTerbilang(Math.floor(nilai / 1000)) + " Ribu " + angkaTerbilang(nilai % 1000);
    if (nilai < 1000000000) return angkaTerbilang(Math.floor(nilai / 1000000)) + " Juta " + angkaTerbilang(nilai % 1000000);
    if (nilai < 1000000000000) return angkaTerbilang(Math.floor(nilai / 1000000000)) + " Milyar " + angkaTerbilang(nilai % 1000000000);
    return "";
  };

  const fetchFinanceData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/finance");
      if (res.ok) {
        const d = await res.json();
        if (d.data) {
          setSales(d.data.sales || []);
          setQuotations(d.data.quotations || []);
          setPurchases(d.data.purchases || []);
          setReturnsSales(d.data.returns_sales || []);
          setReturnsPurchase(d.data.returns_purchase || []);
          setCashFlow(d.data.cash_flow || []);
          setWarehouses(d.data.warehouses || []);
          setBranches(d.data.branches || []);
          setExpenses(d.data.expenses || []);
          setClients(d.data.clients || []);
          setSuppliers(d.data.suppliers || []);
          if (d.data.bank_accounts && d.data.bank_accounts.length > 0) {
            setBankAccounts(d.data.bank_accounts);
            const def = d.data.bank_accounts.find((b: any) => b.isDefault && b.status === "Aktif") || d.data.bank_accounts.find((b: any) => b.status === "Aktif") || d.data.bank_accounts[0];
            if (def) {
              const accLabel = `${def.bankName} - ${def.accountNumber} (${def.accountHolder})`;
              const transferLabel = `Transfer ${def.bankName} (${def.accountNumber} - ${def.accountHolder})`;
              setCashForm((prev) => (!prev.account ? { ...prev, account: accLabel } : prev));
              setSaleForm((prev) => (!prev.paymentMethod || prev.paymentMethod.includes("Bank Mandiri PT DSTech") ? { ...prev, paymentMethod: transferLabel } : prev));
              setPaymentForm((prev) => (!prev.paymentMethod ? { ...prev, paymentMethod: accLabel } : prev));
            }
          }
          if (d.data.settings) {
            setFinanceSettings(d.data.settings);
            setTempSettings(d.data.settings);
          }
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

  // Handler Quotation Form Dynamic Items
  const handleAddQuotationItem = () => {
    setQuotationForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: String(Date.now()), productName: "", qty: 1, unit: "Unit", price: 0, discount: 0, total: 0 },
      ],
    }));
  };

  const handleRemoveQuotationItem = (idx: number) => {
    if (quotationForm.items.length <= 1) return;
    setQuotationForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleQuotationItemChange = (idx: number, field: string, val: any) => {
    setQuotationForm((prev) => {
      const updated = [...prev.items];
      const item = { ...updated[idx], [field]: val };
      if (field === "qty" || field === "price" || field === "discount") {
        const itemGross = Number(item.qty || 0) * Number(item.price || 0);
        item.total = Math.max(0, itemGross - Number(item.discount || 0));
      }
      updated[idx] = item;
      return { ...prev, items: updated };
    });
  };

  const calculateQuotationTotals = () => {
    const subtotal = quotationForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const afterDiscount = Math.max(0, subtotal - Number(quotationForm.discount || 0));
    const taxAmount = (afterDiscount * Number(quotationForm.taxRate || 0)) / 100;
    const grandTotal = afterDiscount + taxAmount;
    return { subtotal, afterDiscount, taxAmount, grandTotal };
  };

  const handleClientSelectForQuotation = (clientId: string) => {
    const cl = clients.find((c) => c.id === clientId);
    if (cl) {
      setQuotationForm((prev) => ({
        ...prev,
        clientId: cl.id,
        customerName: cl.name,
        customerOrg: cl.name,
        customerPhone: cl.phone,
        customerAddress: cl.address ? `${cl.address}, ${cl.city}` : cl.city,
      }));
    }
  };

  const handleCreateQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, taxAmount, grandTotal } = calculateQuotationTotals();

    if (!quotationForm.customerName.trim()) {
      showToast("Nama Klien / Perusahaan wajib diisi!");
      return;
    }

    if (quotationForm.items.some((it) => !it.productName || it.price <= 0)) {
      showToast("Mohon isi deskripsi produk/jasa dan harga valid untuk semua baris!");
      return;
    }

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "quotation",
          payload: {
            clientId: quotationForm.clientId,
            customerName: quotationForm.customerName,
            customerOrg: quotationForm.customerOrg || quotationForm.customerName,
            customerPhone: quotationForm.customerPhone,
            customerAddress: quotationForm.customerAddress,
            subject: quotationForm.subject,
            date: quotationForm.date,
            validityDays: Number(quotationForm.validityDays) || 14,
            items: quotationForm.items,
            subtotal,
            discount: Number(quotationForm.discount) || 0,
            taxRate: Number(quotationForm.taxRate) || 0,
            taxAmount,
            grandTotal,
            terms: quotationForm.terms,
            notes: quotationForm.notes,
            status: "Terkirim",
          },
        }),
      });

      const result = await res.json();
      if (result.success) {
        showToast("Surat Penawaran Harga (SPH) berhasil dibuat!");
        setIsNewQuotationModalOpen(false);
        setQuotationForm({
          clientId: "",
          customerName: "",
          customerOrg: "",
          customerPhone: "",
          customerAddress: "",
          subject: "Penawaran Pengadaan & Instalasi CCTV AI & Smart Security",
          date: new Date().toISOString().split("T")[0],
          validityDays: 14,
          items: [
            { id: "1", productName: "", qty: 1, unit: "Unit", price: 0, discount: 0, total: 0 },
          ],
          discount: 0,
          taxRate: 11,
          terms: "1. Harga sudah termasuk pengiriman, instalasi kabel pelindung pipa konduit, dan uji kelayakan sistem.\n2. Garansi resmi unit perangkat selama 2 (dua) tahun dan garansi pemeliharaan teknis selama 6 (enam) bulan.\n3. Skema Pembayaran: Down Payment (DP) 50% saat penerbitan SPK, Pelunasan 50% setelah penandatanganan Berita Acara Serah Terima (BAST).\n4. Penawaran harga ini berlaku selama 14 (empat belas) hari kalender sejak tanggal diterbitkan.",
          notes: "",
        });
        fetchFinanceData();
      } else {
        showToast(result.error || "Gagal membuat surat penawaran");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat membuat surat penawaran");
    }
  };

  const handleOpenEditQuotation = (q: Quotation) => {
    setEditingQuotation(q);
    setQuotationForm({
      clientId: q.clientId || "",
      customerName: q.customerName,
      customerOrg: q.customerOrg || q.customerName,
      customerPhone: q.customerPhone,
      customerAddress: q.customerAddress,
      subject: q.subject,
      date: q.date,
      validityDays: q.validityDays || 14,
      items: q.items && q.items.length > 0 ? q.items : [{ id: "1", productName: "", qty: 1, unit: "Unit", price: 0, discount: 0, total: 0 }],
      discount: q.discount || 0,
      taxRate: q.taxRate || 0,
      terms: q.terms,
      notes: q.notes || "",
    });
    setIsEditQuotationModalOpen(true);
  };

  const handleSaveEditQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuotation) return;
    const { subtotal, taxAmount, grandTotal } = calculateQuotationTotals();

    try {
      const res = await fetch("/api/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "quotation",
          id: editingQuotation.id,
          updates: {
            clientId: quotationForm.clientId,
            customerName: quotationForm.customerName,
            customerOrg: quotationForm.customerOrg || quotationForm.customerName,
            customerPhone: quotationForm.customerPhone,
            customerAddress: quotationForm.customerAddress,
            subject: quotationForm.subject,
            date: quotationForm.date,
            validityDays: Number(quotationForm.validityDays) || 14,
            items: quotationForm.items,
            subtotal,
            discount: Number(quotationForm.discount) || 0,
            taxRate: Number(quotationForm.taxRate) || 0,
            taxAmount,
            grandTotal,
            terms: quotationForm.terms,
            notes: quotationForm.notes,
          },
        }),
      });

      const result = await res.json();
      if (result.success) {
        showToast(`Surat Penawaran ${editingQuotation.quotationNumber} berhasil diperbarui!`);
        setIsEditQuotationModalOpen(false);
        setEditingQuotation(null);
        fetchFinanceData();
      } else {
        showToast(result.error || "Gagal memperbarui surat penawaran");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  const handleDeleteQuotation = async (id: string, quotationNumber: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Surat Penawaran "${quotationNumber}"?`)) return;
    try {
      const res = await fetch(`/api/finance?actionType=quotation&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Surat Penawaran ${quotationNumber} berhasil dihapus!`);
        fetchFinanceData();
      } else {
        showToast(result.error || "Gagal menghapus penawaran");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat menghapus penawaran");
    }
  };

  const handleOpenConvertQuotation = (q: Quotation) => {
    setSelectedQuotationForConvert(q);
    setConvertForm({
      invoiceType: "DP",
      dpPercentage: 50,
      dpNotes: `Pengajuan Uang Muka (DP 50%) atas SPH ${q.quotationNumber} - ${q.subject}`,
    });
    setIsConvertModalOpen(true);
  };

  const handleExecuteConvertQuotation = async () => {
    if (!selectedQuotationForConvert) return;
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "convert_quotation_to_sale",
          payload: {
            quotationId: selectedQuotationForConvert.id,
            invoiceType: convertForm.invoiceType,
            dpPercentage: convertForm.invoiceType === "DP" ? convertForm.dpPercentage : 0,
            dpNotes: convertForm.dpNotes,
          },
        }),
      });

      const result = await res.json();
      if (result.success) {
        showToast(result.message || "Surat Penawaran berhasil dikonversi ke Faktur Penjualan!");
        setIsConvertModalOpen(false);
        setSelectedQuotationForConvert(null);
        setActiveTab("sales");
        fetchFinanceData();
      } else {
        showToast(result.error || "Gagal mengonversi surat penawaran");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat konversi");
    }
  };

  const calculateSaleTotals = () => {
    const subtotal = saleForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const afterDiscount = Math.max(0, subtotal - Number(saleForm.discount || 0));
    const taxAmount = (afterDiscount * Number(saleForm.taxRate || 0)) / 100;
    const grandTotal = afterDiscount + taxAmount;
    const dpAmount =
      saleForm.invoiceType === "DP"
        ? saleForm.dpAmount > 0
          ? saleForm.dpAmount
          : Math.round(grandTotal * (Number(saleForm.dpPercentage || 50) / 100))
        : 0;
    return { subtotal, afterDiscount, taxAmount, grandTotal, dpAmount };
  };

  const handleCreateSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, taxAmount, grandTotal, dpAmount } = calculateSaleTotals();

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
            invoiceType: saleForm.invoiceType,
            dpPercentage: saleForm.invoiceType === "DP" ? Number(saleForm.dpPercentage) : 0,
            dpAmount: saleForm.invoiceType === "DP" ? dpAmount : 0,
            dpNotes: saleForm.invoiceType === "DP" ? saleForm.dpNotes : "-",
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
          paymentMethod: getDefaultTransferLabel(),
          invoiceType: "Standar",
          dpPercentage: 50,
          dpAmount: 0,
          dpNotes: "Pengajuan Uang Muka (DP 50%) Pelaksanaan Instalasi & Pengadaan",
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

  // Handler Terima Pembayaran
  const handleOpenPayInvoice = (invoice: SaleInvoice) => {
    setSelectedInvoiceForPayment(invoice);
    let defaultAmount = invoice.remainingAmount;
    if (invoice.invoiceType === "DP" && (Number(invoice.dpPaidAmount) || 0) < (Number(invoice.dpAmount) || 0)) {
      defaultAmount = Math.max(0, (Number(invoice.dpAmount) || 0) - (Number(invoice.dpPaidAmount) || 0));
    }
    const defaultAcc = getDefaultBankAccLabel();

    setPaymentForm({
      amount: defaultAmount,
      paymentMethod: defaultAcc,
      paymentDate: new Date().toISOString().split("T")[0],
      notes: invoice.invoiceType === "DP" ? "Penerimaan Pembayaran Uang Muka (DP)" : "Penerimaan Pelunasan Faktur",
    });
    setIsPayInvoiceModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;
    if (paymentForm.amount <= 0) {
      showToast("Nominal pembayaran harus lebih besar dari Rp 0!");
      return;
    }
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "record_payment",
          payload: {
            invoiceId: selectedInvoiceForPayment.id,
            paymentAmount: Number(paymentForm.amount),
            paymentMethod: paymentForm.paymentMethod,
            paymentDate: paymentForm.paymentDate,
            notes: paymentForm.notes,
          },
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message || "Pembayaran berhasil dibukukan ke kas masuk!");
        setIsPayInvoiceModalOpen(false);
        setSelectedInvoiceForPayment(null);
        fetchFinanceData();
      } else {
        showToast(result.error || "Gagal membukukan pembayaran");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat menyimpan pembayaran");
    }
  };

  // Handler Edit Faktur
  const handleOpenEditSale = (sale: SaleInvoice) => {
    setEditingSale({
      ...sale,
      items: sale.items.map((it) => ({ ...it })),
    });
    setIsEditSaleModalOpen(true);
  };

  const handleEditSaleItemChange = (idx: number, field: string, val: any) => {
    if (!editingSale) return;
    const updated = [...editingSale.items];
    const item = { ...updated[idx], [field]: val };
    if (field === "qty" || field === "price") {
      item.total = Number(item.qty || 0) * Number(item.price || 0);
    }
    updated[idx] = item;

    const subtotal = updated.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const afterDiscount = Math.max(0, subtotal - Number(editingSale.discount || 0));
    const taxAmount = (afterDiscount * Number(editingSale.taxRate || 0)) / 100;
    const grandTotal = afterDiscount + taxAmount;
    const dpPercentage = editingSale.dpPercentage || 50;
    const dpAmount =
      editingSale.invoiceType === "DP" ? Math.round(grandTotal * (dpPercentage / 100)) : 0;
    const remainingAmount = Math.max(0, grandTotal - (Number(editingSale.paidAmount) || 0));

    setEditingSale({
      ...editingSale,
      items: updated,
      subtotal,
      taxAmount,
      grandTotal,
      dpAmount,
      remainingAmount,
    });
  };

  const handleAddEditSaleItem = () => {
    if (!editingSale) return;
    setEditingSale({
      ...editingSale,
      items: [
        ...editingSale.items,
        { id: String(Date.now()), productName: "", qty: 1, unit: "Unit", price: 0, total: 0 },
      ],
    });
  };

  const handleRemoveEditSaleItem = (idx: number) => {
    if (!editingSale || editingSale.items.length <= 1) return;
    const updated = editingSale.items.filter((_, i) => i !== idx);
    const subtotal = updated.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const afterDiscount = Math.max(0, subtotal - Number(editingSale.discount || 0));
    const taxAmount = (afterDiscount * Number(editingSale.taxRate || 0)) / 100;
    const grandTotal = afterDiscount + taxAmount;
    const dpAmount =
      editingSale.invoiceType === "DP"
        ? Math.round(grandTotal * ((editingSale.dpPercentage || 50) / 100))
        : 0;
    const remainingAmount = Math.max(0, grandTotal - (Number(editingSale.paidAmount) || 0));

    setEditingSale({
      ...editingSale,
      items: updated,
      subtotal,
      taxAmount,
      grandTotal,
      dpAmount,
      remainingAmount,
    });
  };

  const handleEditSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;

    if (editingSale.items.some((it) => !it.productName || it.price <= 0)) {
      showToast("Mohon isi nama produk dan harga valid untuk semua baris item!");
      return;
    }

    try {
      const res = await fetch("/api/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "sale",
          id: editingSale.id,
          updates: {
            customerName: editingSale.customerName,
            customerPhone: editingSale.customerPhone,
            customerAddress: editingSale.customerAddress,
            date: editingSale.date,
            dueDate: editingSale.dueDate,
            invoiceType: editingSale.invoiceType,
            dpPercentage: editingSale.dpPercentage,
            dpAmount: editingSale.dpAmount,
            dpNotes: editingSale.dpNotes,
            items: editingSale.items,
            subtotal: editingSale.subtotal,
            discount: Number(editingSale.discount || 0),
            taxRate: Number(editingSale.taxRate || 0),
            taxAmount: editingSale.taxAmount,
            grandTotal: editingSale.grandTotal,
            paidAmount: Number(editingSale.paidAmount || 0),
            paymentMethod: editingSale.paymentMethod,
            notes: editingSale.notes,
          },
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Faktur ${editingSale.invoiceNumber} berhasil diperbarui!`);
        setIsEditSaleModalOpen(false);
        setEditingSale(null);
        fetchFinanceData();
      } else {
        showToast(result.error || "Gagal memperbarui faktur penjualan");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat menyimpan perubahan faktur");
    }
  };

  // Handler Hapus Faktur
  const handleDeleteSale = async (id: string, invoiceNumber: string) => {
    if (!window.confirm(`Yakin ingin menghapus Faktur ${invoiceNumber}? Data yang dihapus tidak dapat dipulihkan.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/finance?actionType=sale&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Faktur ${invoiceNumber} berhasil dihapus!`);
        fetchFinanceData();
      } else {
        showToast(result.error || "Gagal menghapus faktur penjualan");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat menghapus faktur");
    }
  };

  // Handler Rekening Bank
  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBankAccount) {
        const res = await fetch("/api/finance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionType: "bank_account",
            id: editingBankAccount.id,
            updates: bankAccountForm,
          }),
        });
        const d = await res.json();
        if (d.success) {
          showToast(`Rekening ${bankAccountForm.bankName} berhasil diperbarui!`);
          setEditingBankAccount(null);
          setBankAccountForm({
            bankName: "Bank Mandiri",
            accountNumber: "",
            accountHolder: "PT. DSTech Smart Perkasa",
            branch: "Cilegon",
            isDefault: false,
            status: "Aktif",
          });
          fetchFinanceData();
        }
      } else {
        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionType: "bank_account",
            payload: bankAccountForm,
          }),
        });
        const d = await res.json();
        if (d.success) {
          showToast(`Rekening ${bankAccountForm.bankName} berhasil ditambahkan!`);
          setBankAccountForm({
            bankName: "Bank Mandiri",
            accountNumber: "",
            accountHolder: "PT. DSTech Smart Perkasa",
            branch: "Cilegon",
            isDefault: false,
            status: "Aktif",
          });
          fetchFinanceData();
        }
      }
    } catch {
      showToast("Gagal menyimpan rekening bank");
    }
  };

  const handleDeleteBankAccount = async (id: string, bankName: string) => {
    if (!window.confirm(`Hapus rekening ${bankName}?`)) return;
    try {
      const res = await fetch(`/api/finance?actionType=bank_account&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const d = await res.json();
      if (d.success) {
        showToast("Rekening bank berhasil dihapus");
        fetchFinanceData();
      }
    } catch {
      showToast("Gagal menghapus rekening");
    }
  };

  // Handler Pengaturan Kop Surat
  const handleOpenSettingsModal = () => {
    setTempSettings({ ...financeSettings });
    setIsSettingsModalOpen(true);
  };

  const handleLetterheadFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast("Ukuran file gambar maksimal 8MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      if (base64Url) {
        setTempSettings((prev) => ({
          ...prev,
          letterheadUrl: base64Url,
          letterheadEnabled: true,
        }));
        showToast("Gambar kop surat baru berhasil dimuat! Klik Simpan Pengaturan.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "settings",
          updates: tempSettings,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setFinanceSettings({ ...tempSettings });
        showToast("Pengaturan kop surat & background dokumen berhasil disimpan!");
        setIsSettingsModalOpen(false);
        fetchFinanceData();
      } else {
        showToast(d.error || "Gagal menyimpan pengaturan kop surat");
      }
    } catch {
      showToast("Gagal menyimpan pengaturan kop surat");
    }
  };

  // Canvas Drawing & Digital Signature Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e3a8a"; // Navy Corporate Blue
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleOpenApprovalModal = (invoice: SaleInvoice) => {
    setSelectedInvoiceForApproval(invoice);
    setSignerNameInput(invoice.approvedBy || financeSettings.signerName || "H. Agus Supriyadi, S.T., M.Kom.");
    setSignerTitleInput(invoice.approvedTitle || financeSettings.signerTitle || "Direktur Keuangan & Operasional");
    setApprovalNotesInput(invoice.approvalNotes || "Disetujui untuk diterbitkan secara sah kepada klien.");
    setUploadedSignatureBase64(invoice.signatureImage || "");
    setApprovalMode("canvas");
    setIsApprovalModalOpen(true);
    setHasDrawn(false);
    setTimeout(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }, 150);
  };

  const handleApproveInvoice = async () => {
    if (!selectedInvoiceForApproval) return;
    setIsSubmittingApproval(true);
    try {
      let signatureImage = "";
      if (approvalMode === "canvas" && canvasRef.current && hasDrawn) {
        signatureImage = canvasRef.current.toDataURL("image/png");
      } else if (approvalMode === "upload") {
        signatureImage = uploadedSignatureBase64;
      } else if (approvalMode === "master") {
        signatureImage = financeSettings.masterSignatureUrl || "";
      }

      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "approve_document",
          payload: {
            id: selectedInvoiceForApproval.id,
            documentType: "sale",
            signatureImage,
            signerName: signerNameInput,
            signerTitle: signerTitleInput,
            notes: approvalNotesInput,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSales((prev) =>
          prev.map((s) => (s.id === selectedInvoiceForApproval.id ? json.data : s))
        );
        if (selectedInvoiceForPrint && selectedInvoiceForPrint.id === selectedInvoiceForApproval.id) {
          setSelectedInvoiceForPrint(json.data);
        }
        setIsApprovalModalOpen(false);
        showToast(json.message || "Faktur berhasil disetujui & disahkan!");
      } else {
        showToast(json.error || "Gagal menyetujui faktur.");
      }
    } catch (err) {
      console.error("Error approving invoice:", err);
      showToast("Terjadi kesalahan saat menyetujui faktur.");
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedSignatureBase64(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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
          account: getDefaultBankAccLabel(),
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

  const handleOpenNewCashModal = (type: "IN" | "OUT" = "IN") => {
    setCashForm({
      date: new Date().toISOString().split("T")[0],
      type,
      category: type === "IN" ? "Penerimaan Penjualan" : "Biaya Operasional Lainnya",
      amount: 0,
      account: getDefaultBankAccLabel(),
      reference: "",
      description: "",
      recordAsExpense: false,
      recipient: "",
    });
    setIsNewCashModalOpen(true);
  };

  // Handler PO Dynamic Items
  const handleAddPoItem = () => {
    setPoForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: String(Date.now()), productName: "", qty: 1, unit: "Unit", price: 0, total: 0 },
      ],
    }));
  };

  const handleRemovePoItem = (idx: number) => {
    if (poForm.items.length <= 1) return;
    setPoForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handlePoItemChange = (idx: number, field: string, val: any) => {
    setPoForm((prev) => {
      const updated = [...prev.items];
      const item = { ...updated[idx], [field]: val };
      if (field === "qty" || field === "price") {
        item.total = Number(item.qty || 0) * Number(item.price || 0);
      }
      updated[idx] = item;
      return { ...prev, items: updated };
    });
  };

  const calculatePoTotals = () => {
    const subtotal = poForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const taxAmount = (subtotal * 11) / 100; // PPN 11%
    const grandTotal = subtotal + taxAmount;
    return { subtotal, taxAmount, grandTotal };
  };

  const handleCreatePoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, taxAmount, grandTotal } = calculatePoTotals();

    if (poForm.items.some((it) => !it.productName || it.price <= 0)) {
      showToast("Mohon isi nama barang dan harga satuan valid untuk semua baris item PO!");
      return;
    }

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "purchase",
          payload: {
            supplierName: poForm.supplierName,
            supplierContact: poForm.supplierContact,
            date: poForm.date,
            expectedDelivery: poForm.expectedDelivery,
            paymentStatus: poForm.paymentStatus,
            items: poForm.items,
            subtotal,
            taxAmount,
            grandTotal,
            status: "Dalam Pengiriman",
            warehouseId: "dstech_wh_1",
            notes: poForm.notes,
          },
        }),
      });

      if (res.ok) {
        showToast("Purchase Order (PO) baru berhasil diterbitkan!");
        setIsNewPoModalOpen(false);
        setPoForm({
          supplierName: "",
          supplierContact: "",
          date: new Date().toISOString().split("T")[0],
          expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
          paymentStatus: "Hutang Usaha",
          items: [{ id: "1", productName: "", qty: 1, unit: "Unit", price: 0, total: 0 }],
          notes: "",
        });
        fetchFinanceData();
      } else {
        showToast("Gagal menerbitkan Purchase Order");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  // Client Master Handlers
  const handleOpenAddClient = () => {
    setEditingClient(null);
    setClientForm({
      name: "",
      category: "B2B Industri",
      pic: "",
      phone: "",
      email: "",
      address: "",
      city: "Cilegon",
      npwp: "",
      status: "Aktif",
      notes: "",
    });
    setIsClientModalOpen(true);
  };

  const handleOpenEditClient = (c: ClientItem) => {
    setEditingClient(c);
    setClientForm({
      name: c.name,
      category: c.category,
      pic: c.pic,
      phone: c.phone,
      email: c.email,
      address: c.address,
      city: c.city,
      npwp: c.npwp,
      status: c.status,
      notes: c.notes,
    });
    setIsClientModalOpen(true);
  };

  const handleSaveClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) {
      showToast("Nama Klien wajib diisi!");
      return;
    }

    try {
      if (editingClient) {
        const res = await fetch("/api/finance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionType: "client",
            id: editingClient.id,
            updates: clientForm,
          }),
        });
        if (res.ok) {
          showToast(`Data klien ${clientForm.name} berhasil diperbarui!`);
          setIsClientModalOpen(false);
          fetchFinanceData();
        } else {
          showToast("Gagal memperbarui data klien");
        }
      } else {
        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionType: "client",
            payload: clientForm,
          }),
        });
        if (res.ok) {
          showToast(`Klien baru ${clientForm.name} berhasil ditambahkan!`);
          setIsClientModalOpen(false);
          fetchFinanceData();
        } else {
          showToast("Gagal menambahkan klien");
        }
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  const handleDeleteClient = async (client: ClientItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus klien "${client.name}" dari direktori?`)) return;
    try {
      const res = await fetch(`/api/finance?actionType=client&id=${client.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Klien ${client.name} berhasil dihapus`);
        fetchFinanceData();
      } else {
        showToast("Gagal menghapus klien");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  // Supplier Master Handlers
  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({
      name: "",
      category: "CCTV, NVR & Security Hardware",
      pic: "",
      phone: "",
      email: "",
      address: "",
      city: "Cilegon",
      bankAccount: "",
      paymentTerms: "Net 30 Hari",
      status: "Mitra Aktif",
      notes: "",
    });
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (s: SupplierItem) => {
    setEditingSupplier(s);
    setSupplierForm({
      name: s.name,
      category: s.category,
      pic: s.pic,
      phone: s.phone,
      email: s.email,
      address: s.address,
      city: s.city,
      bankAccount: s.bankAccount,
      paymentTerms: s.paymentTerms,
      status: s.status,
      notes: s.notes,
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) {
      showToast("Nama Supplier wajib diisi!");
      return;
    }

    try {
      if (editingSupplier) {
        const res = await fetch("/api/finance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionType: "supplier",
            id: editingSupplier.id,
            updates: supplierForm,
          }),
        });
        if (res.ok) {
          showToast(`Data supplier ${supplierForm.name} berhasil diperbarui!`);
          setIsSupplierModalOpen(false);
          fetchFinanceData();
        } else {
          showToast("Gagal memperbarui data supplier");
        }
      } else {
        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionType: "supplier",
            payload: supplierForm,
          }),
        });
        if (res.ok) {
          showToast(`Supplier baru ${supplierForm.name} berhasil ditambahkan!`);
          setIsSupplierModalOpen(false);
          fetchFinanceData();
        } else {
          showToast("Gagal menambahkan supplier");
        }
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  const handleDeleteSupplier = async (supplier: SupplierItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus supplier "${supplier.name}" dari direktori?`)) return;
    try {
      const res = await fetch(`/api/finance?actionType=supplier&id=${supplier.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Supplier ${supplier.name} berhasil dihapus`);
        fetchFinanceData();
      } else {
        showToast("Gagal menghapus supplier");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  // Warehouse Master Handlers
  const handleOpenAddWarehouse = () => {
    setEditingWarehouse(null);
    setWarehouseForm({
      code: `GD-${warehouses.length + 1}`,
      name: "",
      type: "Gudang Pusat",
      address: "",
      city: "Cilegon",
      pic: "",
      phone: "",
      totalItemTypes: 0,
      totalValuation: 0,
      status: "Aktif",
      notes: "",
    });
    setIsWarehouseModalOpen(true);
  };

  const handleOpenEditWarehouse = (wh: WarehouseItem) => {
    setEditingWarehouse(wh);
    setWarehouseForm({
      code: wh.code || "",
      name: wh.name || "",
      type: wh.type || "Gudang Pusat",
      address: wh.address || "",
      city: wh.city || "Cilegon",
      pic: wh.pic || "",
      phone: wh.phone || "",
      totalItemTypes: wh.totalItemTypes || 0,
      totalValuation: wh.totalValuation || 0,
      status: wh.status || "Aktif",
      notes: wh.notes || "",
    });
    setIsWarehouseModalOpen(true);
  };

  const handleSaveWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseForm.name.trim()) {
      showToast("Nama Gudang wajib diisi!");
      return;
    }

    try {
      if (editingWarehouse) {
        const res = await fetch("/api/finance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionType: "warehouse",
            id: editingWarehouse.id,
            updates: warehouseForm,
          }),
        });
        if (res.ok) {
          showToast(`Data gudang ${warehouseForm.name} berhasil diperbarui!`);
          setIsWarehouseModalOpen(false);
          fetchFinanceData();
        } else {
          showToast("Gagal memperbarui data gudang");
        }
      } else {
        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionType: "warehouse",
            payload: warehouseForm,
          }),
        });
        if (res.ok) {
          showToast(`Gudang baru ${warehouseForm.name} berhasil ditambahkan!`);
          setIsWarehouseModalOpen(false);
          fetchFinanceData();
        } else {
          showToast("Gagal menambahkan titik gudang");
        }
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  const handleDeleteWarehouse = async (wh: WarehouseItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus gudang "${wh.name}"? Stok terkait mungkin terpengaruh.`)) return;
    try {
      const res = await fetch(`/api/finance?actionType=warehouse&id=${wh.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Gudang ${wh.name} berhasil dihapus`);
        fetchFinanceData();
      } else {
        showToast("Gagal menghapus gudang");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  // Branch Master Handlers
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      code: `BR-${String(branches.length + 1).padStart(2, "0")}`,
      name: "",
      city: "Cilegon",
      address: "",
      head: "",
      phone: "",
      email: "",
      coverage: "",
      status: "Kantor Cabang",
      notes: "",
    });
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (br: BranchItem) => {
    setEditingBranch(br);
    setBranchForm({
      code: br.code || "",
      name: br.name || "",
      city: br.city || "Cilegon",
      address: br.address || "",
      head: br.head || "",
      phone: br.phone || "",
      email: br.email || "",
      coverage: br.coverage || "",
      status: br.status || "Kantor Cabang",
      notes: br.notes || "",
    });
    setIsBranchModalOpen(true);
  };

  const handleSaveBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim()) {
      showToast("Nama Kantor / Cabang wajib diisi!");
      return;
    }

    try {
      if (editingBranch) {
        const res = await fetch("/api/finance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionType: "branch",
            id: editingBranch.id,
            updates: branchForm,
          }),
        });
        if (res.ok) {
          showToast(`Data cabang ${branchForm.name} berhasil diperbarui!`);
          setIsBranchModalOpen(false);
          fetchFinanceData();
        } else {
          showToast("Gagal memperbarui data kantor cabang");
        }
      } else {
        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionType: "branch",
            payload: branchForm,
          }),
        });
        if (res.ok) {
          showToast(`Kantor cabang ${branchForm.name} berhasil ditambahkan!`);
          setIsBranchModalOpen(false);
          fetchFinanceData();
        } else {
          showToast("Gagal menambahkan kantor cabang");
        }
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  const handleDeleteBranch = async (br: BranchItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kantor cabang "${br.name}"?`)) return;
    try {
      const res = await fetch(`/api/finance?actionType=branch&id=${br.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Kantor cabang ${br.name} berhasil dihapus`);
        fetchFinanceData();
      } else {
        showToast("Gagal menghapus kantor cabang");
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
            onClick={() => setActiveTab("quotations")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "quotations"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Surat Penawaran (SPH)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-[10px]">
              {quotations.length}
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

          <button
            onClick={() => setActiveTab("clients")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "clients"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-blue-50 text-dstech-blue hover:bg-blue-100"
            }`}
          >
            <Users className="w-4 h-4 text-dstech-blue" />
            <span>Daftar Klien</span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-[10px] font-black">
              {clients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("suppliers")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "suppliers"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            <Truck className="w-4 h-4 text-amber-600" />
            <span>Daftar Supplier</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-black">
              {suppliers.length}
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

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none"
                >
                  <option value="Semua">Semua Status Bayar</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Menunggu DP">Menunggu DP</option>
                  <option value="DP Lunas (Sisa Pelunasan)">DP Lunas (Sisa Pelunasan)</option>
                  <option value="Belum Lunas">Belum Lunas</option>
                </select>

                {/* Tombol Pengaturan Rekening Bank DSTech */}
                <button
                  onClick={() => setIsBankAccountsModalOpen(true)}
                  title="Kelola Rekening Bank Perusahaan DSTech"
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Rekening Bank DSTech</span>
                </button>

                {/* Tombol Pengaturan Kop Surat */}
                <button
                  onClick={handleOpenSettingsModal}
                  title="Atur Background Kop Surat Resmi Faktur"
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileText className="w-4 h-4 text-dstech-blue" />
                  <span className="hidden sm:inline">Kop Surat & Watermark</span>
                </button>

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
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-dstech-blue">{sale.invoiceNumber}</span>
                            {sale.invoiceType === "DP" && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 uppercase tracking-wider">
                                DP {sale.dpPercentage || 50}%
                              </span>
                            )}
                          </div>
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
                          {sale.invoiceType === "DP" && (
                            <p className="text-[10px] text-amber-700 font-bold">
                              Tagihan DP: {formatRupiah(sale.dpAmount || 0)}
                            </p>
                          )}
                          {sale.remainingAmount > 0 ? (
                            <p className="text-[10px] text-red-600 font-bold">
                              Sisa Piutang: {formatRupiah(sale.remainingAmount)}
                            </p>
                          ) : (
                            <p className="text-[10px] text-emerald-600 font-bold">Lunas Terbayar</p>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                sale.paymentStatus === "Lunas"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : sale.paymentStatus?.includes("DP Lunas")
                                  ? "bg-blue-100 text-dstech-blue"
                                  : sale.paymentStatus?.includes("DP")
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {sale.paymentStatus}
                            </span>
                            {sale.approvalStatus === "Disetujui & Sah" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                Sah Digital
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-500" />
                                Menunggu Approval
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Approval & Tanda Tangan Digital */}
                            <button
                              onClick={() => handleOpenApprovalModal(sale)}
                              title={
                                sale.approvalStatus === "Disetujui & Sah"
                                  ? `Disetujui & Sah oleh ${sale.approvedBy || "Direktur"} (Klik untuk atur ulang / tanda tangani)`
                                  : "Approval & Tanda Tangan Digital Direktur"
                              }
                              className={`p-2 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 ${
                                sale.approvalStatus === "Disetujui & Sah"
                                  ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                                  : "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white ring-1 ring-amber-300"
                              }`}
                            >
                              <PenTool className="w-4 h-4" />
                            </button>

                            {/* Terima Pembayaran / Bayar DP */}
                            {sale.remainingAmount > 0 ? (
                              <button
                                onClick={() => handleOpenPayInvoice(sale)}
                                title="Terima Pembayaran / Bayar DP"
                                className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                disabled
                                title="Faktur Sudah Lunas"
                                className="p-2 rounded-xl bg-slate-100 text-slate-300 cursor-not-allowed"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Cetak Faktur Resmi Kop DSTech */}
                            <button
                              onClick={() => setSelectedInvoiceForPrint(sale)}
                              title="Cetak Faktur Resmi Kop DSTech"
                              className="p-2 rounded-xl bg-blue-50 text-dstech-blue hover:bg-dstech-blue hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Edit Faktur */}
                            <button
                              onClick={() => handleOpenEditSale(sale)}
                              title="Edit Faktur Penjualan"
                              className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Hapus Faktur */}
                            <button
                              onClick={() => handleDeleteSale(sale.id, sale.invoiceNumber)}
                              title="Hapus Faktur"
                              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 1.5: SURAT PENAWARAN HARGA (QUOTATION / SPH) */}
        {activeTab === "quotations" && (
          <div className="space-y-6">
            {/* Top Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nomor SPH (SPH-DSTECH-...), nama instansi klien, atau perihal pengadaan..."
                  value={quotationSearchQuery}
                  onChange={(e) => setQuotationSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={quotationStatusFilter}
                  onChange={(e) => setQuotationStatusFilter(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none"
                >
                  <option value="Semua">Semua Status SPH</option>
                  <option value="Terkirim">Terkirim</option>
                  <option value="Disetujui Klien">Disetujui Klien</option>
                  <option value="Terkonversi Faktur">Terkonversi Faktur</option>
                  <option value="Draf">Draf</option>
                  <option value="Ditolak">Ditolak</option>
                </select>

                <button
                  onClick={() => setIsNewQuotationModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Surat Penawaran (SPH)</span>
                </button>
              </div>
            </div>

            {/* Quotation Mini KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Total SPH Terbit</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">{quotations.length} Surat</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Penawaran Resmi</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Total Nilai Penawaran</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">
                    {formatRupiah(quotations.reduce((acc, curr) => acc + (Number(curr.grandTotal) || 0), 0))}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Akumulasi Proposal</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Disetujui Klien</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">
                    {quotations.filter((q) => q.status === "Disetujui Klien").length} SPH
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Siap Pelaksanaan</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <CheckCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Telah Jadi Faktur</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">
                    {quotations.filter((q) => q.status === "Terkonversi Faktur" || q.convertedInvoiceId).length} SPH
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Terkonversi Proyek</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quotations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">No. SPH & Perihal</th>
                    <th className="p-3">Klien & Instansi</th>
                    <th className="p-3">Tanggal & Tempo SPH</th>
                    <th className="p-3">Rincian Paket & Item</th>
                    <th className="p-3">Total Penawaran</th>
                    <th className="p-3">Status & Approval</th>
                    <th className="p-3 text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations
                    .filter((sph) => {
                      const matchQuery =
                        sph.quotationNumber.toLowerCase().includes(quotationSearchQuery.toLowerCase()) ||
                        sph.customerName.toLowerCase().includes(quotationSearchQuery.toLowerCase()) ||
                        sph.subject.toLowerCase().includes(quotationSearchQuery.toLowerCase());
                      const matchStatus =
                        quotationStatusFilter === "Semua" || sph.status === quotationStatusFilter;
                      return matchQuery && matchStatus;
                    })
                    .map((sph) => (
                      <tr key={sph.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* No SPH & Perihal */}
                        <td className="p-3">
                          <span className="font-mono font-black text-indigo-700 block text-xs">
                            {sph.quotationNumber}
                          </span>
                          <span className="text-[11px] font-bold text-slate-800 line-clamp-1 mt-0.5 max-w-[220px]" title={sph.subject}>
                            {sph.subject}
                          </span>
                          {sph.convertedInvoiceId && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
                              <Receipt className="w-3 h-3 text-emerald-600" />
                              Faktur: {sph.convertedInvoiceId}
                            </span>
                          )}
                        </td>

                        {/* Klien & Instansi */}
                        <td className="p-3">
                          <p className="font-bold text-slate-900 line-clamp-1">{sph.customerName}</p>
                          <p className="text-[10px] text-slate-400">{sph.customerPhone || "-"}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[180px]">{sph.customerAddress || "-"}</p>
                        </td>

                        {/* Tanggal & Tempo */}
                        <td className="p-3 whitespace-nowrap">
                          <p className="text-slate-800 font-medium">Terbit: {sph.date}</p>
                          <p className="text-[10px] font-semibold text-amber-700 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Berlaku s/d: {sph.validUntil} ({sph.validityDays || 14} hari)
                          </p>
                        </td>

                        {/* Rincian Item */}
                        <td className="p-3">
                          <div className="space-y-0.5 max-w-[200px]">
                            {sph.items.slice(0, 2).map((it, idx) => (
                              <p key={idx} className="text-[11px] text-slate-600 truncate">
                                • {it.productName} ({it.qty} {it.unit})
                              </p>
                            ))}
                            {sph.items.length > 2 && (
                              <p className="text-[10px] font-bold text-indigo-600">
                                + {sph.items.length - 2} item perangkat lainnya...
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Total Penawaran */}
                        <td className="p-3 whitespace-nowrap font-bold">
                          <span className="text-sm font-black text-slate-900 block">
                            {formatRupiah(sph.grandTotal)}
                          </span>
                          {sph.discount > 0 && (
                            <span className="text-[10px] text-red-500 font-semibold block">
                              Diskon: -{formatRupiah(sph.discount)}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-semibold">
                            PPN {sph.taxRate || 0}%: {formatRupiah(sph.taxAmount || 0)}
                          </span>
                        </td>

                        {/* Status SPH & Approval */}
                        <td className="p-3 whitespace-nowrap space-y-1">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              sph.status === "Disetujui Klien"
                                ? "bg-emerald-100 text-emerald-800"
                                : sph.status === "Terkonversi Faktur"
                                ? "bg-blue-100 text-blue-800"
                                : sph.status === "Terkirim"
                                ? "bg-amber-100 text-amber-800"
                                : sph.status === "Ditolak"
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {sph.status}
                          </span>

                          <div>
                            {sph.approvalStatus === "Disetujui & Sah" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                Sah Digital
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-500" />
                                Menunggu Approval
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Cetak / Preview SPH */}
                            <button
                              onClick={() => setSelectedQuotationForPrint(sph)}
                              title="Cetak & Pratinjau Surat Penawaran Kop DSTech"
                              className="p-2 rounded-xl bg-blue-50 text-dstech-blue hover:bg-dstech-blue hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Konversi ke Faktur Penjualan (1-Klik) */}
                            {sph.status !== "Terkonversi Faktur" && (
                              <button
                                onClick={() => handleOpenConvertQuotation(sph)}
                                title="Konversi SPH ini Menjadi Faktur Penjualan Resmi"
                                className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            )}

                            {/* Approval Tanda Tangan Direktur */}
                            <button
                              onClick={() => {
                                setSelectedInvoiceForApproval({
                                  ...sph,
                                  invoiceNumber: sph.quotationNumber,
                                  dueDate: sph.validUntil,
                                  paymentMethod: "SPH Proposal",
                                  paymentStatus: sph.status,
                                  paidAmount: 0,
                                  remainingAmount: sph.grandTotal,
                                  warehouseId: "dstech_wh_1",
                                  branchId: "dstech_branch_1",
                                  salesPerson: "DSTech Commercial Team",
                                } as any);
                                setIsApprovalModalOpen(true);
                              }}
                              title={sph.approvalStatus === "Disetujui & Sah" ? "Perbarui Tanda Tangan Digital SPH" : "Approval & Tanda Tangan Digital Direktur SPH"}
                              className={`p-2 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 ${
                                sph.approvalStatus === "Disetujui & Sah"
                                  ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-700 hover:text-white"
                                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                              }`}
                            >
                              <PenTool className="w-4 h-4" />
                            </button>

                            {/* Edit SPH */}
                            <button
                              onClick={() => handleOpenEditQuotation(sph)}
                              title="Edit Surat Penawaran"
                              className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Hapus SPH */}
                            <button
                              onClick={() => handleDeleteQuotation(sph.id, sph.quotationNumber)}
                              title="Hapus Surat Penawaran"
                              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Kas Masuk (IN)</p>
                  <p className="text-sm font-black text-emerald-800">{formatRupiah(summary.totalCashIn)}</p>
                </div>
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                  <p className="text-[10px] font-bold text-red-700 uppercase">Kas Keluar (OUT)</p>
                  <p className="text-sm font-black text-red-800">{formatRupiah(summary.totalCashOut)}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Filter Akun:</span>
                  <select
                    value={cashAccountFilter}
                    onChange={(e) => setCashAccountFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Rekening & Kas ({cashFlow.length})</option>
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.bankName}>
                        {b.bankName} - {b.accountNumber}
                      </option>
                    ))}
                    <option value="TUNAI">Kas Tunai / Petty Cash</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBankAccountsModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-dstech-blue font-bold text-xs flex items-center gap-1.5 border border-blue-200 cursor-pointer transition-colors"
                  title="Kelola Rekening Bank Resmi"
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Rekening Bank ({bankAccounts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenNewCashModal("IN")}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Catat Transaksi Kas</span>
                </button>
              </div>
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
                  {cashFlow
                    .filter((cash) => {
                      if (cashAccountFilter === "ALL") return true;
                      if (cashAccountFilter === "TUNAI") {
                        return (
                          cash.account.toLowerCase().includes("tunai") ||
                          cash.account.toLowerCase().includes("kas kecil") ||
                          cash.account.toLowerCase().includes("petty")
                        );
                      }
                      return cash.account.toLowerCase().includes(cashAccountFilter.toLowerCase());
                    })
                    .map((cash) => (
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
                        <td className="p-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
                            {cash.account.toLowerCase().includes("tunai") || cash.account.toLowerCase().includes("petty") ? (
                              <Wallet className="w-3 h-3 text-amber-600 shrink-0" />
                            ) : (
                              <Landmark className="w-3 h-3 text-dstech-blue shrink-0" />
                            )}
                            <span>{cash.account}</span>
                          </span>
                        </td>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-dstech-blue" />
                  <h3 className="font-black text-sm text-slate-900">Daftar Titik Gudang & Logistik</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">{warehouses.length} Lokasi</span>
                  <button
                    onClick={handleOpenAddWarehouse}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dstech-blue text-white text-xs font-bold hover:bg-blue-600 transition shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Titik Gudang</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {warehouses.map((wh) => (
                  <div key={wh.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 relative group hover:border-dstech-blue/50 transition shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black text-dstech-blue bg-blue-100 px-2 py-0.5 rounded-md">
                          {wh.code}
                        </span>
                        {wh.type && (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md">
                            {wh.type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {wh.status}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleOpenEditWarehouse(wh)}
                            title="Edit Data Gudang"
                            className="p-1 rounded-lg text-slate-400 hover:text-dstech-blue hover:bg-blue-50 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWarehouse(wh)}
                            title="Hapus Gudang"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{wh.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{wh.address}</span>
                      </p>
                      {wh.phone && wh.phone !== "-" && (
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{wh.phone}</span>
                        </p>
                      )}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <h3 className="font-black text-sm text-slate-900">Kantor Pusat & Kantor Cabang DSTech</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">{branches.length} Cabang</span>
                  <button
                    onClick={handleOpenAddBranch}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Kantor Cabang</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {branches.map((br) => (
                  <div key={br.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 relative group hover:border-purple-300 transition shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        {br.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          {br.status}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleOpenEditBranch(br)}
                            title="Edit Data Cabang"
                            className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBranch(br)}
                            title="Hapus Kantor Cabang"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{br.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{br.address}</span>
                      </p>
                      {br.phone && br.phone !== "-" && (
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{br.phone}</span>
                        </p>
                      )}
                      {br.email && br.email !== "-" && (
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{br.email}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Pimpinan Cabang</p>
                        <p className="font-bold text-slate-800">{br.head}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Wilayah / Coverage</p>
                        <p className="font-bold text-slate-800">{br.city}{br.coverage && br.coverage !== "-" ? ` • ${br.coverage}` : ""}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: MASTER DATA DAFTAR KLIEN (CUSTOMERS) */}
        {activeTab === "clients" && (
          <div className="space-y-4">
            {/* Header & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Cari nama klien, instansi, kontak PIC, atau kota..."
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-dstech-blue focus:outline-none bg-white"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={clientCategoryFilter}
                    onChange={(e) => setClientCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="B2B Industri">B2B Industri</option>
                    <option value="Komersial & Hospitality">Komersial & Hospitality</option>
                    <option value="Instansi Pemerintah">Instansi Pemerintah</option>
                    <option value="Residensial & Real Estate">Residensial & Real Estate</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleOpenAddClient}
                className="px-4 py-2.5 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Tambah Klien Baru</span>
              </button>
            </div>

            {/* Quick KPI Summary Bar for Clients */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-dstech-blue">Total Klien Terdaftar</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">{clients.length} Rekanan</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Klien VIP & Prioritas</p>
                <p className="text-lg font-black text-emerald-700 mt-0.5">
                  {clients.filter((c) => c.status === "VIP").length} Mitra VIP
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-purple-600">Total Akumulasi Faktur</p>
                <p className="text-lg font-black text-purple-700 mt-0.5">
                  {formatRupiah(clients.reduce((acc, curr) => acc + (curr.totalInvoiced || 0), 0))}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-red-600">Piutang Klien Berjalan</p>
                <p className="text-lg font-black text-red-700 mt-0.5">
                  {formatRupiah(clients.reduce((acc, curr) => acc + (curr.unpaidReceivable || 0), 0))}
                </p>
              </div>
            </div>

            {/* Directory Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">ID Klien</th>
                    <th className="p-3">Nama Perusahaan / Klien</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Kontak & PIC</th>
                    <th className="p-3">Lokasi & NPWP</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients
                    .filter((c) => {
                      const matchQuery =
                        c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                        c.pic.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                        c.city.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                        c.phone.toLowerCase().includes(clientSearchQuery.toLowerCase());
                      const matchCat =
                        clientCategoryFilter === "Semua" || c.category === clientCategoryFilter;
                      return matchQuery && matchCat;
                    })
                    .map((cli) => (
                      <tr key={cli.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-400 whitespace-nowrap">
                          {cli.id}
                        </td>
                        <td className="p-3">
                          <p className="font-black text-slate-900 text-xs">{cli.name}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{cli.address}</p>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {cli.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{cli.pic}</p>
                          <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {cli.phone}
                            </span>
                            {cli.email && cli.email !== "-" && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Mail className="w-3 h-3 text-blue-500" />
                                {cli.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-bold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500" />
                            {cli.city}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">NPWP: {cli.npwp}</p>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              cli.status === "VIP"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : cli.status === "Aktif"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {cli.status}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditClient(cli)}
                              className="p-1.5 rounded-lg bg-blue-50 text-dstech-blue hover:bg-dstech-blue hover:text-white transition-all cursor-pointer"
                              title="Edit Klien"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(cli)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                              title="Hapus Klien"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: MASTER DATA DAFTAR SUPPLIER (VENDORS / PEMASOK) */}
        {activeTab === "suppliers" && (
          <div className="space-y-4">
            {/* Header & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama supplier, kategori suplai, kontak PIC sales, atau kota..."
                  value={supplierSearchQuery}
                  onChange={(e) => setSupplierSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
              </div>

              <button
                onClick={handleOpenAddSupplier}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Supplier Baru</span>
              </button>
            </div>

            {/* Quick KPI Summary Bar for Suppliers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">Total Supplier Mitra</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">{suppliers.length} Vendor</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-900">Total Pembelian PO</p>
                <p className="text-lg font-black text-amber-950 mt-0.5">
                  {formatRupiah(suppliers.reduce((acc, curr) => acc + (curr.totalPurchases || 0), 0))}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-red-600">Hutang PO Belum Lunas</p>
                <p className="text-lg font-black text-red-700 mt-0.5">
                  {formatRupiah(suppliers.reduce((acc, curr) => acc + (curr.unpaidPayable || 0), 0))}
                </p>
              </div>
            </div>

            {/* Directory Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">ID Supplier</th>
                    <th className="p-3">Nama Distributor / Vendor</th>
                    <th className="p-3">Kategori Suplai</th>
                    <th className="p-3">Kontak Sales & Rekening Transfer</th>
                    <th className="p-3">Termin (TOP)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers
                    .filter((s) => {
                      return (
                        s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
                        s.category.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
                        s.pic.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
                        s.city.toLowerCase().includes(supplierSearchQuery.toLowerCase())
                      );
                    })
                    .map((sup) => (
                      <tr key={sup.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-400 whitespace-nowrap">
                          {sup.id}
                        </td>
                        <td className="p-3">
                          <p className="font-black text-slate-900 text-xs">{sup.name}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{sup.address}</p>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                            {sup.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{sup.pic}</p>
                          <p className="text-[10px] text-slate-500">{sup.phone}</p>
                          <p className="text-[10px] text-blue-700 font-medium mt-0.5 bg-blue-50/60 p-1 rounded inline-block">
                            <Landmark className="w-3 h-3 inline mr-1 text-dstech-blue" />
                            {sup.bankAccount}
                          </p>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-1 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                            {sup.paymentTerms}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              sup.status === "Mitra Utama"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : sup.status.includes("Aktif")
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {sup.status}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditSupplier(sup)}
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-all cursor-pointer"
                              title="Edit Supplier"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(sup)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                              title="Hapus Supplier"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
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
              {/* Quick Select Client from Master Data */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-dstech-blue flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Pilih dari Master Data Klien DSTech:</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Auto-fill Nama, No. WhatsApp & Alamat</span>
                </div>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const found = clients.find((c) => c.id === val);
                    if (found) {
                      setSaleForm((prev) => ({
                        ...prev,
                        customerName: found.name,
                        customerPhone: found.phone,
                        customerAddress: `${found.address}, ${found.city}`,
                      }));
                    }
                  }}
                  defaultValue=""
                  className="w-full p-2.5 rounded-xl bg-white border border-blue-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                >
                  <option value="">-- Pilih dari Direktori Klien (atau ketik manual di bawah) --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category}) — {c.city}
                    </option>
                  ))}
                </select>
              </div>

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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">Metode Pembayaran:</label>
                    <button
                      type="button"
                      onClick={() => setIsBankAccountsModalOpen(true)}
                      className="text-[10px] text-dstech-blue hover:underline font-bold cursor-pointer"
                    >
                      ⚙️ Rekening
                    </button>
                  </div>
                  <select
                    value={saleForm.paymentMethod || getDefaultTransferLabel()}
                    onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    {bankAccounts
                      .filter((b) => b.status === "Aktif")
                      .map((b) => (
                        <option key={b.id} value={`Transfer ${b.bankName} (${b.accountNumber} - ${b.accountHolder})`}>
                          Transfer {b.bankName} ({b.accountNumber} - {b.accountHolder}) {b.isDefault ? "★ (Utama)" : ""}
                        </option>
                      ))}
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
                const { subtotal, taxAmount, grandTotal, dpAmount } = calculateSaleTotals();
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

                    {/* Opsi Tipe Faktur: Standar vs Pengajuan DP */}
                    <div className="pt-2 border-t border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Tipe Faktur Penjualan:</span>
                        </label>
                        <div className="flex rounded-lg overflow-hidden border border-slate-700 p-0.5 bg-slate-800">
                          <button
                            type="button"
                            onClick={() => setSaleForm({ ...saleForm, invoiceType: "Standar" })}
                            className={`px-2.5 py-1 text-[10px] font-black rounded cursor-pointer ${
                              saleForm.invoiceType === "Standar" ? "bg-dstech-blue text-white" : "text-slate-400"
                            }`}
                          >
                            Standar
                          </button>
                          <button
                            type="button"
                            onClick={() => setSaleForm({ ...saleForm, invoiceType: "DP" })}
                            className={`px-2.5 py-1 text-[10px] font-black rounded cursor-pointer ${
                              saleForm.invoiceType === "DP" ? "bg-amber-500 text-slate-900" : "text-slate-400"
                            }`}
                          >
                            Pengajuan DP
                          </button>
                        </div>
                      </div>

                      {saleForm.invoiceType === "DP" && (
                        <div className="p-2.5 rounded-xl bg-slate-800/90 border border-amber-500/40 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-amber-300 font-bold">Pilih Termin Uang Muka (DP):</span>
                            <div className="flex gap-1">
                              {[30, 50, 70].map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() =>
                                    setSaleForm({
                                      ...saleForm,
                                      dpPercentage: pct,
                                      dpAmount: Math.round(grandTotal * (pct / 100)),
                                      paidAmount: 0,
                                    })
                                  }
                                  className={`px-2 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                                    saleForm.dpPercentage === pct
                                      ? "bg-amber-400 text-slate-900"
                                      : "bg-slate-700 text-slate-300"
                                  }`}
                                >
                                  {pct}%
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Persen DP (%):</label>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={saleForm.dpPercentage}
                                onChange={(e) => {
                                  const pct = Number(e.target.value);
                                  setSaleForm({
                                    ...saleForm,
                                    dpPercentage: pct,
                                    dpAmount: Math.round(grandTotal * (pct / 100)),
                                  });
                                }}
                                className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Nilai Tagihan DP (Rp):</label>
                              <input
                                type="number"
                                min={0}
                                max={grandTotal}
                                value={dpAmount}
                                onChange={(e) =>
                                  setSaleForm({
                                    ...saleForm,
                                    dpAmount: Number(e.target.value),
                                    dpPercentage:
                                      grandTotal > 0
                                        ? Math.round((Number(e.target.value) / grandTotal) * 100)
                                        : 0,
                                  })
                                }
                                className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">Catatan / Termin DP:</label>
                            <input
                              type="text"
                              value={saleForm.dpNotes}
                              onChange={(e) => setSaleForm({ ...saleForm, dpNotes: e.target.value })}
                              placeholder="Contoh: DP 50% sebelum instalasi dimulai..."
                              className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700 text-slate-300">
                            <span>Sisa Pelunasan Setelah BAST:</span>
                            <span className="font-mono text-emerald-400 font-bold">
                              {formatRupiah(Math.max(0, grandTotal - dpAmount))}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-400">
                          {saleForm.invoiceType === "DP"
                            ? "Uang Muka (DP) Sudah Diterima Sekarang? (Rp):"
                            : "Jumlah Dibayar Sekarang (Rp):"}
                        </label>
                        {saleForm.invoiceType === "DP" && dpAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => setSaleForm({ ...saleForm, paidAmount: dpAmount })}
                            className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                          >
                            Set Lunas DP ({formatRupiah(dpAmount)})
                          </button>
                        )}
                      </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">Rekening Akun Kas / Bank:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewCashModalOpen(false);
                      setIsBankAccountsModalOpen(true);
                    }}
                    className="text-[10px] text-dstech-blue hover:underline font-bold cursor-pointer"
                  >
                    ⚙️ Atur Rekening Resmi
                  </button>
                </div>
                <select
                  value={cashForm.account || getDefaultBankAccLabel()}
                  onChange={(e) => setCashForm({ ...cashForm, account: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  {bankAccounts
                    .filter((b) => b.status === "Aktif")
                    .map((b) => (
                      <option key={b.id} value={`${b.bankName} - ${b.accountNumber} (${b.accountHolder})`}>
                        {b.bankName} - {b.accountNumber} ({b.accountHolder}) {b.isDefault ? "★ (Rekening Utama)" : ""}
                      </option>
                    ))}
                  <option value="Kas Tunai Operasional">Kas Tunai Operasional</option>
                  <option value="Kas Kecil (Petty Cash Kantor)">Kas Kecil (Petty Cash Kantor)</option>
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-dstech-blue" />
                Format Faktur Resmi PT. DSTech Smart Perkasa
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenSettingsModal}
                  title="Ganti Background Kop Surat"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-dstech-blue" />
                  <span>Kop Surat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBankAccountsModalOpen(true)}
                  title="Atur Nomor Rekening"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rekening</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* FAKTUR CONTENT CONTAINER (Siap Cetak & Watermarked) */}
            <div className="relative rounded-2xl border border-slate-300 bg-white p-6 sm:p-8 space-y-6 text-slate-800 overflow-hidden shadow-sm">
              {/* Background Kop Surat Resmi DSTech */}
              {financeSettings.letterheadEnabled && financeSettings.letterheadUrl && (
                <div
                  className="absolute inset-0 pointer-events-none z-0 bg-cover bg-no-repeat bg-top"
                  style={{
                    backgroundImage: `url('${financeSettings.letterheadUrl}')`,
                    opacity: financeSettings.watermarkOpacity || 0.15,
                  }}
                />
              )}

              <div className="relative z-10 space-y-6">
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
                      <strong>NIB: 1909220127034</strong> | <strong>NPWP: 60.648.216.4-102.000</strong>
                      <br />
                      WhatsApp CS: 0822-5949-4242 | 0822-7225-6903 | Email: cs@dstechsmart.com | https://dstechsmart.com
                    </p>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <span className="px-3 py-1 rounded-md bg-slate-900 text-white font-black text-xs uppercase tracking-wider inline-block">
                      {selectedInvoiceForPrint.invoiceType === "DP"
                        ? `FAKTUR PENGAJUAN UANG MUKA (DP ${selectedInvoiceForPrint.dpPercentage || 50}%)`
                        : "FAKTUR PENJUALAN"}
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

                {/* Banner Rincian Pengajuan DP (Khusus Faktur DP) */}
                {selectedInvoiceForPrint.invoiceType === "DP" && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <span className="font-black flex items-center gap-1.5 text-amber-900">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Pengajuan Uang Muka (Down Payment {selectedInvoiceForPrint.dpPercentage || 50}%)
                      </span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {selectedInvoiceForPrint.dpNotes ||
                          "Uang muka pelaksanaan pekerjaan/proyek. Sisa pelunasan dibayarkan setelah Berita Acara Serah Terima (BAST)."}
                      </p>
                    </div>
                    <div className="sm:text-right whitespace-nowrap bg-white/80 p-2 rounded-xl border border-amber-200">
                      <span className="text-[9px] text-amber-700 block uppercase font-bold tracking-wider">
                        Jumlah Tagihan DP:
                      </span>
                      <span className="text-base font-black font-mono text-amber-900">
                        {formatRupiah(selectedInvoiceForPrint.dpAmount || 0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Data Klien */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/90 p-4 rounded-xl border border-slate-200">
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
                          : selectedInvoiceForPrint.paymentStatus?.includes("DP")
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
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
                    <tbody className="divide-y divide-slate-200 bg-white/70">
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

                {/* Rincian Perhitungan & Instruksi Rekening */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-3 border-t border-slate-200 text-xs">
                  <div className="space-y-2 max-w-sm">
                    <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between border-b border-blue-200/60 pb-1 mb-1">
                        <p className="font-bold text-dstech-blue">Instruksi Pembayaran Resmi Transfer Bank:</p>
                        <button
                          type="button"
                          onClick={() => setIsBankAccountsModalOpen(true)}
                          className="text-[10px] text-blue-600 underline font-medium print:hidden cursor-pointer"
                        >
                          Atur Rekening
                        </button>
                      </div>
                      {bankAccounts.filter((b) => b.status === "Aktif").map((acc) => (
                        <p key={acc.id} className="text-slate-700">
                          • <strong>{acc.bankName}</strong>: {acc.accountNumber} a/n {acc.accountHolder} ({acc.branch})
                        </p>
                      ))}
                      <p className="text-[10px] text-slate-500 italic mt-1.5">
                        Harap sertakan nomor faktur ({selectedInvoiceForPrint.invoiceNumber}) pada berita transfer.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:w-72">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Subtotal Kontrak:</span>
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
                      <span>TOTAL KONTRAK:</span>
                      <span className="text-base text-dstech-blue">{formatRupiah(selectedInvoiceForPrint.grandTotal)}</span>
                    </div>

                    {/* Breakdown DP jika faktur bertipe DP */}
                    {selectedInvoiceForPrint.invoiceType === "DP" && (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 space-y-1 text-[11px] my-1">
                        <div className="flex items-center justify-between text-amber-900 font-bold">
                          <span>Tagihan Uang Muka ({selectedInvoiceForPrint.dpPercentage}%):</span>
                          <span>{formatRupiah(selectedInvoiceForPrint.dpAmount || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Sisa Pelunasan Pasca BAST:</span>
                          <span>{formatRupiah(Math.max(0, selectedInvoiceForPrint.grandTotal - (selectedInvoiceForPrint.dpAmount || 0)))}</span>
                        </div>
                      </div>
                    )}

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

                {/* Tanda Tangan Resmi Sesuai Kaidah Administrasi Korporat */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-xs">
                  {/* Sisi Kiri: Penerima / Klien */}
                  <div className="flex flex-col justify-between h-48 border border-slate-200/80 rounded-xl p-3.5 bg-white/70 shadow-sm text-center">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Penerima / Klien</p>
                      <p className="text-xs font-black text-slate-900 mt-1">{selectedInvoiceForPrint.customerName}</p>
                    </div>

                    <div className="h-16 flex items-center justify-center text-slate-300 text-[10px] italic">
                      (Tanda Tangan & Stempel Resmi Klien)
                    </div>

                    <div className="pt-2 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-xs">
                        ( ................................................................ )
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Nama & Jabatan Penandatangan Klien
                      </p>
                    </div>
                  </div>

                  {/* Sisi Kanan: Pengirim / PT. DSTech Smart Perkasa */}
                  <div className="flex flex-col justify-between h-48 border border-slate-200/80 rounded-xl p-3.5 bg-white/70 shadow-sm text-center">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hormat Kami,</p>
                      <p className="text-xs font-black text-dstech-blue mt-0.5">PT. DSTech Smart Perkasa</p>
                    </div>

                    <div className="h-16 relative flex items-center justify-center">
                      {selectedInvoiceForPrint.approvalStatus === "Disetujui & Sah" ? (
                        <>
                          {/* Stempel Bulat Digital Resmi PT DSTech */}
                          <div className="absolute right-3 w-16 h-16 rounded-full border-2 border-dashed border-dstech-blue/50 flex flex-col items-center justify-center text-[7px] text-dstech-blue font-bold uppercase rotate-[-12deg] pointer-events-none bg-blue-50/40">
                            <span className="font-black text-[6.5px]">PT. DSTECH</span>
                            <span className="text-[5.5px] tracking-tight">SMART PERKASA</span>
                            <span className="text-[5px] text-emerald-600 font-mono font-black mt-0.5">DIGITAL SIGN</span>
                          </div>

                          {/* Tanda Tangan Goresan / Gambar */}
                          {selectedInvoiceForPrint.signatureImage ? (
                            <img
                              src={selectedInvoiceForPrint.signatureImage}
                              alt="Tanda Tangan Digital"
                              className="max-h-16 max-w-[140px] object-contain relative z-10"
                            />
                          ) : (
                            <div className="font-serif italic text-lg text-slate-800 font-black relative z-10 select-none tracking-wider">
                              {selectedInvoiceForPrint.approvedBy || "H. Agus Supriyadi"}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center border border-dashed border-amber-300 bg-amber-50/80 rounded-lg p-2 w-full">
                          <Clock className="w-4 h-4 text-amber-600 mb-0.5" />
                          <span className="text-[9px] font-black text-amber-800 uppercase">Menunggu Approval Direksi</span>
                          <button
                            type="button"
                            onClick={() => {
                              const inv = selectedInvoiceForPrint;
                              setSelectedInvoiceForPrint(null);
                              handleOpenApprovalModal(inv);
                            }}
                            className="mt-1 px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-bold shadow-sm flex items-center gap-1 cursor-pointer print:hidden"
                          >
                            <PenTool className="w-2.5 h-2.5" />
                            Approval Sekarang
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-300">
                      <p className="font-bold text-slate-900 underline text-xs">
                        {selectedInvoiceForPrint.approvedBy || financeSettings.signerName || "H. Agus Supriyadi, S.T., M.Kom."}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                        {selectedInvoiceForPrint.approvedTitle || financeSettings.signerTitle || "Direktur Keuangan & Operasional"}
                      </p>
                      {selectedInvoiceForPrint.approvalStatus === "Disetujui & Sah" && (
                        <p className="text-[8px] text-emerald-700 font-mono font-bold mt-0.5">
                          [VERIFIKASI: {selectedInvoiceForPrint.verificationCode || "DST-APP-202610-001"}]
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SPH: BUAT / EDIT SURAT PENAWARAN HARGA (QUOTATION) */}
      {(isNewQuotationModalOpen || isEditQuotationModalOpen) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setIsNewQuotationModalOpen(false);
            setIsEditQuotationModalOpen(false);
            setEditingQuotation(null);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  {isEditQuotationModalOpen ? `Pembaruan ${editingQuotation?.quotationNumber}` : "Formulir Surat Penawaran Resmi"}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {isEditQuotationModalOpen ? "Edit Surat Penawaran Harga (SPH)" : "Buat Surat Penawaran Harga (SPH) Baru"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsNewQuotationModalOpen(false);
                  setIsEditQuotationModalOpen(false);
                  setEditingQuotation(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={isEditQuotationModalOpen ? handleSaveEditQuotationSubmit : handleCreateQuotationSubmit}
              className="space-y-4 text-xs"
            >
              {/* Quick Select Client from Master Data */}
              <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-indigo-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Pilih Klien dari Master Data Rekanan (Auto-Fill):</span>
                  </label>
                  <span className="text-[10px] text-indigo-600 font-medium">Opsional</span>
                </div>
                <select
                  value={quotationForm.clientId}
                  onChange={(e) => handleClientSelectForQuotation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Pilih dari Master Data Klien (atau isi manual di bawah) --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category}) — {c.pic ? `PIC: ${c.pic}` : c.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data Klien & Tujuan Penawaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nama Klien / PIC Penerima <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bapak H. Hendra Wijaya"
                    value={quotationForm.customerName}
                    onChange={(e) => setQuotationForm({ ...quotationForm, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nama Perusahaan / Instansi Klien:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PT. Krakatau Posco Energy"
                    value={quotationForm.customerOrg}
                    onChange={(e) => setQuotationForm({ ...quotationForm, customerOrg: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nomor Telepon / WhatsApp <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0812-9988-7766"
                    value={quotationForm.customerPhone}
                    onChange={(e) => setQuotationForm({ ...quotationForm, customerPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alamat Proyek / Lokasi Klien:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kawasan Industri Krakatau Steel Kav. D-2, Cilegon"
                    value={quotationForm.customerAddress}
                    onChange={(e) => setQuotationForm({ ...quotationForm, customerAddress: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subjek & Perihal Penawaran */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">
                    Perihal / Subjek Surat Penawaran <span className="text-red-500">*</span>:
                  </label>
                  <span className="text-[10px] text-slate-400">Pilih Preset Cepat:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {[
                    "CCTV AI & Security",
                    "Smart Barrier Gate RFID",
                    "Smart Access Door Intercom",
                    "IT Server & Networking",
                    "Kontrak Maintenance Tahunan",
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() =>
                        setQuotationForm({
                          ...quotationForm,
                          subject:
                            preset === "CCTV AI & Security"
                              ? "Penawaran Pengadaan & Instalasi Sistem CCTV AI & Security Surveillance"
                              : preset === "Smart Barrier Gate RFID"
                              ? "Penawaran Pengadaan & Pemasangan Sistem Smart Barrier Gate RFID & Manless Tap"
                              : preset === "Smart Access Door Intercom"
                              ? "Penawaran Pengadaan & Instalasi Smart Access Door Intercom & RFID Card"
                              : preset === "IT Server & Networking"
                              ? "Penawaran Pengadaan Server, Rack Cabinet & Infrastruktur Jaringan LAN/Fiber Optic"
                              : "Penawaran Kontrak Pemeliharaan (Maintenance & SLA Support) Tahunan Sistem Keamanan",
                        })
                      }
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-bold text-[10px] cursor-pointer transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={quotationForm.subject}
                  onChange={(e) => setQuotationForm({ ...quotationForm, subject: e.target.value })}
                  placeholder="Ketik perihal surat penawaran harga..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Tanggal & Masa Berlaku */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Terbit Penawaran:</label>
                  <input
                    type="date"
                    required
                    value={quotationForm.date}
                    onChange={(e) => setQuotationForm({ ...quotationForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Masa Berlaku Penawaran:</label>
                  <select
                    value={quotationForm.validityDays}
                    onChange={(e) => setQuotationForm({ ...quotationForm, validityDays: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value={7}>7 Hari Kalender</option>
                    <option value={14}>14 Hari Kalender (Standar)</option>
                    <option value={30}>30 Hari Kalender (Proyek Korporat)</option>
                    <option value={60}>60 Hari Kalender</option>
                  </select>
                </div>
              </div>

              {/* Items Repeater */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Daftar Barang & Jasa Teknis ({quotationForm.items.length} Item)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddQuotationItem}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {quotationForm.items.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="col-span-5">
                        <label className="text-[9px] text-slate-400 block mb-0.5">Deskripsi Produk / Jasa & Spek</label>
                        <input
                          type="text"
                          required
                          placeholder="Nama barang & spesifikasi teknis..."
                          value={it.productName}
                          onChange={(e) => handleQuotationItemChange(idx, "productName", e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] text-slate-400 block mb-0.5">Qty</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={it.qty}
                          onChange={(e) => handleQuotationItemChange(idx, "qty", Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs text-center"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[9px] text-slate-400 block mb-0.5">Satuan</label>
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) => handleQuotationItemChange(idx, "unit", e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-medium text-xs text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] text-slate-400 block mb-0.5">Harga Satuan (Rp)</label>
                        <input
                          type="number"
                          min={0}
                          required
                          value={it.price}
                          onChange={(e) => handleQuotationItemChange(idx, "price", Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[9px] text-slate-400 block mb-0.5">Diskon</label>
                        <input
                          type="number"
                          min={0}
                          value={it.discount || 0}
                          onChange={(e) => handleQuotationItemChange(idx, "discount", Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <label className="text-[9px] text-transparent block mb-0.5">Del</label>
                        {quotationForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuotationItem(idx)}
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
                const { subtotal, afterDiscount, taxAmount, grandTotal } = calculateQuotationTotals();
                return (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Subtotal Barang & Jasa:</span>
                      <span className="font-bold">{formatRupiah(subtotal)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Diskon Tambahan (Rp):</label>
                        <input
                          type="number"
                          min={0}
                          value={quotationForm.discount || 0}
                          onChange={(e) => setQuotationForm({ ...quotationForm, discount: Number(e.target.value) })}
                          className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Tarif Pajak PPN (%):</label>
                        <select
                          value={quotationForm.taxRate}
                          onChange={(e) => setQuotationForm({ ...quotationForm, taxRate: Number(e.target.value) })}
                          className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                        >
                          <option value={0}>Bebas PPN (0%)</option>
                          <option value={11}>PPN 11% (Standar)</option>
                          <option value={12}>PPN 12%</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Pajak Pertambahan Nilai ({quotationForm.taxRate}%):</span>
                      <span className="font-bold">{formatRupiah(taxAmount)}</span>
                    </div>

                    <div className="border-t border-white/20 pt-2 flex items-center justify-between text-base font-black">
                      <span className="text-indigo-400">TOTAL PENAWARAN (GRAND TOTAL):</span>
                      <span className="text-xl text-emerald-400">{formatRupiah(grandTotal)}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px]">
                      <span className="text-slate-400">Terbilang: </span>
                      <span className="font-bold text-amber-300 italic">
                        "{angkaTerbilang(grandTotal)} Rupiah"
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Syarat & Ketentuan (Terms & Conditions) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Syarat & Ketentuan Teknis & Garansi (Terms & Conditions):
                </label>
                <textarea
                  rows={4}
                  value={quotationForm.terms}
                  onChange={(e) => setQuotationForm({ ...quotationForm, terms: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Klausul syarat & ketentuan..."
                />
              </div>

              {/* Catatan Internal Tambahan */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional):</label>
                <input
                  type="text"
                  placeholder="Catatan tambahan untuk tim teknisi atau sales..."
                  value={quotationForm.notes}
                  onChange={(e) => setQuotationForm({ ...quotationForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewQuotationModalOpen(false);
                    setIsEditQuotationModalOpen(false);
                    setEditingQuotation(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEditQuotationModalOpen ? "Simpan Perubahan SPH" : "Terbitkan Surat Penawaran (SPH)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONVERSI SPH KE FAKTUR PENJUALAN RESMI */}
      {isConvertModalOpen && selectedQuotationForConvert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setIsConvertModalOpen(false);
            setSelectedQuotationForConvert(null);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    Konversi Otomatis Penawaran
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Konversi SPH ke Faktur Penjualan
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsConvertModalOpen(false);
                  setSelectedQuotationForConvert(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info SPH yang Dikonversi */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Nomor SPH:</span>
                <span className="font-mono font-black text-indigo-700">{selectedQuotationForConvert.quotationNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Klien / Instansi:</span>
                <span className="font-bold text-slate-800 text-right">
                  {selectedQuotationForConvert.customerOrg || selectedQuotationForConvert.customerName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Perihal:</span>
                <span className="font-medium text-slate-700 text-right truncate max-w-[240px]">
                  {selectedQuotationForConvert.subject}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span className="font-bold text-slate-700">Total Nilai Penawaran:</span>
                <span className="font-black text-emerald-600 text-sm">
                  {formatRupiah(selectedQuotationForConvert.grandTotal)}
                </span>
              </div>
            </div>

            {/* Form Pilihan Tipe Faktur Hasil Konversi */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Skema Penerbitan Faktur:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConvertForm({ ...convertForm, invoiceType: "Standar" })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      convertForm.invoiceType === "Standar"
                        ? "border-dstech-blue bg-blue-50 text-dstech-blue ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-black text-xs">Faktur Penuh (100%)</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Penagihan total sekaligus</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConvertForm({ ...convertForm, invoiceType: "DP" })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      convertForm.invoiceType === "DP"
                        ? "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-black text-xs">Faktur Uang Muka (DP)</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Penagihan termin proyek</p>
                  </button>
                </div>
              </div>

              {convertForm.invoiceType === "DP" && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-900 text-xs">Persentase Uang Muka (DP):</label>
                    <div className="flex gap-1">
                      {[30, 50, 70].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setConvertForm({ ...convertForm, dpPercentage: pct })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            convertForm.dpPercentage === pct
                              ? "bg-amber-600 text-white"
                              : "bg-white text-amber-800 border border-amber-300"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      max={90}
                      value={convertForm.dpPercentage}
                      onChange={(e) => setConvertForm({ ...convertForm, dpPercentage: Number(e.target.value) })}
                      className="w-24 p-2 rounded-xl border border-amber-300 bg-white font-black text-sm text-center"
                    />
                    <span className="font-bold text-slate-600">% =</span>
                    <span className="font-black text-emerald-700 text-sm">
                      {formatRupiah((selectedQuotationForConvert.grandTotal * (convertForm.dpPercentage || 50)) / 100)}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] text-amber-800 font-bold block mb-1">
                      Keterangan Termin Faktur:
                    </label>
                    <input
                      type="text"
                      value={convertForm.dpNotes}
                      onChange={(e) => setConvertForm({ ...convertForm, dpNotes: e.target.value })}
                      className="w-full p-2 rounded-xl border border-amber-200 bg-white text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-500 italic">
                *Faktur penjualan baru (INV-DSTECH-...) akan otomatis dibuat, dan status SPH ini akan diperbarui menjadi "Terkonversi Faktur".
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsConvertModalOpen(false);
                  setSelectedQuotationForConvert(null);
                }}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteConvertQuotation}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konversi Menjadi Faktur Penjualan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3.5: CETAK & PRATINJAU SURAT PENAWARAN HARGA RESMI (SPH BER-KOP DSTECH) */}
      {selectedQuotationForPrint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedQuotationForPrint(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Top) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-indigo-600" />
                Format Surat Penawaran Resmi (SPH) PT. DSTech Smart Perkasa
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenSettingsModal}
                  title="Ganti Background Kop Surat"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kop Surat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenConvertQuotation(selectedQuotationForPrint)}
                  title="Konversi ke Faktur Penjualan"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Konversi ke Faktur</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak SPH / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setSelectedQuotationForPrint(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SPH OFFICIAL LETTER CONTAINER (A4 Standard Print Layout) */}
            <div className="relative rounded-2xl border border-slate-300 bg-white p-6 sm:p-10 space-y-6 text-slate-800 overflow-hidden shadow-sm">
              {/* Background Kop Surat Resmi DSTech */}
              {financeSettings.letterheadEnabled && financeSettings.letterheadUrl && (
                <div
                  className="absolute inset-0 pointer-events-none z-0 bg-cover bg-no-repeat bg-top"
                  style={{
                    backgroundImage: `url('${financeSettings.letterheadUrl}')`,
                    opacity: financeSettings.watermarkOpacity || 0.15,
                  }}
                />
              )}

              <div className="relative z-10 space-y-6">
                {/* Kop Surat Perusahaan DSTech */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-black text-dstech-red tracking-tight">
                        PT. DSTECH SMART PERKASA
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-600">
                      Solusi Security System, CCTV AI, Barrier Gate, IoT & IT Infrastructure
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed max-w-md">
                      Perum Bukit Cilegon Asri Blok DB No. 19, Kel. Bagendung, Kec. Cilegon, Kota Cilegon - Banten
                      <br />
                      <strong>NIB: 1909220127034</strong> | <strong>NPWP: 60.648.216.4-102.000</strong>
                      <br />
                      WhatsApp: 0822-5949-4242 | 0822-7225-6903 | Email: cs@dstechsmart.com | https://dstechsmart.com
                    </p>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <span className="px-3 py-1 rounded-md bg-indigo-900 text-white font-black text-xs uppercase tracking-wider inline-block">
                      SURAT PENAWARAN HARGA (SPH)
                    </span>
                    <p className="font-mono font-black text-sm text-indigo-700">
                      {selectedQuotationForPrint.quotationNumber}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Tanggal: {selectedQuotationForPrint.date}
                    </p>
                    <p className="text-[11px] text-slate-700 font-bold">
                      Masa Berlaku: s/d {selectedQuotationForPrint.validUntil} ({selectedQuotationForPrint.validityDays} Hari)
                    </p>
                  </div>
                </div>

                {/* Nomor, Lampiran, Perihal Surat Niaga */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-1">
                    <table className="text-xs">
                      <tbody>
                        <tr>
                          <td className="pr-2 font-bold text-slate-500">Nomor</td>
                          <td className="pr-2">:</td>
                          <td className="font-mono font-bold text-slate-900">{selectedQuotationForPrint.quotationNumber}</td>
                        </tr>
                        <tr>
                          <td className="pr-2 font-bold text-slate-500">Lampiran</td>
                          <td className="pr-2">:</td>
                          <td className="text-slate-800">1 (Satu) Berkas Penawaran Harga</td>
                        </tr>
                        <tr>
                          <td className="pr-2 font-bold text-slate-500">Perihal</td>
                          <td className="pr-2">:</td>
                          <td className="font-bold text-indigo-900">{selectedQuotationForPrint.subject}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="sm:text-right bg-slate-50/90 p-3 rounded-xl border border-slate-200 text-xs">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kepada Yth:</p>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{selectedQuotationForPrint.customerName}</p>
                    {selectedQuotationForPrint.customerOrg && selectedQuotationForPrint.customerOrg !== selectedQuotationForPrint.customerName && (
                      <p className="font-bold text-slate-700">{selectedQuotationForPrint.customerOrg}</p>
                    )}
                    <p className="text-slate-600 text-[11px] mt-0.5">{selectedQuotationForPrint.customerPhone}</p>
                    <p className="text-slate-500 text-[10px]">{selectedQuotationForPrint.customerAddress}</p>
                  </div>
                </div>

                {/* Paragraf Pembuka Resmi */}
                <div className="text-xs leading-relaxed text-slate-700 space-y-1.5 border-t border-slate-100 pt-3">
                  <p className="font-bold text-slate-900">Dengan hormat,</p>
                  <p>
                    Sehubungan dengan rencana pengadaan dan kebutuhan sistem pengamanan / teknologi informasi pada instansi Bapak/Ibu, bersama surat ini kami PT. DSTech Smart Perkasa bermaksud mengajukan penawaran harga pengadaan unit perangkat, material pendukung, serta jasa instalasi teknis dengan rincian spesifikasi sebagai berikut:
                  </p>
                </div>

                {/* Tabel Item Penawaran & Spesifikasi */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-indigo-950 text-white uppercase text-[10px] font-black tracking-wider">
                      <tr>
                        <th className="p-2.5 text-center w-8">No</th>
                        <th className="p-2.5">Deskripsi Produk / Jasa & Spesifikasi Teknis</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-center">Satuan</th>
                        <th className="p-2.5 text-right">Harga Satuan (Rp)</th>
                        {selectedQuotationForPrint.items.some((it) => (it.discount || 0) > 0) && (
                          <th className="p-2.5 text-right">Diskon</th>
                        )}
                        <th className="p-2.5 text-right">Total (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white/70">
                      {selectedQuotationForPrint.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{it.productName}</td>
                          <td className="p-2.5 text-center font-bold">{it.qty}</td>
                          <td className="p-2.5 text-center text-slate-600">{it.unit}</td>
                          <td className="p-2.5 text-right font-medium">{formatRupiah(it.price)}</td>
                          {selectedQuotationForPrint.items.some((item) => (item.discount || 0) > 0) && (
                            <td className="p-2.5 text-right text-red-600 font-bold">
                              {it.discount ? `- ${formatRupiah(it.discount)}` : "-"}
                            </td>
                          )}
                          <td className="p-2.5 text-right font-black">{formatRupiah(it.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Rincian Perhitungan & Terbilang */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2 text-xs">
                  {/* Kotak Terbilang & Rekening Bank */}
                  <div className="space-y-3 max-w-sm flex-1">
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px]">
                      <span className="font-bold text-amber-900 uppercase text-[10px] block mb-0.5">Terbilang:</span>
                      <p className="font-serif italic font-bold text-slate-800">
                        "{angkaTerbilang(selectedQuotationForPrint.grandTotal)} Rupiah"
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-[11px] space-y-1">
                      <p className="font-bold text-dstech-blue">Rekening Resmi Pembayaran PT. DSTech Smart Perkasa:</p>
                      {bankAccounts.filter((b) => b.status === "Aktif").map((acc) => (
                        <p key={acc.id} className="text-slate-700 text-[10px]">
                          • <strong>{acc.bankName}</strong>: {acc.accountNumber} a/n {acc.accountHolder} ({acc.branch})
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="space-y-1.5 sm:w-72 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Subtotal Barang & Jasa:</span>
                      <span className="font-bold text-slate-900">{formatRupiah(selectedQuotationForPrint.subtotal)}</span>
                    </div>
                    {selectedQuotationForPrint.discount > 0 && (
                      <div className="flex items-center justify-between text-red-600">
                        <span>Diskon Khusus:</span>
                        <span className="font-bold">- {formatRupiah(selectedQuotationForPrint.discount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-600">
                      <span>PPN ({selectedQuotationForPrint.taxRate}%):</span>
                      <span className="font-bold text-slate-900">{formatRupiah(selectedQuotationForPrint.taxAmount)}</span>
                    </div>
                    <div className="border-t-2 border-indigo-950 pt-2 flex items-center justify-between text-sm font-black text-slate-900">
                      <span className="text-indigo-900">TOTAL PENAWARAN:</span>
                      <span className="text-base text-emerald-600">{formatRupiah(selectedQuotationForPrint.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Syarat & Ketentuan Teknis Penawaran */}
                {selectedQuotationForPrint.terms && (
                  <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 text-xs space-y-1.5">
                    <h5 className="font-black text-slate-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Syarat & Ketentuan Teknis (Terms & Conditions):</span>
                    </h5>
                    <div className="text-[10px] text-slate-600 whitespace-pre-line leading-relaxed font-sans">
                      {selectedQuotationForPrint.terms}
                    </div>
                  </div>
                )}

                {/* Penutup Surat */}
                <div className="text-xs leading-relaxed text-slate-700">
                  <p>
                    Demikian surat penawaran harga ini kami sampaikan. Besar harapan kami agar usulan solusi teknologi ini dapat memenuhi ekspektasi dan menjadi awal kerjasama yang baik antara PT. DSTech Smart Perkasa dengan {selectedQuotationForPrint.customerOrg || selectedQuotationForPrint.customerName}. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
                  </p>
                </div>

                {/* Tanda Tangan Dual Approval (Klien & Direktur DSTech) */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-xs">
                  {/* Sisi Kiri: Penerima / Klien */}
                  <div className="flex flex-col justify-between h-52 border border-slate-200/80 rounded-xl p-3.5 bg-white/70 shadow-sm text-center">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Disetujui & Diterima Oleh,</p>
                      <p className="text-xs font-black text-slate-900 mt-1">
                        {selectedQuotationForPrint.customerOrg || selectedQuotationForPrint.customerName}
                      </p>
                    </div>

                    <div className="h-16 flex items-center justify-center text-slate-300 text-[10px] italic">
                      (Tanda Tangan, Nama Jelas & Stempel Klien)
                    </div>

                    <div className="pt-2 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-xs">
                        {selectedQuotationForPrint.customerName ? `( ${selectedQuotationForPrint.customerName} )` : "( ................................................................ )"}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        PIC / Purchasing / Manajer Terkait
                      </p>
                    </div>
                  </div>

                  {/* Sisi Kanan: Hormat Kami PT. DSTech Smart Perkasa */}
                  <div className="flex flex-col justify-between h-52 border border-slate-200/80 rounded-xl p-3.5 bg-white/70 shadow-sm text-center">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hormat Kami,</p>
                      <p className="text-xs font-black text-indigo-700 mt-0.5">PT. DSTech Smart Perkasa</p>
                    </div>

                    <div className="h-16 relative flex items-center justify-center">
                      {selectedQuotationForPrint.approvalStatus === "Disetujui & Sah" ? (
                        <>
                          {/* Stempel Bulat Digital Resmi PT DSTech */}
                          <div className="absolute right-3 w-16 h-16 rounded-full border-2 border-dashed border-indigo-600/50 flex flex-col items-center justify-center text-[7px] text-indigo-700 font-bold uppercase rotate-[-12deg] pointer-events-none bg-indigo-50/40">
                            <span className="font-black text-[6.5px]">PT. DSTECH</span>
                            <span className="text-[5.5px] tracking-tight">SMART PERKASA</span>
                            <span className="text-[5px] text-emerald-600 font-mono font-black mt-0.5">OFFICIAL SPH</span>
                          </div>

                          {/* Tanda Tangan Goresan / Gambar */}
                          {selectedQuotationForPrint.signatureImage ? (
                            <img
                              src={selectedQuotationForPrint.signatureImage}
                              alt="Tanda Tangan Digital"
                              className="max-h-16 max-w-[140px] object-contain relative z-10"
                            />
                          ) : (
                            <div className="font-serif italic text-lg text-slate-800 font-black relative z-10 select-none tracking-wider">
                              {selectedQuotationForPrint.approvedBy || "H. Agus Supriyadi"}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center border border-dashed border-amber-300 bg-amber-50/80 rounded-lg p-2 w-full">
                          <Clock className="w-4 h-4 text-amber-600 mb-0.5" />
                          <span className="text-[9px] font-black text-amber-800 uppercase">Menunggu Approval Direksi</span>
                          <button
                            type="button"
                            onClick={() => {
                              const sph = selectedQuotationForPrint;
                              setSelectedQuotationForPrint(null);
                              setSelectedInvoiceForApproval({
                                ...sph,
                                invoiceNumber: sph.quotationNumber,
                                dueDate: sph.validUntil,
                                paymentMethod: "SPH Proposal",
                                paymentStatus: sph.status,
                                paidAmount: 0,
                                remainingAmount: sph.grandTotal,
                                warehouseId: "dstech_wh_1",
                                branchId: "dstech_branch_1",
                                salesPerson: "DSTech Commercial Team",
                              } as any);
                              setIsApprovalModalOpen(true);
                            }}
                            className="mt-1 px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-bold shadow-sm flex items-center gap-1 cursor-pointer print:hidden"
                          >
                            <PenTool className="w-2.5 h-2.5" />
                            Approval SPH Sekarang
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-300">
                      <p className="font-bold text-slate-900 underline text-xs">
                        {selectedQuotationForPrint.approvedBy || financeSettings.signerName || "H. Agus Supriyadi, S.T., M.Kom."}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                        {selectedQuotationForPrint.approvedTitle || financeSettings.signerTitle || "Direktur Keuangan & Operasional"}
                      </p>
                      {selectedQuotationForPrint.approvalStatus === "Disetujui & Sah" && (
                        <p className="text-[8px] text-emerald-700 font-mono font-bold mt-0.5">
                          [VERIFIKASI: {selectedQuotationForPrint.verificationCode || "DST-SPH-202610-001"}]
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MASTER DATA - TAMBAH / EDIT KLIEN */}
      {isClientModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsClientModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dstech-blue">
                  Master Data Klien & Pelanggan
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  {editingClient ? "Edit Data Klien Rekanan" : "Tambah Klien Rekanan Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClientSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Perusahaan / Instansi / Individu:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT. Krakatau Posco Energy"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Klien:</label>
                  <select
                    value={clientForm.category}
                    onChange={(e) => setClientForm({ ...clientForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="B2B Industri">B2B Industri Pabrik</option>
                    <option value="Komersial & Hospitality">Komersial & Hospitality</option>
                    <option value="Instansi Pemerintah">Instansi Pemerintah / BUMN</option>
                    <option value="Residensial & Real Estate">Residensial & Real Estate</option>
                    <option value="Perorangan / Rumah Tinggal">Perorangan / Rumah Tinggal</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Klien:</label>
                  <select
                    value={clientForm.status}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, status: e.target.value as "VIP" | "Aktif" | "Prospek" })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="VIP">VIP Prioritas</option>
                    <option value="Prospek">Prospek Penawaran</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama PIC / Kontak Person:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Bambang (Procurement)"
                    value={clientForm.pic}
                    onChange={(e) => setClientForm({ ...clientForm, pic: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. WhatsApp / Telepon:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0812-9876-5432"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Klien:</label>
                  <input
                    type="email"
                    placeholder="procurement@perusahaan.com"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NPWP Perusahaan:</label>
                  <input
                    type="text"
                    placeholder="01.234.567.8-417.000"
                    value={clientForm.npwp}
                    onChange={(e) => setClientForm({ ...clientForm, npwp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Alamat Kantor / Pabrik:</label>
                  <input
                    type="text"
                    placeholder="Jl. Raya Kawasan Industri..."
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota / Wilayah:</label>
                  <input
                    type="text"
                    placeholder="Cilegon"
                    value={clientForm.city}
                    onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan / Spesifikasi Klien:</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan sistem keamanan yang digunakan, proyek berjalan..."
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingClient ? "Simpan Perubahan" : "Simpan Klien Baru"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: MASTER DATA - TAMBAH / EDIT SUPPLIER */}
      {isSupplierModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsSupplierModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Master Data Supplier & Vendor
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  {editingSupplier ? "Edit Data Supplier / Vendor" : "Tambah Supplier / Vendor Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplierSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Perusahaan Distributor / Vendor:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT. Hikvision Indonesia Mega Distributor"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Barang Pasokan:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: CCTV, NVR & Security Hardware"
                  value={supplierForm.category}
                  onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Sales / PIC Vendor:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibu Dewi (Key Account)"
                    value={supplierForm.pic}
                    onChange={(e) => setSupplierForm({ ...supplierForm, pic: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. WhatsApp / Telepon:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 021-5839-2000"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Termin Pembayaran (TOP):</label>
                  <select
                    value={supplierForm.paymentTerms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="Net 30 Hari">Net 30 Hari (Tempo 30 Hari)</option>
                    <option value="Net 14 Hari">Net 14 Hari (Tempo 14 Hari)</option>
                    <option value="COD (Cash on Delivery)">COD (Cash on Delivery)</option>
                    <option value="CBD (Cash Before Delivery)">CBD (Cash Before Delivery)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Kemitraan:</label>
                  <select
                    value={supplierForm.status}
                    onChange={(e) => setSupplierForm({ ...supplierForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="Mitra Utama">Mitra Utama</option>
                    <option value="Mitra Aktif">Mitra Aktif</option>
                    <option value="Mitra Lokal Cilegon">Mitra Lokal Cilegon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Rekening Bank Pembayaran PO (Transfer):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bank BCA: 541-098-7766 a/n PT Hikvision Distributor"
                  value={supplierForm.bankAccount}
                  onChange={(e) => setSupplierForm({ ...supplierForm, bankAccount: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Alamat Kantor / Gudang Vendor:</label>
                  <input
                    type="text"
                    placeholder="Kawasan Pergudangan / Jl. Raya..."
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota Asal:</label>
                  <input
                    type="text"
                    placeholder="Jakarta / Serang"
                    value={supplierForm.city}
                    onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan Vendor:</label>
                <textarea
                  rows={2}
                  placeholder="Ketentuan klaim garansi RMA, diskon volume, dll..."
                  value={supplierForm.notes}
                  onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingSupplier ? "Simpan Perubahan" : "Simpan Supplier Baru"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MASTER DATA: TAMBAH / EDIT TITIK GUDANG */}
      {isWarehouseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsWarehouseModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dstech-blue">
                  Master Data Titik Gudang & Logistik
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  {editingWarehouse ? "Edit Data Titik Gudang" : "Tambah Titik Gudang Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsWarehouseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouseSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Gudang:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: GD-01"
                    value={warehouseForm.code}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipe Gudang:</label>
                  <select
                    value={warehouseForm.type}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="Gudang Pusat">Gudang Pusat Logistik</option>
                    <option value="Gudang Transit">Gudang Transit Proyek</option>
                    <option value="Depo Distribusi">Depo Distribusi</option>
                    <option value="Unit Mobile">Unit Mobile / Service Van</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Titik Gudang:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gudang Pusat Cilegon"
                  value={warehouseForm.name}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Alamat Lokasi Gudang:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Industri Raya No. 12, Kawasan Industri Krakatau"
                    value={warehouseForm.address}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota:</label>
                  <input
                    type="text"
                    placeholder="Cilegon"
                    value={warehouseForm.city}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama PIC Gudang:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Hendra Setiawan"
                    value={warehouseForm.pic}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, pic: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. Kontak / WA PIC:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-3456-7890"
                    value={warehouseForm.phone}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Operasional:</label>
                  <select
                    value={warehouseForm.status}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Kapasitas Penuh">Kapasitas Penuh</option>
                    <option value="Renovasi">Renovasi / Maintenance</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valuasi Stok Awal (Rp):</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={warehouseForm.totalValuation}
                    onChange={(e) =>
                      setWarehouseForm({ ...warehouseForm, totalValuation: Number(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Gudang:</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan fasilitas gudang, kapasitas palet, jam operasional..."
                  value={warehouseForm.notes}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWarehouseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingWarehouse ? "Simpan Perubahan Gudang" : "Simpan Titik Gudang"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MASTER DATA: TAMBAH / EDIT KANTOR CABANG */}
      {isBranchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsBranchModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">
                  Jaringan Kantor Cabang DSTech
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  {editingBranch ? "Edit Data Kantor Cabang" : "Tambah Kantor Cabang Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranchSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Cabang:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: BR-02"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-purple-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status / Tipe Kantor:</label>
                  <select
                    value={branchForm.status}
                    onChange={(e) => setBranchForm({ ...branchForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="Kantor Pusat Operasional">Kantor Pusat Operasional</option>
                    <option value="Kantor Cabang">Kantor Cabang</option>
                    <option value="Kantor Perwakilan Wilayah">Kantor Perwakilan Wilayah</option>
                    <option value="Service Point">Service Point</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Kantor Cabang:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kantor Cabang Serang - Banten"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota / Domisili:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Serang"
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cakupan Wilayah (Coverage):</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kota & Kab. Serang, Anyer"
                    value={branchForm.coverage}
                    onChange={(e) => setBranchForm({ ...branchForm, coverage: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap Kantor:</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Ahmad Yani No. 88, Serang"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kepala Cabang (Branch Manager):</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ahmad Fauzi, S.T."
                    value={branchForm.head}
                    onChange={(e) => setBranchForm({ ...branchForm, head: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. Telepon / Hotline Cabang:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0254-889911 / 0812-xxx"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Resmi Cabang:</label>
                <input
                  type="email"
                  placeholder="cabang.serang@dstechsmart.com"
                  value={branchForm.email}
                  onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Operasional Cabang:</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan tim teknisi cabang, armada mobil, dll..."
                  value={branchForm.notes}
                  onChange={(e) => setBranchForm({ ...branchForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingBranch ? "Simpan Perubahan Cabang" : "Simpan Kantor Cabang"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: BUAT PURCHASE ORDER (PO) BARU */}
      {isNewPoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsNewPoModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Formulir Pengadaan & Pembelian
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Terbitkan Purchase Order (PO) Baru
                </h3>
              </div>
              <button
                onClick={() => setIsNewPoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePoSubmit} className="space-y-4 text-xs">
              {/* Quick Select Supplier from Master Data */}
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-amber-800 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Pilih dari Master Data Supplier Mitra:</span>
                  </label>
                  <span className="text-[10px] text-amber-600 font-medium">Auto-fill Nama & Kontak Sales</span>
                </div>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const found = suppliers.find((s) => s.id === val);
                    if (found) {
                      setPoForm((prev) => ({
                        ...prev,
                        supplierName: found.name,
                        supplierContact: `${found.pic} (${found.phone})`,
                      }));
                    }
                  }}
                  defaultValue=""
                  className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Pilih dari Direktori Supplier (atau ketik manual di bawah) --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category}) — {s.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Supplier / Vendor:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama distributor / toko..."
                    value={poForm.supplierName}
                    onChange={(e) => setPoForm({ ...poForm, supplierName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kontak Sales Vendor:</label>
                  <input
                    type="text"
                    placeholder="PIC / No Telp sales..."
                    value={poForm.supplierContact}
                    onChange={(e) => setPoForm({ ...poForm, supplierContact: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Pesan:</label>
                  <input
                    type="date"
                    required
                    value={poForm.date}
                    onChange={(e) => setPoForm({ ...poForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimasi Pengiriman Tiba:</label>
                  <input
                    type="date"
                    required
                    value={poForm.expectedDelivery}
                    onChange={(e) => setPoForm({ ...poForm, expectedDelivery: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Pembayaran:</label>
                  <select
                    value={poForm.paymentStatus}
                    onChange={(e) => setPoForm({ ...poForm, paymentStatus: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="Hutang Usaha">Hutang Usaha (Jatuh Tempo 30 Hari)</option>
                    <option value="Lunas">Lunas (Transfer Cash)</option>
                    <option value="Uang Muka 50%">Uang Muka (DP 50%)</option>
                  </select>
                </div>
              </div>

              {/* Items Table Repeater */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                    Daftar Barang yang Dipesan ({poForm.items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPoItem}
                    className="text-amber-700 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Baris Barang</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {poForm.items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Nama Barang / Sparepart..."
                          value={it.productName}
                          onChange={(e) => handlePoItemChange(idx, "productName", e.target.value)}
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
                          onChange={(e) => handlePoItemChange(idx, "qty", Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Satuan"
                          value={it.unit}
                          onChange={(e) => handlePoItemChange(idx, "unit", e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          required
                          placeholder="Harga Satuan (Rp)"
                          value={it.price}
                          onChange={(e) => handlePoItemChange(idx, "price", Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {poForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePoItem(idx)}
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
                const { subtotal, taxAmount, grandTotal } = calculatePoTotals();
                return (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Subtotal Belanja:</span>
                      <span className="font-bold">{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>PPN Masukan (11%):</span>
                      <span className="font-bold">{formatRupiah(taxAmount)}</span>
                    </div>
                    <div className="border-t border-white/20 pt-2 flex items-center justify-between text-base font-black">
                      <span className="text-amber-400">TOTAL BELANJA PO:</span>
                      <span className="text-xl text-emerald-400">{formatRupiah(grandTotal)}</span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan PO / Petunjuk Pengiriman:</label>
                <textarea
                  rows={2}
                  placeholder="Kirim ke Gudang Utama Cilegon, instruksi ekspedisi..."
                  value={poForm.notes}
                  onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewPoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Terbitkan Purchase Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TERIMA PEMBAYARAN FAKTUR */}
      {isPayInvoiceModalOpen && selectedInvoiceForPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsPayInvoiceModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Terima Pembayaran Faktur</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {selectedInvoiceForPayment.invoiceNumber} — {selectedInvoiceForPayment.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPayInvoiceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Tagihan */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Tagihan Kontrak:</span>
                <span className="font-black text-slate-900 font-mono">
                  {formatRupiah(selectedInvoiceForPayment.grandTotal)}
                </span>
              </div>
              {selectedInvoiceForPayment.invoiceType === "DP" && (
                <div className="flex items-center justify-between text-amber-800 font-bold bg-amber-50 p-2 rounded-xl border border-amber-200">
                  <span>Tagihan Uang Muka (DP {selectedInvoiceForPayment.dpPercentage || 50}%):</span>
                  <span className="font-mono">{formatRupiah(selectedInvoiceForPayment.dpAmount || 0)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-600">
                <span>Sudah Pernah Dibayar:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  {formatRupiah(selectedInvoiceForPayment.paidAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-red-600 font-black border-t border-slate-200 pt-1.5">
                <span>Sisa Piutang Saat Ini:</span>
                <span className="font-mono text-sm">{formatRupiah(selectedInvoiceForPayment.remainingAmount)}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Nominal Pembayaran Masuk (Rp):</label>
                  <div className="flex items-center gap-1">
                    {selectedInvoiceForPayment.invoiceType === "DP" &&
                      (Number(selectedInvoiceForPayment.dpPaidAmount) || 0) <
                        (Number(selectedInvoiceForPayment.dpAmount) || 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            const dpRem = Math.max(
                              0,
                              (Number(selectedInvoiceForPayment.dpAmount) || 0) -
                                (Number(selectedInvoiceForPayment.dpPaidAmount) || 0)
                            );
                            setPaymentForm({ ...paymentForm, amount: dpRem });
                          }}
                          className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded font-bold cursor-pointer"
                        >
                          Bayar DP
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentForm({
                          ...paymentForm,
                          amount: selectedInvoiceForPayment.remainingAmount,
                        })
                      }
                      className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded font-bold cursor-pointer"
                    >
                      Bayar Lunas Semua
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min={1}
                  max={selectedInvoiceForPayment.remainingAmount}
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-black text-sm text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">Rekening Bank Tujuan Penerimaan:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPayInvoiceModalOpen(false);
                      setIsBankAccountsModalOpen(true);
                    }}
                    className="text-[10px] text-dstech-blue hover:underline font-bold cursor-pointer"
                  >
                    ⚙️ Atur Rekening
                  </button>
                </div>
                <select
                  value={paymentForm.paymentMethod || getDefaultBankAccLabel()}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                >
                  {bankAccounts
                    .filter((b) => b.status === "Aktif")
                    .map((acc) => (
                      <option key={acc.id} value={`${acc.bankName} - ${acc.accountNumber} (${acc.accountHolder})`}>
                        {acc.bankName} - {acc.accountNumber} ({acc.accountHolder}) {acc.isDefault ? "★ (Utama)" : ""}
                      </option>
                    ))}
                  <option value="Kas Tunai Operasional">Kas Tunai Operasional</option>
                  <option value="Kas Kecil (Petty Cash Kantor)">Kas Kecil (Petty Cash Kantor)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Penerimaan:</label>
                <input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan / Catatan Bukti Transfer:</label>
                <input
                  type="text"
                  placeholder="Contoh: Transfer termin 1 via Mandiri ref TR-99882..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md cursor-pointer flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Simpan & Bukukan Kas Masuk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT FAKTUR PENJUALAN */}
      {isEditSaleModalOpen && editingSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsEditSaleModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                  Perbarui Data Faktur
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Edit Faktur: {editingSale.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsEditSaleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSaleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Klien / Pelanggan:</label>
                  <input
                    type="text"
                    required
                    value={editingSale.customerName}
                    onChange={(e) => setEditingSale({ ...editingSale, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp / Telp:</label>
                  <input
                    type="text"
                    value={editingSale.customerPhone}
                    onChange={(e) => setEditingSale({ ...editingSale, customerPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">Metode & Rekening Pembayaran:</label>
                    <button
                      type="button"
                      onClick={() => setIsBankAccountsModalOpen(true)}
                      className="text-[10px] text-dstech-blue hover:underline font-bold cursor-pointer"
                    >
                      ⚙️ Rekening
                    </button>
                  </div>
                  <select
                    value={editingSale.paymentMethod}
                    onChange={(e) => setEditingSale({ ...editingSale, paymentMethod: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    {bankAccounts
                      .filter((b) => b.status === "Aktif")
                      .map((b) => (
                        <option key={b.id} value={`Transfer ${b.bankName} (${b.accountNumber} - ${b.accountHolder})`}>
                          Transfer {b.bankName} ({b.accountNumber} - {b.accountHolder}) {b.isDefault ? "★ (Utama)" : ""}
                        </option>
                      ))}
                    <option value="Tunai / Kas Langsung">Tunai / Kas Langsung</option>
                    <option value="Tempo 14 Hari">Tempo 14 Hari</option>
                    <option value="Tempo 30 Hari">Tempo 30 Hari</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Faktur:</label>
                  <input
                    type="date"
                    required
                    value={editingSale.date}
                    onChange={(e) => setEditingSale({ ...editingSale, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jatuh Tempo:</label>
                  <input
                    type="date"
                    required
                    value={editingSale.dueDate}
                    onChange={(e) => setEditingSale({ ...editingSale, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Pemasangan / Proyek:</label>
                <input
                  type="text"
                  value={editingSale.customerAddress}
                  onChange={(e) => setEditingSale({ ...editingSale, customerAddress: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              {/* Items Table Repeater */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                    Daftar Produk / Jasa ({editingSale.items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEditSaleItem}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editingSale.items.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          value={it.productName}
                          onChange={(e) => handleEditSaleItemChange(idx, "productName", e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          required
                          value={it.qty}
                          onChange={(e) => handleEditSaleItemChange(idx, "qty", Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) => handleEditSaleItemChange(idx, "unit", e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          required
                          value={it.price}
                          onChange={(e) => handleEditSaleItemChange(idx, "price", Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {editingSale.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEditSaleItem(idx)}
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
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span className="font-bold">{formatRupiah(editingSale.subtotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Diskon Potongan (Rp):</label>
                    <input
                      type="number"
                      min={0}
                      value={editingSale.discount || 0}
                      onChange={(e) => {
                        const discount = Number(e.target.value);
                        const afterDiscount = Math.max(0, editingSale.subtotal - discount);
                        const taxAmount = (afterDiscount * Number(editingSale.taxRate || 0)) / 100;
                        const grandTotal = afterDiscount + taxAmount;
                        setEditingSale({
                          ...editingSale,
                          discount,
                          taxAmount,
                          grandTotal,
                          remainingAmount: Math.max(0, grandTotal - (Number(editingSale.paidAmount) || 0)),
                        });
                      }}
                      className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">PPN (%):</label>
                    <input
                      type="number"
                      min={0}
                      value={editingSale.taxRate || 11}
                      onChange={(e) => {
                        const taxRate = Number(e.target.value);
                        const afterDiscount = Math.max(0, editingSale.subtotal - Number(editingSale.discount || 0));
                        const taxAmount = (afterDiscount * taxRate) / 100;
                        const grandTotal = afterDiscount + taxAmount;
                        setEditingSale({
                          ...editingSale,
                          taxRate,
                          taxAmount,
                          grandTotal,
                          remainingAmount: Math.max(0, grandTotal - (Number(editingSale.paidAmount) || 0)),
                        });
                      }}
                      className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Pajak PPN ({editingSale.taxRate}%):</span>
                  <span className="font-bold">{formatRupiah(editingSale.taxAmount)}</span>
                </div>
                <div className="border-t border-white/20 pt-2 flex items-center justify-between text-base font-black">
                  <span className="text-amber-400">GRAND TOTAL:</span>
                  <span className="text-xl text-emerald-400">{formatRupiah(editingSale.grandTotal)}</span>
                </div>

                {/* Tipe Faktur Standar vs DP */}
                <div className="pt-2 border-t border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-300">Tipe Faktur:</span>
                    <div className="flex rounded-lg overflow-hidden border border-slate-700 p-0.5 bg-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingSale({ ...editingSale, invoiceType: "Standar" })}
                        className={`px-2.5 py-1 text-[10px] font-black rounded cursor-pointer ${
                          editingSale.invoiceType === "Standar" ? "bg-dstech-blue text-white" : "text-slate-400"
                        }`}
                      >
                        Standar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingSale({
                            ...editingSale,
                            invoiceType: "DP",
                            dpPercentage: editingSale.dpPercentage || 50,
                            dpAmount: Math.round(editingSale.grandTotal * ((editingSale.dpPercentage || 50) / 100)),
                          })
                        }
                        className={`px-2.5 py-1 text-[10px] font-black rounded cursor-pointer ${
                          editingSale.invoiceType === "DP" ? "bg-amber-500 text-slate-900" : "text-slate-400"
                        }`}
                      >
                        Pengajuan DP
                      </button>
                    </div>
                  </div>

                  {editingSale.invoiceType === "DP" && (
                    <div className="p-2 rounded-xl bg-slate-800 border border-amber-500/40 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Persen DP (%):</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={editingSale.dpPercentage || 50}
                            onChange={(e) => {
                              const pct = Number(e.target.value);
                              setEditingSale({
                                ...editingSale,
                                dpPercentage: pct,
                                dpAmount: Math.round(editingSale.grandTotal * (pct / 100)),
                              });
                            }}
                            className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Nilai DP (Rp):</label>
                          <input
                            type="number"
                            min={0}
                            value={editingSale.dpAmount || 0}
                            onChange={(e) =>
                              setEditingSale({
                                ...editingSale,
                                dpAmount: Number(e.target.value),
                              })
                            }
                            className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Catatan DP:</label>
                        <input
                          type="text"
                          value={editingSale.dpNotes || ""}
                          onChange={(e) => setEditingSale({ ...editingSale, dpNotes: e.target.value })}
                          className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <label className="text-[10px] text-slate-400 block mb-1">Total Sudah Dibayar (Rp):</label>
                  <input
                    type="number"
                    min={0}
                    max={editingSale.grandTotal}
                    value={editingSale.paidAmount || 0}
                    onChange={(e) => {
                      const paid = Number(e.target.value);
                      setEditingSale({
                        ...editingSale,
                        paidAmount: paid,
                        remainingAmount: Math.max(0, editingSale.grandTotal - paid),
                      });
                    }}
                    className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-emerald-300 text-sm font-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan:</label>
                <textarea
                  rows={2}
                  value={editingSale.notes}
                  onChange={(e) => setEditingSale({ ...editingSale, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditSaleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Faktur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN REKENING BANK DSTECH */}
      {isBankAccountsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsBankAccountsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Pengaturan Rekening Bank DSTech</h3>
                  <p className="text-[10px] text-slate-400">
                    Rekening ini otomatis dicetak pada Kop Faktur & instruksi transfer klien
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBankAccountsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List Rekening Aktif */}
            <div className="space-y-2">
              <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">
                Daftar Rekening Resmi ({bankAccounts.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bankAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-dstech-blue">{acc.bankName}</span>
                      {acc.isDefault ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                          Utama (Default)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">{acc.status}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-mono font-bold text-sm text-slate-900">{acc.accountNumber}</p>
                      <p className="text-[11px] text-slate-600 font-medium">a/n {acc.accountHolder}</p>
                      <p className="text-[10px] text-slate-400">Cabang: {acc.branch}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBankAccount(acc);
                          setBankAccountForm({
                            bankName: acc.bankName,
                            accountNumber: acc.accountNumber,
                            accountHolder: acc.accountHolder,
                            branch: acc.branch,
                            isDefault: Boolean(acc.isDefault),
                            status: acc.status,
                          });
                        }}
                        className="text-[11px] text-amber-600 hover:text-amber-700 font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                      {bankAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteBankAccount(acc.id, acc.bankName)}
                          className="text-[11px] text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Tambah / Edit Rekening */}
            <form
              onSubmit={handleSaveBankAccount}
              className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3 text-xs"
            >
              <h4 className="font-black text-xs text-dstech-blue flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>{editingBankAccount ? "Edit Rekening Bank" : "Tambah Rekening Baru"}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Bank:</label>
                  <select
                    value={bankAccountForm.bankName}
                    onChange={(e) => setBankAccountForm({ ...bankAccountForm, bankName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank BCA">Bank BCA</option>
                    <option value="Bank BNI">Bank BNI</option>
                    <option value="Bank BRI">Bank BRI</option>
                    <option value="Bank BSI">Bank Syariah Indonesia (BSI)</option>
                    <option value="Bank BJB">Bank BJB Banten</option>
                    <option value="Bank CIMB Niaga">Bank CIMB Niaga</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Rekening:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 163-00-1122334-5"
                    value={bankAccountForm.accountNumber}
                    onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Atas Nama (Holder):</label>
                  <input
                    type="text"
                    required
                    placeholder="PT. DSTech Smart Perkasa"
                    value={bankAccountForm.accountHolder}
                    onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountHolder: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kantor Cabang (KCP/KCU):</label>
                  <input
                    type="text"
                    placeholder="Contoh: KCP Cilegon City Square"
                    value={bankAccountForm.branch}
                    onChange={(e) => setBankAccountForm({ ...bankAccountForm, branch: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bankAccountForm.isDefault}
                    onChange={(e) => setBankAccountForm({ ...bankAccountForm, isDefault: e.target.checked })}
                    className="rounded text-dstech-blue"
                  />
                  <span className="font-bold text-slate-700 text-xs">Jadikan Rekening Utama</span>
                </label>

                <div className="flex items-center gap-2">
                  {editingBankAccount && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBankAccount(null);
                        setBankAccountForm({
                          bankName: "Bank Mandiri",
                          accountNumber: "",
                          accountHolder: "PT. DSTech Smart Perkasa",
                          branch: "Cilegon",
                          isDefault: false,
                          status: "Aktif",
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-200 font-bold"
                    >
                      Batal Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold cursor-pointer shadow-sm"
                  >
                    {editingBankAccount ? "Simpan Perubahan" : "Tambah Rekening"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN KOP SURAT & WATERMARK BACKGROUND */}
      {isSettingsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsSettingsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-dstech-blue">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Pengaturan Kop Surat & Background</h3>
                  <p className="text-[10px] text-slate-400">
                    Ganti template gambar kop surat dan watermark cetak resmi DSTech
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pratinjau Gambar Saat Ini */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-black uppercase tracking-wider text-dstech-blue">
                  Preview Resolusi Pas Dokumen A4
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {tempSettings.letterheadEnabled ? "Kop Aktif" : "Kop Nonaktif"}
                </span>
              </div>

              <div className="w-48 h-64 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden shadow-inner relative bg-white flex items-center justify-center p-1">
                {tempSettings.letterheadUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tempSettings.letterheadUrl}
                    alt="Kop Surat DSTech"
                    className="w-full h-full object-contain"
                    style={{ opacity: tempSettings.letterheadEnabled ? 1 : 0.25 }}
                  />
                ) : (
                  <span className="text-slate-400 text-xs font-bold">Belum ada gambar</span>
                )}
              </div>

              {/* Tombol Unggah File Langsung */}
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center pt-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dstech-blue hover:bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-md transition">
                  <Download className="w-3.5 h-3.5" />
                  <span>Unggah File Kop Surat (PNG/JPG)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleLetterheadFileUpload}
                    className="hidden"
                  />
                </label>
                {tempSettings.letterheadUrl && tempSettings.letterheadUrl !== "/kop_surat_dstech.jpg" && (
                  <button
                    type="button"
                    onClick={() =>
                      setTempSettings((prev) => ({
                        ...prev,
                        letterheadUrl: "/kop_surat_dstech.jpg",
                        letterheadEnabled: true,
                      }))
                    }
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition"
                  >
                    Reset Kop Standar
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                Format: PNG / JPG / WebP transparan atau ber-header kop surat. Resolusi rekomendasi proporsional lembar A4.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Tampilkan Kop Surat & Background Resmi</p>
                  <p className="text-[10px] text-slate-500">
                    Terapkan latar belakang kop surat pada lembar cetak penawaran SPH, faktur tagihan, dan PO
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={tempSettings.letterheadEnabled}
                  onChange={(e) => setTempSettings({ ...tempSettings, letterheadEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-dstech-blue cursor-pointer"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Path / URL / Sumber Gambar Kop Surat:
                </label>
                <input
                  type="text"
                  required
                  value={tempSettings.letterheadUrl}
                  onChange={(e) => setTempSettings({ ...tempSettings, letterheadUrl: e.target.value })}
                  placeholder="/kop_surat_dstech.jpg atau unggah file di atas"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Tingkat Transparansi Watermark:</label>
                  <span className="font-mono font-bold text-dstech-blue">
                    {Math.round((tempSettings.watermarkOpacity || 0.15) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.02"
                  value={tempSettings.watermarkOpacity}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, watermarkOpacity: parseFloat(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Sangat Transparan (5%)</span>
                  <span>Standar (15%)</span>
                  <span>Sangat Jelas (60%)</span>
                </div>
              </div>

              {/* Tombol Preset Cepat */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-700 block">Pilihan Preset Background Cepat:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setTempSettings((prev) => ({
                        ...prev,
                        letterheadUrl: "/kop_surat_dstech.jpg",
                        letterheadEnabled: true,
                        watermarkOpacity: 0.15,
                      }))
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                  >
                    Kop Resmi Standar (15%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempSettings((prev) => ({ ...prev, watermarkOpacity: 0.08 }))}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                  >
                    Watermark Lembut (8%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempSettings((prev) => ({ ...prev, watermarkOpacity: 0.25 }))}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                  >
                    Watermark Jelas (25%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTempSettings((prev) => ({
                        ...prev,
                        letterheadEnabled: false,
                      }))
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] cursor-pointer"
                  >
                    Nonaktifkan Kop
                  </button>
                </div>
              </div>

              {/* Penandatangan Dokumen Resmi DSTech */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Penandatangan Resmi Dokumen (Direksi DSTech):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Direktur Penandatangan:</label>
                    <input
                      type="text"
                      value={tempSettings.signerName || "H. Agus Supriyadi, S.T., M.Kom."}
                      onChange={(e) => setTempSettings({ ...tempSettings, signerName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jabatan Resmi:</label>
                    <input
                      type="text"
                      value={tempSettings.signerTitle || "Direktur Keuangan & Operasional"}
                      onChange={(e) => setTempSettings({ ...tempSettings, signerTitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan Pengaturan Kop Surat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL APPROVAL & TANDA TANGAN DIGITAL DOKUMEN */}
      {isApprovalModalOpen && selectedInvoiceForApproval && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsApprovalModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Approval & Tanda Tangan Digital</h3>
                  <p className="text-xs text-slate-500">
                    Pengesahan Resmi Faktur {selectedInvoiceForApproval.invoiceNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Ringkasan Faktur yang dimintakan approval */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Klien / Penerima:</span>
                  <p className="font-black text-slate-900 text-xs">{selectedInvoiceForApproval.customerName}</p>
                  <p className="text-[10px] text-slate-500">{selectedInvoiceForApproval.customerPhone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Nilai Faktur:</span>
                  <p className="font-black text-dstech-blue text-sm">
                    {formatRupiah(selectedInvoiceForApproval.grandTotal)}
                  </p>
                  {selectedInvoiceForApproval.invoiceType === "DP" && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      Tagihan DP {selectedInvoiceForApproval.dpPercentage}%: {formatRupiah(selectedInvoiceForApproval.dpAmount || 0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tab Metode Tanda Tangan */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Pilih Metode Tanda Tangan:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setApprovalMode("canvas")}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      approvalMode === "canvas"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-200"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    ✍️ Gores Layar
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalMode("master")}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      approvalMode === "master"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-200"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🛡️ Tanda Tangan Master
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalMode("upload")}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      approvalMode === "upload"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-200"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    📁 Upload Gambar
                  </button>
                </div>
              </div>

              {/* Mode 1: Canvas Drawing Signature Pad */}
              {approvalMode === "canvas" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Tanda tangani langsung di bawah ini (Touch / Mouse):</span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      Hapus Goresan
                    </button>
                  </div>
                  <div className="relative border-2 border-dashed border-indigo-300 rounded-xl bg-slate-50/50 p-1 flex justify-center items-center shadow-inner">
                    <canvas
                      ref={canvasRef}
                      width={480}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-40 bg-white rounded-lg cursor-crosshair touch-none"
                    />
                    {!hasDrawn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
                        ✍️ Bubuhkan tanda tangan Anda di area ini
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    *Goresan digital akan dienkode dan dibubuhkan secara otomatis pada faktur cetak resmi.
                  </p>
                </div>
              )}

              {/* Mode 2: Master Stored Signature */}
              {approvalMode === "master" && (
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 text-center space-y-2">
                  <p className="text-[11px] text-slate-600">
                    Menggunakan tanda tangan digital tersimpan Direktur PT DSTech Smart Perkasa:
                  </p>
                  <div className="py-2 flex items-center justify-center">
                    {financeSettings.masterSignatureUrl ? (
                      <img
                        src={financeSettings.masterSignatureUrl}
                        alt="Master Signature"
                        className="max-h-16 object-contain"
                      />
                    ) : (
                      <div className="font-serif italic text-2xl font-black text-slate-800 tracking-wider">
                        {signerNameInput || "H. Agus Supriyadi"}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Tanda tangan master ini dapat disesuaikan pada menu Pengaturan Kop Surat & Dokumen.
                  </p>
                </div>
              )}

              {/* Mode 3: Upload Signature File */}
              {approvalMode === "upload" && (
                <div className="space-y-2">
                  <label className="block text-slate-700 font-bold">Unggah Berkas Tanda Tangan (PNG Transparan / JPG):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureFileUpload}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {uploadedSignatureBase64 && (
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center">
                      <img
                        src={uploadedSignatureBase64}
                        alt="Pratinjau Tanda Tangan"
                        className="max-h-20 max-w-[200px] object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Form Identitas Penandatangan */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Penandatangan:</label>
                  <input
                    type="text"
                    value={signerNameInput}
                    onChange={(e) => setSignerNameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Nama Direktur..."
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jabatan:</label>
                  <input
                    type="text"
                    value={signerTitleInput}
                    onChange={(e) => setSignerTitleInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Jabatan Resmi..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Persetujuan (Opsional):</label>
                <input
                  type="text"
                  value={approvalNotesInput}
                  onChange={(e) => setApprovalNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Catatan approval..."
                />
              </div>

              {/* Keabsahan Sistem Info */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-[11px] text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Keabsahan Dokumen Digital Terlindungi</p>
                  <p className="text-[10px] text-emerald-600">
                    Sistem akan membubuhkan Stempel Digital Resmi PT DSTech Smart Perkasa & kode verifikasi unik otomatis.
                  </p>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApprovalModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApproveInvoice}
                  disabled={isSubmittingApproval}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingApproval ? "Memproses Approval..." : "Setujui & Sahkan Faktur Sekarang"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
