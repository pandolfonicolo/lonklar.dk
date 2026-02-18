"""
Tax computation endpoints: full-time, part-time, student, and chart curves.
"""

from fastapi import APIRouter

from ..data import KOMMUNER
from ..tax_engine import compute_tax, compute_student_income
from ..models import (
    FullTimeRequest,
    PartTimeRequest,
    StudentRequest,
    CurveRequest,
    HoursCurveRequest,
)

router = APIRouter(prefix="/api")


# ═══════════════════════════════════════════════════════════════════════
#  SINGLE CALCULATIONS
# ═══════════════════════════════════════════════════════════════════════

@router.post("/compute/fulltime")
def compute_fulltime(req: FullTimeRequest):
    """Full-time salary tax calculation."""
    if req.kommune not in KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}

    rates = KOMMUNER[req.kommune]
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
    )
    return {
        "kommune": req.kommune,
        "kommune_pct": rates["kommuneskat"],
        "kirke_pct": rates["kirkeskat"],
        **res,
    }


@router.post("/compute/parttime")
def compute_parttime(req: PartTimeRequest):
    """Part-time / hourly tax calculation."""
    if req.kommune not in KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}

    rates = KOMMUNER[req.kommune]
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
def compute_student(req: StudentRequest):
    """Student (SU + work) tax calculation."""
    if req.kommune not in KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}

    rates = KOMMUNER[req.kommune]
    res = compute_student_income(
        su_monthly=req.su_monthly,
        work_gross_monthly=req.work_gross_monthly,
        pension_pct=req.pension_pct / 100,
        kommune_pct=rates["kommuneskat"],
        kirke_pct=rates["kirkeskat"],
        is_church=req.is_church,
        employer_pension_pct=req.employer_pension_pct / 100,
        aars_fribeloeb=req.aars_fribeloeb,
    )
    return {
        "kommune": req.kommune,
        "kommune_pct": rates["kommuneskat"],
        "kirke_pct": rates["kirkeskat"],
        **res,
    }


# ═══════════════════════════════════════════════════════════════════════
#  CURVE ENDPOINTS (for charts)
# ═══════════════════════════════════════════════════════════════════════

@router.post("/compute/curve")
def compute_curve(req: CurveRequest):
    """Return net-vs-gross curve data for charts."""
    if req.kommune not in KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}
    rates = KOMMUNER[req.kommune]

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

    data = []
    for gross in gross_values:
        r = compute_tax(
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
        )
        data.append({
            "gross_annual": round(gross),
            "gross_monthly": round(gross / 12),
            "net_monthly": round(r["net_monthly"]),
            "effective_rate": round(r["effective_tax_rate"], 2),
        })
    return data


@router.post("/compute/hours-curve")
def compute_hours_curve(req: HoursCurveRequest):
    """Return net-vs-hours curve data for part-time charts."""
    if req.kommune not in KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}
    rates = KOMMUNER[req.kommune]
    data = []
    for h in range(0, req.max_hours + 1, 5):
        gross_annual = req.hourly_rate * h * 12
        r = compute_tax(
            gross_annual, req.pension_pct / 100,
            rates["kommuneskat"], rates["kirkeskat"],
            req.is_church,
            employer_pension_pct=req.employer_pension_pct / 100,
            is_hourly=True,
            atp_monthly=req.atp_monthly,
            other_pay_annual=req.other_pay_monthly * 12,
            taxable_benefits_annual=req.taxable_benefits_monthly * 12,
            pretax_deductions_annual=req.pretax_deductions_monthly * 12,
            aftertax_deductions_annual=req.aftertax_deductions_monthly * 12,
            transport_km=req.transport_km,
            union_fees_annual=req.union_fees_annual,
        )
        data.append({
            "hours_month": h,
            "gross_monthly": round(gross_annual / 12),
            "net_monthly": round(r["net_monthly"]),
            "effective_rate": round(r["effective_tax_rate"], 2),
        })
    return data
