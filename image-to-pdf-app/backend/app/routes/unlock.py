"""
API route for unlocking a password-protected PDF.
POST /api/unlock — accepts a PDF and password, returns unlocked PDF.
"""

import logging
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.utils.file_handler import create_session_dir, cleanup_session_dir, save_upload_file
from app.services.unlock_service import unlock_pdf

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Unlock"])


@router.post("/unlock")
async def unlock_pdf_file(
    file: UploadFile = File(...),
    password: Optional[str] = Form(""),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    session_dir = create_session_dir()

    try:
        pdf_path = await save_upload_file(file, session_dir)
        result_path = unlock_pdf(pdf_path, session_dir, password=password or "")

        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="unlocked.pdf",
            background=BackgroundTask(cleanup_session_dir, session_dir),
        )
    except ValueError as exc:
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Unlock error")
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=500, detail="Internal server error during unlock.")
