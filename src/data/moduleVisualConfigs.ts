import type { Module } from '../types/lingoquest.ts';
import { createSourceGameSession } from '../utils/sourceGameSession';

// ============================================================================
// Configurable XP Rewards for Visual Learning Interactions
// ============================================================================
export const VISUAL_XP_REWARDS = {
  explainer: 10, // Finishing the 60-second animated lesson explainer
  diagram: 15, // Completing the interactive A:B::C:D / structural bridge diagram
  minigame: 20, // Completing the embedded drag-and-drop / sorting mini-game
  stepper: 10, // Completing the Guided Analysis step-by-step walkthrough
  pitfalls: 10, // Completing the Pitfalls "Spot the Mistake" comparison
  hotspots: 15, // Exploring all Davao Oriental cultural scene hotspots
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

// Content bindings only: the original visual components, animations and XP rewards are unchanged.
// Every educational string below is a quotation or term from the current module's PDF.
export function getModuleVisualConfig(module: Module): ModuleVisualConfig {
 const pdf = module.pdfLesson;
 const concepts = pdf?.concepts || [];
 const guided = pdf?.guidedAnalysis || [];
 const terms = pdf?.vocabularyBank || [];
 const notes = pdf?.studyCheatsheet || [];
 const sourceLabel = (page: number) => `${pdf?.sourceLabel || ''} · PDF p. ${page}`;
 const questions = module.quizQuestions || [];
 const recall = createSourceGameSession(module,questions,'missingPiece','easy',()=>.5);
 const analogies = createSourceGameSession(module,questions,'analogyMaster','easy',()=>.5);
 const diagramQuestions = analogies || [];
 const reviewedAnalogy = (page:number)=>questions.find(q=>q.type==='analogyMaster' && q.source?.page===page && q.analogyPair);
 const slides = [pdf?.overview,...notes].filter((e):e is NonNullable<typeof e>=>!!e).map((e,i)=>({
  id:`${module.id}-source-slide-${i}`, durationSec:10, headline:sourceLabel(e.page),
  caption:e.text,narrationText:e.text,visualTheme:'bridge_pair' as const,
 }));
 const ruleVisuals = concepts.map((e,i)=>{
  const q=reviewedAnalogy(e.page); if(!q?.analogyPair)return undefined;
  return {ruleId:`${module.id}-source-rule-${i}`,title:sourceLabel(e.page),animationType:'structure' as const,
   pairA:q.analogyPair.firstA,pairB:q.analogyPair.firstB,pairC:q.analogyPair.secondC,pairD:q.answer,
   badgeLabel:sourceLabel(e.page),filipinoHint:'',bisayaHint:'',alt:q.source!.quote};
 });
 return {
  moduleId:module.id,moduleTitle:module.title,tabs:{
   concepts:{
    explainer:{type:'svg-motion',title:module.title,subtitle:pdf?.source.fileName||'',durationSec:60,xp:VISUAL_XP_REWARDS.explainer,posterTitle:module.title,slides},
    ruleVisuals:ruleVisuals as RuleVisualSpec[],
    interactiveDiagram:{title:`Interactive Concept Bridge: ${module.title}`,subtitle:'Complete the statements using this PDF.',xp:VISUAL_XP_REWARDS.diagram,
     nodes:diagramQuestions.map(q=>({id:q.id,leftPair:q.analogyPair?`${q.analogyPair.firstA} : ${q.analogyPair.firstB}`:q.contextSentence||q.prompt,
      rightPrompt:q.analogyPair?`${q.analogyPair.secondC} : ____`:'PDF term: ____',correctCompletion:q.answer,
      distractors:(q.options||[]).filter(x=>x!==q.answer),relationshipLabel:sourceLabel(q.source!.page),bridgeExplanation:q.explanation}))},
    miniGame:{title:`Mini-Game: Sort & Match (${module.title})`,subtitle:'Match the source definition to its PDF term.',xp:VISUAL_XP_REWARDS.minigame,
     categories:terms.length>=5?terms.slice(0,5).map(e=>e.term!):[],
     items:terms.length>=5?terms.slice(0,5).map((e,i)=>({id:`${module.id}-source-sort-${i}`,wordPair:e.text,category:e.term!,hint:sourceLabel(e.page)})):[]},
   },
   guidedAnalysis:{xp:VISUAL_XP_REWARDS.stepper,steps:guided.map((e,i)=>({stepNumber:i+1,label:sourceLabel(e.page),sentenceParts:[{text:e.text}],explanation:e.text,mascotTip:sourceLabel(e.page)}))},
   pitfalls:{xp:VISUAL_XP_REWARDS.pitfalls,pairs:[]},
   davaoContext:{scene:'hamiguitan',sceneTitle:'Source review needed',sceneSubtitle:'No source-supported localized educational material is bound to this activity.',municipality:'',xp:VISUAL_XP_REWARDS.hotspots,hotspots:[]},
   vocabulary:{xp:VISUAL_XP_REWARDS.vocabFlip,cards:terms.map((e,i)=>({id:`${module.id}-source-vocab-${i}`,term:e.term!,partOfSpeech:sourceLabel(e.page),definition:e.text,exampleSentence:'',iconKey:'scroll',filipinoBisayaHint:''}))},
   selfCheck:{xp:VISUAL_XP_REWARDS.selfCheck,timerSeconds:20,questions:(recall||analogies||[]).map(q=>({id:q.id,prompt:q.contextSentence||q.prompt,options:q.options||[],answer:q.answer,mascotCheer:q.explanation,mascotHint:sourceLabel(q.source!.page),...(q.analogyPair?{analogyDisplay:{a:q.analogyPair.firstA,b:q.analogyPair.firstB,c:q.analogyPair.secondC}}:{})}))},
   cheatsheet:{xp:VISUAL_XP_REWARDS.cheatsheet,nodes:notes.map((e,i)=>({id:`${module.id}-source-note-${i}`,stepIndex:i,title:sourceLabel(e.page),formulaOrKey:e.text,quickExample:'',memoryTrick:'',accentColor:'sky'}))},
  },
 };
}
