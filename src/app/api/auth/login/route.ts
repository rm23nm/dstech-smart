import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_users.json");

function readUsers(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_users.json:", err);
  }
  return [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, portalRole } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan kata sandi (password) wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const users = readUsers();
    const user = users.find(
      (u) => u.email && u.email.trim().toLowerCase() === cleanEmail
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun dengan email '" + cleanEmail + "' tidak ditemukan dalam database DSTech.",
        },
        { status: 404 }
      );
    }

    if (user.status && user.status.toUpperCase() !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Akun ini sedang DINONAKTIFKAN oleh Administrator. Hubungi pihak manajemen untuk mengaktifkan kembali.",
        },
        { status: 403 }
      );
    }

    // Validasi Password
    const storedPassword = user.password || "dstech123";
    if (storedPassword !== cleanPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Kata sandi (password) yang Anda masukkan salah. Periksa kembali pengetikan Anda.",
        },
        { status: 401 }
      );
    }

    // Validasi Hak Akses Sesuai Portal yang Dipilih
    const userRole = (user.role || "").toUpperCase();
    if (portalRole) {
      const selectedPortal = String(portalRole).toUpperCase();
      if (selectedPortal === "ADMIN" && userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
        return NextResponse.json(
          {
            success: false,
            message: `Akun Anda terdaftar sebagai role '${userRole}', tidak memiliki izin akses ke Portal Administrator.`,
          },
          { status: 403 }
        );
      }
      if (selectedPortal === "EMPLOYEE" && userRole !== "EMPLOYEE" && userRole !== "SUPERADMIN") {
        return NextResponse.json(
          {
            success: false,
            message: `Akun Anda terdaftar sebagai role '${userRole}', tidak memiliki izin akses ke Portal Teknisi / Karyawan.`,
          },
          { status: 403 }
        );
      }
      if (selectedPortal === "PARTNER" && userRole !== "AFFILIATE" && userRole !== "PARTNER" && userRole !== "SUPERADMIN") {
        return NextResponse.json(
          {
            success: false,
            message: `Akun Anda terdaftar sebagai role '${userRole}', tidak memiliki izin akses ke Portal Mitra Afiliasi.`,
          },
          { status: 403 }
        );
      }
    }

    // Login Sukses
    const token = `dstech_tok_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const redirectUrl =
      userRole === "SUPERADMIN" || userRole === "ADMIN"
        ? "/admin"
        : userRole === "EMPLOYEE"
        ? "/employee"
        : "/affiliate";

    return NextResponse.json({
      success: true,
      message: `Login berhasil! Selamat datang kembali, ${user.name}.`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        token,
        redirectUrl,
      },
    });
  } catch (error) {
    console.error("Auth Login API error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi gangguan pada server autentikasi." },
      { status: 500 }
    );
  }
}
