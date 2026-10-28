import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_tasks.json");

function readTasks() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_employee_tasks.json:", err);
  }
  return [];
}

function writeTasks(tasks: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_employee_tasks.json:", err);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const technician = searchParams.get("technician");
    const type = searchParams.get("type");
    const entity = searchParams.get("entity");
    const query = searchParams.get("query")?.toLowerCase();

    let tasks = readTasks();

    // Integrasi Penugasan Proyek Lapangan (Selain Maintenance)
    const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
    let projectTasks: any[] = [];
    try {
      if (fs.existsSync(FINANCE_FILE)) {
        const finData = JSON.parse(fs.readFileSync(FINANCE_FILE, "utf-8"));
        const rawProjects = Array.isArray(finData.projects) ? finData.projects : [];
        projectTasks = rawProjects.map((p: any) => {
          // Cari apakah penugasan proyek ini sudah pernah diupdate di dstech_employee_tasks.json
          const existingTask = tasks.find(
            (t: any) =>
              t.id === p.id ||
              t.projectId === p.id ||
              (t.ticketNumber && p.projectCode && t.ticketNumber.toLowerCase() === p.projectCode.toLowerCase())
          );

          return {
            id: p.id,
            ticketNumber: p.projectCode || p.id,
            entityType: p.businessEntity || "PT",
            type: "Proyek Lapangan",
            isProject: true,
            projectId: p.id,
            title: p.projectName,
            client: p.clientName || "Klien DSTech",
            clientPhone: p.clientPhone || "-",
            clientPic: p.clientPic || p.picProject || "PIC Klien",
            location: p.clientAddress || "Area Proyek Klien",
            date: p.startDate || p.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
            deadline: p.targetEndDate || "-",
            status: existingTask?.status || (p.status === "Completed" ? "Completed" : p.status === "In Progress" ? "In Progress" : "Pending"),
            priority: "High",
            technician: p.picProject || "RAMADHANI ST",
            technicianPhone: "+6282259494242",
            picProject: p.picProject || "RAMADHANI ST",
            teamMembers: Array.isArray(p.teamMembers) && p.teamMembers.length > 0 ? p.teamMembers : [p.picProject || "RAMADHANI ST", "Ikhsan Maulidi"],
            scope: existingTask?.scope || [
              `Pelaksanaan pengadaan & instalasi proyek ${p.projectName}`,
              `Koordinasi berkala dengan PIC Klien (${p.clientName})`,
              "Penyusunan laporan harian lapangan (Daily Report) dan Berita Acara Pekerjaan",
            ],
            equipment: existingTask?.equipment || ["Perangkat & Material Sesuai Kontrak Proyek"],
            photos: (existingTask?.photos && existingTask.photos.length > 0) ? existingTask.photos : (Array.isArray(p.photos) ? p.photos : []),
            report: existingTask?.report || p.report || p.description || "",
            notes: existingTask?.notes || "Wajib mengisi Laporan Harian (Daily Report) dan dokumentasi foto progres setiap hari kerja.",
            damagedItems: existingTask?.damagedItems || [],
            latitude: existingTask?.latitude || null,
            longitude: existingTask?.longitude || null,
            googleMapsUrl: existingTask?.googleMapsUrl || (p.clientAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.clientAddress)}` : ""),
            completionDate: existingTask?.completionDate || p.completionDate || undefined,
            updatedAt: existingTask?.updatedAt || p.updatedAt || new Date().toISOString(),
          };
        });
      }
    } catch (e) {
      console.error("Error reading projects for employee tasks:", e);
    }

    // Filter task non-project dari tasks.json dan gabungkan dengan projectTasks (tanpa duplikasi ID)
    const nonProjectTasks = tasks.filter((t: any) => !t.isProject && !projectTasks.some((pt: any) => pt.id === t.id || pt.ticketNumber === t.ticketNumber));
    let allTasks = [...nonProjectTasks, ...projectTasks];

    if (entity && entity !== "ALL") {
      allTasks = allTasks.filter((t: any) => (t.entityType || "PT") === entity);
    }

    if (status && status !== "Semua") {
      allTasks = allTasks.filter((t: any) => t.status?.toLowerCase() === status.toLowerCase());
    }

    if (technician && technician !== "Semua") {
      const techLower = technician.toLowerCase();
      allTasks = allTasks.filter((t: any) =>
        t.technician?.toLowerCase() === techLower ||
        (Array.isArray(t.teamMembers) && t.teamMembers.some((m: string) => m.toLowerCase().includes(techLower))) ||
        (t.picProject && t.picProject.toLowerCase().includes(techLower))
      );
    }

    if (type && type !== "Semua") {
      allTasks = allTasks.filter((t: any) => (t.type || "Preventive Maintenance")?.toLowerCase() === type.toLowerCase());
    }

    if (query) {
      allTasks = allTasks.filter(
        (t: any) =>
          t.title?.toLowerCase().includes(query) ||
          t.client?.toLowerCase().includes(query) ||
          t.location?.toLowerCase().includes(query) ||
          t.ticketNumber?.toLowerCase().includes(query) ||
          t.technician?.toLowerCase().includes(query) ||
          (Array.isArray(t.teamMembers) && t.teamMembers.some((m: string) => m.toLowerCase().includes(query)))
      );
    }

    tasks = allTasks;

    const INVENTORY_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_inventory.json");
    let inventoryRequests: any[] = [];
    try {
      if (fs.existsSync(INVENTORY_FILE)) {
        const invData = JSON.parse(fs.readFileSync(INVENTORY_FILE, "utf-8"));
        inventoryRequests = invData.requests || [];
      }
    } catch (e) {
      console.error("Error reading inventory requests for tasks:", e);
    }

    // Tempelkan permohonan material terkait ke masing-masing tugas
    tasks = tasks.map((t: any) => {
      const relatedReqs = inventoryRequests.filter(
        (r: any) =>
          (r.taskId && r.taskId === t.id) ||
          (r.taskTitle && (r.taskTitle.includes(t.title) || (t.ticketNumber && r.taskTitle.includes(t.ticketNumber))))
      );
      return {
        ...t,
        damagedItems: Array.isArray(t.damagedItems) ? t.damagedItems : [],
        usedMaterials: Array.isArray(t.usedMaterials) ? t.usedMaterials : [],
        latitude: t.latitude || null,
        longitude: t.longitude || null,
        radiusMeters: t.radiusMeters || 350,
        googleMapsUrl: t.googleMapsUrl || (t.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.location)}` : ""),
        invoiceStatus: t.invoiceStatus || "Belum Ditagihkan",
        invoiceNumber: t.invoiceNumber || "",
        invoiceId: t.invoiceId || "",
        linkedMaterialRequests: relatedReqs,
      };
    });

    return NextResponse.json({
      success: true,
      total: tasks.length,
      data: tasks,
    });
  } catch (err: any) {
    console.error("Error in GET /api/employee/tasks:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tasks = readTasks();

    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const countThisMonth = tasks.filter((t: any) => t.ticketNumber?.includes(`MTC-${yearMonth}`)).length + 1;
    const autoTicketNumber = `MTC-${yearMonth}-${String(countThisMonth).padStart(3, "0")}`;

    const newTask = {
      id: `dstech_task_${Date.now()}`,
      ticketNumber: body.ticketNumber?.trim() || autoTicketNumber,
      entityType: body.entityType === "NON_PT" ? "NON_PT" : "PT",
      type: body.type || "Preventive Maintenance",
      title: body.title?.trim() || "Kunjungan Pemeliharaan Rutin",
      client: body.client?.trim() || "Klien Umum",
      clientId: body.clientId || "",
      clientPhone: body.clientPhone || "",
      clientPic: body.clientPic || "",
      location: body.location?.trim() || "",
      date: body.date || now.toISOString().split("T")[0],
      deadline: body.deadline || body.date || now.toISOString().split("T")[0],
      status: body.status || "Pending",
      priority: body.priority || "Medium",
      technician: body.technician?.trim() || "Teknisi Lapangan",
      technicianId: body.technicianId || "",
      technicianPhone: body.technicianPhone || "",
      scope: Array.isArray(body.scope) ? body.scope.filter((s: string) => s && s.trim()) : [],
      equipment: Array.isArray(body.equipment) ? body.equipment.filter((e: string) => e && e.trim()) : [],
      damagedItems: Array.isArray(body.damagedItems) ? body.damagedItems : [],
      usedMaterials: Array.isArray(body.usedMaterials) ? body.usedMaterials : [],
      latitude: body.latitude !== undefined ? Number(body.latitude) : null,
      longitude: body.longitude !== undefined ? Number(body.longitude) : null,
      radiusMeters: body.radiusMeters !== undefined ? Number(body.radiusMeters) : 350,
      googleMapsUrl: body.googleMapsUrl || (body.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(body.location)}` : ""),
      invoiceStatus: body.invoiceStatus || "Belum Ditagihkan",
      invoiceNumber: body.invoiceNumber || "",
      invoiceId: body.invoiceId || "",
      report: body.report || "",
      notes: body.notes || "",
      recommendation: body.recommendation || "",
      photos: Array.isArray(body.photos) ? body.photos : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    writeTasks(tasks);

    return NextResponse.json({
      success: true,
      message: "Tiket maintenance & penugasan teknisi berhasil dibuat",
      data: newTask,
    });
  } catch (err: any) {
    console.error("Error creating task:", err);
    return NextResponse.json({ success: false, error: err.message || "Gagal membuat tugas" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id && !body.ticketNumber && !body.title) {
      return NextResponse.json({ success: false, error: "Task ID atau data penugasan diperlukan" }, { status: 400 });
    }

    const tasks = readTasks();
    let index = -1;

    if (id) {
      index = tasks.findIndex(
        (t: any) =>
          t.id === id ||
          t.ticketNumber === id ||
          String(t.id).toLowerCase() === String(id).toLowerCase() ||
          String(t.ticketNumber).toLowerCase() === String(id).toLowerCase()
      );
    }

    if (index === -1 && body.ticketNumber) {
      index = tasks.findIndex(
        (t: any) =>
          t.ticketNumber === body.ticketNumber ||
          String(t.ticketNumber).toLowerCase() === String(body.ticketNumber).toLowerCase()
      );
    }

    if (index === -1 && body.title) {
      index = tasks.findIndex(
        (t: any) =>
          t.title && body.title && t.title.trim().toLowerCase() === body.title.trim().toLowerCase()
      );
    }

    let savedTask: any;

    if (index === -1) {
      // Buatkan data penugasan baru jika belum tercatat di database JSON
      const newTask = {
        id: id || `dstech_task_${Date.now()}`,
        ticketNumber: body.ticketNumber || `MTC-${new Date().toISOString().slice(0, 7).replace("-", "")}-001`,
        entityType: body.entityType || "PT",
        type: body.type || (body.isProject ? "Proyek Lapangan" : "Penugasan Maintenance Lapangan"),
        isProject: !!body.isProject,
        projectId: body.projectId || "",
        title: body.title || "Penugasan Maintenance Lapangan",
        client: body.client || "Klien Umum",
        clientPhone: body.clientPhone || "",
        clientPic: body.clientPic || "",
        location: body.location || "-",
        date: body.date || new Date().toISOString().split("T")[0],
        deadline: body.deadline || new Date().toISOString().split("T")[0],
        status: body.status || "In Progress",
        priority: body.priority || "Medium",
        technician: body.technician || "Teknisi Lapangan",
        technicianPhone: body.technicianPhone || "",
        scope: Array.isArray(body.scope) ? body.scope : [],
        equipment: Array.isArray(body.equipment) ? body.equipment : [],
        report: body.report || "",
        notes: body.notes || "",
        recommendation: body.recommendation || "",
        photos: Array.isArray(body.photos) ? body.photos : [],
        damagedItems: Array.isArray(body.damagedItems) ? body.damagedItems : [],
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        googleMapsUrl: body.googleMapsUrl || (body.latitude && body.longitude ? `https://www.google.com/maps?q=${body.latitude},${body.longitude}` : ""),
        completionDate: body.status === "Completed" ? new Date().toISOString().split("T")[0] : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      tasks.unshift(newTask);
      savedTask = newTask;
    } else {
      // Update fields allowed
      const updatedTask = {
        ...tasks[index],
        ...body,
        updatedAt: new Date().toISOString(),
      };

      // If status changed to Completed and no completionDate set, set it
      if (body.status === "Completed" && !updatedTask.completionDate) {
        updatedTask.completionDate = new Date().toISOString().split("T")[0];
      }

      if (body.latitude && body.longitude && (!body.googleMapsUrl || body.googleMapsUrl.includes("search/?api=1"))) {
        updatedTask.googleMapsUrl = `https://www.google.com/maps?q=${body.latitude},${body.longitude}`;
      }

      tasks[index] = updatedTask;
      savedTask = tasks[index];
    }

    writeTasks(tasks);

    // Sinkronkan juga ke dstech_finance_erp.json jika ini adalah proyek
    try {
      const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
      if (fs.existsSync(FINANCE_FILE)) {
        const rawFinance = fs.readFileSync(FINANCE_FILE, "utf-8");
        const financeData = JSON.parse(rawFinance);
        const prjIdToFind = body.projectId || body.id || savedTask.projectId || savedTask.id;
        const ticketToFind = body.ticketNumber || savedTask.ticketNumber;

        const prjIdx = (financeData.projects || []).findIndex(
          (p: any) =>
            p.id === prjIdToFind ||
            (ticketToFind && p.projectCode && p.projectCode.toLowerCase() === ticketToFind.toLowerCase())
        );

        if (prjIdx !== -1) {
          const prj = financeData.projects[prjIdx];
          if (body.photos && Array.isArray(body.photos)) {
            prj.photos = body.photos;
          }
          if (body.report !== undefined) {
            prj.report = body.report;
          }
          if (body.status) {
            prj.status = body.status;
          }
          if (savedTask.completionDate) {
            prj.completionDate = savedTask.completionDate;
          }
          prj.updatedAt = new Date().toISOString();
          fs.writeFileSync(FINANCE_FILE, JSON.stringify(financeData, null, 2), "utf-8");
        }
      }
    } catch (finErr) {
      console.error("Error syncing task update to dstech_finance_erp.json:", finErr);
    }

    return NextResponse.json({
      success: true,
      message: "Laporan pekerjaan & foto dokumentasi berhasil disimpan secara permanen",
      data: savedTask,
    });
  } catch (err: any) {
    console.error("Error updating task:", err);
    return NextResponse.json({ success: false, error: err.message || "Gagal memperbarui tugas" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Task ID wajib disertakan" }, { status: 400 });
    }

    let tasks = readTasks();
    const initialLength = tasks.length;
    tasks = tasks.filter((t: any) => t.id !== id);

    if (tasks.length === initialLength) {
      return NextResponse.json({ success: false, error: "Tiket tugas tidak ditemukan" }, { status: 404 });
    }

    writeTasks(tasks);

    return NextResponse.json({
      success: true,
      message: "Tiket maintenance berhasil dihapus",
    });
  } catch (err: any) {
    console.error("Error deleting task:", err);
    return NextResponse.json({ success: false, error: err.message || "Gagal menghapus tiket" }, { status: 500 });
  }
}
