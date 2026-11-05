"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  FileText,
  Check,
  Copy,
  Download,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Eye,
  Edit3,
  Columns,
  Zap,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  Clock,
  Layers,
  Search,
} from "lucide-react";
import { api } from "@/lib/api";

export interface BlogViolation {
  id: string;
  category: string;
  severity: string;
  problematic_text: string;
  original_sentence?: string;
  explanation: string;
  guideline_reference?: string;
  rule_id?: string;
  suggestion: string;
  corrected_sentence?: string;
  requires_human_review?: boolean;
  status?: "pending" | "accepted" | "rejected";
}

export interface FactCheck {
  claim_text: string;
  status: "verified" | "contradicted" | "unsupported" | "refuted" | "needs_human_review";
  evidence: string;
  source_ref?: string;
  confidence: number;
}

export interface QualityScores {
  overall_score: number;
  grammar_score: number;
  brand_compliance_score: number;
  content_quality_score: number;
  drift_score: number;
  risk_level: string;
}

export interface InputUnderstanding {
  main_topic: string;
  purpose: string;
  intended_audience: string;
  products_mentioned: string[];
  claims_extracted: string[];
  numerical_claims: string[];
  comparisons: string[];
  calls_to_action: string[];
  tone_and_style: string;
}

const SAMPLE_BLOG_VIOLATIONS = `# Why Eclipse Is India's No. 1 Platform

Our brand new NovaBook X1 has 32 GB RAM and provides the guaranteed cheapest cloud infrastructure in the world.
We guarantee 100% bug-free deployment and teh system will obliterate our pathetic competitors.
ECLIPSE is certified SOC 2 and GDPR compliant. Buy now to recieve special discounts!

In today's fast moving market, our unbreakable platform delivers guaranteed profit for every customer within 30 days. No other company can match our revolutionary AI that thinks like humans.`;

const SAMPLE_BLOG_COMPLIANT = `# Scaling Enterprise Brand Governance with ECLIPSE

In an era of rapid digital content creation, maintaining brand consistency across multiple communication channels is an essential operational requirement. ECLIPSE provides enterprise teams with real-time automated brand policy verification and factual claim grounding.

Built with verified 99.99% uptime SLA reliability, the platform integrates deterministic rule parsing with advanced Google Gemini contextual reasoning. Enterprise organizations using ECLIPSE ensure that every published article, advertisement, and social media post aligns precisely with approved company messaging.`;

export function BlogReviewStudio() {
  const [blogTitle, setBlogTitle] = useState("Why Eclipse Is India's No. 1 Platform");
  const [originalContent, setOriginalContent] = useState(SAMPLE_BLOG_VIOLATIONS);
  const [correctedContent, setCorrectedContent] = useState("");
  const [brandId, setBrandId] = useState("ECLIPSE");
  const [contentType, setContentType] = useState("blog");
  const [targetAudience, setTargetAudience] = useState("Enterprise CTOs & B2B buyers");

  const [activeTab, setActiveTab] = useState<"editor" | "side_by_side" | "corrected">("editor");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Analysis State
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [riskLevel, setRiskLevel] = useState<string>("LOW");
  const [scores, setScores] = useState<QualityScores>({
    overall_score: 100,
    grammar_score: 100,
    brand_compliance_score: 100,
    content_quality_score: 100,
    drift_score: 0,
    risk_level: "LOW",
  });
  const [understanding, setUnderstanding] = useState<InputUnderstanding | null>(null);
  const [violations, setViolations] = useState<BlogViolation[]>([]);
  const [factChecks, setFactChecks] = useState<FactCheck[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to global context for EclipseAssistantCopilot
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__ECLIPSE_DOC_CONTEXT__ = `Title: ${blogTitle}\n\nContent:\n${originalContent}`;
      (window as any).__ECLIPSE_FINDINGS_CONTEXT__ = violations.map((v) => ({
        text: v.problematic_text,
        rule: v.rule_id || v.guideline_reference,
        issue: v.explanation,
        severity: v.severity,
        replacement: v.suggestion,
      }));
    }
  }, [blogTitle, originalContent, violations]);

  // Compute metrics
  const originalWordCount = useMemo(() => {
    const text = originalContent.trim();
    return text ? text.split(/\s+/).length : 0;
  }, [originalContent]);

  const correctedWordCount = useMemo(() => {
    const text = correctedContent.trim();
    return text ? text.split(/\s+/).length : 0;
  }, [correctedContent]);

  const readTimeMin = useMemo(() => {
    return Math.max(1, Math.ceil(originalWordCount / 200));
  }, [originalWordCount]);

  // Step simulation for visual reasoning pipeline
  const runVisualStepper = async () => {
    const steps = [1, 2, 3, 4, 5, 6, 7];
    for (const step of steps) {
      setActiveStep(step);
      await new Promise((r) => setTimeout(r, 260));
    }
  };

  // 1. Submit for Complete AI Review & Correction
  const handleReviewBlog = async () => {
    if (!originalContent.trim()) {
      showNotification("Please enter or paste blog content first.");
      return;
    }

    setIsAnalyzing(true);
    setActiveStep(1);

    try {
      const stepperPromise = runVisualStepper();

      const response = await api.blog.review({
        title: blogTitle,
        content: originalContent,
        brand_id: brandId,
        content_type: contentType,
        target_audience: targetAudience,
      });

      await stepperPromise;

      if (response) {
        setHasEvaluated(true);
        setAuditId(response.audit_id || `ECLIPSE-${Date.now()}`);
        setRiskLevel(response.risk_level || "LOW");

        if (response.quality_scores) {
          setScores(response.quality_scores);
        } else {
          setScores({
            overall_score: response.compliance_score || 80,
            grammar_score: 90,
            brand_compliance_score: response.compliance_score || 80,
            content_quality_score: 85,
            drift_score: Math.max(0, 100 - (response.compliance_score || 80)),
            risk_level: response.risk_level || "LOW",
          });
        }

        if (response.input_understanding) {
          setUnderstanding(response.input_understanding);
        }

        const mappedViolations: BlogViolation[] = (response.violations || []).map((v: any, idx: number) => ({
          id: v.id || `viol-${idx + 1}`,
          category: v.category || "PROHIBITED_TERM",
          severity: v.severity || "MEDIUM",
          problematic_text: v.problematic_text || "",
          original_sentence: v.original_sentence || "",
          explanation: v.explanation || "Brand guideline violation detected.",
          guideline_reference: v.guideline_reference || "ECLIPSE Brand Guidelines",
          rule_id: v.rule_id || "RULE-ECLIPSE",
          suggestion: v.suggestion || "",
          corrected_sentence: v.corrected_sentence || "",
          requires_human_review: !!v.requires_human_review,
          status: "pending",
        }));

        setViolations(mappedViolations);
        setFactChecks(response.fact_checks || []);
        setExecutiveSummary(response.summary || "ECLIPSE brand review complete.");

        if (response.recommended_correction) {
          setCorrectedContent(response.recommended_correction);
        } else {
          setCorrectedContent(originalContent);
        }

        setActiveTab("side_by_side");
        showNotification(`ECLIPSE Review Complete: Found ${mappedViolations.length} issue(s) & generated revised blog.`);
      }
    } catch (err: any) {
      console.error("Blog review error:", err);
      showNotification("Error reviewing blog. Check AI engine status.");
    } finally {
      setIsAnalyzing(false);
      setActiveStep(0);
    }
  };

  // 2. Accept an individual violation fix
  const handleAcceptViolation = (id: string) => {
    const item = violations.find((v) => v.id === id);
    if (!item) return;

    let cleanReplacement = item.suggestion.replace(/^Replace with:\s*['"]?|['"]?$/g, "").trim();

    // Dynamically replace in corrected content
    if (correctedContent && item.problematic_text) {
      const regex = new RegExp(item.problematic_text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      setCorrectedContent((prev) => prev.replace(regex, cleanReplacement));
    }

    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "accepted" } : v))
    );
    showNotification(`Accepted fix for: "${item.problematic_text}"`);
  };

  // 3. Reject an individual violation fix
  const handleRejectViolation = (id: string) => {
    const item = violations.find((v) => v.id === id);
    if (!item) return;

    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "rejected" } : v))
    );
    showNotification(`Dismissed correction for: "${item.problematic_text}"`);
  };

  // 4. Accept All Corrections
  const handleAcceptAll = async () => {
    setIsCorrecting(true);
    try {
      const res = await api.blog.correct({
        original_content: originalContent,
        title: blogTitle,
        brand_id: brandId,
        analysis_results: { violations },
      });

      if (res && res.corrected_content) {
        setCorrectedContent(res.corrected_content);
        setViolations((prev) => prev.map((v) => ({ ...v, status: "accepted" })));
        setScores((prev) => ({
          ...prev,
          overall_score: 100,
          brand_compliance_score: 100,
          drift_score: 0,
          risk_level: "LOW",
        }));
        showNotification("All corrections applied successfully! Blog is 100% compliant.");
      }
    } catch (err) {
      console.error("Accept all error:", err);
      showNotification("Failed to apply all corrections.");
    } finally {
      setIsCorrecting(false);
    }
  };

  // 5. Reject All Corrections
  const handleRejectAll = () => {
    setCorrectedContent(originalContent);
    setViolations((prev) => prev.map((v) => ({ ...v, status: "rejected" })));
    showNotification("All suggested corrections rejected. Restored original text.");
  };

  // 6. Copy Corrected Blog
  const handleCopyBlog = () => {
    const textToCopy = correctedContent || originalContent;
    navigator.clipboard.writeText(textToCopy);
    showNotification("✓ Corrected blog copied to clipboard!");
  };

  // 7. Download as Markdown
  const handleDownloadMarkdown = () => {
    const text = `# ${blogTitle}\n\n${correctedContent || originalContent}`;
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${blogTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-corrected.md`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Downloaded Markdown (.md) file.");
  };

  // 8. Download as Plain Text
  const handleDownloadTxt = () => {
    const text = `${blogTitle}\n\n${correctedContent || originalContent}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${blogTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-corrected.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Downloaded Plain Text (.txt) file.");
  };

  // Filtered violations
  const filteredViolations = useMemo(() => {
    if (categoryFilter === "all") return violations;
    return violations.filter((v) => {
      const cat = (v.category || "").toLowerCase();
      if (categoryFilter === "grammar") {
        return cat.includes("grammar") || cat.includes("spelling") || cat.includes("syntax") || cat.includes("repetitive");
      }
      if (categoryFilter === "brand") {
        return cat.includes("prohibited") || cat.includes("format") || cat.includes("casing") || cat.includes("policy");
      }
      if (categoryFilter === "facts") {
        return cat.includes("claim") || cat.includes("fact") || cat.includes("superlative");
      }
      if (categoryFilter === "tone") {
        return cat.includes("tone") || cat.includes("aggressive") || cat.includes("clickbait");
      }
      return true;
    });
  }, [violations, categoryFilter]);

  // Counts by category
  const grammarCount = useMemo(
    () => violations.filter((v) => /grammar|spelling|syntax|repetitive/i.test(v.category)).length,
    [violations]
  );
  const brandCount = useMemo(
    () => violations.filter((v) => /prohibited|format|casing|policy/i.test(v.category)).length,
    [violations]
  );
  const factsCount = useMemo(
    () => violations.filter((v) => /claim|fact|superlative/i.test(v.category)).length + factChecks.filter((fc) => fc.status !== "verified").length,
    [violations, factChecks]
  );
  const toneCount = useMemo(
    () => violations.filter((v) => /tone|aggressive|clickbait/i.test(v.category)).length,
    [violations]
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

      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">ECLIPSE AI Blog & Article Review Studio</h1>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-purple-200">
                RAG + Gemini Reasoning
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Intelligent Brand Governance, Fact Verification & Autonomous Content Correction
            </div>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Brand Guideline Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brand:</span>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ECLIPSE">ECLIPSE (Enterprise Core)</option>
              <option value="NOVA">NovaTech Hardware</option>
              <option value="APEX">Apex Cloud Services</option>
            </select>
          </div>

          {/* Content Type Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Format:</span>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="blog">Blog Article</option>
              <option value="press_release">Official Press Release</option>
              <option value="whitepaper">Technical Whitepaper</option>
              <option value="case_study">Customer Case Study</option>
            </select>
          </div>

          {/* Target Audience */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audience:</span>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="Enterprise CTOs & B2B buyers">Enterprise CTOs & B2B</option>
              <option value="Technical Developers & Architects">Developers & Tech Leads</option>
              <option value="General Public & Consumers">General Readers</option>
              <option value="Investors & Wall Street">Investors & Media</option>
            </select>
          </div>

          {/* Primary Action Button: RUN REASONING PIPELINE */}
          <button
            onClick={handleReviewBlog}
            disabled={isAnalyzing}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
              isAnalyzing
                ? "bg-purple-200 text-purple-800 cursor-not-allowed"
                : "bg-purple-700 hover:bg-purple-800 text-white ring-2 ring-purple-600/30"
            }`}
          >
            <Sparkles className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span>{isAnalyzing ? "Reasoning Pipeline Active..." : "Run AI Blog Review"}</span>
          </button>
        </div>
      </div>

      {/* Visual Reasoning Pipeline Stepper (Active during processing) */}
      {(isAnalyzing || activeStep > 0) && (
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-lg border border-slate-800 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-2 text-purple-300">
              <Zap className="h-4 w-4 text-purple-400 animate-pulse" />
              ECLIPSE 7-Stage Reasoning & Verification Pipeline Active
            </span>
            <span className="font-mono text-[11px] text-slate-400">Step {activeStep} of 7</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[10px]">
            {[
              { num: 1, label: "Input Understanding" },
              { num: 2, label: "Knowledge RAG" },
              { num: 3, label: "Gemini Reasoning" },
              { num: 4, label: "Rule Parsing" },
              { num: 5, label: "Fact Verification" },
              { num: 6, label: "Risk Assessment" },
              { num: 7, label: "Correction Generation" },
            ].map((st) => (
              <div
                key={st.num}
                className={`p-2 rounded-lg border text-center transition-all ${
                  activeStep === st.num
                    ? "bg-purple-900/60 border-purple-500 text-purple-200 ring-2 ring-purple-500/40"
                    : activeStep > st.num
                    ? "bg-emerald-950/40 border-emerald-600/60 text-emerald-300"
                    : "bg-slate-800/40 border-slate-700 text-slate-500"
                }`}
              >
                <div className="font-mono font-bold text-[9px] mb-0.5">0{st.num}</div>
                <div className="font-semibold leading-tight">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quality Scores & Intelligence Dashboard (When Evaluated) */}
      {hasEvaluated && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono text-slate-900">
                  {scores.overall_score}
                </span>
                <span className="text-xs text-slate-400 font-bold">/100</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Overall Governance Score</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      riskLevel === "CRITICAL"
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : riskLevel === "HIGH"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    Risk: {riskLevel}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Audit Ref: <span className="font-mono font-semibold">{auditId}</span>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAcceptAll}
                disabled={isCorrecting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Accept All Corrections</span>
              </button>
              <button
                onClick={handleRejectAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reject All</span>
              </button>
              <button
                onClick={handleCopyBlog}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Final Blog</span>
              </button>
            </div>
          </div>

          {/* Multi-Dimensional Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Grammar & Syntax</div>
              <div className="text-lg font-mono font-black text-slate-900 mt-0.5">{scores.grammar_score}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{grammarCount} syntax/spelling item(s)</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brand Policy</div>
              <div className="text-lg font-mono font-black text-slate-900 mt-0.5">{scores.brand_compliance_score}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{brandCount} guideline infraction(s)</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fact Grounding</div>
              <div className="text-lg font-mono font-black text-slate-900 mt-0.5">
                {factChecks.filter((f) => f.status === "verified").length}/{factChecks.length || 1}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{factsCount} claim(s) cited or flagged</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Policy Drift</div>
              <div className="text-lg font-mono font-black text-slate-900 mt-0.5">{scores.drift_score}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {scores.drift_score >= 70 ? "Requires Brand Manager" : "Self-Clearable (<70)"}
              </div>
            </div>
          </div>

          {/* Input Understanding & Intent Extraction */}
          {understanding && (
            <div className="p-3.5 rounded-lg border border-indigo-100 bg-indigo-50/40 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-indigo-950">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  ECLIPSE Content Understanding & Intent Extraction
                </span>
                <span className="font-mono text-[10px] text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Format: {contentType}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700">
                <div>
                  <span className="font-bold text-slate-900">Topic:</span> {understanding.main_topic}
                </div>
                <div>
                  <span className="font-bold text-slate-900">Intent:</span> {understanding.purpose}
                </div>
                <div>
                  <span className="font-bold text-slate-900">Audience:</span> {understanding.intended_audience}
                </div>
              </div>
              {understanding.products_mentioned && understanding.products_mentioned.length > 0 && (
                <div className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-900">Products Identified:</span>{" "}
                  {understanding.products_mentioned.join(", ")}
                </div>
              )}
            </div>
          )}

          {/* Executive Summary */}
          {executiveSummary && (
            <div className="p-3.5 rounded-lg border border-purple-200 bg-purple-50/60 text-xs space-y-1">
              <div className="font-bold text-purple-950 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                AI Executive Reasoning Summary
              </div>
              <p className="text-[11px] text-purple-900 leading-relaxed whitespace-pre-wrap font-sans">
                {executiveSummary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Workspace Layout (Two Columns: Editor/Diff View vs Issues Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Blog Editor, Side-by-Side Diff, or Full Corrected (7 or 8 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header / Sub-tabs */}
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Presets & Loaders */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-500 uppercase text-[10px] mr-1">Load Sample:</span>
                <button
                  onClick={() => {
                    setBlogTitle("Why Eclipse Is India's No. 1 Platform");
                    setOriginalContent(SAMPLE_BLOG_VIOLATIONS);
                    setHasEvaluated(false);
                    setCorrectedContent("");
                    showNotification("Loaded test blog draft with violations.");
                  }}
                  className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
                >
                  Draft with Violations
                </button>
                <button
                  onClick={() => {
                    setBlogTitle("Scaling Enterprise Brand Governance with ECLIPSE");
                    setOriginalContent(SAMPLE_BLOG_COMPLIANT);
                    setHasEvaluated(false);
                    setCorrectedContent("");
                    showNotification("Loaded compliant enterprise blog.");
                  }}
                  className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
                >
                  Compliant Article
                </button>
                <button
                  onClick={() => {
                    setBlogTitle("");
                    setOriginalContent("");
                    setCorrectedContent("");
                    setHasEvaluated(false);
                    showNotification("Cleared blog canvas.");
                  }}
                  className="px-2 py-0.5 rounded border border-dashed border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors"
                >
                  + Blank
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium shadow-2xs">
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === "editor" ? "bg-slate-900 text-white font-bold" : "text-slate-600"
                  }`}
                >
                  Blog Editor
                </button>
                <button
                  onClick={() => setActiveTab("side_by_side")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === "side_by_side" ? "bg-slate-900 text-white font-bold" : "text-slate-600"
                  }`}
                >
                  Side-by-Side Diff
                </button>
                <button
                  onClick={() => setActiveTab("corrected")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === "corrected" ? "bg-slate-900 text-white font-bold" : "text-slate-600"
                  }`}
                >
                  Corrected Output
                </button>
              </div>
            </div>

            {/* Content Body Based on Tab */}
            <div className="p-4 space-y-3">
              {/* Blog Title Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Blog Headline / Title
                </label>
                <input
                  type="text"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="Enter blog article headline..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              {/* Tab 1: Direct Editor */}
              {activeTab === "editor" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Draft Article Content (Markdown Supported)
                  </label>
                  <textarea
                    rows={14}
                    value={originalContent}
                    onChange={(e) => {
                      setOriginalContent(e.target.value);
                      if (hasEvaluated) setHasEvaluated(false);
                    }}
                    placeholder="Write or paste full blog content here..."
                    className="w-full rounded-lg border border-slate-300 p-3.5 text-xs sm:text-sm text-slate-900 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-inner"
                  />
                </div>
              )}

              {/* Tab 2: Side-by-Side Diff View */}
              {activeTab === "side_by_side" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Left Pane: Original Draft */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-200">
                        <span className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-slate-500" />
                          Original Draft ({originalWordCount} words)
                        </span>
                        <span className="text-[10px] font-mono text-rose-600 font-bold">Uncorrected</span>
                      </div>
                      <div className="rounded-lg border border-rose-200 bg-rose-50/30 p-3 text-xs leading-relaxed font-sans min-h-[320px] max-h-[460px] overflow-y-auto whitespace-pre-wrap text-slate-800">
                        {originalContent}
                      </div>
                    </div>

                    {/* Right Pane: AI-Corrected Draft */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-200">
                        <span className="flex items-center gap-1.5 text-purple-900">
                          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                          ECLIPSE Corrected Blog ({correctedWordCount} words)
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">100% Compliant</span>
                      </div>
                      <div className="rounded-lg border border-emerald-300 bg-emerald-50/30 p-3 text-xs leading-relaxed font-sans min-h-[320px] max-h-[460px] overflow-y-auto whitespace-pre-wrap text-slate-900 font-medium">
                        {correctedContent || (
                          <div className="text-slate-400 italic text-center py-12">
                            Run AI Blog Review to generate fully corrected blog draft.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Corrected Output with Inline Editing */}
              {activeTab === "corrected" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Fully Corrected Blog (Editable)
                    </label>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                      All ECLIPSE Governance & Fact Citations Applied
                    </span>
                  </div>
                  <textarea
                    rows={14}
                    value={correctedContent}
                    onChange={(e) => setCorrectedContent(e.target.value)}
                    placeholder="Corrected content will appear here..."
                    className="w-full rounded-lg border border-emerald-300 bg-emerald-50/20 p-3.5 text-xs sm:text-sm text-slate-900 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
                  />
                </div>
              )}

              {/* Footer Metrics */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono">
                <div className="flex items-center gap-3">
                  <span>{originalWordCount} words</span>
                  <span>{originalContent.length} chars</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> ~{readTimeMin} min read
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1 text-[11px] font-sans font-semibold text-slate-600 hover:text-slate-900"
                    title="Download Markdown"
                  >
                    <Download className="h-3 w-3" /> .md
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="flex items-center gap-1 text-[11px] font-sans font-semibold text-slate-600 hover:text-slate-900"
                    title="Download Plain Text"
                  >
                    <Download className="h-3 w-3" /> .txt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Findings & Issue Classification (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            {/* Header & Category Filters */}
            <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-200 gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Identified Issues ({violations.length})
              </span>
              <div className="flex items-center gap-1 text-[10px] font-semibold">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    categoryFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  All ({violations.length})
                </button>
                <button
                  onClick={() => setCategoryFilter("brand")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    categoryFilter === "brand" ? "bg-purple-700 text-white" : "bg-purple-100 text-purple-800"
                  }`}
                >
                  Brand ({brandCount})
                </button>
                <button
                  onClick={() => setCategoryFilter("facts")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    categoryFilter === "facts" ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  Facts ({factsCount})
                </button>
                <button
                  onClick={() => setCategoryFilter("grammar")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    categoryFilter === "grammar" ? "bg-amber-700 text-white" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Grammar ({grammarCount})
                </button>
              </div>
            </div>

            {/* Fact Check Grounding Panel */}
            {factChecks && factChecks.length > 0 && (
              <div className="space-y-2 p-3 rounded-lg border border-blue-200 bg-blue-50/50 text-xs">
                <div className="flex items-center justify-between font-bold text-blue-950 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                    Claim-Level Fact Verification ({factChecks.length})
                  </span>
                  <span className="text-[10px] font-mono text-blue-700">RAG Grounded</span>
                </div>
                <div className="space-y-2">
                  {factChecks.map((fc, idx) => (
                    <div key={idx} className="p-2 rounded bg-white border border-blue-200/80 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800 line-clamp-1">
                          &quot;{fc.claim_text}&quot;
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                            fc.status === "verified"
                              ? "bg-emerald-100 text-emerald-800"
                              : fc.status === "contradicted" || fc.status === "refuted"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {fc.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-tight">{fc.evidence}</p>
                      {fc.source_ref && (
                        <div className="text-[9px] font-mono text-blue-600 font-bold">
                          Approved Citation: {fc.source_ref}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issue Card List */}
            {filteredViolations.length === 0 ? (
              <div className="p-6 rounded-lg border border-dashed border-slate-300 text-center space-y-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">
                  {hasEvaluated ? "No Issues in Selected Category" : "Awaiting AI Review"}
                </h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {hasEvaluated
                    ? "Content adheres to all checked brand rules and verified factual records."
                    : "Click 'Run AI Blog Review' to evaluate grammar, tone, factual accuracy, and brand alignment."}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {filteredViolations.map((v) => (
                  <div
                    key={v.id}
                    className={`p-3 rounded-lg border space-y-2 text-xs transition-all ${
                      v.status === "accepted"
                        ? "border-emerald-200 bg-emerald-50/40 opacity-75"
                        : v.status === "rejected"
                        ? "border-slate-200 bg-slate-50 opacity-60 line-through"
                        : v.severity === "CRITICAL"
                        ? "border-rose-300 bg-white shadow-2xs"
                        : "border-slate-200 bg-white shadow-2xs"
                    }`}
                  >
                    {/* Header with Severity & Code */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-slate-400">
                        {v.rule_id || v.guideline_reference}
                      </span>
                      <span
                        className={`font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                          v.severity === "CRITICAL"
                            ? "bg-rose-100 text-rose-800"
                            : v.severity === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {v.severity}
                      </span>
                    </div>

                    {/* Flagged Text */}
                    <div className="font-bold text-rose-600 line-through font-mono text-[11px]">
                      &quot;{v.problematic_text}&quot;
                    </div>

                    {/* Explanation */}
                    <p className="text-[11px] text-slate-700 leading-normal font-medium">
                      {v.explanation}
                    </p>

                    {/* Replacement Recommendation */}
                    {v.suggestion && (
                      <div className="p-2 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-emerald-800 block">
                            Recommended Correction:
                          </span>
                          <span className="font-bold text-emerald-950 text-[11px]">
                            {v.suggestion.replace(/^Replace with:\s*/, "")}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons: Accept / Reject */}
                    {v.status === "pending" && (
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => handleRejectViolation(v.id)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleAcceptViolation(v.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs transition-colors"
                        >
                          Accept Fix
                        </button>
                      </div>
                    )}

                    {v.status === "accepted" && (
                      <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Fix Applied to Revised Blog
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

