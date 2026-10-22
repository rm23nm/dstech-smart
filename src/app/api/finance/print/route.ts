import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");

function readFinanceData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_finance_erp.json:", err);
  }
  return { sales: [], bank_accounts: [], settings: {} };
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const docType = (searchParams.get("doc") || "invoice").toLowerCase();
  const docNo = (searchParams.get("no") || searchParams.get("id") || "").trim();

  const data = readFinanceData();
  const sales: any[] = data.sales || [];
  const bankAccounts: any[] = data.bank_accounts || [];
  const settings: any = data.settings || {};

  // Cari faktur berdasarkan nomor faktur atau ID
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dokumen Tidak Ditemukan - DSTech Smart</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans">
        <div class="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-200 space-y-4">
          <div class="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">⚠️</div>
          <h1 class="text-xl font-black text-slate-900">Dokumen Tidak Ditemukan</h1>
          <p class="text-xs text-slate-500 leading-relaxed">
            Nomor dokumen <strong>"${docNo || "-"}"</strong> tidak ditemukan dalam sistem kami atau telah diarsipkan.
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

  // Pengaturan Kop Surat & Info Perusahaan
  const letterheadUrl = settings.letterheadUrl || "/images/kop_surat_dstech.jpg";
  const letterheadEnabled = settings.letterheadEnabled !== false;
  const signerName = sale.approvedBy || settings.signerName || "RAMADHANI ST";
  const signerTitle = sale.approvedTitle || settings.signerTitle || "Direktur";
  const masterStampUrl = settings.masterStampUrl || "";
  const signatureImage = sale.signatureImage || settings.masterSignatureUrl || "";
  const defaultBank = bankAccounts.find((b) => b.isDefault) || bankAccounts[0] || {
    bankName: "BCA (Bank Central Asia)",
    accountNumber: "8691-888-299",
    accountHolder: "PT. DSTECH SMART PERKASA",
    branch: "KCP Sudirman"
  };

  // Navigasi Tab Dokumen Terkait
  const encNo = encodeURIComponent(sale.invoiceNumber);
  const tabs = [
    { id: "invoice", label: "📄 Faktur Penjualan", active: docType === "invoice" },
    { id: "bast", label: "📝 Berita Acara (BAST)", active: docType === "bast" },
    { id: "delivery", label: "🚚 Surat Jalan", active: docType === "delivery" },
    { id: "photos", label: "📸 Dokumentasi Foto", active: docType === "photos" },
  ];

  // Render Dokumen Sesuai Permintaan
  let documentContent = "";
  let documentTitle = `Faktur Penjualan - ${sale.invoiceNumber}`;

  if (docType === "bast") {
    documentTitle = `BAST - ${sale.invoiceNumber}`;
    documentContent = `
      <!-- LEMBAR BAST -->
      <div class="text-center pb-6 border-b border-slate-300">
        <h2 class="text-lg font-black tracking-widest text-slate-900 uppercase">BERITA ACARA SERAH TERIMA PEKERJAAN</h2>
        <p class="text-xs font-bold text-slate-600 tracking-wider">Nomor: BAST/DST/${sale.invoiceNumber}</p>
        <p class="text-[11px] text-slate-500 mt-1">Lampiran Faktur: ${sale.invoiceNumber}</p>
      </div>

      <div class="py-6 space-y-4 text-xs leading-relaxed text-slate-700">
        <p>Pada hari ini, tanggal <strong>${sale.date}</strong>, telah dilaksanakan serah terima pekerjaan pengadaan dan instalasi perangkat teknologi keamanan &amp; infrastruktur IT dengan rincian pihak-pihak terkait sebagai berikut:</p>
        
        <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">PIHAK PERTAMA (Pelaksana):</span>
            <p class="font-black text-slate-900 mt-1">PT. DSTECH SMART PERKASA</p>
            <p class="text-slate-600">Solusi Security System &amp; IT Infrastructure</p>
            <p class="text-[11px] text-slate-500 mt-1">PIC: ${sale.salesPerson || "Tim Teknis DSTech"}</p>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">PIHAK KEDUA (Penerima):</span>
            <p class="font-black text-slate-900 mt-1">${sale.customerName}</p>
            <p class="text-slate-600">${sale.customerAddress || "Lokasi Klien"}</p>
            <p class="text-[11px] text-slate-500 mt-1">Telp: ${sale.customerPhone || "-"}</p>
          </div>
        </div>

        <p>PIHAK PERTAMA telah menyerahkan seluruh barang/pekerjaan yang tercantum dalam Faktur No. <strong>${sale.invoiceNumber}</strong> kepada PIHAK KEDUA dalam kondisi baik, lengkap, berfungsi normal, dan telah lolos uji coba operasional (User Acceptance Test) sebagai berikut:</p>

        <table class="w-full text-xs border border-slate-300 mt-3">
          <thead class="bg-slate-100 font-bold text-slate-800">
            <tr>
              <th class="border border-slate-300 p-2 text-center w-10">No</th>
              <th class="border border-slate-300 p-2 text-left">Deskripsi Barang / Jasa Instalasi</th>
              <th class="border border-slate-300 p-2 text-center w-16">Qty</th>
              <th class="border border-slate-300 p-2 text-center w-20">Satuan</th>
              <th class="border border-slate-300 p-2 text-center w-24">Kondisi Fisik</th>
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

        <p class="text-[11px] text-slate-500 italic mt-2">
          Catatan: Dengan ditandatanganinya Berita Acara ini, maka masa garansi teknis resmi DSTech Smart mulai berlaku terhitung sejak tanggal serah terima di atas.
        </p>

        <!-- Tanda Tangan BAST -->
        <div class="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-slate-200 text-center">
          <div>
            <span class="text-xs text-slate-500 block mb-1">PIHAK KEDUA (Penerima):</span>
            <span class="font-bold text-slate-800 block">${sale.customerName}</span>
            <div class="h-24 flex items-center justify-center border-b border-dashed border-slate-300">
              <span class="text-[10px] text-slate-300 italic">( Tanda Tangan &amp; Cap Klien )</span>
            </div>
            <p class="font-black text-slate-900 text-xs mt-2 underline">( .................................................... )</p>
            <p class="text-[10px] text-slate-500">Penanggung Jawab / PIC</p>
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
      </div>
    `;
  } else if (docType === "delivery") {
    documentTitle = `Surat Jalan - ${sale.invoiceNumber}`;
    documentContent = `
      <!-- LEMBAR SURAT JALAN (DELIVERY ORDER) -->
      <div class="text-center pb-6 border-b border-slate-300">
        <h2 class="text-lg font-black tracking-widest text-slate-900 uppercase">SURAT JALAN / DELIVERY ORDER</h2>
        <p class="text-xs font-bold text-slate-600 tracking-wider">Nomor: SJ/DST/${sale.invoiceNumber}</p>
        <p class="text-[11px] text-slate-500 mt-1">Ref Faktur: ${sale.invoiceNumber}</p>
      </div>

      <div class="py-6 space-y-4 text-xs leading-relaxed text-slate-700">
        <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">KIRIM DARI:</span>
            <p class="font-black text-slate-900 mt-1">Gudang Logistik PT. DSTech Smart Perkasa</p>
            <p class="text-slate-600">Kota Cilegon - Banten</p>
            <p class="text-[11px] text-slate-500 mt-1">Petugas: ${sale.salesPerson || "Admin Logistik"}</p>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">KIRIM KEPADA (Penerima):</span>
            <p class="font-black text-slate-900 mt-1">${sale.customerName}</p>
            <p class="text-slate-600">${sale.customerAddress || "Lokasi Pengiriman Klien"}</p>
            <p class="text-[11px] text-slate-500 mt-1">No. Kontak: ${sale.customerPhone || "-"}</p>
          </div>
        </div>

        <p class="text-xs text-slate-600">Mohon diterima barang-barang berikut dalam kondisi baik dan tersegel:</p>

        <table class="w-full text-xs border border-slate-300 mt-3">
          <thead class="bg-slate-100 font-bold text-slate-800">
            <tr>
              <th class="border border-slate-300 p-2 text-center w-10">No</th>
              <th class="border border-slate-300 p-2 text-left">Nama / Jenis Barang</th>
              <th class="border border-slate-300 p-2 text-center w-20">Kuantitas</th>
              <th class="border border-slate-300 p-2 text-center w-20">Satuan</th>
              <th class="border border-slate-300 p-2 text-left">Keterangan / Serial Number</th>
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
        <div class="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-slate-200 text-center">
          <div>
            <span class="text-[11px] text-slate-500 block mb-1">Gudang / Pengirim:</span>
            <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300">
              <span class="text-[9px] text-slate-400 italic">Petugas Gudang</span>
            </div>
            <p class="font-bold text-slate-900 text-[11px] mt-1.5 underline">( ${sale.salesPerson || "Staf Logistik"} )</p>
          </div>
          <div>
            <span class="text-[11px] text-slate-500 block mb-1">Pengemudi / Ekspedisi:</span>
            <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300">
              <span class="text-[9px] text-slate-400 italic">Supir / Ekspedisi</span>
            </div>
            <p class="font-bold text-slate-900 text-[11px] mt-1.5 underline">( ............................ )</p>
          </div>
          <div>
            <span class="text-[11px] text-slate-500 block mb-1">Diterima Oleh:</span>
            <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300">
              <span class="text-[9px] text-slate-400 italic">Cap &amp; Tanda Tangan</span>
            </div>
            <p class="font-bold text-slate-900 text-[11px] mt-1.5 underline">( ............................ )</p>
            <p class="text-[9px] text-slate-400">${sale.customerName}</p>
          </div>
        </div>
      </div>
    `;
  } else if (docType === "photos") {
    documentTitle = `Dokumentasi Foto - ${sale.invoiceNumber}`;
    const photos: any[] = sale.photos || [];
    documentContent = `
      <!-- LEMBAR DOKUMENTASI FOTO -->
      <div class="text-center pb-6 border-b border-slate-300">
        <h2 class="text-lg font-black tracking-widest text-slate-900 uppercase">LAPORAN FOTO DOKUMENTASI &amp; PERGANTIAN PART</h2>
        <p class="text-xs font-bold text-slate-600 tracking-wider">Lampiran Faktur No: ${sale.invoiceNumber}</p>
        <p class="text-[11px] text-slate-500 mt-1">Klien: ${sale.customerName} | Tanggal: ${sale.date}</p>
      </div>

      <div class="py-6 space-y-6 text-xs text-slate-700">
        ${photos.length === 0 ? `
          <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
            <span class="text-3xl block mb-2">📸</span>
            <p class="font-bold">Foto dokumentasi fisik pekerjaan telah terarsip secara digital di server.</p>
            <p class="text-[11px] mt-1">Silakan hubungi tim teknis DSTech untuk permintaan arsip foto beresolusi tinggi.</p>
          </div>
        ` : `
          <div class="grid grid-cols-2 gap-4">
            ${photos.map((photo: any, idx: number) => `
              <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-2xs">
                <div class="h-48 bg-slate-200 flex items-center justify-center overflow-hidden">
                  <img src="${photo.url || photo.photoUrl}" alt="${photo.title || 'Foto Pekerjaan'}" class="w-full h-full object-cover" />
                </div>
                <div class="p-3 space-y-1">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${photo.category === 'part_replacement' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}">
                    ${photo.category === 'part_replacement' ? '⚙️ Pergantian Part' : '📸 Dokumentasi Lapangan'}
                  </span>
                  <p class="font-bold text-slate-900 mt-1">${photo.title || `Foto Dokumentasi ${idx + 1}`}</p>
                  <p class="text-[11px] text-slate-500">${photo.description || photo.notes || '-'}</p>
                </div>
              </div>
            `).join("")}
          </div>
        `}

        <!-- Pengesahan Dokumentasi -->
        <div class="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-slate-200 text-center">
          <div>
            <span class="text-xs text-slate-500 block mb-1">Pihak Klien / Pengawas:</span>
            <span class="font-bold text-slate-800 block">${sale.customerName}</span>
            <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300">
              <span class="text-[10px] text-slate-300 italic">( Tanda Tangan &amp; Cap )</span>
            </div>
            <p class="font-black text-slate-900 text-xs mt-2 underline">( .................................................... )</p>
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
      </div>
    `;
  } else {
    // DEFAULT: FAKTUR PENJUALAN (INVOICE)
    const terbilangRupiah = angkaKeTerbilang(sale.grandTotal) + " Rupiah";
    documentContent = `
      <!-- LEMBAR FAKTUR PENJUALAN -->
      <div class="flex justify-between items-start pb-6 border-b border-slate-300">
        <div>
          <h2 class="text-xl font-black text-slate-900 tracking-wider uppercase">FAKTUR PENJUALAN</h2>
          <p class="text-xs font-mono font-bold text-indigo-700">NO: ${sale.invoiceNumber}</p>
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
      <div class="py-4 border-b border-slate-200 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">DITAGIHKAN KEPADA:</span>
          <p class="font-black text-slate-900 text-sm mt-0.5">${sale.customerName}</p>
          ${sale.customerPic ? `<p class="font-bold text-indigo-600">Up. ${sale.customerPic}</p>` : ''}
          <p class="text-slate-600 mt-1 leading-relaxed">${sale.customerAddress || 'Alamat Klien'}</p>
          <p class="text-slate-500 mt-0.5">Telp: ${sale.customerPhone || '-'}</p>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">DITERBITKAN OLEH:</span>
          <p class="font-black text-slate-900 text-sm mt-0.5">PT. DSTECH SMART PERKASA</p>
          <p class="text-slate-600 leading-relaxed">Jl. Raya Cilegon No. 18, Kota Cilegon - Banten</p>
          <p class="text-slate-500">Website: https://dstechsmart.com | Email: info@dstechsmart.com</p>
        </div>
      </div>

      <!-- Tabel Rincian Item -->
      <table class="w-full text-xs border border-slate-300 mt-4">
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
      <div class="grid grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-200 text-xs">
        <div class="space-y-3">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">TERBILANG:</span>
            <p class="font-bold italic text-slate-800 mt-1">"# ${terbilangRupiah} #"</p>
          </div>

          <div class="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-950 space-y-1">
            <span class="text-[10px] text-indigo-700 font-bold block uppercase tracking-wider">REKENING RESMI PEMBAYARAN TRANSFER:</span>
            <p class="font-bold text-xs">${defaultBank.bankName}</p>
            <p class="font-mono text-sm font-black text-indigo-900">${defaultBank.accountNumber}</p>
            <p class="text-[11px] text-indigo-800">a/n ${defaultBank.accountHolder} (${defaultBank.branch || 'Kantor Cabang'})</p>
          </div>
        </div>

        <div class="space-y-1.5 text-right">
          <div class="flex justify-between py-1 text-slate-600">
            <span>Subtotal:</span>
            <span class="font-bold text-slate-900">${formatRupiah(sale.subtotal)}</span>
          </div>
          ${sale.discount && sale.discount > 0 ? `
            <div class="flex justify-between py-1 text-red-600">
              <span>${sale.discountLabel || 'Diskon'}:</span>
              <span class="font-bold">-${formatRupiah(sale.discount)}</span>
            </div>
          ` : ''}
          ${sale.taxAmount && sale.taxAmount > 0 ? `
            <div class="flex justify-between py-1 text-slate-600">
              <span>PPN (${sale.taxRate || 11}%):</span>
              <span class="font-bold text-slate-900">${formatRupiah(sale.taxAmount)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between py-2 border-t-2 border-slate-800 text-base font-black text-slate-900">
            <span>Total Tagihan:</span>
            <span class="text-indigo-700">${formatRupiah(sale.grandTotal)}</span>
          </div>
          <div class="flex justify-between py-1 text-emerald-700 font-bold">
            <span>Sudah Dibayar:</span>
            <span>${formatRupiah(sale.paidAmount || 0)}</span>
          </div>
          <div class="flex justify-between py-1 text-amber-800 font-black border-t border-dashed border-slate-300">
            <span>Sisa Tagihan:</span>
            <span>${formatRupiah(sale.remainingAmount || 0)}</span>
          </div>
        </div>
      </div>

      <!-- Tanda Tangan & Cap Resmi -->
      <div class="grid grid-cols-2 gap-8 pt-6 mt-6 border-t border-slate-200 text-center">
        <div>
          <span class="text-[11px] text-slate-500 block mb-1">Penerima / Klien:</span>
          <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300">
            <span class="text-[10px] text-slate-300 italic">( Tanda Tangan &amp; Cap )</span>
          </div>
          <p class="font-bold text-slate-900 text-xs mt-1.5 underline">${sale.customerName}</p>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block mb-1">Hormat Kami,</span>
          <span class="font-bold text-slate-900 text-xs block">PT. DSTECH SMART PERKASA</span>
          <div class="h-20 flex items-center justify-center border-b border-dashed border-slate-300 relative">
            ${signatureImage ? `<img src="${signatureImage}" alt="Tanda Tangan" class="h-16 object-contain z-10" />` : ""}
            ${masterStampUrl ? `<img src="${masterStampUrl}" alt="Cap Resmi" class="h-16 opacity-75 absolute right-4" />` : ""}
          </div>
          <p class="font-black text-slate-900 text-xs mt-1.5 underline">( ${signerName} )</p>
          <p class="text-[10px] text-slate-500">${signerTitle}</p>
        </div>
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
      <style>
        @media print {
          body { background: white !important; padding: 0 !important; }
          .print-hidden { display: none !important; }
          .print-sheet {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
      </style>
    </head>
    <body class="bg-slate-100 text-slate-900 font-sans min-h-screen py-4 sm:py-8 px-2 sm:px-4">
      
      <!-- Top Action Toolbar (Layar saja, print:hidden) -->
      <div class="max-w-4xl mx-auto mb-4 bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex flex-wrap items-center justify-between gap-3 print-hidden">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow">
            DST
          </div>
          <div>
            <h1 class="font-black text-sm sm:text-base text-slate-900">${documentTitle}</h1>
            <p class="text-[11px] text-slate-500">PT. DSTech Smart Perkasa • Portal Dokumen Resmi</p>
          </div>
        </div>

        <!-- Tombol Aksi Cepat Cetak & Download -->
        <div class="flex items-center gap-2">
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

      <!-- Tab Navigasi Dokumen Terkait (Faktur, BAST, Surat Jalan, Foto) -->
      <div class="max-w-4xl mx-auto mb-4 flex items-center gap-2 overflow-x-auto pb-1 print-hidden">
        ${tabs.map((tab) => `
          <a
            href="?doc=${tab.id}&no=${encNo}"
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

      <!-- LEMBAR DOKUMEN FISIK A4 -->
      <div
        id="print-sheet-document"
        class="print-sheet max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative"
      >
        <!-- Kop Surat Resmi Gambar (Jika diaktifkan) -->
        ${letterheadEnabled ? `
          <div class="w-full">
            <img
              src="${letterheadUrl}"
              alt="Kop Surat Resmi PT. DSTech Smart Perkasa"
              class="w-full object-cover max-h-36"
            />
          </div>
        ` : `
          <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
              <h2 class="font-black text-base text-slate-900">PT. DSTECH SMART PERKASA</h2>
              <p class="text-xs text-slate-500">Security System, Access Control &amp; IT Infrastructure Solutions</p>
            </div>
            <div class="text-right text-xs text-slate-500 font-mono">
              OFFICIAL DOCUMENT
            </div>
          </div>
        `}

        <!-- Isi Dokumen -->
        <div class="p-6 sm:p-10 space-y-4">
          ${documentContent}
        </div>

        <!-- Footer Hak Cipta -->
        <div class="p-4 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400">
          Dokumen ini diterbitkan secara sah melalui sistem Enterprise ERP PT. DSTech Smart Perkasa. Verifikasi: ${sale.verificationCode || sale.id}
        </div>
      </div>

      <script>
        function downloadAsPdf() {
          const element = document.getElementById('print-sheet-document');
          const opt = {
            margin:       0.3,
            filename:     '${documentTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
          };
          html2pdf().set(opt).from(element).save();
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
}
