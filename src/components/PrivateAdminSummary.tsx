import React,{useEffect,useState} from 'react';
import {privateRequest} from '../services/privacyService';
import {InabelHeaderStrip} from './InabelHeaderStrip';
interface Summary {grade:number;participants:number;average_completed_activities:number|null;detail_suppressed:boolean}
export function PrivateAdminSummary(){
 const[rows,setRows]=useState<Summary[]>([]),[error,setError]=useState('');
 useEffect(()=>{let active=true;privateRequest<Summary[]>({action:'summary'}).then(r=>{if(active)setRows(r);}).catch(()=>{if(active)setError('Aggregate information is not available for this account.');});return()=>{active=false;};},[]);
 return <section className="max-w-6xl mx-auto px-4 py-4"><div className="linocut-card rounded-2xl border-2 border-[#231F20] bg-white overflow-hidden"><InabelHeaderStrip variant="royal" label="Administrator • Aggregate Overview"/><div className="p-5 space-y-3"><h2 className="font-display text-xl">Learning activity overview</h2><p className="text-sm text-slate-600">Individual records are unavailable unless a trusted coordinator grants a specific purpose and expiry. These summaries do not list student names, aliases, test results or rankings. Small-group activity averages are withheld.</p>{error&&<p role="alert">{error}</p>}<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{rows.map(r=><div key={r.grade} className="border border-sky-200 bg-sky-50 rounded-xl p-4"><h3 className="font-bold">Grade {r.grade}</h3><p className="text-sm">{r.participants} participating learners</p><p className="text-xs mt-2">{r.detail_suppressed?'Activity average withheld for a small group.':`${r.average_completed_activities} average completed activities`}</p></div>)}</div></div></div></section>;
}
