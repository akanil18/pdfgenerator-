"""
Utility functions for file handling — validation, temp directory management.

MULTI-USER ISOLATION:
Each conversion request gets its own UUID-based sub-directory inside TEMP_DIR.
This guarantees zero cross-user file conflicts even under concurrent load.
Directories are cleaned up immediately after the PDF is sent.
"""

import os
import shutil
import uuid
import logging
from typing import List

from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

TEMP_DIR = os.getenv("TEMP_DIR", "temp_files")
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
ALLOWED_EXTENSIONS = os.getenv(
    "ALLOWED_EXTENSIONS", ".jpg,.jpeg,.png,.bmp,.gif,.webp,.tiff"
).split(",")

MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


# ---------------------------------------------------------------------------
# Session-based isolation — every request gets a unique directory
# ---------------------------------------------------------------------------

def create_session_dir() -> str:
    """Create and return a unique per-request temp directory."""
    session_id = uuid.uuid4().hex
    session_dir = os.path.join(TEMP_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    logger.info(f"Session directory created: {session_dir}")
    return session_dir


def cleanup_session_dir(session_dir: str) -> None:
    """Remove an entire session directory and all its contents."""
    try:
        if os.path.exists(session_dir):
            shutil.rmtree(session_dir)
            logger.info(f"Session directory cleaned: {session_dir}")
    except OSError as exc:
        logger.warning(f"Could not clean session dir {session_dir}: {exc}")


# ---------------------------------------------------------------------------
# Global temp directory management (startup / shutdown)
# ---------------------------------------------------------------------------

def ensure_temp_directory() -> None:
    """Create the root temporary directory if it doesn't exist."""
    os.makedirs(TEMP_DIR, exist_ok=True)
    logger.info(f"Temp directory ready: {TEMP_DIR}")


def cleanup_temp_directory() -> None:
    """Remove and recreate the root temp directory (shutdown cleanup)."""
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
        logger.info("Temp directory cleaned up.")
    ensure_temp_directory()


# ---------------------------------------------------------------------------
# File helpers
# ---------------------------------------------------------------------------

def get_unique_filename(original: str) -> str:
    """Generate a unique filename preserving the original extension."""
    ext = os.path.splitext(original)[1].lower()
    return f"{uuid.uuid4().hex}{ext}"


def validate_file_extension(filename: str) -> bool:
    """Return True if the file extension is in the allowed list."""
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


async def validate_file_size(file: UploadFile) -> bool:
    """Return True if file size is within the allowed limit."""
    contents = await file.read()
    await file.seek(0)  # Reset pointer for later use
    return len(contents) <= MAX_FILE_SIZE_BYTES


async def save_upload_file(file: UploadFile, session_dir: str) -> str:
    """Save an uploaded file into the session directory, return its path."""
    unique_name = get_unique_filename(file.filename or "image.png")
    file_path = os.path.join(session_dir, unique_name)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    logger.info(f"Saved upload → {file_path} ({len(contents)} bytes)")
    return file_path


def remove_file(path: str) -> None:
    """Silently remove a single file if it exists."""
    try:
        if os.path.exists(path):
            os.remove(path)
    except OSError as exc:
        logger.warning(f"Could not remove {path}: {exc}")


def remove_files(paths: List[str]) -> None:
    """Remove a list of files."""
    for p in paths:
        remove_file(p)
