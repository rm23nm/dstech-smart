import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ASSETS_FILE = path.join(process.cwd(), "src", "data", "dstech_assets.json");

export interface CorporateAsset {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  brand?: string;
  serialNumber?: string;
  acquisitionDate: string; // YYYY-MM-DD
  purchasePrice: number;
  economicLifeYears: number;
  salvageValue: number;
  currentBookValue: number;
  depreciationMethod: string;
  picId?: string;
  picName: string;
  locationId?: string;
  locationName: string;
  condition: "Baik" | "Rusak Ringan" | "Rusak Berat" | "Dalam Servis" | string;
  photoUrl?: string;
  notes?: string;
  mutationHistory?: {
    id: string;
    date: string;
    fromLocation?: string;
    toLocation: string;
    fromPic?: string;
    toPic: string;
    notes?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_ASSETS: CorporateAsset[] = [
  {
    id: "dstech_asset_1",
    assetCode: "AST-DSP-2024-001",
    name: "Fusion Splicer Fiber Optic & OTDR Kit",
    category: "Alat Uji & Fiber Optic",
    brand: "Fujikura / Comway",
    serialNumber: "FS-CW-98214A",
    acquisitionDate: "2024-02-15",
    purchasePrice: 28500000,
    economicLifeYears: 5,
    salvageValue: 3500000,
    currentBookValue: 18500000,
    depreciationMethod: "Garis Lurus",
    picName: "Budi Santoso (Lead Engineer)",
    locationName: "Gudang Utama Cilegon",
    condition: "Baik",
    photoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    notes: "Digunakan untuk penyambungan kabel fiber optic proyek kawasan industri.",
  },
  {
    id: "dstech_asset_2",
    assetCode: "AST-DSP-2024-002",
    name: "Armada Operasional Lapangan - Daihatsu Gran Max Blind Van",
    category: "Kendaraan Operasional",
    brand: "Daihatsu",
    serialNumber: "A 8421 DS",
    acquisitionDate: "2024-05-10",
    purchasePrice: 165000000,
    economicLifeYears: 8,
    salvageValue: 45000000,
    currentBookValue: 135000000,
    depreciationMethod: "Garis Lurus",
    picName: "Ahmad Dani (Driver Logistik)",
    locationName: "Gudang Utama Cilegon",
    condition: "Baik",
    photoUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80",
    notes: "Kendaraan mobilisasi material proyek barrier gate dan CCTV Banten.",
  },
  {
    id: "dstech_asset_3",
    assetCode: "AST-DSP-2025-003",
    name: "Mesin Bor Rotary Hammer SDS-Plus",
    category: "Peralatan Kerja Teknisi",
    brand: "Bosch Professional",
    serialNumber: "GBH-2-28-DFV",
    acquisitionDate: "2025-01-20",
    purchasePrice: 3850000,
    economicLifeYears: 4,
    salvageValue: 500000,
    currentBookValue: 2500000,
    depreciationMethod: "Garis Lurus",
    picName: "Rizky Pratama (Teknisi Senior)",
    locationName: "Gudang Cabang Serang",
    condition: "Baik",
    photoUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80",
    notes: "Peralatan bor beton tiang barrier gate dan camera bracket.",
  },
  {
    id: "dstech_asset_4",
    assetCode: "AST-DSP-2025-004",
    name: "Tangga Teleskopik Heavy Duty 5.4 Meter",
    category: "Peralatan Kerja Teknisi",
    brand: "Krisbow",
    serialNumber: "TL-54-HD",
    acquisitionDate: "2025-03-12",
    purchasePrice: 2750000,
    economicLifeYears: 4,
    salvageValue: 350000,
    currentBookValue: 1850000,
    depreciationMethod: "Garis Lurus",
    picName: "Fajar Nugraha (Teknisi Lapangan)",
    locationName: "Unit Reaksi Cepat Mobile",
    condition: "Baik",
    photoUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
    notes: "Tangga lipat aluminium instalasi CCTV outdoor tiang jalan.",
  },
  {
    id: "dstech_asset_5",
    assetCode: "AST-DSP-2025-005",
    name: "Laptop Setting & Commissioning CCTV ThinkPad L14",
    category: "Perangkat IT & Server",
    brand: "Lenovo",
    serialNumber: "TP-L14-GEN4-0992",
    acquisitionDate: "2025-06-18",
    purchasePrice: 14200000,
    economicLifeYears: 4,
    salvageValue: 2500000,
    currentBookValue: 10500000,
    depreciationMethod: "Garis Lurus",
    picName: "Budi Santoso (Lead Engineer)",
    locationName: "Gudang Utama Cilegon",
    condition: "Baik",
    photoUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    notes: "Laptop konfigurasi IP Camera Hikvision, Dahua, dan Barrier Gate Controller.",
  },
];

function readAssets(): CorporateAsset[] {
  try {
    if (!fs.existsSync(ASSETS_FILE)) {
      writeAssets(DEFAULT_ASSETS);
      return DEFAULT_ASSETS;
    }
    const raw = fs.readFileSync(ASSETS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      writeAssets(DEFAULT_ASSETS);
      return DEFAULT_ASSETS;
    }
    return parsed as CorporateAsset[];
  } catch (err) {
    console.error("Error reading dstech_assets.json:", err);
    return DEFAULT_ASSETS;
  }
}

function writeAssets(data: CorporateAsset[]) {
  try {
    fs.writeFileSync(ASSETS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing dstech_assets.json:", err);
  }
}

// Hitung nilai buku dan akumulasi penyusutan metode garis lurus
function computeBookValue(asset: Partial<CorporateAsset>): number {
  const price = Number(asset.purchasePrice) || 0;
  const salvage = Number(asset.salvageValue) || 0;
  const years = Number(asset.economicLifeYears) || 5;
  if (!asset.acquisitionDate || years <= 0) return price;

  const acqDate = new Date(asset.acquisitionDate);
  const now = new Date();
  if (isNaN(acqDate.getTime())) return price;

  // Selisih bulan penggunaan
  const totalMonthsUsed = Math.max(
    0,
    (now.getFullYear() - acqDate.getFullYear()) * 12 + (now.getMonth() - acqDate.getMonth())
  );
  const totalUsefulMonths = years * 12;

  const depreciableAmount = Math.max(0, price - salvage);
  const monthlyDepreciation = depreciableAmount / totalUsefulMonths;

  const accumulatedDepreciation = Math.min(depreciableAmount, monthlyDepreciation * totalMonthsUsed);
  return Math.max(salvage, Math.round(price - accumulatedDepreciation));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const location = searchParams.get("location");

    let assets = readAssets();

    // Auto-update nilai buku terbaru saat dibaca
    assets = assets.map((a) => ({
      ...a,
      currentBookValue: computeBookValue(a),
    }));

    if (search) {
      assets = assets.filter(
        (a) =>
          a.name.toLowerCase().includes(search) ||
          a.assetCode.toLowerCase().includes(search) ||
          (a.brand || "").toLowerCase().includes(search) ||
          (a.serialNumber || "").toLowerCase().includes(search) ||
          a.picName.toLowerCase().includes(search)
      );
    }

    if (category && category !== "ALL") {
      assets = assets.filter((a) => a.category === category);
    }

    if (condition && condition !== "ALL") {
      assets = assets.filter((a) => a.condition === condition);
    }

    if (location && location !== "ALL") {
      assets = assets.filter((a) => a.locationName === location || a.locationId === location);
    }

    // Statistik Ringkasan Aset
    const totalAssets = assets.length;
    const totalAcquisitionCost = assets.reduce((sum, a) => sum + (Number(a.purchasePrice) || 0), 0);
    const totalBookValue = assets.reduce((sum, a) => sum + (Number(a.currentBookValue) || 0), 0);
    const totalDepreciation = Math.max(0, totalAcquisitionCost - totalBookValue);

    return NextResponse.json({
      success: true,
      data: assets,
      summary: {
        totalAssets,
        totalAcquisitionCost,
        totalBookValue,
        totalDepreciation,
      },
    });
  } catch (err) {
    console.error("GET /api/assets error:", err);
    return NextResponse.json({ success: false, error: "Gagal memuat data aset perusahaan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const assets = readAssets();

    const now = new Date();
    const newId = `dstech_asset_${Date.now()}`;
    const autoCode =
      body.assetCode || `AST-DSP-${now.getFullYear()}-${String(assets.length + 1).padStart(3, "0")}`;

    const newAsset: CorporateAsset = {
      id: newId,
      assetCode: autoCode,
      name: body.name || "Aset Perusahaan Baru",
      category: body.category || "Peralatan Kerja Teknisi",
      brand: body.brand || "-",
      serialNumber: body.serialNumber || "-",
      acquisitionDate: body.acquisitionDate || now.toISOString().split("T")[0],
      purchasePrice: Number(body.purchasePrice) || 0,
      economicLifeYears: Number(body.economicLifeYears) || 5,
      salvageValue: Number(body.salvageValue) || 0,
      currentBookValue: 0,
      depreciationMethod: body.depreciationMethod || "Garis Lurus",
      picId: body.picId || "",
      picName: body.picName || "Admin Logistik DSTech",
      locationId: body.locationId || "dstech_wh_1",
      locationName: body.locationName || "Gudang Utama Cilegon",
      condition: body.condition || "Baik",
      photoUrl: body.photoUrl || "",
      notes: body.notes || "",
      mutationHistory: [
        {
          id: `mut_${Date.now()}`,
          date: now.toISOString().split("T")[0],
          toLocation: body.locationName || "Gudang Utama Cilegon",
          toPic: body.picName || "Admin Logistik DSTech",
          notes: "Pendaftaran aset awal ke sistem inventaris.",
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    newAsset.currentBookValue = computeBookValue(newAsset);

    assets.unshift(newAsset);
    writeAssets(assets);

    return NextResponse.json({
      success: true,
      message: `Aset ${newAsset.name} (${newAsset.assetCode}) berhasil ditambahkan`,
      data: newAsset,
    });
  } catch (err) {
    console.error("POST /api/assets error:", err);
    return NextResponse.json({ success: false, error: "Gagal menambahkan aset baru" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, actionType } = body;
    const updates = body.updates || body.payload || body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID aset wajib disertakan" }, { status: 400 });
    }

    const assets = readAssets();
    const idx = assets.findIndex((a) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Aset tidak ditemukan" }, { status: 404 });
    }

    const target = assets[idx];

    // Opsi mutasi lokasi / PIC
    if (actionType === "mutate") {
      const mutationEntry = {
        id: `mut_${Date.now()}`,
        date: updates.date || new Date().toISOString().split("T")[0],
        fromLocation: target.locationName,
        toLocation: updates.toLocation || target.locationName,
        fromPic: target.picName,
        toPic: updates.toPic || target.picName,
        notes: updates.notes || "Mutasi operasional lapangan.",
      };

      target.locationName = updates.toLocation || target.locationName;
      target.picName = updates.toPic || target.picName;
      target.locationId = updates.locationId || target.locationId;
      target.picId = updates.picId || target.picId;
      target.condition = updates.condition || target.condition;
      target.updatedAt = new Date().toISOString();
      if (!target.mutationHistory) target.mutationHistory = [];
      target.mutationHistory.unshift(mutationEntry);
    } else {
      // General update
      Object.assign(target, updates, {
        updatedAt: new Date().toISOString(),
      });
      target.currentBookValue = computeBookValue(target);
    }

    assets[idx] = target;
    writeAssets(assets);

    return NextResponse.json({
      success: true,
      message: `Data aset ${target.name} berhasil diperbarui`,
      data: target,
    });
  } catch (err) {
    console.error("PUT /api/assets error:", err);
    return NextResponse.json({ success: false, error: "Gagal memperbarui aset" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID aset wajib disertakan" }, { status: 400 });
    }

    let assets = readAssets();
    const initialLen = assets.length;
    assets = assets.filter((a) => a.id !== id);

    if (assets.length === initialLen) {
      return NextResponse.json({ success: false, error: "Aset tidak ditemukan" }, { status: 404 });
    }

    writeAssets(assets);
    return NextResponse.json({
      success: true,
      message: "Aset berhasil dihapus dari sistem",
    });
  } catch (err) {
    console.error("DELETE /api/assets error:", err);
    return NextResponse.json({ success: false, error: "Gagal menghapus aset" }, { status: 500 });
  }
}
