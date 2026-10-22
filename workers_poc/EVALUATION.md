# Cloudflare evaluation — 22 October 2026

**Decision: keep LønKlar production on Oracle.** The isolated proof demonstrates
functional compatibility and D1 feedback portability, but fails the sustained and
concurrent workload on the account's current Workers Free plan. No DNS, production
data, account subscription or Oracle deployment was changed.

## Tested implementation

Runtime source: `ee4da9067499ab9149b22abb5247c1dfe6572638`, Python Workers ASGI,
Wrangler 4.152.0, workers-py 1.17.8, runtime SDK 1.9.5, compatibility date
2026-10-22. Dedicated `lonklar-python-poc` Worker and D1; synthetic records only.
The tax engine, models and calculation routes are copied unchanged from production.

The 32 existing regressions, 39 real local Worker HTTP checks (including 17 exact
CPython calculation comparisons), 18 protected feedback integration checks and
Wrangler dry run passed. GitHub checks for the runtime commit passed. The hosted
feedback suite also passed all 18 checks, including a conflicting import rolling
back the entire D1 batch.

## First requests and CPU

Five newly published versions of the same implementation each returned a correct
first calculation, with distinct instance IDs and invocation counter 1. Client
HTTP times were 1904, 1268, 2420, 1750 and 1243 ms; their immediately subsequent
warm requests took 124, 95, 193, 91 and 137 ms. These are five observations from
one client/AMS, including network/proxy overhead, not a production percentile.
Wrangler's separate deployment initialization ranged from 2763 to 9269 ms.
The Python startup profiler failed in tooling with a duplicate-module error; no
usable CPU flamegraph was produced.

Cloudflare analytics reports CPU quantiles in microseconds. Across the five
two-request version windows, warm/low quantiles were 14.8–23.2 ms and first/high
quantiles 347–457 ms. Quantiles from two requests are not population p95 estimates.

The main 260-request benchmark ran at 18:47:30–18:48:01 UTC on version
`0a80d6fd-dbfc-4304-812f-6d7c155aae0a`. Nine workloads each received 20 sequential
requests, followed by 80 requests with concurrency 8. All 214 successful responses
matched CPython (1e-7 absolute tolerance only for unrounded floating outputs).

| Workload | Correct / total | HTTP failures |
| --- | ---: | --- |
| First eight sequential workloads | 160 / 160 | None |
| 50-year comparison, sequential | 9 / 20 | 1 × 503, 10 × 500 |
| Mixed burst, concurrency 8 | 45 / 80 | 35 × 500 |
| Total | 214 / 260 | 46 (17.7%) |

Successful-request CPU in Cloudflare analytics: p50 18.259 ms, p95 78.058 ms,
p99 367.727 ms. Client HTTP latency across all outcomes: median 98 ms, p95 413 ms;
the latter is not a CPU measurement or a production latency objective. Analytics
also includes a few administration requests in the same window and uses adaptive
sampling; its success count (223) is not the benchmark's exact HTTP count (214).
The error groups were one `exceededResources` and 45 `scriptThrewException`.
The resource status alone does not distinguish CPU from memory. CPU already
exceeds the published Free 10 ms budget on ordinary successful requests.

A separate bounded reproduction with 40 concurrent 50-year comparisons returned
14 successful responses and 26 HTTP 500 responses with Cloudflare code 1101.
Tail captured `PythonError`, `SystemError: Cannot enter a promising task from
inside another running promising task. This is a bug in Pyodide.` The stack enters
`initPyInstance` in the Python runtime before our ASGI handler. This is an observed
runtime failure, not evidence of a tax calculation mismatch. The temporal sequence
does not prove that the resource interruption caused the Pyodide error.

Republishing the same runtime as version `d9bc173b-a371-4019-bfa7-5edd1376c915`
restored the protected administration flow. This is recovery, not a load-test fix.
Do not add automatic retry/redeploy to conceal the failure.

Workers Paid has a $5 USD/month account minimum plus usage and a larger CPU budget.
It is a sensible next controlled experiment, **not a verified fix for the runtime
exception**. Do not enable it or migrate the domain based solely on this report.
After any runtime/platform fix or paid-plan decision, repeat both the first-request
and mixed-load tests with zero errors before considering a production cutover.

## Feedback durability

No automatic expiry, deletion endpoint or retention cron. Archive/restore is
reversible; archived records remain in exports and vote totals. The administrator
token is a separate Cloudflare secret and stays in browser memory until logout or
reload. It is not the Oracle credential and is never placed in a URL or Git.

Remote D1 export was restored with Wrangler into a new local state directory.
All six synthetic feedback rows, both migration rows, the rate-limit row and the
exchange-cache row matched byte-for-byte at the SQL-value level. User schema,
indexes and trigger matched; SQLite integrity check returned `ok`.
The protected JSONL export contained six records. CLI dry run validated six with
zero writes; reimport returned zero inserted and six duplicates. No real Oracle
feedback has been copied. A real migration still requires a source backup, a
quiesced final import, reconciled totals and a rollback procedure.

## References

- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Python snapshot lifecycle](https://developers.cloudflare.com/workers/languages/python/how-python-workers-work/)
- [Related workerd concurrency report](https://github.com/cloudflare/workerd/issues/6624)
  describes another initialization failure; it is not proof of the same root cause.
