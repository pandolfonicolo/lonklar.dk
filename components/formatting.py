"""
Number formatting and exchange-rate helpers.
"""

import json
import urllib.request

import streamlit as st

from data import DKK_PER_EUR


@st.cache_data(ttl=3600)
def fetch_dkk_per_eur() -> tuple[float, str]:
    """Fetch live DKK/EUR rate.  Returns (rate, source_label)."""
    try:
        url = "https://open.er-api.com/v6/latest/EUR"
        req = urllib.request.Request(url, headers={"User-Agent": "DKIncomeCalc/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
        rate = data["rates"]["DKK"]
        return round(rate, 4), "live"
    except Exception:
        return DKK_PER_EUR, "fallback"


def fmt(v: float, eur: bool = False, rate: float = DKK_PER_EUR) -> str:
    """Format a DKK value, optionally appending EUR."""
    s = f"{v:,.0f} DKK"
    if eur:
        s += f"  ({v / rate:,.0f} EUR)"
    return s
