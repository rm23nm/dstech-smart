"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Eye,
  AlertTriangle,
  Trash2,
  X,
  CreditCard,
  Plus,
  Edit3,
  Upload,
  Image as ImageIcon,
  FileText,
  Sliders,
  Sparkles,
  RefreshCw,
  Check,
} from "lucide-react";

export interface BankAccountItem {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch: string;
  isDefault?: boolean;
  status: "Aktif" | "Nonaktif";
  entityType?: "PT" | "NON_PT" | "ALL";
}

export interface LetterheadSettingsData {
  letterheadUrl: string;
  letterheadEnabled: boolean;
  watermarkOpacity: number;
  letterheadPaddingTop?: number;
  letterheadPaddingBottom?: number;
  letterheadFitMode?: "fill" | "cover" | "contain" | "bleed";
  signerName?: string;
  signerTitle?: string;
  masterSignatureUrl?: string;
  masterStampUrl?: string;

  // PT
  letterheadUrl_PT?: string;
  letterheadEnabled_PT?: boolean;
  watermarkOpacity_PT?: number;
  letterheadPaddingTop_PT?: number;
  letterheadPaddingBottom_PT?: number;
  signerName_PT?: string;
  signerTitle_PT?: string;

  // Non-PT
  letterheadUrl_NON_PT?: string;
  letterheadEnabled_NON_PT?: boolean;
  watermarkOpacity_NON_PT?: number;
  letterheadPaddingTop_NON_PT?: number;
  letterheadPaddingBottom_NON_PT?: number;
  signerName_NON_PT?: string;
  signerTitle_NON_PT?: string;
}

export interface SiteSettingsData {
  companyName: string;
  tagline: string;
  nib: string;
  npwp: string;
  whatsapp: string;
  whatsappDisplay: string;
  email: string;
  emailSupport: string;
  phone: string;
  address: string;
  googleMapsUrl: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  bankAccounts?: BankAccountItem[];
  letterheadSettings?: LetterheadSettingsData;
  updatedAt?: string;
}

export default function AdminSettingsPage() {
  // Tab Aktif Utama
  const [activeTab, setActiveTab] = useState<"profile" | "banks" | "letterhead" | "danger">("profile");

  const [settings, setSettings] = useState<SiteSettingsData>({
    companyName: "PT. DSTech Smart Perkasa",
    tagline: "Solusi Security System, Smart Automation & IT Infrastructure Handal",
    nib: "0123456789012",
    npwp: "01.234.567.8-417.000",
    whatsapp: "6282259494242",
    whatsappDisplay: "+62 822-5949-4242",
    email: "cs@dstechsmart.com",
    emailSupport: "support@dstechsmart.com",
    phone: "0822-5949-4242",
    address: "PERUM BUKIT CILEGON ASRI BLOK DB NO. 19, KEL. BAGENDUNG, KEC. CILEGON, KOTA CILEGON - BANTEN",
    googleMapsUrl: "https://maps.google.com/?q=Perum+Bukit+Cilegon+Asri+Cilegon+Banten",
    instagram: "https://instagram.com/dstechsmart",
    facebook: "https://facebook.com/dstechsmart",
    linkedin: "https://linkedin.com/company/dstechsmart",
  });

  // State Rekening Bank
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>([
    {
      id: "dstech_bank_1",
      bankName: "Bank BCA",
      accountNumber: "295-074-0321",
      accountHolder: "PT. DSTech Smart Perkasa",
      branch: "KCU Cilegon",
      isDefault: true,
      status: "Aktif",
      entityType: "PT",
    },
  ]);
  const [bankFilter, setBankFilter] = useState<"ALL" | "PT" | "NON_PT">("ALL");
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState<Omit<BankAccountItem, "id">>({
    bankName: "Bank BCA",
    accountNumber: "",
    accountHolder: "PT. DSTech Smart Perkasa",
    branch: "KCU Cilegon",
    isDefault: false,
    status: "Aktif",
    entityType: "PT",
  });

  // State Kop Surat
  const [letterheadTab, setLetterheadTab] = useState<"PT" | "NON_PT">("PT");
  const [letterheadConfig, setLetterheadConfig] = useState<LetterheadSettingsData>({
    letterheadUrl: "/kop_surat_dstech.jpg",
    letterheadUrl_PT: "/kop_surat_dstech.jpg",
    letterheadEnabled_PT: true,
    letterheadEnabled: true,
    watermarkOpacity: 0.15,
    watermarkOpacity_PT: 0.15,
    signerName: "RAMADHANI ST",
    signerName_PT: "RAMADHANI ST",
    signerTitle: "Direktur",
    signerTitle_PT: "Direktur",
    masterSignatureUrl: "",
    masterStampUrl: "",
    letterheadPaddingTop: 80,
    letterheadPaddingTop_PT: 80,
    letterheadPaddingBottom: 75,
    letterheadPaddingBottom_PT: 75,
    letterheadFitMode: "fill",

    letterheadUrl_NON_PT: "",
    letterheadEnabled_NON_PT: false,
    watermarkOpacity_NON_PT: 0.15,
    letterheadPaddingTop_NON_PT: 80,
    letterheadPaddingBottom_NON_PT: 75,
    signerName_NON_PT: "RAMADHANI ST",
    signerTitle_NON_PT: "Owner / Pengelola Usaha",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State Reset Data Transaksi Keuangan (Clean Slate)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "success", message: "" });
    }, 3500);
  };

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
        if (json.data.bankAccounts && Array.isArray(json.data.bankAccounts)) {
          setBankAccounts(json.data.bankAccounts);
        }
        if (json.data.letterheadSettings) {
          setLetterheadConfig((prev) => ({
            ...prev,
            ...json.data.letterheadSettings,
          }));
        }
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan:", err);
      showToast("error", "Gagal memuat pengaturan situs dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save all settings to API
  const handleSaveAll = async (
    customData?: Partial<SiteSettingsData>,
    successMsg: string = "Pengaturan situs berhasil disimpan."
  ) => {
    try {
      setSaving(true);
      const payload: SiteSettingsData = {
        ...settings,
        bankAccounts,
        letterheadSettings: letterheadConfig,
        ...(customData || {}),
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", successMsg);
        if (data.data) {
          setSettings(data.data);
          if (data.data.bankAccounts) setBankAccounts(data.data.bankAccounts);
          if (data.data.letterheadSettings) {
            setLetterheadConfig((prev) => ({ ...prev, ...data.data.letterheadSettings }));
          }
        }
      } else {
        showToast("error", data.message || "Gagal menyimpan pengaturan.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan koneksi saat menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  // Handler CRUD Bank Account
  const handleOpenAddBank = () => {
    setEditingBankId(null);
    setBankForm({
      bankName: "Bank BCA",
      accountNumber: "",
      accountHolder: bankFilter === "NON_PT" ? "RAMADHANI ST" : "PT. DSTech Smart Perkasa",
      branch: "KCU Cilegon",
      isDefault: bankAccounts.length === 0,
      status: "Aktif",
      entityType: bankFilter === "ALL" ? "PT" : bankFilter,
    });
    setIsBankModalOpen(true);
  };

  const handleOpenEditBank = (bank: BankAccountItem) => {
    setEditingBankId(bank.id);
    setBankForm({
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      accountHolder: bank.accountHolder,
      branch: bank.branch,
      isDefault: !!bank.isDefault,
      status: bank.status,
      entityType: bank.entityType || "PT",
    });
    setIsBankModalOpen(true);
  };

  const handleSaveBankForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.accountNumber || !bankForm.accountHolder) {
      showToast("error", "Nomor rekening dan nama pemilik wajib diisi!");
      return;
    }

    let updatedList: BankAccountItem[] = [];
    if (editingBankId) {
      // Edit
      updatedList = bankAccounts.map((b) => {
        if (b.id === editingBankId) {
          return { ...b, ...bankForm };
        }
        return bankForm.isDefault ? { ...b, isDefault: false } : b;
      });
    } else {
      // Add
      const newBank: BankAccountItem = {
        id: `dstech_bank_${Date.now()}`,
        ...bankForm,
      };
      if (bankForm.isDefault) {
        updatedList = [...bankAccounts.map((b) => ({ ...b, isDefault: false })), newBank];
      } else {
        updatedList = [...bankAccounts, newBank];
      }
    }

    setBankAccounts(updatedList);
    setIsBankModalOpen(false);
    handleSaveAll(
      { bankAccounts: updatedList },
      editingBankId ? "Rekening bank berhasil diperbarui!" : "Rekening bank baru berhasil ditambahkan!"
    );
  };

  const handleDeleteBank = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus rekening ${name}?`)) {
      const updatedList = bankAccounts.filter((b) => b.id !== id);
      setBankAccounts(updatedList);
      handleSaveAll({ bankAccounts: updatedList }, `Rekening ${name} berhasil dihapus.`);
    }
  };

  const handleToggleDefaultBank = (id: string) => {
    const updatedList = bankAccounts.map((b) => ({
      ...b,
      isDefault: b.id === id,
    }));
    setBankAccounts(updatedList);
    handleSaveAll({ bankAccounts: updatedList }, "Rekening utama (default) berhasil diperbarui!");
  };

  // Reset Data Transaksi Keuangan (Clean Slate)
  const handleResetTransactions = async () => {
    if (resetConfirmText.trim().toUpperCase() !== "RESET") {
      showToast("error", "Ketik kata 'RESET' untuk mengonfirmasi pembersihan transaksi");
      return;
    }
    try {
      setIsResetting(true);
      const res = await fetch("/api/finance?actionType=reset_transactions", {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", json.message || "Seluruh transaksi keuangan berhasil dibersihkan dari nol!");
        setIsResetModalOpen(false);
        setResetConfirmText("");
      } else {
        showToast("error", json.error || "Gagal mereset transaksi");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan saat mereset data transaksi.");
    } finally {
      setIsResetting(false);
    }
  };

  const filteredBanks = bankAccounts.filter((b) => {
    if (bankFilter === "ALL") return true;
    return (b.entityType || "PT") === bankFilter || b.entityType === "ALL";
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 text-dstech-blue font-black text-xs uppercase tracking-widest mb-1.5">
            <Settings className="w-4 h-4" />
            <span>Master Konfigurasi Perusahaan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Site Settings &amp; Legalitas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Kelola identitas resmi PT, rekening bank pembayaran, template kop surat resmi (PT &amp; Non-PT), serta kontak operasional terpusat.
          </p>
        </div>

        <button
          onClick={() => handleSaveAll(undefined, "Semua konfigurasi berhasil disimpan!")}
          disabled={saving}
          id="btn-save-settings-top"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-dstech-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all self-start md:self-auto cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? "Menyimpan..." : "Simpan Semua Pengaturan"}</span>
        </button>
      </div>

      {/* TAB NAVIGASI UTAMA SITE SETTINGS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏢 Profil &amp; Legalitas Perusahaan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("banks")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "banks"
              ? "bg-dstech-blue text-white shadow-md shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>💳 Rekening Bank Resmi ({bankAccounts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("letterhead")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "letterhead"
              ? "bg-purple-700 text-white shadow-md shadow-purple-700/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>📑 Kop Surat Dokumen (PT &amp; Non-PT)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("danger")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "danger"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "bg-white text-red-600 hover:bg-red-50 border border-red-200"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>⚠️ Zona Bahaya (Pembersihan)</span>
        </button>
      </div>

      {/* KONTEN TAB 1: PROFIL & LEGALITAS PERUSAHAAN */}
      {activeTab === "profile" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveAll(undefined, "Profil dan legalitas perusahaan berhasil disimpan!");
          }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Identitas PT */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">Identitas &amp; Legalitas PT</h3>
                  <p className="text-xs text-slate-400">Nama resmi badan usaha, tagline, dan nomor perizinan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Nama Badan Usaha / PT *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Tagline Perusahaan
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Nomor Induk Berusaha (NIB)
                  </label>
                  <input
                    type="text"
                    value={settings.nib}
                    onChange={(e) => setSettings({ ...settings, nib: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    NPWP Badan Usaha
                  </label>
                  <input
                    type="text"
                    value={settings.npwp}
                    onChange={(e) => setSettings({ ...settings, npwp: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Kontak Operasional */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">Kontak Resmi &amp; WhatsApp</h3>
                  <p className="text-xs text-slate-400">Saluran komunikasi yang terhubung ke tombol chat website</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    WhatsApp Api Link (Format: 628xxx) *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    WhatsApp Display Teks
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappDisplay}
                    onChange={(e) => setSettings({ ...settings, whatsappDisplay: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Email Resmi Perusahaan
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Telepon Kantor
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Alamat Kantor & Peta */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">Alamat Kantor Operasional</h3>
                  <p className="text-xs text-slate-400">Lokasi fisik kantor untuk surat-menyurat dan Google Maps</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Alamat Lengkap Kantor
                  </label>
                  <textarea
                    rows={3}
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Link Google Maps Lokasi
                  </label>
                  <input
                    type="text"
                    value={settings.googleMapsUrl}
                    onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3.5 rounded-2xl bg-dstech-blue hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Profil &amp; Legalitas</span>
              </button>
            </div>
          </div>

          {/* Right Column: Pratinjau Card */}
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl sticky top-28 space-y-5">
              <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-slate-400">
                <Eye className="w-4 h-4 text-dstech-blue" />
                <span>Pratinjau Footer Website</span>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <h4 className="font-black text-base sm:text-lg text-white leading-tight">
                    {settings.companyName || "PT. DSTech Smart Perkasa"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{settings.tagline}</p>
                </div>

                <div className="space-y-2 pt-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-dstech-red shrink-0 mt-0.5" />
                    <span>{settings.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-dstech-blue shrink-0" />
                    <span>{settings.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{settings.whatsappDisplay || settings.whatsapp}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Legalitas Resmi:
                  </span>
                  <p className="text-xs text-slate-400 font-mono">NIB: {settings.nib || "-"}</p>
                  <p className="text-xs text-slate-400 font-mono">NPWP: {settings.npwp || "-"}</p>
                </div>

                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all block text-center"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Test WhatsApp CS</span>
                </a>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* KONTEN TAB 2: REKENING BANK RESMI */}
      {activeTab === "banks" && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">Master Rekening Bank Resmi</h3>
                  <p className="text-xs text-slate-400">
                    Daftar rekening tujuan transfer pembayaran invoice/faktur (otomatis sinkron ke modul keuangan)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddBank}
                className="px-4 py-2.5 rounded-2xl bg-dstech-blue hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Rekening Bank</span>
              </button>
            </div>

            {/* Filter Entitas Bank */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBankFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bankFilter === "ALL"
                      ? "bg-slate-900 text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  🌐 Semua ({bankAccounts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBankFilter("PT")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bankFilter === "PT"
                      ? "bg-dstech-blue text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  🏢 Khusus PT ({bankAccounts.filter((b) => (b.entityType || "PT") === "PT").length})
                </button>
                <button
                  type="button"
                  onClick={() => setBankFilter("NON_PT")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bankFilter === "NON_PT"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  🏬 Khusus Non-PT ({bankAccounts.filter((b) => b.entityType === "NON_PT").length})
                </button>
              </div>

              <span className="text-[11px] text-slate-500">
                💡 Rekening berstatus <strong>Utama</strong> akan otomatis dipilih saat pembuatan tagihan faktur baru.
              </span>
            </div>

            {/* Daftar Grid Kartu Rekening */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBanks.map((bank) => (
                <div
                  key={bank.id}
                  className={`p-5 rounded-3xl border-2 transition-all relative flex flex-col justify-between gap-4 ${
                    bank.isDefault
                      ? "bg-blue-50/50 border-dstech-blue/60 shadow-md shadow-blue-500/5"
                      : "bg-slate-50/60 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-base">{bank.bankName}</span>
                        {bank.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-dstech-blue text-white shadow-xs">
                            Utama
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          bank.entityType === "NON_PT"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-blue-100 text-blue-800 border border-blue-300"
                        }`}
                      >
                        {bank.entityType === "NON_PT" ? "Non-PT" : "PT"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <p className="text-lg font-mono font-black text-slate-900 tracking-wider">
                        {bank.accountNumber}
                      </p>
                      <p className="text-xs font-bold text-slate-700">{bank.accountHolder}</p>
                      <p className="text-[11px] text-slate-500">{bank.branch}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleDefaultBank(bank.id)}
                      disabled={bank.isDefault}
                      className={`text-[11px] font-bold transition-colors cursor-pointer ${
                        bank.isDefault ? "text-emerald-600 font-black cursor-default" : "text-slate-500 hover:text-dstech-blue underline"
                      }`}
                    >
                      {bank.isDefault ? "✓ Rekening Utama" : "Set Jadi Utama"}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBank(bank)}
                        className="p-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-700 cursor-pointer transition-colors"
                        title="Ubah Rincian Rekening"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBank(bank.id, bank.bankName)}
                        className="p-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer transition-colors"
                        title="Hapus Rekening"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredBanks.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
                  <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold">Belum ada rekening bank yang terdaftar untuk filter ini.</p>
                  <button
                    type="button"
                    onClick={handleOpenAddBank}
                    className="px-4 py-2 rounded-xl bg-dstech-blue text-white text-xs font-bold cursor-pointer"
                  >
                    + Tambah Rekening Pertama
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KONTEN TAB 3: KOP SURAT DOKUMEN (PT & NON-PT) */}
      {activeTab === "letterhead" && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">Template Kop Surat Resmi Perusahaan</h3>
                  <p className="text-xs text-slate-400">
                    Konfigurasi gambar kop surat resmi A4, margin header, mode pemasangan, dan penandatangan dokumen
                  </p>
                </div>
              </div>

              {/* Tab Entitas PT vs Non-PT */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setLetterheadTab("PT")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    letterheadTab === "PT"
                      ? "bg-dstech-blue text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🏢 Entitas PT
                </button>
                <button
                  type="button"
                  onClick={() => setLetterheadTab("NON_PT")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    letterheadTab === "NON_PT"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🏬 Entitas Non-PT
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Kolom Kiri: Form Pengaturan Kop (7 Kolom) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Toggle Aktifkan Kop */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-900 text-xs sm:text-sm">
                      Aktifkan Kop Surat Resmi Bergambar ({letterheadTab === "PT" ? "PT" : "Non-PT"})
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kop surat akan otomatis dijadikan latar belakang lembar cetak A4 (Faktur, SPH, Surat Jalan, BAST).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={
                      letterheadTab === "NON_PT"
                        ? letterheadConfig.letterheadEnabled_NON_PT ?? false
                        : letterheadConfig.letterheadEnabled_PT ?? letterheadConfig.letterheadEnabled ?? true
                    }
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (letterheadTab === "NON_PT") {
                        setLetterheadConfig({ ...letterheadConfig, letterheadEnabled_NON_PT: checked });
                      } else {
                        setLetterheadConfig({
                          ...letterheadConfig,
                          letterheadEnabled_PT: checked,
                          letterheadEnabled: checked,
                        });
                      }
                    }}
                    className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>

                {/* 2. Upload / Path Gambar Kop Surat */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Unggah Gambar Kop Surat ({letterheadTab === "PT" ? "PT" : "Non-PT"})
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-2 border border-purple-200 cursor-pointer transition-colors shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>Pilih Berkas Kop (PNG / JPG / WebP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              if (letterheadTab === "NON_PT") {
                                setLetterheadConfig({
                                  ...letterheadConfig,
                                  letterheadUrl_NON_PT: result,
                                  letterheadEnabled_NON_PT: true,
                                });
                              } else {
                                setLetterheadConfig({
                                  ...letterheadConfig,
                                  letterheadUrl_PT: result,
                                  letterheadUrl: result,
                                  letterheadEnabled_PT: true,
                                  letterheadEnabled: true,
                                });
                              }
                              showToast("success", `Gambar kop surat ${letterheadTab} berhasil diunggah!`);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {letterheadTab === "PT" && (
                      <button
                        type="button"
                        onClick={() => {
                          setLetterheadConfig({
                            ...letterheadConfig,
                            letterheadUrl: "/kop_surat_dstech.jpg",
                            letterheadUrl_PT: "/kop_surat_dstech.jpg",
                            letterheadEnabled_PT: true,
                            letterheadEnabled: true,
                          });
                          showToast("success", "Kop surat PT di-reset ke berkas bawaan /kop_surat_dstech.jpg");
                        }}
                        className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset ke Default PT</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Path / URL Gambar Kop Surat:
                    </label>
                    <input
                      type="text"
                      value={
                        letterheadTab === "NON_PT"
                          ? letterheadConfig.letterheadUrl_NON_PT || ""
                          : letterheadConfig.letterheadUrl_PT || letterheadConfig.letterheadUrl || ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (letterheadTab === "NON_PT") {
                          setLetterheadConfig({ ...letterheadConfig, letterheadUrl_NON_PT: val });
                        } else {
                          setLetterheadConfig({
                            ...letterheadConfig,
                            letterheadUrl_PT: val,
                            letterheadUrl: val,
                          });
                        }
                      }}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder={letterheadTab === "NON_PT" ? "Contoh: /kop_surat_nonpt.jpg" : "/kop_surat_dstech.jpg"}
                    />
                  </div>
                </div>

                {/* 3. Margin Jarak Dokumen (Padding Top & Bottom) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Margin Atas (Padding Top):</span>
                      <span className="font-mono text-purple-700 font-black">
                        {(letterheadTab === "NON_PT"
                          ? letterheadConfig.letterheadPaddingTop_NON_PT
                          : letterheadConfig.letterheadPaddingTop_PT || letterheadConfig.letterheadPaddingTop) || 80}
                        px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="180"
                      step="5"
                      value={
                        (letterheadTab === "NON_PT"
                          ? letterheadConfig.letterheadPaddingTop_NON_PT
                          : letterheadConfig.letterheadPaddingTop_PT || letterheadConfig.letterheadPaddingTop) || 80
                      }
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (letterheadTab === "NON_PT") {
                          setLetterheadConfig({ ...letterheadConfig, letterheadPaddingTop_NON_PT: val });
                        } else {
                          setLetterheadConfig({
                            ...letterheadConfig,
                            letterheadPaddingTop_PT: val,
                            letterheadPaddingTop: val,
                          });
                        }
                      }}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Atur jarak ruang agar teks faktur/dokumen tidak menabrak logo kop atas.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Margin Bawah (Padding Bottom):</span>
                      <span className="font-mono text-purple-700 font-black">
                        {(letterheadTab === "NON_PT"
                          ? letterheadConfig.letterheadPaddingBottom_NON_PT
                          : letterheadConfig.letterheadPaddingBottom_PT || letterheadConfig.letterheadPaddingBottom) || 75}
                        px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      step="5"
                      value={
                        (letterheadTab === "NON_PT"
                          ? letterheadConfig.letterheadPaddingBottom_NON_PT
                          : letterheadConfig.letterheadPaddingBottom_PT || letterheadConfig.letterheadPaddingBottom) || 75
                      }
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (letterheadTab === "NON_PT") {
                          setLetterheadConfig({ ...letterheadConfig, letterheadPaddingBottom_NON_PT: val });
                        } else {
                          setLetterheadConfig({
                            ...letterheadConfig,
                            letterheadPaddingBottom_PT: val,
                            letterheadPaddingBottom: val,
                          });
                        }
                      }}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Atur jarak batas bawah agar tanda tangan tidak menabrak footer kop bawah.
                    </p>
                  </div>
                </div>

                {/* 4. Mode Pemasangan Gambar (Fit Mode) */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Mode Pemasangan Gambar Kop Surat
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "bleed", label: "Bleed (Full Ujung)", desc: "Menempel rapat tepi A4" },
                      { id: "fill", label: "Fill (Pas Lembar)", desc: "Mengisi 100% lembar cetak" },
                      { id: "contain", label: "Contain (Asli)", desc: "Proporsional tidak terpotong" },
                      { id: "cover", label: "Cover (Penuh)", desc: "Memenuhi tanpa margin" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() =>
                          setLetterheadConfig({
                            ...letterheadConfig,
                            letterheadFitMode: mode.id as any,
                          })
                        }
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          (letterheadConfig.letterheadFitMode || "fill") === mode.id
                            ? "bg-purple-50 border-purple-400 text-purple-900 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <p className="font-bold text-xs">{mode.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{mode.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Penandatangan Master Dokumen */}
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-3">
                  <p className="font-black text-purple-950 text-xs uppercase tracking-wider">
                    Pejabat Penandatangan Resmi ({letterheadTab === "NON_PT" ? "DSTech Non-PT" : "PT. DSTech Smart Perkasa"}):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {letterheadTab === "NON_PT" ? "Nama Pimpinan / Owner:" : "Nama Direktur Utama:"}
                      </label>
                      <input
                        type="text"
                        value={
                          (letterheadTab === "NON_PT"
                            ? letterheadConfig.signerName_NON_PT
                            : letterheadConfig.signerName_PT || letterheadConfig.signerName) || ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (letterheadTab === "NON_PT") {
                            setLetterheadConfig({ ...letterheadConfig, signerName_NON_PT: val });
                          } else {
                            setLetterheadConfig({
                              ...letterheadConfig,
                              signerName_PT: val,
                              signerName: val,
                            });
                          }
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Contoh: RAMADHANI ST"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {letterheadTab === "NON_PT" ? "Jabatan Penandatangan:" : "Jabatan Direktur:"}
                      </label>
                      <input
                        type="text"
                        value={
                          (letterheadTab === "NON_PT"
                            ? letterheadConfig.signerTitle_NON_PT
                            : letterheadConfig.signerTitle_PT || letterheadConfig.signerTitle) || ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (letterheadTab === "NON_PT") {
                            setLetterheadConfig({ ...letterheadConfig, signerTitle_NON_PT: val });
                          } else {
                            setLetterheadConfig({
                              ...letterheadConfig,
                              signerTitle_PT: val,
                              signerTitle: val,
                            });
                          }
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder={letterheadTab === "NON_PT" ? "Contoh: Owner / Pengelola Usaha" : "Contoh: Direktur"}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveAll(
                        { letterheadSettings: letterheadConfig },
                        `Pengaturan Kop Surat ${letterheadTab} berhasil disimpan!`
                      )
                    }
                    disabled={saving}
                    className="px-6 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-700/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Kop Surat ({letterheadTab})</span>
                  </button>
                </div>
              </div>

              {/* Kolom Kanan: Pratinjau Kertas A4 (5 Kolom) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span>Pratinjau Resolusi Lembar Cetak A4:</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      letterheadTab === "NON_PT"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-dstech-blue text-white"
                    }`}
                  >
                    {letterheadTab}
                  </span>
                </div>

                {/* Kontainer Lembar A4 Scaled */}
                <div className="relative w-full aspect-[210/297] rounded-2xl border-2 border-slate-300 bg-white overflow-hidden shadow-xl flex flex-col justify-between p-4 text-[9px] text-slate-800">
                  {/* Background Kop Gambar */}
                  {(letterheadTab === "NON_PT" ? letterheadConfig.letterheadUrl_NON_PT : letterheadConfig.letterheadUrl_PT || letterheadConfig.letterheadUrl) ? (
                    <img
                      src={
                        letterheadTab === "NON_PT"
                          ? letterheadConfig.letterheadUrl_NON_PT || ""
                          : letterheadConfig.letterheadUrl_PT || letterheadConfig.letterheadUrl || ""
                      }
                      alt={`Kop Surat ${letterheadTab}`}
                      className="absolute inset-0 w-full h-full pointer-events-none select-none"
                      style={{
                        objectFit:
                          letterheadConfig.letterheadFitMode === "cover"
                            ? "cover"
                            : letterheadConfig.letterheadFitMode === "contain"
                            ? "contain"
                            : "fill",
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-300">
                      <ImageIcon className="w-12 h-12 mb-2 stroke-[1.2]" />
                      <p className="font-bold text-xs text-slate-400">Belum ada gambar kop surat diunggah</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Unggah berkas PNG/JPG pada form di sebelah kiri</p>
                    </div>
                  )}

                  {/* Dummy Konten Dokumen untuk Menguji Padding */}
                  <div
                    className="relative z-10 space-y-2 pointer-events-none"
                    style={{
                      paddingTop: `${
                        (letterheadTab === "NON_PT"
                          ? letterheadConfig.letterheadPaddingTop_NON_PT
                          : letterheadConfig.letterheadPaddingTop_PT || letterheadConfig.letterheadPaddingTop) || 80
                      }px`,
                      paddingBottom: `${
                        (letterheadTab === "NON_PT"
                          ? letterheadConfig.letterheadPaddingBottom_NON_PT
                          : letterheadConfig.letterheadPaddingBottom_PT || letterheadConfig.letterheadPaddingBottom) || 75
                      }px`,
                    }}
                  >
                    <div className="border-b border-slate-400/80 pb-1 flex items-center justify-between">
                      <span className="font-black uppercase tracking-wider text-[10px]">FAKTUR PENJUALAN</span>
                      <span className="font-mono font-bold text-slate-600">INV/DSP/2026/001</span>
                    </div>

                    <div className="space-y-1 text-slate-600 leading-tight">
                      <p>Kepada Yth: PT. Pelanggan Utama Mandiri</p>
                      <p>Lokasi: Kawasan Industri Cilegon, Banten</p>
                    </div>

                    <div className="border border-slate-300 rounded-lg overflow-hidden mt-2">
                      <div className="bg-slate-800 text-white font-bold p-1 flex justify-between">
                        <span>Deskripsi Layanan &amp; Barang</span>
                        <span>Total (Rp)</span>
                      </div>
                      <div className="p-1.5 flex justify-between border-b border-slate-200">
                        <span>Pengadaan CCTV &amp; Akses Kontrol</span>
                        <span className="font-mono">Rp 12.500.000</span>
                      </div>
                    </div>
                  </div>

                  {/* Dummy Tanda Tangan */}
                  <div className="relative z-10 flex justify-end text-right text-[8.5px] pointer-events-none">
                    <div className="space-y-1">
                      <p className="font-bold">
                        {letterheadTab === "NON_PT" ? "DSTECH SMART" : "PT. DSTECH SMART PERKASA"}
                      </p>
                      <div className="h-8 flex items-center justify-center font-serif italic text-slate-400">
                        ( Tanda Tangan &amp; Stempel )
                      </div>
                      <p className="font-black text-slate-900 border-t border-slate-400 pt-0.5">
                        {letterheadTab === "NON_PT"
                          ? letterheadConfig.signerName_NON_PT || "RAMADHANI ST"
                          : letterheadConfig.signerName_PT || letterheadConfig.signerName || "RAMADHANI ST"}
                      </p>
                      <p className="text-slate-500 text-[8px]">
                        {letterheadTab === "NON_PT"
                          ? letterheadConfig.signerTitle_NON_PT || "Owner"
                          : letterheadConfig.signerTitle_PT || letterheadConfig.signerTitle || "Direktur"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KONTEN TAB 4: ZONA BAHAYA (DANGER ZONE) */}
      {activeTab === "danger" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-red-50/50 border-2 border-red-200/90 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-red-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-red-950 text-base sm:text-lg">Zona Bahaya: Pembersihan Transaksi</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-200 text-red-800">
                    Danger Zone
                  </span>
                </div>
                <p className="text-xs text-red-700/80 mt-0.5">
                  Kosongkan seluruh data transaksi riwayat untuk memulai pembukuan dari nol (clean slate)
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <p>
              Fitur ini dirancang saat Anda ingin mengosongkan seluruh riwayat demo atau memulai pembukuan baru dari nol tanpa menghapus konfigurasi sistem:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium pl-1">
              <li>
                <strong className="text-red-700">Dibersihkan:</strong> Penjualan, Penawaran (Quotation), Pembelian (PO), Retur Penjualan, Retur Pembelian, Buku Kas Operasional &amp; Biaya Pengeluaran.
              </li>
              <li>
                <strong className="text-emerald-700">Tetap Aman &amp; Tersimpan:</strong> Rekening Bank Resmi, Kop Surat Dokumen, Master Gudang, Cabang, Pelanggan/Klien, Vendor/Supplier, dan Pengaturan Situs.
              </li>
            </ul>
            <div className="p-3 bg-white/80 rounded-xl border border-red-100 text-[11px] text-slate-500 font-mono">
              🛡️ Sistem secara otomatis mencadangkan snapshot data sebelum dikosongkan ke folder <code className="text-red-600 font-bold">_backup/</code>.
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setResetConfirmText("");
                setIsResetModalOpen(true);
              }}
              id="btn-trigger-reset-transactions"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Bersihkan Data Transaksi (Mulai dari Nol)</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / UBAH REKENING BANK */}
      {isBankModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsBankModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingBankId ? "Ubah Rincian Rekening Bank" : "Tambah Rekening Bank Baru"}
                  </h3>
                  <p className="text-[11px] text-slate-400">Pengaturan rekening tujuan transfer resmi perusahaan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBankForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Bank *
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {["Bank BCA", "Bank Mandiri", "Bank BNI", "Bank BRI", "Bank BSI", "CIMB Niaga", "Permata", "BJB"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBankForm({ ...bankForm, bankName: b })}
                      className={`py-1.5 px-2 rounded-xl text-[10.5px] font-bold border transition-all cursor-pointer text-center ${
                        bankForm.bankName === b
                          ? "bg-dstech-blue text-white border-dstech-blue shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="Nama Bank Lainnya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor Rekening *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    placeholder="Contoh: 295-074-0321"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Kantor Cabang
                  </label>
                  <input
                    type="text"
                    value={bankForm.branch}
                    onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                    placeholder="Contoh: KCU Cilegon"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Atas Nama Pemilik Rekening *
                </label>
                <input
                  type="text"
                  required
                  value={bankForm.accountHolder}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                  placeholder="Contoh: PT. DSTech Smart Perkasa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Peruntukan Entitas
                  </label>
                  <select
                    value={bankForm.entityType || "PT"}
                    onChange={(e) => setBankForm({ ...bankForm, entityType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
                  >
                    <option value="PT">🏢 Khusus PT (PT. DSTech Smart Perkasa)</option>
                    <option value="NON_PT">🏬 Khusus Non-PT (DSTech Smart Mandiri)</option>
                    <option value="ALL">🌐 Semua Entitas (PT &amp; Non-PT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Status Rekening
                  </label>
                  <select
                    value={bankForm.status}
                    onChange={(e) => setBankForm({ ...bankForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
                  >
                    <option value="Aktif">🟢 Aktif (Bisa Dipakai)</option>
                    <option value="Nonaktif">🔴 Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={bankForm.isDefault}
                    onChange={(e) => setBankForm({ ...bankForm, isDefault: e.target.checked })}
                    className="rounded border-slate-300 text-dstech-blue focus:ring-dstech-blue cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 text-xs">
                    Jadikan Rekening Utama (Default saat buat Faktur baru)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Rekening</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Reset Transaksi */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-red-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Konfirmasi Pembersihan Data</h3>
                  <p className="text-xs text-red-600 font-bold">Tindakan ini akan mengosongkan riwayat transaksi!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-900">
                <p className="font-bold mb-1">Apakah Anda benar-benar yakin?</p>
                <p className="text-[11px] text-red-700 leading-normal">
                  Seluruh data penjualan, penawaran harga, pembelian stok, retur, dan buku arus kas operasional akan dihapus permanen. Master rekening, gudang, pelanggan, dan vendor tetap utuh.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">
                  Ketik kata <span className="text-red-600 font-mono bg-red-50 px-1.5 py-0.5 rounded border border-red-200">RESET</span> untuk melanjutkan:
                </label>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Ketik RESET"
                  id="input-confirm-reset"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 uppercase"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                disabled={isResetting}
                className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleResetTransactions}
                disabled={resetConfirmText.trim().toUpperCase() !== "RESET" || isResetting}
                id="btn-confirm-reset-execute"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isResetting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Membersihkan...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Bersihkan Data Transaksi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
