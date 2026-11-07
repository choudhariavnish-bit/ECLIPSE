from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class ViolationSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class ViolationCategory(str, Enum):
    PROHIBITED_TERM = "prohibited_term"
    UNSUPPORTED_CLAIM = "unsupported_claim"
    FALSE_CLAIM = "false_claim"
    CONTRADICTED_FACT = "contradicted_fact"
    TONE_VIOLATION = "tone_violation"
    FORMATTING_RULE = "formatting_rule"
    LEGAL_RISK = "legal_risk"
    GRAMMAR_ERROR = "grammar"
    SPELLING_ERROR = "spelling"
    PUNCTUATION_ERROR = "punctuation"
    SENTENCE_STRUCTURE = "sentence_structure"
    REPETITIVE_CONTENT = "repetitive_content"
    WEAK_VOCABULARY = "weak_vocabulary"
    CONTENT_QUALITY = "content_quality"

class FactCheckStatus(str, Enum):
    VERIFIED = "verified"
    UNSUPPORTED = "unsupported"
    REFUTED = "refuted"
    CONTRADICTED = "contradicted"
    NEEDS_HUMAN_REVIEW = "needs_human_review"

class ReviewStatus(str, Enum):
    APPROVED = "approved"
    NEEDS_HUMAN_REVIEW = "needs_human_review"
    REJECTED = "rejected"

class ContentIntent(str, Enum):
    ADVERTISEMENT = "advertisement"
    SOCIAL_MEDIA = "social_media"
    BLOG = "blog"
    EMAIL = "email"
    PRODUCT_DESCRIPTION = "product_description"
    PRESS_RELEASE = "press_release"
    GENERAL_DOCUMENT = "general_document"
    OTHER = "other"

class ContentPurpose(str, Enum):
    INFORMATIVE = "informative"
    PROMOTIONAL = "promotional"
    PERSUASIVE = "persuasive"
    EDUCATIONAL = "educational"
    TRANSACTIONAL = "transactional"

class Violation(BaseModel):
    id: str = Field(description="Unique violation identifier")
    category: ViolationCategory = Field(description="Category of the detected violation")
    severity: ViolationSeverity = Field(description="Severity impact level")
    problematic_text: str = Field(description="Exact snippet or phrase violating guidelines")
    original_sentence: Optional[str] = Field(default=None, description="Full surrounding sentence")
    explanation: str = Field(description="Detailed explanation of why this violates brand rules")
    guideline_reference: str = Field(default="ECLIPSE Brand Governance Standards", description="Rule or guideline citation violated")
    rule_id: Optional[str] = Field(default=None, description="Exact rule code (e.g., RULE-PROHIB-01)")
    evidence_id: Optional[str] = Field(default=None, description="Approved Fact ID citation if applicable")
    suggestion: str = Field(description="Specific actionable fix or replacement phrase")
    corrected_sentence: Optional[str] = Field(default=None, description="Complete corrected sentence")
    requires_human_review: bool = Field(default=False, description="Flag indicating ambiguous or subjective decision")

    # Standardized contract fields for universal frontend interoperability
    title: Optional[str] = Field(default=None, description="Short human-readable finding title")
    location: Optional[Dict[str, int]] = Field(default=None, description="Character index offset {start, end}")
    confidence: float = Field(default=0.95, description="Confidence level 0.0 to 1.0")
    status: str = Field(default="detected", description="detected, pending, accepted, rejected")
    evidence: List[str] = Field(default_factory=list, description="Associated fact or policy citations")

    # Universal compatibility aliases
    flaggedText: Optional[str] = Field(default=None)
    original_text: Optional[str] = Field(default=None)
    issue: Optional[str] = Field(default=None)
    plainEnglishReason: Optional[str] = Field(default=None)
    suggestedFix: Optional[str] = Field(default=None)
    recommendation: Optional[str] = Field(default=None)
    ruleCode: Optional[str] = Field(default=None)

    @model_validator(mode="after")
    def populate_aliases(self) -> "Violation":
        if not self.title:
            self.title = self.explanation.split(".")[0] if "." in self.explanation else self.explanation
        if not self.flaggedText:
            self.flaggedText = self.problematic_text
        if not self.original_text:
            self.original_text = self.problematic_text
        if not self.issue:
            self.issue = self.explanation
        if not self.plainEnglishReason:
            self.plainEnglishReason = self.explanation
        if not self.suggestedFix:
            self.suggestedFix = self.suggestion
        if not self.recommendation:
            self.recommendation = self.suggestion
        if not self.ruleCode:
            self.ruleCode = self.rule_id or "RULE-ECLIPSE"
        if not self.evidence and self.guideline_reference:
            self.evidence = [self.guideline_reference]
        return self

class FactCheckItem(BaseModel):
    claim_text: str = Field(description="Extracted empirical, numerical, or product claim")
    status: FactCheckStatus = Field(description="Verification status against verified knowledge base")
    evidence: str = Field(description="Corroborating proof or explanation of discrepancy")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence score 0.0 to 1.0")
    source_ref: Optional[str] = Field(default=None, description="Approved Fact ID or whitepaper citation")
    approved_info: Optional[str] = Field(default=None, description="Approved official specification or baseline")
    suggested_correction: Optional[str] = Field(default=None, description="Factual correction for the claim")

class CorrectionSuggestion(BaseModel):
    tone_variation: str = Field(description="Style variant, e.g., 'Executive & Authoritative' or 'Engaging & Direct'")
    revised_text: str = Field(description="Full corrected text suggestion")
    rationale: str = Field(description="Why this variation works best")

class InputUnderstanding(BaseModel):
    main_topic: str = Field(default="General Enterprise Software", description="Primary topic of content")
    purpose: str = Field(default="Promotional & Informational", description="Inferred purpose")
    intended_audience: str = Field(default="Enterprise & B2B buyers", description="Identified audience")
    products_mentioned: List[str] = Field(default_factory=list, description="Products or services named")
    claims_extracted: List[str] = Field(default_factory=list, description="Extracted key statements & claims")
    numerical_claims: List[str] = Field(default_factory=list, description="Numerical & quantitative statements")
    comparisons: List[str] = Field(default_factory=list, description="Comparative statements")
    calls_to_action: List[str] = Field(default_factory=list, description="Calls to action detected")
    tone_and_style: str = Field(default="Professional", description="Detected tone and style")

class QualityScores(BaseModel):
    overall_score: int = Field(ge=0, le=100, default=85)
    grammar_score: int = Field(ge=0, le=100, default=95)
    brand_compliance_score: int = Field(ge=0, le=100, default=80)
    content_quality_score: int = Field(ge=0, le=100, default=85)
    drift_score: int = Field(ge=0, le=100, default=15)
    risk_level: str = Field(default="LOW", description="CRITICAL, HIGH, MEDIUM, LOW, INFO")

class BrandAuditReport(BaseModel):
    audit_id: str = Field(description="Unique identifier for the audit report")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    engine_name: str = Field(default="ECLIPSE", description="AI Governance Engine name")
    engine_version: str = Field(default="2.0.0")
    model: str = Field(default="gemini-3.5-flash-lite", description="Underlying Gemini model utilized")
    content_channel: str = Field(default="general", description="Marketing channel (ad, social, email, blog)")
    original_content: str = Field(description="User submitted raw text")
    content_intent: ContentIntent = Field(default=ContentIntent.GENERAL_DOCUMENT)
    content_purpose: ContentPurpose = Field(default=ContentPurpose.INFORMATIVE)
    input_understanding: Optional[InputUnderstanding] = Field(default=None)
    compliance_score: int = Field(ge=0, le=100, description="Overall compliance score from 0 to 100")
    quality_scores: Optional[QualityScores] = Field(default=None)
    status: ReviewStatus = Field(description="Audit outcome decision")
    risk_level: str = Field(default="LOW")
    summary: str = Field(description="Executive summary of the review findings")
    violations: List[Violation] = Field(default_factory=list, description="Detected violations")
    findings: List[Violation] = Field(default_factory=list, description="Universal alias for violations")
    fact_checks: List[FactCheckItem] = Field(default_factory=list, description="Claim verifications")
    recommended_correction: str = Field(description="Primary suggested compliant rewrite")
    corrected_content: Optional[str] = Field(default=None, description="Alias for recommended_correction")
    cleanTextSuggested: Optional[str] = Field(default=None, description="Direct convenience alias for recommended_correction")
    overall_assessment: Optional[str] = Field(default=None, description="Standardized assessment summary")
    analysis_summary: Optional[Dict[str, Any]] = Field(default=None, description="Aggregate metric statistics")
    alternative_corrections: List[CorrectionSuggestion] = Field(default_factory=list, description="Alternative rewrite options")
    driftScore: Optional[int] = Field(default=None)
    isMajorDrift: Optional[bool] = Field(default=None)
    engine: Optional[str] = Field(default="ECLIPSE AI")
    model: Optional[str] = Field(default="Google Gemini")
    human_review_required: bool = Field(default=False)
    cross_validation_notes: Optional[str] = Field(default=None)
    execution_time_ms: float = Field(default=0.0, description="Pipeline latency in milliseconds")

    @model_validator(mode="after")
    def sync_findings_and_summary(self) -> "BrandAuditReport":
        if not self.findings and self.violations:
            self.findings = list(self.violations)
        elif not self.violations and self.findings:
            self.violations = list(self.findings)
        if not self.corrected_content and self.recommended_correction:
            self.corrected_content = self.recommended_correction
        if not self.cleanTextSuggested:
            self.cleanTextSuggested = self.recommended_correction or self.corrected_content
        if not self.overall_assessment and self.summary:
            self.overall_assessment = self.summary
        if self.driftScore is None and self.quality_scores:
            self.driftScore = self.quality_scores.drift_score
        if self.isMajorDrift is None:
            self.isMajorDrift = (self.driftScore is not None and self.driftScore >= 70) or self.risk_level == "CRITICAL"

        tot = len(self.violations)
        crit = sum(1 for v in self.violations if getattr(v.severity, "value", str(v.severity)).lower() == "critical")
        high = sum(1 for v in self.violations if getattr(v.severity, "value", str(v.severity)).lower() == "high")
        med = sum(1 for v in self.violations if getattr(v.severity, "value", str(v.severity)).lower() == "medium")
        low = sum(1 for v in self.violations if getattr(v.severity, "value", str(v.severity)).lower() in ("low", "info"))
        ver = sum(1 for fc in self.fact_checks if getattr(fc.status, "value", str(fc.status)).lower() == "verified")
        unsupp = sum(1 for fc in self.fact_checks if getattr(fc.status, "value", str(fc.status)).lower() in ("unsupported", "needs_human_review"))

        self.analysis_summary = {
            "total_issues": tot,
            "critical": crit,
            "high": high,
            "medium": med,
            "low": low,
            "verified_claims": ver,
            "unsupported_claims": unsupp
        }
        return self

class BlogAuditReport(BrandAuditReport):
    blog_title: Optional[str] = Field(default=None, description="Title of the submitted blog")
    brand_id: str = Field(default="ECLIPSE", description="Target brand identifier")
    word_count_original: int = Field(default=0)
    word_count_corrected: int = Field(default=0)
    readability_level: str = Field(default="Grade 8-10 (Optimal for B2B)")
    resolved_issues_count: int = Field(default=0)
    pending_issues_count: int = Field(default=0)

class TextElement(BaseModel):
    id: str = Field(description="Unique element ID")
    text: str = Field(description="Extracted OCR text string")
    element_type: str = Field(default="body", description="headline, subtitle, body, cta, pricing, contact, disclaimer, uncertain")
    position_estimate: Optional[str] = Field(default=None, description="top_center, middle_left, bottom_right, etc.")
    confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    is_uncertain: bool = Field(default=False, description="Flag for blurry or partially visible text")

class VisualDesignAnalysis(BaseModel):
    contrast_ratio: str = Field(default="12:1 (PASS)", description="Contrast ratio measurement, e.g., '2.4:1 (FAIL)'")
    wcag_status: str = Field(default="PASS", description="PASS, FAIL, WARNING")
    visual_hierarchy_rating: str = Field(default="Optimal", description="Optimal, Needs Improvement, Poor")
    detected_colors: List[str] = Field(default_factory=list, description="Detected hex or color names")
    brand_colors_aligned: bool = Field(default=True)
    logo_detected: bool = Field(default=True)
    logo_notes: Optional[str] = Field(default=None)
    cta_detected: bool = Field(default=True)
    cta_text: Optional[str] = Field(default=None)
    cta_notes: Optional[str] = Field(default=None)
    layout_issues: List[str] = Field(default_factory=list)

class ImageCorrectionPlan(BaseModel):
    headline_correction: Optional[Dict[str, str]] = None
    cta_correction: Optional[Dict[str, str]] = None
    body_corrections: List[Dict[str, str]] = Field(default_factory=list)
    visual_recommendations: List[str] = Field(default_factory=list)
    revised_clean_text: str = Field(default="")

class ImageAuditReport(BaseModel):
    audit_id: str = Field(description="Unique image audit report ID")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    engine_name: str = Field(default="ECLIPSE")
    engine_version: str = Field(default="2.0.0")
    model: str = Field(default="gemini-3.5-flash-lite")
    image_filename: Optional[str] = Field(default=None)
    detected_content_type: str = Field(default="marketing_poster")
    brand_name_identified: str = Field(default="ECLIPSE")
    communication_intent: str = Field(default="Promotional")
    extracted_text: str = Field(default="", description="Full raw OCR text in reading order")
    text_elements: List[TextElement] = Field(default_factory=list)
    visual_design: VisualDesignAnalysis = Field(default_factory=VisualDesignAnalysis)
    compliance_score: int = Field(ge=0, le=100, default=85)
    quality_scores: QualityScores = Field(default_factory=QualityScores)
    status: ReviewStatus = Field(default=ReviewStatus.APPROVED)
    risk_level: str = Field(default="LOW", description="CRITICAL, HIGH, MEDIUM, LOW, INFO")
    summary: str = Field(default="")
    overall_assessment: Optional[str] = Field(default=None)
    violations: List[Violation] = Field(default_factory=list)
    findings: List[Violation] = Field(default_factory=list)
    analysis_summary: Optional[Dict[str, Any]] = None
    fact_checks: List[FactCheckItem] = Field(default_factory=list)
    correction_plan: Optional[ImageCorrectionPlan] = None
    execution_time_ms: float = Field(default=0.0)

    @model_validator(mode="after")
    def sync_image_findings(self) -> "ImageAuditReport":
        if not self.findings and self.violations:
            self.findings = list(self.violations)
        elif not self.violations and self.findings:
            self.violations = list(self.findings)
        if not self.overall_assessment and self.summary:
            self.overall_assessment = self.summary

        tot = len(self.violations)
        crit = sum(1 for v in self.violations if getattr(v.severity, "value", str(v.severity)).lower() == "critical")
        high = sum(1 for v in self.violations if getattr(v.severity, "value", str(v.severity)).lower() == "high")
        med = sum(1 for v in self.violations if getattr(v.severity, "value", str(v.severity)).lower() == "medium")
        low = sum(1 for v in self.violations if getattr(v.severity, "value", str(v.severity)).lower() in ("low", "info"))
        ver = sum(1 for fc in self.fact_checks if getattr(fc.status, "value", str(fc.status)).lower() == "verified")
        unsupp = sum(1 for fc in self.fact_checks if getattr(fc.status, "value", str(fc.status)).lower() in ("unsupported", "needs_human_review"))

        self.analysis_summary = {
            "total_issues": tot,
            "critical": crit,
            "high": high,
            "medium": med,
            "low": low,
            "verified_claims": ver,
            "unsupported_claims": unsupp
        }
        return self
