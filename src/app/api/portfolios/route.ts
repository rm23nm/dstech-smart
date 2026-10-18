import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: string;
  location?: string;
  completionDate?: string;
  description: string;
  image?: string;
  videoUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_portfolios.json");

function readPortfolios(): PortfolioItem[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading dstech_portfolios.json:", error);
    return [];
  }
}

function writePortfolios(data: PortfolioItem[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing dstech_portfolios.json:", error);
    return false;
  }
}

// GET: Ambil seluruh daftar portofolio proyek
export async function GET() {
  try {
    const portfolios = readPortfolios();
    return NextResponse.json({
      success: true,
      data: portfolios,
      total: portfolios.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memuat data portofolio", error: String(error) },
      { status: 500 }
    );
  }
}

// POST: Tambah proyek portofolio baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, client, category, location, completionDate, description, image, videoUrl } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Judul proyek wajib diisi" },
        { status: 400 }
      );
    }

    if (!client || !client.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama klien / instansi wajib diisi" },
        { status: 400 }
      );
    }

    const portfolios = readPortfolios();
    const newPortfolio: PortfolioItem = {
      id: `dstech_port_${Date.now()}`,
      title: title.trim(),
      client: client.trim(),
      category: category?.trim() || "Industrial",
      location: location?.trim() || "Cilegon, Banten",
      completionDate: completionDate?.trim() || new Date().toISOString().slice(0, 7),
      description: description?.trim() || "",
      image: image?.trim() || "/portfolio-industrial.png",
      videoUrl: videoUrl?.trim() || "",
      status: "Completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    portfolios.unshift(newPortfolio);
    writePortfolios(portfolios);

    return NextResponse.json({
      success: true,
      message: "Proyek portofolio baru berhasil disimpan",
      data: newPortfolio,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan portofolio", error: String(error) },
      { status: 500 }
    );
  }
}

// PUT: Perbarui data proyek portofolio
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, client, category, location, completionDate, description, image, videoUrl, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID portofolio wajib disertakan" },
        { status: 400 }
      );
    }

    const portfolios = readPortfolios();
    const index = portfolios.findIndex((p) => String(p.id) === String(id));

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Proyek portofolio tidak ditemukan" },
        { status: 404 }
      );
    }

    portfolios[index] = {
      ...portfolios[index],
      title: title !== undefined ? title.trim() : portfolios[index].title,
      client: client !== undefined ? client.trim() : portfolios[index].client,
      category: category !== undefined ? category.trim() : portfolios[index].category,
      location: location !== undefined ? location.trim() : portfolios[index].location,
      completionDate: completionDate !== undefined ? completionDate.trim() : portfolios[index].completionDate,
      description: description !== undefined ? description.trim() : portfolios[index].description,
      image: image !== undefined ? image.trim() : portfolios[index].image,
      videoUrl: videoUrl !== undefined ? videoUrl.trim() : portfolios[index].videoUrl,
      status: status !== undefined ? status : portfolios[index].status,
      updatedAt: new Date().toISOString(),
    };

    writePortfolios(portfolios);

    return NextResponse.json({
      success: true,
      message: "Proyek portofolio berhasil diperbarui",
      data: portfolios[index],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui portofolio", error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Hapus proyek portofolio
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID portofolio diperlukan" },
        { status: 400 }
      );
    }

    const portfolios = readPortfolios();
    const filtered = portfolios.filter((p) => String(p.id) !== String(id));

    if (filtered.length === portfolios.length) {
      return NextResponse.json(
        { success: false, message: "Proyek portofolio tidak ditemukan" },
        { status: 404 }
      );
    }

    writePortfolios(filtered);

    return NextResponse.json({
      success: true,
      message: "Proyek portofolio berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus portofolio", error: String(error) },
      { status: 500 }
    );
  }
}
