import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
const MASTER_SECRET = process.env.LICENSE_MASTER_KEY || "DSTECH-MASTER-PRO-2026";

function readFinanceData(): any {
  try {
    if (fs.existsSync(FINANCE_FILE)) {
      const content = fs.readFileSync(FINANCE_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Gagal membaca dstech_finance_erp.json:", err);
  }
  return { sales: [], cash_flow: [] };
}

function writeFinanceData(data: any): boolean {
  try {
    fs.writeFileSync(FINANCE_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Gagal menulis dstech_finance_erp.json:", err);
    return false;
  }
}

// POST: Menerima Penjualan & Menerbitkan Faktur Resmi dari Seluruh Ekosistem Satelit
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { secret } = body;

    if (secret !== MASTER_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid Master Secret Key PT. DSTech Smart Perkasa" },
        { status: 403 }
      );
    }

    const {
      sourceApp = "SMARTPRO", // SMARTPRO | POS | MASJIDKUSMART | SMARTBOT
      orderId,
      customerName,
      customerPhone,
      customerEmail = "",
      customerAddress = "-",
      city = "Cilegon",
      items = [],
      subtotal = 0,
      taxRate = 11, // PPN PKP 11%
      taxAmount = 0,
      shippingCost = 0,
      grandTotal,
      paymentMethod = "Transfer Bank BCA PT",
      paymentStatus = "Lunas", // Lunas | Menunggu Pembayaran
      paidAmount = 0,
      notes = "",
    } = body;

    if (!orderId || !customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data transaksi tidak lengkap (orderId, customerName, dan items wajib diisi)" },
        { status: 400 }
      );
    }

    const financeData = readFinanceData();
    if (!Array.isArray(financeData.sales)) financeData.sales = [];
    if (!Array.isArray(financeData.cash_flow)) financeData.cash_flow = [];

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Tentukan Prefix Kode Aplikasi Satelit
    const appPrefixMap: Record<string, { code: string; label: string; cashCategory: string }> = {
      SMARTPRO: {
        code: "SP",
        label: "SmartPro WA Gateway",
        cashCategory: "Penerimaan Penjualan Paket SmartPro WA",
      },
      POS: {
        code: "POS",
        label: "Aplikasi Kasir POS",
        cashCategory: "Penerimaan Penjualan Kasir POS Mandiri",
      },
      MASJIDKUSMART: {
        code: "MSJ",
        label: "MasjidkuSmart.com",
        cashCategory: "Penerimaan Langganan MasjidkuSmart",
      },
      SMARTBOT: {
        code: "BOT",
        label: "SmartBot AI Assistant",
        cashCategory: "Penerimaan Layanan SmartBot AI",
      },
    };

    const appInfo = appPrefixMap[sourceApp.toUpperCase()] || {
      code: "EXT",
      label: sourceApp,
      cashCategory: `Penerimaan Layanan ${sourceApp}`,
    };

    // Cek apakah invoice sudah pernah diterbitkan sebelumnya
    const cleanId = `${sourceApp.toLowerCase()}_${String(orderId).replace(/[^a-zA-Z0-9]/g, "_")}`;
    let existingSale = financeData.sales.find(
      (s: any) => s.id === `dstech_inv_${cleanId}` || s.orderId === orderId || s.orderNumber === orderId
    );

    let invoiceNumber = existingSale?.invoiceNumber;
    let deliveryOrderNumber = existingSale?.deliveryOrderNumber;
    let receiptNumber = existingSale?.receiptNumber;

    if (!invoiceNumber) {
      const sameAppCount = financeData.sales.filter((s: any) => s.sourceApp === sourceApp).length + 1;
      const seq = String(sameAppCount).padStart(3, "0");
      invoiceNumber = `INV-DSTECH-${appInfo.code}-${yearMonth}-${seq}`;
      deliveryOrderNumber = `DO-DSTECH-${appInfo.code}-${yearMonth}-${seq}`;
      receiptNumber = `KWT-DSTECH-${appInfo.code}-${yearMonth}-${seq}`;
    }

    // Format item transaksi
    const formattedItems = items.map((it: any, idx: number) => ({
      id: String(idx + 1),
      productId: it.productId || `PROD-${appInfo.code}-${idx + 1}`,
      productName: it.productName || it.name || "Paket Layanan",
      qty: Number(it.qty) || Number(it.quantity) || 1,
      unit: it.unit || "Paket",
      price: Number(it.price) || 0,
      discount: Number(it.discount) || 0,
      total: (Number(it.qty) || Number(it.quantity) || 1) * (Number(it.price) || 0),
    }));

    const calculatedSubtotal = subtotal > 0 ? Number(subtotal) : formattedItems.reduce((acc, i) => acc + i.total, 0);
    const calculatedTax = taxAmount > 0 ? Number(taxAmount) : Math.round(calculatedSubtotal * (Number(taxRate || 11) / 100));
    const calculatedGrandTotal = grandTotal > 0 ? Number(grandTotal) : calculatedSubtotal + calculatedTax + Number(shippingCost || 0);

    const isLunas = paymentStatus === "Lunas" || paymentStatus === "PAID" || paymentStatus === "SETTLED";
    const actualPaid = isLunas ? (Number(paidAmount) || calculatedGrandTotal) : Number(paidAmount || 0);
    const actualRemaining = isLunas ? 0 : calculatedGrandTotal - actualPaid;

    const saleRecord = {
      id: `dstech_inv_${cleanId}`,
      invoiceNumber,
      deliveryOrderNumber,
      receiptNumber,
      sourceApp: sourceApp.toUpperCase(),
      sourceAppLabel: appInfo.label,
      orderId,
      orderNumber: String(orderId),
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      city,
      date: dateStr,
      dueDate: dateStr,
      invoiceType: isLunas ? "LUNAS" : "TEMPO",
      items: formattedItems,
      subtotal: calculatedSubtotal,
      discount: 0,
      discountType: "fixed",
      taxRate: Number(taxRate) || 11,
      taxAmount: calculatedTax,
      shippingCost: Number(shippingCost) || 0,
      grandTotal: calculatedGrandTotal,
      paymentMethod,
      paymentStatus: isLunas ? "Lunas" : "Menunggu Pembayaran",
      paidAmount: actualPaid,
      remainingAmount: actualRemaining,
      warehouseId: "dstech_wh_1",
      branchId: "dstech_branch_1",
      salesPerson: `${appInfo.label} Integration`,
      notes: notes || `Transaksi otomatis dari aplikasi ${appInfo.label} (ID: ${orderId})`,
      approvalStatus: "Disetujui & Sah",
      approvedBy: "RAMADHANI ST",
      approvedTitle: "Direktur PT. DSTech Smart Perkasa",
      approvedAt: dateStr,
      verificationCode: `VER-DST-${Math.floor(Math.random() * 899999 + 100000)}`,
      photos: [],
    };

    if (existingSale) {
      Object.assign(existingSale, saleRecord);
    } else {
      financeData.sales.unshift(saleRecord);
    }

    // Catat ke Buku Kas (Cash Flow) otomatis jika status lunas
    if (isLunas) {
      const existingCash = financeData.cash_flow.find((c: any) => c.reference === invoiceNumber || c.reference === String(orderId));
      if (!existingCash) {
        financeData.cash_flow.unshift({
          id: `dstech_cash_${Date.now()}_${appInfo.code.toLowerCase()}`,
          date: dateStr,
          type: "IN",
          category: appInfo.cashCategory,
          amount: actualPaid,
          account: paymentMethod,
          reference: invoiceNumber,
          description: `Penerimaan Penjualan ${appInfo.label} #${invoiceNumber} - ${customerName}`,
          balanceAfter: 0,
          receiptUrl: `/api/finance/print?doc=receipt&id=${receiptNumber}`,
          attachments: [],
        });
      }
    }

    writeFinanceData(financeData);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dstechsmart.com";
    return NextResponse.json({
      success: true,
      message: `Faktur penjualan resmi PT. DSTech Smart Perkasa berhasil diterbitkan untuk ${appInfo.label}`,
      data: {
        invoiceNumber,
        deliveryOrderNumber,
        receiptNumber,
        sourceApp: sourceApp.toUpperCase(),
        grandTotal: calculatedGrandTotal,
        paymentStatus: isLunas ? "Lunas" : "Menunggu Pembayaran",
        printInvoiceUrl: `${baseUrl}/api/finance/print?doc=invoice&id=${invoiceNumber}`,
        printDeliveryOrderUrl: `${baseUrl}/api/finance/print?doc=do&id=${deliveryOrderNumber}`,
        printReceiptUrl: `${baseUrl}/api/finance/print?doc=receipt&id=${receiptNumber}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// GET: Cek riwayat faktur yang diterbitkan dari aplikasi satelit tertentu
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const sourceApp = searchParams.get("sourceApp");

    if (secret !== MASTER_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const data = readFinanceData();
    let sales = Array.isArray(data.sales) ? data.sales : [];

    if (sourceApp && sourceApp !== "ALL") {
      sales = sales.filter((s: any) => s.sourceApp?.toUpperCase() === sourceApp.toUpperCase());
    }

    return NextResponse.json({
      success: true,
      data: sales,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
