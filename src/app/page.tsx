"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Shield,
  ShieldCheck,
  Sparkles,
  Database,
  ArrowRight,
  Lock,
  Layers,
  FileCheck2,
  Users,
  CheckCircle2,
  Cpu,
  Terminal,
  Activity,
  Sliders,
  ChevronRight,
  Scale,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { loginAs } = useAuthStore();
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; type: string } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.database) {
          setDbStatus({
            connected: data.database.connected,
            type: data.database.type,
          });
        }
      })
      .catch(() => {
        setDbStatus({ connected: false, type: "mock" });
      });
  }, []);

  const handleLaunchRole = (role: "creator" | "brand-manager" | "admin") => {
    loginAs(role);
    router.push(`/dashboard/${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Inkloom AI</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Pre-Publication Brand Governance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Database Pill */}
            <Link
              href="/dashboard/database"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700 transition-all text-xs font-mono text-slate-300"
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  dbStatus?.connected ? "bg-emerald-400 animate-pulse" : "bg-blue-400"
                }`}
              />
              <Database className="h-3.5 w-3.5 text-slate-400" />
              <span>Database Studio</span>
              <span className="text-[10px] text-slate-500">(9 Tables)</span>
            </Link>

            <Link
              href="/dashboard/rulebook"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Scale className="h-3.5 w-3.5 text-blue-400" />
              Rulebooks
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-600/30 hover:shadow-blue-600/50"
            >
              <span>Sign In / Demo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Glow ambient background lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-blue-400 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-medium text-slate-300">Automated Brand Governance & FTC Compliance</span>
            <span className="h-1 w-1 rounded-full bg-blue-400" />
            <span className="text-slate-400">PostgreSQL / Supabase</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Stop Brand Drift <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Before</span> Publication.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Enterprise pre-publication compliance platform. Reviews marketing copy against registered brand voice,
            prohibited superlative claims, and corporate governance rules in real time.
          </p>

          {/* Quick Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Launch Governance Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard/database"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <Database className="h-4 w-4 text-emerald-400" />
              <span>Inspect Database (9 Tables)</span>
            </Link>
          </div>

          {/* Architecture Highlights Pill */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 text-left">
              <div className="text-xs text-slate-500 uppercase font-mono">Database</div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">PostgreSQL / Supabase</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 9 Relational Tables
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 text-left">
              <div className="text-xs text-slate-500 uppercase font-mono">Security</div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">Zero Data Retention</div>
              <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-1">
                <Lock className="h-3 w-3" /> Ephemeral Processing
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 text-left">
              <div className="text-xs text-slate-500 uppercase font-mono">Authentication</div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">JWT + Bcrypt (Cost 10)</div>
              <div className="text-[11px] text-purple-400 flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3" /> 3-Tier RBAC Access
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 text-left">
              <div className="text-xs text-slate-500 uppercase font-mono">Compliance</div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">FTC & SEC Claims</div>
              <div className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
                <Scale className="h-3 w-3" /> Deterministic Rules
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 1-Click Persona Quick Launchers */}
      <section className="py-12 border-t border-slate-800/60 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">Select an Active Governance Persona</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Test role-based access control, approval hierarchies, and deterministic enforcement in one click.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Persona 1: Creator */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 flex flex-col justify-between hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    Content Creator
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Tier 1</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-4 flex items-center gap-2">
                  Alex Morgan
                </h3>
                <p className="text-xs text-slate-400 mt-1">Content & Growth Marketing</p>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Submits marketing campaigns, drafts blog articles, inspects real-time drift scores, and applies AI corrections.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                    <span>Live Drift Engine (0-100 score)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                    <span>Instant rulebook replacement chips</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleLaunchRole("creator")}
                className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
              >
                <span>Launch Creator Studio</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Persona 2: Brand Manager */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 flex flex-col justify-between hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                    Brand Manager
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Tier 2</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-4 flex items-center gap-2">
                  Sarah Chen
                </h3>
                <p className="text-xs text-slate-400 mt-1">Global Brand & Governance</p>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Controls company rulebooks, audits multi-channel submissions, requests revisions, and gives final sign-off.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                    <span>Approve / Request Changes workflow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                    <span>Multi-brand rule creation & regex</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleLaunchRole("brand-manager")}
                className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
              >
                <span>Launch Brand Reviewer</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Persona 3: Admin */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10 group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    System Admin
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Tier 3</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-4 flex items-center gap-2">
                  Marcus Vance
                </h3>
                <p className="text-xs text-slate-400 mt-1">Architecture & Compliance</p>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Oversees user access, inspects cryptographic audit logs, manages PostgreSQL / Supabase, and monitors SLA telemetry.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Full 9-Table Database Studio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Immutable Audit Trail with IP logs</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleLaunchRole("admin")}
                className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
              >
                <span>Launch Admin Console</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Database & Zero Data Retention Architecture */}
      <section className="py-16 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
                <Database className="h-3.5 w-3.5" />
                <span>Zero File Footprint • Real PostgreSQL Database</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                All Governance Data Lives in PostgreSQL / Supabase
              </h2>
              <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                Unlike primitive tools that write temporary JSON files into repository code, Inkloom AI connects directly
                to PostgreSQL / Supabase. User credentials, brand voice guidelines, draft revisions, AI findings, and
                immutable audit logs are stored securely in 9 relational tables with Row-Level Security (RLS).
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                  <div className="text-xs text-slate-400 font-mono">9 Core Tables</div>
                  <div className="text-sm font-semibold text-white mt-1">Relational Integrity</div>
                  <p className="text-[11px] text-slate-500 mt-1">Foreign-key cascaded schema across organizations, users, rules, and drafts.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                  <div className="text-xs text-slate-400 font-mono">Zero Retention</div>
                  <div className="text-sm font-semibold text-white mt-1">Ephemeral LLM Memory</div>
                  <p className="text-[11px] text-slate-500 mt-1">Customer content is never permanently cached by third-party AI models.</p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/dashboard/database"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"
                >
                  <Database className="h-4 w-4" />
                  <span>Open Interactive Database Studio</span>
                  <ExternalLink className="h-3.5 w-3.5 text-blue-200" />
                </Link>
              </div>
            </div>

            {/* 9 Tables Visual Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>public (PostgreSQL Schema)</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">9 Tables Active</span>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { name: "organizations", desc: "Enterprise branding settings & tone codex", icon: Layers },
                  { name: "users", desc: "User profiles, roles (Creator, BM, Admin), bcrypt hashes", icon: Users },
                  { name: "guidelines", desc: "Official brand codex & voice policies", icon: FileCheck2 },
                  { name: "rules", desc: "Tone, FTC claim, jargon, and accessibility constraints", icon: Scale },
                  { name: "drafts", desc: "Uploaded marketing copy, articles, and drift scores", icon: FileCheck2 },
                  { name: "findings", desc: "AI-detected brand drift & automated suggestions", icon: Sparkles },
                  { name: "comments", desc: "Reviewer feedback and collaboration threads", icon: Users },
                  { name: "approvals", desc: "Multi-tier approval sign-offs and lifecycle states", icon: ShieldCheck },
                  { name: "audit_logs", desc: "Immutable cryptographic log of user actions & IP records", icon: Activity },
                ].map((tbl, i) => (
                  <Link
                    key={tbl.name}
                    href={`/dashboard/database?table=${tbl.name}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 w-4">{i + 1}</span>
                      <tbl.icon className="h-4 w-4 text-blue-400" />
                      <div>
                        <span className="text-xs font-mono font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                          {tbl.name}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{tbl.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-slate-400 font-mono">
              Inkloom AI Platform • Enterprise Governance & SOC2 / Zero Data Retention
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/dashboard/creator" className="hover:text-white transition-colors">Creator</Link>
            <Link href="/dashboard/brand-manager" className="hover:text-white transition-colors">Brand Manager</Link>
            <Link href="/dashboard/admin" className="hover:text-white transition-colors">Admin</Link>
            <Link href="/dashboard/database" className="hover:text-white transition-colors">Database Studio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
