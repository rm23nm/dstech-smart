import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_attendance.json");
const USERS_FILE = path.join(process.cwd(), "src", "data", "dstech_users.json");

// Koordinat Resmi Kantor Pusat DSTech Cilegon
const OFFICE_LOCATION = {
  name: "Kantor Pusat PT DSTech Smart Perkasa (Cilegon)",
  latitude: -6.031846,
  longitude: 106.037198,
  defaultRadius: 100, // 100 meter
};

// Formula Haversine Akurat (menghitung jarak dua titik koordinat satelit dalam meter)
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Helper membaca kebijakan lokasi presensi staf dari database users
function getUserLocationPolicy(employeeName?: string, employeeEmail?: string) {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const users: any[] = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      const user = users.find((u) => {
        if (employeeEmail && u.email && u.email.toLowerCase() === employeeEmail.toLowerCase()) return true;
        if (employeeName && u.name && u.name.trim().toLowerCase() === employeeName.trim().toLowerCase()) return true;
        return false;
      });
      if (user) {
        return {
          locationLock: user.attendanceLocationLock || "ANY",
          officeRadius: user.officeRadius ? Number(user.officeRadius) : OFFICE_LOCATION.defaultRadius,
          userName: user.name,
        };
      }
    }
  } catch (e) {
    console.error("Error reading user policy for attendance:", e);
  }
  return {
    locationLock: "ANY",
    officeRadius: OFFICE_LOCATION.defaultRadius,
    userName: employeeName,
  };
}

const CONTRACTS_FILE = path.join(process.cwd(), "src", "data", "dstech_contracts.json");

// Helper sinkronisasi jadwal jam kerja dari kontrak kerja PKWT aktif
function getEmployeeContractSchedule(employeeName?: string) {
  try {
    if (fs.existsSync(CONTRACTS_FILE)) {
      const contracts: any[] = JSON.parse(fs.readFileSync(CONTRACTS_FILE, "utf-8"));
      if (Array.isArray(contracts) && employeeName) {
        const matched = contracts.find(
          (c) =>
            c.employeeName &&
            c.employeeName.trim().toLowerCase() === employeeName.trim().toLowerCase() &&
            c.status === "ACTIVE"
        );
        if (matched?.workSchedule?.startTime) {
          return {
            startTime: matched.workSchedule.startTime || "08:00",
            endTime: matched.workSchedule.endTime || "17:00",
            workDaysType: matched.workSchedule.workDaysType || "6_DAYS",
            hasContract: true,
            contractNumber: matched.contractNumber || null,
          };
        }
      }
    }
  } catch (err) {
    console.warn("Could not read contract workSchedule:", err);
  }
  return {
    startTime: "08:00",
    endTime: "17:00",
    workDaysType: "6_DAYS",
    hasContract: false,
    contractNumber: null,
  };
}

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
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}

function getWIBDateStr(d: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().split("T")[0];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const data = readAttendance();

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
    const dateStr = getWIBDateStr(now);
    const targetEmpName = (body.employeeName || "").trim().toLowerCase();
    const targetEmpEmail = (body.employeeEmail || "").trim().toLowerCase();

    if (action === "checkin") {
      const { location, notes, latitude, longitude, accuracy, mapsUrl, projectId, projectName, projectRole } = body;
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

      // 3. Validasi Geofencing: Jika staf terkunci di kantor, tolak jika di luar radius kantor
      const userPolicy = getUserLocationPolicy(body.employeeName, body.employeeEmail);
      const distanceToOffice = calculateDistanceMeters(
        Number(latitude),
        Number(longitude),
        OFFICE_LOCATION.latitude,
        OFFICE_LOCATION.longitude
      );

      if (userPolicy.locationLock === "OFFICE" && !body.isSuperAdminBypass) {
        if (distanceToOffice > userPolicy.officeRadius) {
          return NextResponse.json(
            {
              success: false,
              error: `Presensi Masuk DITOLAK: Anda berada di luar radius kantor resmi! Jarak Anda saat ini ${distanceToOffice} meter dari Kantor DSTech Cilegon (Batas maksimal: ${userPolicy.officeRadius} meter). Anda wajib berada di area kantor untuk melakukan presensi.`,
            },
            { status: 403 }
          );
        }
      }

      // 4. Sinkronisasi Jam Kerja dengan Kontrak PKWT Karyawan (Tepat Waktu vs Terlambat)
      const contractSched = getEmployeeContractSchedule(body.employeeName);
      const [schedHour, schedMin] = (contractSched.startTime || "08:00").split(":").map(Number);
      const schedTotalMin = (isNaN(schedHour) ? 8 : schedHour) * 60 + (isNaN(schedMin) ? 0 : schedMin);
      const nowTotalMin = now.getHours() * 60 + now.getMinutes();
      const lateMinutes = nowTotalMin - schedTotalMin;
      const isLate = lateMinutes > 5; // Toleransi dispensasi keterlambatan 5 menit

      let computedStatus = "Tepat Waktu";
      if (isLate) {
        computedStatus = `Terlambat (${lateMinutes}m)`;
      } else if (distanceToOffice <= userPolicy.officeRadius) {
        computedStatus = "Tepat Waktu";
      } else {
        computedStatus = "Hadir Lapangan";
      }

      // Cari record hari ini KHUSUS untuk karyawan/user yang sedang melakukan absensi
      const existingToday = data.attendance.find((a: any) => {
        const matchDate = a.date === dateStr;
        if (!matchDate) return false;
        const matchName = targetEmpName && a.employeeName && a.employeeName.trim().toLowerCase() === targetEmpName;
        const matchEmail = targetEmpEmail && a.employeeEmail && a.employeeEmail.trim().toLowerCase() === targetEmpEmail;
        return Boolean(matchName || matchEmail);
      });

      const computedMapsUrl = mapsUrl || (latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : null);
      let savedRecord: any = null;

      if (existingToday) {
        existingToday.checkIn = existingToday.checkIn || timeStr;
        existingToday.status = computedStatus;
        if (body.employeeEmail && !existingToday.employeeEmail) {
          existingToday.employeeEmail = body.employeeEmail;
        }
        if (projectId) existingToday.projectId = projectId;
        if (projectName) existingToday.projectName = projectName;
        if (projectRole) existingToday.projectRole = projectRole;
        // PENGUNCIAN KOORDINAT (IMMUTABLE): Jika koordinat masuk sudah terekam, kunci dan jangan ubah ke-2x!
        if (!existingToday.latitude || !existingToday.longitude) {
          existingToday.latitude = Number(latitude);
          existingToday.longitude = Number(longitude);
          existingToday.accuracy = accuracy || null;
          existingToday.mapsUrl = computedMapsUrl;
          existingToday.location = location || (distanceToOffice <= userPolicy.officeRadius ? "Kantor DSTech Cilegon" : `GPS Satelit (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`);
          existingToday.distanceToOffice = distanceToOffice;
          existingToday.geofenceLock = userPolicy.locationLock;
        }
        if (!existingToday.selfieCheckIn && selfieCheckIn) {
          existingToday.selfieCheckIn = selfieCheckIn;
        }
        if (notes) existingToday.notes = notes;
        savedRecord = existingToday;
      } else {
        const newRecord = {
          id: `dstech_att_${Date.now()}`,
          date: dateStr,
          employeeName: body.employeeName || "Teknisi Lapangan",
          employeeEmail: body.employeeEmail || null,
          checkIn: timeStr,
          checkOut: "-",
          projectId: projectId || null,
          projectName: projectName || null,
          projectRole: projectRole || null,
          location: location || (distanceToOffice <= userPolicy.officeRadius ? "Kantor DSTech Cilegon" : `GPS Satelit (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`),
          latitude: Number(latitude),
          longitude: Number(longitude),
          accuracy: accuracy || null,
          mapsUrl: computedMapsUrl,
          selfieCheckIn,
          distanceToOffice,
          geofenceLock: userPolicy.locationLock,
          status: computedStatus,
          notes: notes || `Absen masuk via GPS (${distanceToOffice}m dari kantor) & Foto Selfie terverifikasi`,
          isGpsLocked: true,
        };
        data.attendance.unshift(newRecord);
        if (data.monthlyStats) data.monthlyStats.presenceDays += 1;
        savedRecord = newRecord;
      }

      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: `Presensi Masuk terverifikasi GPS & Foto Selfie berhasil dicatat (${timeStr})`,
        data: savedRecord,
      });
    }

    if (action === "checkout") {
      const { notes, location, latitude, longitude, accuracy, mapsUrl, projectId, projectName, projectRole } = body;
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

      // 3. Validasi Geofencing Pulang: Jika staf terkunci kantor, tolak jika di luar radius
      const userPolicy = getUserLocationPolicy(body.employeeName, body.employeeEmail);
      const distanceToOffice = calculateDistanceMeters(
        Number(latitude),
        Number(longitude),
        OFFICE_LOCATION.latitude,
        OFFICE_LOCATION.longitude
      );

      if (userPolicy.locationLock === "OFFICE" && !body.isSuperAdminBypass) {
        if (distanceToOffice > userPolicy.officeRadius) {
          return NextResponse.json(
            {
              success: false,
              error: `Presensi Pulang DITOLAK: Anda berada di luar radius kantor resmi! Jarak Anda saat ini ${distanceToOffice} meter dari Kantor DSTech Cilegon (Batas maksimal: ${userPolicy.officeRadius} meter). Anda wajib berada di area kantor untuk melakukan presensi pulang.`,
            },
            { status: 403 }
          );
        }
      }

      // Cari record hari ini KHUSUS untuk karyawan/user yang sedang melakukan checkout
      const existingToday = data.attendance.find((a: any) => {
        const matchDate = a.date === dateStr;
        if (!matchDate) return false;
        const matchName = targetEmpName && a.employeeName && a.employeeName.trim().toLowerCase() === targetEmpName;
        const matchEmail = targetEmpEmail && a.employeeEmail && a.employeeEmail.trim().toLowerCase() === targetEmpEmail;
        return Boolean(matchName || matchEmail);
      });

      const computedMapsUrl = mapsUrl || (latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : null);
      let savedRecord: any = null;

      if (existingToday) {
        existingToday.checkOut = timeStr;
        if (body.employeeEmail && !existingToday.employeeEmail) {
          existingToday.employeeEmail = body.employeeEmail;
        }
        if (projectId) existingToday.projectId = projectId;
        if (projectName) existingToday.projectName = projectName;
        if (projectRole) existingToday.projectRole = projectRole;
        // PENGUNCIAN KOORDINAT PULANG: Jika sudah terekam, kunci dan jangan ubah ke-2x!
        if (!existingToday.checkOutLat || !existingToday.checkOutLng) {
          existingToday.checkOutLat = Number(latitude);
          existingToday.checkOutLng = Number(longitude);
          existingToday.checkOutAccuracy = accuracy || null;
          existingToday.checkOutMapsUrl = computedMapsUrl;
          existingToday.checkOutLocation = location || (distanceToOffice <= userPolicy.officeRadius ? "Kantor DSTech Cilegon" : `GPS Satelit (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`);
          existingToday.checkOutDistanceToOffice = distanceToOffice;
        }
        if (!existingToday.selfieCheckOut && selfieCheckOut) {
          existingToday.selfieCheckOut = selfieCheckOut;
        }
        if (notes) existingToday.notes = `${existingToday.notes ? existingToday.notes + " | " : ""}Laporan Pulang: ${notes}`;
        savedRecord = existingToday;
      } else {
        const newRecord = {
          id: `dstech_att_${Date.now()}`,
          date: dateStr,
          employeeName: body.employeeName || "Teknisi Lapangan",
          employeeEmail: body.employeeEmail || null,
          checkIn: "08:00 WIB",
          checkOut: timeStr,
          projectId: projectId || null,
          projectName: projectName || null,
          projectRole: projectRole || null,
          location: `GPS Satelit (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`,
          checkOutLocation: location || (distanceToOffice <= userPolicy.officeRadius ? "Kantor DSTech Cilegon" : `GPS Satelit (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`),
          checkOutLat: Number(latitude),
          checkOutLng: Number(longitude),
          checkOutAccuracy: accuracy || null,
          checkOutMapsUrl: computedMapsUrl,
          checkOutDistanceToOffice: distanceToOffice,
          selfieCheckOut,
          status: "Hadir",
          notes: notes || `Absen pulang via GPS (${distanceToOffice}m dari kantor) & Foto Selfie terverifikasi`,
          isGpsLocked: true,
        };
        data.attendance.unshift(newRecord);
        savedRecord = newRecord;
      }

      writeAttendance(data);
      return NextResponse.json({
        success: true,
        message: `Presensi Pulang terverifikasi GPS & Foto Selfie berhasil dicatat (${timeStr})`,
        data: savedRecord,
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
