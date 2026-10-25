import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CRM_FILE = path.join(process.cwd(), "src", "data", "dstech_crm.json");

function readCrmData(): { leads: any[] } {
  try {
    if (fs.existsSync(CRM_FILE)) {
      const content = fs.readFileSync(CRM_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return { leads: Array.isArray(parsed.leads) ? parsed.leads : [] };
    }
  } catch (err) {
    console.error("Gagal membaca dstech_crm.json:", err);
  }
  return { leads: [] };
}

function writeCrmData(data: { leads: any[] }): boolean {
  try {
    fs.writeFileSync(CRM_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Gagal menulis dstech_crm.json:", err);
    return false;
  }
}

// GET: Ambil daftar leads CRM & kalkulasi metrik finansial pipeline
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const stage = searchParams.get("stage");
    const q = searchParams.get("q")?.toLowerCase();

    const data = readCrmData();
    let leads = data.leads;

    if (category && category !== "ALL") {
      leads = leads.filter((l) => l.category?.toLowerCase() === category.toLowerCase());
    }

    if (stage && stage !== "ALL") {
      leads = leads.filter((l) => l.stage === stage);
    }

    if (q) {
      leads = leads.filter(
        (l) =>
          l.clientName?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q) ||
          l.projectTitle?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.leadNumber?.toLowerCase().includes(q)
      );
    }

    // Kalkulasi Metrik Finansial Pipeline
    const allLeads = data.leads;
    const activeLeads = allLeads.filter((l) => l.stage !== "WON" && l.stage !== "LOST");
    const wonLeads = allLeads.filter((l) => l.stage === "WON");
    const lostLeads = allLeads.filter((l) => l.stage === "LOST");

    const totalPipelineValue = activeLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);
    const totalWonValue = wonLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);
    const totalWeightedPipeline = activeLeads.reduce(
      (acc, l) => acc + ((Number(l.estimatedValue) || 0) * (Number(l.probability) || 50)) / 100,
      0
    );

    const closedCount = wonLeads.length + lostLeads.length;
    const winRate = closedCount > 0 ? Math.round((wonLeads.length / closedCount) * 100) : 100;
    const avgDealSize = wonLeads.length > 0 ? Math.round(totalWonValue / wonLeads.length) : 0;

    return NextResponse.json({
      success: true,
      data: leads,
      metrics: {
        totalLeadsCount: allLeads.length,
        activeLeadsCount: activeLeads.length,
        wonLeadsCount: wonLeads.length,
        lostLeadsCount: lostLeads.length,
        totalPipelineValue,
        totalWonValue,
        totalWeightedPipeline,
        winRate,
        avgDealSize,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Buat Lead Prospek Baru atau Catat Aktivitas Interaksi
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "create_lead" } = body;
    const data = readCrmData();
    const nowIso = new Date().toISOString();

    if (action === "log_activity") {
      const { leadId, type, title, notes, createdBy = "DSTech Team" } = body;
      if (!leadId || !title) {
        return NextResponse.json({ success: false, error: "ID Lead dan Judul Aktivitas wajib diisi" }, { status: 400 });
      }

      const leadIndex = data.leads.findIndex((l) => l.id === leadId);
      if (leadIndex === -1) {
        return NextResponse.json({ success: false, error: "Lead tidak ditemukan" }, { status: 404 });
      }

      if (!Array.isArray(data.leads[leadIndex].activities)) {
        data.leads[leadIndex].activities = [];
      }

      const newActivity = {
        id: `act_${Date.now()}`,
        type: type || "NOTE",
        title,
        notes: notes || "",
        createdAt: nowIso,
        createdBy,
      };

      data.leads[leadIndex].activities.unshift(newActivity);
      data.leads[leadIndex].updatedAt = nowIso;
      writeCrmData(data);

      return NextResponse.json({
        success: true,
        message: "Aktivitas berhasil dicatat!",
        data: newActivity,
      });
    }

    // Default action: Create Lead
    const {
      clientName,
      company = "",
      position = "",
      phone,
      email = "",
      category = "B2B Industri",
      projectTitle,
      estimatedValue = 0,
      stage = "NEW_LEAD",
      probability = 30,
      source = "Website / Chat WA",
      assignedTo = "RAMADHANI ST",
      expectedClosingDate = "",
      location = "Cilegon, Banten",
      sphNumber = "",
      notes = "",
    } = body;

    if (!clientName || !phone || !projectTitle) {
      return NextResponse.json(
        { success: false, error: "Nama Klien, No HP/WA, dan Judul Kebutuhan Proyek wajib diisi" },
        { status: 400 }
      );
    }

    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const seq = String(data.leads.length + 1).padStart(3, "0");
    const leadNumber = `LEAD-DST-${yearMonth}-${seq}`;

    const newLead = {
      id: `dstech_crm_lead_${Date.now()}`,
      leadNumber,
      clientName,
      company,
      position,
      phone,
      email,
      category,
      projectTitle,
      estimatedValue: Number(estimatedValue) || 0,
      stage,
      probability: stage === "WON" ? 100 : stage === "LOST" ? 0 : Number(probability) || 30,
      source,
      assignedTo,
      expectedClosingDate: expectedClosingDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      location,
      sphNumber,
      notes,
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "NOTE",
          title: "Prospek Dibuat di Sistem CRM",
          notes: `Prospek baru berhasil didaftarkan dari sumber ${source}.`,
          createdAt: nowIso,
          createdBy: assignedTo,
        },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    data.leads.unshift(newLead);
    writeCrmData(data);

    return NextResponse.json({
      success: true,
      message: "Prospek baru berhasil ditambahkan!",
      data: newLead,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Perbarui detail prospek / Pindah stage tahapan Kanban
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID Lead wajib disertakan" }, { status: 400 });
    }

    const data = readCrmData();
    const index = data.leads.findIndex((l) => l.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Lead tidak ditemukan" }, { status: 404 });
    }

    const targetLead = data.leads[index];
    const nowIso = new Date().toISOString();

    // Jika terjadi perubahan stage tahapan, tambahkan log aktivitas otomatis
    if (body.stage && body.stage !== targetLead.stage) {
      if (!Array.isArray(targetLead.activities)) {
        targetLead.activities = [];
      }

      const stageLabels: Record<string, string> = {
        NEW_LEAD: "Prospek Baru",
        QUALIFIED: "Kualifikasi & Survey",
        PROPOSAL_SENT: "Penawaran SPH Terkirim",
        NEGOTIATION: "Negosiasi Kontrak",
        WON: "Menang (Closing Deal)",
        LOST: "Batal / Hilang",
      };

      const fromLabel = stageLabels[targetLead.stage] || targetLead.stage;
      const toLabel = stageLabels[body.stage] || body.stage;

      targetLead.activities.unshift({
        id: `act_${Date.now()}`,
        type: body.stage === "WON" ? "PROPOSAL" : "NOTE",
        title: `Tahapan Berubah: ${fromLabel} ➔ ${toLabel}`,
        notes: body.stageNote || `Status prospek berhasil dipindahkan ke tahap ${toLabel}.`,
        createdAt: nowIso,
        createdBy: body.updatedBy || "Commercial Admin",
      });

      targetLead.stage = body.stage;
      if (body.stage === "WON") targetLead.probability = 100;
      if (body.stage === "LOST") targetLead.probability = 0;
    }

    // Perbarui field lainnya jika dikirimkan
    if (body.clientName !== undefined) targetLead.clientName = body.clientName;
    if (body.company !== undefined) targetLead.company = body.company;
    if (body.position !== undefined) targetLead.position = body.position;
    if (body.phone !== undefined) targetLead.phone = body.phone;
    if (body.email !== undefined) targetLead.email = body.email;
    if (body.category !== undefined) targetLead.category = body.category;
    if (body.projectTitle !== undefined) targetLead.projectTitle = body.projectTitle;
    if (body.estimatedValue !== undefined) targetLead.estimatedValue = Number(body.estimatedValue) || 0;
    if (body.probability !== undefined && body.stage !== "WON" && body.stage !== "LOST") {
      targetLead.probability = Number(body.probability) || 0;
    }
    if (body.source !== undefined) targetLead.source = body.source;
    if (body.assignedTo !== undefined) targetLead.assignedTo = body.assignedTo;
    if (body.expectedClosingDate !== undefined) targetLead.expectedClosingDate = body.expectedClosingDate;
    if (body.location !== undefined) targetLead.location = body.location;
    if (body.sphNumber !== undefined) targetLead.sphNumber = body.sphNumber;
    if (body.notes !== undefined) targetLead.notes = body.notes;

    targetLead.updatedAt = nowIso;
    data.leads[index] = targetLead;
    writeCrmData(data);

    return NextResponse.json({
      success: true,
      message: "Data prospek berhasil diperbarui!",
      data: targetLead,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Hapus lead
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID Lead wajib disertakan" }, { status: 400 });
    }

    const data = readCrmData();
    const filtered = data.leads.filter((l) => l.id !== id);

    if (filtered.length === data.leads.length) {
      return NextResponse.json({ success: false, error: "Lead tidak ditemukan" }, { status: 404 });
    }

    data.leads = filtered;
    writeCrmData(data);

    return NextResponse.json({
      success: true,
      message: "Prospek berhasil dihapus!",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
