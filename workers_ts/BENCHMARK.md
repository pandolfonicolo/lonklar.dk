# Local native Worker validation and timing

Measured **2026-11-01**, using Node **v24.22.1**, Miniflare
**5.20261023.3-beta**, its bundled local **workerd**, and esbuild **0.28.2**.
The Worker compatibility date was **2026-10-01**. This is a local cloud-workspace
measurement, not a Cloudflare-hosted preview or a comparison against Oracle.

## Method

`npm run benchmark:runtime` bundles the current TypeScript Worker, starts a
fresh local workerd instance for each workload, waits for its ready signal,
then times one first request and **100 sequential warm requests**. Each timing
includes Miniflare dispatch, request/response handling and JSON parsing. There
are **303 measured requests** total; no concurrency or load testing is implied.
The table uses the sorted warm samples at indexes 50 and 95 for p50 and p95.
Local process startup, measured from constructing Miniflare to its ready signal,
is recorded separately and excluded from request timing.

| Workload | Warm p50 | Warm p95 | Warm max | First request after ready | Separate local process startup |
| --- | ---: | ---: | ---: | ---: | ---: |
| Full-time salary, 600,000 DKK/year | 1.60 ms | 3.20 ms | 6.58 ms | 31.44 ms | 120.36 ms |
| Heavy gross-income curve, max 3,600,000 DKK, 100 DKK monthly steps, **3,004 output points** | 28.79 ms | 35.34 ms | 39.55 ms | 48.68 ms | 83.97 ms |
| 50-year projection, starting salary 600,000 DKK/year | 2.17 ms | 3.51 ms | 4.38 ms | 8.67 ms | 83.11 ms |

Default API settings apply to unspecified inputs. Exact request bodies are
in `scripts/runtime-benchmark.mjs`.

**Do not interpret these results as Workers CPU time, hosted cold-start time,
internet response time, a Free/Paid plan capacity prediction, or a latency SLA.**
There is only one first-request sample per workload. Cloudflare ingress, network
travel, geographic routing, production bindings, browsers, contention, traffic
mix and tail latency require separate hosted testing before a production move.
No Python/Oracle speedup ratio has been measured.

## Actual runtime compatibility and parity

`npm run test:runtime` runs the bundled code inside local workerd, not merely
Node's JavaScript runtime. The measured run completed **551 requests**:

- All eight compute endpoints exercised.
- All **462** generated Python-reference API cases passed, including status
  codes and invalid-field locations. Framework-specific error prose is not
  claimed identical.
- **24,756** numeric comparisons, **3,480** exact rounded chart values;
  maximum observed absolute numeric difference **0**. The test retains explicit
  floating-point tolerances for unrounded values; this is not a universal
  bitwise-equivalence guarantee.
- Local native D1 schema migration, votes, feedback, accuracy-report retry
  idempotency/conflicts and admin authorization succeeded.
- Native rate limiter admitted 60 stats reads and returned 429 on the next.
  D1 rate-counter records were identical before and after these stats reads.
- Missing native stats limiter failed closed with 503.
- Durable D1-backed mutation quota enforced.
- **Zero outbound requests.**

## Safety and reproduction

No Cloudflare account, credentials, remote bindings, paid resources, DNS change,
production data or deployment is used by either script. Outbound fetch is
replaced with a throwing handler. Runtime smoke data is synthetic and its local
D1 directory is temporary and removed after disposal. The benchmark does not
bind a database. Local processes bind to loopback.

From `workers_ts`, with Python backend requirements installed:

```sh
npm ci --ignore-scripts
python tests/generate-corpus.py
npm run test:runtime
npm run benchmark:runtime
```

The smoke script verifies the generated corpus's pinned Python-source hashes
before replaying it and explains the prerequisite if the corpus is absent.
Miniflare 5's supported `convertV4MiniflareOptions` adapter converts the local
configuration. These commands do not invoke Wrangler deployment.
