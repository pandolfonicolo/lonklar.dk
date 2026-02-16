"""
Shared UI constants — thresholds and month names.
"""

import calendar

ATP_MIN_HOURS_WEEK = 9
ATP_MIN_HOURS_MONTH = 39
COLLECTIVE_MIN_HOURS_WEEK = 8
COLLECTIVE_MIN_HOURS_MONTH = 35

MONTH_NAMES = [calendar.month_abbr[m] for m in range(1, 13)]
MONTH_NAMES_FULL = [calendar.month_name[m] for m in range(1, 13)]
