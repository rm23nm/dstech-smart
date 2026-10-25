import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CRM_FILE = path.join(process.cwd(), "src", "data", "dstech_crm.json");

const INITIAL_LEADS = [
  {
    id: "dstech_crm_lead_1",
    leadNumber: "LEAD-DST-202610-001",
    clientName: "Ir. Hendra Gunawan",
    company: "PT. Krakatau Posco Steel",
    position: "Procurement & Facility Manager",
    phone: "0812-8899-7766",
    email: "hendra.g@krakatauposco.co.id",
    category: "B2B Industri",
    projectTitle: "Pengadaan & Integrasi 24 Titik CCTV AI Thermal & Barrier Gate Pabrik",
    estimatedValue: 85000000,
    stage: "NEGOTIATION",
    probability: 85,
    source: "Website / Chat WA",
    assignedTo: "RAMADHANI ST",
    expectedClosingDate: "2026-11-15",
    location: "Kawasan Industri Krakatau Cilegon",
    sphNumber: "SPH-DSTECH-202610-001",
    notes: "Klien membutuhkan pengawasan area furnace suhu tinggi dengan kamera PTZ Optical Zoom dan palang gerbang otomatis servo.",
    activities: [
      {
        id: "act_1_1",
        type: "SURVEY",
        title: "Survey Lapangan & Pemetaan Titik CCTV",
        notes: "Tim teknisi DSTech telah melakukan survey site walk, pengukuran jarak kabel FO 450 meter, dan penentuan posisi tiang kamera.",
        createdAt: "2026-10-18T10:00:00.000Z",
        createdBy: "Tim Teknisi DSTech"
      },
      {
        id: "act_1_2",
        type: "PROPOSAL",
        title: "Penerbitan & Pengiriman SPH Resmi",
        notes: "SPH SPH-DSTECH-202610-001 telah dikirimkan via email resmi dan WhatsApp ke Bpk Hendra Gunawan.",
        createdAt: "2026-10-20T14:30:00.000Z",
        createdBy: "RAMADHANI ST"
      },
      {
        id: "act_1_3",
        type: "MEETING",
        title: "Negosiasi Termin Pembayaran & Jadwal Instalasi",
        notes: "Klien menyetujui spesifikasi teknis. Saat ini tahap finalisasi Purchase Order (PO) dengan termin DP 50%.",
        createdAt: "2026-10-23T11:15:00.000Z",
        createdBy: "RAMADHANI ST"
      }
    ],
    createdAt: "2026-10-15T08:00:00.000Z",
    updatedAt: "2026-10-23T11:15:00.000Z"
  },
  {
    id: "dstech_crm_lead_2",
    leadNumber: "LEAD-DST-202610-002",
    clientName: "Ibu Ratna Dewi",
    company: "Perumahan Grand Cilegon Cluster Sapphire",
    position: "Ketua Pengurus Paguyuban Warga",
    phone: "0813-7744-1122",
    email: "ratna.dewi@grandcilegon.id",
    category: "Residensial / Smart Home",
    projectTitle: "Smart Access Gate RFID & Sistem Barrier Parkir Cluster Perumahan",
    estimatedValue: 32000000,
    stage: "PROPOSAL_SENT",
    probability: 65,
    source: "Referral Mitra",
    assignedTo: "Commercial Team",
    expectedClosingDate: "2026-11-20",
    location: "Cibeber, Kota Cilegon",
    sphNumber: "SPH-DSTECH-202610-002",
    notes: "Penggantian palang manual menjadi otomatis berkecepatan 1.8 detik dengan kartu akses RFID untuk 120 kepala keluarga.",
    activities: [
      {
        id: "act_2_1",
        type: "CALL",
        title: "Telepon Konsultasi Awal",
        notes: "Diskusi kebutuhan warga perumahan untuk keamanan gerbang masuk portal otomatis.",
        createdAt: "2026-10-19T09:00:00.000Z",
        createdBy: "CS DSTech"
      },
      {
        id: "act_2_2",
        type: "SURVEY",
        title: "Pengukuran Lebar Jalan & Pondasi Gate",
        notes: "Lebar jalan 6 meter, membutuhkan 2 unit barrier gate (1 In, 1 Out).",
        createdAt: "2026-10-21T13:00:00.000Z",
        createdBy: "Teknisi Lapangan"
      }
    ],
    createdAt: "2026-10-19T08:30:00.000Z",
    updatedAt: "2026-10-21T13:00:00.000Z"
  },
  {
    id: "dstech_crm_lead_3",
    leadNumber: "LEAD-DST-202610-003",
    clientName: "Drs. H. Mulyadi",
    company: "Dinas Komunikasi & Informatika (Diskominfo)",
    position: "PPK Pengadaan Perangkat",
    phone: "0811-9988-3344",
    email: "mulyadi.ppk@serangkota.go.id",
    category: "Instansi Pemerintah",
    projectTitle: "Pengadaan Server Presensi Biometrik & Jaringan Fiber Optic Gedung OPD",
    estimatedValue: 125000000,
    stage: "QUALIFIED",
    probability: 50,
    source: "Tender",
    assignedTo: "RAMADHANI ST",
    expectedClosingDate: "2026-12-05",
    location: "Pusat Pemerintahan Kota Serang",
    sphNumber: "",
    notes: "Kebutuhan pengadaan server lokal dan instalasi 8 titik mesin absensi face recognition.",
    activities: [
      {
        id: "act_3_1",
        type: "MEETING",
        title: "Presentasi Produk & Portofolio DSTech",
        notes: "Pemaparan sistem terintegrasi Smart Pro WA Gateway dan mesin biometrik.",
        createdAt: "2026-10-22T10:00:00.000Z",
        createdBy: "RAMADHANI ST"
      }
    ],
    createdAt: "2026-10-21T15:00:00.000Z",
    updatedAt: "2026-10-22T10:00:00.000Z"
  },
  {
    id: "dstech_crm_lead_4",
    leadNumber: "LEAD-DST-202610-004",
    clientName: "Bpk. Aris Munandar",
    company: "PT. Sentra Logistik Merak",
    position: "Operational Director",
    phone: "0819-2233-4455",
    email: "aris.m@sentralogistik.co.id",
    category: "B2B Industri",
    projectTitle: "Pemasangan 12 Unit Smart Doorlock & PABX Kantor Dermaga Merak",
    estimatedValue: 28500000,
    stage: "WON",
    probability: 100,
    source: "E-Store",
    assignedTo: "Commercial Team",
    expectedClosingDate: "2026-10-24",
    location: "Pelabuhan Merak, Banten",
    sphNumber: "SPH-DSTECH-202610-004",
    notes: "Deal berhasil closing! Pembayaran lunas dan pekerjaan instalasi telah selesai dengan garansi resmi 1 tahun.",
    activities: [
      {
        id: "act_4_1",
        type: "WHATSAPP",
        title: "Konfirmasi Closing & Jadwal Pemasangan",
        notes: "Klien telah mentransfer pembayaran DP dan SPK telah ditandatangani.",
        createdAt: "2026-10-20T16:00:00.000Z",
        createdBy: "Commercial Team"
      }
    ],
    createdAt: "2026-10-17T11:00:00.000Z",
    updatedAt: "2026-10-24T16:00:00.000Z"
  },
  {
    id: "dstech_crm_lead_5",
    leadNumber: "LEAD-DST-202610-005",
    clientName: "Dr. Cynthia Anastasia",
    company: "Klinik Medika Pratama Cilegon",
    position: "Owner & Kepala Klinik",
    phone: "0852-1133-7799",
    email: "cynthia@medikapratama.com",
    category: "Komersial / Ruko",
    projectTitle: "Pengadaan CCTV Audio 2 Arah & Antrean Pasien Smart Display",
    estimatedValue: 14500000,
    stage: "NEW_LEAD",
    probability: 25,
    source: "Website / Chat WA",
    assignedTo: "CS DSTech",
    expectedClosingDate: "2026-11-28",
    location: "Jl. Ahmad Yani No. 45, Cilegon",
    sphNumber: "",
    notes: "Calon klien menghubungi via tombol WhatsApp website meminta penawaran paket 8 channel CCTV yang bisa rekam suara.",
    activities: [
      {
        id: "act_5_1",
        type: "WHATSAPP",
        title: "Chat Awal Masuk dari Website",
        notes: "Menjawab pertanyaan awal klien seputar spesifikasi CCTV Proview 2 Lensa dan perkiraan biaya.",
        createdAt: "2026-10-24T14:20:00.000Z",
        createdBy: "CS DSTech"
      }
    ],
    createdAt: "2026-10-24T14:20:00.000Z",
    updatedAt: "2026-10-24T14:20:00.000Z"
  }
];

function readCrmData(): { leads: any[] } {
  try {
    if (fs.existsSync(CRM_FILE)) {
      const content = fs.readFileSync(CRM_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.leads) && parsed.leads.length > 0) {
        return { leads: parsed.leads };
      }
    }
  } catch (err) {
    console.error("Gagal membaca dstech_crm.json:", err);
  }

  // Jika file belum ada atau kosong, inisialisasi dengan data default
  const defaultData = { leads: INITIAL_LEADS };
  try {
    const dir = path.dirname(CRM_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CRM_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal inisialisasi file dstech_crm.json:", err);
  }
  return defaultData;
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
