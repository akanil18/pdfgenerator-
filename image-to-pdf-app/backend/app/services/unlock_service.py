"""
Unlock PDF Service — removes password protection from a PDF.
"""

import os
import uuid
import logging

import pikepdf

logger = logging.getLogger(__name__)


def unlock_pdf(pdf_path: str, session_dir: str, password: str = "") -> str:
    """
    Remove password protection from a PDF file.

    *password* — the password to unlock the PDF (empty string for owner-only locked PDFs).
    Returns the path to the unlocked PDF.
    """
    output_filename = f"{uuid.uuid4().hex}_unlocked.pdf"
    output_path = os.path.join(session_dir, output_filename)

    try:
        pdf = pikepdf.open(pdf_path, password=password)
        pdf.save(output_path)
        pdf.close()
    except pikepdf.PasswordError:
        raise ValueError("Incorrect password. Please provide the correct password to unlock this PDF.")
    except Exception as exc:
        logger.error(f"Failed to unlock PDF: {exc}")
        raise ValueError(f"PDF unlock failed: {exc}") from exc

    file_size = os.path.getsize(output_path)
    logger.info(f"✅  Unlocked PDF created: {output_path} ({file_size:,} bytes)")
    return output_path
