"""
ECLIPSE Engine — Review & Benchmark Test Suite
Round 2 Deliverable: Unit Tests, Schema Validation & Benchmark Evaluation
"""

import os
import sys
import json

try:
    import pytest
except ImportError:
    pytest = None

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.gemini_client import generate_response
from app.prompt_engine import create_review_prompt
from app.rule_parser import check_prohibited_terms
from app.review_engine import review_brand_content
from schemas.review_schema import ReviewReport, Issue

# -------------------------------------------------------------
# Unit Tests
# -------------------------------------------------------------

def test_rule_parser_exact_prohibited_terms():
    """
    Step 3 Verification: Rule parser must identify exact prohibited terms
    without depending on Gemini.
    """
    content = "We provide the guaranteed cheapest laptop with 100% perfect quality."
    prohibited_terms = [
        "guaranteed cheapest",
        "100% perfect"
    ]
    findings = check_prohibited_terms(content, prohibited_terms)
    assert len(findings) == 2
    matched = [f["matched_text"] for f in findings]
    assert "guaranteed cheapest" in matched
    assert "100% perfect" in matched
    assert all(f["status"] == "confirmed_violation" for f in findings)
    assert all(f["category"] == "terminology" for f in findings)

def test_prompt_engine_creates_prompt():
    """
    Step 2 Verification: Prompt engine formats controlled instruction system.
    """
    content = "Check our enterprise cloud."
    knowledge = json.dumps({"brand_name": "ECLIPSE", "prohibited_terms": ["unbreakable"]})
    prompt = create_review_prompt(content, knowledge)
    assert "You are ECLIPSE." in prompt
    assert "BRAND KNOWLEDGE:" in prompt
    assert "CONTENT:" in prompt
    assert "Never invent evidence." in prompt
    assert "Cite approved fact IDs" in prompt

def test_review_schema_validation():
    """
    Step 4 Verification: Validates ReviewReport and Issue Pydantic models.
    """
    sample_data = {
        "overall_status": "needs_review",
        "summary": "Unsupported promotional claim detected.",
        "issues": [
            {
                "category": "claim",
                "severity": "high",
                "problematic_text": "India's No. 1 laptop",
                "explanation": "No approved evidence supports this ranking.",
                "evidence": [],
                "suggestion": "Explore our latest laptop range.",
                "status": "needs_evidence"
            }
        ]
    }
    report = ReviewReport.model_validate(sample_data)
    assert report.overall_status == "needs_review"
    assert len(report.issues) == 1
    assert report.issues[0].status == "needs_evidence"
    assert report.issues[0].evidence == []

def test_review_brand_content_pipeline():
    """
    Step 5 Verification: review_brand_content combines rule parser,
    brand knowledge, and Gemini with schema validation.
    """
    brand = {
        "brand_name": "ECLIPSE",
        "prohibited_terms": ["guaranteed cheapest", "100% bug-free"],
        "approved_facts": [
            {"fact_id": "FACT-001", "statement": "99.99% uptime SLA"}
        ]
    }
    content = "We provide guaranteed cheapest cloud with 100% bug-free automation."
    result = review_brand_content(content, brand)
    assert "rule_findings" in result
    assert "ai_findings" in result
    assert len(result["rule_findings"]) == 2
    assert result["structured_report"] is not None

# -------------------------------------------------------------
# Benchmark Evaluation Suite (Precision, Recall, Evidence)
# -------------------------------------------------------------

def evaluate_benchmark_dataset(use_live_api: bool = False):
    """
    Section 7 Benchmark Evaluation:
    Evaluates test dataset across all 6 categories:
    - Correct content
    - Wrong terminology
    - Unsupported claim
    - Wrong tone
    - Incorrect fact
    - Ambiguous claim

    Calculates:
    - Precision: TP / (TP + FP)
    - Recall: TP / (TP + FN)
    - False Positive Rate
    - Evidence Validity: Valid Cited Fact IDs / Total Cited Fact IDs
    """
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "knowledge", "test_dataset.json")
    if not os.path.exists(dataset_path):
        if pytest:
            pytest.skip("Test dataset not found")
        return {}

    with open(dataset_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    # Approved fact IDs
    approved_facts_path = os.path.join(os.path.dirname(__file__), "..", "knowledge", "approved_facts.json")
    valid_fact_ids = set()
    if os.path.exists(approved_facts_path):
        with open(approved_facts_path, "r", encoding="utf-8") as f:
            facts_data = json.load(f)
            valid_fact_ids = {f.get("fact_id") for f in facts_data.get("facts", [])}

    tp = 0  # True Positives: Real violations flagged
    fp = 0  # False Positives: Clean content wrongly flagged
    fn = 0  # False Negatives: Real violations missed
    tn = 0  # True Negatives: Clean content correctly approved

    total_citations = 0
    valid_citations = 0

    category_counts = {}

    for item in dataset:
        content = item["content"]
        is_violation = item["is_violation"]
        cat = item["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1

        # Run review engine (deterministic synthesizer for batch evaluation to protect free tier RPM)
        res = review_brand_content(content, live_gemini=use_live_api)
        report = res.get("structured_report") or {}
        issues = report.get("issues", [])
        overall_status = report.get("overall_status", "approved")

        flagged = (len(issues) > 0) or (overall_status in ["needs_review", "rejected"])

        if is_violation and flagged:
            tp += 1
        elif not is_violation and flagged:
            fp += 1
        elif is_violation and not flagged:
            fn += 1
        else:
            tn += 1

        # Check evidence citations validity
        for iss in issues:
            for fid in iss.get("evidence", []):
                total_citations += 1
                if fid in valid_fact_ids:
                    valid_citations += 1

    precision = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 0.0
    recall = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 0.0
    evidence_validity = round(valid_citations / total_citations, 4) if total_citations > 0 else 1.0

    metrics = {
        "total_test_drafts": len(dataset),
        "category_distribution": category_counts,
        "true_positives": tp,
        "false_positives": fp,
        "true_negatives": tn,
        "false_negatives": fn,
        "precision": precision,
        "recall": recall,
        "evidence_validity": evidence_validity
    }

    return metrics

def test_benchmark_metrics():
    """Validates that real benchmark metrics are computed and meet quality baselines."""
    metrics = evaluate_benchmark_dataset()
    assert metrics["total_test_drafts"] >= 20
    assert metrics["precision"] >= 0.70, f"Precision below acceptable threshold: {metrics['precision']}"
    assert metrics["recall"] >= 0.70, f"Recall below acceptable threshold: {metrics['recall']}"

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("RUNNING UNIT TESTS")
    print("=" * 60)
    test_rule_parser_exact_prohibited_terms()
    print("  -> test_rule_parser_exact_prohibited_terms: PASSED")
    test_prompt_engine_creates_prompt()
    print("  -> test_prompt_engine_creates_prompt: PASSED")
    test_review_schema_validation()
    print("  -> test_review_schema_validation: PASSED")
    test_review_brand_content_pipeline()
    print("  -> test_review_brand_content_pipeline: PASSED")

    print("\n" + "=" * 60)
    print("RUNNING BENCHMARK EVALUATION (6 TEST CATEGORIES)")
    print("=" * 60)
    m = evaluate_benchmark_dataset()
    print(f"Total Evaluated Drafts: {m['total_test_drafts']}")
    print(f"Categories Breakdown:   {json.dumps(m['category_distribution'], indent=2)}")
    print(f"True Positives (TP):    {m['true_positives']}")
    print(f"False Positives (FP):   {m['false_positives']}")
    print(f"True Negatives (TN):    {m['true_negatives']}")
    print(f"False Negatives (FN):   {m['false_negatives']}")
    print("-" * 60)
    print(f"PRECISION:              {m['precision'] * 100:.2f}%")
    print(f"RECALL:                 {m['recall'] * 100:.2f}%")
    print(f"EVIDENCE VALIDITY:      {m['evidence_validity'] * 100:.2f}%")
    print("=" * 60)
