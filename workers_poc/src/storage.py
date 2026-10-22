"""D1 persistence shared by public collection and protected administration."""
import hashlib
import json
import time
from datetime import datetime, timezone
from fastapi import HTTPException
from api.models import FeedbackRequest, AccuracyReportRequest, VoteRequest

MODELS = {"feedback": FeedbackRequest, "accuracy_reports": AccuracyReportRequest, "votes": VoteRequest}


def db(request):
    return request.scope["env"].FEEDBACK_DB


def now():
    return datetime.now(timezone.utc).isoformat()


async def limited(request, category, limit):
    bucket = int(time.time()) // 60
    ip = request.headers.get("cf-connecting-ip", "local")
    key = hashlib.sha256(f"{bucket}:{category}:{ip}".encode()).hexdigest()
    count = await db(request).prepare(
        "INSERT INTO rate_limits (key, bucket, count) VALUES (?1, ?2, 1) "
        "ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count"
    ).bind(key, bucket).first("count")
    await db(request).prepare("DELETE FROM rate_limits WHERE bucket < ?1").bind(bucket - 2).run()
    if count > limit:
        raise HTTPException(429, "Too many requests", headers={"Retry-After": "60"})


def normalize(kind, record):
    model = MODELS[kind].model_validate(record)
    data = model.model_dump()
    if kind == "accuracy_reports":
        delta = model.actual_net_monthly - model.estimated_net_monthly
        data.update(difference=round(delta, 2), difference_pct=round(delta / model.estimated_net_monthly * 100, 2) if model.estimated_net_monthly else 0)
    return json.dumps(data, sort_keys=True, ensure_ascii=False, allow_nan=False), data.get("report_id")


def statement(database, kind, record, timestamp=None, source_key=None, archived_at=None):
    payload, report_id = normalize(kind, record)
    timestamp = timestamp or now()
    source_key = source_key or hashlib.sha256(f"{kind}:{timestamp}:{payload}".encode()).hexdigest()
    return database.prepare(
        "INSERT INTO feedback(kind,report_id,payload,created_at,source_key,archived_at) "
        "VALUES (?1,?2,?3,?4,?5,?6) ON CONFLICT DO NOTHING"
    ).bind(kind, report_id, payload, timestamp, source_key, archived_at)


def storage_error(error):
    if isinstance(error, (ValueError, TypeError)):
        raise HTTPException(422, "Invalid feedback record") from error
    if "LONKLAR_REPORT_CONFLICT" in str(error):
        raise HTTPException(409, "Report ID already used for different data") from error
    raise error


async def save(database, kind, record):
    try:
        result = await statement(database, kind, record).run()
        return bool(result.meta.changes)
    except Exception as error:
        storage_error(error)


def unpack(row):
    return {"id": row.id, "kind": row.kind, "record": {**json.loads(row.payload), "timestamp": row.created_at},
            "archived_at": row.archived_at}
