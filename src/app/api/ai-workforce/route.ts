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
    if (!parsed.dstech_approval_queue) {
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
            executedResult = { docType: "PROMOTION", title: newPromo.title, link: "/admin/promotions" };
          }
        }
      } catch (execErr: any) {
        console.error("Gagal mengeksekusi payload persetujuan:", execErr);
      }

      // Update status item
      item.status = "APPROVED";
      item.reviewed_at = new Date().toISOString();
      item.reviewer_notes = "Disetujui resmi oleh Direktur Utama (Ramadhani ST)";

      // Catat log
      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        employee_id: item.employee_id,
        employee_name: item.employee_name,
        action: `[DISETUJUI DIREKTUR] Pekerjaan "${item.title}" disahkan dan dicatat resmi ke database sistem oleh Ramadhani ST.`,
      };
      data.dstech_recent_logs.unshift(newLog);
      writeWorkforceData(data);

      return NextResponse.json({
        success: true,
        message: `Pekerjaan "${item.title}" berhasil disetujui & dicatat resmi ke sistem!`,
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
        }
      ];

      data.dstech_approval_queue.unshift(...autopilotTasks);
      
      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: nowStr,
        employee_id: "emp_dewi_finance",
        employee_name: "AI Workforce Autopilot",
        action: `[AUTOPILOT SELESAI] Staf AI telah menyelesaikan 2 tugas mandiri dan memasukkannya ke Kotak Persetujuan Pimpinan.`,
      };
      data.dstech_recent_logs.unshift(newLog);
      writeWorkforceData(data);

      return NextResponse.json({
        success: true,
        message: "Autopilot staf AI berhasil dijalankan! 2 draf tugas baru telah masuk ke Kotak Persetujuan.",
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
