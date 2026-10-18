import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Tidak ada file gambar yang diunggah." },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/svg+xml", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Format file tidak didukung. Harap upload gambar (JPG, PNG, WEBP, SVG)." },
        { status: 400 }
      );
    }

    // Limit size: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran file terlalu besar. Maksimal 10MB." },
        { status: 400 }
      );
    }

    // Target upload folder in public/uploads/
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate safe filename with mandatory dstech_ prefix
    const ext = path.extname(file.name) || ".png";
    const cleanExt = ext.startsWith(".") ? ext : `.${ext}`;
    const safeBaseName = file.name
      .replace(cleanExt, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 30);
    const fileName = `dstech_img_${Date.now()}_${safeBaseName}${cleanExt}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      message: "Gambar berhasil diunggah.",
      url: publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memproses unggahan file.", error: String(error) },
      { status: 500 }
    );
  }
}
