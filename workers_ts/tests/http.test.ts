import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.ts';
const post=(path:string,body:string,headers={})=>new Request('https://preview.invalid'+path,{method:'POST',headers:{'Content-Type':'application/json',...headers},body});
test('bounded request reading rejects oversized body and no unknown API becomes SPA',async()=>{
  assert.equal((await worker.fetch(post('/api/compute/fulltime','x'.repeat(131073)),{})).status,413);
  assert.equal((await worker.fetch(post('/api/compute/fulltime','{}',{'Content-Length':'9999999'}),{})).status,413);
  assert.equal((await worker.fetch(new Request('https://preview.invalid/api/nope'),{})).status,404);
  assert.equal((await worker.fetch(post('/api/compute/fulltime','{'),{})).status,422);
});
test('CORS permits only configured origins and methods',async()=>{
  const req=(origin:string)=>new Request('https://preview.invalid/api/meta',{headers:{Origin:origin}});
  assert.equal((await worker.fetch(req('https://lonklar.dk'),{})).headers.get('Access-Control-Allow-Origin'),'https://lonklar.dk');
  assert.equal((await worker.fetch(req('https://evil.invalid'),{})).headers.get('Access-Control-Allow-Origin'),null);
  const response=await worker.fetch(new Request('https://preview.invalid/api/meta',{method:'OPTIONS',headers:{Origin:'https://lonklar.dk','Access-Control-Request-Method':'DELETE'}}),{});
  assert.equal(response.status,400);
});
test('assets maintain cache policy without changing response content',async()=>{
  const env={ASSETS:{fetch:async()=>new Response('<html>unchanged</html>',{headers:{'Content-Type':'text/html'}})}};
  const response=await worker.fetch(new Request('https://preview.invalid/how-it-works'),env);
  assert.equal(response.headers.get('Cache-Control'),'no-cache');assert.equal(await response.text(),'<html>unchanged</html>');
});
