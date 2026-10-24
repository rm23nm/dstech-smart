import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_orders.json");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || searchParams.get("orderNumber") || searchParams.get("trackingNumber") || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Nomor Pesanan atau Nomor Resi wajib diisi" },
        { status: 400 }
      );
    }

    if (!fs.existsSync(DATA_FILE)) {
      return NextResponse.json(
        { success: false, error: "Data pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(content);
    const orders: any[] = Array.isArray(parsed.orders) ? parsed.orders : [];

    const matched = orders.find((o) => {
      const matchOrderNo = o.orderNumber && o.orderNumber.toLowerCase() === query;
      const matchId = o.id && o.id.toLowerCase() === query;
      const matchResi = o.trackingNumber && o.trackingNumber.toLowerCase() === query;
      return matchOrderNo || matchId || matchResi;
    });

    if (!matched) {
      return NextResponse.json(
        {
          success: false,
          error: `Pesanan atau No. Resi "${query}" tidak ditemukan dalam sistem pelacakan DSTech Smart.`,
        },
        { status: 404 }
      );
    }

    // Kembalikan data pelacakan yang aman untuk publik
    return NextResponse.json({
      success: true,
      data: {
        id: matched.id,
        orderNumber: matched.orderNumber,
        createdAt: matched.createdAt,
        updatedAt: matched.updatedAt,
        status: matched.status,
        customerName: matched.customerName,
        destinationCity: matched.shippingAddress?.city || "Cilegon",
        destinationProvince: matched.shippingAddress?.province || "Banten",
        shippingCourier: matched.shippingCourier,
        trackingNumber: matched.trackingNumber,
        courierPhone: matched.courierPhone,
        itemsCount: (matched.items || []).length,
        itemsSummary: (matched.items || []).map((i: any) => `${i.productName} (x${i.qty})`).join(", "),
        subtotal: matched.subtotal,
        grandTotal: matched.grandTotal,
        paymentMethod: matched.paymentMethod,
        trackingTimeline: matched.trackingTimeline || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
