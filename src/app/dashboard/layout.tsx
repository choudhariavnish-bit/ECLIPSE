"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuthStore } from "@/stores/useAuthStore";
import { ShieldAlert } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, currentUser, activeRole } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Authentication check
    if (!isAuthenticated || !currentUser) {
      router.replace("/login");
      return;
    }

    // 2. Strict Role-Based Access Control (RBAC)
    // Creator cannot see brand-manager or admin
    // Brand Manager cannot see creator or admin
    // Admin cannot see creator or brand-manager
    if (activeRole === "creator") {
      if (
        pathname.startsWith("/dashboard/brand-manager") ||
        pathname.startsWith("/dashboard/admin")
      ) {
        router.replace("/dashboard/creator");
        return;
      }
    } else if (activeRole === "brand-manager") {
      if (
        pathname.startsWith("/dashboard/creator") ||
        pathname.startsWith("/dashboard/admin")
      ) {
        router.replace("/dashboard/brand-manager");
        return;
      }
    } else if (activeRole === "admin") {
      if (
        pathname.startsWith("/dashboard/creator") ||
        pathname.startsWith("/dashboard/brand-manager")
      ) {
        router.replace("/dashboard/admin");
        return;
      }
    }

    setIsAuthorized(true);
  }, [isAuthenticated, currentUser, activeRole, pathname, router]);

  if (!isAuthenticated || !currentUser || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-mono text-slate-400">Verifying RBAC permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
