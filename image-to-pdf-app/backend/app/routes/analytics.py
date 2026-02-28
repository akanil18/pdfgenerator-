"""
API route for serving analytics data.
GET /api/analytics — returns usage stats for the dashboard.
"""

import logging
from fastapi import APIRouter

from app.analytics.db import (
    get_overview,
    get_daily_stats,
    get_tool_stats,
    get_recent_requests,
    get_hourly_distribution,
    get_today_stats,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analytics"])


@router.get("/analytics")
async def get_analytics():
    """Return all analytics data for the dashboard."""
    return {
        "overview": get_overview(),
        "today": get_today_stats(),
        "daily": get_daily_stats(30),
        "tools": get_tool_stats(),
        "recent": get_recent_requests(50),
        "hourly": get_hourly_distribution(),
    }
