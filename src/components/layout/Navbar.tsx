"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";
import {
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  FileText,
  BookOpen,
  CheckSquare,
  Layers,
  Database,
  Users,
} from "lucide-react";
import { DatabaseStatusBadge } from "./DatabaseStatusBadge";

const ROLE_META: Record<
  UserRole,
  { label: string; badgeClass: string; path: string }
> = {
  creator: {
    label: "Author Studio",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    path: "/dashboard/creator",
  },
  "brand-manager": {
    label: "Brand Manager",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    path: "/dashboard/brand-manager",
  },
  admin: {
    label: "Security & Admin",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    path: "/dashboard/admin",
  },
};

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, activeRole, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const currentMeta = ROLE_META[activeRole] || ROLE_META.creator;

  // Filter mobile navigation links strictly by the user's role (zero cross-role leakage)
  const roleMobileLinks =
    activeRole === "creator"
      ? [
          { name: "Compliance Inspector", desc: "Audit content against brand rules", href: "/dashboard/creator", icon: CheckSquare, badge: "Real-time" },
          { name: "Active Drafts", desc: "Manage & open author articles", href: "/dashboard/drafts", icon: FileText, badge: "4 Active" },
          { name: "Brand Rulebook", desc: "Multi-brand voice & guidelines", href: "/dashboard/rulebook", icon: BookOpen, badge: null },
        ]
      : activeRole === "brand-manager"
      ? [
          { name: "Approval Pipeline", desc: "Review and sign off on drafts", href: "/dashboard/brand-manager", icon: Layers, badge: "3 Pending" },
          { name: "Active Drafts", desc: "View submitted team drafts", href: "/dashboard/drafts", icon: FileText, badge: "4 Active" },
          { name: "Brand Rulebook", desc: "Review and manage rulebook", href: "/dashboard/rulebook", icon: BookOpen, badge: null },
        ]
      : [
          { name: "Access & RBAC", desc: "User permissions and governance", href: "/dashboard/admin", icon: Users, badge: "4" },
          { name: "Brand Rulebooks", desc: "Configure global rules", href: "/dashboard/rulebook", icon: BookOpen, badge: null },
        ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
        <div className="flex h-14 items-center justify-between px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Left: Mobile Menu Toggle & Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link
              href={`/dashboard/${activeRole}`}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-slate-900">
                    Inkloom AI
                  </span>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[9px] font-semibold text-slate-600 border border-slate-200">
                    Governance
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <DatabaseStatusBadge />

            {/* Active Workspace Badge (Strict RBAC - Locked to logged-in user) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{currentMeta.label}</span>
            </div>

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden md:block text-right">
                <div className="text-xs font-semibold text-slate-900">
                  {currentUser?.name || "Logged User"}
                </div>
                <div className="text-[10px] text-slate-400">
                  {currentUser?.department || currentUser?.email || "Workspace"}
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

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-start">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative z-50 w-full max-w-sm bg-white border-r border-slate-200 shadow-2xl h-full flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">Inkloom Governance</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Active Role Indicator */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Active Workspace
                </div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{currentMeta.label}</span>
                </div>
              </div>

              {/* Direct Navigation Links (Strictly role-specific) */}
              <div className="p-4 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Navigation
                </div>
                {roleMobileLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-slate-900 text-white font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <div>
                          <div>{link.name}</div>
                          <div className={`text-[10px] ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                            {link.desc}
                          </div>
                        </div>
                      </div>
                      {link.badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isActive ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-700"
                        }`}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer User Profile */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                  {(currentUser?.name || "U")[0]}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{currentUser?.name || "Logged User"}</div>
                  <div className="text-[10px] text-slate-400">{currentUser?.department || currentMeta.label}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
