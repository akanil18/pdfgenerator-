"""
Split PDF Service — extracts page ranges or individual pages from a PDF.
"""

import os
import uuid
import zipfile
import logging
from typing import Optional

from pypdf import PdfReader, PdfWriter

logger = logging.getLogger(__name__)


def split_pdf(
    pdf_path: str,
    session_dir: str,
    ranges: Optional[str] = None,
) -> str:
    """
    Split a PDF into multiple files.

    *ranges* — comma-separated page ranges, e.g. "1-3,5,7-9".
    If None, every page becomes its own PDF.

    Returns the path to a ZIP archive containing the split PDFs.
    """
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)

    if total_pages == 0:
        raise ValueError("The PDF has no pages.")

    # Parse ranges
    page_groups = _parse_ranges(ranges, total_pages) if ranges else [[i] for i in range(total_pages)]

    split_dir = os.path.join(session_dir, "split_output")
    os.makedirs(split_dir, exist_ok=True)

    output_files = []
    for group_idx, pages in enumerate(page_groups):
        writer = PdfWriter()
        for page_num in pages:
            writer.add_page(reader.pages[page_num])

        if len(pages) == 1:
            fname = f"page_{pages[0] + 1}.pdf"
        else:
            fname = f"pages_{pages[0] + 1}-{pages[-1] + 1}.pdf"

        out_path = os.path.join(split_dir, fname)
        with open(out_path, "wb") as f:
            writer.write(f)
        output_files.append(out_path)
        logger.info(f"Split part {group_idx + 1}: {fname}")

    # If only one output file, return it directly
    if len(output_files) == 1:
        return output_files[0]

    # Otherwise, zip them up
    zip_filename = f"{uuid.uuid4().hex}_split.zip"
    zip_path = os.path.join(session_dir, zip_filename)
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for fpath in output_files:
            zf.write(fpath, os.path.basename(fpath))

    logger.info(f"✅  Split ZIP created: {zip_path} ({len(output_files)} files)")
    return zip_path


def _parse_ranges(ranges: str, total_pages: int) -> list:
    """Parse '1-3,5,7-9' into [[0,1,2],[4],[6,7,8]]."""
    groups = []
    for part in ranges.split(","):
        part = part.strip()
        if "-" in part:
            start_s, end_s = part.split("-", 1)
            start = max(0, int(start_s) - 1)
            end = min(total_pages - 1, int(end_s) - 1)
            groups.append(list(range(start, end + 1)))
        else:
            page = int(part) - 1
            if 0 <= page < total_pages:
                groups.append([page])
    if not groups:
        raise ValueError(f"Invalid page ranges: {ranges}")
    return groups
