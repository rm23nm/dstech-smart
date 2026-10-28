"use client";

import React, { useState, useEffect } from "react";
import { Phone, Video, PhoneCall, PhoneOff, User } from "lucide-react";
import { dstechCallAudio } from "@/utils/dstech_call_audio";

export default function GlobalCallListener() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);

  useEffect(() => {
    // Ambil data user aktif dari localStorage secara komprehensif
    try {
      const stored =
        localStorage.getItem("dstech_admin_auth") ||
        localStorage.getItem("dstech_employee_auth") ||
        localStorage.getItem("dstech_auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      // fallback
    }
  }, []);

  // Polling Panggilan Masuk Latar Belakang (Global di seluruh halaman)
  useEffect(() => {
    if (!currentUser?.id) return;

    let isSubscribed = true;

    const checkIncoming = async () => {
      // Jika user sudah berada di layar panggilan, jangan bunyikan ringtone banner global
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/direct-call")) {
        dstechCallAudio.stopCallAudio();
        if (incomingCall) setIncomingCall(null);
        return;
      }

      try {
        const res = await fetch(`/api/team-chat/call?userId=${encodeURIComponent(currentUser.id)}&t=${Date.now()}`);
        const data = await res.json();
        if (data.success && isSubscribed) {
          if (data.incomingCall && data.incomingCall.status === "calling") {
            setIncomingCall(data.incomingCall);
            // Hanya bunyikan ringtone Web Audio jika BUKAN di aplikasi native Android (agar tidak bersuara double)
            const isAndroidApp = typeof window !== "undefined" && (
              Boolean((window as any).DStechNative) ||
              navigator.userAgent.includes("DSTechSmartApp") ||
              document.documentElement.classList.contains("dstech-android-app")
            );
            if (!isAndroidApp) {
              dstechCallAudio.startIncomingRingtone();
            }
          } else {
            if (incomingCall) {
              // Jika sebelumnya ada panggilan lalu dijawab atau ditutup oleh penelepon
              dstechCallAudio.stopCallAudio();
              setIncomingCall(null);
            }
          }
        }
      } catch (err) {
        // silent polling error
      }
    };

    // Jalankan segera dan ulangi tiap 3 detik
    checkIncoming();
    const interval = setInterval(checkIncoming, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      dstechCallAudio.stopCallAudio();
    };
  }, [currentUser?.id, incomingCall?.id]);

  // Handle Terima Panggilan Masuk
  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    dstechCallAudio.stopCallAudio();

    try {
      await fetch("/api/team-chat/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          callId: incomingCall.id,
        }),
      });

      const roomUrl = `/direct-call/${incomingCall.roomCode}?callId=${incomingCall.id}&callType=${incomingCall.callType || "audio"}&peerName=${encodeURIComponent(
        incomingCall.callerName
      )}&autoAccept=true`;
      setIncomingCall(null);
      // Langsung buka layar panggilan suara / video murni di layar utama layaknya mengangkat telepon biasa
      window.location.href = roomUrl;
    } catch (err) {
      console.error("Gagal menerima panggilan:", err);
    }
  };

  // Handle Tolak Panggilan Masuk
  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    dstechCallAudio.stopCallAudio();

    try {
      await fetch("/api/team-chat/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decline",
          callId: incomingCall.id,
        }),
      });
      setIncomingCall(null);
    } catch (err) {
      console.error("Gagal menolak panggilan:", err);
    }
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 animate-bounce">
      <div className="bg-slate-950/95 border-2 border-emerald-500 rounded-3xl p-5 shadow-2xl backdrop-blur-xl text-white flex items-center justify-between gap-4 ring-4 ring-emerald-500/20">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-pulse flex-shrink-0">
            {incomingCall.callType === "video" ? (
              <Video className="w-7 h-7" />
            ) : (
              <Phone className="w-7 h-7" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              {incomingCall.callType === "video" ? "Panggilan Video Masuk" : "Panggilan Suara Masuk"}
            </span>
            <h4 className="font-extrabold text-white text-base truncate mt-0.5">
              {incomingCall.callerName}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              DStech Connect Corporate Call
            </p>
          </div>
        </div>

        {/* Tombol Terima & Tolak */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleAcceptCall}
            className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/40 transition transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Terima Panggilan"
          >
            <PhoneCall className="w-6 h-6 animate-pulse" />
          </button>
          <button
            type="button"
            onClick={handleDeclineCall}
            className="w-12 h-12 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-600/40 transition transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Tolak Panggilan"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
