"""
Student flow 2 — Hours budget planner.

Track hours already worked, see remaining fribeloeb budget,
and project safe working hours for the rest of the year.
"""

import streamlit as st
import plotly.graph_objects as go
import pandas as pd
from datetime import date as _date

from data import FRIBELOEB_PARENT_BONUS
from components.inputs import pct_slider
from components.formatting import fmt
from components.constants import MONTH_NAMES, MONTH_NAMES_FULL

from components.theme import step_header
from views.student.helpers import egenindkomst_from_gross, compute_max_gross_monthly
from views.student.shared import render_month_tiers


def render_hours_planner(
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
            f"Annual fribeloeb: **{aars_fribeloeb:,} DKK**",
            icon=":material/info:",
        )

    # ── Step 4 — Hourly rate + pension ─────────────────────
    with st.container(border=True):
        step_header(4, "Your hourly rate")
        c1, c2 = st.columns(2)
        with c1:
            hourly_rate = st.number_input(
                "Hourly rate (DKK)", value=140, step=10, min_value=1,
                key="stu_plan_hourly",
            )
        with c2:
            pension_pct = pct_slider(
                "Pension %", 0.0, 15.0, 0.0, 0.5, "stu_plan_pen",
                help_text="Employee pension — reduces egenindkomst.",
            )

    pen = pension_pct / 100

    # ── Step 5: Past months ─────────────────────────────────────
    with st.container(border=True):
        step_header(5, "Hours already worked")
        st.caption(
            "Enter the actual hours you worked in past months. "
            "Leave future months for the planner to calculate."
        )

        default_past = max(0, _date.today().month - 1)
        months_worked = st.slider(
            "How many months are already behind you?",
            0, 12, default_past, key="stu_plan_past",
        )

        month_hours = [0] * 12
        if months_worked > 0:
            n_cols = min(months_worked, 6)
            cols = st.columns(n_cols)
            for i in range(months_worked):
                with cols[i % n_cols]:
                    h = st.number_input(
                        MONTH_NAMES[i], value=0,
                        min_value=0, max_value=400, step=5,
                        key=f"stu_plan_h_{i}",
                    )
                    month_hours[i] = h

    # ── Step 2: Compute budget ────────────────────────────────────────
    remaining_months = 12 - months_worked

    # Egenindkomst & fribeloeb used so far
    eigen_used = 0.0
    frib_used = 0.0
    for i in range(months_worked):
        gross_m = hourly_rate * month_hours[i]
        eigen_used += egenindkomst_from_gross(gross_m, pen)
        frib_used += month_frib[i]

    frib_remaining = sum(month_frib[months_worked:])
    total_room = (frib_used + frib_remaining) - eigen_used

    with st.container(border=True):
        step_header(6, "Remaining budget")

        if remaining_months > 0:
            safe_eigen = max(total_room / remaining_months, 0)
            safe_gross = compute_max_gross_monthly(pen, safe_eigen)
            safe_hours = max(safe_gross / hourly_rate, 0)

            m1, m2, m3 = st.columns(3)
            m1.metric(
                "Fribeloeb remaining",
                fmt(total_room, show_eur, rate),
                help="Egenindkomst room left for the rest of the year.",
            )
            m2.metric(
                f"Max gross/month ({remaining_months} mo left)",
                fmt(safe_gross, show_eur, rate),
            )
            m3.metric(
                f"Max hours/month ({remaining_months} mo left)",
                f"{safe_hours:.0f} h",
                help=f"At {hourly_rate} DKK/h, to stay under fribeloeb.",
            )

            if total_room <= 0:
                st.error(
                    "You have already used **all** your fribeloeb. "
                    "Any additional earnings will trigger SU repayment.",
                    icon=":material/warning:",
                )
            elif total_room < safe_eigen * 2:
                st.warning(
                    f"Tight budget — only {total_room:,.0f} DKK of room "
                    f"left for {remaining_months} months.",
                    icon=":material/warning:",
                )
            else:
                st.success(
                    f"Comfortable — {total_room:,.0f} DKK room for "
                    f"{remaining_months} months "
                    f"(~{safe_eigen:,.0f}/month average).",
                    icon=":material/check_circle:",
                )
        else:
            st.info(
                "All 12 months accounted for — see the year-end summary "
                "below.", icon=":material/info:",
            )

    # ── Cumulative chart ──────────────────────────────────────────────
    with st.expander("Cumulative earnings vs fribeloeb", expanded=True,
                     icon=":material/show_chart:"):
        cum_eigen, cum_frib = [], []
        run_e = run_f = 0.0

        for i in range(12):
            if i < months_worked:
                gross_m = hourly_rate * month_hours[i]
            else:
                if remaining_months > 0 and total_room > 0:
                    gross_m = compute_max_gross_monthly(
                        pen, max(total_room / remaining_months, 0),
                    )
                    gross_m = min(gross_m, hourly_rate * 400)
                else:
                    gross_m = 0

            run_e += egenindkomst_from_gross(gross_m, pen)
            run_f += month_frib[i]
            cum_eigen.append(run_e)
            cum_frib.append(run_f)

        fig = go.Figure()
        if months_worked > 0:
            fig.add_trace(go.Scatter(
                x=MONTH_NAMES[:months_worked],
                y=cum_eigen[:months_worked],
                name="Actual egenindkomst",
                line=dict(width=3, color="#e74c3c"),
                fill="tozeroy", fillcolor="rgba(231,76,60,0.1)",
            ))
        if remaining_months > 0:
            proj_x = MONTH_NAMES[max(months_worked - 1, 0):]
            proj_y = cum_eigen[max(months_worked - 1, 0):]
            fig.add_trace(go.Scatter(
                x=proj_x, y=proj_y,
                name="Projected (even spread)",
                line=dict(width=2, color="#e74c3c", dash="dot"),
            ))
        fig.add_trace(go.Scatter(
            x=MONTH_NAMES, y=cum_frib,
            name="Cumulative fribeloeb",
            line=dict(width=3, color="#2ecc71", dash="dash"),
        ))
        if 0 < months_worked < 12:
            fig.add_vline(
                x=months_worked - 0.5, line_dash="dot", line_color="#888",
                annotation_text="Today", annotation_position="top",
            )
        fig.update_layout(
            yaxis_title="DKK (cumulative)", template="plotly_white",
            height=380, legend=dict(orientation="h", y=-0.15),
            margin=dict(t=10),
        )
        st.plotly_chart(fig, use_container_width=True)

        # Year-end summary
        final_e = cum_eigen[-1]
        final_f = cum_frib[-1]
        if final_e > final_f:
            excess = final_e - final_f
            st.error(
                f"Year-end projection: egenindkomst exceeds fribeloeb by "
                f"**{excess:,.0f} DKK**. Reduce hours in remaining months.",
                icon=":material/warning:",
            )
        else:
            margin = final_f - final_e
            st.success(
                f"Year-end projection: **{margin:,.0f} DKK** under "
                f"fribeloeb.",
                icon=":material/check_circle:",
            )

    # ── Month summary table ───────────────────────────────────────────
    with st.expander("Monthly fribeloeb summary", expanded=False,
                     icon=":material/table_chart:"):
        data = []
        for i in range(12):
            data.append({
                "Month": MONTH_NAMES_FULL[i],
                "Fribeloeb (DKK)": f"{month_frib[i]:,}",
                "Status": "Past" if i < months_worked else "Future",
            })
        st.dataframe(
            pd.DataFrame(data), use_container_width=True,
            hide_index=True, height=150,
        )
