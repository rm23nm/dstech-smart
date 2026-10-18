"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  Shield,
  Home,
  Tv,
  Car,
  Network,
  Code,
  Tag,
  Package,
  X,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export interface DstechSubCategory {
  id: string;
  name: string;
  slug: string;
}

export interface DstechCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  subCategories: DstechSubCategory[];
  productCount?: number;
}

const AVAILABLE_ICONS = [
  { name: "Shield", label: "Security & Proteksi", icon: Shield },
  { name: "Home", label: "Smart Home", icon: Home },
  { name: "Tv", label: "Display & Signage", icon: Tv },
  { name: "Car", label: "Parking & Barrier", icon: Car },
  { name: "Network", label: "Jaringan & IT", icon: Network },
  { name: "Code", label: "Software & Web", icon: Code },
  { name: "FolderTree", label: "Umum / Hirarki", icon: FolderTree },
  { name: "Layers", label: "Sistem Berlapis", icon: Layers },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<DstechCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isEditCatModalOpen, setIsEditCatModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected State
  const [activeCategory, setActiveCategory] = useState<DstechCategory | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<DstechSubCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "CATEGORY" | "SUBCATEGORY";
    categoryId: string;
    subCategoryId?: string;
    name: string;
  } | null>(null);

  // Form State
  const [catForm, setCatForm] = useState({
    name: "",
    icon: "Shield",
    description: "",
  });
  const [subForm, setSubForm] = useState({
    name: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Fetch categories failed:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter((cat) => {
      const matchCat =
        cat.name.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q));
      const matchSub = cat.subCategories?.some((s) => s.name.toLowerCase().includes(q));
      return matchCat || matchSub;
    });
  }, [categories, searchQuery]);

  // Statistics
  const totalSubCategories = useMemo(() => {
    return categories.reduce((acc, c) => acc + (c.subCategories?.length || 0), 0);
  }, [categories]);

  const totalProducts = useMemo(() => {
    return categories.reduce((acc, c) => acc + (c.productCount || 0), 0);
  }, [categories]);

  // Handle Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      showToast("Nama kategori tidak boleh kosong", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catForm.name.trim(),
          icon: catForm.icon,
          description: catForm.description.trim(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("Kategori utama berhasil ditambahkan!");
        setIsAddCatModalOpen(false);
        setCatForm({ name: "", icon: "Shield", description: "" });
        fetchCategories();
      } else {
        showToast(json.message || "Gagal membuat kategori", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Category
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory || !catForm.name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeCategory.id,
          name: catForm.name.trim(),
          icon: catForm.icon,
          description: catForm.description.trim(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("Kategori berhasil diperbarui!");
        setIsEditCatModalOpen(false);
        fetchCategories();
      } else {
        showToast(json.message || "Gagal mengubah kategori", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Sub-Category
  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory || !subForm.name.trim()) {
      showToast("Nama sub-kategori tidak boleh kosong", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SUBCATEGORY",
          categoryId: activeCategory.id,
          name: subForm.name.trim(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Sub-kategori berhasil ditambahkan ke ${activeCategory.name}!`);
        setIsAddSubModalOpen(false);
        setSubForm({ name: "" });
        fetchCategories();
      } else {
        showToast(json.message || "Gagal membuat sub-kategori", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Sub-Category
  const handleEditSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory || !activeSubCategory || !subForm.name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SUBCATEGORY",
          categoryId: activeCategory.id,
          subCategoryId: activeSubCategory.id,
          name: subForm.name.trim(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("Sub-kategori berhasil diperbarui!");
        setIsEditSubModalOpen(false);
        fetchCategories();
      } else {
        showToast(json.message || "Gagal mengubah sub-kategori", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete (Category or Sub-Category)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);

    try {
      let url = "";
      if (deleteTarget.type === "CATEGORY") {
        url = `/api/categories?categoryId=${encodeURIComponent(deleteTarget.categoryId)}`;
      } else {
        url = `/api/categories?type=SUBCATEGORY&categoryId=${encodeURIComponent(
          deleteTarget.categoryId
        )}&subCategoryId=${encodeURIComponent(deleteTarget.subCategoryId || "")}`;
      }

      const res = await fetch(url, { method: "DELETE" });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast(
          deleteTarget.type === "CATEGORY"
            ? "Kategori berhasil dihapus"
            : "Sub-kategori berhasil dihapus"
        );
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
        fetchCategories();
      } else {
        showToast(json.message || "Gagal menghapus", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for rendering icons
  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case "Shield":
        return <Shield className="w-6 h-6 text-dstech-blue" />;
      case "Home":
        return <Home className="w-6 h-6 text-green-600" />;
      case "Tv":
        return <Tv className="w-6 h-6 text-purple-600" />;
      case "Car":
        return <Car className="w-6 h-6 text-amber-600" />;
      case "Network":
        return <Network className="w-6 h-6 text-cyan-600" />;
      case "Code":
        return <Code className="w-6 h-6 text-pink-600" />;
      default:
        return <FolderTree className="w-6 h-6 text-dstech-red" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-bold text-sm animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success" ? "bg-slate-900 border border-slate-700" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-5 h-5 text-green-400" />
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
            <span className="text-dstech-blue">Kategori & Sub-Kategori</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FolderTree className="w-9 h-9 text-dstech-blue" />
            Manajemen Kategori & Sub-Kategori
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Kelola taksonomi kategori dan sub-kategori untuk katalog produk, e-store, dan sistem inventori.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="h-12 px-5 rounded-2xl bg-white border border-slate-200 hover:border-dstech-blue text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
          >
            <Package className="w-4 h-4 text-dstech-blue" />
            <span>Ke Inventaris Produk</span>
          </Link>
          <button
            onClick={() => {
              setCatForm({ name: "", icon: "Shield", description: "" });
              setIsAddCatModalOpen(true);
            }}
            className="h-12 px-6 rounded-2xl bg-dstech-blue text-white font-black text-xs uppercase tracking-wider hover:bg-dstech-red transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Kategori</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{categories.length}</h3>
            <p className="text-xs font-bold text-green-600 mt-1">Struktur Utama Terdaftar</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center">
            <FolderTree className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Sub-Kategori</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalSubCategories}</h3>
            <p className="text-xs font-bold text-dstech-blue mt-1">Klasifikasi Spesifik</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-dstech-red flex items-center justify-center">
            <Layers className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Produk Terkait</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalProducts}</h3>
            <p className="text-xs font-bold text-slate-500 mt-1">Item dalam Katalog</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-white/50 uppercase tracking-wider">Status Integrasi</p>
            <h3 className="text-2xl font-black text-white mt-1">Prefix dstech_</h3>
            <p className="text-xs font-bold text-green-400 mt-1">Aman & Terisolasi 100%</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center">
            <Shield className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori atau sub-kategori..."
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

        <div className="text-xs font-bold text-slate-500">
          Menampilkan <span className="text-slate-900 font-black">{filteredCategories.length}</span> dari{" "}
          <span className="text-slate-900 font-black">{categories.length}</span> Kategori
        </div>
      </div>

      {/* Categories Cards List */}
      {isLoading ? (
        <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-dstech-blue animate-spin" />
          <p className="text-sm font-bold text-slate-500">Memuat data kategori DSTech...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <FolderTree className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-700">Tidak ada kategori ditemukan</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
            {searchQuery
              ? `Tidak ada hasil pencarian untuk "${searchQuery}". Coba kata kunci lain.`
              : "Belum ada kategori yang ditambahkan. Buat kategori pertama Anda sekarang."}
          </p>
          <button
            onClick={() => {
              setCatForm({ name: "", icon: "Shield", description: "" });
              setIsAddCatModalOpen(true);
            }}
            className="mt-6 h-11 px-6 rounded-2xl bg-dstech-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-dstech-red transition-all"
          >
            + Tambah Kategori
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Category Header */}
              <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                    {renderIcon(cat.icon)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{cat.name}</h3>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {cat.id}
                      </span>
                      <span className="text-xs font-bold bg-blue-100 text-dstech-blue px-2.5 py-0.5 rounded-full">
                        {cat.subCategories?.length || 0} Sub-Kategori
                      </span>
                      {cat.productCount !== undefined && cat.productCount > 0 && (
                        <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Package className="w-3 h-3" /> {cat.productCount} Produk
                        </span>
                      )}
                    </div>
                    {cat.description && (
                      <p className="text-slate-500 font-medium text-xs mt-1.5 max-w-2xl">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setActiveCategory(cat);
                      setSubForm({ name: "" });
                      setIsAddSubModalOpen(true);
                    }}
                    className="h-10 px-4 rounded-xl bg-dstech-blue/10 hover:bg-dstech-blue hover:text-white text-dstech-blue font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Sub</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveCategory(cat);
                      setCatForm({
                        name: cat.name,
                        icon: cat.icon || "Shield",
                        description: cat.description || "",
                      });
                      setIsEditCatModalOpen(true);
                    }}
                    className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                    title="Edit Kategori"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget({
                        type: "CATEGORY",
                        categoryId: cat.id,
                        name: cat.name,
                      });
                      setIsDeleteModalOpen(true);
                    }}
                    className="h-10 w-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-Categories Chips Area */}
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-dstech-blue" />
                    Daftar Sub-Kategori ({cat.subCategories?.length || 0})
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Klik tombol edit atau hapus pada chip sub-kategori
                  </span>
                </div>

                {!cat.subCategories || cat.subCategories.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <p className="text-xs font-bold text-slate-400">
                      Belum ada sub-kategori pada kategori ini.
                    </p>
                    <button
                      onClick={() => {
                        setActiveCategory(cat);
                        setSubForm({ name: "" });
                        setIsAddSubModalOpen(true);
                      }}
                      className="mt-2 text-xs font-black text-dstech-blue hover:text-dstech-red inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Sub-Kategori Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {cat.subCategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="group flex items-center gap-2 pl-4 pr-2 py-2 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-dstech-blue/40 hover:shadow-sm transition-all"
                      >
                        <Tag className="w-3.5 h-3.5 text-dstech-blue shrink-0" />
                        <span className="font-bold text-xs text-slate-800">{sub.name}</span>
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity ml-2 border-l border-slate-200 pl-2">
                          <button
                            onClick={() => {
                              setActiveCategory(cat);
                              setActiveSubCategory(sub);
                              setSubForm({ name: sub.name });
                              setIsEditSubModalOpen(true);
                            }}
                            className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Edit Sub-Kategori"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget({
                                type: "SUBCATEGORY",
                                categoryId: cat.id,
                                subCategoryId: sub.id,
                                name: sub.name,
                              });
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 rounded-md hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                            title="Hapus Sub-Kategori"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Tambah Kategori Baru */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-dstech-blue flex items-center justify-center">
                  <FolderTree className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Tambah Kategori Baru</h3>
              </div>
              <button
                onClick={() => setIsAddCatModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-5 mt-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Security System, Smart Home"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-bold text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Pilih Icon Representatif
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = catForm.icon === item.name;
                    return (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setCatForm({ ...catForm, icon: item.name })}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                          isSelected
                            ? "bg-blue-50 border-dstech-blue text-dstech-blue shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[10px] truncate max-w-full">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi mengenai perangkat atau solusi dalam kategori ini..."
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-medium text-sm outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 rounded-xl bg-dstech-blue hover:bg-dstech-red font-black text-xs uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Kategori */}
      {isEditCatModalOpen && activeCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-dstech-blue flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Edit Kategori</h3>
              </div>
              <button
                onClick={() => setIsEditCatModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCategory} className="space-y-5 mt-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-bold text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Pilih Icon Representatif
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = catForm.icon === item.name;
                    return (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setCatForm({ ...catForm, icon: item.name })}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                          isSelected
                            ? "bg-blue-50 border-dstech-blue text-dstech-blue shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[10px] truncate max-w-full">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-medium text-sm outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditCatModalOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 rounded-xl bg-dstech-blue hover:bg-dstech-red font-black text-xs uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Perbarui Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Sub-Kategori */}
      {isAddSubModalOpen && activeCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">Tambah Sub-Kategori</h3>
                <p className="text-xs font-bold text-dstech-blue mt-0.5">
                  Induk: {activeCategory.name}
                </p>
              </div>
              <button
                onClick={() => setIsAddSubModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubCategory} className="space-y-5 mt-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Nama Sub-Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: CCTV IP Camera, Smart Door Lock"
                  value={subForm.name}
                  onChange={(e) => setSubForm({ name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-bold text-sm outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSubModalOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 rounded-xl bg-dstech-blue hover:bg-dstech-red font-black text-xs uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambahkan Sub"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Sub-Kategori */}
      {isEditSubModalOpen && activeCategory && activeSubCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">Edit Sub-Kategori</h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Kategori Induk: {activeCategory.name}
                </p>
              </div>
              <button
                onClick={() => setIsEditSubModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubCategory} className="space-y-5 mt-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Nama Sub-Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subForm.name}
                  onChange={(e) => setSubForm({ name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-dstech-blue font-bold text-sm outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditSubModalOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 rounded-xl bg-dstech-blue hover:bg-dstech-red font-black text-xs uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Perbarui Sub"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Hapus {deleteTarget.type === "CATEGORY" ? "Kategori" : "Sub-Kategori"}?
            </h3>
            <p className="text-slate-500 font-medium text-sm mt-2">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-bold text-slate-900">&ldquo;{deleteTarget.name}&rdquo;</span>? Tindakan ini
              tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDelete}
                className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 font-black text-xs uppercase tracking-wider text-white transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
