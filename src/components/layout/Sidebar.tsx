"use client";

import React from "react";
import Link from "@/lib/next-compat/link";
import { usePathname } from "@/lib/next-compat/navigation";
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
  TrendingUp,
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
  { name: "Impact & Benefits", href: "/dashboard/benefits", icon: TrendingUp, badge: "ROI" },
];

const BRAND_MANAGER_NAV: NavItem[] = [
  { name: "Approval Pipeline", href: "/dashboard/brand-manager", icon: Layers, badge: "3" },
  { name: "Active Drafts", href: "/dashboard/drafts", icon: FileText, badge: "4" },
  { name: "Brand Rulebook", href: "/dashboard/rulebook", icon: BookOpen },
  { name: "Impact & Benefits", href: "/dashboard/benefits", icon: TrendingUp, badge: "ROI" },
];

const ADMIN_NAV: NavItem[] = [
  { name: "Access & RBAC", href: "/dashboard/admin", icon: Users, badge: "4" },
  { name: "Database Studio", href: "/dashboard/database", icon: Database, badge: "Live" },
  { name: "Brand Rulebooks", href: "/dashboard/rulebook", icon: BookOpen },
  { name: "Impact & Benefits", href: "/dashboard/benefits", icon: TrendingUp, badge: "ROI" },
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
    <aside className="w-56 border-r border-[#f2ead8] bg-[#fafaf6]/80 min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-3 hidden md:flex">
      <div className="space-y-5">
        {/* Active Role Indicator */}
        <div className={`px-3 py-2.5 rounded-xl border shadow-xs transition-colors ${
          activeRole === "creator"
            ? "first-color first-color-border"
            : activeRole === "brand-manager"
            ? "second-color second-color-border"
            : "third-color third-color-border"
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
            Your Workspace
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-stone-900" />
            <span className="text-xs font-bold text-stone-900">{roleTitle}</span>
          </div>
        </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="space-y-1">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Navigation
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#ffcab0] text-stone-950 font-bold border border-[#f7a077] shadow-xs"
                      : "text-stone-700 hover:bg-[#ffebbb]/60 hover:text-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-stone-950" : "text-stone-500"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                        isActive
                          ? "bg-white/80 text-stone-900 border border-[#f7a077]/50"
                          : "bg-white/60 text-stone-600 border border-[#ffebbb]"
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
        <div className="rounded-xl border fourth-color-border fourth-color p-3.5 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-bold mb-1">
            <ShieldCheck className="h-4 w-4 text-stone-900" />
            <span>Pre-Publication Guard</span>
          </div>
          <p className="text-[11px] text-stone-800 leading-relaxed font-medium">
            All content inspected against active Brand Rulebook before public release.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-[#ffebbb] pt-3 text-[10px] text-stone-500 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold">ECLIPSE Platform</span>
          <span className="font-mono text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm bg-[#e0ffcd] border border-[#b7e89e]">v2.4-prod</span>
        </div>
        <div className="text-[9px] text-stone-400">Zero Data Retention Policy Active</div>
      </div>
    </aside>
  );
};
