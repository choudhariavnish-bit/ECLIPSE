"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  Sliders,
  ShieldCheck,
  Users,
  Cpu,
  Lock,
  History,
  CheckCircle2,
  Search,
  Plus,
  Check,
  Database,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "creator" | "brand-manager" | "admin";
  department: string;
  lastActive: string;
  status: "active" | "suspended";
}

const INITIAL_USERS: AdminUser[] = [
  {
    id: "usr-01",
    name: "Alex Morgan",
    email: "alex.creator@eclipse.ai",
    role: "creator",
    department: "Content & Communications",
    lastActive: "12 mins ago",
    status: "active",
  },
  {
    id: "usr-02",
    name: "Sarah Chen",
    email: "sarah.brand@eclipse.ai",
    role: "brand-manager",
    department: "Global Brand Governance",
    lastActive: "3 mins ago",
    status: "active",
  },
  {
    id: "usr-03",
    name: "Marcus Vance",
    email: "marcus.admin@eclipse.ai",
    role: "admin",
    department: "Information Security",
    lastActive: "Now",
    status: "active",
  },
  {
    id: "usr-04",
    name: "Growth Agency Partner",
    email: "contractor@agency.studio",
    role: "creator",
    department: "External Contractor",
    lastActive: "Yesterday",
    status: "active",
  },
];

interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetResource: string;
  hash: string;
}

const AUDIT_RECORDS: AuditRecord[] = [
  {
    id: "AUD-8821",
    timestamp: "2026-11-04 14:28:10 UTC",
    actor: "Sarah Chen (Brand Manager)",
    action: "Approved release sign-off",
    targetResource: "Q4 Product Launch Announcement",
    hash: "0x8f2c...41e9",
  },
  {
    id: "AUD-8820",
    timestamp: "2026-11-04 13:45:02 UTC",
    actor: "Governance Policy Engine",
    action: "Flagged SEC-4.2 Infraction",
    targetResource: "Social Carousel Slide 2",
    hash: "0x1a4b...99f0",
  },
  {
    id: "AUD-8819",
    timestamp: "2026-11-04 11:12:44 UTC",
    actor: "Marcus Vance (Admin)",
    action: "Calibrated OCR threshold (85%)",
    targetResource: "Vision OCR Pipeline",
    hash: "0x5e3d...77a2",
  },
  {
    id: "AUD-8818",
    timestamp: "2026-11-04 09:05:19 UTC",
    actor: "Alex Morgan (Creator)",
    action: "Submitted for compliance review",
    targetResource: "Security Advisory Note",
    hash: "0x3c7a...22b8",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "security" | "audit">("users");
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [confidentialityShield, setConfidentialityShield] = useState(true);
  const [mandatorySignoff, setMandatorySignoff] = useState(true);
  const [autoEvaluateOnType, setAutoEvaluateOnType] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gemini-pro");
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    api.checkHealth().then(setDbHealth).catch(() => {});
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === "active" ? "suspended" : "active";
          showNotification(`${u.name} status updated to ${newStatus}.`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleRoleChange = (id: string, newRole: "creator" | "brand-manager" | "admin") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
    showNotification("Role assignment updated in directory.");
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Administration</span>
            <span>/</span>
            <span>Security & Governance Suite</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Enterprise Security & Access Control
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Configure access credentials, confidentiality guardrails, and inspect cryptographic audit records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Confidentiality Shield: Enforced</span>
          </span>
        </div>
      </div>

      {/* Glassmorphic Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="RBAC Active Users"
          value={`${users.length} Governed`}
          change={25.0}
          subtitle="enterprise seats"
          icon={Users}
          gradient="from-blue-600 to-indigo-600"
        />
        <StatsCard
          title="Confidentiality Shield"
          value="100% Enforced"
          change={99.9}
          subtitle="zero-data retention"
          icon={ShieldCheck}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Dual Database Engine"
          value="SQLite3 + Mongo"
          change={100}
          subtitle="offline & cloud ready"
          icon={Database}
          gradient="from-cyan-600 to-blue-600"
        />
        <StatsCard
          title="Audit Trail Ledger"
          value="1,420 Records"
          change={18.4}
          subtitle="cryptographic hashes"
          icon={History}
          gradient="from-purple-600 to-pink-600"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Access & RBAC ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Privacy & AI Parameters
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "audit"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Immutable Audit Log
        </button>
      </div>

      {/* Tab 1: Access Control */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Authorized Personnel Directory
              </h2>
              <p className="text-xs text-slate-500">
                Grant authoring and approval permissions across organization workspaces.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <button
                onClick={() => showNotification("Invitation link generated for user.")}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Invite Member
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <div key={user.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{user.name}</span>
                    <span className="text-slate-500 ml-2">{user.email}</span>
                    <div className="text-[11px] text-slate-400">{user.department}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(
                        user.id,
                        e.target.value as "creator" | "brand-manager" | "admin"
                      )
                    }
                    className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="creator">Creator / Author</option>
                    <option value="brand-manager">Brand Manager</option>
                    <option value="admin">System Administrator</option>
                  </select>

                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.status === "active"
                        ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
                        : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                    }`}
                  >
                    {user.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Security & Privacy */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Data Isolation & Privacy Guardrails
            </h2>

            <div className="space-y-3">
              <div className="flex items-start justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Confidentiality Shield (Automatic PII & Secret Redaction)
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Redacts customer names, internal revenue metrics, credentials, and API keys prior to guideline evaluation.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={confidentialityShield}
                  onChange={(e) => setConfidentialityShield(e.target.checked)}
                  className="h-4 w-4 accent-slate-900 cursor-pointer mt-0.5"
                />
              </div>

              <div className="flex items-start justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 block">
                      Intelligent Routing & Escalation Gate (Threshold ≥ 70)
                    </span>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">ACTIVE</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Requires Brand Manager sign-off <strong>only when drift exceeds 70 or on major regulatory violations</strong>. Routine drafts with drift &lt; 70 are autonomously rephrased to 100% (preserving original idea and tone) and cleared for direct posting without human bottleneck.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={mandatorySignoff}
                  onChange={(e) => setMandatorySignoff(e.target.checked)}
                  className="h-4 w-4 accent-slate-900 cursor-pointer mt-0.5"
                />
              </div>

              <div className="flex items-start justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Continuous Real-Time Evaluation
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Runs background compliance analysis as authors draft in the sandbox.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoEvaluateOnType}
                  onChange={(e) => setAutoEvaluateOnType(e.target.checked)}
                  className="h-4 w-4 accent-slate-900 cursor-pointer mt-0.5"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Evaluator Model Selection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: "gemini-pro", name: "Gemini 1.5 Pro", spec: "Low Latency • Multi-Modal OCR" },
                { id: "claude-sonnet", name: "Claude 3.5 Sonnet", spec: "Executive Stylometry & Nuance" },
                { id: "gpt-4o", name: "GPT-4o Enterprise", spec: "Strict Regulatory Matching" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedModel(m.id);
                    showNotification(`Active evaluation model configured to ${m.name}.`);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedModel === m.id
                      ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900/10 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">{m.name}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">{m.spec}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Immutable Audit Log */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Cryptographically Verifiable Audit Ledger
              </h2>
              <p className="text-xs text-slate-500">
                Tamper-evident logs of all author submissions, manager sign-offs, and parameter adjustments.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500">SHA-256 Ledger: Valid</span>
          </div>

          <div className="divide-y divide-slate-100">
            {AUDIT_RECORDS.map((rec) => (
              <div key={rec.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700">{rec.id}</span>
                    <span className="font-semibold text-slate-900">{rec.actor}</span>
                    <span className="text-slate-500">— {rec.action}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Target: {rec.targetResource}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <span className="text-slate-400 font-mono text-[11px]">{rec.timestamp}</span>
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {rec.hash}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
