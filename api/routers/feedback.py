"""
User feedback, accuracy reports, and vote endpoints.

Security features:
- Rate limiting per IP (slowapi)
- Daily log rotation with date-stamped filenames
- Path-injection safe (hardcoded filenames, no user input in paths)
- Field-length caps enforced via Pydantic models
- No PII collection (email field removed)
- Admin endpoint protected by ADMIN_TOKEN env var
"""

import os
from fastapi import APIRouter, Request, Header, HTTPException
import json
from datetime import datetime, timezone, date
from pathlib import Path

from slowapi import Limiter
from slowapi.util import get_remote_address

from ..models import FeedbackRequest, AccuracyReportRequest, VoteRequest

router = APIRouter(prefix="/api")

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "changeme")

# ── Rate limiter (shared with main app) ──────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── Feedback directory (hardcoded — never user-supplied) ─────────────
FEEDBACK_DIR = Path(__file__).resolve().parent.parent.parent / "feedback_data"

# Only these filenames are allowed — prevents path injection
_ALLOWED_FILES = {"feedback", "accuracy_reports", "votes"}


def _append_jsonl(basename: str, record: dict):
    """
    Append a JSON record to a date-stamped JSONL file.

    Files are named  <basename>_YYYY-MM-DD.jsonl  for built-in rotation.
    The basename is validated against a hardcoded allowlist.
    """
    if basename not in _ALLOWED_FILES:
        raise ValueError(f"Invalid log file: {basename}")

    FEEDBACK_DIR.mkdir(exist_ok=True)
    today = date.today().isoformat()
    filepath = FEEDBACK_DIR / f"{basename}_{today}.jsonl"

    record["timestamp"] = datetime.now(timezone.utc).isoformat()

    with open(filepath, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


@router.post("/feedback")
@limiter.limit("10/minute")
async def submit_feedback(req: FeedbackRequest, request: Request):
    _append_jsonl("feedback", req.model_dump())
    return {"status": "ok"}


@router.post("/accuracy-report")
@limiter.limit("10/minute")
async def submit_accuracy_report(req: AccuracyReportRequest, request: Request):
    data = req.model_dump()
    data["difference"] = round(req.actual_net_monthly - req.estimated_net_monthly, 2)
    data["difference_pct"] = (
        round((req.actual_net_monthly - req.estimated_net_monthly) / req.estimated_net_monthly * 100, 2)
        if req.estimated_net_monthly else 0
    )
    _append_jsonl("accuracy_reports", data)
    return {"status": "ok"}


@router.post("/vote")
@limiter.limit("30/minute")
async def submit_vote(req: VoteRequest, request: Request):
    _append_jsonl("votes", req.model_dump())
    return {"status": "ok"}


@router.get("/vote/stats")
@limiter.limit("60/minute")
async def vote_stats(request: Request):
    """Return thumbs up/down counters from all votes_*.jsonl files."""
    up = 0
    down = 0
    if FEEDBACK_DIR.exists():
        for filepath in sorted(FEEDBACK_DIR.glob("votes_*.jsonl")):
            with open(filepath, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        rec = json.loads(line)
                        if rec.get("vote") == "up":
                            up += 1
                        elif rec.get("vote") == "down":
                            down += 1
                    except json.JSONDecodeError:
                        pass
    return {"up": up, "down": down, "total": up + down}


# ── Admin: read all feedback (protected by token) ────────────────────

def _verify_admin(token: str | None):
    if not token or token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _read_all_jsonl(pattern: str) -> list[dict]:
    """Read all records from matching JSONL files, newest first."""
    records: list[dict] = []
    if not FEEDBACK_DIR.exists():
        return records
    for filepath in sorted(FEEDBACK_DIR.glob(pattern)):
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    records.reverse()  # newest first
    return records


@router.get("/admin/feedback")
async def admin_feedback(request: Request, x_admin_token: str | None = Header(None)):
    _verify_admin(x_admin_token)
    return {
        "feedback": _read_all_jsonl("feedback*.jsonl"),
        "accuracy_reports": _read_all_jsonl("accuracy_reports*.jsonl"),
        "votes": _read_all_jsonl("votes*.jsonl"),
    }
