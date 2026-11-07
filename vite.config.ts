import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial in-memory Rulebooks Store
let rulebooksStore = [
  {
    id: "brand-inkloom",
    name: "Inkloom AI Enterprises",
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
    ],
  },
  {
    id: "brand-loomcraft",
    name: "LoomCraft Studio",
    tagline: "High-Velocity Digital Creative Agency",
    industry: "Creative Media & Design",
    primaryColor: "#8B5CF6",
    accentBg: "bg-purple-50 border-purple-200 text-purple-800",
    tone: { formality: 50, boldness: 90, empathy: 80 },
    rules: [
      {
        id: "r-loom-1",
        code: "TRM-01",
        category: "terminology",
        name: "Prohibit Outdated Industry Jargon",
        description: "Modern branding avoids buzzwords like 'synergy' and 'rockstar'.",
        severity: "warning",
        pattern: "growth hacking synergy",
        replacement: "targeted multichannel audience expansion",
        isEnabled: true,
      },
    ],
  },
  {
    id: "brand-pulsefin",
    name: "PulseFin Global",
    tagline: "Institutional FinTech & Digital Custody",
    industry: "Banking & Financial Services",
    primaryColor: "#059669",
    accentBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
    tone: { formality: 95, boldness: 30, empathy: 60 },
    rules: [
      {
        id: "r-pulse-1",
        code: "SEC-01",
        category: "legal",
        name: "FINRA / SEC Return Promises",
        description: "Never guarantee numerical investment returns.",
        severity: "critical",
        pattern: "guaranteed 500% ROI in 30 days",
        replacement: "historical baseline models indicate performance potential",
        isEnabled: true,
      },
    ],
  },
];

// Initial Drafts Store
let draftsStore = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    title: "Q4 Enterprise AI Cloud Resilience Whitepaper",
    author: "Alex Morgan",
    brand: "Inkloom AI Enterprises",
    channel: "Blog & Press",
    format: "Whitepaper",
    status: "review_pending",
    content: "Inkloom is the market's only 100% foolproof AI automation platform with super crazy fast deployment for enterprise teams.",
    wordCount: 1420,
    driftScore: 8,
    updated_at: new Date().toISOString(),
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    title: "Global FinTech API Security Protocols",
    author: "Alex Morgan",
    brand: "PulseFin Global",
    channel: "Technical Documentation",
    format: "Technical Spec",
    status: "approved",
    content: "Standard operating documentation for AES-256 cloud envelope encryption and mutual TLS certificate validation.",
    wordCount: 980,
    driftScore: 2,
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    title: "Creative Studio Multichannel Social Campaign",
    author: "Growth Studio Contractor",
    brand: "LoomCraft Studio",
    channel: "Paid Social (LinkedIn)",
    format: "Ad Copy",
    status: "changes_requested",
    content: "Our growth hacking synergy guarantees double conversions in 48 hours with zero defect infallibility.",
    wordCount: 450,
    driftScore: 42,
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

// Initial Audit Logs
let auditLogsStore = [
  {
    id: "a-001",
    timestamp: new Date().toISOString(),
    user: "Marcus Vance",
    action: "SYSTEM_INITIALIZE",
    entity: "Governance Engine",
    status: "VERIFIED",
    ip: "127.0.0.1",
    details: "All cryptographic zero-data retention policies active.",
  },
  {
    id: "a-002",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    user: "Sarah Chen",
    action: "POLICY_CALIBRATED",
    entity: "Brand Rulebook: Inkloom AI",
    status: "SUCCESS",
    ip: "127.0.0.1",
    details: "Superlative restriction CLM-01 severity set to critical.",
  },
  {
    id: "a-003",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    user: "Alex Morgan",
    action: "CONTENT_AUDITED",
    entity: "Draft: Q4 Enterprise AI Launch",
    status: "FLAGGED",
    ip: "127.0.0.1",
    details: "Identified 2 policy flags: CLM-01 (100% foolproof), TON-01 (super crazy fast).",
  },
];

// Standalone Comprehensive API Mock Plugin for pure React environment
const apiMockPlugin = () => ({
  name: "vite-plugin-api-mock",
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (!req.url.startsWith("/api")) {
        return next();
      }

      let body = "";
      req.on("data", (chunk: any) => {
        body += chunk;
      });

      req.on("end", () => {
        res.setHeader("Content-Type", "application/json");

        let parsedBody: any = {};
        try {
          if (body) parsedBody = JSON.parse(body);
        } catch {}

        // 1. Health Checks
        if (req.url === "/api/health" || req.url === "/api/ai/health") {
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              status: "ok",
              connected: true,
              engine: "ECLIPSE Multimodal Governance Engine",
              powered_by: "Google Gemini 2.0 Vision + Flash",
              model: "gemini-2.0-flash-exp",
              live_gemini_active: true,
              version: "2.5.0",
              endpoint: "http://localhost:3000",
              database: {
                connected: true,
                type: "in-memory / persistent",
                details: "High-speed zero-latency governance store active",
              },
            })
          );
        }

        // 2. Auth: Login & Register
        if (req.url.includes("/api/auth/login")) {
          const email = parsedBody.email || "alex.creator@inkloom.ai";
          const role = email.includes("creator")
            ? "creator"
            : email.includes("admin")
            ? "admin"
            : "brand-manager";
          const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              accessToken: "jwt_token_" + Date.now(),
              refreshToken: "refresh_token_" + Date.now(),
              user: {
                id: "usr_" + Math.random().toString(36).substring(2, 9),
                name: name || "Demo User",
                email,
                role,
                department:
                  role === "creator"
                    ? "Content & Growth Marketing"
                    : role === "admin"
                    ? "System Architecture & Compliance"
                    : "Global Brand & Governance",
              },
            })
          );
        }

        if (req.url.includes("/api/auth/register")) {
          const { name, email, role, department } = parsedBody;
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              accessToken: "jwt_token_" + Date.now(),
              user: {
                id: "usr_" + Math.random().toString(36).substring(2, 9),
                name: name || "New User",
                email: email || "user@inkloom.ai",
                role: role || "creator",
                department: department || "Content & Growth Marketing",
              },
            })
          );
        }

        // 3. Rulebooks (GET & POST)
        if (req.url.startsWith("/api/rulebooks")) {
          if (req.method === "POST") {
            const { action, brandId, ruleId, rule, brand } = parsedBody;

            if (action === "ADD_RULE" && brandId && rule) {
              const target = rulebooksStore.find((b) => b.id === brandId);
              if (target) {
                target.rules.push({
                  id: "r-" + Date.now(),
                  code: rule.code || "RULE-" + (target.rules.length + 1),
                  category: rule.category || "claim",
                  name: rule.name,
                  description: rule.description || "",
                  severity: rule.severity || "warning",
                  pattern: rule.pattern,
                  replacement: rule.replacement || "",
                  isEnabled: true,
                });
              }
              res.statusCode = 200;
              return res.end(JSON.stringify({ message: "Rule added", rulebooks: rulebooksStore }));
            }

            if (action === "TOGGLE_RULE" && brandId && ruleId) {
              const target = rulebooksStore.find((b) => b.id === brandId);
              if (target) {
                const r = target.rules.find((x) => x.id === ruleId);
                if (r) r.isEnabled = !r.isEnabled;
              }
              res.statusCode = 200;
              return res.end(JSON.stringify({ message: "Rule toggled", rulebooks: rulebooksStore }));
            }

            if (action === "DELETE_RULE" && brandId && ruleId) {
              const target = rulebooksStore.find((b) => b.id === brandId);
              if (target) {
                target.rules = target.rules.filter((x) => x.id !== ruleId);
              }
              res.statusCode = 200;
              return res.end(JSON.stringify({ message: "Rule deleted", rulebooks: rulebooksStore }));
            }

            if (action === "CREATE_BRAND" && brand) {
              rulebooksStore.push({
                id: "brand-" + Date.now(),
                name: brand.name,
                tagline: brand.tagline || "Enterprise Guidelines",
                industry: brand.industry || "General",
                primaryColor: brand.primaryColor || "#2563EB",
                accentBg: "bg-blue-50 border-blue-200 text-blue-800",
                tone: brand.tone || { formality: 80, boldness: 60, empathy: 70 },
                rules: brand.rules || [],
              });
              res.statusCode = 200;
              return res.end(JSON.stringify({ message: "Brand created", rulebooks: rulebooksStore }));
            }
          }

          res.statusCode = 200;
          return res.end(JSON.stringify({ rulebooks: rulebooksStore }));
        }

        // 4. Drafts (GET, POST, DELETE)
        if (req.url.startsWith("/api/drafts")) {
          if (req.method === "DELETE") {
            const id = req.url.split("/").pop();
            draftsStore = draftsStore.filter((d) => d.id !== id);
            res.statusCode = 200;
            return res.end(JSON.stringify({ message: "Draft deleted", drafts: draftsStore }));
          }

          if (req.method === "POST") {
            const newDraft = {
              id: "d-" + Date.now(),
              title: parsedBody.title || "Untitled Draft",
              author: parsedBody.author || "Alex Morgan",
              brand: parsedBody.brand || "Inkloom AI Enterprises",
              channel: parsedBody.channel || "LinkedIn & Social",
              format: parsedBody.format || "text",
              status: parsedBody.status || "draft",
              content: parsedBody.content || "",
              wordCount: (parsedBody.content || "").split(/\s+/).filter(Boolean).length,
              driftScore: Math.floor(Math.random() * 20) + 5,
              updated_at: new Date().toISOString(),
            };
            draftsStore.unshift(newDraft);
            res.statusCode = 200;
            return res.end(JSON.stringify({ message: "Draft created successfully", draft: newDraft }));
          }

          res.statusCode = 200;
          return res.end(JSON.stringify({ drafts: draftsStore }));
        }

        // 5. Image & Poster Vision Scanning
        if (req.url.includes("/api/image/scan")) {
          const filename = parsedBody.image_filename || "marketing_creative.png";
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              audit_id: `ECLIPSE-IMG-${Date.now()}`,
              engine_name: "ECLIPSE Multimodal Vision",
              model: "Google Gemini 2.0 Flash Vision",
              compliance_score: 52,
              risk_level: "HIGH",
              quality_scores: {
                overall_score: 52,
                content_quality_score: 48,
                drift_score: 48,
              },
              summary: "Detected 2 critical policy infractions: Low visual contrast (WCAG 2.1 AA violation) and uninsurable superlative guarantee.",
              extracted_text: "INKLOOM: The only 100% foolproof AI platform. Deploy with super crazy fast velocity across all enterprise teams.",
              text_elements: [
                { id: "te_1", text: "INKLOOM: The only 100% foolproof AI platform", element_type: "headline", confidence: 0.99 },
                { id: "te_2", text: "Deploy with super crazy fast velocity across all enterprise teams", element_type: "body", confidence: 0.96 },
                { id: "te_3", text: "Deploy Now", element_type: "cta", confidence: 0.98 },
              ],
              visual_design: {
                contrast_ratio: "2.4:1 (FAIL - WCAG AA requires min 4.5:1)",
                wcag_status: "FAIL",
                visual_hierarchy_rating: "Needs Contrast Remediation",
                detected_colors: ["#FBBF24", "#FFFFFF", "#0F172A"],
                brand_colors_aligned: false,
                logo_detected: true,
                logo_notes: "Clearspace 24px (PASS), placement top-left (PASS).",
                cta_detected: true,
                cta_text: "Deploy Now",
                layout_issues: [
                  "Yellow text on white background violates WCAG 2.1 AA contrast requirements.",
                  "Absolute superlative guarantee triggers false advertising scrutiny.",
                ],
              },
              violations: [
                {
                  id: "v-img-1",
                  category: "Visual & Contrast (WCAG)",
                  severity: "HIGH",
                  problematic_text: "Yellow Headline on Light Card",
                  explanation: "Contrast ratio 2.4:1 is insufficient for mobile accessibility.",
                  guideline_reference: "WCAG 2.1 AA (4.5:1 minimum)",
                  rule_id: "ACC-2.1",
                  suggestion: "Use slate-900 typography on white card for 12.4:1 contrast ratio.",
                },
                {
                  id: "v-img-2",
                  category: "PROHIBITED_TERM",
                  severity: "CRITICAL",
                  problematic_text: "100% foolproof",
                  explanation: "Prohibited absolute superlative claim on public marketing collateral.",
                  guideline_reference: "Rule CLM-01: No Absolute Guarantees",
                  rule_id: "CLM-01",
                  suggestion: "enterprise-grade verified high-availability",
                },
              ],
              remediation_plan: {
                primary_recommendation: "Switch headline typography to Slate-900 (#0F172A) and replace '100% foolproof' with 'enterprise-grade verified'.",
                expected_score_after_fix: 98,
              },
            })
          );
        }

        // 6. Blog & Article AI Review
        if (req.url.includes("/api/blog/review") || req.url.includes("/api/blog/analyze") || req.url.includes("/api/review/start")) {
          const content = parsedBody.content || parsedBody.text || "";
          const words = content.split(/\s+/).filter(Boolean).length;
          const hasFoolproof = content.toLowerCase().includes("100% foolproof");
          const hasCrazyFast = content.toLowerCase().includes("super crazy fast");

          const violations = [];
          if (hasFoolproof) {
            violations.push({
              id: "v-blog-1",
              category: "Legal & Claims",
              severity: "CRITICAL",
              problematic_text: "100% foolproof",
              explanation: "Absolute guarantee cannot be verified under corporate advertising compliance.",
              rule_id: "CLM-01",
              suggestion: "enterprise-grade verified high-availability",
            });
          }
          if (hasCrazyFast) {
            violations.push({
              id: "v-blog-2",
              category: "Tone & Style",
              severity: "WARNING",
              problematic_text: "super crazy fast",
              explanation: "Colloquial hyperbole compromises authoritative enterprise standing.",
              rule_id: "TON-01",
              suggestion: "rapid zero-downtime deployment",
            });
          }

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              audit_id: `ECLIPSE-BLOG-${Date.now()}`,
              engine_name: "ECLIPSE AI",
              compliance_score: violations.length > 0 ? 58 : 96,
              risk_level: violations.length > 0 ? "HIGH" : "LOW",
              quality_scores: {
                overall_score: violations.length > 0 ? 58 : 96,
                brand_compliance_score: violations.length > 0 ? 58 : 96,
                drift_score: violations.length > 0 ? 42 : 4,
              },
              summary: violations.length > 0
                ? "Identified 2 brand governance policy infractions requiring editorial calibration."
                : "Content fully adheres to Inkloom AI tone, legal, and terminology guidelines.",
              violations,
              recommended_correction: content
                .replace(/100% foolproof/gi, "enterprise-grade verified high-availability")
                .replace(/super crazy fast/gi, "rapid zero-downtime deployment"),
              word_count_original: words,
              word_count_corrected: words,
              readability_level: "Grade 9-11 (Optimal for Enterprise B2B)",
            })
          );
        }

        // 7. Workflow Approvals (Approve / Reject)
        if (req.url.includes("/api/workflow/approve")) {
          const draftId = parsedBody.draftId || parsedBody.draft_id;
          const target = draftsStore.find((d) => d.id === draftId);
          if (target) target.status = "approved";
          auditLogsStore.unshift({
            id: "a-" + Date.now(),
            timestamp: new Date().toISOString(),
            user: "Sarah Chen",
            action: "DRAFT_APPROVED",
            entity: `Draft ${draftId || "REV-9021"}`,
            status: "APPROVED",
            ip: "127.0.0.1",
            details: "Full pre-publication governance approval granted.",
          });
          res.statusCode = 200;
          return res.end(JSON.stringify({ status: "approved", message: "Draft approved successfully." }));
        }

        if (req.url.includes("/api/workflow/reject")) {
          const draftId = parsedBody.draftId || parsedBody.draft_id;
          const target = draftsStore.find((d) => d.id === draftId);
          if (target) target.status = "changes_requested";
          auditLogsStore.unshift({
            id: "a-" + Date.now(),
            timestamp: new Date().toISOString(),
            user: "Sarah Chen",
            action: "CHANGES_REQUESTED",
            entity: `Draft ${draftId || "REV-9021"}`,
            status: "CHANGES_REQUESTED",
            ip: "127.0.0.1",
            details: parsedBody.comment || parsedBody.notes || "Editorial changes requested.",
          });
          res.statusCode = 200;
          return res.end(JSON.stringify({ status: "changes_requested", message: "Changes requested from author." }));
        }

        // 8. Database Tables & Studio Inspection
        if (req.url.includes("/api/database/tables")) {
          const urlParams = new URL(req.url, "http://localhost:3000").searchParams;
          const table = urlParams.get("table") || "organizations";

          let rows: any[] = [];
          if (table === "organizations") {
            rows = [
              { id: "org-01", name: "Inkloom AI Enterprises", industry: "Enterprise AI & Cloud Governance", created_at: "2026-01-15T09:00:00Z" },
              { id: "org-02", name: "LoomCraft Studio", industry: "Digital Creative Agency", created_at: "2026-02-10T14:30:00Z" },
              { id: "org-03", name: "PulseFin Global", industry: "Banking & Financial Services", created_at: "2026-03-01T11:15:00Z" },
            ];
          } else if (table === "users") {
            rows = [
              { id: "u-01", name: "Alex Morgan", email: "alex.creator@inkloom.ai", role: "creator", department: "Content & Communications", status: "ACTIVE" },
              { id: "u-02", name: "Sarah Chen", email: "sarah.brand@inkloom.ai", role: "brand-manager", department: "Global Brand Governance", status: "ACTIVE" },
              { id: "u-03", name: "Marcus Vance", email: "marcus.admin@inkloom.ai", role: "admin", department: "Information Security", status: "ACTIVE" },
              { id: "u-04", name: "Growth Agency Partner", email: "contractor@agency.studio", role: "creator", department: "External Contractor", status: "ACTIVE" },
            ];
          } else if (table === "drafts") {
            rows = draftsStore;
          } else if (table === "rules") {
            rows = rulebooksStore.flatMap((b) => b.rules.map((r) => ({ ...r, brand: b.name })));
          } else if (table === "audit_logs") {
            rows = auditLogsStore;
          } else {
            rows = [
              { id: "rec-01", name: "Sample Record 1", status: "active", created_at: new Date().toISOString() },
              { id: "rec-02", name: "Sample Record 2", status: "active", created_at: new Date().toISOString() },
            ];
          }

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              table,
              connection: { connected: true, type: "PostgreSQL (Supabase Active / Local Fallback)", endpoint: "live_governance_db" },
              count: rows.length,
              rows,
            })
          );
        }

        if (req.url.includes("/api/database/connect")) {
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              connected: true,
              type: "postgres",
              details: "PostgreSQL / Supabase connection calibrated successfully.",
            })
          );
        }

        // Default Fallback
        res.statusCode = 200;
        return res.end(JSON.stringify({ status: "ok", data: [] }));
      });
    });
  },
});

export default defineConfig({
  plugins: [react(), apiMockPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "next/link": path.resolve(__dirname, "./src/lib/next-compat/link.tsx"),
      "next/navigation": path.resolve(__dirname, "./src/lib/next-compat/navigation.tsx"),
      "next/image": path.resolve(__dirname, "./src/lib/next-compat/image.tsx"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    strictPort: true,
  },
  define: {
    global: "window",
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    "process.env.NEXT_PUBLIC_BACKEND_URL": JSON.stringify(""),
  },
});
