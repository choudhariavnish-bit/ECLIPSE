import os
import io
import logging
from typing import List, Dict, Any, Tuple
from app.ocr_engine import ocr_engine
from schemas.document_schema import DocumentSection

logger = logging.getLogger("ECLIPSE.PDFExtractor")

class PDFExtractor:
    """
    Extracts selectable text and detects scanned PDF pages for automatic OCR.
    Supports PyMuPDF (fitz) or pypdf with OCR fallback.
    """
    def __init__(self):
        self._has_fitz = False
        try:
            import fitz
            self._has_fitz = True
        except ImportError:
            self._has_fitz = False

    def extract(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        sections: List[DocumentSection] = []
        metadata: Dict[str, Any] = {
            "page_count": 0,
            "has_scanned_images": False,
            "ocr_applied": False,
            "extractor": "PyMuPDF" if self._has_fitz else "pypdf"
        }

        # 1. Attempt with PyMuPDF (fitz) if installed
        if self._has_fitz:
            try:
                import fitz
                doc = fitz.open(file_path)
                metadata["page_count"] = len(doc)

                for page_idx in range(len(doc)):
                    page = doc[page_idx]
                    page_num = page_idx + 1
                    text = page.get_text("text").strip()

                    # Detect if page is a scanned image (text is sparse or empty)
                    is_scanned = len(text) < 30
                    if is_scanned:
                        metadata["has_scanned_images"] = True
                        pix = page.get_pixmap(dpi=150)
                        img_bytes = pix.tobytes("png")
                        ocr_res = ocr_engine.extract_text_from_image(img_bytes)
                        if ocr_res.get("text"):
                            text = ocr_res["text"]
                            metadata["ocr_applied"] = True

                    heading = f"Page {page_num}"
                    first_line = text.split("\n")[0].strip() if text else ""
                    if first_line and len(first_line) < 80:
                        heading = f"Page {page_num}: {first_line}"

                    section = DocumentSection(
                        section_id=f"{document_id}-p{page_num}",
                        document_id=document_id,
                        section_type="page",
                        section_number=page_num,
                        heading=heading,
                        content=text if text else f"[Scanned or blank page {page_num}]",
                        token_count=len(text.split())
                    )
                    sections.append(section)

                doc.close()
                return sections, metadata
            except Exception as e:
                logger.warning(f"PyMuPDF extraction failed: {e}. Falling back to pypdf.")

        # 2. Standard pypdf extraction
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            metadata["page_count"] = len(reader.pages)

            for idx, page in enumerate(reader.pages):
                page_num = idx + 1
                text = ""
                try:
                    text = page.extract_text() or ""
                    text = text.strip()
                except Exception as ex:
                    logger.debug(f"pypdf extract_text failed on page {page_num}: {ex}")

                # Check if scanned
                if len(text) < 30:
                    metadata["has_scanned_images"] = True
                    # Check if page has embedded images
                    if hasattr(page, "images") and len(page.images) > 0:
                        try:
                            ocr_texts = []
                            for img_file in page.images:
                                img_data = img_file.data
                                ocr_res = ocr_engine.extract_text_from_image(img_data)
                                if ocr_res.get("text"):
                                    ocr_texts.append(ocr_res["text"])
                            if ocr_texts:
                                text = "\n".join(ocr_texts).strip()
                                metadata["ocr_applied"] = True
                        except Exception as e_ocr:
                            logger.debug(f"OCR on page images failed: {e_ocr}")

                heading = f"Page {page_num}"
                first_line = text.split("\n")[0].strip() if text else ""
                if first_line and len(first_line) < 80:
                    heading = f"Page {page_num}: {first_line}"

                section = DocumentSection(
                    section_id=f"{document_id}-p{page_num}",
                    document_id=document_id,
                    section_type="page",
                    section_number=page_num,
                    heading=heading,
                    content=text if text else f"[Page {page_num}]",
                    token_count=len(text.split())
                )
                sections.append(section)

            return sections, metadata
        except Exception as e:
            logger.error(f"Failed to extract PDF: {e}")
            raise ValueError(f"Could not parse PDF document: {str(e)}")

pdf_extractor = PDFExtractor()
