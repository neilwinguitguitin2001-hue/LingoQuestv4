import React from 'react';
import { BarChart3, BusFront, Clapperboard, Clock3, FileText, Film, MapPin, Upload } from 'lucide-react';
import type { LessonPilot } from '../data/curriculum/lessonPilot';
import { discussionHeadings, type LessonDiscussion } from '../data/curriculum/lessonDiscussions';
import { InabelStrip } from './InabelStrip';

const quizSceneIcons = {
  'g7-q1-m5': BusFront,
  'g8-q2-m1': BarChart3,
  'g9-q1-w5': Upload,
  'g10-q1-m4': Film,
};

export function PilotQuizSceneCue({ moduleId }: { moduleId: string }) {
  const Icon = quizSceneIcons[moduleId as keyof typeof quizSceneIcons];
  return Icon ? <Icon aria-hidden="true" className="mb-2 h-7 w-7 text-sky-700" /> : null;
}

function TeachingVisual({ moduleId }: { moduleId: string }) {
  if (moduleId === 'g8-q2-m1') {
    const loans = [['Monday', 12], ['Tuesday', 18], ['Wednesday', 15]] as const;
    return (
      <figure className="rounded-xl border border-sky-200 bg-sky-50 p-4">
        <figcaption className="mb-3 font-semibold text-sky-950">Library book loans</figcaption>
        <ul className="space-y-2">
          {loans.map(([day, count]) => (
            <li key={day} className="grid grid-cols-[6rem_minmax(0,1fr)_1.5rem] items-center gap-2 text-sm">
              <span>{day}</span>
              <div aria-hidden="true" className="h-4 rounded-sm border-l-2 border-slate-600 bg-white">
                <div style={{ width: `${count / 20 * 100}%` }} className="h-full rounded-sm bg-sky-700" />
              </div>
              <span className="text-right font-bold tabular-nums">{count}</span>
            </li>
          ))}
        </ul>
      </figure>
    );
  }

  const isTimeline = moduleId === 'g7-q1-m5';
  const isConditional = moduleId === 'g9-q1-w5';
  const panels = isTimeline
    ? [
        { label: '7:10 · Earlier', text: 'The bus had left.', Icon: BusFront },
        { label: '7:15 · Later', text: 'Mia arrived.', Icon: MapPin },
      ]
    : isConditional
      ? [
          { label: 'Actual past', text: 'Deadline at noon. Submitted at 12:08. The file arrived late.', Icon: Clock3 },
          { label: 'Imagined past', text: 'If Mia had submitted at 11:55, the file would have arrived on time.', Icon: Upload },
        ]
      : [
          { label: 'Written scene', text: 'Noor thinks everyone has left. A chair scrapes behind the curtain.', Icon: FileText },
          { label: 'Storyboard', text: 'Wide shot of the dark room. A chair scrapes off-screen. Noor stops and turns.', Icon: Film },
        ];

  return (
    <figure className="rounded-xl border border-sky-200 bg-sky-50 p-4">
      <figcaption className="mb-3 font-semibold text-sky-950">
        {isTimeline ? 'Past events in order' : isConditional ? 'Two versions of the past' : 'The same moment in two media'}
      </figcaption>
      <ol className="grid gap-3 sm:grid-cols-2">
        {panels.map(({ label, text, Icon }) => (
          <li key={label} className="rounded-lg border border-sky-100 border-l-4 border-l-emerald-600 bg-white p-3">
            <p className="flex items-center gap-2 font-semibold text-sky-900"><Icon size={21} aria-hidden="true" /> {label}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{text}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function LessonDiscussionGuide({ moduleId, discussion, pilot }: {
  moduleId: string;
  discussion: LessonDiscussion;
  pilot?: LessonPilot;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold text-sky-950">{discussion.topic}</h3>
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
        {discussionHeadings.map((heading, index) => (
          <section key={heading} className={index === 4 ? 'space-y-2 rounded-b-xl bg-emerald-50 p-4' : 'space-y-2 p-4'}>
            <h4 className="font-semibold text-sky-950">{heading}</h4>
            {index === 2 && <p className="text-xs font-semibold text-emerald-800">{discussion.exampleLabel}</p>}
            <p className="text-sm leading-relaxed text-slate-700">{discussion.steps[index]}</p>
            {index === 2 && pilot && <TeachingVisual moduleId={moduleId} />}
          </section>
        ))}
      </div>
      {pilot && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h4 className="font-semibold text-emerald-950">{moduleId === 'g10-q1-m4' ? 'Original written passage' : 'Another worked example'}</h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{pilot.extra}</p>
        </div>
      )}
    </div>
  );
}

export function LessonWatchStoryboard({ lesson }: { lesson: LessonPilot }) {
  return (
    <section className="overflow-hidden rounded-xl border-2 border-[#231F20] bg-white linocut-card">
      <InabelStrip variant="emerald" label="Watch & Understand" />
      <div className="space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-display font-bold text-slate-900">
          <Clapperboard size={17} aria-hidden="true" /> {lesson.title}
        </h2>
        <p className="text-xs font-semibold text-emerald-800">Optional · Original storyboard</p>
        <p className="text-sm leading-relaxed text-slate-700">{lesson.prompt}</p>
        <details className="rounded-lg border border-sky-200 bg-sky-50">
          <summary className="cursor-pointer rounded-lg p-3 text-sm font-semibold text-sky-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
            Read the storyboard and captions
          </summary>
          <ol className="space-y-3 px-3 pb-3">
            {lesson.scenes.map(([time, frame, label, caption]) => (
              <li key={time} className="rounded-lg bg-white p-3 text-sm leading-relaxed text-slate-700">
                <p className="font-bold text-sky-900">{time} · {label}</p>
                <p className="mt-1">{frame}</p>
                <p className="mt-2"><strong>Caption</strong> · {caption}</p>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </section>
  );
}
