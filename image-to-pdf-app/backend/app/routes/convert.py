"""
API route for image-to-PDF conversion.
POST /api/convert  — accepts multipart images, returns a PDF download.

MULTI-USER ISOLATION:
Every request creates its own UUID-based session directory.
All uploaded images and the generated PDF live inside that directory.
After the response is sent, a BackgroundTask cleans up the entire directory.
This means multiple users converting simultaneously never conflict.
"""

import os
import logging
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.utils.file_handler import (
    validate_file_extension,
    validate_file_size,
    save_upload_file,
    create_session_dir,
    cleanup_session_dir,
)
from app.services.pdf_service import images_to_pdf

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Convert"])

# ---------------------------------------------------------------------------
# POST /api/convert
# ---------------------------------------------------------------------------

@router.post("/convert")
async def convert_images_to_pdf(files: List[UploadFile] = File(...)):
    """
    Accept multiple image uploads and return a single merged PDF.
    Each request is fully isolated via a unique session directory.
    """

    # --- Guard: no files ---------------------------------------------------
    if not files:
        raise HTTPException(status_code=400, detail="No files were uploaded.")

    logger.info(f"Received {len(files)} file(s) for conversion.")

    # --- Create isolated session directory for this request ----------------
    session_dir = create_session_dir()
    saved_paths: List[str] = []

    try:
        # --- Validate & save each file ------------------------------------
        for file in files:
            # Extension check
            if not file.filename or not validate_file_extension(file.filename):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type: {file.filename}. "
                           f"Allowed: JPG, JPEG, PNG, BMP, GIF, WEBP, TIFF.",
                )

            # Size check
            if not await validate_file_size(file):
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large: {file.filename}. Max size is 10 MB per file.",
                )

            path = await save_upload_file(file, session_dir)
            saved_paths.append(path)

        # --- Convert to PDF -----------------------------------------------
        pdf_path = images_to_pdf(saved_paths, session_dir)

        # --- Return PDF as download ---------------------------------------
        # BackgroundTask cleans up the entire session dir AFTER response is sent
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename="converted.pdf",
            background=BackgroundTask(cleanup_session_dir, session_dir),
        )

    except HTTPException:
        # Re-raise known HTTP errors, cleanup on failure
        cleanup_session_dir(session_dir)
        raise

    except ValueError as exc:
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=422, detail=str(exc))

    except Exception as exc:
        logger.exception("Unexpected error during conversion.")
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=500, detail="Internal server error during conversion.")
