import os
import csv
import zipfile
import logging
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Tuple
from schemas.document_schema import DocumentSection

logger = logging.getLogger("ECLIPSE.SpreadsheetExtractor")

XLSX_NAMESPACES = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
}

class SpreadsheetExtractor:
    """
    Extracts structured sheets, rows, and tables from XLSX, XLS, and CSV files.
    Supports pandas, openpyxl, and native OpenXML ZIP/XML extraction.
    """
    def extract(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".csv":
            return self._extract_csv(file_path, document_id)
        elif ext == ".xlsx":
            return self._extract_xlsx(file_path, document_id)
        elif ext == ".xls":
            return self._extract_legacy_xls(file_path, document_id)
        else:
            raise ValueError(f"Unsupported spreadsheet format: {ext}")

    def _extract_csv(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        rows = []
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                reader = csv.reader(f)
                for r in reader:
                    if any(cell.strip() for cell in r):
                        rows.append(" | ".join(r))
        except Exception as e:
            logger.warning(f"CSV read error: {e}")

        content = "\n".join(rows) if rows else "[Empty CSV]"
        section = DocumentSection(
            section_id=f"{document_id}-sheet1",
            document_id=document_id,
            section_type="sheet",
            section_number=1,
            heading="CSV Data Sheet",
            content=content,
            token_count=len(content.split())
        )
        metadata = {
            "sheet_names": ["CSV Data Sheet"],
            "page_count": 1,
            "section_count": 1,
            "has_scanned_images": False,
            "ocr_applied": False,
            "extractor": "Python-CSV"
        }
        return [section], metadata

    def _extract_xlsx(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        # 1. Try pandas with openpyxl if available
        try:
            import pandas as pd
            xls = pd.ExcelFile(file_path)
            sheet_names = xls.sheet_names
            sections: List[DocumentSection] = []

            for idx, sheet_name in enumerate(sheet_names):
                df = pd.read_excel(xls, sheet_name=sheet_name)
                # Convert DataFrame to clean Markdown / pipe-delimited table representation
                table_str = df.to_markdown(index=False) if hasattr(df, "to_markdown") else df.to_string(index=False)
                content = f"[Sheet: {sheet_name}]\n{table_str}"

                sections.append(DocumentSection(
                    section_id=f"{document_id}-sheet{idx+1}",
                    document_id=document_id,
                    section_type="sheet",
                    section_number=idx + 1,
                    heading=f"Sheet: {sheet_name}",
                    content=content,
                    token_count=len(content.split())
                ))

            metadata = {
                "sheet_names": sheet_names,
                "page_count": len(sheet_names),
                "section_count": len(sections),
                "has_scanned_images": False,
                "ocr_applied": False,
                "extractor": "pandas-openpyxl"
            }
            return sections, metadata
        except Exception as e:
            logger.warning(f"pandas Excel extraction failed: {e}. Falling back to OpenXML native XLSX parser.")

        # 2. Resilient OpenXML native parser for XLSX
        return self._extract_xlsx_openxml(file_path, document_id)

    def _extract_xlsx_openxml(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        try:
            sections: List[DocumentSection] = []
            sheet_names: List[str] = []

            with zipfile.ZipFile(file_path, "r") as z:
                # 1. Read shared strings
                shared_strings = []
                if "xl/sharedStrings.xml" in z.namelist():
                    ss_xml = z.read("xl/sharedStrings.xml")
                    ss_root = ET.fromstring(ss_xml)
                    for si in ss_root.findall(".//main:si", XLSX_NAMESPACES):
                        texts = [t.text for t in si.findall(".//main:t", XLSX_NAMESPACES) if t.text]
                        shared_strings.append("".join(texts))

                # 2. Read workbook to get sheet names
                if "xl/workbook.xml" in z.namelist():
                    wb_xml = z.read("xl/workbook.xml")
                    wb_root = ET.fromstring(wb_xml)
                    for sheet_node in wb_root.findall(".//main:sheet", XLSX_NAMESPACES):
                        name = sheet_node.attrib.get("name", "Sheet")
                        sheet_names.append(name)

                # 3. Read worksheets
                sheet_files = [f for f in z.namelist() if f.startswith("xl/worksheets/sheet") and f.endswith(".xml")]
                sheet_files.sort()

                for idx, s_file in enumerate(sheet_files):
                    sheet_name = sheet_names[idx] if idx < len(sheet_names) else f"Sheet {idx+1}"
                    s_xml = z.read(s_file)
                    s_root = ET.fromstring(s_xml)

                    rows = []
                    for row in s_root.findall(".//main:row", XLSX_NAMESPACES):
                        row_vals = []
                        for c in row.findall(".//main:c", XLSX_NAMESPACES):
                            cell_type = c.attrib.get("t", "")
                            v_node = c.find(".//main:v", XLSX_NAMESPACES)
                            val = ""
                            if v_node is not None and v_node.text:
                                if cell_type == "s" and v_node.text.isdigit():
                                    s_idx = int(v_node.text)
                                    val = shared_strings[s_idx] if s_idx < len(shared_strings) else v_node.text
                                else:
                                    val = v_node.text
                            row_vals.append(val)
                        if any(row_vals):
                            rows.append(" | ".join(row_vals))

                    content = f"[Sheet: {sheet_name}]\n" + "\n".join(rows) if rows else f"[Empty Sheet: {sheet_name}]"
                    sections.append(DocumentSection(
                        section_id=f"{document_id}-sheet{idx+1}",
                        document_id=document_id,
                        section_type="sheet",
                        section_number=idx + 1,
                        heading=f"Sheet: {sheet_name}",
                        content=content,
                        token_count=len(content.split())
                    ))

            metadata = {
                "sheet_names": sheet_names or [s.heading for s in sections],
                "page_count": len(sections),
                "section_count": len(sections),
                "has_scanned_images": False,
                "ocr_applied": False,
                "extractor": "OpenXML-XLSX-Native"
            }
            return sections, metadata
        except Exception as e:
            logger.error(f"OpenXML XLSX parsing error: {e}")
            raise ValueError(f"Could not parse XLSX workbook: {str(e)}")

    def _extract_legacy_xls(self, file_path: str, document_id: str) -> Tuple[List[DocumentSection], Dict[str, Any]]:
        """Legacy binary Excel (.xls). Uses pandas with xlrd or text extraction fallback."""
        try:
            import pandas as pd
            xls = pd.ExcelFile(file_path)
            sheet_names = xls.sheet_names
            sections = []
            for idx, sheet in enumerate(sheet_names):
                df = pd.read_excel(xls, sheet_name=sheet)
                content = df.to_string(index=False)
                sections.append(DocumentSection(
                    section_id=f"{document_id}-sheet{idx+1}",
                    document_id=document_id,
                    section_type="sheet",
                    section_number=idx + 1,
                    heading=f"Sheet: {sheet}",
                    content=content,
                    token_count=len(content.split())
                ))
            return sections, {
                "sheet_names": sheet_names,
                "page_count": len(sections),
                "section_count": len(sections),
                "has_scanned_images": False,
                "ocr_applied": False,
                "extractor": "pandas-legacy-xls"
            }
        except Exception:
            # Fallback binary string extraction
            with open(file_path, "rb") as f:
                content_bytes = f.read()
            import re
            ascii_strings = re.findall(b"[\x20-\x7E\r\n\t]{4,}", content_bytes)
            decoded = [s.decode("latin1", errors="ignore").strip() for s in ascii_strings if len(s.strip()) > 3]
            text = "\n".join(decoded)
            sections = [
                DocumentSection(
                    section_id=f"{document_id}-sheet1",
                    document_id=document_id,
                    section_type="sheet",
                    section_number=1,
                    heading="Legacy Excel Sheet (.xls)",
                    content=text if text else "[Legacy XLS binary content: please convert to .xlsx]",
                    token_count=len(text.split())
                )
            ]
            return sections, {
                "sheet_names": ["Legacy Excel Sheet"],
                "page_count": 1,
                "section_count": 1,
                "has_scanned_images": False,
                "ocr_applied": False,
                "extractor": "Legacy-XLS-Binary"
            }

spreadsheet_extractor = SpreadsheetExtractor()

