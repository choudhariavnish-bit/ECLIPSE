-- ============================================================================
-- Inkloom AI / Project ECLIPSE: Relational Brand Governance Database Schema
-- Target Database: PostgreSQL 14+ / Supabase
-- Cloud Hosting Target: Render / Supabase Managed PostgreSQL
-- ============================================================================

-- Enable required cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean teardown (optional / for fresh installations)
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS approvals CASCADE;
-- DROP TABLE IF EXISTS comments CASCADE;
-- DROP TABLE IF EXISTS findings CASCADE;
-- DROP TABLE IF EXISTS drafts CASCADE;
-- DROP TABLE IF EXISTS rules CASCADE;
-- DROP TABLE IF EXISTS guidelines CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS organizations CASCADE;

-- ----------------------------------------------------------------------------
-- 1. ORGANIZATIONS
-- Stores enterprise client information and global branding settings
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. USERS
-- User profiles with assigned RBAC roles (creator, brand-manager, admin)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Stored as bcrypt hash ($2a$10$...)
    role VARCHAR(50) NOT NULL CHECK (role IN ('creator', 'brand-manager', 'admin')),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department VARCHAR(100) DEFAULT 'Content & Marketing',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. BRAND GUIDELINES (Official brand documents and policies)
-- ----------------------------------------------------------------------------
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

-- Create a view for backward compatibility / explicit naming
CREATE OR REPLACE VIEW brand_guidelines AS SELECT * FROM guidelines;

-- ----------------------------------------------------------------------------
-- 4. RULES
-- Granular tone, terminology, logo, accessibility and compliance rules
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_id UUID NOT NULL REFERENCES guidelines(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('tone', 'terminology', 'logo', 'accessibility', 'compliance', 'claim')),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    pattern TEXT,               -- Term or pattern to flag (e.g. "100% foolproof")
    replacement TEXT,           -- Suggested correction (e.g. "enterprise-grade verified")
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. DRAFTS
-- Uploaded text, documents, campaigns and images for pre-flight audit
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 6. FINDINGS
-- AI-generated issues detected during review (superlatives, tone, etc.)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 7. COMMENTS
-- Reviewer feedback, editor notes, and audit discussions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. APPROVALS
-- Approval status and complete workflow history
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('submitted', 'approved', 'rejected', 'changes_requested')),
    notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 9. AUDIT LOGS
-- Immutable system audit trails tracking every action performed by users
-- ----------------------------------------------------------------------------
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

-- ============================================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ============================================================================
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

-- ============================================================================
-- AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
-- ============================================================================
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

-- ============================================================================
-- SUPABASE ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Guidelines: All organization members can read; Brand Managers & Admins can write
CREATE POLICY "Guidelines are viewable by organization users"
ON guidelines FOR SELECT
USING (TRUE);

CREATE POLICY "Guidelines can be edited by brand managers and admins"
ON guidelines FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('brand-manager', 'admin')
    )
);

-- Rules: All organization members can read; Brand Managers & Admins can manage
CREATE POLICY "Rules are viewable by all users"
ON rules FOR SELECT
USING (TRUE);

CREATE POLICY "Rules can be managed by brand managers and admins"
ON rules FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('brand-manager', 'admin')
    )
);

-- Drafts: Creators can view & edit their own drafts; Brand Managers and Admins can view all drafts
CREATE POLICY "Users can view relevant drafts"
ON drafts FOR SELECT
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('brand-manager', 'admin')
    )
);

CREATE POLICY "Creators can create drafts"
ON drafts FOR INSERT
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY "Creators can update their drafts"
ON drafts FOR UPDATE
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('brand-manager', 'admin')
    )
);

-- Approvals: Only Brand Managers and Admins can create approvals
CREATE POLICY "Approvals can be created by brand managers and admins"
ON approvals FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('brand-manager', 'admin')
    )
);

CREATE POLICY "Approvals viewable by all members"
ON approvals FOR SELECT
USING (TRUE);

-- Audit logs: Read-only for Admins
CREATE POLICY "Audit logs readable by admins"
ON audit_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

