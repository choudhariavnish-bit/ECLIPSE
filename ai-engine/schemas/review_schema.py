from pydantic import BaseModel, Field
from typing import List, Optional

class Issue(BaseModel):
    category: str = Field(description="Category of issue: terminology, claim, tone, fact, legal")
    severity: str = Field(description="Severity impact: low, medium, high, critical")
    problematic_text: str = Field(description="Exact excerpt from content")
    explanation: str = Field(description="Why this violates approved brand guidelines")
    evidence: List[str] = Field(default_factory=list, description="Approved fact IDs supporting or refuting (e.g. ['FACT-001'])")
    suggestion: str = Field(description="Actionable corrected text or guidance")
    status: str = Field(description="Status: confirmed_violation, needs_evidence, false_claim, or warning")

class ReviewReport(BaseModel):
    overall_status: str = Field(description="Overall review status: approved, needs_review, or rejected")
    summary: str = Field(description="Executive summary of the review findings")
    issues: List[Issue] = Field(default_factory=list, description="List of detected brand and claim issues")

