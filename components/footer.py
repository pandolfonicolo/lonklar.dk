"""
Footer — tax parameters reference table and disclaimer.
"""

import streamlit as st
import pandas as pd

from data import (
    AM_RATE, PERSONFRADRAG,
    BUNDSKAT_RATE,
    MELLEMSKAT_THRESHOLD, MELLEMSKAT_RATE,
    TOPSKAT_THRESHOLD, TOPSKAT_RATE,
    TOPTOPSKAT_THRESHOLD, TOPTOPSKAT_RATE,
    SKATTELOFT,
    BESKAEFT_RATE, BESKAEFT_MAX,
    JOB_FRADRAG_RATE, JOB_FRADRAG_MAX,
    SU_UDEBOENDE_MONTH, SU_HJEMMEBOENDE_BASE,
    FRIBELOEB_LAVESTE_VID, FRIBELOEB_MELLEMSTE, FRIBELOEB_HOEJESTE,
)


def render_footer(selected_kommune: str, kommune_pct: float, kirke_pct: float):
    """Tax parameters table + disclaimer."""
    st.divider()
    with st.expander("Tax parameters used (2026)", expanded=False,
                     icon=":material/info:"):
        params = {
            "AM-bidrag": f"{AM_RATE*100:.0f} %",
            "Personfradrag": f"{PERSONFRADRAG:,} kr/year",
            "Bundskat": f"{BUNDSKAT_RATE*100:.2f} %",
            f"Mellemskat (> {MELLEMSKAT_THRESHOLD:,} kr)":
                f"{MELLEMSKAT_RATE*100:.1f} %",
            f"Topskat (> {TOPSKAT_THRESHOLD:,} kr)":
                f"{TOPSKAT_RATE*100:.1f} %",
            f"Toptopskat (> {TOPTOPSKAT_THRESHOLD:,} kr)":
                f"{TOPTOPSKAT_RATE*100:.1f} %",
            "Skatteloft": f"{SKATTELOFT*100:.2f} %",
            "Beskaeftigelsesfradrag":
                f"{BESKAEFT_RATE*100:.2f} % (max {BESKAEFT_MAX:,} kr)",
            "Jobfradrag":
                f"{JOB_FRADRAG_RATE*100:.1f} % (max {JOB_FRADRAG_MAX:,} kr)",
            f"Kommuneskat ({selected_kommune})": f"{kommune_pct:.2f} %",
            f"Kirkeskat ({selected_kommune})": f"{kirke_pct:.2f} %",
            "SU udeboende": f"{SU_UDEBOENDE_MONTH:,} kr/month",
            "SU hjemmeboende (grundsats)":
                f"{SU_HJEMMEBOENDE_BASE:,} kr/month",
            "Fribeloeb laveste (SU months)":
                f"{FRIBELOEB_LAVESTE_VID:,} kr/month (after AM)",
            "Fribeloeb mellemste (opted out)":
                f"{FRIBELOEB_MELLEMSTE:,} kr/month (after AM)",
            "Fribeloeb hoejeste (not enrolled)":
                f"{FRIBELOEB_HOEJESTE:,} kr/month (after AM)",
        }
        st.table(pd.DataFrame({
            "Parameter": list(params.keys()),
            "Value": list(params.values()),
        }))

    st.caption(
        "**Disclaimer:** This tool provides estimates based on published "
        "2026 rates. It does not account for all possible deductions, "
        "special rules, or individual circumstances. Always consult "
        "skat.dk or a tax adviser for precise figures."
    )
