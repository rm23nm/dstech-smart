import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const leavesFilePath = path.join(process.cwd(), "src", "data", "dstech_leaves.json");
const contractsFilePath = path.join(process.cwd(), "src", "data", "dstech_contracts.json");
const attendanceFilePath = path.join(process.cwd(), "src", "data", "dstech_employee_attendance.json");
const usersFilePath = path.join(process.cwd(), "src", "data", "dstech_users.json");

interface LeaveItem {
  id: string;
  employeeName: string;
  employeeEmail?: string;
  department?: string;
  type: "ANNUAL_LEAVE" | "SPECIAL_PERMISSION" | "SICK_LEAVE";
  typeLabel: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentUrl?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

function getLeavesData(): LeaveItem[] {
  try {
    if (fs.existsSync(leavesFilePath)) {
      const raw = fs.readFileSync(leavesFilePath, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.leaves) ? parsed.leaves : [];
    }
  } catch (err) {
    console.error("Error reading dstech_leaves.json:", err);
  }
  return [];
}

function saveLeavesData(leaves: LeaveItem[]) {
  try {
    fs.writeFileSync(leavesFilePath, JSON.stringify({ leaves }, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing dstech_leaves.json:", err);
  }
}

function getEmployeeContracts(): any[] {
  try {
    if (fs.existsSync(contractsFilePath)) {
      const raw = fs.readFileSync(contractsFilePath, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.contracts) ? parsed.contracts : [];
    }
  } catch (err) {
    console.error("Error reading dstech_contracts.json:", err);
  }
  return [];
}

function syncApprovedLeaveToAttendance(leave: LeaveItem) {
  try {
    if (!fs.existsSync(attendanceFilePath)) return;
    const raw = fs.readFileSync(attendanceFilePath, "utf8");
    const parsed = JSON.parse(raw);
    const attendanceList = Array.isArray(parsed.attendance) ? parsed.attendance : [];

    // Parse start and end date
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const cur = new Date(start);

    const statusLabel = leave.type === "ANNUAL_LEAVE" ? "Cuti" : leave.type === "SICK_LEAVE" ? "Sakit" : "Izin";

    while (cur <= end) {
      // Lewati hari Minggu (opsional jika libur)
      const dateStr = cur.toISOString().split("T")[0];
      const existingIdx = attendanceList.findIndex(
        (a: any) => a.date === dateStr && a.employeeName.toLowerCase() === leave.employeeName.toLowerCase()
      );

      const record = {
        id: `dstech_att_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        date: dateStr,
        employeeName: leave.employeeName,
        checkIn: "08:00 WIB",
        checkOut: "17:00 WIB",
        location: "Dispensasi Izin/Cuti Resmi",
        status: statusLabel,
        notes: `${leave.typeLabel}: ${leave.reason || "Pengajuan resmi terverifikasi"}${leave.attachmentUrl ? " (Lampiran Bukti Terverifikasi)" : ""}`,
      };

      if (existingIdx >= 0) {
        attendanceList[existingIdx] = { ...attendanceList[existingIdx], ...record, id: attendanceList[existingIdx].id };
      } else {
        attendanceList.unshift(record);
      }

      cur.setDate(cur.getDate() + 1);
    }

    parsed.attendance = attendanceList;
    fs.writeFileSync(attendanceFilePath, JSON.stringify(parsed, null, 2), "utf8");
  } catch (err) {
    console.error("Gagal menyinkronkan cuti ke absensi harian:", err);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeName = searchParams.get("employeeName");

    const allLeaves = getLeavesData();
    const contracts = getEmployeeContracts();

    // Helper calculate quota for an employee
    const calculateQuota = (name: string) => {
      const contract = contracts.find((c: any) => c.employeeName?.toLowerCase() === name?.toLowerCase());
      const annualQuota = contract?.leavePolicy?.annualLeaveDays ?? 12;
      const paidPermissionQuota = contract?.leavePolicy?.paidPermissionDays ?? 3;

      const currentYear = new Date().getFullYear().toString();
      const approvedAnnualLeaves = allLeaves.filter(
        (l) =>
          l.employeeName?.toLowerCase() === name?.toLowerCase() &&
          l.type === "ANNUAL_LEAVE" &&
          l.status === "APPROVED" &&
          l.startDate.startsWith(currentYear)
      );

      const usedDays = approvedAnnualLeaves.reduce((sum, l) => sum + (l.totalDays || 1), 0);
      const remainingDays = Math.max(0, annualQuota - usedDays);

      return {
        annualQuota,
        paidPermissionQuota,
        usedDays,
        remainingDays,
      };
    };

    if (employeeName) {
      const userLeaves = allLeaves.filter(
        (l) => l.employeeName?.toLowerCase() === employeeName.toLowerCase()
      );
      const quota = calculateQuota(employeeName);

      return NextResponse.json({
        success: true,
        leaves: userLeaves,
        quota,
      });
    }

    // Jika tanpa parameter employeeName, kembalikan semua data dan rekap per karyawan (untuk Admin)
    // Ambil daftar karyawan unik dari kontrak atau users
    let employeeList: any[] = [];
    if (fs.existsSync(usersFilePath)) {
      try {
        const rawUsers = fs.readFileSync(usersFilePath, "utf8");
        const parsedUsers = JSON.parse(rawUsers);
        employeeList = parsedUsers.map((u: any) => ({
          name: u.name,
          email: u.email,
          role: u.role,
        }));
      } catch (e) {}
    }

    // Gabungkan dengan contracts jika ada
    contracts.forEach((c) => {
      if (!employeeList.some((e) => e.name?.toLowerCase() === c.employeeName?.toLowerCase())) {
        employeeList.push({
          name: c.employeeName,
          email: c.employeeEmail,
          role: c.employeeCategory,
        });
      }
    });

    const employeeQuotas = employeeList.map((emp) => {
      const q = calculateQuota(emp.name);
      return {
        employeeName: emp.name,
        employeeEmail: emp.email,
        department: contracts.find((c: any) => c.employeeName?.toLowerCase() === emp.name?.toLowerCase())?.department || "Operasional",
        ...q,
      };
    });

    return NextResponse.json({
      success: true,
      leaves: allLeaves,
      employeeQuotas,
    });
  } catch (error) {
    console.error("GET /api/employee/leave error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeName, employeeEmail, department, type, startDate, endDate, totalDays, reason, attachmentUrl } = body;

    if (!employeeName || !type || !startDate || !endDate || !reason) {
      return NextResponse.json({ success: false, message: "Mohon lengkapi formulir pengajuan cuti/izin/sakit" }, { status: 400 });
    }

    const typeLabels: Record<string, string> = {
      ANNUAL_LEAVE: "Cuti Tahunan",
      SPECIAL_PERMISSION: "Izin Khusus",
      SICK_LEAVE: "Izin Sakit",
    };

    const newLeave: LeaveItem = {
      id: `dstech_leave_${Date.now()}`,
      employeeName,
      employeeEmail: employeeEmail || "",
      department: department || "Operasional",
      type: type as any,
      typeLabel: typeLabels[type] || "Cuti/Izin",
      startDate,
      endDate,
      totalDays: Number(totalDays) || 1,
      reason,
      attachmentUrl: attachmentUrl || null,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    const leaves = getLeavesData();
    leaves.unshift(newLeave);
    saveLeavesData(leaves);

    return NextResponse.json({
      success: true,
      message: `Pengajuan ${newLeave.typeLabel} berhasil dikirim dan menunggu persetujuan HRD/Pimpinan.`,
      leave: newLeave,
    });
  } catch (error) {
    console.error("POST /api/employee/leave error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan pengajuan cuti" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, action, reviewerName, rejectionReason } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, message: "ID pengajuan dan aksi diperlukan" }, { status: 400 });
    }

    const leaves = getLeavesData();
    const targetIdx = leaves.findIndex((l) => l.id === id);

    if (targetIdx === -1) {
      return NextResponse.json({ success: false, message: "Pengajuan tidak ditemukan" }, { status: 404 });
    }

    const currentLeave = leaves[targetIdx];

    if (action === "approve") {
      currentLeave.status = "APPROVED";
      currentLeave.approvedBy = reviewerName || "RAMADHANI, ST";
      currentLeave.approvedAt = new Date().toISOString();
      currentLeave.rejectionReason = null;

      // Auto-sync ke rekod absensi harian
      syncApprovedLeaveToAttendance(currentLeave);
    } else if (action === "reject") {
      currentLeave.status = "REJECTED";
      currentLeave.rejectionReason = rejectionReason || "Pengajuan belum dapat disetujui";
    }

    leaves[targetIdx] = currentLeave;
    saveLeavesData(leaves);

    return NextResponse.json({
      success: true,
      message: `Pengajuan ${currentLeave.typeLabel} milik ${currentLeave.employeeName} berhasil ${action === "approve" ? "disetujui" : "ditolak"}.`,
      leave: currentLeave,
    });
  } catch (error) {
    console.error("PUT /api/employee/leave error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui status pengajuan" }, { status: 500 });
  }
}
