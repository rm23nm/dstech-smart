"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FileSignature,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  UserCheck,
  Building2,
  Phone,
  Mail,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Calculator,
  Edit3,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Briefcase,
  Wrench,
  Sparkles,
  Lock,
  Layers,
  ArrowUpRight,
  Info,
  KeyRound,
  X
} from "lucide-react";

export interface DstechContract {
  id: string;
  contractNumber: string;
  employeeName: string;
  employeeNik?: string;
  employeePhone?: string;
  employeeEmail?: string;
  employeeAddress?: string;
  position: string;
  employeeCategory: "STAFF" | "TECHNICIAN";
  contractType: "DAILY" | "MONTHLY" | "YEARLY";
  startDate: string;
  endDate: string;
  durationMonths: number;
  salaryScheme: {
    staffScheme?: {
      baseSalary: number;
      positionAllowance?: number;
      transportAllowance?: number;
      bpjsAllowance?: number;
      notes?: string;
    };
    dailyScheme?: {
      dailyRateType: "TYPE_1_FULL_DAY" | "TYPE_2_HOURLY";
      dailyRate?: number;
      overtimeHourlyRate?: number;
      hourlyRate?: number;
      normalHoursPerDay?: number;
      overtimeMultiplierHour1?: number;
      overtimeMultiplierHour2Plus?: number;
      weekendMultiplier?: number;
      description?: string;
    };
  };
  workLocation: string;
  status: "ACTIVE" | "EXPIRED" | "TERMINATED" | "DRAFT";
  signedByFirstParty: {
    name: string;
    title: string;
    company: string;
    signedAt?: string;
  };
  signedBySecondParty: {
    name: string;
    title: string;
    signedAt?: string;
  };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfficialPositionPreset {
  id: string;
  label: string;
  positionName: string;
  category: "STAFF" | "TECHNICIAN";
  payrollScheme: "DAILY" | "MONTHLY";
  contractType: "DAILY" | "MONTHLY" | "YEARLY";
  dailyRate?: number;
  overtimeHourlyRate?: number;
  baseSalary?: number;
  positionAllowance?: number;
  transportAllowance?: number;
  bpjsAllowance?: number;
  notes?: string;
}

export const OFFICIAL_POSITION_PRESETS: OfficialPositionPreset[] = [
  {
    id: "helper",
    label: "👷‍♂️ Helper / Asisten Teknisi (Rp 150.000 / hari)",
    positionName: "Helper / Asisten Teknisi Lapangan",
    category: "TECHNICIAN",
    payrollScheme: "DAILY",
    contractType: "DAILY",
    dailyRate: 150000,
    overtimeHourlyRate: 25000,
    notes: "Upah harian Helper Rp 150.000/hari kerja & lembur Rp 25.000/jam",
  },
  {
    id: "skill",
    label: "⚡ Teknisi Skill / Ahli Lapangan (Rp 175.000 / hari)",
    positionName: "Teknisi Skill Instalasi & Integrasi",
    category: "TECHNICIAN",
    payrollScheme: "DAILY",
    contractType: "DAILY",
    dailyRate: 175000,
    overtimeHourlyRate: 30000,
    notes: "Upah harian Teknisi Skill Rp 175.000/hari kerja & lembur Rp 30.000/jam",
  },
  {
    id: "senior",
    label: "🎯 Teknisi Senior / Specialist (Rp 200.000 / hari)",
    positionName: "Teknisi Senior / Specialist CCTV & Smart Home",
    category: "TECHNICIAN",
    payrollScheme: "DAILY",
    contractType: "DAILY",
    dailyRate: 200000,
    overtimeHourlyRate: 35000,
    notes: "Upah harian Teknisi Senior Rp 200.000/hari kerja & lembur Rp 35.000/jam",
  },
  {
    id: "foreman",
    label: "👑 Lead / Foreman Lapangan (Rp 225.000 / hari)",
    positionName: "Lead / Foreman Lapangan",
    category: "TECHNICIAN",
    payrollScheme: "DAILY",
    contractType: "DAILY",
    dailyRate: 225000,
    overtimeHourlyRate: 40000,
    notes: "Upah harian Lead/Foreman Rp 225.000/hari kerja & lembur Rp 40.000/jam",
  },
  {
    id: "staff_admin",
    label: "💼 Staf Administrasi & Keuangan (Gaji Bulanan)",
    positionName: "Staf Administrasi & Keuangan",
    category: "STAFF",
    payrollScheme: "MONTHLY",
    contractType: "YEARLY",
    baseSalary: 4200000,
    positionAllowance: 500000,
    transportAllowance: 400000,
    bpjsAllowance: 150000,
    notes: "Gaji bulanan tetap staf kantor (tidak dikalikan harian)",
  },
  {
    id: "staff_it",
    label: "💻 Staf IT Support & Networking (Gaji Bulanan)",
    positionName: "Staf IT Support & Networking",
    category: "STAFF",
    payrollScheme: "MONTHLY",
    contractType: "YEARLY",
    baseSalary: 4500000,
    positionAllowance: 500000,
    transportAllowance: 400000,
    bpjsAllowance: 150000,
    notes: "Gaji bulanan staf IT tetap",
  },
  {
    id: "staff_spv",
    label: "🏢 Supervisor / Koordinator Operasional (Gaji Bulanan)",
    positionName: "Supervisor / Koordinator Operasional",
    category: "STAFF",
    payrollScheme: "MONTHLY",
    contractType: "YEARLY",
    baseSalary: 5500000,
    positionAllowance: 750000,
    transportAllowance: 500000,
    bpjsAllowance: 150000,
    notes: "Gaji bulanan manajerial/supervisor",
  },
  {
    id: "custom",
    label: "✍️ Posisi Kustom (Input Manual Bebas)",
    positionName: "",
    category: "TECHNICIAN",
    payrollScheme: "DAILY",
    contractType: "DAILY",
    dailyRate: 175000,
    overtimeHourlyRate: 30000,
    baseSalary: 4000000,
    positionAllowance: 500000,
    transportAllowance: 400000,
    bpjsAllowance: 150000,
    notes: "Posisi kustom",
  },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<DstechContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"ALL" | "STAFF" | "TECHNICIAN">("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "DAILY_1" | "DAILY_2" | "MONTHLY" | "YEARLY">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "EXPIRING" | "EXPIRED">("ALL");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<DstechContract | null>(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    id: "",
    contractNumber: "",
    employeeName: "",
    employeeNik: "",
    employeePhone: "",
    employeeEmail: "",
    employeeAddress: "",
    selectedRolePresetId: "skill",
    position: "Teknisi Skill Instalasi & Integrasi",
    payrollSchemeType: "DAILY" as "DAILY" | "MONTHLY",
    employeeCategory: "TECHNICIAN" as "STAFF" | "TECHNICIAN",
    contractType: "DAILY" as "DAILY" | "MONTHLY" | "YEARLY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    durationMonths: 3,
    workLocation: "Kantor & Proyek Lapangan (Sesuai SPK)",
    status: "ACTIVE" as "ACTIVE" | "EXPIRED" | "TERMINATED" | "DRAFT",
    // Staff Scheme
    baseSalary: 4000000,
    positionAllowance: 500000,
    transportAllowance: 400000,
    bpjsAllowance: 150000,
    // Technician Daily Scheme
    dailyRateType: "TYPE_1_FULL_DAY" as "TYPE_1_FULL_DAY" | "TYPE_2_HOURLY",
    dailyRate: 175000,
    overtimeHourlyRate: 30000,
    hourlyRate: 30000,
    normalHoursPerDay: 8,
    overtimeMultiplierHour1: 1.5,
    overtimeMultiplierHour2Plus: 2.0,
    weekendMultiplier: 2.0,
    // First & Second Party
    directorName: "RAMADHANI, ST",
    directorTitle: "Direktur Utama",
    notes: "",
    // User Account Sync
    createLoginAccount: true,
    loginPassword: "",
  });

  // Extend Modal Form State
  const [extendData, setExtendData] = useState({
    contractId: "",
    newEndDate: "",
    additionalMonths: 3,
    notes: "Perpanjangan masa kerja kontrak teknisi",
  });

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch contracts
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contracts");
      const json = await res.json();
      if (json.success && Array.isArray(json.contracts)) {
        setContracts(json.contracts);
      }
    } catch (err) {
      console.error("Gagal mengambil data kontrak:", err);
      showToast("Gagal memuat data kontrak kerja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Helper sisa hari kalender dinormalisasi ke midnight (00:00:00) agar akurat
  const getDaysRemaining = (endDateStr: string) => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const endParts = endDateStr.split("-").map(Number);
      const end = new Date(endParts[0], endParts[1] - 1, endParts[2]).getTime();
      return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Helper detail status sisa waktu kontrak kerja (format ramah pengguna)
  const getContractTimeInfo = (startDateStr: string, endDateStr: string) => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const endParts = endDateStr.split("-").map(Number);
      const end = new Date(endParts[0], endParts[1] - 1, endParts[2]).getTime();
      const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return {
          daysRemaining: diffDays,
          isExpired: true,
          isExpiringSoon: false,
          badgeText: "Kedaluwarsa",
          badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
          descText: `Masa kontrak telah berakhir (${endDateStr})`,
        };
      }

      const months = Math.floor(diffDays / 30);
      const extraDays = diffDays % 30;
      let durationRemaining = "";
      if (months > 0) {
        durationRemaining = `${months} Bulan${extraDays > 0 ? ` ${extraDays} Hari` : ""}`;
      } else {
        durationRemaining = `${diffDays} Hari`;
      }

      if (diffDays <= 30) {
        return {
          daysRemaining: diffDays,
          isExpired: false,
          isExpiringSoon: true,
          badgeText: `Segera Berakhir • Sisa ${diffDays} Hari`,
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
          descText: `Sisa ${diffDays} hari lagi s/d ${endDateStr}`,
        };
      }

      return {
        daysRemaining: diffDays,
        isExpired: false,
        isExpiringSoon: false,
        badgeText: `Aktif • Sisa ${durationRemaining}`,
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        descText: `Sisa ${diffDays} hari lagi s/d ${endDateStr}`,
      };
    } catch {
      return {
        daysRemaining: 0,
        isExpired: true,
        isExpiringSoon: false,
        badgeText: "Status Tidak Diketahui",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
        descText: "-",
      };
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((c) => c.status === "ACTIVE").length;
    const staff = contracts.filter((c) => c.employeeCategory === "STAFF").length;
    const techType1 = contracts.filter(
      (c) =>
        c.employeeCategory === "TECHNICIAN" &&
        c.salaryScheme?.dailyScheme?.dailyRateType === "TYPE_1_FULL_DAY"
    ).length;
    const techType2 = contracts.filter(
      (c) =>
        c.employeeCategory === "TECHNICIAN" &&
        c.salaryScheme?.dailyScheme?.dailyRateType === "TYPE_2_HOURLY"
    ).length;
    const expiringSoon = contracts.filter((c) => {
      const days = getDaysRemaining(c.endDate);
      return c.status === "ACTIVE" && days > 0 && days <= 30;
    }).length;

    return { total, active, staff, techType1, techType2, expiringSoon };
  }, [contracts]);

  // Filtered List
  const filteredContracts = useMemo(() => {
    return contracts.filter((item) => {
      // Category filter
      if (filterCategory !== "ALL" && item.employeeCategory !== filterCategory) {
        return false;
      }
      // Type filter
      if (filterType === "DAILY_1") {
        if (item.salaryScheme?.dailyScheme?.dailyRateType !== "TYPE_1_FULL_DAY") return false;
      } else if (filterType === "DAILY_2") {
        if (item.salaryScheme?.dailyScheme?.dailyRateType !== "TYPE_2_HOURLY") return false;
      } else if (filterType === "MONTHLY") {
        if (item.contractType !== "MONTHLY") return false;
      } else if (filterType === "YEARLY") {
        if (item.contractType !== "YEARLY") return false;
      }
      // Status filter
      const days = getDaysRemaining(item.endDate);
      if (filterStatus === "ACTIVE" && item.status !== "ACTIVE") return false;
      if (filterStatus === "EXPIRING") {
        if (item.status !== "ACTIVE" || days <= 0 || days > 30) return false;
      }
      if (filterStatus === "EXPIRED") {
        if (days > 0 && item.status === "ACTIVE") return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.employeeName?.toLowerCase().includes(q);
        const matchNum = item.contractNumber?.toLowerCase().includes(q);
        const matchPos = item.position?.toLowerCase().includes(q);
        const matchNik = item.employeeNik?.toLowerCase().includes(q);
        if (!matchName && !matchNum && !matchPos && !matchNik) return false;
      }
      return true;
    });
  }, [contracts, filterCategory, filterType, filterStatus, searchQuery]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    setFormData({
      id: "",
      contractNumber: "",
      employeeName: "",
      employeeNik: "",
      employeePhone: "",
      employeeEmail: "",
      employeeAddress: "",
      selectedRolePresetId: "skill",
      position: "Teknisi Skill Instalasi & Integrasi",
      payrollSchemeType: "DAILY",
      employeeCategory: "TECHNICIAN",
      contractType: "DAILY",
      startDate: today.toISOString().split("T")[0],
      endDate: threeMonthsLater.toISOString().split("T")[0],
      durationMonths: 3,
      workLocation: "Kantor & Proyek Lapangan (Sesuai SPK)",
      status: "ACTIVE",
      baseSalary: 4000000,
      positionAllowance: 500000,
      transportAllowance: 400000,
      bpjsAllowance: 150000,
      dailyRateType: "TYPE_1_FULL_DAY",
      dailyRate: 175000,
      overtimeHourlyRate: 30000,
      hourlyRate: 30000,
      normalHoursPerDay: 8,
      overtimeMultiplierHour1: 1.5,
      overtimeMultiplierHour2Plus: 2.0,
      weekendMultiplier: 2.0,
      directorName: "RAMADHANI, ST",
      directorTitle: "Direktur Utama",
      notes: "Kontrak kerja baru teknisi lapangan sistem harian (Teknisi Skill Rp 175.000/hari).",
      createLoginAccount: true,
      loginPassword: "",
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: DstechContract) => {
    const daily = item.salaryScheme?.dailyScheme;
    const staff = item.salaryScheme?.staffScheme;
    const isDaily = !!daily || item.employeeCategory === "TECHNICIAN" && item.contractType === "DAILY";

    // Detect preset id
    let matchedPreset = "custom";
    const posLower = (item.position || "").toLowerCase();
    if (posLower.includes("helper")) matchedPreset = "helper";
    else if (posLower.includes("skill") || posLower.includes("instalasi")) matchedPreset = "skill";
    else if (posLower.includes("senior") || posLower.includes("spesialis")) matchedPreset = "senior";
    else if (posLower.includes("foreman") || posLower.includes("lead")) matchedPreset = "foreman";
    else if (posLower.includes("administrasi") || posLower.includes("keuangan")) matchedPreset = "staff_admin";
    else if (posLower.includes("it") || posLower.includes("network")) matchedPreset = "staff_it";

    setFormData({
      id: item.id,
      contractNumber: item.contractNumber,
      employeeName: item.employeeName,
      employeeNik: item.employeeNik || "",
      employeePhone: item.employeePhone || "",
      employeeEmail: item.employeeEmail || "",
      employeeAddress: item.employeeAddress || "",
      selectedRolePresetId: matchedPreset,
      position: item.position,
      payrollSchemeType: isDaily ? "DAILY" : "MONTHLY",
      employeeCategory: item.employeeCategory,
      contractType: item.contractType,
      startDate: item.startDate,
      endDate: item.endDate,
      durationMonths: item.durationMonths,
      workLocation: item.workLocation,
      status: item.status,
      baseSalary: staff?.baseSalary || 4200000,
      positionAllowance: staff?.positionAllowance || 500000,
      transportAllowance: staff?.transportAllowance || 400000,
      bpjsAllowance: staff?.bpjsAllowance || 150000,
      dailyRateType: daily?.dailyRateType || "TYPE_1_FULL_DAY",
      dailyRate: daily?.dailyRate || 175000,
      overtimeHourlyRate: daily?.overtimeHourlyRate || 30000,
      hourlyRate: daily?.hourlyRate || 30000,
      normalHoursPerDay: daily?.normalHoursPerDay || 8,
      overtimeMultiplierHour1: daily?.overtimeMultiplierHour1 || 1.5,
      overtimeMultiplierHour2Plus: daily?.overtimeMultiplierHour2Plus || 2.0,
      weekendMultiplier: daily?.weekendMultiplier || 2.0,
      directorName: item.signedByFirstParty?.name || "RAMADHANI, ST",
      directorTitle: item.signedByFirstParty?.title || "Direktur Utama",
      notes: item.notes || "",
      createLoginAccount: false,
      loginPassword: "",
    });
    setIsEditModalOpen(true);
  };

  // Open Extend Modal
  const handleOpenExtendModal = (item: DstechContract) => {
    const currentEnd = new Date(item.endDate);
    const newEnd = new Date(currentEnd);
    newEnd.setMonth(newEnd.getMonth() + 3);

    setExtendData({
      contractId: item.id,
      newEndDate: newEnd.toISOString().split("T")[0],
      additionalMonths: 3,
      notes: `Perpanjangan masa kerja kontrak teknisi ${item.employeeName} selama 3 bulan`,
    });
    setSelectedContract(item);
    setIsExtendModalOpen(true);
  };

  // Handle Save Contract (Create / Update)
  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeName || !formData.position || !formData.startDate || !formData.endDate) {
      alert("Mohon lengkapi nama karyawan, jabatan, tanggal mulai dan berakhir kontrak!");
      return;
    }

    try {
      setSaving(true);
      const isEdit = !!formData.id;

      // Build Salary Scheme based on Explicit Payroll Scheme Type
      let salaryScheme: any = {};
      if (formData.payrollSchemeType === "MONTHLY") {
        salaryScheme.staffScheme = {
          baseSalary: Number(formData.baseSalary || 0),
          positionAllowance: Number(formData.positionAllowance || 0),
          transportAllowance: Number(formData.transportAllowance || 0),
          bpjsAllowance: Number(formData.bpjsAllowance || 0),
          notes: "Gaji bulanan tetap staf / karyawan (tidak dikalikan hari hadir di auto-payroll)",
        };
      } else {
        // DAILY RATE
        salaryScheme.dailyScheme = {
          dailyRateType: formData.dailyRateType,
          dailyRate: Number(formData.dailyRate || 0),
          overtimeHourlyRate: Number(formData.overtimeHourlyRate || 0),
          hourlyRate: Number(formData.hourlyRate || 0),
          normalHoursPerDay: Number(formData.normalHoursPerDay || 8),
          overtimeMultiplierHour1: Number(formData.overtimeMultiplierHour1 || 1.5),
          overtimeMultiplierHour2Plus: Number(formData.overtimeMultiplierHour2Plus || 2.0),
          weekendMultiplier: Number(formData.weekendMultiplier || 2.0),
          description:
            formData.dailyRateType === "TYPE_1_FULL_DAY"
              ? `Tipe 1: Harian dibayar penuh Rp ${(formData.dailyRate || 0).toLocaleString("id-ID")}/hari kerja.`
              : `Tipe 2: Bayaran per jam Rp ${(formData.hourlyRate || 0).toLocaleString("id-ID")}/jam dengan pengali lembur 1.5x dan 2.0x.`,
        };
      }

      const payload = {
        id: formData.id,
        contractNumber: formData.contractNumber,
        employeeName: formData.employeeName,
        employeeNik: formData.employeeNik,
        employeePhone: formData.employeePhone,
        employeeEmail: formData.employeeEmail,
        employeeAddress: formData.employeeAddress,
        position: formData.position,
        employeeCategory: formData.employeeCategory,
        contractType: formData.contractType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        durationMonths: Number(formData.durationMonths || 1),
        salaryScheme,
        workLocation: formData.workLocation,
        status: formData.status,
        signedByFirstParty: {
          name: formData.directorName,
          title: formData.directorTitle,
          company: "PT. DSTech Smart Perkasa",
          signedAt: new Date().toISOString(),
        },
        signedBySecondParty: {
          name: formData.employeeName,
          title: formData.position,
          signedAt: new Date().toISOString(),
        },
        notes: formData.notes,
        createLoginAccount: formData.createLoginAccount,
        loginPassword: formData.loginPassword,
      };

      const res = await fetch("/api/contracts", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Gagal menyimpan kontrak");

      showToast(isEdit ? "Kontrak kerja berhasil diperbarui!" : "Kontrak kerja baru berhasil dibuat!");
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      fetchContracts();
    } catch (err: any) {
      console.error("Gagal simpan kontrak:", err);
      alert(err.message || "Terjadi kesalahan saat menyimpan data kontrak!");
    } finally {
      setSaving(false);
    }
  };

  // Handle Extend Contract Submit
  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract || !extendData.newEndDate) return;

    try {
      setSaving(true);
      const res = await fetch("/api/contracts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedContract.id,
          endDate: extendData.newEndDate,
          durationMonths: selectedContract.durationMonths + Number(extendData.additionalMonths || 0),
          status: "ACTIVE",
          notes: `${selectedContract.notes || ""}\n[Perpanjangan]: Diperpanjang s/d ${extendData.newEndDate}. ${extendData.notes}`,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Gagal memperpanjang kontrak");

      showToast("Masa berlaku kontrak berhasil diperpanjang!");
      setIsExtendModalOpen(false);
      fetchContracts();
    } catch (err: any) {
      alert(err.message || "Gagal memperpanjang kontrak kerja!");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Contract
  const handleDeleteContract = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus arsip kontrak kerja karyawan "${name}"? Data yang dihapus tidak dapat dipulihkan.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/contracts?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Gagal menghapus kontrak");

      showToast("Kontrak kerja berhasil dihapus");
      fetchContracts();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus kontrak");
    }
  };

  // Handle Print PDF
  const handlePrintPKWT = () => {
    window.print();
  };

  // Handle Download PDF via html2pdf
  const handleDownloadPDF = async () => {
    const element = document.getElementById("pkwt-print-sheet");
    if (!element) return;

    try {
      // Dynamic load html2pdf if not present
      if (!(window as any).html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Gagal memuat pustaka html2pdf CDN"));
          document.body.appendChild(script);
        });
      }

      const opt = {
        margin: [8, 8, 8, 8],
        filename: `PKWT_${selectedContract?.contractNumber?.replace(/\//g, "-") || "DSTECH"}_${selectedContract?.employeeName?.replace(/\s+/g, "_") || "KARYAWAN"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await (window as any).html2pdf().set(opt).from(element).save();
      showToast("File PDF Surat Kontrak PKWT berhasil diunduh!");
    } catch (err) {
      console.warn("Gagal ekspor langsung html2pdf, membuka dialog cetak browser:", err);
      window.print();
    }
  };

  // Download CSV Recap
  const handleDownloadCSV = () => {
    if (contracts.length === 0) {
      alert("Tidak ada data kontrak untuk diunduh!");
      return;
    }

    const headers = [
      "No. Kontrak",
      "Nama Karyawan",
      "NIK",
      "No. HP",
      "Email",
      "Kategori",
      "Jabatan",
      "Tipe Kontrak",
      "Skema Upah",
      "Nominal Upah/Gaji",
      "Tanggal Mulai",
      "Tanggal Berakhir",
      "Durasi (Bulan)",
      "Status",
    ];

    const rows = contracts.map((c) => {
      let schemeLabel = "";
      let amountLabel = "";
      if (c.employeeCategory === "STAFF" || c.contractType === "MONTHLY" || c.contractType === "YEARLY") {
        schemeLabel = "Gaji Bulanan Staf";
        amountLabel = `Rp ${(c.salaryScheme?.staffScheme?.baseSalary || 0).toLocaleString("id-ID")}`;
      } else if (c.salaryScheme?.dailyScheme?.dailyRateType === "TYPE_1_FULL_DAY") {
        schemeLabel = "Harian Penuh (Tipe 1)";
        amountLabel = `Rp ${(c.salaryScheme?.dailyScheme?.dailyRate || 0).toLocaleString("id-ID")} / hari`;
      } else {
        schemeLabel = "Per Jam + Lembur (Tipe 2)";
        amountLabel = `Rp ${(c.salaryScheme?.dailyScheme?.hourlyRate || 0).toLocaleString("id-ID")} / jam`;
      }

      return [
        `"${c.contractNumber}"`,
        `"${c.employeeName}"`,
        `"${c.employeeNik || "-"}"`,
        `"${c.employeePhone || "-"}"`,
        `"${c.employeeEmail || "-"}"`,
        `"${c.employeeCategory}"`,
        `"${c.position}"`,
        `"${c.contractType}"`,
        `"${schemeLabel}"`,
        `"${amountLabel}"`,
        `"${c.startDate}"`,
        `"${c.endDate}"`,
        `"${c.durationMonths}"`,
        `"${c.status}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Kontrak_Kerja_DSTech_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-dstech-blue rounded-2xl border border-blue-100/80 shadow-xs">
              <FileSignature className="w-6 h-6 text-dstech-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Kontrak Kerja & Perekrutan Karyawan
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                  PKWT Legal
                </span>
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Manajemen rekrutmen staf tetap/kontrak (bulanan & tahunan) dan teknisi lapangan (harian Tipe 1 & Tipe 2).
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" /> Unduh Rekap CSV
          </button>

          <button
            onClick={fetchContracts}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-xs"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-dstech-blue hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> + Rekrut Karyawan / Buat Kontrak
          </button>
        </div>

        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Kontrak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Kontrak</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">Arsip PKWT terbit</span>
        </div>

        {/* Kontrak Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Aktif Bekerja</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{stats.active}</p>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">Sedang aktif berjalan</span>
        </div>

        {/* Staf Kantor */}
        <div className="bg-white p-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/20 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Staf Kantor</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-700">{stats.staff}</p>
          <span className="text-[11px] font-semibold text-blue-600 mt-1 block">Bulanan & Tahunan</span>
        </div>

        {/* Teknisi Tipe 1 */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Teknisi Tipe 1</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-700">{stats.techType1}</p>
          <span className="text-[11px] font-semibold text-amber-600 mt-1 block">Harian Dibayar Penuh</span>
        </div>

        {/* Teknisi Tipe 2 */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/20 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Teknisi Tipe 2</span>
            <Calculator className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-700">{stats.techType2}</p>
          <span className="text-[11px] font-semibold text-indigo-600 mt-1 block">Upah Jam + Lembur</span>
        </div>

        {/* Mendekati Habis */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Segera Habis</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-700">{stats.expiringSoon}</p>
          <span className="text-[11px] font-semibold text-rose-600 mt-1 block">Masa &le; 30 Hari</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NIK, jabatan, atau nomor kontrak..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Kategori:</span>
            {[
              { id: "ALL", label: "Semua Kategori" },
              { id: "STAFF", label: "Staf Kantor" },
              { id: "TECHNICIAN", label: "Teknisi Lapangan" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterCategory === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Type Chips */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Tipe Skema:</span>
            {[
              { id: "ALL", label: "Semua Tipe" },
              { id: "DAILY_1", label: "Tipe 1: Harian Penuh" },
              { id: "DAILY_2", label: "Tipe 2: Jam + Lembur" },
              { id: "MONTHLY", label: "Bulanan" },
              { id: "YEARLY", label: "Tahunan" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Sub-bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-400">Filter Status:</span>
          {[
            { id: "ALL", label: "Semua Status" },
            { id: "ACTIVE", label: "🟢 Aktif Bekerja" },
            { id: "EXPIRING", label: "🟡 Segera Berakhir (<= 30 Hari)" },
            { id: "EXPIRED", label: "🔴 Kedaluwarsa / Selesai" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id as any)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                filterStatus === st.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-5">Nomor Kontrak & Karyawan</th>
                <th className="py-4 px-4">Kategori & Jabatan</th>
                <th className="py-4 px-4">Skema Pembayaran</th>
                <th className="py-4 px-4">Masa Berlaku</th>
                <th className="py-4 px-4">Status & Sisa Waktu</th>
                <th className="py-4 px-5 text-right">Aksi & Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Memuat data kontrak kerja...
                  </td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileSignature className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Tidak ada kontrak kerja yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((item) => {
                  const days = getDaysRemaining(item.endDate);
                  const isExpiring = item.status === "ACTIVE" && days > 0 && days <= 30;
                  const isExpired = days <= 0 || item.status === "EXPIRED";
                  const timeInfo = getContractTimeInfo(item.startDate, item.endDate);

                  const daily = item.salaryScheme?.dailyScheme;
                  const staff = item.salaryScheme?.staffScheme;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Nomor & Karyawan */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 inline-block">
                            {item.contractNumber}
                          </span>
                          <p className="text-sm font-bold text-slate-900">{item.employeeName}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            {item.employeeNik && <span>NIK: {item.employeeNik}</span>}
                            {item.employeePhone && <span>WA: {item.employeePhone}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Kategori & Jabatan */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {item.employeeCategory === "STAFF" ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 uppercase flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> Staf Kantor
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 uppercase flex items-center gap-1">
                                <Wrench className="w-3 h-3" /> Teknisi Lapangan
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.contractType}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800">{item.position}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{item.workLocation}</p>
                        </div>
                      </td>

                      {/* Skema Pembayaran */}
                      <td className="py-4 px-4">
                        {item.employeeCategory === "STAFF" || item.contractType === "MONTHLY" || item.contractType === "YEARLY" ? (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gaji Pokok Bulanan</span>
                            <p className="text-sm font-black text-slate-900">
                              Rp {(staff?.baseSalary || 0).toLocaleString("id-ID")}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Tunjangan: Rp {((staff?.positionAllowance || 0) + (staff?.transportAllowance || 0)).toLocaleString("id-ID")}
                            </p>
                          </div>
                        ) : daily?.dailyRateType === "TYPE_1_FULL_DAY" ? (
                          <div className="space-y-1 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/80">
                            <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-black text-[9px] uppercase">
                              Tipe 1: Harian Penuh
                            </span>
                            <p className="text-sm font-black text-amber-900">
                              Rp {(daily?.dailyRate || 0).toLocaleString("id-ID")}{" "}
                              <span className="text-[10px] font-normal text-amber-700">/ hari</span>
                            </p>
                            <p className="text-[10px] text-amber-700">
                              Lembur: Rp {(daily?.overtimeHourlyRate || 0).toLocaleString("id-ID")}/jam
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100/80">
                            <span className="px-1.5 py-0.5 bg-indigo-200 text-indigo-900 rounded font-black text-[9px] uppercase">
                              Tipe 2: Per Jam + Pengali
                            </span>
                            <p className="text-sm font-black text-indigo-900">
                              Rp {(daily?.hourlyRate || 0).toLocaleString("id-ID")}{" "}
                              <span className="text-[10px] font-normal text-indigo-700">/ jam</span>
                            </p>
                            <p className="text-[10px] text-indigo-700">
                              Lembur: {daily?.overtimeMultiplierHour1 || 1.5}x (jam 1) & {daily?.overtimeMultiplierHour2Plus || 2.0}x (jam 2+)
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Masa Berlaku */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-800">
                            {item.startDate} s/d {item.endDate}
                          </p>
                          <span className="text-[11px] text-slate-400 block">
                            Durasi: <strong className="text-slate-700">{item.durationMonths} Bulan</strong>
                          </span>
                        </div>
                      </td>

                      {/* Status & Sisa Waktu */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {timeInfo.isExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 uppercase flex items-center gap-1 w-fit shadow-xs">
                              <AlertCircle className="w-3 h-3" /> Kedaluwarsa
                            </span>
                          ) : timeInfo.isExpiringSoon ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase flex items-center gap-1 w-fit shadow-xs">
                              <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> {timeInfo.badgeText}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase flex items-center gap-1 w-fit shadow-xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {timeInfo.badgeText}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {timeInfo.descText}
                          </span>
                        </div>
                      </td>

                      {/* Aksi & Dokumen */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Cetak PKWT */}
                          <button
                            onClick={() => {
                              setSelectedContract(item);
                              setIsPrintModalOpen(true);
                            }}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                            title="Cetak & Pratinjau PKWT Resmi A4"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Perpanjang Kontrak */}
                          <button
                            onClick={() => handleOpenExtendModal(item)}
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                            title="Perpanjang Masa Kontrak"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Edit Kontrak */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                            title="Edit Data Kontrak"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Hapus Kontrak */}
                          <button
                            onClick={() => handleDeleteContract(item.id, item.employeeName)}
                            className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all"
                            title="Hapus Kontrak"
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

      {/* MODAL 1: BUAT / EDIT KONTRAK KERJA */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {formData.id ? "Edit Kontrak Kerja Karyawan" : "Perekrutan & Kontrak Kerja Baru"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Lengkapi data tenaga kerja, kategori staf/teknisi, dan skema pembayaran resmi PT. DSTech Smart Perkasa.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="space-y-6">
              {/* BAGIAN 1: IDENTITAS KARYAWAN */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-500" /> 1. Data Pribadi Karyawan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nama Lengkap Karyawan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.employeeName}
                      onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                      placeholder="Contoh: Hendra Wijaya"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nomor Induk Kependudukan (NIK KTP)
                    </label>
                    <input
                      type="text"
                      value={formData.employeeNik}
                      onChange={(e) => setFormData({ ...formData, employeeNik: e.target.value })}
                      placeholder="16 Digit NIK KTP Karyawan"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      No. WhatsApp / Telepon Aktif
                    </label>
                    <input
                      type="text"
                      value={formData.employeePhone}
                      onChange={(e) => setFormData({ ...formData, employeePhone: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Karyawan (Untuk Akun & Presensi)
                    </label>
                    <input
                      type="email"
                      value={formData.employeeEmail}
                      onChange={(e) => setFormData({ ...formData, employeeEmail: e.target.value })}
                      placeholder="nama@dstechsmart.com atau email aktif"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Alamat Domisili Karyawan
                  </label>
                  <input
                    type="text"
                    value={formData.employeeAddress}
                    onChange={(e) => setFormData({ ...formData, employeeAddress: e.target.value })}
                    placeholder="Alamat lengkap sesuai KTP / tempat tinggal sekarang"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>

              {/* BAGIAN 2: PENEMPATAN, STATUS PENGGAJIAN & JABATAN */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-500" /> 2. Status Penggajian & Jabatan Karyawan
                  </h3>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    Standar Penggajian DSTech
                  </span>
                </div>

                {/* 1. Pemilih Status Sistem Penggajian (Harian vs Bulanan) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Tentukan Sistem Status Penggajian <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => {
                        setFormData({
                          ...formData,
                          payrollSchemeType: "DAILY",
                          employeeCategory: "TECHNICIAN",
                          contractType: "DAILY",
                          dailyRate: formData.dailyRate || 175000,
                          overtimeHourlyRate: formData.overtimeHourlyRate || 30000,
                        });
                      }}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.payrollSchemeType === "DAILY"
                          ? "border-amber-500 bg-amber-50/70 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          🟢 Sistem Gaji Harian (Daily Rate)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          Helper / Teknisi Skill
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Upah dihitung dari kehadiran riil dikalikan tarif harian posisi (Helper 150rb, Skill 175rb, Senior 200rb).
                      </p>
                    </div>

                    <div
                      onClick={() => {
                        setFormData({
                          ...formData,
                          payrollSchemeType: "MONTHLY",
                          employeeCategory: "STAFF",
                          contractType: "YEARLY",
                          baseSalary: formData.baseSalary || 4200000,
                          positionAllowance: formData.positionAllowance || 500000,
                          transportAllowance: formData.transportAllowance || 400000,
                          bpjsAllowance: formData.bpjsAllowance || 150000,
                        });
                      }}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.payrollSchemeType === "MONTHLY"
                          ? "border-blue-500 bg-blue-50/70 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                          🔵 Sistem Gaji Bulanan (Monthly Salary)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
                          Staf Kantor / Tetap
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Gaji pokok tetap per bulan sesuai kontrak (tidak dikalikan hari hadir di auto-payroll).
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Pilihan Jabatan Resmi & Tarif Standar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Pilihan Jabatan & Standar Tarif Resmi <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.selectedRolePresetId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        const preset = OFFICIAL_POSITION_PRESETS.find((p) => p.id === pid);
                        if (preset) {
                          setFormData({
                            ...formData,
                            selectedRolePresetId: pid,
                            position: preset.positionName || formData.position,
                            payrollSchemeType: preset.payrollScheme,
                            employeeCategory: preset.category,
                            contractType: preset.contractType,
                            dailyRate: preset.dailyRate ?? formData.dailyRate,
                            overtimeHourlyRate: preset.overtimeHourlyRate ?? formData.overtimeHourlyRate,
                            baseSalary: preset.baseSalary ?? formData.baseSalary,
                            positionAllowance: preset.positionAllowance ?? formData.positionAllowance,
                            transportAllowance: preset.transportAllowance ?? formData.transportAllowance,
                            bpjsAllowance: preset.bpjsAllowance ?? formData.bpjsAllowance,
                          });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                    >
                      {OFFICIAL_POSITION_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Memilih jabatan otomatis mengisi nama posisi, kategori, dan nominal tarif acuan.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nama Jabatan / Posisi Kerja Spesifik <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Contoh: Helper / Asisten Teknisi CCTV"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Dapat disesuaikan jika ada spesialisasi khusus pada penugasan proyek.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Kategori Divisi
                    </label>
                    <select
                      value={formData.employeeCategory}
                      onChange={(e) => {
                        const cat = e.target.value as "STAFF" | "TECHNICIAN";
                        setFormData({
                          ...formData,
                          employeeCategory: cat,
                          contractType: cat === "STAFF" ? "YEARLY" : "DAILY",
                          payrollSchemeType: cat === "STAFF" ? "MONTHLY" : "DAILY",
                        });
                      }}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      <option value="TECHNICIAN">Teknisi Lapangan (CCTV, Smart Home, FO)</option>
                      <option value="STAFF">Staf Kantor (Administrasi, Finance, IT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tipe Durasi Kontrak <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.contractType}
                      onChange={(e) => setFormData({ ...formData, contractType: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      {formData.payrollSchemeType === "MONTHLY" ? (
                        <>
                          <option value="MONTHLY">Bulanan (Monthly Contract)</option>
                          <option value="YEARLY">Tahunan (Yearly Contract)</option>
                        </>
                      ) : (
                        <>
                          <option value="DAILY">Harian Proyek (Daily Rate)</option>
                          <option value="MONTHLY">Bulanan Teknisi (Monthly)</option>
                          <option value="YEARLY">Tahunan Senior (Yearly)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Durasi Kontrak (Bulan)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.durationMonths}
                      onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tanggal Mulai Kontrak
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tanggal Berakhir Kontrak
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Lokasi Penempatan Kerja
                  </label>
                  <input
                    type="text"
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    placeholder="Contoh: Kantor Utama Cilegon / Fleksibel Proyek Lapangan (Sesuai SPK)"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* BAGIAN 3: SKEMA PEMBAYARAN & UPAH */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> 3. Rincian Skema Upah & Kompensasi
                </h3>

                {/* JIKA SISTEM GAJI BULANAN */}
                {formData.payrollSchemeType === "MONTHLY" ? (
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-900 uppercase tracking-wider block">
                        Rincian Gaji Bulanan Tetap (Staf Kantor)
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                        Gaji Pokok Tetap Per Bulan
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Gaji Pokok (Rp/Bulan)</label>
                        <input
                          type="number"
                          value={formData.baseSalary}
                          onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-blue-300 rounded-xl font-bold text-blue-950"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Tunjangan Jabatan (Rp)</label>
                        <input
                          type="number"
                          value={formData.positionAllowance}
                          onChange={(e) => setFormData({ ...formData, positionAllowance: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Tunjangan Transport (Rp)</label>
                        <input
                          type="number"
                          value={formData.transportAllowance}
                          onChange={(e) => setFormData({ ...formData, transportAllowance: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Potongan BPJS (Rp)</label>
                        <input
                          type="number"
                          value={formData.bpjsAllowance}
                          onChange={(e) => setFormData({ ...formData, bpjsAllowance: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-blue-800 bg-white/80 p-2.5 rounded-xl border border-blue-100">
                      💡 Catatan: Karyawan dengan sistem Gaji Bulanan akan menerima Gaji Pokok tetap setiap periode gajian tanpa dikalikan hari hadir harian di generator slip gaji.
                    </p>
                  </div>
                ) : (
                  /* JIKA SISTEM GAJI HARIAN */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pilihan Tipe 1: Harian Dibayar Penuh */}
                      <div
                        onClick={() => setFormData({ ...formData, dailyRateType: "TYPE_1_FULL_DAY" })}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          formData.dailyRateType === "TYPE_1_FULL_DAY"
                            ? "border-amber-500 bg-amber-50/60 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase text-amber-900 tracking-wide flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            Tipe 1: Harian Dibayar Penuh
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                            Flat Daily Rate
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Teknisi dibayar per hari hadir kerja berdasarkan tarif jabatan (Helper Rp 150.000, Skill Rp 175.000).
                        </p>
                      </div>

                      {/* Pilihan Tipe 2: Bayaran Per Jam + Lembur */}
                      <div
                        onClick={() => setFormData({ ...formData, dailyRateType: "TYPE_2_HOURLY" })}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          formData.dailyRateType === "TYPE_2_HOURLY"
                            ? "border-indigo-500 bg-indigo-50/60 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase text-indigo-900 tracking-wide flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                            Tipe 2: Bayaran Jam + Pengali Lembur
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
                            Hourly Rate & Multiplier
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Teknisi dihitung per jam kerja efektif. Lembur menggunakan rumus pengali 1.5x dan 2.0x.
                        </p>
                      </div>
                    </div>

                    {/* Form Input Detail Tipe 1 */}
                    {formData.dailyRateType === "TYPE_1_FULL_DAY" && (
                      <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                            Parameter Upah Tipe 1 (Harian Dibayar Penuh)
                          </span>
                          <span className="text-[10px] text-amber-700 font-bold">
                            Preset Cepat Tarif Tingkat Jabatan
                          </span>
                        </div>

                        {/* Quick Preset Buttons for Daily Rate */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                dailyRate: 150000,
                                overtimeHourlyRate: 25000,
                                position: formData.position.includes("Helper") ? formData.position : "Helper / Asisten Teknisi Lapangan",
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              formData.dailyRate === 150000
                                ? "border-cyan-500 bg-cyan-100/70 text-cyan-950 font-bold shadow-xs"
                                : "border-amber-200/80 bg-white hover:bg-amber-100/50 text-slate-700"
                            }`}
                          >
                            <div className="text-[11px] font-black">👷‍♂️ Helper</div>
                            <div className="text-xs font-black text-cyan-800 mt-0.5">Rp 150.000<span className="text-[10px] font-normal">/hr</span></div>
                            <div className="text-[10px] text-slate-500 mt-0.5">OT: 25rb/jam</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                dailyRate: 175000,
                                overtimeHourlyRate: 30000,
                                position: formData.position.includes("Skill") ? formData.position : "Teknisi Skill Instalasi & Integrasi",
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              formData.dailyRate === 175000
                                ? "border-emerald-500 bg-emerald-100/70 text-emerald-950 font-bold shadow-xs"
                                : "border-amber-200/80 bg-white hover:bg-amber-100/50 text-slate-700"
                            }`}
                          >
                            <div className="text-[11px] font-black">⚡ Teknisi Skill</div>
                            <div className="text-xs font-black text-emerald-800 mt-0.5">Rp 175.000<span className="text-[10px] font-normal">/hr</span></div>
                            <div className="text-[10px] text-slate-500 mt-0.5">OT: 30rb/jam</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                dailyRate: 200000,
                                overtimeHourlyRate: 35000,
                                position: formData.position.includes("Senior") ? formData.position : "Teknisi Senior / Specialist",
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              formData.dailyRate === 200000
                                ? "border-purple-500 bg-purple-100/70 text-purple-950 font-bold shadow-xs"
                                : "border-amber-200/80 bg-white hover:bg-amber-100/50 text-slate-700"
                            }`}
                          >
                            <div className="text-[11px] font-black">🎯 Senior</div>
                            <div className="text-xs font-black text-purple-800 mt-0.5">Rp 200.000<span className="text-[10px] font-normal">/hr</span></div>
                            <div className="text-[10px] text-slate-500 mt-0.5">OT: 35rb/jam</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                dailyRate: 225000,
                                overtimeHourlyRate: 40000,
                                position: formData.position.includes("Lead") || formData.position.includes("Foreman") ? formData.position : "Lead / Foreman Lapangan",
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              formData.dailyRate === 225000
                                ? "border-indigo-500 bg-indigo-100/70 text-indigo-950 font-bold shadow-xs"
                                : "border-amber-200/80 bg-white hover:bg-amber-100/50 text-slate-700"
                            }`}
                          >
                            <div className="text-[11px] font-black">👑 Foreman</div>
                            <div className="text-xs font-black text-indigo-800 mt-0.5">Rp 225.000<span className="text-[10px] font-normal">/hr</span></div>
                            <div className="text-[10px] text-slate-500 mt-0.5">OT: 40rb/jam</div>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Upah Harian Penuh (Rp/Hari) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              required
                              value={formData.dailyRate}
                              onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                              className="w-full px-3.5 py-2.5 text-xs bg-white border border-amber-300 rounded-xl font-bold text-amber-950"
                            />
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              Standar DSTech: Helper Rp 150rb, Skill Rp 175rb, Senior Rp 200rb, Foreman Rp 225rb.
                            </span>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Tarif Lembur Opsional (Rp/Jam)
                            </label>
                            <input
                              type="number"
                              value={formData.overtimeHourlyRate}
                              onChange={(e) => setFormData({ ...formData, overtimeHourlyRate: Number(e.target.value) })}
                              className="w-full px-3.5 py-2.5 text-xs bg-white border border-amber-300 rounded-xl font-bold"
                            />
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              Diberikan jika teknisi diminta lembur melebihi jam kerja normal harian.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Input Detail Tipe 2 */}
                    {formData.dailyRateType === "TYPE_2_HOURLY" && (
                      <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-200 space-y-4">
                        <span className="text-xs font-black text-indigo-900 uppercase tracking-wider block">
                          Parameter Upah Tipe 2 (Jam Kerja & Pengali Lembur)
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Upah Per Jam Kerja (Rp/Jam) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              required
                              value={formData.hourlyRate}
                              onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                              className="w-full px-3.5 py-2.5 text-xs bg-white border border-indigo-300 rounded-xl font-bold text-indigo-950"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Jam Kerja Normal (Jam/Hari)
                            </label>
                            <input
                              type="number"
                              value={formData.normalHoursPerDay}
                              onChange={(e) => setFormData({ ...formData, normalHoursPerDay: Number(e.target.value) })}
                              className="w-full px-3.5 py-2.5 text-xs bg-white border border-indigo-300 rounded-xl font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Pengali Jam Lembur Ke-1
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={formData.overtimeMultiplierHour1}
                              onChange={(e) => setFormData({ ...formData, overtimeMultiplierHour1: Number(e.target.value) })}
                              className="w-full px-3.5 py-2.5 text-xs bg-white border border-indigo-300 rounded-xl font-bold"
                            />
                            <span className="text-[10px] text-slate-500 mt-0.5 block">Default: 1.5x</span>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Pengali Lembur Jam Ke-2 dst
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={formData.overtimeMultiplierHour2Plus}
                              onChange={(e) => setFormData({ ...formData, overtimeMultiplierHour2Plus: Number(e.target.value) })}
                              className="w-full px-3.5 py-2.5 text-xs bg-white border border-indigo-300 rounded-xl font-bold"
                            />
                            <span className="text-[10px] text-slate-500 mt-0.5 block">Default: 2.0x</span>
                          </div>
                        </div>

                        {/* Kalkulator Simulasi Cepat */}
                        <div className="p-3.5 bg-white rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-indigo-700">
                            <Calculator className="w-4 h-4 text-indigo-500" />
                            <span>
                              Simulasi Upah Normal 8 Jam:{" "}
                              <strong>
                                Rp {((formData.hourlyRate || 0) * (formData.normalHoursPerDay || 8)).toLocaleString("id-ID")}
                              </strong>
                            </span>
                          </div>
                          <div className="text-slate-600">
                            Lembur Jam 1:{" "}
                            <strong>
                              Rp {((formData.hourlyRate || 0) * (formData.overtimeMultiplierHour1 || 1.5)).toLocaleString("id-ID")}
                            </strong>{" "}
                            | Jam 2+:{" "}
                            <strong>
                              Rp {((formData.hourlyRate || 0) * (formData.overtimeMultiplierHour2Plus || 2.0)).toLocaleString("id-ID")}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BAGIAN 4: SINKRONISASI AKUN USER & DURASI AKSES */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-500" /> 4. Akun Login & Batas Waktu Akses
                </h3>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.createLoginAccount}
                      onChange={(e) => setFormData({ ...formData, createLoginAccount: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Sinkronisasikan Akun Pengguna & Kunci Batas Masa Berlaku Akses (Expired Date)
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 pl-7">
                    Akun login karyawan akan otomatis dibuat atau disinkronkan di <code>dstech_users.json</code> dengan masa aktif akses tepat berakhir pada tanggal{" "}
                    <strong>{formData.endDate}</strong>. Karyawan tidak dapat login setelah tanggal tersebut berakhir.
                  </p>

                  {formData.createLoginAccount && (
                    <div className="pl-7 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Kata Sandi Awal Login
                        </label>
                        <input
                          type="text"
                          value={formData.loginPassword}
                          onChange={(e) => setFormData({ ...formData, loginPassword: e.target.value })}
                          placeholder="Kosongkan jika default: dstech123"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Batas Akses Terkunci (Auto-Expired)
                        </label>
                        <input
                          type="text"
                          disabled
                          value={`${formData.endDate} (Mengikuti akhir kontrak)`}
                          className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg font-medium text-slate-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Simpan & Batal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-dstech-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Simpan & Terbitkan Kontrak
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PERPANJANG MASA KONTRAK */}
      {isExtendModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Perpanjang Kontrak Kerja</h2>
                  <p className="text-xs text-slate-500">{selectedContract.employeeName} ({selectedContract.contractNumber})</p>
                </div>
              </div>
              <button onClick={() => setIsExtendModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExtendSubmit} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Masa Kontrak Saat Ini:</span>
                  <strong className="text-slate-800">{selectedContract.startDate} s/d {selectedContract.endDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jabatan:</span>
                  <strong className="text-slate-800">{selectedContract.position}</strong>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tanggal Berakhir Kontrak Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={extendData.newEndDate}
                  onChange={(e) => setExtendData({ ...extendData, newEndDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tambahan Durasi (Bulan)
                </label>
                <input
                  type="number"
                  min="1"
                  value={extendData.additionalMonths}
                  onChange={(e) => setExtendData({ ...extendData, additionalMonths: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Perpanjangan
                </label>
                <textarea
                  rows={2}
                  value={extendData.notes}
                  onChange={(e) => setExtendData({ ...extendData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExtendModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                >
                  {saving ? "Memproses..." : "Konfirmasi Perpanjang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CETAK & PRATINJAU PKWT RESMI STANDAR A4 */}
      {isPrintModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:max-w-none">
            {/* Toolbar Modal */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-3">
                <FileSignature className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold">Pratinjau Surat Perjanjian Kerja Waktu Tertentu (PKWT)</h3>
                  <p className="text-[11px] text-slate-400">{selectedContract.contractNumber} - {selectedContract.employeeName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Download className="w-4 h-4" /> Unduh PDF
                </button>
                <button
                  onClick={handlePrintPKWT}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Printer className="w-4 h-4" /> Cetak Lembar A4
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* LEMBAR CETAK DOKUMEN PKWT STANDAR A4 */}
            <div id="pkwt-print-sheet" className="p-8 md:p-12 text-slate-900 bg-white font-serif max-w-[210mm] mx-auto min-h-[297mm] text-[12px] leading-relaxed relative">
              {/* Kop Surat Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center font-sans">
                <h2 className="text-xl font-black tracking-wider text-slate-950 uppercase">PT. DSTECH SMART PERKASA</h2>
                <p className="text-[10px] text-slate-600 font-medium tracking-wide uppercase">
                  Sistem Integrator CCTV, Security Systems, Smart Home & Otomasi Gedung
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Perum Bukit Cilegon Asri Blok DB No. 19, Kel. Bagendung, Kec. Cilegon, Kota Cilegon - Banten | WhatsApp: 0822-5949-4242 | cs@dstechsmart.com
                </p>
              </div>

              {/* Judul Dokumen */}
              <div className="text-center space-y-1 mb-6 font-sans">
                <h3 className="text-base font-black uppercase tracking-wider underline">
                  SURAT PERJANJIAN KERJA WAKTU TERTENTU (PKWT)
                </h3>
                <p className="text-xs font-bold text-slate-600 font-mono">
                  Nomor: {selectedContract.contractNumber}
                </p>
              </div>

              {/* Pembukaan */}
              <p className="mb-4 text-justify">
                Pada hari ini, bertempat di Kantor PT. DSTech Smart Perkasa Kota Cilegon, telah dibuat dan disepakati Perjanjian Kerja Waktu Tertentu (PKWT) oleh dan antara pihak-pihak di bawah ini:
              </p>

              {/* PIHAK PERTAMA & KEDUA */}
              <div className="space-y-3 mb-6 pl-4 border-l-2 border-slate-300 font-sans text-[11px]">
                <div>
                  <strong className="block text-slate-950">1. PIHAK PERTAMA (PERUSAHAAN):</strong>
                  <div className="grid grid-cols-4 gap-2 pl-4 mt-1">
                    <span className="text-slate-500">Nama Perusahaan</span>
                    <span className="col-span-3 font-semibold">: PT. DSTech Smart Perkasa</span>
                    <span className="text-slate-500">Nama Penanggung Jawab</span>
                    <span className="col-span-3 font-semibold">: {selectedContract.signedByFirstParty?.name || "RAMADHANI, ST"}</span>
                    <span className="text-slate-500">Jabatan</span>
                    <span className="col-span-3 font-semibold">: {selectedContract.signedByFirstParty?.title || "Direktur Utama"}</span>
                    <span className="text-slate-500">Alamat Kantor</span>
                    <span className="col-span-3 font-semibold">: Perum Bukit Cilegon Asri Blok DB No. 19, Cilegon - Banten</span>
                  </div>
                  <p className="text-[10px] text-slate-500 pl-4 mt-1 italic">
                    Bertindak sah untuk dan atas nama PT. DSTech Smart Perkasa, selanjutnya disebut <strong>"PIHAK PERTAMA"</strong>.
                  </p>
                </div>

                <div>
                  <strong className="block text-slate-950">2. PIHAK KEDUA (PEKERJA / KARYAWAN):</strong>
                  <div className="grid grid-cols-4 gap-2 pl-4 mt-1">
                    <span className="text-slate-500">Nama Lengkap</span>
                    <span className="col-span-3 font-semibold">: {selectedContract.employeeName}</span>
                    <span className="text-slate-500">Nomor KTP (NIK)</span>
                    <span className="col-span-3 font-semibold">: {selectedContract.employeeNik || "-"}</span>
                    <span className="text-slate-500">No. Telepon / WA</span>
                    <span className="col-span-3 font-semibold">: {selectedContract.employeePhone || "-"}</span>
                    <span className="text-slate-500">Alamat Domisili</span>
                    <span className="col-span-3 font-semibold">: {selectedContract.employeeAddress || "-"}</span>
                    <span className="text-slate-500">Kategori & Posisi</span>
                    <span className="col-span-3 font-semibold">
                      : {selectedContract.employeeCategory === "STAFF" ? "Staf Kantor" : "Teknisi Lapangan"} - {selectedContract.position}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pl-4 mt-1 italic">
                    Bertindak untuk dan atas nama diri sendiri, selanjutnya disebut <strong>"PIHAK KEDUA"</strong>.
                  </p>
                </div>
              </div>

              <p className="mb-4 text-justify">
                Kedua belah pihak sepakat mengikatkan diri dalam Perjanjian Kerja Waktu Tertentu dengan ketentuan dan pasal-pasal sebagai berikut:
              </p>

              {/* PASAL-PASAL */}
              <div className="space-y-4 text-justify font-serif text-[11px]">
                {/* PASAL 1 */}
                <div>
                  <h4 className="font-bold font-sans text-center text-slate-900 mb-1">
                    PASAL 1: LINGKUP TUGAS & PENEMPATAN
                  </h4>
                  <p>
                    1. PIHAK PERTAMA mempekerjakan PIHAK KEDUA sebagai <strong>{selectedContract.position}</strong> dengan kategori <strong>{selectedContract.employeeCategory === "STAFF" ? "Staf Tetap/Kontrak Kantor" : "Teknisi Kontrak Lapangan"}</strong>.
                  </p>
                  <p>
                    2. Lokasi kerja PIHAK KEDUA bertempat di <strong>{selectedContract.workLocation}</strong> atau lokasi proyek yang ditugaskan resmi melalui Surat Perintah Kerja (SPK).
                  </p>
                </div>

                {/* PASAL 2 */}
                <div>
                  <h4 className="font-bold font-sans text-center text-slate-900 mb-1">
                    PASAL 2: JANGKA WAKTU PERJANJIAN
                  </h4>
                  <p>
                    1. Perjanjian kerja ini berlaku untuk jangka waktu <strong>{selectedContract.durationMonths} Bulan</strong>, terhitung sejak tanggal <strong>{selectedContract.startDate}</strong> sampai dengan tanggal <strong>{selectedContract.endDate}</strong>.
                  </p>
                  <p>
                    2. Apabila masa perjanjian berakhir, PIHAK PERTAMA dapat memperpanjang kontrak kerja berdasarkan evaluasi kinerja dan kebutuhan operasional perusahaan.
                  </p>
                </div>

                {/* PASAL 3 */}
                <div>
                  <h4 className="font-bold font-sans text-center text-slate-900 mb-1">
                    PASAL 3: WAKTU KERJA & KEHADIRAN (ABSENSI GPS & SELFIE)
                  </h4>
                  <p>
                    1. PIHAK KEDUA wajib mencatatkan presensi Masuk dan Pulang melalui Sistem Aplikasi DSTech Smart yang dilengkapi dengan validasi koordinat satelit GPS dan jepretan kamera selfie wajah langsung tanpa manipulasi manual.
                  </p>
                  <p>
                    2. Waktu kerja operasional standar adalah 8 (delapan) jam per hari atau disesuaikan dengan jadwal penugasan lapangan yang disepakati.
                  </p>
                </div>

                {/* PASAL 4: UPAH & KOMPENSASI */}
                <div>
                  <h4 className="font-bold font-sans text-center text-slate-900 mb-1">
                    PASAL 4: SISTEM UPAH & SKEMA PEMBAYARAN
                  </h4>
                  {selectedContract.employeeCategory === "STAFF" || selectedContract.contractType === "MONTHLY" || selectedContract.contractType === "YEARLY" ? (
                    <div className="space-y-1">
                      <p>PIHAK KEDUA berhak menerima kompensasi upah bulanan dengan rincian sebagai berikut:</p>
                      <ul className="list-disc pl-6 space-y-0.5 font-sans text-[10px]">
                        <li>Gaji Pokok: <strong>Rp {(selectedContract.salaryScheme?.staffScheme?.baseSalary || 0).toLocaleString("id-ID")}</strong> / bulan.</li>
                        <li>Tunjangan Jabatan: Rp {(selectedContract.salaryScheme?.staffScheme?.positionAllowance || 0).toLocaleString("id-ID")}.</li>
                        <li>Tunjangan Transportasi: Rp {(selectedContract.salaryScheme?.staffScheme?.transportAllowance || 0).toLocaleString("id-ID")}.</li>
                        <li>BPJS: Rp {(selectedContract.salaryScheme?.staffScheme?.bpjsAllowance || 0).toLocaleString("id-ID")}.</li>
                      </ul>
                      <p>Upah dibayarkan secara rutin setiap tanggal 25 (dua puluh lima) setiap bulannya melalui transfer rekening resmi.</p>
                    </div>
                  ) : selectedContract.salaryScheme?.dailyScheme?.dailyRateType === "TYPE_1_FULL_DAY" ? (
                    <div className="space-y-1">
                      <p>
                        PIHAK KEDUA dipekerjakan dengan skema <strong>Tipe 1: Harian Dibayar Penuh (Flat Full Daily Rate)</strong> dengan rincian kompensasi:
                      </p>
                      <ul className="list-disc pl-6 space-y-0.5 font-sans text-[10px]">
                        <li>
                          Upah Harian Penuh: <strong>Rp {(selectedContract.salaryScheme?.dailyScheme?.dailyRate || 0).toLocaleString("id-ID")} / hari kerja</strong>, dibayarkan penuh atas setiap hari kerja efektif dan penyelesaian tugas lapangan.
                        </li>
                        <li>
                          Upah Lembur Tambahan: <strong>Rp {(selectedContract.salaryScheme?.dailyScheme?.overtimeHourlyRate || 0).toLocaleString("id-ID")} / jam</strong>, jika ditugaskan bekerja melebihi jam kerja harian normal.
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p>
                        PIHAK KEDUA dipekerjakan dengan skema <strong>Tipe 2: Bayaran Jam Kerja Efektif & Pengali Lembur</strong> dengan rincian:
                      </p>
                      <ul className="list-disc pl-6 space-y-0.5 font-sans text-[10px]">
                        <li>
                          Upah Per Jam Kerja Normal: <strong>Rp {(selectedContract.salaryScheme?.dailyScheme?.hourlyRate || 0).toLocaleString("id-ID")} / jam</strong> (standar {selectedContract.salaryScheme?.dailyScheme?.normalHoursPerDay || 8} jam per hari kerja).
                        </li>
                        <li>
                          Pengali Lembur Jam Pertama: <strong>{selectedContract.salaryScheme?.dailyScheme?.overtimeMultiplierHour1 || 1.5}x</strong> dari tarif upah per jam.
                        </li>
                        <li>
                          Pengali Lembur Jam Kedua dan Seterusnya: <strong>{selectedContract.salaryScheme?.dailyScheme?.overtimeMultiplierHour2Plus || 2.0}x</strong> dari tarif upah per jam.
                        </li>
                        <li>
                          Pengali Lembur Hari Libur / Akhir Pekan: <strong>{selectedContract.salaryScheme?.dailyScheme?.weekendMultiplier || 2.0}x</strong> dari tarif upah per jam.
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* PASAL 5 */}
                <div>
                  <h4 className="font-bold font-sans text-center text-slate-900 mb-1">
                    PASAL 5: KERAHASIAAN & TATA TERTIB
                  </h4>
                  <p>
                    PIHAK KEDUA wajib menjaga kerahasiaan data instalasi, aset, kode sandi, dan rahasia bisnis milik PIHAK PERTAMA maupun klien. Pelanggaran berat terhadap keselamatan kerja (K3) dan penyalahgunaan wewenang dapat berakibat pemutusan kontrak sepihak tanpa ganti rugi.
                  </p>
                </div>
              </div>

              {/* TANDA TANGAN KEDUA PIHAK */}
              <div className="mt-8 pt-6 border-t border-slate-300 font-sans text-[11px]">
                <p className="text-right text-[10px] text-slate-600 mb-6">
                  Cilegon, {selectedContract.startDate}
                </p>

                <div className="grid grid-cols-2 gap-8 text-center">
                  {/* Pihak Pertama */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">PIHAK PERTAMA</p>
                    <p className="text-[10px] text-slate-500">PT. DSTech Smart Perkasa</p>

                    <div className="h-20 flex items-center justify-center relative">
                      <div className="w-16 h-16 rounded-full border border-blue-600/40 text-blue-700/60 flex items-center justify-center text-[8px] font-black uppercase rotate-[-12deg] tracking-wider select-none pointer-events-none">
                        PT. DSTECH<br />PERKASA
                      </div>
                    </div>

                    <p className="font-bold underline text-slate-900">{selectedContract.signedByFirstParty?.name || "RAMADHANI, ST"}</p>
                    <p className="text-[10px] text-slate-500">{selectedContract.signedByFirstParty?.title || "Direktur Utama"}</p>
                  </div>

                  {/* Pihak Kedua */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">PIHAK KEDUA</p>
                    <p className="text-[10px] text-slate-500">Karyawan / Teknisi Bersangkutan</p>

                    <div className="h-20 flex items-center justify-center">
                      <span className="text-[9px] text-slate-400 italic border border-dashed border-slate-300 px-3 py-1.5 rounded-md">
                        [Materai 10.000 / TTD Digital]
                      </span>
                    </div>

                    <p className="font-bold underline text-slate-900">{selectedContract.employeeName}</p>
                    <p className="text-[10px] text-slate-500">{selectedContract.position}</p>
                  </div>
                </div>
              </div>

              {/* Footer Catatan Sistem */}
              <div className="mt-8 pt-3 border-t border-slate-200 text-[9px] text-slate-400 text-center font-sans">
                Dokumen Surat Perjanjian Kerja Waktu Tertentu (PKWT) ini diterbitkan secara sah dan terekam di Portal Legalitas PT. DSTech Smart Perkasa.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
