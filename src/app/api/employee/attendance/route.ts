import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_attendance.json");

function readAttendance() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_employee_attendance.json:", err);
  }
  return {
    monthlyStats: { totalHours: 168, overtimeHours: 14, targetHours: 160, presenceDays: 21, absentDays: 0 },
    attendance: [],
    overtime: [],
  };
}

function writeAttendance(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_employee_attendance.json:", err);
    return false;
  }
}

export async function GET() {
  const data = readAttendance();
  return NextResponse.json({
    success: true,
    ...data,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const data = readAttendance();

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
    const dateStr = now.toISOString().split("T")[0];

    if (action === "checkin") {
      const { location, notes } = body;
      const existingToday = data.attendance.find((a: any) => a.date === dateStr);

      if (existingToday) {
        existingToday.checkIn = timeStr;
        existingToday.location = location || existingToday.location || "Kantor DSTech";
        if (notes) existingToday.notes = notes;
      } else {
        const newRecord = {
          id: `dstech_att_${Date.now()}`,
          date: dateStr,
          employeeName: body.employeeName || "Ikhsan Maulidi",
          checkIn: timeStr,
          checkOut: "-",
          location: location || "Kantor DSTech",
          status: location?.toLowerCase().includes("kantor") ? "Tepat Waktu" : "Hadir Lapangan",
          notes: notes || "Absen masuk via portal teknisi",
        };
        data.attendance.unshift(newRecord);
        if (data.monthlyStats) data.monthlyStats.presenceDays += 1;
      }

      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: `Presensi Masuk berhasil dicatat (${timeStr})`,
        data: data.attendance[0],
      });
    }

    if (action === "checkout") {
      const { notes } = body;
      const existingToday = data.attendance.find((a: any) => a.date === dateStr);

      if (existingToday) {
        existingToday.checkOut = timeStr;
        if (notes) existingToday.notes = `${existingToday.notes ? existingToday.notes + " | " : ""}Laporan Pulang: ${notes}`;
      } else {
        const newRecord = {
          id: `dstech_att_${Date.now()}`,
          date: dateStr,
          employeeName: body.employeeName || "Ikhsan Maulidi",
          checkIn: "08:00 WIB",
          checkOut: timeStr,
          location: "Kantor DSTech",
          status: "Hadir",
          notes: notes || "Absen pulang via portal teknisi",
        };
        data.attendance.unshift(newRecord);
      }

      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: `Presensi Pulang berhasil dicatat (${timeStr})`,
        data: data.attendance[0],
      });
    }

    if (action === "overtime") {
      const { date, startTime, endTime, hours, taskTitle, reason } = body;

      if (!date || !startTime || !endTime || !hours) {
        return NextResponse.json({ success: false, error: "Mohon lengkapi jadwal dan durasi jam lembur" }, { status: 400 });
      }

      const newOT = {
        id: `dstech_ot_${Date.now()}`,
        employeeName: body.employeeName || "Ikhsan Maulidi",
        date,
        startTime,
        endTime,
        hours: Number(hours),
        taskTitle: taskTitle || "Penugasan Proyek Lapangan",
        reason: reason || "-",
        status: "Menunggu Persetujuan",
        appliedAt: `${dateStr} ${timeStr}`,
      };

      if (!data.overtime) data.overtime = [];
      data.overtime.unshift(newOT);

      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: "Permintaan lembur berhasil diajukan ke Team Leader / HR",
        data: newOT,
      });
    }

    return NextResponse.json({ success: false, error: "Action tidak dikenali" }, { status: 400 });
  } catch (err) {
    console.error("Error handling attendance:", err);
    return NextResponse.json({ success: false, error: "Gagal memproses data absensi" }, { status: 500 });
  }
}
