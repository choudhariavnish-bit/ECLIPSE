from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ReviewRequest(BaseModel):
    content: str = Field(..., min_length=3, description="Marketing copy, advertisement, email, or document to review")
    title: Optional[str] = Field(default=None, description="Optional document or campaign title")
    channel: Optional[str] = Field(default="social_media", description="Marketing channel (ad_copy, social_media, email, blog_post, press_release)")
    brand_id: Optional[str] = Field(default="ECLIPSE", description="Target brand identity")
    target_audience: Optional[str] = Field(default="Enterprise & B2B buyers", description="Target readership audience")
    custom_rules: Optional[List[str]] = Field(default=None, description="Optional custom guidelines for this specific review")

class BlogAnalyzeRequest(BaseModel):
    content: str = Field(..., min_length=5, description="Full blog text or draft article to analyze")
    title: Optional[str] = Field(default="Untitled Article", description="Blog headline or working title")
    brand_id: Optional[str] = Field(default="ECLIPSE", description="Brand guideline set to apply")
    content_type: Optional[str] = Field(default="blog", description="blog, whitepaper, article, press_release")
    target_audience: Optional[str] = Field(default="Enterprise & B2B buyers", description="Target readership audience")

class BlogCorrectRequest(BaseModel):
    original_content: str = Field(..., min_length=5, description="Original submitted text to be revised")
    title: Optional[str] = Field(default=None, description="Blog headline")
    brand_id: Optional[str] = Field(default="ECLIPSE", description="Target brand identifier")
    selected_corrections: Optional[List[str]] = Field(default=None, description="Specific issue IDs to apply, or None for all")
    analysis_results: Optional[Dict[str, Any]] = Field(default=None, description="Pre-computed audit findings if available")

class BlogReviewRequest(BaseModel):
    content: str = Field(..., min_length=5, description="Blog article to run complete review and correction on")
    title: Optional[str] = Field(default="Untitled Article", description="Blog headline")
    brand_id: Optional[str] = Field(default="ECLIPSE", description="Target brand identifier")
    content_type: Optional[str] = Field(default="blog", description="Content type")
    target_audience: Optional[str] = Field(default="Enterprise & B2B buyers", description="Target readership audience")

class ChatMessage(BaseModel):
    role: str = Field(description="'user' or 'assistant'")
    content: str = Field(description="Message text")

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User question or prompt for ECLIPSE")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Previous conversation turns")
    channel: Optional[str] = Field(default="general", description="Contextual channel")
    document_context: Optional[str] = Field(default=None, description="Active blog or draft content being edited")
    findings_context: Optional[List[Dict[str, Any]]] = Field(default=None, description="Active audit findings and citations")

class ChatResponse(BaseModel):
    engine_name: str = "ECLIPSE"
    powered_by: str = "Google Gemini"
    reply: str
    referenced_rules: Optional[List[str]] = Field(default_factory=list)
    referenced_facts: Optional[List[str]] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
