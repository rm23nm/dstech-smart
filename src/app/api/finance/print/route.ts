import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDocPin, verifyDocPin } from "@/utils/dstech_doc_security";

function renderSecurityLockScreen(params: {
  docType: string;
  docNo: string;
  docTitle: string;
  recipientName: string;
  docDate: string;
  hasError: boolean;
  receiptNo?: string;
}) {
  const { docType, docNo, docTitle, recipientName, docDate, hasError, receiptNo } = params;

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Akses Dokumen Resmi - PT. DSTech Smart Perkasa</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono-code { font-family: 'JetBrains Mono', monospace; }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
    .animate-shake { animation: shake 0.4s ease-in-out; }
  </style>
</head>
<body class="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 min-h-screen text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
  <!-- Ambient background glow elements -->
  <div class="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

  <div class="w-full max-w-md relative z-10 my-8">
    <!-- Brand / Company Header -->
    <div class="text-center mb-6">
      <div class="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-3">
        <img src="/logo.png" alt="PT. DSTech Smart Perkasa" class="h-10 w-auto object-contain" onerror="this.style.display='none'" />
        <span class="text-base font-black tracking-tight text-white ml-2">PT. DSTECH SMART PERKASA</span>
      </div>
      <p class="text-xs text-indigo-300 font-medium">Enterprise Technology &amp; Security Infrastructure</p>
    </div>

    <!-- Main Verification Card -->
    <div class="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/60 relative overflow-hidden">
      <!-- Top Ribbon / Accent Line -->
      <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"></div>

      <!-- Security Status Badge -->
      <div class="flex items-center justify-center mb-5">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
          <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          🔒 Dokumen Resmi Terproteksi PIN
        </span>
      </div>

      <div class="text-center mb-6">
        <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">Verifikasi Akses Dokumen</h1>
        <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Dokumen ini dilindungi demi privasi &amp; keamanan transaksi Anda. Silakan masukkan <strong>6 Digit PIN Verifikasi</strong> yang telah dilampirkan via <strong>WhatsApp</strong> atau <strong>Email</strong> Anda.
        </p>
      </div>

      <!-- Info Ringkas Dokumen (Aman & Non-Sensitif) -->
      <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6 space-y-2 text-xs">
        <div class="flex items-center justify-between text-slate-400">
          <span>Jenis Dokumen:</span>
          <span class="font-bold text-slate-200 text-right">${docTitle}</span>
        </div>
        <div class="flex items-center justify-between border-t border-slate-800/80 pt-2 text-slate-400">
          <span>Nomor Dokumen:</span>
          <span class="font-mono-code font-black text-indigo-300 text-right">${docNo}</span>
        </div>
        <div class="flex items-center justify-between border-t border-slate-800/80 pt-2 text-slate-400">
          <span>Ditujukan Kepada:</span>
          <span class="font-bold text-slate-200 text-right truncate max-w-[200px]">${recipientName}</span>
        </div>
        <div class="flex items-center justify-between border-t border-slate-800/80 pt-2 text-slate-400">
          <span>Tanggal Dokumen:</span>
          <span class="text-slate-300 text-right">${docDate}</span>
        </div>
      </div>

      ${hasError ? `
        <!-- Error Alert -->
        <div class="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-shake">
          <span class="text-base shrink-0">⚠️</span>
          <div class="leading-relaxed">
            <strong class="font-bold block text-rose-100">PIN Verifikasi Salah</strong>
            Kode PIN yang dimasukkan tidak cocok. Silakan periksa kembali pesan WhatsApp atau Email resmi yang Anda terima dari PT. DSTech Smart Perkasa.
          </div>
        </div>
      ` : ''}

      <!-- Form Input PIN -->
      <form method="GET" action="/api/finance/print" class="space-y-4">
        <input type="hidden" name="doc" value="${docType}" />
        <input type="hidden" name="no" value="${docNo}" />
        ${receiptNo ? `<input type="hidden" name="receiptNo" value="${receiptNo}" />` : ''}

        <div>
          <label for="input-pin" class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 text-center">
            Ketik 6 Digit Kata Sandi / PIN Dokumen:
          </label>
          <div class="relative">
            <input
              type="text"
              id="input-pin"
              name="pin"
              autocomplete="off"
              maxlength="40"
              required
              autofocus
              placeholder="Ketik 6 Digit PIN Dokumen"
              class="w-full py-3.5 px-4 text-center tracking-[0.25em] text-xl sm:text-2xl font-black font-mono-code rounded-2xl bg-slate-950 border ${hasError ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'} text-indigo-300 placeholder-slate-600 focus:outline-none transition-all shadow-inner"
            />
            <button
              type="button"
              onclick="togglePinVisibility()"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
              title="Tampilkan / Sembunyikan PIN"
            >
              <span id="eye-icon" class="text-base">👁️</span>
            </button>
          </div>
          <span class="text-[10px] text-slate-500 block text-center mt-1.5">
            *PIN angka tercantum pada pesan WhatsApp / Email resmi
          </span>
        </div>

        <button
          type="submit"
          class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-sm tracking-wide shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🔓 Buka &amp; Verifikasi Dokumen</span>
        </button>
      </form>

      <!-- Customer Support Section -->
      <div class="mt-6 pt-5 border-t border-slate-800 text-center">
        <p class="text-[11px] text-slate-400 mb-2">
          Belum menerima atau lupa PIN Verifikasi?
        </p>
        <a
          href="https://wa.me/6282213768877?text=${encodeURIComponent(`Halo Admin PT. DSTech Smart Perkasa, saya memerlukan bantuan kata sandi / PIN verifikasi untuk membuka dokumen ${docTitle} Nomor: ${docNo}.`)}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
        >
          <span>💬 Bantuan WhatsApp: 0822-1376-8877</span>
        </a>
      </div>
    </div>

    <!-- Security & Legal Notice Footer -->
    <div class="text-center mt-6 text-[10px] text-slate-500 space-y-1">
      <p>🛡️ Dilindungi oleh Sistem Keamanan Dokumen PT. DSTech Smart Perkasa.</p>
      <p>Sesuai standar perlindungan data transaksi &amp; UU ITE No. 11 Thn 2008.</p>
    </div>
  </div>

  <script>
    function togglePinVisibility() {
      const pinInput = document.getElementById('input-pin');
      const eyeIcon = document.getElementById('eye-icon');
      if (!pinInput) return;
      if (pinInput.type === 'password') {
        pinInput.type = 'text';
        if (eyeIcon) eyeIcon.textContent = '🔒';
      } else {
        pinInput.type = 'password';
        if (eyeIcon) eyeIcon.textContent = '👁️';
      }
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
const PRODUCTS_FILE = path.join(process.cwd(), "src", "data", "dstech_products.json");
const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "dstech_settings.json");

function readGeneralSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading dstech_settings.json:", e);
  }
  return {};
}

function readFinanceData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_finance_erp.json:", err);
  }
  return { sales: [], quotations: [], purchases: [], bank_accounts: [], settings: {} };
}

function readProducts(): any[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading dstech_products.json:", err);
  }
  return [];
}

function formatRupiah(num: number): string {
  return "Rp " + (Number(num) || 0).toLocaleString("id-ID");
}

function angkaKeTerbilang(nilai: number): string {
  const bilangan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];
  const n = Math.floor(Math.abs(nilai));
  if (n < 12) return bilangan[n];
  if (n < 20) return angkaKeTerbilang(n - 10) + " Belas";
  if (n < 100) return angkaKeTerbilang(Math.floor(n / 10)) + " Puluh " + bilangan[n % 10];
  if (n < 200) return "Seratus " + angkaKeTerbilang(n - 100);
  if (n < 1000) return angkaKeTerbilang(Math.floor(n / 100)) + " Ratus " + angkaKeTerbilang(n % 100);
  if (n < 2000) return "Seribu " + angkaKeTerbilang(n - 1000);
  if (n < 1000000) return angkaKeTerbilang(Math.floor(n / 1000)) + " Ribu " + angkaKeTerbilang(n % 1000);
  if (n < 1000000000) return angkaKeTerbilang(Math.floor(n / 1000000)) + " Juta " + angkaKeTerbilang(n % 1000000);
  if (n < 1000000000000) return angkaKeTerbilang(Math.floor(n / 1000000000)) + " Miliar " + angkaKeTerbilang(n % 1000000000);
  return angkaKeTerbilang(Math.floor(n / 1000000000000)) + " Triliun " + angkaKeTerbilang(n % 1000000000000);
}

function getFilteredBankAccounts(bankAccounts: any[], entityType?: string): any[] {
  const isNonPt = entityType === "NON_PT";
  const filtered = (bankAccounts || []).filter((b: any) => {
    if (b.status && b.status !== "Aktif") return false;
    if (isNonPt) {
      return b.entityType === "NON_PT";
    }
    // Dokumen PT: Wajib hanya rekening ber-entityType PT dan BUKAN NON_PT
    return (b.entityType || "PT") === "PT" && b.entityType !== "NON_PT";
  });

  if (filtered.length > 0) return filtered;

  if (isNonPt) {
    return [
      {
        id: "dstech_bank_nonpt_def",
        bankName: "Bank BCA",
        accountNumber: "6520490131",
        accountHolder: "RAMADHANI ST",
        branch: "KCU Cilegon",
        entityType: "NON_PT",
        status: "Aktif",
      },
    ];
  }

  return [
    {
      id: "dstech_bank_pt_def",
      bankName: "Bank BCA",
      accountNumber: "295-074-0321",
      accountHolder: "PT. DSTech Smart Perkasa",
      branch: "KCU Cilegon",
      entityType: "PT",
      status: "Aktif",
    },
  ];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
  const docType = (searchParams.get("doc") || "invoice").toLowerCase();
  const isReceipt = docType === "receipt" || docType === "kwitansi";
  const docNo = (searchParams.get("no") || searchParams.get("id") || "").trim();
  const receiptNo = (searchParams.get("receipt") || searchParams.get("receiptNo") || searchParams.get("payId") || "").trim();

  const data = readFinanceData();
  const generalSettings = readGeneralSettings();
  const sales: any[] = data.sales || [];
  const quotations: any[] = data.quotations || [];
  const purchases: any[] = data.purchases || [];
  const bankAccounts: any[] = data.bank_accounts || [];
  const settings: any = {
    ...generalSettings,
    ...(generalSettings.letterheadSettings || {}),
    ...(data.settings || {}),
  };
  const products: any[] = readProducts();

  // Pengaturan Kop Surat & Info Perusahaan Resmi (Prioritaskan berkas Base64 / upload user)
  const letterheadUrl =
    settings.letterheadUrl_PT ||
    settings.letterheadUrl ||
    generalSettings?.letterheadSettings?.letterheadUrl_PT ||
    generalSettings?.letterheadSettings?.letterheadUrl ||
    "/kop_surat_dstech.jpg";
  const letterheadEnabled = settings.letterheadEnabled !== false;
  const masterStampUrl = settings.masterStampUrl || "";
  const defaultBank = bankAccounts.find((b) => b.isDefault) || bankAccounts[0] || {
    bankName: "BCA (Bank Central Asia)",
    accountNumber: "8691-888-299",
    accountHolder: "PT. DSTECH SMART PERKASA",
    branch: "KCP Sudirman"
  };

  // -------------------------------------------------------------
  // DOKUMEN TIPE SPH / QUOTATION (SURAT PENAWARAN HARGA)
  // -------------------------------------------------------------
  if (docType === "sph" || docType === "quotation") {
    const sph = quotations.find((q) => {
      if (!docNo) return false;
      if (q.quotationNumber && q.quotationNumber.toLowerCase() === docNo.toLowerCase()) return true;
      if (q.id && q.id.toLowerCase() === docNo.toLowerCase()) return true;
      return false;
    }) || quotations[0];

    if (!sph) {
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <title>SPH Tidak Ditemukan - DSTech Smart</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans">
          <div class="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-200 space-y-4">
            <div class="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">⚠️</div>
            <h1 class="text-xl font-black text-slate-900">Surat Penawaran Tidak Ditemukan</h1>
            <p class="text-xs text-slate-500 leading-relaxed">
              Nomor SPH <strong>"${docNo || "-"}"</strong> tidak ditemukan dalam sistem kami.
            </p>
            <div class="pt-2">
              <a href="https://dstechsmart.com" class="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 transition">
                Kembali ke Beranda
              </a>
            </div>
          </div>
        </body>
        </html>
      `;
      return new NextResponse(errorHtml, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    const docPin = getDocPin(sph);
    const pinInput = (searchParams.get("pin") || searchParams.get("password") || searchParams.get("pass") || "").trim();
    if (!verifyDocPin(sph, pinInput)) {
      return renderSecurityLockScreen({
        docType: "sph",
        docNo: sph.quotationNumber || docNo || "SPH",
        docTitle: "Surat Penawaran Harga (SPH)",
        recipientName: sph.customerOrg || sph.customerName || "Klien Terhormat",
        docDate: sph.date || "-",
        hasError: Boolean(pinInput),
      });
    }

    const signerName = sph.approvedBy || settings.signerName || "RAMADHANI ST";
    const signerTitle = sph.approvedTitle || settings.signerTitle || "Direktur";
    const signatureImage = sph.signatureImage || settings.masterSignatureUrl || "";
    const terbilangRupiah = angkaKeTerbilang(sph.grandTotal) + " Rupiah";

    // Lengkapi foto/gambar item produk dari katalog
    const itemsWithImages = (sph.items || []).map((it: any) => {
      let img = it.image || it.imageUrl || "";
      let desc = it.description || it.desc || "";
      if (!img || !desc) {
        const matched = products.find((p: any) => {
          if (it.productId && p.id === it.productId) return true;
          if (p.name && it.productName && p.name.trim().toLowerCase() === it.productName.trim().toLowerCase()) return true;
          return false;
        });
        if (matched) {
          if (!img && matched.image) img = matched.image;
          if (!desc && matched.desc) desc = matched.desc;
        }
      }
      return {
        ...it,
        image: img || "/portfolio-residential.png",
        description: desc || "Perangkat teknologi keamanan & infrastruktur IT berkualitas prima dengan jaminan garansi resmi PT. DSTech Smart Perkasa."
      };
    });

    // Paginasi Cerdas Lampiran SPH (Auto-Fit Ukuran Kertas A4):
    // Jika total item <= 18: muat seluruhnya di Halaman 2 bersama kotak rekapitulasi nilai tanpa pecah halaman.
    // Jika total item > 18:
    // - Halaman reguler (tanpa rekap) memuat hingga 22 item agar mengisi lembar A4 secara proporsional ke atas.
    // - Halaman terakhir (dengan rekap nilai) memuat hingga 18 item.
    // - Auto-balancing: jika sisa item 19-26 item, dibagi merata dua lembar agar halaman terakhir tidak jomplang/kosong.
    const itemChunks: any[][] = [];
    if (itemsWithImages.length > 0) {
      const total = itemsWithImages.length;
      if (total <= 18) {
        itemChunks.push(itemsWithImages);
      } else {
        let remaining = [...itemsWithImages];
        while (remaining.length > 0) {
          if (remaining.length <= 18) {
            itemChunks.push(remaining);
            break;
          }
          if (remaining.length <= 26) {
            const half = Math.ceil(remaining.length / 2);
            itemChunks.push(remaining.slice(0, half));
            itemChunks.push(remaining.slice(half));
            break;
          }
          itemChunks.push(remaining.slice(0, 22));
          remaining = remaining.slice(22);
        }
      }
    }

    const documentTitle = `Surat Penawaran Harga - ${sph.quotationNumber}`;

    const sphHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${documentTitle} - PT. DSTech Smart Perkasa</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <style>
          @page { size: A4 portrait; margin: 0; }
          @media print {
            html, body {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 210mm !important;
            }
            .print-hidden { display: none !important; }
            .print-sheet {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              width: 210mm !important;
              min-height: 296mm !important;
              max-height: 297mm !important;
              height: auto !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: always !important;
              break-after: page !important;
            }
            .print-sheet.print-last-sheet,
            .print-sheet:last-of-type {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
          .letterhead-bg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: fill;
            pointer-events: none;
            user-select: none;
            z-index: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body class="bg-slate-100 text-slate-900 font-sans min-h-screen py-4 sm:py-8 px-2 sm:px-4">
        
        <!-- Action Toolbar -->
        <div class="max-w-[210mm] mx-auto mb-4 bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex flex-wrap items-center justify-between gap-3 print-hidden">
          <div class="flex items-center gap-3">
            <a href="/" class="shrink-0 transition-transform hover:scale-105 block" title="PT. DSTech Smart Perkasa">
              <img src="/logo.png" alt="PT. DSTech Smart Perkasa" class="h-10 w-auto object-contain max-w-[150px]" />
            </a>
            <div>
              <h1 class="font-black text-sm sm:text-base text-slate-900">${documentTitle}</h1>
              <p class="text-[11px] text-slate-500">PT. DSTech Smart Perkasa • Surat Penawaran Harga Resmi</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Kop Surat Resmi Terkunci Permanen untuk Klien -->
            <input type="hidden" id="toggle-letterhead" value="1" checked />

            ${sph.clientSignatureImage ? `
              <div class="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                <span>✓ SPH Telah Disetujui Klien (${sph.clientSignerName || sph.customerName})</span>
              </div>
            ` : `
              <button
                type="button"
                onclick="openClientSignModal()"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer animate-pulse"
              >
                <span>✍️ Setujui &amp; Tanda Tangani Penawaran</span>
              </button>
            `}

            <button
              type="button"
              onclick="downloadAsPdf()"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <span>⬇️ Unduh PDF SPH</span>
            </button>
            <button
              type="button"
              onclick="window.print()"
              class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <span>🖨️ Cetak (Print)</span>
            </button>
          </div>
        </div>
        
        <!-- SCROLL CONTAINER MOBILE DI LUAR TARGET PDF -->
        <div class="w-full overflow-x-auto pb-8">
          <!-- ELEMEN TARGET HTML2PDF YANG BERSIH DARI OVERFLOW CLIPPING -->
          <div id="sph-full-document" class="mx-auto" style="width: 210mm; min-width: 210mm;">
            <!-- LEMBAR 1: SURAT PENGANTAR PENAWARAN HARGA -->
        <div
          id="print-sheet-sph"
          class="print-sheet print-page-break relative bg-white shadow-2xl border border-slate-300 mx-auto overflow-hidden text-slate-800 mb-8"
          style="width: 210mm; height: 297mm; max-height: 297mm; box-sizing: border-box; page-break-after: always; break-after: page;"
        >
          <!-- Background Kop Surat -->
          <img
            id="letterhead-bg-sph-1"
            src="${letterheadUrl}"
            alt="Kop Surat"
            class="letterhead-bg absolute inset-0 w-full h-full pointer-events-none select-none z-0"
            style="object-fit: fill; object-position: top center; width: 100%; height: 100%; display: ${letterheadEnabled ? 'block' : 'none'}; opacity: 1; -webkit-print-color-adjust: exact; print-color-adjust: exact;"
          />

          <div
            class="content-wrapper relative z-10 space-y-2.5"
            style="padding-top: ${letterheadEnabled ? '80px' : '24px'}; padding-bottom: ${letterheadEnabled ? '75px' : '24px'}; padding-left: 45px; padding-right: 45px;"
          >
            <!-- Kop Surat Perusahaan DSTech -->
            <div class="flex justify-between items-start border-b-2 border-slate-900 pb-3">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="text-xl font-black text-red-600 tracking-tight">
                    ${sph.businessEntity === "NON_PT" ? "DSTECH SMART" : "PT. DSTECH SMART PERKASA"}
                  </span>
                </div>
                <p class="text-[10.5px] font-bold text-slate-600">
                  Solusi Security System, CCTV AI, Barrier Gate, IoT &amp; IT Infrastructure
                </p>
                <p class="text-[9.5px] text-slate-500 leading-snug max-w-md">
                  Perum Bukit Cilegon Asri Blok DB No. 19, Kel. Bagendung, Kec. Cilegon, Kota Cilegon - Banten
                  <br />
                  ${sph.businessEntity === "NON_PT" ? `<span>Usaha Mandiri Non-PKP (Bebas PPN 0%)</span>` : `<strong>NIB: 1909220127034</strong> | <strong>NPWP: 60.648.216.4-102.000</strong>`}
                  <br />
                  WhatsApp: 0822-5949-4242 | 0822-7225-6903 | Email: cs@dstechsmart.com | https://dstechsmart.com
                </p>
              </div>

              <div class="text-right space-y-1">
                <span class="px-2.5 py-0.5 rounded bg-indigo-900 text-white font-black text-[11px] uppercase tracking-wider inline-block">
                  SURAT PENAWARAN HARGA (SPH)
                </span>
                <p class="font-mono font-black text-sm text-indigo-700">
                  ${sph.quotationNumber} ${sph.revision ? `- Rev. 0${sph.revision}` : ''}
                </p>
                <p class="text-[10.5px] text-slate-500 font-medium">
                  Tanggal: ${sph.date}
                </p>
                <p class="text-[10.5px] text-slate-700 font-bold">
                  Masa Berlaku: s/d ${sph.validUntil || '-'}
                </p>
              </div>
            </div>

            <!-- Nomor, Lampiran, Perihal & Info Penerima -->
            <div class="grid grid-cols-2 gap-4 text-xs pt-1">
              <div class="space-y-0.5">
                <table class="text-xs">
                  <tbody>
                    <tr>
                      <td class="pr-2 font-bold text-slate-500">Nomor</td>
                      <td class="pr-2">:</td>
                      <td class="font-mono font-bold text-slate-900">${sph.quotationNumber}</td>
                    </tr>
                    <tr>
                      <td class="pr-2 font-bold text-slate-500">Lampiran</td>
                      <td class="pr-2">:</td>
                      <td class="text-slate-800">1 (Satu) Berkas Penawaran Harga</td>
                    </tr>
                    <tr>
                      <td class="pr-2 font-bold text-slate-500">Perihal</td>
                      <td class="pr-2">:</td>
                      <td class="font-bold text-indigo-900">${sph.subject || 'Pengadaan &amp; Instalasi Sistem Teknologi Keamanan'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="text-right bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 text-xs">
                <p class="text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Kepada Yth:</p>
                <p class="font-black text-slate-900 text-xs mt-0.5">${sph.customerName}</p>
                ${sph.customerOrg && sph.customerOrg !== sph.customerName ? `<p class="font-bold text-slate-700 text-[11px]">${sph.customerOrg}</p>` : ''}
                <p class="text-slate-600 text-[10px] mt-0.5">${sph.customerPhone || '-'}</p>
                <p class="text-slate-500 text-[9.5px]">${sph.customerAddress || 'Lokasi Klien'}</p>
              </div>
            </div>

            <!-- Paragraf Pembuka Resmi -->
            <div class="text-[11px] leading-relaxed text-slate-700 space-y-1 border-t border-slate-100 pt-2">
              <p class="font-bold text-slate-900">Dengan hormat,</p>
              <p>
                Sehubungan dengan rencana pengadaan dan kebutuhan sistem pengamanan / teknologi informasi pada instansi Bapak/Ibu, bersama surat ini kami PT. DSTech Smart Perkasa bermaksud mengajukan penawaran harga pengadaan unit perangkat, material pendukung, serta jasa instalasi teknis dengan rincian spesifikasi sebagai berikut:
              </p>
            </div>

            <!-- Referensi Resmi ke Lampiran Halaman 2 -->
            <div class="p-2.5 rounded-xl bg-purple-50/90 border border-purple-300 text-xs text-purple-950 flex items-center justify-between gap-3 shadow-xs">
              <div>
                <p class="font-black text-slate-900">Rincian Perangkat, Material &amp; Jasa Teknis:</p>
                <p class="text-[10.5px] text-purple-800">
                  Rincian spesifikasi teknis lengkap, kuantiti, dan harga satuan unit tercantum pada <strong>Lampiran Halaman 2</strong> surat penawaran ini (${itemsWithImages.length} item penawaran).
                </p>
              </div>
              <span class="px-2 py-0.5 rounded-lg bg-purple-200/90 text-purple-900 font-mono font-black text-[10px] shrink-0">
                ${itemsWithImages.length} ITEM
              </span>
            </div>

            <!-- Rincian Perhitungan & Terbilang -->
            <div class="flex flex-col sm:flex-row justify-between gap-3 pt-1 text-xs">
              <!-- Kotak Terbilang & Rekening Bank -->
              <div class="space-y-2 max-w-sm flex-1">
                <div class="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[10.5px]">
                  <span class="font-bold text-amber-900 uppercase text-[9.5px] block mb-0.5">Terbilang:</span>
                  <p class="font-serif italic font-bold text-slate-800">
                    "${terbilangRupiah}"
                  </p>
                </div>

                <div class="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-[10.5px] space-y-0.5">
                  <p class="font-bold text-blue-900">Rekening Resmi Pembayaran ${sph.businessEntity === "NON_PT" ? "DSTech Smart" : "PT. DSTech Smart Perkasa"}:</p>
                  ${getFilteredBankAccounts(bankAccounts, sph.businessEntity).map((acc: any) => `
                    <p class="text-slate-700 text-[9.5px]">
                      • <strong>${acc.bankName}</strong>: ${acc.accountNumber} a/n ${acc.accountHolder} (${acc.branch || 'KCU Cilegon'})
                    </p>
                  `).join("")}
                </div>
              </div>

              <!-- Summary Totals -->
              <div class="space-y-1 sm:w-72 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 text-xs">
                <div class="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>Subtotal Barang &amp; Jasa:</span>
                  <span class="font-bold text-slate-900">${formatRupiah(sph.subtotal)}</span>
                </div>
                ${sph.discount && sph.discount > 0 ? `
                  <div class="flex items-center justify-between text-red-600 text-[11px]">
                    <span>${sph.discountLabel || 'Diskon Khusus Negosiasi'}:</span>
                    <span class="font-bold">- ${formatRupiah(sph.discount)}</span>
                  </div>
                  <div class="flex items-center justify-between text-slate-600 text-[10px] pt-0.5 border-t border-dashed border-slate-200">
                    <span>DPP / Netto Kesepakatan:</span>
                    <span class="font-bold text-slate-900">
                      ${formatRupiah(Math.max(0, sph.subtotal - sph.discount))}
                    </span>
                  </div>
                ` : ''}
                <div class="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>PPN (${sph.taxRate === 11.12 ? '12%' : `${sph.taxRate || 11}%`}):</span>
                  <span class="font-bold text-slate-900">${formatRupiah(sph.taxAmount)}</span>
                </div>
                <div class="border-t-2 border-indigo-950 pt-1.5 flex items-center justify-between font-black text-slate-900">
                  <span class="text-indigo-900 text-xs">TOTAL PENAWARAN:</span>
                  <span class="text-sm text-emerald-600">${formatRupiah(sph.grandTotal)}</span>
                </div>
              </div>
            </div>

            <!-- Syarat & Ketentuan Teknis Penawaran -->
            ${sph.terms ? `
              <div class="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200 text-xs space-y-1">
                <h5 class="font-black text-slate-900 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Syarat &amp; Ketentuan Teknis (Terms &amp; Conditions):</span>
                </h5>
                <div class="text-[9.5px] text-slate-600 whitespace-pre-line leading-relaxed font-sans">
                  ${sph.terms}
                </div>
              </div>
            ` : ''}

            <!-- Penutup Surat -->
            <div class="text-[10.5px] leading-relaxed text-slate-700">
              <p>
                Demikian surat penawaran harga ini kami sampaikan. Besar harapan kami agar usulan solusi teknologi ini dapat memenuhi ekspektasi dan menjadi awal kerjasama yang baik antara PT. DSTech Smart Perkasa dengan ${sph.customerOrg || sph.customerName}. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
              </p>
            </div>

            <!-- Tanda Tangan Dual Approval (Klien & Direktur DSTech) -->
            <div class="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-xs">
              <!-- Sisi Kiri: Penerima / Klien -->
              <div class="flex flex-col justify-between h-28 border border-slate-200/80 rounded-xl p-2 bg-white/70 shadow-sm text-center">
                <div>
                  <p class="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Disetujui &amp; Diterima Oleh,</p>
                  <p class="text-[11px] font-black text-slate-900 mt-0.5">
                    ${sph.customerOrg || sph.customerName}
                  </p>
                </div>

                <div class="h-8 flex items-center justify-center text-slate-300 text-[8.5px] italic relative">
                  ${sph.clientSignatureImage ? `
                    <img src="${sph.clientSignatureImage}" alt="Tanda Tangan Klien" class="max-h-8 max-w-[120px] object-contain relative z-10" />
                    <span class="absolute bottom-0 text-[6.5px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-300">✓ Disetujui Digital</span>
                  ` : `
                    <button type="button" onclick="openClientSignModal()" class="print-hidden px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[9px] font-black shadow-2xs transition-all cursor-pointer flex items-center gap-1">
                      <span>✍️ Tanda Tangani Online</span>
                    </button>
                    <span class="hidden print:inline text-slate-300 text-[8.5px] italic">(Tanda Tangan, Nama Jelas &amp; Stempel Klien)</span>
                  `}
                </div>

                <div class="pt-1 border-t border-slate-300">
                  <p class="font-bold text-slate-900 text-[11px]">
                    ${sph.clientSignerName ? `( ${sph.clientSignerName} )` : sph.customerName ? `( ${sph.customerName} )` : "( ................................................................ )"}
                  </p>
                  <p class="text-[8.5px] text-slate-500">
                    ${sph.clientSignerTitle || "PIC / Purchasing / Manajer Terkait"}
                  </p>
                </div>
              </div>

              <!-- Sisi Kanan: Hormat Kami -->
              <div class="flex flex-col justify-between h-28 border border-slate-200/80 rounded-xl p-2 bg-white/70 shadow-sm text-center">
                <div>
                  <p class="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Hormat Kami,</p>
                  <p class="text-[11px] font-black text-indigo-700 mt-0.5">
                    ${sph.businessEntity === "NON_PT" ? "DSTech Smart" : "PT. DSTech Smart Perkasa"}
                  </p>
                </div>

                <div class="h-8 relative flex items-center justify-center">
                  <!-- Stempel Bulat Digital Resmi -->
                  <div class="print-stamp-circle absolute right-1 w-10 h-10 rounded-full border-2 border-dashed border-indigo-600/50 flex flex-col items-center justify-center text-[5.5px] text-indigo-700 font-bold uppercase rotate-[-12deg] pointer-events-none bg-indigo-50/40">
                    <span class="font-black text-[5px]">PT. DSTECH</span>
                    <span class="text-[4px] tracking-tight">SMART PERKASA</span>
                    <span class="text-[3.5px] text-emerald-600 font-mono font-black mt-0.5">OFFICIAL SPH</span>
                  </div>

                  ${signatureImage ? `
                    <img src="${signatureImage}" alt="Tanda Tangan" class="max-h-8 max-w-[120px] object-contain relative z-10" />
                  ` : `
                    <div class="font-serif italic text-sm text-slate-800 font-black relative z-10 tracking-wider">
                      ${signerName}
                    </div>
                  `}
                </div>

                <div class="pt-1 border-t border-slate-300">
                  <p class="font-black text-slate-900 text-[11px] underline">( ${signerName} )</p>
                  <p class="text-[8.5px] text-slate-500">${signerTitle}</p>
                </div>
              </div>
            </div>

            <!-- Klausul Legalitas Keabsahan Tanda Tangan Digital Resmi -->
            <div class="mt-2 p-1.5 rounded-lg bg-slate-50/90 border border-slate-200/70 text-center">
              <p class="text-[7.5px] text-slate-500 leading-tight">
                <span class="font-bold text-slate-700">Keterangan Legalitas:</span> Dokumen ini diterbitkan secara elektronik dan ditandatangani secara digital melalui sistem informasi PT DSTech Smart Perkasa. Sesuai ketentuan UU ITE No. 11 Thn 2008 Pasal 11 &amp; PP No. 71 Thn 2019, tanda tangan digital ini sah, mengikat, dan memiliki kekuatan hukum resmi tanpa memerlukan stempel basah.
              </p>
            </div>
          </div>
        </div>

        <!-- LEMBAR LAMPIRAN TABEL RINCIAN ITEM PENAWARAN (DIPAGINASI PER LEMBAR A4 RESMI) -->
        ${itemsWithImages.length > 0 ? itemChunks.map((chunk, chunkIdx) => {
          const isLastChunk = chunkIdx === itemChunks.length - 1;
          return `
          <!-- PEMISAH HALAMAN RESMI HTML2PDF UNTUK LAMPIRAN HALAMAN ${chunkIdx + 2} -->
          <div class="html2pdf__page-break" style="page-break-before: always; break-before: page; height: 0; margin: 0; padding: 0;"></div>
          <div
            class="print-sheet relative bg-white shadow-2xl border border-slate-300 mx-auto overflow-hidden text-slate-800 mb-8 ${isLastChunk ? 'print-last-sheet' : 'print-page-break'}"
            style="width: 210mm; height: 297mm; max-height: 297mm; box-sizing: border-box; page-break-after: ${isLastChunk ? 'avoid' : 'always'}; break-after: ${isLastChunk ? 'avoid' : 'page'};"
          >
            <!-- Background Kop Surat Resmi DSTech -->
            <img
              src="${letterheadUrl}"
              alt="Kop Surat"
              class="letterhead-bg absolute inset-0 w-full h-full pointer-events-none select-none z-0"
              style="object-fit: fill; object-position: top center; width: 100%; height: 100%; display: ${letterheadEnabled ? 'block' : 'none'}; opacity: 1; -webkit-print-color-adjust: exact; print-color-adjust: exact;"
            />

            <div
              class="content-wrapper relative z-10 space-y-3"
              style="padding-top: ${letterheadEnabled ? '80px' : '24px'}; padding-bottom: ${letterheadEnabled ? '75px' : '24px'}; padding-left: 45px; padding-right: 45px;"
            >
              <div class="flex justify-between items-start pb-2 border-b-2 border-indigo-950">
                <div>
                  <span class="text-xs font-black uppercase tracking-widest text-indigo-700 block">
                    LAMPIRAN SURAT PENAWARAN HARGA (SPH)
                  </span>
                  <h3 class="text-base font-black text-slate-900 mt-0.5">
                    Rincian Item Perangkat, Material &amp; Jasa Instalasi
                  </h3>
                  <p class="text-[11px] text-slate-600 font-bold">PT. DSTECH SMART PERKASA</p>
                </div>
                <div class="text-right text-xs space-y-0.5">
                  <p class="font-mono font-black text-indigo-700">Lampiran No: ${sph.quotationNumber}</p>
                  <p class="text-slate-500 text-[11px]">Tanggal: ${sph.date}</p>
                  <p class="text-slate-700 font-bold text-[11px]">Halaman: ${chunkIdx + 2} dari ${itemChunks.length + 1}</p>
                </div>
              </div>

              <!-- Tabel Rincian Item Penawaran dengan Gambar Produk -->
              <table class="w-full text-xs border border-slate-300">
                <thead class="bg-indigo-950 text-white font-bold text-[9px] uppercase tracking-wider">
                  <tr>
                    <th class="border border-slate-300 p-1 text-center w-8">No</th>
                    <th class="border border-slate-300 p-1 text-center w-12">Gambar</th>
                    <th class="border border-slate-300 p-1.5 text-left">Deskripsi Produk / Jasa &amp; Spesifikasi Teknis</th>
                    <th class="border border-slate-300 p-1 text-center w-12">Qty</th>
                    <th class="border border-slate-300 p-1 text-center w-14">Satuan</th>
                    <th class="border border-slate-300 p-1 text-right w-28">Harga Satuan (Rp)</th>
                    <th class="border border-slate-300 p-1 text-right w-28">Total (Rp)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  ${chunk.map((item: any, cIdx: number) => {
                    let itemOffset = 0;
                    for (let ci = 0; ci < chunkIdx; ci++) {
                      itemOffset += itemChunks[ci].length;
                    }
                    const globalIdx = itemOffset + cIdx + 1;
                    return `
                    <tr class="hover:bg-slate-50/50">
                      <td class="border border-slate-300 p-1 text-center font-bold text-slate-500 text-[10px]">${globalIdx}</td>
                      <td class="border border-slate-300 p-1 text-center w-12">
                        <div style="width: 26px; height: 26px; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden; padding: 1px;">
                          <img src="${item.image || '/portfolio-residential.png'}" alt="${item.productName || item.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='/portfolio-residential.png'" />
                        </div>
                      </td>
                      <td class="border border-slate-300 p-1.5">
                        <div class="font-bold text-slate-900 text-[10px] leading-tight">${item.productName || item.name}</div>
                        ${item.description ? `<div class="text-[8.5px] text-slate-500 mt-0.5 leading-none line-clamp-1">${item.description}</div>` : ''}
                      </td>
                      <td class="border border-slate-300 p-1 text-center font-bold text-[10px]">${item.qty}</td>
                      <td class="border border-slate-300 p-1 text-center text-slate-600 text-[9.5px]">${item.unit || 'Unit'}</td>
                      <td class="border border-slate-300 p-1 text-right font-medium text-[10px]">${Number(item.price) > 0 ? formatRupiah(item.price) : '<span style="color:#64748b; font-style:italic; font-size:9px;">Termasuk Paket</span>'}</td>
                      <td class="border border-slate-300 p-1 text-right font-black text-slate-900 text-[10px]">${Number(item.total || item.qty * item.price) > 0 ? formatRupiah(item.total || item.qty * item.price) : '<span style="color:#059669; font-weight:bold; font-size:9px;">Include</span>'}</td>
                    </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>

              <!-- Rekapitulasi Nilai & Catatan Pengesahan Lampiran (HANYA MUNCUL DI LEMBAR TERAKHIR) -->
              ${isLastChunk ? `
              <div class="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2 text-xs">
                <div class="text-[9.5px] text-slate-500 space-y-1 max-w-sm">
                  <p class="font-bold text-slate-700 uppercase tracking-wider">Catatan Teknis &amp; Garansi:</p>
                  <p>Seluruh unit perangkat yang tertera dijamin 100% baru, bergaransi resmi pabrik, dan sesuai spesifikasi teknis penawaran.</p>
                </div>

                <div class="w-72 space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 ml-auto">
                  <div class="flex justify-between text-slate-600 text-[11px]">
                    <span>Subtotal Barang &amp; Jasa:</span>
                    <span class="font-bold text-slate-900">${formatRupiah(sph.subtotal)}</span>
                  </div>
                  ${sph.discount && sph.discount > 0 ? `
                  <div class="flex justify-between text-red-600 text-[11px]">
                    <span>${sph.discountLabel || "Diskon Negosiasi"}:</span>
                    <span class="font-bold">-${formatRupiah(sph.discount)}</span>
                  </div>` : ""}
                  ${sph.taxAmount && sph.taxAmount > 0 ? `
                  <div class="flex justify-between text-slate-600 text-[11px]">
                    <span>PPN (${sph.taxRate === 11.12 ? '12%' : `${sph.taxRate || 11}%`}):</span>
                    <span class="font-bold text-slate-900">${formatRupiah(sph.taxAmount)}</span>
                  </div>` : ""}
                  <div class="border-t-2 border-slate-900 pt-1 flex justify-between font-black text-xs text-slate-900">
                    <span class="text-indigo-900">TOTAL PENAWARAN:</span>
                    <span class="text-emerald-700 text-sm">${formatRupiah(sph.grandTotal)}</span>
                  </div>
                </div>
              </div>

              <!-- Paraf Pengesahan Lembar Lampiran Terakhir -->
              <div class="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-xs">
                <div class="text-center p-1.5 rounded-lg bg-slate-50/80 border border-slate-200">
                  <p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    Paraf Pemesan / Klien (${sph.customerName || "Klien"})
                  </p>
                  <div class="h-7 flex items-center justify-center text-slate-300 text-[9px] italic">
                    ${sph.clientInitialImage ? `
                      <img src="${sph.clientInitialImage}" alt="Paraf Klien" class="max-h-6 max-w-[60px] object-contain inline-block" />
                    ` : `
                      ( .................................................. )
                    `}
                  </div>
                </div>
                <div class="text-center p-1.5 rounded-lg bg-slate-50/80 border border-slate-200">
                  <p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    Paraf ${sph.businessEntity === "NON_PT" ? "DSTech Smart" : "PT. DSTech Smart Perkasa"}
                  </p>
                  <div class="h-7 flex items-center justify-center font-serif italic text-xs font-bold text-indigo-700">
                    ${sph.approvedBy || signerName || "H. Agus Supriyadi, S.T."}
                  </div>
                </div>
              </div>
              ` : `
              <!-- Paraf Pengesahan Lembar Lampiran Bersambung (Halaman 2 dan Seterusnya) -->
              <div class="space-y-2 pt-2 border-t border-slate-200">
                <div class="grid grid-cols-2 gap-4 text-xs">
                  <div class="text-center p-1.5 rounded-lg bg-slate-50/80 border border-slate-200">
                    <p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      Paraf Pemesan / Klien (${sph.customerName || "Klien"})
                    </p>
                    <div class="h-7 flex items-center justify-center text-slate-300 text-[9px] italic">
                      ${sph.clientInitialImage ? `
                        <img src="${sph.clientInitialImage}" alt="Paraf Klien" class="max-h-6 max-w-[60px] object-contain inline-block" />
                      ` : `
                        ( .................................................. )
                      `}
                    </div>
                  </div>
                  <div class="text-center p-1.5 rounded-lg bg-slate-50/80 border border-slate-200">
                    <p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      Paraf ${sph.businessEntity === "NON_PT" ? "DSTech Smart" : "PT. DSTech Smart Perkasa"}
                    </p>
                    <div class="h-7 flex items-center justify-center font-serif italic text-xs font-bold text-indigo-700">
                      ${sph.approvedBy || signerName || "H. Agus Supriyadi, S.T."}
                    </div>
                  </div>
                </div>

                <div class="flex justify-between items-center pt-1 text-[10px] text-slate-500 italic border-t border-slate-100">
                  <span>* Bersambung ke lembar lampiran berikutnya (Halaman ${chunkIdx + 3})...</span>
                  <span class="font-mono font-bold">${sph.quotationNumber}</span>
                </div>
              </div>
              `}

              <div class="pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400">
                Seluruh spesifikasi perangkat di atas terjamin keasliannya dan bergaransi resmi PT. DSTech Smart Perkasa.
              </div>
            </div>
          </div>
          `;
        }).join("") : ""}
          </div> <!-- End sph-full-document -->
        </div> <!-- End scroll container mobile -->

        <!-- Modal Persetujuan & Tanda Tangan Online Klien -->
        <div id="client-approval-modal" class="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs hidden print-hidden">
          <div class="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 class="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                  <span>✍️ Persetujuan Penawaran SPH</span>
                </h3>
                <p class="text-[11px] text-slate-500 font-mono">${sph.quotationNumber}</p>
              </div>
              <button type="button" onclick="closeClientSignModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-black cursor-pointer">✕</button>
            </div>

            <p class="text-xs text-slate-600 leading-relaxed">
              Silakan lengkapi identitas dan bubuhkan tanda tangan serta paraf digital Anda di bawah ini sebagai bukti persetujuan resmi atas Surat Penawaran Harga ini.
            </p>

            <div class="space-y-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nama Lengkap Penandatangan *</label>
                <input type="text" id="input-client-signer-name" value="${sph.customerName || ''}" placeholder="Nama lengkap Anda..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 bg-slate-50" />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Jabatan *</label>
                <input type="text" id="input-client-signer-title" value="PIC / Purchasing / Manajer Terkait" placeholder="Contoh: Purchasing Manager / Direktur..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-slate-50" />
              </div>

              <!-- Canvas 1: Tanda Tangan Utama (Halaman 1) -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-[11px] font-black text-slate-800 uppercase">1. Tanda Tangan Utama (Halaman 1) *</label>
                  <button type="button" onclick="clearSignCanvas()" class="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer">Hapus Goresan</button>
                </div>
                <div class="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-1 flex justify-center">
                  <canvas id="canvas-client-sign" width="420" height="150" class="w-full max-w-[420px] h-[150px] bg-white rounded-lg cursor-crosshair touch-none shadow-2xs"></canvas>
                </div>
                <span class="text-[9.5px] text-slate-400 italic block mt-0.5">*Goreskan tanda tangan menggunakan sentuhan jari layar HP atau mouse</span>
              </div>

              <!-- Canvas 2: Paraf Dokumen (Halaman 2 dst.) -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-[11px] font-black text-slate-800 uppercase">2. Paraf Dokumen Lampiran (Halaman 2 dst.)</label>
                  <div class="flex items-center gap-2">
                    <button type="button" onclick="copySignToInitial()" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer">Gunakan Tanda Tangan</button>
                    <button type="button" onclick="clearInitialCanvas()" class="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer">Hapus Paraf</button>
                  </div>
                </div>
                <div class="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-1 flex justify-center">
                  <canvas id="canvas-client-initial" width="300" height="100" class="w-full max-w-[300px] h-[100px] bg-white rounded-lg cursor-crosshair touch-none shadow-2xs"></canvas>
                </div>
                <span class="text-[9.5px] text-slate-400 italic block mt-0.5">*Goreskan paraf singkat untuk setiap lembar lampiran rincian penawaran</span>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Catatan Persetujuan (Opsional)</label>
                <textarea id="input-client-approval-note" rows="2" placeholder="Catatan tambahan persetujuan..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-slate-50"></textarea>
              </div>

              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 leading-tight">
                ⚖️ <strong>Keabsahan Hukum:</strong> Dengan menandatangani secara digital, Anda menyetujui seluruh klausul penawaran ini secara sah dan mengikat sesuai UU ITE No. 11 Thn 2008 Pasal 11 &amp; PP No. 71 Thn 2019.
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button type="button" onclick="closeClientSignModal()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer">Batal</button>
              <button type="button" id="btn-submit-approval" onclick="submitClientApproval()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer">
                <span>✓ Setujui &amp; Sahkan Penawaran</span>
              </button>
            </div>
          </div>
        </div>

        <script>
          let isDrawingSign = false;
          let isDrawingInit = false;
          let signHasContent = false;
          let initHasContent = false;

          function getCanvasCoords(canvas, e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
              x: (clientX - rect.left) * (canvas.width / rect.width),
              y: (clientY - rect.top) * (canvas.height / rect.height)
            };
          }

          function initCanvasEvents(canvasId, isInit) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = isInit ? 2.5 : 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            function startDraw(e) {
              e.preventDefault();
              if (isInit) isDrawingInit = true; else isDrawingSign = true;
              const pos = getCanvasCoords(canvas, e);
              ctx.beginPath();
              ctx.moveTo(pos.x, pos.y);
            }

            function draw(e) {
              const active = isInit ? isDrawingInit : isDrawingSign;
              if (!active) return;
              e.preventDefault();
              const pos = getCanvasCoords(canvas, e);
              ctx.lineTo(pos.x, pos.y);
              ctx.stroke();
              if (isInit) initHasContent = true; else signHasContent = true;
            }

            function stopDraw(e) {
              if (isInit) isDrawingInit = false; else isDrawingSign = false;
            }

            canvas.addEventListener('mousedown', startDraw);
            canvas.addEventListener('mousemove', draw);
            window.addEventListener('mouseup', stopDraw);

            canvas.addEventListener('touchstart', startDraw, { passive: false });
            canvas.addEventListener('touchmove', draw, { passive: false });
            window.addEventListener('touchend', stopDraw);
          }

          function openClientSignModal() {
            const modal = document.getElementById('client-approval-modal');
            if (modal) {
              modal.classList.remove('hidden');
              setTimeout(function() {
                initCanvasEvents('canvas-client-sign', false);
                initCanvasEvents('canvas-client-initial', true);
              }, 100);
            }
          }

          function closeClientSignModal() {
            const modal = document.getElementById('client-approval-modal');
            if (modal) modal.classList.add('hidden');
          }

          function clearSignCanvas() {
            const canvas = document.getElementById('canvas-client-sign');
            if (canvas) {
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              signHasContent = false;
            }
          }

          function clearInitialCanvas() {
            const canvas = document.getElementById('canvas-client-initial');
            if (canvas) {
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              initHasContent = false;
            }
          }

          function copySignToInitial() {
            const src = document.getElementById('canvas-client-sign');
            const dst = document.getElementById('canvas-client-initial');
            if (src && dst && signHasContent) {
              const dstCtx = dst.getContext('2d');
              dstCtx.clearRect(0, 0, dst.width, dst.height);
              dstCtx.drawImage(src, 0, 0, dst.width, dst.height);
              initHasContent = true;
            }
          }

          function submitClientApproval() {
            const name = (document.getElementById('input-client-signer-name').value || '').trim();
            const title = (document.getElementById('input-client-signer-title').value || '').trim();
            const note = (document.getElementById('input-client-approval-note').value || '').trim();
            const signCanvas = document.getElementById('canvas-client-sign');
            const initCanvas = document.getElementById('canvas-client-initial');

            if (!name) {
              alert('Silakan isi Nama Lengkap Penandatangan!');
              return;
            }
            if (!signHasContent) {
              alert('Silakan bubuhkan goresan tanda tangan Anda pada kotak tanda tangan!');
              return;
            }

            const signData = signCanvas.toDataURL('image/png');
            const initData = initHasContent ? initCanvas.toDataURL('image/png') : signData;

            const btn = document.getElementById('btn-submit-approval');
            if (btn) {
              btn.disabled = true;
              btn.innerText = 'Menyimpan Pengesahan...';
            }

            fetch('/api/finance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                actionType: 'client_approve_sph',
                id: '${sph.id || sph.quotationNumber}',
                quotationNumber: '${sph.quotationNumber}',
                clientSignerName: name,
                clientSignerTitle: title || 'PIC / Purchasing / Manajer Terkait',
                clientSignatureImage: signData,
                clientInitialImage: initData,
                clientApprovalNote: note
              })
            }).then(function(res) {
              return res.json();
            }).then(function(data) {
              if (data.success) {
                alert('🎉 Terima kasih! Surat Penawaran Harga #' + '${sph.quotationNumber}' + ' berhasil disetujui dan ditandatangani secara sah.');
                window.location.reload();
              } else {
                alert('Gagal menyimpan persetujuan: ' + (data.error || 'Terjadi kesalahan sistem'));
                if (btn) { btn.disabled = false; btn.innerText = '✓ Setujui & Sahkan Penawaran'; }
              }
            }).catch(function(err) {
              alert('Terjadi kesalahan: ' + err.message);
              if (btn) { btn.disabled = false; btn.innerText = '✓ Setujui & Sahkan Penawaran'; }
            });
          }

          function toggleLetterhead(enabled) {
            document.querySelectorAll('.letterhead-bg').forEach(function(el) {
              el.style.display = enabled ? 'block' : 'none';
            });
            document.querySelectorAll('.content-wrapper').forEach(function(el) {
              el.style.paddingTop = enabled ? '80px' : '24px';
              el.style.paddingBottom = enabled ? '75px' : '24px';
            });
          }

          function downloadAsPdf() {
            const element = document.getElementById('sph-full-document');
            if (!element) return;

            const opt = {
              margin:       0,
              filename:     '${documentTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf',
              image:        { type: 'jpeg', quality: 0.98 },
              html2canvas:  {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 1024,
                scrollX: 0,
                scrollY: 0
              },
              jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
              pagebreak:    { mode: ['css', 'legacy'], before: '.html2pdf__page-break' }
            };

            const sheets = element.querySelectorAll('.print-sheet');
            sheets.forEach(function(s) { s.classList.remove('mb-8'); });

            html2pdf().set(opt).from(element).save().then(function() {
              sheets.forEach(function(s) { s.classList.add('mb-8'); });
            }).catch(function(err) {
              console.error("html2pdf catch:", err);
              sheets.forEach(function(s) { s.classList.add('mb-8'); });
              window.print();
            });
          }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(sphHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  }

  // -------------------------------------------------------------
  // DOKUMEN TIPE PURCHASE ORDER (PO / PENGADAAN MATERIAL SUPPLIER)
  // -------------------------------------------------------------
  if (docType === "po" || docType === "purchase_order" || docType === "pembelian") {
    const po = purchases.find((p: any) => {
      if (!docNo) return false;
      if (p.poNumber && p.poNumber.toLowerCase() === docNo.toLowerCase()) return true;
      if (p.id && p.id.toLowerCase() === docNo.toLowerCase()) return true;
      return false;
    }) || purchases[0];

    if (!po) {
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <title>Purchase Order Tidak Ditemukan - DSTech Smart</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans">
          <div class="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-200 space-y-4">
            <div class="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">⚠️</div>
            <h1 class="text-xl font-black text-slate-900">Purchase Order Tidak Ditemukan</h1>
            <p class="text-xs text-slate-500 leading-relaxed">
              Nomor PO <strong>"${docNo || "-"}"</strong> tidak ditemukan dalam sistem database kami.
            </p>
            <div class="pt-2">
              <a href="https://dstechsmart.com/admin/finance" class="inline-block px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold shadow hover:bg-amber-700 transition">
                Kembali ke Menu Keuangan
              </a>
            </div>
          </div>
        </body>
        </html>
      `;
      return new NextResponse(errorHtml, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const docPin = getDocPin(po);
    const pinInput = (searchParams.get("pin") || searchParams.get("password") || searchParams.get("pass") || "").trim();
    if (!verifyDocPin(po, pinInput)) {
      return renderSecurityLockScreen({
        docType: "po",
        docNo: po.poNumber || docNo || "PO",
        docTitle: "Purchase Order (PO)",
        recipientName: po.vendorName || po.supplierName || "Vendor / Supplier Terhormat",
        docDate: po.date || "-",
        hasError: Boolean(pinInput),
      });
    }

    const signerName = po.approvedBy || settings.signerName || "RAMADHANI ST";
    const signerTitle = po.approvedTitle || settings.signerTitle || "Direktur";
    const signatureImage = po.signatureImage || settings.masterSignatureUrl || "";
    const isApproved = po.approvalStatus === "Disetujui & Sah" || po.approvalStatus === "Disetujui" || po.approvalStatus === "Approved";
    const documentTitle = `Purchase_Order_DSTECH_${po.poNumber || "PO"}_${(po.supplierName || "").replace(/[^a-zA-Z0-9]/g, "_")}`;

    const itemsHtml = (po.items || []).map((item: any, idx: number) => `
      <tr class="border-b border-slate-100 hover:bg-slate-50/50">
        <td class="p-2.5 text-center text-slate-400 font-mono text-[11px]">${idx + 1}</td>
        <td class="p-2.5">
          <div class="font-bold text-slate-900 text-xs">${item.productName || item.name || "Item Pengadaan"}</div>
          ${item.notes ? `<div class="text-[10px] text-slate-500 italic mt-0.5">${item.notes}</div>` : ""}
        </td>
        <td class="p-2.5 text-center font-bold text-slate-800 text-xs">${item.qty || 1}</td>
        <td class="p-2.5 text-center text-slate-600 text-xs">${item.unit || "Pcs"}</td>
        <td class="p-2.5 text-right font-medium text-slate-700 text-xs">${formatRupiah(item.price || 0)}</td>
        <td class="p-2.5 text-right font-bold text-slate-900 text-xs">${formatRupiah(item.total || ((item.qty || 1) * (item.price || 0)))}</td>
      </tr>
    `).join("");

    const poHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Order (PO) - ${po.poNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
          @media print {
            body {
              background: white !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
            .print-sheet {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }
          }
        </style>
      </head>
      <body class="bg-slate-100 min-h-screen p-4 sm:p-8 font-sans antialiased text-slate-800">
        
        <!-- Floating Action Toolbar (Hanya Tampil di Layar / Tidak Tercetak) -->
        <div class="no-print max-w-4xl mx-auto mb-6 bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <a href="/" class="shrink-0 bg-white px-2 py-1 rounded-xl shadow-xs border border-slate-700 transition-transform hover:scale-105 block" title="PT. DSTech Smart Perkasa">
              <img src="/logo.png" alt="PT. DSTech Smart Perkasa" class="h-8 w-auto object-contain max-w-[130px]" />
            </a>
            <div>
              <div class="font-black text-sm tracking-wide text-amber-400">Purchase Order Resmi PT. DSTech Smart Perkasa</div>
              <div class="text-[11px] text-slate-400 font-mono">Nomor: ${po.poNumber} • Vendor: ${po.supplierName || "-"}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            ${po.supplierApproved ? `
              <div class="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <span>✅ PO Dikonfirmasi Vendor (${po.supplierSignerName || "Vendor"})</span>
              </div>
            ` : `
              <button onclick="openVendorSignModal()" class="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/30 cursor-pointer transition transform hover:scale-[1.02]">
                <span>✍️ Konfirmasi &amp; Tanda Tangani PO (Vendor)</span>
              </button>
            `}
            <!-- Kop Surat Resmi Terkunci Permanen untuk Klien -->
            <input type="hidden" id="toggle-letterhead" value="1" checked />
            <button onclick="window.print()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition">
              🖨️ Cetak Lembar A4
            </button>
            <button onclick="downloadPdf()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition">
              📥 Unduh PDF
            </button>
            <a href="https://dstechsmart.com/admin/finance" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition">
              Tutup
            </a>
          </div>
        </div>

        <!-- Lembar Cetak Dokumen A4 Resmi (Purchase Order) -->
        <div
          id="po-print-sheet"
          class="print-sheet relative bg-white shadow-2xl border border-slate-300 mx-auto overflow-hidden text-slate-800 mb-8"
          style="width: 210mm; min-height: 297mm; max-width: 100%; box-sizing: border-box;"
        >
          <!-- Background Kop Surat Resmi DSTech -->
          <img
            id="letterhead-bg-po"
            src="${letterheadUrl}"
            alt="Kop Surat Resmi"
            class="letterhead-bg absolute inset-0 w-full h-full pointer-events-none select-none z-0"
            style="object-fit: fill; object-position: top center; width: 100%; height: 100%; display: ${letterheadEnabled ? 'block' : 'none'}; opacity: 1; -webkit-print-color-adjust: exact; print-color-adjust: exact;"
          />

          <!-- Area Isi Dokumen dengan Padding Dinamis -->
          <div
            id="po-content-wrapper"
            class="relative z-10 space-y-5"
            style="padding-top: ${letterheadEnabled ? '135px' : '30px'}; padding-bottom: ${letterheadEnabled ? '90px' : '30px'}; padding-left: 42px; padding-right: 42px;"
          >
            <!-- Bar Judul PO saat Kop Surat Bergambar Aktif -->
            <div id="po-title-bar" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-900 pb-3" style="display: ${letterheadEnabled ? 'flex' : 'none'};">
              <div>
                <span class="px-3.5 py-1 rounded-md bg-amber-800 text-white font-black text-xs uppercase tracking-wider inline-block">
                  PURCHASE ORDER (PO)
                </span>
                <p class="font-mono font-black text-lg text-amber-800 mt-1">${po.poNumber}</p>
              </div>
              <div class="text-left sm:text-right text-xs">
                <p class="text-slate-500">Tanggal Order: <span class="font-bold text-slate-800">${po.date}</span></p>
                <p class="text-slate-700">Est. Tiba: <span class="font-bold text-amber-800">${po.expectedDelivery || "-"}</span></p>
              </div>
            </div>

            <!-- Kop Surat Teks Manual (Tampil jika Kop Bergambar Dimatikan) -->
            <div id="po-text-header" class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-5" style="display: ${letterheadEnabled ? 'none' : 'flex'};">
              <div class="space-y-1">
                <div class="text-2xl font-black text-red-600 tracking-tight">PT. DSTECH SMART PERKASA</div>
                <p class="text-xs font-bold text-slate-700">Solusi Security System, CCTV AI, Barrier Gate, IoT & IT Infrastructure</p>
                <p class="text-[10px] text-slate-500 leading-relaxed max-w-md">
                  Perum Bukit Cilegon Asri Blok DB No. 19, Kel. Bagendung, Kec. Cilegon, Kota Cilegon - Banten<br>
                  <strong>NIB: 1909220127034</strong> | <strong>NPWP: 60.648.216.4-102.000</strong><br>
                  WhatsApp: 0822-5949-4242 | 0822-7225-6903 | Email: cs@dstechsmart.com | https://dstechsmart.com
                </p>
              </div>
              <div class="text-left sm:text-right space-y-1">
                <span class="px-3.5 py-1.5 rounded-md bg-amber-800 text-white font-black text-xs uppercase tracking-wider inline-block">
                  PURCHASE ORDER (PO)
                </span>
                <p class="font-mono font-black text-base text-amber-700 mt-1">${po.poNumber}</p>
                <p class="text-xs text-slate-500">Tanggal Order: <span class="font-bold text-slate-800">${po.date}</span></p>
                <p class="text-xs text-slate-700">Est. Tiba: <span class="font-bold text-amber-800">${po.expectedDelivery || "-"}</span></p>
              </div>
            </div>

            <!-- Informasi Vendor & Tempat Pengiriman -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-1.5">
                <p class="text-[10px] font-black text-amber-800 uppercase tracking-wider">DITUJUKAN KEPADA (VENDOR / SUPPLIER):</p>
                <p class="font-black text-slate-900 text-sm">${po.supplierName}</p>
                <p class="text-slate-600 text-[11px]">Kontak Sales: <span class="font-bold">${po.supplierContact || "-"}</span></p>
                <p class="text-[11px] text-slate-700">
                  Status Pembayaran: <span class="font-bold text-amber-800">${po.paymentStatus || "Belum Lunas"}</span>
                </p>
              </div>

              <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-wider">ALAMAT PENERIMAAN PENGIRIMAN BARANG:</p>
                <p class="font-black text-slate-900 text-sm">Gudang Utama PT. DSTech Smart Perkasa</p>
                <p class="text-slate-600 text-[11px]">Perum Bukit Cilegon Asri Blok DB No. 19, Cilegon - Banten</p>
                <p class="text-[11px] text-slate-600">PIC Logistik Gudang: <strong>Staff Gudang DSTech (0822-5949-4242)</strong></p>
              </div>
            </div>

            <!-- Tabel Rincian Barang PO -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead class="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th class="p-2.5 text-center w-10">No</th>
                    <th class="p-2.5">Deskripsi Barang / Spesifikasi Teknis</th>
                    <th class="p-2.5 text-center w-20">Qty</th>
                    <th class="p-2.5 text-center w-20">Satuan</th>
                    <th class="p-2.5 text-right w-36">Harga Satuan (Rp)</th>
                    <th class="p-2.5 text-right w-36">Total (Rp)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Ringkasan Keuangan & Catatan PO -->
            <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div class="sm:max-w-md w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <span class="font-bold text-slate-700 block text-[11px]">Catatan / Instruksi Pengiriman:</span>
                <p class="text-slate-600 text-[11px] whitespace-pre-line leading-relaxed">
                  ${po.notes || "Kirim barang sesuai jadwal yang telah disepakati dan sertakan Surat Jalan serta Faktur Pajak/Kwitansi resmi."}
                </p>
                <div class="pt-2 border-t border-slate-200/80">
                  <span class="text-[10px] text-slate-400 block font-bold">Terbilang:</span>
                  <span class="text-[11px] font-bold text-slate-800 italic">
                    # ${angkaKeTerbilang(po.grandTotal || 0)} Rupiah #
                  </span>
                </div>
              </div>

              <div class="w-full sm:w-72 space-y-1.5 text-xs">
                <div class="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                  <span>Subtotal Belanja:</span>
                  <span class="font-bold text-slate-900">${formatRupiah(po.subtotal || 0)}</span>
                </div>
                <div class="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                  <span>PPN Masukan (${(po.taxRate ?? 12) === 11.12 ? "12% (11/12)" : `${po.taxRate ?? 12}%`}):</span>
                  <span class="font-bold text-slate-900">${formatRupiah(po.taxAmount || 0)}</span>
                </div>
                ${po.shippingCost ? `
                <div class="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                  <span>Ongkos Kirim:</span>
                  <span class="font-bold text-slate-900">${formatRupiah(po.shippingCost)}</span>
                </div>` : ""}
                ${po.discount ? `
                <div class="flex justify-between py-1 text-red-600 border-b border-slate-100">
                  <span>Diskon Supplier:</span>
                  <span class="font-bold">-${formatRupiah(po.discount)}</span>
                </div>` : ""}
                <div class="flex justify-between py-2 text-sm font-black text-slate-900 border-t-2 border-slate-900">
                  <span class="text-amber-800">TOTAL BELANJA PO:</span>
                  <span class="text-emerald-700">${formatRupiah(po.grandTotal || 0)}</span>
                </div>
              </div>
            </div>

            <!-- Syarat & Ketentuan PO Resmi -->
            <div class="text-[10px] leading-relaxed text-slate-500 border-t border-slate-200 pt-3 space-y-0.5">
              <p class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Syarat & Ketentuan Purchase Order (PO):
              </p>
              <p>1. Barang yang dikirim harus 100% baru (Brand New in Box), original dan bergaransi resmi dari distributor/pabrik.</p>
              <p>2. Setiap pengiriman wajib melampirkan Surat Jalan dan mencantumkan Nomor PO resmi ini: <strong>${po.poNumber}</strong>.</p>
              <p>3. Pemeriksaan fisik dan Quality Control (QC) dilakukan saat barang tiba di gudang PT. DSTech Smart Perkasa.</p>
              <p>4. Pembayaran akan diproses sesuai kesepakatan (${po.paymentStatus || "Sesuai Termin"}) setelah barang dan dokumen penagihan lengkap diterima.</p>
            </div>

            <!-- Tanda Tangan Dual Approval (Vendor & Direktur DSTech) -->
            <div class="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
              <!-- Sisi Kiri: Vendor / Supplier -->
              <div class="flex flex-col justify-between h-36 border border-slate-200/80 rounded-xl p-3 bg-white shadow-xs text-center">
                <div>
                  <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dikonfirmasi &amp; Diterima Oleh,</p>
                  <p class="text-xs font-black text-slate-900 mt-0.5">${po.supplierName}</p>
                </div>
                <div class="h-12 flex items-center justify-center text-slate-300 text-[9px] italic relative">
                  ${po.supplierSignatureImage ? `
                    <img src="${po.supplierSignatureImage}" alt="Tanda Tangan Vendor" class="max-h-12 max-w-[130px] object-contain relative z-10" />
                    <span class="absolute bottom-0 text-[6.5px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-300">✓ Terverifikasi Digital</span>
                  ` : `
                    <button type="button" onclick="openVendorSignModal()" class="print-hidden px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[9.5px] font-black shadow-2xs transition-all cursor-pointer flex items-center gap-1">
                      <span>✍️ Tanda Tangani Online</span>
                    </button>
                    <span class="hidden print:inline text-slate-300 text-[9px] italic">(Tanda Tangan &amp; Stempel Vendor)</span>
                  `}
                </div>
                <div class="pt-1 border-t border-slate-200">
                  <p class="font-bold text-slate-900 text-xs">
                    ${po.supplierSignerName ? `( ${po.supplierSignerName} )` : po.supplierContact ? `( ${po.supplierContact.split("(")[0].trim()} )` : "( ................................................ )"}
                  </p>
                  <p class="text-[9px] text-slate-500">
                    ${po.supplierSignerTitle || "Sales / PIC Vendor"}
                    ${po.supplierApprovedAt ? `<span class="block text-[8px] text-emerald-700 font-mono mt-0.5 font-bold">Dikonfirmasi: ${po.supplierApprovedAt}</span>` : ""}
                  </p>
                </div>
              </div>

              <!-- Sisi Kanan: Pemesan Resmi PT. DSTech Smart Perkasa -->
              <div class="flex flex-col justify-between h-36 border border-slate-200/80 rounded-xl p-3 bg-white shadow-xs text-center relative overflow-hidden">
                <div>
                  <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pemesan Resmi,</p>
                  <p class="text-xs font-black text-amber-800 mt-0.5">PT. DSTech Smart Perkasa</p>
                </div>
                <div class="h-12 relative flex items-center justify-center">
                  ${isApproved ? `
                    <div class="absolute right-2 w-12 h-12 rounded-full border-2 border-dashed border-amber-600/50 flex flex-col items-center justify-center text-[6px] text-amber-800 font-bold uppercase rotate-[-12deg] pointer-events-none bg-amber-50/40">
                      <span class="font-black text-[5.5px]">PT. DSTECH</span>
                      <span class="text-[4.5px] tracking-tight">SMART PERKASA</span>
                      <span class="text-[4px] text-emerald-600 font-mono font-black mt-0.5">OFFICIAL PO</span>
                    </div>
                    ${signatureImage ? `
                      <img src="${signatureImage}" alt="Tanda Tangan" class="max-h-12 max-w-[130px] object-contain relative z-10" />
                    ` : `
                      <div class="font-serif italic text-base text-slate-800 font-black relative z-10 tracking-wider">
                        ${signerName}
                      </div>
                    `}
                  ` : `
                    <div class="text-[10px] text-amber-700 font-bold italic bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                      ⏳ Dalam Proses / Menunggu Pengesahan
                    </div>
                  `}
                </div>
                <div class="pt-1 border-t border-slate-200">
                  <p class="font-bold text-slate-900 text-xs">( ${signerName} )</p>
                  <p class="text-[9px] text-slate-500">${signerTitle}</p>
                </div>
              </div>
            </div>

            <!-- Klausul Legalitas Keabsahan Tanda Tangan Digital Resmi -->
            <div class="mt-2 p-1.5 rounded-lg bg-slate-50/90 border border-slate-200/70 text-center">
              <p class="text-[7.5px] text-slate-500 leading-tight">
                <span class="font-bold text-slate-700">Keterangan Legalitas:</span> Dokumen Purchase Order ini diterbitkan secara elektronik dan ditandatangani secara digital melalui sistem informasi PT DSTech Smart Perkasa. Sesuai ketentuan UU ITE No. 11 Thn 2008 Pasal 11 &amp; PP No. 71 Thn 2019, tanda tangan digital ini sah, mengikat, dan memiliki kekuatan hukum resmi tanpa memerlukan stempel basah.
              </p>
            </div>
          </div> <!-- End po-content-wrapper -->
        </div> <!-- End po-print-sheet -->

        <!-- Modal Konfirmasi & Tanda Tangan Online Vendor / Supplier -->
        <div id="vendor-approval-modal" class="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs hidden print-hidden">
          <div class="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 class="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                  <span>✍️ Konfirmasi &amp; Tanda Tangan PO (Vendor)</span>
                </h3>
                <p class="text-[11px] text-slate-500 font-mono">${po.poNumber} • ${po.supplierName}</p>
              </div>
              <button type="button" onclick="closeVendorSignModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-black cursor-pointer">✕</button>
            </div>

            <p class="text-xs text-slate-600 leading-relaxed">
              Silakan bubuhkan tanda tangan digital perwakilan Vendor/Supplier di bawah ini sebagai bukti konfirmasi penerimaan dan kesiapan pemrosesan pesanan Purchase Order resmi dari <strong>PT. DSTech Smart Perkasa</strong>.
            </p>

            <div class="space-y-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nama Lengkap PIC / Sales Vendor *</label>
                <input type="text" id="input-vendor-signer-name" value="${po.supplierContact ? po.supplierContact.split("(")[0].trim() : ''}" placeholder="Nama lengkap Anda..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 bg-slate-50" />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Jabatan *</label>
                <input type="text" id="input-vendor-signer-title" value="Sales / PIC Rekanan Vendor" placeholder="Contoh: Sales Executive / Branch Manager..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 bg-slate-50" />
              </div>

              <!-- Canvas: Tanda Tangan Digital Vendor -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-[11px] font-black text-slate-800 uppercase">Tanda Tangan Digital Vendor *</label>
                  <button type="button" onclick="clearVendorSignCanvas()" class="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer">Hapus Goresan</button>
                </div>
                <div class="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-1 flex justify-center">
                  <canvas id="canvas-vendor-sign" width="420" height="150" class="w-full max-w-[420px] h-[150px] bg-white rounded-lg cursor-crosshair touch-none shadow-2xs"></canvas>
                </div>
                <span class="text-[9.5px] text-slate-400 italic block mt-0.5">*Goreskan tanda tangan menggunakan sentuhan jari layar smartphone atau mouse</span>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Catatan Kesiapan Pengiriman / Nomor Resi (Opsional)</label>
                <textarea id="input-vendor-note" rows="2" placeholder="Contoh: Barang siap dikirim besok melalui armada ekspedisi..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 bg-slate-50"></textarea>
              </div>

              <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-tight">
                ⚖️ <strong>Keabsahan Hukum:</strong> Konfirmasi digital ini sah dan mengikat sesuai ketentuan UU ITE No. 11 Thn 2008 Pasal 11 &amp; PP No. 71 Thn 2019 sebagai bukti persetujuan order barang.
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button type="button" onclick="closeVendorSignModal()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer">Batal</button>
              <button type="button" id="btn-submit-vendor-po" onclick="submitVendorPoApproval()" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer">
                <span>✓ Konfirmasi &amp; Sahkan PO Sekarang</span>
              </button>
            </div>
          </div>
        </div>

        <script>
          let isDrawingVendorSign = false;
          let vendorSignHasContent = false;

          function getVendorCanvasCoords(canvas, e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
              x: (clientX - rect.left) * (canvas.width / rect.width),
              y: (clientY - rect.top) * (canvas.height / rect.height)
            };
          }

          function initVendorCanvas(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            function startDraw(e) {
              e.preventDefault();
              isDrawingVendorSign = true;
              const coords = getVendorCanvasCoords(canvas, e);
              ctx.beginPath();
              ctx.moveTo(coords.x, coords.y);
            }

            function draw(e) {
              if (!isDrawingVendorSign) return;
              e.preventDefault();
              const coords = getVendorCanvasCoords(canvas, e);
              ctx.lineTo(coords.x, coords.y);
              ctx.stroke();
              vendorSignHasContent = true;
            }

            function stopDraw(e) {
              if (isDrawingVendorSign) {
                e.preventDefault();
                ctx.closePath();
                isDrawingVendorSign = false;
              }
            }

            canvas.addEventListener('mousedown', startDraw);
            canvas.addEventListener('mousemove', draw);
            window.addEventListener('mouseup', stopDraw);

            canvas.addEventListener('touchstart', startDraw, { passive: false });
            canvas.addEventListener('touchmove', draw, { passive: false });
            window.addEventListener('touchend', stopDraw, { passive: false });
          }

          function openVendorSignModal() {
            const modal = document.getElementById('vendor-approval-modal');
            if (modal) {
              modal.classList.remove('hidden');
              setTimeout(() => {
                initVendorCanvas('canvas-vendor-sign');
              }, 100);
            }
          }

          function closeVendorSignModal() {
            const modal = document.getElementById('vendor-approval-modal');
            if (modal) modal.classList.add('hidden');
          }

          function clearVendorSignCanvas() {
            const canvas = document.getElementById('canvas-vendor-sign');
            if (canvas) {
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              vendorSignHasContent = false;
            }
          }

          async function submitVendorPoApproval() {
            const signerName = document.getElementById('input-vendor-signer-name')?.value.trim();
            const signerTitle = document.getElementById('input-vendor-signer-title')?.value.trim();
            const supplierNote = document.getElementById('input-vendor-note')?.value.trim();
            const canvasSign = document.getElementById('canvas-vendor-sign');

            if (!signerName) {
              alert('Mohon isi nama lengkap perwakilan penandatangan Vendor!');
              return;
            }

            if (!vendorSignHasContent || !canvasSign) {
              alert('Mohon goreskan tanda tangan digital Vendor terlebih dahulu!');
              return;
            }

            const signatureImage = canvasSign.toDataURL('image/png');
            const submitBtn = document.getElementById('btn-submit-vendor-po');
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.innerHTML = 'Memproses Persetujuan PO...';
            }

            try {
              const res = await fetch('/api/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  actionType: 'supplier_approve_po',
                  payload: {
                    poNumber: '${po.poNumber}',
                    id: '${po.id || ""}',
                    supplierSignerName: signerName,
                    supplierSignerTitle: signerTitle,
                    supplierSignatureImage: signatureImage,
                    supplierNote: supplierNote
                  }
                })
              });

              const result = await res.json();
              if (result.success) {
                alert('Persetujuan Berhasil! Purchase Order telah resmi dikonfirmasi dan ditandatangani.');
                window.location.reload();
              } else {
                alert('Gagal menyimpan persetujuan: ' + (result.error || 'Terjadi kesalahan sistem'));
                if (submitBtn) {
                  submitBtn.disabled = false;
                  submitBtn.innerHTML = '✓ Konfirmasi & Sahkan PO Sekarang';
                }
              }
            } catch (err) {
              alert('Terjadi kendala jaringan: ' + err.message);
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '✓ Konfirmasi & Sahkan PO Sekarang';
              }
            }
          }
          function toggleLetterhead(enabled) {
            const bgImg = document.getElementById('letterhead-bg-po');
            const wrapper = document.getElementById('po-content-wrapper');
            const textHeader = document.getElementById('po-text-header');
            const titleBar = document.getElementById('po-title-bar');
            if (enabled) {
              if (bgImg) bgImg.style.display = 'block';
              if (wrapper) {
                wrapper.style.paddingTop = '135px';
                wrapper.style.paddingBottom = '90px';
              }
              if (textHeader) textHeader.style.display = 'none';
              if (titleBar) titleBar.style.display = 'flex';
            } else {
              if (bgImg) bgImg.style.display = 'none';
              if (wrapper) {
                wrapper.style.paddingTop = '30px';
                wrapper.style.paddingBottom = '30px';
              }
              if (textHeader) textHeader.style.display = 'flex';
              if (titleBar) titleBar.style.display = 'none';
            }
          }

          function downloadPdf() {
            const element = document.getElementById('po-print-sheet');
            const opt = {
              margin:       0,
              filename:     '${documentTitle}.pdf',
              image:        { type: 'jpeg', quality: 0.95 },
              html2canvas:  { scale: 2, useCORS: true },
              jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
          }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(poHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  }

  // -------------------------------------------------------------
  // DOKUMEN TIPE FAKTUR / BAST / SURAT JALAN / FOTO PEKERJAAN
  // -------------------------------------------------------------
  const sale = sales.find((s) => {
    if (!docNo) return false;
    if (s.invoiceNumber && s.invoiceNumber.toLowerCase() === docNo.toLowerCase()) return true;
    if (s.id && s.id.toLowerCase() === docNo.toLowerCase()) return true;
    return false;
  }) || sales[0]; // fallback jika demo

  if (!sale) {
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Dokumen Tidak Ditemukan - DSTech Smart</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans">
        <div class="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-200 space-y-4">
          <div class="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">⚠️</div>
          <h1 class="text-xl font-black text-slate-900">Dokumen Tidak Ditemukan</h1>
          <p class="text-xs text-slate-500 leading-relaxed">
            Nomor dokumen <strong>"${docNo || "-"}"</strong> tidak ditemukan dalam sistem kami.
          </p>
          <div class="pt-2">
            <a href="https://dstechsmart.com" class="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 transition">
              Kembali ke Beranda DSTech
            </a>
          </div>
        </div>
      </body>
      </html>
    `;
    return new NextResponse(errorHtml, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const docPin = getDocPin(sale);
  const pinInput = (searchParams.get("pin") || searchParams.get("password") || searchParams.get("pass") || "").trim();
  if (!verifyDocPin(sale, pinInput)) {
    let friendlyTitle = "Faktur Penjualan (Invoice)";
    if (docType === "bast") friendlyTitle = "Berita Acara Serah Terima (BAST)";
    else if (docType === "delivery" || docType === "do") friendlyTitle = "Surat Jalan Material (Delivery Order)";
    else if (docType === "receipt" || docType === "kwitansi") friendlyTitle = "Kuitansi Pembayaran Sah";
    else if (docType === "photos") friendlyTitle = "Laporan Dokumentasi Foto Pekerjaan";

    return renderSecurityLockScreen({
      docType,
      docNo: sale.invoiceNumber || docNo || "INV",
      docTitle: friendlyTitle,
      recipientName: sale.customerOrg || sale.customerName || "Klien Terhormat",
      docDate: sale.date || "-",
      hasError: Boolean(pinInput),
      receiptNo,
    });
  }

  const signerName = sale.approvedBy || settings.signerName || "RAMADHANI ST";
  const signerTitle = sale.approvedTitle || settings.signerTitle || "Direktur";
  const signatureImage = sale.signatureImage || settings.masterSignatureUrl || "";

  // Navigasi Tab Dokumen Terkait
  const encNo = encodeURIComponent(sale.invoiceNumber);
  const tabs = [
    { id: "invoice", label: "📄 Faktur Penjualan", active: docType === "invoice" },
    { id: "receipt", label: "🧾 Kuitansi Pembayaran", active: docType === "receipt" || docType === "kwitansi" },
    { id: "bast", label: "📝 Berita Acara (BAST)", active: docType === "bast" },
    { id: "delivery", label: "🚚 Surat Jalan", active: docType === "delivery" },
    { id: "photos", label: "📸 Dokumentasi Foto", active: docType === "photos" },
  ];

  // Render Dokumen Sesuai Permintaan
  let documentContent = "";
  let documentTitle = `Faktur Penjualan - ${sale.invoiceNumber}`;

  if (docType === "receipt" || docType === "kwitansi") {
    const payments: any[] = Array.isArray(sale.payments) ? sale.payments : [];
    let selectedPayment = payments.find((p: any) => p.receiptNumber === receiptNo || p.id === receiptNo);
    if (!selectedPayment && payments.length > 0) {
      selectedPayment = payments[payments.length - 1];
    }

    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const invDateObj = sale.date ? new Date(sale.date) : new Date();
    const romanMonth = romanMonths[invDateObj.getMonth()] || "X";
    const curYear = invDateObj.getFullYear();
    const invClean = sale.invoiceNumber ? sale.invoiceNumber.replace(/^INV-/, "").replace(/[^a-zA-Z0-9]/g, "") : "001";
    const fallbackReceiptNo = `KW/DSP/${romanMonth}/${curYear}/${invClean}`;

    const receiptNumberDisplay = selectedPayment?.receiptNumber || fallbackReceiptNo;
    const paidNominal = Number(selectedPayment?.amount || (sale.paidAmount > 0 ? sale.paidAmount : (sale.invoiceType === "DP" ? sale.dpAmount : sale.grandTotal)) || 0);
    const receiptDateDisplay = selectedPayment?.paymentDate || sale.date || new Date().toISOString().split("T")[0];
    const receiptMethodDisplay = selectedPayment?.paymentMethod || sale.paymentMethod || defaultBank.bankName;
    const isFullPaid = sale.paymentStatus === "Lunas" || sale.remainingAmount === 0;
    const isDpPhase = sale.invoiceType === "DP" && !isFullPaid;

    const receiptPurpose = selectedPayment?.notes || (
      isDpPhase
        ? `Pembayaran Uang Muka (DP ${sale.dpPercentage || 50}%) atas Faktur ${sale.invoiceNumber} - Pengadaan & Instalasi IT / Security System`
        : isFullPaid
        ? `Pelunasan Pembayaran Penuh atas Faktur ${sale.invoiceNumber} - Pengadaan & Instalasi IT / Security System`
        : `Pembayaran Angsuran / Termin atas Faktur ${sale.invoiceNumber}`
    );

    const terbilangReceipt = angkaKeTerbilang(paidNominal) + " Rupiah";
    documentTitle = `Kuitansi_Pembayaran_${receiptNumberDisplay.replace(/[^a-zA-Z0-9_-]/g, "_")}_${(sale.customerName || "").replace(/[^a-zA-Z0-9]/g, "_")}`;

    documentContent = `
      <!-- LEMBAR KUITANSI PEMBAYARAN RESMI DSTECH (FULL BLEED TEPI-KE-TEPI) -->
      <div id="receipt-main-container" class="receipt-box text-slate-800 text-[10px] leading-tight select-none relative font-sans w-full">
        <!-- Watermark DSP Latar Belakang Kuitansi -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] z-0">
          <div class="text-7xl font-black font-serif tracking-widest text-slate-900 rotate-[-15deg]">DSTECH</div>
        </div>

        <div class="relative z-10 flex flex-col justify-between min-h-[115mm]">
          <div>
            <!-- Kop Gambar Resmi DSTech Smart (Full Bleed Tepi-ke-Tepi Penuh Selebar Kertas A4) -->
            <div id="receipt-letterhead-image-box" class="w-full relative select-none" style="display: ${letterheadEnabled ? 'block' : 'none'};">
              <div class="w-full overflow-hidden relative bg-white" style="height: 125px;">
                <img
                  src="${letterheadUrl}"
                  alt="Kop Surat Resmi DSTech"
                  class="w-full select-none pointer-events-none absolute top-0 left-0"
                  style="width: 100%; height: auto; display: block; -webkit-print-color-adjust: exact; print-color-adjust: exact;"
                />
              </div>
              <div class="flex items-center justify-between px-6 py-1 bg-slate-50 border-b border-slate-300">
                <div class="text-[8.5px] font-mono text-slate-500 font-bold tracking-wider">
                  BUKTI PENERIMAAN PEMBAYARAN RESMI
                </div>
                <div class="flex items-center gap-2">
                  <h2 class="text-xs font-black text-slate-950 tracking-wider uppercase font-serif">KUITANSI PEMBAYARAN</h2>
                  <span class="px-1.5 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider ${
                    isFullPaid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }">
                    ${isFullPaid ? '✓ LUNAS' : 'UANG MUKA / TERMIN'}
                  </span>
                  <span class="text-[9.5px] font-mono font-bold text-indigo-700">NO: ${receiptNumberDisplay}</span>
                </div>
              </div>
            </div>

            <!-- Header Bar: Kop Ringkas Teks Bawaan (Tampil jika Kop Gambar Dimatikan) -->
            <div id="receipt-letterhead-text-box" class="px-6 pt-3 pb-1.5 border-b-2 border-slate-900 flex justify-between items-start gap-2" style="display: ${letterheadEnabled ? 'none' : 'flex'};">
              <div class="flex items-center gap-2.5">
                <img src="/logo.png" alt="PT. DSTech Smart Perkasa" class="h-8 w-auto object-contain shrink-0" />
                <div>
                  <h3 class="text-[11px] font-black tracking-wide text-slate-950 uppercase leading-none">PT. DSTECH SMART PERKASA</h3>
                  <p class="text-[8px] text-slate-500 mt-0.5 leading-none">Solusi Teknologi, Jaringan &amp; Keamanan • Cilegon, Banten</p>
                </div>
              </div>
              <div class="text-right shrink-0">
                <div class="flex items-center justify-end gap-1.5">
                  <h2 class="text-xs font-black text-slate-950 tracking-wider uppercase font-serif">KUITANSI PEMBAYARAN</h2>
                  <span class="px-1.5 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider ${
                    isFullPaid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }">
                    ${isFullPaid ? '✓ LUNAS' : 'UANG MUKA / TERMIN'}
                  </span>
                </div>
                <p class="text-[9.5px] font-mono font-bold text-indigo-700 mt-0.5 leading-none">NO: ${receiptNumberDisplay}</p>
              </div>
            </div>

            <!-- Area Isi Formulir Kuitansi (Dengan Padding Horizontal Nyaman px-6) -->
            <div class="px-6 py-2 space-y-1.5">
              <!-- Pilihan Riwayat Kuitansi jika ada lebih dari 1 pembayaran (Khusus Layar Saja) -->
              ${payments.length > 1 ? `
                <div class="p-1 rounded-lg bg-slate-100 border border-slate-200 flex flex-wrap items-center gap-1 text-[9px] print:hidden">
                  <span class="font-bold text-slate-700">Pilih Pembayaran:</span>
                  ${payments.map((p: any, idx: number) => `
                    <a
                      href="/api/finance/print?doc=receipt&no=${encNo}&receiptNo=${encodeURIComponent(p.receiptNumber || p.id)}&pin=${docPin}"
                      class="px-1.5 py-0.5 rounded text-[8.5px] font-bold transition-all ${
                        (selectedPayment?.id === p.id || selectedPayment?.receiptNumber === p.receiptNumber)
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }"
                    >
                      #${idx + 1}: ${p.receiptNumber} (${formatRupiah(p.amount)})
                    </a>
                  `).join("")}
                </div>
              ` : ''}

              <!-- Formulir Isi Kuitansi -->
              <div class="space-y-1">
                <!-- Baris 1: Telah Diterima Dari -->
                <div class="grid grid-cols-12 gap-1 items-baseline border-b border-slate-200/80 pb-0.5">
                  <div class="col-span-3 text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                    Telah Diterima Dari
                  </div>
                  <div class="col-span-9 flex items-baseline justify-between gap-1">
                    <div class="truncate">
                      <span class="font-black text-slate-950 text-[10.5px]">${sale.customerName}</span>
                      ${sale.customerPic ? `<span class="text-[8.5px] text-indigo-700 font-bold ml-1">(Up. ${sale.customerPic})</span>` : ''}
                    </div>
                    <div class="text-[8px] text-slate-500 font-medium whitespace-nowrap shrink-0">
                      Tgl: <strong class="text-slate-900">${receiptDateDisplay}</strong>
                    </div>
                  </div>
                </div>

                <!-- Baris 2: Uang Sejumlah (Terbilang Huruf) -->
                <div class="grid grid-cols-12 gap-1 items-center border-b border-slate-200/80 pb-0.5">
                  <div class="col-span-3 text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                    Uang Sejumlah
                  </div>
                  <div class="col-span-9">
                    <div class="py-0.5 px-2 rounded bg-slate-50 border border-slate-300 text-slate-900 font-serif italic font-bold text-[8.5px] leading-snug">
                      # ${terbilangReceipt} #
                    </div>
                  </div>
                </div>

                <!-- Baris 3: Untuk Pembayaran -->
                <div class="grid grid-cols-12 gap-1 items-baseline border-b border-slate-200/80 pb-0.5">
                  <div class="col-span-3 text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                    Untuk Pembayaran
                  </div>
                  <div class="col-span-9">
                    <p class="font-bold text-slate-900 text-[9.5px] leading-tight line-clamp-2">${receiptPurpose}</p>
                    <div class="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[7.5px] text-slate-500 mt-0.5">
                      <span>Faktur: <strong class="text-indigo-900 font-mono">${sale.invoiceNumber}</strong></span>
                      <span>Total Tagihan: <strong>${formatRupiah(sale.grandTotal)}</strong></span>
                      ${sale.remainingAmount > 0 
                        ? `<span>Sisa: <strong class="text-amber-700">${formatRupiah(sale.remainingAmount)}</strong></span>` 
                        : `<span>Status: <strong class="text-emerald-700">LUNAS</strong></span>`}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bagian Nominal & Tanda Tangan Sah -->
              <div class="grid grid-cols-12 gap-2 pt-0.5 items-end">
                <!-- Kotak Jumlah Nominal Angka -->
                <div class="col-span-7 space-y-0.5">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border-2 border-slate-900 shadow-2xs">
                    <span class="text-[8px] text-slate-600 font-black tracking-widest uppercase">JUMLAH:</span>
                    <span class="text-sm font-black font-mono text-slate-950 tracking-tight">
                      ${formatRupiah(paidNominal)},-
                    </span>
                  </div>
                  <p class="text-[7.5px] text-slate-500 leading-none">
                    • Metode: <strong class="text-slate-700">${receiptMethodDisplay}</strong> • Verifikasi: <span class="font-mono">${sale.verificationCode || 'DSP-VERIFIED'}</span> • ERP DSP
                  </p>
                </div>

                <!-- Tanda Tangan Sah Penerima -->
                <div class="col-span-5 text-center">
                  <p class="text-[8px] text-slate-500 leading-none">Cilegon, ${receiptDateDisplay}</p>
                  <p class="font-black text-slate-950 text-[8.5px] leading-none mt-0.5">PT. DSTECH SMART PERKASA</p>
                  <div class="h-8 flex items-center justify-center relative my-0.5">
                    ${signatureImage ? `<img src="${signatureImage}" alt="Tanda Tangan" class="h-8 object-contain z-10" />` : ""}
                    ${masterStampUrl ? `<img src="${masterStampUrl}" alt="Cap Resmi" class="h-8 opacity-75 absolute" />` : ""}
                    ${!signatureImage && !masterStampUrl ? `<div class="h-5 w-20 border-b border-dashed border-slate-400"></div>` : ""}
                  </div>
                  <p class="font-black text-slate-950 text-[8.5px] underline leading-none">( ${signerName} )</p>
                  <p class="text-[7.5px] text-slate-500 font-bold leading-none mt-0.5">${signerTitle}</p>
                </div>
              </div>

              <!-- Klausul Legalitas Kuitansi -->
              <p class="text-[6.5px] text-slate-400 italic text-center pt-1 border-t border-slate-200/60 leading-none">
                *Kuitansi digital ini diterbitkan secara elektronik dan sah mengikat secara hukum sesuai UU ITE No. 11/2008 Pasal 11 tanpa memerlukan stempel basah.
              </p>
            </div>
          </div>

          <!-- Footer Gambar Resmi DSTech Smart (Full Bleed Tepi-ke-Tepi Penuh Selebar Kertas A4) -->
          <div id="receipt-letterhead-footer-box" class="w-full relative mt-2 select-none" style="display: ${letterheadEnabled ? 'block' : 'none'};">
            <div class="w-full overflow-hidden relative bg-white" style="height: 54px;">
              <img
                src="${letterheadUrl}"
                alt="Footer Kop Surat Resmi DSTech"
                class="w-full select-none pointer-events-none absolute bottom-0 left-0"
                style="width: 100%; height: auto; display: block; -webkit-print-color-adjust: exact; print-color-adjust: exact;"
              />
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (docType === "bast") {
    documentTitle = `BAST - ${sale.invoiceNumber}`;
    documentContent = `
      <!-- LEMBAR BAST -->
      <div class="text-center pb-4 border-b border-slate-300">
        <h2 class="text-lg font-black tracking-widest text-slate-900 uppercase">BERITA ACARA SERAH TERIMA PEKERJAAN</h2>
        <p class="text-xs font-bold text-slate-600 tracking-wider">Nomor: BAST/DST/${sale.invoiceNumber}</p>
        <p class="text-[11px] text-slate-500 mt-0.5">Lampiran Faktur: ${sale.invoiceNumber}</p>
      </div>

      <div class="py-4 space-y-4 text-xs leading-relaxed text-slate-700">
        <p>Pada hari ini, tanggal <strong>${sale.date}</strong>, telah dilaksanakan serah terima pekerjaan pengadaan dan instalasi perangkat teknologi keamanan &amp; infrastruktur IT dengan rincian pihak-pihak terkait sebagai berikut:</p>
        
        <div class="grid grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
          <div>
            <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">PIHAK PERTAMA (Pelaksana):</span>
            <p class="font-black text-slate-900 mt-0.5">PT. DSTECH SMART PERKASA</p>
            <p class="text-slate-600 text-[11px]">Solusi Security System &amp; IT Infrastructure</p>
            <p class="text-[10px] text-slate-500 mt-1">PIC: ${sale.salesPerson || "Tim Teknis DSTech"}</p>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">PIHAK KEDUA (Penerima):</span>
            <p class="font-black text-slate-900 mt-0.5">${sale.customerName}</p>
            <p class="text-slate-600 text-[11px]">${sale.customerAddress || "Lokasi Klien"}</p>
            <p class="text-[10px] text-slate-500 mt-1">Telp: ${sale.customerPhone || "-"}</p>
          </div>
        </div>

        <p>PIHAK PERTAMA telah menyerahkan seluruh barang/pekerjaan yang tercantum dalam Faktur No. <strong>${sale.invoiceNumber}</strong> kepada PIHAK KEDUA dalam kondisi baik, lengkap, berfungsi normal, dan telah lolos uji coba operasional (User Acceptance Test) sebagai berikut:</p>

        <table class="w-full text-xs border border-slate-300 mt-2">
          <thead class="bg-slate-100 font-bold text-slate-800">
            <tr>
              <th class="border border-slate-300 p-2 text-center w-10">No</th>
              <th class="border border-slate-300 p-2 text-left">Deskripsi Barang / Jasa Instalasi</th>
              <th class="border border-slate-300 p-2 text-center w-16">Qty</th>
              <th class="border border-slate-300 p-2 text-center w-20">Satuan</th>
              <th class="border border-slate-300 p-2 text-center w-28">Kondisi Fisik</th>
            </tr>
          </thead>
          <tbody>
            ${(sale.items || []).map((item: any, idx: number) => `
              <tr>
                <td class="border border-slate-300 p-2 text-center">${idx + 1}</td>
                <td class="border border-slate-300 p-2 font-semibold text-slate-900">${item.productName || item.name}</td>
                <td class="border border-slate-300 p-2 text-center font-bold">${item.qty}</td>
                <td class="border border-slate-300 p-2 text-center">${item.unit || "Unit"}</td>
                <td class="border border-slate-300 p-2 text-center font-bold text-emerald-600">✓ Berfungsi Baik</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <p class="text-[10px] text-slate-500 italic mt-1">
          Catatan: Dengan ditandatanganinya Berita Acara ini, maka masa garansi teknis resmi DSTech Smart mulai berlaku terhitung sejak tanggal serah terima di atas.
        </p>

        <!-- Tanda Tangan BAST -->
        <div class="grid grid-cols-2 gap-8 pt-6 mt-6 border-t border-slate-200 text-center">
          <div>
            <span class="text-xs text-slate-500 block mb-1">PIHAK KEDUA (Penerima):</span>
            <span class="font-bold text-slate-800 block">${sale.customerName}</span>
            <div class="h-24 flex items-center justify-center border-b border-dashed border-slate-300 relative">
              ${sale.bastSignatureImage ? `
                <img src="${sale.bastSignatureImage}" alt="Tanda Tangan Klien" class="h-20 object-contain z-10" />
                <span class="absolute bottom-1 right-2 text-[7px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-300">✓ Terverifikasi Digital</span>
              ` : `
                <button type="button" onclick="openDocApprovalModal('bast')" class="print-hidden px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1">
                  <span>✍️ Tanda Tangani Online</span>
                </button>
                <span class="hidden print:inline text-[10px] text-slate-300 italic">( Tanda Tangan &amp; Cap Klien )</span>
              `}
            </div>
            <p class="font-black text-slate-900 text-xs mt-2 underline">
              ${sale.bastSignerName ? `( ${sale.bastSignerName} )` : "( .................................................... )"}
            </p>
            <p class="text-[10px] text-slate-500">
              ${sale.bastSignerTitle || "Penanggung Jawab / PIC Klien"}
              ${sale.bastApprovedAt ? `<span class="block text-[8px] text-emerald-700 font-mono mt-0.5 font-bold">Disetujui: ${sale.bastApprovedAt}</span>` : ""}
            </p>
          </div>
          <div>
            <span class="text-xs text-slate-500 block mb-1">PIHAK PERTAMA (Pelaksana):</span>
            <span class="font-bold text-slate-800 block">PT. DSTECH SMART PERKASA</span>
            <div class="h-24 flex items-center justify-center border-b border-dashed border-slate-300 relative">
              ${signatureImage ? `<img src="${signatureImage}" alt="Tanda Tangan" class="h-20 object-contain z-10" />` : ""}
              ${masterStampUrl ? `<img src="${masterStampUrl}" alt="Cap Resmi" class="h-20 opacity-80 absolute" />` : ""}
            </div>
            <p class="font-black text-slate-900 text-xs mt-2 underline">( ${signerName} )</p>
            <p class="text-[10px] text-slate-500">${signerTitle}</p>
          </div>
        </div>

        <!-- Klausul Legalitas BAST -->
        <div class="mt-3 p-1.5 rounded-lg bg-slate-50/90 border border-slate-200/70 text-center">
          <p class="text-[7.5px] text-slate-500 leading-tight">
            <span class="font-bold text-slate-700">Keterangan Legalitas:</span> Berita Acara ini diterbitkan secara elektronik dan ditandatangani secara digital. Sesuai ketentuan UU ITE No. 11 Thn 2008 Pasal 11 &amp; PP No. 71 Thn 2019, tanda tangan digital ini sah, mengikat, dan memiliki kekuatan hukum resmi tanpa memerlukan stempel basah.
          </p>
        </div>
      </div>
    `;
  } else if (docType === "delivery") {
    documentTitle = `Surat Jalan - ${sale.invoiceNumber}`;
    documentContent = `
      <!-- LEMBAR SURAT JALAN (DELIVERY ORDER) -->
      <div class="text-center pb-4 border-b border-slate-300">
        <h2 class="text-lg font-black tracking-widest text-slate-900 uppercase">SURAT JALAN / DELIVERY ORDER</h2>
        <p class="text-xs font-bold text-slate-600 tracking-wider">Nomor: SJ/DST/${sale.invoiceNumber}</p>
        <p class="text-[11px] text-slate-500 mt-0.5">Ref Faktur: ${sale.invoiceNumber}</p>
      </div>

      <div class="py-4 space-y-4 text-xs leading-relaxed text-slate-700">
        <div class="grid grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
          <div>
            <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">KIRIM DARI:</span>
            <p class="font-black text-slate-900 mt-0.5">Gudang Logistik PT. DSTech Smart Perkasa</p>
            <p class="text-slate-600 text-[11px]">Kota Cilegon - Banten</p>
            <p class="text-[10px] text-slate-500 mt-1">Petugas: ${sale.salesPerson || "Admin Logistik"}</p>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">KIRIM KEPADA (Penerima):</span>
            <p class="font-black text-slate-900 mt-0.5">${sale.customerName}</p>
            <p class="text-slate-600 text-[11px]">${sale.customerAddress || "Lokasi Pengiriman Klien"}</p>
            <p class="text-[10px] text-slate-500 mt-1">No. Kontak: ${sale.customerPhone || "-"}</p>
          </div>
        </div>

        <p class="text-xs text-slate-600">Mohon diterima barang-barang berikut dalam kondisi baik dan tersegel:</p>

        <table class="w-full text-xs border border-slate-300 mt-2">
          <thead class="bg-slate-100 font-bold text-slate-800">
            <tr>
              <th class="border border-slate-300 p-2 text-center w-10">No</th>
              <th class="border border-slate-300 p-2 text-left">Nama / Jenis Barang</th>
              <th class="border border-slate-300 p-2 text-center w-20">Kuantitas</th>
              <th class="border border-slate-300 p-2 text-center w-20">Satuan</th>
              <th class="border border-slate-300 p-2 text-left">Keterangan / Status</th>
            </tr>
          </thead>
          <tbody>
            ${(sale.items || []).map((item: any, idx: number) => `
              <tr>
                <td class="border border-slate-300 p-2 text-center">${idx + 1}</td>
                <td class="border border-slate-300 p-2 font-semibold text-slate-900">${item.productName || item.name}</td>
                <td class="border border-slate-300 p-2 text-center font-bold text-indigo-700">${item.qty}</td>
                <td class="border border-slate-300 p-2 text-center">${item.unit || "Unit"}</td>
                <td class="border border-slate-300 p-2 text-slate-500">Sesuai Pesanan</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <!-- 3 Tanda Tangan Surat Jalan -->
        <div class="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-200 text-center">
          <div>
            <span class="text-[11px] text-slate-500 block mb-1">Gudang / Pengirim:</span>
            <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300">
              <span class="text-[9px] text-slate-400 italic">Petugas Gudang</span>
            </div>
            <p class="font-bold text-slate-900 text-[11px] mt-1.5 underline">( ${sale.salesPerson || "Staf Logistik"} )</p>
          </div>
          <div>
            <span class="text-[11px] text-slate-500 block mb-1">Pengemudi / Ekspedisi:</span>
            <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300 relative">
              ${sale.driverSignatureImage ? `
                <img src="${sale.driverSignatureImage}" alt="Tanda Tangan Supir" class="h-16 object-contain z-10" />
                <span class="absolute bottom-1 right-2 text-[6.5px] text-blue-700 font-bold bg-blue-50 px-1 rounded border border-blue-300">✓ Supir / Ekspedisi</span>
              ` : `
                <button type="button" onclick="openDocApprovalModal('driver')" class="print-hidden px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-lg text-[10px] font-black shadow-2xs transition cursor-pointer flex items-center gap-1">
                  <span>✍️ Tanda Tangani Supir</span>
                </button>
                <span class="hidden print:inline text-[9px] text-slate-400 italic">Supir / Ekspedisi</span>
              `}
            </div>
            <p class="font-bold text-slate-900 text-[11px] mt-1.5 underline">
              ${sale.driverSignerName ? `( ${sale.driverSignerName} )` : "( ............................ )"}
            </p>
            <p class="text-[9px] text-slate-500">
              ${sale.driverSignerTitle || "Driver / Kurir Pengantar"}
              ${sale.driverApprovedAt ? `<span class="block text-[7.5px] text-blue-700 font-mono mt-0.5 font-bold">Terkirim: ${sale.driverApprovedAt}</span>` : ""}
            </p>
          </div>
          <div>
            <span class="text-[11px] text-slate-500 block mb-1">Diterima Oleh (Klien / Lapangan):</span>
            <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300 relative">
              ${sale.deliverySignatureImage ? `
                <img src="${sale.deliverySignatureImage}" alt="Tanda Tangan Penerima" class="h-16 object-contain z-10" />
                <span class="absolute bottom-1 right-2 text-[6.5px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-300">✓ Diterima Sah</span>
              ` : `
                <button type="button" onclick="openDocApprovalModal('delivery')" class="print-hidden px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-lg text-[10px] font-black shadow-2xs transition cursor-pointer flex items-center gap-1">
                  <span>✍️ Tanda Tangani Online</span>
                </button>
                <span class="hidden print:inline text-[9px] text-slate-400 italic">Cap &amp; Tanda Tangan</span>
              `}
            </div>
            <p class="font-bold text-slate-900 text-[11px] mt-1.5 underline">
              ${sale.deliverySignerName ? `( ${sale.deliverySignerName} )` : "( ............................ )"}
            </p>
            <p class="text-[9px] text-slate-500">
              ${sale.deliverySignerTitle || sale.customerName}
              ${sale.deliveryApprovedAt ? `<span class="block text-[7.5px] text-emerald-700 font-mono mt-0.5 font-bold">Diterima: ${sale.deliveryApprovedAt}</span>` : ""}
            </p>
          </div>
        </div>

        <!-- Klausul Legalitas Surat Jalan -->
        <div class="mt-3 p-1.5 rounded-lg bg-slate-50/90 border border-slate-200/70 text-center">
          <p class="text-[7.5px] text-slate-500 leading-tight">
            <span class="font-bold text-slate-700">Keterangan Legalitas:</span> Surat Jalan pengiriman ini diterbitkan secara elektronik dan ditandatangani secara digital. Sesuai UU ITE No. 11 Thn 2008 Pasal 11, tanda tangan digital ini sah dan mengikat secara hukum tanpa memerlukan stempel basah.
          </p>
        </div>
      </div>
    `;
  } else if (docType === "photos") {
    documentTitle = `Dokumentasi Foto - ${sale.invoiceNumber}`;
    const photos: any[] = sale.photos || [];
    documentContent = `
      <!-- LEMBAR DOKUMENTASI FOTO -->
      <div class="text-center pb-4 border-b border-slate-300">
        <h2 class="text-lg font-black tracking-widest text-slate-900 uppercase">LAPORAN FOTO DOKUMENTASI &amp; PERGANTIAN PART</h2>
        <p class="text-xs font-bold text-slate-600 tracking-wider">Lampiran Faktur No: ${sale.invoiceNumber}</p>
        <p class="text-[11px] text-slate-500 mt-0.5">Klien: ${sale.customerName} | Tanggal: ${sale.date}</p>
      </div>

      <div class="py-4 space-y-4 text-xs text-slate-700">
        ${photos.length === 0 ? `
          <div class="p-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-300 text-slate-400">
            <span class="text-3xl block mb-2">📸</span>
            <p class="font-bold">Foto dokumentasi fisik pekerjaan telah terarsip secara digital di server.</p>
            <p class="text-[11px] mt-1">Silakan hubungi tim teknis DSTech untuk permintaan arsip foto beresolusi tinggi.</p>
          </div>
        ` : `
          <div class="grid grid-cols-2 gap-4">
            ${photos.map((photo: any, idx: number) => `
              <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/80 shadow-2xs">
                <div class="h-44 bg-slate-200 flex items-center justify-center overflow-hidden">
                  <img src="${photo.url || photo.photoUrl}" alt="${photo.caption || photo.title || 'Foto Pekerjaan'}" class="w-full h-full object-cover" />
                </div>
                <div class="p-2.5 space-y-0.5">
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-full ${photo.category === 'part_replacement' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}">
                    ${photo.category === 'part_replacement' ? '⚙️ Pergantian Part' : '📸 Dokumentasi Lapangan'}
                  </span>
                  <p class="font-bold text-slate-900 mt-1">${photo.caption || photo.title || `Foto Dokumentasi ${idx + 1}`}</p>
                  <p class="text-[10px] text-slate-500">${photo.description || photo.notes || (photo.caption !== photo.title ? (photo.description || '') : '') || '-'}</p>
                </div>
              </div>
            `).join("")}
          </div>
        `}

        <!-- Pengesahan Dokumentasi -->
        <div class="grid grid-cols-2 gap-8 pt-6 mt-6 border-t border-slate-200 text-center">
          <div>
            <span class="text-xs text-slate-500 block mb-1">Pihak Klien / Pengawas:</span>
            <span class="font-bold text-slate-800 block">${sale.customerName}</span>
            <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300 relative">
              ${sale.photosSignatureImage ? `
                <img src="${sale.photosSignatureImage}" alt="Tanda Tangan Pengawas" class="h-16 object-contain z-10" />
                <span class="absolute bottom-1 right-2 text-[7px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-300">✓ Disetujui</span>
              ` : `
                <button type="button" onclick="openDocApprovalModal('photos')" class="print-hidden px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-xl text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1">
                  <span>✍️ Tanda Tangani Online</span>
                </button>
                <span class="hidden print:inline text-[10px] text-slate-300 italic">( Tanda Tangan &amp; Cap )</span>
              `}
            </div>
            <p class="font-black text-slate-900 text-xs mt-2 underline">
              ${sale.photosSignerName ? `( ${sale.photosSignerName} )` : "( .................................................... )"}
            </p>
            <p class="text-[10px] text-slate-500">
              ${sale.photosSignerTitle || "PIC Lapangan / Klien"}
              ${sale.photosApprovedAt ? `<span class="block text-[8px] text-emerald-700 font-mono mt-0.5 font-bold">Disetujui: ${sale.photosApprovedAt}</span>` : ""}
            </p>
          </div>
          <div>
            <span class="text-xs text-slate-500 block mb-1">Pelaksana Teknis Lapangan:</span>
            <span class="font-bold text-slate-800 block">PT. DSTECH SMART PERKASA</span>
            <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300 relative">
              ${signatureImage ? `<img src="${signatureImage}" alt="Tanda Tangan" class="h-16 object-contain z-10" />` : ""}
              ${masterStampUrl ? `<img src="${masterStampUrl}" alt="Cap Resmi" class="h-16 opacity-75 absolute right-4" />` : ""}
            </div>
            <p class="font-black text-slate-900 text-xs mt-2 underline">( ${sale.salesPerson || "Ahmad Romadhoni"} )</p>
            <p class="text-[10px] text-slate-500">Project Coordinator / Teknisi Pelaksana</p>
          </div>
        </div>

        <!-- Klausul Legalitas / Keterangan Pengesahan Dokumentasi -->
        <div class="mt-3 p-1.5 rounded-lg bg-slate-50/90 border border-slate-200/70 text-center">
          <p class="text-[7.5px] text-slate-500 leading-tight">
            <span class="font-bold text-slate-700">Keterangan Pengesahan Legalitas:</span> Dokumen Laporan Foto Dokumentasi &amp; Pergantian Part ini diterbitkan secara elektronik dan ditandatangani secara digital melalui sistem informasi PT. DSTech Smart Perkasa. Sesuai ketentuan UU ITE No. 11 Thn 2008 Pasal 11 &amp; PP No. 71 Thn 2019, tanda tangan digital ini sah, mengikat, dan memiliki kekuatan hukum resmi tanpa memerlukan stempel basah.
          </p>
        </div>
      </div>
    `;
  } else {
    // DEFAULT: FAKTUR PENJUALAN (INVOICE)
    const terbilangRupiah = angkaKeTerbilang(sale.grandTotal) + " Rupiah";
    documentContent = `
      <!-- LEMBAR FAKTUR PENJUALAN -->
      <div class="flex justify-between items-start pb-4 border-b border-slate-300">
        <div>
          <h2 class="text-xl font-black text-slate-900 tracking-wider uppercase">FAKTUR PENJUALAN</h2>
          <p class="text-xs font-mono font-bold text-indigo-700 mt-0.5">NO: ${sale.invoiceNumber}</p>
          <div class="mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            sale.paymentStatus === 'Lunas' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
          }">
            STATUS: ${sale.paymentStatus || 'BELUM LUNAS'}
          </div>
        </div>
        <div class="text-right text-xs space-y-1">
          <p><span class="text-slate-400">Tanggal Faktur:</span> <strong class="text-slate-800">${sale.date}</strong></p>
          <p><span class="text-slate-400">Jatuh Tempo:</span> <strong class="text-slate-800">${sale.dueDate || '-'}</strong></p>
          <p><span class="text-slate-400">Metode Bayar:</span> <strong class="text-slate-800">${sale.paymentMethod || 'Transfer Bank'}</strong></p>
        </div>
      </div>

      <!-- Info Klien -->
      <div class="py-3 border-b border-slate-200 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">DITAGIHKAN KEPADA:</span>
          <p class="font-black text-slate-900 text-sm mt-0.5">${sale.customerName}</p>
          ${sale.customerPic ? `<p class="font-bold text-indigo-600">Up. ${sale.customerPic}</p>` : ''}
          <p class="text-slate-600 mt-0.5 leading-relaxed text-[11px]">${sale.customerAddress || 'Alamat Klien'}</p>
          <p class="text-slate-500 text-[11px] mt-0.5">Telp: ${sale.customerPhone || '-'}</p>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">DITERBITKAN OLEH:</span>
          <p class="font-black text-slate-900 text-sm mt-0.5">PT. DSTECH SMART PERKASA</p>
          <p class="text-slate-600 leading-relaxed text-[11px]">Jl. Raya Cilegon No. 18, Kota Cilegon - Banten</p>
          <p class="text-slate-500 text-[10px]">Website: https://dstechsmart.com | Email: cs@dstechsmart.com</p>
        </div>
      </div>

      <!-- Tabel Rincian Item -->
      <table class="w-full text-xs border border-slate-300 mt-3">
        <thead class="bg-slate-100 font-bold text-slate-800">
          <tr>
            <th class="border border-slate-300 p-2 text-center w-10">No</th>
            <th class="border border-slate-300 p-2 text-left">Nama Produk / Rincian Layanan</th>
            <th class="border border-slate-300 p-2 text-center w-16">Qty</th>
            <th class="border border-slate-300 p-2 text-right w-28">Harga Satuan</th>
            <th class="border border-slate-300 p-2 text-right w-28">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(sale.items || []).map((item: any, idx: number) => `
            <tr>
              <td class="border border-slate-300 p-2 text-center">${idx + 1}</td>
              <td class="border border-slate-300 p-2">
                <span class="font-bold text-slate-900 block">${item.productName || item.name}</span>
                ${item.description ? `<span class="text-[10px] text-slate-500 block">${item.description}</span>` : ''}
              </td>
              <td class="border border-slate-300 p-2 text-center font-semibold">${item.qty} ${item.unit || ''}</td>
              <td class="border border-slate-300 p-2 text-right">${formatRupiah(item.price)}</td>
              <td class="border border-slate-300 p-2 text-right font-bold text-slate-900">${formatRupiah(item.total || item.qty * item.price)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <!-- Kalkulasi Subtotal & Terbilang -->
      <div class="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200 text-xs">
        <div class="space-y-2">
          <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">TERBILANG:</span>
            <p class="font-bold italic text-slate-800 text-[11px] mt-0.5">"# ${terbilangRupiah} #"</p>
          </div>

          ${(() => {
            const saleBanks = getFilteredBankAccounts(bankAccounts, sale.businessEntity);
            const saleBank = saleBanks.find((b: any) => b.isDefault) || saleBanks[0];
            return `
              <div class="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-indigo-950 space-y-0.5">
                <span class="text-[9px] text-indigo-700 font-bold block uppercase tracking-wider">REKENING RESMI TRANSFER (${sale.businessEntity === "NON_PT" ? "DSTECH SMART" : "PT. DSTECH SMART PERKASA"}):</span>
                <p class="font-bold text-xs">${saleBank.bankName}</p>
                <p class="font-mono text-xs font-black text-indigo-900">${saleBank.accountNumber}</p>
                <p class="text-[10px] text-indigo-800">a/n ${saleBank.accountHolder} (${saleBank.branch || 'KCU Cilegon'})</p>
              </div>
            `;
          })()}
        </div>

        <div class="space-y-1 text-right">
          <div class="flex justify-between py-0.5 text-slate-600">
            <span>Subtotal:</span>
            <span class="font-bold text-slate-900">${formatRupiah(sale.subtotal)}</span>
          </div>
          ${sale.discount && sale.discount > 0 ? `
            <div class="flex justify-between py-0.5 text-red-600">
              <span>${sale.discountLabel || 'Diskon'}:</span>
              <span class="font-bold">-${formatRupiah(sale.discount)}</span>
            </div>
          ` : ''}
          ${sale.taxAmount && sale.taxAmount > 0 ? `
            <div class="flex justify-between py-0.5 text-slate-600">
              <span>${sale.taxRate === 11.12 ? 'PPN (12% (11/12))' : `PPN (${sale.taxRate || 11}%)`}${sale.taxType === 'include' ? ' Include' : ''}:</span>
              <span class="font-bold text-slate-900">${formatRupiah(sale.taxAmount)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between py-1 border-t-2 border-slate-800 text-sm font-black text-slate-900">
            <span>Total Tagihan:</span>
            <span class="text-indigo-700">${formatRupiah(sale.grandTotal)}</span>
          </div>
          <div class="flex justify-between py-0.5 text-emerald-700 font-bold">
            <span>Sudah Dibayar:</span>
            <span>${formatRupiah(sale.paidAmount || 0)}</span>
          </div>
          <div class="flex justify-between py-0.5 text-amber-800 font-black border-t border-dashed border-slate-300">
            <span>Sisa Tagihan:</span>
            <span>${formatRupiah(sale.remainingAmount || 0)}</span>
          </div>
        </div>
      </div>

      <!-- Tanda Tangan & Cap Resmi -->
      <div class="grid grid-cols-2 gap-8 pt-4 mt-4 border-t border-slate-200 text-center">
        <div>
          <span class="text-[10px] text-slate-500 block mb-1">Penerima / Klien:</span>
          <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300 relative">
            ${sale.clientSignatureImage ? `
              <img src="${sale.clientSignatureImage}" alt="Tanda Tangan Penerima" class="h-16 object-contain z-10" />
              <span class="absolute bottom-1 bg-purple-50 text-purple-700 border border-purple-200 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-2xs">✓ Disahkan Digital: ${sale.clientApprovedAt || ""}</span>
            ` : `
              <button type="button" onclick="openDocApprovalModal('invoice')" class="print-hidden px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 rounded-lg text-[10px] font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1">
                <span>✍️ Tanda Tangan Penerima</span>
              </button>
              <span class="hidden print:inline text-[10px] text-slate-300 italic">( Tanda Tangan &amp; Cap )</span>
            `}
          </div>
          <p class="font-bold text-slate-900 text-xs mt-1 underline">${sale.clientSignerName ? `( ${sale.clientSignerName} )` : `( ${sale.customerName} )`}</p>
          <p class="text-[10px] text-slate-500">${sale.clientSignerTitle || "Penerima / Bagian Keuangan"}</p>
        </div>
        <div>
          <span class="text-[10px] text-slate-500 block mb-1">Hormat Kami,</span>
          <span class="font-bold text-slate-900 text-xs block">PT. DSTECH SMART PERKASA</span>
          <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300 relative">
            ${signatureImage ? `<img src="${signatureImage}" alt="Tanda Tangan" class="h-16 object-contain z-10" />` : ""}
            ${masterStampUrl ? `<img src="${masterStampUrl}" alt="Cap Resmi" class="h-16 opacity-75 absolute right-4" />` : ""}
          </div>
          <p class="font-black text-slate-900 text-xs mt-1 underline">( ${signerName} )</p>
          <p class="text-[10px] text-slate-500">${signerTitle}</p>
        </div>
      </div>

      <!-- Klausul Legalitas Keabsahan Tanda Tangan Digital Resmi Faktur -->
      <div class="mt-3 p-1.5 rounded-lg bg-slate-50/90 border border-slate-200/70 text-center">
        <p class="text-[7.5px] text-slate-500 leading-tight">
          <span class="font-bold text-slate-700">Keterangan Legalitas:</span> Dokumen Faktur ini diterbitkan secara elektronik dan ditandatangani secara digital melalui sistem informasi PT DSTech Smart Perkasa. Sesuai ketentuan UU ITE No. 11 Thn 2008 Pasal 11 &amp; PP No. 71 Thn 2019, tanda tangan digital ini sah, mengikat, dan memiliki kekuatan hukum resmi tanpa memerlukan stempel basah.
        </p>
      </div>
    `;
  }

  // Gabungkan ke template HTML Lengkap Responsif
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${documentTitle} - PT. DSTech Smart Perkasa</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <style id="dynamic-print-style">
        @page {
          size: ${isReceipt ? 'A4 portrait' : 'A4 portrait'};
          margin: ${isReceipt ? '8mm' : '0'};
        }
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-hidden {
            display: none !important;
          }
          .print-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: avoid;
          }
          /* Garis putus-putus pembatas potong saat dicetak di kertas A4 */
          .receipt-cut-border {
            border: 1px dashed #94a3b8 !important;
          }
        }
      </style>
    </head>
    <body class="bg-slate-100 text-slate-900 font-sans min-h-screen py-4 sm:py-8 px-2 sm:px-4">
      
      <!-- Top Action Toolbar (Layar saja, print:hidden) -->
      <div class="max-w-[210mm] mx-auto mb-4 bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex flex-wrap items-center justify-between gap-3 print-hidden">
        <div class="flex items-center gap-3">
          <a href="/" class="shrink-0 transition-transform hover:scale-105 block" title="PT. DSTech Smart Perkasa">
            <img src="/logo.png" alt="Logo PT. DSTech Smart Perkasa" class="h-10 w-auto object-contain max-w-[150px]" />
          </a>
          <div>
            <h1 class="font-black text-sm sm:text-base text-slate-900">${documentTitle}</h1>
            <p class="text-[11px] text-slate-500">PT. DSTech Smart Perkasa • Portal Dokumen Resmi</p>
          </div>
        </div>

        <!-- Tombol Aksi Cepat Cetak, Pilihan Format Ukuran & Download -->
        <div class="flex flex-wrap items-center gap-2">
          ${isReceipt ? `
            <!-- Selektor Ukuran Kuitansi Lengkap -->
            <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs">
              <span class="px-2 text-slate-500 font-bold hidden sm:inline">📐 Ukuran:</span>
              <button
                type="button"
                id="btn-size-full-width"
                onclick="setReceiptSize('full-width')"
                class="px-2.5 py-1.5 rounded-lg font-black transition-all bg-indigo-600 text-white shadow-xs cursor-pointer"
                title="Selebar Kertas A4 (210×108mm) - Panjang Sampai Habis"
              >
                Panjang A4 (Slip)
              </button>
              <button
                type="button"
                id="btn-size-half-a5"
                onclick="setReceiptSize('half-a5')"
                class="px-2.5 py-1.5 rounded-lg font-bold transition-all bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                title="1/2 Kertas A4 (210×148mm)"
              >
                1/2 A4
              </button>
              <button
                type="button"
                id="btn-size-full-a4"
                onclick="setReceiptSize('full-a4')"
                class="px-2.5 py-1.5 rounded-lg font-bold transition-all bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                title="1 Kertas A4 Penuh (210×297mm)"
              >
                Full A4
              </button>
              <button
                type="button"
                id="btn-size-quarter-a6"
                onclick="setReceiptSize('quarter-a6')"
                class="px-2.5 py-1.5 rounded-lg font-bold transition-all bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                title="1/4 Kertas A4 (A6 Landscape 148×105mm)"
              >
                Kompak A6
              </button>
            </div>
          ` : ''}

          <!-- Tombol Tanda Tangan Online (BAST, Surat Jalan, Dokumentasi Foto, Faktur) -->
          ${docType === 'bast' ? (`
            ${sale.bastApproved ? `
              <div class="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <span>✅ BAST Ditandatangani Klien (${sale.bastSignerName || "Klien"})</span>
              </div>
            ` : `
              <button type="button" onclick="openDocApprovalModal('bast')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition transform hover:scale-[1.02] cursor-pointer">
                <span>✍️ Tanda Tangani BAST (Klien)</span>
              </button>
            `}
          `) : docType === 'delivery' ? (`
            <div class="flex items-center gap-2">
              ${sale.driverSignatureImage ? `
                <div class="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <span>🚚 Supir: ${sale.driverSignerName || "Driver"}</span>
                </div>
              ` : `
                <button type="button" onclick="openDocApprovalModal('driver')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition transform hover:scale-[1.02] cursor-pointer">
                  <span>✍️ TTD Supir Ekspedisi</span>
                </button>
              `}
              ${sale.deliveryApproved ? `
                <div class="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <span>✅ Diterima: ${sale.deliverySignerName || "Penerima"}</span>
                </div>
              ` : `
                <button type="button" onclick="openDocApprovalModal('delivery')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition transform hover:scale-[1.02] cursor-pointer">
                  <span>✍️ TTD Penerima (Klien)</span>
                </button>
              `}
            </div>
          `) : docType === 'photos' ? (`
            ${sale.photosApproved ? `
              <div class="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <span>✅ Dokumentasi Disetujui (${sale.photosSignerName || "Klien"})</span>
              </div>
            ` : `
              <button type="button" onclick="openDocApprovalModal('photos')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition transform hover:scale-[1.02] cursor-pointer">
                <span>✍️ Tanda Tangani Laporan Foto (Klien)</span>
              </button>
            `}
          `) : (!isReceipt && docType !== 'bast' && docType !== 'delivery' && docType !== 'photos') ? (`
            ${sale.clientSignatureImage ? `
              <div class="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <span>✅ Faktur Diterima (${sale.clientSignerName || "Klien"})</span>
              </div>
            ` : `
              <button type="button" onclick="openDocApprovalModal('invoice')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition transform hover:scale-[1.02] cursor-pointer">
                <span>✍️ Tanda Tangani Faktur (Penerima)</span>
              </button>
            `}
          `) : ''}

          <!-- Kop Surat Gambar Resmi Terkunci Permanen untuk Klien -->
          <input type="hidden" id="toggle-letterhead" value="1" checked />

          <button
            type="button"
            onclick="downloadAsPdf()"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <span>⬇️ Unduh PDF</span>
          </button>
          <button
            type="button"
            onclick="window.print()"
            class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <span>🖨️ Cetak (Print)</span>
          </button>
        </div>
      </div>

      <!-- Tab Navigasi Dokumen Terkait (Faktur, BAST, Surat Jalan, Foto, Kuitansi) -->
      <div class="max-w-[210mm] mx-auto mb-4 flex items-center gap-2 overflow-x-auto pb-1 print-hidden">
        ${tabs.map((tab) => `
          <a
            href="?doc=${tab.id}&no=${encNo}&pin=${docPin}"
            class="px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer ${
              tab.active
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }"
          >
            ${tab.label}
          </a>
        `).join("")}
      </div>

      <!-- LEMBAR DOKUMEN FISIK (A4 Standar atau Kuitansi Selebar A4) -->
      <div
        id="print-sheet-document"
        class="print-sheet relative bg-white shadow-2xl border border-slate-300 mx-auto overflow-hidden text-slate-800 ${isReceipt ? 'receipt-cut-border' : ''}"
        style="${isReceipt 
          ? 'width: 210mm; min-height: 115mm; max-height: none; height: auto; padding: 0;' 
          : 'width: 210mm; min-height: 297mm; padding: 0;'
        } max-width: 100%; box-sizing: border-box;"
      >
        <!-- Background Kop Surat Resmi Gambar A4 Penuh (Hanya untuk dokumen selain Kuitansi atau saat Kuitansi mode Full A4) -->
        <img
          id="letterhead-bg-img"
          src="${letterheadUrl}"
          alt="Kop Surat Resmi"
          class="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
          style="object-fit: fill; object-position: top center; width: 100%; height: 100%; display: ${!isReceipt && letterheadEnabled ? 'block' : 'none'}; opacity: 1; -webkit-print-color-adjust: exact; print-color-adjust: exact;"
        />

        <!-- Area Isi Dokumen dengan Padding yang Disesuaikan -->
        <div
          id="document-content-wrapper"
          class="relative z-10 ${isReceipt ? 'space-y-0.5' : 'space-y-4'}"
          style="padding-top: ${isReceipt ? '0px' : (letterheadEnabled ? '120px' : '30px')}; padding-bottom: ${isReceipt ? '0px' : (letterheadEnabled ? '90px' : '30px')}; padding-left: ${isReceipt ? '0px' : '42px'}; padding-right: ${isReceipt ? '0px' : '42px'};"
        >
          ${documentContent}
        </div>
      </div>

      ${isReceipt ? `
        <!-- Garis Panduan Gunting Potong Kuitansi Selebar A4 (Tampil di Layar & Cetak jika menggunakan kertas A4) -->
        <div id="receipt-cut-guide" class="max-w-[210mm] mx-auto mt-2 text-center text-[10px] text-slate-400 font-mono flex items-center justify-center gap-2 select-none print:mt-1">
          <span class="text-slate-300">✂️ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</span>
          <span id="cut-guide-label" class="font-bold text-slate-500 uppercase tracking-wider">Batas Gunting / Potong Kuitansi Selebar Kertas A4 (210mm × 115mm)</span>
          <span class="text-slate-300">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂️</span>
        </div>
      ` : ''}

      <script>
        let currentReceiptMode = 'full-width';

        function setReceiptSize(mode) {
          currentReceiptMode = mode;
          const sheet = document.getElementById('print-sheet-document');
          const guideLabel = document.getElementById('cut-guide-label');
          const styleEl = document.getElementById('dynamic-print-style');
          const bgImg = document.getElementById('letterhead-bg-img');
          const receiptImgBox = document.getElementById('receipt-letterhead-image-box');
          const receiptFooterBox = document.getElementById('receipt-letterhead-footer-box');
          const receiptTextBox = document.getElementById('receipt-letterhead-text-box');
          const letterheadCheckbox = document.getElementById('toggle-letterhead');
          const isLetterheadOn = letterheadCheckbox ? letterheadCheckbox.checked : true;
          
          // Reset style tombol aktif
          ['full-width', 'half-a5', 'full-a4', 'quarter-a6'].forEach(m => {
            const btn = document.getElementById('btn-size-' + m);
            if (btn) {
              if (m === mode) {
                btn.className = 'px-2.5 py-1.5 rounded-lg font-black transition-all bg-indigo-600 text-white shadow-xs cursor-pointer';
              } else {
                btn.className = 'px-2.5 py-1.5 rounded-lg font-bold transition-all bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer';
              }
            }
          });

          if (!sheet) return;

          if (mode === 'full-width') {
            // Selebar Kertas A4 Penuh (210mm x 115mm, Format Slip Kuitansi Ideal)
            sheet.style.width = '210mm';
            sheet.style.height = 'auto';
            sheet.style.minHeight = '115mm';
            sheet.style.maxHeight = 'none';
            sheet.style.padding = '0';
            if (bgImg) bgImg.style.display = 'none';
            if (receiptImgBox && receiptTextBox) {
              receiptImgBox.style.display = isLetterheadOn ? 'block' : 'none';
              receiptTextBox.style.display = isLetterheadOn ? 'none' : 'flex';
            }
            if (receiptFooterBox) receiptFooterBox.style.display = isLetterheadOn ? 'block' : 'none';
            if (guideLabel) guideLabel.innerText = 'Batas Gunting / Potong Kuitansi Selebar Kertas A4 (210mm × 115mm)';
            if (styleEl) {
              styleEl.innerHTML = \`
                @page { size: A4 portrait; margin: 0; }
                @media print {
                  body { background: white !important; padding: 0 !important; margin: 0 !important; }
                  .print-hidden { display: none !important; }
                  .print-sheet {
                    box-shadow: none !important;
                    margin: 0 auto !important;
                    width: 210mm !important;
                    min-height: 115mm !important;
                    height: auto !important;
                    padding: 0 !important;
                    page-break-after: avoid;
                  }
                  .receipt-cut-border { border-bottom: 1px dashed #94a3b8 !important; border-top: none !important; border-left: none !important; border-right: none !important; }
                }
              \`;
            }
          } else if (mode === 'half-a5') {
            // 1/2 Kertas A4 (210mm x 148mm)
            sheet.style.width = '210mm';
            sheet.style.height = '148mm';
            sheet.style.minHeight = '148mm';
            sheet.style.maxHeight = '148mm';
            sheet.style.padding = '0';
            if (bgImg) bgImg.style.display = 'none';
            if (receiptImgBox && receiptTextBox) {
              receiptImgBox.style.display = isLetterheadOn ? 'block' : 'none';
              receiptTextBox.style.display = isLetterheadOn ? 'none' : 'flex';
            }
            if (receiptFooterBox) receiptFooterBox.style.display = isLetterheadOn ? 'block' : 'none';
            if (guideLabel) guideLabel.innerText = 'Batas Gunting / Potong Kuitansi 1/2 Kertas A4 (210mm × 148mm)';
            if (styleEl) {
              styleEl.innerHTML = \`
                @page { size: A4 portrait; margin: 0; }
                @media print {
                  body { background: white !important; padding: 0 !important; margin: 0 !important; }
                  .print-hidden { display: none !important; }
                  .print-sheet {
                    box-shadow: none !important;
                    margin: 0 auto !important;
                    width: 210mm !important;
                    height: 148mm !important;
                    min-height: 148mm !important;
                    max-height: 148mm !important;
                    padding: 0 !important;
                    page-break-after: avoid;
                  }
                  .receipt-cut-border { border-bottom: 1px dashed #94a3b8 !important; border-top: none !important; border-left: none !important; border-right: none !important; }
                }
              \`;
            }
          } else if (mode === 'full-a4') {
            // 1 Lembar A4 Penuh (210mm x 297mm) dengan Kop A4 Utuh
            sheet.style.width = '210mm';
            sheet.style.height = '297mm';
            sheet.style.minHeight = '297mm';
            sheet.style.maxHeight = '297mm';
            sheet.style.padding = isLetterheadOn ? '135px 42px 90px 42px' : '40px 42px';
            if (bgImg) bgImg.style.display = isLetterheadOn ? 'block' : 'none';
            if (receiptImgBox) receiptImgBox.style.display = 'none'; // Gunakan bgImg A4 utuh
            if (receiptFooterBox) receiptFooterBox.style.display = 'none';
            if (receiptTextBox) receiptTextBox.style.display = isLetterheadOn ? 'none' : 'flex';
            if (guideLabel) guideLabel.innerText = 'Format Kuitansi A4 Penuh (210mm × 297mm)';
            if (styleEl) {
              styleEl.innerHTML = \`
                @page { size: A4 portrait; margin: 0; }
                @media print {
                  body { background: white !important; padding: 0 !important; margin: 0 !important; }
                  .print-hidden { display: none !important; }
                  .print-sheet {
                    box-shadow: none !important;
                    border: none !important;
                    margin: 0 !important;
                    width: 210mm !important;
                    height: 297mm !important;
                    min-height: 297mm !important;
                    max-height: 297mm !important;
                    page-break-after: always;
                  }
                }
              \`;
            }
          } else if (mode === 'quarter-a6') {
            // 1/4 Kertas A4 (A6 Landscape: 148mm x 105mm)
            sheet.style.width = '148mm';
            sheet.style.height = '105mm';
            sheet.style.minHeight = '105mm';
            sheet.style.maxHeight = '105mm';
            sheet.style.padding = '0';
            if (bgImg) bgImg.style.display = 'none';
            if (receiptImgBox && receiptTextBox) {
              receiptImgBox.style.display = isLetterheadOn ? 'block' : 'none';
              receiptTextBox.style.display = isLetterheadOn ? 'none' : 'flex';
            }
            if (receiptFooterBox) receiptFooterBox.style.display = isLetterheadOn ? 'block' : 'none';
            if (guideLabel) guideLabel.innerText = 'Batas Gunting / Potong Kuitansi 1/4 Kertas A4 (148mm × 105mm)';
            if (styleEl) {
              styleEl.innerHTML = \`
                @page { size: A4 portrait; margin: 0; }
                @media print {
                  body { background: white !important; padding: 0 !important; margin: 0 !important; }
                  .print-hidden { display: none !important; }
                  .print-sheet {
                    box-shadow: none !important;
                    margin: 0 !important;
                    width: 148mm !important;
                    height: 105mm !important;
                    min-height: 105mm !important;
                    max-height: 105mm !important;
                    padding: 0 !important;
                    page-break-after: avoid;
                  }
                  .receipt-cut-border { border: 1px dashed #94a3b8 !important; }
                }
              \`;
            }
          }
        }

        function toggleLetterhead(enabled) {
          const bgImg = document.getElementById('letterhead-bg-img');
          const wrapper = document.getElementById('document-content-wrapper');
          const receiptImgBox = document.getElementById('receipt-letterhead-image-box');
          const receiptFooterBox = document.getElementById('receipt-letterhead-footer-box');
          const receiptTextBox = document.getElementById('receipt-letterhead-text-box');
          const sheet = document.getElementById('print-sheet-document');
          const isReceiptDoc = ${isReceipt ? 'true' : 'false'};

          if (isReceiptDoc) {
            if (currentReceiptMode === 'full-a4') {
              if (bgImg) bgImg.style.display = enabled ? 'block' : 'none';
              if (sheet) sheet.style.padding = enabled ? '135px 42px 90px 42px' : '40px 42px';
              if (receiptImgBox) receiptImgBox.style.display = 'none';
              if (receiptFooterBox) receiptFooterBox.style.display = 'none';
              if (receiptTextBox) receiptTextBox.style.display = enabled ? 'none' : 'flex';
            } else {
              if (bgImg) bgImg.style.display = 'none';
              if (sheet) sheet.style.padding = '0';
              if (receiptImgBox) receiptImgBox.style.display = enabled ? 'block' : 'none';
              if (receiptFooterBox) receiptFooterBox.style.display = enabled ? 'block' : 'none';
              if (receiptTextBox) receiptTextBox.style.display = enabled ? 'none' : 'flex';
            }
          } else {
            if (enabled) {
              if (bgImg) bgImg.style.display = 'block';
              if (wrapper) {
                wrapper.style.paddingTop = '120px';
                wrapper.style.paddingBottom = '90px';
              }
            } else {
              if (bgImg) bgImg.style.display = 'none';
              if (wrapper) {
                wrapper.style.paddingTop = '30px';
                wrapper.style.paddingBottom = '30px';
              }
            }
          }
        }

        function downloadAsPdf() {
          const element = document.getElementById('print-sheet-document');
          const isReceipt = ${isReceipt ? 'true' : 'false'};

          let jsPdfFormat = 'a4';
          let jsPdfOrientation = 'portrait';

          if (isReceipt) {
            if (currentReceiptMode === 'full-width') {
              jsPdfFormat = [210, 108];
              jsPdfOrientation = 'landscape';
            } else if (currentReceiptMode === 'half-a5') {
              jsPdfFormat = [210, 148];
              jsPdfOrientation = 'landscape';
            } else if (currentReceiptMode === 'quarter-a6') {
              jsPdfFormat = [148, 105];
              jsPdfOrientation = 'landscape';
            } else {
              jsPdfFormat = 'a4';
              jsPdfOrientation = 'portrait';
            }
          }

          const opt = {
            margin:       0,
            filename:     '${documentTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf',
            image:        { type: 'jpeg', quality: 0.95 },
            html2canvas:  {
              scale: 2,
              useCORS: true,
              logging: false,
              windowWidth: 1024,
              scrollX: 0,
              scrollY: 0
            },
            jsPDF:        { unit: 'mm', format: jsPdfFormat, orientation: jsPdfOrientation }
          };
          html2pdf().set(opt).from(element).save();
        }
      </script>

      <!-- Modal Serbaguna Tanda Tangan Dokumen Klien (BAST, Surat Jalan, Laporan Foto) -->
      <div id="doc-approval-modal" class="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs hidden print-hidden">
        <div class="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 id="modal-doc-title" class="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                <span>✍️ Tanda Tangan Dokumen Klien</span>
              </h3>
              <p class="text-[11px] text-slate-500 font-mono">${sale.invoiceNumber} • ${sale.customerName}</p>
            </div>
            <button type="button" onclick="closeDocApprovalModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-black cursor-pointer">✕</button>
          </div>

          <p id="modal-doc-desc" class="text-xs text-slate-600 leading-relaxed">
            Silakan bubuhkan tanda tangan digital Anda di bawah ini sebagai bukti persetujuan resmi.
          </p>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nama Lengkap Penandatangan *</label>
              <input type="text" id="input-doc-signer-name" value="${sale.customerPic || sale.customerName || ''}" placeholder="Nama lengkap Anda..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 bg-slate-50" />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Jabatan / Status *</label>
              <input type="text" id="input-doc-signer-title" value="Penanggung Jawab / PIC Klien" placeholder="Contoh: Manajer Operasional / Penerima Barang..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50" />
            </div>

            <!-- Canvas Tanda Tangan Digital -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-[11px] font-black text-slate-800 uppercase">Goreskan Tanda Tangan Digital *</label>
                <button type="button" onclick="clearDocSignCanvas()" class="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer">Hapus Goresan</button>
              </div>
              <div class="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-1 flex justify-center">
                <canvas id="canvas-doc-sign" width="420" height="150" class="w-full max-w-[420px] h-[150px] bg-white rounded-lg cursor-crosshair touch-none shadow-2xs"></canvas>
              </div>
              <span class="text-[9.5px] text-slate-400 italic block mt-0.5">*Goreskan tanda tangan langsung menggunakan sentuhan jari smartphone atau mouse</span>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Catatan Tambahan (Opsional)</label>
              <textarea id="input-doc-note" rows="2" placeholder="Catatan kondisi serah terima / pemeriksaan..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50"></textarea>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 leading-tight">
              ⚖️ <strong>Keabsahan Hukum:</strong> Dokumen ini ditandatangani secara digital dan sah mengikat secara hukum sesuai ketentuan UU ITE No. 11 Thn 2008 Pasal 11 &amp; PP No. 71 Thn 2019 tanpa memerlukan stempel basah.
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button type="button" onclick="closeDocApprovalModal()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer">Batal</button>
            <button type="button" id="btn-submit-doc-sign" onclick="submitDocApproval()" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer">
              <span>✓ Tanda Tangani &amp; Sahkan Dokumen</span>
            </button>
          </div>
        </div>
      </div>

      <script>
        let currentTargetDocType = 'bast';
        let isDrawingDocSign = false;
        let docSignHasContent = false;

        function getDocCanvasCoords(canvas, e) {
          const rect = canvas.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
          };
        }

        function initDocCanvas() {
          const canvas = document.getElementById('canvas-doc-sign');
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          function start(e) {
            e.preventDefault();
            isDrawingDocSign = true;
            const c = getDocCanvasCoords(canvas, e);
            ctx.beginPath();
            ctx.moveTo(c.x, c.y);
          }

          function move(e) {
            if (!isDrawingDocSign) return;
            e.preventDefault();
            const c = getDocCanvasCoords(canvas, e);
            ctx.lineTo(c.x, c.y);
            ctx.stroke();
            docSignHasContent = true;
          }

          function stop(e) {
            if (isDrawingDocSign) {
              e.preventDefault();
              ctx.closePath();
              isDrawingDocSign = false;
            }
          }

          canvas.addEventListener('mousedown', start);
          canvas.addEventListener('mousemove', move);
          window.addEventListener('mouseup', stop);

          canvas.addEventListener('touchstart', start, { passive: false });
          canvas.addEventListener('touchmove', move, { passive: false });
          window.addEventListener('touchend', stop, { passive: false });
        }

        function openDocApprovalModal(type) {
          currentTargetDocType = type;
          const modal = document.getElementById('doc-approval-modal');
          const title = document.getElementById('modal-doc-title');
          const desc = document.getElementById('modal-doc-desc');
          const titleInput = document.getElementById('input-doc-signer-title');

          if (type === 'bast') {
            if (title) title.innerHTML = '<span>✍️ Tanda Tangan Berita Acara Serah Terima (BAST)</span>';
            if (desc) desc.innerHTML = 'Dengan menandatangani BAST ini, Pihak Klien menyatakan pekerjaan dan perangkat telah diterima dalam kondisi 100% baik, lengkap, dan lulus uji operasional.';
            if (titleInput) titleInput.value = 'Penanggung Jawab / PIC Klien';
          } else if (type === 'delivery') {
            if (title) title.innerHTML = '<span>✍️ Tanda Tangan Surat Jalan Penerimaan Barang</span>';
            if (desc) desc.innerHTML = 'Dengan menandatangani Surat Jalan ini, Penerima menyatakan barang-barang kiriman telah tiba di lokasi dan diterima dalam kondisi tersegel baik.';
            if (titleInput) titleInput.value = 'Penerima Barang / Petugas Lapangan';
          } else if (type === 'photos') {
            if (title) title.innerHTML = '<span>✍️ Tanda Tangan Laporan Dokumentasi Foto</span>';
            if (desc) desc.innerHTML = 'Dengan menandatangani lembar ini, Pengawas Klien mengesahkan dokumentasi foto fisik hasil pekerjaan dan pergantian spare part.';
            if (titleInput) titleInput.value = 'Pengawas Lapangan / PIC Klien';
          } else if (type === 'driver' || type === 'driver_delivery') {
            if (title) title.innerHTML = '<span>✍️ Tanda Tangan Supir / Kurir Ekspedisi</span>';
            if (desc) desc.innerHTML = 'Dengan menandatangani Surat Jalan ini, Pengemudi/Ekspedisi menyatakan telah menerima barang dari gudang pengirim dan bertanggung jawab mengantarkannya ke lokasi tujuan.';
            if (titleInput) titleInput.value = 'Driver / Petugas Ekspedisi';
            const nameEl = document.getElementById('input-doc-signer-name');
            if (nameEl) nameEl.value = '${sale.salesPerson || "Supir Ekspedisi"}';
          } else if (type === 'invoice' || type === 'faktur') {
            if (title) title.innerHTML = '<span>✍️ Tanda Tangan Penerima Faktur Penjualan</span>';
            if (desc) desc.innerHTML = 'Dengan menandatangani faktur ini, Penerima/Klien menyatakan telah menerima tagihan/dokumen invoice ini secara sah dan resmi.';
            if (titleInput) titleInput.value = 'Bagian Keuangan / PIC Penerima';
            const nameEl = document.getElementById('input-doc-signer-name');
            if (nameEl) nameEl.value = '${sale.customerName || ""}';
          }

          if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
              initDocCanvas();
            }, 100);
          }
        }

        function closeDocApprovalModal() {
          const modal = document.getElementById('doc-approval-modal');
          if (modal) modal.classList.add('hidden');
        }

        function clearDocSignCanvas() {
          const canvas = document.getElementById('canvas-doc-sign');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            docSignHasContent = false;
          }
        }

        async function submitDocApproval() {
          const signerName = document.getElementById('input-doc-signer-name')?.value.trim();
          const signerTitle = document.getElementById('input-doc-signer-title')?.value.trim();
          const notes = document.getElementById('input-doc-note')?.value.trim();
          const canvas = document.getElementById('canvas-doc-sign');

          if (!signerName) {
            alert('Mohon isi nama lengkap penandatangan!');
            return;
          }

          if (!docSignHasContent || !canvas) {
            alert('Mohon goreskan tanda tangan digital terlebih dahulu!');
            return;
          }

          const signatureImage = canvas.toDataURL('image/png');
          const submitBtn = document.getElementById('btn-submit-doc-sign');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Memproses Tanda Tangan...';
          }

          try {
            const res = await fetch('/api/finance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                actionType: 'client_approve_doc',
                payload: {
                  docType: currentTargetDocType,
                  invoiceNumber: '${sale.invoiceNumber}',
                  id: '${sale.id || ""}',
                  signerName: signerName,
                  signerTitle: signerTitle,
                  signatureImage: signatureImage,
                  notes: notes
                }
              })
            });

            const result = await res.json();
            if (result.success) {
              alert('Tanda Tangan Berhasil! Dokumen resmi telah disahkan.');
              window.location.reload();
            } else {
              alert('Gagal: ' + (result.error || 'Terjadi kesalahan sistem'));
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '✓ Tanda Tangani &amp; Sahkan Dokumen';
              }
            }
          } catch (err) {
            alert('Kendala koneksi: ' + err.message);
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = '✓ Tanda Tangani &amp; Sahkan Dokumen';
            }
          }
        }
      </script>
    </body>
    </html>
  `;

  return new NextResponse(fullHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  });
  } catch (err: any) {
    console.error("Error in /api/finance/print:", err);
    const friendlyErrorHtml = `<!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pemrosesan Dokumen - PT. DSTech Smart Perkasa</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 min-h-screen text-slate-100 flex items-center justify-center p-4 font-sans">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
        <div class="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">📄</div>
        <h1 class="text-xl font-black text-white">Memuat Dokumen Resmi</h1>
        <p class="text-xs text-slate-400 leading-relaxed">
          Sistem sedang memproses berkas resmi Anda. Jika halaman belum termuat sempurna, silakan klik tombol di bawah untuk menyegarkan.
        </p>
        <div class="pt-2">
          <button onclick="window.location.reload()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer">
            🔄 Muat Ulang Halaman
          </button>
        </div>
      </div>
    </body>
    </html>`;
    return new NextResponse(friendlyErrorHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
