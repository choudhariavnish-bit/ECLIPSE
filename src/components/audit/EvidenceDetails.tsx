import React from "react";
import { ShieldCheck, AlertCircle, FileCheck, ExternalLink } from "lucide-react";

interface EvidenceDetailsProps {
  evidence?: string;
  factId?: string;
  status?: string;
  approvedInfo?: string;
  sourceRef?: string;
  className?: string;
}

export function EvidenceDetails({
  evidence,
  factId,
  status = "verified",
  approvedInfo,
  sourceRef,
  className = "",
}: EvidenceDetailsProps) {
  if (!evidence && !factId && !approvedInfo && !sourceRef) return null;

  const st = (status || "").toLowerCase();
  const isVerified = st.includes("verif") || st === "pass";
  const isContradicted = st.includes("contradict") || st.includes("refut") || st === "fail";

  return (
    <div
      className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
        isVerified
          ? "border-emerald-200 bg-emerald-50/50 text-emerald-950"
          : isContradicted
          ? "border-rose-200 bg-rose-50/50 text-rose-950"
          : "border-blue-200 bg-blue-50/50 text-blue-950"
      } ${className}`}
    >
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className="flex items-center gap-1.5">
          {isVerified ? (
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          ) : isContradicted ? (
            <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
          ) : (
            <FileCheck className="h-3.5 w-3.5 text-blue-600" />
          )}
          <span>Verified Brand Evidence & Citations</span>
        </span>
        <span
          className={`font-mono uppercase px-1.5 py-0.2 rounded text-[9px] font-bold ${
            isVerified
              ? "bg-emerald-100 text-emerald-800"
              : isContradicted
              ? "bg-rose-100 text-rose-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {status}
        </span>
      </div>

      {evidence && <p className="text-[11px] leading-relaxed opacity-90">{evidence}</p>}

      {approvedInfo && (
        <div className="pt-1 text-[10px] border-t border-black/5">
          <span className="font-bold">Approved Baseline Record: </span>
          <span>{approvedInfo}</span>
        </div>
      )}

      {(factId || sourceRef) && (
        <div className="flex items-center gap-2 pt-0.5 text-[9px] font-mono text-slate-500">
          <span>Record Citation: <strong>{factId || sourceRef}</strong></span>
          <span className="inline-flex items-center gap-0.5 opacity-70">
            <ExternalLink className="h-2.5 w-2.5" /> Immutable
          </span>
        </div>
      )}
    </div>
  );
}

