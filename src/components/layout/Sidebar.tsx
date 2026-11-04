"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";
import {
  FileText,
  Sparkles,
  BookOpen,
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Users,
  Cpu,
  History,
  Lock,
  BarChart3,
  Layers,
  Database,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const CREATOR_NAV: NavItem[] = [
  { name: "Creator Dashboard", href: "/dashboard/creator", icon: Sparkles },
  { name: "My Drafts & Content", href: "/dashboard/creator#drafts", icon: FileText, badge: "4" },
  { name: "Instant Brand Check", href: "/dashboard/creator#brand-check", icon: CheckSquare },
  { name: "Terminology & Facts", href: "/dashboard/creator#glossary", icon: BookOpen },
  { name: "Review Feedback", href: "/dashboard/creator#feedback", icon: History, badge: "2" },
];

const BRAND_MANAGER_NAV: NavItem[] = [
  { name: "Manager Dashboard", href: "/dashboard/brand-manager", icon: Layers },
  { name: "Review Queue", href: "/dashboard/brand-manager#queue", icon: CheckSquare, badge: "6 Pending" },
  { name: "Brand Guidelines & Rules", href: "/dashboard/brand-manager#guidelines", icon: BookOpen },
  { name: "Tone & Voice Policy", href: "/dashboard/brand-manager#tone-policy", icon: Sliders },
  { name: "Flagged Claims & Violations", href: "/dashboard/brand-manager#violations", icon: AlertTriangle, badge: "3 High" },
  { name: "Compliance Heatmap", href: "/dashboard/brand-manager#compliance", icon: BarChart3 },
];

const ADMIN_NAV: NavItem[] = [
  { name: "Admin Dashboard", href: "/dashboard/admin", icon: Sliders },
  { name: "Organization Metrics", href: "/dashboard/admin#metrics", icon: BarChart3 },
  { name: "User Access & RBAC", href: "/dashboard/admin#users", icon: Users, badge: "28 Users" },
  { name: "AI & OCR Engines", href: "/dashboard/admin#ai-config", icon: Cpu },
  { name: "Audit Trail & Compliance", href: "/dashboard/admin#audit-logs", icon: History },
  { name: "Confidentiality & Security", href: "/dashboard/admin#security", icon: Lock, badge: "Active" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { activeRole } = useAuthStore();

  let navItems = CREATOR_NAV;
  let roleTitle = "Creator Workspace";

  if (activeRole === "brand-manager") {
    navItems = BRAND_MANAGER_NAV;
    roleTitle = "Governance Console";
  } else if (activeRole === "admin") {
    navItems = ADMIN_NAV;
    roleTitle = "Admin System Suite";
  }

  return (
    <aside className="w-64 border-r border-slate-200 bg-white/70 backdrop-blur min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6">
        <div>
          <h2 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {roleTitle}
          </h2>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href.split("#")[0];
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/5 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isActive
                          ? "bg-blue-200/70 text-blue-800"
                          : "bg-slate-100 text-slate-600"
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

        {/* Database Studio Quick Link */}
        <Link
          href="/dashboard/database"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs hover:border-blue-300 hover:bg-blue-50/40 transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-slate-800">Database Studio</div>
              <div className="text-[10px] text-slate-500">Inspect 9 Tables</div>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
            Live
          </span>
        </Link>

        {/* Brand Governance Protection Badge */}
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-3.5 text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-semibold mb-1">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Pre-Publication Guard</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            All content inspected against Inkloom Brand Rulebook v2.4 before public release.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        <div>Inkloom AI BrandGov</div>
        <div>Engine v2.4.0 (Active)</div>
      </div>
    </aside>
  );
};

