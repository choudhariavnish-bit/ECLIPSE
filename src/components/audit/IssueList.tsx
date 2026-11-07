import React, { useState, useMemo } from "react";
import { Filter, CheckCheck, CheckCircle2, Search, SlidersHorizontal } from "lucide-react";
import { IssueCard, AuditIssue } from "./IssueCard";

interface IssueListProps {
  issues: AuditIssue[];
  onAcceptIssue?: (id: string, customReplacement?: string) => void;
  onDismissIssue?: (id: string) => void;
  onEditIssue?: (id: string, newReplacement: string) => void;
  onApplyAll?: () => void;
  isEvaluating?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  className?: string;
}

export function IssueList({
  issues,
  onAcceptIssue,
  onDismissIssue,
  onEditIssue,
  onApplyAll,
  isEvaluating = false,
  emptyStateTitle = "100% Brand Compliant",
  emptyStateDescription = "No unresolved brand governance, factual, or design issues detected.",
  className = "",
}: IssueListProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const pendingIssues = useMemo(
    () => issues.filter((i) => i.status !== "applied" && i.status !== "accepted" && i.status !== "dismissed" && i.status !== "rejected"),
    [issues]
  );

  // Group counts
  const counts = useMemo(() => {
    let brand = 0;
    let tone = 0;
    let grammar = 0;
    let facts = 0;
    let visual = 0;

    issues.forEach((i) => {
      const c = (i.category || "").toLowerCase();
      if (c.includes("gramm") || c.includes("spell") || c.includes("syntax") || c.includes("punct") || c.includes("struct")) {
        grammar++;
      } else if (c.includes("tone") || c.includes("voice") || c.includes("style")) {
        tone++;
      } else if (c.includes("fact") || c.includes("claim") || c.includes("contradict") || c.includes("unsupport")) {
        facts++;
      } else if (c.includes("visual") || c.includes("contrast") || c.includes("wcag") || c.includes("format")) {
        visual++;
      } else {
        brand++;
      }
    });

    return { total: issues.length, brand, tone, grammar, facts, visual };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter((i) => {
      const c = (i.category || "").toLowerCase();
      const text = `${i.problematic_text || i.flaggedText || ""} ${i.explanation || i.issue || ""} ${i.suggestion || i.suggestedFix || ""} ${i.rule_id || i.ruleCode || ""}`.toLowerCase();

      if (searchQuery.trim() && !text.includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (activeCategory === "all") return true;
      if (activeCategory === "grammar") {
        return c.includes("gramm") || c.includes("spell") || c.includes("syntax") || c.includes("punct") || c.includes("struct");
      }
      if (activeCategory === "tone") {
        return c.includes("tone") || c.includes("voice") || c.includes("style");
      }
      if (activeCategory === "facts") {
        return c.includes("fact") || c.includes("claim") || c.includes("contradict") || c.includes("unsupport");
      }
      if (activeCategory === "visual") {
        return c.includes("visual") || c.includes("contrast") || c.includes("wcag") || c.includes("format");
      }
      if (activeCategory === "brand") {
        return c.includes("prohibit") || c.includes("term") || c.includes("legal") || c.includes("policy") || c.includes("casing");
      }
      return true;
    });
  }, [issues, activeCategory, searchQuery]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Category Pills & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
              activeCategory === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({counts.total})
          </button>
          {counts.grammar > 0 && (
            <button
              onClick={() => setActiveCategory("grammar")}
              className={`px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                activeCategory === "grammar"
                  ? "bg-amber-700 text-white shadow-2xs"
                  : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              Grammar ({counts.grammar})
            </button>
          )}
          {counts.brand > 0 && (
            <button
              onClick={() => setActiveCategory("brand")}
              className={`px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                activeCategory === "brand"
                  ? "bg-purple-700 text-white shadow-2xs"
                  : "bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100"
              }`}
            >
              Brand &amp; Legal ({counts.brand})
            </button>
          )}
          {counts.facts > 0 && (
            <button
              onClick={() => setActiveCategory("facts")}
              className={`px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                activeCategory === "facts"
                  ? "bg-blue-700 text-white shadow-2xs"
                  : "bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100"
              }`}
            >
              Claims ({counts.facts})
            </button>
          )}
          {counts.tone > 0 && (
            <button
              onClick={() => setActiveCategory("tone")}
              className={`px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                activeCategory === "tone"
                  ? "bg-indigo-700 text-white shadow-2xs"
                  : "bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100"
              }`}
            >
              Tone ({counts.tone})
            </button>
          )}
          {counts.visual > 0 && (
            <button
              onClick={() => setActiveCategory("visual")}
              className={`px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                activeCategory === "visual"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              Visual &amp; WCAG ({counts.visual})
            </button>
          )}
        </div>

        {onApplyAll && pendingIssues.length > 0 && (
          <button
            onClick={onApplyAll}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Fix All ({pendingIssues.length})</span>
          </button>
        )}
      </div>

      {/* Optional Search / Quick Filter */}
      {issues.length > 3 && (
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search flagged text or rule codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      )}

      {/* Cards List or Empty State */}
      {filteredIssues.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center space-y-2">
          <CheckCircle2 className="h-7 w-7 text-emerald-600 mx-auto" />
          <h4 className="text-xs font-bold text-slate-900">{emptyStateTitle}</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
            {emptyStateDescription}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onAccept={onAcceptIssue}
              onDismiss={onDismissIssue}
              onEdit={onEditIssue}
            />
          ))}
        </div>
      )}
    </div>
  );
}

