import pytest
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
from schemas.request_schema import ReviewRequest, ChatRequest
from schemas.audit_schema import FactCheckStatus

def test_eclipse_identity():
    assert ECLIPSE_IDENTITY["name"] == "ECLIPSE"
    assert ECLIPSE_IDENTITY["project"] == "ECLIPSE"
    assert "Google Gemini" in ECLIPSE_IDENTITY["powered_by"]
    assert "You are ECLIPSE" in ECLIPSE_SYSTEM_PROMPT

def test_brand_retriever_load():
    assert brand_retriever.guidelines is not None
    assert "prohibited_terminology" in brand_retriever.guidelines
    assert len(brand_retriever.facts.get("facts", [])) > 0

def test_brand_retriever_search():
    sample_text = "We guarantee 99.99% uptime and zero cheap bugs in eclipse."
    context = brand_retriever.get_context_for_review(sample_text)
    assert len(context["matched_rules"]) > 0
    assert len(context["matched_facts"]) > 0

def test_rule_parser_detects_prohibitions():
    text = "Our software is 100% bug-free and completely unbreakable."
    violations = rule_parser.parse(text)
    problematic_words = [v.problematic_text.lower() for v in violations]
    assert "100% bug-free" in problematic_words
    assert "unbreakable" in problematic_words

def test_rule_parser_detects_casing():
    text = "Try eclipse intelligence now."
    violations = rule_parser.parse(text)
    problematic_words = [v.problematic_text for v in violations]
    assert "eclipse" in problematic_words

def test_fact_checker_verified_and_refuted():
    v_text = "ECLIPSE guarantees a 99.99% uptime SLA for all enterprises."
    checks = fact_checker.verify_claims(v_text)
    assert len(checks) >= 1
    assert checks[0].status == FactCheckStatus.VERIFIED

    r_text = "ECLIPSE provides a 100% uptime SLA."
    refuted_checks = fact_checker.verify_claims(r_text)
    assert len(refuted_checks) >= 1
    assert refuted_checks[0].status == FactCheckStatus.REFUTED

def test_correction_engine():
    text = "eclipse provides cheap pricing and 100% bug-free software."
    violations = rule_parser.parse(text)
    fixed = correction_engine.apply_deterministic_fixes(text, violations)
    assert "ECLIPSE" in fixed
    assert "cost-effective" in fixed
    assert "rigorously tested enterprise software" in fixed

def test_api_health():
    data = health_check()
    assert data["engine"] == "ECLIPSE"
    assert data["project"] == "ECLIPSE"

def test_api_rules_and_facts():
    rules = get_brand_rules()
    assert "prohibited_terminology" in rules

    facts = get_verified_facts()
    assert "facts" in facts

def test_api_review_pipeline():
    payload = ReviewRequest(
        content="Switch to eclipse now! Our revolutionary AI is 100% bug-free with 100% uptime guaranteed. We destroy our competitors and offer cheap pricing.",
        channel="ad_copy"
    )
    report = review_content_endpoint(payload)
    assert report.engine_name == "ECLIPSE"
    assert report.compliance_score < 90
    assert len(report.violations) > 0
    assert report.recommended_correction is not None

def test_api_chat_endpoint():
    payload = ChatRequest(message="Can I advertise that our software is unbreakable?")
    response = chat_with_eclipse(payload)
    assert response.engine_name == "ECLIPSE"
    assert len(response.reply) > 0
