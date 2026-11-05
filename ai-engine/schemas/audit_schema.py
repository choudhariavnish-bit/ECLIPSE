from pydantic import BaseModel, Field
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
    fact_checks: List[FactCheckItem] = Field(default_factory=list, description="Claim verifications")
    recommended_correction: str = Field(description="Primary suggested compliant rewrite")
    alternative_corrections: List[CorrectionSuggestion] = Field(default_factory=list, description="Alternative rewrite options")
    human_review_required: bool = Field(default=False)
    cross_validation_notes: Optional[str] = Field(default=None)
    execution_time_ms: float = Field(default=0.0, description="Pipeline latency in milliseconds")

class BlogAuditReport(BrandAuditReport):
    blog_title: Optional[str] = Field(default=None, description="Title of the submitted blog")
    brand_id: str = Field(default="ECLIPSE", description="Target brand identifier")
    word_count_original: int = Field(default=0)
    word_count_corrected: int = Field(default=0)
    readability_level: str = Field(default="Grade 8-10 (Optimal for B2B)")
    resolved_issues_count: int = Field(default=0)
    pending_issues_count: int = Field(default=0)
