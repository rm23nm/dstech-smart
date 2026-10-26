"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Crosshair,
  Compass,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Building,
  Briefcase,
  ShieldCheck,
  Radio,
  Sliders,
  Layers,
  Sparkles,
  Info,
  X,
} from "lucide-react";

export interface ProjectLocationItem {
  id: string;
  name: string;
  clientName?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isDefaultOffice?: boolean;
  notes?: string;
}

export interface GpsSettingsData {
  officeName: string;
  officeLatitude: number;
  officeLongitude: number;
  officeAddress: string;
  geofenceRadiusMeters: number;
  allowFlexibleAttendance: boolean;
  projectLocations: ProjectLocationItem[];
}

interface GpsGeofenceManagerProps {
  onSaved?: (data: GpsSettingsData) => void;
  standaloneTitle?: boolean;
}

export default function GpsGeofenceManager({ onSaved, standaloneTitle = true }: GpsGeofenceManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [officeName, setOfficeName] = useState("Kantor Pusat PT DSTech Smart Perkasa (Cilegon)");
  const [officeLatitude, setOfficeLatitude] = useState(-6.031846);
  const [officeLongitude, setOfficeLongitude] = useState(106.037198);
  const [officeAddress, setOfficeAddress] = useState(
    "PERUM BUKIT CILEGON ASRI BLOK DB NO. 19, KEL. BAGENDUNG, KEC. CILEGON, KOTA CILEGON - BANTEN"
  );
  const [geofenceRadiusMeters, setGeofenceRadiusMeters] = useState(250);
  const [allowFlexibleAttendance, setAllowFlexibleAttendance] = useState(true);
  const [projectLocations, setProjectLocations] = useState<ProjectLocationItem[]>([
    {
      id: "dstech_loc_cilegon_hq",
      name: "Kantor Pusat DSTech (Perum BCA)",
      clientName: "PT. DSTech Smart Perkasa",
      latitude: -6.031846,
      longitude: 106.037198,
      radiusMeters: 250,
      isDefaultOffice: true,
      notes: "Kantor Operasional & Workshop",
    },
    {
      id: "dstech_loc_krakatau",
      name: "Proyek Kawasan Industri Krakatau Steel",
      clientName: "PT Krakatau Steel Tbk",
      latitude: -6.0125,
      longitude: 106.015,
      radiusMeters: 500,
      isDefaultOffice: false,
      notes: "Area Proyek Pabrik Baja & Pipa",
    },
  ]);

  // Modal Tambah/Edit Titik Proyek
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<ProjectLocationItem>>({
    name: "",
    clientName: "",
    latitude: -6.031846,
    longitude: 106.037198,
    radiusMeters: 350,
    notes: "",
  });
  const [isDetectingProjectGps, setIsDetectingProjectGps] = useState(false);

  // Load Settings from API
  useEffect(() => {
    async function loadGpsSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/settings?t=" + Date.now(), { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const d = json.data || json;
          if (d.officeName) setOfficeName(d.officeName);
          if (typeof d.officeLatitude === "number") setOfficeLatitude(d.officeLatitude);
          if (typeof d.officeLongitude === "number") setOfficeLongitude(d.officeLongitude);
          if (d.officeAddress || d.address) setOfficeAddress(d.officeAddress || d.address);
          if (typeof d.geofenceRadiusMeters === "number") setGeofenceRadiusMeters(d.geofenceRadiusMeters);
          if (typeof d.allowFlexibleAttendance === "boolean") setAllowFlexibleAttendance(d.allowFlexibleAttendance);
          if (Array.isArray(d.projectLocations) && d.projectLocations.length > 0) {
            setProjectLocations(d.projectLocations);
          }
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan GPS:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGpsSettings();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // Ambil koordinat GPS saat ini via Browser Geolocation API
  const handleDetectCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      showToast("error", "Browser atau perangkat ini tidak mendukung Geolocation GPS.");
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);

        setOfficeLatitude(lat);
        setOfficeLongitude(lng);
        setGpsAccuracy(acc);
        showToast("success", `✓ Titik koordinat satelit berhasil dikunci! Akurasi: ±${acc} meter.`);
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn("GPS Detection error:", err);
        showToast(
          "error",
          "Gagal mendeteksi lokasi GPS. Pastikan izin lokasi browser telah diizinkan (Allow) dan GPS aktif."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Simpan Pengaturan ke Backend API
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const payload: GpsSettingsData = {
        officeName,
        officeLatitude: Number(officeLatitude),
        officeLongitude: Number(officeLongitude),
        officeAddress,
        geofenceRadiusMeters: Number(geofenceRadiusMeters),
        allowFlexibleAttendance,
        projectLocations,
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("success", "✓ Pengaturan Titik GPS Kantor & Geofencing berhasil disimpan permanen!");
        if (onSaved) onSaved(payload);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dstech_gps_settings_updated", { detail: payload }));
        }
      } else {
        const errJson = await res.json().catch(() => null);
        showToast("error", errJson?.message || "Gagal menyimpan pengaturan GPS.");
      }
    } catch (err: any) {
      showToast("error", "Terjadi kesalahan jaringan saat menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Buka Modal Tambah Titik Proyek
  const handleOpenAddProject = () => {
    setEditingProjectId(null);
    setProjectForm({
      name: "",
      clientName: "",
      latitude: officeLatitude,
      longitude: officeLongitude,
      radiusMeters: 350,
      notes: "",
    });
    setIsProjectModalOpen(true);
  };

  // Buka Modal Edit Titik Proyek
  const handleOpenEditProject = (item: ProjectLocationItem) => {
    setEditingProjectId(item.id);
    setProjectForm({
      name: item.name,
      clientName: item.clientName || "",
      latitude: item.latitude,
      longitude: item.longitude,
      radiusMeters: item.radiusMeters || 350,
      notes: item.notes || "",
    });
    setIsProjectModalOpen(true);
  };

  // Deteksi GPS untuk Titik Proyek
  const handleDetectProjectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      showToast("error", "Geolocation tidak didukung.");
      return;
    }
    setIsDetectingProjectGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingProjectGps(false);
        setProjectForm((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        showToast("success", `✓ Koordinat proyek terkunci (Akurasi ±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        setIsDetectingProjectGps(false);
        showToast("error", "Gagal mengambil GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Simpan Titik Proyek ke List
  const handleSaveProjectItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name?.trim()) {
      showToast("error", "Nama proyek wajib diisi.");
      return;
    }

    if (editingProjectId) {
      setProjectLocations((prev) =>
        prev.map((item) =>
          item.id === editingProjectId
            ? {
                ...item,
                name: projectForm.name || item.name,
                clientName: projectForm.clientName || "",
                latitude: Number(projectForm.latitude),
                longitude: Number(projectForm.longitude),
                radiusMeters: Number(projectForm.radiusMeters) || 350,
                notes: projectForm.notes || "",
              }
            : item
        )
      );
      showToast("success", `✓ Titik proyek "${projectForm.name}" berhasil diperbarui.`);
    } else {
      const newItem: ProjectLocationItem = {
        id: `dstech_loc_${Date.now()}`,
        name: projectForm.name || "Titik Proyek Baru",
        clientName: projectForm.clientName || "",
        latitude: Number(projectForm.latitude) || officeLatitude,
        longitude: Number(projectForm.longitude) || officeLongitude,
        radiusMeters: Number(projectForm.radiusMeters) || 350,
        isDefaultOffice: false,
        notes: projectForm.notes || "",
      };
      setProjectLocations((prev) => [...prev, newItem]);
      showToast("success", `✓ Titik proyek "${newItem.name}" ditambahkan ke daftar.`);
    }

    setIsProjectModalOpen(false);
  };

  // Hapus Titik Proyek
  const handleDeleteProject = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus titik lokasi proyek "${name}"?`)) {
      setProjectLocations((prev) => prev.filter((p) => p.id !== id));
      showToast("success", `Titik proyek "${name}" dihapus.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[999999] px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold text-white transition-all transform animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === "success" ? "bg-emerald-600 shadow-emerald-600/30" : "bg-rose-600 shadow-rose-600/30"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      {standaloneTitle && (
        <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Geofencing & Radar GPS Presensi Satelit</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Pengaturan Titik GPS Kantor &amp; Lokasi Proyek
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Atur koordinat satelit resmi kantor utama, kantor cabang, dan radius toleransi meter untuk staf yang bertugas di kantor
                maupun di lokasi proyek lapangan, agar presensi kehadiran karyawan terverifikasi presisi tanpa kendala.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDetectCurrentLocation}
                disabled={isDetectingGps}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer backdrop-blur-md active:scale-95 disabled:opacity-50"
              >
                {isDetectingGps ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Mengunci Satelit GPS...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4 text-rose-400" />
                    <span>📍 Kunci Lokasi Saya Saat Ini</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving || loading}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-2.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan GPS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Form Koordinat Kantor & Peta Embed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Form Detail Kantor & Geofence (7 Kolom) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-base">Titik Koordinat Kantor Utama DSTech</h3>
                <p className="text-xs text-slate-500">Pusat acuan geofencing presensi staf di kantor</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● Titik Acuan Aktif
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Titik Kantor:</label>
              <input
                type="text"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder="Contoh: Kantor Pusat PT DSTech Smart Perkasa (Cilegon)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Fisik Kantor:</label>
              <textarea
                rows={2}
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="Alamat lengkap kantor..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Latitude (Garis Lintang):</label>
                  <span className="text-[10px] text-slate-400 font-mono">-90.0 s/d 90.0</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.000001"
                    value={officeLatitude}
                    onChange={(e) => setOfficeLatitude(parseFloat(e.target.value) || 0)}
                    placeholder="-6.031846"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <Compass className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Longitude (Garis Bujur):</label>
                  <span className="text-[10px] text-slate-400 font-mono">-180.0 s/d 180.0</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.000001"
                    value={officeLongitude}
                    onChange={(e) => setOfficeLongitude(parseFloat(e.target.value) || 0)}
                    placeholder="106.037198"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <Navigation className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>

            {gpsAccuracy !== null && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Koordinat diambil dari sensor browser saat ini dengan estimasi akurasi ±{gpsAccuracy} meter.</span>
              </div>
            )}

            {/* Pengaturan Radius Toleransi */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-700 block">Radius Toleransi Presensi (Geofence):</label>
                  <p className="text-[11px] text-slate-500">Jarak maksimal staf dari titik kantor yang diizinkan untuk absensi</p>
                </div>
                <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-black text-xs rounded-xl font-mono">
                  {geofenceRadiusMeters} Meter
                </span>
              </div>

              {/* Preset Radius Pills */}
              <div className="flex flex-wrap gap-2">
                {[50, 100, 150, 250, 500, 1000].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setGeofenceRadiusMeters(r)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      geofenceRadiusMeters === r
                        ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {r}m {r === 250 && "(Rekomendasi)"} {r === 1000 && "(Fleksibel)"}
                  </button>
                ))}
              </div>

              {/* Slider Slider */}
              <input
                type="range"
                min="20"
                max="2000"
                step="10"
                value={geofenceRadiusMeters}
                onChange={(e) => setGeofenceRadiusMeters(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            {/* Toggle Toleransi Dinas Luar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
              <input
                id="toggle-flex"
                type="checkbox"
                checked={allowFlexibleAttendance}
                onChange={(e) => setAllowFlexibleAttendance(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="toggle-flex" className="cursor-pointer text-xs space-y-0.5">
                <span className="font-bold text-slate-800 block">Izinkan Presensi Fleksibel Dinas Luar / Proyek</span>
                <span className="text-slate-500 block leading-relaxed">
                  Jika diaktifkan, staf yang bertugas di luar kantor (instalasi proyek, survey, atau dinas luar) tetap dapat melakukan presensi dengan mencantumkan nama proyek atau catatan lapangan.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pratinjau Google Maps Interaktif (5 Kolom) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" />
                <h4 className="font-black text-slate-800 text-sm">Pratinjau Peta Satelit Google Maps</h4>
              </div>
              <a
                href={`https://www.google.com/maps?q=${officeLatitude},${officeLongitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                Buka Penuh <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
              <iframe
                title="Google Maps Office Location"
                src={`https://maps.google.com/maps?q=${officeLatitude},${officeLongitude}&z=17&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 text-[11px] font-mono font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>
                  {officeLatitude.toFixed(6)}, {officeLongitude.toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Cara Kerja Geofencing Satelit DSTech:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Ketika staf membuka tombol Presensi Masuk/Pulang di portal teknisi (`/employee`), aplikasi membaca koordinat GPS perangkat staf dan menghitung jaraknya ke titik kantor ini. Jika jarak ≤ {geofenceRadiusMeters} meter, status absensi dinyatakan sah berada di kantor.
            </p>
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Daftar Titik GPS Lokasi Proyek Lapangan (Geofencing Multi-Proyek) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">Titik GPS Lokasi Proyek &amp; Cabang Lapangan</h3>
              <p className="text-xs text-slate-500">
                Daftar titik lokasi proyek tempat teknisi ditempatkan (Kawasan Industri, Pabrik, Gedung Klien)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAddProject}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Titik Proyek Baru</span>
          </button>
        </div>

        {projectLocations.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            Belum ada titik proyek tambahan yang didaftarkan. Tekan tombol &quot;+ Tambah Titik Proyek Baru&quot; di atas untuk menambahkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectLocations.map((loc) => (
              <div
                key={loc.id}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-all bg-gradient-to-b from-white to-slate-50/50 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        loc.isDefaultOffice
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {loc.isDefaultOffice ? "Kantor Utama" : "Titik Proyek"}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditProject(loc)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Titik Proyek"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!loc.isDefaultOffice && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(loc.id, loc.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Hapus Titik Proyek"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm">{loc.name}</h4>
                  {loc.clientName && <p className="text-xs text-slate-500 font-medium">Klien: {loc.clientName}</p>}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Koordinat:</span>
                    <span className="font-bold">
                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Radius Toleransi:</span>
                    <span className="font-bold text-blue-700">±{loc.radiusMeters || 350} Meter</span>
                  </div>
                  {loc.notes && <p className="text-[10px] text-slate-400 italic line-clamp-2">{loc.notes}</p>}

                  <a
                    href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pt-1 text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Lihat di Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit Titik Proyek */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm">
                  {editingProjectId ? "Edit Titik Proyek Lapangan" : "Tambah Titik Proyek Lapangan Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectItem} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Proyek / Titik Tugas:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pabrik Krakatau Posco - Pos Gerbang Utama"
                  value={projectForm.name || ""}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Klien / Perusahaan:</label>
                <input
                  type="text"
                  placeholder="Contoh: PT Krakatau Posco Energy"
                  value={projectForm.clientName || ""}
                  onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Latitude:</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={projectForm.latitude ?? -6.031846}
                    onChange={(e) => setProjectForm({ ...projectForm, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Longitude:</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={projectForm.longitude ?? 106.037198}
                    onChange={(e) => setProjectForm({ ...projectForm, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleDetectProjectLocation}
                  disabled={isDetectingProjectGps}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isDetectingProjectGps ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunci GPS Proyek...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                      <span>📍 Ambil Koordinat Saya Saat Ini (Jika Berada di Proyek)</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Radius Toleransi Geofencing (Meter):</label>
                  <span className="font-mono font-bold text-blue-600">{projectForm.radiusMeters || 350}m</span>
                </div>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  step="50"
                  value={projectForm.radiusMeters || 350}
                  onChange={(e) => setProjectForm({ ...projectForm, radiusMeters: parseInt(e.target.value) || 350 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Deskripsi Area Proyek:</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Wajib kenakan helm & rompi safety saat absensi di area pos proyek..."
                  value={projectForm.notes || ""}
                  onChange={(e) => setProjectForm({ ...projectForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer shadow-md shadow-blue-600/20"
                >
                  {editingProjectId ? "Simpan Perubahan" : "Tambahkan ke Daftar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
