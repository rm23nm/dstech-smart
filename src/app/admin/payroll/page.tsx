"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Banknote,
  CalendarCheck,
  Clock,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Plus,
  Trash2,
  Edit3,
  Printer,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Filter,
  CheckSquare,
  Sparkles,
  X,
  CreditCard,
  Download,
  Check,
  DollarSign,
  TrendingUp,
  Building,
  HelpCircle,
  FileSpreadsheet,
  ChevronDown,
  ArrowUpRight,
  Send,
  Zap,
  Calendar,
  UserCheck,
} from "lucide-react";

interface PayrollRecord {
  id: string;
  slipNumber: string;
  month: string;
  paymentDate: string;
  employeeName: string;
  employeeRole: string;
  bankAccount: string;
  baseSalary: number;
  presenceDays: number;
  presenceRate: number;
  presenceAllowance: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  positionAllowance: number;
  transportAllowance: number;
  mealAllowance?: number;
  transportMethod?: "FULL_MONTHLY" | "DAILY_PRESENCE";
  mealMethod?: "FULL_MONTHLY" | "DAILY_PRESENCE";
  bonusProject: number;
  bonusPerformance: number;
  bpjsDeduction: number;
  loanDeduction: number;
  otherDeduction: number;
  totalGross: number;
  totalDeductions: number;
  takeHomePay: number;
  status: "Draft" | "Disetujui" | "Dibayarkan";
  paymentMethod: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  recordedInCashFlow?: boolean;
  dailyRate?: number;
  positionTier?: string;
}

interface PositionRateItem {
  name: string;
  dailyRate: number;
  overtimeRate: number;
}

interface PayrollSettings {
  standardOvertimeRate: number;
  standardPresenceRate: number;
  defaultBpjsDeduction: number;
  standardTransportAllowance: number;
  autoPaydayDay: number;
  cutoffStartDay: number;
  cutoffEndDay: number;
  autoGenerateEnabled: boolean;
  defaultPaymentMethod: string;
  dailyRatesByPosition?: {
    helper: PositionRateItem;
    skill: PositionRateItem;
    senior: PositionRateItem;
    lead: PositionRateItem;
  };
  leaveSettings?: {
    defaultAnnualLeave: number;
    paidPermissionDays: number;
    prorateDivisor: number;
    sickRequiresDoctorNote: boolean;
    sickLeavePaid: boolean;
  };
}

interface PayrollSummary {
  totalTakeHomePay: number;
  totalGross: number;
  totalDeductions: number;
  totalBaseSalary: number;
  totalPresenceAllowance: number;
  totalOvertimePay: number;
  totalSlips: number;
  statusCounts: { draft: number; disetujui: number; dibayarkan: number };
  currentDay: number;
  currentMonth: string;
  isPaydayToday: boolean;
  paydayConfig: { paydayDay: number; cutoffStartDay: number; cutoffEndDay: number };
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatRupiah(num: number): string {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

export default function AdminPayrollPage() {
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [settings, setSettings] = useState<PayrollSettings>({
    standardOvertimeRate: 30000,
    standardPresenceRate: 50000,
    defaultBpjsDeduction: 150000,
    standardTransportAllowance: 400000,
    autoPaydayDay: 25,
    cutoffStartDay: 21,
    cutoffEndDay: 20,
    autoGenerateEnabled: true,
    defaultPaymentMethod: "Transfer Bank BCA",
    dailyRatesByPosition: {
      helper: { name: "Helper / Asisten Teknisi", dailyRate: 150000, overtimeRate: 25000 },
      skill: { name: "Teknisi Skill / Ahli", dailyRate: 175000, overtimeRate: 30000 },
      senior: { name: "Teknisi Senior / Specialist", dailyRate: 200000, overtimeRate: 35000 },
      lead: { name: "Lead / Foreman Lapangan", dailyRate: 225000, overtimeRate: 40000 },
    },
    leaveSettings: {
      defaultAnnualLeave: 12,
      paidPermissionDays: 3,
      prorateDivisor: 25,
      sickRequiresDoctorNote: true,
      sickLeavePaid: true,
    },
  });
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [filterMonth, setFilterMonth] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAutoGenerateModalOpen, setIsAutoGenerateModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<PayrollRecord | null>(null);
  const [isRecapPrintModalOpen, setIsRecapPrintModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: "",
  });

  // Form State (Single Slip)
  const [formData, setFormData] = useState<{
    id?: string;
    isEdit: boolean;
    slipNumber: string;
    month: string;
    paymentDate: string;
    employeeName: string;
    employeeRole: string;
    bankAccount: string;
    baseSalary: number;
    presenceDays: number;
    presenceRate: number;
    presenceAllowance: number;
    overtimeHours: number;
    overtimeRate: number;
    overtimePay: number;
    positionAllowance: number;
    transportAllowance: number;
    mealAllowance: number;
    bonusProject: number;
    bonusPerformance: number;
    bpjsDeduction: number;
    loanDeduction: number;
    otherDeduction: number;
    paymentMethod: string;
    notes: string;
    status: "Draft" | "Disetujui" | "Dibayarkan";
    recordInCashFlow: boolean;
    dailyRate?: number;
    positionTier?: string;
    transportMethod?: "FULL_MONTHLY" | "DAILY_PRESENCE";
    transportUnit?: number;
    mealMethod?: "FULL_MONTHLY" | "DAILY_PRESENCE";
    mealUnit?: number;
  }>({
    isEdit: false,
    slipNumber: "",
    month: new Date().toISOString().slice(0, 7),
    paymentDate: new Date().toISOString().split("T")[0],
    employeeName: "",
    employeeRole: "Teknisi Lapangan",
    bankAccount: "",
    baseSalary: 3850000,
    dailyRate: 175000,
    positionTier: "skill",
    presenceDays: 22,
    presenceRate: 50000,
    presenceAllowance: 0,
    overtimeHours: 0,
    overtimeRate: 30000,
    overtimePay: 0,
    positionAllowance: 0,
    transportAllowance: 440000,
    mealAllowance: 550000,
    bonusProject: 0,
    bonusPerformance: 0,
    bpjsDeduction: 150000,
    loanDeduction: 0,
    otherDeduction: 0,
    paymentMethod: "Transfer Bank BCA",
    notes: "",
    status: "Draft",
    recordInCashFlow: true,
    transportMethod: "DAILY_PRESENCE",
    transportUnit: 20000,
    mealMethod: "DAILY_PRESENCE",
    mealUnit: 25000,
  });

  // Auto Generate Options
  const [autoGenMonth, setAutoGenMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [autoGenOverwrite, setAutoGenOverwrite] = useState<boolean>(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    fetchPayrollData();
  }, [filterMonth, filterStatus]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterMonth && filterMonth !== "ALL") params.append("month", filterMonth);
      if (filterStatus && filterStatus !== "ALL") params.append("status", filterStatus);

      const [resPayroll, resContracts] = await Promise.all([
        fetch(`/api/payroll?${params.toString()}`),
        fetch("/api/contracts").catch(() => null),
      ]);

      if (resPayroll.ok) {
        const json = await resPayroll.json();
        setPayrollList(json.payrolls || []);
        if (json.defaultSettings) setSettings(json.defaultSettings);
        if (json.summary) setSummary(json.summary);
      }

      if (resContracts && resContracts.ok) {
        const cJson = await resContracts.json();
        if (cJson.success && Array.isArray(cJson.contracts)) {
          setContracts(cJson.contracts);
        }
      }
    } catch (err) {
      console.error("Gagal memuat payroll:", err);
      showToast("error", "Gagal menghubungi server untuk memuat data penggajian");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Terapkan data dari Kontrak Kerja ke form slip gaji
  const applyContractData = (contract: any, customDays?: number, customOtHours?: number) => {
    if (!contract) return;
    const days = customDays !== undefined ? customDays : (formData.presenceDays || 22);
    const otHours = customOtHours !== undefined ? customOtHours : (formData.overtimeHours || 0);

    const daily = contract.salaryScheme?.dailyScheme;
    const staff = contract.salaryScheme?.staffScheme;
    const isStaff =
      contract.employeeCategory === "STAFF" ||
      contract.contractType === "MONTHLY" ||
      contract.contractType === "YEARLY" ||
      daily?.dailyRateType === "TYPE_3_MONTHLY_FULL";

    let baseSalary = 0;
    let dailyRate = 0;
    let presenceAllowance = 0;
    let presenceRate = 0;
    let positionAllowance = 0;
    let overtimeRate = 30000;
    let positionTier = "skill";

    if (isStaff) {
      baseSalary = Number(daily?.monthlyBaseSalary || staff?.baseSalary || 4200000);
      positionAllowance = Number(daily?.positionAllowance ?? staff?.positionAllowance ?? 500000);
      dailyRate = 0;
      presenceRate = 0;
      presenceAllowance = 0;
      overtimeRate = Number(daily?.overtimeHourlyRate || 30000);
      positionTier = "staff";
    } else if (daily?.dailyRateType === "TYPE_2_HOURLY") {
      const hourly = Number(daily.hourlyRate || 30000);
      dailyRate = hourly * (daily.normalHoursPerDay || 8);
      baseSalary = days * dailyRate;
      overtimeRate = Number(daily.overtimeHourlyRate || 40000);
      positionTier = "skill";
    } else {
      // TYPE_1_FULL_DAY
      dailyRate = Number(daily?.dailyRate || 175000);
      baseSalary = days * dailyRate;
      overtimeRate = Number(daily?.overtimeHourlyRate || 30000);
      if (dailyRate === 150000) positionTier = "helper";
      else if (dailyRate === 200000) positionTier = "senior";
      else if (dailyRate === 225000) positionTier = "lead";
      else positionTier = "skill";
    }

    const overtimePay = otHours * overtimeRate;

    // Tunjangan Transportasi (2 Metode: Full vs Harian Hadir)
    const transportMethod: "FULL_MONTHLY" | "DAILY_PRESENCE" =
      contract.allowances?.transportMethod || (isStaff ? "FULL_MONTHLY" : "DAILY_PRESENCE");
    const transportUnit = Number(
      contract.allowances?.transportAmount ??
      staff?.transportAllowance ??
      daily?.transportAllowance ??
      (transportMethod === "FULL_MONTHLY" ? 400000 : 20000)
    );
    const transportAllowance = transportMethod === "DAILY_PRESENCE" ? days * transportUnit : transportUnit;

    // Tunjangan Uang Makan (2 Metode: Full vs Harian Hadir)
    const mealMethod: "FULL_MONTHLY" | "DAILY_PRESENCE" =
      contract.allowances?.mealMethod || (isStaff ? "FULL_MONTHLY" : "DAILY_PRESENCE");
    const mealUnit = Number(
      contract.allowances?.mealAmount ??
      staff?.mealAllowance ??
      daily?.mealAllowance ??
      (mealMethod === "FULL_MONTHLY" ? 500000 : 25000)
    );
    const mealAllowance = mealMethod === "DAILY_PRESENCE" ? days * mealUnit : mealUnit;

    const bpjsDeduction = Number(staff?.bpjsAllowance ?? daily?.bpjsAllowance ?? 150000);
    const bankAccount = contract.employeePhone
      ? `Transfer Bank (HP: ${contract.employeePhone})`
      : (formData.bankAccount || "-");

    setFormData((prev) => ({
      ...prev,
      employeeName: contract.employeeName,
      employeeRole: contract.position || prev.employeeRole,
      bankAccount: bankAccount || prev.bankAccount,
      baseSalary,
      dailyRate,
      presenceDays: days,
      presenceRate,
      presenceAllowance,
      overtimeHours: otHours,
      overtimeRate,
      overtimePay,
      positionAllowance,
      transportAllowance,
      mealAllowance,
      bpjsDeduction,
      positionTier,
      transportMethod,
      transportUnit,
      mealMethod,
      mealUnit,
    }));

    showToast("success", `Tarif berhasil disinkronkan dengan Kontrak Kerja: ${contract.employeeName} (${contract.position})`);
  };

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Available unique months in payroll list
  const availableMonths = useMemo(() => {
    const setM = new Set<string>();
    payrollList.forEach((p) => {
      if (p.month) setM.add(p.month);
    });
    // Tambahkan bulan sekarang jika belum ada
    setM.add(new Date().toISOString().slice(0, 7));
    return Array.from(setM).sort().reverse();
  }, [payrollList]);

  // Filtered Payroll
  const filteredPayrolls = useMemo(() => {
    return payrollList.filter((item) => {
      const matchSearch =
        searchQuery === "" ||
        item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.employeeRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slipNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [payrollList, searchQuery]);

  // Preview sinkronisasi kontrak aktif vs kadaluarsa untuk bulan auto-generate yang dipilih
  const autoGenContractsPreview = useMemo(() => {
    if (!autoGenMonth) return { eligible: [], expired: [] };
    const [yStr, mStr] = autoGenMonth.split("-");
    const yNum = parseInt(yStr, 10);
    const mNum = parseInt(mStr, 10);
    const lastDay = new Date(yNum, mNum, 0).getDate();
    const monthStart = `${autoGenMonth}-01`;
    const monthEnd = `${autoGenMonth}-${String(lastDay).padStart(2, "0")}`;

    const eligible: any[] = [];
    const expired: any[] = [];

    contracts.forEach((c: any) => {
      const isStatusActive = (c.status || "ACTIVE") === "ACTIVE";
      const startDate = c.startDate || "2000-01-01";
      const endDate = c.endDate || "2099-12-31";
      const isPast = endDate < monthStart;
      const isFuture = startDate > monthEnd;

      if (isStatusActive && !isPast && !isFuture) {
        eligible.push(c);
      } else if (isPast) {
        expired.push({ ...c, expiredReason: `Kontrak berakhir pada ${c.endDate}` });
      } else if (isFuture) {
        expired.push({ ...c, expiredReason: `Kontrak baru aktif mulai ${c.startDate}` });
      }
    });

    return { eligible, expired };
  }, [autoGenMonth, contracts]);

  // Bulk Select Toggle
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredPayrolls.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Run Auto Payroll Generation
  const handleRunAutoGenerate = async () => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_generate",
          month: autoGenMonth,
          overwriteExisting: autoGenOverwrite,
          paymentDate: `${autoGenMonth}-${String(settings.autoPaydayDay || 25).padStart(2, "0")}`,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("success", json.message || "Auto-payroll berhasil dijalankan!");
        setIsAutoGenerateModalOpen(false);
        fetchPayrollData();
      } else {
        showToast("error", json.error || "Gagal menjalankan auto-payroll");
      }
    } catch (err) {
      console.error("Error auto-generate:", err);
      showToast("error", "Terjadi kesalahan saat memproses penggajian otomatis");
    } finally {
      setActionLoading(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_settings",
          settings,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("success", "Pengaturan auto payday & default tarif berhasil disimpan!");
        setIsSettingsModalOpen(false);
        fetchPayrollData();
      } else {
        showToast("error", json.error || "Gagal menyimpan pengaturan");
      }
    } catch (err) {
      console.error("Error save settings:", err);
      showToast("error", "Terjadi kesalahan sistem saat menyimpan pengaturan");
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Approve
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      showToast("info", "Pilih minimal 1 slip gaji untuk disetujui");
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_approve",
          ids: selectedIds,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("success", json.message);
        setSelectedIds([]);
        fetchPayrollData();
      } else {
        showToast("error", json.error || "Gagal menyetujui slip gaji");
      }
    } catch (err) {
      console.error("Error bulk approve:", err);
      showToast("error", "Terjadi kesalahan saat menyetujui slip gaji");
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Pay
  const handleBulkPay = async () => {
    if (selectedIds.length === 0) {
      showToast("info", "Pilih minimal 1 slip gaji untuk dibayarkan");
      return;
    }
    if (!confirm(`Konfirmasi pembayaran ${selectedIds.length} slip gaji terpilih? Status akan diubah menjadi 'Dibayarkan' dan otomatis dicatat ke Buku Arus Kas ERP.`)) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_pay",
          ids: selectedIds,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("success", json.message);
        setSelectedIds([]);
        fetchPayrollData();
      } else {
        showToast("error", json.error || "Gagal memproses pembayaran massal");
      }
    } catch (err) {
      console.error("Error bulk pay:", err);
      showToast("error", "Terjadi kesalahan saat membayar slip gaji");
    } finally {
      setActionLoading(false);
    }
  };

  // Single Pay & Record to Cash Flow
  const handleMarkAsPaid = async (payroll: PayrollRecord) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/payroll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payroll.id,
          status: "Dibayarkan",
          recordInCashFlow: true,
        }),
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast("success", `Gaji ${payroll.employeeName} ditandai Dibayarkan & dicatat ke Buku Kas ERP!`);
        fetchPayrollData();
      } else {
        showToast("error", resJson.error || "Gagal menandai lunas");
      }
    } catch (err) {
      console.error("Error pay:", err);
      showToast("error", "Gagal memperbarui status slip gaji");
    } finally {
      setActionLoading(false);
    }
  };

  // Save Single Form (Create / Edit)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeName || !formData.month) {
      showToast("error", "Nama staf dan periode bulan wajib diisi");
      return;
    }

    try {
      setActionLoading(true);
      const method = formData.isEdit ? "PUT" : "POST";
      const res = await fetch("/api/payroll", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast("success", resJson.message || "Slip gaji berhasil disimpan");
        setIsFormModalOpen(false);
        fetchPayrollData();
      } else {
        showToast("error", resJson.error || "Gagal menyimpan slip gaji");
      }
    } catch (err) {
      console.error("Error save slip:", err);
      showToast("error", "Terjadi kesalahan saat menyimpan slip gaji");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Form
  const handleOpenEdit = (p: PayrollRecord) => {
    setFormData({
      id: p.id,
      isEdit: true,
      slipNumber: p.slipNumber,
      month: p.month,
      paymentDate: p.paymentDate,
      employeeName: p.employeeName,
      employeeRole: p.employeeRole,
      bankAccount: p.bankAccount,
      baseSalary: p.baseSalary,
      presenceDays: p.presenceDays,
      presenceRate: p.presenceRate,
      presenceAllowance: p.presenceAllowance,
      overtimeHours: p.overtimeHours,
      overtimeRate: p.overtimeRate,
      overtimePay: p.overtimePay,
      positionAllowance: p.positionAllowance,
      transportAllowance: p.transportAllowance,
      mealAllowance: p.mealAllowance || 0,
      bonusProject: p.bonusProject,
      bonusPerformance: p.bonusPerformance,
      bpjsDeduction: p.bpjsDeduction,
      loanDeduction: p.loanDeduction,
      otherDeduction: p.otherDeduction,
      paymentMethod: p.paymentMethod,
      notes: p.notes || "",
      status: p.status,
      recordInCashFlow: false,
      dailyRate: p.dailyRate || 175000,
      positionTier: p.positionTier || "skill",
    });
    setIsFormModalOpen(true);
  };

  // Delete Slip
  const handleDeleteSlip = async () => {
    if (!deleteModal.id) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/payroll?id=${deleteModal.id}`, { method: "DELETE" });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast("success", "Slip gaji berhasil dihapus");
        setDeleteModal({ isOpen: false, id: "", name: "" });
        fetchPayrollData();
      } else {
        showToast("error", resJson.error || "Gagal menghapus slip gaji");
      }
    } catch (err) {
      console.error("Error delete:", err);
      showToast("error", "Terjadi kesalahan saat menghapus");
    } finally {
      setActionLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredPayrolls.length === 0) {
      showToast("info", "Tidak ada data slip gaji untuk diekspor");
      return;
    }

    const headers = [
      "No Slip",
      "Periode",
      "Tanggal Bayar",
      "Nama Karyawan",
      "Jabatan",
      "Gaji Pokok",
      "Hari Hadir",
      "Uang Kehadiran",
      "Jam Lembur",
      "Upah Lembur",
      "Tunjangan Jabatan",
      "Tunjangan Transport",
      "Bonus Proyek",
      "Bonus Performa",
      "Potongan BPJS",
      "Potongan Pinjaman",
      "Total Kotor (Gross)",
      "Total Potongan",
      "Take Home Pay (Bersih)",
      "Status",
      "Metode Pembayaran",
      "Rekening",
    ];

    const rows = filteredPayrolls.map((p) => [
      `"${p.slipNumber}"`,
      `"${p.month}"`,
      `"${p.paymentDate}"`,
      `"${p.employeeName}"`,
      `"${p.employeeRole}"`,
      p.baseSalary,
      p.presenceDays,
      p.presenceAllowance,
      p.overtimeHours,
      p.overtimePay,
      p.positionAllowance,
      p.transportAllowance,
      p.bonusProject,
      p.bonusPerformance,
      p.bpjsDeduction,
      p.loanDeduction,
      p.totalGross,
      p.totalDeductions,
      p.takeHomePay,
      `"${p.status}"`,
      `"${p.paymentMethod}"`,
      `"${p.bankAccount}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Penggajian_DSTech_${filterMonth !== "ALL" ? filterMonth : "Semua"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "File CSV rekap penggajian berhasil diunduh");
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-bold text-sm border ${
            toastMsg.type === "success"
              ? "bg-emerald-600 border-emerald-400"
              : toastMsg.type === "error"
              ? "bg-red-600 border-red-400"
              : "bg-dstech-blue border-blue-400"
          }`}
        >
          {toastMsg.type === "success" && <CheckCircle2 className="w-5 h-5" />}
          {toastMsg.type === "error" && <AlertTriangle className="w-5 h-5" />}
          {toastMsg.type === "info" && <Sparkles className="w-5 h-5" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header & Payday Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-dstech-blue text-xs font-bold uppercase tracking-wider mb-3">
            <Banknote className="w-3.5 h-3.5" /> Modul Penggajian & Arus Kas ERP
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Rekapitulasi Gaji & Payroll
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-medium">
            Kelola slip gaji bulanan staf & teknisi, jadwal auto payday tanggal{" "}
            <span className="font-bold text-slate-900">{settings.autoPaydayDay || 25}</span> setiap bulan, sinkronisasi kehadiran & lembur riil, dan cetak lembar rekapitulasi resmi A4.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            id="payroll-btn-settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs transition-all shadow-sm"
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>Atur Tanggal Gajian ({settings.autoPaydayDay})</span>
          </button>

          <button
            onClick={() => {
              setAutoGenMonth(filterMonth !== "ALL" ? filterMonth : new Date().toISOString().slice(0, 7));
              setIsAutoGenerateModalOpen(true);
            }}
            id="payroll-btn-auto-generate"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs transition-all shadow-md shadow-amber-500/20"
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Auto-Generate Penggajian</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                isEdit: false,
                slipNumber: "",
                month: filterMonth !== "ALL" ? filterMonth : new Date().toISOString().slice(0, 7),
                paymentDate: new Date().toISOString().split("T")[0],
                employeeName: "",
                employeeRole: "Teknisi Skill Instalasi & Integrasi",
                bankAccount: "",
                baseSalary: 3850000,
                dailyRate: 175000,
                positionTier: "skill",
                presenceDays: 22,
                presenceRate: 0,
                presenceAllowance: 0,
                overtimeHours: 0,
                overtimeRate: settings.standardOvertimeRate || 30000,
                overtimePay: 0,
                positionAllowance: 0,
                transportAllowance: 440000,
                mealAllowance: 550000,
                bonusProject: 0,
                bonusPerformance: 0,
                bpjsDeduction: settings.defaultBpjsDeduction || 150000,
                loanDeduction: 0,
                otherDeduction: 0,
                paymentMethod: settings.defaultPaymentMethod || "Transfer Bank BCA",
                notes: "",
                status: "Draft",
                recordInCashFlow: true,
                transportMethod: "DAILY_PRESENCE",
                transportUnit: 20000,
                mealMethod: "DAILY_PRESENCE",
                mealUnit: 25000,
              });
              setIsFormModalOpen(true);
            }}
            id="payroll-btn-add-manual"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-dstech-blue hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Slip Manual</span>
          </button>
        </div>
      </div>

      {/* Payday Today Notification Alert */}
      {summary?.isPaydayToday && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 rounded-3xl text-white shadow-lg shadow-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">HARI INI TANGGAL PENGGAJIAN ({settings.autoPaydayDay} {MONTH_NAMES[new Date().getMonth()]})</h3>
              <p className="text-xs text-emerald-100 font-medium">
                Jadwal auto payday telah aktif. Terdapat {summary.statusCounts.draft + summary.statusCounts.disetujui} slip gaji yang siap diproses dan ditransfer ke rekening karyawan.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setAutoGenMonth(new Date().toISOString().slice(0, 7));
              setIsAutoGenerateModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-black text-xs hover:bg-emerald-50 transition-all shrink-0 shadow-sm"
          >
            Eksekusi Auto-Payroll Sekarang
          </button>
        </div>
      )}

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Take Home Pay */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total THP (Bersih)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-dstech-blue flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {formatRupiah(summary?.totalTakeHomePay || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{filteredPayrolls.length} Slip Periode Ini</p>
          </div>
        </div>

        {/* Total Gaji Pokok & Harian */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gaji Pokok & Upah</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {formatRupiah(summary?.totalBaseSalary || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Skema Staf & Harian</p>
          </div>
        </div>

        {/* Total Uang Kehadiran */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Uang Kehadiran</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {formatRupiah(summary?.totalPresenceAllowance || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Insentif Presensi Riil</p>
          </div>
        </div>

        {/* Total Upah Lembur */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upah Lembur</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {formatRupiah(summary?.totalOvertimePay || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Overtime Lapangan</p>
          </div>
        </div>

        {/* Total Potongan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Potongan</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {formatRupiah(summary?.totalDeductions || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">BPJS & Pinjaman</p>
          </div>
        </div>

        {/* Status Penggajian */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Pembayaran</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black">
              {summary?.statusCounts?.dibayarkan || 0} Lunas
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-black">
              {(summary?.statusCounts?.draft || 0) + (summary?.statusCounts?.disetujui || 0)} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Control Toolbar (Search, Filter, Bulk Actions, Print, Export) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama karyawan, jabatan, atau nomor slip..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-dstech-blue/20 focus:border-dstech-blue transition-all"
            />
          </div>

          {/* Filter Periode Bulan */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Periode:</span>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Periode</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="Draft">Draft</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Dibayarkan">Dibayarkan</option>
              </select>
            </div>

            <button
              onClick={fetchPayrollData}
              title="Refresh Data"
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Secondary Toolbar (Bulk Action Buttons & Print / Export) */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Left: Bulk Selection Bar */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 select-none">
              <input
                type="checkbox"
                checked={filteredPayrolls.length > 0 && selectedIds.length === filteredPayrolls.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-dstech-blue focus:ring-dstech-blue cursor-pointer"
              />
              <span>Pilih Semua ({selectedIds.length}/{filteredPayrolls.length})</span>
            </label>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in duration-200">
                <button
                  onClick={handleBulkApprove}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Setujui ({selectedIds.length})</span>
                </button>

                <button
                  onClick={handleBulkPay}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Bayar Massal & Kas ERP</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Print Rekap & CSV Export */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsRecapPrintModalOpen(true)}
              id="payroll-btn-print-recap"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Cetak Rekap Penggajian (A4)</span>
            </button>

            <button
              onClick={handleExportCSV}
              id="payroll-btn-export-csv"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Unduh CSV/Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Payroll Summary Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Tabel Rekapitulasi Slip Gaji Karyawan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Daftar seluruh slip gaji terbit periode {filterMonth !== "ALL" ? filterMonth : "Seluruh Periode"}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {filteredPayrolls.length} Catatan Ditemukan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-4 w-12 text-center">
                  <span className="sr-only">Pilih</span>
                </th>
                <th className="py-4 px-4">No Slip & Tanggal</th>
                <th className="py-4 px-4">Karyawan & Posisi</th>
                <th className="py-4 px-4 text-center">Kehadiran</th>
                <th className="py-4 px-4 text-center">Lembur</th>
                <th className="py-4 px-4 text-right">Gaji Pokok / Upah</th>
                <th className="py-4 px-4 text-right">Total Tunjangan</th>
                <th className="py-4 px-4 text-right">Potongan BPJS</th>
                <th className="py-4 px-4 text-right">Take Home Pay</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-dstech-blue" />
                    <span>Memuat data penggajian...</span>
                  </td>
                </tr>
              ) : filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <Banknote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-slate-600">Belum Ada Data Penggajian</p>
                    <p className="text-xs mt-1">Gunakan tombol &apos;⚡ Auto-Generate Penggajian&apos; untuk memproses slip gaji otomatis.</p>
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((p) => {
                  const totalAllowances =
                    (p.presenceAllowance || 0) +
                    (p.overtimePay || 0) +
                    (p.positionAllowance || 0) +
                    (p.transportAllowance || 0) +
                    (p.mealAllowance || 0) +
                    (p.bonusProject || 0) +
                    (p.bonusPerformance || 0);

                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="w-4 h-4 rounded border-slate-300 text-dstech-blue focus:ring-dstech-blue cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">{p.slipNumber}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{p.paymentDate}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{p.employeeName}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-600 font-medium">{p.employeeRole}</span>
                          {p.dailyRate ? (
                            <span
                              className={`inline-block px-1.5 py-0.5 text-[9px] font-black rounded ${
                                p.dailyRate <= 150000
                                  ? "bg-cyan-100 text-cyan-800 border border-cyan-300"
                                  : p.dailyRate <= 175000
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-purple-100 text-purple-800 border border-purple-300"
                              }`}
                            >
                              {formatRupiah(p.dailyRate)}/hr
                            </span>
                          ) : p.positionTier ? (
                            <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-600">
                              {p.positionTier}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.bankAccount}</div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-slate-800">{p.presenceDays} Hari</span>
                        <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                          {formatRupiah(p.presenceAllowance)}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-slate-800">{p.overtimeHours} Jam</span>
                        <div className="text-[10px] text-amber-600 font-bold mt-0.5">
                          {formatRupiah(p.overtimePay)}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-medium text-slate-900">
                        {formatRupiah(p.baseSalary)}
                      </td>

                      <td className="py-4 px-4 text-right font-medium text-slate-700">
                        {formatRupiah(totalAllowances)}
                      </td>

                      <td className="py-4 px-4 text-right font-medium text-rose-600">
                        -{formatRupiah(p.totalDeductions)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span className="font-black text-slate-900 text-sm">
                          {formatRupiah(p.takeHomePay)}
                        </span>
                        {p.recordedInCashFlow && (
                          <div className="text-[9px] text-emerald-600 font-bold mt-0.5">
                            ✓ Kas ERP Tercatat
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            p.status === "Dibayarkan"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : p.status === "Disetujui"
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Cetak Slip A4 */}
                          <button
                            onClick={() => setSelectedSlipForPrint(p)}
                            title="Cetak Slip Gaji A4"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-dstech-blue hover:bg-blue-50 transition-all"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Bayar & Catat ke Kas ERP jika belum lunas */}
                          {p.status !== "Dibayarkan" && (
                            <button
                              onClick={() => handleMarkAsPaid(p)}
                              title="Tandai Dibayarkan & Masuk Kas ERP"
                              className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit Slip */}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Slip Gaji"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Hapus Slip */}
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, id: p.id, name: `${p.employeeName} (${p.slipNumber})` })}
                            title="Hapus Slip Gaji"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
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

            {/* Total Footer */}
            {filteredPayrolls.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/80 font-black text-slate-900 text-xs border-t-2 border-slate-200">
                  <td colSpan={5} className="py-4 px-4 text-right">
                    TOTAL KESELURUHAN PENGGAJIAN:
                  </td>
                  <td className="py-4 px-4 text-right">
                    {formatRupiah(filteredPayrolls.reduce((sum, p) => sum + (p.baseSalary || 0), 0))}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {formatRupiah(
                      filteredPayrolls.reduce(
                        (sum, p) =>
                          sum +
                          (p.presenceAllowance || 0) +
                          (p.overtimePay || 0) +
                          (p.positionAllowance || 0) +
                          (p.transportAllowance || 0) +
                          (p.bonusProject || 0) +
                          (p.bonusPerformance || 0),
                        0
                      )
                    )}
                  </td>
                  <td className="py-4 px-4 text-right text-rose-600">
                    -{formatRupiah(filteredPayrolls.reduce((sum, p) => sum + (p.totalDeductions || 0), 0))}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-dstech-blue">
                    {formatRupiah(filteredPayrolls.reduce((sum, p) => sum + (p.takeHomePay || 0), 0))}
                  </td>
                  <td colSpan={2} className="py-4 px-4 text-center text-[10px] text-slate-500 font-bold">
                    {filteredPayrolls.length} Karyawan
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: PENGATURAN AUTO PAYDAY ================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Pengaturan Auto Payday & Gaji
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Atur jadwal gajian otomatis, periode cut-off presensi, dan tarif acuan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 mt-6">
              {/* Tanggal Gajian Otomatis */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                <label className="block text-xs font-black text-dstech-blue uppercase tracking-wider">
                  Jadwal Tanggal Gajian Bulanan (Auto Payday)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Tanggal Gajian Setiap Bulan:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={settings.autoPaydayDay}
                        onChange={(e) =>
                          setSettings({ ...settings, autoPaydayDay: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black focus:outline-none focus:ring-2 focus:ring-dstech-blue"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                        Setiap Bulan
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Metode Transfer Default:
                    </label>
                    <select
                      value={settings.defaultPaymentMethod}
                      onChange={(e) =>
                        setSettings({ ...settings, defaultPaymentMethod: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-dstech-blue"
                    >
                      <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                      <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                      <option value="Kas Tunai (Petty Cash)">Kas Tunai (Petty Cash)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Tanggal Awal Cut-Off Absensi:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={settings.cutoffStartDay}
                      onChange={(e) =>
                        setSettings({ ...settings, cutoffStartDay: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                    <span className="text-[10px] text-slate-400">Contoh: Tanggal 21 bulan lalu</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Tanggal Akhir Cut-Off Absensi:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={settings.cutoffEndDay}
                      onChange={(e) =>
                        setSettings({ ...settings, cutoffEndDay: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                    <span className="text-[10px] text-slate-400">Contoh: Tanggal 20 bulan ini</span>
                  </div>
                </div>
              </div>

              {/* Standard Rates */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Tarif Acuan Penggajian
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Uang Kehadiran (Rp/Hari):
                    </label>
                    <input
                      type="number"
                      value={settings.standardPresenceRate}
                      onChange={(e) =>
                        setSettings({ ...settings, standardPresenceRate: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Upah Lembur Standar (Rp/Jam):
                    </label>
                    <input
                      type="number"
                      value={settings.standardOvertimeRate}
                      onChange={(e) =>
                        setSettings({ ...settings, standardOvertimeRate: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Tunjangan Transport Default (Rp):
                    </label>
                    <input
                      type="number"
                      value={settings.standardTransportAllowance}
                      onChange={(e) =>
                        setSettings({ ...settings, standardTransportAllowance: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Potongan BPJS Standar (Rp):
                    </label>
                    <input
                      type="number"
                      value={settings.defaultBpjsDeduction}
                      onChange={(e) =>
                        setSettings({ ...settings, defaultBpjsDeduction: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi Tambahan: Tarif Gaji Harian Berdasarkan Posisi / Keahlian Jabatan */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-dstech-blue inline-block"></span>
                    Tarif Harian Berdasarkan Posisi / Keahlian Jabatan
                  </label>
                  <span className="text-[10px] text-dstech-blue font-bold bg-white px-2.5 py-0.5 rounded-full border border-blue-100 shadow-xs">
                    Skema Standar DSTech
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Atur tarif upah harian dan lembur acuan untuk Helper (150rb), Teknisi Skill (175rb), Senior (200rb), dan Lead/Foreman (225rb).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Helper */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">👷‍♂️ Helper / Asisten</span>
                      <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">Helper</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Tarif/Hari (Rp):</label>
                        <input
                          type="number"
                          value={settings.dailyRatesByPosition?.helper?.dailyRate || 150000}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSettings({
                              ...settings,
                              dailyRatesByPosition: {
                                ...settings.dailyRatesByPosition!,
                                helper: {
                                  name: "Helper / Asisten Teknisi",
                                  dailyRate: val,
                                  overtimeRate: settings.dailyRatesByPosition?.helper?.overtimeRate || 25000,
                                },
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-black text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Lembur/Jam (Rp):</label>
                        <input
                          type="number"
                          value={settings.dailyRatesByPosition?.helper?.overtimeRate || 25000}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSettings({
                              ...settings,
                              dailyRatesByPosition: {
                                ...settings.dailyRatesByPosition!,
                                helper: {
                                  name: "Helper / Asisten Teknisi",
                                  dailyRate: settings.dailyRatesByPosition?.helper?.dailyRate || 150000,
                                  overtimeRate: val,
                                },
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-xs text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Teknisi Skill */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900">⚡ Teknisi Skill / Ahli</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Skill</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Tarif/Hari (Rp):</label>
                        <input
                          type="number"
                          value={settings.dailyRatesByPosition?.skill?.dailyRate || 175000}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSettings({
                              ...settings,
                              dailyRatesByPosition: {
                                ...settings.dailyRatesByPosition!,
                                skill: {
                                  name: "Teknisi Skill / Ahli",
                                  dailyRate: val,
                                  overtimeRate: settings.dailyRatesByPosition?.skill?.overtimeRate || 30000,
                                },
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-black text-xs text-emerald-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Lembur/Jam (Rp):</label>
                        <input
                          type="number"
                          value={settings.dailyRatesByPosition?.skill?.overtimeRate || 30000}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSettings({
                              ...settings,
                              dailyRatesByPosition: {
                                ...settings.dailyRatesByPosition!,
                                skill: {
                                  name: "Teknisi Skill / Ahli",
                                  dailyRate: settings.dailyRatesByPosition?.skill?.dailyRate || 175000,
                                  overtimeRate: val,
                                },
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-xs text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Teknisi Senior */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">🎯 Teknisi Senior</span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Senior</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Tarif/Hari (Rp):</label>
                        <input
                          type="number"
                          value={settings.dailyRatesByPosition?.senior?.dailyRate || 200000}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSettings({
                              ...settings,
                              dailyRatesByPosition: {
                                ...settings.dailyRatesByPosition!,
                                senior: {
                                  name: "Teknisi Senior / Specialist",
                                  dailyRate: val,
                                  overtimeRate: settings.dailyRatesByPosition?.senior?.overtimeRate || 35000,
                                },
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-black text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Lembur/Jam (Rp):</label>
                        <input
                          type="number"
                          value={settings.dailyRatesByPosition?.senior?.overtimeRate || 35000}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSettings({
                              ...settings,
                              dailyRatesByPosition: {
                                ...settings.dailyRatesByPosition!,
                                senior: {
                                  name: "Teknisi Senior / Specialist",
                                  dailyRate: settings.dailyRatesByPosition?.senior?.dailyRate || 200000,
                                  overtimeRate: val,
                                },
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-xs text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lead / Foreman */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">👑 Lead / Foreman</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Lead</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Tarif/Hari (Rp):</label>
                        <input
                          type="number"
                          value={settings.dailyRatesByPosition?.lead?.dailyRate || 225000}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSettings({
                              ...settings,
                              dailyRatesByPosition: {
                                ...settings.dailyRatesByPosition!,
                                lead: {
                                  name: "Lead / Foreman Lapangan",
                                  dailyRate: val,
                                  overtimeRate: settings.dailyRatesByPosition?.lead?.overtimeRate || 40000,
                                },
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-black text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Lembur/Jam (Rp):</label>
                        <input
                          type="number"
                          value={settings.dailyRatesByPosition?.lead?.overtimeRate || 40000}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSettings({
                              ...settings,
                              dailyRatesByPosition: {
                                ...settings.dailyRatesByPosition!,
                                lead: {
                                  name: "Lead / Foreman Lapangan",
                                  dailyRate: settings.dailyRatesByPosition?.lead?.dailyRate || 225000,
                                  overtimeRate: val,
                                },
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-xs text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seksi Kebijakan Cuti, Izin & Sakit */}
              <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Kebijakan Cuti, Izin & Sakit (Peraturan Penggajian)
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded">
                    Auto-Payroll Rule
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Kuota Cuti Tahunan Default
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={settings.leaveSettings?.defaultAnnualLeave ?? 12}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            leaveSettings: {
                              ...settings.leaveSettings!,
                              defaultAnnualLeave: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-xs"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-400">hari/thn</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Batas Izin Khusus Berbayar
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="14"
                        value={settings.leaveSettings?.paidPermissionDays ?? 3}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            leaveSettings: {
                              ...settings.leaveSettings!,
                              paidPermissionDays: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-xs"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-400">hari/thn</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Pembagi Potongan Harian
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="20"
                        max="31"
                        value={settings.leaveSettings?.prorateDivisor ?? 25}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            leaveSettings: {
                              ...settings.leaveSettings!,
                              prorateDivisor: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-xs"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-400">hari kerja</span>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5 block">Potongan/hari = Gaji / {settings.leaveSettings?.prorateDivisor || 25}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1 text-[11px] font-medium text-emerald-900">
                  <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-emerald-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.leaveSettings?.sickRequiresDoctorNote ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          leaveSettings: {
                            ...settings.leaveSettings!,
                            sickRequiresDoctorNote: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>Sakit wajib Surat Keterangan Dokter (SKD)</span>
                  </label>

                  <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-emerald-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.leaveSettings?.sickLeavePaid ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          leaveSettings: {
                            ...settings.leaveSettings!,
                            sickLeavePaid: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>Sakit ber-SKD dibayar penuh 100% tanpa potongan</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-dstech-blue hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
                >
                  {actionLoading ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: AUTO-GENERATE PAYROLL ================= */}
      {isAutoGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    ⚡ Auto-Generate Penggajian
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Kalkulasi slip gaji seluruh staf otomatis dari presensi & kontrak kerja.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAutoGenerateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-6">
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Bagaimana Cara Kerja Auto-Payroll?
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-amber-800">
                  <li>Sistem membaca seluruh karyawan aktif dari <strong>Kontrak Kerja</strong> dan <strong>Master User</strong>.</li>
                  <li>Menghitung jumlah kehadiran hari kerja riil dan jam lembur yang telah disetujui dalam bulan berjalan.</li>
                  <li>Mengaplikasikan skema upah kontrak (Staf Bulanan / Teknisi Harian Penuh / Jam-jaman).</li>
                  <li>Menerbitkan slip gaji lengkap dengan nomor slip otomatis (contoh: <code>SLIP-DSTECH-202610-001</code>).</li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Periode Bulan Penggajian:
                </label>
                <input
                  type="month"
                  value={autoGenMonth}
                  onChange={(e) => setAutoGenMonth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* LIVE PREVIEW VALIDITAS KONTRAK KERJA PADA PERIODE TERPILIH */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-dstech-blue" />
                    Sinkronisasi Kontrak Periode ({autoGenMonth}):
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Hanya kontrak sah & aktif yang diproses
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Karyawan Layak Berkontrak */}
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-800">Kontrak Aktif</span>
                      <span className="px-1.5 py-0.2 text-[10px] font-black bg-emerald-200/70 text-emerald-900 rounded-full">
                        {autoGenContractsPreview.eligible.length} Karyawan
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-700 leading-tight">
                      Masa berlaku kontrak mencakup periode {autoGenMonth}.
                    </p>
                    {autoGenContractsPreview.eligible.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {autoGenContractsPreview.eligible.map((c: any) => (
                          <div key={c.id} className="text-[10px] text-emerald-900 font-semibold truncate flex items-center gap-1">
                            <span>•</span> {c.employeeName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Karyawan Kontrak Berakhir / Perlu Perpanjangan */}
                  <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-rose-800">Kontrak Berakhir</span>
                      <span className="px-1.5 py-0.2 text-[10px] font-black bg-rose-200/70 text-rose-900 rounded-full">
                        {autoGenContractsPreview.expired.length} Karyawan
                      </span>
                    </div>
                    <p className="text-[10px] text-rose-700 leading-tight">
                      Tidak diproses otomatis (butuh perpanjangan PKWT).
                    </p>
                    {autoGenContractsPreview.expired.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {autoGenContractsPreview.expired.map((c: any) => (
                          <div key={c.id} className="text-[10px] text-rose-900 font-medium leading-tight">
                            <span className="font-bold block">• {c.employeeName}</span>
                            <span className="text-[9px] text-rose-600 block pl-2">
                              {c.expiredReason}
                            </span>
                          </div>
                        ))}
                        <Link
                          href="/admin/contracts"
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold hover:underline mt-1 pt-1 border-t border-rose-200/60"
                        >
                          Perpanjang Kontrak di Menu Kontrak →
                        </Link>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic block mt-1">Tidak ada kontrak expired</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={autoGenOverwrite}
                    onChange={(e) => setAutoGenOverwrite(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Perbarui nilai slip gaji yang sudah pernah dibuat untuk bulan ini (Overwrite)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAutoGenerateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleRunAutoGenerate}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Mengkalkulasi...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Mulai Auto-Generate Gaji</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: FORM SLIP GAJI MANUAL (TAMBAH / EDIT) ================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center font-bold">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {formData.isEdit ? "Edit Rincian Slip Gaji" : "Terbitkan Slip Gaji Manual"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Kalkulator rincian pendapatan pokok, tunjangan, lembur, dan potongan staf.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-6 mt-6">
              {/* Banner Sinkronisasi Kontrak untuk Mode Edit */}
              {formData.isEdit && (() => {
                const matchedContract = contracts.find(
                  (c) => c.employeeName?.trim().toLowerCase() === formData.employeeName?.trim().toLowerCase()
                );
                if (!matchedContract) return null;
                return (
                  <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-blue-950 font-semibold">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span>
                          Ditemukan Kontrak Kerja Aktif: <strong>{matchedContract.employeeName}</strong> — {matchedContract.position}
                        </span>
                        <div className="text-[10px] text-blue-700 font-normal mt-0.5">
                          {matchedContract.employeeCategory === "STAFF" || matchedContract.salaryScheme?.staffScheme
                            ? `Gaji Pokok: Rp ${Number(matchedContract.salaryScheme?.staffScheme?.baseSalary || 4200000).toLocaleString("id-ID")} (Bulanan)`
                            : `Upah Harian: Rp ${Number(matchedContract.salaryScheme?.dailyScheme?.dailyRate || 175000).toLocaleString("id-ID")}/hari`}
                          {" | "}Transport: {matchedContract.allowances?.transportMethod === "DAILY_PRESENCE" ? `Rp ${Number(matchedContract.allowances?.transportAmount || 20000).toLocaleString("id-ID")}/hr hadir` : `Rp ${Number(matchedContract.allowances?.transportAmount || 400000).toLocaleString("id-ID")}/bln full`}
                          {" | "}Makan: {matchedContract.allowances?.mealMethod === "DAILY_PRESENCE" ? `Rp ${Number(matchedContract.allowances?.mealAmount || 25000).toLocaleString("id-ID")}/hr hadir` : `Rp ${Number(matchedContract.allowances?.mealAmount || 500000).toLocaleString("id-ID")}/bln full`}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyContractData(matchedContract)}
                      className="px-3.5 py-2 bg-dstech-blue hover:bg-blue-600 text-white rounded-xl font-bold text-xs shrink-0 shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>🔄 Sinkronkan dengan Kontrak</span>
                    </button>
                  </div>
                );
              })()}

              {/* Seksi 1: Data Identitas & Periode */}
              <div className="space-y-4">
                {/* Selector Cepat Kontrak Kerja */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-dstech-blue" />
                      ⚡ Pilih Karyawan dari Kontrak Kerja (Otomatis Isi Tarif & Skema Tunjangan)
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Rekomendasi Presisi
                    </span>
                  </label>
                  <select
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) return;
                      const found = contracts.find((c) => c.id === selectedId);
                      if (found) applyContractData(found);
                    }}
                    defaultValue=""
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-dstech-blue cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Pilih Karyawan Berkontrak (Tarif Otomatis Mengikuti Kontrak) --</option>
                    {contracts.map((c: any) => {
                      const isStaf = c.employeeCategory === "STAFF" || c.salaryScheme?.staffScheme;
                      const rateDesc = isStaf
                        ? `Bulanan Rp ${Number(c.salaryScheme?.staffScheme?.baseSalary || 4200000).toLocaleString("id-ID")}`
                        : `Harian Rp ${Number(c.salaryScheme?.dailyScheme?.dailyRate || 175000).toLocaleString("id-ID")}/hr`;

                      // Evaluasi masa berlaku kontrak terhadap bulan penggajian yang dipilih
                      const formMonthStart = `${formData.month}-01`;
                      const isExpired = c.endDate && c.endDate < formMonthStart;
                      const statusTag = isExpired
                        ? ` [⚠️ KONTRAK BERAKHIR ${c.endDate}]`
                        : ` [✅ Aktif s.d ${c.endDate}]`;

                      return (
                        <option
                          key={c.id}
                          value={c.id}
                          className={isExpired ? "text-rose-600 font-semibold" : "text-slate-800"}
                        >
                          {c.employeeName} — {c.position} ({rateDesc}){statusTag}
                        </option>
                      );
                    })}
                  </select>

                  {/* Banner Peringatan Jika Kontrak Karyawan Expired pada Bulan yang Dipilih */}
                  {(() => {
                    const matched = contracts.find(
                      (c) => c.employeeName?.trim().toLowerCase() === formData.employeeName?.trim().toLowerCase()
                    );
                    if (!matched) return null;
                    const formMonthStart = `${formData.month}-01`;
                    if (matched.endDate && matched.endDate < formMonthStart) {
                      return (
                        <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Peringatan Sinkronisasi Kontrak:</span> Kontrak kerja <strong>{matched.employeeName}</strong> telah berakhir pada <strong>{matched.endDate}</strong> dan belum diperpanjang untuk periode <strong>{formData.month}</strong>.
                            <div className="text-[10px] text-rose-600 mt-0.5">
                              Slip gaji manual tetap dapat diterbitkan, namun sangat dianjurkan untuk memperbarui/memperpanjang kontrak di <Link href="/admin/contracts" target="_blank" className="underline font-bold text-blue-700">Menu Kontrak Kerja</Link> agar legalitas gaji sah.
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <span className="text-[10px] text-slate-500 mt-1.5 block">
                    Memilih karyawan otomatis menyelaraskan: Jabatan, Tarif Harian/Pokok Bulanan, Tarif Lembur, Tunjangan Transport & Makan (Full vs Harian), serta Rekening Bank.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nama Karyawan *</label>
                    <input
                      type="text"
                      required
                      value={formData.employeeName}
                      onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                      placeholder="Contoh: Rian Maulana"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-dstech-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Jabatan / Divisi *</label>
                    <input
                      type="text"
                      required
                      value={formData.employeeRole}
                      onChange={(e) => setFormData({ ...formData, employeeRole: e.target.value })}
                      placeholder="Contoh: Helper / Asisten Teknisi CCTV"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-dstech-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Periode Bulan *</label>
                    <input
                      type="month"
                      required
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-dstech-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal Pembayaran</label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-dstech-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Metode Transfer</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-dstech-blue"
                    >
                      <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                      <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                      <option value="Kas Tunai (Petty Cash)">Kas Tunai (Petty Cash)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nomor Rekening / Rek Tujuan</label>
                    <input
                      type="text"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      placeholder="BCA 0293847561 a.n Rian"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-dstech-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi 2: Pilihan Tingkatan Posisi & Komponen Upah Utama */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-dstech-blue inline-block"></span>
                    Komponen Upah Pokok & Tarif Tingkat Jabatan
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold">
                    Pilih preset tingkat keahlian atau sesuaikan manual
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const rate = settings.dailyRatesByPosition?.helper?.dailyRate || 150000;
                      const ot = settings.dailyRatesByPosition?.helper?.overtimeRate || 25000;
                      const days = formData.presenceDays || 22;
                      const tAmt = formData.transportMethod === "DAILY_PRESENCE" ? days * 20000 : 400000;
                      const mAmt = formData.mealMethod === "DAILY_PRESENCE" ? days * 25000 : 500000;
                      setFormData({
                        ...formData,
                        positionTier: "helper",
                        dailyRate: rate,
                        baseSalary: days * rate,
                        presenceRate: 0,
                        presenceAllowance: 0,
                        overtimeRate: ot,
                        overtimePay: (formData.overtimeHours || 0) * ot,
                        transportAllowance: tAmt,
                        mealAllowance: mAmt,
                        employeeRole: formData.employeeRole || "Helper / Asisten Teknisi CCTV",
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formData.positionTier === "helper" || formData.dailyRate === 150000
                        ? "border-cyan-500 bg-cyan-50 text-cyan-950 font-bold shadow-xs ring-1 ring-cyan-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-100/80 text-slate-700"
                    }`}
                  >
                    <div className="text-[11px] font-black">👷‍♂️ Helper</div>
                    <div className="text-xs font-black text-cyan-800 mt-0.5">Rp 150.000<span className="text-[10px] font-normal">/hr</span></div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Lembur: 25rb/jam</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const rate = settings.dailyRatesByPosition?.skill?.dailyRate || 175000;
                      const ot = settings.dailyRatesByPosition?.skill?.overtimeRate || 30000;
                      const days = formData.presenceDays || 22;
                      const tAmt = formData.transportMethod === "DAILY_PRESENCE" ? days * 20000 : 400000;
                      const mAmt = formData.mealMethod === "DAILY_PRESENCE" ? days * 25000 : 500000;
                      setFormData({
                        ...formData,
                        positionTier: "skill",
                        dailyRate: rate,
                        baseSalary: days * rate,
                        presenceRate: 0,
                        presenceAllowance: 0,
                        overtimeRate: ot,
                        overtimePay: (formData.overtimeHours || 0) * ot,
                        transportAllowance: tAmt,
                        mealAllowance: mAmt,
                        employeeRole: formData.employeeRole || "Teknisi Skill Instalasi & Integrasi",
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formData.positionTier === "skill" || (formData.dailyRate === 175000 && formData.positionTier !== "helper")
                        ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-100/80 text-slate-700"
                    }`}
                  >
                    <div className="text-[11px] font-black">⚡ Teknisi Skill</div>
                    <div className="text-xs font-black text-emerald-800 mt-0.5">Rp 175.000<span className="text-[10px] font-normal">/hr</span></div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Lembur: 30rb/jam</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const rate = settings.dailyRatesByPosition?.senior?.dailyRate || 200000;
                      const ot = settings.dailyRatesByPosition?.senior?.overtimeRate || 35000;
                      const days = formData.presenceDays || 22;
                      const tAmt = formData.transportMethod === "DAILY_PRESENCE" ? days * 25000 : 400000;
                      const mAmt = formData.mealMethod === "DAILY_PRESENCE" ? days * 30000 : 500000;
                      setFormData({
                        ...formData,
                        positionTier: "senior",
                        dailyRate: rate,
                        baseSalary: days * rate,
                        presenceRate: 0,
                        presenceAllowance: 0,
                        overtimeRate: ot,
                        overtimePay: (formData.overtimeHours || 0) * ot,
                        transportAllowance: tAmt,
                        mealAllowance: mAmt,
                        employeeRole: formData.employeeRole || "Teknisi Senior Specialist",
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formData.positionTier === "senior" || formData.dailyRate === 200000
                        ? "border-purple-500 bg-purple-50 text-purple-950 font-bold shadow-xs ring-1 ring-purple-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-100/80 text-slate-700"
                    }`}
                  >
                    <div className="text-[11px] font-black">🎯 Teknisi Senior</div>
                    <div className="text-xs font-black text-purple-800 mt-0.5">Rp 200.000<span className="text-[10px] font-normal">/hr</span></div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Lembur: 35rb/jam</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        positionTier: "staff",
                        dailyRate: 0,
                        baseSalary: 4200000,
                        presenceAllowance: 0,
                        presenceRate: 0,
                        positionAllowance: 500000,
                        transportAllowance: 400000,
                        mealAllowance: 500000,
                        overtimeRate: 30000,
                        transportMethod: "FULL_MONTHLY",
                        mealMethod: "FULL_MONTHLY",
                        employeeRole: formData.employeeRole || "Staf Kantor / Administrasi",
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formData.positionTier === "staff"
                        ? "border-blue-500 bg-blue-50 text-blue-950 font-bold shadow-xs ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-100/80 text-slate-700"
                    }`}
                  >
                    <div className="text-[11px] font-black">🏢 Staf Kantor</div>
                    <div className="text-xs font-black text-blue-800 mt-0.5">Gaji Bulanan</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Pokok Tetap + Full Tunjangan</div>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Tarif Upah Harian (Rp/Hari)
                    </label>
                    <input
                      type="number"
                      value={formData.dailyRate || 0}
                      onChange={(e) => {
                        const rate = Number(e.target.value);
                        setFormData({
                          ...formData,
                          dailyRate: rate,
                          baseSalary: rate > 0 ? (formData.presenceDays || 0) * rate : formData.baseSalary,
                        });
                      }}
                      placeholder="Helper 150rb / Skill 175rb / Senior 200rb"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-dstech-blue bg-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Helper 150rb | Skill 175rb | Senior 200rb | Bulanan: 0
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Jumlah Hadir Kerja (Hari)
                    </label>
                    <input
                      type="number"
                      value={formData.presenceDays}
                      onChange={(e) => {
                        const days = Number(e.target.value);
                        const rate = formData.dailyRate || 0;
                        const newBase = rate > 0 ? days * rate : formData.baseSalary;
                        const newTransport =
                          formData.transportMethod === "DAILY_PRESENCE"
                            ? days * (formData.transportUnit || 20000)
                            : formData.transportAllowance;
                        const newMeal =
                          formData.mealMethod === "DAILY_PRESENCE"
                            ? days * (formData.mealUnit || 25000)
                            : formData.mealAllowance;

                        setFormData({
                          ...formData,
                          presenceDays: days,
                          baseSalary: newBase,
                          presenceAllowance: rate > 0 ? 0 : days * (formData.presenceRate || 0),
                          transportAllowance: newTransport,
                          mealAllowance: newMeal,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {formData.dailyRate && formData.dailyRate > 0
                        ? `Otomatis: ${formData.presenceDays} hr x ${formatRupiah(formData.dailyRate)}`
                        : "Hari kerja hadir (bulanan flat)"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Total Gaji Pokok / Upah (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-900 bg-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Total pokok hasil kehadiran / bulanan
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Uang Kehadiran (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.presenceAllowance}
                      onChange={(e) => setFormData({ ...formData, presenceAllowance: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-emerald-600 bg-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {formData.dailyRate && formData.dailyRate > 0 ? "Khusus staf bulanan (harian = 0)" : "Tunjangan kehadiran bulanan"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Jam Lembur (Jam)</label>
                    <input
                      type="number"
                      value={formData.overtimeHours}
                      onChange={(e) => {
                        const hrs = Number(e.target.value);
                        setFormData({
                          ...formData,
                          overtimeHours: hrs,
                          overtimePay: hrs * formData.overtimeRate,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tarif Lembur (Rp/Jam)</label>
                    <input
                      type="number"
                      value={formData.overtimeRate}
                      onChange={(e) => {
                        const rate = Number(e.target.value);
                        setFormData({
                          ...formData,
                          overtimeRate: rate,
                          overtimePay: formData.overtimeHours * rate,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Total Upah Lembur (Rp)</label>
                    <input
                      type="number"
                      value={formData.overtimePay}
                      onChange={(e) => setFormData({ ...formData, overtimePay: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi 3: Tunjangan Tambahan & Potongan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tunjangan */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                    Tunjangan & Bonus
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">Tunjangan Jabatan (Rp)</label>
                      <input
                        type="number"
                        value={formData.positionAllowance}
                        onChange={(e) => setFormData({ ...formData, positionAllowance: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">Tunjangan Transport (Rp)</label>
                      <input
                        type="number"
                        value={formData.transportAllowance}
                        onChange={(e) => setFormData({ ...formData, transportAllowance: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">Tunjangan Uang Makan (Rp)</label>
                      <input
                        type="number"
                        value={formData.mealAllowance}
                        onChange={(e) => setFormData({ ...formData, mealAllowance: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">Bonus Proyek Lapangan (Rp)</label>
                      <input
                        type="number"
                        value={formData.bonusProject}
                        onChange={(e) => setFormData({ ...formData, bonusProject: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Potongan */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-rose-700 uppercase tracking-wider">
                    Potongan Gaji
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">Potongan BPJS Ketenagakerjaan (Rp)</label>
                      <input
                        type="number"
                        value={formData.bpjsDeduction}
                        onChange={(e) => setFormData({ ...formData, bpjsDeduction: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-rose-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">Pinjaman / Kasbon Karyawan (Rp)</label>
                      <input
                        type="number"
                        value={formData.loanDeduction}
                        onChange={(e) => setFormData({ ...formData, loanDeduction: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-rose-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">Status Pembayaran Slip</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-black"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Disetujui">Disetujui</option>
                        <option value="Dibayarkan">Dibayarkan</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Kalkulasi Preview */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimasi Take Home Pay (Gaji Bersih)</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {formatRupiah(
                      Math.max(
                        0,
                        (Number(formData.baseSalary) || 0) +
                          (Number(formData.presenceAllowance) || 0) +
                          (Number(formData.overtimePay) || 0) +
                          (Number(formData.positionAllowance) || 0) +
                          (Number(formData.transportAllowance) || 0) +
                          (Number(formData.mealAllowance) || 0) +
                          (Number(formData.bonusProject) || 0) -
                          (Number(formData.bpjsDeduction) || 0) -
                          (Number(formData.loanDeduction) || 0)
                      )
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div>Kotor: {formatRupiah(
                    (Number(formData.baseSalary) || 0) +
                      (Number(formData.presenceAllowance) || 0) +
                      (Number(formData.overtimePay) || 0) +
                      (Number(formData.positionAllowance) || 0) +
                      (Number(formData.transportAllowance) || 0) +
                      (Number(formData.mealAllowance) || 0) +
                      (Number(formData.bonusProject) || 0)
                  )}</div>
                  <div className="text-rose-400">Potongan: -{formatRupiah(
                    (Number(formData.bpjsDeduction) || 0) + (Number(formData.loanDeduction) || 0)
                  )}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-dstech-blue hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
                >
                  {actionLoading ? "Menyimpan..." : "Simpan Slip Gaji"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: CETAK SLIP GAJI INDIVIDUAL A4 RESMI ================= */}
      {selectedSlipForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-dstech-blue" />
                <h3 className="text-base font-black text-slate-900">
                  Pratinjau Slip Gaji Resmi A4 ({selectedSlipForPrint.slipNumber})
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-dstech-blue text-white font-bold text-xs hover:bg-blue-600 flex items-center gap-2 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Sekarang</span>
                </button>
                <button
                  onClick={() => setSelectedSlipForPrint(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Template Cetak Slip Gaji Resmi Ber-Kop DSTech */}
            <div className="mt-6 p-8 border border-slate-200 rounded-2xl bg-white text-slate-900 font-sans print:border-none print:p-0">
              {/* Header Kop Surat */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-12">
                    <Image src="/logo.png" alt="DSTech Logo" fill className="object-contain" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900">
                      PT. DSTECH SMART PERKASA
                    </h2>
                    <p className="text-[11px] text-slate-600">
                      Security Systems, IT Networking & Smart Technology Solutions
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Jl. Temu Putih No. 12, Cilegon - Banten | cs@dstechsmart.com | 0822-5949-4242
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-3 py-1 rounded-md">
                    SLIP GAJI KARYAWAN
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                    {selectedSlipForPrint.slipNumber}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Periode: {selectedSlipForPrint.month}
                  </p>
                </div>
              </div>

              {/* Data Karyawan */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Nama Karyawan:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedSlipForPrint.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Jabatan / Divisi:</span>
                  <span className="font-bold text-slate-900">{selectedSlipForPrint.employeeRole}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Tanggal Pembayaran:</span>
                  <span className="font-bold text-slate-900">{selectedSlipForPrint.paymentDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Rekening & Metode:</span>
                  <span className="font-bold text-slate-900">{selectedSlipForPrint.bankAccount} ({selectedSlipForPrint.paymentMethod})</span>
                </div>
              </div>

              {/* Tabel Komponen Penerimaan & Potongan */}
              <div className="grid grid-cols-2 gap-6 text-xs mb-6">
                {/* Penerimaan */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 text-[11px]">
                    1. Penerimaan (Earnings)
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-slate-600 block">Gaji Pokok / Upah Pokok:</span>
                        {selectedSlipForPrint.dailyRate && selectedSlipForPrint.dailyRate > 0 ? (
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            ({selectedSlipForPrint.presenceDays || 0} Hari Kerja x {formatRupiah(selectedSlipForPrint.dailyRate)})
                            {selectedSlipForPrint.positionTier ? ` • Grade: ${selectedSlipForPrint.positionTier.toUpperCase()}` : ""}
                          </span>
                        ) : null}
                      </div>
                      <span className="font-bold">{formatRupiah(selectedSlipForPrint.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Uang Kehadiran ({selectedSlipForPrint.presenceDays} Hari):</span>
                      <span className="font-bold text-emerald-700">{formatRupiah(selectedSlipForPrint.presenceAllowance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Upah Lembur ({selectedSlipForPrint.overtimeHours} Jam):</span>
                      <span className="font-bold text-amber-700">{formatRupiah(selectedSlipForPrint.overtimePay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tunjangan Jabatan:</span>
                      <span className="font-bold">{formatRupiah(selectedSlipForPrint.positionAllowance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tunjangan Transport:</span>
                      <span className="font-bold">{formatRupiah(selectedSlipForPrint.transportAllowance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tunjangan Uang Makan:</span>
                      <span className="font-bold">{formatRupiah(selectedSlipForPrint.mealAllowance || 0)}</span>
                    </div>
                    {selectedSlipForPrint.bonusProject > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Bonus Proyek Lapangan:</span>
                        <span className="font-bold">{formatRupiah(selectedSlipForPrint.bonusProject)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900">
                      <span>Total Penerimaan Kotor:</span>
                      <span>{formatRupiah(selectedSlipForPrint.totalGross)}</span>
                    </div>
                  </div>
                </div>

                {/* Potongan */}
                <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-slate-100 px-4 py-2 font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 text-[11px]">
                      2. Potongan (Deductions)
                    </div>
                    <div className="p-4 space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Potongan BPJS:</span>
                        <span className="font-bold text-rose-700">-{formatRupiah(selectedSlipForPrint.bpjsDeduction)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Pinjaman / Kasbon:</span>
                        <span className="font-bold text-rose-700">-{formatRupiah(selectedSlipForPrint.loanDeduction)}</span>
                      </div>
                      {selectedSlipForPrint.otherDeduction > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Potongan Lainnya:</span>
                          <span className="font-bold text-rose-700">-{formatRupiah(selectedSlipForPrint.otherDeduction)}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-rose-700">
                        <span>Total Potongan:</span>
                        <span>-{formatRupiah(selectedSlipForPrint.totalDeductions)}</span>
                      </div>
                    </div>
                  </div>

                  {/* THP Box */}
                  <div className="p-4 bg-slate-900 text-white rounded-b-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">GAJI BERSIH (TAKE HOME PAY)</span>
                      <div className="text-lg font-black text-emerald-400">
                        {formatRupiah(selectedSlipForPrint.takeHomePay)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-black uppercase">
                        {selectedSlipForPrint.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tanda Tangan Dual Approval */}
              <div className="grid grid-cols-2 gap-12 text-center text-xs pt-6 mt-6 border-t border-slate-200">
                <div>
                  <p className="text-slate-500 font-medium">Diterima Oleh Karyawan,</p>
                  <div className="h-16 flex items-end justify-center">
                    <span className="border-b border-slate-400 w-48 pb-1 font-bold text-slate-900">
                      {selectedSlipForPrint.employeeName}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Disahkan Oleh Keuangan / HRD,</p>
                  <div className="h-16 flex items-end justify-center">
                    <span className="border-b border-slate-400 w-48 pb-1 font-bold text-slate-900">
                      RAMADHANI, ST (Direktur)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: CETAK LEMBAR REKAP PENGGAJIAN BULANAN RESMI A4 ================= */}
      {isRecapPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-dstech-blue" />
                <h3 className="text-base font-black text-slate-900">
                  Pratinjau Lembar Rekapitulasi Penggajian Bulanan Resmi (A4)
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-2 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Lembar Rekap</span>
                </button>
                <button
                  onClick={() => setIsRecapPrintModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lembar Rekapitulasi Ber-Kop Surat DSTech */}
            <div className="mt-6 p-8 border border-slate-200 rounded-2xl bg-white text-slate-900 font-sans print:border-none print:p-0">
              {/* Header Kop */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-14">
                    <Image src="/logo.png" alt="DSTech Logo" fill className="object-contain" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900">
                      PT. DSTECH SMART PERKASA
                    </h2>
                    <p className="text-xs text-slate-600">
                      Surveillance Systems, IT Networking & Smart Security Solutions
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Bukit Cilegon Asri Blok DB No. 19, Cilegon - Banten | cs@dstechsmart.com | 0822-5949-4242
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                    REKAPITULASI PENGGAJIAN
                  </h3>
                  <p className="text-xs font-bold text-dstech-blue">
                    Periode: {filterMonth !== "ALL" ? filterMonth : "Semua Periode"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Dicetak pada: {new Date().toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Tabel Ringkasan Rekap */}
              <table className="w-full text-left border-collapse text-xs mb-8">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-300 font-black text-slate-800 text-[10px] uppercase">
                    <th className="py-2.5 px-2 text-center">No</th>
                    <th className="py-2.5 px-2">Nama Karyawan</th>
                    <th className="py-2.5 px-2">Jabatan</th>
                    <th className="py-2.5 px-2 text-center">Hadir</th>
                    <th className="py-2.5 px-2 text-center">Lembur</th>
                    <th className="py-2.5 px-2 text-right">Gaji Pokok</th>
                    <th className="py-2.5 px-2 text-right">Tunjangan</th>
                    <th className="py-2.5 px-2 text-right">Potongan</th>
                    <th className="py-2.5 px-2 text-right">Take Home Pay</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPayrolls.map((p, idx) => {
                    const allowances =
                      (p.presenceAllowance || 0) +
                      (p.overtimePay || 0) +
                      (p.positionAllowance || 0) +
                      (p.transportAllowance || 0) +
                      (p.bonusProject || 0);

                    return (
                      <tr key={p.id}>
                        <td className="py-2 px-2 text-center font-bold">{idx + 1}</td>
                        <td className="py-2 px-2 font-bold">{p.employeeName}</td>
                        <td className="py-2 px-2 text-slate-600">{p.employeeRole}</td>
                        <td className="py-2 px-2 text-center">{p.presenceDays} Hari</td>
                        <td className="py-2 px-2 text-center">{p.overtimeHours} Jam</td>
                        <td className="py-2 px-2 text-right">{formatRupiah(p.baseSalary)}</td>
                        <td className="py-2 px-2 text-right">{formatRupiah(allowances)}</td>
                        <td className="py-2 px-2 text-right text-rose-600">-{formatRupiah(p.totalDeductions)}</td>
                        <td className="py-2 px-2 text-right font-black">{formatRupiah(p.takeHomePay)}</td>
                        <td className="py-2 px-2 text-center">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200/80 font-black border-t-2 border-slate-400 text-xs">
                    <td colSpan={5} className="py-3 px-2 text-right">TOTAL PENGELUARAN GAJI BULAN INI:</td>
                    <td className="py-3 px-2 text-right">
                      {formatRupiah(filteredPayrolls.reduce((sum, p) => sum + (p.baseSalary || 0), 0))}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {formatRupiah(
                        filteredPayrolls.reduce(
                          (sum, p) =>
                            sum +
                            (p.presenceAllowance || 0) +
                            (p.overtimePay || 0) +
                            (p.positionAllowance || 0) +
                            (p.transportAllowance || 0) +
                            (p.bonusProject || 0),
                          0
                        )
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-rose-700">
                      -{formatRupiah(filteredPayrolls.reduce((sum, p) => sum + (p.totalDeductions || 0), 0))}
                    </td>
                    <td className="py-3 px-2 text-right text-sm text-slate-950 font-black">
                      {formatRupiah(filteredPayrolls.reduce((sum, p) => sum + (p.takeHomePay || 0), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>

              {/* Tanda Tangan Pengesahan Manajemen */}
              <div className="grid grid-cols-2 gap-12 text-center text-xs pt-6 border-t border-slate-200">
                <div>
                  <p className="text-slate-500 font-medium">Dibuat Oleh (Bagian Keuangan / Payroll):</p>
                  <div className="h-20 flex items-end justify-center">
                    <span className="border-b border-slate-400 w-52 pb-1 font-bold text-slate-900">
                      Marshanda Salwa Agustina
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Staf Keuangan & Administrasi</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Disetujui Oleh (Direktur Utama):</p>
                  <div className="h-20 flex items-end justify-center">
                    <span className="border-b border-slate-400 w-52 pb-1 font-bold text-slate-900">
                      RAMADHANI, ST
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Direktur PT. DSTech Smart Perkasa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: KONFIRMASI HAPUS ================= */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center tracking-tight">
              Hapus Slip Gaji?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1 font-medium">
              Apakah Anda yakin ingin menghapus slip gaji <span className="font-bold text-slate-800">{deleteModal.name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, id: "", name: "" })}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSlip}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20"
              >
                {actionLoading ? "Menghapus..." : "Ya, Hapus Slip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
