import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const messagesFilePath = path.join(process.cwd(), "src", "data", "dstech_mail_messages.json");

interface MailMessage {
  id: string;
  accountEmail: string;
  folder: "inbox" | "sent" | "trash" | "spam";
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
  isSpam?: boolean;
  spamScore?: number;
  spamReason?: string;
}

export function detectSpam(msg: {
  subject: string;
  snippet: string;
  fromEmail: string;
  fromName: string;
  bodyHtml?: string;
}): { isSpam: boolean; spamScore: number; spamReason: string } {
  let score = 0;
  const reasons: string[] = [];

  const subjectLower = (msg.subject || "").toLowerCase();
  const bodyTextLower = ((msg.snippet || "") + " " + (msg.bodyHtml || "")).toLowerCase();
  const fromEmailLower = (msg.fromEmail || "").toLowerCase();

  // 1. Indikasi Phishing / Rekayasa Sosial
  const phishingKeywords = [
    { word: "verify your account", reason: "Permintaan verifikasi akun mencurigakan" },
    { word: "confirm your password", reason: "Permintaan konfirmasi kata sandi" },
    { word: "account suspended", reason: "Ancaman penangguhan akun palsu" },
    { word: "urgent action required", reason: "Taktik kepanikan darurat" },
    { word: "security alert: verify", reason: "Peringatan keamanan verifikasi palsu" },
    { word: "klik di sini untuk verifikasi", reason: "Tautan verifikasi kredensial mencurigakan" },
    { word: "reset password segera", reason: "Peringatan reset kata sandi mendesak" },
    { word: "login credentials", reason: "Permintaan kredensial login" },
  ];
  for (const k of phishingKeywords) {
    if (subjectLower.includes(k.word) || bodyTextLower.includes(k.word)) {
      score += 50;
      reasons.push(k.reason);
      break;
    }
  }

  // 2. Indikasi Penipuan Hadiah / Lotere / Kripto Finansial
  const fraudKeywords = [
    { word: "congratulations you won", reason: "Klaim pemenang undian fiktif" },
    { word: "claim your prize", reason: "Klaim hadiah fiktif" },
    { word: "lottery winner", reason: "Pemberitahuan pemenang lotere" },
    { word: "fund transfer of", reason: "Tawaran transfer dana ilegal" },
    { word: "inheritance notification", reason: "Penipuan warisan dana" },
    { word: "bitcoin investment profit", reason: "Investasi kripto tidak wajar" },
    { word: "guaranteed return", reason: "Janji keuntungan investasi instan" },
    { word: "pinjaman dana tanpa jaminan", reason: "Tawaran pinjaman online ilegal" },
    { word: "menang undian tunai", reason: "Klaim undian tunai" },
    { word: "klaim bonus", reason: "Promosi klaim bonus uang" },
    { word: "slot gacor", reason: "Promosi judi online / kasino" },
    { word: "judi online", reason: "Promosi perjudian tanpa izin" },
    { word: "casino online", reason: "Tawaran kasino online" },
    { word: "viagra", reason: "Promosi obat ilegal / tidak sah" },
    { word: "cialis", reason: "Promosi obat ilegal / tidak sah" },
  ];
  for (const f of fraudKeywords) {
    if (subjectLower.includes(f.word) || bodyTextLower.includes(f.word)) {
      score += 55;
      reasons.push(f.reason);
      break;
    }
  }

  // 3. Bounce / Spamhaus / Blacklist Detection
  if (
    bodyTextLower.includes("spamhaus's list") ||
    bodyTextLower.includes("blocked by spamhaus") ||
    bodyTextLower.includes("553 5.7.1") ||
    bodyTextLower.includes("550-5.7.1")
  ) {
    score += 45;
    reasons.push("IP pengirim masuk daftar blokir Spamhaus");
  }

  // 4. Huruf Kapital Berlebih pada Subjek
  if (msg.subject && msg.subject.length > 12) {
    const letters = msg.subject.replace(/[^a-zA-Z]/g, "");
    if (letters.length > 8) {
      const upperCount = letters.split("").filter((c) => c === c.toUpperCase()).length;
      if (upperCount / letters.length > 0.75) {
        score += 25;
        reasons.push("Subjek menggunakan huruf kapital berlebih");
      }
    }
  }

  // 5. Tanda Baca / Simbol Berlebih
  if (/((\$\$\$|\!\!\!|\?\?\?|€€€|£££))/.test(msg.subject)) {
    score += 20;
    reasons.push("Penggunaan simbol mencolok berlebih ($$$, !!!)");
  }

  // 6. Domain pengirim mencurigakan (disposable / spammy TLD)
  const suspiciousTlds = [".xyz", ".top", ".click", ".monster", ".buzz", ".work", ".link", ".rest", ".fit", ".gq", ".cf", ".tk", ".ml"];
  if (suspiciousTlds.some((tld) => fromEmailLower.endsWith(tld))) {
    score += 30;
    reasons.push("Domain pengirim menggunakan ekstensi TLD berisiko tinggi");
  }

  const finalScore = Math.min(score, 100);
  const isSpam = finalScore >= 50;
  const spamReason = reasons.length > 0 ? reasons.join(" • ") : "Pola email normal";

  return { isSpam, spamScore: finalScore, spamReason };
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

function parseMaildirFile(filePath: string, accountEmail: string, folder: "inbox" | "sent" | "trash" | "spam", isNew: boolean): MailMessage | null {
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
    const subject = parseMimeHeader(headers["subject"] || "(Tanpa Subjek)");

    // Jalankan deteksi spam otomatis
    const spamCheck = detectSpam({
      subject,
      snippet,
      fromEmail: fromEmail || "",
      fromName: fromName || "",
      bodyHtml: cleanBody,
    });

    const isFolderSpam = folder === "spam" || (folder === "inbox" && spamCheck.isSpam);

    return {
      id: `maildir_${path.basename(filePath)}`,
      accountEmail,
      folder: isFolderSpam && folder === "spam" ? "spam" : folder,
      fromName: fromName || fromEmail || "Pengirim",
      fromEmail: fromEmail || "unknown@mail.com",
      toEmail: headers["to"] || accountEmail,
      subject,
      snippet: snippet || "(Tidak ada ringkasan teks)",
      bodyHtml: `<div style="white-space: pre-wrap; font-family: sans-serif; line-height: 1.6;">${cleanBody.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`,
      date: dateStr,
      isRead: !isNew,
      isStarred: false,
      hasAttachments: !!headers["content-type"]?.includes("multipart/mixed"),
      isSpam: spamCheck.isSpam,
      spamScore: spamCheck.spamScore,
      spamReason: spamCheck.spamReason,
    };
  } catch {
    return null;
  }
}

function readMessagesFromMaildir(accountEmail?: string | null, folder: "inbox" | "sent" | "trash" | "spam" = "inbox"): MailMessage[] {
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
    } else if (folder === "spam") {
      dirsToScan.push({ dir: path.join(accDir, ".Junk", "new"), isNew: true });
      dirsToScan.push({ dir: path.join(accDir, ".Junk", "cur"), isNew: false });
      // Juga scan inbox untuk pesan yang skor spamnya tinggi
      dirsToScan.push({ dir: path.join(accDir, "new"), isNew: true });
      dirsToScan.push({ dir: path.join(accDir, "cur"), isNew: false });
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
              if (msg) {
                if (folder === "spam") {
                  if (msg.isSpam || dir.includes(".Junk")) {
                    msg.folder = "spam";
                    result.push(msg);
                  }
                } else if (folder === "inbox") {
                  // Jangan tampilkan email yang terdeteksi spam di inbox utama agar inbox bersih
                  if (!msg.isSpam) {
                    result.push(msg);
                  }
                } else {
                  result.push(msg);
                }
              }
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
    const folder = (searchParams.get("folder") || "inbox") as "inbox" | "sent" | "trash" | "spam";
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

    // Evaluasi spam pada json messages jika belum ada status spam
    jsonMessages = jsonMessages.map((m) => {
      if (m.isSpam === undefined) {
        const sc = detectSpam({
          subject: m.subject,
          snippet: m.snippet,
          fromEmail: m.fromEmail,
          fromName: m.fromName,
          bodyHtml: m.bodyHtml,
        });
        return {
          ...m,
          isSpam: sc.isSpam,
          spamScore: sc.spamScore,
          spamReason: sc.spamReason,
        };
      }
      return m;
    });

    if (folder === "spam") {
      jsonMessages = jsonMessages.filter((m) => m.folder === "spam" || (m.folder === "inbox" && m.isSpam));
    } else if (folder === "inbox") {
      jsonMessages = jsonMessages.filter((m) => m.folder === "inbox" && !m.isSpam);
    } else {
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
    const allInbox = readMessagesFromMaildir(accountEmail, "inbox");
    const unreadInboxCount = allInbox.filter((m) => !m.isRead).length;

    // Hitung total spam
    const allSpam = readMessagesFromMaildir(accountEmail, "spam");
    const spamCount = allSpam.length;

    return NextResponse.json({
      success: true,
      data: messages,
      unreadInboxCount,
      spamCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat pesan email" },
      { status: 500 }
    );
  }
}

function findMaildirFile(accountEmail: string, fileName: string): string | null {
  const vmailRoot = "/www/vmail";
  if (!fs.existsSync(vmailRoot)) return null;
  const [u, d] = (accountEmail || "").toLowerCase().trim().split("@");
  if (!u || !d) return null;
  const accDir = path.join(vmailRoot, d, u);
  if (!fs.existsSync(accDir)) return null;

  const candidateDirs = [
    path.join(accDir, "new"),
    path.join(accDir, "cur"),
    path.join(accDir, ".Trash", "new"),
    path.join(accDir, ".Trash", "cur"),
    path.join(accDir, ".Junk", "new"),
    path.join(accDir, ".Junk", "cur"),
    path.join(accDir, ".Sent", "new"),
    path.join(accDir, ".Sent", "cur"),
  ];

  for (const cDir of candidateDirs) {
    if (fs.existsSync(cDir)) {
      const p = path.join(cDir, fileName);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isRead, isStarred, folder, isSpam, accountEmail } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID pesan wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Sinkronisasi berkas fisik di Maildir server jika id adalah maildir_...
    if (id.startsWith("maildir_") && folder) {
      const fileName = id.replace("maildir_", "");
      const foundPath = findMaildirFile(accountEmail || "", fileName);
      if (foundPath) {
        const [u, d] = (accountEmail || "").toLowerCase().trim().split("@");
        const accDir = path.join("/www/vmail", d, u);
        let targetDir = path.join(accDir, "cur");

        if (folder === "trash") {
          targetDir = path.join(accDir, ".Trash", "cur");
        } else if (folder === "spam") {
          targetDir = path.join(accDir, ".Junk", "cur");
        } else if (folder === "sent") {
          targetDir = path.join(accDir, ".Sent", "cur");
        } else {
          targetDir = path.join(accDir, "cur");
        }

        try {
          fs.mkdirSync(targetDir, { recursive: true });
          const destPath = path.join(targetDir, fileName);
          if (foundPath !== destPath) {
            fs.renameSync(foundPath, destPath);
          }
        } catch (moveErr) {
          console.warn("Could not move physical maildir file:", moveErr);
        }
      }
    }

    // 2. Simpan status di JSON
    const messages = readMessages();
    const idx = messages.findIndex((m) => m.id === id);

    if (idx !== -1) {
      if (typeof isRead === "boolean") messages[idx].isRead = isRead;
      if (typeof isStarred === "boolean") messages[idx].isStarred = isStarred;
      if (typeof isSpam === "boolean") {
        messages[idx].isSpam = isSpam;
        if (isSpam) {
          messages[idx].folder = "spam";
          messages[idx].spamScore = 100;
          messages[idx].spamReason = "Ditandai manual sebagai Spam oleh pengguna";
        } else {
          messages[idx].folder = "inbox";
          messages[idx].spamScore = 0;
          messages[idx].spamReason = "Ditandai manual sebagai Bukan Spam oleh pengguna (Whitelist)";
        }
      } else if (folder && ["inbox", "sent", "trash", "spam"].includes(folder)) {
        messages[idx].folder = folder as any;
        if (folder === "spam") {
          messages[idx].isSpam = true;
        } else if (folder === "inbox") {
          messages[idx].isSpam = false;
        }
      }
      saveMessages(messages);
    } else {
      // Jika pesan berasal dari Maildir, buat record override di dstech_mail_messages.json
      const newOverride: MailMessage = {
        id,
        accountEmail: body.accountEmail || "",
        folder: folder || (isSpam ? "spam" : "inbox"),
        fromName: body.fromName || "",
        fromEmail: body.fromEmail || "",
        toEmail: body.toEmail || "",
        subject: body.subject || "",
        snippet: body.snippet || "",
        bodyHtml: body.bodyHtml || "",
        date: body.date || new Date().toISOString(),
        isRead: typeof isRead === "boolean" ? isRead : true,
        isStarred: typeof isStarred === "boolean" ? isStarred : false,
        isSpam: typeof isSpam === "boolean" ? isSpam : folder === "spam",
        spamScore: isSpam ? 100 : 0,
        spamReason: isSpam ? "Ditandai manual sebagai Spam" : "Ditandai manual sebagai Bukan Spam",
      };
      messages.unshift(newOverride);
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
    const accountEmail = searchParams.get("accountEmail");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID pesan wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Hapus berkas fisik di Maildir server jika id adalah maildir_...
    if (id.startsWith("maildir_")) {
      const fileName = id.replace("maildir_", "");
      let foundPath = findMaildirFile(accountEmail || "", fileName);

      // Jika accountEmail belum diberikan, cari di seluruh domain/user vmail
      if (!foundPath && fs.existsSync("/www/vmail")) {
        try {
          const domains = fs.readdirSync("/www/vmail");
          for (const d of domains) {
            const dPath = path.join("/www/vmail", d);
            if (fs.statSync(dPath).isDirectory() && d.includes(".")) {
              const users = fs.readdirSync(dPath);
              for (const u of users) {
                const p = findMaildirFile(`${u}@${d}`, fileName);
                if (p) {
                  foundPath = p;
                  break;
                }
              }
            }
            if (foundPath) break;
          }
        } catch {}
      }

      if (foundPath && fs.existsSync(foundPath)) {
        try {
          fs.unlinkSync(foundPath);
        } catch (unlinkErr) {
          console.warn("Could not delete physical maildir file:", unlinkErr);
        }
      }
    }

    // 2. Hapus dari berkas JSON lokal
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

