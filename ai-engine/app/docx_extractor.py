import os
import zipfile
import logging
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Tuple
from schemas.document_schema import DocumentSection

logger = logging.getLogger("ECLIPSE.DocxExtractor")

XML_NAMESPACES = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
}

class DocxExtractor:
    """
    Extracts text, headings, and tables from DOCX and DOC documents.
    Supports python-docx and resilient native OpenXML ZIP/XML parsing.
    """
    def extract(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".doc":
            return self._extract_legacy_doc(file_path, document_id)

        # 1. Try python-docx if installed
        try:
            import docx
            return self._extract_with_python_docx(file_path, document_id)
        except ImportError:
            pass
        except Exception as e:
            logger.warning(f"python-docx parsing failed: {e}. Falling back to OpenXML native parser.")

        # 2. Resilient OpenXML ZIP parser
        return self._extract_with_openxml(file_path, document_id)

    def _extract_with_python_docx(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        import docx
        doc = docx.Document(file_path)
        sections: List[DocumentSection] = []
        current_heading = "Overview"
        current_paragraphs: List[str] = []
        section_idx = 1

        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue

            style_name = para.style.name.lower() if para.style else ""
            if "heading" in style_name or style_name.startswith("title"):
                if current_paragraphs:
                    content = "\n\n".join(current_paragraphs)
                    sections.append(DocumentSection(
                        section_id=f"{document_id}-s{section_idx}",
                        document_id=document_id,
                        section_type="section",
                        section_number=section_idx,
                        heading=current_heading,
                        content=content,
                        token_count=len(content.split())
                    ))
                    section_idx += 1
                    current_paragraphs = []
                current_heading = text
            else:
                current_paragraphs.append(text)

        # Extract tables
        for tbl_idx, table in enumerate(doc.tables):
            table_rows = []
            for row in table.rows:
                cells = [c.text.strip() for c in row.cells]
                table_rows.append(" | ".join(cells))
            if table_rows:
                tbl_text = "[Table Data]:\n" + "\n".join(table_rows)
                current_paragraphs.append(tbl_text)

        if current_paragraphs:
            content = "\n\n".join(current_paragraphs)
            sections.append(DocumentSection(
                section_id=f"{document_id}-s{section_idx}",
                document_id=document_id,
                section_type="section",
                section_number=section_idx,
                heading=current_heading,
                content=content,
                token_count=len(content.split())
            ))

        metadata = {
            "page_count": len(sections),
            "section_count": len(sections),
            "has_scanned_images": False,
            "ocr_applied": False,
            "extractor": "python-docx"
        }
        return sections, metadata

    def _extract_with_openxml(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        """Parses word/document.xml directly from the DOCX ZIP package."""
        try:
            with zipfile.ZipFile(file_path, "r") as z:
                if "word/document.xml" not in z.namelist():
                    raise ValueError("Invalid DOCX format: word/document.xml not found")
                xml_data = z.read("word/document.xml")

            root = ET.fromstring(xml_data)
            sections: List[DocumentSection] = []
            current_heading = "Document Content"
            paragraphs: List[str] = []
            section_idx = 1

            # Traverse paragraphs
            for p in root.findall(".//w:p", XML_NAMESPACES):
                texts = [node.text for node in p.findall(".//w:t", XML_NAMESPACES) if node.text]
                p_text = "".join(texts).strip()
                if not p_text:
                    continue

                # Check if heading
                p_style = p.find(".//w:pStyle", XML_NAMESPACES)
                style_val = p_style.attrib.get(f"{{{XML_NAMESPACES['w']}}}val", "").lower() if p_style is not None else ""

                if "heading" in style_val or "title" in style_val:
                    if paragraphs:
                        content = "\n\n".join(paragraphs)
                        sections.append(DocumentSection(
                            section_id=f"{document_id}-s{section_idx}",
                            document_id=document_id,
                            section_type="section",
                            section_number=section_idx,
                            heading=current_heading,
                            content=content,
                            token_count=len(content.split())
                        ))
                        section_idx += 1
                        paragraphs = []
                    current_heading = p_text
                else:
                    paragraphs.append(p_text)

            # Traverse tables
            for tbl in root.findall(".//w:tbl", XML_NAMESPACES):
                table_lines = []
                for tr in tbl.findall(".//w:tr", XML_NAMESPACES):
                    row_cells = []
                    for tc in tr.findall(".//w:tc", XML_NAMESPACES):
                        cell_texts = [node.text for node in tc.findall(".//w:t", XML_NAMESPACES) if node.text]
                        row_cells.append(" ".join(cell_texts).strip())
                    table_lines.append(" | ".join(row_cells))
                if table_lines:
                    paragraphs.append("[Table Data]:\n" + "\n".join(table_lines))

            if paragraphs:
                content = "\n\n".join(paragraphs)
                sections.append(DocumentSection(
                    section_id=f"{document_id}-s{section_idx}",
                    document_id=document_id,
                    section_type="section",
                    section_number=section_idx,
                    heading=current_heading,
                    content=content,
                    token_count=len(content.split())
                ))

            metadata = {
                "page_count": len(sections),
                "section_count": len(sections),
                "has_scanned_images": False,
                "ocr_applied": False,
                "extractor": "OpenXML-Native"
            }
            return sections, metadata
        except Exception as e:
            logger.error(f"OpenXML extraction error: {e}")
            raise ValueError(f"Failed to parse DOCX structure: {str(e)}")

    def _extract_legacy_doc(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        """Extracts text streams from legacy binary Microsoft Word (.doc) files."""
        try:
            with open(file_path, "rb") as f:
                content = f.read()

            # Extract printable ASCII and UTF-16 sequences
            import re
            ascii_strings = re.findall(b"[\x20-\x7E\r\n\t]{4,}", content)
            decoded = [s.decode("latin1", errors="ignore").strip() for s in ascii_strings if len(s.strip()) > 3]

            cleaned = "\n".join(decoded)
            sections = [
                DocumentSection(
                    section_id=f"{document_id}-doc1",
                    document_id=document_id,
                    section_type="section",
                    section_number=1,
                    heading="Legacy Word Document (.doc)",
                    content=cleaned if cleaned else "[Binary legacy Word file: content requires .docx conversion]",
                    token_count=len(cleaned.split())
                )
            ]
            metadata = {
                "page_count": 1,
                "section_count": 1,
                "has_scanned_images": False,
                "ocr_applied": False,
                "extractor": "Legacy-DOC-Binary"
            }
            return sections, metadata
        except Exception as e:
            raise ValueError(f"Could not read legacy DOC file: {str(e)}")

docx_extractor = DocxExtractor()
