// Tax year 2026 reference data, copied unchanged from api/data.py.
// RULES_VERIFIED_ON is a tax-source verification date, not a deployment date.
export const TAX_YEAR = 2026;
export const CALCULATION_VERSION = "2026-09-30.1";
export const RULES_VERIFIED_ON = "2026-09-30";
export const SU_LOAN_MONTHLY = 3799;
export const AM_RATE = 0.08;
export const PERSONFRADRAG = 54100;
export const BUNDSKAT_RATE = 0.1201;
export const MELLEMSKAT_THRESHOLD = 641200;
export const MELLEMSKAT_RATE = 0.075;
export const TOPSKAT_THRESHOLD = 777900;
export const TOPSKAT_RATE = 0.075;
export const TOPTOPSKAT_THRESHOLD = 2592700;
export const TOPTOPSKAT_RATE = 0.05;
export const SKATTELOFT = 0.4457;
export const BESKAEFT_RATE = 0.1275;
export const BESKAEFT_MAX = 63300;
export const JOB_FRADRAG_THRESHOLD = 235200;
export const JOB_FRADRAG_RATE = 0.045;
export const JOB_FRADRAG_MAX = 3100;
export const SU_UDEBOENDE_MONTH = 7426;
export const SU_HJEMMEBOENDE_BASE = 1154;
export const SU_HJEMMEBOENDE_MAX = 3797;
export const FRIBELOEB_LAVESTE_UNGDOM = 15297;
export const FRIBELOEB_LAVESTE_VID = 20749;
export const FRIBELOEB_MELLEMSTE = 23598;
export const FRIBELOEB_HOEJESTE = 45420;
export const FRIBELOEB_NEDSAT = 3921;
export const FRIBELOEB_PARENT_BONUS = 34129;
export const FERIETILLAEG_RATE = 0.01;
export const FERIEPENGE_RATE = 0.125;
export const BEFORDRING_RATE_LOW = 3.17;
export const BEFORDRING_RATE_HIGH = 1.59;
export const BEFORDRING_THRESHOLD = 24;
export const BEFORDRING_HIGH_THRESHOLD = 120;
export const BEFORDRING_LOW_INCOME = 391500;
export const FAGFORENING_MAX = 7000;
export const DKK_PER_EUR = 7.45;
export const ATP_ANNUAL = 1188.0;
export const ATP_MONTHLY = 99.0;
export const ATP_MONTHLY_PARTTIME = {
  "0-38": 0.0,
  "39-77": 33.0,
  "78-116": 66.0,
  "117+": 99.0
};
export const ATP_EMPLOYER_FACTOR = 2;
export const FRI_TELEFON_ANNUAL = 3500;
export const KOMMUNER = {
  "Albertslund": {
    "kommuneskat": 25.6,
    "kirkeskat": 0.8
  },
  "Allerød": {
    "kommuneskat": 25.3,
    "kirkeskat": 0.58
  },
  "Assens": {
    "kommuneskat": 26.1,
    "kirkeskat": 0.98
  },
  "Ballerup": {
    "kommuneskat": 25.5,
    "kirkeskat": 0.75
  },
  "Billund": {
    "kommuneskat": 24.0,
    "kirkeskat": 0.89
  },
  "Bornholm": {
    "kommuneskat": 26.2,
    "kirkeskat": 0.93
  },
  "Brøndby": {
    "kommuneskat": 24.3,
    "kirkeskat": 0.8
  },
  "Brønderslev": {
    "kommuneskat": 26.3,
    "kirkeskat": 1.06
  },
  "Dragør": {
    "kommuneskat": 24.8,
    "kirkeskat": 0.61
  },
  "Egedal": {
    "kommuneskat": 25.7,
    "kirkeskat": 0.76
  },
  "Esbjerg": {
    "kommuneskat": 26.1,
    "kirkeskat": 0.81
  },
  "Faaborg-Midtfyn": {
    "kommuneskat": 26.1,
    "kirkeskat": 1.05
  },
  "Fanø": {
    "kommuneskat": 26.1,
    "kirkeskat": 1.14
  },
  "Favrskov": {
    "kommuneskat": 25.7,
    "kirkeskat": 0.96
  },
  "Faxe": {
    "kommuneskat": 25.8,
    "kirkeskat": 1.08
  },
  "Fredensborg": {
    "kommuneskat": 25.3,
    "kirkeskat": 0.64
  },
  "Fredericia": {
    "kommuneskat": 25.5,
    "kirkeskat": 0.88
  },
  "Frederiksberg": {
    "kommuneskat": 24.5,
    "kirkeskat": 0.5
  },
  "Frederikshavn": {
    "kommuneskat": 26.2,
    "kirkeskat": 1.03
  },
  "Frederikssund": {
    "kommuneskat": 25.6,
    "kirkeskat": 0.96
  },
  "Furesø": {
    "kommuneskat": 24.88,
    "kirkeskat": 0.7
  },
  "Gentofte": {
    "kommuneskat": 24.14,
    "kirkeskat": 0.38
  },
  "Gladsaxe": {
    "kommuneskat": 23.6,
    "kirkeskat": 0.75
  },
  "Glostrup": {
    "kommuneskat": 24.6,
    "kirkeskat": 0.8
  },
  "Greve": {
    "kommuneskat": 24.59,
    "kirkeskat": 0.81
  },
  "Gribskov": {
    "kommuneskat": 25.4,
    "kirkeskat": 0.85
  },
  "Guldborgsund": {
    "kommuneskat": 25.8,
    "kirkeskat": 1.16
  },
  "Haderslev": {
    "kommuneskat": 26.3,
    "kirkeskat": 0.95
  },
  "Halsnæs": {
    "kommuneskat": 25.7,
    "kirkeskat": 0.85
  },
  "Hedensted": {
    "kommuneskat": 25.52,
    "kirkeskat": 0.98
  },
  "Helsingør": {
    "kommuneskat": 25.82,
    "kirkeskat": 0.63
  },
  "Herlev": {
    "kommuneskat": 23.7,
    "kirkeskat": 0.8
  },
  "Herning": {
    "kommuneskat": 25.4,
    "kirkeskat": 0.99
  },
  "Hillerød": {
    "kommuneskat": 25.6,
    "kirkeskat": 0.69
  },
  "Hjørring": {
    "kommuneskat": 26.21,
    "kirkeskat": 1.19
  },
  "Holbæk": {
    "kommuneskat": 25.3,
    "kirkeskat": 0.96
  },
  "Holstebro": {
    "kommuneskat": 25.5,
    "kirkeskat": 1.08
  },
  "Horsens": {
    "kommuneskat": 25.69,
    "kirkeskat": 0.79
  },
  "Hvidovre": {
    "kommuneskat": 25.4,
    "kirkeskat": 0.72
  },
  "Høje-Taastrup": {
    "kommuneskat": 24.6,
    "kirkeskat": 0.8
  },
  "Hørsholm": {
    "kommuneskat": 23.7,
    "kirkeskat": 0.62
  },
  "Ikast-Brande": {
    "kommuneskat": 25.1,
    "kirkeskat": 0.97
  },
  "Ishøj": {
    "kommuneskat": 25.0,
    "kirkeskat": 0.9
  },
  "Jammerbugt": {
    "kommuneskat": 25.7,
    "kirkeskat": 1.2
  },
  "Kalundborg": {
    "kommuneskat": 24.2,
    "kirkeskat": 1.01
  },
  "Kerteminde": {
    "kommuneskat": 26.1,
    "kirkeskat": 0.98
  },
  "Kolding": {
    "kommuneskat": 25.5,
    "kirkeskat": 0.92
  },
  "København": {
    "kommuneskat": 23.39,
    "kirkeskat": 0.8
  },
  "Køge": {
    "kommuneskat": 25.26,
    "kirkeskat": 0.87
  },
  "Langeland": {
    "kommuneskat": 26.3,
    "kirkeskat": 1.14
  },
  "Lejre": {
    "kommuneskat": 25.31,
    "kirkeskat": 1.05
  },
  "Lemvig": {
    "kommuneskat": 25.7,
    "kirkeskat": 1.27
  },
  "Lolland": {
    "kommuneskat": 26.3,
    "kirkeskat": 1.23
  },
  "Lyngby-Taarbæk": {
    "kommuneskat": 24.38,
    "kirkeskat": 0.6
  },
  "Læsø": {
    "kommuneskat": 26.3,
    "kirkeskat": 1.3
  },
  "Mariagerfjord": {
    "kommuneskat": 25.9,
    "kirkeskat": 1.15
  },
  "Middelfart": {
    "kommuneskat": 25.8,
    "kirkeskat": 0.9
  },
  "Morsø": {
    "kommuneskat": 25.8,
    "kirkeskat": 1.2
  },
  "Norddjurs": {
    "kommuneskat": 26.0,
    "kirkeskat": 1.0
  },
  "Nordfyns": {
    "kommuneskat": 26.0,
    "kirkeskat": 1.04
  },
  "Nyborg": {
    "kommuneskat": 26.3,
    "kirkeskat": 1.0
  },
  "Næstved": {
    "kommuneskat": 25.0,
    "kirkeskat": 0.98
  },
  "Odder": {
    "kommuneskat": 25.1,
    "kirkeskat": 0.95
  },
  "Odense": {
    "kommuneskat": 25.5,
    "kirkeskat": 0.68
  },
  "Odsherred": {
    "kommuneskat": 26.3,
    "kirkeskat": 0.98
  },
  "Randers": {
    "kommuneskat": 26.0,
    "kirkeskat": 0.89
  },
  "Rebild": {
    "kommuneskat": 25.83,
    "kirkeskat": 1.2
  },
  "Ringkøbing-Skjern": {
    "kommuneskat": 25.0,
    "kirkeskat": 1.05
  },
  "Ringsted": {
    "kommuneskat": 26.1,
    "kirkeskat": 0.95
  },
  "Roskilde": {
    "kommuneskat": 25.2,
    "kirkeskat": 0.84
  },
  "Rudersdal": {
    "kommuneskat": 23.47,
    "kirkeskat": 0.57
  },
  "Rødovre": {
    "kommuneskat": 25.7,
    "kirkeskat": 0.72
  },
  "Samsø": {
    "kommuneskat": 25.9,
    "kirkeskat": 1.2
  },
  "Silkeborg": {
    "kommuneskat": 25.5,
    "kirkeskat": 0.94
  },
  "Skanderborg": {
    "kommuneskat": 26.0,
    "kirkeskat": 0.86
  },
  "Skive": {
    "kommuneskat": 25.5,
    "kirkeskat": 1.09
  },
  "Slagelse": {
    "kommuneskat": 26.1,
    "kirkeskat": 0.96
  },
  "Solrød": {
    "kommuneskat": 24.99,
    "kirkeskat": 0.84
  },
  "Sorø": {
    "kommuneskat": 26.3,
    "kirkeskat": 0.95
  },
  "Stevns": {
    "kommuneskat": 26.0,
    "kirkeskat": 1.1
  },
  "Struer": {
    "kommuneskat": 25.3,
    "kirkeskat": 1.2
  },
  "Svendborg": {
    "kommuneskat": 26.3,
    "kirkeskat": 1.02
  },
  "Syddjurs": {
    "kommuneskat": 25.9,
    "kirkeskat": 0.98
  },
  "Sønderborg": {
    "kommuneskat": 25.7,
    "kirkeskat": 0.91
  },
  "Thisted": {
    "kommuneskat": 25.5,
    "kirkeskat": 1.27
  },
  "Tårnby": {
    "kommuneskat": 24.1,
    "kirkeskat": 0.61
  },
  "Tønder": {
    "kommuneskat": 25.3,
    "kirkeskat": 1.16
  },
  "Vallensbæk": {
    "kommuneskat": 25.6,
    "kirkeskat": 0.8
  },
  "Varde": {
    "kommuneskat": 25.1,
    "kirkeskat": 0.95
  },
  "Vejen": {
    "kommuneskat": 25.8,
    "kirkeskat": 1.06
  },
  "Vejle": {
    "kommuneskat": 23.4,
    "kirkeskat": 0.89
  },
  "Vesthimmerland": {
    "kommuneskat": 26.3,
    "kirkeskat": 1.18
  },
  "Viborg": {
    "kommuneskat": 25.5,
    "kirkeskat": 0.93
  },
  "Vordingborg": {
    "kommuneskat": 26.3,
    "kirkeskat": 1.02
  },
  "Ærø": {
    "kommuneskat": 26.1,
    "kirkeskat": 1.07
  },
  "Aabenraa": {
    "kommuneskat": 25.6,
    "kirkeskat": 0.95
  },
  "Aalborg": {
    "kommuneskat": 25.6,
    "kirkeskat": 0.98
  },
  "Aarhus": {
    "kommuneskat": 24.52,
    "kirkeskat": 0.74
  }
};
