import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Prefix: dstech_ (Sesuai aturan database terisolasi DSTech Smart)
const MEETINGS_FILE = path.join(process.cwd(), "src", "data", "dstech_meetings.json");

interface Meeting {
  id: string;
  roomCode: string;
  title: string;
  description: string;
  scheduledAt: string;
  status: "ACTIVE" | "UPCOMING" | "ENDED";
  meetingType: "INTERNAL_STAF" | "KONSULTASI_KLIEN" | "MAINTENANCE_SURVEY";
  hostName: string;
  hostRole: string;
  maxParticipants?: number;
  allowGuests?: boolean;
  requiresPassword?: boolean;
  password?: string;
  jitsiRoomName: string;
  createdAt: string;
  participants?: {
    id: string;
    name: string;
    role: string;
    joinedAt: string;
  }[];
}

function readMeetingsData(): { meetings: Meeting[] } {
  try {
    if (fs.existsSync(MEETINGS_FILE)) {
      const raw = fs.readFileSync(MEETINGS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Gagal membaca dstech_meetings.json:", err);
  }
  return { meetings: [] };
}

function writeMeetingsData(data: { meetings: Meeting[] }) {
  try {
    fs.writeFileSync(MEETINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menulis dstech_meetings.json:", err);
  }
}

// GET: Ambil daftar ruang meeting atau detail spesifik via ?roomCode=
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get("roomCode");
    const data = readMeetingsData();

    if (roomCode) {
      const normalizedCode = roomCode.trim().toLowerCase();
      const found = data.meetings.find(
        (m) => m.roomCode.toLowerCase() === normalizedCode || m.id.toLowerCase() === normalizedCode
      );

      if (!found) {
        return NextResponse.json(
          {
            success: false,
            error: "Ruang meeting tidak ditemukan atau telah diakhiri.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: found,
      });
    }

    return NextResponse.json({
      success: true,
      data: data.meetings,
      total: data.meetings.length,
      activeCount: data.meetings.filter((m) => m.status === "ACTIVE").length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memuat data meeting: " + error.message },
      { status: 500 }
    );
  }
}

// POST: Buat meeting baru atau catat peserta yang bergabung
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = readMeetingsData();

    // Aksi 1: Catat peserta yang join ke room
    if (body.action === "join_participant") {
      const { roomCode, participantName, participantRole } = body;
      if (!roomCode || !participantName) {
        return NextResponse.json(
          { success: false, error: "roomCode dan participantName wajib disertakan." },
          { status: 400 }
        );
      }

      const idx = data.meetings.findIndex(
        (m) => m.roomCode.toLowerCase() === roomCode.trim().toLowerCase()
      );

      if (idx !== -1) {
        if (!data.meetings[idx].participants) {
          data.meetings[idx].participants = [];
        }

        const newParticipant = {
          id: "p_" + Date.now(),
          name: participantName.trim(),
          role: participantRole || "GUEST",
          joinedAt: new Date().toISOString(),
        };

        // Hindari duplikasi nama dalam 3 menit
        const exists = data.meetings[idx].participants.find(
          (p) => p.name.toLowerCase() === participantName.trim().toLowerCase()
        );
        if (!exists) {
          data.meetings[idx].participants.push(newParticipant);
          writeMeetingsData(data);
        }

        return NextResponse.json({
          success: true,
          message: "Peserta berhasil bergabung.",
          data: data.meetings[idx],
        });
      }

      return NextResponse.json({ success: false, error: "Room tidak ditemukan." }, { status: 404 });
    }

    // Aksi 2: Buat Room Meeting Baru
    const {
      title,
      description,
      scheduledAt,
      meetingType,
      hostName,
      hostRole,
      customRoomCode,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Judul meeting wajib diisi." },
        { status: 400 }
      );
    }

    // Generate kode room ramah URL unik
    let slug = customRoomCode
      ? customRoomCode.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 30) +
        "-" +
        Math.floor(100 + Math.random() * 900);

    // Pastikan jitsiRoomName aman
    const jitsiRoomName = `dstechsmart_${slug.replace(/-/g, "_")}`;
    const roomPassword = (body.password || "").trim();

    const newMeeting: Meeting = {
      id: "meet_dstech_" + Date.now(),
      roomCode: slug,
      title: title.trim(),
      description: description?.trim() || "Ruang meeting interaktif smartphone PT. DSTech Smart Perkasa",
      scheduledAt: scheduledAt || "Sekarang (Instan)",
      status: "ACTIVE",
      meetingType: meetingType || "INTERNAL_STAF",
      hostName: hostName?.trim() || "Host DSTech Smart",
      hostRole: hostRole || "STAFF",
      maxParticipants: 50,
      allowGuests: true,
      requiresPassword: !!roomPassword,
      password: roomPassword,
      jitsiRoomName,
      createdAt: new Date().toISOString(),
      participants: [],
    };

    data.meetings.unshift(newMeeting);
    writeMeetingsData(data);

    return NextResponse.json({
      success: true,
      message: "Ruang meeting berhasil dibuat.",
      data: newMeeting,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal membuat meeting: " + error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update status meeting ("ACTIVE" | "ENDED" | "UPCOMING") atau password
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, roomCode, status, title, description, password } = body;

    const data = readMeetingsData();
    const idx = data.meetings.findIndex((m) => m.id === id || m.roomCode === roomCode);

    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Ruang meeting tidak ditemukan." }, { status: 404 });
    }

    if (status) data.meetings[idx].status = status;
    if (title) data.meetings[idx].title = title.trim();
    if (description !== undefined) data.meetings[idx].description = description.trim();
    if (password !== undefined) {
      const cleanPass = password.trim();
      data.meetings[idx].password = cleanPass;
      data.meetings[idx].requiresPassword = !!cleanPass;
    }

    writeMeetingsData(data);

    return NextResponse.json({
      success: true,
      message: "Status meeting berhasil diperbarui.",
      data: data.meetings[idx],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui meeting: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE: Hapus ruang meeting
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID meeting wajib disertakan." }, { status: 400 });
    }

    const data = readMeetingsData();
    const filtered = data.meetings.filter((m) => m.id !== id);

    if (filtered.length === data.meetings.length) {
      return NextResponse.json({ success: false, error: "Meeting tidak ditemukan." }, { status: 404 });
    }

    writeMeetingsData({ meetings: filtered });

    return NextResponse.json({
      success: true,
      message: "Ruang meeting berhasil dihapus.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal menghapus meeting: " + error.message },
      { status: 500 }
    );
  }
}
