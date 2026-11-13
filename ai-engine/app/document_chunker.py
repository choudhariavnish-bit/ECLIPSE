import re
from typing import List, Dict, Any, Optional
from schemas.document_schema import DocumentSection, DocumentMetadata

class DocumentChunk:
    def __init__(
        self,
        chunk_id: str,
        document_id: str,
        document_name: str,
        content: str,
        page_number: Optional[int] = None,
        slide_number: Optional[int] = None,
        sheet_name: Optional[str] = None,
        section_heading: Optional[str] = None,
        token_count: int = 0
    ):
        self.chunk_id = chunk_id
        self.document_id = document_id
        self.document_name = document_name
        self.content = content
        self.page_number = page_number
        self.slide_number = slide_number
        self.sheet_name = sheet_name
        self.section_heading = section_heading
        self.token_count = token_count

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "document_name": self.document_name,
            "content": self.content,
            "page_number": self.page_number,
            "slide_number": self.slide_number,
            "sheet_name": self.sheet_name,
            "section_heading": self.section_heading,
            "token_count": self.token_count
        }

class DocumentChunker:
    """
    Splits document sections into contextual chunks while maintaining full metadata traceability.
    """
    def __init__(self, target_chunk_size: int = 400, overlap_size: int = 60):
        self.target_chunk_size = target_chunk_size
        self.overlap_size = overlap_size

    def chunk_document(self, metadata: DocumentMetadata, sections: List[DocumentSection]) -> List[DocumentChunk]:
        chunks: List[DocumentChunk] = []

        for sec in sections:
            text = sec.content.strip()
            if not text:
                continue

            words = text.split()
            page_num = sec.section_number if sec.section_type == "page" else None
            slide_num = sec.section_number if sec.section_type == "slide" else None
            sheet_name = sec.heading if sec.section_type == "sheet" else None

            # If section is small enough, keep as single chunk
            if len(words) <= self.target_chunk_size:
                chunk_id = f"{sec.section_id}-c1"
                chunks.append(DocumentChunk(
                    chunk_id=chunk_id,
                    document_id=metadata.document_id,
                    document_name=metadata.filename,
                    content=text,
                    page_number=page_num,
                    slide_number=slide_num,
                    sheet_name=sheet_name,
                    section_heading=sec.heading,
                    token_count=len(words)
                ))
            else:
                # Sliding window chunking
                step = self.target_chunk_size - self.overlap_size
                sub_idx = 1
                for i in range(0, len(words), step):
                    chunk_words = words[i:i + self.target_chunk_size]
                    if not chunk_words:
                        continue
                    chunk_text = " ".join(chunk_words)
                    chunk_id = f"{sec.section_id}-c{sub_idx}"
                    chunks.append(DocumentChunk(
                        chunk_id=chunk_id,
                        document_id=metadata.document_id,
                        document_name=metadata.filename,
                        content=chunk_text,
                        page_number=page_num,
                        slide_number=slide_num,
                        sheet_name=sheet_name,
                        section_heading=sec.heading,
                        token_count=len(chunk_words)
                    ))
                    sub_idx += 1
                    if i + self.target_chunk_size >= len(words):
                        break

        return chunks

document_chunker = DocumentChunker()

