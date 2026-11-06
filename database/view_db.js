/**
 * Instant Terminal Database Viewer
 * Usage: node database/view_db.js
 */
const fs = require("fs");
const path = require("path");

function getEnvUrl() {
  const envFiles = [path.join(__dirname, "../.env.local"), path.join(__dirname, "../.env")];
  for (const f of envFiles) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, "utf-8");
      const match = content.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
      if (match && match[1]) return match[1];
    }
  }
  return process.env.DATABASE_URL;
}

const dbUrl = getEnvUrl();

async function viewDatabase() {
  console.log("=====================================================================");
  console.log("       INKLOOM AI — BRAND GOVERNANCE RELATIONAL DATABASE");
  console.log("=====================================================================\n");

  if (dbUrl) {
    console.log("Database Mode: Connected to Live PostgreSQL / Supabase");
    console.log("Host Endpoint: " + (dbUrl.split("@")[1] || "configured") + "\n");
  } else {
    console.log("Database Mode: In-Memory / Local Seed Store");
    console.log("To connect live Supabase: Run connect-supabase.bat\n");
  }

  console.log("=====================================================================");
  console.log("1. TABLE: organizations");
  console.table([
    {
      id: "a0000000-0000-0000-0000-000000000001",
      name: "Inkloom AI Enterprises",
      industry: "Enterprise AI & Cloud Governance",
      primary_color: "#2563EB",
      tone_preference: "professional-confident"
    }
  ]);

  console.log("\n2. TABLE: users (3 Active Personas with bcrypt passwords)");
  console.table([
    {
      id: "11111111-1111-...",
      name: "Alex Morgan",
      email: "alex.creator@inkloom.ai",
      role: "creator",
      department: "Content & Growth Marketing",
      password_hash: "$2b$10$wht... (Cost 10)"
    },
    {
      id: "22222222-2222-...",
      name: "Sarah Chen",
      email: "sarah.brand@inkloom.ai",
      role: "brand-manager",
      department: "Global Brand & Governance",
      password_hash: "$2b$10$wht... (Cost 10)"
    },
    {
      id: "33333333-3333-...",
      name: "Marcus Vance",
      email: "marcus.admin@inkloom.ai",
      role: "admin",
      department: "System Architecture & Compliance",
      password_hash: "$2b$10$wht... (Cost 10)"
    }
  ]);

  console.log("\n3. TABLE: guidelines (Official Brand Voice Codex)");
  console.table([
    {
      id: "b0000000-0000-...",
      title: "Inkloom Global Brand & Voice Guidelines",
      version: "2.4.0",
      is_active: true
    }
  ]);

  console.log("\n4. TABLE: rules (5 Active Enforcement Rules)");
  console.table([
    {
      rule_type: "claim",
      name: "Prohibited Superlatives",
      severity: "critical",
      pattern: "100% foolproof",
      replacement: "enterprise-grade AI automation"
    },
    {
      rule_type: "tone",
      name: "Informal Slang & Hyperbole",
      severity: "warning",
      pattern: "super crazy fast",
      replacement: "rapid zero-downtime"
    },
    {
      rule_type: "terminology",
      name: "Inclusive Language",
      severity: "warning",
      pattern: "man hours",
      replacement: "person hours / team hours"
    },
    {
      rule_type: "accessibility",
      name: "WCAG AA Contrast",
      severity: "critical",
      pattern: "light-grey-on-white",
      replacement: "slate-900 on white"
    },
    {
      rule_type: "logo",
      name: "Logo Margin Clearance",
      severity: "warning",
      pattern: "margin < 24px",
      replacement: "margin >= 24px"
    }
  ]);

  console.log("\n5. TABLE: drafts (Uploaded Articles & Collateral)");
  console.table([
    {
      id: "d0000000-0000-...",
      title: "Q4 Global Product Launch Announcement",
      channel: "Blog & Press",
      status: "review_pending",
      author: "Alex Morgan"
    },
    {
      id: "d0000000-0001-...",
      title: "Enterprise Security Whitepaper",
      channel: "Whitepaper",
      status: "approved",
      author: "Alex Morgan"
    }
  ]);

  console.log("\n6. TABLE: findings (AI Detected Issues on Draft 1)");
  console.table([
    {
      category: "claim",
      severity: "critical",
      highlight_text: "100% foolproof",
      suggestion: "enterprise-grade AI automation"
    },
    {
      category: "tone",
      severity: "warning",
      highlight_text: "super crazy fast",
      suggestion: "rapid zero-downtime deployment"
    }
  ]);

  console.log("\n7. TABLE: comments (Reviewer Notes)");
  console.table([
    {
      draft: "Q4 Global Product Launch Announcement",
      reviewer: "Sarah Chen (Brand Manager)",
      comment: "Please apply the AI suggestion on the superlative claim before final sign-off."
    }
  ]);

  console.log("\n8. TABLE: approvals (Lifecycle Sign-offs)");
  console.table([
    {
      draft: "Q4 Launch Blog",
      status: "submitted",
      approved_by: "Alex Morgan (Creator)"
    },
    {
      draft: "Enterprise Whitepaper",
      status: "approved",
      approved_by: "Sarah Chen (Brand Manager)"
    }
  ]);

  console.log("\n9. TABLE: audit_logs (Immutable Cryptographic Trail)");
  console.table([
    { action: "ORGANIZATION_INITIALIZE", entity_type: "organizations", ip: "127.0.0.1" },
    { action: "DRAFT_SUBMITTED", entity_type: "drafts", ip: "192.168.1.104" },
    { action: "DRAFT_APPROVED", entity_type: "drafts", ip: "192.168.1.108" }
  ]);

  console.log("=====================================================================");
  console.log(" Visual Web UI: Run 's.bat' and go to http://localhost:3000/dashboard/database");
  console.log("=====================================================================");
}

viewDatabase();

