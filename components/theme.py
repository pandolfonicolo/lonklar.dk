"""
Theme — tonal CSS injection, styled step badges, results banners.

All colours use rgba so they work on both dark and light Streamlit themes.
The accent colour changes per framework (blue / amber / green).
"""

import streamlit as st

# ── Accent palette per framework ──────────────────────────────────────

FW_COLORS = {
    "Full-time":           {"accent": "#5B8DEF", "emoji": "💼"},
    "Part-time / hourly":  {"accent": "#E8963E", "emoji": "⏰"},
    "Student (SU + work)": {"accent": "#43B581", "emoji": "🎓"},
}


def _rgba(hex_color: str, alpha: float) -> str:
    h = hex_color.lstrip("#")
    r, g, b = int(h[:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"rgba({r},{g},{b},{alpha})"


# ── CSS injection ─────────────────────────────────────────────────────

def inject_theme_css(framework: str = "Full-time"):
    """Inject global tonal CSS.  Call once per page render."""
    accent = FW_COLORS.get(framework, FW_COLORS["Full-time"])["accent"]

    st.markdown(f"""<style>
    /* ═══ DK Income — tonal theme ═══════════════════════════════ */
    :root {{
        --dk-accent: {accent};
        --dk-t08: {_rgba(accent, 0.08)};
        --dk-t15: {_rgba(accent, 0.15)};
        --dk-t25: {_rgba(accent, 0.25)};
        --dk-ok:  #43B581;
        --dk-ok-t: rgba(67,181,129,0.10);
    }}

    /* ── Sidebar framework cards ──────────────────────────────── */
    [data-testid="stSidebar"] label[data-baseweb="radio"] {{
        padding: 10px 14px !important;
        border-radius: 10px !important;
        margin-bottom: 6px !important;
        border: 1.5px solid rgba(128,128,128,0.12) !important;
        transition: all 0.15s ease !important;
    }}
    [data-testid="stSidebar"] label[data-baseweb="radio"]:hover {{
        border-color: rgba(128,128,128,0.30) !important;
        background: rgba(128,128,128,0.04) !important;
    }}
    [data-testid="stSidebar"] label[data-baseweb="radio"]:has(input:checked) {{
        border-color: var(--dk-accent) !important;
        background: var(--dk-t15) !important;
        box-shadow: inset 3px 0 0 var(--dk-accent) !important;
    }}

    /* ── Step badges ──────────────────────────────────────────── */
    .step-row {{
        display: flex; align-items: center; gap: 10px;
        margin: 0 0 6px 0;
    }}
    .step-num {{
        display: inline-flex; align-items: center; justify-content: center;
        width: 28px; height: 28px; border-radius: 50%;
        font-weight: 700; font-size: 13px; flex-shrink: 0; line-height: 1;
    }}
    .step-num.active  {{ background: var(--dk-accent); color: #fff; }}
    .step-num.done    {{ background: var(--dk-ok); color: #fff; }}
    .step-num.locked  {{ background: rgba(128,128,128,0.18);
                         color: rgba(128,128,128,0.50); }}
    .step-lbl {{
        font-size: 0.95rem; font-weight: 600; line-height: 1.3;
    }}
    .step-lbl.locked {{ opacity: 0.40; }}

    /* ── Results banner ───────────────────────────────────────── */
    .res-banner {{
        background: var(--dk-t15);
        border-left: 4px solid var(--dk-accent);
        border-radius: 0 10px 10px 0;
        padding: 14px 20px;
        margin: 0.5rem 0 1rem 0;
    }}
    .res-banner h3 {{ margin: 0; font-size: 1.15rem; }}

    /* ── Framework header bar ─────────────────────────────────── */
    .fw-bar {{
        background: linear-gradient(135deg, var(--dk-t25), var(--dk-t08));
        border-radius: 12px;
        padding: 20px 24px;
        margin-bottom: 1.2rem;
        border-left: 5px solid var(--dk-accent);
    }}
    .fw-bar h2 {{ margin: 0 0 4px 0; font-size: 1.35rem; }}
    .fw-bar .fw-sub {{ margin: 0; opacity: 0.65; font-size: 0.88rem; }}

    /* ── Locked step placeholder ──────────────────────────────── */
    .locked-box {{
        border: 1.5px dashed rgba(128,128,128,0.20);
        border-radius: 10px;
        padding: 14px 20px;
        margin-bottom: 8px;
    }}

    /* ── Sidebar section labels ───────────────────────────────── */
    .sb-label {{
        font-size: 0.70rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        opacity: 0.55;
        font-weight: 600;
        margin: 14px 0 6px 2px;
    }}

    /* ── Sidebar app header ───────────────────────────────────── */
    .sb-header {{
        display: flex; align-items: center; gap: 8px;
        margin-bottom: 14px;
    }}
    .sb-header h3 {{ margin: 0; font-size: 1.15rem; }}
    .sb-header .sb-badge {{
        background: var(--dk-t25);
        border: 1px solid var(--dk-accent);
        color: var(--dk-accent);
        border-radius: 6px;
        padding: 2px 8px;
        font-size: 0.7rem;
        font-weight: 700;
    }}

    </style>""", unsafe_allow_html=True)


# ── Helper components ─────────────────────────────────────────────────

def step_header(number: int, title: str, status: str = "active"):
    """Render a coloured step badge.  status: active / done / locked."""
    icon = "✓" if status == "done" else str(number)
    lbl_cls = "locked" if status == "locked" else ""
    st.markdown(
        f'<div class="step-row">'
        f'<span class="step-num {status}">{icon}</span>'
        f'<span class="step-lbl {lbl_cls}">{title}</span>'
        f'</div>',
        unsafe_allow_html=True,
    )


def results_banner(title: str = "Your results"):
    """Render a coloured results section header."""
    st.markdown(
        f'<div class="res-banner"><h3>📊 {title}</h3></div>',
        unsafe_allow_html=True,
    )


def fw_header(emoji: str, title: str, desc: str):
    """Render the framework header bar for the main content area."""
    st.markdown(
        f'<div class="fw-bar">'
        f'<h2>{emoji}  {title}</h2>'
        f'<p class="fw-sub">{desc}</p>'
        f'</div>',
        unsafe_allow_html=True,
    )


def locked_step(number: int, title: str, hint: str = ""):
    """Render a greyed-out placeholder for a step not yet reachable."""
    st.markdown(
        f'<div class="locked-box">'
        f'<div class="step-row">'
        f'<span class="step-num locked">{number}</span>'
        f'<span class="step-lbl locked">{title}</span>'
        f'</div>'
        + (
            f'<p style="margin:2px 0 0 38px;font-size:0.82rem;opacity:0.45">'
            f'{hint}</p>' if hint else ''
        )
        + f'</div>',
        unsafe_allow_html=True,
    )
