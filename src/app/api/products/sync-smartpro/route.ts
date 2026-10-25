import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRODUCTS_FILE = path.join(process.cwd(), "src", "data", "dstech_products.json");
const SMARTPRO_URL = process.env.SMARTPRO_BASE_URL || "https://smartpro.dstechsmart.com";
const MASTER_SECRET = process.env.LICENSE_MASTER_KEY || "DSTECH-MASTER-PRO-2026";

export async function POST() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      return NextResponse.json({ success: false, error: "Database produk tidak ditemukan" }, { status: 404 });
    }

    const content = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    const products = Array.isArray(parsed.products) ? parsed.products : [];

    if (products.length === 0) {
      return NextResponse.json({ success: false, error: "Tidak ada produk untuk disinkronkan" }, { status: 400 });
    }

    // Format katalog untuk SmartPro (akun admin wa_catalog)
    const payload = {
      secret: MASTER_SECRET,
      products: products.map((p: any) => ({
        id: `PROD-${p.id}`,
        name: p.name,
        description: `${p.description || ""}\n\nGaransi: ${p.warranty || "Resmi PT. DSTech Smart Perkasa"}\nSpesifikasi: ${(p.features || []).join(", ")}`,
        price: `Rp ${(Number(p.price) || 0).toLocaleString("id-ID")}`,
        numericPrice: Number(p.price) || 0,
        category: p.category || "Teknologi & Keamanan",
        stock: p.stock > 0 ? "Ready Stock" : "Pre-Order",
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || "/service-cctv.png"],
        features: Array.isArray(p.features) ? p.features : [],
        is_active: 1,
      })),
    };

    const res = await fetch(`${SMARTPRO_URL}/api/external/sync-products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Gagal menghubungi server SmartPro WA Gateway" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menyinkronkan ${products.length} produk katalog website ke SmartPro WA Gateway! AI chatbot Dani siap memasarkan.`,
      syncedCount: products.length,
      smartproResponse: result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
