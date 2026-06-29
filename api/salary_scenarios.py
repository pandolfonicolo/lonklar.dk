"""
Reusable salary-scenario calculations for comparisons and projections.

The functions in this module deliberately wrap ``compute_tax`` instead of
reimplementing salary math. That keeps wizard results, comparisons, and
projections aligned.
"""

from __future__ import annotations

from .data import KOMMUNER
from .models import EmployeeScenarioRequest, ProjectionSettings
from .tax_engine import compute_tax


def scenario_gross_annual(scenario: EmployeeScenarioRequest) -> float:
    if scenario.employment_type == "parttime":
        return (scenario.hourly_rate or 0.0) * (scenario.hours_month or 0.0) * 12
    return scenario.gross_annual or 0.0


def compute_employee_scenario(scenario: EmployeeScenarioRequest) -> dict:
    if scenario.kommune not in KOMMUNER:
        return {"error": f"Unknown kommune: {scenario.kommune}"}

    rates = KOMMUNER[scenario.kommune]
    gross_annual = scenario_gross_annual(scenario)
    result = compute_tax(
        gross_annual=gross_annual,
        pension_pct=scenario.pension_pct / 100,
        kommune_pct=rates["kommuneskat"],
        kirke_pct=rates["kirkeskat"],
        is_church=scenario.is_church,
        has_employment_income=True,
        employer_pension_pct=scenario.employer_pension_pct / 100,
        is_hourly=scenario.employment_type == "parttime",
        taxable_benefits_annual=scenario.taxable_benefits_monthly * 12,
        other_pay_annual=scenario.other_pay_monthly * 12,
        pretax_deductions_annual=scenario.pretax_deductions_monthly * 12,
        aftertax_deductions_annual=scenario.aftertax_deductions_monthly * 12,
        atp_monthly=scenario.atp_monthly,
        transport_km=scenario.transport_km,
        union_fees_annual=scenario.union_fees_annual,
        pension_type=scenario.pension_type,
    )
    return {
        "employment_type": scenario.employment_type,
        "kommune": scenario.kommune,
        "kommune_pct": rates["kommuneskat"],
        "kirke_pct": rates["kirkeskat"],
        "hourly_rate": scenario.hourly_rate,
        "hours_month": scenario.hours_month,
        **result,
    }


def compensation_annual(result: dict) -> float:
    taxable_employer_pension = result.get("taxable_employer_pension", 0.0)
    return (
        result.get("total_gross", 0.0)
        + result.get("employer_pension", 0.0)
        - taxable_employer_pension
    )


def comparison_delta(a: dict, b: dict) -> dict:
    tax_a = a.get("am_bidrag", 0.0) + a.get("total_income_tax", 0.0)
    tax_b = b.get("am_bidrag", 0.0) + b.get("total_income_tax", 0.0)
    return {
        "net_monthly": b.get("net_monthly", 0.0) - a.get("net_monthly", 0.0),
        "net_annual": b.get("net_annual", 0.0) - a.get("net_annual", 0.0),
        "tax": tax_b - tax_a,
        "employee_pension": b.get("employee_pension", 0.0) - a.get("employee_pension", 0.0),
        "employer_pension": b.get("employer_pension", 0.0) - a.get("employer_pension", 0.0),
        "total_pension": b.get("total_pension", 0.0) - a.get("total_pension", 0.0),
        "total_compensation": compensation_annual(b) - compensation_annual(a),
    }


def project_employee_scenario(
    scenario: EmployeeScenarioRequest,
    settings: ProjectionSettings,
) -> dict:
    growth = settings.salary_growth_pct / 100
    return_rate = settings.annual_return_pct / 100
    base_gross = scenario_gross_annual(scenario)
    balance = 0.0
    rows = []

    for year in range(1, settings.years + 1):
        projected = scenario.model_copy(
            update={"gross_annual": base_gross * ((1 + growth) ** (year - 1))}
        )
        if projected.employment_type == "parttime" and scenario.hours_month:
            projected = projected.model_copy(
                update={"hourly_rate": (scenario.hourly_rate or 0.0) * ((1 + growth) ** (year - 1))}
            )
        result = compute_employee_scenario(projected)
        if "error" in result:
            return result

        employee_pension = result["employee_pension"]
        employer_pension = result["employer_pension"]
        total_pension = result["total_pension"]
        balance = balance * (1 + return_rate) + total_pension
        total_comp = compensation_annual(result)

        rows.append({
            "year": year,
            "gross_annual": result["gross_annual"],
            "net_annual": result["net_annual"],
            "net_monthly": result["net_monthly"],
            "tax": result["am_bidrag"] + result["total_income_tax"],
            "employee_pension": employee_pension,
            "employer_pension": employer_pension,
            "total_pension": total_pension,
            "total_compensation": total_comp,
            "projected_pension_balance": balance,
        })

    return {
        "settings": settings.model_dump(),
        "years": rows,
        "totals": {
            "employee_pension": sum(row["employee_pension"] for row in rows),
            "employer_pension": sum(row["employer_pension"] for row in rows),
            "total_pension": sum(row["total_pension"] for row in rows),
            "net_annual": sum(row["net_annual"] for row in rows),
            "tax": sum(row["tax"] for row in rows),
            "total_compensation": sum(row["total_compensation"] for row in rows),
            "projected_pension_balance": balance,
        },
    }
