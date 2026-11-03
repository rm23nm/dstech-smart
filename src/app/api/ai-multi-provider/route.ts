import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  getDstechAISettings,
  saveDstechAISettings,
  testAIConnection,
  generateVideoMarketingContent,
  DSTECH_AI_MODELS,
} from "@/utils/dstech_ai_multi_provider";

const WORKFORCE_FILE = path.join(process.cwd(), "src", "data", "dstech_ai_workforce.json");

export async function GET() {
  try {
    const settings = getDstechAISettings();
    return NextResponse.json({
      success: true,
      settings,
      models: DSTECH_AI_MODELS,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "generate_video_content";

    // 1. Simpan Pengaturan Multi-AI
    if (action === "save_settings") {
      const saved = saveDstechAISettings(body.settings || {});
      return NextResponse.json({
        success: true,
        message: "Pengaturan Multi-Platform AI & Video Studio berhasil disimpan!",
        settings: saved,
      });
    }

    // 2. Uji Coba Koneksi API
    if (action === "test_connection") {
      const { provider, apiKey, model } = body;
      if (!apiKey) {
        return NextResponse.json({ success: false, message: "API Key wajib diisi untuk melakukan pengujian." }, { status: 400 });
      }
      const testRes = await testAIConnection(provider, apiKey, model);
      return NextResponse.json(testRes, { status: testRes.success ? 200 : 400 });
    }

    // 3. Buat Naskah & Storyboard Video Promosi
    if (action === "generate_video_content") {
      const result = await generateVideoMarketingContent({
        title: body.title || "Promo CCTV & Smart Gate DSTech Smart",
        productCategory: body.productCategory || "CCTV & Security System",
        audience: body.audience || "Bisnis, Pabrik, Perumahan & Instansi",
        duration: body.duration || "15 Detik (Shorts/Reels/TikTok)",
        aspectRatio: body.aspectRatio || "9:16 Vertikal",
        tone: body.tone || "Energetik & Profesional",
        highlights: body.highlights || "Paket CCTV 5MP full color malam hari + Gratis pasang area Cilegon Serang.",
        provider: body.provider,
        model: body.model,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, message: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        scriptText: result.scriptText,
        provider: result.provider,
        model: result.model,
      });
    }

    // 4. Kirim Materi Video ke Antrean Nadia Safitri (Approval Queue Publikasi Otonom)
    if (action === "send_to_nadia_queue") {
      const { title, scriptText } = body;
      if (!fs.existsSync(WORKFORCE_FILE)) {
        return NextResponse.json({ success: false, message: "File workforce tidak ditemukan." }, { status: 404 });
      }

      const wfData = JSON.parse(fs.readFileSync(WORKFORCE_FILE, "utf-8"));
      if (!Array.isArray(wfData.dstech_approval_queue)) wfData.dstech_approval_queue = [];
      if (!Array.isArray(wfData.dstech_recent_logs)) wfData.dstech_recent_logs = [];

      const queueItem = {
        id: `appr_video_nadia_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: "MARKETING_CAMPAIGN",
        title: `[AI VIDEO STUDIO] ${title}`,
        employee_id: "emp_nadia_marketing",
        employee_name: "Nadia Safitri",
        department: "MARKETING",
        created_at: new Date().toISOString(),
        status: "WAITING_APPROVAL",
        priority: "HIGH",
        summary: `Naskah & Prompt Video Promosi "${title}" siap diproduksi dan dipublikasikan ke YouTube Shorts / Reels / WhatsApp oleh Nadia Safitri.`,
        data_payload: {
          title,
          scriptText,
          created_by: "AI Video Studio",
          channels: ["YouTube Shorts", "Instagram Reels", "TikTok", "WhatsApp Status"],
        },
      };

      wfData.dstech_approval_queue.unshift(queueItem);
      wfData.dstech_recent_logs.unshift({
        id: `log_nadia_${Date.now()}`,
        timestamp: new Date().toISOString(),
        employee_id: "emp_nadia_marketing",
        employee_name: "Nadia Safitri",
        action: `Merancang materi video promosi "${title}" via Multi-Platform AI Video Studio.`,
        status: "PENDING_APPROVAL",
      });

      fs.writeFileSync(WORKFORCE_FILE, JSON.stringify(wfData, null, 2), "utf-8");

      return NextResponse.json({
        success: true,
        message: "Materi video berhasil dikirimkan ke Antrean Persetujuan Nadia Safitri di Kantor Virtual!",
      });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak dikenali." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 });
  }
}
