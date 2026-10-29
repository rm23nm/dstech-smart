import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_settings.json");
const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");

const DEFAULT_BANK_ACCOUNTS = [
  {
    id: "dstech_bank_2",
    bankName: "Bank BCA",
    accountNumber: "295-074-0321",
    accountHolder: "PT. DSTech Smart Perkasa",
    branch: "KCU Cilegon",
    isDefault: true,
    status: "Aktif",
    entityType: "PT"
  }
];

const DEFAULT_LETTERHEAD_SETTINGS = {
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

  // Non-PT
  letterheadUrl_NON_PT: "",
  letterheadEnabled_NON_PT: false,
  watermarkOpacity_NON_PT: 0.15,
  letterheadPaddingTop_NON_PT: 80,
  letterheadPaddingBottom_NON_PT: 75,
  signerName_NON_PT: "RAMADHANI ST",
  signerTitle_NON_PT: "Owner / Pengelola Usaha"
};

const DEFAULT_ESTORE_SETTINGS = {
  heroTitle: "Katalog Produk Pilihan",
  heroTitleHighlight: "DSTech Smart",
  heroSubtitle: "Featured Showcase • Produk Unggulan & Promo Resmi",
  heroBackgroundMode: "gradient", // "gradient" | "dark" | "navy" | "image"
  heroBackgroundImage: "",
  heroGlowPrimary: "blue", // "blue" | "emerald" | "amber" | "purple" | "red"
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
      features: ["Motor Servo 1.8 Detik", "Durabilitas 5 Juta Siklus", "Sensor Loop & Anti-Bentur", "Kompatibel Tiket / Kartu"],
      installationFee: 500000,
      isActive: true,
    }
  ]
};

const DEFAULT_SETTINGS = {
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
  bankAccounts: DEFAULT_BANK_ACCOUNTS,
  letterheadSettings: DEFAULT_LETTERHEAD_SETTINGS,
  estoreSettings: DEFAULT_ESTORE_SETTINGS,

  // Titik GPS Kantor & Geofencing Presensi Pegawai
  officeName: "Kantor Pusat PT DSTech Smart Perkasa (Cilegon)",
  officeLatitude: -6.031846,
  officeLongitude: 106.037198,
  officeAddress: "PERUM BUKIT CILEGON ASRI BLOK DB NO. 19, KEL. BAGENDUNG, KEC. CILEGON, KOTA CILEGON - BANTEN",
  geofenceRadiusMeters: 250,
  allowFlexibleAttendance: true,
  projectLocations: [
    {
      id: "dstech_loc_cilegon_hq",
      name: "Kantor Pusat DSTech (Perum BCA)",
      clientName: "PT. DSTech Smart Perkasa",
      latitude: -6.031846,
      longitude: 106.037198,
      radiusMeters: 250,
      isDefaultOffice: true,
      notes: "Kantor Operasional & Workshop"
    },
    {
      id: "dstech_loc_krakatau",
      name: "Proyek Kawasan Industri Krakatau Steel",
      clientName: "PT Krakatau Steel Tbk",
      latitude: -6.0125,
      longitude: 106.015,
      radiusMeters: 500,
      isDefaultOffice: false,
      notes: "Area Proyek Pabrik Baja & Pipa"
    }
  ],
  updatedAt: "2026-10-18T22:00:00.000Z"
};

function readSettings(): any {
  try {
    let settings = DEFAULT_SETTINGS;
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      // Pastikan nested estoreSettings terisi lengkap
      settings.estoreSettings = {
        ...DEFAULT_ESTORE_SETTINGS,
        ...(settings.estoreSettings || {}),
        featuredHeroes: Array.isArray(settings.estoreSettings?.featuredHeroes) && settings.estoreSettings.featuredHeroes.length > 0
          ? settings.estoreSettings.featuredHeroes
          : DEFAULT_ESTORE_SETTINGS.featuredHeroes,
      };
    } else {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
    }

    // Sinkronkan data awal dari dstech_finance_erp.json jika belum ada di settings
    if (fs.existsSync(FINANCE_FILE)) {
      try {
        const financeData = JSON.parse(fs.readFileSync(FINANCE_FILE, "utf-8"));
        if (!settings.bankAccounts || settings.bankAccounts.length === 0) {
          if (financeData.bank_accounts && financeData.bank_accounts.length > 0) {
            settings.bankAccounts = financeData.bank_accounts;
          }
        }
        if (!settings.letterheadSettings || !settings.letterheadSettings.letterheadUrl) {
          if (financeData.settings) {
            settings.letterheadSettings = {
              ...DEFAULT_LETTERHEAD_SETTINGS,
              ...financeData.settings,
            };
          }
        }
      } catch (e) {
        console.error("Gagal membaca initial finance file:", e);
      }
    }

    return settings;
  } catch (err) {
    console.error("Error reading dstech_settings.json:", err);
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(settings: any): boolean {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(settings, null, 2), "utf-8");

    // Sinkronkan bankAccounts dan letterheadSettings ke dstech_finance_erp.json
    if (fs.existsSync(FINANCE_FILE)) {
      try {
        const financeData = JSON.parse(fs.readFileSync(FINANCE_FILE, "utf-8"));
        let changed = false;
        if (settings.bankAccounts) {
          financeData.bank_accounts = settings.bankAccounts;
          changed = true;
        }
        if (settings.letterheadSettings) {
          financeData.settings = {
            ...(financeData.settings || {}),
            ...settings.letterheadSettings,
          };
          changed = true;
        }
        if (changed) {
          fs.writeFileSync(FINANCE_FILE, JSON.stringify(financeData, null, 2), "utf-8");
        }
      } catch (fErr) {
        console.error("Gagal sinkronisasi ke finance file:", fErr);
      }
    }

    return true;
  } catch (err) {
    console.error("Error writing dstech_settings.json:", err);
    return false;
  }
}

export async function GET() {
  try {
    const settings = readSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memuat pengaturan situs.", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = readSettings();

    const updated = {
      ...current,
      companyName: body.companyName !== undefined ? body.companyName : current.companyName,
      tagline: body.tagline !== undefined ? body.tagline : current.tagline,
      nib: body.nib !== undefined ? body.nib : current.nib,
      npwp: body.npwp !== undefined ? body.npwp : current.npwp,
      whatsapp: body.whatsapp !== undefined ? body.whatsapp : current.whatsapp,
      whatsappDisplay: body.whatsappDisplay !== undefined ? body.whatsappDisplay : current.whatsappDisplay,
      email: body.email !== undefined ? body.email : current.email,
      emailSupport: body.emailSupport !== undefined ? body.emailSupport : current.emailSupport,
      phone: body.phone !== undefined ? body.phone : current.phone,
      address: body.address !== undefined ? body.address : current.address,
      googleMapsUrl: body.googleMapsUrl !== undefined ? body.googleMapsUrl : current.googleMapsUrl,
      instagram: body.instagram !== undefined ? body.instagram : current.instagram,
      facebook: body.facebook !== undefined ? body.facebook : current.facebook,
      linkedin: body.linkedin !== undefined ? body.linkedin : current.linkedin,
      logoUrl: body.logoUrl !== undefined ? body.logoUrl : (current.logoUrl || "/logo.png"),
      logoWhiteUrl: body.logoWhiteUrl !== undefined ? body.logoWhiteUrl : (current.logoWhiteUrl || "/logo.png"),
      faviconUrl: body.faviconUrl !== undefined ? body.faviconUrl : (current.faviconUrl || "/logo.png"),
      logoHeight: body.logoHeight !== undefined ? Number(body.logoHeight) : (current.logoHeight || 40),
      bankAccounts: body.bankAccounts !== undefined ? body.bankAccounts : current.bankAccounts,
      letterheadSettings: body.letterheadSettings !== undefined ? body.letterheadSettings : current.letterheadSettings,
      estoreSettings: body.estoreSettings !== undefined ? body.estoreSettings : current.estoreSettings,

      // Titik GPS Kantor & Geofencing Presensi Pegawai
      officeName: body.officeName !== undefined ? body.officeName : (current.officeName || "Kantor Pusat PT DSTech Smart Perkasa (Cilegon)"),
      officeLatitude: body.officeLatitude !== undefined ? Number(body.officeLatitude) : (current.officeLatitude ?? -6.031846),
      officeLongitude: body.officeLongitude !== undefined ? Number(body.officeLongitude) : (current.officeLongitude ?? 106.037198),
      officeAddress: body.officeAddress !== undefined ? body.officeAddress : (current.officeAddress || current.address || ""),
      geofenceRadiusMeters: body.geofenceRadiusMeters !== undefined ? Number(body.geofenceRadiusMeters) : (current.geofenceRadiusMeters || 250),
      allowFlexibleAttendance: body.allowFlexibleAttendance !== undefined ? Boolean(body.allowFlexibleAttendance) : (current.allowFlexibleAttendance ?? true),
      projectLocations: Array.isArray(body.projectLocations) ? body.projectLocations : (current.projectLocations || []),

      updatedAt: new Date().toISOString(),
    };

    const saved = writeSettings(updated);
    if (!saved) {
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan ke file data store." },
        { status: 500 }
      );
    }

    // Sinkronkan pengaturan penandatangan resmi ke dstech_finance_erp.json (Tugas 283)
    if (updated.letterheadSettings && fs.existsSync(FINANCE_FILE)) {
      try {
        const rawFinance = fs.readFileSync(FINANCE_FILE, "utf-8");
        const financeData = JSON.parse(rawFinance);
        if (!financeData.settings) financeData.settings = {};
        const lh = updated.letterheadSettings;
        financeData.settings = {
          ...financeData.settings,
          signerName: lh.signerName || lh.signerName_PT || "RAMADHANI ST",
          signerTitle: lh.signerTitle || lh.signerTitle_PT || "Direktur",
          masterSignatureUrl: lh.masterSignatureUrl !== undefined ? lh.masterSignatureUrl : (financeData.settings.masterSignatureUrl || ""),
          masterStampUrl: lh.masterStampUrl !== undefined ? lh.masterStampUrl : (financeData.settings.masterStampUrl || ""),
          letterheadUrl: lh.letterheadUrl || financeData.settings.letterheadUrl || "/kop_surat_dstech.jpg",
          letterheadEnabled: lh.letterheadEnabled !== undefined ? lh.letterheadEnabled : true,
          watermarkOpacity: lh.watermarkOpacity !== undefined ? lh.watermarkOpacity : 0.15,
          letterheadPaddingTop: lh.letterheadPaddingTop || 80,
          letterheadPaddingBottom: lh.letterheadPaddingBottom || 75,
          letterheadFitMode: lh.letterheadFitMode || "fill",
        };
        fs.writeFileSync(FINANCE_FILE, JSON.stringify(financeData, null, 2), "utf-8");
      } catch (errSyncFin) {
        console.error("Gagal sinkronkan pengaturan penandatangan ke finance ERP:", errSyncFin);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan situs berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server.", error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
