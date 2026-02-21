"""
PDF generation service — converts a list of image paths into a single PDF.

Thread-safe: each call writes to its own session directory, so multiple
concurrent users never interfere with each other.
"""

import os
import uuid
import logging
from typing import List

from PIL import Image
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def images_to_pdf(image_paths: List[str], session_dir: str) -> str:
    """
    Convert a list of image file paths into a single PDF.

    Uses Pillow to open each image, convert to RGB (required for PDF),
    and save all pages into one PDF file inside the given session_dir.

    Returns the path to the generated PDF.
    """
    if not image_paths:
        raise ValueError("No image paths provided.")

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
