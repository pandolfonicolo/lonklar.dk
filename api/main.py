"""
FastAPI application — DK Income Calculator.

Mounts routers for tax computation, metadata/exchange-rates, and feedback.
All business logic lives in `tax_engine`; constants in `data`.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import compute, meta, feedback

app = FastAPI(title="DK Income Calculator API", version="1.0.0")

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
