import unittest

from fastapi.testclient import TestClient

from api.main import app
from api.tax_engine import compute_befordringsfradrag, compute_progressive_tax
from api.tax_rules import RULES_2027


class TaxYearTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def compute(self, route, body, year=None):
        response = self.client.post(
            f"/api/compute/{route}", json=body,
            params={} if year is None else {"tax_year": year},
        )
        self.assertEqual(response.status_code, 200, response.text)
        result = response.json()
        self.assertFalse(isinstance(result, dict) and "error" in result)
        return result

    def test_metadata(self):
        a = self.client.get("/api/meta").json()
        b = self.client.get("/api/meta?tax_year=2027").json()
        self.assertEqual(a["supported_tax_years"], [2026, 2027])
        self.assertEqual(a["constants"]["personfradrag"], 54100)
        self.assertEqual(b["constants"]["personfradrag"], 55700)
        self.assertEqual(b["constants"]["mellemskat_threshold"], 659900)
        self.assertEqual(set(a["kommuner"]), set(b["kommuner"]))
        self.assertEqual(len(b["kommuner"]), 98)
        self.assertEqual(a["kommuner"]["Gentofte"]["kommuneskat"], 24.14)
        self.assertEqual(b["kommuner"]["Gentofte"], {"kommuneskat": 24.04, "kirkeskat": 0.4})
        self.assertEqual(self.client.get("/api/meta?tax_year=2028").status_code, 422)
        self.assertEqual(self.client.post("/api/compute/fulltime?tax_year=2028",
                                        json={"gross_annual": 500000}).status_code, 422)

    def test_progressive_thresholds_and_commute(self):
        for idx, threshold, rate in [(0, 659900, .075), (1, 800500, .075), (2, 2668200, .05)]:
            for offset, expected in [(-1, 0), (0, 0), (1, rate)]:
                with self.subTest(threshold=threshold, offset=offset):
                    result = compute_progressive_tax(threshold + offset, 23.39, rules=RULES_2027)
                    self.assertAlmostEqual(result[idx], expected)
        for km, expected in [(24, 0), (25, 2.44), (120, 96 * 2.44), (121, 96 * 2.44 + 1.22)]:
            self.assertAlmostEqual(compute_befordringsfradrag(km, 1, rules=RULES_2027), expected)

    def test_salary_endpoints_and_extensions(self):
        full = {"gross_annual": 800000, "kommune": "Gentofte", "transport_km": 40}
        part = {"hours_month": 100, "hourly_rate": 200, "kommune": "Gentofte"}
        student = {"work_gross_monthly": 18000, "kommune": "Gentofte"}
        for route, body in [("fulltime", full), ("parttime", part), ("student", student)]:
            with self.subTest(route=route):
                a = self.compute(route, body)
                self.assertEqual(a, self.compute(route, body, 2026))
                b = self.compute(route, body, 2027)
                self.assertEqual(b["tax_year"], 2027)
                self.assertEqual(b["kommune_pct"], 24.04)
                self.assertNotEqual(a["net_monthly"], b["net_monthly"])
        b = self.compute("student", student, 2027)
        self.assertEqual(b["su_annual_gross"], 7608 * 12)
        self.assertEqual(b["aars_fribeloeb"], 21351 * 12)
        self.assertEqual(self.compute("student", {**student, "su_monthly": 0}, 2027)["su_annual_gross"], 0)
        base = self.compute("fulltime", full, 2027)
        # Compute the holiday-included result and its ordinary-net counterpart
        # with a separate explicit no-holiday tax calculation.
        self.assertGreater(base["net_ferie"], 0)
        self.assertAlmostEqual(base["net_monthly"] - base["ordinary_net_monthly"], base["net_ferie_monthly"])
        scenario = {**full, "employment_type": "fulltime"}
        p = self.compute("projection", {"scenario": scenario, "settings": {"years": 1}}, 2027)
        self.assertAlmostEqual(p["years"][0]["net_monthly"], base["net_monthly"])
        c = self.compute("comparison", {"scenario_a": scenario, "scenario_b": scenario}, 2027)
        self.assertEqual(c["scenario_a"]["tax_year"], 2027)
        self.assertAlmostEqual(c["scenario_a"]["net_monthly"], base["net_monthly"])

    def test_chart_matches_selected_year_result(self):
        body = {"kommune": "København", "gross_annual": 780000}
        for year in (2026, 2027):
            result = self.compute("fulltime", body, year)
            rows = self.compute("curve", {**body, "max_gross": 780000}, year)
            self.assertAlmostEqual(rows[-1]["net_monthly"], result["net_monthly"], places=2)
        student = self.compute("student-hours-curve", {"hourly_rate": 200}, 2027)
        self.assertEqual(student[0]["su_gross_monthly"], 7608)
        self.assertTrue(any(row["fribeloeb_boundary"] for row in student))
