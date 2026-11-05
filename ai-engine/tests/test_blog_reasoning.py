import sys
import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.review_engine import review_engine
from app.fact_checker import fact_checker
from app.rule_parser import rule_parser
from app.intent_classifier import intent_classifier
from schemas.request_schema import BlogReviewRequest, BlogAnalyzeRequest, BlogCorrectRequest
from schemas.audit_schema import FactCheckStatus, ViolationSeverity, ViolationCategory

def test_blog_reasoning_pipeline():
    print("============================================================")
    print("TESTING ECLIPSE INTELLIGENT REASONING & BLOG CORRECTION")
    print("============================================================")

    # 1. Test Input Understanding & Intent Classification
    sample_blog = """# Why Eclipse Is India's No. 1 Platform

Our brand new NovaBook X1 has 32 GB RAM and provides the guaranteed cheapest cloud infrastructure in the world.
We guarantee 100% bug-free deployment and teh system will obliterate our pathetic competitors.
ECLIPSE is certified SOC 2 and GDPR compliant. Buy now to recieve special discounts!
"""
    print("[1/5] Testing Intent Classification & Input Understanding...")
    intent_res = intent_classifier.analyze_intent_and_context(sample_blog, channel_hint="blog")
    assert intent_res["content_intent"].value == "blog"
    assert "NovaBook" in intent_res["understanding"].products_mentioned or "NovaBook X1" in intent_res["understanding"].products_mentioned
    print(f"  -> PASS: Classified as '{intent_res['content_intent'].value}', Purpose '{intent_res['content_purpose'].value}'.")

    # 2. Test Claim-Level Fact Verification (NovaBook 32 GB vs 16 GB)
    print("[2/5] Testing Claim Fact Verification (NovaBook X1 RAM & 100% bug-free)...")
    facts = fact_checker.verify_claims(sample_blog)
    novabook_facts = [f for f in facts if "novabook" in f.claim_text.lower() or "ram" in f.claim_text.lower()]
    assert len(novabook_facts) > 0, "Should detect NovaBook RAM claim"
    assert novabook_facts[0].status == FactCheckStatus.CONTRADICTED, "32 GB RAM must be CONTRADICTED by FACT-007"
    assert novabook_facts[0].source_ref == "FACT-007"
    print(f"  -> PASS: Caught RAM claim contradiction: {novabook_facts[0].claim_text} -> {novabook_facts[0].status.value} (Cited: {novabook_facts[0].source_ref}).")

    # 3. Test Rule & Syntax Parser (Prohibited terms, casing, spelling)
    print("[3/5] Testing Rule Parser (Prohibited terms, superlatives, spelling)...")
    violations = rule_parser.parse(sample_blog)
    v_texts = [v.problematic_text.lower() for v in violations]
    assert any("cheapest" in t for t in v_texts)
    assert any("bug-free" in t for t in v_texts)
    assert any("teh" in t for t in v_texts) or any("recieve" in t for t in v_texts)
    print(f"  -> PASS: Caught {len(violations)} rule & spelling infractions.")

    # 4. Test Complete Blog Review & Autonomous Correction Pipeline
    print("[4/5] Testing review_blog() Full Pipeline...")
    req = BlogReviewRequest(
        title="Why Eclipse Is India's No. 1 Platform",
        content=sample_blog,
        brand_id="ECLIPSE",
        content_type="blog",
        target_audience="Enterprise CTOs & B2B buyers"
    )
    blog_report = review_engine.review_blog(req)
    assert blog_report.audit_id.startswith("ECLIPSE-BLOG-")
    assert blog_report.compliance_score < 80, "Non-compliant draft must have reduced score"
    assert len(blog_report.violations) >= 3, "Must capture rule and factual violations"
    assert len(blog_report.recommended_correction) > 50, "Must produce full corrected blog"
    assert "16 GB RAM" in blog_report.recommended_correction or "16 GB" in blog_report.recommended_correction
    assert "cheapest" not in blog_report.recommended_correction.lower()
    print(f"  -> PASS: Generated BlogAuditReport (Score: {blog_report.compliance_score}/100, Risk: {blog_report.risk_level}).")
    print(f"  -> Corrected Blog Preview: {blog_report.recommended_correction[:120]}...")

    # 5. Test Blog Correction API
    print("[5/5] Testing correct_blog() Action Engine...")
    correct_req = BlogCorrectRequest(
        title="Why Eclipse Is India's No. 1 Platform",
        original_content=sample_blog,
        brand_id="ECLIPSE"
    )
    correct_res = review_engine.correct_blog(correct_req)
    assert correct_res["status"] == "success"
    assert "16 GB RAM" in correct_res["corrected_content"]
    assert "cheapest" not in correct_res["corrected_content"].lower()
    print(f"  -> PASS: Autonomous correction applied {correct_res['applied_corrections_count']} fixes.")

    print("\n============================================================")
    print(" ALL 5/5 INTELLIGENT REASONING & BLOG TESTS PASSED! ")
    print("============================================================\n")

if __name__ == "__main__":
    test_blog_reasoning_pipeline()

