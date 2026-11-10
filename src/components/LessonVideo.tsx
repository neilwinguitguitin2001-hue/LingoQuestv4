import React, { useState } from 'react';
import { ExternalLink, Play, Tv } from 'lucide-react';
import { InabelStrip } from './InabelStrip';

const heForShe = {
  id: 'gkjW9PZBRfk',
  title: 'Emma Watson at the HeForShe launch',
  provider: 'United Nations',
  transcript: 'https://www.un.int/iapr/sites/www.un.int/files/IAPR/full-transcript-of-emma-watson.pdf',
  summary: 'Watson opens the campaign by inviting more people to take part in ending gender inequality. Later, she uses experiences from her own life to illustrate how stereotypes affect people.',
};

type LessonVideoData = {
  id: string;
  title: string;
  provider: string;
  prompt: string;
  summary: string;
  transcript?: string;
  writtenGuide?: string;
  start?: number;
  end?: number;
  supplementary?: boolean;
};

const videos: Partial<Record<string, LessonVideoData>> = {
  'g8-q1-m2': {
    id: 'qQ0iUeUxazM',
    title: 'APA 7 reference lists',
    provider: 'Purdue OWL',
    supplementary: true,
    prompt: 'Watch how the author, date, title, and source are assembled into one reference.',
    summary: 'A reference helps readers find the work. Gather the author, date, title, and source, then apply the format for the type of work you used.',
    writtenGuide: 'https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/reference_list_textual_sources.html',
  },
  // G7 Q2 Module 4, PDF p. 38.
  'g7-q2-m4': {
    id: 'oiM0x0ApVL8',
    title: 'How to paraphrase in five steps',
    provider: 'Scribbr',
    prompt: 'Watch the before-and-after example. What changes in the wording and sentence structure, and what meaning stays the same?',
    summary: 'Read the passage for meaning first. Restate it in your own words and sentence structure, compare both versions for accuracy, and credit the original source.',
  },
  // G8 Q3 Module 6, PDF p. 9.
  'g8-q3-m6': {
    id: 'P8ymgFyzbDo',
    title: 'Far Over the Misty Mountains Cold',
    provider: 'Clamavi De Profundis',
    prompt: 'Listen for a conjunction joining two phrases. Notice whether the joined phrases follow the same grammatical pattern.',
    summary: 'The song gives you an opportunity to hear phrases joined in a sequence. Try the same comparison with an original example: “We came to read the story and to discuss its ending.” Both phrases begin with to plus a verb.',
  },
  // G9 Q3 Week 7, PDF p. 5.
  'g9-q3-w7': {
    id: 'iCwKM6uB71I',
    title: 'Priyanka Chopra on gender inequality',
    provider: 'Variety',
    start: 171,
    end: 254,
    prompt: 'Listen to the selected excerpt. Which details come from the speaker’s experience, and what would you need to check a broader claim?',
    summary: 'Chopra describes unequal treatment she saw while growing up. An account of what someone saw is anecdotal evidence. It can illustrate a claim, while a broader claim needs evidence from more than one experience.',
  },
  // G9 Q4 Module 13, PDF pp. 8, 21.
  'g9-q4-m13': {
    id: 'b_qcAuHhJIc',
    title: 'Learn the IPA: American English consonants',
    provider: 'Rachel’s English',
    prompt: 'Watch how the speaker moves her lips and tongue when modeling different consonants.',
    summary: 'The International Phonetic Alphabet uses symbols for speech sounds. Compare /p/ and /b/: both start with the lips together, but /b/ uses voice while /p/ does not.',
  },
  // G10 Q1 Module 3, PDF p. 22.
  'g10-q1-m3': {
    id: 'Kh3peFzN3D8',
    title: 'Kwentong Jollibee: Parangal (Tribute)',
    provider: 'Jollibee Studios',
    prompt: 'Notice how dialogue, framing, and the final message suggest what the makers want viewers to feel or do.',
    summary: 'To infer purpose, identify who made the clip, which details they emphasize, and how the ending addresses the audience. Support the interpretation with a specific moment.',
  },
  // Both PDFs refer to the same 2014 speech. Use the UN upload of the event.
  'g9-q3-w8': {
    ...heForShe,
    prompt: 'Listen for the examples Watson uses to support her point. What do her personal examples show, and what would require broader evidence?',
  },
  'g10-q1-m1': {
    ...heForShe,
    prompt: 'Listen to the opening and note the campaign’s goal, who the speaker invites to take part, and what she asks them to do.',
  },
};

export function getLessonVideo(moduleId: string) {
  return Object.hasOwn(videos, moduleId) ? videos[moduleId] : undefined;
}

export function LessonVideo({ video }: { video: NonNullable<ReturnType<typeof getLessonVideo>> }) {
  const [loaded, setLoaded] = useState(false);
  const params = new URLSearchParams({ cc_load_policy: '1', rel: '0' });
  if (video.start !== undefined) params.set('start', String(video.start));
  if (video.end !== undefined) params.set('end', String(video.end));
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border-2 border-[#231F20] bg-white linocut-card">
      <InabelStrip variant="emerald" label="Watch & Understand" />
      <div className="space-y-3 p-4 sm:p-5">
        <h2 className="font-display text-lg font-bold text-slate-950">{video.title}</h2>
        <p className="text-xs font-semibold text-emerald-800">Optional · {video.supplementary ? 'Supplementary · ' : ''}{video.provider}</p>
        <p className="text-sm leading-relaxed text-slate-700">{video.prompt}</p>
        {loaded ? (
          <iframe
            className="aspect-video min-h-[200px] w-full rounded-xl bg-slate-950"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?${params}`}
            title={video.title}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="lq-lesson-video-poster">
            <Tv className="h-9 w-9 text-sky-200" aria-hidden="true" />
            <button type="button" onClick={() => setLoaded(true)} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-sky-950 transition-colors hover:bg-sky-100">
              <Play size={16} aria-hidden="true" /> Load YouTube player
            </button>
          </div>
        )}
        <details className="rounded-lg border border-slate-200 px-3 py-2.5">
          <summary className="cursor-pointer text-sm font-semibold text-sky-900">Read the summary</summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{video.summary}</p>
          {video.transcript && <a className="mt-2 inline-block text-sm font-semibold text-sky-800 underline" href={video.transcript} target="_blank" rel="noopener noreferrer">Open the transcript</a>}
          {video.writtenGuide && <a className="mt-2 inline-block text-sm font-semibold text-sky-800 underline" href={video.writtenGuide} target="_blank" rel="noopener noreferrer">Open the written guide</a>}
        </details>
        <a className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-800 underline" href={`https://www.youtube.com/watch?v=${video.id}${video.start ? `&t=${video.start}s` : ''}`} target="_blank" rel="noopener noreferrer">
          Open on YouTube <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
