"""Rules for each supported tax year; data.py remains the 2026 baseline."""
from dataclasses import dataclass, replace
from types import MappingProxyType
from typing import Annotated, Mapping

from fastapi import Query

from . import data

TaxYearQuery = Annotated[int, Query(ge=2026, le=2027, description="Income year")]
SUPPORTED_YEARS = (2026, 2027)


def freeze_municipalities(values):
    return MappingProxyType({name: MappingProxyType(rates) for name, rates in values.items()})


@dataclass(frozen=True)
class TaxRules:
    year: int
    KOMMUNER: Mapping[str, Mapping[str, float]]
    CALCULATION_VERSION: str = data.CALCULATION_VERSION
    RULES_VERIFIED_ON: str = data.RULES_VERIFIED_ON
    PERSONFRADRAG: int = data.PERSONFRADRAG
    MELLEMSKAT_THRESHOLD: int = data.MELLEMSKAT_THRESHOLD
    TOPSKAT_THRESHOLD: int = data.TOPSKAT_THRESHOLD
    TOPTOPSKAT_THRESHOLD: int = data.TOPTOPSKAT_THRESHOLD
    BESKAEFT_MAX: int = data.BESKAEFT_MAX
    JOB_FRADRAG_THRESHOLD: int = data.JOB_FRADRAG_THRESHOLD
    JOB_FRADRAG_MAX: int = data.JOB_FRADRAG_MAX
    SU_UDEBOENDE_MONTH: int = data.SU_UDEBOENDE_MONTH
    SU_HJEMMEBOENDE_BASE: int = data.SU_HJEMMEBOENDE_BASE
    SU_HJEMMEBOENDE_MAX: int = data.SU_HJEMMEBOENDE_MAX
    SU_LOAN_MONTHLY: int = data.SU_LOAN_MONTHLY
    FRIBELOEB_LAVESTE_UNGDOM: int = data.FRIBELOEB_LAVESTE_UNGDOM
    FRIBELOEB_LAVESTE_VID: int = data.FRIBELOEB_LAVESTE_VID
    FRIBELOEB_MELLEMSTE: int = data.FRIBELOEB_MELLEMSTE
    FRIBELOEB_HOEJESTE: int = data.FRIBELOEB_HOEJESTE
    FRIBELOEB_NEDSAT: int = data.FRIBELOEB_NEDSAT
    FRIBELOEB_PARENT_BONUS: int = data.FRIBELOEB_PARENT_BONUS
    BEFORDRING_RATE_LOW: float = data.BEFORDRING_RATE_LOW
    BEFORDRING_RATE_HIGH: float = data.BEFORDRING_RATE_HIGH
    FRI_TELEFON_ANNUAL: int = data.FRI_TELEFON_ANNUAL


RULES_2026 = TaxRules(2026, freeze_municipalities(data.KOMMUNER))

# Ministry workbook, 2027 tab, columns A/F/G; only differences from the frozen 2026 data.
# https://svmn.dk/media/edpptjbc/kommuneskattesatser_2027.xlsx
_MUNICIPAL_OVERRIDES = {
    'Ballerup': {'kommuneskat': 25.5, 'kirkeskat': 0.8},
    'Fredensborg': {'kommuneskat': 25.9, 'kirkeskat': 0.64},
    'Frederikssund': {'kommuneskat': 25.5, 'kirkeskat': 0.96},
    'Gentofte': {'kommuneskat': 24.04, 'kirkeskat': 0.4},
    'Gladsaxe': {'kommuneskat': 23.5, 'kirkeskat': 0.75},
    'Helsingør': {'kommuneskat': 25.82, 'kirkeskat': 0.74},
    'Hjørring': {'kommuneskat': 26.3, 'kirkeskat': 1.19},
    'Holstebro': {'kommuneskat': 26, 'kirkeskat': 1.08},
    'Hørsholm': {'kommuneskat': 24.4, 'kirkeskat': 0.64},
    'Kalundborg': {'kommuneskat': 24.6, 'kirkeskat': 1.01},
    'Lyngby-Taarbæk': {'kommuneskat': 24.38, 'kirkeskat': 0.62},
    'Morsø': {'kommuneskat': 26.05, 'kirkeskat': 1.2},
    'Odder': {'kommuneskat': 25.6, 'kirkeskat': 0.95},
    'Rudersdal': {'kommuneskat': 23.47, 'kirkeskat': 0.56},
    'Viborg': {'kommuneskat': 25.7, 'kirkeskat': 0.93},
    'Ærø': {'kommuneskat': 26.1, 'kirkeskat': 1.2},
}

RULES_2027 = replace(
    RULES_2026,
    year=2027,
    KOMMUNER=freeze_municipalities({**data.KOMMUNER, **_MUNICIPAL_OVERRIDES}),
    CALCULATION_VERSION='2027-rules-2026-11-25.1',
    RULES_VERIFIED_ON='2026-11-25',
    PERSONFRADRAG=55700,
    MELLEMSKAT_THRESHOLD=659900,
    TOPSKAT_THRESHOLD=800500,
    TOPTOPSKAT_THRESHOLD=2668200,
    BESKAEFT_MAX=65200,
    JOB_FRADRAG_THRESHOLD=242100,
    JOB_FRADRAG_MAX=3200,
    SU_UDEBOENDE_MONTH=7608,
    SU_HJEMMEBOENDE_BASE=1182,
    SU_HJEMMEBOENDE_MAX=3280,
    SU_LOAN_MONTHLY=3892,
    FRIBELOEB_LAVESTE_UNGDOM=15741,
    FRIBELOEB_LAVESTE_VID=21351,
    FRIBELOEB_MELLEMSTE=24282,
    FRIBELOEB_HOEJESTE=46737,
    FRIBELOEB_NEDSAT=4035,
    FRIBELOEB_PARENT_BONUS=35119,
    BEFORDRING_RATE_LOW=2.44,
    BEFORDRING_RATE_HIGH=1.22,
    FRI_TELEFON_ANNUAL=3600,
)


def rules_for_year(year: int) -> TaxRules:
    return {2026: RULES_2026, 2027: RULES_2027}[year]
