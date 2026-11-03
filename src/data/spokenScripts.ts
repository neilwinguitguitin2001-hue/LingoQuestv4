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

// ============================================================================
// Hand-Crafted Spoken-Style Scripts for the Analogy Reference Module (All 7 Tabs)
// Written for the ear: 8–16 word sentences, contractions, rhetorical questions,
// natural pauses ("..."), spelled-out symbols, and Davao Oriental examples.
// ============================================================================
export const ANALOGY_SPOKEN_SEGMENTS: SpokenSegment[] = [
  // --------------------------------------------------------------------------
  // TAB 1: CONCEPTS & RULES (Explainer + Overview + 5 Rules + Warm-Up)
  // --------------------------------------------------------------------------
  {
    id: 'analogy-concepts-1',
    moduleId: 'g7-q1-m1',
    tabId: 'concepts',
    sectionTitle: 'Explainer Scene 1 · What is an Analogy?',
    speaker: 'ate_lingo',
    prosodyRole: 'intro',
    displayText:
      'Welcome to San Victor Island! An analogy (A : B :: C : D) is like a bridge connecting two pairs of words that share the exact same relationship.',
    spokenText:
      "Welcome to San Victor Island! Today, let's unlock analogies together. Think of an analogy like a bamboo bridge between two word pairs. When you see A : B :: C : D, here's how we say it out loud: A is to B, as C is to D.",
    spokenTextTaglish:
      "Maayong adlaw! Welcome to San Victor Island! Today, let's unlock analogies together. Think of an analogy like a bamboo bridge between two word pairs. When you see A : B :: C : D, here's how we read it: A is to B, as C is to D.",
    keyTerms: ['analogy', 'bridge', 'is to', 'as', 'relationship'],
    visualSyncStep: 0,
  },
  {
    id: 'analogy-concepts-2',
    moduleId: 'g7-q1-m1',
    tabId: 'concepts',
    sectionTitle: 'Explainer Scene 2 · Antonyms vs. Synonyms',
    speaker: 'ate_lingo',
    prosodyRole: 'rule',
    displayText:
      'First, check if the words are opposites or twins! Antonyms flip to opposite meanings (Night : Day), while Synonyms share the same meaning (Happy : Joyful).',
    spokenText:
      "First, ask yourself a quick question. Are the two words opposites, or are they twins? Antonyms have opposite meanings, like night is to day. Synonyms mean the exact same thing, like happy is to joyful!",
    spokenTextTaglish:
      "First, ask yourself a quick question. Are the two words opposites, or are they twins? Antonyms are magkasalungat, like night is to day. Synonyms mean the exact same thing, like happy is to joyful!",
    keyTerms: ['opposites', 'twins', 'Antonyms', 'Synonyms'],
    visualSyncStep: 1,
  },
  {
    id: 'analogy-concepts-3',
    moduleId: 'g7-q1-m1',
    tabId: 'concepts',
    sectionTitle: 'Explainer Scene 3 · Cause and Effect Chain',
    speaker: 'ate_lingo',
    prosodyRole: 'rule',
    displayText:
      'When Word A triggers Word B, you have a Cause and Effect relationship: Cold : Shiver :: Hot : Sweat.',
    spokenText:
      "Now, what if the first word makes the second word happen? ... That's Cause and Effect! Cold weather makes you shiver, just as a hot afternoon in Mati makes you sweat.",
    spokenTextTaglish:
      "Now, what if the first word makes the second word happen? ... That's Cause and Effect, or sanhi at bunga! Cold weather makes you shiver, just as a hot afternoon in Mati makes you sweat.",
    keyTerms: ['Cause', 'Effect', 'shiver', 'sweat'],
    visualSyncStep: 2,
  },
  {
    id: 'analogy-concepts-4',
    moduleId: 'g7-q1-m1',
    tabId: 'concepts',
    sectionTitle: 'Explainer Scene 4 · Part to Whole & Location',
    speaker: 'ate_lingo',
    prosodyRole: 'rule',
    displayText:
      'Part to Whole links a piece to its whole object (Plank : Bridge), while Location links a subject to its home (Eagle : Mount Hamiguitan).',
    spokenText:
      "Next up, let's check Part to Whole and Location. One wooden plank is part of a whole island bridge. And where does the Philippine Eagle live? ... High up on Mount Hamiguitan! That's a Location analogy.",
    spokenTextTaglish:
      "Sige, next up, let's check Part to Whole and Location. One wooden plank is part of a whole island bridge. And where does the Philippine Eagle live? ... High up on Mount Hamiguitan! That's a Location analogy.",
    keyTerms: ['Part to Whole', 'Location', 'plank', 'Eagle', 'Hamiguitan'],
    visualSyncStep: 3,
  },
  {
    id: 'analogy-concepts-5',
    moduleId: 'g7-q1-m1',
    tabId: 'concepts',
    sectionTitle: 'Explainer Scene 5 · The Bridge Sentence Secret',
    speaker: 'ate_lingo',
    prosodyRole: 'praise',
    displayText:
      'Here is the secret weapon: build a short Bridge Sentence for Pair 1, then plug Pair 2 into the exact same sentence frame!',
    spokenText:
      "Here's the secret trick that makes every quiz easy. Build a short bridge sentence for the first pair. Then, plug the second pair into that exact same sentence! Ready? Let's test it on the five rules below.",
    spokenTextTaglish:
      "Here's the secret trick that makes every quiz easy. Build a short bridge sentence for the first pair. Then, plug the second pair into that exact same sentence! Ayos? Let's test it on the five rules below!",
    keyTerms: ['secret', 'Bridge Sentence', 'first pair', 'second pair'],
    visualSyncStep: 4,
  },
  {
    id: 'analogy-concepts-6',
    moduleId: 'g7-q1-m1',
    tabId: 'concepts',
    sectionTitle: 'Core Rule Cards · The 5 Classic Analogy Types',
    speaker: 'kuya_lingo',
    prosodyRole: 'definition',
    displayText:
      'Review the 5 Core Rules: (1) Antonyms = Opposites, (2) Synonyms = Same Meaning, (3) Cause & Effect = Trigger to Result, (4) Part to Whole = Piece to Object, (5) Location = Subject to Place.',
    spokenText:
      "Alright, Kuya James here with a quick rule recap. Whenever you face an analogy question, check these five patterns in order. First, Antonyms for opposites. Second, Synonyms for twin meanings. Third, Cause and Effect. Fourth, Part to Whole. And fifth, Location, like buying sweet durian at a Mati fruit stand, or riding a jeepney to school.",
    spokenTextTaglish:
      "Alright, Kuya James here with a quick rule recap. Whenever you face an analogy question, check these five patterns in order. First, Antonyms for opposites. Second, Synonyms for twin meanings. Third, Cause and Effect. Fourth, Part to Whole. And fifth, Location, like buying snacks at a sari-sari store or riding a jeepney in Mati. Kaya mo 'yan!",
    keyTerms: ['Antonyms', 'Synonyms', 'Cause and Effect', 'Part to Whole', 'Location'],
  },

  // --------------------------------------------------------------------------
  // TAB 2: GUIDED ANALYSIS (3-Step Animated Sentence Walkthrough)
  // --------------------------------------------------------------------------
  {
    id: 'analogy-examples-1',
    moduleId: 'g7-q1-m1',
    tabId: 'examples',
    sectionTitle: 'Guided Step 1 · Inspect Pair 1 (tranquil : calm)',
    speaker: 'ate_lingo',
    prosodyRole: 'example',
    displayText:
      'Step 1: Look at the first complete pair: "tranquil : calm :: pristine : ________". Both "tranquil" and "calm" mean peaceful.',
    spokenText:
      "Okay, let's solve this puzzle step by step. Look at the first pair: tranquil is to calm, as pristine is to blank. Don't look at the choices yet! First, what do tranquil and calm mean? ... Both describe water that's peaceful and still, like Pujada Bay at sunrise.",
    spokenTextTaglish:
      "Okay, let's solve this puzzle step by step. Look at the first pair: tranquil is to calm, as pristine is to blank. Huwag muna tumingin sa choices! First, what do tranquil and calm mean? ... Both describe water that's peaceful and malinawon, like Pujada Bay at sunrise.",
    keyTerms: ['tranquil', 'calm', 'pristine', 'peaceful'],
    visualSyncStep: 0,
  },
  {
    id: 'analogy-examples-2',
    moduleId: 'g7-q1-m1',
    tabId: 'examples',
    sectionTitle: 'Guided Step 2 · Build the Bridge Sentence',
    speaker: 'ate_lingo',
    prosodyRole: 'rule',
    displayText:
      'Step 2: Build your Bridge Sentence: "Tranquil means the exact same thing as calm." Therefore, the relationship is SYNONYMS.',
    spokenText:
      "Now for Step 2. Let's put those two words into a simple bridge sentence: Tranquil means the exact same thing as calm. Notice that? Because they share the same meaning, our bridge relationship is Synonyms!",
    spokenTextTaglish:
      "Now for Step 2. Let's put those two words into a simple bridge sentence: Tranquil means the exact same thing as calm. Notice that? Pareho sila og kahulugan, so our bridge relationship is Synonyms!",
    keyTerms: ['Bridge Sentence', 'same meaning', 'Synonyms'],
    visualSyncStep: 1,
  },
  {
    id: 'analogy-examples-3',
    moduleId: 'g7-q1-m1',
    tabId: 'examples',
    sectionTitle: 'Guided Step 3 · Match the Second Pair (pristine : unspoiled)',
    speaker: 'ate_lingo',
    prosodyRole: 'praise',
    displayText:
      'Step 3: Apply the same Bridge Sentence to "pristine": "Pristine means the exact same thing as unspoiled." Both pairs are now balanced!',
    spokenText:
      "Finally, Step 3! Let's plug the word pristine into our bridge sentence. Pristine means clean and pure. Which word means the exact same thing as pristine? ... Unspoiled! Tranquil is to calm, as pristine is to unspoiled. Nice! You nailed it.",
    spokenTextTaglish:
      "Finally, Step 3! Let's plug the word pristine into our bridge sentence. Pristine means clean and pure. Which word means the exact same thing as pristine? ... Unspoiled! Tranquil is to calm, as pristine is to unspoiled. Ayos! Nakuha mo!",
    keyTerms: ['pristine', 'unspoiled', 'balanced'],
    visualSyncStep: 2,
  },

  // --------------------------------------------------------------------------
  // TAB 3: PITFALLS & TIPS (Mistake vs. Correction with Two-Voice Contrast)
  // --------------------------------------------------------------------------
  {
    id: 'analogy-tips-1',
    moduleId: 'g7-q1-m1',
    tabId: 'tips',
    sectionTitle: 'Pitfall #1 · Never Flip the Direction!',
    speaker: 'kuya_lingo',
    prosodyRole: 'pitfall_wrong',
    displayText:
      'Common Mistake #1: "finger : hand :: tree : leaf" (Wrong). The first pair goes from Part to Whole, but the second pair flipped to Whole to Part!',
    spokenText:
      "Watch out for Trap Number One! Many students pick: finger is to hand, as tree is to leaf. Wait a second. Why is that wrong? ... Because a finger is a small part of a hand, so that's Part to Whole. Starting with tree flips it backward to Whole to Part!",
    spokenTextTaglish:
      "Watch out for Trap Number One! Many students pick: finger is to hand, as tree is to leaf. Teka muna. Why is that wrong? ... Because a finger is a small part of a hand, so that's Part to Whole. Starting with tree flips it baliskad to Whole to Part!",
    keyTerms: ['finger', 'hand', 'Part to Whole', 'Whole to Part'],
    visualSyncStep: 0,
  },
  {
    id: 'analogy-tips-2',
    moduleId: 'g7-q1-m1',
    tabId: 'tips',
    sectionTitle: 'Correction #1 · Keep Both Pairs Moving the Same Way',
    speaker: 'ate_lingo',
    prosodyRole: 'pitfall_right',
    displayText:
      'Verified Fix #1: "finger : hand :: leaf : tree" (Correct). Both pairs move from Part first to Whole second.',
    spokenText:
      "Here's how we fix it. Put the small part first on both sides! Finger is to hand, as leaf is to tree. Now both pairs move from Part to Whole. Always check your arrow direction before tapping submit!",
    spokenTextTaglish:
      "Here's how we fix it. Put the small part first on both sides! Finger is to hand, as leaf is to tree. Sakto! Now both pairs move from Part to Whole. Always check your arrow direction before tapping submit!",
    keyTerms: ['leaf', 'tree', 'direction', 'Part to Whole'],
    visualSyncStep: 0,
  },
  {
    id: 'analogy-tips-3',
    moduleId: 'g7-q1-m1',
    tabId: 'tips',
    sectionTitle: 'Pitfall #2 & #3 · Match Parts of Speech & Exact Relationships',
    speaker: 'ate_lingo',
    prosodyRole: 'rule',
    displayText:
      'Pro Tip: Match the part of speech (Noun with Noun, Adjective with Adjective) and never pick a word just because it sounds loosely related (like "lion : roar" when you need a location like "lion : forest").',
    spokenText:
      "Two more quick tips! First, match the grammar. If Pair One uses two adjectives, like courageous is to brave, Pair Two must also use two adjectives, like honest is to truthful. Second, don't get fooled by words that just sound related. Fish is to sea tells us where a fish lives, so lion is to forest, not roar!",
    spokenTextTaglish:
      "Two more quick tips! First, match the grammar. If Pair One uses two adjectives, like courageous is to brave, Pair Two must also use two adjectives, like honest is to truthful. Second, huwag malito sa words that just sound related. Fish is to sea tells us where a fish lives, so lion is to forest, not roar!",
    keyTerms: ['adjectives', 'grammar', 'location', 'forest'],
    visualSyncStep: 1,
  },

  // --------------------------------------------------------------------------
  // TAB 4: DAVAO ORIENTAL CONTEXT (Local Landmarks & Heritage Hotspots)
  // --------------------------------------------------------------------------
  {
    id: 'analogy-cultural-1',
    moduleId: 'g7-q1-m1',
    tabId: 'cultural',
    sectionTitle: 'Davao Oriental Explorer · Mount Hamiguitan & Pujada Bay',
    speaker: 'ate_lingo',
    prosodyRole: 'cultural_story',
    displayText:
      'Explore Davao Oriental through analogies! Philippine Eagle : Mount Hamiguitan :: Dugong : Pujada Bay (Location Analogy).',
    spokenText:
      "Let's bring analogies home to Davao Oriental! Tap the glowing pins on the island map above. Up on Mount Hamiguitan in San Isidro, the Philippine Eagle soars above ancient bonsai trees. Down in Mati City, gentle dugongs and pawikan swim in Pujada Bay. So we can say: Eagle is to Mount Hamiguitan, as dugong is to Pujada Bay!",
    spokenTextTaglish:
      "Let's bring analogies home to Davao Oriental! Tap the glowing pins on the island map above. Up on Mount Hamiguitan in San Isidro, the Philippine Eagle soars above ancient bonsai trees. Down in Mati City, gentle dugongs and pawikan swim in Pujada Bay. Garbo nato kini! Eagle is to Mount Hamiguitan, as dugong is to Pujada Bay!",
    keyTerms: ['Mount Hamiguitan', 'Philippine Eagle', 'Pujada Bay', 'pawikan'],
    visualSyncStep: 0,
  },
  {
    id: 'analogy-cultural-2',
    moduleId: 'g7-q1-m1',
    tabId: 'cultural',
    sectionTitle: 'Local Heritage · Dahican Beach, Aliwagwag Falls & Dagmay Weaving',
    speaker: 'kuya_lingo',
    prosodyRole: 'cultural_story',
    displayText:
      'Pygmy : Dwarf :: Ancient : Old (Synonyms on Mt. Hamiguitan) | Abaca Fiber : Dagmay Cloth :: Coral Polyp : Reef Sanctuary (Part to Whole).',
    spokenText:
      "Look at how our local culture fits every analogy rule. The pygmy bonsai trees on Mount Hamiguitan give us Synonyms: pygmy is to dwarf, as ancient is to old. And in Mandaya villages near Aliwagwag Falls in Cateel, a single abaca fiber is woven into sacred Dagmay cloth. Abaca fiber is to Dagmay cloth, as coral is to Pujada Reef!",
    spokenTextTaglish:
      "Look at how our local culture fits every analogy rule. The pygmy bonsai trees on Mount Hamiguitan give us Synonyms: pygmy is to dwarf, as ancient is to old. And in Mandaya villages near Aliwagwag Falls in Cateel, a single abaca fiber is woven into sacred Dagmay cloth. Chada kaayo, di ba?",
    keyTerms: ['pygmy', 'dwarf', 'Mandaya', 'Aliwagwag', 'Cateel', 'Dagmay'],
    visualSyncStep: 1,
  },

  // --------------------------------------------------------------------------
  // TAB 5: VOCABULARY BANK (Interactive Flip Cards & Pronunciation)
  // --------------------------------------------------------------------------
  {
    id: 'analogy-vocab-1',
    moduleId: 'g7-q1-m1',
    tabId: 'vocabulary',
    sectionTitle: 'Vocabulary Coach · Core Relationship Terms',
    speaker: 'ate_lingo',
    prosodyRole: 'vocab_card',
    displayText:
      'Key Terms: Analogy (a-nal-o-gy), Antonyms (an-to-nyms), Synonyms (syn-o-nyms), Tranquil (tran-quil), and Turbulent (tur-bu-lent).',
    spokenText:
      "Welcome to your Vocabulary Bank! Let's practice saying our key words clearly. Repeat after me: Analogy. ... Antonyms, which mean opposite words. ... Synonyms, which mean twin words. ... And listen to this opposite pair: Tranquil, meaning calm and peaceful, versus Turbulent, meaning rough and stormy. Tap any card below to flip it or hear its sentence!",
    spokenTextTaglish:
      "Welcome to your Vocabulary Bank! Sige, let's practice saying our key words clearly. Repeat after me: Analogy. ... Antonyms, or kasalungat. ... Synonyms, or kasingkahulugan. ... And listen to this opposite pair: Tranquil, meaning malinawon and calm, versus Turbulent, meaning rough and stormy. Tap any card below to flip it!",
    keyTerms: ['Analogy', 'Antonyms', 'Synonyms', 'Tranquil', 'Turbulent'],
  },

  // --------------------------------------------------------------------------
  // TAB 6: SELF-CHECK (Lightning Challenge & Mastery Rubric)
  // --------------------------------------------------------------------------
  {
    id: 'analogy-checklist-1',
    moduleId: 'g7-q1-m1',
    tabId: 'checklist',
    sectionTitle: 'Self-Check Coach · Ready for the Lightning Round?',
    speaker: 'ate_lingo',
    prosodyRole: 'question_reveal',
    displayText:
      'Test your speed in the 3-Question Lightning Challenge, then check off each mastery goal before starting the official Island Bridge Quiz!',
    spokenText:
      "You're almost at the bridge quiz! First, warm up with our three-question Lightning Challenge above. Remember the three steps: check the first pair, build your bridge sentence, and match the direction. Once you're confident, tick off the checklist boxes below. You've got this!",
    spokenTextTaglish:
      "Malapit ka na sa bridge quiz! First, warm up with our three-question Lightning Challenge above. Remember the three steps: check the first pair, build your bridge sentence, and match the direction. Once you're confident, tick off the checklist boxes below. Kayang-kaya mo 'to!",
    keyTerms: ['Lightning Challenge', 'first pair', 'bridge sentence', 'direction'],
  },

  // --------------------------------------------------------------------------
  // TAB 7: STUDY CHEATSHEET (4-Step Memory Map)
  // --------------------------------------------------------------------------
  {
    id: 'analogy-cheatsheet-1',
    moduleId: 'g7-q1-m1',
    tabId: 'cheatsheet',
    sectionTitle: 'Cheatsheet Recap · Your 30-Second Memory Trick',
    speaker: 'ate_lingo',
    prosodyRole: 'praise',
    displayText:
      'Quick Memory Recap: (:) = "is to" | (::) = "as" | S-ynonym = S-ame | A-ntonym = A-gainst/Opposite | Cause → Effect | Part → Whole | Object → Location.',
    spokenText:
      "Here is your final thirty-second cheatsheet before the quiz! Single colon means is to. Double colon means as. Remember the first letters: S in Synonym stands for Same! A in Antonym stands for Against, or opposite! Check whether one word causes the other, or is a part of the other. Now go restore that island bridge!",
    spokenTextTaglish:
      "Here is your final thirty-second cheatsheet before the quiz! Single colon means is to. Double colon means as. Timan-i ang unang letra: S in Synonym stands for Same! A in Antonym stands for Against, or opposite! Now tap Start Quiz and restore that island bridge! Bibo kaayo!",
    keyTerms: ['is to', 'as', 'Synonym', 'Same', 'Antonym', 'Opposite'],
    visualSyncStep: 0,
  },
];

// ============================================================================
// 3-Voice A/B/C Comparison Sample Scripts for the Analogy "Concepts & Rules" Tab
// Allows teachers, students, and reviewers to compare Candidate A, B, and C
// side by side on the exact same instructional passage.
// ============================================================================
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

export const ANALOGY_ABC_VOICE_SAMPLES: VoiceABCSample[] = [
  {
    personaId: 'ate_rosa_ph',
    title: 'Candidate A · Ate Rosa (en-PH Philippine English Neural)',
    subtitle: 'Warm, patient Filipina older-sister tutor with crisp pauses and natural Davao Oriental pronunciation',
    badge: 'Recommended Default',
    displayText:
      'Welcome to San Victor Island! When you see "Night : Day :: Happy : Sad", read it as: "Night is to Day, as Happy is to Sad." Notice the pattern? Night and Day are opposites—so we need an Antonym!',
    spokenText:
      "Welcome to San Victor Island! Let's look at this puzzle together. When you see Night : Day :: Happy : Sad, here's how we read it out loud: Night is to Day, as Happy is to Sad. Notice the pattern? ... Night and Day are opposites! That means our bridge relationship is Antonyms.",
    ssmlPreview: buildSegmentSSML({
      spokenText:
        "Welcome to San Victor Island! Let's look at this puzzle together. When you see Night is to Day, as Happy is to Sad, notice the pattern? ... Night and Day are opposites! That means our bridge relationship is Antonyms.",
      role: 'intro',
      keyTerms: ['San Victor Island', 'is to', 'as', 'opposites', 'Antonyms'],
      personaId: 'ate_rosa_ph',
    }),
    keyTerms: ['San Victor Island', 'Night', 'Day', 'Happy', 'Sad', 'opposites', 'Antonyms'],
  },
  {
    personaId: 'ate_lingo_expressive',
    title: 'Candidate B · Ate Lingo Storyteller (Expressive Quest Guide)',
    subtitle: 'Upbeat, story-driven instructional guide with lively energy and local Mindanao warmth',
    badge: 'Expressive Storyteller',
    displayText:
      'Ready to build the bridge across Pujada Bay? Think of "Cold : Shiver :: Hot : Sweat" like dominoes! Cold weather makes you shiver, just like a sunny day at Dahican Beach makes you sweat!',
    spokenText:
      "Ready to build the bridge across Pujada Bay? Here's a fun way to spot Cause and Effect! Picture a row of dominoes. Cold mountain air on Mount Hamiguitan makes you shiver, right? ... Just like a bright sunny afternoon at Dahican Beach makes you sweat! One action triggers the next.",
    ssmlPreview: buildSegmentSSML({
      spokenText:
        "Ready to build the bridge across Pujada Bay? Here's a fun way to spot Cause and Effect! Picture a row of dominoes. Cold mountain air on Mount Hamiguitan makes you shiver, right? ... Just like a bright sunny afternoon at Dahican Beach makes you sweat!",
      role: 'question_reveal',
      keyTerms: ['Pujada Bay', 'Cause and Effect', 'Mount Hamiguitan', 'Dahican Beach'],
      personaId: 'ate_lingo_expressive',
    }),
    keyTerms: ['Pujada Bay', 'Cause and Effect', 'dominoes', 'Mount Hamiguitan', 'Dahican Beach'],
  },
  {
    personaId: 'kuya_james_ph',
    title: 'Candidate C · Kuya James (en-PH Calm Step-by-Step Coach)',
    subtitle: 'Steady, reassuring Filipino Kuya voice; also serves as Voice #2 in Pitfalls & Dialogue',
    badge: 'Co-Host / Kuya Coach',
    displayText:
      'Here is Kuya’s 3-Step Bridge Trick: First, cover the answer choices. Second, build a short sentence connecting Pair 1. Third, test which choice fits the exact same sentence for Pair 2.',
    spokenText:
      "Alright, Kuya James here. Whenever an analogy looks tricky, don't rush. Try this three-step bridge trick. First, cover the choices so they don't distract you. Second, make a short sentence for the first pair, like: a plank is a part of a bridge. Third, plug the second pair into that exact same sentence!",
    ssmlPreview: buildSegmentSSML({
      spokenText:
        "Alright, Kuya James here. Whenever an analogy looks tricky, don't rush. Try this three-step bridge trick. First, cover the choices so they don't distract you. Second, make a short sentence for the first pair, like: a plank is a part of a bridge. Third, plug the second pair into that exact same sentence!",
      role: 'rule',
      keyTerms: ['three-step', 'first pair', 'plank', 'bridge', 'second pair'],
      personaId: 'kuya_james_ph',
    }),
    keyTerms: ['tricky', 'three-step', 'first pair', 'plank', 'bridge', 'second pair'],
  },
];

// ============================================================================
// Conversational Spoken-Style Generator for ALL Curriculum Modules (Grades 7–10)
// Transforms formal textbook lessonContent into warm, short-sentence, ear-friendly
// spoken segments across all 7 tabs so every module in LingoQuest has human-like
// Ate/Kuya tutoring.
// ============================================================================

/**
 * Breaks a long textbook paragraph into short, conversational sentences (8–18 words)
 * and expands formal symbols/abbreviations for speech.
 */
function toConversationalSpokenSentences(rawParagraph: string, opener: string, closer?: string): string {
  const clean = normalizeTextForSpeech(rawParagraph)
    .replace(/\bTherefore,\b/gi, 'So,')
    .replace(/\bFurthermore,\b/gi, 'Plus,')
    .replace(/\bAdditionally,\b/gi, 'Also,')
    .replace(/\bIn addition,\b/gi, 'And')
    .replace(/\bConsequently,\b/gi, 'Because of that,')
    .replace(/\bFor instance,\b/gi, 'For example,')
    .replace(/\bUtilize\b/gi, 'use')
    .replace(/\bDemonstrate\b/gi, 'show')
    .replace(/\bIdentify\b/gi, 'spot')
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bdoes not\b/gi, "doesn't")
    .replace(/\bit is\b/gi, "it's")
    .replace(/\byou will\b/gi, "you'll")
    .replace(/\blet us\b/gi, "let's")
    .replace(/\bthat is\b/gi, "that's");

  const parts = [opener.trim(), clean.trim()];
  if (closer) parts.push(closer.trim());
  return parts.filter(Boolean).join(' ');
}

export function getModuleSpokenSegments(
  module: Module,
  tabFilter?: LessonTabId
): SpokenSegment[] {
  // Use the hand-crafted Analogy reference script for g7-q1-m1 or Analogy modules
  const isAnalogyModule =
    module.id === 'g7-q1-m1' || module.title.toLowerCase().includes('analogy');

  if (isAnalogyModule && module.id === 'g7-q1-m1') {
    return tabFilter
      ? ANALOGY_SPOKEN_SEGMENTS.filter((s) => s.tabId === tabFilter)
      : ANALOGY_SPOKEN_SEGMENTS;
  }

  const { lessonContent } = module;
  const rules = lessonContent.keyRules || [];
  const examples = lessonContent.examples || [];
  const vocab = lessonContent.vocabularyGlossary || [];
  const mistakes = lessonContent.commonMistakesAndTips || [];

  // Extract 4-6 key terms from title and rules
  const baseKeyTerms = [
    ...module.title
      .split(/[\s:—–-]+/)
      .map((w) => w.replace(/[^a-zA-Z]/g, ''))
      .filter((w) => w.length >= 4),
    'Davao Oriental',
    'Mati',
    'Mount Hamiguitan',
  ].slice(0, 6);

  const segments: SpokenSegment[] = [
    // TAB 1: CONCEPTS & RULES
    {
      id: `${module.id}-concepts-1`,
      moduleId: module.id,
      tabId: 'concepts',
      sectionTitle: `Explainer Part 1 · Welcome to ${module.title}`,
      speaker: 'ate_lingo',
      prosodyRole: 'intro',
      displayText: `Welcome to Grade ${module.gradeLevel}, Module ${module.moduleNumber}: ${module.title}. ${lessonContent.overview}`,
      spokenText: toConversationalSpokenSentences(
        lessonContent.overview,
        `Hi there! Ate Rosa here. Welcome to Grade ${module.gradeLevel}, Module ${module.moduleNumber}: ${module.title}. Let's break down the big idea together.`,
        `Notice how this works in everyday English? Let's look at the key rules next!`
      ),
      spokenTextTaglish: toConversationalSpokenSentences(
        lessonContent.overview,
        `Maayong adlaw! Ate Rosa here. Welcome to Grade ${module.gradeLevel}, Module ${module.moduleNumber}: ${module.title}. Sige, let's break down the big idea together.`,
        `Madali lang, right? Let's look at the key rules next!`
      ),
      keyTerms: baseKeyTerms,
      visualSyncStep: 0,
    },
    ...rules.slice(0, 3).map((rule, idx): SpokenSegment => {
      const colonIdx = rule.indexOf(':');
      const ruleTitle = colonIdx > 0 ? rule.slice(0, colonIdx).trim() : `Rule ${idx + 1}`;
      const ruleBody = colonIdx > 0 ? rule.slice(colonIdx + 1).trim() : rule;
      return {
        id: `${module.id}-concepts-rule-${idx + 1}`,
        moduleId: module.id,
        tabId: 'concepts',
        sectionTitle: `Rule 0${idx + 1} · ${ruleTitle}`,
        speaker: idx % 2 === 0 ? 'ate_lingo' : 'kuya_lingo',
        prosodyRole: 'rule',
        displayText: `Rule 0${idx + 1} (${ruleTitle}): ${ruleBody}`,
        spokenText: toConversationalSpokenSentences(
          ruleBody,
          `Here's Rule Number ${idx + 1}: ${ruleTitle}.`,
          idx === 0
            ? `Keep an eye on that signal word whenever you read a question!`
            : `Nice! You're getting the hang of this pattern.`
        ),
        spokenTextTaglish: toConversationalSpokenSentences(
          ruleBody,
          `Timan-i ang Rule Number ${idx + 1}: ${ruleTitle}.`,
          `Ayos! That makes spotting the right answer much faster.`
        ),
        keyTerms: [...baseKeyTerms, ruleTitle],
        visualSyncStep: idx + 1,
      };
    }),
    {
      id: `${module.id}-concepts-warmup`,
      moduleId: module.id,
      tabId: 'concepts',
      sectionTitle: `Diagnostic Warm-Up & Interactive Bridge`,
      speaker: 'ate_lingo',
      prosodyRole: 'question_reveal',
      displayText: `Warm-Up Question: ${lessonContent.warmupQuestion.question}`,
      spokenText: toConversationalSpokenSentences(
        lessonContent.warmupQuestion.question,
        `Ready for a quick warm-up? Let's try this question together:`,
        `Pause and think for a second. ... Check the signal clues, then tap your answer on the right!`
      ),
      spokenTextTaglish: toConversationalSpokenSentences(
        lessonContent.warmupQuestion.question,
        `Sige, ready for a quick warm-up? Let's try this question together:`,
        `Pause and think for a second. ... Check the signal clues, then tap your answer on the right!`
      ),
      keyTerms: baseKeyTerms,
      visualSyncStep: 3,
    },

    // TAB 2: GUIDED ANALYSIS
    ...examples.slice(0, 2).map((ex, idx): SpokenSegment => ({
      id: `${module.id}-examples-${idx + 1}`,
      moduleId: module.id,
      tabId: 'examples',
      sectionTitle: `Guided Walkthrough 0${idx + 1} · ${ex.title}`,
      speaker: idx === 0 ? 'ate_lingo' : 'kuya_lingo',
      prosodyRole: 'example',
      displayText: `Model Example 0${idx + 1} (${ex.title}): "${ex.example}" — ${ex.analysis}`,
      spokenText: toConversationalSpokenSentences(
        `Listen to the model sentence: ${ex.example}. Now, why does this work? ... ${ex.analysis}`,
        `Let's walk through Model Example ${idx + 1}, ${ex.title}.`,
        `See how the clues fit together?`
      ),
      spokenTextTaglish: toConversationalSpokenSentences(
        `Listen to the model sentence: ${ex.example}. Now, why does this work? ... ${ex.analysis}`,
        `Tara, let's walk through Model Example ${idx + 1}, ${ex.title}.`,
        `Kitang-kita ang clue, di ba?`
      ),
      keyTerms: [...baseKeyTerms, ex.title],
      visualSyncStep: idx,
    })),

    // TAB 3: PITFALLS & TIPS
    {
      id: `${module.id}-tips-1`,
      moduleId: module.id,
      tabId: 'tips',
      sectionTitle: `Common Pitfall vs. Verified Fix`,
      speaker: 'kuya_lingo',
      prosodyRole: 'pitfall_wrong',
      displayText:
        mistakes[0]
          ? `Pitfall: ${mistakes[0].mistake} → Correction: ${mistakes[0].correction}`
          : `Avoid guessing from a single familiar word. Always check the full sentence structure and relationship.`,
      spokenText: mistakes[0]
        ? toConversationalSpokenSentences(
            `Watch out for this common mistake: ${mistakes[0].mistake}. Why is that a trap? ... ${mistakes[0].why}. Instead, here's the smart fix: ${mistakes[0].correction}`,
            `Kuya James here! Let's make sure you don't fall into the most common quiz trap.`
          )
        : `Kuya James here! Don't rush and pick an option just because one word looks familiar. Pause, read the whole sentence out loud in your head, and test if your choice keeps the grammar balanced!`,
      spokenTextTaglish: mistakes[0]
        ? toConversationalSpokenSentences(
            `Watch out for this common mistake: ${mistakes[0].mistake}. Why is that a trap? ... ${mistakes[0].why}. Instead, heto ang tamang diskarte: ${mistakes[0].correction}`,
            `Kuya James here! Let's make sure you don't fall into the most common quiz trap.`
          )
        : `Kuya James here! Huwag magmadali sa pagpili. Pause, read the whole sentence out loud in your head, and test if your choice keeps the grammar balanced!`,
      keyTerms: baseKeyTerms,
      visualSyncStep: 0,
    },

    // TAB 4: DAVAO ORIENTAL CONTEXT
    {
      id: `${module.id}-cultural-1`,
      moduleId: module.id,
      tabId: 'cultural',
      sectionTitle: `Davao Oriental Heritage Connection`,
      speaker: 'ate_lingo',
      prosodyRole: 'cultural_story',
      displayText: lessonContent.culturalConnection,
      spokenText: toConversationalSpokenSentences(
        lessonContent.culturalConnection,
        `Now let's connect this lesson to our home in Davao Oriental! From Mount Hamiguitan and Pujada Bay to Dahican Beach and Aliwagwag Falls, English helps us share our story.`,
        `Tap each glowing hotspot pin on the scene above to explore local examples!`
      ),
      spokenTextTaglish: toConversationalSpokenSentences(
        lessonContent.culturalConnection,
        `Now let's connect this lesson to our home in Davao Oriental! Garbo nato ang Mount Hamiguitan, Pujada Bay, Dahican Beach, ug Aliwagwag Falls.`,
        `Tap each glowing hotspot pin on the scene above to explore local examples!`
      ),
      keyTerms: ['Davao Oriental', 'Mount Hamiguitan', 'Pujada Bay', 'Dahican', 'Aliwagwag'],
      visualSyncStep: 0,
    },

    // TAB 5: VOCABULARY BANK
    {
      id: `${module.id}-vocabulary-1`,
      moduleId: module.id,
      tabId: 'vocabulary',
      sectionTitle: `Vocabulary Bank Pronunciation Guide`,
      speaker: 'ate_lingo',
      prosodyRole: 'vocab_card',
      displayText:
        vocab.length > 0
          ? `Key Vocabulary: ${vocab.map((v) => `${v.term} (${v.definition})`).join(' · ')}`
          : `Practice flipping each vocabulary card and tapping Speak to hear the word, definition, and Davao Oriental sentence.`,
      spokenText:
        vocab.length > 0
          ? toConversationalSpokenSentences(
              vocab
                .slice(0, 3)
                .map((v) => `${v.term}, which means ${v.definition}. For example: ${v.exampleSentence}`)
                .join(' ... Next word: '),
              `Let's practice our key vocabulary words for ${module.title}. Listen closely to the stress and rhythm:`
            )
          : `Welcome to the Vocabulary Bank! Tap any card below to flip it over, or tap the Speak button on each card to hear its pronunciation and local example sentence.`,
      keyTerms: vocab.map((v) => v.term).concat(baseKeyTerms),
    },

    // TAB 6: SELF-CHECK
    {
      id: `${module.id}-checklist-1`,
      moduleId: module.id,
      tabId: 'checklist',
      sectionTitle: `Self-Check Lightning Coach`,
      speaker: 'ate_lingo',
      prosodyRole: 'question_reveal',
      displayText: `Complete the rapid Self-Check challenge and verify your mastery checklist before starting the Island Bridge Quiz.`,
      spokenText: `Alright! You've explored the rules, the guided walkthrough, and our Davao Oriental examples. Now test your reflex in the rapid Self-Check game above! Once you score and check off your goals, you're 100 percent ready for the quiz.`,
      spokenTextTaglish: `Ayos! You've explored the rules, the guided walkthrough, and our Davao Oriental examples. Sige, test your reflex in the rapid Self-Check game above! Once you check off your goals, ready ka na sa quiz!`,
      keyTerms: ['Self-Check', 'rules', 'quiz'],
    },

    // TAB 7: STUDY CHEATSHEET
    {
      id: `${module.id}-cheatsheet-1`,
      moduleId: module.id,
      tabId: 'cheatsheet',
      sectionTitle: `Quick Study Cheatsheet Recap`,
      speaker: 'ate_lingo',
      prosodyRole: 'praise',
      displayText: `Summary for ${module.title}: ${rules.slice(0, 2).join(' | ')}`,
      spokenText: toConversationalSpokenSentences(
        rules.slice(0, 2).join('. Second: '),
        `Here's your quick thirty-second recap for ${module.title} before you jump into the quiz! First:`,
        `You've got this! Tap Complete and Start Quiz whenever you're ready.`
      ),
      spokenTextTaglish: toConversationalSpokenSentences(
        rules.slice(0, 2).join('. Second: '),
        `Heto na ang quick thirty-second recap for ${module.title} before you jump into the quiz! First:`,
        `Kaya mo 'yan! Tap Complete and Start Quiz whenever you're ready!`
      ),
      keyTerms: baseKeyTerms,
      visualSyncStep: 0,
    },
  ];

  return tabFilter ? segments.filter((s) => s.tabId === tabFilter) : segments;
}
