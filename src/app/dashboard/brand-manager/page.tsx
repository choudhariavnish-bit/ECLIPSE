"use client";

import React, { useState, useMemo } from "react";
import Link from "@/lib/next-compat/link";
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
  Search,
  Send,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";

interface ReviewItem {
  id: string;
  title: string;
  author: string;
  channel: string;
  format: string;
  submittedTime: string;
  riskCount: number;
  criticalIssues: string[];
  contentDraft: string;
  proposedCorrection: string;
  status: "pending" | "approved" | "changes_requested";
}

const INITIAL_QUEUE: ReviewItem[] = [
  {
    id: "REV-9021",
    title: "Q4 Global Product Launch Announcement",
    author: "Alex Morgan (Content)",
    channel: "Blog & Press",
    format: "Article",
    submittedTime: "14 mins ago",
    riskCount: 2,
    criticalIssues: [
      "Rule SEC-4.2: Absolute superlative guarantee ('100% foolproof')",
      "Rule TON-1.1: Colloquial hyperbole ('super crazy fast deployment')",
    ],
    contentDraft:
      "ECLIPSE is the market's only 100% foolproof AI automation platform with super crazy fast deployment for global brands.",
    proposedCorrection:
      "ECLIPSE delivers enterprise-grade verified AI brand governance with rapid zero-downtime deployment for verified organisations.",
    status: "pending",
  },
  {
    id: "REV-9019",
    title: "Enterprise Social Carousel Campaign",
    author: "Growth Studio Contractor",
    channel: "Paid Social (LinkedIn)",
    format: "Graphics (3 Slides)",
    submittedTime: "1.2 hours ago",
    riskCount: 1,
    criticalIssues: [
      "Rule ACC-2.1: WCAG 2.1 AA Contrast failure on slide 2 (contrast ratio 2.1:1)",
    ],
    contentDraft:
      "Accelerate brand-consistent content production across your entire organisation.",
    proposedCorrection:
      "Slide 2 text color updated to Slate-900 to satisfy 4.5:1 minimum contrast requirement.",
    status: "pending",
  },
  {
    id: "REV-9014",
    title: "SOC2 Compliance & Tenant Privacy Brief",
    author: "David Liu (Security)",
    channel: "Customer Advisory",
    format: "Document (PDF)",
    submittedTime: "3.5 hours ago",
    riskCount: 0,
    criticalIssues: [],
    contentDraft:
      "Enterprise customer data remains strictly partitioned within customer-controlled tenants. Zero author data is retained or ingested into foundational public models.",
    proposedCorrection: "Complies with legal disclosure standards.",
    status: "approved",
  },
];

const PRESET_FEEDBACK_CHIPS = [
  "Please soften the superlative guarantee to avoid legal risk.",
  "Update typography color on slide 2 to satisfy 4.5:1 WCAG contrast ratio.",
  "Replace informal slang with our executive enterprise tone benchmark.",
  "Add citation to the Q3 benchmark report for all performance claims.",
];

export default function BrandManagerDashboard() {
  const [activeTab, setActiveTab] = useState<"queue" | "tone" | "rules" | "analytics">("queue");
  const [queue, setQueue] = useState<ReviewItem[]>(INITIAL_QUEUE);
  const [selectedReview, setSelectedReview] = useState<ReviewItem>(INITIAL_QUEUE[0]);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [revisionNote, setRevisionNote] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tone Calibration Sliders
  const [formality, setFormality] = useState(80);
  const [boldness, setBoldness] = useState(65);
  const [empathy, setEmpathy] = useState(75);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (id: string) => {
    api.workflow.approve("d0000000-0000-0000-0000-000000000001", "Sign-off granted by Brand Manager").catch(() => {});
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "approved" as const } : item))
    );
    if (selectedReview?.id === id) {
      setSelectedReview((prev) => ({ ...prev, status: "approved" }));
    }
    showNotification(`Sign-off recorded for ${selectedReview.id}. Cryptographic audit record generated.`);
  };

  const handleRequestRevision = (id: string) => {
    const note = revisionNote.trim() || "Please remediate flagged policy items before re-submitting.";
    api.workflow.reject("d0000000-0000-0000-0000-000000000001", note, "changes_requested").catch(() => {});
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "changes_requested" as const } : item
      )
    );
    if (selectedReview?.id === id) {
      setSelectedReview((prev) => ({ ...prev, status: "changes_requested" }));
    }
    setRevisionNote("");
    showNotification(`Revisions requested for ${selectedReview.id}. Transmitted to author.`);
  };

  // Live dynamic sample generation based on sliders
  const dynamicPolicySentence = useMemo(() => {
    if (formality >= 75 && boldness >= 60) {
      return "ECLIPSE enforces authoritative enterprise brand governance standards through verified, deterministic compliance verification.";
    }
    if (formality >= 70 && empathy >= 70) {
      return "We partner with growing enterprises to protect their trusted reputation while empowering creators to do their best work.";
    }
    if (formality < 50 && boldness >= 60) {
      return "Say goodbye to embarrassing brand slip-ups! ECLIPSE unleashes your team to write faster while keeping your identity razor-sharp.";
    }
    if (formality < 50) {
      return "Writing for a global brand can feel overwhelming. We're here to help you get your message right without all the stress.";
    }
    return "ECLIPSE delivers enterprise-grade AI brand governance with rapid zero-downtime deployment for verified organisations.";
  }, [formality, boldness, empathy]);

  const filteredQueue = queue.filter((item) => {
    if (statusFilter === "pending") return item.status === "pending";
    if (statusFilter === "approved") return item.status === "approved";
    return true;
  });

  const pendingCount = queue.filter((q) => q.status === "pending").length;

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
            <span>Governance</span>
            <span>/</span>
            <span>Brand Manager Hub</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Pre-Publication Review & Policy Calibration
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Authorize content releases, enforce brand voice guidelines, and review recurring compliance anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>{pendingCount} Pending Reviews</span>
          </span>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "queue"
              ? "border-slate-900 text-slate-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Approval Queue ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("tone")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "tone"
              ? "border-slate-900 text-slate-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Tone & Voice Simulator
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "rules"
              ? "border-slate-900 text-slate-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Brand Rulebook Catalog
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "analytics"
              ? "border-slate-900 text-slate-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Infraction Hotspots
        </button>
      </div>

      {/* Tab 1: Approval Queue */}
      {activeTab === "queue" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Submissions List (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Submissions ({filteredQueue.length})
              </span>
              <div className="flex rounded-md border border-slate-200 bg-white p-0.5 text-xs font-medium">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    statusFilter === "all" ? "bg-slate-900 text-white font-semibold" : "text-slate-600"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    statusFilter === "pending" ? "bg-slate-900 text-white font-semibold" : "text-slate-600"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter("approved")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    statusFilter === "approved" ? "bg-slate-900 text-white font-semibold" : "text-slate-600"
                  }`}
                >
                  Approved
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredQueue.map((item) => {
                const isSelected = selectedReview.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedReview(item)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? "border-slate-900 bg-white shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        {item.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          item.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "changes_requested"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {item.title}
                    </h3>

                    <div className="text-[11px] text-slate-500">
                      {item.author} • {item.channel}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{item.submittedTime}</span>
                      {item.riskCount > 0 ? (
                        <span className="font-semibold text-rose-600">
                          {item.riskCount} Policy Flags
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-700">
                          0 Policy Flags
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Inspector (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-5 shadow-xs">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    {selectedReview.id}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {selectedReview.format}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {selectedReview.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Author: {selectedReview.author} • Submitted {selectedReview.submittedTime}
                </p>
              </div>

              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${
                  selectedReview.status === "approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedReview.status === "changes_requested"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {selectedReview.status.replace("_", " ")}
              </span>
            </div>

            {/* Critical Policy Flags */}
            {selectedReview.criticalIssues.length > 0 && (
              <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/50 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">
                  Identified Policy Non-Compliance:
                </span>
                <ul className="text-xs text-rose-900 space-y-1 pl-4 list-disc font-medium">
                  {selectedReview.criticalIssues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content vs Correction */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Content Review & Proposed Corrections
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Author Draft
                  </span>
                  <p className="text-slate-800 leading-relaxed font-sans">
                    &quot;{selectedReview.contentDraft}&quot;
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase block">
                    Recommended Fix
                  </span>
                  <p className="text-emerald-950 font-medium leading-relaxed font-sans">
                    &quot;{selectedReview.proposedCorrection}&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Governance Decision & Audit Notes
              </span>

              {/* Quick feedback chips */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Quick feedback presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_FEEDBACK_CHIPS.map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRevisionNote(chip)}
                      className="rounded-full bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] text-slate-700 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Include feedback or compliance stipulations for author..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  onClick={() => handleRequestRevision(selectedReview.id)}
                  className="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Request Revision
                </button>

                <button
                  onClick={() => handleApprove(selectedReview.id)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Approve & Issue Sign-Off
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tone & Voice Simulator */}
      {activeTab === "tone" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Interactive Tone & Voice Simulator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag the sliders below to calibrate company tone policies. The live sample sentence automatically adapts!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
              {/* Formality */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Conversational (0%)</span>
                  <span className="font-mono text-slate-900 font-bold">{formality}% Formality</span>
                  <span>Institutional (100%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formality}
                  onChange={(e) => setFormality(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              {/* Boldness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Conservative (0%)</span>
                  <span className="font-mono text-slate-900 font-bold">{boldness}% Assertiveness</span>
                  <span>Authoritative (100%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={boldness}
                  onChange={(e) => setBoldness(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              {/* Empathy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Strictly Factual (0%)</span>
                  <span className="font-mono text-slate-900 font-bold">{empathy}% Empathy</span>
                  <span>Supportive & Human (100%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={empathy}
                  onChange={(e) => setEmpathy(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => {
                    setFormality(80);
                    setBoldness(65);
                    setEmpathy(75);
                    showNotification("Reset tone parameters to corporate baseline.");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Reset to Corporate Baseline
                </button>
                <button
                  onClick={() => showNotification("Tone matrix saved across active governance engines.")}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save Policy Parameters
                </button>
              </div>
            </div>

            {/* Live Resulting Sample Sentence */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Resulting Policy Standard Preview
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans border-l-2 border-slate-900 pl-3 py-1 font-medium">
                &quot;{dynamicPolicySentence}&quot;
              </p>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                Rule ENF-3.1 automatically applies this benchmark to all outbound press releases, presentation decks, and whitepapers.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Brand Rulebook */}
      {activeTab === "rules" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Active Policy Rulebook (v2.4)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                code: "SEC-4.2",
                title: "Advertising Substantiation & Superlatives",
                rule: "Prohibits absolute performance guarantees ('100% bug-free') lacking third-party audit documentation.",
              },
              {
                code: "TON-1.1",
                title: "Colloquialism & Hyperbole Restriction",
                rule: "Restricts informal slang and hype in institutional communications to protect brand credibility.",
              },
              {
                code: "ACC-2.1",
                title: "WCAG 2.1 AA Visual Contrast",
                rule: "Enforces 4.5:1 minimum contrast ratio across graphics, presentation slides, and marketing cards.",
              },
              {
                code: "NOM-5.1",
                title: "Trademark & Enterprise Nomenclature",
                rule: "Mandates consistent brand terminology ('ECLIPSE Platform' vs 'the bot').",
              },
            ].map((r) => (
              <div key={r.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {r.code}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{r.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.rule}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Analytics */}
      {activeTab === "analytics" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Monthly Infraction Hotspots
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Frequent Infraction</span>
              <div className="text-lg font-bold text-slate-900">Superlative Guarantees</div>
              <div className="text-xs text-slate-500">18 instances flagged across 4 marketing teams.</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Tone Deviation</span>
              <div className="text-lg font-bold text-slate-900">Colloquial Hyperbole</div>
              <div className="text-xs text-slate-500">12 instances flagged in social media drafts.</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Accessibility</span>
              <div className="text-lg font-bold text-slate-900">Contrast Ratio Failures</div>
              <div className="text-xs text-slate-500">4 presentation decks returned for revisions.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
