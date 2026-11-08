# ECLIPSE Platform

> **The Intelligent Brand Governance, Fact Verification & Autonomous Content Correction Platform**  
> Powered by **React 19 + Vite + HTML5 + CSS (Tailwind) + SQLite3 (Offline) + MongoDB (Browser Documents) + Google Gemini Multimodal Vision & Reasoning**

---

## 1. Executive Summary & Architecture

**ECLIPSE** is an enterprise-grade multimodal AI content governance and editorial compliance platform. It provides a lightning-fast **React 19 + Vite web console** backed by a **100% offline local SQLite3 file database** and **client-side MongoDB document collections**, with zero cloud database credentials or external network dependencies required.

```
                                ┌─────────────────────────────────────────┐
                                │            ECLIPSE PLATFORM             │
                                └────────────────────┬────────────────────┘
                                                     │
                 ┌───────────────────────────────────┴───────────────────────────────────┐
                 ▼                                                                       ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     React 19 + Vite Console     │                                     │     Dual Database Architecture  │
│          (Port 3000)            │     Live Transactional Read/Write   │                                 │
│  - Author Studio (Vision + OCR) │ ──────────────────────────────────> │  - SQLite3 Offline File DB      │
│  - Brand Manager Review Queue   │ <────────────────────────────────── │    (database/governance.sqlite) │
│  - Security & Admin (RBAC)      │         Real-time Synchronized      │  - MongoDB Browser Store        │
│  - Governance Database Studio   │                                     │    (Collections & NoSQL engine) │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 2. AI Engineering Roadmap & Deliverables

| Round | Focus | Key Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Round 1 — Plan** | Foundation & Specification | RAG architecture specification, Gemini prompt schemas, Knowledge base design | **Completed** |
| **Round 2 — Build** | Governance Engine Core | Gemini integration, deterministic rule parser, fact verification, structured JSON audit | **Completed** |
| **Round 3 — Advanced** | Multimodal & Evaluation | Image analysis (OCR & OpenCV), accessibility checks, automated benchmark evaluation | **Ready for Stage 3** |

---

## 3. Five Core Engine Components (`ai-engine/`)

```
                      ┌─────────────────────────────────────────┐
                      │            ECLIPSE Engine            │
                      └────────────────────┬────────────────────┘
                                           │
         ┌───────────────────┬─────────────┴───────┬───────────────────┐
         ▼                   ▼                     ▼                   ▼
┌─────────────────┐ ┌─────────────────┐   ┌─────────────────┐ ┌─────────────────┐
│  Prompt Engine  │ │  RAG Retriever  │   │   Rule Parser   │ │  Fact Checker   │
│Controlled Gemini│ │Approved facts & │   │Exact prohibited │ │Evidence cross-  │
│ prompts & schema│ │ brand guidelines│   │ terminology scan│ │  referencing    │
└────────┬────────┘ └────────┬────────┘   └────────┬────────┘ └────────┬────────┘
         │                   │                     │                   │
         └───────────────────┴──────────┬──────────┴───────────────────┘
                                        ▼
                             ┌─────────────────────┐
                             │ JSON Audit Generator│
                             │ Conforms to Pydantic│
                             │    ReviewReport     │
                             └─────────────────────┘
```

1. **Prompt Engine (`ai-engine/app/prompt_engine.py`)**:
   - `create_review_prompt(content, brand_knowledge)`: Creates controlled instructions grounding Gemini to never invent evidence, cite approved fact IDs, and return structured JSON.
2. **Knowledge Retriever (`ai-engine/app/brand_retriever.py`)**:
   - RAG retrieval of approved brand guidelines ([`knowledge/brand_guidelines.json`](file:///c:/Users/Pratik/OneDrive/Desktop/ECLIPSE/ECLIPSE/ai-engine/knowledge/brand_guidelines.json)) and verified facts ([`knowledge/approved_facts.json`](file:///c:/Users/Pratik/OneDrive/Desktop/ECLIPSE/ECLIPSE/ai-engine/knowledge/approved_facts.json)).
3. **Rule Parser (`ai-engine/app/rule_parser.py`)**:
   - `check_prohibited_terms(content, prohibited_terms)`: Fast deterministic phrase scanner that runs completely independently of Gemini.
4. **AI Reviewer (`ai-engine/app/gemini_client.py`)**:
   - `generate_response(prompt)`: Powered by Google Gemini 3.5 Flash (`google-genai` SDK) with cascading multi-model failover under rate limits.
5. **JSON Audit Generator (`ai-engine/schemas/review_schema.py` & `ai-engine/app/review_engine.py`)**:
   - `review_brand_content(content, brand)`: Synthesizes rule findings, fact verification, and Gemini intelligence into a strongly-typed `ReviewReport`.

---

## 4. Frontend & Enterprise Governance Console

| Workspace | Route | Capabilities & Features |
| :--- | :--- | :--- |
| **1. Author Studio** | `/dashboard/author` | • **Multimodal Image & Poster Studio**: Real-time Gemini Vision OCR, WCAG 2.1 AA contrast ratio validation, and automated layout remediation.<br>• **Short-Form & Ad Copy Studio**: Real-time claim scanning against corporate fact bases.<br>• **Blog & Long-Form Studio**: Tone analyzer, superlative filter, and 1-click autonomous correction. |
| **2. Brand Manager Portal** | `/dashboard/brand-manager` | • **Pre-Publication Approval Queue**: Review submitted drafts, accept/reject with audit notes.<br>• **Tone & Voice Simulator**: Interactive brand radar calibration.<br>• **Brand Rulebook Catalog**: Create, toggle, and customize enterprise compliance rules.<br>• **Infraction Hotspots**: Analytics on recurring policy violations. |
| **3. Security & Admin** | `/dashboard/security` | • **Personnel Directory & RBAC**: Manage team members, workspace roles (Creator, Brand Manager, Administrator).<br>• **Privacy & AI Guardrails**: Cryptographic confidentiality shields and zero-data retention controls.<br>• **Immutable Audit Trail Ledger**: Cryptographically verified transaction logs. |
| **4. Database Studio** | `/dashboard/database` | • **Dual Engine Explorer**: Real-time SQLite3 tables alongside MongoDB document schemas.<br>• **Live Records Table**: Live search, pagination, and per-row delete actions.<br>• **+ Insert Record Modal**: Add real records into any table with automatic disk persistence.<br>• **SQL Query Playground**: Execute live arbitrary SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) directly on disk with preset helpers. |

---

## 5. Quick Start & Launching ECLIPSE

### 🚀 1-Click Launch with `start.bat` (Recommended on Windows)

Double-click or run from PowerShell:

```cmd
start.bat
```

**What `start.bat` automates:**
1. Checks and clears any stale process occupying port 3000.
2. Auto-verifies and seeds the local SQLite file database (`database/governance.sqlite`).
3. Resolves local Wi-Fi / LAN IP addresses for mobile and tablet testing.
4. Boots the Vite server and automatically opens Google Chrome to `http://localhost:3000`.

---

### ⚙️ Manual Command Line Setup

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Initialize the SQLite3 Database (Optional - auto-initialized on launch)
```bash
node scripts/init_sqlite.js
```

#### 3. Start Development Server
```bash
npm run dev
```

- **Local URL**: [http://localhost:3000](http://localhost:3000)
- **Database Studio**: [http://localhost:3000/dashboard/database](http://localhost:3000/dashboard/database)
- **Network / Wi-Fi**: Accessible to all devices on the same subnet (e.g. `http://192.168.x.x:3000`)

---

## 5. Dual Database Architecture

### 🗄️ SQLite 3 Local Disk Storage (`database/governance.sqlite`)
The project stores all relational data in a 100% offline SQLite file:
- `organizations`: Enterprise tenants, branding settings, and colors.
- `users`: User profiles, roles (`creator`, `brand-manager`, `admin`), and credentials.
- `guidelines`: Editorial charters, governance standards, and voice definitions.
- `rules`: Deterministic rule patterns, severity ratings, and automated replacements.
- `drafts`: Articles, social campaigns, and posters under review.
- `findings`: Flagged policy violations, WCAG issues, and remediation suggestions.
- `audit_logs`: Tamper-evident ledger of all publication and calibration actions.

### 🍃 MongoDB Browser Document Engine (`src/lib/mongoClient.ts`)
The client-side document store mirrors all operations using idiomatic MongoDB APIs:
```typescript
import { mongoClient } from "@/lib/mongoClient";

// Query documents
const users = await mongoClient.db.collection("users").find({ role: "admin" });

// Insert documents
await mongoClient.db.collection("drafts").insertOne({
  title: "Q4 Enterprise Roadmap",
  status: "review_pending",
  drift_score: 12
});

// Update & Delete
await mongoClient.db.collection("drafts").updateOne({ id: "d-001" }, { $set: { status: "approved" } });
await mongoClient.db.collection("users").deleteOne({ id: "u-04" });
```

---

## 7. Directory Structure

```
ECLIPSE/
├── start.bat                            # 1-click all-in-one Windows launcher
├── package.json                         # React 19 + Tailwind + Vite configuration
├── vite.config.ts                       # Vite server with integrated SQLite & MongoDB API engine
├── database/
│   └── governance.sqlite                # 100% offline local SQLite3 file database
├── scripts/
│   ├── init_sqlite.js                   # Schema migration & initial seed script
│   ├── prelaunch.js                     # Port cleaner & network endpoint resolver
│   └── run-server.js                    # Resilient auto-restarting Vite process manager
├── src/
│   ├── App.tsx                          # Universal client-side router & error boundaries
│   ├── main.tsx                         # React 19 entry point
│   ├── app/
│   │   ├── globals.css                  # Tailwind CSS styling and theme tokens
│   │   ├── page.tsx                     # Landing page & workspace redirects
│   │   ├── login/page.tsx               # 3-Persona authentication & workspace selector
│   │   └── dashboard/
│   │       ├── layout.tsx               # Persistent navigation shell & role sync
│   │       ├── author/page.tsx          # Author Studio (Vision OCR, Ad Copy, Blogs)
│   │       ├── brand-manager/page.tsx   # Brand Manager Portal (Queue, Rules, Radar)
│   │       ├── security/page.tsx        # Security & Admin (RBAC, Audit Ledger)
│   │       └── database/page.tsx        # Database Studio (Live Tables, CRUD, SQL Playground)
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.tsx               # Workspace Switcher dropdown & user info
│   │       └── DatabaseStatusBadge.tsx  # Dual Database Engine status pill
│   ├── lib/
│   │   ├── api.ts                       # Centralized Axios client & API interfaces
│   │   ├── db.ts                        # Dual database abstraction layer
│   │   └── mongoClient.ts               # Browser MongoDB collection & document driver
│   └── stores/
│       └── useAuthStore.ts              # Zustand authentication & active workspace store
└── README.md
```

---

## 7. Verification & Benchmark Evaluation

Run the evaluation test suite:

```bash
npm run preview
```

All 1,670+ modules compile cleanly into optimized ES modules ready for deployment.
