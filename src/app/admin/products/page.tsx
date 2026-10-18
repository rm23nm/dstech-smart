"use client"

import React, { useState, useEffect, useMemo } from "react";
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
  Filter
} from "lucide-react";

export interface ProductItem {
  id: string | number;
  name: string;
  category: string;
  price: number;
  stock: number;
  commission: string;
  commissionRate?: number;
  commissionType?: string;
  desc?: string;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORIES = [
  "All Categories",
  "Security",
  "Smart Home",
  "Software",
  "Visual",
  "Parking",
  "Jaringan & Fiber Optik",
  "Komunikasi",
  "Lainnya"
];

export default function ProductAdmin() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Security",
    price: "",
    stock: "",
    commission: "10",
    commissionType: "ONETIME",
    desc: ""
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
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

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter & Search logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === "All Categories" || 
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Handle Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      category: "Security",
      price: "",
      stock: "",
      commission: "10",
      commissionType: "ONETIME",
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
      price: String(product.price),
      stock: String(product.stock),
      commission: String(product.commissionRate || parseInt(String(product.commission).replace(/[^0-9]/g, ""), 10) || 10),
      commissionType: product.commissionType || "ONETIME",
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
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      commission: `${formData.commission}%`,
      commissionRate: parseInt(formData.commission, 10) || 10,
      commissionType: formData.commissionType,
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
      showToast("Produk baru berhasil ditambahkan (Lokal)!");
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
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      commission: `${formData.commission}%`,
      commissionRate: parseInt(formData.commission, 10) || 10,
      commissionType: formData.commissionType,
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
        showToast(`Produk "${selectedProduct.name}" berhasil dihapus!`);
      } else {
        showToast(data.message || "Gagal menghapus produk.", "error");
      }
    } catch {
      // Local fallback
      const updated = products.filter((p) => String(p.id) !== String(selectedProduct.id));
      setProducts(updated);
      localStorage.setItem("dstech_products_inventory", JSON.stringify(updated));
      setIsDeleteModalOpen(false);
      showToast(`Produk "${selectedProduct.name}" berhasil dihapus (Lokal)!`);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 animate-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-slate-900 text-white border border-emerald-500/40"
              : "bg-red-600 text-white shadow-red-500/30"
          }`}
        >
          {toastMessage.type === "success" ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
          <span className="font-bold text-sm">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Product Inventory</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-1">
            Kelola katalog produk, stok, harga, dan pengaturan komisi mitra DSTech Smart
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="h-13 sm:h-14 px-6 sm:px-8 rounded-2xl bg-dstech-red hover:bg-red-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-red-500/25 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Tambah Produk
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
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
            {CATEGORIES.map((cat) => (
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
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <Package className="w-6 h-6 text-dstech-blue" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-dstech-blue transition-colors">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {p.category}
                            </span>
                            {p.commissionType && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                {p.commissionType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 sm:p-6 text-center font-bold text-slate-900 text-sm sm:text-base">
                      Rp {Number(p.price || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="p-5 sm:p-6 text-center">
                      <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-dstech-blue font-bold text-xs">
                        {p.stock} Unit
                      </span>
                    </td>
                    <td className="p-5 sm:p-6 text-center">
                      <span className="px-3.5 py-1.5 rounded-full bg-red-50 text-dstech-red font-bold text-xs">
                        {p.commission || `${p.commissionRate || 10}%`} Fee
                      </span>
                    </td>
                    <td className="p-5 sm:p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Produk"
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-dstech-blue hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(p)}
                          title="Hapus Produk"
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"
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
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Tambah Produk Baru</h3>
                <p className="text-slate-400 font-medium text-xs mt-0.5">Lengkapi formulir untuk memasukkan produk ke inventaris</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  disabled={formSubmitting}
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
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-dstech-blue bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  disabled={formSubmitting}
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

      {/* MODAL: Konfirmasi Hapus Produk */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Hapus Produk Ini?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk <strong className="text-slate-900">"{selectedProduct.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="h-11 px-5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={formSubmitting}
                onClick={handleDeleteSubmit}
                className="h-11 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 disabled:opacity-50"
              >
                {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Ya, Hapus Produk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
