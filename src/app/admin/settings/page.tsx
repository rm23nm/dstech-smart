"use client";

import React, { useState, useEffect, useRef } from "react";
import GpsGeofenceManager from "@/components/GpsGeofenceManager";
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
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  Flame,
  Star,
  Layers,
  Layout,
} from "lucide-react";

function formatRupiah(amount: number): string {
  return "Rp " + (amount || 0).toLocaleString("id-ID");
}

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

export interface EstoreHeroItem {
  id: string;
  badge: string;
  badgeColor?: string;
  title: string;
  subtitle?: string;
  desc?: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating?: number;
  reviews?: number;
  image: string;
  category?: string;
  features: string[];
  installationFee?: number;
  isActive: boolean;
}

export interface EstoreSettingsData {
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroBackgroundMode: "gradient" | "dark" | "navy" | "image";
  heroBackgroundImage: string;
  heroOverlayOpacity?: number; // 0 - 100
  heroGlowPrimary?: string;
  heroGlowSecondary?: string;
  showQuickTracker: boolean;
  showNationalBanner: boolean;
  autoPlayInterval: number; // ms
  featuredHeroes: EstoreHeroItem[];
}

export interface SiteSettingsData {
  companyName: string;
  tagline: string;
  nib: string;
  npwp: string;
  whatsapp: string;
  whatsappDisplay: string;
  whatsappSales?: string;
  whatsappTechnical?: string;
  whatsappComplaint?: string;
  email: string;
  emailSupport: string;
  phone: string;
  address: string;
  serviceArea?: string;
  googleMapsUrl: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  logoUrl?: string;
  logoWhiteUrl?: string;
  faviconUrl?: string;
  logoHeight?: number;
  bankAccounts?: BankAccountItem[];
  letterheadSettings?: LetterheadSettingsData;
  estoreSettings?: EstoreSettingsData;
  updatedAt?: string;
}

export default function AdminSettingsPage() {
  // Tab Aktif Utama
  const [activeTab, setActiveTab] = useState<"profile" | "branding" | "gps" | "banks" | "letterhead" | "estore" | "danger">("profile");

  const [settings, setSettings] = useState<SiteSettingsData>({
    companyName: "PT. DSTech Smart Perkasa",
    tagline: "Solusi Security System, Smart Automation & IT Infrastructure Handal",
    nib: "0123456789012",
    npwp: "01.234.567.8-417.000",
    whatsapp: "6282259494242",
    whatsappDisplay: "+62 822-5949-4242",
    whatsappSales: "6282259494242",
    whatsappTechnical: "6282259494242",
    whatsappComplaint: "6282259494242",
    email: "cs@dstechsmart.com",
    emailSupport: "support@dstechsmart.com",
    phone: "0822-5949-4242",
    address: "PERUM BUKIT CILEGON ASRI BLOK DB NO. 19, KEL. BAGENDUNG, KEC. CILEGON, KOTA CILEGON - BANTEN",
    serviceArea: "Banten (Cilegon, Serang, Tangerang), Jabodetabek, dan Seluruh Wilayah Indonesia (Nasional)",
    googleMapsUrl: "https://maps.google.com/?q=Perum+Bukit+Cilegon+Asri+Cilegon+Banten",
    instagram: "https://instagram.com/dstechsmart",
    facebook: "https://facebook.com/dstechsmart",
    linkedin: "https://linkedin.com/company/dstechsmart",
    logoUrl: "/logo.png",
    logoWhiteUrl: "/logo.png",
    faviconUrl: "/logo.png",
    logoHeight: 40,
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const logoWhiteFileInputRef = useRef<HTMLInputElement>(null);

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

  // State Pengaturan E-Store & Hero Showcase (Tugas 213)
  const [estoreConfig, setEstoreConfig] = useState<EstoreSettingsData>({
    heroTitle: "Katalog Produk Pilihan",
    heroTitleHighlight: "DSTech Smart",
    heroSubtitle: "Featured Showcase • Produk Unggulan & Promo Resmi",
    heroBackgroundMode: "gradient",
    heroBackgroundImage: "",
    heroOverlayOpacity: 70,
    heroGlowPrimary: "blue",
    heroGlowSecondary: "red",
    showQuickTracker: true,
    showNationalBanner: true,
    autoPlayInterval: 6000,
    featuredHeroes: [
      {
        id: "dstech_hero_1",
        badge: "🔥 BEST SELLER • CCTV AI",
        badgeColor: "bg-red-500 text-white shadow-red-500/30",
        title: "CCTV Proview 2 Lensa SM-PR5260-PT Dual-Cam",
        subtitle: "Solusi Pengawasan Ultra HD Siang & Malam dengan AI Auto-Tracking",
        desc: "Dilengkapi dua lensa optik simultan, zoom cerdas, audio dua arah jernih, dan penglihatan malam Full-Color aktif 24 jam dengan sertifikasi resmi PT. DSTech.",
        price: 317000,
        originalPrice: 450000,
        discount: "30% OFF",
        rating: 4.9,
        reviews: 142,
        image: "/service-cctv.png",
        category: "Security System",
        features: ["Dual-Lens 5MP Full-Color", "AI Humanoid Auto-Tracking", "Komunikasi Audio 2 Arah", "Garansi Sah 1 Tahun"],
        installationFee: 150000,
        isActive: true,
      },
      {
        id: "dstech_hero_2",
        badge: "⭐ SMART HOME UNGGULAN",
        badgeColor: "bg-blue-600 text-white shadow-blue-600/30",
        title: "Smart Doorlock Biometrik X-100 Face & Fingerprint",
        subtitle: "Akses Pintu Cerdas Biometrik Multi-Faktor Tanpa Kunci Fisik",
        desc: "Mendukung pengenalan wajah 3D, sensor sidik jari ultra responsif 0.3 detik, kartu RFID, PIN acak anti-intip, dan pemantauan jarak jauh via aplikasi smartphone.",
        price: 1850000,
        originalPrice: 2450000,
        discount: "25% OFF",
        rating: 5.0,
        reviews: 98,
        image: "/service-smarthome.png",
        category: "Smart Home",
        features: ["3D Biometric Face Scan", "Sidik Jari 0.3s Anti-Palsu", "Kendali Jarak Jauh via WiFi", "Emergency USB-C Port"],
        installationFee: 250000,
        isActive: true,
      },
      {
        id: "dstech_hero_3",
        badge: "🛡️ INDUSTRIAL & CLUSTER GATE",
        badgeColor: "bg-emerald-600 text-white shadow-emerald-600/30",
        title: "Automatic Barrier Gate High-Speed 1.8s Industrial",
        subtitle: "Palang Parkir Otomatis Kecepatan Tinggi untuk Kawasan Industri & Cluster",
        desc: "Ditenagai motor servo brushless berdaya tahan 5 juta siklus buka-tutup, sensor anti-bentur canggih, dan kompatibel penuh dengan sistem tiket serta kartu akses RFID.",
        price: 8500000,
        originalPrice: 9800000,
        discount: "13% OFF",
        rating: 4.9,
        reviews: 64,
        image: "/portfolio-industrial.png",
        category: "Access & Barrier",
        features: ["Kecepatan Buka 1.8 Detik", "Motor Servo Brushless", "Loop Detector Keamanan", "Integrasi RFID & ANPR"],
        installationFee: 1500000,
        isActive: true,
      },
    ],
  });

  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [isSelectProductModalOpen, setIsSelectProductModalOpen] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const [isUploadingHeroBg, setIsUploadingHeroBg] = useState(false);
  const heroBgFileInputRef = useRef<HTMLInputElement>(null);

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
        if (json.data.estoreSettings) {
          setEstoreConfig((prev) => ({
            ...prev,
            ...json.data.estoreSettings,
            featuredHeroes: Array.isArray(json.data.estoreSettings.featuredHeroes) && json.data.estoreSettings.featuredHeroes.length > 0
              ? json.data.estoreSettings.featuredHeroes
              : prev.featuredHeroes,
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

  // Fetch katalog produk aktif untuk pemilihan produk hero
  const fetchCatalogProducts = async () => {
    try {
      const res = await fetch("/api/products?t=" + Date.now());
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        setCatalogProducts(json.data);
      }
    } catch (e) {
      console.error("Gagal memuat katalog produk:", e);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCatalogProducts();
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
        estoreSettings: estoreConfig,
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
          if (data.data.estoreSettings) {
            setEstoreConfig((prev) => ({ ...prev, ...data.data.estoreSettings }));
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

  // Handler Upload Background Hero E-Store (Tugas 213)
  const handleUploadHeroBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingHeroBg(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", "image");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setEstoreConfig((prev) => ({
          ...prev,
          heroBackgroundMode: "image",
          heroBackgroundImage: json.url,
        }));
        showToast("success", `Gambar background hero berhasil diunggah! Klik 'Simpan Semua Pengaturan' untuk menerapkan.`);
      } else {
        showToast("error", json.message || "Gagal mengunggah gambar background.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan koneksi saat mengunggah gambar background.");
    } finally {
      setIsUploadingHeroBg(false);
      if (e.target) e.target.value = "";
    }
  };

  // Handler Tambah Produk dari Katalog ke Hero
  const handleAddProductToHero = (prod: any) => {
    const newHero: EstoreHeroItem = {
      id: "dstech_hero_" + Date.now(),
      badge: "⭐ PRODUK PILIHAN",
      badgeColor: "bg-blue-600 text-white shadow-blue-600/30",
      title: prod.name || "Produk Unggulan",
      subtitle: prod.desc ? prod.desc.slice(0, 75) + "..." : "Perangkat teknologi resmi berkualitas dari PT. DSTech Smart Perkasa",
      desc: prod.desc || "Perangkat teknologi resmi berkualitas dengan garansi dan instalasi teknisi profesional.",
      price: prod.price || 0,
      originalPrice: prod.originalPrice || Math.round((prod.price || 1000000) * 1.25),
      discount: "Promo Spesial",
      rating: 5.0,
      reviews: 50,
      image: prod.image || (prod.images && prod.images[0]) || "/service-smarthome.png",
      category: prod.category || "Hardware",
      features: prod.features && Array.isArray(prod.features) && prod.features.length > 0
        ? prod.features
        : ["Garansi Sah 1 Tahun", "Layanan Pemasangan Teknisi", "Produk Original & Prima", "Dukungan Purna Jual"],
      installationFee: prod.installationFee || 150000,
      isActive: true,
    };

    setEstoreConfig((prev) => ({
      ...prev,
      featuredHeroes: [...prev.featuredHeroes, newHero],
    }));
    setIsSelectProductModalOpen(false);
    showToast("success", `Produk "${prod.name}" berhasil ditambahkan ke daftar Hero Showcase!`);
  };

  // Handler Hapus Hero
  const handleRemoveHeroItem = (id: string) => {
    setEstoreConfig((prev) => ({
      ...prev,
      featuredHeroes: prev.featuredHeroes.filter((h) => h.id !== id),
    }));
    showToast("success", "Produk hero berhasil dihapus.");
  };

  // Handler Toggle Aktif Hero
  const handleToggleHeroItem = (id: string) => {
    setEstoreConfig((prev) => ({
      ...prev,
      featuredHeroes: prev.featuredHeroes.map((h) =>
        h.id === id ? { ...h, isActive: !h.isActive } : h
      ),
    }));
  };

  // Handler Geser Urutan Hero
  const handleMoveHeroItem = (index: number, direction: "up" | "down") => {
    const items = [...estoreConfig.featuredHeroes];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;
    setEstoreConfig((prev) => ({ ...prev, featuredHeroes: items }));
  };

  // Handler Upload Logo & Branding
  const handleUploadLogoFile = async (e: React.ChangeEvent<HTMLInputElement>, targetField: "logoUrl" | "logoWhiteUrl" | "faviconUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", "image");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setSettings((prev) => ({ ...prev, [targetField]: json.url }));
        showToast("success", `File ${file.name} berhasil diunggah! Klik 'Simpan Logo' untuk menerapkan ke seluruh situs.`);
      } else {
        showToast("error", json.message || "Gagal mengunggah file logo.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan koneksi saat mengunggah logo.");
    } finally {
      setIsUploadingLogo(false);
      if (e.target) e.target.value = "";
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
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "branding"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>🎨 Logo &amp; Branding Website</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gps")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "gps"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>📍 Titik GPS Kantor &amp; Geofencing Presensi</span>
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
          onClick={() => setActiveTab("estore")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "estore"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>🛒 Pengaturan E-Store &amp; Hero Showcase ({estoreConfig.featuredHeroes.length})</span>
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

      {/* KONTEN TAB: LOGO & BRANDING WEBSITE */}
      {activeTab === "branding" && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-500" />
                  Pengaturan Logo Resmi &amp; Identitas Visual Website
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Logo yang diatur di sini akan otomatis disinkronkan ke seluruh bagian website: Beranda, E-Store Marketplace (/shop), Admin Sidebar, Halaman Login, Kontak, dan Portal Teknisi.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      logoUrl: "/logo.png",
                      logoWhiteUrl: "/logo.png",
                      faviconUrl: "/logo.png",
                      logoHeight: 40,
                    }));
                    showToast("success", "Logo direset ke Logo Resmi PT. DSTech Smart Perkasa (/logo.png)");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Preset Logo Asli DSTech</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAll(undefined, "Pengaturan logo & branding berhasil disimpan!")}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Menyimpan..." : "Simpan Logo"}</span>
                </button>
              </div>
            </div>

            {/* Input Logo Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Kolom Kiri: Form Upload & URL */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    1. Logo Utama Situs (Light / Standard Navbar)
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Format disarankan file PNG transparan beresolusi tinggi atau SVG.
                  </p>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={settings.logoUrl || ""}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="Contoh: /logo.png atau https://..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 font-mono bg-slate-50"
                    />

                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadLogoFile(e, "logoUrl")}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="px-4 py-2.5 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingLogo ? "Mengunggah..." : "Upload Logo"}</span>
                    </button>
                  </div>
                </div>

                {/* Slider Ukuran Tinggi Logo */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Tinggi Logo di Header:</span>
                    <span className="font-black text-amber-600 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {settings.logoHeight || 40}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="64"
                    step="2"
                    value={settings.logoHeight || 40}
                    onChange={(e) => setSettings({ ...settings, logoHeight: Number(e.target.value) })}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>24px (Kecil)</span>
                    <span>40px (Standar)</span>
                    <span>64px (Besar)</span>
                  </div>
                </div>

                {/* Logo Versi Putih / Footer */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    2. Logo Versi Terang / Gelap (Footer &amp; Dark Theme)
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Logo dengan warna putih / kontras tinggi untuk latar belakang gelap (opsional, jika dikosongkan akan menggunakan logo utama).
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.logoWhiteUrl || ""}
                      onChange={(e) => setSettings({ ...settings, logoWhiteUrl: e.target.value })}
                      placeholder="Contoh: /logo.png atau URL logo putih..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 font-mono bg-slate-50"
                    />

                    <input
                      ref={logoWhiteFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadLogoFile(e, "logoWhiteUrl")}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => logoWhiteFileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Pratinjau Interaktif */}
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Live Preview Logo di Seluruh Background
                </p>

                {/* Preview di Latar Belakang Terang (Navbar Putih) */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-slate-100 pb-2">
                    <span>Pratinjau: Navbar Terang (Beranda &amp; Shop)</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono text-[10px]">White Mode</span>
                  </div>
                  <div className="h-24 flex items-center justify-center p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-dashed border-slate-200">
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt="Logo Preview Light"
                        style={{ height: `${settings.logoHeight || 40}px` }}
                        className="max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum ada logo dipilih</span>
                    )}
                  </div>
                </div>

                {/* Preview di Latar Belakang Gelap (Footer / Dark Navbar) */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-md space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-slate-800 pb-2">
                    <span>Pratinjau: Latar Gelap (Footer &amp; Admin Sidebar)</span>
                    <span className="text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-full font-mono text-[10px]">Dark Mode</span>
                  </div>
                  <div className="h-24 flex items-center justify-center p-3 bg-slate-900/60 rounded-xl border border-dashed border-slate-800">
                    {settings.logoWhiteUrl || settings.logoUrl ? (
                      <img
                        src={settings.logoWhiteUrl || settings.logoUrl}
                        alt="Logo Preview Dark"
                        style={{ height: `${settings.logoHeight || 40}px` }}
                        className="max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-xs text-slate-500 italic">Belum ada logo dipilih</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

                {/* Sub-Section: WhatsApp Khusus Handover AI Chat Departemen */}
                <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                  <p className="text-xs font-black uppercase text-dstech-blue tracking-wider mb-1">
                    🤖 Jalur Handover WhatsApp AI Chat Per Departemen:
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    Ketika AI Chatbot Dani selesai menyaring kebutuhan pengunjung, chat akan langsung diteruskan ke nomor WhatsApp tim departemen yang sesuai:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
                      <label className="block text-[11px] font-black text-blue-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        1. Tim Support Sales &amp; SPH
                      </label>
                      <input
                        type="text"
                        value={settings.whatsappSales || ""}
                        onChange={(e) => setSettings({ ...settings, whatsappSales: e.target.value })}
                        placeholder="Contoh: 6282259494242"
                        className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <label className="block text-[11px] font-black text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                        2. Tim Teknikal Maintenance
                      </label>
                      <input
                        type="text"
                        value={settings.whatsappTechnical || ""}
                        onChange={(e) => setSettings({ ...settings, whatsappTechnical: e.target.value })}
                        placeholder="Contoh: 6282259494242"
                        className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                      <label className="block text-[11px] font-black text-rose-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        3. Tim Penanganan Komplain
                      </label>
                      <input
                        type="text"
                        value={settings.whatsappComplaint || ""}
                        onChange={(e) => setSettings({ ...settings, whatsappComplaint: e.target.value })}
                        placeholder="Contoh: 6282259494242"
                        className="w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
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
                    Cakupan Wilayah Layanan (Nasional / Daerah)
                  </label>
                  <input
                    type="text"
                    value={settings.serviceArea || "Banten (Cilegon, Serang, Tangerang), Jabodetabek, dan Seluruh Wilayah Indonesia (Nasional)"}
                    onChange={(e) => setSettings({ ...settings, serviceArea: e.target.value })}
                    placeholder="Contoh: Banten, Jabodetabek, dan Seluruh Wilayah Indonesia (Nasional)"
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-medium text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ditampilkan pada informasi jangkauan instalasi, e-store, dan footer website resmi.
                  </p>
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

      {/* KONTEN TAB GPS: TITIK GPS KANTOR & GEOFENCING PRESENSI */}
      {activeTab === "gps" && (
        <GpsGeofenceManager standaloneTitle={true} />
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

      {/* KONTEN TAB: PENGATURAN E-STORE & HERO SHOWCASE (Tugas 213) */}
      {activeTab === "estore" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">
                <ShoppingCart className="w-4 h-4" />
                <span>Pengaturan Tampilan Marketplace (/shop)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Hero Showcase &amp; Produk Pilihan E-Store
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Atur latar belakang banner utama (hero), judul promo, serta pilih produk unggulan dari katalog Anda untuk ditampilkan berputar secara otomatis di etalase belanja resmi.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSaveAll(undefined, "Pengaturan E-Store berhasil disimpan!")}
              disabled={saving}
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan..." : "Simpan Pengaturan E-Store"}</span>
            </button>
          </div>

          {/* Grid Pengaturan: Baground Hero & Teks Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kolom Kiri: Latar Belakang (Background) Hero */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">1. Latar Belakang (Background) Hero</h3>
                  <p className="text-[11px] text-slate-400">Pilih tema warna atau upload gambar background kustom</p>
                </div>
              </div>

              {/* Mode Pilihan Background */}
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  Mode Latar Belakang Hero:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "gradient", label: "Gradient Modern", desc: "Ambient Glow", icon: "✨" },
                    { id: "dark", label: "Dark Minimalist", desc: "Charcoal Dark", icon: "🌑" },
                    { id: "navy", label: "Deep Navy", desc: "Cyber Blue", icon: "🌌" },
                    { id: "image", label: "Gambar Kustom", desc: "Upload Banner", icon: "🖼️" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setEstoreConfig((prev) => ({ ...prev, heroBackgroundMode: m.id as any }))}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        estoreConfig.heroBackgroundMode === m.id
                          ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-lg block mb-1">{m.icon}</span>
                      <span className="text-xs font-black text-slate-900 block leading-tight">{m.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kontrol Khusus Mode Gambar Kustom */}
              {estoreConfig.heroBackgroundMode === "image" && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      URL Gambar Background Hero:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={estoreConfig.heroBackgroundImage || ""}
                        onChange={(e) => setEstoreConfig((prev) => ({ ...prev, heroBackgroundImage: e.target.value }))}
                        placeholder="Contoh: /uploads/hero_banner.jpg atau https://..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      <input
                        type="file"
                        ref={heroBgFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadHeroBg}
                      />
                      <button
                        type="button"
                        onClick={() => heroBgFileInputRef.current?.click()}
                        disabled={isUploadingHeroBg}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingHeroBg ? "Mengunggah..." : "Upload File"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Slider Opasitas Overlay Hitam */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">Opasitas Lapisan Gelap (Overlay):</span>
                      <span className="font-mono font-black text-emerald-600">{estoreConfig.heroOverlayOpacity || 70}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="90"
                      step="5"
                      value={estoreConfig.heroOverlayOpacity || 70}
                      onChange={(e) => setEstoreConfig((prev) => ({ ...prev, heroOverlayOpacity: Number(e.target.value) }))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      *Tingkat kegelapan overlay di atas gambar latar belakang agar teks produk selalu terbaca jelas &amp; elegan.
                    </span>
                  </div>

                  {/* Preview Gambar Background */}
                  {estoreConfig.heroBackgroundImage && (
                    <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner">
                      <img
                        src={estoreConfig.heroBackgroundImage}
                        alt="Hero Preview"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 bg-black flex items-center justify-center text-white text-xs font-bold"
                        style={{ opacity: (estoreConfig.heroOverlayOpacity || 70) / 100 }}
                      >
                        Pratinjau Lapisan Teks di Atas Gambar
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Kolom Kanan: Teks Judul & Kecepatan Slide */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">2. Judul Hero &amp; Pengaturan Carousel</h3>
                  <p className="text-[11px] text-slate-400">Teks sorotan banner dan durasi putar otomatis</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Judul Utama Hero:
                  </label>
                  <input
                    type="text"
                    value={estoreConfig.heroTitle}
                    onChange={(e) => setEstoreConfig((prev) => ({ ...prev, heroTitle: e.target.value }))}
                    placeholder="Contoh: Katalog Produk Pilihan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Teks Sorotan Biru (Highlight):
                  </label>
                  <input
                    type="text"
                    value={estoreConfig.heroTitleHighlight}
                    onChange={(e) => setEstoreConfig((prev) => ({ ...prev, heroTitleHighlight: e.target.value }))}
                    placeholder="Contoh: DSTech Smart"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-dstech-blue focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Subjudul / Tagline Hero:
                  </label>
                  <input
                    type="text"
                    value={estoreConfig.heroSubtitle}
                    onChange={(e) => setEstoreConfig((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                    placeholder="Contoh: Featured Showcase • Produk Unggulan & Promo Resmi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                      Durasi Putar Otomatis:
                    </label>
                    <select
                      value={estoreConfig.autoPlayInterval}
                      onChange={(e) => setEstoreConfig((prev) => ({ ...prev, autoPlayInterval: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    >
                      <option value={4000}>Cepat (4 Detik)</option>
                      <option value={6000}>Standar (6 Detik)</option>
                      <option value={8000}>Tenang (8 Detik)</option>
                      <option value={10000}>Lambat (10 Detik)</option>
                      <option value={0}>Nonaktif (Manual)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                      Kotak Lacak Pengiriman:
                    </label>
                    <select
                      value={estoreConfig.showQuickTracker ? "true" : "false"}
                      onChange={(e) => setEstoreConfig((prev) => ({ ...prev, showQuickTracker: e.target.value === "true" }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    >
                      <option value="true">Tampilkan di Hero</option>
                      <option value="false">Sembunyikan</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Daftar Produk Hero Showcase (Carousel Items) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>Daftar Produk Hero Showcase ({estoreConfig.featuredHeroes.length} Produk Terpilih)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Produk-produk ini akan tampil berputar sebagai sorotan utama di halaman belanja. Anda dapat memilih langsung dari master katalog, mengubah urutan, atau menambah produk baru.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHeroSearchQuery("");
                    setIsSelectProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Pilih dari Katalog Produk</span>
                </button>
              </div>
            </div>

            {/* List Kartu Produk Hero */}
            <div className="space-y-3">
              {estoreConfig.featuredHeroes.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    item.isActive
                      ? "bg-white border-slate-200 hover:border-emerald-300 shadow-2xs"
                      : "bg-slate-50/80 border-slate-200 opacity-60"
                  }`}
                >
                  {/* Info Produk & Thumbnail */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-0.5 text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleMoveHeroItem(idx, "up")}
                        disabled={idx === 0}
                        title="Geser ke atas"
                        className="p-1 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-black font-mono text-slate-600">#{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleMoveHeroItem(idx, "down")}
                        disabled={idx === estoreConfig.featuredHeroes.length - 1}
                        title="Geser ke bawah"
                        className="p-1 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
                      <img
                        src={item.image || "/service-smarthome.png"}
                        alt={item.title}
                        className="w-full h-full object-contain p-1"
                        onError={(e: any) => { e.target.src = "/service-smarthome.png"; }}
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${item.badgeColor || "bg-blue-600 text-white"}`}>
                          {item.badge}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {item.category || "Hardware"}
                        </span>
                        {item.discount && (
                          <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 font-bold text-[9.5px]">
                            {item.discount}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-900 truncate max-w-md">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 truncate max-w-lg">
                        {item.subtitle || item.desc}
                      </p>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-black text-emerald-600">
                          {formatRupiah(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="line-through text-slate-400 font-mono text-[11px]">
                            {formatRupiah(item.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Aksi Hero Item */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleHeroItem(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                    >
                      {item.isActive ? "✓ Aktif Tampil" : "Nonaktif"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveHeroItem(item.id)}
                      title="Hapus dari hero"
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {estoreConfig.featuredHeroes.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                    🛍️
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Belum Ada Produk Hero Terpilih</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Klik tombol di bawah untuk memilih produk dari katalog agar tampil di slider utama etalase toko.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSelectProductModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pilih Produk dari Katalog</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PEMILIHAN PRODUK DARI KATALOG UNTUK HERO SHOWCASE (Tugas 213) */}
      {isSelectProductModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsSelectProductModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Pilih Produk untuk Hero Showcase</h3>
                  <p className="text-[11px] text-slate-400">Pilih dari katalog produk resmi yang sedang aktif</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectProductModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar Produk */}
            <div className="shrink-0">
              <input
                type="text"
                value={heroSearchQuery}
                onChange={(e) => setHeroSearchQuery(e.target.value)}
                placeholder="Cari nama produk, kategori, atau tipe..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* List Produk Katalog */}
            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {catalogProducts
                .filter((p) => {
                  if (!heroSearchQuery) return true;
                  const q = heroSearchQuery.toLowerCase();
                  return (
                    p.name?.toLowerCase().includes(q) ||
                    p.category?.toLowerCase().includes(q) ||
                    p.desc?.toLowerCase().includes(q)
                  );
                })
                .map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={prod.image || (prod.images && prod.images[0]) || "/service-smarthome.png"}
                          alt={prod.name}
                          className="w-full h-full object-contain p-1"
                          onError={(e: any) => { e.target.src = "/service-smarthome.png"; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {prod.category || "Hardware"}
                        </div>
                        <h4 className="text-xs font-black text-slate-900 truncate max-w-sm">
                          {prod.name}
                        </h4>
                        <div className="font-mono font-bold text-emerald-600 text-xs">
                          {formatRupiah(prod.price || 0)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddProductToHero(prod)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Jadikan Hero</span>
                    </button>
                  </div>
                ))}

              {catalogProducts.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  Tidak ada produk ditemukan di master katalog.
                </div>
              )}
            </div>
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
