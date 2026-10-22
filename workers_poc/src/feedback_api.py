"""Collection, reversible archive, bounded export and atomic legacy import."""
import hashlib
import hmac
import json
from datetime import datetime
from typing import Literal
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from pydantic import BaseModel, Field, field_validator
from starlette.responses import StreamingResponse
from api.models import FeedbackRequest, AccuracyReportRequest, VoteRequest
from storage import db, limited, now, normalize, save, statement, storage_error, unpack

router = APIRouter(prefix="/api")
Kind = Literal["feedback", "accuracy_reports", "votes"]


async def admin(request: Request, x_admin_token: str | None = Header(None)):
    await limited(request, "admin", 120)
    expected = getattr(request.scope["env"], "FEEDBACK_ADMIN_TOKEN", "")
    if len(expected) < 32:
        raise HTTPException(503, "Feedback administration is not configured")
    supplied = (x_admin_token or "").encode()
    if not hmac.compare_digest(supplied, expected.encode()):
        raise HTTPException(401, "Unauthorized")


@router.post("/feedback")
async def feedback(req: FeedbackRequest, request: Request):
    await limited(request, "feedback", 10)
    await save(db(request), "feedback", req.model_dump())
    return {"status": "ok"}


@router.post("/accuracy-report")
async def accuracy(req: AccuracyReportRequest, request: Request):
    await limited(request, "accuracy-report", 10)
    saved = await save(db(request), "accuracy_reports", req.model_dump())
    return {"status": "ok", "report_id": req.report_id, "duplicate": not saved}


@router.post("/vote")
async def vote(req: VoteRequest, request: Request):
    await limited(request, "vote", 30)
    await save(db(request), "votes", req.model_dump())
    return {"status": "ok"}


@router.get("/vote/stats")
async def vote_stats(request: Request):
    await limited(request, "vote-stats", 60)
    counts = await db(request).prepare(
        "SELECT COALESCE(SUM(json_extract(payload,'$.vote')='up'),0) AS up, "
        "COALESCE(SUM(json_extract(payload,'$.vote')='down'),0) AS down FROM feedback WHERE kind='votes'"
    ).first()
    return {"up": counts.up, "down": counts.down, "total": counts.up + counts.down}


@router.get("/admin/feedback", dependencies=[Depends(admin)])
async def listing(request: Request, limit: int = Query(50, ge=1, le=100), before: int | None = Query(None, ge=1),
                  kind: Kind | None = None, archived: bool = False):
    clauses, params = ["archived_at IS NOT NULL" if archived else "archived_at IS NULL"], []
    if before is not None:
        params.append(before); clauses.append(f"id<?{len(params)}")
    if kind:
        params.append(kind); clauses.append(f"kind=?{len(params)}")
    params.append(limit + 1)
    result = await db(request).prepare("SELECT * FROM feedback WHERE " + " AND ".join(clauses) + f" ORDER BY id DESC LIMIT ?{len(params)}").bind(*params).all()
    rows = [unpack(row) for row in result.results]
    more = len(rows) > limit
    rows = rows[:limit]
    counts = await db(request).prepare("SELECT kind, archived_at IS NOT NULL AS archived, COUNT(*) AS count FROM feedback GROUP BY kind, archived_at IS NOT NULL").all()
    summary = [{"kind": row.kind, "archived": bool(row.archived), "count": row.count} for row in counts.results]
    response = {kind: [{**row["record"], "id": row["id"], "archived_at": row["archived_at"]} for row in rows if row["kind"] == kind] for kind in ("feedback", "accuracy_reports", "votes")}
    return {**response, "records": rows, "summary": summary, "retention": "no_automatic_expiry",
            "pagination": {"next_before": rows[-1]["id"] if more and rows else None, "limit": limit}}


class Archive(BaseModel):
    archived: bool


@router.post("/admin/feedback/{record_id}/archive", dependencies=[Depends(admin)])
async def archive(record_id: int, req: Archive, request: Request):
    result = await db(request).prepare("UPDATE feedback SET archived_at=?1 WHERE id=?2").bind(now() if req.archived else None, record_id).run()
    if not result.meta.changes:
        raise HTTPException(404, "Feedback record not found")
    return {"status": "ok", "id": record_id, "archived": req.archived}


@router.get("/admin/feedback/export", dependencies=[Depends(admin)])
async def export(request: Request):
    async def lines():
        after = 0
        # Bounded pages and a fixed high-water mark give a finite, ordered export.
        high = await db(request).prepare("SELECT COALESCE(MAX(id),0) AS max_id FROM feedback").first("max_id")
        while after < high:
            result = await db(request).prepare("SELECT * FROM feedback WHERE id>?1 AND id<=?2 ORDER BY id LIMIT 25").bind(after, high).all()
            rows = [unpack(row) for row in result.results]
            if not rows:
                break
            for row in rows:
                yield json.dumps(row, ensure_ascii=False, allow_nan=False) + "\n"
            after = rows[-1]["id"]
    return StreamingResponse(lines(), media_type="application/x-ndjson", headers={"Content-Disposition": 'attachment; filename="lonklar-feedback.jsonl"'})


class ImportItem(BaseModel):
    kind: Kind
    record: dict
    archived_at: str | None = None

    @field_validator("record")
    @classmethod
    def timestamp_required(cls, record):
        value = record.get("timestamp")
        if not isinstance(value, str):
            raise ValueError("Timestamp is required")
        timestamp = datetime.fromisoformat(value)
        if timestamp.tzinfo is None:
            raise ValueError("Timestamp must include a timezone")
        return record

    @field_validator("archived_at")
    @classmethod
    def archive_date(cls, value):
        if value and datetime.fromisoformat(value).tzinfo is None:
            raise ValueError("Archive timestamp must include a timezone")
        return value


class ImportBatch(BaseModel):
    records: list[ImportItem] = Field(min_length=1, max_length=50)


@router.post("/admin/feedback/import", dependencies=[Depends(admin)])
async def import_records(batch: ImportBatch, request: Request):
    statements = []
    # Validate every row before executing a transactional D1 batch.
    try:
        for item in batch.records:
            payload, _ = normalize(item.kind, item.record)
            timestamp = item.record["timestamp"]
            source_key = hashlib.sha256(f"{item.kind}:{timestamp}:{payload}".encode()).hexdigest()
            statements.append(statement(db(request), item.kind, item.record, timestamp, source_key, item.archived_at))
    except (ValueError, TypeError) as error:
        raise HTTPException(422, "Invalid import record") from error
    try:
        results = await db(request).batch(statements)
    except Exception as error:
        storage_error(error)
    inserted = sum(result.meta.changes for result in results)
    return {"status": "ok", "inserted": inserted, "duplicates": len(statements) - inserted}
