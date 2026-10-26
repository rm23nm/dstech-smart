"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Wrench,
  Search,
  Plus,
  Filter,
  Download,
  Printer,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  User,
  Calendar,
  DollarSign,
  TrendingDown,
  Layers,
  ArrowRightLeft,
  X,
  Sparkles,
  Camera,
  FileText,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
} from "lucide-react";
import { CorporateAsset } from "@/app/api/assets/route";

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<CorporateAsset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals
  const [isAssetModalOpen, setIsAssetModalOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<CorporateAsset | null>(null);
  const [isMutationModalOpen, setIsMutationModalOpen] = useState<boolean>(false);
  const [mutatingAsset, setMutatingAsset] = useState<CorporateAsset | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Forms
  const [assetForm, setAssetForm] = useState<{
    assetCode: string;
    name: string;
    category: string;
    brand: string;
    serialNumber: string;
    acquisitionDate: string;
    purchasePrice: number;
    economicLifeYears: number;
    salvageValue: number;
    depreciationMethod: string;
    picName: string;
    locationName: string;
    condition: string;
    photoUrl: string;
    notes: string;
  }>({
    assetCode: "",
    name: "",
    category: "Peralatan Kerja Teknisi",
    brand: "",
    serialNumber: "",
    acquisitionDate: new Date().toISOString().split("T")[0],
    purchasePrice: 0,
    economicLifeYears: 5,
    salvageValue: 0,
    depreciationMethod: "Garis Lurus",
    picName: "",
    locationName: "Gudang Utama Cilegon",
    condition: "Baik",
    photoUrl: "",
    notes: "",
  });

  const [mutationForm, setMutationForm] = useState<{
    toLocation: string;
    toPic: string;
    date: string;
    condition: string;
    notes: string;
  }>({
    toLocation: "",
    toPic: "",
    date: new Date().toISOString().split("T")[0],
    condition: "Baik",
    notes: "",
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/assets");
      const d = await res.json();
      if (d.success) {
        setAssets(d.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat data aset");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchCat = selectedCategory === "ALL" || a.category === selectedCategory;
      const matchCond = selectedCondition === "ALL" || a.condition === selectedCondition;
      const matchLoc = selectedLocation === "ALL" || a.locationName === selectedLocation;
      const matchQuery =
        !searchQuery ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.brand || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.serialNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.picName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchCond && matchLoc && matchQuery;
    });
  }, [assets, selectedCategory, selectedCondition, selectedLocation, searchQuery]);

  // KPI Calculations
  const assetKpis = useMemo(() => {
    const totalUnits = assets.length;
    const totalAcq = assets.reduce((sum, a) => sum + (Number(a.purchasePrice) || 0), 0);
    const totalBook = assets.reduce((sum, a) => sum + (Number(a.currentBookValue) || 0), 0);
    const totalDep = Math.max(0, totalAcq - totalBook);
    const inGoodCondition = assets.filter((a) => a.condition === "Baik").length;
    return {
      totalUnits,
      totalAcq,
      totalBook,
      totalDep,
      inGoodCondition,
    };
  }, [assets]);

  // Categories & Locations List
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(assets.map((a) => a.category).filter(Boolean)));
    return cats.length > 0
      ? cats
      : ["Peralatan Kerja Teknisi", "Alat Uji & Fiber Optic", "Kendaraan Operasional", "Perangkat IT & Server", "Inventaris Kantor"];
  }, [assets]);

  const availableLocations = useMemo(() => {
    const locs = Array.from(new Set(assets.map((a) => a.locationName).filter(Boolean)));
    return locs.length > 0 ? locs : ["Gudang Utama Cilegon", "Gudang Cabang Serang", "Unit Reaksi Cepat Mobile", "Kantor Pusat"];
  }, [assets]);

  // Handlers
  const handleOpenAddAsset = () => {
    const now = new Date();
    setAssetForm({
      assetCode: `AST-DSP-${now.getFullYear()}-${String(assets.length + 1).padStart(3, "0")}`,
      name: "",
      category: "Peralatan Kerja Teknisi",
      brand: "",
      serialNumber: "",
      acquisitionDate: now.toISOString().split("T")[0],
      purchasePrice: 0,
      economicLifeYears: 5,
      salvageValue: 0,
      depreciationMethod: "Garis Lurus",
      picName: "",
      locationName: "Gudang Utama Cilegon",
      condition: "Baik",
      photoUrl: "",
      notes: "",
    });
    setEditingAsset(null);
    setIsAssetModalOpen(true);
  };

  const handleEditAsset = (a: CorporateAsset) => {
    setEditingAsset(a);
    setAssetForm({
      assetCode: a.assetCode || "",
      name: a.name || "",
      category: a.category || "Peralatan Kerja Teknisi",
      brand: a.brand || "",
      serialNumber: a.serialNumber || "",
      acquisitionDate: a.acquisitionDate || "",
      purchasePrice: a.purchasePrice || 0,
      economicLifeYears: a.economicLifeYears || 5,
      salvageValue: a.salvageValue || 0,
      depreciationMethod: a.depreciationMethod || "Garis Lurus",
      picName: a.picName || "",
      locationName: a.locationName || "Gudang Utama Cilegon",
      condition: a.condition || "Baik",
      photoUrl: a.photoUrl || "",
      notes: a.notes || "",
    });
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (editingAsset) {
        const res = await fetch("/api/assets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingAsset.id,
            updates: assetForm,
          }),
        });
        const d = await res.json();
        if (d.success) {
          showToast(d.message || "Aset berhasil diperbarui");
          setIsAssetModalOpen(false);
          await fetchAssets();
        } else {
          alert(d.error || "Gagal memperbarui aset");
        }
      } else {
        const res = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assetForm),
        });
        const d = await res.json();
        if (d.success) {
          showToast(d.message || "Aset berhasil disimpan");
          setIsAssetModalOpen(false);
          await fetchAssets();
        } else {
          alert(d.error || "Gagal menambahkan aset");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAsset = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus aset "${name}" dari inventori?`)) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/assets?id=${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        showToast("Aset berhasil dihapus");
        await fetchAssets();
      } else {
        alert(d.error || "Gagal menghapus aset");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMutation = (a: CorporateAsset) => {
    setMutatingAsset(a);
    setMutationForm({
      toLocation: a.locationName || "Gudang Utama Cilegon",
      toPic: a.picName || "",
      date: new Date().toISOString().split("T")[0],
      condition: a.condition || "Baik",
      notes: "Peminjaman / mutasi tugas proyek lapangan.",
    });
    setIsMutationModalOpen(true);
  };

  const handleSaveMutation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutatingAsset) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: mutatingAsset.id,
          actionType: "mutate",
          updates: mutationForm,
        }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("Mutasi aset berhasil dicatat");
        setIsMutationModalOpen(false);
        setMutatingAsset(null);
        await fetchAssets();
      } else {
        alert(d.error || "Gagal mencatat mutasi");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memproses mutasi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Kode Aset",
      "Nama Aset",
      "Kategori",
      "Merek",
      "No Seri / Plat",
      "Tanggal Perolehan",
      "Harga Perolehan (Rp)",
      "Nilai Buku Saat Ini (Rp)",
      "Kondisi",
      "Penanggung Jawab (PIC)",
      "Lokasi",
    ];

    const rows = filteredAssets.map((a) => [
      `"${a.assetCode}"`,
      `"${a.name}"`,
      `"${a.category}"`,
      `"${a.brand || "-"}"`,
      `"${a.serialNumber || "-"}"`,
      `"${a.acquisitionDate}"`,
      a.purchasePrice || 0,
      a.currentBookValue || 0,
      `"${a.condition}"`,
      `"${a.picName}"`,
      `"${a.locationName}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daftar_Aset_DSTech_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[999999] animate-bounce print:hidden">
          <div className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-2xl border border-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[36px] bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 text-white border border-slate-800 shadow-xl relative overflow-hidden print:hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400 via-emerald-600 to-transparent"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Manajemen Aset Tetap & Peralatan Kerja
              </span>
              <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                • Prefix: dstech_asset_
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Pengelolaan Aset Perusahaan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pencatatan inventaris alat kerja teknisi, kendaraan operasional, peralatan fiber optic, kalkulasi penyusutan otomatis (*Straight-Line Depreciation*), dan pelacakan mutasi PIC lapangan PT. DSTech Smart Perkasa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAddAsset}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Aset Baru</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center gap-2 shadow border border-slate-700 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span>Cetak Rekap A4</span>
            </button>
            <button
              onClick={fetchAssets}
              disabled={isLoading}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Kartu KPI Analitik Aset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Harga Perolehan</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-2 font-mono">
            {formatRupiah(assetKpis.totalAcq)}
          </p>
          <p className="text-[11px] text-teal-600 mt-1">{assetKpis.totalUnits} Unit Terdata di Sistem</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Akumulasi Penyusutan</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-black text-rose-600 mt-2 font-mono">
            {formatRupiah(assetKpis.totalDep)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Metode Garis Lurus (Straight-Line)</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-teal-200 shadow-xs bg-gradient-to-br from-teal-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-700">Total Nilai Buku Bersih (NBV)</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-2 font-mono">
            {formatRupiah(assetKpis.totalBook)}
          </p>
          <p className="text-[11px] text-teal-600 mt-1">Nilai Riil Neraca Keuangan</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Kondisi Alat Prima (Baik)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-600 mt-2 font-mono">
            {assetKpis.inGoodCondition} / {assetKpis.totalUnits} Unit
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Siap Mobilisasi Operasional</p>
        </div>
      </div>

      {/* Control Bar: Pencarian, Filter & Mode View */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari kode aset, nama alat, merek, no. seri, atau PIC penanggung jawab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none cursor-pointer"
            >
              <option value="ALL">📦 Semua Kategori</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none cursor-pointer"
            >
              <option value="ALL">⚙️ Semua Kondisi</option>
              <option value="Baik">✅ Baik (Siap Pakai)</option>
              <option value="Rusak Ringan">⚠️ Rusak Ringan</option>
              <option value="Rusak Berat">❌ Rusak Berat</option>
              <option value="Dalam Servis">🔧 Dalam Servis</option>
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none cursor-pointer"
            >
              <option value="ALL">📍 Semua Lokasi</option>
              {availableLocations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Unduh Data CSV/Excel"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daftar Aset: Tabel Komprehensif */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            Daftar Inventaris Aset Perusahaan
          </span>
          <span className="text-[11px] font-bold text-slate-400">
            {filteredAssets.length} Aset Terpilih
          </span>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">Tidak ada aset yang sesuai kriteria</p>
            <p className="text-xs text-slate-400">
              Coba reset filter atau klik tombol &quot;+ Tambah Aset Baru&quot; di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  <th className="px-4 py-3.5">Kode & Foto</th>
                  <th className="px-4 py-3.5">Nama Aset & Merek</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">PIC & Lokasi</th>
                  <th className="px-4 py-3.5 text-right">Harga Perolehan</th>
                  <th className="px-4 py-3.5 text-right">Nilai Buku (NBV)</th>
                  <th className="px-4 py-3.5 text-center">Kondisi</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAssets.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                          {a.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={a.photoUrl} alt={a.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Wrench className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-mono font-bold text-teal-700">{a.assetCode}</p>
                          <span className="text-[10px] text-slate-400">{a.acquisitionDate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{a.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {a.brand || "-"} • SN: <span className="font-mono">{a.serialNumber || "-"}</span>
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        {a.picName || "Belum ditentukan"}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {a.locationName || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-700">
                      {formatRupiah(a.purchasePrice || 0)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-teal-700">
                      {formatRupiah(a.currentBookValue || 0)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          a.condition === "Baik"
                            ? "bg-emerald-100 text-emerald-700"
                            : a.condition === "Rusak Ringan"
                            ? "bg-amber-100 text-amber-700"
                            : a.condition === "Dalam Servis"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {a.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenMutation(a)}
                          title="Mutasi / Peminjaman Alat"
                          className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditAsset(a)}
                          title="Edit Aset"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset(a.id, a.name)}
                          title="Hapus Aset"
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL: FORM TAMBAH / EDIT ASET                      */}
      {/* ==================================================== */}
      {isAssetModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsAssetModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-600 text-white">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">
                    {editingAsset ? "Edit Data Aset Perusahaan" : "Tambah Aset & Peralatan Kerja Baru"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sistem inventarisasi & depresiasi PT. DSTech Smart Perkasa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssetModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Aset</label>
                  <input
                    type="text"
                    required
                    value={assetForm.assetCode}
                    onChange={(e) => setAssetForm({ ...assetForm, assetCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Aset</label>
                  <select
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Peralatan Kerja Teknisi">Peralatan Kerja Teknisi</option>
                    <option value="Alat Uji & Fiber Optic">Alat Uji & Fiber Optic</option>
                    <option value="Kendaraan Operasional">Kendaraan Operasional</option>
                    <option value="Perangkat IT & Server">Perangkat IT & Server</option>
                    <option value="Inventaris Kantor">Inventaris Kantor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Aset / Peralatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fusion Splicer Fiber Optic & OTDR Kit"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Merek / Pabrikan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bosch, Makita, Fujikura, Daihatsu"
                    value={assetForm.brand}
                    onChange={(e) => setAssetForm({ ...assetForm, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Seri / Plat Nomor</label>
                  <input
                    type="text"
                    placeholder="Contoh: SN-89218 atau A 8421 DS"
                    value={assetForm.serialNumber}
                    onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Perolehan</label>
                  <input
                    type="date"
                    required
                    value={assetForm.acquisitionDate}
                    onChange={(e) => setAssetForm({ ...assetForm, acquisitionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga Perolehan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={assetForm.purchasePrice || ""}
                    onChange={(e) => setAssetForm({ ...assetForm, purchasePrice: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Umur Ekonomis (Tahun)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={assetForm.economicLifeYears || ""}
                    onChange={(e) => setAssetForm({ ...assetForm, economicLifeYears: Number(e.target.value) || 5 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nilai Residu Sisa (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={assetForm.salvageValue || ""}
                    onChange={(e) => setAssetForm({ ...assetForm, salvageValue: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kondisi Fisik</label>
                  <select
                    value={assetForm.condition}
                    onChange={(e) => setAssetForm({ ...assetForm, condition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Baik">✅ Baik (Siap Pakai)</option>
                    <option value="Rusak Ringan">⚠️ Rusak Ringan</option>
                    <option value="Rusak Berat">❌ Rusak Berat</option>
                    <option value="Dalam Servis">🔧 Dalam Servis / Perbaikan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama staf atau teknisi penanggung jawab"
                    value={assetForm.picName}
                    onChange={(e) => setAssetForm({ ...assetForm, picName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lokasi Penyimpanan / Titik</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gudang Utama Cilegon / Unit Mobil"
                    value={assetForm.locationName}
                    onChange={(e) => setAssetForm({ ...assetForm, locationName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL Foto Aset (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://... atau /uploads/dstech_img_..."
                  value={assetForm.photoUrl}
                  onChange={(e) => setAssetForm({ ...assetForm, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Spesifikasi kelengkapan part, nomor faktur pembelian, dll."
                  value={assetForm.notes}
                  onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLoading ? "Menyimpan..." : "Simpan Aset"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: MUTASI / PINJAM ALAT KERJA                   */}
      {/* ==================================================== */}
      {isMutationModalOpen && mutatingAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsMutationModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-600 text-white">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">
                    Mutasi / Peminjaman Alat Kerja
                  </h3>
                  <p className="text-xs text-slate-400">
                    {mutatingAsset.name} ({mutatingAsset.assetCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMutationModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMutation} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-700">Posisi Saat Ini:</p>
                <p className="text-slate-600">
                  📍 Lokasi: <span className="font-bold">{mutatingAsset.locationName}</span>
                </p>
                <p className="text-slate-600">
                  👤 PIC Sekarang: <span className="font-bold">{mutatingAsset.picName}</span>
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Mutasi / Peminjaman</label>
                <input
                  type="date"
                  required
                  value={mutationForm.date}
                  onChange={(e) => setMutationForm({ ...mutationForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pindah ke Lokasi / Titik Proyek</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Proyek Barrier Gate Cilegon / Gudang Serang"
                  value={mutationForm.toLocation}
                  onChange={(e) => setMutationForm({ ...mutationForm, toLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Penerima Baru / PIC Penanggung Jawab</label>
                <input
                  type="text"
                  required
                  placeholder="Nama teknisi atau staf penerima tanggung jawab"
                  value={mutationForm.toPic}
                  onChange={(e) => setMutationForm({ ...mutationForm, toPic: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kondisi Alat Saat Serah Terima</label>
                <select
                  value={mutationForm.condition}
                  onChange={(e) => setMutationForm({ ...mutationForm, condition: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Baik">✅ Baik (Lengkap & Normal)</option>
                  <option value="Rusak Ringan">⚠️ Rusak Ringan</option>
                  <option value="Dalam Servis">🔧 Butuh Servis / Kalibrasi</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan / Tujuan Peminjaman</label>
                <textarea
                  rows={2}
                  placeholder="Nomor SPK proyek atau durasi peminjaman di lapangan..."
                  value={mutationForm.notes}
                  onChange={(e) => setMutationForm({ ...mutationForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMutationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isLoading ? "Menyimpan..." : "Simpan Mutasi Aset"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CETAK RESMI LEMBAR A4 DAFTAR ASET             */}
      {/* ==================================================== */}
      {isPrintModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn print-modal-backdrop"
          onClick={() => setIsPrintModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto print-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-teal-600" />
                Lembar Cetak Rekapitulasi Aset Perusahaan Resmi A4 — PT. DSTech Smart Perkasa
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const originalTitle = document.title;
                    document.title = `REKAPITULASI_ASET_DSTECH_${new Date().toISOString().slice(0, 10)}`;
                    window.print();
                    setTimeout(() => {
                      document.title = originalTitle;
                    }, 2000);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Sheet Preview */}
            <div
              id="print-asset-sheet"
              className="bg-white p-8 sm:p-12 border border-slate-300 rounded-2xl shadow-inner text-slate-800 space-y-6 font-sans relative overflow-hidden"
            >
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900">
                  REKAPITULASI INVENTARIS ASET TETAP & PERALATAN KERJA
                </h2>
                <p className="text-xs font-bold text-slate-600 mt-1 uppercase">
                  PT. DSTECH SMART PERKASA
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-300 rounded-xl text-center text-xs">
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">TOTAL UNIT ASET</span>
                  <p className="font-black text-slate-900 font-mono text-sm mt-0.5">{assetKpis.totalUnits} Unit</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">HARGA PEROLEHAN</span>
                  <p className="font-black text-slate-900 font-mono text-sm mt-0.5">{formatRupiah(assetKpis.totalAcq)}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">AKUMULASI PENYUSUTAN</span>
                  <p className="font-black text-rose-600 font-mono text-sm mt-0.5">{formatRupiah(assetKpis.totalDep)}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">NILAI BUKU (NBV)</span>
                  <p className="font-black text-emerald-700 font-mono text-sm mt-0.5">{formatRupiah(assetKpis.totalBook)}</p>
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-400 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400 uppercase text-[10px]">
                    <th className="border border-slate-400 px-3 py-2 text-center w-12">No</th>
                    <th className="border border-slate-400 px-3 py-2 text-center w-28">Kode Aset</th>
                    <th className="border border-slate-400 px-3 py-2 text-left">Nama Aset & Merek</th>
                    <th className="border border-slate-400 px-3 py-2 text-left">Kategori</th>
                    <th className="border border-slate-400 px-3 py-2 text-left">PIC & Lokasi</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">Harga Beli</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">Nilai Buku</th>
                    <th className="border border-slate-400 px-3 py-2 text-center w-20">Kondisi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((a, idx) => (
                    <tr key={a.id} className="border-b border-slate-300">
                      <td className="border border-slate-300 px-3 py-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center font-mono font-bold text-teal-800">{a.assetCode}</td>
                      <td className="border border-slate-300 px-3 py-2 font-bold text-slate-800">{a.name}</td>
                      <td className="border border-slate-300 px-3 py-2 text-slate-600">{a.category}</td>
                      <td className="border border-slate-300 px-3 py-2 text-slate-700">
                        {a.picName}<br /><span className="text-[10px] text-slate-500">{a.locationName}</span>
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-mono font-bold">{formatRupiah(a.purchasePrice || 0)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-mono font-black text-emerald-800">{formatRupiah(a.currentBookValue || 0)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center font-bold">{a.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div className="space-y-16">
                  <p className="font-bold text-slate-700">Disiapkan Oleh,<br /><span className="text-[10px] font-normal text-slate-500">Staff Logistik & Inventaris</span></p>
                  <p className="font-bold underline text-slate-900">Admin Logistik DSTech</p>
                </div>
                <div className="space-y-16">
                  <p className="font-bold text-slate-700">Mengetahui & Menyetujui,<br /><span className="text-[10px] font-normal text-slate-500">Direktur Utama</span></p>
                  <p className="font-bold underline text-slate-900">Rudi Meidianto</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
