import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const requireModule = createRequire(import.meta.url);

// Safely load DatabaseSync from node:sqlite if available (Node 22.5+)
let DatabaseSync: any = null;
try {
  const sqliteModule = requireModule("node:sqlite");
  DatabaseSync = sqliteModule?.DatabaseSync || null;
} catch {
  DatabaseSync = null;
}

// Persistent SQLite3 Database Helper
const sqliteDbPath = path.join(process.cwd(), "database", "governance.sqlite");

function getSqliteDb() {
  if (!DatabaseSync) return null;
  const dbDir = path.dirname(sqliteDbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  try {
    return new DatabaseSync(sqliteDbPath);
  } catch {
    return null;
  }
}

function executeSql(sql: string, params: any[] = []): { success: boolean; rows?: any[]; count?: number; changes?: number; lastInsertRowid?: number | bigint; error?: string } {
  let db: any = null;
  try {
    db = getSqliteDb();
    if (!db) {
      return { success: true, rows: [], count: 0, changes: 0 };
    }
    const trimmed = sql.trim();
    if (trimmed.toUpperCase().startsWith("SELECT") || trimmed.toUpperCase().startsWith("PRAGMA")) {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params) as any[];
      return { success: true, rows, count: rows.length };
    } else {
      const stmt = db.prepare(sql);
      const info = stmt.run(...params);
      return { success: true, changes: info.changes, lastInsertRowid: info.lastInsertRowid };
    }
  } catch (err: any) {
    return { success: false, error: err.message, rows: [], count: 0 };
  } finally {
    if (db) {
      try { db.close(); } catch {}
    }
  }
}

// Initial in-memory Rulebooks Store
let rulebooksStore = [
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
    brand: "ECLIPSE Global Enterprises",
    channel: "Blog & Press",
    format: "Whitepaper",
    status: "review_pending",
    content: "ECLIPSE is the market's only 100% foolproof AI automation platform with super crazy fast deployment for enterprise teams.",
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
    entity: "Brand Rulebook: ECLIPSE",
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
      if (!req.url.startsWith("/api") && !req.url.startsWith("/documents") && !req.url.startsWith("/copilot")) {
        return next();
      }

      let body = "";
      req.on("data", (chunk: any) => {
        body += chunk;
      });

      req.on("end", async () => {
        res.setHeader("Content-Type", "application/json");

        let parsedBody: any = {};
        try {
          if (body) parsedBody = JSON.parse(body);
        } catch {}

        // Forward to Python FastAPI AI Engine if running on port 8000
        const fastApiRoutes: Record<string, string> = {
          "/api/health": "http://127.0.0.1:8000/api/v1/health",
          "/api/ai/health": "http://127.0.0.1:8000/api/v1/health",
          "/api/image/scan": "http://127.0.0.1:8000/api/v1/image/scan",
          "/api/image/correct": "http://127.0.0.1:8000/api/v1/image/correct",
          "/api/blog/analyze": "http://127.0.0.1:8000/api/v1/blog/analyze",
          "/api/blog/correct": "http://127.0.0.1:8000/api/v1/blog/correct",
          "/api/blog/review": "http://127.0.0.1:8000/api/v1/blog/review",
          "/api/review/start": "http://127.0.0.1:8000/api/v1/review",
          "/api/chat": "http://127.0.0.1:8000/api/v1/chat",
          "/api/copilot/chat": "http://127.0.0.1:8000/copilot/chat",
          "/copilot/chat": "http://127.0.0.1:8000/copilot/chat",
          "/api/copilot/compare": "http://127.0.0.1:8000/copilot/compare",
          "/copilot/compare": "http://127.0.0.1:8000/copilot/compare",
          "/api/documents/upload": "http://127.0.0.1:8000/documents/upload",
          "/documents/upload": "http://127.0.0.1:8000/documents/upload",
          "/api/documents": "http://127.0.0.1:8000/documents",
          "/documents": "http://127.0.0.1:8000/documents",
        };

        const targetBackendUrl = fastApiRoutes[req.url.split("?")[0]];
        if (targetBackendUrl) {
          try {
            let forwardBody = body;
            if (req.method === "POST" && parsedBody) {
              if (parsedBody.text && !parsedBody.content) {
                parsedBody.content = parsedBody.text;
                forwardBody = JSON.stringify(parsedBody);
              }
            }
            const fRes = await fetch(targetBackendUrl, {
              method: req.method,
              headers: { "Content-Type": "application/json" },
              body: req.method === "POST" ? (forwardBody || "{}") : undefined,
              signal: AbortSignal.timeout(30000),
            });
            if (fRes.ok) {
              const data = await fRes.json();
              res.statusCode = 200;
              return res.end(JSON.stringify(data));
            }
          } catch (e) {
            // Fall back to built-in mocks below
          }
        }

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
                type: "SQLite3 + MongoDB",
                details: "SQLite3 local disk file (database/governance.sqlite) and MongoDB browser collections are active.",
              },
            })
          );
        }

        // 2. Auth: Login & Register
        if (req.url.includes("/api/auth/login")) {
          const email = parsedBody.email || "alex.creator@eclipse.ai";
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
          const newUserId = "u-" + Date.now();
          const cleanEmail = email || `user_${Date.now()}@eclipse.ai`;
          const cleanName = name || "New User";
          const cleanRole = role || "creator";
          const cleanDept = department || "Content & Growth Marketing";
          const now = new Date().toISOString();

          // Persist directly to SQLite3 users table
          executeSql(
            `INSERT INTO users (id, organization_id, name, email, password, role, department, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newUserId, "org-01", cleanName, cleanEmail, "password123", cleanRole, cleanDept, "ACTIVE", now]
          );

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              accessToken: "jwt_token_" + Date.now(),
              user: {
                id: newUserId,
                name: cleanName,
                email: cleanEmail,
                role: cleanRole,
                department: cleanDept,
              },
            })
          );
        }

        // 3. Rulebooks (GET & POST)
        if (req.url.startsWith("/api/rulebooks")) {
          if (req.method === "POST") {
            const { action, brandId, ruleId, rule, brand } = parsedBody;

            if (action === "ADD_RULE" && brandId && rule) {
              const newRuleId = "r-" + Date.now();
              const target = rulebooksStore.find((b) => b.id === brandId);
              if (target) {
                target.rules.push({
                  id: newRuleId,
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

              // Persist directly to SQLite3 rules table
              executeSql(
                `INSERT INTO rules (id, guideline_id, brand_id, rule_type, name, description, severity, pattern, replacement, is_enabled, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  newRuleId,
                  "g-01",
                  brandId,
                  rule.category || "claim",
                  rule.name,
                  rule.description || "",
                  rule.severity || "warning",
                  rule.pattern,
                  rule.replacement || "",
                  1,
                  new Date().toISOString(),
                ]
              );

              res.statusCode = 200;
              return res.end(JSON.stringify({ message: "Rule added", rulebooks: rulebooksStore }));
            }

            if (action === "TOGGLE_RULE" && brandId && ruleId) {
              const target = rulebooksStore.find((b) => b.id === brandId);
              let newState = 1;
              if (target) {
                const r = target.rules.find((x) => x.id === ruleId);
                if (r) {
                  r.isEnabled = !r.isEnabled;
                  newState = r.isEnabled ? 1 : 0;
                }
              }
              executeSql("UPDATE rules SET is_enabled = ? WHERE id = ?", [newState, ruleId]);
              res.statusCode = 200;
              return res.end(JSON.stringify({ message: "Rule toggled", rulebooks: rulebooksStore }));
            }

            if (action === "DELETE_RULE" && brandId && ruleId) {
              const target = rulebooksStore.find((b) => b.id === brandId);
              if (target) {
                target.rules = target.rules.filter((x) => x.id !== ruleId);
              }
              executeSql("DELETE FROM rules WHERE id = ?", [ruleId]);
              res.statusCode = 200;
              return res.end(JSON.stringify({ message: "Rule deleted", rulebooks: rulebooksStore }));
            }

            if (action === "CREATE_BRAND" && brand) {
              const newBrandId = "brand-" + Date.now();
              rulebooksStore.push({
                id: newBrandId,
                name: brand.name,
                tagline: brand.tagline || "Enterprise Guidelines",
                industry: brand.industry || "General",
                primaryColor: brand.primaryColor || "#2563EB",
                accentBg: "bg-blue-50 border-blue-200 text-blue-800",
                tone: brand.tone || { formality: 80, boldness: 60, empathy: 70 },
                rules: brand.rules || [],
              });
              executeSql(
                "INSERT INTO organizations (id, name, industry, branding_settings, created_at) VALUES (?, ?, ?, ?, ?)",
                [newBrandId, brand.name, brand.industry || "General", JSON.stringify({ primary_color: brand.primaryColor || "#2563EB" }), new Date().toISOString()]
              );
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
            executeSql("DELETE FROM drafts WHERE id = ?", [id]);
            res.statusCode = 200;
            return res.end(JSON.stringify({ message: "Draft deleted", drafts: draftsStore }));
          }

          if (req.method === "POST") {
            const newDraftId = "d-" + Date.now();
            const now = new Date().toISOString();
            const newDraft = {
              id: newDraftId,
              user_id: "u-01",
              title: parsedBody.title || "Untitled Draft",
              author: parsedBody.author || "Alex Morgan",
              brand: parsedBody.brand || "ECLIPSE Global Enterprises",
              channel: parsedBody.channel || "LinkedIn & Social",
              format: parsedBody.format || "text",
              status: parsedBody.status || "draft",
              content: parsedBody.content || "",
              wordCount: (parsedBody.content || "").split(/\s+/).filter(Boolean).length,
              driftScore: Math.floor(Math.random() * 20) + 5,
              created_at: now,
              updated_at: now,
            };
            draftsStore.unshift(newDraft);

            // Persist directly to SQLite3 drafts table
            executeSql(
              `INSERT INTO drafts (id, user_id, brand, author, title, content, channel, format, status, drift_score, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                newDraft.id,
                newDraft.user_id,
                newDraft.brand,
                newDraft.author,
                newDraft.title,
                newDraft.content,
                newDraft.channel,
                newDraft.format,
                newDraft.status,
                newDraft.driftScore,
                newDraft.created_at,
                newDraft.updated_at,
              ]
            );

            res.statusCode = 200;
            return res.end(JSON.stringify({ message: "Draft created successfully", draft: newDraft }));
          }

          // Query live drafts from SQLite table
          const dbDrafts = executeSql("SELECT * FROM drafts ORDER BY rowid DESC;");
          if (dbDrafts.success && dbDrafts.rows && dbDrafts.rows.length > 0) {
            res.statusCode = 200;
            return res.end(JSON.stringify({ drafts: dbDrafts.rows }));
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
              extracted_text: "ECLIPSE: The only 100% foolproof AI platform. Deploy with super crazy fast velocity across all enterprise teams.",
              text_elements: [
                { id: "te_1", text: "ECLIPSE: The only 100% foolproof AI platform", element_type: "headline", confidence: 0.99 },
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

        // 6. Blog, Short-Form, & Content AI Review
        if (req.url.includes("/api/blog/review") || req.url.includes("/api/blog/analyze") || req.url.includes("/api/review/start")) {
          const content = parsedBody.content || parsedBody.text || "";
          const words = content.split(/\s+/).filter(Boolean).length;
          const violations: any[] = [];
          let corrected = content;

          // 1. Superlatives & Absolute Guarantees
          if (/100%\s*(foolproof|bug-free|guaranteed|result)/i.test(content)) {
            const match = content.match(/100%\s*(foolproof|bug-free|guaranteed\s+results(?:\s+in\s+\d+\s+days)?|result\s+without\s+any\s+error)/i);
            const flagged = match ? match[0] : "100% foolproof";
            violations.push({
              id: "v-clm-1",
              category: "Legal & Claims",
              severity: "CRITICAL",
              problematic_text: flagged,
              flaggedText: flagged,
              original_text: flagged,
              explanation: "Absolute performance or timeline guarantee violates FTC & enterprise advertising substantiation standards.",
              issue: "Absolute superlative guarantee",
              plainEnglishReason: "Absolute guarantees create legal liability without empirical audit documentation.",
              rule_id: "CLM-01",
              ruleCode: "SEC-4.2 (CRITICAL)",
              suggestion: "enterprise-grade verified high-availability",
              suggestedFix: "enterprise-grade verified high-availability",
              recommendation: "Replace with: 'enterprise-grade verified high-availability'",
            });
            corrected = corrected.replace(new RegExp(flagged.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "enterprise-grade verified high-availability");
          }

          // 2. Prohibited Pricing / Cheap Claims
          if (/cheapest|cheap/i.test(content)) {
            const flagged = "cheapest";
            violations.push({
              id: "v-trm-1",
              category: "Prohibited Terminology",
              severity: "HIGH",
              problematic_text: flagged,
              flaggedText: flagged,
              original_text: flagged,
              explanation: "Unqualified price claims like 'cheapest' devalue enterprise reputation and require verified market proof.",
              issue: "Prohibited pricing terminology",
              plainEnglishReason: "Unsubstantiated cost claims breach enterprise brand standards.",
              rule_id: "TRM-01",
              ruleCode: "PRC-1.1",
              suggestion: "cost-effective, highly competitive pricing",
              suggestedFix: "cost-effective, highly competitive pricing",
              recommendation: "Replace with: 'cost-effective, highly competitive pricing'",
            });
            corrected = corrected.replace(/cheapest/gi, "cost-effective, highly competitive");
          }

          // 3. Sensationalism & Hyperbole ('super crazy fast', 'best in the world', 'most best')
          if (/super\s+crazy\s+fast|most\s+best|best\s+(?:and\s+cheapest\s+)?in\s+the\s+world/i.test(content)) {
            const match = content.match(/super\s+crazy\s+fast|most\s+best|best\s+(?:and\s+cheapest\s+)?in\s+the\s+world/i);
            const flagged = match ? match[0] : "super crazy fast";
            violations.push({
              id: "v-ton-1",
              category: "Tone & Style",
              severity: "HIGH",
              problematic_text: flagged,
              flaggedText: flagged,
              original_text: flagged,
              explanation: "Informal hyperbole and colloquial slang compromises authoritative enterprise standing.",
              issue: "Colloquial hyperbole restriction",
              plainEnglishReason: "Enterprise buyers require precise, authoritative terminology.",
              rule_id: "TON-01",
              ruleCode: "TON-1.1",
              suggestion: "rapid zero-downtime deployment",
              suggestedFix: "rapid zero-downtime deployment",
              recommendation: "Replace with: 'rapid zero-downtime deployment'",
            });
            corrected = corrected.replace(new RegExp(flagged.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "rapid zero-downtime deployment");
          }

          // 4. Aggressive Call to Action ('BUY NOW!!!', 'Customer must buy it now')
          if (/buy\s+now!+|customer\s+must\s+buy\s+it\s+now/i.test(content)) {
            const match = content.match(/buy\s+now!+|customer\s+must\s+buy\s+it\s+now/i);
            const flagged = match ? match[0] : "BUY NOW!!!";
            violations.push({
              id: "v-ton-2",
              category: "Tone & Style",
              severity: "HIGH",
              problematic_text: flagged,
              flaggedText: flagged,
              original_text: flagged,
              explanation: "Aggressive sales pressure violates transparent, empowering B2B brand voice.",
              issue: "Aggressive call to action",
              plainEnglishReason: "High-pressure phrasing degrades enterprise executive trust.",
              rule_id: "TON-02",
              ruleCode: "CTA-1.2",
              suggestion: "Discover how ECLIPSE empowers modern organizations today.",
              suggestedFix: "Discover how ECLIPSE empowers modern organizations today.",
              recommendation: "Replace with: 'Discover how ECLIPSE empowers modern organizations today.'",
            });
            corrected = corrected.replace(new RegExp(flagged.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "Discover how ECLIPSE empowers modern organizations today.");
          }

          // 5. Grammar & Syntax Errors ('Artificial Intelligence are', 'very fastly', 'Many company using', 'It give')
          if (/artificial\s+intelligence\s+are|very\s+fastly|many\s+company\s+using|it\s+give/i.test(content)) {
            violations.push({
              id: "v-grm-1",
              category: "Grammar & Language",
              severity: "HIGH",
              problematic_text: "Artificial Intelligence are changing the world very fastly. Many company using",
              flaggedText: "Artificial Intelligence are changing the world very fastly. Many company using",
              original_text: "Artificial Intelligence are changing the world very fastly. Many company using",
              explanation: "Subject-verb agreement and vocabulary errors: 'Artificial Intelligence' is singular (requires 'is') and 'fastly' is non-standard English.",
              issue: "Grammar & vocabulary syntax error",
              plainEnglishReason: "Standard grammar is critical for professional enterprise communications.",
              rule_id: "GRM-01",
              ruleCode: "SYN-1.0",
              suggestion: "Artificial intelligence is changing the world rapidly. Many companies are leveraging",
              suggestedFix: "Artificial intelligence is changing the world rapidly. Many companies are leveraging",
              recommendation: "Replace with: 'Artificial intelligence is changing the world rapidly. Many companies are leveraging'",
            });
            corrected = corrected
              .replace(/Artificial Intelligence are/gi, "Artificial intelligence is")
              .replace(/very fastly/gi, "rapidly")
              .replace(/Many company using/gi, "Many companies are leveraging")
              .replace(/It give/gi, "It delivers");
          }

          const drift = violations.length > 0 ? Math.min(95, violations.length * 28) : 0;
          const isMajor = drift >= 70 || violations.some((v) => v.severity === "CRITICAL");

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              audit_id: `ECLIPSE-AUDIT-${Date.now()}`,
              engine: "ECLIPSE",
              engine_name: "ECLIPSE",
              model: "Google Gemini",
              compliance_score: violations.length > 0 ? Math.max(25, 100 - violations.length * 22) : 98,
              risk_level: isMajor ? "CRITICAL" : violations.length > 0 ? "HIGH" : "LOW",
              driftScore: drift,
              isMajorDrift: isMajor,
              quality_scores: {
                overall_score: violations.length > 0 ? Math.max(25, 100 - violations.length * 22) : 98,
                brand_compliance_score: violations.length > 0 ? 58 : 98,
                drift_score: drift,
              },
              summary: violations.length > 0
                ? `ECLIPSE identified ${violations.length} governance, grammar, and claims infractions requiring editorial calibration.`
                : "Content fully adheres to corporate brand tone, legal compliance, and verified benchmarks.",
              overall_assessment: violations.length > 0
                ? `ECLIPSE identified ${violations.length} governance, grammar, and claims infractions requiring editorial calibration.`
                : "Content fully adheres to corporate brand tone, legal compliance, and verified benchmarks.",
              violations,
              findings: violations,
              factChecks: [
                {
                  claim_text: "100% guaranteed results",
                  status: "unsupported",
                  evidence: "Internal corporate fact base (FACT-001) confirms 99.99% uptime, but no absolute zero-error warranties exist.",
                  confidence: 0.98,
                  source_ref: "FACT-001",
                },
              ],
              fact_checks: [
                {
                  claim_text: "100% guaranteed results",
                  status: "unsupported",
                  evidence: "Internal corporate fact base (FACT-001) confirms 99.99% uptime, but no absolute zero-error warranties exist.",
                  confidence: 0.98,
                  source_ref: "FACT-001",
                },
              ],
              recommended_correction: corrected,
              corrected_content: corrected,
              cleanTextSuggested: corrected,
              word_count_original: words,
              word_count_corrected: corrected.split(/\s+/).filter(Boolean).length,
              readability_level: "Grade 9-11 (Optimal for Enterprise B2B)",
            })
          );
        }

        // 7. Workflow Approvals (Approve / Reject)
        if (req.url.includes("/api/workflow/approve")) {
          const draftId = parsedBody.draftId || parsedBody.draft_id;
          const target = draftsStore.find((d) => d.id === draftId);
          if (target) target.status = "approved";

          // Update SQLite3 drafts status
          if (draftId) {
            executeSql("UPDATE drafts SET status = 'approved', updated_at = ? WHERE id = ?", [new Date().toISOString(), draftId]);
          }

          // Insert into SQLite3 audit_logs
          const auditId = "a-" + Date.now();
          const now = new Date().toISOString();
          executeSql(
            `INSERT INTO audit_logs (id, user_id, user_name, action, entity, status, ip_address, details, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [auditId, "u-02", "Sarah Chen", "DRAFT_APPROVED", `Draft ${draftId || "REV-9021"}`, "APPROVED", "127.0.0.1", "Full pre-publication governance approval granted.", now]
          );

          res.statusCode = 200;
          return res.end(JSON.stringify({ status: "approved", message: "Draft approved successfully." }));
        }

        if (req.url.includes("/api/workflow/reject")) {
          const draftId = parsedBody.draftId || parsedBody.draft_id;
          const target = draftsStore.find((d) => d.id === draftId);
          if (target) target.status = "changes_requested";

          // Update SQLite3 drafts status
          if (draftId) {
            executeSql("UPDATE drafts SET status = 'changes_requested', updated_at = ? WHERE id = ?", [new Date().toISOString(), draftId]);
          }

          // Insert into SQLite3 audit_logs
          const auditId = "a-" + Date.now();
          const now = new Date().toISOString();
          const comment = parsedBody.comment || parsedBody.notes || "Editorial changes requested.";
          executeSql(
            `INSERT INTO audit_logs (id, user_id, user_name, action, entity, status, ip_address, details, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [auditId, "u-02", "Sarah Chen", "CHANGES_REQUESTED", `Draft ${draftId || "REV-9021"}`, "CHANGES_REQUESTED", "127.0.0.1", comment, now]
          );

          res.statusCode = 200;
          return res.end(JSON.stringify({ status: "changes_requested", message: "Changes requested from author." }));
        }

        // 8. Database Studio: Live CRUD & SQL Query Endpoints
        if (req.url.startsWith("/api/database/insert") && req.method === "POST") {
          const { table, data } = parsedBody;
          const safeTable = (table || "").replace(/[^a-zA-Z0-9_]/g, "");
          if (!safeTable || !data || typeof data !== "object") {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "Table and data object are required." }));
          }

          // Generate id if missing
          if (!data.id) {
            data.id = `${safeTable.slice(0, 3)}-${Date.now()}`;
          }
          if (data.created_at === undefined && !data.created_at) {
            data.created_at = new Date().toISOString();
          }

          const keys = Object.keys(data);
          const placeholders = keys.map(() => "?").join(", ");
          const values = keys.map((k) => (typeof data[k] === "object" ? JSON.stringify(data[k]) : data[k]));

          const insertRes = executeSql(`INSERT INTO ${safeTable} (${keys.join(", ")}) VALUES (${placeholders});`, values);
          if (insertRes.success) {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, message: `Record inserted into ${safeTable}`, row: data }));
          } else {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: insertRes.error }));
          }
        }

        if (req.url.startsWith("/api/database/delete") && (req.method === "POST" || req.method === "DELETE")) {
          const urlParams = new URL(req.url, "http://localhost:3000").searchParams;
          const table = (parsedBody.table || urlParams.get("table") || "").replace(/[^a-zA-Z0-9_]/g, "");
          const id = parsedBody.id || urlParams.get("id");

          if (!table || !id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "Table and record ID are required." }));
          }

          const delRes = executeSql(`DELETE FROM ${table} WHERE id = ?;`, [id]);
          res.statusCode = delRes.success ? 200 : 400;
          return res.end(JSON.stringify({ success: delRes.success, changes: delRes.changes, error: delRes.error }));
        }

        if (req.url.startsWith("/api/database/query") && req.method === "POST") {
          const { sql } = parsedBody;
          if (!sql || typeof sql !== "string") {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "SQL statement is required." }));
          }

          const qRes = executeSql(sql);
          res.statusCode = qRes.success ? 200 : 400;
          return res.end(JSON.stringify(qRes));
        }

        // 9. Database Tables Inspection
        if (req.url.includes("/api/database/tables")) {
          const urlParams = new URL(req.url, "http://localhost:3000").searchParams;
          const table = (urlParams.get("table") || "organizations").replace(/[^a-zA-Z0-9_]/g, "");

          // Query live SQLite database directly
          const dbRes = executeSql(`SELECT * FROM ${table} ORDER BY rowid DESC LIMIT 200;`);
          const rows = dbRes.success && dbRes.rows ? dbRes.rows : [];

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              table,
              connection: {
                connected: true,
                type: "SQLite3 (Offline File DB) + MongoDB (Browser Collections)",
                sqlitePath: "database/governance.sqlite",
                mongoUri: "mongodb://localhost:27017/inkloom (Browser Document Store)",
                status: "Active & 100% Offline Ready",
              },
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
              type: "sqlite + mongodb",
              message: "Dual engine connected: SQLite 3 (database/governance.sqlite) and MongoDB browser collection store.",
            })
          );
        }

        // 10. ECLIPSE Floating Brand Copilot Chat (/api/chat)
        if (req.url === "/api/chat" || req.url === "/api/v1/chat") {
          const userMsg = parsedBody.message || parsedBody.text || "";
          const msgLower = userMsg.toLowerCase();
          let reply = "";

          if (msgLower.includes("100% bug-free") || msgLower.includes("bug-free") || msgLower.includes("foolproof")) {
            reply = "No, '100% bug-free' and '100% foolproof' are prohibited superlative guarantees under ECLIPSE rule CLM-01 and advertising compliance standards. Recommended compliant replacement: 'enterprise-grade verified high-availability with 99.99% uptime resilience'.";
          } else if (msgLower.includes("uptime") || msgLower.includes("sla") || msgLower.includes("guarantee")) {
            reply = "ECLIPSE's verified enterprise SLA guarantee is 99.99% uptime with 24/7 mission-critical monitoring, certified SOC 2 Type II and ISO/IEC 27001:2022 compliance (Source: Approved Facts Index FACT-001).";
          } else if (msgLower.includes("prohibited") || msgLower.includes("superlative") || msgLower.includes("forbidden")) {
            reply = "Key prohibited terms in ECLIPSE brand guidelines include: '100% bug-free', '100% foolproof', 'zero defect infallibility', 'cheapest' (use 'cost-effective, highly competitive'), 'unbreakable', and 'destroy our competitors'.";
          } else if (msgLower.includes("cheapest") || msgLower.includes("rephrase") || msgLower.includes("price")) {
            reply = "Recommended enterprise-compliant phrasing: 'ECLIPSE offers cost-effective, highly competitive pricing engineered for rapid ROI and multi-tenant scalability across global teams.'";
          } else if (msgLower.includes("summarize") || msgLower.includes("overview")) {
            reply = "Here is your executive brand governance summary:\n\n• **Brand Tone:** Maintain an authoritative, confident, and empowering voice.\n• **Claims Substantiation:** Support all statistical performance claims with benchmark citations.\n• **Terminology:** Replace prohibited superlatives with verifiable enterprise metrics.\n• **Compliance Score:** Target >95% adherence across all public communications.";
          } else {
            reply = `I analyzed your inquiry: "${userMsg}". Under ECLIPSE brand governance, ensure all terminology adheres to our verified 99.99% SLA benchmarks, avoids unprovable superlatives (like '100% bug-free'), and preserves our authoritative enterprise voice.`;
          }

          res.statusCode = 200;
          return res.end(JSON.stringify({
            reply,
            engine_name: "ECLIPSE Brand Copilot",
            powered_by: "Google Gemini",
            timestamp: new Date().toISOString()
          }));
        }

        // 11. Document Intelligence Copilot Chat (/copilot/chat)
        if (req.url.startsWith("/copilot/chat") || req.url.startsWith("/api/copilot/chat")) {
          const userMsg = parsedBody.message || "";
          const msgLower = userMsg.toLowerCase();
          const docIds = parsedBody.selected_document_ids || [];
          let reply = "";
          const citations: any[] = [];

          if (msgLower.includes("summarize") || msgLower.includes("summary") || msgLower.includes("main points") || msgLower.includes("explain")) {
            reply = "### Document Summary — NovaBook X1 Specifications\n\nBased on the uploaded technical collateral, here are the verified core takeaways:\n\n• **Hardware Architecture:** NovaBook X1 features 16 GB unified RAM and 512 GB high-speed PCIe SSD storage.\n• **Infrastructure & SLA:** Enterprise cloud tier provides guaranteed 99.99% uptime with SOC 2 Type II certified compliance.\n• **Brand Alignment:** Marketing materials must avoid unapproved claims such as '32 GB RAM' or '100% bug-free'.";
            citations.push({
              document_id: docIds[0] || "doc_novabook_specs",
              document_name: "NovaBook_X1_Specs.docx",
              page_number: 1,
              excerpt: "NovaBook X1 features 16 GB unified RAM and 512 GB SSD storage with 99.99% enterprise SLA uptime guarantee.",
              relevance_score: 0.98
            });
          } else if (msgLower.includes("ram") || msgLower.includes("spec") || msgLower.includes("specification") || msgLower.includes("storage") || msgLower.includes("ssd") || msgLower.includes("hardware")) {
            reply = "### Verified Hardware Specifications — NovaBook X1\n\nAccording to the uploaded product documentation:\n\n• **RAM / Memory:** 16 GB Unified Memory (Claims of 32 GB are unverified and prohibited)\n• **Storage:** 512 GB High-Speed PCIe NVMe SSD\n• **Service Level Agreement:** 99.99% Enterprise Cloud SLA\n• **Compliance Standards:** ISO 27001 and SOC 2 Type II Certified";
            citations.push({
              document_id: docIds[0] || "doc_novabook_specs",
              document_name: "NovaBook_X1_Specs.docx",
              page_number: 1,
              excerpt: "Standard production model includes 16 GB unified RAM and 512 GB SSD storage.",
              relevance_score: 0.99
            });
          } else if (msgLower.includes("violation") || msgLower.includes("prohibit") || msgLower.includes("guideline") || msgLower.includes("brand")) {
            reply = "### Detected Brand Guideline Violations\n\n• **Hardware Misstatement:** Collateral claiming '32 GB RAM' directly contradicts approved specification (16 GB unified RAM).\n• **Superlative Guarantee:** Phrasing such as '100% bug-free' or 'unbreakable' violates Rule CLM-01 (FTC advertising compliance).\n• **Recommended Correction:** State '16 GB unified RAM with enterprise-grade 99.99% uptime resilience'.";
            citations.push({
              document_id: docIds[0] || "doc_novabook_specs",
              document_name: "NovaBook_X1_Specs.docx",
              page_number: 1,
              excerpt: "Marketing communications must strictly reflect 16 GB RAM baseline and 99.99% uptime SLA.",
              relevance_score: 0.95
            });
          } else if (msgLower.includes("ipad") || msgLower.includes("apple") || msgLower.includes("2029") || msgLower.includes("unrelated") || msgLower.includes("weather")) {
            reply = "I could not find sufficient information in the selected documents to answer this question.";
          } else {
            reply = `Based on the uploaded documentation for NovaBook X1, the verified details state 16 GB unified RAM, 512 GB SSD storage, and a 99.99% enterprise cloud uptime guarantee. All collateral must remain grounded in verified engineering benchmarks.`;
            citations.push({
              document_id: docIds[0] || "doc_novabook_specs",
              document_name: "NovaBook_X1_Specs.docx",
              page_number: 1,
              excerpt: "NovaBook X1 features 16 GB unified RAM and 512 GB SSD storage with 99.99% enterprise SLA uptime guarantee.",
              relevance_score: 0.92
            });
          }

          res.statusCode = 200;
          return res.end(JSON.stringify({
            reply,
            session_id: parsedBody.session_id || `sess_${Date.now()}`,
            citations,
            selected_documents: ["NovaBook_X1_Specs.docx"],
            confidence: citations.length > 0 ? 0.97 : 0.0,
            model_used: "ECLIPSE Grounded RAG (Gemini 3.5)"
          }));
        }

        // 12. Document Comparison (/copilot/compare)
        if (req.url.startsWith("/copilot/compare") || req.url.startsWith("/api/copilot/compare")) {
          res.statusCode = 200;
          return res.end(JSON.stringify({
            summary: "Cross-comparison between NovaBook Specification v1.0 and Marketing Deck v2.4 reveals 1 critical specification conflict regarding system RAM.",
            key_differences: [
              { aspect: "System RAM", description: "Technical spec defines 16 GB unified memory; marketing draft erroneously advertises 32 GB RAM." },
              { aspect: "Uptime SLA", description: "Technical spec verifies 99.99% SLA; marketing draft uses colloquial 'always online' phrasing." }
            ],
            contradictions: [
              {
                claim_or_topic: "RAM Capacity",
                document_a_statement: "16 GB unified RAM (Technical Spec)",
                document_b_statement: "32 GB ultra RAM (Marketing Draft)",
                verdict: "CONTRADICTION: Technical Spec is the authoritative source of truth."
              }
            ],
            citations: [
              { document_id: "doc-1", document_name: "NovaBook_Spec.docx", excerpt: "16 GB unified RAM", relevance_score: 0.99 },
              { document_id: "doc-2", document_name: "Q4_Launch_Deck.pptx", excerpt: "32 GB ultra RAM", relevance_score: 0.95 }
            ]
          }));
        }

        // 13. Universal Documents Management (/documents)
        if (req.url.startsWith("/documents") || req.url.startsWith("/api/documents")) {
          if (req.url.includes("/upload") && req.method === "POST") {
            const docId = `doc_${Date.now()}`;
            res.statusCode = 200;
            return res.end(JSON.stringify({
              document_id: docId,
              filename: "Uploaded_Document.pdf",
              file_type: ".pdf",
              file_size_bytes: 142500,
              total_pages: 3,
              is_scanned: false,
              ocr_applied: false,
              sections_count: 5,
              extracted_preview: "ECLIPSE Enterprise Cloud Governance Architecture and Compliance Specification...",
              status: "indexed",
              message: "Document successfully parsed, text extracted, and indexed in RAG retrieval system."
            }));
          }

          if (req.url.includes("/scan") && req.method === "POST") {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              document_id: "doc_current",
              document_name: "NovaBook_X1_Specs.docx",
              compliance_score: 68,
              total_issues: 2,
              critical_issues: 1,
              warnings: 1,
              verified_claims: 2,
              unsupported_claims: 1,
              findings: [
                {
                  id: "f-1",
                  category: "factual_inaccuracy",
                  severity: "critical",
                  original_text: "32 GB RAM",
                  explanation: "Hardware specification defines standard build as 16 GB unified RAM.",
                  evidence_reference: "Approved Technical Spec v1.0, Sec 3.2",
                  suggested_correction: "16 GB unified RAM",
                  review_status: "flagged"
                },
                {
                  id: "f-2",
                  category: "unsupported_claim",
                  severity: "warning",
                  original_text: "100% bug-free",
                  explanation: "Absolute guarantee cannot be substantiated legally.",
                  evidence_reference: "Rule CLM-01: Prohibited Guarantees",
                  suggested_correction: "enterprise-grade verified high-availability",
                  review_status: "flagged"
                }
              ],
              executive_summary: "ECLIPSE detected 1 critical hardware contradiction (RAM sizing) and 1 prohibited superlative claim requiring remediation prior to publication.",
              reviewed_at: new Date().toISOString()
            }));
          }

          res.statusCode = 200;
          return res.end(JSON.stringify({
            total_documents: 4,
            documents: [
              {
                document_id: "doc-novabook-spec",
                filename: "NovaBook_X1_Specs.docx",
                file_type: ".docx",
                file_size_bytes: 38400,
                total_pages: 2,
                sections_count: 4,
                is_scanned: false,
                ocr_applied: false,
                uploaded_at: new Date().toISOString(),
                status: "indexed"
              },
              {
                document_id: "doc-brand-guidelines",
                filename: "ECLIPSE_Brand_Guidelines_2026.pdf",
                file_type: ".pdf",
                file_size_bytes: 125000,
                total_pages: 12,
                sections_count: 18,
                is_scanned: false,
                ocr_applied: false,
                uploaded_at: new Date(Date.now() - 3600000).toISOString(),
                status: "indexed"
              },
              {
                document_id: "doc-cloud-sla",
                filename: "Enterprise_Cloud_Infrastructure.csv",
                file_type: ".csv",
                file_size_bytes: 14200,
                total_pages: 1,
                sections_count: 8,
                is_scanned: false,
                ocr_applied: false,
                uploaded_at: new Date(Date.now() - 7200000).toISOString(),
                status: "indexed"
              },
              {
                document_id: "doc-launch-deck",
                filename: "Q4_Product_Launch_Deck.pptx",
                file_type: ".pptx",
                file_size_bytes: 84000,
                total_pages: 6,
                sections_count: 6,
                is_scanned: false,
                ocr_applied: false,
                uploaded_at: new Date(Date.now() - 10800000).toISOString(),
                status: "indexed"
              }
            ]
          }));
        }

        // Default Fallback
        res.statusCode = 200;
        return res.end(JSON.stringify({ status: "ok", data: [] }));
      });
    });
  },
});

export default defineConfig({
  base: "./",
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
    strictPort: false,
    allowedHosts: true,
  },
  define: {
    global: "window",
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    "process.env.NEXT_PUBLIC_BACKEND_URL": JSON.stringify(""),
  },
});
