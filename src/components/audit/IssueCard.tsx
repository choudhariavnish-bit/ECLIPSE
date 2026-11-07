import React, { useState } from "react";
import { Check, X, Edit3, ArrowRight, BookOpen, AlertTriangle } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import { EvidenceDetails } from "./EvidenceDetails";

export interface AuditIssue {
  id: string;
  title?: string;
  category: string;
  severity: string;
  problematic_text?: string;
  flaggedText?: string;
  original_text?: string;
  original_sentence?: string;
  explanation?: string;
  plainEnglishReason?: string;
  issue?: string;
  suggestion?: string;
  suggestedFix?: string;
  recommendation?: string;
  rule_id?: string;
  ruleCode?: string;
  guideline_reference?: string;
  evidence_id?: string;
  factId?: string;
  evidence?: string;
  status?: "pending" | "applied" | "accepted" | "dismissed" | "rejected";
  requires_human_review?: boolean;
}

interface IssueCardProps {
  issue: AuditIssue;
  onAccept?: (id: string, customReplacement?: string) => void;
  onDismiss?: (id: string) => void;
  onEdit?: (id: string, newReplacement: string) => void;
  className?: string;
}

export function IssueCard({
  issue,
  onAccept,
  onDismiss,
  onEdit,
  className = "",
}: IssueCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const flaggedText =
    issue.problematic_text || issue.flaggedText || issue.original_text || "";
  const reason =
    issue.explanation || issue.plainEnglishReason || issue.issue || "Brand guideline inconsistency.";
  const rawSuggestion =
    issue.suggestion || issue.suggestedFix || issue.recommendation || "";
  const cleanSuggestion = rawSuggestion
    .replace(/^Replace with:\s*['"]?|['"]?$/gi, "")
    .trim();

  const [customText, setCustomText] = useState(cleanSuggestion);

  const ruleRef =
    issue.rule_id || issue.ruleCode || issue.guideline_reference || "RULE-ECLIPSE";

  const isResolved =
    issue.status === "applied" || issue.status === "accepted";
  const isDismissed =
    issue.status === "dismissed" || issue.status === "rejected";

  return (
    <div
      className={`p-3.5 rounded-xl border text-xs transition-all space-y-2.5 ${
        isResolved
          ? "border-emerald-200 bg-emerald-50/40 opacity-80"
          : isDismissed
          ? "border-slate-200 bg-slate-50 opacity-60 line-through"
          : issue.severity?.toLowerCase().includes("crit")
          ? "border-rose-300 bg-white shadow-xs ring-1 ring-rose-400/20"
          : "border-slate-200 bg-white shadow-xs"
      } ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {ruleRef}
          </span>
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
            {issue.category}
          </span>
          {issue.title && (
            <span className="text-xs font-bold text-slate-900">{issue.title}</span>
          )}
        </div>
        <SeverityBadge severity={issue.severity} />
      </div>

      {/* Flagged Problematic Text */}
      {flaggedText && (
        <div className="flex items-start gap-2 bg-rose-50/80 border border-rose-200/80 p-2 rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 font-mono shrink-0">
            Flagged:
          </span>
          <span className="font-mono font-bold text-rose-700 text-xs line-through break-all">
            &quot;{flaggedText}&quot;
          </span>
        </div>
      )}

      {/* Explanation */}
      <div className="text-[11px] text-slate-700 leading-relaxed">
        <strong>Why this matters: </strong>
        <span>{reason}</span>
      </div>

      {/* Grounded Evidence Details */}
      {(issue.evidence || issue.evidence_id || issue.factId) && (
        <EvidenceDetails
          evidence={issue.evidence}
          factId={issue.evidence_id || issue.factId}
          status="verified"
        />
      )}

      {/* Recommendation / Fix View */}
      {cleanSuggestion && (
        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900">
            <span className="flex items-center gap-1">
              <ArrowRight className="h-3 w-3 text-emerald-600" />
              <span>Recommended Replacement</span>
            </span>
            {!isResolved && !isDismissed && onEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-0.5"
              >
                <Edit3 className="h-2.5 w-2.5" />
                <span>{isEditing ? "Cancel" : "Custom Edit"}</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-1.5">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-emerald-300 rounded p-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-1">
                <button
                  onClick={() => {
                    if (onEdit) onEdit(issue.id, customText);
                    setIsEditing(false);
                  }}
                  className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold"
                >
                  Save Replacement
                </button>
              </div>
            </div>
          ) : (
            <p className="font-bold text-emerald-950 text-xs font-mono">
              &quot;{customText || cleanSuggestion}&quot;
            </p>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1">
        <div>
          {isResolved && (
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Applied to Draft
            </span>
          )}
          {isDismissed && (
            <span className="text-[11px] font-bold text-slate-400">
              Dismissed by User
            </span>
          )}
        </div>

        {!isResolved && !isDismissed && (
          <div className="flex items-center gap-1.5">
            {onDismiss && (
              <button
                onClick={() => onDismiss(issue.id)}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded text-xs font-semibold transition-colors"
              >
                Dismiss
              </button>
            )}
            {onAccept && (
              <button
                onClick={() => onAccept(issue.id, customText || cleanSuggestion)}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                <span>Apply Fix</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

