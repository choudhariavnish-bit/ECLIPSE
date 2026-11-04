-- Supabase Seed Data for ECLIPSE
INSERT INTO public.organizations (id, name, industry)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Inkloom AI Global', 'Enterprise Governance & Brand Safety')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, organization_id, name, email, password, role, department)
VALUES 
('11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'Alex Morgan', 'alex.creator@inkloom.ai', '$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO', 'creator', 'Content & Growth Marketing'),
('22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000001', 'Sarah Chen', 'sarah.brand@inkloom.ai', '$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO', 'brand-manager', 'Global Brand & Governance'),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000001', 'Marcus Vance', 'marcus.admin@inkloom.ai', '$2b$10$wht6YVrj1HuKEcyumITfZutyIHarI5BzFEIfYi8Fa.dAUPA.mXHAO', 'admin', 'System Architecture & Compliance')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.guidelines (id, organization_id, title, content, version)
VALUES ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Inkloom Brand Governance Codex', 'Enterprise policies for tone, claims, and terminology.', '2.4.0')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rules (id, guideline_id, rule_type, name, description, severity, pattern, replacement)
VALUES 
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'claim', 'Superlative Prohibitions', 'Unverified absolute claims are illegal under FTC compliance.', 'critical', '100% foolproof', 'enterprise-grade AI automation with verified high-availability'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'tone', 'Informal Hyperbole', 'Avoid informal hype slang in customer-facing press copy.', 'warning', 'super crazy fast', 'rapid zero-downtime')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.drafts (id, user_id, organization_id, title, content, channel, status)
VALUES ('d0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'Q4 Global Product Launch Announcement', 'Inkloom is the market''s only 100% foolproof AI automation platform with super crazy fast deployment for global brands.', 'Blog & Press', 'review_pending')
ON CONFLICT (id) DO NOTHING;

