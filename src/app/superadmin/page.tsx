"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SuperadminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-sm font-semibold text-zinc-400">
        Mengalihkan ke Dashboard Utama DSTech Smart...
      </p>
    </div>
  );
}
