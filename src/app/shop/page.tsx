"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  X,
  ExternalLink,
  Sparkles,
  Truck,
  Eye,
  SlidersHorizontal,
  Award,
  Package,
  Star,
  Download,
  FileText,
  Smartphone,
  User,
  LogIn,
  LogOut,
  Clock,
  MapPin,
  CreditCard,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Upload,
  Check,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Navigation,
  RotateCcw,
  PackageCheck,
  PackageX,
  ArrowLeft,
  Send,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
  commission?: string;
  commissionRate?: number;
  commissionType?: string;
  image?: string;
  desc?: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "dstech_prod_1",
    name: "Smart Doorlock X-100 Luxury Series",
    category: "Smart Home",
    price: 1850000,
    commission: "15%",
    image: "/portfolio-residential.png",
    desc: "Smart Doorlock dengan Fingerprint, RFID Card, Digital Passcode & Kontrol Aplikasi Bluetooth Smartphone.",
  },
  {
    id: "dstech_prod_2",
    name: "CCTV Hikvision 4CH HD Ultra Clear",
    category: "Security",
    price: 3500000,
    commission: "10%",
    image: "/service-cctv.png",
    desc: "Paket CCTV 4 Channel Resolusi Full HD lengkap dengan DVR pintar, HDD 1TB, dan kabel coaxial 50m.",
  },
  {
    id: "dstech_prod_3",
    name: "Fingerprint Face Attendance System",
    category: "Security",
    price: 12500000,
    commission: "10%",
    image: "/about-image.png",
    desc: "Mesin absensi biometrik pengenal wajah & sidik jari berkecepatan tinggi dengan integrasi laporan Excel instan.",
  },
  {
    id: "dstech_prod_4",
    name: "Barrier Gate System Automatic High-Speed",
    category: "Parking",
    price: 18500000,
    commission: "10%",
    image: "/portfolio-industrial.png",
    desc: "Palang parkir otomatis kecepatan tinggi (1.8s) dengan loop detector anti-tabrak & integrasi kartu RFID.",
  },
  {
    id: "dstech_prod_5",
    name: "Website UMKM & Digital Enterprise Suite",
    category: "Software",
    price: 2500000,
    commission: "20%",
    image: "/service-it.png",
    desc: "Paket pembuatan website bisnis profesional responsif, domain .com gratis, hosting cepat, & email bisnis.",
  },
  {
    id: "dstech_prod_6",
    name: "PABX System 8 Extension Office PBX",
    category: "Communication",
    price: 4500000,
    commission: "15%",
    image: "/portfolio-medical.png",
    desc: "Sistem komunikasi telepon internal kantor berkapasitas 8 extension dengan kejernihan suara audio prima.",
  },
];

const SHIPPING_COURIERS = [
  {
    id: "ARMADA_DSTECH",
    name: "Armada Teknisi DSTech (Cilegon, Serang & Banten)",
    cost: 25000,
    etd: "Hari Ini / Besok (Bisa Langsung Pasang)",
    desc: "Diantar langsung oleh staf teknisi resmi PT DSTech Smart Perkasa.",
  },
  {
    id: "JNE_REG",
    name: "JNE Express / J&T Regular",
    cost: 30000,
    etd: "2 - 3 Hari Kerja",
    desc: "Pengiriman paket standar nasional dengan asuransi keamanan barang.",
  },
  {
    id: "INSTANT_EXPRESS",
    name: "Instant Kurir Khusus Industri / Pabrik",
    cost: 50000,
    etd: "3 - 5 Jam Tiba",
    desc: "Pengantaran prioritas kilat untuk kebutuhan mendesak industri Cilegon.",
  },
];

const PAYMENT_BANKS = [
  {
    id: "BCA",
    name: "Bank BCA",
    accountNumber: "1234567890",
    accountName: "PT. DSTECH SMART PERKASA",
    logo: "BCA",
  },
  {
    id: "MANDIRI",
    name: "Bank Mandiri",
    accountNumber: "9876543210123",
    accountName: "PT. DSTECH SMART PERKASA",
    logo: "MANDIRI",
  },
  {
    id: "BRI",
    name: "Bank BRI",
    accountNumber: "001234567890530",
    accountName: "PT. DSTECH SMART PERKASA",
    logo: "BRI",
  },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);

  // Autentikasi Pengguna & Pembeli
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authFormData, setAuthFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Keranjang Belanja & Checkout
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState<string>("ARMADA_DSTECH");
  const [selectedBankId, setSelectedBankId] = useState<string>("BCA");
  const [shippingForm, setShippingForm] = useState({
    recipientName: "",
    phone: "",
    address: "",
    city: "Cilegon",
    province: "Banten",
    postalCode: "42411",
    notes: "",
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  // Kode Unik Transaksi 3 digit acak (100 - 999) untuk verifikasi mutasi bank manual
  const [uniqueCode, setUniqueCode] = useState<number>(() => Math.floor(Math.random() * 899) + 100);

  // Pelacakan & Histori Pesanan (7 Kategori Tab Status)
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState("");
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [uploadProofLoading, setUploadProofLoading] = useState(false);
  const [proofFileBase64, setProofFileBase64] = useState<string | null>(null);

  // 7 Tab Status Histori Pesanan: All, Belum Bayar, Sedang Dikemas, Dikirim, Selesai, Dibatalkan, Pengembalian
  const [orderStatusTab, setOrderStatusTab] = useState<
    "ALL" | "PAYMENT_PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURN"
  >("ALL");
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  // Modal Pengajuan Pengembalian (Retur / Komplain Garansi)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnTargetOrder, setReturnTargetOrder] = useState<any | null>(null);
  const [returnReason, setReturnReason] = useState("Barang Rusak / Cacat Fisik");
  const [returnNotes, setReturnNotes] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Modal Pengajuan Komplain Pesanan Pelanggan
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintTargetOrder, setComplaintTargetOrder] = useState<any | null>(null);
  const [complaintCategory, setComplaintCategory] = useState("Barang Rusak / Cacat Fisik");
  const [complaintDetails, setComplaintDetails] = useState("");
  const [complaintSolution, setComplaintSolution] = useState("Penggantian Unit Baru");
  const [complaintProofBase64, setComplaintProofBase64] = useState<string | null>(null);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Site branding settings
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Inisialisasi Auth User & Keranjang dari LocalStorage
  useEffect(() => {
    try {
      // Ambil user login (bisa dari sesi admin atau sesi client shop)
      const rawUser = localStorage.getItem("dstech_auth_user") || localStorage.getItem("dstech_client_user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        setCurrentUser(u);
        setShippingForm((prev) => ({
          ...prev,
          recipientName: u.name || prev.recipientName,
          phone: u.phone || prev.phone,
        }));
      }

      // Ambil keranjang belanja tersimpan
      const savedCart = localStorage.getItem("dstech_marketplace_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      // Ambil wishlist
      const savedWish = localStorage.getItem("dstech_product_wishlist");
      if (savedWish) {
        setWishlist(JSON.parse(savedWish));
      }
    } catch (e) {
      console.error("Gagal memuat local state:", e);
    }
  }, []);

  // Simpan keranjang ke localStorage setiap berubah
  useEffect(() => {
    try {
      localStorage.setItem("dstech_marketplace_cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Fetch katalog, promosi & site settings
  useEffect(() => {
    fetchProducts();
    fetchPromotions();
    fetchSiteSettings();
    fetchUserOrders();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch("/api/settings?t=" + Date.now());
      const data = await res.json();
      if (data && data.success && data.data) {
        setSiteSettings(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat site settings:", err);
    }
  };

  // Ambil riwayat pesanan milik user saat modal tracking terbuka atau user aktif
  useEffect(() => {
    if (currentUser) {
      fetchUserOrders(currentUser);
    }
  }, [currentUser]);

  const fetchPromotions = async () => {
    try {
      const res = await fetch("/api/promotions?t=" + Date.now());
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setPromotions(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat promosi:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?entity=PT&isPublic=true&t=" + Date.now());
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        const ptOnly = data.data.filter((p: any) => !p.entityType || p.entityType === "PT");
        setProducts(ptOnly);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (user?: AuthUser | null) => {
    try {
      const u = user || currentUser;
      let localNumbers: string[] = [];
      try {
        localNumbers = JSON.parse(localStorage.getItem("dstech_my_order_numbers") || "[]");
      } catch (e) {
        localNumbers = [];
      }

      let url = `/api/orders?t=${Date.now()}`;
      if (u?.id) {
        url = `/api/orders?userId=${encodeURIComponent(u.id)}&t=${Date.now()}`;
      } else if (u?.email) {
        url = `/api/orders?email=${encodeURIComponent(u.email)}&t=${Date.now()}`;
      } else if (localNumbers.length > 0) {
        url = `/api/orders?orderNumbers=${encodeURIComponent(localNumbers.join(","))}&t=${Date.now()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setUserOrders(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat pesanan user:", err);
    }
  };

  // Handler Login / Register Pembeli
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        // Coba login via API auth
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authFormData.email.trim(),
            password: authFormData.password,
          }),
        });
        const data = await res.json();

        if (data.success && data.user) {
          const clientData: AuthUser = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role || "CLIENT",
            phone: data.user.phone || authFormData.phone,
          };
          localStorage.setItem("dstech_client_user", JSON.stringify(clientData));
          setCurrentUser(clientData);
          setIsAuthModalOpen(false);
          showToast(`Selamat datang kembali, ${clientData.name}!`);
          fetchUserOrders(clientData);
        } else {
          setAuthError(data.error || "Email atau password salah.");
        }
      } else {
        // Registrasi Akun Pembeli Baru (Role: CLIENT)
        if (!authFormData.name || !authFormData.email || !authFormData.password) {
          setAuthError("Nama lengkap, email, dan password wajib diisi!");
          setAuthLoading(false);
          return;
        }

        const newClientUser: AuthUser = {
          id: `client_${Date.now()}`,
          name: authFormData.name.trim(),
          email: authFormData.email.trim(),
          phone: authFormData.phone.trim() || "0822-5949-4242",
          role: "CLIENT",
        };

        // Simpan juga ke database users melalui /api/users
        try {
          await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: newClientUser.name,
              email: newClientUser.email,
              phone: newClientUser.phone,
              password: authFormData.password,
              role: "CLIENT",
              status: "Active",
            }),
          });
        } catch (e) {
          console.warn("User API sync warning:", e);
        }

        localStorage.setItem("dstech_client_user", JSON.stringify(newClientUser));
        setCurrentUser(newClientUser);
        setIsAuthModalOpen(false);
        showToast(`Akun Anda berhasil didaftarkan! Selamat berbelanja, ${newClientUser.name}.`);
        fetchUserOrders(newClientUser);
      }
    } catch (err: any) {
      setAuthError(err.message || "Terjadi kesalahan koneksi server.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dstech_client_user");
    localStorage.removeItem("dstech_auth_user");
    setCurrentUser(null);
    setUserOrders([]);
    showToast("Anda telah keluar dari akun.");
  };

  // Handler Keranjang Belanja
  const addToCart = (product: Product, qty: number = 1) => {
    // Verifikasi Wajib Login Sebelum Belanja
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast("Silakan masuk atau daftar akun terlebih dahulu untuk berbelanja.");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { product, qty }];
    });

    showToast(`✓ ${product.name} berhasil ditambahkan ke keranjang.`);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast("Item berhasil dihapus dari keranjang.");
  };

  // Perhitungan Biaya Keranjang
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);
  const selectedCourier = SHIPPING_COURIERS.find((c) => c.id === selectedCourierId) || SHIPPING_COURIERS[0];
  const installationFee = includeInstallation ? 350000 : 0;
  const grandTotal = cartSubtotal + selectedCourier.cost + installationFee + (cart.length > 0 ? uniqueCode : 0);

  // Handler Submit Checkout Pesanan
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (cart.length === 0) {
      showToast("Keranjang belanja Anda kosong!");
      return;
    }

    if (!shippingForm.recipientName || !shippingForm.phone || !shippingForm.address) {
      showToast("Lengkapi nama penerima, nomor WhatsApp, dan alamat pengiriman!");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const selectedBank = PAYMENT_BANKS.find((b) => b.id === selectedBankId) || PAYMENT_BANKS[0];

      const payload = {
        userId: currentUser.id,
        customerName: shippingForm.recipientName || currentUser.name,
        customerEmail: currentUser.email,
        customerPhone: shippingForm.phone || currentUser.phone || "0822-5949-4242",
        shippingAddress: shippingForm,
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          qty: item.qty,
          image: item.product.image,
          category: item.product.category,
        })),
        includeInstallation,
        installationFee,
        shippingCourier: selectedCourier.name,
        shippingCost: selectedCourier.cost,
        uniqueCode,
        paymentMethod: "TRANSFER_BANK",
        paymentBank: `${selectedBank.name} - ${selectedBank.accountNumber} a.n ${selectedBank.accountName}`,
        notes: shippingForm.notes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.data) {
        // Kosongkan keranjang & reset kode unik untuk pesanan berikutnya
        setCart([]);
        setIsCartOpen(false);
        setIsCheckoutStep(false);
        setUniqueCode(Math.floor(Math.random() * 899) + 100);

        // Simpan nomor pesanan ke histori lokal peramban (Guest / User)
        try {
          const prev = JSON.parse(localStorage.getItem("dstech_my_order_numbers") || "[]");
          if (!prev.includes(data.data.orderNumber)) {
            prev.unshift(data.data.orderNumber);
            localStorage.setItem("dstech_my_order_numbers", JSON.stringify(prev));
          }
        } catch (e) {
          console.error(e);
        }

        // Buka modal pelacakan untuk pesanan yang baru dibuat
        setTrackedOrder(data.data);
        setIsTrackingModalOpen(true);
        fetchUserOrders(currentUser);

        showToast(`🎉 Pesanan #${data.data.orderNumber} berhasil dibuat!`);
      } else {
        alert("Gagal membuat pesanan: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Error checkout pesanan: " + err.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Handler Lacak Pesanan Real-Time
  const handleTrackOrder = async (queryToTrack?: string) => {
    const q = (queryToTrack || trackingQuery).trim();
    if (!q) {
      setTrackingError("Masukkan Nomor Pesanan atau Nomor Resi!");
      return;
    }

    setIsTrackingLoading(true);
    setTrackingError(null);

    try {
      const res = await fetch(`/api/orders/tracking?q=${encodeURIComponent(q)}&t=${Date.now()}`);
      const data = await res.json();

      if (data.success && data.data) {
        setTrackedOrder(data.data);
      } else {
        setTrackingError(data.error || "Pesanan tidak ditemukan.");
        setTrackedOrder(null);
      }
    } catch (err: any) {
      setTrackingError("Gagal melacak pesanan: " + err.message);
      setTrackedOrder(null);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  // Handler Upload Bukti Pembayaran
  const handleUploadProof = async (orderId: string) => {
    if (!proofFileBase64) {
      alert("Silakan pilih file foto/gambar struk transfer terlebih dahulu!");
      return;
    }

    setUploadProofLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          action: "upload_proof",
          paymentProof: proofFileBase64,
          note: "Bukti transfer telah dikirimkan oleh pemesan.",
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setTrackedOrder(data.data);
        setProofFileBase64(null);
        showToast("✓ Bukti transfer berhasil dikirim. Menunggu verifikasi tim keuangan.");
        if (currentUser) fetchUserOrders(currentUser);
      } else {
        alert("Gagal mengunggah bukti: " + (data.error || "Error"));
      }
    } catch (err: any) {
      alert("Error upload bukti: " + err.message);
    } finally {
      setUploadProofLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Wishlist toggle
  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (wishlist.includes(id)) {
      updated = wishlist.filter((item) => item !== id);
      showToast("Dihapus dari Wishlist");
    } else {
      updated = [...wishlist, id];
      showToast("Ditambahkan ke Wishlist ❤️");
    }
    setWishlist(updated);
    localStorage.setItem("dstech_product_wishlist", JSON.stringify(updated));
  };

  // Filter Categories
  const categories = ["Semua", "Smart Home", "Security", "Parking", "Software", "Communication"];

  const filteredProducts = products.filter((prod) => {
    const matchCategory = activeCategory === "Semua" || prod.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch =
      prod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.desc?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchWishlist = showOnlyWishlist ? wishlist.includes(prod.id) : true;
    return matchCategory && matchSearch && matchWishlist;
  });

  // Handler Membuka Modal Pengajuan Retur
  const handleOpenReturnModal = (order: any) => {
    setReturnTargetOrder(order);
    setReturnReason("Barang Rusak / Cacat Fisik");
    setReturnNotes("");
    setIsReturnModalOpen(true);
  };

  // Handler Submit Pengajuan Pengembalian / Retur
  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTargetOrder) return;
    setIsSubmittingReturn(true);

    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: returnTargetOrder.id,
          action: "return_order",
          note: `Pengajuan Pengembalian / Retur oleh Pelanggan: [${returnReason}]. Rincian kendala: ${returnNotes.trim() || "-"}`,
        }),
      });

      const data = await res.json();
      if (data && data.success && data.data) {
        if (trackedOrder && trackedOrder.id === returnTargetOrder.id) {
          setTrackedOrder(data.data);
        }
        setIsReturnModalOpen(false);
        showToast("✓ Permintaan pengembalian telah diajukan ke Tim QC & Layanan DSTech.");
        fetchUserOrders(currentUser);
      } else {
        alert("Gagal mengajukan pengembalian: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Error pengajuan retur: " + err.message);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Handler Membuka Modal Pengajuan Komplain
  const handleOpenComplaintModal = (order: any) => {
    setComplaintTargetOrder(order);
    setComplaintCategory(order.complaint?.category || "Barang Rusak / Cacat Fisik");
    setComplaintDetails(order.complaint?.description || "");
    setComplaintSolution(order.complaint?.expectedSolution || "Penggantian Unit Baru");
    setComplaintProofBase64(order.complaint?.proofImage || null);
    setIsComplaintModalOpen(true);
  };

  // Handler Kirim Komplain Pesanan Pelanggan
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintTargetOrder) return;
    if (!complaintDetails.trim()) {
      alert("Silakan tuliskan rincian keluhan / kendala pesanan Anda.");
      return;
    }
    setIsSubmittingComplaint(true);

    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: complaintTargetOrder.id,
          action: "submit_complaint",
          complaintCategory,
          complaintDetails: complaintDetails.trim(),
          complaintSolution,
          complaintProof: complaintProofBase64,
          note: `Komplain pelanggan: [${complaintCategory}]. Solusi diharapkan: [${complaintSolution}]. Rincian: ${complaintDetails.trim()}`,
        }),
      });

      const data = await res.json();
      if (data && data.success && data.data) {
        if (trackedOrder && trackedOrder.id === complaintTargetOrder.id) {
          setTrackedOrder(data.data);
        }
        setIsComplaintModalOpen(false);
        showToast("✓ Komplain berhasil dikirim. Tim After-Sales akan segera meninjau.");
        fetchUserOrders(currentUser);
      } else {
        alert("Gagal mengirim komplain: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Error kirim komplain: " + err.message);
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  // Handler Beli Lagi (Reorder)
  const handleBuyAgain = (order: any) => {
    if (!order || !Array.isArray(order.items)) return;
    const newItems: CartItem[] = order.items.map((it: any) => ({
      product: {
        id: it.productId,
        name: it.productName,
        price: it.price,
        image: it.image,
        category: it.category || "Hardware",
      },
      qty: it.qty || 1,
    }));

    setCart((prev) => {
      const updated = [...prev];
      newItems.forEach((newItem) => {
        const exist = updated.find((c) => c.product.id === newItem.product.id);
        if (exist) {
          exist.qty += newItem.qty;
        } else {
          updated.push(newItem);
        }
      });
      return updated;
    });

    setIsCartOpen(true);
    showToast("✓ Produk berhasil ditambahkan kembali ke keranjang!");
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-dstech-blue selection:text-white pb-24">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/80 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* HEADER MARKETPLACE DSTECH SMART */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-11 w-36 sm:w-44 shrink-0 flex items-center">
                <Image
                  src={siteSettings?.logoUrl || "/logo.png"}
                  alt={siteSettings?.companyName || "PT. DSTech Smart Perkasa"}
                  fill
                  className="object-contain object-left transition-transform group-hover:scale-105"
                  priority
                />
              </div>
              <div className="hidden sm:block border-l border-slate-200 pl-3">
                <span className="font-black text-slate-900 text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                  MARKETPLACE <span className="text-dstech-red">OFFICIAL</span>
                </span>
                <span className="text-[9.5px] font-bold text-slate-400 block -mt-0.5 tracking-wider uppercase">
                  Hardware &amp; IT Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Tracking & Account Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tombol Lacak Pesanan Live */}
            {(() => {
              const activeOrders = userOrders.filter(
                (ord) => ord.status !== "DELIVERED" && ord.status !== "CANCELLED"
              );
              return (
                <button
                  onClick={() => {
                    setIsTrackingModalOpen(true);
                    if (activeOrders.length > 0 && !trackedOrder) {
                      setTrackedOrder(activeOrders[0]);
                    } else if (userOrders.length > 0 && !trackedOrder) {
                      setTrackedOrder(userOrders[0]);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
                  title={
                    activeOrders.length > 0
                      ? `${activeOrders.length} pesanan aktif sedang berjalan`
                      : "Lacak pengiriman pesanan Anda"
                  }
                >
                  <Truck className="w-3.5 h-3.5 text-dstech-blue" />
                  <span className="hidden sm:inline">Lacak Pengiriman</span>
                  {activeOrders.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-dstech-blue text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {activeOrders.length}
                    </span>
                  )}
                </button>
              );
            })()}

            {/* Tombol Keranjang Belanja */}
            <button
              onClick={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                  showToast("Silakan login akun terlebih dahulu untuk melihat keranjang belanja.");
                } else {
                  setIsCartOpen(true);
                }
              }}
              className="relative p-2.5 sm:px-4 sm:py-2 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {cart.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-dstech-red text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </span>
              )}
            </button>

            {/* Akun Pengguna / Tombol Masuk */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-black text-slate-900 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                    {currentUser.role === "CLIENT" ? "Pelanggan Terverifikasi" : currentUser.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Keluar dari akun"
                  className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("login");
                  setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Akun</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO BANNER MARKETPLACE */}
      <section className="bg-gradient-to-b from-white to-slate-100 py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-dstech-blue text-xs font-black tracking-wide border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Original • Garansi Resmi 1 Tahun • Dukungan Teknisi Lapangan
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Belanja Perangkat Cerdas &amp; IT <span className="text-dstech-blue italic">Bergaransi Sah.</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Pusat pengadaan CCTV, Smart Doorlock, Palang Parkir Otomatis, dan Solusi Jaringan untuk rumah tinggal,
              instansi, hingga kawasan industri dengan opsi pengiriman langsung + instalasi teknisi profesional.
            </p>
          </div>

          {/* Quick Track Input Bar */}
          <div className="w-full md:w-96 bg-white p-4 rounded-3xl shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Lacak Pengiriman Anda</h4>
                <p className="text-[10px] text-slate-500">Cek status pesanan secara real-time</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="No. Pesanan / No. Resi..."
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsTrackingModalOpen(true);
                    handleTrackOrder(trackingQuery);
                  }
                }}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
              />
              <button
                onClick={() => {
                  setIsTrackingModalOpen(true);
                  handleTrackOrder(trackingQuery);
                }}
                className="px-4 py-2 bg-dstech-blue hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
              >
                Lacak
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & KATALOG PRODUK */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari produk atau spesifikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-black text-slate-900">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const isFav = wishlist.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all flex flex-col cursor-pointer relative"
                >
                  {/* Image Container */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={prod.image || "/service-cctv.png"}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/95 text-slate-900 font-black text-[10px] uppercase tracking-wider shadow-sm">
                        {prod.category}
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleWishlist(prod.id, e)}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-rose-600 shadow-sm transition-colors cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>5.0</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ✓ Resmi Bergaransi
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 leading-snug group-hover:text-dstech-blue transition-colors line-clamp-2">
                      {prod.name}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed flex-1">
                      {prod.desc || "Perangkat teknologi resmi berkualitas prima dari PT. DSTech Smart Perkasa."}
                    </p>

                    {/* Price & Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Harga</span>
                        <span className="text-base sm:text-lg font-black text-dstech-blue">
                          {formatRupiah(prod.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => addToCart(prod, 1)}
                          title="Tambah ke Keranjang Belanja"
                          className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">+Keranjang</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(prod, 1);
                            setIsCartOpen(true);
                          }}
                          className="h-10 px-4 rounded-xl bg-dstech-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <span>Beli</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* MODAL 1: AUTENTIKASI PENGGUNA (WAJIB LOGIN UNTUK BELANJA)     */}
      {/* ============================================================ */}
      {isAuthModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-dstech-blue to-blue-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-blue-500/20">
                DST
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {authMode === "login" ? "Masuk Akun DSTech Smart" : "Daftar Akun Pelanggan"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {authMode === "login"
                  ? "Masuk untuk melanjutkan transaksi belanja, simpan alamat, dan lacak status pengiriman."
                  : "Buat akun pelanggan resmi untuk menikmati garansi sah dan kemudahan belanja online."}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                }}
                className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  authMode === "login" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Masuk Akun
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError(null);
                }}
                className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  authMode === "register" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Daftar Baru
              </button>
            </div>

            {authError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Nama Lengkap / Instansi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso / PT. Maju Bersama"
                    value={authFormData.name}
                    onChange={(e) => setAuthFormData({ ...authFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">Email Aktif</label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={authFormData.email}
                  onChange={(e) => setAuthFormData({ ...authFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                />
              </div>

              {authMode === "register" && (
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={authFormData.phone}
                    onChange={(e) => setAuthFormData({ ...authFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">Kata Sandi</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authFormData.password}
                  onChange={(e) => setAuthFormData({ ...authFormData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-dstech-blue hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : authMode === "login" ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk &amp; Lanjutkan Belanja</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Daftar Akun Baru</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: KERANJANG BELANJA & CHECKOUT MARKETPLACE            */}
      {/* ============================================================ */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => {
            setIsCartOpen(false);
            setIsCheckoutStep(false);
          }}
        >
          <div
            className="bg-white rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-dstech-blue/10 text-dstech-blue flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isCheckoutStep ? "Checkout & Informasi Pengiriman" : "Keranjang Belanja Anda"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isCheckoutStep
                      ? "Lengkapi alamat pengiriman dan pilih metode pembayaran"
                      : `${cart.length} item produk siap dipesan`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutStep(false);
                }}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Isi Keranjang atau Form Checkout */}
            {cart.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-black text-slate-900">Keranjang Belanja Kosong</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Silakan pilih produk yang Anda inginkan dari katalog di atas dan klik tombol tambah keranjang.
                </p>
              </div>
            ) : !isCheckoutStep ? (
              /* LANGKAH 1: DAFTAR ITEM KERANJANG */
              <div className="py-4 space-y-4">
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                          <Image
                            src={item.product.image || "/service-cctv.png"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 line-clamp-1">{item.product.name}</h4>
                          <span className="text-xs font-mono font-bold text-dstech-blue">
                            {formatRupiah(item.product.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-black text-xs text-slate-900">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Opsi Tambahan Jasa Pasang Teknisi */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="add-installation"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-dstech-blue rounded cursor-pointer"
                  />
                  <label htmlFor="add-installation" className="text-xs cursor-pointer select-none">
                    <span className="font-black text-slate-900 block">
                      Tambahkan Jasa Pemasangan &amp; Setup Teknisi DSTech (+Rp 350.000)
                    </span>
                    <span className="text-[11px] text-slate-600 leading-relaxed block mt-0.5">
                      Teknisi bersertifikat kami akan datang langsung ke lokasi Anda di Banten untuk instalasi kabel,
                      mounting perangkat, dan konfigurasi aplikasi smartphone.
                    </span>
                  </label>
                </div>

                {/* Ringkasan Subtotal */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Subtotal Barang:</span>
                  <span className="text-sm font-black font-mono text-slate-900">{formatRupiah(cartSubtotal)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCheckoutStep(true)}
                  className="w-full py-3.5 rounded-2xl bg-dstech-blue hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Lanjutkan ke Alamat Pengiriman</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* LANGKAH 2: FORM PENGIRIMAN & PEMBAYARAN */
              <form onSubmit={handleCheckoutSubmit} className="py-4 space-y-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-dstech-blue" />
                    Alamat Pengiriman Paket
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Nama Penerima</label>
                      <input
                        type="text"
                        required
                        placeholder="Nama penerima paket"
                        value={shippingForm.recipientName}
                        onChange={(e) => setShippingForm({ ...shippingForm, recipientName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">No. WhatsApp/HP</label>
                      <input
                        type="tel"
                        required
                        placeholder="08xxxxxxxxxx"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Alamat Lengkap</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Jalan, Nomor Rumah, RT/RW, Patokan..."
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Kota</label>
                      <input
                        type="text"
                        required
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Provinsi</label>
                      <input
                        type="text"
                        required
                        value={shippingForm.province}
                        onChange={(e) => setShippingForm({ ...shippingForm, province: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Kode Pos</label>
                      <input
                        type="text"
                        value={shippingForm.postalCode}
                        onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Pilihan Ekspedisi / Kurir Pengiriman */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-dstech-blue" />
                    Pilihan Kurir Pengiriman
                  </h4>
                  <div className="space-y-2">
                    {SHIPPING_COURIERS.map((c) => (
                      <label
                        key={c.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          selectedCourierId === c.id
                            ? "bg-blue-50/70 border-dstech-blue ring-1 ring-dstech-blue"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="courier"
                            checked={selectedCourierId === c.id}
                            onChange={() => setSelectedCourierId(c.id)}
                            className="w-4 h-4 text-dstech-blue"
                          />
                          <div>
                            <div className="text-xs font-black text-slate-900">{c.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {c.etd} • {c.desc}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-black font-mono text-slate-900">{formatRupiah(c.cost)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pilihan Rekening Pembayaran */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-dstech-blue" />
                    Rekening Resmi Tujuan Transfer
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PAYMENT_BANKS.map((b) => (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => setSelectedBankId(b.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedBankId === b.id
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-xs font-black">{b.name}</div>
                        <div className="text-[10px] font-mono mt-0.5 opacity-80">{b.accountNumber}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rincian Total Akhir */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Subtotal Produk:</span>
                    <span>{formatRupiah(cartSubtotal)}</span>
                  </div>
                  {includeInstallation && (
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Jasa Pemasangan Teknisi:</span>
                      <span>{formatRupiah(installationFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Biaya Pengiriman ({selectedCourier.name}):</span>
                    <span>{formatRupiah(selectedCourier.cost)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-amber-300 font-semibold items-center bg-slate-800/80 p-2 rounded-xl border border-amber-500/30">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Kode Unik Verifikasi:
                    </span>
                    <span className="font-mono font-black text-amber-300">+{formatRupiah(uniqueCode)}</span>
                  </div>
                  <p className="text-[10px] text-amber-200/70 italic px-1 leading-tight">
                    *Wajib transfer presisi hingga 3 digit terakhir untuk mempermudah pengecekan mutasi manual.
                  </p>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black">
                    <span>Total Pembayaran:</span>
                    <span className="text-base text-amber-400 font-mono">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutStep(false)}
                    className="py-3 px-5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="flex-1 py-3.5 rounded-xl bg-dstech-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmittingOrder ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Konfirmasi &amp; Buat Pesanan Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: HISTORI PESANAN TERPADU & PELACAKAN STATUS REAL-TIME */}
      {/* Dilengkapi 7 Tab: All, Belum Bayar, Dikemas, Dikirim, Selesai, Dibatalkan, Pengembalian */}
      {/* ============================================================ */}
      {isTrackingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsTrackingModalOpen(false)}
        >
          <div
            className="bg-white rounded-[32px] max-w-4xl w-full p-5 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal Histori & Tracking */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-dstech-blue to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      Histori &amp; Pelacakan Pesanan
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-dstech-blue border border-blue-200">
                      Live E-Store
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pantau status pembayaran, logistik kurir, pesanan selesai, dan pengajuan komplain garansi/retur
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 7 Tab Kategori Status Pesanan */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
              {[
                { id: "ALL", label: "All", count: userOrders.length },
                {
                  id: "PAYMENT_PENDING",
                  label: "Belum Bayar",
                  count: userOrders.filter((o) => o.status === "PAYMENT_PENDING").length,
                  highlight: userOrders.some((o) => o.status === "PAYMENT_PENDING"),
                },
                {
                  id: "PROCESSING",
                  label: "Sedang Dikemas",
                  count: userOrders.filter((o) => o.status === "PROCESSING" || o.status === "PAID").length,
                },
                {
                  id: "SHIPPED",
                  label: "Dikirim",
                  count: userOrders.filter((o) => o.status === "SHIPPED").length,
                  highlight: userOrders.some((o) => o.status === "SHIPPED"),
                },
                {
                  id: "DELIVERED",
                  label: "Selesai",
                  count: userOrders.filter((o) => o.status === "DELIVERED").length,
                },
                {
                  id: "CANCELLED",
                  label: "Dibatalkan",
                  count: userOrders.filter((o) => o.status === "CANCELLED").length,
                },
                {
                  id: "RETURN",
                  label: "Pengembalian",
                  count: userOrders.filter((o) => o.status === "RETURN").length,
                  highlight: userOrders.some((o) => o.status === "RETURN"),
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setOrderStatusTab(tab.id as any);
                    setTrackedOrder(null); // Kembali ke list view saat ganti tab
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                    orderStatusTab === tab.id
                      ? tab.highlight
                        ? "bg-dstech-red text-white shadow-md shadow-red-500/20"
                        : "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      orderStatusTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Pencarian No. Pesanan / Resi */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik Nomor Pesanan (ORD/DSP/...), nama produk, atau No. Resi..."
                  value={trackingQuery}
                  onChange={(e) => {
                    setTrackingQuery(e.target.value);
                    setHistorySearchQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTrackOrder();
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                />
              </div>
              <button
                onClick={() => handleTrackOrder()}
                disabled={isTrackingLoading}
                className="px-5 py-2.5 bg-dstech-blue hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 shrink-0"
              >
                {isTrackingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Lacak Resi / Order</span>
              </button>
            </div>

            {trackingError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{trackingError}</span>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAMPILAN 1: DETAIL PELACAKAN SATU PESANAN (LINIMASA & RESI)  */}
            {/* ============================================================ */}
            {trackedOrder ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Tombol Kembali ke Daftar Pesanan */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setTrackedOrder(null)}
                    className="text-xs font-black text-slate-600 hover:text-dstech-blue flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Daftar Pesanan</span>
                  </button>

                  <span className="text-[11px] font-mono text-slate-400">
                    Dibuat: {new Date(trackedOrder.createdAt || Date.now()).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Info Card Pesanan Detail */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg shadow-slate-900/10">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block tracking-wider uppercase">
                        NOMOR PESANAN RESMI
                      </span>
                      <span className="text-lg font-black font-mono text-amber-400 tracking-tight">
                        {trackedOrder.orderNumber}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        trackedOrder.status === "DELIVERED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : trackedOrder.status === "SHIPPED"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : trackedOrder.status === "PROCESSING"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : trackedOrder.status === "PAID"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : trackedOrder.status === "RETURN"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : trackedOrder.status === "CANCELLED"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {trackedOrder.status === "PAYMENT_PENDING" ? (
                        trackedOrder.paymentProof ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Menunggu Verifikasi Pembayaran
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" /> Belum Bayar
                          </>
                        )
                      ) : trackedOrder.status === "PAID" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Pembayaran Diterima
                        </>
                      ) : trackedOrder.status === "PROCESSING" ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" /> Sedang Dikemas
                        </>
                      ) : trackedOrder.status === "SHIPPED" ? (
                        <>
                          <Truck className="w-3.5 h-3.5 text-purple-400" /> Sedang Dikirim
                        </>
                      ) : trackedOrder.status === "DELIVERED" ? (
                        <>
                          <PackageCheck className="w-3.5 h-3.5 text-emerald-400" /> Pesanan Selesai
                        </>
                      ) : trackedOrder.status === "RETURN" ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 text-amber-300" /> Pengembalian / Retur
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 text-rose-400" /> Dibatalkan
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Pemesan</span>
                      <span className="font-bold">{trackedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Total Pembayaran</span>
                      <span className="font-bold font-mono text-emerald-400">
                        {formatRupiah(trackedOrder.grandTotal)}
                      </span>
                      {trackedOrder.uniqueCode && (
                        <span className="text-[9.5px] font-mono text-amber-300/90 block mt-0.5">
                          (Kode Unik: +{trackedOrder.uniqueCode})
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-slate-400 text-[10px] block">Kurir / Ekspedisi</span>
                      <span className="font-bold">{trackedOrder.shippingCourier || "Armada DSTech"}</span>
                    </div>
                  </div>

                  {trackedOrder.trackingNumber && (
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
                      <span className="text-slate-400">No. Resi Pengiriman:</span>
                      <span className="font-black text-amber-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                        {trackedOrder.trackingNumber}
                      </span>
                    </div>
                  )}

                  {/* List Item Pembelian dalam Pesanan */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Daftar Produk ({trackedOrder.items?.length || 0}):
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {trackedOrder.items?.map((it: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-slate-800/50 p-2 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-700 shrink-0">
                              <Image
                                src={it.image || "/service-cctv.png"}
                                alt={it.productName || "Produk"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="font-bold text-slate-200 line-clamp-1">{it.productName}</span>
                          </div>
                          <span className="font-mono text-slate-300 shrink-0">
                            {it.qty}x @ {formatRupiah(it.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Verifikasi jika Bukti Transfer sudah diunggah tapi status masih PAYMENT_PENDING */}
                {trackedOrder.status === "PAYMENT_PENDING" && trackedOrder.paymentProof && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2">
                          Bukti Transfer Sedang Diverifikasi
                          <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                            Antrean Validasi
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          Bukti transfer Anda sebesar <strong className="text-amber-300 font-mono">{formatRupiah(trackedOrder.grandTotal)}</strong> telah berhasil kami terima.
                          Tim Keuangan PT DSTech Smart Perkasa sedang mencocokkan mutasi rekening bank secara manual.
                          Status pesanan akan segera berubah menjadi <strong className="text-blue-300">"Pembayaran Diterima"</strong> dan masuk ke tahap <strong className="text-indigo-300">"Sedang Dikemas"</strong> setelah tervalidasi.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={trackedOrder.paymentProof}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> Lihat Bukti Transfer Terkirim
                      </a>
                      <label className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Ulang Bukti (Jika Salah Struk)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {proofFileBase64 && (
                      <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between gap-2">
                        <span className="text-xs text-amber-200">File baru dipilih. Siap dikirim ulang?</span>
                        <button
                          type="button"
                          onClick={() => handleUploadProof(trackedOrder.id)}
                          disabled={uploadProofLoading}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          {uploadProofLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          Kirim Ulang
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Bukti Transfer jika status PAYMENT_PENDING dan BELUM pernah upload bukti */}
                {trackedOrder.status === "PAYMENT_PENDING" && !trackedOrder.paymentProof && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-amber-900">Menunggu Bukti Transfer Pembayaran</h4>
                        <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                          Silakan transfer tepat sebesar <strong className="font-mono text-amber-950 text-xs sm:text-sm bg-amber-100 px-1.5 py-0.5 rounded">{formatRupiah(trackedOrder.grandTotal)}</strong> ke rekening
                          tujuan: <strong>{trackedOrder.paymentBank || "BCA 1234567890 a.n PT DSTech Smart Perkasa"}</strong>.
                          {trackedOrder.uniqueCode && (
                            <span className="block mt-1 text-[11px] font-bold text-amber-900">
                              *Wajib transfer tepat hingga 3 digit terakhir (+Rp {trackedOrder.uniqueCode}) agar mutasi bank dapat diverifikasi dengan cepat.
                            </span>
                          )}
                          Setelah transfer, unggah foto/screenshot struk bukti transfer di bawah.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => handleUploadProof(trackedOrder.id)}
                        disabled={uploadProofLoading || !proofFileBase64}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                      >
                        {uploadProofLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Kirim Bukti Pembayaran</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Visual Stepper / Linimasa Pelacakan Real-Time */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-dstech-blue" />
                    Linimasa Perjalanan Paket
                  </h4>

                  <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {(trackedOrder.trackingTimeline || []).map((step: any, idx: number) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-dstech-blue text-white flex items-center justify-center text-[10px] font-black ring-4 ring-white shadow-xs">
                          {idx + 1}
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-slate-900">{step.title}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(step.timestamp).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              WIB
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{step.description}</p>
                          <div className="text-[9.5px] text-slate-400 font-mono">
                            {new Date(step.timestamp).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel Status Komplain jika ada */}
                {trackedOrder.complaint && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-xs space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Komplain: {trackedOrder.complaint.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          trackedOrder.complaint.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                        }`}
                      >
                        {trackedOrder.complaint.status === "RESOLVED" ? "✓ Selesai Ditangani" : "⏳ Sedang Ditinjau CS"}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{trackedOrder.complaint.description}</p>
                    {trackedOrder.complaint.expectedSolution && (
                      <div className="text-[11px] text-amber-800">
                        Ekspektasi: <strong>{trackedOrder.complaint.expectedSolution}</strong>
                      </div>
                    )}
                    {trackedOrder.complaint.adminNotes && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white/90 border border-amber-200 text-[11px] text-slate-800">
                        <strong>Tanggapan CS DSTech:</strong> {trackedOrder.complaint.adminNotes}
                      </div>
                    )}
                  </div>
                )}

                {/* Tombol Aksi Bawah: Ajukan Retur, Komplain, Beli Lagi, Chat CS */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tombol Komplain Pesanan */}
                    <button
                      onClick={() => handleOpenComplaintModal(trackedOrder)}
                      className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-black flex items-center gap-1.5 border border-amber-300 transition cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{trackedOrder.complaint ? "Ubah / Update Komplain" : "Ajukan Komplain"}</span>
                    </button>

                    {trackedOrder.status === "DELIVERED" && (
                      <button
                        onClick={() => handleOpenReturnModal(trackedOrder)}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-black flex items-center gap-1.5 border border-rose-200 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Ajukan Retur</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleBuyAgain(trackedOrder)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-dstech-blue" />
                      <span>Beli Lagi</span>
                    </button>
                  </div>

                  <a
                    href={`https://wa.me/6282259494242?text=${encodeURIComponent(
                      `Halo Customer Service DSTech Smart, saya ingin menanyakan status pesanan saya: #${trackedOrder.orderNumber} (Total: ${formatRupiah(
                        trackedOrder.grandTotal
                      )})`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hubungi CS via WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              /* ============================================================ */
              /* TAMPILAN 2: DAFTAR KARTU HISTORI PESANAN (SESUAI 7 TAB)       */
              /* ============================================================ */
              <div className="space-y-4">
                {(() => {
                  const filtered = userOrders.filter((ord) => {
                    // Filter Status Tab
                    if (orderStatusTab !== "ALL") {
                      if (orderStatusTab === "PROCESSING") {
                        if (ord.status !== "PROCESSING" && ord.status !== "PAID") return false;
                      } else if (ord.status !== orderStatusTab) {
                        return false;
                      }
                    }

                    // Filter Search Query
                    if (historySearchQuery.trim()) {
                      const q = historySearchQuery.toLowerCase();
                      const matchNum = ord.orderNumber?.toLowerCase().includes(q);
                      const matchResi = ord.trackingNumber?.toLowerCase().includes(q);
                      const matchItem = ord.items?.some((i: any) => i.productName?.toLowerCase().includes(q));
                      if (!matchNum && !matchResi && !matchItem) return false;
                    }

                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 px-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                          <Package className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">
                            Tidak Ada Pesanan pada Kategori Ini
                          </h4>
                          <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                            {historySearchQuery
                              ? `Tidak ada pesanan yang sesuai dengan kata kunci "${historySearchQuery}".`
                              : "Belum ada riwayat pesanan dengan status yang dipilih saat ini."}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {filtered.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all space-y-3"
                        >
                          {/* Header Kartu Pesanan */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                                #{ord.orderNumber}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {new Date(ord.createdAt || Date.now()).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            {/* Badge Status */}
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                ord.status === "DELIVERED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : ord.status === "SHIPPED"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : ord.status === "PROCESSING"
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                  : ord.status === "PAID"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : ord.status === "RETURN"
                                  ? "bg-amber-50 text-amber-800 border border-amber-300"
                                  : ord.status === "CANCELLED"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {ord.status === "PAYMENT_PENDING" ? (
                                ord.paymentProof ? (
                                  <>
                                    <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Menunggu Verifikasi
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" /> Belum Bayar
                                  </>
                                )
                              ) : ord.status === "PAID" ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Pembayaran Diterima
                                </>
                              ) : ord.status === "PROCESSING" ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" /> Sedang Dikemas
                                </>
                              ) : ord.status === "SHIPPED" ? (
                                <>
                                  <Truck className="w-3.5 h-3.5 text-purple-600" /> Sedang Dikirim
                                </>
                              ) : ord.status === "DELIVERED" ? (
                                <>
                                  <PackageCheck className="w-3.5 h-3.5 text-emerald-600" /> Selesai
                                </>
                              ) : ord.status === "RETURN" ? (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" /> Pengembalian / Retur
                                </>
                              ) : (
                                <>
                                  <X className="w-3.5 h-3.5 text-rose-600" /> Dibatalkan
                                </>
                              )}
                            </span>
                          </div>

                          {/* Items Preview */}
                          <div className="space-y-2">
                            {ord.items?.slice(0, 2).map((it: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2.5">
                                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                    <Image
                                      src={it.image || "/service-cctv.png"}
                                      alt={it.productName || "Barang"}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 line-clamp-1">{it.productName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      {it.qty} Barang × {formatRupiah(it.price)}
                                    </div>
                                  </div>
                                </div>
                                <span className="font-bold font-mono text-slate-900 shrink-0">
                                  {formatRupiah((it.qty || 1) * (it.price || 0))}
                                </span>
                              </div>
                            ))}

                            {ord.items?.length > 2 && (
                              <div className="text-[11px] font-bold text-slate-400 pl-1">
                                + {ord.items.length - 2} produk lainnya...
                              </div>
                            )}
                          </div>

                          {/* Footer Kartu: Total & Tombol Aksi */}
                          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Total Belanja
                              </span>
                              <span className="text-base font-black font-mono text-dstech-blue">
                                {formatRupiah(ord.grandTotal)}
                              </span>
                              {ord.uniqueCode && (
                                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded block mt-0.5">
                                  Kode Unik: +{ord.uniqueCode}
                                </span>
                              )}
                              {ord.trackingNumber && (
                                <span className="text-[10px] font-mono text-slate-500 block">
                                  Resi: <strong>{ord.trackingNumber}</strong>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* Tombol Lacak / Detail */}
                              <button
                                onClick={() => {
                                  setTrackedOrder(ord);
                                  setTrackingQuery(ord.orderNumber);
                                }}
                                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                              >
                                <Search className="w-3 h-3" />
                                <span>Lacak Pengiriman</span>
                              </button>

                              {/* Tombol Bayar / Cek Status jika PAYMENT_PENDING */}
                              {ord.status === "PAYMENT_PENDING" && (
                                <button
                                  onClick={() => {
                                    setTrackedOrder(ord);
                                    setTrackingQuery(ord.orderNumber);
                                  }}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                                    ord.paymentProof
                                      ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                                      : "bg-amber-500 hover:bg-amber-600 text-white"
                                  }`}
                                >
                                  {ord.paymentProof ? (
                                    <>
                                      <Clock className="w-3 h-3 text-amber-700" />
                                      <span>Status Verifikasi</span>
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="w-3 h-3" />
                                      <span>Upload Bukti Bayar</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {/* Tombol Komplain Pesanan */}
                              <button
                                onClick={() => handleOpenComplaintModal(ord)}
                                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer"
                                title="Laporkan kendala / ajukan komplain pesanan"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>{ord.complaint ? "Cek Komplain" : "Komplain"}</span>
                              </button>

                              {/* Tombol Ajukan Retur jika DELIVERED */}
                              {ord.status === "DELIVERED" && (
                                <button
                                  onClick={() => handleOpenReturnModal(ord)}
                                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Ajukan Retur</span>
                                </button>
                              )}

                              {/* Tombol Beli Lagi */}
                              <button
                                onClick={() => handleBuyAgain(ord)}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer"
                                title="Beli barang ini lagi"
                              >
                                <ShoppingCart className="w-3 h-3 text-dstech-blue" />
                                <span>Beli Lagi</span>
                              </button>

                              {/* Chat CS WA */}
                              <a
                                href={`https://wa.me/6282259494242?text=${encodeURIComponent(
                                  `Halo CS DSTech Smart, saya ingin menanyakan pesanan saya #${ord.orderNumber}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center justify-center border border-emerald-200"
                                title="Chat CS WhatsApp"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: PENGAJUAN PENGEMBALIAN BARANG & DANA (RETUR / GARANSI) */}
      {/* ============================================================ */}
      {isReturnModalOpen && returnTargetOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsReturnModalOpen(false)}
        >
          <div
            className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Pengajuan Pengembalian / Retur</h3>
                  <p className="text-[11px] text-slate-400">Garansi resmi &amp; proteksi pembeli DSTech Smart</p>
                </div>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Singkat Pesanan */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Nomor Pesanan:</span>
                <span className="font-mono text-dstech-blue">#{returnTargetOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total Nilai Pesanan:</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(returnTargetOrder.grandTotal)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alasan Pengembalian / Komplain:
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-dstech-blue"
                >
                  <option value="Barang Rusak / Cacat Fisik">Barang Rusak / Cacat Fisik Saat Tiba</option>
                  <option value="Barang Tidak Sesuai Spesifikasi">Barang Tidak Sesuai Spesifikasi Pesanan</option>
                  <option value="Kelengkapan / Aksesoris Kurang">Kelengkapan / Aksesoris Barang Kurang</option>
                  <option value="Klaim Garansi Kerusakan Fungsi">Klaim Garansi Kerusakan Fungsi (Purnajual)</option>
                  <option value="Pengajuan Pengembalian Dana">Pengajuan Pengembalian Dana (Refund)</option>
                  <option value="Lainnya">Alasan Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rincian Penjelasan Kendala:
                </label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Jelaskan secara singkat kendala fisik / teknis barang yang dialami..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-dstech-blue resize-none"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <span className="font-black block">Ketentuan Garansi &amp; Retur:</span>
                <p className="leading-relaxed">
                  Tim QC kami akan menghubungi Anda melalui WhatsApp untuk verifikasi foto/video kendala barang serta panduan pengiriman balik unit.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer disabled:bg-slate-300"
                >
                  {isSubmittingReturn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Kirim Pengajuan Retur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 6: PUSAT BANTUAN & KOMPLAIN PESANAN PELANGGAN          */}
      {/* ============================================================ */}
      {isComplaintModalOpen && complaintTargetOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsComplaintModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Pusat Komplain &amp; Bantuan Pesanan</h3>
                  <p className="text-[11px] text-slate-400">Layanan after-sales resmi PT. DSTech Smart Perkasa</p>
                </div>
              </div>
              <button
                onClick={() => setIsComplaintModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Singkat Pesanan */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Nomor Pesanan:</span>
                <span className="font-mono text-dstech-blue">#{complaintTargetOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total Nilai Pesanan:</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(complaintTargetOrder.grandTotal)}</span>
              </div>
              {complaintTargetOrder.items && complaintTargetOrder.items.length > 0 && (
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  Produk: {complaintTargetOrder.items.map((it: any) => `${it.productName} (${it.qty}x)`).join(", ")}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kategori Kendala / Komplain:
                </label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-dstech-blue"
                >
                  <option value="Barang Rusak / Cacat Fisik">Barang Rusak / Cacat Fisik Saat Diterima</option>
                  <option value="Tipe / Varian Barang Salah">Tipe / Varian Barang Tidak Sesuai Pesanan</option>
                  <option value="Kelengkapan / Aksesoris Kurang">Kelengkapan / Aksesoris / Baut Kurang</option>
                  <option value="Keterlambatan Ekspedisi / Paket Nyasar">Keterlambatan Ekspedisi / Kendala Kurir</option>
                  <option value="Kerusakan Fungsi / Kendala Pemasangan">Kendala Fungsi / Butuh Bantuan Pemasangan Teknisi</option>
                  <option value="Klaim Garansi Purna Jual 1 Tahun">Klaim Garansi Resmi Purna Jual (1 Tahun)</option>
                  <option value="Permintaan Pengembalian Dana">Permintaan Pengembalian Dana (Refund)</option>
                  <option value="Komplain Lainnya">Komplain Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Solusi yang Anda Harapkan:
                </label>
                <select
                  value={complaintSolution}
                  onChange={(e) => setComplaintSolution(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-dstech-blue"
                >
                  <option value="Penggantian Unit Baru">Penggantian Unit Baru (Tukar Barang)</option>
                  <option value="Kirimkan Part / Aksesoris yang Kurang">Kirimkan Part / Aksesoris yang Kurang</option>
                  <option value="Kunjungan Teknisi Lapangan untuk Cek/Perbaikan">Kunjungan Teknisi Lapangan untuk Pengecekan</option>
                  <option value="Pengembalian Dana (Refund)">Pengembalian Dana (Refund Penuh/Sebagian)</option>
                  <option value="Bantuan Panduan Teknis & SOP">Bantuan Panduan Teknis &amp; SOP dari CS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rincian Penjelasan Kendala:
                </label>
                <textarea
                  rows={3}
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  placeholder="Ceritakan kendala yang Anda alami secara jelas..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-dstech-blue resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Unggah Foto Bukti Kendala (Opsional):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setComplaintProofBase64(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
                {complaintProofBase64 && (
                  <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img src={complaintProofBase64} alt="Bukti Komplain" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setComplaintProofBase64(null)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <span className="font-black block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Jaminan Layanan DSTech:
                </span>
                <p className="leading-relaxed">
                  Laporan komplain Anda langsung diprioritaskan ke supervisor CS &amp; After-Sales. Kami akan menghubungi nomor WhatsApp Anda dalam 1x24 jam kerja.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingComplaint}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/20 cursor-pointer disabled:bg-slate-300"
                >
                  {isSubmittingComplaint ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Kirim Komplain Pesanan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: DETAIL PRODUK LENGKAP (QUICK VIEW)                  */}
      {/* ============================================================ */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-[32px] sm:rounded-[40px] max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="relative h-72 sm:h-80 w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                  <Image
                    src={selectedProduct.image || "/service-cctv.png"}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-dstech-blue font-black text-xs uppercase tracking-wider shadow-md">
                      {selectedProduct.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Garansi Resmi 1 Tahun</span>
                  </div>
                  <span className="text-slate-400">100% Original</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dstech-red">
                    PRODUK RESMI DSTECH SMART
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 leading-snug">
                    {selectedProduct.name}
                  </h2>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Harga</span>
                    <span className="text-2xl sm:text-3xl font-black text-dstech-blue">
                      {formatRupiah(selectedProduct.price)}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                    Unit Resmi Bergaransi
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Deskripsi Produk</h4>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {selectedProduct.desc || "Perangkat teknologi resmi berkualitas prima dari PT. DSTech Smart Perkasa."}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(selectedProduct, 1);
                        setSelectedProduct(null);
                      }}
                      className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Tambah Keranjang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(selectedProduct, 1);
                        setSelectedProduct(null);
                        setIsCartOpen(true);
                      }}
                      className="flex-1 py-3.5 rounded-2xl bg-dstech-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition cursor-pointer"
                    >
                      <span>Beli Sekarang</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
