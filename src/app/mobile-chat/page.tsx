"use client";

import React, { useState, useEffect } from "react";
import TeamChatMessenger from "@/components/TeamChatMessenger";
import GlobalCallListener from "@/components/GlobalCallListener";

export default function MobileChatPage() {
  const [currentUser, setCurrentUser] = useState({
    id: "dstech_usr_1792549625191",
    name: "RAMADHANI ST",
    role: "EMPLOYEE",
    phone: "082259494242",
  });

  useEffect(() => {
    try {
      // Tandai lingkungan aplikasi Android native
      if (typeof window !== "undefined") {
        document.documentElement.classList.add("dstech-android-app");
        document.body.setAttribute("data-dstech-app", "android");
        sessionStorage.setItem("dstech_is_android_app", "true");

        const stored =
          localStorage.getItem("dstech_auth_user") ||
          localStorage.getItem("dstech_employee_auth") ||
          localStorage.getItem("dstech_admin_auth");

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
      }
    } catch (e) {
      // fallback
    }
  }, []);

  return (
    <main className="w-screen h-[100dvh] flex flex-col bg-slate-950 text-white overflow-hidden select-none m-0 p-0 fixed inset-0 z-10">
      <GlobalCallListener />
      <div className="w-full h-full flex-1 flex flex-col overflow-hidden">
        <TeamChatMessenger currentUser={currentUser} standaloneMobileApp={true} />
      </div>
    </main>
  );
}
