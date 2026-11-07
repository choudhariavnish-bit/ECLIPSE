import React from "react";
import { Shield, Sparkles, CheckCircle, AlertTriangle } from "lucide-react";

interface AuditSummaryProps {
  overallScore: number;
  riskLevel: string;
  auditId?: string;
  summaryText?: string;
  counts?: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  engineName?: string;
  modelName?: string;
  className?: string;
}

export function AuditSummary({
  overallScore,
  riskLevel,
  auditId,
  summaryText,
  counts,
  engineName = "ECLIPSE",
  modelName = "Google Gemini",
  className = "",
}: AuditSummaryProps) {
  const risk = (riskLevel || "LOW").toUpperCase();
  const isClean = overallScore >= 90 && (counts?.total ?? 0) === 0;

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 ${className}`}>
      {/* Top Metric Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono ${
                overallScore >= 80
                  ? "text-emerald-700"
                  : overallScore >= 50
                  ? "text-amber-600"
                  : "text-rose-600"
              }`}
            >
              {overallScore}
            </span>
            <span className="text-xs text-slate-400 font-bold">/100</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Brand Governance Score</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  risk === "CRITICAL"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : risk === "HIGH"
                    ? "bg-orange-100 text-orange-800 border border-orange-300"
                    : risk === "MEDIUM"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                Risk: {risk}
              </span>
            </div>
            {auditId && (
              <span className="text-[10px] font-mono text-slate-400">
                Audit Ref: {auditId}
              </span>
            )}
          </div>
        </div>

        {counts && (
          <div className="flex items-center gap-2 text-[10px] font-mono">
            {counts.critical > 0 && (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded font-bold">
                {counts.critical} Critical
              </span>
            )}
            {counts.high > 0 && (
              <span className="px-2 py-0.5 bg-orange-50 text-orange-800 border border-orange-200 rounded font-bold">
                {counts.high} High
              </span>
            )}
            {counts.medium > 0 && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold">
                {counts.medium} Med
              </span>
            )}
            {counts.total === 0 && (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-emerald-600" />
                0 Violations
              </span>
            )}
          </div>
        )}
      </div>

      {/* Executive Summary */}
      {summaryText && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-600" />
              <span>AI Governance Analysis &amp; Executive Findings</span>
            </span>
            <span className="font-mono text-[9px] text-slate-400">
              {engineName} • {modelName}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">{summaryText}</p>
        </div>
      )}
    </div>
  );
}

