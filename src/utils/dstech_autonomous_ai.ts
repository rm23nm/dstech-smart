import fs from "fs";
import path from "path";

const WORKFORCE_FILE = path.join(process.cwd(), "src", "data", "dstech_ai_workforce.json");
const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
const DAILY_REPORTS_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_daily_reports.json");
const TASKS_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_tasks.json");
const PRODUCTS_FILE = path.join(process.cwd(), "src", "data", "dstech_products.json");
const PROMOTIONS_FILE = path.join(process.cwd(), "src", "data", "dstech_promotions.json");

/**
 * Filter Cerdas Memori Penolakan & Evaluasi Direktur Utama
 * Mencegah AI Agent mengajukan kembali usulan yang pernah ditolak/dihapus Direktur
 */
export function isProposalBlockedByDirector(
  taskType: string,
  title: string,
  client: string,
  wfData: any
): { blocked: boolean; reason?: string } {
  const dismissed = Array.isArray(wfData.dstech_dismissed_topics) ? wfData.dstech_dismissed_topics : [];
  const evaluations = Array.isArray(wfData.dstech_director_evaluations) ? wfData.dstech_director_evaluations : [];
  const allBlacklist = [...dismissed, ...evaluations];

  const lowerTitle = (title || "").toLowerCase();
  const lowerClient = (client || "").toLowerCase();
  const cleanKeyword = lowerTitle
    .replace(/^(?:usulan|draf|pengadaan|restok|suku cadang|sph|invoice|penawaran|materi promo|promo spesial)[:\s\-_]*/gi, "")
    .replace(/\(stok:\s*\d+[^)]*\)/gi, "")
    .replace(/po-[a-z0-9\-_]+/gi, "")
    .trim();

  // 1. Cek terhadap Memori Penolakan & Evaluasi Direktur
  for (const item of allBlacklist) {
    const itemTitle = (item.title || "").toLowerCase();
    const itemClient = (item.client || "").toLowerCase();
    const itemClean = (item.clean_keyword || itemTitle)
      .replace(/^(?:usulan|draf|pengadaan|restok|suku cadang|sph|invoice|penawaran|materi promo|promo spesial)[:\s\-_]*/gi, "")
      .replace(/\(stok:\s*\d+[^)]*\)/gi, "")
      .trim();

    if (lowerTitle && itemTitle && (lowerTitle === itemTitle || lowerTitle.includes(itemTitle) || itemTitle.includes(lowerTitle))) {
      return { blocked: true, reason: item.reason || "Pernah ditolak/dievaluasi oleh Direktur Utama" };
    }

    if (cleanKeyword && itemClean && cleanKeyword.length > 3 && itemClean.length > 3) {
      if (cleanKeyword.includes(itemClean) || itemClean.includes(cleanKeyword)) {
        return { blocked: true, reason: item.reason || "Topik usulan serupa pernah ditolak Direktur Utama" };
      }
    }

    if (lowerClient && itemClient && (lowerClient.includes(itemClient) || itemClient.includes(lowerClient)) && item.task_type === taskType) {
      return { blocked: true, reason: item.reason || `Pekerjaan untuk klien ${client} pernah ditolak Direktur Utama` };
    }

    if (/stok\s*0|zero\s*asset|restok|stok\s*habis/i.test(item.reason || "") && /restok|pengadaan\s*suku\s*cadang/i.test(lowerTitle)) {
      return { blocked: true, reason: item.reason || "Pengajuan restok dilarang sesuai kebijakan zero physical stock" };
    }
  }

  // 2. Cek apakah ada di antrean yang berstatus REJECTED
  if (Array.isArray(wfData.dstech_approval_queue)) {
    const rejectedItem = wfData.dstech_approval_queue.find((q: any) => {
      if (q.status !== "REJECTED") return false;
      const qTitle = (q.title || "").toLowerCase();
      const qClient = (q.target_client || q.payload?.customerName || "").toLowerCase();
      return (lowerTitle && qTitle && (lowerTitle.includes(qTitle) || qTitle.includes(lowerTitle))) ||
             (cleanKeyword && qTitle.includes(cleanKeyword)) ||
             (lowerClient && qClient && (lowerClient.includes(qClient) || qClient.includes(lowerClient)) && q.task_type === taskType);
    });
    if (rejectedItem) {
      return { blocked: true, reason: rejectedItem.reviewer_notes || "Usulan ini pernah ditolak Direktur Utama dan belum direvisi" };
    }
  }

  return { blocked: false };
}

function readJsonSafely(filePath: string, fallback: any = {}): any {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`[Autonomous AI] Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonSafely(filePath: string, data: any): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`[Autonomous AI] Error writing ${filePath}:`, err);
    return false;
  }
}

/**
 * 1. DEWI SARTIKA: Pembuatan Draf Invoice / Faktur Penjualan Otonom saat Proyek Selesai
 */
export function triggerDewiAutonomousProjectInvoice(project: any) {
  if (!project || !project.id) return { success: false, reason: "Project invalid" };

  const finData = readJsonSafely(FINANCE_FILE, { projects: [], sales: [] });
  const wfData = readJsonSafely(WORKFORCE_FILE, {
    dstech_approval_queue: [],
    dstech_recent_logs: [],
    dstech_employees: [],
    dstech_dismissed_topics: [],
  });

  if (!Array.isArray(wfData.dstech_approval_queue)) wfData.dstech_approval_queue = [];
  if (!Array.isArray(wfData.dstech_recent_logs)) wfData.dstech_recent_logs = [];
  if (!Array.isArray(wfData.dstech_employees)) wfData.dstech_employees = [];
  if (!Array.isArray(wfData.dstech_dismissed_topics)) wfData.dstech_dismissed_topics = [];

  const projectId = project.id;
  const projectCode = project.projectCode || projectId;
  const projectName = project.projectName || project.name || "Pekerjaan Proyek Lapangan";
  const clientName = project.clientName || project.client || "Klien DSTech";

  // Cek apakah proyek sudah pernah dibuatkan invoice di sales
  const sales = Array.isArray(finData.sales) ? finData.sales : [];
  const hasExistingSale = sales.some(
    (s: any) =>
      s.projectId === projectId ||
      (s.invoiceNumber && project.invoiceNumber && s.invoiceNumber === project.invoiceNumber) ||
      (s.projectName && s.projectName.trim().toLowerCase() === projectName.trim().toLowerCase())
  );
  if (hasExistingSale || project.isBilled) {
    return { success: false, reason: "Proyek sudah memiliki invoice resmi di sistem ERP" };
  }

  // Cek apakah draf invoice untuk proyek ini sudah ada di approval queue (pending atau approved)
  const existingQueue = wfData.dstech_approval_queue.find(
    (q: any) =>
      q.task_type === "INVOICE_PROPOSAL" &&
      q.status !== "REJECTED" &&
      (q.payload?.projectId === projectId ||
        (q.title && q.title.includes(projectCode)) ||
        (q.payload?.projectName && q.payload.projectName.trim().toLowerCase() === projectName.trim().toLowerCase()))
  );
  if (existingQueue) {
    return { success: false, reason: "Draf invoice untuk proyek ini sudah ada di antrean persetujuan", queueId: existingQueue.id };
  }

  // Cek memori evaluasi & penolakan Direktur Utama
  const dewiCheck = isProposalBlockedByDirector("INVOICE_PROPOSAL", projectName, clientName, wfData);
  if (dewiCheck.blocked) {
    return { success: false, reason: `Draf invoice dicegah AI Guard: ${dewiCheck.reason}` };
  }

  const now = new Date();
  const yearMonth = now.toISOString().slice(0, 7).replace("-", "");
  const draftInvoiceNumber = `INV-DSTECH-${yearMonth}-${String(sales.length + 1).padStart(3, "0")}`;

  const contractVal = Number(project.contractValue) || 0;
  const isNonPt = project.businessEntity === "NON_PT";
  const taxRate = isNonPt ? 0 : 11;
  const taxAmount = taxRate > 0 ? Math.round(contractVal * 0.11) : 0;
  const grandTotal = contractVal + taxAmount;

  const items = Array.isArray(project.items) && project.items.length > 0
    ? project.items
    : [
        {
          id: "1",
          productId: "",
          productName: `Pekerjaan Selesai: ${projectName} (${projectCode})`,
          qty: 1,
          unit: "Paket",
          price: contractVal,
          total: contractVal,
        },
      ];

  const invoiceProposal = {
    id: `appr_dewi_inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    revision: 0,
    employee_id: "emp_dewi_finance",
    employee_name: "Dewi Sartika",
    employee_role: "AI Finance & Tax Billing Specialist",
    department: "FINANCE",
    task_type: "INVOICE_PROPOSAL",
    title: `Draf Faktur Penjualan (Invoice): ${projectName} - ${clientName}`,
    target_client: clientName,
    value: grandTotal,
    tax_type: taxRate > 0 ? "exclude" : "none",
    summary: `[OTONOM PROYEK SELESAI] Dewi Sartika mendeteksi Proyek "${projectName}" (${projectCode}) telah tuntas (Status: Completed). Secara otonom menyusun draf Faktur Penjualan resmi senilai Rp ${grandTotal.toLocaleString("id-ID")} untuk ${clientName}. Menunggu pengesahan Direktur Utama (Bpk. Ramadhani ST) sebelum dicatat ke Buku Penjualan & Piutang ERP.`,
    status: "PENDING_APPROVAL",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    payload: {
      id: `dstech_inv_${Date.now()}`,
      invoiceNumber: draftInvoiceNumber,
      projectId: projectId,
      projectCode: projectCode,
      projectName: projectName,
      customerName: clientName,
      customerPhone: project.clientPhone || "0812-9988-7766",
      customerAddress: project.clientAddress || "Area Klien Banten / Jabodetabek",
      businessEntity: project.businessEntity || "PT",
      date: now.toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      invoiceType: "Pelunasan Proyek Selesai",
      items: items,
      subtotal: contractVal,
      discount: 0,
      discountType: "fixed",
      discountPercent: 0,
      discountLabel: "Diskon Khusus Proyek",
      taxRate: taxRate,
      taxType: taxRate > 0 ? "exclude" : "none",
      taxAmount: taxAmount,
      grandTotal: grandTotal,
      paymentMethod: "Transfer Bank BCA (295-074-0321 - PT. DSTech Smart Perkasa) / Mandiri (163-00-0435889-1)",
      paymentStatus: "Belum Lunas",
      paidAmount: 0,
      remainingAmount: grandTotal,
      warehouseId: "dstech_wh_1",
      branchId: "dstech_branch_1",
      salesPerson: project.picProject || "RAMADHANI ST",
      notes: `Faktur penagihan diterbitkan secara otonom atas penyelesaian tuntas proyek ${projectName} (${projectCode}). Berita Acara Serah Terima (BAST) terlampir.`,
      approvalStatus: "Menunggu Approval",
      isAutonomousGenerated: true,
    },
  };

  wfData.dstech_approval_queue.unshift(invoiceProposal);

  // Update speech bubble Dewi Sartika
  const dewiIdx = wfData.dstech_employees.findIndex((e: any) => e.id === "emp_dewi_finance");
  if (dewiIdx !== -1) {
    wfData.dstech_employees[dewiIdx].speech_bubble = `Pak Ramadhani, saya mendeteksi proyek "${projectName}" sudah selesai! Draf Invoicenya (${draftInvoiceNumber}) senilai Rp ${grandTotal.toLocaleString("id-ID")} sudah saya siapkan di Kotak Persetujuan untuk Bapak sahkan.`;
    wfData.dstech_employees[dewiIdx].status = "WORKING";
  }

  // Catat log otonom
  wfData.dstech_recent_logs.unshift({
    id: `log_inv_${Date.now()}`,
    timestamp: new Date().toISOString(),
    employee_id: "emp_dewi_finance",
    employee_name: "Dewi Sartika",
    action: `[OTONOM PROYEK SELESAI] Dewi Sartika secara proaktif membuat Draf Faktur Penjualan (${draftInvoiceNumber}) senilai Rp ${grandTotal.toLocaleString("id-ID")} untuk proyek selesai "${projectName}" (${clientName}) ke Kotak Persetujuan Direktur Utama.`,
  });

  writeJsonSafely(WORKFORCE_FILE, wfData);
  return { success: true, proposal: invoiceProposal };
}

/**
 * 2. DENI KURNIAWAN: Perangkuman Laporan Progres & Berita Acara Foto Lapangan Teknisi Otonom
 */
export function triggerDeniAutonomousProgressReport(reportData: any) {
  if (!reportData) return { success: false, reason: "Data laporan tidak valid" };

  const rawPhotos = Array.isArray(reportData.photos) ? reportData.photos : [];
  if (rawPhotos.length === 0) {
    return { success: false, reason: "Laporan tidak menyertakan foto dokumentasi" };
  }

  const wfData = readJsonSafely(WORKFORCE_FILE, {
    dstech_approval_queue: [],
    dstech_recent_logs: [],
    dstech_employees: [],
  });

  if (!Array.isArray(wfData.dstech_approval_queue)) wfData.dstech_approval_queue = [];
  if (!Array.isArray(wfData.dstech_recent_logs)) wfData.dstech_recent_logs = [];
  if (!Array.isArray(wfData.dstech_employees)) wfData.dstech_employees = [];

  const reportId = reportData.id || `rep_${Date.now()}`;
  const taskId = reportData.taskId || reportData.ticketNumber || "";
  const projectId = reportData.projectId || "";
  const projectName = reportData.projectName || reportData.taskTitle || "Pekerjaan Lapangan DSTech";
  const clientName = reportData.clientName || reportData.client || "Klien DSTech";
  const technicianName = reportData.employeeName || reportData.technician || "Teknisi Lapangan";
  const progressPercentage = Number(reportData.progressPercentage) || 0;
  const location = reportData.location || "Area Klien";
  const activityDescription = reportData.activityDescription || reportData.report || "Pengerjaan fisik dan inspeksi teknis lapangan.";

  // Format photos normalizer
  const photos = rawPhotos.map((p: any, idx: number) => {
    if (typeof p === "string") {
      return {
        id: `photo_${idx + 1}`,
        url: p,
        caption: `Foto Dokumentasi Lapangan Titik #${idx + 1} (${projectName})`,
        category: "progress",
        createdAt: new Date().toISOString(),
      };
    }
    return {
      id: p.id || `photo_${idx + 1}`,
      url: p.url || p.data || "/service-cctv.png",
      caption: p.caption || `Dokumentasi Titik #${idx + 1} (${technicianName})`,
      category: p.category || "progress",
      createdAt: p.createdAt || new Date().toISOString(),
    };
  });

  // Cek memori evaluasi & penolakan Direktur Utama
  const deniCheck = isProposalBlockedByDirector("FIELD_PROGRESS_REPORT", projectName, clientName, wfData);
  if (deniCheck.blocked) {
    return { success: false, reason: `Draf BAKP dicegah AI Guard: ${deniCheck.reason}` };
  }

  // Cek apakah laporan ini sudah pernah dirangkum sebelumnya di queue (pending atau approved)
  const existingQueue = wfData.dstech_approval_queue.find(
    (q: any) =>
      q.task_type === "FIELD_PROGRESS_REPORT" &&
      ((q.payload?.reportId && q.payload.reportId === reportId) ||
        (q.payload?.taskId && q.payload.taskId === taskId && q.payload.progressPercentage === progressPercentage))
  );
  if (existingQueue) {
    return { success: false, reason: "Laporan progres ini sudah dirangkum sebelumnya", queueId: existingQueue.id };
  }

  const now = new Date();
  const yearMonth = now.toISOString().slice(0, 7).replace("-", "");
  const bakpNumber = `BAKP-DSTECH-${yearMonth}-${String(Date.now()).slice(-4)}`;

  const progressProposal = {
    id: `appr_deni_bakp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    revision: 0,
    employee_id: "emp_deni_field",
    employee_name: "Deni Kurniawan",
    employee_role: "AI Field Operations & Dispatcher",
    department: "OPERATIONS",
    task_type: "FIELD_PROGRESS_REPORT",
    title: `Berita Acara Kemajuan Pekerjaan & Foto Lapangan: ${projectName} (${progressPercentage}%)`,
    target_client: clientName,
    value: progressPercentage,
    tax_type: "none",
    summary: `[OTONOM DOKUMENTASI FOTO] Deni Kurniawan telah merangkum ${photos.length} foto dokumentasi lapangan dari teknisi ${technicianName} untuk ${projectName} (${clientName}). Capaian Progres: ${progressPercentage}%. Uraian: "${activityDescription}". Menunggu pengesahan Berita Acara Resmi oleh Direktur Utama (Bpk. Ramadhani ST).`,
    status: "PENDING_APPROVAL",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    payload: {
      reportId: reportId,
      reportNumber: bakpNumber,
      date: reportData.date || now.toISOString().split("T")[0],
      reportTime: reportData.reportTime || "17:00 WIB",
      technicianName: technicianName,
      technicianPhone: reportData.technicianPhone || "+6282259494242",
      projectName: projectName,
      projectId: projectId,
      projectCode: reportData.projectCode || "",
      taskId: taskId,
      ticketNumber: reportData.ticketNumber || taskId,
      clientName: clientName,
      location: location,
      progressPercentage: progressPercentage,
      activityDescription: activityDescription,
      photos: photos,
      blockers: reportData.blockers || "Tidak ada kendala berarti (Aman & Lancar)",
      nextAction: reportData.nextAction || "Melanjutkan tahapan commissioning dan finalisasi",
      statusAfter: reportData.statusAfter || (progressPercentage >= 100 ? "Completed" : "In Progress"),
      isAutonomousGenerated: true,
      approvalStatus: "Menunggu Pengesahan",
    },
  };

  wfData.dstech_approval_queue.unshift(progressProposal);

  // Update speech bubble Deni Kurniawan
  const deniIdx = wfData.dstech_employees.findIndex((e: any) => e.id === "emp_deni_field");
  if (deniIdx !== -1) {
    wfData.dstech_employees[deniIdx].speech_bubble = `Pak Ramadhani, saya baru saja merangkum ${photos.length} foto progres lapangan dari teknisi ${technicianName} menjadi Berita Acara (${bakpNumber}) di Kotak Persetujuan. Silakan diperiksa.`;
    wfData.dstech_employees[deniIdx].status = "WORKING";
  }

  // Catat log otonom
  wfData.dstech_recent_logs.unshift({
    id: `log_bakp_${Date.now()}`,
    timestamp: new Date().toISOString(),
    employee_id: "emp_deni_field",
    employee_name: "Deni Kurniawan",
    action: `[OTONOM DOKUMENTASI FOTO] Deni Kurniawan menyusun Berita Acara Lapangan (${bakpNumber}) beserta ${photos.length} foto bukti kerja teknisi ${technicianName} untuk "${projectName}" (${progressPercentage}%) ke Kotak Persetujuan Direktur Utama.`,
  });

  writeJsonSafely(WORKFORCE_FILE, wfData);
  return { success: true, proposal: progressProposal };
}

/**
 * 3. BAMBANG PRAKOSO: Pembuatan Draf Surat Penawaran Harga (SPH) Otonom dari Inquiry Klien
 */
export function triggerBambangAutonomousSPH(inquiryData: any) {
  if (!inquiryData) return { success: false, reason: "Inquiry invalid" };

  const finData = readJsonSafely(FINANCE_FILE, { quotations: [] });
  const wfData = readJsonSafely(WORKFORCE_FILE, {
    dstech_approval_queue: [],
    dstech_recent_logs: [],
    dstech_employees: [],
    dstech_dismissed_topics: [],
  });

  if (!Array.isArray(wfData.dstech_approval_queue)) wfData.dstech_approval_queue = [];
  if (!Array.isArray(wfData.dstech_recent_logs)) wfData.dstech_recent_logs = [];
  if (!Array.isArray(wfData.dstech_employees)) wfData.dstech_employees = [];
  if (!Array.isArray(wfData.dstech_dismissed_topics)) wfData.dstech_dismissed_topics = [];

  const clientName = inquiryData.clientName || inquiryData.customerName || "Calon Klien DSTech";
  const clientOrg = inquiryData.clientOrg || inquiryData.company || clientName;
  const clientPhone = inquiryData.clientPhone || inquiryData.phone || "0812-9988-7766";
  const clientAddress = inquiryData.clientAddress || inquiryData.address || "Area Banten / Jabodetabek";
  const subject = inquiryData.subject || inquiryData.title || `Penawaran Perangkat & Sistem Smart Solution (${clientOrg})`;

  // Cek memori evaluasi & penolakan Direktur Utama
  const budiCheck = isProposalBlockedByDirector("SPH_PROPOSAL", subject, clientName, wfData);
  if (budiCheck.blocked) {
    return { success: false, reason: `Draf SPH dicegah AI Guard: ${budiCheck.reason}` };
  }

  // Cek antrean duplikat
  const existingQueue = wfData.dstech_approval_queue.find(
    (q: any) =>
      q.task_type === "SPH_PROPOSAL" &&
      q.status !== "REJECTED" &&
      q.target_client &&
      q.target_client.trim().toLowerCase() === clientName.trim().toLowerCase()
  );
  if (existingQueue) {
    return { success: false, reason: "Draf SPH untuk klien ini sudah ada di antrean persetujuan", queueId: existingQueue.id };
  }

  // Siapkan item penawaran (dari inquiry atau katalog produk)
  let items = Array.isArray(inquiryData.items) && inquiryData.items.length > 0 ? inquiryData.items : [];
  if (items.length === 0) {
    const productsData = readJsonSafely(PRODUCTS_FILE, []);
    const barrierProd = productsData.find((p: any) => p.name?.toLowerCase().includes("barrier") || p.category?.toLowerCase().includes("barrier")) || {
      name: "Paket Barrier Gate Otomatis MX-Series Heavy Duty",
      price: 18500000,
      costPrice: 13000000,
    };
    items = [
      {
        id: "1",
        productName: barrierProd.name || "Paket Barrier Gate Otomatis High Speed",
        qty: 1,
        unit: "Paket",
        price: barrierProd.price || 18500000,
        total: barrierProd.price || 18500000,
        notes: "Unit motor, palang octagonal 3m/4m, wireless remote & loop detector",
      },
      {
        id: "2",
        productName: "Jasa Instalasi, Commissioning & Pemasangan Kabel Power Ground",
        qty: 1,
        unit: "Titik",
        price: 2500000,
        total: 2500000,
        notes: "Termasuk pondasi cor, angkur, instalasi pipa conduit & testing sistem",
      },
    ];
  }

  const subtotal = items.reduce((acc: number, cur: any) => acc + (Number(cur.total) || Number(cur.price) * (Number(cur.qty) || 1) || 0), 0);
  const taxRate = inquiryData.businessEntity === "NON_PT" ? 0 : 11;
  const taxAmount = taxRate > 0 ? Math.round(subtotal * 0.11) : 0;
  const grandTotal = subtotal + taxAmount;

  const now = new Date();
  const yearMonth = now.toISOString().slice(0, 7).replace("-", "");
  const quotations = Array.isArray(finData.quotations) ? finData.quotations : [];
  const draftSphNumber = `SPH-DSTECH-${yearMonth}-${String(quotations.length + 1).padStart(3, "0")}`;

  const sphProposal = {
    id: `appr_bambang_sph_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    revision: 0,
    employee_id: "emp_bambang_sales",
    employee_name: "Bambang Prakoso",
    employee_role: "AI Sales & Tender SPH Specialist",
    department: "SALES",
    task_type: "SPH_PROPOSAL",
    title: `Draf Surat Penawaran Harga (SPH): ${subject}`,
    target_client: clientName,
    value: grandTotal,
    tax_type: taxRate > 0 ? "exclude" : "none",
    summary: `[OTONOM INQUIRY SPH] Bambang Prakoso telah menganalisis permintaan kebutuhan dari ${clientName} (${clientOrg}) dan menyusun Draf SPH resmi (${draftSphNumber}) senilai Rp ${grandTotal.toLocaleString("id-ID")}. Penawaran mencakup ${items.length} item pekerjaan, garansi 1 tahun, dan PPN 11%. Menunggu pengesahan Direktur Utama (Bpk. Ramadhani ST).`,
    status: "PENDING_APPROVAL",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    payload: {
      quotationNumber: draftSphNumber,
      customerName: clientName,
      customerOrg: clientOrg,
      customerPhone: clientPhone,
      customerAddress: clientAddress,
      subject: subject,
      date: now.toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      validityDays: 14,
      items: items,
      subtotal: subtotal,
      discount: 0,
      taxRate: taxRate,
      taxType: taxRate > 0 ? "exclude" : "none",
      taxAmount: taxAmount,
      grandTotal: grandTotal,
      terms: "1. Harga penawaran adalah Netto Exclude PPN 11%.\n2. Garansi unit hardware resmi 1 (satu) tahun ganti baru.\n3. Garansi pemeliharaan & instalasi selama 6 bulan.\n4. Pembayaran: DP 50% saat PO terbit, Pelunasan 50% setelah serah terima pekerjaan (BAST).",
      approvalStatus: "Menunggu Approval",
      isAutonomousGenerated: true,
      businessEntity: inquiryData.businessEntity || "PT",
    },
  };

  wfData.dstech_approval_queue.unshift(sphProposal);

  // Update speech bubble Bambang Prakoso
  const bambangIdx = wfData.dstech_employees.findIndex((e: any) => e.id === "emp_bambang_sales");
  if (bambangIdx !== -1) {
    wfData.dstech_employees[bambangIdx].speech_bubble = `Pak Ramadhani, saya mendeteksi inquiry dari ${clientName}! Draf SPH resmi (${draftSphNumber}) senilai Rp ${grandTotal.toLocaleString("id-ID")} sudah saya susun di Kotak Persetujuan untuk Bapak sahkan.`;
    wfData.dstech_employees[bambangIdx].status = "WORKING";
  }

  // Catat log otonom
  wfData.dstech_recent_logs.unshift({
    id: `log_sph_${Date.now()}`,
    timestamp: now.toISOString(),
    employee_id: "emp_bambang_sales",
    employee_name: "Bambang Prakoso",
    action: `[OTONOM INQUIRY SPH] Bambang Prakoso menyusun Draf SPH (${draftSphNumber}) senilai Rp ${grandTotal.toLocaleString("id-ID")} untuk "${clientName}" (${subject}) ke Kotak Persetujuan Direktur Utama.`,
  });

  writeJsonSafely(WORKFORCE_FILE, wfData);
  return { success: true, proposal: sphProposal };
}

/**
 * 4. REZA FIRMANSYAH: Pemantauan Stok Menipis & Draf PO Pengadaan Otonom
 */
/**
 * Penyelarasan & Audit Harga Harian AI Agent Reza Firmansyah (Margin Keuntungan 50% dari Harga Referensi)
 */
export function syncAndAuditAutonomousProductPrices(applyUpdates = true) {
  const products = readJsonSafely(PRODUCTS_FILE, []);
  if (!Array.isArray(products) || products.length === 0) {
    return { success: true, auditedCount: 0, updatedCount: 0, updates: [] };
  }

  let auditedCount = 0;
  let updatedCount = 0;
  const updates: any[] = [];
  const now = new Date().toISOString();

  for (const p of products) {
    const cost = Number(p.costPrice) || 0;
    if (cost <= 0) continue;

    auditedCount++;
    const targetPrice = Math.round(cost * 1.5);
    const currentPrice = Number(p.price) || 0;

    if (Math.abs(currentPrice - targetPrice) > 100) {
      updatedCount++;
      updates.push({
        id: p.id,
        name: p.name,
        oldPrice: currentPrice,
        newPrice: targetPrice,
        costPrice: cost,
        sourceUrl: p.sourceUrl || p.dstech_source_url || "",
      });

      if (applyUpdates) {
        p.price = targetPrice;
        p.lastPriceAudit = now;
        p.dstech_margin_policy = "50%_OF_REFERENCE_COST";
        if (!Array.isArray(p.priceHistory)) p.priceHistory = [];
        p.priceHistory.push({
          date: now,
          costPrice: cost,
          price: targetPrice,
          marginPercent: 50,
          sourceUrl: p.sourceUrl || p.dstech_source_url || "",
          note: "Penyelarasan Harian AI Agent Reza (Margin 50% dari Harga Referensi)",
        });
      }
    }
  }

  if (applyUpdates && updatedCount > 0) {
    writeJsonSafely(PRODUCTS_FILE, products);

    // Catat ke log aktivitas AI Workforce
    try {
      const wfData = readJsonSafely(WORKFORCE_FILE, {});
      if (!Array.isArray(wfData.dstech_recent_logs)) wfData.dstech_recent_logs = [];
      wfData.dstech_recent_logs.unshift({
        id: `log_price_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        type: "PRICE_SYNC",
        message: `Reza Firmansyah menyelaraskan harga ${updatedCount} produk: harga jual diperbarui dengan margin keuntungan 50% dari harga referensi.`,
        badge: "MARGIN 50%",
      });
      if (wfData.dstech_recent_logs.length > 50) wfData.dstech_recent_logs = wfData.dstech_recent_logs.slice(0, 50);

      for (const emp of wfData.dstech_employees || []) {
        if (emp.id === "emp_reza_catalog") {
          emp.speech_bubble = `Pak Ramadhani, saya telah menyelaraskan harga jual katalog (${updatedCount} produk diperbarui) agar tepat dengan batasan margin keuntungan 50% dari harga referensi.`;
        }
      }
      writeJsonSafely(WORKFORCE_FILE, wfData);
    } catch (e) {}
  }

  return { success: true, auditedCount, updatedCount, updates };
}

export function triggerRezaAutonomousStockRestock(product: any) {
  // Pengajuan restok dinonaktifkan permanen sesuai instruksi Direktur (kebijakan zero physical stock)
  // Perusahaan beroperasi on-demand / pre-order sehingga stok sengaja 0 agar tidak menambah nilai aset pada pembukuan keuangan.
  return {
    success: false,
    reason: "Pengajuan restok dinonaktifkan permanen sesuai kebijakan akuntansi perusahaan (stok fisik sengaja 0 agar tidak membebani nilai aset pembukuan).",
  };
  /* KODE LAMA RESTOK DINONAKTIFKAN PERMANEN:
  if (!product || !product.id) return { success: false, reason: "Produk invalid" };

  const wfData = readJsonSafely(WORKFORCE_FILE, {
    dstech_approval_queue: [],
    dstech_recent_logs: [],
    dstech_employees: [],
  });

  if (!Array.isArray(wfData.dstech_approval_queue)) wfData.dstech_approval_queue = [];
  if (!Array.isArray(wfData.dstech_recent_logs)) wfData.dstech_recent_logs = [];
  if (!Array.isArray(wfData.dstech_employees)) wfData.dstech_employees = [];

  const prodId = product.id;
  const prodName = product.name || "Perangkat Sparepart DSTech";

  // Cek antrean duplikat
  const existingQueue = wfData.dstech_approval_queue.find(
    (q: any) =>
      q.task_type === "PRODUCT_IMPORT" &&
      q.status !== "REJECTED" &&
      ((q.payload?.productId && q.payload.productId === prodId) ||
        (q.title && q.title.includes(prodName)))
  );
  if (existingQueue) {
    return { success: false, reason: "Usulan pengadaan produk ini sudah ada di antrean persetujuan", queueId: existingQueue.id };
  }

  const orderQty = 10;
  const unitCost = Number(product.costPrice) || Math.round((Number(product.price) || 500000) * 0.7);
  const estimatedCost = orderQty * unitCost;

  const now = new Date();
  const yearMonth = now.toISOString().slice(0, 7).replace("-", "");
  const poNumber = `PO-RESTOK-${yearMonth}-${String(Date.now()).slice(-4)}`;

  const restockProposal = {
    id: `appr_reza_restok_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    revision: 0,
    employee_id: "emp_reza_catalog",
    employee_name: "Reza Firmansyah",
    employee_role: "AI Procurement & Warehouse Specialist",
    department: "CATALOG_ESTORE",
    task_type: "PRODUCT_IMPORT",
    title: `Usulan Pengadaan & Restok Suku Cadang: ${prodName} (Stok: ${currentStock} ${product.unit || 'Unit'})`,
    target_client: "Katalog E-Store & Gudang Cilegon",
    value: estimatedCost,
    tax_type: "none",
    summary: `[OTONOM MONITORING GUDANG] Reza Firmansyah mendeteksi stok ${prodName} di Gudang Operasional menipis tersisa ${currentStock} ${product.unit || 'Unit'} (di bawah batas minimum 2 unit). Merekomendasikan Purchase Order restok pengadaan ${orderQty} ${product.unit || 'Unit'} dengan estimasi anggaran modal Rp ${estimatedCost.toLocaleString("id-ID")}. Menunggu persetujuan Direktur Utama.`,
    status: "PENDING_APPROVAL",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    payload: {
      productId: prodId,
      productName: prodName,
      category: product.category || "Hardware & Sparepart",
      currentStock: currentStock,
      orderQty: orderQty,
      unitCost: unitCost,
      estimatedCost: estimatedCost,
      poNumber: poNumber,
      supplierName: product.brand || "Distributor Resmi Hardware",
      warehouseTarget: "dstech_wh_1 (Gudang Utama Cilegon)",
      isAutonomousGenerated: true,
      approvalStatus: "Menunggu Persetujuan",
    },
  };

  wfData.dstech_approval_queue.unshift(restockProposal);

  // Update speech bubble Reza Firmansyah
  const rezaIdx = wfData.dstech_employees.findIndex((e: any) => e.id === "emp_reza_catalog");
  if (rezaIdx !== -1) {
    wfData.dstech_employees[rezaIdx].speech_bubble = `Pak Ramadhani, stok ${prodName} di gudang tersisa ${currentStock} ${product.unit || 'unit'}. Draf PO pengadaan barang (${poNumber}) senilai Rp ${estimatedCost.toLocaleString("id-ID")} sudah saya siapkan di Kotak Persetujuan.`;
    wfData.dstech_employees[rezaIdx].status = "WORKING";
  }

  // Catat log otonom
  wfData.dstech_recent_logs.unshift({
    id: `log_restok_${Date.now()}`,
    timestamp: now.toISOString(),
    employee_id: "emp_reza_catalog",
    employee_name: "Reza Firmansyah",
    action: `[OTONOM MONITORING GUDANG] Reza Firmansyah mengajukan usulan restok ${orderQty} unit ${prodName} (Stok tersisa: ${currentStock}) senilai Rp ${estimatedCost.toLocaleString("id-ID")} ke Kotak Persetujuan Direktur Utama.`,
  });

  writeJsonSafely(WORKFORCE_FILE, wfData);
  return { success: true, proposal: restockProposal };
  */
}

/**
 * 5. NADIA SAFITRI: Pembuatan Draf Kampanye Promo & Konten Pemasaran Otonom
 */
export function triggerNadiaAutonomousMarketing(promoContext?: any) {
  const wfData = readJsonSafely(WORKFORCE_FILE, {
    dstech_approval_queue: [],
    dstech_recent_logs: [],
    dstech_employees: [],
  });

  if (!Array.isArray(wfData.dstech_approval_queue)) wfData.dstech_approval_queue = [];
  if (!Array.isArray(wfData.dstech_recent_logs)) wfData.dstech_recent_logs = [];
  if (!Array.isArray(wfData.dstech_employees)) wfData.dstech_employees = [];

  // Cek memori evaluasi & penolakan Direktur Utama
  const nadiaCheck = isProposalBlockedByDirector("PROMO_CAMPAIGN", "Promo Spesial", "Pemasaran", wfData);
  if (nadiaCheck.blocked) {
    return { success: false, reason: `Draf promosi dicegah AI Guard: ${nadiaCheck.reason}` };
  }

  // Hindari spamming draf marketing jika sudah ada draf marketing aktif yang pending atau rejected
  const hasActiveMarketing = wfData.dstech_approval_queue.some(
    (q: any) =>
      q.employee_id === "emp_nadia_marketing" &&
      q.status === "PENDING_APPROVAL"
  );
  if (hasActiveMarketing) {
    return { success: false, reason: "Draf promosi Nadia masih menunggu persetujuan pimpinan" };
  }

  const now = new Date();
  const theme = promoContext?.theme || "Promo Spesial Paket Smart Barrier Gate Perumahan & Industrial";
  const promoTitle = `Materi Promosi WhatsApp & Reels: ${theme}`;

  const marketingProposal = {
    id: `appr_nadia_promo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    revision: 0,
    employee_id: "emp_nadia_marketing",
    employee_name: "Nadia Safitri",
    employee_role: "AI Creative Marketing & Social Media",
    department: "MARKETING",
    task_type: "PROMO_CAMPAIGN",
    title: promoTitle,
    target_client: "Mitra Pengembang, Pengelola Kawasan & Calon Klien",
    value: 0,
    tax_type: "none",
    summary: `[OTONOM KAMPANYE PROMOSI] Nadia Safitri telah merancang materi siaran WhatsApp Autopilot dan naskah Reels Instagram bertema "${theme}". Siap dipublikasikan untuk meningkatkan prospek masuk. Menunggu persetujuan Direktur Utama.`,
    status: "PENDING_APPROVAL",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    payload: {
      campaignTitle: theme,
      channel: "WhatsApp Broadcast & Social Media",
      targetAudience: "Pengelola Cluster, Kawasan Industri Banten-Jabodetabek, Rumah Sakit, Instansi",
      waMessageCopy: `*PROMO SPESIAL SISTEM PARKIR & BARRIER GATE OTOMATIS* 🚗✨\n\nHalo Sahabat DSTech!\nTingkatkan keamanan dan prestise kawasan perumahan/kantor Anda dengan sistem *Barrier Gate Otomatis High Speed* dari PT. DSTech Smart Perkasa.\n\n✅ Motor Heavy Duty Tahan Panas 24 Jam\n✅ Sensor Kendaraan Wireless Anti-Tabrak\n✅ Integrasi RFID Card / Tap E-Money & Tiket Parkir\n✅ Garansi Resmi 1 Tahun & Free Maintenance 6 Bulan\n\nHubungi tim teknis kami untuk konsultasi dan survei gratis: 0822-5949-4242 / dstechsmart.com`,
      socialMediaCaption: `Sistem portal perumahan Anda masih manual? Saatnya upgrade ke Smart Barrier Gate DSTech! Cepat, presisi, anti-tabrak dengan garansi resmi 1 tahun. Hubungi kami sekarang untuk survei lokasi gratis! 🚀 #BarrierGate #SistemParkir #Cilegon #SmartCity #DSTechSmart`,
      callToAction: "0822-5949-4242 / admin@dstechsmart.com",
      isAutonomousGenerated: true,
      approvalStatus: "Menunggu Approval",
    },
  };

  wfData.dstech_approval_queue.unshift(marketingProposal);

  // Update speech bubble Nadia Safitri
  const nadiaIdx = wfData.dstech_employees.findIndex((e: any) => e.id === "emp_nadia_marketing");
  if (nadiaIdx !== -1) {
    wfData.dstech_employees[nadiaIdx].speech_bubble = `Pak Ramadhani, materi siaran promosi WhatsApp & naskah Reels bertema "${theme}" sudah saya siapkan di Kotak Persetujuan. Mohon disahkan agar bisa segera saya siarkan.`;
    wfData.dstech_employees[nadiaIdx].status = "WORKING";
  }

  // Catat log otonom
  wfData.dstech_recent_logs.unshift({
    id: `log_promo_${Date.now()}`,
    timestamp: now.toISOString(),
    employee_id: "emp_nadia_marketing",
    employee_name: "Nadia Safitri",
    action: `[OTONOM KAMPANYE PROMOSI] Nadia Safitri merancang draf materi promosi "${theme}" untuk disetujui Direktur Utama sebelum disiarkan ke saluran WhatsApp dan medsos.`,
  });

  writeJsonSafely(WORKFORCE_FILE, wfData);
  return { success: true, proposal: marketingProposal };
}

/**
 * 6. SITI NURHALIZA: Triage Layanan Pelanggan & Koordinasi Otonom 24 Jam
 */
export function triggerSitiAutonomousTriage(messageData: any) {
  const wfData = readJsonSafely(WORKFORCE_FILE, {
    dstech_employees: [],
    dstech_recent_logs: [],
  });

  if (!Array.isArray(wfData.dstech_employees)) wfData.dstech_employees = [];
  if (!Array.isArray(wfData.dstech_recent_logs)) wfData.dstech_recent_logs = [];

  const customer = messageData?.name || messageData?.customerName || "Pelanggan DSTech";
  const text = (messageData?.message || messageData?.text || "").toLowerCase();

  let delegatedTo = "Bambang Prakoso (Sales)";
  let triageType = "Inquiry Penawaran";

  if (text.includes("rusak") || text.includes("error") || text.includes("mati") || text.includes("servis") || text.includes("kendala") || text.includes("teknisi")) {
    delegatedTo = "Deni Kurniawan (Operasional Lapangan)";
    triageType = "Keluhan Teknis Lapangan";
  } else if (text.includes("invoice") || text.includes("tagihan") || text.includes("bayar") || text.includes("transfer") || text.includes("rekening")) {
    delegatedTo = "Dewi Sartika (Keuangan)";
    triageType = "Layanan Finansial & Tagihan";
  }

  const now = new Date();
  const sitiIdx = wfData.dstech_employees.findIndex((e: any) => e.id === "emp_siti_cs");
  if (sitiIdx !== -1) {
    wfData.dstech_employees[sitiIdx].speech_bubble = `Pak Ramadhani, saya baru saja merespons pesan masuk dari ${customer} (< 1 menit). Kategori: ${triageType}, koordinasi telah saya teruskan ke rekan ${delegatedTo}.`;
    wfData.dstech_employees[sitiIdx].status = "WORKING";
  }

  wfData.dstech_recent_logs.unshift({
    id: `log_triage_${Date.now()}`,
    timestamp: now.toISOString(),
    employee_id: "emp_siti_cs",
    employee_name: "Siti Nurhaliza",
    action: `[OTONOM CUSTOMER CARE 24H] Siti Nurhaliza merespons chat dari ${customer} dalam tempo respons 45 detik dan mendisposisikan kebutuhan ke ${delegatedTo}.`,
  });

  writeJsonSafely(WORKFORCE_FILE, wfData);
  return { success: true, triageType, delegatedTo };
}

/**
 * 7. SCANNER OTONOM UTAMA: Pengecekan Proaktif Berkala Lintas 6 Divisi
 */
export function scanAndExecuteAutonomousWorkforce() {
  const finData = readJsonSafely(FINANCE_FILE, { projects: [], sales: [], quotations: [] });
  const tasksData = readJsonSafely(TASKS_FILE, []);
  const dailyReports = readJsonSafely(DAILY_REPORTS_FILE, []);
  const productsData = readJsonSafely(PRODUCTS_FILE, []);

  let newInvoices = 0;
  let newReports = 0;
  let newStockAlerts = 0;
  let newPromos = 0;

  // A. Pindai Proyek Selesai untuk Dewi Sartika (Auto-Invoice)
  const projects = Array.isArray(finData.projects) ? finData.projects : [];
  for (const prj of projects) {
    const isCompleted =
      prj.status?.toLowerCase() === "completed" ||
      prj.status?.toLowerCase() === "selesai" ||
      Number(prj.progressPercentage) >= 100;

    if (isCompleted && !prj.isBilled && !prj.invoiceNumber) {
      const res = triggerDewiAutonomousProjectInvoice(prj);
      if (res.success) newInvoices++;
    }
  }

  // B. Pindai Tugas Lapangan dengan Foto untuk Deni Kurniawan (BAKP)
  const tasks = Array.isArray(tasksData) ? tasksData : [];
  for (const t of tasks) {
    if (Array.isArray(t.photos) && t.photos.length > 0) {
      const res = triggerDeniAutonomousProgressReport({
        id: `task_rep_${t.id}`,
        taskId: t.id,
        ticketNumber: t.ticketNumber,
        projectName: t.title,
        clientName: t.client,
        technician: t.technician,
        technicianPhone: t.technicianPhone,
        progressPercentage: t.status === "Completed" ? 100 : 75,
        location: t.location,
        activityDescription: t.report || (Array.isArray(t.scope) ? t.scope.join("; ") : "Inspeksi teknis"),
        photos: t.photos,
        statusAfter: t.status,
      });
      if (res.success) newReports++;
    }
  }

  // C. Pindai Laporan Harian Teknisi yang Belum Dirangkum
  for (const dr of Array.isArray(dailyReports) ? dailyReports : []) {
    if (Array.isArray(dr.photos) && dr.photos.length > 0) {
      const res = triggerDeniAutonomousProgressReport(dr);
      if (res.success) newReports++;
    }
  }

  // D. Pemantauan Restok Dinonaktifkan Permanen (Stok Fisik 0).
  // Digantikan dengan: Penyelarasan & Audit Harga Harian AI (Margin Keuntungan 50% dari Harga Referensi Modal)
  const priceSync = syncAndAuditAutonomousProductPrices(true);
  if (priceSync.updatedCount > 0) {
    newStockAlerts += priceSync.updatedCount;
  }

  // E. Pindai Kebutuhan Promo untuk Nadia Safitri (Auto-Campaign)
  const promoRes = triggerNadiaAutonomousMarketing();
  if (promoRes.success) newPromos++;

  return { scannedProjects: projects.length, newInvoices, newReports, newStockAlerts, newPromos };
}

/**
 * 4. APPROVAL EXECUTION: Eksekusi Pengesahan Resmi ke Database ERP
 */
export function executeApproveInvoiceProposal(item: any) {
  const finData = readJsonSafely(FINANCE_FILE, { sales: [], projects: [] });
  if (!Array.isArray(finData.sales)) finData.sales = [];
  if (!Array.isArray(finData.projects)) finData.projects = [];

  const payload = item.payload || {};
  const now = new Date();
  const yearMonth = now.toISOString().slice(0, 7).replace("-", "");
  const officialInvoiceNumber = payload.invoiceNumber || `INV-DSTECH-${yearMonth}-${String(finData.sales.length + 1).padStart(3, "0")}`;

  const officialSale = {
    id: payload.id || `dstech_inv_${Date.now()}`,
    invoiceNumber: officialInvoiceNumber,
    customerName: payload.customerName || item.target_client || "Klien DSTech",
    customerPhone: payload.customerPhone || "0812-9988-7766",
    customerAddress: payload.customerAddress || "Banten / Jabodetabek",
    date: payload.date || now.toISOString().split("T")[0],
    dueDate: payload.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    invoiceType: payload.invoiceType || "Standar",
    dpPercentage: 0,
    dpAmount: 0,
    dpStatus: "Bukan DP",
    dpPaidAmount: 0,
    dpNotes: "-",
    termins: [],
    activeTerminId: "",
    items: payload.items || [
      {
        id: "1",
        productId: "",
        productName: payload.projectName || item.title,
        qty: 1,
        unit: "Paket",
        price: payload.subtotal || item.value || 0,
        total: payload.subtotal || item.value || 0,
      },
    ],
    subtotal: payload.subtotal || item.value || 0,
    discount: payload.discount || 0,
    discountType: payload.discountType || "fixed",
    discountPercent: payload.discountPercent || 0,
    discountLabel: payload.discountLabel || "Diskon Khusus Proyek",
    taxRate: payload.taxRate || 0,
    taxType: payload.taxType || "none",
    taxAmount: payload.taxAmount || 0,
    grandTotal: payload.grandTotal || item.value || 0,
    paymentMethod: payload.paymentMethod || "Transfer Bank BCA (295-074-0321 - PT. DSTech Smart Perkasa)",
    paymentStatus: payload.paymentStatus || "Belum Lunas",
    paidAmount: payload.paidAmount || 0,
    remainingAmount: payload.grandTotal || item.value || 0,
    warehouseId: payload.warehouseId || "dstech_wh_1",
    branchId: payload.branchId || "dstech_branch_1",
    salesPerson: payload.salesPerson || "RAMADHANI ST",
    notes: payload.notes || `Faktur Penjualan resmi diterbitkan atas persetujuan Direktur Utama dari draf otonom Dewi Sartika.`,
    approvalStatus: "Disetujui",
    approvedBy: "RAMADHANI ST",
    approvedTitle: "Direktur Utama",
    approvedAt: now.toISOString(),
    verificationCode: `DST-${officialInvoiceNumber}`,
    signatureImage: "",
    attachments: [],
    businessEntity: payload.businessEntity || "PT",
    projectId: payload.projectId || "",
    projectName: payload.projectName || item.title,
  };

  finData.sales.unshift(officialSale);

  // Tandai proyek terkait sebagai telah ditagihkan (isBilled = true)
  if (payload.projectId) {
    const prjIdx = finData.projects.findIndex((p: any) => p.id === payload.projectId || p.projectCode === payload.projectCode);
    if (prjIdx !== -1) {
      finData.projects[prjIdx].isBilled = true;
      finData.projects[prjIdx].invoiceNumber = officialInvoiceNumber;
      finData.projects[prjIdx].invoiceId = officialSale.id;
      finData.projects[prjIdx].billingDate = now.toISOString();
      finData.projects[prjIdx].status = "Completed";
    }
  }

  writeJsonSafely(FINANCE_FILE, finData);
  return {
    docType: "INVOICE",
    number: officialInvoiceNumber,
    client: officialSale.customerName,
    grandTotal: officialSale.grandTotal,
    link: "/admin/finance?tab=sales",
  };
}

export function executeApproveProgressReport(item: any) {
  const payload = item.payload || {};
  const finData = readJsonSafely(FINANCE_FILE, { projects: [] });
  const tasksData = readJsonSafely(TASKS_FILE, []);

  const now = new Date();
  const nowIso = now.toISOString();

  // 1. Jika terhubung ke proyek di ERP
  if (payload.projectId) {
    if (!Array.isArray(finData.projects)) finData.projects = [];
    const prjIdx = finData.projects.findIndex((p: any) => p.id === payload.projectId || p.projectCode === payload.projectCode);
    if (prjIdx !== -1) {
      const prj = finData.projects[prjIdx];
      if (!Array.isArray(prj.clientProgressReports)) prj.clientProgressReports = [];

      prj.clientProgressReports.unshift({
        id: `bakp_cpr_${Date.now()}`,
        reportNumber: payload.reportNumber,
        date: payload.date || nowIso.split("T")[0],
        picName: payload.technicianName || prj.picProject || "Teknisi Lapangan",
        picEmail: "",
        progressPercentage: payload.progressPercentage || 0,
        summaryForClient: `[BERITA ACARA RESMI ${payload.reportNumber}] ${payload.activityDescription}`,
        milestoneStatus: "Disetujui Direktur Utama",
        clientNotes: `Disahkan resmi oleh Bpk. Ramadhani ST. Kendala: ${payload.blockers || '-'}`,
        nextSteps: payload.nextAction || "-",
        photos: payload.photos || [],
        approvedBy: "Ramadhani, S.T. (Direktur Utama)",
        approvedAt: nowIso,
        createdAt: nowIso,
      });

      prj.progressPercentage = payload.progressPercentage;
      if (payload.progressPercentage >= 100) {
        prj.status = "Completed";
        // Proaktif picu Dewi Sartika untuk proyek ini!
        setTimeout(() => triggerDewiAutonomousProjectInvoice(prj), 100);
      }
      writeJsonSafely(FINANCE_FILE, finData);
    }
  }

  // 2. Jika terhubung ke task maintenance / tiket teknisi
  if (payload.taskId || payload.ticketNumber) {
    const tasks = Array.isArray(tasksData) ? tasksData : [];
    const tIdx = tasks.findIndex((t: any) => t.id === payload.taskId || t.ticketNumber === payload.ticketNumber);
    if (tIdx !== -1) {
      tasks[tIdx].isReportApproved = true;
      tasks[tIdx].approvedReportNumber = payload.reportNumber;
      tasks[tIdx].approvedAt = nowIso;
      if (payload.progressPercentage >= 100) {
        tasks[tIdx].status = "Completed";
        tasks[tIdx].completionDate = nowIso.split("T")[0];
      }
      writeJsonSafely(TASKS_FILE, tasks);
    }
  }

  return {
    docType: "FIELD_PROGRESS_REPORT",
    number: payload.reportNumber,
    client: payload.clientName,
    progressPercentage: payload.progressPercentage,
    photosCount: (payload.photos || []).length,
    link: "/admin/finance?tab=projects",
  };
}

