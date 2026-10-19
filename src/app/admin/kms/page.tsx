"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Edit3,
  FileText,
  HardHat,
  Download,
  PhoneCall,
  Wrench,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles,
  Layers,
  Calendar,
  User,
  Eye,
} from "lucide-react";
import { DstechKmsItem } from "@/app/api/kms/route";

export default function AdminKmsPage() {
  const [kmsList, setKmsList] = useState<DstechKmsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DstechKmsItem | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState<"sop" | "k3" | "firmware" | "kontak" | "troubleshooting">("sop");
  const [formTitle, setFormTitle] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formDownloadUrl, setFormDownloadUrl] = useState("");
  const [formFileSize, setFormFileSize] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formContactPhone, setFormContactPhone] = useState("");
  const [formContactRole, setFormContactRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "success", message: "" }), 3500);
  };

  // Fetch KMS Data
  const fetchKms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/kms?t=" + Date.now());
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setKmsList(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat data KMS:", err);
      showToast("error", "Gagal memuat data KMS dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKms();
  }, []);

  // Filter & Search Logic
  const filteredList = kmsList.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      (item.contactName && item.contactName.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  // Open Add Modal
  const openAddModal = () => {
    setFormCategory("sop");
    setFormTitle("");
    setFormSummary("");
    setFormContent("");
    setFormDownloadUrl("");
    setFormFileSize("");
    setFormContactName("");
    setFormContactPhone("");
    setFormContactRole("");
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: DstechKmsItem) => {
    setSelectedItem(item);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormSummary(item.summary);
    setFormContent(item.content);
    setFormDownloadUrl(item.downloadUrl || "");
    setFormFileSize(item.fileSize || "");
    setFormContactName(item.contactName || "");
    setFormContactPhone(item.contactPhone || "");
    setFormContactRole(item.contactRole || "");
    setIsEditModalOpen(true);
  };

  // Submit Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast("error", "Judul dan isi panduan KMS wajib diisi!");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/kms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          category: formCategory,
          summary: formSummary || formTitle,
          content: formContent,
          downloadUrl: formDownloadUrl,
          fileSize: formFileSize,
          contactName: formContactName,
          contactPhone: formContactPhone,
          contactRole: formContactRole,
          updatedBy: "Admin DSTech",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", data.message || "Panduan KMS berhasil ditambahkan!");
        setIsAddModalOpen(false);
        fetchKms();
      } else {
        showToast("error", data.error || "Gagal menambahkan panduan KMS.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan saat menyimpan panduan KMS.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!formTitle.trim() || !formContent.trim()) {
      showToast("error", "Judul dan isi panduan KMS wajib diisi!");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/kms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedItem.id,
          title: formTitle,
          category: formCategory,
          summary: formSummary,
          content: formContent,
          downloadUrl: formDownloadUrl,
          fileSize: formFileSize,
          contactName: formContactName,
          contactPhone: formContactPhone,
          contactRole: formContactRole,
          updatedBy: "Admin DSTech",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", data.message || "Panduan KMS berhasil diperbarui!");
        setIsEditModalOpen(false);
        fetchKms();
      } else {
        showToast("error", data.error || "Gagal memperbarui panduan KMS.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan saat memperbarui panduan KMS.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete
  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/kms?id=${selectedItem.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "Panduan KMS berhasil dihapus!");
        setIsDeleteModalOpen(false);
        fetchKms();
      } else {
        showToast("error", data.error || "Gagal menghapus panduan KMS.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan saat menghapus panduan KMS.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category Icon & Badge Helper
  const renderCategoryBadge = (category: string) => {
    switch (category) {
      case "sop":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-dstech-blue text-[11px] font-black border border-blue-100">
            <FileText className="w-3.5 h-3.5" /> SOP Instalasi
          </span>
        );
      case "k3":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-black border border-red-100">
            <HardHat className="w-3.5 h-3.5" /> Standar K3
          </span>
        );
      case "firmware":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-black border border-purple-100">
            <Download className="w-3.5 h-3.5" /> Firmware DVR/NVR
          </span>
        );
      case "kontak":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-100">
            <PhoneCall className="w-3.5 h-3.5" /> Kontak PIC
          </span>
        );
      case "troubleshooting":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black border border-amber-100">
            <Wrench className="w-3.5 h-3.5" /> Troubleshooting
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black">
            <BookOpen className="w-3.5 h-3.5" /> Panduan Umum
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-xs font-bold text-white transition-all transform animate-bounce ${
            toast.type === "success" ? "bg-emerald-600 shadow-emerald-500/20" : "bg-red-600 shadow-red-500/20"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-[36px] bg-gradient-to-r from-slate-900 via-slate-800 to-dstech-blue text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-dstech-accent text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Knowledge Management System (KMS)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Pusat Pengelolaan Panduan & SOP Teknisi
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Kelola seluruh SOP instalasi lapangan, standar keselamatan kerja (K3), file firmware NVR/DVR, kontak darurat PIC, dan panduan troubleshooting yang otomatis tampil di portal karyawan teknisi.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Link
            href="/employee"
            target="_blank"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all backdrop-blur-md flex items-center gap-2 border border-white/10"
          >
            <span>Pratinjau Portal Karyawan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={openAddModal}
            className="px-6 py-3.5 rounded-2xl bg-dstech-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-500/30 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Panduan KMS</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Panduan</span>
            <BookOpen className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{kmsList.length}</h3>
          <p className="text-[10px] text-slate-400 font-medium">Dokumen terbit</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-[10px] font-black uppercase tracking-wider">SOP Instalasi</span>
            <FileText className="w-4 h-4 text-dstech-blue" />
          </div>
          <h3 className="text-2xl font-black text-dstech-blue">
            {kmsList.filter((k) => k.category === "sop").length}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Standar kerja</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-red-500">
            <span className="text-[10px] font-black uppercase tracking-wider">Standar K3</span>
            <HardHat className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-2xl font-black text-red-600">
            {kmsList.filter((k) => k.category === "k3").length}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Keselamatan kerja</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-purple-500">
            <span className="text-[10px] font-black uppercase tracking-wider">Firmware</span>
            <Download className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-2xl font-black text-purple-700">
            {kmsList.filter((k) => k.category === "firmware").length}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">File update</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[10px] font-black uppercase tracking-wider">Kontak PIC</span>
            <PhoneCall className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-700">
            {kmsList.filter((k) => k.category === "kontak").length}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Eskalasi darurat</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-6 rounded-[32px] bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
            {[
              { id: "all", label: "Semua Kategori" },
              { id: "sop", label: "SOP Instalasi" },
              { id: "k3", label: "Standar K3" },
              { id: "firmware", label: "Firmware" },
              { id: "kontak", label: "Kontak PIC" },
              { id: "troubleshooting", label: "Troubleshooting" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari judul, SOP, nomor, PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-dstech-blue focus:outline-none bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* KMS List / Cards */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-[32px] border border-slate-100">
          <div className="w-10 h-10 border-4 border-dstech-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">Memuat data KMS...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[32px] border border-slate-200/80 p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800">Belum ada panduan KMS</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ditemukan panduan dengan kata kunci "${searchQuery}"`
                : "Klik tombol Tambah Panduan KMS di atas untuk mempublikasikan SOP atau materi teknis baru."}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-dstech-red text-white text-xs font-bold hover:bg-red-700 cursor-pointer shadow-md"
          >
            + Tambah Panduan Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[28px] border border-slate-200/80 p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {renderCategoryBadge(item.category)}
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.updatedAt}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-dstech-blue transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 font-medium leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Specific Meta Previews */}
                {item.category === "kontak" && item.contactName && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100/80 text-xs space-y-1">
                    <p className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> {item.contactName}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold">{item.contactRole}</p>
                    <p className="text-[11px] text-emerald-800 font-black flex items-center gap-1">
                      <PhoneCall className="w-3 h-3" /> {item.contactPhone}
                    </p>
                  </div>
                )}

                {item.category === "firmware" && item.downloadUrl && (
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100/80 text-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-purple-600 font-black uppercase">Ukuran File</p>
                      <p className="font-extrabold text-purple-950">{item.fileSize || "Tersedia"}</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-[10px] flex items-center gap-1">
                      <Download className="w-3 h-3" /> Link Aktif
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setIsPreviewModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lihat Isi</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl text-slate-600 hover:text-dstech-blue hover:bg-blue-50 font-bold text-xs transition-colors cursor-pointer"
                    title="Edit Panduan"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 font-bold text-xs transition-colors cursor-pointer"
                    title="Hapus Panduan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Tambah Panduan KMS */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dstech-blue text-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Tambah Panduan / SOP Baru</h3>
                  <p className="text-xs text-slate-400">Data akan langsung tersinkronisasi ke portal teknisi.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Panduan *</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                  >
                    <option value="sop">SOP Instalasi Lapangan</option>
                    <option value="k3">Standar K3 Teknisi</option>
                    <option value="firmware">Firmware DVR / NVR</option>
                    <option value="kontak">Kontak PIC Lapangan</option>
                    <option value="troubleshooting">Troubleshooting Lapangan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Judul Dokumen / Panduan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SOP-DST-04: Standar Uji Komisioning..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ringkasan Singkat (Summary)</label>
                <input
                  type="text"
                  placeholder="Ringkasan 1-2 kalimat untuk kartu depan..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-dstech-blue focus:outline-none"
                />
              </div>

              {/* Conditional Fields based on Category */}
              {formCategory === "firmware" && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-3">
                  <span className="font-black text-purple-900 text-[11px] uppercase tracking-wider block">
                    Informasi Download Firmware / Tool
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-purple-950 block mb-1">URL Unduhan File:</label>
                      <input
                        type="text"
                        placeholder="https://dstechsmart.com/downloads/..."
                        value={formDownloadUrl}
                        onChange={(e) => setFormDownloadUrl(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-purple-950 block mb-1">Ukuran File (Size):</label>
                      <input
                        type="text"
                        placeholder="Contoh: 48 MB / 52.7 MB"
                        value={formFileSize}
                        onChange={(e) => setFormFileSize(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formCategory === "kontak" && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                  <span className="font-black text-emerald-900 text-[11px] uppercase tracking-wider block">
                    Rincian Person in Charge (PIC)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-emerald-950 block mb-1">Nama Lengkap PIC:</label>
                      <input
                        type="text"
                        placeholder="Contoh: Ahmad Rizky"
                        value={formContactName}
                        onChange={(e) => setFormContactName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-emerald-950 block mb-1">Jabatan / Peran:</label>
                      <input
                        type="text"
                        placeholder="Contoh: Supervisor Lapangan"
                        value={formContactRole}
                        onChange={(e) => setFormContactRole(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-emerald-950 block mb-1">No. WhatsApp / HP:</label>
                      <input
                        type="text"
                        placeholder="Contoh: 0812-3456-7890"
                        value={formContactPhone}
                        onChange={(e) => setFormContactPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Isi Lengkap Panduan Prosedur / Catatan Teknis *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Tuliskan butir-butir panduan SOP secara jelas (gunakan penomoran 1., 2., 3. atau tanda strip)..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-dstech-blue focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-dstech-blue text-white font-bold hover:bg-blue-700 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Publikasikan ke KMS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Panduan KMS */}
      {isEditModalOpen && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Perbarui Panduan KMS</h3>
                  <p className="text-xs text-slate-400">ID: {selectedItem.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Panduan *</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="sop">SOP Instalasi Lapangan</option>
                    <option value="k3">Standar K3 Teknisi</option>
                    <option value="firmware">Firmware DVR / NVR</option>
                    <option value="kontak">Kontak PIC Lapangan</option>
                    <option value="troubleshooting">Troubleshooting Lapangan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Judul Dokumen / Panduan *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ringkasan Singkat (Summary)</label>
                <input
                  type="text"
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Conditional Fields */}
              {formCategory === "firmware" && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-3">
                  <span className="font-black text-purple-900 text-[11px] uppercase tracking-wider block">
                    Informasi Download Firmware / Tool
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-purple-950 block mb-1">URL Unduhan File:</label>
                      <input
                        type="text"
                        value={formDownloadUrl}
                        onChange={(e) => setFormDownloadUrl(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-purple-950 block mb-1">Ukuran File (Size):</label>
                      <input
                        type="text"
                        value={formFileSize}
                        onChange={(e) => setFormFileSize(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formCategory === "kontak" && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                  <span className="font-black text-emerald-900 text-[11px] uppercase tracking-wider block">
                    Rincian Person in Charge (PIC)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-emerald-950 block mb-1">Nama Lengkap PIC:</label>
                      <input
                        type="text"
                        value={formContactName}
                        onChange={(e) => setFormContactName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-emerald-950 block mb-1">Jabatan / Peran:</label>
                      <input
                        type="text"
                        value={formContactRole}
                        onChange={(e) => setFormContactRole(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-emerald-950 block mb-1">No. WhatsApp / HP:</label>
                      <input
                        type="text"
                        value={formContactPhone}
                        onChange={(e) => setFormContactPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Isi Lengkap Panduan Prosedur / Catatan Teknis *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Konfirmasi Hapus */}
      {isDeleteModalOpen && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Hapus Dokumen Panduan?</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus panduan:
              </p>
              <p className="text-xs font-black text-slate-800 p-2 bg-slate-50 rounded-xl mt-2">
                &ldquo;{selectedItem.title}&rdquo;
              </p>
              <p className="text-[11px] text-red-500 font-bold pt-1">
                Tindakan ini tidak dapat dibatalkan dan akan hilang dari portal teknisi.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Quick Preview */}
      {isPreviewModalOpen && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {renderCategoryBadge(selectedItem.category)}
                  <span className="text-[10px] text-slate-400">ID: {selectedItem.id}</span>
                </div>
                <h3 className="text-base font-black text-slate-900">{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs pr-1 flex-1 leading-relaxed text-slate-700 font-medium whitespace-pre-line p-4 rounded-2xl bg-slate-50 border border-slate-100">
              {selectedItem.content}
            </div>

            {selectedItem.category === "kontak" && selectedItem.contactPhone && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-emerald-950">{selectedItem.contactName}</p>
                  <p className="text-[11px] text-emerald-700">{selectedItem.contactRole}</p>
                </div>
                <a
                  href={`https://wa.me/${selectedItem.contactPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> WhatsApp PIC
                </a>
              </div>
            )}

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
