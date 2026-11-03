import type { Module } from '../types/lingoquest.ts';

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

// ============================================================================
// Reference Implementation: Analogy Module (Grade 7 Quarter 1 Module 1)
// ============================================================================
export const ANALOGY_REFERENCE_VISUAL_CONFIG: ModuleVisualConfig = {
  moduleId: 'g7-q1-m1',
  moduleTitle: 'Analogy: Relationships Between Words',
  tabs: {
    concepts: {
      explainer: {
        type: 'svg-motion',
        title: 'Watch the 60-Second Visual Lesson: How Analogies Build Island Bridges',
        subtitle: 'Silent-friendly animated walkthrough with synchronized captions & optional voice narration',
        durationSec: 60,
        xp: VISUAL_XP_REWARDS.explainer,
        posterTitle: 'A : B :: C : D — The Island Bridge Formula',
        slides: [
          {
            id: 'slide-1',
            durationSec: 12,
            headline: '1. What is an Analogy? (A : B :: C : D)',
            caption: 'An analogy links two pairs of words using the exact same bridge relationship. Read ":" as "is to" and "::" as "as".',
            narrationText: 'Welcome to San Victor Island! An analogy compares two pairs of words that share the exact same relationship. Read the single colon as is to, and the double colon as as.',
            visualTheme: 'bridge_pair',
            pairLeft: { a: 'Fish', b: 'Sea', tag: 'Pair 1 (A : B)' },
            pairRight: { c: 'Eagle', d: 'Mountain', tag: 'Pair 2 (C : D)' },
            highlightSignal: 'Fish is to Sea AS Eagle is to Mountain',
            filipinoBisayaHint: 'Tagalog: Palaisipan ng Ugnayan · Bisaya: Panagtandi sa mga Pulong',
          },
          {
            id: 'slide-2',
            durationSec: 12,
            headline: '2. Antonyms vs. Synonyms',
            caption: 'Antonyms flip to opposite meanings (Night ↔ Day), while Synonyms glow with identical meanings (Happy = Joyful).',
            narrationText: 'First, check if the words are opposites or twins! Antonyms show opposite meanings like Night and Day. Synonyms share the same meaning like Happy and Joyful.',
            visualTheme: 'antonym_flip',
            pairLeft: { a: 'Night 🌙', b: 'Day ☀️', tag: 'Antonyms (Opposites)' },
            pairRight: { c: 'Happy 😊', d: 'Joyful 😄', tag: 'Synonyms (Same)' },
            highlightSignal: 'Opposite = Antonym | Same = Synonym',
            filipinoBisayaHint: 'Antonym = Kasalungat / Baliskad · Synonym = Kasingkahulugan / Kapareho',
          },
          {
            id: 'slide-3',
            durationSec: 12,
            headline: '3. Cause and Effect Chain',
            caption: 'When Word A triggers Word B, you have a Cause → Effect relationship (Cold → Shiver :: Hot → Sweat).',
            narrationText: 'Next is Cause and Effect! Ask yourself: does the first word cause the second word to happen? Cold weather causes you to shiver, just as hot weather causes you to sweat!',
            visualTheme: 'cause_chain',
            pairLeft: { a: 'Cold ❄️', b: 'Shiver 🥶', tag: 'Cause → Effect' },
            pairRight: { c: 'Hot 🔥', d: 'Sweat 💧', tag: 'Cause → Effect' },
            highlightSignal: 'Rain : Flood :: Study : High Grades',
            filipinoBisayaHint: 'Tagalog: Sanhi at Bunga · Bisaya: Hinungdan ug Epekto',
          },
          {
            id: 'slide-4',
            durationSec: 12,
            headline: '4. Part to Whole & Location',
            caption: 'Part to Whole connects a piece to its structure (Plank : Bridge), while Location connects a subject to its home (Coral : Pujada Bay).',
            narrationText: 'Part to Whole shows a single piece of a larger object, like a bamboo plank on an island bridge. Location shows where something lives, like a Philippine Eagle on Mount Hamiguitan.',
            visualTheme: 'part_whole',
            pairLeft: { a: 'Greeting', b: 'Letter', tag: 'Part → Whole' },
            pairRight: { c: 'Eagle', d: 'Mt. Hamiguitan', tag: 'Object → Location' },
            highlightSignal: 'Piece → Whole Object | Creature → Habitat',
            filipinoBisayaHint: 'Bahagi sa Kabuuan (Part to Whole) · Lugar / Pinuy-anan (Location)',
          },
          {
            id: 'slide-5',
            durationSec: 12,
            headline: '5. The Bridge Sentence Secret!',
            caption: 'Build a short sentence connecting A and B, then plug C and D into the exact same sentence frame!',
            narrationText: 'Here is the secret weapon to ace every quiz: build a Bridge Sentence for Pair 1, then plug Pair 2 into the exact same sentence! You are ready to explore!',
            visualTheme: 'island_map',
            pairLeft: { a: 'Husband', b: 'Spouse', tag: 'A is a synonym of B' },
            pairRight: { c: 'Baby', d: 'Infant', tag: 'C is a synonym of D' },
            highlightSignal: 'Bridge Formula: "A is [relationship] to B, just as C is [relationship] to D."',
            filipinoBisayaHint: 'Gamitin ang "Bridge Sentence" para siguradong tama ang sagot!',
          },
        ],
      },
      ruleVisuals: [
        {
          ruleId: 'antonyms',
          title: 'Rule 01 · Antonyms (Opposite Meaning)',
          animationType: 'antonyms',
          pairA: 'Night 🌙',
          pairB: 'Day ☀️',
          pairC: 'Happy 😊',
          pairD: 'Sad 😢',
          badgeLabel: 'Opposite Flip',
          filipinoHint: 'Kasalungat (Magkabaligtaran ang kahulugan)',
          bisayaHint: 'Baliskad nga kahulugan (e.g., Hayag ug Ngisi / Gabii ug Adlaw)',
          alt: 'Animated day and night cards flipping to show opposite antonym pairs',
        },
        {
          ruleId: 'synonyms',
          title: 'Rule 02 · Synonyms (Same Meaning)',
          animationType: 'synonyms',
          pairA: 'Husband',
          pairB: 'Spouse',
          pairC: 'Baby',
          pairD: 'Infant',
          badgeLabel: 'Twin Meaning',
          filipinoHint: 'Kasingkahulugan (Pareho ang ibig sabihin)',
          bisayaHint: 'Managsama og kahulugan (e.g., Malipayon ug Masadya)',
          alt: 'Animated twin word nodes glowing in sync to illustrate synonyms',
        },
        {
          ruleId: 'cause-effect',
          title: 'Rule 03 · Cause and Effect (Trigger → Result)',
          animationType: 'cause_effect',
          pairA: 'Cold ❄️',
          pairB: 'Shiver 🥶',
          pairC: 'Hot ☀️',
          pairD: 'Sweat 💧',
          badgeLabel: 'Action Chain',
          filipinoHint: 'Sanhi at Bunga (Dahilan at Resulta)',
          bisayaHint: 'Hinungdan ug Epekto (Unsay mahitabo sunod)',
          alt: 'Animated domino arrow chain from Cold to Shiver and Hot to Sweat',
        },
        {
          ruleId: 'part-whole',
          title: 'Rule 04 · Part to Whole (Piece → Complete Entity)',
          animationType: 'part_whole',
          pairA: 'Greeting',
          pairB: 'Letter ✉️',
          pairC: 'Title Page',
          pairD: 'Book 📖',
          badgeLabel: 'Puzzle Link',
          filipinoHint: 'Bahagi ng Kabuuan (Parte ng isang buong bagay)',
          bisayaHint: 'Bahin sa Tibuok (Usa ka piyesa sa tibuok butang)',
          alt: 'Animated puzzle piece snapping into a whole book and letter',
        },
        {
          ruleId: 'location',
          title: 'Rule 05 · Location (Subject → Habitat / Place)',
          animationType: 'location',
          pairA: 'Fish 🐟',
          pairB: 'Sea 🌊',
          pairC: 'Eagle 🦅',
          pairD: 'Mt. Hamiguitan ⛰️',
          badgeLabel: 'Map Pin',
          filipinoHint: 'Lugar o Tirahan kung saan matatagpuan',
          bisayaHint: 'Pinuy-anan o dapit kung asa makit-an',
          alt: 'Animated radar pin locating fish in Pujada Bay and eagle on Mount Hamiguitan',
        },
      ],
      interactiveDiagram: {
        title: 'Interactive Analogy Bridge Builder (A : B :: C : D)',
        subtitle: 'Tap the missing word that matches the first pair’s relationship to connect and glow the island bridge!',
        xp: VISUAL_XP_REWARDS.diagram,
        nodes: [
          {
            id: 'diag-1',
            leftPair: 'Night : Day',
            rightPrompt: 'Tranquil : ________',
            correctCompletion: 'Turbulent',
            distractors: ['Peaceful', 'Ocean', 'Boat'],
            relationshipLabel: 'Antonyms (Opposites)',
            bridgeExplanation: 'Night is the opposite of Day, just as Tranquil (calm water) is the opposite of Turbulent (rough waves).',
          },
          {
            id: 'diag-2',
            leftPair: 'Cold : Shiver',
            rightPrompt: 'Monsoon Rain : ________',
            correctCompletion: 'Orchids Bloom',
            distractors: ['Dry Sand', 'Compass', 'Feather'],
            relationshipLabel: 'Cause and Effect',
            bridgeExplanation: 'Cold causes shivering, just as monsoon rain causes Mount Hamiguitan orchids to bloom.',
          },
          {
            id: 'diag-3',
            leftPair: 'Plank : Bamboo Bridge',
            rightPrompt: 'Stanza : ________',
            correctCompletion: 'Poem',
            distractors: ['Dictionary', 'Loudly', 'Running'],
            relationshipLabel: 'Part to Whole',
            bridgeExplanation: 'A plank is a part of a bamboo bridge, just as a stanza is a part of a poem.',
          },
        ],
      },
      miniGame: {
        title: 'Mini-Game: Sort the Word Pairs into the Correct Analogy Basket!',
        subtitle: 'Tap a word pair card, then tap its matching relationship basket to score +20 XP!',
        xp: VISUAL_XP_REWARDS.minigame,
        categories: ['Antonyms', 'Synonyms', 'Cause & Effect', 'Part to Whole', 'Location'],
        items: [
          { id: 'mg-1', wordPair: 'light : dark', category: 'Antonyms', hint: 'Are light and dark the same or opposites?' },
          { id: 'mg-2', wordPair: 'courageous : brave', category: 'Synonyms', hint: 'Both words describe a fearless hero!' },
          { id: 'mg-3', wordPair: 'typhoon : high waves', category: 'Cause & Effect', hint: 'One event triggers the other.' },
          { id: 'mg-4', wordPair: 'fin : pawikan (sea turtle)', category: 'Part to Whole', hint: 'A fin is one body part of the sea turtle.' },
          { id: 'mg-5', wordPair: 'surfer : Dahican Beach', category: 'Location', hint: 'Where do you find skimboarders and surfers in Mati?' },
        ],
      },
    },
    guidedAnalysis: {
      xp: VISUAL_XP_REWARDS.stepper,
      steps: [
        {
          stepNumber: 1,
          label: 'Step 1: Inspect the First Complete Pair (A : B)',
          sentenceParts: [
            { text: 'tranquil', isHighlighted: true, highlightColor: 'sky', tagLabel: 'Term A (Calm)' },
            { text: ' : ' },
            { text: 'calm', isHighlighted: true, highlightColor: 'sky', tagLabel: 'Term B (Peaceful)' },
            { text: ' :: pristine : ________' },
          ],
          explanation: 'Look at the first pair: "tranquil : calm". Both words are adjectives that mean peaceful and untroubled.',
          mascotTip: 'Kapitan Pawikan says: Always decode Pair 1 first before looking at the choices!',
        },
        {
          stepNumber: 2,
          label: 'Step 2: Build Your Bridge Sentence',
          sentenceParts: [
            { text: '"Tranquil"', isHighlighted: true, highlightColor: 'emerald', tagLabel: 'Word A' },
            { text: ' means the exact same thing as ', isHighlighted: true, highlightColor: 'amber', tagLabel: 'Bridge Verb (Synonym)' },
            { text: '"calm".', isHighlighted: true, highlightColor: 'emerald', tagLabel: 'Word B' },
          ],
          explanation: 'Because "tranquil" and "calm" have identical meanings, our Bridge Relationship is SYNONYMS.',
          mascotTip: 'Sa Bisaya: Pareho sila og kahulugan (malinawon)!',
        },
        {
          stepNumber: 3,
          label: 'Step 3: Apply the Bridge to Term C ("pristine")',
          sentenceParts: [
            { text: 'tranquil : calm :: ' },
            { text: 'pristine', isHighlighted: true, highlightColor: 'purple', tagLabel: 'Term C (Clean/Pure)' },
            { text: ' : ' },
            { text: 'unspoiled', isHighlighted: true, highlightColor: 'emerald', tagLabel: 'Term D (Matched Synonym!)' },
          ],
          explanation: 'Plug "pristine" into the same Bridge Sentence: "Pristine means the exact same thing as unspoiled." Both pairs are now balanced!',
          mascotTip: 'Great job! Both sides of the "::" double colon now share the exact same relationship!',
        },
      ],
    },
    pitfalls: {
      xp: VISUAL_XP_REWARDS.pitfalls,
      pairs: [
        {
          id: 'pit-1',
          categoryLabel: 'Pitfall #1 · Reversing the Order of Terms',
          wrongText: 'finger : hand :: tree : leaf  ✕ (Part:Whole paired with Whole:Part)',
          wrongReason: 'The first pair goes from PART to WHOLE (finger → hand), but the second pair flipped to WHOLE to PART (tree → leaf)!',
          rightText: 'finger : hand :: leaf : tree  ✓ (Part:Whole matched with Part:Whole)',
          rightReason: 'Both pairs now follow the exact same direction: Part first, Whole second (finger → hand :: leaf → tree).',
          spotQuestion: 'Which completion keeps the direction of "page : book :: ________"?',
          spotOptions: ['plank : bridge', 'forest : tree'],
          spotCorrect: 'plank : bridge',
        },
        {
          id: 'pit-2',
          categoryLabel: 'Pitfall #2 · Mixing Parts of Speech',
          wrongText: 'courageous (Adjective) : brave (Adjective) :: honesty (Noun) : truthful (Adjective)  ✕',
          wrongReason: 'Even if the meanings are related, mixing a Noun with an Adjective breaks grammatical parallelism.',
          rightText: 'courageous (Adjective) : brave (Adjective) :: honest (Adjective) : truthful (Adjective)  ✓',
          rightReason: 'All four words are now Adjectives, keeping both meaning and grammar aligned.',
          spotQuestion: 'Complete with the matching part of speech: "swiftly (Adverb) : quickly :: happily : ________"',
          spotOptions: ['joyfully', 'joy'],
          spotCorrect: 'joyfully',
        },
        {
          id: 'pit-3',
          categoryLabel: 'Pitfall #3 · Picking a Word Just Because It Sounds Related',
          wrongText: 'fish : sea :: lion : roar  ✕ (Location mixed with Action/Sound)',
          wrongReason: '"Lion" and "roar" are related, but a roar is a sound, NOT a location!',
          rightText: 'fish : sea :: lion : forest  ✓ (Subject : Location)',
          rightReason: 'A fish lives in the sea, just as a lion lives in the forest/savanna.',
          spotQuestion: 'Complete the Location analogy: "sailor : ship :: student : ________"',
          spotOptions: ['classroom', 'homework'],
          spotCorrect: 'classroom',
        },
      ],
    },
    davaoContext: {
      scene: 'hamiguitan',
      sceneTitle: 'Interactive Davao Oriental Explorer: Mt. Hamiguitan & Pujada Bay',
      sceneSubtitle: 'Tap the glowing island pins to uncover real-world analogies across Davao Oriental!',
      municipality: 'San Isidro & City of Mati, Davao Oriental',
      xp: VISUAL_XP_REWARDS.hotspots,
      hotspots: [
        {
          id: 'hs-eagle',
          x: 26,
          y: 28,
          label: 'Philippine Eagle Sanctuary',
          localTerm: 'Agila sa Hamiguitan',
          bisayaMeaning: 'Langgam nga nagpuyo sa bukid (Location Analogy)',
          sentence: 'Eagle : Mount Hamiguitan :: Dugong : Pujada Bay — Both pairs connect an endangered animal to its protected Davao Oriental habitat!',
          conceptHighlight: 'Location Analogy (Animal : Habitat)',
        },
        {
          id: 'hs-bonsai',
          x: 52,
          y: 48,
          label: 'Centuries-Old Pygmy Bonsai Forest',
          localTerm: 'Pygmy / Bonsai Forest',
          bisayaMeaning: 'Gagmay nga kahoy = Pygmy / Dwarf (Synonyms)',
          sentence: 'Pygmy : Dwarf :: Ancient : Old — The UNESCO World Heritage bonsai trees of Mt. Hamiguitan are both pygmy (dwarf) and ancient (old).',
          conceptHighlight: 'Synonyms Analogy (Same Meaning)',
        },
        {
          id: 'hs-falls',
          x: 76,
          y: 36,
          label: 'Mountain Monsoon & Streams',
          localTerm: 'Ulan ug Busay',
          bisayaMeaning: 'Hinungdan ug Epekto (Cause & Effect)',
          sentence: 'Mountain Rain : Flowing Streams :: Sunshine : Warm Sandbar — Rainfall in the highlands feeds the crystal rivers flowing down to the coast.',
          conceptHighlight: 'Cause & Effect Analogy',
        },
        {
          id: 'hs-reef',
          x: 64,
          y: 76,
          label: 'San Victor & Pujada Coral Reef',
          localTerm: 'Gasang sa Dagat',
          bisayaMeaning: 'Bahin sa Tibuok (Part to Whole)',
          sentence: 'Coral Polyp : Reef Sanctuary :: Mangrove Tree : Coastal Forest — Each tiny coral is a vital part of the whole marine ecosystem.',
          conceptHighlight: 'Part to Whole Analogy',
        },
      ],
    },
    vocabulary: {
      xp: VISUAL_XP_REWARDS.vocabFlip,
      cards: [
        {
          id: 'vc-1',
          term: 'Analogy',
          partOfSpeech: 'Noun',
          definition: 'A logical comparison between two pairs of words that share the exact same relationship (A : B :: C : D).',
          exampleSentence: 'Solving an analogy is like building a bridge between two matching island pairs.',
          iconKey: 'compass',
          filipinoBisayaHint: 'Tagalog: Analohiya / Paghahambing · Bisaya: Panagtandi',
        },
        {
          id: 'vc-2',
          term: 'Antonyms',
          partOfSpeech: 'Noun (Plural)',
          definition: 'Words with opposite meanings, such as turbulent and tranquil, or night and day.',
          exampleSentence: 'In the analogy "hot : cold :: high : low", both word pairs are antonyms.',
          iconKey: 'antonym',
          filipinoBisayaHint: 'Tagalog: Kasalungat · Bisaya: Baliskad og kahulugan',
        },
        {
          id: 'vc-3',
          term: 'Synonyms',
          partOfSpeech: 'Noun (Plural)',
          definition: 'Words that have the same or nearly identical meanings, such as joyful and cheerful.',
          exampleSentence: 'Pristine and unspoiled are synonyms that describe San Victor Island.',
          iconKey: 'synonym',
          filipinoBisayaHint: 'Tagalog: Kasingkahulugan · Bisaya: Kapareho og kahulugan',
        },
        {
          id: 'vc-4',
          term: 'Cause and Effect',
          partOfSpeech: 'Relationship Type',
          definition: 'A relationship where the first word is the trigger (cause) and the second word is the result (effect).',
          exampleSentence: 'Study : High Grades is a classic cause-and-effect analogy.',
          iconKey: 'cause',
          filipinoBisayaHint: 'Tagalog: Sanhi at Bunga · Bisaya: Hinungdan ug Epekto',
        },
        {
          id: 'vc-5',
          term: 'Part to Whole',
          partOfSpeech: 'Relationship Type',
          definition: 'A relationship where one word is a single component or piece of the larger whole object.',
          exampleSentence: 'Petal : Flower :: Plank : Bridge shows a part-to-whole connection.',
          iconKey: 'puzzle',
          filipinoBisayaHint: 'Tagalog: Bahagi sa Kabuuan · Bisaya: Bahin sa Tibuok',
        },
        {
          id: 'vc-6',
          term: 'Tranquil',
          partOfSpeech: 'Adjective',
          definition: 'Free from disturbance; calm, serene, and peaceful like Pujada Bay at sunrise.',
          exampleSentence: 'The tranquil lagoon reflected the golden morning sky.',
          iconKey: 'feather',
          filipinoBisayaHint: 'Tagalog: Payapa / Tahimik · Bisaya: Malinawon',
        },
      ],
    },
    selfCheck: {
      xp: VISUAL_XP_REWARDS.selfCheck,
      timerSeconds: 20,
      questions: [
        {
          id: 'sc-1',
          prompt: 'Identify the relationship: "husband : spouse :: baby : infant"',
          analogyDisplay: { a: 'husband', b: 'spouse', c: 'baby → infant' },
          options: ['Synonyms', 'Antonyms', 'Location', 'Part to Whole'],
          answer: 'Synonyms',
          mascotCheer: 'Bibo kaayo! Husband/spouse and baby/infant share the exact same meaning!',
          mascotHint: 'Ask yourself: Do husband and spouse mean the opposite, or the exact same thing?',
        },
        {
          id: 'sc-2',
          prompt: 'Complete the bridge: "greeting : letter :: title page : ________"',
          analogyDisplay: { a: 'greeting', b: 'letter', c: 'title page' },
          options: ['book', 'pencil', 'ocean', 'angry'],
          answer: 'book',
          mascotCheer: 'Sakto! A greeting is part of a letter, and a title page is part of a book!',
          mascotHint: 'Think Part to Whole: A greeting is the opening part of a letter. What is a title page part of?',
        },
        {
          id: 'sc-3',
          prompt: 'Complete the bridge: "fish : sea :: Philippine Eagle : ________"',
          analogyDisplay: { a: 'fish', b: 'sea', c: 'Philippine Eagle' },
          options: ['forest / mountain', 'swimming', 'scale', 'feather'],
          answer: 'forest / mountain',
          mascotCheer: 'Awesome streak! You mastered Location analogies like a true Davao Oriental explorer!',
          mascotHint: 'The sea is the LOCATION where a fish lives. Where does the Philippine Eagle live?',
        },
      ],
    },
    cheatsheet: {
      xp: VISUAL_XP_REWARDS.cheatsheet,
      nodes: [
        {
          id: 'cs-1',
          stepIndex: 1,
          title: 'Colon Symbol Decoder',
          formulaOrKey: 'A : B :: C : D  →  "A is to B as C is to D"',
          quickExample: 'night : day :: happy : sad',
          memoryTrick: 'Single colon (:) = "is to" | Double colon (::) = "as" (the bridge center!)',
          accentColor: 'sky',
        },
        {
          id: 'cs-2',
          stepIndex: 2,
          title: 'Synonyms vs. Antonyms',
          formulaOrKey: 'Synonyms = Same (=)  |  Antonyms = Opposite (↔)',
          quickExample: 'joyful : happy (Synonym) · tranquil : turbulent (Antonym)',
          memoryTrick: 'S-ynonym = S-ame meaning | A-ntonym = A-gainst / Opposite!',
          accentColor: 'emerald',
        },
        {
          id: 'cs-3',
          stepIndex: 3,
          title: 'Cause & Effect Chain',
          formulaOrKey: 'Trigger Event (Cause) → Outcome (Effect)',
          quickExample: 'cold : shiver :: hot : sweat',
          memoryTrick: 'Use the test phrase: "[Word A] makes [Word B] happen."',
          accentColor: 'amber',
        },
        {
          id: 'cs-4',
          stepIndex: 4,
          title: 'Part to Whole & Location',
          formulaOrKey: 'Piece → Whole Object  |  Subject → Habitat/Place',
          quickExample: 'plank : bridge (Part:Whole) · fish : sea (Location)',
          memoryTrick: 'Check the order! Never mix Part→Whole with Whole→Part.',
          accentColor: 'purple',
        },
      ],
    },
  },
};

// ============================================================================
// Helper: Choose Davao Oriental Scene by Quarter / Module
// ============================================================================
function getSceneForModule(module: Module): {
  scene: DavaoSceneType;
  sceneTitle: string;
  sceneSubtitle: string;
  municipality: string;
} {
  switch (module.quarter) {
    case 1:
      return {
        scene: 'pujada_bay',
        sceneTitle: 'San Victor Island & Pujada Bay Marine Sanctuary',
        sceneSubtitle: 'Tap the glowing coastal hotspots to see how this lesson connects to Davao Oriental life!',
        municipality: 'Baganga & City of Mati, Davao Oriental',
      };
    case 2:
      return {
        scene: 'dahican',
        sceneTitle: 'Dahican Beach & Oak Island Shifting Sandbar',
        sceneSubtitle: 'Tap the glowing Pacific surf and pawikan hotspots to explore local example sentences!',
        municipality: 'City of Mati, Davao Oriental',
      };
    case 3:
      return {
        scene: 'aliwagwag',
        sceneTitle: 'Aliwagwag Falls & Mandaya Heritage Village',
        sceneSubtitle: 'Tap the cascading waterfall boulders and Dagmay weaving hotspots to unlock examples!',
        municipality: 'Cateel & Caraga, Davao Oriental',
      };
    case 4:
    default:
      return {
        scene: 'hamiguitan',
        sceneTitle: 'Mount Hamiguitan UNESCO World Heritage Bonsai Forest',
        sceneSubtitle: 'Tap the highland peaks and Philippine Eagle hotspots to see real-world sentences!',
        municipality: 'San Isidro, Davao Oriental',
      };
  }
}

// ============================================================================
// Dynamic Content-Driven Visual Generator for ALL Curriculum Modules
// ============================================================================
const EXPLICIT_VISUAL_CONFIGS: Record<string, ModuleVisualConfig> = {
  'g7-q1-m1': ANALOGY_REFERENCE_VISUAL_CONFIG,
};

export function getModuleVisualConfig(module: Module): ModuleVisualConfig {
  // 1. Return explicit custom config if registered
  if (EXPLICIT_VISUAL_CONFIGS[module.id]) {
    return EXPLICIT_VISUAL_CONFIGS[module.id];
  }

  // 2. If the module title is specifically about Analogy (e.g. Grade 7 Analogy modules),
  // adapt the Analogy Reference visual config with the module's specific examples & title
  const lowerTitle = module.title.toLowerCase();
  if (lowerTitle.includes('analogy')) {
    return {
      ...ANALOGY_REFERENCE_VISUAL_CONFIG,
      moduleId: module.id,
      moduleTitle: module.title,
    };
  }

  // 3. Dynamically synthesize a tailored, content-driven visual configuration
  // from the module's actual DepEd MELC lessonContent & quizQuestions
  const { lessonContent } = module;
  const rules = lessonContent.keyRules || [];
  const examples = lessonContent.examples || [];
  const sceneMeta = getSceneForModule(module);

  const animationTypes: RuleVisualSpec['animationType'][] = [
    'structure',
    'synonyms',
    'antonyms',
    'cause_effect',
    'part_whole',
    'location',
  ];

  // Build Rule Visuals for every numbered rule in the module
  const ruleVisuals: RuleVisualSpec[] = rules.map((rawRule, idx) => {
    const colonIdx = rawRule.indexOf(':');
    const ruleName = colonIdx > 0 ? rawRule.slice(0, colonIdx).trim() : `Rule 0${idx + 1}`;
    const ruleDesc = colonIdx > 0 ? rawRule.slice(colonIdx + 1).trim() : rawRule;

    // Extract sample words from parentheses or quotes if present
    const parenMatch = ruleDesc.match(/\(([^)]+)\)/);
    const sampleInside = parenMatch ? parenMatch[1] : '';
    const sampleParts = sampleInside
      .split(/[,;]|::|→/)
      .map((s) => s.trim())
      .filter(Boolean);

    const pairA = sampleParts[0] || ruleName.split(' ')[0] || 'Concept A';
    const pairB = sampleParts[1] || 'Signal Clue';
    const pairC = sampleParts[2] || `Grade ${module.gradeLevel} Example`;
    const pairD = sampleParts[3] || 'Verified Mastery';

    return {
      ruleId: `${module.id}-rule-${idx + 1}`,
      title: `Rule 0${idx + 1} · ${ruleName}`,
      animationType: animationTypes[idx % animationTypes.length],
      pairA: pairA.slice(0, 26),
      pairB: pairB.slice(0, 26),
      pairC: pairC.slice(0, 26),
      pairD: pairD.slice(0, 26),
      badgeLabel: module.topicType.replace('-', ' ').toUpperCase(),
      filipinoHint: `Batayang Tuntunin #${idx + 1}: Unawain ang estruktura at palatandaan sa pangungusap.`,
      bisayaHint: `Timan-i kini nga lagda (#${idx + 1}) aron dali mailhan ang saktong tubag sa quiz.`,
      alt: `Animated visual example for ${ruleName}`,
    };
  });

  // Build 4-5 Explainer Slides from Overview, Rules, Examples, and Cultural Connection
  const slides: ExplainerSlide[] = [
    {
      id: `${module.id}-sl-1`,
      durationSec: 15,
      headline: `1. Core Concept: ${module.title}`,
      caption: lessonContent.overview.slice(0, 185) + (lessonContent.overview.length > 185 ? '...' : ''),
      narrationText: `Welcome to Grade ${module.gradeLevel} Module ${module.moduleNumber}: ${module.title}. ${lessonContent.overview}`,
      visualTheme: 'bridge_pair',
      pairLeft: { a: `Grade ${module.gradeLevel}`, b: `Module ${module.moduleNumber}`, tag: 'DepEd MELC Quest' },
      pairRight: { c: module.topicType.toUpperCase(), d: sceneMeta.sceneTitle.split('&')[0].trim(), tag: 'Island Target' },
      highlightSignal: lessonContent.melcCompetency,
      filipinoBisayaHint: 'Tagalog: Pangunahing Konsepto · Bisaya: Panguna nga Pagtulun-an',
    },
    ...ruleVisuals.slice(0, 2).map((rv, idx) => ({
      id: `${module.id}-sl-rule-${idx}`,
      durationSec: 15,
      headline: `${idx + 2}. ${rv.title}`,
      caption: rules[idx] || rv.title,
      narrationText: rules[idx] || rv.title,
      visualTheme: (idx === 0 ? 'synonym_glow' : 'cause_chain') as ExplainerSlide['visualTheme'],
      pairLeft: { a: rv.pairA, b: rv.pairB, tag: 'Pattern Clue' },
      pairRight: { c: rv.pairC, d: rv.pairD, tag: 'Application' },
      highlightSignal: `${rv.pairA} → ${rv.pairB}`,
      filipinoBisayaHint: rv.bisayaHint,
    })),
    {
      id: `${module.id}-sl-final`,
      durationSec: 15,
      headline: `4. Real-World Application in Davao Oriental`,
      caption: lessonContent.culturalConnection,
      narrationText: `In Davao Oriental, ${lessonContent.culturalConnection}`,
      visualTheme: 'island_map',
      pairLeft: { a: 'Local Heritage', b: 'Clear English', tag: 'Region XI Context' },
      pairRight: { c: '75%+ Quiz Score', d: 'Restore Bridge', tag: 'Quest Goal' },
      highlightSignal: examples[0]?.example || lessonContent.warmupQuestion.question,
      filipinoBisayaHint: 'I-apply ang leksyon sa kultura ug kinaiyahan sa Davao Oriental!',
    },
  ];

  // Build Interactive Diagram Nodes from module quizQuestions & warmup
  const qPool = module.quizQuestions || [];
  const diagramNodes: DiagramPairNode[] = qPool.slice(0, 3).map((q, idx) => {
    const opts = q.options && q.options.length > 0 ? q.options : [q.answer, 'Distractor A', 'Distractor B'];
    const distractors = opts.filter((o) => o !== q.answer).slice(0, 3);
    if (q.analogyPair) {
      return {
        id: `${module.id}-diag-${idx}`,
        leftPair: `${q.analogyPair.firstA} : ${q.analogyPair.firstB}`,
        rightPrompt: `${q.analogyPair.secondC} : ________`,
        correctCompletion: q.answer,
        distractors: distractors.length > 0 ? distractors : ['Incorrect Option A', 'Incorrect Option B'],
        relationshipLabel: q.analogyPair.relationshipType || 'Concept Bridge',
        bridgeExplanation: q.explanation,
      };
    }
    return {
      id: `${module.id}-diag-${idx}`,
      leftPair: `${module.title.split(' ')[0]} Rule #${idx + 1}`,
      rightPrompt: q.prompt.length > 75 ? q.prompt.slice(0, 75) + '...' : q.prompt,
      correctCompletion: q.answer,
      distractors: distractors.length > 0 ? distractors : ['Option B', 'Option C'],
      relationshipLabel: 'Structural Match',
      bridgeExplanation: q.explanation,
    };
  });

  if (diagramNodes.length === 0) {
    diagramNodes.push({
      id: `${module.id}-diag-fallback`,
      leftPair: `${module.title.split(' ')[0]} : Core Rule`,
      rightPrompt: lessonContent.warmupQuestion.question,
      correctCompletion: lessonContent.warmupQuestion.correctAnswer,
      distractors: lessonContent.warmupQuestion.options.filter(
        (o) => o !== lessonContent.warmupQuestion.correctAnswer
      ),
      relationshipLabel: 'Diagnostic Concept Link',
      bridgeExplanation: lessonContent.warmupQuestion.feedback,
    });
  }

  // Build Mini-Game Sorting items from rules & examples
  const categoryLabels = ruleVisuals.slice(0, 3).map((r) => {
    const clean = r.title.replace(/^Rule \d+\s*·\s*/, '');
    return clean.length > 22 ? clean.slice(0, 22) : clean;
  });
  while (categoryLabels.length < 3) {
    categoryLabels.push(`Pattern ${categoryLabels.length + 1}`);
  }

  const miniGameItems: MiniGameSortItem[] = [
    ...ruleVisuals.slice(0, 3).map((rv, idx) => ({
      id: `${module.id}-mg-${idx + 1}`,
      wordPair: `${rv.pairA} → ${rv.pairB}`,
      category: categoryLabels[idx % categoryLabels.length],
      hint: `Matches ${categoryLabels[idx % categoryLabels.length]}`,
    })),
    ...examples.slice(0, 2).map((ex, idx) => ({
      id: `${module.id}-mg-ex-${idx + 1}`,
      wordPair: ex.example.length > 42 ? ex.example.slice(0, 42) + '...' : ex.example,
      category: categoryLabels[idx % categoryLabels.length],
      hint: ex.title,
    })),
  ];

  // Build Guided Analysis Stepper from examples
  const primaryEx = examples[0] || {
    title: module.title,
    example: lessonContent.warmupQuestion.question,
    analysis: lessonContent.warmupQuestion.feedback,
  };
  const words = primaryEx.example.split(' ');
  const mid = Math.max(1, Math.floor(words.length / 2));
  const part1 = words.slice(0, mid).join(' ');
  const part2 = words.slice(mid).join(' ');

  const guidedSteps: GuidedStepperStep[] = [
    {
      stepNumber: 1,
      label: 'Step 1: Spot the Signal Words & Context',
      sentenceParts: [
        { text: part1 + ' ', isHighlighted: true, highlightColor: 'sky', tagLabel: 'Opening Context / Signal' },
        { text: part2 },
      ],
      explanation: `First, read the opening clause carefully and identify the key signal words for ${primaryEx.title}.`,
      mascotTip: 'Kapitan Pawikan says: Look for colons, transition markers, or surrounding clues first!',
    },
    {
      stepNumber: 2,
      label: 'Step 2: Analyze the Target Expression',
      sentenceParts: [
        { text: part1 + ' ' },
        { text: part2, isHighlighted: true, highlightColor: 'amber', tagLabel: 'Target Structure' },
      ],
      explanation: primaryEx.analysis,
      mascotTip: 'Notice how the second half of the sentence completes the pattern started in the first half!',
    },
    {
      stepNumber: 3,
      label: 'Step 3: Verify Meaning & Grammatical Balance',
      sentenceParts: [
        { text: primaryEx.example, isHighlighted: true, highlightColor: 'emerald', tagLabel: 'Verified Model Sentence ✓' },
      ],
      explanation:
        examples[1]?.analysis ||
        `By checking both halves together, we confirm the sentence follows the DepEd MELC rule: ${lessonContent.melcCompetency}`,
      mascotTip: 'Awesome! You can now use this exact 3-step check on every quiz question!',
    },
  ];

  // Build Pitfall Comparison Cards
  const rawMistakes =
    lessonContent.commonMistakesAndTips && lessonContent.commonMistakesAndTips.length > 0
      ? lessonContent.commonMistakesAndTips
      : [
          {
            mistake: `Guessing an answer in ${module.title} based only on a single familiar word without checking the whole relationship.`,
            correction: `Apply the full rule pattern and test your choice inside the complete sentence.`,
            why: `Context and structural markers determine the exact grammatical and logical meaning.`,
          },
          {
            mistake: `Ignoring signal words, verb tenses, or colon order (A : B :: C : D).`,
            correction: `Match both the direction and part of speech between the prompt and your answer.`,
            why: `Parallel structure keeps English sentences clear and accurate.`,
          },
        ];

  const pitfallPairs: PitfallVisualPair[] = rawMistakes.map((m, idx) => ({
    id: `${module.id}-pit-${idx + 1}`,
    categoryLabel: `Pitfall #${idx + 1} · Common Exam Trap vs. Verified Strategy`,
    wrongText: `${m.mistake}  ✕`,
    wrongReason: m.why,
    rightText: `${m.correction}  ✓`,
    rightReason: `Verified Fix: ${m.why}`,
    spotQuestion:
      idx === 0
        ? lessonContent.warmupQuestion.question
        : `Which strategy prevents Pitfall #${idx + 1} in ${module.title}?`,
    spotOptions:
      idx === 0
        ? lessonContent.warmupQuestion.options.slice(0, 2).includes(lessonContent.warmupQuestion.correctAnswer)
          ? lessonContent.warmupQuestion.options.slice(0, 2)
          : [lessonContent.warmupQuestion.correctAnswer, lessonContent.warmupQuestion.options[0] || 'Skip context clues']
        : [m.correction, m.mistake],
    spotCorrect: idx === 0 ? lessonContent.warmupQuestion.correctAnswer : m.correction,
  }));

  // Build Davao Oriental Hotspots
  const davaoHotspots: DavaoHotspotItem[] = [
    {
      id: `${module.id}-hs-1`,
      x: 24,
      y: 32,
      label: sceneMeta.sceneTitle.split('&')[0].trim(),
      localTerm: 'Garbo sa Davao Oriental',
      bisayaMeaning: 'Lokal nga Ehemplo sa Leksyon (Local Context)',
      sentence: lessonContent.culturalConnection,
      conceptHighlight: `${module.title} in Davao Oriental`,
    },
    {
      id: `${module.id}-hs-2`,
      x: 56,
      y: 46,
      label: 'Model Sentence in Local Context',
      localTerm: examples[0]?.title || 'Coastal Community',
      bisayaMeaning: 'Pananglitan sa Pangungusap',
      sentence: examples[0]?.example || lessonContent.warmupQuestion.question,
      conceptHighlight: examples[0]?.analysis || lessonContent.warmupQuestion.feedback,
    },
    {
      id: `${module.id}-hs-3`,
      x: 75,
      y: 68,
      label: 'Mandaya & Coastal Heritage Link',
      localTerm: 'Kultura ug Kinaiyahan',
      bisayaMeaning: 'Koneksyon sa Komunidad',
      sentence:
        examples[1]?.example ||
        `Students in ${sceneMeta.municipality} apply ${module.title.toLowerCase()} when sharing stories about our islands and mountains.`,
      conceptHighlight: examples[1]?.analysis || lessonContent.melcCompetency,
    },
  ];

  // Build Vocabulary Flip Cards
  const iconKeys: VocabFlipCardSpec['iconKey'][] = [
    'compass',
    'synonym',
    'antonym',
    'cause',
    'puzzle',
    'feather',
    'scroll',
    'shield',
  ];
  const rawVocab =
    lessonContent.vocabularyGlossary && lessonContent.vocabularyGlossary.length > 0
      ? lessonContent.vocabularyGlossary
      : rules.slice(0, 4).map((r, i) => {
          const cIdx = r.indexOf(':');
          return {
            term: cIdx > 0 ? r.slice(0, cIdx).trim() : `${module.title.split(' ')[0]} Key ${i + 1}`,
            partOfSpeech: 'Core Concept',
            definition: cIdx > 0 ? r.slice(cIdx + 1).trim() : r,
            exampleSentence: examples[i % Math.max(1, examples.length)]?.example || lessonContent.culturalConnection,
          };
        });

  const vocabCards: VocabFlipCardSpec[] = rawVocab.map((v, idx) => ({
    id: `${module.id}-vc-${idx + 1}`,
    term: v.term,
    partOfSpeech: v.partOfSpeech || 'Academic Term',
    definition: v.definition,
    exampleSentence: v.exampleSentence,
    iconKey: iconKeys[idx % iconKeys.length],
    filipinoBisayaHint: `Tagalog/Bisaya Tip: Unawain ang "${v.term}" sa loob ng buong pangungusap.`,
  }));

  // Build Self-Check Rapid Questions
  const selfCheckQuestions: SelfCheckRapidQuestion[] = [
    {
      id: `${module.id}-sc-warmup`,
      prompt: lessonContent.warmupQuestion.question,
      options: lessonContent.warmupQuestion.options,
      answer: lessonContent.warmupQuestion.correctAnswer,
      mascotCheer: `Husay! ${lessonContent.warmupQuestion.feedback}`,
      mascotHint: `Check the key signal words in the question and apply Rule #1!`,
    },
    ...qPool.slice(0, 2).map((q, idx) => ({
      id: `${module.id}-sc-q-${idx + 1}`,
      prompt: q.prompt,
      analogyDisplay: q.analogyPair
        ? { a: q.analogyPair.firstA, b: q.analogyPair.firstB, c: q.analogyPair.secondC }
        : undefined,
      options:
        q.options && q.options.length > 0
          ? q.options
          : [q.answer, 'Unrelated Distractor', 'Opposite Form'],
      answer: q.answer,
      mascotCheer: `Sakto kaayo! ${q.explanation}`,
      mascotHint: q.hint || `Use the bridge rule from Tab 1 to test each option!`,
    })),
  ];

  // Build Cheatsheet Visual Nodes
  const accents: CheatsheetVisualNode['accentColor'][] = ['sky', 'emerald', 'amber', 'purple', 'rose'];
  const cheatsheetNodes: CheatsheetVisualNode[] = rules.slice(0, 4).map((r, idx) => {
    const cIdx = r.indexOf(':');
    const title = cIdx > 0 ? r.slice(0, cIdx).trim() : `Key Principle 0${idx + 1}`;
    const body = cIdx > 0 ? r.slice(cIdx + 1).trim() : r;
    return {
      id: `${module.id}-cs-${idx + 1}`,
      stepIndex: idx + 1,
      title,
      formulaOrKey: body,
      quickExample: examples[idx % Math.max(1, examples.length)]?.example || lessonContent.warmupQuestion.question,
      memoryTrick: `Check "${title}" before locking in your quiz answer!`,
      accentColor: accents[idx % accents.length],
    };
  });

  return {
    moduleId: module.id,
    moduleTitle: module.title,
    tabs: {
      concepts: {
        explainer: {
          type: 'svg-motion',
          title: `Watch the 60-Second Visual Lesson: ${module.title}`,
          subtitle: 'Animated explainer with captions, Bisaya/Filipino hints & optional voice narration',
          durationSec: 60,
          xp: VISUAL_XP_REWARDS.explainer,
          posterTitle: `${module.title} — Visual Concept Map`,
          slides,
        },
        ruleVisuals,
        interactiveDiagram: {
          title: `Interactive Concept Bridge: ${module.title}`,
          subtitle: 'Select the matching word or phrase to link the island pillars and earn +15 XP!',
          xp: VISUAL_XP_REWARDS.diagram,
          nodes: diagramNodes,
        },
        miniGame: {
          title: `Mini-Game: Sort & Match (${module.title})`,
          subtitle: 'Tap each card and place it into its matching rule category to earn +20 XP!',
          xp: VISUAL_XP_REWARDS.minigame,
          categories: categoryLabels,
          items: miniGameItems,
        },
      },
      guidedAnalysis: {
        xp: VISUAL_XP_REWARDS.stepper,
        steps: guidedSteps,
      },
      pitfalls: {
        xp: VISUAL_XP_REWARDS.pitfalls,
        pairs: pitfallPairs,
      },
      davaoContext: {
        ...sceneMeta,
        xp: VISUAL_XP_REWARDS.hotspots,
        hotspots: davaoHotspots,
      },
      vocabulary: {
        xp: VISUAL_XP_REWARDS.vocabFlip,
        cards: vocabCards,
      },
      selfCheck: {
        xp: VISUAL_XP_REWARDS.selfCheck,
        timerSeconds: 20,
        questions: selfCheckQuestions,
      },
      cheatsheet: {
        xp: VISUAL_XP_REWARDS.cheatsheet,
        nodes: cheatsheetNodes,
      },
    },
  };
}
