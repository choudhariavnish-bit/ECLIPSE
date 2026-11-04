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
  CheckCircle2,
} from "lucide-react";

const ROLE_META: Record<
  UserRole,
  { label: string; badgeClass: string; path: string }
> = {
  creator: {
    label: "Author Studio",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
    path: "/dashboard/creator",
  },
  "brand-manager": {
    label: "Brand Manager",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
    path: "/dashboard/brand-manager",
  },
  admin: {
    label: "Security & Admin",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
    path: "/dashboard/admin",
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/creator"
            className="flex items-center gap-2.5 font-semibold text-slate-900 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  Inkloom AI
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-slate-600 border border-slate-200">
                  ENTERPRISE
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Quick Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span>{currentMeta.label}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50">
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Workspace
                </div>
                {(["creator", "brand-manager", "admin"] as UserRole[]).map((role) => {
                  const meta = ROLE_META[role];
                  const isActive = activeRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition-colors ${
                        isActive
                          ? "bg-slate-100 font-bold text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{meta.label}</span>
                      {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-slate-900" />}
                    </button>
                  );
                })}
                <div className="my-1 border-t border-slate-100" />
                <Link
                  href="/login"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>Switch Account</span>
                </Link>
              </div>
            )}
          </div>

          {/* User pill & sign out */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-slate-900">
                {currentUser?.name || "Alex Morgan"}
              </div>
              <div className="text-[10px] text-slate-400">
                {currentUser?.department || "Content & Growth"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
