import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_users.json");
const CONTRACTS_FILE = path.join(process.cwd(), "src", "data", "dstech_contracts.json");
const ORDERS_FILE = path.join(process.cwd(), "src", "data", "dstech_orders.json");

const DEFAULT_USERS = [
  {
    id: "dstech_usr_1",
    name: "Super Admin DStech",
    email: "superadmin@dstechsmart.com",
    role: "SUPERADMIN",
    password: "M4m4cantik@MAMA344",
    phone: "081287654321",
    status: "ACTIVE",
    expiresAt: null,
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
    expiresAt: null,
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-01-10T08:00:00.000Z"
  }
];

function syncContractsWithUsers(users: any[]): boolean {
  try {
    if (!fs.existsSync(CONTRACTS_FILE)) return false;
    const contractsData = JSON.parse(fs.readFileSync(CONTRACTS_FILE, "utf-8"));
    const contracts = contractsData.contracts || [];
    let updated = false;

    for (const contract of contracts) {
      if (!contract.employeeEmail) continue;
      const email = contract.employeeEmail.trim().toLowerCase();
      const existing = users.find((u) => u.email && u.email.trim().toLowerCase() === email);

      if (!existing) {
        users.push({
          id: `dstech_usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: contract.employeeName,
          email: email,
          role: "EMPLOYEE",
          password: "dstech123",
          phone: contract.employeePhone || "",
          status: "ACTIVE",
          expiresAt: contract.endDate || null,
          attendanceLocationLock: contract.attendanceLocationLock || "ANY",
          officeRadius: contract.officeRadius ? Number(contract.officeRadius) : 100,
          contractId: contract.id,
          position: contract.position || "Teknisi Lapangan",
          createdAt: contract.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        updated = true;
      } else {
        if (!existing.expiresAt && contract.endDate) {
          existing.expiresAt = contract.endDate;
          existing.contractId = contract.id;
          updated = true;
        }
        if (!existing.attendanceLocationLock && contract.attendanceLocationLock) {
          existing.attendanceLocationLock = contract.attendanceLocationLock;
          updated = true;
        }
      }
    }
    return updated;
  } catch (err) {
    console.error("Error syncing contracts to users:", err);
    return false;
  }
}

function syncOrdersWithUsers(users: any[]): boolean {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return false;
    const ordersData = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
    const orders = ordersData.orders || [];
    let updated = false;

    for (const order of orders) {
      const email = (order.customerEmail || "").trim().toLowerCase();
      const phone = (order.customerPhone || "").trim();
      const name = (order.customerName || order.shippingAddress?.recipientName || "").trim();
      if (!email && !phone) continue;

      // Cek apakah sudah ada akun dengan role CLIENT untuk pembeli ini
      const existingClient = users.find(
        (u) =>
          u.role === "CLIENT" &&
          ((email && u.email && u.email.trim().toLowerCase() === email) ||
            (phone && u.phone && u.phone.trim() === phone))
      );

      if (!existingClient) {
        users.push({
          id: `dstech_usr_${order.userId || "client_" + Date.now()}`,
          name: name || "Pelanggan E-Store",
          email: email || `client_${phone.replace(/\D/g, "")}@dstechsmart.com`,
          role: "CLIENT",
          password: "dstech" + Math.floor(100 + Math.random() * 900),
          phone: phone || order.shippingAddress?.phone || "",
          status: "ACTIVE",
          expiresAt: null,
          attendanceLocationLock: "ANY",
          officeRadius: 100,
          position: "Pelanggan E-Store",
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        updated = true;
      }
    }
    return updated;
  } catch (err) {
    console.error("Error syncing orders to users:", err);
    return false;
  }
}

function readUsers(): any[] {
  try {
    let users: any[] = [];
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      users = JSON.parse(data);
    } else {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_USERS, null, 2), "utf-8");
      users = DEFAULT_USERS;
    }

    const contractsUpdated = syncContractsWithUsers(users);
    const ordersUpdated = syncOrdersWithUsers(users);
    if (contractsUpdated || ordersUpdated) {
      writeUsers(users);
    }
    return users;
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
    const { name, email, role, phone, status, password, expiresAt, attendanceLocationLock, officeRadius, permissions } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Nama dan email wajib diisi." },
        { status: 400 }
      );
    }

    const users = readUsers();

    const targetRole = role || "CLIENT";
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === targetRole
    );
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Email '${email}' sudah terdaftar pada peran ${targetRole}.` },
        { status: 409 }
      );
    }

    const newUser = {
      id: `dstech_usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: targetRole,
      password: password && password.trim() ? password.trim() : "dstech123",
      phone: phone ? phone.trim() : "",
      status: (status || "ACTIVE").toUpperCase(),
      expiresAt: expiresAt || null,
      attendanceLocationLock: attendanceLocationLock || "ANY",
      officeRadius: officeRadius ? Number(officeRadius) : 100,
      permissions: permissions || null,
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
    const { id, name, email, role, phone, status, password, expiresAt, attendanceLocationLock, officeRadius, permissions } = body;

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
      expiresAt: expiresAt !== undefined ? expiresAt : users[index].expiresAt,
      attendanceLocationLock: attendanceLocationLock !== undefined ? attendanceLocationLock : (users[index].attendanceLocationLock || "ANY"),
      officeRadius: officeRadius !== undefined ? Number(officeRadius) : (users[index].officeRadius || 100),
      permissions: permissions !== undefined ? permissions : (users[index].permissions || null),
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
