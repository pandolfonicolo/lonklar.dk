#!/usr/bin/env python3
"""Synthetic API oracle corpus. Never uses production requests or personal data.

Mounts the unchanged compute/meta routers, not the original app middleware, so
slowapi/storage are deliberately outside this parity test's scope.
"""
from pathlib import Path
import hashlib
import json
import os
import random
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
os.environ.pop('APP_UPDATED_AT', None)
from fastapi import FastAPI
from fastapi.testclient import TestClient
from api.routers import compute, meta
from api.data import KOMMUNER

REFERENCE_COMMIT = 'f436bb22f2ea7e85365d35d0b1081ea17a7c9bd3'
manifest = json.loads(Path(__file__).with_name('oracle-source-sha256.json').read_text())
if manifest['reference_commit'] != REFERENCE_COMMIT:
    raise RuntimeError('Oracle source manifest commit mismatch')
for source, expected_hash in manifest['source_sha256'].items():
    actual_hash = hashlib.sha256((ROOT/source).read_bytes().replace(b'\r\n', b'\n')).hexdigest()
    if actual_hash != expected_hash:
        raise RuntimeError(f'Pinned oracle source changed: {source}; review source and provenance before updating manifest')

app = FastAPI()
app.include_router(compute.router)
app.include_router(meta.router)
client = TestClient(app, raise_server_exceptions=False)
cases = []

def add(name, endpoint, body=None, expected_status=200):
    path = '/api/' + endpoint
    response = client.get(path) if body is None else client.post(path, json=body)
    if response.status_code != expected_status:
        raise AssertionError(f'{name}: unexpected oracle status {response.status_code}: {response.text}')
    cases.append(dict(name=name, method='GET' if body is None else 'POST', path=path,
                      body=body, status=response.status_code, expected=(response.text if expected_status >= 500 else response.json())))

add('metadata', 'meta')
for i, kommune in enumerate(sorted(KOMMUNER)):
    # Every municipality is exercised with both pension treatments and church.
    for pension in ('standard', 'section53a'):
        add(f'municipality-{i}-{pension}', 'compute/fulltime', dict(
            kommune=kommune, gross_annual=960000, pension_pct=4,
            employer_pension_pct=8, pension_type=pension, is_church=True,
            transport_km=60, transport_days=218, union_fees_annual=9000,
            a_kasse_fees_annual=6000, taxable_benefits_monthly=300,
            other_pay_monthly=500, pretax_deductions_monthly=100,
            aftertax_deductions_monthly=150))

for gross in (0, .01, 1, 20000*12, 25000*12, 30000*12, 60000*12, 80000*12,
              100000*12, 300000*12, -1):
    add(f'salary-{gross}', 'compute/fulltime', dict(gross_annual=gross,
        pension_pct=0, employer_pension_pct=0, is_church=False, atp_monthly=0))
# Personal income threshold, both sides; fulltime 1% holiday pay included.
for threshold in (54100, 235200*.92, 641200, 777900, 2592700):
    for epsilon in (-1, -.000001, 0, .000001, 1):
        add(f'threshold-{threshold}-{epsilon}', 'compute/fulltime', dict(
            gross_annual=(threshold+epsilon)/(.92*1.01), pension_pct=0,
            employer_pension_pct=0, atp_monthly=0, is_church=False))
for km in (0, 24, 24.000001, 25, 119.999999, 120, 120.000001, 150):
    for days in (0, 218, 366):
        add(f'commute-{km}-{days}', 'compute/fulltime', dict(
            gross_annual=600000, transport_km=km, transport_days=days))
for hours in (0, 38.999999, 39, 77.999999, 78, 116.999999, 117, 220):
    for pension in ('standard', 'section53a'):
        atp=0 if hours<39 else 33 if hours<78 else 66 if hours<117 else 99
        add(f'parttime-{hours}-{pension}', 'compute/parttime', dict(
            hourly_rate=180.55, hours_month=hours, atp_monthly=atp,
            pension_type=pension, pension_pct=4, employer_pension_pct=8))
for months in (0, 6, 12):
    for work in (0, 15000, 20000, 30000, 300000):
        for pension in ('standard', 'section53a'):
            add(f'student-{months}-{work}-{pension}', 'compute/student', dict(
                work_gross_monthly=work, su_months=months, pension_type=pension,
                pension_pct=4, employer_pension_pct=8, aars_fribeloeb=None))
for excess in (0, .000001, 1000, 8301, 10000, 15375.5, 15376.5, 30000, 100000):
    add(f'su-repayment-{excess}', 'compute/student', dict(
        work_gross_monthly=(248988+excess)/(.92*1.125*12), aars_fribeloeb=248988))

# Curves include independent reference configurations from current Python tests.
curves = [
    ('default', {}),
    ('all-bands', dict(max_gross=3000000, points=30, pension_pct=4, atp_monthly=99,
         other_pay_monthly=500, taxable_benefits_monthly=200, pretax_deductions_monthly=100)),
    ('53a', dict(pension_type='section53a', employer_pension_pct=8, atp_monthly=0)),
    ('fine-step', dict(min_gross=300000, max_gross=310000, step_monthly=12.5)),
    ('single-point', dict(min_gross=300000, max_gross=300000, step_monthly=1)),
    ('zero', dict(max_gross=0)),
]
for name, body in curves:
    add('curve-'+name, 'compute/curve', body)
for wage in (100, 180, 500):
    for auto in (False, True):
        add(f'hours-{wage}-{auto}', 'compute/hours-curve', dict(
            hourly_rate=wage, pension_pct=4, atp_auto=auto))
        add(f'student-hours-{wage}-{auto}', 'compute/student-hours-curve', dict(
            hourly_rate=wage, pension_pct=4, atp_auto=auto, aars_fribeloeb=248988))
add('hours-no-crossing', 'compute/hours-curve', dict(hourly_rate=100, max_hours=13))
add('student-hours-three-crossings', 'compute/student-hours-curve', dict(
    hourly_rate=180, pension_pct=4, atp_auto=True,
    aars_fribeloeb=(117*180*1.085-80)*12*.92, max_hours=118))
for name, body in [('empty', {}), ('fulltime', dict(gross_annual=600000)),
                   ('parttime', dict(employment_type='parttime', hourly_rate=180, hours_month=160)),
                   ('null-salary', dict(gross_annual=None))]:
    for years in (1,5,50):
        add(f'projection-{name}-{years}', 'compute/projection', dict(scenario=body,
            settings=dict(years=years, salary_growth_pct=2, annual_return_pct=4)))
for growth in (-100, 0, 100):
    add(f'projection-growth-{growth}', 'compute/projection', dict(
        scenario=dict(gross_annual=600000), settings=dict(years=5,
            salary_growth_pct=growth, annual_return_pct=growth)))
a=dict(gross_annual=600000)
b=dict(gross_annual=660000, pension_type='section53a', pension_pct=5, employer_pension_pct=10)
for name, extra in [('none', {}), ('shared', dict(projection=dict(years=5))),
        ('separate', dict(projection_a=dict(years=3),projection_b=dict(years=5))),
        ('one-only', dict(projection_a=dict(years=3)))]:
    add('comparison-'+name, 'compute/comparison', dict(scenario_a=a,scenario_b=b,**extra))

rng=random.Random(20261101)
for i in range(80):
    body=dict(gross_annual=rng.uniform(0,4000000), kommune=rng.choice(list(KOMMUNER)),
        pension_pct=rng.uniform(0,15), employer_pension_pct=rng.uniform(0,20),
        pension_type=rng.choice(['standard','section53a']), is_church=bool(i%2),
        transport_km=rng.uniform(0,200), transport_days=rng.randint(0,366),
        atp_monthly=rng.choice([0,33,66,99]), other_pay_monthly=rng.uniform(0,1000),
        taxable_benefits_monthly=rng.uniform(0,1000), pretax_deductions_monthly=rng.uniform(0,1000),
        aftertax_deductions_monthly=rng.uniform(0,1000), union_fees_annual=rng.uniform(0,10000),
        a_kasse_fees_annual=rng.uniform(0,10000))
    add(f'seeded-salary-{i}', 'compute/fulltime', body)

# Existing Pydantic coercions are observable API behavior, not new validation.
for name, body in [('numeric-string',dict(gross_annual='600000')),
                   ('underscore-number',dict(gross_annual='1_000')),
                   ('bool-string',dict(gross_annual=600000,is_church='false')),
                   ('unknown-key',dict(gross_annual=600000,ignored='value'))]:
    add('coercion-'+name, 'compute/fulltime', body)
for endpoint, body in [('fulltime',dict(gross_annual=1)),('parttime',dict(hourly_rate=1,hours_month=1)),
        ('student',dict(work_gross_monthly=0)),('curve',{}),('hours-curve',dict(hourly_rate=1)),
        ('student-hours-curve',dict(hourly_rate=1))]:
    add('unknown-kommune-'+endpoint, 'compute/'+endpoint, dict(**body,kommune='Not a municipality'))
invalid = [
 ('fulltime',{}), ('fulltime',{'gross_annual':None}), ('fulltime',{'gross_annual':'abc'}),
 ('fulltime',{'gross_annual':1,'pension_type':'bad'}), ('fulltime',{'gross_annual':1,'is_church':'maybe'}),
 ('parttime',{'hourly_rate':100}), ('student',{'work_gross_monthly':0,'su_months':13}),
 ('student',{'work_gross_monthly':0,'su_months':-1}), ('student',{'work_gross_monthly':0,'su_months':6.5}),
 ('student',{'work_gross_monthly':0,'transport_days':367}), ('student',{'work_gross_monthly':0,'a_kasse_fees_annual':-1}),
 ('student',{'work_gross_monthly':0,'su_monthly':50001}), ('student-hours-curve',{'hourly_rate':100,'step':0}),
 ('projection',{'scenario':{},'settings':{'years':0}}), ('projection',{'scenario':{},'settings':{'years':51}}),
 ('projection',{'scenario':{},'settings':{'annual_return_pct':101}}),
 ('projection',{'scenario':{},'settings':{'years':'1e1'}}),
 ('comparison',{'scenario_a':{}}), ('projection',{'scenario':{'employment_type':'student'}}),
]
for i,(endpoint,body) in enumerate(invalid):
    add(f'invalid-{i}-{endpoint}', 'compute/'+endpoint, body, expected_status=422)

add('overflow-parttime', 'compute/parttime', dict(hourly_rate=1e308,hours_month=220), expected_status=500)
add('overflow-projection', 'compute/projection', dict(scenario=dict(gross_annual=1e308), settings=dict(years=50,salary_growth_pct=100)), expected_status=500)

sources=['api/tax_engine.py','api/data.py','api/models.py','api/chart_curves.py',
         'api/salary_scenarios.py','api/routers/compute.py','api/routers/meta.py']
result=dict(reference_commit=REFERENCE_COMMIT, seed=20261101,
            source_sha256={p:hashlib.sha256((ROOT/p).read_bytes().replace(b'\r\n', b'\n')).hexdigest() for p in sources}, cases=cases)
out=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).with_name('corpus.generated.json')
out.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
print(f'Wrote {len(cases)} synthetic cases to {out} ({out.stat().st_size} bytes)')
