"use client";

import React, { useState } from "react";
import Link from "@/lib/next-compat/link";
import {
  ShieldCheck,
  Clock,
  Rocket,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Users,
  Layers,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign,
  FileCheck,
} from "lucide-react";

export default function ImpactAndBenefitsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "metrics" | "calculator">("overview");

  // Interactive ROI Calculator State
  const [monthlyPieces, setMonthlyPieces] = useState<number>(120);
  const [reviewHoursPerPiece, setReviewHoursPerPiece] = useState<number>(4);
  const [hourlyReviewCost, setHourlyReviewCost] = useState<number>(65);

  // Calculations
  const manualHoursMonth = monthlyPieces * reviewHoursPerPiece;
  const eclipseHoursMonth = Math.round(monthlyPieces * 0.25); // 15 mins per piece = 0.25h
  const hoursSavedMonth = manualHoursMonth - eclipseHoursMonth;
  const hoursSavedYear = hoursSavedMonth * 12;
  const costSavingsYear = Math.round(hoursSavedYear * hourlyReviewCost);
  const velocityMultiplier = 3.2;

  return (
    <div className="space-y-6 pb-12">
      {/* ── TOP HEADER BAR: ECLIPSE LOGO, TITLE, AND WE CODE CODERS BADGE ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* ECLIPSE Brand Mark */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white flex items-center justify-center shadow-md shadow-blue-900/20 ring-4 ring-blue-50">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <span className="text-[11px] font-black tracking-widest uppercase text-blue-600 block">
              Brand Intelligence Platform
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              ECLIPSE
            </h1>
          </div>
        </div>

        {/* Centered Banner Title */}
        <div className="text-center md:text-left">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 flex items-center justify-center gap-2">
            <span>IMPACT AND BENEFITS</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Single Source of Truth &bull; Key Platform Benefits Architecture
          </p>
        </div>

        {/* Engineering Team Badge: WE CODE CODERS */}
        <div className="flex items-center gap-2.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xs border border-slate-700">
          <div className="text-right">
            <div className="text-[10px] font-mono tracking-widest uppercase text-rose-400 font-bold">
              Engineering Team
            </div>
            <div className="text-xs font-black tracking-wider text-white">
              WE CODE CODERS
            </div>
          </div>
          <div className="h-8 w-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs font-mono">
            WCC
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
            <span>Infographic View</span>
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all ${
              activeTab === "architecture"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-indigo-600" />
            <span>Benefits Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all ${
              activeTab === "metrics"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
            <span>Velocity & Error Data</span>
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all ${
              activeTab === "calculator"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            <span>ROI Calculator</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-semibold pr-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Single Source of Truth (SSOT) Governance Active</span>
        </div>
      </div>

      {/* ── SECTION 1: 1. KEY METRICS (Exact replica of top horizontal strip) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs">
              1
            </span>
            <span>KEY METRICS</span>
          </h3>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Enterprise Benchmarks Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Brand Consistency */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center gap-3.5">
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="3.5"
                  strokeDasharray="87.96"
                  strokeDashoffset="1.75" // 98%
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-900">
                98%
              </span>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                BRAND CONSISTENCY
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                From <span className="line-through text-slate-400">45%</span> to{" "}
                <span className="text-blue-600 font-extrabold">98%</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                consistent across all channels
              </div>
            </div>
          </div>

          {/* Metric 2: Compliance Risk */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-blue-100/80 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                COMPLIANCE RISK
              </div>
              <div className="text-base font-extrabold text-blue-700 mt-0.5">
                85% decrease
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                in regulatory & tone violations
              </div>
            </div>
          </div>

          {/* Metric 3: Approval Time */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-emerald-100/80 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                APPROVAL TIME
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                Reduced from <span className="text-rose-600 font-extrabold">12 hours</span> to{" "}
                <span className="text-emerald-600 font-extrabold">15 minutes</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                97.9% workflow acceleration
              </div>
            </div>
          </div>

          {/* Metric 4: Content Velocity */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-indigo-100/80 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                CONTENT VELOCITY
              </div>
              <div className="text-base font-extrabold text-indigo-700 mt-0.5">
                3.2x faster
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                publication speed to market
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID: ARCHITECTURE (LEFT) & CONTENT APPROVAL SPEED (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (Cols 1-7): SECTION 2 - KEY PLATFORM BENEFITS ARCHITECTURE */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs">
                  2
                </span>
                <span>KEY PLATFORM BENEFITS ARCHITECTURE</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                CLOSED-LOOP SSOT
              </span>
            </div>

            {/* Hub & Spoke Central Architecture Diagram */}
            <div className="relative py-4">
              {/* Central Hub */}
              <div className="flex items-center justify-center my-6">
                <div className="relative z-10 w-44 h-44 rounded-full bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-col items-center justify-center p-3 text-center shadow-xl ring-8 ring-blue-100/60 border-2 border-blue-400">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mb-1 text-blue-300">
                    <RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: "12s" }} />
                  </div>
                  <div className="text-[11px] font-extrabold tracking-wider uppercase text-blue-300">
                    SINGLE SOURCE OF
                  </div>
                  <div className="text-xs font-black tracking-tight text-white">
                    TRUTH &amp; GOVERNANCE
                  </div>
                  <div className="text-[9px] text-slate-300 mt-1 font-mono">
                    ECLIPSE Core Engine
                  </div>
                </div>
              </div>

              {/* 4 Surrounding Benefit Nodes (Matching Reference Image) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Node 1: Top Left - Perfect Brand Alignment */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 hover:shadow-md hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wide mb-1">
                    <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>PERFECT BRAND ALIGNMENT</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Assures consistent <strong className="text-slate-900">tone</strong>,{" "}
                    <strong className="text-slate-900">terminology</strong>, and{" "}
                    <strong className="text-slate-900">messaging</strong> across all outlets.
                  </p>
                </div>

                {/* Node 2: Top Right - Reduced Human Error */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 hover:shadow-md hover:border-emerald-300 transition-all">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide mb-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>REDUCED HUMAN ERROR</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Detects <strong className="text-slate-900">incorrect claims</strong>,{" "}
                    <strong className="text-slate-900">outdated information</strong>, and{" "}
                    <strong className="text-slate-900">off-brand visuals</strong> before they go live.
                  </p>
                </div>

                {/* Node 3: Bottom Left - Collaborative Workflow */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 hover:shadow-md hover:border-purple-300 transition-all">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wide mb-1">
                    <Users className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>COLLABORATIVE WORKFLOW</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enables creators, managers, and authorized reviewers to{" "}
                    <strong className="text-slate-900">track changes</strong> in one unified workspace.
                  </p>
                </div>

                {/* Node 4: Bottom Right - Continuous Learning */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 hover:shadow-md hover:border-indigo-300 transition-all">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wide mb-1">
                    <TrendingUp className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>CONTINUOUS LEARNING</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Provides actionable <strong className="text-slate-900">insights</strong> into recurring
                    mistakes and areas where guidelines need clarity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Callout: Future Prospects (Exact text from image) */}
          <div className="mt-5 rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-4">
            <div className="text-[11px] font-black uppercase tracking-wider text-blue-900 mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-600" />
              <span>FUTURE PROSPECTS:</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-slate-900">Multi-Modal &amp; Autonomous AI Integration:</strong>{" "}
                  Expanding governance from text and static images to real-time audio, video, and
                  autonomous multi-agent content pipelines to intercept errors at the point of creation.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-slate-900">Adaptive, Self-Improving Compliance:</strong>{" "}
                  Continuously learning from flagged issues to proactively update brand guidelines and adjust
                  to evolving industry regulations without human friction.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN (Cols 8-12): CONTENT APPROVAL SPEED & CHARTS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Right Chart: CONTENT APPROVAL SPEED */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                CONTENT APPROVAL SPEED
              </h3>
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-lg text-xs font-bold">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>70% Faster time-to-publish</span>
              </div>
            </div>

            {/* Custom SVG Stepped Line Chart (Matching reference image) */}
            <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-3">
              <div className="h-44 w-full">
                <svg className="h-full w-full" viewBox="0 0 340 160">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="330" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="60" x2="330" y2="60" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="100" x2="330" y2="100" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="135" x2="330" y2="135" stroke="#CBD5E1" strokeWidth="1.5" />

                  {/* Y-Axis Label */}
                  <text
                    x="-80"
                    y="18"
                    transform="rotate(-90)"
                    fontSize="9"
                    fill="#64748B"
                    fontWeight="600"
                  >
                    Time saved per piece
                  </text>

                  {/* Red Stepped Curve: "Before Eclipse" */}
                  <path
                    d="M 45 120 L 85 120 L 85 95 L 135 95 L 135 75 L 190 75 L 190 55 L 245 55 L 245 35 L 325 35"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <text x="95" y="65" fontSize="10" fill="#DC2626" fontWeight="bold">
                    Before Eclipse
                  </text>

                  {/* Blue Flat Baseline: "After Eclipse - fast and automated" */}
                  <path
                    d="M 45 125 L 85 125 L 85 130 L 325 130"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="3"
                  />
                  <circle cx="85" cy="130" r="3" fill="#0284C7" />
                  <circle cx="325" cy="130" r="3" fill="#0284C7" />

                  {/* X-Axis Label */}
                  <text x="180" y="152" fontSize="9" fill="#64748B" fontWeight="600" textAnchor="middle">
                    Time (several days) &rarr;
                  </text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-medium pt-2 border-t border-slate-200 text-slate-600 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Manual review (days of back-and-forth)</span>
                </span>
                <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>After Eclipse - instant</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Right: METRICS, BAR CHARTS & VALUE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            {/* 1. Reduction in Weekly Review Time */}
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                Reduction in Weekly Review Time
              </div>
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {/* Manual Review (Before) */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Manual Review (Before)</span>
                    <span className="font-mono text-slate-800 font-bold">24 Hours</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>

                {/* With Eclipse */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span className="text-blue-700 font-bold">With Eclipse</span>
                    <span className="font-mono text-blue-700 font-bold">2 Hours</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: "8.3%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Content Error Reduction Grouped Bar Chart */}
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                Content Error Reduction (%)
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {/* Fact Errors */}
                  <div className="space-y-1">
                    <div className="h-24 flex items-end justify-center gap-1.5 pb-1 border-b border-slate-200">
                      <div
                        className="w-4 bg-slate-400 rounded-t text-[9px] text-white flex items-center justify-center font-bold"
                        style={{ height: "85%" }}
                        title="Before: 85%"
                      >
                        85
                      </div>
                      <div
                        className="w-4 bg-blue-600 rounded-t text-[9px] text-white flex items-center justify-center font-bold"
                        style={{ height: "10%" }}
                        title="With Eclipse: 4%"
                      >
                        4
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-700">Fact Errors</div>
                    <div className="text-[9px] font-semibold text-emerald-600">-95.3%</div>
                  </div>

                  {/* Tone Mismatches */}
                  <div className="space-y-1">
                    <div className="h-24 flex items-end justify-center gap-1.5 pb-1 border-b border-slate-200">
                      <div
                        className="w-4 bg-slate-400 rounded-t text-[9px] text-white flex items-center justify-center font-bold"
                        style={{ height: "92%" }}
                        title="Before: 92%"
                      >
                        92
                      </div>
                      <div
                        className="w-4 bg-blue-600 rounded-t text-[9px] text-white flex items-center justify-center font-bold"
                        style={{ height: "14%" }}
                        title="With Eclipse: 8%"
                      >
                        8
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-700">Tone Mismatches</div>
                    <div className="text-[9px] font-semibold text-emerald-600">-91.3%</div>
                  </div>

                  {/* Off-Brand Visuals */}
                  <div className="space-y-1">
                    <div className="h-24 flex items-end justify-center gap-1.5 pb-1 border-b border-slate-200">
                      <div
                        className="w-4 bg-slate-400 rounded-t text-[9px] text-white flex items-center justify-center font-bold"
                        style={{ height: "78%" }}
                        title="Before: 78%"
                      >
                        78
                      </div>
                      <div
                        className="w-4 bg-blue-600 rounded-t text-[9px] text-white flex items-center justify-center font-bold"
                        style={{ height: "12%" }}
                        title="With Eclipse: 6%"
                      >
                        6
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-700">Off-Brand Visuals</div>
                    <div className="text-[9px] font-semibold text-emerald-600">-92.3%</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-semibold mt-2 pt-2 border-t border-slate-200">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-xs bg-slate-400" />
                    <span>Before Eclipse</span>
                  </span>
                  <span className="flex items-center gap-1 text-blue-700 font-bold">
                    <span className="h-2 w-2 rounded-xs bg-blue-600" />
                    <span>With Eclipse</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Triad Key Benefits Cards */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                KEY BENEFITS
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
                  <Clock className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-900">Speed &amp; Scale</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Saves days of review work</div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-900">Trust &amp; Compliance</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">No risky unapproved facts</div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
                  <Sparkles className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-900">Consistent Voice</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Aligned visuals &amp; tone</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: INTERACTIVE ENTERPRISE ROI SIMULATOR ── */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/40 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-mono">
              Live ROI Simulator
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              Calculate Your Organization&apos;s Return on Investment
            </h3>
            <p className="text-xs text-slate-600">
              Adjust your monthly content velocity and review parameters to see projected savings.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Estimated Annual Cost Savings</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              ${costSavingsYear.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Monthly Content Pieces */}
          <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Monthly Content Pieces</span>
              <span className="font-mono text-blue-600">{monthlyPieces} pieces</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={monthlyPieces}
              onChange={(e) => setMonthlyPieces(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>20 pieces</span>
              <span>500 pieces</span>
            </div>
          </div>

          {/* Slider 2: Manual Review Hours Per Piece */}
          <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Manual Review Time</span>
              <span className="font-mono text-indigo-600">{reviewHoursPerPiece} hours/piece</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={reviewHoursPerPiece}
              onChange={(e) => setReviewHoursPerPiece(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 hr</span>
              <span>8 hrs</span>
            </div>
          </div>

          {/* Slider 3: Hourly Reviewer Cost */}
          <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Hourly Blended Cost</span>
              <span className="font-mono text-emerald-600">${hourlyReviewCost}/hr</span>
            </div>
            <input
              type="range"
              min="30"
              max="150"
              step="5"
              value={hourlyReviewCost}
              onChange={(e) => setHourlyReviewCost(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$30/hr</span>
              <span>$150/hr</span>
            </div>
          </div>
        </div>

        {/* Dynamic ROI Output Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-100">
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Hours Saved / Year
            </div>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {hoursSavedYear.toLocaleString()} hrs
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Time Acceleration
            </div>
            <div className="text-lg font-black text-blue-600 mt-0.5">
              {velocityMultiplier}x Faster
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Error Escape Rate
            </div>
            <div className="text-lg font-black text-emerald-600 mt-0.5">
              &lt; 2.5%
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Payback Period
            </div>
            <div className="text-lg font-black text-purple-600 mt-0.5">
              &lt; 14 Days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
