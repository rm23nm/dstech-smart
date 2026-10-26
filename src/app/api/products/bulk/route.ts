import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_products.json");

function readProducts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Gagal membaca berkas master produk:", err);
    return [];
  }
}

function writeProducts(data: any[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Gagal menyimpan berkas master produk:", err);
    return false;
  }
}

function parseNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body.items || body.products;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Daftar produk tidak boleh kosong." },
        { status: 400 }
      );
    }

    const products = readProducts();
    let updatedCount = 0;
    let createdCount = 0;
    const nowIso = new Date().toISOString();

    items.forEach((item, idx) => {
      const rawId = item.id ? String(item.id).trim() : "";
      const existingIndex = rawId
        ? products.findIndex((p: any) => String(p.id).trim() === rawId)
        : -1;

      const parsedPrice = parseNumber(item.price ?? item.hargaJual);
      const parsedCostPrice = parseNumber(item.costPrice ?? item.modalHpp);
      const parsedInstallFee = parseNumber(item.installationFee ?? item.biayaPasang);
      const parsedStock = parseNumber(item.stock ?? item.stok);
      const rawCommission = item.commission ?? item.komisi ?? "10%";
      const commRate = parseNumber(rawCommission) || 10;

      const rawBrand = item.brand ?? item.merek ?? item.Brand ?? item.Merek;
      const parsedBrand = rawBrand ? String(rawBrand).trim() : "";

      if (existingIndex !== -1) {
        // UPDATE PRODUK YANG SUDAH ADA
        const current = products[existingIndex];
        products[existingIndex] = {
          ...current,
          name: item.name ? String(item.name).trim() : current.name,
          category: item.category ? String(item.category).trim() : current.category,
          subCategory: item.subCategory !== undefined ? String(item.subCategory).trim() : (current.subCategory || ""),
          brand: parsedBrand || current.brand || "",
          price: parsedPrice > 0 ? parsedPrice : current.price,
          costPrice: parsedCostPrice >= 0 ? parsedCostPrice : (current.costPrice || 0),
          installationFee: parsedInstallFee >= 0 ? parsedInstallFee : (current.installationFee || 0),
          hasInstallationService:
            item.hasInstallationService !== undefined
              ? Boolean(item.hasInstallationService)
              : (current.hasInstallationService ?? true),
          stock: parsedStock >= 0 ? parsedStock : (current.stock || 0),
          unit: item.unit ? String(item.unit).trim() : (current.unit || "Unit"),
          commission: `${commRate}%`,
          commissionRate: commRate,
          commissionType: item.commissionType ? String(item.commissionType).trim() : (current.commissionType || "ONETIME"),
          entityType: item.entityType === "NON_PT" ? "NON_PT" : (current.entityType || "PT"),
          image: item.image ? String(item.image).trim() : (current.image || ""),
          desc: item.desc !== undefined ? String(item.desc).trim() : (current.desc || ""),
          updatedAt: nowIso,
        };
        updatedCount++;
      } else {
        // BUAT PRODUK BARU
        const productName = item.name ? String(item.name).trim() : `Produk Baru ${idx + 1}`;
        const newProduct = {
          id: rawId || `dstech_prod_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`,
          name: productName,
          category: item.category ? String(item.category).trim() : "Hardware & IT",
          subCategory: item.subCategory ? String(item.subCategory).trim() : "",
          brand: parsedBrand,
          entityType: item.entityType === "NON_PT" ? "NON_PT" : "PT",
          price: parsedPrice,
          costPrice: parsedCostPrice,
          installationFee: parsedInstallFee,
          hasInstallationService: item.hasInstallationService !== undefined ? Boolean(item.hasInstallationService) : true,
          stock: parsedStock,
          unit: item.unit ? String(item.unit).trim() : "Unit",
          commission: `${commRate}%`,
          commissionRate: commRate,
          commissionType: item.commissionType ? String(item.commissionType).trim() : "ONETIME",
          image: item.image ? String(item.image).trim() : "/service-cctv.png",
          images: item.image ? [String(item.image).trim()] : ["/service-cctv.png"],
          brochureUrl: "",
          brochureName: "",
          brochureSize: "",
          desc: item.desc ? String(item.desc).trim() : "",
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        products.unshift(newProduct);
        createdCount++;
      }
    });

    writeProducts(products);

    return NextResponse.json({
      success: true,
      message: `Berhasil memproses massal: ${updatedCount} produk diperbarui harganya/datanya, dan ${createdCount} produk baru ditambahkan.`,
      updatedCount,
      createdCount,
      totalCount: products.length,
    });
  } catch (err: unknown) {
    console.error("Gagal memproses bulk upload produk:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal server.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
