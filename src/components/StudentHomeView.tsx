import React from 'react';
import {HomeArchipelagoScene} from './HomeArchipelagoScene';
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
        <div className="mx-auto w-full max-w-sm md:max-w-none"><HomeArchipelagoScene quarter={next?.quarter ?? completedStep?.quarter ?? 1}/></div>
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
