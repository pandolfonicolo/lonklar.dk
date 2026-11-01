// Generated from api/models.py; regenerate with scripts/generate_contract.py.
export const schemas: Record<string, any> = {
  "FullTimeRequest": {
    "properties": {
      "gross_annual": {
        "description": "Gross annual salary in DKK",
        "title": "Gross Annual",
        "type": "number"
      },
      "kommune": {
        "default": "København",
        "description": "Municipality name",
        "title": "Kommune",
        "type": "string"
      },
      "pension_pct": {
        "default": 4.0,
        "description": "Employee pension % (0-15)",
        "title": "Pension Pct",
        "type": "number"
      },
      "employer_pension_pct": {
        "default": 8.0,
        "description": "Employer pension % (0-20)",
        "title": "Employer Pension Pct",
        "type": "number"
      },
      "pension_type": {
        "default": "standard",
        "description": "standard | section53a",
        "enum": [
          "standard",
          "section53a"
        ],
        "title": "Pension Type",
        "type": "string"
      },
      "is_church": {
        "default": true,
        "description": "Member of Folkekirken?",
        "title": "Is Church",
        "type": "boolean"
      },
      "other_pay_monthly": {
        "default": 0.0,
        "description": "Extra monthly pay (broadband etc.)",
        "title": "Other Pay Monthly",
        "type": "number"
      },
      "taxable_benefits_monthly": {
        "default": 0.0,
        "description": "Monthly taxable benefits",
        "title": "Taxable Benefits Monthly",
        "type": "number"
      },
      "pretax_deductions_monthly": {
        "default": 0.0,
        "description": "Monthly pre-tax deductions",
        "title": "Pretax Deductions Monthly",
        "type": "number"
      },
      "aftertax_deductions_monthly": {
        "default": 0.0,
        "description": "Monthly after-tax deductions",
        "title": "Aftertax Deductions Monthly",
        "type": "number"
      },
      "atp_monthly": {
        "default": 99.0,
        "description": "Monthly ATP contribution",
        "title": "Atp Monthly",
        "type": "number"
      },
      "transport_km": {
        "default": 0.0,
        "description": "Round-trip daily commute in km",
        "title": "Transport Km",
        "type": "number"
      },
      "transport_days": {
        "default": 218,
        "description": "Actual commuting days in the tax year",
        "maximum": 366,
        "minimum": 0,
        "title": "Transport Days",
        "type": "integer"
      },
      "a_kasse_fees_annual": {
        "default": 0.0,
        "description": "Annual A-kasse fees; no union cap",
        "minimum": 0,
        "title": "A Kasse Fees Annual",
        "type": "number"
      },
      "union_fees_annual": {
        "default": 0.0,
        "description": "Annual trade union fees (cap 7,000 DKK)",
        "title": "Union Fees Annual",
        "type": "number"
      }
    },
    "required": [
      "gross_annual"
    ],
    "title": "FullTimeRequest",
    "type": "object"
  },
  "PartTimeRequest": {
    "properties": {
      "hourly_rate": {
        "description": "Hourly rate in DKK",
        "title": "Hourly Rate",
        "type": "number"
      },
      "hours_month": {
        "description": "Hours worked per month",
        "title": "Hours Month",
        "type": "number"
      },
      "kommune": {
        "default": "København",
        "description": "Municipality name",
        "title": "Kommune",
        "type": "string"
      },
      "pension_pct": {
        "default": 0.0,
        "description": "Employee pension % (0-15)",
        "title": "Pension Pct",
        "type": "number"
      },
      "employer_pension_pct": {
        "default": 0.0,
        "description": "Employer pension % (0-20)",
        "title": "Employer Pension Pct",
        "type": "number"
      },
      "pension_type": {
        "default": "standard",
        "description": "standard | section53a",
        "enum": [
          "standard",
          "section53a"
        ],
        "title": "Pension Type",
        "type": "string"
      },
      "is_church": {
        "default": true,
        "description": "Member of Folkekirken?",
        "title": "Is Church",
        "type": "boolean"
      },
      "other_pay_monthly": {
        "default": 0.0,
        "title": "Other Pay Monthly",
        "type": "number"
      },
      "taxable_benefits_monthly": {
        "default": 0.0,
        "title": "Taxable Benefits Monthly",
        "type": "number"
      },
      "pretax_deductions_monthly": {
        "default": 0.0,
        "title": "Pretax Deductions Monthly",
        "type": "number"
      },
      "aftertax_deductions_monthly": {
        "default": 0.0,
        "title": "Aftertax Deductions Monthly",
        "type": "number"
      },
      "atp_monthly": {
        "default": 0.0,
        "description": "Monthly employee ATP contribution; monthly A-rate assumed",
        "title": "Atp Monthly",
        "type": "number"
      },
      "transport_km": {
        "default": 0.0,
        "description": "Round-trip daily commute in km",
        "title": "Transport Km",
        "type": "number"
      },
      "transport_days": {
        "default": 218,
        "description": "Actual commuting days in the tax year",
        "maximum": 366,
        "minimum": 0,
        "title": "Transport Days",
        "type": "integer"
      },
      "a_kasse_fees_annual": {
        "default": 0.0,
        "description": "Annual A-kasse fees; no union cap",
        "minimum": 0,
        "title": "A Kasse Fees Annual",
        "type": "number"
      },
      "union_fees_annual": {
        "default": 0.0,
        "description": "Annual trade union fees (cap 7,000 DKK)",
        "title": "Union Fees Annual",
        "type": "number"
      }
    },
    "required": [
      "hourly_rate",
      "hours_month"
    ],
    "title": "PartTimeRequest",
    "type": "object"
  },
  "EmployeeScenarioRequest": {
    "properties": {
      "employment_type": {
        "default": "fulltime",
        "description": "fulltime | parttime",
        "enum": [
          "fulltime",
          "parttime"
        ],
        "title": "Employment Type",
        "type": "string"
      },
      "gross_annual": {
        "anyOf": [
          {
            "type": "number"
          },
          {
            "type": "null"
          }
        ],
        "default": null,
        "description": "Gross annual salary in DKK for fulltime",
        "title": "Gross Annual"
      },
      "hourly_rate": {
        "anyOf": [
          {
            "type": "number"
          },
          {
            "type": "null"
          }
        ],
        "default": null,
        "description": "Hourly rate in DKK for parttime",
        "title": "Hourly Rate"
      },
      "hours_month": {
        "anyOf": [
          {
            "type": "number"
          },
          {
            "type": "null"
          }
        ],
        "default": null,
        "description": "Monthly hours for parttime",
        "title": "Hours Month"
      },
      "kommune": {
        "default": "København",
        "description": "Municipality name",
        "title": "Kommune",
        "type": "string"
      },
      "pension_pct": {
        "default": 4.0,
        "description": "Employee pension %",
        "title": "Pension Pct",
        "type": "number"
      },
      "employer_pension_pct": {
        "default": 8.0,
        "description": "Employer pension %",
        "title": "Employer Pension Pct",
        "type": "number"
      },
      "pension_type": {
        "default": "standard",
        "description": "standard | section53a",
        "enum": [
          "standard",
          "section53a"
        ],
        "title": "Pension Type",
        "type": "string"
      },
      "is_church": {
        "default": true,
        "description": "Member of Folkekirken?",
        "title": "Is Church",
        "type": "boolean"
      },
      "other_pay_monthly": {
        "default": 0.0,
        "description": "Extra monthly pay",
        "title": "Other Pay Monthly",
        "type": "number"
      },
      "taxable_benefits_monthly": {
        "default": 0.0,
        "description": "Monthly taxable benefits",
        "title": "Taxable Benefits Monthly",
        "type": "number"
      },
      "pretax_deductions_monthly": {
        "default": 0.0,
        "description": "Monthly pre-tax deductions",
        "title": "Pretax Deductions Monthly",
        "type": "number"
      },
      "aftertax_deductions_monthly": {
        "default": 0.0,
        "description": "Monthly after-tax deductions",
        "title": "Aftertax Deductions Monthly",
        "type": "number"
      },
      "atp_monthly": {
        "default": 99.0,
        "description": "Monthly ATP contribution",
        "title": "Atp Monthly",
        "type": "number"
      },
      "transport_km": {
        "default": 0.0,
        "description": "Round-trip daily commute in km",
        "title": "Transport Km",
        "type": "number"
      },
      "transport_days": {
        "default": 218,
        "description": "Actual commuting days in the tax year",
        "maximum": 366,
        "minimum": 0,
        "title": "Transport Days",
        "type": "integer"
      },
      "a_kasse_fees_annual": {
        "default": 0.0,
        "description": "Annual A-kasse fees; no union cap",
        "minimum": 0,
        "title": "A Kasse Fees Annual",
        "type": "number"
      },
      "union_fees_annual": {
        "default": 0.0,
        "description": "Annual trade union fees (cap 7,000 DKK)",
        "title": "Union Fees Annual",
        "type": "number"
      }
    },
    "title": "EmployeeScenarioRequest",
    "type": "object"
  },
  "ProjectionSettings": {
    "properties": {
      "years": {
        "default": 5,
        "maximum": 50,
        "minimum": 1,
        "title": "Years",
        "type": "integer"
      },
      "annual_return_pct": {
        "default": 4.0,
        "maximum": 100,
        "minimum": -100,
        "title": "Annual Return Pct",
        "type": "number"
      },
      "salary_growth_pct": {
        "default": 2.0,
        "maximum": 100,
        "minimum": -100,
        "title": "Salary Growth Pct",
        "type": "number"
      }
    },
    "title": "ProjectionSettings",
    "type": "object"
  },
  "ProjectionRequest": {
    "$defs": {
      "EmployeeScenarioRequest": {
        "properties": {
          "employment_type": {
            "default": "fulltime",
            "description": "fulltime | parttime",
            "enum": [
              "fulltime",
              "parttime"
            ],
            "title": "Employment Type",
            "type": "string"
          },
          "gross_annual": {
            "anyOf": [
              {
                "type": "number"
              },
              {
                "type": "null"
              }
            ],
            "default": null,
            "description": "Gross annual salary in DKK for fulltime",
            "title": "Gross Annual"
          },
          "hourly_rate": {
            "anyOf": [
              {
                "type": "number"
              },
              {
                "type": "null"
              }
            ],
            "default": null,
            "description": "Hourly rate in DKK for parttime",
            "title": "Hourly Rate"
          },
          "hours_month": {
            "anyOf": [
              {
                "type": "number"
              },
              {
                "type": "null"
              }
            ],
            "default": null,
            "description": "Monthly hours for parttime",
            "title": "Hours Month"
          },
          "kommune": {
            "default": "København",
            "description": "Municipality name",
            "title": "Kommune",
            "type": "string"
          },
          "pension_pct": {
            "default": 4.0,
            "description": "Employee pension %",
            "title": "Pension Pct",
            "type": "number"
          },
          "employer_pension_pct": {
            "default": 8.0,
            "description": "Employer pension %",
            "title": "Employer Pension Pct",
            "type": "number"
          },
          "pension_type": {
            "default": "standard",
            "description": "standard | section53a",
            "enum": [
              "standard",
              "section53a"
            ],
            "title": "Pension Type",
            "type": "string"
          },
          "is_church": {
            "default": true,
            "description": "Member of Folkekirken?",
            "title": "Is Church",
            "type": "boolean"
          },
          "other_pay_monthly": {
            "default": 0.0,
            "description": "Extra monthly pay",
            "title": "Other Pay Monthly",
            "type": "number"
          },
          "taxable_benefits_monthly": {
            "default": 0.0,
            "description": "Monthly taxable benefits",
            "title": "Taxable Benefits Monthly",
            "type": "number"
          },
          "pretax_deductions_monthly": {
            "default": 0.0,
            "description": "Monthly pre-tax deductions",
            "title": "Pretax Deductions Monthly",
            "type": "number"
          },
          "aftertax_deductions_monthly": {
            "default": 0.0,
            "description": "Monthly after-tax deductions",
            "title": "Aftertax Deductions Monthly",
            "type": "number"
          },
          "atp_monthly": {
            "default": 99.0,
            "description": "Monthly ATP contribution",
            "title": "Atp Monthly",
            "type": "number"
          },
          "transport_km": {
            "default": 0.0,
            "description": "Round-trip daily commute in km",
            "title": "Transport Km",
            "type": "number"
          },
          "transport_days": {
            "default": 218,
            "description": "Actual commuting days in the tax year",
            "maximum": 366,
            "minimum": 0,
            "title": "Transport Days",
            "type": "integer"
          },
          "a_kasse_fees_annual": {
            "default": 0.0,
            "description": "Annual A-kasse fees; no union cap",
            "minimum": 0,
            "title": "A Kasse Fees Annual",
            "type": "number"
          },
          "union_fees_annual": {
            "default": 0.0,
            "description": "Annual trade union fees (cap 7,000 DKK)",
            "title": "Union Fees Annual",
            "type": "number"
          }
        },
        "title": "EmployeeScenarioRequest",
        "type": "object"
      },
      "ProjectionSettings": {
        "properties": {
          "years": {
            "default": 5,
            "maximum": 50,
            "minimum": 1,
            "title": "Years",
            "type": "integer"
          },
          "annual_return_pct": {
            "default": 4.0,
            "maximum": 100,
            "minimum": -100,
            "title": "Annual Return Pct",
            "type": "number"
          },
          "salary_growth_pct": {
            "default": 2.0,
            "maximum": 100,
            "minimum": -100,
            "title": "Salary Growth Pct",
            "type": "number"
          }
        },
        "title": "ProjectionSettings",
        "type": "object"
      }
    },
    "properties": {
      "scenario": {
        "$ref": "#/$defs/EmployeeScenarioRequest"
      },
      "settings": {
        "$ref": "#/$defs/ProjectionSettings"
      }
    },
    "required": [
      "scenario"
    ],
    "title": "ProjectionRequest",
    "type": "object"
  },
  "ComparisonRequest": {
    "$defs": {
      "EmployeeScenarioRequest": {
        "properties": {
          "employment_type": {
            "default": "fulltime",
            "description": "fulltime | parttime",
            "enum": [
              "fulltime",
              "parttime"
            ],
            "title": "Employment Type",
            "type": "string"
          },
          "gross_annual": {
            "anyOf": [
              {
                "type": "number"
              },
              {
                "type": "null"
              }
            ],
            "default": null,
            "description": "Gross annual salary in DKK for fulltime",
            "title": "Gross Annual"
          },
          "hourly_rate": {
            "anyOf": [
              {
                "type": "number"
              },
              {
                "type": "null"
              }
            ],
            "default": null,
            "description": "Hourly rate in DKK for parttime",
            "title": "Hourly Rate"
          },
          "hours_month": {
            "anyOf": [
              {
                "type": "number"
              },
              {
                "type": "null"
              }
            ],
            "default": null,
            "description": "Monthly hours for parttime",
            "title": "Hours Month"
          },
          "kommune": {
            "default": "København",
            "description": "Municipality name",
            "title": "Kommune",
            "type": "string"
          },
          "pension_pct": {
            "default": 4.0,
            "description": "Employee pension %",
            "title": "Pension Pct",
            "type": "number"
          },
          "employer_pension_pct": {
            "default": 8.0,
            "description": "Employer pension %",
            "title": "Employer Pension Pct",
            "type": "number"
          },
          "pension_type": {
            "default": "standard",
            "description": "standard | section53a",
            "enum": [
              "standard",
              "section53a"
            ],
            "title": "Pension Type",
            "type": "string"
          },
          "is_church": {
            "default": true,
            "description": "Member of Folkekirken?",
            "title": "Is Church",
            "type": "boolean"
          },
          "other_pay_monthly": {
            "default": 0.0,
            "description": "Extra monthly pay",
            "title": "Other Pay Monthly",
            "type": "number"
          },
          "taxable_benefits_monthly": {
            "default": 0.0,
            "description": "Monthly taxable benefits",
            "title": "Taxable Benefits Monthly",
            "type": "number"
          },
          "pretax_deductions_monthly": {
            "default": 0.0,
            "description": "Monthly pre-tax deductions",
            "title": "Pretax Deductions Monthly",
            "type": "number"
          },
          "aftertax_deductions_monthly": {
            "default": 0.0,
            "description": "Monthly after-tax deductions",
            "title": "Aftertax Deductions Monthly",
            "type": "number"
          },
          "atp_monthly": {
            "default": 99.0,
            "description": "Monthly ATP contribution",
            "title": "Atp Monthly",
            "type": "number"
          },
          "transport_km": {
            "default": 0.0,
            "description": "Round-trip daily commute in km",
            "title": "Transport Km",
            "type": "number"
          },
          "transport_days": {
            "default": 218,
            "description": "Actual commuting days in the tax year",
            "maximum": 366,
            "minimum": 0,
            "title": "Transport Days",
            "type": "integer"
          },
          "a_kasse_fees_annual": {
            "default": 0.0,
            "description": "Annual A-kasse fees; no union cap",
            "minimum": 0,
            "title": "A Kasse Fees Annual",
            "type": "number"
          },
          "union_fees_annual": {
            "default": 0.0,
            "description": "Annual trade union fees (cap 7,000 DKK)",
            "title": "Union Fees Annual",
            "type": "number"
          }
        },
        "title": "EmployeeScenarioRequest",
        "type": "object"
      },
      "ProjectionSettings": {
        "properties": {
          "years": {
            "default": 5,
            "maximum": 50,
            "minimum": 1,
            "title": "Years",
            "type": "integer"
          },
          "annual_return_pct": {
            "default": 4.0,
            "maximum": 100,
            "minimum": -100,
            "title": "Annual Return Pct",
            "type": "number"
          },
          "salary_growth_pct": {
            "default": 2.0,
            "maximum": 100,
            "minimum": -100,
            "title": "Salary Growth Pct",
            "type": "number"
          }
        },
        "title": "ProjectionSettings",
        "type": "object"
      }
    },
    "properties": {
      "scenario_a": {
        "$ref": "#/$defs/EmployeeScenarioRequest"
      },
      "scenario_b": {
        "$ref": "#/$defs/EmployeeScenarioRequest"
      },
      "projection": {
        "anyOf": [
          {
            "$ref": "#/$defs/ProjectionSettings"
          },
          {
            "type": "null"
          }
        ],
        "default": null
      },
      "projection_a": {
        "anyOf": [
          {
            "$ref": "#/$defs/ProjectionSettings"
          },
          {
            "type": "null"
          }
        ],
        "default": null
      },
      "projection_b": {
        "anyOf": [
          {
            "$ref": "#/$defs/ProjectionSettings"
          },
          {
            "type": "null"
          }
        ],
        "default": null
      }
    },
    "required": [
      "scenario_a",
      "scenario_b"
    ],
    "title": "ComparisonRequest",
    "type": "object"
  },
  "StudentRequest": {
    "properties": {
      "su_monthly": {
        "default": 7426.0,
        "description": "Monthly SU before tax",
        "maximum": 50000,
        "minimum": 0,
        "title": "Su Monthly",
        "type": "number"
      },
      "su_months": {
        "default": 12,
        "description": "Number of SU payments received in the tax year",
        "maximum": 12,
        "minimum": 0,
        "title": "Su Months",
        "type": "integer"
      },
      "work_gross_monthly": {
        "description": "Monthly gross work income",
        "title": "Work Gross Monthly",
        "type": "number"
      },
      "kommune": {
        "default": "København",
        "description": "Municipality name",
        "title": "Kommune",
        "type": "string"
      },
      "pension_pct": {
        "default": 0.0,
        "description": "Employee pension %",
        "title": "Pension Pct",
        "type": "number"
      },
      "employer_pension_pct": {
        "default": 0.0,
        "description": "Employer pension %",
        "title": "Employer Pension Pct",
        "type": "number"
      },
      "pension_type": {
        "default": "standard",
        "description": "standard | section53a",
        "enum": [
          "standard",
          "section53a"
        ],
        "title": "Pension Type",
        "type": "string"
      },
      "is_church": {
        "default": true,
        "title": "Is Church",
        "type": "boolean"
      },
      "aars_fribeloeb": {
        "anyOf": [
          {
            "type": "number"
          },
          {
            "type": "null"
          }
        ],
        "default": null,
        "description": "Annual fribeløb (null = default)",
        "title": "Aars Fribeloeb"
      },
      "atp_monthly": {
        "default": 0.0,
        "description": "Monthly ATP contribution",
        "title": "Atp Monthly",
        "type": "number"
      },
      "pretax_deductions_monthly": {
        "default": 0.0,
        "description": "Monthly pre-tax deductions",
        "title": "Pretax Deductions Monthly",
        "type": "number"
      },
      "aftertax_deductions_monthly": {
        "default": 0.0,
        "description": "Monthly after-tax deductions",
        "title": "Aftertax Deductions Monthly",
        "type": "number"
      },
      "other_pay_monthly": {
        "default": 0.0,
        "description": "Extra monthly pay",
        "title": "Other Pay Monthly",
        "type": "number"
      },
      "transport_km": {
        "default": 0.0,
        "description": "Round-trip daily commute in km",
        "title": "Transport Km",
        "type": "number"
      },
      "transport_days": {
        "default": 218,
        "description": "Actual commuting days in the tax year",
        "maximum": 366,
        "minimum": 0,
        "title": "Transport Days",
        "type": "integer"
      },
      "a_kasse_fees_annual": {
        "default": 0.0,
        "description": "Annual A-kasse fees; no union cap",
        "minimum": 0,
        "title": "A Kasse Fees Annual",
        "type": "number"
      },
      "union_fees_annual": {
        "default": 0.0,
        "description": "Annual trade union fees (cap 7,000 DKK)",
        "title": "Union Fees Annual",
        "type": "number"
      }
    },
    "required": [
      "work_gross_monthly"
    ],
    "title": "StudentRequest",
    "type": "object"
  },
  "CurveRequest": {
    "properties": {
      "kommune": {
        "default": "København",
        "title": "Kommune",
        "type": "string"
      },
      "pension_pct": {
        "default": 4.0,
        "title": "Pension Pct",
        "type": "number"
      },
      "employer_pension_pct": {
        "default": 8.0,
        "title": "Employer Pension Pct",
        "type": "number"
      },
      "pension_type": {
        "default": "standard",
        "enum": [
          "standard",
          "section53a"
        ],
        "title": "Pension Type",
        "type": "string"
      },
      "is_church": {
        "default": true,
        "title": "Is Church",
        "type": "boolean"
      },
      "is_hourly": {
        "default": false,
        "title": "Is Hourly",
        "type": "boolean"
      },
      "atp_monthly": {
        "default": 99.0,
        "title": "Atp Monthly",
        "type": "number"
      },
      "other_pay_monthly": {
        "default": 0.0,
        "title": "Other Pay Monthly",
        "type": "number"
      },
      "taxable_benefits_monthly": {
        "default": 0.0,
        "title": "Taxable Benefits Monthly",
        "type": "number"
      },
      "pretax_deductions_monthly": {
        "default": 0.0,
        "title": "Pretax Deductions Monthly",
        "type": "number"
      },
      "aftertax_deductions_monthly": {
        "default": 0.0,
        "title": "Aftertax Deductions Monthly",
        "type": "number"
      },
      "transport_km": {
        "default": 0.0,
        "title": "Transport Km",
        "type": "number"
      },
      "transport_days": {
        "default": 218,
        "description": "Actual commuting days in the tax year",
        "maximum": 366,
        "minimum": 0,
        "title": "Transport Days",
        "type": "integer"
      },
      "a_kasse_fees_annual": {
        "default": 0.0,
        "description": "Annual A-kasse fees; no union cap",
        "minimum": 0,
        "title": "A Kasse Fees Annual",
        "type": "number"
      },
      "union_fees_annual": {
        "default": 0.0,
        "title": "Union Fees Annual",
        "type": "number"
      },
      "max_gross": {
        "default": 1200000,
        "title": "Max Gross",
        "type": "number"
      },
      "min_gross": {
        "default": 0,
        "title": "Min Gross",
        "type": "number"
      },
      "step_monthly": {
        "default": 0,
        "title": "Step Monthly",
        "type": "number"
      },
      "points": {
        "default": 50,
        "title": "Points",
        "type": "integer"
      }
    },
    "title": "CurveRequest",
    "type": "object"
  },
  "HoursCurveRequest": {
    "properties": {
      "hourly_rate": {
        "title": "Hourly Rate",
        "type": "number"
      },
      "kommune": {
        "default": "København",
        "title": "Kommune",
        "type": "string"
      },
      "pension_pct": {
        "default": 0.0,
        "title": "Pension Pct",
        "type": "number"
      },
      "employer_pension_pct": {
        "default": 0.0,
        "title": "Employer Pension Pct",
        "type": "number"
      },
      "pension_type": {
        "default": "standard",
        "enum": [
          "standard",
          "section53a"
        ],
        "title": "Pension Type",
        "type": "string"
      },
      "is_church": {
        "default": true,
        "title": "Is Church",
        "type": "boolean"
      },
      "atp_monthly": {
        "default": 0.0,
        "title": "Atp Monthly",
        "type": "number"
      },
      "other_pay_monthly": {
        "default": 0.0,
        "title": "Other Pay Monthly",
        "type": "number"
      },
      "taxable_benefits_monthly": {
        "default": 0.0,
        "title": "Taxable Benefits Monthly",
        "type": "number"
      },
      "pretax_deductions_monthly": {
        "default": 0.0,
        "title": "Pretax Deductions Monthly",
        "type": "number"
      },
      "aftertax_deductions_monthly": {
        "default": 0.0,
        "title": "Aftertax Deductions Monthly",
        "type": "number"
      },
      "transport_km": {
        "default": 0.0,
        "title": "Transport Km",
        "type": "number"
      },
      "transport_days": {
        "default": 218,
        "description": "Actual commuting days in the tax year",
        "maximum": 366,
        "minimum": 0,
        "title": "Transport Days",
        "type": "integer"
      },
      "a_kasse_fees_annual": {
        "default": 0.0,
        "description": "Annual A-kasse fees; no union cap",
        "minimum": 0,
        "title": "A Kasse Fees Annual",
        "type": "number"
      },
      "union_fees_annual": {
        "default": 0.0,
        "title": "Union Fees Annual",
        "type": "number"
      },
      "atp_auto": {
        "default": false,
        "title": "Atp Auto",
        "type": "boolean"
      },
      "max_hours": {
        "default": 220,
        "title": "Max Hours",
        "type": "integer"
      }
    },
    "required": [
      "hourly_rate"
    ],
    "title": "HoursCurveRequest",
    "type": "object"
  },
  "StudentHoursCurveRequest": {
    "properties": {
      "hourly_rate": {
        "description": "Student hourly wage in DKK",
        "title": "Hourly Rate",
        "type": "number"
      },
      "su_monthly": {
        "default": 7426.0,
        "description": "Monthly SU before tax",
        "maximum": 50000,
        "minimum": 0,
        "title": "Su Monthly",
        "type": "number"
      },
      "su_months": {
        "default": 12,
        "description": "Number of SU payments received in the tax year",
        "maximum": 12,
        "minimum": 0,
        "title": "Su Months",
        "type": "integer"
      },
      "kommune": {
        "default": "København",
        "title": "Kommune",
        "type": "string"
      },
      "pension_pct": {
        "default": 0.0,
        "title": "Pension Pct",
        "type": "number"
      },
      "employer_pension_pct": {
        "default": 0.0,
        "title": "Employer Pension Pct",
        "type": "number"
      },
      "pension_type": {
        "default": "standard",
        "enum": [
          "standard",
          "section53a"
        ],
        "title": "Pension Type",
        "type": "string"
      },
      "is_church": {
        "default": true,
        "title": "Is Church",
        "type": "boolean"
      },
      "aars_fribeloeb": {
        "anyOf": [
          {
            "type": "number"
          },
          {
            "type": "null"
          }
        ],
        "default": null,
        "title": "Aars Fribeloeb"
      },
      "atp_monthly": {
        "default": 0,
        "minimum": 0,
        "title": "Atp Monthly",
        "type": "number"
      },
      "atp_auto": {
        "default": false,
        "title": "Atp Auto",
        "type": "boolean"
      },
      "other_pay_monthly": {
        "default": 0,
        "title": "Other Pay Monthly",
        "type": "number"
      },
      "pretax_deductions_monthly": {
        "default": 0,
        "title": "Pretax Deductions Monthly",
        "type": "number"
      },
      "aftertax_deductions_monthly": {
        "default": 0,
        "title": "Aftertax Deductions Monthly",
        "type": "number"
      },
      "transport_km": {
        "default": 0,
        "minimum": 0,
        "title": "Transport Km",
        "type": "number"
      },
      "transport_days": {
        "default": 218,
        "maximum": 366,
        "minimum": 0,
        "title": "Transport Days",
        "type": "integer"
      },
      "union_fees_annual": {
        "default": 0,
        "minimum": 0,
        "title": "Union Fees Annual",
        "type": "number"
      },
      "a_kasse_fees_annual": {
        "default": 0,
        "minimum": 0,
        "title": "A Kasse Fees Annual",
        "type": "number"
      },
      "max_hours": {
        "default": 220,
        "title": "Max Hours",
        "type": "integer"
      },
      "step": {
        "default": 5,
        "minimum": 1,
        "title": "Step",
        "type": "integer"
      }
    },
    "required": [
      "hourly_rate"
    ],
    "title": "StudentHoursCurveRequest",
    "type": "object"
  },
  "FeedbackRequest": {
    "properties": {
      "type": {
        "description": "bug | feature | general",
        "maxLength": 20,
        "title": "Type",
        "type": "string"
      },
      "message": {
        "maxLength": 2000,
        "minLength": 1,
        "title": "Message",
        "type": "string"
      }
    },
    "required": [
      "type",
      "message"
    ],
    "title": "FeedbackRequest",
    "type": "object"
  },
  "AccuracyReportRequest": {
    "properties": {
      "report_id": {
        "anyOf": [
          {
            "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "default": null,
        "title": "Report Id"
      },
      "pay_month": {
        "anyOf": [
          {
            "pattern": "^2026-(0[1-9]|1[0-2])$",
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "default": null,
        "title": "Pay Month"
      },
      "actual_includes_su": {
        "anyOf": [
          {
            "type": "boolean"
          },
          {
            "type": "null"
          }
        ],
        "default": null,
        "title": "Actual Includes Su"
      },
      "actual_includes_holiday": {
        "anyOf": [
          {
            "type": "boolean"
          },
          {
            "type": "null"
          }
        ],
        "default": null,
        "title": "Actual Includes Holiday"
      },
      "estimate_definition": {
        "anyOf": [
          {
            "enum": [
              "ordinary_monthly_cash",
              "annual_average_including_holiday"
            ],
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "default": null,
        "title": "Estimate Definition"
      },
      "calculation_version": {
        "anyOf": [
          {
            "maxLength": 40,
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "default": null,
        "title": "Calculation Version"
      },
      "service_type": {
        "description": "fulltime | parttime | student",
        "maxLength": 20,
        "title": "Service Type",
        "type": "string"
      },
      "estimated_net_monthly": {
        "maximum": 10000000,
        "minimum": 0,
        "title": "Estimated Net Monthly",
        "type": "number"
      },
      "actual_net_monthly": {
        "maximum": 10000000,
        "minimum": 0,
        "title": "Actual Net Monthly",
        "type": "number"
      },
      "inputs": {
        "additionalProperties": true,
        "description": "Original calculation inputs",
        "title": "Inputs",
        "type": "object"
      }
    },
    "required": [
      "service_type",
      "estimated_net_monthly",
      "actual_net_monthly"
    ],
    "title": "AccuracyReportRequest",
    "type": "object"
  },
  "VoteRequest": {
    "properties": {
      "vote": {
        "description": "up | down",
        "maxLength": 10,
        "title": "Vote",
        "type": "string"
      },
      "service_type": {
        "description": "fulltime | parttime | student",
        "maxLength": 20,
        "title": "Service Type",
        "type": "string"
      },
      "estimated_net": {
        "default": 0,
        "maximum": 10000000,
        "minimum": 0,
        "title": "Estimated Net",
        "type": "number"
      }
    },
    "required": [
      "vote",
      "service_type"
    ],
    "title": "VoteRequest",
    "type": "object"
  }
};
