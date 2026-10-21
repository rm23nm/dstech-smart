"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

interface EmployeeTask {
  id: string;
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

interface AttendanceLog {
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
  checkOutLocation?: string | null;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkOutAccuracy?: number | null;
  checkOutMapsUrl?: string | null;
  status: string;
  notes: string;
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

export default function EmployeeDashboard() {
  const router = useRouter();

  // Navigation state
  const [activeTab, setActiveTab] = useState<"tasks" | "inventory" | "attendance">("tasks");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [overtimeLogs, setOvertimeLogs] = useState<OvertimeLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [kmsList, setKmsList] = useState<KmsGuideItem[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalHours: 168,
    overtimeHours: 14,
    targetHours: 160,
    presenceDays: 21,
  });

  // Filter states
  const [taskFilter, setTaskFilter] = useState<string>("Semua");
  const [materialSearch, setMaterialSearch] = useState<string>("");
  const [inventorySubTab, setInventorySubTab] = useState<"stock" | "requests">("stock");

  // Modals state
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [taskStatusForm, setTaskStatusForm] = useState<{
    status: "Pending" | "In Progress" | "Completed";
    report: string;
    photos: TaskPhoto[];
  }>({
    status: "In Progress",
    report: "",
    photos: [],
  });
  const [isUploadingTaskPhoto, setIsUploadingTaskPhoto] = useState<boolean>(false);
  const [taskPhotoCategory, setTaskPhotoCategory] = useState<"documentation" | "part_replacement">("documentation");
  const [taskPhotoCaption, setTaskPhotoCaption] = useState<string>("");

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
    notes: "",
  });

  // Quick Converter Calculator State
  const [calcMaterialId, setCalcMaterialId] = useState<string>("dstech_mat_1");
  const [calcInputQty, setCalcInputQty] = useState<number>(1);
  const [calcDirection, setCalcDirection] = useState<"primary_to_sub" | "sub_to_primary">("primary_to_sub");

  interface GeoCoords {
    lat: number;
    lng: number;
    accuracy?: number;
    source: "gps" | "preset";
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
  const [checkInLocation, setCheckInLocation] = useState<string>("Kantor DSTech Cilegon");
  const [checkInNotes, setCheckInNotes] = useState<string>("");
  const [checkInCoords, setCheckInCoords] = useState<GeoCoords>({
    lat: -6.031846,
    lng: 106.037198,
    accuracy: 10,
    source: "preset",
  });
  const [isDetectingCheckInGps, setIsDetectingCheckInGps] = useState<boolean>(false);
  const [gpsErrorCheckIn, setGpsErrorCheckIn] = useState<string | null>(null);

  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState<boolean>(false);
  const [checkOutLocation, setCheckOutLocation] = useState<string>("Kantor DSTech Cilegon");
  const [checkOutSummary, setCheckOutSummary] = useState<string>("");
  const [checkOutCoords, setCheckOutCoords] = useState<GeoCoords>({
    lat: -6.031846,
    lng: 106.037198,
    accuracy: 10,
    source: "preset",
  });
  const [isDetectingCheckOutGps, setIsDetectingCheckOutGps] = useState<boolean>(false);
  const [gpsErrorCheckOut, setGpsErrorCheckOut] = useState<string | null>(null);

  // Map Preview Modal for attendance history table
  const [previewMapData, setPreviewMapData] = useState<{
    isOpen: boolean;
    title: string;
    locationName: string;
    lat: number;
    lng: number;
    mapsUrl: string;
  } | null>(null);

  const detectGpsLocation = (mode: "checkin" | "checkout") => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      const err = "Browser perangkat tidak mendukung Geolocation GPS.";
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
          showToast(`Sinyal GPS terhubung ke Google Maps! Akurasi: ±${coords.accuracy}m`);
        } else {
          setCheckOutCoords(coords);
          setIsDetectingCheckOutGps(false);
          setCheckOutLocation(`GPS Satelit (${coords.lat}, ${coords.lng})`);
          showToast(`Sinyal GPS Pulang terhubung! Akurasi: ±${coords.accuracy}m`);
        }
      },
      (err) => {
        let errorMsg = "Gagal mengambil titik GPS.";
        if (err.code === 1) {
          errorMsg = "Izin lokasi browser ditolak. Menampilkan peta koordinat kantor DSTech.";
        } else if (err.code === 2) {
          errorMsg = "Posisi GPS tidak ditemukan. Menampilkan peta koordinat kantor DSTech.";
        } else if (err.code === 3) {
          errorMsg = "Waktu deteksi GPS habis. Menampilkan peta koordinat kantor DSTech.";
        }
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
    setIsCheckInModalOpen(true);
    detectGpsLocation("checkin");
  };

  const openCheckOutModal = () => {
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

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [resTasks, resInv, resAtt, resAnn, resKms] = await Promise.all([
          fetch("/api/employee/tasks"),
          fetch("/api/employee/inventory"),
          fetch("/api/employee/attendance"),
          fetch("/api/employee/announcements"),
          fetch("/api/kms"),
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
        }
        if (resAnn.ok) {
          const d = await resAnn.json();
          if (d.data) setAnnouncements(d.data);
        }
        if (resKms && resKms.ok) {
          const d = await resKms.json();
          if (d.data && Array.isArray(d.data)) setKmsList(d.data);
        }
      } catch (err) {
        console.warn("Using offline fallback data for employee portal:", err);
      }
    }
    loadData();
  }, []);

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
              }
            : null
        );
        showToast("Status penugasan & foto dokumentasi berhasil disimpan!");
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

  // Upload photo handler for technicians
  const handleUploadTaskPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingTaskPhoto(true);
      const fd = new FormData();
      fd.append("file", file);
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
          requestedBy: "Ikhsan Maulidi",
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
    try {
      const res = await fetch("/api/employee/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkin",
          employeeName: "Ikhsan Maulidi",
          location: checkInLocation,
          latitude: checkInCoords.lat,
          longitude: checkInCoords.lng,
          accuracy: checkInCoords.accuracy || 10,
          mapsUrl: `https://www.google.com/maps?q=${checkInCoords.lat},${checkInCoords.lng}`,
          notes: checkInNotes,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setAttendanceLogs((prev) => [d.data, ...prev.filter((p) => p.date !== d.data.date)]);
        showToast("Absen Masuk terhubung ke Google Maps! Selamat bekerja.");
        setIsCheckInModalOpen(false);
      }
    } catch {
      showToast("Gagal mencatat presensi");
    }
  };

  // Handler Check-Out
  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/employee/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkout",
          employeeName: "Ikhsan Maulidi",
          location: checkOutLocation,
          latitude: checkOutCoords.lat,
          longitude: checkOutCoords.lng,
          accuracy: checkOutCoords.accuracy || 10,
          mapsUrl: `https://www.google.com/maps?q=${checkOutCoords.lat},${checkOutCoords.lng}`,
          notes: checkOutSummary,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setAttendanceLogs((prev) => [d.data, ...prev.filter((p) => p.date !== d.data.date)]);
        showToast("Absen Pulang terverifikasi Google Maps! Terima kasih.");
        setIsCheckOutModalOpen(false);
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
          employeeName: "Ikhsan Maulidi",
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
          author: "Ikhsan Maulidi (Senior Tech)",
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

  // Today's attendance record
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAttendance = attendanceLogs.find((a) => a.date === todayStr);

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
        </nav>

        {/* Profile Card & Logout */}
        <div className="p-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-dstech-red text-white flex items-center justify-center font-black shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">Ikhsan Maulidi</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teknisi Senior</p>
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
                Halo, Ikhsan Maulidi!
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
                href="https://wa.me/6282259494242?text=Halo%20Team%20Leader,%20saya%20Ikhsan%20ingin%20koordinasi%20lapangan."
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

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedTask(activeTask);
                              setTaskStatusForm({
                                status: activeTask.status,
                                report: activeTask.report || "",
                                photos: activeTask.photos || [],
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Daftar Surat Tugas Kerja</h3>
                        <p className="text-slate-400 text-xs font-medium">
                          Pekerjaan yang ditugaskan kepada Ikhsan Maulidi
                        </p>
                      </div>

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
                            <div className="flex items-center justify-end gap-2 pt-2">
                              <button
                                onClick={() => setSelectedTask(task)}
                                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                              >
                                Detail Tugas
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setTaskStatusForm({
                                    status: task.status,
                                    report: task.report || "",
                                    photos: task.photos || [],
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
                              <td className="p-3 text-green-600 font-black">{att.checkIn}</td>
                              <td className="p-3 text-slate-700 font-bold">{att.checkOut}</td>
                              <td className="p-3 text-slate-600">
                                <div className="space-y-1">
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

              {selectedTask.report && (
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Laporan Kerja Terakhir:</p>
                  <p className="mt-1 p-3 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200">
                    {selectedTask.report}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setTaskStatusForm({
                    status: selectedTask.status,
                    report: selectedTask.report || "",
                    photos: selectedTask.photos || [],
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
                <div className="flex items-center gap-2 text-amber-800 font-medium bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{gpsErrorCheckIn}</span>
                </div>
              ) : (
                <p className="text-slate-500 text-[11px]">
                  Koordinat default dipilih dari lokasi kantor / proyek. Klik tombol &quot;Deteksi Ulang GPS&quot; untuk mengunci posisi riil Anda via satelit.
                </p>
              )}
            </div>

            <form onSubmit={handleCheckIn} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Titik Lokasi Presensi:</label>
                <select
                  value={checkInLocation}
                  onChange={(e) => handleLocationPresetChange(e.target.value, "checkin")}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="Kantor DSTech Cilegon">Kantor DSTech Smart Perkasa (Cilegon Banten)</option>
                  <option value="Kawasan Industri Krakatau Posco">Lokasi Proyek: PT. Krakatau Posco</option>
                  <option value="RS Kurnia Cilegon">Lokasi Proyek: RS Kurnia Cilegon</option>
                  <option value="Perumahan Metro Royal">Lokasi Proyek: Metro Royal Cilegon</option>
                  <option value="Hotel Pesona Merak">Lokasi Proyek: Hotel Pesona Merak</option>
                  <option value="Area Lapangan / Dinas Luar">Area Lapangan Lainnya (Dinas Luar)</option>
                  {checkInCoords.source === "gps" && (
                    <option value={checkInLocation}>{checkInLocation}</option>
                  )}
                </select>
              </div>

              {/* Google Maps Live Embed */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-dstech-red" />
                    Pratinjau Posisi Google Maps:
                  </span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    {checkInCoords.lat.toFixed(5)}, {checkInCoords.lng.toFixed(5)}
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100">
                  <iframe
                    src={`https://maps.google.com/maps?q=${checkInCoords.lat},${checkInCoords.lng}&hl=id&z=16&output=embed`}
                    className="w-full h-44 border-0"
                    loading="lazy"
                    title="Google Maps Check-In Preview"
                  />
                </div>

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
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Lapangan (Opsional):</label>
                <input
                  type="text"
                  placeholder="Contoh: Langsung menuju lokasi pabrik untuk penarikan kabel"
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-checkin"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Check-In Sekarang
                </button>
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
                <div className="flex items-center gap-2 text-amber-800 font-medium bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{gpsErrorCheckOut}</span>
                </div>
              ) : (
                <p className="text-slate-500 text-[11px]">
                  Titik lokasi pulang dapat disesuaikan otomatis dengan GPS satelit atau preset lokasi kantor.
                </p>
              )}
            </div>

            <form onSubmit={handleCheckOut} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Titik Lokasi Selesai Kerja:</label>
                <select
                  value={checkOutLocation}
                  onChange={(e) => handleLocationPresetChange(e.target.value, "checkout")}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="Kantor DSTech Cilegon">Kantor DSTech Smart Perkasa (Cilegon Banten)</option>
                  <option value="Kawasan Industri Krakatau Posco">Lokasi Proyek: PT. Krakatau Posco</option>
                  <option value="RS Kurnia Cilegon">Lokasi Proyek: RS Kurnia Cilegon</option>
                  <option value="Perumahan Metro Royal">Lokasi Proyek: Metro Royal Cilegon</option>
                  <option value="Hotel Pesona Merak">Lokasi Proyek: Hotel Pesona Merak</option>
                  <option value="Area Lapangan / Dinas Luar">Area Lapangan Lainnya (Dinas Luar)</option>
                  {checkOutCoords.source === "gps" && (
                    <option value={checkOutLocation}>{checkOutLocation}</option>
                  )}
                </select>
              </div>

              {/* Google Maps Live Embed */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-dstech-red" />
                    Pratinjau Posisi Google Maps:
                  </span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    {checkOutCoords.lat.toFixed(5)}, {checkOutCoords.lng.toFixed(5)}
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100">
                  <iframe
                    src={`https://maps.google.com/maps?q=${checkOutCoords.lat},${checkOutCoords.lng}&hl=id&z=16&output=embed`}
                    className="w-full h-44 border-0"
                    loading="lazy"
                    title="Google Maps Check-Out Preview"
                  />
                </div>

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
              </div>

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
                  onClick={() => setIsCheckOutModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-checkout"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan & Check-Out Pulang
                </button>
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

      {/* MODAL 6: Ajukan Lembur */}
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
