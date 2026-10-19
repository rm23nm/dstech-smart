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
    const { items, materialName, qty, unit, taskTitle, requestedBy, notes } = body;

    let requestItems: Array<{ materialId: string; materialName: string; qty: number; unit: string }> = [];

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (!item.materialName || !item.qty || Number(item.qty) <= 0) {
          return NextResponse.json(
            { success: false, error: "Setiap item material harus memiliki nama dan jumlah minimal 1" },
            { status: 400 }
          );
        }
        requestItems.push({
          materialId: item.materialId || `dstech_mat_${Date.now()}`,
          materialName: item.materialName,
          qty: Number(item.qty),
          unit: item.unit || "Pcs",
        });
      }
    } else if (materialName && qty) {
      // Backward compatibility fallback for single item
      requestItems.push({
        materialId: body.materialId || `dstech_mat_${Date.now()}`,
        materialName,
        qty: Number(qty),
        unit: unit || "Pcs",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Daftar material dan jumlah wajib diisi" },
        { status: 400 }
      );
    }

    const data = readInventory();

    // Summary representation for backward compatibility
    const summaryName =
      requestItems.length === 1
        ? requestItems[0].materialName
        : `${requestItems[0].materialName} (+${requestItems.length - 1} item lainnya)`;

    const totalQty = requestItems.reduce((acc, curr) => acc + curr.qty, 0);

    const newRequest = {
      id: `dstech_req_${Date.now()}`,
      items: requestItems,
      materialId: requestItems[0].materialId,
      materialName: summaryName,
      qty: totalQty,
      unit: requestItems.length === 1 ? requestItems[0].unit : "Item",
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
      message: `Permohonan ${requestItems.length} item material berhasil diajukan ke Gudang & Admin`,
      data: newRequest,
    });
  } catch (err) {
    console.error("Error submitting material request:", err);
    return NextResponse.json({ success: false, error: "Gagal mengajukan pengambilan material" }, { status: 500 });
  }
}
