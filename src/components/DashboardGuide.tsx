import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, BookOpen, X } from 'lucide-react';
import { InabelWovenStrip } from './FilipinianaMotifs';

export type GuideView = 'TEACHER' | 'STUDENT_DASHBOARD' | 'MAP' | 'PROGRESS' | 'WRITING' | 'MARKET';
type Step = { title: string; body: string; target: string; view?: GuideView };

const studentSteps: Step[] = [
  { title: 'Continue Learning', body: 'The outlined button opens your next available lesson. Use Next to see the island map.', target: 'home', view: 'STUDENT_DASHBOARD' },
  { title: 'Explore Island Quests', body: 'Each island represents a school quarter. Use the map to find the modules for your grade.', target: 'islands', view: 'MAP' },
  { title: 'Open a lesson', body: 'Click the outlined Lesson button to open a module. Read Concepts & Rules and look through the illustrated examples.', target: 'lesson', view: 'MAP' },
  { title: 'From lesson to quiz', body: 'When you finish studying, Complete & Start Quiz marks the lesson complete and opens the quiz choices. During this tour, use Next if you just want to look around.', target: 'quiz', view: 'MAP' },
  { title: 'Check My Progress', body: 'Use these tabs to see your progress or badges. The Grade Activity Board is optional and your entry starts hidden.', target: 'progress', view: 'PROGRESS' },
  { title: 'Practise in Writing Lab', body: 'Write a draft here. Choose local or optional AI grammar checking and review the suggestions before using them.', target: 'writing', view: 'WRITING' },
  { title: 'Visit Quest Market', body: 'See your Quest Coins and browse the available items. Open an item only when you’re ready to review its cost.', target: 'market', view: 'MARKET' },
];

const teacherSteps: Step[] = [
  { title: 'Find your class code', body: 'Use the outlined Copy button to copy the code you share with your class. Students enter it when they register.', target: 'class-code' },
  { title: 'Open the active roster', body: 'Click Active Roster to see your assigned learners and filter the list by grade.', target: 'roster' },
  { title: 'Review student applications', body: 'Click Review Enrolled Students to see applications. You can look through the queue and review the submitted details before making a decision.', target: 'review' },
  { title: 'Follow class progress', body: 'Click Class Performance Analytics to review your learners’ progress and see where they may need help.', target: 'analytics' },
  { title: 'Browse modules', body: 'Open Modules & Quiz Answer Keys to find material by grade and quarter for your next lesson.', target: 'modules' },
  { title: 'Preview the island map', body: 'Click Class Archipelago Map to see how modules are arranged. Open the map preview to explore the islands your learners will see.', target: 'class-map' },
];

const button = 'min-h-11 rounded-xl px-3 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400';

export function DashboardGuide({ accountId, role, currentView, onNavigate }: {
  accountId: string;
  role: 'student' | 'teacher';
  currentView: string;
  onNavigate: (destination: GuideView) => void;
}) {
  const dashboard = role === 'student' ? 'STUDENT_DASHBOARD' : 'TEACHER';
  const key = `lq-dashboard-guide-v2:${role}:${accountId}`;
  const [mode, setMode] = useState<'tour' | 'guide' | 'closed'>(() => {
    try { return localStorage.getItem(key) ? 'closed' : 'tour'; }
    catch { return 'tour'; }
  });
  const [index, setIndex] = useState(0);
  const headingId = useId();
  const steps = role === 'student' ? studentSteps : teacherSteps;
  const step = steps[index];
  const visible = mode === 'tour' && (role === 'student' || currentView === dashboard || (step.target === 'class-map' && currentView === 'MAP'));

  useEffect(() => {
    if (!visible) return;
    let highlighted: HTMLElement | undefined;
    const main = document.querySelector('main');
    if (!main) return;

    const highlight = () => {
      let target = step.target;
      if (target === 'quiz' && currentView === 'MAP') target = 'lesson';
      if (target === 'lesson' && currentView === 'LESSON_QUIZ') target = 'concepts';
      if (target === 'class-map' && currentView === 'MAP') target = 'islands';
      const match = Array.from(main.querySelectorAll<HTMLElement>(`[data-guide-target~="${target}"]`))
        .find(element => element.getClientRects().length > 0);
      if (match === highlighted) return;
      highlighted?.removeAttribute('data-guide-highlight');
      highlighted = match;
      if (!match) return;
      match.setAttribute('data-guide-highlight', '');
      if (match.getBoundingClientRect().top < 150 || match.getBoundingClientRect().top > window.innerHeight * 0.55) {
        match.scrollIntoView({ block: 'center' });
      }
    };

    highlight();
    const observer = new MutationObserver(highlight);
    observer.observe(main, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      highlighted?.removeAttribute('data-guide-highlight');
    };
  }, [visible, step.target, currentView]);

  function closeGuide() {
    try { localStorage.setItem(key, 'seen'); } catch {}
    setMode('closed');
  }

  function showStep(nextIndex: number) {
    const next = steps[nextIndex];
    setIndex(nextIndex);
    setMode('tour');
    if (role === 'teacher' && currentView !== dashboard) onNavigate('TEACHER');
    if (next.view && !(next.target === 'quiz' && currentView === 'LESSON_QUIZ')) {
      onNavigate(next.view);
    }
  }

  return (
    <>
      {currentView === dashboard && mode !== 'tour' && (
        <section aria-label="LingoQuest guide" className="mx-auto w-full max-w-7xl px-4 pb-2 pt-4 sm:px-6">
          {mode === 'closed' ? (
            <button type="button" onClick={() => setMode('guide')} className={`${button} inline-flex w-full items-center gap-3 border border-teal-600 bg-gradient-to-r from-sky-950 to-teal-800 text-left text-white hover:to-teal-700 sm:w-auto`}>
              <BookOpen size={20} aria-hidden="true" />
              How LingoQuest works
              <ArrowRight size={17} aria-hidden="true" className="ml-auto shrink-0 text-emerald-200" />
            </button>
          ) : (
            <div className="space-y-3 rounded-2xl border border-sky-800 bg-[#071930] p-4 text-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold">How LingoQuest works</h2>
                <button type="button" onClick={closeGuide} className={button}>Close guide</button>
              </div>
              <p className="text-sm text-sky-100">Start from the beginning or choose a feature to explore on the dashboard.</p>
              <div className="flex flex-wrap gap-2">
                {steps.map(({ title }, i) => (
                  <button type="button" key={title} onClick={() => showStep(i)} className={`${button} border border-sky-700 hover:bg-sky-900`}>{title}</button>
                ))}
              </div>
              <button type="button" onClick={() => showStep(0)} className={`${button} bg-emerald-300 text-slate-950`}>Start interactive tour</button>
            </div>
          )}
        </section>
      )}
      {visible && createPortal(
        <aside aria-labelledby={headingId} className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-h-[42dvh] max-w-lg overflow-y-auto rounded-2xl border border-sky-700 bg-[#071930] text-white shadow-2xl">
          <InabelWovenStrip variant="azure" height={6} />
          <div className="space-y-2 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div aria-live="polite" aria-atomic="true">
                <p className="text-xs font-semibold text-emerald-300">{role === 'student' ? 'Student tour' : 'Teacher tour'} · {index + 1} of {steps.length}</p>
                <h2 id={headingId} className="mt-1 font-display text-lg font-bold">{step.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-sky-100">
                  {step.target === 'quiz' && currentView === 'MAP'
                    ? 'Open the outlined lesson to see where the quiz starts. You can also use Next to continue the tour.'
                    : step.target === 'lesson' && currentView === 'LESSON_QUIZ'
                      ? 'You’re in the lesson. Start with Concepts & Rules, then explore its examples. Select Next to see where the quiz starts.'
                      : step.body}
                </p>
              </div>
              <button type="button" aria-label="Close tour" onClick={closeGuide} className="grid size-11 shrink-0 place-items-center rounded-xl border border-sky-700 hover:bg-sky-900"><X size={18} aria-hidden="true" /></button>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <button type="button" onClick={closeGuide} className={`${button} text-sky-200`}>Skip tour</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => showStep(index - 1)} disabled={index === 0} className={`${button} border border-sky-700 disabled:opacity-40`}>Back</button>
                <button type="button" onClick={() => index === steps.length - 1 ? closeGuide() : showStep(index + 1)} className={`${button} bg-emerald-300 text-slate-950 hover:bg-emerald-200`}>
                  {index === steps.length - 1 ? 'Finish tour' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </aside>,
        document.body,
      )}
    </>
  );
}
