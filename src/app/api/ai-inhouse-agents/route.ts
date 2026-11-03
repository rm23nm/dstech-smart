import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  InHouseAgentProfiles,
  getAllInHouseAgentProfiles,
  InHouseAgentTools,
  executeAutonomousAgentTask,
  getInHouseAgentTasks,
  callLocalInHouseLLM,
  DEFAULT_INHOUSE_MODEL,
  getAgentSchedules,
  toggleAgentSchedule,
  runAgentScheduleNow,
  formatWhatsAppDocumentMessage,
} from "@/utils/dstech_inhouse_ai_agent";

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const SMARTPRO_URL = process.env.SMARTPRO_BASE_URL || "https://smartpro.dstechsmart.com";
const MASTER_SECRET = process.env.LICENSE_MASTER_KEY || "DSTECH-MASTER-PRO-2026";

// GET: Ambil status Engine Lokal, Profil Agen In-House, Riwayat Tugas Otonom, dan Jadwal Otonom
export async function GET() {
  try {
    let localEngineOnline = false;
    let installedModels: string[] = [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        localEngineOnline = true;
        const data = await res.json();
        installedModels = (data.models || []).map((m: any) => m.name);
      }
    } catch (e) {
      localEngineOnline = false;
    }

    const tasks = getInHouseAgentTasks(25);
    const schedules = getAgentSchedules();

    return NextResponse.json({
      success: true,
      inHouseEngine: {
        engine: "Ollama (Local LLM Server)",
        status: localEngineOnline ? "ONLINE" : "OFFLINE",
        url: OLLAMA_BASE_URL,
        defaultModel: DEFAULT_INHOUSE_MODEL,
        installedModels: installedModels,
      },
      profiles: getAllInHouseAgentProfiles(),
      recentTasks: tasks,
      schedules: schedules,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal Error" },
      { status: 500 }
    );
  }
}

// POST: Perintahkan Agen Melakukan Tugas Otonom / Jadwal / Kirim WhatsApp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, agentId, instruction, contextData, model, prompt, scheduleId, enabled, phone, message, document } = body;

    // 1. Eksekusi Tugas Otonom Interaktif
    if (action === "dispatch_task") {
      if (!agentId || !instruction) {
        return NextResponse.json(
          { success: false, message: "Parameter agentId dan instruction wajib diisi." },
          { status: 400 }
        );
      }

      const taskResult = await executeAutonomousAgentTask(agentId, instruction, contextData);
      return NextResponse.json({
        success: true,
        message: `Tugas otonom berhasil dijalankan oleh ${taskResult.agentName}!`,
        task: taskResult,
      });
    }

    // 2. Toggle Status Jadwal Otonom (Aktif / Non-aktif)
    if (action === "toggle_schedule") {
      if (!scheduleId) {
        return NextResponse.json(
          { success: false, message: "Parameter scheduleId wajib disertakan." },
          { status: 400 }
        );
      }
      const updatedSchedules = toggleAgentSchedule(scheduleId, enabled);
      return NextResponse.json({
        success: true,
        message: "Status jadwal berhasil diperbarui.",
        schedules: updatedSchedules,
      });
    }

    // 3. Jalankan Jadwal Otonom Sekarang (Run Schedule Now)
    if (action === "run_schedule_now") {
      if (!scheduleId) {
        return NextResponse.json(
          { success: false, message: "Parameter scheduleId wajib disertakan." },
          { status: 400 }
        );
      }
      const runResult = await runAgentScheduleNow(scheduleId);
      return NextResponse.json({
        success: true,
        message: `Jadwal '${runResult.schedule.title}' berhasil dieksekusi secara otonom!`,
        schedule: runResult.schedule,
        task: runResult.task,
      });
    }

    // 4. Kirim Dokumen via WhatsApp (Smartpro WA API & Direct WhatsApp)
    if (action === "send_whatsapp") {
      let textToSend = message;
      if (!textToSend && document) {
        textToSend = formatWhatsAppDocumentMessage(document);
      }

      if (!textToSend) {
        return NextResponse.json(
          { success: false, message: "Isi pesan atau data dokumen wajib disertakan." },
          { status: 400 }
        );
      }

      // Format nomor telepon
      let cleanPhone = (phone || "").replace(/[^0-9]/g, "");
      if (cleanPhone.startsWith("0")) {
        cleanPhone = "62" + cleanPhone.slice(1);
      } else if (!cleanPhone.startsWith("62") && cleanPhone.length > 5) {
        cleanPhone = "62" + cleanPhone;
      }

      // Tautan langsung WhatsApp Web / Mobile
      const waLink = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`
        : `https://wa.me/?text=${encodeURIComponent(textToSend)}`;

      // Coba kirim via Gateway Smartpro jika nomor valid
      let gatewaySent = false;
      let gatewayResponse: any = null;

      if (cleanPhone) {
        try {
          const gwRes = await fetch(`${SMARTPRO_URL}/api/external/send-message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${MASTER_SECRET}`,
            },
            body: JSON.stringify({
              phone: cleanPhone,
              message: textToSend,
            }),
            signal: AbortSignal.timeout(4000),
          });

          if (gwRes.ok) {
            gatewaySent = true;
            gatewayResponse = await gwRes.json().catch(() => ({}));
          }
        } catch (gwErr: any) {
          console.warn("[Smartpro WA Gateway]: Gateway request skipped/failed:", gwErr?.message);
        }
      }

      return NextResponse.json({
        success: true,
        message: gatewaySent
          ? "Pesan WhatsApp berhasil dikirim via SmartPro WA Gateway!"
          : "Tautan WhatsApp resmi siap digunakan untuk pengiriman instan.",
        gatewaySent,
        gatewayResponse,
        waLink,
        phone: cleanPhone,
        text: textToSend,
      });
    }

    // 5. Tambah Produk Baru ke Katalog (Stok 0 & Margin 50% Referensi)
    if (action === "curate_daily_product") {
      const curationRes = await InHouseAgentTools.curateAndAddDailyProduct({
        keyword: body.keyword,
        category: body.category,
        externalImageUrl: body.externalImageUrl,
        sourceUrl: body.sourceUrl,
      });

      return NextResponse.json(curationRes);
    }

    // 5b. Penyelarasan & Audit Harga Harian AI (Margin 50% dari Harga Referensi / Modal)
    if (action === "sync_product_prices") {
      const syncRes = await InHouseAgentTools.syncAndAuditProductPrices({
        applyUpdates: body.applyUpdates !== false,
      });

      return NextResponse.json(syncRes);
    }

    // 5c. Rekrut Karyawan AI Otonom Baru
    if (action === "recruit_agent") {
      const { name, role, department, deskZone, gender, avatarColor, specialties, systemPrompt, dailySchedule } = body;
      if (!name || !role) {
        return NextResponse.json({ success: false, message: "Nama dan peran karyawan AI wajib diisi." }, { status: 400 });
      }

      const DATA_DIR = path.join(process.cwd(), "src", "data");
      const WORKFORCE_FILE = path.join(DATA_DIR, "dstech_ai_workforce.json");
      const SCHEDULES_FILE = path.join(DATA_DIR, "dstech_agent_schedules.json");

      let wfData: any = {};
      try {
        if (fs.existsSync(WORKFORCE_FILE)) {
          wfData = JSON.parse(fs.readFileSync(WORKFORCE_FILE, "utf-8"));
        }
      } catch (e) {}

      if (!Array.isArray(wfData.dstech_employees)) wfData.dstech_employees = [];

      const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 15);
      const newAgentId = `emp_${nameSlug}_${Date.now().toString().slice(-4)}`;

      const newEmployee = {
        id: newAgentId,
        name: name.trim(),
        role: role.trim(),
        department: department ? department.trim() : "OPERASIONAL",
        desk_zone: deskZone || "CUSTOM_DESK",
        gender: gender === "female" ? "female" : "male",
        avatar_color: avatarColor || "#8b5cf6",
        status: "IDLE",
        current_activity: "Menunggu instruksi tugas pertama dari Direktur Utama",
        speech_bubble: `Halo Pak Ramadhani! Saya ${name.trim()}, siap bertugas sebagai ${role.trim()} di PT. DSTech Smart Perkasa.`,
        kpi: {
          tasks_completed: 0,
          proposals_drafted: 0,
          accuracy_score: 100
        },
        skills: Array.isArray(specialties) && specialties.length > 0 ? specialties : ["Otonom DSTech", role.trim()],
        systemPrompt: systemPrompt ? systemPrompt.trim() : `Anda adalah ${name.trim()}, ${role.trim()} di PT. DSTech Smart Perkasa. Bertindaklah profesional, teliti, dan taati seluruh SOP perusahaan serta arahan Direktur Utama.`,
        isCustomAgent: true,
        created_at: new Date().toISOString()
      };

      wfData.dstech_employees.push(newEmployee);

      const logEntry = {
        id: `log_recruit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        employee_id: newAgentId,
        employee_name: name.trim(),
        action: `[REKRUTMEN STAF AI] Direktur Utama telah merekrut staf AI baru: ${name.trim()} (${role.trim()}) di divisi ${department || 'Operasional'}.`
      };
      if (!Array.isArray(wfData.dstech_recent_logs)) wfData.dstech_recent_logs = [];
      wfData.dstech_recent_logs.unshift(logEntry);

      fs.writeFileSync(WORKFORCE_FILE, JSON.stringify(wfData, null, 2), "utf-8");

      // Tambahkan jadwal otonom jika disertakan
      if (dailySchedule && dailySchedule.enabled) {
        let schedules = getAgentSchedules();
        const newSchedule = {
          id: `sch_${newAgentId}_daily`,
          agentId: newAgentId,
          agentName: name.trim(),
          department: department || "OPERASIONAL",
          title: dailySchedule.title || `Tugas Rutin: ${role.trim()}`,
          schedulePattern: dailySchedule.schedulePattern || "Setiap Hari, 08:00 WIB",
          instruction: dailySchedule.instruction || `Jalankan analisis dan koordinasi tugas ${role.trim()} secara otonom.`,
          enabled: true,
          nextRunDesc: dailySchedule.schedulePattern || "Setiap Hari, 08:00 WIB"
        };
        schedules.push(newSchedule);
        fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2), "utf-8");
      }

      return NextResponse.json({
        success: true,
        message: `Karyawan AI baru "${name.trim()}" (${role.trim()}) berhasil direkrut dan ditempatkan di Kantor Virtual PT. DSTech Smart Perkasa!`,
        agent: newEmployee
      });
    }

    // 5d. Berhentikan / Hapus Karyawan AI Kustom
    if (action === "delete_agent") {
      const { agentId } = body;
      const DATA_DIR = path.join(process.cwd(), "src", "data");
      const WORKFORCE_FILE = path.join(DATA_DIR, "dstech_ai_workforce.json");
      const SCHEDULES_FILE = path.join(DATA_DIR, "dstech_agent_schedules.json");

      let wfData: any = {};
      if (fs.existsSync(WORKFORCE_FILE)) {
        wfData = JSON.parse(fs.readFileSync(WORKFORCE_FILE, "utf-8"));
      }
      if (Array.isArray(wfData.dstech_employees)) {
        const target = wfData.dstech_employees.find((e: any) => e.id === agentId);
        if (!target) {
          return NextResponse.json({ success: false, message: "Karyawan tidak ditemukan" }, { status: 404 });
        }
        wfData.dstech_employees = wfData.dstech_employees.filter((e: any) => e.id !== agentId);
        fs.writeFileSync(WORKFORCE_FILE, JSON.stringify(wfData, null, 2), "utf-8");
      }
      if (fs.existsSync(SCHEDULES_FILE)) {
        try {
          let sch = JSON.parse(fs.readFileSync(SCHEDULES_FILE, "utf-8"));
          if (Array.isArray(sch)) {
            sch = sch.filter((s: any) => s.agentId !== agentId);
            fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(sch, null, 2), "utf-8");
          }
        } catch (e) {}
      }
      return NextResponse.json({
        success: true,
        message: "Karyawan AI berhasil diberhentikan dari kantor virtual."
      });
    }

    // 5e. Tambah / Edit Jadwal Rutin Otonom Bebas
    if (action === "save_schedule") {
      const { scheduleId, agentId, agentName, department, title, schedulePattern, instruction, enabled } = body;
      const DATA_DIR = path.join(process.cwd(), "src", "data");
      const SCHEDULES_FILE = path.join(DATA_DIR, "dstech_agent_schedules.json");

      let schedules = getAgentSchedules();
      const existingIdx = schedules.findIndex((s) => s.id === scheduleId);

      const scheduleItem = {
        id: scheduleId || `sch_${agentId}_${Date.now()}`,
        agentId: agentId || "emp_bambang_sales",
        agentName: agentName || "AI Staff",
        department: department || "OPERASIONAL",
        title: title || "Tugas Otonom Rutin",
        schedulePattern: schedulePattern || "Setiap Hari, 08:00 WIB",
        instruction: instruction || "Jalankan tugas operasional otonom.",
        enabled: enabled !== false,
        nextRunDesc: schedulePattern || "Setiap Hari, 08:00 WIB"
      };

      if (existingIdx !== -1) {
        schedules[existingIdx] = { ...schedules[existingIdx], ...scheduleItem };
      } else {
        schedules.push(scheduleItem);
      }

      fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2), "utf-8");
      return NextResponse.json({
        success: true,
        message: "Jadwal rutin otonom berhasil disimpan!",
        schedules
      });
    }

    // 6. Uji Coba AI Mandiri (Test In-House Local LLM)
    if (action === "test_local_llm") {
      const testPrompt = prompt || "Sebutkan 3 keunggulan sistem smart barrier gate PT DSTech Smart Perkasa secara ringkas.";
      const startTime = Date.now();
      const result = await callLocalInHouseLLM(testPrompt, undefined, model || DEFAULT_INHOUSE_MODEL);
      const latencyMs = Date.now() - startTime;

      return NextResponse.json({
        success: !result.error,
        response: result.text || "Model lokal merespons sukses (simulasi standby).",
        latencyMs,
        model: model || DEFAULT_INHOUSE_MODEL,
        error: result.error,
      });
    }

    return NextResponse.json(
      { success: false, message: `Action '${action}' tidak dikenali.` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memproses request." },
      { status: 500 }
    );
  }
}
