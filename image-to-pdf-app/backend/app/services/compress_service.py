"""
Compress PDF Service — reduces the file size of a PDF.
"""

import os
import uuid
import logging

import pikepdf

logger = logging.getLogger(__name__)


def compress_pdf(pdf_path: str, session_dir: str, quality: str = "medium") -> str:
    """
    Compress a PDF file to reduce its size.

    *quality* — "low" (most compression), "medium" (balanced), "high" (least compression).
    Returns the path to the compressed PDF.
    """
    output_filename = f"{uuid.uuid4().hex}_compressed.pdf"
    output_path = os.path.join(session_dir, output_filename)

    # Map quality to pikepdf stream decode level
    stream_decode = {
        "low": pikepdf.ObjectStreamMode.generate,
        "medium": pikepdf.ObjectStreamMode.generate,
        "high": pikepdf.ObjectStreamMode.preserve,
    }.get(quality, pikepdf.ObjectStreamMode.generate)

    try:
        with pikepdf.open(pdf_path) as pdf:
            # Recompress images within the PDF
            if quality in ("low", "medium"):
                _compress_images(pdf, quality)

            # Remove metadata to save space
            if quality == "low":
                pdf.docinfo.clear()

            pdf.save(
                output_path,
                object_stream_mode=stream_decode,
                compress_streams=True,
                recompress_flate=True,
                linearize=True,
            )
    except Exception as exc:
        logger.error(f"Failed to compress PDF: {exc}")
        raise ValueError(f"PDF compression failed: {exc}") from exc

    original_size = os.path.getsize(pdf_path)
    compressed_size = os.path.getsize(output_path)
    reduction = ((original_size - compressed_size) / original_size) * 100 if original_size > 0 else 0

    logger.info(
        f"✅  Compressed PDF: {original_size:,} → {compressed_size:,} bytes "
        f"({reduction:.1f}% reduction)"
    )
    return output_path


def _compress_images(pdf: pikepdf.Pdf, quality: str) -> None:
    """Walk through PDF objects and recompress images."""
    from PIL import Image as PILImage
    import io

    jpeg_quality = 40 if quality == "low" else 65

    for page in pdf.pages:
        try:
            resources = page.get("/Resources", {})
            xobjects = resources.get("/XObject", {})
            for key in xobjects:
                obj = xobjects[key]
                if not hasattr(obj, "read_bytes"):
                    continue
                subtype = obj.get("/Subtype")
                if subtype != "/Image":
                    continue

                # Try to recompress
                try:
                    width = int(obj.get("/Width", 0))
                    height = int(obj.get("/Height", 0))
                    if width == 0 or height == 0:
                        continue

                    raw_data = obj.read_bytes()
                    img = PILImage.open(io.BytesIO(raw_data))
                    img = img.convert("RGB")

                    buf = io.BytesIO()
                    img.save(buf, format="JPEG", quality=jpeg_quality, optimize=True)
                    obj.write(buf.getvalue(), filter=pikepdf.Name("/DCTDecode"))
                except Exception:
                    pass  # Skip images that can't be recompressed
        except Exception:
            pass  # Skip pages with unusual structures
