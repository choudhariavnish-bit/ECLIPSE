import os
import io
import pytest
from app.document_processor import document_processor, SUPPORTED_EXTENSIONS
from schemas.document_schema import DocumentMetadata, DocumentSection

def test_supported_extensions_coverage():
    """Verify all requested formats are supported."""
    required = [".pdf", ".docx", ".doc", ".pptx", ".ppt", ".xlsx", ".xls", ".csv", ".txt", ".md", ".png", ".jpg", ".jpeg", ".webp"]
    for ext in required:
        assert ext in SUPPORTED_EXTENSIONS, f"Missing support for {ext}"

def test_empty_document_rejection():
    """Empty files (0 bytes) must be rejected with a clear message."""
    with pytest.raises(ValueError) as excinfo:
        document_processor.process_document(b"", "empty_file.pdf")
    assert "empty" in str(excinfo.value).lower()

def test_unsupported_file_format():
    """Unsupported formats must display clear error without pretending to scan."""
    with pytest.raises(ValueError) as excinfo:
        document_processor.process_document(b"random_binary_code", "malware.exe")
    assert "unsupported file format" in str(excinfo.value).lower()
    assert ".exe" in str(excinfo.value)

def test_large_file_rejection():
    """Files exceeding 50 MB must be rejected."""
    fake_large_size = 55 * 1024 * 1024
    with pytest.raises(ValueError) as excinfo:
        document_processor.validate_file("huge.pdf", fake_large_size)
    assert "exceeds maximum allowed limit" in str(excinfo.value).lower()

def test_text_and_markdown_extraction():
    """Test text and markdown extraction with sections and headings."""
    content = """# Executive Summary
ECLIPSE is the enterprise brand governance layer.

## Core Features
1. Fact verification
2. Prohibited terms linting
3. Multi-format document scanning
"""
    meta, sections = document_processor.process_document(content.encode("utf-8"), "overview.md")
    assert meta.status == "processed"
    assert meta.filename == "overview.md"
    assert len(sections) >= 2
    assert "Executive Summary" in sections[0].heading or "Core Features" in sections[1].heading

def test_csv_extraction():
    """Test CSV spreadsheet extraction with table data."""
    csv_data = "Product,RAM,Storage,Uptime\nNovaBook X1,16 GB,512 GB,99.99%\nCloudNode,64 GB,2 TB,99.99%"
    meta, sections = document_processor.process_document(csv_data.encode("utf-8"), "pricing_specs.csv")
    assert meta.status == "processed"
    assert len(sections) == 1
    assert "NovaBook X1" in sections[0].content
    assert "16 GB" in sections[0].content
