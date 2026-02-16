"""
Employee result rendering — key metrics, breakdown table, donut, pension.
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go

from components.formatting import fmt
from components.tooltips import TAX_TIPS


def render_result(res: dict, show_eur: bool, rate: float,
                  monthly_gross: float, period: str = "Monthly"):
    """Key metrics + breakdown + donut for employee scenarios."""
    mul = 12 if period == "Annual" else 1
    per = "/year" if period == "Annual" else "/month"

    # ── Key metrics card ──────────────────────────────────────────────
    st.divider()
    with st.container(border=True):
        c1, c2, c3, c4 = st.columns(4)
        c1.metric(f"Gross{per}",
                  fmt(monthly_gross * mul, show_eur, rate),
                  help=TAX_TIPS["gross"])
        c2.metric(f"Net{per}",
                  fmt(res["net_monthly"] * mul, show_eur, rate),
                  help=TAX_TIPS["net"])
        _other_per = "/year" if period == "Monthly" else "/month"
        _other_mul = 12 if period == "Monthly" else 1
        c3.metric(f"Net{_other_per}",
                  fmt(res["net_monthly"] * _other_mul, show_eur, rate))
        c4.metric("Effective tax rate",
                  f"{res['effective_tax_rate']:.1f} %",
                  help=TAX_TIPS["effective_rate"])

    # ── Breakdown table ───────────────────────────────────────────────
    with st.expander("Detailed breakdown", expanded=True,
                     icon=":material/receipt_long:"):
        ferie_label = (
            "Feriepenge (12.5 %)"
            if res.get("feriepenge", 0) > res["gross_annual"] * 0.02
            else "Ferietillaeg (1 %)"
        )
        rows = [
            ("Gross salary",               res["gross_annual"]),
            (f"+ {ferie_label}",            res["feriepenge"]),
        ]
        if res.get("other_pay", 0) > 0:
            rows.append(("+ Other pay",     res["other_pay"]))
        if res.get("pretax_deductions", 0) > 0:
            rows.append(("- Pre-tax deductions", -res["pretax_deductions"]))
        if res.get("taxable_benefits", 0) > 0:
            rows.append(("+ Taxable benefits (non-cash)", res["taxable_benefits"]))
        rows += [
            ("= Total gross (taxable)",     res["total_gross"]),
            ("",                            None),
            ("- Your pension",              -res["employee_pension"]),
            ("- AM-bidrag (8 %)",           -res["am_bidrag"]),
        ]
        if res.get("atp_annual", 0) > 0:
            rows.append(("- ATP",           -res["atp_annual"]))
        rows += [
            ("= Income after AM",          res["income_after_am"]),
            ("",                            None),
            ("Beskaeftigelsesfradrag",      res["beskaeft_fradrag"]),
            ("Jobfradrag",                  res["job_fradrag"]),
            ("",                            None),
            ("- Bundskat (12.01 %)",        -res["bundskat"]),
            ("- Kommuneskat",               -res["kommuneskat"]),
            ("- Kirkeskat",                 -res["kirkeskat"]),
            ("- Mellemskat (7.5 %)",        -res["mellemskat"]),
            ("- Topskat (7.5 %)",           -res["topskat"]),
            ("- Toptopskat (5 %)",          -res["toptopskat"]),
            ("",                            None),
            ("Total income tax",            -res["total_income_tax"]),
            ("TOTAL DEDUCTIONS",            -res["total_deductions"]),
        ]
        if res.get("aftertax_deductions", 0) > 0:
            rows.append(("- After-tax deductions", -res["aftertax_deductions"]))
        rows += [
            ("",                            None),
            ("NET INCOME",                  res["net_annual"]),
        ]

        table_data = []
        for label, val in rows:
            if val is None:
                table_data.append({"Item": "", "Annual (DKK)": "", "Monthly (DKK)": ""})
            else:
                table_data.append({
                    "Item": label,
                    "Annual (DKK)": f"{val:,.0f}",
                    "Monthly (DKK)": f"{val/12:,.0f}",
                })
        st.dataframe(pd.DataFrame(table_data), use_container_width=True,
                     hide_index=True)

    # ── Tax glossary ──────────────────────────────────────────────────
    with st.expander("Tax glossary — what each term means",
                     expanded=False, icon=":material/help:"):
        render_glossary()

    # ── Income distribution (donut) ───────────────────────────────────
    with st.expander("Income distribution", expanded=True,
                     icon=":material/donut_large:"):
        labels = ["Net income", "AM-bidrag", "Pension", "Bundskat",
                  "Kommuneskat", "Kirkeskat", "Mellem/Top/Toptopskat"]
        values = [
            res["net_annual"], res["am_bidrag"], res["pension"],
            res["bundskat"], res["kommuneskat"], res["kirkeskat"],
            res["mellemskat"] + res["topskat"] + res["toptopskat"],
        ]
        colors = ["#2ecc71", "#e74c3c", "#3498db", "#e67e22",
                  "#9b59b6", "#1abc9c", "#f39c12"]
        if res.get("atp_annual", 0) > 0:
            labels.append("ATP")
            values.append(res["atp_annual"])
            colors.append("#7f8c8d")
        if res.get("aftertax_deductions", 0) > 0:
            labels.append("After-tax deductions")
            values.append(res["aftertax_deductions"])
            colors.append("#95a5a6")

        fig = go.Figure(go.Pie(
            labels=labels, values=values, hole=0.45,
            textinfo="label+percent",
            marker=dict(colors=colors),
            hovertemplate="<b>%{label}</b><br>%{value:,.0f} DKK<br>"
                          "%{percent}<extra></extra>",
        ))
        fig.update_layout(
            margin=dict(t=10, b=10, l=10, r=10),
            height=380,
            showlegend=True,
            legend=dict(orientation="h", y=-0.05),
        )
        st.plotly_chart(fig, use_container_width=True)

    # ── Pension accrual ───────────────────────────────────────────────
    if res["total_pension"] > 0:
        with st.expander("Pension accrual", expanded=False,
                         icon=":material/savings:"):
            p1, p2, p3 = st.columns(3)
            p1.metric(f"Your contribution{per}",
                      fmt(res["employee_pension"] / 12 * mul, show_eur, rate),
                      help=TAX_TIPS["pension"])
            p2.metric(f"Employer on top{per}",
                      fmt(res["employer_pension"] / 12 * mul, show_eur, rate))
            p3.metric(f"Total pension{per}",
                      fmt(res["total_pension"] / 12 * mul, show_eur, rate))
            st.caption(
                f"Monthly: {res['employee_pension']/12:,.0f} (you) + "
                f"{res['employer_pension']/12:,.0f} (employer) = "
                f"**{res['total_pension']/12:,.0f} DKK/month** to pension"
            )


def render_glossary():
    """Compact tax glossary with key terms."""
    terms = [
        ("AM-bidrag",              TAX_TIPS["am_bidrag"]),
        ("Bundskat",               TAX_TIPS["bundskat"]),
        ("Kommuneskat",            TAX_TIPS["kommuneskat"]),
        ("Kirkeskat",              TAX_TIPS["kirkeskat"]),
        ("Mellemskat",             TAX_TIPS["mellemskat"]),
        ("Topskat",                TAX_TIPS["topskat"]),
        ("Toptopskat",             TAX_TIPS["toptopskat"]),
        ("Personfradrag",          TAX_TIPS["personfradrag"]),
        ("Beskaeftigelsesfradrag", TAX_TIPS["beskaeft"]),
        ("Jobfradrag",             TAX_TIPS["jobfradrag"]),
        ("Skatteloft",             TAX_TIPS["skatteloft"]),
        ("Feriepenge",             TAX_TIPS["feriepenge"]),
        ("ATP",                    TAX_TIPS["atp"]),
    ]
    for name, desc in terms:
        st.markdown(f"**{name}** — {desc}")
