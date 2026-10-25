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

function parseMimeHeader(raw: string): string {
  if (!raw) return "";
  return raw.replace(/=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi, (_, charset, enc, text) => {
    try {
      if (enc.toUpperCase() === "B") {
        return Buffer.from(text, "base64").toString("utf-8");
      } else if (enc.toUpperCase() === "Q") {
        return text.replace(/_/g, " ").replace(/=([0-9A-F]{2})/gi, (_match: string, hex: string) => String.fromCharCode(parseInt(hex, 16)));
      }
    } catch {
      return text;
    }
    return text;
  });
}

function parseMaildirFile(filePath: string, accountEmail: string, folder: "inbox" | "sent" | "trash", isNew: boolean): MailMessage | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const splitMatch = content.match(/\r?\n\r?\n/);
    const splitIdx = splitMatch ? splitMatch.index! : -1;
    const headerSection = splitIdx !== -1 ? content.substring(0, splitIdx) : content;
    const rawBody = splitIdx !== -1 ? content.substring(splitIdx + splitMatch![0].length) : "";

    const headers: Record<string, string> = {};
    let currentKey = "";
    for (const line of headerSection.split(/\r?\n/)) {
      if (/^\s/.test(line) && currentKey) {
        headers[currentKey] += " " + line.trim();
      } else {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          currentKey = line.substring(0, colonIdx).toLowerCase().trim();
          headers[currentKey] = line.substring(colonIdx + 1).trim();
        }
      }
    }

    const fromRaw = parseMimeHeader(headers["from"] || "");
    let fromName = fromRaw;
    let fromEmail = fromRaw;
    const fromMatch = fromRaw.match(/(.*?)<([^>]+)>/);
    if (fromMatch) {
      fromName = fromMatch[1].replace(/"/g, "").trim() || fromMatch[2];
      fromEmail = fromMatch[2].trim();
    }

    let cleanBody = rawBody;
    const boundaryMatch = headers["content-type"]?.match(/boundary="?([^";\s]+)"?/i);
    if (boundaryMatch) {
      const boundary = boundaryMatch[1];
      const parts = rawBody.split("--" + boundary);
      for (const part of parts) {
        if (part.includes("Content-Type: text/plain") || part.includes("text/plain")) {
          const partSplit = part.match(/\r?\n\r?\n/);
          if (partSplit && partSplit.index !== undefined) {
            cleanBody = part.substring(partSplit.index + partSplit[0].length).trim();
            break;
          }
        }
      }
    }

    cleanBody = cleanBody.replace(/--[a-zA-Z0-9_-]+--/g, "").trim();

    const snippet = cleanBody.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().substring(0, 160);
    const dateStr = headers["date"] || new Date().toISOString();

    return {
      id: `maildir_${path.basename(filePath)}`,
      accountEmail,
      folder,
      fromName: fromName || fromEmail || "Pengirim",
      fromEmail: fromEmail || "unknown@mail.com",
      toEmail: headers["to"] || accountEmail,
      subject: parseMimeHeader(headers["subject"] || "(Tanpa Subjek)"),
      snippet: snippet || "(Tidak ada ringkasan teks)",
      bodyHtml: `<div style="white-space: pre-wrap; font-family: sans-serif; line-height: 1.6;">${cleanBody.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`,
      date: dateStr,
      isRead: !isNew,
      isStarred: false,
      hasAttachments: !!headers["content-type"]?.includes("multipart/mixed"),
    };
  } catch {
    return null;
  }
}

function readMessagesFromMaildir(accountEmail?: string | null, folder: "inbox" | "sent" | "trash" = "inbox"): MailMessage[] {
  const result: MailMessage[] = [];
  const vmailRoot = "/www/vmail";
  if (!fs.existsSync(vmailRoot)) return [];

  const accountsToScan: { email: string; user: string; domain: string }[] = [];
  if (accountEmail) {
    const [u, d] = accountEmail.toLowerCase().trim().split("@");
    if (u && d) accountsToScan.push({ email: accountEmail.toLowerCase().trim(), user: u, domain: d });
  } else {
    try {
      const domains = fs.readdirSync(vmailRoot);
      for (const d of domains) {
        const dPath = path.join(vmailRoot, d);
        if (fs.statSync(dPath).isDirectory() && d.includes(".")) {
          const users = fs.readdirSync(dPath);
          for (const u of users) {
            const uPath = path.join(dPath, u);
            if (fs.statSync(uPath).isDirectory() && !u.startsWith(".")) {
              accountsToScan.push({ email: `${u}@${d}`, user: u, domain: d });
            }
          }
        }
      }
    } catch {}
  }

  for (const acc of accountsToScan) {
    const accDir = path.join(vmailRoot, acc.domain, acc.user);
    if (!fs.existsSync(accDir)) continue;

    const dirsToScan: { dir: string; isNew: boolean }[] = [];
    if (folder === "inbox") {
      dirsToScan.push({ dir: path.join(accDir, "new"), isNew: true });
      dirsToScan.push({ dir: path.join(accDir, "cur"), isNew: false });
    } else if (folder === "sent") {
      dirsToScan.push({ dir: path.join(accDir, ".Sent", "new"), isNew: false });
      dirsToScan.push({ dir: path.join(accDir, ".Sent", "cur"), isNew: false });
    } else if (folder === "trash") {
      dirsToScan.push({ dir: path.join(accDir, ".Trash", "new"), isNew: false });
      dirsToScan.push({ dir: path.join(accDir, ".Trash", "cur"), isNew: false });
      dirsToScan.push({ dir: path.join(accDir, ".Junk", "cur"), isNew: false });
    }

    for (const { dir, isNew } of dirsToScan) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (file.startsWith(".")) continue;
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isFile()) {
              const msg = parseMaildirFile(fullPath, acc.email, folder, isNew);
              if (msg) result.push(msg);
            }
          }
        } catch {}
      }
    }
  }

  return result;
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
    const folder = (searchParams.get("folder") || "inbox") as "inbox" | "sent" | "trash";
    const search = searchParams.get("search")?.toLowerCase().trim();

    // 1. Baca pesan nyata dari Maildir server
    const maildirMessages = readMessagesFromMaildir(accountEmail, folder);

    // 2. Baca pesan lokal dari JSON
    let jsonMessages = readMessages();
    if (accountEmail) {
      jsonMessages = jsonMessages.filter(
        (m) => m.accountEmail.toLowerCase() === accountEmail.toLowerCase()
      );
    }
    if (folder) {
      jsonMessages = jsonMessages.filter((m) => m.folder === folder);
    }

    // 3. Gabungkan pesan maildir nyata dengan json local (hindari duplikat)
    let messages = [...maildirMessages];
    for (const jm of jsonMessages) {
      if (!messages.some((m) => m.id === jm.id || (m.subject === jm.subject && m.date === jm.date))) {
        messages.push(jm);
      }
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
    const allInboxMaildir = readMessagesFromMaildir(accountEmail, "inbox");
    const unreadInboxCount = allInboxMaildir.filter((m) => !m.isRead).length;

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

    if (idx !== -1) {
      if (typeof isRead === "boolean") messages[idx].isRead = isRead;
      if (typeof isStarred === "boolean") messages[idx].isStarred = isStarred;
      if (folder && ["inbox", "sent", "trash"].includes(folder)) {
        messages[idx].folder = folder;
      }
      saveMessages(messages);
    }

    return NextResponse.json({
      success: true,
      message: "Status pesan berhasil diperbarui.",
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
    messages = messages.filter((m) => m.id !== id);
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
