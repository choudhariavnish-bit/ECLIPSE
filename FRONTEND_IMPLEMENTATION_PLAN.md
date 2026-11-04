# Inkloom AI: Intelligent Brand-Governance Platform
## Frontend Implementation Plan & System Integration Guide

---

## 1. Executive Summary & Tech Stack Alignment

This document outlines the frontend architectural blueprint, component hierarchy, accessibility specifications, and end-to-end integration workflows (connecting AI, Backend, Database, and OCR) for the **Intelligent Brand-Governance Platform**.

### Prescribed Frontend Stack
* **Framework:** Next.js (React 18/19, App Router)
* **Styling:** Tailwind CSS (Semantic tokens, design system)
* **State Management:** Zustand (Audits, UI state) & React Context (Auth/Session)
* **Animations:** Framer Motion (Transitions, diff layout morphing, drawer slide-overs)
* **Icons:** Lucide React / Heroicons
* **Forms & Validation:** React Hook Form + Zod
* **API Communication:** Axios (Base client & interceptors) + Fetch API (ReadableStream for SSE)
* **Accessibility:** WCAG 2.1 AA Compliance, ARIA Live Regions, full keyboard navigation

---

## 2. Frontend Project Structure (Next.js App Router)

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                     # Sidebar, header, team switcher, role gate
│   │   ├── page.tsx                       # High-level overview & recent governance audits
│   │   ├── guidelines/
│   │   │   ├── page.tsx                   # Tone of voice, facts library, terminology
│   │   │   └── [category]/page.tsx
│   │   ├── inspect/
│   │   │   ├── new/page.tsx               # Content submission (text, doc, image upload)
│   │   │   └── [reviewId]/page.tsx        # Split-screen inspection & diff workspace
│   │   ├── workflows/
│   │   │   └── page.tsx                   # Role-based review queue (Creator / Reviewer)
│   │   ├── assets/                        # Approved brand asset library (logos, palettes)
│   │   └── insights/                      # Analytics on recurring mistakes & rule hotspots
│   └── api/                               # Next.js BFF (Backend For Frontend) proxy routes
├── components/
│   ├── ui/                                # Accessible atoms (Modal, Drawer, Tooltip, Badge)
│   ├── editor/                            # Text input, markdown, canvas preview, dropzone
│   ├── inspector/                         # Flagged findings, explainability cards, diff viewer
│   ├── workflow/                          # Approval timeline, audit trails, comment threads
│   └── analytics/                         # Visual charts for violation frequency & tone drifts
├── stores/
│   ├── useGovernanceStore.ts              # Inspection state, flagged issues, filters
│   ├── useWorkflowStore.ts                # Review status, role assignments, history
│   └── useBrandGuidelinesStore.ts         # Brand identity facts, tone configs
├── hooks/
│   ├── useStreamAudit.ts                  # Server-Sent Events (SSE) streaming for AI feedback
│   ├── useFileProcessor.ts                # Validation, OCR bounding coordinate calculations
│   └── useA11yAnnounce.ts                 # Screen reader live region announcements
├── services/
│   ├── apiClient.ts                       # Axios client with bearer token & error handling
│   ├── auditService.ts                    # Content audit & AI validation endpoints
│   ├── ocrService.ts                      # Document parsing & OCR extraction endpoints
│   └── workflowService.ts                 # Comments, sign-offs, revision history
└── types/
    ├── governance.ts                      # Issues, guidelines, suggestions, citations
    └── workflow.ts                        # Roles, statuses, audit history
```

---

## 3. Core Frontend Functional Modules

### 3.1 Guideline & Brand Knowledge Hub (`/guidelines`)
* **Components:**
  * `ToneMatrixEditor`: Sliders/selectors for formality, enthusiasm, technical level, humor.
  * `TerminologyGlossary`: Searchable "Preferred Terms" vs "Prohibited Terms" with context rules.
  * `ApprovedClaimsRepository`: Verified corporate stats, product benchmark figures, certifications.
* **Form Handling:** Managed via `react-hook-form` and validated against strict Zod schemas.

### 3.2 Multi-Format Ingestion & OCR Preview (`/inspect/new`)
* **Supported Formats:** Markdown/Plain Text, PDF documents, Office files (DOCX), and Marketing Creatives (PNG/JPEG/WebP).
* **Dropzone:** Drag-and-drop file uploader with real-time MIME-type and size checks.
* **OCR Canvas Preview:**
  * Displays original uploaded document/banner with interactive SVG bounding boxes overlaid on recognized text.
  * Clicking an OCR box highlights the corresponding editable text line in the sync editor.

### 3.3 Split-Screen Governance Inspector (`/inspect/[reviewId]`)
The centerpiece of the platform, balancing automation with human editorial control.

```
+-------------------------------------------------------------+------------------------------------------------------------+
| LEFT PANE: Content Workspace                                | RIGHT PANE: Findings & Explainability                      |
|                                                             |                                                            |
|  "Our product offers 100% foolproof AI security [FLAGGED]   |  [!] Critical Issue: Unsupported Claim                     |
|   for fast-growing teams."                                  |  Source: Prohibited Claims Guide (Sec 4.2)                 |
|                                                             |  "Never use absolute superlative guarantees."              |
|                                                             |                                                            |
|                                                             |  Suggested Correction:                                     |
|                                                             |  [- 100% foolproof AI security -]                          |
|                                                             |  {+ enterprise-grade AI protection +}                      |
|                                                             |                                                            |
|                                                             |  [ Accept ]  [ Reject ]  [ View Guideline ]                |
+-------------------------------------------------------------+------------------------------------------------------------+
```

* **Color-Coded Severity Highlights:**
  * **Red (Critical):** Unsupported legal/financial claims, prohibited competitor terms.
  * **Amber (Warning):** Tone-of-voice drift, non-inclusive language, passive voice.
  * **Blue (Information):** Style recommendations, terminology upgrade suggestions.
  * **Purple (Visual/A11y):** Inadequate color contrast, missing image alt-text, off-brand logo usage.
* **Explainability Card:**
  * Displays the precise reason why the item was flagged.
  * Hyperlinks directly to the exact brand guideline or verified knowledge source.
  * Side-by-side or inline word diff showing suggested substitutions.
  * Human-in-the-loop control buttons: `Accept`, `Reject with Reason`, `Keep Original`.

### 3.4 Role-Based Review & Approval Workflow (`/workflows`)
* **Role Views:**
  * **Creators:** View active flags, apply AI suggestions, submit for human sign-off.
  * **Brand Managers / Compliance Officers:** Request changes, approve content, apply mandatory override justifications.
* **Audit Trail & Revision History:**
  * Timeline panel detailing who made each change, which AI suggestions were accepted/rejected, and reviewer approvals.
  * Exportable audit certificate for compliance tracking.

### 3.5 Governance Insights & Trends (`/insights`)
* Visual dashboard tracking:
  * Top 5 most violated brand rules across the organization.
  * Departments or content teams with highest compliance scores.
  * "Guideline Ambiguity Index" to pinpoint guidelines frequently overridden by human reviewers.

---

## 4. State Management & Form Handling Architecture

### 4.1 Zustand Store Architecture (`useGovernanceStore.ts`)
```typescript
import { create } from 'zustand';

export interface BrandIssue {
  id: string;
  category: 'tone' | 'claim' | 'terminology' | 'visual' | 'a11y';
  severity: 'critical' | 'warning' | 'info';
  sourceSpan: { start: number; end: number };
  detectedText: string;
  explanation: string;
  guidelineReference: string;
  suggestedFix: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface GovernanceState {
  rawContent: string;
  activeIssues: BrandIssue[];
  selectedIssueId: string | null;
  isAuditing: boolean;
  setContent: (content: string) => void;
  setIssues: (issues: BrandIssue[]) => void;
  appendIssue: (issue: BrandIssue) => void;
  selectIssue: (id: string | null) => void;
  resolveIssue: (id: string, action: 'accepted' | 'rejected') => void;
  resetAudit: () => void;
}

export const useGovernanceStore = create<GovernanceState>((set) => ({
  rawContent: '',
  activeIssues: [],
  selectedIssueId: null,
  isAuditing: false,
  setContent: (content) => set({ rawContent: content }),
  setIssues: (issues) => set({ activeIssues: issues }),
  appendIssue: (issue) => set((s) => ({ activeIssues: [...s.activeIssues, issue] })),
  selectIssue: (id) => set({ selectedIssueId: id }),
  resolveIssue: (id, action) =>
    set((s) => ({
      activeIssues: s.activeIssues.map((issue) =>
        issue.id === id ? { ...issue, status: action } : issue
      ),
    })),
  resetAudit: () => set({ activeIssues: [], selectedIssueId: null, isAuditing: false }),
}));
```

### 4.2 React Hook Form with Zod Validation
* Forms for defining tone profiles, terminology constraints, and review submissions.
* Ensures validation runs client-side with zero unnecessary backend roundtrips.

---

## 5. Accessibility (WCAG 2.1 AA) & Design Specifications

* **Color Contrast:** Minimum 4.5:1 ratio for body text and 3:1 for graphical UI components. All severity levels have distinct shapes/icons alongside color.
* **ARIA Live Regions:**
  * When AI finishes an audit or streams new findings, an invisible live region announces:
    `<div role="status" aria-live="polite" className="sr-only">Audit complete. 3 warnings and 1 critical issue detected.</div>`
* **Focus Management:**
  * Selecting a finding card automatically scrolls and shifts focus to the highlighted text span in the editor.
* **Keyboard Shortcuts:**
  * `Alt + J` / `Alt + K`: Navigate to next / previous issue.
  * `Alt + A`: Accept currently focused suggestion.
  * `Alt + R`: Reject suggestion.
  * `Escape`: Close explainability panel.

---

## 6. End-to-End System Integration Blueprint

```
+-----------------------------------------------------------------------------------------+
|                                    NEXT.JS FRONTEND                                     |
|                                                                                         |
|  [ Content / Asset Input ]  -->  [ Dropzone / OCR Viewer ]  -->  [ Split Inspector ]   |
+-------------+---------------------------------+---------------------------+-------------+
              |                                 |                           |
        (1) Upload Asset                  (2) Stream Analysis         (3) Submit & Sign-off
              |                                 |                           |
              v                                 v                           v
+-----------------------------+   +-----------------------------+   +---------------------+
|      Backend REST API       |   |      AI / RAG Pipeline      |   | Database & History  |
| - Pre-signed S3 URL         |   | - Brand Rule Vector Search  |   | - PostgreSQL/Prisma |
| - Auth & Role Check (JWT)   |   | - Tone & Fact Verification  |   | - Audit Trail Log   |
| - Cloud Storage (S3/GCS)    |   | - Diff & Rationale Gen      |   | - WebSocket sync    |
+-------------+---------------+   +-----------------------------+   +---------------------+
              |                                 ^
              v                                 |
+-----------------------------+                 |
|         OCR Service         | ----------------+ (Extracted Text & Bounding Boxes)
| (AWS Textract / Tesseract)  |
+-----------------------------+
```

### Step 1: Connecting File Ingestion & OCR
1. **Frontend Request:** Creator drops a promotional banner (image) or whitepaper (PDF).
2. **Direct Cloud Storage Upload:** Frontend requests a pre-signed URL via Axios (`POST /api/upload-url`) and uploads directly to secure object storage.
3. **OCR Processing:**
   * Frontend triggers `POST /api/ocr/extract` passing the file reference.
   * Backend invokes OCR (e.g., AWS Textract or Tesseract) and returns:
     ```json
     {
       "fullText": "Revolutionary AI with 100% Guaranteed Uptime",
       "blocks": [
         { "text": "Revolutionary AI", "bbox": [10, 20, 150, 40] },
         { "text": "100% Guaranteed Uptime", "bbox": [10, 65, 220, 40] }
     ]
     }
     ```
4. **Interactive Mapping:** Next.js renders the source image on an HTML5 `<canvas>` and creates interactive bounding hover highlights that bind directly to extracted text segments.

### Step 2: Connecting the AI Governance Engine (LLM + RAG)
1. **Triggering Audit:** Frontend sends content, selected channel (e.g., Blog, Ad, Press Release), and target audience to `/api/governance/analyze`.
2. **Server-Sent Events (SSE) Streaming:**
   * Instead of waiting for full evaluation, the frontend opens an event stream using `fetch()` and `ReadableStream`.
   * **Chunk 1:** Overall tone alignment score and high-level summary.
   * **Chunk 2..N:** Individual issues as they are matched against the vector database of brand guidelines.
3. **Structured Response Contract:**
   ```json
   {
     "id": "iss_789",
     "category": "claim",
     "severity": "critical",
     "detectedText": "100% Guaranteed Uptime",
     "explanation": "Absolute uptime claim violates technical disclaimer standards.",
     "guidelineReference": "Engineering & Brand SLA Standards - Section 2.1",
     "suggestedFix": "Designed for 99.9% high availability",
     "sourceSpan": { "start": 17, "end": 39 }
   }
   ```
4. **Client Render:** As each event arrives, `useGovernanceStore` appends the issue and Framer Motion animates the finding card into view.

### Step 3: Connecting the Database & Approval Workflow
1. **State Persistence:**
   * Applying a suggestion updates the editor text and sets issue status to `accepted`.
   * Clicking **"Submit for Review"** dispatches `POST /api/reviews/{id}/submit` containing the modified text, diff delta, and review status to PostgreSQL.
2. **Role-Based Gates (RBAC):**
   * Next.js middleware and layout checks current user role:
     * **Creators:** Edit content, resolve flags, submit for review.
     * **Reviewers/Brand Managers:** Approve, request revisions with inline contextual comments, trigger bypass overrides.
3. **Real-Time Collaboration:**
   * Reviewer adds an inline comment $\rightarrow$ pushed over WebSocket/Supabase Realtime $\rightarrow$ Author's screen immediately displays the comment marker without page reload.
4. **Audit Trail Logging:**
   * Every override or modification is written to an immutable audit table in PostgreSQL (`review_id`, `actor_id`, `action`, `justification`, `timestamp`) for complete corporate accountability.

---

## 7. Phased Implementation Roadmap

| Phase | Milestone | Core Deliverables |
| :--- | :--- | :--- |
| **Phase 1** | **Foundations & Brand Hub** | Next.js App Router setup, Tailwind theme, Brand Guideline definition forms with `react-hook-form`, Approved Asset Gallery. |
| **Phase 2** | **Ingestion & OCR Integration** | File dropzone, cloud storage direct upload, OCR bounding box canvas overlay, editable text extraction preview. |
| **Phase 3** | **AI Governance Inspector** | Split-screen workspace, SSE streaming hook (`useStreamAudit`), inline text highlighting, explainability cards with Framer Motion diffs. |
| **Phase 4** | **Human Review & Approvals** | Role-based review dashboard, real-time comment threads, approval/rejection workflows, PostgreSQL audit logs. |
| **Phase 5** | **Analytics & A11y Polish** | Guideline violation trends dashboard, WCAG 2.1 AA screen reader audit (ARIA live regions), keyboard navigation shortcuts. |

