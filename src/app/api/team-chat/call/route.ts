import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CALLS_FILE = path.join(process.cwd(), "src", "data", "dstech_team_calls.json");
const MESSAGES_FILE = path.join(process.cwd(), "src", "data", "dstech_team_messages.json");
const CHATS_FILE = path.join(process.cwd(), "src", "data", "dstech_team_chats.json");

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

// GET: Cek panggilan masuk atau status panggilan
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || searchParams.get("targetUserId");
  const callId = searchParams.get("callId");

  const calls = readJsonSafe(CALLS_FILE, []);

  // Jika mencari status call spesifik
  if (callId) {
    const call = calls.find((c: any) => c.id === callId);
    return NextResponse.json({ success: true, call, data: call });
  }

  // Cek panggilan masuk aktif (< 45 detik dan status calling/RINGING)
  const now = Date.now();
  let incomingCall = null;

  if (userId) {
    incomingCall = calls.find(
      (c: any) =>
        (c.receiverId === userId || !c.receiverId || (c.receiverName && c.receiverName.toLowerCase() === userId.toLowerCase())) &&
        (c.status === "calling" || c.status === "RINGING") &&
        now - new Date(c.startedAt).getTime() < 45000
    );
  } else {
    // Fallback: Jika userId belum tersinkron di perangkat, tetap deteksi panggilan aktif terbaru
    incomingCall = calls.find(
      (c: any) =>
        (c.status === "calling" || c.status === "RINGING") &&
        now - new Date(c.startedAt).getTime() < 45000
    );
  }

  const formattedData = incomingCall
    ? {
        callId: incomingCall.id,
        id: incomingCall.id,
        callerId: incomingCall.callerId,
        callerName: incomingCall.callerName,
        receiverId: incomingCall.receiverId,
        receiverName: incomingCall.receiverName,
        targetUserId: incomingCall.receiverId,
        callType: incomingCall.callType || "audio",
        roomCode: incomingCall.roomCode,
        chatId: incomingCall.chatId,
        status: "RINGING",
        startedAt: incomingCall.startedAt,
      }
    : null;

  return NextResponse.json(
    {
      success: true,
      incomingCall: incomingCall || null,
      data: formattedData,
      calls: calls.slice(-20),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
      },
    }
  );
}

// POST: Inisiasi, jawab, tolak, atau akhiri panggilan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const calls = readJsonSafe(CALLS_FILE, []);

    // 1. Memulai Panggilan Baru (Audio atau Video)
    if (action === "initiate") {
      const { callerId, callerName, receiverId, receiverName, callType, chatId } = body;

      if (!callerId || !receiverId || !callType) {
        return NextResponse.json({ success: false, error: "Parameter panggilan tidak lengkap" }, { status: 400 });
      }

      const callId = `dstech_call_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const roomCode = `dstech_call_${Date.now()}`;

      const newCall = {
        id: callId,
        callerId,
        callerName: callerName || "Penelepon",
        receiverId,
        receiverName: receiverName || "Penerima",
        callType: callType === "video" ? "video" : "audio",
        roomCode,
        chatId: chatId || null,
        status: "calling",
        startedAt: new Date().toISOString(),
      };

      calls.push(newCall);
      writeJsonSafe(CALLS_FILE, calls);

      return NextResponse.json({ success: true, call: newCall });
    }

    // 2. Menerima Panggilan (Accept)
    if (action === "accept") {
      const callId = body.callId || body.id;
      const roomCode = body.roomCode;
      const callIndex = calls.findIndex((c: any) => (callId && c.id === callId) || (roomCode && c.roomCode === roomCode));

      if (callIndex !== -1) {
        calls[callIndex].status = "connected";
        calls[callIndex].connectedAt = new Date().toISOString();
        writeJsonSafe(CALLS_FILE, calls);
        return NextResponse.json({ success: true, call: calls[callIndex] });
      }

      return NextResponse.json({ success: false, error: "Panggilan tidak ditemukan" }, { status: 404 });
    }

    // 3. Menolak Panggilan (Decline / Reject)
    if (action === "decline" || action === "reject") {
      const callId = body.callId || body.id;
      const roomCode = body.roomCode;
      const callIndex = calls.findIndex((c: any) => (callId && c.id === callId) || (roomCode && c.roomCode === roomCode));

      if (callIndex !== -1) {
        calls[callIndex].status = "declined";
        calls[callIndex].endedAt = new Date().toISOString();
        writeJsonSafe(CALLS_FILE, calls);

        // Rekam log ke pesan chat jika ada chatId
        if (calls[callIndex].chatId) {
          recordCallMessage(calls[callIndex], "declined");
        }

        return NextResponse.json({ success: true, call: calls[callIndex] });
      }

      return NextResponse.json({ success: false, error: "Panggilan tidak ditemukan" }, { status: 404 });
    }

    // 4. Mengakhiri Panggilan (End)
    if (action === "end") {
      const callId = body.callId || body.id;
      const roomCode = body.roomCode;
      const duration = body.duration;
      const callIndex = calls.findIndex((c: any) => (callId && c.id === callId) || (roomCode && c.roomCode === roomCode));

      if (callIndex !== -1) {
        calls[callIndex].status = "ended";
        calls[callIndex].endedAt = new Date().toISOString();
        calls[callIndex].duration = duration || 0;
        writeJsonSafe(CALLS_FILE, calls);

        // Rekam log ke pesan chat jika ada chatId
        if (calls[callIndex].chatId) {
          recordCallMessage(calls[callIndex], "completed");
        }

        return NextResponse.json({ success: true, call: calls[callIndex] });
      }

      return NextResponse.json({ success: false, error: "Panggilan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: "Aksi panggilan tidak dikenali" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Helper untuk mencatat log panggilan ke obrolan
function recordCallMessage(call: any, finalStatus: string) {
  try {
    const messages = readJsonSafe(MESSAGES_FILE, []);
    const chats = readJsonSafe(CHATS_FILE, []);

    const callMsg = {
      id: `dstech_msg_call_${Date.now()}`,
      chatId: call.chatId,
      senderId: call.callerId,
      senderName: call.callerName,
      senderRole: "USER",
      type: "call_log",
      content: call.callType === "video" ? "Panggilan Video" : "Panggilan Suara",
      callData: {
        callType: call.callType,
        duration: call.duration || 0,
        status: finalStatus,
      },
      timestamp: new Date().toISOString(),
      readBy: [call.callerId],
    };

    messages.push(callMsg);
    writeJsonSafe(MESSAGES_FILE, messages);

    const chatIdx = chats.findIndex((c: any) => c.id === call.chatId);
    if (chatIdx !== -1) {
      chats[chatIdx].lastMessage = `📞 [${call.callType === "video" ? "Panggilan Video" : "Panggilan Suara"}] ${finalStatus === "completed" ? "Selesai" : "Ditolak/Tak Terjawab"}`;
      chats[chatIdx].lastMessageTime = callMsg.timestamp;
      writeJsonSafe(CHATS_FILE, chats);
    }
  } catch (e) {
    console.error("Gagal mencatat log panggilan:", e);
  }
}
