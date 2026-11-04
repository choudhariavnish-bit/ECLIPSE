/**
 * Automated Database Migration Runner
 * Connects to PostgreSQL (Supabase or Render) using DATABASE_URL
 * and executes schema.sql followed by seed.sql.
 *
 * Usage:
 *   node database/migrate.js
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectionString = process.env.DATABASE_URL;

async function runMigration() {
  if (!connectionString) {
    console.error("=====================================================================");
    console.error(" [ERROR] DATABASE_URL is not defined in .env or .env.local");
    console.error(" Please supply your PostgreSQL or Supabase connection string:");
    console.error(" Example: DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres");
    console.error("=====================================================================");
    process.exit(1);
  }

  console.log("=====================================================================");
  console.log(" Connecting to PostgreSQL / Supabase Database...");
  console.log("=====================================================================");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("[1/3] Connected to database successfully.");

    const schemaPath = path.join(__dirname, "schema.sql");
    const seedPath = path.join(__dirname, "seed.sql");

    console.log("[2/3] Executing schema.sql (tables, indexes, triggers, RLS)...");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    await client.query(schemaSql);
    console.log("      Schema created successfully!");

    console.log("[3/3] Executing seed.sql (demo users, guidelines, rules, drafts)...");
    const seedSql = fs.readFileSync(seedPath, "utf-8");
    await client.query(seedSql);
    console.log("      Seed data inserted successfully!");

    console.log("=====================================================================");
    console.log(" MIGRATION COMPLETED SUCCESSFULLY!");
    console.log(" All 9 tables, indexes, triggers, RLS policies, and seed data are ready.");
    console.log("=====================================================================");
  } catch (err) {
    console.error("[Migration Error]:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

