/** Differential contract check; run `python tests/generate-corpus.py` first. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import worker from '../src/index.ts';

const corpus = JSON.parse(readFileSync(new URL('./corpus.generated.json', import.meta.url), 'utf8'));
assert.equal(corpus.reference_commit, 'f436bb22f2ea7e85365d35d0b1081ea17a7c9bd3');
for (const [path, sha] of Object.entries(corpus.source_sha256)) {
  const actual = createHash('sha256').update(readFileSync(new URL('../../' + path, import.meta.url), 'utf8').replace(/\r\n/g, '\n')).digest('hex');
  assert.equal(actual, sha, `Python reference changed since corpus generation: ${path}`);
}
let numbers = 0;
let exactRounded = 0;
let maximumAbsoluteDifference = 0;
const failures: string[] = [];
const timings: Record<string, number[]> = {};
const roundedChartMoney = new Set(['net_monthly', 'ferie_net_monthly', 'effective_rate',
  'net_annual', 'su_gross_monthly', 'feriepenge_monthly', 'deductions_monthly']);

function compare(actual: any, expected: any, path: string, chart: boolean): void {
  if (typeof expected === 'number') {
    assert.equal(typeof actual, 'number', path);
    assert.ok(Number.isFinite(actual), `${path}: nonfinite value`);
    const delta = Math.abs(actual - expected);
    numbers++;
    maximumAbsoluteDifference = Math.max(maximumAbsoluteDifference, delta);
    const leaf = path.split('.').at(-1)!;
    if (chart && roundedChartMoney.has(leaf)) {
      exactRounded++;
      assert.equal(actual, expected, `${path}: rounded chart value must be identical`);
    } else {
      // No bitwise-float equivalence claim. Preserve sub-cent agreement for
      // ordinary salaries and relative precision for very large projections.
      const tolerance = 1e-7 + 2e-12 * Math.abs(expected);
      assert.ok(delta <= tolerance, `${path}: ${actual} != ${expected} (delta ${delta}, tolerance ${tolerance})`);
    }
  } else if (expected === null || typeof expected !== 'object') {
    assert.equal(actual, expected, path);
  } else if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual), path);
    assert.equal(actual.length, expected.length, `${path}: array length`);
    expected.forEach((v, i) => compare(actual[i], v, `${path}.${i}`, chart));
  } else {
    assert.ok(actual !== null && typeof actual === 'object' && !Array.isArray(actual), path);
    assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), `${path}: response keys`);
    Object.entries(expected).forEach(([key, value]) => compare(actual[key], value, `${path}.${key}`, chart));
  }
}
function errorLocations(body: any): string[] {
  assert.ok(Array.isArray(body.detail), '422 response requires detail array');
  return body.detail.map((e: any) => {
    assert.ok(Array.isArray(e.loc), '422 detail requires loc');
    return JSON.stringify(e.loc);
  }).sort();
}
async function request(c: any) {
  const req = new Request('https://preview.invalid' + c.path, {
    method: c.method,
    headers: c.method === 'POST' ? {'Content-Type': 'application/json'} : {},
    ...(c.method === 'POST' ? {body: JSON.stringify(c.body)} : {}),
  });
  const start = performance.now();
  const response = await worker.fetch(req, {} as any, {waitUntil() {}} as any);
  const elapsed = performance.now() - start;
  (timings[c.path] ??= []).push(elapsed);
  assert.equal(response.status, c.status, `${c.name}: HTTP status`);
  return c.status >= 500 ? await response.text() : await response.json();
}
for (const c of corpus.cases) {
  try {
    const actual = await request(c);
    if (c.status >= 500) {
      // Server-error body wording is framework-specific; require failure, not
      // silent success with nulls in place of nonfinite financial values.
      assert.ok(typeof actual === 'string');
    } else if (c.status === 422) {
      // Framework-specific wording/type codes are intentionally not claimed as
      // equivalent. Status and exact invalid-field locations are contractual.
      assert.deepEqual(errorLocations(actual), errorLocations(c.expected), c.name);
    } else {
      compare(actual, c.expected, c.name, c.path.includes('curve'));
    }
  } catch (error) {
    failures.push(`${c.name}: ${error instanceof Error ? error.message : error}`);
  }
}

// Independent published-rule fixtures copied from tests/test_verified_rules.py;
// these still catch a wrong Python oracle result, not just translation drift.
const salaryReferences = [[20000,14209.93875],[25000,17415.0108875],[30000,20567.8843416667],
  [60000,38732.0886666667],[80000,48630.2276666667],[100000,57847.8916666667],
  [300000,146889.4483333333]];
for (const [gross, net] of salaryReferences) {
  try {
    const actual = await request({name:`independent-${gross}`,method:'POST',path:'/api/compute/fulltime',status:200,
      body:{gross_annual:gross*12,pension_pct:0,employer_pension_pct:0,is_church:false,atp_monthly:0}}) as any;
    assert.ok(Math.abs(actual.net_monthly-net)<1e-5, `independent salary ${gross}: ${actual.net_monthly} != ${net}`);
  } catch(error) { failures.push(String(error)); }
}
const summary = {
  cases: corpus.cases.length, independentSalaryReferences: salaryReferences.length,
  comparedNumbers: numbers, exactRoundedChartValues: exactRounded,
  maximumAbsoluteDifference, failures: failures.length,
  localWallTimeMs: Object.fromEntries(Object.entries(timings).map(([route, values]) => {
    values.sort((a,b)=>a-b);
    return [route,{requests:values.length,p50:values[Math.floor(values.length*.5)],
      p95:values[Math.min(values.length-1,Math.floor(values.length*.95))],max:values.at(-1)}];
  })),
  timingDisclaimer:'Local Node wall time, not Workers CPU, network latency, hosted cold start or an SLA.',
};
console.log(JSON.stringify(summary,null,2));
if(failures.length) {
  console.error(failures.slice(0,30).join('\n'));
  process.exitCode=1;
}
