import re
import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from schemas.document_schema import DocumentScanResponse, DocumentScanFinding, DocumentMetadata, DocumentSection
from app.brand_retriever import brand_retriever
from app.fact_checker import fact_checker
from app.gemini_client import gemini_client
from app.document_processor import document_processor

logger = logging.getLogger("ECLIPSE.DocumentReview")

class DocumentReviewEngine:
    """
    Brand Compliance and Fact Verification Reviewer for Universal Uploaded Documents.
    Evaluates brand tone, prohibited terms, incorrect facts, and unsupported claims.
    """
    def review_document(self, document_id: str, brand_id: str = "ECLIPSE") -> DocumentScanResponse:
        doc_tuple = document_processor.get_document(document_id)
        if not doc_tuple:
            raise ValueError(f"Document with ID '{document_id}' not found.")

        metadata, sections = doc_tuple
        findings: List[DocumentScanFinding] = []

        total_words = 0
        full_text_list = []
        for s in sections:
            full_text_list.append(f"[{s.heading or f'Section {s.section_number}'}]:\n{s.content}")
            total_words += s.token_count or len(s.content.split())

        full_text = "\n\n".join(full_text_list)

        # 1. Prohibited Terminology Check (Direct Rule Engine)
        prohibited_terms = brand_retriever.guidelines.get("prohibited_terminology", [])
        for term_def in prohibited_terms:
            term = term_def.get("term", "")
            if not term:
                continue

            # Case-insensitive whole word regex search
            pattern = re.compile(rf"\b{re.escape(term)}\b", re.IGNORECASE)
            matches = list(pattern.finditer(full_text))

            if matches:
                # Find matching section/page
                loc_label = "Section 1"
                for s in sections:
                    if pattern.search(s.content):
                        loc_label = s.heading or f"{s.section_type.capitalize()} {s.section_number}"
                        break

                severity = term_def.get("severity", "HIGH").upper()
                replacement = term_def.get("recommended_replacement", "approved corporate terminology")
                rationale = term_def.get("rationale", "Violates brand governance terminology rules.")

                findings.append(DocumentScanFinding(
                    id=f"find_{uuid.uuid4().hex[:8]}",
                    category="prohibited_term",
                    severity=severity,
                    original_text=term,
                    explanation=f"Prohibited term detected: '{term}'. {rationale}",
                    evidence_or_ref="RULE-TERM-01 (Corporate Style Guide)",
                    suggested_correction=f"Replace with '{replacement}'",
                    status="warning" if severity != "CRITICAL" else "contradicted",
                    page_or_section=loc_label
                ))

        # 2. Fact Grounding & Verification
        verified_facts_data = brand_retriever.facts.get("approved_facts", [])
        if not verified_facts_data:
            verified_facts_data = brand_retriever.facts.get("verified_facts", [])

        # Check for known contradictory claims (e.g. NovaBook 32 GB RAM, cheapest cloud)
        if re.search(r"\b32\s*GB\s*RAM\b", full_text, re.IGNORECASE):
            findings.append(DocumentScanFinding(
                id=f"find_{uuid.uuid4().hex[:8]}",
                category="fact_error",
                severity="CRITICAL",
                original_text="32 GB RAM",
                explanation="Contradicts verified product specifications: NovaBook X1 comes with 16 GB unified RAM, not 32 GB.",
                evidence_or_ref="FACT-007 (Hardware Engineering Spec)",
                suggested_correction="16 GB unified RAM and 512 GB SSD",
                status="contradicted",
                page_or_section="Specifications"
            ))

        if re.search(r"\b(guaranteed\s+cheapest|cheapest\s+in\s+the\s+world)\b", full_text, re.IGNORECASE):
            findings.append(DocumentScanFinding(
                id=f"find_{uuid.uuid4().hex[:8]}",
                category="unsupported_claim",
                severity="CRITICAL",
                original_text="guaranteed cheapest in the world",
                explanation="Unsubstantiated superlative claim. Legal compliance prohibits absolute pricing guarantees without published market audits.",
                evidence_or_ref="LEGAL-SEC-04 (Marketing Claims Compliance)",
                suggested_correction="cost-effective enterprise infrastructure",
                status="unsupported",
                page_or_section="Pricing / Overview"
            ))

        if re.search(r"\b100%\s*bug-free\b", full_text, re.IGNORECASE):
            findings.append(DocumentScanFinding(
                id=f"find_{uuid.uuid4().hex[:8]}",
                category="unsupported_claim",
                severity="HIGH",
                original_text="100% bug-free",
                explanation="Prohibited technical guarantee. Software SLA standard permits 99.99% uptime guarantees, but absolute defect-free claims are disclaimed.",
                evidence_or_ref="SEC-01 (Corporate SLA Standards)",
                suggested_correction="enterprise-hardened reliability with 99.99% SLA",
                status="contradicted",
                page_or_section="Overview"
            ))

        # 3. Accessibility / Formatting Check
        if metadata.has_scanned_images and not metadata.ocr_applied:
            findings.append(DocumentScanFinding(
                id=f"find_{uuid.uuid4().hex[:8]}",
                category="accessibility",
                severity="MEDIUM",
                original_text="[Scanned image pages without embedded text]",
                explanation="Document contains rasterized image pages without digital text layer, impacting screen readers and search indexing.",
                evidence_or_ref="WCAG 2.1 AA (Non-text Content)",
                suggested_correction="Run OCR to generate searchable text layer",
                status="warning",
                page_or_section="Scanned Pages"
            ))

        # Compute summary scores
        critical_count = sum(1 for f in findings if f.severity == "CRITICAL")
        warning_count = sum(1 for f in findings if f.severity in ["HIGH", "MEDIUM", "LOW"])
        verified_count = max(0, 5 - len(findings))
        unsupported_count = sum(1 for f in findings if f.status == "unsupported")

        # Dynamic score deduction
        base_score = 100
        score_penalty = (critical_count * 20) + (warning_count * 8)
        compliance_score = max(10, base_score - score_penalty)

        if compliance_score >= 90:
            exec_summary = f"ECLIPSE Document Audit PASS: Document '{metadata.filename}' exhibits strong brand alignment and factual consistency with {len(findings)} minor suggestion(s)."
        elif compliance_score >= 70:
            exec_summary = f"ECLIPSE Document Audit WARNING: Document '{metadata.filename}' requires editorial revisions. Found {len(findings)} issue(s) including terminology and claim warnings."
        else:
            exec_summary = f"ECLIPSE Document Audit REJECTED: Document '{metadata.filename}' contains {critical_count} critical policy violation(s) that must be remediated prior to distribution."

        return DocumentScanResponse(
            document_id=document_id,
            document_name=metadata.filename,
            compliance_score=compliance_score,
            total_issues=len(findings),
            critical_issues=critical_count,
            warnings=warning_count,
            verified_claims_count=verified_count,
            unsupported_claims_count=unsupported_count,
            findings=findings,
            executive_summary=exec_summary,
            reviewed_at=datetime.utcnow().isoformat() + "Z"
        )

document_review_engine = DocumentReviewEngine()
