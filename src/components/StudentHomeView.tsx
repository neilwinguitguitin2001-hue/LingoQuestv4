import React, {useId} from 'react';
import {ArrowRight, BookOpen, Check, Compass, Feather, Flag, Sparkles} from 'lucide-react';
import type {Module, StudentAccount} from '../types/lingoquest';
import {BADGE_DEFINITIONS} from '../data/seedData';
import {isModuleFullyCompleted, isStudentModuleUnlocked} from '../utils/progression';
import {InabelHeaderStrip} from './InabelHeaderStrip';
import {BadgeIcon} from './BadgeIcon';

type Props = {
  student: StudentAccount;
  modules: Module[];
  onContinue: (module: Module) => void;
  onIslands: () => void;
  onProgress: () => void;
  onWriting: () => void;
};

/** Decorative quest-world art, not a map or a curriculum explanation. */
function QuestIslandScene() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return <svg viewBox="0 0 480 320" className="block w-full max-w-lg mx-auto" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-sea`} x2="0" y2="1"><stop stopColor="#0EA5E9"/><stop offset="1" stopColor="#075985"/></linearGradient>
      <linearGradient id={`${id}-land`} x2="0" y2="1"><stop stopColor="#6EE7B7"/><stop offset="1" stopColor="#059669"/></linearGradient>
    </defs>
    <circle cx="248" cy="153" r="144" fill="#38BDF8" opacity=".08"/>
    <circle cx="248" cy="153" r="118" fill="none" stroke="#7DD3FC" strokeOpacity=".2" strokeDasharray="4 10"/>
    <circle cx="390" cy="56" r="24" fill="#FDE68A"/>
    <g fill="#E0F2FE" opacity=".85"><path d="M53 70c-4-14 16-24 24-12 10-19 35-11 35 5 17-3 23 12 17 17H53Z"/><path d="M289 33c0-10 15-16 22-7 9-10 24-4 25 7h14c8 0 10 12 1 12h-61c-9 0-10-12-1-12Z"/></g>
    <ellipse cx="247" cy="230" rx="209" ry="68" fill={`url(#${id}-sea)`}/>
    <g fill="none" stroke="#7DD3FC" strokeLinecap="round" opacity=".5"><path d="M60 235q18-8 36 0t36 0M335 255q18-8 36 0t36 0M153 276q22-7 44 0t44 0"/><path d="M77 208q16-5 32 0M376 215h27"/></g>
    <ellipse cx="270" cy="197" rx="98" ry="33" fill="#BAE6FD" opacity=".4"/>
    <ellipse cx="270" cy="184" rx="91" ry="33" fill="#FDE68A"/>
    <path d="M190 176q15-49 77-53 62-3 83 53-72 33-160 0Z" fill={`url(#${id}-land)`}/>
    <path d="M209 170q39 17 114 1" fill="none" stroke="#047857" strokeWidth="3" opacity=".3"/>
    <path d="M275 150q-4-48 12-79" fill="none" stroke="#92400E" strokeWidth="10" strokeLinecap="round"/>
    <path d="M282 94q-28-35-61-9 36-7 58 14M285 90q4-43 35-35-18 13-28 41M288 91q42-26 66 9-36-14-63-1M283 91q-7-35-39-39 18 19 30 45" fill="#10B981" stroke="#047857" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M326 155v-43" stroke="#E0F2FE" strokeWidth="4" strokeLinecap="round"/>
    <path d="M328 112h34l-9 12 9 12h-34Z" fill="#38BDF8"/>
    <g className="lq-home-boat"><ellipse cx="151" cy="247" rx="49" ry="11" fill="#082F49" opacity=".3"/><path d="M104 229h89l-17 21h-51Z" fill="#FBBF24" stroke="#92400E" strokeWidth="3" strokeLinejoin="round"/><path d="M147 228v-76" stroke="#E0F2FE" strokeWidth="4" strokeLinecap="round"/><path d="M143 160 111 217h32Z" fill="#E0F2FE"/><path d="m152 167 30 50h-30Z" fill="#38BDF8"/><path d="M102 254h93M115 244l-9 11M181 244l9 11" fill="none" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round"/></g>
    <g fill="#BAE6FD"><path d="m86 126 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="m388 149 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></g>
  </svg>;
}

export function StudentHomeView({student, modules, onContinue, onIslands, onProgress, onWriting}: Props) {
  const own = modules.filter(m => m.gradeLevel === student.gradeLevel).sort((a, b) => a.moduleNumber - b.moduleNumber);
  const completedModules = own.filter(m => isModuleFullyCompleted(m, student));
  const next = own.find(m => !isModuleFullyCompleted(m, student) && isStudentModuleUnlocked(m, student, modules));
  const following = next ? own.slice(own.indexOf(next) + 1).find(m => !isModuleFullyCompleted(m, student)) : undefined;
  const completedStep = completedModules[completedModules.length - 1];
  const earnedBadge = [...student.badges].reverse().map(id => BADGE_DEFINITIONS.find(b => b.id === id)).find(Boolean);
  const percent = own.length ? Math.round(completedModules.length / own.length * 100) : 0;
  const trail = [
    {label: completedStep ? 'Completed step' : 'Starting point', module: completedStep, empty: 'Your story starts here', detail: completedStep ? 'A step you have completed' : 'Begin a lesson to start your trail', icon: completedStep ? Check : Compass, tone: completedStep ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'},
    {label: 'Your next quest', module: next, empty: 'Explore at your own pace', detail: next ? 'Ready when you are' : 'Revisit a topic or practise your writing', icon: Compass, tone: 'bg-sky-50 text-sky-900 border-sky-300'},
    {label: 'Coming up', module: following, empty: 'Keep exploring your islands', detail: following ? 'A preview of the next destination' : 'Find more practice in Island Quests', icon: Flag, tone: 'bg-slate-50 text-slate-700 border-slate-200'},
  ];

  return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
    <section className="linocut-card rounded-3xl overflow-hidden bg-gradient-to-br from-[#07192F] via-[#0D355C] to-[#075E68] text-white">
      <InabelHeaderStrip variant="royal" label={`Your next adventure • Grade ${student.gradeLevel}`}/>
      <div className="grid items-center gap-2 md:grid-cols-[1.15fr_1fr] p-6 sm:p-8">
        <div className="relative z-10 space-y-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-sky-200"><Compass className="h-4 w-4" aria-hidden="true"/> Welcome back, {student.name.split(' ')[0] || 'explorer'}.</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight max-w-lg">Ready for your<br className="hidden sm:block"/> next quest?</h1>
          <p className="text-sky-100 max-w-md">A little practice, one island at a time. Follow your own path and ask for help whenever you need it.</p>
          {next && <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-sky-300/30 bg-[#07192F]/50 px-3 py-2 text-sm"><BookOpen className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true"/><strong>{next.title}</strong><span className="text-sky-200">Q{next.quarter} · Module {next.quarterModuleIndex}</span></div>}
          <div className="flex flex-wrap gap-3 pt-1"><button onClick={() => next ? onContinue(next) : onIslands()} className="min-h-11 rounded-xl bg-sky-400 hover:bg-sky-300 px-5 py-3 font-bold text-slate-950 transition-colors inline-flex items-center gap-2">{next ? 'Continue Learning' : 'Explore Island Quests'}<ArrowRight className="h-4 w-4" aria-hidden="true"/></button>{next && <button onClick={onIslands} className="min-h-11 rounded-xl border border-sky-300/60 px-5 py-3 font-semibold hover:bg-white/10 transition-colors">Browse lessons</button>}</div>
        </div>
        <div className="pointer-events-none mx-auto w-full max-w-sm md:max-w-none"><QuestIslandScene/></div>
      </div>
    </section>

    <section className="linocut-card rounded-3xl overflow-hidden bg-white">
      <InabelHeaderStrip variant="royal" label="Your personal journey"/>
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-display font-bold text-slate-900">One step leads to another</h2><p className="mt-1 text-sm text-slate-600">{completedModules.length} of {own.length} modules completed. This is your trail, without comparisons.</p></div><button onClick={onProgress} className="min-h-11 rounded-xl border border-sky-300 px-4 py-2 font-semibold text-sky-800 hover:bg-sky-50">View My Progress</button></div>
        <div className="h-2 overflow-hidden rounded-full bg-sky-100" role="progressbar" aria-label="Modules completed" aria-valuemin={0} aria-valuemax={own.length || 1} aria-valuenow={completedModules.length}><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" style={{width: `${percent}%`}}/></div>
        <ol className="grid gap-3 md:grid-cols-3">{trail.map((step, i) => <li key={step.label} className={`relative rounded-2xl border p-4 ${step.tone}`}><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider">{step.label}</span><step.icon className="h-5 w-5" aria-hidden="true"/></div><h3 className="mt-3 font-bold text-base">{step.module?.title || step.empty}</h3><p className="mt-2 text-sm">{step.detail}</p>{step.module && <p className="mt-2 text-xs opacity-80">Quarter {step.module.quarter} · Module {step.module.quarterModuleIndex}</p>}{i < 2 && <ArrowRight className="absolute -right-4 top-1/2 hidden md:block h-5 w-5 text-sky-600 z-10" aria-hidden="true"/>}</li>)}</ol>
        <p className="text-xs text-slate-500">Coming up is a preview, not an unlock. Existing lesson and quiz requirements still apply.</p>
      </div>
    </section>

    <div className="grid gap-6 md:grid-cols-2">
      <section className="linocut-card rounded-3xl overflow-hidden bg-gradient-to-br from-white to-emerald-50">
        <InabelHeaderStrip variant="royal" label="Your achievement spotlight"/>
        <div className="p-6 space-y-4"><div className="flex items-center gap-4"><div className="h-16 w-16 shrink-0 rounded-2xl border border-emerald-200 bg-white flex items-center justify-center text-emerald-700">{earnedBadge ? <BadgeIcon iconType={earnedBadge.iconType} unlocked className="h-9 w-9"/> : <Compass className="h-9 w-9" aria-hidden="true"/>}</div><div><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{earnedBadge ? 'An earned badge' : completedStep ? 'A completed module' : 'Your first quest awaits'}</p><h2 className="mt-1 text-xl font-display font-bold text-slate-900">{earnedBadge?.name || completedStep?.title || 'Start small. Explore more.'}</h2></div></div><p className="text-sm text-slate-600">{earnedBadge?.description || (completedStep ? 'You have completed this module. Find your own learning milestones and earned badges in My Progress.' : 'Your own earned achievements will appear here as you learn. There is no race and no need to compare yourself with classmates.')}</p><button onClick={onProgress} className="min-h-11 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:underline">See your learning milestones<ArrowRight className="h-4 w-4" aria-hidden="true"/></button></div>
      </section>
      <section className="linocut-card rounded-3xl overflow-hidden bg-gradient-to-br from-white to-sky-50">
        <InabelHeaderStrip variant="royal" label="A space for your ideas"/>
        <div className="p-6 space-y-4"><div className="flex items-center gap-4"><div className="relative h-16 w-16 shrink-0 rounded-2xl border border-sky-200 bg-white flex items-center justify-center"><Feather className="h-9 w-9 text-sky-600" aria-hidden="true"/><Sparkles className="absolute right-1 top-1 h-4 w-4 text-emerald-500" aria-hidden="true"/></div><div><p className="text-xs font-bold uppercase tracking-wide text-sky-700">Writing Lab</p><h2 className="mt-1 text-xl font-display font-bold text-slate-900">Give your ideas a voice</h2></div></div><p className="text-sm text-slate-600">Write a paragraph, explore grammar suggestions and keep your own voice. Choose local checking or optional external AI checking.</p><button onClick={onWriting} className="min-h-11 inline-flex items-center gap-2 rounded-xl bg-sky-700 hover:bg-sky-800 px-4 py-2 font-semibold text-white">Open Writing Lab<ArrowRight className="h-4 w-4" aria-hidden="true"/></button></div>
      </section>
    </div>
  </div>;
}
