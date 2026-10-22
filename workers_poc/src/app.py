import json
import math
import time
from datetime import datetime, timezone
from functools import wraps

from fastapi import FastAPI, HTTPException, Request
from starlette.responses import JSONResponse

from api.routers import compute, meta
from storage import db
from feedback_api import router as feedback_router
from diagnostics import stamp

app = FastAPI(title="Lonklar Python Workers proof", redirect_slashes=False)


class BodyLimit:
    """Bound incoming bodies before FastAPI parses them (including chunked POSTs)."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["method"] != "POST":
            return await self.app(scope, receive, send)
        chunks = []
        size = 0
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            size += len(message.get("body", b""))
            if size > 65_536:
                return await JSONResponse({"detail": "Payload too large"}, status_code=413)(scope, receive, send)
            chunks.append(message)
            if not message.get("more_body", False):
                break
        async def replay():
            return chunks.pop(0) if chunks else await receive()
        await self.app(scope, replay, send)


def async_endpoint(endpoint):
    # Starlette's synchronous endpoints use a threadpool, unavailable in Wasm.
    # Preserve FastAPI's signature/model validation and the original calculations.
    @wraps(endpoint)
    async def call(*args, **kwargs):
        return endpoint(*args, **kwargs)
    return call


for route in compute.router.routes:
    app.add_api_route(route.path, async_endpoint(route.endpoint), methods=route.methods)


@app.middleware("http")
async def proof_headers(request: Request, call_next):
    if request.method == "POST":
        # Bound request size before Pydantic deserializes nested inputs.
        body = await request.body()
        if len(body) > 65_536:
            return JSONResponse({"detail": "Payload too large"}, status_code=413)
        origin = request.headers.get("origin")
        if origin and origin != str(request.base_url).rstrip("/"):
            return JSONResponse({"detail": "Cross-origin writes disabled"}, status_code=403)
        if request.url.path.startswith("/api/compute/"):
            try:
                values = json.loads(body)
                # Keep experiments bounded on the free Workers CPU budget.
                if not isinstance(values, dict):
                    raise ValueError()
                if request.url.path.endswith("/curve"):
                    points = values.get("points", 50)
                    step = values.get("step_monthly", 0)
                    span = values.get("max_gross", 1_200_000) - values.get("min_gross", 0)
                    count = span / (step * 12) if step > 0 else points
                    if not math.isfinite(count) or count < 1 or count > 500:
                        raise ValueError()
                if values.get("max_hours", 220) > 500:
                    raise ValueError()
            except (ValueError, TypeError, ZeroDivisionError):
                return JSONResponse({"detail": "Proof accepts at most 500 chart samples/hours"}, status_code=422)
    instance, invocation = stamp()
    response = await call_next(request)
    response.headers["X-Robots-Tag"] = "noindex, nofollow, noarchive"
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Lonklar-Environment"] = "python-workers-poc"
    response.headers["X-Lonklar-Instance"] = instance
    response.headers["X-Lonklar-Invocation"] = str(invocation)
    return response


@app.get("/api/meta")
async def metadata(request: Request):
    result = meta.get_meta()
    result["data_freshness"]["site_updated_at"] = getattr(request.scope["env"], "APP_UPDATED_AT", None)
    return result


@app.get("/api/poc/health")
async def health(request: Request):
    await db(request).prepare("SELECT 1 FROM feedback LIMIT 1").all()
    return {"status": "ok", "runtime": "python-workers", "storage": "D1", "synthetic_data_only": True}


@app.get("/api/exchange-rates")
async def exchange_rates(request: Request):
    # Native Workers fetch rather than httpx sockets; D1 caches public rates.
    now = int(time.time())
    cached = await db(request).prepare("SELECT payload FROM exchange_cache WHERE id=1 AND expires>?1").bind(now).first("payload")
    if cached:
        return json.loads(cached)
    from workers import fetch
    result = {"base": "DKK", "rates": meta.FALLBACK_RATES, "currencies": meta.SUPPORTED_CURRENCIES,
              "source": "fallback", "date": "2026-06-29", "cached_until": now + 3600}
    try:
        codes = ",".join(meta.SUPPORTED_CURRENCIES)
        response = await fetch(f"https://api.frankfurter.app/latest?from=DKK&to={codes}")
        if response.status != 200:
            raise ValueError("Exchange provider unavailable")
        values = await response.json()
        # workers.Response.json() returns ordinary Python objects.
        rates = {code: round(1 / value, 6) for code, value in values["rates"].items() if value > 0}
        if rates:
            result.update(rates=rates, date=values.get("date"), source="frankfurter.app")
    except Exception:
        pass  # Explicit, labeled fallback; never cache salary/request data.
    await db(request).prepare("INSERT INTO exchange_cache VALUES (1, ?1, ?2) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, expires=excluded.expires").bind(json.dumps(result), now + 3600).run()
    return result


app.include_router(feedback_router)

# Outermost middleware: enforce the cap before any body-reading middleware.
app.add_middleware(BodyLimit)
