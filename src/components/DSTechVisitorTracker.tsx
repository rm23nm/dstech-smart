"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export interface VisitorGeoContext {
  city: string;
  region: string;
  country: string;
  isp?: string;
  ip: string;
  currentPath: string;
  pageTitle: string;
}

export default function DSTechVisitorTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string>("");

  useEffect(() => {
    // Inisialisasi atau ambil Session ID unik
    let sessionId = "";
    try {
      sessionId = sessionStorage.getItem("dstech_visitor_session_id") || "";
      if (!sessionId) {
        sessionId = `dstech_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        sessionStorage.setItem("dstech_visitor_session_id", sessionId);
      }
    } catch (e) {
      sessionId = `dstech_sess_${Date.now()}`;
    }

    const sendTrackPing = async (path: string) => {
      try {
        const title = typeof document !== "undefined" ? document.title : "DSTech Smart";
        const referrer = typeof document !== "undefined" ? document.referrer : "";
        const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

        const res = await fetch("/api/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            pathname: path,
            pageTitle: title,
            referrer,
            userAgent: ua,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.geo) {
            const geoContext: VisitorGeoContext = {
              city: json.geo.city || "Indonesia",
              region: json.geo.region || "Indonesia",
              country: json.geo.country || "Indonesia",
              isp: json.geo.isp,
              ip: json.geo.ip || "",
              currentPath: path,
              pageTitle: title,
            };

            // Simpan ke sessionStorage untuk AI Chat & komponen lain
            try {
              sessionStorage.setItem("dstech_visitor_geo", JSON.stringify(geoContext));
            } catch (err) {}

            // Broadcast Custom Event agar AI Chat Widget langsung menerima konteks lokasi terbaru
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("dstech:visitor-geo", { detail: geoContext }));
            }
          }
        }
      } catch (err) {
        // Silent fail agar pengalaman browsing pengunjung tidak pernah terganggu
      }
    };

    // Trigger saat rute berganti
    if (pathname && pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;
      sendTrackPing(pathname);
    }

    // Heartbeat berkala setiap 45 detik selama pengunjung masih membuka website
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        sendTrackPing(pathname || "/");
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null; // Komponen berjalan secara transparan di latar belakang
}
