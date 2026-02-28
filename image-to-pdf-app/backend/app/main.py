"""
PDF Toolkit — FastAPI Backend
Main application entry point with CORS, routing, analytics, and lifecycle management.

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
from app.routes.merge import router as merge_router
from app.routes.split import router as split_router
from app.routes.pdf_to_word import router as word_router
from app.routes.pdf_to_excel import router as excel_router
from app.routes.pdf_to_ppt import router as ppt_router
from app.routes.compress import router as compress_router
from app.routes.unlock import router as unlock_router
from app.routes.handwriting import router as handwriting_router
from app.routes.analytics import router as analytics_router
from app.analytics.db import init_db
from app.analytics.middleware import AnalyticsMiddleware
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
    """Ensure temp directory exists on startup, init analytics DB."""
    ensure_temp_directory()
    init_db()
    logger.info("🚀  PDF Toolkit backend is starting …")
    yield
    cleanup_temp_directory()
    logger.info("🛑  Backend shutting down — temp files cleaned.")


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="PDF Toolkit API",
    description="A complete PDF toolkit — convert, merge, split, compress, unlock, and more.",
    version="2.0.0",
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

# Analytics middleware — tracks every /api/* request
app.add_middleware(AnalyticsMiddleware)

# Routes — each feature has its own router
app.include_router(convert_router, prefix="/api")
app.include_router(merge_router, prefix="/api")
app.include_router(split_router, prefix="/api")
app.include_router(word_router, prefix="/api")
app.include_router(excel_router, prefix="/api")
app.include_router(ppt_router, prefix="/api")
app.include_router(compress_router, prefix="/api")
app.include_router(unlock_router, prefix="/api")
app.include_router(handwriting_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "PDF Toolkit", "version": "2.0.0"}
