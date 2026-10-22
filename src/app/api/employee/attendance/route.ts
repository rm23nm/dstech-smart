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
      const { location, notes, latitude, longitude, accuracy, mapsUrl } = body;
      const existingToday = data.attendance.find((a: any) => a.date === dateStr);
      const computedMapsUrl = mapsUrl || (latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : null);

      if (existingToday) {
        existingToday.checkIn = timeStr;
        existingToday.location = location || existingToday.location || "Kantor DSTech Smart Perkasa (Cilegon)";
        if (latitude && longitude) {
          existingToday.latitude = latitude;
          existingToday.longitude = longitude;
          existingToday.accuracy = accuracy || null;
          existingToday.mapsUrl = computedMapsUrl;
        }
        if (notes) existingToday.notes = notes;
      } else {
        const newRecord = {
          id: `dstech_att_${Date.now()}`,
          date: dateStr,
          employeeName: body.employeeName || "Teknisi Lapangan",
          checkIn: timeStr,
          checkOut: "-",
          location: location || "Kantor DSTech Smart Perkasa (Cilegon)",
          latitude: latitude || null,
          longitude: longitude || null,
          accuracy: accuracy || null,
          mapsUrl: computedMapsUrl,
          status: location?.toLowerCase().includes("kantor") ? "Tepat Waktu" : "Hadir Lapangan",
          notes: notes || "Absen masuk via portal teknisi (Google Maps Verified)",
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
      const { notes, location, latitude, longitude, accuracy, mapsUrl } = body;
      const existingToday = data.attendance.find((a: any) => a.date === dateStr);
      const computedMapsUrl = mapsUrl || (latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : null);

      if (existingToday) {
        existingToday.checkOut = timeStr;
        if (location) existingToday.checkOutLocation = location;
        if (latitude && longitude) {
          existingToday.checkOutLat = latitude;
          existingToday.checkOutLng = longitude;
          existingToday.checkOutAccuracy = accuracy || null;
          existingToday.checkOutMapsUrl = computedMapsUrl;
        }
        if (notes) existingToday.notes = `${existingToday.notes ? existingToday.notes + " | " : ""}Laporan Pulang: ${notes}`;
      } else {
        const newRecord = {
          id: `dstech_att_${Date.now()}`,
          date: dateStr,
          employeeName: body.employeeName || "Teknisi Lapangan",
          checkIn: "08:00 WIB",
          checkOut: timeStr,
          location: location || "Kantor DSTech Smart Perkasa (Cilegon)",
          checkOutLocation: location || "Kantor DSTech Smart Perkasa (Cilegon)",
          checkOutLat: latitude || null,
          checkOutLng: longitude || null,
          checkOutAccuracy: accuracy || null,
          checkOutMapsUrl: computedMapsUrl,
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
        employeeName: body.employeeName || "Teknisi Lapangan",
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

    if (action === "admin_add") {
      const {
        employeeName,
        date,
        checkIn,
        checkOut,
        location,
        status,
        notes,
        latitude,
        longitude,
        mapsUrl,
      } = body;

      if (!employeeName || !date) {
        return NextResponse.json(
          { success: false, error: "Nama staf dan tanggal presensi wajib diisi" },
          { status: 400 }
        );
      }

      const computedMapsUrl =
        mapsUrl ||
        (latitude && longitude
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : null);

      const newRecord = {
        id: `dstech_att_${Date.now()}`,
        date,
        employeeName,
        checkIn: checkIn || "08:00 WIB",
        checkOut: checkOut || "-",
        location: location || "Kantor DSTech Smart Perkasa (Cilegon)",
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        accuracy: body.accuracy || 10,
        mapsUrl: computedMapsUrl,
        status: status || "Hadir",
        notes: notes || "Input manual via Admin Control Center",
      };

      if (!data.attendance) data.attendance = [];
      data.attendance.unshift(newRecord);
      if (data.monthlyStats) data.monthlyStats.presenceDays += 1;

      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: "Data absensi berhasil ditambahkan oleh Admin",
        data: newRecord,
      });
    }

    return NextResponse.json({ success: false, error: "Action tidak dikenali" }, { status: 400 });
  } catch (err) {
    console.error("Error handling attendance POST:", err);
    return NextResponse.json({ success: false, error: "Gagal memproses data absensi" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, id } = body;
    const data = readAttendance();

    // 1. Persetujuan / Penolakan Lembur
    if (action === "approve_overtime") {
      const ot = (data.overtime || []).find((o: any) => o.id === id);
      if (!ot) {
        return NextResponse.json({ success: false, error: "Data pengajuan lembur tidak ditemukan" }, { status: 404 });
      }
      ot.status = "Disetujui";
      ot.reviewedAt = new Date().toISOString();
      ot.reviewedBy = body.reviewedBy || "Super Admin DStech";
      if (data.monthlyStats && ot.hours) {
        data.monthlyStats.overtimeHours = (data.monthlyStats.overtimeHours || 0) + Number(ot.hours);
      }
      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: "Pengajuan lembur berhasil disetujui",
        data: ot,
      });
    }

    if (action === "reject_overtime") {
      const ot = (data.overtime || []).find((o: any) => o.id === id);
      if (!ot) {
        return NextResponse.json({ success: false, error: "Data pengajuan lembur tidak ditemukan" }, { status: 404 });
      }
      ot.status = "Ditolak";
      ot.rejectionReason = body.rejectionReason || "Pengajuan lembur tidak memenuhi kriteria penugasan";
      ot.reviewedAt = new Date().toISOString();
      ot.reviewedBy = body.reviewedBy || "Super Admin DStech";
      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: "Pengajuan lembur telah ditolak",
        data: ot,
      });
    }

    // 2. Koreksi / Update Data Absensi
    if (action === "update_attendance" || (id && id.startsWith("dstech_att_"))) {
      const att = (data.attendance || []).find((a: any) => a.id === id);
      if (!att) {
        return NextResponse.json({ success: false, error: "Catatan absensi tidak ditemukan" }, { status: 404 });
      }

      if (body.employeeName) att.employeeName = body.employeeName;
      if (body.date) att.date = body.date;
      if (body.checkIn) att.checkIn = body.checkIn;
      if (body.checkOut !== undefined) att.checkOut = body.checkOut;
      if (body.location) att.location = body.location;
      if (body.status) att.status = body.status;
      if (body.notes !== undefined) att.notes = body.notes;
      if (body.latitude !== undefined) att.latitude = body.latitude ? Number(body.latitude) : null;
      if (body.longitude !== undefined) att.longitude = body.longitude ? Number(body.longitude) : null;
      if (body.mapsUrl !== undefined) att.mapsUrl = body.mapsUrl;
      if (body.checkOutLocation !== undefined) att.checkOutLocation = body.checkOutLocation;
      if (body.checkOutLat !== undefined) att.checkOutLat = body.checkOutLat ? Number(body.checkOutLat) : null;
      if (body.checkOutLng !== undefined) att.checkOutLng = body.checkOutLng ? Number(body.checkOutLng) : null;
      if (body.checkOutMapsUrl !== undefined) att.checkOutMapsUrl = body.checkOutMapsUrl;

      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: "Catatan absensi berhasil diperbarui",
        data: att,
      });
    }

    // 3. Update Ringkasan Metrik Bulanan
    if (action === "update_stats" && body.monthlyStats) {
      data.monthlyStats = { ...data.monthlyStats, ...body.monthlyStats };
      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: "Statistik kehadiran bulanan berhasil diperbarui",
        data: data.monthlyStats,
      });
    }

    return NextResponse.json({ success: false, error: "Action PUT tidak dikenali" }, { status: 400 });
  } catch (err) {
    console.error("Error in attendance PUT:", err);
    return NextResponse.json({ success: false, error: "Gagal memperbarui data absensi" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID data wajib disertakan" }, { status: 400 });
    }

    const data = readAttendance();

    if (id.startsWith("dstech_att_")) {
      const initialLen = (data.attendance || []).length;
      data.attendance = (data.attendance || []).filter((a: any) => a.id !== id);
      if (data.attendance.length === initialLen) {
        return NextResponse.json({ success: false, error: "Data absensi tidak ditemukan" }, { status: 404 });
      }
      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: "Catatan absensi berhasil dihapus",
      });
    }

    if (id.startsWith("dstech_ot_")) {
      const initialLen = (data.overtime || []).length;
      data.overtime = (data.overtime || []).filter((o: any) => o.id !== id);
      if (data.overtime.length === initialLen) {
        return NextResponse.json({ success: false, error: "Data lembur tidak ditemukan" }, { status: 404 });
      }
      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: "Pengajuan lembur berhasil dihapus",
      });
    }

    return NextResponse.json({ success: false, error: "Format ID tidak dikenali" }, { status: 400 });
  } catch (err) {
    console.error("Error in attendance DELETE:", err);
    return NextResponse.json({ success: false, error: "Gagal menghapus data absensi" }, { status: 500 });
  }
}
