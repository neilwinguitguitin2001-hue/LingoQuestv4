import React,{useEffect,useRef,useState} from 'react';
import {Eye,EyeOff,ShieldCheck,RefreshCw} from 'lucide-react';
import type {StudentAccount} from '../types/lingoquest';
import {privateRequest,type GradeBoard} from '../services/privacyService';
import {InabelHeaderStrip} from './InabelHeaderStrip';

export const LeaderboardView:React.FC<{currentStudent:StudentAccount|null}>=({currentStudent})=>{
 const viewer=useRef(currentStudent?.id); viewer.current=currentStudent?.id;
 const[board,setBoard]=useState<GradeBoard|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState(false);
 const load=async()=>{const owner=currentStudent?.id;setBusy(true);setError('');try{const result=await privateRequest<GradeBoard>({action:'board'},owner);if(viewer.current===owner)setBoard(result);}catch(e){setError(e instanceof Error?e.message:'Unable to load activity board.');}finally{setBusy(false);}};
 useEffect(()=>{let active=true;setBoard(null);setError('');setBusy(true);privateRequest<GradeBoard>({action:'board'},currentStudent?.id).then(b=>{if(active)setBoard(b);}).catch(()=>{if(active)setError('This board is available only to approved students enrolled in a participating grade group. Your learning access is unchanged.');}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};},[currentStudent?.id]);
 const visibility=async(visible:boolean)=>{const owner=currentStudent?.id;setBusy(true);setError('');try{const result=await privateRequest<GradeBoard>({action:'visibility',visible},owner);if(viewer.current===owner){setBoard(result);setConfirm(false);}}catch{setError('Your preference could not be saved. Please try again.');}finally{setBusy(false);}};
 return <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
  <section className="rounded-3xl border-2 border-[#231F20] overflow-hidden linocut-card bg-white">
   <InabelHeaderStrip variant="royal" label="Your Grade • Optional Activity Board"/>
   <div className="p-5 sm:p-8 space-y-4">
    <h1 className="font-display text-2xl sm:text-3xl text-slate-900">Grade {board?.grade||currentStudent?.gradeLevel} Activity Board</h1>
    <p className="text-sm leading-relaxed text-slate-600">Learn at your own pace. This board shows system-assigned aliases and activity-completion points only, within your authorized participating grade group. Grades 7, 8, 9 and 10 have separate boards.</p>
    <div className="rounded-xl bg-sky-50 border border-sky-200 p-4 text-sm text-sky-950 flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0"/><p>Your quiz scores, grades, test results and badges are not displayed here. Aliases reduce exposure, but classmates may still guess who an entry belongs to. They do not guarantee anonymity.</p></div>
    <p className="text-sm text-slate-600">Your personal performance records are available to you, your assigned teacher where needed, and staff with a specific, time-limited authorization. Administrators receive aggregate summaries by default.</p>
    {error&&<p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">{error}</p>}
    {busy&&<p role="status" className="text-sm text-slate-600">Updating your board…</p>}
    {board&&<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <p className="font-semibold text-slate-800 flex gap-2 items-center">{board.visible?<Eye className="h-4 w-4"/>:<EyeOff className="h-4 w-4"/>}{board.visible?'Your alias is visible':'Your entry is hidden'}</p>
      <p className="text-sm text-slate-600">{board.visible?`Your system alias is ${board.my_alias}.`:'You are hidden by default. Joining is optional.'} You can hide your entry at any time without losing points, badges or learning access.</p>
      {board.visible?<button disabled={busy} onClick={()=>void visibility(false)} className="rounded-xl px-4 py-2 bg-slate-800 text-white text-sm font-semibold disabled:opacity-50">Hide my entry</button>:<button disabled={busy} onClick={()=>setConfirm(true)} className="rounded-xl px-4 py-2 bg-sky-700 text-white text-sm font-semibold disabled:opacity-50">Choose to appear</button>}
    </div>}
    {confirm&&<div role="dialog" aria-label="Choose leaderboard visibility" className="rounded-xl border-2 border-sky-500 p-4 space-y-3">
      <h2 className="font-bold text-slate-900">Show my alias and activity points?</h2><p className="text-sm text-slate-600">Only your participating grade group can see this entry. Classmates may infer your identity. Participation is optional and does not affect your school grades or access to lessons.</p>
      <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={()=>void visibility(true)} className="rounded-xl px-4 py-2 text-sm font-semibold bg-sky-700 text-white">Yes, show my entry</button><button disabled={busy} onClick={()=>setConfirm(false)} className="rounded-xl px-4 py-2 text-sm font-semibold border border-slate-300">Keep me hidden</button></div>
    </div>}
   </div>
  </section>
  {board&&<section className="rounded-3xl border-2 border-[#231F20] bg-white overflow-hidden linocut-card">
   <InabelHeaderStrip variant="emerald" label="Activity Completions • No Test Scores"/>
   <div className="p-5 sm:p-8 space-y-4"><div className="flex flex-wrap gap-3 items-center justify-between"><h2 className="font-display text-xl text-slate-900">Participating aliases</h2><button disabled={busy} onClick={()=>void load()} className="rounded-lg border px-3 py-2 text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4"/>Refresh</button></div>
   <p className="text-xs text-slate-600">10 activity points per first completed game activity. Answer accuracy, XP, test scores and purchased items do not affect this order. Tied points are ordered by alias. No last-place or failure labels are shown.</p>
   {!board.entries.length?<p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No entries are visible yet. You can continue learning with your entry hidden.</p>:<ul className="space-y-2" aria-label={`Grade ${board.grade} activity entries`}>{board.entries.map(e=><li key={e.alias} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-4"><span className="font-semibold text-slate-800 break-all">{e.alias}</span><span className="text-sm text-sky-800">{e.activity_points} activity points</span></li>)}</ul>}
   </div>
  </section>}
 </div>;
};
