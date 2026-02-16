"""
Student helpers — fribeløb math utilities.
"""

from data import FERIEPENGE_RATE, AM_RATE


def egenindkomst_from_gross(gross_monthly, pension_pct):
    """Approximate egenindkomst from gross (used for fribeløb checks).

    Egenindkomst ≈ (gross + feriepenge − pension) × (1 − AM_RATE)
    """
    ferie = gross_monthly * FERIEPENGE_RATE
    pension = gross_monthly * pension_pct
    am_basis = gross_monthly + ferie - pension
    return am_basis * (1 - AM_RATE)


def compute_max_gross_monthly(pension_pct, target_eigen):
    """Max gross monthly salary to stay under a given egenindkomst."""
    denom = (1 + FERIEPENGE_RATE) - pension_pct
    if denom <= 0:
        return 0
    return target_eigen / ((1 - AM_RATE) * denom)
