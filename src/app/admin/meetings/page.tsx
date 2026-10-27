"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Video,
  Plus,
  Users,
  Clock,
  Calendar,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Play,
  Square,
  Trash2,
  Edit,
  ShieldCheck,
  Sparkles,
  Smartphone,
  PhoneCall,
  Wrench,
  UserCheck,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle,
  Send,
  Radio,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
}

interface Meeting {
  id: string;
  roomCode: string;
  title: string;
  description: string;
  scheduledAt: string;
  status: "ACTIVE" | "UPCOMING" | "ENDED";
  meetingType: "INTERNAL_STAF" | "KONSULTASI_KLIEN" | "MAINTENANCE_SURVEY";
  hostName: string;
  hostRole: string;
  maxParticipants?: number;
  allowGuests?: boolean;
  requiresPassword?: boolean;
  jitsiRoomName: string;
  createdAt: string;
  participants?: Participant[];
}

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [selectedParticipantsMeeting, setSelectedParticipantsMeeting] = useState<Meeting | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "Sekarang (Instan)",
    meetingType: "INTERNAL_STAF" as "INTERNAL_STAF" | "KONSULTASI_KLIEN" | "MAINTENANCE_SURVEY",
    hostName: "Tim Manajemen PT. DSTech Smart Perkasa",
    hostRole: "ADMIN",
    customRoomCode: "",
    status: "ACTIVE" as "ACTIVE" | "UPCOMING" | "ENDED",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/meetings?t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMeetings(data.data);
      }
    } catch (e: any) {
      showToast("Gagal memuat data meeting: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingMeeting(null);
    setFormData({
      title: "",
      description: "",
      scheduledAt: "Hari ini, " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      meetingType: "INTERNAL_STAF",
      hostName: "Ahmad Dani (SPV Operasional)",
      hostRole: "SUPERADMIN",
      customRoomCode: "",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: Meeting) => {
    setEditingMeeting(m);
    setFormData({
      title: m.title,
      description: m.description,
      scheduledAt: m.scheduledAt,
      meetingType: m.meetingType,
      hostName: m.hostName,
      hostRole: m.hostRole,
      customRoomCode: m.roomCode,
      status: m.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Judul meeting wajib diisi", "error");
      return;
    }

    try {
      if (editingMeeting) {
        // Update via PATCH
        const res = await fetch("/api/meetings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingMeeting.id,
            roomCode: editingMeeting.roomCode,
            title: formData.title,
            description: formData.description,
            status: formData.status,
          }),
        });
        const resData = await res.json();
        if (resData.success) {
          showToast("Ruang rapat berhasil diperbarui");
          setIsModalOpen(false);
          fetchMeetings();
        } else {
          showToast(resData.error || "Gagal update rapat", "error");
        }
      } else {
        // Create via POST
        const res = await fetch("/api/meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            scheduledAt: formData.scheduledAt,
            meetingType: formData.meetingType,
            hostName: formData.hostName,
            hostRole: formData.hostRole,
            customRoomCode: formData.customRoomCode,
          }),
        });
        const resData = await res.json();
        if (resData.success) {
          showToast("Ruang rapat baru berhasil dibuat");
          setIsModalOpen(false);
          fetchMeetings();
        } else {
          showToast(resData.error || "Gagal membuat rapat baru", "error");
        }
      }
    } catch (err: any) {
      showToast("Terjadi kesalahan sistem: " + err.message, "error");
    }
  };

  const handleToggleStatus = async (m: Meeting, newStatus: "ACTIVE" | "ENDED") => {
    try {
      const res = await fetch("/api/meetings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: m.id,
          roomCode: m.roomCode,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status meeting diubah menjadi ${newStatus === "ACTIVE" ? "AKTIF" : "SELESAI"}`);
        fetchMeetings();
      }
    } catch (e: any) {
      showToast("Gagal mengubah status: " + e.message, "error");
    }
  };

  const handleDeleteMeeting = async (m: Meeting) => {
    if (!confirm(`Hapus ruang rapat "${m.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      const res = await fetch(`/api/meetings?id=${encodeURIComponent(m.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Ruang rapat berhasil dihapus");
        fetchMeetings();
      } else {
        showToast(data.error || "Gagal menghapus ruang", "error");
      }
    } catch (e: any) {
      showToast("Gagal menghapus: " + e.message, "error");
    }
  };

  const handleCopyLink = (roomCode: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://dstechsmart.com";
    const url = `${origin}/meeting/${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(roomCode);
    showToast("Tautan ruang rapat berhasil disalin ke clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsApp = (m: Meeting) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://dstechsmart.com";
    const url = `${origin}/meeting/${m.roomCode}`;
    const msg = `Halo Rekan Tim / Klien Terhormat,
Mari bergabung ke Ruang Video Meeting PT. DSTech Smart Perkasa:

📌 *Agenda*: ${m.title}
🕒 *Jadwal*: ${m.scheduledAt}
👤 *Host*: ${m.hostName}
📝 *Keterangan*: ${m.description}

🔗 *Tautan Langsung*: ${url}

_Bisa langsung dibuka di smartphone Android / browser Chrome tanpa perlu install aplikasi rumit. Terima kasih!_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Metrik KPI
  const activeCount = meetings.filter((m) => m.status === "ACTIVE").length;
  const upcomingCount = meetings.filter((m) => m.status === "UPCOMING").length;
  const totalParticipants = meetings.reduce((acc, curr) => acc + (curr.participants?.length || 0), 0);

  // Saring data berdasarkan input
  const filteredMeetings = meetings.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.hostName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || m.status === statusFilter;
    const matchType = typeFilter === "ALL" || m.meetingType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-white font-medium text-sm transition-all transform animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header Halaman & Tombol Aksi Cepat */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Video className="w-6 h-6" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-800/50">
              Smartphone Video Conference
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Video Meeting & Ruang Rapat Online
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Pusat koordinasi video interaktif smartphone untuk briefing teknisi lapangan, konsultasi survey proyek CCTV klien, dan bantuan darurat instalasi tanpa perlu instalasi aplikasi rumit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={fetchMeetings}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/meeting/bantuan-teknis-lapangan"
            target="_blank"
            className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Ruang Bantuan Darurat</span>
          </Link>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Ruang Rapat Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu KPI Metrik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Rapat Aktif (Live)</p>
            <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Terjadwal</p>
            <p className="text-2xl font-black text-blue-400">{upcomingCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Peserta Hadir</p>
            <p className="text-2xl font-black text-indigo-400">{totalParticipants}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Agenda</p>
            <p className="text-2xl font-black text-white">{meetings.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul rapat, kode room, atau host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2.5 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">Semua Status</option>
              <option value="ACTIVE" className="bg-slate-900 text-white">Aktif (Live)</option>
              <option value="UPCOMING" className="bg-slate-900 text-white">Terjadwal</option>
              <option value="ENDED" className="bg-slate-900 text-white">Selesai</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2.5 py-1.5 rounded-xl">
            <span className="text-[11px] text-slate-400 font-medium">Tipe:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">Semua Tipe</option>
              <option value="INTERNAL_STAF" className="bg-slate-900 text-white">Internal Staf</option>
              <option value="KONSULTASI_KLIEN" className="bg-slate-900 text-white">Konsultasi Klien</option>
              <option value="MAINTENANCE_SURVEY" className="bg-slate-900 text-white">Troubleshooting Lapangan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Daftar Kartu Ruang Meeting */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold">Memuat daftar video meeting...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <Video className="w-12 h-12 mx-auto text-slate-600 opacity-50" />
          <p className="text-sm font-bold text-slate-300">Tidak ada ruang rapat yang cocok</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Gunakan tombol &quot;Buat Ruang Rapat Baru&quot; di atas untuk membuat jadwal meeting staf atau survey online.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMeetings.map((m) => {
            const isLive = m.status === "ACTIVE";
            const participantCount = m.participants?.length || 0;

            const typeBadge = () => {
              switch (m.meetingType) {
                case "INTERNAL_STAF":
                  return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">👥 Internal Staf</span>;
                case "KONSULTASI_KLIEN":
                  return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">🤝 Konsultasi Klien</span>;
                case "MAINTENANCE_SURVEY":
                  return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">🛠️ Bantuan Lapangan</span>;
                default:
                  return null;
              }
            };

            return (
              <div
                key={m.id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Baris Atas: Badge Status & Tipe */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isLive ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          AKTIF LIVE
                        </span>
                      ) : m.status === "UPCOMING" ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          TERJADWAL
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          SELESAI
                        </span>
                      )}
                      {typeBadge()}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-semibold">{m.scheduledAt}</span>
                    </div>
                  </div>

                  {/* Judul & Deskripsi Agenda */}
                  <div>
                    <h2 className="text-base font-black text-white hover:text-indigo-400 transition-colors">
                      {m.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  {/* Info Host & Kode Room */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Host / Pimpinan</p>
                      <p className="font-bold text-slate-200 truncate">{m.hostName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Kode Room Smartphone</p>
                      <p className="font-mono font-bold text-indigo-400 truncate">/{m.roomCode}</p>
                    </div>
                  </div>

                  {/* Tombol Peserta */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedParticipantsMeeting(m)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      <span>{participantCount} Peserta Tercatat</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyLink(m.roomCode)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700"
                        title="Salin Link Room"
                      >
                        {copiedId === m.roomCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(m)}
                        className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-xs font-bold transition-all border border-emerald-500/30 flex items-center gap-1"
                        title="Bagikan via WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Kirim WA</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(m)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700"
                        title="Edit Rapat"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteMeeting(m)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold transition-all border border-rose-500/30"
                        title="Hapus Rapat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Baris Tombol Aksi Bawah */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {isLive ? (
                      <button
                        onClick={() => handleToggleStatus(m, "ENDED")}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Square className="w-3.5 h-3.5 text-rose-400" />
                        <span>Akhiri Rapat</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(m, "ACTIVE")}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Mulai / Aktifkan</span>
                      </button>
                    )}
                  </div>

                  <Link
                    href={`/meeting/${m.roomCode}`}
                    target="_blank"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Buka Ruang Video</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Buat / Edit Rapat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">
                  {editingMeeting ? "Edit Ruang Rapat" : "Buat Ruang Rapat Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Judul Agenda Rapat *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Briefing Pagi Teknisi & Koordinasi Lapangan"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tipe Pertemuan</label>
                  <select
                    value={formData.meetingType}
                    onChange={(e: any) => setFormData({ ...formData, meetingType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="INTERNAL_STAF">👥 Internal Staf / Teknisi</option>
                    <option value="KONSULTASI_KLIEN">🤝 Konsultasi Klien / Survey</option>
                    <option value="MAINTENANCE_SURVEY">🛠️ Troubleshooting Lapangan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: 08:30 WIB / Hari Ini"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nama Host / Penanggung Jawab</label>
                  <input
                    type="text"
                    value={formData.hostName}
                    onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kode Room (Slug URL)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      disabled={!!editingMeeting}
                      placeholder="Contoh: briefing-pagi"
                      value={formData.customRoomCode}
                      onChange={(e) => setFormData({ ...formData, customRoomCode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                    {!editingMeeting && (
                      <button
                        type="button"
                        onClick={() => {
                          const code = formData.title
                            ? formData.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 20) + "-" + Math.floor(100 + Math.random() * 900)
                            : "meeting-" + Math.floor(1000 + Math.random() * 9000);
                          setFormData({ ...formData, customRoomCode: code });
                        }}
                        className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-bold text-[11px]"
                        title="Generate Acak"
                      >
                        Acak
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Keterangan / Agenda Rapat</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan materi koordinasi, link dokumen pendukung, atau instruksi teknisi..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              {editingMeeting && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status Rapat</label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVE">Aktif (Live)</option>
                    <option value="UPCOMING">Terjadwal (Upcoming)</option>
                    <option value="ENDED">Selesai (Ended)</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30"
                >
                  {editingMeeting ? "Simpan Perubahan" : "Buat Ruang Rapat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Daftar Peserta Bergabung */}
      {selectedParticipantsMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white">
                  Daftar Peserta Bergabung
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-[280px]">
                  {selectedParticipantsMeeting.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedParticipantsMeeting(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {!selectedParticipantsMeeting.participants || selectedParticipantsMeeting.participants.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  Belum ada peserta yang bergabung ke ruang rapat ini.
                </p>
              ) : (
                selectedParticipantsMeeting.participants.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[11px] border border-indigo-500/30">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-bold text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(p.joinedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedParticipantsMeeting(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
