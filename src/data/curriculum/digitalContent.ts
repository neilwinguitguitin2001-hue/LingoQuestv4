import { useEffect, useState } from 'react';
import payloads from './bundledLessons';
import {QUIZ_CATALOGUE} from './quizCatalogue';
import type { QuizQuestion } from '../../types/lingoquest';
import type { PdfLesson } from './pdfCurriculum';

export interface DigitalBlock {
  type: 'paragraph' | 'heading' | 'table' | 'figure' | 'diagram';
  page: number;
  text?: string;
  rows?: string[][];
  images?: {src:string;x:number;y:number;width:number;height:number;alt?:string}[];
  transcript?: string;
  monochrome?: boolean;
  bbox?: number[];
  src?: string;
  width?: number;
  height?: number;
  shapes?: { d: string; stroke: string; fill: string; width: number }[];
  labels?: { text: string; x: number; y: number; size: number }[];
}
export interface SourceSection { id:string;title:string;kind:'discussion'|'objectives'|'activity'|'assessment'|'review'|'answers';entries:{page:number;blockIds:string[]}[]; }
export interface DigitalContent {
  sourceSections?: SourceSection[];
  fileId: string;
  sourceSha256: string;
  blocks: Record<string, DigitalBlock>;
  excerptBlocks: Record<string, string[]>;
  games: QuizQuestion[];
  assets?: Record<string, string>;
}
const cache = new Map<string, DigitalContent>();
export function loadDigitalContent(lesson: PdfLesson): Promise<DigitalContent> {
 try {
  // Lesson text and diagrams ship in the verified app build. A protected/missing JSON
  // request must not disable an otherwise available lesson or its bundled quizzes.
  const value=(payloads as unknown as Record<string,Omit<DigitalContent,'games'>>)[lesson.id];
  const catalogue=QUIZ_CATALOGUE[lesson.id];
  if(!value||!catalogue||value.fileId!==lesson.source.fileId||value.sourceSha256!==lesson.source.sha256||catalogue.fileId!==lesson.source.fileId||catalogue.sha256!==lesson.source.sha256)throw new Error('This lesson package could not be verified. Please reload the app.');
  const key=`${lesson.id}:${lesson.source.sha256}`;
  const cached=cache.get(key);if(cached)return Promise.resolve(cached);
  const assets=value.assets||{};
  function resolve(node:unknown):unknown {
   if(typeof node==='string')return assets[node]||node;
   if(Array.isArray(node))return node.map(resolve);
   if(node&&typeof node==='object')return Object.fromEntries(Object.entries(node).filter(([key])=>key!=='assets').map(([key,child])=>[key,resolve(child)]));
   return node;
  }
  const data={...resolve(value) as Omit<DigitalContent,'games'>,games:catalogue.questions};
  if(cache.size>=12)cache.delete(cache.keys().next().value!);
  cache.set(key,data);return Promise.resolve(data);
 } catch(error){return Promise.reject(error);}
}
export function useDigitalContent(lesson?: PdfLesson) {
  const [state, setState] = useState<{ key?: string; data?: DigitalContent; error?: string }>({});
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    if (lesson) loadDigitalContent(lesson).then(
      (data) => { if (!cancelled) setState({ key: lesson.id, data }); },
      (error) => { if (!cancelled) setState({ key: lesson.id, error: String(error.message || error) }); },
    );
    return () => { cancelled = true; };
  }, [lesson?.id, lesson?.source.sha256, lesson?.digitalContentUrl, revision]);
  return { ...(state.key === lesson?.id ? state : {}), retry: () => { setState({key:lesson?.id}); setRevision((n) => n + 1); } };
}
