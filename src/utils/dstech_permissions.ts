/**
 * DSTech Smart - Role & Granular Permission Management System
 * Prefix: dstech_
 * Mengatur hak akses 15 menu resmi dengan 6 aksi granular:
 * view, create, edit, delete, print, send
 */

export type PermissionAction = "view" | "create" | "edit" | "delete" | "print" | "send";

export interface MenuPermission {
  view: boolean;   // Hak melihat menu / halaman
  create: boolean; // Hak menambah data baru
  edit: boolean;   // Hak mengubah / edit data
  delete: boolean; // Hak menghapus data
  print: boolean;  // Hak mencetak dokumen / faktur / SPK / PDF
  send: boolean;   // Hak mengirim dokumen via WhatsApp / Email
}

export type UserPermissions = Record<string, MenuPermission>;

export interface MenuItemConfig {
  id: string;
  name: string;
  category: "Operasional" | "Keuangan" | "Katalog & Produk" | "Sistem & Legalitas";
  path: string;
  desc: string;
}

export const DSTECH_SYSTEM_MENUS: MenuItemConfig[] = [
  {
    id: "dashboard",
    name: "Dashboard Overview",
    category: "Operasional",
    path: "/admin",
    desc: "Ringkasan metrik omset, stok, presensi & performa bisnis",
  },
  {
    id: "finance",
    name: "Keuangan & ERP",
    category: "Keuangan",
    path: "/admin/finance",
    desc: "Faktur Penjualan, SPH, PO Supplier, Retur, Arus Kas & Laba Rugi",
  },
  {
    id: "maintenance",
    name: "Jadwal & Maintenance",
    category: "Operasional",
    path: "/admin/maintenance",
    desc: "Jadwal servis berkala, penugasan tiket teknisi & SPK lapangan",
  },
  {
    id: "attendance",
    name: "Rekap Absensi Staf",
    category: "Operasional",
    path: "/admin/attendance",
    desc: "Presensi harian live kamera, titik koordinat GPS & approval lembur",
  },
  {
    id: "payroll",
    name: "Penggajian & Rekap Gaji",
    category: "Keuangan",
    path: "/admin/payroll",
    desc: "Perhitungan gaji staf & teknisi, auto payday & cetak slip gaji A4",
  },
  {
    id: "contracts",
    name: "Kontrak Kerja & Rekrutmen",
    category: "Operasional",
    path: "/admin/contracts",
    desc: "Kontrak staf & teknisi (Tipe 1, 2, 3), masa berlaku & cetak PKWT resmi",
  },
  {
    id: "inventory",
    name: "Manajemen Stok & Gudang",
    category: "Operasional",
    path: "/admin/inventory",
    desc: "Kartu stok multi-gudang, stock opname & approval material teknisi",
  },
  {
    id: "products",
    name: "Product Management",
    category: "Katalog & Produk",
    path: "/admin/products",
    desc: "Kelola master katalog barang, harga, varian CCTV & Smart Home",
  },
  {
    id: "categories",
    name: "Kategori & Sub-Kategori",
    category: "Katalog & Produk",
    path: "/admin/categories",
    desc: "Klasifikasi kategori dan sub-kategori produk hardware & jasa",
  },
  {
    id: "portfolios",
    name: "Portofolio Proyek",
    category: "Katalog & Produk",
    path: "/admin/portfolios",
    desc: "Dokumentasi hasil instalasi proyek, galeri foto & video YouTube",
  },
  {
    id: "promotions",
    name: "Materi Promosi & Katalog",
    category: "Katalog & Produk",
    path: "/admin/promotions",
    desc: "E-katalog unduhan, brosur promosi & materi marketing mitra",
  },
  {
    id: "kms",
    name: "KMS Teknisi (SOP & K3)",
    category: "Operasional",
    path: "/admin/kms",
    desc: "Pusat pengetahuan SOP instalasi CCTV, standar K3 & firmware NVR",
  },
  {
    id: "orders",
    name: "Pesanan E-Store",
    category: "Operasional",
    path: "/admin/orders",
    desc: "Proses pesanan e-store, verifikasi bukti bayar, cetak surat jalan & input no. resi kurir / armada DSTech",
  },
  {
    id: "mail",
    name: "Email Perusahaan",
    category: "Operasional",
    path: "/admin/mail",
    desc: "Kelola akun email resmi, kotak masuk webmail dan kirim email via SMTP SSL",
  },
  {
    id: "users",
    name: "User Management & Role",
    category: "Sistem & Legalitas",
    path: "/admin/users",
    desc: "Kelola akun pengguna, masa aktif & matriks hak akses karyawan",
  },
  {
    id: "partners",
    name: "Affiliate Network",
    category: "Sistem & Legalitas",
    path: "/admin/partners",
    desc: "Daftar agen mitra referral, tracking komisi & verifikasi pencairan",
  },
  {
    id: "settings",
    name: "Site Settings & Kontak",
    category: "Sistem & Legalitas",
    path: "/admin/settings",
    desc: "Profil PT DSTech Smart Perkasa, rekening bank, kop surat & kontak CS",
  },
];

export const ACTION_LABELS: Record<PermissionAction, { label: string; desc: string; badge: string }> = {
  view: { label: "Lihat", desc: "Membuka & melihat halaman", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  create: { label: "Tambah", desc: "Membuat data baru", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  edit: { label: "Ubah", desc: "Mengedit data yang ada", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  delete: { label: "Hapus", desc: "Menghapus data", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  print: { label: "Cetak", desc: "Cetak lembar fisik & unduh PDF", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  send: { label: "Kirim", desc: "Kirim via WhatsApp / Email", badge: "bg-teal-50 text-teal-700 border-teal-200" },
};

/**
 * Buat template permission kosong / penuh untuk semua menu
 */
export function createEmptyPermissions(): UserPermissions {
  const result: UserPermissions = {};
  for (const menu of DSTECH_SYSTEM_MENUS) {
    result[menu.id] = {
      view: false,
      create: false,
      edit: false,
      delete: false,
      print: false,
      send: false,
    };
  }
  return result;
}

export function createFullPermissions(): UserPermissions {
  const result: UserPermissions = {};
  for (const menu of DSTECH_SYSTEM_MENUS) {
    result[menu.id] = {
      view: true,
      create: true,
      edit: true,
      delete: true,
      print: true,
      send: true,
    };
  }
  return result;
}

/**
 * Presets default berdasarkan Role
 */
export function getDefaultPermissionsByRole(role: string): UserPermissions {
  const perms = createEmptyPermissions();

  if (role === "SUPERADMIN") {
    return createFullPermissions();
  }

  if (role === "ADMIN") {
    // Admin operasional memiliki akses ke hampir semua menu, kecuali hapus user & settings vital
    for (const menu of DSTECH_SYSTEM_MENUS) {
      perms[menu.id] = {
        view: true,
        create: true,
        edit: true,
        delete: menu.id !== "users" && menu.id !== "settings",
        print: true,
        send: true,
      };
    }
    return perms;
  }

  if (role === "EMPLOYEE") {
    // Teknisi / Staf lapangan:
    // Dashboard: view
    perms.dashboard = { view: true, create: false, edit: false, delete: false, print: false, send: false };
    // Maintenance: view, create, edit, print, send
    perms.maintenance = { view: true, create: true, edit: true, delete: false, print: true, send: true };
    // Absensi: view, create (check-in/out)
    perms.attendance = { view: true, create: true, edit: false, delete: false, print: true, send: false };
    // Inventory: view, create (ajukan material)
    perms.inventory = { view: true, create: true, edit: false, delete: false, print: true, send: false };
    // KMS: view
    perms.kms = { view: true, create: false, edit: false, delete: false, print: true, send: false };
    // Products: view
    perms.products = { view: true, create: false, edit: false, delete: false, print: false, send: false };
    // Portofolio: view
    perms.portfolios = { view: true, create: false, edit: false, delete: false, print: false, send: false };
    // Contracts: view kontrak diri sendiri
    perms.contracts = { view: true, create: false, edit: false, delete: false, print: true, send: false };
    return perms;
  }

  if (role === "AFFILIATE") {
    perms.dashboard = { view: true, create: false, edit: false, delete: false, print: false, send: false };
    perms.partners = { view: true, create: true, edit: false, delete: false, print: true, send: false };
    perms.promotions = { view: true, create: false, edit: false, delete: false, print: true, send: true };
    perms.products = { view: true, create: false, edit: false, delete: false, print: false, send: false };
    return perms;
  }

  if (role === "CLIENT") {
    perms.dashboard = { view: true, create: false, edit: false, delete: false, print: false, send: false };
    perms.products = { view: true, create: false, edit: false, delete: false, print: false, send: false };
    perms.portfolios = { view: true, create: false, edit: false, delete: false, print: false, send: false };
    return perms;
  }

  return perms;
}

/**
 * Preset khusus pilihan cepat di UI
 */
export const PERMISSION_PRESETS = [
  {
    id: "full_access",
    name: "⚡ Akses Penuh (Full Control)",
    desc: "Memberikan seluruh hak akses (Lihat, Tambah, Ubah, Hapus, Cetak, Kirim) ke semua 15 menu",
    color: "bg-purple-600 text-white",
    getPermissions: () => createFullPermissions(),
  },
  {
    id: "view_only",
    name: "👀 Hanya Lihat (View Only)",
    desc: "Hanya dapat membuka dan melihat data di semua menu tanpa izin ubah/hapus",
    color: "bg-slate-700 text-white",
    getPermissions: () => {
      const p = createEmptyPermissions();
      for (const m of DSTECH_SYSTEM_MENUS) {
        p[m.id].view = true;
      }
      return p;
    },
  },
  {
    id: "field_technician",
    name: "🛠️ Teknisi Lapangan (Field Ops)",
    desc: "Akses menu operasional: Jadwal Maintenance, Rekap Absensi, Stok Gudang, KMS, & Kontrak",
    color: "bg-emerald-600 text-white",
    getPermissions: () => getDefaultPermissionsByRole("EMPLOYEE"),
  },
  {
    id: "finance_sales",
    name: "💰 Keuangan & Penjualan (ERP Finance)",
    desc: "Akses penuh Keuangan & ERP, Penggajian Payroll, Kontrak, & Stok Gudang",
    color: "bg-blue-600 text-white",
    getPermissions: () => {
      const p = createEmptyPermissions();
      p.dashboard = { view: true, create: false, edit: false, delete: false, print: true, send: false };
      p.finance = { view: true, create: true, edit: true, delete: false, print: true, send: true };
      p.payroll = { view: true, create: true, edit: true, delete: false, print: true, send: true };
      p.contracts = { view: true, create: true, edit: true, delete: false, print: true, send: true };
      p.inventory = { view: true, create: true, edit: true, delete: false, print: true, send: true };
      p.products = { view: true, create: true, edit: true, delete: false, print: true, send: false };
      return p;
    },
  },
  {
    id: "reset_empty",
    name: "🚫 Kosongkan Semua (No Access)",
    desc: "Cabut semua izin akses",
    color: "bg-rose-600 text-white",
    getPermissions: () => createEmptyPermissions(),
  },
];

/**
 * Cek apakah user memiliki hak akses tertentu untuk menu tertentu
 */
export function checkUserPermission(
  permissions: UserPermissions | undefined | null,
  userRole: string | undefined | null,
  menuId: string,
  action: PermissionAction = "view"
): boolean {
  if (userRole === "SUPERADMIN") return true;
  if (!permissions) {
    const defaultPerms = getDefaultPermissionsByRole(userRole || "EMPLOYEE");
    return defaultPerms[menuId]?.[action] ?? false;
  }
  const menuPerm = permissions[menuId];
  if (!menuPerm) return false;
  return Boolean(menuPerm[action]);
}

/**
 * Menghitung ringkasan izin aktif suatu user
 */
export function summarizePermissions(
  permissions: UserPermissions | undefined | null,
  userRole: string | undefined | null
): {
  viewCount: number;
  totalMenus: number;
  isFull: boolean;
  activeLabel: string;
} {
  const totalMenus = DSTECH_SYSTEM_MENUS.length;
  if (userRole === "SUPERADMIN") {
    return {
      viewCount: totalMenus,
      totalMenus,
      isFull: true,
      activeLabel: "Akses Penuh Super Admin",
    };
  }

  const effective = permissions || getDefaultPermissionsByRole(userRole || "EMPLOYEE");
  let viewCount = 0;
  let fullCount = 0;

  for (const m of DSTECH_SYSTEM_MENUS) {
    const perm = effective[m.id];
    if (perm?.view) {
      viewCount++;
      if (perm.create && perm.edit && perm.delete && perm.print && perm.send) {
        fullCount++;
      }
    }
  }

  const isFull = fullCount === totalMenus;
  let activeLabel = `${viewCount}/${totalMenus} Menu`;
  if (isFull) activeLabel = "Semua Menu (Penuh)";
  else if (viewCount === 0) activeLabel = "Tidak Ada Akses";

  return {
    viewCount,
    totalMenus,
    isFull,
    activeLabel,
  };
}

export interface RoleDefinition {
  role: string;
  label: string;
  color: string;
  badge: string;
  desc: string;
}

export const DSTECH_ROLES: RoleDefinition[] = [
  {
    role: "SUPERADMIN",
    label: "Super Administrator",
    color: "purple",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    desc: "Akses penuh tanpa batas ke seluruh modul, sistem & otoritas tertinggi",
  },
  {
    role: "ADMIN",
    label: "Administrator",
    color: "blue",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    desc: "Manajerial operasional, inventaris, produk, keuangan & tim",
  },
  {
    role: "EMPLOYEE",
    label: "Karyawan / Teknisi Lapangan",
    color: "amber",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    desc: "Maintenance CCTV, absensi mandiri, request barang & SOP KMS",
  },
  {
    role: "AFFILIATE",
    label: "Mitra / Affiliate",
    color: "emerald",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    desc: "Portal referral mitra, promosi e-katalog & komisi affiliate",
  },
  {
    role: "CLIENT",
    label: "Klien Korporat",
    color: "slate",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    desc: "Monitoring progres proyek, portofolio & katalog solusi",
  },
];

/**
 * Mengambil hak akses efektif pengguna, mengutamakan perannya jika userPermissions belum dikustomisasi
 */
export function resolveUserEffectivePermissions(
  userPermissions?: UserPermissions | null,
  userRole?: string | null,
  rolePermissionsMap?: Record<string, any> | null
): UserPermissions {
  const roleKey = (userRole || "EMPLOYEE").toUpperCase();
  if (roleKey === "SUPERADMIN") return createFullPermissions();

  // Jika ada peta rolePermissions dari server/cache
  if (rolePermissionsMap && rolePermissionsMap[roleKey]?.permissions) {
    return rolePermissionsMap[roleKey].permissions;
  }

  // Jika ada user-level permission
  if (userPermissions && Object.keys(userPermissions).length > 0) {
    return userPermissions;
  }

  // Fallback default peran
  return getDefaultPermissionsByRole(roleKey);
}

