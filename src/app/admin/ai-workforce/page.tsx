"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Cpu,
  Server,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Wrench,
  Clock,
  Send,
  Building2,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Check,
  Copy,
  Layers,
  ArrowRight,
  Activity,
  HardDrive,
  Printer,
  MessageSquare,
  Calendar,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  X,
  Phone,
  QrCode,
  UserPlus,
  Trash2,
  Plus,
  Edit3,
  Shield,
  Users,
} from "lucide-react";

export default function AiWorkforcePage() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [engineInfo, setEngineInfo] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"workspace" | "scheduler">("workspace");

  // Form tugas otonom
  const [selectedAgentId, setSelectedAgentId] = useState("emp_bambang_sales");
  const [instruction, setInstruction] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<any>(null);
  const [copiedDoc, setCopiedDoc] = useState(false);

  // Modal Cetak PDF Resmi
  const [printDocModal, setPrintDocModal] = useState<any>(null);

  // Modal WhatsApp Dispatch
  const [whatsappModal, setWhatsappModal] = useState<any>(null);
  const [targetPhone, setTargetPhone] = useState("");
  const [waSending, setWaSending] = useState(false);
  const [waNotice, setWaNotice] = useState<string | null>(null);

  // Scheduler state
  const [runningScheduleId, setRunningScheduleId] = useState<string | null>(null);

  // Modal Kurasi Produk Harian (Stok 0 & Margin 50%)
  const [curateModal, setCurateModal] = useState(false);
  const [curateKeyword, setCurateKeyword] = useState("");
  const [curateCategory, setCurateCategory] = useState("Parking & Barrier System");
  const [curateExternalImage, setCurateExternalImage] = useState("");
  const [curateSourceUrl, setCurateSourceUrl] = useState("");
  const [isCurating, setIsCurating] = useState(false);
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);

  // Modal Rekrut Staf AI Baru
  const [recruitModal, setRecruitModal] = useState(false);
  const [recruitName, setRecruitName] = useState("");
  const [recruitRole, setRecruitRole] = useState("");
  const [recruitDept, setRecruitDept] = useState("HUKUM & LEGALITAS");
  const [recruitDeskZone, setRecruitDeskZone] = useState("LEGAL_DESK");
  const [recruitGender, setRecruitGender] = useState<"male" | "female">("male");
  const [recruitColor, setRecruitColor] = useState("#6366f1");
  const [recruitSpecialties, setRecruitSpecialties] = useState("");
  const [recruitPrompt, setRecruitPrompt] = useState("");
  const [recruitScheduleEnabled, setRecruitScheduleEnabled] = useState(true);
  const [recruitScheduleTitle, setRecruitScheduleTitle] = useState("");
  const [recruitSchedulePattern, setRecruitSchedulePattern] = useState("Setiap Hari, 08:30 WIB");
  const [recruitScheduleInstruction, setRecruitScheduleInstruction] = useState("");
  const [isRecruiting, setIsRecruiting] = useState(false);

  // Modal Tambah Jadwal Rutin
  const [addScheduleModal, setAddScheduleModal] = useState(false);
  const [scheduleAgentId, setScheduleAgentId] = useState("");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [schedulePattern, setSchedulePattern] = useState("Setiap Hari, 08:30 WIB");
  const [scheduleInstruction, setScheduleInstruction] = useState("");
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // Helper Preset Rekrut Cepat
  const applyRecruitPreset = (type: "LEGAL" | "HRD" | "CYBER" | "RND") => {
    if (type === "LEGAL") {
      setRecruitName("Rian Ardiansyah, S.H.");
      setRecruitRole("Legal Specialist & Contract Drafter");
      setRecruitDept("HUKUM & LEGALITAS");
      setRecruitDeskZone("LEGAL_DESK");
      setRecruitGender("male");
      setRecruitColor("#6366f1");
      setRecruitSpecialties("Review Kontrak, Legal Drafting, Kepatuhan Regulasi, Analisis Perjanjian");
      setRecruitPrompt("Anda adalah Rian Ardiansyah, S.H., Legal Specialist resmi PT. DSTech Smart Perkasa. Tugas Anda menganalisis keabsahan hukum dokumen, meninjau kontrak kerja sama pengadaan barrier gate & CCTV, dan memastikan seluruh klausa bisnis sesuai dengan hukum perdagangan RI dan SOP internal.");
      setRecruitScheduleTitle("Audit Kepatuhan Hukum & Kontrak Harian");
      setRecruitScheduleInstruction("Tinjau draf dokumen perjanjian dan audit kepatuhan klausa jaminan garansi produk katalog terbaru.");
    } else if (type === "HRD") {
      setRecruitName("Anisa Rahmawati, S.Psi.");
      setRecruitRole("HRD & People Operations Specialist");
      setRecruitDept("SDM & KEPEGAWAIAN");
      setRecruitDeskZone("HR_DESK");
      setRecruitGender("female");
      setRecruitColor("#ec4899");
      setRecruitSpecialties("Manajemen SDM, Evaluasi Kinerja, Rekap Kehadiran, Kebijakan Karyawan");
      setRecruitPrompt("Anda adalah Anisa Rahmawati, S.Psi., Spesialis HRD di PT. DSTech Smart Perkasa. Tugas Anda menyusun kebijakan SDM, membantu pembinaan staf, mengevaluasi laporan KPI teknisi, dan merancang program kesejahteraan tim.");
      setRecruitScheduleTitle("Rekapitulasi Kinerja & Kehadiran Tim");
      setRecruitScheduleInstruction("Analisis log absensi dan rekapitulasi efektivitas penugasan proyek harian seluruh staf.");
    } else if (type === "CYBER") {
      setRecruitName("Bayu Pratama, S.Kom.");
      setRecruitRole("IT Infrastructure & Cyber Security Lead");
      setRecruitDept("IT & CYBER SECURITY");
      setRecruitDeskZone("TECH_DESK");
      setRecruitGender("male");
      setRecruitColor("#0ea5e9");
      setRecruitSpecialties("Keamanan Jaringan, Audit Log Server, Firewall IoT, Penetrasi Sistem");
      setRecruitPrompt("Anda adalah Bayu Pratama, S.Kom., Lead IT & Cyber Security PT. DSTech Smart Perkasa. Anda bertanggung jawab menjaga keandalan infrastruktur IoT barrier gate, enkripsi data kontrol akses, serta audit keamanan server in-house.");
      setRecruitScheduleTitle("Audit Keamanan Server & Firewall IoT Harian");
      setRecruitScheduleInstruction("Lakukan pemindaian status koneksi controller barrier gate, port server internal, dan log akses sistem.");
    } else if (type === "RND") {
      setRecruitName("Dimas Suryo, S.T.");
      setRecruitRole("R&D Automation & Smart Gate Engineer");
      setRecruitDept("RISET & PENGEMBANGAN");
      setRecruitDeskZone("RND_STUDIO");
      setRecruitGender("male");
      setRecruitColor("#14b8a6");
      setRecruitSpecialties("Riset Hardware IoT, Firmware ESP32, Integrasi RFID/UHF, Desain Mekatronika");
      setRecruitPrompt("Anda adalah Dimas Suryo, S.T., R&D Automation Engineer PT. DSTech Smart Perkasa. Fokus Anda adalah merancang inovasi hardware kontrol akses, optimalisasi mikrokontroler palang parkir, dan integrasi modul ANPR AI camera.");
      setRecruitScheduleTitle("Riset & Optimalisasi Modul Otomasi Palang Parkir");
      setRecruitScheduleInstruction("Lakukan pengujian kompatibilitas firmware mikrokontroler dan buatkan rekomendasi integrasi modul terbaru.");
    }
  };

  const handleRecruitAgent = async () => {
    if (!recruitName.trim() || !recruitRole.trim()) {
      alert("Nama lengkap dan peran karyawan AI wajib diisi.");
      return;
    }
    setIsRecruiting(true);
    try {
      const payload: any = {
        action: "recruit_agent",
        name: recruitName.trim(),
        role: recruitRole.trim(),
        department: recruitDept,
        deskZone: recruitDeskZone,
        gender: recruitGender,
        avatarColor: recruitColor,
        specialties: recruitSpecialties.split(",").map((s) => s.trim()).filter(Boolean),
        systemPrompt: recruitPrompt.trim(),
      };
      if (recruitScheduleEnabled && recruitScheduleTitle.trim()) {
        payload.dailySchedule = {
          title: recruitScheduleTitle.trim(),
          schedulePattern: recruitSchedulePattern.trim(),
          instruction: recruitScheduleInstruction.trim(),
        };
      }

      const res = await fetch("/api/ai-inhouse-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Karyawan AI baru berhasil direkrut!");
        setRecruitModal(false);
        setRecruitName("");
        setRecruitRole("");
        setRecruitSpecialties("");
        setRecruitPrompt("");
        setRecruitScheduleTitle("");
        setRecruitScheduleInstruction("");
        await loadData();
        if (data.agent?.id) {
          setSelectedAgentId(data.agent.id);
        }
      } else {
        alert("Gagal merekrut staf AI: " + (data.message || ""));
      }
    } catch (err: any) {
      alert("Error merekrut staf AI: " + err.message);
    } finally {
      setIsRecruiting(false);
    }
  };

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (!confirm(`Apakah Anda yakin ingin memberhentikan karyawan AI "${agentName}" dari PT. DSTech Smart Perkasa? Tindakan ini akan menghapus meja kerjanya dari kantor virtual.`)) {
      return;
    }
    try {
      const res = await fetch("/api/ai-inhouse-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_agent", agentId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Karyawan AI berhasil diberhentikan.");
        if (selectedAgentId === agentId) {
          setSelectedAgentId("emp_bambang_sales");
        }
        loadData();
      } else {
        alert("Gagal memberhentikan: " + (data.message || ""));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleSaveSchedule = async () => {
    if (!scheduleTitle.trim() || !scheduleInstruction.trim()) {
      alert("Judul jadwal dan instruksi wajib diisi.");
      return;
    }
    setIsSavingSchedule(true);
    try {
      const chosenAgent = agents.find((a) => a.id === scheduleAgentId) || agents[0];
      const res = await fetch("/api/ai-inhouse-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_schedule",
          agentId: chosenAgent?.id || "emp_bambang_sales",
          agentName: chosenAgent?.name || "AI Staff",
          department: chosenAgent?.department || "OPERASIONAL",
          title: scheduleTitle.trim(),
          schedulePattern: schedulePattern.trim(),
          instruction: scheduleInstruction.trim(),
          enabled: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Jadwal rutin otonom berhasil disimpan!");
        setAddScheduleModal(false);
        setScheduleTitle("");
        setScheduleInstruction("");
        loadData();
      } else {
        alert("Gagal menyimpan jadwal: " + (data.message || ""));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleSyncProductPrices = async () => {
    setIsSyncingPrices(true);
    try {
      const res = await fetch("/api/ai-inhouse-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_product_prices" }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Audit & penyelarasan harga produk selesai!");
        loadData();
      } else {
        alert("Gagal sinkronisasi harga: " + (data.message || ""));
      }
    } catch (err: any) {
      alert("Error sinkronisasi harga: " + err.message);
    } finally {
      setIsSyncingPrices(false);
    }
  };

  // Load data dari API
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ai-inhouse-agents");
      const data = await res.json();
      if (data.success) {
        setAgents(data.profiles || []);
        setRecentTasks(data.recentTasks || []);
        setEngineInfo(data.inHouseEngine || {});
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error("Error loading in-house agents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDispatchTask = async (customInstruction?: string) => {
    const textToRun = customInstruction || instruction;
    if (!textToRun.trim()) {
      alert("Silakan masukkan instruksi tugas otonom terlebih dahulu.");
      return;
    }

    setIsExecuting(true);

    try {
      const res = await fetch("/api/ai-inhouse-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "dispatch_task",
          agentId: selectedAgentId,
          instruction: textToRun,
        }),
      });

      const data = await res.json();
      if (data.success && data.task) {
        setSelectedTaskDetail(data.task);
        loadData();
      } else {
        alert(data.message || "Gagal mengeksekusi tugas otonom.");
      }
    } catch (e: any) {
      alert("Terjadi kesalahan: " + (e?.message || "Koneksi terputus"));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleToggleSchedule = async (scheduleId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/ai-inhouse-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_schedule",
          scheduleId,
          enabled: !currentStatus,
        }),
      });
      const data = await res.json();
      if (data.success && data.schedules) {
        setSchedules(data.schedules);
      }
    } catch (e) {
      console.error("Failed to toggle schedule:", e);
    }
  };

  const handleRunScheduleNow = async (scheduleId: string) => {
    setRunningScheduleId(scheduleId);
    try {
      const res = await fetch("/api/ai-inhouse-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run_schedule_now",
          scheduleId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Jadwal otonom berhasil dijalankan!");
        if (data.task) {
          setSelectedTaskDetail(data.task);
          setActiveTab("workspace");
        }
        loadData();
      } else {
        alert(data.message || "Gagal menjalankan jadwal.");
      }
    } catch (e: any) {
      alert("Gagal menjalankan jadwal: " + e?.message);
    } finally {
      setRunningScheduleId(null);
    }
  };

  const handleCurateProduct = async () => {
    setIsCurating(true);
    try {
      const res = await fetch("/api/ai-inhouse-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "curate_daily_product",
          keyword: curateKeyword || undefined,
          category: curateCategory,
          externalImageUrl: curateExternalImage || undefined,
          sourceUrl: curateSourceUrl || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.product) {
        alert(data.message || "Produk baru berhasil ditambahkan ke katalog!");
        setCurateModal(false);
        setCurateKeyword("");
        setCurateExternalImage("");
        
        // Buat task view agar langsung tampil di layar
        setSelectedTaskDetail({
          id: `TASK-CURATE-${Date.now()}`,
          agentId: "emp_bambang_sales",
          agentName: "Bambang Prakoso",
          instruction: `Kurasi dan tambah produk baru: "${data.product.name}"`,
          status: "COMPLETED",
          resultSummary: data.message,
          documentGenerated: {
            type: "CATALOG_PRODUCT",
            docNumber: data.product.id,
            title: `Produk Baru: ${data.product.name}`,
            content: data.product,
          },
          thoughtProcess: [
            "Menganalisis kebutuhan pasar teknologi keamanan...",
            "Menyusun nama resmi berawalan DStech dan deskripsi teknis mendalam...",
            "Memastikan stok diatur ke 0 agar tidak menambah beban nilai aset pembukuan keuangan...",
            "Menghasilkan visual studio ber-badge resmi PT. DSTech Smart Perkasa...",
            "Menyimpan ke katalog produk dstech_products.json secara otonom."
          ],
          createdAt: new Date().toISOString(),
        });
        
        loadData();
      } else {
        alert(data.message || "Gagal kurasi produk.");
      }
    } catch (e: any) {
      alert("Error kurasi produk: " + e?.message);
    } finally {
      setIsCurating(false);
    }
  };

  const handleSendWhatsApp = async (viaGateway: boolean = false) => {
    if (!whatsappModal) return;
    setWaSending(true);
    setWaNotice(null);

    try {
      const res = await fetch("/api/ai-inhouse-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_whatsapp",
          phone: targetPhone,
          document: whatsappModal.documentGenerated || whatsappModal,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (viaGateway && data.gatewaySent) {
          setWaNotice("Pesan berhasil dikirim via SmartPro WA Gateway!");
        } else {
          // Buka WhatsApp Web / App
          window.open(data.waLink, "_blank");
          setWaNotice("Tautan WhatsApp terbuka di tab baru!");
        }
      } else {
        alert(data.message || "Gagal memproses WhatsApp.");
      }
    } catch (e: any) {
      alert("Error: " + e?.message);
    } finally {
      setWaSending(false);
    }
  };

  const copyDocument = (docContent: any) => {
    if (!docContent) return;
    const text = typeof docContent === "string" ? docContent : JSON.stringify(docContent, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>In-House Autonomous Agentic Workforce &bull; PT DSTech Smart Perkasa</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>🤖 Tim AI Agent Otonom Mandiri</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Tim tenaga kerja AI otonom khusus yang bekerja 100% mandiri pada server internal. Terintegrasi langsung dengan katalog produk, kalkulasi PPN 11%, basis pengetahuan KMS, dan cetak PDF resmi ber-kop surat.
            </p>
          </div>

          {/* Engine Status Card */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-slate-900/90 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-indigo-500/30 shadow-inner flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Engine AI In-House</span>
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-black text-white">{engineInfo?.defaultModel || "qwen2.5:3b"}</strong>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${engineInfo?.status === "ONLINE" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300"}`}>
                    {engineInfo?.status || "ONLINE"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">CPU Intel Xeon &bull; 0 Biaya Token</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                applyRecruitPreset("LEGAL");
                setRecruitModal(true);
              }}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-lg shadow-emerald-950/40 border border-emerald-400/40 flex items-center justify-center gap-2 cursor-pointer"
              title="Rekrut Staf AI Baru"
            >
              <UserPlus className="w-4 h-4 text-emerald-200" />
              <span>➕ Rekrut Staf AI Baru</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/15 flex items-center justify-center gap-2"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("workspace")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "workspace"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>🏢 Ruang Penugasan Otonom</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("scheduler")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "scheduler"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>📅 Jadwal Rutin Otonom (Auto-Scheduler)</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
              {schedules.filter((s) => s.enabled).length} Aktif
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: RUANG PENUGASAN OTONOM */}
      {activeTab === "workspace" && (
        <>
          {/* Grid Kartu Agen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`relative p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? "bg-white border-indigo-600 shadow-xl shadow-indigo-600/10 ring-2 ring-indigo-600/20"
                      : "bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-sm"
                        style={{ backgroundColor: agent.avatarColor || "#6366f1" }}
                      >
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{agent.name}</h3>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          {agent.department}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {agent.isCustomAgent && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-100 text-purple-700 border border-purple-200">
                          Kustom
                        </span>
                      )}
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] font-semibold text-indigo-700 bg-indigo-50/60 px-2.5 py-1 rounded-xl border border-indigo-100/50">
                    {agent.role}
                  </p>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Keahlian Khusus:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(agent.specialties || []).map((spec: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Siap Ditugaskan</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {agent.isCustomAgent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAgent(agent.id, agent.name);
                          }}
                          className="p-1 rounded-md text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                          title="Berhentikan Karyawan AI"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className={`text-[11px] font-bold ${isSelected ? "text-indigo-600" : "text-slate-400"}`}>
                        Pilih &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Workspace: Penugasan Otonom (Kiri) vs Hasil Eksekusi & Dokumen (Kanan) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* KOLOM KIRI: FORM PERINTAH KERJA OTONOM */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Play className="w-4 h-4 text-indigo-600" />
                      <span>Instruksi Tugas Otonom</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ditugaskan kepada: <strong className="text-indigo-600">{selectedAgent?.name}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAgent?.isCustomAgent && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAgent(selectedAgent.id, selectedAgent.name)}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                        title="Berhentikan Staf AI Ini"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Berhentikan Staf</span>
                      </button>
                    )}
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      Autonomous
                    </span>
                  </div>
                </div>

                {/* Preset Tombol Cepat */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Pilihan Tugas Cepat:</label>
                  <div className="flex flex-col gap-1.5">
                    {selectedAgentId === "emp_bambang_sales" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setCurateModal(true)}
                          className="text-left px-3 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-950 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 transition flex items-center justify-between shadow-sm"
                        >
                          <span>✨ Kurasi Produk Baru ke Katalog</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono">Stok 0</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const txt = "Rancang penawaran harga (SPH) lengkap pemasangan 2 unit Smart Barrier Gate untuk PT. Krakatau Steel Perkasa.";
                            setInstruction(txt);
                            handleDispatchTask(txt);
                          }}
                          className="text-left px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 transition"
                        >
                          🚧 Buat SPH Barrier Gate PT. Krakatau Steel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const txt = "Buatkan penawaran harga (SPH) paket CCTV 8 channel Full HD untuk Cluster Perumahan Bukit Cilegon Asri.";
                            setInstruction(txt);
                            handleDispatchTask(txt);
                          }}
                          className="text-left px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 transition"
                        >
                          📹 Buat SPH Paket CCTV Perumahan
                        </button>
                      </>
                    )}

                    {selectedAgentId === "emp_dewi_finance" && (
                      <button
                        type="button"
                        onClick={() => {
                          const txt = "Audit seluruh faktur piutang penjualan klien yang sudah jatuh tempo dan berikan rekomendasi penagihan.";
                          setInstruction(txt);
                          handleDispatchTask(txt);
                        }}
                        className="text-left px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200 transition"
                      >
                        💰 Audit Piutang Jatuh Tempo & Rekomendasi
                      </button>
                    )}

                    {selectedAgentId === "emp_eko_maintenance" && (
                      <button
                        type="button"
                        onClick={() => {
                          const txt = "Terbitkan Surat Perintah Kerja (SPK) darurat untuk teknisi perbaikan loop detector barrier gate gerbang utama.";
                          setInstruction(txt);
                          handleDispatchTask(txt);
                        }}
                        className="text-left px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition"
                      >
                        🛠️ Terbitkan SPK Teknisi Perbaikan Gate
                      </button>
                    )}

                    {selectedAgentId === "emp_nadia_marketing" && (
                      <button
                        type="button"
                        onClick={() => {
                          const txt = "Rancang materi copywriting dan naskah video promosi instalasi barrier gate untuk media sosial resmi.";
                          setInstruction(txt);
                          handleDispatchTask(txt);
                        }}
                        className="text-left px-3 py-2 rounded-xl text-xs font-semibold bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200 transition"
                      >
                        🎬 Rancang Materi Promosi Barrier Gate
                      </button>
                    )}

                    {selectedAgent?.isCustomAgent && (
                      <button
                        type="button"
                        onClick={() => {
                          const txt = `Jalankan analisis mendalam dan koordinasi tugas ${selectedAgent.role || selectedAgent.name} secara komprehensif sesuai arahan SOP Direktur Utama.`;
                          setInstruction(txt);
                          handleDispatchTask(txt);
                        }}
                        className="text-left px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>⚡ Tugas Prioritas Otonom {selectedAgent.name}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Input Instruksi Bebas */}
                <div>
                  <label className="text-xs font-bold text-slate-700">Atau Tuliskan Instruksi Mandiri:</label>
                  <textarea
                    rows={4}
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Contoh: Tolong buatkan SPH resmi untuk pemasangan akses kontrol pintu sidik jari di kantor cabang Cilegon..."
                    className="w-full mt-1.5 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Tombol Eksekusi */}
                <button
                  type="button"
                  onClick={() => handleDispatchTask()}
                  disabled={isExecuting}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Agen Sedang Bekerja Secara Mandiri...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>🚀 Tugaskan Agen Secara Otonom</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* KOLOM KANAN: HASIL TINDAKAN NYATA & DRAF DOKUMEN */}
            <div className="lg:col-span-7 space-y-4">
              {selectedTaskDetail ? (
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          {selectedTaskDetail.documentGenerated?.title || "Hasil Tugas Otonom"}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500">
                          Nomor Dokumen: <strong className="text-indigo-600">{selectedTaskDetail.documentGenerated?.docNumber || selectedTaskDetail.id}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi Dokumen (PDF, WhatsApp, Salin) */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => copyDocument(selectedTaskDetail.documentGenerated?.content || selectedTaskDetail.resultSummary)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                        title="Salin Teks"
                      >
                        {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedDoc ? "Disalin!" : "Salin"}</span>
                      </button>

                      {selectedTaskDetail.documentGenerated && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPrintDocModal(selectedTaskDetail.documentGenerated)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak PDF Resmi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setWhatsappModal(selectedTaskDetail);
                              setTargetPhone("");
                              setWaNotice(null);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Kirim WhatsApp</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ringkasan Eksekusi */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                      Ringkasan Tindakan Agen ({selectedTaskDetail.agentName}):
                    </span>
                    <p className="font-semibold">{selectedTaskDetail.resultSummary}</p>
                  </div>

                  {/* TAMPILAN KHUSUS PRODUK KATALOG (STOK 0) */}
                  {selectedTaskDetail.documentGenerated?.type === "CATALOG_PRODUCT" && selectedTaskDetail.documentGenerated.content && (
                    <div className="border border-slate-200 rounded-3xl p-5 bg-gradient-to-br from-slate-50 to-indigo-50/20 space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <div className="w-48 h-48 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-md flex items-center justify-center p-2 relative">
                          <img
                            src={selectedTaskDetail.documentGenerated.content.image}
                            alt={selectedTaskDetail.documentGenerated.content.name}
                            className="w-full h-full object-contain"
                          />
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-900 text-white shadow">
                            Studio HD
                          </span>
                        </div>

                        <div className="space-y-2 flex-1 w-full">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                              {selectedTaskDetail.documentGenerated.content.category}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {selectedTaskDetail.documentGenerated.content.brand}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                              Stok: 0 (Aset Nol Pembukuan)
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900">
                            {selectedTaskDetail.documentGenerated.content.name}
                          </h3>

                          <div className="flex items-baseline gap-3">
                            <span className="text-lg font-black text-indigo-600 font-mono">
                              Rp {Number(selectedTaskDetail.documentGenerated.content.price || 0).toLocaleString("id-ID")}
                            </span>
                            <span className="text-xs text-slate-400 font-mono line-through">
                              Modal: Rp {Number(selectedTaskDetail.documentGenerated.content.costPrice || 0).toLocaleString("id-ID")}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-3">
                            {selectedTaskDetail.documentGenerated.content.desc}
                          </p>

                          <div className="flex items-center gap-2 pt-2 flex-wrap">
                            <Link
                              href="/shop"
                              target="_blank"
                              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1 shadow-sm"
                            >
                              <span>Lihat di Toko /shop</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            <Link
                              href="/admin/products"
                              target="_blank"
                              className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 border border-indigo-200 transition"
                            >
                              Admin Produk &rarr;
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAMPILAN KHUSUS DOKUMEN SPH */}
                  {selectedTaskDetail.documentGenerated?.type === "SPH" && selectedTaskDetail.documentGenerated.content && (
                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30 space-y-3 text-xs">
                      <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                        <div>
                          <span className="font-black text-slate-900 block">PT. DSTECH SMART PERKASA</span>
                          <span className="text-[10px] text-slate-500">Security System, Smart Automation &amp; IT Solutions</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-700 block">{selectedTaskDetail.documentGenerated.content.docNumber}</span>
                          <span className="text-[10px] text-slate-500">Tanggal: {selectedTaskDetail.documentGenerated.content.date}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-400 block font-bold text-[9px] uppercase">Kepada Yth:</span>
                          <strong className="text-slate-800">{selectedTaskDetail.documentGenerated.content.clientName}</strong>
                          <span className="text-slate-600 block">{selectedTaskDetail.documentGenerated.content.clientCompany}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold text-[9px] uppercase">Perihal Proyek:</span>
                          <strong className="text-slate-800">{selectedTaskDetail.documentGenerated.content.projectTitle}</strong>
                        </div>
                      </div>

                      {/* Tabel Rincian Barang */}
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                              <th className="p-2 text-center w-8">No</th>
                              <th className="p-2">Deskripsi Produk &amp; Jasa</th>
                              <th className="p-2 text-center">Qty</th>
                              <th className="p-2 text-right">Harga Satuan</th>
                              <th className="p-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedTaskDetail.documentGenerated.content.items || []).map((it: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-100">
                                <td className="p-2 text-center font-bold text-slate-400">{it.no || idx + 1}</td>
                                <td className="p-2 font-semibold text-slate-800">{it.item}</td>
                                <td className="p-2 text-center">{it.qty} {it.unit}</td>
                                <td className="p-2 text-right font-mono">Rp {Number(it.price || 0).toLocaleString("id-ID")}</td>
                                <td className="p-2 text-right font-mono font-bold">Rp {Number(it.total || 0).toLocaleString("id-ID")}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                            <tr>
                              <td colSpan={4} className="p-2 text-right">Subtotal:</td>
                              <td className="p-2 text-right font-mono">Rp {Number(selectedTaskDetail.documentGenerated.content.subtotal || 0).toLocaleString("id-ID")}</td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="p-2 text-right text-slate-500 font-semibold">PPN 11%:</td>
                              <td className="p-2 text-right font-mono text-slate-600">Rp {Number(selectedTaskDetail.documentGenerated.content.ppn || 0).toLocaleString("id-ID")}</td>
                            </tr>
                            <tr className="text-indigo-900 bg-indigo-50/50 text-xs">
                              <td colSpan={4} className="p-2 text-right font-black">Grand Total Penawaran:</td>
                              <td className="p-2 text-right font-mono font-black text-indigo-700">Rp {Number(selectedTaskDetail.documentGenerated.content.grandTotal || 0).toLocaleString("id-ID")}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <div className="text-[10px] text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                        <p><strong>Ketentuan Pembayaran:</strong> {selectedTaskDetail.documentGenerated.content.paymentTerms}</p>
                        <p><strong>Garansi Resmi:</strong> {selectedTaskDetail.documentGenerated.content.warranty}</p>
                        <p><strong>Catatan:</strong> {selectedTaskDetail.documentGenerated.content.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* TAMPILAN KHUSUS SPK TEKNISI */}
                  {selectedTaskDetail.documentGenerated?.type === "SPK" && selectedTaskDetail.documentGenerated.content && (
                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3 text-xs">
                      <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                        <div>
                          <strong className="text-slate-900 block font-black">PT. DSTECH SMART PERKASA - DIVISI OPERASIONAL</strong>
                          <span className="text-[10px] text-slate-500">Surat Perintah Kerja (SPK) Lapangan</span>
                        </div>
                        <span className="font-mono font-bold text-indigo-600">{selectedTaskDetail.documentGenerated.content.docNumber}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <p><strong>Teknisi Ditugaskan:</strong> {selectedTaskDetail.documentGenerated.content.technicianName}</p>
                        <p><strong>Jadwal Pelaksanaan:</strong> {selectedTaskDetail.documentGenerated.content.scheduledDate}</p>
                        <p><strong>Klien:</strong> {selectedTaskDetail.documentGenerated.content.clientName}</p>
                        <p><strong>Lokasi:</strong> {selectedTaskDetail.documentGenerated.content.location}</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Uraian Tugas:</span>
                        <p className="font-semibold text-slate-800">{selectedTaskDetail.documentGenerated.content.taskDescription}</p>
                      </div>
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                        <span className="text-[10px] font-bold text-amber-700 uppercase block">Standar K3 & SOP:</span>
                        <p className="font-medium text-[11px]">{selectedTaskDetail.documentGenerated.content.safetyRules}</p>
                      </div>
                    </div>
                  )}

                  {/* TAMPILAN KHUSUS AUDIT KEUANGAN */}
                  {selectedTaskDetail.documentGenerated?.type === "FINANCIAL_AUDIT" && selectedTaskDetail.documentGenerated.content && (
                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-rose-200">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">Faktur Tertunggak</span>
                          <strong className="text-xl font-black text-rose-600">
                            {selectedTaskDetail.documentGenerated.content.totalOverdueCount} Faktur
                          </strong>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-rose-200">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">Total Piutang Tertunggak</span>
                          <strong className="text-xl font-black text-rose-600">
                            Rp {Number(selectedTaskDetail.documentGenerated.content.totalOverdueAmount || 0).toLocaleString("id-ID")}
                          </strong>
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Rekomendasi Tindakan:</span>
                        <p className="font-semibold text-slate-800">{selectedTaskDetail.documentGenerated.content.recommendations}</p>
                      </div>
                    </div>
                  )}

                  {/* Alur Berpikir AI Agen (Thought Process) */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Catatan Alur Penalaran Agen (Thought Logs):
                    </span>
                    <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] space-y-1 max-h-40 overflow-y-auto">
                      {(selectedTaskDetail.thoughtProcess || []).map((th: string, idx: number) => (
                        <div key={idx} className="leading-relaxed">
                          {th}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Bot className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Belum Ada Tugas Aktif yang Dipilih</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Pilih preset perintah di sebelah kiri atau ketik instruksi mandiri, lalu klik <strong>Tugaskan Agen Secara Otonom</strong>.
                  </p>
                </div>
              )}

              {/* Riwayat Tugas Terakhir */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Riwayat Tugas Otonom Terakhir</span>
                </h4>

                <div className="space-y-2">
                  {recentTasks.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">Belum ada riwayat tugas otonom.</p>
                  ) : (
                    recentTasks.slice(0, 5).map((tsk) => (
                      <div
                        key={tsk.id}
                        onClick={() => setSelectedTaskDetail(tsk)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition flex items-center justify-between ${
                          selectedTaskDetail?.id === tsk.id
                            ? "bg-indigo-50/60 border-indigo-300"
                            : "bg-slate-50/50 hover:bg-slate-50 border-slate-200/60"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <strong className="text-slate-800 font-bold block">{tsk.instruction}</strong>
                          <span className="text-[10px] text-slate-500">
                            {tsk.agentName} &bull; {new Date(tsk.createdAt).toLocaleTimeString("id-ID")}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 hover:underline">
                          Lihat Draf &rarr;
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: JADWAL RUTIN OTONOM (AUTO-SCHEDULER) */}
      {activeTab === "scheduler" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Manajemen Jadwal Rutin Otonom (Auto-Scheduler)</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                Karyawan AI dapat menjalankan tugas otomatis secara berkala (harian / mingguan) tanpa perlu perintah manual dari direktur. Dokumen hasil kerja otonom otomatis dicatat ke riwayat tugas dan siap ditinjau.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setScheduleAgentId(agents[0]?.id || "emp_bambang_sales");
                setScheduleTitle("");
                setSchedulePattern("Setiap Hari, 08:30 WIB");
                setScheduleInstruction("");
                setAddScheduleModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-2 whitespace-nowrap cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>➕ Tambah Jadwal Rutin</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((sch) => {
              const isRunning = runningScheduleId === sch.id;
              return (
                <div
                  key={sch.id}
                  className={`p-6 rounded-3xl border transition-all space-y-4 bg-white ${
                    sch.enabled
                      ? "border-slate-200/90 shadow-sm"
                      : "border-slate-200/40 bg-slate-50/40 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                        {sch.department}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 mt-1">{sch.title}</h3>
                      <p className="text-xs font-semibold text-slate-600">
                        Penanggung Jawab: <strong className="text-slate-800">{sch.agentName}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSchedule(sch.id, sch.enabled)}
                      className="text-2xl transition hover:scale-105"
                      title={sch.enabled ? "Non-aktifkan Jadwal" : "Aktifkan Jadwal"}
                    >
                      {sch.enabled ? (
                        <ToggleRight className="w-8 h-8 text-emerald-600 inline" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-400 inline" />
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Instruksi Otonom:
                    </span>
                    <p className="text-slate-700 italic">"{sch.instruction}"</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Jadwal Pelaksanaan:</span>
                      <strong className="text-indigo-700 font-bold">{sch.schedulePattern}</strong>
                    </div>

                    <button
                      type="button"
                      disabled={isRunning}
                      onClick={() => handleRunScheduleNow(sch.id)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isRunning ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Mengeksekusi...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Jalankan Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>

                  {sch.lastRunAt && (
                    <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span>Terakhir dijalankan: {new Date(sch.lastRunAt).toLocaleString("id-ID")}</span>
                      <span className="text-emerald-600 font-bold">&bull; Sukses</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL CETAK PDF RESMI DENGAN KOP SURAT PT DSTECH SMART PERKASA */}
      {printDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            {/* Header Modal Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">Pratinjau Cetak PDF Resmi &bull; PT. DSTech Smart Perkasa</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintDocModal(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AREA DOKUMEN CETAK RESMI (BERKOP SURAT) */}
            <div className="p-8 md:p-12 text-slate-900 bg-white space-y-6 printable-document">
              {/* KOP SURAT RESMI */}
              <div className="border-b-4 border-double border-slate-900 pb-4 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                    DST
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">
                      PT. DSTECH SMART PERKASA
                    </h1>
                    <p className="text-xs font-semibold text-slate-600">
                      Smart Security Surveillance, Barrier Gate Automation &amp; IT Enterprise Solutions
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      SK Kemenkumham RI No. AHU-0012345.AH.01.01.Tahun 2026 &bull; NIB: 1234000567891 &bull; NPWP: 42.123.456.7-417.000
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Kawasan Bisnis Sentra Cilegon, Banten &bull; Email: support@dstechsmart.com &bull; Web: https://dstechsmart.com
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <QrCode className="w-12 h-12 text-slate-800 ml-auto" />
                  <span className="text-[9px] font-bold text-slate-400 block mt-1">Verifikasi Digital</span>
                </div>
              </div>

              {/* JUDUL DOKUMEN & METADATA */}
              <div className="text-center space-y-1">
                <h2 className="text-base font-black uppercase tracking-wider text-slate-950 underline decoration-indigo-600 decoration-2 underline-offset-4">
                  {printDocModal.type === "SPH" ? "SURAT PENAWARAN HARGA (SPH)" : printDocModal.title || "DOKUMEN RESMI"}
                </h2>
                <p className="text-xs font-mono font-bold text-slate-600">
                  Nomor: {printDocModal.content?.docNumber || printDocModal.docNumber}
                </p>
              </div>

              {/* TUJUAN SURAT */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Kepada Yth:</span>
                  <strong className="text-slate-900 text-sm font-black block">
                    {printDocModal.content?.clientName || "Bapak/Ibu Pimpinan"}
                  </strong>
                  <span className="text-slate-700 block font-semibold">
                    {printDocModal.content?.clientCompany || "Perusahaan Mitra"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Tanggal Terbit:</span>
                  <strong className="text-slate-800 block">
                    {printDocModal.content?.date || printDocModal.content?.issuedDate || new Date().toLocaleDateString("id-ID")}
                  </strong>
                  <span className="text-slate-500 block text-[11px]">
                    Masa Berlaku: {printDocModal.content?.validityDays || 14} Hari Kalender
                  </span>
                </div>
              </div>

              {/* TABEL ITEM SPH JIKA ADA */}
              {Array.isArray(printDocModal.content?.items) && (
                <div className="rounded-xl border border-slate-300 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <tr>
                        <th className="p-3 text-center w-10">No</th>
                        <th className="p-3">Uraian Spesifikasi Perangkat &amp; Jasa</th>
                        <th className="p-3 text-center w-20">Volume</th>
                        <th className="p-3 text-right w-32">Harga Satuan (Rp)</th>
                        <th className="p-3 text-right w-36">Jumlah (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printDocModal.content.items.map((it: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-3 text-center font-bold text-slate-500">{it.no || idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-800">{it.item || it.name}</td>
                          <td className="p-3 text-center">{it.qty} {it.unit}</td>
                          <td className="p-3 text-right font-mono">
                            {Number(it.price || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {Number(it.total || 0).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <tr>
                        <td colSpan={4} className="p-2.5 text-right text-slate-700">Subtotal:</td>
                        <td className="p-2.5 text-right font-mono">
                          Rp {Number(printDocModal.content.subtotal || 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="p-2.5 text-right text-slate-600">PPN (11%):</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          Rp {Number(printDocModal.content.ppn || 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                      <tr className="bg-indigo-50/60 text-indigo-950 font-black text-sm">
                        <td colSpan={4} className="p-3 text-right">TOTAL NILAI PENAWARAN:</td>
                        <td className="p-3 text-right font-mono text-indigo-700">
                          Rp {Number(printDocModal.content.grandTotal || 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* KETENTUAN PEMBAYARAN & GARANSI */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                  Syarat &amp; Ketentuan Teknis:
                </span>
                <p>&bull; <strong>Termin Pembayaran:</strong> {printDocModal.content?.paymentTerms || "DP 50%, Pelunasan 50% setelah serah terima pekerjaan (BAST)."}</p>
                <p>&bull; <strong>Garansi:</strong> {printDocModal.content?.warranty || "Garansi perangkat resmi 1 tahun, garansi instalasi 3 bulan."}</p>
                <p>&bull; <strong>Catatan:</strong> {printDocModal.content?.notes || "Harga sudah termasuk pengiriman, pemasangan teknisi, dan konfigurasi sistem."}</p>
              </div>

              {/* AREA TANDA TANGAN & STEMPEL DIGITAL */}
              <div className="grid grid-cols-2 gap-8 pt-6 text-xs text-center">
                <div>
                  <p className="text-slate-600 font-semibold">Disetujui Oleh,</p>
                  <strong className="block text-slate-900 mt-0.5">{printDocModal.content?.clientCompany || "Pihak Pemesan"}</strong>
                  <div className="h-20" />
                  <p className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                    ( .................................................. )
                  </p>
                </div>

                <div>
                  <p className="text-slate-600 font-semibold">Hormat Kami,</p>
                  <strong className="block text-slate-900 mt-0.5">PT. DSTECH SMART PERKASA</strong>
                  <div className="h-20 flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full border-2 border-emerald-600 text-emerald-700 font-black text-[10px] uppercase rotate-[-6deg] tracking-widest bg-emerald-50">
                      &bull; DIGITALLY SIGNED &bull;
                    </span>
                  </div>
                  <p className="border-t border-slate-400 pt-1 font-black text-slate-900">
                    Bambang Prakoso &bull; Commercial Consultant
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DISPATCH WHATSAPP */}
      {whatsappModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-sm text-slate-900">Kirim Dokumen via WhatsApp Klien</h3>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block">Nomor WhatsApp Tujuan:</label>
                <div className="relative mt-1">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    placeholder="Contoh: 081234567890 atau 6281234567890"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Format bebas (akan otomatis dinormalkan ke kode negara 62).
                </span>
              </div>

              {waNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{waNotice}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Dokumen yang Dikirim:</span>
                <p className="text-xs font-bold text-slate-900">
                  {whatsappModal.documentGenerated?.title || whatsappModal.title || "Dokumen Otonom"}
                </p>
                <span className="text-[10px] font-mono text-indigo-600 block">
                  {whatsappModal.documentGenerated?.docNumber || whatsappModal.id}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  disabled={waSending}
                  onClick={() => handleSendWhatsApp(false)}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka WhatsApp Web / App</span>
                </button>

                <button
                  type="button"
                  disabled={waSending || !targetPhone}
                  onClick={() => handleSendWhatsApp(true)}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                  title="Kirim otomatis melalui Gateway SmartPro WA"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gateway SmartPro</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL KURASI & TAMBAH PRODUK BARU KE KATALOG (STOK 0) */}
      {curateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-sm text-slate-900">Kurasi & Tambah Produk Baru ke Katalog</h3>
              </div>
              <button
                type="button"
                onClick={() => setCurateModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                  Kebijakan Stok & Aset:
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Stok produk baru akan <strong>secara ketat diatur 0</strong> agar tidak menambah nilai aset pada pembukuan keuangan perusahaan. AI akan membuatkan visual gambar studio HD ber-badge resmi DSTech.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Kategori Produk:</label>
                <select
                  value={curateCategory}
                  onChange={(e) => setCurateCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="Parking & Barrier System">Parking &amp; Barrier System</option>
                  <option value="Security System">Security System (CCTV &amp; Alarm)</option>
                  <option value="Access Control & Smart Lock">Access Control &amp; Smart Lock</option>
                  <option value="Smart Home & Automation">Smart Home &amp; Automation</option>
                  <option value="Jaringan & IT Infrastructure">Jaringan &amp; IT Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kata Kunci / Nama Produk Baru (Opsional):</label>
                <input
                  type="text"
                  value={curateKeyword}
                  onChange={(e) => setCurateKeyword(e.target.value)}
                  placeholder="Contoh: Mesin Barrier Gate Servo DC atau biarkan kosong untuk ide AI"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL Gambar Luar untuk Disalin & Dipercantik (Opsional):</label>
                <input
                  type="url"
                  value={curateExternalImage}
                  onChange={(e) => setCurateExternalImage(e.target.value)}
                  placeholder="https://contoh-supplier.com/gambar-produk.jpg (Opsional)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Jika dikosongkan, AI akan menghasilkan grafis visual berlatar studio bersih beresolusi tinggi secara otomatis.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isCurating}
                  onClick={handleCurateProduct}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCurating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>AI Sedang Mengurasi & Menambahkan Produk (Stok 0)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>🚀 Tambah Produk ke Katalog Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 4: REKRUT KARYAWAN AI OTONOM BARU */}
      {recruitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-950 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Rekrut Karyawan AI Otonom Baru</h3>
                  <p className="text-[11px] text-slate-300">Tambahkan staf AI spesialis baru dengan SOP & jadwal harian mandiri</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRecruitModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Preset Rekrut Cepat */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">⚡ Pilihan Cepat Spesialisasi (Klik untuk Mengisi Formulir Otomatis):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyRecruitPreset("LEGAL")}
                    className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-left transition cursor-pointer"
                  >
                    <span className="font-extrabold text-indigo-900 block text-[11px]">⚖️ Legal & Kontrak</span>
                    <span className="text-[10px] text-slate-500">Rian Ardiansyah, S.H.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyRecruitPreset("HRD")}
                    className="p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-left transition cursor-pointer"
                  >
                    <span className="font-extrabold text-pink-900 block text-[11px]">👥 HRD & SDM</span>
                    <span className="text-[10px] text-slate-500">Anisa Rahmawati, S.Psi.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyRecruitPreset("CYBER")}
                    className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left transition cursor-pointer"
                  >
                    <span className="font-extrabold text-sky-900 block text-[11px]">🛡️ IT Security</span>
                    <span className="text-[10px] text-slate-500">Bayu Pratama, S.Kom.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyRecruitPreset("RND")}
                    className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-left transition cursor-pointer"
                  >
                    <span className="font-extrabold text-teal-900 block text-[11px]">🔬 R&D Smart Gate</span>
                    <span className="text-[10px] text-slate-500">Dimas Suryo, S.T.</span>
                  </button>
                </div>
              </div>

              {/* Form Input Detail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Karyawan AI:</label>
                  <input
                    type="text"
                    value={recruitName}
                    onChange={(e) => setRecruitName(e.target.value)}
                    placeholder="Contoh: Rian Ardiansyah, S.H."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peran / Jabatan Resmi:</label>
                  <input
                    type="text"
                    value={recruitRole}
                    onChange={(e) => setRecruitRole(e.target.value)}
                    placeholder="Contoh: Legal Specialist & Contract Drafter"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Divisi / Departemen:</label>
                  <select
                    value={recruitDept}
                    onChange={(e) => setRecruitDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-xs"
                  >
                    <option value="HUKUM & LEGALITAS">Hukum & Legalitas</option>
                    <option value="SDM & KEPEGAWAIAN">SDM & Kepegawaian (HRD)</option>
                    <option value="IT & CYBER SECURITY">IT & Cyber Security</option>
                    <option value="RISET & PENGEMBANGAN">Riset & Pengembangan (R&D)</option>
                    <option value="SALES & COMMERCIAL">Sales & Commercial</option>
                    <option value="OPERASIONAL & LAPANGAN">Operasional & Lapangan</option>
                    <option value="KEUANGAN & PERPAJAKAN">Keuangan & Perpajakan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin Karakter 3D:</label>
                  <select
                    value={recruitGender}
                    onChange={(e) => setRecruitGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-xs"
                  >
                    <option value="male">👨 Pria (Jas & Kemeja)</option>
                    <option value="female">👩 Wanita (Blazer & Hijab/Rambut Rapi)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Warna Badge / Avatar:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={recruitColor}
                      onChange={(e) => setRecruitColor(e.target.value)}
                      className="w-10 h-10 p-1 rounded-xl border border-slate-200 cursor-pointer"
                    />
                    <span className="font-mono text-slate-600 text-xs font-bold">{recruitColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Spesialisasi & Keahlian Khusus (Pisahkan dengan Koma):</label>
                <input
                  type="text"
                  value={recruitSpecialties}
                  onChange={(e) => setRecruitSpecialties(e.target.value)}
                  placeholder="Contoh: Review Kontrak, Legal Drafting, Kepatuhan Regulasi, Analisis Perjanjian"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">System Prompt / SOP Perilaku Karyawan AI:</label>
                <textarea
                  rows={3}
                  value={recruitPrompt}
                  onChange={(e) => setRecruitPrompt(e.target.value)}
                  placeholder="Tuliskan kepribadian, standar operasional prosedur, dan tata cara staf AI merespons penugasan..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                />
              </div>

              {/* Seksi Auto-Scheduler Harian */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="font-black text-indigo-950 text-xs">Jadwal Tugas Rutin Otonom (Auto-Scheduler)</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recruitScheduleEnabled}
                      onChange={(e) => setRecruitScheduleEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="font-bold text-indigo-900 text-[11px]">Aktifkan Tugas Harian</span>
                  </label>
                </div>

                {recruitScheduleEnabled && (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-bold text-slate-700 block text-[11px] mb-1">Judul Tugas Rutin:</label>
                        <input
                          type="text"
                          value={recruitScheduleTitle}
                          onChange={(e) => setRecruitScheduleTitle(e.target.value)}
                          placeholder="Contoh: Audit Kepatuhan Kontrak Harian"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-200 focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block text-[11px] mb-1">Waktu Pelaksanaan Rutin:</label>
                        <select
                          value={recruitSchedulePattern}
                          onChange={(e) => setRecruitSchedulePattern(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-200 focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                        >
                          <option value="Setiap Hari, 08:00 WIB">Setiap Hari, 08:00 WIB</option>
                          <option value="Setiap Hari, 08:30 WIB">Setiap Hari, 08:30 WIB</option>
                          <option value="Setiap Hari, 16:30 WIB">Setiap Hari, 16:30 WIB (Tutup Kantor)</option>
                          <option value="Setiap Senin, 08:00 WIB">Setiap Senin, 08:00 WIB (Awal Pekan)</option>
                          <option value="Setiap Hari Kerja, 09:00 WIB">Setiap Hari Kerja, 09:00 WIB</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block text-[11px] mb-1">Instruksi Tugas Mandiri:</label>
                      <input
                        type="text"
                        value={recruitScheduleInstruction}
                        onChange={(e) => setRecruitScheduleInstruction(e.target.value)}
                        placeholder="Contoh: Periksa klausul kontrak draft pengadaan dan audit kepatuhan hukum transaksi."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-200 focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isRecruiting}
                  onClick={handleRecruitAgent}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRecruiting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mendaftarkan Staf AI & Menyiapkan Meja Kerja...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-emerald-200" />
                      <span>🚀 Rekrut & Tempatkan di Kantor Virtual DSTech</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: TAMBAH JADWAL RUTIN OTONOM (AUTO-SCHEDULER) */}
      {addScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-950 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Tambah Jadwal Rutin Otonom</h3>
                  <p className="text-[11px] text-slate-300">Konfigurasi tugas otomatis berkala untuk staf AI pilihan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddScheduleModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Karyawan AI Penanggung Jawab:</label>
                <select
                  value={scheduleAgentId}
                  onChange={(e) => setScheduleAgentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Jadwal Rutin:</label>
                <input
                  type="text"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder="Contoh: Audit Keamanan Jaringan & Port Server Harian"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pola Jadwal Pelaksanaan:</label>
                <select
                  value={schedulePattern}
                  onChange={(e) => setSchedulePattern(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="Setiap Hari, 08:00 WIB">Setiap Hari, 08:00 WIB</option>
                  <option value="Setiap Hari, 08:30 WIB">Setiap Hari, 08:30 WIB</option>
                  <option value="Setiap Hari, 16:30 WIB">Setiap Hari, 16:30 WIB (Rekap Sore)</option>
                  <option value="Setiap Senin, 08:00 WIB">Setiap Senin, 08:00 WIB (Awal Pekan)</option>
                  <option value="Setiap Hari Kerja, 09:00 WIB">Setiap Hari Kerja, 09:00 WIB</option>
                  <option value="Setiap Akhir Bulan, 17:00 WIB">Setiap Akhir Bulan, 17:00 WIB (Tutup Buku)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instruksi Otonom Khusus:</label>
                <textarea
                  rows={3}
                  value={scheduleInstruction}
                  onChange={(e) => setScheduleInstruction(e.target.value)}
                  placeholder="Contoh: Lakukan peninjauan log server, periksa integritas firewall barrier gate, dan catat temuan jika ada anomali."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSavingSchedule}
                  onClick={handleSaveSchedule}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingSchedule ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan Jadwal Otonom...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>💾 Simpan Jadwal Otonom Baru</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
