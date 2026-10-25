import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_orders.json");

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
    const grandTotal = subtotal + (includeInstallation ? Number(installationFee) || 0 : 0) + (Number(shippingCost) || 0);

    const initialTimeline = [
      {
        status: "PAYMENT_PENDING",
        title: "Pesanan Berhasil Dibuat",
        description: `Pesanan #${orderNumber} telah dibuat. Menunggu konfirmasi pembayaran dari pelanggan.`,
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
      installationFee: includeInstallation ? Number(installationFee) || 0 : 0,
      shippingCourier,
      shippingCost: Number(shippingCost) || 0,
      trackingNumber: "", // Diisi saat status SHIPPED
      courierPhone: "",
      paymentMethod,
      paymentBank,
      paymentProof: null,
      notes,
      subtotal,
      grandTotal,
      status: "PAYMENT_PENDING", // PAYMENT_PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED
      trackingTimeline: initialTimeline,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    orders.unshift(newOrder);
    writeOrders(orders);

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
    const { id, orderNumber, action, paymentProof, trackingNumber, shippingCourier, courierPhone, status, note } = body;

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
      // Pembeli mengunggah bukti pembayaran
      targetOrder.paymentProof = paymentProof;
      targetOrder.status = "PAID";
      targetOrder.trackingTimeline.push({
        status: "PAID",
        title: "Bukti Pembayaran Diunggah",
        description: note || "Bukti transfer telah diterima dan sedang diverifikasi oleh Tim Keuangan DSTech Smart.",
        timestamp: nowIso,
      });
    } else if (action === "confirm_payment") {
      // Admin mengonfirmasi pembayaran sah
      targetOrder.status = "PAID";
      targetOrder.trackingTimeline.push({
        status: "PAID",
        title: "Pembayaran Dikonfirmasi Sah",
        description: note || "Pembayaran telah tervalidasi lunas di rekening resmi PT. DSTech Smart Perkasa.",
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
