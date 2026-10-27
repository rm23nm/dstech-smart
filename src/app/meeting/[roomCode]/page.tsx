"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Share2,
  Users,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Info,
  RotateCcw,
  Clock,
  UserCheck,
  Send,
  HelpCircle,
} from "lucide-react";

interface MeetingInfo {
  id: string;
  roomCode: string;
  title: string;
  description: string;
  scheduledAt: string;
  status: "ACTIVE" | "UPCOMING" | "ENDED";
  meetingType: "INTERNAL_STAF" | "KONSULTASI_KLIEN" | "MAINTENANCE_SURVEY";
  hostName: string;
  hostRole: string;
  jitsiRoomName: string;
  participants?: any[];
}

export default function SmartphoneMeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params?.roomCode as string) || "meeting-umum";

  const [meeting, setMeeting] = useState<MeetingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [participantRole, setParticipantRole] = useState("GUEST");
  const [isCopied, setIsCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Ambil profil login jika ada di smartphone (dari portal employee atau admin)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const emp = localStorage.getItem("dstech_employee_auth");
        if (emp) {
          const parsed = JSON.parse(emp);
          setParticipantName(parsed.name || parsed.username || "");
          setParticipantRole("TEKNISI / STAF");
        } else {
          const adm = localStorage.getItem("dstech_admin_auth");
          if (adm) {
            const parsed = JSON.parse(adm);
            setParticipantName(parsed.name || parsed.username || "");
            setParticipantRole("ADMIN / HOST");
          }
        }
      } catch {}
    }

    fetchMeetingInfo();
  }, [roomCode]);

  const fetchMeetingInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/meetings?roomCode=${encodeURIComponent(roomCode)}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setMeeting(data.data);
      } else {
        // Fallback room dinamis jika room code dibuat instan
        setMeeting({
          id: "meet_instant_" + roomCode,
          roomCode: roomCode,
          title: `Ruang Video Meeting: ${roomCode.replace(/-/g, " ").toUpperCase()}`,
          description: "Ruang video conference interaktif smartphone PT. DSTech Smart Perkasa",
          scheduledAt: "Instan",
          status: "ACTIVE",
          meetingType: "INTERNAL_STAF",
          hostName: "Tim DSTech Smart",
          hostRole: "ADMIN",
          jitsiRoomName: `dstechsmart_${roomCode.replace(/[^a-zA-Z0-9]/g, "_")}`,
        });
      }
    } catch (e) {
      console.error("Gagal load detail meeting:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) {
      alert("Silakan masukkan nama Anda sebelum bergabung ke meeting.");
      return;
    }

    try {
      // Catat presensi peserta meeting ke backend
      await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join_participant",
          roomCode,
          participantName: participantName.trim(),
          participantRole,
        }),
      });
    } catch {}

    setHasJoined(true);
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const msg = `Halo, mari bergabung ke Ruang Video Meeting PT. DSTech Smart Perkasa:
📌 *Agenda*: ${meeting?.title || "Meeting Koordinasi"}
👤 *Host*: ${meeting?.hostName || "DSTech Smart"}
🔗 *Tautan Langsung*: ${url}

Bisa langsung dibuka di smartphone Android / browser tanpa perlu install aplikasi rumit. Terima kasih!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const currentJitsiUrl = () => {
    const room = meeting?.jitsiRoomName || `dstechsmart_${roomCode.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const name = encodeURIComponent(participantName || "Staf DSTech");
    // Konfigurasi parameter URL Jitsi Meet open cluster yang ringan untuk smartphone
    return `https://meet.jit.si/${room}#userInfo.displayName="${name}"&config.startWithAudioMuted=${isMuted}&config.startWithVideoMuted=${isVideoOff}&config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=['microphone','camera','closedcaptions','desktop','embedmeeting','fullscreen','fodeviceselection','hangup','profile','chat','recording','livestreaming','etherpad','sharedvideo','settings','raisehand','videoquality','filmstrip','invite','feedback','stats','shortcuts','tileview','videobackgroundblur','download','help','mute-everyone','e2ee']`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-bold text-slate-300">Menghubungkan ke Ruang Rapat Smartphone...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Top Header Khusus Smartphone */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              if (hasJoined) {
                if (confirm("Apakah Anda ingin keluar dari video meeting?")) {
                  setHasJoined(false);
                }
              } else {
                router.back();
              }
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 truncate">
                DSTECH SMART MEETING
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {meeting?.title}
            </h1>
          </div>
        </div>

        {/* Quick Action Share & Info */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopyLink}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Salin Tautan Ruang Rapat"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isCopied ? "Tersalin!" : "Salin Link"}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            title="Bagikan Undangan via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undang WA</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col p-2 sm:p-4 w-full max-w-6xl mx-auto">
        {!hasJoined ? (
          /* PRE-JOIN SCREEN: Tampilan Smartphone Sebelum Masuk Room */
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
              {/* Meeting Badge Card */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                  {meeting?.meetingType === "INTERNAL_STAF"
                    ? "Briefing Internal Staf & Teknisi"
                    : meeting?.meetingType === "KONSULTASI_KLIEN"
                    ? "Konsultasi Online Klien B2B"
                    : "Troubleshooting Lapangan"}
                </div>
                <h2 className="text-base sm:text-lg font-black text-white">{meeting?.title}</h2>
                <p className="text-xs text-slate-400 line-clamp-2">{meeting?.description}</p>
              </div>

              {/* Host & Security Info */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Host Pertemuan:
                  </span>
                  <span className="font-bold text-white">{meeting?.hostName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Jadwal / Waktu:
                  </span>
                  <span className="font-semibold text-amber-400">{meeting?.scheduledAt}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Keamanan:
                  </span>
                  <span className="font-semibold text-emerald-400">Terenkripsi WebRTC P2P</span>
                </div>
              </div>

              {/* Form Masuk Room */}
              <form onSubmit={handleJoinMeeting} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nama Anda di Layar Rapat <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso (Teknisi CCTV)"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Pre-join Toggles Mic & Video */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isMuted
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "bg-slate-950 border-slate-800 text-slate-300"
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                    <span>{isMuted ? "Mic Mati" : "Mic Aktif"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isVideoOff
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "bg-slate-950 border-slate-800 text-slate-300"
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="w-4 h-4 text-rose-400" /> : <Video className="w-4 h-4 text-indigo-400" />}
                    <span>{isVideoOff ? "Kamera Mati" : "Kamera Aktif"}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-emerald-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video className="w-5 h-5" />
                  Masuk ke Ruang Rapat Sekarang
                </button>
              </form>

              {/* Tips Smartphone */}
              <div className="text-[11px] text-slate-400 flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Teknisi lapangan dapat membalik kamera (Flip Cam) untuk menyorot jalur kabel &amp; perangkat langsung.</span>
              </div>
            </div>
          </div>
        ) : (
          /* IN-MEETING SCREEN: Video Call Player Berjalan */
          <div className="flex-1 flex flex-col bg-black border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative min-h-[75vh]">
            <iframe
              src={currentJitsiUrl()}
              className="w-full h-full flex-1 border-0"
              allow="camera; microphone; display-capture; autoplay; clipboard-write; speaker"
              title="DSTech Smart Video Conference"
            />

            {/* Bottom Quick Control Bar */}
            <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[11px] font-bold text-slate-300">
                  Terhubung: <strong className="text-white">{participantName}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Undang WA</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm("Tinggalkan ruang video meeting ini?")) {
                      setHasJoined(false);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="py-2.5 px-4 text-center border-t border-slate-900 text-[10px] text-slate-500">
        PT. DSTech Smart Perkasa • Video Conference Suite for Smartphone &amp; Field Engineering
      </footer>
    </div>
  );
}
