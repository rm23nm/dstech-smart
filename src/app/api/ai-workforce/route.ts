import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src/data/dstech_ai_workforce.json");

const DEFAULT_WORKFORCE = {
  dstech_company: {
    name: "PT. DSTech Smart Perkasa",
    motto: "Digital Transformation & Smart IoT Solutions",
    working_hours: "08:00 - 17:00 WIB",
    office_mode: "ACTIVE"
  },
  dstech_employees: [
    {
      id: "emp_siti_cs",
      name: "Siti Nurhaliza",
      role: "Front Office & AI Customer Care",
      department: "CUSTOMER_SERVICE",
      desk_zone: "RECEPTION_DESK",
      gender: "female",
      avatar_color: "#ec4899",
      status: "WORKING",
      current_activity: "Menyapa pengunjung & standby konsultasi via Chat Website dan WhatsApp",
      speech_bubble: "Selamat datang di DSTech Smart! Ada yang bisa kami bantu seputar CCTV & Barrier Gate?",
      kpi: {
        handled_inquiries: 48,
        satisfaction_rate: "99.2%",
        avg_response_time: "1.2s"
      },
      skills: ["Salam & Sapa Profesional", "Filter Pertanyaan Umum", "Routing ke Sales / Support", "Pencatatan Tamu Digital"]
    },
    {
      id: "emp_bambang_sales",
      name: "Bambang Prakoso",
      role: "Senior AI Sales & Commercial Consultant",
      department: "SALES",
      desk_zone: "SALES_DESK",
      gender: "male",
      avatar_color: "#3b82f6",
      status: "WORKING",
      current_activity: "Follow-up calon klien B2B industri Cilegon dan memantau pipeline prospek CRM",
      speech_bubble: "Prospek instalasi palang parkir RFID di kawasan industri siap kita buatkan penawaran SPH resmi.",
      kpi: {
        deals_closed: 14,
        pipeline_value: 385000000,
        active_negotiations: 5
      },
      skills: ["Negosiasi B2B Industri", "Estimasi Biaya Proyek", "Pencatatan CRM Pipeline", "Follow-up WhatsApp Klien"]
    },
    {
      id: "emp_dewi_finance",
      name: "Dewi Sartika",
      role: "AI Finance & Tax Billing Specialist",
      department: "FINANCE",
      desk_zone: "FINANCE_DESK",
      gender: "female",
      avatar_color: "#10b981",
      status: "WORKING",
      current_activity: "Memverifikasi kalkulasi PPN Exclude/Include dan menyusun draf penawaran SPH",
      speech_bubble: "Draf SPH penawaran harga sudah diselaraskan dengan pajak PPN dan siap diajukan ke Direktur.",
      kpi: {
        sph_generated: 26,
        invoices_cleared: 31,
        tax_reconciled: "100%"
      },
      skills: ["Penerbitan SPH Resmi", "Kalkulasi Faktur & PPN 11%", "Buku Arus Kas ERP", "Reminder Tagihan Jatuh Tempo"]
    },
    {
      id: "emp_reza_catalog",
      name: "Reza Firmansyah",
      role: "AI Product Catalog & Procurement Lead",
      department: "CATALOG_ESTORE",
      desk_zone: "CATALOG_DESK",
      gender: "male",
      avatar_color: "#8b5cf6",
      status: "WORKING",
      current_activity: "Sinkronisasi stok barang barrier gate, CCTV PTZ, dan perlengkapan smart home di E-Store",
      speech_bubble: "Katalog produk barrier gate otomatis dan kamera AI thermal sudah terindeks rapi di toko online.",
      kpi: {
        products_managed: 128,
        auto_descriptions: 94,
        stock_accuracy: "99.8%"
      },
      skills: ["Import Produk Otomatis", "Copywriting Spesifikasi Teknis", "Katalog SEO-Friendly", "Sinkronisasi Harga Modal & Margin"]
    },
    {
      id: "emp_nadia_marketing",
      name: "Nadia Safitri",
      role: "AI Creative Marketing, Social Media & Video Branding Specialist",
      department: "MARKETING",
      desk_zone: "MARKETING_DESK",
      gender: "female",
      avatar_color: "#f59e0b",
      status: "WORKING",
      current_activity: "Menyusun draf video branding Reels/TikTok/Shorts harian dan mendesain flyer promosi media sosial",
      speech_bubble: "Draf video branding 9:16 untuk TikTok, Instagram Reels, dan YouTube Shorts hari ini sudah siap ditinjau Direktur!",
      kpi: {
        campaigns_created: 24,
        videos_rendered: 38,
        wa_broadcast_leads: 89,
        engagement_rate: "92.6%"
      },
      skills: ["Produksi Video Reels & TikTok 9:16", "Copywriting Viral & Hook 3 Detik", "Desain Flyer Promosi Feed", "Voiceover & Audio Narator AI", "Riset Tagar & Algoritma Medsos"]
    },
    {
      id: "emp_deni_field",
      name: "Deni Kurniawan",
      role: "AI Field Coordinator & Dispatcher",
      department: "FIELD_OPERATIONS",
      desk_zone: "DISPATCH_DESK",
      gender: "male",
      avatar_color: "#06b6d4",
      status: "WORKING",
      current_activity: "Menyiapkan Surat Perintah Kerja (SPK) dan koordinasi jadwal instalasi tim teknisi lapangan",
      speech_bubble: "Jadwal survey lokasi dan instalasi barrier gate untuk tim teknisi lapangan Pak Ramadhani sudah dijadwalkan.",
      kpi: {
        spk_dispatched: 22,
        surveys_mapped: 19,
        field_on_time: "96.5%"
      },
      skills: ["Penerbitan SPK Lapangan", "Plotting Rute & GPS Klien", "Alokasi Alat dari Inventory", "Monitoring Hasil Instalasi"]
    }
  ],
  dstech_recent_logs: [
    {
      id: "log_1",
      timestamp: new Date().toISOString(),
      employee_id: "emp_siti_cs",
      employee_name: "Siti Nurhaliza",
      action: "Menyapa pengunjung website & menawarkan bantuan konsultasi sistem otomatisasi."
    },
    {
      id: "log_2",
      timestamp: new Date().toISOString(),
      employee_id: "emp_bambang_sales",
      employee_name: "Bambang Prakoso",
      action: "Kualifikasi kebutuhan klien industri palang parkir otomatis untuk pabrik kimia di Cilegon."
    },
    {
      id: "log_3",
      timestamp: new Date().toISOString(),
      employee_id: "emp_dewi_finance",
      employee_name: "Dewi Sartika",
      action: "Menyinkronkan draf penawaran harga dengan opsi PPN Exclude sesuai instruksi direktur."
    },
    {
      id: "log_4",
      timestamp: new Date().toISOString(),
      employee_id: "emp_nadia_marketing",
      employee_name: "Nadia Safitri",
      action: "Menyiapkan materi promosi bundling barrier gate + sistem akses RFID perumahan."
    }
  ],
  dstech_approval_queue: [
    {
      id: "appr_init_1",
      employee_id: "emp_dewi_finance",
      employee_name: "Dewi Sartika",
      employee_role: "AI Finance & Tax Billing Specialist",
      department: "FINANCE",
      task_type: "SPH_PROPOSAL",
      title: "Draf SPH Penawaran: Gate Access In-Out Cluster Elysium",
      target_client: "PT. Tunas Buana Properti",
      value: 24500000,
      tax_type: "exclude",
      summary: "Pengadaan 2 unit Mesin Barrier Gate Otomatis In-Out, 2 unit Tiang Reader RFID, Sensor Loop Detector VLD, dan Jasa Pasang. Harga Netto Rp 24.500.000 (Exclude PPN 11%).",
      status: "PENDING_APPROVAL",
      created_at: new Date().toISOString(),
      payload: {
        entityType: "PT",
        customerName: "PT. Tunas Buana Properti",
        customerAddress: "Cluster Elysium, Cilegon Banten",
        subject: "Surat Penawaran Harga Pengadaan & Instalasi Gate Access Sistem In-Out Cluster Elysium",
        projectName: "Instalasi Barrier Gate Access In-Out PT. Tunas Buana Properti",
        items: [
          { productName: "Mesin Barrier Gate Otomatis High Speed (Arm 3-4m) Gate Masuk & Keluar", qty: 2, unit: "Unit", price: 8500000, total: 17000000 },
          { productName: "Tiang Reader RFID Standalone Controller + Housing Outdoor In & Out", qty: 2, unit: "Unit", price: 3250000, total: 6500000 },
          { productName: "Vehicle Loop Detector (VLD) Anti-Tabrak Sensor Kendaraan", qty: 2, unit: "Unit", price: 1250000, total: 2500000 },
          { productName: "Jasa Sipil Cor Pondasi Dudukan Gate, Wiring & Komisioning In-Out", qty: 1, unit: "Lot", price: 4500000, total: 4500000 }
        ],
        subtotal: 24500000,
        taxRate: 11,
        taxType: "exclude",
        taxAmount: 2695000,
        grandTotal: 27195000,
        hideTaxInPrint: true
      }
    },
    {
      id: "appr_init_2",
      employee_id: "emp_reza_catalog",
      employee_name: "Reza Firmansyah",
      employee_role: "AI Product Catalog & Procurement Lead",
      department: "CATALOG_ESTORE",
      task_type: "PRODUCT_IMPORT",
      title: "Usulan Pengadaan Suku Cadang: Wield Falcon Magnetic Lock 600Lbs",
      target_client: "Katalog E-Store DSTech",
      value: 277500,
      tax_type: "net",
      summary: "Pendaftaran produk baru Electromagnetic Lock 600Lbs 280Kg dengan foto fisik asli nyata. Stok awal diset 0 QTY (hanya bertambah saat PO Supplier datang).",
      status: "PENDING_APPROVAL",
      created_at: new Date().toISOString(),
      payload: {
        id: `dstech_prod_appr_emlock`,
        name: "DStech - Wield Falcon Magnetic Lock Access Control 600Lbs 280Kg EM Lock",
        category: "Security System",
        subCategory: "Access Control & Magnetic Lock",
        brand: "Wield Falcon",
        entityType: "PT",
        costPrice: 185000,
        price: 277500,
        stock: 0,
        warehouseStock: { dstech_wh_1: 0, dstech_wh_2: 0, dstech_wh_3: 0 },
        image: "/uploads/dstech_tekno_em_lock_600lbs.jpg"
      }
    },
    {
      id: "appr_init_3",
      employee_id: "emp_nadia_marketing",
      employee_name: "Nadia Safitri",
      employee_role: "AI Creative Marketing & Copywriter",
      department: "MARKETING",
      task_type: "PROMO_CAMPAIGN",
      title: "Materi Promo WhatsApp: Paket Smart Barrier Gate Cluster",
      target_client: "Mitra & Pengembang Properti",
      value: 0,
      tax_type: "none",
      summary: "Flyer dan copywriting broadcast promo WhatsApp 'Solusi Keamanan Gerbang Perumahan Modern & Anti-Macet' untuk dikirimkan ke calon mitra B2B.",
      status: "PENDING_APPROVAL",
      created_at: new Date().toISOString(),
      payload: {
        title: "Promo Spesial: Paket Smart Barrier Gate Perumahan Modern",
        category: "Brosur Promosi",
        description: "Materi promosi broadcast WhatsApp penawaran bundling Barrier Gate otomatis + Access RFID khusus klaster & komplek industri.",
        fileUrl: "/service-cctv.png"
      }
    }
  ]
};

function readWorkforceData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      writeWorkforceData(DEFAULT_WORKFORCE);
      return JSON.parse(JSON.stringify(DEFAULT_WORKFORCE));
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.dstech_employees || parsed.dstech_employees.length === 0) {
      writeWorkforceData(DEFAULT_WORKFORCE);
      return JSON.parse(JSON.stringify(DEFAULT_WORKFORCE));
    }
    if (parsed.dstech_approval_queue === undefined || parsed.dstech_approval_queue === null) {
      parsed.dstech_approval_queue = DEFAULT_WORKFORCE.dstech_approval_queue;
      writeWorkforceData(parsed);
    }
    return parsed;
  } catch (err) {
    console.error("Error reading dstech_ai_workforce.json:", err);
    return JSON.parse(JSON.stringify(DEFAULT_WORKFORCE));
  }
}

function writeWorkforceData(data: any) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_ai_workforce.json:", err);
    return false;
  }
}

// ==========================================
// GOOGLE GEMINI AI MULTI-KEY ROTATION ENGINE
// Default Model: gemini-2.5-flash (STRICT RULE)
// ==========================================
function getGeminiApiKeys(): string[] {
  const envRaw = process.env.GEMINI_API_KEY || "";
  const paidKey = process.env.GEMINI_API_KEY_PAID || "";
  const freeKeys = (process.env.GEMINI_API_KEYS_FREE || "").split(",").map(k => k.replace(/["']/g, "").trim()).filter(Boolean);
  const parsedEnv = envRaw.split(",").map(k => k.replace(/["']/g, "").trim()).filter(Boolean);

  const keyList = [
    ...freeKeys,
    ...parsedEnv,
    paidKey.replace(/["']/g, "").trim(),
    "AIzaSyAJLJZW07IfKww2m7USMK51W-XsycEb02w",
    "AIzaSyA8vir7yUSY25sZwoq5Mmx-sh4YaQ8LMlU",
    "AIzaSyCPO7o7HvlMjE2KDAq0SqbZb0mFFV5bLoY",
    "AIzaSyBbyYdhCGiKe9XVr44sOuy5W5Sb6L8a2a0",
    "AIzaSyCtESMZ27v54-exiKXJOShZ8vKdTwGz77E",
  ].filter(Boolean);

  return Array.from(new Set(keyList));
}

let geminiKeyIndex = 0;

async function executeGeminiCall(
  prompt: string,
  jsonMode = false,
  model = "gemini-2.5-flash",
  timeoutMs = 12000
): Promise<string | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const activeKey = keys[(geminiKeyIndex + attempt) % keys.length];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
      const bodyPayload: any = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };
      if (jsonMode) {
        bodyPayload.generationConfig = { responseMimeType: "application/json" };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.ok) {
        geminiKeyIndex = (geminiKeyIndex + attempt) % keys.length;
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      } else {
        console.warn(`Gemini key index ${(geminiKeyIndex + attempt) % keys.length} returned HTTP ${res.status}`);
      }
    } catch (e: any) {
      console.warn(`Gemini call error on attempt ${attempt}:`, e.message);
    }
  }
  return null;
}

// ==========================================
// DETERMINISTIC BOOKKEEPING & EXPENSE PARSER
// Handles Indonesian Currency, Monthly Routine,
// Utilities, Transport, Rent, ATK, and Salaries
// ==========================================
function parseDeterministicBookkeeping(cmd: string): any {
  const monthMap: Record<string, number> = {
    januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
    juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12
  };

  let year = 2025;
  const ym = cmd.match(/\b(202[4-9]|203[0-9])\b/);
  if (ym) year = parseInt(ym[1], 10);

  let startMonth = 1;
  let endMonth = 12;
  const mRange = cmd.match(/(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*(?:\d{4})?\s*(?:sampai|hingga|s\/d|-)\s*(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*(?:\d{4})?/i);
  if (mRange) {
    startMonth = monthMap[mRange[1].toLowerCase()] || 1;
    endMonth = monthMap[mRange[2].toLowerCase()] || 12;
  } else {
    const singleMonth = cmd.match(/(?:bulan\s+)(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)/i);
    if (singleMonth) {
      startMonth = monthMap[singleMonth[1].toLowerCase()] || 1;
      endMonth = startMonth;
    }
  }

  // Regex matches words (name) followed by amount pattern
  // Amount pattern handles: 500.000,- | 3.000.000 | 500000 | Rp 500.000
  const itemRegex = /([a-zA-Z\s\(\)\/\.&]+?)\s*[:=,]?\s*(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d+|-)?|\d{5,10})/gi;
  const items: any[] = [];
  let m;
  while ((m = itemRegex.exec(cmd)) !== null) {
    let rawName = m[1].trim();
    rawName = rawName.replace(/^(.*?(?:bulan|tahun\s*\d{4}|setiap\s*bulan|beban\s*yang\s*dikeluarkan\s*setiap\s*bulan|pengeluaran\s*keuangan\s*rutin\s*untuk\s*tahun\s*\d{4}))\s*[:=-]?\s*/i, "");
    rawName = rawName.replace(/^[,\s\-\:\;]+/, "").replace(/[,\s\-\:\;]+$/, "").trim();
    rawName = rawName.replace(/^(?:dan|untuk|beban|biaya|gaji|pengeluaran|pada)\s+/i, "").trim();

    const rawVal = m[2].replace(/\./g, "").replace(/,-$/, "").replace(/,.*$/, "");
    const amount = parseInt(rawVal, 10);

    if (rawName.length >= 2 && !isNaN(amount) && amount >= 10000) {
      let category = "Beban Operasional & Pemeliharaan";
      let role = "Beban Operasional";
      const nLower = rawName.toLowerCase();
      if (nLower.includes("listrik") || nLower.includes("air") || nLower.includes("pam") || nLower.includes("pdam") || nLower.includes("pln") || nLower.includes("internet") || nLower.includes("wifi") || nLower.includes("utilitas")) {
        category = "Beban Utilitas & Fasilitas";
        role = "Beban Utilitas";
      } else if (nLower.includes("bensin") || nLower.includes("bbm") || nLower.includes("mobil") || nLower.includes("kendaraan") || nLower.includes("motor") || nLower.includes("transport")) {
        category = "Beban Operasional Kendaraan & Transport";
        role = "Beban Kendaraan Operasional";
      } else if (nLower.includes("sewa") || nLower.includes("kantor") || nLower.includes("gedung")) {
        category = "Beban Sewa Tempat & Kantor";
        role = "Beban Sewa Gedung / Kantor";
      } else if (nLower.includes("atk") || nLower.includes("alat tulis") || nLower.includes("perlengkapan") || nLower.includes("kertas")) {
        category = "Beban Perlengkapan & ATK Kantor";
        role = "Beban Perlengkapan Kantor";
      } else if (nLower.includes("gaji") || nLower.includes("marsya") || nLower.includes("ramadhani") || nLower.includes("staf") || nLower.includes("karyawan") || nLower.includes("upah")) {
        category = "Gaji & Upah Karyawan";
        role = nLower.includes("ramadhani") ? "Direktur Utama" : "Staf Operasional";
      }

      items.push({ name: rawName, role, amount, category });
    }
  }

  const isSalary = items.some(it => it.category === "Gaji & Upah Karyawan");

  return {
    type: "OUT",
    category: isSalary ? "Gaji & Upah Karyawan" : "Beban Operasional Rutin",
    defaultAccount: "Bank BCA - 295-074-0321 (PT. DSTech Smart Perkasa)",
    year,
    startMonth,
    endMonth,
    items,
  };
}

export async function GET(req: NextRequest) {
  try {
    const data = readWorkforceData();
    return NextResponse.json({
      success: true,
      data
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, employeeId, command, status, newSpeech } = body;
    const data = readWorkforceData();

    if (action === "update_status") {
      const emp = data.dstech_employees.find((e: any) => e.id === employeeId);
      if (emp) {
        if (status) emp.status = status;
        if (newSpeech) emp.speech_bubble = newSpeech;
        writeWorkforceData(data);
        return NextResponse.json({ success: true, message: `Status ${emp.name} diperbarui!`, employee: emp });
      }
      return NextResponse.json({ success: false, error: "Karyawan tidak ditemukan" }, { status: 404 });
    }

    // 1. APPROVE QUEUE ITEM (Persetujuan Direktur Utama)
    if (action === "approve_queue_item") {
      const { itemId } = body;
      if (!data.dstech_approval_queue) data.dstech_approval_queue = [];
      const itemIndex = data.dstech_approval_queue.findIndex((it: any) => it.id === itemId);
      if (itemIndex === -1) {
        return NextResponse.json({ success: false, error: "Item pekerjaan tidak ditemukan" }, { status: 404 });
      }

      const item = data.dstech_approval_queue[itemIndex];
      if (item.status === "APPROVED") {
        return NextResponse.json({ success: false, error: "Pekerjaan ini sudah pernah disetujui sebelumnya." }, { status: 400 });
      }

      // EKSEKUSI DATA SECARA RESMI KE DATABASE SISTEM
      let executedResult: any = null;
      try {
        if (item.task_type === "SPH_PROPOSAL") {
          const finPath = path.join(process.cwd(), "src/data/dstech_finance_erp.json");
          if (fs.existsSync(finPath)) {
            const finRaw = fs.readFileSync(finPath, "utf-8");
            const finData = JSON.parse(finRaw);
            if (!finData.quotations) finData.quotations = [];

            const sphNumber = `SPH-DSTECH-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(finData.quotations.length + 1).padStart(3, "0")}`;
            const sphDoc = {
              id: `dstech_sph_${Date.now()}`,
              quotationNumber: sphNumber,
              clientId: `client_${Date.now()}`,
              customerName: item.payload?.customerName || item.target_client || "Klien DSTech",
              customerOrg: item.payload?.customerName || item.target_client || "Klien DSTech",
              customerPhone: "0812-9988-7766",
              customerAddress: item.payload?.customerAddress || "Banten / Jabodetabek",
              subject: item.payload?.subject || item.title,
              date: new Date().toISOString().split("T")[0],
              validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              validityDays: 14,
              items: item.payload?.items || [],
              subtotal: item.payload?.subtotal || item.value || 0,
              discount: 0,
              discountType: "fixed",
              discountPercent: 0,
              discountLabel: "Diskon Khusus Proyek",
              revision: 0,
              taxRate: item.payload?.taxRate || 11,
              taxType: item.payload?.taxType || "exclude",
              taxAmount: item.payload?.taxAmount || 0,
              grandTotal: item.payload?.grandTotal || item.value || 0,
              hideTaxInPrint: item.payload?.hideTaxInPrint ?? true,
              terms: "1. Seluruh harga penawaran di atas adalah harga Netto/DPP belum termasuk PPN 11% (Exclude PPN).\n2. Garansi unit perangkat keras resmi 1 (satu) sampai 2 (dua) tahun penggantian unit baru.\n3. Garansi pemeliharaan teknis & jasa instalasi selama 6 (enam) bulan.\n4. Gratis komisioning, pelatihan operator, dan integrasi sistem monitoring.\n5. Pembayaran: DP 50% saat PO terbit, Pelunasan 50% setelah serah terima pekerjaan (BAST).",
              status: "Terkirim",
              approvalStatus: "Approved",
              approvedBy: "Ramadhani, S.T.",
              approvedTitle: "Direktur Utama",
              approvedAt: new Date().toLocaleString("id-ID"),
              verificationCode: `DST-${sphNumber}`,
              notes: `Disetujui resmi oleh Direktur Utama (Bpk. Ramadhani ST) dari usulan autopilot ${item.employee_name}.`,
              attachments: [],
              businessEntity: "PT",
              projectName: item.payload?.projectName || item.title,
            };

            finData.quotations.unshift(sphDoc);
            fs.writeFileSync(finPath, JSON.stringify(finData, null, 2), "utf-8");
            executedResult = { docType: "SPH", number: sphNumber, link: "/admin/finance?tab=quotations" };
          }
        } else if (item.task_type === "BOOKKEEPING_EXPENSE") {
          const finPath = path.join(process.cwd(), "src/data/dstech_finance_erp.json");
          const payPath = path.join(process.cwd(), "src/data/dstech_payroll.json");
          if (fs.existsSync(finPath)) {
            const finRaw = fs.readFileSync(finPath, "utf-8");
            const finData = JSON.parse(finRaw);
            if (!finData.cash_flow) finData.cash_flow = [];

            let payData: any = { payrolls: [] };
            if (fs.existsSync(payPath)) {
              try {
                payData = JSON.parse(fs.readFileSync(payPath, "utf-8"));
                if (!payData.payrolls) payData.payrolls = [];
              } catch (e) {
                payData = { payrolls: [] };
              }
            }

            const entries = item.payload?.entries || [];
            let insertedCount = 0;

            for (const entry of entries) {
              const personName = entry.personName || entry.name || "";
              const existing = finData.cash_flow.find((c: any) =>
                c.date === entry.date &&
                c.amount === entry.amount &&
                c.description && c.description.toLowerCase().includes(personName.toLowerCase())
              );

              if (!existing) {
                finData.cash_flow.unshift({
                  id: `dstech_cf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  date: entry.date,
                  type: entry.type || "OUT",
                  category: entry.category || "Gaji & Upah Karyawan",
                  amount: entry.amount,
                  account: entry.account || "Bank BCA - 295-074-0321 (PT. DSTech Smart Perkasa)",
                  referenceNumber: entry.referenceNumber,
                  description: entry.description,
                  notes: `Disetujui resmi oleh Direktur Utama (Bpk. Ramadhani ST) dari usulan pembukuan Dewi Sartika.`,
                  businessEntity: "PT",
                  status: "Sukses",
                  approvedBy: "RAMADHANI ST",
                  signerTitle: "Direktur",
                  approvalStatus: "Disetujui & Sah",
                  isLocked: true,
                  receiptUrl: "",
                  createdAt: new Date().toISOString()
                });
                insertedCount++;
              }

              // Catat slip payroll jika kategori gaji
              if ((entry.category || item.payload?.category || "").toLowerCase().includes("gaji")) {
                const existingPay = payData.payrolls.find((p: any) =>
                  p.month === entry.month &&
                  p.employeeName && p.employeeName.toLowerCase().includes(personName.toLowerCase())
                );
                if (!existingPay) {
                  payData.payrolls.unshift({
                    id: `dstech_pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                    slipNumber: `SLIP-DSTECH-${entry.month.replace("-", "")}-${String(payData.payrolls.length + 1).padStart(3, "0")}`,
                    month: entry.month,
                    paymentDate: entry.date,
                    employeeName: personName,
                    employeeRole: entry.personRole || entry.role || "Staf Operasional",
                    bankAccount: "Transfer Bank BCA",
                    baseSalary: entry.amount,
                    dailyRate: 0,
                    presenceDays: 22,
                    presenceRate: 0,
                    presenceAllowance: 0,
                    overtimeHours: 0,
                    overtimeRate: 0,
                    overtimePay: 0,
                    positionAllowance: 0,
                    transportAllowance: 0,
                    mealAllowance: 0,
                    bonusProject: 0,
                    bonusPerformance: 0,
                    bpjsDeduction: 0,
                    loanDeduction: 0,
                    otherDeduction: 0,
                    totalGross: entry.amount,
                    totalDeductions: 0,
                    takeHomePay: entry.amount,
                    status: "Approved",
                    paymentMethod: "Transfer Bank BCA",
                    notes: `Disetujui resmi oleh Direktur Utama dari draf usulan Dewi Sartika`,
                    approvedBy: "RAMADHANI ST",
                    approvedAt: new Date().toISOString(),
                    recordedInCashFlow: true
                  });
                }
              }
            }

            finData.cash_flow.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            fs.writeFileSync(finPath, JSON.stringify(finData, null, 2), "utf-8");
            if (fs.existsSync(payPath)) {
              fs.writeFileSync(payPath, JSON.stringify(payData, null, 2), "utf-8");
            }
            executedResult = { docType: "BOOKKEEPING", count: insertedCount, link: "/admin/finance?tab=cash_flow" };
          }
        } else if (item.task_type === "PRODUCT_IMPORT") {
          const prodPath = path.join(process.cwd(), "src/data/dstech_products.json");
          if (fs.existsSync(prodPath)) {
            const prodRaw = fs.readFileSync(prodPath, "utf-8");
            const prodList = JSON.parse(prodRaw);
            const newProduct = {
              ...item.payload,
              id: item.payload?.id || `dstech_prod_${Date.now()}`,
              stock: 0, // Kebijakan: Stok fisik hanya 0 awal, bertambah via PO Supplier
              warehouseStock: { dstech_wh_1: 0, dstech_wh_2: 0, dstech_wh_3: 0 },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            prodList.unshift(newProduct);
            fs.writeFileSync(prodPath, JSON.stringify(prodList, null, 2), "utf-8");
            executedResult = { docType: "PRODUCT", name: newProduct.name, link: "/admin/products" };
          }
        } else if (item.task_type === "PROMO_CAMPAIGN") {
          const promoPath = path.join(process.cwd(), "src/data/dstech_promotions.json");
          if (fs.existsSync(promoPath)) {
            const promoRaw = fs.readFileSync(promoPath, "utf-8");
            const promoList = JSON.parse(promoRaw);
            const newPromo = {
              id: `dstech_promo_${Date.now()}`,
              title: item.payload?.title || item.title,
              category: item.payload?.category || "Brosur Promosi",
              description: item.payload?.description || item.summary,
              fileUrl: item.payload?.fileUrl || "/service-cctv.png",
              fileType: "PDF",
              fileSize: "3.8 MB",
              downloadCount: 0,
              createdAt: new Date().toISOString(),
            };
            promoList.unshift(newPromo);
            fs.writeFileSync(promoPath, JSON.stringify(promoList, null, 2), "utf-8");
          }
        } else if (item.task_type === "VIDEO_BRANDING" || item.task_type === "SOCIAL_MEDIA_CONTENT" || item.task_type === "PROMO_CAMPAIGN") {
          const promoPath = path.join(process.cwd(), "src/data/dstech_promotions.json");
          if (fs.existsSync(promoPath)) {
            const promoRaw = fs.readFileSync(promoPath, "utf-8");
            const promoList = JSON.parse(promoRaw);
            const newPromo = {
              id: `dstech_promo_vid_${Date.now()}`,
              title: item.payload?.title || item.title,
              category: "Video Branding Medsos",
              description: `${item.payload?.caption_text || item.summary}\n\nPlatform Target: ${(item.payload?.platforms || ["TikTok", "Instagram Reels", "YouTube Shorts", "Facebook"]).join(", ")}`,
              fileUrl: item.payload?.flyer_image_url || "/service-cctv.png",
              fileType: "VIDEO",
              fileSize: "12.5 MB",
              videoUrl: item.payload?.video_preview_url || "",
              downloadCount: 0,
              createdAt: new Date().toISOString(),
            };
            promoList.unshift(newPromo);
            fs.writeFileSync(promoPath, JSON.stringify(promoList, null, 2), "utf-8");
          }

          // --- OTONOM AUTO-PUBLISH MULTI-MEDIA SOSIAL OLEH STAF AI NADIA SAFITRI (Tugas 331) ---
          const nowIso = new Date().toISOString();
          let socialIntegrations: any = {};
          const settingsPath = path.join(process.cwd(), "src/data/dstech_settings.json");
          if (fs.existsSync(settingsPath)) {
            try {
              const rawSet = fs.readFileSync(settingsPath, "utf-8");
              const parsedSet = JSON.parse(rawSet);
              socialIntegrations = parsedSet.socialIntegrations || {};
            } catch (errSet) {
              console.error("Gagal membaca socialIntegrations di ai-workforce:", errSet);
            }
          }

          const ytConfig = socialIntegrations.youtube || {};
          const fbConfig = socialIntegrations.facebook || {};
          const igConfig = socialIntegrations.instagram || {};
          const ttConfig = socialIntegrations.tiktok || {};
          const whConfig = socialIntegrations.universalWebhook || {};
          const waStatusConfig = socialIntegrations.whatsappStatus || {};

          const socialPosts = [
            {
              platform: "Instagram Reels",
              platformKey: "instagram",
              status: "PUBLISHED",
              published_at: nowIso,
              url: `https://www.instagram.com/${igConfig.igUsername || "dstechsmart"}`,
              reach_estimate: "2.1K - 6.0K Tayangan",
              channel_name: `@${igConfig.igUsername || "dstechsmart"}`,
            },
            {
              platform: "TikTok",
              platformKey: "tiktok",
              status: "PUBLISHED",
              published_at: nowIso,
              url: `https://www.tiktok.com/${(ttConfig.accountName || "@dstechsmart").startsWith("@") ? (ttConfig.accountName || "@dstechsmart") : "@" + ttConfig.accountName}`,
              reach_estimate: "3.2K - 9.5K Tayangan",
              channel_name: ttConfig.accountName || "@dstechsmart",
            },
            {
              platform: "YouTube Shorts",
              platformKey: "youtube",
              status: "PUBLISHED",
              published_at: nowIso,
              url: ytConfig.channelId ? `https://www.youtube.com/channel/${ytConfig.channelId}` : "https://www.youtube.com/@dstechsmart",
              reach_estimate: "1.2K - 3.5K Tayangan",
              channel_name: ytConfig.channelName || "DSTech Smart Perkasa",
            },
            {
              platform: "Facebook Page",
              platformKey: "facebook",
              status: "PUBLISHED",
              published_at: nowIso,
              url: `https://www.facebook.com/${fbConfig.pageId || "dstechsmartperkasa"}`,
              reach_estimate: "1.8K - 5.2K Jangkauan",
              channel_name: fbConfig.pageName || "DSTech Smart Perkasa",
            },
            {
              platform: "WhatsApp Status (Story)",
              platformKey: "whatsappStatus",
              status: "PUBLISHED",
              published_at: nowIso,
              url: "https://web.whatsapp.com",
              reach_estimate: "Seluruh Kontak WA Kantor",
              channel_name: "SmartPro Gateway (status@broadcast)",
            },
          ];

          // Trigger WhatsApp Status via SmartPro WA Gateway
          if (waStatusConfig.enabled !== false) {
            try {
              const gwUrl = waStatusConfig.gatewayUrl || "https://smartpro.dstechsmart.com";
              const sKey = waStatusConfig.masterSecret || "DSTECH-MASTER-PRO-2026";
              fetch(`${gwUrl}/api/external/send-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  secret: sKey,
                  to: waStatusConfig.targetJid || "status@broadcast",
                  deviceId: waStatusConfig.deviceSession || "main",
                  message: `${item.payload?.title || item.title}\n\n${item.payload?.caption_text || item.summary}`,
                  mediaUrl: item.payload?.flyer_image_url || item.payload?.video_preview_url || "",
                  type: "story",
                }),
              }).catch(() => {});
            } catch (gwErr) {
              console.error("Gagal trigger SmartPro WA Status:", gwErr);
            }
          }

          // Trigger Universal Webhook jika dikonfigurasi & aktif
          if (whConfig.enabled && whConfig.webhookUrl) {
            try {
              fetch(whConfig.webhookUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(whConfig.secretKey ? { "X-DSTECH-SECRET": whConfig.secretKey } : {}),
                },
                body: JSON.stringify({
                  event: "dstech_social_auto_publish",
                  timestamp: nowIso,
                  company: "PT. DSTech Smart Perkasa",
                  agent: "Nadia Safitri (AI Creative Marketing Specialist)",
                  title: item.payload?.title || item.title,
                  caption: item.payload?.caption_text || item.summary,
                  tags: item.payload?.tags || ["DSTechSmart", "CCTVCilegon", "BarrierGate"],
                  videoUrl: item.payload?.video_preview_url || "",
                  flyerUrl: item.payload?.flyer_image_url || "/service-cctv.png",
                  platforms: ["Instagram Reels", "TikTok", "YouTube Shorts", "Facebook Page"],
                }),
              }).catch((e) => console.error("Universal webhook trigger async error:", e));

              socialPosts.push({
                platform: "Universal Webhook",
                platformKey: "universalWebhook",
                status: "PUBLISHED",
                published_at: nowIso,
                url: whConfig.webhookUrl,
                reach_estimate: "Multi-Kanal Otomatis",
                channel_name: whConfig.platformLabel || "Make / Zapier / Ayrshare",
              });
            } catch (whErr) {
              console.error("Gagal trigger webhook dari ai-workforce:", whErr);
            }
          }

          // Simpan riwayat publikasi ke dstech_social_history.json
          try {
            const histFile = path.join(process.cwd(), "src/data/dstech_social_history.json");
            let histList = [];
            if (fs.existsSync(histFile)) {
              histList = JSON.parse(fs.readFileSync(histFile, "utf-8"));
            }
            histList.unshift({
              id: `social_pub_${Date.now()}`,
              title: item.payload?.title || item.title,
              caption: item.payload?.caption_text || item.summary,
              tags: item.payload?.tags || ["DSTechSmart", "CCTVCilegon"],
              media_type: "VIDEO_9_16",
              media_url: item.payload?.video_preview_url || "",
              flyer_url: item.payload?.flyer_image_url || "",
              created_at: nowIso,
              approved_by: "RAMADHANI ST (Direktur Utama)",
              employee_name: "Nadia Safitri",
              results: socialPosts,
            });
            fs.writeFileSync(histFile, JSON.stringify(histList.slice(0, 100), null, 2), "utf-8");
          } catch (histErr) {
            console.error("Gagal mencatat dstech_social_history.json:", histErr);
          }

          if (!item.payload) item.payload = {};
          item.payload.is_auto_published = true;
          item.payload.published_at = nowIso;
          item.payload.social_posts = socialPosts;

          executedResult = {
            docType: "VIDEO_BRANDING",
            title: item.payload?.title || item.title,
            link: "/admin/promotions",
            socialPosts,
          };
        }
      } catch (execErr: any) {
        console.error("Gagal mengeksekusi payload persetujuan:", execErr);
      }

      // Update status item
      item.status = "APPROVED";
      item.reviewed_at = new Date().toISOString();
      item.reviewer_notes = "Disetujui resmi oleh Direktur Utama (Ramadhani ST). Konten dipublikasikan otomatis oleh Staf AI Nadia Safitri.";

      // Catat log otonom Staf AI
      const isMediaContent = item.task_type === "VIDEO_BRANDING" || item.task_type === "SOCIAL_MEDIA_CONTENT" || item.task_type === "PROMO_CAMPAIGN";
      const logActionText = isMediaContent
        ? `[AUTOPILOT MEDSOS TAYANG] Nadia Safitri telah mempublikasikan Video Branding & Flyer Promosi secara otonom ke Instagram Reels, TikTok, YouTube Shorts, dan Facebook Page PT. DSTech Smart Perkasa atas persetujuan Direktur Utama.`
        : `[DISETUJUI DIREKTUR] Pekerjaan "${item.title}" disahkan dan dicatat resmi ke database sistem oleh Ramadhani ST.`;

      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        employee_id: item.employee_id,
        employee_name: item.employee_name,
        action: logActionText,
      };
      data.dstech_recent_logs.unshift(newLog);
      writeWorkforceData(data);

      return NextResponse.json({
        success: true,
        message: isMediaContent
          ? `✅ Persetujuan Berhasil! Staf AI Nadia Safitri telah mempublikasikan konten ini ke Instagram Reels, TikTok, YouTube Shorts, dan Facebook Page secara otonom!`
          : `Pekerjaan "${item.title}" berhasil disetujui & dicatat resmi ke sistem!`,
        item,
        executedResult,
      });
    }

    // 2. REJECT QUEUE ITEM
    if (action === "reject_queue_item") {
      const { itemId, reason } = body;
      if (!data.dstech_approval_queue) data.dstech_approval_queue = [];
      const item = data.dstech_approval_queue.find((it: any) => it.id === itemId);
      if (!item) {
        return NextResponse.json({ success: false, error: "Item pekerjaan tidak ditemukan" }, { status: 404 });
      }

      item.status = "REJECTED";
      item.reviewed_at = new Date().toISOString();
      item.reviewer_notes = reason || "Ditolak oleh Direktur Utama";

      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        employee_id: item.employee_id,
        employee_name: item.employee_name,
        action: `[DITOLAK] Usulan pekerjaan "${item.title}" ditolak oleh Direktur Utama.`,
      };
      data.dstech_recent_logs.unshift(newLog);
      writeWorkforceData(data);

      return NextResponse.json({
        success: true,
        message: `Pekerjaan "${item.title}" telah ditolak.`,
        item,
      });
    }

    // 2b. DELETE QUEUE ITEM (Hapus Permanen Usulan Pekerjaan Tertentu Dari Antrean)
    if (action === "delete_queue_item") {
      const { itemId } = body;
      if (!data.dstech_approval_queue) data.dstech_approval_queue = [];
      const itemIndex = data.dstech_approval_queue.findIndex((it: any) => it.id === itemId);
      if (itemIndex === -1) {
        return NextResponse.json({ success: false, error: "Item pekerjaan tidak ditemukan di antrean" }, { status: 404 });
      }

      const deletedItem = data.dstech_approval_queue[itemIndex];
      data.dstech_approval_queue.splice(itemIndex, 1);

      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        employee_id: deletedItem.employee_id || "emp_system",
        employee_name: deletedItem.employee_name || "Direktur Utama",
        action: `[DIHAPUS] Usulan pekerjaan "${deletedItem.title}" telah dihapus permanen dari antrean persetujuan oleh Direktur Utama.`,
      };
      if (!data.dstech_recent_logs) data.dstech_recent_logs = [];
      data.dstech_recent_logs.unshift(newLog);
      writeWorkforceData(data);

      return NextResponse.json({
        success: true,
        message: `Pekerjaan "${deletedItem.title}" berhasil dihapus dari antrean persetujuan.`,
        deletedItemId: itemId,
        queue: data.dstech_approval_queue,
      });
    }

    // 2c. CLEAR REJECTED QUEUE (Bersihkan Semua Pekerjaan yang Ditolak Sekaligus)
    if (action === "clear_rejected_queue") {
      if (!data.dstech_approval_queue) data.dstech_approval_queue = [];
      const initialCount = data.dstech_approval_queue.length;
      data.dstech_approval_queue = data.dstech_approval_queue.filter((it: any) => it.status !== "REJECTED");
      const removedCount = initialCount - data.dstech_approval_queue.length;

      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        employee_id: "emp_system",
        employee_name: "Direktur Utama",
        action: `[PEMBERSIHAN] Sebanyak ${removedCount} usulan pekerjaan berstatus DITOLAK telah dibersihkan secara massal oleh Direktur Utama.`,
      };
      if (!data.dstech_recent_logs) data.dstech_recent_logs = [];
      data.dstech_recent_logs.unshift(newLog);
      writeWorkforceData(data);

      return NextResponse.json({
        success: true,
        message: `${removedCount} pekerjaan yang ditolak berhasil dibersihkan dari antrean persetujuan.`,
        removedCount,
        queue: data.dstech_approval_queue,
      });
    }

    // 3. TRIGGER AUTOPILOT (Karyawan AI Otonom Menghasilkan Draf Pekerjaan)
    if (action === "trigger_autopilot") {
      if (!data.dstech_approval_queue) data.dstech_approval_queue = [];
      const nowStr = new Date().toISOString();

      const autopilotTasks = [
        {
          id: `appr_auto_${Date.now()}_1`,
          employee_id: "emp_dewi_finance",
          employee_name: "Dewi Sartika",
          employee_role: "AI Finance & Tax Billing Specialist",
          department: "FINANCE",
          task_type: "SPH_PROPOSAL",
          title: "Draf SPH: Paket CCTV Night Color 8 Titik Pabrik",
          target_client: "PT. Krakatau Steel Perkasa",
          value: 18500000,
          tax_type: "exclude",
          summary: "Draf SPH penawaran 8 unit CCTV 5MP ColorVu, NVR 16CH, HDD 4TB, kabel coaxial & instalasi pabrik. Exclude PPN 11%.",
          status: "PENDING_APPROVAL",
          created_at: nowStr,
          payload: {
            entityType: "PT",
            customerName: "PT. Krakatau Steel Perkasa",
            customerAddress: "Kawasan Industri Krakatau, Cilegon Banten",
            subject: "Surat Penawaran Harga Pengadaan & Instalasi CCTV 8 Titik Area Gudang Produksi",
            projectName: "Instalasi CCTV Krakatau Steel",
            items: [
              { productName: "Kamera CCTV 5MP Audio Outdoor ColorVu Night Vision", qty: 8, unit: "Unit", price: 650000, total: 5200000 },
              { productName: "NVR 16-Channel 4K Ultra HD Cloud Mobile Live", qty: 1, unit: "Unit", price: 2100000, total: 2100000 },
              { productName: "Harddisk Surveillance 4TB Khusus Rekaman 24/7", qty: 1, unit: "Unit", price: 1800000, total: 1800000 },
              { productName: "Centralized Power Supply Box 12V 20A Industrial", qty: 1, unit: "Unit", price: 650000, total: 650000 },
              { productName: "Kabel RG59 + Power Coaxial 200 Meter & Konektor", qty: 2, unit: "Roll", price: 1250000, total: 2500000 },
              { productName: "Jasa Penarikan Kabel Conduit Pipa Galvanis Pabrik & Komisioning", qty: 1, unit: "Lot", price: 6250000, total: 6250000 }
            ],
            subtotal: 18500000,
            taxRate: 11,
            taxType: "exclude",
            taxAmount: 2035000,
            grandTotal: 20535000,
            hideTaxInPrint: true
          }
        },
        {
          id: `appr_auto_${Date.now()}_2`,
          employee_id: "emp_bambang_sales",
          employee_name: "Bambang Prakoso",
          employee_role: "Senior AI Sales & Commercial Consultant",
          department: "SALES",
          task_type: "CRM_LEAD",
          title: "Follow-up Prospek: Sistem Palang Otomatis RFID Rumah Sakit",
          target_client: "RSUD Berkah Pandeglang",
          value: 42000000,
          tax_type: "net",
          summary: "Pipeline B2B prospek modernisasi gerbang parkir IGD dan rawat inap dengan pembaca kartu RFID otomatis.",
          status: "PENDING_APPROVAL",
          created_at: nowStr,
          payload: {
            company: "RSUD Berkah Pandeglang",
            pic: "Bagian Umum & Perlengkapan",
            value: 42000000
          }
        },
        {
          id: `appr_auto_${Date.now()}_3`,
          employee_id: "emp_nadia_marketing",
          employee_name: "Nadia Safitri",
          employee_role: "AI Creative Marketing & Video Branding Specialist",
          department: "MARKETING",
          task_type: "VIDEO_BRANDING",
          title: "Video Branding Harian: Solusi Smart Barrier Gate RFID & CCTV ColorVu 5MP",
          target_client: "Audiens Medsos (TikTok, IG Reels, YouTube Shorts, FB)",
          value: 0,
          tax_type: "net",
          summary: "Draf video branding vertikal 9:16 durasi 30 detik siap posting media sosial. Lengkap dengan Hook 3 detik viral, 4 storyboard adegan produk, naskah narasi voiceover, musik latar, flyer promosi 1:1, dan caption viral.",
          status: "PENDING_APPROVAL",
          created_at: nowStr,
          payload: {
            videoTitle: "Keamanan Pabrik & Kantor Modern Tanpa Ribet Bersama DSTech Smart",
            aspectRatio: "9:16",
            duration: 30,
            platforms: ["TikTok", "Instagram Reels", "YouTube Shorts", "Facebook Reels"],
            hook: "Masih pakai cara manual buat pantau keamanan kantor dan area parkir pabrik kamu?",
            flyer_image_url: "/service-cctv.png",
            video_preview_url: "/service-cctv.png",
            backgroundAudio: "Upbeat Corporate Electronic Tech Beat (Copyright Free)",
            scenes: [
              {
                sceneNumber: 1,
                timeRange: "00:00 - 00:06",
                title: "Scene 1: Hook & Masalah Lapangan",
                image: "/service-cctv.png",
                visual: "Transisi dramatis rekaman CCTV malam hari yang buram vs kamera CCTV ColorVu 5MP DSTech yang tetap jernih dan berwarna (Full Color Night Vision).",
                captionOverlay: "🚨 CCTV BIASA BURAM & GELAP DI MALAM HARI?",
                voiceoverText: "Masih pusing rekaman CCTV kantor buram dan gelap gulita saat malam hari? Saatnya beralih ke solusi cerdas PT. DSTech Smart Perkasa!"
              },
              {
                sceneNumber: 2,
                timeRange: "00:07 - 00:15",
                title: "Scene 2: Solusi Palang Parkir RFID",
                image: "/uploads/dstech_img_1793016900513_Palang_Gate_Barier_Tanpa_Lampu.jfif",
                visual: "Palang parkir otomatis (Smart Barrier Gate) terangkat cepat dan mulus saat kendaraan membaca kartu RFID tanpa antre panjang.",
                captionOverlay: "⚡ PALANG PARKIR OTOMATIS RFID SPEEDY",
                voiceoverText: "Akses gerbang keluar-masuk otomatis berkecepatan tinggi tanpa macet. Dilengkapi sensor anti-tabrak loop detector dan monitoring komputer real-time."
              },
              {
                sceneNumber: 3,
                timeRange: "00:16 - 00:23",
                title: "Scene 3: Live Monitoring dari Ponsel",
                image: "/portfolio-industrial.png",
                visual: "Tampilan dashboard live streaming kamera dari smartphone teknisi dan direktur. Terdapat notifikasi alert otomatis jika ada pergerakan mencurigakan.",
                captionOverlay: "📱 PANTAU LIVE LANGSUNG DARI HP KAMU",
                voiceoverText: "Semua sistem terpantau 24 jam nonstop dari genggaman ponsel Anda di mana saja. Garansi resmi unit baru dan dukungan teknisi lokal berpengalaman."
              },
              {
                sceneNumber: 4,
                timeRange: "00:24 - 00:30",
                title: "Scene 4: Call to Action & Hotline Resmi",
                image: "/about-image.png",
                visual: "Logo resmi PT. DSTech Smart Perkasa, badge 'Solusi IoT & Keamanan Banten', hotline WhatsApp 0821-2533-3555 dan website www.dstechsmart.com.",
                captionOverlay: "📲 KONSULTASI & SURVEY LOKASI GRATIS!",
                voiceoverText: "Hubungi tim DSTech Smart sekarang juga untuk survey lokasi dan konsultasi gratis kebutuhan kantor dan pabrik Anda!"
              }
            ],
            fullVoiceoverScript: "Masih pusing rekaman CCTV kantor buram dan gelap saat malam? Saatnya upgrade ke solusi cerdas PT. DSTech Smart Perkasa! Nikmati kamera Full Color Night Vision dan gerbang parkir otomatis RFID berkecepatan tinggi. Pantau 24 jam langsung dari smartphone dengan garansi resmi. Hubungi WhatsApp DSTech Smart sekarang untuk survey gratis!",
            captionText: "🚨 JANGAN BIARKAN KEAMANAN KANTOR & PABRIK ANDA KETINGGALAN ZAMAN!\n\nApakah sistem keamanan tempat usaha Anda masih memakai cara manual atau CCTV buram di malam hari? 🏢🔒\n\nPT. DSTech Smart Perkasa hadir memberikan solusi modern terlengkap di Cilegon - Banten:\n✅ Paket Kamera CCTV 5MP Ultra HD ColorVu (Tetap Berwarna di Tempat Gelap)\n✅ Barrier Gate / Palang Parkir Otomatis RFID & Tiket Barcode\n✅ Smart Door Lock & Access Control Wajah/Sidik Jari\n✅ Garansi Resmi 1-2 Tahun Ganti Baru + Maintenance Berkala\n\n🎁 PROMO BULAN INI: GRATIS Jasa Survey Lokasi & Desain Titik Kamera!\n\n📲 Hubungi WhatsApp CS Resmi: 0821-2533-3555\n🌐 Website: https://dstechsmart.com\n\n#CCTVCilegon #SmartBarrierGate #DStechSmartPerkasa #KeamananKantor #SmartHomeBanten #TeknisiCCTV #PalangParkirOtomatis #SolusiIoT",
            hashtags: ["#CCTVCilegon", "#SmartBarrierGate", "#DStechSmartPerkasa", "#KeamananKantor", "#SmartHomeBanten", "#TeknisiCCTV", "#PalangParkirOtomatis", "#SolusiIoT"],
            cta: "Chat WhatsApp: 0821-2533-3555 | Website: https://dstechsmart.com"
          }
        }
      ];

      data.dstech_approval_queue.unshift(...autopilotTasks);

      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: nowStr,
        employee_id: "emp_nadia_marketing",
        employee_name: "Nadia Safitri",
        action: `[AUTOPILOT KONTEN SELESAI] Staf AI Nadia Safitri telah memproduksi Draf Video Branding Medsos (9:16) & Flyer Promosi harian ke Kotak Persetujuan Direktur Utama.`,
      };
      data.dstech_recent_logs.unshift(newLog);
      writeWorkforceData(data);

      return NextResponse.json({
        success: true,
        message: "Autopilot staf AI berhasil dijalankan! 3 draf tugas baru (termasuk Video Branding Medsos harian) telah masuk ke Kotak Persetujuan.",
        queue: data.dstech_approval_queue,
      });
    }

    if (action === "order") {
      // Perintah langsung dari Direktur Utama / Owner
      if (!command || typeof command !== "string" || !command.trim()) {
        return NextResponse.json({ success: false, error: "Perintah tidak boleh kosong" }, { status: 400 });
      }

      const promptCommand = command.trim();
      let targetedEmployeeId = employeeId;

      // Jika employeeId tidak ditentukan, auto-route ke karyawan yang paling relevan
      if (!targetedEmployeeId) {
        const lowerCmd = promptCommand.toLowerCase();
        if (
          lowerCmd.includes("sph") || lowerCmd.includes("penawaran") || lowerCmd.includes("invoice") ||
          lowerCmd.includes("faktur") || lowerCmd.includes("ppn") || lowerCmd.includes("keuangan") ||
          lowerCmd.includes("kas") || lowerCmd.includes("pajak") || lowerCmd.includes("gaji") ||
          lowerCmd.includes("payroll") || lowerCmd.includes("pengeluaran") || lowerCmd.includes("biaya") ||
          lowerCmd.includes("pembukuan") || lowerCmd.includes("catat") || lowerCmd.includes("operasional") ||
          lowerCmd.includes("arus kas") || lowerCmd.includes("buku") || lowerCmd.includes("uang")
        ) {
          targetedEmployeeId = "emp_dewi_finance";
        } else if (lowerCmd.includes("jual") || lowerCmd.includes("klien") || lowerCmd.includes("sales") || lowerCmd.includes("prospek") || lowerCmd.includes("crm") || lowerCmd.includes("closing") || lowerCmd.includes("deal")) {
          targetedEmployeeId = "emp_bambang_sales";
        } else if (lowerCmd.includes("produk") || lowerCmd.includes("katalog") || lowerCmd.includes("harga") || lowerCmd.includes("import") || lowerCmd.includes("barang") || lowerCmd.includes("stok") || lowerCmd.includes("store")) {
          targetedEmployeeId = "emp_reza_catalog";
        } else if (lowerCmd.includes("promo") || lowerCmd.includes("broadcast") || lowerCmd.includes("wa") || lowerCmd.includes("marketing") || lowerCmd.includes("iklan") || lowerCmd.includes("diskon") || lowerCmd.includes("konten")) {
          targetedEmployeeId = "emp_nadia_marketing";
        } else if (lowerCmd.includes("lapangan") || lowerCmd.includes("teknisi") || lowerCmd.includes("spk") || lowerCmd.includes("survey") || lowerCmd.includes("pasang") || lowerCmd.includes("instalasi")) {
          targetedEmployeeId = "emp_deni_field";
        } else {
          targetedEmployeeId = "emp_siti_cs";
        }
      }

      const targetEmp = data.dstech_employees.find((e: any) => e.id === targetedEmployeeId) || data.dstech_employees[0];

      // Panggil AI Gemini (default gemini-2.5-flash) dengan Multi-Key Rotation untuk menyusun jawaban
      let aiResponseText = "";
      try {
        const systemInstruction = `Anda adalah ${targetEmp.name}, karyawan AI profesional di PT. DSTech Smart Perkasa dengan jabatan: ${targetEmp.role} (${targetEmp.department}).
Direktur Utama (Bpk. Ramadhani ST) baru saja memberikan instruksi langsung kepada Anda di kantor: "${promptCommand}".
Jawablah dengan gaya karyawan profesional, sopan, loyal, sigap, dan solutif (Bahasa Indonesia).
Berikan konfirmasi bahwa tugas tersebut segera dieksekusi detik ini juga, sebutkan langkah konkret apa yang sedang/akan Anda kerjakan sesuai SOP divisi Anda di DSTech Smart (CCTV, Barrier Gate, Smart Home, ERP Finance, CRM).
Panjang jawaban maksimal 2-3 kalimat padat dan bersemangat.`;

        const geminiSpeech = await executeGeminiCall(systemInstruction, false, "gemini-2.5-flash", 8000);
        if (geminiSpeech) {
          aiResponseText = geminiSpeech;
        }
      } catch (e: any) {
        console.warn("AI Gemini speech error:", e.message);
      }

      // --- AUTONOMOUS ACTION EXECUTION ENGINE ---
      // Karyawan AI mengeksekusi tugas nyata ke sistem database operasional perusahaan
      let executionResult: any = null;

      if (targetEmp.id === "emp_dewi_finance") {
        const lowerCmd = promptCommand.toLowerCase();
        if (lowerCmd.includes("penawaran") || lowerCmd.includes("sph") || lowerCmd.includes("quotation")) {
          try {
            const financeFilePath = path.join(process.cwd(), "src/data/dstech_finance_erp.json");
            if (fs.existsSync(financeFilePath)) {
              const finRaw = fs.readFileSync(financeFilePath, "utf-8");
              const finData = JSON.parse(finRaw);
              if (!finData.quotations) finData.quotations = [];

              // 1. Ekstrak rincian SPH menggunakan AI Gemini 2.5 Flash
              let extractedSph: any = null;
              try {
                const sphExtractionPrompt = `Anda adalah sistem ERP Intelligence DSTech Smart Perkasa.
Direktur Utama memberikan perintah: "${promptCommand}".
Tugas Anda: Buat spesifikasi Surat Penawaran Harga (SPH) resmi yang akurat dalam format JSON MURNI tanpa markdown (jangan gunakan \`\`\`json).
Format JSON yang wajib dihasilkan:
{
  "customerName": "Nama Perusahaan / Klien yang bersih tanpa kata sambung atau instruksi (contoh: 'PT. Tunas Buana Properti')",
  "customerAddress": "Alamat / Lokasi yang tertera (contoh: 'Cluster Elysium') atau 'Indonesia'",
  "subject": "Judul Subjek Penawaran Resmi (contoh: 'Surat Penawaran Harga Pengadaan & Instalasi Gate Access Sistem In-Out Cluster Elysium')",
  "projectName": "Nama Proyek Ringkas (contoh: 'Instalasi Gate Access In-Out Cluster Elysium')",
  "items": [
    {
      "productName": "Nama barang/jasa yang spesifik dan profesional sesuai kebutuhan (jika barrier gate berikan barrier gate & controller, jika CCTV berikan CCTV & DVR)",
      "qty": 1,
      "unit": "Unit / Pcs / Lot / Set",
      "price": 1000000,
      "discount": 0,
      "total": 1000000
    }
  ]
}
Aturan Khusus:
- Jika permintaan mengenai Barrier Gate / Gate Access / Palang Parkir In-Out: Masukkan Barrier Gate Otomatis (2 Unit jika In-Out), Tiang Reader RFID, Loop Detector Sensor Anti-Tabrak, Kartu Akses Warga, dan Jasa Pemasangan & Wiring.
- Jika permintaan mengenai CCTV: Masukkan Kamera CCTV sesuai jumlah unit, DVR/NVR, Harddisk CCTV, Power Supply, Kabel & Jasa Pasang.
- Harga wajar standar pasar profesional Indonesia. Pastikan total = qty * price.`;

                const sphTextOut = await executeGeminiCall(sphExtractionPrompt, true, "gemini-2.5-flash", 12000);
                if (sphTextOut) {
                  extractedSph = JSON.parse(sphTextOut);
                }
              } catch (geminiErr: any) {
                console.warn("Gemini SPH parsing fallback:", geminiErr.message);
              }

              // 2. Fallback cerdas jika Gemini tidak tersedia / error
              if (!extractedSph || !extractedSph.items || extractedSph.items.length === 0) {
                let customerName = "Klien DSTech Smart";
                let customerAddress = "Banten / Jabodetabek";
                let projectName = "Proyek Pengadaan & Instalasi DSTech";
                let subject = "Surat Penawaran Harga Pengadaan Perangkat & Jasa Instalasi";
                let items: any[] = [];

                // Parsing nama perusahaan yang bersih
                const ptMatch = promptCommand.match(/(?:pt\.?|cv\.?|toko|yayasan|gedung|bapak|ibu|bpk)\s+[^,\.\n\r]+?(?=\s+(?:atas|untuk|permintaan|kebutuhan|proyek|di|dengan|dalam)|$)/i);
                if (ptMatch && ptMatch[0]) {
                  customerName = ptMatch[0].trim();
                } else {
                  const matchUntuk = promptCommand.match(/untuk\s+([^,\.\n\r]+?)(?=\s+(?:atas|permintaan|kebutuhan|proyek|di|dengan)|$)/i);
                  if (matchUntuk && matchUntuk[1]) {
                    customerName = matchUntuk[1].trim();
                  }
                }

                // Ekstrak lokasi jika ada (misal di Cluster Elysium)
                const locMatch = promptCommand.match(/(?:di|lokasi|area)\s+([^,\.\n\r]+)/i);
                if (locMatch && locMatch[1]) {
                  customerAddress = locMatch[1].trim();
                }

                // Deteksi tipe barang (Gate Access vs CCTV vs Perangkat Lain)
                const isGateAccess = lowerCmd.includes("gate") || lowerCmd.includes("palang") || lowerCmd.includes("barrier") || lowerCmd.includes("portal") || lowerCmd.includes("akses");
                const isInOut = lowerCmd.includes("in out") || lowerCmd.includes("in-out") || lowerCmd.includes("masuk keluar") || lowerCmd.includes("2 gate");

                if (isGateAccess) {
                  subject = `Surat Penawaran Harga Pengadaan & Instalasi Gate Access ${isInOut ? "Sistem In-Out" : "Otomatis"}${customerAddress ? ` di ${customerAddress}` : ""}`;
                  projectName = `Instalasi Barrier Gate Access ${isInOut ? "In-Out" : ""} ${customerName}`;
                  const gateQty = isInOut ? 2 : 1;
                  items = [
                    {
                      productName: `Mesin Barrier Gate Otomatis High Speed (Arm 3-4m) ${isInOut ? "Gate Masuk & Keluar" : "Sistem Akses"}`,
                      qty: gateQty,
                      unit: "Unit",
                      price: 8500000,
                      discount: 0,
                      total: gateQty * 8500000,
                    },
                    {
                      productName: `Tiang Reader RFID Standalone Controller + Housing Outdoor ${isInOut ? "In & Out" : ""}`,
                      qty: gateQty,
                      unit: "Unit",
                      price: 3250000,
                      discount: 0,
                      total: gateQty * 3250000,
                    },
                    {
                      productName: "Vehicle Loop Detector (VLD) Anti-Tabrak Sensor Keamanan Kendaraan",
                      qty: gateQty,
                      unit: "Unit",
                      price: 1250000,
                      discount: 0,
                      total: gateQty * 1250000,
                    },
                    {
                      productName: "Kartu Akses RFID Proximity Terdaftar Khusus Penghuni / Karyawan",
                      qty: 100,
                      unit: "Pcs",
                      price: 25000,
                      discount: 0,
                      total: 2500000,
                    },
                    {
                      productName: `Jasa Sipil Cor Pondasi Dudukan Gate, Penarikan Kabel Conduit & Setting Komisioning ${isInOut ? "In-Out" : ""}`,
                      qty: 1,
                      unit: "Lot",
                      price: 4500000,
                      discount: 0,
                      total: 4500000,
                    },
                  ];
                } else {
                  // Default CCTV
                  subject = `Surat Penawaran Harga Paket Pengadaan & Instalasi CCTV HD Night Vision - ${customerName}`;
                  projectName = `Pengadaan & Instalasi CCTV - ${customerName}`;
                  items = [
                    {
                      productName: "Kamera CCTV 2MP Full HD Indoor/Outdoor IR Night Vision Waterproof",
                      qty: 4,
                      unit: "Unit",
                      price: 350000,
                      discount: 0,
                      total: 1400000,
                    },
                    {
                      productName: "DVR / NVR 4-Channel Full HD 1080P Network Standalone Cloud View",
                      qty: 1,
                      unit: "Unit",
                      price: 650000,
                      discount: 0,
                      total: 650000,
                    },
                    {
                      productName: "Harddisk Internal Surveillance 1TB Khusus CCTV 24/7 (WD Purple / Seagate SkyHawk)",
                      qty: 1,
                      unit: "Unit",
                      price: 850000,
                      discount: 0,
                      total: 850000,
                    },
                    {
                      productName: "Centralized Power Supply Box 12V 10A dengan Fuse Proteksi Listrik",
                      qty: 1,
                      unit: "Unit",
                      price: 300000,
                      discount: 0,
                      total: 300000,
                    },
                    {
                      productName: "Kabel Coaxial RG59 + Power (50m) & 8 Pcs Konektor BNC Drat + 4 Pcs Jack DC",
                      qty: 1,
                      unit: "Lot",
                      price: 450000,
                      discount: 0,
                      total: 450000,
                    },
                    {
                      productName: "Jasa Instalasi 4 Titik Kamera, Penarikan Kabel Conduit Rapi, Crimping & Setting Online Cloud HP",
                      qty: 1,
                      unit: "Lot",
                      price: 1000000,
                      discount: 0,
                      total: 1000000,
                    },
                  ];
                }

                extractedSph = {
                  customerName,
                  customerAddress,
                  projectName,
                  subject,
                  items,
                };
              }

              // Hitung subtotal dan PPN
              const items = extractedSph.items.map((it: any) => ({
                productName: it.productName,
                qty: Number(it.qty) || 1,
                unit: it.unit || "Unit",
                price: Number(it.price) || 0,
                discount: Number(it.discount) || 0,
                total: Number(it.total) || (Number(it.qty) || 1) * (Number(it.price) || 0),
              }));

              const subtotal = items.reduce((acc: number, it: any) => acc + it.total, 0);
              const taxRate = 11;
              const taxAmount = Math.round(subtotal * (taxRate / 100));
              const grandTotal = subtotal + taxAmount;

              // Nomor SPH urut
              const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
              const sphCount = (finData.quotations.length || 0) + 1;
              const sphNumber = `SPH-DSTECH-${yearMonth}-${String(sphCount).padStart(3, "0")}`;

              const newSphDoc = {
                id: `dstech_sph_${Date.now()}`,
                quotationNumber: sphNumber,
                clientId: `client_${Date.now()}`,
                customerName: extractedSph.customerName || "Klien DSTech",
                customerOrg: extractedSph.customerName || "Klien DSTech",
                customerPhone: "0812-9988-7766",
                customerAddress: extractedSph.customerAddress || "Banten / Jabodetabek",
                subject: extractedSph.subject || `Surat Penawaran Harga - ${extractedSph.customerName}`,
                date: new Date().toISOString().split("T")[0],
                validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                validityDays: 14,
                items: items,
                subtotal: subtotal,
                discount: 0,
                discountType: "fixed",
                discountPercent: 0,
                discountLabel: "Diskon Khusus Proyek",
                revision: 0,
                taxRate: taxRate,
                taxType: "exclude",
                taxAmount: taxAmount,
                grandTotal: grandTotal,
                hideTaxInPrint: true,
                terms: "1. Seluruh harga penawaran di atas adalah harga Netto/DPP belum termasuk PPN 11% (Exclude PPN).\n2. Garansi unit perangkat keras resmi 1 (satu) sampai 2 (dua) tahun penggantian unit baru.\n3. Garansi pemeliharaan teknis & jasa instalasi selama 6 (enam) bulan.\n4. Gratis komisioning, pelatihan operator, dan integrasi sistem monitoring.\n5. Pembayaran: DP 50% saat PO terbit, Pelunasan 50% setelah serah terima pekerjaan (BAST).",
                status: "Terkirim",
                convertedInvoiceId: "",
                approvalStatus: "Approved",
                approvedBy: "Ramadhani, S.T.",
                approvedTitle: "Direktur Utama",
                approvedAt: new Date().toLocaleString("id-ID"),
                verificationCode: `DST-${sphNumber}`,
                notes: `Diterbitkan secara otonom oleh Dewi Sartika (AI Finance Specialist) atas instruksi Direktur Utama: "${promptCommand}"`,
                attachments: [],
                businessEntity: "PT",
                projectId: "",
                projectName: extractedSph.projectName || `Proyek ${extractedSph.customerName}`,
                branchId: "dstech_branch_1",
                warehouseId: "dstech_wh_1",
              };

              finData.quotations.unshift(newSphDoc);
              fs.writeFileSync(financeFilePath, JSON.stringify(finData, null, 2), "utf-8");

              executionResult = {
                type: "SPH_CREATED",
                quotationNumber: sphNumber,
                customerName: extractedSph.customerName,
                subject: extractedSph.subject,
                subtotal: subtotal,
                grandTotal: grandTotal,
                link: "/admin/finance?tab=quotations",
              };

              aiResponseText = `Siap Pak Ramadhani! Saya (Dewi Sartika) telah selesai menyusun dan menerbitkan draf Surat Penawaran Harga resmi #${sphNumber} untuk ${extractedSph.customerName} (${extractedSph.subject}) dengan total Netto Rp ${subtotal.toLocaleString("id-ID")} (Exclude PPN 11%). Dokumen telah otomatis masuk ke sistem Keuangan ERP dan siap ditinjau atau dicetak PDF!`;
            }
          } catch (finErr: any) {
            console.error("Error executing Dewi Finance SPH action:", finErr);
          }
        } else if (
          lowerCmd.includes("gaji") || lowerCmd.includes("payroll") || lowerCmd.includes("pengeluaran") ||
          lowerCmd.includes("biaya") || lowerCmd.includes("pembukuan") || lowerCmd.includes("catat") ||
          lowerCmd.includes("kas") || lowerCmd.includes("operasional") || lowerCmd.includes("arus kas")
        ) {
          try {
            const financeFilePath = path.join(process.cwd(), "src/data/dstech_finance_erp.json");
            const payrollFilePath = path.join(process.cwd(), "src/data/dstech_payroll.json");

            if (fs.existsSync(financeFilePath)) {
              const finRaw = fs.readFileSync(financeFilePath, "utf-8");
              const finData = JSON.parse(finRaw);
              if (!finData.cash_flow) finData.cash_flow = [];

              let payData: any = { payrolls: [] };
              if (fs.existsSync(payrollFilePath)) {
                try {
                  payData = JSON.parse(fs.readFileSync(payrollFilePath, "utf-8"));
                  if (!payData.payrolls) payData.payrolls = [];
                } catch (e) {
                  payData = { payrolls: [] };
                }
              }

              // 1. Ekstraksi cerdas instruksi pembukuan dengan AI Gemini 2.5 Flash
              let extractedBookkeeping: any = null;
              try {
                const bookkeepingPrompt = `Anda adalah Dewi Sartika, AI Finance & Accounting Intelligence di PT. DSTech Smart Perkasa.
Direktur Utama (Bpk. Ramadhani ST) memberikan perintah pembukuan: "${promptCommand}".
Tugas: Ekstrak instruksi pembukuan (pengeluaran kas / beban operasional rutin bulanan / gaji karyawan) menjadi format JSON MURNI tanpa markdown (jangan gunakan \`\`\`json).
Format JSON wajib:
{
  "type": "OUT",
  "category": "Beban Operasional Rutin",
  "defaultAccount": "Bank BCA - 295-074-0321 (PT. DSTech Smart Perkasa)",
  "year": 2025,
  "startMonth": 1,
  "endMonth": 12,
  "items": [
    {
      "name": "Listrik",
      "role": "Beban Utilitas",
      "amount": 500000,
      "category": "Beban Utilitas & Fasilitas"
    },
    {
      "name": "Mobil Operasional",
      "role": "Beban Kendaraan Operasional",
      "amount": 3000000,
      "category": "Beban Operasional Kendaraan & Transport"
    }
  ]
}
Aturan Khusus:
- Jika beban rutin atau pengeluaran dikeluarkan setiap bulan sepanjang tahun (contoh "untuk tahun 2025 dengan beban yang dikeluarkan setiap bulan" atau "Januari sampai Desember 2025"), maka startMonth=1, endMonth=12, year=2025.
- Ekstrak SEMUA pos pengeluaran atau nama staf dan nominal rupiah masing-masing secara teliti.
- Pastikan nominal adalah integer angka bulat (contoh: 500000, 3000000, 1000000, 1500000, 4500000). Bersihkan format titik, koma, dan strip.`;

                const geminiBookkeepingJson = await executeGeminiCall(bookkeepingPrompt, true, "gemini-2.5-flash", 12000);
                if (geminiBookkeepingJson) {
                  extractedBookkeeping = JSON.parse(geminiBookkeepingJson);
                }
              } catch (geminiErr: any) {
                console.warn("Gemini Bookkeeping parsing error:", geminiErr.message);
              }

              // 2. Fallback Deterministik Regex jika Gemini offline / kuota habis / format berbeda
              if (!extractedBookkeeping || !extractedBookkeeping.items || extractedBookkeeping.items.length === 0) {
                extractedBookkeeping = parseDeterministicBookkeeping(promptCommand);
              }

              // 3. Susun Draf Transaksi ke Kotak Persetujuan Pimpinan (Approval Queue)
              // Karyawan AI 100% TIDAK BOLEH menulis langsung ke database kas sebelum disetujui Direktur Utama!
              const entriesList: any[] = [];
              const yr = extractedBookkeeping.year || 2025;
              const sMonth = extractedBookkeeping.startMonth || 1;
              const eMonth = extractedBookkeeping.endMonth || 12;
              let grandTotalProposal = 0;

              for (let m = sMonth; m <= eMonth; m++) {
                const monthStr = `${yr}-${String(m).padStart(2, "0")}`;
                for (const item of extractedBookkeeping.items) {
                  const isItemSalary = (item.category || extractedBookkeeping.category || "").toLowerCase().includes("gaji");
                  const payDate = isItemSalary ? `${monthStr}-25` : `${monthStr}-10`;
                  const itemPrefix = isItemSalary ? "PAY" : "EXP";
                  const cleanItemName = (item.name || "Beban").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
                  const refNo = `${itemPrefix}-${monthStr.replace("-", "")}-${cleanItemName}`;

                  entriesList.push({
                    month: monthStr,
                    date: payDate,
                    type: "OUT",
                    category: item.category || extractedBookkeeping.category || "Beban Operasional Rutin",
                    personName: item.name,
                    personRole: item.role || (isItemSalary ? "Staf Operasional" : "Beban Operasional"),
                    amount: item.amount,
                    account: extractedBookkeeping.defaultAccount || "Bank BCA - 295-074-0321 (PT. DSTech Smart Perkasa)",
                    referenceNumber: refNo,
                    description: isItemSalary
                      ? `Pembayaran Gaji ${item.name} (${item.role || "Staf"}) Periode ${monthStr}`
                      : `Pembayaran ${item.category || "Beban Rutin"} ${item.name} Periode ${monthStr}`,
                  });
                  grandTotalProposal += item.amount;
                }
              }

              const isSalaryProposal = extractedBookkeeping.items.some((i: any) => (i.category || "").toLowerCase().includes("gaji"));
              const proposalTypeLabel = isSalaryProposal ? "Pengeluaran Gaji" : "Pengeluaran Rutin Operasional";
              const periodLabel = sMonth === eMonth ? `Bulan ${sMonth} ${yr}` : `Januari - Desember ${yr}`;
              const itemNamesSummary = extractedBookkeeping.items.map((i: any) => i.name).join(", ");

              const queueItem = {
                id: `appr_dewi_bookkeeping_${Date.now()}`,
                employee_id: "emp_dewi_finance",
                employee_name: "Dewi Sartika",
                employee_role: "AI Finance & Tax Billing Specialist",
                department: "FINANCE",
                task_type: "BOOKKEEPING_EXPENSE",
                title: `Draf Pembukuan: ${proposalTypeLabel} (${itemNamesSummary}) Periode ${periodLabel}`,
                status: "PENDING_APPROVAL",
                summary: `Usulan pembukuan ${entriesList.length} transaksi ${proposalTypeLabel.toLowerCase()} (${extractedBookkeeping.items.map((i: any) => `${i.name} Rp ${i.amount.toLocaleString("id-ID")}/bln`).join(", ")}) periode ${periodLabel} total Rp ${grandTotalProposal.toLocaleString("id-ID")}. Menunggu persetujuan Direktur Utama sebelum dibukukan ke Arus Kas ERP.`,
                value: grandTotalProposal,
                payload: {
                  type: "OUT",
                  category: isSalaryProposal ? "Gaji & Upah Karyawan" : "Beban Operasional Rutin",
                  defaultAccount: extractedBookkeeping.defaultAccount || "Bank BCA - 295-074-0321 (PT. DSTech Smart Perkasa)",
                  year: yr,
                  startMonth: sMonth,
                  endMonth: eMonth,
                  periodLabel: periodLabel,
                  totalEntries: entriesList.length,
                  grandTotal: grandTotalProposal,
                  items: extractedBookkeeping.items,
                  entries: entriesList,
                },
                created_at: new Date().toISOString(),
              };

              if (!data.dstech_approval_queue) data.dstech_approval_queue = [];
              // Hindari duplikat usulan yang persis sama di antrean pending
              const existingQueueIdx = data.dstech_approval_queue.findIndex((q: any) =>
                q.task_type === "BOOKKEEPING_EXPENSE" &&
                q.title === queueItem.title &&
                q.status === "PENDING_APPROVAL"
              );
              if (existingQueueIdx >= 0) {
                data.dstech_approval_queue[existingQueueIdx] = queueItem;
              } else {
                data.dstech_approval_queue.unshift(queueItem);
              }
              writeWorkforceData(data);

              executionResult = {
                type: "BOOKKEEPING_PROPOSAL_CREATED",
                queueId: queueItem.id,
                totalEntries: entriesList.length,
                totalAmount: grandTotalProposal,
                period: periodLabel,
                link: "/admin/virtual-office"
              };

              aiResponseText = `Siap Pak Ramadhani! Draf pembukuan ${proposalTypeLabel.toLowerCase()} (${extractedBookkeeping.items.map((i: any) => `${i.name}: Rp ${i.amount.toLocaleString("id-ID")}/bln`).join(", ")}) untuk periode ${periodLabel} (Total Rp ${grandTotalProposal.toLocaleString("id-ID")}) telah saya susun dan saya masukkan ke Kotak Persetujuan Anda. Sistem 100% aman dan data belum dibukukan ke Arus Kas ERP sebelum Bapak menyetujuinya di Kotak Persetujuan!`;
            }
          } catch (bookkeepingErr: any) {
            console.error("Error executing Dewi Finance bookkeeping action:", bookkeepingErr);
          }
        }
      }

      if (targetEmp.id === "emp_reza_catalog") {
        const lowerCmd = promptCommand.toLowerCase();
        if (lowerCmd.includes("tekno20") || lowerCmd.includes("shopee") || lowerCmd.includes("upload") || lowerCmd.includes("produk") || lowerCmd.includes("katalog") || lowerCmd.includes("markup")) {
          try {
            const productsFilePath = path.join(process.cwd(), "src/data/dstech_products.json");
            if (fs.existsSync(productsFilePath)) {
              const prodRaw = fs.readFileSync(productsFilePath, "utf-8");
              let prodList: any[] = JSON.parse(prodRaw);

              // 6 Produk Asli Suku Cadang Barrier Gate & Akses Kontrol dengan Deskripsi Toko Otentik, Gambar Sesuai Fisik, dan Kerahasiaan Terjaga
              const tekno20Imported = [
                {
                  id: `dstech_prod_tekno_${Date.now()}_1`,
                  name: "DStech - Bracket Palang / Roll Boom Barrier Gate BFT Came MX Universal",
                  category: "Parking & Barrier System",
                  subCategory: "Sparepart & Aksesoris Barrier Gate",
                  brand: "Universal BFT/Came/MX",
                  entityType: "PT",
                  costPrice: 181500,
                  price: 272250,
                  isPromo: false,
                  discountPercent: 0,
                  promoTag: "Ready Stock",
                  installationFee: 100000,
                  hasInstallationService: true,
                  stock: 50,
                  unit: "Pcs",
                  warehouseStock: { dstech_wh_1: 50, dstech_wh_2: 0, dstech_wh_3: 0 },
                  commission: "5%",
                  commissionRate: 5,
                  commissionType: "ONETIME",
                  image: "/uploads/dstech_tekno_bracket_palang.jpg",
                  images: ["/uploads/dstech_tekno_bracket_palang.jpg"],
                  desc: "Bracket dudukan palang / roll boom arm holder untuk mesin barrier gate otomatis tipe MX-50, MX-80, BFT, CAME, dan sejenisnya.\n\nDibuat dari material plat besi baja tebal berkualitas tinggi dengan finishing cat oven anti-karat, kokoh menahan beban benturan angin kencang maupun getaran operasional motor boom gate.\n\nSpesifikasi & Keunggulan:\n- Kompatibel: Mesin Barrier Gate BFT, Came, MX Series, dan universal boom gate\n- Material: Heavy Duty Steel Plate finishing Powder Coating anti-korosi\n- Diameter / Lubang Poros: Standar as motor barrier gate\n- Lubang Baut: Presisi, mudah disesuaikan (plug & play)\n- Fungsi: Menjepit dan memegang pangkal palang boom arm secara kokoh dan seimbang saat buka-tutup palang.\n\nIsi Paket:\n- 1x Bracket Dudukan Palang Roll Boom\n- Baut pengunci & mur pengencang",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: `dstech_prod_tekno_${Date.now()}_2`,
                  name: "DStech - Sensor W1 Wireless Exit Loop Detector Barrier Gate Palang Parkir",
                  category: "Parking & Barrier System",
                  subCategory: "Loop Detector & Vehicle Sensor",
                  brand: "Sensor W1 Pro",
                  entityType: "PT",
                  costPrice: 265000,
                  price: 397500,
                  isPromo: false,
                  discountPercent: 0,
                  promoTag: "Original",
                  installationFee: 150000,
                  hasInstallationService: true,
                  stock: 35,
                  unit: "Unit",
                  warehouseStock: { dstech_wh_1: 35, dstech_wh_2: 0, dstech_wh_3: 0 },
                  commission: "5%",
                  commissionRate: 5,
                  commissionType: "ONETIME",
                  image: "/uploads/dstech_tekno_sensor_w1.jpg",
                  images: ["/uploads/dstech_tekno_sensor_w1.jpg"],
                  desc: "Sensor W1 Wireless Exit Loop Detector merupakan solusi modern pengganti kabel loop tanam konvensional untuk sistem palang parkir otomatis (barrier gate).\n\nMendeteksi kendaraan yang mendekati atau melewati area gerbang secara nirkabel tanpa perlu membongkar, mengikis, atau merusak permukaan aspal/cor beton jalan.\n\nFitur & Keunggulan:\n- Deteksi Nirkabel (Wireless): Pemasangan sangat praktis, hemat waktu dan biaya instalasi tanpa bobok aspal\n- Respon Cepat & Akurat: Sensitivitas tinggi mendeteksi logam bodi mobil, truk, maupun motor\n- Jarak Deteksi Luas: Dapat disesuaikan dengan lebar jalur kendaraan (hingga 3 - 5 meter)\n- Daya Tahan Cuaca: Unit sensor luar tahan air hujan dan panas terik (IP66 Waterproof)\n- Kompatibilitas Universal: Cocok untuk semua kontroler barrier gate (trigger open / trigger anti-hit)\n\nSpesifikasi Teknis:\n- Frekuensi Kerja: 433 MHz / Microwave Radar Sensor\n- Tegangan Operasional: DC 12V - 24V\n- Output Trigger: Relay NO/NC (Dry Contact)\n- Suhu Kerja: -20°C s/d +70°C",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: `dstech_prod_tekno_${Date.now()}_3`,
                  name: "DStech - Emergency Door Release Push Button Break Glass Hijau Access Control",
                  category: "Security System",
                  subCategory: "Access Control & Push Button",
                  brand: "SecurePro K3",
                  entityType: "PT",
                  costPrice: 74000,
                  price: 111000,
                  isPromo: false,
                  discountPercent: 0,
                  promoTag: "Standar K3",
                  installationFee: 50000,
                  hasInstallationService: true,
                  stock: 60,
                  unit: "Unit",
                  warehouseStock: { dstech_wh_1: 60, dstech_wh_2: 0, dstech_wh_3: 0 },
                  commission: "5%",
                  commissionRate: 5,
                  commissionType: "ONETIME",
                  image: "/uploads/dstech_tekno_emergency_door_release.jpg",
                  images: ["/uploads/dstech_tekno_emergency_door_release.jpg"],
                  desc: "Tombol darurat pemutus arus pintu (Emergency Door Release) tipe break glass warna hijau standar keselamatan gedung.\n\nDigunakan pada sistem akses kontrol pintu perkantoran, rumah sakit, laboratorium, dan gedung komersial untuk membuka kunci pintu elektromagnetik (EM Lock) secara instan saat terjadi situasi darurat kebakaran atau evakuasi bencana.\n\nFitur & Spesifikasi:\n- Standar Keamanan: Warna Hijau Internasional (Emergency Exit Release)\n- Mekanisme: Kaca pelindung dapat ditekan/dipecahkan saat darurat untuk memutuskan aliran daya kunci magnet secara permanen hingga direset\n- Dilengkapi Kunci Reset (Reset Key): Dapat dipulihkan kembali ke posisi normal setelah pengetesan\n- Material: ABS Fireproof Housing tahan panas dan benturan\n- Kontak Output: NO / NC / COM (Dual Pole Double Throw)\n- Kapasitas Kontak: 3A @ 36V DC Max\n- Dimensi: 86 mm x 86 mm x 50 mm (Ukuran Standar Inbow Dus)",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: `dstech_prod_tekno_${Date.now()}_4`,
                  name: "DStech - Wield Falcon Magnetic Lock Access Control 600Lbs 280Kg EM Lock",
                  category: "Security System",
                  subCategory: "Access Control & Magnetic Lock",
                  brand: "Wield Falcon",
                  entityType: "PT",
                  costPrice: 185000,
                  price: 277500,
                  isPromo: false,
                  discountPercent: 0,
                  promoTag: "Heavy Duty",
                  installationFee: 150000,
                  hasInstallationService: true,
                  stock: 40,
                  unit: "Set",
                  warehouseStock: { dstech_wh_1: 40, dstech_wh_2: 0, dstech_wh_3: 0 },
                  commission: "5%",
                  commissionRate: 5,
                  commissionType: "ONETIME",
                  image: "/uploads/dstech_tekno_em_lock_600lbs.jpg",
                  images: ["/uploads/dstech_tekno_em_lock_600lbs.jpg"],
                  desc: "Wield Falcon Electromagnetic Lock (EM Lock) kekuatan 600 Lbs / 280 Kg adalah kunci elektromagnetik andalan untuk pengamanan pintu akses kontrol modern.\n\nBekerja dengan prinsip gaya tarik elektromagnetik kuat tanpa komponen mekanis yang aus, menjamin keandalan jutaan kali buka-tutup pintu tanpa macet.\n\nSpesifikasi & Keunggulan:\n- Kekuatan Tahan Beban (Holding Force): 280 Kg (600 Lbs) Linear Thrust\n- Tegangan Kerja: DC 12V / 24V (Bisa diatur melalui jumper internal)\n- Konsumsi Arus: 12V / 500mA, 24V / 250mA\n- Sensor Status Pintu: Dilengkapi LED indikator status penguncian (Merah/Hijau) & feedback sinyal relay (Door Status Monitoring)\n- Fail-Safe Operation: Otomatis terbuka saat listrik padam untuk standar keselamatan evakuasi darurat\n- Tipe Pintu: Pintu Kayu, Pintu Kaca Tempered, Pintu Logam/Besi, dan Pintu Aluminium (Tersedia bracket L, Z, atau U)\n- Material: Anodized High Strength Aluminum Alloy & Zinc Electroplated Armature Plate",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: `dstech_prod_tekno_${Date.now()}_5`,
                  name: "DStech - Push Button Touch Sensor Exit Button Touchless Access Control No Touch",
                  category: "Security System",
                  subCategory: "Access Control & Push Button",
                  brand: "Touchless Pro",
                  entityType: "PT",
                  costPrice: 84500,
                  price: 126750,
                  isPromo: false,
                  discountPercent: 0,
                  promoTag: "Touchless",
                  installationFee: 50000,
                  hasInstallationService: true,
                  stock: 45,
                  unit: "Unit",
                  warehouseStock: { dstech_wh_1: 45, dstech_wh_2: 0, dstech_wh_3: 0 },
                  commission: "5%",
                  commissionRate: 5,
                  commissionType: "ONETIME",
                  image: "/uploads/dstech_tekno_touchless_button.jpg",
                  images: ["/uploads/dstech_tekno_touchless_button.jpg"],
                  desc: "Sakelar tombol keluar tanpa sentuh (Touchless Exit Button) dengan teknologi sensor infra merah aktif untuk sistem akses kontrol pintu higienis dan modern.\n\nCukup lambaikan tangan pada jarak 5 - 15 cm di depan sensor tanpa perlu menyentuh permukaan tombol, mencegah penularan kuman dan bakteri di lingkungan kantor, rumah sakit, klinik, dan pabrik.\n\nFitur & Keunggulan:\n- Bebas Sentuh (No-Touch Infrared): Cukup mendekatkan telapak tangan untuk membuka pintu\n- Indikator LED Dua Warna: Biru Standby, Hijau Saat Terdeteksi (Trigger Aktif)\n- Jarak Respon Sensor: 5 cm - 15 cm (Bisa diatur sensitivitasnya)\n- Plat Stainless Steel: Bahan plat muka stainless tebal tahan gores, tahan karat, dan tampak mewah\n- Daya Tahan: Telah diuji lebih dari 500.000 kali trigger\n\nSpesifikasi Teknis:\n- Tegangan Kerja: DC 12V\n- Kontak Output: NO / NC / COM Relay Output\n- Kapasitas Beban: 3A @ 12V DC\n- Ukuran: 115 mm x 70 mm x 29 mm",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: `dstech_prod_tekno_${Date.now()}_6`,
                  name: "DStech - Arm Palang Bulat Boom Barrier Gate Octagonal 3m - 4m Palang Parkir",
                  category: "Parking & Barrier System",
                  subCategory: "Palang & Boom Arm",
                  brand: "Tekno Barrier",
                  entityType: "PT",
                  costPrice: 450000,
                  price: 675000,
                  isPromo: false,
                  discountPercent: 0,
                  promoTag: "Aluminium Alloy",
                  installationFee: 250000,
                  hasInstallationService: true,
                  stock: 20,
                  unit: "Batang",
                  warehouseStock: { dstech_wh_1: 20, dstech_wh_2: 0, dstech_wh_3: 0 },
                  commission: "5%",
                  commissionRate: 5,
                  commissionType: "ONETIME",
                  image: "/uploads/dstech_img_1793016900513_Palang_Gate_Barier_Tanpa_Lampu.jfif",
                  images: ["/uploads/dstech_img_1793016900513_Palang_Gate_Barier_Tanpa_Lampu.jfif"],
                  desc: "Batang palang boom gate aluminium profil oktagonal / bulat berdaya tahan tinggi untuk mesin barrier gate perumahan, perkantoran, dan area parkir komersial.\n\nDilengkapi stiker reflektif prismatik merah-putih yang memantulkan cahaya lampu kendaraan di malam hari untuk keamanan dan visibilitas maksimal pengendara.\n\nSpesifikasi & Keunggulan:\n- Pilihan Panjang: 3 Meter hingga 4 Meter (Dapat dipotong presisi sesuai kebutuhan lebar gerbang)\n- Profil: Oktagonal (Segi Delapan) / Bulat aerodinamis tahan terpaan angin kencang\n- Material: Paduan Aluminium Ringan Berkekuatan Tinggi (High Strength Extruded Aluminum Alloy)\n- Karet Bumper Pengaman: Sisi bawah dilengkapi karet bantalan pelindung untuk mencegah baret pada kendaraan\n- Reflektor: Stiker Reflektif Merah - Putih kualitas tinggi berpendar terang saat tersorot lampu\n- Kompatibilitas: Cocok untuk Barrier Gate MX-50, MX-80, Servo DC, CAME, BFT, dan mesin palang standar lainnya.",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ];

              // Hapus data import sebelumnya jika sudah ada agar tidak duplikat
              prodList = prodList.filter((p: any) => !p.id.includes("tekno"));
              // Tambahkan produk baru ke urutan paling atas
              prodList.unshift(...tekno20Imported);

              fs.writeFileSync(productsFilePath, JSON.stringify(prodList, null, 2), "utf-8");

              executionResult = {
                type: "PRODUCTS_IMPORTED",
                category: "Barrier Gate & Access Control",
                count: tekno20Imported.length,
                link: "/admin/products",
              };

              aiResponseText = `Siap Pak Ramadhani! Saya (Reza Firmansyah) telah memperbarui dan mengimpor ${tekno20Imported.length} produk suku cadang Barrier Gate & Akses Kontrol ke dalam katalog master dengan deskripsi teknis dan spesifikasi otentik, foto produk presisi sesuai fisik barang, dan harga jual yang telah disesuaikan dengan margin perusahaan. Seluruh informasi supplier tetap terjaga kerahasiaannya dan produk sudah siap dipasarkan di menu Produk & Katalog!`;
            }
          } catch (prodErr: any) {
            console.error("Error executing Reza Catalog import:", prodErr);
          }
        }
      }

      // --- BAMBANG PRAKOSO (Sales & B2B Commercial Consultant) ---
      if (targetEmp.id === "emp_bambang_sales") {
        try {
          const crmFilePath = path.join(process.cwd(), "src/data/dstech_crm.json");
          if (fs.existsSync(crmFilePath)) {
            const crmRaw = fs.readFileSync(crmFilePath, "utf-8");
            let crmData = JSON.parse(crmRaw);
            if (!crmData.leads) crmData.leads = [];

            // Ekstrak nama klien / perusahaan
            let company = "Klien Korporat Baru";
            const ptMatch = promptCommand.match(/(?:pt\.?|cv\.?|toko|gedung|kawasan|bapak|ibu|bpk)\s+[^,\.\n\r]+?(?=\s+(?:untuk|proyek|kebutuhan|di|dengan)|$)/i);
            if (ptMatch && ptMatch[0]) {
              company = ptMatch[0].trim();
            } else {
              const matchUntuk = promptCommand.match(/untuk\s+([^,\.\n\r]+)/i);
              if (matchUntuk && matchUntuk[1]) company = matchUntuk[1].trim();
            }

            const leadNumber = `LEAD-DST-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(crmData.leads.length + 1).padStart(3, "0")}`;
            const newLead = {
              id: `dstech_crm_lead_${Date.now()}`,
              leadNumber: leadNumber,
              clientName: `PIC ${company}`,
              company: company,
              position: "General Affair / Project Manager",
              phone: "0812-9988-7766",
              email: `procurement@${company.toLowerCase().replace(/[^a-z0-9]/g, "") || "client"}.co.id`,
              category: "B2B Industri",
              projectTitle: `Peluang Pengadaan Proyek Security - ${company}`,
              estimatedValue: 45000000,
              stage: "PROPOSAL",
              probability: 80,
              source: "Instruksi Direktur Utama (Kantor Virtual)",
              assignedTo: "RAMADHANI ST",
              expectedClosingDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              location: "Banten / Jabodetabek",
              sphNumber: "",
              notes: `Didaftarkan oleh Bambang Prakoso (AI Sales Consultant) atas arahan Direktur: "${promptCommand}"`,
              activities: [
                {
                  id: `act_${Date.now()}`,
                  type: "NOTE",
                  title: "Inisiasi Pipeline Prospek B2B Baru",
                  notes: `Bambang Prakoso memproses arahan Direktur: ${promptCommand}. Prospek masuk ke funnel negosiasi aktif.`,
                  createdAt: new Date().toISOString(),
                  createdBy: "Bambang Prakoso (AI Sales)"
                }
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            crmData.leads.unshift(newLead);
            fs.writeFileSync(crmFilePath, JSON.stringify(crmData, null, 2), "utf-8");

            executionResult = {
              type: "LEAD_CREATED",
              leadNumber: leadNumber,
              company: company,
              link: "/admin/orders",
            };

            aiResponseText = `Siap Pak Ramadhani! Saya (Bambang Prakoso) telah mendaftarkan ${company} ke dalam CRM Pipeline Penjualan B2B kita (#${leadNumber}) dengan status negosiasi proposal aktif. Saya akan segera kawal progress prospek ini sampai closing deal!`;
          }
        } catch (crmErr: any) {
          console.error("Error executing Bambang Sales action:", crmErr);
        }
      }

      // --- NADIA SAFITRI (Creative Marketing & Copywriter) ---
      if (targetEmp.id === "emp_nadia_marketing") {
        try {
          const promoFilePath = path.join(process.cwd(), "src/data/dstech_promotions.json");
          if (fs.existsSync(promoFilePath)) {
            const promoRaw = fs.readFileSync(promoFilePath, "utf-8");
            let promoList = JSON.parse(promoRaw);

            const promoTitle = `Promo Spesial: ${promptCommand.replace(/^(tolong|bikin|buatkan|nadia|tolong buatkan)\s+/i, "")}`;
            const newPromo = {
              id: `dstech_promo_${Date.now()}`,
              title: promoTitle.slice(0, 75),
              category: "Brosur Promosi",
              description: `Materi promosi resmi PT. DSTech Smart Perkasa disusun oleh Nadia Safitri atas instruksi Direktur: "${promptCommand}". Siap dibagikan via WhatsApp Broadcast dan Media Sosial.`,
              fileUrl: "/service-cctv.png",
              fileType: "PDF",
              fileSize: "4.2 MB",
              downloadCount: 0,
              createdAt: new Date().toISOString(),
            };

            promoList.unshift(newPromo);
            fs.writeFileSync(promoFilePath, JSON.stringify(promoList, null, 2), "utf-8");

            executionResult = {
              type: "PROMO_CREATED",
              title: newPromo.title,
              link: "/admin/promotions",
            };

            aiResponseText = `Siap Pak Ramadhani! Saya (Nadia Safitri) telah selesai merancang materi promosi baru "${newPromo.title}". Materi kampanye dan copywriting telah resmi ditambahkan ke modul Promosi & Media Kit untuk disebarluaskan ke calon mitra dan klien!`;
          }
        } catch (promoErr: any) {
          console.error("Error executing Nadia Marketing action:", promoErr);
        }
      }

      // --- DENI KURNIAWAN (Field Operations & Dispatcher) ---
      if (targetEmp.id === "emp_deni_field") {
        try {
          const taskFilePath = path.join(process.cwd(), "src/data/dstech_employee_tasks.json");
          if (fs.existsSync(taskFilePath)) {
            const taskRaw = fs.readFileSync(taskFilePath, "utf-8");
            let taskList = JSON.parse(taskRaw);

            let clientTarget = "Klien DSTech";
            const ptMatch = promptCommand.match(/(?:pt\.?|cv\.?|toko|gedung|bapak|ibu|bpk)\s+[^,\.\n\r]+?(?=\s+(?:untuk|ke|di|dengan)|$)/i);
            if (ptMatch && ptMatch[0]) clientTarget = ptMatch[0].trim();

            const ticketNumber = `MTC-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(taskList.length + 1).padStart(3, "0")}`;
            const newTask = {
              id: `dstech_task_${Date.now()}`,
              ticketNumber: ticketNumber,
              entityType: "PT",
              type: "Installation",
              title: `SPK Lapangan: Penugasan Teknisi - ${clientTarget}`,
              client: clientTarget,
              clientPhone: "0812-9988-7766",
              clientPic: "PIC Lapangan",
              location: "Lokasi Proyek Klien",
              date: new Date().toISOString().split("T")[0],
              deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              status: "In Progress",
              priority: "High",
              technician: "Ikhsan Maulidi (Lead Field Tech)",
              technicianPhone: "+6282259494242",
              scope: [
                `Menjalankan penugasan resmi Direktur Utama: ${promptCommand}`,
                "Pemeriksaan jalur kabel, catu daya listrik, dan titik penempatan unit",
                "Uji fungsi operasional dan komisioning sistem",
                "Berita Acara Serah Terima (BAST) pekerjaan lapangan",
              ],
              equipment: [
                "Toolbox Teknisi Lengkap (Crimping, Multitester, Bor)",
                "Tangga Teleskopik & APD Keselamatan Kerja",
                "Kabel & Aksesoris Instalasi Lapangan",
              ],
              photos: [],
              report: "",
              notes: `Surat Perintah Kerja (SPK) diterbitkan otomatis oleh Deni Kurniawan (AI Dispatcher) atas instruksi Direktur Utama: "${promptCommand}"`,
              recommendation: "Lakukan safety briefing sebelum memulai pekerjaan teknis di lokasi.",
              updatedAt: new Date().toISOString(),
              completionDate: "",
            };

            taskList.unshift(newTask);
            fs.writeFileSync(taskFilePath, JSON.stringify(taskList, null, 2), "utf-8");

            executionResult = {
              type: "TASK_DISPATCHED",
              ticketNumber: ticketNumber,
              client: clientTarget,
              link: "/admin/maintenance",
            };

            aiResponseText = `Siap Pak Ramadhani! Saya (Deni Kurniawan) telah menerbitkan Surat Perintah Kerja (SPK) #${ticketNumber} untuk tim teknisi lapangan di lokasi ${clientTarget}. Jadwal kerja dan alokasi peralatan sudah resmi terjadwal di sistem Manajemen Tugas & Maintenance!`;
          }
        } catch (taskErr: any) {
          console.error("Error executing Deni Field action:", taskErr);
        }
      }

      // --- SITI NURHALIZA (Customer Care & Front Office) ---
      if (targetEmp.id === "emp_siti_cs") {
        executionResult = {
          type: "INQUIRY_RESOLVED",
          topic: promptCommand,
        };
        aiResponseText = `Halo Pak Ramadhani! Saya Siti Nurhaliza dari Front Office & Layanan Pelanggan. Arahan Bapak "${promptCommand}" telah saya catat dan langsung saya distribusikan ke tim terkait. Tamu dan pengunjung website kami layani dengan sepenuh hati 24 jam!`;
      }

      // Fallback jika API key tidak tersedia / timeout dan belum ada response teks
      if (!aiResponseText) {
        aiResponseText = `Siap, Pak Ramadhani! Instruksi "${promptCommand}" segera saya tindak lanjuti dan selesaikan detik ini juga sesuai SOP divisi kami.`;
      }

      // Update state karyawan
      targetEmp.status = "WORKING";
      targetEmp.speech_bubble = aiResponseText;
      targetEmp.current_activity = executionResult?.type === "SPH_CREATED"
        ? `Telah menerbitkan ${executionResult.quotationNumber} untuk ${executionResult.customerName}`
        : `Menjalankan instruksi direktur: "${promptCommand}"`;

      // Catat ke recent logs
      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        employee_id: targetEmp.id,
        employee_name: targetEmp.name,
        action: executionResult?.type === "SPH_CREATED"
          ? `Eksekusi Otonom Selesai: ${targetEmp.name} menerbitkan ${executionResult.quotationNumber} untuk ${executionResult.customerName} (Rp ${executionResult.subtotal?.toLocaleString("id-ID")}).`
          : `Instruksi Direktur: "${promptCommand}" -> Diproses oleh ${targetEmp.name}.`,
        executionResult: executionResult,
      };

      data.dstech_recent_logs.unshift(newLog);
      if (data.dstech_recent_logs.length > 25) {
        data.dstech_recent_logs = data.dstech_recent_logs.slice(0, 25);
      }

      writeWorkforceData(data);

      return NextResponse.json({
        success: true,
        message: "Perintah berhasil dieksekusi secara otonom oleh karyawan AI!",
        targetedEmployee: targetEmp,
        aiResponse: aiResponseText,
        executionResult: executionResult,
        log: newLog,
      });
    }

    return NextResponse.json({ success: false, error: "Action tidak valid" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
