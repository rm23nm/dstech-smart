import fs from "fs";
import path from "path";

const WORKFORCE_FILE = path.join(process.cwd(), "src", "data", "dstech_ai_workforce.json");
const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
const DAILY_REPORTS_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_daily_reports.json");
const TASKS_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_tasks.json");

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

  // Cek blacklist penolakan
  const isDismissed = wfData.dstech_dismissed_topics.some(
    (t: any) =>
      (t.client && clientName.toLowerCase().includes(t.client.toLowerCase())) ||
      (t.title && t.title.toLowerCase().includes(projectName.toLowerCase()))
  );
  if (isDismissed) {
    return { success: false, reason: "Klien atau topik proyek ini pernah ditolak/dihapus Direktur Utama" };
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

  // Cek apakah laporan ini sudah pernah dirangkum sebelumnya di queue
  const existingQueue = wfData.dstech_approval_queue.find(
    (q: any) =>
      q.task_type === "FIELD_PROGRESS_REPORT" &&
      q.status !== "REJECTED" &&
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
 * 3. SCANNER OTONOM: Pengecekan Proaktif Berkala (Dipanggil saat GET /api/ai-workforce atau Autopilot)
 */
export function scanAndExecuteAutonomousWorkforce() {
  const finData = readJsonSafely(FINANCE_FILE, { projects: [], sales: [] });
  const tasksData = readJsonSafely(TASKS_FILE, []);
  const dailyReports = readJsonSafely(DAILY_REPORTS_FILE, []);

  let newInvoices = 0;
  let newReports = 0;

  // A. Pindai Proyek Selesai untuk Dewi Sartika
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

  // B. Pindai Tugas Lapangan dengan Foto untuk Deni Kurniawan
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

  return { scannedProjects: projects.length, newInvoices, newReports };
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

