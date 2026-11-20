import {ArrowLeft} from 'lucide-react';
export function DashboardSectionBack({label,onBack}:{label:string;onBack:()=>void}){
 return <nav aria-label="Dashboard section navigation"><button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"><ArrowLeft size={17} aria-hidden="true"/>{label}</button></nav>;
}
