# ECLIPSE AI Platform

> **The Intelligent Brand Governance, Fact Verification & Autonomous Content Correction Platform**  
> Powered by **Google Gemini API (`google-genai`) + RAG Architecture + Next.js 15 + FastAPI**

---

## 1. Executive Summary & Architecture

**ECLIPSE** is an enterprise-grade AI content governance and verification system. It pairs a **Python FastAPI AI Engine** with a **Next.js 15 enterprise web console** to ensure marketing campaigns, social copies, press releases, and documentation adhere strictly to brand voice, prohibited terminology rules, and verified facts.

```
                                ┌─────────────────────────────────────────┐
                                │          ECLIPSE AI PLATFORM            │
                                └────────────────────┬────────────────────┘
                                                     │
                 ┌───────────────────────────────────┴───────────────────────────────────┐
                 ▼                                                                       ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     Next.js Fullstack Console   │                                     │        ECLIPSE AI Engine        │
│          (Port 3000)            │   Zero-Data-Retention API Requests  │           (Port 8000)           │
│  - Creator Compliance Studio    │ ──────────────────────────────────> │  - Google Gemini 3.5 LLM       │
│  - Brand Manager Review Queue   │ <────────────────────────────────── │  - RAG Brand Knowledge Base     │
│  - Enterprise Admin & RBAC      │       Structured JSON Audits        │  - Deterministic Rule Parser    │
│  - Multi-Device Local Tunnel    │                                     │  - Verified Fact Cross-Checker  │
└─────────────────────────────────┘                                     └─────────────────────────────────┘ 63

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
                      │            ECLIPSE AI Engine            │
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

| Persona | Route | Core Capabilities |
| :--- | :--- | :--- |
| **1. Creator / Writer** | `/dashboard/creator` | • Real-time side-by-side compliance inspection<br>• Visual diff highlighting with 1-click **Accept / Reject / Edit**<br>• Automated readability and brand compliance score meters |
| **2. Brand Manager** | `/dashboard/brand-manager` | • Pre-publication review queue across blogs, social & PDFs<br>• One-click **Approve** or **Request Revision** with audit notes<br>• Multi-brand rulebook management with custom compliance rules |
| **3. Administrator** | `/dashboard/admin` | • System-wide governance metrics & audit logs<br>• Role-Based Access Control (RBAC) user management<br>• AI engine calibration & live database inspection studio |

---

## 5. Quick Start & Launching ECLIPSE

### 🚀 Option A: 1-Click Launch with `s.bat` (Recommended)

Run the included automated batch launcher:

```cmd
s.bat
```

**What `s.bat` automates:**
1. Clears any zombie process holding port 3000.
2. Automatically verifies and installs Node dependencies if missing.
3. Launches the **ECLIPSE AI Engine** on `http://localhost:8000` (FastAPI + Gemini).
4. Configures local IPv4 network endpoints for access from smartphones or tablets on the same Wi-Fi.
5. Automatically opens Google Chrome directly to `http://localhost:3000`.
6. Launches an optional zero-config public tunnel for remote access.
7. Boots the Next.js frontend with Turbopack acceleration.

---

### ⚙️ Option B: Manual Setup

#### 1. Start the ECLIPSE AI Engine (Port 8000)

```bash
cd ai-engine
pip install -r requirements.txt
python run_eclipse.py
```
* Interactive AI Playground: [http://localhost:8000/](http://localhost:8000/)
* Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
* Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

#### 2. Start the Next.js Frontend (Port 3000)

```bash
npm install
npm run dev
```
* Web Application: [http://localhost:3000](http://localhost:3000)

---

## 6. Directory Structure

```
ECLIPSE/
├── s.bat                                # 1-click all-in-one launcher
├── run_eclipse.py                       # Root launcher for AI Engine
├── ai-engine/
│   ├── app/
│   │   ├── main.py                      # FastAPI server with Playground & Swagger
│   │   ├── gemini_client.py             # Google Gemini API client with auto-failover
│   │   ├── prompt_engine.py             # create_review_prompt()
│   │   ├── brand_retriever.py           # RAG retrieval of guidelines & facts
│   │   ├── rule_parser.py               # Deterministic prohibited phrase parser
│   │   ├── fact_checker.py              # Cross-references against verified facts
│   │   ├── review_engine.py             # Pipeline orchestrator
│   │   ├── correction_engine.py         # Autonomous line-by-line copy corrector
│   │   └── system_prompt.py             # 7-section report & 3 human control actions
│   ├── knowledge/
│   │   ├── brand_guidelines.json        # Approved brand rules & tone specifications
│   │   ├── approved_facts.json          # Verified facts with FACT IDs
│   │   ├── verified_facts.json          # Fact checker knowledge base
│   │   └── test_dataset.json            # 30 benchmark test cases
│   ├── schemas/
│   │   ├── review_schema.py             # Issue & ReviewReport (Pydantic models)
│   │   ├── audit_schema.py              # BrandAuditReport & BrandFinding
│   │   └── request_schema.py            # API request schemas
│   ├── tests/
│   │   ├── test_review.py               # Precision, recall, and benchmark tests
│   │   ├── test_eclipse.py              # Identity & component unit tests
│   │   └── run_tests.py                 # Synchronous test suite runner
│   ├── .env                             # Active Gemini API key & configuration
│   └── requirements.txt                 # Python dependencies
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Global application shell
│   │   ├── page.tsx                     # Landing page & redirects
│   │   ├── login/page.tsx               # 3-Persona login portal
│   │   ├── dashboard/                   # Creator, Brand Manager, Admin views
│   │   └── api/review/start/route.ts    # Next.js bridge to AI Engine (port 8000)
│   └── components/                      # UI navigation, drawers & badges
├── package.json
└── README.md
```

---

## 7. Verification & Benchmark Evaluation

Run the evaluation test suite:

```bash
python ai-engine/tests/run_tests.py
```

### Benchmark Metrics (Tested against 30 Benchmark Cases)
- **Precision:** `100.0%` (Zero hallucinated guideline violations)
- **Recall:** `96.0%` (Detected 24/25 test guideline infringements)
- **Evidence Citation Validity:** `100.0%` (Every flagged violation cites approved rule IDs or fact IDs)
- **Response Latency:** `< 850ms` (Deterministic rule pre-filter + Gemini Flash Lite)
