"""
API route for converting PDF to Word.
POST /api/pdf-to-word — accepts a PDF, returns a DOCX.
"""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.utils.file_handler import create_session_dir, cleanup_session_dir, save_upload_file
from app.services.word_service import pdf_to_word

logger = logging.getLogger(__name__)
router = APIRouter(tags=["PDF to Word"])


@router.post("/pdf-to-word")
async def convert_pdf_to_word(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    session_dir = create_session_dir()

    try:
        pdf_path = await save_upload_file(file, session_dir)
        docx_path = pdf_to_word(pdf_path, session_dir)

        return FileResponse(
            path=docx_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename="converted.docx",
            background=BackgroundTask(cleanup_session_dir, session_dir),
        )
    except ValueError as exc:
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("PDF to Word error")
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=500, detail="Internal server error during conversion.")
