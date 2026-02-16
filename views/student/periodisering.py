"""
Student flow 3 — Periodisering calculator.

Compare regular vs periodisering when starting or finishing
education mid-year.
"""

import streamlit as st
import pandas as pd

from data import (
    FRIBELOEB_MELLEMSTE,
    FRIBELOEB_PARENT_BONUS,
    SU_REPAYMENT_INTEREST_RATE,
    FERIEPENGE_RATE, AM_RATE,
)
from components.inputs import pct_slider
from components.constants import MONTH_NAMES_FULL

from components.theme import step_header, results_banner
from views.student.helpers import egenindkomst_from_gross


def render_periodisering(
    is_vid, frib_laveste, su_monthly, num_children,
    kommune_pct, kirke_pct, is_church, period, show_eur, rate,
):
    st.markdown(
        "When you **start or finish** your education mid-year, "
        "periodisering lets you count only income and fribeloeb from the "
        "months you are enrolled. This can prevent SU repayment if you "
        "earned a lot before or after enrollment."
    )

    # ── Step 3 — Education period ──────────────────────────────
    with st.container(border=True):
        step_header(3, "Education period")
        scenario = st.radio(
            "Your situation this year",
            [
                "Started education mid-year",
                "Finished education mid-year",
                "Both (started and finished in same year)",
            ],
            key="stu_per_scenario",
            help="Periodisering applies when you start or finish a "
                 "qualifying education during the calendar year.",
        )

        c1, c2 = st.columns(2)

        if scenario.startswith("Started"):
            with c1:
                start_month = st.selectbox(
                    "Education start month",
                    options=list(range(1, 13)),
                    format_func=lambda m: MONTH_NAMES_FULL[m - 1],
                    index=7,  # August
                    key="stu_per_start",
                )
            end_month = 12

        elif scenario.startswith("Finished"):
            start_month = 1
            with c2:
                end_month = st.selectbox(
                    "Education end month",
                    options=list(range(1, 13)),
                    format_func=lambda m: MONTH_NAMES_FULL[m - 1],
                    index=5,  # June
                    key="stu_per_end",
                )

        else:  # Both
            with c1:
                start_month = st.selectbox(
                    "Start month",
                    options=list(range(1, 13)),
                    format_func=lambda m: MONTH_NAMES_FULL[m - 1],
                    index=1,  # February
                    key="stu_per_start2",
                )
            end_options = list(range(start_month, 13))
            with c2:
                end_month = st.selectbox(
                    "End month",
                    options=end_options,
                    format_func=lambda m: MONTH_NAMES_FULL[m - 1],
                    index=min(len(end_options) - 1, 9 - start_month),
                    key="stu_per_end2",
                )

        enrolled_months = end_month - start_month + 1
        not_enrolled_months = 12 - enrolled_months

        st.info(
            f"Enrolled: **{MONTH_NAMES_FULL[start_month - 1]} – "
            f"{MONTH_NAMES_FULL[end_month - 1]}** "
            f"({enrolled_months} months enrolled, "
            f"{not_enrolled_months} months outside)",
            icon=":material/info:",
        )

        if enrolled_months >= 12:
            st.warning(
                "You are enrolled all 12 months — periodisering only "
                "applies when you start or finish mid-year. "
                "Use the *Estimate net income* flow instead.",
                icon=":material/warning:",
            )
            return

    # ── Step 4 — SU months within enrollment ─────────────────
    with st.container(border=True):
        step_header(4, "SU during enrollment")
        st.caption(
            "How many of your enrolled months do you receive SU? "
            "The rest count as opted out (mellemste fribeloeb)."
        )
        months_su = st.slider(
            "Months receiving SU",
            0, enrolled_months, enrolled_months,
            key="stu_per_su_months",
        )
        months_opted_out = enrolled_months - months_su

    # ── Step 5 — Income inputs ─────────────────────────────────
    with st.container(border=True):
        step_header(5, "Income")
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("**During enrollment**")
            enrolled_gross_monthly = st.number_input(
                "Avg. gross salary/month (enrolled period)",
                value=8_000, step=500, min_value=0,
                key="stu_per_enrolled_gross",
                help="Average monthly gross salary from your student job "
                     "during your education period.",
            )
            enrolled_pen_pct = pct_slider(
                "Pension % (enrolled)", 0.0, 15.0, 0.0, 0.5,
                "stu_per_pen",
            )
        with c2:
            st.markdown("**Outside enrollment**")
            default_outside = not_enrolled_months * 25_000
            outside_total_gross = st.number_input(
                f"Total gross salary ({not_enrolled_months} months)",
                value=default_outside if not_enrolled_months > 0 else 0,
                step=5_000, min_value=0,
                key="stu_per_outside_gross",
                help="Total gross salary earned in months you were NOT "
                     "enrolled (e.g. full-time job before/after).",
            )

    # ── Calculations ──────────────────────────────────────────────────
    from data import FRIBELOEB_HOEJESTE

    pen = enrolled_pen_pct / 100
    parent_bonus_annual = num_children * FRIBELOEB_PARENT_BONUS

    # --- Regular calculation (all 12 months) ---
    regular_frib = (
        months_su * frib_laveste
        + months_opted_out * FRIBELOEB_MELLEMSTE
        + not_enrolled_months * FRIBELOEB_HOEJESTE
        + parent_bonus_annual
    )
    enrolled_eigen = (
        egenindkomst_from_gross(enrolled_gross_monthly, pen)
        * enrolled_months
    )
    # Outside income: assume no pension, feriepenge still applies
    outside_eigen = (
        outside_total_gross * (1 + FERIEPENGE_RATE) * (1 - AM_RATE)
    )
    regular_eigen = enrolled_eigen + outside_eigen
    regular_excess = max(regular_eigen - regular_frib, 0)
    regular_repay = min(regular_excess, su_monthly * months_su)
    regular_interest = regular_repay * SU_REPAYMENT_INTEREST_RATE
    regular_loss = regular_repay + regular_interest

    # --- Periodisering (enrolled months only) ---
    parent_bonus_prorated = (
        parent_bonus_annual * enrolled_months / 12
    )
    period_frib = (
        months_su * frib_laveste
        + months_opted_out * FRIBELOEB_MELLEMSTE
        + parent_bonus_prorated
    )
    period_eigen = enrolled_eigen  # only enrolled period income
    period_excess = max(period_eigen - period_frib, 0)
    period_repay = min(period_excess, su_monthly * months_su)
    period_interest = period_repay * SU_REPAYMENT_INTEREST_RATE
    period_loss = period_repay + period_interest

    # ── Comparison ─────────────────────────────────────────────────────
    results_banner("Regular vs Periodisering")
    with st.container(border=True):

        comp = pd.DataFrame({
            "": [
                "Fribeloeb (DKK)",
                "Egenindkomst (DKK)",
                "Excess over fribeloeb",
                "SU repayment",
                "Interest",
                "Total loss",
            ],
            "Regular (all 12 months)": [
                f"{regular_frib:,.0f}",
                f"{regular_eigen:,.0f}",
                f"{regular_excess:,.0f}",
                f"{regular_repay:,.0f}",
                f"{regular_interest:,.0f}",
                f"{regular_loss:,.0f}",
            ],
            "Periodisering (enrolled only)": [
                f"{period_frib:,.0f}",
                f"{period_eigen:,.0f}",
                f"{period_excess:,.0f}",
                f"{period_repay:,.0f}",
                f"{period_interest:,.0f}",
                f"{period_loss:,.0f}",
            ],
        })
        st.dataframe(comp, use_container_width=True, hide_index=True)

        # Verdict
        st.divider()
        if regular_loss == 0 and period_loss == 0:
            st.success(
                "You are under the fribeloeb limit with **both** methods — "
                "no SU repayment needed!",
                icon=":material/check_circle:",
            )
        elif period_loss < regular_loss:
            savings = regular_loss - period_loss
            st.success(
                f"Periodisering saves you **{savings:,.0f} DKK** in SU "
                f"repayment + interest. SU automatically uses the most "
                f"favorable calculation for you.",
                icon=":material/check_circle:",
            )
        elif period_loss == regular_loss:
            st.info(
                "Both methods give the same result — no benefit from "
                "periodisering in your case.",
                icon=":material/info:",
            )
        else:
            st.info(
                f"Regular calculation is more favorable in your case "
                f"(periodisering would cost "
                f"**{period_loss - regular_loss:,.0f} DKK** more). "
                f"SU automatically picks the best method.",
                icon=":material/info:",
            )

    # ── Month-by-month breakdown ──────────────────────────────────────
    with st.expander("Month-by-month breakdown", expanded=False,
                     icon=":material/table_chart:"):
        rows = []
        su_assigned = 0
        for mi in range(12):
            m_num = mi + 1
            is_enrolled = start_month <= m_num <= end_month
            if is_enrolled:
                if su_assigned < months_su:
                    tier_label = "SU"
                    frib_val = frib_laveste
                    su_assigned += 1
                else:
                    tier_label = "Opted out"
                    frib_val = FRIBELOEB_MELLEMSTE
                frib_period = frib_val
            else:
                tier_label = "Not enrolled"
                frib_val = FRIBELOEB_HOEJESTE
                frib_period = 0  # excluded under periodisering

            rows.append({
                "Month": MONTH_NAMES_FULL[mi],
                "Status": tier_label,
                "Frib. regular": f"{frib_val:,}",
                "Frib. periodisering": (
                    f"{frib_period:,}" if frib_period > 0 else "—"
                ),
            })
        st.dataframe(
            pd.DataFrame(rows), use_container_width=True, hide_index=True,
        )

    # ── How periodisering works ───────────────────────────────────────
    with st.expander("How periodisering works", expanded=False,
                     icon=":material/help:"):
        st.markdown(
            "**Betingelser (conditions):**\n"
            "- You started or finished a qualifying education during "
            "the calendar year\n"
            "- You received SU during at least one month of the year\n\n"
            "**How it works:**\n"
            "- Only your income from pay periods during enrollment counts "
            "(periodiseret egenindkomst)\n"
            "- Only fribeloeb from enrolled months counts "
            "(uddannelsesfribeloeb)\n"
            "- Income earned before starting or after finishing is "
            "excluded\n"
            "- SU automatically picks the most favorable calculation: "
            "regular OR periodisering\n\n"
            "**Lønperiode rule:**\n"
            "Income counts if your employer reported it for a pay period "
            "within your education period. The key is the reporting "
            "period, not when work was performed.\n\n"
            "**Feriepenge:**\n"
            "Feriepenge count as income in the year they are taxed. "
            "Under periodisering, the reporting period determines "
            "whether they are included.\n\n"
            "**Parent bonus:**\n"
            "The forhøjet fribeloeb for children is prorated — "
            "if you are enrolled for N months, you get N/12 of the "
            "annual bonus.\n\n"
            "[Full details at su.dk](https://www.su.dk/su/naar-du-faar-su/"
            "saa-meget-maa-du-tjene/periodisering-af-din-indkomst)"
        )
