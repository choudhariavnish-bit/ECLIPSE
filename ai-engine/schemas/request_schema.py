from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ReviewRequest(BaseModel):
    content: str = Field(..., min_length=5, description="Marketing copy, advertisement, email, or document to review")
    channel: Optional[str] = Field(default="social_media", description="Marketing channel (ad_copy, social_media, email, blog_post, press_release)")
    target_audience: Optional[str] = Field(default="Enterprise & B2B buyers", description="Target readership audience")
    custom_rules: Optional[List[str]] = Field(default=None, description="Optional custom guidelines for this specific review")

class ChatMessage(BaseModel):
    role: str = Field(description="'user' or 'assistant'")
    content: str = Field(description="Message text")

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User question or prompt for ECLIPSE")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Previous conversation turns")
    channel: Optional[str] = Field(default="general", description="Contextual channel")

class ChatResponse(BaseModel):
    engine_name: str = "ECLIPSE"
    powered_by: str = "Google Gemini"
    reply: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")

