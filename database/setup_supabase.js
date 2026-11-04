/**
 * Interactive Supabase Connection Assistant
 * Run with: node database/setup_supabase.js
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { Client } = require("pg");

const envLocalPath = path.join(__dirname, "../.env.local");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("=====================================================================");
console.log("   INKLOOM AI (PROJECT ECLIPSE) — SUPABASE CONNECTION SETUP");
console.log("=====================================================================");
console.log("");
console.log("To connect your repository to Supabase:");
console.log("1. Open https://supabase.com/dashboard/project/_/settings/database");
console.log("2. Scroll to 'Connection string' -> Select 'URI' -> Mode: 'Session' or 'Transaction'");
console.log("3. Copy the URI string (it looks like):");
console.log("   postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres");
console.log("");

rl.question("Paste your Supabase DATABASE_URL here:\n> ", async (dbUrl) => {
  const trimmedUrl = dbUrl.trim();

  if (!trimmedUrl.startsWith("postgresql://") && !trimmedUrl.startsWith("postgres://")) {
    console.error("\n[ERROR] Invalid URL. The connection string must start with 'postgresql://' or 'postgres://'");
    rl.close();
    process.exit(1);
  }

  console.log("\n[1/3] Testing database connection to Supabase...");
  const client = new Client({
    connectionString: trimmedUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("      Connected to Supabase PostgreSQL successfully!");

    console.log("[2/3] Applying 9 brand governance tables & initial seed data...");
    const migrationPath = path.join(__dirname, "supabase_migration.sql");
    const sql = fs.readFileSync(migrationPath, "utf-8");
    await client.query(sql);
    console.log("      All 9 tables, indexes, triggers, and demo data provisioned!");

    console.log("[3/3] Saving configuration to .env.local...");
    let envContent = "";
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, "utf-8");
    }

    if (envContent.includes("DATABASE_URL=")) {
      envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${trimmedUrl}"`);
    } else {
      envContent += `\nDATABASE_URL="${trimmedUrl}"\n`;
    }

    fs.writeFileSync(envLocalPath, envContent.trim() + "\n");
    console.log("      Updated .env.local successfully!");

    console.log("");
    console.log("=====================================================================");
    console.log(" SUCCESS! Your repository is now fully connected to Supabase!");
    console.log(" Run 's.bat' to open the app and view your live tables in Database Studio.");
    console.log("=====================================================================");
  } catch (err) {
    console.error("\n[ERROR] Could not connect to Supabase:");
    console.error(err.message);
    console.log("\nPlease check your password and project reference, then try again.");
  } finally {
    await client.end().catch(() => {});
    rl.close();
  }
});

