"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  Copy,
  Check,
  Smartphone,
  RotateCcw,
  Clock,
  UserCheck,
  Send,
  ScreenShare,
  X,
  Radio,
  Settings,
  Wifi,
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
}

interface PeerState {
  id: string;
  name: string;
  role: string;
  stream?: MediaStream;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

interface ChatMessage {
  id: string;
  fromName: string;
  fromRole: string;
  message: string;
  timestamp: string;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function NativeWebRTCMeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params?.roomCode as string) || "meeting-umum";

  // Identitas & State Meeting
  const [myPeerId] = useState(() => `peer_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`);
  const [meeting, setMeeting] = useState<MeetingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [participantRole, setParticipantRole] = useState("GUEST");
  const [isCopied, setIsCopied] = useState(false);

  // Kontrol Media
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Chat Drawer
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputChat, setInputChat] = useState("");
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // WebRTC Media Stream Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [remotePeers, setRemotePeers] = useState<Map<string, PeerState>>(new Map());
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Mengambil Profil Pengguna yang Tersimpan (Employee Portal atau Admin)
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
        setMeeting({
          id: "meet_native_" + roomCode,
          roomCode: roomCode,
          title: `Ruang Rapat Native: ${roomCode.replace(/-/g, " ").toUpperCase()}`,
          description: "Video Conference Native WebRTC Mandiri PT. DSTech Smart Perkasa",
          scheduledAt: "Instan",
          status: "ACTIVE",
          meetingType: "INTERNAL_STAF",
          hostName: "Tim DSTech Smart",
          hostRole: "ADMIN",
        });
      }
    } catch (e) {
      console.error("Gagal load info meeting:", e);
    } finally {
      setLoading(false);
    }
  };

  // Setup Kamera Lokal (Pre-Join Preview)
  useEffect(() => {
    let active = true;

    async function initCameraPreview() {
      try {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((t) => t.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoOff ? false : { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;

        // Terapkan mute awal
        stream.getAudioTracks().forEach((t) => {
          t.enabled = !isMuted;
        });

        if (previewVideoRef.current && !hasJoined) {
          previewVideoRef.current.srcObject = stream;
        }
        if (localVideoRef.current && hasJoined) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Gagal membuka kamera / mikrofon:", err);
      }
    }

    if (!hasJoined) {
      initCameraPreview();
    }

    return () => {
      active = false;
    };
  }, [facingMode, hasJoined]);

  // Update enable/disable audio dan video track saat toggle berubah
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !isMuted;
      });
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !isVideoOff;
      });
    }

    // Beritahu peer lain via signaling
    if (hasJoined) {
      fetch("/api/meetings/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          peerId: myPeerId,
          action: "update_status",
          payload: { isMuted, isVideoOff },
        }),
      }).catch(() => {});
    }
  }, [isMuted, isVideoOff, hasJoined, myPeerId, roomCode]);

  // Fungsi Pembuatan Peer Connection ke Remote Peer
  const createPeerConnection = useCallback(
    (targetPeerId: string, targetName: string, targetRole: string) => {
      if (peerConnectionsRef.current.has(targetPeerId)) {
        return peerConnectionsRef.current.get(targetPeerId)!;
      }

      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionsRef.current.set(targetPeerId, pc);

      // Tambahkan track lokal ke peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Kirim ICE candidate ke signaling server saat ditemukan
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          fetch("/api/meetings/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomCode,
              peerId: myPeerId,
              action: "signal",
              payload: {
                toPeerId: targetPeerId,
                type: "candidate",
                data: event.candidate,
              },
            }),
          }).catch(() => {});
        }
      };

      // Terima media stream dari remote peer
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemotePeers((prev) => {
          const next = new Map(prev);
          const existing = next.get(targetPeerId) || { id: targetPeerId, name: targetName, role: targetRole };
          next.set(targetPeerId, { ...existing, stream: remoteStream });
          return next;
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
          pc.close();
          peerConnectionsRef.current.delete(targetPeerId);
          setRemotePeers((prev) => {
            const next = new Map(prev);
            next.delete(targetPeerId);
            return next;
          });
        }
      };

      return pc;
    },
    [myPeerId, roomCode]
  );

  // Inisiasi Panggilan / Offer ke Peer yang Baru Masuk
  const initiateCall = useCallback(
    async (targetPeerId: string, targetName: string, targetRole: string) => {
      try {
        const pc = createPeerConnection(targetPeerId, targetName, targetRole);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await fetch("/api/meetings/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomCode,
            peerId: myPeerId,
            action: "signal",
            payload: {
              toPeerId: targetPeerId,
              type: "offer",
              data: offer,
              fromPeerName: participantName,
              fromPeerRole: participantRole,
            },
          }),
        });
      } catch (err) {
        console.error("Gagal inisiasi WebRTC call:", err);
      }
    },
    [createPeerConnection, myPeerId, participantName, participantRole, roomCode]
  );

  // Polling Signaling Server (1000ms) saat sudah bergabung ke room
  useEffect(() => {
    if (!hasJoined) return;

    let isPolling = true;

    async function pollSignals() {
      try {
        const res = await fetch(
          `/api/meetings/signal?roomCode=${encodeURIComponent(roomCode)}&peerId=${encodeURIComponent(myPeerId)}&t=${Date.now()}`
        );
        const json = await res.json();

        if (json.success && isPolling) {
          const { peers, signals, chats } = json.data;

          // Update data chat
          if (Array.isArray(chats)) {
            setChatMessages(chats);
          }

          // Cek peer lain yang ada di room
          if (Array.isArray(peers)) {
            peers.forEach((p: any) => {
              if (p.id !== myPeerId) {
                setRemotePeers((prev) => {
                  const next = new Map(prev);
                  const curr = next.get(p.id) || { id: p.id, name: p.name, role: p.role };
                  next.set(p.id, {
                    ...curr,
                    name: p.name,
                    role: p.role,
                    isMuted: p.isMuted,
                    isVideoOff: p.isVideoOff,
                  });
                  return next;
                });
              }
            });
          }

          // Proses sinyal masuk
          if (Array.isArray(signals)) {
            for (const sig of signals) {
              const { fromPeerId, fromPeerName, fromPeerRole, type, data } = sig;

              if (type === "status" && data?.action === "peer_joined") {
                // Peer baru masuk: jika peer ID kita lebih kecil secara leksikografis, kita jadi caller
                if (myPeerId < fromPeerId) {
                  initiateCall(fromPeerId, fromPeerName || "Peserta", fromPeerRole || "GUEST");
                }
              } else if (type === "offer") {
                const pc = createPeerConnection(fromPeerId, fromPeerName || "Peserta", fromPeerRole || "GUEST");
                await pc.setRemoteDescription(new RTCSessionDescription(data));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                await fetch("/api/meetings/signal", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    roomCode,
                    peerId: myPeerId,
                    action: "signal",
                    payload: {
                      toPeerId: fromPeerId,
                      type: "answer",
                      data: answer,
                      fromPeerName: participantName,
                      fromPeerRole: participantRole,
                    },
                  }),
                });
              } else if (type === "answer") {
                const pc = peerConnectionsRef.current.get(fromPeerId);
                if (pc && pc.signalingState !== "stable") {
                  await pc.setRemoteDescription(new RTCSessionDescription(data));
                }
              } else if (type === "candidate") {
                const pc = peerConnectionsRef.current.get(fromPeerId);
                if (pc) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(data));
                  } catch (e) {
                    // Candidate out-of-order bisa diabaikan
                  }
                }
              } else if (type === "chat") {
                if (!isChatOpen) {
                  setUnreadChatCount((c) => c + 1);
                }
              } else if (type === "leave") {
                const pc = peerConnectionsRef.current.get(fromPeerId);
                if (pc) {
                  pc.close();
                  peerConnectionsRef.current.delete(fromPeerId);
                }
                setRemotePeers((prev) => {
                  const next = new Map(prev);
                  next.delete(fromPeerId);
                  return next;
                });
              }
            }
          }
        }
      } catch (e) {
        // Abaikan error network transient
      } finally {
        if (isPolling) {
          setTimeout(pollSignals, 1000);
        }
      }
    }

    pollSignals();

    return () => {
      isPolling = false;
    };
  }, [hasJoined, myPeerId, roomCode, createPeerConnection, initiateCall, isChatOpen]);

  // Bergabung ke Room
  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) {
      alert("Silakan masukkan nama Anda sebelum bergabung ke meeting.");
      return;
    }

    try {
      // 1. Registrasi ke signaling server
      await fetch("/api/meetings/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          peerId: myPeerId,
          action: "join",
          payload: {
            name: participantName.trim(),
            role: participantRole,
            isMuted,
            isVideoOff,
          },
        }),
      });

      // 2. Catat presensi peserta meeting ke backend resmi
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
    } catch (err) {
      console.warn("Gagal presensi join:", err);
    }

    setHasJoined(true);

    // Tempelkan video lokal ke elemen player
    setTimeout(() => {
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }, 200);
  };

  // Balik Kamera (Flip Camera Depan / Belakang untuk Teknisi Smartphone)
  const handleFlipCamera = async () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (newVideoTrack && localStreamRef.current) {
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (oldVideoTrack) {
          oldVideoTrack.stop();
          localStreamRef.current.removeTrack(oldVideoTrack);
        }
        localStreamRef.current.addTrack(newVideoTrack);

        // Ganti track di semua peer connection
        peerConnectionsRef.current.forEach((pc) => {
          const senders = pc.getSenders();
          const sender = senders.find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(newVideoTrack);
          }
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }
    } catch (err) {
      alert("Kamera perangkat tidak mendukung peralihan kamera (flip camera).");
    }
  };

  // Berbagi Layar (Screen Share)
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Kembali ke kamera
      handleFlipCamera();
      setIsScreenSharing(false);
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const screenTrack = displayStream.getVideoTracks()[0];
      if (screenTrack && localStreamRef.current) {
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (oldVideoTrack) {
          oldVideoTrack.stop();
          localStreamRef.current.removeTrack(oldVideoTrack);
        }
        localStreamRef.current.addTrack(screenTrack);

        peerConnectionsRef.current.forEach((pc) => {
          const senders = pc.getSenders();
          const sender = senders.find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }

        setIsScreenSharing(true);

        screenTrack.onended = () => {
          setIsScreenSharing(false);
          handleFlipCamera();
        };
      }
    } catch (err) {
      console.warn("Screen share dibatalkan / tidak didukung:", err);
    }
  };

  // Kirim Pesan Chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    const text = inputChat.trim();
    setInputChat("");

    try {
      await fetch("/api/meetings/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          peerId: myPeerId,
          action: "chat",
          payload: {
            message: text,
            fromName: participantName || "Peserta",
            fromRole: participantRole,
          },
        }),
      });
    } catch {}

    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 100);
  };

  // Keluar dari Ruang Meeting
  const handleLeaveMeeting = async () => {
    if (confirm("Apakah Anda ingin keluar dari video meeting?")) {
      try {
        await fetch("/api/meetings/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomCode,
            peerId: myPeerId,
            action: "leave",
          }),
        });
      } catch {}

      // Hentikan semua track
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();

      setHasJoined(false);
      router.back();
    }
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const msg = `Halo, mari bergabung ke Ruang Video Meeting Native PT. DSTech Smart Perkasa:
📌 *Agenda*: ${meeting?.title || "Meeting Koordinasi"}
👤 *Host*: ${meeting?.hostName || "DSTech Smart"}
🔗 *Tautan Langsung*: ${url}

Aplikasi Native WebRTC Mandiri DSTech Smart, langsung terbuka di HP tanpa aplikasi pihak ketiga.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-bold text-slate-300">Menghubungkan ke Ruang Rapat Native WebRTC DSTech...</p>
      </div>
    );
  }

  // Hitung Total Peserta
  const totalPeersCount = 1 + remotePeers.size;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              if (hasJoined) {
                handleLeaveMeeting();
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
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 truncate flex items-center gap-1">
                <span>DSTECH NATIVE WEBRTC MEET</span>
                <span className="hidden md:inline px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">
                  P2P IN-HOUSE
                </span>
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-md">
              {meeting?.title}
            </h1>
          </div>
        </div>

        {/* Quick Action Share & Info */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold">{totalPeersCount} Peserta</span>
          </div>

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
      <main className="flex-1 flex flex-col p-2 sm:p-4 w-full max-w-7xl mx-auto h-[calc(100vh-100px)]">
        {!hasJoined ? (
          /* PRE-JOIN LOBBY: Kamera Preview & Setup Sebelum Masuk */
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
              {/* Camera Preview Box */}
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-inner group">
                <video
                  ref={previewVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                />

                {isVideoOff && (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <VideoOff className="w-10 h-10 text-slate-600" />
                    <span className="text-xs font-bold">Kamera Dinonaktifkan</span>
                  </div>
                )}

                {/* Floating Preview Controls */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 rounded-xl transition-all ${
                      isMuted ? "bg-rose-500 text-white" : "bg-slate-800 text-emerald-400 hover:bg-slate-700"
                    }`}
                    title={isMuted ? "Buka Mic" : "Matikan Mic"}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-2 rounded-xl transition-all ${
                      isVideoOff ? "bg-rose-500 text-white" : "bg-slate-800 text-indigo-400 hover:bg-slate-700"
                    }`}
                    title={isVideoOff ? "Nyalakan Kamera" : "Matikan Kamera"}
                  >
                    {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleFlipCamera}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                    title="Balik Kamera (Depan / Belakang)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meeting Badge Card */}
              <div className="text-center space-y-1">
                <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  {meeting?.meetingType === "INTERNAL_STAF"
                    ? "Briefing Staf & Teknisi"
                    : meeting?.meetingType === "KONSULTASI_KLIEN"
                    ? "Konsultasi Klien B2B"
                    : "Survei & Troubleshooting Lapangan"}
                </div>
                <h2 className="text-base sm:text-lg font-black text-white">{meeting?.title}</h2>
                <p className="text-xs text-slate-400 line-clamp-1">{meeting?.description}</p>
              </div>

              {/* Form Masuk Room */}
              <form onSubmit={handleJoinMeeting} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Anda di Layar Rapat <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso (Teknisi Lapangan)"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Role / Peran Anda</label>
                  <select
                    value={participantRole}
                    onChange={(e) => setParticipantRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TEKNISI / STAF">Teknisi / Staf Lapangan</option>
                    <option value="ADMIN / HOST">Admin / Pimpinan Rapat</option>
                    <option value="SUPERVISOR">Supervisor Proyek</option>
                    <option value="KLIEN / MITRA">Klien / Mitra B2B</option>
                    <option value="GUEST">Tamu Undangan</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-emerald-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video className="w-5 h-5" />
                  Masuk ke Ruang Rapat Native Sekarang
                </button>
              </form>

              {/* Info Native */}
              <div className="text-[11px] text-slate-400 flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Native WebRTC In-House PT. DSTech Smart Perkasa. Aman &amp; langsung tanpa aplikasi luar.</span>
              </div>
            </div>
          </div>
        ) : (
          /* IN-MEETING VIEW: Native Video Grid & Controls */
          <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 relative">
            {/* Grid Video Peserta */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 p-2 relative">
              <div
                className={`flex-1 grid gap-2.5 min-h-0 ${
                  totalPeersCount === 1
                    ? "grid-cols-1"
                    : totalPeersCount === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : totalPeersCount <= 4
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-2 md:grid-cols-3"
                }`}
              >
                {/* 1. Video Tile Lokal (Anda Sendiri) */}
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-lg group">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${
                      facingMode === "user" && !isScreenSharing ? "scale-x-[-1]" : ""
                    }`}
                  />

                  {isVideoOff && (
                    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl font-black text-indigo-400">
                        {participantName.substring(0, 2).toUpperCase() || "ME"}
                      </div>
                      <span className="text-xs font-bold text-slate-400">Kamera Mati</span>
                    </div>
                  )}

                  {/* Label Nama & Status Lokal */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800/80">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="font-bold text-white text-[11px] truncate max-w-[120px]">
                        {participantName} (Anda)
                      </span>
                      <span className="text-[9px] px-1 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                        {participantRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800/80">
                      {isMuted ? (
                        <MicOff className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Video Tiles Peserta Lain (Remote Peers) */}
                {Array.from(remotePeers.values()).map((peer) => (
                  <RemotePeerTile key={peer.id} peer={peer} />
                ))}
              </div>

              {/* Bottom Meeting Controls Bar */}
              <div className="mt-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-2xl">
                {/* Left Info */}
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>P2P Terhubung ({totalPeersCount})</span>
                  </span>
                </div>

                {/* Center Action Controls */}
                <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
                  {/* Mute Mic Toggle */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-2xl transition-all shadow-md ${
                      isMuted
                        ? "bg-rose-600 text-white shadow-rose-600/30"
                        : "bg-slate-800 text-emerald-400 hover:bg-slate-700"
                    }`}
                    title={isMuted ? "Buka Mikrofon" : "Matikan Mikrofon"}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {/* Video Camera Toggle */}
                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-3 rounded-2xl transition-all shadow-md ${
                      isVideoOff
                        ? "bg-rose-600 text-white shadow-rose-600/30"
                        : "bg-slate-800 text-indigo-400 hover:bg-slate-700"
                    }`}
                    title={isVideoOff ? "Nyalakan Kamera" : "Matikan Kamera"}
                  >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>

                  {/* Flip Camera (Kamera Belakang Lapangan untuk Teknisi CCTV) */}
                  <button
                    onClick={handleFlipCamera}
                    className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all shadow-md"
                    title="Balik Kamera (Depan / Belakang)"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  {/* Screen Share (Bagi Layar) */}
                  <button
                    onClick={handleToggleScreenShare}
                    className={`p-3 rounded-2xl transition-all shadow-md ${
                      isScreenSharing
                        ? "bg-amber-600 text-white shadow-amber-600/30"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                    title={isScreenSharing ? "Hentikan Bagi Layar" : "Bagi Layar (Screen Share)"}
                  >
                    <ScreenShare className="w-5 h-5" />
                  </button>

                  {/* Chat Toggle Button */}
                  <button
                    onClick={() => {
                      setIsChatOpen(!isChatOpen);
                      setUnreadChatCount(0);
                    }}
                    className={`relative p-3 rounded-2xl transition-all shadow-md ${
                      isChatOpen
                        ? "bg-indigo-600 text-white shadow-indigo-600/30"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                    title="Obrolan Pesan Teks"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {unreadChatCount > 0 && !isChatOpen && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
                        {unreadChatCount}
                      </span>
                    )}
                  </button>

                  {/* End Call / Leave Meeting Button */}
                  <button
                    onClick={handleLeaveMeeting}
                    className="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/40 transition-all cursor-pointer"
                    title="Tinggalkan Ruang Rapat"
                  >
                    <PhoneOff className="w-5 h-5" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>

                {/* Right Share Button */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    onClick={handleShareWhatsApp}
                    className="px-3 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                    title="Undang Rekan via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Undang WA</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Drawer Sidebar */}
            {isChatOpen && (
              <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-64 md:h-full overflow-hidden shadow-2xl shrink-0">
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Obrolan Ruang Rapat</span>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Pesan Chat List */}
                <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-[11px]">Belum ada pesan obrolan.</p>
                      <p className="text-[10px] text-slate-600">Kirim pesan pertama Anda di bawah.</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-xl border ${
                          msg.fromName === participantName
                            ? "bg-indigo-600/20 border-indigo-500/30 ml-4"
                            : "bg-slate-950/60 border-slate-800 mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-white truncate max-w-[120px]">{msg.fromName}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="text-slate-200 text-xs break-words">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Form Kirim Chat */}
                <form onSubmit={handleSendChat} className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Tulis pesan..."
                    value={inputChat}
                    onChange={(e) => setInputChat(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="py-2 px-4 text-center border-t border-slate-900 text-[10px] text-slate-500">
        PT. DSTech Smart Perkasa • Native WebRTC Video Conference Suite (In-House Application)
      </footer>
    </div>
  );
}

// Sub-komponen Video Tile Remote Peer
function RemotePeerTile({ peer }: { peer: PeerState }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-lg group">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

      {(!peer.stream || peer.isVideoOff) && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-2">
          <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-xl font-black text-emerald-400">
            {peer.name.substring(0, 2).toUpperCase() || "PEER"}
          </div>
          <span className="text-xs font-bold text-slate-400">
            {peer.isVideoOff ? "Kamera Dimatikan" : "Menghubungkan Stream..."}
          </span>
        </div>
      )}

      {/* Label Nama & Status Peer */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs pointer-events-none">
        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800/80">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-bold text-white text-[11px] truncate max-w-[120px]">{peer.name}</span>
          <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold">{peer.role}</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800/80">
          {peer.isMuted ? (
            <MicOff className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </div>
      </div>
    </div>
  );
}
