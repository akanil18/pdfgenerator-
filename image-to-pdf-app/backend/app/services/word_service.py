"""
PDF to Word Service — converts a PDF to a DOCX document.
"""

import os
import uuid
import logging

from pdf2docx import Converter

logger = logging.getLogger(__name__)


def pdf_to_word(pdf_path: str, session_dir: str) -> str:
    """
    Convert a PDF file to a Word (.docx) document.
    Returns the path to the generated DOCX file.
    """
    docx_filename = f"{uuid.uuid4().hex}.docx"
    docx_path = os.path.join(session_dir, docx_filename)

    try:
        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()
    except Exception as exc:
        logger.error(f"Failed to convert PDF to Word: {exc}")
        raise ValueError(f"PDF to Word conversion failed: {exc}") from exc

    file_size = os.path.getsize(docx_path)
    logger.info(f"✅  DOCX created: {docx_path} ({file_size:,} bytes)")
    return docx_path
