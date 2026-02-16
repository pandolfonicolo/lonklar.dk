"""
Pay, benefits & deductions UI — guided preset + custom items.
"""

import streamlit as st

from data import ATP_MONTHLY
from components.tooltips import TAX_TIPS


# ── Preset items ──────────────────────────────────────────────────────

COMMON_ITEMS = [
    # Taxable benefits (non-cash)
    {"key": "fri_telefon",
     "label": "Fri telefon (company phone)",
     "default_monthly": 292,
     "category": "taxable_benefit",
     "help": ("Your employer provides a phone you also use privately. "
              "Skat values it at 3,500 kr/year (292 kr/month).")},
    {"key": "sundhedsforsikring",
     "label": "Sundhedsforsikring (health insurance)",
     "default_monthly": 200,
     "category": "taxable_benefit",
     "help": ("Employer-paid health/dental insurance. "
              "Typical taxable value: 2,000-3,000 kr/year.")},
    {"key": "firmabil",
     "label": "Firmabil (company car)",
     "default_monthly": 3_000,
     "category": "taxable_benefit",
     "help": ("Company car for private use. Taxable value depends on "
              "price (25 % up to 300k + 20 % above). Ask HR for the exact figure.")},
    # Extra cash pay
    {"key": "internet",
     "label": "Internet / broadband allowance",
     "default_monthly": 200,
     "category": "other_pay",
     "help": "Monthly cash allowance for home internet — common for remote/hybrid workers."},
    {"key": "bonus",
     "label": "Bonus / performance pay (avg.)",
     "default_monthly": 0,
     "category": "other_pay",
     "help": "If you get a regular bonus, enter the monthly average (annual / 12)."},
    {"key": "transport_allow",
     "label": "Transport / mobility allowance",
     "default_monthly": 0,
     "category": "other_pay",
     "help": "Cash transport allowance from employer, if any."},
    # Pre-tax deductions
    {"key": "dsb",
     "label": "DSB / commuter card",
     "default_monthly": 700,
     "category": "pretax",
     "help": ("Employer-arranged commuter pass, deducted pre-tax. "
              "Typical DSB monthly pass: 500-1,200 kr.")},
    {"key": "fagforening",
     "label": "Fagforening (trade union)",
     "default_monthly": 400,
     "category": "pretax",
     "help": ("Union dues, tax-deductible up to 7,000 kr/year. "
              "IDA, DJOF, HK, 3F — typically 300-600 kr/month.")},
    # After-tax deductions
    {"key": "canteen",
     "label": "Frokostordning (canteen)",
     "default_monthly": 400,
     "category": "aftertax",
     "help": "Subsidised workplace lunch, deducted after tax. Typically 300-600 kr/month."},
    {"key": "fitness",
     "label": "Fitness / sports",
     "default_monthly": 200,
     "category": "aftertax",
     "help": "Employer gym membership, deducted after tax."},
    {"key": "parking",
     "label": "Parking",
     "default_monthly": 500,
     "category": "aftertax",
     "help": "Workplace parking fee, deducted after tax."},
]

CATEGORY_META = {
    "taxable_benefit": (
        "Taxable benefits (non-cash)",
        "Benefits your employer provides **in kind** (not cash). "
        "You pay tax on the value even though you don't receive money.",
    ),
    "other_pay": (
        "Extra taxable pay (cash)",
        "Additional cash on top of base salary — fully taxable.",
    ),
    "pretax": (
        "Pre-tax deductions",
        "Amounts deducted from your salary **before** tax is calculated. "
        "They **reduce** your taxable income.",
    ),
    "aftertax": (
        "After-tax deductions",
        "Amounts deducted from your pay **after** tax. "
        "They do **not** reduce your tax — only your take-home pay.",
    ),
}


# ── Guided benefits UI ────────────────────────────────────────────────

def render_benefits(prefix: str, period: str):
    """Guided benefits / deductions UI.

    Returns (other_pay_mo, taxable_ben_mo, pretax_mo, aftertax_mo, atp_mo).
    """
    per_label = "/year" if period == "Annual" else "/month"
    mul = 12 if period == "Annual" else 1

    # ATP
    st.markdown("**ATP (labour-market supplementary pension)**")
    st.caption(
        f"Standard employee share: {ATP_MONTHLY:.0f} DKK/month "
        f"({ATP_MONTHLY * 12:,.0f} DKK/year). Employer pays 2x on top."
    )
    atp_on = st.checkbox("Include ATP", value=True, key=f"{prefix}_atp",
                         help=TAX_TIPS["atp"])
    atp_mo = ATP_MONTHLY if atp_on else 0.0

    st.divider()

    # Preset items grouped by category
    totals = {"taxable_benefit": 0.0, "other_pay": 0.0,
              "pretax": 0.0, "aftertax": 0.0}

    for cat, (cat_title, cat_desc) in CATEGORY_META.items():
        st.markdown(f"**{cat_title}**")
        st.caption(cat_desc)

        items_in_cat = [i for i in COMMON_ITEMS if i["category"] == cat]
        for item in items_in_cat:
            ikey = f"{prefix}_{item['key']}"
            c1, c2 = st.columns([3, 1])
            with c1:
                on = st.checkbox(item["label"], key=f"{ikey}_on",
                                 help=item["help"])
            if on:
                with c2:
                    w_key = f"_w_{prefix}_{item['key']}"
                    c_key = f"_c_{prefix}_{item['key']}"
                    if c_key not in st.session_state:
                        st.session_state[c_key] = float(item["default_monthly"])
                    display = int(round(st.session_state[c_key] * mul))
                    step = max(1, int(50 * mul))
                    entered = st.number_input(
                        f"DKK{per_label}", value=display, step=step,
                        min_value=0, key=w_key, label_visibility="collapsed",
                    )
                    st.session_state[c_key] = entered / mul
                    totals[cat] += st.session_state[c_key]

        # Custom items
        custom_key = f"{prefix}_custom_{cat}"
        if custom_key not in st.session_state:
            st.session_state[custom_key] = []

        for idx, ci in enumerate(st.session_state[custom_key]):
            c1, c2, c3 = st.columns([2.5, 1, 0.5])
            with c1:
                st.markdown(f"*{ci['name']}*")
            with c2:
                w_key = f"_w_{custom_key}_{idx}"
                display = int(round(ci["monthly"] * mul))
                step = max(1, int(50 * mul))
                entered = st.number_input(
                    f"DKK{per_label}", value=display, step=step,
                    min_value=0, key=w_key, label_visibility="collapsed",
                )
                ci["monthly"] = entered / mul
                totals[cat] += ci["monthly"]
            with c3:
                if st.button("Remove", key=f"{custom_key}_del_{idx}",
                             icon=":material/delete:"):
                    st.session_state[custom_key].pop(idx)
                    st.rerun()

        # Add custom row
        add_cols = st.columns([2, 1, 0.8])
        with add_cols[0]:
            new_name = st.text_input(
                "Name", key=f"{custom_key}_name",
                placeholder="e.g. Night shift bonus",
                label_visibility="collapsed",
            )
        with add_cols[1]:
            new_amt = st.number_input(
                f"DKK{per_label}", value=0,
                step=max(1, int(50 * mul)), min_value=0,
                key=f"{custom_key}_amt", label_visibility="collapsed",
            )
        with add_cols[2]:
            if st.button("Add", key=f"{custom_key}_btn",
                         icon=":material/add_circle:"):
                if new_name.strip():
                    st.session_state[custom_key].append(
                        {"name": new_name.strip(), "monthly": new_amt / mul}
                    )
                    st.rerun()

        st.markdown("")

    # Summary
    st.divider()
    st.markdown("**Active items summary**")
    summary_parts = []
    for cat, (cat_title, _) in CATEGORY_META.items():
        if totals[cat] > 0:
            display_val = totals[cat] * mul
            summary_parts.append(f"- {cat_title}: **{display_val:,.0f} DKK{per_label}**")
    if atp_mo > 0:
        summary_parts.append(f"- ATP: **{atp_mo * mul:,.0f} DKK{per_label}**")
    if summary_parts:
        st.markdown("\n".join(summary_parts))
    else:
        st.caption("No extra items selected.")

    return (totals["other_pay"], totals["taxable_benefit"],
            totals["pretax"], totals["aftertax"], atp_mo)
