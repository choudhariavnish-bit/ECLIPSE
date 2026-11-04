"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  FileText,
  BookOpen,
  Layers,
  Database,
} from "lucide-react";

export const MobileNav = () => {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      name: "Inspector",
      href: "/dashboard/creator",
      icon: CheckSquare,
      badge: null,
    },
    {
      name: "Drafts",
      href: "/dashboard/drafts",
      icon: FileText,
      badge: "4",
    },
    {
      name: "Rulebook",
      href: "/dashboard/rulebook",
      icon: BookOpen,
      badge: null,
    },
    {
      name: "Approvals",
      href: "/dashboard/brand-manager",
      icon: Layers,
      badge: "3",
    },
    {
      name: "Database",
      href: "/dashboard/database",
      icon: Database,
      badge: null,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? "text-blue-600 font-bold bg-blue-50/80 scale-105"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "text-blue-600 stroke-[2.2]" : "text-slate-500"}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-slate-900 text-[8px] font-bold text-white ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

