import {schemas} from './schemas.ts';

export class ValidationError extends Error {
  detail: any[];
  constructor(detail: any[]) { super('Request validation failed'); this.detail=detail; }
}
// Preserve Pydantic's public defaults/coercions and error locations. Error prose
// is intentionally not a byte-for-byte reimplementation of the Python framework.
export function validate(model: string, input: unknown): any {
  const root = schemas[model];
  const errors: any[] = [];
  const fail = (loc: (string|number)[], type: string, value: unknown, msg=type) => {
    errors.push({type,loc:['body',...loc],msg,input:value});
    return undefined;
  };
  function walk(s: any, value: any, loc: (string|number)[]): any {
    if (s.$ref) return walk(root.$defs[s.$ref.split('/').pop()],value,loc);
    if (s.anyOf) {
      if (value === null && s.anyOf.some((v:any)=>v.type==='null')) return null;
      const branch=s.anyOf.find((v:any)=>v.type!=='null');
      return walk(branch,value,loc);
    }
    if (s.type==='object') {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) return fail(loc,'model_attributes_type',value);
      if (!s.properties) return value;
      const out: Record<string,unknown>={};
      for (const [key,prop] of Object.entries(s.properties) as [string,any][]) {
        if (!(key in value)) {
          if ('default' in prop) out[key]=structuredClone(prop.default);
          else if (s.required?.includes(key)) fail([...loc,key],'missing',value,'Field required');
          else if (prop.$ref && key==='settings') out[key]=walk(prop,{},[...loc,key]);
          else if (key==='inputs') out[key]={};
        } else out[key]=walk(prop,value[key],[...loc,key]);
      }
      return out;
    }
    if (s.type==='number'||s.type==='integer') {
      let n=value;
      if (typeof n==='boolean') n=Number(n);
      else if(typeof n==='string') {
        const trimmed=n.trim();
        const digits='[0-9](?:_?[0-9])*';
        const pattern=s.type==='integer'
          ? new RegExp('^[+-]?'+digits+'(?:\\.0+)?$')
          : new RegExp('^[+-]?(?:'+digits+'(?:\\.(?:'+digits+')?)?|\\.'+digits+')(?:[eE][+-]?'+digits+')?$');
        if(pattern.test(trimmed)) n=Number(trimmed.replaceAll('_',''));
      }
      if(typeof n!=='number'||!Number.isFinite(n)) return fail(loc,s.type==='integer'?'int_parsing':'float_parsing',value);
      if(s.type==='integer'&&!Number.isInteger(n)) return fail(loc,'int_from_float',value);
      if(s.minimum!==undefined&&n<s.minimum) return fail(loc,'greater_than_equal',value);
      if(s.maximum!==undefined&&n>s.maximum) return fail(loc,'less_than_equal',value);
      return n;
    }
    if(s.type==='boolean') {
      if(typeof value==='boolean') return value;
      if(value===1||value===0) return Boolean(value);
      if(typeof value==='string') {const s=value.toLowerCase();if(['true','1','on','yes','y','t'].includes(s))return true;if(['false','0','off','no','n','f'].includes(s))return false;}
      return fail(loc,'bool_parsing',value);
    }
    if(s.type==='string') {
      if(typeof value!=='string')return fail(loc,'string_type',value);
      if(s.enum&&!s.enum.includes(value))return fail(loc,'literal_error',value);
      const length=[...value].length;
      if(s.minLength!==undefined&&length<s.minLength)return fail(loc,'string_too_short',value);
      if(s.maxLength!==undefined&&length>s.maxLength)return fail(loc,'string_too_long',value);
      if(s.pattern&&!new RegExp(s.pattern).test(value))return fail(loc,'string_pattern_mismatch',value);
      return value;
    }
    return value;
  }
  const result=walk(root,input,[]);
  for(const [name,allowed] of Object.entries({
    FeedbackRequest:{type:['bug','feature','general']},
    VoteRequest:{vote:['up','down'],service_type:['fulltime','parttime','student']},
    AccuracyReportRequest:{service_type:['fulltime','parttime','student']},
  } as Record<string,Record<string,string[]>>)) {
    if(model!==name||!result)continue;
    for(const [key,values] of Object.entries(allowed))if(result[key]!==undefined&&!values.includes(result[key]))fail([key],'value_error',result[key]);
  }
  if(model==='AccuracyReportRequest'&&result?.inputs) {
    // Python json.dumps ensure_ascii=True, separators include spaces.
    const json=JSON.stringify(result.inputs,null,0).replace(/[^\x00-\x7f]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
    // Include Python's separator spaces using a string-aware scanner.
    let quoted=false,escaped=false,extra=0;
    for(const c of json){if(escaped){escaped=false;continue;}if(c==='\\'&&quoted){escaped=true;continue;}if(c==='"')quoted=!quoted;if(!quoted&&(c===','||c===':'))extra++;}
    if(json.length+extra>32768)fail(['inputs'],'value_error',result.inputs);
  }
  if(errors.length)throw new ValidationError(errors);
  return result;
}
