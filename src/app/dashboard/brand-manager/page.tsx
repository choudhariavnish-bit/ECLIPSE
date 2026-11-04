"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Filter,
  Sliders,
  BookOpen,
  TrendingDown,
  BarChart3,
  Check,
  X,
  FileText,
  Eye,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface ReviewItem {
  id: string;
  title: string;
  creator: string;
  channel: string;
  format: string;
  submittedAt: string;
  flagsCount: number;
  criticalIssues: string[];
  status: "pending" | "approved" | "changes_requested";
}

const INITIAL_QUEUE: ReviewItem[] = [
  {
    id: "REV-9021",
    title: "Q4 Global Product Launch Announcement",
    creator: "Alex Morgan (Content)",
    channel: "Blog & Press",
    format: "Rich Article",
    submittedAt: "18 mins ago",
    flagsCount: 2,
    criticalIssues: ["Unsupported Claim: '100% foolproof'", "Tone: hyperbole in intro"],
    status: "pending",
  },
  {
    id: "REV-9019",
    title: "Instagram / LinkedIn Story Ad Carousel",
    creator: "Growth Studio Agency",
    channel: "Paid Social",
    format: "Image (3 slides)",
    submittedAt: "1.2 hrs ago",
    flagsCount: 1,
    criticalIssues: ["Accessibility: WCAG AA contrast ratio failure on slide 2"],
    status: "pending",
  },
  {
    id: "REV-9014",
    title: "SOC2 Compliance Customer Advisory Note",
    creator: "David Liu (Security Marketing)",
    channel: "Customer Advisory",
    format: "PDF Document",
    submittedAt: "3 hrs ago",
    flagsCount: 0,
    criticalIssues: [],
    status: "pending",
  },
];

export default function BrandManagerDashboard() {
  const [queue, setQueue] = useState<ReviewItem[]>(INITIAL_QUEUE);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(queue[0]);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [activeTab, setActiveTab] = useState<"queue" | "guidelines" | "compliance">("queue");

  // Tone policy state
  const [toneFormality, setToneFormality] = useState(80);
  const [toneBoldness, setToneBoldness] = useState(65);
  const [toneEmpathy, setToneEmpathy] = useState(90);

  const handleApprove = (id: string) => {
    api.workflow.approve("d0000000-0000-0000-0000-000000000001", "Sign-off granted by Brand Manager").catch(() => {});
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "approved" } : item))
    );
    if (selectedReview?.id === id) {
      setSelectedReview((prev) => (prev ? { ...prev, status: "approved" } : null));
    }
  };

  const handleRequestRevision = (id: string) => {
    api.workflow.reject("d0000000-0000-0000-0000-000000000001", feedbackNote || "Revisions requested", "changes_requested").catch(() => {});
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "changes_requested" } : item))
    );
    if (selectedReview?.id === id) {
      setSelectedReview((prev) => (prev ? { ...prev, status: "changes_requested" } : null));
    }
    setFeedbackNote("");
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
              Brand Governance Console
            </span>
            <span className="text-xs text-slate-400">Policy & Quality Assurance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Brand Review Hub • Sarah Chen
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Authorize content releases, enforce brand voice guidelines, and review recurring compliance anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-purple-50 border border-purple-200 px-4 py-2">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <div>
              <div className="text-[11px] font-medium text-purple-700">Governance Index</div>
              <div className="text-sm font-bold text-purple-900">98.4% Protected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Review Queue</span>
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {queue.filter((q) => q.status === "pending").length}
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">1 flagged critical</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Approved This Week</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">42</div>
          <div className="text-[11px] text-emerald-600 mt-1">100% compliant with disclaimers</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Unclear Rule Hotspots</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">2 Rules</div>
          <div className="text-[11px] text-slate-500 mt-1">Rule 4.2 (Superlatives) triggered 14x</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Contributors</span>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">12 Teams</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 3 external agencies</div>
        </div>
      </div>

      {/* Main Review Pipeline & Workflows */}
      <div id="queue" className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">
                Pre-Publication Approval Pipeline
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review flagged creator drafts, examine explainable AI findings, and issue approvals or revision notes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
              {queue.filter((q) => q.status === "pending").length} Items Requiring Decision
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left: Queue List */}
          <div className="lg:col-span-5 p-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
              Incoming Content Submissions
            </div>

            {queue.map((item) => {
              const isSelected = selectedReview?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedReview(item)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-mono font-semibold text-slate-400">
                      {item.id}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "changes_requested"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.status === "approved"
                        ? "Approved"
                        : item.status === "changes_requested"
                        ? "Revision Requested"
                        : "Needs Review"}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    By {item.creator} • {item.format}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{item.submittedAt}</span>
                    {item.flagsCount > 0 ? (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {item.flagsCount} flags
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Clean
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Inspection & Sign-Off Actions */}
          <div className="lg:col-span-7 p-6 bg-white space-y-6">
            {selectedReview ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-purple-700 font-semibold">
                      {selectedReview.id} • {selectedReview.channel}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {selectedReview.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Submitted by {selectedReview.creator}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={selectedReview.status === "changes_requested"}
                      onClick={() => handleRequestRevision(selectedReview.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Request Revision</span>
                    </button>
                    <button
                      type="button"
                      disabled={selectedReview.status === "approved"}
                      onClick={() => handleApprove(selectedReview.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve Publication</span>
                    </button>
                  </div>
                </div>

                {/* Flagged findings details */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Automated Pre-Flight Findings
                  </span>

                  {selectedReview.criticalIssues.length > 0 ? (
                    <div className="space-y-2">
                      {selectedReview.criticalIssues.map((issue, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 text-xs text-rose-900"
                        >
                          <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">{issue}</span>
                            <div className="text-[11px] text-rose-700 mt-0.5">
                              Violates Company Brand Rulebook v2.4. Reviewer action recommended.
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>All brand guidelines, facts, and contrast checks passed. Ready for approval.</span>
                    </div>
                  )}
                </div>

                {/* Reviewer Note Input */}
                <div className="space-y-2">
                  <label htmlFor="reviewer-note" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Reviewer Feedback / Override Justification Note
                  </label>
                  <textarea
                    id="reviewer-note"
                    rows={3}
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Provide constructive guidance to the creator (e.g., 'Please swap slide 2 background to #0F172A')..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    All reviewer notes are stored in the immutable audit trail for governance compliance.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                Select a draft from the queue to review
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row: Brand Rulebook & Guideline Management */}
      <div id="guidelines" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tone Matrix Calibration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Brand Tone & Voice Sliders</h3>
              <p className="text-xs text-slate-500">Calibrates AI sensitivity for pre-publication checks</p>
            </div>
            <Sliders className="h-4 w-4 text-purple-600" />
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Formality & Enterprise Rigor</span>
                <span>{toneFormality}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={toneFormality}
                onChange={(e) => setToneFormality(Number(e.target.value))}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Casual & Conversational</span>
                <span>Strict Executive Tone</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Boldness & Innovation Stance</span>
                <span>{toneBoldness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={toneBoldness}
                onChange={(e) => setToneBoldness(Number(e.target.value))}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Understated & Factual</span>
                <span>Aggressive & Bold</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Empathy & Accessibility</span>
                <span>{toneEmpathy}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={toneEmpathy}
                onChange={(e) => setToneEmpathy(Number(e.target.value))}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Direct Technical</span>
                <span>Human-Centric & Inclusive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guideline Confusion Hotspots (Insights) */}
        <div id="compliance" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Guideline Ambiguity & Recurring Issues</h3>
              <p className="text-xs text-slate-500">Rules that creators frequently violate or find unclear</p>
            </div>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </div>

          <div className="space-y-3">
            {[
              {
                rule: "Rule 4.2: Unverified Superlative Claims",
                frequency: "14 violations this month",
                recommendation: "Update guideline documentation with clear examples of approved benchmark phrases.",
                urgency: "High",
              },
              {
                rule: "Rule 2.1: Primary Logo Safe Margin",
                frequency: "8 violations this month",
                recommendation: "Provide pre-padded PNG/SVG templates to design agencies.",
                urgency: "Medium",
              },
              {
                rule: "Rule 6.3: AI Content Disclosure Tag",
                frequency: "6 violations this month",
                recommendation: "Clarify which promotional assets require external disclosure.",
                urgency: "Low",
              },
            ].map((hotspot, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{hotspot.rule}</span>
                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    {hotspot.frequency}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  💡 {hotspot.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

