"""
Analytics database — lightweight SQLite storage for request tracking.

Tracks:
  - Tool usage (which endpoints are hit)
  - Request count per day
  - Processing time
  - Status codes (success / failure)
  - Unique visitors (by IP hash for privacy)

Works out of the box with SQLite (zero config).
"""

import os
import sqlite3
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from contextlib import contextmanager

logger = logging.getLogger(__name__)

DB_PATH = os.getenv("ANALYTICS_DB_PATH", "analytics.db")


@contextmanager
def get_db():
    """Thread-safe SQLite connection context manager."""
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Create analytics tables if they don't exist."""
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL DEFAULT (datetime('now')),
                date TEXT NOT NULL DEFAULT (date('now')),
                tool TEXT NOT NULL,
                status_code INTEGER NOT NULL DEFAULT 200,
                processing_ms REAL DEFAULT 0,
                file_count INTEGER DEFAULT 0,
                ip_hash TEXT,
                user_agent TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_requests_date ON requests(date);
            CREATE INDEX IF NOT EXISTS idx_requests_tool ON requests(tool);
            CREATE INDEX IF NOT EXISTS idx_requests_ip_hash ON requests(ip_hash);
        """)
    logger.info(f"✅  Analytics database initialized: {DB_PATH}")


def hash_ip(ip: str) -> str:
    """Hash IP for privacy — we never store raw IPs."""
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


def log_request(
    tool: str,
    status_code: int = 200,
    processing_ms: float = 0,
    file_count: int = 0,
    ip: Optional[str] = None,
    user_agent: Optional[str] = None,
):
    """Record a single API request."""
    try:
        ip_hash = hash_ip(ip) if ip else None
        with get_db() as conn:
            conn.execute(
                """INSERT INTO requests (tool, status_code, processing_ms, file_count, ip_hash, user_agent)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (tool, status_code, processing_ms, file_count, ip_hash, user_agent),
            )
    except Exception as exc:
        logger.warning(f"Analytics log failed: {exc}")


# ───────────────────────────────────────
# Query functions for the dashboard
# ───────────────────────────────────────

def get_overview() -> Dict[str, Any]:
    """Get high-level stats: total requests, unique users, tools used."""
    with get_db() as conn:
        row = conn.execute("""
            SELECT
                COUNT(*) as total_requests,
                COUNT(DISTINCT ip_hash) as unique_users,
                COUNT(DISTINCT tool) as tools_used,
                ROUND(AVG(processing_ms), 1) as avg_processing_ms,
                SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as success_count,
                SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count
            FROM requests
        """).fetchone()
        return dict(row) if row else {}


def get_daily_stats(days: int = 30) -> List[Dict[str, Any]]:
    """Get daily request counts for the last N days."""
    with get_db() as conn:
        cutoff = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
        rows = conn.execute(
            """SELECT date, COUNT(*) as requests, COUNT(DISTINCT ip_hash) as users
               FROM requests WHERE date >= ? GROUP BY date ORDER BY date""",
            (cutoff,),
        ).fetchall()
        return [dict(r) for r in rows]


def get_tool_stats() -> List[Dict[str, Any]]:
    """Get usage breakdown per tool."""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT tool, COUNT(*) as requests,
                      COUNT(DISTINCT ip_hash) as users,
                      ROUND(AVG(processing_ms), 1) as avg_ms,
                      SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as success,
                      SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors
               FROM requests GROUP BY tool ORDER BY requests DESC""",
        ).fetchall()
        return [dict(r) for r in rows]


def get_recent_requests(limit: int = 50) -> List[Dict[str, Any]]:
    """Get the most recent requests."""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT timestamp, tool, status_code, processing_ms, file_count
               FROM requests ORDER BY id DESC LIMIT ?""",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]


def get_hourly_distribution() -> List[Dict[str, Any]]:
    """Get request distribution by hour of day."""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT CAST(strftime('%H', timestamp) AS INTEGER) as hour,
                      COUNT(*) as requests
               FROM requests GROUP BY hour ORDER BY hour"""
        ).fetchall()
        return [dict(r) for r in rows]


def get_today_stats() -> Dict[str, Any]:
    """Get today's stats."""
    today = datetime.utcnow().strftime("%Y-%m-%d")
    with get_db() as conn:
        row = conn.execute(
            """SELECT COUNT(*) as requests,
                      COUNT(DISTINCT ip_hash) as users,
                      SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as success
               FROM requests WHERE date = ?""",
            (today,),
        ).fetchone()
        return dict(row) if row else {}
