import os
import zipfile
import logging
import re
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Tuple
from schemas.document_schema import DocumentSection

logger = logging.getLogger("ECLIPSE.PptxExtractor")

PPTX_NAMESPACES = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}

class PptxExtractor:
    """
    Extracts slides, titles, shapes and notes from PowerPoint presentations (PPTX / PPT).
    Supports python-pptx and native OpenXML ZIP/XML parsing.
    """
    def extract(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".ppt":
            return self._extract_legacy_ppt(file_path, document_id)

        # 1. Try python-pptx if available
        try:
            import pptx
            return self._extract_with_python_pptx(file_path, document_id)
        except ImportError:
            pass
        except Exception as e:
            logger.warning(f"python-pptx parsing failed: {e}. Falling back to OpenXML native parser.")

        # 2. Resilient OpenXML ZIP parser
        return self._extract_with_openxml(file_path, document_id)

    def _extract_with_python_pptx(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        import pptx
        prs = pptx.Presentation(file_path)
        sections: List[DocumentSection] = []

        for idx, slide in enumerate(prs.slides):
            slide_num = idx + 1
            slide_title = f"Slide {slide_num}"
            slide_texts = []

            for shape in slide.shapes:
                if shape.has_text_frame:
                    for paragraph in shape.text_frame.paragraphs:
                        text = paragraph.text.strip()
                        if text:
                            slide_texts.append(text)

            if slide_texts:
                slide_title = f"Slide {slide_num}: {slide_texts[0][:60]}"

            content = "\n".join(slide_texts).strip()
            sections.append(DocumentSection(
                section_id=f"{document_id}-slide{slide_num}",
                document_id=document_id,
                section_type="slide",
                section_number=slide_num,
                heading=slide_title,
                content=content if content else f"[Empty Slide {slide_num}]",
                token_count=len(content.split())
            ))

        metadata = {
            "slide_count": len(prs.slides),
            "page_count": len(prs.slides),
            "section_count": len(sections),
            "has_scanned_images": False,
            "ocr_applied": False,
            "extractor": "python-pptx"
        }
        return sections, metadata

    def _extract_with_openxml(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        """Parses ppt/slides/slide*.xml directly from PPTX ZIP package."""
        try:
            sections: List[DocumentSection] = []
            with zipfile.ZipFile(file_path, "r") as z:
                # Find all slide xml files and sort them numerically
                slide_names = [f for f in z.namelist() if f.startswith("ppt/slides/slide") and f.endswith(".xml")]
                def slide_sort_key(name):
                    m = re.search(r"slide(\d+)\.xml", name)
                    return int(m.group(1)) if m else 9999
                slide_names.sort(key=slide_sort_key)

                for idx, s_name in enumerate(slide_names):
                    slide_num = idx + 1
                    xml_data = z.read(s_name)
                    root = ET.fromstring(xml_data)

                    # Extract all text elements in drawingml (<a:t>)
                    texts = [node.text for node in root.findall(".//a:t", PPTX_NAMESPACES) if node.text]
                    content = "\n".join(texts).strip()
                    heading = f"Slide {slide_num}"
                    if texts and len(texts[0].strip()) < 80:
                        heading = f"Slide {slide_num}: {texts[0].strip()}"

                    sections.append(DocumentSection(
                        section_id=f"{document_id}-slide{slide_num}",
                        document_id=document_id,
                        section_type="slide",
                        section_number=slide_num,
                        heading=heading,
                        content=content if content else f"[Empty Slide {slide_num}]",
                        token_count=len(content.split())
                    ))

            metadata = {
                "slide_count": len(sections),
                "page_count": len(sections),
                "section_count": len(sections),
                "has_scanned_images": False,
                "ocr_applied": False,
                "extractor": "OpenXML-PPTX-Native"
            }
            return sections, metadata
        except Exception as e:
            logger.error(f"OpenXML PPTX extraction failed: {e}")
            raise ValueError(f"Could not parse PPTX presentation: {str(e)}")

    def _extract_legacy_ppt(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        """Extracts text streams from legacy binary Microsoft PowerPoint (.ppt) files."""
        try:
            with open(file_path, "rb") as f:
                content = f.read()

            ascii_strings = re.findall(b"[\x20-\x7E\r\n\t]{4,}", content)
            decoded = [s.decode("latin1", errors="ignore").strip() for s in ascii_strings if len(s.strip()) > 3]
            cleaned = "\n".join(decoded)

            sections = [
                DocumentSection(
                    section_id=f"{document_id}-ppt1",
                    document_id=document_id,
                    section_type="slide",
                    section_number=1,
                    heading="Legacy Presentation (.ppt)",
                    content=cleaned if cleaned else "[Binary legacy PowerPoint: please convert to .pptx]",
                    token_count=len(cleaned.split())
                )
            ]
            metadata = {
                "slide_count": 1,
                "page_count": 1,
                "section_count": 1,
                "has_scanned_images": False,
                "ocr_applied": False,
                "extractor": "Legacy-PPT-Binary"
            }
            return sections, metadata
        except Exception as e:
            raise ValueError(f"Could not read legacy PPT presentation: {str(e)}")

pptx_extractor = PptxExtractor()

