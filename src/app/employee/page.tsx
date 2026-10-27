"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ListChecks,
  Clock,
  MapPin,
  Package,
  Bell,
  ChevronRight,
  User,
  LogOut,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  BookOpen,
  ShieldAlert,
  Send,
  X,
  Calendar,
  Layers,
  Wrench,
  Download,
  PhoneCall,
  HardHat,
  Sparkles,
  ExternalLink,
  Trash2,
  Navigation,
  Compass,
  RefreshCw,
  ArrowRightLeft,
  Calculator,
  Camera,
  Upload,
  Image as ImageIcon,
  Building,
  Briefcase,
  FileSignature,
  Loader2,
  Lock,
  HeartPulse,
  Video,
  Share2,
} from "lucide-react";

interface DamagedItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  condition: string;
  action: string;
  note?: string;
  quantity?: number;
  actionTaken?: string;
  notes?: string;
}

interface EmployeeTask {
  id: string;
  ticketNumber?: string;
  entityType?: "PT" | "NON_PT";
  type?: string;
  title: string;
  client: string;
  location: string;
  date: string;
  deadline: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "High" | "Medium" | "Urgent";
  technician: string;
  technicianPhone: string;
  scope: string[];
  equipment: string[];
  report: string;
  photos?: TaskPhoto[];
  damagedItems?: DamagedItem[];
  usedMaterials?: any[];
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string;
  invoiceStatus?: string;
  invoiceNumber?: string;
  invoiceId?: string;
  linkedMaterialRequests?: any[];
}

interface TaskPhoto {
  id: string;
  url: string;
  caption: string;
  category: "documentation" | "part_replacement";
  createdAt?: string;
}

interface MaterialItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  status: "Aman" | "Menipis" | "Habis";
  location: string;
  description: string;
  hasConversion?: boolean;
  subUnit?: string;
  conversionRatio?: number;
  subStockTotal?: number;
  conversionLabel?: string;
}

interface MaterialRequestItem {
  materialId: string;
  materialName: string;
  qty: number;
  unit: string;
  selectedUnit?: string;
  equivalentQty?: number;
  equivalentUnit?: string;
  conversionLabel?: string;
}

interface MaterialRequest {
  id: string;
  items?: MaterialRequestItem[];
  materialId: string;
  materialName: string;
  qty: number;
  unit: string;
  taskTitle: string;
  requestedBy: string;
  date: string;
  status: string;
  notes: string;
}

interface DailyReportItem {
  id: string;
  date: string;
  employeeId?: string;
  employeeName: string;
  employeeEmail?: string;
  taskId?: string;
  ticketNumber?: string;
  taskTitle: string;
  clientName: string;
  location?: string;
  activityDescription: string;
  progressPercentage: number;
  blockers?: string;
  nextAction?: string;
  photos?: TaskPhoto[];
  statusAfter?: string;
  createdAt?: string;
}

interface AttendanceLog {
  id: string;
  date: string;
  employeeName: string;
  employeeEmail?: string | null;
  checkIn: string;
  checkOut: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  mapsUrl?: string | null;
  selfieCheckIn?: string | null;
  checkOutLocation?: string | null;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkOutAccuracy?: number | null;
  checkOutMapsUrl?: string | null;
  selfieCheckOut?: string | null;
  status: string;
  notes: string;
  projectId?: string | null;
  projectName?: string | null;
  projectRole?: string | null;
}

interface OvertimeLog {
  id: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  taskTitle: string;
  reason: string;
  status: string;
  appliedAt: string;
}

interface Announcement {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  summary: string;
  content: string;
  urgent: boolean;
}

interface KmsGuideItem {
  id: string;
  title: string;
  category: "sop" | "k3" | "firmware" | "kontak" | "troubleshooting";
  categoryLabel?: string;
  summary: string;
  content: string;
  downloadUrl?: string;
  fileSize?: string;
  contactName?: string;
  contactPhone?: string;
  contactRole?: string;
  updatedAt: string;
  updatedBy: string;
}

interface EmployeeUserSession {
  isLoggedIn: boolean;
  id: string;
  role: string;
  name: string;
  email: string;
  phone?: string;
  loginTime?: string;
  attendanceLocationLock?: "ANY" | "OFFICE";
  officeRadius?: number;
}

const OFFICE_COORDS = { lat: -6.031846, lng: 106.037198, name: "Kantor DSTech Cilegon" };

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function getTodayWibDate(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function getCurrentWibTime(): string {
  const now = new Date();
  return (
    now.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " WIB"
  );
}

export default function EmployeeDashboard() {
  const router = useRouter();

  // Current logged in technician session
  const [currentUser, setCurrentUser] = useState<EmployeeUserSession | null>(null);

  // Navigation state
  const [activeTab, setActiveTab] = useState<"tasks" | "inventory" | "attendance" | "meetings">("tasks");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Office & Geofence GPS Settings (loaded from API)
  const [officeGps, setOfficeGps] = useState<{
    lat: number;
    lng: number;
    radius: number;
    name: string;
    allowFlexible: boolean;
    projectLocations: any[];
  }>({
    lat: -6.031846,
    lng: 106.037198,
    radius: 250,
    name: "Kantor DSTech Cilegon",
    allowFlexible: true,
    projectLocations: [],
  });

  // Data states
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [overtimeLogs, setOvertimeLogs] = useState<OvertimeLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [kmsList, setKmsList] = useState<KmsGuideItem[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReportItem[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [meetingsList, setMeetingsList] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalHours: 168,
    overtimeHours: 14,
    targetHours: 160,
    presenceDays: 21,
  });

  // Filter Proyek PT: Hanya tampilkan jika nama/email user ada di tim personil atau PIC (Tugas 138)
  const myAssignedProjects = useMemo(() => {
    if (!currentUser) return [];
    const isSuperOrAdmin = currentUser.role === "SUPERADMIN" || currentUser.role === "ADMIN";
    const uName = (currentUser.name || "").toLowerCase().trim();
    const uEmail = (currentUser.email || "").toLowerCase().trim();
    const uPhone = (currentUser.phone || "").replace(/\D/g, "");

    return (projectsList || []).filter((p: any) => {
      if (p.status === "Completed" || p.status === "Cancelled") return false;
      if (isSuperOrAdmin) return true;

      // Cek PIC Proyek
      const pic = (p.picProject || p.picName || "").toLowerCase().trim();
      if (pic && (pic.includes(uName) || uName.includes(pic))) return true;
      if (p.picEmail && p.picEmail.toLowerCase().trim() === uEmail) return true;

      // Cek tim personil assignedEmployees
      if (Array.isArray(p.assignedEmployees)) {
        return p.assignedEmployees.some((emp: any) => {
          if (typeof emp === "string") {
            const empLower = emp.toLowerCase().trim();
            return empLower.includes(uName) || uName.includes(empLower) || empLower === uEmail;
          }
          if (emp && typeof emp === "object") {
            const empName = (emp.name || emp.employeeName || "").toLowerCase().trim();
            const empEmail = (emp.email || emp.employeeEmail || "").toLowerCase().trim();
            const empPhone = String(emp.phone || "").replace(/\D/g, "");
            if (empName && (empName.includes(uName) || uName.includes(empName))) return true;
            if (empEmail && empEmail === uEmail) return true;
            if (uPhone && empPhone && (uPhone.endsWith(empPhone) || empPhone.endsWith(uPhone))) return true;
          }
          return false;
        });
      }
      return false;
    });
  }, [projectsList, currentUser]);

  // Filter Tiket Toko / Maintenance: Hanya tampilkan jika user ditugaskan sebagai teknisi / PIC (Tugas 138)
  const myAssignedTasks = useMemo(() => {
    if (!currentUser) return [];
    const isSuperOrAdmin = currentUser.role === "SUPERADMIN" || currentUser.role === "ADMIN";
    const uName = (currentUser.name || "").toLowerCase().trim();
    const uPhone = (currentUser.phone || "").replace(/\D/g, "");

    return (tasks || []).filter((t: EmployeeTask) => {
      if (isSuperOrAdmin) return true;
      const tech = (t.technician || "").toLowerCase().trim();
      if (tech && (tech.includes(uName) || uName.includes(tech))) return true;
      const tPhone = (t.technicianPhone || "").replace(/\D/g, "");
      if (uPhone && tPhone && (uPhone.endsWith(tPhone) || tPhone.endsWith(uPhone))) return true;
      if ((t as any).assignedTo && String((t as any).assignedTo).toLowerCase().includes(uName)) return true;
      return false;
    });
  }, [tasks, currentUser]);

  // Filter states
  const [taskFilter, setTaskFilter] = useState<string>("Semua");
  const [materialSearch, setMaterialSearch] = useState<string>("");
  const [inventorySubTab, setInventorySubTab] = useState<"stock" | "requests">("stock");

  // Modals state
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [taskStatusForm, setTaskStatusForm] = useState<{
    status: "Pending" | "In Progress" | "Completed";
    report: string;
    photos: TaskPhoto[];
    damagedItems: DamagedItem[];
    latitude?: number | null;
    longitude?: number | null;
    googleMapsUrl?: string;
  }>({
    status: "In Progress",
    report: "",
    photos: [],
    damagedItems: [],
    latitude: null,
    longitude: null,
    googleMapsUrl: "",
  });
  const [isUploadingTaskPhoto, setIsUploadingTaskPhoto] = useState<boolean>(false);
  const [taskPhotoCategory, setTaskPhotoCategory] = useState<"documentation" | "part_replacement">("documentation");
  const [taskPhotoCaption, setTaskPhotoCaption] = useState<string>("");
  const [newDamagedItem, setNewDamagedItem] = useState<{
    name: string;
    quantity: number;
    unit: string;
    condition: string;
    actionTaken: string;
    notes: string;
  }>({
    name: "",
    quantity: 1,
    unit: "unit",
    condition: "Rusak / Mati Total",
    actionTaken: "Diganti Baru dari Gudang",
    notes: "",
  });

  interface FormRequestItem {
    materialId: string;
    materialName: string;
    qty: number;
    unit: string;
    maxStock: number;
    hasConversion?: boolean;
    subUnit?: string;
    conversionRatio?: number;
    subStockTotal?: number;
    conversionLabel?: string;
    selectedUnit?: string;
    equivalentQty?: number;
    equivalentUnit?: string;
  }

  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [requestForm, setRequestForm] = useState<{
    items: FormRequestItem[];
    taskTitle: string;
    taskId?: string;
    ticketNumber?: string;
    notes: string;
  }>({
    items: [
      {
        materialId: "",
        materialName: "",
        qty: 1,
        unit: "Pcs",
        maxStock: 999,
        hasConversion: false,
        selectedUnit: "Pcs",
      },
    ],
    taskTitle: "",
    taskId: "",
    ticketNumber: "",
    notes: "",
  });

  // Quick Converter Calculator State
  const [calcMaterialId, setCalcMaterialId] = useState<string>("dstech_mat_1");
  const [calcInputQty, setCalcInputQty] = useState<number>(1);
  const [calcDirection, setCalcDirection] = useState<"primary_to_sub" | "sub_to_primary">("primary_to_sub");

  // Modal State Pembuatan Tiket Maintenance Mandiri Teknisi
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [isSubmittingNewTask, setIsSubmittingNewTask] = useState<boolean>(false);
  const [newTaskForm, setNewTaskForm] = useState({
    ticketNumber: "",
    entityType: "PT" as "PT" | "NON_PT",
    type: "Corrective Maintenance",
    title: "",
    client: "",
    clientId: "",
    clientPhone: "",
    clientPic: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    deadline: new Date().toISOString().split("T")[0],
    status: "In Progress" as "Pending" | "In Progress" | "Completed",
    priority: "Medium" as "Normal" | "Medium" | "High" | "Urgent",
    technician: "",
    technicianPhone: "",
    scope: [
      "Pengecekan dan investigasi kendala di lokasi",
      "Perbaikan konektor / modul perangkat",
      "Uji fungsi operasional sistem",
    ],
    equipment: ["Tool Set Obeng & Tang", "Digital Multitester"],
    notes: "",
    latitude: null as number | null,
    longitude: null as number | null,
    googleMapsUrl: "",
  });
  const [newScopeItemInput, setNewScopeItemInput] = useState<string>("");
  const [newEquipmentItemInput, setNewEquipmentItemInput] = useState<string>("");

  // Modal State Pelaporan Kerja Harian Teknisi (Tugas 137 & 138)
  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState<boolean>(false);
  const [isSubmittingDailyReport, setIsSubmittingDailyReport] = useState<boolean>(false);
  const [dailyReportForm, setDailyReportForm] = useState({
    date: getTodayWibDate(),
    reportTime: "",
    selectedJobKey: "NON_PROJECT",
    jobType: "NON_PROJECT" as "PROJECT_PT" | "MAINTENANCE_TOKO" | "NON_PROJECT",
    taskId: "",
    projectId: "",
    projectCode: "",
    projectName: "",
    ticketNumber: "",
    taskTitle: "Kegiatan Rutin Kantor / Standby Internal (Non-Project & Maintenance)",
    clientName: "PT. DSTech Smart Perkasa (Internal)",
    location: "Kantor DSTech Cilegon / Workshop",
    activityDescription: "",
    progressPercentage: 50,
    blockers: "",
    nextAction: "",
    statusAfter: "In Progress",
    photos: [] as TaskPhoto[],
  });

  interface GeoCoords {
    lat: number;
    lng: number;
    accuracy?: number | null;
    source: "gps" | "preset" | "unlocked";
  }

  // Predefined location coordinates (Banten / Cilegon area)
  const LOCATION_PRESETS: { [key: string]: { lat: number; lng: number } } = {
    "Kantor DSTech Cilegon": { lat: -6.031846, lng: 106.037198 },
    "Kawasan Industri Krakatau Posco": { lat: -6.0125, lng: 106.0089 },
    "RS Kurnia Cilegon": { lat: -6.0163, lng: 106.0461 },
    "Perumahan Metro Royal": { lat: -6.0289, lng: 106.0512 },
    "Hotel Pesona Merak": { lat: -5.9382, lng: 105.9981 },
    "Area Lapangan / Dinas Luar": { lat: -6.0175, lng: 106.0538 },
  };

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState<boolean>(false);
  const [checkInLocation, setCheckInLocation] = useState<string>("Lokasi GPS Satelit");
  const [checkInNotes, setCheckInNotes] = useState<string>("");
  const [checkInCoords, setCheckInCoords] = useState<GeoCoords>({
    lat: 0,
    lng: 0,
    accuracy: null,
    source: "unlocked",
  });
  const [isDetectingCheckInGps, setIsDetectingCheckInGps] = useState<boolean>(false);
  const [gpsErrorCheckIn, setGpsErrorCheckIn] = useState<string | null>(null);

  // Penugasan Proyek PKWT pada Absensi
  const [selectedProjectIdCheckIn, setSelectedProjectIdCheckIn] = useState<string>("");
  const [selectedProjectIdCheckOut, setSelectedProjectIdCheckOut] = useState<string>("");

  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState<boolean>(false);
  const [checkOutLocation, setCheckOutLocation] = useState<string>("Lokasi GPS Satelit");
  const [checkOutSummary, setCheckOutSummary] = useState<string>("");
  const [checkOutCoords, setCheckOutCoords] = useState<GeoCoords>({
    lat: 0,
    lng: 0,
    accuracy: null,
    source: "unlocked",
  });
  const [isDetectingCheckOutGps, setIsDetectingCheckOutGps] = useState<boolean>(false);
  const [gpsErrorCheckOut, setGpsErrorCheckOut] = useState<string | null>(null);

  // Wajib Foto Selfie Kamera States & Refs (Kamera Langsung WebRTC Anti-Manipulasi & Native Camera Intent Fallback)
  const [selfieCheckInPhoto, setSelfieCheckInPhoto] = useState<string | null>(null);
  const [selfieCheckOutPhoto, setSelfieCheckOutPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<"checkin" | "checkout" | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const nativeCheckInInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCheckOutInputRef = useRef<HTMLInputElement | null>(null);

  // Pasang stream secara reaktif setiap kali elemen video terpasang di DOM
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      const vid = videoRef.current;
      vid.srcObject = cameraStream;
      vid.muted = true;
      vid.playsInline = true;
      vid.setAttribute("playsinline", "true");
      vid.setAttribute("webkit-playsinline", "true");
      vid.onloadedmetadata = () => {
        vid.play().catch((e) => console.log("Auto-play live camera error:", e));
      };
    }
  }, [isCameraActive, cameraStream]);

  // Handler Native Camera Capture (Khusus Aplikasi DSTech Smart / Android WebView)
  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>, mode: "checkin" | "checkout") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (mode === "checkin") {
          setSelfieCheckInPhoto(dataUrl);
        } else {
          setSelfieCheckOutPhoto(dataUrl);
        }
        stopCamera();
        showToast("📸 Foto selfie berhasil diambil langsung dari kamera HP!");
      }
    };
    reader.readAsDataURL(file);
    // Reset input agar dapat mengambil foto kembali jika diinginkan
    e.target.value = "";
  };

  // Mulai Kamera Langsung Perangkat (Dengan Multi-Fallback untuk HP Android, iPhone, Aplikasi WebView & Desktop)
  const startCamera = async (mode: "checkin" | "checkout", facing: "user" | "environment" = cameraFacing) => {
    try {
      setCameraError(null);
      setCameraLoading(true);
      setCameraMode(mode);
      setIsCameraActive(true);

      // Hentikan stream yang sedang berjalan terlebih dahulu
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
        setCameraStream(null);
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

      // Percobaan 1: Ideal facingMode dengan resolusi mobile standar
      try {
        stream = await requestMediaStream({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      } catch (err1: any) {
        console.warn("Percobaan 1 gagal, mencoba facingMode langsung...", err1);
        try {
          // Percobaan 2: Coba dengan exact facingMode string
          stream = await requestMediaStream({
            video: { facingMode: facing },
            audio: false,
          });
        } catch (err2: any) {
          console.warn("Percobaan 2 gagal, mencoba generic video: true...", err2);
          try {
            // Percobaan 3: Generic fallback video true
            stream = await requestMediaStream({
              video: true,
              audio: false,
            });
          } catch (err3: any) {
            console.warn("Percobaan 3 gagal...", err3);
            throw err3;
          }
        }
      }

      if (stream) {
        cameraStreamRef.current = stream;
        setCameraStream(stream);
        if (videoRef.current) {
          const vid = videoRef.current;
          vid.srcObject = stream;
          vid.muted = true;
          vid.playsInline = true;
          vid.setAttribute("playsinline", "true");
          vid.setAttribute("webkit-playsinline", "true");
          vid.play().catch(() => {});
        }
      }
    } catch (err: any) {
      console.error("Gagal membuka kamera HP/perangkat via WebRTC:", err);
      setIsCameraActive(false);
      setCameraMode(null);
      let userFriendlyMsg = "Kamera live WebRTC tidak terhubung.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        userFriendlyMsg = "Izin kamera live dibatasi pada aplikasi ini. Silakan klik tombol '📸 Buka Kamera HP Langsung' di bawah untuk mengambil selfie.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        userFriendlyMsg = "Tidak ditemukan sensor kamera WebRTC. Silakan gunakan tombol kamera HP di bawah.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        userFriendlyMsg = "Kamera sedang digunakan aplikasi lain. Atau gunakan tombol kamera HP langsung.";
      } else if (err.name === "OverconstrainedError") {
        userFriendlyMsg = "Kamera tidak mendukung resolusi WebRTC. Gunakan tombol kamera HP langsung di bawah.";
      } else if (err.message) {
        userFriendlyMsg = err.message;
      }
      setCameraError(userFriendlyMsg);
      showToast(userFriendlyMsg);
    } finally {
      setCameraLoading(false);
    }
  };

  // Balik / Putar Kamera Depan <-> Belakang
  const switchCamera = () => {
    const nextFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(nextFacing);
    if (cameraMode) {
      startCamera(cameraMode, nextFacing);
    }
  };

  // Matikan Kamera
  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      cameraStreamRef.current = null;
    }
    setCameraStream(null);
    setIsCameraActive(false);
    setCameraMode(null);
    setCameraLoading(false);
  };

  // Ambil Frame Foto Selfie Langsung (Canvas Snapshot Anti-Manipulasi)
  const takeSnapshot = (mode: "checkin" | "checkout") => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Jika kamera depan, balik gambar agar natural (tidak terbalik cermin)
    if (cameraFacing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.65);
    if (mode === "checkin") {
      setSelfieCheckInPhoto(dataUrl);
    } else {
      setSelfieCheckOutPhoto(dataUrl);
    }
    stopCamera();
    showToast("✓ Foto Selfie Wajah Berhasil Diambil!");
  };

  // Map Preview Modal for attendance history table
  const [previewMapData, setPreviewMapData] = useState<{
    isOpen: boolean;
    title: string;
    locationName: string;
    lat: number;
    lng: number;
    mapsUrl: string;
  } | null>(null);

  // Photo Selfie Preview Modal
  const [previewPhotoModal, setPreviewPhotoModal] = useState<{
    isOpen: boolean;
    title: string;
    photoUrl: string;
    time: string;
    location: string;
  } | null>(null);

  const detectGpsLocation = (mode: "checkin" | "checkout") => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      const err = "Browser perangkat tidak mendukung Geolocation GPS satelit.";
      if (mode === "checkin") setGpsErrorCheckIn(err);
      else setGpsErrorCheckOut(err);
      showToast(err);
      return;
    }

    if (mode === "checkin") {
      setIsDetectingCheckInGps(true);
      setGpsErrorCheckIn(null);
    } else {
      setIsDetectingCheckOutGps(true);
      setGpsErrorCheckOut(null);
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: GeoCoords = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          source: "gps",
        };
        if (mode === "checkin") {
          setCheckInCoords(coords);
          setIsDetectingCheckInGps(false);
          setCheckInLocation(`GPS Satelit (${coords.lat}, ${coords.lng})`);
          showToast(`✓ Sinyal GPS satelit terkunci sah! Akurasi: ±${coords.accuracy}m`);
        } else {
          setCheckOutCoords(coords);
          setIsDetectingCheckOutGps(false);
          setCheckOutLocation(`GPS Satelit (${coords.lat}, ${coords.lng})`);
          showToast(`✓ Sinyal GPS Pulang terkunci sah! Akurasi: ±${coords.accuracy}m`);
        }
      },
      (err) => {
        const errorMsg =
          "Izin akses GPS wajib diizinkan untuk absensi. Pengisian lokasi manual dilarang oleh manajemen!";
        if (mode === "checkin") {
          setIsDetectingCheckInGps(false);
          setGpsErrorCheckIn(errorMsg);
        } else {
          setIsDetectingCheckOutGps(false);
          setGpsErrorCheckOut(errorMsg);
        }
        showToast(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleLocationPresetChange = (loc: string, mode: "checkin" | "checkout") => {
    if (mode === "checkin") {
      setCheckInLocation(loc);
      if (LOCATION_PRESETS[loc]) {
        setCheckInCoords({
          lat: LOCATION_PRESETS[loc].lat,
          lng: LOCATION_PRESETS[loc].lng,
          accuracy: 10,
          source: "preset",
        });
        setGpsErrorCheckIn(null);
      }
    } else {
      setCheckOutLocation(loc);
      if (LOCATION_PRESETS[loc]) {
        setCheckOutCoords({
          lat: LOCATION_PRESETS[loc].lat,
          lng: LOCATION_PRESETS[loc].lng,
          accuracy: 10,
          source: "preset",
        });
        setGpsErrorCheckOut(null);
      }
    }
  };

  const openCheckInModal = () => {
    setCheckInCoords({ lat: 0, lng: 0, accuracy: null, source: "unlocked" });
    setSelfieCheckInPhoto(null);
    setIsCheckInModalOpen(true);
    detectGpsLocation("checkin");
  };

  const openCheckOutModal = () => {
    setCheckOutCoords({ lat: 0, lng: 0, accuracy: null, source: "unlocked" });
    setSelfieCheckOutPhoto(null);
    setIsCheckOutModalOpen(true);
    detectGpsLocation("checkout");
  };

  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState<boolean>(false);
  const [overtimeForm, setOvertimeForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "17:30",
    endTime: "20:30",
    hours: 3,
    taskTitle: "",
    reason: "",
  });

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isAddAnnouncementModalOpen, setIsAddAnnouncementModalOpen] = useState<boolean>(false);
  const [newAnnouncementForm, setNewAnnouncementForm] = useState({
    title: "",
    category: "PROSEDUR",
    summary: "",
    content: "",
    urgent: false,
  });

  const [isKmsModalOpen, setIsKmsModalOpen] = useState<boolean>(false);
  const [kmsTab, setKmsTab] = useState<"sop" | "k3" | "firmware" | "kontak" | "troubleshooting">("sop");

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  // State Pengajuan Cuti, Izin, dan Sakit (Tugas 232 / 109)
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveQuota, setLeaveQuota] = useState<{
    annualQuota: number;
    paidPermissionQuota: number;
    usedDays: number;
    remainingDays: number;
  }>({ annualQuota: 12, paidPermissionQuota: 3, usedDays: 0, remainingDays: 12 });
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState<boolean>(false);
  const [isUploadingDoctorNote, setIsUploadingDoctorNote] = useState<boolean>(false);
  const [leaveForm, setLeaveForm] = useState({
    type: "ANNUAL_LEAVE" as "ANNUAL_LEAVE" | "SPECIAL_PERMISSION" | "SICK_LEAVE",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    totalDays: 1,
    reason: "",
    attachmentUrl: "" as string | null,
  });

  // State Rapat & Notula (Tugas 233 / 110)
  const [meetingFilter, setMeetingFilter] = useState<"ALL" | "ACTIVE" | "UPCOMING" | "ENDED">("ALL");
  const [meetingSearch, setMeetingSearch] = useState<string>("");
  const [selectedMeetingDetail, setSelectedMeetingDetail] = useState<any | null>(null);

  const fetchLeaveData = async (empName?: string) => {
    try {
      const targetName = empName || currentUser?.name;
      if (!targetName) return;
      const res = await fetch(`/api/employee/leave?employeeName=${encodeURIComponent(targetName)}&t=${Date.now()}`);
      if (res.ok) {
        const d = await res.json();
        if (d.success) {
          if (Array.isArray(d.leaves)) setLeaveRequests(d.leaves);
          if (d.quota) setLeaveQuota(d.quota);
        }
      }
    } catch (e) {
      console.error("Gagal memuat data cuti:", e);
    }
  };

  const handleLeaveDateChange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    let days = 1;
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    setLeaveForm((prev) => ({
      ...prev,
      startDate: startStr,
      endDate: endStr,
      totalDays: days,
    }));
  };

  const handleUploadDoctorNote = async (file: File) => {
    try {
      setIsUploadingDoctorNote(true);
      showToast("Mengunggah surat dokter / bukti...");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docType", "doctor_note");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setLeaveForm((prev) => ({ ...prev, attachmentUrl: json.url }));
        showToast("Surat keterangan dokter berhasil diunggah.");
      } else {
        showToast(json.message || "Gagal mengunggah file.");
      }
    } catch (err) {
      showToast("Gagal mengunggah berkas.");
    } finally {
      setIsUploadingDoctorNote(false);
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      showToast("Mohon tuliskan alasan permohonan.");
      return;
    }
    if (leaveForm.type === "SICK_LEAVE" && !leaveForm.attachmentUrl) {
      showToast("Wajib melampirkan Surat Keterangan Dokter untuk izin sakit.");
      return;
    }
    setIsSubmittingLeave(true);
    try {
      const res = await fetch("/api/employee/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName: currentUser?.name || "Karyawan",
          employeeEmail: currentUser?.email || "",
          department: currentUser?.role || "Operasional",
          type: leaveForm.type,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          totalDays: leaveForm.totalDays,
          reason: leaveForm.reason,
          attachmentUrl: leaveForm.attachmentUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Pengajuan berhasil dikirim.");
        setIsLeaveModalOpen(false);
        setLeaveForm({
          type: "ANNUAL_LEAVE",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
          totalDays: 1,
          reason: "",
          attachmentUrl: null,
        });
        fetchLeaveData(currentUser?.name);
      } else {
        showToast(data.message || "Gagal mengirim pengajuan.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat mengirim pengajuan.");
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load logged-in technician session from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rawAuth = localStorage.getItem("dstech_employee_auth") || localStorage.getItem("dstech_admin_auth");
        if (rawAuth) {
          const parsed = JSON.parse(rawAuth);
          if (parsed && (parsed.name || parsed.email)) {
            setCurrentUser(parsed);
            fetch("/api/users")
              .then((r) => r.json())
              .then((data) => {
                if (data.success && Array.isArray(data.data)) {
                  const matched = data.data.find(
                    (u: any) =>
                      (parsed.email && u.email && u.email.toLowerCase() === parsed.email.toLowerCase()) ||
                      (parsed.name && u.name && u.name.trim().toLowerCase() === parsed.name.trim().toLowerCase())
                  );
                  if (matched) {
                    setCurrentUser((prev: any) => ({
                      ...prev,
                      ...matched,
                      attendanceLocationLock: matched.attendanceLocationLock || "ANY",
                      officeRadius: matched.officeRadius ? Number(matched.officeRadius) : 100,
                    }));
                  }
                }
              })
              .catch(() => {});
            fetchLeaveData(parsed.name);
          }
        }
      } catch (err) {
        console.error("Failed to load technician auth:", err);
      }
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [resTasks, resInv, resAtt, resAnn, resKms, resFin, resReports, resMeetings] = await Promise.all([
          fetch("/api/employee/tasks"),
          fetch("/api/employee/inventory"),
          fetch(`/api/employee/attendance?t=${Date.now()}`, {
            cache: "no-store",
            headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
          }),
          fetch("/api/employee/announcements"),
          fetch("/api/kms"),
          fetch("/api/finance"),
          fetch("/api/employee/daily-reports"),
          fetch(`/api/meetings?t=${Date.now()}`, { cache: "no-store" }),
        ]);

        if (resTasks.ok) {
          const d = await resTasks.json();
          if (d.data) setTasks(d.data);
        }
        if (resInv.ok) {
          const d = await resInv.json();
          if (d.materials) setMaterials(d.materials);
          if (d.requests) setRequests(d.requests);
        }
        if (resAtt.ok) {
          const d = await resAtt.json();
          if (d.attendance) setAttendanceLogs(d.attendance);
          if (d.overtime) setOvertimeLogs(d.overtime);
          if (d.monthlyStats) setMonthlyStats(d.monthlyStats);
          if (d.officeSettings) {
            setOfficeGps({
              lat: typeof d.officeSettings.latitude === "number" ? d.officeSettings.latitude : -6.031846,
              lng: typeof d.officeSettings.longitude === "number" ? d.officeSettings.longitude : 106.037198,
              radius: typeof d.officeSettings.defaultRadius === "number" ? d.officeSettings.defaultRadius : 250,
              name: d.officeSettings.name || "Kantor DSTech Cilegon",
              allowFlexible: d.officeSettings.allowFlexibleAttendance ?? true,
              projectLocations: d.officeSettings.projectLocations || [],
            });
          }
        }
        if (resAnn.ok) {
          const d = await resAnn.json();
          if (d.data) setAnnouncements(d.data);
        }
        if (resKms && resKms.ok) {
          const d = await resKms.json();
          if (d.data && Array.isArray(d.data)) setKmsList(d.data);
        }
        if (resFin && resFin.ok) {
          const finData = await resFin.json();
          if (finData?.data?.projects && Array.isArray(finData.data.projects)) {
            setProjectsList(
              finData.data.projects.filter((p: any) => p.status !== "Completed" && p.status !== "Cancelled")
            );
          }
        }
        if (resReports && resReports.ok) {
          const d = await resReports.json();
          if (d.data && Array.isArray(d.data)) setDailyReports(d.data);
        }
        if (resMeetings && resMeetings.ok) {
          const mData = await resMeetings.json();
          if (mData?.data && Array.isArray(mData.data)) {
            setMeetingsList(mData.data);
          }
        }
      } catch (err) {
        console.warn("Using offline fallback data for employee portal:", err);
      }
    }
    loadData();

    // Listener sinkronisasi absensi real-time
    const handleAttendanceSync = () => {
      fetch(`/api/employee/attendance?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.attendance)) {
            setAttendanceLogs(d.attendance);
          }
          if (d.officeSettings) {
            setOfficeGps({
              lat: typeof d.officeSettings.latitude === "number" ? d.officeSettings.latitude : -6.031846,
              lng: typeof d.officeSettings.longitude === "number" ? d.officeSettings.longitude : 106.037198,
              radius: typeof d.officeSettings.defaultRadius === "number" ? d.officeSettings.defaultRadius : 250,
              name: d.officeSettings.name || "Kantor DSTech Cilegon",
              allowFlexible: d.officeSettings.allowFlexibleAttendance ?? true,
              projectLocations: d.officeSettings.projectLocations || [],
            });
          }
        })
        .catch(() => {});
    };

    const handleGpsSettingsSync = (ev: any) => {
      if (ev.detail) {
        setOfficeGps({
          lat: Number(ev.detail.officeLatitude) || -6.031846,
          lng: Number(ev.detail.officeLongitude) || 106.037198,
          radius: Number(ev.detail.geofenceRadiusMeters) || 250,
          name: ev.detail.officeName || "Kantor DSTech Cilegon",
          allowFlexible: ev.detail.allowFlexibleAttendance ?? true,
          projectLocations: ev.detail.projectLocations || [],
        });
      }
    };

    window.addEventListener("dstech_attendance_updated", handleAttendanceSync);
    window.addEventListener("dstech_gps_settings_updated", handleGpsSettingsSync);
    window.addEventListener("storage", (ev) => {
      if (ev.key === "dstech_last_attendance_sync") {
        handleAttendanceSync();
      }
    });

    return () => {
      window.removeEventListener("dstech_attendance_updated", handleAttendanceSync);
    };
  }, []);

  // Handler ambil koordinat GPS terkini teknisi
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Perangkat Anda tidak mendukung fitur Geolocation.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        setTaskStatusForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          googleMapsUrl: mapsUrl,
        }));
        setIsLocating(false);
        showToast("Koordinat GPS berhasil dikunci!");
      },
      (err) => {
        setIsLocating(false);
        showToast("Gagal mengambil lokasi GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handler kelola barang rusak yang diganti / ditarik
  const handleAddDamagedItem = () => {
    if (!newDamagedItem.name.trim()) {
      showToast("Nama komponen / barang rusak wajib diisi");
      return;
    }
    const newItem: DamagedItem = {
      id: `dmg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newDamagedItem.name.trim(),
      qty: Number(newDamagedItem.quantity) || 1,
      unit: newDamagedItem.unit || "unit",
      condition: newDamagedItem.condition,
      action: newDamagedItem.actionTaken,
      note: newDamagedItem.notes || "",
      quantity: Number(newDamagedItem.quantity) || 1,
      actionTaken: newDamagedItem.actionTaken,
      notes: newDamagedItem.notes || "",
    };
    setTaskStatusForm((prev) => ({
      ...prev,
      damagedItems: [...(prev.damagedItems || []), newItem],
    }));
    setNewDamagedItem({
      name: "",
      quantity: 1,
      unit: "unit",
      condition: "Rusak / Mati Total",
      actionTaken: "Diganti Baru dari Gudang",
      notes: "",
    });
    showToast("Komponen rusak ditambahkan ke daftar");
  };

  const handleRemoveDamagedItem = (idOrIndex: string | number) => {
    setTaskStatusForm((prev) => ({
      ...prev,
      damagedItems: (prev.damagedItems || []).filter((item, idx) =>
        typeof idOrIndex === "number" ? idx !== idOrIndex : item.id !== idOrIndex
      ),
    }));
  };

  const handleUpdateDamagedItem = (id: string, field: keyof DamagedItem, value: any) => {
    setTaskStatusForm((prev) => ({
      ...prev,
      damagedItems: (prev.damagedItems || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Handler Buka & Kirim Laporan Kegiatan Harian Teknisi (Tugas 137 & 138)
  const handleOpenDailyReportModal = (task?: EmployeeTask, project?: any) => {
    const today = getTodayWibDate();
    const currentTime = getCurrentWibTime();

    if (task) {
      setDailyReportForm({
        date: today,
        reportTime: currentTime,
        selectedJobKey: `task_${task.id}`,
        jobType: "MAINTENANCE_TOKO",
        taskId: task.id,
        projectId: "",
        projectCode: "",
        projectName: "",
        ticketNumber: task.ticketNumber || "",
        taskTitle: task.title || "Pekerjaan Tiket Maintenance",
        clientName: task.client || "Klien Toko",
        location: task.location || "",
        activityDescription: "",
        progressPercentage: task.status === "Completed" ? 100 : 50,
        blockers: "",
        nextAction: "",
        statusAfter: task.status || "In Progress",
        photos: [],
      });
    } else if (project) {
      setDailyReportForm({
        date: today,
        reportTime: currentTime,
        selectedJobKey: `prj_${project.id}`,
        jobType: "PROJECT_PT",
        taskId: "",
        projectId: project.id,
        projectCode: project.projectCode || "",
        projectName: project.projectName || "",
        ticketNumber: "",
        taskTitle: project.projectName || "Proyek PT DSTech",
        clientName: project.clientName || "Klien PT",
        location: project.clientAddress || "Area Lapangan Proyek PT",
        activityDescription: "",
        progressPercentage: project.status === "Completed" ? 100 : 50,
        blockers: "",
        nextAction: "",
        statusAfter: project.status || "In Progress",
        photos: [],
      });
    } else {
      // Default: utamakan Proyek PT jika ada, atau Tiket Toko jika ada, atau Non-Project
      if (myAssignedProjects.length > 0) {
        const prj = myAssignedProjects[0];
        setDailyReportForm({
          date: today,
          reportTime: currentTime,
          selectedJobKey: `prj_${prj.id}`,
          jobType: "PROJECT_PT",
          taskId: "",
          projectId: prj.id,
          projectCode: prj.projectCode || "",
          projectName: prj.projectName || "",
          ticketNumber: "",
          taskTitle: prj.projectName || "Proyek PT DSTech",
          clientName: prj.clientName || "Klien PT",
          location: prj.clientAddress || "Area Lapangan Proyek PT",
          activityDescription: "",
          progressPercentage: prj.status === "Completed" ? 100 : 50,
          blockers: "",
          nextAction: "",
          statusAfter: prj.status || "In Progress",
          photos: [],
        });
      } else if (myAssignedTasks.length > 0) {
        const t = myAssignedTasks[0];
        setDailyReportForm({
          date: today,
          reportTime: currentTime,
          selectedJobKey: `task_${t.id}`,
          jobType: "MAINTENANCE_TOKO",
          taskId: t.id,
          projectId: "",
          projectCode: "",
          projectName: "",
          ticketNumber: t.ticketNumber || "",
          taskTitle: t.title || "Pekerjaan Tiket Maintenance",
          clientName: t.client || "Klien Toko",
          location: t.location || "",
          activityDescription: "",
          progressPercentage: t.status === "Completed" ? 100 : 50,
          blockers: "",
          nextAction: "",
          statusAfter: t.status || "In Progress",
          photos: [],
        });
      } else {
        // Kegiatan Non-Project & Non-Maintenance (Rutin Toko / Internal)
        setDailyReportForm({
          date: today,
          reportTime: currentTime,
          selectedJobKey: "NON_PROJECT",
          jobType: "NON_PROJECT",
          taskId: "",
          projectId: "",
          projectCode: "",
          projectName: "",
          ticketNumber: "",
          taskTitle: "Kegiatan Rutin Kantor / Standby Internal (Non-Project & Maintenance)",
          clientName: "PT. DSTech Smart Perkasa (Internal)",
          location: "Kantor DSTech Cilegon / Workshop",
          activityDescription: "",
          progressPercentage: 100,
          blockers: "",
          nextAction: "",
          statusAfter: "Completed",
          photos: [],
        });
      }
    }
    setIsDailyReportModalOpen(true);
  };

  const handleSubmitDailyReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyReportForm.activityDescription.trim()) {
      showToast("Uraian kegiatan pekerjaan hari ini wajib diisi!");
      return;
    }

    try {
      setIsSubmittingDailyReport(true);
      // Selalu sertakan jam real-time saat klik kirim
      const latestReportTime = getCurrentWibTime();
      const res = await fetch("/api/employee/daily-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dailyReportForm,
          reportTime: latestReportTime,
          employeeId: currentUser?.id || "",
          employeeName: currentUser?.name || "Teknisi Lapangan",
          employeeEmail: currentUser?.email || "",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("✓ Laporan Kegiatan Harian Berhasil Disimpan & Terverifikasi Sistem!");
        if (data.data) {
          setDailyReports((prev) => [data.data, ...prev]);
        }
        if (dailyReportForm.taskId) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === dailyReportForm.taskId
                ? {
                    ...t,
                    status: dailyReportForm.statusAfter as any,
                    report: `${t.report ? t.report + "\n\n" : ""}[${dailyReportForm.date} ${latestReportTime}] (${dailyReportForm.progressPercentage}%): ${dailyReportForm.activityDescription}`,
                  }
                : t
            )
          );
        }
        setIsDailyReportModalOpen(false);
      } else {
        showToast("Gagal menyimpan laporan: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      showToast("Gagal mengirim laporan: " + err.message);
    } finally {
      setIsSubmittingDailyReport(false);
    }
  };

  // Handler buka form pengajuan material langsung terkait tugas
  const handleOpenRequestMaterialForTask = (task: EmployeeTask) => {
    const firstMat = materials.find((m) => m.stock > 0) || materials[0];
    const hasConv = !!firstMat?.hasConversion;
    setRequestForm({
      items: [
        {
          materialId: firstMat?.id || "",
          materialName: firstMat?.name || "",
          qty: 1,
          unit: firstMat?.unit || "Pcs",
          maxStock: firstMat?.stock || 999,
          hasConversion: hasConv,
          subUnit: firstMat?.subUnit,
          conversionRatio: firstMat?.conversionRatio,
          subStockTotal: firstMat?.subStockTotal,
          conversionLabel: firstMat?.conversionLabel,
          selectedUnit: firstMat?.unit || "Pcs",
          equivalentQty: hasConv && firstMat?.conversionRatio ? firstMat.conversionRatio : undefined,
          equivalentUnit: hasConv ? firstMat?.subUnit : undefined,
        },
      ],
      taskId: task.id,
      ticketNumber: task.ticketNumber || "",
      taskTitle: `[${task.ticketNumber || task.id}] ${task.title} - ${task.client}`,
      notes: `Kebutuhan material untuk tiket tugas ${task.title} (${task.client})`,
    });
    setIsRequestModalOpen(true);
  };

  // Handler update task status & foto dokumentasi
  const handleUpdateTaskStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      const payload = {
        id: selectedTask.id,
        ticketNumber: (selectedTask as any).ticketNumber || "",
        title: selectedTask.title,
        client: selectedTask.client,
        status: taskStatusForm.status,
        report: taskStatusForm.report,
        photos: taskStatusForm.photos || [],
        damagedItems: taskStatusForm.damagedItems || [],
        latitude: taskStatusForm.latitude || null,
        longitude: taskStatusForm.longitude || null,
        googleMapsUrl: taskStatusForm.googleMapsUrl || (taskStatusForm.latitude && taskStatusForm.longitude ? `https://www.google.com/maps/search/?api=1&query=${taskStatusForm.latitude},${taskStatusForm.longitude}` : undefined),
      };

      const res = await fetch("/api/employee/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === selectedTask.id
              ? {
                  ...t,
                  status: taskStatusForm.status,
                  report: taskStatusForm.report,
                  photos: taskStatusForm.photos || [],
                  damagedItems: taskStatusForm.damagedItems || [],
                  latitude: taskStatusForm.latitude || null,
                  longitude: taskStatusForm.longitude || null,
                  googleMapsUrl: taskStatusForm.googleMapsUrl || (taskStatusForm.latitude && taskStatusForm.longitude ? `https://www.google.com/maps/search/?api=1&query=${taskStatusForm.latitude},${taskStatusForm.longitude}` : undefined),
                }
              : t
          )
        );
        setSelectedTask((prev) =>
          prev
            ? {
                ...prev,
                status: taskStatusForm.status,
                report: taskStatusForm.report,
                photos: taskStatusForm.photos || [],
                damagedItems: taskStatusForm.damagedItems || [],
                latitude: taskStatusForm.latitude || null,
                longitude: taskStatusForm.longitude || null,
                googleMapsUrl: taskStatusForm.googleMapsUrl || (taskStatusForm.latitude && taskStatusForm.longitude ? `https://www.google.com/maps/search/?api=1&query=${taskStatusForm.latitude},${taskStatusForm.longitude}` : undefined),
              }
            : null
        );
        showToast("Status penugasan, koordinat GPS & rincian barang berhasil disimpan!");
        setIsStatusModalOpen(false);

        // Re-fetch data segar dari server
        fetch("/api/employee/tasks")
          .then((r) => r.json())
          .then((d) => {
            if (d.success && Array.isArray(d.data)) setTasks(d.data);
          })
          .catch(() => {});
      } else {
        showToast("Gagal menyimpan update tugas: " + (json.error || ""));
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  // Handler Buka Modal Buat Tiket Maintenance
  const handleOpenCreateTaskModal = () => {
    const today = new Date().toISOString().split("T")[0];
    setNewTaskForm({
      ticketNumber: "",
      entityType: "PT",
      type: "Corrective Maintenance",
      title: "",
      client: "",
      clientId: "",
      clientPhone: "",
      clientPic: "",
      location: "",
      date: today,
      deadline: today,
      status: "In Progress",
      priority: "Medium",
      technician: currentUser?.name || "Teknisi Lapangan",
      technicianPhone: currentUser?.phone || "",
      scope: [
        "Pengecekan dan investigasi kendala di lokasi",
        "Perbaikan konektor / modul perangkat",
        "Uji fungsi operasional sistem",
      ],
      equipment: ["Tool Set Obeng & Tang", "Digital Multitester"],
      notes: "",
      latitude: null,
      longitude: null,
      googleMapsUrl: "",
    });
    setNewScopeItemInput("");
    setNewEquipmentItemInput("");
    setIsCreateTaskModalOpen(true);

    // Otomatis deteksi GPS teknisi saat buka form
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          setNewTaskForm((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          }));
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  // Handler Submit Pembuatan Tiket Maintenance Mandiri
  const handleSubmitCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) {
      showToast("Judul perbaikan / pekerjaan wajib diisi!");
      return;
    }
    if (!newTaskForm.client.trim()) {
      showToast("Nama Klien / Perusahaan / Lokasi wajib diisi!");
      return;
    }

    try {
      setIsSubmittingNewTask(true);
      const payload = {
        ...newTaskForm,
        technician: newTaskForm.technician.trim() || currentUser?.name || "Teknisi Lapangan",
        technicianId: currentUser?.id || "",
        technicianPhone: newTaskForm.technicianPhone || currentUser?.phone || "",
      };

      const res = await fetch("/api/employee/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setTasks((prev) => [json.data, ...prev]);
        showToast(`✓ Tiket Maintenance ${json.data.ticketNumber || ""} berhasil dibuat & siap dieksekusi!`);
        setIsCreateTaskModalOpen(false);
      } else {
        showToast("Gagal membuat tiket: " + (json.error || ""));
      }
    } catch (err: any) {
      showToast("Terjadi kesalahan jaringan: " + err.message);
    } finally {
      setIsSubmittingNewTask(false);
    }
  };

  // Helper Kompresi Foto Lampiran Teknisi (Target Maksimal ~40 KB)
  const compressTechnicianPhoto = async (
    file: File,
    maxTargetSizeKb = 40,
    initialMaxWidth = 840,
    initialMaxHeight = 1120
  ): Promise<File> => {
    if (!file.type.startsWith("image/")) return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target?.result as string;
        img.onload = async () => {
          let curWidth = img.width;
          let curHeight = img.height;

          if (curWidth > initialMaxWidth || curHeight > initialMaxHeight) {
            if (curWidth / initialMaxWidth > curHeight / initialMaxHeight) {
              curHeight = Math.round((curHeight * initialMaxWidth) / curWidth);
              curWidth = initialMaxWidth;
            } else {
              curWidth = Math.round((curWidth * initialMaxHeight) / curHeight);
              curHeight = initialMaxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(file);

          const maxSizeBytes = maxTargetSizeKb * 1024;
          let bestBlob: Blob | null = null;
          const testQualities = [0.70, 0.58, 0.45, 0.35, 0.26, 0.20];
          let currentW = curWidth;
          let currentH = curHeight;

          for (let step = 0; step < testQualities.length; step++) {
            canvas.width = currentW;
            canvas.height = currentH;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, currentW, currentH);
            ctx.drawImage(img, 0, 0, currentW, currentH);

            const q = testQualities[step];
            const blob: Blob | null = await new Promise((res) => {
              canvas.toBlob((b) => res(b), "image/jpeg", q);
            });

            if (blob) {
              bestBlob = blob;
              if (blob.size <= maxSizeBytes) break;
            }
          }

          if (bestBlob && bestBlob.size > maxSizeBytes) {
            for (let downscale = 0; downscale < 4; downscale++) {
              currentW = Math.round(currentW * 0.80);
              currentH = Math.round(currentH * 0.80);
              if (currentW < 240) break;

              canvas.width = currentW;
              canvas.height = currentH;
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, currentW, currentH);
              ctx.drawImage(img, 0, 0, currentW, currentH);

              for (const q of [0.38, 0.25, 0.18]) {
                const blob: Blob | null = await new Promise((res) => {
                  canvas.toBlob((b) => res(b), "image/jpeg", q);
                });
                if (blob) {
                  bestBlob = blob;
                  if (blob.size <= maxSizeBytes) break;
                }
              }
              if (bestBlob && bestBlob.size <= maxSizeBytes) break;
            }
          }

          if (!bestBlob) return resolve(file);

          const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
          resolve(new File([bestBlob], cleanName, { type: "image/jpeg", lastModified: Date.now() }));
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  // Upload photo handler for technicians
  const handleUploadTaskPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingTaskPhoto(true);
      showToast("Mengompresi foto ke ~40 KB...");
      const fileToUpload = await compressTechnicianPhoto(file, 40);

      const fd = new FormData();
      fd.append("file", fileToUpload);
      fd.append("docType", "technician_photo");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.success && json.url) {
        const newPhoto: TaskPhoto = {
          id: `dstech_photo_${Date.now()}`,
          url: json.url,
          caption:
            taskPhotoCaption.trim() ||
            (taskPhotoCategory === "part_replacement"
              ? "Foto Pergantian Part Lapangan"
              : "Dokumentasi Pekerjaan Lapangan"),
          category: taskPhotoCategory,
          createdAt: new Date().toISOString(),
        };
        setTaskStatusForm((prev) => ({
          ...prev,
          photos: [...(prev.photos || []), newPhoto],
        }));
        setTaskPhotoCaption("");
        showToast("Foto berhasil diunggah!");
      } else {
        showToast("Gagal unggah foto: " + (json.message || "Error"));
      }
    } catch (err: any) {
      showToast("Error upload: " + err.message);
    } finally {
      setIsUploadingTaskPhoto(false);
      e.target.value = "";
    }
  };

  // Remove photo from taskStatusForm
  const handleRemoveTaskPhoto = (photoId: string) => {
    setTaskStatusForm((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((p) => p.id !== photoId),
    }));
  };

  // GPS check-in helper for task
  const handleDetectTaskGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      showToast("Browser tidak mendukung geolokasi GPS");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        setTaskStatusForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          googleMapsUrl: url,
        }));
        setIsLocating(false);
        showToast(`📍 GPS Check-in berhasil: ${lat}, ${lng}`);
      },
      (err) => {
        setIsLocating(false);
        showToast("Gagal deteksi GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Multi-item material request helpers
  const handleAddRequestItem = () => {
    const selectedIds = requestForm.items.map((i) => i.materialId).filter(Boolean);
    const availableMat = materials.find((m) => !selectedIds.includes(m.id) && m.stock > 0) || materials[0];

    const hasConv = !!availableMat?.hasConversion;
    const initialQty = 1;
    const eqQty = hasConv && availableMat?.conversionRatio ? initialQty * availableMat.conversionRatio : undefined;

    setRequestForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          materialId: availableMat?.id || "",
          materialName: availableMat?.name || "",
          qty: initialQty,
          unit: availableMat?.unit || "Pcs",
          maxStock: availableMat?.stock || 999,
          hasConversion: hasConv,
          subUnit: availableMat?.subUnit,
          conversionRatio: availableMat?.conversionRatio,
          subStockTotal: availableMat?.subStockTotal,
          conversionLabel: availableMat?.conversionLabel,
          selectedUnit: availableMat?.unit || "Pcs",
          equivalentQty: eqQty,
          equivalentUnit: hasConv ? availableMat?.subUnit : undefined,
        },
      ],
    }));
  };

  const handleRemoveRequestItem = (index: number) => {
    if (requestForm.items.length <= 1) return;
    setRequestForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemSelectChange = (index: number, selectedId: string) => {
    const mat = materials.find((m) => m.id === selectedId);
    if (!mat) return;
    setRequestForm((prev) => {
      const updated = [...prev.items];
      const hasConv = !!mat.hasConversion;
      const initialQty = 1;
      const eqQty = hasConv && mat.conversionRatio ? initialQty * mat.conversionRatio : undefined;

      updated[index] = {
        materialId: mat.id,
        materialName: mat.name,
        qty: initialQty,
        unit: mat.unit,
        maxStock: mat.stock,
        hasConversion: hasConv,
        subUnit: mat.subUnit,
        conversionRatio: mat.conversionRatio,
        subStockTotal: mat.subStockTotal,
        conversionLabel: mat.conversionLabel,
        selectedUnit: mat.unit,
        equivalentQty: eqQty,
        equivalentUnit: hasConv ? mat.subUnit : undefined,
      };
      return { ...prev, items: updated };
    });
  };

  const handleItemUnitChange = (index: number, newUnit: string) => {
    setRequestForm((prev) => {
      const updated = [...prev.items];
      const it = updated[index];
      const mat = materials.find((m) => m.id === it.materialId);
      if (!mat) return prev;

      let newMaxStock = mat.stock;
      let eqQty: number | undefined = undefined;
      let eqUnit: string | undefined = undefined;
      const currentQty = it.qty || 1;

      if (mat.hasConversion && mat.conversionRatio && mat.subUnit) {
        if (newUnit === mat.subUnit) {
          newMaxStock = mat.subStockTotal || mat.stock * mat.conversionRatio;
          eqQty = Number((currentQty / mat.conversionRatio).toFixed(2));
          eqUnit = mat.unit;
        } else {
          newMaxStock = mat.stock;
          eqQty = currentQty * mat.conversionRatio;
          eqUnit = mat.subUnit;
        }
      }

      updated[index] = {
        ...it,
        selectedUnit: newUnit,
        maxStock: newMaxStock,
        equivalentQty: eqQty,
        equivalentUnit: eqUnit,
      };
      return { ...prev, items: updated };
    });
  };

  const handleItemQtyChange = (index: number, qtyVal: number) => {
    setRequestForm((prev) => {
      const updated = [...prev.items];
      const it = updated[index];
      const safeQty = Math.max(1, qtyVal);
      const mat = materials.find((m) => m.id === it.materialId);

      let eqQty: number | undefined = undefined;
      let eqUnit: string | undefined = undefined;

      if (mat?.hasConversion && mat.conversionRatio && mat.subUnit) {
        if (it.selectedUnit === mat.subUnit) {
          eqQty = Number((safeQty / mat.conversionRatio).toFixed(2));
          eqUnit = mat.unit;
        } else {
          eqQty = safeQty * mat.conversionRatio;
          eqUnit = mat.subUnit;
        }
      }

      updated[index] = {
        ...it,
        qty: safeQty,
        equivalentQty: eqQty,
        equivalentUnit: eqUnit,
      };
      return { ...prev, items: updated };
    });
  };

  // Handler submit material request (Multi-Item dengan Konversi Satuan)
  const handleSubmitMaterialRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi: setiap baris wajib memilih material dari stok gudang
    const invalidItem = requestForm.items.find((i) => !i.materialId || !i.materialName);
    if (invalidItem || requestForm.items.length === 0) {
      showToast("Mohon pilih material dari daftar stok yang tersedia untuk setiap baris!");
      return;
    }

    // Validasi duplikasi material
    const ids = requestForm.items.map((i) => i.materialId);
    const hasDuplicates = new Set(ids).size !== ids.length;
    if (hasDuplicates) {
      showToast("Terdapat material yang sama dipilih lebih dari 1 kali. Mohon gabungkan jumlahnya.");
      return;
    }

    // Validasi stok gudang dengan konversi satuan
    for (const item of requestForm.items) {
      const mat = materials.find((m) => m.id === item.materialId);
      if (mat && mat.stock <= 0) {
        showToast(`Stok untuk "${item.materialName}" sedang habis di gudang!`);
        return;
      }
      if (mat) {
        const isSubUnit = mat.hasConversion && item.selectedUnit === mat.subUnit;
        const limitStock = isSubUnit
          ? mat.subStockTotal || (mat.stock * (mat.conversionRatio || 1))
          : mat.stock;
        const displayUnit = item.selectedUnit || mat.unit;

        if (item.qty > limitStock) {
          showToast(
            `Jumlah untuk "${item.materialName}" (${item.qty} ${displayUnit}) melebihi sisa stok gudang (${limitStock} ${displayUnit})!`
          );
          return;
        }
      }
    }

    try {
      const defaultTask = tasks.length > 0 ? `${tasks[0].title} - ${tasks[0].client}` : "Penugasan Lapangan";
      const res = await fetch("/api/employee/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: requestForm.items.map((it) => ({
            materialId: it.materialId,
            materialName: it.materialName,
            qty: it.qty,
            unit: it.selectedUnit || it.unit,
            selectedUnit: it.selectedUnit || it.unit,
            equivalentQty: it.equivalentQty,
            equivalentUnit: it.equivalentUnit,
            conversionLabel: it.conversionLabel,
          })),
          taskTitle: requestForm.taskTitle || defaultTask,
          requestedBy: currentUser?.name || "Teknisi Lapangan",
          notes: requestForm.notes,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setRequests((prev) => [d.data, ...prev]);
        showToast(`Permohonan ${requestForm.items.length} item material berhasil diajukan ke Gudang!`);
        setIsRequestModalOpen(false);
        const firstMat = materials.find((m) => m.stock > 0) || materials[0];
        const hasConv = !!firstMat?.hasConversion;
        setRequestForm({
          items: [
            {
              materialId: firstMat?.id || "",
              materialName: firstMat?.name || "",
              qty: 1,
              unit: firstMat?.unit || "Pcs",
              maxStock: firstMat?.stock || 999,
              hasConversion: hasConv,
              subUnit: firstMat?.subUnit,
              conversionRatio: firstMat?.conversionRatio,
              subStockTotal: firstMat?.subStockTotal,
              conversionLabel: firstMat?.conversionLabel,
              selectedUnit: firstMat?.unit || "Pcs",
              equivalentQty: hasConv && firstMat?.conversionRatio ? firstMat.conversionRatio : undefined,
              equivalentUnit: hasConv ? firstMat?.subUnit : undefined,
            },
          ],
          taskTitle: "",
          notes: "",
        });
        setInventorySubTab("requests");
      } else {
        const d = await res.json().catch(() => null);
        showToast(d?.error || "Gagal mengajukan permohonan material");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  // Handler Check-In
  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkInCoords.source !== "gps" || !checkInCoords.lat || !checkInCoords.lng) {
      showToast("Presensi Masuk DITOLAK: Sinyal GPS Satelit wajib aktif & terkunci sah! Input manual dilarang.");
      return;
    }
    if (!selfieCheckInPhoto) {
      showToast("Presensi Masuk DITOLAK: Wajib mengambil foto selfie wajah via kamera perangkat!");
      return;
    }

    if (currentUser?.attendanceLocationLock === "OFFICE") {
      const dist = calculateDistanceMeters(checkInCoords.lat, checkInCoords.lng, officeGps.lat, officeGps.lng);
      const maxRad = currentUser.officeRadius || officeGps.radius || 250;

      // Cek apakah staf berada di titik proyek yang dipilih
      const selectedPrj = projectsList.find((p) => p.id === selectedProjectIdCheckIn);
      let isWithinPrj = false;
      if (selectedPrj?.latitude && selectedPrj?.longitude) {
        const prjDist = calculateDistanceMeters(checkInCoords.lat, checkInCoords.lng, selectedPrj.latitude, selectedPrj.longitude);
        if (prjDist <= (selectedPrj.radiusMeters || 350)) {
          isWithinPrj = true;
        }
      }

      if (dist > maxRad && !isWithinPrj) {
        showToast(`Presensi Masuk DITOLAK: Anda berada ${dist}m di luar radius kantor (Maks toleransi: ${maxRad}m)!`);
        return;
      }
    }

    try {
      const selectedProject = projectsList.find((p) => p.id === selectedProjectIdCheckIn);
      const myTeamAssignment = selectedProject?.assignedEmployees?.find(
        (emp: any) => emp.employeeName?.trim().toLowerCase() === currentUser?.name?.trim().toLowerCase()
      );

      const res = await fetch("/api/employee/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkin",
          employeeName: currentUser?.name || "Teknisi Lapangan",
          employeeEmail: currentUser?.email,
          location: checkInLocation,
          latitude: checkInCoords.lat,
          longitude: checkInCoords.lng,
          accuracy: checkInCoords.accuracy || 10,
          mapsUrl: `https://www.google.com/maps?q=${checkInCoords.lat},${checkInCoords.lng}`,
          selfieCheckIn: selfieCheckInPhoto,
          notes: checkInNotes,
          projectId: selectedProject?.id || undefined,
          projectName: selectedProject?.projectName || undefined,
          projectRole: myTeamAssignment?.roleInProject || undefined,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setAttendanceLogs((prev) => [
          d.data,
          ...prev.filter(
            (p) =>
              p.id !== d.data.id &&
              !(p.date === d.data.date && p.employeeName?.trim().toLowerCase() === d.data.employeeName?.trim().toLowerCase())
          ),
        ]);
        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(new CustomEvent("dstech_attendance_updated", { detail: d.data }));
            localStorage.setItem("dstech_last_attendance_sync", Date.now().toString());
          } catch {}
        }
        showToast("✓ Absen Masuk berhasil terverifikasi GPS & Foto Selfie!");
        stopCamera();
        setIsCheckInModalOpen(false);
      } else {
        const errJson = await res.json().catch(() => null);
        showToast(errJson?.error || "Gagal mencatat presensi masuk");
      }
    } catch {
      showToast("Gagal mencatat presensi");
    }
  };

  // Handler Check-Out
  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkOutCoords.source !== "gps" || !checkOutCoords.lat || !checkOutCoords.lng) {
      showToast("Presensi Pulang DITOLAK: Sinyal GPS Satelit pulang wajib aktif & terkunci! Input manual dilarang.");
      return;
    }
    if (!selfieCheckOutPhoto) {
      showToast("Presensi Pulang DITOLAK: Wajib mengambil foto selfie wajah pulang via kamera perangkat!");
      return;
    }

    if (currentUser?.attendanceLocationLock === "OFFICE") {
      const dist = calculateDistanceMeters(checkOutCoords.lat, checkOutCoords.lng, officeGps.lat, officeGps.lng);
      const maxRad = currentUser.officeRadius || officeGps.radius || 250;

      const selectedPrj = projectsList.find((p) => p.id === selectedProjectIdCheckOut);
      let isWithinPrj = false;
      if (selectedPrj?.latitude && selectedPrj?.longitude) {
        const prjDist = calculateDistanceMeters(checkOutCoords.lat, checkOutCoords.lng, selectedPrj.latitude, selectedPrj.longitude);
        if (prjDist <= (selectedPrj.radiusMeters || 350)) {
          isWithinPrj = true;
        }
      }

      if (dist > maxRad && !isWithinPrj) {
        showToast(`Presensi Pulang DITOLAK: Anda berada ${dist}m di luar radius kantor (Maks toleransi: ${maxRad}m)!`);
        return;
      }
    }

    try {
      const selectedProject = projectsList.find((p) => p.id === selectedProjectIdCheckOut);
      const myTeamAssignment = selectedProject?.assignedEmployees?.find(
        (emp: any) => emp.employeeName?.trim().toLowerCase() === currentUser?.name?.trim().toLowerCase()
      );

      const res = await fetch("/api/employee/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkout",
          employeeName: currentUser?.name || "Teknisi Lapangan",
          employeeEmail: currentUser?.email,
          location: checkOutLocation,
          latitude: checkOutCoords.lat,
          longitude: checkOutCoords.lng,
          accuracy: checkOutCoords.accuracy || 10,
          mapsUrl: `https://www.google.com/maps?q=${checkOutCoords.lat},${checkOutCoords.lng}`,
          selfieCheckOut: selfieCheckOutPhoto,
          notes: checkOutSummary,
          projectId: selectedProject?.id || undefined,
          projectName: selectedProject?.projectName || undefined,
          projectRole: myTeamAssignment?.roleInProject || undefined,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setAttendanceLogs((prev) => [
          d.data,
          ...prev.filter(
            (p) =>
              p.id !== d.data.id &&
              !(p.date === d.data.date && p.employeeName?.trim().toLowerCase() === d.data.employeeName?.trim().toLowerCase())
          ),
        ]);
        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(new CustomEvent("dstech_attendance_updated", { detail: d.data }));
            localStorage.setItem("dstech_last_attendance_sync", Date.now().toString());
          } catch {}
        }
        showToast("✓ Absen Pulang berhasil terverifikasi GPS & Foto Selfie!");
        stopCamera();
        setIsCheckOutModalOpen(false);
      } else {
        const errJson = await res.json().catch(() => null);
        showToast(errJson?.error || "Gagal mencatat presensi pulang");
      }
    } catch {
      showToast("Gagal mencatat presensi pulang");
    }
  };

  // Handler Overtime
  const handleSubmitOvertime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/employee/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "overtime",
          employeeName: currentUser?.name || "Teknisi Lapangan",
          ...overtimeForm,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setOvertimeLogs((prev) => [d.data, ...prev]);
        showToast("Permintaan lembur berhasil diajukan ke Team Leader / HR!");
        setIsOvertimeModalOpen(false);
      }
    } catch {
      showToast("Gagal mengajukan lembur");
    }
  };

  // Handler Add Announcement
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/employee/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAnnouncementForm,
          author: currentUser ? `${currentUser.name} (${currentUser.role === "EMPLOYEE" ? "Teknisi Lapangan" : currentUser.role})` : "Teknisi Lapangan",
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setAnnouncements((prev) => [d.data, ...prev]);
        showToast("Pengumuman berhasil diterbitkan!");
        setIsAddAnnouncementModalOpen(false);
        setNewAnnouncementForm({ title: "", category: "PROSEDUR", summary: "", content: "", urgent: false });
      }
    } catch {
      showToast("Gagal menerbitkan pengumuman");
    }
  };

  // Handler Logout
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("dstech_employee_auth");
      localStorage.removeItem("dstech_auth_token");
    }
    showToast("Anda telah keluar dari Employee Portal.");
    setTimeout(() => {
      router.push("/login");
    }, 700);
  };

  // Filtered tasks
  const filteredTasks =
    taskFilter === "Semua"
      ? tasks
      : tasks.filter((t) => t.status.toLowerCase() === taskFilter.toLowerCase());

  // Filtered materials
  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(materialSearch.toLowerCase()) ||
      m.location.toLowerCase().includes(materialSearch.toLowerCase())
  );

  // Active task for highlight banner
  const activeTask = tasks.find((t) => t.status === "In Progress") || tasks[0];

  // Today's attendance record (WIB Asia/Jakarta & pencocokan akun staf aktif)
  const getWIBTodayDates = () => {
    const list: string[] = [];
    try {
      const wib = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      list.push(wib);
    } catch {}
    const iso = new Date().toISOString().split("T")[0];
    if (!list.includes(iso)) list.push(iso);
    return list;
  };

  const validEmployeeTodayDates = getWIBTodayDates();
  const currentEmpName = (currentUser?.name || "").trim().toLowerCase();
  const currentEmpEmail = (currentUser?.email || "").trim().toLowerCase();

  const todayAttendance = attendanceLogs.find((a) => {
    const matchDate = validEmployeeTodayDates.includes(a.date);
    if (!matchDate) return false;
    if (!currentEmpName && !currentEmpEmail) return true;
    const aName = (a.employeeName || "").trim().toLowerCase();
    const aEmail = (a.employeeEmail || "").trim().toLowerCase();
    const matchName = currentEmpName && (aName === currentEmpName || aName.includes(currentEmpName) || currentEmpName.includes(aName));
    const matchEmail = currentEmpEmail && aEmail && aEmail === currentEmpEmail;
    return Boolean(matchName || matchEmail);
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-sm font-bold animate-slideDown">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-80 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-30">
        <div className="p-8 border-b border-slate-100 flex flex-col items-center">
          <Link href="/" className="relative w-36 h-10 mb-2 block">
            <Image src="/logo.png" alt="Logo DSTech" fill className="object-contain" priority />
          </Link>
          <span className="text-[10px] font-black text-dstech-red uppercase tracking-widest flex items-center gap-1.5 mt-1">
            <HardHat className="w-3.5 h-3.5" /> Technical Staff Portal
          </span>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "tasks"
                ? "bg-dstech-red text-white shadow-lg shadow-red-500/25"
                : "text-slate-600 hover:bg-slate-50 hover:text-dstech-red"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <ListChecks className="w-5 h-5" />
              <span>Penugasan Saya</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-black ${
                activeTab === "tasks" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tasks.filter((t) => t.status === "In Progress").length} Aktif
            </span>
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "inventory"
                ? "bg-dstech-red text-white shadow-lg shadow-red-500/25"
                : "text-slate-600 hover:bg-slate-50 hover:text-dstech-red"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Package className="w-5 h-5" />
              <span>Stok Barang & Material</span>
            </div>
            {materials.filter((m) => m.status === "Menipis" || m.status === "Habis").length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "attendance"
                ? "bg-dstech-red text-white shadow-lg shadow-red-500/25"
                : "text-slate-600 hover:bg-slate-50 hover:text-dstech-red"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Clock className="w-5 h-5" />
              <span>Presensi & Lembur</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                todayAttendance?.checkIn ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {todayAttendance?.checkIn ? "Hadir" : "Belum Absen"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("meetings")}
            className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "meetings"
                ? "bg-dstech-red text-white shadow-lg shadow-red-500/25"
                : "text-slate-600 hover:bg-slate-50 hover:text-dstech-red"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Video className="w-5 h-5" />
              <span>Rapat & Notula</span>
            </div>
            {meetingsList.filter((m) => m.status === "ACTIVE").length > 0 ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-dstech-red">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                {meetingsList.filter((m) => m.status === "ACTIVE").length} Live
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {meetingsList.length}
              </span>
            )}
          </button>
        </nav>

        {/* Profile Card & Logout */}
        <div className="p-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-dstech-red text-white flex items-center justify-center font-black shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">
                {currentUser?.name || "Teknisi DSTech"}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {currentUser?.role === "EMPLOYEE" ? "Teknisi Lapangan" : (currentUser?.role || "Staff Teknis")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            id="employee-logout-btn"
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl text-red-600 hover:bg-red-50 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Log Out)</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-20 flex items-center justify-between">
          <Link href="/" className="relative w-28 h-8 block">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsKmsModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-dstech-blue text-[11px] font-bold flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" /> KMS
            </button>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 rounded-xl text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex bg-white border-b border-slate-200 px-4 py-2 gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
              activeTab === "tasks" ? "bg-dstech-red text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Penugasan
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
              activeTab === "inventory" ? "bg-dstech-red text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Stok Barang
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
              activeTab === "attendance" ? "bg-dstech-red text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Presensi & Lembur
          </button>
          <button
            onClick={() => setActiveTab("meetings")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
              activeTab === "meetings" ? "bg-dstech-red text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Rapat & Notula</span>
            {meetingsList.filter((m) => m.status === "ACTIVE").length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 sm:p-8 lg:p-12 space-y-8 max-w-7xl w-full mx-auto">
          {/* Header Bar */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-dstech-red text-[10px] font-black uppercase tracking-wider">
                  Operational Dashboard
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {currentTime || "Loading waktu..."}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Halo, {currentUser?.name || "Teknisi DSTech"}!
              </h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">
                Kelola penugasan lapangan, cek inventori material, dan catat presensi kerja hari ini.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Button Buka Portal KMS */}
              <button
                onClick={() => setIsKmsModalOpen(true)}
                id="btn-buka-kms"
                className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-dstech-accent" />
                <span>Buka Portal KMS</span>
              </button>

              {/* Quick WhatsApp Coord */}
              <a
                href={`https://wa.me/6282259494242?text=Halo%20Team%20Leader,%20saya%20${encodeURIComponent(currentUser?.name || "Teknisi")}%20ingin%20koordinasi%20lapangan.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                title="Hubungi Team Leader Lapangan via WhatsApp"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left 2 Columns: Main Active Tab Content */}
            <div className="xl:col-span-2 space-y-8">
              {/* TAB 1: PENUGASAN SAYA */}
              {activeTab === "tasks" && (
                <div className="space-y-6">
                  {/* Highlight Active Task Banner */}
                  {activeTask && (
                    <div className="p-6 sm:p-8 rounded-[36px] bg-gradient-to-br from-dstech-blue to-blue-700 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-wider">
                            <Sparkles className="w-3 h-3 text-yellow-300" /> Penugasan Utama Sedang Berjalan
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black mt-2 leading-tight">
                            {activeTask.title}
                          </h3>
                          <p className="text-white/80 font-bold text-xs sm:text-sm flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-red-300" /> {activeTask.client} ({activeTask.location})
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenRequestMaterialForTask(activeTask)}
                            className="px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                          >
                            <Package className="w-3.5 h-3.5" /> Ajukan Material
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTask(activeTask);
                              setTaskStatusForm({
                                status: activeTask.status,
                                report: activeTask.report || "",
                                photos: activeTask.photos || [],
                                damagedItems: activeTask.damagedItems || [],
                                latitude: activeTask.latitude,
                                longitude: activeTask.longitude,
                                googleMapsUrl: activeTask.googleMapsUrl,
                              });
                              setIsStatusModalOpen(true);
                            }}
                            className="px-5 py-3 rounded-2xl bg-white text-dstech-blue hover:bg-blue-50 font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer whitespace-nowrap"
                          >
                            Update Status & Laporan
                          </button>
                        </div>
                      </div>

                      {/* Scope Preview */}
                      <div className="p-4 rounded-2xl bg-black/15 backdrop-blur-md border border-white/10 text-xs space-y-1.5">
                        <p className="font-bold text-white/70 uppercase tracking-widest text-[10px]">
                          Lingkup Kerja Terjadwal:
                        </p>
                        {activeTask.scope.slice(0, 3).map((sc, i) => (
                          <div key={i} className="flex items-center gap-2 text-white/90">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-300 shrink-0" />
                            <span className="truncate">{sc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Filter & Task List */}
                  <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900">Daftar Surat Tugas Kerja</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black">
                            {filteredTasks.length} Tiket
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs font-medium">
                          Pekerjaan yang ditugaskan kepada {currentUser?.name || "Teknisi Lapangan"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={handleOpenCreateTaskModal}
                          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-dstech-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Buat Tiket Maintenance</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDailyReportModal()}
                          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
                        >
                          <FileSignature className="w-4 h-4" />
                          <span>Lapor Kegiatan Harian</span>
                        </button>

                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto">
                          {["Semua", "In Progress", "Pending", "Completed"].map((st) => (
                            <button
                              key={st}
                              onClick={() => setTaskFilter(st)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                taskFilter === st
                                  ? "bg-white text-slate-900 shadow-sm"
                                  : "text-slate-500 hover:text-slate-900"
                              }`}
                            >
                              {st === "In Progress"
                                ? "Berjalan"
                                : st === "Pending"
                                ? "Menunggu"
                                : st === "Completed"
                                ? "Selesai"
                                : "Semua"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Task Cards */}
                    <div className="space-y-4">
                      {filteredTasks.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                          Tidak ada penugasan dengan status ini.
                        </div>
                      ) : (
                        filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-5 rounded-3xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition-all space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                      task.status === "Completed"
                                        ? "bg-green-100 text-green-700"
                                        : task.status === "In Progress"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {task.status}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                      task.priority === "Urgent"
                                        ? "bg-red-100 text-red-600"
                                        : task.priority === "High"
                                        ? "bg-orange-100 text-orange-600"
                                        : "bg-slate-200 text-slate-600"
                                    }`}
                                  >
                                    {task.priority} Priority
                                  </span>
                                </div>
                                <h4 className="font-black text-slate-900 text-base">{task.title}</h4>
                                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <MapPin className="w-3.5 h-3.5 text-dstech-blue" />
                                  <span className="font-bold text-slate-700">{task.client}</span> — {task.location}
                                </p>
                              </div>

                              <div className="text-right text-xs text-slate-400">
                                <p className="font-bold">Deadline:</p>
                                <p className="text-slate-700 font-black">{task.deadline}</p>
                              </div>
                            </div>

                            {/* Equipment Badges */}
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/50">
                              <span className="text-[10px] font-bold text-slate-400 flex items-center mr-1">
                                <Package className="w-3 h-3 mr-1" /> Material:
                              </span>
                              {task.equipment.map((eq, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600"
                                >
                                  {eq}
                                </span>
                              ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => handleOpenRequestMaterialForTask(task)}
                                className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-dstech-blue font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                                title="Ajukan material atau suku cadang untuk tiket ini"
                              >
                                <Package className="w-3.5 h-3.5" /> Material
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedTask(task)}
                                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                              >
                                Detail Tugas
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDailyReportModal(task)}
                                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Kirim Laporan Kegiatan Harian untuk Pekerjaan Ini"
                              >
                                <FileSignature className="w-3.5 h-3.5" />
                                <span>Lapor Harian</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setTaskStatusForm({
                                    status: task.status,
                                    report: task.report || "",
                                    photos: task.photos || [],
                                    damagedItems: task.damagedItems || [],
                                    latitude: task.latitude,
                                    longitude: task.longitude,
                                    googleMapsUrl: task.googleMapsUrl,
                                  });
                                  setIsStatusModalOpen(true);
                                }}
                                className="px-4 py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                              >
                                Update Status
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Widget Riwayat Laporan Kegiatan Harian Teknisi & Proyek (Tugas 135) */}
                  <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900">
                            Riwayat Laporan Kerja Harian & Proyek
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                            {dailyReports.length} Laporan
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs font-medium">
                          Log aktivitas harian teknisi yang langsung tersinkronisasi ke pengawasan proyek & manajemen
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenDailyReportModal()}
                        className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tulis Laporan Baru</span>
                      </button>
                    </div>

                    {dailyReports.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <FileSignature className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-600">Belum ada laporan kegiatan harian yang dikirim</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Klik tombol "Lapor Kegiatan Harian" di atas untuk melaporkan progres pekerjaan Anda hari ini.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dailyReports.slice(0, 10).map((rep) => (
                          <div
                            key={rep.id}
                            className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 transition-all space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                              <div className="flex items-center gap-2.5">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black">
                                  {rep.date}
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">{rep.taskTitle}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500">Progres:</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black">
                                  {rep.progressPercentage}%
                                </span>
                              </div>
                            </div>

                            <div className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-slate-100 whitespace-pre-wrap">
                              {rep.activityDescription}
                            </div>

                            {(rep.blockers || rep.nextAction) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {rep.blockers && (
                                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900">
                                    <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-700 mb-0.5">
                                      ⚠️ Kendala / Hambatan Lapangan:
                                    </span>
                                    <span>{rep.blockers}</span>
                                  </div>
                                )}
                                {rep.nextAction && (
                                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900">
                                    <span className="font-bold block text-[10px] uppercase tracking-wider text-blue-700 mb-0.5">
                                      📌 Tindak Lanjut Besok:
                                    </span>
                                    <span>{rep.nextAction}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                              <span>Pelapor: <strong className="text-slate-700">{rep.employeeName}</strong></span>
                              <span>Klien / Lokasi: <strong className="text-slate-700">{rep.clientName || "-"}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: STOK BARANG & MATERIAL */}
              {activeTab === "inventory" && (
                <div className="space-y-6">
                  {/* Penjelasan Fungsi Stok Barang */}
                  <div className="p-6 sm:p-7 rounded-[32px] bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-600" />
                      <h3 className="font-black text-sm uppercase tracking-wider">
                        Fungsi Stok Barang Teknisi
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
                      Modul ini digunakan untuk <strong>memantau ketersediaan material lapangan</strong> (kabel UTP, konektor RJ45/BNC, power supply, kamera cadangan, toolkit) di gudang sebelum berangkat ke lokasi instalasi, serta <strong>mengajukan permohonan pengambilan barang / sparepart</strong> untuk tugas proyek Anda.
                    </p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Item</p>
                      <h4 className="text-2xl font-black text-slate-900 mt-1">{materials.length}</h4>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Stok Aman</p>
                      <h4 className="text-2xl font-black text-green-600 mt-1">
                        {materials.filter((m) => m.status === "Aman").length}
                      </h4>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Menipis</p>
                      <h4 className="text-2xl font-black text-amber-600 mt-1">
                        {materials.filter((m) => m.status === "Menipis").length}
                      </h4>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Stok Habis</p>
                      <h4 className="text-2xl font-black text-red-600 mt-1">
                        {materials.filter((m) => m.status === "Habis").length}
                      </h4>
                    </div>
                  </div>

                  {/* Sub-Tabs & Action Button */}
                  <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInventorySubTab("stock")}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            inventorySubTab === "stock"
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Daftar Stok Material Gudang
                        </button>
                        <button
                          onClick={() => setInventorySubTab("requests")}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            inventorySubTab === "requests"
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span>Permohonan Barang Saya</span>
                          <span className="w-2 h-2 rounded-full bg-dstech-blue"></span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          const firstMat = materials.find((m) => m.stock > 0) || materials[0];
                          const hasConv = !!firstMat?.hasConversion;
                          const activeTasks = tasks.filter((t) => t.status !== "Completed");
                          const defaultTask = activeTasks.length > 0 ? `${activeTasks[0].title} - ${activeTasks[0].client}` : "";
                          setRequestForm({
                            items: [
                              {
                                materialId: firstMat?.id || "",
                                materialName: firstMat?.name || "",
                                qty: 1,
                                unit: firstMat?.unit || "Pcs",
                                maxStock: firstMat?.stock || 999,
                                hasConversion: hasConv,
                                subUnit: firstMat?.subUnit,
                                conversionRatio: firstMat?.conversionRatio,
                                subStockTotal: firstMat?.subStockTotal,
                                conversionLabel: firstMat?.conversionLabel,
                                selectedUnit: firstMat?.unit || "Pcs",
                                equivalentQty: hasConv && firstMat?.conversionRatio ? firstMat.conversionRatio : undefined,
                                equivalentUnit: hasConv ? firstMat?.subUnit : undefined,
                              },
                            ],
                            taskTitle: defaultTask,
                            notes: "",
                          });
                          setIsRequestModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-dstech-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajukan Pengambilan Material</span>
                      </button>
                    </div>

                    {/* Stock Table */}
                    {inventorySubTab === "stock" && (
                      <div className="space-y-5">
                        {/* Interactive Unit Converter Calculator Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white shadow-md border border-slate-700/60 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30">
                                <Calculator className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-black tracking-wide">
                                  Kalkulator Konversi Satuan Lapangan
                                </h4>
                                <p className="text-[10px] text-slate-300">
                                  Konversi otomatis Roll ⇄ Meter, Dus ⇄ Pcs, Pack ⇄ Pcs secara instan
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full self-start sm:self-auto">
                              ⚡ Konversi Presisi Real-time
                            </span>
                          </div>

                          {/* Controls */}
                          {(() => {
                            const convertibleMaterials = materials.filter((m) => m.hasConversion && m.subUnit && m.conversionRatio);
                            const currentMat = convertibleMaterials.find((m) => m.id === calcMaterialId) || convertibleMaterials[0] || materials[0];
                            const ratio = currentMat?.conversionRatio || 1;
                            const pUnit = currentMat?.unit || "Unit";
                            const sUnit = currentMat?.subUnit || "Pcs";

                            const convertedVal =
                              calcDirection === "primary_to_sub"
                                ? (calcInputQty * ratio).toLocaleString("id-ID")
                                : (calcInputQty / ratio).toFixed(2);

                            const fromUnit = calcDirection === "primary_to_sub" ? pUnit : sUnit;
                            const toUnit = calcDirection === "primary_to_sub" ? sUnit : pUnit;

                            return (
                              <div className="space-y-3 pt-1">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-300 block mb-1">
                                      Pilih Material Berkonversi:
                                    </label>
                                    <select
                                      value={currentMat?.id}
                                      onChange={(e) => setCalcMaterialId(e.target.value)}
                                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    >
                                      {convertibleMaterials.map((m) => (
                                        <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                                          {m.name} ({m.conversionLabel || `1 ${m.unit} = ${m.conversionRatio} ${m.subUnit}`})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-slate-300 block mb-1">
                                      Arah Konversi Satuan:
                                    </label>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => setCalcDirection("primary_to_sub")}
                                        className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                          calcDirection === "primary_to_sub"
                                            ? "bg-blue-600 text-white shadow"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                      >
                                        {pUnit} ➔ {sUnit}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setCalcDirection("sub_to_primary")}
                                        className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                          calcDirection === "sub_to_primary"
                                            ? "bg-blue-600 text-white shadow"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                      >
                                        {sUnit} ➔ {pUnit}
                                      </button>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-slate-300 block mb-1">
                                      Jumlah Input ({fromUnit}):
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min={1}
                                        value={calcInputQty}
                                        onChange={(e) => setCalcInputQty(Math.max(1, Number(e.target.value)))}
                                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-black focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      />
                                      <span className="text-xs font-bold text-slate-300 px-2 py-2 bg-slate-700/60 rounded-xl shrink-0">
                                        {fromUnit}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Result Output Box */}
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-black text-sm shrink-0">
                                      =
                                    </div>
                                    <div>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-lg sm:text-xl font-black text-white">
                                          {convertedVal} {toUnit}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                          (dari {calcInputQty} {fromUnit})
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-300">
                                        Rasio Acuan: <strong className="text-amber-300">{currentMat?.conversionLabel || `1 ${pUnit} = ${ratio} ${sUnit}`}</strong> | Sisa Stok: {currentMat?.stock} {pUnit} (≈ {currentMat?.subStockTotal || (currentMat?.stock * ratio)} {sUnit})
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const hasConv = !!currentMat?.hasConversion;
                                      const activeTasks = tasks.filter((t) => t.status !== "Completed");
                                      const defaultTask = activeTasks.length > 0 ? `${activeTasks[0].title} - ${activeTasks[0].client}` : "";
                                      const isSub = calcDirection === "sub_to_primary";
                                      const selectedUnit = isSub ? sUnit : pUnit;
                                      const maxStock = isSub ? (currentMat.subStockTotal || currentMat.stock * ratio) : currentMat.stock;
                                      const eqQty = isSub ? Number((calcInputQty / ratio).toFixed(2)) : calcInputQty * ratio;
                                      const eqUnit = isSub ? pUnit : sUnit;

                                      setRequestForm({
                                        items: [
                                          {
                                            materialId: currentMat.id,
                                            materialName: currentMat.name,
                                            qty: calcInputQty,
                                            unit: pUnit,
                                            maxStock: maxStock,
                                            hasConversion: hasConv,
                                            subUnit: sUnit,
                                            conversionRatio: ratio,
                                            subStockTotal: currentMat.subStockTotal,
                                            conversionLabel: currentMat.conversionLabel,
                                            selectedUnit: selectedUnit,
                                            equivalentQty: eqQty,
                                            equivalentUnit: eqUnit,
                                          },
                                        ],
                                        taskTitle: defaultTask,
                                        notes: `Pengambilan via kalkulator konversi: ${calcInputQty} ${selectedUnit} (≈ ${eqQty} ${eqUnit})`,
                                      });
                                      setIsRequestModalOpen(true);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <span>Ambil Material Ini</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            placeholder="Cari material kabel, konektor, kamera, toolkit..."
                            value={materialSearch}
                            onChange={(e) => setMaterialSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-dstech-red focus:outline-none"
                          />
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-3">Nama Material</th>
                                <th className="p-3">Kategori</th>
                                <th className="p-3">Sisa Stok Gudang</th>
                                <th className="p-3">Lokasi Gudang</th>
                                <th className="p-3 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredMaterials.map((mat) => (
                                <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3 font-bold text-slate-900">
                                    <p className="flex items-center gap-1.5 flex-wrap">
                                      <span>{mat.name}</span>
                                      {mat.hasConversion && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-50 text-dstech-blue border border-blue-200">
                                          Dual Unit
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-normal">{mat.description}</p>
                                  </td>
                                  <td className="p-3 text-slate-600">{mat.category}</td>
                                  <td className="p-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span
                                          className={`px-2 py-1 rounded-md font-black text-[10px] uppercase ${
                                            mat.status === "Aman"
                                              ? "bg-green-100 text-green-700"
                                              : mat.status === "Menipis"
                                              ? "bg-amber-100 text-amber-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {mat.stock} {mat.unit} ({mat.status})
                                        </span>
                                        {mat.hasConversion && mat.subUnit && (
                                          <span className="px-2 py-0.5 rounded-md font-extrabold text-[10px] bg-blue-100 text-dstech-blue">
                                            ≈ {mat.subStockTotal || (mat.stock * (mat.conversionRatio || 1))} {mat.subUnit}
                                          </span>
                                        )}
                                      </div>
                                      {mat.hasConversion && mat.conversionLabel && (
                                        <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                                          <ArrowRightLeft className="w-3 h-3 text-dstech-blue shrink-0" />
                                          <span>{mat.conversionLabel}</span>
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3 text-slate-500 font-medium">{mat.location}</td>
                                  <td className="p-3 text-right">
                                    <button
                                      onClick={() => {
                                        const hasConv = !!mat.hasConversion;
                                        const activeTasks = tasks.filter((t) => t.status !== "Completed");
                                        const defaultTask = activeTasks.length > 0 ? `${activeTasks[0].title} - ${activeTasks[0].client}` : "";
                                        setRequestForm({
                                          items: [
                                            {
                                              materialId: mat.id,
                                              materialName: mat.name,
                                              qty: 1,
                                              unit: mat.unit,
                                              maxStock: mat.stock,
                                              hasConversion: hasConv,
                                              subUnit: mat.subUnit,
                                              conversionRatio: mat.conversionRatio,
                                              subStockTotal: mat.subStockTotal,
                                              conversionLabel: mat.conversionLabel,
                                              selectedUnit: mat.unit,
                                              equivalentQty: hasConv && mat.conversionRatio ? mat.conversionRatio : undefined,
                                              equivalentUnit: hasConv ? mat.subUnit : undefined,
                                            },
                                          ],
                                          taskTitle: defaultTask,
                                          notes: "",
                                        });
                                        setIsRequestModalOpen(true);
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-dstech-blue hover:bg-dstech-blue hover:text-white font-bold text-[11px] transition-all cursor-pointer"
                                    >
                                      Ambil Barang
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Requisitions Table */}
                    {inventorySubTab === "requests" && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                            <tr>
                              <th className="p-3">Tanggal</th>
                              <th className="p-3">Material yang Diminta</th>
                              <th className="p-3">Rincian Qty</th>
                              <th className="p-3">Penugasan Terkait</th>
                              <th className="p-3">Status Gudang</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {requests.map((req) => (
                              <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3 font-medium text-slate-500 whitespace-nowrap">{req.date}</td>
                                <td className="p-3">
                                  {req.items && req.items.length > 0 ? (
                                    <div className="space-y-1.5 py-1">
                                      {req.items.map((it, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs flex-wrap">
                                          <span className="w-1.5 h-1.5 rounded-full bg-dstech-blue shrink-0"></span>
                                          <span className="font-bold text-slate-900">{it.materialName}</span>
                                          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-extrabold text-[10px] text-slate-700 whitespace-nowrap">
                                            {it.qty} {it.unit}
                                          </span>
                                          {it.equivalentQty !== undefined && it.equivalentUnit && (
                                            <span className="text-[10px] font-semibold text-dstech-blue bg-blue-50 px-2 py-0.5 rounded-md">
                                              ≈ {it.equivalentQty} {it.equivalentUnit}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="font-bold text-slate-900">{req.materialName}</p>
                                  )}
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  {req.items && req.items.length > 1 ? (
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-dstech-blue font-bold text-[11px] border border-blue-200/60 inline-flex items-center gap-1.5">
                                      <Package className="w-3.5 h-3.5" />
                                      <span>{req.items.length} Macam Item ({req.qty} total)</span>
                                    </span>
                                  ) : (
                                    <span className="font-black text-slate-700">
                                      {req.qty} {req.unit}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-slate-600">{req.taskTitle}</td>
                                <td className="p-3 whitespace-nowrap">
                                  <span
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                      req.status === "Disetujui"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {req.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PRESENSI & LEMBUR */}
              {activeTab === "attendance" && (
                <div className="space-y-6">
                  {/* Presensi Check-In / Out Card */}
                  <div className="p-6 sm:p-8 rounded-[36px] bg-white border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-dstech-blue">
                          Presensi Kehadiran Teknisi
                        </span>
                        <h3 className="text-xl font-black text-slate-900 mt-1">Status Kehadiran Hari Ini</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {new Date().toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          id="btn-checkin"
                          onClick={openCheckInModal}
                          className="px-5 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          Check-In (Masuk)
                        </button>
                        <button
                          id="btn-checkout"
                          onClick={openCheckOutModal}
                          className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          Check-Out (Pulang)
                        </button>
                      </div>
                    </div>

                    {/* Today's Status Box */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Log Presensi Aktif Hari Ini:
                        </p>
                        <div className="text-sm font-black text-slate-900 flex flex-wrap items-center gap-2">
                          {todayAttendance?.checkIn ? (
                            <>
                              <span>Jam Masuk: {todayAttendance.checkIn} — Lokasi: {todayAttendance.location}</span>
                              <a
                                href={
                                  todayAttendance.mapsUrl ||
                                  (todayAttendance.latitude && todayAttendance.longitude
                                    ? `https://www.google.com/maps?q=${todayAttendance.latitude},${todayAttendance.longitude}`
                                    : `https://www.google.com/maps?q=${encodeURIComponent(todayAttendance.location + " Cilegon")}`)
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition-colors"
                              >
                                <MapPin className="w-3 h-3 text-blue-600" />
                                Google Maps ↗
                              </a>
                            </>
                          ) : (
                            "Anda belum mencatat Absen Masuk hari ini"
                          )}
                        </div>
                        {todayAttendance?.checkOut && todayAttendance.checkOut !== "-" && (
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-slate-600">
                            <span>Jam Pulang: {todayAttendance.checkOut} {todayAttendance.checkOutLocation ? `(${todayAttendance.checkOutLocation})` : ""}</span>
                            {(todayAttendance.checkOutMapsUrl || (todayAttendance.checkOutLat && todayAttendance.checkOutLng)) && (
                              <a
                                href={
                                  todayAttendance.checkOutMapsUrl ||
                                  `https://www.google.com/maps?q=${todayAttendance.checkOutLat},${todayAttendance.checkOutLng}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                              >
                                <MapPin className="w-3 h-3 text-blue-600" />
                                Maps Pulang ↗
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <span
                        className={`px-3 py-1.5 rounded-xl text-xs font-black self-start sm:self-auto ${
                          todayAttendance?.checkIn
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {todayAttendance?.checkIn ? "Hadir Terverifikasi" : "Menunggu Check-In"}
                      </span>
                    </div>

                    {/* Work Hours Metric */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total Jam Kerja</p>
                        <p className="text-2xl font-black text-dstech-blue">{monthlyStats.totalHours}h</p>
                        <p className="text-[10px] text-slate-400 font-medium">Bulan Ini</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Jam Lembur</p>
                        <p className="text-2xl font-black text-dstech-red">+{monthlyStats.overtimeHours}h</p>
                        <p className="text-[10px] text-slate-400 font-medium">Terverifikasi</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Hari Hadir</p>
                        <p className="text-2xl font-black text-slate-900">{monthlyStats.presenceDays} Hari</p>
                        <p className="text-[10px] text-slate-400 font-medium">100% On-Track</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Target Bulanan</p>
                        <p className="text-2xl font-black text-slate-500">{monthlyStats.targetHours}h</p>
                        <p className="text-[10px] text-green-600 font-bold">Tercapai</p>
                      </div>
                    </div>
                  </div>

                  {/* Overtime Requests Section */}
                  <div className="p-6 sm:p-8 rounded-[36px] bg-white border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Permintaan Lembur (Overtime)</h3>
                        <p className="text-xs text-slate-400 font-medium">
                          Pengajuan jam kerja tambahan di luar jam operasional normal
                        </p>
                      </div>

                      <button
                        onClick={() => setIsOvertimeModalOpen(true)}
                        className="px-4 py-2.5 rounded-2xl bg-dstech-blue hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajukan Lembur</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Tanggal</th>
                            <th className="p-3">Jam Lembur</th>
                            <th className="p-3">Durasi</th>
                            <th className="p-3">Tugas / Proyek</th>
                            <th className="p-3">Alasan Teknis</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {overtimeLogs.map((ot) => (
                            <tr key={ot.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3 font-medium text-slate-600">{ot.date}</td>
                              <td className="p-3 font-bold text-slate-800">
                                {ot.startTime} - {ot.endTime}
                              </td>
                              <td className="p-3 font-black text-dstech-red">+{ot.hours} Jam</td>
                              <td className="p-3 text-slate-700 font-medium">{ot.taskTitle}</td>
                              <td className="p-3 text-slate-500 max-w-xs truncate">{ot.reason}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                    ot.status === "Disetujui"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {ot.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Leave & Permission (Cuti, Izin, Sakit) Section - Tugas 232 / 109 */}
                  <div className="p-6 sm:p-8 rounded-[36px] bg-white border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                            <HeartPulse className="w-5 h-5" />
                          </span>
                          <h3 className="text-lg font-black text-slate-900">Permohonan Cuti, Izin &amp; Sakit</h3>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                          Pengajuan dispensasi kehadiran, cuti tahunan, dan izin sakit resmi
                        </p>
                      </div>

                      <button
                        onClick={() => setIsLeaveModalOpen(true)}
                        className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajukan Cuti / Izin / Sakit</span>
                      </button>
                    </div>

                    {/* 3 Kartu Kuota Pribadi */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hak Cuti Tahunan</p>
                        <p className="text-xl font-black text-slate-800 mt-0.5">{leaveQuota.annualQuota} Hari</p>
                        <p className="text-[10px] text-slate-400 mt-1">Sesuai Perjanjian Kerja PKWT</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Cuti Terpakai</p>
                        <p className="text-xl font-black text-amber-900 mt-0.5">{leaveQuota.usedDays} Hari</p>
                        <p className="text-[10px] text-amber-600 mt-1">Tahun Berjalan 2026</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/70">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Sisa Kuota Cuti</p>
                        <p className="text-xl font-black text-emerald-900 mt-0.5">{leaveQuota.remainingDays} Hari</p>
                        <p className="text-[10px] text-emerald-600 mt-1">Dapat diajukan kapan saja</p>
                      </div>
                    </div>

                    {/* Tabel Riwayat Pengajuan Cuti / Izin / Sakit */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Tanggal Pengajuan</th>
                            <th className="p-3">Jenis Dispensasi</th>
                            <th className="p-3">Rentang Tanggal</th>
                            <th className="p-3">Durasi</th>
                            <th className="p-3">Alasan / Keterangan</th>
                            <th className="p-3">Lampiran Bukti</th>
                            <th className="p-3">Status Persetujuan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {leaveRequests.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                                Belum ada riwayat permohonan cuti atau izin.
                              </td>
                            </tr>
                          ) : (
                            leaveRequests.map((lv) => (
                              <tr key={lv.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3 font-medium text-slate-500">
                                  {lv.createdAt ? new Date(lv.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      lv.type === "ANNUAL_LEAVE"
                                        ? "bg-teal-100 text-teal-800"
                                        : lv.type === "SICK_LEAVE"
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {lv.typeLabel}
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-slate-800">
                                  {lv.startDate === lv.endDate ? lv.startDate : `${lv.startDate} s.d. ${lv.endDate}`}
                                </td>
                                <td className="p-3 font-black text-slate-700">{lv.totalDays} Hari</td>
                                <td className="p-3 text-slate-600 max-w-xs">{lv.reason}</td>
                                <td className="p-3">
                                  {lv.attachmentUrl ? (
                                    <a
                                      href={lv.attachmentUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-bold"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>Lihat Surat</span>
                                    </a>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                      lv.status === "APPROVED"
                                        ? "bg-green-100 text-green-700"
                                        : lv.status === "REJECTED"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-amber-100 text-amber-700 animate-pulse"
                                    }`}
                                  >
                                    {lv.status === "APPROVED"
                                      ? "Disetujui"
                                      : lv.status === "REJECTED"
                                      ? "Ditolak"
                                      : "Menunggu Review"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Attendance History Table */}
                  <div className="p-6 sm:p-8 rounded-[36px] bg-white border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="text-lg font-black text-slate-900">Riwayat Presensi Terbaru</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Tanggal</th>
                            <th className="p-3">Check-In</th>
                            <th className="p-3">Check-Out</th>
                            <th className="p-3">Lokasi</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Catatan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {attendanceLogs.map((att) => (
                            <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3 font-bold text-slate-900">{att.date}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-black">{att.checkIn}</span>
                                  {att.selfieCheckIn && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewPhotoModal({
                                          isOpen: true,
                                          title: `Foto Selfie Masuk (${att.date})`,
                                          photoUrl: att.selfieCheckIn!,
                                          time: `Jam Masuk: ${att.checkIn}`,
                                          location: att.location,
                                        })
                                      }
                                      className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm hover:scale-110 transition-transform cursor-pointer shrink-0"
                                      title="Lihat Foto Selfie Masuk"
                                    >
                                      <img
                                        src={att.selfieCheckIn}
                                        alt="Selfie In"
                                        className="w-full h-full object-cover"
                                      />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-700 font-bold">{att.checkOut}</span>
                                  {att.selfieCheckOut && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewPhotoModal({
                                          isOpen: true,
                                          title: `Foto Selfie Pulang (${att.date})`,
                                          photoUrl: att.selfieCheckOut!,
                                          time: `Jam Pulang: ${att.checkOut}`,
                                          location: att.checkOutLocation || att.location,
                                        })
                                      }
                                      className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-blue-500 shadow-sm hover:scale-110 transition-transform cursor-pointer shrink-0"
                                      title="Lihat Foto Selfie Pulang"
                                    >
                                      <img
                                        src={att.selfieCheckOut}
                                        alt="Selfie Out"
                                        className="w-full h-full object-cover"
                                      />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-slate-600">
                                <div className="space-y-1">
                                  {att.projectName && (
                                    <div className="flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-bold w-fit">
                                      <Briefcase className="w-3 h-3 text-indigo-600" />
                                      <span>{att.projectName} {att.projectRole ? `(${att.projectRole})` : ""}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                    <MapPin className="w-3.5 h-3.5 text-dstech-red shrink-0" />
                                    <span>{att.location}</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    {att.latitude && att.longitude ? (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {att.latitude.toFixed(4)}, {att.longitude.toFixed(4)}
                                      </span>
                                    ) : null}
                                    <a
                                      href={
                                        att.mapsUrl ||
                                        (att.latitude && att.longitude
                                          ? `https://www.google.com/maps?q=${att.latitude},${att.longitude}`
                                          : `https://www.google.com/maps?q=${encodeURIComponent(att.location + " Cilegon")}`)
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
                                    >
                                      Maps <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const lat = att.latitude || -6.031846;
                                        const lng = att.longitude || 106.037198;
                                        setPreviewMapData({
                                          isOpen: true,
                                          title: `Presensi: ${att.employeeName} (${att.date})`,
                                          locationName: att.location,
                                          lat,
                                          lng,
                                          mapsUrl: att.mapsUrl || `https://www.google.com/maps?q=${lat},${lng}`,
                                        });
                                      }}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[9px] cursor-pointer"
                                      title="Pratinjau Peta Cepat"
                                    >
                                      <Compass className="w-2.5 h-2.5 text-slate-500" />
                                      Peta
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                                  {att.status}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500 max-w-xs truncate">{att.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: JADWAL RAPAT & NOTULA PERUSAHAAN (Tugas 233 / 110) */}
              {activeTab === "meetings" && (
                <div className="space-y-6">
                  {/* Header Card */}
                  <div className="p-6 sm:p-8 rounded-[36px] bg-white border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-dstech-red text-[10px] font-black uppercase tracking-wider">
                            Video Conference & Notula
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            Total {meetingsList.length} Rapat
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          Jadwal Rapat & Notula Perusahaan
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                          Akses ruang video koordinasi online, briefing harian teknisi, dan dokumentasi hasil keputusan rapat.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/meetings?t=${Date.now()}`, { cache: "no-store" });
                              if (res.ok) {
                                const d = await res.json();
                                if (d?.data) setMeetingsList(d.data);
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                          title="Segarkan Jadwal Rapat"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Segarkan</span>
                        </button>
                      </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={meetingSearch}
                          onChange={(e) => setMeetingSearch(e.target.value)}
                          placeholder="Cari topik, agenda, atau penyelenggara..."
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-dstech-red/20 focus:border-dstech-red transition-all"
                        />
                        {meetingSearch && (
                          <button
                            type="button"
                            onClick={() => setMeetingSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                        <button
                          type="button"
                          onClick={() => setMeetingFilter("ALL")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            meetingFilter === "ALL"
                              ? "bg-slate-900 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Semua ({meetingsList.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setMeetingFilter("ACTIVE")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                            meetingFilter === "ACTIVE"
                              ? "bg-red-600 text-white shadow-sm"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                          Sedang Live ({meetingsList.filter((m) => m.status === "ACTIVE").length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setMeetingFilter("UPCOMING")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            meetingFilter === "UPCOMING"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          Terjadwal ({meetingsList.filter((m) => m.status === "UPCOMING").length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setMeetingFilter("ENDED")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            meetingFilter === "ENDED"
                              ? "bg-slate-700 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Selesai ({meetingsList.filter((m) => m.status === "ENDED").length})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SPOTLIGHT BANNER: RAPAT LIVE / BERLANGSUNG */}
                  {meetingsList.filter((m) => m.status === "ACTIVE").length > 0 && (
                    <div className="p-6 sm:p-7 rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white border border-red-500/30 shadow-xl shadow-red-900/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                      
                      {meetingsList
                        .filter((m) => m.status === "ACTIVE")
                        .slice(0, 1)
                        .map((liveMeeting) => (
                          <div key={liveMeeting.id} className="relative z-10 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider animate-pulse shadow-md shadow-red-600/40">
                                  <span className="w-2 h-2 rounded-full bg-white"></span>
                                  Sedang Berlangsung Sekarang
                                </span>
                                <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold">
                                  Room: #{liveMeeting.roomCode}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-red-400" />
                                {liveMeeting.scheduledAt || "Sekarang"}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                                {liveMeeting.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2">
                                {liveMeeting.description}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white font-black text-sm">
                                  {liveMeeting.hostName ? liveMeeting.hostName.charAt(0).toUpperCase() : "D"}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white leading-tight">
                                    {liveMeeting.hostName || "DSTech Management"}
                                  </p>
                                  <p className="text-[10px] font-medium text-slate-400">
                                    Penyelenggara Rapat
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedMeetingDetail(liveMeeting)}
                                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <FileText className="w-3.5 h-3.5 text-red-400" />
                                  <span>Lihat Notula</span>
                                </button>
                                <a
                                  href={`/meeting/${liveMeeting.roomCode}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/40 flex items-center gap-2 transition-all cursor-pointer"
                                >
                                  <Video className="w-4 h-4" />
                                  <span>Gabung Room Video</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* LIST DAFTAR RAPAT */}
                  <div className="space-y-4">
                    {meetingsList
                      .filter((m) => {
                        if (meetingFilter !== "ALL" && m.status !== meetingFilter) return false;
                        if (meetingSearch.trim()) {
                          const q = meetingSearch.toLowerCase();
                          return (
                            m.title.toLowerCase().includes(q) ||
                            m.description.toLowerCase().includes(q) ||
                            m.hostName?.toLowerCase().includes(q) ||
                            m.roomCode?.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((meeting) => {
                        const isLive = meeting.status === "ACTIVE";
                        const isUpcoming = meeting.status === "UPCOMING";
                        const isEnded = meeting.status === "ENDED";

                        const typeLabel =
                          meeting.meetingType === "INTERNAL_STAF"
                            ? "Koordinasi Internal"
                            : meeting.meetingType === "KONSULTASI_KLIEN"
                            ? "Konsultasi Klien"
                            : "Survey & Bantuan Lapangan";

                        const typeColor =
                          meeting.meetingType === "INTERNAL_STAF"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : meeting.meetingType === "KONSULTASI_KLIEN"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200";

                        return (
                          <div
                            key={meeting.id}
                            className={`p-5 sm:p-6 rounded-[28px] bg-white border transition-all space-y-4 hover:shadow-md ${
                              isLive
                                ? "border-red-300 ring-2 ring-red-500/10 shadow-sm"
                                : "border-slate-200/80"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeColor}`}
                                >
                                  {typeLabel}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    isLive
                                      ? "bg-red-100 text-red-700"
                                      : isUpcoming
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {isLive ? "● Sedang Berlangsung" : isUpcoming ? "🕒 Terjadwal" : "✓ Selesai"}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                  #{meeting.roomCode}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{meeting.scheduledAt || "Sesuai Jadwal"}</span>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-base sm:text-lg font-black text-slate-900">
                                {meeting.title}
                              </h4>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                {meeting.description}
                              </p>
                            </div>

                            {/* Host and Participant Preview */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                                  {meeting.hostName ? meeting.hostName.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block leading-tight">
                                    {meeting.hostName || "Manajemen DSTech"}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Host ({meeting.hostRole || "ADMIN"})
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedMeetingDetail(meeting)}
                                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-dstech-red" />
                                  <span>Notula & Rincian</span>
                                </button>

                                <a
                                  href={`/meeting/${meeting.roomCode}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                                    isLive
                                      ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                                      : "bg-slate-900 hover:bg-slate-800 text-white"
                                  }`}
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>{isLive ? "Gabung Live" : "Buka Room"}</span>
                                  <ExternalLink className="w-3 h-3 opacity-70" />
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {meetingsList.filter((m) => {
                      if (meetingFilter !== "ALL" && m.status !== meetingFilter) return false;
                      if (meetingSearch.trim()) {
                        const q = meetingSearch.toLowerCase();
                        return (
                          m.title.toLowerCase().includes(q) ||
                          m.description.toLowerCase().includes(q) ||
                          m.hostName?.toLowerCase().includes(q) ||
                          m.roomCode?.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    }).length === 0 && (
                      <div className="p-12 text-center rounded-[32px] bg-slate-50 border border-dashed border-slate-200 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                          <Video className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-black text-slate-900">
                          Tidak Ada Rapat yang Cocok
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Tidak ditemukan agenda rapat pada filter atau kata kunci pencarian yang dipilih.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setMeetingFilter("ALL");
                            setMeetingSearch("");
                          }}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Reset Filter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Announcements Panel */}
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-[36px] bg-white border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Pengumuman</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Internal DSTech Smart
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddAnnouncementModalOpen(true)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Tambah Pengumuman Baru"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      onClick={() => setSelectedAnnouncement(ann)}
                      className="group p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-dstech-red/30 hover:bg-white hover:shadow-md transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            ann.category === "PROSEDUR"
                              ? "bg-red-100 text-dstech-red"
                              : ann.category === "TECHNICAL"
                              ? "bg-blue-100 text-dstech-blue"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {ann.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{ann.date}</span>
                      </div>

                      <h4 className="font-black text-slate-900 leading-snug text-sm group-hover:text-dstech-red transition-colors">
                        {ann.title}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {ann.summary}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-dstech-blue group-hover:translate-x-1 transition-transform">
                        <span>Baca Rincian</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsKmsModalOpen(true)}
                  className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-dstech-accent" />
                  <span>Buka Portal KMS</span>
                </button>
              </div>

              {/* Widget Agenda Rapat Terdekat & Live */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-100 text-dstech-red flex items-center justify-center">
                      <Video className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xs">Agenda Rapat</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Video & Notula</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("meetings")}
                    className="text-[11px] font-bold text-dstech-blue hover:text-blue-700 transition-colors"
                  >
                    Buka Tab
                  </button>
                </div>

                <div className="space-y-2">
                  {meetingsList.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMeetingDetail(m);
                        setActiveTab("meetings");
                      }}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-red-50/50 border border-slate-100 hover:border-red-200 transition-all cursor-pointer space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {m.scheduledAt || "Terjadwal"}
                        </span>
                        {m.status === "ACTIVE" ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold text-[9px] animate-pulse">
                            ● Live
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px]">
                            {m.status === "UPCOMING" ? "Terjadwal" : "Selesai"}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-dstech-red transition-colors">
                        {m.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        Host: {m.hostName || "Tim DSTech"}
                      </p>
                    </div>
                  ))}
                  {meetingsList.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">Belum ada agenda rapat</p>
                  )}
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-dstech-accent flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Hotline Darurat K3 & Teknis
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Jika menemui kendala keselamatan kerja atau masalah teknis fatal di lapangan, segera hubungi Team Leader via hotline 24 jam.
                </p>
                <a
                  href="tel:+6282259494242"
                  className="inline-flex items-center gap-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Telepon PIC: +62 822-5949-4242
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: Detail Penugasan */}
      {selectedTask && !isStatusModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dstech-blue">
                  Detail Surat Tugas Kerja
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{selectedTask.title}</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{selectedTask.client}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px]">Lokasi Instalasi:</p>
                <p className="text-slate-900 font-medium mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" /> {selectedTask.location}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px]">Daftar Lingkup Pekerjaan:</p>
                <ul className="mt-1 space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {selectedTask.scope.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px]">Peralatan & Material Disiapkan:</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selectedTask.equipment.map((eq, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-blue-50 text-dstech-blue rounded-lg font-bold text-[11px]"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {selectedTask.photos && selectedTask.photos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-bold text-slate-400 uppercase text-[10px]">
                      Foto Dokumentasi & Part ({selectedTask.photos.length}):
                    </p>
                    <span className="text-[10px] text-dstech-blue font-bold">Siap Lampiran Invoice</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto">
                    {selectedTask.photos.map((p) => (
                      <div key={p.id} className="relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                        <img src={p.url} alt={p.caption} className="w-full h-24 object-cover" />
                        <div className="p-1.5 bg-white text-[10px]">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-1 ${
                              p.category === "part_replacement"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {p.category === "part_replacement" ? "⚙️ Pergantian Part" : "📸 Dokumentasi"}
                          </span>
                          <p className="font-bold text-slate-800 line-clamp-1">{p.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.damagedItems && selectedTask.damagedItems.length > 0 && (
                <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100">
                  <div className="flex items-center gap-2 mb-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Barang / Sparepart Rusak ({selectedTask.damagedItems.length})
                  </div>
                  <div className="space-y-2">
                    {selectedTask.damagedItems.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-rose-100 text-xs">
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-slate-800">{item.name}</span>
                          <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            {item.quantity} {item.unit || "unit"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Kondisi: <span className="font-medium text-slate-700">{item.condition}</span> | Tindakan: <span className="font-medium text-slate-700">{item.actionTaken}</span>
                        </div>
                        {item.notes && <div className="text-[11px] text-slate-400 mt-0.5 italic">Catatan: {item.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedTask.latitude || selectedTask.googleMapsUrl) && (
                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">Koordinat GPS Check-in Lapangan</p>
                      <p className="text-[11px] text-emerald-700 font-mono">
                        {selectedTask.latitude?.toFixed(6)}, {selectedTask.longitude?.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  {selectedTask.googleMapsUrl && (
                    <a
                      href={selectedTask.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      Buka Peta <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {selectedTask.report && (
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Laporan Kerja Terakhir:</p>
                  <p className="mt-1 p-3 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200">
                    {selectedTask.report}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleOpenRequestMaterialForTask(selectedTask)}
                className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-dstech-blue font-bold text-xs flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" /> Ajukan Material
              </button>
              <button
                type="button"
                onClick={() => {
                  setTaskStatusForm({
                    status: selectedTask.status,
                    report: selectedTask.report || "",
                    photos: selectedTask.photos || [],
                    damagedItems: selectedTask.damagedItems || [],
                    latitude: selectedTask.latitude,
                    longitude: selectedTask.longitude,
                    googleMapsUrl: selectedTask.googleMapsUrl,
                  });
                  setIsStatusModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-dstech-blue text-white font-bold text-xs hover:bg-blue-700 shadow-sm"
              >
                Update Status & Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Form Update Status, Laporan & Upload Foto Dokumentasi */}
      {isStatusModalOpen && selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsStatusModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dstech-blue">
                  Formulir Progres & Dokumentasi Lapangan
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">Update Status & Lampiran Foto</h3>
                <p className="text-xs text-slate-500 font-medium">Tugas: {selectedTask.title} — {selectedTask.client}</p>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTaskStatus} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Progres Pekerjaan:</label>
                <select
                  value={taskStatusForm.status}
                  onChange={(e) =>
                    setTaskStatusForm({
                      ...taskStatusForm,
                      status: e.target.value as "Pending" | "In Progress" | "Completed",
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                >
                  <option value="Pending">Pending / Menunggu Jadwal</option>
                  <option value="In Progress">In Progress (Sedang Dikerjakan)</option>
                  <option value="Completed">Completed (Selesai 100%)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Catatan Progres Lapangan & Kendala:
                </label>
                <textarea
                  rows={3}
                  value={taskStatusForm.report}
                  onChange={(e) => setTaskStatusForm({ ...taskStatusForm, report: e.target.value })}
                  placeholder="Contoh: Unit OTB selesai terminasi, tes sinyal -18dBm, fisik rapi dan siap serah terima..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                />
              </div>

              {/* LOKASI GPS CHECK-IN TIKET */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-black text-slate-900 text-xs">Titik Lokasi GPS Kunjungan Lapangan</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectTaskGps}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Compass className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                    <span>{isLocating ? "Mendeteksi Satelit..." : "📍 Ambil Titik GPS Sekarang"}</span>
                  </button>
                </div>
                {taskStatusForm.latitude && taskStatusForm.longitude ? (
                  <div className="flex items-center justify-between text-[11px] bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="font-mono text-slate-700 font-bold">
                      {taskStatusForm.latitude.toFixed(6)}, {taskStatusForm.longitude.toFixed(6)}
                    </span>
                    <a
                      href={taskStatusForm.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${taskStatusForm.latitude},${taskStatusForm.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1"
                    >
                      Buka di Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    Belum ada koordinat GPS tercatat. Klik tombol di atas saat berada di lokasi klien.
                  </p>
                )}
              </div>

              {/* DAFTAR BARANG / KOMPONEN RUSAK YANG DIGANTI */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-black text-slate-900 text-xs">Komponen / Barang Rusak yang Ditemukan</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {taskStatusForm.damagedItems?.length || 0} Komponen
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Nama Komponen / Unit Rusak:</label>
                    <input
                      type="text"
                      placeholder="Contoh: Adaptor CCTV 12V 5A / Port SFP Switch"
                      value={newDamagedItem.name}
                      onChange={(e) => setNewDamagedItem({ ...newDamagedItem, name: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Jumlah & Satuan:</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min={1}
                        value={newDamagedItem.quantity}
                        onChange={(e) => setNewDamagedItem({ ...newDamagedItem, quantity: Number(e.target.value) || 1 })}
                        className="w-16 p-2 rounded-xl border border-slate-200 text-xs bg-white text-center font-bold"
                      />
                      <input
                        type="text"
                        placeholder="unit/pcs"
                        value={newDamagedItem.unit}
                        onChange={(e) => setNewDamagedItem({ ...newDamagedItem, unit: e.target.value })}
                        className="flex-1 p-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Kondisi Kerusakan:</label>
                    <input
                      type="text"
                      value={newDamagedItem.condition}
                      onChange={(e) => setNewDamagedItem({ ...newDamagedItem, condition: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Tindakan Penanganan:</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newDamagedItem.actionTaken}
                        onChange={(e) => setNewDamagedItem({ ...newDamagedItem, actionTaken: e.target.value })}
                        className="flex-1 p-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddDamagedItem}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>
                </div>

                {/* List items */}
                {taskStatusForm.damagedItems && taskStatusForm.damagedItems.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {taskStatusForm.damagedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-amber-200 text-xs">
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.name} <span className="text-amber-700">({item.quantity} {item.unit})</span>
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Kondisi: {item.condition} • Tindakan: {item.actionTaken}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDamagedItem(idx)}
                          className="w-6 h-6 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center shrink-0 cursor-pointer"
                          title="Hapus item rusak"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* UPLOAD FOTO DOKUMENTASI & PERGANTIAN PART */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-dstech-blue" />
                    <span className="font-black text-slate-900 text-xs">
                      Unggah Foto Bukti Kerja (Otomatis Masuk Lampiran Faktur)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {taskStatusForm.photos?.length || 0} Foto Terlampir
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-slate-600 shrink-0">Kategori Foto:</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTaskPhotoCategory("documentation")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          taskPhotoCategory === "documentation"
                            ? "bg-dstech-blue text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        📸 Dokumentasi Pekerjaan
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskPhotoCategory("part_replacement")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          taskPhotoCategory === "part_replacement"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        ⚙️ Pergantian Part (Lama/Baru)
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Keterangan foto (contoh: Pemasangan Switch Cisco / Power supply rusak diganti)..."
                      value={taskPhotoCaption}
                      onChange={(e) => setTaskPhotoCaption(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-dstech-blue"
                    />
                    <label className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingTaskPhoto ? "Mengunggah..." : "Pilih / Kamera"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleUploadTaskPhoto}
                        disabled={isUploadingTaskPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Previews */}
                {taskStatusForm.photos && taskStatusForm.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    {taskStatusForm.photos.map((p) => (
                      <div key={p.id} className="relative rounded-xl overflow-hidden border border-slate-200 bg-white group">
                        <img src={p.url} alt={p.caption} className="w-full h-20 object-cover" />
                        <div className="p-1.5 text-[9px]">
                          <span
                            className={`inline-block px-1 py-0.5 rounded font-black uppercase text-[8px] mb-0.5 ${
                              p.category === "part_replacement"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {p.category === "part_replacement" ? "⚙️ Part" : "📸 Dok"}
                          </span>
                          <p className="font-semibold text-slate-700 truncate">{p.caption}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTaskPhoto(p.id)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer shadow-xs"
                          title="Hapus foto ini"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">
                    Belum ada foto yang diunggah. Ambil foto pekerjaan dan sparepart agar invoice tagihan dapat langsung diverifikasi klien.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dstech-blue text-white font-bold text-xs hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  Simpan Laporan & Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Ajukan Pengambilan Material (Multi-Item) */}
      {isRequestModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsRequestModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dstech-red">
                  Formulir Logistik Gudang
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Ajukan Pengambilan Material (Multi-Item)</h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Pilih material dari stok gudang yang tersedia. Anda dapat mengajukan beberapa item sekaligus.
                </p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitMaterialRequest} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* Dynamic Repeater of Material Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                    Daftar Item Material yang Diminta ({requestForm.items.length})
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">* Wajib dipilih dari stok gudang</span>
                </div>

                {requestForm.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-3 relative transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[11px] text-slate-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </span>
                        <span>Item #{idx + 1}</span>
                      </span>

                      {requestForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRequestItem(idx)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                          title="Hapus baris item ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Baris</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Pilih Material / Alat Kerja dari Stok Gudang:
                      </label>
                      <select
                        required
                        value={item.materialId}
                        onChange={(e) => handleItemSelectChange(idx, e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-dstech-red focus:outline-none text-xs"
                      >
                        <option value="">-- Pilih Material dari Stok Gudang --</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id} disabled={m.stock <= 0}>
                            {m.name} [Stok: {m.stock} {m.unit}
                            {m.hasConversion && m.subUnit ? ` ≈ ${m.subStockTotal || m.stock * (m.conversionRatio || 1)} ${m.subUnit}` : ""}] - {m.location} {m.stock <= 0 ? "(HABIS)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dual Unit Selector & Conversion Details */}
                    {item.hasConversion && item.subUnit && (
                      <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                          <span className="font-black text-dstech-blue flex items-center gap-1.5">
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Pilihan Satuan Pengambilan:</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-blue-200 self-start sm:self-auto">
                            Rasio: {item.conversionLabel || `1 ${item.unit} = ${item.conversionRatio} ${item.subUnit}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleItemUnitChange(idx, item.unit)}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              item.selectedUnit === item.unit
                                ? "bg-dstech-blue text-white shadow-sm"
                                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            Satuan Utama ({item.unit})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemUnitChange(idx, item.subUnit!)}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              item.selectedUnit === item.subUnit
                                ? "bg-dstech-blue text-white shadow-sm"
                                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            Satuan Eceran ({item.subUnit})
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Jumlah Diambil ({item.selectedUnit || item.unit}):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={item.maxStock > 0 ? item.maxStock : undefined}
                            required
                            value={item.qty}
                            onChange={(e) => handleItemQtyChange(idx, Number(e.target.value))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 font-black text-slate-900 focus:ring-2 focus:ring-dstech-red focus:outline-none text-xs bg-white"
                          />
                          <span className="px-3 py-2.5 rounded-xl bg-slate-200 font-black text-slate-800 text-xs shrink-0">
                            {item.selectedUnit || item.unit || "Pcs"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div
                          className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-between ${
                            item.maxStock <= 0
                              ? "bg-red-50 border-red-200 text-red-700"
                              : item.maxStock <= 2
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-green-50 border-green-200 text-green-700"
                          }`}
                        >
                          <span>Batas Sisa Stok:</span>
                          <span className="font-black">
                            {item.maxStock} {item.selectedUnit || item.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live Conversion Preview */}
                    {item.hasConversion && item.equivalentQty !== undefined && item.equivalentUnit && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-900 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          Hasil Konversi: <strong>{item.qty} {item.selectedUnit || item.unit}</strong> setara dengan{" "}
                          <strong className="text-dstech-blue">{item.equivalentQty} {item.equivalentUnit}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Item Button */}
                <button
                  type="button"
                  onClick={handleAddRequestItem}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-dstech-blue/50 hover:border-dstech-blue text-dstech-blue hover:bg-blue-50/70 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Item Barang Lainnya</span>
                </button>
              </div>

              {/* Shared Metadata */}
              <div className="border-t border-slate-200/80 pt-3 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">Terkait Proyek / Surat Tugas:</label>
                    <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-md font-bold border border-green-200">
                      Filter: Hanya Proyek Sedang Berjalan
                    </span>
                  </div>
                  <select
                    value={requestForm.taskTitle}
                    onChange={(e) => setRequestForm({ ...requestForm, taskTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-dstech-red focus:outline-none text-xs"
                  >
                    <option value="">Pilih Proyek Lapangan (Hanya Proyek Aktif Berjalan)</option>
                    {tasks
                      .filter((t) => t.status !== "Completed")
                      .map((t) => (
                        <option key={t.id} value={`${t.title} - ${t.client}`}>
                          {t.title} ({t.client}) - [Status: {t.status === "In Progress" ? "Progres Pelaksanaan" : "Terjadwal"}]
                        </option>
                      ))}
                    <option value="Stok Cadangan Mobil Operasional">Stok Cadangan Mobil Operasional</option>
                    <option value="Perbaikan & Maintenance Mandiri">Perbaikan & Maintenance Mandiri</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catatan / Alasan Keperluan:</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Pengambilan kabel & konektor untuk instalasi CCTV pabrik..."
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-dstech-red focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 shrink-0">
                <span className="text-[11px] font-bold text-slate-500">
                  Total Permohonan: <strong className="text-slate-900">{requestForm.items.length} Macam Material</strong>
                </span>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-dstech-red text-white font-bold hover:bg-red-700 shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Permohonan ({requestForm.items.length} Item)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Check-In Masuk */}
      {isCheckInModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsCheckInModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-green-600" />
                  Presensi Masuk Harian • Terhubung Google Maps
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">Konfirmasi Check-In</h3>
              </div>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GPS Signal Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-dstech-blue" />
                  Status Lokasi GPS:
                </span>
                <button
                  type="button"
                  onClick={() => detectGpsLocation("checkin")}
                  disabled={isDetectingCheckInGps}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isDetectingCheckInGps ? "animate-spin" : ""}`} />
                  {isDetectingCheckInGps ? "Mendeteksi..." : "Deteksi Ulang GPS"}
                </button>
              </div>

              {isDetectingCheckInGps ? (
                <div className="flex items-center gap-2 text-blue-600 font-bold py-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                  </span>
                  <span>Mendeteksi koordinat GPS satelit perangkat Anda...</span>
                </div>
              ) : checkInCoords.source === "gps" ? (
                <div className="flex items-center gap-2 text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Sinyal GPS Akurat Terkunci (Akurasi: ±{checkInCoords.accuracy}m)</span>
                </div>
              ) : gpsErrorCheckIn ? (
                <div className="space-y-1.5 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                  <div className="flex items-start gap-2 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{gpsErrorCheckIn}</span>
                  </div>
                  <p className="text-[10px] text-amber-700/90 pl-6 leading-tight">
                    💡 <strong>Tips:</strong> Jika di browser (Chrome/Edge), ketuk ikon gembok 🔒 di samping kiri alamat web &gt; <em>Izin</em> &gt; <em>Lokasi</em> &gt; pilih <em>Izinkan</em>, lalu ketuk tombol <strong>Deteksi Ulang GPS</strong> di atas.
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 text-[11px]">
                  Koordinat default dipilih dari lokasi kantor / proyek. Klik tombol &quot;Deteksi Ulang GPS&quot; untuk mengunci posisi riil Anda via satelit.
                </p>
              )}
            </div>

            <form onSubmit={handleCheckIn} className="space-y-4 text-xs">
              {/* PENUGASAN PROYEK HARI INI */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                <label className="text-[11px] font-black text-indigo-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Terkait Penugasan Proyek (Sesuai Tim PKWT):
                  </span>
                  <span className="text-[10px] text-indigo-700 font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                    {selectedProjectIdCheckIn ? "✓ Terhubung Proyek" : "Opsional"}
                  </span>
                </label>
                <select
                  value={selectedProjectIdCheckIn}
                  onChange={(e) => setSelectedProjectIdCheckIn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">-- Operasional Kantor / Standar Non-Proyek --</option>
                  {projectsList.map((p: any) => {
                    const isMyTeam = (p.assignedEmployees || []).some(
                      (emp: any) => emp.employeeName?.trim().toLowerCase() === currentUser?.name?.trim().toLowerCase()
                    );
                    const myRole = (p.assignedEmployees || []).find(
                      (emp: any) => emp.employeeName?.trim().toLowerCase() === currentUser?.name?.trim().toLowerCase()
                    )?.roleInProject;
                    return (
                      <option key={p.id} value={p.id}>
                        {isMyTeam ? `⭐ [Tim Anda: ${myRole || "Teknisi"}] ` : ""}
                        [{p.projectCode}] {p.projectName} — {p.clientName}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-slate-500">
                  {selectedProjectIdCheckIn
                    ? "Presensi masuk ini akan dicatat dan dihubungkan ke proyek yang Anda pilih."
                    : "Pilih proyek di mana Anda ditugaskan hari ini agar presensi terdata di rekap proyek."}
                </p>
              </div>

              {/* Status Koordinat GPS Satelit Terkunci */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Koordinat Posisi GPS Satelit (Terkunci Otomatis):
                </label>
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-dstech-red shrink-0" />
                    <div>
                      <p className="font-black text-slate-900 text-xs">
                        {checkInCoords.source === "gps"
                          ? `GPS Satelit (${checkInCoords.lat.toFixed(6)}, ${checkInCoords.lng.toFixed(6)})`
                          : "Menunggu sinyal GPS satelit terkunci..."}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {checkInCoords.source === "gps"
                          ? `Akurasi: ±${checkInCoords.accuracy} meter • Terkunci Permanen (Anti-Tamper)`
                          : "Input manual dilarang oleh sistem demi validitas absensi"}
                      </p>
                    </div>
                  </div>
                  {checkInCoords.source === "gps" ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 border border-green-200 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      GPS Terkunci
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      Wajib Kunci GPS
                    </span>
                  )}
                </div>
              </div>

              {/* Kamera Selfie Wajah Wajib */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-dstech-blue" />
                    Foto Wajah Selfie (Wajib Kamera):
                  </span>
                  {selfieCheckInPhoto ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Foto Terverifikasi
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      Wajib Foto Selfie
                    </span>
                  )}
                </div>

                {/* Input Native Camera Intent (Khusus Aplikasi DSTech Smart / Android WebView Fallback) */}
                <input
                  ref={nativeCheckInInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => handleNativeCameraCapture(e, "checkin")}
                />

                {selfieCheckInPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black group max-h-52 flex items-center justify-center">
                    <img
                      src={selfieCheckInPhoto}
                      alt="Selfie Check-In"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelfieCheckInPhoto(null);
                          startCamera("checkin");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Ambil Ulang (Live)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => nativeCheckInInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Kamera HP Native</span>
                      </button>
                    </div>
                  </div>
                ) : isCameraActive && cameraMode === "checkin" ? (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-black h-56 flex items-center justify-center">
                      {cameraLoading ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-white text-xs">
                          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                          <span>Menghubungkan ke sensor kamera HP...</span>
                        </div>
                      ) : (
                        <video
                          ref={(el) => {
                            videoRef.current = el;
                            if (el && cameraStream && el.srcObject !== cameraStream) {
                              el.srcObject = cameraStream;
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
                          className={`w-full h-full object-cover ${cameraFacing === "user" ? "transform -scale-x-100" : ""}`}
                        />
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Live Camera
                      </div>
                      <button
                        type="button"
                        onClick={switchCamera}
                        title="Balik Kamera (Depan / Belakang)"
                        className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur transition-all cursor-pointer shadow"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {cameraError && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                          <span>{cameraError}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => nativeCheckInInputRef.current?.click()}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all active:scale-95"
                        >
                          <Camera className="w-4 h-4" />
                          <span>📸 Buka Kamera HP Langsung Sekarang</span>
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => takeSnapshot("checkin")}
                        disabled={cameraLoading}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        Jepret Foto Selfie Sekarang
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>

                    {/* Tombol Alternatif Cepat Kamera Native Android */}
                    <button
                      type="button"
                      onClick={() => nativeCheckInInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Kamera live bermasalah? Klik di sini untuk buka Kamera HP langsung</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => startCamera("checkin")}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Buka Live Kamera (Google Chrome / Desktop)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => nativeCheckInInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>📸 Buka Kamera HP Langsung (Khusus Aplikasi DSTech Smart)</span>
                    </button>

                    <p className="text-[10px] text-slate-400 text-center italic">
                      * Sistem anti-manipulasi: Wajib jepretan kamera langsung HP tanpa unggah file galeri.
                    </p>
                  </div>
                )}
              </div>

              {/* Google Maps Live Embed */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-dstech-red" />
                    Pratinjau Posisi Google Maps:
                  </span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    {checkInCoords.lat ? `${checkInCoords.lat.toFixed(5)}, ${checkInCoords.lng.toFixed(5)}` : "0, 0"}
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100">
                  <iframe
                    src={`https://maps.google.com/maps?q=${checkInCoords.lat || -6.031846},${checkInCoords.lng || 106.037198}&hl=id&z=16&output=embed`}
                    className="w-full h-44 border-0"
                    loading="lazy"
                    title="Google Maps Check-In Preview"
                  />
                </div>

                {checkInCoords.source === "gps" && (
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`https://www.google.com/maps?q=${checkInCoords.lat},${checkInCoords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                    >
                      Buka Titik Ini di Aplikasi Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-[10px] text-slate-400">Google Maps Live Sync</span>
                  </div>
                )}
              </div>

              {/* Radar Geofencing Satelit */}
              {checkInCoords.lat !== 0 && (() => {
                const dist = calculateDistanceMeters(checkInCoords.lat, checkInCoords.lng, officeGps.lat, officeGps.lng);
                const isOfficeLocked = currentUser?.attendanceLocationLock === "OFFICE";
                const maxRad = currentUser?.officeRadius || officeGps.radius || 250;

                const selectedPrj = projectsList.find((p) => p.id === selectedProjectIdCheckIn);
                let prjDist: number | null = null;
                let isWithinPrj = false;
                if (selectedPrj?.latitude && selectedPrj?.longitude) {
                  prjDist = calculateDistanceMeters(checkInCoords.lat, checkInCoords.lng, selectedPrj.latitude, selectedPrj.longitude);
                  isWithinPrj = prjDist <= (selectedPrj.radiusMeters || 350);
                }

                const isWithinOffice = dist <= maxRad;
                const isViolated = isOfficeLocked && !isWithinOffice && !isWithinPrj;

                return (
                  <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                    isOfficeLocked
                      ? isViolated
                        ? "bg-rose-50 border-rose-300 text-rose-950"
                        : "bg-emerald-50 border-emerald-300 text-emerald-950"
                      : "bg-blue-50 border-blue-200 text-blue-950"
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-dstech-blue" />
                        Geofence Radar Satelit:
                      </span>
                      <span className="font-mono text-xs">
                        Jarak ke Kantor: <strong>{dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist}m`}</strong>
                        {prjDist !== null && (
                          <span className="ml-2 text-blue-700">
                            | Proyek: <strong>{prjDist >= 1000 ? `${(prjDist / 1000).toFixed(2)} km` : `${prjDist}m`}</strong>
                          </span>
                        )}
                      </span>
                    </div>
                    {isOfficeLocked ? (
                      isViolated ? (
                        <div className="flex items-start gap-2 text-rose-700 font-bold">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] leading-relaxed">
                            PRESENSI DITOLAK: Posisi Anda berada di luar radius kantor ({dist}m &gt; maks {maxRad}m)
                            {selectedPrj ? ` dan luar radius proyek ${selectedPrj.projectName} (${prjDist}m &gt; ${selectedPrj.radiusMeters || 350}m)` : ""}.
                            Dekatilah titik lokasi atau hubungi admin untuk memperbarui koordinat GPS.
                          </p>
                        </div>
                      ) : isWithinOffice ? (
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <p className="text-[11px]">
                            TERVERIFIKASI DI KANTOR: Posisi Anda berada di area resmi kantor (Jarak: {dist} meter ≤ {maxRad}m). Presensi Diizinkan!
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <p className="text-[11px]">
                            TERVERIFIKASI DI LOKASI PROYEK ({selectedPrj?.projectName}): Jarak {prjDist}m ≤ {selectedPrj?.radiusMeters || 350}m. Presensi Diizinkan!
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-blue-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <p className="text-[11px]">
                          Mode Fleksibel Lapangan: Presensi sah di mana pun lokasi proyek/lapangan berada.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Lapangan (Opsional):</label>
                <input
                  type="text"
                  placeholder="Contoh: Menuju lokasi pabrik untuk instalasi kabel"
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsCheckInModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                {(() => {
                  const dist = calculateDistanceMeters(checkInCoords.lat, checkInCoords.lng, officeGps.lat, officeGps.lng);
                  const isOfficeLocked = currentUser?.attendanceLocationLock === "OFFICE";
                  const maxRad = currentUser?.officeRadius || officeGps.radius || 250;
                  const selectedPrj = projectsList.find((p) => p.id === selectedProjectIdCheckIn);
                  let isWithinPrj = false;
                  if (selectedPrj?.latitude && selectedPrj?.longitude) {
                    const prjDist = calculateDistanceMeters(checkInCoords.lat, checkInCoords.lng, selectedPrj.latitude, selectedPrj.longitude);
                    isWithinPrj = prjDist <= (selectedPrj.radiusMeters || 350);
                  }
                  const isViolated = isOfficeLocked && checkInCoords.lat !== 0 && dist > maxRad && !isWithinPrj;
                  const isReady = checkInCoords.source === "gps" && !!selfieCheckInPhoto && !isViolated;

                  return (
                    <button
                      id="btn-submit-checkin"
                      type="submit"
                      disabled={!isReady}
                      className={`px-5 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-1.5 transition-all ${
                        isReady
                          ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                          : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-75"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Konfirmasi Check-In Sekarang
                    </button>
                  );
                })()}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Check-Out Pulang */}
      {isCheckOutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsCheckOutModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Presensi Pulang Harian • Terhubung Google Maps
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">Konfirmasi Check-Out</h3>
              </div>
              <button
                onClick={() => setIsCheckOutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GPS Signal Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-dstech-blue" />
                  Status Lokasi Pulang:
                </span>
                <button
                  type="button"
                  onClick={() => detectGpsLocation("checkout")}
                  disabled={isDetectingCheckOutGps}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isDetectingCheckOutGps ? "animate-spin" : ""}`} />
                  {isDetectingCheckOutGps ? "Mendeteksi..." : "Deteksi Ulang GPS"}
                </button>
              </div>

              {isDetectingCheckOutGps ? (
                <div className="flex items-center gap-2 text-blue-600 font-bold py-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                  </span>
                  <span>Mendeteksi koordinat GPS satelit posisi pulang...</span>
                </div>
              ) : checkOutCoords.source === "gps" ? (
                <div className="flex items-center gap-2 text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Sinyal GPS Pulang Terkunci (Akurasi: ±{checkOutCoords.accuracy}m)</span>
                </div>
              ) : gpsErrorCheckOut ? (
                <div className="space-y-1.5 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                  <div className="flex items-start gap-2 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{gpsErrorCheckOut}</span>
                  </div>
                  <p className="text-[10px] text-amber-700/90 pl-6 leading-tight">
                    💡 <strong>Tips:</strong> Jika di browser (Chrome/Edge), ketuk ikon gembok 🔒 di samping kiri alamat web &gt; <em>Izin</em> &gt; <em>Lokasi</em> &gt; pilih <em>Izinkan</em>, lalu ketuk tombol <strong>Deteksi Ulang GPS</strong> di atas.
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 text-[11px]">
                  Titik lokasi pulang dapat disesuaikan otomatis dengan GPS satelit atau preset lokasi kantor.
                </p>
              )}
            </div>

            <form onSubmit={handleCheckOut} className="space-y-4 text-xs">
              {/* PENUGASAN PROYEK HARI INI */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                <label className="text-[11px] font-black text-indigo-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Terkait Penugasan Proyek (Sesuai Tim PKWT):
                  </span>
                  <span className="text-[10px] text-indigo-700 font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                    {selectedProjectIdCheckOut ? "✓ Terhubung Proyek" : "Opsional"}
                  </span>
                </label>
                <select
                  value={selectedProjectIdCheckOut}
                  onChange={(e) => setSelectedProjectIdCheckOut(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">-- Operasional Kantor / Standar Non-Proyek --</option>
                  {projectsList.map((p: any) => {
                    const isMyTeam = (p.assignedEmployees || []).some(
                      (emp: any) => emp.employeeName?.trim().toLowerCase() === currentUser?.name?.trim().toLowerCase()
                    );
                    const myRole = (p.assignedEmployees || []).find(
                      (emp: any) => emp.employeeName?.trim().toLowerCase() === currentUser?.name?.trim().toLowerCase()
                    )?.roleInProject;
                    return (
                      <option key={p.id} value={p.id}>
                        {isMyTeam ? `⭐ [Tim Anda: ${myRole || "Teknisi"}] ` : ""}
                        [{p.projectCode}] {p.projectName} — {p.clientName}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-slate-500">
                  {selectedProjectIdCheckOut
                    ? "Presensi pulang ini akan dicatat dan dihubungkan ke proyek yang Anda pilih."
                    : "Pilih proyek di mana Anda bertugas hari ini."}
                </p>
              </div>

              {/* Status Koordinat GPS Satelit Pulang Terkunci */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Koordinat Posisi Pulang Satelit (Terkunci Otomatis):
                </label>
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-dstech-blue shrink-0" />
                    <div>
                      <p className="font-black text-slate-900 text-xs">
                        {checkOutCoords.source === "gps"
                          ? `GPS Satelit (${checkOutCoords.lat.toFixed(6)}, ${checkOutCoords.lng.toFixed(6)})`
                          : "Menunggu sinyal GPS satelit posisi pulang terkunci..."}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {checkOutCoords.source === "gps"
                          ? `Akurasi: ±${checkOutCoords.accuracy} meter • Terkunci Permanen (Anti-Tamper)`
                          : "Input manual dilarang oleh sistem"}
                      </p>
                    </div>
                  </div>
                  {checkOutCoords.source === "gps" ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      GPS Terkunci
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      Wajib Kunci GPS
                    </span>
                  )}
                </div>
              </div>

              {/* Kamera Selfie Pulang Wajib */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-slate-700" />
                    Foto Wajah Selfie Pulang (Wajib Kamera):
                  </span>
                  {selfieCheckOutPhoto ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Foto Terverifikasi
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      Wajib Foto Selfie
                    </span>
                  )}
                </div>

                {/* Input Native Camera Intent (Khusus Aplikasi DSTech Smart / Android WebView Fallback) */}
                <input
                  ref={nativeCheckOutInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => handleNativeCameraCapture(e, "checkout")}
                />

                {selfieCheckOutPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black group max-h-52 flex items-center justify-center">
                    <img
                      src={selfieCheckOutPhoto}
                      alt="Selfie Check-Out"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelfieCheckOutPhoto(null);
                          startCamera("checkout");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Ambil Ulang (Live)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => nativeCheckOutInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Kamera HP Native</span>
                      </button>
                    </div>
                  </div>
                ) : isCameraActive && cameraMode === "checkout" ? (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-black h-56 flex items-center justify-center">
                      {cameraLoading ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-white text-xs">
                          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                          <span>Menghubungkan ke sensor kamera HP...</span>
                        </div>
                      ) : (
                        <video
                          ref={(el) => {
                            videoRef.current = el;
                            if (el && cameraStream && el.srcObject !== cameraStream) {
                              el.srcObject = cameraStream;
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
                          className={`w-full h-full object-cover ${cameraFacing === "user" ? "transform -scale-x-100" : ""}`}
                        />
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Live Camera
                      </div>
                      <button
                        type="button"
                        onClick={switchCamera}
                        title="Balik Kamera (Depan / Belakang)"
                        className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur transition-all cursor-pointer shadow"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {cameraError && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                          <span>{cameraError}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => nativeCheckOutInputRef.current?.click()}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all active:scale-95"
                        >
                          <Camera className="w-4 h-4" />
                          <span>📸 Buka Kamera HP Langsung Sekarang</span>
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => takeSnapshot("checkout")}
                        disabled={cameraLoading}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        Jepret Foto Selfie Pulang
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>

                    {/* Tombol Alternatif Cepat Kamera Native Android */}
                    <button
                      type="button"
                      onClick={() => nativeCheckOutInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Kamera live bermasalah? Klik di sini untuk buka Kamera HP langsung</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => startCamera("checkout")}
                      className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Buka Live Kamera (Google Chrome / Desktop)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => nativeCheckOutInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>📸 Buka Kamera HP Langsung (Khusus Aplikasi DSTech Smart)</span>
                    </button>

                    <p className="text-[10px] text-slate-400 text-center italic">
                      * Sistem anti-manipulasi: Wajib jepretan kamera langsung HP tanpa unggah file galeri.
                    </p>
                  </div>
                )}
              </div>

              {/* Google Maps Live Embed */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-dstech-red" />
                    Pratinjau Posisi Google Maps:
                  </span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    {checkOutCoords.lat ? `${checkOutCoords.lat.toFixed(5)}, ${checkOutCoords.lng.toFixed(5)}` : "0, 0"}
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100">
                  <iframe
                    src={`https://maps.google.com/maps?q=${checkOutCoords.lat || -6.031846},${checkOutCoords.lng || 106.037198}&hl=id&z=16&output=embed`}
                    className="w-full h-44 border-0"
                    loading="lazy"
                    title="Google Maps Check-Out Preview"
                  />
                </div>

                {checkOutCoords.source === "gps" && (
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`https://www.google.com/maps?q=${checkOutCoords.lat},${checkOutCoords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                    >
                      Buka Titik Ini di Aplikasi Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-[10px] text-slate-400">Google Maps Live Sync</span>
                  </div>
                )}
              </div>

              {/* Radar Geofencing Satelit Pulang */}
              {checkOutCoords.lat !== 0 && (() => {
                const dist = calculateDistanceMeters(checkOutCoords.lat, checkOutCoords.lng, officeGps.lat, officeGps.lng);
                const isOfficeLocked = currentUser?.attendanceLocationLock === "OFFICE";
                const maxRad = currentUser?.officeRadius || officeGps.radius || 250;

                const selectedPrj = projectsList.find((p) => p.id === selectedProjectIdCheckOut);
                let prjDist: number | null = null;
                let isWithinPrj = false;
                if (selectedPrj?.latitude && selectedPrj?.longitude) {
                  prjDist = calculateDistanceMeters(checkOutCoords.lat, checkOutCoords.lng, selectedPrj.latitude, selectedPrj.longitude);
                  isWithinPrj = prjDist <= (selectedPrj.radiusMeters || 350);
                }

                const isWithinOffice = dist <= maxRad;
                const isViolated = isOfficeLocked && !isWithinOffice && !isWithinPrj;

                return (
                  <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                    isOfficeLocked
                      ? isViolated
                        ? "bg-rose-50 border-rose-300 text-rose-950"
                        : "bg-emerald-50 border-emerald-300 text-emerald-950"
                      : "bg-blue-50 border-blue-200 text-blue-950"
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-dstech-blue" />
                        Geofence Radar Satelit:
                      </span>
                      <span className="font-mono text-xs">
                        Jarak ke Kantor: <strong>{dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist}m`}</strong>
                        {prjDist !== null && (
                          <span className="ml-2 text-blue-700">
                            | Proyek: <strong>{prjDist >= 1000 ? `${(prjDist / 1000).toFixed(2)} km` : `${prjDist}m`}</strong>
                          </span>
                        )}
                      </span>
                    </div>
                    {isOfficeLocked ? (
                      isViolated ? (
                        <div className="flex items-start gap-2 text-rose-700 font-bold">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] leading-relaxed">
                            PRESENSI PULANG DITOLAK: Posisi Anda berada di luar radius kantor ({dist}m &gt; maks {maxRad}m)
                            {selectedPrj ? ` dan luar radius proyek ${selectedPrj.projectName} (${prjDist}m &gt; ${selectedPrj.radiusMeters || 350}m)` : ""}.
                            Dekatilah titik lokasi atau hubungi admin.
                          </p>
                        </div>
                      ) : isWithinOffice ? (
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <p className="text-[11px]">
                            TERVERIFIKASI DI KANTOR: Posisi Anda berada di area resmi kantor (Jarak: {dist} meter ≤ {maxRad}m). Presensi Diizinkan!
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <p className="text-[11px]">
                            TERVERIFIKASI DI LOKASI PROYEK ({selectedPrj?.projectName}): Jarak {prjDist}m ≤ {selectedPrj?.radiusMeters || 350}m. Presensi Diizinkan!
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-blue-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <p className="text-[11px]">
                          Mode Fleksibel Lapangan: Presensi sah di mana pun lokasi proyek/lapangan berada.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Rangkuman Kerja Hari Ini (Daily Summary):
                </label>
                <textarea
                  id="input-checkout-summary"
                  rows={3}
                  required
                  placeholder="Contoh: Selesai instalasi 3 titik CCTV di Posco, material rapi di gudang, sisa 1 roll kabel dikembalikan."
                  value={checkOutSummary}
                  onChange={(e) => setCheckOutSummary(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsCheckOutModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                {(() => {
                  const dist = calculateDistanceMeters(checkOutCoords.lat, checkOutCoords.lng, officeGps.lat, officeGps.lng);
                  const isOfficeLocked = currentUser?.attendanceLocationLock === "OFFICE";
                  const maxRad = currentUser?.officeRadius || officeGps.radius || 250;
                  const selectedPrj = projectsList.find((p) => p.id === selectedProjectIdCheckOut);
                  let isWithinPrj = false;
                  if (selectedPrj?.latitude && selectedPrj?.longitude) {
                    const prjDist = calculateDistanceMeters(checkOutCoords.lat, checkOutCoords.lng, selectedPrj.latitude, selectedPrj.longitude);
                    isWithinPrj = prjDist <= (selectedPrj.radiusMeters || 350);
                  }
                  const isViolated = isOfficeLocked && checkOutCoords.lat !== 0 && dist > maxRad && !isWithinPrj;
                  const isReady = checkOutCoords.source === "gps" && !!selfieCheckOutPhoto && !isViolated;

                  return (
                    <button
                      id="btn-submit-checkout"
                      type="submit"
                      disabled={!isReady}
                      className={`px-5 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-1.5 transition-all ${
                        isReady
                          ? "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                          : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-75"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Simpan & Check-Out Pulang
                    </button>
                  );
                })()}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK MODAL: Pratinjau Peta Lokasi Google Maps */}
      {previewMapData?.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPreviewMapData(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Pratinjau Peta Presensi Google Maps
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">{previewMapData.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{previewMapData.locationName}</p>
              </div>
              <button
                onClick={() => setPreviewMapData(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100">
              <iframe
                src={`https://maps.google.com/maps?q=${previewMapData.lat},${previewMapData.lng}&hl=id&z=16&output=embed`}
                className="w-full h-64 border-0"
                loading="lazy"
                title="Google Maps History Preview"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-xs text-slate-500">
                Koordinat: {previewMapData.lat.toFixed(6)}, {previewMapData.lng.toFixed(6)}
              </span>
              <a
                href={previewMapData.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md transition-colors"
              >
                Buka di Google Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* QUICK MODAL: Pratinjau Foto Selfie Presensi */}
      {previewPhotoModal?.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPreviewPhotoModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Foto Wajah Terverifikasi Kamera
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">{previewPhotoModal.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{previewPhotoModal.time}</p>
              </div>
              <button
                onClick={() => setPreviewPhotoModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-black">
              <img
                src={previewPhotoModal.photoUrl}
                alt="Selfie Presensi"
                className="w-full h-72 object-cover"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 font-medium text-left">
              <p className="font-bold text-slate-800">Lokasi Presensi:</p>
              <p className="truncate">{previewPhotoModal.location}</p>
            </div>

            <button
              type="button"
              onClick={() => setPreviewPhotoModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
      {isOvertimeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsOvertimeModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dstech-blue">
                  Formulir Overtime
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Ajukan Permintaan Lembur</h3>
              </div>
              <button
                onClick={() => setIsOvertimeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOvertime} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Lembur:</label>
                <input
                  type="date"
                  required
                  value={overtimeForm.date}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, date: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mulai:</label>
                  <input
                    type="time"
                    required
                    value={overtimeForm.startTime}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, startTime: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selesai:</label>
                  <input
                    type="time"
                    required
                    value={overtimeForm.endTime}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, endTime: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Durasi (Jam):</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={overtimeForm.hours}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, hours: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-dstech-red"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">Terkait Penugasan / Proyek:</label>
                  <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-md font-bold border border-green-200">
                    Filter: Hanya Proyek Sedang Berjalan
                  </span>
                </div>
                <select
                  value={overtimeForm.taskTitle}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, taskTitle: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="">Pilih Proyek Terkait (Hanya Proyek Aktif Berjalan)</option>
                  {tasks
                    .filter((t) => t.status !== "Completed")
                    .map((t) => (
                      <option key={t.id} value={`${t.title} - ${t.client}`}>
                        {t.title} ({t.client}) - [Status: {t.status === "In Progress" ? "Progres Pelaksanaan" : "Terjadwal"}]
                      </option>
                    ))}
                  <option value="Maintenance Workshop & Perakitan">Maintenance Workshop & Perakitan</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan Teknis Lembur:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Mengejar commissioning sistem sebelum jam operasional pabrik dibuka..."
                  value={overtimeForm.reason}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, reason: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOvertimeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dstech-blue text-white font-bold hover:bg-blue-700 shadow-md"
                >
                  Ajukan ke HR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENGAJUAN CUTI / IZIN / SAKIT (Tugas 232 / 109) */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsLeaveModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <HeartPulse className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">Formulir Permohonan Cuti &amp; Izin</h3>
                  <p className="text-xs text-slate-400">Ajukan permohonan dispensasi kehadiran resmi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-4">
              {/* Pilihan Tipe Dispensasi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Jenis Pengajuan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveForm((prev) => ({ ...prev, type: "ANNUAL_LEAVE" }))}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      leaveForm.type === "ANNUAL_LEAVE"
                        ? "border-teal-500 bg-teal-50 text-teal-900 font-black shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold"
                    }`}
                  >
                    <p className="text-xs">🏖️ Cuti Tahunan</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sisa: {leaveQuota.remainingDays} Hari</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeaveForm((prev) => ({ ...prev, type: "SPECIAL_PERMISSION" }))}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      leaveForm.type === "SPECIAL_PERMISSION"
                        ? "border-blue-500 bg-blue-50 text-blue-900 font-black shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold"
                    }`}
                  >
                    <p className="text-xs">📋 Izin Khusus</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mendesak/Keluarga</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeaveForm((prev) => ({ ...prev, type: "SICK_LEAVE" }))}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      leaveForm.type === "SICK_LEAVE"
                        ? "border-rose-500 bg-rose-50 text-rose-900 font-black shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold"
                    }`}
                  >
                    <p className="text-xs">🏥 Izin Sakit</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Surat Dokter</p>
                  </button>
                </div>
              </div>

              {/* Rentang Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => handleLeaveDateChange(e.target.value, leaveForm.endDate)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => handleLeaveDateChange(leaveForm.startDate, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Info Total Hari */}
              <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900">Total Durasi Pengajuan:</span>
                <span className="text-sm font-black text-teal-700 bg-white px-3 py-1 rounded-xl shadow-xs border border-teal-100">
                  {leaveForm.totalDays} Hari Kerja
                </span>
              </div>

              {/* Alasan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alasan &amp; Keterangan Keperluan
                </label>
                <textarea
                  required
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Contoh: Keperluan acara keluarga di luar kota / Sakit demam tinggi..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Upload Surat Dokter (Wajib jika Sakit) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lampiran Berkas / Surat Dokter {leaveForm.type === "SICK_LEAVE" && <span className="text-rose-500 font-bold">*Wajib</span>}
                </label>
                {leaveForm.attachmentUrl ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">Berkas Berhasil Terlampir</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLeaveForm((prev) => ({ ...prev, attachmentUrl: null }))}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      id="doctorNoteInput"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadDoctorNote(file);
                      }}
                    />
                    <label
                      htmlFor="doctorNoteInput"
                      className={`flex-1 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/30 text-slate-600 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        isUploadingDoctorNote ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {isUploadingDoctorNote ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span>Unggah Foto Surat Dokter / Bukti Pendukung</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingLeave ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <span>Kirim Pengajuan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Buat Tiket Maintenance Mandiri Teknisi */}
      {isCreateTaskModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => !isSubmittingNewTask && setIsCreateTaskModalOpen(false)}
        >
          <div
            className="bg-white rounded-[32px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto border border-slate-100 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-dstech-blue text-[10px] font-black uppercase tracking-wider">
                    Portal Teknisi Lapangan
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    Eksekusi Cepat
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Buat Tiket Maintenance Baru
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Catat pekerjaan atau temuan kendala di lapangan dan langsung mulai eksekusi perbaikan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
                disabled={isSubmittingNewTask}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitCreateTask} className="space-y-5 text-xs">
              {/* Entitas Perusahaan & Jenis Pekerjaan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Entitas Penugasan:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTaskForm({ ...newTaskForm, entityType: "PT" })}
                      className={`p-2.5 rounded-xl font-bold border text-center transition-all cursor-pointer ${
                        newTaskForm.entityType === "PT"
                          ? "bg-blue-50 border-dstech-blue text-dstech-blue shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      🏢 PT (Resmi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTaskForm({ ...newTaskForm, entityType: "NON_PT" })}
                      className={`p-2.5 rounded-xl font-bold border text-center transition-all cursor-pointer ${
                        newTaskForm.entityType === "NON_PT"
                          ? "bg-amber-50 border-amber-500 text-amber-700 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      👤 Non-PT / Perseorangan
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Jenis Tindakan:
                  </label>
                  <select
                    value={newTaskForm.type}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:border-dstech-blue focus:ring-1 focus:ring-dstech-blue"
                  >
                    <option value="Corrective Maintenance">🔧 Corrective Maintenance (Perbaikan Kendala)</option>
                    <option value="Preventive Maintenance">🛡️ Preventive Maintenance (Perawatan Berkala)</option>
                    <option value="Instalasi Baru">⚡ Instalasi & Pemasangan Baru</option>
                    <option value="Pengecekan Darurat">🚨 Pengecekan Darurat / Emergency</option>
                    <option value="Penggantian Part">🔄 Penggantian Komponen / Sparepart</option>
                    <option value="Relokasi & Setting">📍 Relokasi & Kalibrasi Ulang</option>
                  </select>
                </div>
              </div>

              {/* Judul Pekerjaan */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Judul Pekerjaan / Kendala <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Perbaikan Barrier Gate Macet & Sensor Loop Pos Masuk"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-dstech-blue focus:ring-1 focus:ring-dstech-blue"
                />
              </div>

              {/* Klien & Lokasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nama Klien / Perusahaan <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Krakatau Posco / RS Kurnia"
                    value={newTaskForm.client}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, client: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    PIC Klien & Telepon (Opsional):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nama PIC"
                      value={newTaskForm.clientPic}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, clientPic: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="No HP / WA"
                      value={newTaskForm.clientPhone}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, clientPhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Alamat Lokasi + Tombol GPS */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Alamat / Area Lokasi Lapangan:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const lat = Number(pos.coords.latitude.toFixed(6));
                            const lng = Number(pos.coords.longitude.toFixed(6));
                            setNewTaskForm((prev) => ({
                              ...prev,
                              location: prev.location || `Area Lokasi (${lat}, ${lng})`,
                              latitude: lat,
                              longitude: lng,
                              googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                            }));
                            showToast(`📍 Koordinat GPS terkunci: ${lat}, ${lng}`);
                          },
                          (err) => showToast("Gagal baca GPS: " + err.message),
                          { enableHighAccuracy: true, timeout: 8000 }
                        );
                      }
                    }}
                    className="text-[11px] font-bold text-dstech-blue hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Kunci Koordinat GPS Saya</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Contoh: Gedung Administrasi Lt. 2, Kawasan Industri Krakatau Cilegon"
                  value={newTaskForm.location}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
                {newTaskForm.latitude && newTaskForm.longitude && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    ✓ Koordinat terdata: {newTaskForm.latitude}, {newTaskForm.longitude}
                  </p>
                )}
              </div>

              {/* Tanggal, Prioritas & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tanggal Eksekusi:
                  </label>
                  <input
                    type="date"
                    value={newTaskForm.date}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, date: e.target.value, deadline: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tingkat Prioritas:
                  </label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium (Sedang)</option>
                    <option value="High">High (Tinggi)</option>
                    <option value="Urgent">🚨 Urgent (Darurat)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Status Awal:
                  </label>
                  <select
                    value={newTaskForm.status}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, status: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold text-blue-700 bg-blue-50"
                  >
                    <option value="In Progress">▶ In Progress (Langsung Dikerjakan)</option>
                    <option value="Pending">⏳ Pending (Menunggu Jadwal)</option>
                  </select>
                </div>
              </div>

              {/* Teknisi Pelaksana */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Teknisi / Personel Pelaksana:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Teknisi"
                    value={newTaskForm.technician}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, technician: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="No HP / Kontak Teknisi"
                    value={newTaskForm.technicianPhone}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, technicianPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Lingkup Pekerjaan (Scope Checklist) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="font-black text-slate-800 block text-xs flex items-center justify-between">
                  <span>Rencana Lingkup Tindakan / Checklist:</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {newTaskForm.scope.length} Poin Tindakan
                  </span>
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {newTaskForm.scope.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200 text-[11px]"
                    >
                      <span className="font-medium text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setNewTaskForm({
                            ...newTaskForm,
                            scope: newTaskForm.scope.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-slate-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Tambah item tindakan/perbaikan..."
                    value={newScopeItemInput}
                    onChange={(e) => setNewScopeItemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newScopeItemInput.trim()) {
                          setNewTaskForm({
                            ...newTaskForm,
                            scope: [...newTaskForm.scope, newScopeItemInput.trim()],
                          });
                          setNewScopeItemInput("");
                        }
                      }
                    }}
                    className="flex-1 p-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newScopeItemInput.trim()) {
                        setNewTaskForm({
                          ...newTaskForm,
                          scope: [...newTaskForm.scope, newScopeItemInput.trim()],
                        });
                        setNewScopeItemInput("");
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              {/* Catatan / Keterangan Tambahan */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Catatan Awal / Gejala Kerusakan:
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat kendala di lapangan atau instruksi khusus dari klien..."
                  value={newTaskForm.notes}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  disabled={isSubmittingNewTask}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewTask}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-dstech-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingNewTask ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Tiket...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>✓ Buat & Mulai Eksekusi Tiket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Detail Pengumuman */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md ${
                    selectedAnnouncement.category === "PROSEDUR"
                      ? "bg-red-100 text-dstech-red"
                      : selectedAnnouncement.category === "TECHNICAL"
                      ? "bg-blue-100 text-dstech-blue"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {selectedAnnouncement.category}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2 leading-tight">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Oleh: <strong className="text-slate-700">{selectedAnnouncement.author}</strong> — {selectedAnnouncement.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-medium">
              <p className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-800">
                {selectedAnnouncement.content}
              </p>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Tutup Pengumuman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: Tambah Pengumuman Baru */}
      {isAddAnnouncementModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsAddAnnouncementModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dstech-blue">
                  Papan Informasi Internal
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Tambah Pengumuman Baru</h3>
              </div>
              <button
                onClick={() => setIsAddAnnouncementModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Pengumuman:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jadwal Uji Sertifikasi BNSP CCTV..."
                  value={newAnnouncementForm.title}
                  onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-dstech-blue"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori:</label>
                <select
                  value={newAnnouncementForm.category}
                  onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, category: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="PROSEDUR">PROSEDUR (SOP / K3)</option>
                  <option value="TECHNICAL">TECHNICAL (Firmware / Hardware)</option>
                  <option value="HR INFO">HR INFO (Kebijakan / Cuti)</option>
                  <option value="INFO UMUM">INFO UMUM (Operasional)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ringkasan Singkat:</label>
                <input
                  type="text"
                  placeholder="Ringkasan 1 kalimat yang muncul di daftar..."
                  value={newAnnouncementForm.summary}
                  onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, summary: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Isi Lengkap Pengumuman:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan instruksi atau pengumuman secara rinci..."
                  value={newAnnouncementForm.content}
                  onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, content: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAnnouncementModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dstech-blue text-white font-bold hover:bg-blue-700 shadow-md"
                >
                  Terbitkan Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: Portal KMS (Knowledge Management System) */}
      {isKmsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsKmsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-dstech-accent flex items-center justify-center shadow-md">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-dstech-blue">
                    Knowledge Management System
                  </span>
                  <h3 className="text-xl font-black text-slate-900">Portal KMS PT. DSTech Smart Perkasa</h3>
                </div>
              </div>
              <button
                onClick={() => setIsKmsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KMS Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-100 pb-2 overflow-x-auto">
              <button
                onClick={() => setKmsTab("sop")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  kmsTab === "sop" ? "bg-dstech-blue text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                SOP Instalasi Lapangan
              </button>
              <button
                onClick={() => setKmsTab("k3")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  kmsTab === "k3" ? "bg-dstech-blue text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Standar K3 Teknisi
              </button>
              <button
                onClick={() => setKmsTab("firmware")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  kmsTab === "firmware" ? "bg-dstech-blue text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Firmware DVR / NVR
              </button>
              <button
                onClick={() => setKmsTab("kontak")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  kmsTab === "kontak" ? "bg-dstech-blue text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Kontak PIC Lapangan
              </button>
              <button
                onClick={() => setKmsTab("troubleshooting")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  kmsTab === "troubleshooting" ? "bg-dstech-blue text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Troubleshooting
              </button>
            </div>

            {/* KMS Content Area (Dynamic from API / kmsList) */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs leading-relaxed text-slate-600">
              {kmsList.filter((k) => k.category === kmsTab).length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-bold text-xs">Belum ada dokumen panduan di kategori ini.</p>
                  <p className="text-[11px]">Admin dapat memperbarui data KMS melalui Portal Admin &gt; KMS Teknisi.</p>
                </div>
              ) : (
                kmsList
                  .filter((k) => k.category === kmsTab)
                  .map((item) => {
                    if (kmsTab === "sop") {
                      return (
                        <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                              <FileText className="w-4 h-4 text-dstech-blue shrink-0" /> {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-semibold">{item.updatedAt}</span>
                          </div>
                          {item.summary && item.summary !== item.title && (
                            <p className="text-[11px] text-slate-500 font-medium italic">{item.summary}</p>
                          )}
                          <div className="whitespace-pre-line text-slate-700 leading-relaxed font-medium pt-1">
                            {item.content}
                          </div>
                        </div>
                      );
                    }

                    if (kmsTab === "k3") {
                      return (
                        <div key={item.id} className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-black text-red-900 text-sm flex items-center gap-2">
                              <HardHat className="w-5 h-5 text-red-600 shrink-0" /> {item.title}
                            </h4>
                            <span className="text-[10px] text-red-600/70 font-semibold">{item.updatedAt}</span>
                          </div>
                          {item.summary && item.summary !== item.title && (
                            <p className="text-[11px] text-red-800 font-medium italic">{item.summary}</p>
                          )}
                          <div className="whitespace-pre-line leading-relaxed font-medium text-red-950 pt-1">
                            {item.content}
                          </div>
                        </div>
                      );
                    }

                    if (kmsTab === "firmware") {
                      return (
                        <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-black text-slate-900 text-sm">{item.title}</p>
                            <p className="text-[11px] text-slate-400">
                              {item.summary || "File firmware / utilitas teknisi resmi"}
                              {item.fileSize ? ` — Size: ${item.fileSize}` : ""}
                            </p>
                          </div>
                          <a
                            href={item.downloadUrl || "#"}
                            onClick={(e) => {
                              if (!item.downloadUrl || item.downloadUrl === "#") {
                                e.preventDefault();
                                showToast("Memulai unduhan file firmware resmi...");
                              }
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" /> Unduh
                          </a>
                        </div>
                      );
                    }

                    if (kmsTab === "kontak") {
                      return (
                        <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{item.title}</p>
                            <p className="font-black text-slate-900 text-sm">{item.contactName || item.title}</p>
                            <p className="text-slate-600 font-medium text-xs">{item.contactRole || item.summary}</p>
                            <p className="text-[11px] text-dstech-blue font-bold flex items-center gap-1.5 pt-0.5">
                              <PhoneCall className="w-3 h-3" /> {item.contactPhone || "Kontak Kantor DSTech"}
                            </p>
                          </div>
                          {item.contactPhone && (
                            <a
                              href={`https://wa.me/${item.contactPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
                            >
                              <PhoneCall className="w-3.5 h-3.5" /> WhatsApp PIC
                            </a>
                          )}
                        </div>
                      );
                    }

                    if (kmsTab === "troubleshooting") {
                      return (
                        <div key={item.id} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-black text-amber-950 text-sm flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-amber-700 shrink-0" /> {item.title}
                            </h4>
                            <span className="text-[10px] text-amber-700 font-semibold">{item.updatedAt}</span>
                          </div>
                          {item.summary && item.summary !== item.title && (
                            <p className="text-[11px] text-amber-800 font-semibold italic">{item.summary}</p>
                          )}
                          <div className="whitespace-pre-line leading-relaxed font-medium text-amber-900 pt-1">
                            {item.content}
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                Pusat Dokumentasi Resmi PT. DSTech Smart Perkasa ({kmsList.length} Dokumen Aktif)
              </span>
              <button
                onClick={() => setIsKmsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Tutup KMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 11: Laporan Kegiatan Harian Teknisi Langsung ke Proyek & Manajemen (Tugas 135) */}
      {isDailyReportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsDailyReportModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSignature className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Laporan Kegiatan Harian Proyek</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Sinkronisasi langsung ke pengawasan proyek & manajemen PT. DSTech Smart Perkasa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDailyReportModalOpen(false)}
                className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitDailyReport} className="space-y-4">
              {/* Proyek / Tugas Terkait (PT, Toko, atau Non-Project) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pekerjaan / Proyek Terkait:
                </label>
                <select
                  value={dailyReportForm.selectedJobKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith("prj_")) {
                      const prjId = val.replace("prj_", "");
                      const prj = myAssignedProjects.find((p: any) => p.id === prjId);
                      setDailyReportForm((prev) => ({
                        ...prev,
                        selectedJobKey: val,
                        jobType: "PROJECT_PT",
                        projectId: prj?.id || "",
                        projectCode: prj?.projectCode || "",
                        projectName: prj?.projectName || "",
                        taskId: "",
                        ticketNumber: "",
                        taskTitle: prj?.projectName || prev.taskTitle,
                        clientName: prj?.clientName || prev.clientName,
                        location: prj?.clientAddress || "Area Lapangan Proyek PT",
                        statusAfter: prj?.status || "In Progress",
                      }));
                    } else if (val.startsWith("task_")) {
                      const taskId = val.replace("task_", "");
                      const t = myAssignedTasks.find((item: any) => item.id === taskId);
                      setDailyReportForm((prev) => ({
                        ...prev,
                        selectedJobKey: val,
                        jobType: "MAINTENANCE_TOKO",
                        taskId: t?.id || "",
                        ticketNumber: t?.ticketNumber || "",
                        projectId: "",
                        projectCode: "",
                        projectName: "",
                        taskTitle: t?.title || prev.taskTitle,
                        clientName: t?.client || prev.clientName,
                        location: t?.location || prev.location,
                        statusAfter: t?.status || "In Progress",
                      }));
                    } else {
                      // Non-Project / Maintenance Rutin Toko / Internal
                      setDailyReportForm((prev) => ({
                        ...prev,
                        selectedJobKey: "NON_PROJECT",
                        jobType: "NON_PROJECT",
                        taskId: "",
                        ticketNumber: "",
                        projectId: "",
                        projectCode: "",
                        projectName: "",
                        taskTitle: "Kegiatan Rutin Kantor / Standby Internal (Non-Project & Maintenance)",
                        clientName: "PT. DSTech Smart Perkasa (Internal)",
                        location: "Kantor DSTech Cilegon / Workshop",
                        statusAfter: "Completed",
                      }));
                    }
                  }}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="NON_PROJECT">
                    📝 Laporan Kegiatan Harian Umum (Non-Project & Maintenance / Tugas Standby Internal)
                  </option>

                  {myAssignedProjects.length > 0 && (
                    <optgroup label="🏢 Proyek PT (PT. DSTech Smart Perkasa)">
                      {myAssignedProjects.map((p: any) => (
                        <option key={p.id} value={`prj_${p.id}`}>
                          [{p.projectCode}] {p.projectName} — {p.clientName}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {myAssignedTasks.length > 0 && (
                    <optgroup label="🏪 Tiket Pekerjaan Toko / Maintenance">
                      {myAssignedTasks.map((t: any) => (
                        <option key={t.id} value={`task_${t.id}`}>
                          [{t.ticketNumber}] {t.title} — {t.client}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Hanya menampilkan pekerjaan di mana Anda ditugaskan sebagai PIC atau personil tim. Jika tidak ada tugas khusus, pilih opsi Tugas Standby Internal.
                </p>
              </div>

              {/* Tanggal Kegiatan & Jam Pelaporan (Otomatis & Terkunci) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tanggal Kegiatan:</span>
                    </label>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Terkunci
                    </span>
                  </div>
                  <input
                    type="date"
                    value={dailyReportForm.date}
                    readOnly
                    disabled
                    className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-100/90 text-xs font-bold text-slate-600 cursor-not-allowed select-none shadow-inner"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Otomatis hari ini & tidak dapat diubah (Anti-Manipulasi).</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Jam Pelaporan (WIB):</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" /> Real-time
                    </span>
                  </div>
                  <input
                    type="text"
                    value={dailyReportForm.reportTime}
                    readOnly
                    disabled
                    className="w-full p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 text-xs font-black text-emerald-800 cursor-not-allowed select-none shadow-inner"
                    placeholder="09:25 WIB"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Waktu riil sistem saat pelaporan dibuat.</p>
                </div>
              </div>

              {/* Persentase Progres Kerja */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Persentase Progres Kerja:</label>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                    {dailyReportForm.progressPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={dailyReportForm.progressPercentage}
                  onChange={(e) =>
                    setDailyReportForm((prev) => ({ ...prev, progressPercentage: Number(e.target.value) }))
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                />
              </div>

              {/* Status Akhir */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Status Proyek / Tugas Terkini:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDailyReportForm((prev) => ({ ...prev, statusAfter: "In Progress" }))}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                      dailyReportForm.statusAfter === "In Progress"
                        ? "bg-blue-50 border-blue-300 text-blue-800 ring-2 ring-blue-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    🛠️ Masih Berjalan (In Progress)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDailyReportForm((prev) => ({
                        ...prev,
                        statusAfter: "Completed",
                        progressPercentage: 100,
                      }))
                    }
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                      dailyReportForm.statusAfter === "Completed"
                        ? "bg-green-50 border-green-300 text-green-800 ring-2 ring-green-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    ✅ Selesai Total (Completed 100%)
                  </button>
                </div>
              </div>

              {/* Uraian Aktivitas Harian */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Uraian Kegiatan Pekerjaan Hari Ini <span className="text-red-500">*</span>:
                </label>
                <textarea
                  rows={4}
                  value={dailyReportForm.activityDescription}
                  onChange={(e) =>
                    setDailyReportForm((prev) => ({ ...prev, activityDescription: e.target.value }))
                  }
                  placeholder="Jelaskan secara rinci apa saja yang Anda kerjakan hari ini (misal: penarikan kabel 60m, pemasangan bracket kamera 4 titik, terminasi RJ45, pengujian tampilan di monitor)..."
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  required
                />
              </div>

              {/* Kendala & Rencana Besok */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-amber-700 block mb-1">
                    ⚠️ Kendala / Hambatan Lapangan (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    value={dailyReportForm.blockers}
                    onChange={(e) => setDailyReportForm((prev) => ({ ...prev, blockers: e.target.value }))}
                    placeholder="Contoh: Terkendala hujan lebat di area outdoor, izin akses pabrik baru terbit siang..."
                    className="w-full p-3 rounded-xl border border-amber-200 bg-amber-50/50 text-xs text-amber-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-blue-700 block mb-1">
                    📌 Rencana Kerja Esok Hari (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    value={dailyReportForm.nextAction}
                    onChange={(e) => setDailyReportForm((prev) => ({ ...prev, nextAction: e.target.value }))}
                    placeholder="Contoh: Lanjut pemasangan 2 unit kamera indoor, konfigurasi remote access smartphone..."
                    className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50/50 text-xs text-blue-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Info Pelapor */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Pelapor: <strong className="text-slate-800">{currentUser?.name || "Teknisi Lapangan"}</strong></span>
                <span>Role: <strong className="text-slate-800">{currentUser?.role || "Teknisi"}</strong></span>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDailyReportModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDailyReport}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-800 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmittingDailyReport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kirim & Sinkronkan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL & NOTULA RAPAT (Tugas 233 / 110) */}
      {selectedMeetingDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedMeetingDetail(null)}
        >
          <div
            className="bg-white rounded-[32px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-dstech-red font-black text-[10px] uppercase tracking-wider">
                    {selectedMeetingDetail.meetingType === "INTERNAL_STAF"
                      ? "Koordinasi Internal"
                      : selectedMeetingDetail.meetingType === "KONSULTASI_KLIEN"
                      ? "Konsultasi Klien"
                      : "Survey & Bantuan Lapangan"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedMeetingDetail.status === "ACTIVE"
                        ? "bg-red-500 text-white animate-pulse"
                        : selectedMeetingDetail.status === "UPCOMING"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selectedMeetingDetail.status === "ACTIVE"
                      ? "Sedang Live"
                      : selectedMeetingDetail.status === "UPCOMING"
                      ? "Mendatang"
                      : "Selesai"}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    Room: #{selectedMeetingDetail.roomCode}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {selectedMeetingDetail.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Host: <strong>{selectedMeetingDetail.hostName || "Tim DSTech"}</strong></span>
                  <span>•</span>
                  <span>Jadwal: <strong>{selectedMeetingDetail.scheduledAt || "Sesuai Agenda"}</strong></span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMeetingDetail(null)}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Conference Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-0.5">
                  Ruang Virtual DSTech Meet
                </span>
                <p className="text-xs text-slate-300 font-mono break-all">
                  dstechsmart.com/meeting/{selectedMeetingDetail.roomCode}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/meeting/${selectedMeetingDetail.roomCode}`;
                    navigator.clipboard.writeText(url);
                    alert("Tautan video room berhasil disalin!");
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                  title="Salin Tautan Video"
                >
                  Salin Link
                </button>
                <a
                  href={`/meeting/${selectedMeetingDetail.roomCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Buka Video Room</span>
                </a>
              </div>
            </div>

            {/* Notula Content & Pembahasan */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-dstech-red" />
                  Agenda & Ringkasan Pembahasan
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {selectedMeetingDetail.description || "Tidak ada deskripsi agenda khusus."}
                </div>
              </div>

              {/* Poin Keputusan & Notula Rapat */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Poin Hasil Keputusan & Catatan Notula
                </h4>
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-slate-800">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>
                      Seluruh tim teknisi wajib mengonfirmasi ketersediaan alat pelindung diri (APD K3) dan material sebelum keberangkatan ke lokasi proyek.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-800">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>
                      Pelaporan presensi kehadiran di lokasi wajib menggunakan fitur GPS Geofencing radius resmi proyek atau kantor DSTech Smart.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-800">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>
                      Hasil berita acara serah terima (BAST) pekerjaan pemeliharaan wajib diunggah ke formulir penugasan maksimal 1x24 jam setelah selesai.
                    </span>
                  </div>
                </div>
              </div>

              {/* Tindak Lanjut Teknisi Lapangan */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  Tindak Lanjut & Action Items Staf
                </h4>
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80 text-xs text-slate-700 space-y-1.5">
                  <p>• <strong>PIC Lapangan:</strong> Menyerahkan rekapan inventaris alat uji jaringan & CCTV kepada koordinator operasional.</p>
                  <p>• <strong>Tim Support:</strong> Melakukan sinkronisasi firmware terbaru pada gerbang tiket parkir dan access controller.</p>
                  <p>• <strong>Admin Operasional:</strong> Mendokumentasikan rekaman rapat ke arsip internal KMS DSTech.</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `*NOTULA RAPAT DSTECH SMART*\nTopik: ${selectedMeetingDetail.title}\nWaktu: ${selectedMeetingDetail.scheduledAt || "Sesuai Jadwal"}\nHost: ${selectedMeetingDetail.hostName || "Tim DSTech"}\nRoom Video: https://dstechsmart.com/meeting/${selectedMeetingDetail.roomCode}\n\n*Ringkasan:* ${selectedMeetingDetail.description || "-"}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Bagikan ke WhatsApp Tim</span>
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedMeetingDetail(null)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <a
                  href={`/meeting/${selectedMeetingDetail.roomCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Buka Video Room</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: Konfirmasi Logout */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Konfirmasi Keluar Sesi</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Apakah Anda yakin ingin keluar dari Employee Portal PT. DSTech Smart Perkasa?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                id="confirm-logout-btn"
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
