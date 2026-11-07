import React from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface AnalysisErrorProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function AnalysisError({ error, onRetry, className = "" }: AnalysisErrorProps) {
  return (
    <div
      className={`p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 flex items-center justify-between gap-3 text-xs ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold block">AI Audit Encountered an Issue</span>
          <span className="text-[11px] text-rose-700 leading-normal">{error}</span>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1 px-3 py-1 bg-rose-900 text-white font-bold rounded-lg hover:bg-rose-800 transition-colors shrink-0 shadow-2xs"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Retry Check</span>
        </button>
      )}
    </div>
  );
}

