from typing import List, Dict, Any, Tuple
from schemas.audit_schema import (
    Violation,
    ViolationCategory,
    ViolationSeverity,
    FactCheckItem,
    FactCheckStatus,
    QualityScores
)

class CrossValidationEngine:
    """
    Stage 7 & 8: Cross-Validation of Findings & Risk Assessment.
    Consolidates findings from Gemini reasoning, deterministic rule parser,
    and fact checker, resolving duplicates, harmonizing evidence citations,
    and calculating grounded risk and quality scores.
    """

    def consolidate_and_assess_risk(
        self,
        rule_violations: List[Violation],
        fact_checks: List[FactCheckItem],
        gemini_violations: List[Violation],
        content: str
    ) -> Tuple[List[Violation], List[FactCheckItem], QualityScores, str]:
        consolidated_violations: Dict[str, Violation] = {}
        fact_checks_dict: Dict[str, FactCheckItem] = {}

        # 1. Add Deterministic Rule Violations (Highest priority for terminology and casing)
        for rv in rule_violations:
            key = rv.problematic_text.lower().strip()
            consolidated_violations[key] = rv

        # 2. Add Fact Checks (Convert contradicted / false claims to CRITICAL violations if not yet present)
        for fc in fact_checks:
            fkey = fc.claim_text.lower().strip()
            fact_checks_dict[fkey] = fc

            if fc.status in [FactCheckStatus.CONTRADICTED, FactCheckStatus.REFUTED]:
                if fkey not in consolidated_violations:
                    consolidated_violations[fkey] = Violation(
                        id=f"fact_contradict_{len(consolidated_violations) + 1}",
                        category=ViolationCategory.CONTRADICTED_FACT,
                        severity=ViolationSeverity.CRITICAL,
                        problematic_text=fc.claim_text,
                        original_sentence=fc.claim_text,
                        explanation=f"Factual contradiction: {fc.evidence}",
                        guideline_reference="ECLIPSE Truth in Advertising & Fact Standards",
                        rule_id="RULE-FACT-CONTRADICTION",
                        evidence_id=fc.source_ref or "FACT-001",
                        suggestion=fc.suggested_correction or (fc.approved_info or "Cite approved facts only"),
                        corrected_sentence=fc.suggested_correction,
                        requires_human_review=False
                    )
            elif fc.status == FactCheckStatus.UNSUPPORTED:
                if fkey not in consolidated_violations:
                    consolidated_violations[fkey] = Violation(
                        id=f"fact_unsupp_{len(consolidated_violations) + 1}",
                        category=ViolationCategory.UNSUPPORTED_CLAIM,
                        severity=ViolationSeverity.HIGH,
                        problematic_text=fc.claim_text,
                        original_sentence=fc.claim_text,
                        explanation=f"Unsupported claim: {fc.evidence}",
                        guideline_reference="ECLIPSE Claims Substantiation Policy",
                        rule_id="RULE-UNSUPPORTED-CLAIM",
                        evidence_id=fc.source_ref,
                        suggestion=fc.suggested_correction or "Replace with substantiated metrics",
                        requires_human_review=True
                    )

        # 3. Merge Gemini Violations (Harmonize & de-duplicate)
        for gv in gemini_violations:
            gkey = gv.problematic_text.lower().strip()
            matched_existing_key = None

            for ex_key in consolidated_violations:
                if ex_key in gkey or gkey in ex_key:
                    matched_existing_key = ex_key
                    break

            if matched_existing_key:
                # Merge explanations and preserve higher severity
                existing = consolidated_violations[matched_existing_key]
                if gv.explanation and gv.explanation not in existing.explanation:
                    existing.explanation = f"{existing.explanation} (AI Insight: {gv.explanation})"
                if not existing.corrected_sentence and gv.corrected_sentence:
                    existing.corrected_sentence = gv.corrected_sentence
                # Elevate severity if Gemini detected legal/critical risk
                if gv.severity == ViolationSeverity.CRITICAL:
                    existing.severity = ViolationSeverity.CRITICAL
                elif gv.severity == ViolationSeverity.HIGH and existing.severity in [ViolationSeverity.MEDIUM, ViolationSeverity.LOW]:
                    existing.severity = ViolationSeverity.HIGH
            else:
                consolidated_violations[gkey] = gv

        final_violations = list(consolidated_violations.values())
        final_fact_checks = list(fact_checks_dict.values())

        # 4. Compute Rigorous Multi-Dimensional Quality Scores
        grammar_deductions = sum(6 for v in final_violations if v.category in [ViolationCategory.GRAMMAR_ERROR, ViolationCategory.SPELLING_ERROR, ViolationCategory.PUNCTUATION_ERROR, ViolationCategory.SENTENCE_STRUCTURE])
        grammar_score = max(20, min(100, 100 - grammar_deductions))

        brand_deductions = 0
        for v in final_violations:
            if v.category in [ViolationCategory.PROHIBITED_TERM, ViolationCategory.TONE_VIOLATION, ViolationCategory.FORMATTING_RULE]:
                if v.severity == ViolationSeverity.CRITICAL:
                    brand_deductions += 30
                elif v.severity == ViolationSeverity.HIGH:
                    brand_deductions += 18
                elif v.severity == ViolationSeverity.MEDIUM:
                    brand_deductions += 10
                else:
                    brand_deductions += 5
        brand_score = max(0, min(100, 100 - brand_deductions))

        claim_deductions = 0
        for v in final_violations:
            if v.category in [ViolationCategory.CONTRADICTED_FACT, ViolationCategory.UNSUPPORTED_CLAIM, ViolationCategory.FALSE_CLAIM, ViolationCategory.LEGAL_RISK]:
                if v.severity == ViolationSeverity.CRITICAL:
                    claim_deductions += 35
                elif v.severity == ViolationSeverity.HIGH:
                    claim_deductions += 20
                else:
                    claim_deductions += 10
        for fc in final_fact_checks:
            if fc.status in [FactCheckStatus.CONTRADICTED, FactCheckStatus.REFUTED]:
                claim_deductions += 15
        content_quality_score = max(0, min(100, 100 - claim_deductions))

        # Overall composite score
        overall_score = round(brand_score * 0.45 + content_quality_score * 0.35 + grammar_score * 0.20)
        overall_score = max(0, min(100, overall_score))
        drift_score = max(0, 100 - overall_score)

        # Risk Classification
        has_critical = any(v.severity == ViolationSeverity.CRITICAL for v in final_violations)
        has_high = any(v.severity == ViolationSeverity.HIGH for v in final_violations)
        has_medium = any(v.severity == ViolationSeverity.MEDIUM for v in final_violations)

        if has_critical or drift_score >= 70:
            risk_level = "CRITICAL"
        elif has_high or drift_score >= 40:
            risk_level = "HIGH"
        elif has_medium or drift_score >= 20:
            risk_level = "MEDIUM"
        elif final_violations:
            risk_level = "LOW"
        else:
            risk_level = "INFO"

        quality_scores = QualityScores(
            overall_score=overall_score,
            grammar_score=grammar_score,
            brand_compliance_score=brand_score,
            content_quality_score=content_quality_score,
            drift_score=drift_score,
            risk_level=risk_level
        )

        notes = f"Cross-validated {len(rule_violations)} deterministic rules, {len(fact_checks)} fact checks, and {len(gemini_violations)} AI inferences into {len(final_violations)} distinct actionable issues."

        return final_violations, final_fact_checks, quality_scores, notes

cross_validator = CrossValidationEngine()

