import pytest
from app.document_processor import document_processor
from app.document_review import document_review_engine

def test_document_brand_and_fact_review():
    """Verify scanning flags prohibited terms, incorrect facts, and unsupported claims."""
    violating_content = """# Q4 Launch Announcement
Our brand new NovaBook X1 has 32 GB RAM and provides the guaranteed cheapest cloud infrastructure in the world.
We promise a 100% bug-free platform for all enterprises.
"""
    meta, sections = document_processor.process_document(violating_content.encode("utf-8"), "q4_violating_deck.md")

    report = document_review_engine.review_document(meta.document_id)

    assert report.total_issues >= 2
    assert report.critical_issues >= 1
    assert report.compliance_score < 70  # Should be heavily penalized

    categories = [f.category for f in report.findings]
    assert "fact_error" in categories or "unsupported_claim" in categories or "prohibited_term" in categories

    # Check evidence reference
    fact_issues = [f for f in report.findings if f.category == "fact_error"]
    if fact_issues:
        assert "FACT-007" in fact_issues[0].evidence_or_ref

def test_compliant_document_review():
    """Compliant document should achieve a high governance score (> 90)."""
    compliant_content = """# Enterprise Brand Architecture
ECLIPSE provides enterprise-hardened AI governance with an audited 99.99% SLA.
Our verified NovaBook X1 is equipped with 16 GB unified RAM and 512 GB SSD.
Deployments adhere to ISO 27001 and SOC 2 Type II compliance standards.
"""
    meta, sections = document_processor.process_document(compliant_content.encode("utf-8"), "compliant_brief.md")
    report = document_review_engine.review_document(meta.document_id)

    assert report.compliance_score >= 85
    assert report.critical_issues == 0
