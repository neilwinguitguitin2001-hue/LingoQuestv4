import {ArrowLeft,Home} from 'lucide-react';
const labels:Record<string,string>={MAP:'Island Quests',WRITING:'Writing Lab',PROGRESS:'My Progress',PROFILE:'Badges',LEADERBOARD:'Grade Activity Board',MARKET:'Quest Market',ACCOUNT:'Account Settings',LESSON_QUIZ:'Lesson',TEACHER:'Teacher dashboard',ADMIN:'Admin console',STUDENT_DASHBOARD:'Home'};
export function PageBackNavigation({backView,onBack,onHome}:{backView:string|null;onBack:()=>void;onHome:()=>void}){
 const style='inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600';
 return <nav aria-label="Page navigation" className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 pt-4 sm:px-6">
  {backView&&<button type="button" onClick={onBack} className={style}><ArrowLeft size={17} aria-hidden="true"/>Back to {labels[backView]||'previous page'}</button>}
  <button type="button" onClick={onHome} className={style}><Home size={17} aria-hidden="true"/>Dashboard home</button>
 </nav>;
}
