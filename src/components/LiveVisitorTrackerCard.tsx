"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Users,
  MapPin,
  Eye,
  RefreshCw,
  Clock,
  Smartphone,
  Monitor,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface VisitorSession {
  sessionId: string;
  ip: string;
  city: string;
  region: string;
  country: string;
  isp?: string;
  device: string;
  browser: string;
  referrer: string;
  firstSeen: string;
  lastActive: string;
  currentPath: string;
  pageViews: Array<{ path: string; title: string; timestamp: string }>;
  totalVisits: number;
}

interface TrackingSummary {
  totalPageViews: number;
  totalUniqueVisitors: number;
  topCities: Record<string, number>;
  topPages: Record<string, number>;
}

export default function LiveVisitorTrackerCard() {
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [summary, setSummary] = useState<TrackingSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTrackingData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/tracking?t=" + Date.now());
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setOnlineCount(json.data.onlineCount || 0);
          setSessions(json.data.liveSessions || json.data.allSessions || []);
          setSummary(json.data.summary || null);
        }
      }
    } catch (e) {
      console.error("Gagal memuat data live visitor:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
    // Auto refresh setiap 15 detik
    const timer = setInterval(fetchTrackingData, 15000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const sec = Math.floor(diffMs / 1000);
      if (sec < 60) return `${sec} detik lalu`;
      const min = Math.floor(sec / 60);
      if (min < 60) return `${min} menit lalu`;
      const hrs = Math.floor(min / 60);
      return `${hrs} jam lalu`;
    } catch (e) {
      return "Baru saja";
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-[40px] bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 text-white shadow-xl relative overflow-hidden">
      {/* Glow Ambient */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-dstech-blue">
                Live Visitor Auto-Tracking &amp; AI Context
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Real-Time</span>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pemantauan Pengunjung Web &amp; Geolokasi
            </h3>
            <p className="text-xs text-slate-400">
              Mendeteksi pergerakan pengunjung antar-halaman secara live dan menyuntikkan lokasi ke Chat AI DSTech.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTrackingData}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Pengunjung Aktif (Online)</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {onlineCount} <span className="text-xs font-normal text-slate-400">Sesi</span>
            </div>
            <div className="text-[11px] text-slate-400">Aktif dalam 10 menit terakhir</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Total Kunjungan Halaman</span>
              <Eye className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400 font-mono">
              {summary?.totalPageViews || sessions.reduce((acc, s) => acc + (s.pageViews?.length || 1), 0)}
            </div>
            <div className="text-[11px] text-slate-400">Akumulasi tayangan halaman</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Pengunjung Unik</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {summary?.totalUniqueVisitors || sessions.length}
            </div>
            <div className="text-[11px] text-slate-400">Perangkat unik terdeteksi</div>
          </div>
        </div>

        {/* Live Visitor Sessions Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Daftar Sesi Pengunjung Terkini ({sessions.length})
            </h4>
            <span className="text-[11px] text-slate-400">Terhubung langsung dengan AI Chat</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              Sedang memuat data tracking...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
              Belum ada aktivitas pengunjung yang tercatat. Sesi akan otomatis muncul saat ada yang membuka website dstechsmart.com.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-400 font-bold border-b border-slate-800">
                    <th className="py-3 px-4">Lokasi &amp; ISP</th>
                    <th className="py-3 px-4">Halaman Terakhir</th>
                    <th className="py-3 px-4">Perangkat &amp; Browser</th>
                    <th className="py-3 px-4">Kunjungan Terakhir</th>
                    <th className="py-3 px-4">Total Akses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sessions.slice(0, 10).map((session, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      {/* Lokasi */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                          <div>
                            <div className="font-bold text-white">
                              {session.city || "Indonesia"}{" "}
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({session.region || "ID"})
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {session.isp || session.ip || "Jaringan Web"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Halaman Aktif */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[11px] font-bold">
                          <span>{session.currentPath || "/"}</span>
                        </div>
                      </td>

                      {/* Perangkat */}
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          {session.device?.toLowerCase().includes("mobile") ? (
                            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span>{session.device || "Desktop"}</span>
                          <span className="text-[10px] text-slate-500">• {session.browser || "Browser"}</span>
                        </div>
                      </td>

                      {/* Terakhir Aktif */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formatTimeAgo(session.lastActive)}</span>
                        </div>
                      </td>

                      {/* Total Akses */}
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {session.pageViews?.length || session.totalVisits || 1} Halaman
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
