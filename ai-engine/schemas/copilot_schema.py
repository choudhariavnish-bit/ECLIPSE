from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SourceCitation(BaseModel):
    document_id: str
    document_name: str
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    sheet_name: Optional[str] = None
    section_heading: Optional[str] = None
    excerpt: str
    relevance_score: float = Field(default=0.85)

class ChatMessage(BaseModel):
    role: str = Field(description="'user' or 'assistant'")
    content: str
    timestamp: Optional[str] = None
    citations: Optional[List[SourceCitation]] = None

class CopilotChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    selected_document_ids: Optional[List[str]] = Field(default=None, description="Filter Q&A to specific documents")
    history: Optional[List[ChatMessage]] = Field(default_factory=list)

class CopilotChatResponse(BaseModel):
    reply: str
    session_id: str
    citations: List[SourceCitation] = Field(default_factory=list)
    selected_documents: List[str] = Field(default_factory=list)
    confidence: float = 0.95
    model_used: str = "Google Gemini"

class CopilotHistoryResponse(BaseModel):
    session_id: str
    messages: List[ChatMessage]

class DocumentCompareRequest(BaseModel):
    document_ids: List[str] = Field(min_length=2, description="At least two document IDs to compare")
    comparison_focus: Optional[str] = Field(default="all", description="'specifications', 'claims', 'tone', or 'all'")

class DocumentCompareResponse(BaseModel):
    summary: str
    document_names: List[str]
    key_differences: List[Dict[str, Any]]
    contradictions: List[Dict[str, Any]]
    citations: List[SourceCitation]

