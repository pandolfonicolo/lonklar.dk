/** LOCAL ONLY. Measures wall time through Miniflare dispatchFetch + JSON parsing.
 * Not Workers CPU, deployed latency, geographic routing, load or a cold-start SLA.
 * First request follows a fresh local workerd instance after its ready signal;
 * process startup is reported separately and is NOT a hosted isolate cold start.
 */
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const built=await build({entryPoints:[join(root,'src/index.ts')],bundle:true,format:'esm',platform:'browser',target:'es2023',write:false});
const cases=[
  {name:'fulltime',path:'/api/compute/fulltime',body:{gross_annual:600000}},
  {name:'heavy-curve',path:'/api/compute/curve',body:{max_gross:3600000,step_monthly:100}},
  {name:'50-year-projection',path:'/api/compute/projection',body:{scenario:{gross_annual:600000},settings:{years:50}}},
];
const summary={runtime:'local workerd via Miniflare',samplesPerCase:100,
  timing:'wall milliseconds incl local dispatch and JSON parsing; not Workers CPU or deployed latency',
  firstRequest:'fresh local runtime after ready; NOT a hosted cold-start measurement',results:[]};
for(const sample of cases){
  const startupStart=performance.now();
  const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:built.outputFiles[0].text,
    compatibilityDate:'2026-10-01',host:'127.0.0.1',port:0,cf:false,
    outboundService:()=>{throw new Error('Network forbidden in local benchmark');}}));
  try{
    await mf.ready;
    const localProcessStartupMs=performance.now()-startupStart;
    const measure=async()=>{
      const started=performance.now();
      const response=await mf.dispatchFetch(`http://local.test${sample.path}`,{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sample.body)});
      const payload=await response.json();
      assert.equal(response.status,200,JSON.stringify(payload));
      assert.ok(!payload.error);
      return {ms:performance.now()-started,points:Array.isArray(payload)?payload.length:undefined};
    };
    const first=await measure();const times=[];
    for(let i=0;i<100;i++)times.push((await measure()).ms);
    times.sort((a,b)=>a-b);
    const result={name:sample.name,firstRequestMs:first.ms,localProcessStartupMs,
      ...(first.points?{chartPoints:first.points}:{}),warm:{p50:times[50],p95:times[95],max:times.at(-1)}};
    summary.results.push(result);
    console.error(JSON.stringify(result));
  }finally{await mf.dispose();}
}
console.log(JSON.stringify(summary,null,2));
