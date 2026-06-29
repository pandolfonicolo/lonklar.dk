import unittest
import importlib

from api.tax_engine import compute_tax


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


if __name__ == "__main__":
    unittest.main()
