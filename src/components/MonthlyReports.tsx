import {useState} from 'react';
import {Download,FileText,CalendarDays} from 'lucide-react';
import {privateRequest} from '../services/privacyService';
import {reportCsv,reportHtml,reportCell,type MonthlyReport} from '../utils/monthlyReports';
export function MonthlyReports(){
 const [period,setPeriod]=useState(()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit'}).format(new Date()).replace(/^(\d{2})\/(\d{4})$/,'$2-$1'));
 const [grade,setGrade]=useState(''),[section,setSection]=useState(''),[kind,setKind]=useState('games'),[report,setReport]=useState<MonthlyReport|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 function reset(){setReport(null);setError('');}
 async function load(event:React.FormEvent){event.preventDefault();if(busy)return;setBusy(true);setError('');setReport(null);try{const data=await privateRequest<MonthlyReport>({action:'monthlyReport',period,kind,grade:grade?Number(grade):null,section:section.trim()||null});setReport(data);}catch{setError('The report could not be generated. Check your staff access and try again.');}finally{setBusy(false);}}
 function csv(){if(!report||report.limited)return;const url=URL.createObjectURL(new Blob([reportCsv(report)],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`lingoquest-${report.kind}-${report.period}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function pdf(){if(!report||report.limited)return;const page=window.open('','_blank');if(!page){setError('Allow the report window to open, then try Print / Save PDF again.');return;}page.opener=null;page.document.write(reportHtml(report));page.document.close();page.document.getElementById('print-report')?.addEventListener('click',()=>page.print());page.focus();page.print();}
 const control='min-h-11 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900';
 return <section className="my-5 space-y-4 rounded-2xl border-2 border-sky-800 bg-white p-4 sm:p-5 text-slate-900" aria-labelledby="monthly-reports-title">
  <h2 id="monthly-reports-title" className="flex items-center gap-2 font-display text-xl font-bold"><CalendarDays className="text-sky-700" size={21}/> Monthly reports</h2>
  <p className="text-sm leading-relaxed text-slate-600">Generate dated activity records for a calendar month in Philippine time. Teachers see assigned students; administrators receive authorized aggregate summaries. This is separate from the lifetime analytics below.</p>
  <form onSubmit={load} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
   <label className="space-y-1 text-sm font-semibold">Month<input disabled={busy} aria-label="Report month" type="month" required min="2000-01" max="2100-12" value={period} onChange={e=>{setPeriod(e.target.value);reset();}} className={control}/></label>
   <label className="space-y-1 text-sm font-semibold">Records<select disabled={busy} value={kind} onChange={e=>{setKind(e.target.value);reset();}} className={control}><option value="games">Completed games</option><option value="activities">Activity completions</option></select></label>
   <label className="space-y-1 text-sm font-semibold">Grade<select disabled={busy} value={grade} onChange={e=>{setGrade(e.target.value);reset();}} className={control}><option value="">All authorized grades</option>{[7,8,9,10].map(g=><option key={g} value={g}>Grade {g}</option>)}</select></label>
   <label className="space-y-1 text-sm font-semibold">Section (optional)<input disabled={busy} maxLength={100} value={section} onChange={e=>{setSection(e.target.value);reset();}} placeholder="Exact section name" className={control}/></label>
   <button type="submit" disabled={busy} className="min-h-11 self-end rounded-lg bg-sky-700 px-4 py-3 text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-50">{busy?'Generating…':'Generate report'}</button>
  </form>
  {error&&<p role="alert" className="text-sm text-red-800">{error}</p>}
  {report&&<div className="space-y-3" aria-live="polite">
   <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold">{report.period} · {report.total} {report.scope==='aggregate'?'grade summaries':'records'}</p><div className="flex flex-wrap gap-2"><button type="button" disabled={report.limited} onClick={pdf} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-700 px-4 text-sm font-bold text-white disabled:opacity-50"><FileText size={16}/> Print / Save PDF</button><button type="button" disabled={report.limited} onClick={csv} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-700 px-4 text-sm font-bold text-emerald-900 disabled:opacity-50"><Download size={16}/> Export CSV</button></div></div>
   {report.limited&&<p role="alert" className="text-sm text-amber-900">More than 1,000 records match. Narrow the grade or section filter before exporting. A partial report cannot be exported.</p>}
   <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-600">{report.notes.map(note=><li key={note}>{note}</li>)}</ul>
   {report.rows.length?<div className="overflow-x-auto rounded-lg border border-slate-200" tabIndex={0} role="region" aria-label="Monthly report preview"><table className="w-full border-collapse text-left text-sm"><thead className="bg-sky-50"><tr>{report.columns.map(c=><th key={c.key} scope="col" className="whitespace-nowrap p-3">{c.label}</th>)}</tr></thead><tbody>{report.rows.slice(0,20).map((r,i)=><tr key={i} className="border-t border-slate-200">{report.columns.map(c=><td key={c.key} className="p-3 align-top">{reportCell(c.key,r[c.key])}</td>)}</tr>)}</tbody></table></div>:<p className="rounded-lg bg-sky-50 p-4 text-sm">No matching records in this period and authorized scope.</p>}
   {report.rows.length>20&&<p className="text-xs text-slate-600">Showing the first 20 rows. PDF and CSV include all {report.rows.length} matching rows.</p>}
  </div>}
 </section>;
}
