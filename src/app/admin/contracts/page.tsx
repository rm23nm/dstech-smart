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
  X,
  CalendarCheck,
  Car,
  Utensils,
  Camera,
  Upload,
  Image as ImageIcon,
  ZoomIn
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
  department?: string;
  photoUrl?: string;
  idCardUrl?: string;
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
      dailyRateType: "TYPE_1_FULL_DAY" | "TYPE_2_HOURLY" | "TYPE_3_MONTHLY_FULL";
      dailyRate?: number;
      overtimeHourlyRate?: number;
      hourlyRate?: number;
      monthlyBaseSalary?: number;
      positionAllowance?: number;
      transportAllowance?: number;
      bpjsAllowance?: number;
      normalHoursPerDay?: number;
      overtimeMultiplierHour1?: number;
      overtimeMultiplierHour2Plus?: number;
      weekendMultiplier?: number;
      description?: string;
    };
  };
  allowances?: {
    transportMethod: "FULL_MONTHLY" | "DAILY_PRESENCE";
    transportAmount: number;
    mealMethod: "FULL_MONTHLY" | "DAILY_PRESENCE";
    mealAmount: number;
  };
  leavePolicy?: {
    annualLeaveDays?: number;
    paidPermissionDays?: number;
    sickLeavePaid?: boolean;
    requiresDoctorCertificate?: boolean;
    unpaidLeaveDeduction?: "PRORATE_DAILY" | "NONE";
    specialLeaveNotes?: string;
  };
  workSchedule?: {
    workDaysType: "5_DAYS" | "6_DAYS" | "FLEXIBLE_PROJECT";
    workDaysText: string;
    dailyWorkingHours: number;
    weeklyWorkingHours: number;
    startTime: string;
    endTime: string;
    breakStartTime: string;
    breakEndTime: string;
    notes?: string;
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
  department?: string;
  category: "STAFF" | "TECHNICIAN";
  payrollScheme: "DAILY" | "MONTHLY";
  contractType: "DAILY" | "MONTHLY" | "YEARLY";
  dailyRate?: number;
  overtimeHourlyRate?: number;
  baseSalary?: number;
  positionAllowance?: number;
  transportAllowance?: number;
  mealAllowance?: number;
  transportMethod?: "FULL_MONTHLY" | "DAILY_PRESENCE";
  transportAmount?: number;
  mealMethod?: "FULL_MONTHLY" | "DAILY_PRESENCE";
  mealAmount?: number;
  bpjsAllowance?: number;
  workDaysType?: "5_DAYS" | "6_DAYS" | "FLEXIBLE_PROJECT";
  startTime?: string;
  endTime?: string;
  dailyWorkingHours?: number;
  notes?: string;
}

export const OFFICIAL_DEPARTMENTS = [
  "Divisi Operasional Lapangan & Instalasi",
  "Divisi Integrasi Sistem & Smart Technology",
  "Divisi Pengawasan Proyek & Lapangan",
  "Divisi Keuangan & Administrasi",
  "Divisi IT, Jaringan & Server",
  "Divisi Penjualan & Kemitraan Bisnis",
  "Divisi Logistik, Gudang & Pengadaan",
];

export const calculateEndDateFromDuration = (startDateStr: string, months: number): string => {
  if (!startDateStr || !months || months <= 0) return startDateStr;
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return startDateStr;
  const end = new Date(start);
  end.setMonth(end.getMonth() + Number(months));
  end.setDate(end.getDate() - 1);
  return end.toISOString().split("T")[0];
};

export const OFFICIAL_POSITION_PRESETS: OfficialPositionPreset[] = [
  {
    id: "helper",
    label: "👷‍♂️ Helper / Asisten Teknisi (Rp 150.000 / hari)",
    positionName: "Helper / Asisten Teknisi Lapangan",
    department: "Divisi Operasional Lapangan & Instalasi",
    category: "TECHNICIAN",
    payrollScheme: "DAILY",
    contractType: "DAILY",
    dailyRate: 150000,
    overtimeHourlyRate: 25000,
    transportMethod: "DAILY_PRESENCE",
    transportAmount: 20000,
    mealMethod: "DAILY_PRESENCE",
    mealAmount: 25000,
    workDaysType: "6_DAYS",
    startTime: "08:00",
    endTime: "17:00",
    dailyWorkingHours: 8,
    notes: "Upah harian Helper Rp 150.000/hari kerja & lembur Rp 25.000/jam",
  },
  {
    id: "skill",
    label: "⚡ Teknisi Skill / Ahli Lapangan (Rp 175.000 / hari)",
    positionName: "Teknisi Skill Instalasi & Integrasi",
    department: "Divisi Operasional Lapangan & Instalasi",
    category: "TECHNICIAN",
    payrollScheme: "DAILY",
    contractType: "DAILY",
    dailyRate: 175000,
    overtimeHourlyRate: 30000,
    transportMethod: "DAILY_PRESENCE",
    transportAmount: 20000,
    mealMethod: "DAILY_PRESENCE",
    mealAmount: 25000,
    workDaysType: "6_DAYS",
    startTime: "08:00",
    endTime: "17:00",
    dailyWorkingHours: 8,
    notes: "Upah harian Teknisi Skill Rp 175.000/hari kerja & lembur Rp 30.000/jam",
  },
  {
    id: "senior",
    label: "🎯 Teknisi Senior / Specialist (Rp 200.000 / hari)",
    positionName: "Teknisi Senior / Specialist CCTV & Smart Home",
    department: "Divisi Integrasi Sistem & Smart Technology",
    category: "TECHNICIAN",
    payrollScheme: "DAILY",
    contractType: "DAILY",
    dailyRate: 200000,
    overtimeHourlyRate: 35000,
    transportMethod: "DAILY_PRESENCE",
    transportAmount: 25000,
    mealMethod: "DAILY_PRESENCE",
    mealAmount: 30000,
    workDaysType: "6_DAYS",
    startTime: "08:00",
    endTime: "17:00",
    dailyWorkingHours: 8,
    notes: "Upah harian Teknisi Senior Rp 200.000/hari kerja & lembur Rp 35.000/jam",
  },
  {
    id: "foreman",
    label: "👑 Lead / Foreman Lapangan (Rp 225.000 / hari)",
    positionName: "Lead / Foreman Lapangan",
    department: "Divisi Pengawasan Proyek & Lapangan",
    category: "TECHNICIAN",
    payrollScheme: "DAILY",
    contractType: "DAILY",
    dailyRate: 225000,
    overtimeHourlyRate: 40000,
    transportMethod: "DAILY_PRESENCE",
    transportAmount: 30000,
    mealMethod: "DAILY_PRESENCE",
    mealAmount: 35000,
    workDaysType: "6_DAYS",
    startTime: "08:00",
    endTime: "17:00",
    dailyWorkingHours: 8,
    notes: "Upah harian Lead/Foreman Rp 225.000/hari kerja & lembur Rp 40.000/jam",
  },
  {
    id: "staff_admin",
    label: "💼 Staf Administrasi & Keuangan (Gaji Bulanan)",
    positionName: "Staf Administrasi & Keuangan",
    department: "Divisi Keuangan & Administrasi",
    category: "STAFF",
    payrollScheme: "MONTHLY",
    contractType: "YEARLY",
    baseSalary: 4200000,
    positionAllowance: 500000,
    transportAllowance: 400000,
    mealAllowance: 500000,
    transportMethod: "FULL_MONTHLY",
    transportAmount: 400000,
    mealMethod: "FULL_MONTHLY",
    mealAmount: 500000,
    bpjsAllowance: 150000,
    workDaysType: "5_DAYS",
    startTime: "08:00",
    endTime: "17:00",
    dailyWorkingHours: 8,
    notes: "Gaji bulanan tetap staf kantor (tidak dikalikan harian)",
  },
  {
    id: "staff_it",
    label: "💻 Staf IT Support & Networking (Gaji Bulanan)",
    positionName: "Staf IT Support & Networking",
    department: "Divisi IT, Jaringan & Server",
    category: "STAFF",
    payrollScheme: "MONTHLY",
    contractType: "YEARLY",
    baseSalary: 4500000,
    positionAllowance: 500000,
    transportAllowance: 400000,
    mealAllowance: 500000,
    transportMethod: "FULL_MONTHLY",
    transportAmount: 400000,
    mealMethod: "FULL_MONTHLY",
    mealAmount: 500000,
    bpjsAllowance: 150000,
    workDaysType: "5_DAYS",
    startTime: "08:00",
    endTime: "17:00",
    dailyWorkingHours: 8,
    notes: "Gaji bulanan staf IT tetap",
  },
  {
    id: "staff_spv",
    label: "🏢 Supervisor / Koordinator Operasional (Gaji Bulanan)",
    positionName: "Supervisor / Koordinator Operasional",
    department: "Divisi Keuangan & Administrasi",
    category: "STAFF",
    payrollScheme: "MONTHLY",
    contractType: "YEARLY",
    baseSalary: 5500000,
    positionAllowance: 750000,
    transportAllowance: 500000,
    mealAllowance: 600000,
    transportMethod: "FULL_MONTHLY",
    transportAmount: 500000,
    mealMethod: "FULL_MONTHLY",
    mealAmount: 600000,
    bpjsAllowance: 150000,
    workDaysType: "5_DAYS",
    startTime: "08:00",
    endTime: "17:00",
    dailyWorkingHours: 8,
    notes: "Gaji bulanan manajerial/supervisor",
  },
  {
    id: "custom",
    label: "✍️ Posisi Kustom (Input Manual Bebas)",
    positionName: "",
    department: "Divisi Operasional Lapangan & Instalasi",
    category: "TECHNICIAN",
    payrollScheme: "DAILY",
    contractType: "DAILY",
    dailyRate: 175000,
    workDaysType: "6_DAYS",
    startTime: "08:00",
    endTime: "17:00",
    dailyWorkingHours: 8,
    overtimeHourlyRate: 30000,
    baseSalary: 4000000,
    positionAllowance: 500000,
    transportAllowance: 400000,
    mealAllowance: 500000,
    transportMethod: "FULL_MONTHLY",
    mealMethod: "FULL_MONTHLY",
    bpjsAllowance: 150000,
    notes: "Posisi kustom",
  },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<DstechContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"ALL" | "STAFF" | "TECHNICIAN">("ALL");
  const [filterDepartment, setFilterDepartment] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "DAILY_1" | "DAILY_2" | "MONTHLY" | "YEARLY">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "EXPIRING" | "EXPIRED">("ALL");

  // Modals & Previews
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<DstechContract | null>(null);
  const [previewKtpModal, setPreviewKtpModal] = useState<{ isOpen: boolean; employeeName: string; idCardUrl: string } | null>(null);

  // Upload states & refs
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingIdCard, setUploadingIdCard] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const idCardInputRef = useRef<HTMLInputElement>(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    id: "",
    contractNumber: "",
    employeeName: "",
    employeeNik: "",
    employeePhone: "",
    employeeEmail: "",
    employeeAddress: "",
    photoUrl: "",
    idCardUrl: "",
    department: "Divisi Operasional Lapangan & Instalasi",
    selectedRolePresetId: "skill",
    position: "Teknisi Skill Instalasi & Integrasi",
    payrollSchemeType: "DAILY" as "DAILY" | "MONTHLY",
    employeeCategory: "TECHNICIAN" as "STAFF" | "TECHNICIAN",
    contractType: "DAILY" as "DAILY" | "MONTHLY" | "YEARLY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: calculateEndDateFromDuration(new Date().toISOString().split("T")[0], 3),
    durationMonths: 3,
    workLocation: "Kantor & Proyek Lapangan (Sesuai SPK)",
    status: "ACTIVE" as "ACTIVE" | "EXPIRED" | "TERMINATED" | "DRAFT",
    // Staff Scheme & Flat Monthly
    baseSalary: 4000000,
    positionAllowance: 500000,
    transportAllowance: 400000,
    mealAllowance: 500000,
    bpjsAllowance: 150000,
    // Tunjangan Transportasi & Uang Makan (2 Metode: Full vs Harian Hadir)
    transportMethod: "FULL_MONTHLY" as "FULL_MONTHLY" | "DAILY_PRESENCE",
    transportAmount: 400000,
    mealMethod: "FULL_MONTHLY" as "FULL_MONTHLY" | "DAILY_PRESENCE",
    mealAmount: 500000,
    // Technician Daily Scheme
    dailyRateType: "TYPE_1_FULL_DAY" as "TYPE_1_FULL_DAY" | "TYPE_2_HOURLY" | "TYPE_3_MONTHLY_FULL",
    dailyRate: 175000,
    overtimeHourlyRate: 30000,
    hourlyRate: 30000,
    normalHoursPerDay: 8,
    overtimeMultiplierHour1: 1.5,
    overtimeMultiplierHour2Plus: 2.0,
    weekendMultiplier: 2.0,
    // Cuti, Izin, & Sakit
    annualLeaveDays: 12,
    paidPermissionDays: 3,
    sickLeavePaid: true,
    requiresDoctorCertificate: true,
    unpaidLeaveDeduction: "PRORATE_DAILY" as "PRORATE_DAILY" | "NONE",
    specialLeaveNotes: "Cuti tahunan 12 hari/tahun. Izin berbayar 3 hari. Sakit wajib melampirkan Surat Keterangan Dokter.",
    // Waktu Kerja, Hari Kerja & Jam Istirahat (PP No. 35/2021)
    workDaysType: "6_DAYS" as "5_DAYS" | "6_DAYS" | "FLEXIBLE_PROJECT",
    workDaysText: "Senin s.d. Sabtu (6 Hari Kerja)",
    dailyWorkingHours: 8,
    weeklyWorkingHours: 40,
    startTime: "08:00",
    endTime: "17:00",
    breakStartTime: "12:00",
    breakEndTime: "13:00",
    scheduleNotes: "Waktu kerja normal 8 jam/hari. Istirahat 1 jam (12:00 - 13:00 WIB, khusus Jumat 11:30 - 13:00 WIB). Fleksibel mengikuti SPK lapangan.",
    // First & Second Party
    directorName: "RAMADHANI, ST",
    directorTitle: "Direktur Utama",
    notes: "",
    // User Account Sync
    createLoginAccount: true,
    loginPassword: "",
  });

  // Upload Handlers
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docType", "photo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, photoUrl: data.url }));
        showToast("Pas foto karyawan berhasil diunggah!");
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
          showToast("Pas foto karyawan tersimpan (Lokal)!");
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
        showToast("Pas foto karyawan tersimpan!");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUploadIdCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingIdCard(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docType", "idCard");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, idCardUrl: data.url }));
        showToast("Foto KTP / Identitas berhasil diunggah!");
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev) => ({ ...prev, idCardUrl: reader.result as string }));
          showToast("Foto KTP tersimpan (Lokal)!");
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, idCardUrl: reader.result as string }));
        showToast("Foto KTP tersimpan!");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingIdCard(false);
    }
  };

  // Helper Auto-Calculate Tanggal Berakhir dari Preset Durasi
  const handleSelectDurationPreset = (months: number) => {
    const newEnd = calculateEndDateFromDuration(formData.startDate, months);
    setFormData((prev) => ({
      ...prev,
      durationMonths: months,
      contractType: months >= 12 ? "YEARLY" : (prev.employeeCategory === "STAFF" ? "MONTHLY" : "DAILY"),
      endDate: newEnd,
    }));
  };

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
      // Department filter
      if (filterDepartment !== "ALL" && item.department !== filterDepartment) {
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
        const matchDept = item.department?.toLowerCase().includes(q);
        if (!matchName && !matchNum && !matchPos && !matchNik && !matchDept) return false;
      }
      return true;
    });
  }, [contracts, filterCategory, filterDepartment, filterType, filterStatus, searchQuery]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const initialMonths = 3;
    const initialEnd = calculateEndDateFromDuration(todayStr, initialMonths);

    setFormData({
      id: "",
      contractNumber: "",
      employeeName: "",
      employeeNik: "",
      employeePhone: "",
      employeeEmail: "",
      employeeAddress: "",
      photoUrl: "",
      idCardUrl: "",
      department: "Divisi Operasional Lapangan & Instalasi",
      selectedRolePresetId: "skill",
      position: "Teknisi Skill Instalasi & Integrasi",
      payrollSchemeType: "DAILY",
      employeeCategory: "TECHNICIAN",
      contractType: "DAILY",
      startDate: todayStr,
      endDate: initialEnd,
      durationMonths: initialMonths,
      workLocation: "Kantor & Proyek Lapangan (Sesuai SPK)",
      status: "ACTIVE",
      baseSalary: 4000000,
      positionAllowance: 500000,
      transportAllowance: 400000,
      mealAllowance: 500000,
      bpjsAllowance: 150000,
      // Tunjangan Transportasi & Uang Makan (2 Metode Fleksibel)
      transportMethod: "DAILY_PRESENCE",
      transportAmount: 20000,
      mealMethod: "DAILY_PRESENCE",
      mealAmount: 25000,
      dailyRateType: "TYPE_1_FULL_DAY",
      dailyRate: 175000,
      overtimeHourlyRate: 30000,
      hourlyRate: 30000,
      normalHoursPerDay: 8,
      overtimeMultiplierHour1: 1.5,
      overtimeMultiplierHour2Plus: 2.0,
      weekendMultiplier: 2.0,
      // Cuti, Izin, Sakit
      annualLeaveDays: 12,
      paidPermissionDays: 3,
      sickLeavePaid: true,
      requiresDoctorCertificate: true,
      unpaidLeaveDeduction: "PRORATE_DAILY",
      specialLeaveNotes: "Cuti tahunan 12 hari/tahun. Izin berbayar 3 hari. Sakit wajib melampirkan Surat Keterangan Dokter.",
      // Waktu Kerja, Hari Kerja & Jam Istirahat (PP No. 35/2021)
      workDaysType: "6_DAYS",
      workDaysText: "Senin s.d. Sabtu (6 Hari Kerja)",
      dailyWorkingHours: 8,
      weeklyWorkingHours: 40,
      startTime: "08:00",
      endTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "13:00",
      scheduleNotes: "Waktu kerja normal 8 jam/hari. Istirahat 1 jam (12:00 - 13:00 WIB, khusus Jumat 11:30 - 13:00 WIB). Fleksibel mengikuti SPK lapangan.",
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
    const isDaily = !!daily && daily.dailyRateType !== "TYPE_3_MONTHLY_FULL" && item.employeeCategory === "TECHNICIAN" && item.contractType === "DAILY";

    // Detect active rate type
    const activeRateType = daily?.dailyRateType || (item.employeeCategory === "STAFF" || item.contractType === "MONTHLY" || item.contractType === "YEARLY" ? "TYPE_3_MONTHLY_FULL" : "TYPE_1_FULL_DAY");
    const activeSchemeType = activeRateType === "TYPE_3_MONTHLY_FULL" ? "MONTHLY" : (isDaily ? "DAILY" : "MONTHLY");

    // Detect preset id
    let matchedPreset = "custom";
    const posLower = (item.position || "").toLowerCase();
    if (posLower.includes("helper")) matchedPreset = "helper";
    else if (posLower.includes("skill") || posLower.includes("instalasi")) matchedPreset = "skill";
    else if (posLower.includes("senior") || posLower.includes("spesialis")) matchedPreset = "senior";
    else if (posLower.includes("foreman") || posLower.includes("lead")) matchedPreset = "foreman";
    else if (posLower.includes("administrasi") || posLower.includes("keuangan")) matchedPreset = "staff_admin";
    else if (posLower.includes("it") || posLower.includes("network")) matchedPreset = "staff_it";
    else if (posLower.includes("supervisor")) matchedPreset = "staff_spv";

    // Detect allowances & methods
    const activeTransportMethod = item.allowances?.transportMethod || (item.employeeCategory === "STAFF" || item.contractType === "MONTHLY" || item.contractType === "YEARLY" ? "FULL_MONTHLY" : "DAILY_PRESENCE");
    const activeTransportAmount = item.allowances?.transportAmount ?? staff?.transportAllowance ?? daily?.transportAllowance ?? (activeTransportMethod === "FULL_MONTHLY" ? 400000 : 20000);
    const activeMealMethod = item.allowances?.mealMethod || (item.employeeCategory === "STAFF" || item.contractType === "MONTHLY" || item.contractType === "YEARLY" ? "FULL_MONTHLY" : "DAILY_PRESENCE");
    const activeMealAmount = item.allowances?.mealAmount ?? (activeMealMethod === "FULL_MONTHLY" ? 500000 : 25000);

    // Detect work schedule
    const ws = item.workSchedule;
    const defaultWorkDays = item.employeeCategory === "STAFF" ? "5_DAYS" : "6_DAYS";

    setFormData({
      id: item.id,
      contractNumber: item.contractNumber,
      employeeName: item.employeeName,
      employeeNik: item.employeeNik || "",
      employeePhone: item.employeePhone || "",
      employeeEmail: item.employeeEmail || "",
      employeeAddress: item.employeeAddress || "",
      photoUrl: item.photoUrl || "",
      idCardUrl: item.idCardUrl || "",
      department: item.department || (item.employeeCategory === "STAFF" ? "Divisi Keuangan & Administrasi" : "Divisi Operasional Lapangan & Instalasi"),
      selectedRolePresetId: matchedPreset,
      position: item.position,
      payrollSchemeType: activeSchemeType,
      employeeCategory: item.employeeCategory,
      contractType: item.contractType,
      startDate: item.startDate,
      endDate: item.endDate,
      durationMonths: item.durationMonths,
      workLocation: item.workLocation,
      status: item.status,
      baseSalary: daily?.monthlyBaseSalary || staff?.baseSalary || 4200000,
      positionAllowance: daily?.positionAllowance ?? staff?.positionAllowance ?? 500000,
      transportAllowance: activeTransportAmount,
      mealAllowance: activeMealAmount,
      bpjsAllowance: daily?.bpjsAllowance ?? staff?.bpjsAllowance ?? 150000,
      // Tunjangan Transport & Makan (2 Metode Fleksibel)
      transportMethod: activeTransportMethod,
      transportAmount: activeTransportAmount,
      mealMethod: activeMealMethod,
      mealAmount: activeMealAmount,
      dailyRateType: activeRateType,
      dailyRate: daily?.dailyRate || 175000,
      overtimeHourlyRate: daily?.overtimeHourlyRate || 30000,
      hourlyRate: daily?.hourlyRate || 30000,
      normalHoursPerDay: daily?.normalHoursPerDay || 8,
      overtimeMultiplierHour1: daily?.overtimeMultiplierHour1 || 1.5,
      overtimeMultiplierHour2Plus: daily?.overtimeMultiplierHour2Plus || 2.0,
      weekendMultiplier: daily?.weekendMultiplier || 2.0,
      // Cuti, Izin, Sakit
      annualLeaveDays: item.leavePolicy?.annualLeaveDays ?? 12,
      paidPermissionDays: item.leavePolicy?.paidPermissionDays ?? 3,
      sickLeavePaid: item.leavePolicy?.sickLeavePaid ?? true,
      requiresDoctorCertificate: item.leavePolicy?.requiresDoctorCertificate ?? true,
      unpaidLeaveDeduction: (item.leavePolicy?.unpaidLeaveDeduction as any) ?? "PRORATE_DAILY",
      specialLeaveNotes: item.leavePolicy?.specialLeaveNotes ?? "Cuti tahunan 12 hari/tahun. Izin berbayar 3 hari. Sakit wajib melampirkan Surat Keterangan Dokter.",
      // Waktu Kerja & Hari Kerja
      workDaysType: ws?.workDaysType || defaultWorkDays,
      workDaysText: ws?.workDaysText || (defaultWorkDays === "5_DAYS" ? "Senin s.d. Jumat (5 Hari Kerja)" : "Senin s.d. Sabtu (6 Hari Kerja)"),
      dailyWorkingHours: ws?.dailyWorkingHours || 8,
      weeklyWorkingHours: ws?.weeklyWorkingHours || 40,
      startTime: ws?.startTime || "08:00",
      endTime: ws?.endTime || "17:00",
      breakStartTime: ws?.breakStartTime || "12:00",
      breakEndTime: ws?.breakEndTime || "13:00",
      scheduleNotes: ws?.notes || (defaultWorkDays === "5_DAYS" ? "Waktu kerja normal 8 jam/hari. Istirahat 1 jam (12:00 - 13:00 WIB)." : "Waktu kerja normal 8 jam/hari. Istirahat 1 jam (12:00 - 13:00 WIB, khusus Jumat 11:30 - 13:00 WIB). Fleksibel mengikuti SPK lapangan."),
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

      // Build Salary Scheme based on dailyRateType / payrollSchemeType
      let salaryScheme: any = {};
      if (formData.dailyRateType === "TYPE_3_MONTHLY_FULL" || formData.payrollSchemeType === "MONTHLY") {
        salaryScheme.staffScheme = {
          baseSalary: Number(formData.baseSalary || 0),
          positionAllowance: Number(formData.positionAllowance || 0),
          transportAllowance: Number(formData.transportAmount || 0),
          mealAllowance: Number(formData.mealAmount || 0),
          bpjsAllowance: Number(formData.bpjsAllowance || 0),
          notes: "Tipe 3: Gaji bulanan dibayar penuh (tidak dikalikan hari hadir di auto-payroll)",
        };
        salaryScheme.dailyScheme = {
          dailyRateType: "TYPE_3_MONTHLY_FULL",
          monthlyBaseSalary: Number(formData.baseSalary || 0),
          positionAllowance: Number(formData.positionAllowance || 0),
          transportAllowance: Number(formData.transportAmount || 0),
          mealAllowance: Number(formData.mealAmount || 0),
          bpjsAllowance: Number(formData.bpjsAllowance || 0),
          overtimeHourlyRate: Number(formData.overtimeHourlyRate || 30000),
          description: `Tipe 3: Bulanan dibayar penuh Rp ${Number(formData.baseSalary || 0).toLocaleString("id-ID")}/bulan.`,
        };
      } else if (formData.dailyRateType === "TYPE_2_HOURLY") {
        // TIPE 2: HOURLY RATE
        salaryScheme.dailyScheme = {
          dailyRateType: "TYPE_2_HOURLY",
          hourlyRate: Number(formData.hourlyRate || 0),
          normalHoursPerDay: Number(formData.normalHoursPerDay || 8),
          overtimeMultiplierHour1: Number(formData.overtimeMultiplierHour1 || 1.5),
          overtimeMultiplierHour2Plus: Number(formData.overtimeMultiplierHour2Plus || 2.0),
          weekendMultiplier: Number(formData.weekendMultiplier || 2.0),
          overtimeHourlyRate: Number(formData.hourlyRate || 0) * Number(formData.overtimeMultiplierHour1 || 1.5),
          transportAllowance: Number(formData.transportAmount || 0),
          mealAllowance: Number(formData.mealAmount || 0),
          description: `Tipe 2: Bayaran per jam Rp ${(formData.hourlyRate || 0).toLocaleString("id-ID")}/jam dengan pengali lembur 1.5x dan 2.0x.`,
        };
      } else {
        // TIPE 1: FLAT DAILY RATE (DEFAULT)
        salaryScheme.dailyScheme = {
          dailyRateType: "TYPE_1_FULL_DAY",
          dailyRate: Number(formData.dailyRate || 0),
          overtimeHourlyRate: Number(formData.overtimeHourlyRate || 0),
          transportAllowance: Number(formData.transportAmount || 0),
          mealAllowance: Number(formData.mealAmount || 0),
          description: `Tipe 1: Harian dibayar penuh Rp ${(formData.dailyRate || 0).toLocaleString("id-ID")}/hari kerja.`,
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
        photoUrl: formData.photoUrl || "",
        idCardUrl: formData.idCardUrl || "",
        department: formData.department || "Divisi Operasional Lapangan & Instalasi",
        position: formData.position,
        employeeCategory: formData.employeeCategory,
        contractType: formData.contractType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        durationMonths: Number(formData.durationMonths || 1),
        salaryScheme,
        allowances: {
          transportMethod: formData.transportMethod,
          transportAmount: Number(formData.transportAmount || 0),
          mealMethod: formData.mealMethod,
          mealAmount: Number(formData.mealAmount || 0),
        },
        leavePolicy: {
          annualLeaveDays: Number(formData.annualLeaveDays || 12),
          paidPermissionDays: Number(formData.paidPermissionDays || 3),
          sickLeavePaid: !!formData.sickLeavePaid,
          requiresDoctorCertificate: !!formData.requiresDoctorCertificate,
          unpaidLeaveDeduction: formData.unpaidLeaveDeduction || "PRORATE_DAILY",
          specialLeaveNotes: formData.specialLeaveNotes || "",
        },
        workLocation: formData.workLocation,
        workSchedule: {
          workDaysType: formData.workDaysType || "5_DAYS",
          workDaysText: formData.workDaysText || "Senin s.d. Jumat (5 Hari Kerja)",
          dailyWorkingHours: Number(formData.dailyWorkingHours || 8),
          weeklyWorkingHours: Number(formData.weeklyWorkingHours || 40),
          startTime: formData.startTime || "08:00",
          endTime: formData.endTime || "17:00",
          breakStartTime: formData.breakStartTime || "12:00",
          breakEndTime: formData.breakEndTime || "13:00",
          notes: formData.scheduleNotes || "Istirahat siang 1 jam (khusus Jumat 11:30 - 13:00 WIB untuk ibadah Sholat Jumat).",
        },
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

        {/* Status & Department Filter Sub-bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
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

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Divisi:
            </span>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Divisi & Unit Kerja</option>
              {OFFICIAL_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
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
                      {/* Nomor & Karyawan (dengan Pas Foto & Tombol KTP) */}
                      <td className="py-4 px-5">
                        <div className="flex items-start gap-3">
                          {/* Pas Foto Avatar */}
                          <div className="relative shrink-0 mt-0.5">
                            {item.photoUrl ? (
                              <img
                                src={item.photoUrl}
                                alt={item.employeeName}
                                className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 shadow-xs"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs border-2 border-slate-100">
                                {item.employeeName
                                  ? item.employeeName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .slice(0, 2)
                                      .join("")
                                      .toUpperCase()
                                  : "EM"}
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 inline-block">
                              {item.contractNumber}
                            </span>
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                              {item.employeeName}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                              {item.employeeNik && <span>NIK: {item.employeeNik}</span>}
                              {item.employeePhone && <span>WA: {item.employeePhone}</span>}
                              
                              {/* Tombol Cepat Lihat KTP */}
                              {item.idCardUrl && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewKtpModal({
                                      isOpen: true,
                                      employeeName: item.employeeName,
                                      idCardUrl: item.idCardUrl!,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                                  title="Pratinjau Foto KTP / Identitas"
                                >
                                  <ZoomIn className="w-3 h-3 text-indigo-600" /> KTP
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori, Divisi & Jabatan */}
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
                          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100/70 w-fit">
                            <Layers className="w-3 h-3 text-blue-500" />
                            <span>
                              {item.department ||
                                (item.employeeCategory === "STAFF"
                                  ? "Divisi Keuangan & Administrasi"
                                  : "Divisi Operasional Lapangan & Instalasi")}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{item.workLocation}</p>
                        </div>
                      </td>

                      {/* Skema Pembayaran */}
                      <td className="py-4 px-4">
                        {daily?.dailyRateType === "TYPE_3_MONTHLY_FULL" || item.employeeCategory === "STAFF" || item.contractType === "MONTHLY" || item.contractType === "YEARLY" ? (
                          <div className="space-y-1 bg-sky-50/70 p-2.5 rounded-xl border border-sky-100/90">
                            <span className="px-1.5 py-0.5 bg-sky-200 text-sky-900 rounded font-black text-[9px] uppercase">
                              Tipe 3: Bulanan Penuh
                            </span>
                            <p className="text-sm font-black text-sky-950">
                              Rp {(daily?.monthlyBaseSalary || staff?.baseSalary || 0).toLocaleString("id-ID")}{" "}
                              <span className="text-[10px] font-normal text-sky-700">/ bulan</span>
                            </p>
                            <p className="text-[10px] text-sky-700">
                              Tunjangan: Rp {((daily?.positionAllowance || staff?.positionAllowance || 0) + (daily?.transportAllowance || staff?.transportAllowance || 0)).toLocaleString("id-ID")}
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
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-500" /> 1. Data Pribadi Karyawan & Berkas Identitas
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Wajib Dilengkapi
                  </span>
                </div>

                {/* AREA UPLOAD FOTO DIRI & KTP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  {/* Upload 1: Pas Foto Diri (3x4) */}
                  <div className="flex items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="relative shrink-0">
                      {formData.photoUrl ? (
                        <div className="relative group">
                          <img
                            src={formData.photoUrl}
                            alt="Pas Foto Karyawan"
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, photoUrl: "" }))}
                            className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition-colors shadow-xs"
                            title="Hapus Pas Foto"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-dashed border-blue-300 flex flex-col items-center justify-center text-blue-500">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">Pas Foto Karyawan</p>
                      <p className="text-[10px] text-slate-500">
                        Format JPG/PNG, ukuran 3x4 atau formal untuk profil & ID Card.
                      </p>
                      <input
                        type="file"
                        ref={photoInputRef}
                        onChange={handleUploadPhoto}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingPhoto}
                        onClick={() => photoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingPhoto ? "Mengunggah..." : formData.photoUrl ? "Ganti Pas Foto" : "Unggah Pas Foto"}
                      </button>
                    </div>
                  </div>

                  {/* Upload 2: Foto KTP / Identitas */}
                  <div className="flex items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="relative shrink-0">
                      {formData.idCardUrl ? (
                        <div className="relative group">
                          <img
                            src={formData.idCardUrl}
                            alt="Foto KTP Karyawan"
                            className="w-20 h-14 rounded-lg object-cover border-2 border-emerald-500 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, idCardUrl: "" }))}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition-colors shadow-xs"
                            title="Hapus KTP"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-14 rounded-lg bg-emerald-50 border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-emerald-600">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">Foto KTP / Identitas</p>
                      <p className="text-[10px] text-slate-500">
                        Foto e-KTP / SIM yang terbaca jelas untuk verifikasi kepegawaian.
                      </p>
                      <input
                        type="file"
                        ref={idCardInputRef}
                        onChange={handleUploadIdCard}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingIdCard}
                        onClick={() => idCardInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingIdCard ? "Mengunggah..." : formData.idCardUrl ? "Ganti Foto KTP" : "Unggah KTP / Paspor"}
                      </button>
                    </div>
                  </div>
                </div>

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

              {/* BAGIAN 2: PENEMPATAN & JABATAN KARYAWAN */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-500" /> 2. Jabatan & Masa Kontrak Karyawan
                  </h3>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    Standar Penggajian DSTech
                  </span>
                </div>

                {/* 2. Pilihan Jabatan Resmi & Standar Divisi */}
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
                            department: preset.department || formData.department,
                            payrollSchemeType: preset.payrollScheme,
                            employeeCategory: preset.category,
                            contractType: preset.contractType,
                            dailyRate: preset.dailyRate ?? formData.dailyRate,
                            overtimeHourlyRate: preset.overtimeHourlyRate ?? formData.overtimeHourlyRate,
                            baseSalary: preset.baseSalary ?? formData.baseSalary,
                            positionAllowance: preset.positionAllowance ?? formData.positionAllowance,
                            transportAllowance: preset.transportAllowance ?? formData.transportAllowance,
                            mealAllowance: preset.mealAllowance ?? formData.mealAllowance,
                            transportMethod: preset.transportMethod ?? formData.transportMethod,
                            transportAmount: preset.transportAmount ?? formData.transportAmount,
                            mealMethod: preset.mealMethod ?? formData.mealMethod,
                            mealAmount: preset.mealAmount ?? formData.mealAmount,
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
                      Memilih jabatan otomatis mengisi nama posisi, divisi, kategori, dan acuan tarif.
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

                {/* Pengaturan Divisi, Kategori & Tipe Kontrak */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-500" /> Divisi / Unit Kerja <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      {OFFICIAL_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Kategori Karyawan
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
                          department:
                            cat === "STAFF"
                              ? "Divisi Keuangan & Administrasi"
                              : "Divisi Operasional Lapangan & Instalasi",
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
                      Tipe Masa Kontrak <span className="text-rose-500">*</span>
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
                </div>

                {/* Pengaturan Durasi Kontrak & Auto-Calculate Tanggal Berakhir */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" /> Durasi & Masa Berlaku Kontrak
                    </span>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                      ✨ Auto-Calculate Tanggal Berakhir
                    </span>
                  </div>

                  {/* Preset Cepat Durasi Kontrak */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                      Pilihan Cepat Durasi Kontrak (Bulan / Tahun):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "1 Bulan", months: 1 },
                        { label: "3 Bulan (Standar)", months: 3 },
                        { label: "6 Bulan", months: 6 },
                        { label: "1 Tahun (12 Bln)", months: 12 },
                        { label: "2 Tahun (24 Bln)", months: 24 },
                      ].map((preset) => {
                        const isSelected = formData.durationMonths === preset.months;
                        return (
                          <button
                            type="button"
                            key={preset.months}
                            onClick={() => handleSelectDurationPreset(preset.months)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/30"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            ⚡ {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Input Tanggal Mulai, Durasi Bulan, dan Tanggal Berakhir */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Tanggal Mulai Kontrak <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          const newEnd =
                            formData.durationMonths > 0
                              ? calculateEndDateFromDuration(newStart, formData.durationMonths)
                              : formData.endDate;
                          setFormData({
                            ...formData,
                            startDate: newStart,
                            endDate: newEnd,
                          });
                        }}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Durasi Kontrak (Bulan) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.durationMonths}
                        onChange={(e) => {
                          const m = Math.max(1, Number(e.target.value) || 1);
                          const newEnd = calculateEndDateFromDuration(formData.startDate, m);
                          setFormData({
                            ...formData,
                            durationMonths: m,
                            contractType:
                              m >= 12
                                ? "YEARLY"
                                : formData.employeeCategory === "STAFF"
                                ? "MONTHLY"
                                : "DAILY",
                            endDate: newEnd,
                          });
                        }}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-bold text-blue-700"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Tanggal Berakhir Kontrak <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-blue-300 rounded-xl font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    💡 Tanggal berakhir otomatis dihitung berdasarkan Tanggal Mulai + Durasi (Dapat diedit manual jika ada ketentuan proyek khusus).
                  </p>
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

                {/* SUB-PANEL: JADWAL KERJA, HARI KERJA & JAM ISTIRAHAT */}
                <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/50 rounded-2xl border border-indigo-100/80 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Jadwal Hari Kerja, Jam Operasional & Waktu Istirahat
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Konfigurasi resmi yang mengikat secara hukum pada lembar cetak PKWT A4 (Pasal 3).
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                      PP No. 35/2021
                    </span>
                  </div>

                  {/* PILIHAN MODE HARI KERJA (3 KARTU) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {/* 5 HARI */}
                    <div
                      onClick={() => {
                        setFormData({
                          ...formData,
                          workDaysType: "5_DAYS",
                          workDaysText: "Senin s.d. Jumat (5 Hari Kerja)",
                          dailyWorkingHours: 8,
                          weeklyWorkingHours: 40,
                          startTime: "08:00",
                          endTime: "17:00",
                          breakStartTime: "12:00",
                          breakEndTime: "13:00",
                        });
                      }}
                      className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
                        formData.workDaysType === "5_DAYS"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black">5 Hari Kerja</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          formData.workDaysType === "5_DAYS" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}>Senin - Jumat</span>
                      </div>
                      <p className={`text-[10px] leading-tight ${formData.workDaysType === "5_DAYS" ? "text-indigo-100" : "text-slate-500"}`}>
                        08:00 - 17:00 WIB (8 jam/hari, istirahat 1 jam). Ideal untuk Staf & Office.
                      </p>
                    </div>

                    {/* 6 HARI */}
                    <div
                      onClick={() => {
                        setFormData({
                          ...formData,
                          workDaysType: "6_DAYS",
                          workDaysText: "Senin s.d. Sabtu (6 Hari Kerja)",
                          dailyWorkingHours: 8,
                          weeklyWorkingHours: 40,
                          startTime: "08:00",
                          endTime: "17:00",
                          breakStartTime: "12:00",
                          breakEndTime: "13:00",
                        });
                      }}
                      className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
                        formData.workDaysType === "6_DAYS"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black">6 Hari Kerja</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          formData.workDaysType === "6_DAYS" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}>Senin - Sabtu</span>
                      </div>
                      <p className={`text-[10px] leading-tight ${formData.workDaysType === "6_DAYS" ? "text-indigo-100" : "text-slate-500"}`}>
                        08:00 - 17:00 WIB (8 jam/hari, istirahat 1 jam). Operasional teknisi reguler.
                      </p>
                    </div>

                    {/* FLEKSIBEL PROYEK */}
                    <div
                      onClick={() => {
                        setFormData({
                          ...formData,
                          workDaysType: "FLEXIBLE_PROJECT",
                          workDaysText: "Fleksibel Proyek Lapangan (Sesuai SPK)",
                          dailyWorkingHours: 8,
                          weeklyWorkingHours: 40,
                          startTime: "08:00",
                          endTime: "17:00",
                          breakStartTime: "12:00",
                          breakEndTime: "13:00",
                        });
                      }}
                      className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
                        formData.workDaysType === "FLEXIBLE_PROJECT"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black">Fleksibel Proyek</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          formData.workDaysType === "FLEXIBLE_PROJECT" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}>Sesuai SPK</span>
                      </div>
                      <p className={`text-[10px] leading-tight ${formData.workDaysType === "FLEXIBLE_PROJECT" ? "text-indigo-100" : "text-slate-500"}`}>
                        Jadwal menyesuaikan jadwal shift & target Surat Perintah Kerja lapangan.
                      </p>
                    </div>
                  </div>

                  {/* INPUT FORM DETAIL JAM KERJA & ISTIRAHAT */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-indigo-100">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Jam Masuk Kerja <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Jam Pulang Kerja <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Mulai Istirahat Siang
                      </label>
                      <input
                        type="time"
                        value={formData.breakStartTime}
                        onChange={(e) => setFormData({ ...formData, breakStartTime: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Selesai Istirahat Siang
                      </label>
                      <input
                        type="time"
                        value={formData.breakEndTime}
                        onChange={(e) => setFormData({ ...formData, breakEndTime: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Keterangan Hari Kerja
                      </label>
                      <input
                        type="text"
                        value={formData.workDaysText}
                        onChange={(e) => setFormData({ ...formData, workDaysText: e.target.value })}
                        placeholder="Contoh: Senin s.d. Jumat (5 Hari Kerja)"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Durasi Kerja Harian
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={formData.dailyWorkingHours}
                          onChange={(e) => setFormData({ ...formData, dailyWorkingHours: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                        />
                        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Jam / Hari</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Maksimal Jam Mingguan
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={formData.weeklyWorkingHours}
                          onChange={(e) => setFormData({ ...formData, weeklyWorkingHours: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                        />
                        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Jam / Minggu</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Catatan Waktu Istirahat & Kebijakan Khusus
                    </label>
                    <input
                      type="text"
                      value={formData.scheduleNotes}
                      onChange={(e) => setFormData({ ...formData, scheduleNotes: e.target.value })}
                      placeholder="Contoh: Istirahat siang 1 jam (khusus Jumat pukul 11:30 - 13:00 WIB untuk ibadah Sholat Jumat)."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 3: SKEMA PEMBAYARAN & UPAH */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> 3. Rincian Tipe Skema Upah & Sistem Penggajian
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Pilih 1 dari 3 Tipe Upah
                  </span>
                </div>

                {/* 3 KARTU PILIHAN TIPE SEJAJAR */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Tipe 1: Harian Dibayar Penuh */}
                  <div
                    onClick={() => {
                      setFormData({
                        ...formData,
                        dailyRateType: "TYPE_1_FULL_DAY",
                        payrollSchemeType: "DAILY",
                        contractType: "DAILY",
                      });
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.dailyRateType === "TYPE_1_FULL_DAY"
                        ? "border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black uppercase text-amber-900 tracking-wide flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        Tipe 1: Harian Dibayar Penuh
                      </span>
                    </div>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 mb-2">
                      Flat Daily Rate
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Dibayar per hari kehadiran kerja (Helper Rp 150rb, Skill Rp 175rb, Senior Rp 200rb, Foreman Rp 225rb).
                    </p>
                  </div>

                  {/* Tipe 2: Bayaran Jam + Pengali Lembur */}
                  <div
                    onClick={() => {
                      setFormData({
                        ...formData,
                        dailyRateType: "TYPE_2_HOURLY",
                        payrollSchemeType: "DAILY",
                        contractType: "DAILY",
                      });
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.dailyRateType === "TYPE_2_HOURLY"
                        ? "border-indigo-500 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black uppercase text-indigo-900 tracking-wide flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                        Tipe 2: Bayaran Jam + Lembur
                      </span>
                    </div>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-200/80 text-indigo-900 mb-2">
                      Hourly Rate & Multiplier
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Dihitung per jam kerja efektif. Lembur menggunakan rumus pengali 1.5x (jam 1) dan 2.0x (jam 2+).
                    </p>
                  </div>

                  {/* Tipe 3: Bulanan Dibayar Penuh */}
                  <div
                    onClick={() => {
                      setFormData({
                        ...formData,
                        dailyRateType: "TYPE_3_MONTHLY_FULL",
                        payrollSchemeType: "MONTHLY",
                        contractType: formData.durationMonths >= 12 ? "YEARLY" : "MONTHLY",
                      });
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.dailyRateType === "TYPE_3_MONTHLY_FULL" || (formData.payrollSchemeType === "MONTHLY" && formData.dailyRateType !== "TYPE_1_FULL_DAY" && formData.dailyRateType !== "TYPE_2_HOURLY")
                        ? "border-blue-500 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black uppercase text-blue-900 tracking-wide flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        Tipe 3: Bulanan Dibayar Penuh
                      </span>
                    </div>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-200/80 text-blue-900 mb-2">
                      Flat Monthly Salary
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Gaji pokok bulanan tetap dibayar penuh per bulan (tidak dikalikan absensi harian), plus tunjangan & lembur.
                    </p>
                  </div>
                </div>

                {/* FORM DETAIL PARAMETER SESUAI TIPE */}
                {/* 1. JIKA TIPE 1: HARIAN DIBAYAR PENUH */}
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

                {/* 2. JIKA TIPE 2: BAYARAN JAM + LEMBUR */}
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

                {/* 3. JIKA TIPE 3: BULANAN DIBAYAR PENUH */}
                {(formData.dailyRateType === "TYPE_3_MONTHLY_FULL" || (formData.payrollSchemeType === "MONTHLY" && formData.dailyRateType !== "TYPE_1_FULL_DAY" && formData.dailyRateType !== "TYPE_2_HOURLY")) && (
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-900 uppercase tracking-wider block">
                        Parameter Upah Tipe 3 (Bulanan Dibayar Penuh)
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                        Gaji Pokok Tetap Per Bulan
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Gaji Pokok (Rp/Bulan) <span className="text-rose-500">*</span></label>
                        <input
                          type="number"
                          required
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
                        <label className="text-xs font-bold text-slate-700 block mb-1">Potongan BPJS / PPh21 (Rp)</label>
                        <input
                          type="number"
                          value={formData.bpjsAllowance}
                          onChange={(e) => setFormData({ ...formData, bpjsAllowance: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Tarif Lembur Opsional (Rp/Jam)</label>
                        <input
                          type="number"
                          value={formData.overtimeHourlyRate}
                          onChange={(e) => setFormData({ ...formData, overtimeHourlyRate: Number(e.target.value) })}
                          placeholder="30000"
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-blue-200 rounded-xl font-bold"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-blue-800 bg-white/80 p-2.5 rounded-xl border border-blue-100 flex items-center gap-2">
                      <span>💡</span>
                      <span>
                        <strong>Catatan Tipe 3:</strong> Karyawan menerima Gaji Pokok tetap setiap periode gajian secara utuh tanpa dikalikan hari hadir harian di generator slip gaji, ditambah uang lembur jika ada surat perintah lembur.
                      </span>
                    </p>
                  </div>
                )}

                {/* SUB-SEKSI: TUNJANGAN TRANSPORTASI & UANG MAKAN (2 METODE: FULL BULANAN VS HARIAN HADIR) */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                        <Car className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          Tunjangan Transportasi & Uang Makan (2 Metode Fleksibel)
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Pilih metode pemberian: <strong>Full Bulanan</strong> (flat per bulan) atau <strong>Hitungan Per Hari Hadir</strong> (hanya dibayar jika masuk kerja).
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200 w-fit">
                      Berlaku Otomatis di Auto-Payroll
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* KARTU 1: TUNJANGAN TRANSPORTASI */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <Car className="w-4 h-4 text-amber-600" /> Tunjangan Transportasi
                        </label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {formData.transportMethod === "FULL_MONTHLY" ? "Pemberian Full" : "Hitungan Harian"}
                        </span>
                      </div>

                      {/* Pilihan 2 Metode Radio Pills */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              transportMethod: "FULL_MONTHLY",
                              transportAmount: formData.transportAmount < 100000 ? 400000 : formData.transportAmount,
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            formData.transportMethod === "FULL_MONTHLY"
                              ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                          }`}
                        >
                          <div className="text-[11px] font-black flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${formData.transportMethod === "FULL_MONTHLY" ? "bg-emerald-600" : "bg-slate-400"}`}></span>
                            1. Full Bulanan
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                            Dibayar penuh flat tanpa dipotong absensi
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              transportMethod: "DAILY_PRESENCE",
                              transportAmount: formData.transportAmount > 100000 ? 20000 : formData.transportAmount,
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            formData.transportMethod === "DAILY_PRESENCE"
                              ? "border-blue-500 bg-blue-50/80 text-blue-950 font-bold ring-2 ring-blue-500/20"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                          }`}
                        >
                          <div className="text-[11px] font-black flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${formData.transportMethod === "DAILY_PRESENCE" ? "bg-blue-600" : "bg-slate-400"}`}></span>
                            2. Hitungan Per Hari
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                            Hanya jika hadir (tidak masuk = tidak dapat)
                          </div>
                        </button>
                      </div>

                      {/* Input Nominal Transport */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Nominal Transportasi ({formData.transportMethod === "FULL_MONTHLY" ? "Rp / Bulan" : "Rp / Hari Hadir"})
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={formData.transportAmount}
                            onChange={(e) => setFormData({ ...formData, transportAmount: Number(e.target.value) })}
                            placeholder={formData.transportMethod === "FULL_MONTHLY" ? "400000" : "20000"}
                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                          />
                          <span className="absolute right-3.5 top-2.5 text-[11px] text-slate-400 font-bold">
                            {formData.transportMethod === "FULL_MONTHLY" ? "/ bln" : "/ hr hadir"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {formData.transportMethod === "FULL_MONTHLY"
                            ? `Tetap Rp ${Number(formData.transportAmount || 0).toLocaleString("id-ID")} / bulan`
                            : `Rp ${Number(formData.transportAmount || 0).toLocaleString("id-ID")} x 22 hari kerja ≈ Rp ${(Number(formData.transportAmount || 0) * 22).toLocaleString("id-ID")}`}
                        </span>
                      </div>
                    </div>

                    {/* KARTU 2: TUNJANGAN UANG MAKAN */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <Utensils className="w-4 h-4 text-rose-600" /> Tunjangan Uang Makan
                        </label>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {formData.mealMethod === "FULL_MONTHLY" ? "Pemberian Full" : "Hitungan Harian"}
                        </span>
                      </div>

                      {/* Pilihan 2 Metode Radio Pills */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              mealMethod: "FULL_MONTHLY",
                              mealAmount: formData.mealAmount < 100000 ? 500000 : formData.mealAmount,
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            formData.mealMethod === "FULL_MONTHLY"
                              ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                          }`}
                        >
                          <div className="text-[11px] font-black flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${formData.mealMethod === "FULL_MONTHLY" ? "bg-emerald-600" : "bg-slate-400"}`}></span>
                            1. Full Bulanan
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                            Dibayar penuh flat tanpa dipotong absensi
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              mealMethod: "DAILY_PRESENCE",
                              mealAmount: formData.mealAmount > 100000 ? 25000 : formData.mealAmount,
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            formData.mealMethod === "DAILY_PRESENCE"
                              ? "border-blue-500 bg-blue-50/80 text-blue-950 font-bold ring-2 ring-blue-500/20"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                          }`}
                        >
                          <div className="text-[11px] font-black flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${formData.mealMethod === "DAILY_PRESENCE" ? "bg-blue-600" : "bg-slate-400"}`}></span>
                            2. Hitungan Per Hari
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                            Hanya jika hadir (tidak masuk = tidak dapat)
                          </div>
                        </button>
                      </div>

                      {/* Input Nominal Uang Makan */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Nominal Uang Makan ({formData.mealMethod === "FULL_MONTHLY" ? "Rp / Bulan" : "Rp / Hari Hadir"})
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={formData.mealAmount}
                            onChange={(e) => setFormData({ ...formData, mealAmount: Number(e.target.value) })}
                            placeholder={formData.mealMethod === "FULL_MONTHLY" ? "500000" : "25000"}
                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                          />
                          <span className="absolute right-3.5 top-2.5 text-[11px] text-slate-400 font-bold">
                            {formData.mealMethod === "FULL_MONTHLY" ? "/ bln" : "/ hr hadir"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {formData.mealMethod === "FULL_MONTHLY"
                            ? `Tetap Rp ${Number(formData.mealAmount || 0).toLocaleString("id-ID")} / bulan`
                            : `Rp ${Number(formData.mealAmount || 0).toLocaleString("id-ID")} x 22 hari kerja ≈ Rp ${(Number(formData.mealAmount || 0) * 22).toLocaleString("id-ID")}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BANNER KALKULASI SIMULASI TAKE HOME PAY */}
                  <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-blue-900 font-medium">
                      <Calculator className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="font-bold">Estimasi Total Penerimaan Take Home Pay:</span>
                        <span className="text-[10px] text-blue-700 block">
                          {formData.dailyRateType === "TYPE_3_MONTHLY_FULL" || formData.payrollSchemeType === "MONTHLY"
                            ? `Gaji Pokok (Rp ${(formData.baseSalary || 0).toLocaleString("id-ID")}) + Tunj. Jabatan (${(formData.positionAllowance || 0).toLocaleString("id-ID")}) + Transport (${(formData.transportMethod === "FULL_MONTHLY" ? (formData.transportAmount || 0) : (formData.transportAmount || 0) * 22).toLocaleString("id-ID")}) + Makan (${(formData.mealMethod === "FULL_MONTHLY" ? (formData.mealAmount || 0) : (formData.mealAmount || 0) * 22).toLocaleString("id-ID")}) - BPJS (${(formData.bpjsAllowance || 0).toLocaleString("id-ID")})`
                            : formData.dailyRateType === "TYPE_1_FULL_DAY"
                            ? `Upah Harian 22 Hari (Rp ${((formData.dailyRate || 0) * 22).toLocaleString("id-ID")}) + Transport (${(formData.transportMethod === "FULL_MONTHLY" ? (formData.transportAmount || 0) : (formData.transportAmount || 0) * 22).toLocaleString("id-ID")}) + Makan (${(formData.mealMethod === "FULL_MONTHLY" ? (formData.mealAmount || 0) : (formData.mealAmount || 0) * 22).toLocaleString("id-ID")})`
                            : `Upah 8 Jam x 22 Hari (Rp ${((formData.hourlyRate || 0) * 8 * 22).toLocaleString("id-ID")}) + Transport & Makan`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-blue-700 uppercase font-black block">Total THP Bulanan</span>
                      <strong className="text-sm font-black text-blue-950">
                        Rp {Math.max(
                          0,
                          (formData.dailyRateType === "TYPE_3_MONTHLY_FULL" || formData.payrollSchemeType === "MONTHLY"
                            ? (formData.baseSalary || 0) + (formData.positionAllowance || 0) - (formData.bpjsAllowance || 0)
                            : formData.dailyRateType === "TYPE_1_FULL_DAY"
                            ? (formData.dailyRate || 0) * 22
                            : (formData.hourlyRate || 0) * 8 * 22) +
                            (formData.transportMethod === "FULL_MONTHLY" ? (formData.transportAmount || 0) : (formData.transportAmount || 0) * 22) +
                            (formData.mealMethod === "FULL_MONTHLY" ? (formData.mealAmount || 0) : (formData.mealAmount || 0) * 22)
                        ).toLocaleString("id-ID")}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* BAGIAN 4: HAK CUTI, IZIN & KEBIJAKAN SAKIT */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" /> 4. Hak Cuti Tahunan, Izin & Kebijakan Sakit
                </h3>

                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Hak Cuti Tahunan */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Hak Cuti Tahunan (Hari/Tahun)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={formData.annualLeaveDays}
                          onChange={(e) => setFormData({ ...formData, annualLeaveDays: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-emerald-300 rounded-xl font-bold text-slate-900"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">hari</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">Standar UU Ketenagakerjaan: 12 hari</span>
                    </div>

                    {/* Izin Khusus Berbayar */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Batas Izin Berbayar (Hari/Tahun)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="14"
                          value={formData.paidPermissionDays}
                          onChange={(e) => setFormData({ ...formData, paidPermissionDays: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-emerald-300 rounded-xl font-bold text-slate-900"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">hari</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">Keperluan penting/keluarga/menikah</span>
                    </div>

                    {/* Ketentuan Izin Tak Berbayar */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Aturan Izin Tak Berbayar / Mangkir
                      </label>
                      <select
                        value={formData.unpaidLeaveDeduction}
                        onChange={(e) => setFormData({ ...formData, unpaidLeaveDeduction: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-emerald-300 rounded-xl font-bold text-slate-900"
                      >
                        <option value="PRORATE_DAILY">Potong Upah Proporsional (Gaji/Hari Kerja)</option>
                        <option value="NONE">Tanpa Potongan (Kebijakan Pimpinan)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 mt-1 block">Dihitung otomatis saat auto-payroll</span>
                    </div>
                  </div>

                  {/* Kebijakan Sakit */}
                  <div className="pt-3 border-t border-emerald-200/60 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-emerald-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiresDoctorCertificate}
                        onChange={(e) => setFormData({ ...formData, requiresDoctorCertificate: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Wajib Lampirkan Surat Keterangan Dokter (SKD)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-emerald-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sickLeavePaid}
                        onChange={(e) => setFormData({ ...formData, sickLeavePaid: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Sakit dengan SKD: Upah Tetap Dibayar Penuh (100%)
                      </span>
                    </label>
                  </div>

                  {/* Catatan Khusus Cuti */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Catatan / Ketentuan Khusus Hak Cuti & Izin
                    </label>
                    <input
                      type="text"
                      value={formData.specialLeaveNotes}
                      onChange={(e) => setFormData({ ...formData, specialLeaveNotes: e.target.value })}
                      placeholder="Contoh: Pengajuan cuti diajukan paling lambat 3 hari sebelumnya melalui portal karyawan..."
                      className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 5: SINKRONISASI AKUN USER & DURASI AKSES */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-500" /> 5. Akun Login & Batas Waktu Akses
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
                    PASAL 3: HARI KERJA, WAKTU KERJA & ISTIRAHAT
                  </h4>
                  <p>
                    1. <strong>Hari Kerja Resmi:</strong> Hari kerja operasional bagi PIHAK KEDUA ditetapkan sebanyak <strong>{selectedContract.workSchedule?.workDaysText || (selectedContract.employeeCategory === "STAFF" ? "Senin s.d. Jumat (5 Hari Kerja)" : "Senin s.d. Sabtu (6 Hari Kerja)")}</strong>, atau disesuaikan dengan kebutuhan penugasan proyek lapangan resmi yang diatur dalam Surat Perintah Kerja (SPK).
                  </p>
                  <p>
                    2. <strong>Jam Kerja Operasional:</strong> Jam kerja normal dimulai pukul <strong>{selectedContract.workSchedule?.startTime || "08:00"} WIB</strong> sampai dengan pukul <strong>{selectedContract.workSchedule?.endTime || "17:00"} WIB</strong>, dengan waktu kerja efektif <strong>{selectedContract.workSchedule?.dailyWorkingHours || 8} (delapan) jam per hari</strong> dan maksimal <strong>{selectedContract.workSchedule?.weeklyWorkingHours || 40} (empat puluh) jam per minggu</strong> sesuai ketentuan Peraturan Pemerintah No. 35 Tahun 2021.
                  </p>
                  <p>
                    3. <strong>Waktu Istirahat:</strong> PIHAK KEDUA berhak atas waktu istirahat siang selama 1 (satu) jam, yaitu mulai pukul <strong>{selectedContract.workSchedule?.breakStartTime || "12:00"} WIB s.d. {selectedContract.workSchedule?.breakEndTime || "13:00"} WIB</strong> (khusus hari Jumat disesuaikan pukul 11:30 WIB s.d. 13:00 WIB untuk penunaian Ibadah Sholat Jumat). Sesuai ketentuan ketenagakerjaan, waktu istirahat tidak diperhitungkan sebagai jam kerja efektif.
                  </p>
                  <p>
                    4. <strong>Presensi Digital Berbasis Satelit & Kamera:</strong> PIHAK KEDUA wajib mencatatkan presensi Masuk dan Pulang secara mandiri melalui Aplikasi DSTech Smart yang divalidasi dengan koordinat satelit GPS dan foto kamera selfie wajah langsung secara realtime.
                  </p>
                  <p>
                    5. <strong>Kerja Lembur:</strong> Apabila operasional perusahaan atau penyelesaian proyek mendesak mengharuskan bekerja melebihi jam kerja harian normal, pekerjaan tersebut dikategorikan sebagai Kerja Lembur atas persetujuan/perintah tertulis PIHAK PERTAMA dan diperhitungkan kompensasi lemburnya sesuai ketentuan Pasal 4 perjanjian ini.
                  </p>
                </div>

                {/* PASAL 4: UPAH & KOMPENSASI */}
                <div>
                  <h4 className="font-bold font-sans text-center text-slate-900 mb-1">
                    PASAL 4: SISTEM UPAH & SKEMA PEMBAYARAN
                  </h4>
                  {selectedContract.employeeCategory === "STAFF" || selectedContract.contractType === "MONTHLY" || selectedContract.contractType === "YEARLY" || selectedContract.salaryScheme?.dailyScheme?.dailyRateType === "TYPE_3_MONTHLY_FULL" ? (
                    <div className="space-y-1">
                      <p>PIHAK KEDUA berhak menerima kompensasi upah bulanan dengan rincian sebagai berikut:</p>
                      <ul className="list-disc pl-6 space-y-0.5 font-sans text-[10px]">
                        <li>Gaji Pokok: <strong>Rp {(selectedContract.salaryScheme?.dailyScheme?.monthlyBaseSalary || selectedContract.salaryScheme?.staffScheme?.baseSalary || 0).toLocaleString("id-ID")}</strong> / bulan.</li>
                        <li>Tunjangan Jabatan: Rp {(selectedContract.salaryScheme?.dailyScheme?.positionAllowance || selectedContract.salaryScheme?.staffScheme?.positionAllowance || 0).toLocaleString("id-ID")}.</li>
                        <li>
                          Tunjangan Transportasi: <strong>Rp {(selectedContract.allowances?.transportAmount ?? selectedContract.salaryScheme?.staffScheme?.transportAllowance ?? 0).toLocaleString("id-ID")}</strong> {selectedContract.allowances?.transportMethod === "DAILY_PRESENCE" ? "(Metode Harian Hadir: dibayarkan per hari kehadiran kerja, tidak hadir = tidak diberikan)" : "(Metode Full Bulanan: dibayarkan penuh per bulan)"}.
                        </li>
                        <li>
                          Tunjangan Uang Makan: <strong>Rp {(selectedContract.allowances?.mealAmount ?? 0).toLocaleString("id-ID")}</strong> {selectedContract.allowances?.mealMethod === "DAILY_PRESENCE" ? "(Metode Harian Hadir: dibayarkan per hari kehadiran kerja, tidak hadir = tidak diberikan)" : "(Metode Full Bulanan: dibayarkan penuh per bulan)"}.
                        </li>
                        <li>Potongan BPJS / PPh21: Rp {(selectedContract.salaryScheme?.dailyScheme?.bpjsAllowance || selectedContract.salaryScheme?.staffScheme?.bpjsAllowance || 0).toLocaleString("id-ID")}.</li>
                        {selectedContract.salaryScheme?.dailyScheme?.overtimeHourlyRate ? (
                          <li>Tarif Upah Lembur: Rp {(selectedContract.salaryScheme.dailyScheme.overtimeHourlyRate).toLocaleString("id-ID")} / jam (jika ada surat perintah lembur).</li>
                        ) : null}
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
                          Tunjangan Transportasi: <strong>Rp {(selectedContract.allowances?.transportAmount || 0).toLocaleString("id-ID")}</strong> {selectedContract.allowances?.transportMethod === "DAILY_PRESENCE" ? "(Metode Harian Hadir: dibayarkan per hari masuk kerja)" : "(Metode Full Bulanan)"}.
                        </li>
                        <li>
                          Tunjangan Uang Makan: <strong>Rp {(selectedContract.allowances?.mealAmount || 0).toLocaleString("id-ID")}</strong> {selectedContract.allowances?.mealMethod === "DAILY_PRESENCE" ? "(Metode Harian Hadir: dibayarkan per hari masuk kerja)" : "(Metode Full Bulanan)"}.
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
                          Tunjangan Transportasi: <strong>Rp {(selectedContract.allowances?.transportAmount || 0).toLocaleString("id-ID")}</strong> {selectedContract.allowances?.transportMethod === "DAILY_PRESENCE" ? "/ hari kehadiran" : "/ bulan"}.
                        </li>
                        <li>
                          Tunjangan Uang Makan: <strong>Rp {(selectedContract.allowances?.mealAmount || 0).toLocaleString("id-ID")}</strong> {selectedContract.allowances?.mealMethod === "DAILY_PRESENCE" ? "/ hari kehadiran" : "/ bulan"}.
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
                    PASAL 5: HAK CUTI, IZIN, DAN KETENTUAN SAKIT
                  </h4>
                  <p>
                    1. <strong>Hak Cuti Tahunan:</strong> PIHAK KEDUA berhak atas cuti tahunan sebanyak <strong>{selectedContract.leavePolicy?.annualLeaveDays || 12} (dua belas) hari kerja</strong> per tahun (dihitung proporsional sesuai masa kerja berjalan) dengan permohonan melalui sistem aplikasi DSTech Smart paling lambat 3 (tiga) hari kerja sebelumnya.
                  </p>
                  <p>
                    2. <strong>Izin Khusus Berbayar:</strong> Diberikan dispensasi izin berbayar penuh maksimal <strong>{selectedContract.leavePolicy?.paidPermissionDays || 3} hari kerja</strong> untuk keperluan penting/keluarga inti. Di luar kuota tersebut, ketidakhadiran diperhitungkan sebagai izin tidak berbayar dengan pemotongan upah harian secara proporsional.
                  </p>
                  <p>
                    3. <strong>Ketentuan Sakit:</strong> Apabila PIHAK KEDUA berhalangan bekerja dikarenakan sakit, wajib melampirkan Surat Keterangan Sakit resmi dari Dokter/Fasilitas Pelayanan Kesehatan. {selectedContract.leavePolicy?.sickLeavePaid !== false ? "Sakit yang disertai Surat Keterangan Dokter yang sah tetap menerima upah penuh (100%)." : "Sakit disesuaikan dengan regulasi upah berjalan."} Ketidakhadiran tanpa surat dokter dihitung sebagai mangkir kerja.
                  </p>
                </div>

                {/* PASAL 6 */}
                <div>
                  <h4 className="font-bold font-sans text-center text-slate-900 mb-1">
                    PASAL 6: KERAHASIAAN & TATA TERTIB
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

      {/* MODAL LIGHTBOX: PRATINJAU KTP / IDENTITAS */}
      {previewKtpModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Dokumen e-KTP / Identitas Resmi
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Atas nama: <strong className="text-slate-800">{previewKtpModal.employeeName}</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {previewKtpModal.idCardUrl && (
                  <a
                    href={previewKtpModal.idCardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Buka Foto Asli di Tab Baru"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setPreviewKtpModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Gambar KTP Full Size */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center min-h-[300px] max-h-[70vh] border border-slate-200">
              {previewKtpModal.idCardUrl ? (
                <img
                  src={previewKtpModal.idCardUrl}
                  alt={`KTP ${previewKtpModal.employeeName}`}
                  className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg"
                />
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                  <p className="text-xs">Foto KTP belum diunggah untuk karyawan ini.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Arsip verifikasi tenaga kerja PT. DSTech Smart Perkasa</span>
              <button
                type="button"
                onClick={() => setPreviewKtpModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors"
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
