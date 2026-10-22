import json
import math
import time
from datetime import datetime, timezone
from functools import wraps

from fastapi import FastAPI, HTTPException, Request
from starlette.responses import JSONResponse

from api.models import FeedbackRequest, AccuracyReportRequest, VoteRequest
from api.routers import compute, meta

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
    response = await call_next(request)
    response.headers["X-Robots-Tag"] = "noindex, nofollow, noarchive"
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Lonklar-Environment"] = "python-workers-poc"
    return response


def db(request):
    return request.scope["env"].FEEDBACK_DB


async def limited(request, category, limit):
    # Atomic, persistent counter; no mutable process state or raw IP storage.
    import hashlib
    bucket = int(time.time()) // 60
    ip = request.headers.get("cf-connecting-ip", "local")
    key = hashlib.sha256(f"{bucket}:{category}:{ip}".encode()).hexdigest()
    result = await db(request).prepare(
        "INSERT INTO rate_limits (key, bucket, count) VALUES (?1, ?2, 1) "
        "ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count"
    ).bind(key, bucket).first("count")
    await db(request).prepare("DELETE FROM rate_limits WHERE bucket < ?1").bind(bucket - 2).run()
    if result > limit:
        raise HTTPException(429, "Too many requests", headers={"Retry-After": "60"})


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


async def save(request, kind, data, report_id=None):
    payload = json.dumps(data, sort_keys=True, ensure_ascii=False, allow_nan=False)
    timestamp = datetime.now(timezone.utc).isoformat()
    inserted = await db(request).prepare(
        "INSERT INTO feedback(kind, report_id, payload, created_at) VALUES (?1, ?2, ?3, ?4) "
        "ON CONFLICT(report_id) DO NOTHING"
    ).bind(kind, report_id, payload, timestamp).run()
    if inserted.meta.changes:
        return True
    previous = await db(request).prepare("SELECT payload FROM feedback WHERE report_id=?1").bind(report_id).first("payload")
    if previous != payload:
        raise HTTPException(409, "Report ID already used for different data")
    return False


@app.post("/api/feedback")
async def feedback(req: FeedbackRequest, request: Request):
    await limited(request, "feedback", 10)
    await save(request, "feedback", req.model_dump())
    return {"status": "ok"}


@app.post("/api/accuracy-report")
async def accuracy_report(req: AccuracyReportRequest, request: Request):
    await limited(request, "accuracy-report", 10)
    data = req.model_dump()
    data["difference"] = round(req.actual_net_monthly - req.estimated_net_monthly, 2)
    data["difference_pct"] = round((req.actual_net_monthly - req.estimated_net_monthly) / req.estimated_net_monthly * 100, 2) if req.estimated_net_monthly else 0
    saved = await save(request, "accuracy_reports", data, req.report_id)
    return {"status": "ok", "report_id": req.report_id, "duplicate": not saved}


@app.post("/api/vote")
async def vote(req: VoteRequest, request: Request):
    await limited(request, "vote", 30)
    await save(request, "votes", req.model_dump())
    return {"status": "ok"}


@app.get("/api/vote/stats")
async def vote_stats(request: Request):
    await limited(request, "vote-stats", 60)
    result = await db(request).prepare(
        "SELECT COALESCE(SUM(json_extract(payload, '$.vote')='up'),0) AS up, "
        "COALESCE(SUM(json_extract(payload, '$.vote')='down'),0) AS down FROM feedback WHERE kind='votes'"
    ).first()
    return {"up": result.up, "down": result.down, "total": result.up + result.down}


# Intentionally no public admin export. Inspect only the dedicated test DB via
# authenticated Wrangler. No production ADMIN_TOKEN or feedback data is copied.

# Outermost middleware: enforce the cap before any body-reading middleware.
app.add_middleware(BodyLimit)
