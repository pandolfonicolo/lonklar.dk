# Python Workers + D1 proof

Isolated experiment, **not the production deployment**. `lonklar.dk` still points
to Oracle and the existing deployment workflow is unchanged.

- Worker: `lonklar-python-poc` on `workers.dev`; no custom domain or routes.
- Dedicated D1: `lonklar-python-poc`, `891c9b79-dc3e-4b65-be50-b2233ecdb80b` (WEUR).
- Existing React frontend + unchanged Python tax models, engine, data, scenarios
  and chart routes. Build stages an explicit allowlist of source modules.
- FastAPI ASGI entrypoint; async adapters avoid unsupported Wasm threadpools.
- Feedback, votes and accuracy reports use parameterized D1 queries. A unique
  report ID makes retries atomic; conflicting payloads return 409.
- D1 minute counters replace process-local slowapi on write/stat routes.
- Native Workers fetch with a D1 cache for public exchange rates; labeled fallback.
- No analytics, noindex headers/robots, visible synthetic-data notice.
- Separate secret-protected feedback administration, reversible archives and bounded JSONL export. No production data import or automatic production deploy.

## Reproduce

Requires Node 22.22.0 and uv 0.13.5. Python dependencies/tooling are locked in
`uv.lock`; pywrangler manages the compatible Wasm package set in `pylock.toml`.

```sh
npm ci --prefix frontend
cd workers_poc
npm ci
npm run verify
# Dedicated remote D1 only; already applied for the hosted proof:
uv run --locked pywrangler d1 migrations apply FEEDBACK_DB --remote
# Clean committed checkout required; verifies again before publication:
npm run deploy
```

`verify` runs the 32 existing regression tests, checks the resource configuration,
applies migrations locally, starts a real local Python Worker and tests 17
CPython/Workers calculation parity cases plus D1 concurrency, validation, SPA,
assets and exchange rates. CI only verifies; publication is explicit.

## Feedback operations

Feedback has **no automatic expiry**, as requested on 22 October 2026. Archive/restore
is reversible and never changes vote totals. No delete API or retention cron exists.

Open `/admin/feedback` on the proof hostname. `FEEDBACK_ADMIN_TOKEN` is a separate
Cloudflare secret (at least 32 characters), sent only in `X-Admin-Token`. The UI keeps
it in memory, supports logout, paginated/filterable records, archive/restore and a
streaming export including archived records. Missing configuration fails closed;
admin responses are never cached. Rotate with `uv run pywrangler secret put FEEDBACK_ADMIN_TOKEN`.

`python ../scripts/import-workers-feedback.py /secure/backup/feedback_2026-10-22.jsonl`
validates a legacy file without writing anything. It also accepts the unified admin
export. Use `--apply --token-file /secure/admin-token` only to import into this
isolated proof. The source is completely validated before writes, each bounded D1
batch is atomic, exact records and report IDs are deduplicated, and conflicting
report data returns 409 with batch rollback. Earlier completed batches are safe to
retry. Never put a backup, report payload or token in Git.

For a complete database backup use `uv run pywrangler d1 export FEEDBACK_DB --remote
--output /secure/backup/lonklar-poc.sql`. Restore and validate it locally before a
real migration. JSONL is a portable feedback export, not a replacement for the full
D1 snapshot. No Oracle data is copied as part of this evaluation.

## Performance evaluation

`uv run --locked python ../scripts/benchmark-workers-poc.py --per-case 20 --burst 80
--report /secure/results/lonklar-benchmark.json` exercises nine read-only synthetic
workloads, including 500-point curves and 50-year comparisons, plus concurrency 8.
It checks results against CPython (tolerance 1e-7 only for unrounded float outputs).
The report measures client HTTP/TTFB. CPU must come from the official Cloudflare
analytics dataset, whose CPU quantiles are **microseconds**, not HTTP timing.

`X-Lonklar-Instance` and `X-Lonklar-Invocation` identify observed first invocations
of an isolate. The diagnostic UUID is created on the first request, not during
snapshot creation, and contains no user state. Fresh-version tests distinguish
Wrangler's deploy-time initialization from first-request latency. Neither a query
parameter nor a pause is claimed to force a cold start.

The proof bounds chart samples/hours to 500 and POST bodies to 64 KiB. It is not
a DNS cutover. Check measured CPU against the selected plan, keep Oracle available
for rollback and take/validate the real feedback backup before migrating data.

Official references: [Python Workers](https://developers.cloudflare.com/workers/languages/python/),
[FastAPI ASGI](https://developers.cloudflare.com/workers/languages/python/packages/fastapi/),
[D1 Python bindings](https://developers.cloudflare.com/d1/examples/query-d1-from-python-workers/).
