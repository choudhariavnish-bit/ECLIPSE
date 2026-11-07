"use client";

import React, { useState, useEffect } from "react";
import Link from "@/lib/next-compat/link";
import { useRouter } from "@/lib/next-compat/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Database,
  Table as TableIcon,
  Server,
  Key,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Search,
  Code2,
  Lock,
  Layers,
  FileText,
  UserCheck,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface TableMeta {
  name: string;
  label: string;
  description: string;
  icon: any;
  fields: { name: string; type: string; isPk?: boolean; isFk?: boolean }[];
}

const TABLES: TableMeta[] = [
  {
    name: "organizations",
    label: "1. Organizations",
    description: "Company information, enterprise branding tokens, and multi-tenant settings.",
    icon: Layers,
    fields: [
      { name: "id", type: "UUID", isPk: true },
      { name: "name", type: "VARCHAR(255)" },
      { name: "industry", type: "VARCHAR(100)" },
      { name: "branding_settings", type: "JSONB" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    name: "users",
    label: "2. Users",
    description: "User profiles, roles (creator, brand-manager, admin), and bcrypt password hashes.",
    icon: UserCheck,
    fields: [
      { name: "id", type: "UUID", isPk: true },
      { name: "organization_id", type: "UUID", isFk: true },
      { name: "name", type: "VARCHAR(255)" },
      { name: "email", type: "VARCHAR(255)" },
      { name: "password", type: "VARCHAR(255)" },
      { name: "role", type: "VARCHAR(50)" },
      { name: "department", type: "VARCHAR(100)" },
    ],
  },
  {
    name: "guidelines",
    label: "3. Brand Guidelines",
    description: "Official enterprise policies, voice codex, and visual standards.",
    icon: FileText,
    fields: [
      { name: "id", type: "UUID", isPk: true },
      { name: "organization_id", type: "UUID", isFk: true },
      { name: "title", type: "VARCHAR(255)" },
      { name: "content", type: "TEXT" },
      { name: "version", type: "VARCHAR(50)" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    name: "rules",
    label: "4. Rules",
    description: "Tone, claim verification, terminology, logo margins, and WCAG AA rules.",
    icon: ShieldCheck,
    fields: [
      { name: "id", type: "UUID", isPk: true },
      { name: "guideline_id", type: "UUID", isFk: true },
      { name: "rule_type", type: "VARCHAR(50)" },
      { name: "name", type: "VARCHAR(255)" },
      { name: "description", type: "TEXT" },
      { name: "severity", type: "VARCHAR(20)" },
      { name: "pattern", type: "TEXT" },
      { name: "replacement", type: "TEXT" },
    ],
  },
  {
    name: "drafts",
    label: "5. Drafts",
    description: "Uploaded articles, social campaigns, and documents undergoing review.",
    icon: FileText,
    fields: [
      { name: "id", type: "UUID", isPk: true },
      { name: "user_id", type: "UUID", isFk: true },
      { name: "title", type: "VARCHAR(255)" },
      { name: "content", type: "TEXT" },
      { name: "channel", type: "VARCHAR(100)" },
      { name: "status", type: "VARCHAR(50)" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    name: "findings",
    label: "6. Findings",
    description: "AI-detected issues, flagged superlatives, and corrective suggestions.",
    icon: ShieldCheck,
    fields: [
      { name: "id", type: "UUID", isPk: true },
      { name: "draft_id", type: "UUID", isFk: true },
      { name: "issue", type: "TEXT" },
      { name: "severity", type: "VARCHAR(20)" },
      { name: "suggestion", type: "TEXT" },
      { name: "status", type: "VARCHAR(50)" },
    ],
  },
  {
    name: "comments",
    label: "7. Comments",
    description: "Reviewer feedback, compliance remarks, and author discussions.",
    icon: FileText,
    fields: [
      { name: "id", type: "UUID", isPk: true },
      { name: "draft_id", type: "UUID", isFk: true },
      { name: "reviewer_id", type: "UUID", isFk: true },
      { name: "comment", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    name: "approvals",
    label: "8. Approvals",
    description: "Sign-offs, cryptographic approval signatures, and publication decisions.",
    icon: ShieldCheck,
    fields: [
      { name: "id", type: "UUID", isPk: true },
      { name: "draft_id", type: "UUID", isFk: true },
      { name: "approved_by", type: "UUID", isFk: true },
      { name: "status", type: "VARCHAR(50)" },
      { name: "timestamp", type: "TIMESTAMPTZ" },
    ],
  },
  {
    name: "audit_logs",
    label: "9. Audit Logs",
    description: "Cryptographically verifiable immutable audit trail of all platform activity.",
    icon: Database,
    fields: [
      { name: "id", type: "UUID", isPk: true },
      { name: "organization_id", type: "UUID", isFk: true },
      { name: "action", type: "VARCHAR(100)" },
      { name: "entity_type", type: "VARCHAR(50)" },
      { name: "details", type: "JSONB" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
];

export default function DatabaseStudioPage() {
  const router = useRouter();
  const { activeRole, isAuthenticated } = useAuthStore();

  const [selectedTable, setSelectedTable] = useState("organizations");
  const [tableData, setTableData] = useState<any[]>([]);
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"data" | "schema" | "connection">("data");

  // Supabase live connect form state
  const [connectUrlInput, setConnectUrlInput] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectStatus, setConnectStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Strict RBAC: Only Admin can access Database Studio
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (activeRole !== "admin") {
      router.replace(`/dashboard/${activeRole}`);
    }
  }, [activeRole, isAuthenticated, router]);

  const currentMeta = TABLES.find((t) => t.name === selectedTable)!;

  const fetchTableData = async (table: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/database/tables?table=${table}`);
      const data = await res.json();
      setTableData(data.rows || []);
      setConnection(data.connection || null);
    } catch {
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeRole === "admin") {
      fetchTableData(selectedTable);
    }
  }, [selectedTable, activeRole]);

  const copyConnectionEnv = () => {
    navigator.clipboard.writeText(
      "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectUrlInput.trim()) return;
    setConnecting(true);
    setConnectStatus(null);
    try {
      const res = await fetch("/api/database/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ databaseUrl: connectUrlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to connect to Supabase");
      }
      setConnectStatus({ success: true, message: data.message });
      setConnectUrlInput("");
      fetchTableData(selectedTable);
    } catch (err: any) {
      setConnectStatus({ success: false, message: err.message });
    } finally {
      setConnecting(false);
    }
  };

  if (activeRole !== "admin") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <h2 className="text-base font-bold">Access Restricted</h2>
        <p className="text-xs text-red-600 mt-1">
          Database Studio is only accessible by System Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
              Database Explorer
            </span>
            <span className="text-xs text-slate-500">PostgreSQL / Supabase Schema Studio</span>
            <span className="rounded bg-amber-100 text-amber-800 text-[10px] font-mono px-2 py-0.5 font-bold border border-amber-200">
              Admin Exclusive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Brand Governance Relational Database
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse tables, inspect live relational records, view schemas, and verify Row Level Security (RLS).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Supabase Console</span>
          </a>
          <button
            onClick={() => fetchTableData(selectedTable)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Connection Status Banner */}
      <div className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        connection?.connected
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-blue-200 bg-blue-50/70"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg text-white shadow-sm ${
            connection?.connected ? "bg-emerald-600" : "bg-blue-600"
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Storage Engine:{" "}
                {connection?.type === "supabase"
                  ? "Live Supabase Cloud"
                  : connection?.type === "postgres"
                  ? "Live PostgreSQL"
                  : "Local / In-Memory Seed Store"}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                connection?.connected
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {connection?.connected ? "Connected to Cloud" : "In-Memory Mode"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {connection?.details || "9 tables configured with full relational integrity."}
              {connection?.endpoint && ` • Endpoint: ${connection.endpoint}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("connection")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Connect Live Supabase</span>
          </button>
        </div>
      </div>

      {/* Live Supabase Connection Assistant (Admin Interactive) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600" />
              <span>Connect Supabase Database</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Paste your Supabase Connection URI below to immediately sync all 9 tables, users, and audit logs to your live Supabase cloud database.
            </p>
          </div>
        </div>

        <form onSubmit={handleConnectSupabase} className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
            value={connectUrlInput}
            onChange={(e) => setConnectUrlInput(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={connecting || !connectUrlInput.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
          >
            {connecting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Connect & Sync Live Supabase</span>
              </>
            )}
          </button>
        </form>

        {connectStatus && (
          <div
            className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
              connectStatus.success
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {connectStatus.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span>{connectStatus.message}</span>
          </div>
        )}
      </div>

      {/* Main Content: Tables Sidebar + Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Table List */}
        <div className="space-y-1 lg:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 pb-2">
            Database Schema Tables (9)
          </div>
          {TABLES.map((table) => {
            const Icon = table.icon;
            const isSelected = selectedTable === table.name;
            return (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white font-bold shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-slate-500"}`} />
                  <span className="truncate">{table.label}</span>
                </div>
                {selectedTable === table.name && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Data Viewer & Schema Inspector */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("data")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "data"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Data Records ({tableData.length})
              </button>
              <button
                onClick={() => setActiveTab("schema")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "schema"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                DDL Schema ({currentMeta.fields.length} Columns)
              </button>
              <button
                onClick={() => setActiveTab("connection")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "connection"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Supabase Setup Guide
              </button>
            </div>

            <span className="text-xs text-slate-500 hidden sm:inline">
              Table: <strong className="text-slate-800 font-mono">{currentMeta.name}</strong>
            </span>
          </div>

          {/* TAB 1: Live Data Records */}
          {activeTab === "data" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{currentMeta.label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{currentMeta.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-xs font-mono font-bold">
                  {tableData.length} records
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Loading relational records...</span>
                </div>
              ) : tableData.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">No records found in this table yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Records will automatically populate as creators author drafts and submit for review.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200">
                      <tr>
                        {currentMeta.fields.map((f) => (
                          <th
                            key={f.name}
                            className="p-3 font-semibold text-slate-700 font-mono text-[11px] whitespace-nowrap"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{f.name}</span>
                              {f.isPk && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-sans">
                                  PK
                                </span>
                              )}
                              {f.isFk && (
                                <span className="text-[9px] bg-purple-100 text-purple-800 px-1 py-0.2 rounded font-sans">
                                  FK
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          {currentMeta.fields.map((f) => {
                            const val = row[f.name];
                            const displayVal =
                              typeof val === "object"
                                ? JSON.stringify(val)
                                : val !== undefined && val !== null
                                ? String(val)
                                : "—";
                            return (
                              <td
                                key={f.name}
                                className="p-3 text-slate-600 font-mono text-[11px] max-w-xs truncate"
                                title={displayVal}
                              >
                                {f.name === "role" || f.name === "status" || f.name === "severity" ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                    {displayVal}
                                  </span>
                                ) : (
                                  displayVal
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Schema Columns */}
          {activeTab === "schema" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Column Definitions for {currentMeta.name}</span>
                <span className="text-slate-400 font-mono">PostgreSQL DDL</span>
              </div>
              <div className="divide-y divide-slate-100">
                {currentMeta.fields.map((f, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-slate-900">{f.name}</span>
                      {f.isPk && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-200">
                          PRIMARY KEY
                        </span>
                      )}
                      {f.isFk && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-100 text-purple-800 border border-purple-200">
                          FOREIGN KEY
                        </span>
                      )}
                    </div>
                    <code className="text-blue-600 font-mono text-[11px] bg-blue-50 px-2 py-0.5 rounded">
                      {f.type}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Supabase Setup Guide */}
          {activeTab === "connection" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs text-slate-700">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">How to view and manage in Supabase</h3>
                <p className="text-slate-500 mt-1">
                  You can connect your own cloud Supabase PostgreSQL database in 2 simple steps:
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-800">Step 1: Get Your Connection String from Supabase</span>
                  <p className="text-slate-600 text-[11px]">
                    Open your project at <strong>https://supabase.com/dashboard</strong>, go to <em>Project Settings → Database → Connection String</em>, choose <strong>URI</strong> mode, and copy it.
                  </p>
                  <code className="block bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[11px]">
                    postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
                  </code>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-800">Step 2: Connect via the Box Above or Edit .env.local</span>
                  <p className="text-slate-600 text-[11px]">
                    Paste the string into the <strong>Connect Supabase Database</strong> box above and click <em>Connect & Sync Live Supabase</em>, or paste it directly into your <code className="bg-white px-1 py-0.5 rounded border border-slate-300">.env.local</code> file:
                  </p>
                  <div className="relative">
                    <pre className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-[11px] overflow-x-auto">
                      DATABASE_URL=postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
                    </pre>
                    <button
                      onClick={copyConnectionEnv}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-sans text-[10px] flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
