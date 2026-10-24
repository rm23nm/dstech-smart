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
  Upload,
  Check,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Navigation,
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

  // Pelacakan Pesanan (Order Tracking)
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState("");
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [uploadProofLoading, setUploadProofLoading] = useState(false);
  const [proofFileBase64, setProofFileBase64] = useState<string | null>(null);

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

  const fetchUserOrders = async (user: AuthUser) => {
    try {
      const queryParam = user.id ? `userId=${encodeURIComponent(user.id)}` : `email=${encodeURIComponent(user.email)}`;
      const res = await fetch(`/api/orders?${queryParam}&t=${Date.now()}`);
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
  const grandTotal = cartSubtotal + selectedCourier.cost + installationFee;

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
        // Kosongkan keranjang
        setCart([]);
        setIsCartOpen(false);
        setIsCheckoutStep(false);

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
            <button
              onClick={() => {
                setIsTrackingModalOpen(true);
                if (userOrders.length > 0 && !trackedOrder) {
                  setTrackedOrder(userOrders[0]);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-dstech-blue" />
              <span className="hidden sm:inline">Lacak Pengiriman</span>
              {userOrders.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-dstech-blue text-white text-[10px] font-bold flex items-center justify-center">
                  {userOrders.length}
                </span>
              )}
            </button>

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
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1.5">
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
      {/* MODAL 3: PELACAKAN PENGIRIMAN & STATUS PESANAN REAL-TIME     */}
      {/* ============================================================ */}
      {isTrackingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsTrackingModalOpen(false)}
        >
          <div
            className="bg-white rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal Tracking */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Pelacakan Pesanan &amp; Pengiriman</h3>
                  <p className="text-xs text-slate-500">Sistem pelacakan real-time logistik PT DSTech Smart Perkasa</p>
                </div>
              </div>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pencarian Manual No Pesanan / Resi */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik Nomor Pesanan (ORD/DST/...) atau Nomor Resi..."
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTrackOrder();
                }}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
              />
              <button
                onClick={() => handleTrackOrder()}
                disabled={isTrackingLoading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isTrackingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Lacak</span>
              </button>
            </div>

            {/* Riwayat Pesanan Akun Pengguna (Jika Ada) */}
            {userOrders.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Pesanan Aktif Akun Anda ({userOrders.length}):
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {userOrders.map((ord) => (
                    <button
                      key={ord.id}
                      onClick={() => {
                        setTrackedOrder(ord);
                        setTrackingQuery(ord.orderNumber);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
                        trackedOrder?.id === ord.id
                          ? "bg-dstech-blue text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {ord.orderNumber} ({formatRupiah(ord.grandTotal)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {trackingError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{trackingError}</span>
              </div>
            )}

            {/* Hasil Pelacakan Detail */}
            {trackedOrder && (
              <div className="space-y-5">
                {/* Info Card Pesanan */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[9.5px] font-mono text-slate-400 block">NOMOR PESANAN RESMI</span>
                      <span className="text-base font-black font-mono text-amber-400">{trackedOrder.orderNumber}</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        trackedOrder.status === "DELIVERED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : trackedOrder.status === "SHIPPED"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : trackedOrder.status === "PROCESSING"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : trackedOrder.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {trackedOrder.status === "PAYMENT_PENDING"
                        ? "Menunggu Pembayaran"
                        : trackedOrder.status === "PAID"
                        ? "Pembayaran Dikonfirmasi"
                        : trackedOrder.status === "PROCESSING"
                        ? "Sedang Dikemas"
                        : trackedOrder.status === "SHIPPED"
                        ? "Sedang Dikirim"
                        : trackedOrder.status === "DELIVERED"
                        ? "Pesanan Selesai"
                        : "Dibatalkan"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Pemesan</span>
                      <span className="font-bold">{trackedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Total Belanja</span>
                      <span className="font-bold font-mono text-emerald-400">{formatRupiah(trackedOrder.grandTotal)}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-slate-400 text-[10px] block">Kurir / Ekspedisi</span>
                      <span className="font-bold">{trackedOrder.shippingCourier || "Armada DSTech"}</span>
                    </div>
                  </div>

                  {trackedOrder.trackingNumber && (
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">No. Resi Pengiriman:</span>
                      <span className="font-black text-amber-300">{trackedOrder.trackingNumber}</span>
                    </div>
                  )}
                </div>

                {/* Upload Bukti Transfer jika masih Menunggu Pembayaran */}
                {trackedOrder.status === "PAYMENT_PENDING" && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-amber-900">Menunggu Pembayaran Transfer Bank</h4>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Silakan transfer tepat sebesar <strong>{formatRupiah(trackedOrder.grandTotal)}</strong> ke rekening
                          tujuan: <strong>{trackedOrder.paymentBank || "BCA 1234567890 a.n PT DSTech Smart Perkasa"}</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => handleUploadProof(trackedOrder.id)}
                        disabled={uploadProofLoading || !proofFileBase64}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {uploadProofLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Kirim Bukti Transfer</span>
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

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
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

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <a
                    href={`https://wa.me/6282259494242?text=${encodeURIComponent(
                      `Halo CS DSTech Smart, saya ingin menanyakan status pesanan saya dengan nomor: ${trackedOrder.orderNumber}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hubungi CS via WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
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
