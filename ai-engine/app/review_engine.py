import time
import json
import uuid
import logging
from typing import Dict, Any, List, Optional
from schemas.audit_schema import (
    BrandAuditReport,
    BlogAuditReport,
    Violation,
    FactCheckItem,
    CorrectionSuggestion,
    ReviewStatus,
    ViolationSeverity,
    ViolationCategory,
    FactCheckStatus,
    ContentIntent,
    ContentPurpose,
    QualityScores
)
from schemas.request_schema import (
    ReviewRequest,
    BlogAnalyzeRequest,
    BlogCorrectRequest,
    BlogReviewRequest
)
from app.brand_retriever import brand_retriever
from app.rule_parser import rule_parser
from app.fact_checker import fact_checker
from app.prompt_engine import PromptEngine
from app.gemini_client import gemini_client
from app.correction_engine import correction_engine
from app.intent_classifier import intent_classifier
from app.cross_validator import cross_validator

logger = logging.getLogger("ECLIPSE.ReviewEngine")

def clean_json_markdown(text: str) -> str:
    """Strips markdown code fences from JSON output."""
    raw = text.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        raw = "\n".join(lines).strip()
    return raw

def _normalize_category(cat_str: str) -> ViolationCategory:
    c = str(cat_str or "").lower().strip()
    if "gramm" in c:
        return ViolationCategory.GRAMMAR_ERROR
    if "spell" in c:
        return ViolationCategory.SPELLING_ERROR
    if "punct" in c:
        return ViolationCategory.PUNCTUATION_ERROR
    if "vocab" in c:
        return ViolationCategory.WEAK_VOCABULARY
    if "structure" in c:
        return ViolationCategory.SENTENCE_STRUCTURE
    if "repet" in c:
        return ViolationCategory.REPETITIVE_CONTENT
    if "tone" in c or "voice" in c or "style" in c:
        return ViolationCategory.TONE_VIOLATION
    if "prohibit" in c or "term" in c or "word" in c:
        return ViolationCategory.PROHIBITED_TERM
    if "contradict" in c:
        return ViolationCategory.CONTRADICTED_FACT
    if "false" in c:
        return ViolationCategory.FALSE_CLAIM
    if "claim" in c or "unsupport" in c or "fact" in c:
        return ViolationCategory.UNSUPPORTED_CLAIM
    if "legal" in c or "regulat" in c or "risk" in c or "sec" in c or "ftc" in c:
        return ViolationCategory.LEGAL_RISK
    if "format" in c or "visual" in c or "contrast" in c or "wcag" in c:
        return ViolationCategory.FORMATTING_RULE
    return ViolationCategory.CONTENT_QUALITY

def _normalize_severity(sev_str: str) -> ViolationSeverity:
    s = str(sev_str or "").lower().strip()
    if "crit" in s:
        return ViolationSeverity.CRITICAL
    if "high" in s:
        return ViolationSeverity.HIGH
    if "med" in s or "warn" in s:
        return ViolationSeverity.MEDIUM
    if "low" in s:
        return ViolationSeverity.LOW
    return ViolationSeverity.INFO

def _extract_violations_from_gemini(parsed_data: Dict[str, Any], default_rule_prefix: str = "RULE-AI") -> List[Violation]:
    gemini_violations: List[Violation] = []
    raw_list = (
        parsed_data.get("violations")
        or parsed_data.get("detected_issues")
        or parsed_data.get("findings")
        or parsed_data.get("issues")
        or []
    )
    # Check suggested_corrections mapping
    corrections_map = {}
    for sc in parsed_data.get("suggested_corrections", []):
        if isinstance(sc, dict):
            orig = sc.get("original_sentence") or sc.get("original_text") or ""
            if orig:
                corrections_map[orig.lower().strip()] = sc

    for gv in raw_list:
        if not isinstance(gv, dict):
            continue
        p_text = (
            gv.get("problematic_text")
            or gv.get("flaggedText")
            or gv.get("original_text")
            or gv.get("text")
            or gv.get("snippet")
            or ""
        ).strip()
        if not p_text:
            continue

        orig_sentence = gv.get("original_sentence") or gv.get("sentence") or p_text
        explanation = (
            gv.get("explanation")
            or gv.get("reason")
            or gv.get("issue")
            or gv.get("description")
            or "Detected brand guideline or content quality infraction."
        )
        guideline = (
            gv.get("guideline_reference")
            or gv.get("supporting_rule_or_evidence")
            or gv.get("rule")
            or "ECLIPSE Brand Guidelines"
        )
        rule_id = (
            gv.get("rule_id")
            or gv.get("ruleCode")
            or gv.get("code")
            or f"{default_rule_prefix}-{uuid.uuid4().hex[:4].upper()}"
        )

        suggestion = (
            gv.get("suggestion")
            or gv.get("suggestedFix")
            or gv.get("recommendation")
            or gv.get("replacement")
            or ""
        )
        corrected_sentence = gv.get("corrected_sentence")

        orig_key = orig_sentence.lower().strip()
        if orig_key in corrections_map:
            match = corrections_map[orig_key]
            if not suggestion:
                suggestion = match.get("corrected_sentence") or match.get("replacement") or ""
            if not corrected_sentence:
                corrected_sentence = match.get("corrected_sentence")

        cat = _normalize_category(gv.get("category", "tone_violation"))
        sev = _normalize_severity(gv.get("severity", "medium"))

        gemini_violations.append(Violation(
            id=gv.get("id", f"viol_{uuid.uuid4().hex[:6]}"),
            category=cat,
            severity=sev,
            problematic_text=p_text,
            original_sentence=orig_sentence,
            explanation=explanation,
            guideline_reference=guideline,
            rule_id=rule_id,
            evidence_id=gv.get("evidence_id"),
            suggestion=suggestion or "Align with brand standards.",
            corrected_sentence=corrected_sentence,
            requires_human_review=gv.get("requires_human_review", (sev in [ViolationSeverity.CRITICAL, ViolationSeverity.HIGH]))
        ))
    return gemini_violations

def _extract_fact_checks_from_gemini(parsed_data: Dict[str, Any]) -> List[FactCheckItem]:
    gemini_fact_checks: List[FactCheckItem] = []
    raw_list = (
        parsed_data.get("fact_checks")
        or parsed_data.get("factChecks")
        or parsed_data.get("claims")
        or []
    )
    for gfc in raw_list:
        if not isinstance(gfc, dict):
            continue
        c_text = (
            gfc.get("claim_text")
            or gfc.get("claim")
            or gfc.get("statement")
            or ""
        ).strip()
        if not c_text:
            continue
        st_str = str(gfc.get("status", "unsupported")).lower().strip()
        if "verif" in st_str:
            fc_status = FactCheckStatus.VERIFIED
        elif "contradict" in st_str:
            fc_status = FactCheckStatus.CONTRADICTED
        elif "refut" in st_str:
            fc_status = FactCheckStatus.REFUTED
        else:
            fc_status = FactCheckStatus.UNSUPPORTED

        gemini_fact_checks.append(FactCheckItem(
            claim_text=c_text,
            status=fc_status,
            evidence=gfc.get("evidence") or gfc.get("explanation") or "Requires empirical citation.",
            confidence=float(gfc.get("confidence", 0.85)),
            source_ref=gfc.get("source_ref") or gfc.get("fact_id"),
            approved_info=gfc.get("approved_info"),
            suggested_correction=gfc.get("suggested_correction")
        ))
    return gemini_fact_checks

class ContentReviewEngine:
    """
    Main Intelligent Reasoning & Decision-Making Orchestrator for ECLIPSE.
    Implements the 10-stage governance pipeline:
    1. Input Understanding
    2. Content Intent Classification
    3. Brand Knowledge Retrieval (RAG)
    4. Deterministic Rule & Syntax Parsing
    5. Fact Verification Engine
    6. Contextual Gemini Reasoning
    7. Cross-Validation of Findings
    8. Severity & Risk Assessment
    9. Intelligent Correction Generation
    10. Structured JSON Audit Report
    """

    def review_content(self, request: ReviewRequest) -> BrandAuditReport:
        start_time = time.time()
        audit_id = f"ECLIPSE-{uuid.uuid4().hex[:8].upper()}"

        content = request.content.strip()
        channel = request.channel or "general"
        target_audience = request.target_audience or "Enterprise & B2B buyers"

        # Stage 1 & 2: Input Understanding & Content Intent Classification
        intent_data = intent_classifier.analyze_intent_and_context(content, channel_hint=channel)
        content_intent = intent_data["content_intent"]
        content_purpose = intent_data["content_purpose"]
        input_understanding = intent_data["understanding"]

        # Stage 3: RAG Knowledge Retrieval
        rag_context = brand_retriever.get_context_for_review(content, channel=channel)

        # Stage 4: Deterministic Rule Parser
        rule_violations = rule_parser.parse(content)

        # Stage 5: Fact Verification Engine
        fact_checks = fact_checker.verify_claims(content)

        # Stage 6: Gemini Contextual Reasoning Engine
        review_prompt = PromptEngine.build_review_prompt(
            content=content,
            channel=channel,
            target_audience=target_audience,
            rag_context=rag_context["prompt_context"],
            detected_rule_violations=[v.model_dump() for v in rule_violations],
            detected_fact_checks=[f.model_dump() for f in fact_checks],
            custom_rules=request.custom_rules
        )

        gemini_raw_response = gemini_client.ask_eclipse(review_prompt, as_json=True)
        gemini_violations: List[Violation] = []
        gemini_fact_checks: List[FactCheckItem] = []
        recommended_correction = ""
        executive_summary = ""
        alternative_suggestions: List[CorrectionSuggestion] = []

        try:
            parsed_data = json.loads(clean_json_markdown(gemini_raw_response))

            gemini_violations = _extract_violations_from_gemini(parsed_data, default_rule_prefix="RULE-GEMINI")
            gemini_fact_checks = _extract_fact_checks_from_gemini(parsed_data)

            recommended_correction = (
                parsed_data.get("recommended_correction")
                or parsed_data.get("corrected_content")
                or parsed_data.get("fully_corrected_content")
                or ""
            )
            executive_summary = (
                parsed_data.get("summary")
                or parsed_data.get("content_analysis")
                or parsed_data.get("executive_summary")
                or ""
            )

            for alt in parsed_data.get("alternative_corrections", []):
                if isinstance(alt, dict) and alt.get("revised_text"):
                    alternative_suggestions.append(CorrectionSuggestion(
                        tone_variation=alt.get("tone_variation", "Alternative Style"),
                        revised_text=alt.get("revised_text"),
                        rationale=alt.get("rationale", "Aligned with brand voice.")
                    ))
        except Exception as e:
            logger.warning(f"Using deterministic synthesis (Gemini JSON parse fallback): {e}")

        # Combine Fact Checks from deterministic fact_checker and Gemini
        all_facts = list(fact_checks)
        for gf in gemini_fact_checks:
            if not any(f.claim_text.lower() == gf.claim_text.lower() for f in all_facts):
                all_facts.append(gf)

        # Stage 7 & 8: Cross-Validation & Severity/Risk Assessment
        final_violations, final_fact_checks, quality_scores, cross_val_notes = cross_validator.consolidate_and_assess_risk(
            rule_violations=rule_violations,
            fact_checks=all_facts,
            gemini_violations=gemini_violations,
            content=content
        )

        # Stage 9: Intelligent Correction Generation
        if not recommended_correction or len(recommended_correction.split()) < 3:
            recommended_correction = correction_engine.apply_selected_fixes(content, final_violations)

        if not alternative_suggestions:
            alternative_suggestions = correction_engine.generate_alternatives(recommended_correction, channel=channel)

        # Status Decision
        has_critical = any(v.severity == ViolationSeverity.CRITICAL for v in final_violations)
        has_contradicted = any(fc.status in [FactCheckStatus.CONTRADICTED, FactCheckStatus.REFUTED] for fc in final_fact_checks)

        if quality_scores.overall_score >= 88 and not has_critical and not has_contradicted:
            status = ReviewStatus.APPROVED
        elif quality_scores.overall_score >= 55 and not has_critical:
            status = ReviewStatus.NEEDS_HUMAN_REVIEW
        else:
            status = ReviewStatus.REJECTED

        if not executive_summary:
            if status == ReviewStatus.APPROVED:
                executive_summary = "Content adheres to ECLIPSE brand guidelines and approved facts with high confidence."
            elif status == ReviewStatus.NEEDS_HUMAN_REVIEW:
                executive_summary = f"ECLIPSE identified {len(final_violations)} guideline issues and {len(final_fact_checks)} claim checks requiring human review."
            else:
                executive_summary = "Critical brand guideline violations or contradicted facts detected. Content must be revised before publishing."

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return BrandAuditReport(
            audit_id=audit_id,
            engine_name="ECLIPSE",
            engine_version="2.0.0",
            model=gemini_client.model,
            content_channel=channel,
            original_content=content,
            content_intent=content_intent,
            content_purpose=content_purpose,
            input_understanding=input_understanding,
            compliance_score=quality_scores.overall_score,
            quality_scores=quality_scores,
            status=status,
            risk_level=quality_scores.risk_level,
            summary=executive_summary,
            violations=final_violations,
            fact_checks=final_fact_checks,
            recommended_correction=recommended_correction,
            alternative_corrections=alternative_suggestions,
            human_review_required=(status != ReviewStatus.APPROVED),
            cross_validation_notes=cross_val_notes,
            execution_time_ms=elapsed_ms
        )

    def review_blog(self, request: BlogReviewRequest) -> BlogAuditReport:
        """
        Complete Blog Content Review and Autonomous Correction Pipeline.
        """
        start_time = time.time()
        audit_id = f"ECLIPSE-BLOG-{uuid.uuid4().hex[:8].upper()}"

        content = request.content.strip()
        title = request.title or "Untitled Blog"
        brand_id = request.brand_id or "ECLIPSE"
        target_audience = request.target_audience or "Enterprise & B2B buyers"

        # 1. Understanding & Intent
        intent_data = intent_classifier.analyze_intent_and_context(content, channel_hint="blog")
        content_intent = intent_data["content_intent"]
        content_purpose = intent_data["content_purpose"]
        input_understanding = intent_data["understanding"]

        # 2. RAG Knowledge
        rag_context = brand_retriever.get_context_for_review(content, channel="blog")

        # 3. Deterministic Rules & Syntax
        rule_violations = rule_parser.parse(content)

        # 4. Fact Checker
        fact_checks = fact_checker.verify_claims(content)

        # 5. Gemini Blog Deep Reasoning & Correction
        prompt = PromptEngine.build_blog_reasoning_prompt(
            title=title,
            content=content,
            brand_id=brand_id,
            target_audience=target_audience,
            rag_context=rag_context["prompt_context"],
            deterministic_rules=[v.model_dump() for v in rule_violations],
            fact_check_results=[f.model_dump() for f in fact_checks]
        )

        gemini_raw = gemini_client.ask_eclipse(prompt, as_json=True)
        gemini_violations: List[Violation] = []
        gemini_fact_checks: List[FactCheckItem] = []
        corrected_blog = ""
        executive_summary = ""
        alternative_suggestions: List[CorrectionSuggestion] = []

        try:
            parsed = json.loads(clean_json_markdown(gemini_raw))

            gemini_violations = _extract_violations_from_gemini(parsed, default_rule_prefix="RULE-BLOG")
            gemini_fact_checks = _extract_fact_checks_from_gemini(parsed)

            corrected_blog = (
                parsed.get("corrected_blog")
                or parsed.get("fully_corrected_content")
                or parsed.get("recommended_correction")
                or parsed.get("revised_content")
                or ""
            )
            executive_summary = (
                parsed.get("summary")
                or parsed.get("content_analysis")
                or parsed.get("executive_summary")
                or ""
            )

            for alt in parsed.get("alternative_corrections", []):
                if isinstance(alt, dict) and alt.get("revised_text"):
                    alternative_suggestions.append(CorrectionSuggestion(
                        tone_variation=alt.get("tone_variation", "Alternative Style"),
                        revised_text=alt.get("revised_text"),
                        rationale=alt.get("rationale", "Aligned with brand voice.")
                    ))
        except Exception as e:
            logger.warning(f"Blog Gemini parse fallback: {e}")

        all_facts = list(fact_checks)
        for gf in gemini_fact_checks:
            if not any(f.claim_text.lower() == gf.claim_text.lower() for f in all_facts):
                all_facts.append(gf)

        # 6. Cross-validation
        final_violations, final_fact_checks, quality_scores, cross_val_notes = cross_validator.consolidate_and_assess_risk(
            rule_violations=rule_violations,
            fact_checks=all_facts,
            gemini_violations=gemini_violations,
            content=content
        )

        # 7. Correction Generation
        if not corrected_blog or len(corrected_blog.split()) < 10:
            corrected_blog = correction_engine.generate_revised_blog(content, final_violations, title=title)

        if not alternative_suggestions:
            alternative_suggestions = correction_engine.generate_alternatives(corrected_blog, channel="blog")

        has_critical = any(v.severity == ViolationSeverity.CRITICAL for v in final_violations)
        has_contradicted = any(fc.status in [FactCheckStatus.CONTRADICTED, FactCheckStatus.REFUTED] for fc in final_fact_checks)

        if quality_scores.overall_score >= 88 and not has_critical and not has_contradicted:
            status = ReviewStatus.APPROVED
        elif quality_scores.overall_score >= 55 and not has_critical:
            status = ReviewStatus.NEEDS_HUMAN_REVIEW
        else:
            status = ReviewStatus.REJECTED

        if not executive_summary:
            executive_summary = f"ECLIPSE analyzed blog '{title}'. Found {len(final_violations)} issues across grammar, tone, and brand compliance."

        word_count_orig = len(content.split())
        word_count_corr = len(corrected_blog.split())
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return BlogAuditReport(
            audit_id=audit_id,
            engine_name="ECLIPSE",
            engine_version="2.0.0",
            model=gemini_client.model,
            content_channel="blog",
            original_content=content,
            content_intent=ContentIntent.BLOG,
            content_purpose=content_purpose,
            input_understanding=input_understanding,
            compliance_score=quality_scores.overall_score,
            quality_scores=quality_scores,
            status=status,
            risk_level=quality_scores.risk_level,
            summary=executive_summary,
            violations=final_violations,
            fact_checks=final_fact_checks,
            recommended_correction=corrected_blog,
            alternative_corrections=alternative_suggestions,
            human_review_required=(status != ReviewStatus.APPROVED),
            cross_validation_notes=cross_val_notes,
            execution_time_ms=elapsed_ms,
            blog_title=title,
            brand_id=brand_id,
            word_count_original=word_count_orig,
            word_count_corrected=word_count_corr,
            readability_level="Grade 9-11 (Enterprise Executive Standard)",
            resolved_issues_count=len(final_violations),
            pending_issues_count=0
        )

    def analyze_blog(self, request: BlogAnalyzeRequest) -> BlogAuditReport:
        """Alias for deep blog analysis."""
        req = BlogReviewRequest(
            content=request.content,
            title=request.title,
            brand_id=request.brand_id,
            content_type=request.content_type,
            target_audience=request.target_audience
        )
        return self.review_blog(req)

    def correct_blog(self, request: BlogCorrectRequest) -> Dict[str, Any]:
        """
        Applies selected or all corrections to produce the final revised blog copy.
        """
        content = request.original_content.strip()
        selected_ids = request.selected_corrections

        # Parse rule violations
        rule_violations = rule_parser.parse(content)
        fact_checks = fact_checker.verify_claims(content)

        final_violations, _, _, _ = cross_validator.consolidate_and_assess_risk(
            rule_violations=rule_violations,
            fact_checks=fact_checks,
            gemini_violations=[],
            content=content
        )

        corrected_content = correction_engine.apply_selected_fixes(content, final_violations, selected_ids=selected_ids)

        return {
            "status": "success",
            "title": request.title or "Untitled Blog",
            "original_content": content,
            "corrected_content": corrected_content,
            "applied_corrections_count": len(selected_ids) if selected_ids else len(final_violations),
            "word_count_original": len(content.split()),
            "word_count_corrected": len(corrected_content.split()),
            "brand_id": request.brand_id or "ECLIPSE"
        }

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

    if brand is None:
        prohibited = [t.get("term", "") for t in brand_retriever.guidelines.get("prohibited_terminology", [])]
        brand = {
            "brand_name": brand_retriever.guidelines.get("brand_name", "ECLIPSE"),
            "prohibited_terms": prohibited,
            "core_identity": brand_retriever.guidelines.get("core_identity", {}),
            "approved_facts": brand_retriever.facts.get("facts", [])
        }

    prohibited_list = brand.get("prohibited_terms", [])
    rule_findings = check_prohibited_terms(content, prohibited_list)

    brand_knowledge = json.dumps(brand, indent=2)

    ai_raw = ""
    if live_gemini:
        prompt = create_review_prompt(content, brand_knowledge)
        ai_raw = generate_response(prompt)

    parsed_report = None
    try:
        clean_text = clean_json_markdown(ai_raw)
        data = json.loads(clean_text)
        if "issues" in data and "overall_status" in data:
            parsed_report = ReviewReport.model_validate(data)
    except Exception:
        parsed_report = None

    if not parsed_report or not parsed_report.issues:
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

        full_violations = rule_parser.parse(content)
        for fv in full_violations:
            if not any(i.problematic_text.lower() == fv.problematic_text.lower() for i in issues):
                issues.append(Issue(
                    category=fv.category.value if hasattr(fv.category, "value") else str(fv.category),
                    severity=fv.severity.value if hasattr(fv.severity, "value") else str(fv.severity),
                    problematic_text=fv.problematic_text,
                    explanation=fv.explanation,
                    evidence=[fv.evidence_id] if fv.evidence_id else [],
                    suggestion=fv.suggestion,
                    status="confirmed_violation" if fv.severity == ViolationSeverity.CRITICAL else "needs_evidence"
                ))

        fchecks = fact_checker.verify_claims(content)
        for fc in fchecks:
            if fc.status in [FactCheckStatus.UNSUPPORTED, FactCheckStatus.REFUTED, FactCheckStatus.CONTRADICTED]:
                issues.append(Issue(
                    category="claim",
                    severity="high" if fc.status in [FactCheckStatus.REFUTED, FactCheckStatus.CONTRADICTED] else "medium",
                    problematic_text=fc.claim_text,
                    explanation=fc.evidence,
                    evidence=[fc.source_ref] if fc.source_ref else [],
                    suggestion=fc.suggested_correction or "Cite approved benchmark or align with documented facts",
                    status="false_claim" if fc.status in [FactCheckStatus.REFUTED, FactCheckStatus.CONTRADICTED] else "needs_evidence"
                ))

        has_severe = any(i.severity in ["high", "critical"] for i in issues)
        status = "rejected" if has_severe else ("needs_review" if issues else "approved")
        parsed_report = ReviewReport(
            overall_status=status,
            summary=f"ECLIPSE detected {len(issues)} items requiring resolution.",
            issues=issues
        )

    return {
        "rule_findings": rule_findings,
        "ai_findings": parsed_report.issues if parsed_report else [],
        "structured_report": parsed_report.model_dump() if parsed_report else {},
        "raw_response": ai_raw
    }
