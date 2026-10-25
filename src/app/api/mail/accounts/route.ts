import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);
const accountsFilePath = path.join(process.cwd(), "src", "data", "dstech_mail_accounts.json");

interface MailAccount {
  id: string;
  email: string;
  username: string;
  domain: string;
  fullName: string;
  quotaMb: number;
  usedMb: number;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  description?: string;
  password?: string;
}

function readAccounts(): MailAccount[] {
  try {
    if (!fs.existsSync(accountsFilePath)) {
      return [];
    }
    const data = fs.readFileSync(accountsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading dstech_mail_accounts.json:", err);
    return [];
  }
}

function saveAccounts(accounts: MailAccount[]) {
  fs.writeFileSync(accountsFilePath, JSON.stringify(accounts, null, 2), "utf-8");
}

export async function GET() {
  try {
    const accounts = readAccounts();
    return NextResponse.json({ success: true, data: accounts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat akun email" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, domain = "dstechsmart.com", fullName, password, quotaMb = 5120, description = "" } = body;

    if (!username || !password || !fullName) {
      return NextResponse.json(
        { success: false, message: "Username email, nama lengkap, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9._-]/g, "");
    const email = `${cleanUsername}@${domain}`;
    const accounts = readAccounts();

    if (accounts.some((acc) => acc.email.toLowerCase() === email)) {
      return NextResponse.json(
        { success: false, message: `Akun email ${email} sudah terdaftar sebelumnya.` },
        { status: 400 }
      );
    }

    const newAccount: MailAccount = {
      id: `dstech_mail_acc_${Date.now()}`,
      email,
      username: cleanUsername,
      domain,
      fullName: fullName.trim(),
      quotaMb: Number(quotaMb) || 5120,
      usedMb: 0,
      isActive: true,
      isAdmin: false,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      description: description.trim(),
      password, // disimpan untuk credential auth lokal / internal
    };

    // Sinkronisasi otomatis ke database postfixadmin di live VPS jika tersedia
    const dbPath = "/www/vmail/postfixadmin.db";
    if (fs.existsSync(dbPath)) {
      try {
        let md5CryptHash = "";
        try {
          const { stdout } = await execPromise(`openssl passwd -1 "${password.replace(/"/g, '\\"')}"`);
          md5CryptHash = stdout.trim();
        } catch {
          md5CryptHash = password;
        }

        const hexEncoded = Buffer.from(Buffer.from(password).toString("base64")).toString("hex");
        const maildir = `${email}/`;
        const quotaBytes = (Number(quotaMb) || 5120) * 1024 * 1024;
        const now = new Date().toISOString().replace("T", " ").substring(0, 19);

        // Eksekusi insert langsung ke sqlite3 postfixadmin dengan hash MD5-CRYPT valid
        const sqlCmd = `sqlite3 ${dbPath} "INSERT OR REPLACE INTO mailbox (username, password, password_encode, full_name, is_admin, maildir, quota, current_usage, quota_active, local_part, domain, created, modified, active) VALUES ('${email}', '${md5CryptHash}', '${hexEncoded}', '${fullName.trim()}', 0, '${maildir}', ${quotaBytes}, 0, 1, '${cleanUsername}', '${domain}', '${now}', '${now}', 1);"`;
        await execPromise(sqlCmd);

        // Buat folder Maildir jika belum ada
        const maildirPath = `/www/vmail/${domain}/${cleanUsername}`;
        await execPromise(`mkdir -p ${maildirPath}/cur ${maildirPath}/new ${maildirPath}/tmp && chown -R vmail:mail ${maildirPath} && chmod -R 700 ${maildirPath}`);
      } catch (dbErr) {
        console.warn("Notice: PostfixAdmin direct sync warning:", dbErr);
      }
    }

    accounts.push(newAccount);
    saveAccounts(accounts);

    return NextResponse.json({
      success: true,
      message: `Akun email ${email} berhasil dibuat dan diaktifkan.`,
      data: newAccount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat akun email" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { email, newPassword, fullName, isActive, quotaMb } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Alamat email wajib disertakan." },
        { status: 400 }
      );
    }

    const accounts = readAccounts();
    const idx = accounts.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());

    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: `Akun email ${email} tidak ditemukan.` },
        { status: 404 }
      );
    }

    if (newPassword) {
      accounts[idx].password = newPassword;
      const dbPath = "/www/vmail/postfixadmin.db";
      if (fs.existsSync(dbPath)) {
        try {
          let md5CryptHash = "";
          try {
            const { stdout } = await execPromise(`openssl passwd -1 "${newPassword.replace(/"/g, '\\"')}"`);
            md5CryptHash = stdout.trim();
          } catch {
            md5CryptHash = newPassword;
          }

          const hexEncoded = Buffer.from(Buffer.from(newPassword).toString("base64")).toString("hex");
          const sqlCmd = `sqlite3 ${dbPath} "UPDATE mailbox SET password='${md5CryptHash}', password_encode='${hexEncoded}', modified=datetime('now') WHERE username='${email}';"`;
          await execPromise(sqlCmd);
        } catch (dbErr) {
          console.warn("Notice: PostfixAdmin password update warning:", dbErr);
        }
      }
    }

    if (fullName) accounts[idx].fullName = fullName;
    if (typeof isActive === "boolean") accounts[idx].isActive = isActive;
    if (quotaMb) accounts[idx].quotaMb = Number(quotaMb);

    saveAccounts(accounts);

    return NextResponse.json({
      success: true,
      message: `Akun email ${email} berhasil diperbarui.`,
      data: accounts[idx],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui akun email" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Parameter email wajib disertakan." },
        { status: 400 }
      );
    }

    let accounts = readAccounts();
    const exists = accounts.some((a) => a.email.toLowerCase() === email.toLowerCase());

    if (!exists) {
      return NextResponse.json(
        { success: false, message: `Akun email ${email} tidak ditemukan.` },
        { status: 404 }
      );
    }

    accounts = accounts.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
    saveAccounts(accounts);

    const dbPath = "/www/vmail/postfixadmin.db";
    if (fs.existsSync(dbPath)) {
      try {
        await execPromise(`sqlite3 ${dbPath} "UPDATE mailbox SET active=0 WHERE username='${email}';"`);
      } catch (dbErr) {
        console.warn("Notice: PostfixAdmin deactivation warning:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Akun email ${email} berhasil dinonaktifkan dari sistem.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus akun email" },
      { status: 500 }
    );
  }
}
