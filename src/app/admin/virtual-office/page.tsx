"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Office3DCanvas from "@/components/virtual-office/Office3DCanvas";
import {
  Sparkles,
  Bot,
  UserCheck,
  Send,
  Coffee,
  Briefcase,
  Monitor,
  PhoneCall,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RefreshCw,
  Building2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileText,
  DollarSign,
  Package,
  Share2,
  Award,
  Layers,
  ChevronRight,
  X,
  Play,
  MessageSquare,
  Box,
  LayoutGrid,
  ExternalLink,
  ShieldCheck,
  Clock,
  Check,
  Eye,
  AlertTriangle,
  Zap
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  desk_zone: string;
  gender: "male" | "female";
  avatar_color: string;
  status: "WORKING" | "IDLE" | "DISCUSSING" | "ON_PHONE" | "COFFEE_BREAK";
  current_activity: string;
  speech_bubble: string;
  kpi: Record<string, any>;
  skills: string[];
}

interface ActivityLog {
  id: string;
  timestamp: string;
  employee_id: string;
  employee_name: string;
  action: string;
}

export interface ApprovalItem {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_role: string;
  department: string;
  task_type: "SPH_PROPOSAL" | "PRODUCT_IMPORT" | "PROMO_CAMPAIGN" | "CRM_LEAD" | "SPK_FIELD";
  title: string;
  target_client?: string;
  value?: number;
  tax_type?: string;
  summary: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  created_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  payload: any;
}

export default function VirtualOfficePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [approvalQueue, setApprovalQueue] = useState<ApprovalItem[]>([]);
  const [approvalFilter, setApprovalFilter] = useState<"ALL" | "PENDING" | "APPROVED">("PENDING");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [isTriggeringAutopilot, setIsTriggeringAutopilot] = useState(false);
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ApprovalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Command Bar State
  const [executiveCommand, setExecutiveCommand] = useState("");
  const [isSubmittingCommand, setIsSubmittingCommand] = useState(false);
  const [commandSuccessNote, setCommandSuccessNote] = useState<string | null>(null);

  // Office Sound & Display
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"3D" | "GRID">("3D");
  const [modalDirectCommand, setModalDirectCommand] = useState("");
  const [isSubmittingModalCommand, setIsSubmittingModalCommand] = useState(false);
  const [modalExecutionResult, setModalExecutionResult] = useState<any>(null);
  const [modalAiResponse, setModalAiResponse] = useState<string | null>(null);
  const officeContainerRef = useRef<HTMLDivElement>(null);

  // Fetch initial workforce data
  const fetchWorkforce = async () => {
    try {
      const res = await fetch("/api/ai-workforce");
      const json = await res.json();
      if (json.success && json.data) {
        setEmployees(json.data.dstech_employees || []);
        setLogs(json.data.dstech_recent_logs || []);
        setApprovalQueue(json.data.dstech_approval_queue || []);
        if (selectedEmployee) {
          const updated = json.data.dstech_employees.find((e: Employee) => e.id === selectedEmployee.id);
          if (updated) setSelectedEmployee(updated);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data kantor virtual:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkforce();
    const interval = setInterval(fetchWorkforce, 8000);
    return () => clearInterval(interval);
  }, []);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!officeContainerRef.current) return;
    if (!document.fullscreenElement) {
      officeContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Approval Handlers (Kotak Persetujuan Direktur Utama)
  const handleApprove = async (item: ApprovalItem) => {
    setApprovingId(item.id);
    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_queue_item", itemId: item.id })
      });
      const json = await res.json();
      if (json.success) {
        setApprovalNotice(`✅ Berhasil disetujui! Pekerjaan "${item.title}" telah dicatat resmi ke dalam sistem database.`);
        fetchWorkforce();
        setTimeout(() => setApprovalNotice(null), 7000);
      } else {
        alert("Gagal menyetujui: " + (json.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    if (!confirm(`Apakah Anda yakin ingin menolak usulan pekerjaan "${item.title}"?`)) return;
    setRejectingId(item.id);
    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_queue_item", itemId: item.id })
      });
      const json = await res.json();
      if (json.success) {
        setApprovalNotice(`Usulan pekerjaan "${item.title}" telah ditolak dan tidak dimasukkan ke database.`);
        fetchWorkforce();
        setTimeout(() => setApprovalNotice(null), 5000);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setRejectingId(null);
    }
  };

  const handleTriggerAutopilot = async () => {
    setIsTriggeringAutopilot(true);
    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_autopilot" })
      });
      const json = await res.json();
      if (json.success) {
        setApprovalNotice("⚡ Staf AI telah selesai bekerja otonom & menghasilkan draf baru di Kotak Persetujuan Anda!");
        fetchWorkforce();
        setTimeout(() => setApprovalNotice(null), 6000);
      }
    } catch (err: any) {
      alert("Gagal memicu autopilot: " + err.message);
    } finally {
      setIsTriggeringAutopilot(false);
    }
  };

  // Submit Executive Command
  const handleSendCommand = async (e?: React.FormEvent, customTargetId?: string) => {
    if (e) e.preventDefault();
    if (!executiveCommand.trim() || isSubmittingCommand) return;

    setIsSubmittingCommand(true);
    setCommandSuccessNote(null);

    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "order",
          command: executiveCommand.trim(),
          employeeId: customTargetId || (selectedEmployee ? selectedEmployee.id : undefined)
        })
      });

      const json = await res.json();
      if (json.success) {
        setCommandSuccessNote(json.aiResponse || "Perintah berhasil didelegasikan!");
        setExecutiveCommand("");
        fetchWorkforce();
      } else {
        alert(json.error || "Gagal mengirim perintah");
      }
    } catch (err) {
      console.error("Error sending command:", err);
    } finally {
      setIsSubmittingCommand(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: Employee["status"]) => {
    switch (status) {
      case "WORKING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 animate-pulse">● AKTIF BEKERJA</span>;
      case "ON_PHONE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-600 border border-blue-500/30">📞 SEDANG TELEPON</span>;
      case "DISCUSSING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 border border-purple-500/30">🤝 KOORDINASI</span>;
      case "COFFEE_BREAK":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/30">☕ ISTIRAHAT KOPI</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-600 border border-slate-500/30">IDLE STANDBY</span>;
    }
  };

  // Contoh Instruksi Cepat sesuai Peran & Divisi Karyawan
  const getQuickSuggestions = (empId: string) => {
    switch (empId) {
      case "emp_reza_catalog":
        return [
          { label: "🛍️ Impor Suku Cadang Barrier Gate", text: "Reza, tolong impor katalog suku cadang barrier gate dari tekno20 dengan foto asli dan deskripsi lengkap." },
          { label: "🔍 Cek Stok & Update Deskripsi", text: "Reza, cek stok barang barrier gate dan update spesifikasi produk di toko online." },
          { label: "🏷️ Sinkronisasi Harga & Status", text: "Reza, pastikan harga dan spesifikasi produk toko online sudah rapi dan siap tayang." }
        ];
      case "emp_dewi_finance":
        return [
          { label: "📑 Buat Draf SPH Exclude PPN", text: "Dewi, tolong siapkan draf SPH penawaran harga dengan opsi PPN Exclude untuk proyek baru." },
          { label: "💰 Rincian Invoice Proyek", text: "Dewi, buatkan rincian invoice tagihan termin untuk proyek barrier gate." },
          { label: "📊 Cek Arus Kas & Piutang", text: "Dewi, bagaimana rekap arus kas masuk dan piutang pelanggan saat ini?" }
        ];
      case "emp_bambang_sales":
        return [
          { label: "💼 Follow-up Barrier Gate", text: "Bambang, tolong follow-up calon klien pabrik kimia Cilegon untuk paket Barrier Gate RFID." },
          { label: "📋 Catat Prospek Baru", text: "Bambang, tolong catat prospek klien baru proyek perumahan klaster di Serang." },
          { label: "🤝 Jadwal Presentasi Proyek", text: "Bambang, buatkan agenda konsultasi teknis sistem akses kontrol minggu ini." }
        ];
      case "emp_nadia_marketing":
        return [
          { label: "📢 Promo Broadcast WA CCTV", text: "Nadia, buatkan materi promosi broadcast WhatsApp paket CCTV 8 Channel untuk perumahan." },
          { label: "🎯 Promo Barrier Gate Kawasan", text: "Nadia, buat materi promosi solusi Barrier Gate otomatis anti-antrean untuk kawasan industri." },
          { label: "📱 Jadwal Konten Edukasi", text: "Nadia, siapkan jadwal konten edukasi keamanan smart parking minggu ini." }
        ];
      case "emp_siti_cs":
        return [
          { label: "👋 Standby Konsultasi Web", text: "Siti, pastikan chatbot standby dan layani pengunjung yang bertanya seputar CCTV dan Barrier Gate." },
          { label: "📞 Rekap Kebutuhan Klien", text: "Siti, rekap pertanyaan dan kebutuhan spesifikasi klien yang masuk hari ini." }
        ];
      default:
        return [
          { label: "📋 Laporkan Progress Pekerjaan", text: "Tolong laporkan progres dan status pekerjaan Anda saat ini." }
        ];
    }
  };

  return (
    <div ref={officeContainerRef} className={`space-y-6 ${isFullscreen ? "p-8 bg-slate-950 text-white min-h-screen overflow-y-auto" : "p-4 md:p-6 max-w-7xl mx-auto"}`}>
      
      {/* Header Bar Kantor Virtual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE 24/7 AI DIGITAL WORKFORCE
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-bold text-slate-300">PT. DSTech Smart Perkasa</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight">
            <Building2 className="w-8 h-8 text-cyan-400" />
            <span>Kantor Virtual &amp; Divisi Karyawan AI</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Seluruh divisi operasional back-office, sales penawaran SPH, faktur ERP, promosi, dan CS berjalan otomatis secara otonom di bawah komando Direktur Utama.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher 3D vs Grid */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-700 shadow-inner">
            <button
              onClick={() => setViewMode("3D")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "3D"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Simulasi 3D</span>
            </button>
            <button
              onClick={() => setViewMode("GRID")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "GRID"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Denah Kartu</span>
            </button>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/10"
            title={isMuted ? "Bunyikan Suara Kantor" : "Senyapkan Suara"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />}
            <span className="hidden sm:inline text-xs">{isMuted ? "Mute" : "Audio On"}</span>
          </button>

          <button
            onClick={fetchWorkforce}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/10"
            title="Sinkronkan Ruangan"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline text-xs">Sync</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
            title="Tampilkan Layar Penuh (Display TV Kantor)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? "Keluar TV Mode" : "TV Wall Display"}</span>
          </button>
        </div>
      </div>

      {/* VIEWPORT 3D UTAMA ATAU DENAH KANTOR */}
      {viewMode === "3D" ? (
        <div className="relative">
          <Office3DCanvas
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={(emp) => setSelectedEmployee(emp as Employee)}
          />
        </div>
      ) : (
      /* DENAH KANTOR VIRTUAL (ISOMETRIC / 2.5D INTERACTIVE FLOOR PLAN) */
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 relative overflow-hidden min-h-[580px]">
        {/* Background Grid Ambience */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

        {/* Header Ruangan Kantor Info */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Suhu Ruang: 22°C (AC Nyaman)
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline font-bold text-slate-300">
              WiFi &amp; Gateway: 100% Online
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="font-bold text-cyan-400">
              Model Otak AI: Google Gemini 2.5 Multi-Agent
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Petunjuk:</span>
            <span className="text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              Klik sembarang karyawan untuk interaksi &amp; beri tugas
            </span>
          </div>
        </div>

        {/* TATA RUANG INTERAKTIF KANTOR */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          
          {/* MEJA DIREKTUR UTAMA (OWNER SUITE) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 shadow-xl relative group">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-500/20">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Ruang Direktur Utama &amp; Meja Eksekutif
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                OWNER COMMAND
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-black text-xl border-2 border-amber-300">
                👨‍💼
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white">Ramadhani ST</h3>
                <p className="text-xs text-amber-300/90 font-medium">Direktur Utama &amp; Pemilik PT. DSTech Smart Perkasa</p>
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span>Status: Siap Memimpin</span>
                  <span>•</span>
                  <span>Otoritas Tertinggi SPH &amp; Lapangan</span>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-slate-950/60 rounded-xl border border-indigo-500/20 text-xs text-slate-300 flex items-center gap-2">
              <span className="text-amber-400">👑</span>
              <span className="text-[11px] leading-relaxed">
                Meja pimpinan siap mengarahkan seluruh divisi karyawan AI via Command Bar di bawah.
              </span>
            </div>
          </div>

          {/* PANTRY & COFFEE LOUNGE */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4" />
                  Pantry Kopi &amp; Lounge Istirahat
                </span>
                <span className="text-[10px] font-bold text-slate-500">AREA REHAT</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tempat rehat dan diskusi santai bagi karyawan AI saat status mereka sedang senggang atau jeda tugas.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                ☕ Mesin Espresso: Ready
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-bold">
                💧 Dispenser Air: Dingin &amp; Panas
              </span>
            </div>
          </div>

          {/* KARTU MEJA KERJA TIAP KARYAWAN AI */}
          {employees.map((emp) => {
            const isSelected = selectedEmployee?.id === emp.id;
            return (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`bg-slate-800/80 hover:bg-slate-800 transition-all duration-200 rounded-2xl p-4 border cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? "border-cyan-400 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-400/30 scale-[1.02]"
                    : "border-slate-700/70 hover:border-slate-600 shadow-md"
                }`}
              >
                {/* Speech Bubble Melayang di Atas Kepala */}
                {emp.speech_bubble && (
                  <div className="mb-3 p-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-[11px] text-slate-200 relative shadow-md group-hover:border-cyan-400/50 transition">
                    <p className="line-clamp-2 leading-relaxed italic">
                      &ldquo;{emp.speech_bubble}&rdquo;
                    </p>
                    <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 transform rotate-45" />
                  </div>
                )}

                {/* Avatar & Identitas Karyawan */}
                <div className="flex items-start gap-3 mt-1">
                  <div className="relative">
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2"
                      style={{
                        backgroundColor: emp.avatar_color + "20",
                        borderColor: emp.avatar_color
                      }}
                    >
                      {emp.gender === "female" ? "👩‍💼" : "👨‍💼"}
                    </div>
                    {/* Status Dot Indikator */}
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-black text-white truncate">{emp.name}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{emp.role}</p>
                    <div className="mt-1.5">
                      {getStatusBadge(emp.status)}
                    </div>
                  </div>
                </div>

                {/* Aktivitas Saat Ini */}
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 text-[10.5px] text-slate-300">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Aktivitas Saat Ini:
                  </span>
                  <p className="line-clamp-2 leading-tight text-slate-300 font-medium">
                    {emp.current_activity}
                  </p>
                </div>

                {/* Footer Kartu & Tombol Aksi */}
                <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono text-cyan-400 font-bold">{emp.department}</span>
                  <span className="flex items-center gap-1 text-slate-300 font-bold group-hover:text-cyan-400 transition">
                    Kelola <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* LOG AKTIVITAS TERKINI (LIVE TICKER FEED) */}
        <div className="relative z-10 mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Linimasa Kerja Kantor Digital (Live Activity Log)
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Real-time sync</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-36 overflow-y-auto pr-1">
            {logs.slice(0, 4).map((l) => (
              <div key={l.id} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-cyan-400">{l.employee_name}</span>
                  <span className="text-slate-500 font-mono">{new Date(l.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-slate-300 text-[10.5px] leading-tight line-clamp-2">
                  {l.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* KOTAK PERSETUJUAN PIMPINAN (AI AUTOPILOT & APPROVAL QUEUE) */}
      {(() => {
        const pendingCount = approvalQueue.filter((x) => x.status === "PENDING_APPROVAL").length;
        const approvedCount = approvalQueue.filter((x) => x.status === "APPROVED").length;
        const filteredApprovalQueue = approvalQueue.filter((x) => {
          if (approvalFilter === "PENDING") return x.status === "PENDING_APPROVAL";
          if (approvalFilter === "APPROVED") return x.status === "APPROVED";
          return true;
        });

        return (
          <div className="bg-slate-900/95 border-2 border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header Kotak Persetujuan */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 text-xl font-black shrink-0">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      Kotak Persetujuan Pimpinan
                      <span className="text-amber-400 font-extrabold text-xs">
                        (AI Autopilot Hub)
                      </span>
                    </h3>
                    {pendingCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase animate-pulse shadow-sm shadow-amber-500/30">
                        {pendingCount} Menunggu Approval
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Semua hasil kerja staf AI (SPH penawaran, produk suku cadang, materi promo, SPK) tersimpan di sini. Sistem aman &amp; 100% tidak akan menulis ke database sebelum Bapak Ramadhani ST menyetujuinya.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Tabs */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setApprovalFilter("PENDING")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${approvalFilter === "PENDING" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
                  >
                    Menunggu ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalFilter("APPROVED")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${approvalFilter === "APPROVED" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    Disetujui ({approvedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalFilter("ALL")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${approvalFilter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    Semua ({approvalQueue.length})
                  </button>
                </div>

                {/* Tombol Picu Autopilot Staf AI */}
                <button
                  type="button"
                  onClick={handleTriggerAutopilot}
                  disabled={isTriggeringAutopilot}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Perintahkan staf AI bekerja otomatis menghasilkan draf tugas baru"
                >
                  <Zap className={`w-3.5 h-3.5 ${isTriggeringAutopilot ? "animate-spin" : ""}`} />
                  <span>{isTriggeringAutopilot ? "Staf AI Sedang Bekerja..." : "⚡ Jalankan Autopilot Kerja Staf"}</span>
                </button>
              </div>
            </div>

            {/* Notifikasi Pop-up Hasil Aksi */}
            {approvalNotice && (
              <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">{approvalNotice}</span>
                </div>
                <button
                  onClick={() => setApprovalNotice(null)}
                  className="text-emerald-400 hover:text-white text-xs px-2 py-0.5"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Daftar Item Usulan Pekerjaan */}
            {filteredApprovalQueue.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/50 rounded-2xl border border-slate-800/80 p-6 space-y-2">
                <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  {approvalFilter === "PENDING" ? "Tidak Ada Pekerjaan Menunggu Persetujuan" : "Belum Ada Riwayat Pekerjaan"}
                </h4>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Semua tugas staf AI telah Anda review. Klik tombol <b>⚡ Jalankan Autopilot Kerja Staf</b> di atas untuk memicu staf AI bekerja menghasilkan draf baru secara otomatis.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApprovalQueue.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                      item.status === "APPROVED"
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : item.status === "REJECTED"
                        ? "bg-slate-950/40 border-slate-800 opacity-60"
                        : "bg-slate-950/70 border-amber-500/30 hover:border-amber-500/60 shadow-lg"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Badge Header Pengusul & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-amber-300 border border-slate-700">
                            {item.employee_name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white">{item.employee_name}</h4>
                            <span className="text-[9.5px] text-slate-400 block -mt-0.5">{item.employee_role}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            item.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : item.status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                          }`}
                        >
                          {item.status === "APPROVED" ? "✓ Disetujui" : item.status === "REJECTED" ? "✕ Ditolak" : "⏳ Menunggu"}
                        </span>
                      </div>

                      {/* Judul & Sasaran */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[9px] font-mono font-bold uppercase">
                            {item.task_type.replace("_", " ")}
                          </span>
                          {item.tax_type === "exclude" && (
                            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[9px] font-bold border border-indigo-800">
                              Exclude PPN
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-black text-white leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h5>
                        {item.target_client && (
                          <p className="text-[10.5px] text-slate-400 mt-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="font-semibold text-slate-300 line-clamp-1">{item.target_client}</span>
                          </p>
                        )}
                      </div>

                      {/* Ringkasan & Estimasi Nilai */}
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] space-y-1.5">
                        <p className="text-slate-300 leading-relaxed line-clamp-3 text-[10.5px]">
                          {item.summary}
                        </p>
                        {item.value && item.value > 0 ? (
                          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Estimasi Nilai</span>
                            <span className="font-mono font-black text-amber-400">
                              Rp {item.value.toLocaleString("id-ID")}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                      {item.status === "PENDING_APPROVAL" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(item)}
                            disabled={approvingId === item.id || rejectingId === item.id}
                            className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {approvingId === item.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>{approvingId === item.id ? "Menyimpan..." : "Setujui & Terapkan"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReject(item)}
                            disabled={approvingId === item.id || rejectingId === item.id}
                            className="px-3 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                            title="Tolak Pekerjaan"
                          >
                            {rejectingId === item.id ? "..." : "Tolak"}
                          </button>
                        </>
                      ) : (
                        <div className="w-full text-center py-1 text-[11px] font-bold text-slate-500">
                          {item.status === "APPROVED" ? (
                            <span className="text-emerald-400 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui resmi oleh Direktur Utama
                            </span>
                          ) : (
                            <span className="text-rose-400">Ditolak</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* EXECUTIVE COMMAND BAR (KOTAK PERINTAH LANGSUNG DARI DIREKTUR UTAMA) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 p-5 rounded-3xl shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                Kotak Perintah Eksekutif Direktur Utama
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  AI GEMINI 2.5 CONNECTED
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Ketik instruksi bisnis apa saja (sales SPH, promo WA, import produk, atau tagihan), AI akan langsung mendelegasikan ke karyawan yang tepat.
              </p>
            </div>
          </div>

          {selectedEmployee && (
            <div className="flex items-center gap-2 bg-indigo-900/60 px-3 py-1.5 rounded-xl border border-indigo-700/60">
              <span className="text-[10px] text-slate-300 font-bold">Target Perintah:</span>
              <span className="text-xs font-black text-amber-300">{selectedEmployee.name}</span>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-white text-xs ml-1"
                title="Batal pilih"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSendCommand} className="flex gap-2">
          <input
            type="text"
            required
            value={executiveCommand}
            onChange={(e) => setExecutiveCommand(e.target.value)}
            placeholder={
              selectedEmployee
                ? `Beri instruksi langsung untuk ${selectedEmployee.name} (contoh: tolong buatkan penawaran SPH)...`
                : "Beri instruksi untuk seluruh kantor (contoh: Bambang tolong follow-up klien PT Krakatau, Dewi siapkan SPH)..."
            }
            className="flex-1 px-4 py-3 bg-slate-950/80 border border-indigo-500/40 rounded-2xl text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
          />

          <button
            type="submit"
            disabled={isSubmittingCommand}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSubmittingCommand ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isSubmittingCommand ? "Mendelegasikan..." : "Instruksikan"}</span>
          </button>
        </form>

        {/* Feedback Response Bubble */}
        {commandSuccessNote && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block text-emerald-300">Respon Karyawan AI:</span>
              <p className="leading-relaxed text-[11px] text-emerald-100">{commandSuccessNote}</p>
            </div>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10.5px]">
          <span className="text-slate-400 font-bold mr-1">Contoh Cepat:</span>
          <button
            type="button"
            onClick={() => setExecutiveCommand("Bambang, tolong follow-up calon klien pabrik kimia Cilegon untuk paket Barrier Gate RFID.")}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            💼 Follow-up Barrier Gate
          </button>
          <button
            type="button"
            onClick={() => setExecutiveCommand("Dewi, tolong siapkan draf SPH penawaran harga dengan opsi PPN Exclude untuk proyek baru.")}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            📑 Siapkan Draf SPH Exclude PPN
          </button>
          <button
            type="button"
            onClick={() => setExecutiveCommand("Nadia, buatkan materi promosi broadcast WhatsApp paket CCTV 8 Channel untuk perumahan.")}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            📢 Promo Broadcast CCTV
          </button>
          <button
            type="button"
            onClick={() => setExecutiveCommand("Reza, cek stok barang barrier gate dan update spesifikasi produk di toko online.")}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            🛍️ Cek Katalog Toko
          </button>
        </div>
      </div>

      {/* DRAWER / MODAL DETAIL KARYAWAN AI */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-xl w-full rounded-3xl p-6 text-white shadow-2xl space-y-5 relative">
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setModalAiResponse(null);
                setModalExecutionResult(null);
                setModalDirectCommand("");
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2"
                style={{
                  backgroundColor: selectedEmployee.avatar_color + "25",
                  borderColor: selectedEmployee.avatar_color
                }}
              >
                {selectedEmployee.gender === "female" ? "👩‍💼" : "👨‍💼"}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{selectedEmployee.name}</h3>
                <p className="text-xs text-cyan-400 font-bold">{selectedEmployee.role}</p>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusBadge(selectedEmployee.status)}
                  <span className="text-[10px] text-slate-400 font-mono">Divisi: {selectedEmployee.department}</span>
                </div>
              </div>
            </div>

            {/* Balon Ucapan & Aktivitas Saat Ini */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Apa yang Sedang Dikerjakan:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {selectedEmployee.current_activity}
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-cyan-300 italic">
                &ldquo;{selectedEmployee.speech_bubble}&rdquo;
              </div>
            </div>

            {/* Metrik KPI */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Pencapaian KPI Harian:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                {Object.entries(selectedEmployee.kpi).map(([key, val]) => (
                  <div key={key} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                    <span className="text-xs font-black text-white block">
                      {typeof val === "number" ? val.toLocaleString("id-ID") : String(val)}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                      {key.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keahlian Karyawan AI */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Spesialisasi &amp; Keahlian:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedEmployee.skills.map((sk, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 rounded-lg text-[10px] font-medium">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Form Chat & Instruksi Langsung ke Karyawan Ini */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!modalDirectCommand.trim() || isSubmittingModalCommand) return;
                setIsSubmittingModalCommand(true);
                try {
                  const res = await fetch("/api/ai-workforce", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "order",
                      command: modalDirectCommand.trim(),
                      employeeId: selectedEmployee.id,
                    }),
                  });
                  const json = await res.json();
                  if (json.success) {
                    if (json.targetedEmployee) {
                      setSelectedEmployee(json.targetedEmployee);
                    }
                    if (json.executionResult) {
                      setModalExecutionResult(json.executionResult);
                    }
                    if (json.aiResponse) {
                      setModalAiResponse(json.aiResponse);
                    }
                    setModalDirectCommand("");
                    fetchWorkforce();
                  } else {
                    alert(json.error || "Gagal memproses instruksi");
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSubmittingModalCommand(false);
                }
              }}
              className="pt-3 border-t border-slate-800 space-y-3"
            >
              {/* Balasan Langsung Karyawan AI jika baru saja diberi instruksi */}
              {modalAiResponse && (
                <div className="p-4 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-indigo-950/80 border-2 border-emerald-500/60 rounded-2xl shadow-xl space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-emerald-400" />
                        Respon &amp; Laporan Kerja {selectedEmployee.name}:
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      DIEKSEKUSI OTONOM
                    </span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-emerald-500/20 text-xs text-emerald-100 leading-relaxed font-medium whitespace-pre-line">
                    {modalAiResponse}
                  </div>
                </div>
              )}

              {/* Tautan Cepat Hasil Eksekusi Tugas */}
              {modalExecutionResult && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <span className="text-emerald-300 font-medium text-[11px]">
                    ✓ Tugas berhasil dieksekusi secara otonom!
                  </span>
                  {modalExecutionResult.link && (
                    <a
                      href={modalExecutionResult.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Lihat Hasil di ERP</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Contoh Perintah Siap Pakai Spesifik Karyawan */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Contoh Perintah Siap Pakai untuk {selectedEmployee.name}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {getQuickSuggestions(selectedEmployee.id).map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setModalDirectCommand(sug.text)}
                      className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10.5px] border border-slate-700 hover:border-cyan-500/50 transition cursor-pointer text-left"
                      title="Klik untuk memasukkan instruksi ini ke kotak input"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kirim Perintah Langsung ke {selectedEmployee.name}:</span>
                </span>
                {isSubmittingModalCommand && (
                  <span className="text-[10px] text-cyan-400 font-mono animate-pulse">
                    Sedang memproses instruksi &amp; mengeksekusi...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={modalDirectCommand}
                  onChange={(e) => setModalDirectCommand(e.target.value)}
                  placeholder={`Ketik instruksi untuk ${selectedEmployee.name}... (Enter untuk kirim)`}
                  disabled={isSubmittingModalCommand}
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isSubmittingModalCommand || !modalDirectCommand.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
