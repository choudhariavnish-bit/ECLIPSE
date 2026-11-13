import time
import json
import uuid
import logging
from typing import Dict, Any, List
from schemas.audit_schema import (
    BrandAuditReport,
    Violation,
    FactCheckItem,
    CorrectionSuggestion,
    ReviewStatus,
    ViolationSeverity,
    ViolationCategory,
    FactCheckStatus
)
from schemas.request_schema import ReviewRequest
from app.brand_retriever import brand_retriever
from app.rule_parser import rule_parser
from app.fact_checker import fact_checker
from app.prompt_engine import PromptEngine
from app.gemini_client import gemini_client
from app.correction_engine import correction_engine

logger = logging.getLogger("ECLIPSE.ReviewEngine")

class ContentReviewEngine:
    """
    Main Orchestrator for the ECLIPSE AI Engine.
    Executes the multi-stage review pipeline:
    1. Ingest Content
    2. RAG Knowledge Retrieval
    3. Deterministic Rule & Superlative Parsing
    4. Fact Verification against Approved Evidence
    5. Gemini AI Multi-dimensional Tone & Messaging Review
    6. Structured JSON Audit Report Generation & Score Computation
    """

    def review_content(self, request: ReviewRequest) -> BrandAuditReport:
        start_time = time.time()
        audit_id = f"ECLIPSE-{uuid.uuid4().hex[:8].upper()}"

        content = request.content.strip()
        channel = request.channel or "general"
        target_audience = request.target_audience or "Enterprise & B2B buyers"

        # Step 1: Deterministic Rule Parsing
        rule_violations = rule_parser.parse(content)

        # Step 2: Fact Verification
        fact_checks = fact_checker.verify_claims(content)

        # Step 3: RAG Knowledge Retrieval
        rag_context = brand_retriever.get_context_for_review(content, channel=channel)

        # Step 4: Construct Gemini Review Prompt
        review_prompt = PromptEngine.build_review_prompt(
            content=content,
            channel=channel,
            target_audience=target_audience,
            rag_context=rag_context["prompt_context"],
            detected_rule_violations=[v.model_dump() for v in rule_violations],
            detected_fact_checks=[f.model_dump() for f in fact_checks],
            custom_rules=request.custom_rules
        )

        # Step 5: Execute Gemini Inference
        gemini_raw_response = gemini_client.ask_eclipse(review_prompt, as_json=True)

        # Step 6: Parse and Consolidate
        violations_map: Dict[str, Violation] = {v.problematic_text.lower(): v for v in rule_violations}
        fact_map: Dict[str, FactCheckItem] = {f.claim_text.lower(): f for f in fact_checks}
        alternative_suggestions: List[CorrectionSuggestion] = []
        recommended_correction = ""
        executive_summary = ""

        try:
            # Clean JSON if wrapped in markdown code blocks
            clean_json_str = gemini_raw_response.strip()
            if clean_json_str.startswith("```"):
                lines = clean_json_str.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                clean_json_str = "\n".join(lines).strip()

            parsed_data = json.loads(clean_json_str)

            # Extract violations from Gemini
            for g_viol in parsed_data.get("violations", []):
                p_text = g_viol.get("problematic_text", "").strip()
                if p_text and p_text.lower() not in violations_map:
                    try:
                        sev_str = g_viol.get("severity", "medium").lower()
                        cat_str = g_viol.get("category", "tone_violation").lower()
                        sev = ViolationSeverity(sev_str) if sev_str in ViolationSeverity._value2member_map_ else ViolationSeverity.MEDIUM
                        cat = ViolationCategory(cat_str) if cat_str in ViolationCategory._value2member_map_ else ViolationCategory.TONE_VIOLATION

                        v_obj = Violation(
                            id=g_viol.get("id", f"gemini_viol_{uuid.uuid4().hex[:6]}"),
                            category=cat,
                            severity=sev,
                            problematic_text=p_text,
                            explanation=g_viol.get("explanation", "Detected tone or guideline inconsistency."),
                            guideline_reference=g_viol.get("guideline_reference", "ECLIPSE Core Voice Guidelines"),
                            suggestion=g_viol.get("suggestion", "Align with approved brand tone.")
                        )
                        violations_map[p_text.lower()] = v_obj
                    except Exception as ve:
                        logger.warning(f"Error parsing Gemini violation item: {ve}")

            # Extract fact checks from Gemini
            for g_fc in parsed_data.get("fact_checks", []):
                c_text = g_fc.get("claim_text", "").strip()
                if c_text and c_text.lower() not in fact_map:
                    try:
                        st_str = g_fc.get("status", "unsupported").lower()
                        fc_status = FactCheckStatus(st_str) if st_str in FactCheckStatus._value2member_map_ else FactCheckStatus.UNSUPPORTED
                        fc_obj = FactCheckItem(
                            claim_text=c_text,
                            status=fc_status,
                            evidence=g_fc.get("evidence", "Requires empirical citation."),
                            confidence=float(g_fc.get("confidence", 0.85)),
                            source_ref=g_fc.get("source_ref")
                        )
                        fact_map[c_text.lower()] = fc_obj
                    except Exception as fe:
                        logger.warning(f"Error parsing Gemini fact-check item: {fe}")

            recommended_correction = parsed_data.get("recommended_correction", "")
            executive_summary = parsed_data.get("summary", "")

            for alt in parsed_data.get("alternative_corrections", []):
                if alt.get("revised_text"):
                    alternative_suggestions.append(CorrectionSuggestion(
                        tone_variation=alt.get("tone_variation", "Alternative Style"),
                        revised_text=alt.get("revised_text"),
                        rationale=alt.get("rationale", "Aligned with brand voice.")
                    ))

        except Exception as e:
            logger.error(f"Failed to parse Gemini JSON output: {e}. Utilizing deterministic synthesis.")

        # Final list of violations & fact checks
        final_violations = list(violations_map.values())
        final_fact_checks = list(fact_map.values())

        # Fallback correction if Gemini didn't supply one
        if not recommended_correction:
            recommended_correction = correction_engine.apply_deterministic_fixes(content, final_violations)

        if not alternative_suggestions:
            alternative_suggestions = correction_engine.generate_alternatives(recommended_correction, channel)

        # Step 7: Objective Composite Compliance Score
        score = 100
        for v in final_violations:
            if v.severity == ViolationSeverity.CRITICAL:
                score -= 28
            elif v.severity == ViolationSeverity.HIGH:
                score -= 16
            elif v.severity == ViolationSeverity.MEDIUM:
                score -= 8
            elif v.severity == ViolationSeverity.LOW:
                score -= 4

        for fc in final_fact_checks:
            if fc.status == FactCheckStatus.REFUTED:
                score -= 25
            elif fc.status == FactCheckStatus.UNSUPPORTED:
                score -= 10

        score = max(0, min(100, score))

        # Decision Status
        has_critical = any(v.severity == ViolationSeverity.CRITICAL for v in final_violations)
        has_refuted = any(fc.status == FactCheckStatus.REFUTED for fc in final_fact_checks)

        if score >= 90 and not has_critical and not has_refuted:
            status = ReviewStatus.APPROVED
        elif score >= 60 and not has_critical:
            status = ReviewStatus.NEEDS_HUMAN_REVIEW
        else:
            status = ReviewStatus.REJECTED

        if not executive_summary:
            if status == ReviewStatus.APPROVED:
                executive_summary = "Content adheres to ECLIPSE brand guidelines and approved facts with high confidence."
            elif status == ReviewStatus.NEEDS_HUMAN_REVIEW:
                executive_summary = f"ECLIPSE identified {len(final_violations)} guideline issues and {len(final_fact_checks)} claims requiring review."
            else:
                executive_summary = "Critical brand guideline violations or refuted claims detected. Content must be revised before publishing."

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return BrandAuditReport(
            audit_id=audit_id,
            engine_name="ECLIPSE",
            engine_version="1.0.0",
            model=gemini_client.model,
            content_channel=channel,
            original_content=content,
            compliance_score=score,
            status=status,
            summary=executive_summary,
            violations=final_violations,
            fact_checks=final_fact_checks,
            recommended_correction=recommended_correction,
            alternative_corrections=alternative_suggestions,
            execution_time_ms=elapsed_ms
        )

# Global singleton
review_engine = ContentReviewEngine()

def review_brand_content(content: str, brand: dict = None, live_gemini: bool = True) -> dict:
    """
    Round 2 Specification: Combined review engine combining
    the rule parser, brand knowledge and Gemini.
    Validates with Pydantic ReviewReport schema and validates evidence IDs.
    """
    from app.gemini_client import generate_response
    from app.prompt_engine import create_review_prompt
    from app.rule_parser import check_prohibited_terms
    from schemas.review_schema import ReviewReport, Issue

    # Load brand knowledge default if not provided
    if brand is None:
        prohibited = [t.get("term", "") for t in brand_retriever.guidelines.get("prohibited_terminology", [])]
        brand = {
            "brand_name": brand_retriever.guidelines.get("brand_name", "ECLIPSE"),
            "prohibited_terms": prohibited,
            "core_identity": brand_retriever.guidelines.get("core_identity", {}),
            "approved_facts": brand_retriever.facts.get("facts", [])
        }

    # 1. Exact rule checking
    prohibited_list = brand.get("prohibited_terms", [])
    rule_findings = check_prohibited_terms(content, prohibited_list)

    # 2. Prepare approved knowledge
    brand_knowledge = json.dumps(brand, indent=2)

    # 3. Generate contextual review via Gemini
    ai_raw = ""
    if live_gemini:
        prompt = create_review_prompt(content, brand_knowledge)
        ai_raw = generate_response(prompt)

    # 4. Parse & validate with Pydantic ReviewReport schema
    parsed_report = None
    try:
        clean_text = ai_raw.strip()
        if clean_text.startswith("```"):
            lines = clean_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            clean_text = "\n".join(lines).strip()
        data = json.loads(clean_text)
        if "issues" in data and "overall_status" in data:
            parsed_report = ReviewReport.model_validate(data)
    except Exception:
        parsed_report = None

    if not parsed_report or not parsed_report.issues:
        # High-fidelity synthesis using deterministic parser and fact checker
        issues = []
        for rf in rule_findings:
            issues.append(Issue(
                category=rf.get("category", "terminology"),
                severity=rf.get("severity", "high"),
                problematic_text=rf.get("matched_text", ""),
                explanation=rf.get("message", "Prohibited brand terminology detected."),
                evidence=[],
                suggestion="Replace with approved brand terminology",
                status=rf.get("status", "confirmed_violation")
            ))

        # Check full rule violations (including superlatives and casing)
        full_violations = rule_parser.parse(content)
        for fv in full_violations:
            if not any(i.problematic_text.lower() == fv.problematic_text.lower() for i in issues):
                issues.append(Issue(
                    category=fv.category.value if hasattr(fv.category, "value") else str(fv.category),
                    severity=fv.severity.value if hasattr(fv.severity, "value") else str(fv.severity),
                    problematic_text=fv.problematic_text,
                    explanation=fv.explanation,
                    evidence=[],
                    suggestion=fv.suggestion,
                    status="confirmed_violation" if fv.severity == ViolationSeverity.CRITICAL else "needs_evidence"
                ))

        # Check fact checker for unapproved claims & refuted facts
        fchecks = fact_checker.verify_claims(content)
        for fc in fchecks:
            if fc.status in [FactCheckStatus.UNSUPPORTED, FactCheckStatus.REFUTED]:
                issues.append(Issue(
                    category="claim",
                    severity="high" if fc.status == FactCheckStatus.REFUTED else "medium",
                    problematic_text=fc.claim_text,
                    explanation=fc.evidence,
                    evidence=[fc.source_ref] if fc.source_ref else [],
                    suggestion="Cite approved benchmark or align with documented facts",
                    status="false_claim" if fc.status == FactCheckStatus.REFUTED else "needs_evidence"
                ))

        # Tone / ambiguous pattern heuristics
        ambiguous_triggers = [
            ("practically guarantees", "tone", "Hedging guarantee creates legal ambiguity"),
            ("endless hours", "tone", "Unquantified time metric requires concrete evidence"),
            ("virtually every", "tone", "Vague generalization without citation"),
            ("might be the fastest", "claim", "Speculative comparison requires third-party benchmark"),
            ("near-instant", "tone", "Vague timing claim without SLA baseline")
        ]
        for trig, cat, exp in ambiguous_triggers:
            if trig in content.lower():
                issues.append(Issue(
                    category=cat,
                    severity="medium",
                    problematic_text=trig,
                    explanation=exp,
                    evidence=[],
                    suggestion="Use concrete, approved metrics",
                    status="needs_evidence"
                ))

        overall_status = "approved"
        if any(i.severity in ["high", "critical"] for i in issues):
            overall_status = "rejected" if any(i.severity == "critical" or i.status == "false_claim" for i in issues) else "needs_review"
        elif issues:
            overall_status = "needs_review"

        parsed_report = ReviewReport(
            overall_status=overall_status,
            summary=f"Detected {len(issues)} issues requiring review." if issues else "Content adheres to approved brand guidelines.",
            issues=issues
        )

    # 5. Validate cited evidence IDs against actual approved facts
    valid_fact_ids = {
        f.get("fact_id", f.get("id"))
        for f in brand.get("approved_facts", [])
        if f.get("fact_id") or f.get("id")
    }

    if parsed_report:
        for issue in parsed_report.issues:
            # Check validity of cited fact IDs
            verified_citations = [fid for fid in issue.evidence if fid in valid_fact_ids]
            issue.evidence = verified_citations

    return {
        "rule_findings": rule_findings,
        "ai_findings": ai_raw,
        "structured_report": parsed_report.model_dump() if parsed_report else None
    }
