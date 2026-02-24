"""
PDF generation service — converts a list of image paths into a single PDF.

Thread-safe: each call writes to its own session directory, so multiple
concurrent users never interfere with each other.

Supports page-size modes:
  - "fit"       → each page is exactly the image size (default)
  - "a4"        → landscape A4 (297 × 210 mm), image centred
  - "letter"    → landscape US Letter (279.4 × 215.9 mm), image centred
"""

import os
import uuid
import logging
from typing import List, Optional

from PIL import Image
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Millimetre → pixel at 150 DPI
_MM_TO_PX_150 = 150 / 25.4

PAGE_SIZES = {
    "a4":     (297, 210),       # landscape A4 in mm
    "letter": (279.4, 215.9),   # landscape US Letter in mm
}


def _mm_to_px(mm_w: float, mm_h: float) -> tuple:
    return int(mm_w * _MM_TO_PX_150), int(mm_h * _MM_TO_PX_150)


def _fit_image_on_page(img: Image.Image, page_w: int, page_h: int) -> Image.Image:
    """
    Centre-fit *img* onto a white canvas of (page_w × page_h) pixels,
    maintaining aspect ratio with a small margin.
    """
    margin = int(min(page_w, page_h) * 0.03)   # 3 % margin
    avail_w = page_w - 2 * margin
    avail_h = page_h - 2 * margin

    ratio = min(avail_w / img.width, avail_h / img.height)
    new_w = int(img.width * ratio)
    new_h = int(img.height * ratio)

    resized = img.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGB", (page_w, page_h), (255, 255, 255))
    x = (page_w - new_w) // 2
    y = (page_h - new_h) // 2
    canvas.paste(resized, (x, y))
    return canvas


def images_to_pdf(
    image_paths: List[str],
    session_dir: str,
    page_size: Optional[str] = None,
) -> str:
    """
    Convert a list of image file paths into a single PDF.

    *page_size* can be ``"fit"`` (default), ``"a4"``, or ``"letter"``.
    Returns the path to the generated PDF.
    """
    if not image_paths:
        raise ValueError("No image paths provided.")

    page_size = (page_size or "fit").lower().strip()

    pdf_filename = f"{uuid.uuid4().hex}.pdf"
    pdf_path = os.path.join(session_dir, pdf_filename)

    rgb_images: List[Image.Image] = []

    for idx, img_path in enumerate(image_paths):
        try:
            img = Image.open(img_path)

            # Handle RGBA / palette images → convert to RGB
            if img.mode in ("RGBA", "LA"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1])
                img = background
            elif img.mode != "RGB":
                img = img.convert("RGB")

            # Apply page-size fitting
            if page_size in PAGE_SIZES:
                mm_w, mm_h = PAGE_SIZES[page_size]
                pw, ph = _mm_to_px(mm_w, mm_h)
                # Choose landscape or portrait based on the image orientation
                if img.width < img.height:
                    pw, ph = ph, pw
                img = _fit_image_on_page(img, pw, ph)

            rgb_images.append(img)
            logger.info(f"Processed image {idx + 1}/{len(image_paths)}: {img_path}")
        except Exception as exc:
            logger.error(f"Failed to process image {img_path}: {exc}")
            raise ValueError(f"Could not process image: {os.path.basename(img_path)}") from exc

    # First image is the base; remaining are appended
    first, *rest = rgb_images
    first.save(
        pdf_path,
        "PDF",
        resolution=150.0,
        save_all=True,
        append_images=rest,
    )

    # Close all images to free memory
    for img in rgb_images:
        img.close()

    file_size = os.path.getsize(pdf_path)
    logger.info(f"✅  PDF created: {pdf_path} ({file_size:,} bytes, {len(image_paths)} pages)")
    return pdf_path
