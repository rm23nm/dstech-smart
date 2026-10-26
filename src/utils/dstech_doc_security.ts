/**
 * Utilitas Keamanan & Verifikasi Surat-Menyurat Resmi PT. DSTech Smart Perkasa
 * (SPH, PO, Faktur Penjualan, Surat Jalan/DO, BAST, Kuitansi, Laporan Foto)
 * Memastikan dokumen diproteksi dengan 6-Digit Kata Sandi / PIN Verifikasi.
 */

function hashSeedToPin(seed: string, caseSensitive: boolean = false): string {
  let hash = 0;
  const cleanSeed = caseSensitive ? String(seed || "DSTECH").trim() : String(seed || "DSTECH").trim().toUpperCase();
  for (let i = 0; i < cleanSeed.length; i++) {
    hash = ((hash << 5) - hash) + cleanSeed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 900000 + 100000).toString();
}

export function getDocOfficialNumber(doc: any): string {
  if (!doc) return "";
  // Prioritaskan nomor dokumen resmi yang dilihat manusia & tercantum di WA/Email/URL
  const num = String(
    doc.quotationNumber ||
    doc.invoiceNumber ||
    doc.poNumber ||
    doc.orderNumber ||
    doc.orderId ||
    doc.docNumber ||
    doc.no ||
    doc.receiptNumber ||
    doc.deliveryOrderNumber ||
    doc.id ||
    ""
  ).trim();
  return num;
}

export function getDocPin(doc: any): string {
  if (!doc) return "123456";

  // 1. Prioritaskan jika sudah tersimpan PIN eksplisit (4-8 digit)
  const explicitPin = String(doc.accessPin || doc.docPin || "").trim();
  if (/^\d{4,8}$/.test(explicitPin)) {
    return explicitPin;
  }

  // 2. Jika ada verificationCode yang merupakan angka 4-8 digit
  const code = String(doc.verificationCode || "").trim();
  if (/^\d{4,8}$/.test(code)) {
    return code;
  }

  // 3. Deterministik berbasis Nomor Dokumen Resmi (menjamin identik antara modal frontend, WA, Email, dan backend)
  const officialNumber = getDocOfficialNumber(doc);
  return hashSeedToPin(officialNumber);
}

export function verifyDocPin(doc: any, inputPin?: string | null): boolean {
  if (!inputPin) return false;
  const rawInput = String(inputPin).trim();
  if (!rawInput) return false;

  // Normalisasi input (hilangkan spasi atau tanda hubung jika diketik pengguna)
  const normalizedInput = rawInput.replace(/[-\s]/g, "").toUpperCase();

  // 1. Cek langsung terhadap PIN resmi dokumen
  const officialPin = getDocPin(doc);
  if (rawInput === officialPin || normalizedInput === officialPin) return true;

  // 2. Cek terhadap seluruh kemungkinan seed alternatif dokumen (baik case-insensitive maupun case-sensitive)
  const seeds = [
    doc?.quotationNumber,
    doc?.invoiceNumber,
    doc?.poNumber,
    doc?.orderNumber,
    doc?.orderId,
    doc?.docNumber,
    doc?.no,
    doc?.receiptNumber,
    doc?.deliveryOrderNumber,
    doc?.id,
  ].filter(Boolean);

  for (const s of seeds) {
    const pinUpper = hashSeedToPin(String(s), false);
    const pinCase = hashSeedToPin(String(s), true);
    if (rawInput === pinUpper || normalizedInput === pinUpper || rawInput === pinCase || normalizedInput === pinCase) {
      return true;
    }
  }

  // 3. Cek eksplisit accessPin / docPin
  if (doc?.accessPin) {
    const ap = String(doc.accessPin).trim();
    if (rawInput === ap || normalizedInput === ap.replace(/[-\s]/g, "").toUpperCase()) return true;
  }
  if (doc?.docPin) {
    const dp = String(doc.docPin).trim();
    if (rawInput === dp || normalizedInput === dp.replace(/[-\s]/g, "").toUpperCase()) return true;
  }

  // 4. Cek verificationCode (misal DST-APP-202610-2415 atau digitnya saja)
  if (doc?.verificationCode) {
    const vc = String(doc.verificationCode).trim();
    if (rawInput.toLowerCase() === vc.toLowerCase()) return true;
    if (normalizedInput === vc.replace(/[-\s]/g, "").toUpperCase()) return true;
    const digitsOnly = vc.replace(/\D/g, "");
    if (digitsOnly && (normalizedInput === digitsOnly || rawInput === digitsOnly)) return true;
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
