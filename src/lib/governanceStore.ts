import { pool, supabase, query } from "./db";
import { UserRole } from "@/types/auth";
import { hashPassword, comparePassword } from "./auth";

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
  title: string;
  content: string;
  channel: string;
  format: string;
  status: "draft" | "review_pending" | "changes_requested" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
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

// In-Memory fallback store
const fallbackStore = {
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
      replacement: "rapid zero-downtime",
      is_enabled: true,
      created_at: new Date().toISOString(),
    },
  ] as DBRule[],

  drafts: [
    {
      id: "d0000000-0000-0000-0000-000000000001",
      user_id: "11111111-1111-1111-1111-111111111111",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      title: "Q4 Global Product Launch Announcement",
      content: "Inkloom is the market's only 100% foolproof AI automation platform with super crazy fast deployment for global brands.",
      channel: "Blog & Press",
      format: "Rich Article",
      status: "review_pending" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as DBDraft[],

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
    {
      id: "e0000000-0000-0000-0000-000000000002",
      draft_id: "d0000000-0000-0000-0000-000000000001",
      rule_id: "c0000000-0000-0000-0000-000000000002",
      issue: "Informal hyperbole clashes with authoritative enterprise tone.",
      severity: "warning" as const,
      suggestion: "rapid zero-downtime deployment",
      highlight_text: "super crazy fast deployment",
      category: "tone",
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
      entity_type: "organizations",
      entity_id: "a0000000-0000-0000-0000-000000000001",
      details: { tier: "enterprise", name: "Inkloom AI Global" },
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString(),
    },
  ] as DBAuditLog[],
};

export const governanceDB = {
  // Organizations
  async getOrganizations(): Promise<DBOrganization[]> {
    const rows = await query<DBOrganization>("SELECT * FROM organizations ORDER BY created_at DESC;");
    if (rows) return rows;
    return fallbackStore.organizations;
  },

  // Users
  async findUserByEmail(email: string): Promise<DBUser | null> {
    const rows = await query<DBUser>("SELECT * FROM users WHERE email = $1 LIMIT 1;", [email]);
    if (rows && rows.length > 0) return rows[0];
    return fallbackStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
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
    return newUser;
  },

  // Guidelines & Rules
  async getGuidelines(): Promise<DBGuideline[]> {
    const rows = await query<DBGuideline>("SELECT * FROM guidelines ORDER BY created_at DESC;");
    if (rows) return rows;
    return fallbackStore.guidelines;
  },

  async getRules(): Promise<DBRule[]> {
    const rows = await query<DBRule>("SELECT * FROM rules WHERE is_enabled = TRUE ORDER BY created_at ASC;");
    if (rows) return rows;
    return fallbackStore.rules;
  },

  // Drafts
  async getDrafts(userId?: string): Promise<DBDraft[]> {
    if (userId) {
      const rows = await query<DBDraft>("SELECT * FROM drafts WHERE user_id = $1 ORDER BY updated_at DESC;", [userId]);
      if (rows) return rows;
      return fallbackStore.drafts.filter((d) => d.user_id === userId);
    }
    const rows = await query<DBDraft>("SELECT * FROM drafts ORDER BY updated_at DESC;");
    if (rows) return rows;
    return fallbackStore.drafts;
  },

  async getDraftById(id: string): Promise<DBDraft | null> {
    const rows = await query<DBDraft>("SELECT * FROM drafts WHERE id = $1 LIMIT 1;", [id]);
    if (rows && rows.length > 0) return rows[0];
    return fallbackStore.drafts.find((d) => d.id === id) || null;
  },

  async createDraft(draft: Omit<DBDraft, "id" | "created_at" | "updated_at">): Promise<DBDraft> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newDraft: DBDraft = { id, created_at: now, updated_at: now, ...draft };

    if (pool) {
      const res = await query<DBDraft>(
        `INSERT INTO drafts (id, user_id, organization_id, title, content, channel, format, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [id, draft.user_id, draft.organization_id, draft.title, draft.content, draft.channel, draft.format, draft.status]
      );
      if (res && res[0]) return res[0];
    }

    fallbackStore.drafts.unshift(newDraft);
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

    const idx = fallbackStore.drafts.findIndex((d) => d.id === id);
    if (idx !== -1) fallbackStore.drafts[idx] = updated;
    return updated;
  },

  async deleteDraft(id: string): Promise<boolean> {
    if (pool) {
      await query("DELETE FROM drafts WHERE id = $1;", [id]);
      return true;
    }
    const idx = fallbackStore.drafts.findIndex((d) => d.id === id);
    if (idx !== -1) {
      fallbackStore.drafts.splice(idx, 1);
      return true;
    }
    return false;
  },

  // Findings
  async getFindingsByDraft(draftId: string): Promise<DBFinding[]> {
    const rows = await query<DBFinding>("SELECT * FROM findings WHERE draft_id = $1 ORDER BY created_at ASC;", [draftId]);
    if (rows) return rows;
    return fallbackStore.findings.filter((f) => f.draft_id === draftId);
  },

  async createFindings(findings: Omit<DBFinding, "id" | "created_at">[]): Promise<DBFinding[]> {
    const created: DBFinding[] = [];
    for (const f of findings) {
      const id = crypto.randomUUID();
      const item: DBFinding = { id, created_at: new Date().toISOString(), ...f };
      if (pool) {
        const res = await query<DBFinding>(
          `INSERT INTO findings (id, draft_id, rule_id, issue, severity, suggestion, highlight_text, category, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
          [id, f.draft_id, f.rule_id || null, f.issue, f.severity, f.suggestion, f.highlight_text, f.category, f.status]
        );
        if (res && res[0]) {
          created.push(res[0]);
          continue;
        }
      }
      fallbackStore.findings.push(item);
      created.push(item);
    }
    return created;
  },

  // Approvals & Workflow
  async createApproval(approval: Omit<DBApproval, "id" | "timestamp">): Promise<DBApproval> {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const newApproval: DBApproval = { id, timestamp, ...approval };

    if (pool) {
      const res = await query<DBApproval>(
        `INSERT INTO approvals (id, draft_id, approved_by, status, notes)
         VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [id, approval.draft_id, approval.approved_by, approval.status, approval.notes || null]
      );
      if (res && res[0]) return res[0];
    }

    fallbackStore.approvals.unshift(newApproval);
    return newApproval;
  },

  // Comments
  async getComments(draftId: string): Promise<DBComment[]> {
    const rows = await query<DBComment>("SELECT * FROM comments WHERE draft_id = $1 ORDER BY created_at ASC;", [draftId]);
    if (rows) return rows;
    return fallbackStore.comments.filter((c) => c.draft_id === draftId);
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
    return newComment;
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
    return newLog;
  },

  async getAuditLogs(limit = 50): Promise<DBAuditLog[]> {
    const rows = await query<DBAuditLog>("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1;", [limit]);
    if (rows) return rows;
    return fallbackStore.audit_logs.slice(0, limit);
  },
};
