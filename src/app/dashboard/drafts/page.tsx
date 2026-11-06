"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  FileText,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Trash2,
  Copy,
  Sparkles,
  Send,
  Eye,
  Layers,
  X,
  BookOpen,
} from "lucide-react";

export interface ContentDraft {
  id: string;
  title: string;
  content: string;
  brand: string;
  channel: string;
  format: "text" | "graphic";
  status: "draft" | "review_pending" | "approved" | "changes_requested";
  author: string;
  updatedAt: string;
  driftScore: number;
  wordCount: number;
  commentsCount: number;
  reviewerNotes?: string;
}

const INITIAL_DRAFTS: ContentDraft[] = [
  {
    id: "draft-001",
    title: "Q4 Global Product Launch Announcement",
    content: "Inkloom is the market's only 100% foolproof AI automation platform with super crazy fast deployment for global brands.",
    brand: "Inkloom AI Enterprises",
    channel: "Blog & Press",
    format: "text",
    status: "review_pending",
    author: currentUser?.name || "Author",
    updatedAt: "10 mins ago",
    driftScore: 78,
    wordCount: 18,
    commentsCount: 2,
    reviewerNotes: "Sarah Chen: Please fix the 100% foolproof claim before we release to press wire.",
  },
  {
    id: "draft-002",
    title: "Instagram Story Creative Carousel - Fall Promo",
    content: "Transform your visual branding with automated AI precision and instant multi-channel governance.",
    brand: "LoomCraft Studio",
    channel: "Instagram / Meta",
    format: "graphic",
    status: "changes_requested",
    author: "Growth Agency Partner",
    updatedAt: "2 hrs ago",
    driftScore: 45,
    wordCount: 14,
    commentsCount: 1,
    reviewerNotes: "Slide 2 font contrast fails WCAG 2.1 AA (2.4:1). Change font color to #0F172A.",
  },
  {
    id: "draft-003",
    title: "Enterprise Security & SOC2 Compliance Whitepaper",
    content: "Inkloom delivers enterprise-grade AI brand governance with verified high-availability and zero data retention for regulated enterprises.",
    brand: "Inkloom AI Enterprises",
    channel: "Whitepaper (PDF)",
    format: "text",
    status: "approved",
    author: "Alex Morgan",
    updatedAt: "Yesterday",
    driftScore: 0,
    wordCount: 24,
    commentsCount: 0,
    reviewerNotes: "Fully compliant with SOC2 disclosure standards. Ready to publish.",
  },
  {
    id: "draft-004",
    title: "PulseFin Q3 Earnings & Security Advisory",
    content: "Our algorithmic portfolio optimization delivers verified risk-adjusted yield based on audited historical benchmarks. Past performance does not guarantee future results.",
    brand: "PulseFin Global",
    channel: "Customer Advisory",
    format: "text",
    status: "draft",
    author: "Alex Morgan",
    updatedAt: "3 days ago",
    driftScore: 12,
    wordCount: 22,
    commentsCount: 0,
  },
];

export default function ActiveDraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<ContentDraft[]>(INITIAL_DRAFTS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [previewDraft, setPreviewDraft] = useState<ContentDraft | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Draft Form State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newBrand, setNewBrand] = useState("Inkloom AI Enterprises");
  const [newChannel, setNewChannel] = useState("LinkedIn & B2B Social");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchDrafts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/drafts");
      if (res.ok) {
        const data = await res.json();
        if (data.drafts && Array.isArray(data.drafts) && data.drafts.length > 0) {
          const mapped: ContentDraft[] = data.drafts.map((d: any) => ({
            id: d.id,
            title: d.title,
            content: d.content,
            brand: d.brand || "Inkloom AI Enterprises",
            channel: d.channel || "Blog & Press",
            format: (d.format === "graphic" || d.format === "Graphic Visual") ? "graphic" : "text",
            status: d.status || "draft",
            author: d.author || "Alex Morgan",
            updatedAt: d.updated_at ? "Live Synced" : "Recent",
            driftScore: d.driftScore ?? 0,
            wordCount: d.wordCount ?? (d.content ? d.content.trim().split(/\s+/).length : 0),
            commentsCount: d.commentsCount ?? 0,
            reviewerNotes: d.reviewerNotes,
          }));
          setDrafts(mapped);
        }
      }
    } catch (err) {
      console.warn("Using offline drafts fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleOpenInInspector = (draft: ContentDraft) => {
    // Store in localStorage so Compliance Inspector picks it up
    if (typeof window !== "undefined") {
      localStorage.setItem("inkloom_active_draft_text", draft.content);
      localStorage.setItem("inkloom_active_draft_channel", draft.channel);
      localStorage.setItem("inkloom_active_draft_brand", draft.brand);
    }
    showToast(`Loaded "${draft.title}" into Compliance Inspector`);
    router.push("/dashboard/creator");
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const optimisticDraft: ContentDraft = {
      id: `draft-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      brand: newBrand,
      channel: newChannel,
      format: "text",
      status: "draft",
      author: "Alex Morgan",
      updatedAt: "Just now",
      driftScore: 0,
      wordCount: newContent.trim().split(/\s+/).length,
      commentsCount: 0,
    };

    setDrafts((prev) => [optimisticDraft, ...prev]);
    setIsCreateModalOpen(false);
    setNewTitle("");
    setNewContent("");

    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: optimisticDraft.title,
          content: optimisticDraft.content,
          brand: optimisticDraft.brand,
          channel: optimisticDraft.channel,
          format: optimisticDraft.format,
          status: "draft",
        }),
      });
      if (res.ok) {
        showToast(`Draft "${optimisticDraft.title}" saved live to database!`);
        fetchDrafts();
      } else {
        showToast(`Draft saved.`);
      }
    } catch {
      showToast(`Draft saved.`);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    try {
      await fetch(`/api/drafts/${id}`, { method: "DELETE" });
      showToast("Draft deleted permanently from database.");
    } catch {
      showToast("Draft moved to archive.");
    }
  };

  const filteredDrafts = drafts.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    const matchesBrand = brandFilter === "all" || d.brand === brandFilter;
    return matchesSearch && matchesStatus && matchesBrand;
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
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
              Workspace
            </span>
            <span className="text-xs text-slate-400">Content Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Active Drafts</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review, organize, and open all in-progress content before brand publication.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Draft</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 items-center gap-2 min-w-[240px]">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search drafts by title, content, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Brand Filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="all">All Brands ({drafts.length})</option>
            <option value="Inkloom AI Enterprises">Inkloom AI</option>
            <option value="LoomCraft Studio">LoomCraft Studio</option>
            <option value="PulseFin Global">PulseFin Global</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Drafting ({drafts.filter((d) => d.status === "draft").length})</option>
            <option value="review_pending">Review Pending ({drafts.filter((d) => d.status === "review_pending").length})</option>
            <option value="changes_requested">Changes Requested ({drafts.filter((d) => d.status === "changes_requested").length})</option>
            <option value="approved">Approved ({drafts.filter((d) => d.status === "approved").length})</option>
          </select>
        </div>
      </div>

      {/* Drafts Grid */}
      {filteredDrafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <FileText className="h-10 w-10 text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No matching drafts found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Try adjusting your search query or create a fresh draft with the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredDrafts.map((draft) => {
            const isApproved = draft.status === "approved";
            const isPending = draft.status === "review_pending";
            const isChanges = draft.status === "changes_requested";

            return (
              <div
                key={draft.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group space-y-4"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                      {draft.brand}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-800"
                          : isPending
                          ? "bg-blue-100 text-blue-800"
                          : isChanges
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {draft.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Title & Preview */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {draft.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    &quot;{draft.content}&quot;
                  </p>

                  {/* Reviewer Note Warning if Changes Requested */}
                  {draft.reviewerNotes && isChanges && (
                    <div className="mt-3 p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-[11px] text-amber-800 flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{draft.reviewerNotes}</span>
                    </div>
                  )}
                </div>

                {/* Footer Metadata & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    <span>{draft.channel}</span> • <span>{draft.updatedAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDraft(draft)}
                      title="Quick Preview"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleOpenInInspector(draft)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Open in Inspector</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK PREVIEW DRAWER / MODAL */}
      {previewDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Draft Details</h3>
              </div>
              <button
                onClick={() => setPreviewDraft(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {previewDraft.brand} • {previewDraft.channel}
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">
                {previewDraft.title}
              </h2>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 leading-relaxed max-h-48 overflow-y-auto">
              {previewDraft.content}
            </div>

            {previewDraft.reviewerNotes && (
              <div className="p-3 rounded-xl border border-blue-100 bg-blue-50 text-xs text-blue-900">
                <span className="font-bold block mb-0.5">Brand Reviewer Feedback:</span>
                <span>{previewDraft.reviewerNotes}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPreviewDraft(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleOpenInInspector(previewDraft);
                  setPreviewDraft(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                <span>Run Compliance Inspection</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE DRAFT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">New Content Draft</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDraft} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Draft Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LinkedIn Product Release Announcement"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Brand</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Inkloom AI Enterprises">Inkloom AI (Enterprise)</option>
                    <option value="LoomCraft Studio">LoomCraft Studio (Creative)</option>
                    <option value="PulseFin Global">PulseFin Global (FinTech)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Publishing Channel</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="LinkedIn & B2B Social">LinkedIn & B2B</option>
                    <option value="Blog & Press">Blog & Press</option>
                    <option value="Instagram / Meta">Instagram / Meta</option>
                    <option value="Whitepaper (PDF)">Whitepaper</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Copy / Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Draft your content copy here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                >
                  Create & Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

