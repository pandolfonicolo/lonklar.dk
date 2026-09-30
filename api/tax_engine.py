"""Annual Danish salary/SU estimates for 2026, averaged over twelve months.

The ordinary-cash estimate excludes the net holiday-pay contribution. It is
not a tax-card withholding calculation. Special relief and SU periodisation
remain outside this model; the UI describes those limitations.
"""

from __future__ import annotations

from .data import (
    AM_RATE,
    PERSONFRADRAG,
    BUNDSKAT_RATE,
    MELLEMSKAT_THRESHOLD, MELLEMSKAT_RATE,
    TOPSKAT_THRESHOLD,    TOPSKAT_RATE,
    TOPTOPSKAT_THRESHOLD, TOPTOPSKAT_RATE,
    SKATTELOFT,
    BESKAEFT_RATE, BESKAEFT_MAX,
    JOB_FRADRAG_THRESHOLD, JOB_FRADRAG_RATE, JOB_FRADRAG_MAX,
    FRIBELOEB_LAVESTE_VID,
    FRIBELOEB_LAVESTE_UNGDOM, FRIBELOEB_MELLEMSTE,
    SU_UDEBOENDE_MONTH, SU_LOAN_MONTHLY,
    CALCULATION_VERSION,
    FERIETILLAEG_RATE, FERIEPENGE_RATE,
    BEFORDRING_RATE_LOW, BEFORDRING_RATE_HIGH,
    BEFORDRING_THRESHOLD, BEFORDRING_HIGH_THRESHOLD,
    FAGFORENING_MAX, ATP_EMPLOYER_FACTOR,
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


def monthly_atp(hours_month: float) -> float:
    """Employee share, ordinary monthly A-rate payroll (virk.dk)."""
    if hours_month < 39:
        return 0.0
    if hours_month < 78:
        return 33.0
    if hours_month < 117:
        return 66.0
    return 99.0


def compute_progressive_tax(personal_income: float, kommune_pct: float) -> tuple[float, float, float]:
    """PSL §19: only bundskat + kommune + mellemskat share the 44.57% ceiling."""
    mellem_rate = min(MELLEMSKAT_RATE, max(SKATTELOFT - BUNDSKAT_RATE - kommune_pct / 100, 0))
    return (
        max(personal_income - MELLEMSKAT_THRESHOLD, 0) * mellem_rate,
        max(personal_income - TOPSKAT_THRESHOLD, 0) * TOPSKAT_RATE,
        max(personal_income - TOPTOPSKAT_THRESHOLD, 0) * TOPTOPSKAT_RATE,
    )


def employment_deduction_base(am_basis: float, qualifying_pension: float, atp_annual: float) -> float:
    """LL §9 J/K: before AM, including qualifying payroll pension and reported ATP.

    Standard pension inputs assume deductible employer-administered schemes.
    ATP reported by the employer includes both employer and employee shares.
    Section 53A contributions are already in the salary AM base.
    """
    return max(am_basis + qualifying_pension + atp_annual * (1 + ATP_EMPLOYER_FACTOR), 0)


def compute_su_repayment(excess: float, su_received: float) -> tuple[float, float]:
    """Ordinary SU-only estimate; excludes loans, periodisation and later interest.

    su.dk: half of the first middle-minus-youth-lowest band, full excess above
    it, capped at received SU. A fixed 7% supplement applies above one monthly
    away-from-home SU payment plus one normal monthly SU loan.
    """
    excess = max(excess, 0)
    discount_band = FRIBELOEB_MELLEMSTE - FRIBELOEB_LAVESTE_UNGDOM
    principal = min(max(su_received, 0), excess - min(excess, discount_band) / 2)
    supplement = principal * 0.07 if principal > SU_UDEBOENDE_MONTH + SU_LOAN_MONTHLY else 0.0
    return principal, supplement


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
    pension_type: str = "standard",
    _skip_ferie: bool = False,
    transport_days: int = 218,
    a_kasse_fees_annual: float = 0.0,
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
    employer_pension_pct   Employer pension contribution ON TOP (0–1).
    pension_type           standard → normal Danish pension treatment.
                           section53a → pension contributions taxed as salary.
    is_hourly              True → 12.5% feriepenge; False → 1% ferietillæg.
    taxable_benefits_annual  Non-cash benefits that add to taxable income
                             (e.g. fri telefon, sundhedsforsikring).
    other_pay_annual       Extra cash compensation (broadband, allowances, etc.).
    pretax_deductions_annual  Employer deductions from pay before tax (e.g. DSB card).
    aftertax_deductions_annual  Deductions after tax (canteen, clubs, etc.).
    atp_monthly            ATP employee contribution per month.
    transport_km           Round-trip daily commute km (>24 → befordringsfradrag).
    union_fees_annual      Annual trade union fees (max 7,000 deductible).
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

    # 1) Pension (on base salary only, not on feriepenge/benefits)
    employee_pension = gross_annual * pension_pct          # deducted from gross
    employer_pension = gross_annual * employer_pension_pct # on top
    total_pension    = employee_pension + employer_pension
    is_section53a = pension_type == "section53a"
    pension = employee_pension  # cash deduction in both pension models

    # Total taxable gross = cash pay + taxable non-cash benefits.
    # Section 53A employer pension is also taxed as salary when contributed.
    taxable_employer_pension = employer_pension if is_section53a else 0.0
    total_gross = total_cash + taxable_benefits_annual + taxable_employer_pension
    atp_annual = atp_monthly * 12
    pension_tax_deduction = 0.0 if is_section53a else employee_pension
    am_basis = max(total_gross - pension_tax_deduction - atp_annual, 0)

    # 2) AM-bidrag
    am_bidrag = am_basis * AM_RATE if has_employment_income else 0.0
    income_after_am = am_basis - am_bidrag

    # 3) Employment deductions: pre-AM base, including eligible pension/ATP.
    employment_base = employment_deduction_base(
        am_basis, 0 if is_section53a else total_pension, atp_annual
    )
    if has_employment_income:
        beskaeft = min(employment_base * BESKAEFT_RATE, BESKAEFT_MAX)
        # Jobfradrag: only on income ABOVE bundgrænse (ligningsloven § 9 K)
        job_frad = min(max(employment_base - JOB_FRADRAG_THRESHOLD, 0)
                       * JOB_FRADRAG_RATE, JOB_FRADRAG_MAX)
    else:
        beskaeft = job_frad = 0.0

    # 3b) Ligningsmæssige fradrag (reduce kommune/kirke base, NOT bundskat base)
    befordring = compute_befordringsfradrag(transport_km, transport_days) if transport_km > 0 else 0.0
    union_deduction = min(max(union_fees_annual, 0), FAGFORENING_MAX)
    a_kasse_deduction = max(a_kasse_fees_annual, 0)
    lignings_fradrag = befordring + union_deduction + a_kasse_deduction

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

    # 6) Kirkeskat (also reduced by all ligningsmæssige fradrag)
    kirkeskat = 0.0
    if is_church:
        kirke_base = max(income_after_am - PERSONFRADRAG - beskaeft - job_frad - lignings_fradrag, 0)
        kirkeskat = kirke_base * (kirke_pct / 100.0)

    # Each progressive tax continues above its own threshold.
    mellemskat, topskat, toptopskat = compute_progressive_tax(income_after_am, kommune_pct)

    # 8) Totals
    total_income_tax = (bundskat + kommuneskat + kirkeskat
                        + mellemskat + topskat + toptopskat)
    total_deductions = am_bidrag + pension + total_income_tax + atp_annual
    # Net = total cash - deductions - after-tax items
    # (taxable benefits are non-cash so not in net)
    net_annual = total_cash - total_deductions - aftertax_deductions_annual

    result = {
        "calculation_version": CALCULATION_VERSION,
        "employment_deduction_base": employment_base,
        "a_kasse_deduction": a_kasse_deduction,
        "transport_days": transport_days,
        "gross_annual":        gross_annual,
        "feriepenge":          feriepenge,
        "other_pay":           other_pay_annual,
        "pretax_deductions":   pretax_deductions_annual,
        "aftertax_deductions": aftertax_deductions_annual,
        "taxable_benefits":    taxable_benefits_annual,
        "total_gross":         total_gross,
        "taxable_income":      am_basis,
        "pension_type":        pension_type,
        "pension":             pension,
        "employee_pension":    employee_pension,
        "employer_pension":    employer_pension,
        "total_pension":       total_pension,
        "taxable_employer_pension": taxable_employer_pension,
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
        "effective_tax_rate":  ((am_bidrag + total_income_tax) / total_gross * 100)
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
            pension_type=pension_type,
            _skip_ferie=True,
            transport_days=transport_days,
            a_kasse_fees_annual=a_kasse_fees_annual,
        )
        net_ferie = net_annual - r_no["net_annual"]
    else:
        net_ferie = 0.0
    result["net_ferie"] = net_ferie
    result["net_ferie_monthly"] = net_ferie / 12
    result["ordinary_net_monthly"] = (net_annual - net_ferie) / 12

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
    atp_monthly: float = 0.0,
    pretax_deductions_annual: float = 0.0,
    aftertax_deductions_annual: float = 0.0,
    other_pay_annual: float = 0.0,
    transport_km: float = 0.0,
    union_fees_annual: float = 0.0,
    pension_type: str = "standard",
    su_months: int = 12,
    _skip_ferie: bool = False,
    transport_days: int = 218,
    a_kasse_fees_annual: float = 0.0,
) -> dict:
    """Combined net income: SU (no AM) + work wages (AM applies).

    The personfradrag covers the combined personal income.
    If aars_fribeloeb is not given, defaults to 12 × laveste videregående.
    """
    if aars_fribeloeb is None:
        aars_fribeloeb = FRIBELOEB_LAVESTE_VID * 12
    su_annual_gross = su_monthly * su_months
    work_annual     = work_gross_monthly * 12

    # Feriepenge (12.5 % for hourly student jobs — counts towards egenindkomst)
    work_feriepenge = 0.0 if _skip_ferie else work_annual * FERIEPENGE_RATE

    # Total cash = work salary + feriepenge + other pay - pretax deductions
    total_work_cash = work_annual + work_feriepenge + other_pay_annual - pretax_deductions_annual

    # Work side
    work_employee_pension = work_annual * pension_pct
    work_employer_pension = work_annual * employer_pension_pct  # on top
    work_total_pension    = work_employee_pension + work_employer_pension
    is_section53a = pension_type == "section53a"
    work_pension          = work_employee_pension  # cash deduction in both pension models
    work_taxable_employer_pension = work_employer_pension if is_section53a else 0.0
    work_pension_tax_deduction = 0.0 if is_section53a else work_employee_pension
    atp_annual = atp_monthly * 12
    work_am_basis  = max(0,
        total_work_cash
        + work_taxable_employer_pension
        - work_pension_tax_deduction
        - atp_annual
    )
    work_am_bidrag = work_am_basis * AM_RATE
    work_after_am  = work_am_basis - work_am_bidrag

    # ── Fribeløb check & SU repayment ──────────────────────────────
    # Egenindkomst includes feriepenge (su.dk: "Dine feriepenge tæller med")
    # Årsfribeløb = sum of 12 månedsfribeløb (passed in or default)
    fribeloeb_excess = max(work_after_am - aars_fribeloeb, 0)
    su_repayment, su_repayment_supplement = compute_su_repayment(fribeloeb_excess, su_annual_gross)
    over_fribeloeb = fribeloeb_excess > 0

    # Repayment is a later assessment, not a current monthly payroll deduction.
    # A subsequent tax adjustment and timed interest are not estimated here.
    su_annual = su_annual_gross
    total_personal = su_annual_gross + work_after_am
    employment_base = employment_deduction_base(
        work_am_basis, 0 if is_section53a else work_total_pension, atp_annual
    )
    beskaeft = min(employment_base * BESKAEFT_RATE, BESKAEFT_MAX)
    job_frad = min(max(employment_base - JOB_FRADRAG_THRESHOLD, 0)
                   * JOB_FRADRAG_RATE, JOB_FRADRAG_MAX)

    # Ligningsmæssige fradrag (reduce kommune/kirke base)
    befordring = compute_befordringsfradrag(transport_km, transport_days) if transport_km > 0 else 0.0
    union_deduction = min(max(union_fees_annual, 0), FAGFORENING_MAX)
    a_kasse_deduction = max(a_kasse_fees_annual, 0)
    lignings_fradrag = befordring + union_deduction + a_kasse_deduction

    # Bundskat
    bundskat_base = max(total_personal - PERSONFRADRAG, 0)
    bundskat = bundskat_base * BUNDSKAT_RATE

    # Kommuneskat
    kommune_base = max(total_personal - PERSONFRADRAG - beskaeft - job_frad - lignings_fradrag, 0)
    k_pct = kommune_pct / 100.0
    kommuneskat = kommune_base * k_pct

    # Kirkeskat (reduced by ligningsmæssige fradrag: beskaeft + jobfradrag)
    kirkeskat = 0.0
    if is_church:
        kirke_base = max(total_personal - PERSONFRADRAG - beskaeft - job_frad - lignings_fradrag, 0)
        kirkeskat = kirke_base * (kirke_pct / 100.0)

    mellemskat, topskat, toptopskat = compute_progressive_tax(total_personal, kommune_pct)
    total_income_tax = bundskat + kommuneskat + kirkeskat + mellemskat + topskat + toptopskat
    total_deductions = work_am_bidrag + work_pension + total_income_tax + atp_annual
    # Net = SU gross + work cash - deductions - after-tax items
    net_annual = (su_annual_gross + total_work_cash) - total_deductions - aftertax_deductions_annual

    # Monthly helpers
    work_after_am_monthly = work_after_am / 12

    result = {
        "calculation_version": CALCULATION_VERSION,
        "employment_deduction_base": employment_base,
        "a_kasse_deduction": a_kasse_deduction,
        "transport_days": transport_days,
        "su_annual_gross":         su_annual_gross,
        "su_annual":               su_annual,
        "su_monthly":              su_monthly,
        "su_repayment":            su_repayment,
        "su_repayment_interest":   None,  # requires assessment/payment dates
        "su_repayment_supplement": su_repayment_supplement,
        "su_repayment_total":      su_repayment + su_repayment_supplement,
        "su_months":               su_months,
        "effective_tax_rate":      ((work_am_bidrag + total_income_tax) /
                                     (su_annual_gross + total_work_cash + work_taxable_employer_pension) * 100)
                                     if su_annual_gross + total_work_cash + work_taxable_employer_pension > 0 else 0,
        "aars_fribeloeb":          aars_fribeloeb,
        "fribeloeb_excess":        fribeloeb_excess,
        "work_feriepenge":         work_feriepenge,
        "work_gross_annual":       work_annual,
        "work_gross_monthly":      work_gross_monthly,
        "work_pension":            work_pension,
        "pension_type":            pension_type,
        "work_employee_pension":   work_employee_pension,
        "work_employer_pension":   work_employer_pension,
        "work_total_pension":      work_total_pension,
        "work_taxable_employer_pension": work_taxable_employer_pension,
        "work_taxable_income":     work_am_basis,
        "work_am_bidrag":          work_am_bidrag,
        "work_after_am":           work_after_am,
        "atp_annual":              atp_annual,
        "other_pay":               other_pay_annual,
        "pretax_deductions":       pretax_deductions_annual,
        "aftertax_deductions":     aftertax_deductions_annual,
        "befordring":              befordring,
        "union_deduction":         union_deduction,
        "lignings_fradrag":        lignings_fradrag,
        "total_personal":          total_personal,
        "beskaeft_fradrag":        beskaeft,
        "job_fradrag":             job_frad,
        "bundskat":                bundskat,
        "kommuneskat":             kommuneskat,
        "kirkeskat":               kirkeskat,
        "mellemskat":              mellemskat,
        "topskat":                 topskat,
        "toptopskat":              toptopskat,
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
            atp_monthly, pretax_deductions_annual,
            aftertax_deductions_annual, other_pay_annual,
            transport_km, union_fees_annual,
            pension_type=pension_type,
            su_months=su_months,
            _skip_ferie=True,
            transport_days=transport_days,
            a_kasse_fees_annual=a_kasse_fees_annual,
        )
        net_ferie = net_annual - r_no["net_annual"]
    else:
        net_ferie = 0.0
    result["net_ferie"] = net_ferie
    result["net_ferie_monthly"] = net_ferie / 12
    result["ordinary_net_monthly"] = (net_annual - net_ferie) / 12

    return result
