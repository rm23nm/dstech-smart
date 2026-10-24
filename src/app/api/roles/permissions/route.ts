import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDefaultPermissionsByRole, UserPermissions } from "@/utils/dstech_permissions";

const ROLE_PERMS_FILE = path.join(process.cwd(), "src", "data", "dstech_role_permissions.json");
const USERS_FILE = path.join(process.cwd(), "src", "data", "dstech_users.json");

function getRolePermissionsData(): Record<string, any> {
  try {
    if (fs.existsSync(ROLE_PERMS_FILE)) {
      const raw = fs.readFileSync(ROLE_PERMS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error reading dstech_role_permissions.json:", error);
  }

  // Fallback default
  const defaultRoles = ["SUPERADMIN", "ADMIN", "EMPLOYEE", "AFFILIATE", "CLIENT"];
  const res: Record<string, any> = {};
  for (const r of defaultRoles) {
    res[r] = {
      role: r,
      permissions: getDefaultPermissionsByRole(r),
      updatedAt: new Date().toISOString(),
    };
  }
  return res;
}

function saveRolePermissionsData(data: Record<string, any>) {
  const dir = path.dirname(ROLE_PERMS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(ROLE_PERMS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getUsersData(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error reading dstech_users.json:", error);
  }
  return [];
}

function saveUsersData(data: any[]) {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// GET: Ambil matriks permissions seluruh peran
export async function GET() {
  try {
    const roleData = getRolePermissionsData();
    const users = getUsersData();

    // Hitung jumlah user per role
    const userCounts: Record<string, number> = {};
    for (const u of users) {
      const r = u.role || "EMPLOYEE";
      userCounts[r] = (userCounts[r] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      data: roleData,
      userCounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat hak akses peran" },
      { status: 500 }
    );
  }
}

// PUT: Perbarui matriks permissions suatu peran & otomatis sinkronkan ke seluruh user terkait
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { role, permissions, description, label } = body;

    if (!role || !permissions) {
      return NextResponse.json(
        { success: false, message: "Parameter role dan permissions wajib disertakan" },
        { status: 400 }
      );
    }

    const currentRoles = getRolePermissionsData();
    const roleKey = String(role).toUpperCase();

    // Simpan role permissions
    currentRoles[roleKey] = {
      ...(currentRoles[roleKey] || {}),
      role: roleKey,
      label: label || currentRoles[roleKey]?.label || roleKey,
      description: description || currentRoles[roleKey]?.description || `Hak akses peran ${roleKey}`,
      permissions,
      updatedAt: new Date().toISOString(),
    };

    saveRolePermissionsData(currentRoles);

    // Sinkronkan seluruh user dengan peran yang sama secara otomatis
    const users = getUsersData();
    let updatedUsersCount = 0;

    const updatedUsers = users.map((user) => {
      if (user.role === roleKey) {
        updatedUsersCount++;
        return {
          ...user,
          permissions,
          updatedAt: new Date().toISOString(),
        };
      }
      return user;
    });

    if (updatedUsersCount > 0) {
      saveUsersData(updatedUsers);
    }

    return NextResponse.json({
      success: true,
      message: `Hak akses untuk peran ${roleKey} berhasil diperbarui dan otomatis disinkronkan ke ${updatedUsersCount} pengguna.`,
      updatedUsersCount,
      roleData: currentRoles[roleKey],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menyimpan hak akses peran" },
      { status: 500 }
    );
  }
}
