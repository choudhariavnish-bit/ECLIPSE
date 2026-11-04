"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Sliders,
  ShieldCheck,
  Users,
  Cpu,
  Lock,
  History,
  CheckCircle2,
  AlertOctagon,
  Eye,
  Key,
  Server,
  ToggleLeft,
  ToggleRight,
  Database,
  RefreshCw,
  UserCheck,
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
    email: "alex.creator@inkloom.ai",
    role: "creator",
    department: "Content & Growth",
    lastActive: "10 mins ago",
    status: "active",
  },
  {
    id: "usr-02",
    name: "Sarah Chen",
    email: "sarah.brand@inkloom.ai",
    role: "brand-manager",
    department: "Global Governance",
    lastActive: "2 mins ago",
    status: "active",
  },
  {
    id: "usr-03",
    name: "Marcus Vance",
    email: "marcus.admin@inkloom.ai",
    role: "admin",
    department: "System Architecture",
    lastActive: "Now",
    status: "active",
  },
  {
    id: "usr-04",
    name: "Apex Creative Agency",
    email: "agency-lead@apex.studio",
    role: "creator",
    department: "External Contractor",
    lastActive: "Yesterday",
    status: "active",
  },
];

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  status: "verified" | "flagged";
}

const AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "LOG-551",
    timestamp: "14:28:10",
    actor: "Sarah Chen (Brand Manager)",
    action: "Approved release",
    target: "Q4 Launch Blog Post",
    status: "verified",
  },
  {
    id: "LOG-550",
    timestamp: "13:45:02",
    actor: "AI Governance Guardrail",
    action: "Flagged unsupported claim",
    target: "Social Carousel Slide 2",
    status: "flagged",
  },
  {
    id: "LOG-549",
    timestamp: "11:12:44",
    actor: "Marcus Vance (Admin)",
    action: "Updated OCR sensitivity",
    target: "AWS Textract Pipeline",
    status: "verified",
  },
  {
    id: "LOG-548",
    timestamp: "09:05:19",
    actor: "Alex Morgan (Creator)",
    action: "Submitted for review",
    target: "Security Whitepaper v3",
    status: "verified",
  },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [confidentialityShield, setConfidentialityShield] = useState(true);
  const [humanInLoopEnforced, setHumanInLoopEnforced] = useState(true);
  const [ocrConfidence, setOcrConfidence] = useState(90);
  const [selectedModel, setSelectedModel] = useState("gemini-pro");
  const [dbHealth, setDbHealth] = useState<any>(null);

  useEffect(() => {
    api.checkHealth().then(setDbHealth).catch(() => {});
  }, []);

  const handleToggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              Admin & Enterprise Security
            </span>
            <span className="text-xs text-slate-400">System Infrastructure Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Enterprise Governance Control • Marcus Vance
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Configure access roles, oversee AI/OCR pipelines, protect confidential assets, and audit compliance trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2">
            <Lock className="h-4 w-4 text-emerald-600" />
            <div>
              <div className="text-[11px] font-medium text-emerald-700">Confidentiality Shield</div>
              <div className="text-sm font-bold text-emerald-900">Zero Leakage Enforced</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Pre-Pub Audits</span>
            <Server className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">1,482</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">+18% this month</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Violations Prevented</span>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">264</div>
          <div className="text-[11px] text-slate-500 mt-1">Before hitting public channels</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>OCR & LLM P95 Latency</span>
            <Cpu className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">184 ms</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Streaming enabled</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Confidentiality Leaks</span>
            <Lock className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">0</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">PII masking active</div>
        </div>
      </div>

      {/* Row: AI & OCR Pipeline Settings + Confidentiality Shield */}
      <div id="ai-config" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Model & OCR Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI & OCR Engine Calibration</h3>
              <p className="text-xs text-slate-500">Fine-tune detection sensitivity and model inference</p>
            </div>
            <Cpu className="h-4 w-4 text-emerald-600" />
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label htmlFor="ai-model-select" className="block font-semibold text-slate-700 mb-1">
                Governance LLM Engine
              </label>
              <select
                id="ai-model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="gemini-pro">Gemini 2.5 Flash / Pro (Enterprise RAG + Citations)</option>
                <option value="claude-35">Anthropic Claude 3.5 Sonnet (Nuanced Tone Evaluation)</option>
                <option value="local-llama">On-Premise Guardrail Llama-3-70B (Air-Gapped)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>OCR Text Extraction Confidence Threshold</span>
                <span>{ocrConfidence}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={ocrConfidence}
                onChange={(e) => setOcrConfidence(Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Accept Low-Res Scans (50%)</span>
                <span>Strict High-Res Only (99%)</span>
              </div>
            </div>

            {/* Toggle: Human in the loop */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div>
                <span className="font-semibold text-slate-800 block">Strict Human-in-the-Loop Sign-Off</span>
                <span className="text-[11px] text-slate-500">
                  AI will suggest corrections but can never publish content without an authorized Brand Manager.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHumanInLoopEnforced(!humanInLoopEnforced)}
                className="text-emerald-600 hover:text-emerald-700 focus:outline-none"
              >
                {humanInLoopEnforced ? (
                  <ToggleRight className="h-8 w-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Confidential Brand Materials Protection */}
        <div id="security" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Confidential Materials Protection</h3>
              <p className="text-xs text-slate-500">Zero-leakage policies for unannounced products & trademarks</p>
            </div>
            <Lock className="h-4 w-4 text-emerald-600" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div>
                <span className="font-semibold text-slate-800 block">Automatic PII & Secret Redaction</span>
                <span className="text-[11px] text-slate-500">
                  Strips internal codenames, financial figures, and unreleased trademarks before external API routing.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setConfidentialityShield(!confidentialityShield)}
                className="text-emerald-600 hover:text-emerald-700 focus:outline-none"
              >
                {confidentialityShield ? (
                  <ToggleRight className="h-8 w-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-slate-400" />
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 space-y-1">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                AI Transparency & Disclosure Notice
              </span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                When content reviewed by Inkloom AI is published externally, an immutable verification token is recorded to satisfy regional AI transparency standards without exposing internal IP.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row: User Access Management (RBAC) */}
      <div id="users" className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                User Access & Role-Based Permissions (RBAC)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Control permissions across Creators, Brand Managers, and System Admins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">4 Accounts Configured</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Assigned Role</th>
                <th className="py-3 px-4 font-semibold">Last Active</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{user.department}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        user.role === "creator"
                          ? "bg-blue-100 text-blue-800"
                          : user.role === "brand-manager"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{user.lastActive}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        user.status === "active" ? "text-emerald-700" : "text-slate-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.status === "active" ? "bg-emerald-600" : "bg-slate-400"
                        }`}
                      />
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleUserStatus(user.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {user.status === "active" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row: Immutable Compliance Audit Trail */}
      <div id="audit-logs" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Immutable Governance Audit Log</h3>
            <p className="text-xs text-slate-500">Cryptographically verifiable trail of all reviews, approvals, and AI detections</p>
          </div>
          <History className="h-4 w-4 text-slate-500" />
        </div>

        <div className="space-y-2">
          {AUDIT_LOGS.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-400">{log.timestamp}</span>
                <div>
                  <span className="font-bold text-slate-900">{log.actor}</span>
                  <span className="text-slate-500 ml-1.5">{log.action}:</span>
                  <span className="font-medium text-slate-800 ml-1">&quot;{log.target}&quot;</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-400">{log.id}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    log.status === "verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

