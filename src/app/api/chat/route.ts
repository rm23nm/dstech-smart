import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { callLocalInHouseLLM, DEFAULT_INHOUSE_MODEL } from "@/utils/dstech_inhouse_ai_agent";
import { executeMultiAICompletion } from "@/utils/dstech_ai_multi_provider";

export const dynamic = "force-dynamic";

const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "dstech_settings.json");
const ORDERS_FILE = path.join(process.cwd(), "src", "data", "dstech_orders.json");
const PRODUCTS_FILE = path.join(process.cwd(), "src", "data", "dstech_products.json");

function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    }
  } catch (e) {}
  return {
    whatsapp: "6282259494242",
    whatsappSales: "6282259494242",
    whatsappTechnical: "6282259494242",
    whatsappComplaint: "6282259494242",
    companyName: "PT. DSTech Smart Perkasa",
  };
}

function getOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
      return Array.isArray(data.orders) ? data.orders : [];
    }
  } catch (e) {}
  return [];
}

function getProducts(): any[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const prods = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
      return Array.isArray(prods) ? prods : [];
    }
  } catch (e) {}
  return [];
}

function findOrderByQuery(query: string, visitorPhone?: string): any | null {
  const orders = getOrders();
  if (!orders || orders.length === 0) return null;
  const qClean = query.trim().toLowerCase();
  const digits = query.replace(/\D/g, "");

  const orderNumMatch = query.match(/ORD[\/\-_]?DST[\/\-_]?\d+[\/\-_]?\d+/i) || query.match(/order_\d+/i);
  if (orderNumMatch) {
    const rawTarget = orderNumMatch[0].toLowerCase().replace(/[\/\-_]/g, "");
    const found = orders.find((o) => {
      const oNum = (o.orderNumber || "").toLowerCase().replace(/[\/\-_]/g, "");
      const oId = (o.id || "").toLowerCase().replace(/[\/\-_]/g, "");
      return oNum.includes(rawTarget) || oId.includes(rawTarget) || rawTarget.includes(oNum);
    });
    if (found) return found;
  }

  const foundByResi = orders.find((o) => {
    if (!o.trackingNumber || !o.trackingNumber.trim()) return false;
    const resi = o.trackingNumber.trim().toLowerCase();
    return qClean.includes(resi) || resi.includes(qClean);
  });
  if (foundByResi) return foundByResi;

  if (digits.length >= 9) {
    const foundByPhone = orders.find((o) => {
      const p1 = (o.customerPhone || "").replace(/\D/g, "");
      const p2 = (o.shippingAddress?.phone || "").replace(/\D/g, "");
      return (p1 && (p1.includes(digits) || digits.includes(p1))) ||
             (p2 && (p2.includes(digits) || digits.includes(p2)));
    });
    if (foundByPhone) return foundByPhone;
  }

  return null;
}

function searchMatchedProducts(query: string): any[] {
  const products = getProducts();
  if (!products || products.length === 0) return [];
  const q = query.toLowerCase().trim();

  // Jika pengunjung bertanya umum seputar katalog/produk apa saja yang ada
  const isGeneralCatalog = /^(ada produk apa|produk apa|jual apa|katalog|daftar produk|list produk|produknya apa|ada apa saja|barang apa|layanan apa|jasa apa|bisa pasang apa)/i.test(q);
  if (isGeneralCatalog) {
    const flagshipIds = [
      "dstech_prod_reza_shopee_01", // Barrier Gate Servo DC MX-50
      "dstech_prod_2",              // CCTV Hikvision 4CH HD
      "dstech_prod_1",              // Smart Doorlock X-100 / Tuya
      "dstech_prod_reza_shopee_10", // Flap Barrier Turnstile
    ];
    const flagships = products.filter((p) => flagshipIds.includes(p.id));
    if (flagships.length >= 3) return flagships;
    return products.slice(0, 4);
  }

  const words = q.split(/\s+/).filter((w) => w.length > 2);

  const scored = products.map((p) => {
    let score = 0;
    const pName = (p.name || "").toLowerCase();
    const pCat = (p.category || "").toLowerCase();
    const pDesc = (p.desc || "").toLowerCase();

    if (pName.includes(q)) score += 10;
    if (pCat.includes(q)) score += 5;

    for (const w of words) {
      if (pName.includes(w)) score += 3;
      if (pCat.includes(w)) score += 2;
      if (pDesc.includes(w)) score += 1;
    }
    return { product: p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.product);
}

function generateSmartFallback(message: string, matchedProducts: any[], settings: any): string {
  const lower = message.trim().toLowerCase();

  // 1. Sapaan Ramah Alami (Greetings)
  const isGreetingOnly = /^(halo|hai|hey|pagi|selamat|assalam|siang|sore|malam|p\b|permisi|tes|test)$/i.test(lower) ||
    /^(halo|hai|hey|selamat pagi|selamat siang|selamat sore|selamat malam|assalamu'?alaikum)\b[!.? ]*$/i.test(lower);
    
  if (isGreetingOnly) {
    let waktu = "pagi";
    const currentHour = new Date().getHours();
    if (currentHour >= 11 && currentHour < 15) waktu = "siang";
    else if (currentHour >= 15 && currentHour < 18) waktu = "sore";
    else if (currentHour >= 18 || currentHour < 5) waktu = "malam";
    if (lower.includes("pagi")) waktu = "pagi";
    else if (lower.includes("siang")) waktu = "siang";
    else if (lower.includes("sore")) waktu = "sore";
    else if (lower.includes("malam")) waktu = "malam";

    return `Selamat ${waktu}! Selamat datang di PT. DSTech Smart Perkasa. Saya Siti dari tim layanan pelanggan. Ada yang bisa kami bantu seputar sistem keamanan, barrier gate otomatis, CCTV, atau akses kontrol untuk lokasi Anda hari ini?`;
  }

  // 2. Pertanyaan Umum Produk / Katalog ("ada produk apa saja", "jual apa saja", dll)
  if (/produk apa|jual apa|katalog|daftar produk|list barang|ada apa|bisa pasang apa|solusi apa/i.test(lower)) {
    return `Halo! Di PT. DSTech Smart Perkasa, kami menyediakan berbagai solusi teknologi dan sistem keamanan terintegrasi, antara lain:

1. **Barrier Gate & Sistem Parkir Otomatis**: Palang parkir otomatis mesin Servo Brushless kecepatan tinggi (0.6s - 1.2s), MX-80 Heavy Duty, sensor radar 79GHz, loop detector, reader RFID UHF jarak jauh 15 meter, serta pos tiket kasir dispenser.
2. **Pedestrian Gate / Turnstile**: Flap Barrier otomatis SUS304 dan Tripod Turnstile untuk gedung perkantoran, pabrik, atau fasilitas umum.
3. **Akses Kontrol & Smart Door Lock**: Terminal Face Recognition & Sidik Jari, Smart Lock Tuya WiFi, Drop Bolt, dan Magnetic Lock 600 Lbs.
4. **CCTV AI Surveillance**: Kamera pengawas resolusi tinggi dengan kecerdasan buatan (deteksi manusia, kendaraan, dan night color vision).
5. **Visual Display & IoT**: Running Text LED P10 outdoor tahan cuaca, Traffic Light LED 100mm, dan Variable Message Sign (VMS).

Seluruh perangkat bergaransi resmi 1 tahun dan didukung jasa pemasangan langsung oleh tim teknisi bersertifikat kami. Apakah ada kebutuhan tertentu atau lokasi yang ingin Anda pasangi sistem ini?`;
  }

  // 3. Pertanyaan Harga / Penawaran
  if (/harga|biaya|tarif|berapa|pricelist|penawaran|paket|ongkir/i.test(lower)) {
    if (matchedProducts.length > 0) {
      const list = matchedProducts.slice(0, 3).map((p) => `- **${p.name}**: Rp ${Number(p.price).toLocaleString("id-ID")} (Garansi Resmi 1 Tahun)`).join("\n");
      return `Halo! Untuk informasi estimasi harga solusi perangkat kami, berikut beberapa produk yang relevan:\n\n${list}\n\nUntuk perhitungan paket lengkap berikut jasa instalasi dan kabel di lokasi Anda, tim konsultan kami siap membuatkan penawaran resmi (SPH). Boleh kami tahu lokasi pemasangannya di mana?`;
    }
    return `Halo! Untuk estimasi biaya paket lengkap (termasuk unit, material, dan jasa instalasi teknisi resmi), tim konsultan kami siap membuatkan draf Surat Penawaran Harga (SPH) resmi. Boleh kami tahu kebutuhan sistem yang ingin dipasang dan lokasinya?`;
  }

  // 4. Pertanyaan Spesifikasi / Produk Relevan
  if (matchedProducts.length > 0) {
    const list = matchedProducts.slice(0, 3).map((p) => `- **${p.name}**: Rp ${Number(p.price).toLocaleString("id-ID")}`).join("\n");
    return `Halo! Terkait kebutuhan Anda, kami memiliki beberapa solusi perangkat unggulan di PT. DSTech Smart Perkasa:\n\n${list}\n\nSeluruh perangkat kami bergaransi resmi 1 tahun. Apakah ada spesifikasi khusus atau kapasitas yang ingin Anda konsultasikan lebih lanjut?`;
  }

  // 5. Default Ramah & Terbuka
  return `Halo! Terima kasih telah menghubungi PT. DSTech Smart Perkasa. Kami melayani pengadaan dan pemasangan Barrier Gate Otomatis, CCTV AI Surveillance, Access Control & Smart Door Lock, Turnstile, serta IoT.\n\nBoleh kami tahu apa yang sedang Anda butuhkan atau kendala yang ingin diselesaikan di lokasi Anda? Kami siap bantu rekomendasikan solusi terbaiknya.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, visitorInfo } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ success: false, error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const settings = getSettings();
    const cleanMainWa = (settings.whatsapp || "6282259494242").replace(/\D/g, "");
    const waSales = (settings.whatsappSales || cleanMainWa).replace(/\D/g, "") || cleanMainWa;
    const waTechnical = (settings.whatsappTechnical || cleanMainWa).replace(/\D/g, "") || cleanMainWa;
    const waComplaint = (settings.whatsappComplaint || cleanMainWa).replace(/\D/g, "") || cleanMainWa;

    const rawPath = (visitorInfo?.currentPath || "").toLowerCase();
    const portalType: "SUPERADMIN" | "ADMIN" | "EMPLOYEE" | "PARTNER" | "PUBLIC" =
      visitorInfo?.portalType ||
      (rawPath.startsWith("/superadmin") ? "SUPERADMIN" :
       rawPath.startsWith("/admin") ? "ADMIN" :
       rawPath.startsWith("/employee") ? "EMPLOYEE" :
       rawPath.startsWith("/affiliate") ? "PARTNER" : "PUBLIC");

    const isInternalUser = portalType === "SUPERADMIN" || portalType === "ADMIN" || portalType === "EMPLOYEE";
    const userName = visitorInfo?.name ? visitorInfo.name.split(" ")[0] : "";
    const lower = message.toLowerCase();

    let aiResponseData: any = null;

    // ==========================================
    // KASUS 1: PORTAL SUPERADMIN & ADMIN (ERP COPILOT)
    // ==========================================
    if (portalType === "SUPERADMIN" || portalType === "ADMIN") {
      let reply = "";
      const quickReplies = [
        "📄 Cara Buat Faktur Baru",
        "📑 Cara Terbitkan SPH",
        "📦 Cara Input Produk & Stok",
        "🎨 Cara Atur E-Store Hero",
        "📊 Panduan Buku Arus Kas"
      ];

      if (lower.includes("faktur") || lower.includes("invoice") || lower.includes("tagihan")) {
        reply = `Halo ${userName ? `Pak/Bu ${userName}` : "Admin"}! Untuk membuat Faktur Penjualan:
` +
                `1. Buka menu Keuangan (/admin/finance) -> Tab "Penjualan & Faktur".
` +
                `2. Klik tombol "+ Terbitkan Faktur Baru".
` +
                `3. Pilih Klien & Produk dari katalog, tentukan termin, lalu Simpan.`;
      } else if (lower.includes("sph") || lower.includes("penawaran")) {
        reply = `Halo ${userName ? `Pak/Bu ${userName}` : "Admin"}! Untuk menerbitkan SPH Resmi:
` +
                `1. Buka menu Keuangan -> Tab "Penawaran SPH".
` +
                `2. Klik "+ Buat SPH Baru", pilih klien, tambahkan barang/jasa, lalu cetak PDF resmi berkop surat PT. DSTech Smart Perkasa.`;
      } else {
        reply = `Halo ${userName ? `Pak/Bu ${userName}` : "Admin"}! Saya siap membantu operasional ERP DSTech Smart (Faktur, SPH, Katalog, Absensi, atau Pengaturan Sistem). Apa yang ingin Anda kelola saat ini?`;
      }

      aiResponseData = {
        reply,
        department: "INTERNAL_ERP",
        department_label: "Admin ERP AI Copilot",
        client_name: userName || "Admin",
        client_phone: null,
        ready_for_handover: false,
        handover_reason: null,
        handover_summary: null,
        matched_products: [],
        quick_replies: quickReplies,
      };

    // ==========================================
    // KASUS 2: PORTAL KARYAWAN & TEKNISI (FIELD OPS)
    // ==========================================
    } else if (portalType === "EMPLOYEE") {
      let reply = `Halo ${userName || "Rekan Teknisi"}! Ada kendala lapangan atau absensi yang bisa dibantu? Pastikan GPS aktif saat melakukan presensi check-in/out.`;
      aiResponseData = {
        reply,
        department: "INTERNAL_OPS",
        department_label: "Teknisi Field Ops Guide",
        client_name: userName || "Karyawan",
        client_phone: null,
        ready_for_handover: false,
        handover_reason: null,
        handover_summary: null,
        matched_products: [],
        quick_replies: ["📍 Presensi GPS", "🛠️ Laporan Harian", "📋 Cek Tugas Proyek"],
      };

    // ==========================================
    // KASUS 3: PORTAL PARTNER AFFILIATE
    // ==========================================
    } else if (portalType === "PARTNER") {
      let reply = `Halo Mitra DSTech Smart! Anda berhak mendapatkan komisi 5% - 15% untuk setiap referral klien proyek CCTV, Barrier Gate, atau Smart Home yang deal. Bagikan link referral Anda untuk mulai menghasilkan komisi.`;
      aiResponseData = {
        reply,
        department: "AFFILIATE",
        department_label: "Partner Growth Guide",
        client_name: userName || "Mitra",
        client_phone: null,
        ready_for_handover: false,
        handover_reason: null,
        handover_summary: null,
        matched_products: [],
        quick_replies: ["💰 Cek Komisi", "🔗 Salin Link Referral", "📦 Katalog Produk"],
      };

    // ==========================================
    // KASUS 4: PENGUNJUNG PUBLIK (IN-HOUSE AI CONSULTANT)
    // ==========================================
    } else {
      // 1. Cek Pelacakan Pesanan
      const isOrderKeyword = /pesanan|order|resi|tracking|lacak|pengiriman|kirim|barang saya|sampai mana|belum sampai|status barang/i.test(lower);
      const matchedOrder = findOrderByQuery(message, visitorInfo?.phone);

      if (matchedOrder) {
        const courier = matchedOrder.shippingCourier || "Armada Ekspedisi DSTech";
        const resi = matchedOrder.trackingNumber || "(Resi sedang disiapkan logistik)";
        const recipient = matchedOrder.shippingAddress?.recipientName || matchedOrder.customerName || "Pelanggan";
        const city = matchedOrder.shippingAddress?.city || "Kota Tujuan";

        aiResponseData = {
          reply: `Halo Kak ${recipient}! Pesanan Anda [${matchedOrder.orderNumber}] terpantau dalam status: ${matchedOrder.status || "Diproses"}. Kurir: ${courier}, No. Resi: ${resi}, Tujuan: ${city}. Hubungi kami via WhatsApp jika ada pertanyaan lanjutan!`,
          department: "SALES",
          department_label: "Tim Logistik & Layanan Pelanggan",
          client_name: recipient,
          client_phone: matchedOrder.customerPhone || null,
          ready_for_handover: true,
          handover_reason: `Pelacakan pesanan ${matchedOrder.orderNumber}`,
          handover_summary: `Halo Admin DSTech Smart, mohon info status pesanan [${matchedOrder.orderNumber}] atas nama ${recipient}.`,
          matched_products: [],
          quick_replies: ["📞 Hubungkan ke Admin CS", "🛒 Belanja Produk Lain"],
        };
      } else {
                // 2. Pencarian Produk Relevan dari Katalog Riil
        const matchedProducts = searchMatchedProducts(message);

        // 3. Bangun Prompt Konsultasi Spesifik Solusi PT. DSTech Smart Perkasa
        const isGeneralInquiry = /produk apa|jual apa|katalog|daftar produk|list barang|ada apa|bisa pasang apa|solusi apa/i.test(lower);
        
        const productContext = matchedProducts.length > 0
          ? matchedProducts.map((p) => `- ${p.name}: Rp ${Number(p.price).toLocaleString("id-ID")} (Kategori: ${p.category}, Garansi 1 Tahun)`).join("\n")
          : "Layanan utama: Barrier Gate Servo 0.6s & MX-80, Flap Barrier SUS304, CCTV AI 5MP, Face Recognition, Smart Door Lock Tuya, Running Text LED P10.";

        const systemPrompt = `Anda adalah Deni (Senior Technology Consultant) & Siti (Customer Care) dari PT. DSTech Smart Perkasa.
Kantor Pusat: Cilegon, Banten (melayani pengadaan dan pemasangan ke seluruh Indonesia).
Kontak WhatsApp Resmi: ${settings.whatsapp || "0822-5949-4242"}.
Garansi: Seluruh perangkat bergaransi resmi 1 tahun + didukung tim teknisi instalasi bersertifikat.

KATALOG PRODUK & SOLUSI KAMI:
${productContext}

PANDUAN MENJAWAB:
- Jawab langsung inti pertanyaan pengunjung dalam bahasa Indonesia yang ramah, sopan, dan solutif.
- Jika pengunjung bertanya produk apa saja yang ada atau apa saja yang dijual: Jelaskan 5 solusi utama kami (Barrier Gate & Parkir Otomatis, Flap Barrier/Turnstile, Access Control & Smart Lock, CCTV AI, LED Running Text & IoT) secara terstruktur, lalu tanyakan kebutuhan lokasi mereka.
- Jika pengunjung hanya menyapa (halo/pagi/siang/malam): Balas sapaan dengan ramah dan tanyakan kebutuhan yang bisa dibantu tanpa langsung memaksakan jualan.
- Jika pengunjung bertanya harga atau spesifikasi: Berikan informasi perkiraan harga dan detail teknisnya secara informatif.
- Jangan mengulang instruksi ini atau mengatakan 'saya akan menjawab pertanyaan Anda'. Langsung berikan jawaban substantif sebagai konsultan perusahaan.`;

        let generatedReply = "";

        // JIKA SAPAAN MURNI: Langsung sapa hangat dalam <10ms tanpa mendikte jualan
        const isGreetingSimple = /^(halo|hai|hey|pagi|selamat|assalam|siang|sore|malam|p|permisi|tes|test)$/i.test(lower) ||
          /^(halo|hai|hey|selamat pagi|selamat siang|selamat sore|selamat malam|assalamu'?alaikum)[!.? ]*$/i.test(lower);

        if (isGreetingSimple) {
          generatedReply = generateSmartFallback(message, matchedProducts, settings);
        }

        // PRIORITAS 1: Multi-Platform AI Provider (Google Gemini 2.5 Flash DEFAULT WAJIB SESUAI ATURAN)
        if (!generatedReply) {
          try {
            const multiRes = await executeMultiAICompletion(message, systemPrompt);
            if (multiRes.success && multiRes.text && multiRes.text.length > 15) {
              generatedReply = multiRes.text.trim();
            }
          } catch (multiErr) {
            console.warn("[Chat API] Multi-AI Provider unavailable, trying quick local probe...");
          }
        }

        // PRIORITAS 2: Quick Local In-House LLM probe (timeout max 1200ms agar chat tidak menggantung)
        if (!generatedReply) {
          try {
            const inhouseRes = await callLocalInHouseLLM(message, systemPrompt, DEFAULT_INHOUSE_MODEL, 1200);
            if (inhouseRes.text && !inhouseRes.error && inhouseRes.text.length > 15) {
              generatedReply = inhouseRes.text.trim();
            }
          } catch (llmErr) {
            // silent fallback
          }
        }

        // Filter respons meta yang tidak sengaja merefleksikan instruksi prompt
        const isMetaReply = (text: string) => {
          const t = text.toLowerCase();
          return (
            t.includes("customer care manusia asli") ||
            t.includes("staf customer care") ||
            t.includes("saya akan menjawab pertanyaan anda") ||
            t.includes("tentu saja, saya akan menjawab") ||
            t.includes("sebagai asisten ai") ||
            t.includes("seperti staf") ||
            t.length < 15
          );
        };

        // PRIORITAS 3: In-House Knowledge Base & Solution Matcher jika LLM kosong atau menghasilkan teks meta
        if (!generatedReply || isMetaReply(generatedReply)) {
          generatedReply = generateSmartFallback(message, matchedProducts, settings);
        }

        // Deteksi Kategori Layanan
        let dept = "SALES";
        let deptLabel = "Tim Konsultan Solusi & Penawaran";
        if (/rusak|mati|kendala|servis|error|macet|bantuan|teknisi/i.test(lower)) {
          dept = "TECHNICAL";
          deptLabel = "Tim Teknikal & Maintenance";
        } else if (/komplain|komplen|retur|refund|salah kirim/i.test(lower)) {
          dept = "COMPLAINT";
          deptLabel = "Tim Penanganan Komplain";
        }

        aiResponseData = {
          reply: generatedReply,
          department: dept,
          department_label: deptLabel,
          client_name: visitorInfo?.name || null,
          client_phone: visitorInfo?.phone || null,
          ready_for_handover: true,
          handover_reason: `Konsultasi solusi: ${message}`,
          handover_summary: `Halo ${deptLabel} PT. DSTech Smart Perkasa,\nSaya ingin konsultasi mengenai: "${message}".\nMohon dibantu spesifikasi & penawarannya. Terima kasih!`,
          matched_products: matchedProducts,
          quick_replies: [
            "🚀 Barrier Gate Otomatis",
            "📹 Rekomendasi CCTV AI",
            "🔐 Smart Door Lock & Akses",
            "📞 Hubungkan ke WhatsApp Konsultan"
          ],
        };
      }
    }

    // Tentukan nomor WhatsApp tujuan
    let targetPhone = waSales;
    if (aiResponseData?.department === "TECHNICAL") targetPhone = waTechnical;
    if (aiResponseData?.department === "COMPLAINT") targetPhone = waComplaint;

    const whatsappText = encodeURIComponent(
      aiResponseData?.handover_summary ||
      `Halo PT. DSTech Smart Perkasa, saya ingin konsultasi mengenai: "${message}".`
    );
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${whatsappText}`;

    return NextResponse.json({
      success: true,
      data: {
        ...aiResponseData,
        target_whatsapp_number: targetPhone,
        whatsapp_url: whatsappUrl,
      },
    });
  } catch (error: any) {
    console.error("[DSTech Chat API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses pesan: " + error.message },
      { status: 500 }
    );
  }
}
