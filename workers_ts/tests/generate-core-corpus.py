"""Deterministic synthetic data only; never reads production or user inputs."""
import random, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from api.tax_engine import compute_tax,compute_student_income
from api.data import KOMMUNER
rng=random.Random(20261101)
cases=[]
for i in range(2000):
 r=rng.choice(list(KOMMUNER.values()))
 params=dict(pension_pct=rng.choice([0,.04,.15]),employer_pension_pct=rng.choice([0,.08,.2]),kommune_pct=r['kommuneskat'],kirke_pct=r['kirkeskat'],is_church=bool(i%2),pension_type=rng.choice(['standard','section53a']),transport_km=rng.choice([0,24,25,120,150]),transport_days=rng.choice([0,100,218,366]),atp_monthly=rng.choice([0,33,66,99]),union_fees_annual=rng.choice([0,7000,9000]),a_kasse_fees_annual=rng.choice([0,6000]),other_pay_annual=rng.uniform(0,10000),pretax_deductions_annual=rng.uniform(0,2000),aftertax_deductions_annual=rng.uniform(0,1000))
 if i%2:
  params.update(su_monthly=rng.choice([0,7426]),su_months=rng.choice([0,6,12]),work_gross_monthly=rng.uniform(0,300000),aars_fribeloeb=rng.choice([None,0,248988]))
  fn=compute_student_income;name='computeStudentIncome'
 else:
  params.update(gross_annual=rng.uniform(0,5000000),is_hourly=bool(i%3),taxable_benefits_annual=rng.uniform(0,10000))
  fn=compute_tax;name='computeTax'
 cases.append(dict(name=name,params=params,result=fn(**params)))
rounds=[dict(x=x,d=d,expected=round(x,d)) for x in [0.,-0.,.5,1.5,2.5,-2.5,2.675,1.005,1e-300,1e300]+[rng.uniform(-1e7,1e7) for _ in range(2000)] for d in [0,2,6,8]]
json.dump(dict(cases=cases,rounds=rounds),sys.stdout)
