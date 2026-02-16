"""
Shared student UI — month-tier selector used by estimate + planner flows.
"""

import streamlit as st

from data import FRIBELOEB_MELLEMSTE, FRIBELOEB_HOEJESTE
from components.constants import MONTH_NAMES


def render_month_tiers(frib_laveste):
    """12-month tier picker with quick-fill buttons.

    Returns (month_frib, months_su, months_mel, months_hoj).
    """
    st.markdown("**Monthly fribeloeb tier for each month**")
    st.caption(
        "Each month gets a fribeloeb rate depending on your situation. "
        "Your annual fribeloeb = sum of 12 monthly amounts + parent bonus. "
        "Only the annual total matters — not whether you exceed in a single month."
    )

    tier_options = [
        f"Receiving SU ({frib_laveste:,} kr)",
        f"Enrolled, opted out / leave ({FRIBELOEB_MELLEMSTE:,} kr)",
        f"Not enrolled / no SU right ({FRIBELOEB_HOEJESTE:,} kr)",
    ]
    tier_amounts = [frib_laveste, FRIBELOEB_MELLEMSTE, FRIBELOEB_HOEJESTE]

    # Quick-fill buttons
    qc1, qc2, qc3 = st.columns(3)
    with qc1:
        if st.button("All: receiving SU", key="stu_fill_su",
                     use_container_width=True):
            for mi in range(12):
                st.session_state[f"stu_tier_{mi}"] = tier_options[0]
    with qc2:
        if st.button("All: opted out", key="stu_fill_opted",
                     use_container_width=True):
            for mi in range(12):
                st.session_state[f"stu_tier_{mi}"] = tier_options[1]
    with qc3:
        if st.button("All: not enrolled", key="stu_fill_none",
                     use_container_width=True):
            for mi in range(12):
                st.session_state[f"stu_tier_{mi}"] = tier_options[2]

    month_tiers = []
    cols1 = st.columns(6)
    cols2 = st.columns(6)
    for mi in range(12):
        col = cols1[mi] if mi < 6 else cols2[mi - 6]
        with col:
            tier = st.selectbox(
                MONTH_NAMES[mi], options=tier_options, index=0,
                key=f"stu_tier_{mi}",
            )
            month_tiers.append(tier)

    month_frib = []
    months_su = months_mel = months_hoj = 0
    for mi in range(12):
        idx = tier_options.index(month_tiers[mi])
        month_frib.append(tier_amounts[idx])
        if idx == 0:
            months_su += 1
        elif idx == 1:
            months_mel += 1
        else:
            months_hoj += 1

    return month_frib, months_su, months_mel, months_hoj
