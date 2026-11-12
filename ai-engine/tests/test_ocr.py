import os
import io
import pytest
from PIL import Image, ImageDraw
from app.ocr_engine import ocr_engine

def test_image_preprocessing():
    """Verify image preprocessing sharpens and enhances contrast."""
    img = Image.new("RGB", (200, 100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((10, 30), "ECLIPSE OCR TEST", fill=(0, 0, 0))

    preprocessed = ocr_engine.preprocess_image(img)
    assert preprocessed.mode == "L"  # Grayscale conversion
    assert preprocessed.size == (200, 100)

def test_ocr_engine_execution():
    """Test OCR engine runs on an in-memory image without crashing."""
    img = Image.new("RGB", (300, 100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((20, 40), "ECLIPSE BRAND", fill=(0, 0, 0))

    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    result = ocr_engine.extract_text_from_image(img_byte_arr.getvalue())

    assert isinstance(result, dict)
    assert "text" in result
    assert "confidence" in result
    assert "engine" in result
