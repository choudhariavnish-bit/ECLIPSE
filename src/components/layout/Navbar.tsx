"use client";

import React, { useState } from "react";
import Link from "@/lib/next-compat/link";
import { usePathname, useRouter } from "@/lib/next-compat/navigation";
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
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { DatabaseStatusBadge } from "./DatabaseStatusBadge";
import { AiEngineStatusBadge } from "./AiEngineStatusBadge";

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
  const { currentUser, activeRole, logout, switchRole } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSwitchWorkspace = (role: UserRole, targetPath: string) => {
    switchRole(role);
    setWorkspaceMenuOpen(false);
    router.push(targetPath);
  };

  const currentMeta = ROLE_META[activeRole] || ROLE_META.creator;

  const roleMobileLinks = [
    { name: "Compliance Inspector", desc: "Author studio & visual linting", href: "/dashboard/creator", icon: CheckSquare, badge: "Author", role: "creator" as UserRole },
    { name: "Approval Pipeline", desc: "Review drafts & enforce policy", href: "/dashboard/brand-manager", icon: Layers, badge: "2 Pending", role: "brand-manager" as UserRole },
    { name: "Security & RBAC", desc: "Governance parameters & audit log", href: "/dashboard/admin", icon: Users, badge: "Admin", role: "admin" as UserRole },
    { name: "Active Drafts", desc: "Manage & edit saved drafts", href: "/dashboard/drafts", icon: FileText, badge: "3 Active", role: activeRole },
    { name: "Brand Rulebook", desc: "Multi-brand voice guidelines", href: "/dashboard/rulebook", icon: BookOpen, badge: "Rulebook", role: activeRole },
    { name: "Database Studio", desc: "Live table records & schemas", href: "/dashboard/database", icon: Database, badge: "Live DB", role: "admin" as UserRole },
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
                    ECLIPSE AI
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
            <AiEngineStatusBadge />
            <DatabaseStatusBadge />

            {/* Quick Interactive Workspace Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                title="Switch Dashboard Workspace"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{currentMeta.label}</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>

              {workspaceMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setWorkspaceMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-1.5 space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Dashboard
                    </div>
                    <button
                      onClick={() => handleSwitchWorkspace("creator", "/dashboard/creator")}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                        activeRole === "creator"
                          ? "bg-blue-50 text-blue-800 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                      <div>
                        <div>Author Studio</div>
                        <div className="text-[10px] text-slate-400 font-normal">Content & Image Linter</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSwitchWorkspace("brand-manager", "/dashboard/brand-manager")}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                        activeRole === "brand-manager"
                          ? "bg-purple-50 text-purple-800 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Layers className="h-4 w-4 text-purple-600" />
                      <div>
                        <div>Brand Manager</div>
                        <div className="text-[10px] text-slate-400 font-normal">Approval Queue & Voice</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSwitchWorkspace("admin", "/dashboard/admin")}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                        activeRole === "admin"
                          ? "bg-emerald-50 text-emerald-800 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Users className="h-4 w-4 text-emerald-600" />
                      <div>
                        <div>Security & Admin</div>
                        <div className="text-[10px] text-slate-400 font-normal">RBAC & Audit Trail</div>
                      </div>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setWorkspaceMenuOpen(false);
                        router.push("/dashboard/database");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-left text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Database className="h-4 w-4 text-cyan-600" />
                      <div>
                        <div>Database Studio</div>
                        <div className="text-[10px] text-slate-400 font-normal">Live Table Inspector</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
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

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
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
                  <span className="font-bold text-sm text-slate-900">ECLIPSE Governance</span>
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

              {/* Navigation Links */}
              <div className="p-4 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Dashboards & Sub-boards
                </div>
                {roleMobileLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => {
                        switchRole(link.role);
                        setMobileMenuOpen(false);
                      }}
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
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                            isActive
                              ? "bg-slate-800 text-slate-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser?.name?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.name || "Active User"}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {currentUser?.department || currentUser?.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
