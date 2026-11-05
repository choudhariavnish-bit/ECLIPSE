"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, ExternalLink, Cpu } from "lucide-react";

interface AiHealthStatus {
  connected: boolean;
  engine: string;
  title?: string;
  powered_by: string;
  model: string;
  live_gemini_active: boolean;
  version: string;
  endpoint: string;
}

export function AiEngineStatusBadge() {
  const [status, setStatus] = useState<AiHealthStatus | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/ai/health");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (e) {
        setStatus({
          connected: false,
          engine: "ECLIPSE",
          powered_by: "Offline",
          model: "fallback",
          live_gemini_active: false,
          version: "2.0.0",
          endpoint: "http://localhost:8000",
        });
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = status?.connected;

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors shadow-xs ${
          isOnline
            ? "bg-purple-50 hover:bg-purple-100/80 border-purple-200 text-purple-900"
            : "bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-900"
        }`}
        title="ECLIPSE AI Engine Status"
      >
        <Sparkles className={`w-3.5 h-3.5 ${isOnline ? "text-purple-600 animate-pulse" : "text-amber-600"}`} />
        <span className="hidden sm:inline font-bold">AI:</span>
        <span className="font-semibold capitalize">
          {isOnline ? "Gemini Active" : "Local Mode"}
        </span>
        <span
          className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-4 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-700">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-purple-100 text-purple-700">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm">ECLIPSE AI Engine</span>
                <span className="block text-[10px] text-slate-400">Governance & Fact Verification</span>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                isOnline ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {isOnline ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {isOnline ? "Online" : "Standby"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">LLM Provider</span>
              <span className="font-semibold text-slate-800">{status?.powered_by || "Google Gemini"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Active Model</span>
              <span className="font-mono font-medium text-slate-800 text-[11px]">
                {status?.model || "gemini-3.5-flash-lite"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Pipeline Version</span>
              <span className="font-mono text-slate-700">{status?.version || "2.0.0"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">API Port</span>
              <span className="font-mono text-slate-700">Port 8000</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Zero Retention</span>
              <span className="text-emerald-700 font-semibold">Active (Ephemeral)</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition-colors"
            >
              <span>Swagger API</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="http://localhost:8000/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>AI Playground</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

