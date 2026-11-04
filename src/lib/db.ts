import { Pool } from "pg";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Environment variables
const connectionString = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let pool: Pool | null = null;
let supabase: SupabaseClient | null = null;

// Initialize PostgreSQL pool if DATABASE_URL exists
if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  } catch (err) {
    console.warn("[DB] Failed to initialize pg Pool:", err);
  }
}

// Initialize Supabase Client if URL and Key exist
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  } catch (err) {
    console.warn("[Supabase] Failed to initialize Supabase client:", err);
  }
}

export { pool, supabase };

/**
 * Universal query runner:
 * Executes SQL directly if PostgreSQL pool or Supabase is connected.
 * Returns null if not configured so callers can use mock/in-memory data.
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[] | null> {
  if (pool) {
    try {
      const res = await pool.query(text, params);
      return res.rows as T[];
    } catch (err) {
      console.error("[DB Query Error]:", err);
      throw err;
    }
  }
  return null;
}

/**
 * Check active database connectivity status
 */
export async function checkDbConnection(): Promise<{
  connected: boolean;
  type: "postgres" | "supabase" | "mock";
  details?: string;
}> {
  if (pool) {
    try {
      await pool.query("SELECT 1;");
      return { connected: true, type: "postgres", details: "Connected to PostgreSQL database" };
    } catch (err: any) {
      return { connected: false, type: "postgres", details: err.message };
    }
  }

  if (supabase) {
    try {
      const { error } = await supabase.from("organizations").select("id").limit(1);
      if (error) throw error;
      return { connected: true, type: "supabase", details: "Connected to Supabase Cloud" };
    } catch (err: any) {
      return { connected: false, type: "supabase", details: err.message };
    }
  }

  return {
    connected: false,
    type: "mock",
    details: "Using mock in-memory governance store. Set DATABASE_URL or SUPABASE_URL to connect live database.",
  };
}

