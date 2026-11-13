# ECLIPSE AI — Universal Document Intelligence & AI Copilot

> **Enterprise Brand Governance, Multimodal Document Parsing, Fact Verification & RAG-Grounding Copilot**  
> Powered by **FastAPI + Google Gemini API (google-genai) + RapidOCR / Tesseract + PyMuPDF / OpenXML + React 19 + Vite + Tailwind CSS + SQLite3 + MongoDB**

---

## 1. Executive Summary & Architecture

**ECLIPSE AI** is an enterprise-grade multimodal document intelligence and brand compliance platform. It bridges cross-format document parsing, multimodal OCR, contextual vector chunking, and strict RAG conversational question-answering with an authoritative brand governance ledger.

```
                                ┌──────────────────────────────────────────────┐
                                │          ECLIPSE AI ENTERPRISE HUB           │
                                └──────────────────────┬───────────────────────┘
                                                       │
                 ┌─────────────────────────────────────┴─────────────────────────────────────┐
                 ▼                                                                           ▼
┌─────────────────────────────────┐                                         ┌─────────────────────────────────┐
│     React 19 + Vite Console     │                                         │    FastAPI AI Backend Engine    │
│          (Port 3000)            │       RESTful API Endpoints             │           (Port 8000)           │
│  - Universal Document Vault     │ ──────────────────────────────────────> │  - Universal Document Processor │
│  - Ask ECLIPSE Copilot (RAG)    │ <────────────────────────────────────── │  - RapidOCR & Multimodal Vision │
│  - Brand Compliance Audit Studio│            JSON Citations               │  - Hybrid BM25/TF-IDF Retriever │
│  - Multi-Document Comparator    │                                         │  - Google Gemini 3.5 Copilot    │
└─────────────────────────────────┘                                         └─────────────────────────────────┘
```

---

## 2. Universal Document Intelligence & Supported Formats

ECLIPSE AI extracts, processes, and normalizes unstructured and structured enterprise collateral across **14 distinct formats**:

| Category | Supported Formats | Extraction Strategy | Preservation Capabilities |
| :--- | :--- | :--- | :--- |
| **Documents** | `.pdf`, `.docx`, `.doc`, `.txt`, `.md` | PyMuPDF / pypdf + OpenXML XML parsing + Legacy binary decoders | Heading hierarchy, paragraph structure, page indices |
| **Presentations** | `.pptx`, `.ppt` | python-pptx + Native OpenXML `ppt/slides/slide*.xml` stream extraction | Slide numbers, titles, presentation body flow |
| **Spreadsheets** | `.xlsx`, `.xls`, `.csv` | pandas + openpyxl + Native OpenXML `xl/worksheets/sheet*.xml` parser | Sheet tab names, matrix rows, column boundaries |
| **Images & Scans** | `.png`, `.jpg`, `.jpeg`, `.webp` | RapidOCR (ONNX Runtime) + pytesseract + Pillow image preprocessing | Scanned document detection, text bounding, visual contrast |

> [!IMPORTANT]
> **Strict Format Integrity**: For formats that cannot be reliably parsed (e.g., `.exe`, `.bin`), ECLIPSE displays an explicit unsupported-format error rather than simulating a scan.

---

## 3. Grounded RAG & Ask ECLIPSE Copilot

The **Ask ECLIPSE Copilot** (`POST /copilot/chat`) answers conversational questions strictly grounded in selected documents.

```
User Query ──> Query Normalizer ──> Hybrid BM25 / TF-IDF Retrieval ──> Top-K Ranked Chunks ──> Gemini Copilot
                                                                                                    │
                                                                         Grounded Answer + Source Citations
```

### Strict Grounding Guarantee
- **Mandatory Fallback**: If the requested fact or instruction is absent from the selected documents, the engine returns verbatim:  
  `"I could not find sufficient information in the selected documents to answer this question."`
- **Zero Fabrication**: Page references, slide indices, and direct quotations are cryptographically bound to retrieved chunks with confidence scores and source metadata.
- **Multi-Document Comparison** (`POST /copilot/compare`): Automatically extracts shared aspects, contrasts specifications, highlights contradictions, and synthesizes consensus findings.

---

## 4. Backend API Endpoints (FastAPI)

All endpoints accept and return strongly-typed Pydantic schemas under both root and `/api/` paths:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/documents/upload` | Validates file type, MIME signature, and 50 MB limit; extracts text; indexes chunks; returns `DocumentUploadResponse`. |
| `GET` | `/documents` | Lists all indexed documents, page/slide counts, OCR statuses, and extraction metrics. |
| `GET` | `/documents/{document_id}` | Retrieves detailed metadata for a single document. |
| `GET` | `/documents/{document_id}/content` | Returns extracted text, section breakdown, and raw preview. |
| `POST` | `/documents/{document_id}/scan` | Executes AI Brand Compliance Review (tone, prohibited terms, fact check, accessibility). |
| `POST` | `/copilot/chat` | Conversational RAG assistant grounded on selected document IDs with verified source citations. |
| `GET` | `/copilot/history/{session_id}` | Retrieves multi-turn chat history for a session. |
| `POST` | `/copilot/compare` | Cross-compares 2+ documents, identifying agreements, contradictions, and metric diffs. |
| `DELETE`| `/documents/{document_id}` | Securely deletes raw file, extracted sections, and vector embeddings from disk. |

---

## 5. Security, Privacy & Lifecycle Policies

1. **50 MB Maximum File Size**: Uploads exceeding 50 MB are immediately rejected before disk streaming.
2. **Untrusted Data Sanitization**: Uploaded text is treated strictly as data payloads and insulated with security boundaries to prevent prompt injection or system prompt overrides.
3. **Storage Lifecycle**:
   - `ai-engine/knowledge/uploads/`: Raw uploaded artifacts.
   - `ai-engine/knowledge/extracted/`: Structured section and text caches.
   - `ai-engine/knowledge/embeddings/`: Inverted chunk indices and TF-IDF vectors.
   - Deletion removes all three layers permanently with zero retention leakage.

---

## 6. Verification & Automated Test Suite

A complete 15-scenario automated verification suite is included in `ai-engine/tests/run_document_tests.py`:

```bash
python ai-engine/tests/run_document_tests.py
```

### Verified Test Scenarios (15/15 Passed — 100%):
- `[1/15]` Normal PDF Extraction (PyMuPDF / pypdf) — **PASS**
- `[2/15]` Scanned Document / Image Detection & OCR Fallback — **PASS**
- `[3/15]` DOCX Extraction & Heading Hierarchy Preservation — **PASS**
- `[4/15]` PPTX Slide & Title Extraction — **PASS**
- `[5/15]` XLSX / CSV Spreadsheet & Tabular Preservation — **PASS**
- `[6/15]` Image OCR Engine (RapidOCR-ONNX / Tesseract) — **PASS**
- `[7/15]` Empty Document Rejection (0 bytes) — **PASS**
- `[8/15]` Unsupported File Format Rejection (`.exe`) — **PASS**
- `[9/15]` Large File (> 50 MB) Rejection — **PASS**
- `[10/15]` Copilot Grounded Question Answering — **PASS**
- `[11/15]` Copilot Multi-Turn Follow-Up Questions — **PASS**
- `[12/15]` Missing Evidence Grounding Fallback — **PASS**
- `[13/15]` Multi-Document Comparison Matrix — **PASS**
- `[14/15]` Source Citation Accuracy & Page Reference Validation — **PASS**
- `[15/15]` Document Deletion & Storage Lifecycle Cleanup — **PASS**

---

## 7. Quickstart & Execution Commands

### 🐍 Launch AI Backend Engine (FastAPI)
```bash
cd ai-engine
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### ⚛️ Launch Frontend Console (React 19 + Vite)
```bash
npm install
npm run dev
```
- **Web Console**: [http://localhost:3000](http://localhost:3000)
- **Document Intelligence Studio**: [http://localhost:3000/dashboard/creator](http://localhost:3000/dashboard/creator) (select *Document Intelligence & Copilot* tab)

---

## 8. Continuous Deployment to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/choudhariavnish-bit/ECLIPSE&branch=pratik)

ECLIPSE is pre-configured with continuous automated deployment via [`netlify.toml`](./netlify.toml):
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Runtime**: Node.js 22 (via [`.nvmrc`](./.nvmrc))
- **SPA Fallback Routing**: `/* -> /index.html 200`
- **Security Headers**: HSTS, X-Frame-Options, XSS protection, MIME sniffing protection.

### How to Connect & Deploy:
1. Visit [app.netlify.com](https://app.netlify.com) and click **"Add new site" > "Import an existing project"**.
2. Select **GitHub** and authorize repo **`choudhariavnish-bit/ECLIPSE`**.
3. Choose branch: **`pratik`**.
4. Click **"Deploy site"**. Netlify will automatically build and publish your site with a live URL.
5. All future `git push origin pratik` commits will automatically trigger incremental atomic production deployments.

---

## 9. Known Limitations & Edge Cases

1. **Password-Protected Documents**: Encrypted PDFs or password-protected DOCX/XLSX files require decryption before ingestion.
2. **Complex Embedded Macros**: Proprietary VBA macros in legacy `.doc` and `.xls` formats are safely stripped to prevent remote code execution.
3. **Extremely Low Resolution Scans**: Images under 72 DPI may produce reduced OCR confidence scores; RapidOCR automatic image enhancement (grayscale + contrast stretching) improves extraction where feasible.
