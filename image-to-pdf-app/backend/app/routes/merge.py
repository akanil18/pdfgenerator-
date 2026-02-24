"""
API route for merging multiple PDFs.
POST /api/merge — accepts multiple PDF uploads, returns merged PDF.
"""

import os
import logging
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.utils.file_handler import create_session_dir, cleanup_session_dir, save_upload_file
from app.services.merge_service import merge_pdfs

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Merge"])


@router.post("/merge")
async def merge_pdf_files(files: List[UploadFile] = File(...)):
    if not files or len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required.")

    session_dir = create_session_dir()
    saved_paths = []

    try:
        for file in files:
            if not file.filename or not file.filename.lower().endswith(".pdf"):
                raise HTTPException(status_code=400, detail=f"Invalid file: {file.filename}. Only PDF files are accepted.")
            path = await save_upload_file(file, session_dir)
            saved_paths.append(path)

        pdf_path = merge_pdfs(saved_paths, session_dir)

        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename="merged.pdf",
            background=BackgroundTask(cleanup_session_dir, session_dir),
        )
    except HTTPException:
        cleanup_session_dir(session_dir)
        raise
    except ValueError as exc:
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Merge error")
        cleanup_session_dir(session_dir)
        raise HTTPException(status_code=500, detail="Internal server error during merge.")
