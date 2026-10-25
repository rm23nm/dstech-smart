import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const messagesFilePath = path.join(process.cwd(), "src", "data", "dstech_mail_messages.json");

interface MailAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

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
  attachmentsList?: MailAttachment[];
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

function decodeQuotedPrintable(str: string): string {
  if (!str) return "";
  const noSoft = str.replace(/=[ \t]*\r?\n/g, "").replace(/=\r/g, "");
  try {
    const bytes: number[] = [];
    for (let i = 0; i < noSoft.length; i++) {
      if (noSoft[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(noSoft.substr(i + 1, 2))) {
        bytes.push(parseInt(noSoft.substr(i + 1, 2), 16));
        i += 2;
      } else {
        bytes.push(noSoft.charCodeAt(i));
      }
    }
    return Buffer.from(bytes).toString("utf-8");
  } catch {
    return noSoft;
  }
}

function decodeBase64Payload(str: string): string {
  if (!str) return "";
  try {
    const cleanB64 = str.replace(/[\r\n\s]/g, "");
    return Buffer.from(cleanB64, "base64").toString("utf-8");
  } catch {
    return str;
  }
}

function decodePartPayload(payload: string, encoding?: string): string {
  const enc = (encoding || "").toLowerCase().trim();
  if (enc === "base64") {
    return decodeBase64Payload(payload);
  } else if (enc === "quoted-printable") {
    return decodeQuotedPrintable(payload);
  }
  return payload;
}

function extractBoundary(contentTypeHeader?: string): string | null {
  if (!contentTypeHeader) return null;
  const m = contentTypeHeader.match(/boundary="?([^";\r\n\s]+)"?/i);
  return m ? m[1].trim() : null;
}

function parseMimeBody(
  headers: Record<string, string>,
  rawBody: string
): { cleanText: string; cleanHtml: string; attachmentsList: MailAttachment[] } {
  let textParts: string[] = [];
  let htmlParts: string[] = [];
  const inlineImages = new Map<string, string>();
  const attachmentsList: MailAttachment[] = [];

  const topContentType = headers["content-type"] || "text/plain";
  const topEncoding = headers["content-transfer-encoding"] || "";
  const topBoundary = extractBoundary(topContentType);

  const processPart = (rawPart: string, fallbackEncoding?: string) => {
    const trimmed = rawPart.trim();
    if (!trimmed || trimmed === "--") return;

    const splitMatch = rawPart.match(/\r?\n\r?\n/);
    let partHeaders: Record<string, string> = {};
    let partBody = "";

    if (splitMatch && splitMatch.index !== undefined) {
      const partHeaderSection = rawPart.substring(0, splitMatch.index);
      partBody = rawPart.substring(splitMatch.index + splitMatch[0].length);

      let curKey = "";
      for (const line of partHeaderSection.split(/\r?\n/)) {
        if (/^\s/.test(line) && curKey) {
          partHeaders[curKey] += " " + line.trim();
        } else {
          const colonIdx = line.indexOf(":");
          if (colonIdx > 0) {
            curKey = line.substring(0, colonIdx).toLowerCase().trim();
            partHeaders[curKey] = line.substring(colonIdx + 1).trim();
          }
        }
      }
    } else {
      partBody = rawPart;
    }

    const cType = partHeaders["content-type"] || "text/plain";
    const cEncoding = partHeaders["content-transfer-encoding"] || fallbackEncoding || "";
    const cDisp = partHeaders["content-disposition"] || "";
    const cId = (partHeaders["content-id"] || "").replace(/[<>]/g, "").trim();

    const isImage = cType.toLowerCase().startsWith("image/");
    const isAttachment =
      cDisp.toLowerCase().includes("attachment") ||
      (!cType.toLowerCase().includes("text/") && !cType.toLowerCase().includes("multipart/"));

    const innerBoundary = extractBoundary(cType);

    if (innerBoundary && partBody.includes("--" + innerBoundary)) {
      const subParts = partBody.split("--" + innerBoundary);
      for (const sp of subParts) {
        processPart(sp, cEncoding);
      }
      return;
    }

    // Hanya sniffing boundary jika part bertipe multipart (jangan potong leaf text/html atau text/plain)
    if (cType.toLowerCase().includes("multipart/")) {
      const anyBoundary = partBody.match(/(?:\r?\n|^)--([a-zA-Z0-9_\-+=.]{8,})(?:\r?\n|--)/);
      if (anyBoundary && anyBoundary[1] && partBody.split("--" + anyBoundary[1]).length > 2) {
        const discoveredBoundary = anyBoundary[1];
        const subParts = partBody.split("--" + discoveredBoundary);
        for (const sp of subParts) {
          processPart(sp, cEncoding);
        }
        return;
      }
    }

    let cleanedLeafBody = partBody.replace(/--[a-zA-Z0-9_\-+=.]+--?/g, "").trim();

    // Ekstraksi nama berkas
    let fileName = "";
    const fnMatch = cDisp.match(/filename="?([^";\r\n]+)"?/i) || cType.match(/name="?([^";\r\n]+)"?/i);
    if (fnMatch) fileName = parseMimeHeader(fnMatch[1].trim());

    // Jika bertipe gambar atau berkas lampiran
    if (isImage || isAttachment) {
      const mime = cType.split(";")[0].toLowerCase().trim() || (isImage ? "image/png" : "application/octet-stream");
      const cleanB64 = cleanedLeafBody.replace(/[\r\n\s]/g, "");
      const isBase64 = cEncoding.toLowerCase() === "base64" || /^[A-Za-z0-9+/=]+$/.test(cleanB64);
      const dataUrl = isBase64
        ? `data:${mime};base64,${cleanB64}`
        : `data:${mime};charset=utf-8,${encodeURIComponent(cleanedLeafBody)}`;

      if (cId) {
        inlineImages.set(cId.toLowerCase(), dataUrl);
        const atIdx = cId.indexOf("@");
        if (atIdx > 0) {
          inlineImages.set(cId.substring(0, atIdx).toLowerCase(), dataUrl);
        }
      }
      if (fileName) {
        inlineImages.set(fileName.toLowerCase(), dataUrl);
      }

      attachmentsList.push({
        name: fileName || (cId ? `${cId}.png` : `lampiran_${attachmentsList.length + 1}${isImage ? ".png" : ""}`),
        size: Math.round(cleanB64.length * 0.75),
        type: mime,
        dataUrl,
      });
      return;
    }

    const decoded = decodePartPayload(cleanedLeafBody, cEncoding);

    if (cType.toLowerCase().includes("text/html")) {
      htmlParts.push(decoded);
    } else if (cType.toLowerCase().includes("text/plain")) {
      textParts.push(decoded);
    }
  };

  if (topBoundary && rawBody.includes("--" + topBoundary)) {
    const parts = rawBody.split("--" + topBoundary);
    for (const part of parts) {
      processPart(part, topEncoding);
    }
  } else if (topContentType.toLowerCase().includes("multipart/")) {
    const anyBoundary = rawBody.match(/(?:\r?\n|^)--([a-zA-Z0-9_\-+=.]{8,})(?:\r?\n|--)/);
    if (anyBoundary && anyBoundary[1] && rawBody.split("--" + anyBoundary[1]).length > 2) {
      const detectedBoundary = anyBoundary[1];
      const parts = rawBody.split("--" + detectedBoundary);
      for (const part of parts) {
        processPart(part, topEncoding);
      }
    } else {
      const decoded = decodePartPayload(rawBody.trim(), topEncoding);
      if (topContentType.toLowerCase().includes("text/html")) {
        htmlParts.push(decoded);
      } else {
        textParts.push(decoded);
      }
    }
  } else {
    const decoded = decodePartPayload(rawBody.trim(), topEncoding);
    if (topContentType.toLowerCase().includes("text/html")) {
      htmlParts.push(decoded);
    } else {
      textParts.push(decoded);
    }
  }

  let cleanText = textParts.filter(Boolean).join("\n\n").trim();
  let cleanHtml = htmlParts.filter(Boolean).join("<hr/>").trim();

  // Gantikan referensi CID gambar inline dengan Data URL Base64 yang sesuai
  if (cleanHtml && inlineImages.size > 0) {
    cleanHtml = cleanHtml.replace(/src=["']cid:([^"'\s>]+)["']/gi, (fullMatch, cidVal) => {
      const cleanCid = cidVal.replace(/[<>]/g, "").trim().toLowerCase();
      if (inlineImages.has(cleanCid)) {
        return `src="${inlineImages.get(cleanCid)}"`;
      }
      const atIdx = cleanCid.indexOf("@");
      if (atIdx > 0 && inlineImages.has(cleanCid.substring(0, atIdx))) {
        return `src="${inlineImages.get(cleanCid.substring(0, atIdx))}"`;
      }
      return fullMatch;
    });
  }

  if (!cleanText && cleanHtml) {
    cleanText = cleanHtml
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (!cleanHtml && cleanText) {
    cleanHtml = `<div style="white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b;">${cleanText
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</div>`;
  } else if (cleanHtml) {
    cleanHtml = cleanHtml.replace(/<script[\s\S]*?<\/script>/gi, "");
  }

  return { cleanText, cleanHtml, attachmentsList };
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

    const { cleanText, cleanHtml, attachmentsList } = parseMimeBody(headers, rawBody);
    const snippet = (cleanText || "").replace(/\s+/g, " ").trim().substring(0, 160) || "(Tidak ada ringkasan teks)";
    const dateStr = headers["date"] || new Date().toISOString();
    const subject = parseMimeHeader(headers["subject"] || "(Tanpa Subjek)");

    // Jalankan deteksi spam otomatis
    const spamCheck = detectSpam({
      subject,
      snippet,
      fromEmail: fromEmail || "",
      fromName: fromName || "",
      bodyHtml: cleanHtml,
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
      snippet,
      bodyHtml: cleanHtml || cleanText || "(Pesan kosong)",
      date: dateStr,
      isRead: !isNew,
      isStarred: false,
      hasAttachments: attachmentsList.length > 0 || !!headers["content-type"]?.includes("multipart/mixed"),
      attachmentsList: attachmentsList.length > 0 ? attachmentsList : undefined,
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
  const isSpecificAccount = accountEmail && accountEmail.toUpperCase() !== "ALL";

  if (isSpecificAccount) {
    const [u, d] = (accountEmail || "").toLowerCase().trim().split("@");
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

    const isAll = !accountEmail || accountEmail.toUpperCase() === "ALL";
    const scanAccountParam = isAll ? null : accountEmail;

    // 1. Baca pesan nyata dari Maildir server
    const maildirMessages = readMessagesFromMaildir(scanAccountParam, folder);

    // 2. Baca pesan lokal dari JSON
    let jsonMessages = readMessages();
    if (!isAll && accountEmail) {
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

    // Hitung unread count untuk account ini (atau seluruh akun jika ALL) di folder inbox
    const allInbox = readMessagesFromMaildir(scanAccountParam, "inbox");
    const unreadInboxCount = allInbox.filter((m) => !m.isRead).length;

    // Hitung total spam
    const allSpam = readMessagesFromMaildir(scanAccountParam, "spam");
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

  const candidateRelativeDirs = [
    "new",
    "cur",
    path.join(".Trash", "new"),
    path.join(".Trash", "cur"),
    path.join(".Junk", "new"),
    path.join(".Junk", "cur"),
    path.join(".Sent", "new"),
    path.join(".Sent", "cur"),
  ];

  // 1. Coba cari di akun yang spesifik jika akun valid
  if (accountEmail && accountEmail.includes("@") && accountEmail.toUpperCase() !== "ALL") {
    const [u, d] = accountEmail.toLowerCase().trim().split("@");
    if (u && d) {
      const accDir = path.join(vmailRoot, d, u);
      if (fs.existsSync(accDir)) {
        for (const rel of candidateRelativeDirs) {
          const cDir = path.join(accDir, rel);
          if (fs.existsSync(cDir)) {
            const p = path.join(cDir, fileName);
            if (fs.existsSync(p)) return p;
          }
        }
      }
    }
  }

  // 2. Universal fallback: cari di seluruh domain dan user jika accountEmail="ALL" atau belum ketemu
  try {
    const domains = fs.readdirSync(vmailRoot);
    for (const d of domains) {
      const dPath = path.join(vmailRoot, d);
      if (fs.statSync(dPath).isDirectory() && d.includes(".")) {
        const users = fs.readdirSync(dPath);
        for (const u of users) {
          const accDir = path.join(dPath, u);
          if (fs.statSync(accDir).isDirectory() && !u.startsWith(".")) {
            for (const rel of candidateRelativeDirs) {
              const cDir = path.join(accDir, rel);
              if (fs.existsSync(cDir)) {
                const p = path.join(cDir, fileName);
                if (fs.existsSync(p)) return p;
              }
            }
          }
        }
      }
    }
  } catch {}

  return null;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ids, isRead, isStarred, folder, isSpam, accountEmail } = body;

    const targetIds: string[] = Array.isArray(ids) && ids.length > 0 ? ids : (id ? [id] : []);

    if (targetIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "ID pesan wajib disertakan." },
        { status: 400 }
      );
    }

    const messages = readMessages();

    for (const currentId of targetIds) {
      // 1. Sinkronisasi berkas fisik di Maildir server jika currentId adalah maildir_...
      if (currentId.startsWith("maildir_") && folder) {
        const fileName = currentId.replace("maildir_", "");
        const foundPath = findMaildirFile(accountEmail || "", fileName);
        if (foundPath) {
          // Cari root mailbox user direktori (/www/vmail/{domain}/{user})
          const normPath = foundPath.replace(/\\/g, "/");
          const vmailIdx = normPath.indexOf("/www/vmail/");
          let accDir = "";
          if (vmailIdx !== -1) {
            const relParts = normPath.substring(vmailIdx + "/www/vmail/".length).split("/");
            if (relParts.length >= 2) {
              accDir = path.join("/www/vmail", relParts[0], relParts[1]);
            }
          }

          if (accDir && fs.existsSync(accDir)) {
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
      }

      // 2. Simpan status di JSON
      const idx = messages.findIndex((m) => m.id === currentId);

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
      } else {
        // Jika pesan berasal dari Maildir, buat record override di dstech_mail_messages.json
        const newOverride: MailMessage = {
          id: currentId,
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
      }
    }

    saveMessages(messages);

    return NextResponse.json({
      success: true,
      count: targetIds.length,
      message: `${targetIds.length} pesan berhasil diperbarui.`,
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
    const idsParam = searchParams.get("ids");
    let accountEmail = searchParams.get("accountEmail") || "";
    let targetIds: string[] = [];

    if (id) {
      targetIds.push(id);
    } else if (idsParam) {
      targetIds = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    } else {
      try {
        const body = await request.json();
        if (body.ids && Array.isArray(body.ids)) {
          targetIds = body.ids;
        } else if (body.id) {
          targetIds = [body.id];
        }
        if (body.accountEmail) accountEmail = body.accountEmail;
      } catch {}
    }

    if (targetIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "ID pesan wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Hapus berkas fisik di Maildir server jika id adalah maildir_...
    for (const currentId of targetIds) {
      if (currentId.startsWith("maildir_")) {
        const fileName = currentId.replace("maildir_", "");
        const foundPath = findMaildirFile(accountEmail || "", fileName);

        if (foundPath && fs.existsSync(foundPath)) {
          try {
            fs.unlinkSync(foundPath);
          } catch (unlinkErr) {
            console.warn("Could not delete physical maildir file:", unlinkErr);
          }
        }
      }
    }

    // 2. Hapus dari berkas JSON lokal
    let messages = readMessages();
    const idSet = new Set(targetIds);
    messages = messages.filter((m) => !idSet.has(m.id));
    saveMessages(messages);

    return NextResponse.json({
      success: true,
      count: targetIds.length,
      message: `${targetIds.length} pesan berhasil dihapus permanen.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus pesan" },
      { status: 500 }
    );
  }
}


