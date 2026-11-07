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

## 2. Key Technology Stack

- **Frontend**: Pure **React 19**, **HTML5**, **Tailwind CSS v3.4**, and **Vite v8** (completely replacing Next.js for high performance and universal device compatibility).
- **Offline Local Database**: **SQLite 3** (`database/governance.sqlite`) using Node.js native `DatabaseSync` — zero cloud logins, zero DNS lookups, zero latency.
- **Browser Document Store**: **MongoDB** (`src/lib/mongoClient.ts`) providing standard driver APIs (`find()`, `insertOne()`, `updateOne()`, `deleteOne()`) with persistent browser storage.
- **AI Multimodal Core**: Google Gemini 2.0 Flash Vision (OCR text extraction, WCAG 2.1 AA visual contrast inspection, brand guidelines verification, autonomous copy correction).
- **Cross-Device Ready**: Binds to `0.0.0.0:3000`, allowing instant access on PCs, Macs, iPads, and mobile devices connected to the same Wi-Fi.

---

## 3. Four Core Workspaces & Dashboards

| Workspace | Route | Capabilities & Features |
| :--- | :--- | :--- |
| **1. Author Studio** | `/dashboard/author` | • **Multimodal Image & Poster Studio**: Real-time Gemini Vision OCR, WCAG 2.1 AA contrast ratio validation, and automated layout remediation.<br>• **Short-Form & Ad Copy Studio**: Real-time claim scanning against corporate fact bases.<br>• **Blog & Long-Form Studio**: Tone analyzer, superlative filter, and 1-click autonomous correction. |
| **2. Brand Manager Portal** | `/dashboard/brand-manager` | • **Pre-Publication Approval Queue**: Review submitted drafts, accept/reject with audit notes.<br>• **Tone & Voice Simulator**: Interactive brand radar calibration.<br>• **Brand Rulebook Catalog**: Create, toggle, and customize enterprise compliance rules.<br>• **Infraction Hotspots**: Analytics on recurring policy violations. |
| **3. Security & Admin** | `/dashboard/security` | • **Personnel Directory & RBAC**: Manage team members, workspace roles (Creator, Brand Manager, Administrator).<br>• **Privacy & AI Guardrails**: Cryptographic confidentiality shields and zero-data retention controls.<br>• **Immutable Audit Trail Ledger**: Cryptographically verified transaction logs. |
| **4. Database Studio** | `/dashboard/database` | • **Dual Engine Explorer**: Real-time SQLite3 tables alongside MongoDB document schemas.<br>• **Live Records Table**: Live search, pagination, and per-row delete actions.<br>• **+ Insert Record Modal**: Add real records into any table with automatic disk persistence.<br>• **SQL Query Playground**: Execute live arbitrary SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) directly on disk with preset helpers. |

---

## 4. Quick Start & Launching ECLIPSE

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

## 6. Directory Structure

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

## 7. Verification & Production Build

Build for production verification:

```bash
npm run build
```

Preview production bundle:

```bash
npm run preview
```

All 1,670+ modules compile cleanly into optimized ES modules ready for deployment.
