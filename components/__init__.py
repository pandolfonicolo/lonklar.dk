"""
components — reusable UI building blocks.

Convenience re-exports so pages can do:
    from components import fmt, TAX_TIPS, pct_slider, ...
"""

from components.tooltips import TAX_TIPS
from components.constants import (
    ATP_MIN_HOURS_WEEK, ATP_MIN_HOURS_MONTH,
    COLLECTIVE_MIN_HOURS_WEEK, COLLECTIVE_MIN_HOURS_MONTH,
    MONTH_NAMES, MONTH_NAMES_FULL,
)
from components.formatting import fmt, fetch_dkk_per_eur
from components.inputs import pct_slider, int_slider, period_clear, salary_input
from components.benefits import render_benefits, COMMON_ITEMS, CATEGORY_META
from components.results import render_result, render_glossary
from components.charts import render_curve
from components.footer import render_footer
from components.theme import (
    inject_theme_css, step_header, results_banner, fw_header, locked_step,
    FW_COLORS,
)
