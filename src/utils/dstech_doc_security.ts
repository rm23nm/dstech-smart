/**
 * Utilitas Keamanan & Verifikasi Surat-Menyurat Resmi PT. DSTech Smart Perkasa
 * (SPH, PO, Faktur Penjualan, Surat Jalan/DO, BAST, Kuitansi, Laporan Foto)
 * Memastikan dokumen diproteksi dengan 6-Digit Kata Sandi / PIN Verifikasi.
 */

export function getDocPin(doc: any): string {
  if (!doc) return "123456";

  // 1. Prioritaskan jika sudah tersimpan PIN 6 digit eksplisit
  const explicitPin = String(doc.accessPin || doc.docPin || "").trim();
  if (/^\d{4,8}$/.test(explicitPin)) {
    return explicitPin;
  }

  // 2. Jika ada verificationCode yang merupakan angka 4-8 digit
  const code = String(doc.verificationCode || "").trim();
  if (/^\d{4,8}$/.test(code)) {
    return code;
  }

  // 3. Deterministik fallback 6 digit angka berbasis string identitas dokumen
  // Menjamin dokumen yang sama selalu menghasilkan PIN yang konsisten setiap saat
  const seed = String(
    doc.id ||
    doc.quotationNumber ||
    doc.invoiceNumber ||
    doc.poNumber ||
    doc.orderNumber ||
    doc.receiptNumber ||
    doc.deliveryOrderNumber ||
    doc.date ||
    "DSTECH"
  );

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }

  const pinNumber = Math.abs(hash) % 900000 + 100000;
  return pinNumber.toString();
}

export function verifyDocPin(doc: any, inputPin?: string | null): boolean {
  if (!inputPin) return false;
  const cleanInput = String(inputPin).trim();
  if (!cleanInput) return false;

  const expectedPin = getDocPin(doc);
  if (cleanInput === expectedPin) return true;

  if (doc?.accessPin && cleanInput === String(doc.accessPin).trim()) return true;
  if (doc?.docPin && cleanInput === String(doc.docPin).trim()) return true;

  // Jika memasukkan kode verifikasi approval legalitas (misal DST-APP-...)
  if (doc?.verificationCode && cleanInput.toLowerCase() === String(doc.verificationCode).trim().toLowerCase()) {
    return true;
  }

  return false;
}

export function formatDocPinWhatsAppText(pin: string): string {
  return `🔐 *KATA SANDI / PIN VERIFIKASI DOKUMEN:*\n👉 *${pin}*\n_(Gunakan 6-digit kata sandi di atas saat membuka atau mengunduh tautan berkas resmi demi privasi & keamanan data transaksi Anda)_\n`;
}

export function formatDocPinEmailHtml(pin: string): string {
  return `
    <div style="margin: 20px 0; padding: 16px 20px; background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%); border: 2px dashed #4f46e5; border-radius: 12px; text-align: center;">
      <p style="margin: 0 0 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #4338ca;">
        🔐 Kata Sandi / PIN Verifikasi Dokumen Resmi
      </p>
      <div style="font-size: 28px; font-weight: 900; letter-spacing: 8px; font-family: monospace; color: #1e1b4b; margin: 4px 0;">
        ${pin}
      </div>
      <p style="margin: 4px 0 0; font-size: 11px; color: #64748b; line-height: 1.4;">
        Gunakan 6 digit PIN verifikasi di atas saat membuka dan mengunduh berkas resmi demi perlindungan privasi Anda.
      </p>
    </div>
  `;
}
