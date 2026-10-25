"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  FileText,
  MapPin,
  Sparkles,
  Layers,
  List,
  Edit,
  Trash2,
  Send,
  UserCheck,
  Award,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export interface ActivityLog {
  id: string;
  type: "CALL" | "WHATSAPP" | "MEETING" | "SURVEY" | "PROPOSAL" | "NOTE";
  title: string;
  notes: string;
  createdAt: string;
  createdBy: string;
}

export interface Lead {
  id: string;
  leadNumber: string;
  clientName: string;
  company?: string;
  position?: string;
  phone: string;
  email?: string;
  category: string;
  projectTitle: string;
  estimatedValue: number;
  stage: "NEW" | "FOLLOW_UP" | "NEGOTIATION" | "SUPPORT" | "COMPLAINT" | "WON" | "LOST" | "NEW_LEAD" | "QUALIFIED" | "PROPOSAL_SENT";
  team?: "SALES" | "SUPPORT" | "COMPLAINT" | "COMMERCIAL";
  probability: number;
  source: string;
  assignedTo: string;
  expectedClosingDate?: string;
  location?: string;
  sphNumber?: string;
  notes?: string;
  activities: ActivityLog[];
  createdAt: string;
  updatedAt: string;
}

interface CrmMetrics {
  totalLeadsCount: number;
  activeLeadsCount: number;
  wonLeadsCount: number;
  lostLeadsCount: number;
  totalPipelineValue: number;
  totalWonValue: number;
  totalWeightedPipeline: number;
  winRate: number;
  avgDealSize: number;
}

const STAGES: { id: string; aliases: string[]; label: string; color: string; badge: string }[] = [
  { id: "NEW", aliases: ["NEW", "NEW_LEAD"], label: "1. Leads Masuk (Screening)", color: "border-sky-500 bg-sky-50/40 text-sky-900", badge: "bg-sky-100 text-sky-800" },
  { id: "FOLLOW_UP", aliases: ["FOLLOW_UP", "QUALIFIED"], label: "2. Ditangani AI (Kualifikasi)", color: "border-blue-500 bg-blue-50/40 text-blue-900", badge: "bg-blue-100 text-blue-800" },
  { id: "NEGOTIATION", aliases: ["NEGOTIATION", "PROPOSAL_SENT"], label: "3. Tim Support Sales & SPH", color: "border-indigo-500 bg-indigo-50/40 text-indigo-900", badge: "bg-indigo-100 text-indigo-900" },
  { id: "SUPPORT", aliases: ["SUPPORT"], label: "4. Tim Teknikal Maintenance", color: "border-amber-500 bg-amber-50/40 text-amber-900", badge: "bg-amber-100 text-amber-900" },
  { id: "COMPLAINT", aliases: ["COMPLAINT"], label: "5. Tim Penanganan Komplain", color: "border-rose-500 bg-rose-50/40 text-rose-900", badge: "bg-rose-100 text-rose-900" },
  { id: "WON", aliases: ["WON", "CLOSED_WON"], label: "6. Closing (Deal Berhasil)", color: "border-emerald-500 bg-emerald-50/40 text-emerald-900", badge: "bg-emerald-100 text-emerald-800" },
  { id: "LOST", aliases: ["LOST", "CLOSED_LOST"], label: "7. Batal / Lost", color: "border-slate-300 bg-slate-50/40 text-slate-700", badge: "bg-slate-200 text-slate-700" },
];

const CATEGORIES = [
  "ALL",
  "B2B Industri",
  "Residensial / Smart Home",
  "Instansi Pemerintah",
  "Komersial / Ruko",
  "Mitra Afiliasi",
];

const LEAD_SOURCES = [
  "Website / Chat WA",
  "E-Store",
  "Referral Mitra",
  "Direct Sales",
  "Tender",
  "Pameran / Event",
];

export default function AdminCrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<CrmMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedDetailLead, setSelectedDetailLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    clientName: "",
    company: "",
    position: "",
    phone: "",
    email: "",
    category: "B2B Industri",
    projectTitle: "",
    estimatedValue: 0,
    stage: "NEW",
    probability: 30,
    source: "Website / Chat WA",
    assignedTo: "RAMADHANI ST",
    expectedClosingDate: "",
    location: "Cilegon, Banten",
    sphNumber: "",
    notes: "",
  });

  // Activity Log State in Detail Modal
  const [activityForm, setActivityForm] = useState({
    type: "MEETING" as ActivityLog["type"],
    title: "",
    notes: "",
  });
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const [isSyncingSmartPro, setIsSyncingSmartPro] = useState(false);

  const handleSyncToSmartPro = async () => {
    setIsSyncingSmartPro(true);
    try {
      const res = await fetch("/api/crm/sync-smartpro", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Berhasil sinkron ke SmartPro WA!");
      } else {
        showToast(data.error || "Gagal sinkron ke SmartPro WA");
      }
    } catch (err) {
      console.error(err);
      showToast("Kendala jaringan saat sinkron ke SmartPro.");
    } finally {
      setIsSyncingSmartPro(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCrmData = async () => {
    setLoading(true);
    try {
      let url = `/api/crm?t=${Date.now()}`;
      if (selectedCategory !== "ALL") {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data || []);
        setMetrics(data.metrics || null);
        if (selectedDetailLead) {
          const updated = data.data.find((l: Lead) => l.id === selectedDetailLead.id);
          if (updated) setSelectedDetailLead(updated);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data CRM:", err);
      showToast("Gagal memuat data CRM!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrmData();
  }, [selectedCategory, searchQuery]);

  const formatRupiah = (val: number) => {
    return "Rp " + (Number(val) || 0).toLocaleString("id-ID");
  };

  const handleOpenAddModal = () => {
    setEditingLead(null);
    setFormData({
      clientName: "",
      company: "",
      position: "",
      phone: "",
      email: "",
      category: "B2B Industri",
      projectTitle: "",
      estimatedValue: 0,
      stage: "NEW_LEAD",
      probability: 30,
      source: "Website / Chat WA",
      assignedTo: "RAMADHANI ST",
      expectedClosingDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      location: "Cilegon, Banten",
      sphNumber: "",
      notes: "",
    });
    setIsLeadModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      clientName: lead.clientName,
      company: lead.company || "",
      position: lead.position || "",
      phone: lead.phone,
      email: lead.email || "",
      category: lead.category,
      projectTitle: lead.projectTitle,
      estimatedValue: lead.estimatedValue,
      stage: lead.stage,
      probability: lead.probability,
      source: lead.source,
      assignedTo: lead.assignedTo,
      expectedClosingDate: lead.expectedClosingDate || "",
      location: lead.location || "",
      sphNumber: lead.sphNumber || "",
      notes: lead.notes || "",
    });
    setIsLeadModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingLead) {
        // PATCH update
        const res = await fetch("/api/crm", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingLead.id,
            ...formData,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Prospek berhasil diperbarui!");
          setIsLeadModalOpen(false);
          fetchCrmData();
        } else {
          showToast(data.error || "Gagal memperbarui prospek");
        }
      } else {
        // POST create
        const res = await fetch("/api/crm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Prospek baru berhasil ditambahkan!");
          setIsLeadModalOpen(false);
          fetchCrmData();
        } else {
          showToast(data.error || "Gagal membuat prospek");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kendala jaringan saat menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveStage = async (leadId: string, targetStage: string) => {
    try {
      const res = await fetch("/api/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          stage: targetStage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Tahapan prospek berhasil dipindahkan!");
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal mengubah tahapan prospek.");
    }
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus prospek ${name}?`)) return;
    try {
      const res = await fetch(`/api/crm?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Prospek berhasil dihapus!");
        if (selectedDetailLead?.id === id) setSelectedDetailLead(null);
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus prospek.");
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetailLead || !activityForm.title) return;
    setIsSubmittingActivity(true);
    try {
      const res = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log_activity",
          leadId: selectedDetailLead.id,
          type: activityForm.type,
          title: activityForm.title,
          notes: activityForm.notes,
          createdBy: "Commercial Admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Catatan interaksi berhasil disimpan!");
        setActivityForm({ type: "MEETING", title: "", notes: "" });
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal mencatat interaksi.");
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-dstech-blue/10 text-dstech-blue">
              Commercial &amp; Growth Suite
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-bold text-slate-500">DSTech Smart Perkasa</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Target className="w-6 h-6 text-dstech-blue" />
            CRM &amp; Sales Pipeline Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau dan kelola prospek bisnis B2B industri, smart home perumahan, penawaran SPH, serta linimasa interaksi klien.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchCrmData()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "kanban" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>

          <button
            onClick={handleSyncToSmartPro}
            disabled={isSyncingSmartPro}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Sinkronkan seluruh prospek CRM ke akun utama SmartPro WA Gateway"
          >
            <Send className={`w-3.5 h-3.5 ${isSyncingSmartPro ? "animate-spin" : ""}`} />
            <span>{isSyncingSmartPro ? "Menyinkronkan..." : "⚡ Sync ke SmartPro WA"}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-dstech-blue hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Prospek</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Metrik Finansial Pipeline */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Pipeline Potensi
              </span>
              <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
                {formatRupiah(metrics.totalPipelineValue)}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Dari {metrics.activeLeadsCount} prospek aktif berjalan
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Closing Berhasil (Won)
              </span>
              <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">
                {formatRupiah(metrics.totalWonValue)}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                {metrics.wonLeadsCount} Kontrak Deal Sah
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Weighted Pipeline
              </span>
              <span className="text-xl font-black text-indigo-900 font-mono mt-1 block">
                {formatRupiah(metrics.totalWeightedPipeline)}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Probabilitas tertimbang sales
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Win Rate Closing
              </span>
              <span className="text-xl font-black text-amber-600 font-mono mt-1 block">
                {metrics.winRate}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Rata-rata deal: {formatRupiah(metrics.avgDealSize)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Filter & Pencarian Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Segmen:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "ALL" ? "Semua Segmen" : cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama klien, instansi, proyek..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
          />
        </div>
      </div>

      {/* MODE TAMPILAN 1: KANBAN PIPELINE BOARD */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3.5 overflow-x-auto pb-4 items-start">
          {STAGES.map((st) => {
            const stageLeads = leads.filter((l) => st.aliases.includes(l.stage) || l.stage === st.id);
            const stageValue = stageLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);

            return (
              <div
                key={st.id}
                className="bg-slate-100/80 rounded-2xl border border-slate-200/80 p-3 flex flex-col min-w-[240px] max-h-[800px]"
              >
                {/* Header Kolom Stage */}
                <div className="pb-2.5 mb-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-800">{st.label}</h3>
                    <span className="text-[10px] text-slate-500 font-mono font-bold block mt-0.5">
                      {formatRupiah(stageValue)}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${st.badge}`}>
                    {stageLeads.length}
                  </span>
                </div>

                {/* List Kartu Lead dalam Kolom */}
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 italic">
                      Tidak ada prospek
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedDetailLead(lead)}
                        className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs hover:shadow-md hover:border-dstech-blue transition-all cursor-pointer group space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-slate-400">
                            {lead.leadNumber}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 line-clamp-1 max-w-[110px]">
                            {lead.category}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-900 group-hover:text-dstech-blue transition-colors line-clamp-2">
                            {lead.projectTitle}
                          </h4>
                          <p className="text-[11px] font-bold text-slate-600 mt-0.5 line-clamp-1">
                            {lead.clientName} {lead.company ? `• ${lead.company}` : ""}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-black font-mono text-emerald-600">
                            {formatRupiah(lead.estimatedValue)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            Prob: <strong className="text-slate-800 font-mono">{lead.probability}%</strong>
                          </span>
                        </div>

                        {/* Progress Bar Probabilitas */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              lead.probability >= 80
                                ? "bg-emerald-500"
                                : lead.probability >= 50
                                ? "bg-amber-500"
                                : "bg-sky-500"
                            }`}
                            style={{ width: `${lead.probability}%` }}
                          />
                        </div>

                        {/* Footer Kartu & Navigasi Stage */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span className="truncate max-w-[100px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {lead.expectedClosingDate || "Belum diatur"}
                          </span>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {lead.stage !== "WON" && (
                              <button
                                onClick={() => handleMoveStage(lead.id, "WON")}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Tandai Closing (Won)"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditModal(lead)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded"
                              title="Edit Lead"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODE TAMPILAN 2: TABEL DIREKTORI PROSPEK */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-5">No. Lead &amp; Tanggal</th>
                  <th className="py-4 px-5">Klien &amp; Instansi</th>
                  <th className="py-4 px-5">Kebutuhan Proyek &amp; Segmen</th>
                  <th className="py-4 px-5">Estimasi Nilai</th>
                  <th className="py-4 px-5">Tahapan Pipeline</th>
                  <th className="py-4 px-5">Probabilitas</th>
                  <th className="py-4 px-5">PIC Sales</th>
                  <th className="py-4 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Tidak ada data prospek ditemukan.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const currentStageObj = STAGES.find((s) => s.id === lead.stage) || STAGES[0];
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5 align-top">
                          <span className="font-mono font-black text-slate-900 block">
                            {lead.leadNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(lead.createdAt).toLocaleDateString("id-ID")}
                          </span>
                        </td>

                        <td className="py-4 px-5 align-top">
                          <div className="font-black text-slate-900">{lead.clientName}</div>
                          {lead.company && (
                            <div className="text-[11px] text-slate-500 font-semibold">{lead.company}</div>
                          )}
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-mono font-bold inline-flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            {lead.phone}
                          </a>
                        </td>

                        <td className="py-4 px-5 align-top">
                          <div className="font-bold text-slate-800 line-clamp-2 max-w-[240px]">
                            {lead.projectTitle}
                          </div>
                          <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {lead.category}
                          </span>
                        </td>

                        <td className="py-4 px-5 align-top font-mono font-black text-emerald-600">
                          {formatRupiah(lead.estimatedValue)}
                        </td>

                        <td className="py-4 px-5 align-top">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${currentStageObj.badge}`}>
                            {currentStageObj.label}
                          </span>
                        </td>

                        <td className="py-4 px-5 align-top">
                          <span className="font-mono font-bold text-slate-800">{lead.probability}%</span>
                        </td>

                        <td className="py-4 px-5 align-top">
                          <span className="text-slate-600 text-xs">{lead.assignedTo}</span>
                        </td>

                        <td className="py-4 px-5 align-top text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedDetailLead(lead)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-dstech-blue text-white rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Rincian
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(lead)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.clientName)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT PROSPEK */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-dstech-blue" />
                {editingLead ? "Edit Prospek Penjualan" : "Tambah Prospek Penjualan Baru"}
              </h3>
              <button
                onClick={() => setIsLeadModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Nama Klien / Kontak Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ir. Hendra Gunawan"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Perusahaan / Instansi (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PT. Krakatau Posco Steel"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0812-8899-7766"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="hendra@krakatauposco.co.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Kategori Segmen Bisnis
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  >
                    {CATEGORIES.filter((c) => c !== "ALL").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Sumber Prospek (Lead Source)
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  >
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                  Judul Proyek / Kebutuhan Solusi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengadaan 24 Titik CCTV AI Thermal & Barrier Gate Pabrik"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Estimasi Nilai Kontrak (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Tahapan Pipeline Saat Ini
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  >
                    {STAGES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Probabilitas Closing (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    Target Tanggal Closing (Expected)
                  </label>
                  <input
                    type="date"
                    value={formData.expectedClosingDate}
                    onChange={(e) => setFormData({ ...formData, expectedClosingDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                    PIC Sales / Account Manager
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                  Catatan Kebutuhan / Spesifikasi Klien
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan detail kebutuhan teknis, kendala eksisting, atau instruksi khusus..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-dstech-blue hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{editingLead ? "Simpan Perubahan" : "Tambahkan Prospek"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RINCIAN PROSPEK & LINIMASA AKTIVITAS */}
      {selectedDetailLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-black bg-blue-50 text-dstech-blue px-2.5 py-1 rounded-lg">
                  {selectedDetailLead.leadNumber}
                </span>
                <span className="text-xs font-bold text-slate-500">{selectedDetailLead.category}</span>
              </div>
              <button
                onClick={() => setSelectedDetailLead(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Header Informasi Klien */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black">{selectedDetailLead.projectTitle}</h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedDetailLead.clientName} {selectedDetailLead.company ? `• ${selectedDetailLead.company}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black font-mono text-amber-400 block">
                    {formatRupiah(selectedDetailLead.estimatedValue)}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    Probabilitas: <strong>{selectedDetailLead.probability}%</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons Cepat */}
              <div className="pt-2 border-t border-slate-700 flex flex-wrap items-center gap-2">
                <a
                  href={`https://wa.me/${selectedDetailLead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Halo Bpk/Ibu ${selectedDetailLead.clientName}, kami dari PT. DSTech Smart Perkasa ingin menindaklanjuti kebutuhan "${selectedDetailLead.projectTitle}".`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Chat WhatsApp</span>
                </a>

                <Link
                  href="/admin/finance"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Buat Surat Penawaran (SPH)</span>
                </Link>

                <button
                  onClick={() => handleOpenEditModal(selectedDetailLead)}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Data</span>
                </button>
              </div>
            </div>

            {/* Pindah Tahapan Pipeline Langsung */}
            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                Ubah Tahapan Pipeline:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                {STAGES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleMoveStage(selectedDetailLead.id, st.id)}
                    className={`p-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                      selectedDetailLead.stage === st.id
                        ? "bg-dstech-blue text-white border-dstech-blue shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-[10px] block leading-tight">{st.label.replace(/^\d+\.\s*/, "")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Linimasa & Pencatatan Aktivitas Interaksi */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-dstech-blue" />
                Linimasa Aktivitas &amp; Interaksi Klien ({selectedDetailLead.activities?.length || 0})
              </h3>

              {/* Form Tambah Aktivitas */}
              <form onSubmit={handleAddActivity} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="text-xs font-black text-slate-800 block">
                  + Catat Interaksi Baru (Follow-up / Survey / Meeting)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <select
                      value={activityForm.type}
                      onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="MEETING">🤝 Meeting Tatap Muka</option>
                      <option value="SURVEY">🛠️ Survey Lapangan</option>
                      <option value="CALL">📞 Panggilan Telepon</option>
                      <option value="WHATSAPP">💬 Follow-up WhatsApp</option>
                      <option value="PROPOSAL">📑 Kirim Penawaran / SPH</option>
                      <option value="NOTE">📝 Catatan Internal</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Judul aktivitas (contoh: Meeting pembahasan termin DP)..."
                      value={activityForm.title}
                      onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="Catatan hasil diskusi, respon klien, atau kesepakatan berikutnya..."
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingActivity}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-dstech-blue text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Simpan Catatan Aktivitas</span>
                  </button>
                </div>
              </form>

              {/* Daftar Riwayat Aktivitas */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(!selectedDetailLead.activities || selectedDetailLead.activities.length === 0) ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Belum ada riwayat aktivitas interaksi.</p>
                ) : (
                  selectedDetailLead.activities.map((act) => (
                    <div key={act.id} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-900 flex items-center gap-1.5">
                          <span>{act.title}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(act.createdAt).toLocaleString("id-ID")}
                        </span>
                      </div>
                      {act.notes && (
                        <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">
                          {act.notes}
                        </p>
                      )}
                      <div className="text-[9.5px] text-slate-400 font-medium">
                        Oleh: {act.createdBy}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
