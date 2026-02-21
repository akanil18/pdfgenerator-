"""
Image-to-PDF Converter — FastAPI Backend
Main application entry point with CORS, routing, and lifecycle management.

MULTI-USER: Each request uses an isolated session directory (UUID-based).
No shared state — fully safe for concurrent users.
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes.convert import router as convert_router
from app.utils.file_handler import cleanup_temp_directory, ensure_temp_directory

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")


# ---------------------------------------------------------------------------
# Lifecycle (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ensure temp directory exists on startup and is cleaned on shutdown."""
    ensure_temp_directory()
    logger.info("🚀  Image-to-PDF backend is starting …")
    yield
    cleanup_temp_directory()
    logger.info("🛑  Backend shutting down — temp files cleaned.")


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Image to PDF Converter API",
    description="Upload images and convert them into a single PDF document.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(convert_router, prefix="/api")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "Image-to-PDF Converter"}
