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
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let tasks = readTasks();
  if (status && status !== "Semua") {
    tasks = tasks.filter((t: any) => t.status.toLowerCase() === status.toLowerCase());
  }

  return NextResponse.json({
    success: true,
    total: tasks.length,
    data: tasks,
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, report } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Task ID diperlukan" }, { status: 400 });
    }

    const tasks = readTasks();
    const index = tasks.findIndex((t: any) => t.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Tugas tidak ditemukan" }, { status: 404 });
    }

    if (status !== undefined) tasks[index].status = status;
    if (report !== undefined) tasks[index].report = report;

    writeTasks(tasks);

    return NextResponse.json({
      success: true,
      message: "Status penugasan berhasil diperbarui",
      data: tasks[index],
    });
  } catch (err) {
    console.error("Error updating task:", err);
    return NextResponse.json({ success: false, error: "Gagal memperbarui tugas" }, { status: 500 });
  }
}
