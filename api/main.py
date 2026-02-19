"""
FastAPI application — DK Income Calculator.

Mounts routers for tax computation, metadata/exchange-rates, and feedback.
In production the built React SPA is served from ./static/.
All business logic lives in `tax_engine`; constants in `data`.
"""

import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .routers import compute, meta, feedback

app = FastAPI(title="lønklar.dk API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(compute.router)
app.include_router(meta.router)
app.include_router(feedback.router)

# ── Serve built React frontend in production ─────────────────────────
# In dev, Vite's proxy handles /api → localhost:8000, so this is unused.
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

if STATIC_DIR.is_dir():
    # Serve JS/CSS/images at /assets/...
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    # Explicit routes for SEO files (must be before the SPA catch-all)
    @app.get("/robots.txt", include_in_schema=False)
    async def robots_txt():
        return FileResponse(STATIC_DIR / "robots.txt", media_type="text/plain")

    @app.get("/sitemap.xml", include_in_schema=False)
    async def sitemap_xml():
        return FileResponse(STATIC_DIR / "sitemap.xml", media_type="application/xml")

    # Serve root static files or fall back to index.html for client-side routing
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve static files or fall back to index.html for client-side routing."""
        file = STATIC_DIR / full_path
        if full_path and file.is_file():
            return FileResponse(file)
        return FileResponse(STATIC_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
