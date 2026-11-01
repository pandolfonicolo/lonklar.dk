import { KOMMUNER } from './data.ts';
import { computeTax } from './tax-engine.ts';
import { preciseSum } from './numeric.ts';

type Scenario = Record<string, any>;
type Result = Record<string, any>;
export function scenarioGrossAnnual(scenario: Scenario): number {
  return scenario.employment_type === 'parttime'
    ? (scenario.hourly_rate || 0) * (scenario.hours_month || 0) * 12
    : scenario.gross_annual || 0;
}

/** Input already carries the request model defaults, as in the Python router. */
export function computeEmployeeScenario(scenario: Scenario): Result {
  if (!Object.hasOwn(KOMMUNER, scenario.kommune)) return {error: `Unknown kommune: ${scenario.kommune}`};
  const rates = (KOMMUNER as Record<string, {kommuneskat: number; kirkeskat: number}>)[scenario.kommune];
  const result = computeTax({
    gross_annual: scenarioGrossAnnual(scenario),
    pension_pct: scenario.pension_pct / 100,
    kommune_pct: rates.kommuneskat,
    kirke_pct: rates.kirkeskat,
    is_church: scenario.is_church,
    has_employment_income: true,
    employer_pension_pct: scenario.employer_pension_pct / 100,
    is_hourly: scenario.employment_type === 'parttime',
    taxable_benefits_annual: scenario.taxable_benefits_monthly * 12,
    other_pay_annual: scenario.other_pay_monthly * 12,
    pretax_deductions_annual: scenario.pretax_deductions_monthly * 12,
    aftertax_deductions_annual: scenario.aftertax_deductions_monthly * 12,
    atp_monthly: scenario.atp_monthly,
    transport_km: scenario.transport_km,
    union_fees_annual: scenario.union_fees_annual,
    transport_days: scenario.transport_days,
    a_kasse_fees_annual: scenario.a_kasse_fees_annual,
    pension_type: scenario.pension_type,
  });
  return {employment_type: scenario.employment_type, kommune: scenario.kommune,
    kommune_pct: rates.kommuneskat, kirke_pct: rates.kirkeskat,
    hourly_rate: scenario.hourly_rate, hours_month: scenario.hours_month, ...result};
}

export function compensationAnnual(result: Result): number {
  return (result.total_gross ?? 0) + (result.employer_pension ?? 0) - (result.taxable_employer_pension ?? 0);
}
export function comparisonDelta(a: Result, b: Result): Result {
  const taxA = (a.am_bidrag ?? 0) + (a.total_income_tax ?? 0);
  const taxB = (b.am_bidrag ?? 0) + (b.total_income_tax ?? 0);
  return {net_monthly: (b.net_monthly ?? 0) - (a.net_monthly ?? 0),
    net_annual: (b.net_annual ?? 0) - (a.net_annual ?? 0), tax: taxB - taxA,
    employee_pension: (b.employee_pension ?? 0) - (a.employee_pension ?? 0),
    employer_pension: (b.employer_pension ?? 0) - (a.employer_pension ?? 0),
    total_pension: (b.total_pension ?? 0) - (a.total_pension ?? 0),
    total_compensation: compensationAnnual(b) - compensationAnnual(a)};
}

/** These are projections under CURRENT 2026 tax rules, not future tax forecasts. */
export function projectEmployeeScenario(scenario: Scenario, settings: Scenario): Result {
  const growth = settings.salary_growth_pct / 100;
  const returnRate = settings.annual_return_pct / 100;
  const baseGross = scenarioGrossAnnual(scenario);
  let balance = 0;
  const rows: Result[] = [];
  for (let year = 1; year <= settings.years; year++) {
    const projected: Scenario = {...scenario, gross_annual: baseGross * ((1 + growth) ** (year - 1))};
    if (projected.employment_type === 'parttime' && scenario.hours_month) {
      projected.hourly_rate = (scenario.hourly_rate || 0) * ((1 + growth) ** (year - 1));
    }
    const result = computeEmployeeScenario(projected);
    if ('error' in result) return result;
    balance = balance * (1 + returnRate) + result.total_pension;
    rows.push({year, gross_annual: result.gross_annual, net_annual: result.net_annual,
      net_monthly: result.net_monthly, tax: result.am_bidrag + result.total_income_tax,
      employee_pension: result.employee_pension, employer_pension: result.employer_pension,
      total_pension: result.total_pension, total_compensation: compensationAnnual(result),
      projected_pension_balance: balance});
  }
  return {settings: {...settings}, years: rows, totals: {
    employee_pension: preciseSum(rows.map(r => r.employee_pension)),
    employer_pension: preciseSum(rows.map(r => r.employer_pension)),
    total_pension: preciseSum(rows.map(r => r.total_pension)),
    net_annual: preciseSum(rows.map(r => r.net_annual)),
    tax: preciseSum(rows.map(r => r.tax)),
    total_compensation: preciseSum(rows.map(r => r.total_compensation)),
    projected_pension_balance: balance,
  }};
}
