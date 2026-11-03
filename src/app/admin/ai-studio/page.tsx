"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Video,
  Send,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Film,
  Tv,
  Smartphone,
  Key,
  Settings,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Wand2,
} from "lucide-react";

export default function AiVideoStudioPage() {
  // Video Input States
  const [videoTitle, setVideoTitle] = useState("");
  const [videoProductCat, setVideoProductCat] = useState("CCTV & Security System");
  const [videoAudience, setVideoAudience] = useState("Pabrik & Kawasan Industri");
  const [videoDuration, setVideoDuration] = useState("30 Detik (Standar Komersial)");
  const [videoRatio, setVideoRatio] = useState("9:16 Vertikal (Shorts / Reels / TikTok)");
  const [videoTone, setVideoTone] = useState("Energetik, Sinematik & Profesional");
  const [videoHighlights, setVideoHighlights] = useState("");

  // Processing & Results
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoResult, setVideoResult] = useState<any>(null);
  const [sendingToNadia, setSendingToNadia] = useState(false);
  const [nadiaMessage, setNadiaMessage] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [activePromptTab, setActivePromptTab] = useState<"veo" | "sora" | "runway" | "luma" | "kling">("veo");

  // Multi-AI active provider info
  const [activeProvider, setActiveProvider] = useState<string>("gemini");
  const [activeModel, setActiveModel] = useState<string>("gemini-2.5-flash");

  useEffect(() => {
    fetch("/api/ai-multi-provider")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setActiveProvider(data.settings.default_provider || "gemini");
          if (data.settings.default_provider === "openai") {
            setActiveModel(data.settings.openai_model || "gpt-4o");
          } else if (data.settings.default_provider === "deepseek") {
            setActiveModel(data.settings.deepseek_model || "deepseek-chat");
          } else if (data.settings.default_provider === "claude") {
            setActiveModel(data.settings.claude_model || "claude-3-5-sonnet-20241022");
          } else if (data.settings.default_provider === "groq") {
            setActiveModel(data.settings.groq_model || "llama-3.3-70b-versatile");
          } else {
            setActiveModel(data.settings.gemini_model || "gemini-2.5-flash");
          }
        }
      })
      .catch((err) => console.error("Error loading AI settings:", err));
  }, []);

  const handleGenerateVideo = async () => {
    if (!videoTitle.trim()) {
      alert("Silakan masukkan Judul atau Tema Video Promosi terlebih dahulu.");
      return;
    }

    setGeneratingVideo(true);
    setNadiaMessage(null);

    try {
      const res = await fetch("/api/ai-multi-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_video_content",
          title: videoTitle,
          productCategory: videoProductCat,
          targetAudience: videoAudience,
          duration: videoDuration,
          aspectRatio: videoRatio,
          tone: videoTone,
          productHighlights: videoHighlights,
        }),
      });

      const data = await res.json();
      if (data.success && data.content) {
        setVideoResult(data.content);
      } else {
        alert(data.message || "Gagal menghasilkan storyboard video.");
      }
    } catch (e: any) {
      alert("Terjadi kesalahan: " + (e.message || "Gagal menghubungi AI service."));
    } finally {
      setGeneratingVideo(false);
    }
  };

  const handleSendToNadia = async () => {
    if (!videoResult) return;
    setSendingToNadia(true);
    setNadiaMessage(null);

    try {
      const res = await fetch("/api/ai-multi-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_to_nadia_queue",
          videoData: videoResult,
          title: videoTitle,
          aspectRatio: videoRatio,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNadiaMessage({
          success: true,
          message: data.message || "Naskah video promosi berhasil dikirimkan ke Antrian Nadia Safitri!",
        });
      } else {
        setNadiaMessage({
          success: false,
          message: data.message || "Gagal mengirim ke Nadia Safitri.",
        });
      }
    } catch (e: any) {
      setNadiaMessage({
        success: false,
        message: "Terjadi kesalahan: " + (e.message || "Gagal koneksi."),
      });
    } finally {
      setSendingToNadia(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2500);
  };

  const setTemplate = (title: string, cat: string, aud: string, dur: string, rat: string, highlights: string) => {
    setVideoTitle(title);
    setVideoProductCat(cat);
    setVideoAudience(aud);
    setVideoDuration(dur);
    setVideoRatio(rat);
    setVideoHighlights(highlights);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-indigo-600">Admin</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">AI Studio &amp; Video Creator</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Video className="w-6 h-6 text-rose-600" />
            <span>AI Video Creator &amp; Storyboard Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Studio perancangan naskah video komersial, visual scene-by-scene, dan prompt sinematik terintegrasi dengan Karyawan AI <strong>Nadia Safitri</strong>.
          </p>
        </div>

        {/* Status Provider & Shortcut ke Site Settings */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Engine: <span className="text-indigo-600 uppercase">{activeProvider}</span> ({activeModel})</span>
          </div>
          <Link
            href="/admin/settings?tab=multi_ai"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-xs transition"
          >
            <Key className="w-3.5 h-3.5 text-indigo-500" />
            <span>Atur API Key di Settings</span>
          </Link>
        </div>
      </div>

      {/* Hero Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-blue-500/20">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-rose-500/20 text-rose-200 border border-rose-400/30">
            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            <span>AI Automated Video Marketing Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Produksi Video Promosi Sinematik Cepat &amp; Presisi
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Hasilkan ide naskah memukau, hook 3 detik pembuka, storyboard terperinci per-adegan, serta prompt sinematik siap pakai untuk <strong>Google Veo, OpenAI Sora, Runway Gen-3, Luma Dream Machine, dan Kling AI</strong>. Terhubung langsung ke antrean publikasi otomatis media sosial resmi PT DSTech Smart Perkasa.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-white/10 backdrop-blur text-white border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Storyboard Scene-by-Scene</span>
            </span>
            <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-white/10 backdrop-blur text-white border border-white/10 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-rose-400" />
              <span>Veo &amp; Sora Synthesizer</span>
            </span>
            <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-white/10 backdrop-blur text-white border border-white/10 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-300" />
              <span>1-Click ke Nadia Safitri</span>
            </span>
            <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-white/10 backdrop-blur text-white border border-white/10 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span>Format Shorts, Reels &amp; TikTok</span>
            </span>
          </div>
        </div>
      </div>

      {/* Template Cepat */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Wand2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Preset Cepat Produk DSTech:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTemplate(
              "Promo Spesial Barrier Gate Otomatis Perumahan & Kawasan Industri",
              "Smart Barrier Gate & Palang Parkir",
              "Perumahan & Residensial",
              "30 Detik (Standar Komersial)",
              "9:16 Vertikal (Shorts / Reels / TikTok)",
              "Kecepatan buka 1.5 detik, anti-nabrak loop detector, integrasi RFID card reader, tahan cuaca outdoor, garansi resmi 1 tahun."
            )}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition"
          >
            🚧 Barrier Gate Palang Parkir
          </button>
          <button
            type="button"
            onClick={() => setTemplate(
              "Pasang CCTV ColorVu Full HD 24 Jam Siang Malam Tetap Berwarna",
              "CCTV & Security System",
              "Toko & Usaha Komersial",
              "15 Detik (Shorts / Reels / TikTok)",
              "9:16 Vertikal (Shorts / Reels / TikTok)",
              "Resolusi 5MP super jernih, tetap berwarna dalam gelap gulita, pantau via smartphone kapan saja, gratis instalasi & setting."
            )}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition"
          >
            📹 CCTV Siang Malam
          </button>
          <button
            type="button"
            onClick={() => setTemplate(
              "Sistem Akses Kontrol Pintu Pintar Sidik Jari & Face Recognition Kantor",
              "Access Control RFID & Face Recognition",
              "Gedung & Perkantoran",
              "30 Detik (Standar Komersial)",
              "9:16 Vertikal (Shorts / Reels / TikTok)",
              "Pengenalan wajah 0.2 detik, anti fake photo, rekap absensi real-time terhubung cloud, desain elegan modern."
            )}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition"
          >
            🏢 Access Control & Face
          </button>
          <button
            type="button"
            onClick={() => setTemplate(
              "Solusi Jaringan Pabrik & Wi-Fi Industri Stabil Tanpa Putus",
              "IT Infrastructure & Network Solution",
              "Pabrik & Kawasan Industri",
              "60 Detik (Lengkap & Detail)",
              "16:9 Landscape (YouTube / TV)",
              "Koneksi fiber optic & access point high capacity, tahan interferensi mesin industri, monitoring 24/7 tim teknisi bersertifikat."
            )}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition"
          >
            🌐 Jaringan IT Pabrik
          </button>
        </div>
      </div>

      {/* Main Workspace Grid: Form (Kiri) vs Hasil Storyboard (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KOLOM KIRI: FORM PERANCANGAN VIDEO */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-600" />
                <span>Parameter Naskah Video</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400">Langkah 1</span>
            </div>

            {/* Judul Promo */}
            <div>
              <label className="text-xs font-bold text-slate-700">Judul / Topik Video Promosi *</label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Contoh: Promo Spesial Pemasangan Barrier Gate Cluster"
                className="w-full mt-1.5 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Kategori & Audiens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Kategori Produk</label>
                <select
                  value={videoProductCat}
                  onChange={(e) => setVideoProductCat(e.target.value)}
                  className="w-full mt-1.5 text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:bg-white focus:outline-none"
                >
                  <option value="CCTV & Security System">CCTV &amp; Security System</option>
                  <option value="Smart Barrier Gate & Palang Parkir">Barrier Gate &amp; Palang Parkir</option>
                  <option value="Access Control RFID & Face Recognition">Access Control RFID / Face</option>
                  <option value="Smart Home & IoT Automation">Smart Home &amp; Otomasi</option>
                  <option value="IT Infrastructure & Network Solution">IT &amp; Jaringan Komputer</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Target Audiens</label>
                <select
                  value={videoAudience}
                  onChange={(e) => setVideoAudience(e.target.value)}
                  className="w-full mt-1.5 text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:bg-white focus:outline-none"
                >
                  <option value="Pabrik & Kawasan Industri">Pabrik &amp; Kawasan Industri</option>
                  <option value="Perumahan & Residensial">Perumahan &amp; Residensial</option>
                  <option value="Gedung & Perkantoran">Gedung &amp; Perkantoran</option>
                  <option value="Toko & Usaha Komersial">Toko / Retail / UMKM</option>
                  <option value="Masyarakat Umum">Masyarakat Umum</option>
                </select>
              </div>
            </div>

            {/* Durasi & Rasio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Target Durasi</label>
                <select
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  className="w-full mt-1.5 text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:bg-white focus:outline-none"
                >
                  <option value="15 Detik (Shorts / Reels / TikTok)">15 Detik (Shorts / Reel Cepat)</option>
                  <option value="30 Detik (Standar Komersial)">30 Detik (Standar Komersial)</option>
                  <option value="60 Detik (Lengkap & Detail)">60 Detik (Lengkap &amp; Komprehensif)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Rasio Aspek Layar</label>
                <select
                  value={videoRatio}
                  onChange={(e) => setVideoRatio(e.target.value)}
                  className="w-full mt-1.5 text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:bg-white focus:outline-none"
                >
                  <option value="9:16 Vertikal (Shorts / Reels / TikTok)">9:16 Vertikal (Medsos / HP)</option>
                  <option value="16:9 Landscape (YouTube / TV)">16:9 Landscape (Layar TV / Web)</option>
                </select>
              </div>
            </div>

            {/* Gaya / Nada */}
            <div>
              <label className="text-xs font-bold text-slate-700">Gaya Bahasa &amp; Nada Penyampaian</label>
              <select
                value={videoTone}
                onChange={(e) => setVideoTone(e.target.value)}
                className="w-full mt-1.5 text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:bg-white focus:outline-none"
              >
                <option value="Energetik, Sinematik & Profesional">Energetik, Sinematik &amp; Profesional</option>
                <option value="Elegan, Mewah & Premium">Elegan, Mewah &amp; Premium</option>
                <option value="Promo Mendesak / Diskon Terbatas">Diskon Terbatas &amp; Menggugah Tindakan (FOMO)</option>
                <option value="Edukasi Santai & Solutif">Edukasi Santai &amp; Menjawab Masalah Klien</option>
              </select>
            </div>

            {/* Poin Keunggulan */}
            <div>
              <label className="text-xs font-bold text-slate-700">Poin Keunggulan / Tawaran Khusus</label>
              <textarea
                rows={4}
                value={videoHighlights}
                onChange={(e) => setVideoHighlights(e.target.value)}
                placeholder="Tuliskan spesifikasi unggulan, diskon harga, garansi, sertifikasi teknisi, atau gratis survey..."
                className="w-full mt-1.5 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Tombol Eksekusi AI Generator */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateVideo}
                disabled={generatingVideo}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {generatingVideo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI Sedang Merancang Storyboard &amp; Prompt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Naskah &amp; Storyboard Sinematik</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: HASIL STORYBOARD & PROMPT SINEMATIK */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Alert Kirim ke Nadia */}
          {nadiaMessage && (
            <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 animate-in fade-in ${
              nadiaMessage.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
            }`}>
              {nadiaMessage.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{nadiaMessage.message}</span>
            </div>
          )}

          {!videoResult && !generatingVideo ? (
            /* Empty State */
            <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center min-h-[460px] space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                <Video className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h4 className="text-base font-black text-slate-900">Belum Ada Storyboard Dibuat</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Isi formulir naskah di sebelah kiri atau pilih salah satu preset produk di atas, lalu tekan <strong>Generate Naskah &amp; Storyboard Sinematik</strong>.
                </p>
              </div>
            </div>
          ) : generatingVideo ? (
            /* Loading State */
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center flex flex-col items-center justify-center min-h-[460px] space-y-4 animate-pulse">
              <div className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">Meracik Naskah &amp; Prompt Sinematik...</h4>
                <p className="text-xs text-slate-500">Menganalisis sudut kamera, narasi voiceover, teks di layar, dan generator video AI.</p>
              </div>
            </div>
          ) : (
            /* Result Active State */
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Card 1: Konsep & Hook 3 Detik */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-300">Konsep Utama &amp; Hook Pembuka (3 Detik Pertama)</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                    {videoResult.estimated_duration || videoDuration}
                  </span>
                </div>
                <div className="text-xs text-indigo-100 space-y-2">
                  <p><strong className="text-white">Ide Utama:</strong> {videoResult.concept || videoTitle}</p>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-[10px] font-black uppercase text-amber-300 block mb-0.5">🔥 Hook 3 Detik Pembuka Layar:</span>
                    <p className="font-semibold text-white">{videoResult.hook || "Visual dinamis yang langsung menangkap perhatian penonton dalam 3 detik pertama."}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Rincian Adegan per Adegan (Storyboard) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Rincian Adegan Video (Scene Breakdown)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">
                    {Array.isArray(videoResult.scenes) ? videoResult.scenes.length : 3} Adegan
                  </span>
                </div>

                <div className="space-y-3">
                  {Array.isArray(videoResult.scenes) && videoResult.scenes.map((scene: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 hover:border-indigo-200 transition">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-black text-[11px]">
                          Adegan {scene.scene_number || idx + 1} ({scene.duration_seconds || "5"}s)
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          🎥 Kamera: {scene.camera_movement || "Smooth Pan"}
                        </span>
                      </div>

                      <div className="text-xs space-y-1.5">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Visual:</span>
                          <p className="font-medium text-slate-800">{scene.visual_description}</p>
                        </div>
                        {scene.narration_voiceover && (
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-indigo-900">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase block">🎙️ Voiceover / Narasi:</span>
                            <p className="italic font-semibold">&ldquo;{scene.narration_voiceover}&rdquo;</p>
                          </div>
                        )}
                        {scene.on_screen_text && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Teks di Layar:</span>
                            <span className="ml-1.5 inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px]">
                              {scene.on_screen_text}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Prompt AI Sinematik (Veo, Sora, Runway, Luma, Kling) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    <span>Prompt Generator Sinematik (Salin Langsung)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    English Cinematic Prompt
                  </span>
                </div>

                {/* Tab Provider Prompt */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
                  {[
                    { id: "veo", label: "Google Veo" },
                    { id: "sora", label: "OpenAI Sora" },
                    { id: "runway", label: "Runway Gen-3" },
                    { id: "luma", label: "Luma Dream Machine" },
                    { id: "kling", label: "Kling AI" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActivePromptTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activePromptTab === tab.id
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Prompt Box */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono relative group leading-relaxed">
                    <div className="pr-12 whitespace-pre-wrap">
                      {activePromptTab === "veo" && (videoResult.prompt_veo || "Cinematic promotional video showcasing modern security equipment, 4k ultra realistic, dramatic lighting.")}
                      {activePromptTab === "sora" && (videoResult.prompt_sora || "High-end commercial videography, smooth slow motion, photorealistic textures, depth of field.")}
                      {activePromptTab === "runway" && (videoResult.prompt_runway || "FPV cinematic camera movement, commercial broadcast grade, highly detailed reflections.")}
                      {activePromptTab === "luma" && (videoResult.prompt_luma || "Hyper-realistic product commercial shot on Arri Alexa, master color grading, 8k resolution.")}
                      {activePromptTab === "kling" && (videoResult.prompt_kling || "Professional tech showcase, crisp details, natural motion blur, corporate commercial aesthetic.")}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const promptText =
                          activePromptTab === "veo" ? videoResult.prompt_veo :
                          activePromptTab === "sora" ? videoResult.prompt_sora :
                          activePromptTab === "runway" ? videoResult.prompt_runway :
                          activePromptTab === "luma" ? videoResult.prompt_luma :
                          videoResult.prompt_kling;
                        copyToClipboard(promptText || "", activePromptTab);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                      title="Salin Prompt ke Clipboard"
                    >
                      {copiedPrompt === activePromptTab ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Action Footer: Kirim ke Nadia Safitri */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    💡 Teruskan naskah ini ke Karyawan AI untuk publikasi medsos resmi secara terjadwal.
                  </div>

                  <button
                    type="button"
                    onClick={handleSendToNadia}
                    disabled={sendingToNadia}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sendingToNadia ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Kirim ke Antrian Nadia Safitri</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
