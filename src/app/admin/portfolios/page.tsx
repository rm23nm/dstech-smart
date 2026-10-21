"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Edit2,
  Trash2,
  Play,
  Video,
  ImageIcon,
  UploadCloud,
  X,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Building2,
  Store,
  MapPin,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PortfolioItem } from "@/app/api/portfolios/route";

const CATEGORIES = [
  "Semua Sektor",
  "Industrial",
  "Residential",
  "Medical",
  "Hospitality",
  "Corporate",
  "Pemerintahan",
  "Lainnya"
];

// Helper to convert YouTube watch link to embed link
function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
  } catch {
    // ignore
  }
  return url;
}

export default function PortfoliosAdminPage() {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Sektor");
  const [selectedEntityTab, setSelectedEntityTab] = useState<"ALL" | "PT" | "NON_PT">("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<{ title: string; url: string } | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    client: string;
    category: string;
    entityType: "PT" | "NON_PT";
    location: string;
    completionDate: string;
    description: string;
    image: string;
    videoUrl: string;
  }>({
    title: "",
    client: "",
    category: "Industrial",
    entityType: "PT",
    location: "Cilegon, Banten",
    completionDate: "",
    description: "",
    image: "",
    videoUrl: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch portfolios from API
  const fetchPortfolios = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/portfolios");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPortfolios(json.data);
          localStorage.setItem("dstech_portfolios_cache", JSON.stringify(json.data));
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("API fetch error, falling back to cache:", err);
    }

    const cached = localStorage.getItem("dstech_portfolios_cache");
    if (cached) {
      try {
        setPortfolios(JSON.parse(cached));
      } catch {}
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  // Filtered list
  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p) => {
      const matchEntity =
        selectedEntityTab === "ALL" ||
        (selectedEntityTab === "PT" && (p.entityType || "PT") === "PT") ||
        (selectedEntityTab === "NON_PT" && p.entityType === "NON_PT");

      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === "Semua Sektor" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchEntity && matchSearch && matchCategory;
    });
  }, [portfolios, searchQuery, selectedCategory, selectedEntityTab]);

  // Statistics
  const countPT = useMemo(() => portfolios.filter((p) => (p.entityType || "PT") === "PT").length, [portfolios]);
  const countNonPT = useMemo(() => portfolios.filter((p) => p.entityType === "NON_PT").length, [portfolios]);

  const stats = useMemo(() => {
    const total = filteredPortfolios.length;
    const withVideo = filteredPortfolios.filter((p) => p.videoUrl && p.videoUrl.trim() !== "").length;
    const withPhoto = filteredPortfolios.filter((p) => p.image && p.image.trim() !== "").length;
    const sectors = new Set(filteredPortfolios.map((p) => p.category)).size;
    return { total, withVideo, withPhoto, sectors };
  }, [filteredPortfolios]);

  // Handle Image Upload via /api/upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (result.success && result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        showToast("Foto proyek berhasil diunggah!");
      } else {
        showToast(result.message || "Gagal mengunggah foto.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat mengunggah foto.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      title: "",
      client: "",
      category: "Industrial",
      entityType: selectedEntityTab === "NON_PT" ? "NON_PT" : "PT",
      location: "Cilegon, Banten",
      completionDate: new Date().toISOString().slice(0, 7),
      description: "",
      image: "",
      videoUrl: "",
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p: PortfolioItem) => {
    setSelectedPortfolio(p);
    setFormData({
      title: p.title,
      client: p.client,
      category: p.category,
      entityType: p.entityType || "PT",
      location: p.location || "",
      completionDate: p.completionDate || "",
      description: p.description || "",
      image: p.image || "",
      videoUrl: p.videoUrl || "",
    });
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (p: PortfolioItem) => {
    setSelectedPortfolio(p);
    setIsDeleteModalOpen(true);
  };

  // Submit Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.client.trim()) {
      showToast("Judul proyek dan nama klien wajib diisi", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast("Proyek portofolio baru berhasil ditambahkan!");
        setIsAddModalOpen(false);
        fetchPortfolios();
      } else {
        showToast(json.message || "Gagal menambahkan portofolio", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortfolio) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/portfolios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPortfolio.id,
          ...formData,
        }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast("Proyek portofolio berhasil diperbarui!");
        setIsEditModalOpen(false);
        fetchPortfolios();
      } else {
        showToast(json.message || "Gagal memperbarui portofolio", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!selectedPortfolio) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/portfolios?id=${encodeURIComponent(selectedPortfolio.id)}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast("Proyek portofolio berhasil dihapus!");
        setIsDeleteModalOpen(false);
        setSelectedPortfolio(null);
        fetchPortfolios();
      } else {
        showToast(json.message || "Gagal menghapus portofolio", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-bold text-sm animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success" ? "bg-slate-900 border border-slate-700" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-dstech-blue">Portofolio Proyek</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FolderKanban className="w-9 h-9 text-dstech-blue" />
            Manajemen Portofolio Proyek
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Kelola proyek yang telah selesai dikerjakan, upload foto hasil instalasi, dan sematkan video dokumentasi pekerjaan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#portofolio"
            target="_blank"
            className="h-12 px-5 rounded-2xl bg-white border border-slate-200 hover:border-dstech-blue text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-dstech-blue" />
            <span>Lihat di Beranda</span>
          </Link>
          <button
            onClick={handleOpenAdd}
            className="h-12 px-6 rounded-2xl bg-dstech-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-500/20 flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Pemisahan Entitas PT vs Non-PT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Portofolio PT
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{countPT}</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">PT. DSTech Smart Perkasa</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" /> Portofolio Non-PT
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{countNonPT}</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">Toko Fisik / Servis Toko</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Store className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Dokumentasi Foto</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.withPhoto}</h3>
            <p className="text-xs font-bold text-slate-500 mt-1">Foto Hasil Pekerjaan</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ImageIcon className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-white/50 uppercase tracking-wider">Tampil Di Website</p>
            <h3 className="text-2xl font-black text-white mt-1">Hanya Portofolio PT</h3>
            <p className="text-xs font-bold text-green-400 mt-1">Publik Terisolasi 100%</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center">
            <Video className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Entity Selector Tab Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-slate-100 rounded-3xl">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedEntityTab("ALL")}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
              selectedEntityTab === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua Portofolio ({portfolios.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedEntityTab("PT")}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              selectedEntityTab === "PT"
                ? "bg-dstech-blue text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>🏢 PT. DSTech Smart Perkasa</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedEntityTab === "PT" ? "bg-white/20" : "bg-blue-100 text-dstech-blue"}`}>
              {countPT}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedEntityTab("NON_PT")}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              selectedEntityTab === "NON_PT"
                ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>🏪 Non-PT / DSTech Smart</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedEntityTab === "NON_PT" ? "bg-white/20" : "bg-amber-100 text-amber-700"}`}>
              {countNonPT}
            </span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama proyek, klien, sektor, atau lokasi..."
            className="w-full h-11 pl-11 pr-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-dstech-blue text-sm font-medium outline-none transition-all"
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

        <div className="w-full md:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700 text-xs uppercase tracking-wider focus:outline-none focus:border-dstech-blue transition-all"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Portfolios Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="p-5 sm:p-6">Proyek & Klien</th>
                <th className="p-5 sm:p-6">Sektor</th>
                <th className="p-5 sm:p-6">Lokasi & Tanggal</th>
                <th className="p-5 sm:p-6 text-center">Video Dokumentasi</th>
                <th className="p-5 sm:p-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 text-dstech-blue animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold">Memuat portofolio proyek...</p>
                  </td>
                </tr>
              ) : filteredPortfolios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-400">
                    <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">Tidak ada proyek portofolio ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba kata kunci pencarian lain atau tambahkan proyek baru.</p>
                  </td>
                </tr>
              ) : (
                filteredPortfolios.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="p-5 sm:p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black text-dstech-blue uppercase tracking-widest">
                              {item.client}
                            </p>
                            {item.entityType === "NON_PT" ? (
                              <span className="text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Store className="w-2.5 h-2.5 text-amber-600" /> Non-PT / DSTech Smart
                              </span>
                            ) : (
                              <span className="text-[9px] font-black bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Building2 className="w-2.5 h-2.5 text-dstech-blue" /> PT. DSTech
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-dstech-red transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium line-clamp-1 max-w-md mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-5 sm:p-6">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                        {item.category}
                      </span>
                    </td>

                    <td className="p-5 sm:p-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.location || "Banten"}</span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.completionDate || "Selesai"}</span>
                        </p>
                      </div>
                    </td>

                    <td className="p-5 sm:p-6 text-center">
                      {item.videoUrl && item.videoUrl.trim() ? (
                        <button
                          onClick={() => setActiveVideoModal({ title: item.title, url: item.videoUrl || "" })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors border border-emerald-200 active:scale-95 shadow-sm"
                          title="Putar Video Dokumentasi"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Tonton Video</span>
                        </button>
                      ) : (
                        <span className="inline-block text-[11px] font-medium text-slate-400 italic">
                          Belum ada video
                        </span>
                      )}
                    </td>

                    <td className="p-5 sm:p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl text-slate-500 hover:text-dstech-blue hover:bg-blue-50 transition-colors"
                          title="Edit Portofolio"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus Portofolio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah Proyek Portofolio Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-dstech-red flex items-center justify-center">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Tambah Portofolio Proyek Baru</h3>
                  <p className="text-xs text-slate-400">Publikasikan rekam jejak pekerjaan PT. DSTech Smart Perkasa</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5 mt-6">
              {/* Selector Entitas PT vs Non-PT */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Entitas Bisnis Proyek <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, entityType: "PT" })}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      formData.entityType === "PT"
                        ? "bg-blue-50 border-dstech-blue text-dstech-blue ring-2 ring-blue-300"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-dstech-blue" />
                    </div>
                    <div>
                      <p className="font-black text-xs">PT. DSTech</p>
                      <p className="text-[10px] text-slate-400">Tampil di Web Utama</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, entityType: "NON_PT" })}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      formData.entityType === "NON_PT"
                        ? "bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-300"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-black text-xs">Non-PT / DSTech Smart</p>
                      <p className="text-[10px] text-slate-400">Servis & Usaha Mandiri</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Judul Proyek <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: CCTV System & Fiber Optic"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-bold text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Nama Klien / Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT. POSCO ENERGY CILEGON"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-bold text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Sektor Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-bold text-xs uppercase outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== "Semua Sektor").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Lokasi Proyek
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Cilegon, Serang"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-medium text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Bulan Selesai
                  </label>
                  <input
                    type="month"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-medium text-sm outline-none"
                  />
                </div>
              </div>

              {/* Upload Foto Hasil Kerja */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Foto Hasil Kerja / Dokumentasi Lapangan
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
                  {formData.image ? (
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm shrink-0">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
                        title="Hapus foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-20 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold">Belum Ada</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-dstech-blue text-xs font-bold text-slate-700 shadow-sm transition-all">
                        <UploadCloud className="w-4 h-4 text-dstech-blue" />
                        <span>{uploadingImage ? "Mengunggah..." : "Pilih File Foto..."}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Atau tempel URL foto (https://...)"
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-dstech-blue font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Video Dokumentasi Link */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-emerald-600" />
                  Link Video Dokumentasi Proyek (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-medium text-sm outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Mendukung link video YouTube atau link file MP4. Video akan dapat diputar langsung oleh calon klien di beranda.
                </p>
              </div>

              {/* Deskripsi Pekerjaan */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Rincian Deskripsi Pekerjaan
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan ruang lingkup pekerjaan, perangkat yang dipasang, tantangan, dan solusi yang diimplementasikan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-medium text-sm outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-dstech-red hover:bg-red-700 font-black text-xs uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Proyek Portofolio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Portofolio */}
      {isEditModalOpen && selectedPortfolio && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-dstech-blue flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Edit Portofolio Proyek</h3>
                  <p className="text-xs text-slate-400">Perbarui dokumentasi dan informasi proyek</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5 mt-6">
              {/* Selector Entitas PT vs Non-PT */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Entitas Bisnis Proyek <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, entityType: "PT" })}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      formData.entityType === "PT"
                        ? "bg-blue-50 border-dstech-blue text-dstech-blue ring-2 ring-blue-300"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-dstech-blue" />
                    </div>
                    <div>
                      <p className="font-black text-xs">PT. DSTech</p>
                      <p className="text-[10px] text-slate-400">Tampil di Web Utama</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, entityType: "NON_PT" })}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      formData.entityType === "NON_PT"
                        ? "bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-300"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-black text-xs">Non-PT / DSTech Smart</p>
                      <p className="text-[10px] text-slate-400">Servis & Usaha Mandiri</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Judul Proyek <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-bold text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Nama Klien / Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-bold text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Sektor Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-bold text-xs uppercase outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== "Semua Sektor").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Lokasi Proyek
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-medium text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Bulan Selesai
                  </label>
                  <input
                    type="month"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-medium text-sm outline-none"
                  />
                </div>
              </div>

              {/* Upload Foto Hasil Kerja */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Foto Hasil Kerja / Dokumentasi Lapangan
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
                  {formData.image ? (
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm shrink-0">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
                        title="Hapus foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-20 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold">Belum Ada</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-dstech-blue text-xs font-bold text-slate-700 shadow-sm transition-all">
                        <UploadCloud className="w-4 h-4 text-dstech-blue" />
                        <span>{uploadingImage ? "Mengunggah..." : "Ganti File Foto..."}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Atau tempel URL foto (https://...)"
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-dstech-blue font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Video Dokumentasi Link */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-emerald-600" />
                  Link Video Dokumentasi Proyek
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-medium text-sm outline-none"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Rincian Deskripsi Pekerjaan
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-medium text-sm outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-dstech-blue hover:bg-blue-700 font-black text-xs uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Perbarui Proyek"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus */}
      {isDeleteModalOpen && selectedPortfolio && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Hapus Proyek Portofolio?</h3>
            <p className="text-slate-500 font-medium text-sm mt-2">
              Apakah Anda yakin ingin menghapus data proyek{" "}
              <span className="font-bold text-slate-900">&ldquo;{selectedPortfolio.title}&rdquo;</span>? Proyek ini tidak akan tampil lagi di beranda.
            </p>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedPortfolio(null);
                }}
                className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 font-black text-xs uppercase tracking-wider text-white transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Video Player Lightbox */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 text-white">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base truncate max-w-md">{activeVideoModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              {activeVideoModal.url.includes("youtube.com") || activeVideoModal.url.includes("youtu.be") ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideoModal.url) || ""}
                  title={activeVideoModal.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video src={activeVideoModal.url} controls autoPlay className="w-full h-full object-contain">
                  Browser Anda tidak mendukung tag video.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
