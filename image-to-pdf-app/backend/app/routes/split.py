"""
API route for splitting a PDF.
POST /api/split — accepts a PDF and optional page ranges, returns split result.
"""

import os
import logging
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.utils.file_handler import create_session_dir, cleanup_session_dir, save_upload_file
from app.services.split_service import split_pdf

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Split"])


@router.post("/split")
async def split_pdf_file(
    file: UploadFile = File(...),
    ranges: Optional[str] = Form(None),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    session_dir = create_session_dir()

    try:
        pdf_path = await save_upload_file(file, session_dir)
        result_path = split_pdf(pdf_path, session_dir, ranges=ranges)

        media_type = "application/pdf" if result_path.endswith(".pdf") else "application/zip"
        filename = "split.pdf" if result_path.endswith(".pdf") else "split_pages.zip"

        return FileResponse(
            path=result_path,
            media_type=media_type,
            filename=filename,
            background=BackgroundTask(cleanup_session_dir, session_dir),
        )
    except HTTPException:
        cleanup_session_dir(session_dir)
        raise
    except ValueError as exc:
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Split error")
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=500, detail="Internal server error during split.")
