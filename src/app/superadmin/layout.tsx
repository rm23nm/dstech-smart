"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Pengalihan penuh rute /superadmin ke /admin
    // Contoh: /superadmin -> /admin
    // /superadmin/finance -> /admin/finance
    // /superadmin/products -> /admin/products
    // /superadmin/categories -> /admin/categories
    // /superadmin/portfolios -> /admin/portfolios
    // /superadmin/kms -> /admin/kms
    const target = pathname.replace(/^\/superadmin/, "/admin") || "/admin";
    router.replace(target);
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4 text-white">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-sm font-medium text-slate-300">
        Mengalihkan ke Portal Admin Utama DSTech Smart...
      </p>
    </div>
  );
}
