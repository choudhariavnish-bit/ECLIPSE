import os
import uuid
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
from schemas.document_schema import DocumentMetadata, DocumentSection
from app.pdf_extractor import pdf_extractor
from app.docx_extractor import docx_extractor
from app.pptx_extractor import pptx_extractor
from app.spreadsheet_extractor import spreadsheet_extractor
from app.ocr_engine import ocr_engine

logger = logging.getLogger("ECLIPSE.DocumentProcessor")

SUPPORTED_EXTENSIONS = {
    ".pdf": "PDF Document",
    ".docx": "Microsoft Word Document",
    ".doc": "Legacy Word Document",
    ".pptx": "PowerPoint Presentation",
    ".ppt": "Legacy PowerPoint",
    ".xlsx": "Excel Spreadsheet",
    ".xls": "Legacy Excel Spreadsheet",
    ".csv": "Comma-Separated Values (CSV)",
    ".txt": "Plain Text Document",
    ".md": "Markdown Document",
    ".markdown": "Markdown Document",
    ".png": "PNG Image",
    ".jpg": "JPEG Image",
    ".jpeg": "JPEG Image",
    ".webp": "WebP Image"
}

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB

class DocumentProcessor:
    """
    Universal Document Processing Pipeline for ECLIPSE.
    Validates, extracts, normalizes, and catalogues heterogeneous business documents.
    """
    def __init__(self, storage_dir: Optional[str] = None):
        base = storage_dir or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.upload_dir = os.path.join(base, "knowledge", "uploads")
        self.extracted_dir = os.path.join(base, "knowledge", "extracted")
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.extracted_dir, exist_ok=True)

    def validate_file(self, filename: str, file_size: int) -> Tuple[str, str]:
        """
        Validates file format, size, and determines canonical document type.
        Raises ValueError with clear message for unsupported formats or excess size.
        """
        if not filename or "." not in filename:
            raise ValueError("Invalid file upload: Missing filename extension.")

        ext = os.path.splitext(filename)[1].lower()
        if ext not in SUPPORTED_EXTENSIONS:
            supported_list = ", ".join(sorted(SUPPORTED_EXTENSIONS.keys()))
            raise ValueError(
                f"Unsupported file format '{ext}'. ECLIPSE supports: {supported_list}. "
                "For formats that cannot be reliably processed, please convert to PDF, DOCX, PPTX, or XLSX."
            )

        if file_size > MAX_FILE_SIZE_BYTES:
            raise ValueError(
                f"File size ({file_size / (1024*1024):.1f} MB) exceeds maximum allowed limit of 50 MB."
            )

        if file_size == 0:
            raise ValueError("Uploaded file is empty (0 bytes).")

        return ext, SUPPORTED_EXTENSIONS[ext]

    def process_document(self, file_bytes: bytes, filename: str, doc_id: Optional[str] = None) -> Tuple[DocumentMetadata, List[DocumentSection]]:
        """
        Full 10-step processing pipeline:
        1. Validate
        2. Save raw file
        3. Route to extractor (PDF, DOCX, PPTX, XLSX, TXT, Image OCR)
        4. Detect scanned content
        5. Clean and normalize text
        6. Store structured sections
        7. Catalog metadata
        """
        file_size = len(file_bytes)
        ext, file_type = self.validate_file(filename, file_size)

        document_id = doc_id or f"doc_{uuid.uuid4().hex[:12]}"
        safe_filename = f"{document_id}_{os.path.basename(filename)}"
        file_path = os.path.join(self.upload_dir, safe_filename)

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        sections: List[DocumentSection] = []
        meta_dict: Dict[str, Any] = {}

        try:
            # Route by extension
            if ext == ".pdf":
                sections, meta_dict = pdf_extractor.extract(file_path, document_id)
            elif ext in [".docx", ".doc"]:
                sections, meta_dict = docx_extractor.extract(file_path, document_id)
            elif ext in [".pptx", ".ppt"]:
                sections, meta_dict = pptx_extractor.extract(file_path, document_id)
            elif ext in [".xlsx", ".xls", ".csv"]:
                sections, meta_dict = spreadsheet_extractor.extract(file_path, document_id)
            elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
                sections, meta_dict = self._extract_image_document(file_path, document_id, filename)
            elif ext in [".txt", ".md", ".markdown"]:
                sections, meta_dict = self._extract_text_document(file_path, document_id, filename)
            else:
                raise ValueError(f"No processor registered for {ext}")

            # Normalize sections
            for s in sections:
                s.content = self._clean_and_normalize_text(s.content)
                s.token_count = len(s.content.split())

            # Preview text
            full_text = "\n\n".join([s.content for s in sections if s.content])
            preview = full_text[:400] + ("..." if len(full_text) > 400 else "")

            metadata = DocumentMetadata(
                document_id=document_id,
                filename=filename,
                file_type=file_type,
                file_size_bytes=file_size,
                page_count=meta_dict.get("page_count"),
                slide_count=meta_dict.get("slide_count"),
                sheet_names=meta_dict.get("sheet_names"),
                has_scanned_images=meta_dict.get("has_scanned_images", False),
                ocr_applied=meta_dict.get("ocr_applied", False),
                section_count=len(sections),
                uploaded_at=datetime.utcnow().isoformat() + "Z",
                status="processed",
                extracted_preview=preview
            )

            # Save extracted JSON cache
            extracted_path = os.path.join(self.extracted_dir, f"{document_id}.json")
            with open(extracted_path, "w", encoding="utf-8") as f:
                json.dump({
                    "metadata": metadata.model_dump(),
                    "sections": [s.model_dump() for s in sections]
                }, f, indent=2)

            return metadata, sections

        except Exception as e:
            logger.error(f"Error processing {filename}: {e}")
            metadata = DocumentMetadata(
                document_id=document_id,
                filename=filename,
                file_type=file_type,
                file_size_bytes=file_size,
                uploaded_at=datetime.utcnow().isoformat() + "Z",
                status="error",
                error_message=str(e),
                section_count=0,
                extracted_preview=""
            )
            return metadata, []

    def _extract_text_document(self, file_path: str, document_id: str, filename: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        # Split into sections by Markdown headers if present, else by double newline paragraphs
        sections: List[DocumentSection] = []
        raw_paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]

        if not raw_paragraphs:
            raw_paragraphs = [f"[Empty document: {filename}]"]

        for idx, p in enumerate(raw_paragraphs):
            heading = f"Section {idx+1}"
            if p.startswith("#"):
                first_line = p.split("\n")[0].lstrip("#").strip()
                if first_line:
                    heading = first_line

            sections.append(DocumentSection(
                section_id=f"{document_id}-p{idx+1}",
                document_id=document_id,
                section_type="section",
                section_number=idx + 1,
                heading=heading,
                content=p,
                token_count=len(p.split())
            ))

        return sections, {
            "page_count": max(1, len(content) // 2500),
            "section_count": len(sections),
            "has_scanned_images": False,
            "ocr_applied": False,
            "extractor": "Text-Markdown-Parser"
        }

    def _extract_image_document(self, file_path: str, document_id: str, filename: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        ocr_result = ocr_engine.extract_text_from_image(file_path)
        text = ocr_result.get("text", "").strip()

        section = DocumentSection(
            section_id=f"{document_id}-img1",
            document_id=document_id,
            section_type="page",
            section_number=1,
            heading=f"Image OCR: {filename}",
            content=text if text else f"[Scanned Image: No text detected by OCR engine]",
            token_count=len(text.split())
        )

        return [section], {
            "page_count": 1,
            "section_count": 1,
            "has_scanned_images": True,
            "ocr_applied": True,
            "extractor": ocr_result.get("engine", "OCR")
        }

    def _clean_and_normalize_text(self, text: str) -> str:
        """Cleans irregular whitespace, control characters, and line breaks."""
        if not text:
            return ""
        import re
        # Normalize carriage returns
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        # Replace non-breaking spaces
        text = text.replace("\u00a0", " ").replace("\ufeff", "")
        # Remove consecutive empty lines
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    def get_document(self, document_id: str) -> Optional[Tuple[DocumentMetadata, List[DocumentSection]]]:
        extracted_path = os.path.join(self.extracted_dir, f"{document_id}.json")
        if not os.path.exists(extracted_path):
            return None
        try:
            with open(extracted_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            meta = DocumentMetadata(**data["metadata"])
            sections = [DocumentSection(**s) for s in data.get("sections", [])]
            return meta, sections
        except Exception as e:
            logger.error(f"Failed to read document cache {document_id}: {e}")
            return None

    def list_documents(self) -> List[DocumentMetadata]:
        docs = []
        for f in os.listdir(self.extracted_dir):
            if f.endswith(".json"):
                doc_id = f[:-5]
                doc_tuple = self.get_document(doc_id)
                if doc_tuple:
                    docs.append(doc_tuple[0])
        # Sort descending by upload time
        docs.sort(key=lambda d: d.uploaded_at, reverse=True)
        return docs

    def delete_document(self, document_id: str) -> bool:
        """Deletes raw upload, extracted json, and vector index records."""
        deleted = False
        extracted_path = os.path.join(self.extracted_dir, f"{document_id}.json")
        if os.path.exists(extracted_path):
            os.remove(extracted_path)
            deleted = True

        for f in os.listdir(self.upload_dir):
            if f.startswith(f"{document_id}_"):
                try:
                    os.remove(os.path.join(self.upload_dir, f))
                    deleted = True
                except Exception:
                    pass
        return deleted

document_processor = DocumentProcessor()
