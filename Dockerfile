# ── Stage 1: Build frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ── Stage 2: Production image ───────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend
COPY api/ ./api/

# Copy built frontend from Stage 1
COPY --from=frontend /build/dist ./static/

# Feedback data volume (persisted externally in production)
RUN mkdir -p /app/feedback_data

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
