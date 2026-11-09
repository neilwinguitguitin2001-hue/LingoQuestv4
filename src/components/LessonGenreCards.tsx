import React from 'react';
import { Clapperboard, Film, GraduationCap, Mic2, Newspaper, Sparkles } from 'lucide-react';

// Short explanations of the genres in the three source diagrams.
const genreCards = {
  f83b4d1718e6bee2ff87: [
    { title: 'Animation', text: 'Drawings, puppets, or digital figures appear to move. Different stories and styles suit different audiences.', icon: Sparkles, tone: 'reef' },
    { title: 'Trailer', text: 'Selected moments preview a film and invite the audience to watch it.', icon: Clapperboard, tone: 'sky' },
    { title: 'Educational program', text: 'Explanations or demonstrations help viewers learn a skill or understand a topic.', icon: GraduationCap, tone: 'sand' },
  ],
  e4d3f9f4d1380934192c: [
    { title: 'Variety show', text: 'Several kinds of performance, such as songs, dances, and skits, appear in one show.', icon: Mic2, tone: 'sand' },
    { title: 'News or news flash', text: 'A report updates viewers on current events. A news flash gives a short update.', icon: Newspaper, tone: 'reef' },
  ],
  '5a6d3d735f499f99f197': [
    { title: 'Movie or video clip', text: 'A clip is a selected scene or short excerpt from a longer work.', icon: Film, tone: 'sky' },
  ],
};

export function getGenreCards(moduleId: string, visualId: string) {
  return moduleId === 'g7-q1-m2' && Object.hasOwn(genreCards, visualId)
    ? genreCards[visualId as keyof typeof genreCards]
    : undefined;
}

export function LessonGenreCards({ cards }: { cards: NonNullable<ReturnType<typeof getGenreCards>> }) {
  return (
    <ul className="grid gap-2.5">
      {cards.map(({ title, text, icon: Icon, tone }) => (
        <li key={title} className="lq-genre-card" data-tone={tone}>
          <span className="lq-genre-icon"><Icon size={23} strokeWidth={1.7} aria-hidden="true" /></span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-950">{title}</h3>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
