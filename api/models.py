"""
Pydantic request / response models for the DK Income Calculator API.
"""

from pydantic import BaseModel, Field, field_validator


# ═══════════════════════════════════════════════════════════════════════
#  COMPUTE — request models
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
    transport_km: float = Field(0.0, description="Round-trip daily commute in km")
    union_fees_annual: float = Field(0.0, description="Annual trade union + a-kasse fees")


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
    transport_km: float = Field(0.0, description="Round-trip daily commute in km")
    union_fees_annual: float = Field(0.0, description="Annual trade union + a-kasse fees")


class StudentRequest(BaseModel):
    su_monthly: float = Field(7426.0, description="Monthly SU before tax")
    work_gross_monthly: float = Field(..., description="Monthly gross work income")
    kommune: str = Field("København", description="Municipality name")
    pension_pct: float = Field(0.0, description="Employee pension %")
    employer_pension_pct: float = Field(0.0, description="Employer pension %")
    is_church: bool = Field(True)
    aars_fribeloeb: float | None = Field(None, description="Annual fribeløb (null = default)")


# ═══════════════════════════════════════════════════════════════════════
#  CURVE — request models
# ═══════════════════════════════════════════════════════════════════════

class CurveRequest(BaseModel):
    kommune: str = Field("København")
    pension_pct: float = Field(4.0)
    employer_pension_pct: float = Field(8.0)
    is_church: bool = Field(True)
    is_hourly: bool = Field(False)
    atp_monthly: float = Field(94.65)
    other_pay_monthly: float = Field(0.0)
    taxable_benefits_monthly: float = Field(0.0)
    pretax_deductions_monthly: float = Field(0.0)
    aftertax_deductions_monthly: float = Field(0.0)
    transport_km: float = Field(0.0)
    union_fees_annual: float = Field(0.0)
    max_gross: float = Field(1_200_000)
    min_gross: float = Field(0)
    step_monthly: float = Field(0)       # 0 = use legacy `points` logic
    points: int = Field(50)


class HoursCurveRequest(BaseModel):
    hourly_rate: float
    kommune: str = Field("København")
    pension_pct: float = Field(0.0)
    employer_pension_pct: float = Field(0.0)
    is_church: bool = Field(True)
    atp_monthly: float = Field(0.0)
    other_pay_monthly: float = Field(0.0)
    taxable_benefits_monthly: float = Field(0.0)
    pretax_deductions_monthly: float = Field(0.0)
    aftertax_deductions_monthly: float = Field(0.0)
    transport_km: float = Field(0.0)
    union_fees_annual: float = Field(0.0)
    max_hours: int = Field(220)


class StudentHoursCurveRequest(BaseModel):
    hourly_rate: float = Field(..., description="Student hourly wage in DKK")
    su_monthly: float = Field(7426.0, description="Monthly SU before tax")
    kommune: str = Field("København")
    pension_pct: float = Field(0.0)
    employer_pension_pct: float = Field(0.0)
    is_church: bool = Field(True)
    aars_fribeloeb: float | None = Field(None)
    max_hours: int = Field(220)
    step: int = Field(5)


# ═══════════════════════════════════════════════════════════════════════
#  FEEDBACK — request models (privacy-minimised, length-capped)
# ═══════════════════════════════════════════════════════════════════════

class FeedbackRequest(BaseModel):
    type: str = Field(..., description="bug | feature | general", max_length=20)
    message: str = Field(..., min_length=1, max_length=2000)

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"bug", "feature", "general"}
        if v not in allowed:
            raise ValueError(f"type must be one of {allowed}")
        return v


class AccuracyReportRequest(BaseModel):
    service_type: str = Field(..., description="fulltime | parttime | student", max_length=20)
    estimated_net_monthly: float = Field(..., ge=0, le=10_000_000)
    actual_net_monthly: float = Field(..., ge=0, le=10_000_000)
    inputs: dict = Field(default_factory=dict, description="Original calculation inputs")

    @field_validator("service_type")
    @classmethod
    def validate_service_type(cls, v: str) -> str:
        allowed = {"fulltime", "parttime", "student"}
        if v not in allowed:
            raise ValueError(f"service_type must be one of {allowed}")
        return v

    @field_validator("inputs")
    @classmethod
    def cap_inputs_size(cls, v: dict) -> dict:
        """Reject inputs dicts larger than ~32 KB when serialized."""
        import json
        if len(json.dumps(v, default=str)) > 32_768:
            raise ValueError("inputs payload too large (max 32 KB)")
        return v


class VoteRequest(BaseModel):
    vote: str = Field(..., description="up | down", max_length=10)
    service_type: str = Field(..., description="fulltime | parttime | student", max_length=20)
    estimated_net: float = Field(0, ge=0, le=10_000_000)

    @field_validator("vote")
    @classmethod
    def validate_vote(cls, v: str) -> str:
        allowed = {"up", "down"}
        if v not in allowed:
            raise ValueError(f"vote must be one of {allowed}")
        return v

    @field_validator("service_type")
    @classmethod
    def validate_service_type(cls, v: str) -> str:
        allowed = {"fulltime", "parttime", "student"}
        if v not in allowed:
            raise ValueError(f"service_type must be one of {allowed}")
        return v
