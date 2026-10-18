import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_settings.json");

const DEFAULT_SETTINGS = {
  companyName: "PT. DSTech Smart Perkasa",
  tagline: "Solusi Security System, Smart Automation & IT Infrastructure Handal",
  nib: "0123456789012",
  npwp: "01.234.567.8-417.000",
  whatsapp: "6285183134887",
  whatsappDisplay: "+62 851-8313-4887",
  email: "contact@dstechsmart.com",
  emailSupport: "support@dstechsmart.com",
  phone: "0254-123456",
  address: "Jl. Ahmad Yani No. 88, Cilegon, Banten 42411",
  googleMapsUrl: "https://maps.google.com/?q=Cilegon+Banten",
  instagram: "https://instagram.com/dstechsmart",
  facebook: "https://facebook.com/dstechsmart",
  linkedin: "https://linkedin.com/company/dstechsmart",
  updatedAt: "2026-03-18T10:00:00.000Z"
};

function readSettings(): any {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
    return DEFAULT_SETTINGS;
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
