import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const TRACKING_FILE = path.join(process.cwd(), "src", "data", "dstech_visitor_logs.json");

interface PageViewItem {
  path: string;
  title: string;
  timestamp: string;
}

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
  pageViews: PageViewItem[];
  totalVisits: number;
}

interface TrackingStore {
  activeSessions: VisitorSession[];
  summary: {
    totalPageViews: number;
    totalUniqueVisitors: number;
    topCities: Record<string, number>;
    topPages: Record<string, number>;
  };
}

// In-memory cache IP Geolocation sederhana agar tidak spam external API
const ipGeoCache = new Map<string, { city: string; region: string; country: string; isp?: string }>();

function readTrackingStore(): TrackingStore {
  try {
    if (fs.existsSync(TRACKING_FILE)) {
      const raw = fs.readFileSync(TRACKING_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.activeSessions)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("[Tracking API] Error reading file:", e);
  }
  return {
    activeSessions: [],
    summary: {
      totalPageViews: 0,
      totalUniqueVisitors: 0,
      topCities: {},
      topPages: {},
    },
  };
}

function saveTrackingStore(data: TrackingStore) {
  try {
    const dir = path.dirname(TRACKING_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("[Tracking API] Error saving file:", e);
  }
}

// Helper deteksi geolokasi dari IP
async function resolveIpGeo(ip: string): Promise<{ city: string; region: string; country: string; isp?: string }> {
  // IP lokal / private network
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
    return {
      city: "Cilegon (Lokal / Kantor)",
      region: "Banten",
      country: "Indonesia",
      isp: "DSTech Internal Network",
    };
  }

  if (ipGeoCache.has(ip)) {
    return ipGeoCache.get(ip)!;
  }

  try {
    // Gunakan ip-api.com (free, fast, no key needed for low-medium traffic)
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp`, {
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === "success") {
        const result = {
          city: data.city || "Indonesia",
          region: data.regionName || "Indonesia",
          country: data.country || "Indonesia",
          isp: data.isp || "Internet Provider",
        };
        ipGeoCache.set(ip, result);
        return result;
      }
    }
  } catch (err: any) {
    // Fallback jika API geo gagal atau timeout
  }

  const fallback = {
    city: "Indonesia",
    region: "Nasional",
    country: "Indonesia",
    isp: "ISP Pengunjung",
  };
  ipGeoCache.set(ip, fallback);
  return fallback;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      sessionId = `dstech_session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pathname = "/",
      pageTitle = "DSTech Smart",
      referrer = "",
      userAgent = "",
    } = body;

    // Ambil IP pengunjung dari header
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const rawIp = forwarded ? forwarded.split(",")[0].trim() : (realIp || "127.0.0.1");

    // Deteksi device & browser sederhana
    const ua = (userAgent || req.headers.get("user-agent") || "").toLowerCase();
    let device = "Desktop";
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      device = "Mobile Phone";
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      device = "Tablet";
    }

    let browser = "Web Browser";
    if (ua.includes("edg/")) browser = "Microsoft Edge";
    else if (ua.includes("chrome") && !ua.includes("edg/")) browser = "Google Chrome";
    else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Apple Safari";
    else if (ua.includes("firefox")) browser = "Mozilla Firefox";

    // Resolusi Geolokasi
    const geo = await resolveIpGeo(rawIp);

    // Update Store
    const store = readTrackingStore();
    const nowIso = new Date().toISOString();

    let session = store.activeSessions.find((s) => s.sessionId === sessionId);
    if (!session) {
      session = {
        sessionId,
        ip: rawIp,
        city: geo.city,
        region: geo.region,
        country: geo.country,
        isp: geo.isp,
        device,
        browser,
        referrer,
        firstSeen: nowIso,
        lastActive: nowIso,
        currentPath: pathname,
        pageViews: [
          {
            path: pathname,
            title: pageTitle,
            timestamp: nowIso,
          },
        ],
        totalVisits: 1,
      };
      store.activeSessions.unshift(session);
      store.summary.totalUniqueVisitors = (store.summary.totalUniqueVisitors || 0) + 1;
    } else {
      session.lastActive = nowIso;
      session.currentPath = pathname;
      session.totalVisits = (session.totalVisits || 1) + 1;
      // Jangan simpan riwayat lebih dari 20 pageviews per session agar file tidak membengkak
      const lastPv = session.pageViews[session.pageViews.length - 1];
      if (!lastPv || lastPv.path !== pathname) {
        session.pageViews.push({
          path: pathname,
          title: pageTitle,
          timestamp: nowIso,
        });
        if (session.pageViews.length > 20) {
          session.pageViews = session.pageViews.slice(-20);
        }
      }
    }

    // Update Global Summary
    store.summary.totalPageViews = (store.summary.totalPageViews || 0) + 1;
    const cleanCity = geo.city || "Indonesia";
    store.summary.topCities[cleanCity] = (store.summary.topCities[cleanCity] || 0) + 1;
    store.summary.topPages[pathname] = (store.summary.topPages[pathname] || 0) + 1;

    // Batasi list active sessions maksimal 150 sesi terakhir
    if (store.activeSessions.length > 150) {
      store.activeSessions = store.activeSessions.slice(0, 150);
    }

    saveTrackingStore(store);

    return NextResponse.json({
      success: true,
      sessionId,
      geo: {
        city: geo.city,
        region: geo.region,
        country: geo.country,
        isp: geo.isp,
        ip: rawIp,
      },
    });
  } catch (error: any) {
    console.error("[Tracking API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "all";

    const store = readTrackingStore();
    const now = Date.now();

    // Hitung sesi yang online dalam 10 menit terakhir
    const onlineThreshold = 10 * 60 * 1000;
    const liveSessions = store.activeSessions.filter((s) => {
      const lastActiveTime = new Date(s.lastActive).getTime();
      return now - lastActiveTime <= onlineThreshold;
    });

    if (mode === "live") {
      return NextResponse.json({
        success: true,
        data: {
          onlineCount: liveSessions.length,
          sessions: liveSessions,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        onlineCount: liveSessions.length,
        liveSessions,
        allSessions: store.activeSessions.slice(0, 50),
        summary: store.summary,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
