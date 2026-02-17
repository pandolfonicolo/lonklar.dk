"""
Reference-data endpoints: tax metadata and live exchange rates.
"""

from fastapi import APIRouter
import time
import httpx

from ..data import (
    KOMMUNER, TAX_YEAR, DKK_PER_EUR,
    AM_RATE, PERSONFRADRAG, BUNDSKAT_RATE,
    MELLEMSKAT_THRESHOLD, MELLEMSKAT_RATE,
    TOPSKAT_THRESHOLD, TOPSKAT_RATE,
    TOPTOPSKAT_THRESHOLD, TOPTOPSKAT_RATE,
    SKATTELOFT,
    BESKAEFT_RATE, BESKAEFT_MAX,
    JOB_FRADRAG_RATE, JOB_FRADRAG_MAX,
    SU_UDEBOENDE_MONTH, SU_HJEMMEBOENDE_BASE, SU_HJEMMEBOENDE_MAX,
    FRIBELOEB_LAVESTE_UNGDOM, FRIBELOEB_LAVESTE_VID,
    FRIBELOEB_MELLEMSTE, FRIBELOEB_HOEJESTE,
    FRIBELOEB_PARENT_BONUS, SU_REPAYMENT_INTEREST_RATE,
    FERIETILLAEG_RATE, FERIEPENGE_RATE,
    ATP_MONTHLY, ATP_MONTHLY_PARTTIME,
)

router = APIRouter(prefix="/api")


# ═══════════════════════════════════════════════════════════════════════
#  TAX METADATA
# ═══════════════════════════════════════════════════════════════════════

@router.get("/meta")
def get_meta():
    """Return tax year, kommune list, constants, and fallback exchange rate."""
    return {
        "tax_year": TAX_YEAR,
        "dkk_per_eur": DKK_PER_EUR,
        "kommuner": {
            name: {
                "kommuneskat": rates["kommuneskat"],
                "kirkeskat": rates["kirkeskat"],
            }
            for name, rates in sorted(KOMMUNER.items())
        },
        "constants": {
            "am_rate": AM_RATE,
            "personfradrag": PERSONFRADRAG,
            "bundskat_rate": BUNDSKAT_RATE,
            "mellemskat_threshold": MELLEMSKAT_THRESHOLD,
            "mellemskat_rate": MELLEMSKAT_RATE,
            "topskat_threshold": TOPSKAT_THRESHOLD,
            "topskat_rate": TOPSKAT_RATE,
            "toptopskat_threshold": TOPTOPSKAT_THRESHOLD,
            "toptopskat_rate": TOPTOPSKAT_RATE,
            "skatteloft": SKATTELOFT,
            "beskaeft_rate": BESKAEFT_RATE,
            "beskaeft_max": BESKAEFT_MAX,
            "job_fradrag_rate": JOB_FRADRAG_RATE,
            "job_fradrag_max": JOB_FRADRAG_MAX,
            "ferietillaeg_rate": FERIETILLAEG_RATE,
            "feriepenge_rate": FERIEPENGE_RATE,
            "atp_monthly_fulltime": ATP_MONTHLY,
            "atp_monthly_parttime": ATP_MONTHLY_PARTTIME,
            "su_udeboende_month": SU_UDEBOENDE_MONTH,
            "su_hjemmeboende_base": SU_HJEMMEBOENDE_BASE,
            "su_hjemmeboende_max": SU_HJEMMEBOENDE_MAX,
            "fribeloeb_laveste_vid": FRIBELOEB_LAVESTE_VID,
            "fribeloeb_laveste_ungdom": FRIBELOEB_LAVESTE_UNGDOM,
            "fribeloeb_mellemste": FRIBELOEB_MELLEMSTE,
            "fribeloeb_hoejeste": FRIBELOEB_HOEJESTE,
            "fribeloeb_parent_bonus": FRIBELOEB_PARENT_BONUS,
            "su_repayment_interest_rate": SU_REPAYMENT_INTEREST_RATE,
        },
    }


# ═══════════════════════════════════════════════════════════════════════
#  EXCHANGE RATES (cached 1 hour)
# ═══════════════════════════════════════════════════════════════════════

_exchange_cache: dict = {"rates": {}, "timestamp": 0.0}
_CACHE_TTL = 3600  # 1 hour in seconds

# Currencies to offer (code → symbol)
SUPPORTED_CURRENCIES = {
    "EUR": "€",
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
FALLBACK_RATES = {
    "EUR": 7.45,
    "USD": 6.85,
    "GBP": 8.65,
    "SEK": 0.65,
    "NOK": 0.65,
    "PLN": 1.65,
    "CHF": 7.75,
    "JPY": 0.046,
    "CAD": 5.05,
    "AUD": 4.45,
    "INR": 0.082,
    "BRL": 1.20,
    "TRY": 0.19,
}


async def _fetch_exchange_rates() -> dict[str, float]:
    """Fetch DKK-based exchange rates from frankfurter.app (free, no key)."""
    now = time.time()
    if _exchange_cache["rates"] and (now - _exchange_cache["timestamp"]) < _CACHE_TTL:
        return _exchange_cache["rates"]

    codes = ",".join(SUPPORTED_CURRENCIES.keys())
    try:
        async with httpx.AsyncClient(timeout=10) as client:
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
            return rates
    except Exception as e:
        print(f"[exchange] fetch failed: {e}, using fallback")
        if _exchange_cache["rates"]:
            return _exchange_cache["rates"]
        return FALLBACK_RATES


@router.get("/exchange-rates")
async def get_exchange_rates():
    """Return live exchange rates (DKK per 1 unit of foreign currency), cached 1h."""
    rates = await _fetch_exchange_rates()
    return {
        "base": "DKK",
        "rates": rates,
        "currencies": SUPPORTED_CURRENCIES,
        "cached_until": int(_exchange_cache["timestamp"] + _CACHE_TTL),
    }
