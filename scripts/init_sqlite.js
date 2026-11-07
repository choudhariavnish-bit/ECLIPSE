/**
 * Inkloom AI - Native SQLite3 Database Initializer
 * Uses Node.js built-in node:sqlite (100% offline, zero external dependencies)
 */
const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");
const path = require("path");

const dbDir = path.join(process.cwd(), "database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "governance.sqlite");
console.log(`[SQLite3] Initializing local offline database at: ${dbPath}`);

const db = new DatabaseSync(dbPath);

// Create Relational Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    branding_settings TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES organizations(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS guidelines (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES organizations(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version TEXT DEFAULT '1.0.0',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rules (
    id TEXT PRIMARY KEY,
    guideline_id TEXT,
    brand_id TEXT,
    rule_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'warning',
    pattern TEXT NOT NULL,
    replacement TEXT,
    is_enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    brand TEXT,
    author TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    channel TEXT,
    format TEXT,
    status TEXT DEFAULT 'draft',
    drift_score INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS findings (
    id TEXT PRIMARY KEY,
    draft_id TEXT REFERENCES drafts(id),
    issue TEXT NOT NULL,
    severity TEXT,
    suggestion TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    status TEXT DEFAULT 'VERIFIED',
    ip_address TEXT DEFAULT '127.0.0.1',
    details TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Default Organizations
const orgInsert = db.prepare(`
  INSERT OR IGNORE INTO organizations (id, name, industry, branding_settings, created_at)
  VALUES (?, ?, ?, ?, ?)
`);
orgInsert.run("org-01", "Inkloom AI Enterprises", "Enterprise AI & Cloud Governance", JSON.stringify({ primary_color: "#2563EB", tone: "authoritative" }), new Date().toISOString());
orgInsert.run("org-02", "LoomCraft Studio", "Digital Creative Agency", JSON.stringify({ primary_color: "#8B5CF6", tone: "playful" }), new Date().toISOString());
orgInsert.run("org-03", "PulseFin Global", "Banking & Financial Services", JSON.stringify({ primary_color: "#059669", tone: "conservative" }), new Date().toISOString());

// Seed Default Users
const userInsert = db.prepare(`
  INSERT OR IGNORE INTO users (id, organization_id, name, email, password, role, department, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
userInsert.run("u-01", "org-01", "Alex Morgan", "alex.creator@inkloom.ai", "password123", "creator", "Content & Communications", "ACTIVE", new Date().toISOString());
userInsert.run("u-02", "org-01", "Sarah Chen", "sarah.brand@inkloom.ai", "password123", "brand-manager", "Global Brand Governance", "ACTIVE", new Date().toISOString());
userInsert.run("u-03", "org-01", "Marcus Vance", "marcus.admin@inkloom.ai", "password123", "admin", "Information Security", "ACTIVE", new Date().toISOString());
userInsert.run("u-04", "org-02", "Growth Agency Partner", "contractor@agency.studio", "password123", "creator", "External Contractor", "ACTIVE", new Date().toISOString());

// Seed Default Rules
const ruleInsert = db.prepare(`
  INSERT OR IGNORE INTO rules (id, guideline_id, brand_id, rule_type, name, description, severity, pattern, replacement, is_enabled, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
ruleInsert.run("r-01", "g-01", "brand-inkloom", "claim", "Prohibited Superlative Guarantees", "Absolute guarantees cannot be verified under corporate advertising compliance.", "critical", "100% foolproof", "enterprise-grade verified high-availability", 1, new Date().toISOString());
ruleInsert.run("r-02", "g-01", "brand-inkloom", "claim", "Zero Defect Infallibility Claims", "Software marketing must avoid absolute infallibility claims.", "critical", "zero bugs guaranteed", "rigorous 99.99% uptime resilience", 1, new Date().toISOString());
ruleInsert.run("r-03", "g-01", "brand-inkloom", "tone", "Casual Hyperbole Restriction", "Informal slang compromises authoritative enterprise standing.", "warning", "super crazy fast", "rapid zero-downtime deployment", 1, new Date().toISOString());
ruleInsert.run("r-04", "g-02", "brand-pulsefin", "legal", "FINRA / SEC Return Promises", "Never guarantee numerical investment returns.", "critical", "guaranteed 500% ROI in 30 days", "historical baseline models indicate performance potential", 1, new Date().toISOString());

// Seed Default Drafts
const draftInsert = db.prepare(`
  INSERT OR IGNORE INTO drafts (id, user_id, brand, author, title, content, channel, format, status, drift_score, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
draftInsert.run(
  "d-001",
  "u-01",
  "Inkloom AI Enterprises",
  "Alex Morgan",
  "Q4 Enterprise AI Cloud Resilience Whitepaper",
  "Inkloom is the market's only 100% foolproof AI automation platform with super crazy fast deployment for enterprise teams.",
  "Blog & Press",
  "Whitepaper",
  "review_pending",
  8,
  new Date().toISOString(),
  new Date().toISOString()
);
draftInsert.run(
  "d-002",
  "u-01",
  "PulseFin Global",
  "Alex Morgan",
  "Global FinTech API Security Protocols",
  "Standard operating documentation for AES-256 cloud envelope encryption and mutual TLS certificate validation.",
  "Technical Documentation",
  "Technical Spec",
  "approved",
  2,
  new Date(Date.now() - 3600000).toISOString(),
  new Date(Date.now() - 3600000).toISOString()
);
draftInsert.run(
  "d-003",
  "u-04",
  "LoomCraft Studio",
  "Growth Studio Contractor",
  "Enterprise Social Carousel Campaign",
  "Our growth hacking synergy guarantees double conversions in 48 hours with zero defect infallibility.",
  "Paid Social (LinkedIn)",
  "Ad Copy",
  "changes_requested",
  42,
  new Date(Date.now() - 7200000).toISOString(),
  new Date(Date.now() - 7200000).toISOString()
);

// Seed Default Audit Logs
const auditInsert = db.prepare(`
  INSERT OR IGNORE INTO audit_logs (id, user_id, user_name, action, entity, status, ip_address, details, timestamp)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
auditInsert.run("a-001", "u-03", "Marcus Vance", "SYSTEM_INITIALIZE", "SQLite3 Engine", "VERIFIED", "127.0.0.1", "Native local SQLite3 offline database synchronized.", new Date().toISOString());
auditInsert.run("a-002", "u-02", "Sarah Chen", "POLICY_CALIBRATED", "Brand Rulebook: Inkloom AI", "SUCCESS", "127.0.0.1", "Superlative restriction CLM-01 severity set to critical.", new Date(Date.now() - 600000).toISOString());
auditInsert.run("a-003", "u-01", "Alex Morgan", "CONTENT_AUDITED", "Draft: Q4 Enterprise AI Launch", "FLAGGED", "127.0.0.1", "Identified 2 policy flags: CLM-01 (100% foolproof), TON-01 (super crazy fast).", new Date(Date.now() - 1800000).toISOString());

db.close();
console.log("[SQLite3] Initial database tables created and seeded successfully!");

