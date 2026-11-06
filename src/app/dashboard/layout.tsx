"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { EclipseAssistantCopilot } from "@/components/assistant/EclipseAssistantCopilot";
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
    // Creator cannot see brand-manager, admin, or database
    // Brand Manager cannot see creator, admin, or database
    // Admin cannot see creator or brand-manager
    if (activeRole === "creator") {
      if (
        pathname.startsWith("/dashboard/brand-manager") ||
        pathname.startsWith("/dashboard/admin") ||
        pathname.startsWith("/dashboard/database")
      ) {
        router.replace("/dashboard/creator");
        return;
      }
    } else if (activeRole === "brand-manager") {
      if (
        pathname.startsWith("/dashboard/creator") ||
        pathname.startsWith("/dashboard/admin") ||
        pathname.startsWith("/dashboard/database")
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
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
          <span>Verifying authorization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto pb-16 md:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <MobileNav />
      <EclipseAssistantCopilot />
    </div>
  );
}
