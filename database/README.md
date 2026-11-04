# Relational Database Architecture: Inkloom AI (Project ECLIPSE)

Target Database: **PostgreSQL (Supabase)**  
Backend: **FastAPI / Node.js + Express / Next.js API Routes**  
Authentication: **JWT + bcrypt (cost factor 10)**  
Cloud Hosting: **Render / Supabase**

---

## 🗄️ Relational Schema Overview (9 Core Tables)

```
                        +----------------------+
                        |    organizations     |
                        +----------+-----------+
                                   | 1
                                   |
         +-------------------------+-------------------------+
         | *                                                 | *
+--------+--------+                                 +--------+--------+
|      users      |                                 |   guidelines    |
+--------+--------+                                 +--------+--------+
         | 1                                                 | 1
         |                                                   |
         | *                                                 | *
+--------+--------+                                 +--------+--------+
|     drafts      |                                 |      rules      |
+--------+--------+                                 +--------+--------+
         | 1
         +------------------------+-------------------------+
         | *                      | *                       | *
+--------+--------+      +--------+--------+       +--------+--------+
|    findings     |      |    comments     |       |    approvals    |
+-----------------+      +-----------------+       +-----------------+
```

### Table Specifications

| # | Table | Purpose | Primary Keys & Foreign Keys |
| :--- | :--- | :--- | :--- |
| 1 | **`organizations`** | Company information and branding settings | `id` (UUID PK), `branding_settings` (JSONB) |
| 2 | **`users`** | User profiles, passwords (bcrypt hash), and assigned roles | `id` (UUID PK), `organization_id` (FK -> `organizations.id`) |
| 3 | **`guidelines`** | Official brand documents and policies | `id` (UUID PK), `organization_id` (FK -> `organizations.id`) |
| 4 | **`rules`** | Tone, terminology, logo, accessibility and compliance rules | `id` (UUID PK), `guideline_id` (FK -> `guidelines.id`) |
| 5 | **`drafts`** | Uploaded text, documents and images for review | `id` (UUID PK), `user_id` (FK -> `users.id`), `organization_id` (FK) |
| 6 | **`findings`** | AI-generated issues detected during review | `id` (UUID PK), `draft_id` (FK -> `drafts.id`), `rule_id` (FK) |
| 7 | **`comments`** | Reviewer feedback and discussion | `id` (UUID PK), `draft_id` (FK -> `drafts.id`), `reviewer_id` (FK) |
| 8 | **`approvals`** | Approval status and workflow history | `id` (UUID PK), `draft_id` (FK -> `drafts.id`), `approved_by` (FK) |
| 9 | **`audit_logs`** | Tracks every action performed by users | `id` (UUID PK), `organization_id` (FK), `user_id` (FK) |

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Permission | Creator / Writer | Brand Manager | Administrator |
| :--- | :---: | :---: | :---: |
| **Upload content & create drafts** | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Edit own drafts** | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **View AI suggestions & diffs** | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Submit drafts for review** | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Approve content** | ❌ **Forbidden** | ✅ Allowed | ✅ Allowed |
| **Reject / Request Changes** | ❌ **Forbidden** | ✅ Allowed | ✅ Allowed |
| **Edit brand guidelines** | ❌ **Forbidden** | ✅ Allowed | ✅ Allowed |
| **Manage rules** | ❌ **Forbidden** | ✅ Allowed | ✅ Allowed |
| **Manage users & RBAC** | ❌ **Forbidden** | ❌ Forbidden | ✅ Allowed |
| **Create organizations** | ❌ **Forbidden** | ❌ Forbidden | ✅ Allowed |
| **Configure security guardrails** | ❌ **Forbidden** | ❌ Forbidden | ✅ Allowed |
| **Inspect immutable audit logs** | ❌ **Forbidden** | ❌ Forbidden | ✅ Allowed |

---

## 🛡️ Zero Data Retention & Security Architecture

1. **Zero Data Retention Principle:**
   - Raw creative copy is inspected ephemerally in transient application memory.
   - External LLMs/AI models are strictly forbidden from retaining training samples.
   - Text buffers are wiped immediately post-evaluation.
2. **End-to-End Cryptography:**
   - All client-server traffic strictly over TLS 1.3 / HTTPS.
   - Passwords hashed using standard `bcrypt` with cost factor 10.
   - JWT tokens signed with SHA-256 and rotated with 7-day refresh tokens.
3. **Database Security:**
   - Supabase / PostgreSQL Row-Level Security (RLS) policies on all 9 tables.
   - Immutable `audit_logs` table tracking IP addresses, timestamps, actor UUIDs, and payload deltas.

---

## 🚀 How to Apply to Supabase in 2 Minutes

### Method A: Supabase Web Console (1-Click)
1. Open your project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Click **SQL Editor** on the left menu.
3. Open [`database/supabase_migration.sql`](./supabase_migration.sql), copy everything, and click **Run**.
4. All 9 tables, indexes, triggers, and seed accounts will be instantly provisioned!

### Method B: CLI Migration
Set your `DATABASE_URL` in `.env.local`:
```bash
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```
Then execute:
```bash
node database/migrate.js
```

