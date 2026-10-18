"use client";

import React, { useState, useEffect } from "react";
import {
  FileDown,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Download,
  FileText,
  FolderArchive,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Layers,
  Sparkles,
} from "lucide-react";

interface PromotionMaterial {
  id: string;
  title: string;
  category: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  downloadCount: number;
  createdAt: string;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromotionMaterial | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Katalog Produk");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("PDF");
  const [fileSize, setFileSize] = useState("");
  const [isUploading, setIsUploading] = useState(false);
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

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/promotions?t=" + Date.now());
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPromotions(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat materi promosi:", err);
      showToast("error", "Gagal memuat materi promosi dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setFileUrl(data.url);
        // Calculate file size
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setFileSize(`${sizeMb} MB`);
        // Detect extension
        const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
        setFileType(ext);
        showToast("success", `File ${file.name} berhasil diunggah.`);
      } else {
        showToast("error", data.message || "Gagal mengunggah file.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan saat upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Submit New Material
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("error", "Judul materi promosi wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          fileUrl: fileUrl || "/logo.png",
          fileType,
          fileSize: fileSize || "2.5 MB",
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", data.message || "Materi promosi berhasil ditambahkan.");
        setIsAddModalOpen(false);
        // Reset form
        setTitle("");
        setDescription("");
        setFileUrl("");
        setFileSize("");
        fetchPromotions();
      } else {
        showToast("error", data.message || "Gagal menambahkan materi promosi.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!selectedPromo) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/promotions?id=${selectedPromo.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", "Materi promosi berhasil dihapus.");
        setIsDeleteModalOpen(false);
        setSelectedPromo(null);
        fetchPromotions();
      } else {
        showToast("error", data.message || "Gagal menghapus materi promosi.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan saat menghapus materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ["Semua", "Katalog Produk", "Brosur Promosi", "Panduan Mitra", "Social Media Kit"];

  const filteredPromotions = promotions.filter((item) => {
    const matchCategory = activeCategory === "Semua" || item.category === activeCategory;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalDownloads = promotions.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 text-dstech-blue font-black text-xs uppercase tracking-widest mb-1.5">
            <FileDown className="w-4 h-4" />
            <span>Manajemen Brosur & Unduhan Mitra</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Materi Promosi & Katalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Kelola e-katalog produk, brosur penawaran, panduan komisi, dan materi promosi resmi yang dapat diunduh oleh mitra partner/affiliate.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-dstech-red hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-500/20 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Materi Promosi</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Total Materi Aktif
          </span>
          <p className="text-3xl font-black text-slate-900">{promotions.length}</p>
          <span className="text-xs font-bold text-emerald-600 mt-1 inline-block">Siap Diunduh Mitra</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Total Unduhan Mitra
          </span>
          <p className="text-3xl font-black text-dstech-blue">{totalDownloads}</p>
          <span className="text-xs font-bold text-slate-400 mt-1 inline-block">Aktivitas Download</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Format Katalog
          </span>
          <p className="text-3xl font-black text-slate-900">
            {promotions.filter((p) => p.fileType === "PDF").length} <span className="text-sm text-slate-400 font-bold">PDF</span>
          </p>
          <span className="text-xs font-bold text-slate-400 mt-1 inline-block">Brosur & Dokumen</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Social Media Kit
          </span>
          <p className="text-3xl font-black text-dstech-red">
            {promotions.filter((p) => p.category === "Social Media Kit").length}
          </p>
          <span className="text-xs font-bold text-slate-400 mt-1 inline-block">Template Banner</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-dstech-blue text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari materi promosi, brosur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue focus:bg-white text-xs font-bold outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Promotions Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <FileDown className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
            <p className="text-slate-500 font-bold text-sm">Memuat daftar materi promosi...</p>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="text-center py-16 p-8">
            <FileDown className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada materi promosi</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Belum ada materi promosi yang cocok dengan filter atau pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-black tracking-widest uppercase">
                  <th className="py-4 px-6">Materi & Judul</th>
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6">Format & Ukuran</th>
                  <th className="py-4 px-6">Total Unduh</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPromotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-dstech-red flex items-center justify-center shrink-0">
                          {promo.fileType === "ZIP" ? (
                            <FolderArchive className="w-5 h-5" />
                          ) : promo.fileType === "PNG" ? (
                            <ImageIcon className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{promo.title}</p>
                          <p className="text-slate-400 text-[11px] line-clamp-1">{promo.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-dstech-blue font-bold text-[10px] uppercase tracking-wider">
                        {promo.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-black text-[10px]">
                          {promo.fileType}
                        </span>
                        <span className="text-slate-500 font-bold">{promo.fileSize}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800">{promo.downloadCount || 0} kali</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={promo.fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Unduh File"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => {
                            setSelectedPromo(promo);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Hapus Materi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: TAMBAH MATERI PROMOSI */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-dstech-red flex items-center justify-center">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Tambah Materi Promosi / Katalog</h3>
                  <p className="text-xs text-slate-400">Unggah brosur atau materi yang dapat diunduh mitra</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                  Judul Materi Promosi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: E-Katalog CCTV & Smart Home 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue focus:bg-white text-xs font-bold outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue focus:bg-white text-xs font-bold outline-none"
                  >
                    <option value="Katalog Produk">Katalog Produk</option>
                    <option value="Brosur Promosi">Brosur Promosi</option>
                    <option value="Panduan Mitra">Panduan Mitra</option>
                    <option value="Social Media Kit">Social Media Kit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                    Format File
                  </label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue focus:bg-white text-xs font-bold outline-none"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="ZIP">ZIP Archive</option>
                    <option value="PNG">PNG / Gambar</option>
                    <option value="DOCX">DOCX Word</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan gambaran isi katalog atau petunjuk promosi bagi mitra..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue focus:bg-white text-xs font-bold outline-none resize-none"
                ></textarea>
              </div>

              {/* Upload File Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Pilih File Dokumen / Brosur
                </label>
                <div className="flex items-center gap-3">
                  <label className="h-11 px-4 rounded-xl bg-dstech-blue text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? "Mengunggah..." : "Upload File"}</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.zip,.docx"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Atau masukkan URL / path file..."
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="flex-1 h-11 px-3 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold outline-none"
                  />
                </div>
                {fileUrl && (
                  <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> File terhubung: {fileUrl} ({fileSize || "Siap"})
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-6 py-3 rounded-xl bg-dstech-red hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Materi Promosi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS */}
      {isDeleteModalOpen && selectedPromo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 text-dstech-red flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Hapus Materi Promosi?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>"{selectedPromo.title}"</strong>? Materi ini tidak akan lagi dapat diunduh oleh mitra.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 transition-all"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
