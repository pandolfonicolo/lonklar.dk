"""Compare real Workers HTTP responses to unchanged CPython calculations.

Only target localhost or this isolated proof. All write fixtures are synthetic.
"""
import argparse
import concurrent.futures
import json
import re
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root))
from api.routers import compute, meta
from api import models

parser = argparse.ArgumentParser()
parser.add_argument("--base", default="http://127.0.0.1:8791")
parser.add_argument("--report", type=Path)
args = parser.parse_args()
assert args.base in ("http://127.0.0.1:8791", "https://lonklar-python-poc.nicolo-pandolfo.workers.dev"), "Proof targets only"
results = []


def request(path, payload=None, headers=None):
    from poc_http import request as http
    response = http(args.base, path, payload, headers)
    try:
        body = json.loads(response["body"])
    except ValueError:
        body = response["body"].decode()
    results.append({"path": path, "status": response["status"], "ms": round(response["http_ms"], 1)})
    return response["status"], body, response["headers"]


for gross in (0, 240_000, 600_000, 1_200_000, 3_000_000):
    for pension_type in ("standard", "section53a"):
        payload = {"gross_annual": gross, "pension_type": pension_type, "is_church": gross % 2 == 0}
        expected = compute.compute_fulltime(models.FullTimeRequest(**payload))
        status, actual, _ = request("/api/compute/fulltime", payload)
        assert status == 200 and actual == expected, (payload, status, actual)

cases = [
    ("parttime", models.PartTimeRequest, compute.compute_parttime, {"hourly_rate": 180, "hours_month": 80}),
    ("student", models.StudentRequest, compute.compute_student, {"work_gross_monthly": 7500}),
    ("curve", models.CurveRequest, compute.compute_curve, {"points": 50}),
    ("hours-curve", models.HoursCurveRequest, compute.compute_hours_curve, {"hourly_rate": 180, "atp_auto": True}),
    ("student-hours-curve", models.StudentHoursCurveRequest, compute.compute_student_hours_curve, {"hourly_rate": 180, "atp_auto": True}),
    ("projection", models.ProjectionRequest, compute.compute_projection, {"scenario": {"gross_annual": 600000}, "settings": {}}),
    ("comparison", models.ComparisonRequest, compute.compute_comparison, {"scenario_a": {"gross_annual": 500000}, "scenario_b": {"gross_annual": 600000}}),
]
for path, model, function, payload in cases:
    expected = function(model(**payload))
    status, actual, _ = request("/api/compute/" + path, payload)
    assert status == 200 and actual == expected, (path, status, actual)

status, actual, _ = request("/api/meta")
expected = meta.get_meta()
expected["data_freshness"]["site_updated_at"] = actual["data_freshness"]["site_updated_at"]
assert status == 200 and actual == expected
assert request("/api/poc/health")[1]["storage"] == "D1"
assert request("/api/compute/fulltime", {})[0] == 422
assert request("/api/compute/curve", {"step_monthly": 0.00001})[0] == 422
assert request("/api/feedback", {"type": "general", "message": "x"*70000})[0] == 413
assert request("/api/feedback", {"type": "general", "message": "synthetic"}, {"Origin": "https://example.com"})[0] == 403
assert request("/api/admin/feedback")[0] in (401, 503)
assert request("/api/does-not-exist")[0] == 404

baseline = request("/api/vote/stats")[1]
assert request("/api/vote", {"vote": "up", "service_type": "fulltime", "estimated_net": 12345})[0] == 200
after = request("/api/vote/stats")[1]
assert after["up"] == baseline["up"]+1 and after["total"] == baseline["total"]+1
assert request("/api/feedback", {"type": "general", "message": "SYNTHETIC Python Workers smoke fixture"})[0] == 200
report = {"report_id": str(uuid.uuid4()), "service_type": "fulltime", "estimated_net_monthly": 10000, "actual_net_monthly": 10001, "inputs": {"fixture": "synthetic"}}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    duplicates = list(pool.map(lambda _: request("/api/accuracy-report", report), range(4)))
assert all(row[0] == 200 for row in duplicates), duplicates
assert sum(not row[1]["duplicate"] for row in duplicates) == 1, duplicates
assert request("/api/accuracy-report", {**report, "actual_net_monthly": 12000})[0] == 409

status, html, headers = request("/")
assert status == 200 and "synthetic inputs only" in html and "analytics.lonklar.dk/script.js" not in html
assert "noindex" in headers["x-robots-tag"]
asset = re.search(r'src="(/assets/[^\"]+\.js)"', html).group(1)
assert request(asset)[0] == 200
assert request("/wizard/fulltime")[0] == 200
assert "Disallow: /" in request("/robots.txt")[1]
status, exchange, _ = request("/api/exchange-rates")
assert status == 200 and exchange["rates"]["EUR"] > 0 and exchange["source"] in ("fallback", "frankfurter.app")

summary = {"base": args.base, "passed": True, "requests": len(results), "compute_parity_cases": 17,
           "report_id": report["report_id"], "results": results}
if args.report:
    args.report.write_text(json.dumps(summary, indent=2)+"\n")
print(json.dumps({key: value for key, value in summary.items() if key != "results"}))
