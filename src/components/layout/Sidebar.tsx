"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";
import {
  FileText,
  ShieldCheck,
  Sliders,
  Users,
  Cpu,
  History,
  CheckSquare,
  Layers,
  BookOpen,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const CREATOR_NAV: NavItem[] = [
  { name: "Compliance Inspector", href: "/dashboard/creator", icon: CheckSquare },
  { name: "Active Drafts", href: "/dashboard/creator", icon: FileText, badge: "3" },
  { name: "Brand Rulebook", href: "/dashboard/creator", icon: BookOpen },
];

const BRAND_MANAGER_NAV: NavItem[] = [
  { name: "Approval Pipeline", href: "/dashboard/brand-manager", icon: Layers, badge: "2" },
  { name: "Tone & Voice Policy", href: "/dashboard/brand-manager", icon: Sliders },
  { name: "Brand Rulebook", href: "/dashboard/brand-manager", icon: BookOpen },
];

const ADMIN_NAV: NavItem[] = [
  { name: "Access & RBAC", href: "/dashboard/admin", icon: Users, badge: "4" },
  { name: "Privacy & Model Settings", href: "/dashboard/admin", icon: Cpu },
  { name: "Audit Trail Ledger", href: "/dashboard/admin", icon: History },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole, switchRole } = useAuthStore();

  let navItems = CREATOR_NAV;

  if (activeRole === "brand-manager") {
    navItems = BRAND_MANAGER_NAV;
  } else if (activeRole === "admin") {
    navItems = ADMIN_NAV;
  }

  const handleRoleSwitch = (role: UserRole, targetPath: string) => {
    switchRole(role);
    router.push(targetPath);
  };

  return (
    <aside className="w-56 border-r border-slate-200 bg-slate-50/50 min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-3 hidden md:flex">
      <div className="space-y-5">
        {/* Workspace Quick Switcher */}
        <div className="space-y-1">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspaces
          </span>
          <div className="space-y-0.5">
            <button
              onClick={() => handleRoleSwitch("creator", "/dashboard/creator")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === "creator"
                  ? "bg-white text-slate-900 border border-slate-200 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>Author Studio</span>
              {activeRole === "creator" && <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
            </button>

            <button
              onClick={() => handleRoleSwitch("brand-manager", "/dashboard/brand-manager")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === "brand-manager"
                  ? "bg-white text-slate-900 border border-slate-200 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>Brand Manager</span>
              {activeRole === "brand-manager" && <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
            </button>

            <button
              onClick={() => handleRoleSwitch("admin", "/dashboard/admin")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === "admin"
                  ? "bg-white text-slate-900 border border-slate-200 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>Security & Admin</span>
              {activeRole === "admin" && <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
            </button>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="space-y-1">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </span>
          <nav className="space-y-0.5">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === 0 && pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-200/70 text-slate-900 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-slate-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-200 pt-3 px-2 text-[10px] text-slate-400 font-mono">
        <div>INKLOOM PLATFORM</div>
        <div>v2.4.2-ENTERPRISE</div>
      </div>
    </aside>
  );
};
