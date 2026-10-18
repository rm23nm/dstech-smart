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
    stock: 24,
    commission: "15%",
    commissionRate: 15,
    commissionType: "ONETIME",
    desc: "Smart Doorlock dengan Fingerprint, RFID, PIN, & Bluetooth App Control untuk hunian dan perkantoran.",
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z"
  },
  {
    id: "dstech_prod_2",
    name: "CCTV Hikvision 4CH HD",
    category: "Security",
    price: 3500000,
    stock: 12,
    commission: "10%",
    commissionRate: 10,
    commissionType: "ONETIME",
    desc: "Paket CCTV 4 Channel Resolusi HD lengkap dengan DVR, HDD 1TB, dan kabel coaxial 50 meter.",
    createdAt: "2026-01-20T09:30:00.000Z",
    updatedAt: "2026-01-20T09:30:00.000Z"
  },
  {
    id: "dstech_prod_3",
    name: "Fingerprint ZKTeco Attendance",
    category: "Security",
    price: 1200000,
    stock: 45,
    commission: "10%",
    commissionRate: 10,
    commissionType: "ONETIME",
    desc: "Mesin absensi sidik jari & RFID berkapasitas 1000 user dengan rekapitulasi laporan Excel otomatis.",
    createdAt: "2026-02-01T11:00:00.000Z",
    updatedAt: "2026-02-01T11:00:00.000Z"
  },
  {
    id: "dstech_prod_4",
    name: "Running Text LED Red Outdoor",
    category: "Visual",
    price: 2500000,
    stock: 8,
    commission: "15%",
    commissionRate: 15,
    commissionType: "ONETIME",
    desc: "Display LED Running Text outdoor tahan cuaca, setting teks mudah via WiFi smartphone.",
    createdAt: "2026-02-10T14:15:00.000Z",
    updatedAt: "2026-02-10T14:15:00.000Z"
  },
  {
    id: "dstech_prod_5",
    name: "Barrier Gate System Otomatis",
    category: "Parking",
    price: 8500000,
    stock: 5,
    commission: "10%",
    commissionRate: 10,
    commissionType: "ONETIME",
    desc: "Palang parkir otomatis dengan loop detector, remote kontrol nirkabel, dan integrasi reader RFID.",
    createdAt: "2026-02-25T10:00:00.000Z",
    updatedAt: "2026-02-25T10:00:00.000Z"
  },
  {
    id: "dstech_prod_6",
    name: "Paket Website Bisnis & E-Store",
    category: "Software",
    price: 2500000,
    stock: 99,
    commission: "20%",
    commissionRate: 20,
    commissionType: "RECURRING",
    desc: "Pembuatan website profil perusahaan & toko online modern terintegrasi domain .com dan hosting 1 tahun.",
    createdAt: "2026-03-05T13:20:00.000Z",
    updatedAt: "2026-03-05T13:20:00.000Z"
  }
];

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
    return JSON.parse(content);
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

export async function GET() {
  const products = readProducts();
  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, price, stock, commission, commissionType, desc } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ success: false, message: "Nama produk wajib diisi" }, { status: 400 });
    }

    const products = readProducts();
    const parsedPrice = typeof price === "number" ? price : parseFloat(price) || 0;
    const parsedStock = typeof stock === "number" ? stock : parseInt(stock, 10) || 0;
    const commRate = typeof commission === "number" ? commission : parseInt(String(commission).replace(/[^0-9]/g, ""), 10) || 10;

    const newProduct = {
      id: `dstech_prod_${Date.now()}`,
      name: name.trim(),
      category: category?.trim() || "Security",
      price: parsedPrice,
      stock: parsedStock,
      commission: `${commRate}%`,
      commissionRate: commRate,
      commissionType: commissionType === "RECURRING" ? "RECURRING" : "ONETIME",
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
    const { id, name, category, price, stock, commission, commissionType, desc } = body;

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
      price: parsedPrice,
      stock: parsedStock,
      commission: `${commRate}%`,
      commissionRate: commRate,
      commissionType: commissionType !== undefined ? commissionType : products[index].commissionType,
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
        // ignore body parse error if id in searchParams
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

    return NextResponse.json({ success: true, message: "Produk berhasil dihapus", deletedId: id });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
