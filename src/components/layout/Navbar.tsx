"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";
import {
  ShieldCheck,
  LogOut,
  ChevronDown,
  User as UserIcon,
  CheckCircle2,
  Menu,
  X,
  FileText,
  BookOpen,
  CheckSquare,
  Layers,
  Database,
  ArrowRight,
} from "lucide-react";
import { DatabaseStatusBadge } from "./DatabaseStatusBadge";

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
  const pathname = usePathname();
  const { currentUser, activeRole, switchRole, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push(ROLE_META[role].path);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const currentMeta = ROLE_META[activeRole] || ROLE_META.creator;

  const MOBILE_LINKS = [
    {
      name: "Compliance Inspector",
      desc: "Audit content against brand rules & tone",
      href: "/dashboard/creator",
      icon: CheckSquare,
      badge: "Real-time",
    },
    {
      name: "Active Drafts",
      desc: "Manage & open active team articles",
      href: "/dashboard/drafts",
      icon: FileText,
      badge: "4 Active",
    },
    {
      name: "Brand Rulebook",
      desc: "Multi-brand voice, claims & legal rules",
      href: "/dashboard/rulebook",
      icon: BookOpen,
      badge: "Multi-Brand",
    },
    {
      name: "Approval Pipeline",
      desc: "Review and sign off on pending drafts",
      href: "/dashboard/brand-manager",
      icon: Layers,
      badge: "3 Pending",
    },
    {
      name: "Database Studio",
      desc: "Inspect live tables, records & schema",
      href: "/dashboard/database",
      icon: Database,
      badge: "Live DB",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
        <div className="flex h-14 items-center justify-between px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Left: Mobile Menu Toggle & Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link
              href="/dashboard/creator"
              className="flex items-center gap-2 font-semibold text-slate-900 group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-slate-900">
                    Inkloom AI
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-mono font-semibold text-slate-600 border border-slate-200">
                    ENTERPRISE
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <DatabaseStatusBadge />

            {/* Quick Persona Switcher (Desktop) */}
            <div className="relative hidden sm:block">
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
                    <span>Switch Persona</span>
                  </Link>
                </div>
              )}
            </div>

            {/* User pill & sign out */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden md:block text-right">
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

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-start">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
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

              {/* Workspaces Section */}
              <div className="p-4 border-b border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Workspaces
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {(["creator", "brand-manager", "admin"] as UserRole[]).map((role) => {
                    const meta = ROLE_META[role];
                    const isActive = activeRole === role;
                    return (
                      <button
                        key={role}
                        onClick={() => handleRoleSwitch(role)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{meta.label}</span>
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct Navigation Links */}
              <div className="p-4 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Navigation
                </div>
                {MOBILE_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-blue-50/80 border border-blue-200 text-blue-900"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div
                        className={`mt-0.5 p-1.5 rounded-lg ${
                          isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{link.name}</span>
                          {link.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                              {link.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {link.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                    AM
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {currentUser?.name || "Alex Morgan"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {currentUser?.department || "Content & Growth"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs text-red-600 font-semibold hover:text-red-700"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                <span>Switch 3D Persona</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
