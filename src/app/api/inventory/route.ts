import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PRODUCTS_FILE = path.join(process.cwd(), "src", "data", "dstech_products.json");
const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
const EMPLOYEE_INV_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_inventory.json");
const LOGS_FILE = path.join(process.cwd(), "src", "data", "dstech_inventory_logs.json");

const DEFAULT_WAREHOUSES = [
  { id: "dstech_wh_1", code: "GD-CLG-01", name: "Gudang Utama DSTech - Cilegon", address: "Kawasan Pergudangan Cilegon No. 12", pic: "Ahmad Teknisi", phone: "0812-3456-7890", type: "Gudang Utama", status: "Aktif" },
  { id: "dstech_wh_2", code: "GD-SRG-02", name: "Gudang Cabang DSTech - Serang", address: "Jl. Raya Serang Km 4.5", pic: "Hendra Logistik", phone: "0813-9876-5432", type: "Gudang Cabang", status: "Aktif" },
  { id: "dstech_wh_3", code: "GD-MBL-03", name: "Unit Mobile Lapangan (Armada Teknisi)", address: "Mobil Operasional DSTech", pic: "Fajar Lead Installer", phone: "0822-5555-1234", type: "Mobil Operasional", status: "Aktif" }
];

function readJson(file: string, fallback: any) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return fallback;
}

function writeJson(file: string, data: any) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

export async function GET() {
  try {
    const products = readJson(PRODUCTS_FILE, []);
    const finance = readJson(FINANCE_FILE, {});
    const employeeInv = readJson(EMPLOYEE_INV_FILE, { materials: [], requests: [] });
    const logs = readJson(LOGS_FILE, []);

    const warehouses = (finance.warehouses && finance.warehouses.length > 0) ? finance.warehouses : DEFAULT_WAREHOUSES;

    // Normalisasi stok dan valuasi
    const items = products.map((p: any) => {
      const stock = Number(p.stock) || 0;
      const whStock = p.warehouseStock || {
        dstech_wh_1: Math.round(stock * 0.7),
        dstech_wh_2: Math.round(stock * 0.2),
        dstech_wh_3: Math.max(0, stock - Math.round(stock * 0.7) - Math.round(stock * 0.2))
      };
      const price = Number(p.price) || 0;
      const costPrice = Number(p.costPrice) > 0 ? Number(p.costPrice) : (price > 0 ? Math.round(price * 0.7) : 0);
      const isService = p.category?.toLowerCase().includes("jasa") || stock >= 900;
      const valuation = isService ? 0 : stock * costPrice;

      const minStock = Number(p.minStock) || 3;
      let status: "Aman" | "Menipis" | "Habis" = "Aman";
      if (!isService) {
        if (stock <= 0) status = "Habis";
        else if (stock <= minStock) status = "Menipis";
      }

      return {
        ...p,
        stock,
        warehouseStock: whStock,
        valuation,
        status,
        minStock,
        isService,
        unit: p.unit || "Pcs"
      };
    });

    const physicalItems = items.filter((i: any) => !i.isService);
    const totalItems = physicalItems.length;
    const totalValuation = physicalItems.reduce((acc: number, curr: any) => acc + curr.valuation, 0);
    const criticalStockCount = physicalItems.filter((i: any) => i.status === "Menipis" || i.status === "Habis").length;

    return NextResponse.json({
      success: true,
      items,
      warehouses,
      requests: employeeInv.requests || [],
      logs,
      summary: {
        totalItems,
        totalValuation,
        criticalStockCount,
        warehouseCount: warehouses.length
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    const products = readJson(PRODUCTS_FILE, []);
    const employeeInv = readJson(EMPLOYEE_INV_FILE, { materials: [], requests: [] });
    const logs = readJson(LOGS_FILE, []);

    if (action === "stock_opname") {
      const { productId, warehouseId, actualStock, reason, notes, adjustedBy } = body;
      const target = products.find((p: any) => p.id === productId);
      if (!target) {
        return NextResponse.json({ success: false, error: "Barang tidak ditemukan" }, { status: 404 });
      }

      if (!target.warehouseStock) {
        target.warehouseStock = { dstech_wh_1: target.stock || 0, dstech_wh_2: 0, dstech_wh_3: 0 };
      }

      const prevWhStock = Number(target.warehouseStock[warehouseId]) || 0;
      const newWhStock = Math.max(0, Number(actualStock) || 0);
      const diff = newWhStock - prevWhStock;

      target.warehouseStock[warehouseId] = newWhStock;
      
      // Hitung total stok baru dari akumulasi semua gudang
      let totalNewStock = 0;
      for (const k of Object.keys(target.warehouseStock)) {
        totalNewStock += (Number(target.warehouseStock[k]) || 0);
      }
      target.stock = totalNewStock;
      if (target.hasConversion && target.conversionRatio) {
        target.subStockTotal = totalNewStock * Number(target.conversionRatio);
      }
      target.updatedAt = new Date().toISOString();

      // Rekam Log
      const logEntry = {
        id: `dstech_opname_${Date.now()}`,
        type: "STOCK_OPNAME",
        productId: target.id,
        productName: target.name,
        warehouseId,
        prevStock: prevWhStock,
        newStock: newWhStock,
        difference: diff,
        unit: target.unit || "Pcs",
        reason: reason || "Penyesuaian Fisik Berkala",
        notes: notes || "",
        adjustedBy: adjustedBy || "Admin Gudang",
        createdAt: new Date().toISOString()
      };
      logs.unshift(logEntry);

      writeJson(PRODUCTS_FILE, products);
      writeJson(LOGS_FILE, logs);

      return NextResponse.json({
        success: true,
        message: `Stock Opname berhasil disimpan! Stok ${target.name} diupdate menjadi ${newWhStock} ${target.unit}`,
        data: target
      });
    }

    if (action === "warehouse_transfer") {
      const { productId, fromWarehouseId, toWarehouseId, qty, notes, transferredBy } = body;
      const target = products.find((p: any) => p.id === productId);
      if (!target) {
        return NextResponse.json({ success: false, error: "Barang tidak ditemukan" }, { status: 404 });
      }

      if (fromWarehouseId === toWarehouseId) {
        return NextResponse.json({ success: false, error: "Gudang asal dan gudang tujuan tidak boleh sama" }, { status: 400 });
      }

      const transferQty = Number(qty) || 0;
      if (transferQty <= 0) {
        return NextResponse.json({ success: false, error: "Jumlah transfer harus lebih dari 0" }, { status: 400 });
      }

      if (!target.warehouseStock) {
        target.warehouseStock = { dstech_wh_1: target.stock || 0, dstech_wh_2: 0, dstech_wh_3: 0 };
      }

      const fromStock = Number(target.warehouseStock[fromWarehouseId]) || 0;
      if (fromStock < transferQty) {
        return NextResponse.json({
          success: false,
          error: `Stok gudang asal tidak mencukupi (Tersedia: ${fromStock} ${target.unit}, Diminta: ${transferQty} ${target.unit})`
        }, { status: 400 });
      }

      target.warehouseStock[fromWarehouseId] = fromStock - transferQty;
      target.warehouseStock[toWarehouseId] = (Number(target.warehouseStock[toWarehouseId]) || 0) + transferQty;
      target.updatedAt = new Date().toISOString();

      // Rekam Log
      const logEntry = {
        id: `dstech_trf_${Date.now()}`,
        type: "WAREHOUSE_TRANSFER",
        productId: target.id,
        productName: target.name,
        fromWarehouseId,
        toWarehouseId,
        qty: transferQty,
        unit: target.unit || "Pcs",
        notes: notes || "Mutasi antar titik logistik",
        transferredBy: transferredBy || "Logistik Officer",
        createdAt: new Date().toISOString()
      };
      logs.unshift(logEntry);

      writeJson(PRODUCTS_FILE, products);
      writeJson(LOGS_FILE, logs);

      return NextResponse.json({
        success: true,
        message: `Transfer ${transferQty} ${target.unit} ${target.name} berhasil dilakukan!`,
        data: target
      });
    }

    if (action === "approve_request") {
      const { requestId, warehouseId = "dstech_wh_1", notes, approvedBy = "Admin Logistik" } = body;
      const reqList = employeeInv.requests || [];
      const targetReq = reqList.find((r: any) => r.id === requestId);
      if (!targetReq) {
        return NextResponse.json({ success: false, error: "Permohonan material tidak ditemukan" }, { status: 404 });
      }

      // Potong stok produk di warehouseStock
      const itemsToDeduct = targetReq.items && targetReq.items.length > 0 
        ? targetReq.items 
        : [{ materialId: targetReq.materialId, materialName: targetReq.materialName, qty: targetReq.qty, unit: targetReq.unit }];

      for (const reqItem of itemsToDeduct) {
        const prod = products.find((p: any) => 
          p.id === reqItem.materialId || 
          (p.name && reqItem.materialName && p.name.trim().toLowerCase() === reqItem.materialName.trim().toLowerCase())
        );

        if (prod && !prod.isService && prod.stock < 900) {
          if (!prod.warehouseStock) {
            prod.warehouseStock = { dstech_wh_1: prod.stock || 0, dstech_wh_2: 0, dstech_wh_3: 0 };
          }
          const currentWhStock = Number(prod.warehouseStock[warehouseId]) || 0;
          const qtyDeduct = Number(reqItem.qty) || 0;

          prod.warehouseStock[warehouseId] = Math.max(0, currentWhStock - qtyDeduct);

          let totalNewStock = 0;
          for (const k of Object.keys(prod.warehouseStock)) {
            totalNewStock += (Number(prod.warehouseStock[k]) || 0);
          }
          prod.stock = totalNewStock;
          if (prod.hasConversion && prod.conversionRatio) {
            prod.subStockTotal = totalNewStock * Number(prod.conversionRatio);
          }
          prod.updatedAt = new Date().toISOString();
        }
      }

      targetReq.status = "Disetujui & Dikeluarkan";
      targetReq.approvedAt = new Date().toISOString();
      targetReq.approvedBy = approvedBy;
      targetReq.warehouseDispatched = warehouseId;
      targetReq.approvalNotes = notes || "Disetujui dan material telah diserahterimakan ke teknisi.";

      // Log pengeluaran
      const logEntry = {
        id: `dstech_req_appr_${Date.now()}`,
        type: "MATERIAL_DISPATCH",
        requestId: targetReq.id,
        taskTitle: targetReq.taskTitle,
        requestedBy: targetReq.requestedBy,
        warehouseId,
        approvedBy,
        createdAt: new Date().toISOString()
      };
      logs.unshift(logEntry);

      writeJson(PRODUCTS_FILE, products);
      writeJson(EMPLOYEE_INV_FILE, employeeInv);
      writeJson(LOGS_FILE, logs);

      return NextResponse.json({
        success: true,
        message: `Permohonan material berhasil disetujui dan stok gudang otomatis dipotong!`,
        data: targetReq
      });
    }

    if (action === "reject_request") {
      const { requestId, reason, rejectedBy = "Admin Logistik" } = body;
      const reqList = employeeInv.requests || [];
      const targetReq = reqList.find((r: any) => r.id === requestId);
      if (!targetReq) {
        return NextResponse.json({ success: false, error: "Permohonan tidak ditemukan" }, { status: 404 });
      }

      targetReq.status = "Ditolak";
      targetReq.rejectedAt = new Date().toISOString();
      targetReq.rejectedBy = rejectedBy;
      targetReq.rejectionReason = reason || "Stok belum tersedia atau spesifikasi material perlu direvisi.";

      writeJson(EMPLOYEE_INV_FILE, employeeInv);

      return NextResponse.json({
        success: true,
        message: `Permohonan material telah ditolak.`,
        data: targetReq
      });
    }

    return NextResponse.json({ success: false, error: "Action tidak dikenali" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
