"""
Reusable input widgets — sliders with synced number inputs, salary input.
"""

import streamlit as st

from components.tooltips import TAX_TIPS


def pct_slider(label, min_v, max_v, default, step, key, help_text=""):
    """Percentage slider with synced number-input."""
    if key not in st.session_state:
        st.session_state[key] = default
    s_key, n_key = f"_s_{key}", f"_n_{key}"

    def _from_slider():
        st.session_state[key] = st.session_state[s_key]
        st.session_state[n_key] = st.session_state[s_key]

    def _from_input():
        v = max(min_v, min(max_v, st.session_state[n_key]))
        st.session_state[key] = v
        st.session_state[s_key] = v

    c1, c2 = st.columns([3, 1])
    with c1:
        st.slider(label, min_v, max_v, st.session_state[key], step,
                  key=s_key, on_change=_from_slider, help=help_text)
    with c2:
        st.number_input(
            "%", min_value=min_v, max_value=max_v,
            value=st.session_state[key], step=step,
            key=n_key, on_change=_from_input,
            label_visibility="collapsed",
        )
    return st.session_state[key]


def int_slider(label, min_v, max_v, default, step, key, help_text=""):
    """Integer slider with synced number-input."""
    if key not in st.session_state:
        st.session_state[key] = default
    s_key, n_key = f"_s_{key}", f"_n_{key}"

    def _from_slider():
        st.session_state[key] = st.session_state[s_key]
        st.session_state[n_key] = st.session_state[s_key]

    def _from_input():
        v = max(min_v, min(max_v, st.session_state[n_key]))
        st.session_state[key] = v
        st.session_state[s_key] = v

    c1, c2 = st.columns([3, 1])
    with c1:
        st.slider(label, min_v, max_v, st.session_state[key], step,
                  key=s_key, on_change=_from_slider, help=help_text)
    with c2:
        st.number_input(
            "#", min_value=min_v, max_value=max_v,
            value=st.session_state[key], step=step,
            key=n_key, on_change=_from_input,
            label_visibility="collapsed",
        )
    return st.session_state[key]


def period_clear(prefix: str, period: str):
    """Clear amount-widget keys when the user toggles Monthly / Annual."""
    track = f"_period_track_{prefix}"
    if track not in st.session_state:
        st.session_state[track] = period
    if st.session_state[track] != period:
        to_del = [k for k in list(st.session_state)
                  if k.startswith(f"_w_{prefix}") or k.startswith(f"_sal_{prefix}")]
        for k in to_del:
            del st.session_state[k]
        st.session_state[track] = period


def salary_input(prefix: str, period: str, default_monthly: int = 40_000):
    """Period-aware salary input.  Returns annual gross."""
    c_key = f"_c_sal_{prefix}"
    w_key = f"_sal_{prefix}"
    if c_key not in st.session_state:
        st.session_state[c_key] = default_monthly * 12

    per = "/year" if period == "Annual" else "/month"
    if period == "Annual":
        display = int(round(st.session_state[c_key]))
        step = 10_000
    else:
        display = int(round(st.session_state[c_key] / 12))
        step = 1_000

    entered = st.number_input(
        f"Gross salary (DKK{per})", value=display,
        step=step, min_value=0, key=w_key,
        help=TAX_TIPS["gross"],
    )
    if period == "Annual":
        st.session_state[c_key] = entered
    else:
        st.session_state[c_key] = entered * 12
    return st.session_state[c_key]
