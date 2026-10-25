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

    // Panggil Engine AI Screening & Qualification di SmartPro WA Gateway
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
          visitorInfo: visitorInfo || {}
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

    // Fallback cerdas jika server SmartPro timeout atau belum aktif
    if (!aiResponseData) {
      const lower = message.toLowerCase();
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

      aiResponseData = {
        reply: `Halo! Saya Dani, Asisten Virtual AI PT. DSTech Smart Perkasa. Terkait kebutuhan Anda mengenai "${message}", kami siap membantu dengan solusi terbaik. Boleh kami tahu nama dan lokasi Anda agar kami bisa siapkan rekomendasi spesifik?`,
        department: dept,
        department_label: deptLabel,
        client_name: visitorInfo?.name || null,
        client_phone: visitorInfo?.phone || null,
        ready_for_handover: isReady,
        handover_reason: isReady ? "Klien membutuhkan tindak lanjut langsung dari tim terkait." : null,
        handover_summary: `Halo ${deptLabel} PT. DSTech Smart Perkasa,\nSaya ingin konsultasi lanjutan mengenai: "${message}". Mohon dibantu. Terima kasih!`,
        matched_products: [],
        quick_replies: ["📹 Rekomendasi Paket CCTV", "🚪 Solusi Smart Home", "🚧 Barrier Gate Otomatis", "🛠️ Bantuan Servis Teknis"]
      };
    }

    // Tentukan Nomor WhatsApp Tim Berdasarkan Kategori Departemen
    let targetPhone = waSales;
    if (aiResponseData.department === "TECHNICAL") {
      targetPhone = waTechnical;
    } else if (aiResponseData.department === "COMPLAINT") {
      targetPhone = waComplaint;
    }

    // Susun Link WhatsApp Resmi Handover
    const summaryText = aiResponseData.handover_summary || 
      `Halo ${aiResponseData.department_label} PT. DSTech Smart Perkasa,\nSaya berkonsultasi via AI Website dstechsmart.com mengenai:\n"${message}".\nMohon bantuannya. Terima kasih!`;

    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(summaryText)}`;

    // Auto-Capture ke CRM jika terdapat identitas client atau siap handover
    if ((aiResponseData.client_phone || visitorInfo?.phone) && fs.existsSync(CRM_FILE)) {
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
            company: visitorInfo?.company || "Perorangan / Bisnis",
            position: "Client",
            phone: phone,
            email: visitorInfo?.email || "",
            category: aiResponseData.department === "SALES" ? "B2B Industri" : (aiResponseData.department === "TECHNICAL" ? "Maintenance" : "After-Sales"),
            projectTitle: `[AI Chat] ${message.slice(0, 80)}`,
            estimatedValue: aiResponseData.department === "SALES" ? 5000000 : 0,
            stage: "DISCOVERY",
            probability: 50,
            source: "Website AI Live Chat",
            assignedTo: "RAMADHANI ST",
            notes: `[Departemen: ${aiResponseData.department_label}] Diagnosa AI: ${aiResponseData.handover_reason || "Percakapan awal via website"}. Ringkasan: ${summaryText}`,
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
