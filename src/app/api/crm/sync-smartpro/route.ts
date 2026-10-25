import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CRM_FILE = path.join(process.cwd(), "src", "data", "dstech_crm.json");
const SMARTPRO_URL = process.env.SMARTPRO_BASE_URL || "https://smartpro.dstechsmart.com";
const MASTER_SECRET = process.env.LICENSE_MASTER_KEY || "DSTECH-MASTER-PRO-2026";

export async function POST() {
  try {
    if (!fs.existsSync(CRM_FILE)) {
      return NextResponse.json({ success: false, error: "Database CRM tidak ditemukan" }, { status: 404 });
    }

    const content = fs.readFileSync(CRM_FILE, "utf-8");
    const parsed = JSON.parse(content);
    const leads = Array.isArray(parsed.leads) ? parsed.leads : [];

    if (leads.length === 0) {
      return NextResponse.json({ success: false, error: "Tidak ada data prospek untuk disinkronkan" }, { status: 400 });
    }

    // Format data untuk SmartPro (akun admin)
    const payload = {
      secret: MASTER_SECRET,
      leads: leads.map((l: any) => {
        let mappedStatus = l.stage || "NEW";
        let mappedTeam = l.team || "SALES";
        if (mappedStatus === "NEW_LEAD") mappedStatus = "NEW";
        if (mappedStatus === "QUALIFIED") mappedStatus = "FOLLOW_UP";
        if (mappedStatus === "PROPOSAL_SENT") mappedStatus = "NEGOTIATION";
        if (mappedStatus === "SUPPORT") mappedTeam = "SUPPORT";
        if (mappedStatus === "COMPLAINT") mappedTeam = "COMPLAINT";

        return {
          id: l.id,
          leadNumber: l.leadNumber,
          name: l.clientName + (l.company ? ` (${l.company})` : ""),
          phone: l.phone,
          email: l.email || "",
          category: l.category,
          projectTitle: l.projectTitle,
          value: Number(l.estimatedValue) || 0,
          status: mappedStatus,
          team: mappedTeam,
          source: l.source || "Website DSTech AI Chat",
          notes: `[CRM DSTech #${l.leadNumber}] ${l.projectTitle} - Lokasi: ${l.location || "-"} - Estimasi: Rp ${(l.estimatedValue || 0).toLocaleString("id-ID")}\nCatatan: ${l.notes || "-"}`,
        };
      }),
    };

    const res = await fetch(`${SMARTPRO_URL}/api/external/sync-crm-leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Gagal menghubungi server SmartPro WA Gateway" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menyinkronkan ${leads.length} prospek CRM ke akun utama SmartPro WA Gateway!`,
      syncedCount: leads.length,
      smartproResponse: result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
