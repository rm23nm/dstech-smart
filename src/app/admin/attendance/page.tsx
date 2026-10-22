"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  status: string;
  notes?: string;
  checkOutLocation?: string;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkOutAccuracy?: number | null;
  checkOutMapsUrl?: string | null;
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

export default function AdminAttendancePage() {
  // Data states
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [overtimeList, setOvertimeList] = useState<OvertimeRecord[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalHours: 168,
    overtimeHours: 14,
    targetHours: 160,
    presenceDays: 22,
    absentDays: 0,
  });
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<"attendance" | "overtime" | "summary">("attendance");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

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
  }>({
    isOpen: false,
    title: "",
    employeeName: "",
    timeStr: "",
    locationName: "",
    lat: null,
    lng: null,
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

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    type: "attendance" | "overtime";
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

  // Load initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAtt, resUsers] = await Promise.all([
        fetch("/api/employee/attendance"),
        fetch("/api/users"),
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
    } catch (err) {
      console.error("Gagal memuat data presensi:", err);
      setToastMsg({ type: "error", text: "Gagal terhubung ke server absensi" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Distinct list of employees from attendance + system users
  const employeeOptions = useMemo(() => {
    const names = new Set<string>();
    attendanceList.forEach((a) => {
      if (a.employeeName) names.add(a.employeeName.trim());
    });
    usersList.forEach((u) => {
      if (u.role === "EMPLOYEE" || u.role === "ADMIN") {
        names.add(u.name.trim());
      }
    });
    return Array.from(names).sort();
  }, [attendanceList, usersList]);

  // Filtered attendance list
  const filteredAttendance = useMemo(() => {
    return attendanceList.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.employeeName?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q) || item.checkOutLocation?.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        const matchStatus = item.status?.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchNotes && !matchStatus) return false;
      }
      // Employee filter
      if (filterEmployee !== "ALL" && item.employeeName !== filterEmployee) {
        return false;
      }
      // Status filter
      if (filterStatus !== "ALL" && item.status !== filterStatus) {
        return false;
      }
      // Month filter (YYYY-MM)
      if (filterMonth && filterMonth !== "ALL") {
        if (!item.date || !item.date.startsWith(filterMonth)) return false;
      }
      return true;
    });
  }, [attendanceList, searchQuery, filterEmployee, filterStatus, filterMonth]);

  // Overtime filter
  const pendingOvertimeCount = useMemo(() => {
    return overtimeList.filter((o) => o.status === "Menunggu Persetujuan").length;
  }, [overtimeList]);

  // Handle Save Attendance Form (Add or Edit)
  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModal.employeeName || !formModal.date) {
      setToastMsg({ type: "error", text: "Nama karyawan dan tanggal wajib diisi" });
      return;
    }

    setSubmitting(true);
    try {
      if (formModal.isEdit && formModal.id) {
        // Edit via PUT
        const res = await fetch("/api/employee/attendance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_attendance",
            id: formModal.id,
            employeeName: formModal.employeeName,
            date: formModal.date,
            checkIn: formModal.checkIn,
            checkOut: formModal.checkOut,
            location: formModal.location,
            status: formModal.status,
            notes: formModal.notes,
            latitude: formModal.latitude ? parseFloat(formModal.latitude) : null,
            longitude: formModal.longitude ? parseFloat(formModal.longitude) : null,
          }),
        });
        const resJson = await res.json();
        if (resJson.success) {
          setToastMsg({ type: "success", text: "Data absensi berhasil diperbarui" });
          setFormModal((prev) => ({ ...prev, isOpen: false }));
          fetchData();
        } else {
          setToastMsg({ type: "error", text: resJson.error || "Gagal memperbarui data" });
        }
      } else {
        // Add via POST
        const res = await fetch("/api/employee/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "admin_add",
            employeeName: formModal.employeeName,
            date: formModal.date,
            checkIn: formModal.checkIn,
            checkOut: formModal.checkOut,
            location: formModal.location,
            status: formModal.status,
            notes: formModal.notes,
            latitude: formModal.latitude ? parseFloat(formModal.latitude) : null,
            longitude: formModal.longitude ? parseFloat(formModal.longitude) : null,
          }),
        });
        const resJson = await res.json();
        if (resJson.success) {
          setToastMsg({ type: "success", text: "Data absensi manual berhasil dicatat" });
          setFormModal((prev) => ({ ...prev, isOpen: false }));
          fetchData();
        } else {
          setToastMsg({ type: "error", text: resJson.error || "Gagal mencatat data" });
        }
      }
    } catch (err) {
      console.error("Error saving attendance:", err);
      setToastMsg({ type: "error", text: "Terjadi kesalahan saat menyimpan data" });
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (record: AttendanceRecord) => {
    setFormModal({
      isOpen: true,
      isEdit: true,
      id: record.id,
      employeeName: record.employeeName,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut === "-" ? "" : record.checkOut,
      location: record.location,
      status: record.status,
      notes: record.notes || "",
      latitude: record.latitude ? String(record.latitude) : "",
      longitude: record.longitude ? String(record.longitude) : "",
    });
  };

  // Handle Overtime Decision (Approve or Reject)
  const handleOvertimeDecision = async () => {
    if (!overtimeModal.record) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/employee/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: overtimeModal.actionType === "approve" ? "approve_overtime" : "reject_overtime",
          id: overtimeModal.record.id,
          rejectionReason: overtimeModal.rejectionReason,
          reviewedBy: "Super Admin DSTech",
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setToastMsg({
          type: "success",
          text: overtimeModal.actionType === "approve" ? "Pengajuan lembur disetujui" : "Pengajuan lembur ditolak",
        });
        setOvertimeModal({ isOpen: false, record: null, actionType: "approve", rejectionReason: "" });
        fetchData();
      } else {
        setToastMsg({ type: "error", text: resJson.error || "Gagal memproses lembur" });
      }
    } catch (err) {
      console.error("Error processing overtime:", err);
      setToastMsg({ type: "error", text: "Gagal memproses permintaan" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/employee/attendance?id=${deleteModal.id}`, {
        method: "DELETE",
      });
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
      case "Terlambat":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            Terlambat
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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black tracking-wider uppercase mb-3 border border-blue-400/20">
              <CalendarCheck className="w-3.5 h-3.5 text-blue-400" />
              Sistem Disiplin & Presensi Staf
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Rekapitulasi Absensi & Lembur Karyawan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Monitoring riwayat absensi masuk/pulang staf operasional & teknisi lapangan, verifikasi titik lokasi GPS Google Maps satelit, dan otorisasi pengajuan jam lembur resmi PT. DSTech Smart Perkasa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs sm:text-sm font-bold backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-blue-300" />
              <span>Cetak Rekap A4</span>
            </button>

            <button
              onClick={() => {
                setFormModal({
                  isOpen: true,
                  isEdit: false,
                  employeeName: employeeOptions[0] || "Teknisi Lapangan",
                  date: new Date().toISOString().split("T")[0],
                  checkIn: "08:00 WIB",
                  checkOut: "17:00 WIB",
                  location: "Kantor DSTech Smart Perkasa (Cilegon)",
                  status: "Tepat Waktu",
                  notes: "Input absensi manual oleh Super Admin",
                  latitude: "",
                  longitude: "",
                });
              }}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Absensi Manual</span>
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
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Kehadiran</p>
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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hadir Lapangan / Proyek</p>
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

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tepat Waktu Kantor</p>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
              {filteredAttendance.filter((a) => a.status === "Tepat Waktu").length}{" "}
              <span className="text-xs font-bold text-slate-400">Hari</span>
            </h3>
            <p className="text-[11px] text-indigo-600 mt-1 flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              Disiplin Sesuai Jam Kerja
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Clock className="w-6 h-6" />
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
              <span>Klik untuk periksa pengajuan</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-4 text-sm font-bold flex items-center gap-2.5 transition-all relative ${
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
          className={`pb-4 text-sm font-bold flex items-center gap-2.5 transition-all relative ${
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
          onClick={() => setActiveTab("summary")}
          className={`pb-4 text-sm font-bold flex items-center gap-2.5 transition-all relative ${
            activeTab === "summary"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Rekap Disiplin Staf</span>
        </button>
      </div>

      {/* TAB 1: RIWAYAT ABSENSI */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Box */}
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

            {/* Select Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Employee Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 hidden sm:inline">Staf:</span>
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
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 hidden sm:inline">Status:</span>
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
              </div>

              {/* Month Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 hidden sm:inline">Bulan:</span>
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                />
              </div>

              {(searchQuery || filterEmployee !== "ALL" || filterStatus !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterEmployee("ALL");
                    setFilterStatus("ALL");
                  }}
                  className="p-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Reset Filter"
                >
                  Reset
                </button>
              )}
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
                    <th className="py-4 px-6">Laporan & Catatan Lapangan</th>
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
                        <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau pilih bulan lain</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Tanggal */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{item.date}</p>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {new Date(item.date).toLocaleDateString("id-ID", { weekday: "long" })}
                          </span>
                        </td>

                        {/* Nama Karyawan */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                              {item.employeeName?.charAt(0) || "T"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.employeeName}</p>
                              <span className="text-[10px] text-slate-400">Teknisi / Staf</span>
                            </div>
                          </div>
                        </td>

                        {/* Check-In */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <p className="font-extrabold text-emerald-600 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                              {item.checkIn || "-"}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{item.location || "Kantor DSTech Cilegon"}</span>
                            </p>
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
                                  })
                                }
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-blue-50/80 px-2 py-0.5 rounded-md"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>Peta GPS ({item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)})</span>
                              </button>
                            ) : null}
                          </div>
                        </td>

                        {/* Check-Out */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <p className={`font-extrabold flex items-center gap-1.5 ${item.checkOut && item.checkOut !== "-" ? "text-slate-800" : "text-slate-400"}`}>
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {item.checkOut || "-"}
                            </p>
                            {item.checkOutLocation && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[180px]">{item.checkOutLocation}</span>
                              </p>
                            )}
                            {item.checkOutLat && item.checkOutLng ? (
                              <button
                                onClick={() =>
                                  setGpsModal({
                                    isOpen: true,
                                    title: "Titik Lokasi Check-Out Pulang",
                                    employeeName: item.employeeName,
                                    timeStr: `${item.date} • ${item.checkOut}`,
                                    locationName: item.checkOutLocation || item.location,
                                    lat: item.checkOutLat || null,
                                    lng: item.checkOutLng || null,
                                    accuracy: item.checkOutAccuracy,
                                    mapsUrl: item.checkOutMapsUrl,
                                  })
                                }
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer bg-indigo-50/80 px-2 py-0.5 rounded-md"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>Peta Pulang</span>
                              </button>
                            ) : null}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {renderStatusBadge(item.status)}
                        </td>

                        {/* Catatan */}
                        <td className="py-4 px-6 max-w-xs">
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {item.notes || <span className="text-slate-300 italic">-</span>}
                          </p>
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {item.latitude && item.longitude && (
                              <button
                                onClick={() =>
                                  setGpsModal({
                                    isOpen: true,
                                    title: "Koordinat Presensi Google Maps",
                                    employeeName: item.employeeName,
                                    timeStr: `${item.date} • ${item.checkIn}`,
                                    locationName: item.location,
                                    lat: item.latitude || null,
                                    lng: item.longitude || null,
                                    accuracy: item.accuracy,
                                    mapsUrl: item.mapsUrl,
                                  })
                                }
                                title="Lihat Peta Satelit"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEdit(item)}
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

            {/* Pagination / Summary Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-bold gap-2">
              <span>Menampilkan {filteredAttendance.length} catatan presensi</span>
              <span className="text-[11px] text-slate-400">Data terhubung aman dengan Google Maps Geolocation & Prefix dstech_</span>
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
                Tinjau pengajuan kerja lembur teknisi dan berikan persetujuan untuk perhitungan gaji/insentif lembur bulanan.
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
                const isRejected = ot.status === "Ditolak";

                return (
                  <div
                    key={ot.id}
                    className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition-all ${
                      isPending ? "border-amber-300 ring-2 ring-amber-300/30" : "border-slate-200"
                    }`}
                  >
                    <div>
                      {/* Top Header Card */}
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

                      {/* Employee Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                          {ot.employeeName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{ot.employeeName}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Teknisi Lapangan</p>
                        </div>
                      </div>

                      {/* Detail Lembur */}
                      <div className="space-y-2 bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-bold">Waktu Lembur:</span>
                          <span className="font-extrabold text-slate-900">
                            {ot.startTime} - {ot.endTime} ({ot.hours} Jam)
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-slate-400 font-bold block mb-1">Terkait Penugasan:</span>
                          <span className="font-bold text-slate-800 line-clamp-1">
                            {ot.taskTitle || "Tugas Lapangan"}
                          </span>
                        </div>
                        <div className="text-xs pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400 font-bold block mb-1">Alasan / Rincian:</span>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {ot.reason || "-"}
                          </p>
                        </div>
                        {ot.reviewedBy && (
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                            <span>Direview oleh: {ot.reviewedBy}</span>
                          </div>
                        )}
                        {ot.rejectionReason && (
                          <div className="text-[10px] text-rose-600 pt-1">
                            <span>Alasan Penolakan: {ot.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
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
                                rejectionReason: "Tidak sesuai SOP penugasan lembur",
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

      {/* TAB 3: REKAP DISIPLIN STAF */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Rekapitulasi Kehadiran & Jam Lembur Per Karyawan
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Akumulasi hari kerja, rasio presensi tepat waktu, presensi lapangan, dan akumulasi jam lembur periode {filterMonth || "Semua"}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employeeOptions.map((name) => {
                const logs = attendanceList.filter((a) => a.employeeName === name);
                const hadirCount = logs.length;
                const tepatWaktuCount = logs.filter((a) => a.status === "Tepat Waktu").length;
                const lapanganCount = logs.filter((a) => a.status === "Hadir Lapangan").length;
                const otLogs = overtimeList.filter((o) => o.employeeName === name && o.status === "Disetujui");
                const totalOTHours = otLogs.reduce((acc, curr) => acc + (curr.hours || 0), 0);

                return (
                  <div key={name} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{name}</h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Staf Operasional</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                        <span className="text-slate-400 text-[10px] font-bold block uppercase">Total Masuk</span>
                        <span className="text-base font-black text-slate-900">{hadirCount} Hari</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                        <span className="text-slate-400 text-[10px] font-bold block uppercase">Jam Lembur Sah</span>
                        <span className="text-base font-black text-amber-600">{totalOTHours} Jam</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                      <div className="flex justify-between">
                        <span>Hadir Lapangan (GPS):</span>
                        <span className="font-bold text-blue-600">{lapanganCount}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tepat Waktu (Kantor):</span>
                        <span className="font-bold text-emerald-600">{tepatWaktuCount}x</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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

            {/* Embed Maps iframe */}
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

            {/* GPS Metadata */}
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
              {gpsModal.accuracy && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Estimasi Akurasi Sinyal GPS:</span>
                  <span className="text-emerald-700 font-bold">± {gpsModal.accuracy} meter</span>
                </div>
              )}
            </div>

            {/* Actions */}
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

      {/* MODAL 2: INPUT / EDIT ABSENSI MANUAL */}
      {formModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !submitting && setFormModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {formModal.isEdit ? "Koreksi / Edit Data Absensi" : "Input Presensi Manual Admin"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Catat presensi masuk/pulang, izin, sakit, dinas luar, atau koreksi kehadiran teknisi.
                </p>
              </div>
              <button
                onClick={() => setFormModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Karyawan / Teknisi *</label>
                <input
                  type="text"
                  required
                  list="employee-suggestions"
                  value={formModal.employeeName}
                  onChange={(e) => setFormModal((prev) => ({ ...prev, employeeName: e.target.value }))}
                  placeholder="Ketik atau pilih nama karyawan..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                />
                <datalist id="employee-suggestions">
                  {employeeOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Presensi *</label>
                  <input
                    type="date"
                    required
                    value={formModal.date}
                    onChange={(e) => setFormModal((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Kehadiran</label>
                  <select
                    value={formModal.status}
                    onChange={(e) => setFormModal((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700"
                  >
                    <option value="Tepat Waktu">Tepat Waktu (Kantor)</option>
                    <option value="Hadir Lapangan">Hadir Lapangan (Proyek)</option>
                    <option value="Lembur">Lembur</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Cuti">Cuti</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Jam Masuk (Check-In)</label>
                  <input
                    type="text"
                    value={formModal.checkIn}
                    onChange={(e) => setFormModal((prev) => ({ ...prev, checkIn: e.target.value }))}
                    placeholder="08:00 WIB"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Jam Pulang (Check-Out)</label>
                  <input
                    type="text"
                    value={formModal.checkOut}
                    onChange={(e) => setFormModal((prev) => ({ ...prev, checkOut: e.target.value }))}
                    placeholder="17:00 WIB (atau - jika belum)"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Titik Lokasi / Penugasan</label>
                <input
                  type="text"
                  value={formModal.location}
                  onChange={(e) => setFormModal((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Misal: Kantor DSTech Cilegon / Proyek PT. Krakatau Posco"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Latitude (Opsional)</label>
                  <input
                    type="text"
                    value={formModal.latitude}
                    onChange={(e) => setFormModal((prev) => ({ ...prev, latitude: e.target.value }))}
                    placeholder="-6.031846"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Longitude (Opsional)</label>
                  <input
                    type="text"
                    value={formModal.longitude}
                    onChange={(e) => setFormModal((prev) => ({ ...prev, longitude: e.target.value }))}
                    placeholder="106.037198"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Laporan / Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={formModal.notes}
                  onChange={(e) => setFormModal((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan aktivitas teknisi atau alasan izin..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setFormModal((prev) => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{formModal.isEdit ? "Simpan Perubahan" : "Catat Presensi"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REVIEW OVERTIME (SETUJUI / TOLAK) */}
      {overtimeModal.isOpen && overtimeModal.record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !submitting && setOvertimeModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                overtimeModal.actionType === "approve"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {overtimeModal.actionType === "approve" ? (
                <ThumbsUp className="w-7 h-7" />
              ) : (
                <ThumbsDown className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-xl font-black text-slate-900 text-center mb-1">
              {overtimeModal.actionType === "approve" ? "Setujui Jam Lembur" : "Tolak Pengajuan Lembur"}
            </h3>
            <p className="text-xs text-slate-500 text-center mb-5">
              {overtimeModal.record.employeeName} • {overtimeModal.record.date} ({overtimeModal.record.hours} Jam)
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5 text-xs space-y-2">
              <div>
                <span className="text-slate-400 font-bold block">Tugas:</span>
                <span className="font-bold text-slate-900">{overtimeModal.record.taskTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Alasan Pengajuan:</span>
                <span className="text-slate-600">{overtimeModal.record.reason}</span>
              </div>
            </div>

            {overtimeModal.actionType === "reject" && (
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alasan Penolakan Lembur *
                </label>
                <textarea
                  rows={2}
                  required
                  value={overtimeModal.rejectionReason}
                  onChange={(e) =>
                    setOvertimeModal((prev) => ({ ...prev, rejectionReason: e.target.value }))
                  }
                  placeholder="Berikan alasan mengapa lembur tidak disetujui..."
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setOvertimeModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleOvertimeDecision}
                className={`flex-1 py-3 px-4 rounded-2xl text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  overtimeModal.actionType === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/25"
                }`}
              >
                {submitting ? (
                  <span>Memproses...</span>
                ) : (
                  <span>{overtimeModal.actionType === "approve" ? "Ya, Setujui" : "Tolak Lembur"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: KONFIRMASI HAPUS */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !submitting && setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Hapus Catatan Ini?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan presensi untuk <span className="font-bold text-slate-800">{deleteModal.name}</span>? Tindakan ini tidak dapat dibatalkan.
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

      {/* MODAL 5: CETAK LEMBAR REKAP A4 RESMI */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">
                  Pratinjau Lembar Rekap Absensi Resmi (A4)
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Printable Sheet */}
            <div id="print-attendance-sheet" className="p-8 border border-slate-200 rounded-2xl bg-white text-slate-900 space-y-6">
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
                    REKAP-ABS-{filterMonth.replace("-", "")}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Dicetak: {new Date().toLocaleDateString("id-ID")}</p>
                </div>
              </div>

              {/* Title Document */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  REKAPITULASI DAFTAR HADIR & DISIPLIN KERJA STAF LAPANGAN
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Periode Bulan: <span className="font-bold text-slate-900">{filterMonth}</span> • Unit Kerja: Seluruh Divisi Lapangan & IT
                </p>
              </div>

              {/* Summary Table */}
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-black text-[11px] text-slate-700">
                    <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                    <th className="p-2 border-r border-slate-300">Nama Karyawan / Teknisi</th>
                    <th className="p-2 border-r border-slate-300 text-center">Hadir Lapangan</th>
                    <th className="p-2 border-r border-slate-300 text-center">Tepat Waktu</th>
                    <th className="p-2 border-r border-slate-300 text-center">Jam Lembur Sah</th>
                    <th className="p-2 text-center">Total Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {employeeOptions.map((name, idx) => {
                    const logs = attendanceList.filter((a) => a.employeeName === name);
                    const lapangan = logs.filter((a) => a.status === "Hadir Lapangan").length;
                    const tepat = logs.filter((a) => a.status === "Tepat Waktu").length;
                    const ot = overtimeList
                      .filter((o) => o.employeeName === name && o.status === "Disetujui")
                      .reduce((sum, curr) => sum + (curr.hours || 0), 0);

                    return (
                      <tr key={name} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-300 font-bold">{name}</td>
                        <td className="p-2 border-r border-slate-300 text-center">{lapangan} Hari</td>
                        <td className="p-2 border-r border-slate-300 text-center">{tepat} Hari</td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold text-amber-700">{ot} Jam</td>
                        <td className="p-2 text-center font-black text-slate-900">{logs.length} Hari</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Detail Logs sample */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-700">Rincian Log Presensi Terakhir</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                        <th className="p-1.5">Tanggal</th>
                        <th className="p-1.5">Nama</th>
                        <th className="p-1.5">Masuk</th>
                        <th className="p-1.5">Pulang</th>
                        <th className="p-1.5">Titik Lokasi</th>
                        <th className="p-1.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAttendance.slice(0, 15).map((log) => (
                        <tr key={log.id}>
                          <td className="p-1.5 font-bold">{log.date}</td>
                          <td className="p-1.5">{log.employeeName}</td>
                          <td className="p-1.5 font-mono">{log.checkIn}</td>
                          <td className="p-1.5 font-mono">{log.checkOut || "-"}</td>
                          <td className="p-1.5 truncate max-w-[200px]">{log.location}</td>
                          <td className="p-1.5 font-bold">{log.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dual Signature */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-center">
                <div>
                  <p className="font-bold text-slate-500 mb-16">Diverifikasi oleh Team Leader,</p>
                  <p className="font-black text-slate-900 uppercase underline">RAMADHANI ST</p>
                  <p className="text-[10px] text-slate-500">Supervisor Operasional & IT</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500 mb-16">Disetujui Direktur Utama,</p>
                  <p className="font-black text-slate-900 uppercase underline">DIREKTUR PT. DSTECH SMART PERKASA</p>
                  <p className="text-[10px] text-slate-500">PT. DSTech Smart Perkasa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
