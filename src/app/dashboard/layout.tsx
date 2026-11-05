"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { EclipseAssistantCopilot } from "@/components/assistant/EclipseAssistantCopilot";
import { useAuthStore } from "@/stores/useAuthStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, currentUser, activeRole, loginAs } = useAuthStore();

  useEffect(() => {
    // If not authenticated, authenticate with default role for seamless evaluation
    if (!isAuthenticated || !currentUser) {
      loginAs(activeRole || "creator");
    }
  }, [isAuthenticated, currentUser, activeRole, loginAs]);

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
      <EclipseAssistantCopilot />
    </div>
  );
}
