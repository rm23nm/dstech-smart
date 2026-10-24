import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONTRACTS_FILE = path.join(process.cwd(), "src", "data", "dstech_contracts.json");
const USERS_FILE = path.join(process.cwd(), "src", "data", "dstech_users.json");

function readContractsData() {
  try {
    if (fs.existsSync(CONTRACTS_FILE)) {
      const data = fs.readFileSync(CONTRACTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_contracts.json:", err);
  }
  return { contracts: [] };
}

function writeContractsData(data: any) {
  try {
    fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_contracts.json:", err);
    return false;
  }
}

function syncUserAccount(contract: any, defaultPassword?: string) {
  try {
    if (!fs.existsSync(USERS_FILE)) return;
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    const email = contract.employeeEmail?.trim().toLowerCase();
    if (!email) return;

    const existingIndex = users.findIndex((u: any) => u.email?.toLowerCase() === email);

    if (existingIndex >= 0) {
      // Update existing user with contract expiry date
      users[existingIndex].expiresAt = contract.endDate || null;
      users[existingIndex].name = contract.employeeName || users[existingIndex].name;
      users[existingIndex].phone = contract.employeePhone || users[existingIndex].phone;
      users[existingIndex].contractId = contract.id;
      users[existingIndex].updatedAt = new Date().toISOString();
    } else {
      // Create new user account with expiresAt
      const newUser = {
        id: `dstech_usr_${Date.now()}`,
        name: contract.employeeName,
        email: email,
        role: "EMPLOYEE",
        password: defaultPassword || "dstech123",
        phone: contract.employeePhone || "",
        status: "ACTIVE",
        expiresAt: contract.endDate || null,
        contractId: contract.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(newUser);
    }

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error syncing user account with contract:", err);
  }
}

// GET: Ambil daftar kontrak
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const contractType = searchParams.get("type");
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.toLowerCase();

    const data = readContractsData();
    let result = data.contracts || [];

    if (category) {
      result = result.filter((c: any) => c.employeeCategory === category);
    }
    if (contractType) {
      result = result.filter((c: any) => c.contractType === contractType);
    }
    if (status) {
      result = result.filter((c: any) => c.status === status);
    }
    if (query) {
      result = result.filter(
        (c: any) =>
          c.employeeName?.toLowerCase().includes(query) ||
          c.contractNumber?.toLowerCase().includes(query) ||
          c.position?.toLowerCase().includes(query) ||
          c.employeeNik?.includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      total: result.length,
      contracts: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat kontrak kerja" },
      { status: 500 }
    );
  }
}

// POST: Buat kontrak kerja baru
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.employeeName || !body.position || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { success: false, message: "Nama karyawan, jabatan, tanggal mulai dan selesai wajib diisi" },
        { status: 400 }
      );
    }

    const data = readContractsData();
    const existing = data.contracts || [];

    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const seq = String(existing.length + 1).padStart(3, "0");
    const contractNumber = body.contractNumber || `PKWT/DST-HR/${yearMonth}/${seq}`;

    const newContract = {
      id: `dstech_contract_${Date.now()}`,
      contractNumber,
      employeeName: body.employeeName.trim(),
      employeeNik: body.employeeNik?.trim() || "",
      employeePhone: body.employeePhone?.trim() || "",
      employeeEmail: body.employeeEmail?.trim() || "",
      employeeAddress: body.employeeAddress?.trim() || "",
      position: body.position.trim(),
      department: body.department?.trim() || (body.employeeCategory === "STAFF" ? "Administrasi & Operasional" : "Teknisi Lapangan"),
      employeeCategory: body.employeeCategory || "TECHNICIAN", // "STAFF" | "TECHNICIAN"
      contractType: body.contractType || "DAILY", // "DAILY" | "MONTHLY" | "YEARLY"
      photoUrl: body.photoUrl || "",
      idCardUrl: body.idCardUrl || "",
      startDate: body.startDate,
      endDate: body.endDate,
      durationMonths: Number(body.durationMonths || 1),
      salaryScheme: body.salaryScheme || {},
      allowances: body.allowances || {},
      leavePolicy: body.leavePolicy || {},
      workSchedule: body.workSchedule || {},
      workLocation: body.workLocation || "Kantor Utama DSTech Cilegon",
      status: body.status || "PENDING_APPROVAL",
      approval: body.approval || (body.status === "ACTIVE" || body.status === "APPROVED" ? {
        status: "APPROVED",
        approvedBy: body.approvedBy || "RAMADHANI, ST",
        approvedTitle: "Direktur Utama",
        approvedAt: now.toISOString(),
        notes: body.approvalNotes || "Kontrak disetujui langsung",
      } : {
        status: "PENDING_APPROVAL",
        submittedAt: now.toISOString(),
        notes: "Menunggu peninjauan & persetujuan Direktur Utama",
      }),
      signedByFirstParty: body.signedByFirstParty || {
        name: "RAMADHANI, ST",
        title: "Direktur Utama",
        company: "PT. DSTech Smart Perkasa",
        signedAt: now.toISOString(),
      },
      signedBySecondParty: body.signedBySecondParty || {
        name: body.employeeName.trim(),
        title: body.position.trim(),
        signedAt: now.toISOString(),
      },
      notes: body.notes || "",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    existing.unshift(newContract);
    data.contracts = existing;
    writeContractsData(data);

    // Jika diminta sinkronisasi / buat akun login
    if (body.createLoginAccount && newContract.employeeEmail) {
      syncUserAccount(newContract, body.loginPassword);
    }

    return NextResponse.json({
      success: true,
      message: "Kontrak kerja berhasil dibuat dan diajukan untuk approval",
      contract: newContract,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat kontrak kerja" },
      { status: 500 }
    );
  }
}

// PUT: Perbarui kontrak kerja (Termasuk Aksi Approval, Reject, & Aktivasi)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json(
        { success: false, message: "ID kontrak kerja wajib disertakan" },
        { status: 400 }
      );
    }

    const data = readContractsData();
    const index = (data.contracts || []).findIndex((c: any) => c.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Kontrak kerja tidak ditemukan" },
        { status: 404 }
      );
    }

    let updatedContract = {
      ...data.contracts[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Alur Aksi Khusus Approval
    if (body.action === "APPROVE") {
      updatedContract.status = "APPROVED";
      updatedContract.approval = {
        status: "APPROVED",
        approvedBy: body.approvedBy || "RAMADHANI, ST",
        approvedTitle: "Direktur Utama",
        approvedAt: new Date().toISOString(),
        notes: body.approvalNotes || "Kontrak kerja disetujui untuk ditandatangani dan diberlakukan.",
      };
      if (body.signedByFirstParty) {
        updatedContract.signedByFirstParty = body.signedByFirstParty;
      }
    } else if (body.action === "REJECT") {
      updatedContract.status = "REJECTED";
      updatedContract.approval = {
        status: "REJECTED",
        rejectedBy: body.rejectedBy || "RAMADHANI, ST",
        rejectedTitle: "Direktur Utama",
        rejectedAt: new Date().toISOString(),
        notes: body.approvalNotes || "Kontrak kerja ditolak / dikembalikan untuk perbaikan data.",
      };
    } else if (body.action === "ACTIVATE") {
      updatedContract.status = "ACTIVE";
      updatedContract.activatedAt = new Date().toISOString();
    }

    data.contracts[index] = updatedContract;
    writeContractsData(data);

    // Sync expiry date if user account exists
    if (updatedContract.employeeEmail) {
      syncUserAccount(updatedContract);
    }

    let successMsg = "Kontrak kerja berhasil diperbarui";
    if (body.action === "APPROVE") successMsg = "Kontrak kerja berhasil DISETUJUI (APPROVED)!";
    else if (body.action === "REJECT") successMsg = "Kontrak kerja DIKEMBALIKAN (REJECTED) dengan catatan revisi.";
    else if (body.action === "ACTIVATE") successMsg = "Kontrak kerja berhasil DIAKTIFKAN!";

    return NextResponse.json({
      success: true,
      message: successMsg,
      contract: updatedContract,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui kontrak kerja" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus kontrak kerja
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID kontrak kerja wajib disertakan" },
        { status: 400 }
      );
    }

    const data = readContractsData();
    const initialLen = data.contracts?.length || 0;
    data.contracts = (data.contracts || []).filter((c: any) => c.id !== id);

    if (data.contracts.length === initialLen) {
      return NextResponse.json(
        { success: false, message: "Kontrak kerja tidak ditemukan" },
        { status: 404 }
      );
    }

    writeContractsData(data);

    return NextResponse.json({
      success: true,
      message: "Kontrak kerja berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus kontrak kerja" },
      { status: 500 }
    );
  }
}
