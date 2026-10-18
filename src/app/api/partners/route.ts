import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_partners.json");

const DEFAULT_PARTNERS = [
  {
    id: "dstech_ptn_1",
    name: "Ahmad Rizky Pratama",
    email: "ahmad.rizky@gmail.com",
    phone: "087811223344",
    referralCode: "DSTECH-AR01",
    city: "Cilegon",
    tier: "Gold Agent",
    totalClients: 18,
    totalCommission: 4850000,
    pendingCommission: 650000,
    status: "ACTIVE",
    joinedDate: "2026-01-12T08:00:00.000Z",
    updatedAt: "2026-03-10T09:00:00.000Z"
  },
  {
    id: "dstech_ptn_2",
    name: "Siti Sarah Nuraini",
    email: "siti.sarah@gmail.com",
    phone: "081922334455",
    referralCode: "DSTECH-SS02",
    city: "Serang",
    tier: "Platinum Agent",
    totalClients: 26,
    totalCommission: 8200000,
    pendingCommission: 1200000,
    status: "ACTIVE",
    joinedDate: "2026-01-20T10:30:00.000Z",
    updatedAt: "2026-03-12T11:00:00.000Z"
  },
  {
    id: "dstech_ptn_3",
    name: "Budi Santoso",
    email: "budi.santoso@yahoo.com",
    phone: "085233445566",
    referralCode: "DSTECH-BS03",
    city: "Merak",
    tier: "Silver Agent",
    totalClients: 7,
    totalCommission: 1650000,
    pendingCommission: 0,
    status: "ACTIVE",
    joinedDate: "2026-02-05T14:15:00.000Z",
    updatedAt: "2026-02-28T16:00:00.000Z"
  },
  {
    id: "dstech_ptn_4",
    name: "CV. Mega Karya Security",
    email: "admin@megakaryasecurity.com",
    phone: "081299887766",
    referralCode: "DSTECH-MK04",
    city: "Tangerang",
    tier: "Corporate Partner",
    totalClients: 34,
    totalCommission: 14200000,
    pendingCommission: 2500000,
    status: "ACTIVE",
    joinedDate: "2026-01-08T09:00:00.000Z",
    updatedAt: "2026-03-15T13:45:00.000Z"
  },
  {
    id: "dstech_ptn_5",
    name: "Fajar Ramadhan",
    email: "fajar.ramadhan@outlook.com",
    phone: "087755667788",
    referralCode: "DSTECH-FR05",
    city: "Pandeglang",
    tier: "Bronze Agent",
    totalClients: 2,
    totalCommission: 450000,
    pendingCommission: 450000,
    status: "PENDING",
    joinedDate: "2026-03-01T15:20:00.000Z",
    updatedAt: "2026-03-01T15:20:00.000Z"
  }
];

function readPartners(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_PARTNERS, null, 2), "utf-8");
    return DEFAULT_PARTNERS;
  } catch (err) {
    console.error("Error reading dstech_partners.json:", err);
    return DEFAULT_PARTNERS;
  }
}

function writePartners(partners: any[]): boolean {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(partners, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_partners.json:", err);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status");

    let partners = readPartners();

    if (search) {
      partners = partners.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.referralCode.toLowerCase().includes(search) ||
          p.city.toLowerCase().includes(search) ||
          p.email.toLowerCase().includes(search)
      );
    }

    if (status && status !== "ALL") {
      partners = partners.filter((p) => p.status === status);
    }

    // Summary calculation
    const totalCommissions = partners.reduce((sum, p) => sum + (Number(p.totalCommission) || 0), 0);
    const pendingCommissions = partners.reduce((sum, p) => sum + (Number(p.pendingCommission) || 0), 0);
    const activePartnersCount = partners.filter((p) => p.status === "ACTIVE").length;

    return NextResponse.json({
      success: true,
      data: partners,
      total: partners.length,
      summary: {
        totalPartners: partners.length,
        activePartners: activePartnersCount,
        totalCommissions,
        pendingCommissions,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memuat data mitra afiliasi.", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, city, tier, referralCode, status } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Nama dan email mitra wajib diisi." },
        { status: 400 }
      );
    }

    const partners = readPartners();

    const existingEmail = partners.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Email mitra sudah terdaftar." },
        { status: 409 }
      );
    }

    const genReferral =
      referralCode ||
      `DSTECH-${name.substring(0, 2).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

    const newPartner = {
      id: `dstech_ptn_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      referralCode: genReferral.trim().toUpperCase(),
      city: city ? city.trim() : "Cilegon",
      tier: tier || "Silver Agent",
      totalClients: 0,
      totalCommission: 0,
      pendingCommission: 0,
      status: status || "ACTIVE",
      joinedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    partners.unshift(newPartner);
    const saved = writePartners(partners);

    if (!saved) {
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan mitra ke data store." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Mitra '${newPartner.name}' berhasil didaftarkan.`,
        data: newPartner,
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
    const { id, name, email, phone, city, tier, status, payoutApproved } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID mitra diperlukan." },
        { status: 400 }
      );
    }

    const partners = readPartners();
    const index = partners.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Mitra tidak ditemukan." },
        { status: 404 }
      );
    }

    let updatedPending = partners[index].pendingCommission;
    let updatedTotal = partners[index].totalCommission;

    // Handle payout commission approval action
    if (payoutApproved) {
      updatedTotal += updatedPending;
      updatedPending = 0;
    }

    partners[index] = {
      ...partners[index],
      name: name !== undefined ? name.trim() : partners[index].name,
      email: email !== undefined ? email.trim().toLowerCase() : partners[index].email,
      phone: phone !== undefined ? phone.trim() : partners[index].phone,
      city: city !== undefined ? city.trim() : partners[index].city,
      tier: tier !== undefined ? tier : partners[index].tier,
      status: status !== undefined ? status : partners[index].status,
      totalCommission: updatedTotal,
      pendingCommission: updatedPending,
      updatedAt: new Date().toISOString(),
    };

    const saved = writePartners(partners);
    if (!saved) {
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan perubahan mitra." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data mitra berhasil diperbarui.",
      data: partners[index],
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
        { success: false, message: "ID mitra wajib disertakan." },
        { status: 400 }
      );
    }

    const partners = readPartners();
    const partnerToDelete = partners.find((p) => p.id === id);

    if (!partnerToDelete) {
      return NextResponse.json(
        { success: false, message: "Mitra tidak ditemukan." },
        { status: 404 }
      );
    }

    const filtered = partners.filter((p) => p.id !== id);
    const saved = writePartners(filtered);

    if (!saved) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus data mitra dari penyimpanan." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Mitra '${partnerToDelete.name}' berhasil dihapus.`,
      id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server.", error: String(error) },
      { status: 500 }
    );
  }
}
