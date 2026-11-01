# Synthetic parity harness

From the repository root (Python dependencies from `requirements.txt`, Node 24.12+):

```sh
python workers_ts/tests/generate-corpus.py
node workers_ts/tests/parity.test.ts
```

The generator mounts the **unchanged** Python compute/meta routers in a minimal
FastAPI app and makes only local in-process requests. It does not instantiate
feedback storage, exercise CORS/rate-limit middleware, fetch exchange rates or
call any real endpoint. No personal financial records are used. The generated
~1 MB corpus is intentionally ignored rather than committed as a large blob.
The committed oracle-source-sha256.json pins seven original oracle modules
(with CRLF normalized to LF); generation fails on any unreviewed source change.
The Node runner also rejects a corpus if oracle sources change after generation. The
reference provenance is main commit `f436bb22f2ea7e85365d35d0b1081ea17a7c9bd3`.
Updating the manifest requires explicitly reviewing the new Python reference
and its commit provenance; do not silently refresh it to make a test pass.

Coverage: 462 deterministic synthetic HTTP cases, all 98 municipalities with
both pension treatments, all eight compute routes and metadata; independent
published-rule salary expectations; 2026 tax thresholds and commuting bands;
ATP discontinuities; SU months, repayment bands and triple limit crossing;
zero/negative/default/null inputs, input coercions/extra fields, validation,
unknown municipalities and overflow rejection; 1/5/50-year projections and comparison variants;
80 fixed-seed salary scenarios. This is broad regression coverage, **not an
exhaustive proof over every possible input**.

Comparison policy:

- Exact HTTP status, object keys, array lengths/order, strings, booleans, nulls.
- Exact rounded chart money/rate outputs.
- Other floats: absolute tolerance `1e-7 + 2e-12 × abs(reference)`; no claim
  of bit-for-bit IEEE floating-point or arbitrary-size financial precision.
- For 422 errors: exact invalid-field locations and status. Framework-specific
  English wording, error type identifiers and context dictionaries are not
  claimed equivalent; these must not be presented as byte-for-byte API parity.
- Seven independent salary checks use a `1e-5` DKK tolerance and are not generated
  from the Python response.

Timing output measures local Node wall time for requests in this mixed suite.
It is **not** a hosted Cloudflare benchmark, CPU-time measurement, network
latency estimate, cold-start test or response-time guarantee. Tests of storage,
admin, CORS, exchange fallback and frontend flows must run separately.
