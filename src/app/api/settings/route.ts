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

const DEFAULT_SETTINGS = {
  companyName: "PT. DSTech Smart Perkasa",
  tagline: "Solusi Security System, Smart Automation & IT Infrastructure Handal",
  nib: "0123456789012",
  npwp: "01.234.567.8-417.000",
  whatsapp: "6282259494242",
  whatsappDisplay: "+62 822-5949-4242",
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
  updatedAt: "2026-10-18T22:00:00.000Z"
};

function readSettings(): any {
  try {
    let settings = DEFAULT_SETTINGS;
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
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
      updatedAt: new Date().toISOString(),
    };

    const saved = writeSettings(updated);
    if (!saved) {
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan ke file data store." },
        { status: 500 }
      );
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
