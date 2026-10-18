import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_promotions.json");

function readPromotions(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_promotions.json:", err);
  }
  return [];
}

function writePromotions(data: any[]): boolean {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_promotions.json:", err);
    return false;
  }
}

export async function GET() {
  try {
    const promotions = readPromotions();
    return NextResponse.json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memuat materi promosi", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, description, fileUrl, fileType, fileSize } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Judul materi promosi wajib diisi." },
        { status: 400 }
      );
    }

    const current = readPromotions();
    const newPromo = {
      id: `dstech_promo_${Date.now()}`,
      title,
      category: category || "Brosur Promosi",
      description: description || "",
      fileUrl: fileUrl || "/logo.png",
      fileType: fileType || "PDF",
      fileSize: fileSize || "1.5 MB",
      downloadCount: 0,
      createdAt: new Date().toISOString(),
    };

    current.unshift(newPromo);
    writePromotions(current);

    return NextResponse.json({
      success: true,
      message: "Materi promosi & katalog berhasil ditambahkan.",
      data: newPromo,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan materi promosi.", error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID materi wajib disertakan." }, { status: 400 });
    }

    const current = readPromotions();
    const filtered = current.filter((item) => item.id !== id);

    if (filtered.length === current.length) {
      return NextResponse.json({ success: false, message: "Materi promosi tidak ditemukan." }, { status: 404 });
    }

    writePromotions(filtered);
    return NextResponse.json({ success: true, message: "Materi promosi berhasil dihapus." });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus materi promosi.", error: String(error) },
      { status: 500 }
    );
  }
}
