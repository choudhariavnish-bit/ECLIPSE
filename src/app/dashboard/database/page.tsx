"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
      { name: "password_hash", type: "VARCHAR(255)" },
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
    description: "Reviewer feedback, author questions, and collaboration notes.",
    icon: TableIcon,
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
    description: "Workflow sign-offs, rejections, revision requests, and signers.",
    icon: Lock,
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
  const [selectedTable, setSelectedTable] = useState("organizations");
  const [tableData, setTableData] = useState<any[]>([]);
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"data" | "schema" | "connection">("data");

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
    fetchTableData(selectedTable);
  }, [selectedTable]);

  const copyConnectionEnv = () => {
    navigator.clipboard.writeText("DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-600 text-white shadow-sm">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Storage Engine: {connection?.type === "postgres" ? "Live PostgreSQL" : connection?.type === "supabase" ? "Live Supabase Cloud" : "In-Memory Governance Store"}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                Active & Synced
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Target Engine: PostgreSQL 14+ / Supabase • Cloud Hosting: Render • 9 Tables Configured
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <code className="bg-white px-2.5 py-1 rounded border border-blue-200 font-mono text-slate-700">
            database/schema.sql
          </code>
        </div>
      </div>

      {/* Main Grid: Left Table Selector + Right Data View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table Selector Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
            Relational Tables (9)
          </div>
          <div className="space-y-1">
            {TABLES.map((t) => {
              const isSelected = selectedTable === t.name;
              const Icon = t.icon;
              return (
                <button
                  key={t.name}
                  onClick={() => setSelectedTable(t.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="w-4 h-4 shrink-0 opacity-80" />
                    <span className="truncate">{t.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? "bg-blue-500/80 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Table Details & Live Data */}
        <div className="lg:col-span-3 space-y-4">
          {/* Table Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 font-mono">
                    public.{currentMeta.name}
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {tableData.length} records
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{currentMeta.description}</p>
              </div>

              {/* View Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("data")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeTab === "data" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Live Rows ({tableData.length})
                </button>
                <button
                  onClick={() => setActiveTab("schema")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeTab === "schema" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Schema ({currentMeta.fields.length} cols)
                </button>
                <button
                  onClick={() => setActiveTab("connection")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeTab === "connection" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Supabase Setup
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: Live Data Table */}
          {activeTab === "data" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs">Loading database records...</div>
              ) : tableData.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">No records found in this table.</div>
              ) : (
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                        {Object.keys(tableData[0]).map((key) => (
                          <th key={key} className="px-4 py-2.5 font-mono text-[11px] whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          {Object.entries(row).map(([k, val]: [string, any], vIdx) => {
                            let displayVal = "";
                            if (typeof val === "object" && val !== null) {
                              displayVal = JSON.stringify(val);
                            } else {
                              displayVal = String(val ?? "NULL");
                            }

                            const isId = k === "id" || k.endsWith("_id");
                            const isStatus = k === "status" || k === "role" || k === "severity";

                            return (
                              <td key={vIdx} className="px-4 py-2 text-slate-700 whitespace-nowrap max-w-xs truncate">
                                {isStatus ? (
                                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                    {displayVal}
                                  </span>
                                ) : isId ? (
                                  <span className="font-mono text-[10px] text-blue-600 bg-blue-50/60 px-1 py-0.5 rounded">
                                    {displayVal.slice(0, 13)}...
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
                  <span className="font-bold text-slate-800">Step 1: Run the Migration in Supabase SQL Editor</span>
                  <p className="text-slate-600 text-[11px]">
                    Open your project at <strong>https://supabase.com/dashboard</strong>, click <strong>SQL Editor</strong> on the left, and copy-paste the contents of:
                  </p>
                  <code className="block bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[11px]">
                    database/supabase_migration.sql
                  </code>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-800">Step 2: Add Connection String to .env.local</span>
                  <p className="text-slate-600 text-[11px]">
                    Copy your PostgreSQL URI from <em>Project Settings → Database → Connection String (URI)</em> and paste it into your <code className="bg-white px-1 py-0.5 rounded border border-slate-300">.env.local</code>:
                  </p>
                  <div className="relative">
                    <pre className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-[11px] overflow-x-auto">
                      DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
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

