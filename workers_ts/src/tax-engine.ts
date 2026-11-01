// Faithful arithmetic port of api/tax_engine.py; Python remains the test oracle.
// Annual estimates, not tax-card withholding; original model limitations remain.
import { AM_RATE, PERSONFRADRAG, BUNDSKAT_RATE, MELLEMSKAT_THRESHOLD, MELLEMSKAT_RATE, TOPSKAT_THRESHOLD, TOPSKAT_RATE, TOPTOPSKAT_THRESHOLD, TOPTOPSKAT_RATE, SKATTELOFT, BESKAEFT_RATE, BESKAEFT_MAX, JOB_FRADRAG_THRESHOLD, JOB_FRADRAG_RATE, JOB_FRADRAG_MAX, FRIBELOEB_LAVESTE_VID, FRIBELOEB_LAVESTE_UNGDOM, FRIBELOEB_MELLEMSTE, SU_UDEBOENDE_MONTH, SU_LOAN_MONTHLY, CALCULATION_VERSION, FERIETILLAEG_RATE, FERIEPENGE_RATE, BEFORDRING_RATE_LOW, BEFORDRING_RATE_HIGH, BEFORDRING_THRESHOLD, BEFORDRING_HIGH_THRESHOLD, FAGFORENING_MAX, ATP_EMPLOYER_FACTOR } from "./data.ts";

export function computeBefordringsfradrag(daily_km: number, work_days: number = 218): number {
  let deductible_km: any, km_at_high: any, km_at_low: any;
  if ((daily_km <= BEFORDRING_THRESHOLD)) {
    return 0.0;
  }
  deductible_km = (daily_km - BEFORDRING_THRESHOLD);
  if ((daily_km <= BEFORDRING_HIGH_THRESHOLD)) {
    return ((deductible_km * BEFORDRING_RATE_LOW) * work_days);
  }
  km_at_low = (BEFORDRING_HIGH_THRESHOLD - BEFORDRING_THRESHOLD);
  km_at_high = (daily_km - BEFORDRING_HIGH_THRESHOLD);
  return (((km_at_low * BEFORDRING_RATE_LOW) + (km_at_high * BEFORDRING_RATE_HIGH)) * work_days);
}

export function monthlyAtp(hours_month: number): number {
  if ((hours_month < 39)) {
    return 0.0;
  }
  if ((hours_month < 78)) {
    return 33.0;
  }
  if ((hours_month < 117)) {
    return 66.0;
  }
  return 99.0;
}

export function computeProgressiveTax(personal_income: number, kommune_pct: number): [number, number, number] {
  let mellem_rate: any;
  mellem_rate = Math.min(MELLEMSKAT_RATE, Math.max(((SKATTELOFT - BUNDSKAT_RATE) - (kommune_pct / 100)), 0));
  return [(Math.max((personal_income - MELLEMSKAT_THRESHOLD), 0) * mellem_rate), (Math.max((personal_income - TOPSKAT_THRESHOLD), 0) * TOPSKAT_RATE), (Math.max((personal_income - TOPTOPSKAT_THRESHOLD), 0) * TOPTOPSKAT_RATE)];
}

export function employmentDeductionBase(am_basis: number, qualifying_pension: number, atp_annual: number): number {
  return Math.max(((am_basis + qualifying_pension) + (atp_annual * (1 + ATP_EMPLOYER_FACTOR))), 0);
}

export function computeSuRepayment(excess: number, su_received: number): [number, number] {
  let discount_band: any, principal: any, supplement: any;
  excess = Math.max(excess, 0);
  discount_band = (FRIBELOEB_MELLEMSTE - FRIBELOEB_LAVESTE_UNGDOM);
  principal = Math.min(Math.max(su_received, 0), (excess - (Math.min(excess, discount_band) / 2)));
  supplement = ((principal > (SU_UDEBOENDE_MONTH + SU_LOAN_MONTHLY)) ? (principal * 0.07) : 0.0);
  return [principal, supplement];
}

export function computeTax(params: Record<string, any>): Record<string, any> {
  let { gross_annual, pension_pct, kommune_pct, kirke_pct, is_church, has_employment_income = true, employer_pension_pct = 0.0, is_hourly = false, taxable_benefits_annual = 0.0, other_pay_annual = 0.0, pretax_deductions_annual = 0.0, aftertax_deductions_annual = 0.0, atp_monthly = 0.0, transport_km = 0.0, union_fees_annual = 0.0, pension_type = "standard", _skip_ferie = false, transport_days = 218, a_kasse_fees_annual = 0.0 } = params;
  let a_kasse_deduction: any, am_basis: any, am_bidrag: any, atp_annual: any, befordring: any, beskaeft: any, bundskat: any, bundskat_base: any, employee_pension: any, employer_pension: any, employment_base: any, ferie_rate: any, feriepenge: any, income_after_am: any, is_section53a: any, job_frad: any, k_pct: any, kirke_base: any, kirkeskat: any, kommune_base: any, kommuneskat: any, lignings_fradrag: any, mellemskat: any, net_annual: any, net_ferie: any, pension: any, pension_tax_deduction: any, r_no: any, result: any, taxable_employer_pension: any, topskat: any, toptopskat: any, total_cash: any, total_deductions: any, total_gross: any, total_income_tax: any, total_pension: any, union_deduction: any;
  if (_skip_ferie) {
    feriepenge = 0.0;
  }
  else {
    ferie_rate = (is_hourly ? FERIEPENGE_RATE : FERIETILLAEG_RATE);
    feriepenge = (gross_annual * ferie_rate);
  }
  total_cash = (((gross_annual + feriepenge) + other_pay_annual) - pretax_deductions_annual);
  employee_pension = (gross_annual * pension_pct);
  employer_pension = (gross_annual * employer_pension_pct);
  total_pension = (employee_pension + employer_pension);
  is_section53a = (pension_type === "section53a");
  pension = employee_pension;
  taxable_employer_pension = (is_section53a ? employer_pension : 0.0);
  total_gross = ((total_cash + taxable_benefits_annual) + taxable_employer_pension);
  atp_annual = (atp_monthly * 12);
  pension_tax_deduction = (is_section53a ? 0.0 : employee_pension);
  am_basis = Math.max(((total_gross - pension_tax_deduction) - atp_annual), 0);
  am_bidrag = (has_employment_income ? (am_basis * AM_RATE) : 0.0);
  income_after_am = (am_basis - am_bidrag);
  employment_base = employmentDeductionBase(am_basis, (is_section53a ? 0 : total_pension), atp_annual);
  if (has_employment_income) {
    beskaeft = Math.min((employment_base * BESKAEFT_RATE), BESKAEFT_MAX);
    job_frad = Math.min((Math.max((employment_base - JOB_FRADRAG_THRESHOLD), 0) * JOB_FRADRAG_RATE), JOB_FRADRAG_MAX);
  }
  else {
    beskaeft = job_frad = 0.0;
  }
  befordring = ((transport_km > 0) ? computeBefordringsfradrag(transport_km, transport_days) : 0.0);
  union_deduction = Math.min(Math.max(union_fees_annual, 0), FAGFORENING_MAX);
  a_kasse_deduction = Math.max(a_kasse_fees_annual, 0);
  lignings_fradrag = ((befordring + union_deduction) + a_kasse_deduction);
  bundskat_base = Math.max((income_after_am - PERSONFRADRAG), 0);
  bundskat = (bundskat_base * BUNDSKAT_RATE);
  kommune_base = Math.max(((((income_after_am - PERSONFRADRAG) - beskaeft) - job_frad) - lignings_fradrag), 0);
  k_pct = (kommune_pct / 100.0);
  kommuneskat = (kommune_base * k_pct);
  kirkeskat = 0.0;
  if (is_church) {
    kirke_base = Math.max(((((income_after_am - PERSONFRADRAG) - beskaeft) - job_frad) - lignings_fradrag), 0);
    kirkeskat = (kirke_base * (kirke_pct / 100.0));
  }
  [mellemskat, topskat, toptopskat] = computeProgressiveTax(income_after_am, kommune_pct);
  total_income_tax = (((((bundskat + kommuneskat) + kirkeskat) + mellemskat) + topskat) + toptopskat);
  total_deductions = (((am_bidrag + pension) + total_income_tax) + atp_annual);
  net_annual = ((total_cash - total_deductions) - aftertax_deductions_annual);
  result = {
    "calculation_version": CALCULATION_VERSION,
    "employment_deduction_base": employment_base,
    "a_kasse_deduction": a_kasse_deduction,
    "transport_days": transport_days,
    "gross_annual": gross_annual,
    "feriepenge": feriepenge,
    "other_pay": other_pay_annual,
    "pretax_deductions": pretax_deductions_annual,
    "aftertax_deductions": aftertax_deductions_annual,
    "taxable_benefits": taxable_benefits_annual,
    "total_gross": total_gross,
    "taxable_income": am_basis,
    "pension_type": pension_type,
    "pension": pension,
    "employee_pension": employee_pension,
    "employer_pension": employer_pension,
    "total_pension": total_pension,
    "taxable_employer_pension": taxable_employer_pension,
    "am_bidrag": am_bidrag,
    "atp_annual": atp_annual,
    "income_after_am": income_after_am,
    "beskaeft_fradrag": beskaeft,
    "job_fradrag": job_frad,
    "befordring": befordring,
    "union_deduction": union_deduction,
    "lignings_fradrag": lignings_fradrag,
    "bundskat": bundskat,
    "kommuneskat": kommuneskat,
    "kirkeskat": kirkeskat,
    "mellemskat": mellemskat,
    "topskat": topskat,
    "toptopskat": toptopskat,
    "total_income_tax": total_income_tax,
    "total_deductions": total_deductions,
    "net_annual": net_annual,
    "net_monthly": (net_annual / 12),
    "effective_tax_rate": ((total_gross > 0) ? (((am_bidrag + total_income_tax) / total_gross) * 100) : 0)
  };
  if ((!(_skip_ferie) && (feriepenge > 0))) {
    r_no = computeTax({gross_annual: gross_annual, pension_pct: pension_pct, kommune_pct: kommune_pct, kirke_pct: kirke_pct, is_church: is_church, has_employment_income: has_employment_income, employer_pension_pct: employer_pension_pct, is_hourly: is_hourly, taxable_benefits_annual: taxable_benefits_annual, other_pay_annual: other_pay_annual, pretax_deductions_annual: pretax_deductions_annual, aftertax_deductions_annual: aftertax_deductions_annual, atp_monthly: atp_monthly, transport_km: transport_km, union_fees_annual: union_fees_annual, pension_type: pension_type, _skip_ferie: true, transport_days: transport_days, a_kasse_fees_annual: a_kasse_fees_annual});
    net_ferie = (net_annual - r_no["net_annual"]);
  }
  else {
    net_ferie = 0.0;
  }
  result["net_ferie"] = net_ferie;
  result["net_ferie_monthly"] = (net_ferie / 12);
  result["ordinary_net_monthly"] = ((net_annual - net_ferie) / 12);
  return result;
}

export function computeStudentIncome(params: Record<string, any>): Record<string, any> {
  let { su_monthly, work_gross_monthly, pension_pct, kommune_pct, kirke_pct, is_church, employer_pension_pct = 0.0, aars_fribeloeb = null, atp_monthly = 0.0, pretax_deductions_annual = 0.0, aftertax_deductions_annual = 0.0, other_pay_annual = 0.0, transport_km = 0.0, union_fees_annual = 0.0, pension_type = "standard", su_months = 12, _skip_ferie = false, transport_days = 218, a_kasse_fees_annual = 0.0 } = params;
  let a_kasse_deduction: any, atp_annual: any, befordring: any, beskaeft: any, bundskat: any, bundskat_base: any, employment_base: any, fribeloeb_excess: any, is_section53a: any, job_frad: any, k_pct: any, kirke_base: any, kirkeskat: any, kommune_base: any, kommuneskat: any, lignings_fradrag: any, mellemskat: any, net_annual: any, net_ferie: any, over_fribeloeb: any, r_no: any, result: any, su_annual: any, su_annual_gross: any, su_repayment: any, su_repayment_supplement: any, topskat: any, toptopskat: any, total_deductions: any, total_income_tax: any, total_personal: any, total_work_cash: any, union_deduction: any, work_after_am: any, work_after_am_monthly: any, work_am_basis: any, work_am_bidrag: any, work_annual: any, work_employee_pension: any, work_employer_pension: any, work_feriepenge: any, work_pension: any, work_pension_tax_deduction: any, work_taxable_employer_pension: any, work_total_pension: any;
  if ((aars_fribeloeb === null)) {
    aars_fribeloeb = (FRIBELOEB_LAVESTE_VID * 12);
  }
  su_annual_gross = (su_monthly * su_months);
  work_annual = (work_gross_monthly * 12);
  work_feriepenge = (_skip_ferie ? 0.0 : (work_annual * FERIEPENGE_RATE));
  total_work_cash = (((work_annual + work_feriepenge) + other_pay_annual) - pretax_deductions_annual);
  work_employee_pension = (work_annual * pension_pct);
  work_employer_pension = (work_annual * employer_pension_pct);
  work_total_pension = (work_employee_pension + work_employer_pension);
  is_section53a = (pension_type === "section53a");
  work_pension = work_employee_pension;
  work_taxable_employer_pension = (is_section53a ? work_employer_pension : 0.0);
  work_pension_tax_deduction = (is_section53a ? 0.0 : work_employee_pension);
  atp_annual = (atp_monthly * 12);
  work_am_basis = Math.max(0, (((total_work_cash + work_taxable_employer_pension) - work_pension_tax_deduction) - atp_annual));
  work_am_bidrag = (work_am_basis * AM_RATE);
  work_after_am = (work_am_basis - work_am_bidrag);
  fribeloeb_excess = Math.max((work_after_am - aars_fribeloeb), 0);
  [su_repayment, su_repayment_supplement] = computeSuRepayment(fribeloeb_excess, su_annual_gross);
  over_fribeloeb = (fribeloeb_excess > 0);
  su_annual = su_annual_gross;
  total_personal = (su_annual_gross + work_after_am);
  employment_base = employmentDeductionBase(work_am_basis, (is_section53a ? 0 : work_total_pension), atp_annual);
  beskaeft = Math.min((employment_base * BESKAEFT_RATE), BESKAEFT_MAX);
  job_frad = Math.min((Math.max((employment_base - JOB_FRADRAG_THRESHOLD), 0) * JOB_FRADRAG_RATE), JOB_FRADRAG_MAX);
  befordring = ((transport_km > 0) ? computeBefordringsfradrag(transport_km, transport_days) : 0.0);
  union_deduction = Math.min(Math.max(union_fees_annual, 0), FAGFORENING_MAX);
  a_kasse_deduction = Math.max(a_kasse_fees_annual, 0);
  lignings_fradrag = ((befordring + union_deduction) + a_kasse_deduction);
  bundskat_base = Math.max((total_personal - PERSONFRADRAG), 0);
  bundskat = (bundskat_base * BUNDSKAT_RATE);
  kommune_base = Math.max(((((total_personal - PERSONFRADRAG) - beskaeft) - job_frad) - lignings_fradrag), 0);
  k_pct = (kommune_pct / 100.0);
  kommuneskat = (kommune_base * k_pct);
  kirkeskat = 0.0;
  if (is_church) {
    kirke_base = Math.max(((((total_personal - PERSONFRADRAG) - beskaeft) - job_frad) - lignings_fradrag), 0);
    kirkeskat = (kirke_base * (kirke_pct / 100.0));
  }
  [mellemskat, topskat, toptopskat] = computeProgressiveTax(total_personal, kommune_pct);
  total_income_tax = (((((bundskat + kommuneskat) + kirkeskat) + mellemskat) + topskat) + toptopskat);
  total_deductions = (((work_am_bidrag + work_pension) + total_income_tax) + atp_annual);
  net_annual = (((su_annual_gross + total_work_cash) - total_deductions) - aftertax_deductions_annual);
  work_after_am_monthly = (work_after_am / 12);
  result = {
    "calculation_version": CALCULATION_VERSION,
    "employment_deduction_base": employment_base,
    "a_kasse_deduction": a_kasse_deduction,
    "transport_days": transport_days,
    "su_annual_gross": su_annual_gross,
    "su_annual": su_annual,
    "su_monthly": su_monthly,
    "su_repayment": su_repayment,
    "su_repayment_interest": null,
    "su_repayment_supplement": su_repayment_supplement,
    "su_repayment_total": (su_repayment + su_repayment_supplement),
    "su_months": su_months,
    "effective_tax_rate": ((((su_annual_gross + total_work_cash) + work_taxable_employer_pension) > 0) ? (((work_am_bidrag + total_income_tax) / ((su_annual_gross + total_work_cash) + work_taxable_employer_pension)) * 100) : 0),
    "aars_fribeloeb": aars_fribeloeb,
    "fribeloeb_excess": fribeloeb_excess,
    "work_feriepenge": work_feriepenge,
    "work_gross_annual": work_annual,
    "work_gross_monthly": work_gross_monthly,
    "work_pension": work_pension,
    "pension_type": pension_type,
    "work_employee_pension": work_employee_pension,
    "work_employer_pension": work_employer_pension,
    "work_total_pension": work_total_pension,
    "work_taxable_employer_pension": work_taxable_employer_pension,
    "work_taxable_income": work_am_basis,
    "work_am_bidrag": work_am_bidrag,
    "work_after_am": work_after_am,
    "atp_annual": atp_annual,
    "other_pay": other_pay_annual,
    "pretax_deductions": pretax_deductions_annual,
    "aftertax_deductions": aftertax_deductions_annual,
    "befordring": befordring,
    "union_deduction": union_deduction,
    "lignings_fradrag": lignings_fradrag,
    "total_personal": total_personal,
    "beskaeft_fradrag": beskaeft,
    "job_fradrag": job_frad,
    "bundskat": bundskat,
    "kommuneskat": kommuneskat,
    "kirkeskat": kirkeskat,
    "mellemskat": mellemskat,
    "topskat": topskat,
    "toptopskat": toptopskat,
    "total_income_tax": total_income_tax,
    "total_deductions": total_deductions,
    "net_annual": net_annual,
    "net_monthly": (net_annual / 12),
    "over_fribeloeb": over_fribeloeb,
    "fribeloeb_limit": FRIBELOEB_LAVESTE_VID,
    "work_after_am_monthly": work_after_am_monthly
  };
  if ((!(_skip_ferie) && (work_feriepenge > 0))) {
    r_no = computeStudentIncome({su_monthly: su_monthly, work_gross_monthly: work_gross_monthly, pension_pct: pension_pct, kommune_pct: kommune_pct, kirke_pct: kirke_pct, is_church: is_church, employer_pension_pct: employer_pension_pct, aars_fribeloeb: aars_fribeloeb, atp_monthly: atp_monthly, pretax_deductions_annual: pretax_deductions_annual, aftertax_deductions_annual: aftertax_deductions_annual, other_pay_annual: other_pay_annual, transport_km: transport_km, union_fees_annual: union_fees_annual, pension_type: pension_type, su_months: su_months, _skip_ferie: true, transport_days: transport_days, a_kasse_fees_annual: a_kasse_fees_annual});
    net_ferie = (net_annual - r_no["net_annual"]);
  }
  else {
    net_ferie = 0.0;
  }
  result["net_ferie"] = net_ferie;
  result["net_ferie_monthly"] = (net_ferie / 12);
  result["ordinary_net_monthly"] = ((net_annual - net_ferie) / 12);
  return result;
}

