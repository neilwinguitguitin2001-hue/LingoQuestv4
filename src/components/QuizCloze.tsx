import React from 'react';
import { clozeSegments } from '../utils/quizResponses';

export function QuizCloze({ text, response }: { text: string; response: string }) {
  return <>{clozeSegments(text, response).map((part, index) => {
    if (!part.gap) return <span key={index}>{part.text}</span>;

    return (
      <span key={index} className="mx-1 inline-block max-w-full rounded-lg border-2 border-dashed border-amber-500 bg-white px-2 py-0.5 text-sm font-bold text-amber-950">
        {part.text && <span className="mr-1.5 tabular-nums">{part.text.trim()}</span>}
        {part.value || 'Missing piece'}
      </span>
    );
  })}</>;
}
