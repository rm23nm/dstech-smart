"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Award,
  DollarSign,
  TrendingUp,
  MapPin,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Percent,
} from "lucide-react";

interface PartnerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  city: string;
  tier: string;
  totalClients: number;
  totalCommission: number;
  pendingCommission: number;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  joinedDate: string;
  updatedAt: string;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [summary, setSummary] = useState({
    totalPartners: 0,
    activePartners: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCity, setFormCity] = useState("Cilegon");
  const [formTier, setFormTier] = useState("Gold Agent");
  const [formReferralCode, setFormReferralCode] = useState("");
  const [formStatus, setFormStatus] = useState<PartnerItem["status"]>("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch partners from API
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/partners");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPartners(json.data);
        if (json.summary) {
          setSummary(json.summary);
        }
      }
    } catch (err) {
      console.error("Gagal memuat mitra:", err);
      showToast("error", "Gagal memuat data mitra afiliasi dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Filtered partners
  const filteredPartners = partners.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referralCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Open Edit Modal
  const openEditModal = (p: PartnerItem) => {
    setSelectedPartner(p);
    setFormName(p.name);
    setFormEmail(p.email);
    setFormPhone(p.phone);
    setFormCity(p.city);
    setFormTier(p.tier);
    setFormStatus(p.status);
    setIsEditModalOpen(true);
  };

  // Open Payout Modal
  const openPayoutModal = (p: PartnerItem) => {
    setSelectedPartner(p);
    setIsPayoutModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (p: PartnerItem) => {
    setSelectedPartner(p);
    setIsDeleteModalOpen(true);
  };

  // Handle Add Partner
  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast("error", "Nama mitra dan email wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim(),
          city: formCity.trim(),
          tier: formTier,
          referralCode: formReferralCode.trim(),
          status: formStatus,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", data.message || "Mitra baru berhasil didaftarkan.");
        setIsAddModalOpen(false);
        setFormName("");
        setFormEmail("");
        setFormPhone("");
        setFormReferralCode("");
        fetchPartners();
      } else {
        showToast("error", data.message || "Gagal mendaftarkan mitra.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Partner
  const handleEditPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPartner.id,
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim(),
          city: formCity.trim(),
          tier: formTier,
          status: formStatus,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", "Data mitra berhasil diperbarui.");
        setIsEditModalOpen(false);
        setSelectedPartner(null);
        fetchPartners();
      } else {
        showToast("error", data.message || "Gagal mengupdate mitra.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Approve Payout
  const handleApprovePayout = async () => {
    if (!selectedPartner) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPartner.id,
          payoutApproved: true,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          "success",
          `Pencairan komisi Rp ${selectedPartner.pendingCommission.toLocaleString(
            "id-ID"
          )} untuk '${selectedPartner.name}' berhasil disetujui.`
        );
        setIsPayoutModalOpen(false);
        setSelectedPartner(null);
        fetchPartners();
      } else {
        showToast("error", data.message || "Gagal menyetujui pencairan komisi.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan saat memproses pencairan komisi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Partner
  const handleDeletePartner = async () => {
    if (!selectedPartner) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/partners?id=${selectedPartner.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", data.message || "Mitra berhasil dihapus.");
        setIsDeleteModalOpen(false);
        setSelectedPartner(null);
        fetchPartners();
      } else {
        showToast("error", data.message || "Gagal menghapus mitra.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan saat menghapus mitra.");
    } finally {
      setIsSubmitting(false);
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
            <Users className="w-4 h-4" />
            <span>Ekosistem Kemitraan & Referral</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Affiliate Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Kelola data agen referral, kode unik afiliasi, pencairan komisi penjualan, dan pemantauan performa mitra di seluruh wilayah.
          </p>
        </div>

        <button
          onClick={() => {
            setFormName("");
            setFormEmail("");
            setFormPhone("");
            setFormCity("Cilegon");
            setFormTier("Gold Agent");
            setFormReferralCode("");
            setFormStatus("ACTIVE");
            setIsAddModalOpen(true);
          }}
          id="btn-add-partner"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-dstech-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Daftarkan Mitra Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Mitra
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Mitra</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {summary.totalPartners} Agen
          </h3>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
              Aktif
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mitra Berstatus Aktif</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {summary.activePartners} Agen
          </h3>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-100 text-green-700">
              Paid
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Komisi Terbayar</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Rp {(summary.totalCommissions / 1000000).toFixed(1)}M
          </h3>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              Pending
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Menunggu Pencairan</p>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
            Rp {(summary.pendingCommissions / 1000000).toFixed(2)}M
          </h3>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama mitra, kode referral, kota, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="partner-search-input"
            className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue transition-all"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-600">
          <span className="text-slate-400">Status Mitra:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif (Active)</option>
            <option value="PENDING">Menunggu Persetujuan</option>
            <option value="SUSPENDED">Ditangguhkan</option>
          </select>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="py-5 px-6">Mitra & Kontak</th>
                <th className="py-5 px-6">Kode Referral</th>
                <th className="py-5 px-6">Kota & Tingkat</th>
                <th className="py-5 px-6">Klien Terdaftar</th>
                <th className="py-5 px-6">Komisi (Total / Pending)</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-sm">
                    <div className="w-6 h-6 border-2 border-dstech-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Memuat data mitra afiliasi...
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-sm">
                    Tidak ditemukan data mitra yang cocok.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-dstech-blue to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/15">
                            {p.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-dstech-blue transition-colors">
                              {p.name}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-300" />
                              {p.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Referral Code */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-xs">
                          <span>{p.referralCode}</span>
                          <button
                            onClick={() => copyToClipboard(p.referralCode)}
                            className="text-slate-400 hover:text-dstech-blue cursor-pointer"
                            title="Salin Kode Referral"
                          >
                            {copiedCode === p.referralCode ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* City & Tier */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-dstech-red" />
                          <span>{p.city}</span>
                        </div>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-dstech-blue border border-blue-100">
                          {p.tier}
                        </span>
                      </td>

                      {/* Clients */}
                      <td className="py-4 px-6">
                        <span className="font-black text-slate-900">{p.totalClients}</span>{" "}
                        <span className="text-xs text-slate-400">Klien</span>
                      </td>

                      {/* Commission */}
                      <td className="py-4 px-6">
                        <p className="text-xs font-black text-slate-900">
                          Rp {p.totalCommission.toLocaleString("id-ID")}
                        </p>
                        {p.pendingCommission > 0 ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-amber-600">
                              Pending: Rp {p.pendingCommission.toLocaleString("id-ID")}
                            </span>
                            <button
                              onClick={() => openPayoutModal(p)}
                              className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black hover:bg-amber-200 transition-colors cursor-pointer"
                            >
                              Cairkan
                            </button>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-0.5">Semua dicairkan</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            p.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : p.status === "PENDING"
                              ? "bg-amber-50 text-amber-600 border border-amber-200"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === "ACTIVE"
                                ? "bg-emerald-500"
                                : p.status === "PENDING"
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                          {p.status === "ACTIVE"
                            ? "Aktif"
                            : p.status === "PENDING"
                            ? "Menunggu"
                            : "Ditangguhkan"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 rounded-xl text-slate-400 hover:text-dstech-blue hover:bg-blue-50 transition-all cursor-pointer"
                            title="Edit Data Mitra"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(p)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Hapus Mitra"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Mitra */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsAddModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Pendaftaran Mitra Afiliasi</h3>
                  <p className="text-xs text-slate-400">Buat akun kemitraan & kode referral baru</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Nama Mitra / Perusahaan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Farhan Security Perkasa"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Email Kontak *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="mitra@gmail.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    placeholder="Cilegon / Serang"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Tingkat Kemitraan (Tier)
                  </label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-bold"
                  >
                    <option value="Bronze Agent">Bronze Agent (Komisi 5%)</option>
                    <option value="Silver Agent">Silver Agent (Komisi 10%)</option>
                    <option value="Gold Agent">Gold Agent (Komisi 15%)</option>
                    <option value="Platinum Agent">Platinum Agent (Komisi 20%)</option>
                    <option value="Corporate Partner">Corporate Partner (Khusus)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Custom Kode Referral (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Kosongkan untuk generate otomatis (misal: DSTECH-FA88)"
                  value={formReferralCode}
                  onChange={(e) => setFormReferralCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="submit-add-partner"
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-dstech-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Daftarkan Mitra</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Mitra */}
      {isEditModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsEditModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Perbarui Data Mitra</h3>
                  <p className="text-xs text-slate-400">Kode: {selectedPartner.referralCode}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditPartner} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Nama Mitra / Agen *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Email Kontak *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Tingkat (Tier)
                  </label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-bold"
                  >
                    <option value="Bronze Agent">Bronze Agent</option>
                    <option value="Silver Agent">Silver Agent</option>
                    <option value="Gold Agent">Gold Agent</option>
                    <option value="Platinum Agent">Platinum Agent</option>
                    <option value="Corporate Partner">Corporate Partner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Status Kemitraan
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as PartnerItem["status"])}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-bold"
                >
                  <option value="ACTIVE">Aktif (Referral Berjalan)</option>
                  <option value="PENDING">Menunggu Verifikasi</option>
                  <option value="SUSPENDED">Ditangguhkan</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-amber-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-600 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pencairan Komisi (Payout) */}
      {isPayoutModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsPayoutModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/10">
              <DollarSign className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 text-center mb-2">
              Setujui Pencairan Komisi
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-6 leading-relaxed">
              Konfirmasi transfer komisi sebesar{" "}
              <strong className="text-slate-900 text-base">
                Rp {selectedPartner.pendingCommission.toLocaleString("id-ID")}
              </strong>{" "}
              kepada mitra <strong>&quot;{selectedPartner.name}&quot;</strong> ({selectedPartner.referralCode}).
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsPayoutModalOpen(false)}
                className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApprovePayout}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Konfirmasi Cair</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Mitra */}
      {isDeleteModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/10">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 text-center mb-2">
              Hapus Data Kemitraan?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus mitra <strong className="text-slate-800">&quot;{selectedPartner.name}&quot;</strong> ({selectedPartner.referralCode})? Riwayat komisi agen ini akan dihapus dari sistem.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeletePartner}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700 shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
