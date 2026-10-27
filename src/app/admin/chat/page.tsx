"use client";

import React, { useState, useEffect } from "react";
import TeamChatMessenger from "@/components/TeamChatMessenger";
import { MessageSquare, ShieldCheck, Sparkles } from "lucide-react";

export default function AdminChatPage() {
  const [currentUser, setCurrentUser] = useState({
    id: "dstech_usr_1",
    name: "Super Admin DStech",
    role: "SUPERADMIN",
    phone: "08225949424",
  });

  useEffect(() => {
    // Ambil data admin yang sedang login dari localStorage jika ada
    try {
      const stored = localStorage.getItem("dstech_auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id) {
          setCurrentUser({
            id: parsed.id,
            name: parsed.name || "Admin DStech",
            role: parsed.role || "ADMIN",
            phone: parsed.phone || "",
          });
        }
      }
    } catch (e) {
      // fallback to superadmin
    }
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              DStech Connect <span className="text-emerald-400">Team Messenger</span>
            </h1>
            <p className="text-xs text-slate-400">
              Koordinasi internal tim mandiri ala WhatsApp, panggilan audio/video HD WebRTC, dan berbagi dokumen perusahaan (Invoice & SPK).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" /> Enkripsi Server Mandiri
          </span>
        </div>
      </div>

      {/* Messenger Box */}
      <TeamChatMessenger currentUser={currentUser} embeddedMode={false} />
    </div>
  );
}
