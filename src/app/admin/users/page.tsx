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
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "EMPLOYEE" | "AFFILIATE" | "CLIENT";
  phone: string;
  status: "ACTIVE" | "INACTIVE";
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

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<UserItem["role"]>("EMPLOYEE");
  const [formStatus, setFormStatus] = useState<UserItem["status"]>("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (u: UserItem) => {
    setSelectedUser(u);
    setIsDeleteModalOpen(true);
  };

  // Submit Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast("error", "Nama lengkap dan email wajib diisi.");
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
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", data.message || "Pengguna baru berhasil ditambahkan.");
        setIsAddModalOpen(false);
        setFormName("");
        setFormEmail("");
        setFormPhone("");
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

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser.id,
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim(),
          role: formRole,
          status: formStatus,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", "Data pengguna berhasil diperbarui.");
        setIsEditModalOpen(false);
        setSelectedUser(null);
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
                <th className="py-5 px-6">Nomor Telepon/WA</th>
                <th className="py-5 px-6">Status Akun</th>
                <th className="py-5 px-6">Terdaftar</th>
                <th className="py-5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                    <div className="w-6 h-6 border-2 border-dstech-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Memuat daftar pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
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
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-300" />
                              {user.email}
                            </p>
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
    </div>
  );
}
