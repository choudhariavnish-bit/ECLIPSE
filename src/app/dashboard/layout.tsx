"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "@/lib/next-compat/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { EclipseAssistantCopilot } from "@/components/assistant/EclipseAssistantCopilot";
import { useAuthStore, MOCK_USERS } from "@/stores/useAuthStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, currentUser, activeRole, switchRole, setUser } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. If session is missing, initialize with default creator persona so dashboard never crashes
    if (!isAuthenticated || !currentUser) {
      setUser(MOCK_USERS.creator);
      setIsReady(true);
      return;
    }

    // 2. Seamless Workspace Switching:
    // Synchronize active role with the URL path so the user can freely switch between dashboards
    if (pathname.includes("/dashboard/creator") && activeRole !== "creator") {
      switchRole("creator");
    } else if (
      (pathname.includes("/dashboard/brand-manager") || pathname.includes("/dashboard/approvals")) &&
      activeRole !== "brand-manager"
    ) {
      switchRole("brand-manager");
    } else if (
      (pathname.includes("/dashboard/admin") || pathname.includes("/dashboard/database")) &&
      activeRole !== "admin"
    ) {
      switchRole("admin");
    }

    setIsReady(true);
  }, [isAuthenticated, currentUser, activeRole, pathname, router, switchRole, setUser]);

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400 text-xs">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500" />
          <span>Calibrating Inkloom AI Workspace...</span>
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
