"""
Full-time employment view — progressive disclosure.
"""

import streamlit as st

from components.inputs import salary_input, pct_slider, period_clear
from components.benefits import render_benefits
from components.results import render_result
from components.charts import render_curve
from components.tooltips import TAX_TIPS
from components.theme import step_header, results_banner, locked_step
from tax_engine import compute_tax


def render(
    kommune_pct, kirke_pct, is_church, selected_kommune,
    period, show_eur, rate,
):
    period_clear("ft", period)

    # ── Step 1 — Salary ───────────────────────────────────────────────
    with st.container(border=True):
        step_header(1, "Your gross salary")
        gross_annual = salary_input("ft", period)

    # Guard: need salary to continue
    if gross_annual <= 0:
        locked_step(2, "Pension", "Enter your salary first")
        locked_step(3, "Pay, benefits & deductions")
        st.info(
            "Enter your gross salary above to see your tax breakdown.",
            icon=":material/arrow_upward:",
        )
        return

    # ── Step 2 — Pension ──────────────────────────────────────────────
    with st.container(border=True):
        step_header(2, "Pension")
        st.caption(
            "Most Danish employers contribute to pension on top of your "
            "salary. A typical split is 4 % employee + 8 % employer."
        )
        c1, c2 = st.columns(2)
        with c1:
            emp_pct = pct_slider(
                "Your contribution", 0.0, 15.0, 4.0, 0.5, "ft_pension",
                help_text=TAX_TIPS["pension"],
            )
        with c2:
            er_pct = pct_slider(
                "Employer on top", 0.0, 20.0, 8.0, 0.5, "ft_er_pension",
                help_text="Employer's pension contribution — goes straight to your "
                          "pension fund. Not included in your taxable income.",
            )

    # ── Step 3 — Optional extras ──────────────────────────────────────
    with st.container(border=True):
        step_header(3, "Pay, benefits & deductions (optional)")
        with st.expander("Configure extras", expanded=False,
                         icon=":material/tune:"):
            other_pay, tax_ben, pretax, aftertax, atp_mo = render_benefits("ft", period)

    # ── Compute ───────────────────────────────────────────────────────
    res = compute_tax(
        gross_annual,
        pension_pct=emp_pct / 100,
        kommune_pct=kommune_pct,
        kirke_pct=kirke_pct,
        is_church=is_church,
        employer_pension_pct=er_pct / 100,
        is_hourly=False,
        taxable_benefits_annual=tax_ben * 12,
        other_pay_annual=other_pay * 12,
        pretax_deductions_annual=pretax * 12,
        aftertax_deductions_annual=aftertax * 12,
        atp_monthly=atp_mo,
    )

    monthly_gross = gross_annual / 12

    # ── Results ───────────────────────────────────────────────────────
    results_banner()
    render_result(res, show_eur, rate, monthly_gross, period)

    # ── Charts ────────────────────────────────────────────────────────
    render_curve(
        emp_pct / 100, kommune_pct, kirke_pct, is_church,
        gross_annual, show_eur, rate,
        title_prefix="Full-time",
        employer_pension_pct=er_pct / 100,
        is_hourly=False,
    )
