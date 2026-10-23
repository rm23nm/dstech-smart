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
      const selfieCheckIn = body.selfieCheckIn || body.selfiePhoto || null;

      // 1. Validasi Wajib Koordinat GPS (Input manual dilarang!)
      if (latitude === undefined || latitude === null || longitude === undefined || longitude === null || latitude === "" || longitude === "") {
        return NextResponse.json(
          {
            success: false,
            error: "Presensi Masuk DITOLAK: Sinyal GPS satelit wajib aktif dan terdeteksi akurat. Input manual lokasi dilarang!",
          },
          { status: 400 }
        );
      }

      // 2. Validasi Wajib Foto Selfie (kecuali bypass superadmin via dashboard admin)
      if (!selfieCheckIn && !body.isSuperAdminBypass) {
        return NextResponse.json(
          {
            success: false,
            error: "Presensi Masuk DITOLAK: Wajib mengambil foto selfie wajah langsung via kamera perangkat!",
          },
          { status: 400 }
        );
      }

      const existingToday = data.attendance.find((a: any) => a.date === dateStr);
      const computedMapsUrl = mapsUrl || (latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : null);

      if (existingToday) {
        existingToday.checkIn = existingToday.checkIn || timeStr;
        // PENGUNCIAN KOORDINAT (IMMUTABLE): Jika koordinat masuk sudah terekam, kunci dan jangan ubah ke-2x!
        if (!existingToday.latitude || !existingToday.longitude) {
          existingToday.latitude = Number(latitude);
          existingToday.longitude = Number(longitude);
          existingToday.accuracy = accuracy || null;
          existingToday.mapsUrl = computedMapsUrl;
          existingToday.location = location || `GPS Satelit (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`;
        }
        if (!existingToday.selfieCheckIn && selfieCheckIn) {
          existingToday.selfieCheckIn = selfieCheckIn;
        }
        if (notes) existingToday.notes = notes;
      } else {
        const newRecord = {
          id: `dstech_att_${Date.now()}`,
          date: dateStr,
          employeeName: body.employeeName || "Teknisi Lapangan",
          checkIn: timeStr,
          checkOut: "-",
          location: location || `GPS Satelit (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`,
          latitude: Number(latitude),
          longitude: Number(longitude),
          accuracy: accuracy || null,
          mapsUrl: computedMapsUrl,
          selfieCheckIn,
          status: location?.toLowerCase().includes("kantor") ? "Tepat Waktu" : "Hadir Lapangan",
          notes: notes || "Absen masuk via GPS & Kamera Selfie terverifikasi",
          isGpsLocked: true,
        };
        data.attendance.unshift(newRecord);
        if (data.monthlyStats) data.monthlyStats.presenceDays += 1;
      }

      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: `Presensi Masuk terverifikasi GPS & Foto Selfie berhasil dicatat (${timeStr})`,
        data: data.attendance[0],
      });
    }

    if (action === "checkout") {
      const { notes, location, latitude, longitude, accuracy, mapsUrl } = body;
      const selfieCheckOut = body.selfieCheckOut || body.selfiePhoto || null;

      // 1. Validasi Wajib Koordinat GPS Pulang (Input manual dilarang!)
      if (latitude === undefined || latitude === null || longitude === undefined || longitude === null || latitude === "" || longitude === "") {
        return NextResponse.json(
          {
            success: false,
            error: "Presensi Pulang DITOLAK: Sinyal GPS satelit posisi pulang wajib aktif. Input manual dilarang!",
          },
          { status: 400 }
        );
      }

      // 2. Validasi Wajib Foto Selfie Pulang (kecuali bypass superadmin)
      if (!selfieCheckOut && !body.isSuperAdminBypass) {
        return NextResponse.json(
          {
            success: false,
            error: "Presensi Pulang DITOLAK: Wajib mengambil foto selfie pulang langsung via kamera perangkat!",
          },
          { status: 400 }
        );
      }

      const existingToday = data.attendance.find((a: any) => a.date === dateStr);
      const computedMapsUrl = mapsUrl || (latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : null);

      if (existingToday) {
        existingToday.checkOut = timeStr;
        // PENGUNCIAN KOORDINAT PULANG: Jika sudah terekam, kunci dan jangan ubah ke-2x!
        if (!existingToday.checkOutLat || !existingToday.checkOutLng) {
          existingToday.checkOutLat = Number(latitude);
          existingToday.checkOutLng = Number(longitude);
          existingToday.checkOutAccuracy = accuracy || null;
          existingToday.checkOutMapsUrl = computedMapsUrl;
          existingToday.checkOutLocation = location || `GPS Satelit (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`;
        }
        if (!existingToday.selfieCheckOut && selfieCheckOut) {
          existingToday.selfieCheckOut = selfieCheckOut;
        }
        if (notes) existingToday.notes = `${existingToday.notes ? existingToday.notes + " | " : ""}Laporan Pulang: ${notes}`;
      } else {
        const newRecord = {
          id: `dstech_att_${Date.now()}`,
          date: dateStr,
          employeeName: body.employeeName || "Teknisi Lapangan",
          checkIn: "08:00 WIB",
          checkOut: timeStr,
          location: `GPS Satelit (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`,
          checkOutLocation: location || `GPS Satelit (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`,
          checkOutLat: Number(latitude),
          checkOutLng: Number(longitude),
          checkOutAccuracy: accuracy || null,
          checkOutMapsUrl: computedMapsUrl,
          selfieCheckOut,
          status: "Hadir",
          notes: notes || "Absen pulang via GPS & Kamera Selfie terverifikasi",
          isGpsLocked: true,
        };
        data.attendance.unshift(newRecord);
      }

      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: `Presensi Pulang terverifikasi GPS & Foto Selfie berhasil dicatat (${timeStr})`,
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

      // INTEGRITY CHECK: KUNCI KOORDINAT AGAR TIDAK DAPAT DIUBAH KE-2X
      if (att.latitude && body.latitude !== undefined && Number(body.latitude) !== Number(att.latitude)) {
        return NextResponse.json(
          {
            success: false,
            error: "Pelanggaran Integritas: Koordinat GPS Masuk sudah terkunci permanen dan dilarang diubah ke-2x!",
          },
          { status: 403 }
        );
      }

      if (att.checkOutLat && body.checkOutLat !== undefined && Number(body.checkOutLat) !== Number(att.checkOutLat)) {
        return NextResponse.json(
          {
            success: false,
            error: "Pelanggaran Integritas: Koordinat GPS Pulang sudah terkunci permanen dan dilarang diubah ke-2x!",
          },
          { status: 403 }
        );
      }

      if (body.employeeName) att.employeeName = body.employeeName;
      if (body.date) att.date = body.date;
      if (body.checkIn) att.checkIn = body.checkIn;
      if (body.checkOut !== undefined) att.checkOut = body.checkOut;
      if (body.location) att.location = body.location;
      if (body.status) att.status = body.status;
      if (body.notes !== undefined) att.notes = body.notes;
      // Hanya izinkan mengisi koordinat jika sebelumnya memang kosong
      if (!att.latitude && body.latitude) att.latitude = Number(body.latitude);
      if (!att.longitude && body.longitude) att.longitude = Number(body.longitude);
      if (!att.mapsUrl && body.mapsUrl) att.mapsUrl = body.mapsUrl;
      if (body.checkOutLocation !== undefined) att.checkOutLocation = body.checkOutLocation;
      if (!att.checkOutLat && body.checkOutLat) att.checkOutLat = Number(body.checkOutLat);
      if (!att.checkOutLng && body.checkOutLng) att.checkOutLng = Number(body.checkOutLng);
      if (!att.checkOutMapsUrl && body.checkOutMapsUrl) att.checkOutMapsUrl = body.checkOutMapsUrl;
      if (body.selfieCheckIn && !att.selfieCheckIn) att.selfieCheckIn = body.selfieCheckIn;
      if (body.selfieCheckOut && !att.selfieCheckOut) att.selfieCheckOut = body.selfieCheckOut;

      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: "Catatan absensi berhasil diperbarui (Koordinat GPS terkunci permanen)",
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
