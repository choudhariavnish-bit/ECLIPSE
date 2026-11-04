-- ============================================================================
-- Inkloom AI (Project ECLIPSE): Full Demo & Real Data Seed
-- Target: Supabase PostgreSQL
-- ============================================================================

-- 1. Insert Core Organizations / Brands
INSERT INTO organizations (id, name, industry, branding_settings)
VALUES 
(
    'a0000000-0000-0000-0000-000000000001',
    'Inkloom AI Enterprises',
    'Enterprise Cloud & Governance Software',
    '{"primary_color": "#2563EB", "font_family": "Inter", "tone_preference": "professional"}'::jsonb
),
(
    'a0000000-0000-0000-0000-000000000002',
    'LoomCraft Studio',
    'Digital Creative Agency',
    '{"primary_color": "#8B5CF6", "font_family": "Plus Jakarta Sans", "tone_preference": "playful"}'::jsonb
),
(
    'a0000000-0000-0000-0000-000000000003',
    'PulseFin Global',
    'Banking & Financial Services',
    '{"primary_color": "#059669", "font_family": "Roboto Mono", "tone_preference": "conservative"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    branding_settings = EXCLUDED.branding_settings;

-- 2. Insert Users for all 3 Personas
INSERT INTO users (id, organization_id, name, email, password, role, department, avatar_url)
VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'a0000000-0000-0000-0000-000000000001',
    'Alex Morgan',
    'alex.creator@inkloom.ai',
    '$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO',
    'creator',
    'Content & Growth Marketing',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
),
(
    '22222222-2222-2222-2222-222222222222',
    'a0000000-0000-0000-0000-000000000001',
    'Sarah Chen',
    'sarah.brand@inkloom.ai',
    '$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO',
    'brand-manager',
    'Global Brand & Governance',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
),
(
    '33333333-3333-3333-3333-333333333333',
    'a0000000-0000-0000-0000-000000000001',
    'Marcus Vance',
    'marcus.admin@inkloom.ai',
    '$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO',
    'admin',
    'System Architecture & Compliance',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

-- 3. Insert Brand Guidelines
INSERT INTO guidelines (id, organization_id, title, content, version)
VALUES 
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Inkloom Global Brand & Voice Guidelines',
    'Corporate standards for marketing claims, tone of voice, visual margins, and WCAG AA accessibility.',
    '2.4.0'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'LoomCraft Studio Creative Guidelines',
    'High-energy social campaigns, viral short-form copy, and vibrant graphics.',
    '1.2.0'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'PulseFin Regulatory & Statutory Rulebook',
    'SEC/FINRA compliance guidelines, statutory risk disclosures, and verified financial claims.',
    '3.1.0'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content;

-- 4. Insert Governance Rules across Brands
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
    'Slang & Hyperbole Ban',
    'Informal hyperbole clashes with authoritative enterprise tone in press releases.',
    'warning',
    'super crazy fast',
    'rapid zero-downtime deployment',
    TRUE
),
(
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000002',
    'tone',
    'Stiff Corporate Jargon Ban',
    'Monotonous corporate jargon kills creator engagement on social campaigns.',
    'warning',
    'synergistic paradigm shift',
    'fresh creative momentum',
    TRUE
),
(
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000003',
    'claim',
    'SEC/FINRA: No Guaranteed Returns',
    'Promising specific return percentages is illegal under financial advertising laws.',
    'critical',
    'guaranteed 500% ROI',
    'projected historical yield based on audited backtesting',
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    pattern = EXCLUDED.pattern,
    replacement = EXCLUDED.replacement;

-- 5. Insert Active Drafts
INSERT INTO drafts (id, user_id, organization_id, title, content, channel, format, status)
VALUES 
(
    'd0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'a0000000-0000-0000-0000-000000000001',
    'Q4 Global Product Launch Announcement',
    'Inkloom is the market''s only 100% foolproof AI automation platform with super crazy fast deployment for global brands.',
    'Blog & Press',
    'text',
    'review_pending'
),
(
    'd0000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'a0000000-0000-0000-0000-000000000002',
    'Instagram Story Creative Carousel - Fall Promo',
    'Transform your visual branding with automated AI precision and instant multi-channel governance.',
    'Instagram / Meta',
    'graphic',
    'changes_requested'
),
(
    'd0000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'a0000000-0000-0000-0000-000000000001',
    'Enterprise Security & SOC2 Compliance Whitepaper',
    'Inkloom delivers enterprise-grade AI brand governance with verified high-availability and zero data retention for regulated enterprises.',
    'Whitepaper (PDF)',
    'text',
    'approved'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    status = EXCLUDED.status;

-- 6. Insert AI Findings
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
)
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Reviewer Comment
INSERT INTO comments (id, draft_id, reviewer_id, comment)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Please fix the 100% foolproof superlative claim before we issue final approval for press wire.'
)
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Audit Log
INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details)
VALUES (
    '80000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'DATABASE_SEED_COMPLETE',
    'system',
    'a0000000-0000-0000-0000-000000000001',
    '{"status": "All demo and real governance tables seeded successfully"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

