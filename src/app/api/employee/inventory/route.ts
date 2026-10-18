import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_inventory.json");

function readInventory() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_employee_inventory.json:", err);
  }
  return { materials: [], requests: [] };
}

function writeInventory(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_employee_inventory.json:", err);
    return false;
  }
}

export async function GET() {
  const data = readInventory();
  return NextResponse.json({
    success: true,
    materials: data.materials || [],
    requests: data.requests || [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { materialName, qty, unit, taskTitle, requestedBy, notes } = body;

    if (!materialName || !qty) {
      return NextResponse.json({ success: false, error: "Nama material dan jumlah wajib diisi" }, { status: 400 });
    }

    const data = readInventory();
    const newRequest = {
      id: `dstech_req_${Date.now()}`,
      materialId: body.materialId || `dstech_mat_custom_${Date.now()}`,
      materialName,
      qty: Number(qty),
      unit: unit || "Pcs",
      taskTitle: taskTitle || "Penugasan Lapangan",
      requestedBy: requestedBy || "Ikhsan Maulidi",
      date: new Date().toISOString().split("T")[0],
      status: "Menunggu Approval",
      notes: notes || "-",
    };

    if (!data.requests) data.requests = [];
    data.requests.unshift(newRequest);

    writeInventory(data);

    return NextResponse.json({
      success: true,
      message: "Permohonan pengambilan material berhasil diajukan ke Gudang & Admin",
      data: newRequest,
    });
  } catch (err) {
    console.error("Error submitting material request:", err);
    return NextResponse.json({ success: false, error: "Gagal mengajukan pengambilan material" }, { status: 500 });
  }
}
