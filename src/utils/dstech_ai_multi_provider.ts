import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "dstech_settings.json");

export interface DstechAISettings {
  active_provider: "gemini" | "openai" | "deepseek" | "claude" | "groq";
  // Google Gemini (Default: gemini-2.5-flash WAJIB SESUAI ATURAN)
  gemini_model: string;
  gemini_keys_free: string;
  gemini_key_paid: string;
  // OpenAI ChatGPT & Sora
  openai_key: string;
  openai_model: string;
  // DeepSeek AI
  deepseek_key: string;
  deepseek_model: string;
  // Anthropic Claude
  claude_key: string;
  claude_model: string;
  // Meta LLaMA via Groq
  groq_key: string;
  groq_model: string;
  // Video Engine
  video_engine: string;
  video_aspect_ratio: string;
}

export const DSTECH_DEFAULT_AI_SETTINGS: DstechAISettings = {
  active_provider: "gemini",
  gemini_model: "gemini-2.5-flash", // WAJIB DEFAULT gemini-2.5-flash SESUAI ATURAN
  gemini_keys_free: process.env.GEMINI_API_KEYS_FREE || process.env.GEMINI_API_KEY || "",
  gemini_key_paid: process.env.GEMINI_API_KEY_PAID || "",
  openai_key: process.env.OPENAI_API_KEY || "",
  openai_model: "gpt-4o",
  deepseek_key: process.env.DEEPSEEK_API_KEY || "",
  deepseek_model: "deepseek-chat",
  claude_key: process.env.CLAUDE_API_KEY || "",
  claude_model: "claude-3-5-sonnet-20241022",
  groq_key: process.env.GROQ_API_KEY || "",
  groq_model: "llama-3.3-70b-versatile",
  video_engine: "veo",
  video_aspect_ratio: "9:16",
};

export const DSTECH_AI_MODELS = {
  gemini: [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (Bawaan Utama / Cepat & Cerdas)" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (Penalaran Tinggi & Multimodal)" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Kecepatan Tinggi)" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Stabil & Ringan)" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Konteks Besar 2 Juta Token)" },
    { id: "gemini-3.0", name: "Gemini 3.0 (Preview / Versi Mendatang)" },
  ],
  openai: [
    { id: "gpt-4o", name: "GPT-4o (Flagship Multimodal Teks & Gambar)" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini (Hemat Biaya & Responsif)" },
    { id: "o1-mini", name: "o1-mini (Penalaran Kompleks)" },
    { id: "o3-mini", name: "o3-mini (Penalaran Cepat Terbaru)" },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek-V3 (Super Pintar, Cepat, Biaya Termurah)" },
    { id: "deepseek-reasoner", name: "DeepSeek-R1 (Penalaran Mendalam / Chain of Thought)" },
  ],
  claude: [
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Gaya Bahasa Sangat Natural)" },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (Ringan, Responsif & Cepat)" },
  ],
  groq: [
    { id: "llama-3.3-70b-versatile", name: "LLaMA 3.3 70B (Kecepatan Kilat via Groq LPU)" },
    { id: "llama-3.1-8b-instant", name: "LLaMA 3.1 8B Instant (Ultra Cepat)" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (32k Context)" },
  ],
};

/**
 * Baca konfigurasi Multi-AI dari dstech_settings.json
 */
export function getDstechAISettings(): DstechAISettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (data.dstech_ai_settings) {
        return {
          ...DSTECH_DEFAULT_AI_SETTINGS,
          ...data.dstech_ai_settings,
        };
      }
    }
  } catch (err) {
    console.error("[Multi-AI] Gagal membaca settings:", err);
  }
  return { ...DSTECH_DEFAULT_AI_SETTINGS };
}

/**
 * Simpan konfigurasi Multi-AI ke dstech_settings.json
 */
export function saveDstechAISettings(newSettings: Partial<DstechAISettings>): DstechAISettings {
  const current = getDstechAISettings();
  const merged: DstechAISettings = {
    ...current,
    ...newSettings,
  };

  // Validasi: default Gemini jangan pernah kosong
  if (!merged.gemini_model) {
    merged.gemini_model = "gemini-2.5-flash";
  }

  try {
    let allSettings: any = {};
    if (fs.existsSync(SETTINGS_FILE)) {
      allSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    }
    allSettings.dstech_ai_settings = merged;
    allSettings.updatedAt = new Date().toISOString();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(allSettings, null, 2), "utf-8");
  } catch (err) {
    console.error("[Multi-AI] Gagal menyimpan settings:", err);
  }

  return merged;
}

const KNOWN_REVOKED_KEYS = new Set([
  "AIzaSyAJLJZW07IfKww2m7USMK51W-XsycEb02w",
  "AIzaSyA8vir7yUSY25sZwoq5Mmx-sh4YaQ8LMlU",
  "AIzaSyCPO7o7HvlMjE2KDAq0SqbZb0mFFV5bLoY",
  "AIzaSyBbyYdhCGiKe9XVr44sOuy5W5Sb6L8a2a0",
  "AIzaSyCtESMZ27v54-exiKXJOShZ8vKdTwGz77E",
]);
const dynamicallyRevokedKeys = new Set<string>();

let geminiRotationIndex = 0;

/**
 * Panggilan ke Google Gemini dengan rotasi multi-free key dan fallback ke paid key
 * Model Default: gemini-2.5-flash (STRICT ATURAN PENGGUNA)
 */
export async function callGemini(
  prompt: string,
  systemInstruction = "",
  model = "gemini-2.5-flash",
  settings?: DstechAISettings
): Promise<{ success: boolean; text?: string; error?: string; provider: string; model: string }> {
  const cfg = settings || getDstechAISettings();
  const rawFree = [
    cfg.gemini_keys_free || "",
    process.env.GEMINI_API_KEYS_FREE || "",
    process.env.GEMINI_API_KEY || "",
  ].join(",");

  const rawPaid = (cfg.gemini_key_paid || process.env.GEMINI_API_KEY_PAID || "").replace(/["']/g, "").trim();

  // Bersihkan dan saring kunci yang sudah diblokir/bocor
  const freeKeys = Array.from(
    new Set(
      rawFree
        .split(",")
        .map((k) => k.replace(/["']/g, "").trim())
        .filter((k) => k && !KNOWN_REVOKED_KEYS.has(k) && !dynamicallyRevokedKeys.has(k))
    )
  );

  const effectivePaidKey = rawPaid && !KNOWN_REVOKED_KEYS.has(rawPaid) && !dynamicallyRevokedKeys.has(rawPaid) ? rawPaid : "";

  if (freeKeys.length === 0 && !effectivePaidKey) {
    return {
      success: false,
      error: "Kunci API Google Gemini aktif belum tersedia atau telah kedaluwarsa. Silakan masukkan API Key Gemini di Pengaturan Admin.",
      provider: "gemini",
      model,
    };
  }

  const effectiveModel = model || "gemini-2.5-flash";

  // Coba rotasi kunci gratis yang valid
  for (let i = 0; i < freeKeys.length; i++) {
    const key = freeKeys[(geminiRotationIndex + i) % freeKeys.length];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${key}`;
      const payload: any = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 3500 },
      };
      if (systemInstruction) {
        payload.system_instruction = { parts: [{ text: systemInstruction }] };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        geminiRotationIndex = (geminiRotationIndex + i + 1) % freeKeys.length;
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return { success: true, text, provider: "gemini", model: effectiveModel };
      }

      // Tandai key yang leaked / revoked (403 atau 400)
      if (res.status === 403 || res.status === 400) {
        dynamicallyRevokedKeys.add(key);
        continue;
      }
    } catch (e) {
      continue;
    }
  }

  // Jika kunci gratis habis atau belum berhasil, coba paid key
  if (effectivePaidKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${effectivePaidKey}`;
      const payload: any = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 3500 },
      };
      if (systemInstruction) {
        payload.system_instruction = { parts: [{ text: systemInstruction }] };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return { success: true, text, provider: "gemini", model: effectiveModel };
      }

      if (res.status === 403 || res.status === 400) {
        dynamicallyRevokedKeys.add(effectivePaidKey);
      }
    } catch (e) {}
  }

  return {
    success: false,
    error: "Seluruh kuota Gemini API saat ini belum dapat dihubungi. Menggunakan penalaran kontekstual in-house DSTech Smart.",
    provider: "gemini",
    model: effectiveModel,
  };
}

/**
 * Panggilan ke OpenAI ChatGPTT-4o, GPT-4o-mini, dll)
 */
export async function callOpenAI(
  prompt: string,
  systemInstruction = "",
  model = "gpt-4o",
  apiKey?: string
): Promise<{ success: boolean; text?: string; error?: string; provider: string; model: string }> {
  const key = apiKey || getDstechAISettings().openai_key;
  if (!key) {
    return { success: false, error: "OpenAI API Key belum diisi.", provider: "openai", model };
  }

  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 3500,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { success: false, error: `OpenAI Error (${res.status}): ${errBody}`, provider: "openai", model };
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return { success: true, text, provider: "openai", model };
  } catch (err: any) {
    return { success: false, error: err?.message || "Gagal menghubungi OpenAI.", provider: "openai", model };
  }
}

/**
 * Panggilan ke DeepSeek API (V3 & R1)
 */
export async function callDeepSeek(
  prompt: string,
  systemInstruction = "",
  model = "deepseek-chat",
  apiKey?: string
): Promise<{ success: boolean; text?: string; error?: string; provider: string; model: string }> {
  const key = apiKey || getDstechAISettings().deepseek_key;
  if (!key) {
    return { success: false, error: "DeepSeek API Key belum diisi.", provider: "deepseek", model };
  }

  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 3500,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { success: false, error: `DeepSeek Error (${res.status}): ${errBody}`, provider: "deepseek", model };
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return { success: true, text, provider: "deepseek", model };
  } catch (err: any) {
    return { success: false, error: err?.message || "Gagal menghubungi DeepSeek.", provider: "deepseek", model };
  }
}

/**
 * Panggilan ke Anthropic Claude API (Sonnet & Haiku)
 */
export async function callClaude(
  prompt: string,
  systemInstruction = "",
  model = "claude-3-5-sonnet-20241022",
  apiKey?: string
): Promise<{ success: boolean; text?: string; error?: string; provider: string; model: string }> {
  const key = apiKey || getDstechAISettings().claude_key;
  if (!key) {
    return { success: false, error: "Anthropic Claude API Key belum diisi.", provider: "claude", model };
  }

  const payload: any = {
    model: model || "claude-3-5-sonnet-20241022",
    max_tokens: 3500,
    messages: [{ role: "user", content: prompt }],
  };
  if (systemInstruction) {
    payload.system = systemInstruction;
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { success: false, error: `Claude Error (${res.status}): ${errBody}`, provider: "claude", model };
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text || "";
    return { success: true, text, provider: "claude", model };
  } catch (err: any) {
    return { success: false, error: err?.message || "Gagal menghubungi Anthropic Claude.", provider: "claude", model };
  }
}

/**
 * Panggilan ke Groq Cloud (LLaMA 3.3, 3.1, Mixtral)
 */
export async function callGroq(
  prompt: string,
  systemInstruction = "",
  model = "llama-3.3-70b-versatile",
  apiKey?: string
): Promise<{ success: boolean; text?: string; error?: string; provider: string; model: string }> {
  const key = apiKey || getDstechAISettings().groq_key;
  if (!key) {
    return { success: false, error: "Groq Cloud API Key belum diisi.", provider: "groq", model };
  }

  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 3500,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { success: false, error: `Groq Error (${res.status}): ${errBody}`, provider: "groq", model };
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return { success: true, text, provider: "groq", model };
  } catch (err: any) {
    return { success: false, error: err?.message || "Gagal menghubungi Groq Cloud.", provider: "groq", model };
  }
}

/**
 * Eksekusi Multi-AI Terpadu dengan Auto-Failover
 */
export async function executeMultiAICompletion(
  prompt: string,
  systemInstruction = "",
  providerOverride?: "gemini" | "openai" | "deepseek" | "claude" | "groq",
  modelOverride?: string
): Promise<{ success: boolean; text?: string; error?: string; provider: string; model: string }> {
  const settings = getDstechAISettings();
  const provider = providerOverride || settings.active_provider || "gemini";

  switch (provider) {
    case "openai":
      return callOpenAI(prompt, systemInstruction, modelOverride || settings.openai_model, settings.openai_key);
    case "deepseek":
      return callDeepSeek(prompt, systemInstruction, modelOverride || settings.deepseek_model, settings.deepseek_key);
    case "claude":
      return callClaude(prompt, systemInstruction, modelOverride || settings.claude_model, settings.claude_key);
    case "groq":
      return callGroq(prompt, systemInstruction, modelOverride || settings.groq_model, settings.groq_key);
    case "gemini":
    default:
      return callGemini(prompt, systemInstruction, modelOverride || settings.gemini_model || "gemini-2.5-flash", settings);
  }
}

/**
 * Uji Koneksi API Key Real-Time
 */
export async function testAIConnection(
  provider: string,
  apiKey: string,
  model?: string
): Promise<{ success: boolean; message: string; reply?: string }> {
  const testPrompt = "Jawab hanya 1 kata: 'KONEKSI_SUKSES'";
  const system = "Anda adalah tester koneksi API.";

  let res: any;
  if (provider === "gemini") {
    res = await callGemini(testPrompt, system, model || "gemini-2.5-flash", {
      ...getDstechAISettings(),
      gemini_key_paid: apiKey,
      gemini_keys_free: apiKey,
    });
  } else if (provider === "openai") {
    res = await callOpenAI(testPrompt, system, model || "gpt-4o-mini", apiKey);
  } else if (provider === "deepseek") {
    res = await callDeepSeek(testPrompt, system, model || "deepseek-chat", apiKey);
  } else if (provider === "claude") {
    res = await callClaude(testPrompt, system, model || "claude-3-5-haiku-20241022", apiKey);
  } else if (provider === "groq") {
    res = await callGroq(testPrompt, system, model || "llama-3.3-70b-versatile", apiKey);
  } else {
    return { success: false, message: "Provider tidak dikenali." };
  }

  if (res.success) {
    return {
      success: true,
      message: `Koneksi ke ${provider.toUpperCase()} Berhasil! Model ${res.model} merespons dengan normal.`,
      reply: res.text,
    };
  }

  return {
    success: false,
    message: `Koneksi Gagal: ${res.error || "Tidak ada respons"}`,
  };
}

/**
 * Generator Naskah & Storyboard Video Promosi Khusus DSTech Smart (Nadia Safitri)
 */
export async function generateVideoMarketingContent(params: {
  title: string;
  productCategory: string;
  audience: string;
  duration: string;
  aspectRatio: string;
  tone: string;
  highlights: string;
  provider?: "gemini" | "openai" | "deepseek" | "claude" | "groq";
  model?: string;
}): Promise<{ success: boolean; scriptText?: string; promptsText?: string; error?: string; provider: string; model: string }> {
  const systemInstruction = `Anda adalah Creative Director & Video Content Producer kelas dunia untuk PT. DSTech Smart Perkasa (Solusi CCTV, Barrier Gate Otomatis, Access Control, Smart Home, IT Infrastructure, dan Smart IoT di Indonesia). Anda bertindak sebagai asisten cerdas bagi Karyawan AI Nadia Safitri untuk merancang video promosi yang viral, profesional, dan berkonversi tinggi.`;

  const userPrompt = `Buatkan Rencana Produksi Video Promosi & Storyboard Lengkap dengan data berikut:
- Judul / Tema Video: ${params.title}
- Kategori Produk / Jasa: ${params.productCategory}
- Target Audiens: ${params.audience}
- Durasi: ${params.duration}
- Format Aspek Rasio: ${params.aspectRatio} (Format 9:16 Vertikal untuk YouTube Shorts / Instagram Reels / TikTok, atau 16:9 Landscape)
- Nada Bahasa (Tone): ${params.tone}
- Poin Utama yang Ditonjolkan: ${params.highlights}

Sertakan output dalam 3 bagian terstruktur:
1. **RINGKASAN KONSEP VIDEO** (Hook memikat 3 detik pertama, Solusi Masalah, Call To Action, Rekomendasi BGM).
2. **STORYBOARD RINCI PER-ADEGAN (SCENE-BY-SCENE)**:
   - Scene 1, Scene 2, Scene 3, dst.
   - Waktu (detik ke-...)
   - Deskripsi Visual & Angle Kamera (Lighting, motion kamera sinematik)
   - Narasi Voiceover (Bahasa Indonesia profesional & memikat)
   - Teks Grafis di Layar (On-screen text typography)
3. **PROMPT BAHASA INGGRIS KHUSUS GENERATOR AI VIDEO (Siap Pakai)**:
   Buatkan prompt sinematik fotorealistik 4K dalam bahasa Inggris untuk:
   a. **Google Veo Video Prompt**
   b. **OpenAI Sora Video Prompt**
   c. **Runway Gen-3 Alpha Prompt**
   d. **Luma Dream Machine / Kling AI Prompt**`;

  const res = await executeMultiAICompletion(userPrompt, systemInstruction, params.provider, params.model);

  if (!res.success) {
    return {
      success: false,
      error: res.error,
      provider: res.provider,
      model: res.model,
    };
  }

  return {
    success: true,
    scriptText: res.text,
    provider: res.provider,
    model: res.model,
  };
}
