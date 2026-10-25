import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const messagesFilePath = path.join(process.cwd(), "src", "data", "dstech_mail_messages.json");

interface MailMessage {
  id: string;
  accountEmail: string;
  folder: "inbox" | "sent" | "trash";
  fromName: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  snippet: string;
  bodyHtml: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments?: boolean;
}

function readMessages(): MailMessage[] {
  try {
    if (!fs.existsSync(messagesFilePath)) {
      return [];
    }
    const data = fs.readFileSync(messagesFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading dstech_mail_messages.json:", err);
    return [];
  }
}

function saveMessages(messages: MailMessage[]) {
  fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountEmail = searchParams.get("accountEmail");
    const folder = searchParams.get("folder") || "inbox";
    const search = searchParams.get("search")?.toLowerCase().trim();

    let messages = readMessages();

    if (accountEmail) {
      messages = messages.filter(
        (m) => m.accountEmail.toLowerCase() === accountEmail.toLowerCase()
      );
    }

    if (folder) {
      messages = messages.filter((m) => m.folder === folder);
    }

    if (search) {
      messages = messages.filter(
        (m) =>
          m.subject.toLowerCase().includes(search) ||
          m.fromName.toLowerCase().includes(search) ||
          m.fromEmail.toLowerCase().includes(search) ||
          m.snippet.toLowerCase().includes(search)
      );
    }

    // Urutkan dari tanggal terbaru
    messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Hitung unread count untuk account ini di folder inbox
    const allForAccount = readMessages().filter(
      (m) => !accountEmail || m.accountEmail.toLowerCase() === accountEmail.toLowerCase()
    );
    const unreadInboxCount = allForAccount.filter(
      (m) => m.folder === "inbox" && !m.isRead
    ).length;

    return NextResponse.json({
      success: true,
      data: messages,
      unreadInboxCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat pesan email" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isRead, isStarred, folder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID pesan wajib disertakan." },
        { status: 400 }
      );
    }

    const messages = readMessages();
    const idx = messages.findIndex((m) => m.id === id);

    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: "Pesan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (typeof isRead === "boolean") messages[idx].isRead = isRead;
    if (typeof isStarred === "boolean") messages[idx].isStarred = isStarred;
    if (folder && ["inbox", "sent", "trash"].includes(folder)) {
      messages[idx].folder = folder;
    }

    saveMessages(messages);

    return NextResponse.json({
      success: true,
      message: "Status pesan berhasil diperbarui.",
      data: messages[idx],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui status pesan" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID pesan wajib disertakan." },
        { status: 400 }
      );
    }

    let messages = readMessages();
    const beforeCount = messages.length;
    messages = messages.filter((m) => m.id !== id);

    if (messages.length === beforeCount) {
      return NextResponse.json(
        { success: false, message: "Pesan tidak ditemukan." },
        { status: 404 }
      );
    }

    saveMessages(messages);

    return NextResponse.json({
      success: true,
      message: "Pesan berhasil dihapus permanen.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus pesan" },
      { status: 500 }
    );
  }
}
