"""
API route for compressing a PDF.
POST /api/compress — accepts a PDF and quality level, returns compressed PDF.
"""

import logging
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.utils.file_handler import create_session_dir, cleanup_session_dir, save_upload_file
from app.services.compress_service import compress_pdf

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Compress"])


@router.post("/compress")
async def compress_pdf_file(
    file: UploadFile = File(...),
    quality: Optional[str] = Form("medium"),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    if quality not in ("low", "medium", "high"):
        quality = "medium"

    session_dir = create_session_dir()

    try:
        pdf_path = await save_upload_file(file, session_dir)
        result_path = compress_pdf(pdf_path, session_dir, quality=quality)

        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="compressed.pdf",
            background=BackgroundTask(cleanup_session_dir, session_dir),
        )
    except ValueError as exc:
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Compress error")
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=500, detail="Internal server error during compression.")
