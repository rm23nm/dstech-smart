import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src/data/dstech_livestream.json");
const PRODUCTS_FILE = path.join(process.cwd(), "src/data/dstech_products.json");
const SMARTPRO_URL = process.env.SMARTPRO_BASE_URL || "https://smartpro.dstechsmart.com";
const MASTER_SECRET = process.env.LICENSE_MASTER_KEY || process.env.DSTECH_MASTER_SECRET || "DSTECH-MASTER-PRO-2026";

interface LiveStreamData {
  isLive: boolean;
  title: string;
  description: string;
  streamType: "smartpro_ai" | "youtube" | "custom_embed";
  smartProUrl: string;
  youtubeId: string;
  currentProductId: string;
  featuredProductIds: string[];
  bannerNotice: string;
  viewerCount: number;
  likesCount: number;
  startedAt: string;
  updatedAt: string;
  showInStore: boolean;
}

const DEFAULT_LIVESTREAM: LiveStreamData = {
  isLive: true,
  title: "🔴 LIVE DEMO: Paket CCTV AI Ultra HD & Smart Home Security DSTech Smart",
  description: "Saksikan demonstrasi langsung perangkat CCTV kecerdasan buatan, Barrier Gate Otomatis, dan Smart Door Lock bersama Virtual AI Host. Dapatkan konsultasi gratis & diskon khusus live!",
  streamType: "smartpro_ai",
  smartProUrl: "https://smartpro.dstechsmart.com/virtual-host.html",
  youtubeId: "dQw4w9WgXcQ",
  currentProductId: "dstech_prod_1",
  featuredProductIds: ["dstech_prod_1", "dstech_prod_2", "dstech_prod_3", "dstech_prod_4"],
  bannerNotice: "🔥 PROMO LIVE E-STORE: Diskon Spesial & Gratis Survey Pemasangan Hari Ini!",
  viewerCount: 184,
  likesCount: 2450,
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  showInStore: true,
};

function readLiveStreamData(): LiveStreamData {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_LIVESTREAM, null, 2), "utf8");
      return DEFAULT_LIVESTREAM;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return { ...DEFAULT_LIVESTREAM, ...JSON.parse(raw) };
  } catch (e) {
    console.error("[LiveStream API] Gagal membaca data livestream:", e);
    return DEFAULT_LIVESTREAM;
  }
}

function writeLiveStreamData(data: LiveStreamData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("[LiveStream API] Gagal menulis data livestream:", e);
  }
}

function toAbsoluteImageUrl(img: string | undefined): string {
  if (!img) return "https://dstechsmart.com/service-cctv.png";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) return `https://dstechsmart.com${img}`;
  return `https://dstechsmart.com/${img}`;
}

function readProducts(): any[] {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) return [];
    const raw = fs.readFileSync(PRODUCTS_FILE, "utf8");
    const json = JSON.parse(raw);
    return Array.isArray(json) ? json : json.products || json.data || [];
  } catch (e) {
    console.error("[LiveStream API] Gagal membaca produk:", e);
    return [];
  }
}

export async function GET() {
  try {
    const liveData = readLiveStreamData();
    const products = readProducts();

    // Attach detail current product dengan gambar absolut
    const rawCurrent = products.find((p) => p.id === liveData.currentProductId) || products[0] || null;
    const currentProduct = rawCurrent
      ? {
          ...rawCurrent,
          image: toAbsoluteImageUrl(rawCurrent.image),
          images: (Array.isArray(rawCurrent.images) && rawCurrent.images.length > 0)
            ? rawCurrent.images.map(toAbsoluteImageUrl)
            : [toAbsoluteImageUrl(rawCurrent.image)],
        }
      : null;

    // Attach featured products
    const featuredProducts = (liveData.featuredProductIds || [])
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({
        ...p,
        image: toAbsoluteImageUrl(p.image),
        images: (Array.isArray(p.images) && p.images.length > 0)
          ? p.images.map(toAbsoluteImageUrl)
          : [toAbsoluteImageUrl(p.image)],
      }));

    // Dynamic viewers fluctuation simulation (+/- 3)
    const randomizedViewers = Math.max(12, liveData.viewerCount + Math.floor(Math.random() * 7) - 3);

    return NextResponse.json({
      success: true,
      data: {
        ...liveData,
        viewerCount: randomizedViewers,
        currentProduct,
        featuredProducts: featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6).map((p) => ({
          ...p,
          image: toAbsoluteImageUrl(p.image),
          images: (Array.isArray(p.images) && p.images.length > 0)
            ? p.images.map(toAbsoluteImageUrl)
            : [toAbsoluteImageUrl(p.image)],
        })),
        allProducts: products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          brand: p.brand || "DSTech Smart",
          image: toAbsoluteImageUrl(p.image),
          images: (Array.isArray(p.images) && p.images.length > 0)
            ? p.images.map(toAbsoluteImageUrl)
            : [toAbsoluteImageUrl(p.image)],
          stock: p.stock ?? 10,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const liveData = readLiveStreamData();

    // Aksi 1: Kirim Reaction Like (❤️)
    if (body.action === "like") {
      liveData.likesCount = (liveData.likesCount || 0) + 1;
      writeLiveStreamData(liveData);
      return NextResponse.json({ success: true, likesCount: liveData.likesCount });
    }

    // Aksi 2: Ganti Pinned Product saat live berlangsung
    if (body.action === "set_product") {
      liveData.currentProductId = body.productId;
      liveData.updatedAt = new Date().toISOString();
      writeLiveStreamData(liveData);
      return NextResponse.json({
        success: true,
        message: "Produk aktif live berhasil diubah",
        currentProductId: liveData.currentProductId,
      });
    }

    // Aksi 3: Sinkronkan seluruh katalog produk ke SmartPro WA Gateway
    if (body.action === "sync_smartpro") {
      const products = readProducts();
      try {
        const payload = {
          secret: MASTER_SECRET,
          products: products.map((p, idx) => {
            const absImages = (Array.isArray(p.images) && p.images.length > 0)
              ? p.images.map(toAbsoluteImageUrl)
              : [toAbsoluteImageUrl(p.image)];
            return {
              id: p.id,
              name: p.name,
              price: typeof p.price === "number" ? `Rp ${p.price.toLocaleString("id-ID")}` : p.price,
              numericPrice: typeof p.price === "number" ? p.price : 0,
              category: p.category || "CCTV & Security",
              brand: p.brand || "DSTech Smart",
              description: p.description || p.name,
              images: absImages,
              stock: p.stock ?? 10,
              index: idx + 1,
            };
          }),
        };

        const resSmartPro = await fetch(`${SMARTPRO_URL}/api/external/sync-products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const resData = await resSmartPro.json().catch(() => ({}));
        return NextResponse.json({
          success: true,
          message: `Katalog berhasil disinkronkan ke SmartPro (${products.length} produk)`,
          smartProResult: resData,
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: `Gagal menghubungi SmartPro (${SMARTPRO_URL}): ${err.message}`,
        });
      }
    }

    // Aksi 4: Toggle Status Siaran (Start / Stop Live)
    if (body.action === "toggle_live") {
      liveData.isLive = body.isLive !== undefined ? body.isLive : !liveData.isLive;
      if (liveData.isLive) {
        liveData.startedAt = new Date().toISOString();
      }
      liveData.updatedAt = new Date().toISOString();
      writeLiveStreamData(liveData);
      return NextResponse.json({
        success: true,
        message: liveData.isLive ? "Siaran Live Streaming DIAKTIFKAN" : "Siaran Live Streaming DINONAKTIFKAN",
        isLive: liveData.isLive,
      });
    }

    // Aksi 5: Update Konfigurasi Siaran Penuh
    const updated: LiveStreamData = {
      ...liveData,
      isLive: body.isLive !== undefined ? body.isLive : liveData.isLive,
      title: body.title || liveData.title,
      description: body.description || liveData.description,
      streamType: body.streamType || liveData.streamType,
      smartProUrl: body.smartProUrl || liveData.smartProUrl,
      youtubeId: body.youtubeId !== undefined ? body.youtubeId : liveData.youtubeId,
      currentProductId: body.currentProductId || liveData.currentProductId,
      featuredProductIds: Array.isArray(body.featuredProductIds)
        ? body.featuredProductIds
        : liveData.featuredProductIds,
      bannerNotice: body.bannerNotice !== undefined ? body.bannerNotice : liveData.bannerNotice,
      showInStore: body.showInStore !== undefined ? body.showInStore : liveData.showInStore,
      updatedAt: new Date().toISOString(),
    };

    writeLiveStreamData(updated);

    return NextResponse.json({
      success: true,
      message: "Pengaturan Live Streaming berhasil disimpan",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
