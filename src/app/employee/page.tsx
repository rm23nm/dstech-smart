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
}

interface MaterialRequestItem {
  materialId: string;
  materialName: string;
  qty: number;
  unit: string;
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
  const [taskStatusForm, setTaskStatusForm] = useState<{ status: "Pending" | "In Progress" | "Completed"; report: string }>({
    status: "In Progress",
    report: "",
  });

  interface FormRequestItem {
    materialId: string;
    materialName: string;
    qty: number;
    unit: string;
    maxStock: number;
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
      },
    ],
    taskTitle: "",
    notes: "",
  });

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState<boolean>(false);
  const [checkInLocation, setCheckInLocation] = useState<string>("Kantor DSTech Cilegon");
  const [checkInNotes, setCheckInNotes] = useState<string>("");

  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState<boolean>(false);
  const [checkOutSummary, setCheckOutSummary] = useState<string>("");

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
  const [kmsTab, setKmsTab] = useState<"sop" | "k3" | "firmware" | "kontak">("sop");

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
        const [resTasks, resInv, resAtt, resAnn] = await Promise.all([
          fetch("/api/employee/tasks"),
          fetch("/api/employee/inventory"),
          fetch("/api/employee/attendance"),
          fetch("/api/employee/announcements"),
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
      } catch (err) {
        console.warn("Using offline fallback data for employee portal:", err);
      }
    }
    loadData();
  }, []);

  // Handler update task status
  const handleUpdateTaskStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      const res = await fetch("/api/employee/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTask.id,
          status: taskStatusForm.status,
          report: taskStatusForm.report,
        }),
      });

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === selectedTask.id
              ? { ...t, status: taskStatusForm.status, report: taskStatusForm.report }
              : t
          )
        );
        showToast("Status penugasan & laporan kerja berhasil disimpan!");
        setIsStatusModalOpen(false);
      } else {
        showToast("Gagal menyimpan update tugas");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    }
  };

  // Multi-item material request helpers
  const handleAddRequestItem = () => {
    const selectedIds = requestForm.items.map((i) => i.materialId).filter(Boolean);
    const availableMat = materials.find((m) => !selectedIds.includes(m.id) && m.stock > 0) || materials[0];

    setRequestForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          materialId: availableMat?.id || "",
          materialName: availableMat?.name || "",
          qty: 1,
          unit: availableMat?.unit || "Pcs",
          maxStock: availableMat?.stock || 999,
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
      updated[index] = {
        materialId: mat.id,
        materialName: mat.name,
        qty: 1,
        unit: mat.unit,
        maxStock: mat.stock,
      };
      return { ...prev, items: updated };
    });
  };

  const handleItemQtyChange = (index: number, qtyVal: number) => {
    setRequestForm((prev) => {
      const updated = [...prev.items];
      const safeQty = Math.max(1, qtyVal);
      updated[index] = {
        ...updated[index],
        qty: safeQty,
      };
      return { ...prev, items: updated };
    });
  };

  // Handler submit material request (Multi-Item)
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

    // Validasi stok gudang
    for (const item of requestForm.items) {
      const mat = materials.find((m) => m.id === item.materialId);
      if (mat && mat.stock <= 0) {
        showToast(`Stok untuk "${item.materialName}" sedang habis di gudang!`);
        return;
      }
      if (mat && item.qty > mat.stock) {
        showToast(
          `Jumlah untuk "${item.materialName}" (${item.qty} ${item.unit}) melebihi sisa stok gudang (${mat.stock} ${mat.unit})!`
        );
        return;
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
            unit: it.unit,
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
        setRequestForm({
          items: [
            {
              materialId: firstMat?.id || "",
              materialName: firstMat?.name || "",
              qty: 1,
              unit: firstMat?.unit || "Pcs",
              maxStock: firstMat?.stock || 999,
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
          notes: checkInNotes,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setAttendanceLogs((prev) => [d.data, ...prev.filter((p) => p.date !== d.data.date)]);
        showToast("Absen Masuk berhasil dicatat! Selamat bekerja.");
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
          notes: checkOutSummary,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setAttendanceLogs((prev) => [d.data, ...prev.filter((p) => p.date !== d.data.date)]);
        showToast("Absen Pulang berhasil dicatat! Terima kasih atas dedikasi Anda.");
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
                              setTaskStatusForm({ status: activeTask.status, report: activeTask.report || "" });
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
                                  setTaskStatusForm({ status: task.status, report: task.report || "" });
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
                          setRequestForm({
                            items: [
                              {
                                materialId: firstMat?.id || "",
                                materialName: firstMat?.name || "",
                                qty: 1,
                                unit: firstMat?.unit || "Pcs",
                                maxStock: firstMat?.stock || 999,
                              },
                            ],
                            taskTitle: tasks[0] ? `${tasks[0].title} - ${tasks[0].client}` : "",
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
                      <div className="space-y-4">
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
                                <th className="p-3">Sisa Stok</th>
                                <th className="p-3">Lokasi Gudang</th>
                                <th className="p-3 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredMaterials.map((mat) => (
                                <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3 font-bold text-slate-900">
                                    <p>{mat.name}</p>
                                    <p className="text-[10px] text-slate-400 font-normal">{mat.description}</p>
                                  </td>
                                  <td className="p-3 text-slate-600">{mat.category}</td>
                                  <td className="p-3">
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
                                  </td>
                                  <td className="p-3 text-slate-500 font-medium">{mat.location}</td>
                                  <td className="p-3 text-right">
                                    <button
                                      onClick={() => {
                                        setRequestForm({
                                          items: [
                                            {
                                              materialId: mat.id,
                                              materialName: mat.name,
                                              qty: 1,
                                              unit: mat.unit,
                                              maxStock: mat.stock,
                                            },
                                          ],
                                          taskTitle: tasks[0] ? `${tasks[0].title} - ${tasks[0].client}` : "",
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
                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                          <span className="w-1.5 h-1.5 rounded-full bg-dstech-blue shrink-0"></span>
                                          <span className="font-bold text-slate-900">{it.materialName}</span>
                                          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-extrabold text-[10px] text-slate-700 whitespace-nowrap">
                                            {it.qty} {it.unit}
                                          </span>
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
                          onClick={() => setIsCheckInModalOpen(true)}
                          className="px-5 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                        >
                          Check-In (Masuk)
                        </button>
                        <button
                          onClick={() => setIsCheckOutModalOpen(true)}
                          className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                        >
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
                        <p className="text-sm font-black text-slate-900">
                          {todayAttendance?.checkIn
                            ? `Jam Masuk: ${todayAttendance.checkIn} — Lokasi: ${todayAttendance.location}`
                            : "Anda belum mencatat Absen Masuk hari ini"}
                        </p>
                        {todayAttendance?.checkOut && todayAttendance.checkOut !== "-" && (
                          <p className="text-xs font-bold text-slate-500">
                            Jam Pulang: {todayAttendance.checkOut}
                          </p>
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
                              <td className="p-3 text-slate-600">{att.location}</td>
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
                  setTaskStatusForm({ status: selectedTask.status, report: selectedTask.report || "" });
                  setIsStatusModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-dstech-blue text-white font-bold text-xs hover:bg-blue-700 shadow-sm"
              >
                Update Status Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Form Update Status & Laporan */}
      {isStatusModalOpen && selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsStatusModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-dstech-blue">
                  Formulir Progres Lapangan
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Update Status Kerja</h3>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTaskStatus} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Progres:</label>
                <select
                  value={taskStatusForm.status}
                  onChange={(e) =>
                    setTaskStatusForm({
                      ...taskStatusForm,
                      status: e.target.value as "Pending" | "In Progress" | "Completed",
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                >
                  <option value="Pending">Pending / Menunggu Jadwal</option>
                  <option value="In Progress">In Progress (Sedang Dikerjakan)</option>
                  <option value="Completed">Completed (Selesai 100%)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Catatan Progres Lapangan & Kendala (Opsional):
                </label>
                <textarea
                  rows={4}
                  value={taskStatusForm.report}
                  onChange={(e) => setTaskStatusForm({ ...taskStatusForm, report: e.target.value })}
                  placeholder="Contoh: Penarikan kabel selesai, konektor sudah dicrimping, tinggal tunggu power supply dari klien..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dstech-blue text-white font-bold text-xs hover:bg-blue-700 shadow-md"
                >
                  Simpan Laporan
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
                            {m.name} [Stok: {m.stock} {m.unit}] - {m.location} {m.stock <= 0 ? "(HABIS)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Jumlah Diambil (Qty):</label>
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
                          <span className="px-3 py-2.5 rounded-xl bg-slate-200 font-bold text-slate-700 text-xs shrink-0">
                            {item.unit || "Pcs"}
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
                          <span>Stok Gudang:</span>
                          <span className="font-black">
                            {item.maxStock} {item.unit}
                          </span>
                        </div>
                      </div>
                    </div>
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
                  <label className="font-bold text-slate-700 block mb-1">Terkait Proyek / Surat Tugas:</label>
                  <select
                    value={requestForm.taskTitle}
                    onChange={(e) => setRequestForm({ ...requestForm, taskTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-dstech-red focus:outline-none text-xs"
                  >
                    <option value="">Pilih Proyek Lapangan Terkait</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={`${t.title} - ${t.client}`}>
                        {t.title} ({t.client})
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
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-600">
                  Presensi Masuk Harian
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Konfirmasi Check-In</h3>
              </div>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lokasi Presensi Anda Hari Ini:</label>
                <select
                  value={checkInLocation}
                  onChange={(e) => setCheckInLocation(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="Kantor DSTech Cilegon">Kantor DSTech Smart Perkasa (Cilegon)</option>
                  <option value="Kawasan Industri Krakatau Posco">Lokasi Proyek: PT. Krakatau Posco</option>
                  <option value="RS Kurnia Cilegon">Lokasi Proyek: RS Kurnia Cilegon</option>
                  <option value="Perumahan Metro Royal">Lokasi Proyek: Metro Royal Cilegon</option>
                  <option value="Hotel Pesona Merak">Lokasi Proyek: Hotel Pesona Merak</option>
                  <option value="Area Lapangan / Dinas Luar">Area Lapangan Lainnya (Dinas Luar)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Singkat (Opsional):</label>
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
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-md"
                >
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
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Presensi Pulang Harian
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Konfirmasi Check-Out</h3>
              </div>
              <button
                onClick={() => setIsCheckOutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckOut} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Rangkuman Kerja Hari Ini (Daily Summary):
                </label>
                <textarea
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
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-md"
                >
                  Simpan & Check-Out Pulang
                </button>
              </div>
            </form>
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
                <label className="font-bold text-slate-700 block mb-1">Terkait Penugasan / Proyek:</label>
                <select
                  value={overtimeForm.taskTitle}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, taskTitle: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="">Pilih Proyek Terkait</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={`${t.title} - ${t.client}`}>
                      {t.title} ({t.client})
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
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  kmsTab === "sop" ? "bg-dstech-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                SOP Instalasi Lapangan
              </button>
              <button
                onClick={() => setKmsTab("k3")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  kmsTab === "k3" ? "bg-dstech-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Standar K3 Teknisi
              </button>
              <button
                onClick={() => setKmsTab("firmware")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  kmsTab === "firmware" ? "bg-dstech-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Firmware DVR / NVR
              </button>
              <button
                onClick={() => setKmsTab("kontak")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  kmsTab === "kontak" ? "bg-dstech-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Kontak PIC Lapangan
              </button>
            </div>

            {/* KMS Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs leading-relaxed text-slate-600">
              {kmsTab === "sop" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-dstech-blue" /> SOP-DST-01: Standar Pemasangan IP Camera
                    </h4>
                    <p>
                      1. Pastikan jalur penarikan kabel UTP di luar gedung (outdoor) wajib dimasukkan dalam pipa konduit PVC/galvanis 20mm untuk menghindari paparan panas langsung dan gigitan hama.
                    </p>
                    <p>
                      2. Gunakan urutan susunan pin kabel standar <strong>TIA/EIA 568B</strong> (Putih Orange, Orange, Putih Hijau, Biru, Putih Biru, Hijau, Putih Coklat, Coklat).
                    </p>
                    <p>
                      3. Berikan waterproof junction box di setiap pangkal bracket kamera untuk melindungi sambungan jack DC dan konektor RJ45 dari air hujan.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-dstech-blue" /> SOP-DST-02: Konfigurasi Subnetting & Port Forwarding
                    </h4>
                    <p>
                      - Alokasi IP Kamera DSTech: Segment <code>192.168.10.x</code> atau VLAN khusus security.
                    </p>
                    <p>
                      - Hindari pemakaian IP default pabrik (192.168.1.64) untuk keamanan cyber klien.
                    </p>
                    <p>
                      - Wajib mengaktifkan HTTPS dan enkripsi password kompleks minimal 8 karakter kombinasi huruf besar, angka, dan simbol.
                    </p>
                  </div>
                </div>
              )}

              {kmsTab === "k3" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-2">
                    <h4 className="font-black text-red-900 text-sm flex items-center gap-2">
                      <HardHat className="w-5 h-5 text-red-600" /> Pedoman Keselamatan Kerja Area Industri (K3)
                    </h4>
                    <p>
                      1. <strong>Alat Pelindung Diri (APD) Wajib:</strong> Safety Helmet dengan tali dagu, Safety Shoes dengan steel toe, Rompi reflektor high-visibility, dan Kacamata safety saat pemboran.
                    </p>
                    <p>
                      2. <strong>Bekerja di Ketinggian &gt; 1.8 Meter:</strong> Wajib mengenakan Full Body Harness dengan shock absorber dan dikaitkan pada lifeline/struktur kokoh.
                    </p>
                    <p>
                      3. Dilarang menggunakan tangga bambu atau tangga tanpa karet anti-slip di area pabrik dan lantai licin.
                    </p>
                  </div>
                </div>
              )}

              {kmsTab === "firmware" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 text-sm">Firmware Hikvision NVR DS-7608NI-K2</p>
                      <p className="text-[11px] text-slate-400">Versi v4.61.025 (Build 2026) — Size: 48 MB</p>
                    </div>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        showToast("Memulai unduhan file firmware resmi...");
                      }}
                      className="px-4 py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 text-sm">Firmware Dahua XVR 5108HS-4KL-I3</p>
                      <p className="text-[11px] text-slate-400">Versi v4.001 (Build 2026) — Size: 52 MB</p>
                    </div>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        showToast("Memulai unduhan file firmware Dahua...");
                      }}
                      className="px-4 py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh
                    </a>
                  </div>
                </div>
              )}

              {kmsTab === "kontak" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="font-black text-slate-900 text-sm">Supervisor Operasional Lapangan</p>
                    <p className="text-slate-600 font-bold">Ahmad Rizky Pratama</p>
                    <p className="text-[11px] text-slate-400">WhatsApp / Telepon: +62 822-5949-4242</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="font-black text-slate-900 text-sm">Technical Support Lead DSTech</p>
                    <p className="text-slate-600 font-bold">Rahmat Hidayat, S.T.</p>
                    <p className="text-[11px] text-slate-400">Email: support@dstechsmart.com</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                Pusat Dokumentasi Resmi PT. DSTech Smart Perkasa
              </span>
              <button
                onClick={() => setIsKmsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
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
