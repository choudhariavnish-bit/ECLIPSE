"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  BookOpen,
  Wand2,
  Copy,
  ThumbsUp,
  MessageSquare,
  ShieldAlert,
  Send,
  RefreshCw,
} from "lucide-react";

interface AuditFinding {
  id: string;
  category: "claim" | "tone" | "terminology";
  text: string;
  issue: string;
  rule: string;
  suggestion: string;
  status: "pending" | "applied" | "dismissed";
}

const INITIAL_FINDINGS: AuditFinding[] = [
  {
    id: "f-1",
    category: "claim",
    text: "100% foolproof AI automation",
    issue: "Absolute superlative guarantee not permitted under advertising compliance.",
    rule: "Brand Rule 4.2: Prohibited Unverified Superlatives",
    suggestion: "enterprise-grade AI automation with verified high-availability",
    status: "pending",
  },
  {
    id: "f-2",
    category: "tone",
    text: "super crazy fast deployment",
    issue: "Informal hyperbole clashes with authoritative enterprise tone.",
    rule: "Tone Matrix: Professional & Confident (Avoid casual slang)",
    suggestion: "rapid zero-downtime deployment",
    status: "pending",
  },
];

export default function CreatorDashboard() {
  const [inputText, setInputText] = useState(
    "Inkloom is the market's only 100% foolproof AI automation platform with super crazy fast deployment for global brands."
  );
  const [findings, setFindings] = useState<AuditFinding[]>(INITIAL_FINDINGS);
  const [isAuditing, setIsAuditing] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  const handleApplyFix = (findingId: string) => {
    const finding = findings.find((f) => f.id === findingId);
    if (!finding) return;

    setInputText((prev) => prev.replace(finding.text, finding.suggestion));
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, status: "applied" } : f))
    );
  };

  const handleDismiss = (findingId: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, status: "dismissed" } : f))
    );
  };

  const handleReAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      // If already corrected
      if (!inputText.includes("100% foolproof") && !inputText.includes("super crazy fast")) {
        setFindings([]);
      } else {
        setFindings(INITIAL_FINDINGS);
      }
    }, 600);
  };

  const handleSubmitForReview = () => {
    setSubmissionStatus("Submitted to Brand Governance Queue (#REV-9021)");
    setTimeout(() => setSubmissionStatus(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
              Creator Studio
            </span>
            <span className="text-xs text-slate-400">Content Authoring Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Welcome back, Alex
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Pre-flight your copy against brand guidelines, tone rules, and verified facts before publishing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Your Compliance Score</div>
              <div className="text-sm font-bold text-slate-900">94.2% Passed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Drafts in Progress</span>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">4</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">2 ready for brand sign-off</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Manager Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">2</div>
          <div className="text-[11px] text-slate-500 mt-1">Avg review turnaround: 2.4 hrs</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Approved & Published</span>
            <FileCheck2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">18</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 4 content channels</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>AI Fixes Accepted</span>
            <Wand2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">37</div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium">89% adoption rate</div>
        </div>
      </div>

      {/* Main Core: Interactive Pre-Publication Inspector */}
      <div id="brand-check" className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Interactive Pre-Publication Brand Checker
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated review evaluating Tone, Messaging, Fact Citations, and Terminology.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReAudit}
              disabled={isAuditing}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isAuditing ? "animate-spin text-blue-600" : ""}`} />
              <span>{isAuditing ? "Auditing..." : "Re-Check Content"}</span>
            </button>
            <button
              onClick={handleSubmitForReview}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit for Brand Sign-Off</span>
            </button>
          </div>
        </div>

        {submissionStatus && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs text-emerald-800 flex items-center justify-between font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{submissionStatus}</span>
            </div>
            <Link href="/dashboard/brand-manager" className="text-emerald-700 underline font-semibold">
              View in Manager Queue
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left: Content Editor Input */}
          <div className="lg:col-span-7 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="copy-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Content Draft (Text or OCR Extracted)
              </label>
              <span className="text-[11px] text-slate-400">
                Target: Global Product Release
              </span>
            </div>

            <textarea
              id="copy-input"
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm leading-relaxed text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              placeholder="Paste or write your marketing copy here..."
            />

            {/* Quick Template pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Load sample test:</span>
              <button
                type="button"
                onClick={() => {
                  setInputText("Inkloom is the market's only 100% foolproof AI automation platform with super crazy fast deployment for global brands.");
                  setFindings(INITIAL_FINDINGS);
                }}
                className="rounded-full bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-slate-700 transition-colors"
              >
                Superlative Claim & Tone Flaw
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText("Inkloom delivers enterprise-grade AI brand governance with rapid zero-downtime deployment for verified organisations.");
                  setFindings([]);
                }}
                className="rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 transition-colors"
              >
                100% Compliant Sample
              </button>
            </div>
          </div>

          {/* Right: AI Findings & Suggestions */}
          <div className="lg:col-span-5 p-5 bg-slate-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Governance Findings ({findings.filter((f) => f.status === "pending").length})
              </span>
              <span className="text-[11px] text-slate-400">Explainable AI Citations</span>
            </div>

            {findings.filter((f) => f.status === "pending").length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-200 bg-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Zero Brand Inconsistencies</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Your content fully complies with the Inkloom Brand Rulebook and tone guidelines.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {findings
                  .filter((f) => f.status === "pending")
                  .map((finding) => (
                    <div
                      key={finding.id}
                      className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              finding.category === "claim"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {finding.category}
                          </span>
                          <span className="text-xs font-semibold text-slate-800">
                            &quot;{finding.text}&quot;
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-normal">
                        {finding.issue}
                      </p>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        <BookOpen className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{finding.rule}</span>
                      </div>

                      {/* Suggested Fix Diff */}
                      <div className="rounded-lg bg-emerald-50/70 border border-emerald-200/60 p-2.5 text-xs text-emerald-900">
                        <span className="font-semibold block text-[10px] uppercase tracking-wider text-emerald-700 mb-1">
                          Suggested Replacement:
                        </span>
                        <span>&quot;{finding.suggestion}&quot;</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleDismiss(finding.id)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                        >
                          Keep Original
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFix(finding.id)}
                          className="flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-semibold text-white shadow-2xs transition-colors"
                        >
                          <Wand2 className="h-3 w-3" />
                          <span>Apply Correction</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row: Terminology Cheat Sheet & Content Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approved Terminology Quick Glossary */}
        <div id="glossary" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Brand Terminology Quick Glossary</h3>
              <p className="text-xs text-slate-500">Live dictionary of preferred vs prohibited brand words</p>
            </div>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>

          <div className="space-y-2.5">
            {[
              { doUse: "Intelligent Brand Governance", dont: "AI Content Policing", note: "Positions platform constructively" },
              { doUse: "Verified Corporate Facts", dont: "Marketing Truths", note: "Avoids aggressive legal exposure" },
              { doUse: "Enterprise-Grade Reliability", dont: "100% Guaranteed Zero Bugs", note: "Strict advertising compliance" },
              { doUse: "Collaborative Review Workflow", dont: "Strict Bureaucracy Gate", note: "Highlights creator empowerment" },
            ].map((term, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-700">✓ {term.doUse}</span>
                    <span className="text-slate-400">vs</span>
                    <span className="line-through text-rose-600">✗ {term.dont}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{term.note}</div>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(term.doUse)}
                  title="Copy approved term"
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content Status & Feedback from Reviewers */}
        <div id="feedback" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Content Approvals & Feedback</h3>
              <p className="text-xs text-slate-500">Submissions tracked across the brand approval pipeline</p>
            </div>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Q3 AI Governance Whitepaper",
                type: "Document (PDF)",
                status: "Approved",
                statusColor: "bg-emerald-100 text-emerald-800",
                reviewer: "Sarah Chen (Brand Manager)",
                comment: "Perfect tone and all disclaimer citations verified.",
              },
              {
                title: "LinkedIn Product Launch Carousel",
                type: "Social Graphic",
                status: "Changes Requested",
                statusColor: "bg-amber-100 text-amber-800",
                reviewer: "Sarah Chen (Brand Manager)",
                comment: "Please update font contrast on slide 3 for WCAG AA compliance.",
              },
              {
                title: "Enterprise Security Blog Post",
                type: "Article",
                status: "Pending Sign-Off",
                statusColor: "bg-blue-100 text-blue-800",
                reviewer: "Queue",
                comment: "Awaiting final trademark review.",
              },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{item.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">Format: {item.type} • Reviewer: {item.reviewer}</div>
                <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                  💬 &quot;{item.comment}&quot;
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

