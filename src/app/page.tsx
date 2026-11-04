"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, activeRole } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      router.replace(`/dashboard/${activeRole}`);
    }
  }, [isAuthenticated, activeRole, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-slate-500 font-medium">
          Loading Inkloom Brand Governance...
        </p>
      </div>
    </div>
  );
}

