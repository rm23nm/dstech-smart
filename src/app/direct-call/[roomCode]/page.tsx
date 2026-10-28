"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Phone,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Wifi,
} from "lucide-react";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function DirectCallPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomCode = (params?.roomCode as string) || "call-direct";
  const callType = (searchParams?.get("callType") as "audio" | "video") || "audio";
  const callId = searchParams?.get("callId") || "";
  const initialPeerName = searchParams?.get("peerName") || "Rekan Tim";
  const isAutoAccept = searchParams?.get("autoAccept") === "true";

  // State Panggilan
  const [myPeerId] = useState(() => `peer_${Math.random().toString(36).substring(2, 8)}_${Date.now()}`);
  const [myName, setMyName] = useState("Pengguna DSTech");
  const [peerName, setPeerName] = useState(initialPeerName);
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected" | "ended">("connecting");
  const [callDuration, setCallDuration] = useState(0);

  // Kontrol Media
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Refs WebRTC
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const signalingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isEndingRef = useRef(false);

  // Ambil profil login lokal
  useEffect(() => {
    try {
      const emp = localStorage.getItem("dstech_employee_auth");
      const adm = localStorage.getItem("dstech_admin_auth");
      const usr = localStorage.getItem("dstech_auth_user");
      const raw = emp || adm || usr;
      if (raw) {
        const parsed = JSON.parse(raw);
        setMyName(parsed.name || parsed.username || "Pengguna DSTech");
      }
    } catch {}
  }, []);

  // Mulai durasi saat terhubung
  useEffect(() => {
    if (callStatus === "connected") {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    }
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [callStatus]);

  // Format durasi MM:SS
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Helper pasang stream
  const attachStream = useCallback((el: HTMLMediaElement | null, stream: MediaStream | null) => {
    if (!el || !stream) return;
    try {
      if (el.srcObject !== stream) {
        el.srcObject = stream;
      }
      el.play().catch(() => {});
    } catch (e) {
      console.warn("Attach stream warning:", e);
    }
  }, []);

  // Tutup dan Bersihkan Semua Media
  const terminateMediaAndExit = useCallback(
    (reason = "ended") => {
      if (isEndingRef.current) return;
      isEndingRef.current = true;
      setCallStatus("ended");

      // Berhentikan semua track media hardware kamera & mic
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      // Tutup Peer Connection
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      // Hentikan interval polling signaling
      if (signalingIntervalRef.current) {
        clearInterval(signalingIntervalRef.current);
        signalingIntervalRef.current = null;
      }

      // Kirim sinyal leave ke server
      try {
        fetch("/api/meetings/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "leave",
            roomCode: `direct_${roomCode}`,
            peerId: myPeerId,
          }),
        }).catch(() => {});

        // Akhiri status panggilan di API team-chat/call
        if (callId) {
          fetch("/api/team-chat/call", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "end",
              callId,
              duration: callDuration,
            }),
          }).catch(() => {});
        }
      } catch {}

      // Navigasi kembali ke aplikasi chat / portal
      setTimeout(() => {
        try {
          if (window.opener) {
            window.close();
          } else {
            const isEmp = localStorage.getItem("dstech_employee_auth");
            if (isEmp) {
              window.location.replace("/mobile-chat");
            } else {
              window.location.replace("/admin/chat");
            }
          }
        } catch {
          window.location.replace("/mobile-chat");
        }
      }, 1000);
    },
    [roomCode, myPeerId, callId, callDuration]
  );

  // Inisialisasi Media & WebRTC
  useEffect(() => {
    let active = true;

    const setupDirectCall = async () => {
      try {
        // Ambil stream mic (dan kamera jika video call)
        const constraints: MediaStreamConstraints = {
          audio: true,
          video:
            callType === "video"
              ? {
                  facingMode,
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }
              : false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current && callType === "video") {
          attachStream(localVideoRef.current, stream);
        }

        // Buat RTCPeerConnection
        const pc = new RTCPeerConnection(RTC_CONFIG);
        pcRef.current = pc;

        // Tambahkan local tracks ke RTCPeerConnection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Tangani remote stream masuk
        pc.ontrack = (event) => {
          const [remoteStream] = event.streams;
          if (callType === "video" && remoteVideoRef.current) {
            attachStream(remoteVideoRef.current, remoteStream);
          }
          if (remoteAudioRef.current) {
            attachStream(remoteAudioRef.current, remoteStream);
          }
          setCallStatus("connected");
        };

        // Kirim ICE Candidate lokal ke signaling server
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            fetch("/api/meetings/signal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "signal",
                roomCode: `direct_${roomCode}`,
                fromPeerId: myPeerId,
                targetPeerId: "broadcast",
                signalData: {
                  type: "webrtc-ice-candidate",
                  candidate: event.candidate,
                },
              }),
            }).catch(() => {});
          }
        };

        // Buat Offer jika penelepon pertama, atau tunggu jika penerima
        const signalingRoom = `direct_${roomCode}`;

        // Daftarkan diri ke ruangan signaling
        await fetch("/api/meetings/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "join",
            roomCode: signalingRoom,
            peerId: myPeerId,
            name: myName,
            role: "DIRECT_CALLER",
          }),
        });

        if (!isAutoAccept) {
          // Penelepon: Buat WebRTC Offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          await fetch("/api/meetings/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "signal",
              roomCode: signalingRoom,
              fromPeerId: myPeerId,
              targetPeerId: "broadcast",
              signalData: {
                type: "webrtc-offer",
                sdp: offer,
              },
            }),
          });
          setCallStatus("ringing");
        } else {
          setCallStatus("connecting");
        }

        // Loop Polling Signal Masuk
        signalingIntervalRef.current = setInterval(async () => {
          if (!active || isEndingRef.current) return;
          try {
            const res = await fetch(
              `/api/meetings/signal?roomCode=${encodeURIComponent(signalingRoom)}&peerId=${encodeURIComponent(
                myPeerId
              )}&t=${Date.now()}`
            );
            const data = await res.json();

            if (data.success && Array.isArray(data.signals)) {
              for (const sig of data.signals) {
                const payload = sig.signalData;
                if (!payload) continue;

                if (payload.type === "webrtc-offer" && pc.signalingState !== "closed") {
                  await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                  const answer = await pc.createAnswer();
                  await pc.setLocalDescription(answer);

                  await fetch("/api/meetings/signal", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "signal",
                      roomCode: signalingRoom,
                      fromPeerId: myPeerId,
                      targetPeerId: sig.fromPeerId,
                      signalData: {
                        type: "webrtc-answer",
                        sdp: answer,
                      },
                    }),
                  });
                  setCallStatus("connected");
                } else if (payload.type === "webrtc-answer" && pc.signalingState !== "closed") {
                  if (pc.signalingState === "have-local-offer") {
                    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                    setCallStatus("connected");
                  }
                } else if (payload.type === "webrtc-ice-candidate" && pc.remoteDescription) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                  } catch {}
                }
              }
            }

            // Periksa jika panggilan diakhiri lawan bicara
            if (data.success && data.peers) {
              const otherPeers = data.peers.filter((p: any) => p.peerId !== myPeerId);
              if (otherPeers.length > 0) {
                setPeerName(otherPeers[0].name || initialPeerName);
              } else if (callStatus === "connected") {
                // Lawan bicara sudah keluar
                terminateMediaAndExit("ended");
              }
            }
          } catch {}
        }, 1500);
      } catch (err) {
        console.error("Gagal memulai direct call:", err);
        setCallStatus("ended");
      }
    };

    setupDirectCall();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (signalingIntervalRef.current) {
        clearInterval(signalingIntervalRef.current);
      }
    };
  }, [roomCode, myPeerId, callType, facingMode, isAutoAccept, attachStream, initialPeerName, myName, terminateMediaAndExit]);

  // Toggle Mute Mikrofon
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsMuted(!audioTracks[0]?.enabled);
    }
  };

  // Toggle Kamera (Khusus Video Call)
  const toggleVideo = () => {
    if (callType !== "video") return;
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsVideoOff(!videoTracks[0]?.enabled);
    }
  };

  // Flip Kamera Depan/Belakang (Khusus Smartphone Video Call)
  const flipCamera = async () => {
    if (callType !== "video") return;
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);

    try {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: nextMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      const newVideoTrack = newStream.getVideoTracks()[0];

      if (localStreamRef.current) {
        localStreamRef.current.addTrack(newVideoTrack);
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      if (pcRef.current) {
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(newVideoTrack);
        }
      }
    } catch (e) {
      console.warn("Flip camera error:", e);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none z-50">
      {/* Audio Elemen Tersembunyi untuk Memutar Suara Lawan Bicara */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* HEADER ATAS */}
      <div className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => terminateMediaAndExit("ended")}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5" /> P2P Terenkripsi Aman
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            {callType === "video" ? "Panggilan Video Langsung" : "Panggilan Suara Langsung"}
          </span>
        </div>

        <div className="w-10"></div>
      </div>

      {/* AREA UTAMA (TAMPILAN VIDEO ATAU SUARA) */}
      {callType === "video" ? (
        /* ================= TAMPILAN PANGGILAN VIDEO LANGSUNG ================= */
        <div className="relative flex-1 w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* Video Remote Lawan Bicara (Full-Screen) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {callStatus !== "connected" && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center z-10 p-6 text-center">
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-2xl mb-4 border-2 border-cyan-400/50">
                <span className="text-3xl font-extrabold text-white">
                  {peerName.charAt(0).toUpperCase()}
                </span>
                <span className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{peerName}</h2>
              <p className="text-sm text-cyan-300 font-semibold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {callStatus === "ringing" ? "Sedang berdering..." : "Menghubungkan sinyal langsung..."}
              </p>
            </div>
          )}

          {/* Video PIP Lokal Sendiri (Pojok Kanan Atas) */}
          <div className="absolute top-4 right-4 w-32 h-44 sm:w-40 sm:h-56 bg-black rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`}
            />
            <div className="absolute bottom-1.5 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white backdrop-blur-sm">
              Anda
            </div>
          </div>

          {/* Bar Info Durasi Saat Terhubung */}
          {callStatus === "connected" && (
            <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              {peerName} • {formatDuration(callDuration)}
            </div>
          )}
        </div>
      ) : (
        /* ================= TAMPILAN PANGGILAN SUARA LANGSUNG MURNI ================= */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="relative mb-8">
            {/* Gelombang Animasi Denyut Suara P2P */}
            {callStatus === "connected" && (
              <>
                <span className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-ping pointer-events-none" />
                <span className="absolute -inset-8 rounded-full border border-emerald-500/20 animate-pulse pointer-events-none" />
              </>
            )}

            {/* Lingkaran Avatar */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-1.5 shadow-2xl shadow-cyan-900/40">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-2 border-white/10">
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white">
                  {peerName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">{peerName}</h2>

          <div className="flex items-center gap-2 mb-2">
            {callStatus === "connected" ? (
              <span className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                {formatDuration(callDuration)}
              </span>
            ) : callStatus === "ringing" ? (
              <span className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Berdering di HP penerima...
              </span>
            ) : callStatus === "ended" ? (
              <span className="text-sm font-semibold text-rose-400">Panggilan Berakhir</span>
            ) : (
              <span className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Menghubungkan audio...
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 max-w-xs">
            Panggilan suara dialirkan langsung tanpa server pihak ketiga dengan kualitas audio HD jernih.
          </p>
        </div>
      )}

      {/* BILAH KONTROL BAWAH */}
      <div className="p-6 pb-8 bg-gradient-to-t from-black/95 via-black/80 to-transparent z-20 flex items-center justify-center gap-5 sm:gap-8 backdrop-blur-md">
        {/* Tombol Mute Mic */}
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition transform active:scale-90 ${
            isMuted
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
          }`}
          title={isMuted ? "Buka Mic" : "Mute Mic"}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Tombol Flip Camera (Khusus Video Call) */}
        {callType === "video" && (
          <button
            onClick={flipCamera}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center justify-center shadow-lg transition transform active:scale-90"
            title="Balik Kamera Depan / Belakang"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        )}

        {/* Tombol Matikan Kamera (Khusus Video Call) */}
        {callType === "video" && (
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition transform active:scale-90 ${
              isVideoOff
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
            }`}
            title={isVideoOff ? "Nyalakan Kamera" : "Matikan Kamera"}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        {/* Tombol Speaker (Khusus Panggilan Suara) */}
        {callType === "audio" && (
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition transform active:scale-90 ${
              isSpeakerOn
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
            }`}
            title="Speaker On/Off"
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        )}

        {/* Tombol Tutup Panggilan (End Call Merah) */}
        <button
          onClick={() => terminateMediaAndExit("ended")}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center justify-center shadow-2xl shadow-rose-900/60 hover:from-rose-500 hover:to-red-500 transition transform active:scale-90 border-2 border-rose-400/40"
          title="Akhiri Panggilan"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
