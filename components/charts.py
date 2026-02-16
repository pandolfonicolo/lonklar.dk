"""
Net-vs-gross curves and effective tax-rate charts.
"""

import streamlit as st
import plotly.graph_objects as go

from data import SKATTELOFT
from tax_engine import compute_tax


def render_curve(
    pension_pct, kommune_pct, kirke_pct, is_church,
    current_annual, show_eur, rate, title_prefix="",
    employer_pension_pct=0.0,
    is_hourly=False,
):
    """Net-income curve with togglable lines."""
    with st.expander(f"{title_prefix} — Net vs gross income",
                     expanded=True, icon=":material/show_chart:"):
        cc1, cc2, cc3 = st.columns(3)
        with cc1:
            _cshow_gross = st.checkbox("Gross monthly", value=True,
                                       key=f"cv_gross_{title_prefix}")
        with cc2:
            _cshow_net = st.checkbox("Net monthly (DKK)", value=True,
                                     key=f"cv_net_{title_prefix}")
        with cc3:
            _cshow_pos = st.checkbox("Your position", value=True,
                                     key=f"cv_pos_{title_prefix}")
        if show_eur:
            _cshow_eur = st.checkbox("Net monthly (EUR)", value=False,
                                     key=f"cv_eur_{title_prefix}")
        else:
            _cshow_eur = False

        lo = max(int(current_annual * 0.3), 100_000)
        hi = max(int(current_annual * 2.0), 800_000)
        salaries = list(range(lo, hi + 1, 5_000))

        nets_dkk, eff_rates = [], []
        for s in salaries:
            r = compute_tax(
                s, pension_pct, kommune_pct, kirke_pct, is_church,
                employer_pension_pct=employer_pension_pct,
                is_hourly=is_hourly,
            )
            nets_dkk.append(r["net_annual"])
            eff_rates.append(r["effective_tax_rate"])

        fig = go.Figure()
        if _cshow_gross:
            fig.add_trace(go.Scatter(
                x=salaries, y=[s / 12 for s in salaries],
                name="Gross monthly", line=dict(dash="dash", width=2),
            ))
        if _cshow_net:
            fig.add_trace(go.Scatter(
                x=salaries, y=[n / 12 for n in nets_dkk],
                name="Net monthly (DKK)", line=dict(width=3),
            ))
        if _cshow_eur:
            fig.add_trace(go.Scatter(
                x=salaries, y=[n / 12 / rate for n in nets_dkk],
                name="Net monthly (EUR)", line=dict(width=2, dash="dot"),
                yaxis="y2",
            ))
            fig.update_layout(yaxis2=dict(
                title="EUR / month", overlaying="y", side="right",
            ))

        if _cshow_pos:
            cur_res = compute_tax(
                current_annual, pension_pct, kommune_pct, kirke_pct, is_church,
                employer_pension_pct=employer_pension_pct,
                is_hourly=is_hourly,
            )
            fig.add_trace(go.Scatter(
                x=[current_annual], y=[cur_res["net_monthly"]],
                mode="markers+text", name="You",
                marker=dict(size=14, color="#e74c3c", symbol="diamond"),
                text=[f"{cur_res['net_monthly']:,.0f}"],
                textposition="top center",
            ))

        fig.update_layout(
            xaxis_title="Annual gross salary (DKK)",
            yaxis_title="DKK / month",
            template="plotly_white",
            height=440,
            legend=dict(orientation="h", y=-0.15),
            margin=dict(t=10),
        )
        st.plotly_chart(fig, use_container_width=True)

    # Effective tax rate
    with st.expander("Effective tax rate curve", expanded=False,
                     icon=":material/analytics:"):
        fig2 = go.Figure()
        fig2.add_trace(go.Scatter(
            x=salaries, y=eff_rates,
            name="Effective tax rate",
            line=dict(width=3, color="#e74c3c"),
        ))
        fig2.add_hline(
            y=SKATTELOFT * 100, line_dash="dash",
            annotation_text=f"Skatteloft {SKATTELOFT*100:.2f} %",
        )
        fig2.update_layout(
            xaxis_title="Annual gross (DKK)",
            yaxis_title="Effective rate (%)",
            template="plotly_white",
            height=320,
            margin=dict(t=10),
        )
        st.plotly_chart(fig2, use_container_width=True)
