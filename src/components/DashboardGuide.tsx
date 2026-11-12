import { useId, useState } from 'react';
import { BookOpen, Compass, GraduationCap, Map, PenLine, Route, Users, X } from 'lucide-react';
import { InabelWovenStrip } from './FilipinianaMotifs';

const studentSteps = [
  { icon: Compass, title: 'Start from your dashboard', body: 'Use Continue Learning to pick up where you left off. If you are new, start with the first available module for your grade.' },
  { icon: Map, title: 'Explore Island Quests', body: 'Each island represents a school quarter. Open an available module and read Concepts & Rules. Use the illustrated examples and watch a video when one is available.' },
  { icon: GraduationCap, title: 'Complete the lesson and quiz', body: 'Choose Complete & Start Quiz when you are ready. Pick an available game mode and difficulty. Completing the lesson and passing its quiz restores the bridge to the next module.' },
  { icon: Route, title: 'Check My Progress', body: 'See your completed modules and earned badges. Use your own progress to decide what to review next.' },
  { icon: PenLine, title: 'Practise in Writing Lab', body: 'Draft a response and choose local or optional AI grammar checking. Review the suggestions before using them.' },
];

const teacherSteps = [
  { icon: Users, title: 'Share your class code', body: 'Copy the active code from your dashboard and share it with students in your class. Students enter it when they register.' },
  { icon: GraduationCap, title: 'Review student applications', body: 'Open Review Enrolled Students. Check the learner’s submitted details before approving their enrollment or returning it for correction.' },
  { icon: Route, title: 'Follow your class’s progress', body: 'Use the roster and class analytics to review your assigned learners’ progress and find lessons they may need to revisit.' },
  { icon: Map, title: 'Preview lessons for class', body: 'Use the module list or the island map to find the correct grade and quarter, preview a lesson, and plan what to cover with your students.' },
];

type GuideDestination = 'MAP' | 'PROGRESS' | 'WRITING';

export function DashboardGuide({ accountId, role, onNavigate }: {
  accountId: string;
  role: 'student' | 'teacher';
  onNavigate?: (destination: GuideDestination) => void;
}) {
  const key = `lq-dashboard-guide-v1:${role}:${accountId}`;
  const [mode, setMode] = useState<'tour' | 'guide' | 'closed'>(() => {
    try {
      return localStorage.getItem(key) ? 'closed' : 'tour';
    } catch {
      return 'tour';
    }
  });
  const [index, setIndex] = useState(0);
  const headingId = useId();
  const steps = role === 'student' ? studentSteps : teacherSteps;
  const step = steps[index];
  const Icon = step.icon;

  function closeGuide() {
    try { localStorage.setItem(key, 'seen'); } catch {}
    setMode('closed');
  }

  function restartTour() {
    setIndex(0);
    setMode('tour');
  }

  const button = 'min-h-11 rounded-xl px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400';

  return (
    <section aria-labelledby={headingId} className="mx-auto w-full max-w-7xl px-4 pb-5 sm:px-6">
      {mode === 'closed' ? (
        <div className="flex justify-end pt-4">
          <h2 id={headingId} className="sr-only">LingoQuest guide</h2>
          <button type="button" onClick={() => setMode('guide')} className={`${button} inline-flex items-center gap-2 border border-sky-200 bg-white text-sky-900 hover:bg-sky-50`}>
            <BookOpen size={18} aria-hidden="true" /> How LingoQuest works
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-sky-800 bg-[#071930] text-slate-100 shadow-lg">
          <InabelWovenStrip variant="azure" height={8} />
          <div className="space-y-5 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id={headingId} className="font-display text-xl font-bold">
                  {mode === 'tour' ? 'Welcome to LingoQuest' : 'How LingoQuest works'}
                </h2>
                <p className="mt-1 text-sm text-sky-200">{role === 'student' ? 'Student guide' : 'Teacher guide'}</p>
              </div>
              <button type="button" aria-label="Close guide" onClick={closeGuide} className="grid size-11 shrink-0 place-items-center rounded-xl border border-sky-700 hover:bg-sky-900">
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            {mode === 'tour' ? (
              <>
                <div aria-live="polite" aria-atomic="true" className="flex gap-3 rounded-xl bg-sky-950 p-4">
                  <Icon size={23} aria-hidden="true" className="mt-1 shrink-0 text-emerald-300" />
                  <div>
                    <p className="text-xs font-semibold text-sky-200">Step {index + 1} of {steps.length}</p>
                    <h3 className="mt-1 font-bold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-200">{step.body}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button type="button" onClick={closeGuide} className={`${button} text-sky-200 hover:bg-sky-950`}>Skip tour</button>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0} className={`${button} border border-sky-700 disabled:opacity-40`}>Back</button>
                    <button type="button" onClick={() => index === steps.length - 1 ? closeGuide() : setIndex(index + 1)} className={`${button} bg-emerald-300 text-slate-950 hover:bg-emerald-200`}>
                      {index === steps.length - 1 ? 'Finish tour' : 'Next'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2 md:grid-cols-2">
                  {steps.map(({ title, body, icon: StepIcon }) => (
                    <details key={title} className="rounded-xl border border-sky-800 bg-sky-950 px-4 py-2">
                      <summary className="min-h-10 cursor-pointer py-2 text-sm font-semibold">
                        <StepIcon size={17} aria-hidden="true" className="mr-2 inline text-emerald-300" />{title}
                      </summary>
                      <p className="pb-2 text-sm leading-relaxed text-slate-200">{body}</p>
                    </details>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={restartTour} className={`${button} bg-emerald-300 text-slate-950`}>Replay walkthrough</button>
                  {onNavigate && ([['MAP', 'Island Quests'], ['PROGRESS', 'My Progress'], ['WRITING', 'Writing Lab']] as const).map(([destination, label]) => (
                    <button type="button" key={destination} onClick={() => { closeGuide(); onNavigate(destination); }} className={`${button} border border-sky-700 hover:bg-sky-950`}>{label}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
