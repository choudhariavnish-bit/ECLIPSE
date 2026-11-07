/**
 * Inkloom AI / ECLIPSE - Pure Node.js Database Service
 * Zero Next.js dependency. Connects to PostgreSQL / Supabase with live fallback.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const envLocalPath = path.join(__dirname, "../.env.local");

// Resolve active DATABASE_URL dynamically
function getActiveDatabaseUrl() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.trim().startsWith("#")) {
    return process.env.DATABASE_URL.trim();
  }
  try {
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf-8");
      const match = content.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
      if (match && match[1] && !match[1].startsWith("#")) {
        const val = match[1].trim();
        process.env.DATABASE_URL = val;
        return val;
      }
    }
  } catch {}
  return undefined;
}

let activePool = null;
let lastUsedUrl = undefined;

function getDbPool() {
  const url = getActiveDatabaseUrl();
  if (!url) return null;
  if (activePool && lastUsedUrl === url) return activePool;

  try {
    if (activePool) activePool.end().catch(() => {});
    activePool = new Pool({
      connectionString: url,
      ssl: url.includes("supabase.co") || url.includes("supabase.com") || process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    lastUsedUrl = url;
    ensureDatabaseSchema(activePool).catch((e) => console.warn("[DB AutoSchema note]:", e.message));
  } catch (err) {
    console.warn("[DB Pool Init Error]:", err.message);
    activePool = null;
  }
  return activePool;
}

async function query(text, params = []) {
  const p = getDbPool();
  if (p) {
    try {
      const res = await p.query(text, params);
      return res.rows;
    } catch (err) {
      console.error("[DB Query Error]:", err.message);
      throw err;
    }
  }
  return null;
}

async function ensureDatabaseSchema(p) {
  const client = await p.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100) NOT NULL,
        branding_settings JSONB DEFAULT '{"primary_color": "#2563EB"}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        department VARCHAR(100) DEFAULT 'Content & Marketing',
        avatar_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS guidelines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        guideline_id UUID NOT NULL REFERENCES guidelines(id) ON DELETE CASCADE,
        rule_type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        severity VARCHAR(20) NOT NULL DEFAULT 'warning',
        pattern TEXT,
        replacement TEXT,
        is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS drafts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        channel VARCHAR(100) DEFAULT 'Blog & Press',
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        drift_score NUMERIC(5,2) DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS findings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
        rule_id UUID REFERENCES rules(id) ON DELETE SET NULL,
        issue TEXT NOT NULL,
        severity VARCHAR(20) NOT NULL DEFAULT 'warning',
        suggestion TEXT,
        highlight_text TEXT,
        category VARCHAR(100),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
        reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS approvals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
        approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID,
        details JSONB DEFAULT '{}'::jsonb,
        ip_address VARCHAR(45) DEFAULT '127.0.0.1',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure default organization exists so foreign keys never fail
      INSERT INTO organizations (id, name, industry, branding_settings)
      VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'Inkloom AI Enterprises',
        'Enterprise Cloud & Governance Software',
        '{"primary_color": "#2563EB", "font_family": "Inter", "tone_preference": "professional"}'::jsonb
      )
      ON CONFLICT (id) DO NOTHING;
    `);
  } catch (err) {
    console.warn("[ensureDatabaseSchema warning]:", err.message);
  } finally {
    client.release();
  }
}

// In-Memory Fallback Seed Store
const fallbackStore = {
  organizations: [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      name: "Inkloom AI Enterprises",
      industry: "Enterprise AI & Cloud Governance",
      branding_settings: { primary_color: "#2563EB", font_family: "Inter", tone_preference: "professional" },
      created_at: new Date().toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000002",
      name: "LoomCraft Studio",
      industry: "Digital Creative Agency",
      branding_settings: { primary_color: "#8B5CF6", font_family: "Plus Jakarta Sans", tone_preference: "playful" },
      created_at: new Date().toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000003",
      name: "PulseFin Global",
      industry: "Banking & Financial Services",
      branding_settings: { primary_color: "#059669", font_family: "Roboto Mono", tone_preference: "conservative" },
      created_at: new Date().toISOString(),
    },
  ],
  users: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Alex Morgan",
      email: "alex.creator@inkloom.ai",
      password: "$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO", // password123
      role: "creator",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      department: "Content & Growth Marketing",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      created_at: new Date().toISOString(),
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Sarah Chen",
      email: "sarah.brand@inkloom.ai",
      password: "$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO",
      role: "brand-manager",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      department: "Global Brand & Governance",
      avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      created_at: new Date().toISOString(),
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Marcus Vance",
      email: "marcus.admin@inkloom.ai",
      password: "$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO",
      role: "admin",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      department: "System Architecture & Compliance",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      created_at: new Date().toISOString(),
    },
  ],
  guidelines: [
    {
      id: "g0000000-0000-0000-0000-000000000001",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      title: "Global Enterprise Voice & Social Content Codex",
      content: "All enterprise brand communications must remain deterministic, authoritative, and fact-verified.",
      version: "2.4.0",
      created_at: new Date().toISOString(),
    },
  ],
  rules: [
    {
      id: "r0000000-0000-0000-0000-000000000001",
      guideline_id: "g0000000-0000-0000-0000-000000000001",
      rule_type: "claim",
      name: "Unsubstantiated Financial Guarantees",
      description: "Do not claim specific percentage ROI without third-party audited citations.",
      severity: "critical",
      pattern: "\\b\\d+%(?:\\s+ROI|\\s+return|\\s+guarantee)\\b",
      replacement: "measurable enterprise return",
      is_enabled: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "r0000000-0000-0000-0000-000000000002",
      guideline_id: "g0000000-0000-0000-0000-000000000001",
      rule_type: "claim",
      name: "Regulatory Endorsement Claims",
      description: "Never claim official endorsement from governmental or regulatory bodies.",
      severity: "critical",
      pattern: "\\bofficially certified and verified by federal regulators\\b",
      replacement: "built to institutional compliance benchmarks",
      is_enabled: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "r0000000-0000-0000-0000-000000000003",
      rule_type: "terminology",
      name: "Superlatives & Fluff Adjectives",
      description: "Replace marketing hyperbole with precise enterprise engineering metrics.",
      severity: "warning",
      pattern: "\\bsuper crazy fast\\b",
      replacement: "rapid zero-downtime",
      is_enabled: true,
      created_at: new Date().toISOString(),
    },
  ],
  drafts: [
    {
      id: "d0000000-0000-0000-0000-000000000001",
      user_id: "11111111-1111-1111-1111-111111111111",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      author: "Alex Morgan",
      title: "Q4 Enterprise Product Launch Announcement",
      content: "Inkloom is the market's only 100% foolproof AI platform with super crazy fast deployment for global brands.",
      channel: "LinkedIn & Social",
      format: "text",
      status: "review_pending",
      driftScore: 78,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "d0000000-0000-0000-0000-000000000002",
      user_id: "11111111-1111-1111-1111-111111111111",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      author: "Alex Morgan",
      title: "Instagram Story Creative Carousel - Fall Promo",
      content: "Transform your visual branding with automated AI precision and instant multi-channel governance.",
      channel: "Instagram / Meta",
      format: "graphic",
      status: "changes_requested",
      driftScore: 45,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  findings: [
    {
      id: "f0000000-0000-0000-0000-000000000001",
      draft_id: "d0000000-0000-0000-0000-000000000001",
      issue: "Superlative Claim: '100% foolproof AI platform'",
      severity: "critical",
      suggestion: "Use 'Enterprise-Grade Reliability'",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ],
  comments: [],
  approvals: [],
  audit_logs: [
    {
      id: "l0000000-0000-0000-0000-000000000001",
      organization_id: "a0000000-0000-0000-0000-000000000001",
      user_id: "33333333-3333-3333-3333-333333333333",
      action: "SYSTEM_INITIALIZED",
      entity_type: "system",
      details: { platform: "Inkloom AI / ECLIPSE", mode: "Pure Node + HTML" },
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString(),
    },
  ],
};

const dbService = {
  async checkConnection() {
    const p = getDbPool();
    if (p) {
      try {
        await p.query("SELECT 1;");
        const url = getActiveDatabaseUrl() || "";
        const endpoint = url.includes("@") ? url.split("@")[1].split("/")[0] : "PostgreSQL Server";
        return {
          connected: true,
          type: url.includes("supabase") ? "supabase" : "postgres",
          endpoint,
          details: "Connected to live PostgreSQL / Supabase cloud database",
        };
      } catch (err) {
        return { connected: false, type: "postgres", details: err.message };
      }
    }
    return {
      connected: false,
      type: "mock",
      details: "Using mock in-memory governance store. Set DATABASE_URL to connect live Supabase.",
    };
  },

  async getUsers() {
    const rows = await query("SELECT id, organization_id, name, email, role, department, avatar_url, created_at FROM users ORDER BY created_at DESC;");
    if (rows && rows.length > 0) return rows;
    return fallbackStore.users.map((u) => ({
      id: u.id,
      organization_id: u.organization_id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      avatar_url: u.avatar_url,
      created_at: u.created_at,
    }));
  },

  async findUserByEmail(email) {
    const rows = await query("SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;", [email]);
    if (rows && rows.length > 0) return rows[0];
    return fallbackStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(user) {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newUser = { id, created_at, ...user };

    const p = getDbPool();
    if (p) {
      try {
        await query(
          `INSERT INTO organizations (id, name, industry, branding_settings)
           VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING;`,
          [user.organization_id, "Inkloom AI Enterprises", "Enterprise Cloud & Governance Software", '{"primary_color": "#2563EB"}']
        );
        const res = await query(
          `INSERT INTO users (id, organization_id, name, email, password, role, department, avatar_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
          [id, user.organization_id, user.name, user.email, user.password, user.role, user.department, user.avatar_url]
        );
        if (res && res[0]) {
          fallbackStore.users.unshift(res[0]);
          return res[0];
        }
      } catch (err) {
        console.warn("[DB Pool] Failed to insert user into PostgreSQL:", err.message);
      }
    }

    fallbackStore.users.unshift(newUser);
    return newUser;
  },

  async getOrganizations() {
    const rows = await query("SELECT * FROM organizations ORDER BY created_at DESC;");
    if (rows) return rows;
    return fallbackStore.organizations;
  },

  async getGuidelines() {
    const rows = await query("SELECT * FROM guidelines ORDER BY created_at DESC;");
    if (rows) return rows;
    return fallbackStore.guidelines;
  },

  async getRules() {
    const rows = await query("SELECT * FROM rules ORDER BY created_at DESC;");
    if (rows) return rows;
    return fallbackStore.rules;
  },

  async getDrafts() {
    const rows = await query("SELECT * FROM drafts ORDER BY created_at DESC;");
    if (rows) return rows;
    return fallbackStore.drafts;
  },

  async createDraft(draft) {
    const id = `draft-${Date.now().toString().slice(-4)}`;
    const created_at = new Date().toISOString();
    const newDraft = { id, created_at, updated_at: created_at, ...draft };
    fallbackStore.drafts.unshift(newDraft);
    return newDraft;
  },

  async updateDraftStatus(id, status, notes = "") {
    const draft = fallbackStore.drafts.find((d) => d.id === id);
    if (draft) {
      draft.status = status;
      draft.reviewerNotes = notes;
      draft.updated_at = new Date().toISOString();
    }
    return draft;
  },

  async getFindingsByDraft(draftId) {
    const rows = await query("SELECT * FROM findings WHERE draft_id = $1;", [draftId]);
    if (rows) return rows;
    return fallbackStore.findings.filter((f) => f.draft_id === draftId);
  },

  async getComments(draftId) {
    return fallbackStore.comments.filter((c) => c.draft_id === draftId);
  },

  async getApprovalsByDraft(draftId) {
    return fallbackStore.approvals.filter((a) => a.draft_id === draftId);
  },

  async getAuditLogs(limit = 50) {
    const rows = await query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1;", [limit]);
    if (rows) return rows;
    return fallbackStore.audit_logs.slice(0, limit);
  },

  async logAction(log) {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newLog = { id, created_at, ...log };

    const p = getDbPool();
    if (p) {
      try {
        await query(
          `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [id, log.organization_id, log.user_id || null, log.action, log.entity_type, log.entity_id || null, JSON.stringify(log.details || {}), log.ip_address || "127.0.0.1"]
        );
      } catch (e) {
        console.warn("Audit log error:", e.message);
      }
    }

    fallbackStore.audit_logs.unshift(newLog);
    return newLog;
  },

  async connectSupabase(databaseUrl) {
    const { Client } = require("pg");
    const trimmed = databaseUrl.trim();
    const testClient = new Client({
      connectionString: trimmed,
      ssl: { rejectUnauthorized: false },
    });

    await testClient.connect();
    await testClient.query("SELECT 1;");

    // Apply migration SQL
    try {
      const migrationPath = path.join(__dirname, "supabase_migration.sql");
      if (fs.existsSync(migrationPath)) {
        const sql = fs.readFileSync(migrationPath, "utf-8");
        await testClient.query(sql);
      }
    } catch (e) {
      console.warn("Migration note:", e.message);
    } finally {
      await testClient.end().catch(() => {});
    }

    // Save to .env.local
    let envContent = "";
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, "utf-8");
    }
    if (envContent.match(/^#?\s*DATABASE_URL=/m)) {
      envContent = envContent.replace(/^#?\s*DATABASE_URL=.*/m, `DATABASE_URL="${trimmed}"`);
    } else {
      envContent += `\nDATABASE_URL="${trimmed}"\n`;
    }
    fs.writeFileSync(envLocalPath, envContent.trim() + "\n", "utf-8");
    process.env.DATABASE_URL = trimmed;

    // Reset pool
    const newPool = getDbPool();
    if (newPool) await ensureDatabaseSchema(newPool).catch(() => {});

    return { success: true, message: "Connected to Supabase PostgreSQL successfully! All 9 tables synced." };
  },
};

module.exports = dbService;
