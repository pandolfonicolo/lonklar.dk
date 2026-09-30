"""Independent 2026 reference cases, plus API/storage regressions.

Source rules checked 30 September 2026:
- skat.dk/hjaelp/bundskat-mellemskat-topskat-og-toptopskat
- info.skat.dk/data.aspx?oid=1948928 (ceiling)
- info.skat.dk/data.aspx?oid=2273718 (LL §9 J/K)
- skat.dk/borger/fradrag/koerselsfradrag/koerselsfradrag-befordringsfradrag
- skat.dk/borger/fradrag/fradrag-for-fagforening-a-kasse-efterloen-og-fleksydelse
- virk.dk/vejledning/atp/atp-arbejdsgiver/atp-satser/
- su.dk/su/naar-du-faar-su/saa-meget-maa-du-tjene/du-har-tjent-for-meget

No personal tax records, live feedback writes, or production requests.
"""
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient
from api.main import app
from api.tax_engine import compute_tax, compute_student_income, compute_su_repayment, monthly_atp
from api.models import EmployeeScenarioRequest
from api.salary_scenarios import compute_employee_scenario
from api.routers import feedback


def employee(**overrides):
    args = dict(gross_annual=300_000, pension_pct=0, employer_pension_pct=0,
                kommune_pct=23.39, kirke_pct=0, is_church=False, atp_monthly=0)
    args.update(overrides)
    return compute_tax(**args)


def student(**overrides):
    args = dict(su_monthly=7426, work_gross_monthly=0, pension_pct=0,
                kommune_pct=23.39, kirke_pct=0, is_church=False)
    args.update(overrides)
    return compute_student_income(**args)


class PublishedRuleTests(unittest.TestCase):
    def test_seven_independent_salary_references(self):
        # Copenhagen; no pension/ATP/church; 1% holiday supplement included.
        # Audit reference calculated independently from published bands and bases.
        cases = [(20_000, 14209.93875), (25_000, 17415.0108875),
                 (30_000, 20567.8843416667), (60_000, 38732.0886666667),
                 (80_000, 48630.2276666667), (100_000, 57847.8916666667),
                 (300_000, 146889.4483333333)]
        for gross, net in cases:
            with self.subTest(gross=gross):
                self.assertAlmostEqual(employee(gross_annual=gross * 12)['net_monthly'], net, places=5)

    def test_progressive_thresholds_continue_cumulatively(self):
        # Explicit personal-income/tax fixtures, including one krone each side.
        cases = [(641199, 0, 0, 0), (641200, 0, 0, 0), (641201, .075, 0, 0),
                 (777899, 10252.425, 0, 0), (777900, 10252.5, 0, 0),
                 (777901, 10252.575, .075, 0),
                 (2592699, 146362.425, 136109.925, 0),
                 (2592700, 146362.5, 136110, 0),
                 (2592701, 146362.575, 136110.075, .05)]
        for income, mellem, top, toptop in cases:
            with self.subTest(income=income):
                r = employee(gross_annual=income / .92, _skip_ferie=True)
                for key, expected in [('mellemskat', mellem), ('topskat', top), ('toptopskat', toptop)]:
                    self.assertAlmostEqual(r[key], expected, places=5)

    def test_high_municipality_ceiling_only_reduces_mellemskat(self):
        r = employee(gross_annual=3_000_000 / .92, kommune_pct=26.3, _skip_ferie=True)
        self.assertAlmostEqual(r['mellemskat'], 147660.88)  # (3m - 641200) × 6.26%
        self.assertAlmostEqual(r['topskat'], 166657.5)
        self.assertAlmostEqual(r['toptopskat'], 20365)

    def test_deduction_base_is_pre_am_and_includes_qualifying_payroll_pension_atp(self):
        r = employee(pension_pct=.04, employer_pension_pct=.08, atp_monthly=99, _skip_ferie=True)
        # Salary 300000 + employer pension 24000 + employer ATP 2376.
        self.assertAlmostEqual(r['employment_deduction_base'], 326376)
        self.assertAlmostEqual(r['beskaeft_fradrag'], 41612.94)
        self.assertEqual(r['job_fradrag'], 3100)
        # Section 53A already includes taxable contributions; do not add twice.
        s = employee(pension_pct=.04, employer_pension_pct=.08, atp_monthly=99, pension_type='section53a', _skip_ferie=True)
        self.assertAlmostEqual(s['employment_deduction_base'], 326376)

    def test_job_deduction_starts_at_pre_am_threshold(self):
        for gross, expected in [(235199, 0), (235200, 0), (235201, .045), (250000, 666), (400000, 3100)]:
            with self.subTest(gross=gross):
                self.assertAlmostEqual(employee(gross_annual=gross, _skip_ferie=True)['job_fradrag'], expected)

    def test_standard_commuting_days_and_bands(self):
        for km, days, expected in [(24, 218, 0), (25, 100, 317), (60, 218, 24878.16),
                                   (120, 218, 66341.76), (150, 218, 76740.36), (60, 0, 0)]:
            with self.subTest(km=km, days=days):
                self.assertAlmostEqual(employee(transport_km=km, transport_days=days)['befordring'], expected)

    def test_a_kasse_does_not_share_union_cap(self):
        for calculate in [employee, student]:
            r = calculate(union_fees_annual=9000, a_kasse_fees_annual=6000)
            self.assertEqual(r['union_deduction'], 7000)
            self.assertEqual(r['a_kasse_deduction'], 6000)
            self.assertEqual(r['lignings_fradrag'], 13000)

    def test_atp_monthly_boundaries(self):
        for hours, expected in [(0,0),(38.9,0),(39,33),(77.9,33),(78,66),(116.9,66),(117,99),(160,99)]:
            self.assertEqual(monthly_atp(hours), expected)

    def test_tax_rate_excludes_pension_savings_and_atp(self):
        r = employee(pension_pct=.04, employer_pension_pct=.08, atp_monthly=99)
        self.assertAlmostEqual(r['effective_tax_rate'], (r['am_bidrag'] + r['total_income_tax']) / r['total_gross'] * 100)
        self.assertAlmostEqual(r['ordinary_net_monthly'] + r['net_ferie_monthly'], r['net_monthly'])

    def test_su_zero_six_twelve_payments(self):
        for months, gross, net in [(0,0,0),(6,44556,44556),(12,89112,76717.752)]:
            r = student(su_months=months)
            self.assertEqual(r['su_annual_gross'], gross)
            self.assertAlmostEqual(r['net_annual'], net)

    def test_su_excluded_but_holiday_pay_counted(self):
        for su in [0,7426]:
            r = student(su_monthly=su, work_gross_monthly=20000)
            self.assertEqual(r['work_after_am'], 248400)
            self.assertFalse(r['over_fribeloeb'])

    def test_su_discount_cap_and_supplement_boundaries(self):
        cases = [(0,89112,0,0),(1000,89112,500,0),(8301,89112,4150.5,0),
                 (10000,89112,5849.5,0),(15375.5,89112,11225,0),
                 (15376.5,89112,11226,785.82),(30000,89112,25849.5,1809.465),
                 (70000,30000,30000,2100),(10000,0,0,0)]
        for excess, received, principal, supplement in cases:
            with self.subTest(excess=excess,received=received):
                p, s = compute_su_repayment(excess, received)
                self.assertAlmostEqual(p, principal)
                self.assertAlmostEqual(s, supplement)

    def test_su_later_repayment_not_deducted_from_current_income(self):
        args = dict(work_gross_monthly=30000, su_months=6)
        risk = student(**args, aars_fribeloeb=266082)
        no_risk = student(**args, aars_fribeloeb=999999)
        self.assertTrue(risk['over_fribeloeb'])
        self.assertIsNone(risk['su_repayment_interest'])
        self.assertEqual(risk['net_annual'], no_risk['net_annual'])
        self.assertAlmostEqual(risk['ordinary_net_monthly'] + risk['net_ferie_monthly'], risk['net_monthly'])

    def test_student_higher_brackets_use_combined_income(self):
        r = student(su_monthly=0, work_gross_monthly=3_000_000 / (.92 * 1.125 * 12))
        self.assertAlmostEqual(r['mellemskat'], 176910)
        self.assertAlmostEqual(r['topskat'], 166657.5)
        self.assertAlmostEqual(r['toptopskat'], 20365)


class ApiRegressionTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app, raise_server_exceptions=False)

    def test_new_fields_reach_employee_curve_and_scenario(self):
        body = dict(gross_annual=300000, pension_pct=0, employer_pension_pct=0,
                    is_church=False, atp_monthly=0, transport_km=60,
                    transport_days=100, union_fees_annual=7000, a_kasse_fees_annual=6000)
        r = self.client.post('/api/compute/fulltime',json=body).json()
        self.assertEqual(r['befordring'], 11412)
        self.assertEqual(r['a_kasse_deduction'], 6000)
        curve = self.client.post('/api/compute/curve',json={**body,'min_gross':300000,'max_gross':300000,'step_monthly':1}).json()
        self.assertEqual(curve[0]['net_monthly'], round(r['net_monthly'], 2))
        scenario = compute_employee_scenario(EmployeeScenarioRequest(**body))
        self.assertAlmostEqual(scenario['net_monthly'], r['net_monthly'])

    def test_su_months_and_deductions_reach_hours_curve(self):
        body = dict(su_months=6, work_gross_monthly=15000, pension_pct=0,
                    employer_pension_pct=0,is_church=False,atp_monthly=66,
                    transport_km=60, transport_days=100, a_kasse_fees_annual=6000)
        r = self.client.post('/api/compute/student',json=body).json()
        self.assertEqual(r['su_annual_gross'],44556)
        curve = self.client.post('/api/compute/student-hours-curve',json={**body,'hourly_rate':150,'max_hours':100,'step':100}).json()
        self.assertEqual(curve[-1]['net_annual'], round(r['net_annual']))

    def test_chart_tax_band_uses_personal_income_not_gross(self):
        for gross, expected in [(660000, 'Bundskat'), (960000, 'Topskat'), (3600000, 'Toptopskat')]:
            body=dict(min_gross=gross,max_gross=gross,step_monthly=1,pension_pct=0,
                      employer_pension_pct=0,atp_monthly=0,is_church=False)
            r=self.client.post('/api/compute/curve',json=body)
            self.assertEqual(r.status_code,200)
            self.assertEqual(r.json()[0]['tax_band'],expected)

    def test_new_inputs_validated(self):
        for field,value in [('su_months',13),('su_months',-1),('su_months',6.5),('transport_days',367),('a_kasse_fees_annual',-1)]:
            with self.subTest(field=field):
                r=self.client.post('/api/compute/student',json={'work_gross_monthly':0,field:value})
                self.assertEqual(r.status_code,422)

    def test_accuracy_retry_is_idempotent_and_errors_are_not_success(self):
        with tempfile.TemporaryDirectory() as folder, patch.object(feedback,'FEEDBACK_DIR',Path(folder)):
            body=dict(service_type='fulltime',estimated_net_monthly=20000,actual_net_monthly=19000,
                      report_id=str(uuid4()),pay_month='2026-09',estimate_definition='ordinary_monthly_cash',
                      actual_includes_holiday=False,calculation_version='2026-09-30.1')
            first=self.client.post('/api/accuracy-report',json=body)
            second=self.client.post('/api/accuracy-report',json=body)
            self.assertEqual(first.status_code,200)
            self.assertFalse(first.json()['duplicate'])
            self.assertTrue(second.json()['duplicate'])
            lines=[line for p in Path(folder).glob('*.jsonl') for line in p.read_text().splitlines()]
            self.assertEqual(len(lines),1)
            stored=json.loads(lines[0]); self.assertEqual(stored['difference'],-1000)
            conflict=self.client.post('/api/accuracy-report',json={**body,'actual_net_monthly':18000})
            self.assertEqual(conflict.status_code,409)
            with patch.object(feedback,'_append_jsonl',side_effect=OSError('disk unavailable')):
                failed=self.client.post('/api/accuracy-report',json={**body,'report_id':str(uuid4())})
                self.assertEqual(failed.status_code,500)
