import test from 'node:test';
import assert from 'node:assert/strict';
import {previewConfig,isolateHtml} from '../scripts/preview-build-utils.mjs';
test('preview build requires an explicit new database and cannot reuse Python PoC',()=>{
  for(const id of [undefined,'','production','891c9b79-dc3e-4b65-be50-b2233ecdb80b'])assert.throws(()=>previewConfig(id));
  const c=previewConfig('00000000-0000-4000-8000-000000000001');
  assert.equal(c.name,'lonklar-native-ts-preview');assert.equal(c.d1_databases.length,1);
  assert.equal(c.assets.run_worker_first,true);assert.equal(c.preview_urls,false);
  assert.equal(c.vars.ALLOWED_ORIGINS,'');assert.equal(c.vars.PREVIEW_MODE,'true');
  assert.equal(c.routes,undefined);assert.equal(c.vars.ADMIN_TOKEN,undefined);
});
test('preview HTML strips analytics and production SEO and warns about synthetic data',()=>{
  const result=isolateHtml(`<head><link rel="canonical" href="https://lonklar.dk/"><meta property="og:url" content="https://lonklar.dk/"><script type="application/ld+json">{}</script><script async src="https://analytics.lonklar.dk/script.js" data-website-id="example"></script></head><body><div id="root"></div></body>`);
  assert.ok(!result.includes('analytics.lonklar.dk'));assert.ok(!result.includes('canonical'));assert.ok(!result.includes('og:url'));assert.ok(!result.includes('application/ld+json'));
  assert.ok(result.includes('noindex,nofollow,noarchive'));assert.ok(result.includes('synthetic data only'));assert.ok(result.includes('id="root"'));
});
import {appFetch} from '../src/index.ts';
test('preview response headers cover HTML, deep links, APIs and errors without enabling admin',async()=>{
  const env={PREVIEW_MODE:'true',ALLOWED_ORIGINS:'',ASSETS:{async fetch(request:Request){return new Response(request.method==='HEAD'?null:'<html>preview</html>',{headers:{'Content-Type':'text/html'}});}}};
  for(const path of ['/','/wizard/fulltime','/api/meta','/api/missing','/api/admin/feedback']){
    const r=await appFetch(new Request('https://preview.test'+path,{headers:{Origin:'https://lonklar.dk'}}),env);
    assert.equal(r.headers.get('X-Robots-Tag'),'noindex, nofollow, noarchive');
    assert.equal(r.headers.get('Access-Control-Allow-Origin'),null);
    if(path==='/api/missing')assert.equal(r.status,404);
    if(path==='/api/admin/feedback')assert.equal(r.status,401);
  }
  const head=await appFetch(new Request('https://preview.test/',{method:'HEAD'}),env);assert.equal(await head.text(),'');
});
