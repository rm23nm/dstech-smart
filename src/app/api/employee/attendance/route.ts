import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_attendance.json");
const USERS_FILE = path.join(process.cwd(), "src", "data", "dstech_users.json");
const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "dstech_settings.json");
const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
const TASKS_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_tasks.json");

// Helper membaca pengaturan lokasi GPS kantor & radius geofencing secara dinamis dari database settings
function getOfficeLocationSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        name: parsed.officeName || "Kantor Pusat PT DSTech Smart Perkasa (Cilegon)",
        latitude: typeof parsed.officeLatitude === "number" ? parsed.officeLatitude : -6.031846,
        longitude: typeof parsed.officeLongitude === "number" ? parsed.officeLongitude : 106.037198,
        defaultRadius: typeof parsed.geofenceRadiusMeters === "number" ? parsed.geofenceRadiusMeters : 250,
        address: parsed.officeAddress || parsed.address || "PERUM BUKIT CILEGON ASRI BLOK DB NO. 19, KEL. BAGENDUNG, KEC. CILEGON",
        allowFlexibleAttendance: parsed.allowFlexibleAttendance ?? true,
        projectLocations: Array.isArray(parsed.projectLocations) ? parsed.projectLocations : []
      };
    }
  } catch (err) {
    console.error("Error reading office location settings:", err);
  }
  return {
    name: "Kantor Pusat PT DSTech Smart Perkasa (Cilegon)",
    latitude: -6.031846,
    longitude: 106.037198,
    defaultRadius: 250,
    address: "PERUM BUKIT CILEGON ASRI BLOK DB NO. 19, KEL. BAGENDUNG, KEC. CILEGON",
    allowFlexibleAttendance: true,
    projectLocations: []
  };
}

// Helper mencari koordinat GPS titik proyek dari daftar proyek finance atau tiket penugasan
function findProjectCoordinates(projectId?: string | null, projectName?: string | null) {
  if (!projectId && !projectName) return null;
  const pId = (projectId || "").trim().toLowerCase();
  const pName = (projectName || "").trim().toLowerCase();

  // 1. Cek dari projectLocations di settings
  const officeConfig = getOfficeLocationSettings();
  if (Array.isArray(officeConfig.projectLocations)) {
    const matched = officeConfig.projectLocations.find((p: any) =>
      (p.id && p.id.toLowerCase() === pId) ||
      (p.name && p.name.toLowerCase() === pName) ||
      (p.clientName && p.clientName.toLowerCase() === pName)
    );
    if (matched && typeof matched.latitude === "number" && typeof matched.longitude === "number") {
      return {
        name: matched.name,
        latitude: matched.latitude,
        longitude: matched.longitude,
        radiusMeters: matched.radiusMeters || 350,
        source: "settings_preset"
      };
    }
  }

  // 2. Cek dari dstech_employee_tasks.json
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, "utf-8"));
      if (Array.isArray(tasks)) {
        const matched = tasks.find((t: any) =>
          (t.id && t.id.toLowerCase() === pId) ||
          (t.ticketNumber && t.ticketNumber.toLowerCase() === pId) ||
          (t.title && t.title.toLowerCase().includes(pName)) ||
          (t.client && t.client.toLowerCase().includes(pName))
        );
        if (matched && typeof matched.latitude === "number" && typeof matched.longitude === "number" && matched.latitude !== 0) {
          return {
            name: matched.title || matched.client || "Proyek Penugasan",
            latitude: matched.latitude,
            longitude: matched.longitude,
            radiusMeters: matched.radiusMeters || 350,
            source: "task_location"
          };
        }
      }
    }
  } catch (e) {
    console.warn("Could not read tasks for project coordinates:", e);
  }

  // 3. Cek dari dstech_finance_erp.json -> projects
  try {
    if (fs.existsSync(FINANCE_FILE)) {
      const fin = JSON.parse(fs.readFileSync(FINANCE_FILE, "utf-8"));
      if (Array.isArray(fin.projects)) {
        const matched = fin.projects.find((p: any) =>
          (p.id && p.id.toLowerCase() === pId) ||
          (p.projectCode && p.projectCode.toLowerCase() === pId) ||
          (p.projectName && p.projectName.toLowerCase() === pName)
        );
        if (matched && typeof matched.latitude === "number" && typeof matched.longitude === "number" && matched.latitude !== 0) {
          return {
            name: matched.projectName || "Proyek ERP",
            latitude: matched.latitude,
            longitude: matched.longitude,
            radiusMeters: matched.radiusMeters || 350,
            source: "finance_project"
          };
        }
      }
    }
  } catch (e) {
    console.warn("Could not read finance projects for coordinates:", e);
  }

  return null;
}

// Formula Haversine Akurat (menghitung jarak dua titik koordinat satelit dalam meter)
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
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
  const officeConfig = getOfficeLocationSettings();
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
          officeRadius: user.officeRadius ? Number(user.officeRadius) : officeConfig.defaultRadius,
          userName: user.name,
        };
      }
    }
  } catch (e) {
    console.error("Error reading user policy for attendance:", e);
  }
  return {
    locationLock: "ANY",
    officeRadius: officeConfig.defaultRadius,
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

// Helper konversi string jam "HH:mm" atau "HH:mm WIB" ke total menit
function parseTimeToMinutes(timeStr?: string | null): number {
  if (!timeStr) return 0;
  const clean = timeStr.replace(/WIB/i, "").trim();
  const parts = clean.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

// Helper mendapatkan waktu menit saat ini di zona waktu WIB (Asia/Jakarta)
function getWibCurrentMinutes(now: Date = new Date()): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    return h * 60 + m;
  } catch {
    return now.getHours() * 60 + now.getMinutes();
  }
}

// Helper pemeriksaan dan auto-close otomatis jika staf telat absen pulang > 1 jam dari batas jam kerja
function checkAndApplyAutoClose(data: any): boolean {
  if (!data || !Array.isArray(data.attendance)) return false;

  const now = new Date();
  const todayStr = getWIBDateStr(now);
  const currentWibMinutes = getWibCurrentMinutes(now);
  let hasModified = false;

  for (const record of data.attendance) {
    // Periksa record yang sudah checkIn tapi belum checkOut dan belum di-auto close
    const hasCheckIn = record.checkIn && record.checkIn !== "-";
    const hasNotCheckOut = !record.checkOut || record.checkOut === "-";

    if (hasCheckIn && hasNotCheckOut && !record.isAutoClosed && record.status !== "Tidak Absen Pulang") {
      const schedule = getEmployeeContractSchedule(record.employeeName);
      const endWorkMinutes = parseTimeToMinutes(schedule.endTime || "17:00");
      // Batas toleransi maksimal adalah 1 jam (60 menit) setelah jam kerja berakhir
      const autoCloseDeadlineMinutes = endWorkMinutes + 60;

      const isPastDate = record.date < todayStr;
      const isTodayAndPastDeadline = record.date === todayStr && currentWibMinutes >= autoCloseDeadlineMinutes;

      if (isPastDate || isTodayAndPastDeadline) {
        record.checkOut = `${schedule.endTime || "17:00"} WIB (Auto-Close)`;
        record.status = "Tidak Absen Pulang";
        record.isAutoClosed = true;
        record.autoClosedAt = `${record.date} ${schedule.endTime || "17:00"} WIB`;
        record.overtimeHours = 0; // JANGAN hitung kedalam lembur!
        
        const autoNote = "Sistem Otomatis: Staf Tidak Melakukan Absensi Pulang (Telat > 1 Jam dari Jam Kerja)";
        if (!record.notes || !record.notes.includes(autoNote)) {
          record.notes = record.notes ? `${record.notes} | ${autoNote}` : autoNote;
        }
        hasModified = true;
      }
    }
  }

  return hasModified;
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
  const modified = checkAndApplyAutoClose(data);
  if (modified) {
    writeAttendance(data);
  }
  const officeSettings = getOfficeLocationSettings();
  return NextResponse.json(
    {
      success: true,
      officeSettings,
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

    // Jalankan auto-close otomatis untuk membersihkan data absensi yang telat > 1 jam
    const autoCloseApplied = checkAndApplyAutoClose(data);
    if (autoCloseApplied) {
      writeAttendance(data);
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
    const dateStr = getWIBDateStr(now);
    const targetEmpName = (body.employeeName || "").trim().toLowerCase();
    const targetEmpEmail = (body.employeeEmail || "").trim().toLowerCase();

    if (action === "checkin") {
      const { location, notes, latitude, longitude, accuracy, mapsUrl, projectId, projectName, projectRole } = body;
      const selfieCheckIn = body.selfieCheckIn || body.selfiePhoto || null;

      // 0. Validasi Penguncian: Karyawan hanya boleh absen masuk 1 KALI per hari!
      const existingCheckInRecord = data.attendance.find((a: any) => {
        const matchDate = a.date === dateStr;
        if (!matchDate) return false;
        const matchName = targetEmpName && a.employeeName && a.employeeName.trim().toLowerCase() === targetEmpName;
        const matchEmail = targetEmpEmail && a.employeeEmail && a.employeeEmail.trim().toLowerCase() === targetEmpEmail;
        return Boolean(matchName || matchEmail);
      });

      if (existingCheckInRecord && existingCheckInRecord.checkIn && existingCheckInRecord.checkIn !== "-" && !body.isSuperAdminBypass) {
        return NextResponse.json(
          {
            success: false,
            error: `Presensi Masuk Terkunci: Anda sudah melakukan absen masuk hari ini pada pukul ${existingCheckInRecord.checkIn}. Anda hanya tinggal melakukan Absen Pulang (Check-Out)!`,
          },
          { status: 400 }
        );
      }

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

      // 3. Validasi Geofencing: Cek terhadap Titik Kantor Resmi atau Titik Proyek Terkait
      const officeConfig = getOfficeLocationSettings();
      const userPolicy = getUserLocationPolicy(body.employeeName, body.employeeEmail);
      const effectiveRadius = userPolicy.officeRadius || officeConfig.defaultRadius || 250;

      const distanceToOffice = calculateDistanceMeters(
        Number(latitude),
        Number(longitude),
        officeConfig.latitude,
        officeConfig.longitude
      );

      // Cek apakah staf berada di titik proyek yang ditugaskan/dipilih
      const matchedProject = findProjectCoordinates(projectId, projectName);
      let distanceToProject: number | null = null;
      let isWithinProjectGeofence = false;

      if (matchedProject) {
        distanceToProject = calculateDistanceMeters(
          Number(latitude),
          Number(longitude),
          matchedProject.latitude,
          matchedProject.longitude
        );
        isWithinProjectGeofence = distanceToProject <= matchedProject.radiusMeters;
      }

      const isWithinOfficeGeofence = distanceToOffice <= effectiveRadius;

      if (userPolicy.locationLock === "OFFICE" && !body.isSuperAdminBypass) {
        // Jika staf berada di dalam radius kantor ATAU di dalam radius proyek yang sah, izinkan!
        if (!isWithinOfficeGeofence && !isWithinProjectGeofence) {
          if (matchedProject) {
            return NextResponse.json(
              {
                success: false,
                error: `Presensi Masuk DITOLAK: Anda berada di luar radius kantor (${distanceToOffice}m > ${effectiveRadius}m) dan di luar radius proyek ${matchedProject.name} (${distanceToProject}m > ${matchedProject.radiusMeters}m). Harap mendekat ke lokasi kantor atau proyek!`,
              },
              { status: 403 }
            );
          } else {
            return NextResponse.json(
              {
                success: false,
                error: `Presensi Masuk DITOLAK: Anda berada di luar radius kantor resmi! Jarak Anda saat ini ${distanceToOffice} meter dari ${officeConfig.name} (Batas toleransi maksimal: ${effectiveRadius} meter). Admin dapat menyesuaikan titik GPS kantor di menu Pengaturan GPS Absensi.`,
              },
              { status: 403 }
            );
          }
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
      } else if (isWithinOfficeGeofence) {
        computedStatus = "Tepat Waktu";
      } else if (isWithinProjectGeofence) {
        computedStatus = "Di Lokasi Proyek";
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

      // 3. Validasi Geofencing Pulang: Cek terhadap Titik Kantor Resmi atau Titik Proyek Terkait
      const officeConfig = getOfficeLocationSettings();
      const userPolicy = getUserLocationPolicy(body.employeeName, body.employeeEmail);
      const effectiveRadius = userPolicy.officeRadius || officeConfig.defaultRadius || 250;

      const distanceToOffice = calculateDistanceMeters(
        Number(latitude),
        Number(longitude),
        officeConfig.latitude,
        officeConfig.longitude
      );

      // Cek apakah staf berada di titik proyek
      const matchedProject = findProjectCoordinates(projectId, projectName);
      let distanceToProject: number | null = null;
      let isWithinProjectGeofence = false;

      if (matchedProject) {
        distanceToProject = calculateDistanceMeters(
          Number(latitude),
          Number(longitude),
          matchedProject.latitude,
          matchedProject.longitude
        );
        isWithinProjectGeofence = distanceToProject <= matchedProject.radiusMeters;
      }

      const isWithinOfficeGeofence = distanceToOffice <= effectiveRadius;

      if (userPolicy.locationLock === "OFFICE" && !body.isSuperAdminBypass) {
        if (!isWithinOfficeGeofence && !isWithinProjectGeofence) {
          if (matchedProject) {
            return NextResponse.json(
              {
                success: false,
                error: `Presensi Pulang DITOLAK: Anda berada di luar radius kantor (${distanceToOffice}m > ${effectiveRadius}m) dan di luar radius proyek ${matchedProject.name} (${distanceToProject}m > ${matchedProject.radiusMeters}m). Harap mendekat ke lokasi kantor atau proyek untuk presensi pulang!`,
              },
              { status: 403 }
            );
          } else {
            return NextResponse.json(
              {
                success: false,
                error: `Presensi Pulang DITOLAK: Anda berada di luar radius kantor resmi! Jarak Anda saat ini ${distanceToOffice} meter dari ${officeConfig.name} (Batas toleransi: ${effectiveRadius} meter).`,
              },
              { status: 403 }
            );
          }
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

      // Validasi Jadwal Kerja Staf & Batas Toleransi 1 Jam dari Jam Kerja Terakhir
      const schedule = getEmployeeContractSchedule(body.employeeName);
      const endWorkMinutes = parseTimeToMinutes(schedule.endTime || "17:00");
      const autoCloseDeadlineMinutes = endWorkMinutes + 60; // Toleransi maksimal: 1 jam (60 menit) setelah jam kerja berakhir
      const currentWibMinutes = getWibCurrentMinutes(now);

      // PENGUNCIAN ABSENSI: Jika staf telat absen pulang (> 1 jam dari jam kerja) ATAU sudah di-auto close sistem:
      if (
        (existingToday && (existingToday.isAutoClosed || existingToday.status === "Tidak Absen Pulang")) ||
        currentWibMinutes >= autoCloseDeadlineMinutes
      ) {
        if (existingToday && !existingToday.isAutoClosed) {
          existingToday.checkOut = `${schedule.endTime || "17:00"} WIB (Auto-Close)`;
          existingToday.status = "Tidak Absen Pulang";
          existingToday.isAutoClosed = true;
          existingToday.autoClosedAt = `${dateStr} ${schedule.endTime || "17:00"} WIB`;
          existingToday.overtimeHours = 0; // JANGAN dihitung ke dalam lembur!
          const autoNote = "Sistem Otomatis: Staf Tidak Melakukan Absensi Pulang (Telat > 1 Jam dari Jam Kerja)";
          if (!existingToday.notes || !existingToday.notes.includes(autoNote)) {
            existingToday.notes = existingToday.notes ? `${existingToday.notes} | ${autoNote}` : autoNote;
          }
          writeAttendance(data);
        }

        return NextResponse.json(
          {
            success: false,
            isAutoClosed: true,
            error: `Presensi Pulang DITOLAK: Batas waktu absensi pulang telah berakhir (toleransi maksimal 1 jam setelah jam kerja selesai pukul ${schedule.endTime || "17:00"} WIB). Sistem telah menutup absensi Anda secara otomatis dengan status "Tidak Absen Pulang" dan tidak dihitung ke dalam lembur.`,
          },
          { status: 400 }
        );
      }

      const computedMapsUrl = mapsUrl || (latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : null);
      let savedRecord: any = null;

      if (existingToday) {
        existingToday.checkOut = timeStr;
        existingToday.isAutoClosed = false;
        existingToday.overtimeHours = 0;
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
          isAutoClosed: false,
          overtimeHours: 0,
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

      // Validasi Ketat: Jangan hitung/izinkan lembur jika karyawan tercatat tidak absen pulang pada tanggal tersebut!
      const attendanceOnDate = (data.attendance || []).find((a: any) =>
        a.date === date &&
        a.employeeName &&
        a.employeeName.trim().toLowerCase() === (body.employeeName || "").trim().toLowerCase()
      );
      if (attendanceOnDate && (attendanceOnDate.isAutoClosed || attendanceOnDate.status === "Tidak Absen Pulang")) {
        return NextResponse.json(
          {
            success: false,
            error: "Pengajuan lembur DITOLAK: Anda terdata tidak melakukan absensi pulang (Sistem Auto-Close) pada tanggal ini sehingga lembur tidak diakui.",
          },
          { status: 400 }
        );
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
