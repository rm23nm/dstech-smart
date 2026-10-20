"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  AlertTriangle,
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
  ClipboardCheck,
  Tag,
  Percent,
  MessageSquare,
  MessageCircle,
  Copy,
  ExternalLink,
  Share2,
  ArrowUpDown,
  XCircle,
  Ban,
} from "lucide-react";

interface ProductCatalogItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  stock: number;
  unit?: string;
  commission?: string;
  commissionRate?: number;
  commissionType?: string;
  image?: string;
  desc?: string;
  warehouseStock?: Record<string, number>;
}

interface SaleItem {
  id: string;
  productId?: string;
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
  discountType?: "fixed" | "percent";
  discountPercent?: number;
  discountLabel?: string;
  revision?: number;
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
  productId?: string;
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
  warehouseId?: string;
  branchId?: string;
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
  discountType?: "fixed" | "percent";
  discountPercent?: number;
  discountLabel?: string;
  revision?: number;
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
  letterheadPaddingTop?: number;
  letterheadPaddingBottom?: number;
  letterheadFitMode?: "fill" | "cover" | "contain" | "bleed";
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
  status: "Draf" | "Dalam Pengiriman" | "Diterima & Lunas" | "Dibatalkan" | string;
  paymentStatus: string;
  warehouseId: string;
  notes: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedTitle?: string;
  approvedAt?: string;
  verificationCode?: string;
  signatureImage?: string;
  approvalNotes?: string;
}

interface SalesReturn {
  id: string;
  returnNumber: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
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
  notes?: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedTitle?: string;
  approvedAt?: string;
  verificationCode?: string;
  signatureImage?: string;
  approvalNotes?: string;
}

interface PurchaseReturn {
  id: string;
  returnNumber: string;
  poNumber: string;
  supplierName: string;
  supplierContact?: string;
  supplierAddress?: string;
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
  notes?: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedTitle?: string;
  approvedAt?: string;
  verificationCode?: string;
  signatureImage?: string;
  approvalNotes?: string;
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
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
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
  const [poSearchQuery, setPoSearchQuery] = useState<string>("");
  const [poStatusFilter, setPoStatusFilter] = useState<string>("Semua");
  const [isEditPoModalOpen, setIsEditPoModalOpen] = useState<boolean>(false);
  const [editingPo, setEditingPo] = useState<PurchaseOrder | null>(null);
  const [editPoForm, setEditPoForm] = useState<{
    id: string;
    poNumber: string;
    supplierName: string;
    supplierContact: string;
    date: string;
    expectedDelivery: string;
    status: string;
    paymentStatus: string;
    warehouseId: string;
    notes: string;
    items: PurchaseItem[];
  }>({
    id: "",
    poNumber: "",
    supplierName: "",
    supplierContact: "",
    date: "",
    expectedDelivery: "",
    status: "Draf",
    paymentStatus: "Hutang Usaha",
    warehouseId: "dstech_wh_1",
    notes: "",
    items: [],
  });
  const [selectedPoForApproval, setSelectedPoForApproval] = useState<PurchaseOrder | null>(null);
  const [isApprovalPoModalOpen, setIsApprovalPoModalOpen] = useState<boolean>(false);
  const [selectedPoForPrint, setSelectedPoForPrint] = useState<PurchaseOrder | null>(null);
  const [isNewCashModalOpen, setIsNewCashModalOpen] = useState<boolean>(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SaleInvoice | null>(null);
  const [printBillingStage, setPrintBillingStage] = useState<"DP" | "Pelunasan" | "Full">("DP");
  const [printTwoPage, setPrintTwoPage] = useState<boolean>(true);

  const handleOpenPrintInvoice = (invoice: SaleInvoice, stage?: "DP" | "Pelunasan" | "Full") => {
    if (stage) {
      setPrintBillingStage(stage);
    } else if (invoice.invoiceType === "DP") {
      const isDpPaid = (Number(invoice.dpPaidAmount) || 0) >= (Number(invoice.dpAmount) || 0) || invoice.paymentStatus?.includes("DP Lunas");
      setPrintBillingStage(isDpPaid && invoice.remainingAmount > 0 ? "Pelunasan" : "DP");
    } else {
      setPrintBillingStage("Full");
    }
    setSelectedInvoiceForPrint(invoice);
  };

  // BAST (Berita Acara Serah Terima Pekerjaan Proyek) States
  const [selectedSaleForBast, setSelectedSaleForBast] = useState<SaleInvoice | null>(null);
  const [isBastModalOpen, setIsBastModalOpen] = useState<boolean>(false);
  const [isBastConfigExpanded, setIsBastConfigExpanded] = useState<boolean>(false);
  const [bastConfig, setBastConfig] = useState<{
    bastNumber: string;
    bastDate: string;
    projectLocation: string;
    projectName: string;
    handedByName: string;
    handedByTitle: string;
    receivedByName: string;
    receivedByTitle: string;
    warrantyHardware: string;
    warrantyMaintenance: string;
    notes: string;
    includeDspSignature: boolean;
  }>({
    bastNumber: "",
    bastDate: new Date().toISOString().split("T")[0],
    projectLocation: "",
    projectName: "Pengadaan & Instalasi Sistem Keamanan & IT Infrastructure",
    handedByName: "Ahmad Romadhoni",
    handedByTitle: "Direktur PT. DSTech Smart Perkasa",
    receivedByName: "",
    receivedByTitle: "Penanggung Jawab / Klien",
    warrantyHardware: "2 (dua) tahun garansi resmi unit pabrikan",
    warrantyMaintenance: "6 (enam) bulan pemeliharaan teknis PT. DSTech Smart Perkasa",
    notes: "Seluruh perangkat dan instalasi telah melalui tahapan uji fungsi (commissioning test) bersama dan dinyatakan dalam kondisi 100% lengkap, baik, dan beroperasi normal.",
    includeDspSignature: true,
  });

  const handleOpenBastModal = (sale: SaleInvoice) => {
    const invClean = sale.invoiceNumber ? sale.invoiceNumber.replace(/^INV-/, "") : "001";
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const romanMonth = romanMonths[new Date().getMonth()] || "X";
    const currentYear = new Date().getFullYear();

    setBastConfig({
      bastNumber: `BAST/DSP/${romanMonth}/${currentYear}/${invClean}`,
      bastDate: new Date().toISOString().split("T")[0],
      projectLocation: sale.customerAddress || "Lokasi Proyek Klien",
      projectName: `Pengadaan & Instalasi - ${sale.customerName || "Proyek Klien"}`,
      handedByName: financeSettings.signerName || "Ahmad Romadhoni",
      handedByTitle: financeSettings.signerTitle || "Direktur PT. DSTech Smart Perkasa",
      receivedByName: sale.customerName || "Bapak/Ibu Pimpinan",
      receivedByTitle: "Penanggung Jawab / Klien",
      warrantyHardware: "2 (dua) tahun garansi resmi unit pabrikan",
      warrantyMaintenance: "6 (enam) bulan pemeliharaan teknis PT. DSTech Smart Perkasa",
      notes: "Seluruh perangkat dan instalasi telah melalui tahapan uji fungsi (commissioning test) bersama dan dinyatakan dalam kondisi 100% lengkap, baik, dan beroperasi normal.",
      includeDspSignature: true,
    });
    setSelectedSaleForBast(sale);
    setIsBastModalOpen(true);
  };

  // Surat Jalan Pengiriman Material (Delivery Order / Dispatch Note) States
  const [selectedSaleForDelivery, setSelectedSaleForDelivery] = useState<SaleInvoice | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState<boolean>(false);
  const [isDeliveryConfigExpanded, setIsDeliveryConfigExpanded] = useState<boolean>(false);
  const [deliveryConfig, setDeliveryConfig] = useState<{
    doNumber: string;
    doDate: string;
    originWarehouse: string;
    destinationAddress: string;
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    receivedByName: string;
    receivedByPhone: string;
    receivedByTitle: string;
    notes: string;
    includeDspStamp: boolean;
  }>({
    doNumber: "",
    doDate: new Date().toISOString().split("T")[0],
    originWarehouse: "Gudang Utama DSTech Cilegon (Pusat Logistik)",
    destinationAddress: "",
    vehicleNumber: "A 8899 DS (Gran Max Blind Van)",
    driverName: "Dedi Setiawan",
    driverPhone: "0812-3456-7890",
    receivedByName: "",
    receivedByPhone: "",
    receivedByTitle: "PIC Lapangan / Penanggung Jawab",
    notes: "Seluruh barang dan material telah diperiksa dalam kondisi baru, tersegel, dan utuh saat diberangkatkan dari gudang. Harap periksa fisik barang saat penerimaan di lokasi proyek.",
    includeDspStamp: true,
  });

  const handleOpenDeliveryModal = (sale: SaleInvoice) => {
    const invClean = sale.invoiceNumber ? sale.invoiceNumber.replace(/^INV-/, "") : "001";
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const romanMonth = romanMonths[new Date().getMonth()] || "X";
    const currentYear = new Date().getFullYear();

    const whObj = warehouses.find((w) => w.id === sale.warehouseId);
    const whName = whObj ? `${whObj.name} (${whObj.city})` : "Gudang Utama DSTech Cilegon (Pusat Logistik)";

    setDeliveryConfig({
      doNumber: `SJ/DSP/${romanMonth}/${currentYear}/${invClean}`,
      doDate: new Date().toISOString().split("T")[0],
      originWarehouse: whName,
      destinationAddress: sale.customerAddress || "Lokasi Proyek Klien",
      vehicleNumber: "A 8899 DS (Gran Max Blind Van)",
      driverName: "Dedi Setiawan",
      driverPhone: "0812-3456-7890",
      receivedByName: sale.customerName || "Bapak/Ibu Pimpinan",
      receivedByPhone: sale.customerPhone || "-",
      receivedByTitle: "PIC Lapangan / Mandor Proyek",
      notes: "Seluruh material telah dihitung dan diperiksa dalam kondisi baru, lengkap, dan tersegel baik dari gudang PT. DSTech Smart Perkasa. Harap periksa fisik barang saat serah terima di lokasi proyek.",
      includeDspStamp: true,
    });
    setSelectedSaleForDelivery(sale);
    setIsDeliveryModalOpen(true);
  };
  const [cashAccountFilter, setCashAccountFilter] = useState<string>("ALL");

  // Retur Penjualan (Customer Returns) States
  const [isNewReturnSaleModalOpen, setIsNewReturnSaleModalOpen] = useState<boolean>(false);
  const [isEditReturnSaleModalOpen, setIsEditReturnSaleModalOpen] = useState<boolean>(false);
  const [editingReturnSale, setEditingReturnSale] = useState<SalesReturn | null>(null);
  const [returnSaleForm, setReturnSaleForm] = useState<{
    id: string;
    returnNumber: string;
    invoiceNumber: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
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
    notes: string;
  }>({
    id: "",
    returnNumber: "",
    invoiceNumber: "",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    date: new Date().toISOString().split("T")[0],
    productName: "",
    qty: 1,
    unit: "Unit",
    price: 0,
    totalRefund: 0,
    reason: "Cacat Fungsi / Tidak Menyala",
    resolution: "Ganti Barang Baru",
    status: "Sedang Diproses",
    handledBy: "DSTech QC & Logistik",
    notes: "",
  });
  const [selectedReturnSaleForApproval, setSelectedReturnSaleForApproval] = useState<SalesReturn | null>(null);
  const [isApprovalReturnSaleModalOpen, setIsApprovalReturnSaleModalOpen] = useState<boolean>(false);
  const [selectedReturnSaleForPrint, setSelectedReturnSaleForPrint] = useState<SalesReturn | null>(null);

  // Retur Pembelian (Vendor Returns) States
  const [isNewReturnPurchaseModalOpen, setIsNewReturnPurchaseModalOpen] = useState<boolean>(false);
  const [isEditReturnPurchaseModalOpen, setIsEditReturnPurchaseModalOpen] = useState<boolean>(false);
  const [editingReturnPurchase, setEditingReturnPurchase] = useState<PurchaseReturn | null>(null);
  const [returnPurchaseForm, setReturnPurchaseForm] = useState<{
    id: string;
    returnNumber: string;
    poNumber: string;
    supplierName: string;
    supplierContact: string;
    supplierAddress: string;
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
    notes: string;
  }>({
    id: "",
    returnNumber: "",
    poNumber: "",
    supplierName: "",
    supplierContact: "",
    supplierAddress: "",
    date: new Date().toISOString().split("T")[0],
    productName: "",
    qty: 1,
    unit: "Unit",
    price: 0,
    totalCredit: 0,
    reason: "Cacat Pabrik / Dead on Arrival (DOA)",
    resolution: "Klaim Garansi Tukar Baru",
    status: "Dalam Proses RMA Vendor",
    handledBy: "DSTech Gudang",
    notes: "",
  });
  const [selectedReturnPurchaseForApproval, setSelectedReturnPurchaseForApproval] = useState<PurchaseReturn | null>(null);
  const [isApprovalReturnPurchaseModalOpen, setIsApprovalReturnPurchaseModalOpen] = useState<boolean>(false);
  const [selectedReturnPurchaseForPrint, setSelectedReturnPurchaseForPrint] = useState<PurchaseReturn | null>(null);

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
    letterheadPaddingTop: 80,
    letterheadPaddingBottom: 75,
    letterheadFitMode: "fill",
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
    letterheadPaddingTop: 80,
    letterheadPaddingBottom: 75,
    letterheadFitMode: "fill",
    signerName: "H. Agus Supriyadi, S.T., M.Kom.",
    signerTitle: "Direktur Keuangan & Operasional",
    masterSignatureUrl: "",
    masterStampUrl: "",
  });

  // Reset Transactions Modal State (Clean Slate)
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetConfirmText, setResetConfirmText] = useState<string>("");
  const [isResetting, setIsResetting] = useState<boolean>(false);

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
  const [quotationSortBy, setQuotationSortBy] = useState<string>("date_desc");
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

  const [quotationForm, setQuotationForm] = useState<{
    clientId: string;
    branchId: string;
    warehouseId: string;
    customerName: string;
    customerOrg: string;
    customerPhone: string;
    customerAddress: string;
    subject: string;
    date: string;
    validityDays: number;
    items: QuotationItem[];
    discount: number;
    discountType: "fixed" | "percent";
    discountPercent: number;
    discountLabel: string;
    revision: number;
    isRevision?: boolean;
    taxRate: number;
    terms: string;
    notes: string;
  }>({
    clientId: "",
    branchId: "dstech_branch_1",
    warehouseId: "dstech_wh_1",
    customerName: "",
    customerOrg: "",
    customerPhone: "",
    customerAddress: "",
    subject: "Penawaran Pengadaan & Instalasi Sistem CCTV AI & Smart Security",
    date: new Date().toISOString().split("T")[0],
    validityDays: 14,
    items: [
      { id: "1", productId: "", productName: "", qty: 1, unit: "Unit", price: 0, discount: 0, total: 0 },
    ],
    discount: 0,
    discountType: "fixed",
    discountPercent: 0,
    discountLabel: "Diskon Khusus Negosiasi Proyek",
    revision: 0,
    isRevision: false,
    taxRate: 11,
    terms: "1. Harga sudah termasuk pengiriman, instalasi kabel pelindung pipa konduit, dan uji kelayakan sistem.\n2. Garansi resmi unit perangkat selama 2 (dua) tahun dan garansi pemeliharaan teknis selama 6 (enam) bulan.\n3. Skema Pembayaran: Down Payment (DP) 50% saat penerbitan SPK, Pelunasan 50% setelah penandatanganan Berita Acara Serah Terima (BAST).\n4. Penawaran harga ini berlaku selama 14 (empat belas) hari kalender sejak tanggal diterbitkan.",
    notes: "",
  });

  // New Sale Form State
  const [saleForm, setSaleForm] = useState<{
    branchId: string;
    warehouseId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    date: string;
    dueDate: string;
    paymentMethod: string;
    invoiceType: "Standar" | "DP";
    dpPercentage: number;
    dpAmount: number;
    dpNotes: string;
    items: SaleItem[];
    discount: number;
    discountType: "fixed" | "percent";
    discountPercent: number;
    discountLabel: string;
    taxRate: number;
    paidAmount: number;
    notes: string;
  }>({
    branchId: "dstech_branch_1",
    warehouseId: "dstech_wh_1",
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
      { id: "1", productId: "", productName: "", qty: 1, unit: "Unit", price: 0, total: 0 },
    ],
    discount: 0,
    discountType: "fixed",
    discountPercent: 0,
    discountLabel: "Diskon Khusus Negosiasi Proyek",
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

  // Share & Send Document Modal State (WhatsApp & Email)
  const [sendDocModal, setSendDocModal] = useState<{
    isOpen: boolean;
    docType: "SPH" | "Invoice" | "PO" | "Return" | "Receipt" | "DeliveryOrder";
    docTitle: string;
    docNumber: string;
    recipientName: string;
    recipientOrg?: string;
    recipientPhone: string;
    recipientEmail?: string;
    date: string;
    dueDate?: string;
    subject: string;
    grandTotal: number;
    subtotal?: number;
    discount?: number;
    discountLabel?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    approvalStatus?: string;
    notes?: string;
  }>({
    isOpen: false,
    docType: "SPH",
    docTitle: "Surat Penawaran Harga (SPH)",
    docNumber: "",
    recipientName: "",
    recipientOrg: "",
    recipientPhone: "",
    recipientEmail: "",
    date: "",
    dueDate: "",
    subject: "",
    grandTotal: 0,
    subtotal: 0,
    discount: 0,
    discountLabel: "",
    paymentStatus: "",
    paymentMethod: "",
    approvalStatus: "",
    notes: "",
  });
  const [sendTab, setSendTab] = useState<"whatsapp" | "email">("whatsapp");
  const [customPhoneInput, setCustomPhoneInput] = useState<string>("");
  const [customEmailInput, setCustomEmailInput] = useState<string>("");

  const normalizeWhatsAppNumber = (phone: string): string => {
    if (!phone) return "";
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    } else if (clean.startsWith("8")) {
      clean = "62" + clean;
    }
    return clean;
  };

  const handleOpenSendDocModal = (params: {
    docType: "SPH" | "Invoice" | "PO" | "Return" | "Receipt" | "DeliveryOrder";
    docTitle: string;
    docNumber: string;
    recipientName: string;
    recipientOrg?: string;
    recipientPhone?: string;
    recipientEmail?: string;
    date: string;
    dueDate?: string;
    subject: string;
    grandTotal: number;
    subtotal?: number;
    discount?: number;
    discountLabel?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    approvalStatus?: string;
    notes?: string;
    initialTab?: "whatsapp" | "email";
  }) => {
    setSendDocModal({
      isOpen: true,
      docType: params.docType,
      docTitle: params.docTitle,
      docNumber: params.docNumber,
      recipientName: params.recipientName,
      recipientOrg: params.recipientOrg || "",
      recipientPhone: params.recipientPhone || "",
      recipientEmail: params.recipientEmail || "",
      date: params.date,
      dueDate: params.dueDate || "",
      subject: params.subject,
      grandTotal: params.grandTotal,
      subtotal: params.subtotal || 0,
      discount: params.discount || 0,
      discountLabel: params.discountLabel || "",
      paymentStatus: params.paymentStatus || "",
      paymentMethod: params.paymentMethod || "",
      approvalStatus: params.approvalStatus || "",
      notes: params.notes || "",
    });
    setCustomPhoneInput(params.recipientPhone || "");
    setCustomEmailInput(params.recipientEmail || "");
    setSendTab(params.initialTab || "whatsapp");
  };

  const generateDocShareContent = (doc: typeof sendDocModal) => {
    const companyName = "PT. DSTech Smart Perkasa";
    const portalUrl = "https://dstechsmart.com";

    // Format WA Text
    let waText = `*Yth. ${doc.recipientName || "Bapak/Ibu"}*\n`;
    if (doc.recipientOrg && doc.recipientOrg !== doc.recipientName) {
      waText += `*${doc.recipientOrg}*\n\n`;
    } else {
      waText += `\n`;
    }
    waText += `Dengan hormat,\nBerikut kami sampaikan dokumen resmi *${doc.docTitle}* dari *${companyName}*:\n\n`;
    waText += `📋 *Dokumen:* ${doc.docTitle}\n`;
    waText += `🔢 *Nomor:* ${doc.docNumber}\n`;
    waText += `📅 *Tanggal:* ${doc.date}\n`;
    if (doc.dueDate) {
      waText += `⏳ *Jatuh Tempo / Berlaku:* ${doc.dueDate}\n`;
    }
    if (doc.subject) {
      waText += `💼 *Perihal:* ${doc.subject}\n`;
    }
    if (doc.grandTotal > 0) {
      waText += `💰 *Nilai Total:* ${formatRupiah(doc.grandTotal)}\n`;
    }
    if (doc.discount && doc.discount > 0) {
      waText += `🏷️ *${doc.discountLabel || "Diskon Negosiasi"}:* -${formatRupiah(doc.discount)}\n`;
    }
    if (doc.paymentStatus) {
      waText += `📊 *Status Pembayaran:* ${doc.paymentStatus}\n`;
    }
    if (doc.approvalStatus) {
      waText += `🛡️ *Status Legalitas:* ${doc.approvalStatus}\n`;
    }
    if (doc.docType === "Invoice") {
      waText += `\n💳 *Rekening Resmi Pembayaran Transfer:*\n`;
      const defaultBank = bankAccounts.find((b) => b.isDefault) || bankAccounts[0];
      if (defaultBank) {
        waText += `• ${defaultBank.bankName}: ${defaultBank.accountNumber} a/n ${defaultBank.accountHolder} (${defaultBank.branch})\n`;
      }
    }

    waText += `\nDokumen resmi ber-kop surat dan tanda tangan sah dapat dilihat/diunduh melalui portal resmi kami:\n🌐 ${portalUrl}\n\n`;
    waText += `Apabila ada pertanyaan lebih lanjut atau konfirmasi teknis, silakan hubungi tim kami melalui pesan ini.\n\n`;
    waText += `Terima kasih atas kepercayaan dan kerjasamanya.\n\n`;
    waText += `_Salam hangat,_\n*${companyName}*\n_Security System & IT Infrastructure Solutions_`;

    // Format Email
    const emailSubject = `[${companyName}] ${doc.docTitle} - No: ${doc.docNumber} - ${doc.recipientName}`;
    let emailBody = `Kepada Yth.\n${doc.recipientName}\n${doc.recipientOrg || ""}\n\n`;
    emailBody += `Dengan hormat,\n\nBersama dengan surat pengantar ini, kami dari PT. DSTech Smart Perkasa bermaksud menyampaikan dokumen ${doc.docTitle} dengan rincian sebagai berikut:\n\n`;
    emailBody += `• Dokumen: ${doc.docTitle}\n`;
    emailBody += `• Nomor Dokumen: ${doc.docNumber}\n`;
    emailBody += `• Tanggal: ${doc.date}\n`;
    if (doc.dueDate) emailBody += `• Batas Waktu / Berlaku s/d: ${doc.dueDate}\n`;
    if (doc.subject) emailBody += `• Perihal: ${doc.subject}\n`;
    if (doc.grandTotal > 0) emailBody += `• Total Nilai: ${formatRupiah(doc.grandTotal)}\n`;
    if (doc.paymentStatus) emailBody += `• Status Pembayaran: ${doc.paymentStatus}\n`;
    if (doc.approvalStatus) emailBody += `• Pengesahan Direksi: ${doc.approvalStatus}\n`;

    if (doc.docType === "Invoice") {
      emailBody += `\nInstruksi Pembayaran Transfer Rekening Perusahaan:\n`;
      bankAccounts.filter((b) => b.status === "Aktif").forEach((acc) => {
        emailBody += `- Bank: ${acc.bankName} | No. Rek: ${acc.accountNumber} | a/n: ${acc.accountHolder} (${acc.branch})\n`;
      });
    }

    emailBody += `\nDokumen lengkap telah disahkan secara digital oleh Direksi PT. DSTech Smart Perkasa.\n`;
    emailBody += `Demikian dokumen ini kami sampaikan. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.\n\n`;
    emailBody += `Hormat kami,\nPT. DSTech Smart Perkasa\nDivisi Commercial & Finance\nWebsite: https://dstechsmart.com`;

    return { waText, emailSubject, emailBody };
  };

  const handleSendWhatsApp = (targetPhone?: string) => {
    const phone = targetPhone || customPhoneInput || sendDocModal.recipientPhone;
    const cleanPhone = normalizeWhatsAppNumber(phone);
    if (!cleanPhone) {
      showToast("Nomor WhatsApp belum diisi atau tidak valid!");
      return;
    }
    const { waText } = generateDocShareContent(sendDocModal);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, "_blank");
    showToast(`Membuka WhatsApp untuk ${sendDocModal.recipientName}...`);
  };

  const handleSendEmail = (targetEmail?: string) => {
    const email = targetEmail || customEmailInput || sendDocModal.recipientEmail;
    const { emailSubject, emailBody } = generateDocShareContent(sendDocModal);
    const mailtoUrl = `mailto:${email || ""}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
    showToast(`Membuka aplikasi Email untuk ${sendDocModal.recipientName}...`);
  };

  const handleCopyContent = (text: string, label?: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`✅ ${label || "Teks"} berhasil disalin ke clipboard!`);
      }).catch(() => {
        // Fallback untuk browser lama
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast(`✅ ${label || "Teks"} berhasil disalin!`);
      });
    } else {
      // Fallback tanpa Clipboard API
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        showToast(`✅ ${label || "Teks"} berhasil disalin!`);
      } catch {
        showToast("❌ Gagal menyalin. Silakan salin manual (Ctrl+A lalu Ctrl+C).");
      }
      document.body.removeChild(ta);
    }
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
      const [res, prodRes] = await Promise.all([
        fetch("/api/finance"),
        fetch("/api/products"),
      ]);
      if (prodRes.ok) {
        const pd = await prodRes.json();
        if (pd.data) setProducts(pd.data);
      }
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
            const rawTop = d.data.settings.letterheadPaddingTop;
            const normalizedTop = (!rawTop || rawTop === 135 || rawTop === 90) ? 80 : rawTop;
            const rawBottom = d.data.settings.letterheadPaddingBottom;
            const normalizedBottom = (!rawBottom || rawBottom === 110) ? 75 : rawBottom;
            const mergedSettings: FinanceSettings = {
              ...d.data.settings,
              letterheadPaddingTop: normalizedTop,
              letterheadPaddingBottom: normalizedBottom,
              letterheadFitMode: d.data.settings.letterheadFitMode || "fill",
            };
            setFinanceSettings(mergedSettings);
            setTempSettings(mergedSettings);
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
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (
        tab &&
        ["sales", "quotations", "purchases", "returns", "pl_report", "cash_flow", "warehouses", "clients", "suppliers"].includes(
          tab
        )
      ) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  // Helper Informasi Ketersediaan Stok Real-time per Cabang / Gudang
  const getProductStockInfo = (productIdOrName: string, warehouseId: string = "dstech_wh_1") => {
    if (!productIdOrName) return null;
    const prod = products.find(
      (p) => p.id === productIdOrName || (p.name && p.name.trim().toLowerCase() === productIdOrName.trim().toLowerCase())
    );
    if (!prod) return null;

    const isService = prod.category?.toLowerCase().includes("jasa") || prod.category?.toLowerCase().includes("layanan") || prod.stock >= 900;
    if (isService) {
      return {
        product: prod,
        isService: true,
        stock: 999,
        whName: "DSTech Service",
        label: "Layanan Teknis (Stok Selalu Siap)",
        badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
      };
    }

    const wh = warehouses.find((w) => w.id === warehouseId);
    const whName = wh ? wh.name.replace("DSTech - ", "").replace("Gudang Utama DSTech - ", "") : "Gudang Utama";
    let stockInWh = 0;
    if (prod.warehouseStock && prod.warehouseStock[warehouseId] !== undefined) {
      stockInWh = Number(prod.warehouseStock[warehouseId]) || 0;
    } else {
      stockInWh = Number(prod.stock) || 0;
    }

    if (stockInWh <= 0) {
      return {
        product: prod,
        isService: false,
        stock: 0,
        whName,
        label: `Stok Habis di ${whName}`,
        badgeClass: "bg-red-100 text-red-700 border-red-200 font-bold",
      };
    } else if (stockInWh <= 3) {
      return {
        product: prod,
        isService: false,
        stock: stockInWh,
        whName,
        label: `Stok Kritis: ${stockInWh} ${prod.unit || "Unit"} di ${whName}`,
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
      };
    } else {
      return {
        product: prod,
        isService: false,
        stock: stockInWh,
        whName,
        label: `Tersedia: ${stockInWh} ${prod.unit || "Unit"} di ${whName}`,
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
      };
    }
  };

  const handleSelectProductForSale = (idx: number, productId: string) => {
    const selected = products.find((p) => p.id === productId);
    if (!selected) return;
    setSaleForm((prev) => {
      const updated = [...prev.items];
      const qty = updated[idx]?.qty || 1;
      const price = Number(selected.price) || 0;
      updated[idx] = {
        ...updated[idx],
        productId: selected.id,
        productName: selected.name,
        unit: selected.unit || "Unit",
        price: price,
        total: qty * price,
      };
      return { ...prev, items: updated };
    });
  };

  const handleSelectProductForQuotation = (idx: number, productId: string) => {
    const selected = products.find((p) => p.id === productId);
    if (!selected) return;
    setQuotationForm((prev) => {
      const updated = [...prev.items];
      const qty = updated[idx]?.qty || 1;
      const discount = updated[idx]?.discount || 0;
      const price = Number(selected.price) || 0;
      updated[idx] = {
        ...updated[idx],
        productId: selected.id,
        productName: selected.name,
        unit: selected.unit || "Unit",
        price: price,
        discount: discount,
        total: Math.max(0, qty * price - discount),
      };
      return { ...prev, items: updated };
    });
  };

  const handleSelectProductForEditSale = (idx: number, productId: string) => {
    if (!editingSale) return;
    const selected = products.find((p) => p.id === productId);
    if (!selected) return;
    const updated = [...editingSale.items];
    const qty = updated[idx]?.qty || 1;
    const price = Number(selected.price) || 0;
    updated[idx] = {
      ...updated[idx],
      productId: selected.id,
      productName: selected.name,
      unit: selected.unit || "Unit",
      price: price,
      total: qty * price,
    };
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

  // Handler Sale Form Dynamic Items
  const handleAddSaleItem = () => {
    setSaleForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: String(Date.now()), productId: "", productName: "", qty: 1, unit: "Unit", price: 0, total: 0 },
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
        { id: String(Date.now()), productId: "", productName: "", qty: 1, unit: "Unit", price: 0, discount: 0, total: 0 },
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
    const discountVal =
      quotationForm.discountType === "percent"
        ? Math.round((subtotal * (Number(quotationForm.discountPercent) || 0)) / 100)
        : Number(quotationForm.discount || 0);
    const afterDiscount = Math.max(0, subtotal - discountVal);
    const taxAmount = (afterDiscount * Number(quotationForm.taxRate || 0)) / 100;
    const grandTotal = afterDiscount + taxAmount;
    return { subtotal, discountVal, afterDiscount, taxAmount, grandTotal };
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
    const { subtotal, discountVal, taxAmount, grandTotal } = calculateQuotationTotals();

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
            branchId: quotationForm.branchId || "dstech_branch_1",
            warehouseId: quotationForm.warehouseId || "dstech_wh_1",
            customerName: quotationForm.customerName,
            customerOrg: quotationForm.customerOrg || quotationForm.customerName,
            customerPhone: quotationForm.customerPhone,
            customerAddress: quotationForm.customerAddress,
            subject: quotationForm.subject,
            date: quotationForm.date,
            validityDays: Number(quotationForm.validityDays) || 14,
            items: quotationForm.items,
            subtotal,
            discount: discountVal,
            discountType: quotationForm.discountType || "fixed",
            discountPercent: Number(quotationForm.discountPercent) || 0,
            discountLabel: quotationForm.discountLabel || "Diskon Khusus Negosiasi Proyek",
            revision: 0,
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
          branchId: "dstech_branch_1",
          warehouseId: "dstech_wh_1",
          customerName: "",
          customerOrg: "",
          customerPhone: "",
          customerAddress: "",
          subject: "Penawaran Pengadaan & Instalasi CCTV AI & Smart Security",
          date: new Date().toISOString().split("T")[0],
          validityDays: 14,
          items: [
            { id: "1", productId: "", productName: "", qty: 1, unit: "Unit", price: 0, discount: 0, total: 0 },
          ],
          discount: 0,
          discountType: "fixed",
          discountPercent: 0,
          discountLabel: "Diskon Khusus Negosiasi Proyek",
          revision: 0,
          isRevision: false,
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
      branchId: q.branchId || "dstech_branch_1",
      warehouseId: q.warehouseId || "dstech_wh_1",
      customerName: q.customerName,
      customerOrg: q.customerOrg || q.customerName,
      customerPhone: q.customerPhone,
      customerAddress: q.customerAddress,
      subject: q.subject,
      date: q.date,
      validityDays: q.validityDays || 14,
      items: q.items && q.items.length > 0 ? q.items : [{ id: "1", productId: "", productName: "", qty: 1, unit: "Unit", price: 0, discount: 0, total: 0 }],
      discount: q.discount || 0,
      discountType: q.discountType || "fixed",
      discountPercent: q.discountPercent || 0,
      discountLabel: q.discountLabel || "Diskon Khusus Negosiasi Proyek",
      revision: q.revision || 0,
      isRevision: false,
      taxRate: q.taxRate || 0,
      terms: q.terms,
      notes: q.notes || "",
    });
    setIsEditQuotationModalOpen(true);
  };

  const handleSaveEditQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuotation) return;
    const { subtotal, discountVal, taxAmount, grandTotal } = calculateQuotationTotals();
    const isRev = Boolean((quotationForm as any).isRevision);
    const targetRevision = isRev ? ((editingQuotation.revision || 0) + 1) : (editingQuotation.revision || 0);

    try {
      const res = await fetch("/api/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "quotation",
          id: editingQuotation.id,
          updates: {
            clientId: quotationForm.clientId,
            branchId: quotationForm.branchId,
            warehouseId: quotationForm.warehouseId,
            customerName: quotationForm.customerName,
            customerOrg: quotationForm.customerOrg || quotationForm.customerName,
            customerPhone: quotationForm.customerPhone,
            customerAddress: quotationForm.customerAddress,
            subject: quotationForm.subject,
            date: quotationForm.date,
            validityDays: Number(quotationForm.validityDays) || 14,
            items: quotationForm.items,
            subtotal,
            discount: discountVal,
            discountType: quotationForm.discountType || "fixed",
            discountPercent: Number(quotationForm.discountPercent) || 0,
            discountLabel: quotationForm.discountLabel || "Diskon Khusus Negosiasi Proyek",
            revision: targetRevision,
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

  const isQuotationExpired = (sph: Quotation): boolean => {
    if (sph.status === "Kedaluwarsa") return true;
    if (sph.status === "Terkonversi Faktur" || sph.status === "Disetujui Klien" || sph.status === "Ditolak" || Boolean(sph.convertedInvoiceId)) {
      return false;
    }
    if (!sph.validUntil) return false;
    const todayStr = new Date().toISOString().split("T")[0];
    return sph.validUntil < todayStr;
  };

  const getQuotationClassification = (sph: Quotation): "deal" | "expired" | "rejected" | "pending" => {
    if (sph.status === "Terkonversi Faktur" || sph.status === "Disetujui Klien" || Boolean(sph.convertedInvoiceId)) {
      return "deal";
    }
    if (sph.status === "Ditolak") {
      return "rejected";
    }
    if (sph.status === "Kedaluwarsa" || isQuotationExpired(sph)) {
      return "expired";
    }
    return "pending";
  };

  const handleUpdateQuotationStatus = async (sph: Quotation, newStatus: string) => {
    try {
      const res = await fetch("/api/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "quotation",
          id: sph.id,
          updates: { status: newStatus },
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Status SPH ${sph.quotationNumber} berhasil diubah: ${newStatus}`);
        setQuotations((prev) =>
          prev.map((q) => (q.id === sph.id ? { ...q, status: newStatus } : q))
        );
      } else {
        showToast(result.error || "Gagal memperbarui status penawaran");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat memperbarui status penawaran");
    }
  };

  const quotationCounts = useMemo(() => {
    let deal = 0;
    let pending = 0;
    let expired = 0;
    let rejected = 0;
    for (const q of quotations) {
      const c = getQuotationClassification(q);
      if (c === "deal") deal++;
      else if (c === "expired") expired++;
      else if (c === "rejected") rejected++;
      else pending++;
    }
    return { total: quotations.length, deal, pending, expired, rejected };
  }, [quotations]);

  const filteredAndSortedQuotations = useMemo(() => {
    return quotations
      .filter((sph) => {
        const query = quotationSearchQuery.toLowerCase();
        const matchQuery =
          sph.quotationNumber.toLowerCase().includes(query) ||
          sph.customerName.toLowerCase().includes(query) ||
          (sph.customerOrg && sph.customerOrg.toLowerCase().includes(query)) ||
          sph.subject.toLowerCase().includes(query);

        if (!matchQuery) return false;

        const classification = getQuotationClassification(sph);
        if (quotationStatusFilter === "Semua") return true;
        if (quotationStatusFilter === "deal") return classification === "deal";
        if (quotationStatusFilter === "pending") return classification === "pending";
        if (quotationStatusFilter === "expired") return classification === "expired";
        if (quotationStatusFilter === "rejected") return classification === "rejected";
        return sph.status === quotationStatusFilter;
      })
      .sort((a, b) => {
        if (quotationSortBy === "date_desc") {
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        }
        if (quotationSortBy === "date_asc") {
          return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
        }
        if (quotationSortBy === "status_deal_first") {
          const priority: Record<string, number> = { deal: 1, pending: 2, expired: 3, rejected: 4 };
          const pA = priority[getQuotationClassification(a)] || 9;
          const pB = priority[getQuotationClassification(b)] || 9;
          return pA - pB;
        }
        if (quotationSortBy === "status_expired_first") {
          const priority: Record<string, number> = { expired: 1, rejected: 2, pending: 3, deal: 4 };
          const pA = priority[getQuotationClassification(a)] || 9;
          const pB = priority[getQuotationClassification(b)] || 9;
          return pA - pB;
        }
        if (quotationSortBy === "validity_asc") {
          return (a.validUntil || "").localeCompare(b.validUntil || "");
        }
        if (quotationSortBy === "total_desc") {
          return (Number(b.grandTotal) || 0) - (Number(a.grandTotal) || 0);
        }
        if (quotationSortBy === "total_asc") {
          return (Number(a.grandTotal) || 0) - (Number(b.grandTotal) || 0);
        }
        if (quotationSortBy === "client_asc") {
          return a.customerName.localeCompare(b.customerName);
        }
        return 0;
      });
  }, [quotations, quotationSearchQuery, quotationStatusFilter, quotationSortBy]);

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
    const discountVal =
      saleForm.discountType === "percent"
        ? Math.round((subtotal * (Number(saleForm.discountPercent) || 0)) / 100)
        : Number(saleForm.discount || 0);
    const afterDiscount = Math.max(0, subtotal - discountVal);
    const taxAmount = (afterDiscount * Number(saleForm.taxRate || 0)) / 100;
    const grandTotal = afterDiscount + taxAmount;
    const dpAmount =
      saleForm.invoiceType === "DP"
        ? saleForm.dpAmount > 0
          ? saleForm.dpAmount
          : Math.round(grandTotal * (Number(saleForm.dpPercentage || 50) / 100))
        : 0;
    return { subtotal, discountVal, afterDiscount, taxAmount, grandTotal, dpAmount };
  };

  const handleCreateSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, discountVal, taxAmount, grandTotal, dpAmount } = calculateSaleTotals();

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
            branchId: saleForm.branchId || "dstech_branch_1",
            warehouseId: saleForm.warehouseId || "dstech_wh_1",
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
            discount: discountVal,
            discountType: saleForm.discountType || "fixed",
            discountPercent: Number(saleForm.discountPercent) || 0,
            discountLabel: saleForm.discountLabel || "Diskon Khusus Negosiasi Proyek",
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
          branchId: "dstech_branch_1",
          warehouseId: "dstech_wh_1",
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
          items: [{ id: "1", productId: "", productName: "", qty: 1, unit: "Unit", price: 0, total: 0 }],
          discount: 0,
          discountType: "fixed",
          discountPercent: 0,
          discountLabel: "Diskon Khusus Negosiasi Proyek",
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
    let isDpPaymentPhase = false;
    if (invoice.invoiceType === "DP" && (Number(invoice.dpPaidAmount) || 0) < (Number(invoice.dpAmount) || 0)) {
      defaultAmount = Math.max(0, (Number(invoice.dpAmount) || 0) - (Number(invoice.dpPaidAmount) || 0));
      isDpPaymentPhase = true;
    }
    const defaultAcc = getDefaultBankAccLabel();

    setPaymentForm({
      amount: defaultAmount,
      paymentMethod: defaultAcc,
      paymentDate: new Date().toISOString().split("T")[0],
      notes: invoice.invoiceType === "DP"
        ? isDpPaymentPhase
          ? `Penerimaan Uang Muka (DP ${invoice.dpPercentage || 50}%) Faktur ${invoice.invoiceNumber}`
          : `Penerimaan Pelunasan Sisa Kontrak Faktur ${invoice.invoiceNumber}`
        : `Penerimaan Pembayaran Faktur ${invoice.invoiceNumber}`,
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
            branchId: editingSale.branchId,
            warehouseId: editingSale.warehouseId,
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

  // Handler Hapus Transaksi Kas (Cash Flow)
  const handleDeleteCashFlow = async (id: string, desc: string) => {
    if (!window.confirm(`Yakin ingin menghapus catatan kas: "${desc}"? Data yang dihapus tidak dapat dipulihkan.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/finance?actionType=cash_flow&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        showToast("Catatan transaksi kas berhasil dihapus!");
        fetchFinanceData();
      } else {
        showToast(result.error || "Gagal menghapus catatan kas");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat menghapus catatan kas");
    }
  };

  // Handler Reset Seluruh Transaksi Keuangan (Clean Slate)
  const handleResetAllTransactions = async () => {
    if (resetConfirmText.trim().toUpperCase() !== "RESET") {
      showToast("Ketik kata 'RESET' untuk mengonfirmasi pembersihan transaksi");
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch("/api/finance?actionType=reset_transactions", {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message || "Seluruh transaksi keuangan berhasil dibersihkan!");
        setIsResetModalOpen(false);
        setResetConfirmText("");
        fetchFinanceData();
      } else {
        showToast(result.error || "Gagal mereset transaksi keuangan");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat mereset transaksi");
    } finally {
      setIsResetting(false);
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
    setTempSettings({
      ...financeSettings,
      letterheadPaddingTop: financeSettings.letterheadPaddingTop || 80,
      letterheadPaddingBottom: financeSettings.letterheadPaddingBottom || 75,
      letterheadFitMode: financeSettings.letterheadFitMode || "fill",
      signerName: financeSettings.signerName !== undefined ? financeSettings.signerName : "H. Agus Supriyadi, S.T., M.Kom.",
      signerTitle: financeSettings.signerTitle !== undefined ? financeSettings.signerTitle : "Direktur Keuangan & Operasional",
    });
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
      const sanitizedSettings = {
        ...tempSettings,
        letterheadPaddingTop: tempSettings.letterheadPaddingTop || 80,
        letterheadPaddingBottom: tempSettings.letterheadPaddingBottom || 75,
        letterheadFitMode: tempSettings.letterheadFitMode || "fill",
        signerName: tempSettings.signerName?.trim() || "H. Agus Supriyadi, S.T., M.Kom.",
        signerTitle: tempSettings.signerTitle?.trim() || "Direktur Keuangan & Operasional",
      };
      const res = await fetch("/api/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "settings",
          updates: sanitizedSettings,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setFinanceSettings({ ...sanitizedSettings });
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

  const handleOpenApprovalModal = (invoice: any) => {
    const isQuotation =
      invoice.quotationNumber !== undefined ||
      invoice.id?.startsWith("dstech_quot_") ||
      invoice.id?.startsWith("dstech_sph_") ||
      invoice.paymentMethod === "SPH Proposal";

    const mappedDoc = isQuotation
      ? {
          ...invoice,
          invoiceNumber: invoice.quotationNumber || invoice.invoiceNumber,
          dueDate: invoice.validUntil || invoice.dueDate,
          paymentMethod: "SPH Proposal",
          paymentStatus: invoice.status || "SPH Proposal",
          paidAmount: 0,
          remainingAmount: invoice.grandTotal,
          warehouseId: invoice.warehouseId || "dstech_wh_1",
          branchId: invoice.branchId || "dstech_branch_1",
          salesPerson: "DSTech Commercial Team",
        }
      : invoice;

    setSelectedInvoiceForApproval(mappedDoc);
    setSignerNameInput(invoice.approvedBy || financeSettings.signerName || "H. Agus Supriyadi, S.T., M.Kom.");
    setSignerTitleInput(invoice.approvedTitle || financeSettings.signerTitle || "Direktur Keuangan & Operasional");
    setApprovalNotesInput(
      invoice.approvalNotes ||
        (isQuotation
          ? "Disetujui untuk diterbitkan secara resmi sebagai Surat Penawaran Harga kepada klien."
          : "Disetujui untuk diterbitkan secara sah kepada klien.")
    );
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

      const isQuotation =
        (selectedInvoiceForApproval as any).quotationNumber !== undefined ||
        selectedInvoiceForApproval.id?.startsWith("dstech_quot_") ||
        selectedInvoiceForApproval.id?.startsWith("dstech_sph_") ||
        (selectedInvoiceForApproval as any).paymentMethod === "SPH Proposal";
      const docType = isQuotation ? "quotation" : "sale";

      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "approve_document",
          payload: {
            id: selectedInvoiceForApproval.id,
            documentType: docType,
            signatureImage,
            signerName: signerNameInput,
            signerTitle: signerTitleInput,
            notes: approvalNotesInput,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        if (isQuotation) {
          setQuotations((prev) =>
            prev.map((q) => (q.id === selectedInvoiceForApproval.id ? json.data : q))
          );
          if (selectedQuotationForPrint && selectedQuotationForPrint.id === selectedInvoiceForApproval.id) {
            setSelectedQuotationForPrint(json.data);
          }
          showToast(json.message || "Surat Penawaran berhasil disetujui & disahkan!");
        } else {
          setSales((prev) =>
            prev.map((s) => (s.id === selectedInvoiceForApproval.id ? json.data : s))
          );
          if (selectedInvoiceForPrint && selectedInvoiceForPrint.id === selectedInvoiceForApproval.id) {
            setSelectedInvoiceForPrint(json.data);
          }
          showToast(json.message || "Faktur berhasil disetujui & disahkan!");
        }
        setIsApprovalModalOpen(false);
      } else {
        showToast(json.error || `Gagal menyetujui ${isQuotation ? "Surat Penawaran" : "Faktur"}.`);
      }
    } catch (err) {
      console.error("Error approving invoice:", err);
      showToast("Terjadi kesalahan saat menyetujui dokumen.");
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

  // PO Management (Edit, Delete, Approval, Print) Handlers
  const handleOpenEditPo = (po: PurchaseOrder) => {
    setEditingPo(po);
    setEditPoForm({
      id: po.id,
      poNumber: po.poNumber,
      supplierName: po.supplierName,
      supplierContact: po.supplierContact,
      date: po.date,
      expectedDelivery: po.expectedDelivery,
      status: po.status,
      paymentStatus: po.paymentStatus,
      warehouseId: po.warehouseId || "dstech_wh_1",
      notes: po.notes || "",
      items:
        po.items && po.items.length > 0
          ? po.items.map((it) => ({ ...it }))
          : [{ id: "1", productName: "", qty: 1, unit: "Unit", price: 0, total: 0 }],
    });
    setIsEditPoModalOpen(true);
  };

  const handleAddEditPoItem = () => {
    setEditPoForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: String(Date.now()), productName: "", qty: 1, unit: "Unit", price: 0, total: 0 },
      ],
    }));
  };

  const handleRemoveEditPoItem = (idx: number) => {
    if (editPoForm.items.length <= 1) return;
    setEditPoForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleEditPoItemChange = (idx: number, field: string, val: any) => {
    setEditPoForm((prev) => {
      const updated = [...prev.items];
      const item = { ...updated[idx], [field]: val };
      if (field === "qty" || field === "price") {
        item.total = Number(item.qty || 0) * Number(item.price || 0);
      }
      updated[idx] = item;
      return { ...prev, items: updated };
    });
  };

  const calculateEditPoTotals = () => {
    const subtotal = editPoForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const taxAmount = Math.round((subtotal * 11) / 100); // PPN 11%
    const grandTotal = subtotal + taxAmount;
    return { subtotal, taxAmount, grandTotal };
  };

  const handleSaveEditPo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPo) return;
    const { subtotal, taxAmount, grandTotal } = calculateEditPoTotals();

    if (editPoForm.items.some((it) => !it.productName || it.price <= 0)) {
      showToast("Mohon isi nama barang dan harga satuan valid untuk semua baris item PO!");
      return;
    }

    try {
      const res = await fetch("/api/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "purchase",
          id: editingPo.id,
          updates: {
            supplierName: editPoForm.supplierName,
            supplierContact: editPoForm.supplierContact,
            date: editPoForm.date,
            expectedDelivery: editPoForm.expectedDelivery,
            status: editPoForm.status,
            paymentStatus: editPoForm.paymentStatus,
            warehouseId: editPoForm.warehouseId,
            notes: editPoForm.notes,
            items: editPoForm.items,
            subtotal,
            taxAmount,
            grandTotal,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Purchase Order berhasil diperbarui!");
        setIsEditPoModalOpen(false);
        setEditingPo(null);
        fetchFinanceData();
      } else {
        showToast(json.error || "Gagal memperbarui Purchase Order");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat menyimpan perubahan PO");
    }
  };

  const handleDeletePo = async (po: PurchaseOrder) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus Purchase Order "${po.poNumber}" (${po.supplierName})? Data belanja dan status pengadaan ini akan dihapus.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/finance?actionType=purchase&id=${encodeURIComponent(po.id)}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Purchase Order ${po.poNumber} berhasil dihapus!`);
        fetchFinanceData();
      } else {
        showToast(result.error || "Gagal menghapus Purchase Order");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat menghapus PO");
    }
  };

  const handleOpenApprovalPo = (po: PurchaseOrder) => {
    setSelectedPoForApproval(po);
    setSignerNameInput(po.approvedBy || financeSettings.signerName || "H. Agus Supriyadi, S.T., M.Kom.");
    setSignerTitleInput(po.approvedTitle || financeSettings.signerTitle || "Direktur Keuangan & Operasional");
    setApprovalNotesInput(po.approvalNotes || "Disetujui untuk pengadaan barang operasional/proyek resmi.");
    setUploadedSignatureBase64(po.signatureImage || "");
    setApprovalMode("canvas");
    setIsApprovalPoModalOpen(true);
    setHasDrawn(false);
    setTimeout(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }, 150);
  };

  const handleApprovePo = async () => {
    if (!selectedPoForApproval) return;
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
            id: selectedPoForApproval.id,
            documentType: "purchase",
            signatureImage,
            signerName: signerNameInput,
            signerTitle: signerTitleInput,
            notes: approvalNotesInput,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setPurchases((prev) =>
          prev.map((p) => (p.id === selectedPoForApproval.id ? json.data : p))
        );
        if (selectedPoForPrint && selectedPoForPrint.id === selectedPoForApproval.id) {
          setSelectedPoForPrint(json.data);
        }
        setIsApprovalPoModalOpen(false);
        showToast(json.message || "Purchase Order berhasil disetujui & disahkan!");
      } else {
        showToast(json.error || "Gagal menyetujui Purchase Order");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat approval PO");
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleOpenPrintPo = (po: PurchaseOrder) => {
    setSelectedPoForPrint(po);
  };

  // Retur Penjualan (Customer Return) Handlers
  const handleOpenAddReturnSale = () => {
    const firstInv = sales[0];
    const firstItem = firstInv?.items[0];
    setReturnSaleForm({
      id: "",
      returnNumber: `RET-S-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(100 + Math.random() * 900)}`,
      invoiceNumber: firstInv?.invoiceNumber || "",
      customerName: firstInv?.customerName || "",
      customerPhone: firstInv?.customerPhone || "",
      customerAddress: firstInv?.customerAddress || "",
      date: new Date().toISOString().split("T")[0],
      productName: firstItem ? firstItem.productName : "Kamera CCTV / Perangkat Jaringan",
      qty: 1,
      unit: firstItem?.unit || "Unit",
      price: firstItem?.price || 0,
      totalRefund: firstItem?.price || 0,
      reason: "Cacat Fungsi / Tidak Menyala",
      resolution: "Ganti Barang Baru",
      status: "Sedang Diproses",
      handledBy: "DSTech QC & Logistik",
      notes: "Unit diterima untuk uji teknis laboratorium dan klaim garansi resmi.",
    });
    setIsNewReturnSaleModalOpen(true);
  };

  const handleSelectInvoiceForReturnSale = (invNumber: string) => {
    const inv = sales.find((s) => s.invoiceNumber === invNumber);
    if (inv) {
      const it = inv.items[0];
      setReturnSaleForm((prev) => ({
        ...prev,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        customerPhone: inv.customerPhone || "",
        customerAddress: inv.customerAddress || "",
        productName: it ? it.productName : prev.productName,
        unit: it ? it.unit : prev.unit,
        price: it ? it.price : prev.price,
        totalRefund: (it ? it.price : prev.price) * prev.qty,
      }));
    }
  };

  const handleCreateReturnSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "return_sales",
          payload: returnSaleForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReturnsSales((prev) => [json.data, ...prev]);
        setIsNewReturnSaleModalOpen(false);
        showToast(json.message || "Retur penjualan berhasil dicatat!");
      } else {
        showToast(json.error || "Gagal mencatat retur penjualan");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat mencatat retur penjualan");
    }
  };

  const handleOpenEditReturnSale = (ret: SalesReturn) => {
    setEditingReturnSale(ret);
    setReturnSaleForm({
      id: ret.id,
      returnNumber: ret.returnNumber,
      invoiceNumber: ret.invoiceNumber,
      customerName: ret.customerName,
      customerPhone: ret.customerPhone || "",
      customerAddress: ret.customerAddress || "",
      date: ret.date,
      productName: ret.productName,
      qty: ret.qty,
      unit: ret.unit,
      price: ret.price,
      totalRefund: ret.totalRefund,
      reason: ret.reason,
      resolution: ret.resolution,
      status: ret.status,
      handledBy: ret.handledBy,
      notes: ret.notes || "",
    });
    setIsEditReturnSaleModalOpen(true);
  };

  const handleSaveEditReturnSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReturnSale) return;
    try {
      const res = await fetch("/api/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "return_sales",
          id: editingReturnSale.id,
          updates: returnSaleForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReturnsSales((prev) =>
          prev.map((r) => (r.id === editingReturnSale.id ? json.data : r))
        );
        if (selectedReturnSaleForPrint && selectedReturnSaleForPrint.id === editingReturnSale.id) {
          setSelectedReturnSaleForPrint(json.data);
        }
        setIsEditReturnSaleModalOpen(false);
        showToast(json.message || "Retur penjualan berhasil diperbarui");
      } else {
        showToast(json.error || "Gagal memperbarui retur penjualan");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat memperbarui retur");
    }
  };

  const handleDeleteReturnSale = async (ret: SalesReturn) => {
    if (!confirm(`Hapus berkas retur penjualan ${ret.returnNumber} (${ret.customerName})?`)) return;
    try {
      const res = await fetch(`/api/finance?actionType=return_sales&id=${ret.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setReturnsSales((prev) => prev.filter((r) => r.id !== ret.id));
        showToast(json.message || "Retur penjualan berhasil dihapus");
      } else {
        showToast(json.error || "Gagal menghapus retur penjualan");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat menghapus retur");
    }
  };

  const handleOpenApprovalReturnSale = (ret: SalesReturn) => {
    setSelectedReturnSaleForApproval(ret);
    setSignerNameInput(ret.approvedBy || financeSettings.signerName || "H. Agus Supriyadi, S.T., M.Kom.");
    setSignerTitleInput(ret.approvedTitle || "Kepala Penjamin Mutu & QC");
    setApprovalNotesInput(ret.approvalNotes || "Pemeriksaan unit selesai. Klaim garansi / retur disetujui & sah.");
    setUploadedSignatureBase64(ret.signatureImage || "");
    setApprovalMode("canvas");
    setIsApprovalReturnSaleModalOpen(true);
    setHasDrawn(false);
    setTimeout(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }, 150);
  };

  const handleApproveReturnSale = async () => {
    if (!selectedReturnSaleForApproval) return;
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
            id: selectedReturnSaleForApproval.id,
            documentType: "return_sales",
            signatureImage,
            signerName: signerNameInput,
            signerTitle: signerTitleInput,
            notes: approvalNotesInput,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReturnsSales((prev) =>
          prev.map((r) => (r.id === selectedReturnSaleForApproval.id ? json.data : r))
        );
        if (selectedReturnSaleForPrint && selectedReturnSaleForPrint.id === selectedReturnSaleForApproval.id) {
          setSelectedReturnSaleForPrint(json.data);
        }
        setIsApprovalReturnSaleModalOpen(false);
        showToast(json.message || "Berita Acara Retur Penjualan berhasil disahkan!");
      } else {
        showToast(json.error || "Gagal menyetujui retur penjualan");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat approval retur penjualan");
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleOpenPrintReturnSale = (ret: SalesReturn) => {
    setSelectedReturnSaleForPrint(ret);
  };

  // Retur Pembelian (Vendor Return) Handlers
  const handleOpenAddReturnPurchase = () => {
    const firstPo = purchases[0];
    const firstItem = firstPo?.items[0];
    setReturnPurchaseForm({
      id: "",
      returnNumber: `RET-P-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(100 + Math.random() * 900)}`,
      poNumber: firstPo?.poNumber || "",
      supplierName: firstPo?.supplierName || (suppliers[0]?.name || ""),
      supplierContact: firstPo?.supplierContact || (suppliers[0]?.phone || ""),
      supplierAddress: suppliers[0]?.address || "",
      date: new Date().toISOString().split("T")[0],
      productName: firstItem ? firstItem.productName : "Perangkat Elektronik / Modul",
      qty: 1,
      unit: firstItem?.unit || "Unit",
      price: firstItem?.price || 0,
      totalCredit: firstItem?.price || 0,
      reason: "Cacat Pabrik / Dead on Arrival (DOA)",
      resolution: "Klaim Garansi Tukar Baru",
      status: "Dalam Proses RMA Vendor",
      handledBy: "DSTech Gudang & Logistik",
      notes: "Unit dikirim kembali ke vendor untuk proses klaim garansi RMA resmi.",
    });
    setIsNewReturnPurchaseModalOpen(true);
  };

  const handleSelectPoForReturnPurchase = (poNumber: string) => {
    const po = purchases.find((p) => p.poNumber === poNumber);
    if (po) {
      const it = po.items[0];
      const supp = suppliers.find((s) => s.name === po.supplierName);
      setReturnPurchaseForm((prev) => ({
        ...prev,
        poNumber: po.poNumber,
        supplierName: po.supplierName,
        supplierContact: po.supplierContact || (supp?.phone || ""),
        supplierAddress: supp?.address || "",
        productName: it ? it.productName : prev.productName,
        unit: it ? it.unit : prev.unit,
        price: it ? it.price : prev.price,
        totalCredit: (it ? it.price : prev.price) * prev.qty,
      }));
    }
  };

  const handleCreateReturnPurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "return_purchase",
          payload: returnPurchaseForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReturnsPurchase((prev) => [json.data, ...prev]);
        setIsNewReturnPurchaseModalOpen(false);
        showToast(json.message || "Retur pembelian ke supplier berhasil dicatat!");
      } else {
        showToast(json.error || "Gagal mencatat retur pembelian");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat mencatat retur pembelian");
    }
  };

  const handleOpenEditReturnPurchase = (ret: PurchaseReturn) => {
    setEditingReturnPurchase(ret);
    setReturnPurchaseForm({
      id: ret.id,
      returnNumber: ret.returnNumber,
      poNumber: ret.poNumber,
      supplierName: ret.supplierName,
      supplierContact: ret.supplierContact || "",
      supplierAddress: ret.supplierAddress || "",
      date: ret.date,
      productName: ret.productName,
      qty: ret.qty,
      unit: ret.unit,
      price: ret.price,
      totalCredit: ret.totalCredit,
      reason: ret.reason,
      resolution: ret.resolution,
      status: ret.status,
      handledBy: ret.handledBy,
      notes: ret.notes || "",
    });
    setIsEditReturnPurchaseModalOpen(true);
  };

  const handleSaveEditReturnPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReturnPurchase) return;
    try {
      const res = await fetch("/api/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "return_purchase",
          id: editingReturnPurchase.id,
          updates: returnPurchaseForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReturnsPurchase((prev) =>
          prev.map((r) => (r.id === editingReturnPurchase.id ? json.data : r))
        );
        if (selectedReturnPurchaseForPrint && selectedReturnPurchaseForPrint.id === editingReturnPurchase.id) {
          setSelectedReturnPurchaseForPrint(json.data);
        }
        setIsEditReturnPurchaseModalOpen(false);
        showToast(json.message || "Retur pembelian berhasil diperbarui");
      } else {
        showToast(json.error || "Gagal memperbarui retur pembelian");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat memperbarui retur pembelian");
    }
  };

  const handleDeleteReturnPurchase = async (ret: PurchaseReturn) => {
    if (!confirm(`Hapus berkas retur pembelian ${ret.returnNumber} (${ret.supplierName})?`)) return;
    try {
      const res = await fetch(`/api/finance?actionType=return_purchase&id=${ret.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setReturnsPurchase((prev) => prev.filter((r) => r.id !== ret.id));
        showToast(json.message || "Retur pembelian berhasil dihapus");
      } else {
        showToast(json.error || "Gagal menghapus retur pembelian");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat menghapus retur pembelian");
    }
  };

  const handleOpenApprovalReturnPurchase = (ret: PurchaseReturn) => {
    setSelectedReturnPurchaseForApproval(ret);
    setSignerNameInput(ret.approvedBy || financeSettings.signerName || "H. Agus Supriyadi, S.T., M.Kom.");
    setSignerTitleInput(ret.approvedTitle || "Kepala Logistik & Pengadaan");
    setApprovalNotesInput(ret.approvalNotes || "Dokumen retur pengembalian vendor disetujui & sah untuk klaim RMA.");
    setUploadedSignatureBase64(ret.signatureImage || "");
    setApprovalMode("canvas");
    setIsApprovalReturnPurchaseModalOpen(true);
    setHasDrawn(false);
    setTimeout(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }, 150);
  };

  const handleApproveReturnPurchase = async () => {
    if (!selectedReturnPurchaseForApproval) return;
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
            id: selectedReturnPurchaseForApproval.id,
            documentType: "return_purchase",
            signatureImage,
            signerName: signerNameInput,
            signerTitle: signerTitleInput,
            notes: approvalNotesInput,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReturnsPurchase((prev) =>
          prev.map((r) => (r.id === selectedReturnPurchaseForApproval.id ? json.data : r))
        );
        if (selectedReturnPurchaseForPrint && selectedReturnPurchaseForPrint.id === selectedReturnPurchaseForApproval.id) {
          setSelectedReturnPurchaseForPrint(json.data);
        }
        setIsApprovalReturnPurchaseModalOpen(false);
        showToast(json.message || "Berita Acara Retur Pembelian berhasil disahkan!");
      } else {
        showToast(json.error || "Gagal menyetujui retur pembelian");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan saat approval retur pembelian");
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleOpenPrintReturnPurchase = (ret: PurchaseReturn) => {
    setSelectedReturnPurchaseForPrint(ret);
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

  const isAnyPrintModalOpen = Boolean(
    selectedInvoiceForPrint ||
    selectedQuotationForPrint ||
    selectedPoForPrint ||
    selectedReturnSaleForPrint ||
    selectedReturnPurchaseForPrint ||
    isBastModalOpen ||
    isDeliveryModalOpen
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-bounce print:hidden">
          <div className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-2xl border border-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Dashboard Interactive Elements (Hidden during print if modal is open) */}
      <div className={`space-y-6 ${isAnyPrintModalOpen ? "print:hidden" : ""}`}>
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
                                title={
                                  sale.invoiceType === "DP"
                                    ? ((Number(sale.dpPaidAmount) || 0) >= (Number(sale.dpAmount) || 0)
                                        ? "Terima Pembayaran Pelunasan Sisa Kontrak"
                                        : `Terima Pembayaran DP (${sale.dpPercentage || 50}%)`)
                                    : "Terima Pembayaran Faktur"
                                }
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

                            {/* Tombol Khusus Tagih Pelunasan untuk Faktur DP */}
                            {sale.invoiceType === "DP" && sale.remainingAmount > 0 && (
                              <button
                                onClick={() => handleOpenPrintInvoice(sale, "Pelunasan")}
                                title="Cetak Faktur Penagihan Pelunasan (Sisa Kontrak Pasca BAST)"
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all cursor-pointer hover:scale-105"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Tagih Pelunasan</span>
                              </button>
                            )}

                            {/* Tombol Cetak Berita Acara Serah Terima (BAST) */}
                            <button
                              onClick={() => handleOpenBastModal(sale)}
                              title="Cetak Berita Acara Serah Terima Pekerjaan (BAST)"
                              className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all cursor-pointer hover:scale-105"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">BAST</span>
                            </button>

                            {/* Tombol Cetak Surat Jalan Pengiriman Material */}
                            <button
                              onClick={() => handleOpenDeliveryModal(sale)}
                              title="Cetak Surat Jalan Material & Tanda Terima Barang (Delivery Order)"
                              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all cursor-pointer hover:scale-105"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Surat Jalan</span>
                            </button>

                            {/* Cetak Faktur Resmi Kop DSTech */}
                            <button
                              onClick={() => handleOpenPrintInvoice(sale)}
                              title="Cetak Faktur Resmi Kop DSTech"
                              className="p-2 rounded-xl bg-blue-50 text-dstech-blue hover:bg-dstech-blue hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Kirim Faktur via WhatsApp */}
                            <button
                              onClick={() =>
                                handleOpenSendDocModal({
                                  docType: "Invoice",
                                  docTitle: sale.invoiceType === "DP" ? `Faktur Uang Muka (DP ${sale.dpPercentage}%)` : "Faktur Penjualan (Sale Invoice)",
                                  docNumber: sale.invoiceNumber,
                                  recipientName: sale.customerName,
                                  recipientPhone: sale.customerPhone,
                                  date: sale.date,
                                  dueDate: sale.dueDate,
                                  subject: sale.invoiceType === "DP" ? `Pengajuan Termin Uang Muka DP ${sale.dpPercentage}%` : `Tagihan Penjualan & Pengadaan Sistem Keamanan`,
                                  grandTotal: sale.invoiceType === "DP" ? (sale.dpAmount || sale.grandTotal) : sale.grandTotal,
                                  subtotal: sale.subtotal,
                                  discount: sale.discount,
                                  discountLabel: sale.discountLabel,
                                  paymentStatus: sale.paymentStatus,
                                  paymentMethod: sale.paymentMethod,
                                  approvalStatus: sale.approvalStatus,
                                  initialTab: "whatsapp",
                                })
                              }
                              title="Kirim Faktur via WhatsApp ke Klien"
                              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            {/* Kirim Faktur via Email */}
                            <button
                              onClick={() =>
                                handleOpenSendDocModal({
                                  docType: "Invoice",
                                  docTitle: sale.invoiceType === "DP" ? `Faktur Uang Muka (DP ${sale.dpPercentage}%)` : "Faktur Penjualan (Sale Invoice)",
                                  docNumber: sale.invoiceNumber,
                                  recipientName: sale.customerName,
                                  recipientPhone: sale.customerPhone,
                                  date: sale.date,
                                  dueDate: sale.dueDate,
                                  subject: sale.invoiceType === "DP" ? `Pengajuan Termin Uang Muka DP ${sale.dpPercentage}%` : `Tagihan Penjualan & Pengadaan Sistem Keamanan`,
                                  grandTotal: sale.invoiceType === "DP" ? (sale.dpAmount || sale.grandTotal) : sale.grandTotal,
                                  subtotal: sale.subtotal,
                                  discount: sale.discount,
                                  discountLabel: sale.discountLabel,
                                  paymentStatus: sale.paymentStatus,
                                  paymentMethod: sale.paymentMethod,
                                  approvalStatus: sale.approvalStatus,
                                  initialTab: "email",
                                })
                              }
                              title="Kirim Faktur via Email ke Klien"
                              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Mail className="w-4 h-4" />
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nomor SPH (SPH-DSTECH-...), nama instansi klien, atau perihal pengadaan..."
                  value={quotationSearchQuery}
                  onChange={(e) => setQuotationSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white shadow-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Dropdown Sortir SPH */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-slate-400 font-semibold shrink-0">Sortir:</span>
                  <select
                    value={quotationSortBy}
                    onChange={(e) => setQuotationSortBy(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="date_desc">📅 Tanggal Terbaru</option>
                    <option value="date_asc">📅 Tanggal Terlama</option>
                    <option value="status_deal_first">🤝 Status: Deal Teratas</option>
                    <option value="status_expired_first">⏰ Status: Expired & Reject Teratas</option>
                    <option value="validity_asc">⏳ Masa Berlaku (Mendekati Expired)</option>
                    <option value="total_desc">💰 Nilai Penawaran Tertinggi</option>
                    <option value="total_asc">💰 Nilai Penawaran Terendah</option>
                    <option value="client_asc">🏢 Nama Klien (A-Z)</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsNewQuotationModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
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
                  <h4 className="text-xl font-black text-slate-900 mt-1">{quotationCounts.total} Surat</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Penawaran Resmi</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Deal / Jadi Faktur</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">{quotationCounts.deal} SPH</h4>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Proyek Disepakati</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <CheckCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Menunggu Respon</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">{quotationCounts.pending} SPH</h4>
                  <p className="text-[10px] text-amber-700 font-bold mt-0.5">Sedang Negosiasi</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">Expired & Reject</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">
                    {quotationCounts.expired + quotationCounts.rejected} SPH
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                    {quotationCounts.expired} Expired • {quotationCounts.rejected} Ditolak
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-700 text-white flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Quick Filter Status Chips (Deal vs Pending vs Expired vs Reject) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">
                Filter Status:
              </span>

              <button
                type="button"
                onClick={() => setQuotationStatusFilter("Semua")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  quotationStatusFilter === "Semua"
                    ? "bg-slate-900 text-white ring-2 ring-slate-400"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>Semua SPH</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                  {quotationCounts.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQuotationStatusFilter("deal")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  quotationStatusFilter === "deal"
                    ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>🤝 Deal / Faktur</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono font-bold">
                  {quotationCounts.deal}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQuotationStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  quotationStatusFilter === "pending"
                    ? "bg-amber-500 text-slate-950 ring-2 ring-amber-300 font-black"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>⏳ Menunggu Respon</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 font-mono font-bold">
                  {quotationCounts.pending}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQuotationStatusFilter("expired")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  quotationStatusFilter === "expired"
                    ? "bg-slate-700 text-white ring-2 ring-slate-400"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>⏰ Expired / Kedaluwarsa</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono font-bold">
                  {quotationCounts.expired}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQuotationStatusFilter("rejected")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  quotationStatusFilter === "rejected"
                    ? "bg-red-600 text-white ring-2 ring-red-300"
                    : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>❌ Ditolak / Reject</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono font-bold">
                  {quotationCounts.rejected}
                </span>
              </button>
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
                  {filteredAndSortedQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-600">Tidak ada Surat Penawaran yang sesuai filter</p>
                        <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau ganti filter status di atas.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedQuotations.map((sph) => {
                      const classification = getQuotationClassification(sph);
                      return (
                        <tr key={sph.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* No SPH & Perihal */}
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-black text-indigo-700 block text-xs">
                                {sph.quotationNumber}
                              </span>
                              {Boolean(sph.revision && sph.revision > 0) && (
                                <span className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                                  Rev. 0{sph.revision}
                                </span>
                              )}
                            </div>
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
                            <p className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${
                              classification === "expired" ? "text-red-600 font-black" : "text-amber-700"
                            }`}>
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
                                {sph.discountLabel || "Diskon Nego"}: -{formatRupiah(sph.discount)}
                                {sph.discountType === "percent" && sph.discountPercent ? ` (${sph.discountPercent}%)` : ""}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-semibold">
                              PPN {sph.taxRate || 0}%: {formatRupiah(sph.taxAmount || 0)}
                            </span>
                          </td>

                          {/* Status SPH & Approval */}
                          <td className="p-3 whitespace-nowrap space-y-1">
                            {classification === "deal" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {sph.status === "Terkonversi Faktur" ? "Deal (Faktur)" : "Disetujui Klien"}
                              </span>
                            ) : classification === "expired" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800 border border-slate-300" title="Penawaran melewati batas waktu atau lama tidak deal">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Kedaluwarsa (Expired)
                              </span>
                            ) : classification === "rejected" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                                <XCircle className="w-3 h-3 text-red-600" />
                                Ditolak (Reject)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                {sph.status || "Terkirim"}
                              </span>
                            )}

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

                          {/* Aksi Cepat */}
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

                              {/* Kirim SPH via WhatsApp */}
                              <button
                                onClick={() =>
                                  handleOpenSendDocModal({
                                    docType: "SPH",
                                    docTitle: "Surat Penawaran Harga (SPH)",
                                    docNumber: sph.quotationNumber,
                                    recipientName: sph.customerName,
                                    recipientOrg: sph.customerOrg,
                                    recipientPhone: sph.customerPhone,
                                    date: sph.date,
                                    dueDate: sph.validUntil,
                                    subject: sph.subject,
                                    grandTotal: sph.grandTotal,
                                    subtotal: sph.subtotal,
                                    discount: sph.discount,
                                    discountLabel: sph.discountLabel,
                                    approvalStatus: sph.approvalStatus,
                                    initialTab: "whatsapp",
                                  })
                                }
                                title="Kirim SPH via WhatsApp ke Klien"
                                className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>

                              {/* Kirim SPH via Email */}
                              <button
                                onClick={() =>
                                  handleOpenSendDocModal({
                                    docType: "SPH",
                                    docTitle: "Surat Penawaran Harga (SPH)",
                                    docNumber: sph.quotationNumber,
                                    recipientName: sph.customerName,
                                    recipientOrg: sph.customerOrg,
                                    recipientPhone: sph.customerPhone,
                                    date: sph.date,
                                    dueDate: sph.validUntil,
                                    subject: sph.subject,
                                    grandTotal: sph.grandTotal,
                                    subtotal: sph.subtotal,
                                    discount: sph.discount,
                                    discountLabel: sph.discountLabel,
                                    approvalStatus: sph.approvalStatus,
                                    initialTab: "email",
                                  })
                                }
                                title="Kirim SPH via Email ke Klien"
                                className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                              >
                                <Mail className="w-4 h-4" />
                              </button>

                              {/* Konversi ke Faktur Penjualan (Deal 1-Klik) */}
                              {classification !== "deal" && (
                                <button
                                  onClick={() => handleOpenConvertQuotation(sph)}
                                  title="Konversi SPH ini Menjadi Faktur Penjualan Resmi (Deal)"
                                  className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              )}

                              {/* Tombol Aksi Status: Tandai Expired */}
                              {classification !== "deal" && classification !== "expired" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuotationStatus(sph, "Kedaluwarsa")}
                                  title="Tandai SPH ini sebagai Kedaluwarsa (Expired)"
                                  className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              )}

                              {/* Tombol Aksi Status: Tandai Ditolak (Reject) */}
                              {classification !== "deal" && classification !== "rejected" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuotationStatus(sph, "Ditolak")}
                                  title="Tandai SPH ini sebagai Ditolak oleh Klien (Reject)"
                                  className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}

                              {/* Tombol Aksi Status: Buka Kembali / Re-Aktifkan SPH */}
                              {(classification === "expired" || classification === "rejected") && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuotationStatus(sph, "Terkirim")}
                                  title="Buka Kembali / Aktifkan Kembali SPH ini"
                                  className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              )}

                              {/* Approval Tanda Tangan Direktur */}
                              <button
                                onClick={() => handleOpenApprovalModal(sph as any)}
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
                      );
                    })
                  )}
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
                  value={poSearchQuery}
                  onChange={(e) => setPoSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={poStatusFilter}
                  onChange={(e) => setPoStatusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="Semua">Semua Status PO</option>
                  <option value="Draf">Draf</option>
                  <option value="Dalam Pengiriman">Dalam Pengiriman</option>
                  <option value="Diterima & Lunas">Diterima & Lunas</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>

                <button
                  onClick={() => setIsNewPoModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat PO Baru</span>
                </button>
              </div>
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
                    <th className="p-3">Otorisasi & Approval</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases
                    .filter((po) => {
                      const q = poSearchQuery.toLowerCase();
                      const matchQuery =
                        !poSearchQuery ||
                        (po.poNumber && po.poNumber.toLowerCase().includes(q)) ||
                        (po.supplierName && po.supplierName.toLowerCase().includes(q)) ||
                        (po.supplierContact && po.supplierContact.toLowerCase().includes(q)) ||
                        (po.items &&
                          po.items.some((it) => it.productName && it.productName.toLowerCase().includes(q)));
                      const matchStatus = poStatusFilter === "Semua" || po.status === poStatusFilter;
                      return matchQuery && matchStatus;
                    })
                    .map((po) => (
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
                                : po.status === "Dibatalkan"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap font-bold text-slate-700">
                          {po.paymentStatus}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {po.approvalStatus === "Disetujui & Sah" ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>Disetujui & Sah</span>
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {po.verificationCode || "DST-APP"}
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenApprovalPo(po)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer"
                              title="Klik untuk menyetujui & bubuhkan tanda tangan digital resmi"
                            >
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Menunggu Approval</span>
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Cetak PO */}
                            <button
                              type="button"
                              onClick={() => handleOpenPrintPo(po)}
                              title="Cetak Purchase Order Resmi"
                              className="p-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-700 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Kirim PO via WhatsApp */}
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenSendDocModal({
                                  docType: "PO",
                                  docTitle: "Purchase Order (PO Pengadaan Material)",
                                  docNumber: po.poNumber,
                                  recipientName: po.supplierName,
                                  recipientPhone: po.supplierContact,
                                  date: po.date,
                                  dueDate: po.expectedDelivery,
                                  subject: po.notes || "Pesanan Pengadaan Perangkat & Material Logistik",
                                  grandTotal: po.grandTotal,
                                  paymentStatus: po.paymentStatus,
                                  approvalStatus: po.approvalStatus,
                                  initialTab: "whatsapp",
                                })
                              }
                              title="Kirim PO via WhatsApp ke Supplier"
                              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            {/* Kirim PO via Email */}
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenSendDocModal({
                                  docType: "PO",
                                  docTitle: "Purchase Order (PO Pengadaan Material)",
                                  docNumber: po.poNumber,
                                  recipientName: po.supplierName,
                                  recipientPhone: po.supplierContact,
                                  date: po.date,
                                  dueDate: po.expectedDelivery,
                                  subject: po.notes || "Pesanan Pengadaan Perangkat & Material Logistik",
                                  grandTotal: po.grandTotal,
                                  paymentStatus: po.paymentStatus,
                                  approvalStatus: po.approvalStatus,
                                  initialTab: "email",
                                })
                              }
                              title="Kirim PO via Email ke Supplier"
                              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Mail className="w-4 h-4" />
                            </button>

                            {/* Approval PO */}
                            <button
                              type="button"
                              onClick={() => handleOpenApprovalPo(po)}
                              title={
                                po.approvalStatus === "Disetujui & Sah"
                                  ? "Perbarui Tanda Tangan Digital PO"
                                  : "Approval & Tanda Tangan Digital Direktur"
                              }
                              className={`p-2 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 ${
                                po.approvalStatus === "Disetujui & Sah"
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-700 hover:text-white"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white"
                              }`}
                            >
                              <PenTool className="w-4 h-4" />
                            </button>

                            {/* Edit PO */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditPo(po)}
                              title="Edit Data PO"
                              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Hapus PO */}
                            <button
                              type="button"
                              onClick={() => handleDeletePo(po)}
                              title="Hapus Purchase Order"
                              className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
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

        {/* TAB 3: RETUR PENJUALAN & RETUR PEMBELIAN */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            {/* Top Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100/60 border border-red-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-red-700">Retur Penjualan (Klien)</p>
                  <p className="text-xl font-black text-red-950 mt-1">
                    {formatRupiah(returnsSales.reduce((acc, r) => acc + (Number(r.totalRefund) || 0), 0))}
                  </p>
                  <p className="text-[10px] text-red-600 font-bold mt-0.5">{returnsSales.length} kasus klaim pelanggan</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                  <RotateCcw className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100/60 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-amber-800">Retur Pembelian (Vendor)</p>
                  <p className="text-xl font-black text-amber-950 mt-1">
                    {formatRupiah(returnsPurchase.reduce((acc, r) => acc + (Number(r.totalCredit) || 0), 0))}
                  </p>
                  <p className="text-[10px] text-amber-700 font-bold mt-0.5">{returnsPurchase.length} klaim RMA supplier</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/60 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-emerald-800">Otorisasi & Sah</p>
                  <p className="text-xl font-black text-emerald-950 mt-1">
                    {
                      returnsSales.filter((r) => r.approvalStatus === "Disetujui & Sah").length +
                      returnsPurchase.filter((r) => r.approvalStatus === "Disetujui & Sah").length
                    }{" "}
                    / {returnsSales.length + returnsPurchase.length}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Dokumen berstempel & sah digital</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Retur Penjualan (Dari Pelanggan / Klien) */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100"></div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900">Retur Penjualan (Dari Klien)</h3>
                      <p className="text-[11px] text-slate-500">Klaim cacat fungsi, garansi, & permohonan retur konsumen</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                      {returnsSales.length} Kasus
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenAddReturnSale}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all hover:scale-105"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat Retur</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {returnsSales.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                      <RotateCcw className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-500">Belum ada riwayat retur penjualan dari klien</p>
                    </div>
                  ) : (
                    returnsSales.map((ret) => (
                      <div
                        key={ret.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                              {ret.returnNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">({ret.date})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                ret.status === "Selesai Diganti" || ret.status === "Selesai Diterima & Diganti"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ret.status === "Ditolak"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {ret.status}
                            </span>

                            {ret.approvalStatus === "Disetujui & Sah" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Sah</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenApprovalReturnSale(ret)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                                title="Klik untuk tanda tangani berkas retur"
                              >
                                <Clock className="w-2.5 h-2.5 text-amber-600" />
                                <span>Pending QC</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="font-black text-slate-900 text-xs">{ret.customerName}</p>
                          <p className="text-[11px] text-slate-500">
                            Ref Faktur: <span className="font-bold text-slate-700">{ret.invoiceNumber}</span>
                            {ret.customerPhone && <span> • Telp: {ret.customerPhone}</span>}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-800">
                              {ret.productName} ({ret.qty} {ret.unit})
                            </p>
                            <span className="font-black text-red-600 whitespace-nowrap">
                              {formatRupiah(ret.totalRefund)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-700">Alasan:</span> {ret.reason}
                          </p>
                          <p className="text-[11px] text-dstech-blue font-bold">
                            <span className="font-semibold text-slate-700">Solusi:</span> {ret.resolution}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Pemeriksa: {ret.handledBy}
                            {ret.approvedBy && (
                              <span className="text-emerald-700 font-bold"> • Disahkan oleh: {ret.approvedBy}</span>
                            )}
                          </p>
                        </div>

                        {/* Action buttons toolbar */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[10px] font-mono text-slate-400">
                            {ret.verificationCode || "BAST-RET-DSTECH"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {/* Cetak BAST Retur A4 */}
                            <button
                              type="button"
                              onClick={() => handleOpenPrintReturnSale(ret)}
                              title="Cetak Berita Acara Retur Resmi (A4)"
                              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-700 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Approval QC */}
                            <button
                              type="button"
                              onClick={() => handleOpenApprovalReturnSale(ret)}
                              title={
                                ret.approvalStatus === "Disetujui & Sah"
                                  ? "Perbarui Tanda Tangan QC"
                                  : "Approval & Tanda Tangan Digital QC"
                              }
                              className={`p-1.5 rounded-lg transition-all cursor-pointer shadow-sm hover:scale-105 ${
                                ret.approvalStatus === "Disetujui & Sah"
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-700 hover:text-white"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white"
                              }`}
                            >
                              <PenTool className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditReturnSale(ret)}
                              title="Edit Data Retur"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Hapus */}
                            <button
                              type="button"
                              onClick={() => handleDeleteReturnSale(ret)}
                              title="Hapus Data Retur"
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Retur Pembelian (Ke Vendor / Supplier) */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-100"></div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900">Retur Pembelian (Ke Supplier)</h3>
                      <p className="text-[11px] text-slate-500">RMA vendor, pengembalian cacat pabrik, & nota kredit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      {returnsPurchase.length} Kasus
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenAddReturnPurchase}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all hover:scale-105"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat Retur</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {returnsPurchase.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                      <Truck className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-500">Belum ada riwayat retur pembelian ke supplier</p>
                    </div>
                  ) : (
                    returnsPurchase.map((ret) => (
                      <div
                        key={ret.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                              {ret.returnNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">({ret.date})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                ret.status === "Selesai Diganti Vendor"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ret.status === "Dibatalkan"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {ret.status}
                            </span>

                            {ret.approvalStatus === "Disetujui & Sah" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Sah</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenApprovalReturnPurchase(ret)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                                title="Klik untuk tanda tangani berkas retur vendor"
                              >
                                <Clock className="w-2.5 h-2.5 text-amber-600" />
                                <span>Pending Logistik</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="font-black text-slate-900 text-xs">{ret.supplierName}</p>
                          <p className="text-[11px] text-slate-500">
                            Ref PO: <span className="font-bold text-slate-700">{ret.poNumber}</span>
                            {ret.supplierContact && <span> • Kontak: {ret.supplierContact}</span>}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-800">
                              {ret.productName} ({ret.qty} {ret.unit})
                            </p>
                            <span className="font-black text-amber-800 whitespace-nowrap">
                              {formatRupiah(ret.totalCredit)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-700">Alasan:</span> {ret.reason}
                          </p>
                          <p className="text-[11px] text-amber-900 font-bold">
                            <span className="font-semibold text-slate-700">Klaim:</span> {ret.resolution}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Penanggung Jawab: {ret.handledBy}
                            {ret.approvedBy && (
                              <span className="text-emerald-700 font-bold"> • Disahkan oleh: {ret.approvedBy}</span>
                            )}
                          </p>
                        </div>

                        {/* Action buttons toolbar */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[10px] font-mono text-slate-400">
                            {ret.verificationCode || "BAST-RMA-VENDOR"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {/* Cetak BAST Retur A4 */}
                            <button
                              type="button"
                              onClick={() => handleOpenPrintReturnPurchase(ret)}
                              title="Cetak Berita Acara RMA Vendor Resmi (A4)"
                              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-700 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Approval Logistik */}
                            <button
                              type="button"
                              onClick={() => handleOpenApprovalReturnPurchase(ret)}
                              title={
                                ret.approvalStatus === "Disetujui & Sah"
                                  ? "Perbarui Tanda Tangan Logistik"
                                  : "Approval & Tanda Tangan Digital Logistik"
                              }
                              className={`p-1.5 rounded-lg transition-all cursor-pointer shadow-sm hover:scale-105 ${
                                ret.approvalStatus === "Disetujui & Sah"
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-700 hover:text-white"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white"
                              }`}
                            >
                              <PenTool className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditReturnPurchase(ret)}
                              title="Edit Data Retur"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Hapus */}
                            <button
                              type="button"
                              onClick={() => handleDeleteReturnPurchase(ret)}
                              title="Hapus Data Retur"
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                    <th className="p-3 text-center w-16">Aksi</th>
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
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteCashFlow(cash.id, cash.description)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                            title="Hapus Transaksi Kas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

              {/* Branch & Warehouse Selection for Sale Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-200/80">
                <div>
                  <label className="text-[11px] font-black text-dstech-blue block mb-1">
                    Kantor Cabang Penjualan:
                  </label>
                  <select
                    value={saleForm.branchId}
                    onChange={(e) => setSaleForm({ ...saleForm, branchId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-blue-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-dstech-blue focus:outline-none cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-dstech-blue block mb-1">
                    Titik Gudang Pengeluaran Barang (Sumber Stok):
                  </label>
                  <select
                    value={saleForm.warehouseId}
                    onChange={(e) => setSaleForm({ ...saleForm, warehouseId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-blue-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-dstech-blue focus:outline-none cursor-pointer"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.city || w.code})
                      </option>
                    ))}
                  </select>
                </div>
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
                      <div className="col-span-5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-bold">Produk / Jasa</span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleSelectProductForSale(idx, e.target.value);
                            }}
                            defaultValue=""
                            className="text-[9px] bg-blue-50 hover:bg-blue-100 text-dstech-blue font-bold border border-blue-200 rounded px-1.5 py-0.5 max-w-[190px] truncate cursor-pointer"
                          >
                            <option value="">⚡ Pilih Katalog ({products.length})</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.category}] {p.name} - {formatRupiah(p.price)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Nama Barang / Jasa..."
                          value={it.productName}
                          onChange={(e) => handleSaleItemChange(idx, "productName", e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                        {/* Live Stock Badge */}
                        {(() => {
                          const info = getProductStockInfo(it.productId || it.productName, saleForm.warehouseId);
                          if (!info) return null;
                          const isOverStock = !info.isService && it.qty > info.stock;
                          return (
                            <div className="flex flex-wrap items-center gap-1 pt-0.5">
                              <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border ${info.badgeClass}`}>
                                <Package className="w-2.5 h-2.5" />
                                {info.label}
                              </span>
                              {isOverStock && (
                                <span className="text-[8px] text-red-600 font-bold bg-red-50 border border-red-200 px-1 py-0.5 rounded">
                                  ⚠️ Qty ({it.qty}) &gt; Stok ({info.stock})
                                </span>
                              )}
                            </div>
                          );
                        })()}
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
                const { subtotal, discountVal, afterDiscount, taxAmount, grandTotal, dpAmount } = calculateSaleTotals();
                return (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Subtotal:</span>
                      <span className="font-bold">{formatRupiah(subtotal)}</span>
                    </div>
                    {/* Panel Diskon Negosiasi Proyek Fleksibel */}
                    <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Diskon Kesepakatan / Negosiasi Khusus:</span>
                        </div>
                        {/* Selector Mode: Rp vs % */}
                        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              const currSub = saleForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
                              setSaleForm((prev) => ({
                                ...prev,
                                discountType: "percent",
                                discount: Math.round((currSub * (Number(prev.discountPercent) || 0)) / 100),
                              }));
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                              saleForm.discountType === "percent"
                                ? "bg-amber-500 text-slate-950 shadow-sm"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            % Persen
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSaleForm((prev) => ({
                                ...prev,
                                discountType: "fixed",
                              }));
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                              saleForm.discountType !== "percent"
                                ? "bg-amber-500 text-slate-950 shadow-sm"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Rp Nominal
                          </button>
                        </div>
                      </div>

                      {/* Quick Chips Persen jika mode percent */}
                      {saleForm.discountType === "percent" && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400">Pilihan Cepat:</span>
                            {[0, 2.5, 5, 7.5, 10, 15].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => {
                                  const currSub = saleForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
                                  const val = Math.round((currSub * pct) / 100);
                                  setSaleForm((prev) => ({
                                    ...prev,
                                    discountType: "percent",
                                    discountPercent: pct,
                                    discount: val,
                                  }));
                                }}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                  Number(saleForm.discountPercent) === pct
                                    ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm"
                                    : "bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/50"
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Custom Persentase (%):</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={0.5}
                                  value={saleForm.discountPercent ?? 0}
                                  onChange={(e) => {
                                    const pct = Number(e.target.value) || 0;
                                    const currSub = saleForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
                                    const val = Math.round((currSub * pct) / 100);
                                    setSaleForm((prev) => ({
                                      ...prev,
                                      discountPercent: pct,
                                      discount: val,
                                    }));
                                  }}
                                  className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold"
                                />
                                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Nilai Terpotong (Otomatis):</label>
                              <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-red-400 text-xs font-bold font-mono">
                                - {formatRupiah(discountVal)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Input Nominal jika mode fixed */}
                      {saleForm.discountType !== "percent" && (
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">Potongan Nominal Negosiasi (Rp):</label>
                          <input
                            type="number"
                            min={0}
                            value={saleForm.discount || 0}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const currSub = saleForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
                              const pct = currSub > 0 ? Number(((val / currSub) * 100).toFixed(1)) : 0;
                              setSaleForm((prev) => ({
                                ...prev,
                                discount: val,
                                discountPercent: pct,
                              }));
                            }}
                            className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-red-400 text-xs font-bold"
                            placeholder="Contoh: 500000"
                          />
                        </div>
                      )}

                      {/* Label Keterangan Diskon */}
                      <div>
                        <label className="text-[9px] text-slate-400 block mb-0.5">Keterangan Diskon di Faktur Cetak:</label>
                        <input
                          type="text"
                          value={saleForm.discountLabel || ""}
                          onChange={(e) => setSaleForm({ ...saleForm, discountLabel: e.target.value })}
                          placeholder="Contoh: Diskon Khusus Negosiasi Proyek / Loyalitas Klien"
                          className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px]"
                        />
                      </div>
                    </div>

                    {/* PPN Input */}
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Tarif Pajak PPN (%):</label>
                      <input
                        type="number"
                        min={0}
                        value={saleForm.taxRate}
                        onChange={(e) => setSaleForm({ ...saleForm, taxRate: Number(e.target.value) })}
                        className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                      />
                    </div>

                    {/* Rincian Transparan */}
                    <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                      {discountVal > 0 && (
                        <>
                          <div className="flex items-center justify-between text-red-400 font-bold">
                            <span>
                              {saleForm.discountLabel || "Diskon Khusus Negosiasi"}
                              {saleForm.discountType === "percent" && saleForm.discountPercent ? ` (${saleForm.discountPercent}%)` : ""}:
                            </span>
                            <span>- {formatRupiah(discountVal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300 font-medium">
                            <span>Dasar Pengenaan Pajak (DPP Kesepakatan):</span>
                            <span className="font-bold">{formatRupiah(afterDiscount)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Nominal Pajak PPN ({saleForm.taxRate}%):</span>
                        <span className="font-bold">{formatRupiah(taxAmount)}</span>
                      </div>
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
      </div>

      {/* MODAL 3: CETAK FAKTUR PENJUALAN RESMI (PRINT PREVIEW) */}
      {selectedInvoiceForPrint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn print-modal-backdrop"
          onClick={() => setSelectedInvoiceForPrint(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto print-modal-box"
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

                {/* Format Resmi 2 Halaman */}
                <div className="px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Format Resmi 2 Halaman</span>
                </div>

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

            {/* Mode Penagihan jika Faktur DP (DP vs Pelunasan vs Kontrak Utuh) */}
            {selectedInvoiceForPrint.invoiceType === "DP" && (
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Receipt className="w-4 h-4 text-dstech-blue" />
                  <span>Pilih Lembar Tagihan:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPrintBillingStage("DP")}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      printBillingStage === "DP"
                        ? "bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-300"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>📄 Tahap 1: Pengajuan DP ({selectedInvoiceForPrint.dpPercentage || 50}%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintBillingStage("Pelunasan")}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      printBillingStage === "Pelunasan"
                        ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>🧾 Tahap 2: Penagihan Pelunasan (Sisa Kontrak)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintBillingStage("Full")}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      printBillingStage === "Full"
                        ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-400"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>📋 Kontrak Utuh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const s = selectedInvoiceForPrint;
                      setSelectedInvoiceForPrint(null);
                      handleOpenBastModal(s);
                    }}
                    title="Buka Dokumen Berita Acara Serah Terima (BAST)"
                    className="px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 shadow-sm"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>📄 Cetak BAST Proyek</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const s = selectedInvoiceForPrint;
                      setSelectedInvoiceForPrint(null);
                      handleOpenDeliveryModal(s);
                    }}
                    title="Buka Dokumen Surat Jalan Pengiriman Material"
                    className="px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 shadow-sm"
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>🚚 Cetak Surat Jalan</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tips Cetak Pas Penuh Kertas A4 */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900 print:hidden">
              <span className="text-base leading-none">💡</span>
              <div className="space-y-0.5">
                <p className="font-bold">Tips Cetak Pas Penuh Kertas A4 (Full Bleed):</p>
                <p className="text-[11px] text-amber-800">
                  Pada dialog print browser (Ctrl+P), ubah <strong>Margins</strong> menjadi <strong>&quot;None&quot; (Tidak ada)</strong> dan centang <strong>Background graphics</strong> agar kop surat menempel presisi di ujung kertas A4 dan tidak terbagi 2 halaman.
                </p>
              </div>
            </div>

            {/* FAKTUR CONTENT CONTAINER (Siap Cetak & Watermarked) */}
            <div
              className="relative rounded-2xl border border-slate-300 bg-white px-6 sm:px-8 space-y-4 print:space-y-2.5 text-slate-800 overflow-hidden shadow-sm print-document-sheet print-page-break"
              style={{
                paddingTop: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingTop || 80) : 24}px`,
                paddingBottom: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingBottom || 75) : 24}px`,
              }}
            >
              {/* Background Kop Surat Resmi DSTech */}
              {financeSettings.letterheadEnabled && financeSettings.letterheadUrl && (
                <img
                  src={financeSettings.letterheadUrl}
                  alt="Kop Surat Resmi"
                  className={`absolute pointer-events-none z-0 select-none print-letterhead-img ${
                    financeSettings.letterheadFitMode === "bleed" ? "mode-bleed" : "inset-0 w-full h-full"
                  }`}
                  style={{
                    objectFit:
                      financeSettings.letterheadFitMode === "cover"
                        ? "cover"
                        : financeSettings.letterheadFitMode === "contain"
                        ? "contain"
                        : "fill",
                    objectPosition: "top center",
                    width: financeSettings.letterheadFitMode === "bleed" ? "102.5%" : "100%",
                    height: financeSettings.letterheadFitMode === "bleed" ? "102%" : "100%",
                    top: financeSettings.letterheadFitMode === "bleed" ? "-1%" : "0",
                    left: financeSettings.letterheadFitMode === "bleed" ? "-1.25%" : "0",
                    opacity: financeSettings.watermarkOpacity !== undefined ? financeSettings.watermarkOpacity : 1,
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                  }}
                />
              )}

              <div className="relative z-10 space-y-4 print:space-y-2.5">
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
                    <span
                      className={`px-3 py-1 rounded-md text-white font-black text-xs uppercase tracking-wider inline-block ${
                        selectedInvoiceForPrint.invoiceType === "DP" && printBillingStage === "Pelunasan"
                          ? "bg-emerald-700"
                          : selectedInvoiceForPrint.invoiceType === "DP" && printBillingStage === "DP"
                          ? "bg-amber-600"
                          : "bg-slate-900"
                      }`}
                    >
                      {selectedInvoiceForPrint.invoiceType === "DP"
                        ? printBillingStage === "Pelunasan"
                          ? "FAKTUR PENAGIHAN PELUNASAN KONTRAK"
                          : printBillingStage === "DP"
                          ? `FAKTUR PENGAJUAN UANG MUKA (DP ${selectedInvoiceForPrint.dpPercentage || 50}%)`
                          : "FAKTUR KONTRAK PENJUALAN"
                        : "FAKTUR PENJUALAN"}
                    </span>
                    <p className="font-mono font-black text-sm text-dstech-blue">
                      {selectedInvoiceForPrint.invoiceNumber}
                    </p>
                    {selectedInvoiceForPrint.invoiceType === "DP" && printBillingStage === "Pelunasan" && (
                      <p className="text-[10px] font-bold text-emerald-700">
                        Penagihan Sisa Kontrak Pasca BAST
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 font-medium">
                      Tanggal: {selectedInvoiceForPrint.date}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Jatuh Tempo: {selectedInvoiceForPrint.dueDate}
                    </p>
                  </div>
                </div>

                {/* Banner Rincian Penagihan Sesuai Mode (DP vs Pelunasan vs Kontrak Utuh) */}
                {selectedInvoiceForPrint.invoiceType === "DP" && printBillingStage === "Pelunasan" && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <span className="font-black flex items-center gap-1.5 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Penagihan Pelunasan Kontrak Pekerjaan (Pasca BAST)
                      </span>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Uang Muka (DP {selectedInvoiceForPrint.dpPercentage || 50}%) sebesar {formatRupiah(selectedInvoiceForPrint.dpAmount || 0)} telah diterima LUNAS. Lembar ini adalah penagihan sisa pelunasan pekerjaan setelah penyelesaian Berita Acara Serah Terima (BAST).
                      </p>
                    </div>
                    <div className="sm:text-right whitespace-nowrap bg-white/90 p-2 rounded-xl border border-emerald-200">
                      <span className="text-[9px] text-emerald-700 block uppercase font-bold tracking-wider">
                        Jumlah Tagihan Pelunasan:
                      </span>
                      <span className="text-base font-black font-mono text-emerald-900">
                        {formatRupiah(selectedInvoiceForPrint.remainingAmount || Math.max(0, selectedInvoiceForPrint.grandTotal - (selectedInvoiceForPrint.dpAmount || 0)))}
                      </span>
                    </div>
                  </div>
                )}

                {selectedInvoiceForPrint.invoiceType === "DP" && printBillingStage === "DP" && (
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

                {selectedInvoiceForPrint.invoiceType === "DP" && printBillingStage === "Full" && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-300 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <span className="font-black flex items-center gap-1.5 text-dstech-blue">
                        <Layers className="w-4 h-4 text-dstech-blue" />
                        Faktur Tagihan Total Kontrak Resmi
                      </span>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Rekapitulasi tagihan nilai kontrak keseluruhan pekerjaan & pengadaan barang PT. DSTech Smart Perkasa.
                      </p>
                    </div>
                    <div className="sm:text-right whitespace-nowrap bg-white/90 p-2 rounded-xl border border-blue-200">
                      <span className="text-[9px] text-blue-700 block uppercase font-bold tracking-wider">
                        Total Nilai Kontrak:
                      </span>
                      <span className="text-base font-black font-mono text-dstech-blue">
                        {formatRupiah(selectedInvoiceForPrint.grandTotal)}
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

                {/* Referensi Resmi ke Lampiran Halaman 2 (Detail Item & Spesifikasi Dipisahkan ke Halaman 2) */}
                <div className="p-3.5 rounded-2xl bg-purple-50/90 border border-purple-300 text-xs text-purple-950 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <p className="font-black text-slate-900">Rincian Deskripsi Item Produk & Jasa Instalasi:</p>
                      <p className="text-[11px] text-purple-800">
                        Rincian lengkap deskripsi produk, volume kuantiti, dan harga satuan unit tercantum pada <strong>Lampiran Halaman 2</strong> dokumen ini ({selectedInvoiceForPrint.items.length} item tagihan).
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-200/90 text-purple-900 font-mono font-black text-[10px] shrink-0">
                    {selectedInvoiceForPrint.items.length} ITEM
                  </span>
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
                      <>
                        <div className="flex items-center justify-between text-red-600">
                          <span>
                            {selectedInvoiceForPrint.discountLabel || "Diskon Khusus Negosiasi"}
                            {selectedInvoiceForPrint.discountType === "percent" && selectedInvoiceForPrint.discountPercent ? ` (${selectedInvoiceForPrint.discountPercent}%)` : ""}:
                          </span>
                          <span className="font-bold">- {formatRupiah(selectedInvoiceForPrint.discount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 text-[11px] pt-0.5 border-t border-dashed border-slate-200">
                          <span>DPP / Netto Kontrak:</span>
                          <span className="font-bold text-slate-900">
                            {formatRupiah(Math.max(0, selectedInvoiceForPrint.subtotal - selectedInvoiceForPrint.discount))}
                          </span>
                        </div>
                      </>
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
                      <div className={`p-2.5 rounded-xl border space-y-1 text-[11px] my-1 ${
                        printBillingStage === "Pelunasan"
                          ? "bg-emerald-50/90 border-emerald-200"
                          : "bg-amber-50 border-amber-200"
                      }`}>
                        {printBillingStage === "Pelunasan" ? (
                          <>
                            <div className="flex items-center justify-between text-slate-700">
                              <span>Total Nilai Kontrak:</span>
                              <span className="font-bold">{formatRupiah(selectedInvoiceForPrint.grandTotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-emerald-800 font-semibold">
                              <span>Uang Muka (DP {selectedInvoiceForPrint.dpPercentage}%) Diterima:</span>
                              <span>- {formatRupiah(selectedInvoiceForPrint.dpAmount || 0)} (Lunas)</span>
                            </div>
                            <div className="border-t border-emerald-200 pt-1 flex items-center justify-between text-xs font-black text-emerald-950">
                              <span>SISA TAGIHAN PELUNASAN:</span>
                              <span className="text-sm font-mono text-emerald-700 font-black">
                                {formatRupiah(selectedInvoiceForPrint.remainingAmount || Math.max(0, selectedInvoiceForPrint.grandTotal - (selectedInvoiceForPrint.dpAmount || 0)))}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between text-amber-900 font-bold">
                              <span>Tagihan Uang Muka ({selectedInvoiceForPrint.dpPercentage}%):</span>
                              <span>{formatRupiah(selectedInvoiceForPrint.dpAmount || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Sisa Pelunasan Pasca BAST:</span>
                              <span>{formatRupiah(Math.max(0, selectedInvoiceForPrint.grandTotal - (selectedInvoiceForPrint.dpAmount || 0)))}</span>
                            </div>
                          </>
                        )}
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
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                  {/* Sisi Kiri: Penerima / Klien */}
                  <div className="flex flex-col justify-between h-36 border border-slate-200/80 rounded-xl p-2.5 bg-white/70 shadow-sm text-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Penerima / Klien</p>
                      <p className="text-xs font-black text-slate-900 mt-0.5">{selectedInvoiceForPrint.customerName}</p>
                    </div>

                    <div className="h-11 flex items-center justify-center text-slate-300 text-[9px] italic">
                      (Tanda Tangan & Stempel Resmi Klien)
                    </div>

                    <div className="pt-1 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-xs">
                        ( ................................................................ )
                      </p>
                      <p className="text-[9px] text-slate-500">
                        Nama & Jabatan Penandatangan Klien
                      </p>
                    </div>
                  </div>

                  {/* Sisi Kanan: Pengirim / PT. DSTech Smart Perkasa */}
                  <div className="flex flex-col justify-between h-36 border border-slate-200/80 rounded-xl p-2.5 bg-white/70 shadow-sm text-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hormat Kami,</p>
                      <p className="text-xs font-black text-dstech-blue mt-0.5">PT. DSTech Smart Perkasa</p>
                    </div>

                    <div className="h-11 relative flex items-center justify-center">
                      {selectedInvoiceForPrint.approvalStatus === "Disetujui & Sah" ? (
                        <>
                          {/* Stempel Bulat Digital Resmi PT DSTech */}
                          <div className="print-stamp-circle absolute right-2 w-12 h-12 rounded-full border-2 border-dashed border-dstech-blue/50 flex flex-col items-center justify-center text-[6px] text-dstech-blue font-bold uppercase rotate-[-12deg] pointer-events-none bg-blue-50/40">
                            <span className="font-black text-[5.5px]">PT. DSTECH</span>
                            <span className="text-[4.5px] tracking-tight">SMART PERKASA</span>
                            <span className="text-[4px] text-emerald-600 font-mono font-black mt-0.5">DIGITAL SIGN</span>
                          </div>

                          {/* Tanda Tangan Goresan / Gambar */}
                          {selectedInvoiceForPrint.signatureImage ? (
                            <img
                              src={selectedInvoiceForPrint.signatureImage}
                              alt="Tanda Tangan Digital"
                              className="print-signature-img max-h-11 max-w-[130px] object-contain relative z-10"
                            />
                          ) : (
                            <div className="font-serif italic text-base text-slate-800 font-black relative z-10 select-none tracking-wider">
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

            {/* HALAMAN 2: LAMPIRAN RINCIAN ITEM FAKTUR PENJUALAN */}
            <div
              className="relative rounded-2xl border border-slate-300 bg-white px-6 sm:px-8 space-y-4 print:space-y-2.5 text-slate-800 overflow-hidden shadow-sm print-document-sheet print-last-sheet mt-6 print:mt-0"
              style={{
                  paddingTop: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingTop || 80) : 24}px`,
                  paddingBottom: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingBottom || 75) : 24}px`,
                }}
              >
                {/* Background Kop Surat Resmi DSTech */}
                {financeSettings.letterheadEnabled && financeSettings.letterheadUrl && (
                  <img
                    src={financeSettings.letterheadUrl}
                    alt="Kop Surat Resmi"
                    className={`absolute pointer-events-none z-0 select-none print-letterhead-img ${
                      financeSettings.letterheadFitMode === "bleed" ? "mode-bleed" : "inset-0 w-full h-full"
                    }`}
                    style={{
                      objectFit:
                        financeSettings.letterheadFitMode === "cover"
                          ? "cover"
                          : financeSettings.letterheadFitMode === "contain"
                          ? "contain"
                          : "fill",
                      objectPosition: "top center",
                      width: financeSettings.letterheadFitMode === "bleed" ? "102.5%" : "100%",
                      height: financeSettings.letterheadFitMode === "bleed" ? "102%" : "100%",
                      top: financeSettings.letterheadFitMode === "bleed" ? "-1%" : "0",
                      left: financeSettings.letterheadFitMode === "bleed" ? "-1.25%" : "0",
                      opacity: financeSettings.watermarkOpacity !== undefined ? financeSettings.watermarkOpacity : 1,
                      WebkitPrintColorAdjust: "exact",
                      printColorAdjust: "exact",
                    }}
                  />
                )}

                <div className="relative z-10 space-y-4 print:space-y-3">
                  {/* Header Lampiran Faktur */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-slate-900 pb-3">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-dstech-blue block">
                        LAMPIRAN RINCIAN ITEM FAKTUR
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        Rincian Barang & Material Tagihan Penjualan
                      </h4>
                      <p className="text-[11px] text-slate-600 font-bold">
                        PT. DSTECH SMART PERKASA
                      </p>
                    </div>
                    <div className="text-left sm:text-right text-xs space-y-0.5">
                      <p className="font-mono font-black text-dstech-blue">
                        Faktur No: {selectedInvoiceForPrint.invoiceNumber}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Tanggal: {selectedInvoiceForPrint.date}
                      </p>
                      <p className="text-slate-700 font-bold text-[11px]">
                        Klien: {selectedInvoiceForPrint.customerName}
                      </p>
                    </div>
                  </div>

                  {/* Tabel Rincian Item Faktur */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200">
                      <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-wider">
                        <tr>
                          <th className="p-2.5 text-center w-8">No</th>
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
                            <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
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

                  {/* Rekapitulasi Total Lampiran */}
                  <div className="flex justify-end pt-2 text-xs">
                    <div className="w-full sm:w-80 space-y-1.5 bg-slate-50/90 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Subtotal Tagihan:</span>
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
                      <div className="border-t-2 border-slate-900 pt-1.5 flex items-center justify-between text-xs font-black text-slate-900">
                        <span className="uppercase">Total Tagihan:</span>
                        <span className="text-sm text-dstech-blue">{formatRupiah(selectedInvoiceForPrint.grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Catatan Lampiran */}
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-150 text-[11px] text-slate-700 space-y-1">
                    <p className="font-bold text-dstech-blue">Catatan Lampiran Faktur:</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      • Lampiran ini merupakan rincian item barang/jasa resmi yang menjadi satu kesatuan dokumen dengan Faktur Tagihan Nomor {selectedInvoiceForPrint.invoiceNumber}.<br />
                      • Seluruh unit barang bergaransi resmi PT. DSTech Smart Perkasa sesuai kesepakatan surat kontrak/perjanjian kerja sama.
                    </p>
                  </div>

                  {/* Paraf Pengesahan Lampiran */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                    <div className="text-center p-2 rounded-lg bg-slate-50/80 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Paraf Penerima / Klien</p>
                      <div className="h-10 flex items-center justify-center text-slate-300 text-[9px] italic">
                        ( .................................................. )
                      </div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50/80 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Paraf PT. DSTech Smart Perkasa</p>
                      <div className="h-10 flex items-center justify-center font-serif italic text-xs font-bold text-slate-800">
                        {selectedInvoiceForPrint.approvedBy || financeSettings.signerName || "H. Agus Supriyadi, S.T."}
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

              {/* Branch & Warehouse Selection for Quotation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100">
                <div>
                  <label className="text-[11px] font-black text-indigo-950 block mb-1">
                    Kantor Cabang Penerbit Penawaran:
                  </label>
                  <select
                    value={quotationForm.branchId}
                    onChange={(e) => setQuotationForm({ ...quotationForm, branchId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-indigo-950 block mb-1">
                    Titik Gudang Acuan Ketersediaan Stok:
                  </label>
                  <select
                    value={quotationForm.warehouseId}
                    onChange={(e) => setQuotationForm({ ...quotationForm, warehouseId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.city || w.code})
                      </option>
                    ))}
                  </select>
                </div>
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
                      <div className="col-span-5 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] text-slate-500 font-bold">Deskripsi Produk / Jasa</label>
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleSelectProductForQuotation(idx, e.target.value);
                            }}
                            defaultValue=""
                            className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded px-1.5 py-0.5 max-w-[190px] truncate cursor-pointer"
                          >
                            <option value="">⚡ Pilih Katalog ({products.length})</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.category}] {p.name} - {formatRupiah(p.price)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Nama barang & spesifikasi teknis..."
                          value={it.productName}
                          onChange={(e) => handleQuotationItemChange(idx, "productName", e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                        {/* Live Stock Badge */}
                        {(() => {
                          const info = getProductStockInfo(it.productId || it.productName, quotationForm.warehouseId);
                          if (!info) return null;
                          const isOverStock = !info.isService && it.qty > info.stock;
                          return (
                            <div className="flex flex-wrap items-center gap-1 pt-0.5">
                              <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border ${info.badgeClass}`}>
                                <Package className="w-2.5 h-2.5" />
                                {info.label}
                              </span>
                              {isOverStock && (
                                <span className="text-[8px] text-red-600 font-bold bg-red-50 border border-red-200 px-1 py-0.5 rounded">
                                  ⚠️ Qty ({it.qty}) &gt; Stok ({info.stock})
                                </span>
                              )}
                            </div>
                          );
                        })()}
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
                const { subtotal, discountVal, afterDiscount, taxAmount, grandTotal } = calculateQuotationTotals();
                return (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Subtotal Barang & Jasa:</span>
                      <span className="font-bold">{formatRupiah(subtotal)}</span>
                    </div>

                    {/* Panel Diskon Negosiasi Proyek Fleksibel */}
                    <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Diskon Kesepakatan / Negosiasi Khusus:</span>
                        </div>
                        {/* Selector Mode: Rp vs % */}
                        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              const currSub = quotationForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
                              setQuotationForm((prev) => ({
                                ...prev,
                                discountType: "percent",
                                discount: Math.round((currSub * (Number(prev.discountPercent) || 0)) / 100),
                              }));
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                              quotationForm.discountType === "percent"
                                ? "bg-amber-500 text-slate-950 shadow-sm"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            % Persen
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQuotationForm((prev) => ({
                                ...prev,
                                discountType: "fixed",
                              }));
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                              quotationForm.discountType !== "percent"
                                ? "bg-amber-500 text-slate-950 shadow-sm"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Rp Nominal
                          </button>
                        </div>
                      </div>

                      {/* Quick Chips Persen jika mode percent */}
                      {quotationForm.discountType === "percent" && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400">Pilihan Cepat:</span>
                            {[0, 2.5, 5, 7.5, 10, 15].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => {
                                  const currSub = quotationForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
                                  const val = Math.round((currSub * pct) / 100);
                                  setQuotationForm((prev) => ({
                                    ...prev,
                                    discountType: "percent",
                                    discountPercent: pct,
                                    discount: val,
                                  }));
                                }}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                  Number(quotationForm.discountPercent) === pct
                                    ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm"
                                    : "bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/50"
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Custom Persentase (%):</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={0.5}
                                  value={quotationForm.discountPercent ?? 0}
                                  onChange={(e) => {
                                    const pct = Number(e.target.value) || 0;
                                    const currSub = quotationForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
                                    const val = Math.round((currSub * pct) / 100);
                                    setQuotationForm((prev) => ({
                                      ...prev,
                                      discountPercent: pct,
                                      discount: val,
                                    }));
                                  }}
                                  className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold"
                                />
                                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Nilai Terpotong (Otomatis):</label>
                              <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-red-400 text-xs font-bold font-mono">
                                - {formatRupiah(discountVal)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Input Nominal jika mode fixed */}
                      {quotationForm.discountType !== "percent" && (
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">Potongan Nominal Negosiasi (Rp):</label>
                          <input
                            type="number"
                            min={0}
                            value={quotationForm.discount || 0}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const currSub = quotationForm.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
                              const pct = currSub > 0 ? Number(((val / currSub) * 100).toFixed(1)) : 0;
                              setQuotationForm((prev) => ({
                                ...prev,
                                discount: val,
                                discountPercent: pct,
                              }));
                            }}
                            className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-red-400 text-xs font-bold"
                            placeholder="Contoh: 500000"
                          />
                        </div>
                      )}

                      {/* Label Keterangan Diskon */}
                      <div>
                        <label className="text-[9px] text-slate-400 block mb-0.5">Keterangan Diskon di Dokumen Cetak:</label>
                        <input
                          type="text"
                          value={quotationForm.discountLabel || ""}
                          onChange={(e) => setQuotationForm({ ...quotationForm, discountLabel: e.target.value })}
                          placeholder="Contoh: Diskon Khusus Negosiasi Proyek / Loyalitas Klien"
                          className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px]"
                        />
                      </div>
                    </div>

                    {/* Opsi Revisi SPH jika sedang Edit SPH */}
                    {isEditQuotationModalOpen && (
                      <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800 text-[11px] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-indigo-300">Penomoran Revisi SPH (Addendum Negosiasi)</p>
                          <p className="text-[10px] text-indigo-200/70">
                            Revisi saat ini: <span className="font-bold font-mono">Rev. 0{editingQuotation?.revision || 0}</span>
                            {(quotationForm as any).isRevision && (
                              <span className="text-emerald-400 font-bold ml-1.5">
                                ➔ Menjadi: Rev. 0{((editingQuotation?.revision || 0) + 1)}
                              </span>
                            )}
                          </p>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer bg-indigo-900/90 px-2.5 py-1.5 rounded-lg border border-indigo-700 hover:bg-indigo-800 transition-all">
                          <input
                            type="checkbox"
                            checked={Boolean((quotationForm as any).isRevision)}
                            onChange={(e) => setQuotationForm((prev) => ({ ...prev, isRevision: e.target.checked } as any))}
                            className="rounded text-indigo-500 focus:ring-0 cursor-pointer"
                          />
                          <span className="font-bold text-white text-[10px]">Tandai Sebagai Revisi Resmi</span>
                        </label>
                      </div>
                    )}

                    {/* PPN Selector */}
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

                    {/* Rincian Transparan */}
                    <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                      {discountVal > 0 && (
                        <>
                          <div className="flex items-center justify-between text-red-400 font-bold">
                            <span>
                              {quotationForm.discountLabel || "Diskon Khusus Negosiasi"}
                              {quotationForm.discountType === "percent" && quotationForm.discountPercent ? ` (${quotationForm.discountPercent}%)` : ""}:
                            </span>
                            <span>- {formatRupiah(discountVal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300 font-medium">
                            <span>Dasar Pengenaan Pajak (DPP Kesepakatan):</span>
                            <span className="font-bold">{formatRupiah(afterDiscount)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Pajak Pertambahan Nilai ({quotationForm.taxRate}%):</span>
                        <span className="font-bold">{formatRupiah(taxAmount)}</span>
                      </div>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn print-modal-backdrop"
          onClick={() => setSelectedQuotationForPrint(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto print-modal-box"
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
                  type="button"
                  onClick={() =>
                    handleOpenSendDocModal({
                      docType: "SPH",
                      docTitle: "Surat Penawaran Harga (SPH)",
                      docNumber: selectedQuotationForPrint.quotationNumber,
                      recipientName: selectedQuotationForPrint.customerName,
                      recipientOrg: selectedQuotationForPrint.customerOrg,
                      recipientPhone: selectedQuotationForPrint.customerPhone,
                      date: selectedQuotationForPrint.date,
                      dueDate: selectedQuotationForPrint.validUntil,
                      subject: selectedQuotationForPrint.subject,
                      grandTotal: selectedQuotationForPrint.grandTotal,
                      subtotal: selectedQuotationForPrint.subtotal,
                      discount: selectedQuotationForPrint.discount,
                      discountLabel: selectedQuotationForPrint.discountLabel,
                      approvalStatus: selectedQuotationForPrint.approvalStatus,
                      initialTab: "whatsapp",
                    })
                  }
                  title="Kirim Penawaran via WhatsApp atau Email"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim WA / Email</span>
                </button>

                {/* Format Resmi 2 Halaman */}
                <div className="px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Format Resmi 2 Halaman</span>
                </div>

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

            {/* Tips Cetak Pas Penuh Kertas A4 */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900 print:hidden">
              <span className="text-base leading-none">💡</span>
              <div className="space-y-0.5">
                <p className="font-bold">Tips Cetak Pas Penuh Kertas A4 (Full Bleed):</p>
                <p className="text-[11px] text-amber-800">
                  Pada dialog print browser (Ctrl+P), ubah <strong>Margins</strong> menjadi <strong>&quot;None&quot; (Tidak ada)</strong> dan centang <strong>Background graphics</strong> agar kop surat menempel presisi di ujung kertas A4.
                </p>
              </div>
            </div>

            {/* SPH OFFICIAL LETTER CONTAINER (A4 Standard Print Layout) */}
            <div
              className="relative rounded-2xl border border-slate-300 bg-white px-6 sm:px-10 space-y-4 print:space-y-2.5 text-slate-800 overflow-hidden shadow-sm print-document-sheet print-page-break"
              style={{
                paddingTop: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingTop || 80) : 24}px`,
                paddingBottom: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingBottom || 75) : 24}px`,
              }}
            >
              {/* Background Kop Surat Resmi DSTech */}
              {financeSettings.letterheadEnabled && financeSettings.letterheadUrl && (
                <img
                  src={financeSettings.letterheadUrl}
                  alt="Kop Surat Resmi"
                  className={`absolute pointer-events-none z-0 select-none print-letterhead-img ${
                    financeSettings.letterheadFitMode === "bleed" ? "mode-bleed" : "inset-0 w-full h-full"
                  }`}
                  style={{
                    objectFit:
                      financeSettings.letterheadFitMode === "cover"
                        ? "cover"
                        : financeSettings.letterheadFitMode === "contain"
                        ? "contain"
                        : "fill",
                    objectPosition: "top center",
                    width: financeSettings.letterheadFitMode === "bleed" ? "102.5%" : "100%",
                    height: financeSettings.letterheadFitMode === "bleed" ? "102%" : "100%",
                    top: financeSettings.letterheadFitMode === "bleed" ? "-1%" : "0",
                    left: financeSettings.letterheadFitMode === "bleed" ? "-1.25%" : "0",
                    opacity: financeSettings.watermarkOpacity !== undefined ? financeSettings.watermarkOpacity : 1,
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                  }}
                />
              )}

              <div className="relative z-10 space-y-4 print:space-y-2.5">
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
                    <p className="font-mono font-black text-sm text-indigo-700 flex items-center justify-start sm:justify-end gap-1.5 flex-wrap">
                      <span>{selectedQuotationForPrint.quotationNumber}</span>
                      {Boolean(selectedQuotationForPrint.revision && selectedQuotationForPrint.revision > 0) && (
                        <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-300">
                          Rev. 0{selectedQuotationForPrint.revision}
                        </span>
                      )}
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
                          <td className="font-mono font-bold text-slate-900">
                            {selectedQuotationForPrint.quotationNumber}
                            {Boolean(selectedQuotationForPrint.revision && selectedQuotationForPrint.revision > 0)
                              ? ` - Rev. 0${selectedQuotationForPrint.revision}`
                              : ""}
                          </td>
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

                {/* Referensi Resmi ke Lampiran Halaman 2 (Detail Item & Spesifikasi Dipisahkan ke Halaman 2) */}
                <div className="p-3.5 rounded-2xl bg-purple-50/90 border border-purple-300 text-xs text-purple-950 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <p className="font-black text-slate-900">Rincian Perangkat, Material & Jasa Teknis:</p>
                      <p className="text-[11px] text-purple-800">
                        Rincian spesifikasi teknis lengkap, kuantiti, dan harga satuan unit tercantum pada <strong>Lampiran Halaman 2</strong> surat penawaran ini ({selectedQuotationForPrint.items.length} item penawaran).
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-200/90 text-purple-900 font-mono font-black text-[10px] shrink-0">
                    {selectedQuotationForPrint.items.length} ITEM
                  </span>
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
                      <>
                        <div className="flex items-center justify-between text-red-600">
                          <span>
                            {selectedQuotationForPrint.discountLabel || "Diskon Khusus Negosiasi"}
                            {selectedQuotationForPrint.discountType === "percent" && selectedQuotationForPrint.discountPercent ? ` (${selectedQuotationForPrint.discountPercent}%)` : ""}:
                          </span>
                          <span className="font-bold">- {formatRupiah(selectedQuotationForPrint.discount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 text-[11px] pt-0.5 border-t border-dashed border-slate-200">
                          <span>DPP / Netto Kesepakatan:</span>
                          <span className="font-bold text-slate-900">
                            {formatRupiah(Math.max(0, selectedQuotationForPrint.subtotal - selectedQuotationForPrint.discount))}
                          </span>
                        </div>
                      </>
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
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                  {/* Sisi Kiri: Penerima / Klien */}
                  <div className="flex flex-col justify-between h-36 border border-slate-200/80 rounded-xl p-2.5 bg-white/70 shadow-sm text-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Disetujui & Diterima Oleh,</p>
                      <p className="text-xs font-black text-slate-900 mt-0.5">
                        {selectedQuotationForPrint.customerOrg || selectedQuotationForPrint.customerName}
                      </p>
                    </div>

                    <div className="h-11 flex items-center justify-center text-slate-300 text-[9px] italic">
                      (Tanda Tangan, Nama Jelas & Stempel Klien)
                    </div>

                    <div className="pt-1 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-xs">
                        {selectedQuotationForPrint.customerName ? `( ${selectedQuotationForPrint.customerName} )` : "( ................................................................ )"}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        PIC / Purchasing / Manajer Terkait
                      </p>
                    </div>
                  </div>

                  {/* Sisi Kanan: Hormat Kami PT. DSTech Smart Perkasa */}
                  <div className="flex flex-col justify-between h-36 border border-slate-200/80 rounded-xl p-2.5 bg-white/70 shadow-sm text-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hormat Kami,</p>
                      <p className="text-xs font-black text-indigo-700 mt-0.5">PT. DSTech Smart Perkasa</p>
                    </div>

                    <div className="h-11 relative flex items-center justify-center">
                      {selectedQuotationForPrint.approvalStatus === "Disetujui & Sah" ? (
                        <>
                          {/* Stempel Bulat Digital Resmi PT DSTech */}
                          <div className="print-stamp-circle absolute right-2 w-12 h-12 rounded-full border-2 border-dashed border-indigo-600/50 flex flex-col items-center justify-center text-[6px] text-indigo-700 font-bold uppercase rotate-[-12deg] pointer-events-none bg-indigo-50/40">
                            <span className="font-black text-[5.5px]">PT. DSTECH</span>
                            <span className="text-[4.5px] tracking-tight">SMART PERKASA</span>
                            <span className="text-[4px] text-emerald-600 font-mono font-black mt-0.5">OFFICIAL SPH</span>
                          </div>

                          {/* Tanda Tangan Goresan / Gambar */}
                          {selectedQuotationForPrint.signatureImage ? (
                            <img
                              src={selectedQuotationForPrint.signatureImage}
                              alt="Tanda Tangan Digital"
                              className="print-signature-img max-h-11 max-w-[130px] object-contain relative z-10"
                            />
                          ) : (
                            <div className="font-serif italic text-base text-slate-800 font-black relative z-10 select-none tracking-wider">
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
                              handleOpenApprovalModal(selectedQuotationForPrint);
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

            {/* HALAMAN 2: LAMPIRAN RINCIAN ITEM & SPESIFIKASI TEKNIS PENAWARAN (SPH) */}
            <div
              className="relative rounded-2xl border border-slate-300 bg-white px-6 sm:px-10 space-y-4 print:space-y-3 text-slate-800 overflow-hidden shadow-sm print-document-sheet print-last-sheet mt-6 print:mt-0"
              style={{
                  paddingTop: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingTop || 80) : 24}px`,
                  paddingBottom: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingBottom || 75) : 24}px`,
                }}
              >
                {/* Background Kop Surat Resmi DSTech */}
                {financeSettings.letterheadEnabled && financeSettings.letterheadUrl && (
                  <img
                    src={financeSettings.letterheadUrl}
                    alt="Kop Surat Resmi"
                    className={`absolute pointer-events-none z-0 select-none print-letterhead-img ${
                      financeSettings.letterheadFitMode === "bleed" ? "mode-bleed" : "inset-0 w-full h-full"
                    }`}
                    style={{
                      objectFit:
                        financeSettings.letterheadFitMode === "cover"
                          ? "cover"
                          : financeSettings.letterheadFitMode === "contain"
                          ? "contain"
                          : "fill",
                      objectPosition: "top center",
                      width: financeSettings.letterheadFitMode === "bleed" ? "102.5%" : "100%",
                      height: financeSettings.letterheadFitMode === "bleed" ? "102%" : "100%",
                      top: financeSettings.letterheadFitMode === "bleed" ? "-1%" : "0",
                      left: financeSettings.letterheadFitMode === "bleed" ? "-1.25%" : "0",
                      opacity: financeSettings.watermarkOpacity !== undefined ? financeSettings.watermarkOpacity : 1,
                      WebkitPrintColorAdjust: "exact",
                      printColorAdjust: "exact",
                    }}
                  />
                )}

                <div className="relative z-10 space-y-4 print:space-y-3">
                  {/* Header Lampiran SPH */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-indigo-900 pb-3">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-600 block">
                        LAMPIRAN SURAT PENAWARAN HARGA (SPH)
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        Rincian Item Perangkat, Material & Jasa Instalasi
                      </h4>
                      <p className="text-[11px] text-slate-600 font-bold">
                        PT. DSTECH SMART PERKASA
                      </p>
                    </div>
                    <div className="text-left sm:text-right text-xs space-y-0.5">
                      <p className="font-mono font-black text-indigo-700">
                        Lampiran No: {selectedQuotationForPrint.quotationNumber}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Tanggal: {selectedQuotationForPrint.date}
                      </p>
                      <p className="text-slate-700 font-bold text-[11px]">
                        Klien: {selectedQuotationForPrint.customerOrg || selectedQuotationForPrint.customerName}
                      </p>
                    </div>
                  </div>

                  {/* Tabel Lengkap Rincian Item Penawaran */}
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

                  {/* Rekapitulasi Total Lampiran */}
                  <div className="flex justify-end pt-2 text-xs">
                    <div className="w-full sm:w-80 space-y-1.5 bg-slate-50/90 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Subtotal Barang & Jasa:</span>
                        <span className="font-bold text-slate-900">{formatRupiah(selectedQuotationForPrint.subtotal)}</span>
                      </div>
                      {selectedQuotationForPrint.discount > 0 && (
                        <div className="flex items-center justify-between text-red-600">
                          <span>Diskon Negosiasi:</span>
                          <span className="font-bold">- {formatRupiah(selectedQuotationForPrint.discount)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-slate-600">
                        <span>PPN ({selectedQuotationForPrint.taxRate}%):</span>
                        <span className="font-bold text-slate-900">{formatRupiah(selectedQuotationForPrint.taxAmount)}</span>
                      </div>
                      <div className="border-t-2 border-indigo-950 pt-1.5 flex items-center justify-between text-xs font-black text-slate-900">
                        <span className="text-indigo-900 uppercase">Total Penawaran:</span>
                        <span className="text-sm text-emerald-600">{formatRupiah(selectedQuotationForPrint.grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Catatan Garansi & Spek Teknis */}
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-150 text-[11px] text-slate-700 space-y-1">
                    <p className="font-bold text-indigo-950">Catatan Lampiran & Ketentuan Teknis:</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      • Seluruh unit perangkat hardware baru dan bergaransi resmi distributor/pabrikan selama 1 (satu) tahun.<br />
                      • Biaya instalasi teknis sudah termasuk penarikan kabel, crimping/konektor, pemasangan bracket, pengujian operasional, dan garansi instalasi 30 hari kalender.<br />
                      • Lampiran rincian ini merupakan dokumen sah yang tidak terpisahkan dari Surat Penawaran Harga Nomor {selectedQuotationForPrint.quotationNumber}.
                    </p>
                  </div>

                  {/* Paraf Pengesahan Lampiran */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                    <div className="text-center p-2 rounded-lg bg-slate-50/80 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Paraf Pemesan / Klien</p>
                      <div className="h-10 flex items-center justify-center text-slate-300 text-[9px] italic">
                        ( .................................................. )
                      </div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50/80 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Paraf PT. DSTech Smart Perkasa</p>
                      <div className="h-10 flex items-center justify-center font-serif italic text-xs font-bold text-indigo-700">
                        {selectedQuotationForPrint.approvedBy || financeSettings.signerName || "H. Agus Supriyadi, S.T."}
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

      {/* MODAL EDIT PURCHASE ORDER (PO) */}
      {isEditPoModalOpen && editingPo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsEditPoModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Perubahan Data Dokumen
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Edit Purchase Order ({editingPo.poNumber})
                </h3>
              </div>
              <button
                onClick={() => setIsEditPoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPo} className="space-y-4 text-xs">
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
                      setEditPoForm((prev) => ({
                        ...prev,
                        supplierName: found.name,
                        supplierContact: `${found.pic} (${found.phone})`,
                      }));
                    }
                  }}
                  defaultValue=""
                  className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Ganti Supplier dari Direktori (atau edit manual) --</option>
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
                    value={editPoForm.supplierName}
                    onChange={(e) => setEditPoForm({ ...editPoForm, supplierName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kontak Sales Vendor:</label>
                  <input
                    type="text"
                    placeholder="PIC / No Telp sales..."
                    value={editPoForm.supplierContact}
                    onChange={(e) => setEditPoForm({ ...editPoForm, supplierContact: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Pesan:</label>
                  <input
                    type="date"
                    required
                    value={editPoForm.date}
                    onChange={(e) => setEditPoForm({ ...editPoForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimasi Tiba:</label>
                  <input
                    type="date"
                    required
                    value={editPoForm.expectedDelivery}
                    onChange={(e) => setEditPoForm({ ...editPoForm, expectedDelivery: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Pengiriman:</label>
                  <select
                    value={editPoForm.status}
                    onChange={(e) => setEditPoForm({ ...editPoForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="Draf">Draf</option>
                    <option value="Dalam Pengiriman">Dalam Pengiriman</option>
                    <option value="Diterima & Lunas">Diterima & Lunas</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Pembayaran:</label>
                  <select
                    value={editPoForm.paymentStatus}
                    onChange={(e) => setEditPoForm({ ...editPoForm, paymentStatus: e.target.value })}
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
                    Daftar Barang yang Dipesan ({editPoForm.items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEditPoItem}
                    className="text-amber-700 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Baris Barang</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {editPoForm.items.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Nama Barang / Sparepart..."
                          value={it.productName}
                          onChange={(e) => handleEditPoItemChange(idx, "productName", e.target.value)}
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
                          onChange={(e) => handleEditPoItemChange(idx, "qty", Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Satuan"
                          value={it.unit}
                          onChange={(e) => handleEditPoItemChange(idx, "unit", e.target.value)}
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
                          onChange={(e) => handleEditPoItemChange(idx, "price", Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {editPoForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEditPoItem(idx)}
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
                const { subtotal, taxAmount, grandTotal } = calculateEditPoTotals();
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
                  value={editPoForm.notes}
                  onChange={(e) => setEditPoForm({ ...editPoForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditPoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan PO</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL APPROVAL & TANDA TANGAN DIGITAL PURCHASE ORDER (PO) */}
      {isApprovalPoModalOpen && selectedPoForApproval && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsApprovalPoModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Approval & Otorisasi Purchase Order</h3>
                  <p className="text-xs text-slate-500">
                    Pengesahan Resmi PO {selectedPoForApproval.poNumber} kepada {selectedPoForApproval.supplierName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsApprovalPoModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Ringkasan PO */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Supplier / Vendor:</span>
                  <p className="font-black text-slate-900 text-xs">{selectedPoForApproval.supplierName}</p>
                  <p className="text-[10px] text-slate-500">{selectedPoForApproval.supplierContact}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Nilai Belanja:</span>
                  <p className="font-black text-amber-700 text-sm">
                    {formatRupiah(selectedPoForApproval.grandTotal)}
                  </p>
                  <span className="text-[10px] font-bold text-slate-500">
                    Termin: {selectedPoForApproval.paymentStatus}
                  </span>
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
                        ? "bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200"
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
                        ? "bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200"
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
                        ? "bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200"
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
                  <div className="relative border-2 border-dashed border-amber-300 rounded-xl bg-slate-50/50 p-1 flex justify-center items-center shadow-inner">
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
                    *Goresan digital akan dibubuhkan secara otomatis pada lembar Purchase Order resmi.
                  </p>
                </div>
              )}

              {/* Mode 2: Master Stored Signature */}
              {approvalMode === "master" && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-center space-y-2">
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
                    *Tanda tangan master resmi terdaftar dan tersimpan di sistem manajemen dokumen.
                  </p>
                </div>
              )}

              {/* Mode 3: Upload Signature File */}
              {approvalMode === "upload" && (
                <div className="space-y-2">
                  <label className="block text-slate-700 font-bold">Pilih Berkas Gambar Tanda Tangan:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (uploadEvent) => {
                        const base64 = uploadEvent.target?.result as string;
                        if (base64) {
                          setUploadedSignatureBase64(base64);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                  {uploadedSignatureBase64 && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <p className="text-[10px] text-slate-500 mb-1">Pratinjau Tanda Tangan:</p>
                      <img
                        src={uploadedSignatureBase64}
                        alt="Uploaded Signature"
                        className="max-h-16 mx-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Data Pejabat yang Mengesahkan */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pejabat Otorisasi:</label>
                  <input
                    type="text"
                    value={signerNameInput}
                    onChange={(e) => setSignerNameInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan:</label>
                  <input
                    type="text"
                    value={signerTitleInput}
                    onChange={(e) => setSignerTitleInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Otorisasi / Pengadaan:</label>
                <textarea
                  rows={2}
                  value={approvalNotesInput}
                  onChange={(e) => setApprovalNotesInput(e.target.value)}
                  placeholder="Catatan verifikasi dokumen..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              {/* Stempel & Verifikasi Info */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>
                  Sistem akan otomatis membubuhkan Stempel Bulat Digital Resmi PT. DSTech Smart Perkasa dan Barcode Verifikasi Sistem (DST-APP) pada lembar PO.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApprovalPoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmittingApproval}
                  onClick={handleApprovePo}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>{isSubmittingApproval ? "Menyimpan Otorisasi..." : "Setujui & Sahkan PO"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK / PRATINJAU DOKUMEN PURCHASE ORDER (PO) A4 */}
      {selectedPoForPrint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn print-modal-backdrop"
          onClick={() => setSelectedPoForPrint(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto print-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Top) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-amber-600" />
                Format Purchase Order Resmi (PO) PT. DSTech Smart Perkasa
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenSettingsModal}
                  title="Ganti Background Kop Surat"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kop Surat</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PO / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setSelectedPoForPrint(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tips Cetak Pas Penuh Kertas A4 */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900 print:hidden">
              <span className="text-base leading-none">💡</span>
              <div className="space-y-0.5">
                <p className="font-bold">Tips Cetak Pas Penuh Kertas A4 (Full Bleed):</p>
                <p className="text-[11px] text-amber-800">
                  Pada dialog print browser (Ctrl+P), ubah <strong>Margins</strong> menjadi <strong>&quot;None&quot; (Tidak ada)</strong> dan centang <strong>Background graphics</strong> agar kop surat menempel presisi di ujung kertas A4 dan tidak terbagi 2 halaman.
                </p>
              </div>
            </div>

            {/* PO OFFICIAL PRINT CONTAINER (A4 Standard Print Layout) */}
            <div
              className="relative rounded-2xl border border-slate-300 bg-white px-6 sm:px-10 space-y-4 print:space-y-2.5 text-slate-800 overflow-hidden shadow-sm print-document-sheet"
              style={{
                paddingTop: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingTop || 80) : 24}px`,
                paddingBottom: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingBottom || 75) : 24}px`,
              }}
            >
              {/* Background Kop Surat Resmi DSTech */}
              {financeSettings.letterheadEnabled && financeSettings.letterheadUrl && (
                <img
                  src={financeSettings.letterheadUrl}
                  alt="Kop Surat Resmi"
                  className={`absolute pointer-events-none z-0 select-none print-letterhead-img ${
                    financeSettings.letterheadFitMode === "bleed" ? "mode-bleed" : "inset-0 w-full h-full"
                  }`}
                  style={{
                    objectFit:
                      financeSettings.letterheadFitMode === "cover"
                        ? "cover"
                        : financeSettings.letterheadFitMode === "contain"
                        ? "contain"
                        : "fill",
                    objectPosition: "top center",
                    width: financeSettings.letterheadFitMode === "bleed" ? "102.5%" : "100%",
                    height: financeSettings.letterheadFitMode === "bleed" ? "102%" : "100%",
                    top: financeSettings.letterheadFitMode === "bleed" ? "-1%" : "0",
                    left: financeSettings.letterheadFitMode === "bleed" ? "-1.25%" : "0",
                    opacity: financeSettings.watermarkOpacity !== undefined ? financeSettings.watermarkOpacity : 1,
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                  }}
                />
              )}

              <div className="relative z-10 space-y-4 print:space-y-2.5">
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
                    <span className="px-3 py-1 rounded-md bg-amber-800 text-white font-black text-xs uppercase tracking-wider inline-block">
                      PURCHASE ORDER (PO)
                    </span>
                    <p className="font-mono font-black text-sm text-amber-700">
                      {selectedPoForPrint.poNumber}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Tanggal Order: {selectedPoForPrint.date}
                    </p>
                    <p className="text-[11px] text-slate-700 font-bold">
                      Est. Tiba: {selectedPoForPrint.expectedDelivery}
                    </p>
                  </div>
                </div>

                {/* Info Vendor & Pengiriman */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 space-y-1">
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
                      DITUJUKAN KEPADA (VENDOR / SUPPLIER):
                    </p>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{selectedPoForPrint.supplierName}</p>
                    <p className="text-slate-600 text-[11px]">Kontak Sales: {selectedPoForPrint.supplierContact || "-"}</p>
                    <p className="text-[11px] text-slate-700 font-medium">
                      Status Pembayaran: <span className="font-bold text-amber-800">{selectedPoForPrint.paymentStatus}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      ALAMAT PENERIMAAN BARANG:
                    </p>
                    <p className="font-black text-slate-900 text-sm mt-0.5">Gudang Utama PT. DSTech Smart Perkasa</p>
                    <p className="text-slate-600 text-[11px]">
                      Perum Bukit Cilegon Asri Blok DB No. 19, Cilegon - Banten
                    </p>
                    <p className="text-[11px] text-slate-600">
                      PIC Penerima Logistik: Staff Gudang DSTech (0822-5949-4242)
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 text-center w-10">No</th>
                        <th className="p-2.5">Deskripsi Barang / Spesifikasi Teknis</th>
                        <th className="p-2.5 text-center w-20">Qty</th>
                        <th className="p-2.5 text-center w-20">Satuan</th>
                        <th className="p-2.5 text-right w-36">Harga Satuan (Rp)</th>
                        <th className="p-2.5 text-right w-36">Total (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPoForPrint.items.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="p-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{item.productName}</td>
                          <td className="p-2.5 text-center font-bold text-slate-800">{item.qty}</td>
                          <td className="p-2.5 text-center text-slate-600">{item.unit}</td>
                          <td className="p-2.5 text-right font-medium text-slate-700">
                            {formatRupiah(item.price)}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900">
                            {formatRupiah(item.total || item.qty * item.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="sm:max-w-md w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-700 block text-[11px]">Catatan / Instruksi Pengiriman:</span>
                    <p className="text-slate-600 text-[11px] whitespace-pre-line">
                      {selectedPoForPrint.notes ||
                        "Kirim barang sesuai jadwal yang telah disepakati dan sertakan Surat Jalan serta Faktur Pajak/Kwitansi resmi."}
                    </p>
                  </div>

                  <div className="w-full sm:w-72 space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                      <span>Subtotal Belanja:</span>
                      <span className="font-bold text-slate-900">{formatRupiah(selectedPoForPrint.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                      <span>PPN Masukan (11%):</span>
                      <span className="font-bold text-slate-900">{formatRupiah(selectedPoForPrint.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm font-black text-slate-900 border-t-2 border-slate-900">
                      <span className="text-amber-800">TOTAL BELANJA PO:</span>
                      <span className="text-emerald-700">{formatRupiah(selectedPoForPrint.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Syarat & Ketentuan PO */}
                <div className="text-[10px] leading-relaxed text-slate-500 border-t border-slate-200 pt-3 space-y-0.5">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Syarat & Ketentuan Purchase Order:
                  </p>
                  <p>1. Barang yang dikirim harus 100% baru (Brand New in Box), original dan bergaransi resmi dari distributor/pabrik.</p>
                  <p>
                    2. Setiap pengiriman wajib melampirkan Surat Jalan dan mencantumkan Nomor PO resmi ini:{" "}
                    <strong>{selectedPoForPrint.poNumber}</strong>.
                  </p>
                  <p>3. Pemeriksaan fisik dan Quality Control (QC) dilakukan saat barang tiba di gudang PT. DSTech Smart Perkasa.</p>
                  <p>
                    4. Pembayaran akan diproses sesuai kesepakatan ({selectedPoForPrint.paymentStatus}) setelah barang dan dokumen
                    penagihan lengkap diterima.
                  </p>
                </div>

                {/* Tanda Tangan Dual Approval (Vendor & Direktur DSTech) */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                  {/* Sisi Kiri: Vendor / Rekanan Supplier */}
                  <div className="flex flex-col justify-between h-36 border border-slate-200/80 rounded-xl p-2.5 bg-white/70 shadow-sm text-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Dikonfirmasi & Diterima Oleh,
                      </p>
                      <p className="text-xs font-black text-slate-900 mt-0.5">
                        {selectedPoForPrint.supplierName}
                      </p>
                    </div>

                    <div className="h-11 flex items-center justify-center text-slate-300 text-[9px] italic">
                      (Tanda Tangan, Nama Jelas & Stempel Vendor)
                    </div>

                    <div className="pt-1 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-xs">
                        {selectedPoForPrint.supplierContact
                          ? `( ${selectedPoForPrint.supplierContact.split("(")[0].trim()} )`
                          : "( ................................................................ )"}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        Sales / PIC Rekanan Vendor
                      </p>
                    </div>
                  </div>

                  {/* Sisi Kanan: Pemesan Resmi PT. DSTech Smart Perkasa */}
                  <div className="flex flex-col justify-between h-36 border border-slate-200/80 rounded-xl p-2.5 bg-white/70 shadow-sm text-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Pemesan Resmi,
                      </p>
                      <p className="text-xs font-black text-amber-800 mt-0.5">PT. DSTech Smart Perkasa</p>
                    </div>

                    <div className="h-11 relative flex items-center justify-center">
                      {selectedPoForPrint.approvalStatus === "Disetujui & Sah" ? (
                        <>
                          {/* Stempel Bulat Digital Resmi PT DSTech */}
                          <div className="print-stamp-circle absolute right-2 w-12 h-12 rounded-full border-2 border-dashed border-amber-600/50 flex flex-col items-center justify-center text-[6px] text-amber-800 font-bold uppercase rotate-[-12deg] pointer-events-none bg-amber-50/40">
                            <span className="font-black text-[5.5px]">PT. DSTECH</span>
                            <span className="text-[4.5px] tracking-tight">SMART PERKASA</span>
                            <span className="text-[4px] text-emerald-600 font-mono font-black mt-0.5">OFFICIAL PO</span>
                          </div>

                          {/* Tanda Tangan Goresan / Gambar */}
                          {selectedPoForPrint.signatureImage ? (
                            <img
                              src={selectedPoForPrint.signatureImage}
                              alt="Tanda Tangan Digital"
                              className="print-signature-img max-h-11 max-w-[130px] object-contain relative z-10"
                            />
                          ) : (
                            <div className="font-serif italic text-base text-slate-800 font-black relative z-10 select-none tracking-wider">
                              {selectedPoForPrint.approvedBy || "H. Agus Supriyadi"}
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
                              setSelectedPoForPrint(null);
                              handleOpenApprovalPo(selectedPoForPrint);
                            }}
                            className="mt-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[9px] cursor-pointer shadow-sm"
                          >
                            Setujui Sekarang
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-xs">
                        ( {selectedPoForPrint.approvedBy || "H. Agus Supriyadi, S.T., M.Kom."} )
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {selectedPoForPrint.approvedTitle || "Direktur Keuangan & Operasional"}
                      </p>
                      {selectedPoForPrint.verificationCode && (
                        <p className="text-[9px] font-mono text-emerald-700 font-bold mt-0.5">
                          Verifikasi: {selectedPoForPrint.verificationCode}
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

      {/* MODAL TAMBAH & EDIT RETUR PENJUALAN (DARI KLIEN) */}
      {(isNewReturnSaleModalOpen || (isEditReturnSaleModalOpen && editingReturnSale)) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setIsNewReturnSaleModalOpen(false);
            setIsEditReturnSaleModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {isEditReturnSaleModalOpen ? "Edit Berkas Retur Penjualan" : "Catat Retur Penjualan dari Klien"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klaim garansi, unit cacat fungsi, atau permohonan retur pelanggan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewReturnSaleModalOpen(false);
                  setIsEditReturnSaleModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={isEditReturnSaleModalOpen ? handleSaveEditReturnSale : handleCreateReturnSaleSubmit}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nomor Retur</label>
                  <input
                    type="text"
                    value={returnSaleForm.returnNumber}
                    readOnly
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tanggal Retur *</label>
                  <input
                    type="date"
                    required
                    value={returnSaleForm.date}
                    onChange={(e) => setReturnSaleForm({ ...returnSaleForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Pilih Referensi Faktur Penjualan */}
              <div className="p-3 bg-red-50/50 border border-red-100 rounded-2xl space-y-2">
                <label className="block text-red-900 font-black">Referensi Faktur Penjualan</label>
                <select
                  value={returnSaleForm.invoiceNumber}
                  onChange={(e) => handleSelectInvoiceForReturnSale(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-red-200 bg-white font-medium text-xs cursor-pointer"
                >
                  <option value="">-- Pilih Faktur Penjualan DSTech --</option>
                  {sales.map((inv) => (
                    <option key={inv.id} value={inv.invoiceNumber}>
                      {inv.invoiceNumber} — {inv.customerName} ({formatRupiah(inv.grandTotal)})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-red-700">
                  *Memilih faktur akan otomatis mengisi nama pelanggan, no. telepon, dan barang terkait.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Klien / Pelanggan *</label>
                  <input
                    type="text"
                    required
                    value={returnSaleForm.customerName}
                    onChange={(e) => setReturnSaleForm({ ...returnSaleForm, customerName: e.target.value })}
                    placeholder="Contoh: PT. Krakatau Steel / RS Kurnia"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kontak / No. Telepon Klien</label>
                  <input
                    type="text"
                    value={returnSaleForm.customerPhone}
                    onChange={(e) => setReturnSaleForm({ ...returnSaleForm, customerPhone: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Barang / Unit yang Diretur *</label>
                <input
                  type="text"
                  required
                  value={returnSaleForm.productName}
                  onChange={(e) => setReturnSaleForm({ ...returnSaleForm, productName: e.target.value })}
                  placeholder="Contoh: Kamera IP Hikvision 4MP DarkFighter (DS-2CD2043G2-I)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kuantitas *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={returnSaleForm.qty}
                    onChange={(e) => {
                      const qty = Number(e.target.value) || 1;
                      setReturnSaleForm({
                        ...returnSaleForm,
                        qty,
                        totalRefund: qty * returnSaleForm.price,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Satuan</label>
                  <input
                    type="text"
                    value={returnSaleForm.unit}
                    onChange={(e) => setReturnSaleForm({ ...returnSaleForm, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={returnSaleForm.price}
                    onChange={(e) => {
                      const price = Number(e.target.value) || 0;
                      setReturnSaleForm({
                        ...returnSaleForm,
                        price,
                        totalRefund: returnSaleForm.qty * price,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nilai Refund (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={returnSaleForm.totalRefund}
                    onChange={(e) =>
                      setReturnSaleForm({ ...returnSaleForm, totalRefund: Number(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Alasan Retur / Kerusakan *</label>
                  <select
                    value={returnSaleForm.reason}
                    onChange={(e) => setReturnSaleForm({ ...returnSaleForm, reason: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer"
                  >
                    <option value="Cacat Fungsi / Tidak Menyala">Cacat Fungsi / Tidak Menyala</option>
                    <option value="Salah Spesifikasi Tipe Barang">Salah Spesifikasi Tipe Barang</option>
                    <option value="Kerusakan Fisik Saat Pengiriman">Kerusakan Fisik Saat Pengiriman</option>
                    <option value="Port Konektor Longgar / Masalah Hardware">Port Konektor Longgar / Hardware</option>
                    <option value="Klaim Garansi Resmi Kerusakan Operasional">Klaim Garansi Kerusakan Operasional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Solusi Penanganan Retur *</label>
                  <select
                    value={returnSaleForm.resolution}
                    onChange={(e) => setReturnSaleForm({ ...returnSaleForm, resolution: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer font-bold text-dstech-blue"
                  >
                    <option value="Ganti Barang Baru">Ganti Barang Baru (Tukar Unit)</option>
                    <option value="Servis & Perbaikan Laboratorium">Servis & Perbaikan Laboratorium</option>
                    <option value="Pengembalian Dana (Refund Kas)">Pengembalian Dana (Refund Kas)</option>
                    <option value="Nota Kredit Pemotongan Faktur">Nota Kredit Pemotongan Faktur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Progres Retur</label>
                  <select
                    value={returnSaleForm.status}
                    onChange={(e) => setReturnSaleForm({ ...returnSaleForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer font-medium"
                  >
                    <option value="Sedang Diproses">Sedang Diproses (Uji QC)</option>
                    <option value="Selesai Diganti">Selesai Diganti & Diterima Klien</option>
                    <option value="Ditolak">Ditolak (Di luar Masa Garansi / Void)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pemeriksa / QC Lapangan</label>
                  <input
                    type="text"
                    value={returnSaleForm.handledBy}
                    onChange={(e) => setReturnSaleForm({ ...returnSaleForm, handledBy: e.target.value })}
                    placeholder="Contoh: Ikhsan Maulidi (Teknisi Senior)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Tambahan / Hasil Tes</label>
                <textarea
                  rows={2}
                  value={returnSaleForm.notes}
                  onChange={(e) => setReturnSaleForm({ ...returnSaleForm, notes: e.target.value })}
                  placeholder="Keterangan kondisi fisik perangkat, kelengkapan kardus/adaptor, atau instruksi garansi..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewReturnSaleModalOpen(false);
                    setIsEditReturnSaleModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-500/20 cursor-pointer"
                >
                  {isEditReturnSaleModalOpen ? "Simpan Perubahan Retur" : "Catat Berkas Retur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH & EDIT RETUR PEMBELIAN (KE SUPPLIER) */}
      {(isNewReturnPurchaseModalOpen || (isEditReturnPurchaseModalOpen && editingReturnPurchase)) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setIsNewReturnPurchaseModalOpen(false);
            setIsEditReturnPurchaseModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {isEditReturnPurchaseModalOpen
                      ? "Edit Berkas Retur Pembelian Vendor"
                      : "Catat Retur Pembelian ke Supplier (Vendor RMA)"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klaim pengembalian cacat pabrik, garansi distributor, & nota kredit supplier
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewReturnPurchaseModalOpen(false);
                  setIsEditReturnPurchaseModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={isEditReturnPurchaseModalOpen ? handleSaveEditReturnPurchase : handleCreateReturnPurchaseSubmit}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nomor Retur Pembelian</label>
                  <input
                    type="text"
                    value={returnPurchaseForm.returnNumber}
                    readOnly
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-amber-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tanggal Retur *</label>
                  <input
                    type="date"
                    required
                    value={returnPurchaseForm.date}
                    onChange={(e) =>
                      setReturnPurchaseForm({ ...returnPurchaseForm, date: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Referensi Purchase Order (PO) */}
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2">
                <label className="block text-amber-900 font-black">Referensi Purchase Order (PO)</label>
                <select
                  value={returnPurchaseForm.poNumber}
                  onChange={(e) => handleSelectPoForReturnPurchase(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-white font-medium text-xs cursor-pointer"
                >
                  <option value="">-- Pilih Purchase Order DSTech --</option>
                  {purchases.map((po) => (
                    <option key={po.id} value={po.poNumber}>
                      {po.poNumber} — {po.supplierName} ({formatRupiah(po.grandTotal)})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-700">
                  *Memilih PO akan otomatis memuat nama supplier resmi, kontak sales, dan produk pesanan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Supplier / Vendor *</label>
                  <input
                    type="text"
                    required
                    value={returnPurchaseForm.supplierName}
                    onChange={(e) =>
                      setReturnPurchaseForm({ ...returnPurchaseForm, supplierName: e.target.value })
                    }
                    placeholder="Contoh: PT. Hikvision Indonesia Mega Distributor"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kontak Sales / Layanan RMA Vendor</label>
                  <input
                    type="text"
                    value={returnPurchaseForm.supplierContact}
                    onChange={(e) =>
                      setReturnPurchaseForm({ ...returnPurchaseForm, supplierContact: e.target.value })
                    }
                    placeholder="Contoh: 021-555-8899 / RMA Center"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Barang / Modul yang Diretur *</label>
                <input
                  type="text"
                  required
                  value={returnPurchaseForm.productName}
                  onChange={(e) =>
                    setReturnPurchaseForm({ ...returnPurchaseForm, productName: e.target.value })
                  }
                  placeholder="Contoh: Kamera IP Hikvision 4MP DarkFighter (DS-2CD2043G2-I)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kuantitas *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={returnPurchaseForm.qty}
                    onChange={(e) => {
                      const qty = Number(e.target.value) || 1;
                      setReturnPurchaseForm({
                        ...returnPurchaseForm,
                        qty,
                        totalCredit: qty * returnPurchaseForm.price,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Satuan</label>
                  <input
                    type="text"
                    value={returnPurchaseForm.unit}
                    onChange={(e) =>
                      setReturnPurchaseForm({ ...returnPurchaseForm, unit: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Harga Beli Satuan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={returnPurchaseForm.price}
                    onChange={(e) => {
                      const price = Number(e.target.value) || 0;
                      setReturnPurchaseForm({
                        ...returnPurchaseForm,
                        price,
                        totalCredit: returnPurchaseForm.qty * price,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total Nilai Kredit (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={returnPurchaseForm.totalCredit}
                    onChange={(e) =>
                      setReturnPurchaseForm({
                        ...returnPurchaseForm,
                        totalCredit: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Alasan Retur ke Vendor *</label>
                  <select
                    value={returnPurchaseForm.reason}
                    onChange={(e) =>
                      setReturnPurchaseForm({ ...returnPurchaseForm, reason: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer"
                  >
                    <option value="Cacat Pabrik / Dead on Arrival (DOA)">Cacat Pabrik / Dead on Arrival (DOA)</option>
                    <option value="Ketidaksesuaian Spesifikasi PO">Ketidaksesuaian Spesifikasi PO</option>
                    <option value="Port Konektor / Firmware Bermasalah">Port Konektor / Firmware Bermasalah</option>
                    <option value="Kerusakan Kemasan & Fisik Saat Pengiriman">Kerusakan Fisik Pengiriman</option>
                    <option value="Klaim Garansi Distributor Resmi">Klaim Garansi Distributor Resmi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Klaim Solusi RMA Vendor *</label>
                  <select
                    value={returnPurchaseForm.resolution}
                    onChange={(e) =>
                      setReturnPurchaseForm({ ...returnPurchaseForm, resolution: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer font-bold text-amber-800"
                  >
                    <option value="Klaim Garansi Tukar Baru">Klaim Garansi Tukar Baru (Replace Unit)</option>
                    <option value="Kredit Nota Pemotongan Hutang">Kredit Nota Pemotongan Hutang PO</option>
                    <option value="Pengembalian Tunai / Transfer Kas">Pengembalian Tunai / Transfer Kas</option>
                    <option value="Perbaikan Sparepart oleh Distributor">Perbaikan Sparepart Distributor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Progres RMA</label>
                  <select
                    value={returnPurchaseForm.status}
                    onChange={(e) =>
                      setReturnPurchaseForm({ ...returnPurchaseForm, status: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer font-medium"
                  >
                    <option value="Dalam Proses RMA Vendor">Dalam Proses RMA Vendor</option>
                    <option value="Selesai Diganti Vendor">Selesai Diganti Unit Baru</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Petugas Pengirim / Logistik</label>
                  <input
                    type="text"
                    value={returnPurchaseForm.handledBy}
                    onChange={(e) =>
                      setReturnPurchaseForm({ ...returnPurchaseForm, handledBy: e.target.value })
                    }
                    placeholder="Contoh: Hendra (Gudang DSTech)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Tambahan & No. Resi RMA</label>
                <textarea
                  rows={2}
                  value={returnPurchaseForm.notes}
                  onChange={(e) =>
                    setReturnPurchaseForm({ ...returnPurchaseForm, notes: e.target.value })
                  }
                  placeholder="Keterangan nomor tiket RMA vendor, ekspedisi kurir pengembalian, nomor resi tracking..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewReturnPurchaseModalOpen(false);
                    setIsEditReturnPurchaseModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {isEditReturnPurchaseModalOpen ? "Simpan Perubahan RMA" : "Catat Retur Pembelian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL APPROVAL TANDA TANGAN DIGITAL RETUR PENJUALAN */}
      {isApprovalReturnSaleModalOpen && selectedReturnSaleForApproval && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsApprovalReturnSaleModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Approval & Tanda Tangan Digital QC Retur
                  </h3>
                  <p className="text-xs text-slate-500">
                    Otorisasi pemeriksaan kelayakan klaim garansi & penggantian unit
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApprovalReturnSaleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Info Box */}
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-red-700 text-sm">
                  {selectedReturnSaleForApproval.returnNumber}
                </span>
                <span className="font-bold text-slate-500">Ref: {selectedReturnSaleForApproval.invoiceNumber}</span>
              </div>
              <p className="font-bold text-slate-900">{selectedReturnSaleForApproval.customerName}</p>
              <div className="flex items-center justify-between text-slate-700">
                <span>
                  {selectedReturnSaleForApproval.productName} ({selectedReturnSaleForApproval.qty}{" "}
                  {selectedReturnSaleForApproval.unit})
                </span>
                <span className="font-black text-red-600">
                  {formatRupiah(selectedReturnSaleForApproval.totalRefund)}
                </span>
              </div>
              <p className="text-[11px] text-dstech-blue font-bold">
                Solusi: {selectedReturnSaleForApproval.resolution}
              </p>
            </div>

            {/* Signature Modes Selector */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setApprovalMode("canvas")}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    approvalMode === "canvas" ? "bg-red-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  ✍️ Gores Layar
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalMode("master")}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    approvalMode === "master" ? "bg-red-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  📂 Master QC DSTech
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalMode("upload")}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    approvalMode === "upload" ? "bg-red-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  📤 Upload Berkas
                </button>
              </div>

              {/* Mode 1: Canvas Drawing */}
              {approvalMode === "canvas" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-bold">Goreskan Tanda Tangan Anda:</label>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[10px] text-red-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Eraser className="w-3 h-3" /> Bersihkan
                    </button>
                  </div>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <canvas
                      ref={canvasRef}
                      width={500}
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
                        ✍️ Bubuhkan tanda tangan pemeriksaan di area ini
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode 2: Master Stored Signature */}
              {approvalMode === "master" && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 text-center space-y-2">
                  <p className="text-[11px] text-slate-600">
                    Menggunakan tanda tangan digital tersimpan Kepala Mutu & QC PT DSTech Smart Perkasa:
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
                </div>
              )}

              {/* Mode 3: Upload Signature File */}
              {approvalMode === "upload" && (
                <div className="space-y-2">
                  <label className="block text-slate-700 font-bold">Pilih Berkas Gambar Tanda Tangan:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (uploadEvent) => {
                        const base64 = uploadEvent.target?.result as string;
                        if (base64) setUploadedSignatureBase64(base64);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                  {uploadedSignatureBase64 && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <img
                        src={uploadedSignatureBase64}
                        alt="Preview Tanda Tangan"
                        className="max-h-16 mx-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Signer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Penandatangan QC *</label>
                  <input
                    type="text"
                    value={signerNameInput}
                    onChange={(e) => setSignerNameInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jabatan Resmi *</label>
                  <input
                    type="text"
                    value={signerTitleInput}
                    onChange={(e) => setSignerTitleInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Rekomendasi Teknis QC</label>
                <textarea
                  rows={2}
                  value={approvalNotesInput}
                  onChange={(e) => setApprovalNotesInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsApprovalReturnSaleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApproveReturnSale}
                disabled={isSubmittingApproval}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-500/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{isSubmittingApproval ? "Memproses..." : "Sahkan & Bubuhkan Tanda Tangan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL APPROVAL TANDA TANGAN DIGITAL RETUR PEMBELIAN */}
      {isApprovalReturnPurchaseModalOpen && selectedReturnPurchaseForApproval && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsApprovalReturnPurchaseModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Approval & Tanda Tangan Digital RMA Vendor
                  </h3>
                  <p className="text-xs text-slate-500">
                    Otorisasi resmi pengiriman retur & pemotongan tagihan hutang supplier
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApprovalReturnPurchaseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Info Box */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-amber-800 text-sm">
                  {selectedReturnPurchaseForApproval.returnNumber}
                </span>
                <span className="font-bold text-slate-500">Ref PO: {selectedReturnPurchaseForApproval.poNumber}</span>
              </div>
              <p className="font-bold text-slate-900">{selectedReturnPurchaseForApproval.supplierName}</p>
              <div className="flex items-center justify-between text-slate-700">
                <span>
                  {selectedReturnPurchaseForApproval.productName} ({selectedReturnPurchaseForApproval.qty}{" "}
                  {selectedReturnPurchaseForApproval.unit})
                </span>
                <span className="font-black text-amber-800">
                  {formatRupiah(selectedReturnPurchaseForApproval.totalCredit)}
                </span>
              </div>
              <p className="text-[11px] text-amber-900 font-bold">
                Klaim: {selectedReturnPurchaseForApproval.resolution}
              </p>
            </div>

            {/* Signature Modes Selector */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setApprovalMode("canvas")}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    approvalMode === "canvas" ? "bg-amber-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  ✍️ Gores Layar
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalMode("master")}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    approvalMode === "master" ? "bg-amber-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  📂 Master DSTech
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalMode("upload")}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    approvalMode === "upload" ? "bg-amber-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  📤 Upload Berkas
                </button>
              </div>

              {/* Mode 1: Canvas Drawing */}
              {approvalMode === "canvas" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-bold">Goreskan Tanda Tangan Logistik:</label>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[10px] text-amber-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Eraser className="w-3 h-3" /> Bersihkan
                    </button>
                  </div>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <canvas
                      ref={canvasRef}
                      width={500}
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
                        ✍️ Bubuhkan tanda tangan otorisasi di area ini
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode 2: Master Stored Signature */}
              {approvalMode === "master" && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-center space-y-2">
                  <p className="text-[11px] text-slate-600">
                    Menggunakan tanda tangan digital tersimpan Kepala Logistik PT DSTech Smart Perkasa:
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
                </div>
              )}

              {/* Mode 3: Upload Signature File */}
              {approvalMode === "upload" && (
                <div className="space-y-2">
                  <label className="block text-slate-700 font-bold">Pilih Berkas Gambar Tanda Tangan:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (uploadEvent) => {
                        const base64 = uploadEvent.target?.result as string;
                        if (base64) setUploadedSignatureBase64(base64);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                  {uploadedSignatureBase64 && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <img
                        src={uploadedSignatureBase64}
                        alt="Preview Tanda Tangan"
                        className="max-h-16 mx-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Signer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Penandatangan Logistik *</label>
                  <input
                    type="text"
                    value={signerNameInput}
                    onChange={(e) => setSignerNameInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jabatan Resmi *</label>
                  <input
                    type="text"
                    value={signerTitleInput}
                    onChange={(e) => setSignerTitleInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Rekomendasi RMA Vendor</label>
                <textarea
                  rows={2}
                  value={approvalNotesInput}
                  onChange={(e) => setApprovalNotesInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsApprovalReturnPurchaseModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApproveReturnPurchase}
                disabled={isSubmittingApproval}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{isSubmittingApproval ? "Memproses..." : "Sahkan & Bubuhkan Tanda Tangan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK LEMBAR BERITA ACARA RETUR PENJUALAN KLIEN (A4 FORMAT) */}
      {selectedReturnSaleForPrint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn print-modal-backdrop"
          onClick={() => setSelectedReturnSaleForPrint(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto print-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Top) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-red-600" />
                Berita Acara Serah Terima Retur Barang (BAST-RMA) Klien
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenSettingsModal}
                  title="Ganti Background Kop Surat"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>Kop Surat</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak BAST / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReturnSaleForPrint(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tips Cetak Pas Penuh Kertas A4 */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900 print:hidden">
              <span className="text-base leading-none">💡</span>
              <div className="space-y-0.5">
                <p className="font-bold">Tips Cetak Pas Penuh Kertas A4 (Full Bleed):</p>
                <p className="text-[11px] text-amber-800">
                  Pada dialog print browser (Ctrl+P), ubah <strong>Margins</strong> menjadi <strong>&quot;None&quot; (Tidak ada)</strong> dan centang <strong>Background graphics</strong> agar kop surat menempel presisi di ujung kertas A4 dan tidak terbagi 2 halaman.
                </p>
              </div>
            </div>

            {/* A4 OFFICIAL PRINT CONTAINER */}
            <div
              className="relative rounded-2xl border border-slate-300 bg-white px-6 sm:px-10 space-y-4 print:space-y-2.5 text-slate-800 overflow-hidden shadow-sm print-document-sheet"
              style={{
                paddingTop: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingTop || 80) : 24}px`,
                paddingBottom: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingBottom || 75) : 24}px`,
              }}
            >
              {/* Background Kop Surat Resmi DSTech */}
              {financeSettings.letterheadEnabled && financeSettings.letterheadUrl && (
                <img
                  src={financeSettings.letterheadUrl}
                  alt="Kop Surat Resmi"
                  className={`absolute pointer-events-none z-0 select-none print-letterhead-img ${
                    financeSettings.letterheadFitMode === "bleed" ? "mode-bleed" : "inset-0 w-full h-full"
                  }`}
                  style={{
                    objectFit:
                      financeSettings.letterheadFitMode === "cover"
                        ? "cover"
                        : financeSettings.letterheadFitMode === "contain"
                        ? "contain"
                        : "fill",
                    objectPosition: "top center",
                    width: financeSettings.letterheadFitMode === "bleed" ? "102.5%" : "100%",
                    height: financeSettings.letterheadFitMode === "bleed" ? "102%" : "100%",
                    top: financeSettings.letterheadFitMode === "bleed" ? "-1%" : "0",
                    left: financeSettings.letterheadFitMode === "bleed" ? "-1.25%" : "0",
                    opacity: financeSettings.watermarkOpacity !== undefined ? financeSettings.watermarkOpacity : 1,
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                  }}
                />
              )}

              <div className="relative z-10 space-y-4 print:space-y-2.5">
                {/* Kop Surat Perusahaan */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
                  <div className="space-y-1">
                    <span className="text-xl sm:text-2xl font-black text-dstech-red tracking-tight">
                      PT. DSTECH SMART PERKASA
                    </span>
                    <p className="text-xs font-semibold text-slate-700">
                      IT Infrastructure, Security System & Smart Technology Solutions
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-md">
                      Jl. Bojonegara No. 88, Jombang, Kota Cilegon, Banten 42411 • Telp/WA: 0812-1188-3344 • Email:
                      support@dstechsmart.com • NIB: 1204220019283
                    </p>
                  </div>
                  <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <span className="inline-block px-3 py-1 rounded-md bg-red-100 text-red-800 font-black text-xs uppercase tracking-wider">
                      BERITA ACARA RETUR (BAST-RMA)
                    </span>
                    <p className="font-mono text-base font-black text-slate-900 mt-1">
                      {selectedReturnSaleForPrint.returnNumber}
                    </p>
                    <p className="text-[11px] text-slate-500">Tanggal Pengajuan: {selectedReturnSaleForPrint.date}</p>
                    <p className="text-[11px] text-slate-500">
                      Ref Faktur:{" "}
                      <span className="font-bold text-slate-800">{selectedReturnSaleForPrint.invoiceNumber}</span>
                    </p>
                  </div>
                </div>

                {/* Sub Judul & Para Pihak */}
                <div className="text-center space-y-1">
                  <h2 className="text-base font-black text-slate-900 tracking-wide uppercase">
                    BERITA ACARA SERAH TERIMA PENGEMBALIAN BARANG (RETUR KLIEN)
                  </h2>
                  <p className="text-[11px] text-slate-500 italic">
                    Dokumen ini merupakan bukti sah serah terima fisik barang untuk pemeriksaan kelayakan garansi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
                  <div className="space-y-1">
                    <p className="font-black text-red-700 uppercase tracking-wider text-[10px]">
                      PIHAK I (KLIEN / PEMOHON RETUR):
                    </p>
                    <p className="font-bold text-slate-900 text-sm">{selectedReturnSaleForPrint.customerName}</p>
                    <p className="text-slate-600">No. Kontak: {selectedReturnSaleForPrint.customerPhone || "-"}</p>
                    <p className="text-slate-600">Alamat: {selectedReturnSaleForPrint.customerAddress || "Banten & Sekitarnya"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                      PIHAK II (PENERIMA & PEMERIKSA TEKNIS):
                    </p>
                    <p className="font-bold text-slate-900 text-sm">PT. DSTech Smart Perkasa</p>
                    <p className="text-slate-600">Divisi: Unit Penjamin Mutu & Laboratorium QC DSTech</p>
                    <p className="text-slate-600">Petugas Pemeriksa: {selectedReturnSaleForPrint.handledBy}</p>
                  </div>
                </div>

                {/* Tabel Spesifikasi Unit Retur */}
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-white font-bold">
                      <tr>
                        <th className="p-2.5 text-center w-10">No</th>
                        <th className="p-2.5">Deskripsi Produk / Komponen yang Diretur</th>
                        <th className="p-2.5 text-center w-24">Jumlah</th>
                        <th className="p-2.5 text-right w-32">Harga Satuan</th>
                        <th className="p-2.5 text-right w-36">Total Nilai Barang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 text-center font-bold">1</td>
                        <td className="p-2.5">
                          <p className="font-bold text-slate-900">{selectedReturnSaleForPrint.productName}</p>
                          <p className="text-[11px] text-red-600 mt-0.5">
                            <span className="font-bold text-slate-700">Alasan Retur / Gejala Kerusakan:</span>{" "}
                            {selectedReturnSaleForPrint.reason}
                          </p>
                          <p className="text-[11px] text-dstech-blue">
                            <span className="font-bold text-slate-700">Tindakan / Solusi yang Disetujui:</span>{" "}
                            {selectedReturnSaleForPrint.resolution}
                          </p>
                        </td>
                        <td className="p-2.5 text-center font-bold">
                          {selectedReturnSaleForPrint.qty} {selectedReturnSaleForPrint.unit}
                        </td>
                        <td className="p-2.5 text-right font-medium text-slate-700">
                          {formatRupiah(selectedReturnSaleForPrint.price)}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {formatRupiah(selectedReturnSaleForPrint.totalRefund)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                      <tr>
                        <td colSpan={4} className="p-2.5 text-right uppercase tracking-wider text-[11px]">
                          Total Nilai Penggantian / Refund:
                        </td>
                        <td className="p-2.5 text-right font-black text-red-600 text-sm">
                          {formatRupiah(selectedReturnSaleForPrint.totalRefund)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Pernyataan & Ketentuan Garansi */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5 text-slate-600">
                  <p className="font-bold text-slate-800">Ketentuan & Catatan Garansi Resmi DSTech:</p>
                  <p>
                    1. Unit yang diretur telah diperiksa kelayakan nomor seri (Serial Number) dan tidak ditemukan tanda
                    kelalaian fisik luar (terbakar tegangan petir / tercelup cairan) yang membatalkan segel resmi.
                  </p>
                  <p>
                    2. Solusi penanganan disepakati berupa{" "}
                    <strong className="text-slate-900">{selectedReturnSaleForPrint.resolution}</strong> sesuai klausul
                    perjanjian pengadaan.
                  </p>
                  {selectedReturnSaleForPrint.notes && (
                    <p className="italic text-slate-700 font-medium">
                      Catatan Tambahan Pemeriksa: {selectedReturnSaleForPrint.notes}
                    </p>
                  )}
                </div>

                {/* Kolom Tanda Tangan Dual Pihak */}
                <div className="grid grid-cols-2 gap-4 pt-2.5">
                  {/* Pihak I: Klien */}
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Pihak I (Yang Menyerahkan),
                    </p>
                    <p className="text-xs font-black text-slate-800">{selectedReturnSaleForPrint.customerName}</p>
                    <div className="h-11 flex items-center justify-center">
                      <div className="font-serif italic text-sm text-slate-400 select-none">
                        ( Tanda Tangan & Nama Terang )
                      </div>
                    </div>
                    <div className="pt-1 border-t border-slate-300">
                      <p className="font-bold text-slate-800 text-xs">
                        ( {selectedReturnSaleForPrint.customerName.split(" ")[0] || "Perwakilan Klien"} )
                      </p>
                      <p className="text-[9px] text-slate-500">Pemohon Retur Resmi</p>
                    </div>
                  </div>

                  {/* Pihak II: DSTech */}
                  <div className="text-center space-y-1 relative">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Pihak II (Pemeriksa Mutu & Otorisasi),
                    </p>
                    <p className="text-xs font-black text-red-600">PT. DSTech Smart Perkasa</p>

                    <div className="h-11 relative flex items-center justify-center">
                      {selectedReturnSaleForPrint.approvalStatus === "Disetujui & Sah" ? (
                        <>
                          {/* Stempel Bulat Digital Resmi DSTech */}
                          <div className="print-stamp-circle absolute right-2 w-12 h-12 rounded-full border-2 border-dashed border-red-500/50 flex flex-col items-center justify-center text-[6px] text-red-700 font-bold uppercase rotate-[-12deg] pointer-events-none bg-red-50/40">
                            <span className="font-black text-[5.5px]">PT. DSTECH</span>
                            <span className="text-[4.5px] tracking-tight">SMART PERKASA</span>
                            <span className="text-[4px] text-emerald-600 font-mono font-black mt-0.5">QC APPROVED</span>
                          </div>

                          {selectedReturnSaleForPrint.signatureImage ? (
                            <img
                              src={selectedReturnSaleForPrint.signatureImage}
                              alt="Tanda Tangan QC"
                              className="print-signature-img max-h-11 max-w-[130px] object-contain relative z-10"
                            />
                          ) : (
                            <div className="font-serif italic text-base text-slate-800 font-black relative z-10 select-none tracking-wider">
                              {selectedReturnSaleForPrint.approvedBy || "H. Agus Supriyadi"}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center border border-dashed border-amber-300 bg-amber-50/80 rounded-lg p-2 w-full">
                          <Clock className="w-4 h-4 text-amber-600 mb-0.5" />
                          <span className="text-[9px] font-black text-amber-800 uppercase">Menunggu Pengesahan QC</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReturnSaleForPrint(null);
                              handleOpenApprovalReturnSale(selectedReturnSaleForPrint);
                            }}
                            className="mt-1 px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] cursor-pointer shadow-sm"
                          >
                            Setujui Sekarang
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-xs">
                        ( {selectedReturnSaleForPrint.approvedBy || "H. Agus Supriyadi, S.T., M.Kom."} )
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {selectedReturnSaleForPrint.approvedTitle || "Kepala Penjamin Mutu & QC"}
                      </p>
                      {selectedReturnSaleForPrint.verificationCode && (
                        <p className="text-[9px] font-mono text-emerald-700 font-bold mt-0.5">
                          Verifikasi: {selectedReturnSaleForPrint.verificationCode}
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

      {/* MODAL CETAK LEMBAR BERITA ACARA RETUR PEMBELIAN VENDOR RMA (A4 FORMAT) */}
      {selectedReturnPurchaseForPrint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn print-modal-backdrop"
          onClick={() => setSelectedReturnPurchaseForPrint(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto print-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Top) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-amber-700" />
                Berita Acara Pengembalian Barang ke Vendor (Vendor RMA Form)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenSettingsModal}
                  title="Ganti Background Kop Surat"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kop Surat</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Form RMA / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReturnPurchaseForPrint(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tips Cetak Pas Penuh Kertas A4 */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900 print:hidden">
              <span className="text-base leading-none">💡</span>
              <div className="space-y-0.5">
                <p className="font-bold">Tips Cetak Pas Penuh Kertas A4 (Full Bleed):</p>
                <p className="text-[11px] text-amber-800">
                  Pada dialog print browser (Ctrl+P), ubah <strong>Margins</strong> menjadi <strong>&quot;None&quot; (Tidak ada)</strong> dan centang <strong>Background graphics</strong> agar kop surat menempel presisi di ujung kertas A4 dan tidak terbagi 2 halaman.
                </p>
              </div>
            </div>

            {/* A4 OFFICIAL PRINT CONTAINER */}
            <div
              className="relative rounded-2xl border border-slate-300 bg-white px-6 sm:px-10 space-y-4 print:space-y-2.5 text-slate-800 overflow-hidden shadow-sm print-document-sheet"
              style={{
                paddingTop: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingTop || 80) : 24}px`,
                paddingBottom: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingBottom || 75) : 24}px`,
              }}
            >
              {/* Background Kop Surat Resmi DSTech */}
              {financeSettings.letterheadEnabled && financeSettings.letterheadUrl && (
                <img
                  src={financeSettings.letterheadUrl}
                  alt="Kop Surat Resmi"
                  className={`absolute pointer-events-none z-0 select-none print-letterhead-img ${
                    financeSettings.letterheadFitMode === "bleed" ? "mode-bleed" : "inset-0 w-full h-full"
                  }`}
                  style={{
                    objectFit:
                      financeSettings.letterheadFitMode === "cover"
                        ? "cover"
                        : financeSettings.letterheadFitMode === "contain"
                        ? "contain"
                        : "fill",
                    objectPosition: "top center",
                    width: financeSettings.letterheadFitMode === "bleed" ? "102.5%" : "100%",
                    height: financeSettings.letterheadFitMode === "bleed" ? "102%" : "100%",
                    top: financeSettings.letterheadFitMode === "bleed" ? "-1%" : "0",
                    left: financeSettings.letterheadFitMode === "bleed" ? "-1.25%" : "0",
                    opacity: financeSettings.watermarkOpacity !== undefined ? financeSettings.watermarkOpacity : 1,
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                  }}
                />
              )}

              <div className="relative z-10 space-y-4 print:space-y-2.5">
                {/* Kop Surat Perusahaan */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
                  <div className="space-y-1">
                    <span className="text-xl sm:text-2xl font-black text-dstech-red tracking-tight">
                      PT. DSTECH SMART PERKASA
                    </span>
                    <p className="text-xs font-semibold text-slate-700">
                      IT Infrastructure, Security System & Smart Technology Solutions
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-md">
                      Jl. Bojonegara No. 88, Jombang, Kota Cilegon, Banten 42411 • Telp/WA: 0812-1188-3344 • Email:
                      procurement@dstechsmart.com • NIB: 1204220019283
                    </p>
                  </div>
                  <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <span className="inline-block px-3 py-1 rounded-md bg-amber-100 text-amber-800 font-black text-xs uppercase tracking-wider">
                      BERITA ACARA RMA VENDOR
                    </span>
                    <p className="font-mono text-base font-black text-slate-900 mt-1">
                      {selectedReturnPurchaseForPrint.returnNumber}
                    </p>
                    <p className="text-[11px] text-slate-500">Tanggal: {selectedReturnPurchaseForPrint.date}</p>
                    <p className="text-[11px] text-slate-500">
                      Ref PO:{" "}
                      <span className="font-bold text-slate-800">{selectedReturnPurchaseForPrint.poNumber}</span>
                    </p>
                  </div>
                </div>

                {/* Sub Judul & Para Pihak */}
                <div className="text-center space-y-1">
                  <h2 className="text-base font-black text-slate-900 tracking-wide uppercase">
                    BERITA ACARA PENGEMBALIAN BARANG KE SUPPLIER (RETURN MERCHANDISE AUTHORIZATION)
                  </h2>
                  <p className="text-[11px] text-slate-500 italic">
                    Dokumen ini adalah bukti resmi pengembalian barang cacat QC pabrik / DOA kepada distributor resmi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
                  <div className="space-y-1">
                    <p className="font-black text-amber-800 uppercase tracking-wider text-[10px]">
                      PIHAK I (PENGIRIM RETUR):
                    </p>
                    <p className="font-bold text-slate-900 text-sm">PT. DSTech Smart Perkasa</p>
                    <p className="text-slate-600">Departemen: Gudang & Manajemen Logistik DSTech</p>
                    <p className="text-slate-600">Petugas Logistik: {selectedReturnPurchaseForPrint.handledBy}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                      PIHAK II (SUPPLIER / DISTRIBUTOR TUJUAN):
                    </p>
                    <p className="font-bold text-slate-900 text-sm">{selectedReturnPurchaseForPrint.supplierName}</p>
                    <p className="text-slate-600">Kontak Service Center: {selectedReturnPurchaseForPrint.supplierContact || "-"}</p>
                    <p className="text-slate-600">Alamat: {selectedReturnPurchaseForPrint.supplierAddress || "Pusat Distributor Jakarta/Tangerang"}</p>
                  </div>
                </div>

                {/* Tabel Spesifikasi Unit Retur */}
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-white font-bold">
                      <tr>
                        <th className="p-2.5 text-center w-10">No</th>
                        <th className="p-2.5">Deskripsi Produk & Komponen RMA</th>
                        <th className="p-2.5 text-center w-24">Jumlah</th>
                        <th className="p-2.5 text-right w-32">Harga Beli Satuan</th>
                        <th className="p-2.5 text-right w-36">Total Nilai Kredit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 text-center font-bold">1</td>
                        <td className="p-2.5">
                          <p className="font-bold text-slate-900">{selectedReturnPurchaseForPrint.productName}</p>
                          <p className="text-[11px] text-amber-900 mt-0.5">
                            <span className="font-bold text-slate-700">Alasan Retur / Cacat Pabrik:</span>{" "}
                            {selectedReturnPurchaseForPrint.reason}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            <span className="font-bold text-slate-700">Klaim Garansi:</span>{" "}
                            {selectedReturnPurchaseForPrint.resolution}
                          </p>
                        </td>
                        <td className="p-2.5 text-center font-bold">
                          {selectedReturnPurchaseForPrint.qty} {selectedReturnPurchaseForPrint.unit}
                        </td>
                        <td className="p-2.5 text-right font-medium text-slate-700">
                          {formatRupiah(selectedReturnPurchaseForPrint.price)}
                        </td>
                        <td className="p-2.5 text-right font-bold text-amber-900">
                          {formatRupiah(selectedReturnPurchaseForPrint.totalCredit)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                      <tr>
                        <td colSpan={4} className="p-2.5 text-right uppercase tracking-wider text-[11px]">
                          Total Nilai Kredit / Penggantian Supplier:
                        </td>
                        <td className="p-2.5 text-right font-black text-amber-900 text-sm">
                          {formatRupiah(selectedReturnPurchaseForPrint.totalCredit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Klausul Ketentuan Vendor RMA */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5 text-slate-600">
                  <p className="font-bold text-slate-800">Ketentuan Proses RMA Vendor:</p>
                  <p>
                    1. Pengembalian barang dilakukan sesuai masa garansi garansi distributor resmi atas Purchase Order{" "}
                    <strong>{selectedReturnPurchaseForPrint.poNumber}</strong>.
                  </p>
                  <p>
                    2. Pihak Supplier diharapkan memproses{" "}
                    <strong className="text-slate-900">{selectedReturnPurchaseForPrint.resolution}</strong> dalam jangka
                    waktu maksimal 7 (tujuh) hari kerja sejak dokumen dan unit fisik diterima.
                  </p>
                  {selectedReturnPurchaseForPrint.notes && (
                    <p className="italic text-slate-700 font-medium">
                      Nomor Tiket RMA / Resi Pengiriman: {selectedReturnPurchaseForPrint.notes}
                    </p>
                  )}
                </div>

                {/* Kolom Tanda Tangan Dual Pihak */}
                <div className="grid grid-cols-2 gap-4 pt-2.5">
                  {/* Pihak I: DSTech Logistik */}
                  <div className="text-center space-y-1 relative">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Pihak I (Logistik & Pengadaan),
                    </p>
                    <p className="text-xs font-black text-amber-800">PT. DSTech Smart Perkasa</p>

                    <div className="h-11 relative flex items-center justify-center">
                      {selectedReturnPurchaseForPrint.approvalStatus === "Disetujui & Sah" ? (
                        <>
                          {/* Stempel Bulat Digital Resmi DSTech */}
                          <div className="print-stamp-circle absolute right-2 w-12 h-12 rounded-full border-2 border-dashed border-amber-600/50 flex flex-col items-center justify-center text-[6px] text-amber-800 font-bold uppercase rotate-[-12deg] pointer-events-none bg-amber-50/40">
                            <span className="font-black text-[5.5px]">PT. DSTECH</span>
                            <span className="text-[4.5px] tracking-tight">SMART PERKASA</span>
                            <span className="text-[4px] text-emerald-600 font-mono font-black mt-0.5">RMA OFFICIAL</span>
                          </div>

                          {selectedReturnPurchaseForPrint.signatureImage ? (
                            <img
                              src={selectedReturnPurchaseForPrint.signatureImage}
                              alt="Tanda Tangan Logistik"
                              className="print-signature-img max-h-11 max-w-[130px] object-contain relative z-10"
                            />
                          ) : (
                            <div className="font-serif italic text-base text-slate-800 font-black relative z-10 select-none tracking-wider">
                              {selectedReturnPurchaseForPrint.approvedBy || "H. Agus Supriyadi"}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center border border-dashed border-amber-300 bg-amber-50/80 rounded-lg p-1.5 w-full">
                          <Clock className="w-3.5 h-3.5 text-amber-600 mb-0.5" />
                          <span className="text-[8.5px] font-black text-amber-800 uppercase">Menunggu Otorisasi Logistik</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReturnPurchaseForPrint(null);
                              handleOpenApprovalReturnPurchase(selectedReturnPurchaseForPrint);
                            }}
                            className="mt-0.5 px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[8.5px] cursor-pointer shadow-sm"
                          >
                            Setujui Sekarang
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-xs">
                        ( {selectedReturnPurchaseForPrint.approvedBy || "H. Agus Supriyadi, S.T., M.Kom."} )
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        {selectedReturnPurchaseForPrint.approvedTitle || "Kepala Logistik & Pengadaan"}
                      </p>
                      {selectedReturnPurchaseForPrint.verificationCode && (
                        <p className="text-[8px] font-mono text-emerald-700 font-bold mt-0.5">
                          Verifikasi: {selectedReturnPurchaseForPrint.verificationCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pihak II: Supplier / Ekspedisi */}
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Pihak II (Tanda Terima Vendor / Ekspedisi),
                    </p>
                    <p className="text-xs font-black text-slate-800">{selectedReturnPurchaseForPrint.supplierName}</p>
                    <div className="h-11 flex items-center justify-center">
                      <div className="font-serif italic text-sm text-slate-400 select-none">
                        ( Stempel & Tanda Tangan Penerima )
                      </div>
                    </div>
                    <div className="pt-1 border-t border-slate-300">
                      <p className="font-bold text-slate-800 text-xs">
                        ( {selectedReturnPurchaseForPrint.supplierContact ? selectedReturnPurchaseForPrint.supplierContact.split(" ")[0] : "Service Center Vendor"} )
                      </p>
                      <p className="text-[9px] text-slate-500">Tanda Terima Resmi Distributor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK LEMBAR BERITA ACARA SERAH TERIMA PEKERJAAN (BAST) (A4 FORMAT) */}
      {isBastModalOpen && selectedSaleForBast && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn print-modal-backdrop"
          onClick={() => setIsBastModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto print-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Top) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-purple-600" />
                Berita Acara Serah Terima Pekerjaan (BAST Proyek) — Dokumen Resmi A4
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBastConfigExpanded(!isBastConfigExpanded)}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border border-purple-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isBastConfigExpanded ? "Tutup Form Edit" : "Edit Data BAST"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenSettingsModal}
                  title="Ganti Background Kop Surat"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>Kop Surat</span>
                </button>

                {selectedSaleForBast.invoiceType === "DP" && selectedSaleForBast.remainingAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const s = selectedSaleForBast;
                      setIsBastModalOpen(false);
                      handleOpenPrintInvoice(s, "Pelunasan");
                    }}
                    title="Lanjut Buka Lembar Tagihan Pelunasan Kontrak"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Lanjut Tagih Pelunasan</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const s = selectedSaleForBast;
                    setIsBastModalOpen(false);
                    handleOpenDeliveryModal(s);
                  }}
                  title="Buka Lembar Surat Jalan Pengiriman Material"
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border border-amber-200"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Surat Jalan</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak BAST / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setIsBastModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form Kustomisasi BAST Interaktif */}
            {isBastConfigExpanded && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-purple-200 space-y-3 text-xs print:hidden animate-fadeIn">
                <div className="flex items-center justify-between">
                  <p className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Penyesuaian Data Lembar Berita Acara (BAST):
                  </p>
                  <span className="text-[10px] text-slate-500">Perubahan langsung ter-update di lembar cetak di bawah</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Nomor BAST</label>
                    <input
                      type="text"
                      value={bastConfig.bastNumber}
                      onChange={(e) => setBastConfig({ ...bastConfig, bastNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Tanggal BAST</label>
                    <input
                      type="date"
                      value={bastConfig.bastDate}
                      onChange={(e) => setBastConfig({ ...bastConfig, bastDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Nama Proyek / Pekerjaan</label>
                    <input
                      type="text"
                      value={bastConfig.projectName}
                      onChange={(e) => setBastConfig({ ...bastConfig, projectName: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Lokasi Proyek / Pekerjaan</label>
                    <input
                      type="text"
                      value={bastConfig.projectLocation}
                      onChange={(e) => setBastConfig({ ...bastConfig, projectLocation: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Yang Menyerahkan (DSTech)</label>
                    <input
                      type="text"
                      value={bastConfig.handedByName}
                      onChange={(e) => setBastConfig({ ...bastConfig, handedByName: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Jabatan Penyerah (DSTech)</label>
                    <input
                      type="text"
                      value={bastConfig.handedByTitle}
                      onChange={(e) => setBastConfig({ ...bastConfig, handedByTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Yang Menerima (Klien / PIC)</label>
                    <input
                      type="text"
                      value={bastConfig.receivedByName}
                      onChange={(e) => setBastConfig({ ...bastConfig, receivedByName: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Jabatan Penerima (Klien)</label>
                    <input
                      type="text"
                      value={bastConfig.receivedByTitle}
                      onChange={(e) => setBastConfig({ ...bastConfig, receivedByTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Garansi Unit Hardware</label>
                    <input
                      type="text"
                      value={bastConfig.warrantyHardware}
                      onChange={(e) => setBastConfig({ ...bastConfig, warrantyHardware: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Garansi Pemeliharaan Teknis</label>
                    <input
                      type="text"
                      value={bastConfig.warrantyMaintenance}
                      onChange={(e) => setBastConfig({ ...bastConfig, warrantyMaintenance: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                  <input
                    type="checkbox"
                    id="includeDspSigBast"
                    checked={bastConfig.includeDspSignature}
                    onChange={(e) => setBastConfig({ ...bastConfig, includeDspSignature: e.target.checked })}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="includeDspSigBast" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    Bubuhkan Tanda Tangan &amp; Stempel Resmi PT. DSTech Smart Perkasa
                  </label>
                </div>
              </div>
            )}

            {/* Tips Cetak Pas Penuh Kertas A4 */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900 print:hidden">
              <span className="text-base leading-none">💡</span>
              <div className="space-y-0.5">
                <p className="font-bold">Tips Cetak Pas Penuh Kertas A4 (Full Bleed):</p>
                <p className="text-[11px] text-amber-800">
                  Pada dialog print browser (Ctrl+P), ubah <strong>Margins</strong> menjadi <strong>&quot;None&quot; (Tidak ada)</strong> dan centang <strong>Background graphics</strong> agar kop surat menempel presisi di ujung kertas A4 dan tidak terbagi 2 halaman.
                </p>
              </div>
            </div>

            {/* A4 OFFICIAL PRINT CONTAINER */}
            <div
              className="relative rounded-2xl border border-slate-300 bg-white px-6 sm:px-10 space-y-3.5 print:space-y-2 text-slate-800 overflow-hidden shadow-sm print-document-sheet"
              style={{
                paddingTop: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingTop || 80) : 24}px`,
                paddingBottom: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingBottom || 75) : 24}px`,
              }}
            >
              {/* Background Kop Surat Resmi DSTech */}
              {financeSettings.letterheadEnabled && financeSettings.letterheadUrl && (
                <img
                  src={financeSettings.letterheadUrl}
                  alt="Kop Surat Resmi"
                  className={`absolute pointer-events-none z-0 select-none print-letterhead-img ${
                    financeSettings.letterheadFitMode === "bleed" ? "mode-bleed" : "inset-0 w-full h-full"
                  }`}
                  style={{
                    objectFit:
                      financeSettings.letterheadFitMode === "cover"
                        ? "cover"
                        : financeSettings.letterheadFitMode === "contain"
                        ? "contain"
                        : "fill",
                    objectPosition: "top center",
                    width: financeSettings.letterheadFitMode === "bleed" ? "102.5%" : "100%",
                    height: financeSettings.letterheadFitMode === "bleed" ? "102%" : "100%",
                    top: financeSettings.letterheadFitMode === "bleed" ? "-1%" : "0",
                    left: financeSettings.letterheadFitMode === "bleed" ? "-1.25%" : "0",
                    opacity: financeSettings.watermarkOpacity !== undefined ? financeSettings.watermarkOpacity : 1,
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                  }}
                />
              )}

              <div className="relative z-10 space-y-3 print:space-y-2">
                {/* Kop Surat Perusahaan */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-slate-900 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-dstech-blue flex items-center justify-center text-white font-black text-base shadow">
                        DSP
                      </div>
                      <div>
                        <h2 className="font-black text-slate-900 text-sm tracking-tight leading-none uppercase">
                          PT. DSTECH SMART PERKASA
                        </h2>
                        <p className="text-[10px] text-dstech-blue font-bold tracking-wider mt-0.5">
                          SOLUSI SECURITY SYSTEM &amp; IT INFRASTRUCTURE
                        </p>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-slate-600 max-w-sm leading-tight mt-1">
                      Jl. KH Wasyid No. 88, Jombang Masjid, Cilegon - Banten 42411
                      <br />
                      NIB: 1205240058291 | NPWP: 40.231.890.1-417.000
                    </p>
                  </div>
                  <div className="sm:text-right space-y-0.5">
                    <span className="inline-block px-3 py-1 rounded-md bg-purple-700 text-white font-black text-[10px] tracking-wider uppercase shadow-sm">
                      BERITA ACARA SERAH TERIMA (BAST)
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono font-bold mt-1">
                      No: <span className="text-slate-900">{bastConfig.bastNumber}</span>
                    </p>
                    <p className="text-[9.5px] text-slate-500">
                      Ref Faktur: <span className="font-mono font-bold text-slate-800">{selectedSaleForBast.invoiceNumber}</span>
                    </p>
                    <p className="text-[9.5px] text-slate-500">
                      Tanggal: <span className="font-bold text-slate-800">{bastConfig.bastDate}</span>
                    </p>
                  </div>
                </div>

                {/* Paragraf Pembuka & Dasar Kesepakatan */}
                <div className="text-[10.5px] text-slate-700 leading-relaxed space-y-1">
                  <p>
                    Pada hari ini, <strong className="text-slate-900">{bastConfig.bastDate}</strong>, bertempat di{" "}
                    <strong className="text-slate-900">{bastConfig.projectLocation}</strong>, kami yang bertanda tangan di bawah ini:
                  </p>
                </div>

                {/* Identitas Dua Belah Pihak (Grid 2 Kolom Kompak) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                  <div className="space-y-0.5 border-r border-slate-200 pr-2">
                    <p className="font-black text-purple-900 uppercase tracking-wider text-[9.5px]">
                      PIHAK I (YANG MENYERAHKAN):
                    </p>
                    <p className="font-bold text-slate-900 text-[11px]">{bastConfig.handedByName}</p>
                    <p className="text-slate-600">{bastConfig.handedByTitle}</p>
                    <p className="text-slate-600 font-semibold">PT. DSTech Smart Perkasa — Cilegon, Banten</p>
                  </div>
                  <div className="space-y-0.5 pl-1">
                    <p className="font-black text-purple-900 uppercase tracking-wider text-[9.5px]">
                      PIHAK II (YANG MENERIMA):
                    </p>
                    <p className="font-bold text-slate-900 text-[11px]">{bastConfig.receivedByName}</p>
                    <p className="text-slate-600">{bastConfig.receivedByTitle}</p>
                    <p className="text-slate-600 font-semibold">{selectedSaleForBast.customerName} ({bastConfig.projectLocation})</p>
                  </div>
                </div>

                {/* Klausul Pernyataan Uji Fungsi */}
                <div className="text-[10px] text-slate-700 leading-tight">
                  <p>
                    Kedua belah pihak sepakat bahwa <strong>PIHAK PERTAMA</strong> telah menyelesaikan pekerjaan pengadaan, instalasi, dan uji fungsi (<em>Commissioning Test</em>), serta <strong>PIHAK KEDUA</strong> telah memeriksa dan menerima hasil pekerjaan/perangkat berikut dalam kondisi <strong>100% LENGKAP, BAIK, DAN BERFUNGSI NORMAL</strong>:
                  </p>
                </div>

                {/* Tabel Spesifikasi Unit / Lingkup Pekerjaan */}
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-[10px] text-left">
                    <thead className="bg-slate-900 text-white font-bold">
                      <tr>
                        <th className="p-2 text-center w-8">No</th>
                        <th className="p-2">Deskripsi Barang &amp; Ruang Lingkup Pekerjaan</th>
                        <th className="p-2 text-center w-20">Volume / Qty</th>
                        <th className="p-2 text-center w-28">Status Uji Fungsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedSaleForBast.items && selectedSaleForBast.items.length > 0 ? (
                        selectedSaleForBast.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="p-2 text-center font-bold text-slate-600">{idx + 1}</td>
                            <td className="p-2">
                              <p className="font-bold text-slate-900">{item.productName}</p>
                              <p className="text-[9px] text-slate-500">Pemasangan terpasang rapi, terkonfigurasi, &amp; lolos uji operasional</p>
                            </td>
                            <td className="p-2 text-center font-bold text-slate-800">
                              {item.qty} {item.unit || "Unit"}
                            </td>
                            <td className="p-2 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] border border-emerald-300">
                                ✓ Baik &amp; Teruji 100%
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="p-2 text-center font-bold">1</td>
                          <td className="p-2">
                            <p className="font-bold text-slate-900">{bastConfig.projectName}</p>
                            <p className="text-[9px] text-slate-500">Seluruh unit perangkat keras dan instalasi teknis terkait</p>
                          </td>
                          <td className="p-2 text-center font-bold">1 Paket</td>
                          <td className="p-2 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] border border-emerald-300">
                              ✓ Baik &amp; Teruji 100%
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Ketentuan Garansi & Hak Penagihan Pelunasan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9.5px] p-2 rounded-xl bg-purple-50/60 border border-purple-200">
                  <div className="space-y-0.5">
                    <p className="font-bold text-purple-950 uppercase tracking-tight">Ketentuan Layanan Purna Jual &amp; Garansi:</p>
                    <p className="text-slate-700">• Garansi Perangkat: <span className="font-semibold text-slate-900">{bastConfig.warrantyHardware}</span></p>
                    <p className="text-slate-700">• Garansi Pemeliharaan: <span className="font-semibold text-slate-900">{bastConfig.warrantyMaintenance}</span></p>
                  </div>
                  <div className="space-y-0.5 sm:border-l sm:border-purple-200 sm:pl-2">
                    <p className="font-bold text-purple-950 uppercase tracking-tight">Klausul Penagihan Pelunasan Kontrak:</p>
                    <p className="text-slate-700">
                      Dengan ditandatanganinya Berita Acara ini, pekerjaan dinyatakan rampung dan sah, sehingga proses penagihan pelunasan sisa kontrak dapat diterbitkan oleh PIHAK PERTAMA.
                    </p>
                  </div>
                </div>

                {/* Blok Tanda Tangan Dual Signature (DSTech & Klien) */}
                <div className="pt-2 border-t border-slate-300 grid grid-cols-2 gap-4">
                  {/* Pihak I: DSTech */}
                  <div className="text-center space-y-1">
                    <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
                      PIHAK I (YANG MENYERAHKAN),
                    </p>
                    <p className="text-[11px] font-black text-slate-900">PT. DSTech Smart Perkasa</p>

                    <div className="h-11 relative flex items-center justify-center">
                      {bastConfig.includeDspSignature ? (
                        <>
                          {/* Stempel Bulat Digital Resmi DSTech */}
                          <div className="print-stamp-circle absolute right-4 w-12 h-12 rounded-full border-2 border-dashed border-red-600/60 flex flex-col items-center justify-center text-[6px] text-red-800 font-bold uppercase rotate-[-12deg] pointer-events-none bg-red-50/40">
                            <span className="font-black text-[5.5px]">PT. DSTECH</span>
                            <span className="text-[4.5px] tracking-tight">SMART PERKASA</span>
                            <span className="text-[4px] text-dstech-blue font-mono font-black mt-0.5">OFFICIAL BAST</span>
                          </div>

                          {financeSettings.masterSignatureUrl ? (
                            <img
                              src={financeSettings.masterSignatureUrl}
                              alt="Tanda Tangan DSP"
                              className="print-signature-img max-h-11 max-w-[130px] object-contain relative z-10"
                            />
                          ) : (
                            <div className="font-serif italic text-base text-slate-800 font-black relative z-10 select-none tracking-wider">
                              {bastConfig.handedByName}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="font-serif italic text-sm text-slate-400 select-none">
                          ( Tanda Tangan &amp; Stempel Basah )
                        </div>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-[11px]">
                        ( {bastConfig.handedByName} )
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        {bastConfig.handedByTitle}
                      </p>
                    </div>
                  </div>

                  {/* Pihak II: Klien / Instansi */}
                  <div className="text-center space-y-1">
                    <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
                      PIHAK II (YANG MENERIMA),
                    </p>
                    <p className="text-[11px] font-black text-slate-900">{selectedSaleForBast.customerName}</p>

                    <div className="h-11 flex items-center justify-center">
                      <div className="font-serif italic text-sm text-slate-400 select-none">
                        ( Tanda Tangan &amp; Materai / Stempel Klien )
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-[11px]">
                        ( {bastConfig.receivedByName} )
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        {bastConfig.receivedByTitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK LEMBAR SURAT JALAN PENGIRIMAN MATERIAL (DELIVERY ORDER) (A4 FORMAT) */}
      {isDeliveryModalOpen && selectedSaleForDelivery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn print-modal-backdrop"
          onClick={() => setIsDeliveryModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto print-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Top) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" />
                Surat Jalan Pengiriman Material Proyek (Delivery Order) — Dokumen Resmi A4
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeliveryConfigExpanded(!isDeliveryConfigExpanded)}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border border-amber-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isDeliveryConfigExpanded ? "Tutup Form Edit" : "Edit Surat Jalan"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenSettingsModal}
                  title="Ganti Background Kop Surat"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>Kop Surat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const s = selectedSaleForDelivery;
                    setIsDeliveryModalOpen(false);
                    handleOpenBastModal(s);
                  }}
                  title="Beralih ke Lembar Berita Acara Serah Terima (BAST)"
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border border-purple-200"
                >
                  <ClipboardCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Cetak BAST</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak SJ / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setIsDeliveryModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form Kustomisasi Surat Jalan Interaktif */}
            {isDeliveryConfigExpanded && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs print:hidden animate-fadeIn">
                <div className="flex items-center justify-between">
                  <p className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Penyesuaian Data Surat Jalan &amp; Ekspedisi:
                  </p>
                  <span className="text-[10px] text-slate-500">Perubahan langsung ter-update di lembar cetak di bawah</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Nomor Surat Jalan</label>
                    <input
                      type="text"
                      value={deliveryConfig.doNumber}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, doNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Tanggal Pengiriman</label>
                    <input
                      type="date"
                      value={deliveryConfig.doDate}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, doDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Gudang Asal Logistik</label>
                    <input
                      type="text"
                      value={deliveryConfig.originWarehouse}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, originWarehouse: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Armada / No. Polisi</label>
                    <input
                      type="text"
                      value={deliveryConfig.vehicleNumber}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, vehicleNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Nama Driver / Pengantar</label>
                    <input
                      type="text"
                      value={deliveryConfig.driverName}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, driverName: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Kontak Telepon Driver</label>
                    <input
                      type="text"
                      value={deliveryConfig.driverPhone}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, driverPhone: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Penerima Lapangan (Klien)</label>
                    <input
                      type="text"
                      value={deliveryConfig.receivedByName}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, receivedByName: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Jabatan Penerima</label>
                    <input
                      type="text"
                      value={deliveryConfig.receivedByTitle}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, receivedByTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Alamat Tujuan Pengiriman</label>
                    <input
                      type="text"
                      value={deliveryConfig.destinationAddress}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, destinationAddress: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Instruksi Khusus / Catatan</label>
                    <input
                      type="text"
                      value={deliveryConfig.notes}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, notes: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                  <input
                    type="checkbox"
                    id="includeDspStampDo"
                    checked={deliveryConfig.includeDspStamp}
                    onChange={(e) => setDeliveryConfig({ ...deliveryConfig, includeDspStamp: e.target.checked })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="includeDspStampDo" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    Bubuhkan Stempel Resmi QC &amp; Logistik Gudang PT. DSTech Smart Perkasa
                  </label>
                </div>
              </div>
            )}

            {/* Tips Cetak Pas Penuh Kertas A4 */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900 print:hidden">
              <span className="text-base leading-none">💡</span>
              <div className="space-y-0.5">
                <p className="font-bold">Tips Cetak Pas Penuh Kertas A4 (Full Bleed):</p>
                <p className="text-[11px] text-amber-800">
                  Pada dialog print browser (Ctrl+P), ubah <strong>Margins</strong> menjadi <strong>&quot;None&quot; (Tidak ada)</strong> dan centang <strong>Background graphics</strong> agar kop surat menempel presisi di ujung kertas A4 dan tidak terbagi 2 halaman.
                </p>
              </div>
            </div>

            {/* A4 OFFICIAL PRINT CONTAINER */}
            <div
              className="relative rounded-2xl border border-slate-300 bg-white px-6 sm:px-10 space-y-3.5 print:space-y-2 text-slate-800 overflow-hidden shadow-sm print-document-sheet"
              style={{
                paddingTop: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingTop || 80) : 24}px`,
                paddingBottom: `${financeSettings.letterheadEnabled && financeSettings.letterheadUrl ? (financeSettings.letterheadPaddingBottom || 75) : 24}px`,
              }}
            >
              {/* Background Kop Surat Resmi DSTech */}
              {financeSettings.letterheadEnabled && financeSettings.letterheadUrl && (
                <img
                  src={financeSettings.letterheadUrl}
                  alt="Kop Surat Resmi"
                  className={`absolute pointer-events-none z-0 select-none print-letterhead-img ${
                    financeSettings.letterheadFitMode === "bleed" ? "mode-bleed" : "inset-0 w-full h-full"
                  }`}
                  style={{
                    objectFit:
                      financeSettings.letterheadFitMode === "cover"
                        ? "cover"
                        : financeSettings.letterheadFitMode === "contain"
                        ? "contain"
                        : "fill",
                    objectPosition: "top center",
                    width: financeSettings.letterheadFitMode === "bleed" ? "102.5%" : "100%",
                    height: financeSettings.letterheadFitMode === "bleed" ? "102%" : "100%",
                    top: financeSettings.letterheadFitMode === "bleed" ? "-1%" : "0",
                    left: financeSettings.letterheadFitMode === "bleed" ? "-1.25%" : "0",
                    opacity: financeSettings.watermarkOpacity !== undefined ? financeSettings.watermarkOpacity : 1,
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                  }}
                />
              )}

              <div className="relative z-10 space-y-3 print:space-y-2">
                {/* Kop Surat Perusahaan */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-slate-900 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-dstech-blue flex items-center justify-center text-white font-black text-base shadow">
                        DSP
                      </div>
                      <div>
                        <h2 className="font-black text-slate-900 text-sm tracking-tight leading-none uppercase">
                          PT. DSTECH SMART PERKASA
                        </h2>
                        <p className="text-[10px] text-dstech-blue font-bold tracking-wider mt-0.5">
                          DIVISI LOGISTIK &amp; RANTAI PASOK MATERIAL PROYEK
                        </p>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-slate-600 max-w-sm leading-tight mt-1">
                      Jl. KH Wasyid No. 88, Jombang Masjid, Cilegon - Banten 42411
                      <br />
                      NIB: 1205240058291 | NPWP: 40.231.890.1-417.000
                    </p>
                  </div>
                  <div className="sm:text-right space-y-0.5">
                    <span className="inline-block px-3 py-1 rounded-md bg-amber-600 text-white font-black text-[10px] tracking-wider uppercase shadow-sm">
                      SURAT JALAN MATERIAL (DELIVERY ORDER)
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono font-bold mt-1">
                      No: <span className="text-slate-900">{deliveryConfig.doNumber}</span>
                    </p>
                    <p className="text-[9.5px] text-slate-500">
                      Ref Faktur: <span className="font-mono font-bold text-slate-800">{selectedSaleForDelivery.invoiceNumber}</span>
                    </p>
                    <p className="text-[9.5px] text-slate-500">
                      Tanggal Kirim: <span className="font-bold text-slate-800">{deliveryConfig.doDate}</span>
                    </p>
                  </div>
                </div>

                {/* Grid Informasi Pengiriman (Asal Gudang vs Tujuan Proyek) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                  <div className="space-y-0.5 border-r border-slate-200 pr-2">
                    <p className="font-black text-amber-900 uppercase tracking-wider text-[9.5px]">
                      ASAL LOGISTIK / GUDANG PENGIRIM:
                    </p>
                    <p className="font-bold text-slate-900 text-[11px]">{deliveryConfig.originWarehouse}</p>
                    <p className="text-slate-600">Armada / No. Polisi: <span className="font-mono font-bold text-slate-800">{deliveryConfig.vehicleNumber}</span></p>
                    <p className="text-slate-600">Driver / Ekspedisi: <span className="font-semibold text-slate-800">{deliveryConfig.driverName} ({deliveryConfig.driverPhone})</span></p>
                  </div>
                  <div className="space-y-0.5 pl-1">
                    <p className="font-black text-amber-900 uppercase tracking-wider text-[9.5px]">
                      TUJUAN PENGIRIMAN &amp; KLIEN PENERIMA:
                    </p>
                    <p className="font-bold text-slate-900 text-[11px]">{selectedSaleForDelivery.customerName}</p>
                    <p className="text-slate-600">PIC Lapangan: <span className="font-semibold text-slate-800">{deliveryConfig.receivedByName} ({deliveryConfig.receivedByTitle})</span></p>
                    <p className="text-slate-600">Alamat Proyek: <span className="font-semibold text-slate-800">{deliveryConfig.destinationAddress}</span></p>
                  </div>
                </div>

                {/* Paragraf Pengantar */}
                <div className="text-[10px] text-slate-700 leading-tight">
                  <p>
                    Bersama ini kami kirimkan material dan unit perangkat dengan rincian di bawah ini untuk pelaksanaan pekerjaan proyek. Mohon diperiksa kuantitas dan keutuhan fisik barang saat serah terima di lokasi:
                  </p>
                </div>

                {/* Tabel Spesifikasi Material Pengiriman */}
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-[10px] text-left">
                    <thead className="bg-slate-900 text-white font-bold">
                      <tr>
                        <th className="p-2 text-center w-8">No</th>
                        <th className="p-2">Deskripsi Barang &amp; Material Kiriman</th>
                        <th className="p-2 text-center w-20">Volume / Qty</th>
                        <th className="p-2 text-center w-28">Kondisi Keluar Gudang</th>
                        <th className="p-2 text-center w-28">Tanda Terima Fisik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedSaleForDelivery.items && selectedSaleForDelivery.items.length > 0 ? (
                        selectedSaleForDelivery.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="p-2 text-center font-bold text-slate-600">{idx + 1}</td>
                            <td className="p-2">
                              <p className="font-bold text-slate-900">{item.productName}</p>
                              <p className="text-[9px] text-slate-500">Kondisi baru, kemasan tersegel pabrik</p>
                            </td>
                            <td className="p-2 text-center font-bold text-slate-800">
                              {item.qty} {item.unit || "Unit"}
                            </td>
                            <td className="p-2 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] border border-emerald-300">
                                ✓ Baik, Segel &amp; Utuh
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[9px] border border-blue-200">
                                Sesuai Pesanan
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="p-2 text-center font-bold">1</td>
                          <td className="p-2">
                            <p className="font-bold text-slate-900">Material Pengadaan Proyek</p>
                            <p className="text-[9px] text-slate-500">Perangkat keras dan perlengkapan instalasi</p>
                          </td>
                          <td className="p-2 text-center font-bold">1 Paket</td>
                          <td className="p-2 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] border border-emerald-300">
                              ✓ Baik, Segel &amp; Utuh
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[9px] border border-blue-200">
                              Sesuai Pesanan
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Catatan & Ketentuan Penerimaan */}
                <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200 text-[9.5px] space-y-0.5">
                  <p className="font-bold text-amber-950 uppercase tracking-tight">Catatan &amp; Ketentuan Penerimaan Material:</p>
                  <p className="text-slate-700 leading-tight">
                    {deliveryConfig.notes}
                  </p>
                </div>

                {/* Tiga (3) Blok Pengesahan Tanda Tangan */}
                <div className="pt-2 border-t border-slate-300 grid grid-cols-3 gap-3 text-center">
                  {/* Blok 1: Logistik Gudang DSTech */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      YANG MENYERAHKAN,
                    </p>
                    <p className="text-[10px] font-black text-slate-900">Gudang &amp; Logistik DSTech</p>

                    <div className="h-11 relative flex items-center justify-center">
                      {deliveryConfig.includeDspStamp ? (
                        <>
                          <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-600/70 flex flex-col items-center justify-center text-[5.5px] text-amber-900 font-bold uppercase rotate-[-10deg] pointer-events-none bg-amber-50/50">
                            <span className="font-black text-[5px]">PT. DSTECH</span>
                            <span className="text-[4px] tracking-tight">SMART PERKASA</span>
                            <span className="text-[4px] text-emerald-700 font-mono font-black mt-0.5">DISPATCHED</span>
                          </div>
                        </>
                      ) : (
                        <div className="font-serif italic text-xs text-slate-400 select-none">
                          ( Stempel Gudang )
                        </div>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-[10px]">
                        ( Bagian Logistik Gudang )
                      </p>
                      <p className="text-[8.5px] text-slate-500 mt-0.5">
                        QC &amp; Logistik Pengeluaran
                      </p>
                    </div>
                  </div>

                  {/* Blok 2: Driver / Ekspedisi */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      YANG MEMBAWA / EKSPEDISI,
                    </p>
                    <p className="text-[10px] font-black text-slate-900">Driver / Teknisi Pengantar</p>

                    <div className="h-11 flex items-center justify-center">
                      <div className="font-serif italic text-xs text-slate-400 select-none">
                        ( Tanda Tangan Supir )
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-[10px]">
                        ( {deliveryConfig.driverName} )
                      </p>
                      <p className="text-[8.5px] text-slate-500 mt-0.5">
                        {deliveryConfig.vehicleNumber}
                      </p>
                    </div>
                  </div>

                  {/* Blok 3: Penerima Lapangan Klien */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      YANG MENERIMA DI LOKASI,
                    </p>
                    <p className="text-[10px] font-black text-slate-900">{selectedSaleForDelivery.customerName}</p>

                    <div className="h-11 flex items-center justify-center">
                      <div className="font-serif italic text-xs text-slate-400 select-none">
                        ( Tanda Tangan &amp; Stempel Penerima )
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-300">
                      <p className="font-bold text-slate-900 text-[10px]">
                        ( {deliveryConfig.receivedByName} )
                      </p>
                      <p className="text-[8.5px] text-slate-500 mt-0.5">
                        {deliveryConfig.receivedByTitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className={`p-2 rounded-xl border flex items-center justify-between font-bold text-xs ${
                  (Number(selectedInvoiceForPayment.dpPaidAmount) || 0) >= (Number(selectedInvoiceForPayment.dpAmount) || 0)
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : "bg-amber-50 text-amber-900 border-amber-200"
                }`}>
                  <span>
                    {(Number(selectedInvoiceForPayment.dpPaidAmount) || 0) >= (Number(selectedInvoiceForPayment.dpAmount) || 0)
                      ? `Uang Muka (DP ${selectedInvoiceForPayment.dpPercentage || 50}%):`
                      : `Tagihan Uang Muka (DP ${selectedInvoiceForPayment.dpPercentage || 50}%):`}
                  </span>
                  <span className="font-mono">
                    {formatRupiah(selectedInvoiceForPayment.dpAmount || 0)}
                    {(Number(selectedInvoiceForPayment.dpPaidAmount) || 0) >= (Number(selectedInvoiceForPayment.dpAmount) || 0) && (
                      <span className="ml-1.5 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full uppercase">Lunas DP</span>
                    )}
                  </span>
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

              {/* Branch & Warehouse Selection for Edit Sale Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-2xl border border-amber-200/80">
                <div>
                  <label className="text-[11px] font-black text-amber-900 block mb-1">
                    Kantor Cabang Penjualan:
                  </label>
                  <select
                    value={editingSale.branchId || "dstech_branch_1"}
                    onChange={(e) => setEditingSale({ ...editingSale, branchId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-amber-900 block mb-1">
                    Titik Gudang Pengeluaran Barang:
                  </label>
                  <select
                    value={editingSale.warehouseId || "dstech_wh_1"}
                    onChange={(e) => setEditingSale({ ...editingSale, warehouseId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.city || w.code})
                      </option>
                    ))}
                  </select>
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
                      <div className="col-span-5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-bold">Produk / Jasa</span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleSelectProductForEditSale(idx, e.target.value);
                            }}
                            defaultValue=""
                            className="text-[9px] bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 rounded px-1.5 py-0.5 max-w-[190px] truncate cursor-pointer"
                          >
                            <option value="">⚡ Pilih Katalog ({products.length})</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.category}] {p.name} - {formatRupiah(p.price)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          required
                          value={it.productName}
                          onChange={(e) => handleEditSaleItemChange(idx, "productName", e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        />
                        {/* Live Stock Badge */}
                        {(() => {
                          const info = getProductStockInfo(it.productId || it.productName, editingSale.warehouseId);
                          if (!info) return null;
                          const isOverStock = !info.isService && it.qty > info.stock;
                          return (
                            <div className="flex flex-wrap items-center gap-1 pt-0.5">
                              <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border ${info.badgeClass}`}>
                                <Package className="w-2.5 h-2.5" />
                                {info.label}
                              </span>
                              {isOverStock && (
                                <span className="text-[8px] text-red-600 font-bold bg-red-50 border border-red-200 px-1 py-0.5 rounded">
                                  ⚠️ Qty ({it.qty}) &gt; Stok ({info.stock})
                                </span>
                              )}
                            </div>
                          );
                        })()}
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
                    {Math.round((tempSettings.watermarkOpacity !== undefined ? tempSettings.watermarkOpacity : 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={tempSettings.watermarkOpacity !== undefined ? tempSettings.watermarkOpacity : 1}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, watermarkOpacity: parseFloat(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Lembut (15%)</span>
                  <span>Jelas (50%)</span>
                  <span>Kop Utuh / Nyata (100%)</span>
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
                        letterheadFitMode: "bleed",
                        watermarkOpacity: 1.0,
                      }))
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-dstech-blue font-bold text-[10px] cursor-pointer"
                  >
                    Full Bleed Canva (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTempSettings((prev) => ({
                        ...prev,
                        letterheadUrl: "/kop_surat_dstech.jpg",
                        letterheadEnabled: true,
                        letterheadFitMode: "fill",
                        watermarkOpacity: 1.0,
                      }))
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                  >
                    Kop Utuh / Nyata (100%)
                  </button>
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
                    Watermark Lembut (15%)
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

              {/* Mode Skala Background Kop Surat */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">Mode Skala Background Kop Surat:</label>
                  <span className="text-[10px] text-slate-500 font-medium">Pilih sesuai jenis file kop surat Anda</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempSettings({ ...tempSettings, letterheadFitMode: "bleed" })}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                      tempSettings.letterheadFitMode === "bleed"
                        ? "border-dstech-blue bg-blue-50/80 text-dstech-blue font-bold shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="text-[11px] font-bold">Full Bleed Canva</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Potong margin putih bawaan Canva</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTempSettings({ ...tempSettings, letterheadFitMode: "fill" })}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                      (!tempSettings.letterheadFitMode || tempSettings.letterheadFitMode === "fill")
                        ? "border-dstech-blue bg-blue-50/80 text-dstech-blue font-bold shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="text-[11px] font-bold">Pas 100% Lembar</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Utuh kiri & kanan (Bebas terpotong)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTempSettings({ ...tempSettings, letterheadFitMode: "contain" })}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                      tempSettings.letterheadFitMode === "contain"
                        ? "border-dstech-blue bg-blue-50/80 text-dstech-blue font-bold shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="text-[11px] font-bold">Contain Tengah</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Rasio asli di tengah lembar</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTempSettings({ ...tempSettings, letterheadFitMode: "cover" })}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                      tempSettings.letterheadFitMode === "cover"
                        ? "border-dstech-blue bg-blue-50/80 text-dstech-blue font-bold shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="text-[11px] font-bold">Cover Proporsional</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Isi tinggi (potong samping)</div>
                  </button>
                </div>
              </div>

              {/* Pengaturan Jarak Margin Lembar Dokumen (Header & Footer) */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs">Jarak Margin Lembar Kop (Header & Footer):</h4>
                  <span className="text-[10px] text-slate-500 font-medium">Mencegah teks tertimpa desain kop</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <label className="font-bold text-slate-700">Jarak Turun Header Atas:</label>
                      <span className="font-mono font-bold text-dstech-blue">
                        {tempSettings.letterheadPaddingTop || 80}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="240"
                      step="5"
                      value={tempSettings.letterheadPaddingTop || 80}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, letterheadPaddingTop: parseInt(e.target.value) || 80 })
                      }
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Rapat (24px)</span>
                      <span>Standar (80px)</span>
                      <span>Luas (240px)</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <label className="font-bold text-slate-700">Jarak Naik Footer Bawah:</label>
                      <span className="font-mono font-bold text-emerald-600">
                        {tempSettings.letterheadPaddingBottom || 75}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="220"
                      step="5"
                      value={tempSettings.letterheadPaddingBottom || 75}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, letterheadPaddingBottom: parseInt(e.target.value) || 75 })
                      }
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Rapat (24px)</span>
                      <span>Standar (75px)</span>
                      <span>Luas (220px)</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setTempSettings((prev) => ({
                        ...prev,
                        letterheadPaddingTop: 80,
                        letterheadPaddingBottom: 75,
                      }))
                    }
                    className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] cursor-pointer"
                  >
                    Preset DSTech Resmi (Header 80px, Footer 75px)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTempSettings((prev) => ({
                        ...prev,
                        letterheadPaddingTop: 80,
                        letterheadPaddingBottom: 60,
                      }))
                    }
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                  >
                    Preset Banner Ramping (80px / 60px)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTempSettings((prev) => ({
                        ...prev,
                        letterheadPaddingTop: 160,
                        letterheadPaddingBottom: 130,
                      }))
                    }
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                  >
                    Preset Banner Luas (160px / 130px)
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
                      value={tempSettings.signerName ?? ""}
                      placeholder="Contoh: H. Agus Supriyadi, S.T., M.Kom."
                      onChange={(e) => setTempSettings({ ...tempSettings, signerName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jabatan Resmi:</label>
                    <input
                      type="text"
                      value={tempSettings.signerTitle ?? ""}
                      placeholder="Contoh: Direktur Keuangan & Operasional"
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

      {/* MODAL RESET SEMUA TRANSAKSI KEUANGAN (CLEAN SLATE) */}
      {isResetModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsResetModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative border border-red-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-100 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Reset Semua Transaksi Keuangan</h3>
                  <p className="text-[11px] text-slate-400">
                    Bersihkan data demo / uji coba untuk mulai pencatatan dari nol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 border border-red-200/80 space-y-2 text-xs text-red-900">
              <p className="font-bold text-red-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Peringatan Tindakan Permanen:</span>
              </p>
              <p className="leading-relaxed">
                Tindakan ini akan <strong>mengosongkan seluruh data transaksi uji coba/demo</strong> berikut menjadi 0 (nol):
              </p>
              <ul className="list-disc list-inside space-y-1 font-semibold text-red-700 pl-1">
                <li>Seluruh Faktur Penjualan &amp; Tagihan Invoice</li>
                <li>Seluruh Surat Penawaran Harga (SPH / Quotations)</li>
                <li>Seluruh Surat Pesanan Pembelian (Purchase Order Supplier)</li>
                <li>Seluruh Riwayat Retur Penjualan &amp; Retur Pembelian</li>
                <li>Seluruh Buku Catatan Arus Kas Masuk &amp; Kas Keluar</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Data yang Tetap Aman &amp; Terjaga (TIDAK Dihapus):</span>
              </p>
              <p className="text-[11px] text-emerald-700">
                ✓ Akun Login Admin &amp; Superadmin • ✓ Profil PT DSTech Smart Perkasa • ✓ Master Rekening Bank Resmi • ✓ Master Titik Gudang &amp; Cabang • ✓ Master Klien &amp; Supplier • ✓ Katalog Produk
              </p>
              <p className="text-[10px] text-emerald-600 font-mono mt-1">
                * Sistem otomatis membuat salinan cadangan snapshot (backup) sebelum reset dieksekusi.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Ketik kata <span className="font-mono text-red-600 bg-red-100 px-1.5 py-0.5 rounded">RESET</span> untuk konfirmasi:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="Ketik RESET"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm tracking-wider focus:ring-2 focus:ring-red-500 focus:outline-none uppercase"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetAllTransactions}
                disabled={resetConfirmText.trim().toUpperCase() !== "RESET" || isResetting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isResetting ? "Membersihkan Data..." : "Konfirmasi Bersihkan dari Nol"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KIRIM DOKUMEN (WHATSAPP & EMAIL) */}
      {sendDocModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Kirim {sendDocModal.docTitle}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Nomor: <span className="font-bold text-slate-700">{sendDocModal.docNumber}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSendDocModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Dokumen Ringkas */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Penerima / Klien / Vendor:</span>
                <span className="font-bold text-slate-800">{sendDocModal.recipientName}</span>
                {sendDocModal.recipientOrg && sendDocModal.recipientOrg !== sendDocModal.recipientName && (
                  <span className="text-[10px] text-slate-500 block">{sendDocModal.recipientOrg}</span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Nilai Dokumen:</span>
                <span className="font-black text-emerald-600 text-sm">
                  {sendDocModal.grandTotal > 0 ? formatRupiah(sendDocModal.grandTotal) : "-"}
                </span>
                {sendDocModal.discount && sendDocModal.discount > 0 ? (
                  <span className="text-[9px] text-red-500 block">
                    {sendDocModal.discountLabel || "Diskon"}: -{formatRupiah(sendDocModal.discount)}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Tab Selector: WhatsApp vs Email */}
            <div className="flex rounded-2xl p-1 bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setSendTab("whatsapp")}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  sendTab === "whatsapp"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim via WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setSendTab("email")}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  sendTab === "email"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Kirim via Email</span>
              </button>
            </div>

            {/* Konten Tab WhatsApp */}
            {sendTab === "whatsapp" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor WhatsApp Penerima:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customPhoneInput}
                      onChange={(e) => setCustomPhoneInput(e.target.value)}
                      placeholder="Contoh: 0812-3456-7890 atau 6281234567890"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(customPhoneInput)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Sekarang</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Awalan 08 otomatis dikonversi ke format internasional 628 WhatsApp.
                  </p>
                </div>

                {/* Pratinjau Pesan WA */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Pratinjau Pesan WhatsApp:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const { waText } = generateDocShareContent(sendDocModal);
                        handleCopyContent(waText, "Pesan WhatsApp");
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin Pesan</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-950/90 text-emerald-100 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto border border-emerald-900 shadow-inner select-all">
                    {generateDocShareContent(sendDocModal).waText}
                  </div>
                </div>
              </div>
            )}

            {/* Konten Tab Email */}
            {sendTab === "email" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Alamat Email Penerima:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={customEmailInput}
                      onChange={(e) => setCustomEmailInput(e.target.value)}
                      placeholder="Contoh: procurement@klien.co.id"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendEmail(customEmailInput)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Buka Mailto</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Subjek Email:
                  </label>
                  <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                    {generateDocShareContent(sendDocModal).emailSubject}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Isi Surat Pengantar:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const { emailBody } = generateDocShareContent(sendDocModal);
                        handleCopyContent(emailBody, "Isi Email");
                      }}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin Body Email</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 text-slate-200 font-sans text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto border border-slate-800 shadow-inner select-all">
                    {generateDocShareContent(sendDocModal).emailBody}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSendDocModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
              {sendTab === "whatsapp" ? (
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(customPhoneInput)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Buka WhatsApp Web / App</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendEmail(customEmailInput)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>Kirim via Email Client</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
