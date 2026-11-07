import { Pool } from "pg";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

/**
 * Dynamically resolves the active PostgreSQL / Supabase connection string.
 * Checks process.env.DATABASE_URL first, then falls back to parsing .env.local on the fly
 * so changes take effect immediately without requiring a dev server restart.
 */
export function getActiveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.trim().startsWith("#")) {
    return process.env.DATABASE_URL.trim();
  }
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
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

export function getActiveSupabaseCredentials(): { url?: string; anonKey?: string } {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  let anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const urlMatch =
          content.match(/^(?:NEXT_PUBLIC_SUPABASE_URL|SUPABASE_URL)\s*=\s*["']?([^"'\r\n]+)["']?/m);
        const keyMatch =
          content.match(/^(?:NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY)\s*=\s*["']?([^"'\r\n]+)["']?/m);
        if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith("#")) url = urlMatch[1].trim();
        if (keyMatch && keyMatch[1] && !keyMatch[1].startsWith("#")) anonKey = keyMatch[1].trim();
      }
    } catch {}
  }
  return { url, anonKey };
}

let activePool: Pool | null = null;
let lastUsedConnectionString: string | undefined = undefined;
let activeSupabase: SupabaseClient | null = null;
let lastUsedSupabaseUrl: string | undefined = undefined;

export function getDbPool(): Pool | null {
  const connectionString = getActiveDatabaseUrl();
  if (!connectionString) {
    return null;
  }
  if (activePool && lastUsedConnectionString === connectionString) {
    return activePool;
  }

  try {
    if (activePool) {
      activePool.end().catch(() => {});
    }
    activePool = new Pool({
      connectionString,
      ssl:
        connectionString.includes("supabase.co") ||
        connectionString.includes("supabase.com") ||
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    lastUsedConnectionString = connectionString;

    // Asynchronously ensure essential schema exists
    ensureDatabaseSchema(activePool).catch((err) => {
      console.warn("[DB AutoSchema] Schema check note:", err.message);
    });
  } catch (err) {
    console.warn("[DB] Failed to initialize pg Pool:", err);
    activePool = null;
  }

  return activePool;
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getActiveSupabaseCredentials();
  if (!url || !anonKey) return null;
  if (activeSupabase && lastUsedSupabaseUrl === url) return activeSupabase;

  try {
    activeSupabase = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
    lastUsedSupabaseUrl = url;
  } catch (err) {
    console.warn("[Supabase] Failed to initialize Supabase client:", err);
    activeSupabase = null;
  }
  return activeSupabase;
}

// Backward-compatible exports
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const p = getDbPool();
    if (!p) return undefined;
    const val = (p as any)[prop];
    return typeof val === "function" ? val.bind(p) : val;
  },
});

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const s = getSupabaseClient();
    if (!s) return undefined;
    const val = (s as any)[prop];
    return typeof val === "function" ? val.bind(s) : val;
  },
});

/**
 * Universal query runner:
 * Executes SQL directly if PostgreSQL pool is connected.
 * Returns null if not configured or if connection fails, so callers gracefully use local/fallback store.
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[] | null> {
  const p = getDbPool();
  if (p) {
    try {
      const res = await p.query(text, params);
      return res.rows as T[];
    } catch (err: any) {
      console.warn("[DB Query] External database unreachable, seamlessly using local store:", err.message || err);
      return null;
    }
  }
  return null;
}

/**
 * Ensures all required PostgreSQL / Supabase tables and default seeds exist.
 * Idempotent: safe to run multiple times.
 */
export async function ensureDatabaseSchema(p: Pool): Promise<void> {
  try {
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

        -- Seed default organization so foreign keys never fail
        INSERT INTO organizations (id, name, industry, branding_settings)
        VALUES (
          'a0000000-0000-0000-0000-000000000001',
          'ECLIPSE Global Enterprises',
          'Enterprise Cloud & Governance Software',
          '{"primary_color": "#2563EB", "font_family": "Inter", "tone_preference": "professional"}'::jsonb
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn("[ensureDatabaseSchema]:", err.message);
  }
}

/**
 * Check active database connectivity status
 */
export async function checkDbConnection(): Promise<{
  connected: boolean;
  type: "postgres" | "supabase" | "mock";
  endpoint?: string;
  details?: string;
}> {
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
        details: "Connected to live PostgreSQL / Supabase database",
      };
    } catch (err: any) {
      return { connected: false, type: "postgres", details: err.message };
    }
  }

  const s = getSupabaseClient();
  if (s) {
    try {
      const { error } = await s.from("organizations").select("id").limit(1);
      if (error) throw error;
      return { connected: true, type: "supabase", details: "Connected to Supabase Cloud" };
    } catch (err: any) {
      return { connected: false, type: "supabase", details: err.message };
    }
  }

  return {
    connected: false,
    type: "mock",
    details: "Using mock in-memory governance store. Set DATABASE_URL to connect live Supabase.",
  };
}
