-- ============================================================================
-- Inkloom AI / Project ECLIPSE: Relational Seed Data
-- Database: PostgreSQL / Supabase
-- ============================================================================

-- Clean existing data
DELETE FROM audit_logs;
DELETE FROM approvals;
DELETE FROM comments;
DELETE FROM findings;
DELETE FROM drafts;
DELETE FROM rules;
DELETE FROM guidelines;
DELETE FROM users;
DELETE FROM organizations;

-- 1. Insert Default Organization
INSERT INTO organizations (id, name, industry, branding_settings)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Inkloom AI Enterprises',
    'Enterprise Cloud & Governance Software',
    '{
        "primary_color": "#2563EB",
        "secondary_color": "#0F172A",
        "font_family": "Inter, sans-serif",
        "tone_preference": "professional-confident",
        "strictness_level": "strict",
        "enable_pii_masking": true,
        "wcag_level": "AA"
    }'::jsonb
);

-- 2. Insert Users for all 3 Personas
-- Password for all mock accounts is 'password123'
-- Bcrypt hash generated with 10 salt rounds: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO users (id, organization_id, name, email, password, role, department, avatar_url)
VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'a0000000-0000-0000-0000-000000000001',
    'Alex Morgan',
    'alex.creator@inkloom.ai',
    '$2b$10$9VU6j1ff.WY.7eGIvvWfWuJ5FyDTySoapPmHRyz.nex9S.mHEyB.G',
    'creator',
    'Content & Growth Marketing',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
),
(
    '22222222-2222-2222-2222-222222222222',
    'a0000000-0000-0000-0000-000000000001',
    'Sarah Chen',
    'sarah.brand@inkloom.ai',
    '$2b$10$9VU6j1ff.WY.7eGIvvWfWuJ5FyDTySoapPmHRyz.nex9S.mHEyB.G',
    'brand-manager',
    'Global Brand & Governance',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
),
(
    '33333333-3333-3333-3333-333333333333',
    'a0000000-0000-0000-0000-000000000001',
    'Marcus Vance',
    'marcus.admin@inkloom.ai',
    '$2b$10$9VU6j1ff.WY.7eGIvvWfWuJ5FyDTySoapPmHRyz.nex9S.mHEyB.G',
    'admin',
    'System Architecture & Compliance',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
);

-- 3. Insert Brand Guidelines
INSERT INTO guidelines (id, organization_id, title, content, version, created_by)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Inkloom Global Brand & Voice Guidelines',
    '# Brand Identity & Governance Standards
1. Communication must always project authority, clarity, and empathy.
2. Unverified superlative claims (e.g. "foolproof", "flawless", "#1 in the universe") are strictly prohibited.
3. Use inclusive terminology: avoid gendered phrases like "man hours".
4. Visual assets must respect the 24px exclusion zone around the corporate logo mark.
5. All public copy must be WCAG 2.1 AA accessible with high contrast readability.',
    '2.4.0',
    '22222222-2222-2222-2222-222222222222'
);

-- 4. Insert Rules for Brand Verification
INSERT INTO rules (id, guideline_id, rule_type, name, description, severity, pattern, replacement, is_enabled)
VALUES 
(
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'claim',
    'Prohibited Superlative Claims',
    'Absolute claims and unverified superlatives are forbidden under advertising compliance regulations.',
    'critical',
    '100% foolproof',
    'enterprise-grade AI automation with verified high-availability',
    TRUE
),
(
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'tone',
    'Tone Matrix: Hyperbole Slang',
    'Informal hyperbole and casual slang undermine enterprise trust and authority.',
    'warning',
    'super crazy fast',
    'rapid zero-downtime',
    TRUE
),
(
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'terminology',
    'Inclusive Workplace Terminology',
    'Replace archaic gendered terms with modern inclusive language.',
    'warning',
    'man hours',
    'person hours / team hours',
    TRUE
),
(
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    'accessibility',
    'WCAG AA Visual Text Contrast',
    'Contrast ratio between foreground text and background colors must meet 4.5:1 minimum.',
    'critical',
    'light-grey-on-white',
    'slate-900 on white',
    TRUE
),
(
    'c0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000001',
    'logo',
    'Logo Clearance & Safe Zone',
    'Brand logo mark must maintain minimum 24px exclusion margin on all collateral.',
    'warning',
    'margin < 24px',
    'margin >= 24px',
    TRUE
);

-- 5. Insert Drafts
INSERT INTO drafts (id, user_id, organization_id, title, content, channel, format, status)
VALUES 
(
    'd0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'a0000000-0000-0000-0000-000000000001',
    'Q4 Global Product Launch Announcement',
    'Inkloom is the market''s only 100% foolproof AI automation platform with super crazy fast deployment for global brands.',
    'Blog & Press',
    'Rich Article',
    'review_pending'
),
(
    'd0000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'a0000000-0000-0000-0000-000000000001',
    'Enterprise Security Whitepaper',
    'Inkloom safeguards confidential data with verified zero-retention architecture and SOC2 Type II certification.',
    'Whitepaper',
    'PDF Document',
    'approved'
);

-- 6. Insert AI Review Findings for Draft 1
INSERT INTO findings (id, draft_id, rule_id, issue, severity, suggestion, highlight_text, category, status)
VALUES 
(
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Absolute superlative guarantee not permitted under advertising compliance.',
    'critical',
    'enterprise-grade AI automation with verified high-availability',
    '100% foolproof AI automation',
    'claim',
    'pending'
),
(
    'e0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'Informal hyperbole clashes with authoritative enterprise tone.',
    'warning',
    'rapid zero-downtime deployment',
    'super crazy fast deployment',
    'tone',
    'pending'
);

-- 7. Insert Comments
INSERT INTO comments (id, draft_id, reviewer_id, comment)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Please apply the AI suggestion on the superlative claim before we issue final executive sign-off.'
);

-- 8. Insert Approvals Workflow History
INSERT INTO approvals (id, draft_id, approved_by, status, notes)
VALUES 
(
    '90000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'submitted',
    'Submitted draft for pre-publication governance sign-off.'
),
(
    '90000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'approved',
    'Compliant with brand identity standards. All facts cited.'
);

-- 9. Insert Audit Logs
INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details, ip_address)
VALUES 
(
    '80000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'ORGANIZATION_INITIALIZE',
    'organizations',
    'a0000000-0000-0000-0000-000000000001',
    '{"message": "Inkloom AI organization setup complete", "tier": "enterprise"}'::jsonb,
    '127.0.0.1'
),
(
    '80000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'DRAFT_SUBMITTED',
    'drafts',
    'd0000000-0000-0000-0000-000000000001',
    '{"channel": "Blog & Press", "flags": 2}'::jsonb,
    '192.168.1.104'
),
(
    '80000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'DRAFT_APPROVED',
    'drafts',
    'd0000000-0000-0000-0000-000000000002',
    '{"reviewer": "Sarah Chen", "verdict": "sign-off granted"}'::jsonb,
    '192.168.1.108'
);
