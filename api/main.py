"""
FastAPI backend — exposes the tax engine as a REST API for the React frontend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import sys, os, json, time, httpx
from datetime import datetime, timezone
from pathlib import Path

# Add parent directory to path so we can import data/tax_engine
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data import (
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
from tax_engine import compute_tax, compute_student_income

app = FastAPI(title="DK Income Calculator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════
#  REQUEST / RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════

class FullTimeRequest(BaseModel):
    gross_annual: float = Field(..., description="Gross annual salary in DKK")
    kommune: str = Field("København", description="Municipality name")
    pension_pct: float = Field(4.0, description="Employee pension % (0-15)")
    employer_pension_pct: float = Field(8.0, description="Employer pension % (0-20)")
    is_church: bool = Field(True, description="Member of Folkekirken?")
    other_pay_monthly: float = Field(0.0, description="Extra monthly pay (broadband etc.)")
    taxable_benefits_monthly: float = Field(0.0, description="Monthly taxable benefits")
    pretax_deductions_monthly: float = Field(0.0, description="Monthly pre-tax deductions")
    aftertax_deductions_monthly: float = Field(0.0, description="Monthly after-tax deductions")
    atp_monthly: float = Field(94.65, description="Monthly ATP contribution")


class PartTimeRequest(BaseModel):
    hourly_rate: float = Field(..., description="Hourly rate in DKK")
    hours_month: float = Field(..., description="Hours worked per month")
    kommune: str = Field("København", description="Municipality name")
    pension_pct: float = Field(0.0, description="Employee pension % (0-15)")
    employer_pension_pct: float = Field(0.0, description="Employer pension % (0-20)")
    is_church: bool = Field(True, description="Member of Folkekirken?")
    other_pay_monthly: float = Field(0.0)
    taxable_benefits_monthly: float = Field(0.0)
    pretax_deductions_monthly: float = Field(0.0)
    aftertax_deductions_monthly: float = Field(0.0)
    atp_monthly: float = Field(0.0, description="Monthly ATP (0 if <9h/week)")


class StudentRequest(BaseModel):
    su_monthly: float = Field(7426.0, description="Monthly SU before tax")
    work_gross_monthly: float = Field(..., description="Monthly gross work income")
    kommune: str = Field("København", description="Municipality name")
    pension_pct: float = Field(0.0, description="Employee pension %")
    employer_pension_pct: float = Field(0.0, description="Employer pension %")
    is_church: bool = Field(True)
    aars_fribeloeb: float | None = Field(None, description="Annual fribeløb (null = default)")


# ═══════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@app.get("/api/meta")
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


@app.post("/api/compute/fulltime")
def compute_fulltime(req: FullTimeRequest):
    """Full-time salary tax calculation."""
    if req.kommune not in KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}

    rates = KOMMUNER[req.kommune]
    res = compute_tax(
        gross_annual=req.gross_annual,
        pension_pct=req.pension_pct / 100,
        kommune_pct=rates["kommuneskat"],
        kirke_pct=rates["kirkeskat"],
        is_church=req.is_church,
        has_employment_income=True,
        employer_pension_pct=req.employer_pension_pct / 100,
        is_hourly=False,
        taxable_benefits_annual=req.taxable_benefits_monthly * 12,
        other_pay_annual=req.other_pay_monthly * 12,
        pretax_deductions_annual=req.pretax_deductions_monthly * 12,
        aftertax_deductions_annual=req.aftertax_deductions_monthly * 12,
        atp_monthly=req.atp_monthly,
    )
    return {
        "kommune": req.kommune,
        "kommune_pct": rates["kommuneskat"],
        "kirke_pct": rates["kirkeskat"],
        **res,
    }


@app.post("/api/compute/parttime")
def compute_parttime(req: PartTimeRequest):
    """Part-time / hourly tax calculation."""
    if req.kommune not in KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}

    rates = KOMMUNER[req.kommune]
    gross_annual = req.hourly_rate * req.hours_month * 12

    res = compute_tax(
        gross_annual=gross_annual,
        pension_pct=req.pension_pct / 100,
        kommune_pct=rates["kommuneskat"],
        kirke_pct=rates["kirkeskat"],
        is_church=req.is_church,
        has_employment_income=True,
        employer_pension_pct=req.employer_pension_pct / 100,
        is_hourly=True,
        taxable_benefits_annual=req.taxable_benefits_monthly * 12,
        other_pay_annual=req.other_pay_monthly * 12,
        pretax_deductions_annual=req.pretax_deductions_monthly * 12,
        aftertax_deductions_annual=req.aftertax_deductions_monthly * 12,
        atp_monthly=req.atp_monthly,
    )
    return {
        "kommune": req.kommune,
        "kommune_pct": rates["kommuneskat"],
        "kirke_pct": rates["kirkeskat"],
        "hourly_rate": req.hourly_rate,
        "hours_month": req.hours_month,
        **res,
    }


@app.post("/api/compute/student")
def compute_student(req: StudentRequest):
    """Student (SU + work) tax calculation."""
    if req.kommune not in KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}

    rates = KOMMUNER[req.kommune]
    res = compute_student_income(
        su_monthly=req.su_monthly,
        work_gross_monthly=req.work_gross_monthly,
        pension_pct=req.pension_pct / 100,
        kommune_pct=rates["kommuneskat"],
        kirke_pct=rates["kirkeskat"],
        is_church=req.is_church,
        employer_pension_pct=req.employer_pension_pct / 100,
        aars_fribeloeb=req.aars_fribeloeb,
    )
    return {
        "kommune": req.kommune,
        "kommune_pct": rates["kommuneskat"],
        "kirke_pct": rates["kirkeskat"],
        **res,
    }


# ═══════════════════════════════════════════════════════════════════════
#  CURVE ENDPOINTS (for charts)
# ═══════════════════════════════════════════════════════════════════════

class CurveRequest(BaseModel):
    kommune: str = Field("København")
    pension_pct: float = Field(4.0)
    employer_pension_pct: float = Field(8.0)
    is_church: bool = Field(True)
    is_hourly: bool = Field(False)
    atp_monthly: float = Field(94.65)
    max_gross: float = Field(1_200_000)
    points: int = Field(50)


class HoursCurveRequest(BaseModel):
    hourly_rate: float
    kommune: str = Field("København")
    pension_pct: float = Field(0.0)
    employer_pension_pct: float = Field(0.0)
    is_church: bool = Field(True)
    atp_monthly: float = Field(0.0)
    max_hours: int = Field(300)


@app.post("/api/compute/curve")
def compute_curve(req: CurveRequest):
    """Return net-vs-gross curve data for charts."""
    if req.kommune not in KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}
    rates = KOMMUNER[req.kommune]
    step = req.max_gross / req.points
    data = []
    for i in range(req.points + 1):
        gross = step * i
        r = compute_tax(
            gross, req.pension_pct / 100,
            rates["kommuneskat"], rates["kirkeskat"],
            req.is_church,
            employer_pension_pct=req.employer_pension_pct / 100,
            is_hourly=req.is_hourly,
            atp_monthly=req.atp_monthly,
        )
        data.append({
            "gross_annual": round(gross),
            "gross_monthly": round(gross / 12),
            "net_monthly": round(r["net_monthly"]),
            "effective_rate": round(r["effective_tax_rate"], 2),
        })
    return data


@app.post("/api/compute/hours-curve")
def compute_hours_curve(req: HoursCurveRequest):
    """Return net-vs-hours curve data for part-time charts."""
    if req.kommune not in KOMMUNER:
        return {"error": f"Unknown kommune: {req.kommune}"}
    rates = KOMMUNER[req.kommune]
    data = []
    for h in range(0, req.max_hours + 1, 5):
        gross_annual = req.hourly_rate * h * 12
        r = compute_tax(
            gross_annual, req.pension_pct / 100,
            rates["kommuneskat"], rates["kirkeskat"],
            req.is_church,
            employer_pension_pct=req.employer_pension_pct / 100,
            is_hourly=True,
            atp_monthly=req.atp_monthly,
        )
        data.append({
            "hours_month": h,
            "gross_monthly": round(gross_annual / 12),
            "net_monthly": round(r["net_monthly"]),
            "effective_rate": round(r["effective_tax_rate"], 2),
        })
    return data


# ═══════════════════════════════════════════════════════════════════════
#  FEEDBACK & ACCURACY REPORTS
# ═══════════════════════════════════════════════════════════════════════

FEEDBACK_DIR = Path(os.path.dirname(os.path.abspath(__file__))).parent / "feedback_data"


def _append_jsonl(filename: str, record: dict):
    """Append a JSON record to a JSONL file (one JSON object per line)."""
    FEEDBACK_DIR.mkdir(exist_ok=True)
    filepath = FEEDBACK_DIR / filename
    record["timestamp"] = datetime.now(timezone.utc).isoformat()
    with open(filepath, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


class FeedbackRequest(BaseModel):
    type: str = Field(..., description="bug | feature | general")
    message: str = Field(..., min_length=1)
    email: str | None = None


class AccuracyReportRequest(BaseModel):
    service_type: str = Field(..., description="fulltime | parttime | student")
    estimated_net_monthly: float
    actual_net_monthly: float
    inputs: dict = Field(default_factory=dict, description="Original calculation inputs")


@app.post("/api/feedback")
async def submit_feedback(req: FeedbackRequest):
    _append_jsonl("feedback.jsonl", req.model_dump())
    return {"status": "ok"}


@app.post("/api/accuracy-report")
async def submit_accuracy_report(req: AccuracyReportRequest):
    data = req.model_dump()
    data["difference"] = round(req.actual_net_monthly - req.estimated_net_monthly, 2)
    data["difference_pct"] = (
        round((req.actual_net_monthly - req.estimated_net_monthly) / req.estimated_net_monthly * 100, 2)
        if req.estimated_net_monthly else 0
    )
    _append_jsonl("accuracy_reports.jsonl", data)
    return {"status": "ok"}


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


@app.get("/api/exchange-rates")
async def get_exchange_rates():
    """Return live exchange rates (DKK per 1 unit of foreign currency), cached 1h."""
    rates = await _fetch_exchange_rates()
    return {
        "base": "DKK",
        "rates": rates,
        "currencies": SUPPORTED_CURRENCIES,
        "cached_until": int(_exchange_cache["timestamp"] + _CACHE_TTL),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
