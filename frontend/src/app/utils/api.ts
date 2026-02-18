/**
 * API client — calls the FastAPI backend for real tax calculations.
 */

// ── Types ────────────────────────────────────────────────────────────

export interface KommuneRates {
  kommuneskat: number;
  kirkeskat: number;
}

export interface TaxConstants {
  am_rate: number;
  personfradrag: number;
  bundskat_rate: number;
  mellemskat_threshold: number;
  mellemskat_rate: number;
  topskat_threshold: number;
  topskat_rate: number;
  toptopskat_threshold: number;
  toptopskat_rate: number;
  skatteloft: number;
  beskaeft_rate: number;
  beskaeft_max: number;
  job_fradrag_rate: number;
  job_fradrag_max: number;
  ferietillaeg_rate: number;
  feriepenge_rate: number;
  atp_monthly_fulltime: number;
  atp_monthly_parttime: Record<string, number>;
  su_udeboende_month: number;
  su_hjemmeboende_base: number;
  su_hjemmeboende_max: number;
  fribeloeb_laveste_vid: number;
  fribeloeb_laveste_ungdom: number;
  fribeloeb_mellemste: number;
  fribeloeb_hoejeste: number;
  fribeloeb_parent_bonus: number;
  su_repayment_interest_rate: number;
}

export interface Meta {
  tax_year: number;
  dkk_per_eur: number;
  kommuner: Record<string, KommuneRates>;
  constants: TaxConstants;
}

export interface FullTimeRequest {
  gross_annual: number;
  kommune: string;
  pension_pct: number;
  employer_pension_pct: number;
  is_church: boolean;
  other_pay_monthly?: number;
  taxable_benefits_monthly?: number;
  pretax_deductions_monthly?: number;
  aftertax_deductions_monthly?: number;
  atp_monthly?: number;
  transport_km?: number;
  union_fees_annual?: number;
}

export interface PartTimeRequest {
  hourly_rate: number;
  hours_month: number;
  kommune: string;
  pension_pct: number;
  employer_pension_pct: number;
  is_church: boolean;
  other_pay_monthly?: number;
  taxable_benefits_monthly?: number;
  pretax_deductions_monthly?: number;
  aftertax_deductions_monthly?: number;
  atp_monthly?: number;
  transport_km?: number;
  union_fees_annual?: number;
}

export interface StudentRequest {
  su_monthly: number;
  work_gross_monthly: number;
  kommune: string;
  pension_pct: number;
  employer_pension_pct: number;
  is_church: boolean;
  aars_fribeloeb?: number | null;
}

export interface CurveRequest {
  kommune: string;
  pension_pct: number;
  employer_pension_pct: number;
  is_church: boolean;
  is_hourly?: boolean;
  atp_monthly?: number;
  other_pay_monthly?: number;
  taxable_benefits_monthly?: number;
  pretax_deductions_monthly?: number;
  aftertax_deductions_monthly?: number;
  transport_km?: number;
  union_fees_annual?: number;
  max_gross?: number;
  min_gross?: number;
  step_monthly?: number;
  points?: number;
}

export interface HoursCurveRequest {
  hourly_rate: number;
  kommune: string;
  pension_pct: number;
  employer_pension_pct: number;
  is_church: boolean;
  atp_monthly?: number;
  other_pay_monthly?: number;
  taxable_benefits_monthly?: number;
  pretax_deductions_monthly?: number;
  aftertax_deductions_monthly?: number;
  transport_km?: number;
  union_fees_annual?: number;
  max_hours?: number;
}

export interface CurvePoint {
  gross_annual: number;
  gross_monthly: number;
  net_monthly: number;
  effective_rate: number;
}

export interface HoursCurvePoint {
  hours_month: number;
  gross_monthly: number;
  net_monthly: number;
  effective_rate: number;
}

export interface TaxResult {
  kommune: string;
  kommune_pct: number;
  kirke_pct: number;
  gross_annual: number;
  feriepenge: number;
  other_pay: number;
  pretax_deductions: number;
  aftertax_deductions: number;
  taxable_benefits: number;
  total_gross: number;
  pension: number;
  employee_pension: number;
  employer_pension: number;
  total_pension: number;
  am_bidrag: number;
  atp_annual: number;
  income_after_am: number;
  beskaeft_fradrag: number;
  job_fradrag: number;
  befordring: number;
  union_deduction: number;
  lignings_fradrag: number;
  bundskat: number;
  kommuneskat: number;
  kirkeskat: number;
  mellemskat: number;
  topskat: number;
  toptopskat: number;
  total_income_tax: number;
  total_deductions: number;
  net_annual: number;
  net_monthly: number;
  effective_tax_rate: number;
  // Part-time extras
  hourly_rate?: number;
  hours_month?: number;
}

export interface StudentResult {
  kommune: string;
  kommune_pct: number;
  kirke_pct: number;
  su_annual_gross: number;
  su_annual: number;
  su_monthly: number;
  su_repayment: number;
  su_repayment_interest: number;
  aars_fribeloeb: number;
  fribeloeb_excess: number;
  work_feriepenge: number;
  work_gross_annual: number;
  work_gross_monthly: number;
  work_pension: number;
  work_employee_pension: number;
  work_employer_pension: number;
  work_total_pension: number;
  work_am_bidrag: number;
  work_after_am: number;
  total_personal: number;
  beskaeft_fradrag: number;
  job_fradrag: number;
  bundskat: number;
  kommuneskat: number;
  kirkeskat: number;
  mellemskat: number;
  total_income_tax: number;
  total_deductions: number;
  net_annual: number;
  net_monthly: number;
  over_fribeloeb: boolean;
  fribeloeb_limit: number;
  work_after_am_monthly: number;
}

// ── API calls ────────────────────────────────────────────────────────

const BASE = "";  // same origin, proxied by vite

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchMeta(): Promise<Meta> {
  const res = await fetch(`${BASE}/api/meta`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function computeFullTime(req: FullTimeRequest): Promise<TaxResult> {
  return post("/api/compute/fulltime", req);
}

export async function computePartTime(req: PartTimeRequest): Promise<TaxResult> {
  return post("/api/compute/parttime", req);
}

export async function computeStudent(req: StudentRequest): Promise<StudentResult> {
  return post("/api/compute/student", req);
}

export async function fetchCurve(req: CurveRequest): Promise<CurvePoint[]> {
  return post("/api/compute/curve", req);
}

export async function fetchHoursCurve(req: HoursCurveRequest): Promise<HoursCurvePoint[]> {
  return post("/api/compute/hours-curve", req);
}

// ── Exchange Rates ─────────────────────────────────────────────────

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>; // DKK per 1 unit of foreign currency
  currencies: Record<string, string>; // code → symbol
  cached_until: number;
}

let _exchangeCache: ExchangeRates | null = null;
let _exchangeFetchedAt = 0;

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  // Re-use client cache for 5 min to avoid hammering even the server cache
  if (_exchangeCache && now - _exchangeFetchedAt < 300_000) {
    return _exchangeCache;
  }
  const res = await fetch(`${BASE}/api/exchange-rates`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  _exchangeCache = await res.json();
  _exchangeFetchedAt = now;
  return _exchangeCache!;
}
