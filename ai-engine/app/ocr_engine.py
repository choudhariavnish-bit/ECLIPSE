import os
import io
import logging
from typing import Dict, Any, List, Optional
from PIL import Image, ImageEnhance, ImageFilter

logger = logging.getLogger("ECLIPSE.OCREngine")

class OCREngine:
    """
    Multimodal OCR Engine for ECLIPSE.
    Supports scanned PDF pages and images (PNG, JPG, JPEG, WEBP).
    Uses RapidOCR (ONNX) or pytesseract with intelligent image preprocessing.
    """
    def __init__(self):
        self._rapid_ocr = None
        self._init_rapid_ocr()

    def _init_rapid_ocr(self):
        try:
            from rapidocr_onnxruntime import RapidOCR
            self._rapid_ocr = RapidOCR()
            logger.info("RapidOCR (ONNX Runtime) initialized successfully.")
        except Exception as e:
            logger.warning(f"RapidOCR not available: {e}. Will attempt pytesseract fallback.")
            self._rapid_ocr = None

    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """Enhances image contrast and sharpens text for high-accuracy OCR."""
        try:
            # Convert to grayscale
            gray = image.convert("L")
            # Increase contrast
            enhancer = ImageEnhance.Contrast(gray)
            enhanced = enhancer.enhance(1.8)
            # Gentle sharpen
            sharpened = enhanced.filter(ImageFilter.SHARPEN)
            return sharpened
        except Exception as e:
            logger.debug(f"Preprocessing error: {e}, using original image")
            return image

    def extract_text_from_image(self, image_input) -> Dict[str, Any]:
        """
        Extracts text from a PIL Image, bytes, or file path.
        Returns: { 'text': str, 'confidence': float, 'engine': str, 'lines': List[str] }
        """
        image = None
        if isinstance(image_input, (str, os.PathLike)):
            if not os.path.exists(image_input):
                return {"text": "", "confidence": 0.0, "engine": "none", "lines": []}
            image = Image.open(image_input)
        elif isinstance(image_input, bytes):
            image = Image.open(io.BytesIO(image_input))
        elif isinstance(image_input, Image.Image):
            image = image_input
        else:
            return {"text": "", "confidence": 0.0, "engine": "none", "lines": []}

        preprocessed = self.preprocess_image(image)

        # 1. Try RapidOCR (ONNX Runtime)
        if self._rapid_ocr is not None:
            try:
                # RapidOCR accepts numpy array or PIL image
                import numpy as np
                img_np = np.array(preprocessed)
                result, _ = self._rapid_ocr(img_np)
                if result:
                    lines = [line[1] for line in result if len(line) > 1 and line[1]]
                    confs = [float(line[2]) for line in result if len(line) > 2 and line[2]]
                    avg_conf = sum(confs) / len(confs) if confs else 0.9
                    full_text = "\n".join(lines).strip()
                    if full_text:
                        return {
                            "text": full_text,
                            "confidence": round(avg_conf, 2),
                            "engine": "RapidOCR-ONNX",
                            "lines": lines
                        }
            except Exception as e:
                logger.warning(f"RapidOCR execution failed: {e}")

        # 2. Try pytesseract
        try:
            import pytesseract
            text = pytesseract.image_to_string(preprocessed).strip()
            if text:
                lines = [l.strip() for l in text.split("\n") if l.strip()]
                return {
                    "text": text,
                    "confidence": 0.88,
                    "engine": "pytesseract",
                    "lines": lines
                }
        except Exception as e:
            logger.debug(f"pytesseract not available or failed: {e}")

        # 3. Fallback: return empty text if no OCR engines produced text
        return {
            "text": "",
            "confidence": 0.0,
            "engine": "none",
            "lines": []
        }

ocr_engine = OCREngine()

