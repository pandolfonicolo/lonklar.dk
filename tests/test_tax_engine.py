import unittest
import importlib

from api.tax_engine import compute_tax
from api.models import EmployeeScenarioRequest, ProjectionSettings
from api.salary_scenarios import (
    comparison_delta,
    compute_employee_scenario,
    project_employee_scenario,
)


class PensionTreatmentTests(unittest.TestCase):
    def test_standard_pension_is_default(self):
        args = dict(
            gross_annual=600_000,
            pension_pct=0.04,
            kommune_pct=23.8,
            kirke_pct=0.8,
            is_church=False,
            employer_pension_pct=0.08,
            atp_monthly=94.65,
        )

        implicit = compute_tax(**args)
        explicit = compute_tax(**args, pension_type="standard")

        self.assertEqual(implicit["pension_type"], "standard")
        self.assertEqual(explicit["pension_type"], "standard")
        self.assertAlmostEqual(implicit["net_annual"], explicit["net_annual"])
        self.assertAlmostEqual(implicit["taxable_income"], explicit["taxable_income"])

    def test_section53a_taxes_employee_and_employer_pension(self):
        args = dict(
            gross_annual=600_000,
            pension_pct=0.04,
            kommune_pct=23.8,
            kirke_pct=0.8,
            is_church=False,
            employer_pension_pct=0.08,
            atp_monthly=94.65,
        )

        standard = compute_tax(**args, pension_type="standard")
        section53a = compute_tax(**args, pension_type="section53a")

        self.assertEqual(section53a["pension_type"], "section53a")
        self.assertAlmostEqual(
            section53a["taxable_income"] - standard["taxable_income"],
            section53a["total_pension"],
        )
        self.assertAlmostEqual(section53a["total_pension"], standard["total_pension"])
        self.assertLess(section53a["net_annual"], standard["net_annual"])

    def test_supported_currency_configuration_includes_requested_currencies(self):
        try:
            meta = importlib.import_module("api.routers.meta")
        except ModuleNotFoundError as exc:
            self.skipTest(f"backend dependency missing: {exc.name}")

        for code in ("EUR", "NZD", "SEK", "NOK"):
            self.assertIn(code, meta.SUPPORTED_CURRENCIES)
            self.assertIn(code, meta.FALLBACK_RATES)
            self.assertGreater(meta.FALLBACK_RATES[code], 0)

    def test_scenario_matches_tax_engine_for_same_inputs(self):
        scenario = EmployeeScenarioRequest(
            employment_type="fulltime",
            gross_annual=600_000,
            kommune="København",
            pension_pct=4,
            employer_pension_pct=8,
            pension_type="standard",
            is_church=False,
            atp_monthly=94.65,
        )

        scenario_result = compute_employee_scenario(scenario)
        engine_result = compute_tax(
            gross_annual=600_000,
            pension_pct=0.04,
            employer_pension_pct=0.08,
            kommune_pct=scenario_result["kommune_pct"],
            kirke_pct=scenario_result["kirke_pct"],
            is_church=False,
            atp_monthly=94.65,
            pension_type="standard",
        )

        self.assertAlmostEqual(scenario_result["net_annual"], engine_result["net_annual"])
        self.assertAlmostEqual(scenario_result["taxable_income"], engine_result["taxable_income"])

    def test_comparison_delta_tracks_cash_pension_tax_and_compensation(self):
        base = compute_employee_scenario(EmployeeScenarioRequest(
            employment_type="fulltime",
            gross_annual=600_000,
            kommune="København",
            pension_pct=4,
            employer_pension_pct=8,
            pension_type="standard",
            is_church=False,
        ))
        offer = compute_employee_scenario(EmployeeScenarioRequest(
            employment_type="fulltime",
            gross_annual=660_000,
            kommune="København",
            pension_pct=5,
            employer_pension_pct=10,
            pension_type="section53a",
            is_church=False,
        ))

        delta = comparison_delta(base, offer)

        self.assertAlmostEqual(delta["net_annual"], offer["net_annual"] - base["net_annual"])
        self.assertAlmostEqual(delta["total_pension"], offer["total_pension"] - base["total_pension"])
        self.assertAlmostEqual(
            delta["tax"],
            offer["am_bidrag"] + offer["total_income_tax"] - base["am_bidrag"] - base["total_income_tax"],
        )
        self.assertAlmostEqual(
            delta["total_compensation"],
            offer["total_gross"] + offer["employer_pension"] - offer["taxable_employer_pension"]
            - base["total_gross"] - base["employer_pension"] + base["taxable_employer_pension"],
        )

    def test_projection_salary_growth_only_affects_future_rows(self):
        scenario = EmployeeScenarioRequest(
            employment_type="fulltime",
            gross_annual=600_000,
            kommune="København",
            pension_pct=4,
            employer_pension_pct=8,
            pension_type="standard",
            is_church=False,
        )

        current = compute_employee_scenario(scenario)
        projection = project_employee_scenario(
            scenario,
            ProjectionSettings(years=3, annual_return_pct=0, salary_growth_pct=5),
        )

        self.assertAlmostEqual(projection["years"][0]["gross_annual"], current["gross_annual"])
        self.assertGreater(projection["years"][1]["gross_annual"], projection["years"][0]["gross_annual"])
        self.assertAlmostEqual(
            projection["totals"]["total_pension"],
            sum(row["total_pension"] for row in projection["years"]),
        )
        self.assertAlmostEqual(
            projection["totals"]["projected_pension_balance"],
            projection["totals"]["total_pension"],
        )


if __name__ == "__main__":
    unittest.main()
