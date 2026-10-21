"use client"

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  ArrowUpDown,
  Filter,
  UploadCloud,
  ImageIcon,
  FolderTree,
  Tag,
  Building2,
  Store
} from "lucide-react";

export interface ProductItem {
  id: string | number;
  name: string;
  category: string;
  subCategory?: string;
  entityType?: "PT" | "NON_PT";
  price: number;
  stock: number;
  commission: string;
  commissionRate?: number;
  commissionType?: string;
  image?: string;
  desc?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  entityType?: "PT" | "NON_PT";
  subCategories: { id: string; name: string; slug: string }[];
}

const CATEGORIES = [
  "All Categories",
  "Security System",
  "Smart Home & Automation",
  "Visual Display & Signage",
  "Parking & Barrier System",
  "Jaringan & IT Infrastructure",
  "Software & Web Development",
  "Lainnya"
];

export default function ProductAdmin() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedEntityTab, setSelectedEntityTab] = useState<"ALL" | "PT" | "NON_PT">("ALL");
  const [dynamicCategories, setDynamicCategories] = useState<CategoryOption[]>([]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    subCategory: string;
    entityType: "PT" | "NON_PT";
    price: string;
    stock: string;
    commission: string;
    commissionType: string;
    image: string;
    desc: string;
  }>({
    name: "",
    category: "Security System",
    subCategory: "",
    entityType: "PT",
    price: "",
    stock: "10",
    commission: "10",
    commissionType: "ONETIME",
    image: "",
    desc: ""
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Show auto-dismissing toast
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch products from API on mount
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
          localStorage.setItem("dstech_products_inventory", JSON.stringify(json.data));
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to localStorage if API request fails
      const local = localStorage.getItem("dstech_products_inventory");
      if (local) {
        try {
          setProducts(JSON.parse(local));
          setIsLoading(false);
          return;
        } catch {
          // parse error
        }
      }
    }
    setIsLoading(false);
  };

  // Fetch dynamic categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDynamicCategories(json.data);
        }
      }
    } catch (err) {
      console.warn("Fetch categories error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Category & Sub-Category Options
  const categoryList = useMemo(() => {
    if (dynamicCategories.length > 0) {
      return ["All Categories", ...dynamicCategories.map((c) => c.name)];
    }
    return CATEGORIES;
  }, [dynamicCategories]);

  const currentSubCategories = useMemo(() => {
    const found = dynamicCategories.find(
      (c) => c.name.toLowerCase() === formData.category.toLowerCase()
    );
    return found?.subCategories || [];
  }, [dynamicCategories, formData.category]);

  // Filter & Search logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesEntity =
        selectedEntityTab === "ALL" ||
        (selectedEntityTab === "PT" && (p.entityType || "PT") === "PT") ||
        (selectedEntityTab === "NON_PT" && p.entityType === "NON_PT");

      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === "All Categories" || 
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesEntity && matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory, selectedEntityTab]);

  // Statistics
  const countPT = useMemo(() => products.filter((p) => (p.entityType || "PT") === "PT").length, [products]);
  const countNonPT = useMemo(() => products.filter((p) => p.entityType === "NON_PT").length, [products]);
  const totalStockCount = useMemo(() => filteredProducts.reduce((sum, p) => sum + (p.stock || 0), 0), [filteredProducts]);

  // Handle Image Upload via API
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
        showToast("Gambar produk berhasil diunggah!");
      } else {
        showToast(result.message || "Gagal mengunggah gambar.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat mengunggah gambar.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Open Add Modal
  const handleOpenAdd = () => {
    const defaultCat = dynamicCategories.length > 0 ? dynamicCategories[0].name : "Security System";
    const defaultSub = dynamicCategories.length > 0 && dynamicCategories[0].subCategories?.length > 0
      ? dynamicCategories[0].subCategories[0].name
      : "";
    setFormData({
      name: "",
      category: defaultCat,
      subCategory: defaultSub,
      entityType: selectedEntityTab === "NON_PT" ? "NON_PT" : "PT",
      price: "",
      stock: "10",
      commission: "10",
      commissionType: "ONETIME",
      image: "",
      desc: ""
    });
    setIsAddModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (product: ProductItem) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      subCategory: product.subCategory || "",
      entityType: product.entityType || "PT",
      price: String(product.price),
      stock: String(product.stock),
      commission: String(product.commissionRate || parseInt(String(product.commission).replace(/[^0-9]/g, ""), 10) || 10),
      commissionType: product.commissionType || "ONETIME",
      image: product.image || "",
      desc: product.desc || ""
    });
    setIsEditModalOpen(true);
  };

  // Handle Open Delete Modal
  const handleOpenDelete = (product: ProductItem) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Submit Add Product
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Nama produk tidak boleh kosong!", "error");
      return;
    }

    setFormSubmitting(true);
    const newPayload = {
      name: formData.name.trim(),
      category: formData.category,
      subCategory: formData.subCategory?.trim() || "",
      entityType: formData.entityType || "PT",
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      commission: `${formData.commission}%`,
      commissionRate: parseInt(formData.commission, 10) || 10,
      commissionType: formData.commissionType,
      image: formData.image.trim(),
      desc: formData.desc.trim()
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayload)
      });
      const data = await res.json();

      if (data.success && data.data) {
        const updated = [data.data, ...products];
        setProducts(updated);
        localStorage.setItem("dstech_products_inventory", JSON.stringify(updated));
        setIsAddModalOpen(false);
        showToast("Produk baru berhasil ditambahkan!");
      } else {
        showToast(data.message || "Gagal menambahkan produk.", "error");
      }
    } catch {
      // Local fallback
      const localNew: ProductItem = {
        id: `dstech_prod_${Date.now()}`,
        ...newPayload,
        createdAt: new Date().toISOString()
      };
      const updated = [localNew, ...products];
      setProducts(updated);
      localStorage.setItem("dstech_products_inventory", JSON.stringify(updated));
      setIsAddModalOpen(false);
      showToast("Produk baru ditambahkan (Penyimpanan Lokal)!");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Edit Product
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!formData.name.trim()) {
      showToast("Nama produk tidak boleh kosong!", "error");
      return;
    }

    setFormSubmitting(true);
    const updatedPayload = {
      id: selectedProduct.id,
      name: formData.name.trim(),
      category: formData.category,
      subCategory: formData.subCategory?.trim() || "",
      entityType: formData.entityType || "PT",
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      commission: `${formData.commission}%`,
      commissionRate: parseInt(formData.commission, 10) || 10,
      commissionType: formData.commissionType,
      image: formData.image.trim(),
      desc: formData.desc.trim()
    };

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload)
      });
      const data = await res.json();

      if (data.success && data.data) {
        const updated = products.map((p) => (String(p.id) === String(selectedProduct.id) ? data.data : p));
        setProducts(updated);
        localStorage.setItem("dstech_products_inventory", JSON.stringify(updated));
        setIsEditModalOpen(false);
        showToast("Produk berhasil diperbarui!");
      } else {
        showToast(data.message || "Gagal memperbarui produk.", "error");
      }
    } catch {
      // Local fallback
      const updated = products.map((p) =>
        String(p.id) === String(selectedProduct.id) ? { ...p, ...updatedPayload } : p
      );
      setProducts(updated);
      localStorage.setItem("dstech_products_inventory", JSON.stringify(updated));
      setIsEditModalOpen(false);
      showToast("Produk berhasil diperbarui (Lokal)!");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Delete Product
  const handleDeleteSubmit = async () => {
    if (!selectedProduct) return;
    setFormSubmitting(true);

    try {
      const res = await fetch(`/api/products?id=${selectedProduct.id}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (data.success) {
        const updated = products.filter((p) => String(p.id) !== String(selectedProduct.id));
        setProducts(updated);
        localStorage.setItem("dstech_products_inventory", JSON.stringify(updated));
        setIsDeleteModalOpen(false);
        showToast("Produk berhasil dihapus!");
      } else {
        showToast(data.message || "Gagal menghapus produk.", "error");
      }
    } catch {
      // Local fallback
      const updated = products.filter((p) => String(p.id) !== String(selectedProduct.id));
      setProducts(updated);
      localStorage.setItem("dstech_products_inventory", JSON.stringify(updated));
      setIsDeleteModalOpen(false);
      showToast("Produk berhasil dihapus (Lokal)!");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-bold text-xs uppercase tracking-wider transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toastMessage.type === "success" ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product Inventory</h2>
          <p className="text-slate-400 font-medium text-xs mt-1">
            Kelola inventaris hardware CCTV, Smart Home, Running Text, Barrier Gate, dan Software
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/categories"
            className="h-12 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
          >
            <FolderTree className="w-4 h-4 text-dstech-blue" />
            <span>Kelola Kategori & Sub</span>
          </Link>
          <button
            onClick={handleOpenAdd}
            id="btn-add-product"
            className="h-12 px-6 rounded-2xl bg-dstech-red hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Pemisahan Entitas PT vs Non-PT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Produk PT
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
              <Store className="w-3.5 h-3.5" /> Produk Non-PT
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{countNonPT}</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">Toko Fisik / Ritel DSTech</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Store className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Stok Fisik</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalStockCount}</h3>
            <p className="text-xs font-bold text-dstech-blue mt-1">Unit Siap Alokasi</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-white/50 uppercase tracking-wider">Tampil Di Website</p>
            <h3 className="text-2xl font-black text-white mt-1">Hanya Produk PT</h3>
            <p className="text-xs font-bold text-green-400 mt-1">Publik Terisolasi 100%</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center">
            <Tag className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Entity Selector Tab Bar & Search */}
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
            Semua Produk ({products.length})
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
            <span>🏪 Non-PT / Toko DStech</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedEntityTab === "NON_PT" ? "bg-white/20" : "bg-amber-100 text-amber-700"}`}>
              {countNonPT}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama produk atau kategori..."
            className="w-full h-12 sm:h-14 pl-14 pr-5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-dstech-blue focus:bg-white font-medium text-sm text-slate-800 placeholder:text-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-12 sm:h-14 px-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700 text-xs uppercase tracking-wider focus:outline-none focus:border-dstech-blue transition-all"
          >
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-5 sm:p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Info Produk</th>
                <th className="p-5 sm:p-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Harga</th>
                <th className="p-5 sm:p-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Stok</th>
                <th className="p-5 sm:p-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Komisi Afiliasi</th>
                <th className="p-5 sm:p-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-dstech-blue animate-spin" />
                      <span>Memuat data inventaris produk...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-12 h-12 text-slate-300" />
                      <span className="text-base font-bold text-slate-600">Tidak ada produk yang cocok</span>
                      <span className="text-xs text-slate-400">Silakan ubah kata kunci pencarian atau tambah produk baru</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="p-5 sm:p-6">
                      <div className="flex items-center gap-4">
                        {p.image ? (
                          <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 bg-white shadow-sm">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <Package className="w-6 h-6 text-dstech-blue" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-dstech-blue transition-colors">
                            {p.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {p.entityType === "NON_PT" ? (
                              <span className="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Store className="w-3 h-3 text-amber-600" /> Non-PT / Toko
                              </span>
                            ) : (
                              <span className="text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-dstech-blue" /> PT. DSTech
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {p.category}
                            </span>
                            {p.subCategory && (
                              <span className="text-[10px] font-semibold text-dstech-blue bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5" />
                                {p.subCategory}
                              </span>
                            )}
                            {p.commissionType && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                {p.commissionType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 sm:p-6 text-center font-black text-slate-900 text-sm sm:text-base">
                      Rp {p.price.toLocaleString("id-ID")}
                    </td>
                    <td className="p-5 sm:p-6 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          p.stock > 10
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : p.stock > 0
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}
                      >
                        {p.stock} Unit
                      </span>
                    </td>
                    <td className="p-5 sm:p-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xs font-black text-dstech-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                          {p.commission}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          ≈ Rp {((p.price * (p.commissionRate || 10)) / 100).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 sm:p-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-dstech-blue border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(p)}
                          className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer"
                          title="Hapus Produk"
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

      {/* MODAL: Tambah Produk */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Tambah Produk Baru</h3>
                <p className="text-slate-400 font-medium text-xs mt-0.5">Isi data kelengkapan produk dan komisi penjualan</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Selector Entitas PT vs Non-PT */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Entitas Bisnis Produk <span className="text-red-500">*</span>
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
                      <p className="font-black text-xs">Non-PT / Toko</p>
                      <p className="text-[10px] text-slate-400">Ritel Fisik Toko</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Produk <span className="text-dstech-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: CCTV Hikvision 8CH Full HD"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue"
                />
              </div>

              {/* Upload Gambar Produk */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Foto / Gambar Produk
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
                  {formData.image ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex-shrink-0 group">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow"
                        title="Hapus gambar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                      <UploadCloud className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400">Belum Ada</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-dstech-blue text-xs font-bold text-slate-700 hover:text-dstech-blue shadow-sm transition-all">
                        <UploadCloud className="w-4 h-4 text-dstech-blue" />
                        <span>{uploadingImage ? "Mengunggah..." : "Pilih File Gambar..."}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Atau tempelkan URL gambar (https://...)"
                        className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-dstech-blue"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Format: JPG, PNG, WEBP (Maksimal 10MB)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Kategori
                    </label>
                    <Link
                      href="/admin/categories"
                      target="_blank"
                      className="text-[10px] font-bold text-dstech-blue hover:underline flex items-center gap-1"
                    >
                      <FolderTree className="w-3 h-3" /> Kelola
                    </Link>
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const found = dynamicCategories.find((c) => c.name.toLowerCase() === newCat.toLowerCase());
                      const firstSub = found && found.subCategories?.length > 0 ? found.subCategories[0].name : "";
                      setFormData({ ...formData, category: newCat, subCategory: firstSub });
                    }}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue bg-white"
                  >
                    {dynamicCategories.length > 0
                      ? dynamicCategories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))
                      : CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sub-Kategori
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue bg-white"
                  >
                    <option value="">-- Pilih Sub-Kategori (Opsional) --</option>
                    {currentSubCategories.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Harga (Rp) <span className="text-dstech-red">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Contoh: 3500000"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Stok (Unit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="10"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Komisi (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                    placeholder="10"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipe Komisi
                  </label>
                  <select
                    value={formData.commissionType}
                    onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue bg-white"
                  >
                    <option value="ONETIME">ONETIME</option>
                    <option value="RECURRING">RECURRING</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deskripsi / Keterangan Produk
                </label>
                <textarea
                  rows={3}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Keterangan singkat mengenai kelengkapan produk atau layanan..."
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-11 px-5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || uploadingImage}
                  className="h-11 px-6 rounded-xl bg-dstech-red hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-red-500/25 active:scale-95 disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Produk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Produk */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Edit Produk</h3>
                <p className="text-slate-400 font-medium text-xs mt-0.5">Perbarui informasi produk: {selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Selector Entitas PT vs Non-PT */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Entitas Bisnis Produk <span className="text-red-500">*</span>
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
                      <p className="font-black text-xs">Non-PT / Toko</p>
                      <p className="text-[10px] text-slate-400">Ritel Fisik Toko</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Produk <span className="text-dstech-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue"
                />
              </div>

              {/* Upload Gambar Produk */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Foto / Gambar Produk
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
                  {formData.image ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex-shrink-0 group">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow"
                        title="Hapus gambar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                      <UploadCloud className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400">Belum Ada</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-dstech-blue text-xs font-bold text-slate-700 hover:text-dstech-blue shadow-sm transition-all">
                        <UploadCloud className="w-4 h-4 text-dstech-blue" />
                        <span>{uploadingImage ? "Mengunggah..." : "Ganti Gambar..."}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Atau tempelkan URL gambar (https://...)"
                        className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-dstech-blue"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Format: JPG, PNG, WEBP (Maksimal 10MB)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Kategori
                    </label>
                    <Link
                      href="/admin/categories"
                      target="_blank"
                      className="text-[10px] font-bold text-dstech-blue hover:underline flex items-center gap-1"
                    >
                      <FolderTree className="w-3 h-3" /> Kelola
                    </Link>
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const found = dynamicCategories.find((c) => c.name.toLowerCase() === newCat.toLowerCase());
                      const firstSub = found && found.subCategories?.length > 0 ? found.subCategories[0].name : "";
                      setFormData({ ...formData, category: newCat, subCategory: firstSub });
                    }}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue bg-white"
                  >
                    {dynamicCategories.length > 0
                      ? dynamicCategories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))
                      : CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sub-Kategori
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue bg-white"
                  >
                    <option value="">-- Pilih Sub-Kategori (Opsional) --</option>
                    {currentSubCategories.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Harga (Rp) <span className="text-dstech-red">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Stok (Unit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Komisi (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipe Komisi
                  </label>
                  <select
                    value={formData.commissionType}
                    onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue bg-white"
                  >
                    <option value="ONETIME">ONETIME</option>
                    <option value="RECURRING">RECURRING</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deskripsi / Keterangan Produk
                </label>
                <textarea
                  rows={3}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-11 px-5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || uploadingImage}
                  className="h-11 px-6 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Perbarui Produk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Hapus Produk */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-dstech-red flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center">Hapus Produk Ini?</h3>
            <p className="text-slate-500 font-medium text-xs text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk <strong className="text-slate-800">&quot;{selectedProduct.name}&quot;</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={formSubmitting}
                onClick={handleDeleteSubmit}
                id="btn-confirm-delete-product"
                className="flex-1 h-11 rounded-xl bg-dstech-red hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 active:scale-95 disabled:opacity-50"
              >
                {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
