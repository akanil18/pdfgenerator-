# ──────────────────────────────────────────────
# Backend — Python 3.12 slim
# ──────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libjpeg-dev zlib1g-dev libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY . .

# Create temp directory
RUN mkdir -p temp_files

# Expose port (Render uses $PORT, default 8000)
EXPOSE 8000

# Start with dynamic port binding for Render compatibility
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
