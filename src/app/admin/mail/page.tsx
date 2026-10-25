"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Mail,
  Send,
  Inbox,
  Trash2,
  Star,
  RefreshCw,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  UserPlus,
  Key,
  HardDrive,
  Clock,
  ArrowRight,
  Reply,
  X,
  FileText,
  Server,
  Lock,
  ShieldAlert,
  AlertTriangle,
  Paperclip,
  CornerUpRight,
} from "lucide-react";

interface MailAccount {
  id: string;
  email: string;
  username: string;
  domain: string;
  fullName: string;
  quotaMb: number;
  usedMb: number;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  description?: string;
}

interface MailMessage {
  id: string;
  accountEmail: string;
  folder: "inbox" | "sent" | "trash" | "spam";
  fromName: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  snippet: string;
  bodyHtml: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments?: boolean;
  isSpam?: boolean;
  spamScore?: number;
  spamReason?: string;
}

export default function AdminMailPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "compose" | "accounts">("inbox");
  const [currentFolder, setCurrentFolder] = useState<"inbox" | "sent" | "trash" | "spam">("inbox");
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [selectedAccountEmail, setSelectedAccountEmail] = useState<string>("");
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [spamCount, setSpamCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [alertInfo, setAlertInfo] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form Compose State
  const [showCc, setShowCc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [composeForm, setComposeForm] = useState({
    fromEmail: "",
    toEmail: "",
    ccEmail: "",
    subject: "",
    bodyText: "",
    attachments: [] as { name: string; size: number; type: string; content: string }[],
  });

  // Modal Create Account State
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({
    username: "",
    domain: "dstechsmart.com",
    fullName: "",
    password: "",
    quotaMb: 5120,
    description: "",
  });

  // Modal Change Password State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [targetAccountForPassword, setTargetAccountForPassword] = useState<MailAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");

  // Load Accounts
  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/mail/accounts");
      const json = await res.json();
      if (json.success && json.data) {
        setAccounts(json.data);
        if (!selectedAccountEmail && json.data.length > 0) {
          setSelectedAccountEmail(json.data[0].email);
          setComposeForm((prev) => ({ ...prev, fromEmail: json.data[0].email }));
        }
      }
    } catch (err) {
      console.error("Gagal memuat akun email:", err);
    }
  };

  // Load Messages
  const fetchMessages = async () => {
    if (!selectedAccountEmail) return;
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        accountEmail: selectedAccountEmail,
        folder: currentFolder,
        search: searchQuery,
      });
      const res = await fetch(`/api/mail/messages?${query.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMessages(json.data);
        setUnreadCount(json.unreadInboxCount || 0);
        setSpamCount(json.spamCount || 0);
        if (json.data.length > 0 && !selectedMessage) {
          setSelectedMessage(json.data[0]);
        } else if (json.data.length === 0) {
          setSelectedMessage(null);
        }
      }
    } catch (err) {
      console.error("Gagal memuat pesan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountEmail) {
      fetchMessages();
    }
  }, [selectedAccountEmail, currentFolder, searchQuery]);

  const showAlert = (type: "success" | "error", text: string) => {
    setAlertInfo({ type, text });
    setTimeout(() => setAlertInfo(null), 5000);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Mark message as read / toggle star
  const handleToggleRead = async (msg: MailMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch("/api/mail/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, isRead: !msg.isRead }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isRead: !m.isRead } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, isRead: !msg.isRead });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStar = async (msg: MailMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch("/api/mail/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, isStarred: !msg.isStarred }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isStarred: !m.isStarred } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, isStarred: !msg.isStarred });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSpam = async (msg: MailMessage, targetIsSpam: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch("/api/mail/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: msg.id,
          accountEmail: msg.accountEmail || selectedAccountEmail,
          folder: targetIsSpam ? "spam" : "inbox",
          isSpam: targetIsSpam,
          fromName: msg.fromName,
          fromEmail: msg.fromEmail,
          toEmail: msg.toEmail,
          subject: msg.subject,
          snippet: msg.snippet,
          bodyHtml: msg.bodyHtml,
          date: msg.date,
        }),
      });
      showAlert(
        "success",
        targetIsSpam
          ? "Pesan berhasil ditandai sebagai Spam dan dipindahkan ke folder Spam."
          : "Pesan berhasil ditandai Bukan Spam dan dipindahkan ke Kotak Masuk."
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({
          ...selectedMessage,
          isSpam: targetIsSpam,
          folder: targetIsSpam ? "spam" : "inbox",
          spamScore: targetIsSpam ? 100 : 0,
          spamReason: targetIsSpam ? "Ditandai manual sebagai Spam" : "Ditandai manual sebagai Bukan Spam",
        });
      }
      fetchMessages();
    } catch (err) {
      showAlert("error", "Gagal memperbarui status spam pesan.");
    }
  };

  const handleMoveToTrash = async (msg: MailMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const nextFolder = msg.folder === "trash" ? "inbox" : "trash";
      await fetch("/api/mail/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: msg.id,
          folder: nextFolder,
          accountEmail: msg.accountEmail || selectedAccountEmail,
        }),
      });
      showAlert(
        "success",
        nextFolder === "trash" ? "Pesan dipindahkan ke Kotak Sampah." : "Pesan dikembalikan ke Kotak Masuk."
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage(null);
      }
      fetchMessages();
    } catch (err) {
      showAlert("error", "Gagal memindahkan pesan.");
    }
  };

  const handleDeletePermanent = async (msgId: string) => {
    if (!confirm("Hapus pesan ini secara permanen dari server? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      const res = await fetch(`/api/mail/messages?id=${encodeURIComponent(msgId)}&accountEmail=${encodeURIComponent(selectedAccountEmail)}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showAlert("success", "Pesan berhasil dihapus permanen dari server.");
        setSelectedMessage(null);
        fetchMessages();
      }
    } catch (err) {
      showAlert("error", "Gagal menghapus pesan.");
    }
  };

  // Attachments Handler
  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 25 * 1024 * 1024) {
        showAlert("error", `Ukuran file ${file.name} melebihi batas 25MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64Content = reader.result as string;
        setComposeForm((prev) => ({
          ...prev,
          attachments: [
            ...prev.attachments,
            {
              name: file.name,
              size: file.size,
              type: file.type || "application/octet-stream",
              content: base64Content,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleRemoveAttachment = (idx: number) => {
    setComposeForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx),
    }));
  };

  // Send Email Handler
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.fromEmail || !composeForm.toEmail || !composeForm.subject || !composeForm.bodyText) {
      showAlert("error", "Harap lengkapi semua kolom email (Pengirim, Penerima, Subjek, dan Pesan).");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEmail: composeForm.fromEmail,
          toEmail: composeForm.toEmail,
          cc: composeForm.ccEmail || undefined,
          subject: composeForm.subject,
          bodyText: composeForm.bodyText,
          attachments: composeForm.attachments,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showAlert("success", `Email berhasil dikirim ke ${composeForm.toEmail}!`);
        setComposeForm({
          fromEmail: selectedAccountEmail || accounts[0]?.email || "",
          toEmail: "",
          ccEmail: "",
          subject: "",
          bodyText: "",
          attachments: [],
        });
        setShowCc(false);
        setActiveTab("inbox");
        setCurrentFolder("sent");
        fetchMessages();
      } else {
        showAlert("error", json.message || "Gagal mengirim email.");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Terjadi kesalahan saat mengirim email.");
    } finally {
      setIsSending(false);
    }
  };

  // Create Account Handler
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/mail/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccountForm),
      });
      const json = await res.json();
      if (json.success) {
        showAlert("success", json.message);
        setIsCreateAccountOpen(false);
        setNewAccountForm({
          username: "",
          domain: "dstechsmart.com",
          fullName: "",
          password: "",
          quotaMb: 5120,
          description: "",
        });
        fetchAccounts();
      } else {
        showAlert("error", json.message || "Gagal membuat akun email.");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Gagal membuat akun email.");
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccountForPassword || !newPasswordInput) return;
    try {
      const res = await fetch("/api/mail/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetAccountForPassword.email,
          newPassword: newPasswordInput,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showAlert("success", `Password untuk ${targetAccountForPassword.email} berhasil diubah.`);
        setIsChangePasswordOpen(false);
        setNewPasswordInput("");
        setTargetAccountForPassword(null);
      } else {
        showAlert("error", json.message || "Gagal memperbarui password.");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Gagal memperbarui password.");
    }
  };

  // Quick Reply
  const handleQuickReply = (msg: MailMessage) => {
    setComposeForm({
      fromEmail: msg.toEmail || selectedAccountEmail,
      toEmail: msg.fromEmail,
      ccEmail: "",
      subject: msg.subject.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`,
      bodyText: `\n\n--- Pada ${msg.date}, ${msg.fromName} (${msg.fromEmail}) menulis:\n> ${msg.snippet}`,
      attachments: [],
    });
    setActiveTab("compose");
  };

  // Forward Message
  const handleForwardMessage = (msg: MailMessage) => {
    setComposeForm({
      fromEmail: selectedAccountEmail || accounts[0]?.email || "",
      toEmail: "",
      ccEmail: "",
      subject: msg.subject.startsWith("Fwd:") ? msg.subject : `Fwd: ${msg.subject}`,
      bodyText: `\n\n---------- Pesan yang Diteruskan (Forwarded Message) ---------\nDari: ${msg.fromName} <${msg.fromEmail}>\nTanggal: ${msg.date}\nSubjek: ${msg.subject}\nKepada: ${msg.toEmail}\n\n${msg.snippet}`,
      attachments: [],
    });
    setActiveTab("compose");
  };

  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a.email === selectedAccountEmail) || accounts[0];
  }, [accounts, selectedAccountEmail]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-black tracking-wider uppercase inline-flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                DSTech Mail Suite v2.0
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                SMTP 465 & IMAP 993 Aktif
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Email & Webmail Center
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Pusat pengelolaan akun email resmi perusahaan, pengiriman email SMTP terenkripsi SSL, dan pemantauan pesan masuk real-time di lingkungan PT. DSTech Smart Perkasa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setActiveTab("compose");
                setComposeForm((prev) => ({
                  ...prev,
                  fromEmail: selectedAccountEmail || accounts[0]?.email || "",
                }));
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Tulis Email Baru</span>
            </button>
            <button
              onClick={() => setIsCreateAccountOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Buat Akun Email</span>
            </button>
            <a
              href="https://mail.dstechsmart.com:8443"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Buka Webmail Roundcube Standalone"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Webmail</span>
            </a>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="mt-6 pt-4 border-t border-indigo-900/50 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "inbox"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Kotak Surat & Pesan</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("compose")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "compose"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Tulis & Kirim Email</span>
          </button>
          <button
            onClick={() => setActiveTab("accounts")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "accounts"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kelola Akun Email Perusahaan ({accounts.length})</span>
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
      {alertInfo && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all shadow-sm ${
            alertInfo.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {alertInfo.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{alertInfo.text}</span>
          </div>
          <button onClick={() => setAlertInfo(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: KOTAK SURAT & PESAN (WEBMAIL CLIENT) */}
      {activeTab === "inbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm min-h-[640px]">
          {/* Sidebar Kiri: Akun Selector, Folder, Kuota */}
          <div className="lg:col-span-3 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 lg:pr-5">
            {/* Akun Selector Pill */}
            <div>
              <label className="text-[11px] font-black uppercase text-slate-400 block mb-1.5">
                Akun Email Aktif:
              </label>
              <select
                value={selectedAccountEmail}
                onChange={(e) => {
                  setSelectedAccountEmail(e.target.value);
                  setSelectedMessage(null);
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.email}>
                    {acc.email} ({acc.fullName})
                  </option>
                ))}
              </select>
            </div>

            {/* Tombol Tulis Cepat */}
            <button
              onClick={() => {
                setActiveTab("compose");
                setComposeForm((prev) => ({ ...prev, fromEmail: selectedAccountEmail }));
              }}
              className="w-full py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Tulis Email Baru</span>
            </button>

            {/* Folder Navigasi */}
            <div className="space-y-1 pt-2">
              <button
                onClick={() => {
                  setCurrentFolder("inbox");
                  setSelectedMessage(null);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  currentFolder === "inbox"
                    ? "bg-indigo-50 text-indigo-700 font-black shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-indigo-600" />
                  <span>Kotak Masuk (Inbox)</span>
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setCurrentFolder("sent");
                  setSelectedMessage(null);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  currentFolder === "sent"
                    ? "bg-indigo-50 text-indigo-700 font-black shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>Email Terkirim (Sent)</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentFolder("spam");
                  setSelectedMessage(null);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  currentFolder === "spam"
                    ? "bg-rose-50 text-rose-700 font-black shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Spam & Phishing</span>
                </span>
                {spamCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                    {spamCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setCurrentFolder("trash");
                  setSelectedMessage(null);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  currentFolder === "trash"
                    ? "bg-indigo-50 text-indigo-700 font-black shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Kotak Sampah (Trash)</span>
                </span>
              </button>
            </div>

            {/* Kuota Akun */}
            {selectedAccount && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                    Kapasitas Akun
                  </span>
                  <span className="font-mono text-[10px] text-slate-600 font-bold">
                    {selectedAccount.usedMb} MB / {selectedAccount.quotaMb} MB
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((selectedAccount.usedMb / selectedAccount.quotaMb) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Maildir server: <code className="text-slate-600 font-mono">/www/vmail/{selectedAccount.domain}/{selectedAccount.username}/</code>
                </p>
              </div>
            )}
          </div>

          {/* Panel Tengah: Daftar Email (Inbox/Sent List) */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 lg:pr-4 flex flex-col min-h-[480px]">
            {/* Search & Refresh */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari pengirim, subjek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <button
                onClick={fetchMessages}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                title="Muat Ulang Pesan"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* List Pesan */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[560px] pr-1">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  {isLoading ? "Memuat pesan email..." : "Tidak ada pesan di folder ini."}
                </div>
              ) : (
                messages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (!msg.isRead) handleToggleRead(msg);
                      }}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-200 shadow-xs"
                          : !msg.isRead
                          ? "bg-white border-slate-300 font-bold shadow-2xs hover:border-indigo-200"
                          : "bg-white/60 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-black text-slate-800 truncate">
                          {currentFolder === "sent" ? `Ke: ${msg.toEmail}` : msg.fromName || msg.fromEmail}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {msg.isSpam && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[9px] font-black">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              SPAM
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">
                            {msg.date.split(" ")[0]}
                          </span>
                        </div>
                      </div>
                      <p className={`text-xs mt-1 truncate ${!msg.isRead ? "text-indigo-950 font-black" : "text-slate-700"}`}>
                        {msg.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                        {msg.snippet}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(msg, e)}
                            className="hover:text-amber-500 cursor-pointer"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                msg.isStarred ? "text-amber-500 fill-amber-500" : "text-slate-300"
                              }`}
                            />
                          </button>
                          {!msg.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                          )}
                        </div>
                        <span className="font-mono text-[9px] text-slate-400">
                          {msg.date.split(" ")[1] || ""}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Panel Kanan: Reading Pane (Detail Pesan Terpilih) */}
          <div className="lg:col-span-5 flex flex-col min-h-[480px]">
            {selectedMessage ? (
              <div className="flex flex-col h-full space-y-4">
                {/* Header Action Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStar(selectedMessage)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 cursor-pointer"
                      title="Beri Tanda Bintang"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          selectedMessage.isStarred ? "text-amber-500 fill-amber-500" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleToggleRead(selectedMessage)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 cursor-pointer"
                      title={selectedMessage.isRead ? "Tandai Belum Dibaca" : "Tandai Sudah Dibaca"}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveToTrash(selectedMessage)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Pindahkan ke Sampah"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Tombol Tindakan Spam */}
                    {selectedMessage.isSpam || selectedMessage.folder === "spam" ? (
                      <button
                        onClick={() => handleToggleSpam(selectedMessage, false)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        title="Tandai Bukan Spam & Pindahkan ke Inbox"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bukan Spam</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleSpam(selectedMessage, true)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                        title="Tandai Sebagai Spam & Pindahkan ke Folder Spam"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                      </button>
                    )}

                    {selectedMessage.folder === "trash" && (
                      <button
                        onClick={() => handleDeletePermanent(selectedMessage.id)}
                        className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Hapus Permanen
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleForwardMessage(selectedMessage)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Teruskan pesan ini ke penerima lain"
                    >
                      <CornerUpRight className="w-3.5 h-3.5 text-slate-600" />
                      <span>Teruskan</span>
                    </button>
                    <button
                      onClick={() => handleQuickReply(selectedMessage)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Balas pesan ini"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Balas Pesan</span>
                    </button>
                  </div>
                </div>

                {/* Banner Peringatan Keamanan Spam */}
                {selectedMessage.isSpam && (
                  <div className="p-3.5 rounded-2xl bg-linear-to-r from-rose-50 to-amber-50 border border-rose-200 text-xs space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 shadow-xs">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-rose-900 flex items-center gap-2">
                            <span>Peringatan Keamanan: Terdeteksi Sebagai Spam / Phishing</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-800 text-[10px] font-black">
                              Skor Risiko: {selectedMessage.spamScore || 85}%
                            </span>
                          </h4>
                          <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                            {selectedMessage.spamReason || "Email ini terdeteksi memiliki pola penipuan, promosi agresif, atau pengirim berisiko."}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 italic">
                            ⚠️ Waspada: Jangan pernah mengklik tautan tidak dikenal atau memasukkan kata sandi Anda.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleSpam(selectedMessage, false)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-rose-300 text-rose-700 font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-all"
                      >
                        Bukan Spam
                      </button>
                    </div>
                  </div>
                )}

                {/* Info Pengirim & Subjek */}
                <div>
                  <h2 className="text-base font-black text-slate-900 leading-snug">
                    {selectedMessage.subject}
                  </h2>
                  <div className="mt-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800">
                        Dari: <span className="font-normal">{selectedMessage.fromName}</span>{" "}
                        <code className="text-slate-500 font-mono text-[11px]">&lt;{selectedMessage.fromEmail}&gt;</code>
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Kepada: <code className="text-slate-700 font-mono text-[11px]">{selectedMessage.toEmail}</code>
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {selectedMessage.date}
                    </span>
                  </div>
                </div>

                {/* Konten Isi Email (Rendered HTML) */}
                <div className="flex-1 p-4 rounded-2xl bg-white border border-slate-200 overflow-y-auto max-h-[380px] text-xs text-slate-800 leading-relaxed space-y-2 shadow-2xs">
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                    className="prose prose-sm max-w-none"
                  />
                </div>

                {/* Form Balas Cepat di Bawah */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Balas Cepat ke {selectedMessage.fromEmail}:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tulis balasan singkat..."
                      className="flex-1 p-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuickReply(selectedMessage)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Buka Editor Penuh
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <Mail className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-600">Pilih salah satu pesan untuk membaca</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pratinjau isi email resmi akan ditampilkan secara utuh di panel ini.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TULIS & KIRIM EMAIL (COMPOSE) */}
      {activeTab === "compose" && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                Tulis & Kirim Email Perusahaan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pesan akan dikirim langsung melalui server SMTP resmi DSTech Smart (Port 465 SSL Terenkripsi).
              </p>
            </div>
            <button
              onClick={() => setActiveTab("inbox")}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Akun Pengirim (From):
                </label>
                <select
                  value={composeForm.fromEmail}
                  onChange={(e) => setComposeForm({ ...composeForm, fromEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.email}>
                      {acc.email} ({acc.fullName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-700">
                    Alamat Penerima (To):
                  </label>
                  {!showCc && !composeForm.ccEmail && (
                    <button
                      type="button"
                      onClick={() => setShowCc(true)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      + Tambah CC
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  placeholder="contoh: klien@perusahaan.com"
                  value={composeForm.toEmail}
                  onChange={(e) => setComposeForm({ ...composeForm, toEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Kolom CC (Carbon Copy) */}
            {(showCc || composeForm.ccEmail) && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-700">
                    Tembusan (CC - Carbon Copy):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCc(false);
                      setComposeForm((prev) => ({ ...prev, ccEmail: "" }));
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    Tutup CC
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="contoh: manajer@dstechsmart.com, finance@dstechsmart.com"
                  value={composeForm.ccEmail}
                  onChange={(e) => setComposeForm({ ...composeForm, ccEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Pisahkan beberapa email tembusan dengan tanda koma (,).
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">
                Subjek Email:
              </label>
              <input
                type="text"
                placeholder="Tulis subjek atau perihal pesan resmi..."
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                required
              />
            </div>

            {/* Lampiran Berkas (Attachments) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Lampiran Pesan (Opsional):</span>
                </label>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleAttachmentSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Pilih & Unggah Berkas</span>
                </button>
              </div>

              {composeForm.attachments.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap gap-2 mt-2">
                  {composeForm.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 text-xs"
                    >
                      <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800 max-w-[180px] truncate">
                        {att.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(att.size / 1024).toFixed(0)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                        title="Hapus lampiran ini"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">
                Isi Pesan Email:
              </label>
              <textarea
                rows={12}
                placeholder="Tuliskan isi pesan, penawaran harga, instruksi proyek, atau balasan resmi..."
                value={composeForm.bodyText}
                onChange={(e) => setComposeForm({ ...composeForm, bodyText: e.target.value })}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none leading-relaxed font-sans"
                required
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                🔒 Enkripsi: <strong>SSL TLSv1.3</strong> (Server: <code className="font-mono">mail.dstechsmart.com:465</code>)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("inbox")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isSending ? "animate-spin" : ""}`} />
                  <span>{isSending ? "Mengirim Email..." : "Kirim Email Sekarang"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: KELOLA AKUN EMAIL PERUSAHAAN (EMAIL ACCOUNTS MANAGER) */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Akun Email Aktif</p>
                <p className="text-xl font-black text-slate-900">{accounts.length} Akun</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Status Server Mail</p>
                <p className="text-xl font-black text-emerald-600">Online 100%</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Alokasi Kuota</p>
                <p className="text-xl font-black text-slate-900">5.120 MB / Akun</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Protokol Keamanan</p>
                <p className="text-xl font-black text-purple-700">SSL / TLS</p>
              </div>
            </div>
          </div>

          {/* Tabel Akun Email */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  Daftar Akun Email Resmi Perusahaan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola alamat email, kuota mailbox, dan kredensial keamanan akun pada server mail VPS.
                </p>
              </div>
              <button
                onClick={() => setIsCreateAccountOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Akun Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400">
                    <th className="p-3">Alamat Email</th>
                    <th className="p-3">Nama Pemilik / Divisi</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Penggunaan Kuota</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-black text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-mono font-bold text-[10px]">
                            @
                          </span>
                          <span className="font-mono text-indigo-950 font-bold">{acc.email}</span>
                          {acc.isAdmin && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-slate-700">{acc.fullName}</td>
                      <td className="p-3 font-mono text-slate-500">{acc.domain}</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>{acc.usedMb} MB</span>
                            <span>{acc.quotaMb} MB</span>
                          </div>
                          <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, Math.round((acc.usedMb / acc.quotaMb) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                          Aktif
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setTargetAccountForPassword(acc);
                              setIsChangePasswordOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                            title="Ubah Password Email"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAccountEmail(acc.email);
                              setActiveTab("inbox");
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            Buka Kotak Surat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Parameter Server & Petunjuk Setting Email Client */}
          <div className="bg-linear-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white border border-indigo-900/40 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                Parameter Konfigurasi Email Client (Outlook, Thunderbird, Android / iPhone)
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Gunakan pengaturan berikut saat menyambungkan email ke aplikasi pihak ketiga di HP atau komputer Anda:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <p className="font-black text-indigo-200 uppercase text-[10px]">Server Masuk (Incoming IMAP):</p>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <p>Host: <strong className="text-white">mail.dstechsmart.com</strong></p>
                  <p>Port: <strong className="text-emerald-400">993</strong> (Enkripsi: SSL/TLS)</p>
                  <p>Username: <strong className="text-white">Alamat Email Lengkap</strong></p>
                </div>
                <button
                  onClick={() => copyToClipboard("mail.dstechsmart.com:993", "imap")}
                  className="mt-2 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "imap" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "imap" ? "Tersalin!" : "Salin Parameter IMAP"}</span>
                </button>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <p className="font-black text-indigo-200 uppercase text-[10px]">Server Keluar (Outgoing SMTP):</p>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <p>Host: <strong className="text-white">mail.dstechsmart.com</strong></p>
                  <p>Port: <strong className="text-emerald-400">465</strong> (Enkripsi: SSL/TLS)</p>
                  <p>Autentikasi: <strong className="text-white">Diperlukan (Username & Password)</strong></p>
                </div>
                <button
                  onClick={() => copyToClipboard("mail.dstechsmart.com:465", "smtp")}
                  className="mt-2 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "smtp" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "smtp" ? "Tersalin!" : "Salin Parameter SMTP"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: BUAT AKUN EMAIL BARU */}
      {isCreateAccountOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                Buat Akun Email Baru
              </h3>
              <button
                onClick={() => setIsCreateAccountOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Username Email & Domain:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="misal: sales, info, support"
                    value={newAccountForm.username}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, username: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    required
                  />
                  <select
                    value={newAccountForm.domain}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, domain: e.target.value })}
                    className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-slate-800"
                  >
                    <option value="dstechsmart.com">@dstechsmart.com</option>
                    <option value="dstechsmart.id">@dstechsmart.id</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Pemilik / Divisi:</label>
                <input
                  type="text"
                  placeholder="misal: Tim Sales DSTech"
                  value={newAccountForm.fullName}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password Akun Email:</label>
                <input
                  type="password"
                  placeholder="Masukkan password yang aman..."
                  value={newAccountForm.password}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, password: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alokasi Kuota Penyimpanan:</label>
                <select
                  value={newAccountForm.quotaMb}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, quotaMb: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option value={1024}>1 GB (1.024 MB)</option>
                  <option value={2048}>2 GB (2.048 MB)</option>
                  <option value={5120}>5 GB (5.120 MB) - Standar Perusahaan</option>
                  <option value={10240}>10 GB (10.240 MB) - Manajemen</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan / Deskripsi:</label>
                <input
                  type="text"
                  placeholder="Keterangan peruntukan akun email (opsional)"
                  value={newAccountForm.description}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAccountOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md cursor-pointer"
                >
                  Buat Akun Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UBAH PASSWORD AKUN */}
      {isChangePasswordOpen && targetAccountForPassword && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                Ubah Password Email
              </h3>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <p className="text-slate-600">
                Ubah password untuk akun: <strong className="text-indigo-900 font-mono">{targetAccountForPassword.email}</strong>
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password Baru:</label>
                <input
                  type="password"
                  placeholder="Ketik password baru yang kuat..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md cursor-pointer"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
