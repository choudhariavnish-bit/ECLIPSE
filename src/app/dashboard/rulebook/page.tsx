"use client";

import React, { useState, useEffect } from "react";
import Link from "@/lib/next-compat/link";
import { useRouter } from "@/lib/next-compat/navigation";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit2,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Tag,
  Scale,
  Zap,
  Info,
  Building2,
  X,
} from "lucide-react";

export interface RuleItem {
  id: string;
  code: string;
  category: "claim" | "tone" | "terminology" | "visual" | "legal";
  name: string;
  description: string;
  severity: "critical" | "warning" | "info";
  pattern: string;
  replacement: string;
  isEnabled: boolean;
}

export interface BrandRulebook {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  primaryColor: string;
  accentBg: string;
  tone: {
    formality: number;
    boldness: number;
    empathy: number;
  };
  rules: RuleItem[];
}

const INITIAL_BRAND_RULEBOOKS: BrandRulebook[] = [
  {
    id: "brand-eclipse",
    name: "ECLIPSE Global Enterprises",
    tagline: "Enterprise AI & Cloud Governance",
    industry: "Enterprise B2B Software",
    primaryColor: "#2563EB",
    accentBg: "bg-blue-50 border-blue-200 text-blue-800",
    tone: { formality: 85, boldness: 70, empathy: 60 },
    rules: [
      {
        id: "r-ink-1",
        code: "CLM-01",
        category: "claim",
        name: "Prohibited Superlative Guarantees",
        description: "Absolute guarantees cannot be verified under corporate advertising compliance.",
        severity: "critical",
        pattern: "100% foolproof",
        replacement: "enterprise-grade verified high-availability",
        isEnabled: true,
      },
      {
        id: "r-ink-2",
        code: "CLM-02",
        category: "claim",
        name: "Zero Defect Infallibility Claims",
        description: "Software marketing must avoid absolute infallibility claims.",
        severity: "critical",
        pattern: "zero bugs guaranteed",
        replacement: "rigorous 99.99% uptime resilience",
        isEnabled: true,
      },
      {
        id: "r-ink-3",
        code: "TON-01",
        category: "tone",
        name: "Casual Hyperbole Restriction",
        description: "Informal slang compromises authoritative enterprise standing.",
        severity: "warning",
        pattern: "super crazy fast",
        replacement: "rapid zero-downtime deployment",
        isEnabled: true,
      },
      {
        id: "r-ink-4",
        code: "LEG-01",
        category: "legal",
        name: "Mandatory SOC2 Disclosure Tag",
        description: "All cloud security claims must reference SOC2 Type II certifications.",
        severity: "info",
        pattern: "unhackable cloud storage",
        replacement: "SOC2 Type II certified zero-knowledge architecture",
        isEnabled: true,
      },
      {
        id: "r-ink-5",
        code: "VIS-01",
        category: "visual",
        name: "Enterprise WCAG AA Typography",
        description: "All collateral must maintain minimum 12:1 typography contrast on whitepapers.",
        severity: "warning",
        pattern: "Light Gray typography on white",
        replacement: "Slate-900 (#0F172A) on White",
        isEnabled: true,
      },
    ],
  },
  {
    id: "brand-loomcraft",
    name: "LoomCraft Creative Studio",
    tagline: "High-Energy Design & Social Campaigns",
    industry: "Digital Creative Agency",
    primaryColor: "#8B5CF6",
    accentBg: "bg-purple-50 border-purple-200 text-purple-800",
    tone: { formality: 35, boldness: 90, empathy: 85 },
    rules: [
      {
        id: "r-loom-1",
        code: "TON-02",
        category: "tone",
        name: "Ban Monotonous Corporate Jargon",
        description: "Stiff corporate jargon kills creative engagement on modern social media.",
        severity: "warning",
        pattern: "synergistic paradigm shift",
        replacement: "fresh creative momentum",
        isEnabled: true,
      },
      {
        id: "r-loom-2",
        code: "TON-03",
        category: "tone",
        name: "Conversational Direct Punch",
        description: "Speak directly to creators rather than using third-person bureaucrat speak.",
        severity: "info",
        pattern: "it is imperative that users utilize",
        replacement: "you can jump straight into",
        isEnabled: true,
      },
      {
        id: "r-loom-3",
        code: "VIS-02",
        category: "visual",
        name: "Vibrant Palette Allowance",
        description: "Gradient accents permitted (Purple #8B5CF6 to Pink #EC4899).",
        severity: "info",
        pattern: "Monochrome gray only",
        replacement: "Multi-hue vibrant gradient permitted",
        isEnabled: true,
      },
    ],
  },
  {
    id: "brand-pulsefin",
    name: "PulseFin Global",
    tagline: "Algorithmic Wealth & FinTech Compliance",
    industry: "Banking & Financial Services",
    primaryColor: "#059669",
    accentBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
    tone: { formality: 95, boldness: 30, empathy: 40 },
    rules: [
      {
        id: "r-fin-1",
        code: "FIN-01",
        category: "legal",
        name: "SEC/FINRA: No Guaranteed Returns",
        description: "Promising specific return percentages is illegal under financial advertising laws.",
        severity: "critical",
        pattern: "guaranteed 500% ROI",
        replacement: "projected historical yield based on audited backtesting",
        isEnabled: true,
      },
      {
        id: "r-fin-2",
        code: "FIN-02",
        category: "legal",
        name: "Mandatory Regulatory Footnote",
        description: "Every financial performance asset must include the statutory risk notice.",
        severity: "critical",
        pattern: "risk-free automated profits",
        replacement: "algorithmic portfolio management (Past performance does not guarantee future results)",
        isEnabled: true,
      },
      {
        id: "r-fin-3",
        code: "VIS-03",
        category: "visual",
        name: "Strict WCAG AAA Contrast (7:1)",
        description: "Financial dashboards must support visually impaired investors under ADA standards.",
        severity: "critical",
        pattern: "Contrast under 7:1",
        replacement: "Strict High Contrast Dark Navy (#0A192F)",
        isEnabled: true,
      },
    ],
  },
  {
    id: "brand-novahealth",
    name: "NovaHealth Diagnostics",
    tagline: "Clinical Research & Biomarker Discovery",
    industry: "Healthcare & Life Sciences",
    primaryColor: "#06B6D4",
    accentBg: "bg-cyan-50 border-cyan-200 text-cyan-800",
    tone: { formality: 90, boldness: 40, empathy: 90 },
    rules: [
      {
        id: "r-nova-1",
        code: "FDA-01",
        category: "legal",
        name: "FDA: No 'Miracle Cure' Phrasing",
        description: "Medical treatments must never be described as miraculous or foolproof.",
        severity: "critical",
        pattern: "miracle cure breakthrough",
        replacement: "clinically evaluated therapeutic formulation",
        isEnabled: true,
      },
      {
        id: "r-nova-2",
        code: "FDA-02",
        category: "claim",
        name: "Eradication Claims Prohibition",
        description: "Treatments must be stated as managing symptoms unless fully FDA curative certified.",
        severity: "critical",
        pattern: "completely eradicates the disease",
        replacement: "demonstrates statistically significant symptom reduction",
        isEnabled: true,
      },
      {
        id: "r-nova-3",
        code: "ETH-01",
        category: "terminology",
        name: "Person-First Medical Nomenclature",
        description: "Empathetic communication always puts the person before the condition.",
        severity: "warning",
        pattern: "diabetics and cancer victims",
        replacement: "individuals living with diabetes and oncology patients",
        isEnabled: true,
      },
    ],
  },
];

export default function BrandRulebookPage() {
  const router = useRouter();
  const [rulebooks, setRulebooks] = useState<BrandRulebook[]>(INITIAL_BRAND_RULEBOOKS);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(INITIAL_BRAND_RULEBOOKS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Rule Form
  const [ruleName, setRuleName] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [ruleCategory, setRuleCategory] = useState<RuleItem["category"]>("claim");
  const [ruleSeverity, setRuleSeverity] = useState<RuleItem["severity"]>("warning");
  const [rulePattern, setRulePattern] = useState("");
  const [ruleReplacement, setRuleReplacement] = useState("");

  // New Brand Form
  const [brandName, setBrandName] = useState("");
  const [brandTagline, setBrandTagline] = useState("");
  const [brandIndustry, setBrandIndustry] = useState("");
  const [brandColor, setBrandColor] = useState("#2563EB");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchRulebooks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/rulebooks");
      if (res.ok) {
        const data = await res.json();
        if (data.rulebooks && Array.isArray(data.rulebooks) && data.rulebooks.length > 0) {
          setRulebooks(data.rulebooks);
        }
      }
    } catch (err) {
      console.warn("Using offline rulebooks fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRulebooks();
  }, []);

  const currentBrand = rulebooks.find((b) => b.id === selectedBrandId) || rulebooks[0];

  const handleToggleRule = async (ruleId: string) => {
    setRulebooks((prev) =>
      prev.map((b) =>
        b.id === currentBrand.id
          ? {
              ...b,
              rules: b.rules.map((r) =>
                r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r
              ),
            }
          : b
      )
    );
    try {
      await fetch("/api/rulebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_RULE", brandId: currentBrand.id, ruleId }),
      });
      showToast("Rule status updated in live database.");
    } catch {
      showToast("Rule status updated.");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    setRulebooks((prev) =>
      prev.map((b) =>
        b.id === currentBrand.id
          ? {
              ...b,
              rules: b.rules.filter((r) => r.id !== ruleId),
            }
          : b
      )
    );
    try {
      await fetch("/api/rulebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_RULE", brandId: currentBrand.id, ruleId }),
      });
      showToast("Rule deleted from live database.");
    } catch {
      showToast("Rule deleted from brand rulebook.");
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !rulePattern.trim() || !ruleReplacement.trim()) return;

    const newRule: RuleItem = {
      id: `r-custom-${Date.now()}`,
      code: `CUS-0${currentBrand.rules.length + 1}`,
      category: ruleCategory,
      name: ruleName.trim(),
      description: ruleDescription.trim() || "Brand guideline rule",
      severity: ruleSeverity,
      pattern: rulePattern.trim(),
      replacement: ruleReplacement.trim(),
      isEnabled: true,
    };

    setRulebooks((prev) =>
      prev.map((b) =>
        b.id === currentBrand.id ? { ...b, rules: [newRule, ...b.rules] } : b
      )
    );

    setIsAddRuleModalOpen(false);
    setRuleName("");
    setRuleDescription("");
    setRulePattern("");
    setRuleReplacement("");

    try {
      const res = await fetch("/api/rulebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_RULE", brandId: currentBrand.id, rule: newRule }),
      });
      if (res.ok) {
        showToast(`Rule "${newRule.name}" saved live in database!`);
        fetchRulebooks();
      } else {
        showToast(`Added "${newRule.name}" to ${currentBrand.name}`);
      }
    } catch {
      showToast(`Added "${newRule.name}" to ${currentBrand.name}`);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    const newBrandItem: BrandRulebook = {
      id: `brand-${Date.now().toString().slice(-4)}`,
      name: brandName.trim(),
      tagline: brandTagline.trim() || "Independent Product Brand",
      industry: brandIndustry.trim() || "General Commercial",
      primaryColor: brandColor,
      accentBg: "bg-slate-100 border-slate-300 text-slate-800",
      tone: { formality: 70, boldness: 60, empathy: 70 },
      rules: [
        {
          id: `r-init-${Date.now()}`,
          code: "GEN-01",
          category: "claim",
          name: "Standard Unverified Claims Check",
          description: "All marketing statements must be backed by verified documentation.",
          severity: "critical",
          pattern: "guaranteed 100%",
          replacement: "industry-leading standard",
          isEnabled: true,
        },
      ],
    };

    setRulebooks((prev) => [...prev, newBrandItem]);
    setSelectedBrandId(newBrandItem.id);
    setIsAddBrandModalOpen(false);
    setBrandName("");
    setBrandTagline("");
    setBrandIndustry("");

    try {
      const res = await fetch("/api/rulebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE_BRAND", brand: newBrandItem }),
      });
      if (res.ok) {
        showToast(`Created new Brand Rulebook: "${newBrandItem.name}" live!`);
        fetchRulebooks();
      } else {
        showToast(`Created new Brand Rulebook: "${newBrandItem.name}"`);
      }
    } catch {
      showToast(`Created new Brand Rulebook: "${newBrandItem.name}"`);
    }
  };

  const handleInspectWithBrand = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("eclipse_active_draft_brand", currentBrand.name);
      localStorage.setItem("inkloom_active_draft_brand", currentBrand.name);
    }
    showToast(`Switched active inspector to: ${currentBrand.name}`);
    router.push("/dashboard/creator");
  };

  const filteredRules = currentBrand.rules.filter((r) => {
    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.replacement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
              Multi-Brand Governance
            </span>
            <span className="text-xs text-slate-400">Rulebook Architecture</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Brand Rulebooks</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Every brand maintains its own independent rulebook, voice parameters, and compliance standards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddBrandModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors"
          >
            <Building2 className="h-4 w-4 text-slate-500" />
            <span>+ Add New Brand</span>
          </button>

          <button
            onClick={handleInspectWithBrand}
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Audit with this Brand</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* BRAND SWITCHER TABS (EVERY BRAND HAS ITS OWN RULEBOOK) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {rulebooks.map((brand) => {
          const isSelected = brand.id === currentBrand.id;
          return (
            <button
              key={brand.id}
              onClick={() => setSelectedBrandId(brand.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: brand.primaryColor }}
              />
              <span>{brand.name}</span>
              <span
                className={`rounded-full px-2 py-0.2 text-[10px] font-mono ${
                  isSelected ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"
                }`}
              >
                {brand.rules.length} Rules
              </span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE BRAND SUMMARY CARD */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: currentBrand.primaryColor }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {currentBrand.industry}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              Active Rulebook
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">{currentBrand.name}</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            {currentBrand.tagline} • Tailored compliance guardrails protecting brand equity across channels.
          </p>
        </div>

        {/* Tone Profile Display */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs w-full lg:w-auto justify-around">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Formality
            </span>
            <span className="font-mono font-black text-slate-900 text-sm">
              {currentBrand.tone.formality}%
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Boldness
            </span>
            <span className="font-mono font-black text-slate-900 text-sm">
              {currentBrand.tone.boldness}%
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Empathy
            </span>
            <span className="font-mono font-black text-slate-900 text-sm">
              {currentBrand.tone.empathy}%
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & RULE CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 items-center gap-2 min-w-[240px]">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${currentBrand.name}'s rules by name, pattern, or code...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="all">All Rule Categories</option>
            <option value="claim">Claims & Guarantees</option>
            <option value="tone">Tone of Voice</option>
            <option value="terminology">Terminology Glossary</option>
            <option value="visual">Visual & WCAG Contrast</option>
            <option value="legal">Legal & Disclaimers</option>
          </select>

          <button
            onClick={() => setIsAddRuleModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Rule</span>
          </button>
        </div>
      </div>

      {/* RULES LIST FOR ACTIVE BRAND */}
      <div className="space-y-3">
        {filteredRules.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
            <BookOpen className="h-10 w-10 text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No matching rules found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Add a new custom rule to {currentBrand.name} using the button above.
            </p>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const isCritical = rule.severity === "critical";
            const isWarning = rule.severity === "warning";

            return (
              <div
                key={rule.id}
                className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  rule.isEnabled
                    ? "bg-white border-slate-200 hover:border-slate-300"
                    : "bg-slate-50/60 border-slate-200/60 opacity-60"
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {rule.code}
                    </span>

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? "bg-rose-100 text-rose-800"
                          : isWarning
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {rule.severity}
                    </span>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {rule.category}
                    </span>

                    {!rule.isEnabled && (
                      <span className="rounded-full bg-slate-200 text-slate-600 px-2 py-0.2 text-[10px] font-bold">
                        Disabled
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{rule.description}</p>

                  {/* Pattern vs Suggested Replacement */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    <div className="rounded-lg bg-rose-50 border border-rose-100 px-2.5 py-1 text-rose-800 flex items-center gap-1.5 font-medium">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Flag:</span>
                      <span className="line-through">&quot;{rule.pattern}&quot;</span>
                    </div>

                    <ArrowRight className="h-3 w-3 text-slate-400" />

                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-emerald-800 flex items-center gap-1.5 font-medium">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Approved:</span>
                      <span>&quot;{rule.replacement}&quot;</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions: Enable Toggle & Delete */}
                <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {rule.isEnabled ? (
                      <ToggleRight className="h-7 w-7 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-slate-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    title="Delete Rule"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD RULE MODAL */}
      {isAddRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Add Rule to {currentBrand.name}
                </h3>
              </div>
              <button
                onClick={() => setIsAddRuleModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banned Competitor Terminology"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={ruleCategory}
                    onChange={(e) => setRuleCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="claim">Claim & Guarantee</option>
                    <option value="tone">Tone of Voice</option>
                    <option value="terminology">Terminology Glossary</option>
                    <option value="visual">Visual & Contrast</option>
                    <option value="legal">Legal & Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Severity</label>
                  <select
                    value={ruleSeverity}
                    onChange={(e) => setRuleSeverity(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="critical">Critical (Blocker)</option>
                    <option value="warning">Warning (Requires Fix)</option>
                    <option value="info">Info (Recommendation)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Flagged Word / Phrase</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100% bug-free"
                  value={rulePattern}
                  onChange={(e) => setRulePattern(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Approved Replacement Phrase</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. high-reliability architecture"
                  value={ruleReplacement}
                  onChange={(e) => setRuleReplacement(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation / Rationale</label>
                <textarea
                  rows={2}
                  placeholder="Why is this phrase flagged? (Cites brand book or legal standards)"
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRuleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Save Rule to Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD BRAND MODAL */}
      {isAddBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Create Independent Brand Rulebook
                </h3>
              </div>
              <button
                onClick={() => setIsAddBrandModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EcoNova Living"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Industry / Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Sustainable Consumer Goods"
                  value={brandIndustry}
                  onChange={(e) => setBrandIndustry(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Mission Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Eco-conscious living through certified sustainable materials"
                  value={brandTagline}
                  onChange={(e) => setBrandTagline(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Brand Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-9 w-12 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="rounded-xl border border-slate-300 p-2 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBrandModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                >
                  Provision Brand Rulebook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

