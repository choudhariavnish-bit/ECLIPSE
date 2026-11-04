import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import (
    health_check,
    get_brand_rules,
    get_verified_facts,
    review_content_endpoint,
    chat_with_eclipse
)
from app.system_prompt import ECLIPSE_SYSTEM_PROMPT, ECLIPSE_IDENTITY
from app.brand_retriever import brand_retriever
from app.rule_parser import rule_parser
from app.fact_checker import fact_checker
from app.correction_engine import correction_engine
from schemas.audit_schema import FactCheckStatus, ReviewStatus
from schemas.request_schema import ReviewRequest, ChatRequest

def run_all_tests():
    print("=" * 65)
    print(" ECLIPSE AI Engine — Automated Test Suite")
    print("=" * 65)

    # 1. Identity & System Instructions
    print("[1/8] Checking ECLIPSE Official Persona & Identity...")
    assert ECLIPSE_IDENTITY["name"] == "ECLIPSE", "Engine name must be ECLIPSE"
    assert ECLIPSE_IDENTITY["project"] == "ECLIPSE", "Project name must be ECLIPSE"
    assert "Google Gemini" in ECLIPSE_IDENTITY["powered_by"]
    assert "Your name is ECLIPSE." in ECLIPSE_SYSTEM_PROMPT
    print("  -> PASS: Verified ECLIPSE name & Gemini-powered identity.")

    # 2. Knowledge Retrieval (RAG)
    print("[2/8] Checking Brand Knowledge Retriever (RAG)...")
    sample_text = "We guarantee 99.99% uptime and zero cheap bugs in eclipse."
    context = brand_retriever.get_context_for_review(sample_text)
    assert len(context["matched_rules"]) > 0, "Should match prohibited terms"
    assert len(context["matched_facts"]) > 0, "Should match 99.99% uptime SLA"
    print(f"  -> PASS: Retrieved {len(context['matched_rules'])} rules and {len(context['matched_facts'])} facts.")

    # 3. Deterministic Rule Parser
    print("[3/8] Checking Rule Parser (Prohibited terms, casing & superlatives)...")
    bad_text = "Try eclipse. Our tool is 100% bug-free and completely unbreakable."
    violations = rule_parser.parse(bad_text)
    viol_terms = [v.problematic_text.lower() for v in violations]
    assert "100% bug-free" in viol_terms
    assert "unbreakable" in viol_terms
    assert "eclipse" in viol_terms
    print(f"  -> PASS: Caught all {len(violations)} guideline infractions.")

    # 4. Fact Checker
    print("[4/8] Checking Fact Checker (Approved Evidence vs False Claims)...")
    ver_text = "ECLIPSE guarantees a 99.99% uptime SLA."
    ver_checks = fact_checker.verify_claims(ver_text)
    assert any(c.status == FactCheckStatus.VERIFIED for c in ver_checks)

    false_text = "ECLIPSE guarantees 100% uptime SLA."
    false_checks = fact_checker.verify_claims(false_text)
    assert any(c.status == FactCheckStatus.REFUTED for c in false_checks)
    print("  -> PASS: 99.99% SLA verified; impossible 100% SLA refuted.")

    # 5. Correction Engine
    print("[5/8] Checking Correction Engine...")
    dirty_copy = "eclipse offers cheap pricing and 100% bug-free service."
    v_list = rule_parser.parse(dirty_copy)
    corrected = correction_engine.apply_deterministic_fixes(dirty_copy, v_list)
    assert "ECLIPSE" in corrected
    assert "cost-effective" in corrected
    assert "rigorously tested" in corrected
    print(f"  -> PASS: Auto-corrected -> \"{corrected}\"")

    # 6. Health & Config API Endpoint
    print("[6/8] Checking GET /api/v1/health...")
    health = health_check()
    assert health["engine"] == "ECLIPSE"
    assert health["project"] == "ECLIPSE"
    assert health["status"] == "online"
    print(f"  -> PASS: Engine: {health['engine']}, Model: {health['model']}, Status: {health['status']}")

    # 7. Knowledge Endpoints (/rules, /facts)...
    print("[7/8] Checking Knowledge Endpoints (/rules, /facts)...")
    rules = get_brand_rules()
    facts = get_verified_facts()
    assert "prohibited_terminology" in rules
    assert len(facts["facts"]) > 0
    print(f"  -> PASS: Loaded {len(rules['prohibited_terminology'])} prohibited terms, {len(facts['facts'])} facts.")

    # 8. Full Audit Pipeline & Chat Endpoints
    print("[8/8] Checking Review Pipeline & Chat Endpoints...")
    review_req = ReviewRequest(
        content="Switch to eclipse now! Our revolutionary AI is 100% bug-free with 100% uptime guaranteed. We destroy our competitors and offer cheap pricing.",
        channel="ad_copy"
    )
    report = review_content_endpoint(review_req)
    assert report.engine_name == "ECLIPSE"
    assert report.compliance_score < 70, f"Expected low score for bad copy, got {report.compliance_score}"
    assert len(report.violations) >= 3
    assert report.status in [ReviewStatus.REJECTED, ReviewStatus.NEEDS_HUMAN_REVIEW]
    assert report.recommended_correction is not None

    chat_req = ChatRequest(message="Hello ECLIPSE, what are your core responsibilities?")
    chat_resp = chat_with_eclipse(chat_req)
    assert chat_resp.engine_name == "ECLIPSE"
    assert len(chat_resp.reply) > 0
    print(f"  -> PASS: Audit generated (Score: {report.compliance_score}, Violations: {len(report.violations)})")
    print(f"  -> PASS: ECLIPSE Chat responded: \"{chat_resp.reply[:60]}...\"")

    print("=" * 65)
    print(" ALL 8/8 ECLIPSE AI ENGINE CHECKS PASSED SUCCESSFULLY! ")
    print("=" * 65)

if __name__ == "__main__":
    run_all_tests()
