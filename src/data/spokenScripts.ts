import { PDF_MODULES } from './curriculum/pdfCurriculum';
import type { Module } from '../types/lingoquest.ts';
import {
  buildSegmentSSML,
  normalizeTextForSpeech,
  type ProsodyRole,
} from '../utils/ssmlBuilder.ts';
import type { VoicePersonaId } from './voiceConfig.ts';

export type LessonTabId =
  | 'concepts'
  | 'examples'
  | 'tips'
  | 'cultural'
  | 'vocabulary'
  | 'checklist'
  | 'cheatsheet';

export interface SpokenSegment {
  id: string;
  moduleId: string;
  tabId: LessonTabId;
  sectionTitle: string;
  speaker: 'ate_lingo' | 'kuya_lingo';
  prosodyRole: ProsodyRole;
  /** Clean text shown on screen in captions and lesson cards */
  displayText: string;
  /** Conversational English script written specifically to be HEARD */
  spokenText: string;
  /** Optional light Taglish / Bisaya warmth variant when toggle is ON */
  spokenTextTaglish?: string;
  /** Key terms emphasized in SSML and highlighted in karaoke view */
  keyTerms: string[];
  /** Optional visual step index to sync with explainer / stepper / cheatsheet */
  visualSyncStep?: number;
}

export interface VoiceABCSample {
  personaId: VoicePersonaId;
  title: string;
  subtitle: string;
  badge: string;
  displayText: string;
  spokenText: string;
  ssmlPreview: string;
  keyTerms: string[];
}

// Narration uses the exact approved source excerpts. No localization or fallback scripts.
export function getModuleSpokenSegments(module: Module, tabFilter?: LessonTabId): SpokenSegment[] {
  const pdf = module.pdfLesson;
  if (!pdf) return [];
  const groups: Array<[LessonTabId, typeof pdf.concepts]> = [
    ['concepts', pdf.concepts], ['examples', pdf.guidedAnalysis],
    ['tips', pdf.pitfallsAndTips], ['vocabulary', pdf.vocabularyBank],
    ['checklist', pdf.selfCheck], ['cheatsheet', pdf.studyCheatsheet],
  ];
  return groups.filter(([tab]) => !tabFilter || tab === tabFilter).flatMap(([tab, excerpts]) => excerpts.map((excerpt, i) => ({
    id: `${module.id}-pdf-source-${tab}-${i}`, moduleId: module.id, tabId: tab,
    sectionTitle: `${pdf.sourceLabel} · PDF page ${excerpt.page}`,
    speaker: 'ate_lingo' as const, prosodyRole: 'rule' as const,
    displayText: excerpt.text, spokenText: excerpt.text, keyTerms: [],
  })));
}
export const ANALOGY_SPOKEN_SEGMENTS: SpokenSegment[] = getModuleSpokenSegments(PDF_MODULES[0]);
export const ANALOGY_ABC_VOICE_SAMPLES: VoiceABCSample[] = [];
