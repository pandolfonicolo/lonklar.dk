"""
Tax calculation engine for Denmark (2026).

Two public functions:
  • compute_tax()            — salary/wage earners (full-time or part-time)
  • compute_student_income() — student (SU + part-time work)

ACCURACY NOTE (~±1.5%)
─────────────────────
This engine computes annual figures then divides by 12 for monthly values.
Two known sources of deviation when compared to real payslips:

1. Ferietillæg (1% for funktionærer / 12.5% feriepenge for hourly):
   Ferietillæg is part of total annual income and is included in the
   forskudsopgørelse, but it is NOT paid monthly — it is typically paid
   out once in May (or split between May and August). Our engine spreads
   it across 12 months, which inflates the per-month AM-bidrag basis by
   ~1% compared to a non-May payslip. This is intentional: the monthly
   figure is an annual average, not a prediction of a specific month.

2. Fradrag (deductions / trækprocent):
   Our engine computes the "standard" fradrag: personfradrag +
   beskæftigelsesfradrag + jobfradrag (+ befordring/fagforening if
   provided). In practice, each employee has a personalized trækprocent
   set via their forskudsopgørelse (preliminary tax assessment) on
   skat.dk. This may include additional deductions we cannot know:
     – Rentefradrag (mortgage interest)
     – Kapitalindkomst (capital income)
     – Ligningsmæssige fradrag (maintenance payments, etc.)
   The fradrag delta typically accounts for ±500–1,700 kr/month, which
   is the main driver of deviation from real payslips.

Combined, these factors typically result in ±1–2% deviation from the
actual net pay shown on a payslip.
"""

from .data import (
    AM_RATE,
    PERSONFRADRAG,
    BUNDSKAT_RATE,
    MELLEMSKAT_THRESHOLD, MELLEMSKAT_RATE,
    TOPSKAT_THRESHOLD,    TOPSKAT_RATE,
    TOPTOPSKAT_THRESHOLD, TOPTOPSKAT_RATE,
    SKATTELOFT,
    BESKAEFT_RATE, BESKAEFT_MAX,
    JOB_FRADRAG_RATE, JOB_FRADRAG_MAX,
    FRIBELOEB_LAVESTE_VID,
    SU_REPAYMENT_INTEREST_RATE,
    FERIETILLAEG_RATE, FERIEPENGE_RATE,
    ATP_MONTHLY,
    BEFORDRING_RATE_LOW, BEFORDRING_RATE_HIGH,
    BEFORDRING_THRESHOLD, BEFORDRING_HIGH_THRESHOLD,
    FAGFORENING_MAX,
)


def compute_befordringsfradrag(daily_km: float, work_days: int = 218) -> float:
    """Compute annual transport deduction (befordringsfradrag).

    Parameters
    ----------
    daily_km    Round-trip distance home ↔ work in km.
    work_days   Working days per year (default 218 ≈ 52w × 5d − 30 holidays/sick).
    """
    if daily_km <= BEFORDRING_THRESHOLD:
        return 0.0
    deductible_km = daily_km - BEFORDRING_THRESHOLD
    if daily_km <= BEFORDRING_HIGH_THRESHOLD:
        return deductible_km * BEFORDRING_RATE_LOW * work_days
    # Split: 25–120 km at high rate, >120 km at low rate
    km_at_low  = BEFORDRING_HIGH_THRESHOLD - BEFORDRING_THRESHOLD
    km_at_high = daily_km - BEFORDRING_HIGH_THRESHOLD
    return (km_at_low * BEFORDRING_RATE_LOW + km_at_high * BEFORDRING_RATE_HIGH) * work_days


# ═══════════════════════════════════════════════════════════════════════
#  EMPLOYEE TAX
# ═══════════════════════════════════════════════════════════════════════

def compute_tax(
    gross_annual: float,
    pension_pct: float,
    kommune_pct: float,
    kirke_pct: float,
    is_church: bool,
    has_employment_income: bool = True,
    employer_pension_pct: float = 0.0,
    is_hourly: bool = False,
    taxable_benefits_annual: float = 0.0,
    other_pay_annual: float = 0.0,
    pretax_deductions_annual: float = 0.0,
    aftertax_deductions_annual: float = 0.0,
    atp_monthly: float = 0.0,
    transport_km: float = 0.0,
    union_fees_annual: float = 0.0,
    _skip_ferie: bool = False,
) -> dict:
    """Full Danish tax calculation for one year.

    Parameters
    ----------
    gross_annual           Gross salary (before any deductions).
    pension_pct            Employee pension contribution (0–1), deducted from gross.
    kommune_pct            Municipal tax rate as **percentage** (e.g. 23.39).
    kirke_pct              Church-tax rate as **percentage** (e.g. 0.80).
    is_church              Member of the national church?
    has_employment_income  True → AM-bidrag + beskæftigelsesfradrag apply.
    employer_pension_pct   Employer pension contribution ON TOP (0–1), not taxed.
    is_hourly              True → 12.5% feriepenge; False → 1% ferietillæg.
    taxable_benefits_annual  Non-cash benefits that add to taxable income
                             (e.g. fri telefon, sundhedsforsikring).
    other_pay_annual       Extra cash compensation (broadband, allowances, etc.).
    pretax_deductions_annual  Employer deductions from pay before tax (e.g. DSB card).
    aftertax_deductions_annual  Deductions after tax (canteen, clubs, etc.).
    atp_monthly            ATP employee contribution per month.
    transport_km           Round-trip daily commute km (>24 → befordringsfradrag).
    union_fees_annual      Annual trade union + a-kasse fees (max 7,000 deductible).
    """
    # 0) Feriepenge / ferietillæg (additional taxable income)
    #    Hourly workers: 12.5% feriepenge (paid with each paycheck or via FerieKonto).
    #    Salaried (funktionærer): 1% ferietillæg, paid in May (not monthly).
    #    We include it in annual income and spread across 12 months.
    #    This is correct for annual totals but inflates a single month's AM-basis
    #    compared to the payslip (except May when it's actually disbursed).
    if _skip_ferie:
        feriepenge = 0.0
    else:
        ferie_rate = FERIEPENGE_RATE if is_hourly else FERIETILLAEG_RATE
        feriepenge = gross_annual * ferie_rate

    # Total cash pay = salary + feriepenge + other pay - pretax deductions
    total_cash = gross_annual + feriepenge + other_pay_annual - pretax_deductions_annual

    # Total taxable gross = cash pay + taxable non-cash benefits
    total_gross = total_cash + taxable_benefits_annual

    # 1) Pension (on base salary only, not on feriepenge/benefits)
    employee_pension = gross_annual * pension_pct          # deducted from gross
    employer_pension = gross_annual * employer_pension_pct # on top, not taxed
    total_pension    = employee_pension + employer_pension
    pension = employee_pension  # only employee part reduces taxable income
    atp_annual = atp_monthly * 12
    am_basis = total_gross - pension - atp_annual

    # 2) AM-bidrag
    am_bidrag = am_basis * AM_RATE if has_employment_income else 0.0
    income_after_am = am_basis - am_bidrag

    # 3) Employment deductions
    if has_employment_income:
        beskaeft = min(income_after_am * BESKAEFT_RATE, BESKAEFT_MAX)
        job_frad = min(income_after_am * JOB_FRADRAG_RATE, JOB_FRADRAG_MAX)
    else:
        beskaeft = job_frad = 0.0

    # 3b) Ligningsmæssige fradrag (reduce kommune/kirke base, NOT bundskat base)
    befordring = compute_befordringsfradrag(transport_km) if transport_km > 0 else 0.0
    union_deduction = min(union_fees_annual, FAGFORENING_MAX)
    lignings_fradrag = befordring + union_deduction

    # 4) Bundskat
    #    NOTE: The fradrag used here (personfradrag + beskæftigelsesfradrag +
    #    jobfradrag) is the "standard" calculation. Each employee's actual
    #    trækprocent is determined by their forskudsopgørelse (preliminary tax
    #    assessment on skat.dk), which may include personal deductions we don't
    #    know about (rentefradrag, kapitalindkomst, etc.). This is the primary
    #    source of deviation between our estimate and real payslips.
    bundskat_base = max(income_after_am - PERSONFRADRAG, 0)
    bundskat = bundskat_base * BUNDSKAT_RATE

    # 5) Kommuneskat (reduced base via fradrag)
    kommune_base = max(income_after_am - PERSONFRADRAG - beskaeft - job_frad - lignings_fradrag, 0)
    k_pct = kommune_pct / 100.0
    kommuneskat = kommune_base * k_pct

    # 6) Kirkeskat (also reduced by ligningsmæssige fradrag)
    kirkeskat = 0.0
    if is_church:
        kirke_base = max(income_after_am - PERSONFRADRAG - lignings_fradrag, 0)
        kirkeskat = kirke_base * (kirke_pct / 100.0)

    # 7) Progressive brackets — capped by skatteloft
    base_marginal = BUNDSKAT_RATE + k_pct

    eff_mellem = MELLEMSKAT_RATE
    if base_marginal + eff_mellem > SKATTELOFT:
        eff_mellem = max(SKATTELOFT - base_marginal, 0)

    eff_top = TOPSKAT_RATE
    if base_marginal + eff_mellem + eff_top > SKATTELOFT:
        eff_top = max(SKATTELOFT - base_marginal - eff_mellem, 0)

    eff_toptop = TOPTOPSKAT_RATE
    if base_marginal + eff_mellem + eff_top + eff_toptop > SKATTELOFT:
        eff_toptop = max(SKATTELOFT - base_marginal - eff_mellem - eff_top, 0)

    mellem_base = max(min(income_after_am, TOPSKAT_THRESHOLD)
                      - MELLEMSKAT_THRESHOLD, 0)
    top_base    = max(min(income_after_am, TOPTOPSKAT_THRESHOLD)
                      - TOPSKAT_THRESHOLD, 0)
    toptop_base = max(income_after_am - TOPTOPSKAT_THRESHOLD, 0)

    mellemskat = mellem_base * eff_mellem
    topskat    = top_base    * eff_top
    toptopskat = toptop_base * eff_toptop

    # 8) Totals
    total_income_tax = (bundskat + kommuneskat + kirkeskat
                        + mellemskat + topskat + toptopskat)
    total_deductions = am_bidrag + pension + total_income_tax + atp_annual
    # Net = total cash - deductions - after-tax items
    # (taxable benefits are non-cash so not in net)
    net_annual = total_cash - total_deductions - aftertax_deductions_annual

    result = {
        "gross_annual":        gross_annual,
        "feriepenge":          feriepenge,
        "other_pay":           other_pay_annual,
        "pretax_deductions":   pretax_deductions_annual,
        "aftertax_deductions": aftertax_deductions_annual,
        "taxable_benefits":    taxable_benefits_annual,
        "total_gross":         total_gross,
        "pension":             pension,
        "employee_pension":    employee_pension,
        "employer_pension":    employer_pension,
        "total_pension":       total_pension,
        "am_bidrag":           am_bidrag,
        "atp_annual":          atp_annual,
        "income_after_am":     income_after_am,
        "beskaeft_fradrag":    beskaeft,
        "job_fradrag":         job_frad,
        "befordring":          befordring,
        "union_deduction":     union_deduction,
        "lignings_fradrag":    lignings_fradrag,
        "bundskat":            bundskat,
        "kommuneskat":         kommuneskat,
        "kirkeskat":           kirkeskat,
        "mellemskat":          mellemskat,
        "topskat":             topskat,
        "toptopskat":          toptopskat,
        "total_income_tax":    total_income_tax,
        "total_deductions":    total_deductions,
        "net_annual":          net_annual,
        "net_monthly":         net_annual / 12,
        "effective_tax_rate":  (total_deductions / total_gross * 100)
                                 if total_gross > 0 else 0,
    }

    # Compute net contribution of feriepenge (difference method)
    if not _skip_ferie and feriepenge > 0:
        r_no = compute_tax(
            gross_annual, pension_pct, kommune_pct, kirke_pct,
            is_church, has_employment_income, employer_pension_pct,
            is_hourly, taxable_benefits_annual, other_pay_annual,
            pretax_deductions_annual, aftertax_deductions_annual,
            atp_monthly, transport_km, union_fees_annual,
            _skip_ferie=True,
        )
        net_ferie = net_annual - r_no["net_annual"]
    else:
        net_ferie = 0.0
    result["net_ferie"] = net_ferie
    result["net_ferie_monthly"] = net_ferie / 12

    return result


# ═══════════════════════════════════════════════════════════════════════
#  STUDENT (SU + WORK)
# ═══════════════════════════════════════════════════════════════════════

def compute_student_income(
    su_monthly: float,
    work_gross_monthly: float,
    pension_pct: float,
    kommune_pct: float,
    kirke_pct: float,
    is_church: bool,
    employer_pension_pct: float = 0.0,
    aars_fribeloeb: float | None = None,
    _skip_ferie: bool = False,
) -> dict:
    """Combined net income: SU (no AM) + work wages (AM applies).

    The personfradrag covers the combined personal income.
    If aars_fribeloeb is not given, defaults to 12 × laveste videregående.
    """
    if aars_fribeloeb is None:
        aars_fribeloeb = FRIBELOEB_LAVESTE_VID * 12
    su_annual_gross = su_monthly * 12
    work_annual     = work_gross_monthly * 12

    # Feriepenge (12.5 % for hourly student jobs — counts towards egenindkomst)
    work_feriepenge = 0.0 if _skip_ferie else work_annual * FERIEPENGE_RATE

    # Work side
    work_employee_pension = work_annual * pension_pct
    work_employer_pension = work_annual * employer_pension_pct  # on top
    work_total_pension    = work_employee_pension + work_employer_pension
    work_pension          = work_employee_pension  # only employee part is deducted
    work_am_basis  = (work_annual + work_feriepenge) - work_pension
    work_am_bidrag = work_am_basis * AM_RATE
    work_after_am  = work_am_basis - work_am_bidrag

    # ── Fribeløb check & SU repayment ──────────────────────────────
    # Egenindkomst includes feriepenge (su.dk: "Dine feriepenge tæller med")
    # Årsfribeløb = sum of 12 månedsfribeløb (passed in or default)
    fribeloeb_excess = max(work_after_am - aars_fribeloeb, 0)
    # Repayment is krone-for-krone, capped at total SU received
    su_repayment     = min(fribeloeb_excess, su_annual_gross)
    over_fribeloeb   = fribeloeb_excess > 0

    # Interest on the repayment amount (9.75 % p.a.)
    su_repayment_interest = su_repayment * SU_REPAYMENT_INTEREST_RATE

    # Effective SU after repayment (what you actually keep)
    su_annual = su_annual_gross - su_repayment

    # Combined personal income (using effective SU)
    total_personal = su_annual + work_after_am

    # Employment deductions (work portion only)
    beskaeft = min(work_after_am * BESKAEFT_RATE, BESKAEFT_MAX)
    job_frad = min(work_after_am * JOB_FRADRAG_RATE, JOB_FRADRAG_MAX)

    # Bundskat
    bundskat_base = max(total_personal - PERSONFRADRAG, 0)
    bundskat = bundskat_base * BUNDSKAT_RATE

    # Kommuneskat
    kommune_base = max(total_personal - PERSONFRADRAG - beskaeft - job_frad, 0)
    k_pct = kommune_pct / 100.0
    kommuneskat = kommune_base * k_pct

    # Kirkeskat
    kirkeskat = 0.0
    if is_church:
        kirke_base = max(total_personal - PERSONFRADRAG, 0)
        kirkeskat = kirke_base * (kirke_pct / 100.0)

    # Higher brackets (unlikely for most students)
    base_marginal = BUNDSKAT_RATE + k_pct
    eff_mellem = min(MELLEMSKAT_RATE, max(SKATTELOFT - base_marginal, 0))
    mellem_base = max(min(total_personal, TOPSKAT_THRESHOLD)
                      - MELLEMSKAT_THRESHOLD, 0)
    mellemskat = mellem_base * eff_mellem

    # Totals — note: net is based on effective SU (after repayment)
    total_income_tax = bundskat + kommuneskat + kirkeskat + mellemskat
    total_deductions = (work_am_bidrag + work_pension + total_income_tax
                        + su_repayment + su_repayment_interest)
    net_annual = (su_annual_gross + work_annual + work_feriepenge) - total_deductions

    # Monthly helpers
    work_after_am_monthly = work_after_am / 12

    result = {
        "su_annual_gross":         su_annual_gross,
        "su_annual":               su_annual,
        "su_monthly":              su_monthly,
        "su_repayment":            su_repayment,
        "su_repayment_interest":   su_repayment_interest,
        "aars_fribeloeb":          aars_fribeloeb,
        "fribeloeb_excess":        fribeloeb_excess,
        "work_feriepenge":         work_feriepenge,
        "work_gross_annual":       work_annual,
        "work_gross_monthly":      work_gross_monthly,
        "work_pension":            work_pension,
        "work_employee_pension":   work_employee_pension,
        "work_employer_pension":   work_employer_pension,
        "work_total_pension":      work_total_pension,
        "work_am_bidrag":          work_am_bidrag,
        "work_after_am":           work_after_am,
        "total_personal":          total_personal,
        "beskaeft_fradrag":        beskaeft,
        "job_fradrag":             job_frad,
        "bundskat":                bundskat,
        "kommuneskat":             kommuneskat,
        "kirkeskat":               kirkeskat,
        "mellemskat":              mellemskat,
        "total_income_tax":        total_income_tax,
        "total_deductions":        total_deductions,
        "net_annual":              net_annual,
        "net_monthly":             net_annual / 12,
        "over_fribeloeb":          over_fribeloeb,
        "fribeloeb_limit":         FRIBELOEB_LAVESTE_VID,
        "work_after_am_monthly":   work_after_am_monthly,
    }

    # Compute net contribution of feriepenge (difference method)
    if not _skip_ferie and work_feriepenge > 0:
        r_no = compute_student_income(
            su_monthly, work_gross_monthly, pension_pct,
            kommune_pct, kirke_pct, is_church,
            employer_pension_pct, aars_fribeloeb,
            _skip_ferie=True,
        )
        net_ferie = net_annual - r_no["net_annual"]
    else:
        net_ferie = 0.0
    result["net_ferie"] = net_ferie
    result["net_ferie_monthly"] = net_ferie / 12

    return result
