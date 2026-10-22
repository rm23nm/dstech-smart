"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Plus,
  Trash2,
  Edit3,
  Printer,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  PhoneCall,
  HardHat,
  ArrowRight,
  Eye,
  Sliders,
  Filter,
  CheckSquare,
  Sparkles,
  HelpCircle,
  X,
  Send,
  Building,
  Briefcase,
  AlertCircle,
  ListTodo,
  Camera,
  Image as ImageIcon,
  UploadCloud,
  Layers,
  Upload,
  Receipt,
  Navigation,
  Package,
  AlertTriangle as AlertTriangleIcon,
} from "lucide-react";

export interface TaskPhoto {
  id: string;
  url: string;
  caption: string;
  category: "documentation" | "part_replacement";
  createdAt: string;
}

interface MaintenanceTask {
  id: string;
  ticketNumber?: string;
  entityType?: "PT" | "NON_PT";
  type?: string;
  title: string;
  client: string;
  clientId?: string;
  clientPhone?: string;
  clientPic?: string;
  location: string;
  date: string;
  deadline: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  priority: "Normal" | "Medium" | "High" | "Urgent";
  technician: string;
  technicianId?: string;
  technicianPhone: string;
  scope: string[];
  equipment: string[];
  photos?: TaskPhoto[];
  report?: string;
  notes?: string;
  recommendation?: string;
  completionDate?: string;
  createdAt?: string;
  updatedAt?: string;
  // GPS Tracking
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string;
  // Material & Damage tracking
  damagedItems?: Array<{
    id: string;
    name: string;
    qty?: number;
    quantity?: number;
    unit: string;
    condition: string;
    action?: string;
    actionTaken?: string;
    note?: string;
    notes?: string;
  }>;
  usedMaterials?: any[];
  linkedMaterialRequests?: any[];
  // Invoice
  invoiceStatus?: string;
  invoiceNumber?: string;
  invoiceId?: string;
}

interface ClientOption {
  id: string;
  name: string;
  companyName: string;
  picName: string;
  phone: string;
  address: string;
}

interface TechnicianOption {
  id: string;
  name: string;
  phone: string;
  email: string;
}

const PRESET_SCOPE_ITEMS = [
  "Pembersihan lensa optik & housing kamera CCTV",
  "Pengecekan tegangan adaptor & power supply 12V/24V",
  "Pemeriksaan kapasitas harddisk & rekaman NVR/DVR",
  "Uji fungsi rekaman malam hari (Infrared / DarkFighter)",
  "Pengecekan dan re-crimping konektor RJ45 / BNC",
  "Kalibrasi sensor optical loop detector barrier gate",
  "Pengecekan motor gate, per pegas, dan limit switch",
  "Uji coba kartu RFID & modul drop lock access door",
  "Pengecekan kabel jaringan UTP / Fiber Optic & switch hub",
  "Backup data konfigurasi sistem dan update firmware",
];

const PRESET_EQUIPMENT_ITEMS = [
  "Digital Multitester & Tang Ampere",
  "Tool Set Obeng, Tang Kombinasi, & Kunci Pas",
  "Konektor RJ45 Cat6 Commscope (1 Pack)",
  "Tang Crimping RJ45 & LAN Cable Tester",
  "Cairan Pembersih Lensa & Kain Microfiber",
  "Tangga Lipat Teleskopik 3.8 Meter",
  "Power Supply Backup 12V 5A",
  "Adaptor Kamera CCTV Waterproof 12V 2A",
  "Lakban Isolasi Listrik 3M & Cable Ties",
  "APD Lengkap: Helm Safety, Rompi, & Sepatu Safety",
];

export default function MaintenancePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntityTab, setSelectedEntityTab] = useState<"ALL" | "PT" | "NON_PT">("ALL");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterType, setFilterType] = useState("Semua");
  const [filterTechnician, setFilterTechnician] = useState("Semua");

  // Masters
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Detail Modal
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<MaintenanceTask | null>(null);

  // Print Modal
  const [selectedTaskForPrint, setSelectedTaskForPrint] = useState<MaintenanceTask | null>(null);
  const [watermarkOpacity, setWatermarkOpacity] = useState(15);
  const [letterheadEnabled, setLetterheadEnabled] = useState(true);
  const [customLetterheadUrl, setCustomLetterheadUrl] = useState<string>("");

  const handleLetterheadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 8MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      if (base64Url) {
        setCustomLetterheadUrl(base64Url);
        setLetterheadEnabled(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Photo States & Modals
  const [selectedTaskForPhotos, setSelectedTaskForPhotos] = useState<MaintenanceTask | null>(null);
  const [selectedTaskForPhotoPrint, setSelectedTaskForPhotoPrint] = useState<MaintenanceTask | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoCategoryFilter, setPhotoCategoryFilter] = useState<"all" | "documentation" | "part_replacement">("all");
  const [photoForm, setPhotoForm] = useState<{
    url: string;
    caption: string;
    category: "documentation" | "part_replacement";
  }>({
    url: "",
    caption: "",
    category: "documentation",
  });

  // Form State
  const [formData, setFormData] = useState({
    ticketNumber: "",
    entityType: "PT" as "PT" | "NON_PT",
    type: "Preventive Maintenance",
    title: "",
    client: "",
    clientId: "",
    clientPhone: "",
    clientPic: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    deadline: new Date().toISOString().split("T")[0],
    status: "Pending" as MaintenanceTask["status"],
    priority: "Medium" as MaintenanceTask["priority"],
    technician: "",
    technicianId: "",
    technicianPhone: "",
    scope: [
      "Pembersihan lensa optik & housing kamera CCTV",
      "Pengecekan tegangan adaptor & power supply 12V",
      "Pemeriksaan kapasitas harddisk & rekaman NVR",
    ],
    equipment: ["Digital Multitester", "Tool Set Obeng", "Cairan Pembersih Lensa"],
    notes: "",
    recommendation: "",
  });

  const [newScopeInput, setNewScopeInput] = useState("");
  const [newEquipInput, setNewEquipInput] = useState("");

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employee/tasks");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTasks(json.data);
      }
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError("Gagal memuat daftar maintenance.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Master Clients & Technicians
  const fetchMasters = async () => {
    try {
      // Clients from Finance API
      const resFinance = await fetch("/api/finance");
      const jsonFinance = await resFinance.json();
      if (jsonFinance.success && jsonFinance.data && Array.isArray(jsonFinance.data.clients)) {
        const clientList: ClientOption[] = jsonFinance.data.clients.map((c: any) => ({
          id: c.id,
          name: c.name || c.companyName,
          companyName: c.companyName || c.name,
          picName: c.picName || c.pic || "",
          phone: c.phone || "",
          address: c.address || "",
        }));
        setClients(clientList);
      }

      // Technicians from Users API
      const resUsers = await fetch("/api/users");
      const jsonUsers = await resUsers.json();
      if (jsonUsers.success && Array.isArray(jsonUsers.data)) {
        const techList: TechnicianOption[] = jsonUsers.data
          .filter((u: any) => u.role === "EMPLOYEE" || u.role === "ADMIN")
          .map((u: any) => ({
            id: u.id,
            name: u.name,
            phone: u.phone || "",
            email: u.email,
          }));
        if (techList.length > 0) {
          setTechnicians(techList);
        } else {
          // Fallback default technicians
          setTechnicians([
            { id: "dstech_tech_1", name: "RAMADHANI ST", phone: "+6282259494242", email: "rm23nm@dstechsmart.com" },
            { id: "dstech_tech_2", name: "Teknisi Hendra", phone: "085712345678", email: "hendra@dstechsmart.com" },
          ]);
        }
      }
    } catch (err) {
      console.warn("Using fallback masters:", err);
      setTechnicians([
        { id: "dstech_tech_1", name: "RAMADHANI ST", phone: "+6282259494242", email: "rm23nm@dstechsmart.com" },
        { id: "dstech_tech_2", name: "Teknisi Hendra", phone: "085712345678", email: "hendra@dstechsmart.com" },
      ]);
    }
  };

  // Handler: Generate Invoice dari tiket Completed (1-klik)
  const handleGenerateInvoice = (task: MaintenanceTask) => {
    // Encode data tiket sebagai query param untuk pre-fill form finance
    const invoiceParams = new URLSearchParams({
      fromMaintenance: "true",
      ticketId: task.id,
      ticketNumber: task.ticketNumber || task.id,
      clientName: task.client,
      clientPhone: task.clientPhone || "",
      description: `Jasa Maintenance & Perbaikan - ${task.title}`,
      entityType: task.entityType || "PT",
    });
    router.push(`/admin/finance?${invoiceParams.toString()}`);
  };

  useEffect(() => {
    fetchTasks();
    fetchMasters();
  }, []);

  // Handlers
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const countThisMonth = tasks.filter((t) => t.ticketNumber?.includes(`MTC-${yearMonth}`)).length + 1;
    const autoTicket = `MTC-${yearMonth}-${String(countThisMonth).padStart(3, "0")}`;

    setFormData({
      ticketNumber: autoTicket,
      entityType: selectedEntityTab === "NON_PT" ? "NON_PT" : "PT",
      type: "Preventive Maintenance",
      title: "Maintenance & Pembersihan Rutin Kamera CCTV",
      client: clients[0]?.name || "PT. Krakatau Posco Energy",
      clientId: clients[0]?.id || "",
      clientPhone: clients[0]?.phone || "0812-9988-7766",
      clientPic: clients[0]?.picName || "Bpk. PIC Lapangan",
      location: clients[0]?.address || "Kawasan Industri Krakatau Steel, Cilegon",
      date: now.toISOString().split("T")[0],
      deadline: now.toISOString().split("T")[0],
      status: "Pending",
      priority: "Medium",
      technician: technicians[0]?.name || "",
      technicianId: technicians[0]?.id || "",
      technicianPhone: technicians[0]?.phone || "",
      scope: [
        "Pembersihan lensa optik & housing kamera CCTV",
        "Pengecekan tegangan adaptor & power supply 12V",
        "Pemeriksaan kapasitas harddisk & rekaman NVR",
      ],
      equipment: ["Digital Multitester", "Tool Set Obeng", "Cairan Pembersih Lensa"],
      notes: "Wajib mengenakan APD lengkap dan lapor pos security sebelum memasuki area kerja.",
      recommendation: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: MaintenanceTask) => {
    setIsEditMode(true);
    setEditingId(task.id);
    setFormData({
      ticketNumber: task.ticketNumber || "",
      entityType: task.entityType || "PT",
      type: task.type || "Preventive Maintenance",
      title: task.title,
      client: task.client,
      clientId: task.clientId || "",
      clientPhone: task.clientPhone || "",
      clientPic: task.clientPic || "",
      location: task.location,
      date: task.date,
      deadline: task.deadline,
      status: task.status,
      priority: task.priority,
      technician: task.technician,
      technicianId: task.technicianId || "",
      technicianPhone: task.technicianPhone,
      scope: [...task.scope],
      equipment: [...task.equipment],
      notes: task.notes || "",
      recommendation: task.recommendation || "",
    });
    setIsModalOpen(true);
  };

  const handleClientSelect = (clientId: string) => {
    const selected = clients.find((c) => c.id === clientId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        clientId: selected.id,
        client: selected.name,
        clientPhone: selected.phone || prev.clientPhone,
        clientPic: selected.picName || prev.clientPic,
        location: selected.address || prev.location,
      }));
    }
  };

  const handleTechnicianSelect = (techName: string) => {
    const selected = technicians.find((t) => t.name === techName);
    setFormData((prev) => ({
      ...prev,
      technician: techName,
      technicianId: selected?.id || "",
      technicianPhone: selected?.phone || prev.technicianPhone,
    }));
  };

  const handleAddScopeItem = (text: string) => {
    if (!text.trim()) return;
    if (!formData.scope.includes(text.trim())) {
      setFormData((prev) => ({ ...prev, scope: [...prev.scope, text.trim()] }));
    }
    setNewScopeInput("");
  };

  const handleRemoveScopeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      scope: prev.scope.filter((_, i) => i !== index),
    }));
  };

  const handleAddEquipItem = (text: string) => {
    if (!text.trim()) return;
    if (!formData.equipment.includes(text.trim())) {
      setFormData((prev) => ({ ...prev, equipment: [...prev.equipment, text.trim()] }));
    }
    setNewEquipInput("");
  };

  const handleRemoveEquipItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editingId) {
        // PUT
        const res = await fetch("/api/employee/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          fetchTasks();
        } else {
          alert("Gagal memperbarui tiket: " + (json.error || "Terjadi kesalahan"));
        }
      } else {
        // POST
        const res = await fetch("/api/employee/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          fetchTasks();
        } else {
          alert("Gagal membuat tiket: " + (json.error || "Terjadi kesalahan"));
        }
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string, ticketNumber?: string) => {
    if (!confirm(`Hapus tiket maintenance ${ticketNumber || id}? Data yang dihapus tidak dapat dipulihkan.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/employee/tasks?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchTasks();
      } else {
        alert("Gagal menghapus tiket: " + (json.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleQuickStatusChange = async (task: MaintenanceTask, newStatus: MaintenanceTask["status"]) => {
    try {
      const res = await fetch("/api/employee/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        fetchTasks();
        if (selectedTaskForDetail && selectedTaskForDetail.id === task.id) {
          setSelectedTaskForDetail({ ...selectedTaskForDetail, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Quick status change error:", err);
    }
  };

  // Helper Kompresi Foto Lampiran Maintenance (Target Maksimal ~40 KB)
  const compressMaintenancePhoto = async (
    file: File,
    maxTargetSizeKb = 40,
    initialMaxWidth = 840,
    initialMaxHeight = 1120
  ): Promise<File> => {
    if (!file.type.startsWith("image/")) return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target?.result as string;
        img.onload = async () => {
          let curWidth = img.width;
          let curHeight = img.height;

          if (curWidth > initialMaxWidth || curHeight > initialMaxHeight) {
            if (curWidth / initialMaxWidth > curHeight / initialMaxHeight) {
              curHeight = Math.round((curHeight * initialMaxWidth) / curWidth);
              curWidth = initialMaxWidth;
            } else {
              curWidth = Math.round((curWidth * initialMaxHeight) / curHeight);
              curHeight = initialMaxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(file);

          const maxSizeBytes = maxTargetSizeKb * 1024;
          let bestBlob: Blob | null = null;
          const testQualities = [0.70, 0.58, 0.45, 0.35, 0.26, 0.20];
          let currentW = curWidth;
          let currentH = curHeight;

          for (let step = 0; step < testQualities.length; step++) {
            canvas.width = currentW;
            canvas.height = currentH;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, currentW, currentH);
            ctx.drawImage(img, 0, 0, currentW, currentH);

            const q = testQualities[step];
            const blob: Blob | null = await new Promise((res) => {
              canvas.toBlob((b) => res(b), "image/jpeg", q);
            });

            if (blob) {
              bestBlob = blob;
              if (blob.size <= maxSizeBytes) break;
            }
          }

          if (bestBlob && bestBlob.size > maxSizeBytes) {
            for (let downscale = 0; downscale < 4; downscale++) {
              currentW = Math.round(currentW * 0.80);
              currentH = Math.round(currentH * 0.80);
              if (currentW < 240) break;

              canvas.width = currentW;
              canvas.height = currentH;
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, currentW, currentH);
              ctx.drawImage(img, 0, 0, currentW, currentH);

              for (const q of [0.38, 0.25, 0.18]) {
                const blob: Blob | null = await new Promise((res) => {
                  canvas.toBlob((b) => res(b), "image/jpeg", q);
                });
                if (blob) {
                  bestBlob = blob;
                  if (blob.size <= maxSizeBytes) break;
                }
              }
              if (bestBlob && bestBlob.size <= maxSizeBytes) break;
            }
          }

          if (!bestBlob) return resolve(file);

          const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
          resolve(new File([bestBlob], cleanName, { type: "image/jpeg", lastModified: Date.now() }));
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  // Upload Photo File via /api/upload
  const handleUploadPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const fileToUpload = await compressMaintenancePhoto(file, 40);

      const fd = new FormData();
      fd.append("file", fileToUpload);
      fd.append("docType", "maintenance_photo");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setPhotoForm((prev) => ({ ...prev, url: json.url }));
      } else {
        alert("Gagal mengunggah foto: " + (json.message || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Error upload: " + err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Add Photo to Task
  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForPhotos) return;
    if (!photoForm.url.trim()) {
      alert("Harap unggah foto atau masukkan URL terlebih dahulu.");
      return;
    }
    if (!photoForm.caption.trim()) {
      alert("Harap berikan keterangan foto.");
      return;
    }

    const newPhoto: TaskPhoto = {
      id: `dstech_photo_${Date.now()}`,
      url: photoForm.url.trim(),
      caption: photoForm.caption.trim(),
      category: photoForm.category,
      createdAt: new Date().toISOString(),
    };

    const updatedPhotos = [...(selectedTaskForPhotos.photos || []), newPhoto];

    try {
      const res = await fetch("/api/employee/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTaskForPhotos.id, photos: updatedPhotos }),
      });
      const json = await res.json();
      if (json.success) {
        const updatedTask = { ...selectedTaskForPhotos, photos: updatedPhotos };
        setSelectedTaskForPhotos(updatedTask);
        setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
        setPhotoForm({ url: "", caption: "", category: "documentation" });
      } else {
        alert("Gagal menyimpan foto: " + (json.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Delete Photo from Task
  const handleDeletePhoto = async (photoId: string) => {
    if (!selectedTaskForPhotos) return;
    if (!confirm("Hapus foto ini dari laporan?")) return;

    const updatedPhotos = (selectedTaskForPhotos.photos || []).filter((p) => p.id !== photoId);

    try {
      const res = await fetch("/api/employee/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTaskForPhotos.id, photos: updatedPhotos }),
      });
      const json = await res.json();
      if (json.success) {
        const updatedTask = { ...selectedTaskForPhotos, photos: updatedPhotos };
        setSelectedTaskForPhotos(updatedTask);
        setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter((t) => {
    // Filter Entitas
    if (selectedEntityTab === "PT" && (t.entityType || "PT") !== "PT") return false;
    if (selectedEntityTab === "NON_PT" && t.entityType !== "NON_PT") return false;

    const matchSearch =
      searchQuery === "" ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.technician?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = filterStatus === "Semua" || t.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchType = filterType === "Semua" || (t.type || "Preventive Maintenance")?.toLowerCase() === filterType.toLowerCase();
    const matchTech = filterTechnician === "Semua" || t.technician?.toLowerCase() === filterTechnician.toLowerCase();

    return matchSearch && matchStatus && matchType && matchTech;
  });

  // KPI Calculations
  const totalCount = tasks.length;
  const countPT = tasks.filter((t) => (t.entityType || "PT") === "PT").length;
  const countNonPT = tasks.filter((t) => t.entityType === "NON_PT").length;
  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const urgentCount = tasks.filter((t) => t.priority === "Urgent" || t.priority === "High").length;

  return (
    <div className="space-y-7 pb-16 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-indigo-600 transition-colors">
              Admin
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 font-bold">Jadwal & Tiket Maintenance</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Jadwal & Tiket Maintenance
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola jadwal pemeliharaan berkala, panggilan perbaikan CCTV & smart system, dan penugasan teknisi lapangan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Tiket Maintenance</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS (5 CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Tiket */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Tiket</span>
            <ListTodo className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[10px] text-slate-400 block">Semua Pekerjaan</span>
        </div>

        {/* Menunggu Kunjungan */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs hover:shadow-sm transition-all space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Menunggu</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-800">{pendingCount}</p>
          <span className="text-[10px] text-amber-600/80 block">Pending Kunjungan</span>
        </div>

        {/* Sedang Dikerjakan */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 shadow-2xs hover:shadow-sm transition-all space-y-1">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sedang Jalan</span>
            <HardHat className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-800">{inProgressCount}</p>
          <span className="text-[10px] text-blue-600/80 block">Teknisi di Lapangan</span>
        </div>

        {/* Selesai */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-2xs hover:shadow-sm transition-all space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-800">{completedCount}</p>
          <span className="text-[10px] text-emerald-600/80 block">BAST Terverifikasi</span>
        </div>

        {/* Urgent / Prioritas */}
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 shadow-2xs hover:shadow-sm transition-all space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Darurat</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-800">{urgentCount}</p>
          <span className="text-[10px] text-rose-600/80 block">Prioritas Urgent / High</span>
        </div>
      </div>

      {/* ENTITY TAB SWITCHER (PT vs Non-PT) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 w-fit">
        <button
          type="button"
          onClick={() => setSelectedEntityTab("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedEntityTab === "ALL"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Semua Tiket ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setSelectedEntityTab("PT")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedEntityTab === "PT"
              ? "bg-dstech-blue text-white shadow-sm"
              : "text-slate-600 hover:text-dstech-blue"
          }`}
        >
          <span>🏢 PT. DSTech Smart Perkasa</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            selectedEntityTab === "PT" ? "bg-white/20 text-white" : "bg-blue-100 text-dstech-blue"
          }`}>
            {countPT}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedEntityTab("NON_PT")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedEntityTab === "NON_PT"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 hover:text-purple-600"
          }`}
        >
          <span>🏪 Non-PT / DSTech Smart</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            selectedEntityTab === "NON_PT" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"
          }`}>
            {countNonPT}
          </span>
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tiket, klien, lokasi, atau teknisi..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold bg-white text-slate-700"
            >
              <option value="Semua">Semua Status Tiket</option>
              <option value="Pending">Menunggu (Pending)</option>
              <option value="In Progress">Sedang Berjalan (In Progress)</option>
              <option value="Completed">Selesai (Completed)</option>
            </select>
          </div>

          {/* Filter Tipe */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold bg-white text-slate-700"
            >
              <option value="Semua">Semua Tipe Pekerjaan</option>
              <option value="Preventive Maintenance">Preventive Maintenance (Rutin)</option>
              <option value="Corrective Maintenance">Corrective Maintenance (Perbaikan)</option>
              <option value="Inspection">Inspection (Survey & Audit)</option>
              <option value="Installation">Instalasi Baru</option>
            </select>
          </div>

          {/* Filter Teknisi */}
          <div>
            <select
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold bg-white text-slate-700"
            >
              <option value="Semua">Semua Teknisi Lapangan</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(filterStatus !== "Semua" || filterType !== "Semua" || filterTechnician !== "Semua" || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Filter Aktif:</span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] flex items-center gap-1 font-semibold">
                Pencarian: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSearchQuery("")} />
              </span>
            )}
            {filterStatus !== "Semua" && (
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] flex items-center gap-1 font-semibold">
                Status: {filterStatus}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFilterStatus("Semua")} />
              </span>
            )}
            {filterType !== "Semua" && (
              <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] flex items-center gap-1 font-semibold">
                Tipe: {filterType}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFilterType("Semua")} />
              </span>
            )}
            {filterTechnician !== "Semua" && (
              <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-[11px] flex items-center gap-1 font-semibold">
                Teknisi: {filterTechnician}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFilterTechnician("Semua")} />
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("Semua");
                setFilterType("Semua");
                setFilterTechnician("Semua");
              }}
              className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer ml-auto"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* LIST DATA TIKET MAINTENANCE */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <span>Daftar Kunjungan & Tiket Maintenance</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
              {filteredTasks.length} Tiket
            </span>
          </h2>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h4 className="font-black text-slate-700">Tidak Ada Tiket Maintenance Ditemukan</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Belum ada tiket pemeliharaan dengan kriteria filter saat ini. Klik tombol di bawah untuk membuat jadwal maintenance baru.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-2xs"
            >
              + Buat Tiket Maintenance Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => {
              const isUrgent = task.priority === "Urgent" || task.priority === "High";
              const isDone = task.status === "Completed";
              const isInProg = task.status === "In Progress";

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 space-y-3.5 flex flex-col justify-between relative group"
                >
                  {/* Top Bar */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono border border-slate-200">
                          {task.ticketNumber || task.id}
                        </span>
                        {task.entityType === "NON_PT" ? (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            🏪 Non-PT
                          </span>
                        ) : (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-dstech-blue border border-blue-200">
                            🏢 PT
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                            task.type === "Corrective Maintenance"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : task.type === "Preventive Maintenance"
                              ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                              : task.type === "Inspection"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}
                        >
                          {task.type === "Preventive Maintenance"
                            ? "Rutin (Preventive)"
                            : task.type === "Corrective Maintenance"
                            ? "Perbaikan (Corrective)"
                            : task.type || "Maintenance"}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0 uppercase border ${
                          isDone
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : isInProg
                            ? "bg-blue-50 text-blue-700 border-blue-300 animate-pulse"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                      {task.title}
                    </h3>

                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-slate-700 flex items-center gap-1.5 truncate">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{task.client}</span>
                        {task.clientPic && (
                          <span className="text-[10px] font-normal text-slate-400">({task.clientPic})</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-start gap-1.5 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{task.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Mid Scope Snippet */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
                      <span>Checklist Scope ({task.scope?.length || 0} Item):</span>
                      <span
                        className={`font-black ${
                          isUrgent ? "text-rose-600" : "text-slate-600"
                        }`}
                      >
                        Prioritas: {task.priority}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {task.scope?.slice(0, 2).map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-600 text-[11px] line-clamp-1">
                          <CheckSquare className="w-3 h-3 text-cyan-600 shrink-0 mt-0.5" />
                          <span className="truncate">{s}</span>
                        </li>
                      ))}
                      {task.scope && task.scope.length > 2 && (
                        <li className="text-[10px] text-slate-400 font-semibold pl-4">
                          +{task.scope.length - 2} poin pekerjaan lainnya...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Technician & Date info */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">PIC Teknisi:</span>
                      <span className="font-bold text-slate-800 truncate block flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{task.technician}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Jadwal / Batas:</span>
                      <span className="font-semibold text-slate-700 block text-[11px] mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{task.date}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    {/* Quick Status toggle */}
                    <div className="flex items-center gap-1">
                      {task.status !== "Completed" ? (
                        <button
                          onClick={() => handleQuickStatusChange(task, "Completed")}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1"
                          title="Tandai Pekerjaan Selesai"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selesai</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tuntas</span>
                        </span>
                      )}
                    </div>

                    {/* Icon Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setSelectedTaskForPhotos(task)}
                        className="px-2 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-600 hover:text-white text-cyan-800 font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 border border-cyan-200"
                        title="Kelola Foto Dokumentasi & Pergantian Part"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Foto ({task.photos?.length || 0})</span>
                      </button>
                      <button
                        onClick={() => setSelectedTaskForPrint(task)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                        title="Cetak Berita Acara Kunjungan / SPK Maintenance A4"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedTaskForDetail(task)}
                        className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                        title="Lihat Detail & Laporan Lapangan"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-all cursor-pointer"
                        title="Edit Tiket Maintenance"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id, task.ticketNumber)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                        title="Hapus Tiket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Buat Faktur (jika Completed & belum ditagihkan) */}
                  {isDone && (task.invoiceStatus === "Belum Ditagihkan" || !task.invoiceStatus) && (
                    <button
                      onClick={() => handleGenerateInvoice(task)}
                      className="w-full mt-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="Buat Faktur Penagihan Otomatis dari Tiket Ini"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>🧾 Buat Faktur Penagihan</span>
                    </button>
                  )}
                  {isDone && task.invoiceStatus && task.invoiceStatus !== "Belum Ditagihkan" && (
                    <div className="w-full mt-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sudah Ditagihkan {task.invoiceNumber ? `(${task.invoiceNumber})` : ""}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL BUAT / EDIT TIKET MAINTENANCE */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                      {formData.ticketNumber || "TIKET MAINTENANCE BARU"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Surat Tugas Teknisi
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    {isEditMode ? "Edit Tiket Maintenance" : "Buat Tiket & Jadwal Maintenance"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Jadwalkan kunjungan perawatan berkala atau servis panggilan darurat untuk teknisi lapangan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Selector Entitas PT vs Non-PT */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                  Entitas Bisnis / Pelaksana:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, entityType: "PT" })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      (formData.entityType || "PT") === "PT"
                        ? "bg-blue-50 border-dstech-blue text-dstech-blue font-bold shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-xs font-bold">🏢 PT. DSTech Smart Perkasa</p>
                    <p className="text-[10px] opacity-75 mt-0.5">Kontrak Pemeliharaan Korporat & Industri</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, entityType: "NON_PT" })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.entityType === "NON_PT"
                        ? "bg-purple-50 border-purple-600 text-purple-700 font-bold shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-xs font-bold">🏪 Non-PT / DSTech Smart</p>
                    <p className="text-[10px] opacity-75 mt-0.5">Perorangan, Proyek Mandiri & Servis</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Tipe Pekerjaan */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tipe Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Preventive Maintenance">Preventive Maintenance (Perawatan Rutin SLA)</option>
                    <option value="Corrective Maintenance">Corrective Maintenance (Panggilan Servis / Rusak)</option>
                    <option value="Inspection">Inspection (Survey & Audit Teknis)</option>
                    <option value="Installation">Instalasi / Penambahan Titik Baru</option>
                  </select>
                </div>

                {/* Prioritas */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tingkat Urgensi / Prioritas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Normal">Normal (Sesuai Jadwal Rutin)</option>
                    <option value="Medium">Medium (Pengecekan Standar)</option>
                    <option value="High">Tinggi (High Priority - Kendala Operasional)</option>
                    <option value="Urgent">Darurat (Urgent - CCTV / Gate Mati Total)</option>
                  </select>
                </div>

                {/* Judul Tiket */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Judul Penugasan / Kendala <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Perawatan Rutin CCTV Bulanan & Pengecekan Drop Lock Pintu Akses"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Pilih Klien dari Master */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Pilih Klien / Instansi <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-indigo-600 font-medium">Dari Master Klien</span>
                  </div>
                  <select
                    value={formData.clientId}
                    onChange={(e) => handleClientSelect(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih dari Master Klien --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.picName ? `(${c.picName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nama Klien Manual / Edit */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama Klien / Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="Contoh: PT. Krakatau Posco Energy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* PIC Klien & No Telepon */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama PIC Klien di Lokasi
                  </label>
                  <input
                    type="text"
                    value={formData.clientPic}
                    onChange={(e) => setFormData({ ...formData, clientPic: e.target.value })}
                    placeholder="Contoh: Bpk. Rahmat Hidayat (Security Spv)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    No. WhatsApp / Telepon Klien
                  </label>
                  <input
                    type="text"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="Contoh: 0812-9988-7766"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Lokasi Alamat */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Lokasi / Alamat Lengkap Kunjungan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Kawasan Industri Krakatau Steel, Gedung Utama Lt. 2, Cilegon"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* PIC Teknisi DSTech */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Teknisi yang Ditugaskan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.technician}
                    onChange={(e) => handleTechnicianSelect(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.phone || "No HP"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* No HP Teknisi */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    No. Telepon / WA Teknisi
                  </label>
                  <input
                    type="text"
                    value={formData.technicianPhone}
                    onChange={(e) => setFormData({ ...formData, technicianPhone: e.target.value })}
                    placeholder="+628..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tanggal Kunjungan & Deadline */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tanggal Jadwal Kunjungan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Target Selesai / Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Status Tiket Saat Ini
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Menunggu Kunjungan (Pending)</option>
                    <option value="In Progress">Sedang Dikerjakan (In Progress)</option>
                    <option value="Completed">Selesai & BAST Terbit (Completed)</option>
                  </select>
                </div>

                {/* Nomor Tiket */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor Tiket Maintenance
                  </label>
                  <input
                    type="text"
                    value={formData.ticketNumber}
                    onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-700 bg-slate-50"
                  />
                </div>
              </div>

              {/* CHECKLIST SCOPE PEKERJAAN */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-cyan-600" />
                    <span>Checklist Scope / Rincian Pekerjaan Pemeliharaan</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Teknisi wajib memeriksa poin ini</span>
                </div>

                {/* Current Scope List */}
                <div className="space-y-1.5">
                  {formData.scope.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveScopeItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Scope */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newScopeInput}
                    onChange={(e) => setNewScopeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddScopeItem(newScopeInput);
                      }
                    }}
                    placeholder="Tambah poin pekerjaan kustom lalu klik Enter..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddScopeItem(newScopeInput)}
                    className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
                  >
                    + Tambah
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                    Pilihan Cepat Standar DSTech:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SCOPE_ITEMS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddScopeItem(preset)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-slate-600 hover:text-cyan-800 text-[10px] font-semibold transition-all cursor-pointer text-left"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PERALATAN & SPAREPART YANG DIBAWA */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    <span>Peralatan Kerja & Sparepart Bawaan Teknisi</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Peralatan untuk dibawa ke lokasi</span>
                </div>

                <div className="space-y-1.5">
                  {formData.equipment.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newEquipInput}
                    onChange={(e) => setNewEquipInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEquipItem(newEquipInput);
                      }
                    }}
                    placeholder="Tambah alat / sparepart lalu tekan Enter..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddEquipItem(newEquipInput)}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
                  >
                    + Tambah
                  </button>
                </div>

                {/* Preset Equipment */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                    Peralatan Rekomendasi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_EQUIPMENT_ITEMS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddEquipItem(preset)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-800 text-[10px] font-semibold transition-all cursor-pointer text-left"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Catatan Khusus & K3 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Catatan Khusus Kunjungan & Standar K3
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Misal: Wajib melapor ke pos security sebelum masuk, mengenakan sepatu safety & helm, dll."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black cursor-pointer shadow-md transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEditMode ? "Simpan Perubahan Tiket" : "Terbitkan Tiket & Kirim ke Teknisi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL TIKET & LAPORAN LAPANGAN TEKNISI */}
      {selectedTaskForDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedTaskForDetail(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  {selectedTaskForDetail.ticketNumber || selectedTaskForDetail.id}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {selectedTaskForDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status & Priority Badge */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status Pekerjaan:</span>
                <span
                  className={`inline-block mt-0.5 text-xs font-black px-2.5 py-0.5 rounded-full ${
                    selectedTaskForDetail.status === "Completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedTaskForDetail.status === "In Progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedTaskForDetail.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Urgensi:</span>
                <span className="text-xs font-bold text-rose-700 block mt-0.5">
                  {selectedTaskForDetail.priority}
                </span>
              </div>
            </div>

            {/* Client & Tech Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Klien / Lokasi:</span>
                <p className="font-bold text-slate-800">{selectedTaskForDetail.client}</p>
                <p className="text-slate-500 text-[11px]">{selectedTaskForDetail.location}</p>
                {selectedTaskForDetail.clientPic && (
                  <p className="text-indigo-600 font-semibold text-[11px]">PIC: {selectedTaskForDetail.clientPic}</p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Teknisi Bertugas:</span>
                <p className="font-bold text-slate-800">{selectedTaskForDetail.technician}</p>
                <p className="text-slate-500 text-[11px]">WA: {selectedTaskForDetail.technicianPhone}</p>
                <p className="text-slate-500 text-[11px]">Jadwal: {selectedTaskForDetail.date}</p>
              </div>
            </div>

            {/* Scope Checklist */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-700 block">Checklist Pekerjaan Lapangan:</span>
              <ul className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedTaskForDetail.scope?.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 text-[11px]">
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Laporan dari Teknisi */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-700 block flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Laporan Hasil Kunjungan dari Teknisi:</span>
              </span>
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/70 text-slate-800 text-[11px] leading-relaxed">
                {selectedTaskForDetail.report ? (
                  <p>{selectedTaskForDetail.report}</p>
                ) : (
                  <p className="text-slate-400 italic">
                    Belum ada laporan dari teknisi. Laporan akan otomatis terisi saat teknisi mengirim hasil pekerjaan dari Portal Teknisi (/employee).
                  </p>
                )}
              </div>
            </div>

            {/* Rekomendasi Teknis */}
            {selectedTaskForDetail.recommendation && (
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs text-amber-900 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-700 block">
                  Rekomendasi Teknisi Lanjutan:
                </span>
                <p className="text-[11px]">{selectedTaskForDetail.recommendation}</p>
              </div>
            )}

            {/* GPS Tracking Lokasi Teknisi */}
            {(selectedTaskForDetail.latitude || selectedTaskForDetail.googleMapsUrl) && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" /> GPS Lokasi Kunjungan Teknisi:
                  </span>
                  {selectedTaskForDetail.latitude && selectedTaskForDetail.longitude && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                      {selectedTaskForDetail.latitude}, {selectedTaskForDetail.longitude}
                    </span>
                  )}
                </div>
                <a
                  href={
                    selectedTaskForDetail.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedTaskForDetail.location)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                >
                  <Navigation className="w-3 h-3" /> Buka Navigasi Google Maps
                </a>
              </div>
            )}

            {/* Barang Rusak yang Ditarik / Diganti */}
            {selectedTaskForDetail.damagedItems && selectedTaskForDetail.damagedItems.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-600" />
                  Barang Rusak yang Ditarik / Diganti dari Lokasi Klien:
                </span>
                <div className="space-y-1.5">
                  {selectedTaskForDetail.damagedItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-xs space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-rose-900">
                        <span>{item.name}</span>
                        <span className="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                          {item.qty || (item as any).quantity || 1} {item.unit}
                        </span>
                      </div>
                      <p className="text-rose-700 text-[11px]">Kondisi: {item.condition}</p>
                      <p className="text-rose-600 text-[10px]">Tindakan: {item.action || (item as any).actionTaken}</p>
                      {(item.note || (item as any).notes) && (
                        <p className="text-slate-500 text-[10px] italic">Catatan: {item.note || (item as any).notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Material yang Diajukan dari Gudang */}
            {selectedTaskForDetail.linkedMaterialRequests && selectedTaskForDetail.linkedMaterialRequests.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-800 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-indigo-600" />
                  Material Gudang yang Digunakan untuk Tugas Ini:
                </span>
                <div className="space-y-1">
                  {selectedTaskForDetail.linkedMaterialRequests.map((req: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-xl bg-indigo-50/80 border border-indigo-200 text-[11px] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-indigo-900">{req.materialName || "Material"} — {req.qty} {req.unit}</p>
                        {req.date && <p className="text-indigo-500 text-[10px]">Tanggal Pengajuan: {req.date}</p>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === "Approved" || req.status === "Disetujui"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "Rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Penagihan Faktur */}
            {selectedTaskForDetail.invoiceStatus === "Sudah Ditagihkan" && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs flex items-center justify-between">
                <span className="text-blue-800 font-bold flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-blue-600" /> Sudah Ditagihkan ke Faktur Keuangan
                </span>
                {selectedTaskForDetail.invoiceNumber && (
                  <span className="font-mono text-blue-900 font-black bg-blue-100 px-2 py-0.5 rounded-md text-[11px]">
                    {selectedTaskForDetail.invoiceNumber}
                  </span>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTaskForPrint(selectedTaskForDetail);
                    setSelectedTaskForDetail(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak BAST A4</span>
                </button>

                {/* Tombol Buat Faktur Penagihan jika tiket Completed & Belum Ditagihkan */}
                {selectedTaskForDetail.status === "Completed" && (selectedTaskForDetail.invoiceStatus === "Belum Ditagihkan" || !selectedTaskForDetail.invoiceStatus) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleGenerateInvoice(selectedTaskForDetail);
                      setSelectedTaskForDetail(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>🧾 Buat Faktur Penagihan</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedTaskForDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU & CETAK BERITA ACARA KUNJUNGAN (BAST MAINTENANCE A4) */}
      {selectedTaskForPrint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedTaskForPrint(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Kontrol Cetak */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Pratinjau Berita Acara Kunjungan Maintenance (BAST A4)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Format cetak resmi PT DSTech Smart Perkasa ber-Kop Surat dan dual legalitas tanda tangan.
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={letterheadEnabled}
                    onChange={(e) => setLetterheadEnabled(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Kop Surat</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-white font-bold bg-slate-800 hover:bg-slate-900 px-3 py-1.5 rounded-xl cursor-pointer shadow-xs transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Kop {selectedTaskForPrint.entityType === "NON_PT" ? "DSTech Smart" : "PT"}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleLetterheadUpload}
                    className="hidden"
                  />
                </label>
                {customLetterheadUrl && (
                  <button
                    type="button"
                    onClick={() => setCustomLetterheadUrl("")}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
                  >
                    Reset Kop
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTaskForPrint(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* LEMBAR DOKUMEN RESMI A4 */}
            <div
              id="printable-bast-maintenance"
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-slate-800 space-y-6 relative shadow-md font-sans"
              style={{
                backgroundImage: letterheadEnabled
                  ? `url('${
                      customLetterheadUrl ||
                      (selectedTaskForPrint.entityType === "NON_PT"
                        ? "/kop_surat_toko.jpg"
                        : "/kop_surat_dstech.jpg")
                    }')`
                  : "none",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top center",
                paddingTop: letterheadEnabled ? "135px" : "32px",
                paddingBottom: letterheadEnabled ? "110px" : "32px",
              }}
            >
              {/* Fallback header if letterhead disabled */}
              {!letterheadEnabled && (
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {selectedTaskForPrint.entityType === "NON_PT"
                        ? "DSTECH SMART"
                        : "PT. DSTECH SMART PERKASA"}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {selectedTaskForPrint.entityType === "NON_PT"
                        ? "Pusat Solusi Security System, CCTV, Access Door, & IT Infrastructure"
                        : "Security System • CCTV • Access Control • Barrier Gate • IT Infrastructure"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Jl. Raya Cilegon No. 88, Cilegon, Banten • Telp/WA: 0822-5949-4242 • www.dstechsmart.com
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedTaskForPrint.entityType === "NON_PT" ? "UNIT USAHA RESMI" : "LEGALITAS RESMI"}
                    </span>
                    <p className="text-xs font-bold text-slate-700">
                      {selectedTaskForPrint.entityType === "NON_PT" ? "DSTECH-SMART-ID" : "NIB: 2026-DSTECH-ID"}
                    </p>
                  </div>
                </div>
              )}

              {/* Title Dokumen */}
              <div className="text-center space-y-1">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase underline decoration-2 underline-offset-4">
                  BERITA ACARA KUNJUNGAN PEMELIHARAAN SISTEM
                </h2>
                <p className="text-xs font-mono font-bold text-slate-600">
                  Nomor: BAST-MTC-{selectedTaskForPrint.ticketNumber?.replace("MTC-", "") || selectedTaskForPrint.id}
                </p>
              </div>

              {/* Paragraf Pengantar */}
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                Pada hari ini, tanggal <strong>{selectedTaskForPrint.date}</strong>, telah dilaksanakan kunjungan teknis pekerjaan pemeliharaan dan pemeriksaan sistem oleh tim teknisi <strong>{selectedTaskForPrint.entityType === "NON_PT" ? "DSTech Smart" : "PT. DSTech Smart Perkasa"}</strong> dengan rincian data sebagai berikut:
              </p>

              {/* Data Klien & Pelaksana */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Pihak Penerima (Klien):</span>
                  <p className="font-black text-slate-900">{selectedTaskForPrint.client}</p>
                  <p className="text-slate-600 text-[11px]">{selectedTaskForPrint.location}</p>
                  <p className="text-slate-600 text-[11px]">
                    PIC Lapangan: <strong>{selectedTaskForPrint.clientPic || "-"}</strong> ({selectedTaskForPrint.clientPhone || "-"})
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Pihak Pelaksana (DSTech):</span>
                  <p className="font-black text-slate-900">
                    {selectedTaskForPrint.entityType === "NON_PT" ? "DSTech Smart" : "PT. DSTech Smart Perkasa"}
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    Teknisi Lapangan: <strong>{selectedTaskForPrint.technician}</strong>
                  </p>
                  <p className="text-slate-600 text-[11px]">Kontak: {selectedTaskForPrint.technicianPhone}</p>
                  <p className="text-slate-600 text-[11px]">
                    Kategori: <strong>{selectedTaskForPrint.type || "Preventive Maintenance"}</strong>
                  </p>
                </div>
              </div>

              {/* Tabel Checklist Scope Pemeriksaan */}
              <div className="space-y-2 text-xs">
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                  I. Rincian Checklist Pemeriksaan Teknis & Scope Pekerjaan:
                </h4>
                <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-left">
                      <th className="p-2 w-10 text-center">No</th>
                      <th className="p-2">Item Pekerjaan / Uji Fungsi Komponen</th>
                      <th className="p-2 w-32 text-center">Hasil Uji</th>
                      <th className="p-2 w-32 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTaskForPrint.scope?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-2 font-medium text-slate-800">{item}</td>
                        <td className="p-2 text-center text-emerald-700 font-bold">Normal / Sesuai</td>
                        <td className="p-2 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-black text-[10px] border border-emerald-200">
                            TERVERIFIKASI
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tabel Material & Sparepart */}
              {((selectedTaskForPrint.equipment && selectedTaskForPrint.equipment.length > 0) ||
                (selectedTaskForPrint.linkedMaterialRequests && selectedTaskForPrint.linkedMaterialRequests.length > 0)) && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                    II. Material & Peralatan Pendukung yang Digunakan:
                  </h4>
                  {selectedTaskForPrint.linkedMaterialRequests && selectedTaskForPrint.linkedMaterialRequests.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Material Diajukan dari Gudang:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedTaskForPrint.linkedMaterialRequests.map((req: any, idx: number) => (
                          <div key={idx} className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-200 text-[11px] flex justify-between">
                            <span className="font-bold text-indigo-900">• {req.materialName || "Material"}</span>
                            <span className="font-mono text-indigo-700 font-bold">{req.qty} {req.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedTaskForPrint.equipment && selectedTaskForPrint.equipment.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedTaskForPrint.equipment.map((eq, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          • {eq}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tabel Barang Rusak yang Ditarik / Diganti */}
              {selectedTaskForPrint.damagedItems && selectedTaskForPrint.damagedItems.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider text-rose-800">
                    III. Berita Acara Tarikan Barang Rusak / Part Diganti:
                  </h4>
                  <table className="w-full text-xs border border-rose-200 rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-rose-50 text-rose-900 font-bold border-b border-rose-200 text-left">
                        <th className="p-2 w-10 text-center">No</th>
                        <th className="p-2">Nama Barang / Part</th>
                        <th className="p-2 w-20 text-center">Jumlah</th>
                        <th className="p-2">Kondisi Kerusakan</th>
                        <th className="p-2">Tindakan / Disposisi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100 bg-white">
                      {selectedTaskForPrint.damagedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-rose-50/30">
                          <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2 font-bold text-slate-800">{item.name}</td>
                          <td className="p-2 text-center font-mono font-bold text-rose-800">
                            {item.qty || (item as any).quantity || 1} {item.unit}
                          </td>
                          <td className="p-2 text-rose-700">{item.condition}</td>
                          <td className="p-2 text-slate-600">{item.action || (item as any).actionTaken}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Hasil Kunjungan & Rekomendasi */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-black text-slate-900 block text-[11px] uppercase">
                      Hasil Temuan Kunjungan & Tindakan Teknisi:
                    </span>
                    <p className="text-slate-700 text-[11px] mt-0.5 leading-relaxed">
                      {selectedTaskForPrint.report || "Seluruh perangkat telah diperiksa dan berfungsi secara optimal sesuai standar operasional."}
                    </p>
                  </div>
                  {(selectedTaskForPrint.latitude && selectedTaskForPrint.longitude) && (
                    <div className="shrink-0 text-right bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-emerald-700 block">Koordinat GPS Valid:</span>
                      <span className="text-[10px] font-mono font-bold text-slate-700 block">
                        {selectedTaskForPrint.latitude}, {selectedTaskForPrint.longitude}
                      </span>
                    </div>
                  )}
                </div>
                {selectedTaskForPrint.recommendation && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-black text-slate-900 block text-[11px] uppercase text-indigo-700">
                      Rekomendasi Teknisi untuk Periode Berikutnya:
                    </span>
                    <p className="text-slate-700 text-[11px] mt-0.5 leading-relaxed">
                      {selectedTaskForPrint.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Kolom Tanda Tangan Resmi */}
              <div className="grid grid-cols-2 gap-8 pt-4 text-xs">
                {/* Kiri: Penerima Klien */}
                <div className="text-center space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">Pihak Penerima / Klien:</span>
                  <span className="font-black text-slate-900 block text-xs">{selectedTaskForPrint.client}</span>
                  <div className="h-24 flex items-center justify-center border-b border-dashed border-slate-300">
                    <span className="text-[10px] text-slate-300 italic">( Tanda Tangan & Cap Stempel )</span>
                  </div>
                  <div className="pt-1">
                    <p className="font-black text-slate-900 underline text-xs">
                      ( {selectedTaskForPrint.clientPic || "PIC / Penanggung Jawab Lapangan"} )
                    </p>
                    <p className="text-[10px] text-slate-500">Jabatan: Pengawas Lapangan</p>
                  </div>
                </div>

                {/* Kanan: Pelaksana DSTech */}
                <div className="text-center space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">Pihak Pelaksana:</span>
                  <span className="font-black text-slate-900 block text-xs">
                    {selectedTaskForPrint.entityType === "NON_PT" ? "DSTech Smart" : "PT. DSTech Smart Perkasa"}
                  </span>
                  <div className="h-24 flex flex-col items-center justify-center relative border-b border-dashed border-slate-300">
                    {/* Stempel bulat digital */}
                    {selectedTaskForPrint.entityType !== "NON_PT" ? (
                      <div className="w-16 h-16 rounded-full border-2 border-indigo-600/60 text-indigo-700/80 text-[7px] font-black uppercase flex flex-col items-center justify-center rotate-[-12deg] pointer-events-none">
                        <span>PT. DSTECH</span>
                        <span className="text-[6px]">SMART PERKASA</span>
                        <span className="text-[5px]">CILEGON</span>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full border-2 border-purple-600/60 text-purple-700/80 text-[7px] font-black uppercase flex flex-col items-center justify-center rotate-[-12deg] pointer-events-none">
                        <span>DSTECH</span>
                        <span className="text-[6px]">SMART</span>
                        <span className="text-[5px]">CILEGON</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="font-black text-slate-900 underline text-xs">
                      ( {selectedTaskForPrint.technician} )
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {selectedTaskForPrint.entityType === "NON_PT" ? "Teknisi DSTech Smart" : "Teknisi Lapangan DSTech"}
                    </p>
                    <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                      [VERIFIKASI SISTEM: DST-APP-MTC-{selectedTaskForPrint.id.slice(-6)}]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL KELOLA FOTO DOKUMENTASI & PERGANTIAN PART */}
      {selectedTaskForPhotos && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedTaskForPhotos(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                      {selectedTaskForPhotos.ticketNumber || selectedTaskForPhotos.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {selectedTaskForPhotos.photos?.length || 0} Foto Terlampir
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Laporan Foto Dokumentasi & Pergantian Part
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klien: <strong>{selectedTaskForPhotos.client}</strong> • {selectedTaskForPhotos.location}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForPhotos(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* FORM UPLOAD FOTO BARU */}
            <form onSubmit={handleAddPhotoSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <span className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-cyan-600" />
                <span>Unggah Foto Dokumentasi Lapangan / Part Baru</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Kategori Foto */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Kategori Foto:
                  </label>
                  <select
                    value={photoForm.category}
                    onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="documentation">📸 Foto Dokumentasi Pekerjaan</option>
                    <option value="part_replacement">⚙️ Foto Pergantian Part / Sparepart</option>
                  </select>
                </div>

                {/* Upload File Input */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Pilih File Foto (Kamera / Galeri):
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-cyan-700 font-bold flex items-center gap-1.5 cursor-pointer text-xs shadow-2xs">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isUploadingPhoto ? "Mengunggah..." : "Pilih / Jepret Foto"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingPhoto}
                        onChange={handleUploadPhotoFile}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={photoForm.url}
                      onChange={(e) => setPhotoForm({ ...photoForm, url: e.target.value })}
                      placeholder="/uploads/dstech_... atau URL gambar"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-[11px] text-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Caption / Keterangan Foto */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Keterangan Singkat Foto (Hasil Pekerjaan / Part yang Diganti):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={photoForm.caption}
                      onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                      placeholder="Contoh: Pemasangan kamera CCTV 02 arah loading dock / Penggantian adaptor 12V 2A yang rusak"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isUploadingPhoto || !photoForm.url.trim()}
                      className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Simpan Foto</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Thumbnail Preview */}
              {photoForm.url && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80">
                  <div className="w-16 h-12 rounded-lg border border-slate-300 overflow-hidden relative shrink-0 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoForm.url} alt="Pratinjau" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] text-slate-600 truncate font-mono">{photoForm.url}</span>
                </div>
              )}
            </form>

            {/* DAFTAR FOTO TERLAMPIR */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Foto Terlampir ({selectedTaskForPhotos.photos?.length || 0})
                </span>

                {/* Filter Category */}
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPhotoCategoryFilter("all")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      photoCategoryFilter === "all"
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Semua ({selectedTaskForPhotos.photos?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoCategoryFilter("documentation")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      photoCategoryFilter === "documentation"
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Dokumentasi ({selectedTaskForPhotos.photos?.filter((p) => p.category === "documentation").length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoCategoryFilter("part_replacement")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      photoCategoryFilter === "part_replacement"
                        ? "bg-amber-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Pergantian Part ({selectedTaskForPhotos.photos?.filter((p) => p.category === "part_replacement").length || 0})
                  </button>
                </div>
              </div>

              {(!selectedTaskForPhotos.photos || selectedTaskForPhotos.photos.length === 0) ? (
                <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs">
                  <Camera className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p>Belum ada foto yang diunggah untuk tiket ini.</p>
                  <p className="text-[10px] mt-0.5">Unggah foto dokumentasi atau penggantian sparepart menggunakan formulir di atas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedTaskForPhotos.photos
                    .filter((p) => photoCategoryFilter === "all" || p.category === photoCategoryFilter)
                    .map((photo, idx) => (
                      <div
                        key={photo.id || idx}
                        className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                      >
                        <div className="relative aspect-video bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/service-cctv.png";
                            }}
                          />
                          <span
                            className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs ${
                              photo.category === "part_replacement"
                                ? "bg-amber-500 text-white"
                                : "bg-cyan-600 text-white"
                            }`}
                          >
                            {photo.category === "part_replacement" ? "⚙️ Pergantian Part" : "📸 Dokumentasi"}
                          </span>
                        </div>

                        <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                          <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
                            {photo.caption}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                            <span>
                              {photo.createdAt ? new Date(photo.createdAt).toLocaleDateString("id-ID") : "-"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Footer Modal Action */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTaskForPhotos(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Tutup
              </button>

              <button
                type="button"
                disabled={!selectedTaskForPhotos.photos || selectedTaskForPhotos.photos.length === 0}
                onClick={() => {
                  setSelectedTaskForPhotoPrint(selectedTaskForPhotos);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs cursor-pointer shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ Cetak Lembar Lampiran Foto A4 (Siap Invoice)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU & CETAK RESMI LAMPIRAN LAPORAN FOTO A4 */}
      {selectedTaskForPhotoPrint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedTaskForPhotoPrint(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Kontrol Cetak */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Pratinjau Lampiran Laporan Foto Dokumentasi & Part (A4 Resmi)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Format cetak resmi ber-Kop Surat DSTech, siap langsung dilampirkan bersama Faktur Tagihan / Invoice.
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={letterheadEnabled}
                    onChange={(e) => setLetterheadEnabled(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Kop Surat</span>
                </label>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTaskForPhotoPrint(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* LEMBAR DOKUMEN RESMI A4: LAMPIRAN FOTO DOKUMENTASI */}
            <div
              id="printable-photo-attachment"
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-slate-800 space-y-6 relative shadow-md font-sans"
              style={{
                backgroundImage: letterheadEnabled ? "url('/kop_surat_dstech.jpg')" : "none",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top center",
                paddingTop: letterheadEnabled ? "135px" : "32px",
                paddingBottom: letterheadEnabled ? "110px" : "32px",
              }}
            >
              {/* Fallback header if letterhead disabled */}
              {!letterheadEnabled && (
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">PT. DSTECH SMART PERKASA</h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Security System • CCTV • Access Control • Barrier Gate • IT Infrastructure
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Jl. Raya Cilegon No. 88, Cilegon, Banten • Telp/WA: 0822-5949-4242 • www.dstechsmart.com
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400">LEGALITAS RESMI</span>
                    <p className="text-xs font-bold text-slate-700">NIB: 2026-DSTECH-ID</p>
                  </div>
                </div>
              )}

              {/* Title Dokumen */}
              <div className="text-center space-y-1">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase underline decoration-2 underline-offset-4">
                  LAMPIRAN LAPORAN FOTO DOKUMENTASI & PERGANTIAN PART
                </h2>
                <p className="text-xs font-mono font-bold text-slate-600">
                  Nomor Dokumen: LAMP-MTC-{selectedTaskForPhotoPrint.ticketNumber?.replace("MTC-", "") || selectedTaskForPhotoPrint.id}
                </p>
                <p className="text-[10px] text-slate-400 italic">
                  (Dokumen Lampiran Bukti Fisik Lapangan Pendukung Faktur Tagihan / BAST Pekerjaan)
                </p>
              </div>

              {/* Data Klien & Informasi Tiket */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Pihak Penerima (Klien):</span>
                  <p className="font-black text-slate-900">{selectedTaskForPhotoPrint.client}</p>
                  <p className="text-slate-600 text-[11px]">{selectedTaskForPhotoPrint.location}</p>
                  <p className="text-slate-600 text-[11px]">
                    PIC Lapangan: <strong>{selectedTaskForPhotoPrint.clientPic || "-"}</strong> ({selectedTaskForPhotoPrint.clientPhone || "-"})
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Data Pekerjaan:</span>
                  <p className="font-black text-slate-900">{selectedTaskForPhotoPrint.title}</p>
                  <p className="text-slate-600 text-[11px]">
                    Kategori: <strong>{selectedTaskForPhotoPrint.type || "Maintenance"}</strong>
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    Tanggal Pelaksanaan: <strong>{selectedTaskForPhotoPrint.date}</strong> • PIC: {selectedTaskForPhotoPrint.technician}
                  </p>
                </div>
              </div>

              {/* I. FOTO DOKUMENTASI PEKERJAAN LAPANGAN */}
              <div className="space-y-3">
                <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-700" />
                    <span>I. FOTO DOKUMENTASI PEKERJAAN LAPANGAN (INSTALASI & PEMELIHARAAN)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {selectedTaskForPhotoPrint.photos?.filter((p) => p.category === "documentation").length || 0} Dokumentasi
                  </span>
                </div>

                {(!selectedTaskForPhotoPrint.photos || selectedTaskForPhotoPrint.photos.filter((p) => p.category === "documentation").length === 0) ? (
                  <p className="text-xs text-slate-400 italic py-2">Tidak ada foto dokumentasi pekerjaan.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTaskForPhotoPrint.photos
                      .filter((p) => p.category === "documentation")
                      .map((photo, idx) => (
                        <div
                          key={photo.id || idx}
                          className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50 space-y-2 p-2.5 shadow-2xs"
                        >
                          <div className="aspect-[16/10] bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/service-cctv.png";
                              }}
                            />
                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] font-mono px-1.5 py-0.5 rounded">
                              Foto #{idx + 1}
                            </span>
                          </div>
                          <div className="text-[11px] space-y-0.5">
                            <span className="text-[9px] font-bold text-cyan-700 uppercase block">Keterangan:</span>
                            <p className="font-medium text-slate-800 leading-snug">{photo.caption}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* II. FOTO PERGANTIAN PART / SPAREPART */}
              <div className="space-y-3 pt-2">
                <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-700" />
                    <span>II. FOTO BUKTI PERGANTIAN PART / SPAREPART (UNIT RUSAK VS UNIT BARU)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {selectedTaskForPhotoPrint.photos?.filter((p) => p.category === "part_replacement").length || 0} Penggantian
                  </span>
                </div>

                {(!selectedTaskForPhotoPrint.photos || selectedTaskForPhotoPrint.photos.filter((p) => p.category === "part_replacement").length === 0) ? (
                  <p className="text-xs text-slate-400 italic py-2">Tidak ada pergantian sparepart pada kunjungan ini.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTaskForPhotoPrint.photos
                      .filter((p) => p.category === "part_replacement")
                      .map((photo, idx) => (
                        <div
                          key={photo.id || idx}
                          className="rounded-xl border border-amber-200 overflow-hidden bg-amber-50/30 space-y-2 p-2.5 shadow-2xs"
                        >
                          <div className="aspect-[16/10] bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/service-it.png";
                              }}
                            />
                            <span className="absolute bottom-1 right-1 bg-amber-700 text-white text-[8px] font-mono px-1.5 py-0.5 rounded">
                              Part #{idx + 1}
                            </span>
                          </div>
                          <div className="text-[11px] space-y-0.5">
                            <span className="text-[9px] font-bold text-amber-800 uppercase block">Rincian Komponen / Tindakan:</span>
                            <p className="font-medium text-slate-800 leading-snug">{photo.caption}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* III. PERNYATAAN FISIK & KOLOM TANDA TANGAN LEGALITAS */}
              <div className="space-y-4 pt-4 border-t border-slate-200 text-xs">
                <p className="text-[11px] text-slate-600 leading-relaxed text-justify">
                  Demikian lampiran dokumentasi foto ini dibuat secara sebenar-benarnya sebagai bukti fisik pelaksanaan pekerjaan di lapangan guna memenuhi kelengkapan administrasi penagihan dan Berita Acara Serah Terima (BAST).
                </p>

                <div className="grid grid-cols-2 gap-8 pt-2">
                  {/* Kiri: Penerima Klien */}
                  <div className="text-center space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold block">Pihak Penerima / Klien:</span>
                    <span className="font-black text-slate-900 block text-xs">{selectedTaskForPhotoPrint.client}</span>
                    <div className="h-20 flex items-center justify-center border-b border-dashed border-slate-300">
                      <span className="text-[10px] text-slate-300 italic">( Tanda Tangan & Cap Stempel Klien )</span>
                    </div>
                    <div className="pt-1">
                      <p className="font-black text-slate-900 underline text-xs">
                        ( {selectedTaskForPhotoPrint.clientPic || "PIC / Penanggung Jawab Lapangan"} )
                      </p>
                      <p className="text-[10px] text-slate-500">Jabatan: Pengawas Lapangan</p>
                    </div>
                  </div>

                  {/* Kanan: Pelaksana DSTech */}
                  <div className="text-center space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold block">Pihak Pelaksana:</span>
                    <span className="font-black text-slate-900 block text-xs">PT. DSTech Smart Perkasa</span>
                    <div className="h-20 flex flex-col items-center justify-center relative border-b border-dashed border-slate-300">
                      {/* Stempel bulat digital */}
                      <div className="w-16 h-16 rounded-full border-2 border-indigo-600/60 text-indigo-700/80 text-[7px] font-black uppercase flex flex-col items-center justify-center rotate-[-12deg] pointer-events-none">
                        <span>PT. DSTECH</span>
                        <span className="text-[6px]">SMART PERKASA</span>
                        <span className="text-[5px]">CILEGON</span>
                      </div>
                    </div>
                    <div className="pt-1">
                      <p className="font-black text-slate-900 underline text-xs">
                        ( {selectedTaskForPhotoPrint.technician} )
                      </p>
                      <p className="text-[10px] text-slate-500">Teknisi Lapangan DSTech</p>
                      <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                        [VERIFIKASI SISTEM: DST-APP-MTC-PHOTO-{selectedTaskForPhotoPrint.id.slice(-6)}]
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
