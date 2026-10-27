"use client";

import React, { useState, useEffect } from "react";
import TeamChatMessenger from "@/components/TeamChatMessenger";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ShieldCheck } from "lucide-react";

export default function StandaloneChatPage() {
  const [currentUser, setCurrentUser] = useState({
    id: "dstech_usr_1792549625191",
    name: "RAMADHANI ST",
    role: "EMPLOYEE",
    phone: "082259494242",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dstech_auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id) {
          setCurrentUser({
            id: parsed.id,
            name: parsed.name || "Staf DStech",
            role: parsed.role || "EMPLOYEE",
            phone: parsed.phone || "",
          });
        }
      }
    } catch (e) {
      // fallback
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-3 md:p-6">
      {/* Top Bar */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between mb-4">
        <Link
          href={currentUser.role === "EMPLOYEE" ? "/employee" : "/admin"}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Portal
        </Link>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" /> DStech Connect Messenger
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
        <TeamChatMessenger currentUser={currentUser} embeddedMode={false} />
      </div>
    </div>
  );
}
