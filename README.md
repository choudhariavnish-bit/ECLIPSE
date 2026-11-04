# Inkloom AI — Intelligent Brand-Governance Platform
### Project ECLIPSE

> **Prevent brand inconsistency, factual errors, and tone drift before content goes live.**  
> An intelligent pre-publication governance platform that verifies content against approved brand guidelines, facts, tone policies, and visual standards across diverse content channels.

---

## 📌 Problem Statement

Growing organisations publish content through multiple employees, external marketing agencies, and generative AI tools. This velocity makes it increasingly difficult to maintain a consistent, trustworthy brand identity. 

* **The Risk:** Incorrect claims, outdated information, inconsistent language, off-brand visuals, and accessibility violations damage credibility before anyone notices the problem.
* **The Solution:** Rather than simply rejecting content, **Inkloom AI** audits content pre-publication, explains each flagged issue against approved source material, suggests constructive corrections that preserve the creator's purpose, and enables structured collaboration between creators and brand managers.

---

## 🚀 Key Features

* **Pre-Publication Automated Brand Check**: Real-time evaluation of tone, terminology, messaging, visual consistency, accessibility (WCAG AA), and unsupported promotional claims.
* **Explainable AI Suggestions**: Every flag provides a rationale, cites the exact rule from the brand guideline book, and offers an inline replacement diff.
* **Collaborative Review & Approval Pipeline**: Creators submit drafts; authorized Brand Managers review findings, request revisions, or issue sign-offs with compliance notes.
* **Confidentiality & Data Protection Guardrails**: Automatic PII and internal secret masking to protect confidential brand assets with zero external data retention.
* **Governance Insights & Recurring Violations Tracker**: Pinpoints guidelines that creators frequently violate or find ambiguous, allowing continuous brand refinement.
* **Multi-Format Ingestion**: Supports raw text, markdown, marketing graphics, and documents with OCR text & bounding box extraction.

---

## 👥 Three Dedicated Persona Dashboards

The platform includes a dedicated **3-option login portal** with active workspace switching:

| Persona | Core Workspace | Key Responsibilities |
| :--- | :--- | :--- |
| **1. Creator / Writer** | `/dashboard/creator` | • Instant pre-flight brand check sandbox<br>• 1-click **Apply Correction** diffs<br>• Approved terminology glossary ("Do Use" vs "Do Not Use")<br>• Reviewer feedback & sign-off submission |
| **2. Brand Manager** | `/dashboard/brand-manager` | • Pre-publication review queue across blogs, social & PDFs<br>• One-click **Approve** or **Request Revision** with audit notes<br>• Tone & Voice sliders (Formality, Boldness, Empathy)<br>• Guideline ambiguity & violation hotspot tracking |
| **3. Administrator** | `/dashboard/admin` | • System-wide governance metrics & audit stats<br>• Role-Based Access Control (RBAC) user management<br>• AI & OCR pipeline calibration (model selector, sensitivity)<br>• Confidentiality Shield (PII redaction & AI disclosure)<br>• Cryptographically verifiable immutable audit logs |

---

## 🛠️ Technology Stack

* **Framework:** [Next.js](https://nextjs.org/) (React 19, App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Semantic brand design system)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Decoupled, reactive audit & auth stores)
* **Animations:** [Framer Motion](https://www.framer.com/motion/) (Smooth diff morphing & transitions)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Forms & Validation:** [React Hook Form](https://react-hook-form.com/)
* **API Communication:** Axios & Fetch API (SSE streaming support)
* **Accessibility:** WCAG 2.1 AA Compliance, ARIA Live Regions, full keyboard shortcuts

---

## ⚡ Quick Start & Running the Project

### Option A: 1-Click Launch with `s.bat` (Recommended)

Simply double-click [`s.bat`](./s.bat) or execute it in your terminal:

```cmd
s
```

**What `s.bat` does automatically:**
1. Verifies dependencies and auto-installs them if missing.
2. Starts the server bound to `0.0.0.0` (accessible from any device on your Wi-Fi/Hotspot).
3. **Always opens Google Chrome** directly to `http://localhost:3000`.
4. Launches a **zero-config public tunnel** (`localtunnel`) so external devices on cellular data (4G/5G) or remote networks can access the platform without needing a central server or port forwarding.

---

### Option B: Manual Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

3. **Open in Browser:**
   Navigate to [`http://localhost:3000`](http://localhost:3000).

4. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🌐 Multi-Device & Cross-Network Access (No Server Needed)

* **Local Machine:** Open `http://localhost:3000` in Google Chrome.
* **Devices on Same Network:** Open `http://<YOUR-IP-ADDRESS>:3000` from any mobile phone or tablet on the same Wi-Fi.
* **Remote Devices on Any Network:** Use the companion tunnel link (e.g. `https://xxxx.loca.lt`) launched by `s.bat` to access the application from any cellular device anywhere in the world.

---

## 📂 Project Structure

```text
├── s.bat                                # 1-click launcher (Chrome auto-open + tunnel)
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Global application shell
│   │   ├── page.tsx                     # Smart redirect to active role dashboard
│   │   ├── globals.css                  # Tailwind styles
│   │   ├── login/page.tsx               # 3-Option Role Selection & Login Portal
│   │   └── dashboard/
│   │       ├── layout.tsx               # Shared dashboard layout (Navbar + Sidebar)
│   │       ├── creator/page.tsx         # Creator / Writer Studio
│   │       ├── brand-manager/page.tsx   # Brand Manager Governance Console
│   │       └── admin/page.tsx           # Enterprise Admin & Security Suite
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.tsx               # Header with quick persona switcher dropdown
│   │       └── Sidebar.tsx              # Role-aware contextual navigation
│   ├── stores/
│   │   └── useAuthStore.ts              # Zustand authentication & role state
│   ├── types/
│   │   └── auth.ts                      # Role interfaces & user schemas
│   └── lib/
│       └── utils.ts                     # Utility helpers (clsx, twMerge)
├── tailwind.config.ts                   # Brand color extensions
└── tsconfig.json                        # TypeScript configuration
```

---

## 🔒 Confidentiality & AI Disclosure Notice

Inkloom AI enforces a strict zero-retention policy for proprietary brand guidelines, unreleased trademarks, and confidential marketing materials. All AI inspections disclose guideline citation references without persisting raw author content to external model providers.
