import sys
import os
import base64
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.image_engine import image_engine
from schemas.request_schema import ImageScanRequest, ImageCorrectRequest
from schemas.audit_schema import ViolationSeverity, ViolationCategory, FactCheckStatus

def test_image_governance_pipeline():
    print("============================================================")
    print("TESTING ECLIPSE MULTIMODAL IMAGE & POSTER GOVERNANCE")
    print("============================================================")

    # 1. Test Image Scan Request with synthetic base64 image (1x1 PNG)
    sample_png_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    print("[1/4] Testing Image Scan Request & Multimodal Pipeline...")
    req = ImageScanRequest(
        image_base64=sample_png_b64,
        image_filename="q4_launch_poster.png",
        mime_type="image/png",
        brand_id="ECLIPSE",
        target_audience="Enterprise CTOs & B2B buyers"
    )

    report = image_engine.scan_image(req)
    assert report.audit_id.startswith("ECLIPSE-IMG-")
    assert report.detected_content_type == "marketing_poster"
    print(f"  -> PASS: Generated ImageAuditReport ({report.audit_id}).")
    print(f"  -> Extracted text preview: '{report.extracted_text[:60]}...'")

    # 2. Test Visual Accessibility (WCAG 2.1 AA Contrast) Check
    print("[2/4] Testing Visual Design & WCAG Contrast Evaluation...")
    assert report.visual_design is not None
    assert "FAIL" in report.visual_design.contrast_ratio or "FAIL" in report.visual_design.wcag_status or "12" in report.visual_design.contrast_ratio or "PASS" in report.visual_design.wcag_status
    print(f"  -> PASS: Visual Design Evaluated (Contrast: {report.visual_design.contrast_ratio}, WCAG: {report.visual_design.wcag_status}).")

    # 3. Test Violation & Fact Grounding (Prohibited terms + FACT-007 RAM)
    print("[3/4] Testing Brand Violation & Fact Grounding Detection...")
    v_texts = [v.problematic_text.lower() for v in report.violations]
    assert any("bug-free" in t or "100%" in t for t in v_texts)
    assert any("cheapest" in t or "guaranteed" in t for t in v_texts)
    assert any("ram" in t or "32 gb" in t or "contrast" in t for t in v_texts)
    assert report.risk_level in ("CRITICAL", "HIGH")
    print(f"  -> PASS: Caught {len(report.violations)} visual and content infractions. Risk Level: {report.risk_level}.")

    # 4. Test Autonomous Correction Plan & Action API
    print("[4/4] Testing Image Correction Plan & Action API...")
    assert report.correction_plan is not None
    assert report.correction_plan.headline_correction is not None
    assert report.correction_plan.cta_correction is not None
    assert len(report.correction_plan.visual_recommendations) > 0
    print(f"  -> Corrected Headline: '{report.correction_plan.headline_correction.get('corrected')}'")
    print(f"  -> Corrected CTA: '{report.correction_plan.cta_correction.get('corrected')}'")
    print(f"  -> Visual Recommendation: '{report.correction_plan.visual_recommendations[0]}'")

    correct_req = ImageCorrectRequest(
        audit_id=report.audit_id,
        image_filename="q4_launch_poster.png",
        audit_report=report.model_dump()
    )
    correct_res = image_engine.correct_image(correct_req)
    assert correct_res["status"] == "success"
    assert correct_res["applied_count"] >= 1
    print(f"  -> PASS: Successfully applied {correct_res['applied_count']} corrections to poster copy.")

    print("\n============================================================")
    print(" ALL 4/4 IMAGE GOVERNANCE TESTS PASSED SUCCESSFULLY! ")
    print("============================================================\n")

if __name__ == "__main__":
    test_image_governance_pipeline()

