"""Bounded, read-only synthetic workloads; HTTP latency is not Worker CPU time."""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import math
import re
import statistics
import sys
from pathlib import Path
from poc_http import request

root=Path(__file__).resolve().parents[1];sys.path.insert(0,str(root))
from api import models
from api.routers import compute

CASES=[
 ('fulltime',{'gross_annual':600000},models.FullTimeRequest,compute.compute_fulltime),
 ('parttime',{'hourly_rate':180,'hours_month':80},models.PartTimeRequest,compute.compute_parttime),
 ('student',{'work_gross_monthly':7500},models.StudentRequest,compute.compute_student),
 ('curve',{'points':50},models.CurveRequest,compute.compute_curve),
 ('curve-max',{'points':500},models.CurveRequest,compute.compute_curve),
 ('hours-curve',{'hourly_rate':180,'atp_auto':True},models.HoursCurveRequest,compute.compute_hours_curve),
 ('student-hours-curve',{'hourly_rate':180,'atp_auto':True},models.StudentHoursCurveRequest,compute.compute_student_hours_curve),
 ('projection',{'scenario':{'gross_annual':600000},'settings':{'years':50}},models.ProjectionRequest,compute.compute_projection),
 ('comparison',{'scenario_a':{'gross_annual':500000},'scenario_b':{'gross_annual':600000},'projection':{'years':50}},models.ComparisonRequest,compute.compute_comparison),
]

def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds')
def equivalent(a,b):
    if isinstance(a,float) or isinstance(b,float):return math.isclose(a,b,rel_tol=1e-12,abs_tol=1e-7)
    if type(a)!=type(b):return False
    if isinstance(a,dict):return a.keys()==b.keys() and all(equivalent(a[k],b[k]) for k in a)
    if isinstance(a,list):return len(a)==len(b) and all(equivalent(x,y) for x,y in zip(a,b))
    return a==b

def sample(base,name,payload,expected,label,index):
    path='curve' if name=='curve-max' else name
    result=request(base,f'/api/compute/{path}?benchmark={label}-{name}-{index}',payload)
    result['correct']=result['status']==200 and equivalent(json.loads(result['body']),expected)
    # Keep platform error codes without persisting application response payloads.
    if result['status']!=200:
        match=re.fullmatch(rb'error code: (\d+)\s*',result['body'])
        result['platform_error_code']=int(match[1]) if match else None
    result.pop('body');return result

p=argparse.ArgumentParser();p.add_argument('--base',default='https://lonklar-python-poc.nicolo-pandolfo.workers.dev')
p.add_argument('--per-case',type=int,default=20);p.add_argument('--burst',type=int,default=80)
p.add_argument('--label',default='candidate');p.add_argument('--report',type=Path,required=True);args=p.parse_args()
assert 1<=args.per_case<=100 and 0<=args.burst<=200
assert args.label.replace('-','').isalnum()
expected={name:fn(model(**payload)) for name,payload,model,fn in CASES}
report={'label':args.label,'started':utc(),'cases':[],'burst':[],'burst_concurrency':8,'cpu_source':'Collect separately from Cloudflare workersInvocationsAdaptive; CPU units are microseconds.'}
for name,payload,_,_ in CASES:
    row={'name':name,'started':utc(),'requests':[]}
    for i in range(args.per_case):row['requests'].append(sample(args.base,name,payload,expected[name],args.label,i))
    row['finished']=utc();report['cases'].append(row);print(name,'complete',flush=True)
if args.burst:
    report['burst_started']=utc()
    def invoke(i):
        name,payload,_,_=CASES[i%len(CASES)]
        return {'case':name,**sample(args.base,name,payload,expected[name],args.label+'-burst',i)}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:report['burst']=list(pool.map(invoke,range(args.burst)))
    report['burst_finished']=utc()
report['finished']=utc();rows=[r for c in report['cases'] for r in c['requests']]+report['burst']
report['summary']={'http_requests':len(rows),'correct':sum(r['correct'] for r in rows),'http_errors':sum(r['status']!=200 for r in rows),
                   'http_median_ms':statistics.median(r['http_ms'] for r in rows),'http_p95_ms':sorted(r['http_ms'] for r in rows)[math.ceil(len(rows)*.95)-1]}
args.report.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report['summary']))
assert all(r['correct'] for r in rows),'Response errors or calculation differences: inspect report'
