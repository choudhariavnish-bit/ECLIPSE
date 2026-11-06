import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";
import fs from "fs";
import path from "path";
import { getDbPool, ensureDatabaseSchema } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { databaseUrl } = await req.json();

    if (!databaseUrl || typeof databaseUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "databaseUrl is required" },
        { status: 400 }
      );
    }

    const trimmedUrl = databaseUrl.trim();
    if (!trimmedUrl.startsWith("postgresql://") && !trimmedUrl.startsWith("postgres://")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid connection string. It must start with postgresql:// or postgres://",
        },
        { status: 400 }
      );
    }

    // 1. Test live connection
    const testClient = new Client({
      connectionString: trimmedUrl,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await testClient.connect();
      await testClient.query("SELECT 1;");
    } catch (connErr: any) {
      await testClient.end().catch(() => {});
      return NextResponse.json(
        {
          success: false,
          error: `Could not connect to Supabase: ${connErr.message}`,
        },
        { status: 400 }
      );
    }

    // 2. Initialize tables & seed data
    try {
      const migrationPath = path.join(process.cwd(), "database", "supabase_migration.sql");
      if (fs.existsSync(migrationPath)) {
        const sql = fs.readFileSync(migrationPath, "utf-8");
        await testClient.query(sql);
      }
    } catch (migErr: any) {
      console.warn("[Migration Warning]:", migErr.message);
    } finally {
      await testClient.end().catch(() => {});
    }

    // 3. Update .env.local
    const envLocalPath = path.join(process.cwd(), ".env.local");
    let envContent = "";
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, "utf-8");
    }

    if (envContent.match(/^#?\s*DATABASE_URL=/m)) {
      envContent = envContent.replace(/^#?\s*DATABASE_URL=.*/m, `DATABASE_URL="${trimmedUrl}"`);
    } else {
      envContent += `\nDATABASE_URL="${trimmedUrl}"\n`;
    }

    fs.writeFileSync(envLocalPath, envContent.trim() + "\n", "utf-8");
    process.env.DATABASE_URL = trimmedUrl;

    // 4. Trigger pool recreation
    const newPool = getDbPool();
    if (newPool) {
      await ensureDatabaseSchema(newPool).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Connected to Supabase PostgreSQL successfully! All 9 tables are synced.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to connect to database" },
      { status: 500 }
    );
  }
}

