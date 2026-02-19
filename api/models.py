"""
Pydantic request / response models for the DK Income Calculator API.
"""

from pydantic import BaseModel, Field


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
#  FEEDBACK — request models
# ═══════════════════════════════════════════════════════════════════════

class FeedbackRequest(BaseModel):
    type: str = Field(..., description="bug | feature | general")
    message: str = Field(..., min_length=1)
    email: str | None = None


class AccuracyReportRequest(BaseModel):
    service_type: str = Field(..., description="fulltime | parttime | student")
    estimated_net_monthly: float
    actual_net_monthly: float
    inputs: dict = Field(default_factory=dict, description="Original calculation inputs")


class VoteRequest(BaseModel):
    vote: str = Field(..., description="up | down")
    service_type: str = Field(..., description="fulltime | parttime | student")
    estimated_net: float = Field(0)
