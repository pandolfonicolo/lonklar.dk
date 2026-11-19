# Native TypeScript Worker — isolated draft prototype

**Not deployed; not a production migration.** This directory leaves the Python
app, Oracle deployment workflow, DNS, billing and live feedback untouched.
Reference: `f436bb22f2ea7e85365d35d0b1081ea17a7c9bd3` (2026 tax model).

## What is ported

- All eight compute APIs: full-time, part-time, student, salary projection,
  comparison, salary curve, hours curve and student hours curve.
- Existing inputs/defaults, municipality data, pension treatments, cash versus
  holiday pay, SU repayment semantics and threshold-aware chart sampling.
- `/api/meta`, exchange rates (one-hour per-isolate cache and stale/fallback),
  feedback/votes/accuracy reports/admin with a D1 storage adapter.
- Python-compatible decimal rounding of binary64 values. This is not a change
  to a decimal-money model or a claim of bitwise equivalence for every input.
- Optional `ASSETS` binding: serve the unchanged built React application, SPA
  fallback configured on that binding, immutable hashed assets/revalidated HTML.

## Local validation (no Cloudflare account or resources required)

From repository root, using Python 3.12 and Node 24:

```sh
python -m pip install -r requirements.txt
npm ci --ignore-scripts --prefix workers_ts
python -m unittest discover -s tests
python workers_ts/scripts/generate_contract.py
python workers_ts/tests/generate-corpus.py
cd workers_ts
npm run typecheck
npm test
npm run test:runtime
npm run benchmark:runtime
```

The Python oracle is source-hash pinned. Fixtures contain only generated
synthetic values. Generated fixtures are ignored; no personal salary/feedback
data belongs in Git. `tests/README.md` describes comparison tolerances and
coverage. Local timings are Node wall time, **not Workers CPU, network latency,
first-request latency or an SLA**. `test:runtime` bundles the Worker and runs
it in local workerd with ephemeral D1 and native rate limiting, synthetic data
only, outbound requests blocked and no Cloudflare account or provisioned resource.

## Deliberate safety/compatibility differences

- Non-finite numeric inputs are rejected rather than propagating infinities.
  Overflow in outputs fails instead of silently emitting JSON `null` money.
- Request bodies are limited to 128 KiB; curves to 10,000 samples/hours. The
  uncapped Python endpoint accepts some pathological requests. These limits
  protect a shared Worker; they must be reviewed against real usage.
- HTTP 422 preserves invalid field locations, not exact Pydantic error prose.
- Missing admin secret fails closed (no legacy `changeme` fallback).
- Missing D1 binding returns 503. No ephemeral in-memory feedback fallback.
- Mutation rate limits remain durable/global per hashed client/route with
  fixed 60-second windows; storage failure never bypasses admission control.
- Public vote-stat reads use the native `VOTE_STATS_LIMITER` binding, not D1
  counters: **zero database writes per read**, including rejected reads. The
  binding is approximate and per Cloudflare location, not a global strict cap.
  Missing/unavailable/invalid binding fails closed with 503; denied reads return
  429 before querying D1. No isolate-memory fallback or raw-IP storage.
  The configured threshold is 60 requests/minute/client/route. Hashing reduces
  raw-address exposure but is not a claim of anonymization. The preview
  namespace ID must be checked for account uniqueness before deployment.
- Exchange cache is per isolate, not a global promise of one upstream fetch/hour.
- Feedback timestamp representation uses ISO UTC; retained timestamps must be
  preserved by a future migration, not replaced with import times.
- FastAPI's developer `/docs`, `/redoc` and `/openapi.json` are not implemented.
  Public app APIs above are the compatibility target of this prototype.

## Gates before any hosted preview or migration

1. Explicitly select a **separate test** Worker and test D1 database, no production
   bindings/secrets/data. `wrangler.jsonc` intentionally contains no routes,
   resources, deploy script or enabled public preview URL.
2. Apply the test schema only to that synthetic database and test actual D1
   concurrency/failure behavior. Local tests cover SQLite-backed protocol
   doubles and an actual local workerd/Miniflare D1/native-limiter simulation.
   Neither proves hosted Cloudflare permissions, distributed behavior or latency.
3. Measure real Worker CPU and cold/warm response times, including dense curves
   and 50-year comparisons; test idle first requests and user-visible latency.
4. Verify the native read-rate binding and namespace in the hosted preview.
   Mutation endpoints still consume D1 writes for their durable quotas and
   actual records; this change removes read-triggered write amplification,
   not all storage usage. No service subscription or paid upgrade is enabled
   by this code. The native binding's approximate/local semantics are documented
   in [Cloudflare's API reference](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
5. Build/bind React assets and browser-test all modes, charts, currencies,
   languages, feedback/admin, SEO/deep links and caching. No browser QA or
   hosted assets verification is claimed by local Node tests.
6. Back up and migrate real JSONL feedback with verified counts/IDs/timestamps,
   rollback and retention plan. This draft contains no importer or live writes.
7. Inventory **Umami + PostgreSQL**: `docker-compose.umami.yml` and the frontend
   analytics script still depend on `analytics.lonklar.dk`. Moving the salary
   engine does not migrate analytics/history or authorize deleting Oracle.
8. Explicit approval before billing changes, production switch, DNS, merge or
   Oracle shutdown. Keep current production running until separately approved.

2026 rules and existing model limitations remain unchanged; a code port is not
an official tax-rule re-verification. Preserve `RULES_VERIFIED_ON`.

Measured representative local runtime results and methodology: [BENCHMARK.md](BENCHMARK.md). These are not hosting-plan capacity or latency guarantees.
