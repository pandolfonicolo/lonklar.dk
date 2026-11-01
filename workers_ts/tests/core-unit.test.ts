import test from 'node:test';
import assert from 'node:assert/strict';
import { pyRound, preciseSum } from '../src/numeric.ts';
import { computeTax, computeStudentIncome, computeSuRepayment, monthlyAtp } from '../src/tax-engine.ts';
import { hoursSamples, sampleBoundaries } from '../src/chart-curves.ts';

const employee = (gross_annual: number) => computeTax({gross_annual, pension_pct: 0,
  kommune_pct: 23.39, kirke_pct: 0, is_church: false});

test('independent published-rule salary fixtures, unchanged from Python tests', () => {
  const cases = [[20000,14209.93875],[25000,17415.0108875],[30000,20567.8843416667],
    [60000,38732.0886666667],[80000,48630.2276666667],[100000,57847.8916666667],
    [300000,146889.4483333333]];
  for (const [gross, net] of cases) assert.ok(Math.abs(employee(gross * 12).net_monthly-net)<1e-5);
});

test('Python round ties and decimal/binary halfway traps', () => {
  for (const [x,d,y] of [[.5,0,0],[1.5,0,2],[2.5,0,2],[-2.5,0,-2],
    [2.675,2,2.67],[1.005,2,1],[-2.675,2,-2.67],[56294995342131.5,0,56294995342132]]) {
    assert.equal(pyRound(x,d),y);
  }
  assert.ok(Object.is(pyRound(-0.1,0),-0));
  assert.equal(preciseSum([1e16,1,-1e16]),1);
});

test('ATP discontinuities retained on both sides', () => {
  for(const [h, expected] of [[38.9,0],[39,33],[77.9,33],[78,66],[116.9,66],[117,99]]) assert.equal(monthlyAtp(h),expected);
  const values=hoursSamples(220,5,true);
  for(const h of [39,78,117]){assert.ok(values.includes(h));assert.ok(values.includes(h-.000001));}
});

test('chart bisections preserve upward and downward crossings', () => {
  const points=sampleBoundaries([0,1,2], x=>({metric: x<1 ? x*2 : 2-x}), 'metric', [[.5,'crossing']]);
  assert.deepEqual(points.filter(p=>p[2]).map(p=>p[0]), [.25,1.5]);
});

test('student repayment later, not current cash; cap and supplement', () => {
  const args={su_monthly:7426,work_gross_monthly:30000,pension_pct:0,kommune_pct:23.39,kirke_pct:0,is_church:false,su_months:6};
  const a=computeStudentIncome({...args,aars_fribeloeb:266082});
  const b=computeStudentIncome({...args,aars_fribeloeb:999999});
  assert.equal(a.net_annual,b.net_annual);
  assert.equal(a.su_repayment_interest,null);
  assert.equal(a.over_fribeloeb,true);
  assert.deepEqual(computeSuRepayment(70000,30000),[30000,2100]);
});

test('scenario municipality rejects inherited object property names', async () => {
  const {computeEmployeeScenario} = await import('../src/salary-scenarios.ts');
  for (const kommune of ['__proto__', 'constructor', 'toString']) {
    assert.deepEqual(computeEmployeeScenario({kommune}), {error: `Unknown kommune: ${kommune}`});
  }
});
