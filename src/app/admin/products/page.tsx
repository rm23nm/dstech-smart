"use client"

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
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
  Store,
  FileText,
  Download,
  Star,
  Send,
  Sparkles,
  Eye,
  Wand2,
  FileSpreadsheet,
  FileUp,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from "lucide-react";
import { parseHtmlClipboard, cleanDescriptionText, ProductDescriptionViewer } from "@/utils/dstech_desc_formatter";

export interface ProductItem {
  id: string | number;
  name: string;
  category: string;
  subCategory?: string;
  entityType?: "PT" | "NON_PT";
  price: number;
  costPrice?: number;
  installationFee?: number;
  hasInstallationService?: boolean;
  stock: number;
  unit?: string;
  commission: string;
  commissionRate?: number;
  commissionType?: string;
  image?: string;
  images?: string[];
  brochureUrl?: string;
  brochureName?: string;
  brochureSize?: string;
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

  // Bulk Excel Upload & Export States
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkParsedItems, setBulkParsedItems] = useState<any[]>([]);
  const [bulkStats, setBulkStats] = useState<{ total: number; updateCount: number; createCount: number }>({
    total: 0,
    updateCount: 0,
    createCount: 0,
  });
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    subCategory: string;
    entityType: "PT" | "NON_PT";
    price: string;
    costPrice: string;
    installationFee: string;
    hasInstallationService: boolean;
    stock: string;
    commission: string;
    commissionType: string;
    image: string;
    images: string[];
    brochureUrl: string;
    brochureName: string;
    brochureSize: string;
    desc: string;
  }>({
    name: "",
    category: "Security System",
    subCategory: "",
    entityType: "PT",
    price: "",
    costPrice: "",
    installationFee: "150000",
    hasInstallationService: true,
    stock: "10",
    commission: "10",
    commissionType: "ONETIME",
    image: "",
    images: [],
    brochureUrl: "",
    brochureName: "",
    brochureSize: "",
    desc: ""
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMultipleImages, setUploadingMultipleImages] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Show auto-dismissing toast
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const [showDescPreview, setShowDescPreview] = useState(false);

  // Smart Formatter saat User melakukan Paste teks/tabel ke Deskripsi (Tugas 224)
  const handleDescriptionPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // 1. Cek apakah clipboard mengandung tabel atau list HTML (dari Gemini/ChatGPT/Word/Excel)
    const html = e.clipboardData.getData("text/html");
    if (html && (html.includes("<table") || html.includes("<ul") || html.includes("<ol"))) {
      const parsed = parseHtmlClipboard(html);
      if (parsed) {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart || 0;
        const end = target.selectionEnd || 0;
        const current = formData.desc || "";
        const updated = current.substring(0, start) + parsed + current.substring(end);
        setFormData((prev) => ({ ...prev, desc: updated }));
        showToast("✨ Format tabel & spesifikasi otomatis dirapikan!");
        return;
      }
    }

    // 2. Cek apakah plain text mengandung tab (copy tabel mentah: Col1\tCol2)
    const text = e.clipboardData.getData("text/plain");
    if (text && text.includes("\t")) {
      const cleaned = cleanDescriptionText(text);
      if (cleaned !== text) {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart || 0;
        const end = target.selectionEnd || 0;
        const current = formData.desc || "";
        const updated = current.substring(0, start) + cleaned + current.substring(end);
        setFormData((prev) => ({ ...prev, desc: updated }));
        showToast("✨ Teks tabel otomatis diubah menjadi daftar poin spesifikasi!");
      }
    }
  };

  // Tombol aksi cepat untuk merapikan teks deskripsi yang sudah ada
  const handleAutoFormatDesc = () => {
    if (!formData.desc || !formData.desc.trim()) {
      showToast("Belum ada teks deskripsi untuk dirapikan.", "error");
      return;
    }
    const formatted = cleanDescriptionText(formData.desc);
    setFormData((prev) => ({ ...prev, desc: formatted }));
    showToast("✨ Teks deskripsi & spesifikasi berhasil dirapikan otomatis!");
  };

  const [isSyncingSmartPro, setIsSyncingSmartPro] = useState(false);

  const handleSyncToSmartPro = async () => {
    setIsSyncingSmartPro(true);
    try {
      const res = await fetch("/api/products/sync-smartpro", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Katalog berhasil disinkronkan ke SmartPro WA!");
      } else {
        showToast(data.error || "Gagal sinkron katalog ke SmartPro", "error");
      }
    } catch {
      showToast("Kendala jaringan saat sinkron ke SmartPro", "error");
    } finally {
      setIsSyncingSmartPro(false);
    }
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
        setFormData((prev) => {
          const newImages = prev.images.includes(result.url) ? prev.images : [result.url, ...prev.images];
          return { ...prev, image: result.url, images: newImages };
        });
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

  // Handle Multi-Images Upload via API (Tugas 204)
  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMultipleImages(true);
    showToast(`Mengunggah ${files.length} foto galeri produk...`);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = new FormData();
      data.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });
        const result = await res.json();
        if (result.success && result.url) {
          newUrls.push(result.url);
        }
      } catch (err) {
        console.error("Gagal mengunggah foto:", err);
      }
    }

    if (newUrls.length > 0) {
      setFormData((prev) => {
        const combined = Array.from(new Set([...prev.images, ...newUrls]));
        return {
          ...prev,
          images: combined,
          image: prev.image || combined[0] || "",
        };
      });
      showToast(`✓ Berhasil menambahkan ${newUrls.length} foto ke galeri produk!`);
    } else {
      showToast("Gagal mengunggah foto galeri.", "error");
    }
    setUploadingMultipleImages(false);
  };

  // Hapus foto tertentu dari galeri
  const handleRemoveGalleryImage = (idxToRemove: number) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== idxToRemove);
      return {
        ...prev,
        images: updated,
        image: prev.image === prev.images[idxToRemove] ? (updated[0] || "") : prev.image,
      };
    });
  };

  // Jadikan foto tertentu sebagai foto utama
  const handleSetPrimaryImage = (imgUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      image: imgUrl,
    }));
    showToast("✓ Foto utama berhasil dipilih!");
  };

  // Handle Upload Berkas Brosur / E-Katalog PDF (Tugas 204)
  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBrochure(true);
    showToast("Mengunggah berkas brosur / e-katalog...");
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.success && result.url) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
        setFormData((prev) => ({
          ...prev,
          brochureUrl: result.url,
          brochureName: file.name,
          brochureSize: sizeMb,
        }));
        showToast("✓ Berkas brosur / e-katalog PDF berhasil diunggah!");
      } else {
        showToast(result.message || "Gagal mengunggah berkas brosur.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat mengunggah berkas brosur.", "error");
    } finally {
      setUploadingBrochure(false);
    }
  };

  // Export Seluruh Katalog Produk ke Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      showToast("Menyiapkan berkas Excel katalog produk...");

      const rows = products.map((p, idx) => ({
        "No": idx + 1,
        "ID Produk (JANGAN DIUBAH UNTUK UPDATE HARGA)": p.id,
        "Nama Produk": p.name,
        "Kategori": p.category,
        "Subkategori": p.subCategory || "",
        "Tipe Entitas": p.entityType || "PT",
        "Harga Jual (Rp)": p.price,
        "Modal HPP (Rp)": p.costPrice || 0,
        "Biaya Pasang (Rp)": p.installationFee || 0,
        "Layanan Pasang (YA/TIDAK)": p.hasInstallationService ? "YA" : "TIDAK",
        "Stok": p.stock || 0,
        "Satuan": p.unit || "Unit",
        "Komisi": p.commission || "10%",
        "Tipe Komisi": p.commissionType || "ONETIME",
        "URL Gambar": p.image || "",
        "Deskripsi Spesifikasi": p.desc || ""
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      ws["!cols"] = [
        { wch: 6 },
        { wch: 38 },
        { wch: 38 },
        { wch: 25 },
        { wch: 25 },
        { wch: 14 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 24 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
        { wch: 14 },
        { wch: 30 },
        { wch: 55 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Katalog Produk");

      // Lembar Petunjuk Penggunaan
      const guideData = [
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "1. CARA UPDATE HARGA / STOK MASSAL:" },
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "- Buka sheet 'Katalog Produk'." },
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "- JANGAN ubah kolom 'ID Produk (JANGAN DIUBAH UNTUK UPDATE HARGA)' agar sistem mengenali barang." },
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "- Ubah nilai di kolom 'Harga Jual (Rp)', 'Modal HPP (Rp)', 'Biaya Pasang (Rp)', atau 'Stok'." },
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "- Simpan berkas Excel, lalu buka Admin DSTech -> klik tombol 'Upload Excel / Update Massal' -> Pilih berkas ini." },
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "- Periksa tabel pratinjau, lalu klik 'Terapkan Perubahan Massal'." },
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "" },
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "2. CARA TAMBAH BANYAK PRODUK BARU:" },
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "- Buat baris baru di bawah, atau gunakan file Template Tambah Produk." },
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "- KOSONGKAN kolom 'ID Produk' pada baris baru tersebut." },
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "- Masukkan Nama Produk, Kategori, Harga Jual, Modal HPP, Stok, dll." },
        { "PANDUAN UPDATE HARGA & MASSAL DSTech SMART": "- Sistem akan otomatis membuatkan ID resmi baru berprefix dstech_prod_." }
      ];
      const wsGuide = XLSX.utils.json_to_sheet(guideData);
      wsGuide["!cols"] = [{ wch: 95 }];
      XLSX.utils.book_append_sheet(wb, wsGuide, "Petunjuk Penggunaan");

      const todayStr = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `Katalog_Produk_DSTech_Smart_${todayStr}.xlsx`);
      showToast("✓ Berkas Excel katalog berhasil diunduh!");
    } catch (err) {
      console.error("Gagal export excel:", err);
      showToast("Gagal mengunduh berkas Excel katalog.", "error");
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Unduh Template Excel Kosong Siap Pakai
  const handleDownloadTemplate = () => {
    try {
      const templateRows = [
        {
          "ID Produk (KOSONGKAN JIKA PRODUK BARU)": "",
          "Nama Produk": "Barrier Gate Otomatis MX-80 High Speed",
          "Kategori": "Parking & Barrier System",
          "Subkategori": "Barrier Gate Otomatis",
          "Tipe Entitas (PT/NON_PT)": "PT",
          "Harga Jual (Rp)": 9500000,
          "Modal HPP (Rp)": 7500000,
          "Biaya Pasang (Rp)": 750000,
          "Layanan Pasang (YA/TIDAK)": "YA",
          "Stok": 5,
          "Satuan": "Unit",
          "Komisi": "10%",
          "Tipe Komisi (ONETIME/RECURRING)": "ONETIME",
          "URL Gambar": "/service-cctv.png",
          "Deskripsi": "• Kecepatan Palang: 1.8 detik\n• Panjang Boom: 3-4 meter\n• Motor: Heavy Duty Brushless DC"
        },
        {
          "ID Produk (KOSONGKAN JIKA PRODUK BARU)": "",
          "Nama Produk": "Kamera CCTV IP 4MP ColorVu 24 Jam",
          "Kategori": "Security System",
          "Subkategori": "IP Camera",
          "Tipe Entitas (PT/NON_PT)": "PT",
          "Harga Jual (Rp)": 850000,
          "Modal HPP (Rp)": 600000,
          "Biaya Pasang (Rp)": 150000,
          "Layanan Pasang (YA/TIDAK)": "YA",
          "Stok": 20,
          "Satuan": "Unit",
          "Komisi": "10%",
          "Tipe Komisi (ONETIME/RECURRING)": "ONETIME",
          "URL Gambar": "/service-cctv.png",
          "Deskripsi": "• Resolusi: 4MP 2K\n• ColorVu: Tampilan warna 24 jam penuh\n• Audio: Built-in Mic"
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateRows);
      ws["!cols"] = [
        { wch: 38 },
        { wch: 40 },
        { wch: 25 },
        { wch: 25 },
        { wch: 24 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 24 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
        { wch: 28 },
        { wch: 28 },
        { wch: 55 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Template Tambah Produk");
      XLSX.writeFile(wb, "Template_Import_Produk_DSTech_Smart.xlsx");
      showToast("✓ Template Excel berhasil diunduh!");
    } catch (err) {
      console.error("Gagal download template:", err);
      showToast("Gagal mengunduh template Excel.", "error");
    }
  };

  // Parsing file Excel/CSV yang diunggah
  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rawJson || rawJson.length === 0) {
          showToast("Berkas Excel kosong atau lembar pertama tidak memiliki data.", "error");
          return;
        }

        const getColVal = (row: any, ...keys: string[]) => {
          for (const k of keys) {
            for (const rowKey of Object.keys(row)) {
              if (rowKey.toLowerCase().replace(/[^a-z0-9]/g, "") === k.toLowerCase().replace(/[^a-z0-9]/g, "")) {
                return row[rowKey];
              }
            }
          }
          return undefined;
        };

        let updateCount = 0;
        let createCount = 0;

        const parsedItems = rawJson.map((row, idx) => {
          const rawId = getColVal(row, "id", "idproduk", "kodeproduk", "idprodukjangandiubahuntukupdateharga", "idprodukkosongkanjikaprodukbaru");
          const cleanedId = rawId ? String(rawId).trim() : "";

          const existing = cleanedId ? products.find((p) => String(p.id).trim() === cleanedId) : null;
          const isUpdate = Boolean(existing);

          if (isUpdate) {
            updateCount++;
          } else {
            createCount++;
          }

          const rawPrice = getColVal(row, "hargajual", "hargajualrp", "price", "harga");
          const rawCost = getColVal(row, "modalhpp", "modalhpprp", "costprice", "hpp", "modal");
          const rawInstall = getColVal(row, "biayapasang", "biayapasangrp", "installationfee", "jasapasang");
          const rawStock = getColVal(row, "stok", "stock", "qty", "jumlah");
          const rawName = getColVal(row, "namaproduk", "name", "nama", "produk");
          const rawCat = getColVal(row, "kategori", "category");
          const rawSubCat = getColVal(row, "subkategori", "subcategory", "subkategoriproduk");
          const rawEntity = getColVal(row, "tipeentitas", "entitas", "entitytype");
          const rawUnit = getColVal(row, "satuan", "unit");
          const rawComm = getColVal(row, "komisi", "commission");
          const rawCommType = getColVal(row, "tipekomisi", "commissiontype");
          const rawImage = getColVal(row, "urlgambar", "image", "foto", "gambar");
          const rawDesc = getColVal(row, "deskripsi", "desc", "spesifikasi", "deskripsispesifikasi");
          const rawHasService = getColVal(row, "layananpasang", "hasinstallationservice");

          const parsedPriceNum = rawPrice !== undefined && rawPrice !== "" ? Number(String(rawPrice).replace(/[^0-9.-]/g, "")) : (existing?.price || 0);
          const parsedCostNum = rawCost !== undefined && rawCost !== "" ? Number(String(rawCost).replace(/[^0-9.-]/g, "")) : (existing?.costPrice || 0);

          return {
            id: cleanedId,
            isUpdate,
            existingProduct: existing,
            name: rawName ? String(rawName).trim() : (existing?.name || `Produk Baru ${idx + 1}`),
            category: rawCat ? String(rawCat).trim() : (existing?.category || "Hardware & IT"),
            subCategory: rawSubCat !== undefined ? String(rawSubCat).trim() : (existing?.subCategory || ""),
            entityType: rawEntity && String(rawEntity).toUpperCase().includes("NON") ? "NON_PT" : (existing?.entityType || "PT"),
            price: parsedPriceNum,
            costPrice: parsedCostNum,
            installationFee: rawInstall !== undefined && rawInstall !== "" ? Number(String(rawInstall).replace(/[^0-9.-]/g, "")) : (existing?.installationFee || 0),
            stock: rawStock !== undefined && rawStock !== "" ? Number(String(rawStock).replace(/[^0-9.-]/g, "")) : (existing?.stock || 0),
            unit: rawUnit ? String(rawUnit).trim() : (existing?.unit || "Unit"),
            commission: rawComm ? String(rawComm).trim() : (existing?.commission || "10%"),
            commissionType: rawCommType ? String(rawCommType).trim() : (existing?.commissionType || "ONETIME"),
            image: rawImage ? String(rawImage).trim() : (existing?.image || "/service-cctv.png"),
            desc: rawDesc !== undefined ? String(rawDesc).trim() : (existing?.desc || ""),
            hasInstallationService: rawHasService ? !String(rawHasService).toUpperCase().includes("TIDAK") : (existing?.hasInstallationService ?? true)
          };
        });

        setBulkParsedItems(parsedItems);
        setBulkStats({
          total: parsedItems.length,
          updateCount,
          createCount
        });
        showToast(`✓ Berhasil membaca ${parsedItems.length} produk (${updateCount} update harga, ${createCount} produk baru).`);
      } catch (err) {
        console.error("Gagal membaca Excel:", err);
        showToast("Terjadi kesalahan membaca file Excel.", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit Bulk Import ke API
  const handleBulkSubmit = async () => {
    if (bulkParsedItems.length === 0) {
      showToast("Belum ada data produk dari file Excel.", "error");
      return;
    }

    setBulkLoading(true);
    showToast("Menyimpan data massal ke server...");
    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: bulkParsedItems })
      });

      const result = await res.json();
      if (result.success) {
        showToast(result.message || "✓ Berhasil memproses data massal!");
        setIsBulkModalOpen(false);
        setBulkFile(null);
        setBulkParsedItems([]);
        fetchProducts();
      } else {
        showToast(result.message || "Gagal menyimpan data massal.", "error");
      }
    } catch (err) {
      console.error("Gagal submit bulk:", err);
      showToast("Terjadi kesalahan jaringan saat menyimpan data massal.", "error");
    } finally {
      setBulkLoading(false);
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
      costPrice: "",
      installationFee: "150000",
      hasInstallationService: true,
      stock: "10",
      commission: "10",
      commissionType: "ONETIME",
      image: "",
      images: [],
      brochureUrl: "",
      brochureName: "",
      brochureSize: "",
      desc: ""
    });
    setIsAddModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (product: ProductItem) => {
    setSelectedProduct(product);
    const prodImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : []);

    setFormData({
      name: product.name,
      category: product.category,
      subCategory: product.subCategory || "",
      entityType: product.entityType || "PT",
      price: String(product.price),
      costPrice: String(product.costPrice !== undefined ? product.costPrice : ""),
      installationFee: String(product.installationFee !== undefined ? product.installationFee : 150000),
      hasInstallationService: product.hasInstallationService !== false,
      stock: String(product.stock),
      commission: String(product.commissionRate || parseInt(String(product.commission).replace(/[^0-9]/g, ""), 10) || 10),
      commissionType: product.commissionType || "ONETIME",
      image: product.image || (prodImages[0] || ""),
      images: prodImages,
      brochureUrl: product.brochureUrl || "",
      brochureName: product.brochureName || "",
      brochureSize: product.brochureSize || "",
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
      costPrice: parseFloat(formData.costPrice) || 0,
      installationFee: parseFloat(formData.installationFee) || 0,
      hasInstallationService: formData.hasInstallationService,
      stock: parseInt(formData.stock, 10) || 0,
      commission: `${formData.commission}%`,
      commissionRate: parseInt(formData.commission, 10) || 10,
      commissionType: formData.commissionType,
      image: formData.image.trim() || (formData.images[0] || ""),
      images: formData.images,
      brochureUrl: formData.brochureUrl.trim(),
      brochureName: formData.brochureName.trim(),
      brochureSize: formData.brochureSize.trim(),
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
      costPrice: parseFloat(formData.costPrice) || 0,
      installationFee: parseFloat(formData.installationFee) || 0,
      hasInstallationService: formData.hasInstallationService,
      stock: parseInt(formData.stock, 10) || 0,
      commission: `${formData.commission}%`,
      commissionRate: parseInt(formData.commission, 10) || 10,
      commissionType: formData.commissionType,
      image: formData.image.trim() || (formData.images[0] || ""),
      images: formData.images,
      brochureUrl: formData.brochureUrl.trim(),
      brochureName: formData.brochureName.trim(),
      brochureSize: formData.brochureSize.trim(),
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncToSmartPro}
            disabled={isSyncingSmartPro}
            className="h-12 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
            title="Sinkronkan seluruh katalog produk ke akun utama SmartPro WA Gateway"
          >
            <Send className={`w-4 h-4 ${isSyncingSmartPro ? "animate-spin" : ""}`} />
            <span>{isSyncingSmartPro ? "Menyinkronkan..." : "⚡ Sync ke SmartPro"}</span>
          </button>
          <Link
            href="/admin/categories"
            className="h-12 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
          >
            <FolderTree className="w-4 h-4 text-dstech-blue" />
            <span>Kelola Kategori & Sub</span>
          </Link>
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel || products.length === 0}
            className="h-12 px-4 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
            title="Download seluruh katalog produk ke format Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>{isExportingExcel ? "Mengunduh..." : "Export Excel"}</span>
          </button>
          <button
            onClick={() => {
              setBulkFile(null);
              setBulkParsedItems([]);
              setBulkStats({ total: 0, updateCount: 0, createCount: 0 });
              setIsBulkModalOpen(true);
            }}
            className="h-12 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            title="Update harga massal atau upload banyak barang via Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>
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
            <span>🏪 Non-PT / DSTech Smart</span>
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
                                <Store className="w-3 h-3 text-amber-600" /> Non-PT / DSTech Smart
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
                            {Array.isArray(p.images) && p.images.length > 1 && (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                📸 {p.images.length} Foto
                              </span>
                            )}
                            {p.brochureUrl && (
                              <a
                                href={p.brochureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-emerald-100 transition"
                                title="Unduh Berkas Brosur / E-Katalog PDF"
                              >
                                <FileText className="w-2.5 h-2.5" /> Brosur PDF
                              </a>
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
                    <td className="p-5 sm:p-6 text-center">
                      <div className="font-black text-slate-900 text-sm sm:text-base">
                        Rp {p.price.toLocaleString("id-ID")}
                      </div>
                      <div className="mt-1 flex flex-col items-center gap-1">
                        {p.costPrice ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full"
                            title={`Harga Modal Pembelian / HPP: Rp ${p.costPrice.toLocaleString("id-ID")}`}
                          >
                            📦 Modal: Rp {p.costPrice.toLocaleString("id-ID")}
                            {p.price > p.costPrice && (
                              <span className="text-[9.5px] text-emerald-700 font-black ml-0.5">
                                (+{Math.round(((p.price - p.costPrice) / p.price) * 100)}%)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Modal: Belum diisi
                          </span>
                        )}
                        {p.hasInstallationService !== false && (p.installationFee || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                            🛠️ Pasang: Rp {(p.installationFee || 0).toLocaleString("id-ID")}/unit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            🚫 Unit Only (Tanpa Jasa)
                          </span>
                        )}
                      </div>
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
                      <p className="font-black text-xs">Non-PT / DSTech Smart</p>
                      <p className="text-[10px] text-slate-400">Ritel & Servis Mandiri</p>
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

              {/* Upload Gambar & Galeri Multi-Foto Produk (Tugas 204) */}
              <div className="space-y-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      📸 Galeri Foto &amp; Gambar Produk
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Unggah beberapa foto produk untuk tampilan galeri interaktif. Foto bertanda bintang adalah foto utama.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-dstech-blue px-2.5 py-0.5 rounded-full">
                    {formData.images.length} Foto
                  </span>
                </div>

                {/* Grid Galeri Thumbnail */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2">
                    {formData.images.map((imgUrl, imgIdx) => {
                      const isPrimary = formData.image === imgUrl;
                      return (
                        <div
                          key={imgIdx}
                          className={`relative group rounded-xl overflow-hidden border-2 bg-white aspect-square shadow-2xs transition-all ${
                            isPrimary ? "border-dstech-blue ring-2 ring-blue-400/40" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Foto ${imgIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {isPrimary && (
                            <div className="absolute top-1 left-1 bg-dstech-blue text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                              <span>Utama</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(imgUrl)}
                                className="px-2 py-0.5 rounded bg-white text-slate-900 text-[10px] font-black hover:bg-blue-50 transition cursor-pointer"
                              >
                                Set Utama
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(imgIdx)}
                              className="p-1 rounded-full bg-red-600 hover:bg-red-700 text-white transition cursor-pointer shadow"
                              title="Hapus foto ini"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-dstech-blue text-xs font-bold text-slate-700 hover:text-dstech-blue shadow-xs transition-all">
                    <UploadCloud className="w-4 h-4 text-dstech-blue" />
                    <span>{uploadingMultipleImages ? "Mengunggah Galeri..." : "Upload Beberapa Foto (Multi-Upload)..."}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingMultipleImages}
                      onChange={handleMultipleImagesUpload}
                      className="hidden"
                    />
                  </label>

                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-all">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>{uploadingImage ? "Mengunggah..." : "Tambah 1 Foto..."}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="URL foto utama atau tempel tautan gambar (https://...)"
                    className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-dstech-blue"
                  />
                </div>
              </div>

              {/* Upload Berkas Brosur / E-Katalog PDF Spesifikasi (Tugas 204) */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-emerald-950 uppercase tracking-wider">
                      📄 Berkas Brosur / E-Katalog PDF Spesifikasi Produk
                    </label>
                    <p className="text-[11px] text-slate-600">
                      Unggah brosur resmi / datasheet spesifikasi teknis untuk dapat diunduh oleh pembeli &amp; mitra di website.
                    </p>
                  </div>
                </div>

                {formData.brochureUrl ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {formData.brochureName || "Brosur-Spesifikasi-Produk.pdf"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formData.brochureSize || "Format PDF"} • Siap Diunduh Pengunjung
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={formData.brochureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Pratinjau</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, brochureUrl: "", brochureName: "", brochureSize: "" })}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                        title="Hapus Brosur"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-300 hover:border-emerald-600 text-xs font-bold text-emerald-800 shadow-xs transition-all">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>{uploadingBrochure ? "Mengunggah PDF..." : "Pilih Berkas Brosur (PDF)..."}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        disabled={uploadingBrochure}
                        onChange={handleBrochureUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-400">Format: Dokumen PDF (Maksimal 25MB)</span>
                  </div>
                )}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Modal Beli (HPP) */}
                <div>
                  <label className="block text-xs font-black text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <span>📦 Modal Beli / HPP (Rp)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="Contoh: 2500000"
                    className="w-full h-12 px-4 rounded-xl border border-amber-300 bg-amber-50/40 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Biaya perolehan dari supplier</p>
                </div>

                {/* 2. Harga Jual Retail */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Harga Jual (Rp) <span className="text-dstech-red">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Contoh: 3500000"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-dstech-blue"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Harga tayang ke pembeli</p>
                </div>

                {/* 3. Stok */}
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
                  <p className="text-[10px] text-slate-400 mt-1">Jumlah unit fisik tersedia</p>
                </div>
              </div>

              {/* Kalkulasi Otomatis Laba Kotor & Margin Produk (Tugas 221) */}
              {(() => {
                const sellP = parseFloat(formData.price) || 0;
                const costP = parseFloat(formData.costPrice) || 0;
                if (sellP > 0 && costP > 0) {
                  const grossProfit = sellP - costP;
                  const marginPct = ((grossProfit / sellP) * 100).toFixed(1);
                  const isProfit = grossProfit >= 0;
                  return (
                    <div
                      className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                        isProfit
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                          : "bg-red-50/80 border-red-200 text-red-950"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isProfit ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-black">Estimasi Laba Kotor Satuan (Gross Profit):</p>
                          <p className="text-[10.5px] font-normal text-slate-500">
                            Harga Jual ({sellP.toLocaleString("id-ID")}) - Modal HPP ({costP.toLocaleString("id-ID")})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm sm:text-base font-black block">
                          {isProfit ? "+" : ""}Rp {grossProfit.toLocaleString("id-ID")}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isProfit ? "bg-emerald-200 text-emerald-800" : "bg-red-200 text-red-800"
                          }`}
                        >
                          Margin {marginPct}%
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Opsi Jasa Pemasangan & Setup Teknisi */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                      🛠️ Layanan Jasa Pemasangan & Setup Teknisi
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Aktifkan jika produk ini menyediakan pilihan instalasi langsung oleh teknisi bersertifikat DSTech.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasInstallationService}
                      onChange={(e) => setFormData({ ...formData, hasInstallationService: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {formData.hasInstallationService && (
                  <div className="pt-2 border-t border-indigo-100">
                    <label className="block text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                      Biaya Jasa Pemasangan (Rp per Unit) <span className="text-dstech-red">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        required={formData.hasInstallationService}
                        value={formData.installationFee}
                        onChange={(e) => setFormData({ ...formData, installationFee: e.target.value })}
                        placeholder="150000"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-indigo-200 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <p className="text-[10.5px] text-indigo-700 mt-1 italic">
                      *Biaya jasa ini akan dihitung proporsional per unit saat pelanggan memilih opsi instalasi (misal: 2 unit = 2x jasa).
                    </p>
                  </div>
                )}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Deskripsi &amp; Spesifikasi Produk
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoFormatDesc}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Rapikan teks yang menyatu atau belum berbaris"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Rapikan Otomatis
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDescPreview(!showDescPreview)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                        showDescPreview
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showDescPreview ? "Tutup Pratinjau" : "Pratinjau Toko"}
                    </button>
                  </div>
                </div>

                {showDescPreview ? (
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 max-h-72 overflow-y-auto">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-2">
                      👁️ Pratinjau Tampilan Pembeli di Katalog Toko:
                    </span>
                    <ProductDescriptionViewer desc={formData.desc} />
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    value={formData.desc}
                    onPaste={handleDescriptionPaste}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    placeholder="Contoh:&#10;Palang parkir otomatis kecepatan tinggi...&#10;&#10;Spesifikasi Teknis:&#10;• Model: Barrier Gate MX-80&#10;• Panjang Palang: 3 Meter&#10;• Kecepatan: 1.8 detik"
                    className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-dstech-blue font-mono leading-relaxed"
                  />
                )}
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  💡 <span>Dapat langsung <strong>Copy &amp; Paste</strong> dari Gemini / ChatGPT / Excel / Tabel Word. Sistem otomatis mengubahnya menjadi poin spesifikasi rapi.</span>
                </p>
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
                      <p className="font-black text-xs">Non-PT / DSTech Smart</p>
                      <p className="text-[10px] text-slate-400">Ritel & Servis Mandiri</p>
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

              {/* Upload Gambar & Galeri Multi-Foto Produk (Tugas 204) */}
              <div className="space-y-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      📸 Galeri Foto &amp; Gambar Produk
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Unggah beberapa foto produk untuk tampilan galeri interaktif. Foto bertanda bintang adalah foto utama.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-dstech-blue px-2.5 py-0.5 rounded-full">
                    {formData.images.length} Foto
                  </span>
                </div>

                {/* Grid Galeri Thumbnail */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2">
                    {formData.images.map((imgUrl, imgIdx) => {
                      const isPrimary = formData.image === imgUrl;
                      return (
                        <div
                          key={imgIdx}
                          className={`relative group rounded-xl overflow-hidden border-2 bg-white aspect-square shadow-2xs transition-all ${
                            isPrimary ? "border-dstech-blue ring-2 ring-blue-400/40" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Foto ${imgIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {isPrimary && (
                            <div className="absolute top-1 left-1 bg-dstech-blue text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                              <span>Utama</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(imgUrl)}
                                className="px-2 py-0.5 rounded bg-white text-slate-900 text-[10px] font-black hover:bg-blue-50 transition cursor-pointer"
                              >
                                Set Utama
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(imgIdx)}
                              className="p-1 rounded-full bg-red-600 hover:bg-red-700 text-white transition cursor-pointer shadow"
                              title="Hapus foto ini"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-dstech-blue text-xs font-bold text-slate-700 hover:text-dstech-blue shadow-xs transition-all">
                    <UploadCloud className="w-4 h-4 text-dstech-blue" />
                    <span>{uploadingMultipleImages ? "Mengunggah Galeri..." : "Upload Beberapa Foto (Multi-Upload)..."}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingMultipleImages}
                      onChange={handleMultipleImagesUpload}
                      className="hidden"
                    />
                  </label>

                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-all">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>{uploadingImage ? "Mengunggah..." : "Tambah 1 Foto..."}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="URL foto utama atau tempel tautan gambar (https://...)"
                    className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-dstech-blue"
                  />
                </div>
              </div>

              {/* Upload Berkas Brosur / E-Katalog PDF Spesifikasi (Tugas 204) */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-emerald-950 uppercase tracking-wider">
                      📄 Berkas Brosur / E-Katalog PDF Spesifikasi Produk
                    </label>
                    <p className="text-[11px] text-slate-600">
                      Unggah brosur resmi / datasheet spesifikasi teknis untuk dapat diunduh oleh pembeli &amp; mitra di website.
                    </p>
                  </div>
                </div>

                {formData.brochureUrl ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {formData.brochureName || "Brosur-Spesifikasi-Produk.pdf"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formData.brochureSize || "Format PDF"} • Siap Diunduh Pengunjung
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={formData.brochureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Pratinjau</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, brochureUrl: "", brochureName: "", brochureSize: "" })}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                        title="Hapus Brosur"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-300 hover:border-emerald-600 text-xs font-bold text-emerald-800 shadow-xs transition-all">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>{uploadingBrochure ? "Mengunggah PDF..." : "Pilih Berkas Brosur (PDF)..."}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        disabled={uploadingBrochure}
                        onChange={handleBrochureUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-400">Format: Dokumen PDF (Maksimal 25MB)</span>
                  </div>
                )}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Modal Beli (HPP) */}
                <div>
                  <label className="block text-xs font-black text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <span>📦 Modal Beli / HPP (Rp)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="Contoh: 2500000"
                    className="w-full h-12 px-4 rounded-xl border border-amber-300 bg-amber-50/40 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Biaya perolehan dari supplier</p>
                </div>

                {/* 2. Harga Jual Retail */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Harga Jual (Rp) <span className="text-dstech-red">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-dstech-blue"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Harga tayang ke pembeli</p>
                </div>

                {/* 3. Stok */}
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
                  <p className="text-[10px] text-slate-400 mt-1">Jumlah unit fisik tersedia</p>
                </div>
              </div>

              {/* Kalkulasi Otomatis Laba Kotor & Margin Produk (Tugas 221) */}
              {(() => {
                const sellP = parseFloat(formData.price) || 0;
                const costP = parseFloat(formData.costPrice) || 0;
                if (sellP > 0 && costP > 0) {
                  const grossProfit = sellP - costP;
                  const marginPct = ((grossProfit / sellP) * 100).toFixed(1);
                  const isProfit = grossProfit >= 0;
                  return (
                    <div
                      className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                        isProfit
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                          : "bg-red-50/80 border-red-200 text-red-950"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isProfit ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-black">Estimasi Laba Kotor Satuan (Gross Profit):</p>
                          <p className="text-[10.5px] font-normal text-slate-500">
                            Harga Jual ({sellP.toLocaleString("id-ID")}) - Modal HPP ({costP.toLocaleString("id-ID")})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm sm:text-base font-black block">
                          {isProfit ? "+" : ""}Rp {grossProfit.toLocaleString("id-ID")}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isProfit ? "bg-emerald-200 text-emerald-800" : "bg-red-200 text-red-800"
                          }`}
                        >
                          Margin {marginPct}%
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Opsi Jasa Pemasangan & Setup Teknisi */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                      🛠️ Layanan Jasa Pemasangan & Setup Teknisi
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Aktifkan jika produk ini menyediakan pilihan instalasi langsung oleh teknisi bersertifikat DSTech.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasInstallationService}
                      onChange={(e) => setFormData({ ...formData, hasInstallationService: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {formData.hasInstallationService && (
                  <div className="pt-2 border-t border-indigo-100">
                    <label className="block text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                      Biaya Jasa Pemasangan (Rp per Unit) <span className="text-dstech-red">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        required={formData.hasInstallationService}
                        value={formData.installationFee}
                        onChange={(e) => setFormData({ ...formData, installationFee: e.target.value })}
                        placeholder="150000"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-indigo-200 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <p className="text-[10.5px] text-indigo-700 mt-1 italic">
                      *Biaya jasa ini akan dihitung proporsional per unit saat pelanggan memilih opsi instalasi (misal: 2 unit = 2x jasa).
                    </p>
                  </div>
                )}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Deskripsi &amp; Spesifikasi Produk
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoFormatDesc}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Rapikan teks yang menyatu atau belum berbaris"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Rapikan Otomatis
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDescPreview(!showDescPreview)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                        showDescPreview
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showDescPreview ? "Tutup Pratinjau" : "Pratinjau Toko"}
                    </button>
                  </div>
                </div>

                {showDescPreview ? (
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 max-h-72 overflow-y-auto">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-2">
                      👁️ Pratinjau Tampilan Pembeli di Katalog Toko:
                    </span>
                    <ProductDescriptionViewer desc={formData.desc} />
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    value={formData.desc}
                    onPaste={handleDescriptionPaste}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-dstech-blue font-mono leading-relaxed"
                  />
                )}
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  💡 <span>Dapat langsung <strong>Copy &amp; Paste</strong> dari Gemini / ChatGPT / Excel / Tabel Word. Sistem otomatis mengubahnya menjadi poin spesifikasi rapi.</span>
                </p>
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

      {/* MODAL: Upload & Import Massal Excel */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Upload & Update Massal via Excel</h3>
                  <p className="text-slate-400 font-medium text-xs mt-0.5">
                    Update harga jual, modal HPP, stok secara massal atau tambah barang banyak sekaligus
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!bulkLoading) {
                    setIsBulkModalOpen(false);
                    setBulkFile(null);
                    setBulkParsedItems([]);
                  }
                }}
                className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Content */}
            <div className="py-6 overflow-y-auto space-y-6 flex-grow pr-1">
              {/* Shortcut Template & Panduan */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Butuh format kolom yang benar?</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Unduh template Excel kosong siap pakai atau ekspor katalog saat ini untuk langsung diedit.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="flex-1 sm:flex-none h-9 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Download Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="flex-1 sm:flex-none h-9 px-3.5 rounded-xl bg-white border border-slate-200 text-teal-700 hover:bg-teal-50 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                    <span>Download Katalog</span>
                  </button>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/50 rounded-2xl p-6 transition-all text-center relative group">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <FileUp className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {bulkFile ? bulkFile.name : "Pilih atau Seret Berkas Excel (.xlsx, .xls, .csv) ke Sini"}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {bulkFile
                    ? `Ukuran berkas: ${(bulkFile.size / 1024).toFixed(1)} KB`
                    : "Mendukung format Excel modern (.xlsx) dan CSV"}
                </p>
              </div>

              {/* Stats Rekapitulasi */}
              {bulkParsedItems.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Baris</p>
                      <p className="text-2xl font-black text-slate-800 mt-0.5">{bulkStats.total}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Baris produk dibaca</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl">
                      <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Update Harga / Data
                      </p>
                      <p className="text-2xl font-black text-blue-900 mt-0.5">{bulkStats.updateCount}</p>
                      <p className="text-[10px] text-blue-700 font-medium">ID produk cocok di katalog</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Produk Baru
                      </p>
                      <p className="text-2xl font-black text-emerald-900 mt-0.5">{bulkStats.createCount}</p>
                      <p className="text-[10px] text-emerald-700 font-medium">ID baru / kosong dibuat otomatis</p>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Pratinjau Data yang Akan Disimpan ({bulkParsedItems.length} Produk)
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Maksimal 50 baris ditampilkan</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3">Aksi</th>
                            <th className="py-2.5 px-3">Nama Produk</th>
                            <th className="py-2.5 px-3">Kategori</th>
                            <th className="py-2.5 px-3 text-right">Harga Jual Baru</th>
                            <th className="py-2.5 px-3 text-right">Modal HPP</th>
                            <th className="py-2.5 px-3 text-center">Stok</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bulkParsedItems.slice(0, 50).map((item, idx) => {
                            const isPriceChanged =
                              item.isUpdate &&
                              item.existingProduct &&
                              item.existingProduct.price !== item.price;
                            return (
                              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  {item.isUpdate ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-700">
                                      <CheckCircle2 className="w-3 h-3" /> Update
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                      <Plus className="w-3 h-3" /> Baru
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-800 max-w-[200px] truncate" title={item.name}>
                                  {item.name}
                                </td>
                                <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                                  {item.category}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                                  {isPriceChanged ? (
                                    <div>
                                      <span className="text-emerald-600">Rp {item.price?.toLocaleString("id-ID")}</span>
                                      <span className="block text-[10px] text-slate-400 line-through">
                                        Rp {item.existingProduct.price?.toLocaleString("id-ID")}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-800">Rp {item.price?.toLocaleString("id-ID")}</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                                  Rp {item.costPrice?.toLocaleString("id-ID")}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-slate-700 whitespace-nowrap">
                                  {item.stock} {item.unit || "Unit"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setBulkFile(null);
                  setBulkParsedItems([]);
                }}
                className="h-11 px-5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkLoading || bulkParsedItems.length === 0}
                onClick={handleBulkSubmit}
                className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {bulkLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Server...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Terapkan Perubahan Massal ({bulkParsedItems.length})</span>
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
