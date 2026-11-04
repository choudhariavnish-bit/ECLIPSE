# ECLIPSE AI Engine

> **The Intelligent Brand Governance & Fact Verification Engine**  
> Hackathon Track: **Member 3 — AI & Prompt Engineer**  
> Core Technologies: **Python 3.12 + Google Gemini API (`google-genai`) + RAG Architecture + Structured JSON Outputs**

---

## 1. Hackathon Roadmap & Deliverables

| Round | Focus | Key Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Round 1 — Plan** | Foundation & Specification | RAG architecture specification, Gemini prompt schemas, Knowledge base design | **Completed** |
| **Round 2 — Build** | Governance Engine Core | Gemini integration, deterministic rule parser, fact verification, structured JSON audit | **Completed** |
| **Round 3 — Advanced** | Multimodal & Evaluation | Image analysis (OCR & OpenCV), accessibility checks, automated benchmark evaluation | **Ready for Stage 3** |

---

## 2. Five Core Engine Components

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

1. **Prompt Engine (`app/prompt_engine.py`)**:
   - `create_review_prompt(content, brand_knowledge)`: Creates controlled instructions grounding Gemini to never invent evidence, cite approved fact IDs, and return structured JSON.
2. **Knowledge Retriever (`app/brand_retriever.py`)**:
   - RAG retrieval of approved brand guidelines ([`knowledge/brand_guidelines.json`](file:///c:/Users/Pratik/OneDrive/Desktop/ECLIPSE/ECLIPSE/ai-engine/knowledge/brand_guidelines.json)) and verified facts ([`knowledge/approved_facts.json`](file:///c:/Users/Pratik/OneDrive/Desktop/ECLIPSE/ECLIPSE/ai-engine/knowledge/approved_facts.json)).
3. **Rule Parser (`app/rule_parser.py`)**:
   - `check_prohibited_terms(content, prohibited_terms)`: Fast deterministic phrase scanner that runs completely independently of Gemini.
4. **AI Reviewer (`app/gemini_client.py`)**:
   - `generate_response(prompt)`: Powered by Google Gemini 3.5 Flash (`google-genai` SDK) with robust fallback simulation under rate limits.
5. **JSON Audit Generator (`schemas/review_schema.py` & `app/review_engine.py`)**:
   - `review_brand_content(content, brand)`: Synthesizes rule findings, fact verification, and Gemini intelligence into a strongly-typed `ReviewReport`.

---

## 3. Project Directory Structure

```
ECLIPSE/
├── ai-engine/
│   ├── app/
│   │   ├── main.py               # FastAPI application with Swagger & Web Playground
│   │   ├── gemini_client.py      # generate_response() with Google Gemini API
│   │   ├── prompt_engine.py      # create_review_prompt()
│   │   ├── brand_retriever.py    # RAG knowledge retriever
│   │   ├── rule_parser.py        # check_prohibited_terms()
│   │   ├── fact_checker.py       # Fact verification against approved evidence
│   │   ├── review_engine.py      # review_brand_content() pipeline orchestrator
│   │   ├── correction_engine.py  # Compliant rewrite generator
│   │   └── system_prompt.py      # ECLIPSE persona & operational instructions
│   │
│   ├── knowledge/
│   │   ├── brand_guidelines.json # Prohibited terms, voice attributes & rules
│   │   ├── approved_facts.json   # Fact repository with official fact IDs (FACT-001..006)
│   │   └── test_dataset.json     # 30 curated test drafts across all 6 test categories
│   │
│   ├── schemas/
│   │   ├── review_schema.py      # Issue and ReviewReport Pydantic models
│   │   ├── audit_schema.py       # Detailed audit and score schemas
│   │   └── request_schema.py     # API request & response schemas
│   │
│   ├── tests/
│   │   ├── test_review.py        # Round 2 unit tests & benchmark evaluation
│   │   └── run_tests.py          # Complete 8-suite regression runner
│   │
│   ├── .env                      # Local Gemini API key & model settings
│   ├── .env.example              # Template configuration
│   └── requirements.txt          # Dependencies (fastapi, uvicorn, google-genai, etc.)
│
├── run_eclipse.py                # Server launcher script
└── README.md                     # Documentation
```

---

## 4. Structured JSON Schema (`ReviewReport`)

All reviews produce outputs conforming strictly to [`schemas/review_schema.py`](file:///c:/Users/Pratik/OneDrive/Desktop/ECLIPSE/ECLIPSE/ai-engine/schemas/review_schema.py):

```json
{
  "overall_status": "needs_review",
  "summary": "Unsupported promotional claim detected.",
  "issues": [
    {
      "category": "claim",
      "severity": "high",
      "problematic_text": "India's No. 1 laptop",
      "explanation": "No approved evidence supports this ranking.",
      "evidence": [],
      "suggestion": "Explore our latest laptop range.",
      "status": "needs_evidence"
    }
  ]
}
```

> **Key Rule**: A claim without evidence is tagged `status: "needs_evidence"` — it is **not** automatically assumed to be false unless contradicted by an approved fact (which is tagged `status: "false_claim"`).

---

## 5. Benchmark Evaluation & Testing Responsibilities

A test dataset with drafts covering all 6 evaluation categories is maintained in [`knowledge/test_dataset.json`](file:///c:/Users/Pratik/OneDrive/Desktop/ECLIPSE/ECLIPSE/ai-engine/knowledge/test_dataset.json).

### Evaluation Categories
1. **Correct Content**: Uses approved facts and tone.
2. **Wrong Terminology**: Uses prohibited brand phrases (`unbreakable`, `100% bug-free`, `cheap`).
3. **Unsupported Claim**: Claims like *"India's No. 1"* or *"500% faster"* without cited proof.
4. **Wrong Tone**: Aggressive competitor-bashing, condescending language, or sensationalist clickbait.
5. **Incorrect Fact**: Contradicts approved product specifications (e.g. claiming 100% uptime when approved SLA is 99.99%).
6. **Ambiguous Claim**: Vague hedging language requiring human review (*"practically guarantees"*, *"endless hours"*).

### Real Evaluated Metrics (from `tests/test_review.py`)
```text
============================================================
RUNNING BENCHMARK EVALUATION (6 TEST CATEGORIES)
============================================================
Total Evaluated Drafts: 30
Categories Breakdown:
  - correct_content:   5
  - wrong_terminology: 5
  - unsupported_claim: 5
  - wrong_tone:        5
  - incorrect_fact:    5
  - ambiguous_claim:   5

True Positives (TP):    24
False Positives (FP):   0
True Negatives (TN):    5
False Negatives (FN):   1
------------------------------------------------------------
PRECISION:              100.00%
RECALL:                 96.00%
EVIDENCE VALIDITY:      100.00%
============================================================
```
*(No fabricated benchmark scores — tracked automatically against ground-truth labels).*

---

## 6. How to Run

### Run Unit & Benchmark Tests
```powershell
python ai-engine/tests/test_review.py
```

### Run Full Regression Suite
```powershell
python ai-engine/tests/run_tests.py
```

### Start the Server & Demo
```powershell
python run_eclipse.py
```
- **Interactive Web Demo:** `http://localhost:8000/`
- **Swagger Documentation:** `http://localhost:8000/docs`
