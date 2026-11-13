from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime

class ViolationSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ViolationCategory(str, Enum):
    PROHIBITED_TERM = "prohibited_term"
    UNSUPPORTED_CLAIM = "unsupported_claim"
    FALSE_CLAIM = "false_claim"
    TONE_VIOLATION = "tone_violation"
    FORMATTING_RULE = "formatting_rule"
    LEGAL_RISK = "legal_risk"

class FactCheckStatus(str, Enum):
    VERIFIED = "verified"
    UNSUPPORTED = "unsupported"
    REFUTED = "refuted"

class ReviewStatus(str, Enum):
    APPROVED = "approved"
    NEEDS_HUMAN_REVIEW = "needs_human_review"
    REJECTED = "rejected"

class Violation(BaseModel):
    id: str = Field(description="Unique violation identifier")
    category: ViolationCategory = Field(description="Category of the detected violation")
    severity: ViolationSeverity = Field(description="Severity impact level")
    problematic_text: str = Field(description="Exact snippet or quote from content violating rules")
    explanation: str = Field(description="Detailed explanation of why this violates brand rules")
    guideline_reference: str = Field(description="Rule or guideline citation violated")
    suggestion: str = Field(description="Specific actionable fix or replacement")

class FactCheckItem(BaseModel):
    claim_text: str = Field(description="Extracted empirical or statistical claim")
    status: FactCheckStatus = Field(description="Verification status against verified knowledge base")
    evidence: str = Field(description="Corroborating proof or explanation of discrepancy")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence score 0.0 to 1.0")
    source_ref: Optional[str] = Field(default=None, description="Document or whitepaper reference")

class CorrectionSuggestion(BaseModel):
    tone_variation: str = Field(description="Style variant, e.g., 'Confident & Compliant' or 'Direct & Professional'")
    revised_text: str = Field(description="Full corrected text suggestion")
    rationale: str = Field(description="Why this variation works best")

class BrandAuditReport(BaseModel):
    audit_id: str = Field(description="Unique identifier for the audit report")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    engine_name: str = Field(default="ECLIPSE", description="AI Governance Engine name")
    engine_version: str = Field(default="1.0.0")
    model: str = Field(default="gemini-3.5-flash", description="Underlying Gemini model utilized")
    content_channel: str = Field(default="general", description="Marketing channel (e.g., social, ad, email, blog)")
    original_content: str = Field(description="User submitted raw text")
    compliance_score: int = Field(ge=0, le=100, description="Overall compliance score from 0 to 100")
    status: ReviewStatus = Field(description="Audit outcome decision")
    summary: str = Field(description="Executive summary of the review findings")
    violations: List[Violation] = Field(default_factory=list, description="Detected violations")
    fact_checks: List[FactCheckItem] = Field(default_factory=list, description="Claim verifications")
    recommended_correction: str = Field(description="Primary suggested compliant rewrite")
    alternative_corrections: List[CorrectionSuggestion] = Field(default_factory=list, description="Alternative rewrite options")
    execution_time_ms: float = Field(default=0.0, description="Pipeline latency in milliseconds")

