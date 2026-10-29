import { NextResponse } from "next/server";
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

    // Filter ketat hak akses: Jika bukan Admin/Superadmin/CS, HANYA tampilkan obrolan di mana user menjadi peserta resmi
    const requestUser = users.find((u: any) => u.id === userId);
    const isAdminOrCS = requestUser?.role === "ADMIN" || requestUser?.role === "SUPERADMIN" || requestUser?.role === "CS";

    let visibleChats = chats;
    if (userId && !isAdminOrCS) {
      // User non-Admin/CS HANYA bisa melihat obrolan di mana dia peserta DAN BUKAN chat klien!
      visibleChats = chats.filter((c: any) => !c.isClientChat && Array.isArray(c.participants) && c.participants.includes(userId));
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
    const dataType = searchParams.get("type") || "invoices";
    const query = (searchParams.get("query") || "").toLowerCase();
    const userRole = (searchParams.get("role") || "").toUpperCase();
    const requesterName = (searchParams.get("userName") || "").toLowerCase();
    const chatId = searchParams.get("chatId") || "";
    const projectIdParam = searchParams.get("projectId") || "";
    const chatNameParam = searchParams.get("chatName") || "";

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

      const targetUserName = (searchParams.get("targetUserName") || "").toLowerCase();
      let invoices = (financeData.sales || []).map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || "INV-UNKNOWN",
        customerName: inv.customerName || "Klien Umum",
        grandTotal: inv.grandTotal || 0,
        paymentStatus: inv.paymentStatus || "Belum Bayar",
        date: inv.date || new Date().toISOString().split("T")[0],
        invoiceType: inv.invoiceType || "Standard",
      }));

      // Filter ketat: jika sedang berada di percakapan pribadi / DM dengan user tertentu,
      // HANYA tampilkan invoice milik user tersebut agar tidak salah mengirimkan invoice pihak lain!
      if (targetUserName) {
        invoices = invoices.filter((inv: any) => {
          const cName = (inv.customerName || "").toLowerCase();
          return cName.includes(targetUserName) || targetUserName.includes(cName);
        });
      }

      if (query) {
        invoices = invoices.filter(
          (inv: any) =>
            inv.invoiceNumber.toLowerCase().includes(query) ||
            inv.customerName.toLowerCase().includes(query)
        );
      }
      return NextResponse.json({ success: true, data: invoices.slice(0, 50), projectInfo });
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
          DIBATALKAN: "Dibatalkan"
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
          items: (o.items || []).map((it: any) => ({
            name: it.productName || it.name,
            qty: it.qty || 1,
            price: it.price || 0,
            image: it.image || "/service-software.png"
          }))
        };
      });

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
      return NextResponse.json({ success: true, data: orders.slice(0, 50), projectInfo });
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
