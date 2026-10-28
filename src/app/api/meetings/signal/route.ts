import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SIGNAL_FILE = path.join(process.cwd(), "src", "data", "dstech_meetings_signals.json");

interface PeerInfo {
  id: string;
  name: string;
  role: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  lastSeen: number;
}

interface SignalItem {
  id: string;
  roomCode: string;
  fromPeerId: string;
  fromPeerName?: string;
  fromPeerRole?: string;
  toPeerId?: string; // Jika null/kosong berarti broadcast
  type: "offer" | "answer" | "candidate" | "chat" | "leave" | "status";
  data: any;
  timestamp: number;
  consumedBy?: string[];
}

interface ChatMessage {
  id: string;
  fromName: string;
  fromRole: string;
  message: string;
  timestamp: string;
}

interface RoomData {
  peers: Record<string, PeerInfo>;
  signals: SignalItem[];
  chats: ChatMessage[];
  updatedAt: number;
}

interface SignalStore {
  rooms: Record<string, RoomData>;
}

// In-Memory store dengan fallback sinkronisasi file ter-prefix dstech_
let memoryStore: SignalStore = { rooms: {} };

function loadStore(): SignalStore {
  try {
    if (fs.existsSync(SIGNAL_FILE)) {
      const raw = fs.readFileSync(SIGNAL_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.rooms) {
        memoryStore = parsed;
      }
    }
  } catch (err) {
    // Gunakan in-memory jika file lock/parse error
  }
  return memoryStore;
}

function saveStore() {
  try {
    const dir = path.dirname(SIGNAL_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SIGNAL_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal simpan dstech_meetings_signals.json:", err);
  }
}

// Prune room dan peers yang idle lebih dari 45 detik
function pruneOldData(store: SignalStore) {
  const now = Date.now();
  for (const [roomCode, room] of Object.entries(store.rooms)) {
    // Hapus peers yang tidak kirim heartbeat > 35 detik
    for (const [peerId, peer] of Object.entries(room.peers)) {
      if (now - peer.lastSeen > 35000) {
        delete room.peers[peerId];
        // Tambahkan signal leave
        room.signals.push({
          id: `leave_${peerId}_${now}`,
          roomCode,
          fromPeerId: peerId,
          type: "leave",
          data: { peerId },
          timestamp: now,
        });
      }
    }

    // Bersihkan signals yang berumur lebih dari 45 detik
    room.signals = (room.signals || []).filter((s) => now - s.timestamp < 45000);

    // Batasi chat hingga 50 pesan terakhir
    if (room.chats && room.chats.length > 50) {
      room.chats = room.chats.slice(-50);
    }

    // Jika room kosong & tidak aktif > 10 menit, hapus room
    if (Object.keys(room.peers).length === 0 && now - (room.updatedAt || 0) > 600000) {
      delete store.rooms[roomCode];
    }
  }
}

// GET: Mengambil sinyal masuk, daftar peers aktif, dan chat untuk peer bersangkutan
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get("roomCode")?.trim() || "general";
    const peerId = searchParams.get("peerId")?.trim();

    if (!peerId) {
      return NextResponse.json({ success: false, error: "Parameter peerId wajib diisi" }, { status: 400 });
    }

    const store = loadStore();
    pruneOldData(store);

    if (!store.rooms[roomCode]) {
      store.rooms[roomCode] = { peers: {}, signals: [], chats: [], updatedAt: Date.now() };
    }

    const room = store.rooms[roomCode];

    // Update heartbeat peer
    if (room.peers[peerId]) {
      room.peers[peerId].lastSeen = Date.now();
      room.updatedAt = Date.now();
    }

    // Ambil signal yang ditujukan ke peer ini atau broadcast yang belum dikonsumsi
    const incomingSignals: SignalItem[] = [];
    room.signals = (room.signals || []).filter((sig) => {
      // Jangan terima sinyal dari diri sendiri
      if (sig.fromPeerId === peerId) return true;

      // Sinyal ditujukan ke peer spesifik
      if (sig.toPeerId && sig.toPeerId === peerId) {
        incomingSignals.push(sig);
        return false; // Langsung dikonsumsi
      }

      // Sinyal broadcast (misal chat / peer status)
      if (!sig.toPeerId) {
        if (!sig.consumedBy) sig.consumedBy = [];
        if (!sig.consumedBy.includes(peerId)) {
          sig.consumedBy.push(peerId);
          incomingSignals.push(sig);
        }
        // Jika sudah dikonsumsi oleh seluruh peer lain, bisa dihapus
        const otherPeersCount = Object.keys(room.peers).filter((p) => p !== sig.fromPeerId).length;
        if (sig.consumedBy.length >= otherPeersCount) {
          return false;
        }
      }

      return true;
    });

    saveStore();

    return NextResponse.json({
      success: true,
      signals: incomingSignals,
      peers: Object.values(room.peers),
      chats: room.chats || [],
      data: {
        peers: Object.values(room.peers),
        signals: incomingSignals,
        chats: room.chats || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Mengirim sinyal (join, offer, answer, candidate, chat, leave, status)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomCode = body.roomCode;
    const peerId = body.peerId || body.fromPeerId;
    const action = body.action;
    const rawPayload = body.payload || body.signalData || {};
    const payload = rawPayload;

    if (!roomCode || !peerId || !action) {
      return NextResponse.json(
        { success: false, error: "Parameter roomCode, peerId, dan action wajib diisi" },
        { status: 400 }
      );
    }

    const cleanRoom = String(roomCode).trim();
    const cleanPeer = String(peerId).trim();
    const now = Date.now();

    const store = loadStore();
    pruneOldData(store);

    if (!store.rooms[cleanRoom]) {
      store.rooms[cleanRoom] = { peers: {}, signals: [], chats: [], updatedAt: now };
    }

    const room = store.rooms[cleanRoom];
    room.updatedAt = now;

    if (action === "join") {
      // Registrasi peer ke room
      const peerName = rawPayload?.name || body.name || "Peserta Direct Call";
      const peerRole = rawPayload?.role || body.role || "DIRECT_CALLER";

      room.peers[cleanPeer] = {
        id: cleanPeer,
        name: peerName,
        role: peerRole,
        isMuted: !!(rawPayload?.isMuted || body.isMuted),
        isVideoOff: !!(rawPayload?.isVideoOff || body.isVideoOff),
        lastSeen: now,
      };

      // Broadcast pesan status peer bergabung
      room.signals.push({
        id: `sig_join_${cleanPeer}_${now}`,
        roomCode: cleanRoom,
        fromPeerId: cleanPeer,
        fromPeerName: peerName,
        fromPeerRole: peerRole,
        type: "status",
        data: { action: "peer_joined", peer: room.peers[cleanPeer] },
        timestamp: now,
      });

      saveStore();

      return NextResponse.json({
        success: true,
        message: "Berhasil bergabung ke room meeting",
        data: {
          peers: Object.values(room.peers),
          chats: room.chats || [],
        },
      });
    }

    if (action === "signal") {
      // Mengirim WebRTC handshake: offer, answer, atau candidate
      const toPeerId = rawPayload?.toPeerId || body.targetPeerId || (body.toPeerId !== "broadcast" ? body.toPeerId : undefined);
      const type = rawPayload?.type || body.type || (body.signalData?.type);
      const data = rawPayload?.data || body.signalData || rawPayload;

      if (!type) {
        return NextResponse.json({ success: false, error: "Format tipe sinyal tidak lengkap" }, { status: 400 });
      }

      room.signals.push({
        id: `sig_${type}_${cleanPeer}_${now}_${Math.random().toString(36).substring(2, 6)}`,
        roomCode: cleanRoom,
        fromPeerId: cleanPeer,
        fromPeerName: room.peers[cleanPeer]?.name || rawPayload?.fromPeerName || body.fromPeerName,
        fromPeerRole: room.peers[cleanPeer]?.role || rawPayload?.fromPeerRole || body.fromPeerRole,
        toPeerId: toPeerId === "broadcast" ? undefined : toPeerId,
        type: type.replace("webrtc-", "") as any,
        data,
        timestamp: now,
      });

      saveStore();
      return NextResponse.json({ success: true, message: `Sinyal ${type} terkirim` });
    }

    if (action === "chat") {
      // Mengirim pesan teks ruang rapat
      const newChat: ChatMessage = {
        id: `chat_${now}_${Math.random().toString(36).substring(2, 6)}`,
        fromName: room.peers[cleanPeer]?.name || payload?.fromName || "Peserta",
        fromRole: room.peers[cleanPeer]?.role || payload?.fromRole || "GUEST",
        message: (payload?.message || "").trim(),
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      if (newChat.message) {
        room.chats.push(newChat);

        // Broadcast signal chat ke seluruh peer
        room.signals.push({
          id: `sig_chat_${cleanPeer}_${now}`,
          roomCode: cleanRoom,
          fromPeerId: cleanPeer,
          type: "chat",
          data: newChat,
          timestamp: now,
        });
      }

      saveStore();
      return NextResponse.json({ success: true, data: newChat });
    }

    if (action === "update_status") {
      // Update mic / video state peer
      if (room.peers[cleanPeer]) {
        if (payload?.isMuted !== undefined) room.peers[cleanPeer].isMuted = payload.isMuted;
        if (payload?.isVideoOff !== undefined) room.peers[cleanPeer].isVideoOff = payload.isVideoOff;
        room.peers[cleanPeer].lastSeen = now;

        // Broadcast status
        room.signals.push({
          id: `sig_stat_${cleanPeer}_${now}`,
          roomCode: cleanRoom,
          fromPeerId: cleanPeer,
          type: "status",
          data: {
            action: "peer_media_status",
            peerId: cleanPeer,
            isMuted: room.peers[cleanPeer].isMuted,
            isVideoOff: room.peers[cleanPeer].isVideoOff,
          },
          timestamp: now,
        });
      }

      saveStore();
      return NextResponse.json({ success: true });
    }

    if (action === "leave") {
      // Keluar dari room
      if (room.peers[cleanPeer]) {
        delete room.peers[cleanPeer];
      }

      room.signals.push({
        id: `sig_leave_${cleanPeer}_${now}`,
        roomCode: cleanRoom,
        fromPeerId: cleanPeer,
        type: "leave",
        data: { peerId: cleanPeer },
        timestamp: now,
      });

      saveStore();
      return NextResponse.json({ success: true, message: "Berhasil keluar dari room meeting" });
    }

    return NextResponse.json({ success: false, error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
