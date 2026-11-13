import re
from typing import List, Dict, Any
from schemas.audit_schema import CorrectionSuggestion, Violation

class CorrectionEngine:
    """
    Intelligent Correction Generator for ECLIPSE.
    Synthesizes rule replacements, tone adjustments, and factual accuracy
    to produce polished, publication-ready copy alternatives.
    """

    def apply_deterministic_fixes(self, original_text: str, violations: List[Violation]) -> str:
        """
        Applies direct text substitutions based on deterministic rule violations.
        """
        corrected = original_text

        # Fix casing for ECLIPSE
        corrected = re.sub(r"\beclipse\b", "ECLIPSE", corrected, flags=re.IGNORECASE)

        # Fix known prohibited terms
        replacements = {
            r"\bunbreakable\b": "highly resilient",
            r"\b100%\s+bug-free\b": "rigorously tested enterprise software",
            r"\bcheap\b": "cost-effective",
            r"\bdestroy\s+our\s+competitors\b": "outperform legacy solutions",
            r"\bguaranteed\s+profit\b": "proven ROI potential",
            r"\bmiracle\s+solution\b": "advanced AI breakthrough",
            r"\b#1\b": "industry-leading",
            r"\bworld['’]?s\s+best\b": "premier"
        }

        for pattern, repl in replacements.items():
            corrected = re.sub(pattern, repl, corrected, flags=re.IGNORECASE)

        return corrected

    def generate_alternatives(self, corrected_base: str, channel: str = "general") -> List[CorrectionSuggestion]:
        """
        Produces multi-persona compliant alternatives.
        """
        return [
            CorrectionSuggestion(
                tone_variation="Executive & Authoritative",
                revised_text=f"{corrected_base.strip()} Built for enterprise resilience and verified performance.",
                rationale="Best for B2B decision-makers, emphasizing reliability and rigorous compliance."
            ),
            CorrectionSuggestion(
                tone_variation="Dynamic & Engaging",
                revised_text=f"Experience modern brand governance with {corrected_base.strip()}",
                rationale="Optimized for social media and demand generation campaigns."
            )
        ]

# Global singleton
correction_engine = CorrectionEngine()
