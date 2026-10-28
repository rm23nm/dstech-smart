"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Plus,
  FileText,
  ClipboardList,
  Camera,
  Check,
  CheckCheck,
  X,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  Clock,
  MapPin,
  ExternalLink,
  ChevronDown,
  User,
  Users,
  Building,
  DollarSign,
  Download,
  AlertCircle,
  Sparkles,
  Maximize2,
  MessageSquare,
  ArrowLeft,
  Lock,
  Unlock,
  CheckCircle2,
  ShieldAlert,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { dstechCallAudio } from "@/utils/dstech_call_audio";

interface TeamChatMessengerProps {
  currentUser: {
    id: string;
    name: string;
    role: string;
    phone?: string;
  };
  embeddedMode?: boolean; // Jika dipasang di dalam tab employee atau admin
  standaloneMobileApp?: boolean; // Mode murni mobile app (100% full-screen WhatsApp style)
}

export default function TeamChatMessenger({
  currentUser,
  embeddedMode = false,
  standaloneMobileApp = false,
}: TeamChatMessengerProps) {
  // State Percakapan
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [leftTab, setLeftTab] = useState<"chats" | "contacts">("chats");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // Fungsi memulai chat langsung dengan rekan tim
  const handleStartChatWithUser = async (targetUser: any) => {
    // Jika mengklik diri sendiri, abaikan
    if (targetUser.id === currentUser.id) return;

    // Cari apakah chat sudah ada di list
    const existing = chats.find(
      (c) =>
        !c.isGroup &&
        c.participants?.includes(targetUser.id) &&
        (c.participants?.includes(currentUser.id) || c.participants?.length === 2)
    );
    if (existing) {
      setActiveChat(existing);
      setLeftTab("chats");
      setMobileView("chat");
      return;
    }

    try {
      const res = await fetch("/api/team-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_chat",
          name: targetUser.name,
          isGroup: false,
          participants: [currentUser.id, targetUser.id],
        }),
      });
      const data = await res.json();
      if (data.success && data.chat) {
        setChats((prev) => [data.chat, ...prev]);
        setActiveChat(data.chat);
        setLeftTab("chats");
        setMobileView("chat");
      }
    } catch (err) {
      console.error("Gagal membuat obrolan:", err);
    }
  };

  // State Lampiran Menu
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachModalType, setAttachModalType] = useState<"invoice" | "task" | "report" | "media" | null>(null);

  // State Data Perusahaan untuk Lampiran
  const [companyInvoices, setCompanyInvoices] = useState<any[]>([]);
  const [companyTasks, setCompanyTasks] = useState<any[]>([]);
  const [companyReports, setCompanyReports] = useState<any[]>([]);
  const [dataSearch, setDataSearch] = useState("");

  // State Form Bukti Pekerjaan Lapangan Cepat
  const [reportForm, setReportForm] = useState({
    ticketNumber: "",
    taskTitle: "",
    clientName: "",
    progressPercentage: 100,
    activityDescription: "",
    photoUrl: "",
  });

  // State Upload Foto Bukti Lapangan & Kamera
  const [isUploadingReportPhoto, setIsUploadingReportPhoto] = useState(false);
  const [spkPhotoUrl, setSpkPhotoUrl] = useState<string>("");
  const [isUploadingSpkPhoto, setIsUploadingSpkPhoto] = useState(false);
  const reportCameraInputRef = useRef<HTMLInputElement>(null);
  const reportGalleryInputRef = useRef<HTMLInputElement>(null);
  const spkCameraInputRef = useRef<HTMLInputElement>(null);
  const spkGalleryInputRef = useRef<HTMLInputElement>(null);

  const handleUploadReportPhoto = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingReportPhoto(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docType", "daily_report");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setReportForm((prev) => ({ ...prev, photoUrl: data.url }));
      } else {
        alert(data.message || "Gagal mengunggah foto.");
      }
    } catch (err) {
      console.error("Gagal mengunggah foto:", err);
      alert("Terjadi kesalahan saat mengunggah foto bukti.");
    } finally {
      setIsUploadingReportPhoto(false);
    }
  };

  const handleUploadSpkPhoto = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingSpkPhoto(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docType", "spk_proof");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setSpkPhotoUrl(data.url);
      } else {
        alert(data.message || "Gagal mengunggah foto.");
      }
    } catch (err) {
      console.error("Gagal mengunggah foto:", err);
      alert("Terjadi kesalahan saat mengunggah foto bukti.");
    } finally {
      setIsUploadingSpkPhoto(false);
    }
  };

  // State Buat Percakapan / Grup Baru
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // State Proteksi PIN Keamanan Dokumen Invoice Klien
  const [unlockedInvoices, setUnlockedInvoices] = useState<Record<string, boolean>>({});
  const [invoicePinInput, setInvoicePinInput] = useState<Record<string, string>>({});
  const [invoicePinError, setInvoicePinError] = useState<Record<string, string>>({});

  // State Modal Interaktif Tindak Lanjut & Buka SPK Langsung dari Chat
  const [activeSpkModal, setActiveSpkModal] = useState<any | null>(null);
  const [spkStatus, setSpkStatus] = useState<string>("In Progress");
  const [spkProgress, setSpkProgress] = useState<number>(50);
  const [spkNotes, setSpkNotes] = useState<string>("");
  const [isUpdatingSpk, setIsUpdatingSpk] = useState<boolean>(false);

  const handleUnlockInvoice = (msgId: string) => {
    const pin = (invoicePinInput[msgId] || "").trim();
    if (pin === "1234" || pin === "8899" || pin === "2026") {
      setUnlockedInvoices((prev) => ({ ...prev, [msgId]: true }));
      setInvoicePinError((prev) => ({ ...prev, [msgId]: "" }));
    } else {
      setInvoicePinError((prev) => ({ ...prev, [msgId]: "PIN salah! Masukkan PIN otorisasi (Contoh: 1234)" }));
    }
  };

  const handleSaveSpkUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeSpkModal) return;
    setIsUpdatingSpk(true);
    try {
      await fetch("/api/employee/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeSpkModal.id,
          status: spkStatus,
          progress: spkProgress,
          notes: spkNotes,
          photoUrl: spkPhotoUrl || undefined,
          technician: currentUser.name,
        }),
      });

      // Kirim pesan konfirmasi update ke chat koordinasi
      if (activeChat) {
        await fetch("/api/team-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send_message",
            chatId: activeChat.id,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            type: "text",
            content: `📋 UPDATE SPK [${activeSpkModal.ticketNumber || activeSpkModal.title}]: Status diperbarui menjadi '${spkStatus}' (${spkProgress}%). ${spkPhotoUrl ? "📸 Foto bukti kerja dilampirkan." : ""} Catatan: ${spkNotes || "Telah ditindaklanjuti langsung di lapangan."}`,
          }),
        });
        loadChats();
        if (activeChat.id) loadMessages(activeChat.id);
      }
      setActiveSpkModal(null);
      setSpkPhotoUrl("");
    } catch (err) {
      console.error("Gagal mengupdate SPK:", err);
    } finally {
      setIsUpdatingSpk(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll ke pesan terbawah
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Chats & Users
  const loadChats = async () => {
    try {
      const res = await fetch(`/api/team-chat?action=chats&userId=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setChats(data.chats || []);
        setUsersList(data.users || []);

        // Sinkronisasi badge angka belum dibaca ke Navigasi Bawah Aplikasi Android
        try {
          const totalUnread = (data.chats || []).reduce((acc: number, c: any) => acc + (c.unread || 0), 0);
          if (typeof window !== "undefined" && (window as any).DStechNative?.updateUnreadMessages) {
            (window as any).DStechNative.updateUnreadMessages(totalUnread);
          }
        } catch (e) {}

        if (!activeChat && data.chats.length > 0) {
          setActiveChat(data.chats[0]);
        }
      }
    } catch (err) {
      console.error("Gagal memuat percakapan:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load Messages untuk Active Chat
  const loadMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/team-chat?action=messages&chatId=${chatId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Gagal memuat pesan:", err);
    }
  };

  // Polling Chat Messages
  useEffect(() => {
    loadChats();
    const interval = setInterval(() => {
      if (activeChat?.id) {
        loadMessages(activeChat.id);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [activeChat?.id, currentUser.id]);

  useEffect(() => {
    if (activeChat?.id) {
      loadMessages(activeChat.id);
    }
  }, [activeChat?.id]);

  // Load Data Perusahaan untuk Lampiran
  const loadCompanyData = async (type: "invoices" | "tasks" | "reports") => {
    try {
      const res = await fetch(
        `/api/team-chat?action=company_data&type=${type}&query=${encodeURIComponent(dataSearch)}&role=${encodeURIComponent(
          currentUser.role || "EMPLOYEE"
        )}&userName=${encodeURIComponent(currentUser.name || "")}`
      );
      const data = await res.json();
      if (data.success) {
        if (type === "invoices") setCompanyInvoices(data.data || []);
        if (type === "tasks") setCompanyTasks(data.data || []);
        if (type === "reports") setCompanyReports(data.data || []);
      }
    } catch (err) {
      console.error(`Gagal load data ${type}:`, err);
    }
  };

  useEffect(() => {
    if (attachModalType === "invoice") loadCompanyData("invoices");
    if (attachModalType === "task") loadCompanyData("tasks");
    if (attachModalType === "report") loadCompanyData("reports");
  }, [attachModalType, dataSearch]);

  // Kirim Pesan Teks Standar
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const textToSend = inputText.trim();
    setInputText("");

    try {
      const res = await fetch("/api/team-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          chatId: activeChat.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          type: "text",
          content: textToSend,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        loadChats();
      }
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
    }
  };

  // Kirim Lampiran Invoice
  const handleSendInvoice = async (invoice: any) => {
    if (!activeChat) return;
    try {
      const res = await fetch("/api/team-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          chatId: activeChat.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          type: "invoice",
          content: `Tagihan Faktur Penagihan Perusahaan:`,
          invoiceData: invoice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setAttachModalType(null);
        loadChats();
      }
    } catch (err) {
      console.error("Gagal kirim invoice:", err);
    }
  };

  // Kirim Lampiran Penugasan SPK
  const handleSendTask = async (task: any) => {
    if (!activeChat) return;
    try {
      const res = await fetch("/api/team-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          chatId: activeChat.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          type: "task",
          content: `Surat Perintah Kerja (SPK) Lapangan:`,
          taskData: task,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setAttachModalType(null);
        loadChats();
      }
    } catch (err) {
      console.error("Gagal kirim penugasan:", err);
    }
  };

  // Kirim Bukti Pekerjaan Lapangan (Daily Report)
  const handleSendReport = async (report: any) => {
    if (!activeChat) return;
    try {
      const res = await fetch("/api/team-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          chatId: activeChat.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          type: "daily_report",
          content: `Laporan Bukti Pekerjaan Lapangan:`,
          reportData: report,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setAttachModalType(null);
        loadChats();
      }
    } catch (err) {
      console.error("Gagal kirim laporan:", err);
    }
  };

  // Handle Form Submit Bukti Pekerjaan Baru
  const handleCustomReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendReport({
      id: `dstech_rep_${Date.now()}`,
      ticketNumber: reportForm.ticketNumber || `MTC-${new Date().getFullYear()}`,
      taskTitle: reportForm.taskTitle || "Pekerjaan Lapangan",
      clientName: reportForm.clientName || "Klien DStech",
      progressPercentage: reportForm.progressPercentage,
      activityDescription: reportForm.activityDescription,
      photoUrl: reportForm.photoUrl,
    });
  };

  // Mulai Panggilan Langsung (Audio atau Video)
  const handleStartCall = async (callType: "audio" | "video") => {
    if (!activeChat) return;
    const receiverId = activeChat.isGroup
      ? activeChat.participants.find((p: string) => p !== currentUser.id) || activeChat.participants[0]
      : activeChat.participants.find((p: string) => p !== currentUser.id) || currentUser.id;

    try {
      const res = await fetch("/api/team-chat/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initiate",
          callerId: currentUser.id,
          callerName: currentUser.name,
          receiverId,
          receiverName: activeChat.name,
          callType,
          chatId: activeChat.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.call) {
        // Langsung arahkan ke layar Panggilan Langsung 1-on-1 (Direct Voice/Video Call)
        const callUrl = `/direct-call/${data.call.roomCode}?callId=${data.call.id}&callType=${callType}&peerName=${encodeURIComponent(
          activeChat.name
        )}`;
        window.location.href = callUrl;
      }
    } catch (err) {
      console.error("Gagal memulai panggilan:", err);
    }
  };

  // Format Waktu WIB
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "";
    }
  };

  // Filter daftar chat
  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col bg-slate-950 relative overflow-hidden ${
        standaloneMobileApp
          ? "h-full w-full rounded-none border-0 shadow-none"
          : embeddedMode
          ? "h-[750px] border border-slate-800 rounded-2xl shadow-2xl"
          : "h-[calc(100vh-140px)] border border-slate-800 rounded-2xl shadow-2xl"
      }`}
    >
      {/* ================= MAIN CHAT INTERFACE (WHATSAPP WEB STYLE) ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL KIRI: DAFTAR KONTAK & THREAD CHAT */}
        <div className={`w-full md:w-96 border-r border-slate-800 bg-slate-950 flex flex-col ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
          {/* Header Panel Kiri */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{currentUser.name}</h3>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {currentUser.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Mulai Obrolan / Buat Grup Baru"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Filter: Obrolan vs Direktori Kontak Tim */}
          <div className="p-2 border-b border-slate-800 flex items-center gap-1 bg-slate-950/90">
            <button
              onClick={() => setLeftTab("chats")}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                leftTab === "chats"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Obrolan ({chats.length})</span>
            </button>
            <button
              onClick={() => setLeftTab("contacts")}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                leftTab === "contacts"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kontak Tim ({usersList.length})</span>
            </button>
          </div>

          {/* Search Bar Kontak / Obrolan */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={leftTab === "chats" ? "Cari percakapan..." : "Cari nama atau divisi rekan tim..."}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* List Percakapan ATAU List Kontak Tim */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
            {leftTab === "chats" ? (
              filteredChats.length > 0 ? (
                filteredChats.map((chat) => {
                  const isSelected = activeChat?.id === chat.id;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setActiveChat(chat);
                        setMobileView("chat");
                      }}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition select-none ${
                        isSelected
                          ? "bg-slate-850 border-l-4 border-emerald-500"
                          : "hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 font-bold overflow-hidden shadow">
                          {chat.isGroup ? (
                            <Users className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <User className="w-6 h-6 text-cyan-400" />
                          )}
                        </div>
                        {!chat.isGroup && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-white truncate">{chat.name}</h4>
                          <span className="text-[10px] text-slate-500">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate leading-relaxed">
                          {chat.lastMessage || "Mulai obrolan baru"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-500 space-y-3">
                  <p className="text-xs">Belum ada obrolan yang sesuai.</p>
                  <button
                    onClick={() => setLeftTab("contacts")}
                    className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold hover:bg-emerald-600/30 transition cursor-pointer"
                  >
                    Buka Direktori Rekan Tim ({usersList.length})
                  </button>
                </div>
              )
            ) : (
              /* TAB DIREKTORI KONTAK TIM */
              usersList
                .filter(
                  (u) =>
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (u.phone && u.phone.includes(searchQuery))
                )
                .map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const roleBadgeColor =
                    u.role === "SUPERADMIN"
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      : u.role === "ADMIN"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleStartChatWithUser(u)}
                      className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition ${
                        isCurrent ? "opacity-60 bg-slate-950/40" : "hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center text-white font-bold text-xs shadow">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            {u.name}
                            {isCurrent && <span className="text-[10px] text-slate-500">(Anda)</span>}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold border ${roleBadgeColor}`}>
                              {u.role}
                            </span>
                            {u.phone && (
                              <span className="text-[10px] text-slate-500 truncate">{u.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {!isCurrent && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartChatWithUser(u);
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                            title="Buka Chat"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* PANEL KANAN: CHAT ACTIVE / AREA OBROLAN */}
        {activeChat ? (
          <div className={`flex-1 flex flex-col bg-slate-900/40 relative ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
            {/* Header Ruang Obrolan */}
            <div className="p-3 px-3 md:px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-10">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                {/* Tombol Back Khusus Layar HP / Mobile Android */}
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="md:hidden p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer flex-shrink-0"
                  title="Kembali ke Daftar Percakapan"
                >
                  <ArrowLeft className="w-5 h-5 text-emerald-400" />
                </button>

                <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold flex-shrink-0">
                  {activeChat.isGroup ? (
                    <Users className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <User className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {activeChat.name}
                    {activeChat.isGroup && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-semibold">
                        Grup Tim
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeChat.isGroup
                      ? `${activeChat.participants?.length || 4} anggota koordinasi proyek`
                      : "Online | DStech Encrypted"}
                  </p>
                </div>
              </div>

              {/* Tombol Panggilan Suara & Video */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartCall("audio")}
                  className="p-2.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                  title="Panggilan Suara Langsung"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Panggilan</span>
                </button>
                <button
                  onClick={() => handleStartCall("video")}
                  className="p-2.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                  title="Panggilan Video HD"
                >
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Video Call</span>
                </button>
              </div>
            </div>

            {/* Area Pesan Chat (Bubble Messages) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-pattern">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    {/* Header bubble (Nama Pengirim jika di grup) */}
                    {!isMe && (
                      <span className="text-[10px] font-semibold text-emerald-400 mb-1 ml-1">
                        {msg.senderName} ({msg.senderRole})
                      </span>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-lg relative dstech-chat-bubble select-none ${
                        isMe
                          ? "bg-emerald-950/80 border border-emerald-600/40 text-emerald-50 rounded-tr-none"
                          : "bg-slate-800/90 border border-slate-700 text-slate-100 rounded-tl-none"
                      }`}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {/* 1. Teks Biasa */}
                      {msg.content && (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap mb-1 dstech-protected-message select-none">
                          {msg.content}
                        </p>
                      )}

                      {/* 2. Kartu Lampiran INVOICE (Dengan Proteksi PIN Klien) */}
                      {msg.type === "invoice" && msg.invoiceData && (
                        <div className="mt-2 p-3 bg-slate-900/90 border border-emerald-500/40 rounded-xl text-left">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" /> DOKUMEN INVOICE KLIEN
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                              {msg.invoiceData.paymentStatus}
                            </span>
                          </div>

                          {!unlockedInvoices[msg.id] && currentUser.role !== "SUPERADMIN" && currentUser.role !== "ADMIN" ? (
                            /* TAMPILAN TERKUNCI PIN */
                            <div className="py-2.5 px-3 bg-slate-950/80 border border-amber-500/30 rounded-lg text-center">
                              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
                                <Lock className="w-3.5 h-3.5" /> Dokumen Tagihan Terproteksi
                              </div>
                              <p className="text-[10px] text-slate-400 mb-2">
                                Masukkan PIN otorisasi untuk membuka rincian faktur ini:
                              </p>
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="password"
                                  maxLength={6}
                                  placeholder="PIN (1234)"
                                  value={invoicePinInput[msg.id] || ""}
                                  onChange={(e) =>
                                    setInvoicePinInput({ ...invoicePinInput, [msg.id]: e.target.value })
                                  }
                                  className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center text-xs text-white tracking-widest focus:border-amber-400 outline-none"
                                />
                                <button
                                  onClick={() => handleUnlockInvoice(msg.id)}
                                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
                                >
                                  Buka Kunci
                                </button>
                              </div>
                              {invoicePinError[msg.id] && (
                                <p className="text-[10px] text-rose-400 mt-1 font-medium">
                                  {invoicePinError[msg.id]}
                                </p>
                              )}
                            </div>
                          ) : (
                            /* TAMPILAN TERBUKA */
                            <div>
                              <h5 className="font-bold text-white text-xs mb-0.5">
                                {msg.invoiceData.invoiceNumber}
                              </h5>
                              <p className="text-[11px] text-slate-400 mb-2 truncate">
                                Klien: {msg.invoiceData.customerName}
                              </p>
                              <div className="flex items-center justify-between pt-1 text-xs">
                                <span className="text-[11px] text-slate-400">Total Tagihan:</span>
                                {currentUser.role === "ADMIN" || currentUser.role === "SUPERADMIN" || currentUser.role === "CLIENT" ? (
                                  <span className="font-extrabold text-emerald-400">
                                    Rp {Number(msg.invoiceData.grandTotal || 0).toLocaleString("id-ID")}
                                  </span>
                                ) : (
                                  <span className="font-bold text-slate-400 text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                    •••••••• (Internal Keuangan)
                                  </span>
                                )}
                              </div>
                              {(currentUser.role === "ADMIN" || currentUser.role === "SUPERADMIN") && (
                                <Link
                                  href={`/admin/finance`}
                                  className="mt-2.5 w-full py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                                >
                                  <ExternalLink className="w-3 h-3" /> Buka Detail di Finance
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. Kartu Lampiran SURAT PENUGASAN (SPK / TASK) */}
                      {msg.type === "task" && msg.taskData && (
                        <div className="mt-2 p-3 bg-slate-900/90 border border-cyan-500/40 rounded-xl text-left">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                            <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                              <ClipboardList className="w-3.5 h-3.5" /> SURAT PENUGASAN TEKNISI
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-bold">
                              {msg.taskData.priority} Priority
                            </span>
                          </div>
                          <h5 className="font-bold text-white text-xs mb-0.5">
                            {msg.taskData.title}
                          </h5>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate mb-1">
                            <Building className="w-3 h-3 text-slate-500" /> Klien: {msg.taskData.client}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate mb-2">
                            <MapPin className="w-3 h-3 text-slate-500" /> Lokasi: {msg.taskData.location}
                          </p>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                            <span className="text-slate-400">Teknisi: {msg.taskData.technician}</span>
                            <span className="text-cyan-400 font-semibold">{msg.taskData.status}</span>
                          </div>
                          {/* Tombol Interaktif Buka & Tindak Lanjuti SPK Langsung dari Chat */}
                          <button
                            onClick={() => {
                              setActiveSpkModal(msg.taskData);
                              setSpkStatus(msg.taskData.status || "In Progress");
                              setSpkProgress(msg.taskData.progress || 50);
                              setSpkNotes("");
                            }}
                            className="mt-2.5 w-full py-1.5 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" /> Buka & Tindak Lanjuti SPK
                          </button>
                        </div>
                      )}

                      {/* 4. Kartu Lampiran BUKTI PEKERJAAN LAPANGAN (DAILY REPORT) */}
                      {msg.type === "daily_report" && msg.reportData && (
                        <div className="mt-2 p-3 bg-slate-900/90 border border-teal-500/40 rounded-xl text-left">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                            <span className="text-[10px] font-bold text-teal-400 flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5" /> BUKTI PEKERJAAN SELESAI
                            </span>
                            <span className="text-[10px] font-extrabold text-teal-300">
                              Progres {msg.reportData.progressPercentage}%
                            </span>
                          </div>
                          {msg.reportData.photoUrl && (
                            <div className="relative w-full h-36 rounded-lg overflow-hidden mb-2 border border-slate-700">
                              <Image
                                src={msg.reportData.photoUrl}
                                alt="Bukti Pekerjaan"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <h5 className="font-bold text-white text-xs mb-1">
                            {msg.reportData.taskTitle} ({msg.reportData.clientName})
                          </h5>
                          <p className="text-[11px] text-slate-300 leading-relaxed italic bg-slate-950/60 p-2 rounded border border-slate-800">
                            &quot;{msg.reportData.activityDescription}&quot;
                          </p>
                        </div>
                      )}

                      {/* 5. Kartu RIWAYAT PANGGILAN */}
                      {msg.type === "call_log" && msg.callData && (
                        <div className="flex items-center gap-2 py-1 text-xs">
                          {msg.callData.callType === "video" ? (
                            <Video className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Phone className="w-4 h-4 text-emerald-400" />
                          )}
                          <span className="font-semibold">{msg.content}</span>
                          {msg.callData.duration ? (
                            <span className="text-slate-400 text-[10px]">
                              ({Math.floor(msg.callData.duration / 60)}m {msg.callData.duration % 60}s)
                            </span>
                          ) : null}
                        </div>
                      )}

                      {/* Footer Bubble: Timestamp & Centang */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                        <span>{formatTime(msg.timestamp)}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Menu Lampiran Data Perusahaan (Popup) */}
            {showAttachMenu && (
              <div className="absolute bottom-20 left-4 z-20 bg-slate-950 border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 w-64 animate-fadeIn backdrop-blur-lg">
                {(currentUser.role === "ADMIN" || currentUser.role === "SUPERADMIN") &&
                  activeChat &&
                  (activeChat.isProjectCoordination ||
                    activeChat.name?.toLowerCase().includes("klien") ||
                    activeChat.name?.toLowerCase().includes("pt ") ||
                    activeChat.name?.toLowerCase().includes("cv ") ||
                    activeChat.name?.toLowerCase().includes("client") ||
                    activeChat.name?.toLowerCase().includes("koordinasi")) && (
                  <button
                    onClick={() => {
                      setAttachModalType("invoice");
                      setShowAttachMenu(false);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white text-xs transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Kirim Invoice / Tagihan (Klien)</div>
                      <div className="text-[10px] text-slate-400">Lampirkan faktur keuangan ke klien</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setAttachModalType("task");
                    setShowAttachMenu(false);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white text-xs transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Kirim Penugasan (SPK)</div>
                    <div className="text-[10px] text-slate-400">Kirim tiket tugas teknisi</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setAttachModalType("report");
                    setShowAttachMenu(false);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white text-xs transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Kirim Bukti Pekerjaan</div>
                    <div className="text-[10px] text-slate-400">Kirim foto & progres lapangan</div>
                  </div>
                </button>
              </div>
            )}

            {/* Input Bar Footer Obrolan */}
            <div className="p-3 md:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2.5 rounded-xl transition cursor-pointer ${
                  showAttachMenu
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title="Lampirkan Dokumen Perusahaan (Invoice / SPK / Bukti Kerja)"
              >
                <Plus className="w-5 h-5" />
              </button>

              <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ketik pesan atau koordinasi tim..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl shadow-lg transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-950/40 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
            <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-3 text-emerald-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">DStech Connect Corporate Chat</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Pilih percakapan di sebelah kiri untuk mulai berkirim pesan teks, melampirkan invoice dan SPK penugasan, atau melakukan panggilan video/suara dengan tim.
            </p>
          </div>
        )}
      </div>

      {/* ================= MODAL PILIH DATA PERUSAHAAN (INVOICE / TASK / REPORT) ================= */}
      {attachModalType && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                {attachModalType === "invoice" && <FileText className="w-5 h-5 text-emerald-400" />}
                {attachModalType === "task" && <ClipboardList className="w-5 h-5 text-cyan-400" />}
                {attachModalType === "report" && <Camera className="w-5 h-5 text-teal-400" />}
                {attachModalType === "invoice" && "Pilih Faktur Invoice Perusahaan"}
                {attachModalType === "task" && "Pilih Surat Penugasan (SPK) Lapangan"}
                {attachModalType === "report" && "Kirim Bukti Pekerjaan Lapangan"}
              </h3>
              <button
                onClick={() => setAttachModalType(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Jika Modal Report: Form Input Bukti Pekerjaan */}
            {attachModalType === "report" ? (
              <form onSubmit={handleCustomReportSubmit} className="space-y-3.5 overflow-y-auto pr-1">
                {/* Hidden File Inputs untuk Kamera dan Galeri */}
                <input
                  ref={reportCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadReportPhoto(e.target.files[0]);
                    }
                  }}
                />
                <input
                  ref={reportGalleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadReportPhoto(e.target.files[0]);
                    }
                  }}
                />

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Judul Pekerjaan / Tugas
                  </label>
                  <input
                    type="text"
                    required
                    value={reportForm.taskTitle}
                    onChange={(e) => setReportForm({ ...reportForm, taskTitle: e.target.value })}
                    placeholder="Contoh: Instalasi CCTV Titik 01 Krakatau Posco"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Nama Klien
                    </label>
                    <input
                      type="text"
                      required
                      value={reportForm.clientName}
                      onChange={(e) => setReportForm({ ...reportForm, clientName: e.target.value })}
                      placeholder="PT. Krakatau Posco Energy"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Progres Pekerjaan (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={reportForm.progressPercentage}
                      onChange={(e) => setReportForm({ ...reportForm, progressPercentage: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Upload Foto Bukti Lapangan */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Lampiran Foto Bukti Pekerjaan</span>
                    {reportForm.photoUrl && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Foto Terpasang
                      </span>
                    )}
                  </label>

                  {reportForm.photoUrl ? (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-teal-500/50 group bg-slate-950">
                      <Image
                        src={reportForm.photoUrl}
                        alt="Bukti Pekerjaan"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => reportCameraInputRef.current?.click()}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" /> Ganti Foto
                        </button>
                        <button
                          type="button"
                          onClick={() => setReportForm((prev) => ({ ...prev, photoUrl: "" }))}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 border-2 border-dashed border-slate-800 hover:border-teal-500/60 rounded-2xl bg-slate-950/60 text-center transition">
                      {isUploadingReportPhoto ? (
                        <div className="py-3 flex flex-col items-center justify-center text-teal-400 gap-2">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-xs font-semibold">Mengunggah foto bukti ke server...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center">
                            <Camera className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white mb-0.5">Ambil atau Pilih Foto Bukti</p>
                            <p className="text-[10px] text-slate-400">Jepret foto langsung di lapangan atau unggah dari galeri</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => reportCameraInputRef.current?.click()}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" /> Ambil Kamera
                            </button>
                            <button
                              type="button"
                              onClick={() => reportGalleryInputRef.current?.click()}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" /> Dari Galeri
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Deskripsi Aktivitas & Bukti Lapangan
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={reportForm.activityDescription}
                    onChange={(e) => setReportForm({ ...reportForm, activityDescription: e.target.value })}
                    placeholder="Jelaskan pekerjaan yang telah diselesaikan secara detail..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploadingReportPhoto}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg transition mt-2 cursor-pointer"
                >
                  {isUploadingReportPhoto ? "Sedang Mengunggah Foto..." : "Kirim Bukti Pekerjaan ke Chat"}
                </button>
              </form>
            ) : (
              /* Modal Search & List Dokumen */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dataSearch}
                    onChange={(e) => setDataSearch(e.target.value)}
                    placeholder="Cari berdasarkan nomor atau nama klien..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {attachModalType === "invoice" &&
                    companyInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        onClick={() => handleSendInvoice(inv)}
                        className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <h5 className="font-bold text-white text-xs">{inv.invoiceNumber}</h5>
                          <p className="text-[11px] text-slate-400">{inv.customerName}</p>
                          <span className="text-[10px] text-emerald-400 font-semibold">{inv.paymentStatus}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-400 text-xs">
                            {currentUser.role === "ADMIN" || currentUser.role === "SUPERADMIN"
                              ? `Rp ${Number(inv.grandTotal || 0).toLocaleString("id-ID")}`
                              : "••••••••"}
                          </span>
                          <span className="block text-[10px] text-slate-500">{inv.date}</span>
                        </div>
                      </div>
                    ))}

                  {attachModalType === "task" &&
                    companyTasks.map((tsk) => (
                      <div
                        key={tsk.id}
                        onClick={() => handleSendTask(tsk)}
                        className="p-3 bg-slate-950 border border-slate-800 hover:border-cyan-500 rounded-xl cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <h5 className="font-bold text-white text-xs">{tsk.title}</h5>
                          <p className="text-[11px] text-slate-400">Klien: {tsk.client}</p>
                          <span className="text-[10px] text-cyan-400 font-semibold">{tsk.status}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-bold">
                            {tsk.priority}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-1">{tsk.technician}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL INTERAKTIF TINDAK LANJUT & UPDATE SPK ================= */}
      {activeSpkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Lembar Kerja & Update SPK</h3>
                  <p className="text-[11px] text-slate-400">Tanggapi dan perbarui status pekerjaan lapangan</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSpkModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Ringkasan SPK */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-cyan-500/20 text-cyan-300">
                    {activeSpkModal.ticketNumber || "SPK-DST"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Prioritas: {activeSpkModal.priority || "Normal"}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{activeSpkModal.title}</h4>
                <p className="text-slate-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" /> Klien: {activeSpkModal.client}
                </p>
                <p className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Lokasi: {activeSpkModal.location}
                </p>
                {activeSpkModal.scope && Array.isArray(activeSpkModal.scope) && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Rincian Pekerjaan:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-300 text-[11px]">
                      {activeSpkModal.scope.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Form Update Langsung */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Status Penanganan Pekerjaan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Pending", "In Progress", "Completed"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSpkStatus(st)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border transition ${
                          spkStatus === st
                            ? st === "Completed"
                              ? "bg-emerald-600/30 border-emerald-500 text-emerald-300"
                              : st === "In Progress"
                              ? "bg-cyan-600/30 border-cyan-500 text-cyan-300"
                              : "bg-amber-600/30 border-amber-500 text-amber-300"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {st === "Pending" ? "⏳ Menunggu" : st === "In Progress" ? "⚡ Dikerjakan" : "✓ Selesai"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-bold">Progres Penyelesaian</label>
                    <span className="text-cyan-400 font-extrabold">{spkProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={spkProgress}
                    onChange={(e) => setSpkProgress(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Catatan Teknisi / Kondisi Lapangan</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Perangkat sudah terpasang dan berfungsi normal, siap uji coba serah terima..."
                    value={spkNotes}
                    onChange={(e) => setSpkNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 outline-none resize-none"
                  />
                </div>

                {/* Upload Foto Bukti Pekerjaan Lapangan untuk SPK */}
                <div>
                  <input
                    ref={spkCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadSpkPhoto(e.target.files[0]);
                      }
                    }}
                  />
                  <input
                    ref={spkGalleryInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadSpkPhoto(e.target.files[0]);
                      }
                    }}
                  />
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                    <span>Foto Bukti Fisik / Dokumentasi Pekerjaan</span>
                    {spkPhotoUrl && (
                      <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Foto Terlampir
                      </span>
                    )}
                  </label>

                  {spkPhotoUrl ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-cyan-500/50 group bg-slate-950">
                      <Image
                        src={spkPhotoUrl}
                        alt="Bukti Pekerjaan"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => spkCameraInputRef.current?.click()}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                        >
                          <Camera className="w-3 h-3" /> Ganti
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpkPhotoUrl("")}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 border border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl bg-slate-950/60 flex items-center justify-between transition">
                      {isUploadingSpkPhoto ? (
                        <div className="w-full py-2 flex items-center justify-center text-cyan-400 gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">Mengunggah foto bukti...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-cyan-400" />
                            <span className="text-[11px] text-slate-400">Lampirkan foto hasil pemasangan/servis</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => spkCameraInputRef.current?.click()}
                              className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Camera className="w-3 h-3" /> Kamera
                            </button>
                            <button
                              type="button"
                              onClick={() => spkGalleryInputRef.current?.click()}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Upload className="w-3 h-3" /> Galeri
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setActiveSpkModal(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isUpdatingSpk}
                onClick={handleSaveSpkUpdate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingSpk ? "Menyimpan..." : "Simpan & Kirim Laporan ke Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
