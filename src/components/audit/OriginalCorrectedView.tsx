import React, { useState } from "react";
import { Sparkles, Check, ArrowRight, Copy, FileText, CheckCheck } from "lucide-react";

interface OriginalCorrectedViewProps {
  originalText: string;
  correctedText: string;
  onApplyToEditor?: (text: string) => void;
  originalLabel?: string;
  correctedLabel?: string;
  className?: string;
}

export function OriginalCorrectedView({
  originalText,
  correctedText,
  onApplyToEditor,
  originalLabel = "Original Draft (Uncorrected)",
  correctedLabel = "ECLIPSE AI Corrected (100% Compliant)",
  className = "",
}: OriginalCorrectedViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!correctedText) return;
    navigator.clipboard.writeText(correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const origWordCount = originalText ? originalText.trim().split(/\s+/).length : 0;
  const corrWordCount = correctedText ? correctedText.trim().split(/\s+/).length : 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>Content Correction &amp; Revision Comparison</span>
          </span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-emerald-200">
            Brand Compliant
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied!" : "Copy Clean Copy"}</span>
          </button>

          {onApplyToEditor && correctedText && (
            <button
              onClick={() => onApplyToEditor(correctedText)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Apply to Editor</span>
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side Dual Pane */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Left Pane: Original */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-200">
            <span className="flex items-center gap-1.5 text-slate-800">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              {originalLabel}
            </span>
            <span className="text-[10px] font-mono text-slate-500">{origWordCount} words</span>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-3.5 text-xs leading-relaxed font-sans min-h-[160px] max-h-[380px] overflow-y-auto whitespace-pre-wrap text-slate-800 shadow-inner">
            {originalText || <span className="text-slate-400 italic">No content submitted.</span>}
          </div>
        </div>

        {/* Right Pane: AI Corrected */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-200">
            <span className="flex items-center gap-1.5 text-purple-950">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              {correctedLabel}
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold">{corrWordCount} words</span>
          </div>
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-3.5 text-xs leading-relaxed font-sans min-h-[160px] max-h-[380px] overflow-y-auto whitespace-pre-wrap text-slate-900 font-medium shadow-inner">
            {correctedText || (
              <span className="text-slate-400 italic">
                AI compliant rewrite will appear once the analysis pipeline completes.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

