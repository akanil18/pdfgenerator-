"""
API route for converting handwritten notes PDF to typeset PDF.
POST /api/handwriting — accepts a PDF with handwritten notes, returns a clean typeset PDF.
"""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.utils.file_handler import create_session_dir, cleanup_session_dir, save_upload_file
from app.services.handwriting_service import handwritten_notes_to_pdf

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Handwriting to PDF"])


@router.post("/handwriting")
async def convert_handwriting_to_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    session_dir = create_session_dir()

    try:
        pdf_path = await save_upload_file(file, session_dir)
        result_path = handwritten_notes_to_pdf(pdf_path, session_dir)

        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="typeset_notes.pdf",
            background=BackgroundTask(cleanup_session_dir, session_dir),
        )
    except ValueError as exc:
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Handwriting to PDF error")
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=500, detail="Internal server error during handwriting conversion.")
