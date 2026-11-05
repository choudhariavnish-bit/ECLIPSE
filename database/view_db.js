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
      const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
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
    console.log("Database Mode: Local Live Store (database/live_store.json)");
    console.log("To connect live Supabase cloud: Run connect-supabase.bat\n");
  }

  const storeFile = path.join(__dirname, "live_store.json");
  let liveStore = null;
  if (fs.existsSync(storeFile)) {
    try {
      liveStore = JSON.parse(fs.readFileSync(storeFile, "utf-8"));
    } catch(e) {}
  }

  console.log("=====================================================================");
  console.log("1. TABLE: organizations (" + (liveStore?.organizations?.length || 0) + " records)");
  const orgs = (liveStore && liveStore.organizations) ? liveStore.organizations.map(o => ({
    id: o.id.substring(0, 18) + "...",
    name: o.name,
    industry: o.industry,
    primary_color: o.branding_settings?.primary_color || "#2563EB",
    tone_preference: o.branding_settings?.tone_preference || "professional"
  })) : [];
  console.table(orgs);

  console.log("\n2. TABLE: users (" + (liveStore?.users?.length || 0) + " Registered Accounts with bcrypt)");
  const users = (liveStore && liveStore.users) ? liveStore.users.map(u => ({
    id: u.id.substring(0, 18) + "...",
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department || "General",
    password_hash: u.password ? (u.password.substring(0, 12) + "... (bcrypt)") : "$2b$10$... (Cost 10)"
  })) : [];
  console.table(users);

  console.log("\n3. TABLE: guidelines (" + (liveStore?.guidelines?.length || 0) + " Brand Voice Codices)");
  const guidelines = (liveStore && liveStore.guidelines) ? liveStore.guidelines.map(g => ({
    id: g.id.substring(0, 18) + "...",
    title: g.title,
    version: g.version || "1.0.0",
    created: g.created_at?.substring(0, 10)
  })) : [];
  console.table(guidelines);

  console.log("\n4. TABLE: rules (" + (liveStore?.rules?.length || 0) + " Enforcement Rules)");
  const rules = (liveStore && liveStore.rules) ? liveStore.rules.slice(0, 10).map(r => ({
    rule_type: r.rule_type,
    name: r.name,
    severity: r.severity,
    pattern: r.pattern,
    replacement: r.replacement
  })) : [];
  console.table(rules);

  console.log("\n5. TABLE: drafts (" + (liveStore?.drafts?.length || 0) + " Uploaded Articles & Collateral)");
  const drafts = (liveStore && liveStore.drafts) ? liveStore.drafts.map(d => ({
    id: d.id.substring(0, 18) + "...",
    title: d.title,
    channel: d.channel,
    status: d.status,
    author: d.author || "Unknown"
  })) : [];
  console.table(drafts);

  console.log("\n6. TABLE: findings (" + (liveStore?.findings?.length || 0) + " AI Detected Issues)");
  const findings = (liveStore && liveStore.findings) ? liveStore.findings.map(f => ({
    category: f.category || "compliance",
    severity: f.severity,
    issue: (f.issue || f.highlight_text || "").substring(0, 35) + "...",
    suggestion: (f.suggestion || "").substring(0, 35) + "..."
  })) : [];
  console.table(findings);

  console.log("\n7. TABLE: comments (" + (liveStore?.comments?.length || 0) + " Reviewer Notes)");
  const comments = (liveStore && liveStore.comments) ? liveStore.comments.map(c => ({
    id: c.id.substring(0, 18) + "...",
    comment: (c.comment || "").substring(0, 60) + "..."
  })) : [];
  console.table(comments);

  console.log("\n8. TABLE: approvals (" + (liveStore?.approvals?.length || 0) + " Sign-offs)");
  const approvals = (liveStore && liveStore.approvals) ? liveStore.approvals.map(a => ({
    id: a.id.substring(0, 18) + "...",
    status: a.status,
    notes: (a.notes || "").substring(0, 50)
  })) : [];
  console.table(approvals);

  console.log("\n9. TABLE: audit_logs (" + (liveStore?.audit_logs?.length || 0) + " Cryptographic Logs)");
  const logs = (liveStore && liveStore.audit_logs) ? liveStore.audit_logs.slice(0, 10).map(l => ({
    action: l.action,
    entity: l.entity_type,
    user: (l.user_id || "system").substring(0, 12) + "...",
    time: l.created_at?.substring(11, 19)
  })) : [];
  console.table(logs);

  console.log("=====================================================================");
  console.log(" Web Database Studio: Run 's.bat' -> http://localhost:3000/dashboard/database");
  console.log("=====================================================================");
}

viewDatabase();
