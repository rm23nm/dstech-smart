import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_users.json");

const DEFAULT_USERS = [
  {
    id: "dstech_usr_1",
    name: "Super Admin DStech",
    email: "superadmin@dstechsmart.com",
    role: "SUPERADMIN",
    password: "M4m4cantik@MAMA344",
    phone: "081287654321",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "dstech_usr_2",
    name: "Admin Operasional",
    email: "admin@dstechsmart.com",
    role: "ADMIN",
    password: "admin123",
    phone: "081298765432",
    status: "ACTIVE",
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-01-10T08:00:00.000Z"
  },
  {
    id: "dstech_usr_3",
    name: "Teknisi Hendra",
    email: "hendra@dstechsmart.com",
    role: "EMPLOYEE",
    password: "teknisi123",
    phone: "085712345678",
    status: "ACTIVE",
    createdAt: "2026-02-01T09:00:00.000Z",
    updatedAt: "2026-02-01T09:00:00.000Z"
  },
  {
    id: "dstech_usr_4",
    name: "Ahmad Rizky (Mitra Cilegon)",
    email: "ahmad.rizky@gmail.com",
    role: "AFFILIATE",
    password: "mitra123",
    phone: "087811223344",
    status: "ACTIVE",
    createdAt: "2026-02-15T10:00:00.000Z",
    updatedAt: "2026-02-15T10:00:00.000Z"
  },
  {
    id: "dstech_usr_5",
    name: "PT. Krakatau Posco",
    email: "procurement@krakatauposco.co.id",
    role: "CLIENT",
    password: "klien123",
    phone: "0254391234",
    status: "ACTIVE",
    createdAt: "2026-03-01T11:00:00.000Z",
    updatedAt: "2026-03-01T11:00:00.000Z"
  }
];

function readUsers(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_USERS, null, 2), "utf-8");
    return DEFAULT_USERS;
  } catch (err) {
    console.error("Error reading dstech_users.json:", err);
    return DEFAULT_USERS;
  }
}

function writeUsers(users: any[]): boolean {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_users.json:", err);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    let users = readUsers();

    if (search) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          (u.phone && u.phone.includes(search))
      );
    }

    if (role && role !== "ALL") {
      users = users.filter((u) => u.role === role);
    }

    if (status && status !== "ALL") {
      users = users.filter((u) => u.status === status);
    }

    return NextResponse.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memuat data pengguna", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, phone, status, password } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Nama dan email wajib diisi." },
        { status: 400 }
      );
    }

    const users = readUsers();

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email sudah terdaftar oleh pengguna lain." },
        { status: 409 }
      );
    }

    const newUser = {
      id: `dstech_usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || "CLIENT",
      password: password && password.trim() ? password.trim() : "dstech123",
      phone: phone ? phone.trim() : "",
      status: status || "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.unshift(newUser);
    const saved = writeUsers(users);

    if (!saved) {
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan ke penyimpanan data." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pengguna berhasil ditambahkan.",
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server.", error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, role, phone, status, password } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID pengguna diperlukan." },
        { status: 400 }
      );
    }

    const users = readUsers();
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // Check duplicate email
    if (email) {
      const emailDuplicate = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== id
      );
      if (emailDuplicate) {
        return NextResponse.json(
          { success: false, message: "Email sudah digunakan oleh akun lain." },
          { status: 409 }
        );
      }
    }

    users[index] = {
      ...users[index],
      name: name !== undefined ? name.trim() : users[index].name,
      email: email !== undefined ? email.trim().toLowerCase() : users[index].email,
      role: role !== undefined ? role : users[index].role,
      password: password && password.trim() ? password.trim() : users[index].password,
      phone: phone !== undefined ? phone.trim() : users[index].phone,
      status: status !== undefined ? status : users[index].status,
      updatedAt: new Date().toISOString(),
    };

    const saved = writeUsers(users);
    if (!saved) {
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan perubahan." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data pengguna berhasil diperbarui.",
      data: users[index],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server.", error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID pengguna wajib disertakan." },
        { status: 400 }
      );
    }

    const users = readUsers();
    const userToDelete = users.find((u) => u.id === id);

    if (!userToDelete) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    if (userToDelete.role === "SUPERADMIN") {
      return NextResponse.json(
        { success: false, message: "Akun Super Admin utama tidak dapat dihapus demi keamanan sistem." },
        { status: 403 }
      );
    }

    const filtered = users.filter((u) => u.id !== id);
    const saved = writeUsers(filtered);

    if (!saved) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus data dari penyimpanan." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Pengguna '${userToDelete.name}' berhasil dihapus.`,
      id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server.", error: String(error) },
      { status: 500 }
    );
  }
}
