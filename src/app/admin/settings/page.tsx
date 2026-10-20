"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

interface SiteSettingsData {
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
  updatedAt?: string;
}

export default function AdminSettingsPage() {
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

  // Save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", data.message || "Pengaturan situs berhasil disimpan.");
        if (data.data) {
          setSettings(data.data);
        }
      } else {
        showToast("error", data.message || "Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan koneksi saat menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 text-dstech-blue font-black text-xs uppercase tracking-widest mb-1.5">
            <Settings className="w-4 h-4" />
            <span>Konfigurasi Sistem & Branding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Site Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Perbarui informasi legalitas perusahaan, nomor kontak WhatsApp layanan, alamat kantor operasional, dan tautan media sosial resmi.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          id="btn-save-settings-top"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-dstech-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all self-start md:self-auto cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Settings Inputs (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Identitas PT */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Identitas & Legalitas PT</h3>
                <p className="text-xs text-slate-400">Nama resmi entitas bisnis dan nomor perizinan</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  Nomor Pokok Wajib Pajak (NPWP)
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

          {/* Section 2: Saluran Komunikasi & CS */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Kontak & Customer Service</h3>
                <p className="text-xs text-slate-400">Nomor WhatsApp dan email yang tampil di web publik</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Nomor WhatsApp CS (Format 62...) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="6285183134887"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Digunakan untuk link wa.me langsung</p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Tampilan WhatsApp (Display Text)
                </label>
                <input
                  type="text"
                  placeholder="+62 851-8313-4887"
                  value={settings.whatsappDisplay}
                  onChange={(e) => setSettings({ ...settings, whatsappDisplay: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
                <p className="text-[10px] text-slate-400 mt-1">Format ramah pengguna pada footer</p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Email Resmi Perusahaan *
                </label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Email Support Teknis
                </label>
                <input
                  type="email"
                  value={settings.emailSupport}
                  onChange={(e) => setSettings({ ...settings, emailSupport: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Telepon Kantor (PSTN)
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Alamat & Peta */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-dstech-red flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Alamat Fisik Kantor</h3>
                <p className="text-xs text-slate-400">Lokasi markas operasional PT. DSTech Smart Perkasa</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Alamat Lengkap *
                </label>
                <textarea
                  rows={3}
                  required
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Tautan Google Maps
                </label>
                <input
                  type="url"
                  value={settings.googleMapsUrl}
                  onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Sosial Media */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Media Sosial Resmi</h3>
                <p className="text-xs text-slate-400">Link channel promosi dan jejaring profesional</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  value={settings.instagram}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Facebook
                </label>
                <input
                  type="text"
                  value={settings.facebook}
                  onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={settings.linkedin}
                  onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Zona Bahaya & Pembersihan Data Transaksi (Danger Zone) */}
          <div className="p-8 rounded-3xl bg-red-50/40 border-2 border-red-200/80 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-red-950 text-lg">Zona Bahaya: Pembersihan Transaksi</h3>
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
                  <strong className="text-emerald-700">Tetap Aman &amp; Tersimpan:</strong> Rekening Bank/Kas Utama, Master Gudang, Cabang, Pelanggan/Klien, Vendor/Supplier, dan Pengaturan Situs.
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
        </div>

        {/* Right Sidebar: Live Preview Card (1 Col) */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl sticky top-32 space-y-6">
            <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-slate-400">
              <Eye className="w-4 h-4 text-dstech-blue" />
              <span>Pratinjau Footer Website</span>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <h4 className="font-black text-lg text-white leading-tight">
                  {settings.companyName || "PT. DSTech Smart Perkasa"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {settings.tagline}
                </p>
              </div>

              <div className="space-y-2.5 pt-4 text-xs text-slate-300">
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

              <div className="pt-4 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Legalitas:
                </span>
                <p className="text-xs text-slate-400 font-mono">
                  NIB: {settings.nib || "-"}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  NPWP: {settings.npwp || "-"}
                </p>
              </div>

              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all block text-center"
              >
                <Smartphone className="w-4 h-4" />
                <span>Test WhatsApp CS</span>
              </a>
            </div>
          </div>
        </div>
      </form>

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
