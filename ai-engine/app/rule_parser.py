import re
import uuid
from typing import List, Dict, Any
from schemas.audit_schema import Violation, ViolationCategory, ViolationSeverity
from app.brand_retriever import brand_retriever

class RuleParser:
    """
    Deterministic Rule Parser for ECLIPSE.
    Detects exact prohibited terms, prohibited superlatives, and casing infractions.
    """
    def __init__(self, retriever=brand_retriever):
        self.retriever = retriever

    def parse(self, text: str) -> List[Violation]:
        """
        Scans text for deterministic guideline infractions.
        """
        violations: List[Violation] = []
        guidelines = self.retriever.guidelines
        prohibited_terms = guidelines.get("prohibited_terminology", [])

        # 1. Check prohibited terms via regex boundary
        for item in prohibited_terms:
            term = item.get("term", "")
            if not term:
                continue

            # Case-insensitive word-boundary pattern
            escaped_term = re.escape(term)
            pattern = re.compile(rf"\b{escaped_term}\b", re.IGNORECASE)

            for match in pattern.finditer(text):
                matched_span = match.group(0)
                sev_str = item.get("severity", "medium").lower()
                severity = (
                    ViolationSeverity.CRITICAL if sev_str == "critical"
                    else ViolationSeverity.HIGH if sev_str == "high"
                    else ViolationSeverity.LOW if sev_str == "low"
                    else ViolationSeverity.MEDIUM
                )

                violations.append(Violation(
                    id=f"rule_viol_{uuid.uuid4().hex[:6]}",
                    category=ViolationCategory.PROHIBITED_TERM,
                    severity=severity,
                    problematic_text=matched_span,
                    explanation=item.get("rationale", "Prohibited term detected in marketing copy."),
                    guideline_reference="ECLIPSE Prohibited Terminology Policy",
                    suggestion=f"Replace with: '{item.get('recommended_replacement')}'"
                ))

        # 2. Check brand name casing: ECLIPSE must be all-caps
        eclipse_matches = re.finditer(r"\beclipse\b", text, re.IGNORECASE)
        for em in eclipse_matches:
            matched_str = em.group(0)
            if matched_str != "ECLIPSE":
                violations.append(Violation(
                    id=f"case_viol_{uuid.uuid4().hex[:6]}",
                    category=ViolationCategory.FORMATTING_RULE,
                    severity=ViolationSeverity.MEDIUM,
                    problematic_text=matched_str,
                    explanation="Brand name must be styled strictly as 'ECLIPSE' in capital letters.",
                    guideline_reference="ECLIPSE Brand Identity Guidelines, Section 1",
                    suggestion="ECLIPSE"
                ))

        # 3. Superlatives pattern check (e.g. '#1', 'world's best', 'number one', "India's No. 1")
        superlative_patterns = [
            (r"\b#1\b|\bnumber\s+(?:one|1)\b|\bno\.?\s*1\b", "Unverified rank superlative '#1 / No. 1'"),
            (r"\bworld['’]?s\s+best\b", "Unverified global superlative 'world's best'"),
            (r"\bunrivaled\b|\bunbeatable\b", "Absolute superiority claim requires certified audit"),
            (r"\b(incompetent|garbage|pathetic|obliterate)\b", "Aggressive or derogatory tone towards competitors or audience"),
            (r"\bshocking\s+secret\b|\bcrazy\s+ai\s+trick\b", "Sensationalist clickbait terminology prohibited")
        ]
        for spattern, desc in superlative_patterns:
            for sm in re.finditer(spattern, text, re.IGNORECASE):
                violations.append(Violation(
                    id=f"superlative_viol_{uuid.uuid4().hex[:6]}",
                    category=ViolationCategory.UNSUPPORTED_CLAIM,
                    severity=ViolationSeverity.HIGH,
                    problematic_text=sm.group(0),
                    explanation=f"{desc}. Absolute or superlative marketing claims require verified third-party citations.",
                    guideline_reference="FTC Truth in Advertising & Superlative Claims Policy",
                    suggestion="State specific measurable performance metrics rather than unverified superlatives."
                ))

        return violations

# Global singleton
rule_parser = RuleParser()

def check_prohibited_terms(content: str, prohibited_terms: list) -> list:
    """
    Round 2 Specification: Deterministic prohibited terms checker.
    Does not depend on Gemini for exact phrase detection.
    """
    findings = []
    content_lower = content.lower()

    for term in prohibited_terms:
        # Handle if term is a string or a dict
        term_str = term.get("term", "") if isinstance(term, dict) else str(term)
        if term_str and term_str.lower() in content_lower:
            findings.append({
                "category": "terminology",
                "severity": "high",
                "matched_text": term_str,
                "status": "confirmed_violation",
                "message": "Prohibited brand terminology detected."
            })

    return findings
