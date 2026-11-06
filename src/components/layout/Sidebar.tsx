"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  FileText,
  ShieldCheck,
  Users,
  Cpu,
  History,
  CheckSquare,
  Layers,
  BookOpen,
  Database,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const CREATOR_NAV: NavItem[] = [
  { name: "Compliance Inspector", href: "/dashboard/creator", icon: CheckSquare },
  { name: "Active Drafts", href: "/dashboard/drafts", icon: FileText, badge: "4" },
  { name: "Brand Rulebook", href: "/dashboard/rulebook", icon: BookOpen },
];

const BRAND_MANAGER_NAV: NavItem[] = [
  { name: "Approval Pipeline", href: "/dashboard/brand-manager", icon: Layers, badge: "3" },
  { name: "Active Drafts", href: "/dashboard/drafts", icon: FileText, badge: "4" },
  { name: "Brand Rulebook", href: "/dashboard/rulebook", icon: BookOpen },
];

const ADMIN_NAV: NavItem[] = [
  { name: "Access & RBAC", href: "/dashboard/admin", icon: Users, badge: "4" },
  { name: "Database Studio", href: "/dashboard/database", icon: Database, badge: "Live" },
  { name: "Brand Rulebooks", href: "/dashboard/rulebook", icon: BookOpen },
  { name: "System Settings", href: "/dashboard/admin", icon: Cpu },
  { name: "Audit Trail Ledger", href: "/dashboard/admin", icon: History },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { activeRole } = useAuthStore();

  let navItems = CREATOR_NAV;
  let roleTitle = "Author Studio";

  if (activeRole === "brand-manager") {
    navItems = BRAND_MANAGER_NAV;
    roleTitle = "Brand Manager Portal";
  } else if (activeRole === "admin") {
    navItems = ADMIN_NAV;
    roleTitle = "Security & Admin";
  }

  return (
    <aside className="w-56 border-r border-slate-200 bg-slate-50/50 min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-3 hidden md:flex">
      <div className="space-y-5">
        {/* Active Role Indicator (Strict RBAC - No cross-role switching) */}
        <div className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Your Workspace
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-800">{roleTitle}</span>
          </div>
        </div>

        {/* Section Navigation - Strictly filtered by role */}
        <div className="space-y-1">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </span>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-900 text-white font-bold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-mono font-semibold ${
                        isActive
                          ? "bg-slate-800 text-slate-200 border border-slate-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Brand Governance Protection Badge */}
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-3.5 text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-semibold mb-1">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Pre-Publication Guard</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            All content inspected against active Brand Rulebook before public release.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span>Inkloom Platform</span>
          <span className="font-mono text-emerald-600 font-bold">v2.4-prod</span>
        </div>
        <div className="text-[9px] text-slate-400">Zero Data Retention Policy Active</div>
      </div>
    </aside>
  );
};
