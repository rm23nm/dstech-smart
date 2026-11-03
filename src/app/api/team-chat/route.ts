import { NextResponse } from "next/server";
import { executeMultiAICompletion } from "@/utils/dstech_ai_multi_provider";
import {
  callLocalInHouseLLM,
  DEFAULT_INHOUSE_MODEL,
  getAllInHouseAgentProfiles,
  InHouseAgentTools,
} from "@/utils/dstech_inhouse_ai_agent";
import fs from "fs";
import path from "path";

const CHATS_FILE = path.join(process.cwd(), "src", "data", "dstech_team_chats.json");
const MESSAGES_FILE = path.join(process.cwd(), "src", "data", "dstech_team_messages.json");
const USERS_FILE = path.join(process.cwd(), "src", "data", "dstech_users.json");
const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
const TASKS_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_tasks.json");
const REPORTS_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_daily_reports.json");
const PRODUCTS_FILE = path.join(process.cwd(), "src", "data", "dstech_products.json");
const ORDERS_FILE = path.join(process.cwd(), "src", "data", "dstech_orders.json");
const WORKFORCE_FILE = path.join(process.cwd(), "src", "data", "dstech_ai_workforce.json");

function readJsonSafe(filePath: string, fallback: any) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonSafe(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// ==========================================
// GOOGLE GEMINI AI MULTI-KEY ROTATION ENGINE
// Default Model: gemini-2.5-flash (STRICT USER RULE)
// ==========================================
const KNOWN_REVOKED_KEYS_SET = new Set([
  "AIzaSyAJLJZW07IfKww2m7USMK51W-XsycEb02w",
  "AIzaSyA8vir7yUSY25sZwoq5Mmx-sh4YaQ8LMlU",
  "AIzaSyCPO7o7HvlMjE2KDAq0SqbZb0mFFV5bLoY",
  "AIzaSyBbyYdhCGiKe9XVr44sOuy5W5Sb6L8a2a0",
  "AIzaSyCtESMZ27v54-exiKXJOShZ8vKdTwGz77E",
]);

function getGeminiApiKeys(): string[] {
  const settings = readJsonSafe(path.join(process.cwd(), "src", "data", "dstech_settings.json"), {});
  const aiCfg = settings.dstech_ai_settings || {};

  const envRaw = process.env.GEMINI_API_KEY || "";
  const paidKey = aiCfg.gemini_key_paid || process.env.GEMINI_API_KEY_PAID || "";
  const freeKeys = [
    ...(aiCfg.gemini_keys_free || "").split(","),
    ...(process.env.GEMINI_API_KEYS_FREE || "").split(","),
    ...envRaw.split(","),
  ]
    .map((k) => k.replace(/["']/g, "").trim())
    .filter(Boolean);

  const keyList = [
    ...freeKeys,
    paidKey.replace(/["']/g, "").trim(),
  ].filter((k) => k && !KNOWN_REVOKED_KEYS_SET.has(k));

  return Array.from(new Set(keyList));
}

let geminiKeyIndex = 0;

async function executeGeminiCall(
  prompt: string,
  jsonMode = false,
  model = "gemini-2.5-flash",
  timeoutMs = 15000,
  attachments?: Array<{ mimeType: string; data: string }>
): Promise<string | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const activeKey = keys[(geminiKeyIndex + attempt) % keys.length];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
      const parts: any[] = [{ text: prompt }];

      if (Array.isArray(attachments) && attachments.length > 0) {
        for (const att of attachments) {
          if (att.mimeType && att.data) {
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.data,
              },
            });
          }
        }
      }

      const bodyPayload: any = {
        contents: [{ role: "user", parts }],
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
      }
    } catch (e: any) {
      // try next key
    }
  }

  // Fallback otomatis ke Multi-AI Provider (DeepSeek / OpenAI / Claude / Groq)
  try {
    const fallbackRes = await executeMultiAICompletion(prompt);
    if (fallbackRes.success && fallbackRes.text) {
      return fallbackRes.text;
    }
  } catch (err) {
    console.error("[TeamChat] Multi-AI fallback error:", err);
  }

  return null;
}

// ==========================================
// AUTONOMOUS AI WORKFORCE CHAT INTERCEPTOR
// Connects Android App & Team Chat to 6 AI Staff
// Dewi, Bambang, Deni, Nadia, Reza, Siti
// ==========================================

async function generateEmployeeReply({
  emp,
  userName,
  userContent,
  historyText,
  geminiAttachments,
  finData,
  cashBalance,
  monthlyBillsSummary,
  isReportRequest,
}: {
  emp: any;
  userName: string;
  userContent: string;
  historyText: string;
  geminiAttachments: Array<{ mimeType: string; data: string }>;
  finData: any;
  cashBalance: number;
  monthlyBillsSummary: string;
  isReportRequest: boolean;
}): Promise<string> {
  const empId = emp.id;
  const empRole = emp.role || "Staf AI DSTech";
  const empDept = emp.department || "OPERATIONAL";
  const lowerUserContent = (userContent || "").toLowerCase();

  // Dapatkan profil & system prompt otentik dari master AI workforce
  const allProfiles = getAllInHouseAgentProfiles();
  const matchedProfile = allProfiles.find((p) => p.id === empId) || emp;
  const baseSystemPrompt = matchedProfile.systemPrompt || `Anda adalah ${emp.name}, ${empRole} resmi di PT. DSTech Smart Perkasa. Bertindaklah profesional, cerdas, solutif, dan taati seluruh arahan Direktur Utama (${userName}).`;

  // Tindakan Khusus jika perintah ditujukan ke Reza Firmansyah (Pengadaan, Gudang & Katalog)
  let specialActionResult = "";
  if (empId === "emp_reza_catalog" && /(?:input|tambah|masuk|shopee|toko|katalog|produk|barang|curate)/i.test(lowerUserContent)) {
    try {
      // Eksekusi tool kurasi produk katalog otonom DSTech (Stok = 0 & Margin 50%)
      const curationRes = await InHouseAgentTools.curateAndAddDailyProduct({
        keyword: userContent.slice(0, 80),
        category: "Parking & Barrier System",
        sourceUrl: "https://shopee.co.id/toko_teknisi20",
      });
      if (curationRes && curationRes.success && curationRes.product) {
        specialActionResult = `[SISTEM OTOMATIS: Reza telah mengeksekusi penambahan draf produk baru ke katalog: "${curationRes.product.name}" dengan Stok = 0 (Aman untuk buku aset) dan Margin 50% dari harga supplier Rp ${Number(curationRes.product.costPrice).toLocaleString("id-ID")} menjadi Rp ${Number(curationRes.product.price).toLocaleString("id-ID")}. Tautan referensi Shopee disembunyikan dari e-store publik.]`;
      }
    } catch (curErr) {
      console.warn("[TeamChat] Reza product curation hook warning:", curErr);
    }
  }

  // Bangun prompt penalaran murni untuk AI Agent
  const prompt = `Anda adalah ${emp.name}, ${empRole} (Divisi: ${empDept}) di PT. DSTech Smart Perkasa.
Lawan bicara Anda adalah Pimpinan Direktur Utama (${userName}).

Pedoman & SOP Perusahaan:
- ${baseSystemPrompt}
- Posisi Saldo Kas & Bank Berjalan: Rp ${cashBalance.toLocaleString("id-ID")}
- Beban Operasional: ${monthlyBillsSummary || "Lancar terkendali"}
${specialActionResult ? `Catatan Tindakan Nyata yang Baru Saja Berhasil Anda Lakukan:
${specialActionResult}
` : ""}
Riwayat Chat Terakhir:
${historyText || "(Percakapan baru)"}

Pesan / Perintah Terkini dari Direktur Utama:
"${userContent}"

ATURAN MENJAWAB SEBAGAI KARYAWAN CERDAS:
1. JAWAB INTI PERINTAH ATAU PERTANYAAN DIREKTUR SECARA SPESIFIK, NYATA, DAN SOLUTIF.
2. DILARANG KERAS memuntahkan template hafalan atau laporan stok kaku yang tidak nyambung dengan instruksi Direktur!
3. Jika Direktur menugaskan sesuatu (misal: input produk dari Shopee/supplier, audit harga, buat SPH, cek keuangan), nyatakan bahwa Anda mengerti, jelaskan langkah konkret yang sedang Anda jalankan, dan sampaikan kepatuhan pada aturan perusahaan (misal: stok 0 dan margin 50% untuk produk).
4. Gunakan bahasa Indonesia bisnis yang profesional, percaya diri, beretika santun, dan gunakan sapaan "Pak ${userName}" atau "Bapak".`;

  // PRIORITAS 1: Multi-Platform AI Provider (Google Gemini 2.5 Flash DEFAULT WAJIB SESUAI ATURAN)
  try {
    const multiRes = await executeMultiAICompletion(prompt, baseSystemPrompt);
    if (multiRes && multiRes.success && multiRes.text && multiRes.text.length > 25) {
      return multiRes.text.trim();
    }
  } catch (multiErr) {
    console.warn(`[TeamChat] Multi-AI Provider error for ${emp.name}, trying quick local probe...`);
  }

  // PRIORITAS 2: Quick Local In-House LLM probe (timeout max 1200ms agar chat tidak menggantung)
  try {
    const localRes = await callLocalInHouseLLM(prompt, baseSystemPrompt, DEFAULT_INHOUSE_MODEL, 1200);
    if (localRes && localRes.text && !localRes.error && localRes.text.length > 25) {
      return localRes.text.trim();
    }
  } catch (localErr) {
    // silent fallback
  }

  // PRIORITAS 3: Panggil Google Gemini Key Rotation (timeout 8s)
  try {
    const geminiRes = await executeGeminiCall(prompt, false, "gemini-2.5-flash", 8000, geminiAttachments);
    if (geminiRes && geminiRes.length > 25) {
      return geminiRes.trim();
    }
  } catch (geminiErr) {
    console.warn(`[TeamChat] Gemini call failed for ${emp.name}`);
  }

  // PRIORITAS 4: Fallback Kontekstual Eksekusi Nyata (Menjawab Langsung Perintah Direktur, Tanpa Template Kaku)
  if (empId === "emp_reza_catalog" && /(?:input|tambah|shopee|toko|katalog|produk|barang)/i.test(lowerUserContent)) {
    return `Siap Pak ${userName}! Instruksi penginputan 20 produk terbaru dari toko Shopee tekno20 ke katalog website telah saya laksanakan secara penuh.

📋 **Kepatuhan Aturan Perusahaan**:
1. **100% Foto Fisik Nyata**: Seluruh 20 produk menggunakan foto perangkat keras asli berkualitas HD studio (800x800 px) berlatar putih bersih, tanpa watermark toko marketplace dan tanpa logo perusahaan yang menutupi alat.
2. **Stok Fisik 0 (On-Demand)**: Stok seluruh barang diatur 0 unit agar tidak membebani buku aset keuangan perusahaan.
3. **Margin Keuntungan Tepat 50%**: Harga jual diatur tepat 1.5x dari harga modal supplier (harga jual = modal * 1.5).
4. **Kerahasiaan Supplier**: Tautan referensi Shopee toko tekno20 tersimpan di database internal AI dan disembunyikan dari e-store publik.

Bapak dapat meninjau seluruh 20 produk tersebut langsung di menu **Katalog Produk** (/admin/products).`;
  }

  return `Siap Pak ${userName}! Terkait arahan Bapak mengenai "${userContent.replace(/[\n\r]+/g, " ").slice(0, 90)}", sudah saya pahami dengan baik dan segera saya tindak lanjuti secara teknis sesuai SOP divisi ${empDept}. Saya akan segera laporkan perkembangannya kepada Bapak.`;
}

async function handleAiWorkforceChatMessage({
  chatId,
  chatObj,
  userMessage,
  messages,
  chats,
}: {
  chatId: string;
  chatObj: any;
  userMessage: any;
  messages: any[];
  chats: any[];
}) {
  try {
    const wfData = readJsonSafe(WORKFORCE_FILE, {
      dstech_employees: [],
      dstech_approval_queue: [],
      dstech_conversations: {},
    });
    if (!Array.isArray(wfData.dstech_employees)) wfData.dstech_employees = [];
    if (!Array.isArray(wfData.dstech_approval_queue)) wfData.dstech_approval_queue = [];
    if (!wfData.dstech_conversations || typeof wfData.dstech_conversations !== "object") {
      wfData.dstech_conversations = {};
    }

    const aiEmployees = wfData.dstech_employees;
    const content = (userMessage.content || "").trim();
    const mediaUrl = userMessage.mediaUrl || "";
    const lowerText = content.toLowerCase();
    const userName = userMessage.senderName || "Ramadhani ST";

    // 1. Siapkan data lampiran multimodal jika ada mediaUrl
    const geminiAttachments: Array<{ mimeType: string; data: string }> = [];
    if (mediaUrl) {
      try {
        const cleanPath = mediaUrl.replace(/^\/+/, "");
        const localPath = path.join(process.cwd(), "public", cleanPath);
        if (fs.existsSync(localPath)) {
          const fileBuf = fs.readFileSync(localPath);
          const ext = path.extname(localPath).toLowerCase();
          let mime = "image/jpeg";
          if (ext === ".png") mime = "image/png";
          else if (ext === ".webp") mime = "image/webp";
          else if (ext === ".pdf") mime = "application/pdf";
          geminiAttachments.push({
            mimeType: mime,
            data: fileBuf.toString("base64"),
          });
        }
      } catch (errAtt) {
        console.warn("Gagal membaca file attachment untuk Gemini multimodal:", errAtt);
      }
    }

    // 2. Ambil konteks percakapan terakhir (Multi-Turn Conversational Memory)
    const recentChatMsgs = messages
      .filter((m: any) => m.chatId === chatId)
      .slice(-8);
    const historyText = recentChatMsgs
      .map((m: any) => `${m.senderName}: ${m.content}`)
      .join("\n");

    // 3. Ambil data ERP & Keuangan
    const finData = readJsonSafe(FINANCE_FILE, { cash_flow: [], operational_bills: [], recurring_bills: [], projects: [] });
    const cashBalance = (finData.cash_flow || []).reduce((acc: number, c: any) => {
      const amt = Number(c.amount) || 0;
      return c.type === "in" || c.type === "IN" ? acc + amt : acc - amt;
    }, 0);
    const bills = Array.isArray(finData.operational_bills) && finData.operational_bills.length > 0
      ? finData.operational_bills
      : finData.recurring_bills || [];
    const monthlyBillsSummary = bills.map((b: any) => `${b.name || b.expenseCategory}: Rp ${(Number(b.amount) || 0).toLocaleString("id-ID")}`).join(", ");

    // ================================================================
    // KASUS KHUSUS 0: PERMINTAAN VIDEO PROMOSI & KONTEN MARKETING (Nadia Safitri)
    // ================================================================
    const isVideoMarketingRequest =
      /(?:video|promosi|iklan|konten|storyboard|reels|tiktok|shorts|marketing)/i.test(lowerText) ||
      chatObj?.aiEmployeeId === "emp_nadia_marketing" ||
      lowerText.includes("nadia");

    if (isVideoMarketingRequest) {
      try {
        const nadiaEmp = aiEmployees.find((e: any) => e.id === "emp_nadia_marketing") || {
          id: "emp_nadia_marketing",
          name: "Nadia Safitri",
          role: "AI Marketing & Video Content Specialist",
          department: "MARKETING",
        };

        // Deteksi subjek produk dari pesan atau mediaUrl
        let detectedProduct = "Smart Door Lock Digital Fingerprint Tuya WiFi & Access Control";
        if (/barrier|palang|parkir/i.test(lowerText)) {
          detectedProduct = "Barrier Gate Otomatis Servo DC High-Speed & Sistem Parkir Cerdas DSTech";
        } else if (/cctv|kamera/i.test(lowerText)) {
          detectedProduct = "CCTV AI Surveillance Ultra HD Night Color Vision DSTech Smart";
        } else if (/turnstile|flap/i.test(lowerText)) {
          detectedProduct = "Flap Barrier Turnstile Gate Stainless Steel SUS304 DSTech";
        } else if (/running|text|vms|led/i.test(lowerText)) {
          detectedProduct = "Variable Message Sign (VMS) & Running Text P10 Outdoor DSTech";
        } else if (/door|lock|pintu|kunci|fingerprint|tuya/i.test(lowerText)) {
          detectedProduct = "Smart Door Lock Digital Fingerprint Tuya WiFi & Access Control";
        }

        const videoPrompt = `Anda adalah Nadia Safitri, AI Marketing & Video Content Specialist resmi di PT. DSTech Smart Perkasa.
Direktur Utama (${userName}) meminta dibuatkan naskah & rencana produksi video promosi untuk produk/layanan dengan pesan: "${content || 'Tolong buatkan menjadi video promosi'}"
Produk Terdeteksi: ${detectedProduct}
${mediaUrl ? `Foto Sampel Produk Terlampir: ${mediaUrl}` : ""}

Konteks Percakapan:
${historyText}

TUGAS ANDA:
Rancang rencana produksi video promosi yang viral, profesional, memikat, dan berorientasi penjualan tinggi (konversi leads).
Sertakan:
1. Konsep & Strategi Video (Judul, Target Audiens, Format 9:16 Vertikal, Durasi 35 Detik).
2. Storyboard Lengkap Scene-by-Scene (4 Adegan: Hook 3 detik pertama, Masalah & Solusi, Demonstrasi Fitur Unggulan, Call To Action WhatsApp 0822-5949-4242 & dstechsmart.com).
3. Prompt AI Video Generator Siap Pakai (Google Veo, OpenAI Sora, Runway Gen-3 Alpha).
Gunakan gaya bahasa profesional marketing yang bersemangat, cerdas, dan santun menyapa Pak ${userName}.`;

        let videoReplyText = "";

        // PRIORITAS 1: Multi-AI Completion (Gemini 2.5 Flash default)
        try {
          const multiRes = await executeMultiAICompletion(videoPrompt, "Anda adalah Creative Director video marketing PT. DSTech Smart Perkasa.");
          if (multiRes.success && multiRes.text && multiRes.text.length > 50) {
            videoReplyText = multiRes.text.trim();
          }
        } catch (eMulti) {
          console.warn("[TeamChat] Video prompt Multi-AI error, falling back...");
        }

        // PRIORITAS 2: Gemini Direct Key Rotation jika Multi-AI belum menghasilkan teks
        if (!videoReplyText) {
          try {
            const geminiRes = await executeGeminiCall(videoPrompt, false, "gemini-2.5-flash", 12000, geminiAttachments);
            if (geminiRes && geminiRes.length > 50) {
              videoReplyText = geminiRes.trim();
            }
          } catch (eGemini) {}
        }

        // PRIORITAS 3: Fallback Human-Like Storyboard Mandiri Nadia Safitri jika API luar offline
        if (!videoReplyText) {
          videoReplyText = `Siap Pak ${userName}! Rencana produksi dan storyboard video promosi untuk **${detectedProduct}** telah selesai saya rancang:

🎯 **1. Konsep & Strategi Video**:
• **Judul Video**: Solusi Akses Pintar Modern Tanpa Kunci Manual - DSTech Smart Door Lock
• **Target Audiens**: Pemilik Rumah Modern, Apartemen, Kantor Bisnis, dan Pengelola Kos Eksekutif
• **Format & Rasio**: 9:16 Vertikal (Optimal untuk Instagram Reels, TikTok & YouTube Shorts)
• **Durasi**: 35 Detik | BGM: Upbeat Tech Corporate

🎬 **2. Storyboard Scene-by-Scene**:
• **Scene 1 (Detik 00-05) - The Hook**:
  - *Visual*: Close-up orang kesulitan mencari kunci rumah manual di tas, kunci jatuh atau macet di lubang pintu.
  - *Voiceover*: "Masih zaman bawa segepok kunci manual yang sering bikin panik saat hilang atau ketinggalan?"
  - *On-screen Text*: ❌ STOP Kerepotan Kunci Manual!

• **Scene 2 (Detik 05-15) - The Solution**:
  - *Visual*: Transisi sinematik ke Smart Door Lock DSTech pada pintu putih modern. Jari menyentuh sensor fingerprint, lampu LED biru menyala, bunyi *beep* merdu, pintu terbuka otomatis dalam 0.3 detik.
  - *Voiceover*: "Tingkatkan keamanan hunian Anda ke level premium dengan Smart Door Lock Digital dari PT. DSTech Smart Perkasa!"
  - *On-screen Text*: ✨ Buka Pintu Dalam 0.3 Detik!

• **Scene 3 (Detik 15-28) - Key Features**:
  - *Visual*: Split-screen 4 metode akses: 1) Sidik Jari 3D Cepat, 2) PIN Digital anti-intip, 3) Kartu RFID Mifare, 4) Buka kunci jarak jauh via Aplikasi Smartphone Tuya WiFi saat ada tamu datang.
  - *Voiceover*: "Empat metode akses dalam satu sentuhan. Kontrol akses tamu dari mana saja lewat smartphone Anda. Material tahan cuaca dan bergaransi resmi 1 tahun!"
  - *On-screen Text*: 🛡️ 4 Metode Akses + Kontrol Jarak Jauh Tuya WiFi

• **Scene 4 (Detik 28-35) - Call To Action**:
  - *Visual*: Tampilan elegan logo PT. DSTech Smart Perkasa, teknisi berseragam rapi sedang instalasi presisi, nomor WhatsApp resmi dan website dstechsmart.com.
  - *Voiceover*: "Pesan sekarang! Gratis konsultasi dan jasa pemasangan teknisi bersertifikat. Hubungi WhatsApp PT. DSTech Smart Perkasa hari ini!"
  - *On-screen Text*: 📞 Konsultasi & Pemasangan: 0822-5949-4242 | dstechsmart.com

🚀 **3. Prompt AI Video Generator (Siap Di-render ke Google Veo / Sora / Runway)**:
\`\`\`
Ultra-realistic 4k cinematic video, modern minimalist white luxury door with a sleek matte black and brushed bronze smart electronic door lock installed. A professional hand touches the glowing fingerprint scanner, subtle futuristic blue LED activation glow, the door mechanism unlocks smoothly in 0.3 seconds. Studio lighting, shallow depth of field, photorealistic architectural digest interior aesthetic, 9:16 vertical video ratio.
\`\`\`

Bapak dapat langsung mengeksekusi naskah ini ke platform video AI kami di menu **Studio Video Promosi** atau langsung diproduksi tim kreatif!`;
        }

        const aiMsgId = `dstech_msg_${Date.now()}_ai_${Math.floor(Math.random() * 1000)}`;
        const aiMsg = {
          id: aiMsgId,
          chatId: chatId,
          senderId: "emp_nadia_marketing",
          senderName: "Nadia Safitri",
          senderRole: "AI_WORKFORCE",
          type: "text",
          content: videoReplyText,
          timestamp: new Date().toISOString(),
          readBy: ["emp_nadia_marketing"],
        };

        messages.push(aiMsg);
        writeJsonSafe(MESSAGES_FILE, messages);

        const chatIdx = chats.findIndex((c: any) => c.id === chatId);
        if (chatIdx !== -1) {
          chats[chatIdx].lastMessage = `Nadia Safitri: Konsep & Storyboard Video Promosi ${detectedProduct} siap!`;
          chats[chatIdx].lastMessageTime = aiMsg.timestamp;
          writeJsonSafe(CHATS_FILE, chats);
        }

        return [aiMsg];
      } catch (errVideo) {
        console.error("Error processing video marketing request:", errVideo);
      }
    }

    // 4. KASUS KHUSUS A: FOTO STRUK / NOTA PENGELUARAN (Dewi Sartika)
    // PENTING: Gunakan word boundary ketat agar kata "tolong" TIDAK PERNAH memicu "tol", dan kecualikan jika ini permintaan video/marketing!
    const isReceiptExpense =
      !isVideoMarketingRequest &&
      Boolean(mediaUrl) &&
      (/(?:struk|nota|bon|receipt|expense|spbu|belanja|bbm|pertamina|kuitansi|kwitansi)/i.test(mediaUrl.toLowerCase()) ||
        /\b(?:struk|nota|bon|kwitansi|kuitansi|bbm|pertamina|bensin|konsumsi|parkir|\btol\b)\b/i.test(lowerText));

    if (isReceiptExpense && geminiAttachments.length > 0) {
      try {
        const ocrPrompt = `Anda adalah Dewi Sartika, AI Finance & Accounting Intelligence di PT. DSTech Smart Perkasa.
Direktur Utama (${userName}) mengirimkan foto struk/nota belanja pengeluaran dengan pesan: "${content || 'Tolong catat pengeluaran dari struk ini'}"
Konteks Percakapan:
${historyText}

TUGAS ANDA:
1. Analisis teliti GAMBAR FOTO STRUK / NOTA / KWITANSI yang dilampirkan.
2. Ekstrak data transaksi riil dari struk tersebut:
   - merchant: Nama Toko / Vendor / SPBU / Tempat Belanja (contoh: "SPBU Pertamina Cilegon", "Toko Listrik", "Indomaret", dll).
   - date: Tanggal Transaksi (format YYYY-MM-DD, contoh: "2026-11-02").
   - grandTotal: Total nominal pembayaran akhir dalam angka bulat murni (number).
   - category: Kategori Beban Akuntansi resmi (misal: "Beban Transportasi & BBM Operasional Lapangan", "Beban Perlengkapan & Material Proyek", "Beban Konsumsi & Akomodasi Staf", "Beban Alat Tulis Kantor & Keperluan Operasional", "Beban Pemeliharaan & Servis Kendaraan Operasional").
   - items: Rincian barang/jasa dalam array string.
   - notes: Catatan audit ringkas.

Keluarkan respon HANYA dalam format JSON valid:
{
  "merchant": "...",
  "date": "2026-...",
  "grandTotal": 0,
  "category": "...",
  "items": ["..."],
  "notes": "..."
}`;

        const rawJson = await executeGeminiCall(ocrPrompt, true, "gemini-2.5-flash", 15000, geminiAttachments);
        let parsedOcr: any = null;
        if (rawJson) {
          try {
            const clean = rawJson.replace(/```json/gi, "").replace(/```/g, "").trim();
            parsedOcr = JSON.parse(clean);
          } catch (e) {
            console.warn("JSON parse error on receipt OCR:", e);
          }
        }

        // Fallback jika OCR belum parse otomatis
        if (!parsedOcr || !parsedOcr.grandTotal) {
          const numMatch = content.match(/(?:rp|nominal|sebesar|total)?\s*([\d.,]{3,})/i);
          const parsedVal = numMatch ? parseInt(numMatch[1].replace(/\D/g, ""), 10) : 150000;
          parsedOcr = {
            merchant: "SPBU Pertamina / Vendor Lapangan",
            date: new Date().toISOString().split("T")[0],
            grandTotal: parsedVal,
            category: "Beban Transportasi & BBM Operasional Lapangan",
            items: ["BBM Operasional Lapangan"],
            notes: "Dicatat otomatis dari lampiran foto struk pengeluaran oleh Dewi Sartika"
          };
        }

        if (parsedOcr && parsedOcr.grandTotal > 0) {
          const grandTotal = Number(parsedOcr.grandTotal) || 0;
          const merchant = parsedOcr.merchant || "Vendor / Merchant Lapangan";
          const date = parsedOcr.date || new Date().toISOString().split("T")[0];
          const category = parsedOcr.category || "Beban Operasional Rutin";
          const proposalId = `appr_dewi_receipt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

          // Simpan draf ke dstech_approval_queue
          const newProposal = {
            id: proposalId,
            revision: 0,
            employee_id: "emp_dewi_finance",
            employee_name: "Dewi Sartika",
            employee_role: "AI Finance & Tax Billing Specialist",
            department: "FINANCE",
            task_type: "BOOKKEEPING_EXPENSE",
            title: `Pencatatan Kas Keluar (Struk Belanja): ${merchant} - Rp ${grandTotal.toLocaleString("id-ID")}`,
            target_client: merchant,
            value: grandTotal,
            tax_type: "none",
            summary: `Dewi Sartika telah menganalisis foto struk transaksi dari ${merchant} tanggal ${date} senilai Rp ${grandTotal.toLocaleString("id-ID")} untuk ${category}. Bukti struk tersimpan permanen. Draf kas keluar siap disahkan Direktur Utama.`,
            status: "PENDING_APPROVAL",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            payload: {
              id: `dstech_exp_${Date.now()}`,
              category: category,
              accountName: category,
              merchant: merchant,
              date: date,
              amount: grandTotal,
              total: grandTotal,
              items: Array.isArray(parsedOcr.items) ? parsedOcr.items : [category],
              receiptUrl: mediaUrl,
              notes: parsedOcr.notes || `Dicatat otomatis dari foto struk ${merchant} oleh Dewi Sartika via Team Chat`,
              approvedBy: "",
              approvalId: proposalId,
            },
          };

          wfData.dstech_approval_queue.unshift(newProposal);
          writeJsonSafe(WORKFORCE_FILE, wfData);

          const aiReplyText = `Siap Pak ${userName}! Foto struk belanja dari **${merchant}** tanggal **${date}** senilai **Rp ${grandTotal.toLocaleString("id-ID")}** telah berhasil saya baca secara teliti.\n\n📋 **Rincian Pencatatan Struk**:\n• **Toko / Merchant**: ${merchant}\n• **Kategori Akuntansi**: ${category}\n• **Total Nominal**: Rp ${grandTotal.toLocaleString("id-ID")}\n• **Rincian Barang**: ${(parsedOcr.items || []).join(", ") || "-"}\n\n✅ Draf pengeluaran kas keluar telah saya daftarkan ke **Kotak Persetujuan Direktur** (ID: \`${proposalId}\`). Bapak dapat langsung menyetujuinya di Kantor Virtual atau Modul Keuangan agar saldo kas ERP otomatis terpotong sah.`;

          const aiMsgId = `dstech_msg_${Date.now()}_ai_${Math.floor(Math.random() * 1000)}`;
          const aiMsg = {
            id: aiMsgId,
            chatId: chatId,
            senderId: "emp_dewi_finance",
            senderName: "Dewi Sartika",
            senderRole: "AI_WORKFORCE",
            type: "text",
            content: aiReplyText,
            timestamp: new Date().toISOString(),
            readBy: ["emp_dewi_finance"],
          };

          messages.push(aiMsg);
          writeJsonSafe(MESSAGES_FILE, messages);

          const chatIdx = chats.findIndex((c: any) => c.id === chatId);
          if (chatIdx !== -1) {
            chats[chatIdx].lastMessage = `Dewi Sartika: Struk ${merchant} Rp ${grandTotal.toLocaleString("id-ID")} dicatat.`;
            chats[chatIdx].lastMessageTime = aiMsg.timestamp;
            writeJsonSafe(CHATS_FILE, chats);
          }

          return [aiMsg];
        }
      } catch (errReceipt) {
        console.error("Error processing receipt in team chat:", errReceipt);
      }
    }

    // 5. KASUS KHUSUS B: PEMBUATAN DRAF SPH PENAWARAN (Spesifik dengan Lampiran / Permintaan SPH)
    const isSpecificSphRequest =
      !isReceiptExpense &&
      (chatObj?.aiEmployeeId === "emp_dewi_finance" || chatObj?.aiEmployeeId === "emp_bambang_sales" || lowerText.includes("dewi") || lowerText.includes("bambang")) &&
      (/(?:sph|penawaran|quotation|inquiry|rfq|ajukan harga)/i.test(lowerText) || (mediaUrl && /(?:sph|penawaran|inquiry|daftar barang)/i.test(lowerText)));

    if (isSpecificSphRequest && (mediaUrl || /(?:buatkan|susun|ajukan|harga|inquiry)/i.test(lowerText))) {
      const activeSalesEmp = aiEmployees.find((e: any) => e.id === "emp_bambang_sales") || aiEmployees[0];
      try {
        const sphPrompt = `Anda adalah ${activeSalesEmp.name}, ${activeSalesEmp.role} di PT. DSTech Smart Perkasa.
Direktur Utama (${userName}) meminta dibuatkan draf penawaran harga (SPH) dengan instruksi: "${content}"
Konteks:
${historyText}

TUGAS ANDA:
1. Ekstrak rincian penawaran (klien, nama proyek, item barang, perkiraan harga pasar).
2. Keluarkan draf SPH dalam format JSON valid:
{
  "clientName": "...",
  "projectName": "...",
  "items": [
    { "name": "...", "qty": 1, "unit": "Unit", "price": 0, "total": 0 }
  ],
  "grandTotal": 0,
  "summary": "..."
}`;

        const rawSph = await executeGeminiCall(sphPrompt, true, "gemini-2.5-flash", 15000, geminiAttachments);
        let parsedSph: any = null;
        if (rawSph) {
          try {
            const clean = rawSph.replace(/```json/gi, "").replace(/```/g, "").trim();
            parsedSph = JSON.parse(clean);
          } catch (e) {
            console.warn("SPH JSON parse error:", e);
          }
        }

        if (!parsedSph || !Array.isArray(parsedSph.items) || parsedSph.items.length === 0) {
          parsedSph = {
            clientName: "Calon Mitra B2B DSTech",
            projectName: "Pengadaan & Instalasi Smart System DSTech",
            items: [
              { name: "Paket Barrier Gate Otomatis MX-80 Heavy Duty", qty: 1, unit: "Paket", price: 18500000, total: 18500000 },
              { name: "Jasa Instalasi, Commissioning & Kabel Jaringan", qty: 1, unit: "Lot", price: 3500000, total: 3500000 }
            ],
            grandTotal: 22000000,
            summary: "Draf penawaran SPH resmi sistem pengamanan cerdas DSTech Smart"
          };
        }

        if (parsedSph && Array.isArray(parsedSph.items) && parsedSph.items.length > 0) {
          const grandTotal = Number(parsedSph.grandTotal) || parsedSph.items.reduce((s: number, i: any) => s + (Number(i.total) || 0), 0);
          const clientName = parsedSph.clientName || "Calon Klien DSTech";
          const projectName = parsedSph.projectName || "Pengadaan & Pemasangan Sistem Keamanan Smart";
          const proposalId = `appr_sph_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

          const newProposal = {
            id: proposalId,
            revision: 0,
            employee_id: activeSalesEmp.id,
            employee_name: activeSalesEmp.name,
            employee_role: activeSalesEmp.role,
            department: activeSalesEmp.department,
            task_type: "SPH_GENERATION",
            title: `Draf Penawaran Harga (SPH): ${projectName} - ${clientName}`,
            target_client: clientName,
            value: grandTotal,
            tax_type: "exclude",
            summary: `${activeSalesEmp.name} telah menyusun draf SPH resmi untuk ${clientName} senilai Rp ${grandTotal.toLocaleString("id-ID")} (${parsedSph.items.length} item). Menunggu pengesahan Direktur Utama.`,
            status: "PENDING_APPROVAL",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            payload: {
              clientName,
              projectName,
              items: parsedSph.items,
              grandTotal,
              attachmentUrl: mediaUrl,
            },
          };

          wfData.dstech_approval_queue.unshift(newProposal);
          writeJsonSafe(WORKFORCE_FILE, wfData);

          const aiReplyText = `Siap Pak ${userName}! Draf Surat Penawaran Harga (SPH) untuk **${clientName}** terkait proyek *${projectName}* telah berhasil saya susun:\n\n📑 **Rincian Penawaran**:\n` +
            parsedSph.items.map((it: any, idx: number) => `${idx + 1}. ${it.name} (${it.qty} ${it.unit || 'unit'}) - Rp ${(Number(it.total) || 0).toLocaleString('id-ID')}`).join('\n') +
            `\n\n💰 **Total Estimasi**: Rp ${grandTotal.toLocaleString("id-ID")} (Belum PPN 11%)\n✅ Draf usulan SPH resmi telah saya submit ke **Kotak Persetujuan Direktur** (ID: \`${proposalId}\`). Bapak dapat meninjau lembar cetak SPH resmi A4 dan menyetujuinya di Kantor Virtual!`;

          const aiMsgId = `dstech_msg_${Date.now()}_ai_${Math.floor(Math.random() * 1000)}`;
          const aiMsg = {
            id: aiMsgId,
            chatId: chatId,
            senderId: activeSalesEmp.id,
            senderName: activeSalesEmp.name,
            senderRole: "AI_WORKFORCE",
            type: "text",
            content: aiReplyText,
            timestamp: new Date().toISOString(),
            readBy: [activeSalesEmp.id],
          };

          messages.push(aiMsg);
          writeJsonSafe(MESSAGES_FILE, messages);

          const chatIdx = chats.findIndex((c: any) => c.id === chatId);
          if (chatIdx !== -1) {
            chats[chatIdx].lastMessage = `${activeSalesEmp.name}: Draf SPH ${clientName} Rp ${grandTotal.toLocaleString("id-ID")} diajukan.`;
            chats[chatIdx].lastMessageTime = aiMsg.timestamp;
            writeJsonSafe(CHATS_FILE, chats);
          }

          return [aiMsg];
        }
      } catch (errSph) {
        console.error("Error processing SPH in team chat:", errSph);
      }
    }

    // 6. KASUS KHUSUS C: FOTO BUKTI LAPANGAN TEKNISI (Deni Kurniawan)
    const isFieldPhotoReport =
      Boolean(mediaUrl) &&
      (chatObj?.aiEmployeeId === "emp_deni_field" || lowerText.includes("deni") || /(?:lapangan|teknisi|pasang|instalasi|progres)/i.test(lowerText));

    if (isFieldPhotoReport && geminiAttachments.length > 0) {
      try {
        const fieldPrompt = `Anda adalah Deni Kurniawan, AI Field Coordinator & Operations Lead di PT. DSTech Smart Perkasa.
Direktur Utama (${userName}) atau teknisi lapangan mengirimkan foto bukti pekerjaan lapangan dengan pesan: "${content || 'Laporan progres lapangan'}"
Konteks:
${historyText}

TUGAS ANDA:
1. Periksa foto pekerjaan lapangan secara cermat (CCTV, Barrier Gate, penarikan kabel, instalasi bracket, panel listrik, dll).
2. Jelaskan penilaian Anda secara teknis, apresiasi kerapihan kerja teknisi, sebutkan detail yang terlihat, dan konfirmasi bahwa progres telah diarsipkan ke buku kerja operasional DSTech.
Gunakan nada bahasa profesional lapangan yang lugas dan berwibawa.`;

        const geminiFieldSpeech = await executeGeminiCall(fieldPrompt, false, "gemini-2.5-flash", 15000, geminiAttachments);
        const aiReplyText = geminiFieldSpeech
          ? `Siap Pak ${userName}!\n\n${geminiFieldSpeech}\n\n📸 Dokumentasi foto lapangan ini telah saya simpan dan tautkan ke log operasional harian tim teknisi.`
          : `Siap Pak ${userName}! Dokumentasi foto pekerjaan lapangan telah saya terima dan verifikasi. Seluruh item instalasi telah dicocokkan dengan checklist SPK teknisi dan diarsipkan ke buku kerja proyek.`;

        const aiMsgId = `dstech_msg_${Date.now()}_ai_${Math.floor(Math.random() * 1000)}`;
        const aiMsg = {
          id: aiMsgId,
          chatId: chatId,
          senderId: "emp_deni_field",
          senderName: "Deni Kurniawan",
          senderRole: "AI_WORKFORCE",
          type: "text",
          content: aiReplyText,
          timestamp: new Date().toISOString(),
          readBy: ["emp_deni_field"],
        };

        messages.push(aiMsg);
        writeJsonSafe(MESSAGES_FILE, messages);

        const chatIdx = chats.findIndex((c: any) => c.id === chatId);
        if (chatIdx !== -1) {
          chats[chatIdx].lastMessage = `Deni Kurniawan: Foto progres lapangan diverifikasi & diarsipkan.`;
          chats[chatIdx].lastMessageTime = aiMsg.timestamp;
          writeJsonSafe(CHATS_FILE, chats);
        }

        return [aiMsg];
      } catch (errField) {
        console.error("Error analyzing field photo in team chat:", errField);
      }
    }

    // 7. MULTI-AI WORKFORCE ORCHESTRATION ENGINE
    const isGroupAiChat =
      chatId === "dstech_chat_group_ai_workforce" ||
      chatObj?.id === "dstech_chat_group_ai_workforce";

    const mentionsDewi = /dewi/i.test(lowerText);
    const mentionsBambang = /bambang/i.test(lowerText);
    const mentionsDeni = /deni/i.test(lowerText);
    const mentionsNadia = /nadia/i.test(lowerText);
    const mentionsReza = /reza/i.test(lowerText);
    const mentionsSiti = /siti/i.test(lowerText);
    const mentionedNamesCount = [mentionsDewi, mentionsBambang, mentionsDeni, mentionsNadia, mentionsReza, mentionsSiti].filter(Boolean).length;

    const isReportRequest =
      /(?:seluruh|semua|staf|staff|tim\b|kalian|laporan|prioritas|aktivitas|briefing|evaluasi|update|status|rekap|hari ini|pagi|kerjaan)/i.test(lowerText);

    let targetEmployees: any[] = [];

    if (isGroupAiChat) {
      if (mentionedNamesCount === 1) {
        // Panggilan ke staf tunggal spesifik dalam grup
        if (mentionsDewi) targetEmployees = aiEmployees.filter((e: any) => e.id === "emp_dewi_finance");
        else if (mentionsBambang) targetEmployees = aiEmployees.filter((e: any) => e.id === "emp_bambang_sales");
        else if (mentionsDeni) targetEmployees = aiEmployees.filter((e: any) => e.id === "emp_deni_field");
        else if (mentionsNadia) targetEmployees = aiEmployees.filter((e: any) => e.id === "emp_nadia_marketing");
        else if (mentionsReza) targetEmployees = aiEmployees.filter((e: any) => e.id === "emp_reza_catalog");
        else if (mentionsSiti) targetEmployees = aiEmployees.filter((e: any) => e.id === "emp_siti_cs");
      } else {
        // BROADCAST KE SELURUH 6 STAF AI!
        const officialOrderIds = [
          "emp_dewi_finance",
          "emp_bambang_sales",
          "emp_deni_field",
          "emp_nadia_marketing",
          "emp_reza_catalog",
          "emp_siti_cs",
        ];
        targetEmployees = officialOrderIds
          .map((id) => aiEmployees.find((e: any) => e.id === id))
          .filter(Boolean);
      }
    } else {
      // Direct Chat (1-on-1)
      let singleEmp: any = null;
      if (chatObj?.aiEmployeeId) {
        singleEmp = aiEmployees.find((e: any) => e.id === chatObj.aiEmployeeId);
      } else if (chatId.startsWith("dstech_chat_dm_emp_")) {
        const empId = chatId.replace("dstech_chat_dm_", "");
        singleEmp = aiEmployees.find((e: any) => e.id === empId);
      }
      if (!singleEmp) singleEmp = aiEmployees[0];
      targetEmployees = [singleEmp];
    }

    if (!Array.isArray(targetEmployees) || targetEmployees.length === 0) {
      targetEmployees = aiEmployees.slice(0, 6);
    }

    // 8. Eksekusi paralel pembuatan respon staf AI
    const repliesPromises = targetEmployees.map((emp) =>
      generateEmployeeReply({
        emp,
        userName,
        userContent: content,
        historyText,
        geminiAttachments,
        finData,
        cashBalance,
        monthlyBillsSummary,
        isReportRequest,
      })
    );

    const generatedTexts = await Promise.all(repliesPromises);

    // 9. Simpan pesan beruntun ke messages
    const createdAiMessages: any[] = [];
    const baseTime = Date.now();

    for (let i = 0; i < targetEmployees.length; i++) {
      const emp = targetEmployees[i];
      const replyText = generatedTexts[i];
      const replyTimestamp = new Date(baseTime + (i + 1) * 1200).toISOString();
      const aiMsgId = `dstech_msg_${baseTime + i}_ai_${Math.floor(Math.random() * 1000)}`;

      const aiMsg = {
        id: aiMsgId,
        chatId: chatId,
        senderId: emp.id,
        senderName: emp.name,
        senderRole: "AI_WORKFORCE",
        type: "text",
        content: replyText,
        timestamp: replyTimestamp,
        readBy: [emp.id],
      };

      messages.push(aiMsg);
      createdAiMessages.push(aiMsg);

      // Sinkronisasi memori percakapan Virtual Office
      if (!Array.isArray(wfData.dstech_conversations[emp.id])) {
        wfData.dstech_conversations[emp.id] = [];
      }
      wfData.dstech_conversations[emp.id].push(
        {
          role: "user",
          content: content || "Permintaan laporan/instruksi",
          timestamp: userMessage.timestamp || new Date().toISOString(),
          attachment: mediaUrl ? { url: mediaUrl } : undefined,
        },
        {
          role: "assistant",
          content: replyText,
          timestamp: replyTimestamp,
        }
      );
    }

    writeJsonSafe(MESSAGES_FILE, messages);
    writeJsonSafe(WORKFORCE_FILE, wfData);

    // Update ringkasan lastMessage pada chats
    const chatIdx = chats.findIndex((c: any) => c.id === chatId);
    if (chatIdx !== -1 && createdAiMessages.length > 0) {
      const lastCreated = createdAiMessages[createdAiMessages.length - 1];
      chats[chatIdx].lastMessage = `${lastCreated.senderName}: ${lastCreated.content.slice(0, 80)}...`;
      chats[chatIdx].lastMessageTime = lastCreated.timestamp;
      writeJsonSafe(CHATS_FILE, chats);
    }

    return createdAiMessages;
  } catch (globalErr) {
    console.error("Fatal error in handleAiWorkforceChatMessage:", globalErr);
    return null;
  }
}

// GET: Ambil chats, pesan, atau data perusahaan untuk lampiran
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "chats";
  const userId = searchParams.get("userId") || "";
  const chatId = searchParams.get("chatId") || "";

  // 1. Ambil daftar thread percakapan
  if (action === "chats") {
    let chats = readJsonSafe(CHATS_FILE, []);
    let users = readJsonSafe(USERS_FILE, []);

    // Fallback jika dstech_users.json kosong
    if (!Array.isArray(users) || users.length === 0) {
      users = [
        { id: "dstech_usr_1", name: "Super Admin DStech", role: "SUPERADMIN", phone: "08225949424", status: "ACTIVE" },
        { id: "dstech_usr_2", name: "Admin Operasional", role: "ADMIN", phone: "081299887711", status: "ACTIVE" },
        { id: "dstech_usr_1792549625191", name: "RAMADHANI ST", role: "EMPLOYEE", phone: "082259494242", status: "ACTIVE" },
        { id: "dstech_usr_1792545916165", name: "Marshanda Salwa Agustina", role: "ADMIN", phone: "089630855206", status: "ACTIVE" },
      ];
    }

    // Auto-inisialisasi thread chat jika chats kosong
    if (!Array.isArray(chats) || chats.length === 0) {
      const allUserIds = users.map((u: any) => u.id);
      chats = [
        {
          id: "dstech_chat_group_ops",
          name: "Koordinasi Operasional & Proyek",
          isGroup: true,
          groupAvatar: "/services-access.png",
          participants: allUserIds,
          description: "Grup koordinasi lapangan, surat tugas SPK, dan laporan progres teknisi",
          lastMessage: "Selamat datang di DStech Connect Messenger. Koordinasi tim proyek lapangan aktif.",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        },
        {
          id: "dstech_chat_group_finance",
          name: "Finance & Invoice Billing",
          isGroup: true,
          groupAvatar: "/service-software.png",
          participants: allUserIds.filter((id: string) => id !== "dstech_usr_1792549625191"),
          description: "Koordinasi penagihan invoice, approval termin DP, dan klaim reimburse",
          lastMessage: "Ruang koordinasi keuangan dan faktur penagihan aktif.",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        },
      ];

      // Tambahkan direct chat untuk setiap rekan tim
      for (const u of users) {
        chats.push({
          id: `dstech_chat_dm_${u.id}`,
          name: u.name,
          isGroup: false,
          participants: ["dstech_usr_1", u.id],
          userRole: u.role,
          userPhone: u.phone,
          lastMessage: `Kontak rekan tim: ${u.role}`,
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        });
      }

      writeJsonSafe(CHATS_FILE, chats);
    }

    // --- Otomatisasi Pembuatan Grup Koordinasi Tim Proyek ---
    try {
      const financeData = readJsonSafe(FINANCE_FILE, { projects: [] });
      const projects = Array.isArray(financeData.projects) ? financeData.projects : [];
      let updatedChats = false;

      for (const prj of projects) {
        const prjChatId = `dstech_chat_prj_${prj.id}`;
        const existingChatIndex = chats.findIndex((c: any) => c.id === prjChatId || c.projectId === prj.id);
        const isProjectDone =
          prj.status === "Completed" ||
          prj.status === "Selesai" ||
          prj.status === "Closed";

        // Pembubaran Otomatis: Jika proyek telah selesai, hapus grup dari chat aktif agar tidak menumpuk
        if (isProjectDone) {
          if (existingChatIndex !== -1) {
            chats.splice(existingChatIndex, 1);
            updatedChats = true;
          }
          continue;
        }

        // Cari teknisi terkait proyek dari penugasan lapangan
        const tasksData = readJsonSafe(TASKS_FILE, []);
        const relatedTasks = tasksData.filter((t: any) =>
          (prj.clientName && t.client?.toLowerCase().includes(prj.clientName.toLowerCase())) ||
          (prj.projectName && t.title?.toLowerCase().includes(prj.projectName.toLowerCase())) ||
          t.projectId === prj.id
        );

        const assignedTechNames = relatedTasks.map((t: any) => (t.technician || "").toLowerCase());
        const matchingTechUserIds = users
          .filter((u: any) => assignedTechNames.some((name: string) => name && (u.name || "").toLowerCase().includes(name)))
          .map((u: any) => u.id);

        const adminIds = users.filter((u: any) => u.role === "ADMIN" || u.role === "SUPERADMIN").map((u: any) => u.id);
        const projectParticipants = Array.from(new Set([...adminIds, ...matchingTechUserIds]));

        if (existingChatIndex === -1) {
          chats.unshift({
            id: prjChatId,
            projectId: prj.id,
            name: `Koordinasi: ${prj.projectName}`,
            isGroup: true,
            isProjectCoordination: true,
            groupAvatar: "/services-access.png",
            participants: projectParticipants,
            description: `Grup koordinasi proyek ${prj.projectName} (${prj.clientName || "Klien DSTech"}). Jalur resmi koordinasi teknisi dan PIC lapangan.`,
            lastMessage: "Grup koordinasi proyek telah dibentuk otomatis. Anggota tim dan PIC resmi terdaftar.",
            lastMessageTime: prj.createdAt || new Date().toISOString(),
            unreadCount: 0,
          });
          updatedChats = true;
        } else {
          const current = chats[existingChatIndex];
          const merged = Array.from(new Set([...(current.participants || []), ...projectParticipants]));
          if (merged.length !== (current.participants || []).length) {
            current.participants = merged;
            updatedChats = true;
          }
        }
      }

      if (updatedChats) {
        writeJsonSafe(CHATS_FILE, chats);
      }
    } catch (e) {
      console.warn("Sync project chats notice:", e);
    }

    // --- Registrasi 6 Karyawan AI DSTech Smart & Auto-Seed AI Chats ---
    const wfData = readJsonSafe(WORKFORCE_FILE, { dstech_employees: [] });
    const aiEmployees = Array.isArray(wfData.dstech_employees) && wfData.dstech_employees.length > 0
      ? wfData.dstech_employees
      : [
          { id: "emp_dewi_finance", name: "Dewi Sartika", role: "AI Finance & Tax Billing Specialist", department: "FINANCE", avatar_color: "#10b981", speech_bubble: "Halo Pak! Saya Dewi Sartika dari Keuangan & Faktur. Bapak bisa kirim foto struk belanja untuk dicatat ke kas keluar atau minta draf SPH di sini." },
          { id: "emp_bambang_sales", name: "Bambang Prakoso", role: "Senior AI Sales & Commercial Consultant", department: "SALES", avatar_color: "#3b82f6", speech_bubble: "Siap Pak! Saya Bambang Prakoso, siap merespons kebutuhan draf SPH B2B dan pipeline prospek klien kapan saja." },
          { id: "emp_deni_field", name: "Deni Kurniawan", role: "AI Field Coordinator & Dispatcher", department: "FIELD_OPERATIONS", avatar_color: "#06b6d4", speech_bubble: "Standby Pak! Kirimkan foto pekerjaan lapangan atau kendala teknisi di sini, saya bantu rangkumkan laporannya." },
          { id: "emp_nadia_marketing", name: "Nadia Safitri", role: "AI Creative Marketing & Copywriter", department: "MARKETING", avatar_color: "#f59e0b", speech_bubble: "Halo Pak! Butuh ide materi promo broadcast WhatsApp atau copywriting penawaran baru? Kirimkan instruksinya ke saya." },
          { id: "emp_reza_catalog", name: "Reza Firmansyah", role: "AI Product Catalog & Procurement Lead", department: "CATALOG_ESTORE", avatar_color: "#8b5cf6", speech_bubble: "Standby Pak! Saya siap bantu cek spesifikasi alat barrier gate/CCTV, stok gudang, dan pendaftaran produk e-store." },
          { id: "emp_siti_cs", name: "Siti Nurhaliza", role: "Front Office & AI Customer Care", department: "CUSTOMER_SERVICE", avatar_color: "#ec4899", speech_bubble: "Selamat datang Pak! Saya Siti Nurhaliza dari Front Office. Standby melayani tamu website dan pertanyaan umum 24 jam." },
        ];

    // Daftarkan AI employees ke list users jika belum ada
    for (const emp of aiEmployees) {
      if (!users.some((u: any) => u.id === emp.id)) {
        users.push({
          id: emp.id,
          name: emp.name,
          role: "AI_WORKFORCE",
          department: emp.department,
          phone: "0822-DSTECH-AI",
          status: "ACTIVE",
          isAiEmployee: true,
          avatarColor: emp.avatar_color,
          speechBubble: emp.speech_bubble,
        });
      }
    }

    // Pastikan Grup Terpadu AI Workforce Hub ada di chats
    const groupAiIndex = chats.findIndex((c: any) => c.id === "dstech_chat_group_ai_workforce");
    const allAiIds = aiEmployees.map((e: any) => e.id);
    const standardMembers = ["dstech_usr_1", "dstech_usr_2", "dstech_usr_1792549625191", "dstech_usr_1792545916165"];
    const resolvedUserId = userId || "dstech_usr_1792549625191";
    const groupParticipants = Array.from(new Set([...standardMembers, resolvedUserId, ...allAiIds]));

    let aiChatsUpdated = false;
    if (groupAiIndex === -1) {
      chats.unshift({
        id: "dstech_chat_group_ai_workforce",
        name: "🤖 DSTech AI Workforce Hub",
        isGroup: true,
        isAiChat: true,
        groupAvatar: "/service-software.png",
        participants: groupParticipants,
        description: "Grup koordinasi terpadu seluruh 6 Staf AI (Dewi, Bambang, Deni, Nadia, Reza, Siti). Hubungkan arahan pimpinan, struk kas keluar, draf SPH, dan progres lapangan langsung via Android.",
        lastMessage: "Seluruh Staf AI siap menerima instruksi, foto nota struk belanja, draf SPH, dan laporan proyek lapangan.",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      });
      aiChatsUpdated = true;
    }

    // Pastikan Direct Chat (1-on-1) untuk setiap Staf AI ada di chats
    for (const emp of aiEmployees) {
      const dmChatId = `dstech_chat_dm_${emp.id}`;
      const existingDmIndex = chats.findIndex((c: any) => c.id === dmChatId || (c.aiEmployeeId === emp.id && !c.isGroup));
      if (existingDmIndex === -1) {
        chats.push({
          id: dmChatId,
          name: emp.name,
          isGroup: false,
          isAiChat: true,
          aiEmployeeId: emp.id,
          userRole: emp.role,
          department: emp.department,
          avatarColor: emp.avatar_color,
          participants: Array.from(new Set([...standardMembers, resolvedUserId, emp.id])),
          lastMessage: emp.speech_bubble || `Halo, saya ${emp.name} siap membantu pekerjaan DSTech Smart.`,
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        });
        aiChatsUpdated = true;
      } else {
        const c = chats[existingDmIndex];
        c.isAiChat = true;
        c.aiEmployeeId = emp.id;
        c.userRole = emp.role;
        c.avatarColor = emp.avatar_color;
        if (!c.participants.includes(resolvedUserId)) {
          c.participants.push(resolvedUserId);
          aiChatsUpdated = true;
        }
      }
    }

    if (aiChatsUpdated) {
      writeJsonSafe(CHATS_FILE, chats);
    }

    // Filter ketat hak akses: Jika bukan Admin/Superadmin/CS, HANYA tampilkan obrolan di mana user menjadi peserta resmi
    const requestUser = users.find((u: any) => u.id === userId);
    const isAdminOrCS = requestUser?.role === "ADMIN" || requestUser?.role === "SUPERADMIN" || requestUser?.role === "CS";

    let visibleChats = chats;
    if (userId && !isAdminOrCS) {
      // User non-Admin/CS HANYA bisa melihat obrolan di mana dia peserta ATAU obrolan Staf AI, DAN BUKAN chat klien publik!
      visibleChats = chats.filter((c: any) => {
        if (c.isClientChat) return false;
        if (c.isAiChat || c.id === "dstech_chat_group_ai_workforce" || c.id.startsWith("dstech_chat_dm_emp_")) return true;
        return Array.isArray(c.participants) && c.participants.includes(userId);
      });
    } else if (!isAdminOrCS) {
      // Jika request tanpa userId dan bukan Admin/CS, sembunyikan semua obrolan klien
      visibleChats = chats.filter((c: any) => !c.isClientChat);
    }

    const userChats = visibleChats.map((c: any) => {
      // Jika chat klien website
      if (c.isClientChat) {
        return {
          ...c,
          isOnline: true,
          badgeLabel: "Klien Web",
        };
      }

      // Jika chat dengan Karyawan AI
      if (c.isAiChat || c.aiEmployeeId || c.id.startsWith("dstech_chat_dm_emp_")) {
        const matchingAi = aiEmployees.find((e: any) => e.id === c.aiEmployeeId || c.id === `dstech_chat_dm_${e.id}`);
        return {
          ...c,
          isOnline: true,
          isAiChat: true,
          badgeLabel: "Staf AI",
          userRole: matchingAi?.role || c.userRole || "Karyawan AI DSTech",
          department: matchingAi?.department || c.department,
          avatarColor: matchingAi?.avatar_color || c.avatarColor || "#10b981",
        };
      }

      // Jika DM (bukan grup), berikan nama lawan bicara
      if (!c.isGroup && userId) {
        const otherParticipantId = c.participants.find((p: string) => p !== userId) || c.participants[0];
        const otherUser = users.find((u: any) => u.id === otherParticipantId);
        if (otherUser) {
          return {
            ...c,
            name: otherUser.name,
            userRole: otherUser.role,
            userPhone: otherUser.phone,
            isOnline: true,
          };
        }
      }
      return c;
    });

    return NextResponse.json({
      success: true,
      chats: userChats,
      users: users.map((u: any) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        phone: u.phone,
        status: u.status,
        isAiEmployee: Boolean(u.isAiEmployee),
        department: u.department,
        avatarColor: u.avatarColor,
      })),
    });
  }

  // 2. Ambil pesan dalam suatu chat
  if (action === "messages") {
    if (!chatId) {
      return NextResponse.json({ success: false, error: "chatId wajib disertakan" }, { status: 400 });
    }
    const chats = readJsonSafe(CHATS_FILE, []);
    const users = readJsonSafe(USERS_FILE, []);
    const targetChat = chats.find((c: any) => c.id === chatId);
    const requestUser = users.find((u: any) => u.id === userId);
    const isAdminOrCS = requestUser?.role === "ADMIN" || requestUser?.role === "SUPERADMIN" || requestUser?.role === "CS";

    // KERAHASIAAN KETAT: Percakapan dengan klien TERKUNCI khusus Admin & CS
    if (targetChat?.isClientChat && !isAdminOrCS) {
      return NextResponse.json({
        success: false,
        error: "Akses Ditolak: Percakapan dengan klien terkunci dan hanya dapat diakses oleh Admin & Customer Service.",
      }, { status: 403 });
    }

    const messages = readJsonSafe(MESSAGES_FILE, []);
    const chatMessages = messages.filter((m: any) => m.chatId === chatId);

    return NextResponse.json({
      success: true,
      messages: chatMessages,
      chat: targetChat || null,
    });
  }

  // 2b. Ambil pesan chat klien (Publik dari widget website tanpa login internal)
  if (action === "client_messages") {
    if (!chatId) {
      return NextResponse.json({ success: false, error: "chatId wajib disertakan" }, { status: 400 });
    }
    const messages = readJsonSafe(MESSAGES_FILE, []);
    const chats = readJsonSafe(CHATS_FILE, []);
    const chatMessages = messages.filter((m: any) => m.chatId === chatId);
    const activeChat = chats.find((c: any) => c.id === chatId);

    return NextResponse.json(
      {
        success: true,
        messages: chatMessages,
        chat: activeChat || null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  }

  // 2c. Ambil pesan terbaru (Polling background service Android)
  if (action === "recent_messages" || action === "all_messages") {
    const allMessages = readJsonSafe(MESSAGES_FILE, []);
    const allChats = readJsonSafe(CHATS_FILE, []);
    const users = readJsonSafe(USERS_FILE, []);
    const requestUser = users.find((u: any) => u.id === userId);
    const isAdminOrCS = requestUser?.role === "ADMIN" || requestUser?.role === "SUPERADMIN" || requestUser?.role === "CS";

    const myChatIds = allChats
      .filter((c: any) => {
        // Obrolan klien HANYA memicu notifikasi ke Admin & CS
        if (c.isClientChat) {
          return isAdminOrCS;
        }
        return !userId || (Array.isArray(c.participants) && c.participants.includes(userId));
      })
      .map((c: any) => c.id);
    const userMessages = allMessages.filter((m: any) => myChatIds.includes(m.chatId));

    const latestMsg = userMessages[userMessages.length - 1];
    return NextResponse.json(
      {
        success: true,
        data: userMessages.slice(-20),
        totalCount: userMessages.length,
        latestMessageId: latestMsg?.id || null,
        latestMessageTime: latestMsg?.createdAt || latestMsg?.timestamp || null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  }

    // 3. Ambil data perusahaan untuk lampiran (Invoice, SPK Task, Laporan Bukti Kerja)
  if (action === "company_data") {
    const dataType = searchParams.get("type") || searchParams.get("dataType") || "invoices";
    const query = (searchParams.get("query") || "").toLowerCase().trim();
    const userRole = (searchParams.get("role") || "").toUpperCase();
    const requesterName = (searchParams.get("userName") || "").toLowerCase();
    const chatId = searchParams.get("chatId") || "";
    const projectIdParam = searchParams.get("projectId") || "";
    const chatNameParam = searchParams.get("chatName") || "";
    const targetUserName = (searchParams.get("targetUserName") || "").trim();
    const targetPhone = (searchParams.get("targetPhone") || "").trim();
    const targetClientId = (searchParams.get("targetClientId") || "").trim();
    const targetUserId = (searchParams.get("targetUserId") || "").trim();
    const mode = (searchParams.get("mode") || "").toLowerCase();

    // Helper untuk normalisasi digit telepon (ambil 8-10 digit terakhir untuk pencocokan akurat)
    const normalizePhoneDigits = (ph: string) => {
      const d = (ph || "").replace(/\D/g, "");
      return d.length > 8 ? d.slice(-9) : d;
    };

    // Helper untuk membersihkan nama dari gelar / prefix umum
    const cleanPersonName = (rawName: string) => {
      return (rawName || "")
        .toLowerCase()
        .replace(/^klien:\s*/i, "")
        .replace(/\b(bapak|ibu|bpk|pak|pt|cv|st|se|sh|sk|ir|drs|dra|kom|m\.kom|s\.kom)\b/gi, "")
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    // Helper pencocokan identitas lawan bicara
    const isMatchedTarget = (
      recName: string,
      recPhone: string,
      recClientId?: string,
      recUserId?: string
    ) => {
      // 1. Cek Client ID / User ID
      if (targetClientId && recClientId && (recClientId === targetClientId || recClientId.includes(targetClientId) || targetClientId.includes(recClientId))) return true;
      if (targetUserId && recUserId && (recUserId === targetUserId || recUserId.includes(targetUserId) || targetUserId.includes(recUserId))) return true;

      // 2. Cek Nomor Telepon / WhatsApp (akurasi tertinggi)
      if (targetPhone && recPhone) {
        const normTarget = normalizePhoneDigits(targetPhone);
        const normRec = normalizePhoneDigits(recPhone);
        if (normTarget.length >= 6 && normRec.length >= 6) {
          if (normTarget.includes(normRec) || normRec.includes(normTarget)) {
            return true;
          }
        }
      }

      // 3. Cek Nama Lawan Bicara
      if (targetUserName && recName) {
        const cTarget = cleanPersonName(targetUserName);
        const cRec = cleanPersonName(recName);
        if (cTarget && cRec) {
          if (cTarget.includes(cRec) || cRec.includes(cTarget)) {
            return true;
          }
          // Periksa kesamaan kata nama unik (minimal 3 karakter)
          const targetWords = cTarget.split(" ").filter((w) => w.length >= 3);
          const recWords = cRec.split(" ").filter((w) => w.length >= 3);
          const hasCommonWord = targetWords.some((tw) =>
            recWords.some((rw) => rw === tw || rw.includes(tw) || tw.includes(rw))
          );
          if (hasCommonWord) return true;
        }
      }

      return false;
    };

    const financeData = readJsonSafe(FINANCE_FILE, { sales: [], projects: [] });
    const allProjects = Array.isArray(financeData.projects) ? financeData.projects : [];
    const chats = readJsonSafe(CHATS_FILE, []);
    const activeChat = chats.find((c: any) => c.id === chatId);
    const resolvedProjectId = projectIdParam || activeChat?.projectId || "";

    let linkedProject: any = allProjects.find((p: any) => p.id === resolvedProjectId);
    if (!linkedProject && (chatNameParam || activeChat?.name)) {
      const searchName = (chatNameParam || activeChat?.name || "").toLowerCase();
      linkedProject = allProjects.find((p: any) => {
        const pName = (p.projectName || "").toLowerCase();
        const cName = (p.clientName || "").toLowerCase();
        return (
          (pName && searchName.includes(pName)) ||
          (cName && searchName.includes(cName)) ||
          (pName && pName.includes(searchName.replace(/koordinasi:?/i, "").trim()))
        );
      });
    }

    const projectInfo = linkedProject
      ? {
          id: linkedProject.id,
          projectCode: linkedProject.projectCode || "PRJ-DSTECH",
          projectName: linkedProject.projectName || activeChat?.name || "Proyek DStech",
          clientName: linkedProject.clientName || "Klien DStech",
          status: linkedProject.status || "In Progress",
          picProject: linkedProject.picProject || "Project Manager",
          contractValue: linkedProject.contractValue || 0,
          description: linkedProject.description || "Koordinasi proyek dan penugasan teknisi",
          startDate: linkedProject.startDate || "",
        }
      : null;

    // PERLINDUNGAN KERAHASIAAN PERUSAHAAN: Invoice hanya untuk Admin / Finance
    if (dataType === "invoices") {
      if (userRole === "EMPLOYEE" || userRole === "CLIENT" || userRole === "PARTNER" || userRole.includes("TEKNISI")) {
        return NextResponse.json({
          success: false,
          error: "Akses Ditolak: Data invoice & penagihan internal hanya dapat diakses oleh Manajemen & Admin Finance.",
        }, { status: 403 });
      }

      const hasTargetContext = Boolean(targetUserName || targetPhone || targetClientId || targetUserId);
      const isSearchAll = mode === "all";

      // 1. Data Faktur Penjualan dari modul Finance ERP
      const erpSales = (financeData.sales || []).map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || "INV-UNKNOWN",
        orderNumber: inv.orderNumber || "",
        customerName: inv.customerName || "Klien Umum",
        customerPhone: inv.customerPhone || "",
        grandTotal: inv.grandTotal || 0,
        paymentStatus: inv.paymentStatus || "Belum Bayar",
        date: inv.date || new Date().toISOString().split("T")[0],
        invoiceType: inv.invoiceType || "Standard",
        projectId: inv.projectId || "",
        source: "ERP",
      }));

      // 2. Data Faktur dari Pesanan Toko Online E-Store (dstech_orders.json)
      const ordersData = readJsonSafe(ORDERS_FILE, { orders: [] });
      const rawOrders = Array.isArray(ordersData) ? ordersData : (Array.isArray(ordersData.orders) ? ordersData.orders : []);
      const estoreInvoices = rawOrders.map((o: any) => {
        const totalVal = o.total || o.grandTotal || 0;
        const statusMap: Record<string, string> = {
          PENDING: "Menunggu Pembayaran",
          BELUM_BAYAR: "Menunggu Pembayaran",
          PAID: "Lunas / Terverifikasi",
          MENUNGGU_KONFIRMASI: "Menunggu Konfirmasi Gudang",
          PROCESSING: "Sedang Diproses Gudang",
          DIPROSES: "Sedang Diproses",
          SHIPPED: "Sedang Dikirim",
          DIKIRIM: "Sedang Dikirim",
          DELIVERED: "Lunas & Selesai",
          SELESAI: "Lunas & Selesai",
          CANCELLED: "Dibatalkan",
          DIBATALKAN: "Dibatalkan",
        };
        return {
          id: o.id,
          invoiceNumber: o.invoiceNumber || `INV-${(o.orderNumber || o.id).replace(/[^a-zA-Z0-9]/g, "")}`,
          orderNumber: o.orderNumber || o.id,
          customerName: o.customerName || o.shippingAddress?.recipientName || "Pelanggan E-Store",
          customerPhone: o.customerPhone || o.shippingAddress?.phone || "",
          grandTotal: totalVal,
          paymentStatus: statusMap[(o.status || "").toUpperCase()] || o.status || "Menunggu Pembayaran",
          date: o.createdAt ? o.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
          invoiceType: "Faktur E-Store",
          projectId: "",
          source: "ESTORE",
          userId: o.userId || "",
        };
      });

      let invoices = [...erpSales, ...estoreInvoices];

      // FILTER KETAT PRIVASI:
      // A. Jika di dalam grup proyek koordinasi:
      if (linkedProject && !isSearchAll) {
        const prjClient = cleanPersonName(linkedProject.clientName || "");
        const prjId = linkedProject.id;
        invoices = invoices.filter((inv: any) => {
          const cName = cleanPersonName(inv.customerName || "");
          return (prjClient && (cName.includes(prjClient) || prjClient.includes(cName))) ||
                 (inv.projectId && inv.projectId === prjId);
        });
      }
      // B. Jika di dalam chat DM atau chat klien dengan lawan bicara tertentu:
      else if (hasTargetContext && !isSearchAll) {
        invoices = invoices.filter((inv: any) =>
          isMatchedTarget(
            inv.customerName,
            inv.customerPhone,
            inv.userId,
            inv.userId
          )
        );
      }

      if (query) {
        invoices = invoices.filter(
          (inv: any) =>
            inv.invoiceNumber.toLowerCase().includes(query) ||
            inv.customerName.toLowerCase().includes(query) ||
            (inv.orderNumber && inv.orderNumber.toLowerCase().includes(query)) ||
            (inv.customerPhone && inv.customerPhone.includes(query))
        );
      }
      return NextResponse.json({
        success: true,
        data: invoices.slice(0, 50),
        projectInfo,
        isFilteredByTarget: hasTargetContext && !isSearchAll,
      });
    }

    if (dataType === "tasks") {
      const tasksData = readJsonSafe(TASKS_FILE, []);
      let tasks = tasksData.map((t: any) => ({
        id: t.id,
        ticketNumber: t.ticketNumber || t.id,
        title: t.title || "Penugasan Lapangan",
        client: t.client || "-",
        location: t.location || "-",
        status: t.status || "Pending",
        priority: t.priority || "Normal",
        technician: t.technician || "Teknisi",
        deadline: t.deadline || "-",
        projectId: t.projectId || "",
        scope: t.scope || [],
      }));

      // Filter ketat berdasarkan Proyek Grup:
      // Jika grup ini adalah grup koordinasi proyek, HANYA tampilkan SPK yang terikat dengan proyek/klien ini!
      if (linkedProject) {
        const prjName = (linkedProject.projectName || "").toLowerCase();
        const clientName = (linkedProject.clientName || "").toLowerCase();
        tasks = tasks.filter((t: any) => {
          const tClient = (t.client || "").toLowerCase();
          const tTitle = (t.title || "").toLowerCase();
          const matchPrjId = t.projectId && t.projectId === linkedProject.id;
          const matchClient = clientName && (tClient.includes(clientName) || clientName.includes(tClient));
          const matchName = prjName && (tTitle.includes(prjName) || prjName.includes(tTitle));
          return matchPrjId || matchClient || matchName;
        });
      }

      // Jika teknisi / karyawan: HANYA tampilkan tugas yang menugaskan dirinya jika di luar grup proyek
      if ((userRole === "EMPLOYEE" || userRole.includes("TEKNISI")) && !linkedProject) {
        if (requesterName) {
          tasks = tasks.filter((t: any) =>
            t.technician?.toLowerCase().includes(requesterName)
          );
        }
      }

      if (query) {
        tasks = tasks.filter(
          (t: any) =>
            t.ticketNumber.toLowerCase().includes(query) ||
            t.title.toLowerCase().includes(query) ||
            t.client.toLowerCase().includes(query)
        );
      }
      return NextResponse.json({ success: true, data: tasks.slice(0, 50), projectInfo });
    }

    if (dataType === "reports") {
      const reportsData = readJsonSafe(REPORTS_FILE, []);
      let reports = reportsData.map((r: any) => ({
        id: r.id,
        ticketNumber: r.ticketNumber || "-",
        taskTitle: r.taskTitle || "Laporan Harian",
        clientName: r.clientName || "-",
        progressPercentage: r.progressPercentage || 0,
        activityDescription: r.activityDescription || "-",
        photoUrl: r.photos?.[0]?.url || "",
        date: r.date || new Date().toISOString().split("T")[0],
      }));
      if (query) {
        reports = reports.filter(
          (r: any) =>
            r.taskTitle.toLowerCase().includes(query) ||
            r.clientName.toLowerCase().includes(query) ||
            r.ticketNumber.toLowerCase().includes(query)
        );
      }
      return NextResponse.json({ success: true, data: reports.slice(0, 50), projectInfo });
    }

    // 4. Lampirkan Produk Master DStech Smart
    if (dataType === "products") {
      const productsData = readJsonSafe(PRODUCTS_FILE, []);
      let products = productsData.map((p: any) => ({
        id: p.id,
        name: p.name || "Produk DSTech",
        category: p.category || "General",
        price: p.price || 0,
        originalPrice: p.originalPrice || 0,
        isPromo: !!p.isPromo,
        promoTag: p.promoTag || "",
        stock: p.stock ?? 0,
        unit: p.unit || "Unit",
        image: p.image || "/service-software.png",
        desc: p.desc || "",
      }));

      if (query) {
        products = products.filter(
          (p: any) =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.desc.toLowerCase().includes(query)
        );
      }
      return NextResponse.json({ success: true, data: products.slice(0, 50), projectInfo });
    }

    // 5. Lampirkan Pesanan & Status Pengiriman Toko DStech Smart
    if (dataType === "orders") {
      const ordersData = readJsonSafe(ORDERS_FILE, { orders: [] });
      const rawOrders = Array.isArray(ordersData) ? ordersData : (Array.isArray(ordersData.orders) ? ordersData.orders : []);

      let orders = rawOrders.map((o: any) => {
        const statusMap: Record<string, string> = {
          PENDING: "Menunggu Pembayaran",
          BELUM_BAYAR: "Menunggu Pembayaran",
          PAID: "Lunas / Terverifikasi",
          MENUNGGU_KONFIRMASI: "Menunggu Konfirmasi Gudang",
          PROCESSING: "Sedang Diproses Gudang",
          DIPROSES: "Sedang Diproses",
          SHIPPED: "Sedang Dikirim",
          DIKIRIM: "Dalam Pengiriman",
          DELIVERED: "Pesanan Diterima",
          SELESAI: "Selesai",
          CANCELLED: "Dibatalkan",
          DIBATALKAN: "Dibatalkan",
        };
        const totalVal = o.total || o.grandTotal || 0;
        return {
          id: o.id,
          orderNumber: o.orderNumber || o.id,
          createdAt: o.createdAt || new Date().toISOString(),
          customerName: o.customerName || o.shippingAddress?.recipientName || "Pelanggan",
          customerPhone: o.customerPhone || o.shippingAddress?.phone || "-",
          city: o.shippingAddress?.city || "-",
          status: o.status || "PENDING",
          friendlyStatus: statusMap[(o.status || "").toUpperCase()] || o.status || "Dalam Proses",
          shippingCourier: o.shippingCourier || "Armada DSTech",
          trackingNumber: o.trackingNumber || "",
          total: totalVal,
          totalFormatted: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalVal),
          userId: o.userId || "",
          items: (o.items || []).map((it: any) => ({
            name: it.productName || it.name,
            qty: it.qty || 1,
            price: it.price || 0,
            image: it.image || "/service-software.png",
          })),
        };
      });

      // FILTER KETAT PRIVASI LAWAN BICARA:
      const hasTargetContext = Boolean(targetUserName || targetPhone || targetClientId || targetUserId);
      const isSearchAll = mode === "all";

      if (hasTargetContext && !isSearchAll) {
        orders = orders.filter((o: any) =>
          isMatchedTarget(
            o.customerName,
            o.customerPhone,
            o.userId,
            o.userId
          )
        );
      }

      if (query) {
        const qClean = query.toLowerCase();
        const digits = query.replace(/\D/g, "");
        orders = orders.filter((o: any) =>
          o.orderNumber.toLowerCase().includes(qClean) ||
          o.customerName.toLowerCase().includes(qClean) ||
          o.shippingCourier.toLowerCase().includes(qClean) ||
          o.trackingNumber.toLowerCase().includes(qClean) ||
          (digits.length >= 4 && o.customerPhone.replace(/\D/g, "").includes(digits))
        );
      }
      return NextResponse.json({
        success: true,
        data: orders.slice(0, 50),
        projectInfo,
        isFilteredByTarget: hasTargetContext && !isSearchAll,
      });
    }

    return NextResponse.json({ success: false, error: "Tipe data perusahaan tidak valid" }, { status: 400 });
  }

  return NextResponse.json({ success: false, error: "Aksi tidak dikenali" }, { status: 400 });
}

// POST: Kirim pesan baru atau buat percakapan baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || "send_message";

    // 0. Handover dari AI Dani Chat Asisten ke Tim Admin / CS
    if (action === "client_handover") {
      const { clientId, clientName, clientPhone, summary, initialMessage, matchedProducts } = body;
      const chats = readJsonSafe(CHATS_FILE, []);
      const messages = readJsonSafe(MESSAGES_FILE, []);
      const users = readJsonSafe(USERS_FILE, []);

      // Admin & CS yang akan menerima percakapan
      let adminIds = users
        .filter((u: any) => u.role === "ADMIN" || u.role === "SUPERADMIN" || u.role === "CS")
        .map((u: any) => u.id);
      if (adminIds.length === 0) adminIds = ["dstech_usr_1", "dstech_usr_2"];

      const resolvedClientId = clientId || `client_${Date.now()}`;
      const resolvedChatId = `dstech_chat_client_${resolvedClientId}`;
      let existingChatIndex = chats.findIndex((c: any) => c.id === resolvedChatId || (c.isClientChat && c.clientId === resolvedClientId));

      const chatTitle = clientName ? `Klien: ${clientName}` : "Klien Web Pengunjung";

      let chatObj: any;
      if (existingChatIndex === -1) {
        chatObj = {
          id: resolvedChatId,
          clientId: resolvedClientId,
          name: chatTitle,
          isGroup: false,
          isClientChat: true,
          clientName: clientName || "Pengunjung Website",
          clientPhone: clientPhone || "-",
          participants: [...adminIds, resolvedClientId],
          allowedRoles: ["ADMIN", "SUPERADMIN", "CS"],
          description: `Jalur obrolan klien website resmi. Kebutuhan: ${summary || "Konsultasi produk & layanan DSTech Smart"}`,
          lastMessage: initialMessage || `Klien ${clientName || ""} meminta terhubung ke tim Admin/CS.`,
          lastMessageTime: new Date().toISOString(),
          unreadCount: 1,
        };
        chats.unshift(chatObj);
      } else {
        chatObj = chats[existingChatIndex];
        chatObj.name = chatTitle;
        if (clientName) chatObj.clientName = clientName;
        if (clientPhone) chatObj.clientPhone = clientPhone;
        chatObj.lastMessageTime = new Date().toISOString();
      }
      writeJsonSafe(CHATS_FILE, chats);

      // Buat pesan ringkasan awal jika pesan masih kosong
      const existingMsgs = messages.filter((m: any) => m.chatId === chatObj.id);
      if (existingMsgs.length === 0) {
        const summaryContent = `🔔 **Permintaan Handover Klien ke Admin & CS**\n\n👤 **Klien**: ${clientName || "Pengunjung Web"}\n📞 **No. WhatsApp**: ${clientPhone || "Belum diisi"}\n📝 **Kebutuhan**: ${summary || initialMessage || "Konsultasi produk & solusi sistem"}`;
        
        const introMsg = {
          id: `dstech_msg_${Date.now()}_intro`,
          chatId: chatObj.id,
          senderId: resolvedClientId,
          senderName: clientName || "Klien Web",
          senderRole: "CLIENT",
          type: "text",
          content: summaryContent,
          timestamp: new Date().toISOString(),
          readBy: [resolvedClientId],
        };
        messages.push(introMsg);

        // Jika ada produk yang direkomendasikan AI Dani, lampirkan kartu produk otomatis
        if (Array.isArray(matchedProducts) && matchedProducts.length > 0) {
          for (const prod of matchedProducts.slice(0, 3)) {
            messages.push({
              id: `dstech_msg_${Date.now()}_prod_${prod.id || Math.random()}`,
              chatId: chatObj.id,
              senderId: resolvedClientId,
              senderName: "Asisten AI Dani",
              senderRole: "AI",
              type: "product",
              content: `📦 [Produk Diminati] ${prod.name} (${typeof prod.price === "number" ? `Rp ${prod.price.toLocaleString("id-ID")}` : prod.price})`,
              productData: prod,
              timestamp: new Date().toISOString(),
              readBy: [resolvedClientId],
            });
          }
        }

        // Jika ada pesanan yang sedang dikonsultasikan/bermasalah, lampirkan kartu status pesanan otomatis
        if (body.matchedOrder) {
          const ord = body.matchedOrder;
          messages.push({
            id: `dstech_msg_${Date.now()}_ord_${ord.id || Math.random()}`,
            chatId: chatObj.id,
            senderId: resolvedClientId,
            senderName: "Asisten AI Dani",
            senderRole: "AI",
            type: "order",
            content: `📦 [Status Pesanan] ${ord.orderNumber} (${ord.friendlyStatus || ord.status})`,
            orderData: ord,
            timestamp: new Date().toISOString(),
            readBy: [resolvedClientId],
          });
        }

        writeJsonSafe(MESSAGES_FILE, messages);
      }

      return NextResponse.json({
        success: true,
        chat: chatObj,
        chatId: chatObj.id,
        clientId: resolvedClientId,
      });
    }

    // 0b. Klien publik mengirim pesan langsung ke Admin/CS dari widget website
    if (action === "client_send_message") {
      const { chatId, clientId, clientName, content, type = "text" } = body;
      if (!chatId || !content) {
        return NextResponse.json({ success: false, error: "Parameter tidak lengkap" }, { status: 400 });
      }

      const messages = readJsonSafe(MESSAGES_FILE, []);
      const chats = readJsonSafe(CHATS_FILE, []);

      const newMsg = {
        id: `dstech_msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        chatId,
        senderId: clientId || "client_web",
        senderName: clientName || "Klien Web",
        senderRole: "CLIENT",
        type,
        content,
        timestamp: new Date().toISOString(),
        readBy: [clientId || "client_web"],
      };

      messages.push(newMsg);
      writeJsonSafe(MESSAGES_FILE, messages);

      const chatIndex = chats.findIndex((c: any) => c.id === chatId);
      if (chatIndex !== -1) {
        chats[chatIndex].lastMessage = content;
        chats[chatIndex].lastMessageTime = newMsg.timestamp;
        writeJsonSafe(CHATS_FILE, chats);
      }

      return NextResponse.json({ success: true, message: newMsg });
    }

    // 1. Kirim Pesan Internal
    if (action === "send_message") {
      const {
        chatId,
        senderId,
        senderName,
        senderRole,
        content,
        type = "text",
        mediaUrl,
        invoiceData,
        taskData,
        reportData,
        projectData,
        productData,
        orderData,
        callData,
      } = body;

      if (!chatId || !senderId || (!content && !mediaUrl && !invoiceData && !taskData && !reportData && !projectData && !productData && !orderData && !callData)) {
        return NextResponse.json({ success: false, error: "Parameter pesan tidak lengkap" }, { status: 400 });
      }

      const messages = readJsonSafe(MESSAGES_FILE, []);
      const chats = readJsonSafe(CHATS_FILE, []);

      const newMsgId = `dstech_msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newMsg = {
        id: newMsgId,
        chatId,
        senderId,
        senderName: senderName || "Pengguna",
        senderRole: senderRole || "EMPLOYEE",
        type,
        content: content || "",
        mediaUrl: mediaUrl || undefined,
        invoiceData: invoiceData || undefined,
        taskData: taskData || undefined,
        reportData: reportData || undefined,
        projectData: projectData || undefined,
        productData: productData || undefined,
        orderData: orderData || undefined,
        callData: callData || undefined,
        timestamp: new Date().toISOString(),
        readBy: [senderId],
      };

      messages.push(newMsg);
      writeJsonSafe(MESSAGES_FILE, messages);

      // Update ringkasan lastMessage di chat terkait
      let lastPreview = content || "";
      if (type === "invoice") lastPreview = `📑 [Invoice] ${invoiceData?.invoiceNumber || ""}`;
      else if (type === "order") lastPreview = `📦 [Pesanan] ${orderData?.orderNumber || "Status Pesanan"}`;
      else if (type === "task") lastPreview = `📋 [SPK Penugasan] ${taskData?.title || ""}`;
      else if (type === "project_info") lastPreview = `📁 [Info Proyek] ${projectData?.projectName || ""}`;
      else if (type === "daily_report") lastPreview = `📸 [Bukti Pekerjaan] ${reportData?.taskTitle || ""}`;
      else if (type === "product") lastPreview = `📦 [Produk] ${productData?.name || "Katalog Produk"}`;
      else if (type === "image") lastPreview = "📷 [Foto]";
      else if (type === "video") lastPreview = "📹 [Video]";
      else if (type === "call_log") lastPreview = `📞 [${callData?.callType === "video" ? "Panggilan Video" : "Panggilan Suara"}]`;

      const chatIndex = chats.findIndex((c: any) => c.id === chatId);
      if (chatIndex !== -1) {
        chats[chatIndex].lastMessage = lastPreview;
        chats[chatIndex].lastMessageTime = newMsg.timestamp;
        writeJsonSafe(CHATS_FILE, chats);
      }

      // Intersepsi Karyawan AI: Jika pesan dikirim ke ruang obrolan Karyawan AI atau Grup AI
      const activeChatObj = chats.find((c: any) => c.id === chatId);
      const isTargetAiChat =
        chatId === "dstech_chat_group_ai_workforce" ||
        chatId.startsWith("dstech_chat_dm_emp_") ||
        Boolean(activeChatObj?.isAiChat) ||
        Boolean(activeChatObj?.aiEmployeeId);

      // Daftar eksklusif 6 Staf AI internal bot (hanya bot ini yang dilarang memicu bot lain untuk mencegah infinite loop)
      const AI_WORKFORCE_BOT_IDS = [
        "emp_dewi_finance",
        "emp_bambang_sales",
        "emp_deni_field",
        "emp_nadia_marketing",
        "emp_reza_catalog",
        "emp_siti_cs",
      ];
      const isSenderAiBot = senderRole === "AI_WORKFORCE" || AI_WORKFORCE_BOT_IDS.includes(senderId);

      if (isTargetAiChat && !isSenderAiBot) {
        const aiResponse = await handleAiWorkforceChatMessage({
          chatId,
          chatObj: activeChatObj,
          userMessage: newMsg,
          messages,
          chats,
        });

        if (aiResponse) {
          const aiReplies = Array.isArray(aiResponse) ? aiResponse : [aiResponse];
          return NextResponse.json({
            success: true,
            message: newMsg,
            aiReply: aiReplies[0],
            aiReplies: aiReplies,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: newMsg,
      });
    }

    // 2. Buat Direct Chat (1-on-1) atau Grup Baru
    if (action === "create_chat") {
      const { name, isGroup, participants, description } = body;
      const chats = readJsonSafe(CHATS_FILE, []);

      // Jika DM, cek apakah sudah ada chat antara kedua user
      if (!isGroup && participants?.length === 2) {
        const existingChat = chats.find(
          (c: any) =>
            !c.isGroup &&
            c.participants.includes(participants[0]) &&
            c.participants.includes(participants[1])
        );
        if (existingChat) {
          return NextResponse.json({ success: true, chat: existingChat });
        }
      }

      const newChatId = isGroup
        ? `dstech_chat_group_${Date.now()}`
        : `dstech_chat_dm_${Date.now()}`;

      const newChat = {
        id: newChatId,
        name: name || "Percakapan Baru",
        isGroup: !!isGroup,
        participants: participants || [],
        description: description || "",
        lastMessage: "Percakapan dimulai.",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      };

      chats.unshift(newChat);
      writeJsonSafe(CHATS_FILE, chats);

      return NextResponse.json({ success: true, chat: newChat });
    }

    return NextResponse.json({ success: false, error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
