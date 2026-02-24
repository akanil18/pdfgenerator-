"""
Merge PDF Service — combines multiple PDF files into one.
"""

import os
import uuid
import logging
from typing import List

from pypdf import PdfReader, PdfWriter

logger = logging.getLogger(__name__)


def merge_pdfs(pdf_paths: List[str], session_dir: str) -> str:
    """
    Merge multiple PDF files into a single PDF.
    Returns the path to the merged PDF.
    """
    if not pdf_paths:
        raise ValueError("No PDF files provided.")

    writer = PdfWriter()

    for idx, pdf_path in enumerate(pdf_paths):
        try:
            reader = PdfReader(pdf_path)
            for page in reader.pages:
                writer.add_page(page)
            logger.info(f"Added PDF {idx + 1}/{len(pdf_paths)}: {pdf_path} ({len(reader.pages)} pages)")
        except Exception as exc:
            logger.error(f"Failed to read PDF {pdf_path}: {exc}")
            raise ValueError(f"Could not process PDF: {os.path.basename(pdf_path)}") from exc

    output_filename = f"{uuid.uuid4().hex}.pdf"
    output_path = os.path.join(session_dir, output_filename)

    with open(output_path, "wb") as f:
        writer.write(f)

    file_size = os.path.getsize(output_path)
    logger.info(f"✅  Merged PDF created: {output_path} ({file_size:,} bytes, {len(writer.pages)} pages)")
    return output_path
