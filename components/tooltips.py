"""
Tax tooltips — hover explanations for tax concepts.
"""

from data import (
    TAX_YEAR,
    AM_RATE, PERSONFRADRAG,
    BUNDSKAT_RATE,
    MELLEMSKAT_THRESHOLD, MELLEMSKAT_RATE,
    TOPSKAT_THRESHOLD, TOPSKAT_RATE,
    TOPTOPSKAT_THRESHOLD, TOPTOPSKAT_RATE,
    SKATTELOFT,
    BESKAEFT_RATE, BESKAEFT_MAX,
    JOB_FRADRAG_RATE, JOB_FRADRAG_MAX,
    FRIBELOEB_LAVESTE_VID,
)

TAX_TIPS = {
    "gross": (
        "Gross salary is your total pay before any deductions — pension, "
        "AM-bidrag, or income tax."
    ),
    "net": (
        "Net salary is what you actually receive after all deductions "
        "(pension, AM-bidrag, income tax, and any after-tax items)."
    ),
    "effective_rate": (
        "Effective tax rate = total deductions / total gross income. "
        "It shows the real proportion of your income going to taxes, "
        "pension, and mandatory contributions."
    ),
    "am_bidrag": (
        "AM-bidrag (arbejdsmarkedsbidrag) is an 8 % labour-market "
        "contribution deducted from all earned income before income "
        "tax is calculated. It funds unemployment benefits and "
        "active labour-market programmes."
    ),
    "bundskat": (
        "Bundskat is the base state income tax (12.01 %) applied to "
        "income above the personal allowance (personfradrag). Everyone "
        "with taxable income pays it."
    ),
    "kommuneskat": (
        "Kommuneskat is the municipal income tax, set individually by "
        "each of Denmark's 98 municipalities. It typically ranges from "
        "23 % to 27 % and is the largest single tax component."
    ),
    "kirkeskat": (
        "Kirkeskat is a church tax (0.4–1.3 %) only paid by members "
        "of the Folkekirken (Danish National Church). You can opt out "
        "by leaving the church."
    ),
    "mellemskat": (
        "Mellemskat (7.5 %) applies to income exceeding "
        f"{MELLEMSKAT_THRESHOLD:,} kr/year after AM-bidrag. "
        "Part of the progressive bracket system."
    ),
    "topskat": (
        "Topskat (7.5 %) applies to income exceeding "
        f"{TOPSKAT_THRESHOLD:,} kr/year after AM-bidrag. "
        "Subject to the skatteloft ceiling."
    ),
    "toptopskat": (
        "Toptopskat (5 %) applies to income exceeding "
        f"{TOPTOPSKAT_THRESHOLD:,} kr/year. "
        "Introduced in 2026 for very high earners."
    ),
    "personfradrag": (
        f"Personfradrag is the annual personal tax allowance "
        f"({PERSONFRADRAG:,} kr in {TAX_YEAR}). Income below this "
        f"amount is effectively tax-free (at the municipal level)."
    ),
    "beskaeft": (
        f"Beskæftigelsesfradrag is the employment deduction "
        f"({BESKAEFT_RATE*100:.2f} %, max {BESKAEFT_MAX:,} kr) that "
        f"reduces your municipal tax base."
    ),
    "jobfradrag": (
        f"Jobfradrag is an additional employment deduction "
        f"({JOB_FRADRAG_RATE*100:.1f} %, max {JOB_FRADRAG_MAX:,} kr) "
        f"also reducing your municipal tax base."
    ),
    "skatteloft": (
        f"Skatteloft is the tax ceiling ({SKATTELOFT*100:.2f} %). "
        f"It caps the combined state + municipal marginal tax rate "
        f"so it never exceeds this limit."
    ),
    "feriepenge": (
        "Feriepenge (12.5 %) is holiday pay set aside by employers "
        "for hourly workers, paid out during vacation periods. "
        "It counts as taxable income."
    ),
    "ferietillaeg": (
        "Ferietillæg (1 %) is a holiday supplement paid to salaried "
        "employees on top of regular salary."
    ),
    "pension": (
        "Pension contributions are deducted from gross salary before "
        "AM-bidrag, reducing your taxable income. Employer contributions "
        "go straight to your pension and are not taxed."
    ),
    "atp": (
        "ATP (Arbejdsmarkedets Tillægspension) is a mandatory "
        "supplementary pension. Employee pays ~95 kr/month, "
        "employer pays ~190 kr/month on top."
    ),
    "fribeloeb": (
        "Fribeløb is the annual earnings limit for SU recipients. "
        "Three tiers exist: laveste (SU months), mellemste (enrolled but "
        "opted out / leave), and højeste (not enrolled / no SU right). "
        "Exceeding it requires repaying SU krone-for-krone on the "
        "excess, plus 9.75 % interest."
    ),
    "egenindkomst": (
        "Egenindkomst is your personal earned income after AM-bidrag, "
        "including feriepenge — the figure used to check fribeløb compliance."
    ),
    "su": (
        "SU (Statens Uddannelsesstøtte) is the Danish government "
        "education grant for students in qualifying programmes."
    ),
}
