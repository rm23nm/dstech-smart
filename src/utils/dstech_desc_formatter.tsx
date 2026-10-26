import React from "react";

/**
 * Parsing data clipboard HTML (misalnya saat copy tabel/list dari Gemini, ChatGPT, Word, Excel)
 * Mengubah struktur tabel HTML menjadi format teks terstruktur: • Parameter: Nilai\n
 */
export function parseHtmlClipboard(html: string): string | null {
  if (typeof window === "undefined" || !html) return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const tables = doc.querySelectorAll("table");
    const lists = doc.querySelectorAll("ul, ol");
    if (tables.length === 0 && lists.length === 0) return null;

    // Ubah tabel menjadi baris-baris spesifikasi
    tables.forEach((table) => {
      const rows = Array.from(table.querySelectorAll("tr"));
      const formattedLines: string[] = [];
      rows.forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll("th, td")).map((td) =>
          (td.textContent || "").trim()
        );
        if (cells.length === 2 && cells[0] && cells[1]) {
          const c0Lower = cells[0].toLowerCase();
          if (c0Lower.includes("parameter") || c0Lower.includes("komponen")) {
            formattedLines.push("\n📌 SPESIFIKASI TEKNIS:");
          } else {
            formattedLines.push(`• ${cells[0]}: ${cells[1]}`);
          }
        } else if (cells.length > 0) {
          formattedLines.push(`• ${cells.filter(Boolean).join(" - ")}`);
        }
      });
      const replacement = doc.createTextNode("\n" + formattedLines.join("\n") + "\n");
      table.parentNode?.replaceChild(replacement, table);
    });

    // Ubah list items
    doc.querySelectorAll("li").forEach((li) => {
      const text = (li.textContent || "").trim();
      if (text) {
        const node = doc.createTextNode(`\n• ${text}`);
        li.parentNode?.replaceChild(node, li);
      }
    });

    // Berikan jeda baris pada blok teks
    doc.querySelectorAll("p, h1, h2, h3, h4, div").forEach((b) => {
      const text = (b.textContent || "").trim();
      if (text) {
        b.textContent = text + "\n";
      }
    });

    return (doc.body.textContent || "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch {
    return null;
  }
}

/**
 * Merapikan teks deskripsi mentah (termasuk jika sebelumnya terlanjur di-paste menyatu tanpa enter)
 */
export function cleanDescriptionText(text: string): string {
  if (!text) return "";
  let cleaned = text;

  // 1. Jika teks mengandung tab (format copy tabel plain text: Col1\tCol2\n)
  if (cleaned.includes("\t")) {
    cleaned = cleaned
      .split("\n")
      .map((line) => {
        const parts = line.split("\t").map((p) => p.trim()).filter(Boolean);
        if (parts.length === 2) {
          if (
            parts[0].toLowerCase().includes("parameter") ||
            parts[0].toLowerCase().includes("komponen")
          ) {
            return `\n📌 SPESIFIKASI TEKNIS:`;
          }
          return `• ${parts[0]}: ${parts[1]}`;
        } else if (parts.length > 2) {
          return `• ${parts.join(" - ")}`;
        }
        return line;
      })
      .join("\n");
  }

  // 2. Daftar kata kunci spesifikasi umum di industri perangkat keamanan & IT
  const headers = [
    "Komponen / Parameter",
    "Spesifikasi Detail",
    "Spesifikasi Teknis",
    "Spesifikasi Lengkap",
    "Fitur & Kompatibilitas",
    "Kelengkapan Paket",
    "Paket Termasuk",
  ];

  const specKeys = [
    "Dimensi Housing / Bodi",
    "Dimensi Housing",
    "Tegangan Operasional",
    "Waktu Buka / Tutup",
    "Waktu Buka/Tutup",
    "Kelembapan Relatif",
    "Kelembaban Relatif",
    "Suhu Kerja (Operasional)",
    "Suhu Operasional",
    "Suhu Kerja",
    "Panjang Palang",
    "Material Casing",
    "Konsumsi Daya",
    "Indikator LED",
    "Warna Casing",
    "Berat Total",
    "Tipe Palang",
    "Daya Motor",
    "Model",
    "Material",
    "Tegangan",
    "Dimensi",
    "Warna",
    "Berat",
    "Garansi",
  ];

  const newlineCount = (cleaned.match(/\n/g) || []).length;
  // Jika teks padat dan minim baris baru (< 3 enter)
  if (newlineCount < 3) {
    const headerRegex = new RegExp(
      `(?<!\n)(${headers.map((h) => h.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})`,
      "g"
    );
    cleaned = cleaned.replace(headerRegex, "\n\n📌 $1:\n");

    const specRegex = new RegExp(
      `(?<!\n)(${specKeys.map((k) => k.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})`,
      "g"
    );
    cleaned = cleaned.replace(specRegex, "\n• $1: ");
  }

  // 3. Pastikan poin tanda hubung (-) atau bintang (*) diawali baris baru
  cleaned = cleaned.replace(/([^\n])\s*[-•*]\s+/g, "$1\n• ");

  // 4. Bersihkan kelebihan enter kosong beruntun
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  return cleaned;
}

/**
 * Komponen Rich Description Viewer untuk Tampilan Modal Detail Produk
 */
export function ProductDescriptionViewer({
  desc,
  className = "",
}: {
  desc?: string;
  className?: string;
}) {
  if (!desc || !desc.trim()) {
    return (
      <p className="text-slate-500 text-sm leading-relaxed italic">
        Perangkat teknologi resmi berkualitas prima dari PT. DSTech Smart Perkasa.
      </p>
    );
  }

  // Bersihkan teks secara otomatis saat dirender
  const cleanedDesc = cleanDescriptionText(desc);
  const lines = cleanedDesc
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className={`space-y-2.5 text-slate-700 text-sm leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        // Baris Header / Judul Bagian
        if (
          line.startsWith("📌") ||
          line.startsWith("###") ||
          line.startsWith("Spesifikasi") ||
          line.startsWith("Fitur") ||
          line.startsWith("Kelengkapan") ||
          (line.endsWith(":") && !line.includes("•") && line.length < 60)
        ) {
          const cleanHeading = line.replace(/^[#📌\s]+/, "").replace(/:\s*$/, "");
          return (
            <div key={idx} className="pt-2.5 pb-1 border-b border-slate-200">
              <h5 className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-dstech-blue inline-block"></span>
                {cleanHeading}
              </h5>
            </div>
          );
        }

        // Baris Spesifikasi Berpoin: • Parameter: Nilai
        const bulletMatch = line.match(/^[•\-*]\s*(.*?):(.*)$/);
        const keyValueMatch =
          !bulletMatch && line.includes(":") && !line.startsWith("http")
            ? line.match(/^(.*?):(.*)$/)
            : null;
        const match = bulletMatch || keyValueMatch;

        if (match && match[1].length < 45) {
          const keyLabel = match[1].replace(/^[•\-*]\s*/, "").trim();
          const valLabel = match[2].trim();
          return (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
            >
              <span className="font-bold text-xs text-slate-800 shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {keyLabel}
              </span>
              <span className="font-medium text-xs text-slate-600 text-right">
                {valLabel}
              </span>
            </div>
          );
        }

        // Poin biasa tanpa titik dua
        if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-dstech-blue text-sm shrink-0 leading-tight">•</span>
              <span className="text-xs font-medium text-slate-700">
                {line.replace(/^[•\-*]\s*/, "")}
              </span>
            </div>
          );
        }

        // Paragraf deskripsi biasa
        return (
          <p key={idx} className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}
