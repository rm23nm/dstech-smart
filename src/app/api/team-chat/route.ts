import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CHATS_FILE = path.join(process.cwd(), "src", "data", "dstech_team_chats.json");
const MESSAGES_FILE = path.join(process.cwd(), "src", "data", "dstech_team_messages.json");
const USERS_FILE = path.join(process.cwd(), "src", "data", "dstech_users.json");
const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
const TASKS_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_tasks.json");
const REPORTS_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_daily_reports.json");

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
    const chats = readJsonSafe(CHATS_FILE, []);
    const users = readJsonSafe(USERS_FILE, []);

    // Filter chat yang relevan untuk user (jika userId diberikan), atau kembalikan semua chat jika tidak difilter
    const userChats = chats.map((c: any) => {
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
    const messages = readJsonSafe(MESSAGES_FILE, []);
    const chatMessages = messages.filter((m: any) => m.chatId === chatId);

    return NextResponse.json({
      success: true,
      messages: chatMessages,
    });
  }

  // 3. Ambil data perusahaan untuk lampiran (Invoice, SPK Task, Laporan Bukti Kerja)
  if (action === "company_data") {
    const dataType = searchParams.get("type") || "invoices";
    const query = (searchParams.get("query") || "").toLowerCase();

    if (dataType === "invoices") {
      const financeData = readJsonSafe(FINANCE_FILE, { sales: [] });
      let invoices = (financeData.sales || []).map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || "INV-UNKNOWN",
        customerName: inv.customerName || "Klien Umum",
        grandTotal: inv.grandTotal || 0,
        paymentStatus: inv.paymentStatus || "Belum Bayar",
        date: inv.date || new Date().toISOString().split("T")[0],
        invoiceType: inv.invoiceType || "Standard",
      }));
      if (query) {
        invoices = invoices.filter(
          (inv: any) =>
            inv.invoiceNumber.toLowerCase().includes(query) ||
            inv.customerName.toLowerCase().includes(query)
        );
      }
      return NextResponse.json({ success: true, data: invoices.slice(0, 20) });
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
      }));
      if (query) {
        tasks = tasks.filter(
          (t: any) =>
            t.ticketNumber.toLowerCase().includes(query) ||
            t.title.toLowerCase().includes(query) ||
            t.client.toLowerCase().includes(query)
        );
      }
      return NextResponse.json({ success: true, data: tasks.slice(0, 20) });
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
      return NextResponse.json({ success: true, data: reports.slice(0, 20) });
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

    // 1. Kirim Pesan
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
        callData,
      } = body;

      if (!chatId || !senderId || (!content && !mediaUrl && !invoiceData && !taskData && !reportData && !callData)) {
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
        callData: callData || undefined,
        timestamp: new Date().toISOString(),
        readBy: [senderId],
      };

      messages.push(newMsg);
      writeJsonSafe(MESSAGES_FILE, messages);

      // Update ringkasan lastMessage di chat terkait
      let lastPreview = content || "";
      if (type === "invoice") lastPreview = `📑 [Invoice] ${invoiceData?.invoiceNumber || ""}`;
      else if (type === "task") lastPreview = `📋 [SPK Penugasan] ${taskData?.title || ""}`;
      else if (type === "daily_report") lastPreview = `📸 [Bukti Pekerjaan] ${reportData?.taskTitle || ""}`;
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
