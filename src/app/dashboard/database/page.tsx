"use client";

import React, { useState, useEffect } from "react";
import Link from "@/lib/next-compat/link";
import { useRouter } from "@/lib/next-compat/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { mongoClient } from "@/lib/mongoClient";
import {
  Database,
  Table as TableIcon,
  HardDrive,
  FileJson,
  ShieldCheck,
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
  CheckCircle2,
  Plus,
  Trash2,
  Play,
  Terminal,
  AlertCircle,
  X,
} from "lucide-react";

interface TableMeta {
  name: string;
  label: string;
  description: string;
  icon: any;
  sqliteFields: { name: string; type: string; isPk?: boolean; isFk?: boolean; defaultValue?: string }[];
  mongoSchema: string;
}

const TABLES: TableMeta[] = [
  {
    name: "organizations",
    label: "1. Organizations",
    description: "Enterprise branding settings, corporate tokens, and tenant configurations.",
    icon: Layers,
    sqliteFields: [
      { name: "id", type: "TEXT", isPk: true, defaultValue: "org-new" },
      { name: "name", type: "TEXT", defaultValue: "Acme Corp" },
      { name: "industry", type: "TEXT", defaultValue: "Cloud Software" },
      { name: "branding_settings", type: "JSON / TEXT", defaultValue: '{"primary_color": "#2563EB"}' },
      { name: "created_at", type: "TEXT (ISO 8601)", defaultValue: new Date().toISOString() },
    ],
    mongoSchema: "{ _id, name: String, industry: String, branding: Object, created_at: Date }",
  },
  {
    name: "users",
    label: "2. Users",
    description: "User profiles, roles (creator, brand-manager, admin), and bcrypt credentials.",
    icon: UserCheck,
    sqliteFields: [
      { name: "id", type: "TEXT", isPk: true, defaultValue: "u-new" },
      { name: "organization_id", type: "TEXT", isFk: true, defaultValue: "org-01" },
      { name: "name", type: "TEXT", defaultValue: "Jordan Lee" },
      { name: "email", type: "TEXT UNIQUE", defaultValue: "jordan@eclipse.ai" },
      { name: "password", type: "TEXT", defaultValue: "password123" },
      { name: "role", type: "TEXT", defaultValue: "creator" },
      { name: "department", type: "TEXT", defaultValue: "Content Strategy" },
      { name: "status", type: "TEXT", defaultValue: "ACTIVE" },
      { name: "created_at", type: "TEXT (ISO 8601)", defaultValue: new Date().toISOString() },
    ],
    mongoSchema: "{ _id, name: String, email: String, role: String, department: String, status: String }",
  },
  {
    name: "guidelines",
    label: "3. Guidelines",
    description: "Corporate editorial charters, voice definitions, and governance versions.",
    icon: FileText,
    sqliteFields: [
      { name: "id", type: "TEXT", isPk: true, defaultValue: "g-new" },
      { name: "organization_id", type: "TEXT", isFk: true, defaultValue: "org-01" },
      { name: "title", type: "TEXT", defaultValue: "Enterprise Voice Charter" },
      { name: "content", type: "TEXT", defaultValue: "All enterprise materials must remain authoritative and factual." },
      { name: "version", type: "TEXT", defaultValue: "1.0.0" },
      { name: "created_at", type: "TEXT", defaultValue: new Date().toISOString() },
    ],
    mongoSchema: "{ _id, organization_id, title: String, content: String, version: String }",
  },
  {
    name: "rules",
    label: "4. Rules",
    description: "Automated inspection rules: tone, claim verification, terminology, and legal.",
    icon: ShieldCheck,
    sqliteFields: [
      { name: "id", type: "TEXT", isPk: true, defaultValue: "r-new" },
      { name: "guideline_id", type: "TEXT", isFk: true, defaultValue: "g-01" },
      { name: "brand_id", type: "TEXT", defaultValue: "brand-eclipse" },
      { name: "rule_type", type: "TEXT", defaultValue: "claim" },
      { name: "name", type: "TEXT", defaultValue: "No Uninsurable Claims" },
      { name: "description", type: "TEXT", defaultValue: "Never claim zero defect infallibility." },
      { name: "severity", type: "TEXT", defaultValue: "critical" },
      { name: "pattern", type: "TEXT", defaultValue: "100% bug-free" },
      { name: "replacement", type: "TEXT", defaultValue: "enterprise-grade verified resilience" },
      { name: "is_enabled", type: "INTEGER (0 or 1)", defaultValue: "1" },
      { name: "created_at", type: "TEXT", defaultValue: new Date().toISOString() },
    ],
    mongoSchema: "{ _id, brand_id, rule_type: String, name: String, severity: String, pattern: String }",
  },
  {
    name: "drafts",
    label: "5. Drafts",
    description: "Author articles, campaigns, and creatives undergoing governance auditing.",
    icon: FileText,
    sqliteFields: [
      { name: "id", type: "TEXT", isPk: true, defaultValue: "d-new" },
      { name: "user_id", type: "TEXT", isFk: true, defaultValue: "u-01" },
      { name: "brand", type: "TEXT", defaultValue: "ECLIPSE Global Enterprises" },
      { name: "author", type: "TEXT", defaultValue: "Alex Morgan" },
      { name: "title", type: "TEXT", defaultValue: "Q1 Global AI Roadmap" },
      { name: "content", type: "TEXT", defaultValue: "Enterprise cloud deployment whitepaper." },
      { name: "channel", type: "TEXT", defaultValue: "Blog & Press" },
      { name: "format", type: "TEXT", defaultValue: "Whitepaper" },
      { name: "status", type: "TEXT", defaultValue: "draft" },
      { name: "drift_score", type: "INTEGER", defaultValue: "12" },
      { name: "created_at", type: "TEXT", defaultValue: new Date().toISOString() },
      { name: "updated_at", type: "TEXT", defaultValue: new Date().toISOString() },
    ],
    mongoSchema: "{ _id, title: String, content: String, channel: String, status: String, drift_score: Number }",
  },
  {
    name: "findings",
    label: "6. Findings",
    description: "Flagged policy infractions, uninsurable claims, and suggested fixes.",
    icon: ShieldCheck,
    sqliteFields: [
      { name: "id", type: "TEXT", isPk: true, defaultValue: "f-new" },
      { name: "draft_id", type: "TEXT", isFk: true, defaultValue: "d-001" },
      { name: "issue", type: "TEXT", defaultValue: "Absolute superlative claim" },
      { name: "severity", type: "TEXT", defaultValue: "critical" },
      { name: "suggestion", type: "TEXT", defaultValue: "enterprise-grade verified resilience" },
      { name: "status", type: "TEXT", defaultValue: "pending" },
      { name: "created_at", type: "TEXT", defaultValue: new Date().toISOString() },
    ],
    mongoSchema: "{ _id, draft_id, issue: String, severity: String, suggestion: String, status: String }",
  },
  {
    name: "audit_logs",
    label: "7. Audit Logs",
    description: "Immutable, tamper-evident audit ledger of all corporate activity.",
    icon: Database,
    sqliteFields: [
      { name: "id", type: "TEXT", isPk: true, defaultValue: "a-new" },
      { name: "user_id", type: "TEXT", defaultValue: "u-03" },
      { name: "user_name", type: "TEXT", defaultValue: "Marcus Vance" },
      { name: "action", type: "TEXT", defaultValue: "MANUAL_RECORD_INSERT" },
      { name: "entity", type: "TEXT", defaultValue: "Database Studio" },
      { name: "status", type: "TEXT", defaultValue: "VERIFIED" },
      { name: "ip_address", type: "TEXT", defaultValue: "127.0.0.1" },
      { name: "details", type: "TEXT", defaultValue: "Live SQLite & MongoDB transaction." },
      { name: "timestamp", type: "TEXT", defaultValue: new Date().toISOString() },
    ],
    mongoSchema: "{ _id, user: String, action: String, entity: String, ip: String, timestamp: Date }",
  },
];

export default function DatabaseStudioPage() {
  const router = useRouter();
  const { activeRole, isAuthenticated } = useAuthStore();

  const [selectedTable, setSelectedTable] = useState("users");
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"data" | "query" | "schema" | "connection">("data");
  const [searchFilter, setSearchFilter] = useState("");

  // Add Record Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // SQL Query Playground state
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users ORDER BY rowid DESC LIMIT 10;");
  const [queryRunning, setQueryRunning] = useState(false);
  const [queryOutput, setQueryOutput] = useState<any>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [mongoUriInput, setMongoUriInput] = useState("");
  const [mongoStatus, setMongoStatus] = useState<string | null>(null);

  const currentMeta = TABLES.find((t) => t.name === selectedTable) || TABLES[0];

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTableData = async (table: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/database/tables?table=${table}`);
      const data = await res.json();
      setTableData(data.rows || []);
    } catch {
      // Fallback to browser Mongo client collection
      const mongoRows = await mongoClient.db.collection(table).find();
      setTableData(mongoRows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(selectedTable);
    // Initialize form defaults for current table
    const initialForm: Record<string, string> = {};
    currentMeta.sqliteFields.forEach((f) => {
      initialForm[f.name] = f.defaultValue || "";
    });
    setFormData(initialForm);
  }, [selectedTable]);

  // Handle Add Record submit
  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Insert into SQLite via API
      const res = await fetch("/api/database/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: selectedTable, data: formData }),
      });
      const resData = await res.json();

      if (!res.ok || resData.error) {
        throw new Error(resData.error || "Failed to insert record into SQLite");
      }

      // 2. Also insert into browser MongoDB client collection
      await mongoClient.db.collection(selectedTable).insertOne(formData);

      showToast(`Record successfully saved to SQLite3 (${selectedTable}) & synced to MongoDB!`);
      setIsAddModalOpen(false);
      await fetchTableData(selectedTable);
    } catch (err: any) {
      showToast(err.message || "Insert failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Record
  const handleDeleteRecord = async (id: string) => {
    if (!confirm(`Are you sure you want to permanently delete record "${id}" from ${selectedTable}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/database/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: selectedTable, id }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to delete from SQLite");
      }

      // Delete from browser Mongo collection
      await mongoClient.db.collection(selectedTable).deleteOne({ id });

      showToast(`Record "${id}" deleted from database.`);
      await fetchTableData(selectedTable);
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  // Handle Execute SQL Query
  const handleExecuteSql = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    if (!q.trim()) return;

    setQueryRunning(true);
    setQueryOutput(null);

    try {
      const res = await fetch("/api/database/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: q }),
      });
      const data = await res.json();
      setQueryOutput(data);

      if (data.success) {
        showToast("Query executed successfully on database/governance.sqlite!");
        // Refresh table data if it was an INSERT/UPDATE/DELETE
        if (!q.trim().toUpperCase().startsWith("SELECT")) {
          fetchTableData(selectedTable);
        }
      } else {
        showToast(data.error || "Query failed", "error");
      }
    } catch (err: any) {
      setQueryOutput({ success: false, error: err.message });
      showToast(err.message || "Network error", "error");
    } finally {
      setQueryRunning(false);
    }
  };

  // Quick Seed Helpers
  const handleQuickAdd = async (type: "user" | "draft" | "rule") => {
    const ts = Date.now().toString().slice(-4);
    if (type === "user") {
      const payload = {
        id: `u-live-${ts}`,
        organization_id: "org-01",
        name: `Team Member ${ts}`,
        email: `member.${ts}@eclipse.ai`,
        password: "password123",
        role: "creator",
        department: "Marketing Ops",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      };
      await fetch("/api/database/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "users", data: payload }),
      });
      setSelectedTable("users");
      await fetchTableData("users");
      showToast(`Added live user "member.${ts}@eclipse.ai" to SQLite database!`);
    } else if (type === "draft") {
      const payload = {
        id: `d-live-${ts}`,
        user_id: "u-01",
        brand: "ECLIPSE Global Enterprises",
        author: "Alex Morgan",
        title: `Q${ts.slice(-1)} Strategic Product Brief`,
        content: "Enterprise cloud automated governance overview.",
        channel: "LinkedIn & Social",
        format: "Article",
        status: "review_pending",
        drift_score: 14,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await fetch("/api/database/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "drafts", data: payload }),
      });
      setSelectedTable("drafts");
      await fetchTableData("drafts");
      showToast(`Added live draft "d-live-${ts}" to SQLite database!`);
    } else if (type === "rule") {
      const payload = {
        id: `r-live-${ts}`,
        guideline_id: "g-01",
        brand_id: "brand-eclipse",
        rule_type: "claim",
        name: `Policy Rule #${ts}`,
        description: "Zero defect infallibility restriction.",
        severity: "critical",
        pattern: "never fails",
        replacement: "empirically tested high resilience",
        is_enabled: 1,
        created_at: new Date().toISOString(),
      };
      await fetch("/api/database/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "rules", data: payload }),
      });
      setSelectedTable("rules");
      await fetchTableData("rules");
      showToast(`Added live rule "r-live-${ts}" to SQLite database!`);
    }
  };

  const handleConnectMongo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUriInput.trim()) return;
    const res = await mongoClient.connect(mongoUriInput.trim());
    setMongoStatus(`Connected to: ${res.uri}`);
    setMongoUriInput("");
    showToast(`MongoDB client configured: ${res.uri}`);
  };

  const filteredData = tableData.filter((row) => {
    if (!searchFilter.trim()) return true;
    return JSON.stringify(row).toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold animate-in slide-in-from-top border ${
            toast.type === "success"
              ? "bg-emerald-950 text-emerald-200 border-emerald-700"
              : "bg-red-950 text-red-200 border-red-700"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
              Dual Database Engine
            </span>
            <span className="text-xs text-slate-500">SQLite3 (Offline File) + MongoDB (Browser Documents)</span>
            <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 font-bold border border-emerald-200">
              Live Read & Write Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Governance Database Studio
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real offline disk persistence via SQLite3 (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">database/governance.sqlite</code>) paired with live MongoDB collections.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickAdd("user")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs"
            title="Immediately insert a new live user row into SQLite"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Quick Add User</span>
          </button>
          <button
            onClick={() => handleQuickAdd("draft")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors shadow-2xs"
            title="Immediately insert a new live draft into SQLite"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Quick Add Draft</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Insert Record</span>
          </button>
          <button
            onClick={() => fetchTableData(selectedTable)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Dual Database Status Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SQLite Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <HardDrive className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">SQLite 3 (Local Offline File DB)</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> READ & WRITE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
              Path: database/governance.sqlite
            </p>
            <div className="text-[10px] text-slate-400 mt-1">
              Zero cloud accounts • Disk write on every update • WAL transactional safety
            </div>
          </div>
        </div>

        {/* MongoDB Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <FileJson className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">MongoDB (Browser Document Store)</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> SYNCED
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
              Engine: LocalStorage / Browser Collections
            </p>
            <div className="text-[10px] text-slate-400 mt-1">
              db.collection().insertOne() • updateOne() • find() • NoSQL persistence
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Body: Sidebar + Table View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Collections & Tables List */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Collections & Tables (7)
          </div>
          {TABLES.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTable === t.name;
            return (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-md"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                }`}
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{t.label}</span>
                    {isSelected && (
                      <span className="text-[10px] font-mono bg-blue-600/30 text-blue-300 px-1.5 py-0.2 rounded">
                        {tableData.length} rows
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                    {t.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Records / SQL Playground / Schema / Config */}
        <div className="lg:col-span-3 space-y-4">
          {/* Sub-Tab Navigation */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("data")}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === "data"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Live Records ({tableData.length})
            </button>
            <button
              onClick={() => setActiveTab("query")}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "query"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SQL & Query Playground</span>
            </button>
            <button
              onClick={() => setActiveTab("schema")}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === "schema"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              SQLite DDL & Mongo Schema
            </button>
            <button
              onClick={() => setActiveTab("connection")}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === "connection"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Offline Engine & Mongo URI
            </button>
          </div>

          {/* TAB 1: Live Records Table */}
          {activeTab === "data" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder={`Filter records in table "${selectedTable}"...`}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-500" />
                  Reading SQLite database file & Mongo store...
                </div>
              ) : filteredData.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200 space-y-3">
                  <div>No records found in table "{selectedTable}".</div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Insert First Record
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                      <tr>
                        <th className="p-3 font-bold font-mono text-[11px] text-slate-600 whitespace-nowrap w-12 text-center">
                          Action
                        </th>
                        {Object.keys(filteredData[0] || {}).map((key) => (
                          <th key={key} className="p-3 font-bold font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredData.map((row, idx) => (
                        <tr key={row.id || row._id || idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteRecord(row.id || row._id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete record from SQLite & MongoDB"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          {Object.keys(filteredData[0] || {}).map((key) => {
                            const val = row[key];
                            const display = typeof val === "object" ? JSON.stringify(val) : String(val ?? "—");
                            return (
                              <td key={key} className="p-3 font-mono text-[11px] text-slate-600 max-w-xs truncate" title={display}>
                                {display}
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

          {/* TAB 2: SQL & Mongo Query Playground */}
          {activeTab === "query" && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs text-xs">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  <span>SQLite 3 Live SQL Query Playground</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Execute direct SQL queries (<code className="font-mono text-blue-600">SELECT</code>, <code className="font-mono text-emerald-600">INSERT</code>, <code className="font-mono text-amber-600">UPDATE</code>, <code className="font-mono text-red-600">DELETE</code>) directly against <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">database/governance.sqlite</code>.
                </p>
              </div>

              {/* Preset SQL Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 self-center">Presets:</span>
                <button
                  onClick={() => {
                    setSqlQuery("SELECT * FROM users ORDER BY rowid DESC;");
                    handleExecuteSql("SELECT * FROM users ORDER BY rowid DESC;");
                  }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] transition-colors"
                >
                  SELECT users
                </button>
                <button
                  onClick={() => {
                    setSqlQuery("SELECT * FROM drafts ORDER BY rowid DESC;");
                    handleExecuteSql("SELECT * FROM drafts ORDER BY rowid DESC;");
                  }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] transition-colors"
                >
                  SELECT drafts
                </button>
                <button
                  onClick={() => {
                    setSqlQuery("SELECT * FROM rules;");
                    handleExecuteSql("SELECT * FROM rules;");
                  }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] transition-colors"
                >
                  SELECT rules
                </button>
                <button
                  onClick={() => {
                    const id = "u-" + Date.now().toString().slice(-4);
                    const q = `INSERT INTO users (id, organization_id, name, email, password, role, department, status) VALUES ('${id}', 'org-01', 'Test User', '${id}@eclipse.ai', '123', 'creator', 'Marketing', 'ACTIVE');`;
                    setSqlQuery(q);
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-mono text-[10px] transition-colors border border-emerald-200"
                >
                  Preset INSERT user
                </button>
                <button
                  onClick={() => {
                    setSqlQuery("SELECT count(*) as total_users FROM users;");
                    handleExecuteSql("SELECT count(*) as total_users FROM users;");
                  }}
                  className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-[10px] transition-colors border border-blue-200"
                >
                  COUNT(*) users
                </button>
              </div>

              {/* SQL Textarea */}
              <div className="space-y-2">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={4}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-lg border border-slate-700 focus:outline-hidden focus:border-blue-500 shadow-inner"
                  placeholder="Enter any SQL query (e.g., SELECT * FROM users;)"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">
                    Target: <span className="font-mono text-slate-700">database/governance.sqlite</span> (Node 24 native DatabaseSync)
                  </span>
                  <button
                    onClick={() => handleExecuteSql()}
                    disabled={queryRunning}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${queryRunning ? "animate-spin" : ""}`} />
                    <span>{queryRunning ? "Executing..." : "Execute Query"}</span>
                  </button>
                </div>
              </div>

              {/* Query Output */}
              {queryOutput && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">Query Result Output:</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {queryOutput.count !== undefined ? `${queryOutput.count} records returned` : queryOutput.changes !== undefined ? `${queryOutput.changes} row(s) affected` : ""}
                    </span>
                  </div>
                  <pre className="bg-slate-950 text-slate-200 p-4 rounded-lg font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800 shadow-inner">
                    {JSON.stringify(queryOutput, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Schema */}
          {activeTab === "schema" && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-xs text-slate-700 shadow-2xs">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">SQLite3 Relational Schema</h3>
                <p className="text-[11px] text-slate-500">Stored in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">database/governance.sqlite</code></p>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                {currentMeta.sqliteFields.map((f, i) => (
                  <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{f.name}</span>
                      {f.isPk && <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-bold">PRIMARY KEY</span>}
                      {f.isFk && <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-[9px] font-bold">FOREIGN KEY</span>}
                    </div>
                    <code className="text-blue-600 font-mono text-[11px] bg-blue-50 px-2 py-0.5 rounded">{f.type}</code>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <h3 className="font-bold text-slate-900 text-sm mb-1">MongoDB Document Model</h3>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {currentMeta.mongoSchema}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Connection & Mongo URI */}
          {activeTab === "connection" && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-xs text-slate-700 shadow-2xs">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Offline Database Engine & Mongo Configuration</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Your project operates 100% offline using native SQLite3 and browser MongoDB collections.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/50 space-y-1">
                <span className="font-bold text-blue-900">Local SQLite File Database</span>
                <p className="text-blue-800 text-[11px]">
                  All tables are written to <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[10px] border border-blue-200">database/governance.sqlite</code>. No external server, port, or cloud account is required.
                </p>
              </div>

              <form onSubmit={handleConnectMongo} className="space-y-3 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Connect External MongoDB URI (Optional):
                  </label>
                  <input
                    type="text"
                    value={mongoUriInput}
                    onChange={(e) => setMongoUriInput(e.target.value)}
                    placeholder="mongodb://localhost:27017/inkloom or mongodb+srv://..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-2xs"
                >
                  Save MongoDB URI
                </button>
                {mongoStatus && (
                  <p className="text-emerald-700 font-semibold text-xs mt-1">{mongoStatus}</p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Insert Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Insert Record into "{selectedTable}"
                </h3>
                <p className="text-[11px] text-slate-500">
                  Writes directly to <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">database/governance.sqlite</code> & browser MongoDB collection.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-3">
              {currentMeta.sqliteFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {field.name}
                    <span className="ml-1 text-[10px] font-mono text-slate-400 font-normal">
                      ({field.type})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
                    placeholder={`Enter ${field.name}...`}
                    required={field.isPk || field.name === "name" || field.name === "email" || field.name === "title"}
                  />
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? "Saving to Database..." : "Save to Database"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
