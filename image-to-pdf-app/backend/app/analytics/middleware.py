"""
Analytics middleware — automatically tracks all /api/* requests.
"""

import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.analytics.db import log_request

logger = logging.getLogger(__name__)

# Map URL paths to human-readable tool names
TOOL_MAP = {
    "/api/convert": "image-to-pdf",
    "/api/merge": "merge-pdf",
    "/api/split": "split-pdf",
    "/api/pdf-to-word": "pdf-to-word",
    "/api/pdf-to-excel": "pdf-to-excel",
    "/api/pdf-to-ppt": "pdf-to-ppt",
    "/api/compress": "compress-pdf",
    "/api/unlock": "unlock-pdf",
    "/api/handwriting": "handwriting-to-pdf",
}


class AnalyticsMiddleware(BaseHTTPMiddleware):
    """Record every API request for analytics."""

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path

        # Only track /api/* endpoints (skip health checks, static, etc.)
        if not path.startswith("/api/") or path == "/api/analytics":
            return await call_next(request)

        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000

        # Determine tool name
        tool = TOOL_MAP.get(path, path.replace("/api/", ""))

        # Get client info (privacy-safe)
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")[:200]

        # Count files if multipart form
        file_count = 0
        content_type = request.headers.get("content-type", "")
        if "multipart/form-data" in content_type:
            # We can't easily count files from middleware, so just log 1
            file_count = 1

        log_request(
            tool=tool,
            status_code=response.status_code,
            processing_ms=round(elapsed_ms, 1),
            file_count=file_count,
            ip=client_ip,
            user_agent=user_agent,
        )

        logger.info(
            f"📊 Analytics: {tool} | {response.status_code} | {elapsed_ms:.0f}ms"
        )

        return response
