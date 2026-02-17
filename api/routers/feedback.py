"""
User feedback, accuracy reports, and vote endpoints.
"""

from fastapi import APIRouter
import json
from datetime import datetime, timezone
from pathlib import Path

from ..models import FeedbackRequest, AccuracyReportRequest, VoteRequest

router = APIRouter(prefix="/api")

FEEDBACK_DIR = Path(__file__).resolve().parent.parent.parent / "feedback_data"


def _append_jsonl(filename: str, record: dict):
    """Append a JSON record to a JSONL file (one JSON object per line)."""
    FEEDBACK_DIR.mkdir(exist_ok=True)
    filepath = FEEDBACK_DIR / filename
    record["timestamp"] = datetime.now(timezone.utc).isoformat()
    with open(filepath, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


@router.post("/feedback")
async def submit_feedback(req: FeedbackRequest):
    _append_jsonl("feedback.jsonl", req.model_dump())
    return {"status": "ok"}


@router.post("/accuracy-report")
async def submit_accuracy_report(req: AccuracyReportRequest):
    data = req.model_dump()
    data["difference"] = round(req.actual_net_monthly - req.estimated_net_monthly, 2)
    data["difference_pct"] = (
        round((req.actual_net_monthly - req.estimated_net_monthly) / req.estimated_net_monthly * 100, 2)
        if req.estimated_net_monthly else 0
    )
    _append_jsonl("accuracy_reports.jsonl", data)
    return {"status": "ok"}


@router.post("/vote")
async def submit_vote(req: VoteRequest):
    _append_jsonl("votes.jsonl", req.model_dump())
    return {"status": "ok"}


@router.get("/vote/stats")
async def vote_stats():
    """Return thumbs up/down counters from votes.jsonl."""
    filepath = FEEDBACK_DIR / "votes.jsonl"
    up = 0
    down = 0
    if filepath.exists():
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
