import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");

function readFinanceData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_finance_erp.json:", err);
  }
  return {
    sales: [],
    purchases: [],
    returns_sales: [],
    returns_purchase: [],
    cash_flow: [],
    warehouses: [],
    branches: [],
    expenses: [],
  };
}

function writeFinanceData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_finance_erp.json:", err);
    return false;
  }
}

export async function GET() {
  const data = readFinanceData();

  // Hitung ringkasan kalkulasi keuangan real-time
  const sales = data.sales || [];
  const purchases = data.purchases || [];
  const expenses = data.expenses || [];
  const cashFlow = data.cash_flow || [];

  const totalSalesRevenue = sales.reduce((acc: number, curr: any) => acc + (Number(curr.grandTotal) || 0), 0);
  const totalSalesPaid = sales.reduce((acc: number, curr: any) => acc + (Number(curr.paidAmount) || 0), 0);
  const totalAccountsReceivable = sales.reduce((acc: number, curr: any) => acc + (Number(curr.remainingAmount) || 0), 0);

  const totalPurchasesCost = purchases.reduce((acc: number, curr: any) => acc + (Number(curr.grandTotal) || 0), 0);
  const totalAccountsPayable = purchases
    .filter((p: any) => p.paymentStatus && p.paymentStatus.toLowerCase().includes("hutang"))
    .reduce((acc: number, curr: any) => acc + (Number(curr.grandTotal) || 0), 0);

  const totalOperatingExpenses = expenses.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

  const grossProfit = totalSalesRevenue - totalPurchasesCost;
  const netProfit = grossProfit - totalOperatingExpenses;

  const totalCashIn = cashFlow.filter((c: any) => c.type === "IN").reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
  const totalCashOut = cashFlow.filter((c: any) => c.type === "OUT").reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
  const currentCashBalance = totalCashIn - totalCashOut;

  const summary = {
    totalSalesRevenue,
    totalSalesPaid,
    totalAccountsReceivable,
    totalPurchasesCost,
    totalAccountsPayable,
    totalOperatingExpenses,
    grossProfit,
    netProfit,
    currentCashBalance,
    totalCashIn,
    totalCashOut,
    totalSalesCount: sales.length,
    totalPurchasesCount: purchases.length,
    totalWarehouseCount: (data.warehouses || []).length,
    totalBranchCount: (data.branches || []).length,
  };

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      summary,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actionType, payload } = body;
    const data = readFinanceData();

    if (!payload) {
      return NextResponse.json({ success: false, error: "Payload data wajib disertakan" }, { status: 400 });
    }

    if (actionType === "sale") {
      const newInvoiceNumber = `INV-DSTECH-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(
        (data.sales?.length || 0) + 1
      ).padStart(3, "0")}`;

      const grandTotal = Number(payload.grandTotal) || 0;
      const paidAmount = Number(payload.paidAmount) || 0;
      const remainingAmount = Math.max(0, grandTotal - paidAmount);

      const newSale = {
        id: `dstech_inv_${Date.now()}`,
        invoiceNumber: payload.invoiceNumber || newInvoiceNumber,
        customerName: payload.customerName || "Klien Umum",
        customerPhone: payload.customerPhone || "-",
        customerAddress: payload.customerAddress || "-",
        date: payload.date || new Date().toISOString().split("T")[0],
        dueDate: payload.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        items: payload.items || [],
        subtotal: Number(payload.subtotal) || 0,
        discount: Number(payload.discount) || 0,
        taxRate: Number(payload.taxRate) || 11,
        taxAmount: Number(payload.taxAmount) || 0,
        grandTotal,
        paymentMethod: payload.paymentMethod || "Transfer Bank Mandiri",
        paymentStatus: remainingAmount === 0 ? "Lunas" : paidAmount > 0 ? "Sebagian" : "Belum Lunas",
        paidAmount,
        remainingAmount,
        warehouseId: payload.warehouseId || "dstech_wh_1",
        branchId: payload.branchId || "dstech_branch_1",
        salesPerson: payload.salesPerson || "DSTech Admin",
        notes: payload.notes || "-",
      };

      if (!data.sales) data.sales = [];
      data.sales.unshift(newSale);

      // Catat ke arus kas jika ada pembayaran masuk
      if (paidAmount > 0) {
        if (!data.cash_flow) data.cash_flow = [];
        data.cash_flow.unshift({
          id: `dstech_cash_${Date.now()}`,
          date: newSale.date,
          type: "IN",
          category: "Penerimaan Penjualan",
          amount: paidAmount,
          account: newSale.paymentMethod.includes("BCA") ? "Bank BCA DSTech" : "Bank Mandiri PT DSTech Smart Perkasa",
          reference: newSale.invoiceNumber,
          description: `Penerimaan faktur penjualan ${newSale.invoiceNumber} - ${newSale.customerName}`,
          balanceAfter: 0,
        });
      }

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Faktur penjualan ${newSale.invoiceNumber} berhasil disimpan`,
        data: newSale,
      });
    }

    if (actionType === "purchase") {
      const newPoNumber = `PO-DSTECH-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(
        (data.purchases?.length || 0) + 1
      ).padStart(3, "0")}`;

      const newPurchase = {
        id: `dstech_po_${Date.now()}`,
        poNumber: payload.poNumber || newPoNumber,
        supplierName: payload.supplierName || "Supplier Mitra",
        supplierContact: payload.supplierContact || "-",
        date: payload.date || new Date().toISOString().split("T")[0],
        expectedDelivery: payload.expectedDelivery || new Date().toISOString().split("T")[0],
        items: payload.items || [],
        subtotal: Number(payload.subtotal) || 0,
        taxAmount: Number(payload.taxAmount) || 0,
        grandTotal: Number(payload.grandTotal) || 0,
        status: payload.status || "Draf",
        paymentStatus: payload.paymentStatus || "Hutang Usaha",
        warehouseId: payload.warehouseId || "dstech_wh_1",
        notes: payload.notes || "-",
      };

      if (!data.purchases) data.purchases = [];
      data.purchases.unshift(newPurchase);

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Purchase Order ${newPurchase.poNumber} berhasil disimpan`,
        data: newPurchase,
      });
    }

    if (actionType === "return_sales") {
      const newReturn = {
        id: `dstech_ret_sales_${Date.now()}`,
        returnNumber: `RET-S-${Date.now().toString().slice(-6)}`,
        invoiceNumber: payload.invoiceNumber || "-",
        customerName: payload.customerName || "-",
        date: payload.date || new Date().toISOString().split("T")[0],
        productName: payload.productName || "-",
        qty: Number(payload.qty) || 1,
        unit: payload.unit || "Unit",
        price: Number(payload.price) || 0,
        totalRefund: Number(payload.totalRefund) || 0,
        reason: payload.reason || "Klaim Garansi / Penggantian",
        resolution: payload.resolution || "Ganti Barang Baru",
        status: payload.status || "Sedang Diproses",
        handledBy: payload.handledBy || "DSTech QC & Logistik",
      };

      if (!data.returns_sales) data.returns_sales = [];
      data.returns_sales.unshift(newReturn);

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Retur penjualan ${newReturn.returnNumber} berhasil dicatat`,
        data: newReturn,
      });
    }

    if (actionType === "return_purchase") {
      const newReturn = {
        id: `dstech_ret_purch_${Date.now()}`,
        returnNumber: `RET-P-${Date.now().toString().slice(-6)}`,
        poNumber: payload.poNumber || "-",
        supplierName: payload.supplierName || "-",
        date: payload.date || new Date().toISOString().split("T")[0],
        productName: payload.productName || "-",
        qty: Number(payload.qty) || 1,
        unit: payload.unit || "Unit",
        price: Number(payload.price) || 0,
        totalCredit: Number(payload.totalCredit) || 0,
        reason: payload.reason || "Cacat QC Vendor",
        resolution: payload.resolution || "Klaim Garansi Tukar Baru",
        status: payload.status || "Dalam Proses RMA Vendor",
        handledBy: payload.handledBy || "DSTech Gudang",
      };

      if (!data.returns_purchase) data.returns_purchase = [];
      data.returns_purchase.unshift(newReturn);

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Retur pembelian ${newReturn.returnNumber} berhasil dicatat`,
        data: newReturn,
      });
    }

    if (actionType === "cash_flow") {
      const newCash = {
        id: `dstech_cash_${Date.now()}`,
        date: payload.date || new Date().toISOString().split("T")[0],
        type: payload.type === "OUT" ? "OUT" : "IN",
        category: payload.category || "Operasional",
        amount: Number(payload.amount) || 0,
        account: payload.account || "Bank Mandiri PT DSTech Smart Perkasa",
        reference: payload.reference || `TRX-${Date.now().toString().slice(-6)}`,
        description: payload.description || "-",
        balanceAfter: 0,
      };

      if (!data.cash_flow) data.cash_flow = [];
      data.cash_flow.unshift(newCash);

      // Jika pengeluaran operasional, catat juga ke expenses
      if (newCash.type === "OUT" && payload.recordAsExpense) {
        if (!data.expenses) data.expenses = [];
        data.expenses.unshift({
          id: `dstech_exp_${Date.now()}`,
          date: newCash.date,
          category: newCash.category,
          amount: newCash.amount,
          recipient: payload.recipient || "-",
          notes: newCash.description,
        });
      }

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Transaksi kas ${newCash.type === "IN" ? "masuk" : "keluar"} berhasil dibukukan`,
        data: newCash,
      });
    }

    return NextResponse.json({ success: false, error: "Tipe aksi (actionType) tidak dikenali" }, { status: 400 });
  } catch (err) {
    console.error("Error creating financial record:", err);
    return NextResponse.json({ success: false, error: "Gagal memproses data keuangan" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { actionType, id, updates } = body;
    const data = readFinanceData();

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: "ID dan data pembaruan wajib disertakan" }, { status: 400 });
    }

    if (actionType === "sale") {
      const index = (data.sales || []).findIndex((s: any) => s.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Faktur penjualan tidak ditemukan" }, { status: 404 });
      }

      data.sales[index] = {
        ...data.sales[index],
        ...updates,
      };

      // Recalculate remaining amount if paid amount updated
      if (updates.paidAmount !== undefined) {
        data.sales[index].remainingAmount = Math.max(0, data.sales[index].grandTotal - Number(updates.paidAmount));
        if (data.sales[index].remainingAmount === 0) {
          data.sales[index].paymentStatus = "Lunas";
        }
      }

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Faktur ${data.sales[index].invoiceNumber} berhasil diperbarui`,
        data: data.sales[index],
      });
    }

    if (actionType === "purchase") {
      const index = (data.purchases || []).findIndex((p: any) => p.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Purchase Order tidak ditemukan" }, { status: 404 });
      }

      data.purchases[index] = {
        ...data.purchases[index],
        ...updates,
      };

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `PO ${data.purchases[index].poNumber} berhasil diperbarui`,
        data: data.purchases[index],
      });
    }

    return NextResponse.json({ success: false, error: "Tipe aksi tidak dikenali" }, { status: 400 });
  } catch (err) {
    console.error("Error updating finance record:", err);
    return NextResponse.json({ success: false, error: "Gagal memperbarui data keuangan" }, { status: 500 });
  }
}
