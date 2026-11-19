import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { FeedbackStore, ReportConflict, canonicalJson } from '../src/storage.ts';
import { handleFeedback } from '../src/feedback.ts';
import { createExchangeHandler } from '../src/exchange.ts';

// SQLite-backed D1 protocol double, including rollback on failed batch. Real
// Cloudflare binding execution remains a separate preview verification gate.
function database() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../migrations/0001_feedback.sql', import.meta.url), 'utf8'));
  const prepare = (sql: string) => {
    let args: any[] = [];
    const statement = {
      bind(...values: any[]) { args = values; return statement; },
      async run() { return db.prepare(sql).run(...args); },
      async all() { return { results: db.prepare(sql).all(...args) }; },
      async first() { return db.prepare(sql).get(...args) ?? null; },
    };
    return statement;
  };
  return { prepare, async batch(statements: any[]) {
    db.exec('BEGIN');
    try { const results = []; for (const statement of statements) results.push(await statement.all()); db.exec('COMMIT'); return results; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  }};
}

test('durable idempotency ignores nested object ordering; conflicts reject; null IDs remain distinct', async () => {
  const store = new FeedbackStore(database());
  const body = { report_id: 'synthetic-id', inputs: { a: 1, b: 2 }, value: 20 };
  assert.equal(await store.append('accuracy_reports', body), true);
  assert.equal(await store.append('accuracy_reports', { value: 20, inputs: { b: 2, a: 1 }, report_id: 'synthetic-id' }), false);
  await assert.rejects(store.append('accuracy_reports', { ...body, value: 21 }), ReportConflict);
  await store.append('accuracy_reports', { report_id: null });
  await store.append('accuracy_reports', { report_id: null });
  assert.equal((await store.records('accuracy_reports')).length, 3);
  assert.equal(canonicalJson({ b: null, a: [1, 2] }), '{"a":[1,2],"b":null}');
});

test('stored ordering, vote totals and fixed-window rate boundaries', async () => {
  const store = new FeedbackStore(database());
  await store.append('votes', { vote: 'up' });
  await store.append('votes', { vote: 'down' });
  await store.append('votes', { vote: 'up' });
  assert.deepEqual(await store.stats(), { up: 2, down: 1, total: 3 });
  assert.equal((await store.records('votes'))[0].vote, 'up');
  assert.equal((await store.allow('key', 2, 100)).allowed, true);
  assert.equal((await store.allow('key', 2, 101)).allowed, true);
  assert.deepEqual(await store.allow('key', 2, 159), { allowed: false, retryAfter: 1 });
  assert.equal((await store.allow('key', 2, 160)).allowed, true);
});

test('API fails closed for missing binding/admin token and failed storage', async () => {
  const req = new Request('https://preview.invalid/api/feedback', { method: 'POST' });
  assert.equal((await handleFeedback(req, '/api/feedback', {}, {}))!.status, 503);
  const admin = new Request('https://preview.invalid/api/admin/feedback', { headers: { 'x-admin-token': 'changeme' } });
  assert.equal((await handleFeedback(admin, '/api/admin/feedback', null, {}))!.status, 401);
  const broken: any = { prepare() { throw new Error('database unavailable'); } };
  assert.equal((await handleFeedback(req, '/api/feedback', {}, { FEEDBACK_DB: broken }))!.status, 500);
});

test('API preserves duplicate/conflict and accuracy derived fields', async () => {
  const env = { FEEDBACK_DB: database(), ADMIN_TOKEN: 'synthetic-test-only' };
  const req = new Request('https://preview.invalid/api/accuracy-report', { method: 'POST' });
  const body = { report_id: 'synthetic', actual_net_monthly: 19000, estimated_net_monthly: 20000 };
  assert.deepEqual(await (await handleFeedback(req, '/api/accuracy-report', body, env))!.json(), { status: 'ok', report_id: 'synthetic', duplicate: false });
  assert.equal((await (await handleFeedback(req, '/api/accuracy-report', body, env))!.json()).duplicate, true);
  assert.equal((await handleFeedback(req, '/api/accuracy-report', { ...body, actual_net_monthly: 18000 }, env))!.status, 409);
  const stored = await new FeedbackStore(env.FEEDBACK_DB).records('accuracy_reports');
  assert.equal(stored[0].difference, -1000);
  assert.equal(stored[0].difference_pct, -5);
});

test('exchange cache, stale fallback and initial fallback use no network', async () => {
  let calls = 0, seconds = 1000, fail = false;
  const fetcher: typeof fetch = async () => { calls++; if (fail) throw Error('offline'); return Response.json({ rates: { EUR: .1339, BAD: 0 }, date: '2026-11-01' }); };
  const handler = createExchangeHandler(fetcher, () => seconds);
  const req = new Request('https://preview.invalid/api/exchange-rates');
  const first = await (await handler(req)).json();
  assert.equal(first.source, 'frankfurter.app');
  assert.equal(first.rates.EUR, 7.46826);
  await handler(req); assert.equal(calls, 1);
  seconds += 3601; fail = true;
  const stale = await (await handler(req)).json();
  assert.deepEqual(stale, first);
  const fallbackHandler = createExchangeHandler(async () => { throw Error('offline'); }, () => seconds);
  const fallback = await (await fallbackHandler(req)).json();
  assert.equal(fallback.source, 'fallback'); assert.equal(fallback.rates.EUR, 7.47);
});

test('concurrent duplicate reports have one winner; API enforces per-route quota and admin read', async () => {
  const env = { FEEDBACK_DB: database(), ADMIN_TOKEN: 'synthetic-test-only' };
  const store = new FeedbackStore(env.FEEDBACK_DB);
  const inserts = await Promise.all(Array.from({ length: 12 }, () => store.append('accuracy_reports', { report_id: 'parallel-id', inputs: {} })));
  assert.equal(inserts.filter(Boolean).length, 1);
  assert.equal((await store.records('accuracy_reports')).length, 1);
  const request = new Request('https://preview.invalid/api/feedback', { method: 'POST', headers: { 'CF-Connecting-IP': '192.0.2.1' } });
  for (let i = 0; i < 10; i++) assert.equal((await handleFeedback(request, '/api/feedback', { type: 'general', message: `synthetic ${i}` }, env))!.status, 200);
  const rejected = (await handleFeedback(request, '/api/feedback', { type: 'general', message: 'over quota' }, env))!;
  assert.equal(rejected.status, 429);
  assert.ok(Number(rejected.headers.get('Retry-After')) > 0);
  const admin = new Request('https://preview.invalid/api/admin/feedback', { headers: { 'x-admin-token': env.ADMIN_TOKEN } });
  const result = await (await handleFeedback(admin, '/api/admin/feedback', null, env))!.json();
  assert.equal(result.feedback.length, 10);
  assert.equal(result.feedback[0].message, 'synthetic 9');
  assert.equal(result.accuracy_reports.length, 1);
  assert.deepEqual(result.votes, []);
});

// Track issued statements, not merely changed row counts: DELETE/UPSERT on an
// empty table would still constitute write amplification and must be caught.
function countedDatabase() {
  const backing = database();
  const calls = { reads: 0, writes: 0, batches: 0 };
  return { calls, db: {
    prepare(sql: string) {
      if (/^\s*SELECT\b/i.test(sql)) calls.reads++; else calls.writes++;
      return backing.prepare(sql);
    },
    async batch(statements: any[]) { calls.batches++; return backing.batch(statements); },
  }};
}

test('many admitted statistics reads issue zero D1 writes; native limiter receives only a hash', async () => {
  const { db, calls } = countedDatabase();
  const keys: string[] = [];
  const env = { FEEDBACK_DB: db, VOTE_STATS_LIMITER: { async limit({ key }: { key: string }) { keys.push(key); return { success: true }; } } };
  const req = new Request('https://preview.invalid/api/vote/stats', { headers: { 'CF-Connecting-IP': '192.0.2.33', 'X-Forwarded-For': '203.0.113.2' } });
  for (let i = 0; i < 200; i++) {
    const response = (await handleFeedback(req, '/api/vote/stats', null, env))!;
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { up: 0, down: 0, total: 0 });
  }
  assert.deepEqual(calls, { reads: 200, writes: 0, batches: 0 });
  assert.equal(keys.length, 200);
  assert.equal(new Set(keys).size, 1);
  assert.match(keys[0], /^[a-f0-9]{64}$/);
  assert.ok(!keys[0].includes('192.0.2.33'));
  const expected = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('/api/vote/stats\0' + '192.0.2.33'));
  assert.equal(keys[0], Buffer.from(expected).toString('hex'));
});

test('missing, denied, throwing and invalid statistics limiter fail closed before touching D1', async () => {
  const req = new Request('https://preview.invalid/api/vote/stats');
  const scenarios: [any, number][] = [
    [undefined, 503],
    [{ async limit() { return { success: false }; } }, 429],
    [{ async limit() { throw Error('binding failed'); } }, 503],
    [{ async limit() { return null; } }, 503],
    [{ async limit() { return { success: 'true' }; } }, 503],
    [{ async limit() { return {}; } }, 503],
    [{}, 503],
  ];
  for (const [limiter, status] of scenarios) {
    const { db, calls } = countedDatabase();
    const response = (await handleFeedback(req, '/api/vote/stats', null, { FEEDBACK_DB: db, VOTE_STATS_LIMITER: limiter }))!;
    assert.equal(response.status, status);
    if (status === 429) assert.equal(response.headers.get('Retry-After'), '60');
    assert.deepEqual(calls, { reads: 0, writes: 0, batches: 0 });
  }
});

test('native statistics limiter cannot bypass strict mutation quota or storage failures', async () => {
  let nativeCalls = 0;
  const limiter = { async limit() { nativeCalls++; return { success: true }; } };
  const { db, calls } = countedDatabase();
  const env = { FEEDBACK_DB: db, VOTE_STATS_LIMITER: limiter };
  const req = new Request('https://preview.invalid/api/vote', { method: 'POST' });
  for (let i = 0; i < 30; i++) assert.equal((await handleFeedback(req, '/api/vote', { vote: 'up' }, env))!.status, 200);
  assert.equal((await handleFeedback(req, '/api/vote', { vote: 'up' }, env))!.status, 429);
  assert.equal(nativeCalls, 0);
  assert.equal(calls.batches, 31);
  assert.ok(calls.writes >= 31);
  const broken: any = { prepare() { throw Error('storage offline'); } };
  assert.equal((await handleFeedback(req, '/api/vote', { vote: 'up' }, { FEEDBACK_DB: broken, VOTE_STATS_LIMITER: limiter }))!.status, 500);
  assert.equal(nativeCalls, 0);
});
