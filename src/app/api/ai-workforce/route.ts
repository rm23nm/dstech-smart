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

      // Fallback jika API key tidak tersedia / timeout
      if (!aiResponseText) {
        aiResponseText = `Siap, Pak Ramadhani! Instruksi "${promptCommand}" segera saya tindak lanjuti dan selesaikan detik ini juga sesuai SOP divisi kami.`;
      }

      // Update state karyawan
      targetEmp.status = "WORKING";
      targetEmp.speech_bubble = aiResponseText;
      targetEmp.current_activity = `Menjalankan instruksi direktur: "${promptCommand}"`;

      // Catat ke recent logs
      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        employee_id: targetEmp.id,
        employee_name: targetEmp.name,
        action: `Instruksi Direktur: "${promptCommand}" -> Dieksekusi oleh ${targetEmp.name}.`
      };

      data.dstech_recent_logs.unshift(newLog);
      if (data.dstech_recent_logs.length > 25) {
        data.dstech_recent_logs = data.dstech_recent_logs.slice(0, 25);
      }

      writeWorkforceData(data);

      return NextResponse.json({
        success: true,
        message: "Perintah berhasil didelegasikan!",
        targetedEmployee: targetEmp,
        aiResponse: aiResponseText,
        log: newLog
      });
    }

    return NextResponse.json({ success: false, error: "Action tidak valid" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
