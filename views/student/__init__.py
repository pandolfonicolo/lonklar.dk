"""
Student (SU + work) view — flow router and shared SU settings.

Three flows the user can pick:
  1. Estimate net income  — quick take-home pay calculator
  2. Hours budget planner — track earnings, project remaining hours
  3. Periodisering         — started/finished education mid-year
"""

import streamlit as st

from data import (
    SU_UDEBOENDE_MONTH, SU_HJEMMEBOENDE_BASE, SU_HJEMMEBOENDE_MAX,
    FRIBELOEB_PARENT_BONUS,
)
from components.tooltips import TAX_TIPS
from components.theme import step_header

from views.student.estimate import render_salary_estimate
from views.student.planner import render_hours_planner
from views.student.periodisering import render_periodisering


# ── Internal: education type → fribeloeb / SU rate ────────────────────

def _render_su_base():
    """Common SU settings (edu type, living, children).

    Returns (is_vid, frib_laveste, su_monthly, num_children).
    """
    from data import FRIBELOEB_LAVESTE_UNGDOM, FRIBELOEB_LAVESTE_VID

    edu_type = st.radio(
        "Education type",
        ["Videregaende (higher education)", "Ungdomsuddannelse (youth education)"],
        horizontal=True,
        help="Determines the laveste fribeloeb rate for months you receive SU.",
        key="stu_edu_type",
    )
    is_vid = edu_type.startswith("Videre")
    frib_laveste = FRIBELOEB_LAVESTE_VID if is_vid else FRIBELOEB_LAVESTE_UNGDOM

    c1, c2 = st.columns(2)
    with c1:
        living = st.radio(
            "Living situation",
            ["Udeboende (living away)", "Hjemmeboende (at home)"],
            help=TAX_TIPS["su"],
            key="stu_living",
        )
    with c2:
        num_children = st.number_input(
            "Children under 18", min_value=0, max_value=10, value=0,
            help=f"Each child increases your annual fribeloeb by "
                 f"{FRIBELOEB_PARENT_BONUS:,} DKK/year.",
            key="stu_children",
        )

    if living.startswith("Ude"):
        su_monthly = SU_UDEBOENDE_MONTH
    else:
        su_monthly = SU_HJEMMEBOENDE_MAX
        st.caption(
            f"Grundsats: {SU_HJEMMEBOENDE_BASE:,} kr/month — "
            f"max with tillaeg: {SU_HJEMMEBOENDE_MAX:,} kr/month. "
            f"Exact amount depends on parents' income."
        )

    return is_vid, frib_laveste, su_monthly, num_children


# ── Public entry point ────────────────────────────────────────────────

def render(
    kommune_pct, kirke_pct, is_church, selected_kommune,
    period, show_eur, rate,
):
    # ── Step 1 — What do you want to do? ──────────────────────────────
    with st.container(border=True):
        step_header(1, "What would you like to calculate?")
        flow = st.radio(
            "flow_selector",
            [
                "Estimate net income",
                "Hours budget planner",
                "Periodisering (mid-year start/finish)",
            ],
            captions=[
                "Calculate take-home pay from SU + part-time work",
                "Track earnings so far and see how many hours you can still work",
                "Started or finished education mid-year? Compare regular vs periodisering",
            ],
            key="stu_flow",
            horizontal=True,
            label_visibility="collapsed",
        )

    # ── Step 2 — SU settings ──────────────────────────────────────────
    with st.container(border=True):
        step_header(2, "SU settings")
        is_vid, frib_laveste, su_monthly, num_children = _render_su_base()

        with st.expander(
            "About studieaktivitet (study activity requirement)",
            expanded=False, icon=":material/info:",
        ):
            st.markdown(
                "To keep receiving SU, you must be **studieaktiv** — meaning you "
                "are making sufficient academic progress (passing enough ECTS "
                "relative to the SU clips you have used).\n\n"
                "Your educational institution decides whether you are studieaktiv. "
                "If declared **studieinaktiv**, your SU payments stop until you "
                "catch up on your studies.\n\n"
                "This has **nothing to do with how many hours you work** — "
                "it is purely about academic performance.\n\n"
                "[Read more at su.dk]"
                "(https://www.su.dk/su/naar-du-faar-su/studieaktivitet)"
            )

    # ── Route to selected flow (each flow provides its own steps) ─────
    if flow.startswith("Estimate"):
        render_salary_estimate(
            is_vid, frib_laveste, su_monthly, num_children,
            kommune_pct, kirke_pct, is_church, period, show_eur, rate,
        )
    elif flow.startswith("Hours"):
        render_hours_planner(
            is_vid, frib_laveste, su_monthly, num_children,
            kommune_pct, kirke_pct, is_church, period, show_eur, rate,
        )
    else:
        render_periodisering(
            is_vid, frib_laveste, su_monthly, num_children,
            kommune_pct, kirke_pct, is_church, period, show_eur, rate,
        )
