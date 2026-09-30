"""Independent chart-axis references and threshold regressions."""
import unittest

from api.models import CurveRequest, HoursCurveRequest, StudentHoursCurveRequest
from api.routers.compute import compute_curve, compute_hours_curve, compute_student_hours_curve


class ChartBoundaryTests(unittest.TestCase):
    def test_gross_axis_accounts_for_am_pension_atp_and_benefits(self):
        # Personal income = .92 × [gross × (1.01-.04) + 12×(500+200-100-99)].
        data = compute_curve(CurveRequest(pension_pct=4, atp_monthly=99,
            other_pay_monthly=500, taxable_benefits_monthly=200,
            pretax_deductions_monthly=100, max_gross=3_000_000, step_monthly=500))
        points = [p for p in data if p['tax_boundary']]
        self.assertEqual([p['tax_boundary'] for p in points], ['Mellemskat', 'Topskat', 'Toptopskat'])
        for p, threshold in zip(points, (641200, 777900, 2592700)):
            expected = (threshold / .92 - 12 * 501) / .97 / 12
            self.assertAlmostEqual(p['gross_monthly'], expected, places=5)
            self.assertEqual(p['tax_band_after'], p['tax_boundary'])
            self.assertIn(p, data)

    def test_section53a_has_a_different_gross_boundary(self):
        # Employer pension is taxable; employee pension is not deducted here.
        data = compute_curve(CurveRequest(pension_pct=4, employer_pension_pct=8,
            pension_type='section53a', atp_monthly=0, step_monthly=500))
        p = next(p for p in data if p['tax_boundary'] == 'Mellemskat')
        self.assertAlmostEqual(p['gross_monthly'], 641200 / .92 / 1.09 / 12, places=5)

    def test_hourly_boundaries_and_atp_steps(self):
        data = compute_hours_curve(HoursCurveRequest(hourly_rate=500, pension_pct=4, atp_auto=True))
        p = next(p for p in data if p['tax_boundary'] == 'Mellemskat')
        # Boundary is below 117 hours: ATP is 66 kr/mo; holiday pay is 12.5%.
        expected = (641200 / .92 / 12 + 66) / (500 * 1.085)
        self.assertAlmostEqual(p['hours_month'], expected, places=7)
        for h in (39, 78, 117):
            self.assertTrue(any(p['hours_month'] == h for p in data))
            self.assertTrue(any(h - .000002 < p['hours_month'] < h for p in data))
        self.assertEqual(data[-1]['hours_month'], 220)

    def test_student_limit_is_exact_and_excludes_su(self):
        req = dict(hourly_rate=180, pension_pct=4, atp_auto=True, aars_fribeloeb=248988)
        data = compute_student_hours_curve(StudentHoursCurveRequest(**req))
        p = next(p for p in data if p['fribeloeb_boundary'])
        # This boundary is below 117 hours, so the ATP deduction is 66 kr.
        expected = (248988 / .92 / 12 + 66) / (180 * 1.085)
        self.assertAlmostEqual(p['hours_month'], expected, places=7)
        without_su = compute_student_hours_curve(StudentHoursCurveRequest(**req, su_months=0))
        q = next(p for p in without_su if p['fribeloeb_boundary'])
        self.assertAlmostEqual(p['hours_month'], q['hours_month'], places=7)
        self.assertFalse(data[0]['over_fribeloeb'])
        self.assertTrue(data[-1]['over_fribeloeb'])

    def test_no_visible_crossing_does_not_invent_a_boundary(self):
        employee = compute_hours_curve(HoursCurveRequest(hourly_rate=100, max_hours=13))
        self.assertFalse(any(p['tax_boundary'] for p in employee))
        self.assertEqual(employee[-1]['hours_month'], 13)
        student = compute_student_hours_curve(StudentHoursCurveRequest(hourly_rate=100, max_hours=13))
        self.assertFalse(any(p['fribeloeb_boundary'] for p in student))

    def test_atp_jump_can_temporarily_return_below_student_limit(self):
        limit = (117 * 180 * 1.085 - 80) * 12 * .92
        data = compute_student_hours_curve(StudentHoursCurveRequest(hourly_rate=180,
            pension_pct=4, atp_auto=True, aars_fribeloeb=limit, max_hours=118))
        transitions = [p for p in data if p['fribeloeb_boundary']]
        self.assertEqual([p['over_fribeloeb_after'] for p in transitions], [True, False, True])

    def test_student_tooltip_tax_rate_excludes_pension_and_atp(self):
        data = compute_student_hours_curve(StudentHoursCurveRequest(hourly_rate=180,
            pension_pct=4, atp_monthly=66, is_church=False))
        point = next(p for p in data if p['hours_month'] == 80)
        gross = 7426 + 180 * 80 * 1.125
        deductions = point['deductions_monthly']
        # Total deductions include 4% pension and ATP; a tax rate excludes both.
        expected_tax_rate = (deductions - 180 * 80 * .04 - 66) / gross * 100
        self.assertAlmostEqual(point['effective_rate'], expected_tax_rate, places=2)


if __name__ == '__main__':
    unittest.main()
