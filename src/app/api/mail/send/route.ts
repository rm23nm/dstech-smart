import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const messagesFilePath = path.join(process.cwd(), "src", "data", "dstech_mail_messages.json");
const accountsFilePath = path.join(process.cwd(), "src", "data", "dstech_mail_accounts.json");

// Default passwords untuk akun perusahaan jika belum tercatat di local storage
const defaultPasswords: Record<string, string> = {
  "cs@dstechsmart.com": "M4m4cantik@",
  "ramadhanist@dstechsmart.com": "M4m4cantik@",
  "noreplay@dstechsmart.com": "M4m4cantik",
  "cs@dstechsmart.id": "M4m4cantik@",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fromEmail, toEmail, subject, bodyHtml, bodyText, cc, bcc, attachments } = body;

    if (!fromEmail || !toEmail || !subject || (!bodyHtml && !bodyText)) {
      return NextResponse.json(
        { success: false, message: "Pengirim, penerima, subjek, dan isi email wajib diisi." },
        { status: 400 }
      );
    }

    // Cari data akun pengirim untuk password, provider, dan konfigurasi SMTP
    let senderPassword = defaultPasswords[fromEmail.toLowerCase()] || "M4m4cantik@";
    let senderProvider = "internal";
    let customSmtpHost = "";
    let customSmtpPort = 465;

    try {
      if (fs.existsSync(accountsFilePath)) {
        const accountsData = JSON.parse(fs.readFileSync(accountsFilePath, "utf-8"));
        const acc = accountsData.find((a: any) => a.email.toLowerCase() === fromEmail.toLowerCase());
        if (acc) {
          if (acc.password) senderPassword = acc.password;
          if (acc.provider) senderProvider = acc.provider;
          if (acc.smtpHost) customSmtpHost = acc.smtpHost;
          if (acc.smtpPort) customSmtpPort = acc.smtpPort;
        }
      }
    } catch (e) {
      console.warn("Could not read specific account settings:", e);
    }

    // Tentukan konfigurasi SMTP dinamis berdasarkan provider akun
    const lowerFrom = fromEmail.toLowerCase();
    let transportConfig: any;

    if (senderProvider === "gmail" || lowerFrom.endsWith("@gmail.com")) {
      // Google Gmail SMTP
      transportConfig = {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: fromEmail,
          pass: senderPassword.replace(/\s+/g, ""), // Bersihkan spasi format 4x4 App Password Google
        },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
      };
    } else if (senderProvider === "yahoo" || lowerFrom.endsWith("@yahoo.com") || lowerFrom.endsWith("@ymail.com")) {
      // Yahoo Mail / Ymail SMTP
      transportConfig = {
        host: "smtp.mail.yahoo.com",
        port: 465,
        secure: true,
        auth: {
          user: fromEmail,
          pass: senderPassword.replace(/\s+/g, ""), // Bersihkan spasi format App Password Yahoo
        },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
      };
    } else {
      // Akun internal domain DSTech (@dstechsmart.com / @dstechsmart.id)
      const isLiveServer = fs.existsSync("/www/server/panel");
      const smtpHost = isLiveServer ? "127.0.0.1" : (customSmtpHost || "mail.dstechsmart.com");

      transportConfig = {
        host: smtpHost,
        port: customSmtpPort || 465,
        secure: true, // SSL
        auth: {
          user: fromEmail,
          pass: senderPassword,
        },
        tls: {
          rejectUnauthorized: false, // Menghindari isu self-signed / SNI internal
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    // Format lampiran berkas jika ada
    let mailAttachments: any[] = [];
    if (Array.isArray(attachments) && attachments.length > 0) {
      mailAttachments = attachments.map((att: any) => {
        let contentBuffer: Buffer;
        if (typeof att.content === "string") {
          const base64Data = att.content.includes("base64,") ? att.content.split("base64,")[1] : att.content;
          contentBuffer = Buffer.from(base64Data, "base64");
        } else {
          contentBuffer = Buffer.from(att.content);
        }
        return {
          filename: att.filename || att.name || "lampiran",
          content: contentBuffer,
          contentType: att.contentType || att.type || undefined,
        };
      });
    }

    // Kirim pesan
    const info = await transporter.sendMail({
      from: `"${fromEmail.split("@")[0].toUpperCase()} - PT. DSTech Smart Perkasa" <${fromEmail}>`,
      to: toEmail,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject: subject,
      text: bodyText || bodyHtml?.replace(/<[^>]*>?/gm, "") || "",
      html: bodyHtml || `<div style="white-space: pre-wrap; font-family: sans-serif; line-height: 1.6;">${bodyText}</div>`,
      attachments: mailAttachments.length > 0 ? mailAttachments : undefined,
    });

    // Simpan pesan ke folder sent
    const newSentMessage = {
      id: `dstech_msg_${Date.now()}`,
      accountEmail: fromEmail,
      folder: "sent",
      fromName: fromEmail.split("@")[0].toUpperCase() + " DSTech",
      fromEmail: fromEmail,
      toEmail: toEmail,
      subject: subject,
      snippet: (bodyText || (bodyHtml ? bodyHtml.replace(/<[^>]*>?/gm, "") : "")).substring(0, 120) + "...",
      bodyHtml: bodyHtml || `<div style="white-space: pre-wrap; font-family: sans-serif; line-height: 1.6;">${bodyText}</div>`,
      date: new Date().toISOString().replace("T", " ").substring(0, 19),
      isRead: true,
      isStarred: false,
      hasAttachments: mailAttachments.length > 0,
    };

    try {
      let messages = [];
      if (fs.existsSync(messagesFilePath)) {
        messages = JSON.parse(fs.readFileSync(messagesFilePath, "utf-8"));
      }
      messages.unshift(newSentMessage);
      fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), "utf-8");
    } catch (saveErr) {
      console.warn("Could not append to local sent messages:", saveErr);
    }

    return NextResponse.json({
      success: true,
      message: `Email berhasil dikirim ke ${toEmail}`,
      messageId: info.messageId,
      data: newSentMessage,
    });
  } catch (error: any) {
    console.error("Error sending mail:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Gagal mengirim email: ${error.message || "Kesalahan server SMTP"}`,
      },
      { status: 500 }
    );
  }
}
