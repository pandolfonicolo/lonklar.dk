import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { computeTax, computeStudentIncome } from '../src/tax-engine.ts';
import { pyRound } from '../src/numeric.ts';

test('2,000 synthetic core cases and 8,040 rounding cases against unchanged Python', () => {
  const oracle = spawnSync(process.env.PYTHON ?? 'python',
    [fileURLToPath(new URL('./generate-core-corpus.py', import.meta.url))],
    {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
  assert.equal(oracle.status, 0, oracle.stderr || String(oracle.error));
  const {cases, rounds} = JSON.parse(oracle.stdout);
  const engines = {computeTax, computeStudentIncome};
  let fields = 0;
  for (const [index, {name, params, result}] of cases.entries()) {
    const got = engines[name](params);
    assert.deepEqual(Object.keys(got).sort(), Object.keys(result).sort());
    for (const key of Object.keys(result)) {
      fields++;
      if (typeof result[key] === 'number') {
        // Runtime binary64 tolerance, not a promise of bitwise equality.
        // Rounded currency output has further coverage in the API corpus.
        assert.ok(Math.abs(got[key] - result[key]) <= 1e-9,
          `case ${index} ${name}.${key}: ${got[key]} != ${result[key]}`);
      } else assert.deepEqual(got[key], result[key], `${index}.${key}`);
    }
  }
  assert.equal(cases.length, 2000);
  assert.equal(fields, 93000);
  for (const {x, d, expected} of rounds) {
    // JSON does not preserve Python integer-vs-float zero sign.
    assert.ok(pyRound(x, d) === expected, `${x} rounded to ${d}: expected ${expected}`);
  }
  assert.equal(rounds.length, 8040);
});
