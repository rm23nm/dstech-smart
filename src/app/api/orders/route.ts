import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_orders.json");
const USERS_FILE = path.join(process.cwd(), "src", "data", "dstech_users.json");

function readOrders(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return Array.isArray(parsed.orders) ? parsed.orders : [];
    }
  } catch (err) {
    console.error("Gagal membaca dstech_orders.json:", err);
  }
  return [];
}

function writeOrders(orders: any[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ orders }, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Gagal menulis dstech_orders.json:", err);
    return false;
  }
}

function syncOrderCustomerToUsers(order: any): void {
  try {
    if (!order || (!order.customerEmail && !order.customerPhone)) return;
    const email = (order.customerEmail || "").trim().toLowerCase();
    const phone = (order.customerPhone || "").trim();
    const name = (order.customerName || order.shippingAddress?.recipientName || "Pelanggan E-Store").trim();

    let users: any[] = [];
    if (fs.existsSync(USERS_FILE)) {
      users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }

    const existingClient = users.find(
      (u) =>
        u.role === "CLIENT" &&
        ((email && u.email && u.email.trim().toLowerCase() === email) ||
          (phone && u.phone && u.phone.trim() === phone))
    );

    if (!existingClient) {
      users.unshift({
        id: `dstech_usr_${order.userId || "client_" + Date.now()}`,
        name: name,
        email: email || `client_${phone.replace(/\D/g, "")}@dstechsmart.com`,
        role: "CLIENT",
        password: "dstech" + Math.floor(100 + Math.random() * 900),
        phone: phone || order.shippingAddress?.phone || "",
        status: "ACTIVE",
        expiresAt: null,
        attendanceLocationLock: "ANY",
        officeRadius: 100,
        position: "Pelanggan E-Store",
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Gagal sinkronisasi data pembeli ke users:", err);
  }
}

// GET: Ambil daftar pesanan (bisa difilter berdasarkan userId, email, atau orderNumber)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const orderNumber = searchParams.get("orderNumber");

    let orders = readOrders();

    if (orderNumber) {
      const match = orders.find(
        (o) => o.orderNumber?.toLowerCase() === orderNumber.trim().toLowerCase() || o.id === orderNumber.trim()
      );
      if (!match) {
        return NextResponse.json({ success: false, error: "Pesanan tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: match });
    }

    if (userId) {
      orders = orders.filter((o) => o.userId === userId);
    } else if (email) {
      orders = orders.filter((o) => o.customerEmail?.toLowerCase() === email.toLowerCase());
    } else {
      const orderNumbers = searchParams.get("orderNumbers");
      if (orderNumbers) {
        const list = orderNumbers.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
        orders = orders.filter(
          (o) => list.includes(o.orderNumber?.toLowerCase()) || list.includes(o.id?.toLowerCase())
        );
      }
    }

    // Urutkan dari yang paling baru
    orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Buat pesanan baru (Checkout Marketplace)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      includeInstallation,
      installationFee = 0,
      shippingCourier = "Armada Teknisi DSTech (Cilegon/Serang/Banten)",
      shippingCost = 0,
      paymentMethod = "TRANSFER_BANK",
      paymentBank = "BCA - 1234567890 a.n PT DSTech Smart Perkasa",
      notes = "",
    } = body;

    if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data pesanan tidak lengkap (Nama, No HP/WA, dan Item barang wajib diisi)" },
        { status: 400 }
      );
    }

    const orders = readOrders();

    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const countThisMonth = orders.filter((o) => o.createdAt && o.createdAt.startsWith(now.toISOString().slice(0, 7))).length + 1;
    const orderSeq = String(countThisMonth).padStart(3, "0");
    const orderNumber = `ORD/DST/${yearMonth}/${orderSeq}`;

    // Hitung subtotal barang
    const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
    
    // Kode Unik Transaksi (100 - 999) agar mudah diverifikasi di mutasi rekening bank secara manual
    let uniqueCode = Number(body.uniqueCode) || 0;
    if (!uniqueCode || uniqueCode < 100 || uniqueCode > 999) {
      uniqueCode = Math.floor(Math.random() * 899) + 100;
    }

    const installationTotal = includeInstallation ? Number(installationFee) || 0 : 0;
    const shippingTotal = Number(shippingCost) || 0;
    const grandTotal = subtotal + installationTotal + shippingTotal + uniqueCode;

    const initialTimeline = [
      {
        status: "PAYMENT_PENDING",
        title: "Pesanan Berhasil Dibuat",
        description: `Pesanan #${orderNumber} telah dibuat dengan total Rp ${grandTotal.toLocaleString("id-ID")} (termasuk kode unik verifikasi Rp ${uniqueCode}). Menunggu transfer pembayaran dari pelanggan.`,
        timestamp: now.toISOString(),
      },
    ];

    const newOrder = {
      id: `order_${Date.now()}`,
      orderNumber,
      userId: userId || `guest_${Date.now()}`,
      customerName,
      customerEmail: customerEmail || "",
      customerPhone,
      shippingAddress: {
        recipientName: shippingAddress?.recipientName || customerName,
        phone: shippingAddress?.phone || customerPhone,
        address: shippingAddress?.address || "Alamat belum diatur",
        city: shippingAddress?.city || "Cilegon",
        province: shippingAddress?.province || "Banten",
        postalCode: shippingAddress?.postalCode || "42411",
        notes: shippingAddress?.notes || "",
      },
      items: items.map((i: any) => ({
        productId: i.productId || i.id,
        productName: i.productName || i.name,
        price: Number(i.price) || 0,
        qty: Number(i.qty) || 1,
        image: i.image || "/service-cctv.png",
        category: i.category || "Perangkat Teknologi",
      })),
      includeInstallation: !!includeInstallation,
      installationFee: installationTotal,
      shippingCourier,
      shippingCost: shippingTotal,
      uniqueCode,
      trackingNumber: "", // Diisi saat status SHIPPED
      courierPhone: "",
      paymentMethod,
      paymentBank,
      paymentProof: null,
      paymentProofUploadedAt: null,
      notes,
      subtotal,
      grandTotal,
      status: "PAYMENT_PENDING", // PAYMENT_PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED | RETURN
      trackingTimeline: initialTimeline,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    orders.unshift(newOrder);
    writeOrders(orders);
    syncOrderCustomerToUsers(newOrder);

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil dibuat!",
      data: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Update status pesanan / upload bukti bayar / input nomor resi pengiriman
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      orderNumber,
      action,
      paymentProof,
      trackingNumber,
      shippingCourier,
      courierPhone,
      status,
      note,
      complaintCategory,
      complaintDetails,
      complaintSolution,
      complaintProof,
      complaintStatus,
    } = body;

    if (!id && !orderNumber) {
      return NextResponse.json({ success: false, error: "ID atau Nomor Pesanan wajib disertakan" }, { status: 400 });
    }

    const orders = readOrders();
    const index = orders.findIndex((o) => (id && o.id === id) || (orderNumber && o.orderNumber === orderNumber));

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const targetOrder = orders[index];
    const nowIso = new Date().toISOString();

    if (!Array.isArray(targetOrder.trackingTimeline)) {
      targetOrder.trackingTimeline = [];
    }

    if (action === "upload_proof") {
      // Pembeli mengunggah bukti pembayaran: Status TETAP PAYMENT_PENDING sampai diverifikasi Admin
      targetOrder.paymentProof = paymentProof;
      targetOrder.paymentProofUploadedAt = nowIso;
      targetOrder.trackingTimeline.push({
        status: "PAYMENT_PENDING",
        title: "Bukti Pembayaran Diunggah (Menunggu Verifikasi)",
        description: note || "Bukti transfer telah berhasil dikirim dan sedang dalam antrean verifikasi manual oleh Tim Keuangan PT DSTech Smart Perkasa.",
        timestamp: nowIso,
      });
    } else if (action === "confirm_payment") {
      // Admin mengonfirmasi pembayaran sah setelah cek mutasi rekening
      targetOrder.status = "PAID";
      targetOrder.confirmedAt = nowIso;
      targetOrder.trackingTimeline.push({
        status: "PAID",
        title: "Pembayaran Dikonfirmasi Sah (Lunas)",
        description: note || "Pembayaran telah dicocokkan dengan mutasi rekening bank dan dinyatakan sah lunas oleh Tim Keuangan PT DSTech Smart Perkasa.",
        timestamp: nowIso,
      });
    } else if (action === "process_packing") {
      // Gudang memproses & mengemas barang
      targetOrder.status = "PROCESSING";
      targetOrder.trackingTimeline.push({
        status: "PROCESSING",
        title: "Pesanan Sedang Diproses & Dikemas",
        description: note || "Barang sedang disiapkan dari gudang, uji fungsi kelayakan (QC), dan pengepakan bergaransi resmi.",
        timestamp: nowIso,
      });
    } else if (action === "ship_order") {
      // Pesanan diserahkan ke kurir / armada pengiriman
      targetOrder.status = "SHIPPED";
      if (trackingNumber) targetOrder.trackingNumber = trackingNumber;
      if (shippingCourier) targetOrder.shippingCourier = shippingCourier;
      if (courierPhone) targetOrder.courierPhone = courierPhone;
      targetOrder.trackingTimeline.push({
        status: "SHIPPED",
        title: "Pesanan Sedang Dikirim",
        description: note || `Pesanan dalam perjalanan pengantaran via ${targetOrder.shippingCourier}. No. Resi / Surat Jalan: ${targetOrder.trackingNumber || "DSP-ARMADA-INTERNAL"}.`,
        timestamp: nowIso,
      });
    } else if (action === "deliver_order") {
      // Pesanan telah sampai & diterima pembeli
      targetOrder.status = "DELIVERED";
      targetOrder.trackingTimeline.push({
        status: "DELIVERED",
        title: "Pesanan Telah Tiba & Selesai",
        description: note || "Barang telah berhasil diterima oleh pemesan. Garansi resmi 1 tahun DSTech Smart kini aktif.",
        timestamp: nowIso,
      });
    } else if (action === "cancel_order") {
      targetOrder.status = "CANCELLED";
      targetOrder.trackingTimeline.push({
        status: "CANCELLED",
        title: "Pesanan Dibatalkan",
        description: note || "Pesanan telah dibatalkan.",
        timestamp: nowIso,
      });
    } else if (action === "return_order" || action === "refund_order") {
      targetOrder.status = "RETURN";
      targetOrder.trackingTimeline.push({
        status: "RETURN",
        title: "Pengajuan Pengembalian / Retur Barang",
        description: note || "Pengajuan pengembalian barang & dana telah diajukan dan sedang diproses tim QC & Keuangan DSTech Smart.",
        timestamp: nowIso,
      });
    } else if (action === "submit_complaint") {
      // Pembeli mengajukan komplain pesanan
      targetOrder.hasComplaint = true;
      targetOrder.complaint = {
        category: complaintCategory || "Kendala Pesanan",
        description: complaintDetails || note || "Komplain diajukan oleh pembeli.",
        expectedSolution: complaintSolution || "Penyelesaian CS",
        proofImage: complaintProof || null,
        status: complaintStatus || "OPEN", // OPEN | IN_PROGRESS | RESOLVED
        submittedAt: nowIso,
        resolvedAt: null,
        adminNotes: "",
      };
      targetOrder.trackingTimeline.push({
        status: targetOrder.status,
        title: `Komplain Diajukan: ${complaintCategory || "Kendala Pesanan"}`,
        description: complaintDetails || note || "Pengajuan komplain pesanan telah diterima dan sedang ditinjau oleh tim After-Sales Customer Support PT DSTech Smart Perkasa.",
        timestamp: nowIso,
      });
    } else if (action === "resolve_complaint") {
      // Admin / CS menyelesaikan komplain
      if (targetOrder.complaint) {
        targetOrder.complaint.status = complaintStatus || "RESOLVED";
        targetOrder.complaint.resolvedAt = nowIso;
        targetOrder.complaint.adminNotes = note || "Komplain telah diselesaikan.";
      }
      targetOrder.trackingTimeline.push({
        status: targetOrder.status,
        title: "Status Komplain Diperbarui",
        description: note || `Penanganan komplain telah ditindaklanjuti dengan status: ${complaintStatus || "RESOLVED"}.`,
        timestamp: nowIso,
      });
    } else if (status) {
      // Custom status update
      targetOrder.status = status;
      if (trackingNumber) targetOrder.trackingNumber = trackingNumber;
      targetOrder.trackingTimeline.push({
        status,
        title: `Status Diperbarui: ${status}`,
        description: note || `Status pesanan diubah menjadi ${status}.`,
        timestamp: nowIso,
      });
    }

    targetOrder.updatedAt = nowIso;
    orders[index] = targetOrder;
    writeOrders(orders);

    return NextResponse.json({
      success: true,
      message: "Status pesanan berhasil diperbarui!",
      data: targetOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
