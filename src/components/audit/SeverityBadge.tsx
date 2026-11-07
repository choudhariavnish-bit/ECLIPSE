import React from "react";
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";

interface SeverityBadgeProps {
  severity: string;
  className?: string;
  showIcon?: boolean;
}

export function SeverityBadge({ severity, className = "", showIcon = true }: SeverityBadgeProps) {
  const sev = (severity || "medium").toLowerCase();

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let icon = <Info className="h-3 w-3" />;

  if (sev.includes("crit")) {
    colorClasses = "bg-rose-100 text-rose-900 border-rose-300 ring-1 ring-rose-400/20";
    icon = <ShieldAlert className="h-3 w-3 text-rose-600" />;
  } else if (sev.includes("high")) {
    colorClasses = "bg-orange-100 text-orange-900 border-orange-300";
    icon = <AlertTriangle className="h-3 w-3 text-orange-600" />;
  } else if (sev.includes("med") || sev.includes("warn")) {
    colorClasses = "bg-amber-100 text-amber-900 border-amber-300";
    icon = <AlertCircle className="h-3 w-3 text-amber-600" />;
  } else if (sev.includes("low")) {
    colorClasses = "bg-blue-100 text-blue-800 border-blue-200";
    icon = <Info className="h-3 w-3 text-blue-600" />;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${colorClasses} ${className}`}
    >
      {showIcon && icon}
      <span>{severity || "MEDIUM"}</span>
    </span>
  );
}

