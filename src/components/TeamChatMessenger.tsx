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
}

export default function TeamChatMessenger({ currentUser, embeddedMode = false }: TeamChatMessengerProps) {
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

  // State Panggilan Audio / Video WebRTC
  const [activeCall, setActiveCall] = useState<any | null>(null);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [isCallingModalOpen, setIsCallingModalOpen] = useState(false);
  const [callTimer, setCallTimer] = useState(0);

  // State Form Bukti Pekerjaan Lapangan Cepat
  const [reportForm, setReportForm] = useState({
    ticketNumber: "",
    taskTitle: "",
    clientName: "",
    progressPercentage: 100,
    activityDescription: "",
    photoUrl: "/portfolio-industrial.png",
  });

  // State Buat Percakapan / Grup Baru
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

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

  // Polling Chat Messages dan Incoming Calls
  useEffect(() => {
    loadChats();
    const interval = setInterval(() => {
      if (activeChat?.id) {
        loadMessages(activeChat.id);
      }
      checkIncomingCall();
    }, 3500);
    return () => clearInterval(interval);
  }, [activeChat?.id, currentUser.id]);

  useEffect(() => {
    if (activeChat?.id) {
      loadMessages(activeChat.id);
    }
  }, [activeChat?.id]);

  // Cek Panggilan Masuk (Incoming Call)
  const checkIncomingCall = async () => {
    try {
      const res = await fetch(`/api/team-chat/call?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.success && data.incomingCall) {
        if (!incomingCall) {
          dstechCallAudio.startIncomingRingtone();
        }
        setIncomingCall(data.incomingCall);
      } else {
        if (incomingCall) {
          dstechCallAudio.stopCallAudio();
        }
        setIncomingCall(null);
      }
    } catch (err) {
      // silent
    }
  };

  // Timer panggilan aktif
  useEffect(() => {
    let timer: any = null;
    if (activeCall && activeCall.status === "connected") {
      timer = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(timer);
  }, [activeCall?.status]);

  // Load Data Perusahaan untuk Lampiran
  const loadCompanyData = async (type: "invoices" | "tasks" | "reports") => {
    try {
      const res = await fetch(`/api/team-chat?action=company_data&type=${type}&query=${encodeURIComponent(dataSearch)}`);
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

  // Mulai Panggilan (Audio atau Video)
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
        setActiveCall(data.call);
        setIsCallingModalOpen(true);
        // Bunyikan nada panggil keluar (dial tone)
        dstechCallAudio.startOutgoingDialtone();
        // Buka langsung ruang WebRTC dua arah
        const callUrl = `/meeting/${data.call.roomCode}?callType=${callType}&caller=${encodeURIComponent(currentUser.name)}&autoJoin=true`;
        window.open(callUrl, "_blank");
      }
    } catch (err) {
      console.error("Gagal memulai panggilan:", err);
    }
  };

  // Terima Panggilan Masuk
  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    dstechCallAudio.stopCallAudio();
    const roomCode = incomingCall.roomCode;
    const callType = incomingCall.callType;

    try {
      const res = await fetch("/api/team-chat/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          callId: incomingCall.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveCall(data.call);
        setIncomingCall(null);
        setIsCallingModalOpen(false);
        // Buka langsung ruang WebRTC audio/video call
        const callUrl = `/meeting/${roomCode}?callType=${callType}&caller=${encodeURIComponent(currentUser.name)}&autoJoin=true`;
        window.open(callUrl, "_blank");
      }
    } catch (err) {
      console.error("Gagal menerima panggilan:", err);
    }
  };

  // Tolak Panggilan Masuk
  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    dstechCallAudio.stopCallAudio();
    try {
      await fetch("/api/team-chat/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decline",
          callId: incomingCall.id,
        }),
      });
      setIncomingCall(null);
    } catch (err) {
      console.error("Gagal menolak panggilan:", err);
    }
  };

  // Akhiri Panggilan
  const handleEndCall = async () => {
    dstechCallAudio.stopCallAudio();
    if (!activeCall) return;
    try {
      await fetch("/api/team-chat/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "end",
          callId: activeCall.id,
          duration: callTimer,
        }),
      });
      setActiveCall(null);
      setIsCallingModalOpen(false);
      setCallTimer(0);
      if (activeChat?.id) loadMessages(activeChat.id);
    } catch (err) {
      console.error("Gagal mengakhiri panggilan:", err);
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
    <div className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative ${embeddedMode ? "h-[750px]" : "h-[calc(100vh-140px)]"}`}>
      {/* ================= INCOMING CALL NOTIFICATION BANNER / MODAL ================= */}
      {incomingCall && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 border-2 border-emerald-500/80 rounded-2xl p-4 shadow-2xl flex items-center gap-4 text-white animate-bounce backdrop-blur-md max-w-md w-full mx-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
            {incomingCall.callType === "video" ? <Video className="w-6 h-6" /> : <PhoneIncoming className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {incomingCall.callType === "video" ? "Panggilan Video Masuk..." : "Panggilan Suara Masuk..."}
            </p>
            <h4 className="font-bold text-white text-base truncate">{incomingCall.callerName}</h4>
            <p className="text-xs text-slate-400">Menghubungi Anda melalui DStech Connect</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAcceptCall}
              className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition shadow-lg flex items-center justify-center cursor-pointer"
              title="Terima Panggilan"
            >
              <PhoneCall className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeclineCall}
              className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition shadow-lg flex items-center justify-center cursor-pointer"
              title="Tolak Panggilan"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ================= ACTIVE CALL MODAL (WEBRTC AUDIO / VIDEO IN-APP) ================= */}
      {isCallingModalOpen && activeCall && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Background glowing aura */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 mb-4 shadow-xl shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-emerald-400">
                {activeCall.callType === "video" ? <Video className="w-10 h-10" /> : <Phone className="w-10 h-10" />}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">
              {activeCall.callerId === currentUser.id ? activeCall.receiverName : activeCall.callerName}
            </h3>
            <p className="text-sm text-emerald-400 font-medium mb-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              {activeCall.status === "connected"
                ? `Terhubung (${Math.floor(callTimer / 60)}:${(callTimer % 60).toString().padStart(2, "0")})`
                : "Memanggil..."}
            </p>

            {/* Video Preview or Audio Wave */}
            <div className="w-full bg-slate-950/80 rounded-2xl border border-slate-800 p-6 mb-6 flex flex-col items-center justify-center min-h-[220px]">
              {activeCall.callType === "video" ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-cyan-400 text-sm">
                    <Video className="w-5 h-5 animate-pulse" />
                    <span>Ruang Panggilan Video In-House Aktif</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-md">
                    Panggilan video WebRTC terhubung dengan enkripsi end-to-end lokal internal server DStech.
                  </p>
                  <Link
                    href={`/meeting/${activeCall.roomCode}`}
                    target="_blank"
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg transition"
                  >
                    <Maximize2 className="w-4 h-4" /> Buka Layar Penuh Video Call
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1.5 py-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                      <div
                        key={bar}
                        className="w-1.5 bg-emerald-500 rounded-full animate-pulse"
                        style={{
                          height: `${Math.sin(bar * 0.8) * 20 + 26}px`,
                          animationDelay: `${bar * 120}ms`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">Mikrofon HD Aktif (Suara Jernih Terenkripsi)</span>
                </div>
              )}
            </div>

            {/* Tombol Kontrol Panggilan */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleEndCall}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition transform hover:scale-105"
              >
                <PhoneOff className="w-5 h-5" /> Akhiri Panggilan
              </button>
            </div>
          </div>
        </div>
      )}

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
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-lg relative ${
                        isMe
                          ? "bg-emerald-950/80 border border-emerald-600/40 text-emerald-50 rounded-tr-none"
                          : "bg-slate-800/90 border border-slate-700 text-slate-100 rounded-tl-none"
                      }`}
                    >
                      {/* 1. Teks Biasa */}
                      {msg.content && (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap mb-1">
                          {msg.content}
                        </p>
                      )}

                      {/* 2. Kartu Lampiran INVOICE */}
                      {msg.type === "invoice" && msg.invoiceData && (
                        <div className="mt-2 p-3 bg-slate-900/90 border border-emerald-500/40 rounded-xl text-left">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" /> DOKUMEN INVOICE
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                              {msg.invoiceData.paymentStatus}
                            </span>
                          </div>
                          <h5 className="font-bold text-white text-xs mb-0.5">
                            {msg.invoiceData.invoiceNumber}
                          </h5>
                          <p className="text-[11px] text-slate-400 mb-2 truncate">
                            Klien: {msg.invoiceData.customerName}
                          </p>
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="text-[11px] text-slate-400">Total Tagihan:</span>
                            <span className="font-extrabold text-emerald-400">
                              Rp {Number(msg.invoiceData.grandTotal || 0).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <Link
                            href={`/admin/finance`}
                            className="mt-2.5 w-full py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                          >
                            <ExternalLink className="w-3 h-3" /> Buka Detail di Finance
                          </Link>
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
                    <div className="font-bold">Kirim Invoice / Tagihan</div>
                    <div className="text-[10px] text-slate-400">Lampirkan faktur keuangan ERP</div>
                  </div>
                </button>

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
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Deskripsi Aktivitas & Bukti Lapangan
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reportForm.activityDescription}
                    onChange={(e) => setReportForm({ ...reportForm, activityDescription: e.target.value })}
                    placeholder="Jelaskan pekerjaan yang telah diselesaikan secara detail..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs shadow-lg transition mt-2 cursor-pointer"
                >
                  Kirim Bukti Pekerjaan ke Chat
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
                            Rp {Number(inv.grandTotal || 0).toLocaleString("id-ID")}
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
    </div>
  );
}
