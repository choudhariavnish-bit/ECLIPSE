import React from "react";
import { CheckCircle2, Scan } from "lucide-react";

interface EmptyAuditStateProps {
  status: "idle" | "clean";
  onStartAudit?: () => void;
  title?: string;
  description?: string;
  buttonLabel?: string;
  className?: string;
}

export function EmptyAuditState({
  status,
  onStartAudit,
  title,
  description,
  buttonLabel = "Run AI Brand Check",
  className = "",
}: EmptyAuditStateProps) {
  if (status === "clean") {
    return (
      <div className={`p-6 rounded-xl border border-emerald-200 bg-emerald-50/60 text-center space-y-2.5 ${className}`}>
        <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
        <div>
          <h4 className="text-xs font-bold text-emerald-950">
            {title || "100% Brand Compliant • Auto-Approved"}
          </h4>
          <p className="text-[11px] text-emerald-800 leading-normal mt-1 max-w-sm mx-auto">
            {description ||
              "Content passes all brand tone, factual claims verification, and accessibility standards without requiring revision."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center space-y-3 ${className}`}>
      <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
        <Scan className="h-5 w-5" />
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-800">
          {title || "Ready for AI Content Review"}
        </h4>
        <p className="text-[11px] text-slate-500 leading-normal mt-1 max-w-sm mx-auto">
          {description ||
            "Submit your draft copy or image to run the complete ECLIPSE 10-stage brand governance, factual verification, and autonomous correction pipeline."}
        </p>
      </div>
      {onStartAudit && (
        <div>
          <button
            onClick={onStartAudit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Scan className="h-3.5 w-3.5" />
            <span>{buttonLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}

