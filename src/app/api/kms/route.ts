import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface DstechKmsItem {
  id: string;
  title: string;
  category: "sop" | "k3" | "firmware" | "kontak" | "troubleshooting";
  categoryLabel: string;
  summary: string;
  content: string;
  downloadUrl?: string;
  fileSize?: string;
  contactName?: string;
  contactPhone?: string;
  contactRole?: string;
  updatedAt: string;
  updatedBy: string;
}

const KMS_FILE = path.join(process.cwd(), "src", "data", "dstech_kms.json");

function getCategoryLabel(category: string): string {
  switch (category) {
    case "sop":
      return "SOP Instalasi Lapangan";
    case "k3":
      return "Standar K3 Teknisi";
    case "firmware":
      return "Firmware DVR / NVR";
    case "kontak":
      return "Kontak PIC Lapangan";
    case "troubleshooting":
      return "Troubleshooting Lapangan";
    default:
      return "Panduan Umum";
  }
}

function readKms(): DstechKmsItem[] {
  try {
    if (!fs.existsSync(KMS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(KMS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading dstech_kms.json:", error);
    return [];
  }
}

function writeKms(data: DstechKmsItem[]): boolean {
  try {
    fs.writeFileSync(KMS_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing dstech_kms.json:", error);
    return false;
  }
}

// GET: Ambil daftar KMS (dengan filter kategori & pencarian)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.toLowerCase();

    let list = readKms();

    if (category && category !== "all" && category !== "semua") {
      list = list.filter((item) => item.category === category);
    }

    if (q) {
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          (item.contactName && item.contactName.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    console.error("GET /api/kms error:", error);
    return NextResponse.json({ success: false, error: "Gagal memuat data KMS" }, { status: 500 });
  }
}

// POST: Tambah panduan KMS baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category,
      summary,
      content,
      downloadUrl,
      fileSize,
      contactName,
      contactPhone,
      contactRole,
      updatedBy,
    } = body;

    if (!title || !category || !content) {
      return NextResponse.json(
        { success: false, error: "Judul, kategori, dan isi panduan wajib diisi!" },
        { status: 400 }
      );
    }

    const currentList = readKms();

    const newItem: DstechKmsItem = {
      id: `dstech_kms_${Date.now()}`,
      title: title.trim(),
      category,
      categoryLabel: getCategoryLabel(category),
      summary: summary?.trim() || title.trim(),
      content: content.trim(),
      downloadUrl: downloadUrl?.trim() || "",
      fileSize: fileSize?.trim() || "",
      contactName: contactName?.trim() || "",
      contactPhone: contactPhone?.trim() || "",
      contactRole: contactRole?.trim() || "",
      updatedAt: new Date().toISOString().split("T")[0],
      updatedBy: updatedBy || "Admin DSTech",
    };

    currentList.unshift(newItem);
    writeKms(currentList);

    return NextResponse.json({
      success: true,
      message: "Panduan KMS berhasil ditambahkan!",
      data: newItem,
    });
  } catch (error) {
    console.error("POST /api/kms error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambahkan panduan KMS" }, { status: 500 });
  }
}

// PUT: Perbarui panduan KMS
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      category,
      summary,
      content,
      downloadUrl,
      fileSize,
      contactName,
      contactPhone,
      contactRole,
      updatedBy,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID panduan KMS wajib disertakan!" }, { status: 400 });
    }

    const currentList = readKms();
    const index = currentList.findIndex((item) => item.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Panduan KMS tidak ditemukan!" }, { status: 404 });
    }

    const updatedItem: DstechKmsItem = {
      ...currentList[index],
      title: title ? title.trim() : currentList[index].title,
      category: category || currentList[index].category,
      categoryLabel: category ? getCategoryLabel(category) : currentList[index].categoryLabel,
      summary: summary !== undefined ? summary.trim() : currentList[index].summary,
      content: content !== undefined ? content.trim() : currentList[index].content,
      downloadUrl: downloadUrl !== undefined ? downloadUrl.trim() : currentList[index].downloadUrl,
      fileSize: fileSize !== undefined ? fileSize.trim() : currentList[index].fileSize,
      contactName: contactName !== undefined ? contactName.trim() : currentList[index].contactName,
      contactPhone: contactPhone !== undefined ? contactPhone.trim() : currentList[index].contactPhone,
      contactRole: contactRole !== undefined ? contactRole.trim() : currentList[index].contactRole,
      updatedAt: new Date().toISOString().split("T")[0],
      updatedBy: updatedBy || currentList[index].updatedBy || "Admin DSTech",
    };

    currentList[index] = updatedItem;
    writeKms(currentList);

    return NextResponse.json({
      success: true,
      message: "Panduan KMS berhasil diperbarui!",
      data: updatedItem,
    });
  } catch (error) {
    console.error("PUT /api/kms error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui panduan KMS" }, { status: 500 });
  }
}

// DELETE: Hapus panduan KMS
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "ID panduan KMS wajib disertakan!" }, { status: 400 });
    }

    const currentList = readKms();
    const filtered = currentList.filter((item) => item.id !== id);

    if (filtered.length === currentList.length) {
      return NextResponse.json({ success: false, error: "Panduan KMS tidak ditemukan!" }, { status: 404 });
    }

    writeKms(filtered);

    return NextResponse.json({
      success: true,
      message: "Panduan KMS berhasil dihapus dari sistem!",
    });
  } catch (error) {
    console.error("DELETE /api/kms error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus panduan KMS" }, { status: 500 });
  }
}
