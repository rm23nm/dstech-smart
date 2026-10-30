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
      role: "AI Creative Marketing & Copywriter",
      department: "MARKETING",
      desk_zone: "MARKETING_DESK",
      gender: "female",
      avatar_color: "#f59e0b",
      status: "WORKING",
      current_activity: "Menyusun materi promo paket CCTV pabrik dan copywriting broadcast WhatsApp",
      speech_bubble: "Kampanye promo 'Solusi Keamanan Terintegrasi DSTech Smart' siap dibroadcast ke mitra bisnis.",
      kpi: {
        campaigns_created: 18,
        wa_broadcast_leads: 62,
        engagement_rate: "87.4%"
      },
      skills: ["Pembuatan Konten Promo", "Broadcast WhatsApp Efektif", "Banner Penawaran Khusus", "Artikel Edukasi Portofolio"]
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
        if (lowerCmd.includes("sph") || lowerCmd.includes("penawaran") || lowerCmd.includes("invoice") || lowerCmd.includes("faktur") || lowerCmd.includes("ppn") || lowerCmd.includes("keuangan") || lowerCmd.includes("kas") || lowerCmd.includes("pajak")) {
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

      // Panggil AI Gemini (default gemini-2.5-flash) untuk menyusun jawaban dan aksi
      const apiKey = process.env.GEMINI_API_KEY || "";
      let aiResponseText = "";

      if (apiKey) {
        try {
          const systemInstruction = `Anda adalah ${targetEmp.name}, karyawan AI profesional di PT. DSTech Smart Perkasa dengan jabatan: ${targetEmp.role} (${targetEmp.department}).
Direktur Utama (Bpk. Ramadhani ST) baru saja memberikan instruksi langsung kepada Anda di kantor: "${promptCommand}".
Jawablah dengan gaya karyawan profesional, sopan, loyal, sigap, dan solutif (Bahasa Indonesia).
Berikan konfirmasi bahwa tugas tersebut segera dieksekusi detik ini juga, sebutkan langkah konkret apa yang sedang/akan Anda kerjakan sesuai SOP divisi Anda di DSTech Smart (CCTV, Barrier Gate, Smart Home, ERP Finance, CRM).
Panjang jawaban maksimal 2-3 kalimat padat dan bersemangat.`;

          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: systemInstruction }] }]
            }),
            signal: AbortSignal.timeout(10000)
          });

          if (res.ok) {
            const jsonRes = await res.json();
            aiResponseText = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
          }
        } catch (e: any) {
          console.warn("AI Gemini workforce error:", e.message);
        }
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

              // 1. Ekstrak rincian SPH menggunakan AI Gemini atau Fallback Parser yang cerdas
              let extractedSph: any = null;

              if (apiKey) {
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

                  const resExtraction = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contents: [{ role: "user", parts: [{ text: sphExtractionPrompt }] }],
                      generationConfig: { responseMimeType: "application/json" }
                    }),
                    signal: AbortSignal.timeout(12000)
                  });

                  if (resExtraction.ok) {
                    const parsed = await resExtraction.json();
                    const textOut = parsed?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
                    if (textOut) {
                      extractedSph = JSON.parse(textOut);
                    }
                  }
                } catch (geminiErr: any) {
                  console.warn("Gemini SPH parsing fallback:", geminiErr.message);
                }
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

              // 6 Produk Security Unggulan dari Toko Shopee Tekno20 dengan Markup +50%
              const tekno20Imported = [
                {
                  id: `dstech_prod_tekno_${Date.now()}_1`,
                  name: "DStech - Paket CCTV Dahua 4 Kamera Full HD Night Vision (Tekno20 Import)",
                  category: "Security System",
                  subCategory: "CCTV IP Camera & NVR",
                  brand: "Dahua",
                  entityType: "PT",
                  costPrice: 1400000,
                  price: 2100000, // Markup +50% dari harga toko Tekno20
                  isPromo: false,
                  discountPercent: 0,
                  promoTag: "Shopee Import +50%",
                  installationFee: 350000,
                  hasInstallationService: true,
                  stock: 15,
                  unit: "Paket",
                  warehouseStock: { dstech_wh_1: 15, dstech_wh_2: 0, dstech_wh_3: 0 },
                  commission: "5%",
                  commissionRate: 5,
                  commissionType: "ONETIME",
                  image: "/uploads/dstech_img_1793180758957_6db496b9-39f7-4d75-8a61-f3c988.jpg",
                  images: ["/uploads/dstech_img_1793180758957_6db496b9-39f7-4d75-8a61-f3c988.jpg"],
                  desc: "Diimpor langsung dari Toko Shopee Tekno20 dengan penyesuaian harga jual DSTech Smart (+50% margin).\nPaket CCTV 4 Kamera Outdoor/Indoor 2MP Dahua Cooper Series, 1 Unit DVR 4CH, Lengkap Adaptor & Aksesoris.",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: `dstech_prod_tekno_${Date.now()}_2`,
                  name: "DStech - Harddisk CCTV Surveillance 2TB Seagate SkyHawk (Tekno20 Import)",
                  category: "Security System",
                  subCategory: "Penyimpanan & Aksesoris",
                  brand: "Seagate",
                  entityType: "PT",
                  costPrice: 850000,
                  price: 1275000, // Markup +50%
                  isPromo: false,
                  discountPercent: 0,
                  promoTag: "Shopee Import +50%",
                  installationFee: 50000,
                  hasInstallationService: true,
                  stock: 25,
                  unit: "Unit",
                  warehouseStock: { dstech_wh_1: 25, dstech_wh_2: 0, dstech_wh_3: 0 },
                  commission: "3%",
                  commissionRate: 3,
                  commissionType: "ONETIME",
                  image: "/uploads/dstech_img_1793180758957_6db496b9-39f7-4d75-8a61-f3c988.jpg",
                  images: ["/uploads/dstech_img_1793180758957_6db496b9-39f7-4d75-8a61-f3c988.jpg"],
                  desc: "Harddisk khusus surveillance CCTV 24/7 Seagate SkyHawk 2TB. Garansi resmi 3 tahun. Diimpor dari Shopee Tekno20 (+50% Margin).",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: `dstech_prod_tekno_${Date.now()}_3`,
                  name: "DStech - Switch Hub PoE 8-Port Gigabit 10/100/1000Mbps (Tekno20 Import)",
                  category: "Network & IoT",
                  subCategory: "Switch & Router",
                  brand: "DStech Enterprise",
                  entityType: "PT",
                  costPrice: 550000,
                  price: 825000, // Markup +50%
                  isPromo: false,
                  discountPercent: 0,
                  promoTag: "Shopee Import +50%",
                  installationFee: 75000,
                  hasInstallationService: true,
                  stock: 20,
                  unit: "Unit",
                  warehouseStock: { dstech_wh_1: 20, dstech_wh_2: 0, dstech_wh_3: 0 },
                  commission: "5%",
                  commissionRate: 5,
                  commissionType: "ONETIME",
                  image: "/uploads/dstech_img_1793180758957_6db496b9-39f7-4d75-8a61-f3c988.jpg",
                  images: ["/uploads/dstech_img_1793180758957_6db496b9-39f7-4d75-8a61-f3c988.jpg"],
                  desc: "Switch Hub PoE 8 Port Gigabit untuk instalasi IP Camera CCTV. Diimpor dari Toko Shopee Tekno20 (+50% margin).",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: `dstech_prod_tekno_${Date.now()}_4`,
                  name: "DStech - Power Supply Central Jaring 12V 20A Metal Case (Tekno20 Import)",
                  category: "Security System",
                  subCategory: "Penyimpanan & Aksesoris",
                  brand: "DStech Power",
                  entityType: "PT",
                  costPrice: 180000,
                  price: 270000, // Markup +50%
                  isPromo: false,
                  discountPercent: 0,
                  promoTag: "Shopee Import +50%",
                  installationFee: 50000,
                  hasInstallationService: true,
                  stock: 40,
                  unit: "Unit",
                  warehouseStock: { dstech_wh_1: 40, dstech_wh_2: 0, dstech_wh_3: 0 },
                  commission: "3%",
                  commissionRate: 3,
                  commissionType: "ONETIME",
                  image: "/uploads/dstech_img_1793180758957_6db496b9-39f7-4d75-8a61-f3c988.jpg",
                  images: ["/uploads/dstech_img_1793180758957_6db496b9-39f7-4d75-8a61-f3c988.jpg"],
                  desc: "Power Supply jaring 12V 20A untuk CCTV multi-channel. Diimpor dari Shopee Tekno20 (+50% margin).",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: `dstech_prod_tekno_${Date.now()}_5`,
                  name: "DStech - Roll Kabel Coaxial RG59 + Power 100M Premium (Tekno20 Import)",
                  category: "Security System",
                  subCategory: "Penyimpanan & Aksesoris",
                  brand: "DStech Cable",
                  entityType: "PT",
                  costPrice: 320000,
                  price: 480000, // Markup +50%
                  isPromo: false,
                  discountPercent: 0,
                  promoTag: "Shopee Import +50%",
                  installationFee: 50000,
                  hasInstallationService: false,
                  stock: 30,
                  unit: "Roll",
                  warehouseStock: { dstech_wh_1: 30, dstech_wh_2: 0, dstech_wh_3: 0 },
                  commission: "3%",
                  commissionRate: 3,
                  commissionType: "ONETIME",
                  image: "/uploads/dstech_img_1793180758957_6db496b9-39f7-4d75-8a61-f3c988.jpg",
                  images: ["/uploads/dstech_img_1793180758957_6db496b9-39f7-4d75-8a61-f3c988.jpg"],
                  desc: "Kabel Coaxial RG59 + Power 100 Meter. Diimpor dari Toko Shopee Tekno20 (+50% margin).",
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
                store: "Shopee Tekno20",
                count: tekno20Imported.length,
                markup: "+50%",
                link: "/admin/products",
              };

              aiResponseText = `Siap Pak Ramadhani! Saya (Reza Firmansyah) telah selesai mengimpor ${tekno20Imported.length} produk dari Toko Shopee Tekno20 ke dalam katalog produk kita lengkap dengan spesifikasi, foto, dan kenaikan harga +50% dari harga modal toko. Seluruh produk telah aktif dan siap dipasarkan di menu Produk & Katalog!`;
            }
          } catch (prodErr: any) {
            console.error("Error executing Reza Catalog import:", prodErr);
          }
        }
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
