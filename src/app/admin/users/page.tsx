"use client";

import React, { useState, useEffect } from "react";
import {
  UserCog,
  Users,
  ShieldCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  ShieldAlert,
  Filter,
  UserCheck,
  Briefcase,
  Layers,
  Lock,
  Key,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  Building,
  Navigation,
  MapPin,
  Printer,
  Send,
  Sliders,
  Check,
} from "lucide-react";
import {
  UserPermissions,
  DSTECH_SYSTEM_MENUS,
  ACTION_LABELS,
  PERMISSION_PRESETS,
  PermissionAction,
  getDefaultPermissionsByRole,
  createFullPermissions,
  createEmptyPermissions,
  summarizePermissions,
} from "@/utils/dstech_permissions";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "EMPLOYEE" | "AFFILIATE" | "CLIENT";
  phone: string;
  password?: string;
  status: "ACTIVE" | "INACTIVE";
  expiresAt?: string | null;
  attendanceLocationLock?: "ANY" | "OFFICE";
  officeRadius?: number;
  contractId?: string;
  position?: string;
  permissions?: UserPermissions | null;
  createdAt: string;
  updatedAt: string;
}

const ROLE_CONFIG: Record<
  string,
  { label: string; badge: string; desc: string }
> = {
  SUPERADMIN: {
    label: "Super Admin",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    desc: "Akses penuh sistem & basis data",
  },
  ADMIN: {
    label: "Administrator",
    badge: "bg-blue-100 text-dstech-blue border-blue-200",
    desc: "Pengelolaan produk, partner & pesanan",
  },
  EMPLOYEE: {
    label: "Teknisi / Staf",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    desc: "Instalasi lapangan & maintenance CCTV",
  },
  AFFILIATE: {
    label: "Mitra Afiliasi",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    desc: "Agen referral & komisi penjualan",
  },
  CLIENT: {
    label: "Klien Korporat",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    desc: "Pelanggan & PIC instansi pengadaan",
  },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Toast notification
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "success", message: "" });
    }, 3500);
  };

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Permissions Modal States
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [permissionUser, setPermissionUser] = useState<UserItem | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<UserPermissions>({});
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");
  const [permissionSearch, setPermissionSearch] = useState<string>("");

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<UserItem["role"]>("EMPLOYEE");
  const [formStatus, setFormStatus] = useState<UserItem["status"]>("ACTIVE");
  const [formPassword, setFormPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formNewPassword, setFormNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formLocationLock, setFormLocationLock] = useState<"ANY" | "OFFICE">("ANY");
  const [formOfficeRadius, setFormOfficeRadius] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper remaining days
  const getRemainingDays = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const target = new Date(dateStr).getTime();
      const now = new Date().getTime();
      return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  // Helper preset expiry
  const setExpiryPreset = (months: number | null) => {
    if (months === null) {
      setFormExpiresAt("");
      return;
    }
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setFormExpiresAt(d.toISOString().split("T")[0]);
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat pengguna:", err);
      showToast("error", "Gagal memuat data pengguna dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Open Edit Modal
  const openEditModal = (u: UserItem) => {
    setSelectedUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPhone(u.phone);
    setFormRole(u.role);
    setFormStatus(u.status);
    setFormExpiresAt(u.expiresAt ? u.expiresAt.split("T")[0] : "");
    setFormLocationLock(u.attendanceLocationLock || "ANY");
    setFormOfficeRadius(u.officeRadius || 100);
    setFormNewPassword("");
    setShowNewPassword(false);
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (u: UserItem) => {
    setSelectedUser(u);
    setIsDeleteModalOpen(true);
  };

  // Open Permissions Modal
  const openPermissionsModal = (u: UserItem) => {
    setPermissionUser(u);
    const base: UserPermissions = u.permissions
      ? JSON.parse(JSON.stringify(u.permissions))
      : getDefaultPermissionsByRole(u.role);

    // Pastikan seluruh menu dari master ada di object
    for (const m of DSTECH_SYSTEM_MENUS) {
      if (!base[m.id]) {
        base[m.id] = {
          view: false,
          create: false,
          edit: false,
          delete: false,
          print: false,
          send: false,
        };
      }
    }
    setEditingPermissions(base);
    setActiveCategoryFilter("ALL");
    setPermissionSearch("");
    setIsPermissionsModalOpen(true);
  };

  // Toggle satu aksi per menu
  const togglePermission = (menuId: string, action: PermissionAction) => {
    setEditingPermissions((prev) => {
      const current = prev[menuId] || {
        view: false,
        create: false,
        edit: false,
        delete: false,
        print: false,
        send: false,
      };
      const newVal = !current[action];
      const updatedMenu = { ...current, [action]: newVal };

      // Logika cascading:
      // 1. Jika create/edit/delete/print/send dinyalakan, maka view harus otomatis menyala
      if (newVal && action !== "view") {
        updatedMenu.view = true;
      }
      // 2. Jika view dimatikan, matikan seluruh aksi lainnya
      if (!newVal && action === "view") {
        updatedMenu.create = false;
        updatedMenu.edit = false;
        updatedMenu.delete = false;
        updatedMenu.print = false;
        updatedMenu.send = false;
      }
      return { ...prev, [menuId]: updatedMenu };
    });
  };

  // Toggle semua aksi di 1 baris menu
  const toggleAllActionsForMenu = (menuId: string) => {
    setEditingPermissions((prev) => {
      const current = prev[menuId] || {
        view: false,
        create: false,
        edit: false,
        delete: false,
        print: false,
        send: false,
      };
      const allChecked =
        current.view &&
        current.create &&
        current.edit &&
        current.delete &&
        current.print &&
        current.send;
      const nextVal = !allChecked;
      return {
        ...prev,
        [menuId]: {
          view: nextVal,
          create: nextVal,
          edit: nextVal,
          delete: nextVal,
          print: nextVal,
          send: nextVal,
        },
      };
    });
  };

  // Toggle satu kolom aksi untuk seluruh menu
  const toggleActionColumnAll = (action: PermissionAction) => {
    setEditingPermissions((prev) => {
      const allChecked = DSTECH_SYSTEM_MENUS.every((m) => prev[m.id]?.[action]);
      const nextVal = !allChecked;
      const updated: UserPermissions = { ...prev };
      for (const m of DSTECH_SYSTEM_MENUS) {
        if (!updated[m.id]) {
          updated[m.id] = {
            view: false,
            create: false,
            edit: false,
            delete: false,
            print: false,
            send: false,
          };
        }
        updated[m.id] = { ...updated[m.id], [action]: nextVal };
        if (nextVal && action !== "view") {
          updated[m.id].view = true;
        }
        if (!nextVal && action === "view") {
          updated[m.id] = {
            view: false,
            create: false,
            edit: false,
            delete: false,
            print: false,
            send: false,
          };
        }
      }
      return updated;
    });
  };

  // Terapkan preset cepat
  const applyPreset = (presetId: string) => {
    const p = PERMISSION_PRESETS.find((x) => x.id === presetId);
    if (p) {
      setEditingPermissions(p.getPermissions());
      showToast("success", `Preset diterapkan: ${p.name}`);
    }
  };

  // Simpan Hak Akses ke Database via API
  const handleSavePermissions = async () => {
    if (!permissionUser) return;
    try {
      setIsSavingPermissions(true);
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: permissionUser.id,
          permissions: editingPermissions,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Hak akses & permissions untuk ${permissionUser.name} berhasil disimpan!`);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === permissionUser.id ? { ...u, permissions: editingPermissions } : u
          )
        );
        // Sinkronisasi local auth jika admin mengedit izin akun sendiri
        if (typeof window !== "undefined") {
          const authRaw = localStorage.getItem("dstech_admin_auth");
          if (authRaw) {
            try {
              const authParsed = JSON.parse(authRaw);
              if (authParsed.id === permissionUser.id || authParsed.email === permissionUser.email) {
                authParsed.permissions = editingPermissions;
                localStorage.setItem("dstech_admin_auth", JSON.stringify(authParsed));
              }
            } catch {}
          }
        }
        setIsPermissionsModalOpen(false);
      } else {
        showToast("error", json.message || "Gagal menyimpan hak akses pengguna.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan jaringan saat menyimpan hak akses.");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Submit Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      showToast("error", "Nama lengkap, email, dan kata sandi (password) wajib diisi.");
      return;
    }
    if (formPassword.trim().length < 6) {
      showToast("error", "Kata sandi minimal harus 6 karakter.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim(),
          role: formRole,
          status: formStatus,
          password: formPassword.trim(),
          expiresAt: formExpiresAt ? formExpiresAt : null,
          attendanceLocationLock: formLocationLock,
          officeRadius: formOfficeRadius,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", data.message || "Pengguna baru berhasil ditambahkan.");
        setIsAddModalOpen(false);
        setFormName("");
        setFormEmail("");
        setFormPhone("");
        setFormPassword("");
        setFormExpiresAt("");
        setFormLocationLock("ANY");
        setFormOfficeRadius(100);
        setShowPassword(false);
        setFormRole("EMPLOYEE");
        setFormStatus("ACTIVE");
        fetchUsers();
      } else {
        showToast("error", data.message || "Gagal menambahkan pengguna.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (formNewPassword.trim() && formNewPassword.trim().length < 6) {
      showToast("error", "Password baru minimal harus 6 karakter.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: any = {
        id: selectedUser.id,
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        role: formRole,
        status: formStatus,
        expiresAt: formExpiresAt ? formExpiresAt : null,
        attendanceLocationLock: formLocationLock,
        officeRadius: formOfficeRadius,
      };
      if (formNewPassword.trim()) {
        payload.password = formNewPassword.trim();
      }

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", "Data pengguna berhasil diperbarui.");
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setFormExpiresAt("");
        setFormNewPassword("");
        setShowNewPassword(false);
        fetchUsers();
      } else {
        showToast("error", data.message || "Gagal mengupdate pengguna.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/users?id=${selectedUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", data.message || "Pengguna berhasil dihapus.");
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        showToast("error", data.message || "Gagal menghapus pengguna.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan saat menghapus pengguna.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Statistics
  const totalUsers = users.length;
  const adminCount = users.filter(
    (u) => u.role === "SUPERADMIN" || u.role === "ADMIN"
  ).length;
  const staffCount = users.filter(
    (u) => u.role === "EMPLOYEE" || u.role === "AFFILIATE"
  ).length;
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 text-dstech-blue font-black text-xs uppercase tracking-widest mb-1.5">
            <UserCog className="w-4 h-4" />
            <span>Manajemen Akses & Hak Pengguna</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Kelola akun administrator, teknisi lapangan, mitra afiliasi, dan akun klien PT. DSTech Smart Perkasa secara terpadu.
          </p>
        </div>

        <button
          onClick={() => {
            setFormName("");
            setFormEmail("");
            setFormPhone("");
            setFormRole("EMPLOYEE");
            setFormStatus("ACTIVE");
            setIsAddModalOpen(true);
          }}
          id="btn-add-user"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-dstech-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Total
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pengguna</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalUsers} Akun</h3>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              Admin
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Administrator</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{adminCount} Orang</h3>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              Staf/Mitra
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Teknisi & Mitra</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{staffCount} Orang</h3>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
              Aktif
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Aktif</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{activeCount} Akun</h3>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, email, atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="user-search-input"
            className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue transition-all"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Role</option>
              <option value="SUPERADMIN">Super Admin</option>
              <option value="ADMIN">Administrator</option>
              <option value="EMPLOYEE">Teknisi / Staf</option>
              <option value="AFFILIATE">Mitra Afiliasi</option>
              <option value="CLIENT">Klien Korporat</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-600">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif (Active)</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="py-5 px-6">Pengguna & Kontak</th>
                <th className="py-5 px-6">Peran (Role)</th>
                <th className="py-5 px-6">Hak Akses Menu</th>
                <th className="py-5 px-6">Nomor Telepon/WA</th>
                <th className="py-5 px-6">Status Akun</th>
                <th className="py-5 px-6">Masa Berlaku Akses</th>
                <th className="py-5 px-6">Lokasi Absen GPS</th>
                <th className="py-5 px-6">Terdaftar</th>
                <th className="py-5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 text-sm">
                    <div className="w-6 h-6 border-2 border-dstech-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Memuat daftar pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 text-sm">
                    Tidak ditemukan data pengguna yang cocok.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleMeta = ROLE_CONFIG[user.role] || {
                    label: user.role,
                    badge: "bg-slate-100 text-slate-700 border-slate-200",
                    desc: "",
                  };
                  const initials = user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-700 flex items-center justify-center font-black text-xs border border-slate-200 group-hover:scale-105 transition-transform">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-dstech-blue transition-colors">
                              {user.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-slate-300" />
                                {user.email}
                              </p>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                                <Lock className="w-2.5 h-2.5 text-emerald-500" />
                                Sandi Aktif
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${roleMeta.badge}`}
                        >
                          {roleMeta.label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{roleMeta.desc}</p>
                      </td>

                      {/* Hak Akses Menu & Permissions */}
                      <td className="py-4 px-6">
                        {(() => {
                          const summary = summarizePermissions(user.permissions, user.role);
                          return (
                            <div className="space-y-1.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                                  summary.isFull
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : summary.viewCount > 0
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{summary.activeLabel}</span>
                              </span>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => openPermissionsModal(user)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-dstech-blue hover:text-blue-800 transition-colors cursor-pointer group/btn"
                                  title="Atur Hak Akses Menu & Aksi Granular"
                                >
                                  <Key className="w-3 h-3 group-hover/btn:scale-110 transition-transform text-amber-500" />
                                  <span className="underline decoration-dotted underline-offset-2">Kelola Izin & Aksi</span>
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-6">
                        {user.phone ? (
                          <a
                            href={`https://wa.me/${user.phone.replace(/^0/, "62")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 font-bold"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{user.phone}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          {user.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      {/* Masa Berlaku Akses */}
                      <td className="py-4 px-6">
                        {(() => {
                          const remaining = getRemainingDays(user.expiresAt);
                          if (!user.expiresAt) {
                            return (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Permanen (Tanpa Batas)
                              </span>
                            );
                          }
                          if (remaining !== null && remaining <= 0) {
                            return (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  Kedaluwarsa
                                </span>
                                <p className="text-[10px] text-rose-500 font-mono">
                                  {user.expiresAt.split("T")[0]}
                                </p>
                              </div>
                            );
                          }
                          if (remaining !== null && remaining <= 30) {
                            return (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  Sisa {remaining} Hari
                                </span>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  s/d {user.expiresAt.split("T")[0]}
                                </p>
                              </div>
                            );
                          }
                          return (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Aktif ({remaining} Hari)
                              </span>
                              <p className="text-[10px] text-slate-500 font-mono">
                                s/d {user.expiresAt.split("T")[0]}
                              </p>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Lokasi Absen GPS */}
                      <td className="py-4 px-6">
                        {user.attendanceLocationLock === "OFFICE" ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                              <Building className="w-3 h-3 text-amber-600" />
                              Wajib Kantor
                            </span>
                            <p className="text-[10px] text-slate-500 font-mono">Radius ≤{user.officeRadius || 100}m</p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                            <Navigation className="w-3 h-3 text-slate-400" />
                            Bebas Lapangan
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openPermissionsModal(user)}
                            className="p-2 rounded-xl text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-all cursor-pointer"
                            title="Kelola Hak Akses & Matriks Izin (Role User Manager)"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 rounded-xl text-slate-400 hover:text-dstech-blue hover:bg-blue-50 transition-all cursor-pointer"
                            title="Edit Pengguna"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {user.role !== "SUPERADMIN" && (
                            <button
                              onClick={() => openDeleteModal(user)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Modal Tambah Pengguna */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsAddModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-dstech-blue flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Tambah Pengguna Baru</h3>
                  <p className="text-xs text-slate-400">Pemberian akses akun sistem DSTech Smart</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Setiawan"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Email Akun *
                </label>
                <input
                  type="email"
                  required
                  placeholder="budi@dstechsmart.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Kata Sandi (Password Akun) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter sandi akun"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Key className="w-3 h-3 text-dstech-blue" />
                  Kata sandi ini digunakan untuk masuk ke portal sistem DSTech Smart.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Peran (Role) *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserItem["role"])}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-bold"
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="EMPLOYEE">Teknisi / Staf</option>
                    <option value="AFFILIATE">Mitra Afiliasi</option>
                    <option value="CLIENT">Klien Korporat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Status Akun
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as UserItem["status"])}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-bold"
                >
                  <option value="ACTIVE">Aktif (Dapat Login)</option>
                  <option value="INACTIVE">Nonaktif (Akses Ditutup)</option>
                </select>
              </div>

              {/* Masa Berlaku Akses (Expired Date) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Masa Berlaku Akses (Expired Date)
                  </label>
                  {formExpiresAt ? (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Batas: {formExpiresAt}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                      Akses Permanen
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(null)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      !formExpiresAt
                        ? "bg-dstech-blue text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Permanen
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(1)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    +1 Bulan
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(3)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    +3 Bulan
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(6)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    +6 Bulan
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(12)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    +1 Tahun
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                  {formExpiresAt && (
                    <button
                      type="button"
                      onClick={() => setFormExpiresAt("")}
                      className="px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 rounded-lg font-bold"
                      title="Reset ke Permanen"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  Setelah tanggal ini berlalu, pengguna otomatis ditolak masuk (login) ke aplikasi.
                </p>
              </div>

              {/* Aturan Lokasi Presensi GPS (Geofencing) */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-dstech-blue" />
                    Aturan Lokasi Presensi GPS (Geofencing)
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    formLocationLock === "OFFICE"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-200 text-slate-700"
                  }`}>
                    {formLocationLock === "OFFICE" ? "Terkunci di Kantor" : "Bebas Lapangan"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormLocationLock("ANY")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      formLocationLock === "ANY"
                        ? "bg-white border-dstech-blue shadow-xs ring-1 ring-dstech-blue"
                        : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <Navigation className={`w-4 h-4 mt-0.5 ${formLocationLock === "ANY" ? "text-dstech-blue" : "text-slate-400"}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900">🌐 Bebas / Lapangan</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Bisa absen di mana pun proyek berada (tetap wajib GPS & foto selfie).</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormLocationLock("OFFICE")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      formLocationLock === "OFFICE"
                        ? "bg-amber-50/70 border-amber-400 shadow-xs ring-1 ring-amber-400"
                        : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <Building className={`w-4 h-4 mt-0.5 ${formLocationLock === "OFFICE" ? "text-amber-600" : "text-slate-400"}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900">🏢 Wajib di Kantor</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Wajib berada di area Kantor DSTech Cilegon (GPS tervalidasi).</p>
                    </div>
                  </button>
                </div>

                {formLocationLock === "OFFICE" && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Radius Maksimal Toleransi:</span>
                    <div className="flex items-center gap-1.5">
                      {[50, 100, 200].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormOfficeRadius(r)}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${
                            formOfficeRadius === r
                              ? "bg-amber-600 text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {r} Meter
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="submit-add-user"
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-dstech-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Simpan Pengguna</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Pengguna */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsEditModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Perbarui Data Pengguna</h3>
                  <p className="text-xs text-slate-400">ID: {selectedUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Email Akun *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Peran (Role) *
                  </label>
                  <select
                    disabled={selectedUser.role === "SUPERADMIN"}
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserItem["role"])}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-bold disabled:opacity-60"
                  >
                    {selectedUser.role === "SUPERADMIN" && (
                      <option value="SUPERADMIN">Super Admin</option>
                    )}
                    <option value="ADMIN">Administrator</option>
                    <option value="EMPLOYEE">Teknisi / Staf</option>
                    <option value="AFFILIATE">Mitra Afiliasi</option>
                    <option value="CLIENT">Klien Korporat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Status Akun
                </label>
                <select
                  disabled={selectedUser.role === "SUPERADMIN"}
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as UserItem["status"])}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue font-bold disabled:opacity-60"
                >
                  <option value="ACTIVE">Aktif (Dapat Login)</option>
                  <option value="INACTIVE">Nonaktif (Akses Ditutup)</option>
                </select>
              </div>

              {/* Masa Berlaku Akses (Expired Date) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Masa Berlaku Akses (Expired Date)
                  </label>
                  {formExpiresAt ? (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Batas: {formExpiresAt}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                      Akses Permanen
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(null)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      !formExpiresAt
                        ? "bg-dstech-blue text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Permanen
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(1)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    +1 Bulan
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(3)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    +3 Bulan
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(6)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    +6 Bulan
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(12)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    +1 Tahun
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dstech-blue/30"
                  />
                  {formExpiresAt && (
                    <button
                      type="button"
                      onClick={() => setFormExpiresAt("")}
                      className="px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 rounded-lg font-bold"
                      title="Reset ke Permanen"
                    >
                      Reset
                    </button>
                  )}
                </div>
                {selectedUser.contractId && (
                  <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                    📄 Akun ini terhubung dengan Surat Kontrak Kerja (PKWT).
                  </p>
                )}
                <p className="text-[10px] text-slate-400">
                  Setelah tanggal ini berlalu, pengguna otomatis ditolak masuk (login) ke aplikasi.
                </p>
              </div>

              {/* Aturan Lokasi Presensi GPS (Geofencing) */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-dstech-blue" />
                    Aturan Lokasi Presensi GPS (Geofencing)
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    formLocationLock === "OFFICE"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-200 text-slate-700"
                  }`}>
                    {formLocationLock === "OFFICE" ? "Terkunci di Kantor" : "Bebas Lapangan"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormLocationLock("ANY")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      formLocationLock === "ANY"
                        ? "bg-white border-dstech-blue shadow-xs ring-1 ring-dstech-blue"
                        : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <Navigation className={`w-4 h-4 mt-0.5 ${formLocationLock === "ANY" ? "text-dstech-blue" : "text-slate-400"}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900">🌐 Bebas / Lapangan</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Bisa absen di mana pun proyek berada (tetap wajib GPS & foto selfie).</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormLocationLock("OFFICE")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      formLocationLock === "OFFICE"
                        ? "bg-amber-50/70 border-amber-400 shadow-xs ring-1 ring-amber-400"
                        : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <Building className={`w-4 h-4 mt-0.5 ${formLocationLock === "OFFICE" ? "text-amber-600" : "text-slate-400"}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900">🏢 Wajib di Kantor</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Wajib berada di area Kantor DSTech Cilegon (GPS tervalidasi).</p>
                    </div>
                  </button>
                </div>

                {formLocationLock === "OFFICE" && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Radius Maksimal Toleransi:</span>
                    <div className="flex items-center gap-1.5">
                      {[50, 100, 200].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormOfficeRadius(r)}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${
                            formOfficeRadius === r
                              ? "bg-amber-600 text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {r} Meter
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Ubah Kata Sandi Baru (Opsional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    minLength={6}
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                    value={formNewPassword}
                    onChange={(e) => setFormNewPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dstech-blue/30 focus:border-dstech-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-500" />
                  Biarkan kosong jika tetap menggunakan kata sandi lama.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-amber-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-600 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pengguna */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/10">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 text-center mb-2">
              Hapus Akses Pengguna?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus pengguna <strong className="text-slate-800">&quot;{selectedUser.name}&quot;</strong> ({selectedUser.email})? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteUser}
                id="btn-confirm-delete-user"
                className="flex-1 py-3.5 px-4 rounded-2xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700 shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Matriks Hak Akses & Role User Manager */}
      {isPermissionsModalOpen && permissionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-md">
          <div
            className="fixed inset-0"
            onClick={() => !isSavingPermissions && setIsPermissionsModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">
                      Matriks Hak Akses & Permissions
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                      Role Manager
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-bold text-slate-800 text-sm">{permissionUser.name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-mono">{permissionUser.email}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      Role: {ROLE_CONFIG[permissionUser.role]?.label || permissionUser.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPermissionsModalOpen(false)}
                disabled={isSavingPermissions}
                className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer self-end sm:self-center shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Bar */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Preset Cepat:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {PERMISSION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 hover:border-indigo-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    title={preset.desc}
                  >
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["ALL", "Operasional", "Keuangan", "Katalog & Produk", "Sistem & Legalitas"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      activeCategoryFilter === cat
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat === "ALL" ? "Semua (15 Menu)" : cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama menu..."
                  value={permissionSearch}
                  onChange={(e) => setPermissionSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Table Permissions Matrix */}
            <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-5">
              <table className="w-full text-left text-sm border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-100/80 text-[11px] font-black text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                    <th className="py-3 px-4 rounded-l-xl border-y border-l border-slate-200 min-w-[240px]">
                      Menu & Halaman
                    </th>
                    {(["view", "create", "edit", "delete", "print", "send"] as PermissionAction[]).map((act) => (
                      <th
                        key={act}
                        className="py-3 px-2 text-center border-y border-slate-200 min-w-[85px]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${ACTION_LABELS[act].badge}`}
                          >
                            {ACTION_LABELS[act].label}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleActionColumnAll(act)}
                            className="text-[9px] text-slate-400 hover:text-indigo-600 hover:underline cursor-pointer"
                            title={`Nyalakan / Matikan semua kolom ${ACTION_LABELS[act].label}`}
                          >
                            Semua
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center rounded-r-xl border-y border-r border-slate-200 min-w-[100px]">
                      Aksi Cepat
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DSTECH_SYSTEM_MENUS.filter((m) => {
                    const matchCat =
                      activeCategoryFilter === "ALL" || m.category === activeCategoryFilter;
                    const matchSearch =
                      !permissionSearch.trim() ||
                      m.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                      m.desc.toLowerCase().includes(permissionSearch.toLowerCase());
                    return matchCat && matchSearch;
                  }).map((menu) => {
                    const perm = editingPermissions[menu.id] || {
                      view: false,
                      create: false,
                      edit: false,
                      delete: false,
                      print: false,
                      send: false,
                    };
                    const isRowFull =
                      perm.view &&
                      perm.create &&
                      perm.edit &&
                      perm.delete &&
                      perm.print &&
                      perm.send;

                    return (
                      <tr
                        key={menu.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          perm.view ? "bg-white" : "bg-slate-50/30 opacity-70"
                        }`}
                      >
                        {/* Menu Info */}
                        <td className="py-3.5 px-4 border-b border-slate-100">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black transition-colors ${
                                perm.view
                                  ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {menu.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                                <span>{menu.name}</span>
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {menu.category}
                                </span>
                              </p>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {menu.desc}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Actions Checkboxes */}
                        {(["view", "create", "edit", "delete", "print", "send"] as PermissionAction[]).map((act) => {
                          const isChecked = Boolean(perm[act]);
                          return (
                            <td
                              key={act}
                              className="py-3.5 px-2 text-center border-b border-slate-100"
                            >
                              <button
                                type="button"
                                onClick={() => togglePermission(menu.id, act)}
                                className={`w-8 h-8 rounded-xl border flex items-center justify-center mx-auto transition-all cursor-pointer ${
                                  isChecked
                                    ? act === "delete"
                                      ? "bg-rose-600 border-rose-600 text-white shadow-xs"
                                      : act === "print"
                                      ? "bg-purple-600 border-purple-600 text-white shadow-xs"
                                      : act === "send"
                                      ? "bg-teal-600 border-teal-600 text-white shadow-xs"
                                      : "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                    : "bg-white border-slate-300 text-transparent hover:border-indigo-400"
                                }`}
                                title={`${ACTION_LABELS[act].label} - ${menu.name}`}
                              >
                                <Check className={`w-4 h-4 stroke-[3] ${isChecked ? "opacity-100" : "opacity-0"}`} />
                              </button>
                            </td>
                          );
                        })}

                        {/* Toggle Row All */}
                        <td className="py-3.5 px-4 text-center border-b border-slate-100">
                          <button
                            type="button"
                            onClick={() => toggleAllActionsForMenu(menu.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                              isRowFull
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {isRowFull ? "Semua Aktif" : "Centang Semua"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-xs text-slate-600 font-medium">
                  {(() => {
                    const summary = summarizePermissions(editingPermissions, permissionUser.role);
                    return (
                      <span>
                        Total menu aktif: <strong className="text-slate-900 font-bold">{summary.viewCount}</strong> dari {summary.totalMenus} menu sistem.
                      </span>
                    );
                  })()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSavingPermissions}
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSavingPermissions}
                  onClick={handleSavePermissions}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isSavingPermissions ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>Simpan Hak Akses Pengguna</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
