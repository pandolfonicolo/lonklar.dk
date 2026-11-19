/** LOCAL ONLY: real workerd + ephemeral D1/native rate limiter. No account,
 * deployment, credentials or external requests. Never point at production DBs. */
import assert from 'node:assert/strict';
import {readFile, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {Miniflare, convertV4MiniflareOptions} from 'miniflare';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const corpusPath=join(root,'tests/corpus.generated.json');
let corpus;
try {corpus=JSON.parse(await readFile(corpusPath,'utf8'));}
catch {throw new Error('Missing API corpus: run python tests/generate-corpus.py before npm run test:runtime');}
assert.equal(corpus.reference_commit,'f436bb22f2ea7e85365d35d0b1081ea17a7c9bd3');
for(const [path,sha] of Object.entries(corpus.source_sha256)){
  const source=(await readFile(join(root,'..',path),'utf8')).replace(/\r\n/g,'\n');
  assert.equal(createHash('sha256').update(source).digest('hex'),sha,`Reference changed: ${path}`);
}
let comparedNumbers=0, exactRoundedChartValues=0, maximumAbsoluteDifference=0;
const roundedChartMoney=new Set(['net_monthly','ferie_net_monthly','effective_rate',
  'net_annual','su_gross_monthly','feriepenge_monthly','deductions_monthly']);
function compare(actual,expected,path,chart){
  if(typeof expected==='number'){
    assert.equal(typeof actual,'number',path);assert.ok(Number.isFinite(actual),path);
    const delta=Math.abs(actual-expected);comparedNumbers++;
    maximumAbsoluteDifference=Math.max(maximumAbsoluteDifference,delta);
    if(chart&&roundedChartMoney.has(path.split('.').at(-1))){
      exactRoundedChartValues++;assert.equal(actual,expected,path);
    }else assert.ok(delta<=1e-7+2e-12*Math.abs(expected),`${path}: ${actual} != ${expected}`);
  }else if(expected===null||typeof expected!=='object')assert.equal(actual,expected,path);
  else if(Array.isArray(expected)){
    assert.ok(Array.isArray(actual),path);assert.equal(actual.length,expected.length,path);
    expected.forEach((v,i)=>compare(actual[i],v,`${path}.${i}`,chart));
  }else{
    assert.ok(actual!==null&&typeof actual==='object'&&!Array.isArray(actual),path);
    assert.deepEqual(Object.keys(actual).sort(),Object.keys(expected).sort(),path);
    for(const [key,value] of Object.entries(expected))compare(actual[key],value,`${path}.${key}`,chart);
  }
}

const temp = await mkdtemp(join(tmpdir(), 'lonklar-workerd-smoke-'));
const bundle = await build({entryPoints:[join(root,'src/index.ts')], bundle:true,
  format:'esm', platform:'browser', target:'es2023', write:false});
let outbound = 0;
const runtimeOptions = {modules:true, script:bundle.outputFiles[0].text,
  compatibilityDate:'2026-10-01', host:'127.0.0.1', port:0, cf:false,
  d1Databases:{FEEDBACK_DB:'synthetic-local-only'}, d1Persist:join(temp,'d1'),
  bindings:{ADMIN_TOKEN:'synthetic-local-test-only'},
  ratelimits:{VOTE_STATS_LIMITER:{namespace_id:'1001',simple:{limit:60,period:60}}},
  outboundService: () => {outbound++; throw new Error('External network forbidden in smoke test');},
};
const mf = new Miniflare(convertV4MiniflareOptions(runtimeOptions));
let requests = 0;
const elapsed=[];
async function call(path,body,headers={}) {
  const start=performance.now();
  const response=await mf.dispatchFetch(`http://local.test${path}`, {
    method:body === undefined ? 'GET' : 'POST',
    headers:{'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...headers},
    ...(body === undefined ? {} : {body:JSON.stringify(body)}),
  });
  const payload=await response.json();
  elapsed.push(performance.now()-start); requests++;
  return {status:response.status,payload,headers:response.headers};
}
try {
  await mf.ready;
  const db=await mf.getD1Database('FEEDBACK_DB');
  const migration=(await readFile(join(root,'migrations/0001_feedback.sql'),'utf8'))
    .replace(/--[^\n]*/g,'');
  for (const sql of migration.split(';').map(x=>x.trim()).filter(Boolean)) await db.prepare(sql).run();
  const scenario={gross_annual:600000,kommune:'København'};
  const cases=[['fulltime',scenario],['parttime',{hourly_rate:180,hours_month:100}],
    ['student',{work_gross_monthly:15000}],['projection',{scenario}],
    ['comparison',{scenario_a:scenario,scenario_b:{gross_annual:660000}}],
    ['curve',{max_gross:1200000}],['hours-curve',{hourly_rate:180}],
    ['student-hours-curve',{hourly_rate:180}]];
  for(const [kind,body] of cases){
    const response=await call(`/api/compute/${kind}`,body);
    assert.equal(response.status,200,JSON.stringify({kind,...response}));
    assert.ok(!response.payload.error,kind);
    if(kind.includes('curve'))assert.ok(response.payload.length>1,kind);
  }

  for(const c of corpus.cases){
    const response=await call(c.path,c.method==='POST'?c.body:undefined);
    assert.equal(response.status,c.status,`${c.name}: status`);
    if(c.status===422){
      const locations=payload=>payload.detail.map(e=>JSON.stringify(e.loc)).sort();
      assert.deepEqual(locations(response.payload),locations(c.expected),c.name);
    }else if(c.status<500) compare(response.payload,c.expected,c.name,c.path.includes('curve'));
  }

  const meta=await call('/api/meta');assert.equal(meta.status,200);assert.equal(meta.payload.tax_year,2026);
  const vote=await call('/api/vote',{vote:'up',service_type:'fulltime',estimated_net:20000});
  assert.equal(vote.status,200);
  const feedback=await call('/api/feedback',{type:'general',message:'Synthetic local workerd test only'});
  assert.equal(feedback.status,200);
  const report={report_id:'00000000-0000-4000-8000-000000000001',service_type:'fulltime',
    estimated_net_monthly:20000,actual_net_monthly:19000,inputs:{synthetic:true}};
  const first=await call('/api/accuracy-report',report);assert.equal(first.status,200);assert.equal(first.payload.duplicate,false);
  const duplicate=await call('/api/accuracy-report',report);assert.equal(duplicate.status,200);assert.equal(duplicate.payload.duplicate,true);
  const conflict=await call('/api/accuracy-report',{...report,actual_net_monthly:18000});assert.equal(conflict.status,409);
  const unauthorized=await call('/api/admin/feedback');assert.equal(unauthorized.status,401);
  const admin=await call('/api/admin/feedback',undefined,{'x-admin-token':'synthetic-local-test-only'});
  assert.equal(admin.status,200);assert.equal(admin.payload.votes.length,1);
  assert.equal(admin.payload.feedback.length,1);assert.equal(admin.payload.accuracy_reports.length,1);
  const countersBefore=await db.prepare('SELECT * FROM feedback_limits ORDER BY key').all();
  for(let i=0;i<60;i++){
    const stats=await call('/api/vote/stats',undefined,{'CF-Connecting-IP':'192.0.2.60'});
    assert.equal(stats.status,200,`Native limiter admission ${i+1}`);
    assert.deepEqual(stats.payload,{up:1,down:0,total:1});
  }
  const limited=await call('/api/vote/stats',undefined,{'CF-Connecting-IP':'192.0.2.60'});
  assert.equal(limited.status,429);assert.equal(limited.headers.get('retry-after'),'60');
  const countersAfter=await db.prepare('SELECT * FROM feedback_limits ORDER BY key').all();
  assert.deepEqual(countersAfter.results,countersBefore.results,'Stats reads must not write D1 rate counters');
  // Mutating feedback still uses the durable SQL-backed limit.
  for(let i=0;i<10;i++)assert.equal((await call('/api/feedback', {type:'general',message:'synthetic quota probe'}, {'CF-Connecting-IP':'192.0.2.10'})).status,200);
  assert.equal((await call('/api/feedback',{type:'general',message:'must be refused'}, {'CF-Connecting-IP':'192.0.2.10'})).status,429);
  await mf.setOptions(convertV4MiniflareOptions({...runtimeOptions,ratelimits:{}}));
  assert.equal((await call('/api/vote/stats')).status,503,'Missing native limiter must fail closed');
  assert.equal(outbound,0);
  elapsed.sort((a,b)=>a-b);
  console.log(JSON.stringify({runtime:'local workerd via Miniflare; NOT hosted latency',
    computeEndpoints:8,apiCorpusCases:corpus.cases.length,comparedNumbers,exactRoundedChartValues,maximumAbsoluteDifference,requests,d1Migration:true,feedback:true,accuracyRetryAndConflict:true,
    admin:true,nativeRateLimiter:'60 admissions then 429',statsD1CounterWrites:0,missingNativeLimiterFailsClosed:true,
    durableMutationLimit:true,outboundRequests:outbound,
    localEndToEndMs:{p50:elapsed[Math.floor(elapsed.length*.5)],p95:elapsed[Math.floor(elapsed.length*.95)]}},null,2));
} finally {
  await mf.dispose();
  await rm(temp,{recursive:true,force:true});
}
