"""
Student flow 1 — Estimate net income (SU + part-time work).
"""

import streamlit as st
import plotly.graph_objects as go
import pandas as pd

from data import (
    FRIBELOEB_MELLEMSTE, FRIBELOEB_HOEJESTE, FRIBELOEB_PARENT_BONUS,
    SU_REPAYMENT_INTEREST_RATE,
)
from tax_engine import compute_student_income
from components.inputs import pct_slider, int_slider
from components.formatting import fmt
from components.tooltips import TAX_TIPS
from components.constants import ATP_MIN_HOURS_WEEK

from components.theme import step_header, results_banner
from views.student.helpers import egenindkomst_from_gross
from views.student.shared import render_month_tiers


def render_salary_estimate(
    is_vid, frib_laveste, su_monthly, num_children,
    kommune_pct, kirke_pct, is_church, period, show_eur, rate,
):
    # ── Step 3 — Month tiers ───────────────────────────────────────
    with st.container(border=True):
        step_header(3, "Monthly fribeløb tiers")
        month_frib, months_su, months_mel, months_hoj = (
            render_month_tiers(frib_laveste)
        )

        parent_bonus = num_children * FRIBELOEB_PARENT_BONUS
        aars_fribeloeb = sum(month_frib) + parent_bonus

        st.info(
            f"Annual fribeloeb: **{aars_fribeloeb:,} DKK** = "
            f"{months_su} SU months × {frib_laveste:,} + "
            f"{months_mel} opted-out × {FRIBELOEB_MELLEMSTE:,} + "
            f"{months_hoj} not-enrolled × {FRIBELOEB_HOEJESTE:,}"
            + (f" + parent bonus {parent_bonus:,}" if parent_bonus > 0 else ""),
            icon=":material/info:",
        )

        if months_su == 12:
            gain = FRIBELOEB_MELLEMSTE - frib_laveste
            st.caption(
                f"Tip: Opting out of SU for 1 month raises your fribeloeb by "
                f"{gain:,} DKK but costs you 1 month of SU."
            )

        st.success(
            f"SU before tax: **{su_monthly:,} DKK/month** "
            f"({su_monthly * months_su:,} DKK for {months_su} SU months)",
            icon=":material/payments:",
        )

    # ── Step 4 — Work income ───────────────────────────────────────
    with st.container(border=True):
        step_header(4, "Work income")
        input_mode = st.radio(
            "Input mode",
            ["Hourly rate + hours", "Fixed monthly"],
            horizontal=True, key="stu_est_input_mode",
        )
        if input_mode.startswith("Hourly"):
            c1, c2 = st.columns(2)
            with c1:
                hourly_rate = st.number_input(
                    "Hourly rate (DKK)", value=140, step=10, min_value=0,
                    key="stu_est_hourly",
                )
            with c2:
                hours_month = int_slider(
                    "Hours / month", 0, 200, 40, 5, "stu_est_hours",
                    help_text="Average hours per month.",
                )
            work_gross_monthly = hourly_rate * hours_month
            hours_week = hours_month * 12 / 52

            # Neutral ATP info
            if 0 < hours_week < ATP_MIN_HOURS_WEEK:
                st.info(
                    f"At ~{hours_week:.1f} h/week you are below the "
                    f"{ATP_MIN_HOURS_WEEK} h/week threshold for ATP "
                    f"(mandatory pension). No ATP will be contributed — "
                    f"this is normal for low-hours student jobs.",
                    icon=":material/info:",
                )
        else:
            hourly_rate = 0
            hours_month = 0
            work_gross_monthly = st.number_input(
                "Gross monthly salary (DKK)", value=8_000, step=500,
                min_value=0,
                help="Total gross from your student job, per month.",
                key="stu_est_gross",
            )

        st.markdown("**Pension**")
        c1, c2 = st.columns(2)
        with c1:
            emp_pct = pct_slider(
                "Your contribution", 0.0, 15.0, 0.0, 0.5, "stu_est_pen",
                help_text=TAX_TIPS["pension"],
            )
        with c2:
            er_pct = pct_slider(
                "Employer on top", 0.0, 20.0, 0.0, 0.5, "stu_est_er_pen",
                help_text="Employer pension contribution.",
            )

    # Guard: need work income to show results
    if work_gross_monthly <= 0:
        st.info(
            "Enter your work income above to see your full tax breakdown.",
            icon=":material/arrow_upward:",
        )
        return

    # ── Compute ───────────────────────────────────────────────────────
    res = compute_student_income(
        su_monthly=su_monthly,
        work_gross_monthly=work_gross_monthly,
        pension_pct=emp_pct / 100,
        kommune_pct=kommune_pct,
        kirke_pct=kirke_pct,
        is_church=is_church,
        employer_pension_pct=er_pct / 100,
        aars_fribeloeb=aars_fribeloeb,
    )

    # ── Key metrics ───────────────────────────────────────────────────
    results_banner()
    mul = 12 if period == "Annual" else 1
    per = "/year" if period == "Annual" else "/month"

    with st.container(border=True):
        c1, c2, c3, c4 = st.columns(4)
        c1.metric(f"SU{per}", fmt(su_monthly * mul, show_eur, rate),
                  help=TAX_TIPS["su"])
        c2.metric(f"Work gross{per}",
                  fmt(work_gross_monthly * mul, show_eur, rate))
        c3.metric(f"Total net{per}",
                  fmt(res["net_monthly"] * mul, show_eur, rate),
                  help=TAX_TIPS["net"])
        _o_per = "/year" if period == "Monthly" else "/month"
        _o_mul = 12 if period == "Monthly" else 1
        c4.metric(f"Total net{_o_per}",
                  fmt(res["net_monthly"] * _o_mul, show_eur, rate))

    # ── Fribeloeb status ──────────────────────────────────────────────
    eigen_monthly = egenindkomst_from_gross(
        work_gross_monthly, emp_pct / 100,
    )
    eigen_annual = eigen_monthly * 12
    pct_used = (
        (eigen_annual / aars_fribeloeb * 100) if aars_fribeloeb > 0 else 0
    )
    remaining = aars_fribeloeb - eigen_annual

    with st.container(border=True):
        st.markdown("##### :material/checklist:  Fribeloeb status")
        st.caption(
            f"Annual fribeloeb: **{aars_fribeloeb:,} DKK** — the total "
            f"egenindkomst you may earn alongside SU. Exceeding it triggers "
            f"krone-for-krone repayment + "
            f"{SU_REPAYMENT_INTEREST_RATE * 100:.2f} % interest."
        )
        st.progress(
            min(pct_used / 100, 1.0),
            text=(
                f"Egenindkomst: {eigen_annual:,.0f} / {aars_fribeloeb:,.0f} "
                f"DKK ({pct_used:.1f} % used)"
            ),
        )
        if pct_used >= 100:
            excess = eigen_annual - aars_fribeloeb
            repay = min(excess, su_monthly * months_su)
            interest = repay * SU_REPAYMENT_INTEREST_RATE
            st.error(
                f"Over fribeloeb by **{excess:,.0f} DKK**. "
                f"SU repayment: **{repay:,.0f} DKK** + interest: "
                f"**{interest:,.0f} DKK**.",
                icon=":material/warning:",
            )
        elif pct_used >= 80:
            st.warning(
                f"Approaching limit — {remaining:,.0f} DKK remaining.",
                icon=":material/warning:",
            )
        else:
            st.success(
                f"Comfortable margin — {remaining:,.0f} DKK remaining.",
                icon=":material/check_circle:",
            )

    # ── Important rules ───────────────────────────────────────────────
    with st.expander("Important fribeloeb rules", expanded=False,
                     icon=":material/gavel:"):
        st.markdown(
            "**Feriepenge count as income** — Your feriepenge (12.5 % for "
            "hourly workers) are included in egenindkomst. This calculator "
            "already accounts for this.\n\n"
            "**Periodisering** — The year you start or finish education, "
            "special rules apply: only income and fribeloeb from enrolled "
            "months count. Use the *Periodisering* flow above to calculate "
            "this. [Read more at su.dk](https://www.su.dk/su/naar-du-faar-su/"
            "saa-meget-maa-du-tjene/periodisering-af-din-indkomst)\n\n"
            "**Egenindkomst** includes all personal income, positive capital "
            "income, and stock income. Business income also counts.\n\n"
            "**Strategic fravalg** — If you're close to the limit, opt out "
            "of SU for specific months to raise your fribeloeb from "
            f"{frib_laveste:,} to {FRIBELOEB_MELLEMSTE:,} DKK per month. "
            "[Manage fravalg at su.dk](https://www.su.dk/su/naar-du-faar-su/"
            "fravalg-af-su-i-en-periode)"
        )

    # ── Detailed breakdown ────────────────────────────────────────────
    with st.expander("Detailed breakdown", expanded=True,
                     icon=":material/receipt_long:"):
        rows = [
            ("SU (before tax)",            res["su_annual_gross"]),
            ("Work gross salary",          res["work_gross_annual"]),
            ("+ Feriepenge (12.5 %)",      res["work_feriepenge"]),
            ("- Your pension",             -res["work_employee_pension"]),
            ("- AM-bidrag (8 %)",          -res["work_am_bidrag"]),
            ("= Egenindkomst (work)",      res["work_after_am"]),
            ("",                           None),
            ("Beskaeftigelsesfradrag",     res["beskaeft_fradrag"]),
            ("Jobfradrag",                 res["job_fradrag"]),
            ("",                           None),
            ("- Bundskat",                 -res["bundskat"]),
            ("- Kommuneskat",              -res["kommuneskat"]),
            ("- Kirkeskat",                -res["kirkeskat"]),
            ("- Mellemskat",               -res["mellemskat"]),
        ]
        if res["su_repayment"] > 0:
            rows += [
                ("",                       None),
                ("- SU repayment",         -res["su_repayment"]),
                ("- SU repayment interest", -res["su_repayment_interest"]),
            ]
        rows += [
            ("",                           None),
            ("Total deductions",           -res["total_deductions"]),
            ("NET INCOME",                 res["net_annual"]),
        ]
        table = []
        for label, val in rows:
            if val is None:
                table.append({
                    "Item": "", "Annual (DKK)": "", "Monthly (DKK)": "",
                })
            else:
                table.append({
                    "Item": label,
                    "Annual (DKK)": f"{val:,.0f}",
                    "Monthly (DKK)": f"{val / 12:,.0f}",
                })
        st.dataframe(
            pd.DataFrame(table), use_container_width=True, hide_index=True,
        )

    # ── Tax glossary ──────────────────────────────────────────────────
    with st.expander("Tax glossary", expanded=False, icon=":material/help:"):
        for term, tip in [
            ("AM-bidrag",      TAX_TIPS["am_bidrag"]),
            ("Fribeloeb",      TAX_TIPS["fribeloeb"]),
            ("Egenindkomst",   TAX_TIPS["egenindkomst"]),
            ("Bundskat",       TAX_TIPS["bundskat"]),
            ("Kommuneskat",    TAX_TIPS["kommuneskat"]),
            ("Kirkeskat",      TAX_TIPS["kirkeskat"]),
            ("SU",             TAX_TIPS["su"]),
            ("Feriepenge",     TAX_TIPS["feriepenge"]),
            ("Personfradrag",  TAX_TIPS["personfradrag"]),
            ("ATP",            TAX_TIPS["atp"]),
        ]:
            st.markdown(f"**{term}** — {tip}")

    # ── Income distribution (donut) ───────────────────────────────────
    with st.expander("Income distribution", expanded=True,
                     icon=":material/donut_large:"):
        labels = ["Net income", "AM-bidrag", "Income tax", "Pension"]
        values = [
            res["net_annual"], res["work_am_bidrag"],
            res["total_income_tax"], res["work_pension"],
        ]
        colors = ["#2ecc71", "#e74c3c", "#e67e22", "#3498db"]
        if res["su_repayment"] > 0:
            labels.append("SU repayment + interest")
            values.append(res["su_repayment"] + res["su_repayment_interest"])
            colors.append("#c0392b")
        fig = go.Figure(go.Pie(
            labels=labels, values=values, hole=0.45,
            textinfo="label+percent",
            marker=dict(colors=colors),
            hovertemplate=(
                "<b>%{label}</b><br>%{value:,.0f} DKK<br>"
                "%{percent}<extra></extra>"
            ),
        ))
        fig.update_layout(
            margin=dict(t=10, b=10, l=10, r=10), height=380,
            showlegend=True, legend=dict(orientation="h", y=-0.05),
        )
        st.plotly_chart(fig, use_container_width=True)

    # ── Sensitivity ───────────────────────────────────────────────────
    _render_sensitivity(
        su_monthly, emp_pct / 100, er_pct / 100,
        kommune_pct, kirke_pct, is_church,
        show_eur, rate, aars_fribeloeb,
    )

    # ── Pension accrual ───────────────────────────────────────────────
    if res["work_total_pension"] > 0:
        with st.expander("Pension accrual", expanded=False,
                         icon=":material/savings:"):
            p1, p2, p3 = st.columns(3)
            p1.metric(
                "Your contribution/month",
                fmt(res["work_employee_pension"] / 12, show_eur, rate),
                help=TAX_TIPS["pension"],
            )
            p2.metric(
                "Employer on top/month",
                fmt(res["work_employer_pension"] / 12, show_eur, rate),
            )
            p3.metric(
                "Total pension/month",
                fmt(res["work_total_pension"] / 12, show_eur, rate),
            )


# ── Sensitivity chart (internal) ──────────────────────────────────────

def _render_sensitivity(
    su_monthly, pension_pct, er_pct,
    kommune_pct, kirke_pct, is_church,
    show_eur, rate, aars_fribeloeb,
):
    with st.expander("Sensitivity — net income vs work hours",
                     expanded=True, icon=":material/show_chart:"):
        sc1, sc2, sc3 = st.columns(3)
        with sc1:
            _show_total = st.checkbox(
                "Total net (DKK)", value=True, key="stu_sens_total",
            )
        with sc2:
            _show_work = st.checkbox(
                "Work net only (DKK)", value=True, key="stu_sens_work",
            )
        with sc3:
            _show_frib = st.checkbox(
                "Fribeloeb limit", value=True, key="stu_sens_frib",
            )
        if show_eur:
            _show_eur = st.checkbox(
                "Total net (EUR)", value=False, key="stu_sens_eur",
            )
        else:
            _show_eur = False

        hr_range = st.slider(
            "Hourly rate for sensitivity", 80, 400, 140, 10,
            key="stu_sens_rate",
        )
        hrs_range = list(range(0, 201, 5))
        total_nets, work_nets, eur_nets = [], [], []
        for h in hrs_range:
            r = compute_student_income(
                su_monthly, hr_range * h, pension_pct,
                kommune_pct, kirke_pct, is_church,
                employer_pension_pct=er_pct,
                aars_fribeloeb=aars_fribeloeb,
            )
            total_nets.append(r["net_monthly"])
            work_nets.append(r["net_monthly"] - su_monthly)
            eur_nets.append(r["net_monthly"] / rate)

        frib_monthly = aars_fribeloeb / 12
        fig = go.Figure()
        if _show_total:
            fig.add_trace(go.Scatter(
                x=hrs_range, y=total_nets,
                name="Total net (DKK)", line=dict(width=3),
            ))
        if _show_work:
            fig.add_trace(go.Scatter(
                x=hrs_range, y=work_nets,
                name="Work net only", line=dict(width=2, dash="dot"),
            ))
        if _show_eur:
            fig.add_trace(go.Scatter(
                x=hrs_range, y=eur_nets,
                name="Total net (EUR)", line=dict(width=2, dash="dashdot"),
                yaxis="y2",
            ))
            fig.update_layout(
                yaxis2=dict(
                    title="EUR / month", overlaying="y", side="right",
                ),
            )
        if _show_frib:
            fig.add_hline(
                y=frib_monthly, line_dash="dash", line_color="#e74c3c",
                annotation_text=f"Fribeloeb avg. {frib_monthly:,.0f}/mo",
            )

        fig.update_layout(
            xaxis_title="Hours / month",
            yaxis_title="DKK / month",
            template="plotly_white",
            height=440,
            legend=dict(orientation="h", y=-0.15),
            margin=dict(t=10),
        )
        st.plotly_chart(fig, use_container_width=True)
