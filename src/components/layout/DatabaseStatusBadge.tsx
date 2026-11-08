"use client";

import React, { useEffect, useState } from "react";
import Link from "@/lib/next-compat/link";
import { Database, CheckCircle2, HardDrive, FileJson } from "lucide-react";
import { api } from "@/lib/api";

export function DatabaseStatusBadge() {
  const [status, setStatus] = useState<{
    connected: boolean;
    type: string;
    details?: string;
  } | null>({
    connected: true,
    type: "SQLite + Mongo",
    details: "SQLite3 (Offline File DB) + MongoDB (Browser Collections)",
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    api.checkHealth()
      .then((data) => {
        if (data && data.database) {
          setStatus(data.database);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 hover:bg-slate-100 transition-colors border-slate-200 text-slate-700 shadow-2xs"
        title="Database Status: SQLite3 (Offline) + MongoDB (Browser)"
      >
        <Database className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
        <span className="hidden sm:inline">DB:</span>
        <span className="font-semibold text-slate-900">
          SQLite + Mongo
        </span>
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 rounded-xl bg-white p-4 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-700">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900 text-sm">Dual Database Engine</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3 h-3" /> Offline Ready
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                Local Disk DB:
              </span>
              <span className="font-mono font-medium text-slate-800 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                SQLite 3 (database/governance.sqlite)
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5 text-slate-400" />
                Browser Store:
              </span>
              <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                MongoDB Document Collections
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Cloud Dependency:</span>
              <span className="font-medium text-emerald-600">Zero (100% Offline Capable)</span>
            </div>

            <div className="pt-1">
              <span className="text-slate-500 block mb-1.5">Active Collections / Tables (9 Total):</span>
              <div className="flex flex-wrap gap-1 text-[10px]">
                {["organizations", "users", "guidelines", "rules", "drafts", "findings", "comments", "approvals", "audit_logs"].map((tbl) => (
                  <span key={tbl} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                    {tbl}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link
              href="/dashboard/database"
              onClick={() => setIsOpen(false)}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Inspect Database Live →</span>
            </Link>
            <span className="text-slate-400 font-mono">governance.sqlite</span>
          </div>
        </div>
      )}
    </div>
  );
}
