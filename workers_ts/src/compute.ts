import * as D from './data.ts';
import {computeTax,computeStudentIncome,monthlyAtp} from './tax-engine.ts';
import {computeEmployeeScenario,projectEmployeeScenario,comparisonDelta} from './salary-scenarios.ts';
import {hoursSamples,sampleBoundaries} from './chart-curves.ts';
import {pyRound} from './numeric.ts';

const taxBand=(r:any)=>r.toptopskat>0?'Toptopskat':r.topskat>0?'Topskat':r.mellemskat>0?'Mellemskat':'Bundskat';
const boundaries:[number,string][]=[[D.MELLEMSKAT_THRESHOLD,'Mellemskat'],[D.TOPSKAT_THRESHOLD,'Topskat'],[D.TOPTOPSKAT_THRESHOLD,'Toptopskat']];
function common(req:any,rates:any){return {
  pension_pct:req.pension_pct/100,employer_pension_pct:req.employer_pension_pct/100,
  kommune_pct:rates.kommuneskat,kirke_pct:rates.kirkeskat,is_church:req.is_church,
  pension_type:req.pension_type,atp_monthly:req.atp_monthly,
  other_pay_annual:req.other_pay_monthly*12,pretax_deductions_annual:req.pretax_deductions_monthly*12,
  aftertax_deductions_annual:req.aftertax_deductions_monthly*12,
  transport_km:req.transport_km,transport_days:req.transport_days,
  union_fees_annual:req.union_fees_annual,a_kasse_fees_annual:req.a_kasse_fees_annual,
};}
function employee(req:any,rates:any,gross:number,hourly:boolean,atp=req.atp_monthly){return computeTax({
  ...common(req,rates),gross_annual:gross,is_hourly:hourly,has_employment_income:true,
  taxable_benefits_annual:req.taxable_benefits_monthly*12,atp_monthly:atp,
});}
function student(req:any,rates:any,gross:number,atp=req.atp_monthly){return computeStudentIncome({
  ...common(req,rates),su_monthly:req.su_monthly,su_months:req.su_months,
  work_gross_monthly:gross,aars_fribeloeb:req.aars_fribeloeb,atp_monthly:atp,
});}
export function compute(kind:string,req:any):any {
  if(kind==='projection')return projectEmployeeScenario(req.scenario,req.settings);
  if(kind==='comparison') {
    const a=computeEmployeeScenario(req.scenario_a),b=computeEmployeeScenario(req.scenario_b);
    if(a.error)return a;if(b.error)return b;
    let pa:any=null,pb:any=null,pd:any=null;
    const sa=req.projection_a??req.projection,sb=req.projection_b??req.projection;
    if(sa!=null&&sb!=null){pa=projectEmployeeScenario(req.scenario_a,sa);if(pa.error)return pa;pb=projectEmployeeScenario(req.scenario_b,sb);if(pb.error)return pb;pd=Object.fromEntries(Object.keys(pa.totals).map(k=>[k,pb.totals[k]-pa.totals[k]]));}
    return {scenario_a:a,scenario_b:b,delta:comparisonDelta(a,b),projection_a:pa,projection_b:pb,projection_delta:pd};
  }
  const rates=(D.KOMMUNER as any)[req.kommune];
  if(!Object.hasOwn(D.KOMMUNER,req.kommune))return {error:`Unknown kommune: ${req.kommune}`};
  const meta={kommune:req.kommune,kommune_pct:rates.kommuneskat,kirke_pct:rates.kirkeskat};
  if(kind==='fulltime')return {...meta,...employee(req,rates,req.gross_annual,false)};
  if(kind==='parttime')return {...meta,hourly_rate:req.hourly_rate,hours_month:req.hours_month,...employee(req,rates,req.hourly_rate*req.hours_month*12,true)};
  if(kind==='student')return {...meta,...student(req,rates,req.work_gross_monthly)};
  if(kind==='curve') {
    let values:number[]=[];
    if(req.step_monthly>0){for(let g=Math.max(req.min_gross,0);g<=req.max_gross;g+=req.step_monthly*12){values.push(g);if(values.length>10000)throw new RangeError('Curve sample limit exceeded');}}
    else {if(req.points<=0||req.points>10000)throw new RangeError('Invalid curve sample count');for(let i=0;i<=req.points;i++)values.push(req.max_gross/req.points*i);}
    values.push(req.max_gross);
    const evaluate=(g:number)=>employee(req,rates,g,req.is_hourly);
    return sampleBoundaries(values,evaluate,'income_after_am',boundaries).map(([g,r,b]:any)=>({
      tax_boundary:b,tax_band_after:b?taxBand(evaluate(Math.min(req.max_gross,g+0.001))):null,
      gross_annual:pyRound(g,6),gross_monthly:pyRound(g/12,6),net_monthly:pyRound(r.net_monthly,2),
      ferie_net_monthly:pyRound(r.net_ferie_monthly),effective_rate:pyRound(r.effective_tax_rate,2),tax_band:taxBand(r),
    }));
  }
  if(req.max_hours>10000||req.max_hours<0)throw new RangeError('Invalid curve hour range');
  if(kind==='hours-curve') {
    const evaluate=(h:number)=>employee(req,rates,req.hourly_rate*h*12,true,req.atp_auto?monthlyAtp(h):req.atp_monthly);
    return sampleBoundaries(hoursSamples(req.max_hours,5,req.atp_auto),evaluate,'income_after_am',boundaries).map(([h,r,b]:any)=>({
      tax_boundary:b,tax_band_after:b?taxBand(evaluate(Math.min(req.max_hours,h+0.00001))):null,
      hours_month:h,gross_monthly:pyRound(req.hourly_rate*h,6),net_monthly:pyRound(r.net_monthly,2),
      ferie_net_monthly:pyRound(r.net_ferie_monthly),effective_rate:pyRound(r.effective_tax_rate,2),tax_band:taxBand(r),
    }));
  }
  if(kind==='student-hours-curve') {
    const evaluate=(h:number)=>student(req,rates,req.hourly_rate*h,req.atp_auto?monthlyAtp(h):req.atp_monthly);
    const limit=evaluate(0).aars_fribeloeb;
    return sampleBoundaries(hoursSamples(req.max_hours,req.step,req.atp_auto),evaluate,'work_after_am',[[limit,'fribeloeb']]).map(([h,r,b]:any)=>({
      effective_rate:pyRound(r.effective_tax_rate,2),fribeloeb_boundary:b!==null,
      over_fribeloeb_after:b?evaluate(Math.min(req.max_hours,h+0.00001)).over_fribeloeb:null,
      hours_month:h,net_monthly:pyRound(r.net_monthly,2),net_annual:pyRound(r.net_annual),
      su_gross_monthly:pyRound(r.su_annual_gross/12),work_gross_monthly:pyRound(req.hourly_rate*h,6),
      feriepenge_monthly:pyRound(r.work_feriepenge/12),deductions_monthly:pyRound(r.total_deductions/12),over_fribeloeb:r.over_fribeloeb,
    }));
  }
  throw new Error('Unknown compute route');
}
