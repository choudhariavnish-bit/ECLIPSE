-- ============================================================================
-- Inkloom AI: Complete Supabase / PostgreSQL Database Migration
-- Single-file script: Run directly in Supabase SQL Editor or psql CLI
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    branding_settings JSONB DEFAULT '{
        "primary_color": "#2563EB",
        "font_family": "Inter",
        "tone_preference": "professional",
        "strictness_level": "strict"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table (RBAC: creator, brand-manager, admin)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('creator', 'brand-manager', 'admin')),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department VARCHAR(100) DEFAULT 'Content & Marketing',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Guidelines Table
CREATE TABLE IF NOT EXISTS guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW brand_guidelines AS SELECT * FROM guidelines;

-- 5. Rules Table
CREATE TABLE IF NOT EXISTS rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_id UUID NOT NULL REFERENCES guidelines(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('tone', 'terminology', 'logo', 'accessibility', 'compliance', 'claim')),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    pattern TEXT,
    replacement TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Drafts Table
CREATE TABLE IF NOT EXISTS drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    channel VARCHAR(100) NOT NULL DEFAULT 'Blog & Press',
    format VARCHAR(50) NOT NULL DEFAULT 'Rich Article',
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review_pending', 'changes_requested', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Findings Table
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES rules(id) ON DELETE SET NULL,
    issue TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    suggestion TEXT NOT NULL,
    highlight_text TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'claim',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('submitted', 'approved', 'rejected', 'changes_requested')),
    notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_guidelines_org ON guidelines(organization_id);
CREATE INDEX IF NOT EXISTS idx_rules_guideline ON rules(guideline_id);
CREATE INDEX IF NOT EXISTS idx_rules_type ON rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_drafts_user ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_org ON drafts(organization_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_findings_draft ON findings(draft_id);
CREATE INDEX IF NOT EXISTS idx_comments_draft ON comments(draft_id);
CREATE INDEX IF NOT EXISTS idx_approvals_draft ON approvals(draft_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Automatic Updated_at triggers
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_org_timestamp ON organizations;
CREATE TRIGGER trg_org_timestamp BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_user_timestamp ON users;
CREATE TRIGGER trg_user_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_guidelines_timestamp ON guidelines;
CREATE TRIGGER trg_guidelines_timestamp BEFORE UPDATE ON guidelines FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_drafts_timestamp ON drafts;
CREATE TRIGGER trg_drafts_timestamp BEFORE UPDATE ON drafts FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Base Public Read/Write Policies for Service Role & Application Access
DROP POLICY IF EXISTS "Allow public read of active guidelines" ON guidelines;
CREATE POLICY "Allow public read of active guidelines" ON guidelines FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read of active rules" ON rules;
CREATE POLICY "Allow public read of active rules" ON rules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated user drafts" ON drafts;
CREATE POLICY "Allow authenticated user drafts" ON drafts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow findings access" ON findings;
CREATE POLICY "Allow findings access" ON findings FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow comments access" ON comments;
CREATE POLICY "Allow comments access" ON comments FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow approvals access" ON approvals;
CREATE POLICY "Allow approvals access" ON approvals FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow audit logs view" ON audit_logs;
CREATE POLICY "Allow audit logs view" ON audit_logs FOR SELECT USING (true);

-- Seed Initial Data
INSERT INTO organizations (id, name, industry)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Inkloom AI Global', 'Enterprise Governance & Brand Safety')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, organization_id, name, email, password, role, department)
VALUES 
('11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'Alex Morgan', 'alex.creator@inkloom.ai', '$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO', 'creator', 'Content & Growth Marketing'),
('22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000001', 'Sarah Chen', 'sarah.brand@inkloom.ai', '$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO', 'brand-manager', 'Global Brand & Governance'),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000001', 'Marcus Vance', 'marcus.admin@inkloom.ai', '$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO', 'admin', 'System Architecture & Compliance')
ON CONFLICT (id) DO NOTHING;

INSERT INTO guidelines (id, organization_id, title, content, version)
VALUES ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Inkloom Brand Governance Codex', 'Enterprise policies for tone, claims, and terminology.', '2.4.0')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rules (id, guideline_id, rule_type, name, description, severity, pattern, replacement)
VALUES 
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'claim', 'Superlative Prohibitions', 'Unverified absolute claims are illegal under FTC compliance.', 'critical', '100% foolproof', 'enterprise-grade AI automation with verified high-availability'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'tone', 'Informal Hyperbole', 'Avoid informal hype slang in customer-facing press copy.', 'warning', 'super crazy fast', 'rapid zero-downtime')
ON CONFLICT (id) DO NOTHING;

INSERT INTO drafts (id, user_id, organization_id, title, content, channel, status)
VALUES ('d0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'Q4 Global Product Launch Announcement', 'Inkloom is the market''s only 100% foolproof AI automation platform with super crazy fast deployment for global brands.', 'Blog & Press', 'review_pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO findings (id, draft_id, rule_id, issue, severity, suggestion, highlight_text, category, status)
VALUES 
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Absolute superlative guarantee not permitted under advertising compliance.', 'critical', 'enterprise-grade AI automation with verified high-availability', '100% foolproof AI automation', 'claim', 'pending'),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Informal hyperbole clashes with authoritative enterprise tone.', 'warning', 'rapid zero-downtime deployment', 'super crazy fast deployment', 'tone', 'pending')
ON CONFLICT (id) DO NOTHING;
