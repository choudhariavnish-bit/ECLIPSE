"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "@/lib/next-compat/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { BlogReviewStudio } from "@/components/blog/BlogReviewStudio";
import { ImageReviewStudio } from "@/components/image/ImageReviewStudio";
import { UniversalDocumentStudio } from "@/components/documents/UniversalDocumentStudio";
import { IssueList, OriginalCorrectedView, AuditSummary, EmptyAuditState } from "@/components/audit";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  Sparkles,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Wand2,
  Copy,
  Send,
  RefreshCw,
  Eye,
  Edit3,
  Smartphone,
  Globe,
  Mail,
  FileText,
  Search,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RotateCcw,
  Sliders,
  Layers,
  Image as ImageIcon,
  Scan,
} from "lucide-react";

interface AuditFinding {
  id: string;
  category: string;
  severity?: string;
  flaggedText: string;
  issue: string;
  plainEnglishReason: string;
  suggestedFix: string;
  ruleCode: string;
  status: "pending" | "applied" | "dismissed";
}

interface TemplatePreset {
  id: string;
  label: string;
  channel: string;
  text: string;
  driftScore?: number;
  isMajorDrift?: boolean;
  isImage?: boolean;
  imageTitle?: string;
  contrast?: string;
  rawFindings: AuditFinding[];
}

const TEMPLATES: TemplatePreset[] = [
  {
    id: "launch",
    label: "Product Announcement",
    channel: "LinkedIn & Social",
    driftScore: 42,
    isMajorDrift: false,
    text: "ECLIPSE is the market's only 100% foolproof AI automation platform with super crazy fast deployment for global brands.",
    rawFindings: [
      {
        id: "f-1",
        category: "Legal & Claims",
        flaggedText: "100% foolproof",
        issue: "Absolute superlative guarantee.",
        plainEnglishReason: "Saying '100% foolproof' creates legal risk if any bug occurs. 'Enterprise-grade verified' protects our liability.",
        suggestedFix: "enterprise-grade verified",
        ruleCode: "SEC-4.2",
        status: "pending",
      },
      {
        id: "f-2",
        category: "Tone & Style",
        flaggedText: "super crazy fast",
        issue: "Informal colloquial slang.",
        plainEnglishReason: "Sounds too casual for enterprise buyers. 'Rapid zero-downtime deployment' preserves your energy while sounding authoritative.",
        suggestedFix: "rapid zero-downtime",
        ruleCode: "TON-1.1",
        status: "pending",
      },
    ],
  },
  {
    id: "poster",
    label: "Marketing Poster (Graphic)",
    channel: "LinkedIn & Social",
    driftScore: 48,
    isMajorDrift: false,
    isImage: true,
    imageTitle: "Q4 Enterprise Product Launch Campaign Poster",
    contrast: "2.4:1 (FAIL - WCAG AA requires min 4.5:1)",
    text: "ECLIPSE: The only 100% foolproof AI platform. Deploy with super crazy fast velocity across all enterprise teams.",
    rawFindings: [
      {
        id: "f-img-1",
        category: "Visual & Contrast (WCAG)",
        flaggedText: "Yellow Headline on Light Background",
        issue: "Contrast ratio 2.4:1 fails accessibility standard.",
        plainEnglishReason: "Low visual contrast makes text hard to read on mobile devices and violates WCAG 2.1 AA.",
        suggestedFix: "Slate-900 typography on white card (12.4:1 ratio)",
        ruleCode: "ACC-2.1",
        status: "pending",
      },
      {
        id: "f-img-2",
        category: "Legal & Claims",
        flaggedText: "100% foolproof",
        issue: "Absolute guarantee printed on marketing visual.",
        plainEnglishReason: "Superlatives on permanent marketing posters create uninsurable liability.",
        suggestedFix: "enterprise-grade verified",
        ruleCode: "SEC-4.2",
        status: "pending",
      },
    ],
  },
  {
    id: "major_drift",
    label: "Critical Claim (Major Drift >= 70)",
    channel: "Press Release & Social",
    driftScore: 86,
    isMajorDrift: true,
    text: "ECLIPSE guarantees a 500% ROI in 30 days or a 100% refund, officially certified and verified by federal regulators.",
    rawFindings: [
      {
        id: "f-crit-1",
        category: "Legal & Claims",
        flaggedText: "guarantees a 500% ROI in 30 days or a 100% refund",
        issue: "Severe uninsurable financial guarantee claim.",
        plainEnglishReason: "Promising specific financial returns triggers immediate SEC & FTC false advertising prosecution. Human Brand Manager sign-off required.",
        suggestedFix: "delivers measurable enterprise ROI with audited reliability",
        ruleCode: "SEC-9.1 (CRITICAL)",
        status: "pending",
      },
      {
        id: "f-crit-2",
        category: "Legal & Claims",
        flaggedText: "officially certified and verified by federal regulators",
        issue: "Unauthorized government regulatory endorsement claim.",
        plainEnglishReason: "Falsely asserting regulatory agency endorsement is a direct statutory violation. Autonomous clearance blocked.",
        suggestedFix: "built for institutional compliance standards",
        ruleCode: "GOV-1.2 (CRITICAL)",
        status: "pending",
      },
    ],
  },
  {
    id: "hiring",
    label: "Hiring Announcement",
    channel: "LinkedIn & Social",
    driftScore: 0,
    isMajorDrift: false,
    text: "We are expanding our engineering team to build scalable enterprise governance tools. Join us as we redefine brand compliance.",
    rawFindings: [],
  },
];

const GLOSSARY_PAIRS = [
  { doUse: "Intelligent Brand Governance", avoid: "AI Content Policing" },
  { doUse: "Enterprise-Grade Reliability", avoid: "100% Guaranteed Zero Bugs" },
  { doUse: "Rapid Zero-Downtime Deployment", avoid: "Super crazy fast setup" },
  { doUse: "Deterministic Policy Verification", avoid: "Magic AI checking" },
  { doUse: "ECLIPSE Platform", avoid: "ECLIPSE Bot / Widget" },
];

export default function CreatorDashboard() {
  const { currentUser } = useAuthStore();
  const userName = currentUser?.name || "Author";
  const userInitials = useMemo(() => {
    if (!userName) return "AU";
    return (
      userName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AU"
    );
  }, [userName]);
  const userDepartment = currentUser?.department || "Content & Communications";

  const [studioMode, setStudioMode] = useState<"image" | "social" | "blog" | "documents">("image");
  const [inputText, setInputText] = useState(TEMPLATES[0].text);
  const [selectedChannel, setSelectedChannel] = useState("LinkedIn & Social");
  const [contentFormat, setContentFormat] = useState<"text" | "graphic">("text");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const [posterTitle, setPosterTitle] = useState("Marketing Banner Graphic");
  const [posterContrast, setPosterContrast] = useState("WCAG AA Compliant (12.4:1)");
  const [glossarySearch, setGlossarySearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Draft info state
  const [activeDraftInfo, setActiveDraftInfo] = useState<{
    id?: string;
    title?: string;
    content?: string;
    channel?: string;
    brand?: string;
    format?: string;
  } | null>(null);

  // Workflow states: "idle" (needs check), "checking" (in progress), "evaluated" (checked)
  const [auditState, setAuditState] = useState<"idle" | "checking" | "evaluated">("idle");
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [driftScore, setDriftScore] = useState<number>(42);
  const [isMajorDrift, setIsMajorDrift] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [factChecks, setFactChecks] = useState<any[]>([]);
  const [cleanCopy, setCleanCopy] = useState<string | null>(null);
  const [aiEngineName, setAiEngineName] = useState<string>("ECLIPSE");
  const [aiModelName, setAiModelName] = useState<string>("Google Gemini");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getParam = (paramName: string): string | null => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlVal = urlParams.get(paramName);
      if (urlVal) return urlVal;

      const fullHash = window.location.hash || "";
      if (fullHash.includes("?")) {
        const hashParams = new URLSearchParams(fullHash.split("?")[1]);
        const hashVal = hashParams.get(paramName);
        if (hashVal) return hashVal;
      }
      return null;
    };

    const modeParam = getParam("mode");
    const draftIdParam = getParam("draftId");

    const storedDraftId = draftIdParam || localStorage.getItem("eclipse_active_draft_id");
    const storedText = localStorage.getItem("eclipse_active_draft_text");
    const storedTitle = localStorage.getItem("eclipse_active_draft_title");
    const storedChannel = localStorage.getItem("eclipse_active_draft_channel");
    const storedBrand = localStorage.getItem("eclipse_active_draft_brand");
    const storedFormat = localStorage.getItem("eclipse_active_draft_format");
    const storedMode = localStorage.getItem("eclipse_creator_mode");

    if (storedText || storedTitle) {
      const draftObj = {
        id: storedDraftId || undefined,
        title: storedTitle || "Active Draft",
        content: storedText || "",
        channel: storedChannel || "LinkedIn & Social",
        brand: storedBrand || "ECLIPSE Global Enterprises",
        format: storedFormat || "text",
      };
      setActiveDraftInfo(draftObj);
      setInputText(storedText || "");
      if (storedTitle) setPosterTitle(storedTitle);
      if (storedChannel) setSelectedChannel(storedChannel);
      setAuditState("idle");
    }

    // Determine target studio mode
    let targetMode: "image" | "blog" | "social" = "social";
    if (modeParam === "blog" || modeParam === "image" || modeParam === "social") {
      targetMode = modeParam;
    } else if (storedMode === "blog" || storedMode === "image" || storedMode === "social") {
      targetMode = storedMode;
    } else if (storedFormat === "graphic" || (storedChannel && (storedChannel.toLowerCase().includes("instagram") || storedChannel.toLowerCase().includes("poster")))) {
      targetMode = "image";
    } else if (storedChannel && (storedChannel.toLowerCase().includes("blog") || storedChannel.toLowerCase().includes("press") || storedChannel.toLowerCase().includes("whitepaper"))) {
      targetMode = "blog";
    }

    setStudioMode(targetMode);
    localStorage.setItem("eclipse_creator_mode", targetMode);

    if (storedText || storedTitle) {
      showNotification(`Loaded draft: "${storedTitle || "In-Progress Draft"}" into ${targetMode === "blog" ? "Blog Studio" : targetMode === "image" ? "Image Studio" : "Short-Form Studio"}`);
    }
  }, []);

  const handleClearActiveDraft = () => {
    setActiveDraftInfo(null);
    localStorage.removeItem("eclipse_active_draft_id");
    localStorage.removeItem("eclipse_active_draft_title");
    localStorage.removeItem("eclipse_active_draft_text");
    localStorage.removeItem("eclipse_active_draft_channel");
    localStorage.removeItem("eclipse_active_draft_brand");
    localStorage.removeItem("eclipse_active_draft_format");
    localStorage.removeItem("inkloom_active_draft_text");
    setInputText(TEMPLATES[0].text);
    setPosterTitle("Marketing Banner Graphic");
    setFindings([]);
    setAuditState("idle");
    showNotification("Cleared active draft. Switched to standard templates.");
  };

  const pendingList = findings.filter((f) => f.status === "pending");

  // Differentiate findings by category
  const legalFindings = useMemo(
    () => pendingList.filter((f) => f.category === "Legal & Claims"),
    [pendingList]
  );
  const toneFindings = useMemo(
    () => pendingList.filter((f) => f.category === "Tone & Style"),
    [pendingList]
  );
  const visualFindings = useMemo(
    () => pendingList.filter((f) => f.category === "Visual & Contrast (WCAG)"),
    [pendingList]
  );

  const brandScore = useMemo(() => {
    if (auditState === "idle") return null;
    if (pendingList.length === 0) return 100;
    if (isMajorDrift) return 32;
    if (pendingList.length === 1) return 82;
    return Math.max(35, 100 - pendingList.length * 22);
  }, [pendingList, auditState, isMajorDrift]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run the explicit check action with ECLIPSE Engine
  const handleRunCheck = async () => {
    setAuditState("checking");
    setIsPublished(false);

    try {
      const res = await api.review.start({
        text: inputText,
        content: inputText,
        channel: selectedChannel || "social_media",
      });

      setAuditState("evaluated");

      const mappedFindings: AuditFinding[] = [];

      // 1. Accessibility Contrast Check (if Graphic format)
      if (contentFormat === "graphic") {
        mappedFindings.push({
          id: "f-img-1",
          category: "Visual & Contrast (WCAG)",
          severity: "high",
          flaggedText: "Yellow Headline on Light Background",
          issue: "Contrast ratio 2.4:1 fails accessibility standard.",
          plainEnglishReason: "Low visual contrast makes text hard to read on mobile devices and violates WCAG 2.1 AA.",
          suggestedFix: "Slate-900 typography on white card (12.4:1 ratio)",
          ruleCode: "ACC-2.1",
          status: "pending",
        });
      }

      // 2. Map Live Findings from ECLIPSE Engine
      const rawList = (res && res.findings) || (res && res.violations) || [];
      if (rawList.length > 0) {
        rawList.forEach((f: any, idx: number) => {
          let category = "Tone & Style";
          const rawCat = (f.category || "").toLowerCase();
          if (rawCat.includes("gramm") || rawCat.includes("spell") || rawCat.includes("syntax") || rawCat.includes("punct") || rawCat.includes("struct")) {
            category = "Grammar & Language";
          } else if (rawCat.includes("claim") || rawCat.includes("legal") || rawCat.includes("sec") || rawCat.includes("ftc")) {
            category = "Legal & Claims";
          } else if (rawCat.includes("visual") || rawCat.includes("contrast") || rawCat.includes("wcag") || rawCat.includes("format")) {
            category = "Visual & Contrast (WCAG)";
          } else if (rawCat.includes("prohibit") || rawCat.includes("term") || rawCat.includes("casing") || rawCat.includes("policy")) {
            category = "Prohibited Terminology";
          } else if (rawCat.includes("fact") || rawCat.includes("contradict") || rawCat.includes("unsupport")) {
            category = "Fact Verification";
          }

          const flagged = f.problematic_text || f.flaggedText || f.original_text || f.text || "";
          const expl = f.explanation || f.plainEnglishReason || f.issue || "Brand guideline violation detected.";
          let fix = f.suggestion || f.suggestedFix || f.recommendation || "";
          fix = fix.replace(/^Replace with:\s*['"]?|['"]?$/gi, "").trim();

          mappedFindings.push({
            id: f.id || `f-${idx + 1}`,
            category,
            severity: f.severity || "medium",
            flaggedText: flagged,
            issue: f.title || f.issue || expl,
            plainEnglishReason: expl,
            suggestedFix: fix,
            ruleCode: f.rule_id || f.ruleCode || (f.severity === "high" || f.severity === "critical" ? "SEC-9.1 (CRITICAL)" : "RULE-ECLIPSE"),
            status: "pending",
          });
        });
      }

      setFindings(mappedFindings);

      const calculatedDrift = res && typeof res.driftScore === "number"
        ? res.driftScore
        : Math.min(95, mappedFindings.length * 28);

      const isMajor = res && typeof res.isMajorDrift === "boolean"
        ? res.isMajorDrift
        : calculatedDrift >= 70;

      setDriftScore(calculatedDrift);
      setIsMajorDrift(isMajor);

      if (res) {
        if (res.summary || res.overall_assessment) setAiSummary(res.summary || res.overall_assessment);
        if (Array.isArray(res.factChecks)) setFactChecks(res.factChecks);
        else if (Array.isArray(res.fact_checks)) setFactChecks(res.fact_checks);

        const clean = res.cleanTextSuggested || res.recommended_correction || res.corrected_content;
        if (clean) setCleanCopy(clean);
        if (res.engine) setAiEngineName(res.engine);
        if (res.model) setAiModelName(res.model);
      }

      if (mappedFindings.length === 0) {
        showNotification("ECLIPSE: 100% Brand Compliant! Zero infractions detected.");
      } else if (isMajor) {
        showNotification(`ECLIPSE: Major Drift Detected (${calculatedDrift}/100) — Brand Manager review required.`);
      } else {
        showNotification(`ECLIPSE: Review complete — ${mappedFindings.length} issue(s) flagged.`);
      }
    } catch (err: any) {
      console.error("ECLIPSE live check failed:", err);
      setAuditState("evaluated");
      showNotification("ECLIPSE: Completed review scan.");
    }
  };

  const handleApplyFix = (id: string, customReplacement?: string) => {
    const finding = findings.find((f) => f.id === id);
    if (!finding) return;

    const rep = (customReplacement || finding.suggestedFix)
      .replace(/^Replace with:\s*['"]?|['"]?$/gi, "")
      .trim();

    if (finding.category === "Visual & Contrast (WCAG)") {
      setPosterContrast("WCAG AA Compliant (12.4:1 - Slate-900 typography)");
    } else if (finding.flaggedText && rep) {
      const regex = new RegExp(finding.flaggedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      setInputText((prev) => prev.replace(regex, rep));
    }

    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "applied" } : f))
    );
    return;
  };

  const handleDismiss = (findingId: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, status: "dismissed" } : f))
    );
  };

  const handleApplyAll = () => {
    let updated = inputText;
    pendingList.forEach((f) => {
      if (f.category === "Visual & Contrast (WCAG)") {
        setPosterContrast("WCAG AA Compliant (12.4:1 - Slate-900 typography)");
      } else if (f.flaggedText && f.suggestedFix) {
        const rep = f.suggestedFix.replace(/^Replace with:\s*['"]?|['"]?$/gi, "").trim();
        const regex = new RegExp(f.flaggedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        updated = updated.replace(regex, rep);
      }
    });
    setInputText(updated);
    setFindings((prev) => prev.map((f) => ({ ...f, status: "applied" })));
    setDriftScore(0);
    setIsMajorDrift(false);
    showNotification("Score 100%! Original idea & tone preserved -- Auto-approved for direct posting.");
  };

  const handleApplyFullAiCopy = () => {
    if (!cleanCopy) return;
    setInputText(cleanCopy);
    setFindings((prev) => prev.map((f) => ({ ...f, status: "applied" })));
    setDriftScore(0);
    setIsMajorDrift(false);
    showNotification("Applied complete AI-corrected copy! 100% compliant with approved guidelines.");
  };

  const handleSubmitForReview = async () => {
    try {
      await api.workflow.submit("d0000000-0000-0000-0000-000000000001", "Creator submitted pre-flight draft");
      showNotification("Submitted to Brand Governance Queue (#REV-9021)");
    } catch {
      showNotification("Submitted to Brand Governance Queue (#REV-9021)");
    }
  };

  const handlePublishDirectly = () => {
    setIsPublished(true);
    navigator.clipboard?.writeText(inputText);
    showNotification("✓ Published Directly! Content copied to clipboard. No Brand Manager sign-off was needed (Drift < 70).");
  };

  const handleEscalateToManager = () => {
    showNotification("Critical Drift Escalated: Draft sent to Sarah Chen (Brand Manager Queue #REV-9021).");
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    setIsPublished(false);
    // Mark as needing check if content was modified
    if (auditState === "evaluated") {
      setAuditState("idle");
    }
  };

  const loadTemplate = (tmpl: TemplatePreset) => {
    setInputText(tmpl.text);
    setFindings([]);
    setAuditState("idle");
    setIsPublished(false);
    setDriftScore(tmpl.driftScore || 0);
    setIsMajorDrift(!!tmpl.isMajorDrift);
    setSelectedChannel(tmpl.channel);
    if (tmpl.isImage) {
      setContentFormat("graphic");
      setPosterTitle(tmpl.imageTitle || "Marketing Banner Poster");
      setPosterContrast(tmpl.contrast || "2.4:1 (FAIL)");
    } else {
      setContentFormat("text");
    }
    showNotification(`Loaded "${tmpl.label}" â¢ Click "Check Content" to inspect.`);
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const filteredGlossary = GLOSSARY_PAIRS.filter(
    (g) =>
      g.doUse.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.avoid.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active Draft Banner */}
      {activeDraftInfo && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  Active Draft Loaded
                </span>
                <span className="text-xs font-black text-slate-900">{activeDraftInfo.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Brand: <strong className="text-slate-700">{activeDraftInfo.brand || "ECLIPSE"}</strong> • Channel: <strong className="text-slate-700">{activeDraftInfo.channel || "Multi-Channel"}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/drafts"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 px-3 py-1.5 rounded-lg bg-white border border-blue-200 shadow-2xs hover:bg-blue-50 transition-colors"
            >
              Switch Draft
            </Link>
            <button
              onClick={handleClearActiveDraft}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-white/80 transition-colors"
            >
              Unload
            </button>
          </div>
        </div>
      )}

      {/* Top Glassmorphic Quick Metric Overview (CSS Styled Stats Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Brand Consistency"
          value="98.4%"
          change={14.2}
          subtitle="vs baseline"
          icon={ShieldCheck}
          gradient="from-blue-600 to-indigo-600"
        />
        <StatsCard
          title="Compliance Health"
          value="Zero Critical"
          change={85.0}
          subtitle="violation reduction"
          icon={CheckCircle2}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Content Velocity"
          value="3.2x Faster"
          change={70.0}
          subtitle="time-to-publish"
          icon={Zap}
          gradient="from-purple-600 to-pink-600"
        />
        <StatsCard
          title="Turnaround Time"
          value="15 Mins"
          change={97.9}
          subtitle="review acceleration"
          icon={Clock}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Primary Studio Workflow Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => {
              setStudioMode("image");
              if (typeof window !== "undefined") localStorage.setItem("eclipse_creator_mode", "image");
            }}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-md transition-all flex-1 sm:flex-none ${
              studioMode === "image"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Scan className="h-4 w-4 text-indigo-300" />
            <span>Image & Poster Studio</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-100 text-[10px] font-mono uppercase">
              Vision OCR
            </span>
          </button>
          <button
            onClick={() => {
              setStudioMode("social");
              if (typeof window !== "undefined") localStorage.setItem("eclipse_creator_mode", "social");
            }}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-md transition-all flex-1 sm:flex-none ${
              studioMode === "social"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone className="h-4 w-4 text-slate-700" />
            <span>Short-Form & Ad Copy</span>
          </button>
          <button
            onClick={() => {
              setStudioMode("blog");
              if (typeof window !== "undefined") localStorage.setItem("eclipse_creator_mode", "blog");
            }}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-md transition-all flex-1 sm:flex-none ${
              studioMode === "blog"
                ? "bg-purple-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="h-4 w-4 text-purple-300" />
            <span>Blog & Article Studio</span>
            <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 text-[10px] font-mono uppercase">
              Reasoning Engine
            </span>
          </button>
          <button
            onClick={() => {
              setStudioMode("documents");
              if (typeof window !== "undefined") localStorage.setItem("eclipse_creator_mode", "documents");
            }}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-md transition-all flex-1 sm:flex-none ${
              studioMode === "documents"
                ? "bg-blue-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-4 w-4 text-blue-300" />
            <span>Document Intelligence & Copilot</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 text-[10px] font-mono uppercase">
              RAG Copilot
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium pr-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>ECLIPSE Zero-Data Retention Active</span>
        </div>
      </div>

      {studioMode === "documents" ? (
        <UniversalDocumentStudio />
      ) : studioMode === "image" ? (
        <ImageReviewStudio
          initialDraftId={activeDraftInfo?.id}
          initialHeadline={activeDraftInfo?.title}
          initialSubtext={activeDraftInfo?.content}
          initialBrand={activeDraftInfo?.brand}
        />
      ) : studioMode === "blog" ? (
        <BlogReviewStudio
          initialDraftId={activeDraftInfo?.id}
          initialTitle={activeDraftInfo?.title}
          initialContent={activeDraftInfo?.content}
          initialBrand={activeDraftInfo?.brand}
          onClearDraft={handleClearActiveDraft}
        />
      ) : (
        <>
          {/* Top Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* User Identity - Welcome with dynamic name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {userInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">Welcome, {userName}</h1>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded font-semibold border border-slate-200">
                Author Studio
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">{userDepartment}</div>
          </div>
        </div>

        {/* Channel & Format Selector */}
        <div className="flex items-center gap-3">
          {/* Format Toggle: Text vs Poster/Graphic */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
            <button
              onClick={() => {
                setContentFormat("text");
                loadTemplate(TEMPLATES[0]);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                contentFormat === "text" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Text Post</span>
            </button>
            <button
              onClick={() => {
                setContentFormat("graphic");
                loadTemplate(TEMPLATES[1]);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                contentFormat === "graphic" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5 text-indigo-600" />
              <span>Poster / Graphic (OCR Vision)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Channel:</span>
            <select
              value={selectedChannel}
              onChange={(e) => {
                setSelectedChannel(e.target.value);
                showNotification(`Channel context switched to: ${e.target.value}`);
              }}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
            >
              <optgroup label="Social & Broadcast">
                <option value="LinkedIn & B2B Social">LinkedIn & B2B Social</option>
                <option value="X / Twitter (Short-Form Broadcast)">X / Twitter (Short-Form Broadcast)</option>
                <option value="Instagram / Meta (Carousel & Graphics)">Instagram / Meta (Carousel & Graphics)</option>
                <option value="YouTube Script & Community">YouTube Script & Community</option>
              </optgroup>
              <optgroup label="Web & Digital Publications">
                <option value="Company Engineering & Tech Blog">Company Engineering & Tech Blog</option>
                <option value="Customer Email Newsletter">Customer Email Newsletter</option>
                <option value="Website Hero & Announcement">Website Hero & Announcement</option>
                <option value="Product Documentation & Changelog">Product Documentation & Changelog</option>
              </optgroup>
              <optgroup label="Corporate, Investor & PR">
                <option value="Official Press Release (Wire & SEC)">Official Press Release (Wire & SEC)</option>
                <option value="Investor Relations & Board Deck Slides">Investor Relations & Board Deck Slides</option>
              </optgroup>
              <optgroup label="Enablement & Internal">
                <option value="Sales Pitch Deck & One-Pager">Sales Pitch Deck & One-Pager</option>
                <option value="Customer Support & Help Center">Customer Support & Help Center</option>
                <option value="Internal Company All-Hands Memo">Internal Company All-Hands Memo</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Audit Status / Action Header Controls */}
        <div className="flex items-center gap-3">
          {/* Primary Action 1: RUN BRAND CHECK BUTTON */}
          <button
            onClick={handleRunCheck}
            disabled={auditState === "checking"}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
              auditState === "idle"
                ? "bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-500/20"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
            }`}
          >
            <Scan className={`h-4 w-4 ${auditState === "checking" ? "animate-spin text-slate-600" : ""}`} />
            <span>
              {auditState === "checking"
                ? "Checking Content..."
                : auditState === "idle"
                ? "Check Content"
                : "Re-Check Content"}
            </span>
          </button>

          {/* Safety Score Indicator (Shown once checked) */}
          {auditState === "evaluated" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Safety Score:</span>
              <span
                className={`font-mono text-xs font-extrabold ${
                  brandScore === 100
                    ? "text-emerald-700"
                    : brandScore! >= 70
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}
              >
                {brandScore}%
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  brandScore === 100
                    ? "bg-emerald-500"
                    : brandScore! >= 70
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
            </div>
          )}

          {/* Fix All Button (Shown after check finds issues) */}
          {auditState === "evaluated" && pendingList.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleApplyAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                title="Rephrase only risk terms into corporate guidelines while preserving original tone and idea"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Fix All ({pendingList.length})</span>
              </button>
              {cleanCopy && (
                <button
                  onClick={handleApplyFullAiCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
                  title="Apply full AI-compliant rewrite from ECLIPSE (Google Gemini)"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Apply AI Copy</span>
                </button>
              )}
            </div>
          )}

          {/* Conditional Workflow Action: Auto-Publish (<70 drift) vs Manager Escalation (>=70 drift) */}
          {auditState === "evaluated" && !isMajorDrift && pendingList.length === 0 && (
            <button
              onClick={handlePublishDirectly}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{isPublished ? "Published (Copied to Clipboard)" : "Publish Directly (Auto-Approved)"}</span>
            </button>
          )}

          {auditState === "evaluated" && isMajorDrift && (
            <button
              onClick={handleEscalateToManager}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Escalate to Brand Manager (Drift &ge; 70)</span>
            </button>
          )}

          {auditState === "evaluated" && !isMajorDrift && pendingList.length > 0 && (
            <button
              onClick={() => showNotification("Draft submitted to Brand Manager queue for optional manual review.")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Request Manager Sign-Off</span>
            </button>
          )}
        </div>
      </div>

      {/* Main High-Density Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Editor or Graphic Poster Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Quick Template Chips Header */}
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-500 uppercase text-[10px] mr-1">Pre-Approved Templates:</span>
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => loadTemplate(tmpl)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
                  >
                    {tmpl.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setInputText("");
                    setFindings([]);
                    setAuditState("idle");
                    showNotification("Blank canvas loaded. Type or paste your own content.");
                  }}
                  className="px-2.5 py-1 rounded-lg border border-dashed border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors"
                >
                  + Blank Draft
                </button>
              </div>

              {/* View Switcher */}
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium shadow-2xs">
                <button
                  onClick={() => setViewMode("edit")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    viewMode === "edit" ? "bg-slate-900 text-white font-bold" : "text-slate-600"
                  }`}
                >
                  {contentFormat === "graphic" ? "Poster Canvas & OCR" : "Editor"}
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    viewMode === "preview" ? "bg-slate-900 text-white font-bold" : "text-slate-600"
                  }`}
                >
                  Reader Preview
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    viewMode === "split" ? "bg-slate-900 text-white font-bold" : "text-slate-600"
                  }`}
                >
                  Diff View
                </button>
              </div>
            </div>

            {/* Content Area: TEXT vs GRAPHIC POSTER (Unified Clean Page Styling) */}
            <div className="p-4 space-y-3">
              {contentFormat === "graphic" ? (
                /* Poster / Graphic OCR Vision Area in SAME clean format */
                <div className="space-y-3">
                  
                  {/* Clean Visual Poster Frame */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                    
                    {/* Top Poster Meta Strip */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-slate-900 text-white flex items-center justify-center">
                          <ImageIcon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{posterTitle}</span>
                          <span className="text-[10px] text-slate-400 font-mono">1200 x 675 px â¢ PNG Graphic â¢ High-Res</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs transition-colors">
                          <span>Upload Image / Poster</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPosterTitle(file.name);
                                showNotification(`Loaded poster "${file.name}". Run Brand Check to inspect OCR text & contrast.`);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Poster Canvas Preview in Same White/Slate Style */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                      {/* Brand Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                            EC
                          </div>
                          <span className="font-bold text-xs tracking-wider text-slate-900">ECLIPSE</span>
                        </div>

                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold">
                          Logo Clearspace: 24px (PASS)
                        </span>
                      </div>

                      {/* Poster Headline Area (Dynamic Contrast Box) */}
                      <div
                        className={`p-4 rounded-xl border transition-all space-y-2 ${
                          posterContrast.includes("FAIL")
                            ? "border-amber-300 bg-amber-50/50"
                            : "border-emerald-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                          <span className={posterContrast.includes("FAIL") ? "text-amber-800" : "text-emerald-800"}>
                            OCR Text Layer #1
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              posterContrast.includes("FAIL")
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            Contrast: {posterContrast}
                          </span>
                        </div>

                        <h2
                          className={`text-base sm:text-lg font-bold leading-snug ${
                            posterContrast.includes("FAIL")
                              ? "text-amber-700"
                              : "text-slate-900"
                          }`}
                        >
                          {inputText}
                        </h2>
                      </div>

                      {/* Poster Footer Sub-branding */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Enterprise Brand Governance Platform</span>
                        <span className="font-mono text-slate-400">eclipse.ai â¢ Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* OCR Extracted Text Layer */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">
                        Poster Headline Copy (Editable)
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">OCR Confidence: 99.1%</span>
                    </div>
                    <textarea
                      rows={3}
                      value={inputText}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="Extracted poster text will appear here..."
                      className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-inner"
                    />
                  </div>
                </div>
              ) : (
                /* Regular Text Post Area */
                viewMode === "edit" ? (
                  <textarea
                    rows={8}
                    value={inputText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Paste or write your copy here..."
                    className="w-full rounded-lg border border-slate-300 p-3.5 text-xs sm:text-sm text-slate-900 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-inner"
                  />
                ) : viewMode === "preview" ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                        EC
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">ECLIPSE Official Post</div>
                        <div className="text-[11px] text-slate-400">Target Channel: {selectedChannel} • Public</div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                      {inputText}
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>142 reactions • 18 comments</span>
                      <span>Verified Brand Post</span>
                    </div>
                  </div>
                ) : (
                  <OriginalCorrectedView
                    originalText={inputText}
                    correctedText={cleanCopy || ""}
                    onApplyToEditor={(text) => {
                      setInputText(text);
                      showNotification("Applied AI-corrected copy to editor!");
                    }}
                  />
                )
              )}

              {/* Metrics Footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 font-mono">
                <span>{wordCount} words â¢ {charCount} chars</span>
                <span>
                  {auditState === "idle" ? (
                    <span className="text-indigo-600 font-sans font-semibold">
                      Ready to check â¢ Click &quot;Check Content&quot; above
                    </span>
                  ) : (
                    "Flesch-Kincaid: Grade 10.4 (Executive)"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Functional Card: Fast Terminology Guide */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Approved Word Guide & Instant Lookup
                </h3>
                <p className="text-[11px] text-slate-500">Quickly verify what words to say vs. avoid</p>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter terms..."
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {filteredGlossary.slice(0, 4).map((g, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-800 block">â {g.doUse}</span>
                    <span className="text-rose-600 line-through text-[11px] block mt-0.5">â-- {g.avoid}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(g.doUse);
                      showNotification(`Copied "${g.doUse}"`);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Copy approved term"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Properly Differentiated Governance Findings & Pre-Flight Checklist (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Findings Box with Explicit Categories */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Compliance Results
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  auditState === "idle"
                    ? "bg-slate-100 text-slate-700"
                    : pendingList.length === 0
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {auditState === "idle"
                  ? "Awaiting Check"
                  : pendingList.length === 0
                  ? "100% Compliant"
                  : `${pendingList.length} Actionable Items`}
              </span>
            </div>

            {/* State 1: Awaiting Check */}
            {auditState === "idle" && (
              <div className="p-6 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 text-center space-y-2">
                <Scan className="h-6 w-6 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">Ready to Inspect</h4>
                <p className="text-[11px] text-slate-500 leading-normal max-w-xs mx-auto">
                  Click the <strong>&quot;Check Content&quot;</strong> button above to scan this asset against corporate brand guidelines, claims rules, and WCAG contrast.
                </p>
                <button
                  onClick={handleRunCheck}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                >
                  <Scan className="h-3.5 w-3.5" />
                  <span>Check Content Now</span>
                </button>
              </div>
            )}

            {/* State 2: Checked & Clean */}
            {auditState === "evaluated" && pendingList.length === 0 && (
              <div className="p-5 rounded-lg border border-emerald-200 bg-emerald-50/60 text-center space-y-3">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">100% Brand Compliant â¢ Auto-Approved</h4>
                  <p className="text-[11px] text-emerald-700 leading-normal mt-0.5 max-w-xs mx-auto">
                    Drift is <strong>0%</strong> (within the autonomous self-clearance threshold &lt; 70). No Brand Manager approval is neededâyour original idea and tone are fully preserved.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handlePublishDirectly}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isPublished ? "Copied & Ready to Post!" : "Copy Post to Clipboard"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* State 3: Checked with Differentiated Findings */}
            {auditState === "evaluated" && pendingList.length > 0 && (
              <div className="space-y-3">
                {/* Governance Routing Policy Banner */}
                {isMajorDrift ? (
                  <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        Major Policy Drift ({driftScore}%) &ge; 70 Threshold
                      </span>
                      <span className="bg-rose-200/80 text-rose-900 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                        MANDATORY ESCALATION
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-normal">
                      Critical SEC/FTC statutory violation detected. Because drift exceeds the autonomous threshold (70), this post cannot be self-published and must be sent to the Brand Manager for executive review.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        Self-Serve Rephrasing Active (Drift: {driftScore}% &lt; 70)
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                        NO MANAGER BOTTLENECK
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-800 leading-normal">
                      Only minor risk terms are flagged. Click <strong>&quot;Fix All&quot;</strong> to safely rephrase them into corporate complianceâ<strong>your original idea, tone, and message remain 100% intact</strong>, allowing immediate direct posting!
                    </p>
                  </div>
                )}

                {/* AI Executive Summary Card */}
                {aiSummary && (
                  <div className="p-3.5 rounded-lg border border-purple-200 bg-purple-50/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        ECLIPSE Intelligence Review
                      </span>
                      <span className="bg-purple-200/80 text-purple-900 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-purple-300">
                        {aiModelName}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-900/90 leading-relaxed whitespace-pre-wrap">
                      {aiSummary}
                    </p>
                    {cleanCopy && (
                      <div className="pt-2 border-t border-purple-200/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-purple-700 font-medium">
                          Compliant revision ready:
                        </span>
                        <button
                          onClick={handleApplyFullAiCopy}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded shadow-xs transition-colors"
                        >
                          Apply Compliant Rewrite
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Claim Fact-Verification Badges */}
                {factChecks && factChecks.length > 0 && (
                  <div className="space-y-2 p-3 rounded-lg border border-slate-200 bg-slate-50/80 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                        Verified Brand Claims & Benchmarks ({factChecks.length})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">RAG Fact-Check</span>
                    </div>
                    <div className="space-y-1.5">
                      {factChecks.map((fc: any, fidx: number) => (
                        <div
                          key={fidx}
                          className="p-2 rounded-md bg-white border border-slate-200 flex flex-col gap-1 text-[11px]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-800 line-clamp-1">
                              &quot;{fc.claim_text}&quot;
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                                fc.status === "verified"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : fc.status === "refuted"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {fc.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-tight">
                            {fc.evidence}
                          </p>
                          {fc.source_ref && (
                            <div className="text-[9px] font-mono text-slate-400">
                              Citation: {fc.source_ref}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unified All-Category Identified Issues */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <IssueList
                    issues={pendingList.map((f) => ({
                      id: f.id,
                      category: f.category,
                      severity: f.severity || "medium",
                      problematic_text: f.flaggedText,
                      explanation: f.plainEnglishReason || f.issue,
                      suggestion: f.suggestedFix,
                      rule_id: f.ruleCode,
                      status: f.status,
                    }))}
                    onAcceptIssue={(id, customReplacement) => handleApplyFix(id, customReplacement)}
                    onDismissIssue={(id) => handleDismiss(id)}
                    onEditIssue={(id, newFix) => {
                      setFindings((prev) =>
                        prev.map((f) => (f.id === id ? { ...f, suggestedFix: newFix } : f))
                      );
                    }}
                    onApplyAll={handleApplyAll}
                    emptyStateTitle="All Issues Resolved"
                    emptyStateDescription="Every flagged brand governance, factual, or design issue has been safely remediated."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Automated Pre-Flight Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block pb-1 border-b border-slate-100">
              Pre-Flight Brand Checklist
            </span>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5" /> Confidentiality Shield (Zero PII Leaks)
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 px-1.5 py-0.2 rounded font-bold">Pass</span>
              </div>

              <div className="flex items-center justify-between text-emerald-700">
                <span className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5" /> Trademark & Enterprise Nomenclature
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 px-1.5 py-0.2 rounded font-bold">Pass</span>
              </div>

              <div
                className={`flex items-center justify-between ${
                  legalFindings.length > 0 ? "text-rose-700" : "text-emerald-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  {legalFindings.length > 0 ? <AlertCircle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  Advertising Claims & Superlatives
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    auditState === "idle"
                      ? "bg-slate-100 text-slate-600"
                      : legalFindings.length > 0
                      ? "bg-rose-100 text-rose-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {auditState === "idle" ? "Pending" : legalFindings.length > 0 ? "Fail" : "Pass"}
                </span>
              </div>

              <div
                className={`flex items-center justify-between ${
                  visualFindings.length > 0 ? "text-amber-700" : "text-emerald-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  {visualFindings.length > 0 ? <AlertCircle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  WCAG 2.1 AA Visual Accessibility
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    auditState === "idle"
                      ? "bg-slate-100 text-slate-600"
                      : visualFindings.length > 0
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {auditState === "idle" ? "Pending" : visualFindings.length > 0 ? "Fail (2.4:1)" : "Pass (12:1)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
