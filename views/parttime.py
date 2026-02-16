"""
Part-time / hourly employment view — progressive disclosure.
"""

import streamlit as st
import plotly.graph_objects as go

from components.inputs import pct_slider, int_slider, period_clear
from components.benefits import render_benefits
from components.results import render_result
from components.charts import render_curve
from components.formatting import fmt
from components.tooltips import TAX_TIPS
from components.theme import step_header, results_banner, locked_step
from components.constants import (
    ATP_MIN_HOURS_WEEK, ATP_MIN_HOURS_MONTH,
    COLLECTIVE_MIN_HOURS_WEEK, COLLECTIVE_MIN_HOURS_MONTH,
)
from tax_engine import compute_tax


def render(
    kommune_pct, kirke_pct, is_church, selected_kommune,
    period, show_eur, rate,
):
    period_clear("pt", period)

    # ── Step 1 — Hourly rate & hours ──────────────────────────────────
    with st.container(border=True):
        step_header(1, "Your working hours")
        hourly_rate = st.number_input(
            "Hourly rate (DKK/hour)", value=180, step=10, min_value=0,
            help="Your gross hourly rate before any deductions.",
        )
        hours_month = int_slider(
            "Hours per month", 0, 300, 80, 5, "pt_hours",
            help_text="Average working hours per month (37 h/week ≈ 160 h/month).",
        )

        # Working hours guidance
        hours_week = hours_month * 12 / 52
        if hours_week < ATP_MIN_HOURS_WEEK and hours_month > 0:
            st.warning(
                f"At ~{hours_week:.1f} h/week you are below **{ATP_MIN_HOURS_WEEK} h/week**, "
                f"the minimum for ATP (labour-market supplementary pension). "
                f"ATP is a mandatory retirement savings that both you and your employer "
                f"pay into — but only if you work at least {ATP_MIN_HOURS_WEEK} h/week "
                f"(~{ATP_MIN_HOURS_MONTH} h/month). Below that threshold no ATP is "
                f"contributed and you miss out on this retirement savings.",
                icon=":material/warning:",
            )
        elif hours_week < COLLECTIVE_MIN_HOURS_WEEK and hours_month > 0:
            st.info(
                f"At ~{hours_week:.1f} h/week you are above the ATP threshold but "
                f"below **{COLLECTIVE_MIN_HOURS_WEEK} h/week**, which is the typical "
                f"minimum in Danish collective agreements (overenskomster). "
                f"Most employers follow these agreements, so check your contract "
                f"for any minimum-hours requirement.",
                icon=":material/info:",
            )

    monthly_gross = hourly_rate * hours_month
    gross_annual = monthly_gross * 12

    # Guard: need meaningful input before showing more
    if hourly_rate <= 0 or hours_month <= 0:
        locked_step(2, "Pension", "Enter your rate & hours first")
        locked_step(3, "Pay, benefits & deductions")
        st.info(
            "Set your hourly rate and hours above to see your tax breakdown.",
            icon=":material/arrow_upward:",
        )
        return

    # ── Step 2 — Pension ──────────────────────────────────────────────
    with st.container(border=True):
        step_header(2, "Pension")
        st.caption(
            "Many part-time contracts don't include pension. "
            "Leave at 0 % if none — otherwise enter your split."
        )
        c1, c2 = st.columns(2)
        with c1:
            emp_pct = pct_slider(
                "Your contribution", 0.0, 15.0, 0.0, 0.5, "pt_pension",
                help_text=TAX_TIPS["pension"],
            )
        with c2:
            er_pct = pct_slider(
                "Employer on top", 0.0, 20.0, 0.0, 0.5, "pt_er_pension",
                help_text="Employer's pension contribution — goes to your pension fund.",
            )

    # ── Step 3 — Optional extras ──────────────────────────────────────
    with st.container(border=True):
        step_header(3, "Pay, benefits & deductions (optional)")
        with st.expander("Configure extras", expanded=False,
                         icon=":material/tune:"):
            other_pay, tax_ben, pretax, aftertax, atp_mo = render_benefits("pt", period)

    # ── Compute ───────────────────────────────────────────────────────
    res = compute_tax(
        gross_annual,
        pension_pct=emp_pct / 100,
        kommune_pct=kommune_pct,
        kirke_pct=kirke_pct,
        is_church=is_church,
        employer_pension_pct=er_pct / 100,
        is_hourly=True,
        taxable_benefits_annual=tax_ben * 12,
        other_pay_annual=other_pay * 12,
        pretax_deductions_annual=pretax * 12,
        aftertax_deductions_annual=aftertax * 12,
        atp_monthly=atp_mo,
    )

    # ── Results ───────────────────────────────────────────────────────
    results_banner()
    render_result(res, show_eur, rate, monthly_gross, period)

    # ── Net vs hours chart ────────────────────────────────────────────
    with st.expander("Net income vs hours worked", expanded=True,
                     icon=":material/show_chart:"):
        pc1, pc2 = st.columns(2)
        with pc1:
            _ptshow_net = st.checkbox("Net monthly (DKK)", value=True, key="pt_cv_net")
        with pc2:
            _ptshow_gross = st.checkbox("Gross monthly (DKK)", value=True, key="pt_cv_gross")
        if show_eur:
            _ptshow_eur = st.checkbox("Net monthly (EUR)", value=False, key="pt_cv_eur")
        else:
            _ptshow_eur = False

        hrs_range = list(range(0, 301, 5))
        nets_h, gross_h, nets_eur_h = [], [], []
        for h in hrs_range:
            ga = hourly_rate * h * 12
            r = compute_tax(
                ga, emp_pct / 100, kommune_pct, kirke_pct, is_church,
                employer_pension_pct=er_pct / 100, is_hourly=True,
                atp_monthly=atp_mo,
            )
            nets_h.append(r["net_monthly"])
            gross_h.append(ga / 12)
            nets_eur_h.append(r["net_monthly"] / rate)

        fig = go.Figure()
        if _ptshow_gross:
            fig.add_trace(go.Scatter(
                x=hrs_range, y=gross_h,
                name="Gross monthly", line=dict(dash="dash", width=2),
            ))
        if _ptshow_net:
            fig.add_trace(go.Scatter(
                x=hrs_range, y=nets_h,
                name="Net monthly (DKK)", line=dict(width=3),
            ))
        if _ptshow_eur:
            fig.add_trace(go.Scatter(
                x=hrs_range, y=nets_eur_h,
                name="Net monthly (EUR)", line=dict(width=2, dash="dot"),
                yaxis="y2",
            ))
            fig.update_layout(yaxis2=dict(
                title="EUR / month", overlaying="y", side="right",
            ))

        # Current position marker
        fig.add_trace(go.Scatter(
            x=[hours_month], y=[res["net_monthly"]],
            mode="markers+text", name="You",
            marker=dict(size=14, color="#e74c3c", symbol="diamond"),
            text=[f"{res['net_monthly']:,.0f}"],
            textposition="top center",
        ))

        fig.update_layout(
            xaxis_title="Hours / month",
            yaxis_title="DKK / month",
            template="plotly_white",
            height=440,
            legend=dict(orientation="h", y=-0.15),
            margin=dict(t=10),
        )
        st.plotly_chart(fig, use_container_width=True)

    # ── Net vs gross curve ────────────────────────────────────────────
    render_curve(
        emp_pct / 100, kommune_pct, kirke_pct, is_church,
        gross_annual, show_eur, rate,
        title_prefix="Part-time",
        employer_pension_pct=er_pct / 100,
        is_hourly=True,
    )
