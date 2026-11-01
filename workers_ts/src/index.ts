import {compute} from './compute.ts';
import {validate,ValidationError} from './validation.ts';
import {getMeta} from './meta.ts';
import {handleFeedback} from './feedback.ts';
import {handleExchange} from './exchange.ts';

export type Env = {
  APP_UPDATED_AT?:string; ALLOWED_ORIGINS?:string; ADMIN_TOKEN?:string;
  ASSETS?:{fetch(request:Request):Promise<Response>}; FEEDBACK_DB?:any;
  [key:string]:any;
};
const models:Record<string,string>={
  fulltime:'FullTimeRequest',parttime:'PartTimeRequest',student:'StudentRequest',
  projection:'ProjectionRequest',comparison:'ComparisonRequest',curve:'CurveRequest',
  'hours-curve':'HoursCurveRequest','student-hours-curve':'StudentHoursCurveRequest',
};
const feedbackModels:Record<string,string>={
  '/api/feedback':'FeedbackRequest','/api/vote':'VoteRequest','/api/accuracy-report':'AccuracyReportRequest',
};
function json(body:unknown,status=200):Response {
  // JSON.stringify silently turns NaN/Infinity into null, unlike FastAPI's
  // strict serializer. Reject overflow instead of reporting successful money.
  function finite(v:any):void {
    if(typeof v==='number'&&!Number.isFinite(v))throw new Error('Non-finite response');
    if(v&&typeof v==='object')for(const item of Object.values(v))finite(item);
  }
  finite(body);return Response.json(body,{status});
}
function cors(request:Request,response:Response,env:Env):Response {
  const origin=request.headers.get('Origin');
  const allowed=(env.ALLOWED_ORIGINS??'https://lonklar.dk,https://www.lonklar.dk,http://localhost:5173').split(',').map(s=>s.trim());
  if(origin&&allowed.includes(origin)){
    const headers=new Headers(response.headers);headers.set('Access-Control-Allow-Origin',origin);headers.append('Vary','Origin');
    return new Response(response.body,{status:response.status,headers});
  }
  return response;
}
async function readBody(request:Request):Promise<string|null> {
  const limit=131072;
  const advertised=request.headers.get('Content-Length');
  if(advertised!==null&&Number(advertised)>limit)return null;
  if(!request.body)return '';
  const reader=request.body.getReader();const parts:Uint8Array[]=[];let size=0;
  try {
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();return null;}parts.push(value);}
  } finally {reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.byteLength;}
  return new TextDecoder().decode(bytes);
}
async function route(request:Request,env:Env):Promise<Response>{
  const path=new URL(request.url).pathname;
  if(request.method==='OPTIONS'&&request.headers.has('Access-Control-Request-Method')){
    const origin=request.headers.get('Origin')??'';
    const allowed=(env.ALLOWED_ORIGINS??'https://lonklar.dk,https://www.lonklar.dk,http://localhost:5173').split(',').map(s=>s.trim());
    const method=request.headers.get('Access-Control-Request-Method')??'';
    const headers=(request.headers.get('Access-Control-Request-Headers')??'').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
    if(!allowed.includes(origin)||!['GET','POST'].includes(method)||headers.some(h=>!['accept','accept-language','content-language','content-type'].includes(h)))return new Response('Disallowed CORS request',{status:400});
    return new Response('OK',{headers:{'Access-Control-Allow-Methods':'GET, POST','Access-Control-Allow-Headers':'Accept, Accept-Language, Content-Language, Content-Type','Access-Control-Max-Age':'600'}});
  }
  const kind=path.startsWith('/api/compute/')?path.slice('/api/compute/'.length):'';
  const model=Object.hasOwn(models,kind)?models[kind]:feedbackModels[path];
  const getOnly=['/api/meta','/api/exchange-rates','/api/vote/stats','/api/admin/feedback'].includes(path);
  if((model&&request.method!=='POST')||(getOnly&&request.method!=='GET'))return json({detail:'Method Not Allowed'},405);
  if(request.method==='GET'&&path==='/api/meta')return json(getMeta(env.APP_UPDATED_AT));
  if(request.method==='GET'&&path==='/api/exchange-rates')return handleExchange(request,env);
  let body:any;
  if(model){
    // A preview safety limit, deliberately stricter than the uncapped legacy app.
    const raw=await readBody(request);
    if(raw===null)return json({detail:'Request too large'},413);
    try{body=JSON.parse(raw);}catch{return json({detail:[{type:'json_invalid',loc:['body'],msg:'Invalid JSON'}]},422);}
    body=validate(model,body);
    if(kind)return json(compute(kind,body));
  }
  if(model||path==='/api/vote/stats'||path==='/api/admin/feedback'){
    const response=await handleFeedback(request,path,body,env);
    if(response)return response;
  }
  if(path.startsWith('/api/'))return json({detail:'Not Found'},404);
  if(env.ASSETS&&['GET','HEAD'].includes(request.method)){
    const response=await env.ASSETS.fetch(request);
    const headers=new Headers(response.headers);
    if(path.startsWith('/assets/')&&response.ok)headers.set('Cache-Control','public, max-age=31536000, immutable');
    else if(headers.get('Content-Type')?.includes('text/html'))headers.set('Cache-Control','no-cache');
    return new Response(response.body,{status:response.status,headers});
  }
  return json({detail:'Not Found'},404);
}
export async function appFetch(request:Request,env:Env={}):Promise<Response>{
  let response:Response;
  try{response=await route(request,env);}
  catch(error){
    if(error instanceof ValidationError)response=json({detail:error.detail},422);
    else if(error instanceof RangeError)response=json({detail:error.message},422);
    else response=json({detail:'Internal Server Error'},500);
  }
  return cors(request,response,env);
}
export default {fetch:appFetch};
