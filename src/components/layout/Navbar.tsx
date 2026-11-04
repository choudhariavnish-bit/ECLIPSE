"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";
import {
  ShieldCheck,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { DatabaseStatusBadge } from "./DatabaseStatusBadge";

const ROLE_META: Record<
  UserRole,
  { label: string; badgeClass: string; path: string; icon: React.ElementType }
> = {
  creator: {
    label: "Creator / Writer",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20",
    path: "/dashboard/creator",
    icon: Sparkles,
  },
  "brand-manager": {
    label: "Brand Manager",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20",
    path: "/dashboard/brand-manager",
    icon: Layers,
  },
  admin: {
    label: "Admin",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
    path: "/dashboard/admin",
    icon: Sliders,
  },
};

export const Navbar = () => {
  const router = useRouter();
  const { currentUser, activeRole, switchRole, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setDropdownOpen(false);
    router.push(ROLE_META[role].path);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const currentMeta = ROLE_META[activeRole] || ROLE_META.creator;
  const RoleIcon = currentMeta.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2.5 font-semibold text-slate-900 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Inkloom
                </span>
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
                  GovAI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
                Brand Governance Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          <DatabaseStatusBadge />
          {/* Quick Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ring-1 shadow-sm transition-all hover:brightness-95 ${currentMeta.badgeClass}`}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <RoleIcon className="h-3.5 w-3.5" />
              <span>{currentMeta.label}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-0.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl ring-1 ring-black/5 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Active Persona
                </div>
                {(["creator", "brand-manager", "admin"] as UserRole[]).map(
                  (role) => {
                    const meta = ROLE_META[role];
                    const Icon = meta.icon;
                    const isActive = activeRole === role;
                    return (
                      <button
                        key={role}
                        onClick={() => handleRoleSwitch(role)}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors ${isActive
                            ? "bg-slate-50 font-semibold text-slate-900"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-slate-500" />
                          <span>{meta.label}</span>
                        </div>
                        {isActive && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                        )}
                      </button>
                    );
                  }
                )}
                <div className="my-1 border-t border-slate-100" />
                <Link
                  href="/login"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Role Selection Portal</span>
                </Link>
              </div>
            )}
          </div>

          {/* User pill & sign out */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-medium text-slate-800">
                {currentUser?.name || "Demo User"}
              </div>
              <div className="text-[10px] text-slate-500">
                {currentUser?.department || "Inkloom Workspace"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

