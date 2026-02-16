"""
DK Income Calculator — Streamlit entry-point / router.

Thin shell: page config → sidebar → route to the selected view module.
"""

import streamlit as st
from data import KOMMUNER, TAX_YEAR, DKK_PER_EUR
from components.formatting import fetch_dkk_per_eur
from components.footer import render_footer
from components.theme import inject_theme_css, fw_header

# ═══════════════════════════════════════════════════════════════════════
#  PAGE CONFIG
# ═══════════════════════════════════════════════════════════════════════

st.set_page_config(
    page_title=f"DK Income Calculator {TAX_YEAR}",
    page_icon=":material/calculate:",
    layout="wide",
)


# ═══════════════════════════════════════════════════════════════════════
#  SIDEBAR
# ═══════════════════════════════════════════════════════════════════════

_FRAMEWORKS = {
    "Full-time": {
        "icon": ":material/work:",
        "emoji": "💼",
        "desc": "Monthly salaried position",
    },
    "Part-time / hourly": {
        "icon": ":material/schedule:",
        "emoji": "⏰",
        "desc": "Paid by the hour",
    },
    "Student (SU + work)": {
        "icon": ":material/school:",
        "emoji": "🎓",
        "desc": "SU grant + part-time work",
    },
}

with st.sidebar:
    st.markdown(
        '<div class="sb-header">'
        '<h3>🇩🇰 DK Income</h3>'
        f'<span class="sb-badge">{TAX_YEAR}</span>'
        '</div>',
        unsafe_allow_html=True,
    )

    # ── Framework selector ────────────────────────────────────────────
    st.markdown('<p class="sb-label">YOUR PROFILE</p>', unsafe_allow_html=True)

    framework = st.radio(
        "framework_selector",
        list(_FRAMEWORKS.keys()),
        format_func=lambda f: f"{_FRAMEWORKS[f]['icon']}  {f}",
        label_visibility="collapsed",
        key="fw_sel",
    )
    st.caption(_FRAMEWORKS[framework]["desc"])

    st.divider()

    # ── Settings ──────────────────────────────────────────────────────
    st.markdown('<p class="sb-label">SETTINGS</p>', unsafe_allow_html=True)

    selected_kommune = st.selectbox(
        "Municipality",
        sorted(KOMMUNER.keys()),
        index=sorted(KOMMUNER.keys()).index("København"),
        help="Determines your kommuneskat and kirkeskat rates.",
    )
    kommune_rates = KOMMUNER[selected_kommune]
    kommune_pct = kommune_rates["kommuneskat"]
    kirke_pct   = kommune_rates["kirkeskat"]

    is_church = st.checkbox(
        "Church member", value=True,
        help="Uncheck to opt out of kirkeskat (Folkekirken).",
    )

    c1, c2 = st.columns(2)
    with c1:
        period = st.radio(
            "Display", ["Monthly", "Annual"],
            help="Primary display period.",
        )
    with c2:
        show_eur = st.checkbox("EUR", value=False, help="Show EUR equivalents")

    if show_eur:
        live_rate, rate_src = fetch_dkk_per_eur()
        dkk_per_eur = live_rate
        tag = "live" if rate_src == "live" else "fallback"
        st.caption(f"1 EUR = {dkk_per_eur} DKK ({tag})")
    else:
        dkk_per_eur = DKK_PER_EUR

    st.divider()
    st.caption(f"📍 {selected_kommune} · Tax year {TAX_YEAR}")


# ═══════════════════════════════════════════════════════════════════════
#  MAIN AREA — title bar + routing
# ═══════════════════════════════════════════════════════════════════════

inject_theme_css(framework)
fw_info = _FRAMEWORKS[framework]
fw_header(fw_info["emoji"], framework, fw_info["desc"])

page_kwargs = dict(
    kommune_pct=kommune_pct,
    kirke_pct=kirke_pct,
    is_church=is_church,
    selected_kommune=selected_kommune,
    period=period,
    show_eur=show_eur,
    rate=dkk_per_eur,
)

if framework == "Full-time":
    from views.fulltime import render
    render(**page_kwargs)
elif framework == "Part-time / hourly":
    from views.parttime import render
    render(**page_kwargs)
else:
    from views.student import render
    render(**page_kwargs)

render_footer(selected_kommune, kommune_pct, kirke_pct)
