import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DAILY_REPORTS_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_daily_reports.json");
const TASKS_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_tasks.json");

function readReports(): any[] {
  try {
    if (fs.existsSync(DAILY_REPORTS_FILE)) {
      const data = fs.readFileSync(DAILY_REPORTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_employee_daily_reports.json:", err);
  }
  return [];
}

function writeReports(reports: any[]): boolean {
  try {
    fs.writeFileSync(DAILY_REPORTS_FILE, JSON.stringify(reports, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_employee_daily_reports.json:", err);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employee = searchParams.get("employee")?.toLowerCase();
    const taskId = searchParams.get("taskId");
    const projectId = searchParams.get("projectId");
    const date = searchParams.get("date");

    let reports = readReports();

    if (employee && employee !== "semua") {
      reports = reports.filter((r: any) =>
        r.employeeName?.toLowerCase().includes(employee) ||
        r.employeeEmail?.toLowerCase() === employee
      );
    }

    if (projectId) {
      reports = reports.filter((r: any) => r.projectId === projectId || r.projectCode === projectId);
    }

    if (taskId) {
      reports = reports.filter((r: any) => r.taskId === taskId || r.ticketNumber === taskId);
    }

    if (date) {
      reports = reports.filter((r: any) => r.date === date);
    }

    return NextResponse.json({
      success: true,
      total: reports.length,
      data: reports,
    });
  } catch (err: any) {
    console.error("Error in GET /api/employee/daily-reports:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reports = readReports();

    if (!body.activityDescription || !body.activityDescription.trim()) {
      return NextResponse.json(
        { success: false, error: "Uraian kegiatan pekerjaan hari ini wajib diisi!" },
        { status: 400 }
      );
    }

    const now = new Date();
    const wibDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    const wibTimeStr = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now) + " WIB";

    const jobType = body.jobType || (body.projectId ? "PROJECT_PT" : body.taskId ? "MAINTENANCE_TOKO" : "NON_PROJECT");

    const newReport = {
      id: `dstech_report_${Date.now()}`,
      date: body.date || wibDateStr,
      reportTime: body.reportTime || wibTimeStr,
      jobType: jobType,
      employeeId: body.employeeId || "",
      employeeName: body.employeeName?.trim() || "Teknisi Lapangan",
      employeeEmail: body.employeeEmail?.trim() || "",
      projectId: body.projectId || "",
      projectCode: body.projectCode || "",
      projectName: body.projectName?.trim() || "",
      roleInProject: body.roleInProject?.trim() || "Teknisi Lapangan",
      workHours: body.workHours?.trim() || "1 Hari Penuh (08:00 - 17:00 WIB)",
      taskId: body.taskId || "",
      ticketNumber: body.ticketNumber || "",
      taskTitle: body.taskTitle?.trim() || (jobType === "NON_PROJECT" ? "Kegiatan Rutin Kantor / Standby Internal (Non-Project & Maintenance)" : body.projectName || "Pekerjaan Lapangan / Workshop"),
      clientName: body.clientName?.trim() || (jobType === "NON_PROJECT" ? "PT. DSTech Smart Perkasa (Internal)" : "Klien Umum"),
      location: body.location?.trim() || (jobType === "NON_PROJECT" ? "Kantor DSTech Cilegon / Workshop" : ""),
      activityDescription: body.activityDescription.trim(),
      progressPercentage: Number(body.progressPercentage) || 0,
      blockers: body.blockers?.trim() || "",
      nextAction: body.nextAction?.trim() || "",
      photos: Array.isArray(body.photos) ? body.photos : [],
      statusAfter: body.statusAfter || "In Progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Simpan ke daftar laporan harian
    reports.unshift(newReport);
    writeReports(reports);

    // 2. Jika laporan terkait Proyek DSTech, catat ke dstech_finance_erp.json proyek tersebut
    if (body.projectId) {
      try {
        const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
        if (fs.existsSync(FINANCE_FILE)) {
          const rawFinance = fs.readFileSync(FINANCE_FILE, "utf-8");
          const financeData = JSON.parse(rawFinance);
          const prjIndex = (financeData.projects || []).findIndex(
            (p: any) => p.id === body.projectId || p.projectCode === body.projectId
          );
          if (prjIndex !== -1) {
            const prj = financeData.projects[prjIndex];
            if (!Array.isArray(prj.dailyTechnicianReports)) {
              prj.dailyTechnicianReports = [];
            }
            prj.dailyTechnicianReports.unshift({
              id: newReport.id,
              date: newReport.date,
              employeeName: newReport.employeeName,
              employeeEmail: newReport.employeeEmail,
              roleInProject: newReport.roleInProject,
              workHours: newReport.workHours,
              activityDescription: newReport.activityDescription,
              blockers: newReport.blockers,
              photos: newReport.photos,
              createdAt: newReport.createdAt,
            });
            fs.writeFileSync(FINANCE_FILE, JSON.stringify(financeData, null, 2), "utf-8");
          }
        }
      } catch (finErr) {
        console.error("Error updating project with daily technician report:", finErr);
      }
    }

    // 3. Jika laporan terkait tiket/task maintenance tertentu, update tiket tersebut secara otomatis!
    if (body.taskId) {
      try {
        if (fs.existsSync(TASKS_FILE)) {
          const rawTasks = fs.readFileSync(TASKS_FILE, "utf-8");
          const tasks = JSON.parse(rawTasks);
          const taskIndex = tasks.findIndex(
            (t: any) => t.id === body.taskId || t.ticketNumber === body.ticketNumber
          );

          if (taskIndex !== -1) {
            const task = tasks[taskIndex];
            task.report = `${task.report ? task.report + "\n\n" : ""}[${newReport.date} - ${newReport.employeeName}] (${newReport.progressPercentage}%): ${newReport.activityDescription}`;
            if (body.statusAfter) {
              task.status = body.statusAfter;
            }
            if (!Array.isArray(task.dailyLogs)) {
              task.dailyLogs = [];
            }
            task.dailyLogs.unshift({
              id: newReport.id,
              date: newReport.date,
              employeeName: newReport.employeeName,
              progressPercentage: newReport.progressPercentage,
              activityDescription: newReport.activityDescription,
              blockers: newReport.blockers,
              photos: newReport.photos,
              createdAt: newReport.createdAt,
            });
            task.updatedAt = new Date().toISOString();
            fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf-8");
          }
        }
      } catch (taskErr) {
        console.error("Error updating task with daily report:", taskErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Laporan kegiatan harian berhasil disimpan dan disinkronisasikan ke sistem proyek!",
      data: newReport,
    });
  } catch (err: any) {
    console.error("Error in POST /api/employee/daily-reports:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menyimpan laporan kegiatan harian" },
      { status: 500 }
    );
  }
}
