import { pool, supabase, query } from "./db";
import { UserRole } from "@/types/auth";
import fs from "fs";
import path from "path";

export interface DBOrganization {
  id: string;
  name: string;
  industry: string;
  branding_settings: any;
  created_at: string;
}

export interface DBUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  organization_id: string;
  department: string;
  avatar_url?: string;
  created_at: string;
}

export interface DBGuideline {
  id: string;
  organization_id: string;
  title: string;
  content: string;
  version: string;
  created_at: string;
}

export interface DBRule {
  id: string;
  guideline_id: string;
  rule_type: "tone" | "terminology" | "logo" | "accessibility" | "compliance" | "claim";
  name: string;
  description: string;
  severity: "info" | "warning" | "critical";
  pattern: string;
  replacement: string;
  is_enabled: boolean;
  created_at: string;
}

export interface DBDraft {
  id: string;
  user_id: string;
  organization_id: string;
  brand?: string;
  author?: string;
  title: string;
  content: string;
  channel: string;
  format: string;
  status: "draft" | "review_pending" | "changes_requested" | "approved" | "rejected";
  driftScore?: number;
  wordCount?: number;
  commentsCount?: number;
  reviewerNotes?: string;
  created_at: string;
  updated_at: string;
}

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

export interface DBFinding {
  id: string;
  draft_id: string;
  rule_id?: string;
  issue: string;
  severity: "info" | "warning" | "critical";
  suggestion: string;
  highlight_text: string;
  category: string;
  status: "pending" | "applied" | "dismissed";
  created_at: string;
}

export interface DBComment {
  id: string;
  draft_id: string;
  reviewer_id: string;
  comment: string;
  created_at: string;
}

export interface DBApproval {
  id: string;
  draft_id: string;
  approved_by: string;
  status: "submitted" | "approved" | "rejected" | "changes_requested";
  notes?: string;
  timestamp: string;
}

export interface DBAuditLog {
  id: string;
  organization_id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: any;
  ip_address?: string;
  created_at: string;
}

// Disk persistence path for live database store
const STORE_PATH = path.join(process.cwd(), "database", "live_store.json");

export const INITIAL_BRAND_RULEBOOKS: BrandRulebook[] = [
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

// Default initial database content
const DEFAULT_STORE = {
  organizations: [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      name: "Inkloom AI Enterprises",
      industry: "Enterprise AI & Cloud Governance",
      branding_settings: {
        primary_color: "#2563EB",
        font_family: "Inter",
        tone_preference: "professional",
      },
      created_at: new Date().toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000002",
      name: "LoomCraft Studio",
      industry: "Digital Creative Agency",
      branding_settings: {
        primary_color: "#8B5CF6",
        font_family: "Plus Jakarta Sans",
        tone_preference: "playful",
      },
      created_at: new Date().toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000003",
      name: "PulseFin Global",
      industry: "Banking & Financial Services",
      branding_settings: {
        primary_color: "#059669",
        font_family: "Roboto Mono",
        tone_preference: "conservative",
      },
      created_at: new Date().toISOString(),
    },
  ] as DBOrganization[],

  users: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      name: "Alex Morgan",
      email: "alex.creator@inkloom.ai",
      password: "$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO",
      role: "creator" as UserRole,
      department: "Content & Growth Marketing",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      created_at: new Date().toISOString(),
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      name: "Sarah Chen",
      email: "sarah.brand@inkloom.ai",
      password: "$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO",
      role: "brand-manager" as UserRole,
      department: "Global Brand & Governance",
      avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      created_at: new Date().toISOString(),
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      name: "Marcus Vance",
      email: "marcus.admin@inkloom.ai",
      password: "$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO",
      role: "admin" as UserRole,
      department: "System Architecture & Compliance",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      created_at: new Date().toISOString(),
    },
  ] as DBUser[],

  guidelines: [
    {
      id: "b0000000-0000-0000-0000-000000000001",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      title: "Inkloom Global Brand & Voice Guidelines",
      content: "Standards for claims, tone of voice, visual margins, and WCAG AA accessibility.",
      version: "2.4.0",
      created_at: new Date().toISOString(),
    },
    {
      id: "b0000000-0000-0000-0000-000000000002",
      organization_id: "a0000000-0000-0000-0000-000000000002",
      title: "LoomCraft Studio Creative Guidelines",
      content: "High-energy social campaigns, viral short-form copy, and vibrant graphics.",
      version: "1.2.0",
      created_at: new Date().toISOString(),
    },
    {
      id: "b0000000-0000-0000-0000-000000000003",
      organization_id: "a0000000-0000-0000-0000-000000000003",
      title: "PulseFin Regulatory & Statutory Rulebook",
      content: "SEC, FINRA, and global banking compliance for financial collateral.",
      version: "3.1.0",
      created_at: new Date().toISOString(),
    },
  ] as DBGuideline[],

  rules: [
    {
      id: "c0000000-0000-0000-0000-000000000001",
      guideline_id: "b0000000-0000-0000-0000-000000000001",
      rule_type: "claim" as const,
      name: "Prohibited Superlative Claims",
      description: "Absolute superlative claims cannot be validated under FTC advertising guidelines.",
      severity: "critical" as const,
      pattern: "100% foolproof",
      replacement: "enterprise-grade AI automation with verified high-availability",
      is_enabled: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "c0000000-0000-0000-0000-000000000002",
      guideline_id: "b0000000-0000-0000-0000-000000000001",
      rule_type: "tone" as const,
      name: "Tone Matrix: Casual Hyperbole",
      description: "Informal hyperbole clashes with authoritative enterprise tone.",
      severity: "warning" as const,
      pattern: "super crazy fast",
      replacement: "rapid zero-downtime deployment",
      is_enabled: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "c0000000-0000-0000-0000-000000000003",
      guideline_id: "b0000000-0000-0000-0000-000000000002",
      rule_type: "tone" as const,
      name: "Ban Monotonous Corporate Jargon",
      description: "Stiff corporate jargon kills creative engagement on modern social media.",
      severity: "warning" as const,
      pattern: "synergistic paradigm shift",
      replacement: "fresh creative momentum",
      is_enabled: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "c0000000-0000-0000-0000-000000000004",
      guideline_id: "b0000000-0000-0000-0000-000000000003",
      rule_type: "claim" as const,
      name: "SEC/FINRA: No Guaranteed Returns",
      description: "Promising specific return percentages is illegal under financial advertising laws.",
      severity: "critical" as const,
      pattern: "guaranteed 500% ROI",
      replacement: "projected historical yield based on audited backtesting",
      is_enabled: true,
      created_at: new Date().toISOString(),
    },
  ] as DBRule[],

  drafts: [
    {
      id: "draft-001",
      user_id: "11111111-1111-1111-1111-111111111111",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      brand: "Inkloom AI Enterprises",
      title: "Q4 Global Product Launch Announcement",
      content: "Inkloom is the market's only 100% foolproof AI automation platform with super crazy fast deployment for global brands.",
      channel: "Blog & Press",
      format: "text",
      status: "review_pending" as const,
      author: "Alex Morgan",
      driftScore: 78,
      wordCount: 18,
      commentsCount: 2,
      reviewerNotes: "Sarah Chen: Please fix the 100% foolproof claim before we release to press wire.",
      created_at: new Date(Date.now() - 600000).toISOString(),
      updated_at: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: "draft-002",
      user_id: "11111111-1111-1111-1111-111111111111",
      organization_id: "a0000000-0000-0000-0000-000000000002",
      brand: "LoomCraft Studio",
      title: "Instagram Story Creative Carousel - Fall Promo",
      content: "Transform your visual branding with automated AI precision and instant multi-channel governance.",
      channel: "Instagram / Meta",
      format: "graphic",
      status: "changes_requested" as const,
      author: "Growth Agency Partner",
      driftScore: 45,
      wordCount: 14,
      commentsCount: 1,
      reviewerNotes: "Slide 2 font contrast fails WCAG 2.1 AA (2.4:1). Change font color to #0F172A.",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "draft-003",
      user_id: "11111111-1111-1111-1111-111111111111",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      brand: "Inkloom AI Enterprises",
      title: "Enterprise Security & SOC2 Compliance Whitepaper",
      content: "Inkloom delivers enterprise-grade AI brand governance with verified high-availability and zero data retention for regulated enterprises.",
      channel: "Whitepaper (PDF)",
      format: "text",
      status: "approved" as const,
      author: "Alex Morgan",
      driftScore: 0,
      wordCount: 24,
      commentsCount: 0,
      reviewerNotes: "Fully compliant with SOC2 disclosure standards. Ready to publish.",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "draft-004",
      user_id: "11111111-1111-1111-1111-111111111111",
      organization_id: "a0000000-0000-0000-0000-000000000003",
      brand: "PulseFin Global",
      title: "PulseFin Q3 Earnings & Security Advisory",
      content: "Our algorithmic portfolio optimization delivers verified risk-adjusted yield based on audited historical benchmarks. Past performance does not guarantee future results.",
      channel: "Customer Advisory",
      format: "text",
      status: "draft" as const,
      author: "Alex Morgan",
      driftScore: 12,
      wordCount: 22,
      commentsCount: 0,
      reviewerNotes: "",
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 259200000).toISOString(),
    },
  ] as DBDraft[],

  rulebooks: INITIAL_BRAND_RULEBOOKS as BrandRulebook[],

  findings: [
    {
      id: "e0000000-0000-0000-0000-000000000001",
      draft_id: "d0000000-0000-0000-0000-000000000001",
      rule_id: "c0000000-0000-0000-0000-000000000001",
      issue: "Absolute superlative guarantee not permitted under advertising compliance.",
      severity: "critical" as const,
      suggestion: "enterprise-grade AI automation with verified high-availability",
      highlight_text: "100% foolproof AI automation",
      category: "claim",
      status: "pending" as const,
      created_at: new Date().toISOString(),
    },
  ] as DBFinding[],

  comments: [
    {
      id: "f0000000-0000-0000-0000-000000000001",
      draft_id: "d0000000-0000-0000-0000-000000000001",
      reviewer_id: "22222222-2222-2222-2222-222222222222",
      comment: "Please apply the AI suggestion on the superlative claim before we issue final sign-off.",
      created_at: new Date().toISOString(),
    },
  ] as DBComment[],

  approvals: [
    {
      id: "90000000-0000-0000-0000-000000000001",
      draft_id: "d0000000-0000-0000-0000-000000000001",
      approved_by: "11111111-1111-1111-1111-111111111111",
      status: "submitted" as const,
      notes: "Submitted draft for pre-publication governance sign-off.",
      timestamp: new Date().toISOString(),
    },
  ] as DBApproval[],

  audit_logs: [
    {
      id: "80000000-0000-0000-0000-000000000001",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      user_id: "33333333-3333-3333-3333-333333333333",
      action: "ORGANIZATION_INITIALIZE",
      entity_type: "organization",
      entity_id: "a0000000-0000-0000-0000-000000000001",
      details: { name: "Inkloom AI Enterprises" },
      created_at: new Date().toISOString(),
    },
  ] as DBAuditLog[],
};

// Initialize from disk or default
function initStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = (fs.readFileSync(STORE_PATH, "utf-8") || "").trim();
      if (!raw) return { ...DEFAULT_STORE, rulebooks: INITIAL_BRAND_RULEBOOKS };
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.drafts) && Array.isArray(parsed.rules)) {
        if (!parsed.rulebooks || !Array.isArray(parsed.rulebooks) || parsed.rulebooks.length === 0) {
          parsed.rulebooks = INITIAL_BRAND_RULEBOOKS;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[LiveDB] Using defaults, error reading disk store:", err);
  }
  return { ...DEFAULT_STORE, rulebooks: INITIAL_BRAND_RULEBOOKS };
}

const fallbackStore = initStore();

function persistStore() {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = STORE_PATH + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(fallbackStore, null, 2), "utf-8");
    if (fs.existsSync(tmp)) fs.renameSync(tmp, STORE_PATH);
  } catch (err) {
    console.warn("[LiveDB] Failed to persist to disk:", err);
  }
}

// Initial sync to disk
persistStore();

export const governanceDB = {
  // Organizations (Brands)
  async getOrganizations(): Promise<DBOrganization[]> {
    const rows = await query<DBOrganization>("SELECT * FROM organizations ORDER BY created_at DESC;");
    if (rows) return rows;
    return fallbackStore.organizations;
  },

  async createOrganization(name: string, industry: string, branding: any): Promise<DBOrganization> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newOrg: DBOrganization = { id, name, industry, branding_settings: branding, created_at };

    if (pool) {
      await query(
        `INSERT INTO organizations (id, name, industry, branding_settings, created_at)
         VALUES ($1, $2, $3, $4, $5);`,
        [id, name, industry, JSON.stringify(branding), created_at]
      );
    }

    fallbackStore.organizations.unshift(newOrg);
    persistStore();
    return newOrg;
  },

  // Users
  async findUserByEmail(email: string): Promise<DBUser | null> {
    const rows = await query<DBUser>("SELECT * FROM users WHERE email = $1 LIMIT 1;", [email]);
    if (rows && rows.length > 0) return rows[0];
    return fallbackStore.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(user: Omit<DBUser, "id" | "created_at">): Promise<DBUser> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newUser: DBUser = { id, created_at, ...user };

    if (pool) {
      const res = await query<DBUser>(
        `INSERT INTO users (id, organization_id, name, email, password, role, department, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [id, user.organization_id, user.name, user.email, user.password, user.role, user.department, user.avatar_url]
      );
      if (res && res[0]) return res[0];
    }

    fallbackStore.users.push(newUser);
    persistStore();
    return newUser;
  },

  // Guidelines & Rules
  async getGuidelines(): Promise<DBGuideline[]> {
    const rows = await query<DBGuideline>("SELECT * FROM guidelines ORDER BY created_at DESC;");
    if (rows) return rows;
    return fallbackStore.guidelines;
  },

  async createGuideline(guideline: Omit<DBGuideline, "id" | "created_at">): Promise<DBGuideline> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newGuideline: DBGuideline = { id, created_at, ...guideline };

    if (pool) {
      await query(
        `INSERT INTO guidelines (id, organization_id, title, content, version, created_at)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [id, guideline.organization_id, guideline.title, guideline.content, guideline.version, created_at]
      );
    }

    fallbackStore.guidelines.unshift(newGuideline);
    persistStore();
    return newGuideline;
  },

  async getRules(): Promise<DBRule[]> {
    const rows = await query<DBRule>("SELECT * FROM rules ORDER BY created_at ASC;");
    if (rows) return rows;
    return fallbackStore.rules;
  },

  async createRule(rule: Omit<DBRule, "id" | "created_at">): Promise<DBRule> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newRule: DBRule = { id, created_at, ...rule };

    if (pool) {
      const res = await query<DBRule>(
        `INSERT INTO rules (id, guideline_id, rule_type, name, description, severity, pattern, replacement, is_enabled)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
        [id, rule.guideline_id, rule.rule_type, rule.name, rule.description, rule.severity, rule.pattern, rule.replacement, rule.is_enabled]
      );
      if (res && res[0]) return res[0];
    }

    fallbackStore.rules.unshift(newRule);
    persistStore();
    return newRule;
  },

  async toggleRule(id: string): Promise<DBRule | null> {
    const rule = fallbackStore.rules.find((r: any) => r.id === id);
    if (!rule) return null;
    rule.is_enabled = !rule.is_enabled;

    if (pool) {
      await query("UPDATE rules SET is_enabled = $1 WHERE id = $2;", [rule.is_enabled, id]);
    }

    persistStore();
    return rule;
  },

  async deleteRule(id: string): Promise<boolean> {
    if (pool) {
      await query("DELETE FROM rules WHERE id = $1;", [id]);
    }
    const idx = fallbackStore.rules.findIndex((r: any) => r.id === id);
    if (idx !== -1) {
      fallbackStore.rules.splice(idx, 1);
      persistStore();
      return true;
    }
    return false;
  },

  // Drafts
  async getDrafts(userId?: string): Promise<DBDraft[]> {
    if (userId) {
      const rows = await query<DBDraft>("SELECT * FROM drafts WHERE user_id = $1 ORDER BY updated_at DESC;", [userId]);
      if (rows) return rows;
      return fallbackStore.drafts.filter((d: any) => d.user_id === userId);
    }
    const rows = await query<DBDraft>("SELECT * FROM drafts ORDER BY updated_at DESC;");
    if (rows) return rows;
    return fallbackStore.drafts;
  },

  async getDraftById(id: string): Promise<DBDraft | null> {
    const rows = await query<DBDraft>("SELECT * FROM drafts WHERE id = $1 LIMIT 1;", [id]);
    if (rows && rows.length > 0) return rows[0];
    return fallbackStore.drafts.find((d: any) => d.id === id) || null;
  },

  async createDraft(draft: Omit<DBDraft, "id" | "created_at" | "updated_at">): Promise<DBDraft> {
    const id = `draft-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();
    const newDraft: DBDraft = {
      id,
      created_at: now,
      updated_at: now,
      driftScore: draft.driftScore ?? 0,
      wordCount: draft.wordCount ?? (draft.content ? draft.content.trim().split(/\s+/).length : 0),
      commentsCount: draft.commentsCount ?? 0,
      author: draft.author ?? "Alex Morgan",
      brand: draft.brand ?? "Inkloom AI Enterprises",
      ...draft,
    };

    if (pool) {
      const res = await query<DBDraft>(
        `INSERT INTO drafts (id, user_id, organization_id, title, content, channel, format, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [id, newDraft.user_id, newDraft.organization_id, newDraft.title, newDraft.content, newDraft.channel, newDraft.format, newDraft.status]
      );
      if (res && res[0]) return res[0];
    }

    fallbackStore.drafts.unshift(newDraft);
    persistStore();
    return newDraft;
  },

  async updateDraft(id: string, updates: Partial<DBDraft>): Promise<DBDraft | null> {
    const draft = await this.getDraftById(id);
    if (!draft) return null;

    const updated = { ...draft, ...updates, updated_at: new Date().toISOString() };

    if (pool) {
      const res = await query<DBDraft>(
        `UPDATE drafts SET title = $1, content = $2, status = $3, updated_at = NOW() WHERE id = $4 RETURNING *;`,
        [updated.title, updated.content, updated.status, id]
      );
      if (res && res[0]) return res[0];
    }

    const idx = fallbackStore.drafts.findIndex((d: any) => d.id === id);
    if (idx !== -1) fallbackStore.drafts[idx] = updated;
    persistStore();
    return updated;
  },

  async deleteDraft(id: string): Promise<boolean> {
    if (pool) {
      await query("DELETE FROM drafts WHERE id = $1;", [id]);
    }
    const idx = fallbackStore.drafts.findIndex((d: any) => d.id === id);
    if (idx !== -1) {
      fallbackStore.drafts.splice(idx, 1);
      persistStore();
      return true;
    }
    return false;
  },

  // Findings
  async getFindingsByDraft(draftId: string): Promise<DBFinding[]> {
    const rows = await query<DBFinding>("SELECT * FROM findings WHERE draft_id = $1;", [draftId]);
    if (rows) return rows;
    return fallbackStore.findings.filter((f: any) => f.draft_id === draftId);
  },

  async createFinding(finding: Omit<DBFinding, "id" | "created_at">): Promise<DBFinding> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newFinding: DBFinding = { id, created_at, ...finding };

    if (pool) {
      const res = await query<DBFinding>(
        `INSERT INTO findings (id, draft_id, rule_id, issue, severity, suggestion, highlight_text, category, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
        [id, finding.draft_id, finding.rule_id || null, finding.issue, finding.severity, finding.suggestion, finding.highlight_text, finding.category, finding.status]
      );
      if (res && res[0]) return res[0];
    }

    fallbackStore.findings.push(newFinding);
    persistStore();
    return newFinding;
  },

  async createFindings(findings: Array<Omit<DBFinding, "id" | "created_at">>): Promise<DBFinding[]> {
    const results: DBFinding[] = [];
    for (const f of findings) {
      const created = await this.createFinding(f);
      results.push(created);
    }
    return results;
  },

  // Comments
  async getComments(draftId: string): Promise<DBComment[]> {
    const rows = await query<DBComment>("SELECT * FROM comments WHERE draft_id = $1 ORDER BY created_at ASC;", [draftId]);
    if (rows) return rows;
    return fallbackStore.comments.filter((c: any) => c.draft_id === draftId);
  },

  async addComment(comment: Omit<DBComment, "id" | "created_at">): Promise<DBComment> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newComment: DBComment = { id, created_at, ...comment };

    if (pool) {
      const res = await query<DBComment>(
        `INSERT INTO comments (id, draft_id, reviewer_id, comment)
         VALUES ($1, $2, $3, $4) RETURNING *;`,
        [id, comment.draft_id, comment.reviewer_id, comment.comment]
      );
      if (res && res[0]) return res[0];
    }

    fallbackStore.comments.push(newComment);
    persistStore();
    return newComment;
  },

  // Approvals
  async getApprovalsByDraft(draftId: string): Promise<DBApproval[]> {
    const rows = await query<DBApproval>("SELECT * FROM approvals WHERE draft_id = $1 ORDER BY timestamp DESC;", [draftId]);
    if (rows) return rows;
    return fallbackStore.approvals.filter((a: any) => a.draft_id === draftId);
  },

  async recordApproval(approval: Omit<DBApproval, "id" | "timestamp">): Promise<DBApproval> {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const newApproval: DBApproval = { id, timestamp, ...approval };

    if (pool) {
      await query(
        `INSERT INTO approvals (id, draft_id, approved_by, status, notes, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [id, approval.draft_id, approval.approved_by, approval.status, approval.notes || null, timestamp]
      );
    }

    fallbackStore.approvals.unshift(newApproval);
    persistStore();
    return newApproval;
  },

  async createApproval(approval: Omit<DBApproval, "id" | "timestamp">): Promise<DBApproval> {
    return this.recordApproval(approval);
  },

  // Multi-Brand Rulebooks Live Database Methods
  async getRulebooks(): Promise<BrandRulebook[]> {
    if (!fallbackStore.rulebooks || !Array.isArray(fallbackStore.rulebooks) || fallbackStore.rulebooks.length === 0) {
      fallbackStore.rulebooks = [...INITIAL_BRAND_RULEBOOKS];
      persistStore();
    }
    return fallbackStore.rulebooks;
  },

  async createBrandRulebook(brand: BrandRulebook): Promise<BrandRulebook> {
    const rulebooks = await this.getRulebooks();
    rulebooks.push(brand);
    persistStore();
    return brand;
  },

  async addRuleToBrand(brandId: string, rule: RuleItem): Promise<RuleItem | null> {
    const rulebooks = await this.getRulebooks();
    const brand = rulebooks.find((b: any) => b.id === brandId);
    if (!brand) return null;
    brand.rules.unshift(rule);
    persistStore();
    return rule;
  },

  async toggleBrandRule(brandId: string, ruleId: string): Promise<RuleItem | null> {
    const rulebooks = await this.getRulebooks();
    const brand = rulebooks.find((b: any) => b.id === brandId);
    if (!brand) return null;
    const rule = brand.rules.find((r: any) => r.id === ruleId);
    if (!rule) return null;
    rule.isEnabled = !rule.isEnabled;
    persistStore();
    return rule;
  },

  async deleteBrandRule(brandId: string, ruleId: string): Promise<boolean> {
    const rulebooks = await this.getRulebooks();
    const brand = rulebooks.find((b: any) => b.id === brandId);
    if (!brand) return false;
    const idx = brand.rules.findIndex((r: any) => r.id === ruleId);
    if (idx !== -1) {
      brand.rules.splice(idx, 1);
      persistStore();
      return true;
    }
    return false;
  },

  // Audit Logs
  async logAction(log: Omit<DBAuditLog, "id" | "created_at">): Promise<DBAuditLog> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newLog: DBAuditLog = { id, created_at, ...log };

    if (pool) {
      try {
        await query(
          `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [id, log.organization_id, log.user_id || null, log.action, log.entity_type, log.entity_id || null, JSON.stringify(log.details || {}), log.ip_address || "127.0.0.1"]
        );
      } catch (e) {
        console.error("Audit log error:", e);
      }
    }

    fallbackStore.audit_logs.unshift(newLog);
    persistStore();
    return newLog;
  },

  async getAuditLogs(limit = 50): Promise<DBAuditLog[]> {
    const rows = await query<DBAuditLog>("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1;", [limit]);
    if (rows) return rows;
    return fallbackStore.audit_logs.slice(0, limit);
  },
};
