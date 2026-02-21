"""
Danish tax & SU constants for tax year 2026.

Sources:
  • skat.dk/hjaelp/satser
  • skm.dk  oversigt-over-kommuneskatter
  • su.dk/satser
"""

TAX_YEAR = 2026

# ── AM-bidrag (labour-market contribution) ───────────────────────────
AM_RATE = 0.08

# ── Personfradrag (personal tax allowance) — annual, age ≥ 18 ───────
PERSONFRADRAG = 54_100  # kr/year

# ── State tax: bundskat ──────────────────────────────────────────────
BUNDSKAT_RATE = 0.1201  # 12.01 %

# ── Progressive brackets (thresholds AFTER AM-bidrag) ────────────────
MELLEMSKAT_THRESHOLD = 641_200   # kr/year
MELLEMSKAT_RATE      = 0.075     # 7.5 %
TOPSKAT_THRESHOLD    = 777_900   # kr/year
TOPSKAT_RATE         = 0.075     # 7.5 %
TOPTOPSKAT_THRESHOLD = 2_592_700 # kr/year
TOPTOPSKAT_RATE      = 0.05      # 5 %

# ── Skatteloft (tax ceiling — state + municipal, excl. kirkeskat) ────
SKATTELOFT = 0.4457  # 44.57 %

# ── Beskæftigelsesfradrag (employment deduction) ────────────────────
BESKAEFT_RATE = 0.1275   # 12.75 %
BESKAEFT_MAX  = 63_300   # kr/year

# ── Jobfradrag (job deduction) ──────────────────────────────────────
# Ligningsloven § 9 K: fradrag for the part of income ABOVE bundgrænse
JOB_FRADRAG_THRESHOLD = 235_200  # kr/year (bundgrænse, § 9 K stk. 1, skm.dk 2026)
JOB_FRADRAG_RATE      = 0.045    # 4.50 %
JOB_FRADRAG_MAX       = 3_100    # kr/year

# ── SU 2026 (su.dk) ─────────────────────────────────────────────────
SU_UDEBOENDE_MONTH   = 7_426   # kr/month before tax (videregående, udeboende)
SU_HJEMMEBOENDE_BASE = 1_154   # kr/month (grundsats)
SU_HJEMMEBOENDE_MAX  = 3_797   # kr/month (max with full tillæg)

# Fribeløb — monthly income limits while receiving SU (after AM-bidrag)
# Source: su.dk/su/naar-du-faar-su/saa-meget-maa-du-tjene/beregn-fribeloeb
FRIBELOEB_LAVESTE_UNGDOM = 15_297   # kr/month — SU months, ungdomsuddannelse
FRIBELOEB_LAVESTE_VID    = 20_749   # kr/month — SU months, videregående (incl. dobbeltklip/slutlån)
FRIBELOEB_MELLEMSTE      = 23_598   # kr/month — enrolled but opted out of SU / leave / paid internship / inactive
FRIBELOEB_HOEJESTE       = 45_420   # kr/month — not enrolled / no SU right / no more clips / other public support
FRIBELOEB_NEDSAT         = 3_921    # kr/month — months with handicap supplement
FRIBELOEB_PARENT_BONUS   = 34_129   # kr/child/year — forhøjelse for children under 18

# SU repayment interest (lifeindenmark.borger.dk, Jan 2026)
SU_REPAYMENT_INTEREST_RATE = 0.0975  # 9.75 % p.a. on SU to be repaid

# ── Feriepenge / ferietillæg (ferieloven) ────────────────────────────
FERIETILLAEG_RATE = 0.01    # 1 % for salaried (månedslønnet) employees
FERIEPENGE_RATE   = 0.125   # 12.5 % for hourly (timelønnet) workers

# ── Befordringsfradrag (transport deduction, skat.dk 2026) ───────────
# Only for >24 km round trip per day (>12 km one way)
BEFORDRING_RATE_LOW    = 1.98  # DKK/km for 25–120 km round trip
BEFORDRING_RATE_HIGH   = 0.99  # DKK/km above 120 km round trip
BEFORDRING_THRESHOLD   = 24    # minimum round trip km (below → no deduction)
BEFORDRING_HIGH_THRESHOLD = 120 # km where rate drops
BEFORDRING_LOW_INCOME  = 375_800  # below this annual income → extra deduction

# ── Fagforening / A-kasse (trade union, skat.dk 2026) ────────────────
FAGFORENING_MAX = 7_000  # max annual deductible union + a-kasse fees

# ── Exchange rate (fallback) ─────────────────────────────────────────
DKK_PER_EUR = 7.45  # fallback; app auto-fetches live rate

# ── ATP (from 2024, lov om Arbejdsmarkedets Tillægspension § 15) ────
ATP_ANNUAL  = 1_188.00   # kr/year (employee side, full-time ≥ 117 h/month)
ATP_MONTHLY = 99.00      # kr/month (employee 1/3 of total 297 kr)
ATP_MONTHLY_PARTTIME = {  # employee share by weekly hours
    "27-36":  66.00,      # B-sats: 2/3 of full
    "18-26":  33.00,      # C-sats: 1/3 of full
    "9-17":    0.00,      # under threshold → no ATP
}
ATP_EMPLOYER_FACTOR = 2   # employer pays 2× the employee share

# ── Taxable benefit values (skat.dk 2026) ──────────────────────────
FRI_TELEFON_ANNUAL = 3_500  # kr/year (free phone, taxable value)


# ═══════════════════════════════════════════════════════════════════════
#  MUNICIPALITY TAX RATES 2026  (skm.dk, all 98 kommuner)
# ═══════════════════════════════════════════════════════════════════════
KOMMUNER: dict[str, dict[str, float]] = {
    "Albertslund":        {"kommuneskat": 25.60, "kirkeskat": 0.80},
    "Allerød":            {"kommuneskat": 25.30, "kirkeskat": 0.58},
    "Assens":             {"kommuneskat": 26.10, "kirkeskat": 0.98},
    "Ballerup":           {"kommuneskat": 25.50, "kirkeskat": 0.75},
    "Billund":            {"kommuneskat": 24.00, "kirkeskat": 0.89},
    "Bornholm":           {"kommuneskat": 26.20, "kirkeskat": 0.93},
    "Brøndby":            {"kommuneskat": 24.30, "kirkeskat": 0.80},
    "Brønderslev":        {"kommuneskat": 26.30, "kirkeskat": 1.06},
    "Dragør":             {"kommuneskat": 24.80, "kirkeskat": 0.61},
    "Egedal":             {"kommuneskat": 25.70, "kirkeskat": 0.76},
    "Esbjerg":            {"kommuneskat": 26.10, "kirkeskat": 0.81},
    "Faaborg-Midtfyn":    {"kommuneskat": 26.10, "kirkeskat": 1.05},
    "Fanø":               {"kommuneskat": 26.10, "kirkeskat": 1.14},
    "Favrskov":           {"kommuneskat": 25.70, "kirkeskat": 0.96},
    "Faxe":               {"kommuneskat": 25.80, "kirkeskat": 1.08},
    "Fredensborg":        {"kommuneskat": 25.30, "kirkeskat": 0.64},
    "Fredericia":         {"kommuneskat": 25.50, "kirkeskat": 0.88},
    "Frederiksberg":      {"kommuneskat": 24.50, "kirkeskat": 0.50},
    "Frederikshavn":      {"kommuneskat": 26.20, "kirkeskat": 1.03},
    "Frederikssund":      {"kommuneskat": 25.60, "kirkeskat": 0.96},
    "Furesø":             {"kommuneskat": 24.88, "kirkeskat": 0.70},
    "Gentofte":           {"kommuneskat": 24.14, "kirkeskat": 0.38},
    "Gladsaxe":           {"kommuneskat": 23.60, "kirkeskat": 0.75},
    "Glostrup":           {"kommuneskat": 24.60, "kirkeskat": 0.80},
    "Greve":              {"kommuneskat": 24.59, "kirkeskat": 0.81},
    "Gribskov":           {"kommuneskat": 25.40, "kirkeskat": 0.85},
    "Guldborgsund":       {"kommuneskat": 25.80, "kirkeskat": 1.16},
    "Haderslev":          {"kommuneskat": 26.30, "kirkeskat": 0.95},
    "Halsnæs":            {"kommuneskat": 25.70, "kirkeskat": 0.85},
    "Hedensted":          {"kommuneskat": 25.52, "kirkeskat": 0.98},
    "Helsingør":          {"kommuneskat": 25.82, "kirkeskat": 0.63},
    "Herlev":             {"kommuneskat": 23.70, "kirkeskat": 0.80},
    "Herning":            {"kommuneskat": 25.40, "kirkeskat": 0.99},
    "Hillerød":           {"kommuneskat": 25.60, "kirkeskat": 0.69},
    "Hjørring":           {"kommuneskat": 26.21, "kirkeskat": 1.19},
    "Holbæk":             {"kommuneskat": 25.30, "kirkeskat": 0.96},
    "Holstebro":          {"kommuneskat": 25.50, "kirkeskat": 1.08},
    "Horsens":            {"kommuneskat": 25.69, "kirkeskat": 0.79},
    "Hvidovre":           {"kommuneskat": 25.40, "kirkeskat": 0.72},
    "Høje-Taastrup":      {"kommuneskat": 24.60, "kirkeskat": 0.80},
    "Hørsholm":           {"kommuneskat": 23.70, "kirkeskat": 0.62},
    "Ikast-Brande":       {"kommuneskat": 25.10, "kirkeskat": 0.97},
    "Ishøj":              {"kommuneskat": 25.00, "kirkeskat": 0.90},
    "Jammerbugt":         {"kommuneskat": 25.70, "kirkeskat": 1.20},
    "Kalundborg":         {"kommuneskat": 24.20, "kirkeskat": 1.01},
    "Kerteminde":         {"kommuneskat": 26.10, "kirkeskat": 0.98},
    "Kolding":            {"kommuneskat": 25.50, "kirkeskat": 0.92},
    "København":          {"kommuneskat": 23.39, "kirkeskat": 0.80},
    "Køge":               {"kommuneskat": 25.26, "kirkeskat": 0.87},
    "Langeland":          {"kommuneskat": 26.30, "kirkeskat": 1.14},
    "Lejre":              {"kommuneskat": 25.31, "kirkeskat": 1.05},
    "Lemvig":             {"kommuneskat": 25.70, "kirkeskat": 1.27},
    "Lolland":            {"kommuneskat": 26.30, "kirkeskat": 1.23},
    "Lyngby-Taarbæk":     {"kommuneskat": 24.38, "kirkeskat": 0.60},
    "Læsø":               {"kommuneskat": 26.30, "kirkeskat": 1.30},
    "Mariagerfjord":      {"kommuneskat": 25.90, "kirkeskat": 1.15},
    "Middelfart":         {"kommuneskat": 25.80, "kirkeskat": 0.90},
    "Morsø":              {"kommuneskat": 25.80, "kirkeskat": 1.20},
    "Norddjurs":          {"kommuneskat": 26.00, "kirkeskat": 1.00},
    "Nordfyns":           {"kommuneskat": 26.00, "kirkeskat": 1.04},
    "Nyborg":             {"kommuneskat": 26.30, "kirkeskat": 1.00},
    "Næstved":            {"kommuneskat": 25.00, "kirkeskat": 0.98},
    "Odder":              {"kommuneskat": 25.10, "kirkeskat": 0.95},
    "Odense":             {"kommuneskat": 25.50, "kirkeskat": 0.68},
    "Odsherred":          {"kommuneskat": 26.30, "kirkeskat": 0.98},
    "Randers":            {"kommuneskat": 26.00, "kirkeskat": 0.89},
    "Rebild":             {"kommuneskat": 25.83, "kirkeskat": 1.20},
    "Ringkøbing-Skjern":  {"kommuneskat": 25.00, "kirkeskat": 1.05},
    "Ringsted":           {"kommuneskat": 26.10, "kirkeskat": 0.95},
    "Roskilde":           {"kommuneskat": 25.20, "kirkeskat": 0.84},
    "Rudersdal":          {"kommuneskat": 23.47, "kirkeskat": 0.57},
    "Rødovre":            {"kommuneskat": 25.70, "kirkeskat": 0.72},
    "Samsø":              {"kommuneskat": 25.90, "kirkeskat": 1.20},
    "Silkeborg":          {"kommuneskat": 25.50, "kirkeskat": 0.94},
    "Skanderborg":        {"kommuneskat": 26.00, "kirkeskat": 0.86},
    "Skive":              {"kommuneskat": 25.50, "kirkeskat": 1.09},
    "Slagelse":           {"kommuneskat": 26.10, "kirkeskat": 0.96},
    "Solrød":             {"kommuneskat": 24.99, "kirkeskat": 0.84},
    "Sorø":               {"kommuneskat": 26.30, "kirkeskat": 0.95},
    "Stevns":             {"kommuneskat": 26.00, "kirkeskat": 1.10},
    "Struer":             {"kommuneskat": 25.30, "kirkeskat": 1.20},
    "Svendborg":          {"kommuneskat": 26.30, "kirkeskat": 1.02},
    "Syddjurs":           {"kommuneskat": 25.90, "kirkeskat": 0.98},
    "Sønderborg":         {"kommuneskat": 25.70, "kirkeskat": 0.91},
    "Thisted":            {"kommuneskat": 25.50, "kirkeskat": 1.27},
    "Tårnby":             {"kommuneskat": 24.10, "kirkeskat": 0.61},
    "Tønder":             {"kommuneskat": 25.30, "kirkeskat": 1.16},
    "Vallensbæk":         {"kommuneskat": 25.60, "kirkeskat": 0.80},
    "Varde":              {"kommuneskat": 25.10, "kirkeskat": 0.95},
    "Vejen":              {"kommuneskat": 25.80, "kirkeskat": 1.06},
    "Vejle":              {"kommuneskat": 23.40, "kirkeskat": 0.89},
    "Vesthimmerland":     {"kommuneskat": 26.30, "kirkeskat": 1.18},
    "Viborg":             {"kommuneskat": 25.50, "kirkeskat": 0.93},
    "Vordingborg":        {"kommuneskat": 26.30, "kirkeskat": 1.02},
    "Ærø":                {"kommuneskat": 26.10, "kirkeskat": 1.07},
    "Aabenraa":           {"kommuneskat": 25.60, "kirkeskat": 0.95},
    "Aalborg":            {"kommuneskat": 25.60, "kirkeskat": 0.98},
    "Aarhus":             {"kommuneskat": 24.52, "kirkeskat": 0.74},
}
