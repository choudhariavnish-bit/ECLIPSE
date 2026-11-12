from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DocumentSection(BaseModel):
    section_id: str
    document_id: str
    section_type: str = Field(description="'page', 'slide', 'sheet', or 'section'")
    section_number: int = Field(default=1, description="Page number, slide number, or sheet index")
    heading: Optional[str] = Field(default=None, description="Heading, title or sheet name")
    content: str
    token_count: int = 0

class DocumentMetadata(BaseModel):
    document_id: str
    filename: str
    file_type: str
    file_size_bytes: int
    page_count: Optional[int] = None
    slide_count: Optional[int] = None
    sheet_names: Optional[List[str]] = None
    has_scanned_images: bool = False
    ocr_applied: bool = False
    section_count: int = 0
    uploaded_at: str
    status: str = "processed"  # 'processed', 'scanned', 'error'
    error_message: Optional[str] = None
    extracted_preview: str = ""

class DocumentUploadResponse(BaseModel):
    document: DocumentMetadata
    message: str

class DocumentListResponse(BaseModel):
    documents: List[DocumentMetadata]
    total: int

class DocumentContentResponse(BaseModel):
    document: DocumentMetadata
    sections: List[DocumentSection]
    full_text: str

class DocumentScanRequest(BaseModel):
    brand_id: str = "ECLIPSE"
    strictness: str = "balanced"  # 'lenient', 'balanced', 'strict'

class DocumentScanFinding(BaseModel):
    id: str
    category: str  # 'tone', 'prohibited_term', 'fact_error', 'unsupported_claim', 'accessibility'
    severity: str  # 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    original_text: str
    explanation: str
    evidence_or_ref: Optional[str] = None
    suggested_correction: str
    status: str  # 'verified', 'unsupported', 'contradicted', 'warning'
    page_or_section: Optional[str] = None

class DocumentScanResponse(BaseModel):
    document_id: str
    document_name: str
    compliance_score: int
    total_issues: int
    critical_issues: int
    warnings: int
    verified_claims_count: int
    unsupported_claims_count: int
    findings: List[DocumentScanFinding]
    executive_summary: str
    reviewed_at: str

