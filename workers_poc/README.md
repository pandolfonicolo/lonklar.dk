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
- No production feedback import, secrets, public admin export, or automatic deploy.

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

The proof bounds chart samples/hours to 500 and POST bodies to 64 KiB. It is not
a production migration: evaluate cold starts, CPU limits and larger chart/scenario
loads, design feedback retention/import and protected admin access, and compare
against representative production traffic before considering a DNS cutover.

Official references: [Python Workers](https://developers.cloudflare.com/workers/languages/python/),
[FastAPI ASGI](https://developers.cloudflare.com/workers/languages/python/packages/fastapi/),
[D1 Python bindings](https://developers.cloudflare.com/d1/examples/query-d1-from-python-workers/).
