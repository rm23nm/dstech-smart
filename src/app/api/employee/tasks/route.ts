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

    if (entity && entity !== "ALL") {
      tasks = tasks.filter((t: any) => (t.entityType || "PT") === entity);
    }

    if (status && status !== "Semua") {
      tasks = tasks.filter((t: any) => t.status?.toLowerCase() === status.toLowerCase());
    }

    if (technician && technician !== "Semua") {
      tasks = tasks.filter((t: any) => t.technician?.toLowerCase() === technician.toLowerCase());
    }

    if (type && type !== "Semua") {
      tasks = tasks.filter((t: any) => (t.type || "Preventive Maintenance")?.toLowerCase() === type.toLowerCase());
    }

    if (query) {
      tasks = tasks.filter(
        (t: any) =>
          t.title?.toLowerCase().includes(query) ||
          t.client?.toLowerCase().includes(query) ||
          t.location?.toLowerCase().includes(query) ||
          t.ticketNumber?.toLowerCase().includes(query) ||
          t.technician?.toLowerCase().includes(query)
      );
    }

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

    if (index === -1) {
      // Buatkan data penugasan baru jika belum tercatat di database JSON
      const newTask = {
        id: id || `dstech_task_${Date.now()}`,
        ticketNumber: body.ticketNumber || `MTC-${new Date().toISOString().slice(0, 7).replace("-", "")}-001`,
        title: body.title || "Penugasan Maintenance Lapangan",
        client: body.client || "Klien Umum",
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      tasks.unshift(newTask);
      writeTasks(tasks);

      return NextResponse.json({
        success: true,
        message: "Tiket penugasan maintenance berhasil disimpan",
        data: newTask,
      });
    }

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
    writeTasks(tasks);

    return NextResponse.json({
      success: true,
      message: "Tiket penugasan maintenance berhasil diperbarui",
      data: tasks[index],
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
