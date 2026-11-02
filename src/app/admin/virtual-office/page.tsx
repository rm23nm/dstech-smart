"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Office3DCanvas from "@/components/virtual-office/Office3DCanvas";
import {
  Sparkles,
  Bot,
  UserCheck,
  Send,
  Coffee,
  Briefcase,
  Monitor,
  PhoneCall,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RefreshCw,
  Building2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileText,
  DollarSign,
  Package,
  Share2,
  Award,
  Layers,
  ChevronRight,
  X,
  Play,
  Pause,
  Film,
  Video,
  Copy,
  Download,
  Smartphone,
  MessageSquare,
  Box,
  LayoutGrid,
  ExternalLink,
  ShieldCheck,
  Clock,
  Check,
  Eye,
  AlertTriangle,
  Zap,
  Heart,
  Music,
  RotateCcw,
  Loader2,
  Trash2,
  Paperclip
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  desk_zone: string;
  gender: "male" | "female";
  avatar_color: string;
  status: "WORKING" | "IDLE" | "DISCUSSING" | "ON_PHONE" | "COFFEE_BREAK";
  current_activity: string;
  speech_bubble: string;
  kpi: Record<string, any>;
  skills: string[];
}

interface ActivityLog {
  id: string;
  timestamp: string;
  employee_id: string;
  employee_name: string;
  action: string;
}

export interface ApprovalItem {
  id: string;
  revision?: number;
  employee_id: string;
  employee_name: string;
  employee_role: string;
  department: string;
  task_type: "SPH_PROPOSAL" | "INVOICE_PROPOSAL" | "FIELD_PROGRESS_REPORT" | "PRODUCT_IMPORT" | "PROMO_CAMPAIGN" | "CRM_LEAD" | "SPK_FIELD" | "VIDEO_BRANDING" | "SOCIAL_MEDIA_CONTENT" | "BOOKKEEPING_EXPENSE" | string;
  title: string;
  target_client?: string;
  value?: number;
  tax_type?: string;
  summary: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  created_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  payload: any;
}

export default function VirtualOfficePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [approvalQueue, setApprovalQueue] = useState<ApprovalItem[]>([]);
  const [approvalFilter, setApprovalFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearingRejected, setIsClearingRejected] = useState(false);
  const [isTriggeringAutopilot, setIsTriggeringAutopilot] = useState(false);
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ApprovalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedCount, setDismissedCount] = useState<number>(0);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Media Preview State for Video Branding & Dynamic Living Reels Engine
  const [activeVideoScene, setActiveVideoScene] = useState<number>(0);
  const [isPlayingVoiceover, setIsPlayingVoiceover] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgressSeconds, setVideoProgressSeconds] = useState<number>(0);
  const [videoLikeCount, setVideoLikeCount] = useState<number>(1420);
  const [isVideoLiked, setIsVideoLiked] = useState<boolean>(false);
  const [activeMediaTab, setActiveMediaTab] = useState<"storyboard" | "script" | "caption" | "flyer">("storyboard");
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Auto-play Timeline Video Reels Engine (0 - 30 Detik)
  useEffect(() => {
    let timer: any = null;
    if (isVideoPlaying && previewItem?.payload) {
      timer = setInterval(() => {
        setVideoProgressSeconds((prev) => {
          const next = prev + 1;
          if (next > 30) {
            return 0; // Otomatis loop ke awal
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isVideoPlaying, previewItem]);

  // Sinkronisasi Adegan Storyboard Otomatis Berdasarkan Detik Video:
  // 0s - 6s   : Adegan 1 (Hook / CCTV ColorVu)
  // 7s - 14s  : Adegan 2 (Palang Barrier Gate)
  // 15s - 22s : Adegan 3 (Keamanan Industri & Pabrik)
  // 23s - 30s : Adegan 4 (Outro & Call To Action)
  useEffect(() => {
    if (!isVideoPlaying) return;
    if (videoProgressSeconds <= 6) {
      setActiveVideoScene(0);
    } else if (videoProgressSeconds <= 14) {
      setActiveVideoScene(1);
    } else if (videoProgressSeconds <= 22) {
      setActiveVideoScene(2);
    } else {
      setActiveVideoScene(3);
    }
  }, [videoProgressSeconds, isVideoPlaying]);

  // Reset player saat modal ditutup atau previewItem berganti
  useEffect(() => {
    if (!previewItem) {
      setIsVideoPlaying(false);
      setVideoProgressSeconds(0);
      setIsPlayingVoiceover(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [previewItem]);

  const handlePlayVoiceover = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Browser Anda belum mendukung speech synthesis suara otomatis.");
      return;
    }
    if (isPlayingVoiceover) {
      window.speechSynthesis.cancel();
      setIsPlayingVoiceover(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsPlayingVoiceover(false);
    utterance.onerror = () => setIsPlayingVoiceover(false);
    setIsPlayingVoiceover(true);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Play / Pause Video Reels Lengkap (sinkron narasi suara otomatis)
  const handleTogglePlayVideo = () => {
    if (isVideoPlaying) {
      setIsVideoPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingVoiceover(false);
    } else {
      setIsVideoPlaying(true);
      if (previewItem?.payload?.fullVoiceoverScript) {
        handlePlayVoiceover(previewItem.payload.fullVoiceoverScript);
      }
    }
  };

  // Navigasi manual langsung ke adegan tertentu
  const handleSelectScene = (idx: number) => {
    setActiveVideoScene(idx);
    const sceneSeconds = [0, 7, 15, 23];
    setVideoProgressSeconds(sceneSeconds[idx] || 0);
  };

  const handleCopyCaption = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 3000);
    }
  };

  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [videoDisplayMode, setVideoDisplayMode] = useState<"SIMULATION" | "REAL_VIDEO">("SIMULATION");

  // ENGINE RENDER BERKAS VIDEO FISIK NYATA (.MP4 / .WEBM 9:16)
  const handleRenderAndDownloadVideo = async (item: ApprovalItem) => {
    if (typeof window === "undefined") return;
    const scenes = item.payload?.scenes || [];
    if (!scenes.length) {
      alert("Adegan storyboard belum tersedia untuk dirender.");
      return;
    }

    setIsRenderingVideo(true);
    setRenderProgress(5);

    try {
      // 1. Inisialisasi Canvas Full HD 9:16 (720 x 1280 agar rendering cepat dan super tajam di HP/Laptop)
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context tidak didukung pada browser ini.");

      // 2. Muat seluruh gambar adegan terlebih dahulu
      const loadedImages: HTMLImageElement[] = [];
      for (let i = 0; i < scenes.length; i++) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = scenes[i].image || item.payload?.flyer_image_url || "/service-cctv.png";
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Fallback toleran jika ada kendala jaringan
        });
        loadedImages.push(img);
      }
      setRenderProgress(15);

      // 3. Setup MediaStream dari Canvas
      const stream = canvas.captureStream(30); // 30 FPS
      let selectedMime = "video/webm;codecs=vp9";
      if (typeof MediaRecorder !== "undefined") {
        if (!MediaRecorder.isTypeSupported(selectedMime)) selectedMime = "video/webm";
        if (!MediaRecorder.isTypeSupported(selectedMime)) selectedMime = "video/mp4";
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(selectedMime) ? selectedMime : undefined,
        videoBitsPerSecond: 2800000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const recordFinishedPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: selectedMime.includes("mp4") ? "video/mp4" : "video/webm" });
          resolve(blob);
        };
      });

      recorder.start();

      // Durasi render video reels: 4 adegan x 2.2 detik = 8.8 detik padat
      const fps = 30;
      const durationPerSceneSec = 2.2;
      const totalFrames = scenes.length * durationPerSceneSec * fps;
      let frameCounter = 0;

      for (let sIdx = 0; sIdx < scenes.length; sIdx++) {
        const sc = scenes[sIdx];
        const scImg = loadedImages[sIdx];
        const sceneFrames = durationPerSceneSec * fps;

        for (let f = 0; f < sceneFrames; f++) {
          frameCounter++;
          const currentPct = Math.min(94, Math.round((frameCounter / totalFrames) * 80) + 15);
          setRenderProgress(currentPct);

          const progressRatio = f / sceneFrames;
          const scale = 1.0 + progressRatio * 0.14; // Efek Ken Burns motion

          ctx.save();
          // Latar Belakang Hitam Gelap
          ctx.fillStyle = "#020617";
          ctx.fillRect(0, 0, 720, 1280);

          // Gambar Produk
          if (scImg && scImg.width > 0) {
            const drawW = 720 * scale;
            const drawH = 1280 * scale;
            const ox = (720 - drawW) / 2;
            const oy = (1280 - drawH) / 2;
            ctx.drawImage(scImg, ox, oy, drawW, drawH);
          }

          // Gradien Gelap Atas & Bawah
          const gradTop = ctx.createLinearGradient(0, 0, 0, 240);
          gradTop.addColorStop(0, "rgba(0,0,0,0.85)");
          gradTop.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gradTop;
          ctx.fillRect(0, 0, 720, 240);

          const gradBot = ctx.createLinearGradient(0, 800, 0, 1280);
          gradBot.addColorStop(0, "rgba(0,0,0,0)");
          gradBot.addColorStop(0.5, "rgba(0,0,0,0.85)");
          gradBot.addColorStop(1, "rgba(0,0,0,0.98)");
          ctx.fillStyle = gradBot;
          ctx.fillRect(0, 800, 720, 480);

          // Laser Scanner HUD Bar
          const scanY = 320 + Math.sin(frameCounter * 0.12) * 140;
          const laserGrad = ctx.createLinearGradient(0, 0, 720, 0);
          laserGrad.addColorStop(0, "rgba(6,182,212,0)");
          laserGrad.addColorStop(0.5, "rgba(6,182,212,0.9)");
          laserGrad.addColorStop(1, "rgba(6,182,212,0)");
          ctx.fillStyle = laserGrad;
          ctx.fillRect(0, scanY, 720, 5);

          // Top Header Reels
          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.arc(45, 60, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = "bold 22px Arial, sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.fillText("DSTECH REELS OFFICIAL", 65, 68);

          ctx.fillStyle = "rgba(0,0,0,0.7)";
          ctx.fillRect(520, 40, 160, 36);
          ctx.font = "bold 18px monospace";
          ctx.fillStyle = "#fde047";
          const sec = Math.floor(frameCounter / fps);
          ctx.fillText(`00:${sec.toString().padStart(2, "0")} / 00:09`, 535, 65);

          // Badge Adegan
          ctx.fillStyle = "#f59e0b";
          ctx.fillRect(40, 920, 160, 36);
          ctx.font = "bold 16px monospace";
          ctx.fillStyle = "#020617";
          ctx.fillText(`ADEGAN ${sIdx + 1}/4`, 55, 944);

          // Kotak Subtitle Kinetik
          ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
          ctx.fillRect(35, 970, 650, 160);
          ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
          ctx.lineWidth = 3;
          ctx.strokeRect(35, 970, 650, 160);

          ctx.font = "bold 28px Arial, sans-serif";
          ctx.fillStyle = "#fde047";
          const capText = sc.captionOverlay || item.payload?.hook || "";
          const words = capText.split(" ");
          let curLine = "";
          let curY = 1025;
          for (let w = 0; w < words.length; w++) {
            const test = curLine + words[w] + " ";
            if (ctx.measureText(test).width > 590 && w > 0) {
              ctx.fillText(curLine, 55, curY);
              curLine = words[w] + " ";
              curY += 38;
            } else {
              curLine = test;
            }
          }
          ctx.fillText(curLine, 55, curY);

          // Watermark PT & Nadia Safitri
          ctx.font = "bold 20px Arial, sans-serif";
          ctx.fillStyle = "#67e8f9";
          ctx.fillText("@dstechsmart • PT. DSTech Smart Perkasa", 40, 1175);

          ctx.font = "15px Arial, sans-serif";
          ctx.fillStyle = "#94a3b8";
          ctx.fillText("🎵 Naskah & Dubbing: Nadia Safitri (AI Content Creator)", 40, 1205);

          ctx.restore();

          await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
        }
      }

      setRenderProgress(98);
      recorder.stop();
      const videoBlob = await recordFinishedPromise;
      setRenderProgress(100);

      // 4. Unduh Berkas Video Nyata dan Siapkan URL Playback Native
      const objectUrl = URL.createObjectURL(videoBlob);
      setRenderedVideoUrl(objectUrl);
      setVideoDisplayMode("REAL_VIDEO");

      const downloadEl = document.createElement("a");
      downloadEl.href = objectUrl;
      downloadEl.download = `DSTech_Video_Branding_Official_${Date.now()}.mp4`;
      document.body.appendChild(downloadEl);
      downloadEl.click();
      document.body.removeChild(downloadEl);

      alert("🎉 BERKAS VIDEO FISIK BERHASIL DIRENDER!\n\nFormat: Video Asli 9:16 Full HD (.MP4).\nBerkas video telah otomatis diunduh ke folder Download Anda dan kini langsung aktif di layar smartphone modal.");
    } catch (err: any) {
      console.error("Gagal merender video:", err);
      alert("Terjadi kendala saat merender berkas video: " + err.message);
    } finally {
      setIsRenderingVideo(false);
      setRenderProgress(0);
    }
  };

  const handleDownloadScript = (item: ApprovalItem) => {
    const payload = item.payload || {};
    const content = `=====================================================
PT. DSTECH SMART PERKASA - DRAF KONTEN VIDEO BRANDING MEDSOS
=====================================================
Judul Video: ${payload.videoTitle || item.title}
Platform Target: ${(payload.platforms || []).join(", ")}
Format: ${payload.aspectRatio || "9:16 (Vertikal)"} • Durasi: ${payload.duration || 30} Detik
Hook 3 Detik Pertama: ${payload.hook || "-"}

-----------------------------------------------------
NASKAH LENGKAP VOICEOVER (DUBBING SUARA):
-----------------------------------------------------
${payload.fullVoiceoverScript || item.summary}

-----------------------------------------------------
RANGKAIAN ADEGAN & STORYBOARD VIDEO:
-----------------------------------------------------
${(payload.scenes || []).map((s: any) => `[${s.timeRange}] ${s.title || "Scene " + s.sceneNumber}
Visual: ${s.visual}
Overlay Teks: ${s.captionOverlay}
Narasi Suara: ${s.voiceoverText}`).join("\n\n")}

-----------------------------------------------------
CAPTION LENGKAP & HASHTAG MEDSOS:
-----------------------------------------------------
${payload.captionText || item.summary}

Call to Action: ${payload.cta || "Chat WhatsApp: 0821-2533-3555 | Website: https://dstechsmart.com"}
=====================================================
Disusun secara otonom oleh Karyawan AI Nadia Safitri - PT. DSTech Smart Perkasa
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DSTech_Video_Branding_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handler 1-Klik Pasang ke Status WhatsApp (Tugas 332)
  const handleShareToWhatsAppStatus = async (item: ApprovalItem) => {
    const payload = item.payload || {};
    const title = payload.title || item.title || "Inovasi Keamanan & Smart System DSTech Smart Perkasa";
    const hook = payload.hook ? `🎯 *${payload.hook}*\n\n` : "";
    const caption = payload.captionText || payload.fullVoiceoverScript || item.summary || "";
    const tags = Array.isArray(payload.tags)
      ? payload.tags.map((t: string) => (t.startsWith("#") ? t : `#${t}`)).join(" ")
      : "#DSTechSmart #CCTVCilegon #BarrierGate #Shorts";
    const cta = payload.cta || "Hubungi Kami: 0822-5949-4242 | https://dstechsmart.com";

    const textToShare = `${hook}*${title.toUpperCase()}*\n\n${caption}\n\n${cta}\n\n${tags}`;

    // 1. Coba Web Share API (Di smartphone langsung memicu menu Bagikan -> WhatsApp Status)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: textToShare,
          url: "https://dstechsmart.com",
        });
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    // 2. Fallback WhatsApp Web / Intent URL
    const encodedText = encodeURIComponent(textToShare);
    const waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(waUrl, "_blank");
  };

  // Command Bar State
  const [executiveCommand, setExecutiveCommand] = useState("");
  const [isSubmittingCommand, setIsSubmittingCommand] = useState(false);
  const [commandSuccessNote, setCommandSuccessNote] = useState<string | null>(null);

  // Office Sound & Display
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"3D" | "GRID">("3D");
  const [modalDirectCommand, setModalDirectCommand] = useState("");
  const [isSubmittingModalCommand, setIsSubmittingModalCommand] = useState(false);
  const [modalExecutionResult, setModalExecutionResult] = useState<any>(null);
  const [modalAiResponse, setModalAiResponse] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Record<string, Array<{
    id: string;
    sender: "user" | "agent";
    text: string;
    timestamp: string;
    contextPayload?: any;
    attachment?: {
      url: string;
      fileName: string;
      originalName: string;
      type: string;
      size?: number;
    };
  }>>>({});
  const [attachedFile, setAttachedFile] = useState<{
    url: string;
    fileName: string;
    originalName: string;
    size: number;
    type: string;
  } | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const officeContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Unggah File Inquiry Client (Excel, Gambar/Foto, PDF) untuk Analisis Multimodal AI
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Ukuran file maksimal adalah 15MB");
      return;
    }

    setIsUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", "dstech_inquiry_");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setAttachedFile({
          url: json.url,
          fileName: json.fileName || file.name,
          originalName: file.name,
          size: file.size,
          type: file.type || (file.name.endsWith(".xlsx") ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/octet-stream"),
        });
      } else {
        alert(json.error || "Gagal mengunggah file inquiry");
      }
    } catch (err: any) {
      console.error("Error upload inquiry file:", err);
      alert("Terjadi kesalahan koneksi saat mengunggah file");
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  // Fetch initial workforce data
  const fetchWorkforce = async () => {
    try {
      const res = await fetch("/api/ai-workforce");
      const json = await res.json();
      if (json.success && json.data) {
        setEmployees(json.data.dstech_employees || []);
        setLogs(json.data.dstech_recent_logs || []);
        setApprovalQueue(json.data.dstech_approval_queue || []);
        if (typeof json.dismissedCount === "number") {
          setDismissedCount(json.dismissedCount);
        } else if (Array.isArray(json.data.dstech_dismissed_topics)) {
          setDismissedCount(json.data.dstech_dismissed_topics.length);
        }
        if (json.data.dstech_conversations && typeof json.data.dstech_conversations === "object") {
          setConversations(json.data.dstech_conversations);
        }
        if (selectedEmployee) {
          const updated = json.data.dstech_employees.find((e: Employee) => e.id === selectedEmployee.id);
          if (updated) setSelectedEmployee(updated);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data kantor virtual:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearEmployeeChat = async (employeeId: string) => {
    if (!confirm(`Hapus seluruh riwayat percakapan dengan ${selectedEmployee?.name}?`)) return;
    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_conversation", targetEmployeeId: employeeId })
      });
      const json = await res.json();
      if (json.success) {
        setConversations(prev => ({ ...prev, [employeeId]: [] }));
        setModalAiResponse(null);
        setModalExecutionResult(null);
      }
    } catch (err: any) {
      alert("Gagal menghapus riwayat obrolan: " + err.message);
    }
  };

  useEffect(() => {
    if (selectedEmployee && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedEmployee, conversations]);

  useEffect(() => {
    fetchWorkforce();
    const interval = setInterval(fetchWorkforce, 8000);
    return () => clearInterval(interval);
  }, []);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!officeContainerRef.current) return;
    if (!document.fullscreenElement) {
      officeContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  };

  // Approval Handlers (Kotak Persetujuan Direktur Utama)
  const handleApprove = async (item: ApprovalItem) => {
    setApprovingId(item.id);
    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_queue_item", itemId: item.id })
      });
      const json = await res.json();
      if (json.success) {
        setApprovalNotice(`✅ Berhasil disetujui! Pekerjaan "${item.title}" telah dicatat resmi ke dalam sistem database.`);
        fetchWorkforce();
        setTimeout(() => setApprovalNotice(null), 7000);
      } else {
        alert("Gagal menyetujui: " + (json.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    if (!confirm(`Apakah Anda yakin ingin menolak usulan pekerjaan "${item.title}"?`)) return;
    setRejectingId(item.id);
    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_queue_item", itemId: item.id })
      });
      const json = await res.json();
      if (json.success) {
        setApprovalNotice(`Usulan pekerjaan "${item.title}" telah ditolak dan dicatat ke Memori Blacklist AI agar tidak pernah diulang lagi.`);
        if (typeof json.dismissedCount === "number") setDismissedCount(json.dismissedCount);
        fetchWorkforce();
        setTimeout(() => setApprovalNotice(null), 6000);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setRejectingId(null);
    }
  };

  const handleDeleteQueueItem = async (item: ApprovalItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus usulan pekerjaan "${item.title}" ini secara permanen dari antrean?`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_queue_item", itemId: item.id })
      });
      const json = await res.json();
      if (json.success) {
        setApprovalNotice(`🗑️ Pekerjaan "${item.title}" berhasil dihapus permanen dan dicatat ke Memori Blacklist AI agar tidak pernah diulang.`);
        if (typeof json.dismissedCount === "number") setDismissedCount(json.dismissedCount);
        setApprovalQueue((prev) => prev.filter((x) => x.id !== item.id));
        if (previewItem?.id === item.id) {
          setPreviewItem(null);
        }
        fetchWorkforce();
        setTimeout(() => setApprovalNotice(null), 6000);
      } else {
        alert("Gagal menghapus: " + (json.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearRejectedQueue = async () => {
    const rejectedCount = approvalQueue.filter((x) => x.status === "REJECTED").length;
    if (rejectedCount === 0) {
      alert("Tidak ada usulan pekerjaan dengan status ditolak di antrean.");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus ${rejectedCount} pekerjaan yang berstatus DITOLAK secara permanen?`)) return;
    setIsClearingRejected(true);
    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_rejected_queue" })
      });
      const json = await res.json();
      if (json.success) {
        setApprovalNotice(`🗑️ Sebanyak ${json.removedCount ?? rejectedCount} pekerjaan yang ditolak berhasil dibersihkan & dipastikan tersimpan di Memori Blacklist.`);
        if (typeof json.dismissedCount === "number") setDismissedCount(json.dismissedCount);
        setApprovalQueue((prev) => prev.filter((x) => x.status !== "REJECTED"));
        fetchWorkforce();
        setTimeout(() => setApprovalNotice(null), 6000);
      } else {
        alert("Gagal membersihkan: " + (json.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsClearingRejected(false);
    }
  };

  const handleClearDismissedMemory = async () => {
    if (!confirm("Reset memori penolakan AI? AI akan dapat mengusulkan kembali topik atau klien yang sebelumnya pernah Anda tolak atau hapus.")) return;
    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_dismissed_memory" })
      });
      const json = await res.json();
      if (json.success) {
        setDismissedCount(0);
        setApprovalNotice("✓ Memori penolakan AI telah berhasil di-reset. AI dapat mengajukan topik segar kembali.");
        fetchWorkforce();
        setTimeout(() => setApprovalNotice(null), 5000);
      } else {
        alert("Gagal reset memori: " + (json.error || "Terjadi kesalahan"));
      }
    } catch (e: any) {
      alert("Gagal reset memori: " + e.message);
    }
  };

  const handleTriggerAutopilot = async () => {
    setIsTriggeringAutopilot(true);
    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_autopilot" })
      });
      const json = await res.json();
      if (json.success) {
        setApprovalNotice("⚡ Staf AI telah selesai bekerja otonom & menghasilkan draf baru di Kotak Persetujuan Anda!");
        fetchWorkforce();
        setTimeout(() => setApprovalNotice(null), 6000);
      }
    } catch (err: any) {
      alert("Gagal memicu autopilot: " + err.message);
    } finally {
      setIsTriggeringAutopilot(false);
    }
  };

  // Submit Executive Command
  const handleSendCommand = async (e?: React.FormEvent, customTargetId?: string) => {
    if (e) e.preventDefault();
    if (!executiveCommand.trim() || isSubmittingCommand) return;

    setIsSubmittingCommand(true);
    setCommandSuccessNote(null);

    try {
      const res = await fetch("/api/ai-workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "order",
          command: executiveCommand.trim(),
          employeeId: customTargetId || (selectedEmployee ? selectedEmployee.id : undefined)
        })
      });

      const json = await res.json();
      if (json.success) {
        setCommandSuccessNote(json.aiResponse || "Perintah berhasil didelegasikan!");
        setExecutiveCommand("");
        if (json.conversations && typeof json.conversations === "object") {
          setConversations(json.conversations);
        }
        fetchWorkforce();
      } else {
        alert(json.error || "Gagal mengirim perintah");
      }
    } catch (err) {
      console.error("Error sending command:", err);
    } finally {
      setIsSubmittingCommand(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: Employee["status"]) => {
    switch (status) {
      case "WORKING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 animate-pulse">● AKTIF BEKERJA</span>;
      case "ON_PHONE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-600 border border-blue-500/30">📞 SEDANG TELEPON</span>;
      case "DISCUSSING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 border border-purple-500/30">🤝 KOORDINASI</span>;
      case "COFFEE_BREAK":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/30">☕ ISTIRAHAT KOPI</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-600 border border-slate-500/30">IDLE STANDBY</span>;
    }
  };

  // Contoh Instruksi Cepat sesuai Peran & Divisi Karyawan
  const getQuickSuggestions = (empId: string) => {
    switch (empId) {
      case "emp_reza_catalog":
        return [
          { label: "🛍️ Impor Suku Cadang Barrier Gate", text: "Reza, tolong impor katalog suku cadang barrier gate dari tekno20 dengan foto asli dan deskripsi lengkap." },
          { label: "🔍 Cek Stok & Update Deskripsi", text: "Reza, cek stok barang barrier gate dan update spesifikasi produk di toko online." },
          { label: "🏷️ Sinkronisasi Harga & Status", text: "Reza, pastikan harga dan spesifikasi produk toko online sudah rapi dan siap tayang." }
        ];
      case "emp_dewi_finance":
        return [
          { label: "📎 Buat SPH dari File Terlampir", text: "Dewi, tolong pelajari file inquiry klien yang saya lampirkan di sini, lalu buatkan draf SPH resmi lengkap dengan rincian barang, spesifikasi teknis, dan total biayanya." },
          { label: "📑 Buat Draf SPH Exclude PPN", text: "Dewi, tolong siapkan draf SPH penawaran harga dengan opsi PPN Exclude untuk proyek baru." },
          { label: "💰 Rincian Invoice Proyek", text: "Dewi, buatkan rincian invoice tagihan termin untuk proyek barrier gate." },
          { label: "📊 Cek Arus Kas & Piutang", text: "Dewi, bagaimana rekap arus kas masuk dan piutang pelanggan saat ini?" }
        ];
      case "emp_bambang_sales":
        return [
          { label: "📎 Buat Penawaran dari File Klien", text: "Bambang, tolong cek daftar permintaan dari file inquiry terlampir, lalu koordinasikan penyusunan SPH ke Dewi Finance." },
          { label: "💼 Follow-up Barrier Gate", text: "Bambang, tolong follow-up calon klien pabrik kimia Cilegon untuk paket Barrier Gate RFID." },
          { label: "📋 Catat Prospek Baru", text: "Bambang, tolong catat prospek klien baru proyek perumahan klaster di Serang." },
          { label: "🤝 Jadwal Presentasi Proyek", text: "Bambang, buatkan agenda konsultasi teknis sistem akses kontrol minggu ini." }
        ];
      case "emp_nadia_marketing":
        return [
          { label: "📢 Promo Broadcast WA CCTV", text: "Nadia, buatkan materi promosi broadcast WhatsApp paket CCTV 8 Channel untuk perumahan." },
          { label: "🎯 Promo Barrier Gate Kawasan", text: "Nadia, buat materi promosi solusi Barrier Gate otomatis anti-antrean untuk kawasan industri." },
          { label: "📱 Jadwal Konten Edukasi", text: "Nadia, siapkan jadwal konten edukasi keamanan smart parking minggu ini." }
        ];
      case "emp_siti_cs":
        return [
          { label: "👋 Standby Konsultasi Web", text: "Siti, pastikan chatbot standby dan layani pengunjung yang bertanya seputar CCTV dan Barrier Gate." },
          { label: "📞 Rekap Kebutuhan Klien", text: "Siti, rekap pertanyaan dan kebutuhan spesifikasi klien yang masuk hari ini." }
        ];
      default:
        return [
          { label: "📋 Laporkan Progress Pekerjaan", text: "Tolong laporkan progres dan status pekerjaan Anda saat ini." }
        ];
    }
  };

  return (
    <div ref={officeContainerRef} className={`space-y-6 ${isFullscreen ? "p-8 bg-slate-950 text-white min-h-screen overflow-y-auto" : "p-4 md:p-6 max-w-7xl mx-auto"}`}>

      {/* Header Bar Kantor Virtual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE 24/7 AI DIGITAL WORKFORCE
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-bold text-slate-300">PT. DSTech Smart Perkasa</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight">
            <Building2 className="w-8 h-8 text-cyan-400" />
            <span>Kantor Virtual &amp; Divisi Karyawan AI</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Seluruh divisi operasional back-office, sales penawaran SPH, faktur ERP, promosi, dan CS berjalan otomatis secara otonom di bawah komando Direktur Utama.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher 3D vs Grid */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-700 shadow-inner">
            <button
              onClick={() => setViewMode("3D")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "3D"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Simulasi 3D</span>
            </button>
            <button
              onClick={() => setViewMode("GRID")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "GRID"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Denah Kartu</span>
            </button>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/10"
            title={isMuted ? "Bunyikan Suara Kantor" : "Senyapkan Suara"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />}
            <span className="hidden sm:inline text-xs">{isMuted ? "Mute" : "Audio On"}</span>
          </button>

          <button
            onClick={fetchWorkforce}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/10"
            title="Sinkronkan Ruangan"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline text-xs">Sync</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
            title="Tampilkan Layar Penuh (Display TV Kantor)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? "Keluar TV Mode" : "TV Wall Display"}</span>
          </button>
        </div>
      </div>

      {/* VIEWPORT 3D UTAMA ATAU DENAH KANTOR */}
      {viewMode === "3D" ? (
        <div className="relative">
          <Office3DCanvas
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={(emp) => setSelectedEmployee(emp as Employee)}
          />
        </div>
      ) : (
        /* DENAH KANTOR VIRTUAL (ISOMETRIC / 2.5D INTERACTIVE FLOOR PLAN) */
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 relative overflow-hidden min-h-[580px]">
          {/* Background Grid Ambience */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

          {/* Header Ruangan Kantor Info */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Suhu Ruang: 22°C (AC Nyaman)
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline font-bold text-slate-300">
                WiFi &amp; Gateway: 100% Online
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="font-bold text-cyan-400">
                Model Otak AI: Google Gemini 2.5 Multi-Agent
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Petunjuk:</span>
              <span className="text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                Klik sembarang karyawan untuk interaksi &amp; beri tugas
              </span>
            </div>
          </div>

          {/* TATA RUANG INTERAKTIF KANTOR */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">

            {/* MEJA DIREKTUR UTAMA (OWNER SUITE) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 shadow-xl relative group">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-500/20">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Ruang Direktur Utama &amp; Meja Eksekutif
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                  OWNER COMMAND
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-black text-xl border-2 border-amber-300">
                  👨‍💼
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white">Ramadhani ST</h3>
                  <p className="text-xs text-amber-300/90 font-medium">Direktur Utama &amp; Pemilik PT. DSTech Smart Perkasa</p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>Status: Siap Memimpin</span>
                    <span>•</span>
                    <span>Otoritas Tertinggi SPH &amp; Lapangan</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-slate-950/60 rounded-xl border border-indigo-500/20 text-xs text-slate-300 flex items-center gap-2">
                <span className="text-amber-400">👑</span>
                <span className="text-[11px] leading-relaxed">
                  Meja pimpinan siap mengarahkan seluruh divisi karyawan AI via Command Bar di bawah.
                </span>
              </div>
            </div>

            {/* PANTRY & COFFEE LOUNGE */}
            <div className="col-span-1 md:col-span-1 lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Coffee className="w-4 h-4" />
                    Pantry Kopi &amp; Lounge Istirahat
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">AREA REHAT</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tempat rehat dan diskusi santai bagi karyawan AI saat status mereka sedang senggang atau jeda tugas.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                  ☕ Mesin Espresso: Ready
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-bold">
                  💧 Dispenser Air: Dingin &amp; Panas
                </span>
              </div>
            </div>

            {/* KARTU MEJA KERJA TIAP KARYAWAN AI */}
            {employees.map((emp) => {
              const isSelected = selectedEmployee?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`bg-slate-800/80 hover:bg-slate-800 transition-all duration-200 rounded-2xl p-4 border cursor-pointer relative group flex flex-col justify-between ${isSelected
                      ? "border-cyan-400 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-400/30 scale-[1.02]"
                      : "border-slate-700/70 hover:border-slate-600 shadow-md"
                    }`}
                >
                  {/* Speech Bubble Melayang di Atas Kepala */}
                  {emp.speech_bubble && (
                    <div className="mb-3 p-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-[11px] text-slate-200 relative shadow-md group-hover:border-cyan-400/50 transition">
                      <p className="line-clamp-2 leading-relaxed italic">
                        &ldquo;{emp.speech_bubble}&rdquo;
                      </p>
                      <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 transform rotate-45" />
                    </div>
                  )}

                  {/* Avatar & Identitas Karyawan */}
                  <div className="flex items-start gap-3 mt-1">
                    <div className="relative">
                      <div
                        className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2"
                        style={{
                          backgroundColor: emp.avatar_color + "20",
                          borderColor: emp.avatar_color
                        }}
                      >
                        {emp.gender === "female" ? "👩‍💼" : "👨‍💼"}
                      </div>
                      {/* Status Dot Indikator */}
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-black text-white truncate">{emp.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{emp.role}</p>
                      <div className="mt-1.5">
                        {getStatusBadge(emp.status)}
                      </div>
                    </div>
                  </div>

                  {/* Aktivitas Saat Ini */}
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 text-[10.5px] text-slate-300">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Aktivitas Saat Ini:
                    </span>
                    <p className="line-clamp-2 leading-tight text-slate-300 font-medium">
                      {emp.current_activity}
                    </p>
                  </div>

                  {/* Footer Kartu & Tombol Aksi */}
                  <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-cyan-400 font-bold">{emp.department}</span>
                    <span className="flex items-center gap-1 text-slate-300 font-bold group-hover:text-cyan-400 transition">
                      Kelola <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* LOG AKTIVITAS TERKINI (LIVE TICKER FEED) */}
          <div className="relative z-10 mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Linimasa Kerja Kantor Digital (Live Activity Log)
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Real-time sync</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-36 overflow-y-auto pr-1">
              {logs.slice(0, 4).map((l) => (
                <div key={l.id} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-cyan-400">{l.employee_name}</span>
                    <span className="text-slate-500 font-mono">{new Date(l.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-slate-300 text-[10.5px] leading-tight line-clamp-2">
                    {l.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KOTAK PERSETUJUAN PIMPINAN (AI AUTOPILOT & APPROVAL QUEUE) */}
      {(() => {
        const pendingCount = approvalQueue.filter((x) => x.status === "PENDING_APPROVAL").length;
        const approvedCount = approvalQueue.filter((x) => x.status === "APPROVED").length;
        const rejectedCount = approvalQueue.filter((x) => x.status === "REJECTED").length;
        const filteredApprovalQueue = approvalQueue.filter((x) => {
          if (approvalFilter === "PENDING") return x.status === "PENDING_APPROVAL";
          if (approvalFilter === "APPROVED") return x.status === "APPROVED";
          if (approvalFilter === "REJECTED") return x.status === "REJECTED";
          return true;
        });

        return (
          <div className="bg-slate-900/95 border-2 border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header Kotak Persetujuan */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 text-xl font-black shrink-0">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      Kotak Persetujuan Pimpinan
                      <span className="text-amber-400 font-extrabold text-xs">
                        (AI Autopilot Hub)
                      </span>
                    </h3>
                    {pendingCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase animate-pulse shadow-sm shadow-amber-500/30">
                        {pendingCount} Menunggu Approval
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Semua hasil kerja staf AI (SPH penawaran, produk suku cadang, materi promo, SPK) tersimpan di sini. Sistem aman &amp; 100% tidak akan menulis ke database sebelum Bapak Ramadhani ST menyetujuinya.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Tabs */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setApprovalFilter("PENDING")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${approvalFilter === "PENDING" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
                  >
                    Menunggu ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalFilter("APPROVED")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${approvalFilter === "APPROVED" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    Disetujui ({approvedCount})
                  </button>
                  {rejectedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setApprovalFilter("REJECTED")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${approvalFilter === "REJECTED" ? "bg-rose-600 text-white" : "text-rose-400 hover:text-rose-200"}`}
                    >
                      Ditolak ({rejectedCount})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setApprovalFilter("ALL")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${approvalFilter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    Semua ({approvalQueue.length})
                  </button>
                </div>

                {/* Tombol Bersihkan Ditolak Sekaligus */}
                {rejectedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearRejectedQueue}
                    disabled={isClearingRejected}
                    className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Hapus permanen semua pekerjaan yang berstatus ditolak"
                  >
                    <Trash2 className={`w-3.5 h-3.5 ${isClearingRejected ? "animate-spin" : "text-rose-400"}`} />
                    <span>{isClearingRejected ? "Membersihkan..." : `Bersihkan Ditolak (${rejectedCount})`}</span>
                  </button>
                )}

                {/* Indikator Memori Blacklist AI (Tugas 340) */}
                {dismissedCount > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-700/50 text-[11px] text-purple-200">
                    <Bot className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Memori AI: <b>{dismissedCount}</b> topik ditolak/dihapus diingat</span>
                    <button
                      type="button"
                      onClick={handleClearDismissedMemory}
                      title="Reset memori penolakan AI agar topik lama bisa diusulkan kembali"
                      className="ml-1.5 text-[10px] text-purple-300 hover:text-white underline cursor-pointer font-bold"
                    >
                      Reset
                    </button>
                  </div>
                )}

                {/* Tombol Picu Autopilot Staf AI */}
                <button
                  type="button"
                  onClick={handleTriggerAutopilot}
                  disabled={isTriggeringAutopilot}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Perintahkan staf AI bekerja otomatis menghasilkan draf tugas baru"
                >
                  <Zap className={`w-3.5 h-3.5 ${isTriggeringAutopilot ? "animate-spin" : ""}`} />
                  <span>{isTriggeringAutopilot ? "Staf AI Sedang Bekerja..." : "⚡ Jalankan Autopilot Kerja Staf"}</span>
                </button>
              </div>
            </div>

            {/* Notifikasi Pop-up Hasil Aksi */}
            {approvalNotice && (
              <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">{approvalNotice}</span>
                </div>
                <button
                  onClick={() => setApprovalNotice(null)}
                  className="text-emerald-400 hover:text-white text-xs px-2 py-0.5"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Daftar Item Usulan Pekerjaan */}
            {filteredApprovalQueue.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/50 rounded-2xl border border-slate-800/80 p-6 space-y-2">
                <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  {approvalFilter === "PENDING" ? "Tidak Ada Pekerjaan Menunggu Persetujuan" : "Belum Ada Riwayat Pekerjaan"}
                </h4>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Semua tugas staf AI telah Anda review. Klik tombol <b>⚡ Jalankan Autopilot Kerja Staf</b> di atas untuk memicu staf AI bekerja menghasilkan draf baru secara otomatis.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApprovalQueue.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative group ${item.status === "APPROVED"
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : item.status === "REJECTED"
                          ? "bg-slate-950/40 border-slate-800 opacity-60"
                          : "bg-slate-950/70 border-amber-500/30 hover:border-amber-500/60 shadow-lg"
                      }`}
                  >
                    <div className="space-y-3">
                      {/* Badge Header Pengusul & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-amber-300 border border-slate-700">
                            {item.employee_name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white">{item.employee_name}</h4>
                            <span className="text-[9.5px] text-slate-400 block -mt-0.5">{item.employee_role}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${item.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : item.status === "REJECTED"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                            }`}
                        >
                          {item.status === "APPROVED" ? "✓ Disetujui" : item.status === "REJECTED" ? "✕ Ditolak" : "⏳ Menunggu"}
                        </span>
                      </div>

                      {/* Judul & Sasaran */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[9px] font-mono font-bold uppercase">
                            {item.task_type.replace("_", " ")}
                          </span>
                          {item.revision && item.revision > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 text-[9px] font-bold border border-amber-600/70 flex items-center gap-1 shadow-sm">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              <span>Revisi #{item.revision}</span>
                            </span>
                          ) : null}
                          {item.tax_type === "exclude" && (
                            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[9px] font-bold border border-indigo-800">
                              Exclude PPN
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-black text-white leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h5>
                        {item.target_client && (
                          <p className="text-[10.5px] text-slate-400 mt-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="font-semibold text-slate-300 line-clamp-1">{item.target_client}</span>
                          </p>
                        )}
                      </div>

                      {/* Ringkasan & Estimasi Nilai */}
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] space-y-1.5">
                        <p className="text-slate-300 leading-relaxed line-clamp-3 text-[10.5px]">
                          {item.summary}
                        </p>
                        {item.value && item.value > 0 ? (
                          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Estimasi Nilai</span>
                            <span className="font-mono font-black text-amber-400">
                              Rp {item.value.toLocaleString("id-ID")}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Tombol Tinjau Rincian Draf */}
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="w-full mt-3 py-1.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs group/btn"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:scale-110 transition-transform" />
                      <span>👁️ Tinjau Rincian Draf Lengkap</span>
                    </button>

                    {/* Footer Action Buttons */}
                    <div className="mt-2 pt-2.5 border-t border-slate-800 flex items-center gap-2">
                      {item.status === "PENDING_APPROVAL" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(item)}
                            disabled={approvingId === item.id || rejectingId === item.id || deletingId === item.id}
                            className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {approvingId === item.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {approvingId === item.id
                                ? "Memproses..."
                                : item.task_type === "VIDEO_BRANDING" || item.task_type === "SOCIAL_MEDIA_CONTENT" || item.task_type === "PROMO_CAMPAIGN"
                                  ? "🚀 Setujui & Posting"
                                  : item.task_type === "INVOICE_PROPOSAL"
                                    ? "📄 Sahkan Faktur ERP"
                                    : item.task_type === "FIELD_PROGRESS_REPORT"
                                      ? "📋 Sahkan Berita Acara"
                                      : "Setujui & Terapkan"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReject(item)}
                            disabled={approvingId === item.id || rejectingId === item.id || deletingId === item.id}
                            className="px-3 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                            title="Tolak Pekerjaan"
                          >
                            {rejectingId === item.id ? "..." : "Tolak"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQueueItem(item)}
                            disabled={approvingId === item.id || rejectingId === item.id || deletingId === item.id}
                            className="px-2.5 py-2 bg-rose-950/40 hover:bg-rose-900/80 text-rose-400 hover:text-rose-200 border border-rose-500/30 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                            title="Hapus Usulan Ini Secara Permanen Dari Antrean"
                          >
                            {deletingId === item.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between gap-2 py-1 text-[11px] font-bold text-slate-500">
                          {item.status === "APPROVED" ? (
                            <>
                              <div className="flex-1 text-left">
                                {item.payload?.is_auto_published ? (
                                  <div className="space-y-0.5">
                                    <span className="text-emerald-400 flex items-center gap-1 font-black">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> 🚀 Tayang di Medsos (IG, TikTok, YT, FB)
                                    </span>
                                    <span className="text-[9.5px] text-cyan-300 font-medium block">
                                      Diposting otomatis oleh Nadia Safitri
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui resmi oleh Direktur Utama
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteQueueItem(item)}
                                disabled={deletingId === item.id}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                                title="Hapus Dari Riwayat Antrean"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-rose-400 flex items-center gap-1">
                                ✕ Ditolak
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteQueueItem(item)}
                                disabled={deletingId === item.id}
                                className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Hapus Permanen Dari Antrean"
                              >
                                {deletingId === item.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                                <span>Hapus Permanen</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MODAL PRATINJAU DOKUMEN DRAF LENGKAP HASIL KERJA STAF AI */}
            {previewItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
                <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border-2 border-indigo-500/50 rounded-3xl shadow-2xl overflow-hidden">

                  {/* Modal Header */}
                  <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/40 flex items-center justify-center text-lg font-black shadow-inner">
                        {previewItem.task_type === "SPH_PROPOSAL"
                          ? "📑"
                          : previewItem.task_type === "BOOKKEEPING_EXPENSE"
                            ? "💰"
                            : previewItem.task_type === "INVOICE_PROPOSAL"
                              ? "📄"
                              : previewItem.task_type === "FIELD_PROGRESS_REPORT"
                                ? "📋"
                                : previewItem.task_type === "PRODUCT_IMPORT"
                                  ? "🛍️"
                                  : "📢"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            {previewItem.task_type.replace("_", " ")}
                          </span>
                          {previewItem.revision && previewItem.revision > 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-950/90 text-amber-300 border border-amber-500/70 flex items-center gap-1 shadow-sm">
                              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>Revisi #{previewItem.revision}</span>
                            </span>
                          ) : null}
                          <span className="text-xs text-slate-400">• Disusun oleh:</span>
                          <span className="text-xs font-black text-amber-300">{previewItem.employee_name} ({previewItem.employee_role})</span>
                        </div>
                        <h3 className="text-sm md:text-base font-black text-white mt-1">
                          {previewItem.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewItem(null)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body Scrollable */}
                  <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">

                    {/* Ringkasan Draf */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Deskripsi &amp; Ringkasan Rekomendasi AI
                      </span>
                      <p className="text-xs leading-relaxed text-slate-200">
                        {previewItem.summary}
                      </p>
                      {previewItem.target_client && (
                        <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs">
                          <span className="text-slate-400 font-bold">Sasaran / Calon Klien:</span>
                          <span className="font-bold text-white bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
                            {previewItem.target_client}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* DETAIL SESUAI JENIS PEKERJAAN */}
                    {/* 0a. DOKUMEN DRAF FAKTUR PENJUALAN (INVOICE) PROYEK SELESAI */}
                    {previewItem.task_type === "INVOICE_PROPOSAL" && previewItem.payload && (
                      <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-5">
                        {/* Header Faktur */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-black text-xs border border-cyan-500/30">
                                {previewItem.payload.invoiceNumber}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                ✓ Terbit Otonom Proyek Selesai
                              </span>
                            </div>
                            <h4 className="text-base font-black text-white mt-1.5">{previewItem.payload.projectName || previewItem.title}</h4>
                            <p className="text-xs text-slate-400">Kode Proyek: <span className="font-mono text-cyan-300">{previewItem.payload.projectCode || "-"}</span></p>
                          </div>

                          <div className="text-left sm:text-right space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Jatuh Tempo Pembayaran</span>
                            <span className="text-xs font-mono font-black text-amber-400 block">{previewItem.payload.dueDate || "14 Hari Kerja"}</span>
                            <span className="text-[10px] text-slate-500 block">Tgl Terbit: {previewItem.payload.date}</span>
                          </div>
                        </div>

                        {/* Info Klien & Entitas Bisnis */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ditagihkan Kepada:</span>
                            <p className="font-black text-white">{previewItem.payload.customerName || previewItem.target_client}</p>
                            <p className="text-slate-300 text-[11px] mt-0.5">{previewItem.payload.customerAddress || "Banten / Jabodetabek"}</p>
                            <p className="text-slate-400 text-[11px] font-mono">Telp: {previewItem.payload.customerPhone || "-"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Metode & Rekening Pembayaran:</span>
                            <p className="font-bold text-emerald-400">PT. DSTech Smart Perkasa</p>
                            <p className="text-slate-300 text-[11px] font-mono">BCA: 295-074-0321</p>
                            <p className="text-slate-300 text-[11px] font-mono">Mandiri: 163-00-0435889-1</p>
                          </div>
                        </div>

                        {/* Tabel Rincian Tagihan */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Rincian Pos Tagihan Pekerjaan:</span>
                          <div className="overflow-x-auto rounded-xl border border-slate-800">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-900/90 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                                <tr>
                                  <th className="py-2 px-3">Uraian Pekerjaan / Material</th>
                                  <th className="py-2 px-2 text-center">Qty</th>
                                  <th className="py-2 px-3 text-right">Harga Satuan</th>
                                  <th className="py-2 px-3 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60 font-sans">
                                {(previewItem.payload.items || []).map((it: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-slate-900/40">
                                    <td className="py-2 px-3 text-white font-medium">{it.productName || it.name}</td>
                                    <td className="py-2 px-2 text-center font-mono text-slate-300">{it.qty} {it.unit || "Paket"}</td>
                                    <td className="py-2 px-3 text-right font-mono text-slate-300">Rp {(Number(it.price) || 0).toLocaleString("id-ID")}</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-cyan-300">Rp {(Number(it.total) || 0).toLocaleString("id-ID")}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Ringkasan Subtotal, PPN, Grand Total */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <span>Subtotal DPP:</span>
                            <span className="font-mono font-bold">Rp {(previewItem.payload.subtotal || 0).toLocaleString("id-ID")}</span>
                          </div>
                          {previewItem.payload.taxRate > 0 && (
                            <div className="flex items-center justify-between text-xs text-slate-300">
                              <span>PPN 11%:</span>
                              <span className="font-mono font-bold text-amber-400">+ Rp {(previewItem.payload.taxAmount || 0).toLocaleString("id-ID")}</span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                            <span className="font-black text-white">TOTAL FAKTUR PENJUALAN:</span>
                            <span className="font-mono font-black text-emerald-400 text-base">
                              Rp {(previewItem.payload.grandTotal || previewItem.value || 0).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 0b. DOKUMEN BERITA ACARA KEMAJUAN PEKERJAAN & FOTO TEKNISI */}
                    {previewItem.task_type === "FIELD_PROGRESS_REPORT" && previewItem.payload && (
                      <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-5">
                        {/* Header Berita Acara */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs border border-emerald-500/30">
                                {previewItem.payload.reportNumber}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                                📋 Berita Acara Progres Lapangan
                              </span>
                            </div>
                            <h4 className="text-base font-black text-white mt-1.5">{previewItem.payload.projectName || previewItem.title}</h4>
                            <p className="text-xs text-slate-400">Klien: <span className="font-bold text-white">{previewItem.payload.clientName || previewItem.target_client}</span> • Lokasi: <span className="text-slate-300">{previewItem.payload.location || "Site"}</span></p>
                          </div>

                          <div className="text-left sm:text-right space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Teknisi Pelaksana</span>
                            <span className="text-xs font-bold text-amber-300 block">👷 {previewItem.payload.technicianName}</span>
                            <span className="text-[10px] font-mono text-slate-400 block">Tgl: {previewItem.payload.date} ({previewItem.payload.reportTime || "17:00 WIB"})</span>
                          </div>
                        </div>

                        {/* Meter Kemajuan Pekerjaan (Progress Bar) */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-white">Capaian Progres Pekerjaan:</span>
                            <span className="font-mono font-black text-emerald-400 text-sm">{previewItem.payload.progressPercentage}%</span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60 relative">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(0, previewItem.payload.progressPercentage))}%` }}
                            />
                          </div>
                        </div>

                        {/* Uraian Kegiatan & Catatan Teknis */}
                        <div className="space-y-3">
                          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Uraian Kegiatan Pekerjaan Lapangan:</span>
                            <p className="text-slate-200 leading-relaxed">{previewItem.payload.activityDescription}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                              <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Catatan Kendala (Blockers):</span>
                              <p className="text-slate-300">{previewItem.payload.blockers || "Tidak ada kendala (Aman & Lancar)"}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                              <span className="text-[10px] font-bold text-cyan-400 uppercase block mb-1">Tindak Lanjut Berikutnya:</span>
                              <p className="text-slate-300">{previewItem.payload.nextAction || "Melanjutkan tahapan commissioning dan pengetesan"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Galeri Foto Dokumentasi Lapangan */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider block">
                              📸 Galeri Foto Dokumentasi Lapangan ({(previewItem.payload.photos || []).length} Foto Bukti Fisik):
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">Terverifikasi Timestamp</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {(previewItem.payload.photos || []).map((photo: any, pIdx: number) => {
                              const photoUrl = typeof photo === "string" ? photo : (photo.url || photo.data || "/service-cctv.png");
                              const caption = typeof photo === "string" ? `Foto Titik #${pIdx + 1}` : (photo.caption || `Dokumentasi #${pIdx + 1}`);
                              return (
                                <div key={pIdx} className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group hover:border-emerald-500/60 transition-all flex flex-col">
                                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                                    <img
                                      src={photoUrl}
                                      alt={caption}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                  <div className="p-2.5 text-[10.5px] space-y-1 flex-1 flex flex-col justify-between">
                                    <p className="text-slate-200 font-medium line-clamp-2">{caption}</p>
                                    <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800/60">
                                      <span>Titik #{pIdx + 1}</span>
                                      <a href={photoUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-0.5">
                                        <span>Lihat Full</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 1. DOKUMEN SPH PENAWARAN HARGA */}
                    {previewItem.task_type === "SPH_PROPOSAL" && previewItem.payload && (
                      <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div>
                            <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider">
                              Lembar Draf Surat Penawaran Harga (SPH)
                            </span>
                            <h4 className="text-sm font-black text-white">{previewItem.payload.subject || previewItem.title}</h4>
                          </div>
                          {previewItem.tax_type === "exclude" && (
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
                              Skema: Exclude PPN (Harga Netto)
                            </span>
                          )}
                        </div>

                        {/* Tabel Rincian Item Barang/Jasa */}
                        {Array.isArray(previewItem.payload.items) && previewItem.payload.items.length > 0 ? (
                          <div className="overflow-x-auto rounded-xl border border-slate-800">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                                <tr>
                                  <th className="py-2.5 px-3">No</th>
                                  <th className="py-2.5 px-3">Nama Produk / Layanan Proyek</th>
                                  <th className="py-2.5 px-3 text-center">Qty</th>
                                  <th className="py-2.5 px-3 text-right">Harga Satuan (Rp)</th>
                                  <th className="py-2.5 px-3 text-right">Total (Rp)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60 font-medium">
                                {previewItem.payload.items.map((it: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                                    <td className="py-2.5 px-3 font-semibold text-white">{it.productName}</td>
                                    <td className="py-2.5 px-3 text-center text-slate-300">{it.qty} {it.unit || "Unit"}</td>
                                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                                      {(it.price || 0).toLocaleString("id-ID")}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                                      {(it.total || (it.price * it.qty) || 0).toLocaleString("id-ID")}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}

                        {/* Rekapitulasi Finansial & Pajak */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                          <div className="flex justify-between text-slate-300">
                            <span>Subtotal (Harga DPP / Netto Proyek):</span>
                            <span className="font-mono font-bold text-white">
                              Rp {(previewItem.payload.subtotal || previewItem.value || 0).toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-slate-300">
                            <span>Pajak PPN (11%):</span>
                            {previewItem.tax_type === "exclude" || previewItem.payload.hideTaxInPrint ? (
                              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[11px] font-bold border border-amber-800">
                                Exclude (Belum Termasuk PPN)
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-white">
                                Rp {(previewItem.payload.taxAmount || 0).toLocaleString("id-ID")}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                            <span className="font-black text-white">Grand Total Penawaran SPH:</span>
                            <span className="font-mono font-black text-lg text-emerald-400">
                              Rp {(previewItem.tax_type === "exclude" ? (previewItem.payload.subtotal || previewItem.value || 0) : (previewItem.payload.grandTotal || previewItem.value || 0)).toLocaleString("id-ID")}
                            </span>
                          </div>

                          {previewItem.tax_type === "exclude" && (
                            <p className="text-[10px] text-amber-400 italic pt-1">
                              *Klausul resmi tercantum: &ldquo;Harga di atas adalah DPP/Netto belum termasuk PPN (PPN Exclude). Pajak Pertambahan Nilai akan diperhitungkan saat penerbitan Faktur Penjualan.&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 1b. DOKUMEN DRAF PEMBUKUAN KEUANGAN & PENGELUARAN GAJI */}
                    {previewItem.task_type === "BOOKKEEPING_EXPENSE" && previewItem.payload && (
                      <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                          <div>
                            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                              💰 Usulan Pembukuan Pengeluaran Arus Kas &amp; Payroll
                            </span>
                            <h4 className="text-sm font-black text-white mt-0.5">{previewItem.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40">
                              Total Rp {(previewItem.payload.grandTotal || previewItem.value || 0).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        {/* Info Ringkas Pembukuan */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Periode</span>
                            <span className="font-bold text-white">{previewItem.payload.periodLabel || "Jan - Des 2025"}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Kategori Kas</span>
                            <span className="font-bold text-amber-300">{previewItem.payload.category || "Beban Operasional"}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Transaksi</span>
                            <span className="font-bold text-cyan-300">{previewItem.payload.totalEntries || previewItem.payload.entries?.length || 0} Transaksi</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Akun Sumber Kas</span>
                            <span className="font-bold text-slate-200 truncate block">Bank BCA PT</span>
                          </div>
                        </div>

                        {/* Tabel Rincian Transaksi */}
                        <div className="space-y-2">
                          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                            Daftar Rincian Transaksi yang Akan Dibukukan:
                          </span>
                          <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/80 text-xs">
                            {(previewItem.payload.entries || []).map((entry: any, idx: number) => (
                              <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                                      {entry.date}
                                    </span>
                                    <span className="font-bold text-white">{entry.personName || entry.name}</span>
                                    {entry.personRole && (
                                      <span className="text-[10px] text-slate-400">({entry.personRole})</span>
                                    )}
                                    {entry.category && (
                                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                        {entry.category}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block">{entry.description}</span>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                  <span className="font-mono font-bold text-rose-400 block">
                                    - Rp {(entry.amount || 0).toLocaleString("id-ID")}
                                  </span>
                                  <span className="text-[9.5px] text-slate-500 font-medium">OUT (Kas Keluar)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. DRAF PENGADAAN & IMPOR PRODUK E-STORE */}
                    {previewItem.task_type === "PRODUCT_IMPORT" && previewItem.payload && (
                      <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4">
                        <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider block">
                          Spesifikasi Produk Baru E-Store Toko Online
                        </span>

                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {previewItem.payload.image && (
                            <div className="w-full sm:w-44 h-44 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center p-2 relative group">
                              <img
                                src={previewItem.payload.image}
                                alt={previewItem.payload.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              />
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8.5px] font-black bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                                📸 FOTO ASLI NYATA
                              </span>
                            </div>
                          )}

                          <div className="space-y-2 flex-1">
                            <h4 className="text-sm font-black text-white leading-snug">
                              {previewItem.payload.name}
                            </h4>

                            <div className="flex flex-wrap gap-2 text-[10.5px]">
                              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700">
                                Brand: {previewItem.payload.brand || "DSTech Original"}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700">
                                Kategori: {previewItem.payload.category || "Security System"}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                                Stok Awal Pendaftaran: 0 Unit
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-3 text-xs mt-3">
                              <div>
                                <span className="text-[10px] text-slate-400 block font-bold uppercase">Harga Modal Kulakan</span>
                                <span className="font-mono font-bold text-slate-300">
                                  Rp {(previewItem.payload.costPrice || 0).toLocaleString("id-ID")}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block font-bold uppercase">Harga Jual (+50% Margin)</span>
                                <span className="font-mono font-black text-amber-400">
                                  Rp {(previewItem.payload.price || previewItem.value || 0).toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 pt-1">
                              ✓ Data bersih tanpa kebocoran margin/supplier. Siap tayang di katalog e-store setelah persetujuan Direktur.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. DRAF PROMOSI & BROADCAST WHATSAPP */}
                    {previewItem.task_type === "PROMO_CAMPAIGN" && previewItem.payload && (
                      <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4">
                        <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider block">
                          Materi Promosi &amp; Pesan Broadcast WhatsApp
                        </span>

                        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                            <span>💬 Mockup Pesan WhatsApp Siap Kirim</span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-900/90 text-xs font-mono text-emerald-100 whitespace-pre-line border border-emerald-900/50 leading-relaxed">
                            {previewItem.payload.description || previewItem.summary}
                            {"\n\n"}
                            📲 Info &amp; Pemesanan Hubungi Official CS PT. DSTech Smart Perkasa: 0822-5949-4242
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. DRAF VIDEO BRANDING & KONTEN MEDIA SOSIAL (TIKTOK / REELS / SHORTS) */}
                    {(previewItem.task_type === "VIDEO_BRANDING" || previewItem.task_type === "SOCIAL_MEDIA_CONTENT") && previewItem.payload && (
                      <div className="space-y-4">
                        {/* Target Platforms Badge & Info */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                              <Film className="w-4 h-4 text-purple-400" />
                              <span>Platform Target:</span>
                            </span>
                            {(previewItem.payload.platforms || ["TikTok", "Instagram Reels", "YouTube Shorts", "Facebook"]).map((plat: string, idx: number) => (
                              <span key={idx} className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-900/50 text-purple-200 border border-purple-500/40">
                                {plat}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-mono font-bold border border-amber-500/30">
                              Format: 9:16 Vertikal
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                              ⏱ Durasi: {previewItem.payload.duration || 30} Detik
                            </span>
                          </div>
                        </div>

                        {/* Hook 3 Detik Box */}
                        {previewItem.payload.hook && (
                          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5">
                            <span className="text-base shrink-0">🎯</span>
                            <div>
                              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                                Hook 3 Detik Pertama (Pemicu Penasaran Audiens):
                              </span>
                              <p className="text-xs font-bold text-amber-100 italic mt-0.5">
                                "{previewItem.payload.hook}"
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Tab Navigasi Media */}
                        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                          <button
                            type="button"
                            onClick={() => setActiveMediaTab("storyboard")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeMediaTab === "storyboard"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                              }`}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Player Smartphone &amp; Storyboard</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveMediaTab("caption")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeMediaTab === "caption"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                              }`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Caption &amp; Tagar Siap Salin</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveMediaTab("script")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeMediaTab === "script"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                              }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Naskah Narator Suara</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveMediaTab("flyer")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeMediaTab === "flyer"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                              }`}
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>Poster Flyer 1:1 Feed</span>
                          </button>
                        </div>

                        {/* CONTENT TAB 1: SMARTPHONE REELS PLAYER & STORYBOARD */}
                        {activeMediaTab === "storyboard" && (
                          <div className="space-y-4">
                            {/* Banner Info Autopilot Social Media Publishing */}
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-950 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl shrink-0">🚀</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11.5px] font-black text-white block">
                                      Autopilot Auto-Publishing Media Sosial PT. DSTech Smart Perkasa
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      0 MB Disk VPS
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-purple-200">
                                    Begitu Anda menekan tombol <strong>Setujui</strong>, Staf AI Nadia Safitri langsung mempublikasikan video/flyer ini ke Instagram Reels, TikTok, YouTube Shorts, dan Facebook Page secara otonom tanpa membebani kapasitas server!
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href="/admin/settings"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-400/40 transition flex items-center gap-1 cursor-pointer"
                                >
                                  <span>🌐 Atur Kunci API Medsos</span>
                                  <ExternalLink className="w-3 h-3 text-purple-300" />
                                </a>
                                <span className="px-2.5 py-1 rounded-full text-[9.5px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                                  ✓ Autopilot Aktif
                                </span>
                              </div>
                            </div>

                            {/* Status Terbit Media Sosial jika sudah disetujui */}
                            {previewItem.payload?.social_posts && (
                              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-indigo-950/40 border border-emerald-500/40 space-y-2">
                                <div className="flex items-center justify-between text-xs font-black text-emerald-400">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    🚀 Konten Telah Berhasil Terbit di Seluruh Media Sosial:
                                  </span>
                                  <span className="text-[10px] text-slate-400">Dipublikasikan otonom oleh Nadia Safitri</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {previewItem.payload.social_posts.map((sp: any, spIdx: number) => (
                                    <a
                                      key={spIdx}
                                      href={sp.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-800 transition flex flex-col justify-between group shadow-sm"
                                    >
                                      <span className="text-[10px] font-black text-white flex items-center justify-between">
                                        {sp.platform}
                                        <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                                      </span>
                                      <span className="text-[9.5px] font-bold text-emerald-400 mt-1">✓ Berhasil Tayang</span>
                                      <span className="text-[8px] font-mono text-slate-400">{sp.reach_estimate}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                              {/* Smartphone 9:16 Mockup & Video Controls */}
                              <div className="md:col-span-5 flex flex-col items-center">
                                {/* Toggle Pilihan Mode Tampilan: Simulasi Player vs Berkas Video Asli */}
                                <div className="w-[250px] mb-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1 shadow-inner">
                                  <button
                                    type="button"
                                    onClick={() => setVideoDisplayMode("SIMULATION")}
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-black transition flex items-center justify-center gap-1 cursor-pointer ${videoDisplayMode === "SIMULATION"
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                        : "text-slate-400 hover:text-white"
                                      }`}
                                  >
                                    <span>📱 Simulasi Reels</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!renderedVideoUrl) {
                                        handleRenderAndDownloadVideo(previewItem);
                                      } else {
                                        setVideoDisplayMode("REAL_VIDEO");
                                      }
                                    }}
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-black transition flex items-center justify-center gap-1 cursor-pointer ${videoDisplayMode === "REAL_VIDEO"
                                        ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30"
                                        : "text-amber-400 hover:text-white"
                                      }`}
                                  >
                                    <span>🎬 Video Asli (.MP4)</span>
                                  </button>
                                </div>

                                <div
                                  onClick={videoDisplayMode === "SIMULATION" ? handleTogglePlayVideo : undefined}
                                  className="w-[250px] h-[460px] rounded-[38px] bg-slate-950 p-2.5 border-4 border-slate-700 shadow-2xl relative flex flex-col overflow-hidden cursor-pointer select-none group"
                                  title={videoDisplayMode === "SIMULATION" ? "Klik layar smartphone untuk Putar / Jeda Video" : "Pemutar Berkas Video Fisik Asli"}
                                >
                                  {/* Notch Camera */}
                                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-30 flex items-center justify-center pointer-events-none">
                                    <div className="w-2 h-2 rounded-full bg-slate-800" />
                                  </div>

                                  {/* TAMPILAN 1: BERKAS VIDEO FISIK NYATA (.MP4 / .WEBM DARI RENDER CANVAS) */}
                                  {videoDisplayMode === "REAL_VIDEO" && renderedVideoUrl ? (
                                    <div className="w-full h-full rounded-[28px] relative overflow-hidden flex flex-col justify-between p-1 border border-amber-500/50 bg-black">
                                      <video
                                        src={renderedVideoUrl}
                                        controls
                                        autoPlay
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover rounded-[24px]"
                                      />
                                    </div>
                                  ) : (
                                    /* TAMPILAN 2: SIMULASI PLAYER INTERAKTIF BERANIMASI HIDUP */
                                    <div className="w-full h-full rounded-[28px] relative overflow-hidden flex flex-col justify-between p-3 border border-slate-800 bg-slate-950">
                                      {/* Real Background Illustration / Scene Photo with Ken-Burns Motion */}
                                      <img
                                        src={
                                          previewItem.payload.scenes?.[activeVideoScene]?.image ||
                                          previewItem.payload.flyer_image_url ||
                                          "/service-cctv.png"
                                        }
                                        alt={previewItem.payload.scenes?.[activeVideoScene]?.title || "Scene Visual"}
                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out ${isVideoPlaying ? "scale-115 translate-x-1 brightness-105" : "scale-100 brightness-95"
                                          }`}
                                      />
                                      {/* Cinematic Dark Overlay for Contrast & Text Readability */}
                                      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/25 to-black/95 pointer-events-none" />

                                      {/* AI Tech Laser Scanner Beam Animation (Aktif saat video berputar) */}
                                      {isVideoPlaying && (
                                        <>
                                          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none animate-pulse top-1/2 -translate-y-1/2" />
                                          <div className="absolute top-12 left-3 right-3 pointer-events-none flex items-center justify-between text-[7.5px] font-mono text-cyan-300 bg-cyan-950/60 backdrop-blur-xs px-2 py-0.5 rounded border border-cyan-500/40">
                                            <span className="flex items-center gap-1 font-bold">
                                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                              {activeVideoScene === 0
                                                ? "AI VISION: CCTV COLORVU HD"
                                                : activeVideoScene === 1
                                                  ? "RADAR: FAST BARRIER GATE"
                                                  : activeVideoScene === 2
                                                    ? "PERIMETER: INDUSTRIAL SECURE"
                                                    : "OFFICIAL: DSTECH SMART PERKASA"}
                                            </span>
                                            <span className="text-amber-300 font-bold">LIVE 4K</span>
                                          </div>
                                        </>
                                      )}

                                      {/* Top Reels Progress Bars (4 Segmen Cerita Otomatis) */}
                                      <div className="pt-3 z-20 space-y-1.5">
                                        <div className="grid grid-cols-4 gap-1 w-full px-0.5">
                                          {[0, 1, 2, 3].map((segIdx) => {
                                            const bounds = [
                                              { start: 0, end: 6 },
                                              { start: 7, end: 14 },
                                              { start: 15, end: 22 },
                                              { start: 23, end: 30 }
                                            ];
                                            const b = bounds[segIdx];
                                            let segPercent = 0;
                                            if (videoProgressSeconds > b.end) {
                                              segPercent = 100;
                                            } else if (videoProgressSeconds >= b.start) {
                                              segPercent = ((videoProgressSeconds - b.start) / (b.end - b.start)) * 100;
                                            }
                                            return (
                                              <div key={segIdx} className="h-1 bg-white/25 rounded-full overflow-hidden">
                                                <div
                                                  className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-300"
                                                  style={{ width: `${Math.min(100, Math.max(0, segPercent))}%` }}
                                                />
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Top Header Bar Info */}
                                        <div className="flex items-center justify-between text-[8.5px] text-white/95 px-0.5">
                                          <span className="font-black flex items-center gap-1 drop-shadow-md">
                                            <span className={`w-2 h-2 rounded-full ${isVideoPlaying ? "bg-rose-500 animate-ping" : "bg-slate-400"}`} />
                                            <span className="tracking-wider">REELS PREVIEW</span>
                                          </span>
                                          <span className="font-mono bg-black/80 px-2 py-0.5 rounded-full border border-white/20 text-amber-300 font-bold">
                                            00:{videoProgressSeconds.toString().padStart(2, "0")} / 00:30
                                          </span>
                                        </div>
                                      </div>

                                      {/* Center Big Play / Pause Overlay Icon */}
                                      {!isVideoPlaying && (
                                        <div className="my-auto mx-auto z-20 flex flex-col items-center gap-2 animate-fadeIn pointer-events-none">
                                          <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                                            <Play className="w-6 h-6 ml-0.5 text-amber-300 fill-amber-300" />
                                          </div>
                                          <span className="text-[10px] font-black text-white bg-black/70 px-2.5 py-0.5 rounded-full border border-white/20 shadow-md">
                                            ▶ Klik Layar untuk Memutar
                                          </span>
                                        </div>
                                      )}

                                      {/* Right Side Social Action Bar (TikTok / Reels Style) */}
                                      <div className="absolute right-2 bottom-18 flex flex-col items-center gap-3 z-20">
                                        {/* Like Button */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIsVideoLiked(!isVideoLiked);
                                          }}
                                          className="flex flex-col items-center group/btn"
                                          title="Sukai Video"
                                        >
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${isVideoLiked
                                              ? "bg-rose-600/90 border-rose-400 scale-110 shadow-lg shadow-rose-600/50"
                                              : "bg-black/60 border-white/20 hover:bg-black/80"
                                            }`}>
                                            <Heart className={`w-4 h-4 transition-transform ${isVideoLiked ? "text-white fill-white scale-110" : "text-white"}`} />
                                          </div>
                                          <span className="text-[8px] font-mono font-bold text-white mt-0.5 drop-shadow">
                                            {(videoLikeCount + (isVideoLiked ? 1 : 0)).toLocaleString("id-ID")}
                                          </span>
                                        </button>

                                        {/* Comment Button */}
                                        <div className="flex flex-col items-center">
                                          <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                                            <MessageSquare className="w-4 h-4" />
                                          </div>
                                          <span className="text-[8px] font-mono font-bold text-white mt-0.5 drop-shadow">128</span>
                                        </div>

                                        {/* Share Button */}
                                        <div className="flex flex-col items-center">
                                          <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                                            <Share2 className="w-4 h-4" />
                                          </div>
                                          <span className="text-[8px] font-mono font-bold text-white mt-0.5 drop-shadow">45</span>
                                        </div>

                                        {/* Spinning Vinyl Disc with Floating Music Icon */}
                                        <div className="relative pt-1 flex flex-col items-center">
                                          <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 border-2 border-slate-600 shadow-lg flex items-center justify-center relative ${isVideoPlaying ? "animate-spin" : ""
                                            }`}>
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950 flex items-center justify-center" />
                                          </div>
                                          {isVideoPlaying && (
                                            <div className="absolute -top-1 -right-1 text-cyan-300 animate-bounce">
                                              <Music className="w-3 h-3" />
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Bottom Section: Kinetic Subtitle, Audio Equalizer & Brand */}
                                      <div className="z-10 space-y-2 max-w-[195px]">
                                        <div className="flex items-center gap-1.5">
                                          <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 font-mono shadow-md">
                                            {previewItem.payload.scenes?.[activeVideoScene]?.timeRange || "00:00 - 00:07"}
                                          </span>
                                          <span className="text-[8.5px] font-bold text-slate-300 drop-shadow truncate">
                                            Adegan {activeVideoScene + 1}/4
                                          </span>
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-amber-500/50 shadow-xl">
                                          <p className="text-[10px] font-black text-amber-300 leading-tight drop-shadow-md">
                                            {previewItem.payload.scenes?.[activeVideoScene]?.captionOverlay || previewItem.payload.hook}
                                          </p>
                                        </div>

                                        <div className="flex items-center justify-between text-[8px] text-slate-200 pt-0.5">
                                          <span className="font-black text-cyan-300 drop-shadow">@dstechsmart</span>
                                          <div className="flex items-end gap-0.5 h-3">
                                            <span className={`w-0.5 bg-emerald-400 rounded-full transition-all ${isVideoPlaying ? "h-3 animate-pulse" : "h-1"}`} />
                                            <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isVideoPlaying ? "h-2.5 animate-bounce" : "h-1.5"}`} />
                                            <span className={`w-0.5 bg-amber-400 rounded-full transition-all ${isVideoPlaying ? "h-3.5 animate-pulse" : "h-1"}`} />
                                            <span className={`w-0.5 bg-rose-400 rounded-full transition-all ${isVideoPlaying ? "h-2 animate-bounce" : "h-1"}`} />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Action Controls Player di Bawah Smartphone */}
                                <div className="mt-3 w-[250px] space-y-2">
                                  {/* TOMBOL UTAMA: RENDER BERKAS VIDEO FISIK NYATA (.MP4) */}
                                  <button
                                    type="button"
                                    onClick={() => handleRenderAndDownloadVideo(previewItem)}
                                    disabled={isRenderingVideo}
                                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${isRenderingVideo
                                        ? "bg-amber-600 text-slate-950 animate-pulse cursor-wait"
                                        : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20"
                                      }`}
                                  >
                                    {isRenderingVideo ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                                        <span>Merender Frame Video... {renderProgress}%</span>
                                      </>
                                    ) : (
                                      <>
                                        <Film className="w-4 h-4 text-slate-950" />
                                        <span>🎬 Render &amp; Unduh File Video Asli (.MP4)</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Tombol Putar / Jeda Video Reels Lengkap */}
                                  <button
                                    type="button"
                                    onClick={handleTogglePlayVideo}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${isVideoPlaying
                                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 animate-pulse"
                                        : "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white shadow-indigo-600/40"
                                      }`}
                                  >
                                    {isVideoPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                                    <span>{isVideoPlaying ? "⏸ Jeda Video Reels" : "▶ Putar Simulasi Reels (30s)"}</span>
                                  </button>

                                  {/* Tombol Reset & Dengarkan Suara Narasi Saja */}
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVideoProgressSeconds(0);
                                        setActiveVideoScene(0);
                                      }}
                                      className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer border border-slate-700"
                                      title="Ulangi dari detik ke-0"
                                    >
                                      <RotateCcw className="w-3 h-3 text-amber-400" />
                                      <span>Ulangi Detik 0</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handlePlayVoiceover(previewItem.payload.scenes?.[activeVideoScene]?.voiceoverText || previewItem.payload.fullVoiceoverScript)}
                                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${isPlayingVoiceover
                                          ? "bg-rose-950/80 text-rose-300 border-rose-500/50"
                                          : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700"
                                        }`}
                                    >
                                      <Volume2 className="w-3 h-3 text-cyan-400" />
                                      <span className="truncate">{isPlayingVoiceover ? "Stop Suara" : "Suara Saja"}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* 4 Storyboard Scenes List with Photo Thumbnails & Live Seek */}
                              <div className="md:col-span-7 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                                    Rangkaian Storyboard 4 Adegan Video:
                                  </span>
                                  <span className="text-[10px] text-cyan-400 font-bold">
                                    (Klik adegan untuk langsung memutar ke detik adegan)
                                  </span>
                                </div>

                                {(previewItem.payload.scenes || []).map((scene: any, idx: number) => (
                                  <div
                                    key={idx}
                                    onClick={() => handleSelectScene(idx)}
                                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${activeVideoScene === idx
                                        ? "bg-indigo-950/70 border-indigo-400 shadow-lg shadow-indigo-900/40 ring-1 ring-indigo-400"
                                        : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                                      }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      {/* Thumbnail Image Foto Produk Nyata */}
                                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-900 relative shadow-inner group">
                                        <img
                                          src={scene.image || previewItem.payload.flyer_image_url || "/service-cctv.png"}
                                          alt={scene.title || `Adegan ${idx + 1}`}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[7.5px] font-mono text-amber-300 font-bold">
                                          {scene.timeRange?.split(" - ")?.[0] || "00:00"}
                                        </span>
                                        {activeVideoScene === idx && isVideoPlaying && (
                                          <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-2xs flex items-center justify-center">
                                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                          <span className="font-black text-white flex items-center gap-1.5 truncate">
                                            <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${activeVideoScene === idx ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
                                              }`}>
                                              {idx + 1}
                                            </span>
                                            <span className="truncate">{scene.title || `Adegan ${idx + 1}`}</span>
                                          </span>
                                          <span className="text-[9.5px] font-mono font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
                                            {scene.timeRange}
                                          </span>
                                        </div>

                                        <p className="text-[10.5px] text-slate-300 leading-snug line-clamp-2 mb-1.5">
                                          <strong className="text-cyan-400">Visual: </strong>{scene.visual}
                                        </p>

                                        <div className="p-1.5 rounded-lg bg-slate-900 text-[10px] border border-slate-800/80 text-emerald-200 flex items-start gap-1">
                                          <Volume2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                          <span className="line-clamp-1">"{scene.voiceoverText}"</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CONTENT TAB 2: CAPTION & HASHTAG */}
                        {activeMediaTab === "caption" && (
                          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-white flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4 text-cyan-400" />
                                <span>Teks Caption Lengkap Siap Salin ke Media Sosial:</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCaption(previewItem.payload.captionText || previewItem.summary)}
                                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/30"
                              >
                                {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedCaption ? "✓ Berhasil Disalin!" : "📋 Salin Seluruh Caption"}</span>
                              </button>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-line leading-relaxed max-h-[280px] overflow-y-auto">
                              {previewItem.payload.captionText || previewItem.summary}
                            </div>

                            {/* Hashtags Cloud */}
                            {Array.isArray(previewItem.payload.hashtags) && previewItem.payload.hashtags.length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-slate-800">
                                <span className="text-[11px] font-bold text-slate-400 block">Rekomendasi Tagar / Hashtag Algoritma:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {previewItem.payload.hashtags.map((ht: string, i: number) => (
                                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 text-[11px] font-mono border border-indigo-800">
                                      {ht}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CONTENT TAB 3: FULL VOICEOVER SCRIPT */}
                        {activeMediaTab === "script" && (
                          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-white flex items-center gap-1.5">
                                <Volume2 className="w-4 h-4 text-emerald-400" />
                                <span>Naskah Narator Voiceover Dubbing (Audio Script):</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handlePlayVoiceover(previewItem.payload.fullVoiceoverScript || previewItem.summary)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md ${isPlayingVoiceover
                                    ? "bg-rose-600 text-white animate-pulse"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                                  }`}
                              >
                                {isPlayingVoiceover ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                <span>{isPlayingVoiceover ? "Hentikan Suara" : "▶ Putar Suara Narator AI"}</span>
                              </button>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-100 whitespace-pre-line leading-relaxed">
                              {previewItem.payload.fullVoiceoverScript || previewItem.summary}
                            </div>

                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                              <span>🎵 Musik Latar: <strong>{previewItem.payload.backgroundAudio || "Corporate Tech Beat (Copyright Free)"}</strong></span>
                              <span>🔊 Bahasa: <strong>Indonesia (Aksara Percakapan Alami)</strong></span>
                            </div>
                          </div>
                        )}

                        {/* CONTENT TAB 4: FLYER PROMOSI 1:1 FEED DENGAN FOTO FISIK PRODUK ASLI */}
                        {activeMediaTab === "flyer" && (
                          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-center">
                            <span className="text-xs font-black text-white block">
                              Pratinjau Poster Flyer Promosi Feed (Aspek Rasio Persegi 1:1)
                            </span>

                            {/* Visual Flyer Card Real Photo */}
                            <div className="w-[320px] h-[320px] mx-auto rounded-3xl bg-slate-950 border-2 border-indigo-500/50 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 group">
                              {/* Background Image Produk Nyata */}
                              <img
                                src={previewItem.payload.flyer_image_url || "/service-cctv.png"}
                                alt="Flyer Produk DSTech"
                                className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
                              />
                              {/* Gradient Dark Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80 pointer-events-none" />

                              {/* Flyer Header: Logo & Badge Garansi */}
                              <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-black text-cyan-300 text-[10px]">
                                    DST
                                  </div>
                                  <span className="text-[10px] font-black tracking-wider text-white">
                                    PT. DSTECH SMART PERKASA
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black tracking-wide shadow-md">
                                  GARANSI RESMI
                                </span>
                              </div>

                              {/* Flyer Center Content: Title & Benefit */}
                              <div className="relative z-10 my-auto text-left space-y-1.5 pt-2">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[9px] font-black border border-cyan-400/30">
                                  SOLUSI KEAMANAN IOT &amp; INDUSTRI
                                </span>
                                <h4 className="text-sm font-black text-white leading-tight drop-shadow-md">
                                  {previewItem.payload.videoTitle || previewItem.title}
                                </h4>
                                <p className="text-[10.5px] text-slate-200 line-clamp-2 leading-snug drop-shadow-sm">
                                  {previewItem.payload.hook || previewItem.summary}
                                </p>
                              </div>

                              {/* Flyer Footer: Contact WhatsApp & Website */}
                              <div className="relative z-10 pt-2 border-t border-white/20 flex items-center justify-between text-[9px] text-white">
                                <span className="flex items-center gap-1 font-bold text-emerald-400">
                                  <span>📲 WA: 0821-2533-3555</span>
                                </span>
                                <span className="font-mono font-bold text-amber-300">
                                  dstechsmart.com
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Modal Footer Controls */}
                  <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isPlayingVoiceover && typeof window !== "undefined" && "speechSynthesis" in window) {
                            window.speechSynthesis.cancel();
                            setIsPlayingVoiceover(false);
                          }
                          setPreviewItem(null);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                      >
                        ✕ Tutup Pratinjau
                      </button>

                      {(previewItem.task_type === "VIDEO_BRANDING" || previewItem.task_type === "SOCIAL_MEDIA_CONTENT") && (
                        <button
                          type="button"
                          onClick={() => handleDownloadScript(previewItem)}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh Naskah (.TXT)</span>
                        </button>
                      )}

                      {(previewItem.task_type === "VIDEO_BRANDING" || previewItem.task_type === "SOCIAL_MEDIA_CONTENT" || previewItem.task_type === "PROMO_CAMPAIGN") && (
                        <button
                          type="button"
                          onClick={() => handleShareToWhatsAppStatus(previewItem)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-200 border border-emerald-500/50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          title="Pasang Teks & Materi Promosi ke Status WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>📲 Pasang ke Status WA</span>
                        </button>
                      )}
                    </div>

                    {previewItem.status === "PENDING_APPROVAL" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteQueueItem(previewItem)}
                          disabled={approvingId === previewItem.id || rejectingId === previewItem.id || deletingId === previewItem.id}
                          className="px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Hapus Usulan Pekerjaan Ini Dari Antrean"
                        >
                          {deletingId === previewItem.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>Hapus Draf</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(previewItem)}
                          disabled={approvingId === previewItem.id || rejectingId === previewItem.id || deletingId === previewItem.id}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        >
                          {rejectingId === previewItem.id ? "Menolak..." : "Tolak Usulan"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(previewItem)}
                          disabled={approvingId === previewItem.id || rejectingId === previewItem.id || deletingId === previewItem.id}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {approvingId === previewItem.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>
                            {approvingId === previewItem.id
                              ? "Memproses..."
                              : previewItem.task_type === "VIDEO_BRANDING" || previewItem.task_type === "SOCIAL_MEDIA_CONTENT" || previewItem.task_type === "PROMO_CAMPAIGN"
                                ? "🚀 Setujui & Publikasikan Otomatis ke Seluruh Medsos"
                                : previewItem.task_type === "INVOICE_PROPOSAL"
                                  ? "📄 Setujui & Terbitkan Faktur Resmi ERP"
                                  : previewItem.task_type === "FIELD_PROGRESS_REPORT"
                                    ? "📋 Setujui Berita Acara & Sahkan Progres"
                                    : "Setujui & Terapkan Resmi ke Database"}
                          </span>
                        </button>
                      </div>
                    ) : previewItem.status === "REJECTED" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                          ✕ Usulan Pekerjaan Ditolak
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteQueueItem(previewItem)}
                          disabled={deletingId === previewItem.id}
                          className="px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === previewItem.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>Hapus Permanen</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Telah Disetujui Resmi
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteQueueItem(previewItem)}
                          disabled={deletingId === previewItem.id}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Hapus Dari Riwayat Antrean"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Arsip</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* EXECUTIVE COMMAND BAR (KOTAK PERINTAH LANGSUNG DARI DIREKTUR UTAMA) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 p-5 rounded-3xl shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                Kotak Perintah Eksekutif Direktur Utama
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  AI GEMINI 2.5 CONNECTED
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Ketik instruksi bisnis apa saja (sales SPH, promo WA, import produk, atau tagihan), AI akan langsung mendelegasikan ke karyawan yang tepat.
              </p>
            </div>
          </div>

          {selectedEmployee && (
            <div className="flex items-center gap-2 bg-indigo-900/60 px-3 py-1.5 rounded-xl border border-indigo-700/60">
              <span className="text-[10px] text-slate-300 font-bold">Target Perintah:</span>
              <span className="text-xs font-black text-amber-300">{selectedEmployee.name}</span>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-white text-xs ml-1"
                title="Batal pilih"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSendCommand} className="flex gap-2">
          <input
            type="text"
            required
            value={executiveCommand}
            onChange={(e) => setExecutiveCommand(e.target.value)}
            placeholder={
              selectedEmployee
                ? `Beri instruksi langsung untuk ${selectedEmployee.name} (contoh: tolong buatkan penawaran SPH)...`
                : "Beri instruksi untuk seluruh kantor (contoh: Bambang tolong follow-up klien PT Krakatau, Dewi siapkan SPH)..."
            }
            className="flex-1 px-4 py-3 bg-slate-950/80 border border-indigo-500/40 rounded-2xl text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
          />

          <button
            type="submit"
            disabled={isSubmittingCommand}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSubmittingCommand ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isSubmittingCommand ? "Mendelegasikan..." : "Instruksikan"}</span>
          </button>
        </form>

        {/* Feedback Response Bubble */}
        {commandSuccessNote && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block text-emerald-300">Respon Karyawan AI:</span>
              <p className="leading-relaxed text-[11px] text-emerald-100">{commandSuccessNote}</p>
            </div>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10.5px]">
          <span className="text-slate-400 font-bold mr-1">Contoh Cepat:</span>
          <button
            type="button"
            onClick={() => setExecutiveCommand("Bambang, tolong follow-up calon klien pabrik kimia Cilegon untuk paket Barrier Gate RFID.")}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            💼 Follow-up Barrier Gate
          </button>
          <button
            type="button"
            onClick={() => setExecutiveCommand("Dewi, tolong siapkan draf SPH penawaran harga dengan opsi PPN Exclude untuk proyek baru.")}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            📑 Siapkan Draf SPH Exclude PPN
          </button>
          <button
            type="button"
            onClick={() => setExecutiveCommand("Nadia, buatkan materi promosi broadcast WhatsApp paket CCTV 8 Channel untuk perumahan.")}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            📢 Promo Broadcast CCTV
          </button>
          <button
            type="button"
            onClick={() => setExecutiveCommand("Reza, cek stok barang barrier gate dan update spesifikasi produk di toko online.")}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            🛍️ Cek Katalog Toko
          </button>
        </div>
      </div>

      {/* DRAWER / MODAL DETAIL KARYAWAN AI */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-indigo-500/40 max-w-xl w-full max-h-[92vh] overflow-y-auto rounded-3xl p-6 text-white shadow-2xl space-y-5 relative">
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setModalAiResponse(null);
                setModalExecutionResult(null);
                setModalDirectCommand("");
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2"
                style={{
                  backgroundColor: selectedEmployee.avatar_color + "25",
                  borderColor: selectedEmployee.avatar_color
                }}
              >
                {selectedEmployee.gender === "female" ? "👩‍💼" : "👨‍💼"}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{selectedEmployee.name}</h3>
                <p className="text-xs text-cyan-400 font-bold">{selectedEmployee.role}</p>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusBadge(selectedEmployee.status)}
                  <span className="text-[10px] text-slate-400 font-mono">Divisi: {selectedEmployee.department}</span>
                </div>
              </div>
            </div>

            {/* Balon Ucapan & Aktivitas Saat Ini */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Apa yang Sedang Dikerjakan:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {selectedEmployee.current_activity}
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-cyan-300 italic">
                &ldquo;{selectedEmployee.speech_bubble}&rdquo;
              </div>
            </div>

            {/* Metrik KPI */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Pencapaian KPI Harian:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                {Object.entries(selectedEmployee.kpi).map(([key, val]) => (
                  <div key={key} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                    <span className="text-xs font-black text-white block">
                      {typeof val === "number" ? val.toLocaleString("id-ID") : String(val)}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                      {key.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keahlian Karyawan AI */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Spesialisasi &amp; Keahlian:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedEmployee.skills.map((sk, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 rounded-lg text-[10px] font-medium">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* THREAD PERCAKAPAN LANGSUNG DUA ARAH DENGAN KARYAWAN AI (Tugas 341) */}
            {(() => {
              const currentEmployeeChat = (selectedEmployee && conversations[selectedEmployee.id]) || [];
              return (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Riwayat Obrolan &amp; Memori Dialog:</span>
                    </span>
                    {currentEmployeeChat.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleClearEmployeeChat(selectedEmployee.id)}
                        className="text-[10.5px] text-slate-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition font-medium"
                        title="Bersihkan riwayat percakapan dengan staf ini"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Obrolan</span>
                      </button>
                    )}
                  </div>

                  {/* Chat Thread Container */}
                  <div className="max-h-60 overflow-y-auto space-y-2.5 p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-inner">
                    {currentEmployeeChat.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-xs">
                        <Bot className="w-7 h-7 text-slate-600 mx-auto mb-1.5 opacity-60" />
                        <p className="font-semibold text-slate-400">Belum ada riwayat dialog dengan {selectedEmployee.name}.</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Ketik instruksi di bawah atau klik contoh perintah untuk mulai berdialog.</p>
                      </div>
                    ) : (
                      currentEmployeeChat.map((msg: any) => (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.sender === "agent" && (
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 border mt-0.5"
                              style={{
                                backgroundColor: selectedEmployee.avatar_color + "25",
                                borderColor: selectedEmployee.avatar_color
                              }}
                            >
                              {selectedEmployee.gender === "female" ? "👩‍💼" : "👨‍💼"}
                            </div>
                          )}

                          <div
                            className={`max-w-[85%] rounded-2xl p-2.5 text-xs leading-relaxed shadow-md ${
                              msg.sender === "user"
                                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none"
                                : "bg-slate-800/95 text-slate-100 border border-slate-700/80 rounded-tl-none"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-[9px] opacity-75 mb-1 pb-1 border-b border-white/10">
                              <span className="font-bold">
                                {msg.sender === "user" ? "Direktur Utama (Bpk. Ramadhani ST)" : selectedEmployee.name}
                              </span>
                              <span className="font-mono">
                                {new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="whitespace-pre-line font-medium text-[11.5px]">{msg.text}</p>
                            {msg.attachment && (
                              <div className="mt-2 p-2 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <Paperclip className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                  <div className="truncate">
                                    <span className="text-cyan-300 font-semibold truncate block text-[11px]">
                                      {msg.attachment.originalName || msg.attachment.fileName}
                                    </span>
                                    {msg.attachment.size && (
                                      <span className="text-[9px] text-slate-400 font-mono">
                                        {(msg.attachment.size / 1024).toFixed(1)} KB
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <a
                                  href={msg.attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-[10px] font-bold shrink-0 transition flex items-center gap-1"
                                >
                                  <span>Unduh</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            )}
                            {msg.contextPayload?.link && (
                              <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                                <span className="text-emerald-400 font-bold">✓ Usulan telah dibuat</span>
                                <a
                                  href={msg.contextPayload.link}
                                  className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[9.5px] font-bold transition flex items-center gap-1 shadow-sm"
                                >
                                  <span>Lihat di Antrean</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            )}
                          </div>

                          {msg.sender === "user" && (
                            <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-300 font-bold text-[9px] shrink-0 mt-0.5">
                              DIR
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>
              );
            })()}

            {/* Form Chat & Instruksi Langsung ke Karyawan Ini */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const commandToSend = modalDirectCommand.trim() || (attachedFile ? `Tolong buatkan draf penawaran harga SPH dari file inquiry terlampir: ${attachedFile.originalName}` : "");
                if (!commandToSend || isSubmittingModalCommand) return;
                setIsSubmittingModalCommand(true);
                try {
                  const res = await fetch("/api/ai-workforce", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "order",
                      command: commandToSend,
                      employeeId: selectedEmployee.id,
                      attachment: attachedFile,
                    }),
                  });
                  const json = await res.json();
                  if (json.success) {
                    if (json.targetedEmployee) {
                      setSelectedEmployee(json.targetedEmployee);
                    }
                    if (json.executionResult) {
                      setModalExecutionResult(json.executionResult);
                    }
                    if (json.aiResponse) {
                      setModalAiResponse(json.aiResponse);
                    }
                    if (json.conversations) {
                      setConversations(json.conversations);
                    } else if (json.employeeConversation && selectedEmployee) {
                      setConversations((prev) => ({ ...prev, [selectedEmployee.id]: json.employeeConversation }));
                    }
                    setModalDirectCommand("");
                    setAttachedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    fetchWorkforce();
                  } else {
                    alert(json.error || "Gagal memproses instruksi");
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSubmittingModalCommand(false);
                }
              }}
              className="pt-2 space-y-3"
            >
              {/* Tautan Cepat Hasil Eksekusi Tugas */}
              {modalExecutionResult && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <span className="text-emerald-300 font-medium text-[11px]">
                    ✓ Tugas berhasil dieksekusi secara otonom!
                  </span>
                  {modalExecutionResult.link && (
                    <a
                      href={modalExecutionResult.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Lihat Hasil di ERP</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Pratinjau Berkas Lampiran Inquiry (Jika Ada) */}
              {attachedFile && (
                <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/80 border border-cyan-500/50 rounded-xl text-xs text-cyan-200 shadow-lg animate-in fade-in slide-in-from-bottom-1">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-300">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="font-bold truncate text-[11.5px] block text-cyan-100">{attachedFile.originalName}</span>
                      <span className="text-[9.5px] text-cyan-400 font-mono">
                        {(attachedFile.size / 1024).toFixed(1)} KB • Siap dipelajari AI untuk draf SPH
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition cursor-pointer shrink-0"
                    title="Batalkan lampiran file ini"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Contoh Perintah Siap Pakai Spesifik Karyawan */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Contoh Perintah Siap Pakai untuk {selectedEmployee.name}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {getQuickSuggestions(selectedEmployee.id).map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setModalDirectCommand(sug.text)}
                      className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10.5px] border border-slate-700 hover:border-cyan-500/50 transition cursor-pointer text-left"
                      title="Klik untuk memasukkan instruksi ini ke kotak input"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kirim Perintah Langsung ke {selectedEmployee.name}:</span>
                </span>
                {isSubmittingModalCommand && (
                  <span className="text-[10px] text-cyan-400 font-mono animate-pulse">
                    Sedang memproses instruksi &amp; mengeksekusi...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Input File Tersembunyi (Excel, Gambar, PDF) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  className="hidden"
                />

                {/* Tombol Lampiran Berkas Paperclip */}
                <button
                  type="button"
                  disabled={isUploadingAttachment || isSubmittingModalCommand}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/60 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                  title="Lampirkan File Inquiry Client (Excel .xlsx, Gambar/Foto, PDF)"
                >
                  {isUploadingAttachment ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </button>

                <input
                  type="text"
                  value={modalDirectCommand}
                  onChange={(e) => setModalDirectCommand(e.target.value)}
                  placeholder={
                    attachedFile
                      ? `File terlampir! Ketik instruksi tambahan untuk ${selectedEmployee.name} (atau langsung Kirim)...`
                      : `Ketik instruksi untuk ${selectedEmployee.name}... (Enter untuk kirim)`
                  }
                  disabled={isSubmittingModalCommand}
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isSubmittingModalCommand || (!modalDirectCommand.trim() && !attachedFile)}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
