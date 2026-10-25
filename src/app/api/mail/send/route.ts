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
    const { fromEmail, toEmail, subject, bodyHtml, bodyText, cc, bcc } = body;

    if (!fromEmail || !toEmail || !subject || (!bodyHtml && !bodyText)) {
      return NextResponse.json(
        { success: false, message: "Pengirim, penerima, subjek, dan isi email wajib diisi." },
        { status: 400 }
      );
    }

    // Cari akun pengirim untuk password
    let senderPassword = defaultPasswords[fromEmail.toLowerCase()] || "M4m4cantik@";
    try {
      if (fs.existsSync(accountsFilePath)) {
        const accountsData = JSON.parse(fs.readFileSync(accountsFilePath, "utf-8"));
        const acc = accountsData.find((a: any) => a.email.toLowerCase() === fromEmail.toLowerCase());
        if (acc && acc.password) {
          senderPassword = acc.password;
        }
      }
    } catch (e) {
      console.warn("Could not read specific account password:", e);
    }

    // Host SMTP: jika di live VPS gunakan 127.0.0.1 atau mail.dstechsmart.com
    const isLiveServer = fs.existsSync("/www/server/panel");
    const smtpHost = isLiveServer ? "127.0.0.1" : "mail.dstechsmart.com";

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 465,
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
    });

    // Kirim pesan
    const info = await transporter.sendMail({
      from: `"${fromEmail.split("@")[0].toUpperCase()} - PT. DSTech Smart Perkasa" <${fromEmail}>`,
      to: toEmail,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject: subject,
      text: bodyText || bodyHtml.replace(/<[^>]*>?/gm, ""),
      html: bodyHtml || `<p>${bodyText}</p>`,
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
      snippet: (bodyText || bodyHtml.replace(/<[^>]*>?/gm, "")).substring(0, 120) + "...",
      bodyHtml: bodyHtml || `<p>${bodyText}</p>`,
      date: new Date().toISOString().replace("T", " ").substring(0, 19),
      isRead: true,
      isStarred: false,
      hasAttachments: false,
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
