import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "dstech_settings.json");
const CRM_FILE = path.join(process.cwd(), "src", "data", "dstech_crm.json");

function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
      return data;
    }
  } catch (e) {}
  return {
    whatsapp: "6282259494242",
    whatsappSales: "6282259494242",
    whatsappTechnical: "6282259494242",
    whatsappComplaint: "6282259494242"
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, visitorInfo } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ success: false, error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const settings = getSettings();
    const cleanMainWa = (settings.whatsapp || "6282259494242").replace(/\D/g, "");
    const waSales = (settings.whatsappSales || cleanMainWa).replace(/\D/g, "") || cleanMainWa;
    const waTechnical = (settings.whatsappTechnical || cleanMainWa).replace(/\D/g, "") || cleanMainWa;
    const waComplaint = (settings.whatsappComplaint || cleanMainWa).replace(/\D/g, "") || cleanMainWa;

    // Deteksi tipe portal dan identitas internal
    const rawPath = (visitorInfo?.currentPath || "").toLowerCase();
    const portalType: "SUPERADMIN" | "ADMIN" | "EMPLOYEE" | "PARTNER" | "PUBLIC" = 
      visitorInfo?.portalType || 
      (rawPath.startsWith("/superadmin") ? "SUPERADMIN" :
       rawPath.startsWith("/admin") ? "ADMIN" :
       rawPath.startsWith("/employee") ? "EMPLOYEE" :
       rawPath.startsWith("/affiliate") ? "PARTNER" : "PUBLIC");

    const isInternalUser = portalType === "SUPERADMIN" || portalType === "ADMIN" || portalType === "EMPLOYEE";
    const userName = visitorInfo?.name ? visitorInfo.name.split(" ")[0] : "";

    // Panggil Engine AI Screening & Qualification di SmartPro WA Gateway jika ada
    const SMARTPRO_URL = process.env.SMARTPRO_API_URL || "https://smartpro.dstechsmart.com";
    let aiResponseData: any = null;

    try {
      const resSmartPro = await fetch(`${SMARTPRO_URL}/api/external/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.LICENSE_MASTER_KEY || "DSTECH-MASTER-PRO-2026",
          message: message.trim(),
          history: Array.isArray(history) ? history.slice(-8) : [],
          portalType: portalType,
          isInternalUser: isInternalUser,
          visitorInfo: {
            ...visitorInfo,
            portalType,
            isInternalUser,
          },
          companyProfile: {
            companyName: settings.companyName || "PT. DSTech Smart Perkasa",
            address: settings.address || "PERUM BUKIT CILEGON ASRI BLOK DB NO. 19, KEL. BAGENDUNG, KEC. CILEGON, KOTA CILEGON - BANTEN",
            googleMapsUrl: settings.googleMapsUrl || "https://maps.google.com/?q=Perum+Bukit+Cilegon+Asri+Cilegon+Banten",
            serviceArea: settings.serviceArea || "Banten (Cilegon, Serang, Tangerang), Jabodetabek, dan Seluruh Wilayah Indonesia (Nasional)",
            whatsapp: settings.whatsappDisplay || "+62 822-5949-4242",
            email: settings.email || "cs@dstechsmart.com"
          }
        }),
        signal: AbortSignal.timeout(18000)
      });

      if (resSmartPro.ok) {
        const json = await resSmartPro.json();
        if (json.success && json.data) {
          aiResponseData = json.data;
        }
      }
    } catch (err: any) {
      console.warn("[DSTech Chat API] SmartPro AI unreachable or timeout:", err?.message);
    }

    // Engine Cerdas Penanganan Peran Lokal (Role-Aware Local Copilot Engine)
    if (!aiResponseData) {
      const lower = message.toLowerCase();

      // ==========================================
      // KASUS 1: PORTAL SUPERADMIN & ADMIN (ERP COPILOT)
      // ==========================================
      if (portalType === "SUPERADMIN" || portalType === "ADMIN") {
        let reply = "";
        const quickReplies = [
          "📄 Cara Buat Faktur Baru",
          "📝 Cara Terbitkan SPH",
          "📦 Cara Input Produk & Stok",
          "🛒 Cara Atur E-Store Hero",
          "💰 Panduan Buku Arus Kas"
        ];

        if (lower.includes("faktur") || lower.includes("invoice") || lower.includes("tagihan") || lower.includes("termin")) {
          reply = `Halo ${userName ? `Pak/Bu ${userName}` : "Admin"}! Berikut langkah mudah membuat Faktur Penjualan di sistem ERP:\n\n` +
                  `1. Buka menu Keuangan (/admin/finance) ➔ Tab "Penjualan & Faktur".\n` +
                  `2. Klik tombol "+ Terbitkan Faktur Baru" di pojok kanan atas.\n` +
                  `3. Pilih Klien dari Master Klien (otomatis isi alamat & kontak) atau ketik manual.\n` +
                  `4. Tentukan Entitas Bisnis (PT. DSTech / Usaha Mandiri Non-PT) dan pilih Titik Gudang Logistik.\n` +
                  `5. Tambah item barang: Klik tombol "📦 Pilih dari List / Master" untuk memilih produk dari katalog dengan auto-fill harga & ketersediaan stok riil.\n` +
                  `6. Tentukan skema pembayaran (Lunas, Uang Muka DP, atau Multi-Termin bertahap 30-40-30 dsb.) dan tarif PPN (11%, 12%, atau Bebas PPN 0%).\n` +
                  `7. Klik "Simpan Faktur". Dokumen otomatis memiliki nomor INV resmi, QR barcode verifikasi, dan siap dicetak standar A4 (2 halaman) atau dibagikan link publik ber-PIN via WhatsApp/Email.`;
        } else if (lower.includes("sph") || lower.includes("penawaran") || lower.includes("quotation") || lower.includes("prospek")) {
          reply = `Halo ${userName ? `Pak/Bu ${userName}` : "Admin"}! Berikut cara menerbitkan Surat Penawaran Harga (SPH):\n\n` +
                  `1. Masuk ke Keuangan (/admin/finance) ➔ Tab "Penawaran (SPH)".\n` +
                  `2. Klik tombol "+ Terbitkan SPH Baru".\n` +
                  `3. Pilih Klien sasaran dan masa berlaku penawaran (validUntil).\n` +
                  `4. Masukkan rincian produk, spesifikasi teknis, harga, dan ketentuan garansi.\n` +
                  `5. Simpan. SPH akan terbit lengkap dengan Kop Surat resmi, pengesahan direksi, dan paraf di setiap halaman lampiran.\n` +
                  `6. Jika penawaran disetujui klien, Anda bisa langsung mengonversinya menjadi Proyek Baru atau Faktur Penjualan dengan 1-klik (tombol "🚀 Jadikan Proyek Baru" atau "⚡ Konversi Faktur").`;
        } else if (lower.includes("produk") || lower.includes("katalog") || lower.includes("stok") || lower.includes("barang")) {
          reply = `Halo ${userName ? `Pak/Bu ${userName}` : "Admin"}! Berikut cara mengelola Master Produk & Stok:\n\n` +
                  `1. Buka menu Produk (/admin/products atau /superadmin/products).\n` +
                  `2. Klik "+ Tambah Produk".\n` +
                  `3. Isi Nama Produk, Kategori (CCTV, Smart Home, Barrier Gate, dsb.), Harga Modal, Harga Jual, dan Stok Gudang.\n` +
                  `4. Unggah foto produk resmi (sistem akan menyimpan dengan prefix aman dstech_img_).\n` +
                  `5. Klik "Simpan Produk". Produk langsung otomatis tersinkronisasi ke katalog marketplace toko online (/shop) dan muncul di pilihan Faktur/SPH.`;
        } else if (lower.includes("estore") || lower.includes("e-store") || lower.includes("hero") || lower.includes("banner") || lower.includes("toko online") || lower.includes("background")) {
          reply = `Halo ${userName ? `Pak/Bu ${userName}` : "Admin"}! Untuk mengatur Banner Hero & Produk Unggulan E-Store:\n\n` +
                  `1. Buka menu Pengaturan Sistem (/admin/settings).\n` +
                  `2. Pilih Tab "🛒 Pengaturan E-Store & Hero Showcase".\n` +
                  `3. Pada Bagian 1: Pilih mode latar belakang (Gradient Modern, Dark Minimalist, Deep Cyber Navy, atau Upload Gambar Kustom / Banner URL + slider opasitas gelap).\n` +
                  `4. Pada Bagian 2: Anda dapat mengganti Teks Judul Hero, Teks Highlight Biru, Subjudul Promo, dan Durasi Auto-Play slide (4s/6s/8s/10s).\n` +
                  `5. Pada Bagian 3: Klik tombol "+ Tambah Produk ke Hero" untuk memilih produk langsung dari katalog master. Anda bisa mengatur badge promo (Best Seller, Hot Deal), geser urutan slide naik/turun, atau hapus slide.\n` +
                  `6. Klik "Simpan Semua Pengaturan". Perubahan langsung aktif di halaman /shop.`;
        } else if (lower.includes("kas") || lower.includes("cash") || lower.includes("arus kas") || lower.includes("rekening") || lower.includes("bank")) {
          reply = `Halo ${userName ? `Pak/Bu ${userName}` : "Admin"}! Berikut panduan pencatatan Buku Arus Kas & Rekening:\n\n` +
                  `1. Masuk ke Keuangan (/admin/finance) ➔ Tab "Buku Arus Kas".\n` +
                  `2. Klik tombol "+ Catat Arus Kas Masuk/Keluar".\n` +
                  `3. Pilih Jenis Transaksi: Kas Masuk (IN) untuk penerimaan piutang/penjualan, atau Kas Keluar (OUT) untuk beban operasional/logistik.\n` +
                  `4. Pilih Entitas Bisnis dan Rekening Bank Resmi tujuan (BCA PT, Mandiri, atau Kas Tunai).\n` +
                  `5. Masukkan nominal rupiah, tanggal transaksi, deskripsi keterangan, dan upload foto bukti nota/kuitansi.\n` +
                  `6. Untuk mengatur daftar nomor rekening resmi perusahaan, klik tombol "⚙️ Atur Rekening Resmi" di modal arus kas.`;
        } else if (lower.includes("po") || lower.includes("purchase order") || lower.includes("beli") || lower.includes("supplier") || lower.includes("vendor")) {
          reply = `Halo ${userName ? `Pak/Bu ${userName}` : "Admin"}! Untuk menerbitkan Purchase Order (PO) ke Supplier:\n\n` +
                  `1. Buka Keuangan (/admin/finance) ➔ Tab "Pembelian & PO Supplier".\n` +
                  `2. Klik "+ Buat Purchase Order".\n` +
                  `3. Pilih Vendor dari Master Supplier (atau tambah supplier baru).\n` +
                  `4. Masukkan item barang belanja pengadaan, tentukan termin dan pajak PPN.\n` +
                  `5. Simpan PO. Anda dapat mencetak lembar resmi PO A4 ber-Kop Surat atau melakukan otorisasi Approval Tanda Tangan Digital Direksi (Canvas Pad).`;
        } else if (lower.includes("absen") || lower.includes("presensi") || lower.includes("karyawan") || lower.includes("cuti")) {
          reply = `Halo ${userName ? `Pak/Bu ${userName}` : "Admin"}! Berikut pengelolaan Presensi & Karyawan:\n\n` +
                  `1. Presensi Mandiri Admin: Di halaman Dashboard Utama (/admin), gunakan kartu "Presensi Mandiri" untuk Check-In / Check-Out dengan kamera selfie live WebRTC & GPS satelit.\n` +
                  `2. Rekap Presensi Tim: Buka menu Presensi (/admin/attendance) untuk melihat log jam kerja, lokasi maps presensi, dan persetujuan lembur teknisi.\n` +
                  `3. Kontrak & Data Karyawan: Buka menu Kontrak Kerja (/admin/contracts) untuk input PKWT, upload foto diri & KTP, pengaturan kuota cuti tahunan, divisi, dan masa kontrak.`;
        } else {
          reply = `Halo ${userName ? `Pak/Bu ${userName}` : "Superadmin / Admin DSTech"}! Saya Dani, Copilot AI Sistem ERP PT. DSTech Smart Perkasa. 🛡️\n\n` +
                  `Sebagai rekan pengelola sistem, saya siap memandu Anda cara pemakaian aplikasi, antara lain:\n` +
                  `• Cara buat Faktur Penjualan, SPH Penawaran, & PO Supplier\n` +
                  `• Cara input produk, kategori, dan stok gudang logistik\n` +
                  `• Cara atur Banner Hero & Promo Toko Online (E-Store)\n` +
                  `• Cara catat pembukuan kas masuk/keluar & laporan laba rugi (P&L)\n` +
                  `• Panduan presensi GPS selfie, kontrak PKWT, dan pengaturan sistem\n\n` +
                  `Silakan ketik modul atau formulir apa yang ingin Anda pelajari langkah penggunaannya!`;
        }

        aiResponseData = {
          reply,
          department: "TECHNICAL",
          department_label: "Copilot Operasional Sistem ERP",
          client_name: userName || "Admin DSTech",
          client_phone: null,
          ready_for_handover: false,
          handover_reason: null,
          handover_summary: null,
          matched_products: [],
          quick_replies: quickReplies
        };

      // ==========================================
      // KASUS 2: PORTAL KARYAWAN & TEKNISI (FIELD OPS GUIDE)
      // ==========================================
      } else if (portalType === "EMPLOYEE") {
        let reply = "";
        const quickReplies = [
          "📍 Cara Absen GPS & Selfie",
          "📦 Cara Ambil Material Gudang",
          "🔄 Cara Konversi Roll ke Meter",
          "📋 Lapor Progres Tugas",
          "🛡️ SOP Pemasangan CCTV & K3"
        ];

        if (lower.includes("absen") || lower.includes("presensi") || lower.includes("checkin") || lower.includes("gps") || lower.includes("selfie")) {
          reply = `Halo Rekan Teknisi! Berikut panduan Absensi Harian di portal /employee:\n\n` +
                  `1. Buka kartu "Presensi Hari Ini" di bagian atas portal.\n` +
                  `2. Klik tombol "Check-In (Masuk)" saat mulai kerja, atau "Check-Out (Pulang)" saat selesai tugas.\n` +
                  `3. Izinkan akses Kamera dan Lokasi GPS perangkat Anda.\n` +
                  `4. Peta radar satelit otomatis mendeteksi koordinat Anda. Arahkan kamera dan klik "Jepret Foto Selfie Wajah".\n` +
                  `5. Klik "Simpan Presensi". Jam hadir dan peta lokasi langsung tercatat resmi di database pusat.`;
        } else if (lower.includes("material") || lower.includes("ambil") || lower.includes("gudang") || lower.includes("kabel") || lower.includes("stok")) {
          reply = `Halo Rekan Teknisi! Berikut cara Pengajuan Pengambilan Material Lapangan:\n\n` +
                  `1. Pada portal /employee, buka modal "Permohonan Pengambilan Material".\n` +
                  `2. Pilih Proyek / Surat Tugas aktif yang sedang Anda kerjakan.\n` +
                  `3. Pilih barang yang dibutuhkan langsung dari daftar stok gudang aktif (nama, kode, dan sisa stok tampil otomatis).\n` +
                  `4. Anda dapat mengambil multi-item sekaligus (+ Tambah Baris Barang).\n` +
                  `5. Jika barang memiliki opsi konversi (seperti Kabel Roll ⇄ Meter), Anda bisa memilih mengambil dalam satuan meter eceran maupun roll utuh. Sistem otomatis mengkalkulasi pengurangannya.\n` +
                  `6. Klik "Kirim Permohonan". Tim logistik gudang akan segera menyiapkan material Anda.`;
        } else if (lower.includes("konversi") || lower.includes("roll") || lower.includes("meter") || lower.includes("kalkulator")) {
          reply = `Halo Rekan Teknisi! Untuk konversi satuan material lapangan:\n\n` +
                  `• 1 Roll Kabel UTP LAN standar = 305 Meter.\n` +
                  `• 1 Dus Konektor RJ45 standar = 50 Pcs atau 100 Pcs.\n` +
                  `• Anda dapat menggunakan widget "Kalkulator Konversi Satuan Lapangan" di portal /employee untuk menghitung cepat kebutuhan kabel eceran ke roll secara presisi tanpa takut salah hitung.`;
        } else if (lower.includes("sop") || lower.includes("k3") || lower.includes("cctv") || lower.includes("pasang") || lower.includes("panduan")) {
          reply = `Halo Rekan Teknisi! Berikut poin penting SOP & K3 Teknisi DSTech:\n\n` +
                  `1. Selalu gunakan perlengkapan K3 (Helm proyek, rompi, sepatu safety, dan sabuk pengaman bila bekerja di ketinggian > 2 meter).\n` +
                  `2. Instalasi CCTV: Pastikan jalur kabel tidak berdekatan dengan kabel listrik tegangan tinggi (minimal jarak 15 cm) untuk menghindari induksi nois.\n` +
                  `3. Gunakan konektor DC waterproof dan box junction pelindung luar ruangan.\n` +
                  `4. Pastikan grounding DVR/NVR dan switch terpasang baik untuk melindungi perangkat dari lonjakan petir.\n` +
                  `5. Panduan SOP lengkap dan diagram instalasi dapat Anda buka kapan saja di menu "Pusat Panduan SOP & KMS" portal /employee.`;
        } else {
          reply = `Halo Rekan Tim Lapangan ${userName ? userName : "DSTech"}! Saya Asisten AI Khusus Portal Karyawan & Teknisi. 🛠️\n\n` +
                  `Saya siap mendampingi operasional kerja Anda di lapangan:\n` +
                  `• Panduan absensi masuk/pulang via GPS satelit & kamera selfie live\n` +
                  `• Tata cara pengajuan material gudang & rumus konversi satuan\n` +
                  `• Panduan update status penugasan proyek & pelaporan kendala\n` +
                  `• Standar K3 dan SOP instalasi teknis perangkat DSTech\n\n` +
                  `Silakan tanyakan panduan tugas apa yang sedang Anda butuhkan!`;
        }

        aiResponseData = {
          reply,
          department: "TECHNICAL",
          department_label: "Asisten Operasional Teknisi Lapangan",
          client_name: userName || "Teknisi DSTech",
          client_phone: null,
          ready_for_handover: false,
          handover_reason: null,
          handover_summary: null,
          matched_products: [],
          quick_replies: quickReplies
        };

      // ==========================================
      // KASUS 3: PORTAL MITRA AFILIASI (PARTNER GUIDE)
      // ==========================================
      } else if (portalType === "PARTNER") {
        let reply = "";
        const quickReplies = [
          "🔗 Cara Sebar Link Referral",
          "💰 Skema Komisi Mitra",
          "📥 Unduh Materi Promosi",
          "💳 Syarat Penarikan Komisi"
        ];

        if (lower.includes("referral") || lower.includes("link") || lower.includes("kode") || lower.includes("sebar")) {
          reply = `Halo Mitra Resmi DSTech! Berikut cara memanfaatkan Link Referral Anda:\n\n` +
                  `1. Masuk ke Dashboard Mitra (/affiliate).\n` +
                  `2. Di kartu profil mitra, klik tombol "Salin Link Referral" (format: dstechsmart.com/ref/KODE_ANDA).\n` +
                  `3. Bagikan link tersebut ke relasi, grup WhatsApp, media sosial, atau calon klien yang membutuhkan CCTV / Smart Home.\n` +
                  `4. Setiap kali pengunjung membuka link Anda dan melakukan pemesanan, transaksi otomatis tercatat atas nama referral Anda.`;
        } else if (lower.includes("komisi") || lower.includes("persen") || lower.includes("bonus") || lower.includes("cair") || lower.includes("tarik")) {
          reply = `Halo Mitra Resmi DSTech! Mengenai Komisi Kemitraan:\n\n` +
                  `• Komisi dihitung otomatis dari total nilai transaksi bersih yang berhasil lunas dan terverifikasi oleh finance DSTech.\n` +
                  `• Anda dapat memantau status komisi (Pending, Disetujui, Dicairkan) secara transparan pada tabel Riwayat Komisi di /affiliate.\n` +
                  `• Penarikan komisi dapat diajukan langsung ke nomor rekening terdaftar Anda setelah mencapai batas minimum penarikan Rp 100.000.`;
        } else if (lower.includes("materi") || lower.includes("katalog") || lower.includes("brosur") || lower.includes("banner")) {
          reply = `Halo Mitra Resmi DSTech! Untuk materi promosi:\n\n` +
                  `Buka bagian "Materi Promosi & Unduh Katalog" di portal /affiliate. Anda dapat mengunduh E-Katalog PDF resmi, brosur spesifikasi produk resolusi tinggi, dan banner siap pakai untuk status WhatsApp atau media sosial Anda.`;
        } else {
          reply = `Halo Mitra Resmi ${userName ? userName : "DSTech"}! Saya Asisten AI Program Kemitraan Afiliasi DSTech Smart. 🤝\n\n` +
                  `Saya siap membantu Anda memaksimalkan potensi penghasilan kemitraan:\n` +
                  `• Panduan mendapatkan & menyebarkan tautan referral\n` +
                  `• Penjelasan skema komisi & reward pencapaian penjualan\n` +
                  `• Akses unduh materi promosi & brosur katalog resmi\n` +
                  `• Informasi cara pencairan saldo komisi ke rekening bank Anda\n\n` +
                  `Ada yang ingin Anda tanyakan seputar program kemitraan kami?`;
        }

        aiResponseData = {
          reply,
          department: "SALES",
          department_label: "Pemandu Sukses Mitra Afiliasi",
          client_name: userName || "Mitra DSTech",
          client_phone: null,
          ready_for_handover: false,
          handover_reason: null,
          handover_summary: null,
          matched_products: [],
          quick_replies: quickReplies
        };

      // ==========================================
      // KASUS 4: PENGUNJUNG PUBLIK / CALON KLIEN (SALES CONSULTANT)
      // ==========================================
      } else {
        let dept = "SALES";
        let deptLabel = "Tim Support Sales & Penawaran";
        let isReady = false;

        if (lower.includes("rusak") || lower.includes("mati") || lower.includes("kendala") || lower.includes("servis") || lower.includes("bantuan") || lower.includes("error") || lower.includes("macet") || lower.includes("teknisi")) {
          dept = "TECHNICAL";
          deptLabel = "Tim Teknikal Maintenance";
          isReady = lower.includes("teknisi") || lower.includes("tolong") || lower.includes("segera");
        } else if (lower.includes("komplain") || lower.includes("komplen") || lower.includes("retur") || lower.includes("refund") || lower.includes("pesanan") || lower.includes("salah kirim") || lower.includes("belum sampai")) {
          dept = "COMPLAINT";
          deptLabel = "Tim Penanganan Komplain";
          isReady = lower.includes("pesanan") || lower.includes("retur") || lower.includes("komplain");
        } else if (lower.includes("beli") || lower.includes("pasang") || lower.includes("harga") || lower.includes("sph") || lower.includes("penawaran") || lower.includes("cctv") || lower.includes("gate")) {
          dept = "SALES";
          deptLabel = "Tim Support Sales & Penawaran";
          isReady = lower.includes("cilegon") || lower.includes("serang") || lower.includes("titik") || lower.includes("paket");
        }

        // Personalisasi berbasis geolokasi & halaman aktif pengunjung
        const locText = visitorInfo?.city ? ` untuk area ${visitorInfo.city}${visitorInfo.region ? `, ${visitorInfo.region}` : ""}` : "";
        const pageText = visitorInfo?.currentPath && visitorInfo.currentPath !== "/" ? ` (terkait halaman ${visitorInfo.currentPath})` : "";

        aiResponseData = {
          reply: `Halo! Saya Dani, Asisten Virtual AI PT. DSTech Smart Perkasa. Terkait kebutuhan Anda mengenai "${message}"${locText}${pageText}, kami siap membantu dengan solusi terbaik. Boleh kami tahu nama dan detail spesifik yang Anda butuhkan agar kami bisa siapkan rekomendasi terbaik?`,
          department: dept,
          department_label: deptLabel,
          client_name: visitorInfo?.name || null,
          client_phone: visitorInfo?.phone || null,
          ready_for_handover: isReady,
          handover_reason: isReady ? "Klien membutuhkan tindak lanjut langsung dari tim terkait." : null,
          handover_summary: `Halo ${deptLabel} PT. DSTech Smart Perkasa,\nSaya ingin konsultasi lanjutan mengenai: "${message}".\n[Info Pengunjung: Kota ${visitorInfo?.city || "Indonesia"}, Halaman: ${visitorInfo?.currentPath || "/"}]\nMohon dibantu. Terima kasih!`,
          matched_products: [],
          quick_replies: ["📹 Rekomendasi Paket CCTV", "🚪 Solusi Smart Home", "🚧 Barrier Gate Otomatis", "🛠️ Bantuan Servis Teknis"]
        };
      }
    }

    // Tentukan Nomor WhatsApp Tim Berdasarkan Kategori Departemen (khusus portal publik)
    let targetPhone = waSales;
    if (aiResponseData.department === "TECHNICAL") {
      targetPhone = waTechnical;
    } else if (aiResponseData.department === "COMPLAINT") {
      targetPhone = waComplaint;
    }

    // Susun Link WhatsApp Resmi Handover
    const summaryText = aiResponseData.handover_summary || 
      `Halo ${aiResponseData.department_label} PT. DSTech Smart Perkasa,\nSaya berkonsultasi via AI Website dstechsmart.com mengenai:\n"${message}".\n[Lokasi: ${visitorInfo?.city || "Indonesia"} | Halaman: ${visitorInfo?.currentPath || "/"}]\nMohon bantuannya. Terima kasih!`;

    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(summaryText)}`;

    // Auto-Capture ke CRM HANYA untuk pengunjung publik (JANGAN simpan Superadmin/Admin/Teknisi sebagai prospek pembeli!)
    if (!isInternalUser && (aiResponseData.client_phone || visitorInfo?.phone) && fs.existsSync(CRM_FILE)) {
      try {
        const phone = (aiResponseData.client_phone || visitorInfo?.phone || "").replace(/\D/g, "");
        if (phone.length >= 8) {
          const rawCrm = fs.readFileSync(CRM_FILE, "utf-8");
          const crmData = JSON.parse(rawCrm);
          const leads = Array.isArray(crmData) ? crmData : (Array.isArray(crmData.leads) ? crmData.leads : []);
          
          const existingIdx = leads.findIndex((l: any) => (l.phone || "").replace(/\D/g, "") === phone);
          const newLead = {
            id: existingIdx >= 0 ? leads[existingIdx].id : `dstech_crm_lead_${Date.now()}`,
            leadNumber: existingIdx >= 0 ? leads[existingIdx].leadNumber : `LEAD-DST-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(leads.length + 1).padStart(3, "0")}`,
            clientName: aiResponseData.client_name || visitorInfo?.name || "Klien Web AI Chat",
            company: visitorInfo?.company || (visitorInfo?.city ? `Klien Asal ${visitorInfo.city}` : "Perorangan / Bisnis"),
            position: "Client",
            phone: phone,
            email: visitorInfo?.email || "",
            category: aiResponseData.department === "SALES" ? "B2B Industri" : (aiResponseData.department === "TECHNICAL" ? "Maintenance" : "After-Sales"),
            projectTitle: `[AI Chat] ${message.slice(0, 80)}`,
            estimatedValue: aiResponseData.department === "SALES" ? 5000000 : 0,
            stage: "DISCOVERY",
            probability: 50,
            source: `Website AI Live Chat (${visitorInfo?.city || "Online"})`,
            assignedTo: "RAMADHANI ST",
            notes: `[Lokasi: ${visitorInfo?.city || "Area Banten"}, Halaman: ${visitorInfo?.currentPath || "/"}] [Departemen: ${aiResponseData.department_label}] Diagnosa AI: ${aiResponseData.handover_reason || "Percakapan awal via website"}. Ringkasan: ${summaryText}`,
            updatedAt: new Date().toISOString()
          };

          if (existingIdx >= 0) {
            leads[existingIdx] = { ...leads[existingIdx], ...newLead };
          } else {
            leads.unshift({ ...newLead, createdAt: new Date().toISOString(), activities: [] });
          }

          if (Array.isArray(crmData)) {
            fs.writeFileSync(CRM_FILE, JSON.stringify(leads, null, 2), "utf-8");
          } else {
            crmData.leads = leads;
            fs.writeFileSync(CRM_FILE, JSON.stringify(crmData, null, 2), "utf-8");
          }
        }
      } catch (crmErr) {
        console.warn("[DSTech Chat API] Auto-capture CRM warning:", crmErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...aiResponseData,
        target_whatsapp_number: targetPhone,
        whatsapp_url: whatsappUrl
      }
    });
  } catch (error: any) {
    console.error("[DSTech Chat API] Error:", error);
    return NextResponse.json({ success: false, error: "Gagal memproses pesan: " + error.message }, { status: 500 });
  }
}
