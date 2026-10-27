"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import GpsGeofenceManager from "@/components/GpsGeofenceManager";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  MapPin,
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
  PhoneCall,
  HardHat,
  ArrowRight,
  Eye,
  Sliders,
  Filter,
  CheckSquare,
  Sparkles,
  HelpCircle,
  X,
  Send,
  Building,
  Briefcase,
  AlertCircle,
  ListTodo,
  Camera,
  Layers,
  Upload,
  Navigation,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  FileSpreadsheet,
  Award,
  DollarSign,
  CreditCard,
  Download,
  Check,
  Compass,
  HeartPulse,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  employeeName: string;
  checkIn: string;
  checkOut: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  mapsUrl?: string | null;
  selfieCheckIn?: string | null;
  status: string;
  notes?: string;
  checkOutLocation?: string;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkOutAccuracy?: number | null;
  checkOutMapsUrl?: string | null;
  selfieCheckOut?: string | null;
  isGpsLocked?: boolean;
  distanceToOffice?: number | null;
  checkOutDistanceToOffice?: number | null;
  geofenceLock?: "ANY" | "OFFICE";
  projectId?: string | null;
  projectName?: string | null;
  projectRole?: string | null;
}

interface OvertimeRecord {
  id: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  taskTitle: string;
  reason: string;
  status: "Menunggu Persetujuan" | "Disetujui" | "Ditolak";
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

interface MonthlyStats {
  totalHours: number;
  overtimeHours: number;
  targetHours: number;
  presenceDays: number;
  absentDays: number;
}

interface SystemUser {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
}

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
  notes: string;
  approvedBy: string;
  approvedAt: string;
  recordedInCashFlow: boolean;
}

// Helper format Rupiah
const formatRupiah = (val: number) => {
  return "Rp " + Number(val || 0).toLocaleString("id-ID");
};

// Helper Terbilang Rupiah
function terbilangRupiah(n: number): string {
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
  n = Math.floor(Math.abs(n));
  if (n < 12) return bilangan[n];
  if (n < 20) return terbilangRupiah(n - 10) + " Belas";
  if (n < 100) return terbilangRupiah(Math.floor(n / 10)) + " Puluh " + terbilangRupiah(n % 10);
  if (n < 200) return "Seratus " + terbilangRupiah(n - 100);
  if (n < 1000) return terbilangRupiah(Math.floor(n / 100)) + " Ratus " + terbilangRupiah(n % 100);
  if (n < 2000) return "Seribu " + terbilangRupiah(n - 1000);
  if (n < 1000000) return terbilangRupiah(Math.floor(n / 1000)) + " Ribu " + terbilangRupiah(n % 1000);
  if (n < 1000000000) return terbilangRupiah(Math.floor(n / 1000000)) + " Juta " + terbilangRupiah(n % 1000000);
  return terbilangRupiah(Math.floor(n / 1000000000)) + " Miliar " + terbilangRupiah(n % 1000000000);
}

export default function AdminAttendancePage() {
  // Data states
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [overtimeList, setOvertimeList] = useState<OvertimeRecord[]>([]);
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalHours: 168,
    overtimeHours: 14,
    targetHours: 160,
    presenceDays: 22,
    absentDays: 0,
  });
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [contractsList, setContractsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<"attendance" | "overtime" | "payroll" | "summary" | "leave" | "geofence">("attendance");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterProject, setFilterProject] = useState("ALL");
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Modal Catat Cuti / Izin / Sakit dari Admin
  const [leaveRecordModal, setLeaveRecordModal] = useState<{
    isOpen: boolean;
    employeeName: string;
    type: "Cuti" | "Izin" | "Sakit";
    startDate: string;
    endDate: string;
    notes: string;
    hasDoctorNote: boolean;
  }>({
    isOpen: false,
    employeeName: "",
    type: "Cuti",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    notes: "",
    hasDoctorNote: false,
  });

  // Data State Manajemen Cuti & Izin (Tugas 232 / 109)
  const [leaveRequestsList, setLeaveRequestsList] = useState<any[]>([]);
  const [employeeLeaveQuotas, setEmployeeLeaveQuotas] = useState<any[]>([]);
  const [leaveActionLoading, setLeaveActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    leaveId: string;
    employeeName: string;
    typeLabel: string;
    reason: string;
  }>({
    isOpen: false,
    leaveId: "",
    employeeName: "",
    typeLabel: "",
    reason: "",
  });

  // Current logged in Superadmin info
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string }>({
    name: "Super Admin DStech",
    role: "SUPERADMIN",
  });
  const [isSelfCheckingIn, setIsSelfCheckingIn] = useState(false);

  // Kamera WebRTC Presensi Mandiri Admin / Superadmin
  const [isSelfCameraModalOpen, setIsSelfCameraModalOpen] = useState(false);
  const [selfCameraMode, setSelfCameraMode] = useState<"checkin" | "checkout">("checkin");
  const [selfCameraStream, setSelfCameraStream] = useState<MediaStream | null>(null);
  const [isSelfCameraLoading, setIsSelfCameraLoading] = useState(false);
  const [selfCameraFacing, setSelfCameraFacing] = useState<"user" | "environment">("user");
  const [selfCameraError, setSelfCameraError] = useState<string | null>(null);
  const [selfSelfiePhoto, setSelfSelfiePhoto] = useState<string | null>(null);
  const selfVideoRef = useRef<HTMLVideoElement | null>(null);
  const selfCameraStreamRef = useRef<MediaStream | null>(null);
  const adminNativeSelfCameraRef = useRef<HTMLInputElement | null>(null);
  const [selfGpsCoords, setSelfGpsCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [selfGpsLocation, setSelfGpsLocation] = useState<string>("Mendeteksi lokasi satelit...");
  const [isSelfDetectingGps, setIsSelfDetectingGps] = useState(false);
  const [selfGpsError, setSelfGpsError] = useState<string | null>(null);

  // Hook auto-mount stream ke elemen video
  useEffect(() => {
    if (isSelfCameraModalOpen && selfCameraStream && selfVideoRef.current) {
      const vid = selfVideoRef.current;
      vid.srcObject = selfCameraStream;
      vid.muted = true;
      vid.playsInline = true;
      vid.setAttribute("playsinline", "true");
      vid.setAttribute("webkit-playsinline", "true");
      vid.onloadedmetadata = () => {
        vid.play().catch((e) => console.log("Auto-play error:", e));
      };
    }
  }, [isSelfCameraModalOpen, selfCameraStream]);

  // Handler Native Camera Capture Admin
  const handleAdminNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelfSelfiePhoto(dataUrl);
        stopSelfCamera();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Modal States
  const [gpsModal, setGpsModal] = useState<{
    isOpen: boolean;
    title: string;
    employeeName: string;
    timeStr: string;
    locationName: string;
    lat: number | null;
    lng: number | null;
    accuracy?: number | null;
    mapsUrl?: string | null;
    selfiePhoto?: string | null;
  }>({
    isOpen: false,
    title: "",
    employeeName: "",
    timeStr: "",
    locationName: "",
    lat: null,
    lng: null,
    selfiePhoto: null,
  });

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    id?: string;
    employeeName: string;
    date: string;
    checkIn: string;
    checkOut: string;
    location: string;
    status: string;
    notes: string;
    latitude: string;
    longitude: string;
  }>({
    isOpen: false,
    isEdit: false,
    employeeName: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "08:00 WIB",
    checkOut: "17:00 WIB",
    location: "Kantor DSTech Smart Perkasa (Cilegon)",
    status: "Tepat Waktu",
    notes: "",
    latitude: "",
    longitude: "",
  });

  const [overtimeModal, setOvertimeModal] = useState<{
    isOpen: boolean;
    record: OvertimeRecord | null;
    actionType: "approve" | "reject";
    rejectionReason: string;
  }>({
    isOpen: false,
    record: null,
    actionType: "approve",
    rejectionReason: "",
  });

  // Payroll Form & Print Modal
  const [payrollFormModal, setPayrollFormModal] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    id?: string;
    slipNumber?: string;
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
    bonusProject: number;
    bonusPerformance: number;
    bpjsDeduction: number;
    loanDeduction: number;
    otherDeduction: number;
    paymentMethod: string;
    status: "Draft" | "Disetujui" | "Dibayarkan";
    notes: string;
    recordInCashFlow: boolean;
  }>({
    isOpen: false,
    isEdit: false,
    month: new Date().toISOString().slice(0, 7),
    paymentDate: new Date().toISOString().split("T")[0],
    employeeName: "",
    employeeRole: "Teknisi Lapangan",
    bankAccount: "Bank BCA DSTech",
    baseSalary: 4500000,
    presenceDays: 22,
    presenceRate: 50000,
    presenceAllowance: 1100000,
    overtimeHours: 0,
    overtimeRate: 30000,
    overtimePay: 0,
    positionAllowance: 500000,
    transportAllowance: 400000,
    bonusProject: 500000,
    bonusPerformance: 250000,
    bpjsDeduction: 150000,
    loanDeduction: 0,
    otherDeduction: 0,
    paymentMethod: "Transfer Bank BCA",
    status: "Draft",
    notes: "",
    recordInCashFlow: true,
  });

  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<PayrollRecord | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    type: "attendance" | "overtime" | "payroll";
    name: string;
  }>({
    isOpen: false,
    id: "",
    type: "attendance",
    name: "",
  });

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto hide toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Load user session from localStorage
  useEffect(() => {
    try {
      const adminAuth = localStorage.getItem("dstech_admin_auth");
      if (adminAuth) {
        const parsed = JSON.parse(adminAuth);
        if (parsed.name) {
          setCurrentUser({
            name: parsed.name,
            role: parsed.role || "SUPERADMIN",
          });
        }
      }
    } catch (e) {
      console.warn("Could not parse admin auth session");
    }
  }, []);

  // Load initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAtt, resUsers, resPayroll, resContracts, resFinance, resLeaves] = await Promise.all([
        fetch(`/api/employee/attendance?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
        }),
        fetch("/api/users"),
        fetch("/api/payroll"),
        fetch("/api/contracts"),
        fetch("/api/finance"),
        fetch(`/api/employee/leave?t=${Date.now()}`),
      ]);

      if (resAtt.ok) {
        const attData = await resAtt.json();
        if (attData.attendance) setAttendanceList(attData.attendance);
        if (attData.overtime) setOvertimeList(attData.overtime);
        if (attData.monthlyStats) setMonthlyStats(attData.monthlyStats);
      }

      if (resUsers.ok) {
        const uData = await resUsers.json();
        if (uData.users) setUsersList(uData.users);
      }

      if (resPayroll.ok) {
        const pData = await resPayroll.json();
        if (pData.payrolls) setPayrollList(pData.payrolls);
      }

      if (resContracts.ok) {
        const cData = await resContracts.json();
        if (cData.contracts) setContractsList(cData.contracts);
      }

      if (resFinance && resFinance.ok) {
        const finData = await resFinance.json();
        if (finData?.data?.projects && Array.isArray(finData.data.projects)) {
          setProjectsList(finData.data.projects);
        }
      }

      if (resLeaves && resLeaves.ok) {
        const lvData = await resLeaves.json();
        if (Array.isArray(lvData.leaves)) setLeaveRequestsList(lvData.leaves);
        if (Array.isArray(lvData.employeeQuotas)) setEmployeeLeaveQuotas(lvData.employeeQuotas);
      }
    } catch (err) {
      console.error("Gagal memuat data presensi & payroll:", err);
      setToastMsg({ type: "error", text: "Gagal terhubung ke server data" });
    } finally {
      setLoading(false);
    }
  };

  // Handler Approval & Penolakan Cuti (Tugas 232 / 109)
  const handleApproveLeave = async (id: string, empName: string, typeLabel: string) => {
    setLeaveActionLoading(id);
    try {
      const res = await fetch("/api/employee/leave", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "approve",
          reviewerName: currentUser.name || "RAMADHANI, ST",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg({ type: "success", text: `Pengajuan ${typeLabel} (${empName}) berhasil disetujui & otomatis dicatat ke presensi!` });
        fetchData();
      } else {
        setToastMsg({ type: "error", text: data.message || "Gagal menyetujui pengajuan" });
      }
    } catch (err) {
      setToastMsg({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setLeaveActionLoading(null);
    }
  };

  const handleConfirmRejectLeave = async () => {
    if (!rejectModal.leaveId) return;
    setLeaveActionLoading(rejectModal.leaveId);
    try {
      const res = await fetch("/api/employee/leave", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectModal.leaveId,
          action: "reject",
          reviewerName: currentUser.name || "RAMADHANI, ST",
          rejectionReason: rejectModal.reason.trim() || "Pengajuan belum dapat disetujui",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg({ type: "success", text: `Pengajuan ${rejectModal.typeLabel} (${rejectModal.employeeName}) telah ditolak.` });
        setRejectModal({ isOpen: false, leaveId: "", employeeName: "", typeLabel: "", reason: "" });
        fetchData();
      } else {
        setToastMsg({ type: "error", text: data.message || "Gagal menolak pengajuan" });
      }
    } catch (err) {
      setToastMsg({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setLeaveActionLoading(null);
    }
  };

  const pendingLeaveCount = useMemo(() => {
    return leaveRequestsList.filter((l) => l.status === "PENDING").length;
  }, [leaveRequestsList]);

  const approvedAnnualLeaveThisMonth = useMemo(() => {
    return leaveRequestsList.filter((l) => l.status === "APPROVED" && l.type === "ANNUAL_LEAVE").length;
  }, [leaveRequestsList]);

  const approvedSpecialPermissionThisMonth = useMemo(() => {
    return leaveRequestsList.filter((l) => l.status === "APPROVED" && l.type === "SPECIAL_PERMISSION").length;
  }, [leaveRequestsList]);

  const approvedSickLeaveThisMonth = useMemo(() => {
    return leaveRequestsList.filter((l) => l.status === "APPROVED" && l.type === "SICK_LEAVE").length;
  }, [leaveRequestsList]);

  useEffect(() => {
    fetchData();

    // Listener sinkronisasi absensi real-time
    const handleAttendanceSync = () => {
      fetchData();
    };

    window.addEventListener("dstech_attendance_updated", handleAttendanceSync);
    window.addEventListener("storage", (ev) => {
      if (ev.key === "dstech_last_attendance_sync") {
        fetchData();
      }
    });

    return () => {
      window.removeEventListener("dstech_attendance_updated", handleAttendanceSync);
    };
  }, []);

  // Distinct list of employees from attendance + system users
  const employeeOptions = useMemo(() => {
    const names = new Set<string>();
    attendanceList.forEach((a) => {
      if (a.employeeName) names.add(a.employeeName.trim());
    });
    usersList.forEach((u) => {
      if (u.role === "EMPLOYEE" || u.role === "ADMIN" || u.role === "SUPERADMIN") {
        names.add(u.name.trim());
      }
    });
    return Array.from(names).sort();
  }, [attendanceList, usersList]);

  // Check today's presence for current superadmin
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const myTodayAttendance = useMemo(() => {
    return attendanceList.find(
      (a) => a.date === todayStr && a.employeeName.toLowerCase().includes(currentUser.name.toLowerCase().split(" ")[0])
    );
  }, [attendanceList, todayStr, currentUser.name]);

  // Filtered attendance list
  const filteredAttendance = useMemo(() => {
    return attendanceList.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.employeeName?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q) || item.checkOutLocation?.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        const matchStatus = item.status?.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchNotes && !matchStatus) return false;
      }
      if (filterEmployee !== "ALL" && item.employeeName !== filterEmployee) {
        return false;
      }
      if (filterStatus !== "ALL" && item.status !== filterStatus) {
        return false;
      }
      if (filterProject !== "ALL") {
        const matchPrj = item.projectId === filterProject || item.projectName === filterProject;
        if (!matchPrj) return false;
      }
      if (filterMonth && filterMonth !== "ALL") {
        if (!item.date || !item.date.startsWith(filterMonth)) return false;
      }
      return true;
    });
  }, [attendanceList, searchQuery, filterEmployee, filterStatus, filterProject, filterMonth]);

  // Filtered payroll list
  const filteredPayroll = useMemo(() => {
    return payrollList.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.employeeName?.toLowerCase().includes(q);
        const matchSlip = item.slipNumber?.toLowerCase().includes(q);
        if (!matchName && !matchSlip) return false;
      }
      if (filterEmployee !== "ALL" && item.employeeName !== filterEmployee) {
        return false;
      }
      if (filterMonth && filterMonth !== "ALL") {
        if (item.month !== filterMonth) return false;
      }
      return true;
    });
  }, [payrollList, searchQuery, filterEmployee, filterMonth]);

  // Overtime filter
  const pendingOvertimeCount = useMemo(() => {
    return overtimeList.filter((o) => o.status === "Menunggu Persetujuan").length;
  }, [overtimeList]);

  // WebRTC Kamera Mandiri Admin & Superadmin Handlers
  const startSelfCamera = async (facing: "user" | "environment" = selfCameraFacing) => {
    try {
      setSelfCameraError(null);
      setIsSelfCameraLoading(true);

      if (selfCameraStreamRef.current) {
        selfCameraStreamRef.current.getTracks().forEach((track) => track.stop());
        selfCameraStreamRef.current = null;
        setSelfCameraStream(null);
      }

      // Helper MediaStream dengan multi-prefix support untuk Android WebView / Legacy Browser
      const requestMediaStream = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
        if (typeof window !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          return await navigator.mediaDevices.getUserMedia(constraints);
        }
        const legacyGUM =
          (navigator as any).webkitGetUserMedia ||
          (navigator as any).mozGetUserMedia ||
          (navigator as any).getUserMedia;
        if (legacyGUM) {
          return new Promise((resolve, reject) => {
            legacyGUM.call(navigator, constraints, resolve, reject);
          });
        }
        throw new Error("WebRTC tidak didukung di dalam aplikasi/browser ini. Silakan gunakan tombol '📸 Buka Kamera HP Langsung' di bawah.");
      };

      let stream: MediaStream | null = null;
      try {
        stream = await requestMediaStream({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      } catch (e1) {
        try {
          stream = await requestMediaStream({
            video: { facingMode: facing },
            audio: false,
          });
        } catch (e2) {
          try {
            stream = await requestMediaStream({
              video: true,
              audio: false,
            });
          } catch (e3) {
            throw e3;
          }
        }
      }

      if (stream) {
        selfCameraStreamRef.current = stream;
        setSelfCameraStream(stream);
        if (selfVideoRef.current) {
          const vid = selfVideoRef.current;
          vid.srcObject = stream;
          vid.muted = true;
          vid.playsInline = true;
          vid.setAttribute("playsinline", "true");
          vid.setAttribute("webkit-playsinline", "true");
          vid.play().catch(() => {});
        }
      }
    } catch (err: any) {
      console.error("Camera error admin attendance:", err);
      let msg = "Kamera live WebRTC tidak terhubung.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Izin kamera live dibatasi pada aplikasi ini. Silakan gunakan tombol '📸 Buka Kamera HP Langsung' di bawah.";
      } else if (err.name === "NotFoundError") {
        msg = "Sensor kamera tidak ditemukan pada perangkat Anda. Silakan gunakan tombol kamera HP di bawah.";
      } else if (err.message) {
        msg = err.message;
      }
      setSelfCameraError(msg);
    } finally {
      setIsSelfCameraLoading(false);
    }
  };

  const switchSelfCamera = () => {
    const nextFacing = selfCameraFacing === "user" ? "environment" : "user";
    setSelfCameraFacing(nextFacing);
    startSelfCamera(nextFacing);
  };

  const stopSelfCamera = () => {
    if (selfCameraStreamRef.current) {
      selfCameraStreamRef.current.getTracks().forEach((track) => track.stop());
      selfCameraStreamRef.current = null;
    }
    setSelfCameraStream(null);
    setIsSelfCameraLoading(false);
  };

  const takeSelfSnapshot = () => {
    if (!selfVideoRef.current) return;
    const video = selfVideoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (selfCameraFacing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.65);
    setSelfSelfiePhoto(dataUrl);
    stopSelfCamera();
  };

  const detectSelfGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setSelfGpsLocation("Kantor Pusat PT DSTech Smart Perkasa (Cilegon)");
      setSelfGpsCoords({ lat: -6.031846, lng: 106.037198, accuracy: 15 });
      return;
    }
    setIsSelfDetectingGps(true);
    setSelfGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsSelfDetectingGps(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setSelfGpsCoords({ lat: latitude, lng: longitude, accuracy: Math.round(accuracy) });
        setSelfGpsLocation(`Area Kantor (${latitude.toFixed(6)}, ${longitude.toFixed(6)}) - Akurasi ±${Math.round(accuracy)}m`);
      },
      (err) => {
        setIsSelfDetectingGps(false);
        console.warn("GPS error:", err);
        setSelfGpsError("GPS tidak terdeteksi, menggunakan koordinat kantor default.");
        setSelfGpsCoords({ lat: -6.031846, lng: 106.037198, accuracy: 20 });
        setSelfGpsLocation("Kantor Pusat PT DSTech Smart Perkasa (Cilegon)");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const openSelfAttendanceModal = (mode: "checkin" | "checkout") => {
    setSelfCameraMode(mode);
    setSelfSelfiePhoto(null);
    setSelfCameraError(null);
    setIsSelfCameraModalOpen(true);
    detectSelfGps();
    startSelfCamera("user");
  };

  const closeSelfAttendanceModal = () => {
    stopSelfCamera();
    setIsSelfCameraModalOpen(false);
    setSelfSelfiePhoto(null);
  };

  const handleConfirmSelfAttendance = async () => {
    if (!selfSelfiePhoto) {
      setToastMsg({ type: "error", text: "Wajib mengambil foto wajah via kamera langsung." });
      return;
    }
    setIsSelfCheckingIn(true);
    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

      const res = await fetch("/api/employee/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: selfCameraMode,
          employeeName: currentUser.name,
          location: selfGpsLocation,
          latitude: selfGpsCoords?.lat || -6.031846,
          longitude: selfGpsCoords?.lng || 106.037198,
          accuracy: selfGpsCoords?.accuracy || 10,
          mapsUrl: selfGpsCoords ? `https://www.google.com/maps?q=${selfGpsCoords.lat},${selfGpsCoords.lng}` : "https://www.google.com/maps?q=-6.031846,106.037198",
          selfieCheckIn: selfCameraMode === "checkin" ? selfSelfiePhoto : undefined,
          selfieCheckOut: selfCameraMode === "checkout" ? selfSelfiePhoto : undefined,
          notes: `Presensi mandiri ${selfCameraMode === "checkin" ? "masuk" : "pulang"} oleh ${currentUser.name} via Kelola Absensi (${timeStr})`,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        setToastMsg({
          type: "success",
          text: `✓ Presensi ${selfCameraMode === "checkin" ? "Masuk" : "Pulang"} (${currentUser.name}) berhasil diverifikasi!`,
        });
        closeSelfAttendanceModal();
        fetchData();
      } else {
        setToastMsg({ type: "error", text: resJson.error || "Gagal mencatat presensi" });
      }
    } catch (err) {
      console.error("Error self attendance:", err);
      setToastMsg({ type: "error", text: "Terjadi kesalahan sistem saat presensi" });
    } finally {
      setIsSelfCheckingIn(false);
    }
  };

  // Handle Export / Download CSV Laporan Absensi
  const handleDownloadCsv = () => {
    if (filteredAttendance.length === 0) {
      setToastMsg({ type: "error", text: "Tidak ada data absensi untuk diunduh" });
      return;
    }

    const headers = [
      "No",
      "Tanggal",
      "Hari",
      "Nama Karyawan",
      "Jam Masuk",
      "Lokasi Masuk",
      "Jam Pulang",
      "Lokasi Pulang",
      "Status Kehadiran",
      "Koordinat GPS",
      "Catatan Lapangan",
    ];

    const rows = filteredAttendance.map((item, idx) => {
      const dayName = new Date(item.date).toLocaleDateString("id-ID", { weekday: "long" });
      const gpsStr = item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : "-";
      return [
        idx + 1,
        `"${item.date}"`,
        `"${dayName}"`,
        `"${item.employeeName.replace(/"/g, '""')}"`,
        `"${item.checkIn || "-"}"`,
        `"${(item.location || "-").replace(/"/g, '""')}"`,
        `"${item.checkOut || "-"}"`,
        `"${(item.checkOutLocation || "-").replace(/"/g, '""')}"`,
        `"${item.status || "Hadir"}"`,
        `"${gpsStr}"`,
        `"${(item.notes || "-").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `LAPORAN_DETAIL_ABSENSI_DSTECH_${filterMonth || "SEMUA"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMsg({ type: "success", text: "Laporan detail absensi berhasil diunduh (.CSV Excel)!" });
  };

  // Handle Export / Download Summary CSV Rekap Bulanan
  const handleDownloadSummaryCsv = () => {
    if (employeeOptions.length === 0) {
      setToastMsg({ type: "error", text: "Tidak ada data karyawan untuk diunduh" });
      return;
    }

    const headers = [
      "No",
      "Nama Karyawan",
      "Jabatan / Posisi",
      "Total Hari Masuk",
      "Hadir di Kantor (Tepat Waktu)",
      "Hadir Lapangan (GPS Maps)",
      "Jam Lembur Sah (Jam)",
      "Persentase Disiplin (%)",
      "Status Evaluasi",
    ];

    const rows = employeeOptions.map((name, idx) => {
      const logs = attendanceList.filter(
        (a) => a.employeeName === name && (!filterMonth || filterMonth === "ALL" || a.date.startsWith(filterMonth))
      );
      const hadirCount = logs.length;
      const tepatWaktuCount = logs.filter((a) => a.status === "Tepat Waktu").length;
      const lapanganCount = logs.filter((a) => a.status === "Hadir Lapangan").length;
      const otLogs = overtimeList.filter(
        (o) =>
          o.employeeName === name &&
          o.status === "Disetujui" &&
          (!filterMonth || filterMonth === "ALL" || o.date.startsWith(filterMonth))
      );
      const totalOTHours = otLogs.reduce((acc, curr) => acc + (curr.hours || 0), 0);
      const disciplineRate = hadirCount > 0 ? Math.round(((tepatWaktuCount + lapanganCount) / hadirCount) * 100) : 100;
      const statusText = disciplineRate >= 95 ? "Sangat Baik" : disciplineRate >= 80 ? "Baik" : "Perlu Pembinaan";

      return [
        idx + 1,
        `"${name.replace(/"/g, '""')}"`,
        `"${name.toLowerCase().includes("admin") ? "Admin Operasional" : "Teknisi Lapangan"}"`,
        hadirCount,
        tepatWaktuCount,
        lapanganCount,
        totalOTHours,
        `"${disciplineRate}%"`,
        `"${statusText}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `REKAP_KEHADIRAN_KARYAWAN_DSTECH_${filterMonth || "SEMUA"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMsg({ type: "success", text: "Rekapitulasi absensi bulanan berhasil diunduh (.CSV Excel)!" });
  };

  // Open Payroll Calculator Form with Auto-fill from Attendance & Overtime
  const handleOpenAddPayroll = (empName?: string) => {
    const targetName = empName || employeeOptions[0] || "Teknisi Lapangan";
    const selectedMonth = filterMonth || new Date().toISOString().slice(0, 7);

    // Auto-calculate presence days from actual attendance records
    const attendanceLogs = attendanceList.filter(
      (a) => a.employeeName === targetName && a.date.startsWith(selectedMonth)
    );
    const autoPresenceDays = attendanceLogs.length > 0 ? attendanceLogs.length : 22;

    // Auto-calculate overtime hours from approved overtime
    const approvedOT = overtimeList.filter(
      (o) => o.employeeName === targetName && o.date.startsWith(selectedMonth) && o.status === "Disetujui"
    );
    const autoOTHours = approvedOT.reduce((acc, curr) => acc + (curr.hours || 0), 0);

    const standardPresenceRate = 50000;
    const standardOTRate = 30000;

    setPayrollFormModal({
      isOpen: true,
      isEdit: false,
      month: selectedMonth,
      paymentDate: new Date().toISOString().split("T")[0],
      employeeName: targetName,
      employeeRole: targetName.toLowerCase().includes("admin") ? "Admin Operasional" : "Teknisi Lapangan",
      bankAccount: "Bank BCA - a.n " + targetName,
      baseSalary: 4500000,
      presenceDays: autoPresenceDays,
      presenceRate: standardPresenceRate,
      presenceAllowance: autoPresenceDays * standardPresenceRate,
      overtimeHours: autoOTHours,
      overtimeRate: standardOTRate,
      overtimePay: autoOTHours * standardOTRate,
      positionAllowance: 500000,
      transportAllowance: 400000,
      bonusProject: 500000,
      bonusPerformance: 250000,
      bpjsDeduction: 150000,
      loanDeduction: 0,
      otherDeduction: 0,
      paymentMethod: "Transfer Bank BCA",
      status: "Draft",
      notes: `Perhitungan gaji periode ${selectedMonth} (${autoPresenceDays} hari kehadiran, ${autoOTHours} jam lembur sah)`,
      recordInCashFlow: true,
    });
  };

  // Handle Save Payroll Form
  const handleSavePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payrollFormModal.employeeName || !payrollFormModal.month) {
      setToastMsg({ type: "error", text: "Nama karyawan dan periode bulan wajib diisi" });
      return;
    }

    setSubmitting(true);
    try {
      if (payrollFormModal.isEdit && payrollFormModal.id) {
        // PUT
        const res = await fetch("/api/payroll", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payrollFormModal),
        });
        const resJson = await res.json();
        if (resJson.success) {
          setToastMsg({ type: "success", text: "Data penggajian berhasil diperbarui!" });
          setPayrollFormModal((prev) => ({ ...prev, isOpen: false }));
          fetchData();
        } else {
          setToastMsg({ type: "error", text: resJson.error || "Gagal memperbarui payroll" });
        }
      } else {
        // POST
        const res = await fetch("/api/payroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payrollFormModal),
        });
        const resJson = await res.json();
        if (resJson.success) {
          setToastMsg({ type: "success", text: `Slip gaji ${resJson.data?.slipNumber} berhasil diterbitkan!` });
          setPayrollFormModal((prev) => ({ ...prev, isOpen: false }));
          fetchData();
        } else {
          setToastMsg({ type: "error", text: resJson.error || "Gagal menerbitkan payroll" });
        }
      }
    } catch (err) {
      console.error("Error saving payroll:", err);
      setToastMsg({ type: "error", text: "Terjadi kesalahan saat menyimpan data penggajian" });
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Pay / Mark As Paid
  const handleMarkAsPaid = async (payroll: PayrollRecord) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/payroll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payroll.id,
          status: "Dibayarkan",
          recordInCashFlow: true,
          paymentDate: new Date().toISOString().split("T")[0],
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setToastMsg({
          type: "success",
          text: `Gaji ${payroll.employeeName} ditandai Lunas & otomatis dicatat di Buku Arus Kas ERP!`,
        });
        fetchData();
      } else {
        setToastMsg({ type: "error", text: resJson.error || "Gagal memproses pembayaran" });
      }
    } catch (err) {
      console.error("Error paying salary:", err);
      setToastMsg({ type: "error", text: "Gagal memperbarui status pembayaran" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Record Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setSubmitting(true);
    try {
      const endpoint =
        deleteModal.type === "payroll"
          ? `/api/payroll?id=${deleteModal.id}`
          : `/api/employee/attendance?id=${deleteModal.id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      const resJson = await res.json();
      if (resJson.success) {
        setToastMsg({ type: "success", text: "Data berhasil dihapus dari sistem" });
        setDeleteModal({ isOpen: false, id: "", type: "attendance", name: "" });
        fetchData();
      } else {
        setToastMsg({ type: "error", text: resJson.error || "Gagal menghapus data" });
      }
    } catch (err) {
      console.error("Error deleting record:", err);
      setToastMsg({ type: "error", text: "Terjadi kesalahan saat menghapus data" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handler simpan permohonan Cuti / Izin / Sakit dari admin
  const handleSaveLeaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveRecordModal.employeeName || !leaveRecordModal.startDate || !leaveRecordModal.endDate) {
      alert("Mohon pilih karyawan dan tentukan rentang tanggal!");
      return;
    }

    try {
      setSubmitting(true);
      const start = new Date(leaveRecordModal.startDate);
      const end = new Date(leaveRecordModal.endDate);
      const dates: string[] = [];
      const cur = new Date(start);
      while (cur <= end) {
        dates.push(cur.toISOString().split("T")[0]);
        cur.setDate(cur.getDate() + 1);
      }

      for (const d of dates) {
        const payload = {
          date: d,
          employeeName: leaveRecordModal.employeeName,
          checkIn: "-",
          checkOut: "-",
          location: "Dispensasi Izin/Cuti Resmi",
          status: leaveRecordModal.type,
          notes: `${leaveRecordModal.type}: ${leaveRecordModal.notes || "Pengajuan resmi"}${leaveRecordModal.hasDoctorNote ? " (Surat Keterangan Dokter Terlampir)" : ""}`,
        };
        await fetch("/api/employee/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setToastMsg({ type: "success", text: `Berhasil mencatat ${leaveRecordModal.type} untuk ${leaveRecordModal.employeeName} (${dates.length} hari)` });
      setLeaveRecordModal((prev) => ({ ...prev, isOpen: false }));
      fetchData();
    } catch (err) {
      console.error("Gagal mencatat cuti/izin:", err);
      setToastMsg({ type: "error", text: "Terjadi kesalahan saat menyimpan data cuti/izin" });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Tepat Waktu":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Tepat Waktu
          </span>
        );
      case "Hadir Lapangan":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            Hadir Lapangan
          </span>
        );
      case "Lembur":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Lembur
          </span>
        );
      case "Izin":
      case "Sakit":
      case "Cuti":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            {status}
          </span>
        );
      default:
        if (status && status.startsWith("Terlambat")) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-rose-600" />
              {status}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status || "Hadir"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold text-white transition-all transform animate-in slide-in-from-top duration-300 ${
            toastMsg.type === "success" ? "bg-emerald-600 shadow-emerald-600/30" : "bg-red-600 shadow-red-600/30"
          }`}
        >
          {toastMsg.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner & Superadmin Quick Attendance */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black tracking-wider uppercase border border-blue-400/20">
              <CalendarCheck className="w-3.5 h-3.5 text-blue-400" />
              Sistem Disiplin & Penggajian Terpadu
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Rekap Absensi, Overtime & Payroll Gaji
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Monitoring presensi GPS Google Maps, otorisasi jam lembur teknisi, serta kalkulator otomatis perhitungan gaji, upah lembur, bonus proyek & slip gaji resmi PT. DSTech Smart Perkasa.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              title="Unduh Laporan Format Excel/CSV"
            >
              <Download className="w-4 h-4" />
              <span>Unduh CSV / Excel</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs sm:text-sm font-bold backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-blue-300" />
              <span>Cetak Rekap A4</span>
            </button>

            <button
              onClick={() => handleOpenAddPayroll()}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Hitung Gaji & Slip Baru</span>
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              title="Segarkan Data"
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Superadmin Quick Self-Attendance Card */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">{currentUser.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/20">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {myTodayAttendance ? (
                  <span className="text-emerald-400 font-bold">
                    ✓ Sudah Masuk: {myTodayAttendance.checkIn} {myTodayAttendance.checkOut && myTodayAttendance.checkOut !== "-" ? `• Pulang: ${myTodayAttendance.checkOut}` : "• Belum Pulang"}
                  </span>
                ) : (
                  <span className="text-amber-300">Belum absen hari ini ({todayStr})</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => openSelfAttendanceModal("checkin")}
              disabled={isSelfCheckingIn}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Check-In Live Kamera</span>
            </button>

            <button
              type="button"
              onClick={() => openSelfAttendanceModal("checkout")}
              disabled={isSelfCheckingIn}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Check-Out Pulang</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("geofence")}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 border ${
                activeTab === "geofence"
                  ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
              }`}
            >
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>📍 Atur Titik GPS &amp; Toleransi</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Log Kehadiran</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {filteredAttendance.length} <span className="text-xs font-bold text-slate-400">Log</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
              Periode {filterMonth || "Semua"}
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hadir Lapangan / GPS</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {filteredAttendance.filter((a) => a.status === "Hadir Lapangan").length}{" "}
              <span className="text-xs font-bold text-slate-400">Hari</span>
            </h3>
            <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Terverifikasi Google Maps
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab("overtime")}
          className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer shadow-sm flex items-center justify-between group ${
            pendingOvertimeCount > 0
              ? "border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/20"
              : "border-slate-200/80 hover:border-amber-300"
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lembur Perlu Review</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 flex items-center gap-2">
              {pendingOvertimeCount}
              {pendingOvertimeCount > 0 && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700 animate-pulse">
                  Butuh Otorisasi
                </span>
              )}
            </h3>
            <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium group-hover:underline">
              <span>Klik untuk periksa lembur</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab("payroll")}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-orange-300 shadow-sm flex items-center justify-between cursor-pointer group transition-all"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Gaji & Overtime</p>
            <h3 className="text-xl sm:text-2xl font-black text-orange-600 mt-1">
              {formatRupiah(filteredPayroll.reduce((acc, curr) => acc + (curr.takeHomePay || 0), 0))}
            </h3>
            <p className="text-[11px] text-orange-700 mt-1 flex items-center gap-1 font-semibold group-hover:underline">
              <span>{filteredPayroll.length} Slip Gaji Diterbitkan</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-105 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-4 text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap relative ${
            activeTab === "attendance"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Riwayat Presensi & Geolocation</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-black">
            {filteredAttendance.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("overtime")}
          className={`pb-4 text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap relative ${
            activeTab === "overtime"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Pengajuan Lembur (Overtime)</span>
          {pendingOvertimeCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-black animate-pulse">
              {pendingOvertimeCount} Baru
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-black">
              {overtimeList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("payroll")}
          className={`pb-4 text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap relative ${
            activeTab === "payroll"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Kalkulator & Slip Gaji (Payroll)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800 font-black">
            {filteredPayroll.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-4 text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap relative ${
            activeTab === "summary"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Laporan & Rekapitulasi Absensi</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-black">
            Laporan
          </span>
        </button>

        <button
          onClick={() => setActiveTab("leave")}
          className={`pb-4 text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap relative ${
            activeTab === "leave"
              ? "text-teal-600 border-b-2 border-teal-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <HeartPulse className="w-4 h-4 text-teal-600" />
          <span>🏖️ Manajemen Cuti &amp; Izin</span>
          {pendingLeaveCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-800 font-black animate-pulse">
              {pendingLeaveCount} Baru
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-black">
              {leaveRequestsList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("geofence")}
          className={`pb-4 text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap relative ${
            activeTab === "geofence"
              ? "text-rose-600 border-b-2 border-rose-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>📍 Pengaturan Titik GPS &amp; Geofencing</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-800 font-black">
            Kantor &amp; Proyek
          </span>
        </button>
      </div>

      {/* TAB 1: RIWAYAT ABSENSI */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama karyawan, lokasi, atau catatan..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              >
                <option value="ALL">Semua Karyawan</option>
                {employeeOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              >
                <option value="ALL">Semua Status</option>
                <option value="Hadir Lapangan">Hadir Lapangan</option>
                <option value="Tepat Waktu">Tepat Waktu</option>
                <option value="Lembur">Lembur</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Cuti">Cuti</option>
              </select>

              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-indigo-50 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-indigo-900"
              >
                <option value="ALL">🏢 Semua Proyek (Umum)</option>
                {projectsList.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    [{p.projectCode}] {p.projectName} ({p.assignedEmployees?.length || 0} Tim)
                  </option>
                ))}
              </select>

              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              />

              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Unduh Spreadsheet (.CSV / Excel)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh CSV</span>
              </button>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Cetak & Simpan Laporan PDF Resmi A4"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>Cetak PDF</span>
              </button>
            </div>
          </div>

          {/* Table Attendance */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Tanggal & Waktu</th>
                    <th className="py-4 px-6">Karyawan / Teknisi</th>
                    <th className="py-4 px-6">Masuk (Check-In)</th>
                    <th className="py-4 px-6">Pulang (Check-Out)</th>
                    <th className="py-4 px-6">Status Kehadiran</th>
                    <th className="py-4 px-6">Laporan Lapangan</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        <span>Memuat data absensi karyawan...</span>
                      </td>
                    </tr>
                  ) : filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">
                        <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-600">Tidak ada catatan absensi yang sesuai filter</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{item.date}</p>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {new Date(item.date).toLocaleDateString("id-ID", { weekday: "long" })}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0">
                              {item.employeeName?.charAt(0) || "T"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.employeeName}</p>
                              {item.projectName ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-200 font-bold mt-0.5 max-w-[200px] truncate" title={`${item.projectName} - ${item.projectRole || ""}`}>
                                  <Briefcase className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                                  <span className="truncate">{item.projectName} {item.projectRole ? `(${item.projectRole})` : ""}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Staf / Non-Proyek</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-emerald-600 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                {item.checkIn || "-"}
                              </p>
                              {item.selfieCheckIn && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setGpsModal({
                                      isOpen: true,
                                      title: "Verifikasi Presensi & Wajah Masuk",
                                      employeeName: item.employeeName,
                                      timeStr: `${item.date} • ${item.checkIn}`,
                                      locationName: item.location,
                                      lat: item.latitude || null,
                                      lng: item.longitude || null,
                                      accuracy: item.accuracy,
                                      mapsUrl: item.mapsUrl,
                                      selfiePhoto: item.selfieCheckIn,
                                    })
                                  }
                                  className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm hover:scale-110 transition-transform cursor-pointer shrink-0"
                                  title="Lihat Foto Selfie Masuk"
                                >
                                  <img
                                    src={item.selfieCheckIn}
                                    alt="Foto Masuk"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{item.location || "Kantor DSTech Cilegon"}</span>
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {item.distanceToOffice !== undefined && item.distanceToOffice !== null ? (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  item.distanceToOffice <= 100
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  <Building className="w-2.5 h-2.5" />
                                  {item.distanceToOffice <= 100 ? `Kantor (${item.distanceToOffice}m)` : `Lapangan (${item.distanceToOffice >= 1000 ? (item.distanceToOffice/1000).toFixed(1) + "km" : item.distanceToOffice + "m"})`}
                                </span>
                              ) : null}
                              {item.latitude && item.longitude ? (
                                <button
                                  onClick={() =>
                                    setGpsModal({
                                      isOpen: true,
                                      title: "Titik Lokasi Check-In Masuk",
                                      employeeName: item.employeeName,
                                      timeStr: `${item.date} • ${item.checkIn}`,
                                      locationName: item.location,
                                      lat: item.latitude || null,
                                      lng: item.longitude || null,
                                      accuracy: item.accuracy,
                                      mapsUrl: item.mapsUrl,
                                      selfiePhoto: item.selfieCheckIn || null,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-blue-50/80 px-2 py-0.5 rounded-md"
                                >
                                  <Navigation className="w-3 h-3" />
                                  <span>Peta GPS</span>
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className={`font-extrabold flex items-center gap-1.5 ${item.checkOut && item.checkOut !== "-" ? "text-slate-800" : "text-slate-400"}`}>
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {item.checkOut || "-"}
                              </p>
                              {item.selfieCheckOut && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setGpsModal({
                                      isOpen: true,
                                      title: "Verifikasi Presensi & Wajah Pulang",
                                      employeeName: item.employeeName,
                                      timeStr: `${item.date} • ${item.checkOut}`,
                                      locationName: item.checkOutLocation || item.location,
                                      lat: item.checkOutLat || item.latitude || null,
                                      lng: item.checkOutLng || item.longitude || null,
                                      accuracy: item.checkOutAccuracy,
                                      mapsUrl: item.checkOutMapsUrl || item.mapsUrl,
                                      selfiePhoto: item.selfieCheckOut,
                                    })
                                  }
                                  className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-blue-500 shadow-sm hover:scale-110 transition-transform cursor-pointer shrink-0"
                                  title="Lihat Foto Selfie Pulang"
                                >
                                  <img
                                    src={item.selfieCheckOut}
                                    alt="Foto Pulang"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              )}
                            </div>
                            {item.checkOutLocation && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[180px]">{item.checkOutLocation}</span>
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {item.checkOutDistanceToOffice !== undefined && item.checkOutDistanceToOffice !== null ? (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  item.checkOutDistanceToOffice <= 100
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  <Building className="w-2.5 h-2.5" />
                                  {item.checkOutDistanceToOffice <= 100 ? `Kantor (${item.checkOutDistanceToOffice}m)` : `Lapangan (${item.checkOutDistanceToOffice >= 1000 ? (item.checkOutDistanceToOffice/1000).toFixed(1) + "km" : item.checkOutDistanceToOffice + "m"})`}
                                </span>
                              ) : null}
                              {item.checkOutLat && item.checkOutLng ? (
                                <button
                                  onClick={() =>
                                    setGpsModal({
                                      isOpen: true,
                                      title: "Titik Lokasi Check-Out Pulang",
                                      employeeName: item.employeeName,
                                      timeStr: `${item.date} • ${item.checkOut}`,
                                      locationName: item.checkOutLocation || item.location,
                                      lat: item.checkOutLat ?? null,
                                      lng: item.checkOutLng ?? null,
                                      accuracy: item.checkOutAccuracy,
                                      mapsUrl: item.checkOutMapsUrl,
                                      selfiePhoto: item.selfieCheckOut || null,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer bg-slate-100 px-2 py-0.5 rounded-md"
                                >
                                  <Navigation className="w-3 h-3" />
                                  <span>Peta Pulang</span>
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          {renderStatusBadge(item.status)}
                        </td>

                        <td className="py-4 px-6 max-w-xs">
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {item.notes || <span className="text-slate-300 italic">-</span>}
                          </p>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenAddPayroll(item.employeeName)}
                              title="Buat Slip Gaji Karyawan Ini"
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setFormModal({
                                  isOpen: true,
                                  isEdit: true,
                                  id: item.id,
                                  employeeName: item.employeeName,
                                  date: item.date,
                                  checkIn: item.checkIn,
                                  checkOut: item.checkOut === "-" ? "" : item.checkOut,
                                  location: item.location,
                                  status: item.status,
                                  notes: item.notes || "",
                                  latitude: item.latitude ? String(item.latitude) : "",
                                  longitude: item.longitude ? String(item.longitude) : "",
                                });
                              }}
                              title="Edit / Koreksi Data"
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                setDeleteModal({
                                  isOpen: true,
                                  id: item.id,
                                  type: "attendance",
                                  name: `${item.employeeName} (${item.date})`,
                                })
                              }
                              title="Hapus Catatan"
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-bold gap-2">
              <span>Menampilkan {filteredAttendance.length} catatan presensi</span>
              <button
                onClick={handleDownloadCsv}
                className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File CSV / Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OVERTIME (LEMBUR) */}
      {activeTab === "overtime" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-slate-900">Persetujuan & Otorisasi Lembur Karyawan</h3>
              <p className="text-xs text-slate-500 mt-1">
                Lembur yang disetujui akan diakumulasikan secara otomatis ke dalam perhitungan upah lembur pada modul Slip Gaji / Payroll.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                {pendingOvertimeCount} Menunggu Otorisasi
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {overtimeList.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">Belum ada pengajuan lembur yang tercatat</p>
              </div>
            ) : (
              overtimeList.map((ot) => {
                const isPending = ot.status === "Menunggu Persetujuan";
                const isApproved = ot.status === "Disetujui";

                return (
                  <div
                    key={ot.id}
                    className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition-all ${
                      isPending ? "border-amber-300 ring-2 ring-amber-300/30" : "border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                          {ot.date}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                            isPending
                              ? "bg-amber-100 text-amber-800"
                              : isApproved
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {ot.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                          {ot.employeeName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{ot.employeeName}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Staf Lapangan</p>
                        </div>
                      </div>

                      <div className="space-y-2 bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold">Waktu Lembur:</span>
                          <span className="font-extrabold text-slate-900">
                            {ot.startTime} - {ot.endTime} ({ot.hours} Jam)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">Terkait Penugasan:</span>
                          <span className="font-bold text-slate-800 line-clamp-1">
                            {ot.taskTitle || "Tugas Lapangan"}
                          </span>
                        </div>
                        <div className="pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400 font-bold block mb-1">Alasan Lembur:</span>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {ot.reason || "-"}
                          </p>
                        </div>
                        {isApproved && (
                          <div className="pt-1 border-t border-slate-200/60 text-emerald-700 font-bold flex items-center justify-between">
                            <span>Estimasi Upah Lembur:</span>
                            <span>{formatRupiah((ot.hours || 0) * 30000)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      {isPending ? (
                        <>
                          <button
                            onClick={() =>
                              setOvertimeModal({
                                isOpen: true,
                                record: ot,
                                actionType: "approve",
                                rejectionReason: "",
                              })
                            }
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() =>
                              setOvertimeModal({
                                isOpen: true,
                                record: ot,
                                actionType: "reject",
                                rejectionReason: "Tidak sesuai ketentuan penugasan lembur",
                              })
                            }
                            className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-between text-xs text-slate-400">
                          <span>Status Terkunci</span>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                id: ot.id,
                                type: "overtime",
                                name: `Lembur ${ot.employeeName} (${ot.date})`,
                              })
                            }
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Hapus Record Lembur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: KALKULATOR & SLIP GAJI (PAYROLL) */}
      {activeTab === "payroll" && (
        <div className="space-y-6">
          {/* Banner Menuju Halaman Rekapitulasi Gaji Dedicated */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 p-6 rounded-3xl text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-black text-base tracking-tight">
                  Dashboard Rekapitulasi Penggajian & Auto Payday (Tanggal 25)
                </h4>
                <p className="text-xs text-blue-100 font-medium mt-0.5">
                  Tersedia modul baru penggajian otomatis terpadu, pengaturan tanggal gajian bulanan, persetujuan & pembayaran massal, serta cetak lembar Rekap Gaji Bulanan resmi A4.
                </p>
              </div>
            </div>
            <Link
              href="/admin/payroll"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-blue-50 font-black text-xs transition-all shrink-0 shadow-sm flex items-center gap-2"
            >
              <span>Buka Rekap Gaji & Auto Payday</span>
              <ArrowRight className="w-4 h-4 text-dstech-blue" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Kalkulator Penggajian, Upah Lembur & Slip Gaji
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kalkulasi otomatis gaji pokok, uang makan kehadiran, upah jam lembur resmi, tunjangan operasional, bonus proyek, dan potongan BPJS.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenAddPayroll()}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Hitung Gaji Karyawan Baru</span>
              </button>
            </div>
          </div>

          {/* Table Payroll */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">No. Slip & Periode</th>
                    <th className="py-4 px-6">Nama Karyawan</th>
                    <th className="py-4 px-6">Kehadiran & Lembur</th>
                    <th className="py-4 px-6">Gaji Pokok & Tunjangan</th>
                    <th className="py-4 px-6">Bonus & Overtime</th>
                    <th className="py-4 px-6">Gaji Bersih (THP)</th>
                    <th className="py-4 px-6">Status Pembayaran</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredPayroll.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400">
                        <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-600">Belum ada data slip gaji pada periode ini</p>
                        <p className="text-xs text-slate-400 mt-1">Klik tombol &quot;+ Hitung Gaji Karyawan Baru&quot; di atas untuk membuat slip gaji</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayroll.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* No Slip */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="font-extrabold text-slate-900 font-mono text-[11px]">{pay.slipNumber}</p>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{pay.month}</span>
                        </td>

                        {/* Nama */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs">
                              {pay.employeeName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{pay.employeeName}</p>
                              <span className="text-[10px] text-slate-400">{pay.employeeRole}</span>
                            </div>
                          </div>
                        </td>

                        {/* Kehadiran & Lembur */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="text-blue-700 font-bold block">
                              {pay.presenceDays} Hari Hadir ({formatRupiah(pay.presenceAllowance)})
                            </span>
                            <span className="text-amber-700 font-bold block text-[11px]">
                              {pay.overtimeHours} Jam OT ({formatRupiah(pay.overtimePay)})
                            </span>
                          </div>
                        </td>

                        {/* Gaji Pokok & Tunjangan */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-800 block">
                              {formatRupiah(pay.baseSalary)}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Tunjangan: {formatRupiah((pay.positionAllowance || 0) + (pay.transportAllowance || 0))}
                            </span>
                          </div>
                        </td>

                        {/* Bonus & Overtime */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-bold text-emerald-600 block">
                              +{formatRupiah((pay.bonusProject || 0) + (pay.bonusPerformance || 0))}
                            </span>
                            <span className="text-[10px] text-rose-500 block">
                              Potongan: -{formatRupiah(pay.totalDeductions || 0)}
                            </span>
                          </div>
                        </td>

                        {/* Take Home Pay */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="text-base font-black text-slate-900 font-mono block">
                            {formatRupiah(pay.takeHomePay)}
                          </span>
                          <span className="text-[10px] text-slate-400">{pay.paymentMethod}</span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {pay.status === "Dibayarkan" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Lunas / Dibayar
                            </span>
                          ) : pay.status === "Disetujui" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                              <Check className="w-3.5 h-3.5" />
                              Disetujui
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700">
                              Draft
                            </span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setSelectedSlipForPrint(pay)}
                              title="Cetak Slip Gaji Resmi A4"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {pay.status !== "Dibayarkan" && (
                              <button
                                onClick={() => handleMarkAsPaid(pay)}
                                title="Tandai Sudah Dibayar (Buku Kas Masuk)"
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setPayrollFormModal({
                                  isOpen: true,
                                  isEdit: true,
                                  id: pay.id,
                                  slipNumber: pay.slipNumber,
                                  month: pay.month,
                                  paymentDate: pay.paymentDate,
                                  employeeName: pay.employeeName,
                                  employeeRole: pay.employeeRole,
                                  bankAccount: pay.bankAccount,
                                  baseSalary: pay.baseSalary,
                                  presenceDays: pay.presenceDays,
                                  presenceRate: pay.presenceRate,
                                  presenceAllowance: pay.presenceAllowance,
                                  overtimeHours: pay.overtimeHours,
                                  overtimeRate: pay.overtimeRate,
                                  overtimePay: pay.overtimePay,
                                  positionAllowance: pay.positionAllowance,
                                  transportAllowance: pay.transportAllowance,
                                  bonusProject: pay.bonusProject,
                                  bonusPerformance: pay.bonusPerformance,
                                  bpjsDeduction: pay.bpjsDeduction,
                                  loanDeduction: pay.loanDeduction,
                                  otherDeduction: pay.otherDeduction,
                                  paymentMethod: pay.paymentMethod,
                                  status: pay.status,
                                  notes: pay.notes || "",
                                  recordInCashFlow: false,
                                });
                              }}
                              title="Edit Data Slip Gaji"
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                setDeleteModal({
                                  isOpen: true,
                                  id: pay.id,
                                  type: "payroll",
                                  name: `${pay.employeeName} (${pay.slipNumber})`,
                                })
                              }
                              title="Hapus Slip Gaji"
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LAPORAN & REKAPITULASI ABSENSI */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Header Banner Laporan */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>MODUL PELAPORAN PRESENSI & DISIPLIN KERJA</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Laporan Rekapitulasi Absensi & Jam Lembur Karyawan
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Laporan terpusat kehadiran seluruh staf lapangan & IT, status verifikasi GPS Google Maps, audit lembur proyek, serta evaluasi kedisiplinan periode {filterMonth || "Semua"}.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                    <CalendarCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Periode: <strong>{filterMonth || "Semua Bulan"}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Total Karyawan: <strong>{employeeOptions.length} Orang</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Total Lembur Sah: <strong>{overtimeList.filter((o) => o.status === "Disetujui" && (!filterMonth || filterMonth === "ALL" || o.date.startsWith(filterMonth))).reduce((sum, curr) => sum + (curr.hours || 0), 0)} Jam</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Download CSV & Cetak A4 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={handleDownloadSummaryCsv}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  title="Unduh Rekapitulasi Per Karyawan (.CSV Excel)"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Unduh Rekap Excel</span>
                </button>

                <button
                  onClick={handleDownloadCsv}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs sm:text-sm font-bold border border-slate-700 transition-all cursor-pointer"
                  title="Unduh Seluruh Log Harian (.CSV)"
                >
                  <Download className="w-4 h-4 text-slate-300" />
                  <span>Unduh Log Detail</span>
                </button>

                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  title="Cetak Lembar Laporan Resmi A4 Ber-Kop Surat DSTech"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Unduh PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Log Kehadiran</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{filteredAttendance.length} <span className="text-xs font-bold text-slate-400">Log</span></p>
              <p className="text-[11px] text-slate-500 mt-1">Periode {filterMonth || "Semua"}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Hadir Lapangan (GPS Maps)</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {filteredAttendance.filter((a) => a.status === "Hadir Lapangan").length} <span className="text-xs font-bold text-slate-400">Hari</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">Terverifikasi Koordinat Presisi</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Jam Lembur Sah</span>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {overtimeList
                  .filter((o) => o.status === "Disetujui" && (!filterMonth || filterMonth === "ALL" || o.date.startsWith(filterMonth)))
                  .reduce((sum, curr) => sum + (curr.hours || 0), 0)}{" "}
                <span className="text-xs font-bold text-slate-400">Jam</span>
              </p>
              <p className="text-[11px] text-amber-700 font-bold mt-1">Disetujui Supervisor / Admin</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Rata-Rata Disiplin Tim</span>
              <p className="text-2xl font-black text-blue-600 mt-1">98.5%</p>
              <p className="text-[11px] text-blue-600 font-bold mt-1">Kategori: Sangat Baik</p>
            </div>
          </div>

          {/* Tabel 1: Rekapitulasi Kehadiran & Lembur Per Karyawan */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-black text-slate-900">
                  Tabel Rekapitulasi Kehadiran Staf ({filterMonth || "Semua Bulan"})
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ringkasan total masuk, rasio tepat waktu, jam lembur resmi, dan skor evaluasi kinerja staf.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSummaryCsv}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unduh Tabel Ini (.CSV)</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6 text-center w-12">No</th>
                    <th className="py-4 px-6">Nama Karyawan / Teknisi</th>
                    <th className="py-4 px-6 text-center">Hadir Kantor</th>
                    <th className="py-4 px-6 text-center">Hadir Lapangan (GPS)</th>
                    <th className="py-4 px-6 text-center">Jam Lembur Sah</th>
                    <th className="py-4 px-6 text-center">Total Kehadiran</th>
                    <th className="py-4 px-6 text-center">Tingkat Disiplin</th>
                    <th className="py-4 px-6 text-center">Status Evaluasi</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {employeeOptions.map((name, idx) => {
                    const logs = attendanceList.filter(
                      (a) => a.employeeName === name && (!filterMonth || filterMonth === "ALL" || a.date.startsWith(filterMonth))
                    );
                    const hadirCount = logs.length;
                    const tepatWaktuCount = logs.filter((a) => a.status === "Tepat Waktu").length;
                    const lapanganCount = logs.filter((a) => a.status === "Hadir Lapangan").length;
                    const otLogs = overtimeList.filter(
                      (o) =>
                        o.employeeName === name &&
                        o.status === "Disetujui" &&
                        (!filterMonth || filterMonth === "ALL" || o.date.startsWith(filterMonth))
                    );
                    const totalOTHours = otLogs.reduce((acc, curr) => acc + (curr.hours || 0), 0);
                    const disciplineRate = hadirCount > 0 ? Math.round(((tepatWaktuCount + lapanganCount) / hadirCount) * 100) : 100;

                    return (
                      <tr key={name} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center border border-blue-100">
                              {name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{name}</p>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {name.toLowerCase().includes("admin") ? "Admin Operasional" : "Teknisi Lapangan"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-700">{tepatWaktuCount} Hari</td>
                        <td className="py-4 px-6 text-center font-bold text-emerald-600">{lapanganCount} Hari</td>
                        <td className="py-4 px-6 text-center font-bold text-amber-600">{totalOTHours} Jam</td>
                        <td className="py-4 px-6 text-center font-black text-slate-900">{hadirCount} Hari</td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-1.5 font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-[11px]">
                            <span>{disciplineRate}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {disciplineRate >= 95 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Sangat Baik
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                              <Check className="w-3 h-3" /> Baik
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setFilterEmployee(name);
                                setIsPrintModalOpen(true);
                              }}
                              title="Cetak Laporan Karyawan Ini (A4 PDF)"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenAddPayroll(name)}
                              title="Hitung Slip Gaji (Payroll)"
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel 2: Detail Catatan Log Harian (Audit Trail) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-black text-slate-900">
                  Rincian Detail Log Presensi Harian ({filteredAttendance.length} Transaksi)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit trail seluruh waktu check-in, check-out, titik koordinat GPS Google Maps, dan catatan lapangan teknisi.
                </p>
              </div>

              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Unduh Seluruh Log (.CSV)</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500 z-10">
                  <tr>
                    <th className="py-3 px-6">Tanggal & Hari</th>
                    <th className="py-3 px-6">Karyawan</th>
                    <th className="py-3 px-6">Masuk (Check-In)</th>
                    <th className="py-3 px-6">Pulang (Check-Out)</th>
                    <th className="py-3 px-6">Status Kehadiran</th>
                    <th className="py-3 px-6">Verifikasi GPS Maps</th>
                    <th className="py-3 px-6">Catatan Lapangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Tidak ada log presensi untuk periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.slice(0, 50).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-6 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{item.date}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.date).toLocaleDateString("id-ID", { weekday: "long" })}
                          </span>
                        </td>
                        <td className="py-3 px-6 font-bold text-slate-900">{item.employeeName}</td>
                        <td className="py-3 px-6">
                          <span className="font-mono font-bold text-emerald-700">{item.checkIn}</span>
                          <span className="block text-[10px] text-slate-400 truncate max-w-[160px]">{item.location}</span>
                        </td>
                        <td className="py-3 px-6">
                          <span className="font-mono font-bold text-slate-700">{item.checkOut || "-"}</span>
                          <span className="block text-[10px] text-slate-400 truncate max-w-[160px]">{item.checkOutLocation || "-"}</span>
                        </td>
                        <td className="py-3 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {item.status || "Hadir"}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          {item.latitude && item.longitude ? (
                            <button
                              onClick={() =>
                                setGpsModal({
                                  isOpen: true,
                                  title: `Verifikasi Presensi Masuk: ${item.employeeName}`,
                                  employeeName: item.employeeName,
                                  timeStr: `${item.date} • ${item.checkIn}`,
                                  locationName: item.location,
                                  lat: item.latitude || null,
                                  lng: item.longitude || null,
                                  accuracy: item.accuracy,
                                  mapsUrl: item.mapsUrl,
                                  selfiePhoto: item.selfieCheckIn || null,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                            >
                              <MapPin className="w-3 h-3 text-blue-600" />
                              <span>Lihat Titik GPS</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Kantor (Default)</span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-slate-500 max-w-[200px] truncate" title={item.notes || "-"}>
                          {item.notes || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MANAJEMEN CUTI, IZIN KHUSUS & SAKIT KARYAWAN (Tugas 232 / 109) */}
      {activeTab === "leave" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-teal-800/40">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold mb-3">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Modul HR &amp; Manajemen Personalia</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Manajemen Cuti, Izin &amp; Sakit Karyawan
                </h2>
                <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                  Otorisasi persetujuan dispensasi kehadiran resmi staf, verifikasi surat sakit dokter, serta pemantauan otomatis sisa kuota cuti tahunan sesuai kontrak kerja PKWT.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setLeaveRecordModal({
                      isOpen: true,
                      employeeName: employeeOptions[0] || "",
                      type: "Cuti",
                      startDate: todayStr,
                      endDate: todayStr,
                      notes: "",
                      hasDoctorNote: false,
                    })
                  }
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-teal-500/20 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Cuti / Izin Manual (Admin)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Kartu KPI Ringkasan Cuti & Izin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Menunggu Review</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {pendingLeaveCount} <span className="text-xs font-bold text-slate-400">Pengajuan</span>
                </h3>
                <p className="text-[11px] text-amber-600 mt-0.5 font-medium">Perlu Otorisasi Pimpinan</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cuti Tahunan Disetujui</p>
                <h3 className="text-2xl font-black text-teal-600 mt-1">
                  {approvedAnnualLeaveThisMonth} <span className="text-xs font-bold text-slate-400">Pengajuan</span>
                </h3>
                <p className="text-[11px] text-teal-600 mt-0.5 font-medium">Potong Kuota Tahunan</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Izin Khusus Disetujui</p>
                <h3 className="text-2xl font-black text-blue-600 mt-1">
                  {approvedSpecialPermissionThisMonth} <span className="text-xs font-bold text-slate-400">Pengajuan</span>
                </h3>
                <p className="text-[11px] text-blue-600 mt-0.5 font-medium">Keperluan Mendesak Resmi</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Izin Sakit Terverifikasi</p>
                <h3 className="text-2xl font-black text-rose-600 mt-1">
                  {approvedSickLeaveThisMonth} <span className="text-xs font-bold text-slate-400">Pengajuan</span>
                </h3>
                <p className="text-[11px] text-rose-600 mt-0.5 font-medium">Surat Dokter Valid</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <HeartPulse className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* TABEL 1: DAFTAR PERMOHONAN CUTI / IZIN / SAKIT SELURUH KARYAWAN */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Daftar Permohonan Cuti, Izin &amp; Sakit Karyawan
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Tinjau dan berikan persetujuan dispensasi presensi staf. Persetujuan otomatis memperbarui absensi harian.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  Total: {leaveRequestsList.length} Pengajuan
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Tanggal Masuk</th>
                    <th className="py-3.5 px-6">Nama Karyawan</th>
                    <th className="py-3.5 px-6">Jenis Dispensasi</th>
                    <th className="py-3.5 px-6">Rentang Tanggal</th>
                    <th className="py-3.5 px-6">Durasi</th>
                    <th className="py-3.5 px-6">Alasan Keperluan</th>
                    <th className="py-3.5 px-6">Lampiran Bukti</th>
                    <th className="py-3.5 px-6">Status &amp; Peninjau</th>
                    <th className="py-3.5 px-6 text-right">Otorisasi / Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveRequestsList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                        Belum ada permohonan cuti, izin, atau sakit yang diajukan oleh karyawan.
                      </td>
                    </tr>
                  ) : (
                    leaveRequestsList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-medium text-slate-500 whitespace-nowrap">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900">{item.employeeName}</p>
                          <p className="text-[11px] text-slate-400">{item.department || "Operasional"}</p>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              item.type === "ANNUAL_LEAVE"
                                ? "bg-teal-100 text-teal-800"
                                : item.type === "SICK_LEAVE"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.typeLabel}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">
                          {item.startDate === item.endDate ? item.startDate : `${item.startDate} s.d. ${item.endDate}`}
                        </td>
                        <td className="py-4 px-6 font-black text-slate-700 whitespace-nowrap">
                          {item.totalDays} Hari
                        </td>
                        <td className="py-4 px-6 text-slate-600 max-w-xs leading-relaxed">
                          {item.reason}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {item.attachmentUrl ? (
                            <a
                              href={item.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[11px] border border-blue-200 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Lihat Bukti</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Tanpa Lampiran</span>
                          )}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div>
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                item.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : item.status === "REJECTED"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800 animate-pulse"
                              }`}
                            >
                              {item.status === "APPROVED"
                                ? "Disetujui"
                                : item.status === "REJECTED"
                                ? "Ditolak"
                                : "Menunggu Review"}
                            </span>
                            {item.approvedBy && (
                              <p className="text-[10px] text-slate-400 mt-1">
                                Oleh: {item.approvedBy}
                              </p>
                            )}
                            {item.rejectionReason && (
                              <p className="text-[10px] text-rose-500 mt-1 italic max-w-[150px] truncate" title={item.rejectionReason}>
                                Alasan: {item.rejectionReason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          {item.status === "PENDING" ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={leaveActionLoading === item.id}
                                onClick={() => handleApproveLeave(item.id, item.employeeName, item.typeLabel)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>
                              <button
                                type="button"
                                disabled={leaveActionLoading === item.id}
                                onClick={() =>
                                  setRejectModal({
                                    isOpen: true,
                                    leaveId: item.id,
                                    employeeName: item.employeeName,
                                    typeLabel: item.typeLabel,
                                    reason: "",
                                  })
                                }
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Selesai Ditinjau</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL 2: REKAPITULASI MASTER KUOTA CUTI TAHUNAN KARYAWAN */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Master Kuota Cuti Tahunan Karyawan (Tahun 2026)
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Perhitungan sisa hak cuti tahunan berdasar Perjanjian Kerja Waktu Tertentu (PKWT) resmi.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  Hak Standar: 12 Hari / Tahun
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Nama Karyawan</th>
                    <th className="py-3.5 px-6">Departemen / Divisi</th>
                    <th className="py-3.5 px-6">Hak Cuti Tahunan</th>
                    <th className="py-3.5 px-6">Cuti Terpakai</th>
                    <th className="py-3.5 px-6">Sisa Kuota Cuti</th>
                    <th className="py-3.5 px-6">Status Kuota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeeLeaveQuotas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                        Belum ada data kuota karyawan.
                      </td>
                    </tr>
                  ) : (
                    employeeLeaveQuotas.map((emp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-slate-900">{emp.employeeName}</td>
                        <td className="py-3.5 px-6 text-slate-500">{emp.department || "Operasional"}</td>
                        <td className="py-3.5 px-6 font-medium text-slate-700">{emp.annualQuota} Hari</td>
                        <td className="py-3.5 px-6 font-bold text-amber-600">{emp.usedDays} Hari</td>
                        <td className="py-3.5 px-6">
                          <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-black border border-teal-200">
                            {emp.remainingDays} Hari
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              emp.remainingDays > 5
                                ? "bg-emerald-100 text-emerald-800"
                                : emp.remainingDays > 0
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {emp.remainingDays > 5
                              ? "🟢 Tersedia"
                              : emp.remainingDays > 0
                              ? "🟡 Menipis"
                              : "🔴 Habis"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PENGATURAN TITIK GPS & GEOFENCING */}
      {activeTab === "geofence" && (
        <GpsGeofenceManager standaloneTitle={true} />
      )}

      {/* MODAL 1: PREVIEW GOOGLE MAPS GPS */}
      {gpsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setGpsModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {gpsModal.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {gpsModal.employeeName} • {gpsModal.timeStr}
                </p>
              </div>
              <button
                onClick={() => setGpsModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {gpsModal.selfiePhoto && (
              <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3.5 shadow-sm">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0 bg-black">
                  <img
                    src={gpsModal.selfiePhoto}
                    alt="Selfie Presensi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Foto Wajah Selfie Sah (Kamera Perangkat)
                  </span>
                  <p className="text-slate-600 text-[11px] font-medium mt-1 leading-snug">
                    Foto wajah asli karyawan terverifikasi saat presensi bersamaan dengan penguncian titik koordinat satelit GPS ini.
                  </p>
                </div>
              </div>
            )}

            <div className="w-full h-72 rounded-2xl overflow-hidden border border-slate-200 relative mb-4 bg-slate-100">
              {gpsModal.lat && gpsModal.lng ? (
                <iframe
                  title="Peta Titik Absensi"
                  src={`https://www.google.com/maps?q=${gpsModal.lat},${gpsModal.lng}&hl=id&z=16&output=embed`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  Koordinat GPS tidak tersedia
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 mb-5 text-xs">
              <div className="flex items-start justify-between">
                <span className="text-slate-500 font-bold">Deskripsi Lokasi:</span>
                <span className="font-extrabold text-slate-900 text-right max-w-[280px]">
                  {gpsModal.locationName || "Kantor DSTech Cilegon"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Koordinat Latitude, Longitude:</span>
                <span className="font-mono font-bold text-blue-600">
                  {gpsModal.lat}, {gpsModal.lng}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={gpsModal.mapsUrl || `https://www.google.com/maps?q=${gpsModal.lat},${gpsModal.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka di Google Maps Aplikasi</span>
              </a>
              <button
                onClick={() => setGpsModal((prev) => ({ ...prev, isOpen: false }))}
                className="py-3 px-5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: KALKULATOR GAJI & FORM INPUT SLIP GAJI BARU */}
      {payrollFormModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !submitting && setPayrollFormModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  {payrollFormModal.isEdit ? "Edit Perhitungan Gaji & Slip" : "Kalkulator Gaji & Penerbitan Slip"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hitung gaji pokok, upah jam lembur, tunjangan kehadiran riil, bonus proyek, dan potongan BPJS.
                </p>
              </div>
              <button
                onClick={() => setPayrollFormModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayroll} className="space-y-5 text-xs">
              {/* Karyawan & Periode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Karyawan / Teknisi *</label>
                  <select
                    value={payrollFormModal.employeeName}
                    onChange={(e) => {
                      const emp = e.target.value;
                      // Recalculate based on new employee selection
                      const atts = attendanceList.filter((a) => a.employeeName === emp && a.date.startsWith(payrollFormModal.month));
                      const days = atts.length > 0 ? atts.length : 22;
                      const ots = overtimeList.filter((o) => o.employeeName === emp && o.date.startsWith(payrollFormModal.month) && o.status === "Disetujui");
                      const otHours = ots.reduce((acc, curr) => acc + (curr.hours || 0), 0);

                      setPayrollFormModal((prev) => ({
                        ...prev,
                        employeeName: emp,
                        presenceDays: days,
                        presenceAllowance: days * prev.presenceRate,
                        overtimeHours: otHours,
                        overtimePay: otHours * prev.overtimeRate,
                        employeeRole: emp.toLowerCase().includes("admin") ? "Admin Operasional" : "Teknisi Lapangan",
                      }));
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-orange-500"
                  >
                    {employeeOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Periode Bulan Penggajian *</label>
                  <input
                    type="month"
                    required
                    value={payrollFormModal.month}
                    onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, month: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Jabatan & Rekening */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan / Posisi</label>
                  <input
                    type="text"
                    value={payrollFormModal.employeeRole}
                    onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, employeeRole: e.target.value }))}
                    placeholder="Contoh: Teknisi Lapangan Senior"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rekening Pembayaran Karyawan</label>
                  <input
                    type="text"
                    value={payrollFormModal.bankAccount}
                    onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, bankAccount: e.target.value }))}
                    placeholder="Contoh: Bank BCA 123456789 a.n Nama"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Komponen 1: Gaji Pokok & Kehadiran */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  1. Gaji Pokok & Uang Kehadiran Harian
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Gaji Pokok (Rp)</label>
                    <input
                      type="number"
                      value={payrollFormModal.baseSalary}
                      onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, baseSalary: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Hari Hadir (Presensi)</label>
                    <input
                      type="number"
                      value={payrollFormModal.presenceDays}
                      onChange={(e) => {
                        const days = Number(e.target.value);
                        setPayrollFormModal((prev) => ({
                          ...prev,
                          presenceDays: days,
                          presenceAllowance: days * prev.presenceRate,
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Tunjangan Kehadiran (Rp)</label>
                    <input
                      type="number"
                      value={payrollFormModal.presenceAllowance}
                      onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, presenceAllowance: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-blue-700"
                    />
                  </div>
                </div>
              </div>

              {/* Komponen 2: Upah Lembur (Overtime) */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    2. Upah Lembur Kerja (Overtime Pay)
                  </h4>
                  <span className="text-[10px] text-amber-700 font-bold">Auto-Sync dari Pengajuan Lembur Sah</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-amber-800 font-bold mb-1">Total Jam Lembur Sah</label>
                    <input
                      type="number"
                      value={payrollFormModal.overtimeHours}
                      onChange={(e) => {
                        const hrs = Number(e.target.value);
                        setPayrollFormModal((prev) => ({
                          ...prev,
                          overtimeHours: hrs,
                          overtimePay: hrs * prev.overtimeRate,
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl font-bold text-amber-900"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-800 font-bold mb-1">Tarif Lembur / Jam (Rp)</label>
                    <input
                      type="number"
                      value={payrollFormModal.overtimeRate}
                      onChange={(e) => {
                        const rate = Number(e.target.value);
                        setPayrollFormModal((prev) => ({
                          ...prev,
                          overtimeRate: rate,
                          overtimePay: prev.overtimeHours * rate,
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-800 font-bold mb-1">Total Upah Lembur (Rp)</label>
                    <input
                      type="number"
                      value={payrollFormModal.overtimePay}
                      onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, overtimePay: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl font-bold text-amber-700"
                    />
                  </div>
                </div>
              </div>

              {/* Komponen 3: Tunjangan & Bonus */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <h4 className="font-black text-emerald-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  3. Tunjangan Operasional & Bonus Proyek
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-emerald-800 font-bold mb-1">Tunj. Jabatan</label>
                    <input
                      type="number"
                      value={payrollFormModal.positionAllowance}
                      onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, positionAllowance: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-800 font-bold mb-1">Tunj. Transport</label>
                    <input
                      type="number"
                      value={payrollFormModal.transportAllowance}
                      onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, transportAllowance: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-800 font-bold mb-1">Bonus Proyek</label>
                    <input
                      type="number"
                      value={payrollFormModal.bonusProject}
                      onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, bonusProject: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-xl font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-800 font-bold mb-1">Bonus Prestasi</label>
                    <input
                      type="number"
                      value={payrollFormModal.bonusPerformance}
                      onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, bonusPerformance: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-xl font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Komponen 4: Potongan */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                <h4 className="font-black text-rose-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  4. Potongan (Deductions)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-rose-800 font-bold mb-1">BPJS (Kesehatan / TK)</label>
                    <input
                      type="number"
                      value={payrollFormModal.bpjsDeduction}
                      onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, bpjsDeduction: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-rose-800 font-bold mb-1">Kasbon / Pinjaman</label>
                    <input
                      type="number"
                      value={payrollFormModal.loanDeduction}
                      onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, loanDeduction: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-rose-800 font-bold mb-1">Potongan Lainnya</label>
                    <input
                      type="number"
                      value={payrollFormModal.otherDeduction}
                      onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, otherDeduction: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Take Home Pay */}
              {(() => {
                const totalGross =
                  (payrollFormModal.baseSalary || 0) +
                  (payrollFormModal.presenceAllowance || 0) +
                  (payrollFormModal.overtimePay || 0) +
                  (payrollFormModal.positionAllowance || 0) +
                  (payrollFormModal.transportAllowance || 0) +
                  (payrollFormModal.bonusProject || 0) +
                  (payrollFormModal.bonusPerformance || 0);

                const totalDed =
                  (payrollFormModal.bpjsDeduction || 0) +
                  (payrollFormModal.loanDeduction || 0) +
                  (payrollFormModal.otherDeduction || 0);

                const thp = Math.max(0, totalGross - totalDed);

                return (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Estimasi Gaji Bersih (Take Home Pay)
                      </span>
                      <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                        {formatRupiah(thp)}
                      </p>
                      <p className="text-[10px] text-slate-300 italic mt-0.5">
                        &quot;{terbilangRupiah(thp)} Rupiah&quot;
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-slate-300">
                      <p>Kotor: {formatRupiah(totalGross)}</p>
                      <p className="text-rose-400">Potongan: -{formatRupiah(totalDed)}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Status & Sinkronisasi Kas Keluar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Penggajian</label>
                  <select
                    value={payrollFormModal.status}
                    onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Draft">Draft (Belum Disetujui)</option>
                    <option value="Disetujui">Disetujui Direksi</option>
                    <option value="Dibayarkan">Dibayarkan / Lunas</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="recordInCashFlow"
                    checked={payrollFormModal.recordInCashFlow}
                    onChange={(e) => setPayrollFormModal((prev) => ({ ...prev, recordInCashFlow: e.target.checked }))}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <label htmlFor="recordInCashFlow" className="font-bold text-slate-700 cursor-pointer">
                    Catat otomatis ke Buku Arus Kas Keluar ERP (saat lunas)
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setPayrollFormModal((prev) => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-2xl bg-orange-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-orange-700 shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{payrollFormModal.isEdit ? "Simpan Perubahan Slip Gaji" : "Terbitkan Slip Gaji"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CETAK SLIP GAJI RESMI A4 */}
      {selectedSlipForPrint && (
        <div className="print-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="print-modal-box bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 shadow-2xl border border-slate-200 relative my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-black text-slate-900">
                  Pratinjau Slip Gaji Resmi Karyawan (A4)
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const originalTitle = document.title;
                    document.title = `SLIP_GAJI_DSTECH_${selectedSlipForPrint.slipNumber}_${(selectedSlipForPrint.employeeName || "").replace(/[^a-zA-Z0-9]/g, "_")}`;
                    window.print();
                    setTimeout(() => {
                      document.title = originalTitle;
                    }, 2000);
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Unduh PDF</span>
                </button>
                <button
                  onClick={() => setSelectedSlipForPrint(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Sheet */}
            <div
              id="print-salary-slip-sheet"
              className="print-document-sheet print-single-sheet p-8 print:p-0 print:border-none print:shadow-none print:rounded-none border border-slate-200 rounded-2xl bg-white text-slate-900 space-y-6 flex flex-col justify-between print:py-6"
            >
              {/* Header Kop Surat */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-10">
                    <Image src="/logo.png" alt="DSTech Logo" fill className="object-contain" priority />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight uppercase text-slate-900">
                      PT. DSTECH SMART PERKASA
                    </h2>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      Perum Bukit Cilegon Asri Blok DB No. 19, Cilegon - Banten | WhatsApp: 0822-5949-4242
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      NIB: 1710240058866 | NPWP: 20.892.484.2-417.000
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-black">
                    {selectedSlipForPrint.slipNumber}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Tanggal: {selectedSlipForPrint.paymentDate}</p>
                </div>
              </div>

              {/* Title Document */}
              <div className="text-center space-y-1">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                  SLIP PEMBAYARAN GAJI & UPAH LEMBUR KARYAWAN
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Periode Pembayaran: <span className="font-bold text-slate-900">{selectedSlipForPrint.month}</span>
                </p>
              </div>

              {/* Employee Bio */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <p><span className="text-slate-400 font-bold inline-block w-28">Nama Karyawan:</span> <strong className="text-slate-900">{selectedSlipForPrint.employeeName}</strong></p>
                  <p className="mt-1"><span className="text-slate-400 font-bold inline-block w-28">Jabatan / Posisi:</span> {selectedSlipForPrint.employeeRole}</p>
                </div>
                <div>
                  <p><span className="text-slate-400 font-bold inline-block w-28">Metode Bayar:</span> {selectedSlipForPrint.paymentMethod}</p>
                  <p className="mt-1"><span className="text-slate-400 font-bold inline-block w-28">Rekening Bank:</span> {selectedSlipForPrint.bankAccount}</p>
                </div>
              </div>

              {/* Table Breakdown: Pendapatan vs Potongan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Penerimaan */}
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 p-2.5 border-b border-slate-300 font-black text-emerald-900 text-xs flex justify-between">
                    <span>A. PENERIMAAN / PENDAPATAN</span>
                    <span>JUMLAH</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span>1. Gaji Pokok</span>
                      <span className="font-bold">{formatRupiah(selectedSlipForPrint.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2. Tunjangan Kehadiran ({selectedSlipForPrint.presenceDays} Hari)</span>
                      <span className="font-bold">{formatRupiah(selectedSlipForPrint.presenceAllowance)}</span>
                    </div>
                    <div className="flex justify-between bg-amber-50/50 p-1 rounded">
                      <span className="text-amber-900 font-medium">3. Upah Lembur ({selectedSlipForPrint.overtimeHours} Jam x @30rb)</span>
                      <span className="font-bold text-amber-900">{formatRupiah(selectedSlipForPrint.overtimePay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4. Tunjangan Jabatan</span>
                      <span>{formatRupiah(selectedSlipForPrint.positionAllowance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5. Tunjangan Transport / Operasional</span>
                      <span>{formatRupiah(selectedSlipForPrint.transportAllowance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>6. Bonus Penyelesaian Proyek</span>
                      <span className="font-bold text-emerald-600">+{formatRupiah(selectedSlipForPrint.bonusProject)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>7. Bonus Prestasi Kerja</span>
                      <span className="font-bold text-emerald-600">+{formatRupiah(selectedSlipForPrint.bonusPerformance)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900">
                      <span>TOTAL KOTOR (A)</span>
                      <span>{formatRupiah(selectedSlipForPrint.totalGross)}</span>
                    </div>
                  </div>
                </div>

                {/* Potongan */}
                <div className="border border-slate-300 rounded-xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-rose-50 p-2.5 border-b border-slate-300 font-black text-rose-900 text-xs flex justify-between">
                      <span>B. POTONGAN RESMI</span>
                      <span>JUMLAH</span>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex justify-between">
                        <span>1. BPJS (Kesehatan / Ketenagakerjaan)</span>
                        <span>{formatRupiah(selectedSlipForPrint.bpjsDeduction)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Pinjaman / Kasbon</span>
                        <span>{formatRupiah(selectedSlipForPrint.loanDeduction)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3. Potongan Lainnya</span>
                        <span>{formatRupiah(selectedSlipForPrint.otherDeduction)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-200">
                    <div className="flex justify-between font-black text-rose-700">
                      <span>TOTAL POTONGAN (B)</span>
                      <span>-{formatRupiah(selectedSlipForPrint.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Take Home Pay */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    TOTAL GAJI BERSIH DITERIMA (TAKE HOME PAY)
                  </span>
                  <p className="text-xs text-slate-300 italic mt-0.5">
                    Terbilang: &quot;{terbilangRupiah(selectedSlipForPrint.takeHomePay)} Rupiah&quot;
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {formatRupiah(selectedSlipForPrint.takeHomePay)}
                  </span>
                </div>
              </div>

              {/* Dual Signature */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-center">
                <div>
                  <p className="font-bold text-slate-500 mb-16">Penerima / Karyawan,</p>
                  <p className="font-black text-slate-900 uppercase underline">{selectedSlipForPrint.employeeName}</p>
                  <p className="text-[10px] text-slate-500">{selectedSlipForPrint.employeeRole}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500 mb-16">Mengetahui & Menyetujui,</p>
                  <p className="font-black text-slate-900 uppercase underline">DIREKTUR PT. DSTECH SMART PERKASA</p>
                  <p className="text-[10px] text-slate-500">PT. DSTech Smart Perkasa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CETAK LEMBAR REKAP PRESENSI A4 RESMI */}
      {isPrintModalOpen && (
        <div className="print-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="print-modal-box bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 shadow-2xl border border-slate-200 relative my-auto">
            {/* Toolbar Pratinjau */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden gap-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Pratinjau Lembar Rekap Absensi Resmi (Standar A4)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dokumen siap cetak langsung atau disimpan sebagai file PDF resmi ber-Kop Surat DSTech.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleDownloadSummaryCsv}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Unduh Rekap Spreadsheet (.CSV / Excel)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Unduh CSV</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                  title="Buka dialog cetak browser / simpan PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Unduh PDF</span>
                </button>

                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Sheet */}
            <div id="print-attendance-sheet" className="print-document-sheet print-single-sheet p-8 border border-slate-200 rounded-2xl bg-white text-slate-900 space-y-6">
              {/* Header Kop Surat Perusahaan */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-12">
                    <Image src="/logo.png" alt="DSTech Logo" fill className="object-contain" priority />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight uppercase text-slate-900">
                      PT. DSTECH SMART PERKASA
                    </h2>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      Perum Bukit Cilegon Asri Blok DB No. 19, Cilegon - Banten | WhatsApp: 0822-5949-4242
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      NIB: 1710240058866 | NPWP: 20.892.484.2-417.000 | Email: admin@dstechsmart.com
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-black">
                    DSTECH/LAP-ABS/{filterMonth ? filterMonth.replace("-", "") : "202610"}/001
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              </div>

              {/* Title Document */}
              <div className="text-center space-y-1">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                  LAPORAN RESMI REKAPITULASI PRESENSI & KEDISIPLINAN KERJA KARYAWAN
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Periode Laporan: <span className="font-bold text-slate-900">{filterMonth || "Semua Periode"}</span> • Divisi: Operasional Lapangan, Teknisi CCTV & IT Support
                </p>
              </div>

              {/* Ringkasan Parameter Laporan */}
              <div className="grid grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Staf Terdata</span>
                  <p className="font-black text-slate-900 text-sm">{employeeOptions.length} Orang</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Kehadiran</span>
                  <p className="font-black text-slate-900 text-sm">{filteredAttendance.length} Log Hari</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Hadir Lapangan (GPS)</span>
                  <p className="font-black text-emerald-600 text-sm">
                    {filteredAttendance.filter((a) => a.status === "Hadir Lapangan").length} Hari
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Jam Lembur Sah</span>
                  <p className="font-black text-amber-600 text-sm">
                    {overtimeList
                      .filter((o) => o.status === "Disetujui" && (!filterMonth || filterMonth === "ALL" || o.date.startsWith(filterMonth)))
                      .reduce((sum, curr) => sum + (curr.hours || 0), 0)} Jam
                  </p>
                </div>
              </div>

              {/* Tabel Data Rekapitulasi Resmi */}
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-black text-[11px] text-slate-700">
                    <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                    <th className="p-2 border-r border-slate-300">Nama Karyawan / Teknisi</th>
                    <th className="p-2 border-r border-slate-300">Jabatan</th>
                    <th className="p-2 border-r border-slate-300 text-center">Hadir Kantor</th>
                    <th className="p-2 border-r border-slate-300 text-center">Hadir Lapangan (GPS)</th>
                    <th className="p-2 border-r border-slate-300 text-center">Jam Lembur Sah</th>
                    <th className="p-2 border-r border-slate-300 text-center">Total Hadir</th>
                    <th className="p-2 text-center">Disiplin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {employeeOptions.map((name, idx) => {
                    const logs = attendanceList.filter(
                      (a) => a.employeeName === name && (!filterMonth || filterMonth === "ALL" || a.date.startsWith(filterMonth))
                    );
                    const lapangan = logs.filter((a) => a.status === "Hadir Lapangan").length;
                    const tepat = logs.filter((a) => a.status === "Tepat Waktu").length;
                    const ot = overtimeList
                      .filter(
                        (o) =>
                          o.employeeName === name &&
                          o.status === "Disetujui" &&
                          (!filterMonth || filterMonth === "ALL" || o.date.startsWith(filterMonth))
                      )
                      .reduce((sum, curr) => sum + (curr.hours || 0), 0);
                    const disciplineRate = logs.length > 0 ? Math.round(((tepat + lapangan) / logs.length) * 100) : 100;

                    return (
                      <tr key={name} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{name}</td>
                        <td className="p-2 border-r border-slate-300 text-slate-600">
                          {name.toLowerCase().includes("admin") ? "Admin Operasional" : "Teknisi Lapangan"}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center">{tepat} Hari</td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold text-emerald-700">{lapangan} Hari</td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold text-amber-700">{ot} Jam</td>
                        <td className="p-2 border-r border-slate-300 text-center font-black text-slate-900">{logs.length} Hari</td>
                        <td className="p-2 text-center font-black text-blue-700">{disciplineRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Catatan Evaluasi Kedisiplinan & K3 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Catatan Evaluasi Operasional & K3 Lapangan:</p>
                <p>1. Seluruh presensi lapangan wajib tervalidasi dengan foto lokasi dan koordinat Google Maps saat check-in.</p>
                <p>2. Jam lembur yang tercantum telah diverifikasi dan disetujui secara sah oleh Supervisor & HRD sebagai dasar pembayaran payroll.</p>
              </div>

              {/* Dual Signature Legalitas */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-center">
                <div>
                  <p className="font-bold text-slate-500 mb-16">Diverifikasi & Diajukan Oleh,</p>
                  <p className="font-black text-slate-900 uppercase underline">RAMADHANI ST</p>
                  <p className="text-[10px] text-slate-500">Supervisor Operasional & IT Support</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500 mb-16">Mengetahui & Menyetujui,</p>
                  <p className="font-black text-slate-900 uppercase underline">DIREKTUR PT. DSTECH SMART PERKASA</p>
                  <p className="text-[10px] text-slate-500">PT. DSTech Smart Perkasa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: KONFIRMASI HAPUS */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !submitting && setDeleteModal({ isOpen: false, id: "", type: "attendance", name: "" })}
          />
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Hapus Catatan Ini?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus data untuk <span className="font-bold text-slate-800">{deleteModal.name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                disabled={submitting}
                onClick={() => setDeleteModal({ isOpen: false, id: "", type: "attendance", name: "" })}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                disabled={submitting}
                onClick={handleConfirmDelete}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
              >
                {submitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PRESENSI MANDIRI SUPERADMIN/ADMIN (LIVE WEBRTC KAMERA & GPS) */}
      {isSelfCameraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
            {/* Header Modal */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Verifikasi Wajah & GPS Satelit
                </span>
                <h3 className="text-lg font-black text-white">
                  {selfCameraMode === "checkin" ? "Presensi Masuk (Check-In)" : "Presensi Pulang (Check-Out)"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentUser.name} ({currentUser.role})
                </p>
              </div>
              <button
                type="button"
                onClick={closeSelfAttendanceModal}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {/* Kamera WebRTC Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    Kamera Live Wajah (Anti-Manipulasi)
                  </span>
                  {selfSelfiePhoto ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Foto Terambil
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Wajib Foto Langsung
                    </span>
                  )}
                </div>

                {/* Input Native Camera Intent (Khusus Aplikasi DSTech Smart / Android WebView Fallback) */}
                <input
                  ref={adminNativeSelfCameraRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleAdminNativeCameraCapture}
                />

                {selfSelfiePhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-black h-60 flex items-center justify-center">
                    <img src={selfSelfiePhoto} alt="Selfie Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelfSelfiePhoto(null);
                          startSelfCamera("user");
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md cursor-pointer hover:bg-slate-100 flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Ambil Ulang (Live)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => adminNativeSelfCameraRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Kamera HP Native</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-black h-60 flex items-center justify-center">
                      {isSelfCameraLoading ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-white text-xs">
                          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                          <span>Menghubungkan ke sensor kamera...</span>
                        </div>
                      ) : (
                        <video
                          ref={(el) => {
                            selfVideoRef.current = el;
                            if (el && selfCameraStream && el.srcObject !== selfCameraStream) {
                              el.srcObject = selfCameraStream;
                              el.muted = true;
                              el.playsInline = true;
                              el.setAttribute("playsinline", "true");
                              el.setAttribute("webkit-playsinline", "true");
                              el.play().catch(() => {});
                            }
                          }}
                          autoPlay
                          playsInline
                          muted
                          webkit-playsinline="true"
                          className={`w-full h-full object-cover ${selfCameraFacing === "user" ? "transform -scale-x-100" : ""}`}
                        />
                      )}

                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Live Camera
                      </div>

                      <button
                        type="button"
                        onClick={switchSelfCamera}
                        title="Balik Kamera"
                        className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur transition-all cursor-pointer shadow"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {selfCameraError && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                          <span>{selfCameraError}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => adminNativeSelfCameraRef.current?.click()}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all active:scale-95"
                        >
                          <Camera className="w-4 h-4" />
                          <span>📸 Buka Kamera HP Langsung Sekarang</span>
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={takeSelfSnapshot}
                      disabled={isSelfCameraLoading}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer transition-all active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Jepret Foto Selfie Sekarang</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => adminNativeSelfCameraRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Kamera live bermasalah? Buka Kamera HP Langsung</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Status Lokasi GPS */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Lokasi GPS Satelit:
                  </span>
                  <button
                    type="button"
                    onClick={detectSelfGps}
                    className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSelfDetectingGps ? "animate-spin" : ""}`} />
                    Refresh GPS
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                  {selfGpsLocation}
                </p>
                {selfGpsError && (
                  <p className="text-[10px] text-amber-600 italic">{selfGpsError}</p>
                )}
              </div>
            </div>

            {/* Footer Modal Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeSelfAttendanceModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSelfAttendance}
                disabled={isSelfCheckingIn || !selfSelfiePhoto}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                {isSelfCheckingIn ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan Presensi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Presensi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENOLAKAN PENGAJUAN CUTI (Tugas 232 / 109) */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setRejectModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900">Tolak Permohonan Dispensasi</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Anda akan menolak pengajuan <strong>{rejectModal.typeLabel}</strong> milik <strong>{rejectModal.employeeName}</strong>. Mohon berikan alasan penolakan agar transparan bagi staf:
            </p>

            <textarea
              required
              rows={3}
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Contoh: Beban proyek pada tanggal tersebut sedang padat / surat dokter tidak jelas..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={leaveActionLoading === rejectModal.leaveId}
                onClick={handleConfirmRejectLeave}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {leaveActionLoading === rejectModal.leaveId ? "Menolak..." : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
