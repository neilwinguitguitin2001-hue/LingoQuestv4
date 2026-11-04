
// ============================================================================
// Configurable XP Rewards for Visual Learning Interactions
// ============================================================================
export const VISUAL_XP_REWARDS = {
  explainer: 10, // Finishing the 60-second animated lesson explainer
  diagram: 15, // Completing the interactive A:B::C:D / structural bridge diagram
  minigame: 20, // Completing the embedded drag-and-drop / sorting mini-game
  stepper: 10, // Completing the Guided Analysis step-by-step walkthrough
  pitfalls: 10, // Completing the Pitfalls "Spot the Mistake" comparison
  hotspots: 15, // Legacy interaction identifier
  vocabFlip: 10, // Flipping & listening to vocabulary bank cards
  selfCheck: 15, // Completing the rapid visual Self-Check challenge
  cheatsheet: 10, // Building the interactive Study Cheatsheet infographic
} as const;

export type VisualActivityKey = keyof typeof VISUAL_XP_REWARDS;

// ============================================================================
// Data-Driven Schema for Module Visuals (All 7 Tabs)
// ============================================================================
export interface ExplainerSlide {
  id: string;
  durationSec: number;
  headline: string;
  caption: string;
  narrationText: string;
  visualTheme: 'bridge_pair' | 'antonym_flip' | 'synonym_glow' | 'cause_chain' | 'part_whole' | 'island_map';
  pairLeft?: { a: string; b: string; tag: string };
  pairRight?: { c: string; d: string; tag: string };
  highlightSignal?: string;
  filipinoBisayaHint?: string;
}

export interface RuleVisualSpec {
  ruleId: string;
  title: string;
  animationType: 'antonyms' | 'synonyms' | 'cause_effect' | 'part_whole' | 'location' | 'structure';
  pairA: string;
  pairB: string;
  pairC: string;
  pairD: string;
  badgeLabel: string;
  filipinoHint: string;
  bisayaHint: string;
  alt: string;
}

export interface DiagramPairNode {
  id: string;
  leftPair: string; // e.g. "Night : Day"
  rightPrompt: string; // e.g. "Happy : ____"
  correctCompletion: string; // e.g. "Sad"
  distractors: string[];
  relationshipLabel: string; // e.g. "Antonyms (Opposite Meaning)"
  bridgeExplanation: string;
}

export interface MiniGameSortItem {
  id: string;
  wordPair: string;
  category: string;
  hint: string;
}

export interface GuidedStepperStep {
  stepNumber: number;
  label: string;
  sentenceParts: {
    text: string;
    isHighlighted?: boolean;
    highlightColor?: 'sky' | 'amber' | 'emerald' | 'rose' | 'purple';
    tagLabel?: string;
  }[];
  explanation: string;
  mascotTip: string;
}

export interface PitfallVisualPair {
  id: string;
  categoryLabel: string;
  wrongText: string;
  wrongReason: string;
  rightText: string;
  rightReason: string;
  spotQuestion: string;
  spotOptions: string[];
  spotCorrect: string;
}

export type DavaoSceneType = 'hamiguitan' | 'pujada_bay' | 'dahican' | 'aliwagwag';

export interface DavaoHotspotItem {
  id: string;
  x: number; // percentage 10..90
  y: number; // percentage 15..85
  label: string;
  localTerm: string;
  bisayaMeaning: string;
  sentence: string;
  conceptHighlight: string;
}

export interface VocabFlipCardSpec {
  id: string;
  term: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
  iconKey: 'antonym' | 'synonym' | 'cause' | 'puzzle' | 'compass' | 'scroll' | 'feather' | 'shield';
  filipinoBisayaHint: string;
}

export interface SelfCheckRapidQuestion {
  id: string;
  prompt: string;
  analogyDisplay?: { a: string; b: string; c: string };
  options: string[];
  answer: string;
  mascotCheer: string;
  mascotHint: string;
}

export interface CheatsheetVisualNode {
  id: string;
  stepIndex: number;
  title: string;
  formulaOrKey: string;
  quickExample: string;
  memoryTrick: string;
  accentColor: 'sky' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export interface ModuleVisualConfig {
  moduleId: string;
  moduleTitle: string;
  tabs: {
    concepts: {
      explainer: {
        type: 'svg-motion' | 'lottie' | 'video';
        title: string;
        subtitle: string;
        durationSec: number;
        xp: number;
        posterTitle: string;
        slides: ExplainerSlide[];
      };
      ruleVisuals: RuleVisualSpec[];
      interactiveDiagram: {
        title: string;
        subtitle: string;
        xp: number;
        nodes: DiagramPairNode[];
      };
      miniGame: {
        title: string;
        subtitle: string;
        xp: number;
        categories: string[];
        items: MiniGameSortItem[];
      };
    };
    guidedAnalysis: {
      xp: number;
      steps: GuidedStepperStep[];
    };
    pitfalls: {
      xp: number;
      pairs: PitfallVisualPair[];
    };
    davaoContext: {
      scene: DavaoSceneType;
      sceneTitle: string;
      sceneSubtitle: string;
      municipality: string;
      xp: number;
      hotspots: DavaoHotspotItem[];
    };
    vocabulary: {
      xp: number;
      cards: VocabFlipCardSpec[];
    };
    selfCheck: {
      xp: number;
      timerSeconds: number;
      questions: SelfCheckRapidQuestion[];
    };
    cheatsheet: {
      xp: number;
      nodes: CheatsheetVisualNode[];
    };
  };
}

