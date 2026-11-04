import { useEffect, useState } from 'react';
import type { QuizQuestion } from '../../types/lingoquest';
import type { PdfLesson } from './pdfCurriculum';

export interface DigitalBlock {
  type: 'paragraph' | 'heading' | 'table' | 'figure' | 'diagram';
  page: number;
  text?: string;
  rows?: string[][];
  images?: {src:string;x:number;y:number;width:number;height:number;alt?:string}[];
  transcript?: string;
  src?: string;
  width?: number;
  height?: number;
  shapes?: { d: string; stroke: string; fill: string; width: number }[];
  labels?: { text: string; x: number; y: number; size: number }[];
}
export interface DigitalContent {
  fileId: string;
  sourceSha256: string;
  blocks: Record<string, DigitalBlock>;
  excerptBlocks: Record<string, string[]>;
  games: QuizQuestion[];
  assets?: Record<string, string>;
}
const cache = new Map<string, Promise<DigitalContent>>();
export function loadDigitalContent(lesson: PdfLesson): Promise<DigitalContent> {
  const url = lesson.digitalContentUrl;
  if (!url || !url.startsWith('/assets/curriculum/content/')) return Promise.reject(new Error('Source content needs review.'));
  let promise = cache.get(url);
  if (!promise) {
    promise = fetch(url).then(async (response) => {
      if (!response.ok) throw new Error('The source lesson could not be loaded. Please retry.');
      const value = await response.json() as DigitalContent;
      if (value.fileId !== lesson.source.fileId || value.sourceSha256 !== lesson.source.sha256) {
        throw new Error('Source mapping mismatch. This lesson needs review.');
      }
      const assets = value.assets || {};
      function resolve(node: unknown): unknown {
        if (typeof node === 'string') return assets[node] || node;
        if (Array.isArray(node)) return node.map(resolve);
        if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).filter(([key]) => key !== 'assets').map(([key, child]) => [key, resolve(child)]));
        return node;
      }
      return resolve(value) as DigitalContent;
    }).catch((error) => { cache.delete(url); throw error; });
    if (cache.size >= 12) cache.delete(cache.keys().next().value!);
    cache.set(url, promise);
  }
  return promise;
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
  return { ...(state.key === lesson?.id ? state : {}), retry: () => setRevision((n) => n + 1) };
}
