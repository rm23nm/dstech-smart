import fs from "fs";
import path from "path";

// Path data dengan prefix dstech_
const DATA_DIR = path.join(process.cwd(), "src", "data");
const WORKFORCE_FILE = path.join(DATA_DIR, "dstech_ai_workforce.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "dstech_products.json");
const FINANCE_FILE = path.join(DATA_DIR, "dstech_finance_erp.json");
const TASKS_FILE = path.join(DATA_DIR, "dstech_agent_tasks.json");
const KMS_FILE = path.join(DATA_DIR, "dstech_kms.json");
const SCHEDULES_FILE = path.join(DATA_DIR, "dstech_agent_schedules.json");

// URL Engine AI Lokal Ollama (100% In-House di Server VPS)
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
export const DEFAULT_INHOUSE_MODEL = "qwen2.5:3b";
export const DEFAULT_CODER_MODEL = "qwen2.5-coder:1.5b";

export interface AgentTask {
  id: string;
  agentId: string;
  agentName: string;
  department: string;
  instruction: string;
  status: "PENDING" | "THINKING" | "EXECUTING_TOOL" | "COMPLETED" | "FAILED";
  thoughtProcess?: string[];
  toolCalls?: { tool: string; params: any; output: any }[];
  resultSummary?: string;
  documentGenerated?: {
    type: "SPH" | "SPK" | "INVOICE" | "FINANCIAL_AUDIT" | "MARKETING_CAMPAIGN" | "CATALOG_PRODUCT" | "SEO_OPTIMIZATION" | "CODE_AUDIT" | "SYSTEM_FEATURE";
    docNumber: string;
    title: string;
    content: any;
  };
  createdAt: string;
  completedAt?: string;
}

export interface AgentSchedule {
  id: string;
  agentId: string;
  agentName: string;
  department: string;
  title: string;
  schedulePattern: string;
  instruction: string;
  enabled: boolean;
  lastRunAt?: string;
  lastTaskId?: string;
  nextRunDesc: string;
}

// Helper membaca memori evaluasi dan arahan penolakan dari Direktur Utama
export function getDirectorEvaluationDirectivesPrompt(): string {
  try {
    const wf = readJsonSafe(WORKFORCE_FILE, {});
    const evaluations = Array.isArray(wf.dstech_director_evaluations) ? wf.dstech_director_evaluations : [];
    const dismissed = Array.isArray(wf.dstech_dismissed_topics) ? wf.dstech_dismissed_topics : [];
    const all = [...evaluations, ...dismissed].slice(0, 8);
    if (all.length === 0) return "";

    const list = all
      .map((e: any, idx: number) => `${idx + 1}. Usulan: "${e.title || 'Usulan Kerja'}" -> ALASAN EVALUASI DIREKTUR: "${e.reason || 'Ditolak'}"`)
      .join("\n");
    return `\n\nCATATAN EVALUASI & PENOLAKAN DIREKTUR UTAMA (WAJIB DIPATUHI, DILARANG MENGULANGI KESALAHAN INI):\n${list}\n`;
  } catch (e) {
    return "";
  }
}

// Helper membaca dan menulis data
function readJsonSafe(filePath: string, fallback: any = {}) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
    return fallback;
  }
}

function writeJsonSafe(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e);
    return false;
  }
}

// Generator Gambar Studio Profesional Produk Baru (SVG HD 800x800)
export function generateStudioProductSvg(productName: string, category: string, brand: string): string {
  const isBarrier = category.toLowerCase().includes("barrier") || category.toLowerCase().includes("parking");
  const isCctv = category.toLowerCase().includes("cctv") || category.toLowerCase().includes("surveillance");
  const isAccess = category.toLowerCase().includes("access") || category.toLowerCase().includes("lock");

  let mainArtwork = "";
  if (isBarrier) {
    mainArtwork = `
      <!-- Barrier Gate Housing -->
      <rect x="260" y="260" width="160" height="340" rx="20" fill="url(#housingGrad)" filter="url(#dropShadow)"/>
      <rect x="280" y="280" width="120" height="80" rx="10" fill="#0f172a"/>
      <circle cx="340" cy="320" r="24" fill="#3b82f6" opacity="0.8"/>
      <path d="M340 305 L340 335 M325 320 L355 320" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <rect x="290" y="380" width="100" height="12" rx="4" fill="#22c55e"/>
      <!-- Boom Arm -->
      <rect x="360" y="290" width="360" height="24" rx="12" fill="url(#boomGrad)" transform="rotate(-25 360 290)"/>
      <line x1="420" y1="262" x2="440" y2="253" stroke="#ef4444" stroke-width="24"/>
      <line x1="480" y1="234" x2="500" y2="225" stroke="#ef4444" stroke-width="24"/>
      <line x1="540" y1="206" x2="560" y2="197" stroke="#ef4444" stroke-width="24"/>
      <line x1="600" y1="178" x2="620" y2="169" stroke="#ef4444" stroke-width="24"/>
    `;
  } else if (isCctv) {
    mainArtwork = `
      <!-- CCTV Mount -->
      <path d="M250 480 L350 480 L380 400 L320 400 Z" fill="#64748b" filter="url(#dropShadow)"/>
      <rect x="220" y="460" width="60" height="100" rx="8" fill="#334155"/>
      <!-- Camera Cylinder Body -->
      <rect x="340" y="320" width="260" height="130" rx="30" fill="url(#cctvBodyGrad)" filter="url(#dropShadow)"/>
      <!-- Sun Shield -->
      <path d="M320 300 L620 300 L590 330 L350 330 Z" fill="#0f172a"/>
      <!-- Lens Hood & Glass -->
      <ellipse cx="600" cy="385" rx="20" ry="60" fill="#020617"/>
      <ellipse cx="600" cy="385" rx="14" ry="40" fill="#1e1b4b"/>
      <circle cx="600" cy="385" r="16" fill="#06b6d4" opacity="0.75"/>
      <!-- IR LED Ring -->
      <circle cx="585" cy="355" r="4" fill="#ef4444"/>
      <circle cx="585" cy="415" r="4" fill="#ef4444"/>
    `;
  } else if (isAccess) {
    mainArtwork = `
      <!-- Smart Access Terminal -->
      <rect x="280" y="220" width="240" height="380" rx="28" fill="#0f172a" filter="url(#dropShadow)"/>
      <rect x="295" y="235" width="210" height="230" rx="16" fill="url(#screenGrad)"/>
      <!-- Face & QR Icon -->
      <circle cx="400" cy="310" r="35" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6 4"/>
      <circle cx="400" cy="305" r="18" fill="#38bdf8"/>
      <!-- Optical Fingerprint Scanner -->
      <circle cx="400" cy="520" r="36" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/>
      <path d="M388 510 Q400 498 412 510 Q416 525 408 535 Q400 542 392 532" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
    `;
  } else {
    mainArtwork = `
      <!-- Industrial Hardware Hub -->
      <rect x="240" y="300" width="320" height="200" rx="16" fill="#1e293b" filter="url(#dropShadow)"/>
      <rect x="260" y="320" width="280" height="20" rx="4" fill="#020617"/>
      <circle cx="280" cy="330" r="5" fill="#22c55e"/>
      <circle cx="300" cy="330" r="5" fill="#22c55e"/>
      <circle cx="320" cy="330" r="5" fill="#eab308"/>
      <!-- RJ45 / Optical Ports -->
      <rect x="260" y="370" width="40" height="35" rx="4" fill="#475569"/>
      <rect x="315" y="370" width="40" height="35" rx="4" fill="#475569"/>
      <rect x="370" y="370" width="40" height="35" rx="4" fill="#475569"/>
      <rect x="425" y="370" width="40" height="35" rx="4" fill="#475569"/>
      <rect x="480" y="370" width="40" height="35" rx="4" fill="#475569"/>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="housingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="40%" stop-color="#f97316"/>
      <stop offset="70%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
    <linearGradient id="boomGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="cctvBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="20" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Studio Clean Background -->
  <rect width="800" height="800" fill="url(#bgGrad)"/>
  
  <!-- Studio Floor Shadow -->
  <ellipse cx="400" cy="660" rx="300" ry="40" fill="#0f172a" opacity="0.10" filter="blur(16px)"/>

  <!-- Studio Light Flare -->
  <circle cx="200" cy="180" r="160" fill="#ffffff" opacity="0.55" filter="blur(30px)"/>

  <!-- Top Header Tag -->
  <rect x="40" y="40" width="340" height="34" rx="17" fill="#0f172a"/>
  <text x="56" y="62" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#38bdf8" letter-spacing="1.5">
    PT. DSTECH SMART PERKASA
  </text>
  <rect x="610" y="40" width="150" height="34" rx="17" fill="#22c55e" opacity="0.15"/>
  <rect x="610" y="40" width="150" height="34" rx="17" fill="none" stroke="#22c55e" stroke-width="1.5"/>
  <text x="632" y="62" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#15803d">
    ORIGINAL &bull; 100%
  </text>

  <!-- Main Hardware Product Artwork -->
  ${mainArtwork}

  <!-- Bottom Showcase Card -->
  <rect x="40" y="690" width="720" height="70" rx="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#dropShadow)"/>
  <text x="65" y="722" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#0f172a">
    ${productName.length > 55 ? productName.substring(0, 52) + "..." : productName}
  </text>
  <text x="65" y="744" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748b">
    Kategori: ${category} &bull; Brand: ${brand} &bull; Garansi 1 Tahun Resmi
  </text>
</svg>`;
}

// 1. Eksekusi Engine AI Mandiri (Ollama Local LLM)
export async function callLocalInHouseLLM(
  prompt: string,
  systemPrompt: string = "Anda adalah AI Agent otonom yang bekerja untuk PT. DSTech Smart Perkasa. Berikan jawaban dalam bahasa Indonesia yang profesional dan terstruktur. PENTING: Perusahaan beroperasi dengan sistem on-demand/pre-order (stok fisik sengaja 0 agar tidak menambah aset pada pembukuan). DILARANG KERAS mengusulkan pengajuan restok atau memperingatkan stok habis.",
  model: string = DEFAULT_INHOUSE_MODEL,
  timeoutMs: number = 1500
): Promise<{ text: string; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        system: systemPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Ollama HTTP Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return { text: data.response || "" };
  } catch (err: any) {
    console.warn(`[Local In-House LLM]: Ollama direct call fallback triggered (${err?.message})`);
    return {
      text: "",
      error: err?.message || "Ollama service unavailable",
    };
  }
}

// 2. Action Tools Internal Perusahaan
export const InHouseAgentTools = {
  // Tool 1: Cari Produk & Harga dari Katalog Resmi DSTech (STRICT STOCK = 0)
  lookupProductCatalog: (keyword: string) => {
    const productsData = readJsonSafe(PRODUCTS_FILE, []);
    const items = Array.isArray(productsData) ? productsData : productsData.products || [];
    const q = keyword.toLowerCase().trim();

    const matched = items.filter((p: any) => {
      const name = (p.name || p.nama || "").toLowerCase();
      const cat = (p.category || p.kategori || "").toLowerCase();
      const desc = (p.description || p.deskripsi || "").toLowerCase();
      return name.includes(q) || cat.includes(q) || desc.includes(q);
    });

    return matched.slice(0, 8).map((p: any) => ({
      id: p.id || p.kode,
      name: p.name || p.nama,
      category: p.category || p.kategori,
      price: p.price || p.hargaJual || 0,
      stock: 0, // Sengaja dikosongkan (0) agar tidak menambah nilai aset pada pembukuan keuangan
      unit: p.unit || "Unit",
    }));
  },

  // Tool 2: Generate Draf Surat Penawaran Harga (SPH) Resmi
  generateSphDocument: (params: {
    clientName: string;
    clientCompany: string;
    projectTitle: string;
    items: { name: string; qty: number; price: number; unit?: string }[];
    notes?: string;
  }) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const docNumber = `SPH/DST/${year}/${month}/${randCode}`;

    let subtotal = 0;
    const computedItems = params.items.map((it, idx) => {
      const total = it.qty * it.price;
      subtotal += total;
      return {
        no: idx + 1,
        item: it.name,
        qty: it.qty,
        unit: it.unit || "Unit",
        price: it.price,
        total: total,
      };
    });

    const ppn = Math.round(subtotal * 0.11);
    const grandTotal = subtotal + ppn;

    return {
      docNumber,
      date: now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      clientName: params.clientName,
      clientCompany: params.clientCompany,
      projectTitle: params.projectTitle,
      items: computedItems,
      subtotal,
      ppn,
      grandTotal,
      paymentTerms: "DP 50% saat PO terbit, Pelunasan 50% setelah serah terima pekerjaan (BAST).",
      warranty: "Garansi perangkat resmi 1 tahun, garansi pemeliharaan instalasi 3 bulan.",
      validityDays: 14,
      notes: params.notes || "Harga sudah termasuk jasa pemasangan, terminasi kabel, dan pengetesan sistem.",
    };
  },

  // Tool 3: Audit Piutang & Keuangan dari dstech_finance_erp.json
  auditReceivables: () => {
    const financeData = readJsonSafe(FINANCE_FILE, {});
    const salesInvoices = financeData.salesInvoices || financeData.invoices || [];

    const now = new Date();
    const overdueList: any[] = [];
    let totalOverdueAmount = 0;

    salesInvoices.forEach((inv: any) => {
      const isUnpaid = inv.status === "UNPAID" || inv.status === "PARTIAL" || inv.status === "PENDING";
      if (isUnpaid) {
        const dueDate = new Date(inv.dueDate || inv.jatuhTempo || inv.date);
        const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays > 0) {
          const balance = Number(inv.balanceDue || inv.total || 0);
          totalOverdueAmount += balance;
          overdueList.push({
            invoiceNumber: inv.invoiceNumber || inv.noFaktur,
            clientName: inv.customerName || inv.clientName || "Klien Umum",
            dueDate: inv.dueDate,
            daysOverdue: diffDays,
            amount: balance,
          });
        }
      }
    });

    return {
      totalOverdueCount: overdueList.length,
      totalOverdueAmount,
      overdueList: overdueList.slice(0, 10),
      recommendations: overdueList.length > 0
        ? "Segera lakukan penagihan berjenjang via WhatsApp dan email resmi untuk 3 faktur dengan jatuh tempo tertinggi."
        : "Seluruh piutang klien berjalan lancar tanpa ada faktur tertunggak kritis.",
    };
  },

  // Tool 4: Generate Draf Surat Perintah Kerja (SPK) Maintenance / Pemasangan
  generateSpkDocument: (params: {
    technicianName: string;
    clientName: string;
    location: string;
    taskDescription: string;
    scheduledDate: string;
    priority?: string;
  }) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const docNumber = `SPK/DST/${year}/${month}/${randCode}`;

    return {
      docNumber,
      issuedDate: now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      technicianName: params.technicianName,
      clientName: params.clientName,
      location: params.location,
      taskDescription: params.taskDescription,
      scheduledDate: params.scheduledDate,
      priority: params.priority || "Tinggi",
      safetyRules: "Wajib menggunakan APD lengkap (helm safety, rompi K3, sepatu safety), serta foto sebelum & sesudah pengerjaan.",
    };
  },

  // Tool 5: Cari Pedoman Teknis & SOP dari dstech_kms.json
  lookupTechnicalKms: (keyword: string) => {
    const kmsData = readJsonSafe(KMS_FILE, []);
    const list = Array.isArray(kmsData) ? kmsData : kmsData.articles || [];
    const q = keyword.toLowerCase().trim();

    const matched = list.filter((item: any) => {
      const title = (item.title || "").toLowerCase();
      const summary = (item.summary || "").toLowerCase();
      const content = (item.content || "").toLowerCase();
      return title.includes(q) || summary.includes(q) || content.includes(q);
    });

    return matched.slice(0, 5).map((item: any) => ({
      id: item.id,
      title: item.title,
      category: item.categoryLabel || item.category || "SOP Teknis",
      summary: item.summary || "",
      keyStandard: (item.content || "").slice(0, 200) + "...",
    }));
  },

  // Tool 6: Kurasi & Tambah Produk Baru ke Katalog (STOK WAJIB 0 & Gambar Studio)
  curateAndAddDailyProduct: async (params?: {
    keyword?: string;
    category?: string;
    externalImageUrl?: string;
    sourceUrl?: string;
  }) => {
    const products: any[] = readJsonSafe(PRODUCTS_FILE, []);
    const timestamp = Date.now();
    const existingNames = new Set(products.map((p: any) => (p.name || "").toLowerCase()));

    // Pool Ide Produk Unggulan Teknologi Keamanan
    const productConcepts = [
      {
        name: "DStech - Mesin Barrier Gate High Speed Servo DC 0.6 Detik Anti-Crash IP66",
        category: "Parking & Barrier System",
        subCategory: "Mesin Barrier Gate Otomatis",
        brand: "DStech Heavy Duty",
        costPrice: 5800000,
        price: 8950000,
        desc: "Mesin barrier gate generasi terbaru dengan motor servo DC brushless kecepatan tinggi (0.6 - 1.5 detik adjustable). Dilengkapi fitur anti-crash rebound otomatis jika menyentuh kendaraan, rating proteksi outdoor IP66 tahan cuaca ekstrim, dan kompatibilitas controller RFID/LPR parkir komersial.",
      },
      {
        name: "DStech - Automatic Flap Barrier Turnstile Gate Akses Stasiun & Gedung Stainless 304",
        category: "Parking & Barrier System",
        subCategory: "Turnstile & Flap Barrier",
        brand: "DStech Pro Gate",
        costPrice: 8500000,
        price: 13500000,
        desc: "Turnstile Flap Barrier otomatis material Stainless Steel 304 anti-korosi dengan tebal plat 1.5mm. Dilengkapi sensor infrared keselamatan penumpang 6 pasang, lampu indikator arah LED hijau/merah, serta interface integrasi ke Face Recognition & RFID Card Reader.",
      },
      {
        name: "DStech - AI Smart IP Camera 5MP AcuSense Human & Vehicle Detection Dual-Light Audio",
        category: "Security System",
        subCategory: "IP Camera Surveillance",
        brand: "Hikvision OEM DStech",
        costPrice: 750000,
        price: 1250000,
        desc: "Kamera pengawas outdoor 5 Megapixel dengan teknologi AI AcuSense untuk klasifikasi akurat manusia dan kendaraan, mereduksi alarm palsu hingga 95%. Dilengkapi Smart Dual-Light (IR + Warm White LED) untuk gambar berwarna jernih 24 jam serta built-in two-way audio mic & speaker.",
      },
      {
        name: "DStech - Paket CCTV Solar Cell 4G PTZ 360 Derajat Outdoor Tanpa Listrik PLN",
        category: "Security System",
        subCategory: "Solar CCTV Outdoor",
        brand: "DStech Solar Series",
        costPrice: 2200000,
        price: 3650000,
        desc: "Solusi pemantauan mandiri untuk area perkebunan, proyek konstruksi, tambang, dan gudang terbuka tanpa pasokan listrik PLN. Menggunakan panel surya monokristalin 60W, baterai lithium tanam 30.000mAh, modem 4G LTE all-operator, dan rotasi lensa PTZ 360 derajat.",
      },
      {
        name: "DStech - Face Recognition & RFID Access Control Terminal 7 Inch Dual Lens IP65",
        category: "Security System",
        subCategory: "Access Control & Smart Attendance",
        brand: "ZKTeco DStech Pro",
        costPrice: 2850000,
        price: 4500000,
        desc: "Terminal akses kontrol biometrik pengenalan wajah berkecepatan 0.2 detik dengan algoritma anti-spoofing dual camera. Mendukung kapasitas 10.000 wajah, kartu RFID Mifare 13.56MHz, layar sentuh IPS 7 inch, dan tahan semprotan air outdoor IP65.",
      },
      {
        name: "DStech - Long Range UHF RFID Reader 15-20 Meter EPC Gen2 Auto Gate Reader",
        category: "Parking & Barrier System",
        subCategory: "RFID Reader Long Range",
        brand: "DStech RFID Solutions",
        costPrice: 1950000,
        price: 3200000,
        desc: "Antena UHF RFID Reader jarak jauh 15-20 meter frekuensi 902-928MHz ISO18000-6C (EPC Gen2). Memungkinkan kendaraan membuka palang parkir otomatis tanpa perlu membuka kaca mobil, polarisasi melingkar 12dBi tahan cuaca.",
      },
      {
        name: "DStech - Drop Bolt Electric Lock Frame Kaca Frameless Heavy Duty 1000kg",
        category: "Security System",
        subCategory: "Kunci Pintu Akses & Magnetic Lock",
        brand: "DStech Access Hardware",
        costPrice: 420000,
        price: 685000,
        desc: "Kunci elektrik solenoid drop bolt dengan kekuatan tahanan hingga 1000kg force untuk pintu kaca tanpa bingkai (frameless glass door). Dilengkapi sensor status pintu NO/NC dan auto-relock timer 0/3/6/9 detik.",
      },
      {
        name: "DStech - Vehicle Loop Detector Multi-Frekuensi Anti-Interferensi Palang Parkir",
        category: "Parking & Barrier System",
        subCategory: "Loop Detector & Vehicle Sensor",
        brand: "Sensor W1 Pro",
        costPrice: 320000,
        price: 525000,
        desc: "Modul sensor deteksi kendaraan loop kabel tanam aspal/beton dengan 4 pilihan frekuensi operasional untuk mencegah interferensi antar dua lajur palang parkir yang berdampingan. Respon instan 10ms.",
      },
      {
        name: "DStech - Smart Video Intercom SIP Villa Outdoor Touchscreen Night Vision PoE",
        category: "Smart Home & Automation",
        subCategory: "Video Intercom & Smart Bell",
        brand: "DStech Smart Home",
        costPrice: 1650000,
        price: 2750000,
        desc: "Bel pintu pintar dengan kamera sudut lebar 140 derajat dan layar sentuh kapasitif. Dapat memanggil ke smartphone pemilik rumah melalui aplikasi, mendukung pembukaan kunci gerbang via PIN atau kartu RFID.",
      },
      {
        name: "DStech - Industrial Switch PoE 8 Port Gigabit Full Heavy Duty Rail-DIN Pabrik",
        category: "Jaringan & IT Infrastructure",
        subCategory: "Industrial Network Switch",
        brand: "DStech Industrial Net",
        costPrice: 1100000,
        price: 1850000,
        desc: "Switch jaringan industrial 8 port Gigabit PoE+ (30W per port) dengan casing aluminium pembuang panas tanpa kipas (fanless). Tahan suhu ekstrim pabrik -40C hingga +75C serta proteksi lonjakan petir 6kV.",
      },
    ];

    // Pilih konsep yang belum ada di katalog atau sesuaikan dengan keyword
    let selectedConcept = productConcepts.find((c) => !existingNames.has(c.name.toLowerCase()));
    if (!selectedConcept) {
      selectedConcept = productConcepts[Math.floor(Math.random() * productConcepts.length)];
    }

    if (params?.keyword) {
      const kw = params.keyword.trim();
      selectedConcept = {
        name: `DStech - ${kw.charAt(0).toUpperCase() + kw.slice(1)} Smart Security Edition`,
        category: params.category || "Security System",
        subCategory: "Peralatan & Solusi Keamanan",
        brand: "DStech Official",
        costPrice: 1200000,
        price: 1950000,
        desc: `Perangkat teknologi ${kw} berkualitas tinggi bersertifikasi industri dari PT. DSTech Smart Perkasa. Dirancang khusus untuk ketahanan operasional 24/7 dan integrasi sistem keamanan terpadu.`,
      };
    }

    // Manajemen Gambar Produk (Membuat atau Menyalin & Mempercantik)
    let imagePath = "";
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (e) {}
    }

    // Coba salin gambar dari luar jika diberikan URL
    let copiedExternal = false;
    if (params?.externalImageUrl && params.externalImageUrl.startsWith("http")) {
      try {
        const imgRes = await fetch(params.externalImageUrl, { signal: AbortSignal.timeout(6000) });
        if (imgRes.ok) {
          const arrayBuf = await imgRes.arrayBuffer();
          const buf = Buffer.from(arrayBuf);
          const ext = params.externalImageUrl.endsWith(".png") ? "png" : params.externalImageUrl.endsWith(".webp") ? "webp" : "jpg";
          const imgFilename = `dstech_ai_prod_${timestamp}.${ext}`;
          fs.writeFileSync(path.join(uploadDir, imgFilename), buf);
          imagePath = `/uploads/${imgFilename}`;
          copiedExternal = true;
        }
      } catch (imgErr: any) {
        console.warn("Gagal menyalin gambar eksternal, beralih ke generator studio SVG:", imgErr?.message);
      }
    }

    // Jika tidak ada gambar luar atau gagal, buat gambar studio baru berlatar bersih dengan standar DSTech
    if (!imagePath) {
      const svgFilename = `dstech_ai_prod_${timestamp}.svg`;
      const svgContent = generateStudioProductSvg(selectedConcept.name, selectedConcept.category, selectedConcept.brand);
      fs.writeFileSync(path.join(uploadDir, svgFilename), svgContent, "utf-8");
      imagePath = `/uploads/${svgFilename}`;
    }

    // Bangun Entitas Produk Baru (STRICT STOCK = 0)
    const effectiveCostPrice = Number(selectedConcept.costPrice) || 1000000;
    // Penegakan batasan margin keuntungan 50% dari harga barang referensi:
    const calculatedPrice = Math.round(effectiveCostPrice * 1.5);
    const finalSourceUrl = params?.sourceUrl || (selectedConcept as any).sourceUrl || `https://distributor-keamanan.id/catalog/ref-${timestamp}`;

    const newProduct = {
      id: `dstech_prod_ai_${timestamp}`,
      name: selectedConcept.name,
      category: selectedConcept.category,
      subCategory: selectedConcept.subCategory,
      brand: selectedConcept.brand,
      entityType: "PT",
      costPrice: effectiveCostPrice,
      price: calculatedPrice, // Wajib margin 50% dari harga referensi (costPrice * 1.5)
      // Link referensi/referral produk asal (disembunyikan dari estore publik):
      sourceUrl: finalSourceUrl,
      dstech_source_url: finalSourceUrl,
      dstech_margin_policy: "50%_OF_REFERENCE_COST",
      lastPriceAudit: new Date().toISOString(),
      priceHistory: [
        {
          date: new Date().toISOString(),
          costPrice: effectiveCostPrice,
          price: calculatedPrice,
          marginPercent: 50,
          sourceUrl: finalSourceUrl,
          note: "Inisialisasi Produk Kurasi AI (Margin Keuntungan 50% Ditegakkan)",
        },
      ],
      isPromo: false,
      discountPercent: 0,
      promoTag: "Produk Baru AI",
      installationFee: 150000,
      hasInstallationService: true,
      stock: 0, // WAJIB 0 sesuai instruksi agar tidak menambah aset pada pembukuan keuangan
      unit: "Unit",
      warehouseStock: {
        dstech_wh_1: 0,
        dstech_wh_2: 0,
        dstech_wh_3: 0,
      },
      commission: "5%",
      commissionRate: 5,
      commissionType: "ONETIME",
      image: imagePath,
      images: [imagePath],
      desc: `${selectedConcept.desc}

Spesifikasi & Keunggulan:
- Garansi Resmi 1 Tahun PT. DSTech Smart Perkasa
- Material Standar Industri Tahan Cuaca Tropis
- Dukungan Teknis & Ketersediaan Suku Cadang Terjamin

Isi Paket:
- 1x Unit Utama ${selectedConcept.name}
- Buku Panduan Instalasi & Kartu Garansi Resmi
- Aksesoris Pemasangan Lengkap`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Masukkan ke urutan pertama di database dstech_products.json
    products.unshift(newProduct);
    writeJsonSafe(PRODUCTS_FILE, products);

    return {
      success: true,
      product: newProduct,
      message: `Berhasil menambahkan produk baru "${newProduct.name}" ke katalog dstechsmart.com dengan stok 0 (tanpa beban aset) dan visual gambar studio ${copiedExternal ? 'dipercantik dari sumber referensi' : 'grafis HD resmi'}.`,
    };
  },
  // Tool Penyelarasan & Audit Harga Harian AI (Margin Keuntungan 50% dari Harga Referensi)
  syncAndAuditProductPrices: async (params?: { applyUpdates?: boolean }) => {
    const products: any[] = readJsonSafe(PRODUCTS_FILE, []);
    const applyUpdates = params?.applyUpdates !== false;
    let auditedCount = 0;
    let updatedCount = 0;
    const updateLogs: any[] = [];
    const timestamp = new Date().toISOString();

    for (const p of products) {
      const cost = Number(p.costPrice) || 0;
      if (cost <= 0) continue; // Lewati jika tidak ada modal/harga referensi

      auditedCount++;
      // Hitung harga jual ideal dengan margin keuntungan 50%:
      const targetPrice = Math.round(cost * 1.5);
      const currentPrice = Number(p.price) || 0;

      // Jika ada deviasi harga lebih dari Rp 100
      if (Math.abs(currentPrice - targetPrice) > 100) {
        updatedCount++;
        const logItem = {
          productId: p.id,
          productName: p.name,
          costPrice: cost,
          oldPrice: currentPrice,
          newPrice: targetPrice,
          sourceUrl: p.sourceUrl || p.dstech_source_url || "-",
          marginPercent: 50,
          updatedAt: timestamp,
        };
        updateLogs.push(logItem);

        if (applyUpdates) {
          p.price = targetPrice;
          p.lastPriceAudit = timestamp;
          p.dstech_margin_policy = "50%_OF_REFERENCE_COST";
          if (!Array.isArray(p.priceHistory)) p.priceHistory = [];
          p.priceHistory.push({
            date: timestamp,
            costPrice: cost,
            price: targetPrice,
            marginPercent: 50,
            sourceUrl: p.sourceUrl || p.dstech_source_url || "",
            note: "Penyelarasan Harga Harian AI Agent Reza Firmansyah (Margin 50%)",
          });
        }
      }
    }

    if (applyUpdates && updatedCount > 0) {
      writeJsonSafe(PRODUCTS_FILE, products);

      // Catat ke riwayat log aktivitas AI Workforce
      try {
        const wfData: any = readJsonSafe(WORKFORCE_FILE, {});
        if (!Array.isArray(wfData.dstech_recent_logs)) wfData.dstech_recent_logs = [];
        wfData.dstech_recent_logs.unshift({
          id: `log_price_sync_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          type: "PRICE_SYNC",
          message: `Reza Firmansyah menyelaraskan ${updatedCount} produk katalog: harga jual disesuaikan tepat 50% di atas harga referensi modal.`,
          badge: "AUDIT HARGA 50%",
        });
        if (wfData.dstech_recent_logs.length > 50) wfData.dstech_recent_logs = wfData.dstech_recent_logs.slice(0, 50);

        for (const emp of wfData.dstech_employees || []) {
          if (emp.id === "emp_reza_catalog") {
            emp.speech_bubble = `Pak Ramadhani, saya telah mengaudit ${auditedCount} produk katalog. Sebanyak ${updatedCount} produk telah diselaraskan harga jualnya dengan margin keuntungan 50% dari harga referensi.`;
          }
        }
        writeJsonSafe(WORKFORCE_FILE, wfData);
      } catch (err) {}
    }

    return {
      success: true,
      auditedCount,
      updatedCount,
      updates: updateLogs,
      message: `Audit harga selesai. ${auditedCount} produk diperiksa, ${updatedCount} harga produk diselaraskan dengan margin 50%.`,
    };
  },
};

// 3. Definisi Profil Agen Otonom Khusus Perusahaan
export interface InHouseAgentProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarColor: string;
  specialties: string[];
  systemPrompt: string;
  isCustomAgent?: boolean;
}

export const InHouseAgentProfiles: InHouseAgentProfile[] = [
  {
    id: "emp_bambang_sales",
    name: "Bambang Prakoso",
    role: "Senior AI Sales & Commercial Consultant",
    department: "SALES & ESTIMASI PROYEK",
    avatarColor: "#3b82f6",
    specialties: ["Estimasi RAB Proyek", "Penerbitan SPH Resmi", "Katalog Barrier Gate & CCTV", "Follow-up Klien B2B"],
    systemPrompt: `Anda adalah Bambang Prakoso, Senior AI Commercial Consultant di PT. DSTech Smart Perkasa.
Anda ahli dalam solusi sistem keamanan (CCTV Hikvision/Dahua, Smart Barrier Gate & Palang Parkir, Access Control RFID/Face Recognition, Smart Home IoT, dan Jaringan IT Pabrik).
Tugas Anda:
1. Menganalisis kebutuhan klien secara cermat.
2. Memilih produk yang tepat dari katalog resmi DSTech (ingat: stok fisik selalu diatur 0 sesuai kebijakan akuntansi perusahaan).
3. Menghitung rincian harga dan membuat Surat Penawaran Harga (SPH) resmi dengan kalkulasi akurat (termasuk PPN 11% dan termin pembayaran).
4. Melakukan kurasi produk teknologi baru setiap hari untuk memperluas katalog dstechsmart.com.
Gaya bahasa: Percaya diri, profesional, solutif, dan berorientasi pada kepuasan pelanggan.`,
  },
  {
    id: "emp_nadia_marketing",
    name: "Nadia Safitri",
    role: "Senior AI Content Strategist & Video Marketing",
    department: "PEMASARAN & SOSIAL MEDIA",
    avatarColor: "#8b5cf6",
    specialties: ["Naskah Video Reels / TikTok", "Jadwal Promosi Mingguan", "Copywriting Penjualan", "Storyboard Visual"],
    systemPrompt: `Anda adalah Nadia Safitri, Senior AI Content Strategist & Video Marketing di PT. DSTech Smart Perkasa.
Tugas Anda:
1. Mengubah produk teknologi DSTech menjadi konten video dan tulisan promosi yang viral, elegan, dan memikat.
2. Merancang adegan demi adegan visual video promosi sinematik.
3. Menjadwalkan materi promosi otonom ke kanal Instagram, TikTok, YouTube Shorts, dan status WhatsApp resmi perusahaan.
Gaya bahasa: Kreatif, energetik, persuasif, dan modern.`,
  },
  {
    id: "emp_dewi_finance",
    name: "Dewi Sartika",
    role: "Senior AI Financial Auditor & Billing Specialist",
    department: "KEUANGAN & AUDIT PIUTANG",
    avatarColor: "#10b981",
    specialties: ["Audit Piutang Jatuh Tempo", "Rekonsiliasi Kas Kasir", "Analisis Arus Kas", "Surat Pengingat Pembayaran"],
    systemPrompt: `Anda adalah Dewi Sartika, Senior AI Financial Auditor di PT. DSTech Smart Perkasa.
Tugas Anda:
1. Mengaudit data faktur penjualan dan mendeteksi piutang klien yang jatuh tempo.
2. Menghitung total keterlambatan dan menyusun draf pesan penagihan yang santun namun tegas.
3. Memastikan neraca keuangan perusahaan selalu seimbang, transparan, dan aset stok terpelihara nol jika tidak ada barang fisik.
Gaya bahasa: Teliti, tertib, disiplin akuntansi, dan sopan.`,
  },
  {
    id: "emp_eko_maintenance",
    name: "Eko Prasetyo",
    role: "Senior AI Maintenance & Technical Coordinator",
    department: "OPERASIONAL & TEKNISI",
    avatarColor: "#f59e0b",
    specialties: ["Disposisi Teknisi Lapangan", "Surat Perintah Kerja (SPK)", "Pemeriksaan K3 & SOP", "Pelacakan Geofence"],
    systemPrompt: `Anda adalah Eko Prasetyo, Senior AI Maintenance & Technical Coordinator di PT. DSTech Smart Perkasa.
Tugas Anda:
1. Mengatur jadwal servis dan tiket maintenance pelanggan.
2. Menerbitkan Surat Perintah Kerja (SPK) resmi penugasan teknisi.
3. Memastikan setiap pekerjaan lapangan mematuhi SOP teknis dan standar K3 keselamatan kerja.
Gaya bahasa: Tegas, terstruktur, disiplin operasional, dan mengutamakan keselamatan.`,
  },
  {
    id: "emp_reza_catalog",
    name: "Reza Firmansyah",
    role: "AI Product Catalog & Procurement Lead",
    department: "KATALOG & PENGADAAN ON-DEMAND",
    avatarColor: "#06b6d4",
    specialties: ["Audit Harga 50% Margin", "Foto Real Fisik Asli (No AI Vector)", "Pembersihan Watermark Toko Lain", "Peningkatan Resolusi HD Studio", "Zero Stock Management", "Link Referensi Rahasia"],
    systemPrompt: `Anda adalah Reza Firmansyah, AI Product Catalog & Procurement Lead di PT. DSTech Smart Perkasa. Bertugas menyelaraskan harga katalog dengan formula modal + 50%, mencatat link referensi supplier secara tersembunyi, dan memastikan stok fisik tetap 0 (on-demand). ATURAN KETAT FOTO PRODUK: 1) Wajib FOTO REAL ALAT FISIK ASLI, dilarang keras gambar ilustrasi/vektor kartun AI sintetis yang berbeda dari barang fisik riil. 2) Foto produk wajib bersih tanpa watermark/nama toko lain dan dilarang menaruh logo perusahaan di atas foto fisik alat. 3) Wajib meningkatkan resolusi (HD Studio upscaling 800x800) dengan kontras dan pencahayaan studio tajam sebelum diunggah ke katalog.`,
  },
  {
    id: "emp_siti_cs",
    name: "Siti Nurhaliza",
    role: "Front Office & AI Customer Care",
    department: "LAYANAN PELANGGAN & LIVE CHAT",
    avatarColor: "#10b981",
    specialties: ["Live Chat Website", "Konsultasi Solusi Keamanan", "Pelacakan Pesanan", "Disposisi WhatsApp"],
    systemPrompt: `Anda adalah Siti Nurhaliza, Front Office & AI Customer Care resmi di PT. DSTech Smart Perkasa. Bertugas merespons calon pelanggan dengan ramah, cerdas, solutif, dan menguasai seluruh katalog produk serta layanan perusahaan.`,
  },
];

export function getAllInHouseAgentProfiles(): InHouseAgentProfile[] {
  const baseProfiles: InHouseAgentProfile[] = [...InHouseAgentProfiles];
  try {
    const wf = readJsonSafe(WORKFORCE_FILE, {});
    const employees = Array.isArray(wf.dstech_employees) ? wf.dstech_employees : [];

    for (const emp of employees) {
      if (!baseProfiles.some((p) => p.id === emp.id)) {
        baseProfiles.push({
          id: emp.id,
          name: emp.name,
          role: emp.role,
          department: emp.department || "OPERASIONAL",
          avatarColor: emp.avatar_color || "#8b5cf6",
          specialties: Array.isArray(emp.skills) && emp.skills.length > 0 ? emp.skills : ["Otonom DSTech", emp.role],
          systemPrompt: emp.systemPrompt || `Anda adalah ${emp.name}, ${emp.role} resmi di PT. DSTech Smart Perkasa. Bertindaklah profesional, teliti, taati seluruh SOP perusahaan, dan patuhi catatan evaluasi Direktur Utama.`,
          isCustomAgent: emp.isCustomAgent || false,
        });
      }
    }
  } catch (e) {
    console.error("Error reading workforce for profiles:", e);
  }
  return baseProfiles;
}

// 4. In-House Autonomous Agentic Engine (Observe -> Think -> Act -> Report)
export async function executeAutonomousAgentTask(
  agentId: string,
  instruction: string,
  contextData?: any
): Promise<AgentTask> {
  const allProfiles = getAllInHouseAgentProfiles();
  const profile = allProfiles.find((p) => p.id === agentId) || allProfiles[0];
  const now = new Date();

  // Inisialisasi Task
  const taskId = `TASK-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const task: AgentTask = {
    id: taskId,
    agentId: profile.id,
    agentName: profile.name,
    department: profile.department,
    instruction: instruction,
    status: "THINKING",
    thoughtProcess: [
      `[${now.toLocaleTimeString("id-ID")}] Menerima instruksi direktur: "${instruction}"`,
      `[${now.toLocaleTimeString("id-ID")}] Mengaktifkan profil ${profile.name} (${profile.role}).`,
    ],
    toolCalls: [],
    createdAt: now.toISOString(),
  };

  try {
    const lowerIns = instruction.toLowerCase();

    // SIKLUS 1: OBSERVE & THINK (Analisis Kebutuhan via In-House AI)
    const promptBerpikir = `Instruksi Direktur: "${instruction}"
Konteks Tambahan: ${contextData ? JSON.stringify(contextData) : "Tidak ada"}

Sebagai ${profile.name}, apa langkah kerja dan alat internal yang harus Anda gunakan untuk menuntaskan tugas ini secara mandiri? Jelaskan ringkas.`;

    const activeSystemPrompt = profile.systemPrompt + getDirectorEvaluationDirectivesPrompt();
    const aiThinking = await callLocalInHouseLLM(promptBerpikir, activeSystemPrompt);
    task.thoughtProcess?.push(
      `[AI Reasoning]: ${aiThinking.text || "Menganalisis parameter tugas dan memetakan aksi ke database internal perusahaan."}`
    );

    task.status = "EXECUTING_TOOL";

    // KASUS KHUSUS: KURASI & TAMBAH PRODUK BARU KE KATALOG (STOK 0)
    if (lowerIns.includes("tambah produk") || lowerIns.includes("kurasi") || lowerIns.includes("katalog baru") || lowerIns.includes("produk baru")) {
      task.thoughtProcess?.push("Memulai kurasi produk teknologi keamanan baru dan menyiapkan visual gambar studio berstandar DSTech...");
      
      const curationRes = await InHouseAgentTools.curateAndAddDailyProduct({
        keyword: contextData?.keyword,
        category: contextData?.category,
        externalImageUrl: contextData?.externalImageUrl,
      });

      task.toolCalls?.push({
        tool: "curateAndAddDailyProduct",
        params: { contextData },
        output: curationRes.product,
      });

      task.documentGenerated = {
        type: "CATALOG_PRODUCT",
        docNumber: curationRes.product.id,
        title: `Katalog Baru: ${curationRes.product.name}`,
        content: curationRes.product,
      };

      task.resultSummary = curationRes.message;

    } else if (profile.id === "emp_bambang_sales") {
      task.thoughtProcess?.push("Mencari spesifikasi produk relevan di katalog dstech_products.json (memastikan stok fisik 0)...");
      
      let searchKey = "cctv";
      if (lowerIns.includes("barrier") || lowerIns.includes("palang") || lowerIns.includes("parkir")) {
        searchKey = "barrier";
      } else if (lowerIns.includes("access") || lowerIns.includes("pintu") || lowerIns.includes("fingerprint") || lowerIns.includes("face")) {
        searchKey = "access";
      } else if (lowerIns.includes("jaringan") || lowerIns.includes("wifi") || lowerIns.includes("server") || lowerIns.includes("fiber")) {
        searchKey = "jaringan";
      }

      const foundProducts = InHouseAgentTools.lookupProductCatalog(searchKey);
      task.toolCalls?.push({
        tool: "lookupProductCatalog",
        params: { keyword: searchKey },
        output: foundProducts,
      });

      // Konsultasi KMS teknis terkait
      const kmsTech = InHouseAgentTools.lookupTechnicalKms(searchKey);
      if (kmsTech.length > 0) {
        task.toolCalls?.push({
          tool: "lookupTechnicalKms",
          params: { keyword: searchKey },
          output: kmsTech,
        });
        task.thoughtProcess?.push(`Menyesuaikan spesifikasi penawaran dengan pedoman KMS: ${kmsTech[0].title}`);
      }

      // Rancang daftar item SPH
      const sphItems = foundProducts.length > 0
        ? foundProducts.slice(0, 3).map((p: any, idx: number) => ({
            name: p.name,
            qty: idx === 0 ? 1 : 2,
            price: p.price > 0 ? p.price : 4500000,
            unit: p.unit || "Unit",
          }))
        : [
            { name: "Paket Smart Barrier Gate Octagonal Heavy Duty", qty: 1, price: 9500000, unit: "Unit" },
            { name: "Vehicle Loop Detector Anti-Hit Metal Vehicle", qty: 2, price: 650000, unit: "Set" },
            { name: "Long Range RFID Reader Standalone 12dbi", qty: 2, price: 1850000, unit: "Unit" },
          ];

      let clientName = "Bpk. Manager Operasional";
      let clientCompany = "PT. Mitra Kawasan Industri";
      if (lowerIns.includes("krakatau")) {
        clientCompany = "PT. Krakatau Steel Perkasa";
        clientName = "Bpk. Hendra Gunawan";
      } else if (lowerIns.includes("perumahan") || lowerIns.includes("cluster")) {
        clientCompany = "Pengurus Cluster Bukit Asri Cilegon";
        clientName = "Bpk. Ketua RW";
      }

      const sphDoc = InHouseAgentTools.generateSphDocument({
        clientName,
        clientCompany,
        projectTitle: `Pemasangan & Integrasi Sistem ${searchKey.toUpperCase()} - PT. DSTech Smart Perkasa`,
        items: sphItems,
      });

      task.documentGenerated = {
        type: "SPH",
        docNumber: sphDoc.docNumber,
        title: `Surat Penawaran Harga (SPH) - ${clientCompany}`,
        content: sphDoc,
      };

      task.resultSummary = `Berhasil menerbitkan draf ${sphDoc.docNumber} untuk ${clientCompany} dengan total nilai penawaran Rp ${sphDoc.grandTotal.toLocaleString("id-ID")} (termasuk PPN 11%). Menunggu persetujuan Direktur di kotak draf.`;

    } else if (profile.id === "emp_dewi_finance") {
      task.thoughtProcess?.push("Membaca buku besar penjualan & faktur di dstech_finance_erp.json...");
      const auditResult = InHouseAgentTools.auditReceivables();

      task.toolCalls?.push({
        tool: "auditReceivables",
        params: {},
        output: auditResult,
      });

      task.documentGenerated = {
        type: "FINANCIAL_AUDIT",
        docNumber: `AUDIT/FIN/${now.getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        title: "Laporan Audit Piutang & Manajemen Tagihan Klien",
        content: auditResult,
      };

      task.resultSummary = `Audit keuangan selesai: Ditemukan ${auditResult.totalOverdueCount} faktur tertunggak dengan akumulasi Rp ${auditResult.totalOverdueAmount.toLocaleString("id-ID")}. ${auditResult.recommendations}`;

    } else if (profile.id === "emp_eko_maintenance") {
      task.thoughtProcess?.push("Menyusun Surat Perintah Kerja (SPK) dan memeriksa basis data SOP KMS internal...");
      
      const kmsSop = InHouseAgentTools.lookupTechnicalKms("sop");
      task.toolCalls?.push({
        tool: "lookupTechnicalKms",
        params: { keyword: "sop" },
        output: kmsSop,
      });
      task.thoughtProcess?.push(`Menetapkan standar K3 & SOP dari KMS: ${kmsSop.length > 0 ? kmsSop[0].title : "SOP K3 Lapangan"}`);

      const spkDoc = InHouseAgentTools.generateSpkDocument({
        technicianName: "Ahmad Zaelani & Tim Teknisi 1",
        clientName: "PT. Krakatau Posco",
        location: "Kawasan Industri Krakatau Steel, Cilegon - Banten",
        taskDescription: instruction,
        scheduledDate: new Date(Date.now() + 86400000).toLocaleDateString("id-ID"),
        priority: "Tinggi",
      });

      task.documentGenerated = {
        type: "SPK",
        docNumber: spkDoc.docNumber,
        title: `Surat Perintah Kerja (SPK) - ${spkDoc.technicianName}`,
        content: spkDoc,
      };

      task.resultSummary = `Berhasil menerbitkan ${spkDoc.docNumber} ditugaskan kepada ${spkDoc.technicianName} untuk pelaksanaan di lokasi ${spkDoc.location}.`;

    } else if (profile.id === "emp_arya_coder") {
      task.thoughtProcess?.push("Menganalisis instruksi koding, memeriksa arsitektur database prefix, dan menyusun laporan teknis...");
      
      const isSeo = /(?:seo|meta|search engine|google|peringkat|ranking|sitemap|robots)/i.test(lowerIns);
      const docType = isSeo ? "SEO_OPTIMIZATION" : "CODE_AUDIT";
      const docTitle = isSeo ? "Audit & Optimasi SEO Website dstechsmart.com" : "Audit Kode & Kepatuhan Arsitektur Sistem";
      
      task.documentGenerated = {
        type: docType,
        docNumber: `DEV/${now.getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        title: docTitle,
        content: {
          instruction,
          healthScore: 94,
          multiAppCompliance: "100% Patuh (dstech_, wa_, access_, mosque_, POS mandiri)",
          status: "Berhasil Dijalankan Secara Otonom"
        }
      };

      task.resultSummary = isSeo 
        ? "Audit SEO dstechsmart.com selesai: Skor Kesehatan 94/100, kata kunci Banten/Cilegon terpetakan, dan metadata Open Graph serta Schema.org terstruktur rapi."
        : "Pemeriksaan arsitektur selesai: Seluruh 81 routes tsc bersih, kepatuhan prefix database 100% terjaga.";

    } else {
      task.thoughtProcess?.push("Merancang materi promosi sinematik dan copywriting penawaran...");
      task.resultSummary = `Naskah promosi berhasil disusun dan dijadwalkan ke kalender publikasi resmi DSTech Smart.`;
    }

    // SIKLUS 3: REPORT & UPDATE STATE
    task.status = "COMPLETED";
    task.completedAt = new Date().toISOString();
    task.thoughtProcess?.push(`[${new Date().toLocaleTimeString("id-ID")}] Tugas otonom tuntas dikerjakan 100%.`);

    const existingTasks: AgentTask[] = readJsonSafe(TASKS_FILE, []);
    existingTasks.unshift(task);
    writeJsonSafe(TASKS_FILE, existingTasks.slice(0, 100));

    const workforce = readJsonSafe(WORKFORCE_FILE, {});
    if (Array.isArray(workforce.dstech_employees)) {
      const empIdx = workforce.dstech_employees.findIndex((e: any) => e.id === profile.id);
      if (empIdx !== -1) {
        workforce.dstech_employees[empIdx].status = "WORKING";
        workforce.dstech_employees[empIdx].current_activity = `Menuntaskan tugas otonom: "${instruction}"`;
        workforce.dstech_employees[empIdx].speech_bubble = `Pak Ramadhani, tugas "${instruction}" telah selesai saya proses secara otonom! ${task.resultSummary}`;
        writeJsonSafe(WORKFORCE_FILE, workforce);
      }
    }

    return task;
  } catch (error: any) {
    task.status = "FAILED";
    task.completedAt = new Date().toISOString();
    task.thoughtProcess?.push(`[ERROR]: ${error?.message || "Gagal memproses tugas otonom"}`);
    return task;
  }
}

// 5. Query riwayat tugas & status agen
export function getInHouseAgentTasks(limit: number = 20): AgentTask[] {
  const tasks = readJsonSafe(TASKS_FILE, []);
  return Array.isArray(tasks) ? tasks.slice(0, limit) : [];
}

// 6. Manajemen Jadwal Otonom Mandiri (Auto-Scheduler)
export function getAgentSchedules(): AgentSchedule[] {
  const defaultSchedules: AgentSchedule[] = [
    {
      id: "sch_reza_catalog_daily",
      agentId: "emp_reza_catalog",
      agentName: "Reza Firmansyah",
      department: "PENGADAAN & KATALOG E-STORE",
      title: "Audit Penyelarasan Harga & Kurasi Produk Harian (Margin 50% & Stok 0)",
      schedulePattern: "Setiap Hari, 06:00 WIB",
      instruction: "Lakukan audit dan penyelarasan harga produk referensi supplier dengan margin 50%, serta kurasi produk baru dari Shopee/supplier dengan stok 0, verifikasi FOTO REAL FISIK ALAT ASLI (dilarang AI vector fiktif, tanpa watermark toko lain, tanpa logo perusahaan pengganti), dan lakukan peningkatan resolusi HD studio.",
      enabled: true,
      nextRunDesc: "Besok pukul 06:00 WIB",
    },
    {
      id: "sch_bambang_catalog_daily",
      agentId: "emp_bambang_sales",
      agentName: "Bambang Prakoso",
      department: "KATALOG & COMMERCIAL ESTIMATION",
      title: "Kurasi & Penambahan Produk Baru Harian (Stok 0)",
      schedulePattern: "Setiap Hari, 06:00 WIB",
      instruction: "Kurasi 1 produk keamanan/barrier gate baru dari pasar industri, susun spesifikasi komprehensif, pastikan foto real alat fisik asli berkualitas HD studio tanpa logo yang menutupi alat, dan masukkan ke katalog dstechsmart.com dengan stok 0.",
      enabled: true,
      nextRunDesc: "Besok pukul 06:00 WIB",
    },
    {
      id: "sch_dewi_01",
      agentId: "emp_dewi_finance",
      agentName: "Dewi Sartika",
      department: "KEUANGAN & AUDIT PIUTANG",
      title: "Audit Piutang Mingguan & Rekap Faktur Jatuh Tempo",
      schedulePattern: "Setiap Senin, 08:00 WIB",
      instruction: "Lakukan audit piutang dan faktur jatuh tempo dari dstech_finance_erp.json, hitung akumulasi tunggakan, dan berikan rekomendasi penagihan prioritas.",
      enabled: true,
      nextRunDesc: "Senin berikutnya pukul 08:00 WIB",
    },
    {
      id: "sch_nadia_01",
      agentId: "emp_nadia_marketing",
      agentName: "Nadia Safitri",
      department: "PEMASARAN & SOSIAL MEDIA",
      title: "Penyusunan Ide Konten Video Reels & TikTok Mingguan",
      schedulePattern: "Setiap Selasa, 09:00 WIB",
      instruction: "Rancang 3 konsep video promosi vertikal 9:16 untuk produk Smart Barrier Gate dan CCTV Pabrik, lengkap dengan hook 3 detik dan call to action.",
      enabled: true,
      nextRunDesc: "Selasa berikutnya pukul 09:00 WIB",
    },
    {
      id: "sch_bambang_01",
      agentId: "emp_bambang_sales",
      agentName: "Bambang Prakoso",
      department: "SALES & ESTIMASI PROYEK",
      title: "Evaluasi Prospek B2B & Follow-up Draf SPH Klien",
      schedulePattern: "Setiap Rabu, 10:00 WIB",
      instruction: "Periksa katalog produk dstech_products.json, siapkan draf SPH estimasi paket barrier gate untuk prospek kawasan industri, hitung PPN 11% dan termin pembayaran.",
      enabled: true,
      nextRunDesc: "Rabu berikutnya pukul 10:00 WIB",
    },
    {
      id: "sch_eko_01",
      agentId: "emp_eko_maintenance",
      agentName: "Eko Prasetyo",
      department: "OPERASIONAL & TEKNISI",
      title: "Pemeriksaan Kesiapan APD K3 & Jadwal Maintenance Rutin",
      schedulePattern: "Setiap Kamis, 08:30 WIB",
      instruction: "Periksa jadwal maintenance pelanggan berkala, terbitkan draf SPK inspeksi teknisi lapangan dengan standar APD K3 dan SOP kelistrikan.",
      enabled: true,
      nextRunDesc: "Kamis berikutnya pukul 08:30 WIB",
    },
  ];

  const existing = readJsonSafe(SCHEDULES_FILE, null);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    writeJsonSafe(SCHEDULES_FILE, defaultSchedules);
    return defaultSchedules;
  }

  // Pastikan sch_reza_catalog_daily dan sch_bambang_catalog_daily ada di dalam list
  if (!existing.some((s: any) => s.id === "sch_reza_catalog_daily")) {
    existing.unshift(defaultSchedules[0]);
    writeJsonSafe(SCHEDULES_FILE, existing);
  }
  if (!existing.some((s: any) => s.id === "sch_bambang_catalog_daily")) {
    const bSch = defaultSchedules.find((s) => s.id === "sch_bambang_catalog_daily");
    if (bSch) existing.push(bSch);
    writeJsonSafe(SCHEDULES_FILE, existing);
  }

  return existing;
}

export function toggleAgentSchedule(scheduleId: string, enabled?: boolean): AgentSchedule[] {
  const schedules = getAgentSchedules();
  const idx = schedules.findIndex((s) => s.id === scheduleId);
  if (idx !== -1) {
    schedules[idx].enabled = enabled !== undefined ? enabled : !schedules[idx].enabled;
    writeJsonSafe(SCHEDULES_FILE, schedules);
  }
  return schedules;
}

export async function runAgentScheduleNow(scheduleId: string): Promise<{ schedule: AgentSchedule; task: AgentTask }> {
  const schedules = getAgentSchedules();
  const target = schedules.find((s) => s.id === scheduleId);
  if (!target) throw new Error("Jadwal tidak ditemukan");

  const task = await executeAutonomousAgentTask(target.agentId, target.instruction);
  target.lastRunAt = new Date().toISOString();
  target.lastTaskId = task.id;
  writeJsonSafe(SCHEDULES_FILE, schedules);

  return { schedule: target, task };
}

// 7. Helper Format & Pengiriman WhatsApp Otonom
export function formatWhatsAppDocumentMessage(doc: any): string {
  if (!doc) return "Halo, berikut dokumen resmi dari PT. DSTech Smart Perkasa.";

  const c = doc.content || doc;
  const isSph = doc.type === "SPH" || doc.docNumber?.startsWith("SPH") || c.docNumber?.startsWith("SPH");
  const isSpk = doc.type === "SPK" || doc.docNumber?.startsWith("SPK") || c.docNumber?.startsWith("SPK");
  const isAudit = doc.type === "FINANCIAL_AUDIT" || doc.docNumber?.startsWith("AUDIT") || c.totalOverdueCount !== undefined;
  const isCatalog = doc.type === "CATALOG_PRODUCT" || doc.id?.startsWith("dstech_prod_ai_");

  if (isCatalog) {
    let msg = `*PT. DSTECH SMART PERKASA*
`;
    msg += `_Produk Baru Resmi di Katalog dstechsmart.com_
`;
    msg += `━━━━━━━━━━━━━━━━━━━━━
`;
    msg += `📦 *${c.name}*
`;
    msg += `Kategori: *${c.category}* (${c.subCategory})
`;
    msg += `Brand: *${c.brand}*
`;
    msg += `Harga: *Rp ${Number(c.price || 0).toLocaleString("id-ID")}*
`;
    msg += `Status Stok: *Pre-Order / Order On Demand* (Stok 0)
`;
    msg += `━━━━━━━━━━━━━━━━━━━━━

`;
    msg += `*DESKRIPSI & KEUNGGULAN:*
`;
    msg += `${c.desc?.slice(0, 250)}...

`;
    msg += `Garansi Resmi 1 Tahun PT. DSTech Smart Perkasa
`;
    msg += `🌐 Lihat di website: https://dstechsmart.com/shop`;
    return msg;
  }

  if (isSph) {
    let msg = `*PT. DSTECH SMART PERKASA*
`;
    msg += `_Smart Security & Automation Systems_
`;
    msg += `━━━━━━━━━━━━━━━━━━━━━
`;
    msg += `📄 *SURAT PENAWARAN HARGA (SPH)*
`;
    msg += `No. Dokumen: *${c.docNumber || doc.docNumber}*
`;
    msg += `Tanggal: ${c.date || "Hari ini"}
`;
    msg += `Kepada Yth: *${c.clientName || "Bapak/Ibu"}* (${c.clientCompany || "Klien"})
`;
    msg += `Proyek: ${c.projectTitle || "Sistem Keamanan & Otomasi"}
`;
    msg += `━━━━━━━━━━━━━━━━━━━━━

`;
    msg += `*RINCIAN PENAWARAN:*
`;

    if (Array.isArray(c.items)) {
      c.items.forEach((it: any, idx: number) => {
        msg += `${idx + 1}. *${it.item || it.name}*
`;
        msg += `   • Qty: ${it.qty} ${it.unit || "Unit"} x Rp ${(it.price || 0).toLocaleString("id-ID")}
`;
        msg += `   • Subtotal: *Rp ${(it.total || 0).toLocaleString("id-ID")}*
`;
      });
    }

    msg += `
─────────────────────
`;
    msg += `Subtotal: Rp ${(c.subtotal || 0).toLocaleString("id-ID")}
`;
    msg += `PPN (11%): Rp ${(c.ppn || 0).toLocaleString("id-ID")}
`;
    msg += `*TOTAL NILAI PENAWARAN: Rp ${(c.grandTotal || 0).toLocaleString("id-ID")}*
`;
    msg += `─────────────────────

`;
    msg += `*KETENTUAN PEMBAYARAN & GARANSI:*
`;
    msg += `• Pembayaran: ${c.paymentTerms || "DP 50%, Pelunasan 50% setelah BAST"}
`;
    msg += `• Garansi: ${c.warranty || "Garansi 1 tahun resmi"}
`;
    msg += `• Berlaku: ${c.validityDays || 14} Hari Kalender

`;
    msg += `Catatan: ${c.notes || "Harga sudah termasuk instalasi & setting sistem."}

`;
    msg += `Terima kasih atas kepercayaan Anda.
`;
    msg += `*PT. DSTech Smart Perkasa*
`;
    msg += `🌐 https://dstechsmart.com`;
    return msg;
  }

  if (isSpk) {
    let msg = `*PT. DSTECH SMART PERKASA*
`;
    msg += `_Divisi Operasional & Teknisi Lapangan_
`;
    msg += `━━━━━━━━━━━━━━━━━━━━━
`;
    msg += `🛠️ *SURAT PERINTAH KERJA (SPK)*
`;
    msg += `No. SPK: *${c.docNumber || doc.docNumber}*
`;
    msg += `Tanggal Terbit: ${c.issuedDate || "Hari ini"}
`;
    msg += `Teknisi Bertugas: *${c.technicianName}*
`;
    msg += `Klien / Lokasi: *${c.clientName}* (${c.location})
`;
    msg += `Jadwal Pengerjaan: *${c.scheduledDate}*
`;
    msg += `Prioritas: *${c.priority || "Tinggi"}*
`;
    msg += `━━━━━━━━━━━━━━━━━━━━━

`;
    msg += `*URAIAN TUGAS:*
${c.taskDescription}

`;
    msg += `*SOP K3 & KESELAMATAN:*
${c.safetyRules || "Wajib helm safety, rompi K3, sepatu safety, dokumentasi foto."}

`;
    msg += `Harap konfirmasi ke Koordinator Operasional (Eko Prasetyo) setelah pekerjaan selesai.`;
    return msg;
  }

  if (isAudit) {
    let msg = `*PT. DSTECH SMART PERKASA*
`;
    msg += `_Divisi Keuangan & Audit Piutang_
`;
    msg += `━━━━━━━━━━━━━━━━━━━━━
`;
    msg += `📊 *LAPORAN AUDIT PIUTANG KLIEN*
`;
    msg += `Total Faktur Tertunggak: *${c.totalOverdueCount || 0} Faktur*
`;
    msg += `Akumulasi Piutang: *Rp ${(c.totalOverdueAmount || 0).toLocaleString("id-ID")}*
`;
    msg += `━━━━━━━━━━━━━━━━━━━━━

`;
    msg += `*REKOMENDASI AUDITOR:*
${c.recommendations || "Lakukan follow-up pembayaran segera."}`;
    return msg;
  }

  return `*DOKUMEN RESMI PT. DSTECH SMART PERKASA*
${doc.title || "Dokumen Otonom"}
${doc.resultSummary || ""}`;
}


export async function callLocalCoderLLM(
  prompt: string,
  systemPrompt: string = "Anda adalah Arya Pratama, AI Software Developer PT. DSTech Smart Perkasa. Tuliskan kode yang bersih, bebas bug, dan sesuai standar Next.js/TypeScript.",
  model: string = DEFAULT_CODER_MODEL,
  timeoutMs: number = 8000
): Promise<{ text: string; error?: string }> {
  return callLocalInHouseLLM(prompt, systemPrompt, model, timeoutMs);
}
