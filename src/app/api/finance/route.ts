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
    clients: [],
    suppliers: [],
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
  const clients = data.clients || [];
  const suppliers = data.suppliers || [];
  const quotations = data.quotations || [];

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

  const totalQuotationsValue = quotations.reduce((acc: number, curr: any) => acc + (Number(curr.grandTotal) || 0), 0);
  const totalQuotationsPending = quotations.filter((q: any) => q.status === "Terkirim" || q.status === "Draf").length;
  const totalQuotationsApproved = quotations.filter((q: any) => q.status === "Disetujui Klien").length;

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
    totalClientsCount: clients.length,
    totalSuppliersCount: suppliers.length,
    totalQuotationsCount: quotations.length,
    totalQuotationsValue,
    totalQuotationsPending,
    totalQuotationsApproved,
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

    if (actionType === "client") {
      const newClient = {
        id: `dstech_cli_${Date.now()}`,
        name: payload.name || "Klien Baru",
        category: payload.category || "B2B Industri",
        pic: payload.pic || "-",
        phone: payload.phone || "-",
        email: payload.email || "-",
        address: payload.address || "-",
        city: payload.city || "Cilegon",
        npwp: payload.npwp || "-",
        status: payload.status || "Aktif",
        totalInvoiced: Number(payload.totalInvoiced) || 0,
        totalPaid: Number(payload.totalPaid) || 0,
        unpaidReceivable: Number(payload.unpaidReceivable) || 0,
        notes: payload.notes || "-",
      };

      if (!data.clients) data.clients = [];
      data.clients.unshift(newClient);

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Klien ${newClient.name} berhasil ditambahkan`,
        data: newClient,
      });
    }

    if (actionType === "supplier") {
      const newSupplier = {
        id: `dstech_sup_${Date.now()}`,
        name: payload.name || "Supplier Baru",
        category: payload.category || "CCTV, NVR & Security Hardware",
        pic: payload.pic || "-",
        phone: payload.phone || "-",
        email: payload.email || "-",
        address: payload.address || "-",
        city: payload.city || "Cilegon",
        bankAccount: payload.bankAccount || "-",
        paymentTerms: payload.paymentTerms || "Net 30 Hari",
        status: payload.status || "Mitra Aktif",
        totalPurchases: Number(payload.totalPurchases) || 0,
        unpaidPayable: Number(payload.unpaidPayable) || 0,
        notes: payload.notes || "-",
      };

      if (!data.suppliers) data.suppliers = [];
      data.suppliers.unshift(newSupplier);

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Supplier ${newSupplier.name} berhasil ditambahkan`,
        data: newSupplier,
      });
    }

    if (actionType === "bank_account") {
      const newBank = {
        id: payload.id || `dstech_bank_${Date.now()}`,
        bankName: payload.bankName || "Bank Mandiri",
        accountNumber: payload.accountNumber || "-",
        accountHolder: payload.accountHolder || "PT. DSTech Smart Perkasa",
        branch: payload.branch || "Cilegon",
        isDefault: Boolean(payload.isDefault),
        status: payload.status || "Aktif",
      };

      if (!data.bank_accounts) data.bank_accounts = [];
      if (newBank.isDefault) {
        data.bank_accounts.forEach((b: any) => (b.isDefault = false));
      }
      data.bank_accounts.push(newBank);
      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Rekening ${newBank.bankName} berhasil disimpan`,
        data: newBank,
      });
    }

    if (actionType === "sale") {
      const newInvoiceNumber = `INV-DSTECH-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(
        (data.sales?.length || 0) + 1
      ).padStart(3, "0")}`;

      const grandTotal = Number(payload.grandTotal) || 0;
      const paidAmount = Number(payload.paidAmount) || 0;
      const remainingAmount = Math.max(0, grandTotal - paidAmount);
      const isDp = payload.invoiceType === "DP";
      const dpAmount = Number(payload.dpAmount) || 0;
      const dpPercentage = Number(payload.dpPercentage) || (grandTotal > 0 ? Math.round((dpAmount / grandTotal) * 100) : 0);

      let paymentStatus = "Belum Lunas";
      if (remainingAmount === 0) {
        paymentStatus = "Lunas";
      } else if (isDp) {
        if (paidAmount >= dpAmount && dpAmount > 0) {
          paymentStatus = "DP Lunas (Sisa Pelunasan)";
        } else if (paidAmount > 0) {
          paymentStatus = "Sebagian DP";
        } else {
          paymentStatus = "Menunggu DP";
        }
      } else if (paidAmount > 0) {
        paymentStatus = "Sebagian";
      }

      const newSale = {
        id: `dstech_inv_${Date.now()}`,
        invoiceNumber: payload.invoiceNumber || newInvoiceNumber,
        customerName: payload.customerName || "Klien Umum",
        customerPhone: payload.customerPhone || "-",
        customerAddress: payload.customerAddress || "-",
        date: payload.date || new Date().toISOString().split("T")[0],
        dueDate: payload.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        invoiceType: isDp ? "DP" : "Standard",
        dpPercentage: isDp ? dpPercentage : 0,
        dpAmount: isDp ? dpAmount : 0,
        dpStatus: isDp
          ? paidAmount >= dpAmount && dpAmount > 0
            ? "Lunas DP"
            : paidAmount > 0
            ? "Sebagian DP"
            : "Menunggu Pembayaran DP"
          : "Bukan DP",
        dpPaidAmount: isDp ? Math.min(paidAmount, dpAmount) : 0,
        dpNotes: payload.dpNotes || (isDp ? `Pengajuan Uang Muka (DP ${dpPercentage}%) pelaksanaan pekerjaan` : "-"),
        items: payload.items || [],
        subtotal: Number(payload.subtotal) || 0,
        discount: Number(payload.discount) || 0,
        taxRate: Number(payload.taxRate) || 11,
        taxAmount: Number(payload.taxAmount) || 0,
        grandTotal,
        paymentMethod: payload.paymentMethod || "Transfer Bank Mandiri PT DSTech Smart Perkasa",
        paymentStatus: payload.paymentStatus || paymentStatus,
        paidAmount,
        remainingAmount,
        warehouseId: payload.warehouseId || "dstech_wh_1",
        branchId: payload.branchId || "dstech_branch_1",
        salesPerson: payload.salesPerson || "DSTech Admin",
        notes: payload.notes || "-",
        approvalStatus: payload.approvalStatus || "Menunggu Approval",
        approvedBy: payload.approvedBy || "",
        approvedTitle: payload.approvedTitle || "",
        approvedAt: payload.approvedAt || "",
        verificationCode: payload.verificationCode || "",
        signatureImage: payload.signatureImage || "",
      };

      if (!data.sales) data.sales = [];
      data.sales.unshift(newSale);

      // Catat ke arus kas jika ada pembayaran masuk langsung
      if (paidAmount > 0) {
        if (!data.cash_flow) data.cash_flow = [];
        const cashCategory = isDp ? "Uang Muka Penjualan" : "Penerimaan Penjualan";
        data.cash_flow.unshift({
          id: `dstech_cash_${Date.now()}`,
          date: newSale.date,
          type: "IN",
          category: cashCategory,
          amount: paidAmount,
          account: newSale.paymentMethod.includes("BCA") ? "Bank BCA DSTech" : "Bank Mandiri PT DSTech Smart Perkasa",
          reference: newSale.invoiceNumber,
          description: `Penerimaan ${isDp ? "DP" : "faktur"} penjualan ${newSale.invoiceNumber} - ${newSale.customerName}`,
          balanceAfter: 0,
        });
      }

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Faktur penjualan ${newSale.invoiceNumber} ${isDp ? "(Pengajuan DP)" : ""} berhasil disimpan`,
        data: newSale,
      });
    }

    if (actionType === "approve_document") {
      const { documentType = "sale", id, signatureImage, signerName, signerTitle, notes } = payload;
      const signer = signerName || data.settings?.signerName || "H. Agus Supriyadi, S.T., M.Kom.";
      const title = signerTitle || data.settings?.signerTitle || "Direktur Keuangan & Operasional";
      const now = new Date();
      const codeDate = now.toISOString().slice(0, 7).replace("-", "");
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const verificationCode = `DST-APP-${codeDate}-${randomDigits}`;
      const approvedAt = `${now.toISOString().split("T")[0]} ${now.toTimeString().slice(0, 5)} WIB`;

      if (documentType === "sale") {
        const sales = data.sales || [];
        const index = sales.findIndex((s: any) => s.id === id || s.invoiceNumber === id);
        if (index === -1) {
          return NextResponse.json({ success: false, error: "Faktur penjualan tidak ditemukan" }, { status: 404 });
        }

        sales[index].approvalStatus = "Disetujui & Sah";
        sales[index].approvedBy = signer;
        sales[index].approvedTitle = title;
        sales[index].approvedAt = approvedAt;
        sales[index].verificationCode = verificationCode;
        if (signatureImage) {
          sales[index].signatureImage = signatureImage;
        }
        if (notes) {
          sales[index].approvalNotes = notes;
        }

        writeFinanceData(data);
        return NextResponse.json({
          success: true,
          message: `Faktur ${sales[index].invoiceNumber} berhasil disetujui & disahkan secara resmi oleh ${signer}`,
          data: sales[index],
        });
      }

      if (documentType === "purchase") {
        const purchases = data.purchases || [];
        const index = purchases.findIndex((p: any) => p.id === id || p.poNumber === id);
        if (index === -1) {
          return NextResponse.json({ success: false, error: "Purchase Order tidak ditemukan" }, { status: 404 });
        }

        purchases[index].approvalStatus = "Disetujui & Sah";
        purchases[index].approvedBy = signer;
        purchases[index].approvedTitle = title;
        purchases[index].approvedAt = approvedAt;
        purchases[index].verificationCode = verificationCode;
        if (signatureImage) {
          purchases[index].signatureImage = signatureImage;
        }

        writeFinanceData(data);
        return NextResponse.json({
          success: true,
          message: `Purchase Order ${purchases[index].poNumber} berhasil disetujui & disahkan oleh ${signer}`,
          data: purchases[index],
        });
      }

      if (documentType === "quotation") {
        const quotations = data.quotations || [];
        const index = quotations.findIndex((q: any) => q.id === id || q.quotationNumber === id);
        if (index === -1) {
          return NextResponse.json({ success: false, error: "Surat Penawaran tidak ditemukan" }, { status: 404 });
        }

        quotations[index].approvalStatus = "Disetujui & Sah";
        quotations[index].approvedBy = signer;
        quotations[index].approvedTitle = title;
        quotations[index].approvedAt = approvedAt;
        quotations[index].verificationCode = verificationCode;
        if (signatureImage) {
          quotations[index].signatureImage = signatureImage;
        }
        if (notes) {
          quotations[index].approvalNotes = notes;
        }

        writeFinanceData(data);
        return NextResponse.json({
          success: true,
          message: `Surat Penawaran ${quotations[index].quotationNumber} berhasil disetujui & disahkan secara resmi oleh ${signer}`,
          data: quotations[index],
        });
      }

      return NextResponse.json({ success: false, error: "Tipe dokumen tidak dikenali" }, { status: 400 });
    }

    if (actionType === "record_payment") {
      const { invoiceId, paymentAmount, paymentMethod, paymentDate, notes } = payload;
      const sales = data.sales || [];
      const invoiceIndex = sales.findIndex((s: any) => s.id === invoiceId || s.invoiceNumber === invoiceId);

      if (invoiceIndex === -1) {
        return NextResponse.json({ success: false, error: "Faktur penjualan tidak ditemukan" }, { status: 404 });
      }

      const invoice = sales[invoiceIndex];
      const amountToPay = Number(paymentAmount) || 0;
      if (amountToPay <= 0) {
        return NextResponse.json({ success: false, error: "Nominal pembayaran harus lebih besar dari Rp 0" }, { status: 400 });
      }

      const newPaidAmount = (Number(invoice.paidAmount) || 0) + amountToPay;
      const newRemaining = Math.max(0, (Number(invoice.grandTotal) || 0) - newPaidAmount);

      let newPaymentStatus = "Sebagian";
      if (newRemaining === 0) {
        newPaymentStatus = "Lunas";
      } else if (invoice.invoiceType === "DP") {
        if (newPaidAmount >= (Number(invoice.dpAmount) || 0)) {
          newPaymentStatus = "DP Lunas (Sisa Pelunasan)";
          invoice.dpStatus = "Lunas DP";
          invoice.dpPaidAmount = Math.min(newPaidAmount, Number(invoice.dpAmount) || newPaidAmount);
        } else {
          newPaymentStatus = "Sebagian DP";
          invoice.dpStatus = "Sebagian DP";
        }
      }

      invoice.paidAmount = newPaidAmount;
      invoice.remainingAmount = newRemaining;
      invoice.paymentStatus = newPaymentStatus;

      // Catat ke Arus Kas
      if (!data.cash_flow) data.cash_flow = [];
      const isDpPayment = invoice.invoiceType === "DP" && newPaidAmount <= (Number(invoice.dpAmount) || 0);
      const cashCategory = isDpPayment ? "Uang Muka Penjualan" : "Pelunasan Penjualan";

      data.cash_flow.unshift({
        id: `dstech_cash_${Date.now()}`,
        date: paymentDate || new Date().toISOString().split("T")[0],
        type: "IN",
        category: cashCategory,
        amount: amountToPay,
        account: paymentMethod || invoice.paymentMethod || "Bank Mandiri PT DSTech Smart Perkasa",
        reference: invoice.invoiceNumber,
        description: `Penerimaan ${invoice.invoiceType === "DP" ? "DP / Termin" : "Pelunasan"} ${invoice.invoiceNumber} - ${invoice.customerName} (${notes || "Pembayaran Masuk"})`,
        balanceAfter: 0,
      });

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Pembayaran sebesar Rp ${amountToPay.toLocaleString("id-ID")} berhasil dibukukan untuk faktur ${invoice.invoiceNumber}`,
        data: invoice,
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

    if (actionType === "quotation") {
      const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
      const newSphNumber = `SPH-DSTECH-${yearMonth}-${String((data.quotations?.length || 0) + 1).padStart(3, "0")}`;

      const items = Array.isArray(payload.items) ? payload.items : [];
      const subtotal = items.reduce((acc: number, curr: any) => acc + (Number(curr.total) || 0), 0);
      const discount = Number(payload.discount) || 0;
      const afterDiscount = Math.max(0, subtotal - discount);
      const taxRate = Number(payload.taxRate) || 0;
      const taxAmount = taxRate > 0 ? Math.round((afterDiscount * taxRate) / 100) : 0;
      const grandTotal = afterDiscount + taxAmount;

      const dateStr = payload.date || new Date().toISOString().split("T")[0];
      const validityDays = Number(payload.validityDays) || 14;
      const validUntilDate = new Date(new Date(dateStr).getTime() + validityDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const newQuotation = {
        id: `dstech_sph_${Date.now()}`,
        quotationNumber: payload.quotationNumber || newSphNumber,
        clientId: payload.clientId || "",
        customerName: payload.customerName || "Klien DSTech",
        customerOrg: payload.customerOrg || payload.customerName || "-",
        customerPhone: payload.customerPhone || "-",
        customerAddress: payload.customerAddress || "-",
        subject: payload.subject || "Penawaran Pengadaan & Instalasi Sistem Keamanan",
        date: dateStr,
        validUntil: payload.validUntil || validUntilDate,
        validityDays: validityDays,
        items: items,
        subtotal: subtotal,
        discount: discount,
        taxRate: taxRate,
        taxAmount: taxAmount,
        grandTotal: grandTotal,
        terms: payload.terms || "1. Harga sudah termasuk instalasi, kabel pelindung, dan pengujian kelayakan sistem.\n2. Garansi resmi unit perangkat selama 2 (dua) tahun dan pemeliharaan teknis 6 (enam) bulan.\n3. Skema Pembayaran: Down Payment (DP) 50% saat penerbitan SPK, Pelunasan 50% setelah Berita Acara Serah Terima (BAST).\n4. Penawaran harga ini berlaku selama 14 (empat belas) hari kalender sejak diterbitkan.",
        status: payload.status || "Terkirim",
        convertedInvoiceId: "",
        approvalStatus: payload.approvalStatus || "Menunggu Approval",
        approvedBy: payload.approvedBy || "",
        approvedTitle: payload.approvedTitle || "",
        approvedAt: payload.approvedAt || "",
        verificationCode: payload.verificationCode || "",
        notes: payload.notes || "-",
      };

      if (!data.quotations) data.quotations = [];
      data.quotations.unshift(newQuotation);

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Surat Penawaran ${newQuotation.quotationNumber} berhasil dibuat`,
        data: newQuotation,
      });
    }

    if (actionType === "convert_quotation_to_sale") {
      const { quotationId, invoiceType, dpPercentage, dpNotes } = payload;
      const quotations = data.quotations || [];
      const qIndex = quotations.findIndex((q: any) => q.id === quotationId || q.quotationNumber === quotationId);

      if (qIndex === -1) {
        return NextResponse.json({ success: false, error: "Surat Penawaran (SPH) tidak ditemukan" }, { status: 404 });
      }

      const sph = quotations[qIndex];
      const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
      const newInvoiceNumber = `INV-DSTECH-${yearMonth}-${String((data.sales?.length || 0) + 1).padStart(3, "0")}`;

      const grandTotal = Number(sph.grandTotal) || 0;
      const isDp = invoiceType === "DP" || (Number(dpPercentage) > 0);
      const dpPct = isDp ? (Number(dpPercentage) || 50) : 0;
      const dpAmount = isDp ? Math.round((grandTotal * dpPct) / 100) : 0;

      const newSale = {
        id: `dstech_inv_${Date.now()}`,
        invoiceNumber: newInvoiceNumber,
        customerName: sph.customerName,
        customerPhone: sph.customerPhone,
        customerAddress: sph.customerAddress,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        invoiceType: isDp ? "DP" : "Standard",
        dpPercentage: dpPct,
        dpAmount: dpAmount,
        dpStatus: isDp ? "Menunggu Pembayaran DP" : "Bukan DP",
        dpPaidAmount: 0,
        dpNotes: dpNotes || `Pengajuan DP ${dpPct}% dari penawaran ${sph.quotationNumber}`,
        items: sph.items || [],
        subtotal: sph.subtotal,
        discount: sph.discount,
        taxRate: sph.taxRate,
        taxAmount: sph.taxAmount,
        grandTotal: grandTotal,
        paymentMethod: "Transfer Bank Mandiri",
        paymentStatus: isDp ? "Menunggu DP" : "Belum Lunas",
        paidAmount: 0,
        remainingAmount: grandTotal,
        warehouseId: "dstech_wh_1",
        branchId: "dstech_branch_1",
        salesPerson: "DSTech Commercial Team",
        notes: `Konversi otomatis dari Surat Penawaran ${sph.quotationNumber} (${sph.subject})`,
        approvalStatus: sph.approvalStatus || "Menunggu Approval",
        approvedBy: sph.approvedBy || "",
        approvedTitle: sph.approvedTitle || "",
        approvedAt: sph.approvedAt || "",
        verificationCode: sph.verificationCode || "",
      };

      if (!data.sales) data.sales = [];
      data.sales.unshift(newSale);

      // Perbarui status SPH
      sph.status = "Terkonversi Faktur";
      sph.convertedInvoiceId = newSale.invoiceNumber;
      quotations[qIndex] = sph;

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Surat Penawaran ${sph.quotationNumber} berhasil dikonversi menjadi Faktur Penjualan ${newSale.invoiceNumber}!`,
        data: {
          sale: newSale,
          quotation: sph,
        },
      });
    }

    if (actionType === "warehouse") {
      const newWarehouse = {
        id: payload.id || `dstech_wh_${Date.now()}`,
        code: payload.code || `GD-${(data.warehouses?.length || 0) + 1}`,
        name: payload.name || "Gudang Logistik Baru",
        type: payload.type || "Gudang Pusat",
        address: payload.address || "-",
        city: payload.city || "Cilegon",
        pic: payload.pic || "Staff Gudang",
        phone: payload.phone || "-",
        totalItemTypes: Number(payload.totalItemTypes) || 0,
        totalValuation: Number(payload.totalValuation) || 0,
        status: payload.status || "Aktif",
        notes: payload.notes || "-",
      };

      if (!data.warehouses) data.warehouses = [];
      data.warehouses.push(newWarehouse);
      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Titik Gudang ${newWarehouse.name} berhasil ditambahkan`,
        data: newWarehouse,
      });
    }

    if (actionType === "branch") {
      const newBranch = {
        id: payload.id || `dstech_branch_${Date.now()}`,
        code: payload.code || `BR-${String((data.branches?.length || 0) + 1).padStart(2, "0")}`,
        name: payload.name || "Kantor Cabang Baru",
        city: payload.city || "Cilegon",
        address: payload.address || "-",
        head: payload.head || "Kepala Cabang",
        phone: payload.phone || "-",
        email: payload.email || "-",
        coverage: payload.coverage || "-",
        status: payload.status || "Kantor Cabang",
        notes: payload.notes || "-",
      };

      if (!data.branches) data.branches = [];
      data.branches.push(newBranch);
      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Kantor Cabang ${newBranch.name} berhasil ditambahkan`,
        data: newBranch,
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

    if (!updates) {
      return NextResponse.json({ success: false, error: "Data pembaruan wajib disertakan" }, { status: 400 });
    }

    if (actionType === "settings") {
      data.settings = {
        ...(data.settings || {}),
        ...updates,
      };
      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: "Pengaturan berhasil diperbarui",
        data: data.settings,
      });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "ID wajib disertakan" }, { status: 400 });
    }

    if (actionType === "client") {
      const index = (data.clients || []).findIndex((c: any) => c.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Klien tidak ditemukan" }, { status: 404 });
      }

      data.clients[index] = {
        ...data.clients[index],
        ...updates,
      };

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Klien ${data.clients[index].name} berhasil diperbarui`,
        data: data.clients[index],
      });
    }

    if (actionType === "supplier") {
      const index = (data.suppliers || []).findIndex((s: any) => s.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Supplier tidak ditemukan" }, { status: 404 });
      }

      data.suppliers[index] = {
        ...data.suppliers[index],
        ...updates,
      };

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Supplier ${data.suppliers[index].name} berhasil diperbarui`,
        data: data.suppliers[index],
      });
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

      // Recalculate remaining amount and status
      const currentGrand = Number(data.sales[index].grandTotal) || 0;
      const currentPaid = Number(data.sales[index].paidAmount) || 0;
      const currentDp = Number(data.sales[index].dpAmount) || 0;
      const currentRemaining = Math.max(0, currentGrand - currentPaid);
      data.sales[index].remainingAmount = currentRemaining;

      if (currentRemaining === 0) {
        data.sales[index].paymentStatus = "Lunas";
      } else if (data.sales[index].invoiceType === "DP") {
        if (currentPaid >= currentDp && currentDp > 0) {
          data.sales[index].paymentStatus = "DP Lunas (Sisa Pelunasan)";
          data.sales[index].dpStatus = "Lunas DP";
        } else if (currentPaid > 0) {
          data.sales[index].paymentStatus = "Sebagian DP";
          data.sales[index].dpStatus = "Sebagian DP";
        } else {
          data.sales[index].paymentStatus = "Menunggu DP";
          data.sales[index].dpStatus = "Menunggu Pembayaran DP";
        }
      } else if (currentPaid > 0) {
        data.sales[index].paymentStatus = "Sebagian";
      } else {
        data.sales[index].paymentStatus = "Belum Lunas";
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

    if (actionType === "bank_account") {
      const index = (data.bank_accounts || []).findIndex((b: any) => b.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Rekening bank tidak ditemukan" }, { status: 404 });
      }
      if (updates.isDefault) {
        (data.bank_accounts || []).forEach((b: any) => (b.isDefault = false));
      }
      data.bank_accounts[index] = {
        ...data.bank_accounts[index],
        ...updates,
      };
      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Rekening bank ${data.bank_accounts[index].bankName} berhasil diperbarui`,
        data: data.bank_accounts[index],
      });
    }

    if (actionType === "quotation") {
      const index = (data.quotations || []).findIndex((q: any) => q.id === id || q.quotationNumber === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Surat Penawaran tidak ditemukan" }, { status: 404 });
      }

      data.quotations[index] = {
        ...data.quotations[index],
        ...updates,
      };

      if (updates.items || updates.discount !== undefined || updates.taxRate !== undefined) {
        const items = data.quotations[index].items || [];
        const subtotal = items.reduce((acc: number, curr: any) => acc + (Number(curr.total) || 0), 0);
        const discount = Number(data.quotations[index].discount) || 0;
        const afterDiscount = Math.max(0, subtotal - discount);
        const taxRate = Number(data.quotations[index].taxRate) || 0;
        const taxAmount = taxRate > 0 ? Math.round((afterDiscount * taxRate) / 100) : 0;
        data.quotations[index].subtotal = subtotal;
        data.quotations[index].taxAmount = taxAmount;
        data.quotations[index].grandTotal = afterDiscount + taxAmount;
      }

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Surat Penawaran ${data.quotations[index].quotationNumber} berhasil diperbarui`,
        data: data.quotations[index],
      });
    }

    if (actionType === "warehouse") {
      const index = (data.warehouses || []).findIndex((w: any) => w.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Gudang tidak ditemukan" }, { status: 404 });
      }

      data.warehouses[index] = {
        ...data.warehouses[index],
        ...updates,
      };

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Titik Gudang ${data.warehouses[index].name} berhasil diperbarui`,
        data: data.warehouses[index],
      });
    }

    if (actionType === "branch") {
      const index = (data.branches || []).findIndex((b: any) => b.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Cabang tidak ditemukan" }, { status: 404 });
      }

      data.branches[index] = {
        ...data.branches[index],
        ...updates,
      };

      writeFinanceData(data);
      return NextResponse.json({
        success: true,
        message: `Kantor Cabang ${data.branches[index].name} berhasil diperbarui`,
        data: data.branches[index],
      });
    }

    return NextResponse.json({ success: false, error: "Tipe aksi tidak dikenali" }, { status: 400 });
  } catch (err) {
    console.error("Error updating finance record:", err);
    return NextResponse.json({ success: false, error: "Gagal memperbarui data keuangan" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const actionType = url.searchParams.get("actionType");
    const id = url.searchParams.get("id");

    if (!actionType || !id) {
      return NextResponse.json({ success: false, error: "actionType dan id wajib disertakan" }, { status: 400 });
    }

    const data = readFinanceData();

    if (actionType === "client") {
      const initialLen = (data.clients || []).length;
      data.clients = (data.clients || []).filter((c: any) => c.id !== id);
      if (data.clients.length === initialLen) {
        return NextResponse.json({ success: false, error: "Klien tidak ditemukan" }, { status: 404 });
      }
      writeFinanceData(data);
      return NextResponse.json({ success: true, message: "Klien berhasil dihapus" });
    }

    if (actionType === "supplier") {
      const initialLen = (data.suppliers || []).length;
      data.suppliers = (data.suppliers || []).filter((s: any) => s.id !== id);
      if (data.suppliers.length === initialLen) {
        return NextResponse.json({ success: false, error: "Supplier tidak ditemukan" }, { status: 404 });
      }
      writeFinanceData(data);
      return NextResponse.json({ success: true, message: "Supplier berhasil dihapus" });
    }

    if (actionType === "sale") {
      const initialLen = (data.sales || []).length;
      data.sales = (data.sales || []).filter((s: any) => s.id !== id && s.invoiceNumber !== id);
      if (data.sales.length === initialLen) {
        return NextResponse.json({ success: false, error: "Faktur tidak ditemukan" }, { status: 404 });
      }
      writeFinanceData(data);
      return NextResponse.json({ success: true, message: "Faktur penjualan berhasil dihapus" });
    }

    if (actionType === "bank_account") {
      const initialLen = (data.bank_accounts || []).length;
      data.bank_accounts = (data.bank_accounts || []).filter((b: any) => b.id !== id);
      if (data.bank_accounts.length === initialLen) {
        return NextResponse.json({ success: false, error: "Rekening tidak ditemukan" }, { status: 404 });
      }
      writeFinanceData(data);
      return NextResponse.json({ success: true, message: "Rekening bank berhasil dihapus" });
    }

    if (actionType === "quotation") {
      const initialLen = (data.quotations || []).length;
      data.quotations = (data.quotations || []).filter((q: any) => q.id !== id && q.quotationNumber !== id);
      if (data.quotations.length === initialLen) {
        return NextResponse.json({ success: false, error: "Surat Penawaran tidak ditemukan" }, { status: 404 });
      }
      writeFinanceData(data);
      return NextResponse.json({ success: true, message: "Surat Penawaran berhasil dihapus" });
    }

    if (actionType === "warehouse") {
      const initialLen = (data.warehouses || []).length;
      data.warehouses = (data.warehouses || []).filter((w: any) => w.id !== id);
      if (data.warehouses.length === initialLen) {
        return NextResponse.json({ success: false, error: "Gudang tidak ditemukan" }, { status: 404 });
      }
      writeFinanceData(data);
      return NextResponse.json({ success: true, message: "Titik Gudang berhasil dihapus" });
    }

    if (actionType === "branch") {
      const initialLen = (data.branches || []).length;
      data.branches = (data.branches || []).filter((b: any) => b.id !== id);
      if (data.branches.length === initialLen) {
        return NextResponse.json({ success: false, error: "Cabang tidak ditemukan" }, { status: 404 });
      }
      writeFinanceData(data);
      return NextResponse.json({ success: true, message: "Kantor Cabang berhasil dihapus" });
    }

    return NextResponse.json({ success: false, error: "Tipe aksi DELETE tidak dikenali" }, { status: 400 });
  } catch (err) {
    console.error("Error deleting finance record:", err);
    return NextResponse.json({ success: false, error: "Gagal menghapus data" }, { status: 500 });
  }
}
