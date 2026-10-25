import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_products.json");

const DEFAULT_PRODUCTS = [
  {
    id: "dstech_prod_1",
    name: "Smart Doorlock X-100",
    category: "Smart Home",
    price: 1850000,
    installationFee: 250000,
    hasInstallationService: true,
    stock: 24,
    commission: "15%",
    commissionRate: 15,
    commissionType: "ONETIME",
    image: "/portfolio-residential.png",
    desc: "Smart Doorlock dengan Fingerprint, RFID, PIN, & Bluetooth App Control untuk hunian dan perkantoran.",
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z"
  },
  {
    id: "dstech_prod_2",
    name: "CCTV Hikvision 4CH HD",
    category: "Security",
    price: 3500000,
    installationFee: 350000,
    hasInstallationService: true,
    stock: 12,
    commission: "10%",
    commissionRate: 10,
    commissionType: "ONETIME",
    image: "/service-cctv.png",
    desc: "Paket CCTV 4 Channel Resolusi HD lengkap dengan DVR, HDD 1TB, dan kabel coaxial 50 meter.",
    createdAt: "2026-01-20T09:30:00.000Z",
    updatedAt: "2026-01-20T09:30:00.000Z"
  },
  {
    id: "dstech_prod_3",
    name: "Fingerprint ZKTeco Attendance",
    category: "Security",
    price: 1200000,
    installationFee: 150000,
    hasInstallationService: true,
    stock: 45,
    commission: "10%",
    commissionRate: 10,
    commissionType: "ONETIME",
    image: "/about-image.png",
    desc: "Mesin absensi sidik jari & RFID berkapasitas 1000 user dengan rekapitulasi laporan Excel otomatis.",
    createdAt: "2026-02-01T11:00:00.000Z",
    updatedAt: "2026-02-01T11:00:00.000Z"
  },
  {
    id: "dstech_prod_4",
    name: "Running Text LED Red Outdoor",
    category: "Visual",
    price: 2500000,
    installationFee: 300000,
    hasInstallationService: true,
    stock: 8,
    commission: "15%",
    commissionRate: 15,
    commissionType: "ONETIME",
    image: "/service-it.png",
    desc: "Display LED Running Text outdoor tahan cuaca, setting teks mudah via WiFi smartphone.",
    createdAt: "2026-02-10T14:15:00.000Z",
    updatedAt: "2026-02-10T14:15:00.000Z"
  },
  {
    id: "dstech_prod_5",
    name: "Barrier Gate System Otomatis",
    category: "Parking",
    price: 8500000,
    installationFee: 1500000,
    hasInstallationService: true,
    stock: 5,
    commission: "10%",
    commissionRate: 10,
    commissionType: "ONETIME",
    image: "/portfolio-industrial.png",
    desc: "Palang parkir otomatis dengan loop detector, remote kontrol nirkabel, dan integrasi reader RFID.",
    createdAt: "2026-02-25T10:00:00.000Z",
    updatedAt: "2026-02-25T10:00:00.000Z"
  },
  {
    id: "dstech_prod_6",
    name: "Paket Website Bisnis & E-Store",
    category: "Software",
    price: 2500000,
    installationFee: 0,
    hasInstallationService: false,
    stock: 99,
    commission: "20%",
    commissionRate: 20,
    commissionType: "RECURRING",
    image: "/service-it.png",
    desc: "Pembuatan website profil perusahaan & toko online modern terintegrasi domain .com dan hosting 1 tahun.",
    createdAt: "2026-03-05T13:20:00.000Z",
    updatedAt: "2026-03-05T13:20:00.000Z"
  }
];

function getCategoryDefaultInstallationFee(category: string, name: string): number {
  const cat = (category || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (n.includes("barrier gate") || cat.includes("parking")) return 1500000;
  if (n.includes("cctv") || cat.includes("security")) return 150000;
  if (n.includes("doorlock") || cat.includes("smart home")) return 250000;
  if (n.includes("running text") || cat.includes("visual")) return 300000;
  if (n.includes("fingerprint") || n.includes("absensi")) return 150000;
  if (cat.includes("software") || cat.includes("web")) return 0;
  return 100000;
}

function readProducts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const dataDir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), "utf-8");
      return DEFAULT_PRODUCTS;
    }
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return DEFAULT_PRODUCTS;

    // Normalisasi field installationFee dan hasInstallationService
    return parsed.map((p: any) => ({
      ...p,
      installationFee: typeof p.installationFee === "number"
        ? p.installationFee
        : getCategoryDefaultInstallationFee(p.category, p.name),
      hasInstallationService: p.hasInstallationService !== undefined
        ? Boolean(p.hasInstallationService)
        : (p.category?.toLowerCase().includes("software") ? false : true),
    }));
  } catch (err) {
    console.error("Error reading products data:", err);
    return DEFAULT_PRODUCTS;
  }
}

function writeProducts(products: unknown[]) {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing products data:", err);
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity"); // 'PT' | 'NON_PT' | 'ALL' | null
  const isPublic = searchParams.get("public") === "true";

  let products = readProducts();

  // Aturan Ketat: Untuk website publik atau query entity=PT, HANYA tampilkan PT!
  if (isPublic || entity === "PT") {
    products = products.filter((p: { entityType?: string }) => (p.entityType || "PT") === "PT");
  } else if (entity === "NON_PT") {
    products = products.filter((p: { entityType?: string }) => p.entityType === "NON_PT");
  }

  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, subCategory, price, stock, commission, commissionType, desc, image, entityType } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ success: false, message: "Nama produk wajib diisi" }, { status: 400 });
    }

    const products = readProducts();
    const parsedPrice = typeof price === "number" ? price : parseFloat(price) || 0;
    const parsedStock = typeof stock === "number" ? stock : parseInt(stock, 10) || 0;
    const commRate = typeof commission === "number" ? commission : parseInt(String(commission).replace(/[^0-9]/g, ""), 10) || 10;
    const parsedInstallationFee = body.installationFee !== undefined
      ? (typeof body.installationFee === "number" ? body.installationFee : parseFloat(body.installationFee) || 0)
      : getCategoryDefaultInstallationFee(category, name);
    const parsedHasInstallation = body.hasInstallationService !== undefined
      ? Boolean(body.hasInstallationService)
      : (category?.toLowerCase().includes("software") ? false : true);

    const newProduct = {
      id: `dstech_prod_${Date.now()}`,
      name: name.trim(),
      category: category?.trim() || "Security System",
      subCategory: subCategory?.trim() || "",
      entityType: entityType === "NON_PT" ? "NON_PT" : "PT",
      price: parsedPrice,
      installationFee: parsedInstallationFee,
      hasInstallationService: parsedHasInstallation,
      stock: parsedStock,
      unit: body.unit?.trim() || "Unit",
      warehouseStock: body.warehouseStock || {
        dstech_wh_1: parsedStock,
        dstech_wh_2: 0,
        dstech_wh_3: 0,
      },
      commission: `${commRate}%`,
      commissionRate: commRate,
      commissionType: commissionType === "RECURRING" ? "RECURRING" : "ONETIME",
      image: image?.trim() || "",
      desc: desc?.trim() || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.unshift(newProduct);
    writeProducts(products);

    return NextResponse.json({ success: true, data: newProduct });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, category, subCategory, price, stock, commission, commissionType, desc, image, unit, warehouseStock, entityType } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID produk wajib disertakan" }, { status: 400 });
    }

    const products = readProducts();
    const index = products.findIndex((p: { id: string | number }) => String(p.id) === String(id));

    if (index === -1) {
      return NextResponse.json({ success: false, message: "Produk tidak ditemukan" }, { status: 404 });
    }

    const parsedPrice = price !== undefined ? (typeof price === "number" ? price : parseFloat(price) || 0) : products[index].price;
    const parsedStock = stock !== undefined ? (typeof stock === "number" ? stock : parseInt(stock, 10) || 0) : products[index].stock;
    const commRate = commission !== undefined ? (typeof commission === "number" ? commission : parseInt(String(commission).replace(/[^0-9]/g, ""), 10) || 10) : products[index].commissionRate;

    products[index] = {
      ...products[index],
      name: name !== undefined ? name.trim() : products[index].name,
      category: category !== undefined ? category.trim() : products[index].category,
      subCategory: subCategory !== undefined ? subCategory.trim() : (products[index].subCategory || ""),
      entityType: entityType === "NON_PT" || entityType === "PT" ? entityType : (products[index].entityType || "PT"),
      price: parsedPrice,
      installationFee: body.installationFee !== undefined
        ? (typeof body.installationFee === "number" ? body.installationFee : parseFloat(body.installationFee) || 0)
        : (products[index].installationFee ?? getCategoryDefaultInstallationFee(products[index].category, products[index].name)),
      hasInstallationService: body.hasInstallationService !== undefined
        ? Boolean(body.hasInstallationService)
        : (products[index].hasInstallationService ?? true),
      stock: parsedStock,
      unit: unit !== undefined ? unit.trim() : (products[index].unit || "Unit"),
      warehouseStock: warehouseStock !== undefined ? warehouseStock : products[index].warehouseStock,
      commission: `${commRate}%`,
      commissionRate: commRate,
      commissionType: commissionType !== undefined ? commissionType : products[index].commissionType,
      image: image !== undefined ? image.trim() : (products[index].image || ""),
      desc: desc !== undefined ? desc.trim() : products[index].desc,
      updatedAt: new Date().toISOString(),
    };

    writeProducts(products);

    return NextResponse.json({ success: true, data: products[index] });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // query param fallback
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "ID produk wajib disertakan" }, { status: 400 });
    }

    const products = readProducts();
    const filtered = products.filter((p: { id: string | number }) => String(p.id) !== String(id));

    if (filtered.length === products.length) {
      return NextResponse.json({ success: false, message: "Produk tidak ditemukan" }, { status: 404 });
    }

    writeProducts(filtered);

    return NextResponse.json({ success: true, message: "Produk berhasil dihapus", id });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
