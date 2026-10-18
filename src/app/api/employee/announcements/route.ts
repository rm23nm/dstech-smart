import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_announcements.json");

function readAnnouncements() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_announcements.json:", err);
  }
  return [];
}

function writeAnnouncements(data: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_announcements.json:", err);
    return false;
  }
}

export async function GET() {
  const announcements = readAnnouncements();
  return NextResponse.json({
    success: true,
    total: announcements.length,
    data: announcements,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, summary, content, urgent } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Judul dan isi pengumuman wajib diisi" }, { status: 400 });
    }

    const announcements = readAnnouncements();
    const newAnn = {
      id: `dstech_ann_${Date.now()}`,
      title,
      category: category || "INFO UMUM",
      date: "Hari ini",
      author: body.author || "Manajemen DSTech",
      summary: summary || content.slice(0, 100) + "...",
      content,
      urgent: Boolean(urgent),
    };

    announcements.unshift(newAnn);
    writeAnnouncements(announcements);

    return NextResponse.json({
      success: true,
      message: "Pengumuman berhasil diterbitkan",
      data: newAnn,
    });
  } catch (err) {
    console.error("Error creating announcement:", err);
    return NextResponse.json({ success: false, error: "Gagal membuat pengumuman" }, { status: 500 });
  }
}
