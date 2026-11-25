"""
Tax computation endpoints: full-time, part-time, student, and chart curves.
"""

from fastapi import APIRouter

from ..tax_rules import TaxRules, TaxYearQuery, rules_for_year
from ..chart_curves import hours_samples, sample_boundaries
from ..tax_engine import compute_tax, compute_student_income, monthly_atp
from ..salary_scenarios import (
    comparison_delta,
    compute_employee_scenario,
    project_employee_scenario,
)
from ..models import (
    FullTimeRequest,
    PartTimeRequest,
    StudentRequest,
    ProjectionRequest,
    ComparisonRequest,
    CurveRequest,
    HoursCurveRequest,
    StudentHoursCurveRequest,
)

router = APIRouter(prefix="/api")

def tax_band(r):
    return "Toptopskat" if r["toptopskat"] > 0 else "Topskat" if r["topskat"] > 0 else "Mellemskat" if r["mellemskat"] > 0 else "Bundskat"


def tax_boundaries(rules: TaxRules):
    return [(rules.MELLEMSKAT_THRESHOLD, "Mellemskat"),
            (rules.TOPSKAT_THRESHOLD, "Topskat"),
            (rules.TOPTOPSKAT_THRESHOLD, "Toptopskat")]


# ═══════════════════════════════════════════════════════════════════════
#  SINGLE CALCULATIONS
# ═══════════════════════════════════════════════════════════════════════

@router.post("/compute/fulltime")
def compute_fulltime(req: FullTimeRequest, tax_year: TaxYearQuery = 2026):
    """Full-time salary tax calculation."""
    rules = rules_for_year(tax_year)
    if req.kommune not in rules.KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}

    rates = rules.KOMMUNER[req.kommune]
    res = compute_tax(
        gross_annual=req.gross_annual,
        pension_pct=req.pension_pct / 100,
        kommune_pct=rates["kommuneskat"],
        kirke_pct=rates["kirkeskat"],
        is_church=req.is_church,
        has_employment_income=True,
        employer_pension_pct=req.employer_pension_pct / 100,
        is_hourly=False,
        taxable_benefits_annual=req.taxable_benefits_monthly * 12,
        other_pay_annual=req.other_pay_monthly * 12,
        pretax_deductions_annual=req.pretax_deductions_monthly * 12,
        aftertax_deductions_annual=req.aftertax_deductions_monthly * 12,
        atp_monthly=req.atp_monthly,
        transport_km=req.transport_km,
        union_fees_annual=req.union_fees_annual,
        transport_days=req.transport_days,
        a_kasse_fees_annual=req.a_kasse_fees_annual,
        pension_type=req.pension_type,
        rules=rules,
    )
    return {
        "kommune": req.kommune,
        "kommune_pct": rates["kommuneskat"],
        "kirke_pct": rates["kirkeskat"],
        **res,
    }


@router.post("/compute/parttime")
def compute_parttime(req: PartTimeRequest, tax_year: TaxYearQuery = 2026):
    """Part-time / hourly tax calculation."""
    rules = rules_for_year(tax_year)
    if req.kommune not in rules.KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}

    rates = rules.KOMMUNER[req.kommune]
    gross_annual = req.hourly_rate * req.hours_month * 12

    res = compute_tax(
        gross_annual=gross_annual,
        pension_pct=req.pension_pct / 100,
        kommune_pct=rates["kommuneskat"],
        kirke_pct=rates["kirkeskat"],
        is_church=req.is_church,
        has_employment_income=True,
        employer_pension_pct=req.employer_pension_pct / 100,
        is_hourly=True,
        taxable_benefits_annual=req.taxable_benefits_monthly * 12,
        other_pay_annual=req.other_pay_monthly * 12,
        pretax_deductions_annual=req.pretax_deductions_monthly * 12,
        aftertax_deductions_annual=req.aftertax_deductions_monthly * 12,
        atp_monthly=req.atp_monthly,
        transport_km=req.transport_km,
        union_fees_annual=req.union_fees_annual,
        transport_days=req.transport_days,
        a_kasse_fees_annual=req.a_kasse_fees_annual,
        pension_type=req.pension_type,
        rules=rules,
    )
    return {
        "kommune": req.kommune,
        "kommune_pct": rates["kommuneskat"],
        "kirke_pct": rates["kirkeskat"],
        "hourly_rate": req.hourly_rate,
        "hours_month": req.hours_month,
        **res,
    }


@router.post("/compute/student")
def compute_student(req: StudentRequest, tax_year: TaxYearQuery = 2026):
    """Student (SU + work) tax calculation."""
    rules = rules_for_year(tax_year)
    if req.kommune not in rules.KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}

    rates = rules.KOMMUNER[req.kommune]
    res = compute_student_income(
        su_monthly=rules.SU_UDEBOENDE_MONTH if req.su_monthly is None else req.su_monthly,
        su_months=req.su_months,
        work_gross_monthly=req.work_gross_monthly,
        pension_pct=req.pension_pct / 100,
        kommune_pct=rates["kommuneskat"],
        kirke_pct=rates["kirkeskat"],
        is_church=req.is_church,
        employer_pension_pct=req.employer_pension_pct / 100,
        aars_fribeloeb=req.aars_fribeloeb,
        atp_monthly=req.atp_monthly,
        pretax_deductions_annual=req.pretax_deductions_monthly * 12,
        aftertax_deductions_annual=req.aftertax_deductions_monthly * 12,
        other_pay_annual=req.other_pay_monthly * 12,
        transport_km=req.transport_km,
        union_fees_annual=req.union_fees_annual,
        transport_days=req.transport_days,
        a_kasse_fees_annual=req.a_kasse_fees_annual,
        pension_type=req.pension_type,
        rules=rules,
    )
    return {
        "kommune": req.kommune,
        "kommune_pct": rates["kommuneskat"],
        "kirke_pct": rates["kirkeskat"],
        **res,
    }


@router.post("/compute/projection")
def compute_projection(req: ProjectionRequest, tax_year: TaxYearQuery = 2026):
    """Project salary, tax, compensation, and pension over time."""
    rules = rules_for_year(tax_year)
    return project_employee_scenario(req.scenario, req.settings, rules=rules)


@router.post("/compute/comparison")
def compute_comparison(req: ComparisonRequest, tax_year: TaxYearQuery = 2026):
    """Compare two employee salary scenarios side by side."""
    rules = rules_for_year(tax_year)
    scenario_a = compute_employee_scenario(req.scenario_a, rules=rules)
    if "error" in scenario_a:
        return scenario_a
    scenario_b = compute_employee_scenario(req.scenario_b, rules=rules)
    if "error" in scenario_b:
        return scenario_b

    projection_a = projection_b = projection_delta = None
    settings_a = req.projection_a or req.projection
    settings_b = req.projection_b or req.projection
    if settings_a is not None and settings_b is not None:
        projection_a = project_employee_scenario(req.scenario_a, settings_a, rules=rules)
        if "error" in projection_a:
            return projection_a
        projection_b = project_employee_scenario(req.scenario_b, settings_b, rules=rules)
        if "error" in projection_b:
            return projection_b
        projection_delta = {
            key: projection_b["totals"][key] - projection_a["totals"][key]
            for key in projection_a["totals"]
        }

    return {
        "scenario_a": scenario_a,
        "scenario_b": scenario_b,
        "delta": comparison_delta(scenario_a, scenario_b),
        "projection_a": projection_a,
        "projection_b": projection_b,
        "projection_delta": projection_delta,
    }


# ═══════════════════════════════════════════════════════════════════════
#  CURVE ENDPOINTS (for charts)
# ═══════════════════════════════════════════════════════════════════════

@router.post("/compute/curve")
def compute_curve(req: CurveRequest, tax_year: TaxYearQuery = 2026):
    """Return net-vs-gross curve data for charts."""
    rules = rules_for_year(tax_year)
    if req.kommune not in rules.KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}
    rates = rules.KOMMUNER[req.kommune]

    # Build gross-annual values list
    if req.step_monthly > 0:
        # Fine-grained: step in monthly DKK, converted to annual
        step_annual = req.step_monthly * 12
        gross_start = max(req.min_gross, 0)
        gross_values = []
        g = gross_start
        while g <= req.max_gross:
            gross_values.append(g)
            g += step_annual
    else:
        step = req.max_gross / req.points
        gross_values = [step * i for i in range(req.points + 1)]

    gross_values.append(req.max_gross)

    def evaluate(gross):
        return compute_tax(
            gross, req.pension_pct / 100,
            rates["kommuneskat"], rates["kirkeskat"],
            req.is_church,
            employer_pension_pct=req.employer_pension_pct / 100,
            is_hourly=req.is_hourly,
            atp_monthly=req.atp_monthly,
            other_pay_annual=req.other_pay_monthly * 12,
            taxable_benefits_annual=req.taxable_benefits_monthly * 12,
            pretax_deductions_annual=req.pretax_deductions_monthly * 12,
            aftertax_deductions_annual=req.aftertax_deductions_monthly * 12,
            transport_km=req.transport_km,
            union_fees_annual=req.union_fees_annual,
            transport_days=req.transport_days,
            a_kasse_fees_annual=req.a_kasse_fees_annual,
            pension_type=req.pension_type,
            rules=rules,
        )
    data = []
    for gross, r, boundary in sample_boundaries(gross_values, evaluate, "income_after_am", tax_boundaries(rules)):
        data.append({
            "tax_boundary": boundary,
            "tax_band_after": tax_band(evaluate(min(req.max_gross, gross + 0.001))) if boundary else None,
            "gross_annual": round(gross, 6),
            "gross_monthly": round(gross / 12, 6),
            "net_monthly": round(r["net_monthly"], 2),
            "ferie_net_monthly": round(r["net_ferie_monthly"]),
            "effective_rate": round(r["effective_tax_rate"], 2),
            "tax_band": tax_band(r),
        })
    return data


@router.post("/compute/hours-curve")
def compute_hours_curve(req: HoursCurveRequest, tax_year: TaxYearQuery = 2026):
    """Return net-vs-hours curve data for part-time charts."""
    rules = rules_for_year(tax_year)
    if req.kommune not in rules.KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}
    rates = rules.KOMMUNER[req.kommune]
    def evaluate(h):
        gross_annual = req.hourly_rate * h * 12
        return compute_tax(
            gross_annual, req.pension_pct / 100,
            rates["kommuneskat"], rates["kirkeskat"],
            req.is_church,
            employer_pension_pct=req.employer_pension_pct / 100,
            is_hourly=True,
            atp_monthly=monthly_atp(h) if req.atp_auto else req.atp_monthly,
            other_pay_annual=req.other_pay_monthly * 12,
            taxable_benefits_annual=req.taxable_benefits_monthly * 12,
            pretax_deductions_annual=req.pretax_deductions_monthly * 12,
            aftertax_deductions_annual=req.aftertax_deductions_monthly * 12,
            transport_km=req.transport_km,
            union_fees_annual=req.union_fees_annual,
            transport_days=req.transport_days,
            a_kasse_fees_annual=req.a_kasse_fees_annual,
            pension_type=req.pension_type,
            rules=rules,
        )
    data = []
    values = hours_samples(req.max_hours, 5, req.atp_auto)
    for h, r, boundary in sample_boundaries(values, evaluate, "income_after_am", tax_boundaries(rules)):
        data.append({
            "tax_boundary": boundary,
            "tax_band_after": tax_band(evaluate(min(req.max_hours, h + 0.00001))) if boundary else None,
            "hours_month": h,
            "gross_monthly": round(req.hourly_rate * h, 6),
            "net_monthly": round(r["net_monthly"], 2),
            "ferie_net_monthly": round(r["net_ferie_monthly"]),
            "effective_rate": round(r["effective_tax_rate"], 2),
            "tax_band": tax_band(r),
        })
    return data


@router.post("/compute/student-hours-curve")
def compute_student_hours_curve(req: StudentHoursCurveRequest, tax_year: TaxYearQuery = 2026):
    """Return net-vs-hours curve data for student (SU + work) charts."""
    rules = rules_for_year(tax_year)
    if req.kommune not in rules.KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}
    rates = rules.KOMMUNER[req.kommune]
    def evaluate(h):
        work_gross_monthly = req.hourly_rate * h
        return compute_student_income(
            su_monthly=rules.SU_UDEBOENDE_MONTH if req.su_monthly is None else req.su_monthly,
            su_months=req.su_months,
            work_gross_monthly=work_gross_monthly,
            pension_pct=req.pension_pct / 100,
            kommune_pct=rates["kommuneskat"],
            kirke_pct=rates["kirkeskat"],
            is_church=req.is_church,
            employer_pension_pct=req.employer_pension_pct / 100,
            aars_fribeloeb=req.aars_fribeloeb,
            pension_type=req.pension_type,
            rules=rules,
            atp_monthly=monthly_atp(h) if req.atp_auto else req.atp_monthly,
            other_pay_annual=req.other_pay_monthly * 12,
            pretax_deductions_annual=req.pretax_deductions_monthly * 12,
            aftertax_deductions_annual=req.aftertax_deductions_monthly * 12,
            transport_km=req.transport_km,
            transport_days=req.transport_days,
            union_fees_annual=req.union_fees_annual,
            a_kasse_fees_annual=req.a_kasse_fees_annual,
        )
    data = []
    values = hours_samples(req.max_hours, req.step, req.atp_auto)
    limit = evaluate(0)["aars_fribeloeb"]
    for h, r, boundary in sample_boundaries(values, evaluate, "work_after_am", [(limit, "fribeloeb")]):
        data.append({
            "effective_rate": round(r["effective_tax_rate"], 2),
            "fribeloeb_boundary": boundary is not None,
            "over_fribeloeb_after": evaluate(min(req.max_hours, h + 0.00001))["over_fribeloeb"] if boundary else None,
            "hours_month": h,
            "net_monthly": round(r["net_monthly"], 2),
            "net_annual": round(r["net_annual"]),
            "su_gross_monthly": round(r["su_annual_gross"] / 12),
            "work_gross_monthly": round(req.hourly_rate * h, 6),
            "feriepenge_monthly": round(r["work_feriepenge"] / 12),
            "deductions_monthly": round(r["total_deductions"] / 12),
            "over_fribeloeb": r["over_fribeloeb"],
        })
    return data
