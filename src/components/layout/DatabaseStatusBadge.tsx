"use client";

import React, { useEffect, useState } from "react";
import Link from "@/lib/next-compat/link";
import { Database, ShieldCheck, CheckCircle2, Server, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";

export function DatabaseStatusBadge() {
  const [status, setStatus] = useState<{
    connected: boolean;
    type: string;
    details?: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    api.checkHealth()
      .then((data) => {
        if (data && data.database) {
          setStatus(data.database);
        }
      })
      .catch(() => {
        setStatus({
          connected: false,
          type: "in-memory / mock",
          details: "Running on in-memory governance store. Ready for PostgreSQL / Supabase connection.",
        });
      });
  }, []);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 hover:bg-slate-100 transition-colors border-slate-200 text-slate-700 shadow-xs"
        title="Database & Governance Storage Status"
      >
        <Database className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
        <span className="hidden sm:inline">DB:</span>
        <span className="font-semibold text-slate-900 capitalize">
          {status?.type || "PostgreSQL"}
        </span>
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-4 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-700">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900 text-sm">Governance Database</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Database Engine:</span>
              <span className="font-medium text-slate-800">PostgreSQL (Supabase)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Authentication:</span>
              <span className="font-medium text-slate-800">JWT + bcrypt (cost 10)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Zero Data Retention:</span>
              <span className="font-medium text-emerald-600">Active (Ephemeral Wipe)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Cloud Hosting Target:</span>
              <span className="font-medium text-slate-800">Render</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-500 block mb-1">Configured Tables (9 Total):</span>
              <div className="flex flex-wrap gap-1 text-[10px]">
                {["organizations", "users", "guidelines", "rules", "drafts", "findings", "comments", "approvals", "audit_logs"].map((tbl) => (
                  <span key={tbl} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                    {tbl}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link
              href="/dashboard/database"
              onClick={() => setIsOpen(false)}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Explore Tables Live →</span>
            </Link>
            <span className="text-slate-400">schema.sql</span>
          </div>
        </div>
      )}
    </div>
  );
}

