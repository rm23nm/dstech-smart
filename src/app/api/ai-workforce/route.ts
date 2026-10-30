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

              // Ekstrak nama klien
              let customerName = "Klien Baru DSTech";
              if (lowerCmd.includes("purna jual")) {
                customerName = "PT Purna Jual Baru";
              } else {
                const matchUntuk = promptCommand.match(/untuk\s+([A-Za-z0-9\s\.\,\-]+)/i);
                if (matchUntuk && matchUntuk[1]) {
                  customerName = matchUntuk[1].trim();
                }
              }

              // Nomor SPH otomatis
              const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
              const sphCount = (finData.quotations.length || 0) + 1;
              const sphNumber = `SPH-DSTECH-${yearMonth}-${String(sphCount).padStart(3, "0")}`;

              // Item penawaran CCTV standar atau disesuaikan
              let items = [
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

              const subtotal = items.reduce((acc, it) => acc + it.total, 0);
              const taxRate = 11;
              const taxAmount = Math.round(subtotal * (taxRate / 100));
              const grandTotal = subtotal + taxAmount;

              const newSphDoc = {
                id: `dstech_sph_${Date.now()}`,
                quotationNumber: sphNumber,
                clientId: `client_${Date.now()}`,
                customerName: customerName,
                customerOrg: customerName,
                customerPhone: "0812-9988-7766",
                customerAddress: "Kawasan Industri, Banten",
                subject: `Surat Penawaran Harga Paket Pengadaan & Instalasi CCTV 4 Kamera HD Night Vision`,
                date: new Date().toISOString().split("T")[0],
                validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                validityDays: 14,
                items: items,
                subtotal: subtotal,
                discount: 0,
                discountType: "fixed",
                discountPercent: 0,
                discountLabel: "Diskon Khusus Negosiasi Proyek",
                revision: 0,
                taxRate: taxRate,
                taxType: "exclude",
                taxAmount: taxAmount,
                grandTotal: grandTotal,
                hideTaxInPrint: true,
                terms: "1. Harga penawaran di atas adalah Netto (Exclude PPN 11%).\n2. Garansi unit perangkat keras resmi 2 (dua) tahun penggantian unit baru.\n3. Garansi pemeliharaan teknis & jasa instalasi selama 6 (enam) bulan.\n4. Gratis setting integrasi cloud monitoring smartphone iOS / Android.\n5. Pembayaran: DP 50% saat PO terbit, Pelunasan 50% setelah serah terima pekerjaan (BAST).",
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
                projectName: `Pengadaan CCTV 4 Titik - ${customerName}`,
                branchId: "dstech_branch_1",
                warehouseId: "dstech_wh_1",
              };

              finData.quotations.unshift(newSphDoc);
              fs.writeFileSync(financeFilePath, JSON.stringify(finData, null, 2), "utf-8");

              executionResult = {
                type: "SPH_CREATED",
                quotationNumber: sphNumber,
                customerName: customerName,
                subtotal: subtotal,
                grandTotal: grandTotal,
                link: "/admin/finance?tab=quotations",
              };

              aiResponseText = `Siap Pak Ramadhani! Saya (Dewi Sartika) telah selesai menerbitkan Surat Penawaran Harga resmi #${sphNumber} untuk ${customerName} dengan total Rp ${subtotal.toLocaleString("id-ID")} (Exclude PPN 11%). Dokumen telah otomatis masuk ke sistem Keuangan & ERP dan siap Bapak review atau cetak PDF!`;
            }
          } catch (finErr: any) {
            console.error("Error executing Dewi Finance SPH action:", finErr);
          }
        }
      }

      if (targetEmp.id === "emp_reza_catalog") {
        const lowerCmd = promptCommand.toLowerCase();
        const urlMatch = promptCommand.match(/https?:\/\/[^\s]+/i);
        if (!urlMatch && (lowerCmd.includes("shopee") || lowerCmd.includes("tokopedia") || lowerCmd.includes("toko"))) {
          aiResponseText = `Siap Pak Ramadhani! Saya (Reza Firmansyah) sudah menyiapkan mesin scraper katalog produk dengan aturan markup harga +50%. Namun pada instruksi Bapak, tautan link URL toko Shopee Tekno20 belum terlampir. Mohon ketik atau tempelkan link URL tokonya di sini (contoh: https://shopee.co.id/tekno20) agar detik ini juga langsung saya sedot dan masukkan ke katalog master produk kita!`;
          executionResult = {
            type: "WAITING_SHOPEE_URL",
            message: "Menunggu lampiran URL toko Shopee Tekno20 dari Direktur Utama",
          };
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
