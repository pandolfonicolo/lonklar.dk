"""
Reference-data endpoints: tax metadata and live exchange rates.
"""

from fastapi import APIRouter
import os
import time
import httpx

from ..data import (
    DKK_PER_EUR,
    AM_RATE, BUNDSKAT_RATE,
    MELLEMSKAT_RATE,
    TOPSKAT_RATE,
    TOPTOPSKAT_RATE,
    SKATTELOFT,
    BESKAEFT_RATE, JOB_FRADRAG_RATE, FERIETILLAEG_RATE, FERIEPENGE_RATE,
    ATP_MONTHLY, ATP_MONTHLY_PARTTIME,
)
from ..tax_rules import TaxYearQuery, SUPPORTED_YEARS, rules_for_year


router = APIRouter(prefix="/api")


# ═══════════════════════════════════════════════════════════════════════
#  TAX METADATA
# ═══════════════════════════════════════════════════════════════════════

@router.get("/meta")
def get_meta(tax_year: TaxYearQuery = 2026):
    """Return tax year, kommune list, constants, and fallback exchange rate."""
    rules = rules_for_year(tax_year)
    return {
        "tax_year": rules.year,
        "supported_tax_years": SUPPORTED_YEARS,
        "data_freshness": {
            "rules_verified_on": rules.RULES_VERIFIED_ON,
            "site_updated_at": os.getenv("APP_UPDATED_AT") or None,
        },
        "dkk_per_eur": DKK_PER_EUR,
        "kommuner": {
            name: {
                "kommuneskat": rates["kommuneskat"],
                "kirkeskat": rates["kirkeskat"],
            }
            for name, rates in sorted(rules.KOMMUNER.items())
        },
        "constants": {
            "am_rate": AM_RATE,
            "personfradrag": rules.PERSONFRADRAG,
            "bundskat_rate": BUNDSKAT_RATE,
            "mellemskat_threshold": rules.MELLEMSKAT_THRESHOLD,
            "mellemskat_rate": MELLEMSKAT_RATE,
            "topskat_threshold": rules.TOPSKAT_THRESHOLD,
            "topskat_rate": TOPSKAT_RATE,
            "toptopskat_threshold": rules.TOPTOPSKAT_THRESHOLD,
            "toptopskat_rate": TOPTOPSKAT_RATE,
            "skatteloft": SKATTELOFT,
            "beskaeft_rate": BESKAEFT_RATE,
            "beskaeft_max": rules.BESKAEFT_MAX,
            "transport_rate_low": rules.BEFORDRING_RATE_LOW,
            "transport_rate_high": rules.BEFORDRING_RATE_HIGH,
            "free_phone_annual": rules.FRI_TELEFON_ANNUAL,
            "job_fradrag_threshold": rules.JOB_FRADRAG_THRESHOLD,
            "job_fradrag_rate": JOB_FRADRAG_RATE,
            "job_fradrag_max": rules.JOB_FRADRAG_MAX,
            "ferietillaeg_rate": FERIETILLAEG_RATE,
            "feriepenge_rate": FERIEPENGE_RATE,
            "atp_monthly_fulltime": ATP_MONTHLY,
            "atp_monthly_parttime": ATP_MONTHLY_PARTTIME,
            "su_udeboende_month": rules.SU_UDEBOENDE_MONTH,
            "su_hjemmeboende_base": rules.SU_HJEMMEBOENDE_BASE,
            "su_hjemmeboende_max": rules.SU_HJEMMEBOENDE_MAX,
            "fribeloeb_laveste_vid": rules.FRIBELOEB_LAVESTE_VID,
            "fribeloeb_laveste_ungdom": rules.FRIBELOEB_LAVESTE_UNGDOM,
            "fribeloeb_mellemste": rules.FRIBELOEB_MELLEMSTE,
            "fribeloeb_hoejeste": rules.FRIBELOEB_HOEJESTE,
            "fribeloeb_parent_bonus": rules.FRIBELOEB_PARENT_BONUS,
        },
        "salary_options": {
            "pension_types": {
                "standard": {
                    "supported": True,
                    "description": "Employee pension reduces taxable income; employer pension is non-cash compensation and is not taxed now.",
                },
                "section53a": {
                    "supported": True,
                    "description": "Employee and employer pension contributions are taxed as salary when paid into the pension.",
                },
            },
            "tax_schemes": {
                "standard": {
                    "supported": True,
                    "description": "Standard Danish payroll tax calculation with AM-bidrag, state, municipal, and optional church tax.",
                },
                "researcher": {
                    "supported": False,
                    "description": "Researcher tax scheme is not modeled because eligibility and detailed payroll treatment require individual assessment.",
                },
            },
        },
    }


# ═══════════════════════════════════════════════════════════════════════
#  EXCHANGE RATES (cached 1 hour)
# ═══════════════════════════════════════════════════════════════════════

_exchange_cache: dict = {"rates": {}, "timestamp": 0.0, "date": None, "source": "fallback"}
_CACHE_TTL = 3600  # 1 hour in seconds

# Currencies to offer (code → symbol)
SUPPORTED_CURRENCIES = {
    "EUR": "€",
    "NZD": "NZ$",
    "USD": "$",
    "GBP": "£",
    "SEK": "kr",
    "NOK": "kr",
    "PLN": "zł",
    "CHF": "Fr",
    "JPY": "¥",
    "CAD": "C$",
    "AUD": "A$",
    "INR": "₹",
    "BRL": "R$",
    "TRY": "₺",
}

# Fallback rates (DKK per 1 unit of foreign currency)
# Approximate rates, updated around 2026-06-29.
FALLBACK_RATES = {
    "EUR": 7.47,
    "NZD": 3.70,
    "USD": 6.54,
    "GBP": 8.67,
    "SEK": 0.67,
    "NOK": 0.66,
    "PLN": 1.74,
    "CHF": 8.10,
    "JPY": 0.040,
    "CAD": 4.61,
    "AUD": 4.51,
    "INR": 0.069,
    "BRL": 1.26,
    "TRY": 0.14,
}


async def _fetch_exchange_rates() -> dict[str, float]:
    """Fetch DKK-based exchange rates from frankfurter.app (free, no key)."""
    now = time.time()
    if _exchange_cache["rates"] and (now - _exchange_cache["timestamp"]) < _CACHE_TTL:
        return _exchange_cache["rates"]

    codes = ",".join(SUPPORTED_CURRENCIES.keys())
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.get(f"https://api.frankfurter.app/latest?from=DKK&to={codes}")
            resp.raise_for_status()
            data = resp.json()
            # frankfurter gives rates as "1 DKK = X foreign", we want "1 foreign = X DKK"
            rates = {}
            for code, rate in data.get("rates", {}).items():
                if rate and rate > 0:
                    rates[code] = round(1.0 / rate, 6)
            _exchange_cache["rates"] = rates
            _exchange_cache["timestamp"] = now
            _exchange_cache["date"] = data.get("date")
            _exchange_cache["source"] = "frankfurter.app"
            return rates
    except Exception as e:
        print(f"[exchange] fetch failed: {e}, using fallback")
        if _exchange_cache["rates"]:
            return _exchange_cache["rates"]
        _exchange_cache["timestamp"] = now
        _exchange_cache["date"] = "2026-06-29"
        _exchange_cache["source"] = "fallback"
        return FALLBACK_RATES


@router.get("/exchange-rates")
async def get_exchange_rates():
    """Return live exchange rates (DKK per 1 unit of foreign currency), cached 1h."""
    rates = await _fetch_exchange_rates()
    return {
        "base": "DKK",
        "rates": rates,
        "currencies": SUPPORTED_CURRENCIES,
        "source": _exchange_cache["source"],
        "date": _exchange_cache["date"],
        "cached_until": int(_exchange_cache["timestamp"] + _CACHE_TTL),
    }
