import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, message: "Permintaan harus berupa multipart/form-data." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Tidak ada file berkas yang diunggah." },
        { status: 400 }
      );
    }

    const docType = (formData.get("docType") as string) || "image";

    // Validate mime type (Gambar & Dokumen PDF)
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/svg+xml",
      "image/gif",
      "image/jfif",
      "image/pjpeg",
      "application/pdf",
    ];
    const isJfifByName = file.name.toLowerCase().endsWith(".jfif");
    if (!validTypes.includes(file.type) && !isJfifByName) {
      return NextResponse.json(
        { success: false, message: "Format file tidak didukung. Harap upload gambar (JPG, PNG, WEBP, JFIF) atau dokumen PDF." },
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
    const rawExt = (path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".jpg")).toLowerCase();
    let cleanExt = rawExt.startsWith(".") ? rawExt : `.${rawExt}`;
    // Normalisasi format JFIF/JPEG menjadi .jpg standar agar selalu dikenali Nginx & Next.js Optimizer
    if (cleanExt === ".jfif" || cleanExt === ".jpeg" || cleanExt === ".pjpeg") {
      cleanExt = ".jpg";
    }

    const safeBaseName = file.name
      .replace(path.extname(file.name), "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 30);

    const prefix = file.type === "application/pdf" || docType === "archive" || docType === "document" ? "dstech_doc" : "dstech_img";
    const fileName = `${prefix}_${Date.now()}_${safeBaseName}${cleanExt}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      message: "Berkas berhasil diunggah.",
      url: publicUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memproses unggahan file.", error: String(error) },
      { status: 500 }
    );
  }
}
