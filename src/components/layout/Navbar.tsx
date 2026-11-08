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
  TrendingUp,
} from "lucide-react";
import { DatabaseStatusBadge } from "./DatabaseStatusBadge";
import { AiEngineStatusBadge } from "./AiEngineStatusBadge";

const ROLE_META: Record<
  UserRole,
  { label: string; badgeClass: string; path: string }
> = {
  creator: {
    label: "Author Studio",
    badgeClass: "first-color text-stone-900 border first-color-border font-bold shadow-2xs",
    path: "/dashboard/creator",
  },
  "brand-manager": {
    label: "Brand Manager",
    badgeClass: "second-color text-stone-900 border second-color-border font-bold shadow-2xs",
    path: "/dashboard/brand-manager",
  },
  admin: {
    label: "Security & Admin",
    badgeClass: "third-color text-stone-900 border third-color-border font-bold shadow-2xs",
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
    { name: "Impact & Benefits", desc: "Architecture, ROI & benchmarks", href: "/dashboard/benefits", icon: TrendingUp, badge: "ROI", role: activeRole },
    { name: "Database Studio", desc: "Live table records & schemas", href: "/dashboard/database", icon: Database, badge: "Live DB", role: "admin" as UserRole },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#f2ead8] bg-[#fafaf6]/95 backdrop-blur-md shadow-xs">
        <div className="flex h-14 items-center justify-between px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Left: Mobile Menu Toggle & Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-stone-700 hover:bg-[#ffebbb]/60 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link
              href={`/dashboard/${activeRole}`}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffcab0] text-stone-900 border border-[#f7a077] shadow-xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-4 w-4 text-stone-900" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-stone-900">
                    ECLIPSE
                  </span>
                  <span className="rounded-full bg-[#e0ffcd] px-1.5 py-0.2 text-[9px] font-bold text-stone-900 border border-[#b7e89e]">
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#ffebbb] bg-white/90 hover:bg-[#ffebbb]/40 text-xs font-semibold text-stone-800 transition-colors shadow-2xs"
                title="Switch Dashboard Workspace"
              >
                <span className="h-2 w-2 rounded-full bg-[#e0ffcd] border border-[#b7e89e]" />
                <span>{currentMeta.label}</span>
                <ChevronDown className="h-3 w-3 text-stone-500" />
              </button>

              {workspaceMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setWorkspaceMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#ffebbb] shadow-xl z-50 p-1.5 space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Switch Dashboard
                    </div>
                    <button
                      onClick={() => handleSwitchWorkspace("creator", "/dashboard/creator")}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                        activeRole === "creator"
                          ? "bg-[#e0ffcd] text-stone-900 font-bold border border-[#b7e89e]"
                          : "text-stone-700 hover:bg-[#fdffcd]"
                      }`}
                    >
                      <CheckSquare className="h-4 w-4 text-emerald-800" />
                      <div>
                        <div>Author Studio</div>
                        <div className="text-[10px] text-stone-500 font-normal">Content & Image Linter</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSwitchWorkspace("brand-manager", "/dashboard/brand-manager")}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                        activeRole === "brand-manager"
                          ? "bg-[#ffebbb] text-stone-900 font-bold border border-[#f2cb7e]"
                          : "text-stone-700 hover:bg-[#fdffcd]"
                      }`}
                    >
                      <Layers className="h-4 w-4 text-amber-800" />
                      <div>
                        <div>Brand Manager</div>
                        <div className="text-[10px] text-stone-500 font-normal">Approval Queue & Voice</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSwitchWorkspace("admin", "/dashboard/admin")}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                        activeRole === "admin"
                          ? "bg-[#ffcab0] text-stone-900 font-bold border border-[#f7a077]"
                          : "text-stone-700 hover:bg-[#fdffcd]"
                      }`}
                    >
                      <Users className="h-4 w-4 text-orange-900" />
                      <div>
                        <div>Security & Admin</div>
                        <div className="text-[10px] text-stone-500 font-normal">RBAC & Audit Trail</div>
                      </div>
                    </button>
                    <div className="border-t border-[#ffebbb] my-1" />
                    <button
                      onClick={() => {
                        setWorkspaceMenuOpen(false);
                        router.push("/dashboard/database");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-left text-stone-700 hover:bg-[#ffcab0]/40 transition-colors"
                    >
                      <Database className="h-4 w-4 text-stone-800" />
                      <div>
                        <div>Database Studio</div>
                        <div className="text-[10px] text-stone-500 font-normal">Live Table Inspector</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setWorkspaceMenuOpen(false);
                        router.push("/dashboard/benefits");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-left text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <div>
                        <div>Impact &amp; Benefits</div>
                        <div className="text-[10px] text-slate-400 font-normal">Architecture &amp; Metrics</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setWorkspaceMenuOpen(false);
                        router.push("/dashboard/benefits");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-left text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <div>
                        <div>Impact &amp; Benefits</div>
                        <div className="text-[10px] text-slate-400 font-normal">Architecture &amp; Metrics</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#ffebbb]">
              <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-stone-900">
                  {currentUser?.name || "Logged User"}
                </div>
                <div className="text-[10px] text-stone-500">
                  {currentUser?.department || currentUser?.email || "Workspace"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ffebbb] bg-white hover:bg-[#ffcab0]/50 text-stone-700 hover:text-stone-900 transition-colors shadow-2xs"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#fdffcd] border-r border-[#ffebbb] shadow-2xl p-4 flex flex-col justify-between z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#ffebbb]">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#ffcab0] text-stone-900 border border-[#f7a077] flex items-center justify-center font-bold">
                    E
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900">ECLIPSE Governance</div>
                    <div className="text-[10px] text-stone-500">{currentMeta.label}</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-stone-500 hover:bg-[#ffebbb]/60"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Navigation
                </div>
                {roleMobileLinks
                  .filter((item) => activeRole === "admin" || item.role === activeRole || item.href === "/dashboard/drafts" || item.href === "/dashboard/rulebook")
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          isActive
                            ? "bg-[#ffcab0] text-stone-950 border border-[#f7a077]"
                            : "text-stone-700 hover:bg-[#ffebbb]/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/70 font-mono text-stone-700">
                          {item.badge}
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#ffebbb]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white border border-[#ffebbb] text-stone-700 hover:bg-[#ffcab0]/50 text-xs font-bold transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
