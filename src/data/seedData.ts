import type {
  AdminAccount,
  AuditLogEntry,
  BadgeDefinition,
  DifficultyLevel,
  GradeLevel,
  Module,
  PictureOption,
  QuarterNumber,
  QuizQuestion,
  StudentAccount,
  TeacherAccount,
  TopicType,
} from '../types/lingoquest.ts';
import { ALL_GRADE_7_MODULES } from './curriculum/grade7.ts';
import { ALL_GRADE_8_MODULES } from './curriculum/grade8.ts';
import { ALL_GRADE_9_MODULES } from './curriculum/grade9.ts';
import { ALL_GRADE_10_MODULES } from './curriculum/grade10.ts';
import { expandModuleTo25Questions } from './curriculum/curriculumBuilder.ts';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_lesson',
    name: 'Scroll Seeker',
    description: 'Completed your first interactive English lesson module.',
    category: 'lesson',
    iconType: 'scroll',
    pointsBonus: 50,
  },
  {
    id: 'first_quiz_pass',
    name: 'Quiz Voyager',
    description: 'Passed your first gamified module quiz with 75% or higher.',
    category: 'quiz',
    iconType: 'compass',
    pointsBonus: 100,
  },
  {
    id: 'bridge_builder_1',
    name: 'Bridge Restorer',
    description: 'Restored your first broken island bridge to unlock the next module.',
    category: 'bridge',
    iconType: 'bridge',
    pointsBonus: 120,
  },
  {
    id: 'quarter_champion',
    name: 'Pujada Bay Guardian',
    description: 'Restored all 4 module bridges across an entire Quarter Island.',
    category: 'bridge',
    iconType: 'crown',
    pointsBonus: 300,
  },
  {
    id: 'hard_mode_ace',
    name: 'Storm Conqueror',
    description: 'Passed a module quiz on Hard difficulty (20s per question).',
    category: 'quiz',
    iconType: 'lightning',
    pointsBonus: 200,
  },
  {
    id: 'perfect_score',
    name: 'Flawless Scholar',
    description: 'Achieved a perfect 100% score on any module quiz.',
    category: 'quiz',
    iconType: 'star',
    pointsBonus: 150,
  },
  {
    id: 'points_1000',
    name: 'Rising Star of Mati',
    description: 'Accumulated 1,000+ total points in LingoQuest.',
    category: 'milestone',
    iconType: 'trophy',
    pointsBonus: 100,
  },
  {
    id: 'points_2500',
    name: 'Davao Oriental Laureate',
    description: 'Accumulated 2,500+ total points across islands and quests.',
    category: 'milestone',
    iconType: 'shield',
    pointsBonus: 250,
  },
  {
    id: 'ai_writer',
    name: 'Scribe of Hamiguitan',
    description: 'Completed a written-response activity with AI Grammar & Writing Feedback.',
    category: 'writing',
    iconType: 'feather',
    pointsBonus: 100,
  },
  {
    id: 'poly_grade_explorer',
    name: 'Archipelago Explorer',
    description: 'Used Personalization mode to practice a module from another grade level.',
    category: 'milestone',
    iconType: 'globe',
    pointsBonus: 125,
  },
  {
    id: 'visual_learner',
    name: 'Visual Learner',
    description: 'Completed interactive visual diagrams, flip cards, or mini-games inside a module lesson.',
    category: 'lesson',
    iconType: 'star',
    pointsBonus: 75,
  },
  {
    id: 'explainer_explorer',
    name: 'Explainer Explorer',
    description: 'Watched a 60-second animated lesson explainer and explored Davao Oriental cultural hotspots.',
    category: 'lesson',
    iconType: 'compass',
    pointsBonus: 100,
  },
];

const STANDARD_PICTURE_SETS: Record<string, PictureOption[]> = {
  resilience: [
    {
      id: 'pic-lighthouse',
      sceneId: 'lighthouse_storm',
      label: 'Steadfast Beacon',
      caption: 'A lighthouse standing firm against a coastal storm',
    },
    {
      id: 'pic-scroll',
      sceneId: 'ancient_scroll',
      label: 'Ancient Manuscript',
      caption: 'A parchment scroll with a quill pen',
    },
    {
      id: 'pic-microscope',
      sceneId: 'science_microscope',
      label: 'Lab Analysis',
      caption: 'A microscope and research flask',
    },
    {
      id: 'pic-hourglass',
      sceneId: 'hourglass_time',
      label: 'Fleeting Sands',
      caption: 'An hourglass measuring time',
    },
  ],
  bridge_connection: [
    {
      id: 'pic-bridge',
      sceneId: 'bamboo_bridge',
      label: 'Cohesive Link',
      caption: 'A suspension bridge joining two riverbanks together',
    },
    {
      id: 'pic-campfire',
      sceneId: 'mountain_campfire',
      label: 'Night Campfire',
      caption: 'Logs burning warmly under the stars',
    },
    {
      id: 'pic-eagle',
      sceneId: 'philippine_eagle',
      label: 'High Flight',
      caption: 'A Philippine Eagle soaring over peaks',
    },
    {
      id: 'pic-megaphone',
      sceneId: 'megaphone_speech',
      label: 'Public Broadcast',
      caption: 'A loud orange megaphone projecting sound',
    },
  ],
  context_detective: [
    {
      id: 'pic-magnifier',
      sceneId: 'magnifying_clue',
      label: 'Context Sleuth',
      caption: 'A magnifying glass examining surrounding clues in a text',
    },
    {
      id: 'pic-vinta',
      sceneId: 'fishing_vinta',
      label: 'Coastal Vinta',
      caption: 'A colorful sailboat gliding on the sea',
    },
    {
      id: 'pic-dancers',
      sceneId: 'festival_dancers',
      label: 'Fiesta Dance',
      caption: 'Performers celebrating under festival banners',
    },
    {
      id: 'pic-mangroves',
      sceneId: 'planting_mangroves',
      label: 'Mangrove Roots',
      caption: 'Coastal trees protecting the shoreline',
    },
  ],
  parallel_balance: [
    {
      id: 'pic-scales',
      sceneId: 'scales_justice',
      label: 'Balanced Structure',
      caption: 'Golden scales with equal grammatical weight on both sides',
    },
    {
      id: 'pic-compass',
      sceneId: 'compass_voyage',
      label: 'Cardinal Compass',
      caption: 'A navigation compass pointing north',
    },
    {
      id: 'pic-scholar',
      sceneId: 'library_scholar',
      label: 'Reference Tome',
      caption: 'Open study books and reading spectacles',
    },
    {
      id: 'pic-handshake',
      sceneId: 'handshake_harmony',
      label: 'Mutual Accord',
      caption: 'Two hands clasping in agreement',
    },
  ],
};

// Detailed Grade 8 Quarter 1 Modules
const GRADE_8_Q1_MODULES: Module[] = [
  {
    id: 'g8-q1-m1',
    gradeLevel: 8,
    quarter: 1,
    moduleNumber: 1,
    quarterModuleIndex: 1,
    islandName: 'San Victor Island',
    islandThemeColor: '#0284C7',
    title: 'Context Clues & Idiomatic Expressions',
    topicType: 'vocabulary',
    requiredPassingScore: 75,
    lessonContent: {
      overview:
        'When reading unfamiliar texts, skilled readers act like detectives. Instead of stopping at every unfamiliar word, you can unlock its meaning using Context Clues—words, phrases, or sentences surrounding the unknown word that provide hints about its definition.',
      melcCompetency:
        'EN8V-Ia-10.2: Determine the meaning of words and expressions that reflect the local culture by noting context clues.',
      keyRules: [
        'Definition / Restatement Clue: The meaning is directly explained in the sentence using signals like "is defined as," "means," or commas/dashes.',
        'Synonym Clue: A nearby word or phrase shares the same or nearly the same meaning as the unfamiliar word.',
        'Antonym / Contrast Clue: Opposite meanings are signaled by words like "however," "unlike," "but," "although," or "on the other hand."',
        'Inference / Example Clue: Specific examples ("such as," "including," "for instance") help you deduce the general meaning.',
      ],
      examples: [
        {
          title: 'Antonym / Contrast Clue',
          example:
            'While the waters inside Pujada Bay are tranquil and mirror-like at dawn, the open Pacific beyond the reef can be turbulent.',
          analysis:
            'The contrast signal "While" pairs "tranquil" (calm) against "turbulent," telling us that turbulent means rough, agitated, or stormy.',
        },
        {
          title: 'Definition / Appositive Clue',
          example:
            'The elders practiced bayanihan, a communal spirit of unity and cooperative assistance, when rebuilding the school footbridge.',
          analysis:
            'The phrase set off by commas directly defines "bayanihan" as communal unity and mutual help.',
        },
        {
          title: 'Idiomatic Expression in Context',
          example:
            'After studying her English modules every evening, Maria passed the division quiz with flying colors.',
          analysis:
            'The idiom "with flying colors" does not mean literal paint; the context of diligent study shows it means with high distinction and success.',
        },
      ],
      culturalConnection:
        'In Davao Oriental, coastal communities around Pujada Bay read the sky and sea currents as natural context clues before setting sail—just as readers scan surrounding phrases to navigate new vocabulary.',
      warmupQuestion: {
        question:
          'In the sentence "The ancient balete tree remained resilient, standing tall and unbroken despite the fierce typhoon winds," what does RESILIENT mean?',
        options: [
          'Fragile and easily snapped',
          'Able to withstand or recover quickly from difficult conditions',
          'Hidden beneath the ocean waves',
          'Temporary and short-lived',
        ],
        correctAnswer: 'Able to withstand or recover quickly from difficult conditions',
        feedback:
          'Spot on! The phrase "standing tall and unbroken despite the fierce typhoon winds" gives a direct inference clue for resilient.',
      },
      writingPrompt: {
        title: 'Using Context Clues in Your Own Sentence',
        instructions:
          'Write 2 to 3 sentences describing a place in Davao Oriental (such as Pujada Bay or Mount Hamiguitan) using at least one challenging vocabulary word (like "pristine," "biodiverse," or "resilient") and include a clear context clue for your reader.',
        sampleStarter:
          'The coastal waters of Pujada Bay remain pristine—completely clean, unspoiled, and free from pollution—because the local community protects the marine sanctuary.',
      },
    },
    quizQuestions: [
      {
        id: 'g8-q1-m1-e1',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt:
          'Type the vocabulary word that means "calm, peaceful, and free from disturbance" (8 letters).',
        contextSentence: 'At sunrise, the lagoon was so ________ that we could see the coral reef clearly below.',
        hint: 'Starts with T R A N...',
        answer: 'tranquil',
        explanation: '"Tranquil" means calm, serene, and undisturbed, matching the clear mirror-like lagoon.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m1-e2',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt:
          'Which illustration best represents a reader acting as a "Context Sleuth" by examining surrounding text for clues?',
        pictureOptions: STANDARD_PICTURE_SETS.context_detective,
        answer: 'pic-magnifier',
        explanation:
          'Inspecting surrounding words with a magnifying lens symbolizes searching for context clues in a passage.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m1-e3',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: 'Select the missing contrast signal word to complete the sentence:',
        contextSentence:
          '________ her younger brother was timid on stage, Althea spoke with remarkable confidence during the declamation contest.',
        options: ['Although', 'Because', 'Therefore', 'Furthermore'],
        answer: 'Although',
        explanation:
          '"Although" introduces a contrast clue between "timid" and "remarkable confidence."',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m1-e4',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: 'Complete the synonym analogy based on context vocabulary:',
        analogyPair: {
          firstA: 'Pristine',
          firstB: 'Unspoiled',
          secondC: 'Resilient',
          relationshipType: 'Synonym Relationship',
        },
        options: ['Tough / Enduring', 'Fragile', 'Exhausted', 'Invisible'],
        answer: 'Tough / Enduring',
        explanation:
          'Just as "pristine" and "unspoiled" are synonyms, "resilient" and "tough / enduring" share the same meaning.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m1-e5',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: 'Solve the crossword: 8-letter vocabulary word meaning calm, serene, and undisturbed:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 8,
          cluePrompt: 'Calm, peaceful, and free from disturbance',
          letterGrid: [
            { index: 0, letter: 'T', isGiven: true },
            { index: 2, letter: 'A', isGiven: true },
            { index: 7, letter: 'L', isGiven: true },
          ],
        },
        options: ['TRANQUIL', 'TURBULENT', 'PRISTINE', 'RESILIENT'],
        answer: 'TRANQUIL',
        explanation: 'TRANQUIL means calm, quiet, and serene.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m1-m1',
        type: 'typeHunter',
        difficulty: 'moderate',
        prompt:
          'Type the 9-letter word meaning "abundant, plentiful, or existing in large quantities" (Clue: Opposite of scarce).',
        contextSentence:
          'Unlike the arid desert where water is scarce, the tropical rainforest has ________ rainfall year-round.',
        hint: 'Starts with P L E N...',
        answer: 'plentiful',
        explanation:
          'The antonym clue "Unlike... where water is scarce" points directly to "plentiful."',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m1-m2',
        type: 'pictureHunt',
        difficulty: 'moderate',
        prompt:
          'Read the idiom: "Even when the storm raged, the coast guard stood like a beacon of hope." Which image matches this figurative meaning?',
        pictureOptions: STANDARD_PICTURE_SETS.resilience,
        answer: 'pic-lighthouse',
        explanation:
          'A lighthouse shining through a storm is the literal and figurative visual for a steadfast "beacon of hope."',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m1-m3',
        type: 'missingPiece',
        difficulty: 'moderate',
        prompt:
          'Choose the word that fits the context clue of examples ("such as eagles, tarsiers, and pitcher plants"):',
        contextSentence:
          'Mount Hamiguitan is renowned for its ________ wildlife, including rare species found nowhere else on Earth.',
        options: ['endemic', 'artificial', 'monotonous', 'obsolete'],
        answer: 'endemic',
        explanation:
          '"Endemic" means native and restricted to a specific place, which is defined by the clue "found nowhere else on Earth."',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m1-m4',
        type: 'analogyMaster',
        difficulty: 'moderate',
        prompt: 'Complete the idiom-to-meaning analogy:',
        analogyPair: {
          firstA: 'Burn the midnight oil',
          firstB: 'Study late into the night',
          secondC: 'Break the ice',
          relationshipType: 'Idiom to Literal Meaning',
        },
        options: [
          'Start a friendly conversation',
          'Freeze water in winter',
          'Cancel an important meeting',
          'Argue with a classmate',
        ],
        answer: 'Start a friendly conversation',
        explanation:
          'The idiom "break the ice" means to relieve tension and initiate friendly conversation in a group.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m1-m5',
        type: 'crosswordGame',
        difficulty: 'moderate',
        prompt: 'Solve the crossword: 9-letter word meaning able to withstand or recover quickly from difficult conditions:',
        crosswordClue: {
          direction: 'DOWN',
          clueNumber: 2,
          wordLength: 9,
          cluePrompt: 'Strong, enduring, and able to bounce back from adversity',
          letterGrid: [
            { index: 0, letter: 'R', isGiven: true },
            { index: 3, letter: 'I', isGiven: true },
            { index: 8, letter: 'T', isGiven: true },
          ],
        },
        options: ['RESILIENT', 'OBSTINATE', 'REDUNDANT', 'EXHAUSTED'],
        answer: 'RESILIENT',
        explanation: 'RESILIENT means recovering readily from adversity or shock.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m1-h1',
        type: 'typeHunter',
        difficulty: 'hard',
        prompt:
          'Type the 10-letter word meaning "everywhere; appearing or found everywhere at the same time" (Starts with U).',
        contextSentence:
          'Smartphones have become ________ in modern classrooms, seen in nearly every hallway and study corner.',
        hint: 'Starts with U B I Q...',
        answer: 'ubiquitous',
        explanation:
          '"Ubiquitous" means present, appearing, or found everywhere, supported by the clue "seen in nearly every hallway."',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m1-h2',
        type: 'pictureHunt',
        difficulty: 'hard',
        prompt:
          'Which visual scene represents the word "AMELIORATE" (to make a divided situation better through cooperative harmony)?',
        pictureOptions: STANDARD_PICTURE_SETS.parallel_balance,
        answer: 'pic-handshake',
        explanation:
          'Cooperative agreement and harmony illustrate improving or ameliorating a conflict.',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m1-h3',
        type: 'missingPiece',
        difficulty: 'hard',
        prompt: 'Select the precise academic word that completes the contrast sentence:',
        contextSentence:
          'Whereas the first speaker gave a verbose, rambling two-hour lecture, the student council president delivered a ________ three-minute address.',
        options: ['succinct', 'redundant', 'ambiguous', 'lethargic'],
        answer: 'succinct',
        explanation:
          '"Whereas" signals an antonym for "verbose, rambling two-hour lecture." "Succinct" means brief and clearly expressed.',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m1-h4',
        type: 'analogyMaster',
        difficulty: 'hard',
        prompt: 'Solve the antonym relationship analogy:',
        analogyPair: {
          firstA: 'Ephemeral',
          firstB: 'Permanent',
          secondC: 'Meticulous',
          relationshipType: 'Antonym Relationship',
        },
        options: ['Careless', 'Precise', 'Generous', 'Courteous'],
        answer: 'Careless',
        explanation:
          '"Ephemeral" (short-lived) is the opposite of "Permanent." "Meticulous" (extremely careful) is the opposite of "Careless."',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m1-h5',
        type: 'crosswordGame',
        difficulty: 'hard',
        prompt: 'Solve the crossword: 8-letter vocabulary word meaning brief, concise, and clearly expressed:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 3,
          wordLength: 8,
          cluePrompt: 'Briefly and clearly expressed (compact discourse)',
          letterGrid: [
            { index: 0, letter: 'S', isGiven: true },
            { index: 3, letter: 'C', isGiven: true },
            { index: 7, letter: 'T', isGiven: true },
          ],
        },
        options: ['SUCCINCT', 'REDUNDANT', 'EXHAUSTED', 'EPHEMERAL'],
        answer: 'SUCCINCT',
        explanation: 'SUCCINCT means briefly and clearly expressed without wasted words.',
        timeLimitSeconds: 20,
      },
    ],
  },
  {
    id: 'g8-q1-m2',
    gradeLevel: 8,
    quarter: 1,
    moduleNumber: 2,
    quarterModuleIndex: 2,
    islandName: 'San Victor Island',
    islandThemeColor: '#0284C7',
    title: 'Modal Verbs, Nouns & Adverbs in Discourse',
    topicType: 'grammar',
    requiredPassingScore: 75,
    lessonContent: {
      overview:
        'Modals are special auxiliary words that express a speaker’s attitude toward an action: whether it is a necessity, obligation, permission, possibility, or certainty. In Grade 8 English, we use modal verbs, modal nouns, and modal adverbs to communicate politely and persuasively.',
      melcCompetency:
        'EN8G-IIIa-3.6: Use modal verbs, nouns, and adverbs appropriately in sentences and paragraphs.',
      keyRules: [
        'Modal Verbs (can, could, may, might, must, shall, should, will, would) are always followed by the base form of the main verb (e.g., "must protect," never "must protects" or "must to protect").',
        'Strong Obligation vs. Advice: Use "must" or "have to" for strict rules and laws; use "should" or "ought to" for helpful advice and recommendations.',
        'Modal Nouns (possibility, obligation, necessity, ability, permission, responsibility) name the quality or state of modality.',
        'Modal Adverbs (certainly, definitely, possibly, probably, obligatorily) modify verbs or adjectives to show the degree of certainty.',
      ],
      examples: [
        {
          title: 'Modal Verb + Base Verb Rule',
          example: 'Every visitor must register at the Mount Hamiguitan Eco-Park office before hiking.',
          analysis:
            '"Must" expresses strict obligation and pairs directly with the base verb "register."',
        },
        {
          title: 'Modal Noun in Action',
          example: 'It is our shared responsibility to keep Dahican Beach free of plastic litter.',
          analysis:
            '"Responsibility" functions as a modal noun expressing moral duty.',
        },
        {
          title: 'Modal Adverb Showing High Certainty',
          example: 'Consistent reading practice will definitely strengthen your comprehension skills.',
          analysis:
            'The modal adverb "definitely" intensifies the modal verb "will" to show strong conviction.',
        },
      ],
      culturalConnection:
        'Filipino hospitality and respectful communication rely heavily on polite modality—using "May I..." and "Could you kindly..." reflects the courteous values taught across Davao Oriental schools.',
      warmupQuestion: {
        question: 'Which sentence uses a modal verb and main verb CORRECTLY?',
        options: [
          'Students must wears their school ID inside the campus.',
          'Students must to wear their school ID inside the campus.',
          'Students must wear their school ID inside the campus.',
          'Students must wearing their school ID inside the campus.',
        ],
        correctAnswer: 'Students must wear their school ID inside the campus.',
        feedback:
          'Correct! Modal verbs like "must" are always followed immediately by the base form of the verb ("wear").',
      },
      writingPrompt: {
        title: 'School & Community Rules Using Modals',
        instructions:
          'Write 2 to 3 sentences giving advice to a younger Grade 7 student on how to succeed in high school. Use at least two modal verbs (must, should, can) and one modal adverb (definitely, certainly, responsibly).',
        sampleStarter:
          'To succeed in high school, you should review your lessons daily and must submit your assignments on time. Good study habits will certainly help you achieve your goals.',
      },
    },
    quizQuestions: [
      {
        id: 'g8-q1-m2-e1',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt:
          'Type the 4-letter modal verb that expresses strong obligation or a strict rule (Starts with M).',
        contextSentence: 'All passengers ________ wear life vests before boarding the island boat.',
        hint: 'M U S _',
        answer: 'must',
        explanation: '"Must" expresses a mandatory safety rule or strong obligation.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m2-e2',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt:
          'Which illustration best symbolizes "ENVIRONMENTAL RESPONSIBILITY" (our obligation to care for coastal nature)?',
        pictureOptions: STANDARD_PICTURE_SETS.context_detective,
        answer: 'pic-mangroves',
        explanation:
          'Planting and protecting coastal mangroves embodies our shared responsibility to protect nature.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m2-e3',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: 'Pick the correct polite modal verb for asking formal permission from a teacher:',
        contextSentence: '________ I borrow the English dictionary from the reading corner, Ma’am Reyes?',
        options: ['May', 'Must', 'Would', 'Shall'],
        answer: 'May',
        explanation: '"May" is the standard, most polite modal verb for requesting permission.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m2-e4',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: 'Complete the Modal Verb to Modal Noun analogy:',
        analogyPair: {
          firstA: 'Can',
          firstB: 'Ability',
          secondC: 'May',
          relationshipType: 'Modal Verb to Modal Noun',
        },
        options: ['Permission', 'Prohibition', 'Inability', 'Refusal'],
        answer: 'Permission',
        explanation: 'While "can" expresses ability, "may" expresses permission (or possibility).',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m2-e5',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: 'Solve the crossword: 10-letter modal noun meaning formal authorization or consent:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 10,
          cluePrompt: 'Formal consent or authorization to do something',
          letterGrid: [
            { index: 0, letter: 'P', isGiven: true },
            { index: 3, letter: 'M', isGiven: true },
            { index: 9, letter: 'N', isGiven: true },
          ],
        },
        options: ['PERMISSION', 'OBLIGATION', 'NECESSITY', 'PROHIBITION'],
        answer: 'PERMISSION',
        explanation: 'PERMISSION is the modal noun meaning authorization.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m2-m1',
        type: 'typeHunter',
        difficulty: 'moderate',
        prompt:
          'Type the 10-letter modal noun derived from "permitted" that means official consent or authorization (Starts with P).',
        contextSentence:
          'The journalism club received official ________ from the principal to interview the mayor.',
        hint: 'P E R M I S S I O N',
        answer: 'permission',
        explanation: '"Permission" is the modal noun meaning authorization or consent to do something.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m2-m2',
        type: 'pictureHunt',
        difficulty: 'moderate',
        prompt:
          'Which image represents using your voice to persuade others with strong conviction ("will certainly inspire")?',
        pictureOptions: STANDARD_PICTURE_SETS.bridge_connection,
        answer: 'pic-megaphone',
        explanation:
          'A speaker’s megaphone represents projecting persuasive modality and conviction in public speech.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m2-m3',
        type: 'missingPiece',
        difficulty: 'moderate',
        prompt: 'Select the correct modal adverb to show 100% certainty in the sentence:',
        contextSentence:
          'If our class practices together every afternoon, we will ________ perform well in the choral reading.',
        options: ['definitely', 'barely', 'reluctantly', 'rarely'],
        answer: 'definitely',
        explanation: '"Definitely" is a modal adverb that reinforces high certainty and assurance.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m2-m4',
        type: 'analogyMaster',
        difficulty: 'moderate',
        prompt: 'Complete the grammar function analogy:',
        analogyPair: {
          firstA: 'Should',
          firstB: 'Modal Verb',
          secondC: 'Possibly',
          relationshipType: 'Word to Part of Speech',
        },
        options: ['Modal Adverb', 'Modal Noun', 'Preposition', 'Conjunction'],
        answer: 'Modal Adverb',
        explanation: '"Should" is a modal verb; "possibly" (ending in -ly) is a modal adverb.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m2-m5',
        type: 'crosswordGame',
        difficulty: 'moderate',
        prompt: 'Solve the crossword: 10-letter modal adverb indicating 100% certainty:',
        crosswordClue: {
          direction: 'DOWN',
          clueNumber: 2,
          wordLength: 10,
          cluePrompt: 'Without doubt or with absolute certainty',
          letterGrid: [
            { index: 0, letter: 'D', isGiven: true },
            { index: 4, letter: 'N', isGiven: true },
            { index: 9, letter: 'Y', isGiven: true },
          ],
        },
        options: ['DEFINITELY', 'FREQUENTLY', 'PERHAPS', 'APPARENTLY'],
        answer: 'DEFINITELY',
        explanation: 'DEFINITELY expresses complete certainty in modal discourse.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m2-h1',
        type: 'typeHunter',
        difficulty: 'hard',
        prompt:
          'Type the 9-letter modal noun meaning "the fact of being required or indispensable" (Starts with N).',
        contextSentence:
          'Clean drinking water is not a luxury; it is an absolute ________ for every community.',
        hint: 'Starts with N E C E S...',
        answer: 'necessity',
        explanation: '"Necessity" is the modal noun expressing something indispensable or required.',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m2-h2',
        type: 'pictureHunt',
        difficulty: 'hard',
        prompt:
          'Which illustration represents "OBLIGATION TO JUSTICE" (weighing evidence fairly as a duty)?',
        pictureOptions: STANDARD_PICTURE_SETS.parallel_balance,
        answer: 'pic-scales',
        explanation:
          'The balanced scales represent the moral and legal obligation to judge fairly.',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m2-h3',
        type: 'missingPiece',
        difficulty: 'hard',
        prompt: 'Choose the grammatically sound past-modal construction for an unfulfilled past advisability:',
        contextSentence:
          'The hikers ________ checked the weather bulletin before climbing the ridge yesterday.',
        options: ['should have', 'should of', 'must to have', 'ought have'],
        answer: 'should have',
        explanation:
          '"Should have + past participle" expresses advisable past action ("should of" is a common grammatical error).',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m2-h4',
        type: 'analogyMaster',
        difficulty: 'hard',
        prompt: 'Complete the modal intensity analogy:',
        analogyPair: {
          firstA: 'Might',
          firstB: 'Low Possibility',
          secondC: 'Must',
          relationshipType: 'Modal to Degree of Certainty/Obligation',
        },
        options: [
          'High Obligation / Logical Certainty',
          'Casual Suggestion',
          'Optional Past Habit',
          'Polite Refusal',
        ],
        answer: 'High Obligation / Logical Certainty',
        explanation:
          '"Might" indicates low possibility, whereas "must" indicates high obligation or strong logical deduction.',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m2-h5',
        type: 'crosswordGame',
        difficulty: 'hard',
        prompt: 'Solve the crossword: 9-letter modal noun meaning indispensable requirement:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 3,
          wordLength: 9,
          cluePrompt: 'The state or fact of being required or indispensable',
          letterGrid: [
            { index: 0, letter: 'N', isGiven: true },
            { index: 4, letter: 'S', isGiven: true },
            { index: 8, letter: 'Y', isGiven: true },
          ],
        },
        options: ['NECESSITY', 'OBLIGATION', 'AUTHORITY', 'PROBABILITY'],
        answer: 'NECESSITY',
        explanation: 'NECESSITY is a modal noun denoting an indispensable need.',
        timeLimitSeconds: 20,
      },
    ],
  },
  {
    id: 'g8-q1-m3',
    gradeLevel: 8,
    quarter: 1,
    moduleNumber: 3,
    quarterModuleIndex: 3,
    islandName: 'San Victor Island',
    islandThemeColor: '#0284C7',
    title: 'Afro-Asian Folktales & Reading Comprehension',
    topicType: 'reading',
    requiredPassingScore: 75,
    lessonContent: {
      overview:
        'Afro-Asian literature is a rich tapestry of stories passed down through generations across Africa and Asia, including the Philippines. By analyzing character motivations, conflict, setting, and universal themes, we discover how our shared human values—filial piety, courage, and community wisdom—connect cultures.',
      melcCompetency:
        'EN8LT-Ia-8: Describe the notable literary genres contributed by Afro-Asian writers and identify distinguishing features of folktales.',
      keyRules: [
        'Theme vs. Topic: A topic is what the story is about in one or two words (e.g., "wisdom"); a theme is the complete life lesson or insight about human nature (e.g., "True wisdom comes from respecting the experience of elders").',
        'Character Motivation: Always ask WHY a character makes a sacrifice—actions reveal inner character traits more strongly than appearance.',
        'Folktale Elements: Traditional stories often feature oral storytelling rhythms, symbolic settings (mountains, bells, rivers), and a clear moral resolution.',
        'Making Inferences: Combine textual evidence ("what the story says") with prior knowledge ("what you know") to read between the lines.',
      ],
      examples: [
        {
          title: 'The Story of the Aged Mother (Japanese Folktale by Matsuo Basho)',
          example:
            'Despite the cruel governor’s decree, the poor farmer secretly carried his aged mother back down the mountain, and her wisdom about twisted straw ropes saved the entire province.',
          analysis:
            'Theme: Filial love and the accumulated wisdom of elders are priceless treasures that sustain a society.',
        },
        {
          title: 'The Soul of the Great Bell (Chinese Legend by Lafcadio Hearn)',
          example:
            'Ko-Ngai leaped into the molten metal so that the bronze, gold, and silver would finally blend and save her father Kouan-Yu’s life.',
          analysis:
            'Character Motivation: Selfless devotion and filial piety drive Ko-Ngai’s ultimate sacrifice.',
        },
        {
          title: 'Mandaya Oral Traditions of Davao Oriental',
          example:
            'Traditional Mandaya epic chants (Dawot) celebrate harmony with nature, bravery, and kinship across mountain and coastal clans.',
          analysis:
            'Local literary heritage mirrors the broader Asian reverence for family honor and respect for the natural world.',
        },
      ],
      culturalConnection:
        'Just as Japanese and Chinese folktales honor elders, the Mandaya and Kalagan communities of Davao Oriental hold deep reverence for tribal elders (Mangkatadong) whose counsel guides community decisions.',
      warmupQuestion: {
        question:
          'In "The Story of the Aged Mother," why did the mother snap twigs and drop them along the steep mountain path?',
        options: [
          'Because she was angry at the trees in the forest',
          'So her son would have a trail of markers to find his way safely home',
          'To build a campfire at the top of the mountain',
          'To signal the cruel governor’s soldiers',
        ],
        correctAnswer: 'So her son would have a trail of markers to find his way safely home',
        feedback:
          'Exactly right! Her selfless maternal love moved the farmer’s heart and inspired him to bring her safely home.',
      },
      writingPrompt: {
        title: 'Reflecting on Elder Wisdom in Afro-Asian Folktales',
        instructions:
          'Write 2 to 3 sentences explaining why respecting elders and preserving traditional stories is important for young Filipinos today.',
        sampleStarter:
          'In Afro-Asian folktales like "The Story of the Aged Mother," elders possess deep wisdom gained through years of perseverance. Listening to our grandparents helps us make wise choices and keeps our cultural identity alive.',
      },
    },
    quizQuestions: [
      {
        id: 'g8-q1-m3-e1',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt:
          'Type the 5-letter literary term for the central life lesson or underlying message of a story (Starts with T).',
        contextSentence:
          'The central ________ of "The Story of the Aged Mother" is that the wisdom of elders should be cherished.',
        hint: 'T H E M _',
        answer: 'theme',
        explanation: 'The "theme" is the central message, moral, or insight into life revealed by a literary work.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m3-e2',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt:
          'Which illustration represents traditional oral storytelling passed down around a warm fire under the stars?',
        pictureOptions: STANDARD_PICTURE_SETS.bridge_connection,
        answer: 'pic-campfire',
        explanation:
          'Before written books, Afro-Asian folktales were shared orally by elders gathered around evening fires.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m3-e3',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: 'Complete the literary comprehension statement about "The Story of the Aged Mother":',
        contextSentence:
          'The cruel governor abolished his unjust law after realizing that a nation’s greatest strength lies in the ________ of its elders.',
        options: ['wisdom', 'wealth', 'weapons', 'castles'],
        answer: 'wisdom',
        explanation:
          'When the aged mother solved the riddle of the rope of ashes, the governor recognized the irreplaceable wisdom of elders.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m3-e4',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: 'Complete the Folktale to Country of Origin analogy:',
        analogyPair: {
          firstA: 'The Story of the Aged Mother',
          firstB: 'Japan',
          secondC: 'The Soul of the Great Bell',
          relationshipType: 'Literary Work to Country',
        },
        options: ['China', 'Egypt', 'India', 'Thailand'],
        answer: 'China',
        explanation:
          '"The Story of the Aged Mother" is a Japanese folktale, while "The Soul of the Great Bell" is a Chinese legend.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m3-e5',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: 'Solve the crossword: 6-letter literary term meaning knowledge, experience, and good judgment (elder virtue):',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 6,
          cluePrompt: 'The quality of having experience, knowledge, and good judgment',
          letterGrid: [
            { index: 0, letter: 'W', isGiven: true },
            { index: 2, letter: 'S', isGiven: true },
            { index: 5, letter: 'M', isGiven: true },
          ],
        },
        options: ['WISDOM', 'WEALTH', 'WONDER', 'WRITER'],
        answer: 'WISDOM',
        explanation: 'WISDOM is the central virtue celebrated in "The Story of the Aged Mother".',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m3-m1',
        type: 'typeHunter',
        difficulty: 'moderate',
        prompt:
          'Type the 8-letter literary term for the struggle or clash between opposing forces in a story (Starts with C).',
        contextSentence:
          'The farmer faced an internal ________ between obeying the governor’s decree and protecting his mother.',
        hint: 'C O N F L I C _',
        answer: 'conflict',
        explanation: '"Conflict" is the struggle between opposing forces (internal or external) that drives a plot.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m3-m2',
        type: 'pictureHunt',
        difficulty: 'moderate',
        prompt:
          'Which image symbolizes preserved literary heritage written on ancient parchment scrolls?',
        pictureOptions: STANDARD_PICTURE_SETS.resilience,
        answer: 'pic-scroll',
        explanation: 'The ancient scroll and quill represent recorded literary classics and chronicles.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m3-m3',
        type: 'missingPiece',
        difficulty: 'moderate',
        prompt: 'Choose the character trait that best describes Ko-Ngai in "The Soul of the Great Bell":',
        contextSentence:
          'By selling her jewels and ultimately giving her life to save her father, Ko-Ngai demonstrated extraordinary ________.',
        options: ['filial devotion', 'selfish ambition', 'reckless pride', 'timid hesitation'],
        answer: 'filial devotion',
        explanation:
          '"Filial devotion" (or filial piety) is deep respect, love, and sacrifice for one’s parents.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m3-m4',
        type: 'analogyMaster',
        difficulty: 'moderate',
        prompt: 'Complete the Story Element analogy:',
        analogyPair: {
          firstA: 'Time and Place',
          firstB: 'Setting',
          secondC: 'Turning Point of Highest Tension',
          relationshipType: 'Definition to Plot Element',
        },
        options: ['Climax', 'Exposition', 'Resolution', 'Prologue'],
        answer: 'Climax',
        explanation:
          'Just as time and place define the "Setting," the turning point of highest dramatic tension is the "Climax."',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m3-m5',
        type: 'crosswordGame',
        difficulty: 'moderate',
        prompt: 'Solve the crossword: 8-letter literary term for the clash or struggle between opposing forces:',
        crosswordClue: {
          direction: 'DOWN',
          clueNumber: 2,
          wordLength: 8,
          cluePrompt: 'The central struggle between opposing forces that drives plot narrative',
          letterGrid: [
            { index: 0, letter: 'C', isGiven: true },
            { index: 3, letter: 'F', isGiven: true },
            { index: 7, letter: 'T', isGiven: true },
          ],
        },
        options: ['CONFLICT', 'CLIMAXES', 'CRITIQUE', 'CONTRAST'],
        answer: 'CONFLICT',
        explanation: 'CONFLICT is the essential dramatic tension driving story plots.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m3-h1',
        type: 'typeHunter',
        difficulty: 'hard',
        prompt:
          'Type the 11-letter word for the main character or central figure of a literary work (Starts with P).',
        contextSentence:
          'In the folktale, the humble farmer serves as the ________ whose moral choice transforms the province.',
        hint: 'P R O T A G O N I S T',
        answer: 'protagonist',
        explanation: 'The "protagonist" is the central character around whom the conflict and resolution revolve.',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m3-h2',
        type: 'pictureHunt',
        difficulty: 'hard',
        prompt:
          'In African and Asian literature, stories often act as a bridge uniting diverse generations and cultures. Pick the visual symbol for this connection:',
        pictureOptions: STANDARD_PICTURE_SETS.bridge_connection,
        answer: 'pic-bridge',
        explanation:
          'The suspension bridge joining two banks symbolizes how literature connects generations and cultures.',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m3-h3',
        type: 'missingPiece',
        difficulty: 'hard',
        prompt: 'Select the literary term that describes when an object (like the rope of ashes) represents a deeper idea:',
        contextSentence:
          'In the folktale, the unbroken rope of ashes serves as powerful ________ for the enduring resilience of elderly wisdom.',
        options: ['symbolism', 'hyperbole', 'onomatopoeia', 'alliteration'],
        answer: 'symbolism',
        explanation:
          '"Symbolism" is the use of concrete objects or actions to represent deeper abstract ideas or qualities.',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m3-h4',
        type: 'analogyMaster',
        difficulty: 'hard',
        prompt: 'Complete the Literary Point of View analogy:',
        analogyPair: {
          firstA: 'Uses "I" and "We"',
          firstB: 'First-Person Point of View',
          secondC: 'All-knowing narrator who sees every character’s thoughts',
          relationshipType: 'Narrative Feature to Point of View',
        },
        options: [
          'Third-Person Omniscient',
          'Second-Person Instructional',
          'First-Person Limited',
          'Dramatic Monologue',
        ],
        answer: 'Third-Person Omniscient',
        explanation:
          '"Omniscient" means all-knowing; a third-person omniscient narrator has access to the thoughts and feelings of all characters.',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m3-h5',
        type: 'crosswordGame',
        difficulty: 'hard',
        prompt: 'Solve the crossword: 11-letter word for the central character in a literary work:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 3,
          wordLength: 11,
          cluePrompt: 'The leading character or hero in a literary narrative',
          letterGrid: [
            { index: 0, letter: 'P', isGiven: true },
            { index: 5, letter: 'A', isGiven: true },
            { index: 10, letter: 'T', isGiven: true },
          ],
        },
        options: ['PROTAGONIST', 'ANTAGONISTS', 'NARRATORIAL', 'OBSERVATION'],
        answer: 'PROTAGONIST',
        explanation: 'PROTAGONIST is the central character around whom a story turns.',
        timeLimitSeconds: 20,
      },
    ],
  },
  {
    id: 'g8-q1-m4',
    gradeLevel: 8,
    quarter: 1,
    moduleNumber: 4,
    quarterModuleIndex: 4,
    islandName: 'San Victor Island',
    islandThemeColor: '#0284C7',
    title: 'Parallel Structures & Sentence Construction',
    topicType: 'sentence-construction',
    requiredPassingScore: 75,
    lessonContent: {
      overview:
        'Parallelism (or parallel structure) is the balance of two or more similar words, phrases, or clauses in a sentence. When listing items or connecting ideas with coordinating or correlative conjunctions, matching their grammatical forms makes your writing rhythmic, clear, and persuasive.',
      melcCompetency:
        'EN8G-Ia-7: Use parallel structures in constructing clear and balanced sentences.',
      keyRules: [
        'Gerund Series (-ing): Match gerunds with gerunds (e.g., "Maria enjoys reading folktales, writing essays, and sketching islands").',
        'Infinitive Series (to + verb): Match infinitives with infinitives (e.g., "To listen carefully, to think critically, and to speak kindly are marks of a scholar").',
        'Adjective / Noun Series: Do not mix adjectives with clauses in a simple list (e.g., "The speaker was articulate, confident, and inspiring").',
        'Correlative Conjunctions (both...and, not only...but also, either...or, neither...nor): The grammatical structure immediately following the first part must match the structure following the second part.',
      ],
      examples: [
        {
          title: 'Fixing Faulty Parallelism in a Verb Series',
          example:
            'Faulty: Tourists visit Dahican Beach for swimming, surfing, and to watch sea turtles. → Parallel: Tourists visit Dahican Beach for swimming, surfing, and watching sea turtles.',
          analysis:
            'Changing "to watch" (infinitive) to "watching" (gerund) balances all three items in the -ing form.',
        },
        {
          title: 'Parallelism with "Not Only... But Also"',
          example:
            'LingoQuest helps learners not only master English grammar but also appreciate local literature.',
          analysis:
            'Both correlative branches are followed by base verb phrases: "master English grammar" and "appreciate local literature."',
        },
        {
          title: 'Parallel Adverbs of Manner',
          example:
            'The rescue team worked swiftly, calmly, and effectively during the coastal drill.',
          analysis:
            'All three modifiers are adverbs ending in -ly: swiftly, calmly, and effectively.',
        },
      ],
      culturalConnection:
        'Just as a traditional outrigger bangka in Davao Oriental needs balanced katig (outriggers) on both sides to glide smoothly across the waves, a sentence needs balanced grammatical structures to flow smoothly.',
      warmupQuestion: {
        question: 'Which of the following sentences demonstrates CORRECT parallel structure?',
        options: [
          'Carlo likes hiking trails, to swim in the bay, and photography.',
          'Carlo likes hiking trails, swimming in the bay, and taking photographs.',
          'Carlo likes to hike trails, swimming in the bay, and take photographs.',
          'Carlo likes hiking trails, swimming in the bay, and to take photographs.',
        ],
        correctAnswer: 'Carlo likes hiking trails, swimming in the bay, and taking photographs.',
        feedback:
          'Bravo! "Hiking trails," "swimming in the bay," and "taking photographs" are all parallel gerund phrases.',
      },
      writingPrompt: {
        title: 'Constructing Balanced Parallel Sentences',
        instructions:
          'Write 2 to 3 sentences describing your favorite activities or goals as a student in Davao Oriental. Use parallel structure in a list of three items AND try using "not only... but also" in one sentence.',
        sampleStarter:
          'As a Grade 8 student, I love reading adventure stories, solving vocabulary puzzles, and collaborating with my classmates. Studying English not only sharpens my communication skills but also builds my confidence.',
      },
    },
    quizQuestions: [
      {
        id: 'g8-q1-m4-e1',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt:
          'Type the correct -ing form (gerund) of the verb "WRITE" to make this sentence parallel: "She loves reading, speaking, and ________."',
        contextSentence: 'She loves reading books, speaking in public, and ________ creative stories.',
        hint: 'Drop the e and add -ing (7 letters)',
        answer: 'writing',
        explanation:
          'To match "reading" and "speaking," the third item must also be a gerund: "writing."',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m4-e2',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt:
          'Which illustration best symbolizes grammatical PARALLELISM (keeping items on both sides of a sentence in equal balance)?',
        pictureOptions: STANDARD_PICTURE_SETS.parallel_balance,
        answer: 'pic-scales',
        explanation:
          'The balanced golden scales represent equal grammatical weight on both sides of a parallel sentence.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m4-e3',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: 'Select the parallel verb phrase to complete the sentence:',
        contextSentence:
          'Before the quiz, the teacher reminded us to read each prompt carefully, to manage our time wisely, and ________.',
        options: [
          'to review our answers thoroughly',
          'reviewing our answers thoroughly',
          'that we should review answers',
          'reviewed our answers thoroughly',
        ],
        answer: 'to review our answers thoroughly',
        explanation:
          'The sentence uses an infinitive series ("to read... to manage..."), so "to review our answers thoroughly" keeps it parallel.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m4-e4',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: 'Complete the Grammatical Form analogy for parallel structure:',
        analogyPair: {
          firstA: 'Swimming, Running, Cycling',
          firstB: 'Parallel Gerunds',
          secondC: 'Quickly, Quietly, Carefully',
          relationshipType: 'Examples to Grammatical Category',
        },
        options: [
          'Parallel Adverbs',
          'Parallel Nouns',
          'Parallel Prepositions',
          'Parallel Pronouns',
        ],
        answer: 'Parallel Adverbs',
        explanation: '"Quickly, quietly, carefully" are all adverbs of manner ending in -ly.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m4-e5',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: 'Solve the crossword: 8-letter term meaning matching coordinate grammatical patterns:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 8,
          cluePrompt: 'Side-by-side matching grammatical forms in sentence structure',
          letterGrid: [
            { index: 0, letter: 'P', isGiven: true },
            { index: 3, letter: 'A', isGiven: true },
            { index: 7, letter: 'L', isGiven: true },
          ],
        },
        options: ['PARALLEL', 'BALANCED', 'SYMMETRY', 'EQUALISE'],
        answer: 'PARALLEL',
        explanation: 'PARALLEL structure requires using matching grammatical forms.',
        timeLimitSeconds: 45,
      },
      {
        id: 'g8-q1-m4-m1',
        type: 'typeHunter',
        difficulty: 'moderate',
        prompt:
          'Type the parallel adjective form of "PATIENCE" (7 letters) to balance: "A good leader is honest, humble, and ________."',
        contextSentence: 'A good student leader must be honest, humble, and ________ when listening to peers.',
        hint: 'Starts with P A T I...',
        answer: 'patient',
        explanation:
          '"Honest" and "humble" are adjectives, so we need the adjective "patient" rather than the noun "patience."',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m4-m2',
        type: 'pictureHunt',
        difficulty: 'moderate',
        prompt:
          'Correlative conjunctions ("both... and", "not only... but also") act like a sturdy bridge linking two equal clauses. Pick the matching visual:',
        pictureOptions: STANDARD_PICTURE_SETS.bridge_connection,
        answer: 'pic-bridge',
        explanation:
          'Conjunctions literally bridge two grammatical structures of equal weight.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m4-m3',
        type: 'missingPiece',
        difficulty: 'moderate',
        prompt: 'Complete the correlative conjunction sentence with parallel structure:',
        contextSentence:
          'The eco-park rangers are dedicated not only to protecting endangered eagles ________ to educating young visitors.',
        options: ['but also', 'and also', 'or else', 'nor even'],
        answer: 'but also',
        explanation:
          'The correlative pair is "not only... but also," linking "to protecting" and "to educating."',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m4-m4',
        type: 'analogyMaster',
        difficulty: 'moderate',
        prompt: 'Complete the Correlative Conjunction pair analogy:',
        analogyPair: {
          firstA: 'Either',
          firstB: 'Or',
          secondC: 'Neither',
          relationshipType: 'Correlative Conjunction Partner',
        },
        options: ['Nor', 'But', 'And', 'Yet'],
        answer: 'Nor',
        explanation: '"Either" pairs with "or," while "neither" always pairs with "nor."',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m4-m5',
        type: 'crosswordGame',
        difficulty: 'moderate',
        prompt: 'Solve the crossword: 11-letter adjective for paired conjunctions (either... or, neither... nor):',
        crosswordClue: {
          direction: 'DOWN',
          clueNumber: 2,
          wordLength: 11,
          cluePrompt: 'Paired conjunctions that connect equal sentence parts',
          letterGrid: [
            { index: 0, letter: 'C', isGiven: true },
            { index: 3, letter: 'R', isGiven: true },
            { index: 10, letter: 'E', isGiven: true },
          ],
        },
        options: ['CORRELATIVE', 'SUBORDINATE', 'COORDINATED', 'ALTERNATIVE'],
        answer: 'CORRELATIVE',
        explanation: 'CORRELATIVE conjunctions connect grammatically equal elements.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q1-m4-h1',
        type: 'typeHunter',
        difficulty: 'hard',
        prompt:
          'Type the 11-letter grammatical term for balancing similar grammatical structures in a sentence (Starts with P).',
        contextSentence:
          'Famous speeches use ________ to make ideas memorable, balanced, and rhythmic.',
        hint: 'P A R A L L E L I S M',
        answer: 'parallelism',
        explanation: '"Parallelism" is the rhetorical and grammatical principle of balanced sentence structure.',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m4-h2',
        type: 'pictureHunt',
        difficulty: 'hard',
        prompt:
          'Which image represents a scholar revising and editing reference texts for structural accuracy?',
        pictureOptions: STANDARD_PICTURE_SETS.parallel_balance,
        answer: 'pic-scholar',
        explanation:
          'Careful study and revision ensure clean, balanced sentence construction.',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m4-h3',
        type: 'missingPiece',
        difficulty: 'hard',
        prompt: 'Select the clause that maintains strict parallelism in this sentence:',
        contextSentence:
          'The division science fair judges evaluated how original the hypothesis was, how accurately the data were recorded, and ________.',
        options: [
          'how clearly the conclusions were explained',
          'the clarity of the conclusion explanation',
          'explaining the conclusions with clarity',
          'whether the students were clear',
        ],
        answer: 'how clearly the conclusions were explained',
        explanation:
          'All three items follow the exact parallel pattern: "how + adverb/adjective + subject + passive verb."',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m4-h4',
        type: 'analogyMaster',
        difficulty: 'hard',
        prompt: 'Identify the matching parallel transformation:',
        analogyPair: {
          firstA: 'Active: The students restored the bridge',
          firstB: 'Passive: The bridge was restored by the students',
          secondC: 'Noun Phrase: Careful preparation',
          relationshipType: 'Grammatical Transformation to Gerund Phrase',
        },
        options: [
          'Preparing carefully',
          'To prepare with care',
          'Prepared carefully',
          'Careful and prepared',
        ],
        answer: 'Preparing carefully',
        explanation:
          'Transforming the noun phrase "Careful preparation" into a gerund phrase yields "Preparing carefully."',
        timeLimitSeconds: 20,
      },
      {
        id: 'g8-q1-m4-h5',
        type: 'crosswordGame',
        difficulty: 'hard',
        prompt: 'Solve the crossword: 8-letter word for the harmonic balance or proportion achieved through parallelism:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 3,
          wordLength: 8,
          cluePrompt: 'Equilibrium, balance, and formal proportion in prose',
          letterGrid: [
            { index: 0, letter: 'S', isGiven: true },
            { index: 4, letter: 'E', isGiven: true },
            { index: 7, letter: 'Y', isGiven: true },
          ],
        },
        options: ['SYMMETRY', 'EQUATION', 'PARALLEL', 'HARMONIC'],
        answer: 'SYMMETRY',
        explanation: 'SYMMETRY is the balanced structural proportionality of coordinate clauses.',
        timeLimitSeconds: 20,
      },
    ],
  },
];

interface ModuleSeedBlueprint {
  id: string;
  gradeLevel: GradeLevel;
  quarter: QuarterNumber;
  moduleNumber: number;
  quarterModuleIndex: number;
  islandName: string;
  islandThemeColor: string;
  title: string;
  topicType: TopicType;
  melcCode: string;
  overview: string;
  targetWordEasy: string;
  targetWordEasyClue: string;
  targetWordMod: string;
  targetWordModClue: string;
  targetWordHard: string;
  targetWordHardClue: string;
  missingPieceSentence: string;
  missingPieceAnswer: string;
  missingPieceDistractors: string[];
  analogyA: string;
  analogyB: string;
  analogyC: string;
  analogyAnswer: string;
  analogyDistractors: string[];
}

function buildPlayableModule(bp: ModuleSeedBlueprint): Module {
  const makeQuestionsForDifficulty = (diff: DifficultyLevel): QuizQuestion[] => {
    const timeLimit = diff === 'easy' ? 45 : diff === 'moderate' ? 30 : 20;
    const word =
      diff === 'easy'
        ? bp.targetWordEasy
        : diff === 'moderate'
        ? bp.targetWordMod
        : bp.targetWordHard;
    const clue =
      diff === 'easy'
        ? bp.targetWordEasyClue
        : diff === 'moderate'
        ? bp.targetWordModClue
        : bp.targetWordHardClue;

    return [
      {
        id: `${bp.id}-${diff}-1`,
        type: 'typeHunter',
        difficulty: diff,
        prompt: `Type the correct word for this clue: ${clue} (${word.length} letters, starts with "${word[0].toUpperCase()}").`,
        contextSentence: `Mastering terms like "${word[0].toUpperCase()}_______" strengthens your Grade ${bp.gradeLevel} ${bp.topicType} skills.`,
        hint: `Starts with ${word.slice(0, 3).toUpperCase()}... (${word.length} letters)`,
        answer: word.toLowerCase(),
        explanation: `"${word}" matches the definition: ${clue}`,
        timeLimitSeconds: timeLimit,
      },
      {
        id: `${bp.id}-${diff}-2`,
        type: 'pictureHunt',
        difficulty: diff,
        prompt: `Which visual illustration best connects to the core concept of "${bp.title}" (connecting ideas and building mastery)?`,
        pictureOptions:
          bp.topicType === 'vocabulary' || bp.topicType === 'spelling'
            ? STANDARD_PICTURE_SETS.context_detective
            : bp.topicType === 'grammar' || bp.topicType === 'sentence-construction'
            ? STANDARD_PICTURE_SETS.parallel_balance
            : STANDARD_PICTURE_SETS.resilience,
        answer:
          bp.topicType === 'vocabulary' || bp.topicType === 'spelling'
            ? 'pic-magnifier'
            : bp.topicType === 'grammar' || bp.topicType === 'sentence-construction'
            ? 'pic-scales'
            : 'pic-scroll',
        explanation: `This visual represents the core analytical skill practiced in ${bp.title}.`,
        timeLimitSeconds: timeLimit,
      },
      {
        id: `${bp.id}-${diff}-3`,
        type: 'missingPiece',
        difficulty: diff,
        prompt: `Select the missing word or phrase that accurately completes the sentence for ${bp.title}:`,
        contextSentence: bp.missingPieceSentence,
        options: [bp.missingPieceAnswer, ...bp.missingPieceDistractors],
        answer: bp.missingPieceAnswer,
        explanation: `"${bp.missingPieceAnswer}" completes the sentence accurately according to ${bp.melcCode}.`,
        timeLimitSeconds: timeLimit,
      },
      {
        id: `${bp.id}-${diff}-4`,
        type: 'analogyMaster',
        difficulty: diff,
        prompt: `Complete the conceptual analogy for ${bp.title}:`,
        analogyPair: {
          firstA: bp.analogyA,
          firstB: bp.analogyB,
          secondC: bp.analogyC,
          relationshipType: 'Conceptual Relationship',
        },
        options: [bp.analogyAnswer, ...bp.analogyDistractors],
        answer: bp.analogyAnswer,
        explanation: `Just as ${bp.analogyA} relates to ${bp.analogyB}, ${bp.analogyC} relates to ${bp.analogyAnswer}.`,
        timeLimitSeconds: timeLimit,
      },
      {
        id: `${bp.id}-${diff}-5`,
        type: 'crosswordGame',
        difficulty: diff,
        prompt: `Solve the crossword clue for ${bp.title}: ${clue} (${word.length} letters)`,
        crosswordClue: {
          direction: diff === 'easy' ? 'ACROSS' : diff === 'moderate' ? 'DOWN' : 'ACROSS',
          clueNumber: diff === 'easy' ? 1 : diff === 'moderate' ? 2 : 3,
          wordLength: word.length,
          cluePrompt: clue,
          letterGrid: [
            { index: 0, letter: word[0].toUpperCase(), isGiven: true },
            {
              index: Math.floor(word.length / 2),
              letter: word[Math.floor(word.length / 2)].toUpperCase(),
              isGiven: diff !== 'hard',
            },
            {
              index: word.length - 1,
              letter: word[word.length - 1].toUpperCase(),
              isGiven: diff === 'easy',
            },
          ],
        },
        options: [
          word.toUpperCase(),
          ...(diff === 'easy'
            ? [bp.targetWordMod.toUpperCase(), bp.targetWordHard.toUpperCase(), 'LEXICON']
            : diff === 'moderate'
            ? [bp.targetWordEasy.toUpperCase(), bp.targetWordHard.toUpperCase(), 'SYNTAX']
            : [bp.targetWordEasy.toUpperCase(), bp.targetWordMod.toUpperCase(), 'GRAMMAR']),
        ],
        answer: word.toUpperCase(),
        explanation: `"${word.toUpperCase()}" matches the clue: ${clue}.`,
        timeLimitSeconds: timeLimit,
      },
    ];
  };

  return {
    id: bp.id,
    gradeLevel: bp.gradeLevel,
    quarter: bp.quarter,
    moduleNumber: bp.moduleNumber,
    quarterModuleIndex: bp.quarterModuleIndex,
    islandName: bp.islandName,
    islandThemeColor: bp.islandThemeColor,
    title: bp.title,
    topicType: bp.topicType,
    requiredPassingScore: 75,
    lessonContent: {
      overview: bp.overview,
      melcCompetency: `${bp.melcCode}: Master ${bp.title.toLowerCase()} in academic and real-world communication.`,
      keyRules: [
        `Identify the structural patterns and signal words central to ${bp.title}.`,
        'Read the surrounding paragraph context before choosing or typing your final answer.',
        'Apply clear, balanced sentence construction when expressing opinions or literary insights.',
        'Review feedback after every practice round to reinforce long-term retention.',
      ],
      examples: [
        {
          title: 'Core Concept Application',
          example: bp.missingPieceSentence.replace('________', bp.missingPieceAnswer),
          analysis: `Notice how "${bp.missingPieceAnswer}" anchors the meaning and grammatical accuracy of the sentence.`,
        },
        {
          title: 'Key Vocabulary & Structure',
          example: `Key Terms: ${bp.targetWordEasy}, ${bp.targetWordMod}, and ${bp.targetWordHard}.`,
          analysis: `Understanding these terms across Easy, Moderate, and Hard levels prepares you to restore this module’s bridge.`,
        },
      ],
      culturalConnection:
        'Across the municipalities of Davao Oriental—from Mati City to Baganga, Cateel, and Governor Generoso—strong English proficiency empowers learners to share local stories and heritage with the world.',
      warmupQuestion: {
        question: `Which term best completes this model sentence: "${bp.missingPieceSentence}"?`,
        options: [bp.missingPieceAnswer, ...bp.missingPieceDistractors],
        correctAnswer: bp.missingPieceAnswer,
        feedback: `Great job! "${bp.missingPieceAnswer}" is the exact form needed here.`,
      },
      writingPrompt: {
        title: `Writing Practice: ${bp.title}`,
        instructions: `Write 2 to 3 complete sentences applying what you learned in "${bp.title}" to describe your school life or community in Davao Oriental.`,
        sampleStarter: `${bp.missingPieceSentence.replace('________', bp.missingPieceAnswer)} Furthermore, practicing this skill helps our class communicate clearly.`,
      },
    },
    quizQuestions: [
      ...makeQuestionsForDifficulty('easy'),
      ...makeQuestionsForDifficulty('moderate'),
      ...makeQuestionsForDifficulty('hard'),
    ],
  };
}

const GRADE_8_REMAINING_BLUEPRINTS: ModuleSeedBlueprint[] = [
  {
    id: 'g8-q2-m1',
    gradeLevel: 8,
    quarter: 2,
    moduleNumber: 5,
    quarterModuleIndex: 1,
    islandName: 'Oak Island',
    islandThemeColor: '#059669',
    title: 'Visual-Verbal Relationships in Tables & Graphs',
    topicType: 'reading',
    melcCode: 'EN8SS-IIe-1.2',
    overview:
      'Expository texts often combine paragraphs with visual aids such as tables, bar graphs, line graphs, and concept maps. Translating visual data into accurate verbal statements helps readers interpret scientific and social trends rapidly.',
    targetWordEasy: 'diagram',
    targetWordEasyClue: 'A simplified drawing or plan that shows how parts relate to each other',
    targetWordMod: 'trendline',
    targetWordModClue: 'A line on a graph indicating the general direction or pattern of data over time',
    targetWordHard: 'infographic',
    targetWordHardClue: 'A visual representation of information or data designed to present complex facts quickly',
    missingPieceSentence: 'While a pie chart shows parts of a whole, a ________ best illustrates changes over time.',
    missingPieceAnswer: 'line graph',
    missingPieceDistractors: ['caption footnote', 'glossary index', 'title page'],
    analogyA: 'Pie Chart',
    analogyB: 'Percentages of a Whole',
    analogyC: 'Bar Graph',
    analogyAnswer: 'Comparison Across Categories',
    analogyDistractors: ['Alphabetical Pronunciation', 'Poetic Rhyme Scheme', 'Fictional Dialogue'],
  },
  {
    id: 'g8-q2-m2',
    gradeLevel: 8,
    quarter: 2,
    moduleNumber: 6,
    quarterModuleIndex: 2,
    islandName: 'Oak Island',
    islandThemeColor: '#059669',
    title: 'Opinion-Marking Signals & Persuasion',
    topicType: 'grammar',
    melcCode: 'EN8RC-IIIc-2.13',
    overview:
      'Distinguishing between verifiable facts and personal opinions is vital in critical reading. Opinion-marking signals—such as "In my view," "I firmly believe," "It seems that," and "Arguably"—introduce a writer’s personal judgment politely and clearly.',
    targetWordEasy: 'opinion',
    targetWordEasyClue: 'A personal view, belief, or judgment not necessarily based on absolute fact',
    targetWordMod: 'viewpoint',
    targetWordModClue: 'A person’s perspective or point of view on a topic',
    targetWordHard: 'conviction',
    targetWordHardClue: 'A firmly held belief or persuasive certainty expressed in speech',
    missingPieceSentence: '________, preserving the pygmy forest of Mount Hamiguitan is the noblest duty of our generation.',
    missingPieceAnswer: 'In my humble opinion',
    missingPieceDistractors: ['According to the thermometer', 'On page forty-two', 'At twelve o’clock noon'],
    analogyA: 'According to census data',
    analogyB: 'Fact Signal',
    analogyC: 'I strongly believe that',
    analogyAnswer: 'Opinion-Marking Signal',
    analogyDistractors: ['Chronological Signal', 'Mathematical Formula', 'Laboratory Measurement'],
  },
  {
    id: 'g8-q2-m3',
    gradeLevel: 8,
    quarter: 2,
    moduleNumber: 7,
    quarterModuleIndex: 3,
    islandName: 'Oak Island',
    islandThemeColor: '#059669',
    title: 'East Asian Literature & Poetic Imagery',
    topicType: 'literature',
    melcCode: 'EN8LT-IIc-2.2',
    overview:
      'East Asian poetry—such as Japanese Haiku and Tanka, and classical Chinese nature verse—uses vivid sensory imagery (sight, sound, touch) to capture profound moments in nature and human emotion in just a few syllables.',
    targetWordEasy: 'haiku',
    targetWordEasyClue: 'A traditional three-line Japanese poem with a 5-7-5 syllable structure',
    targetWordMod: 'imagery',
    targetWordModClue: 'Visually descriptive or figurative language that appeals to the five senses',
    targetWordHard: 'sensory',
    targetWordHardClue: 'Relating to sensation or the physical senses of sight, sound, smell, taste, and touch',
    missingPieceSentence: 'A traditional Japanese haiku consists of three lines following a ________ syllable pattern.',
    missingPieceAnswer: '5-7-5',
    missingPieceDistractors: ['10-10-10', '4-4-4-4', '8-6-8-6'],
    analogyA: 'Sight',
    analogyB: 'Visual Imagery',
    analogyC: 'Sound',
    analogyAnswer: 'Auditory Imagery',
    analogyDistractors: ['Tactile Imagery', 'Olfactory Imagery', 'Gustatory Imagery'],
  },
  {
    id: 'g8-q2-m4',
    gradeLevel: 8,
    quarter: 2,
    moduleNumber: 8,
    quarterModuleIndex: 4,
    islandName: 'Oak Island',
    islandThemeColor: '#059669',
    title: 'Orthographic Mastery & Academic Spelling',
    topicType: 'spelling',
    melcCode: 'EN8V-IIf-10.1.4',
    overview:
      'Accurate spelling (orthography) ensures that your academic essays and research reports command respect. Learning prefixes, suffixes, silent letters, and ie/ei conventions eliminates common writing mistakes.',
    targetWordEasy: 'receive',
    targetWordEasyClue: 'To be given or presented with something (remember the "i before e except after c" rule)',
    targetWordMod: 'environment',
    targetWordModClue: 'The natural world or surroundings in which people, animals, and plants live (contains a silent n)',
    targetWordHard: 'conscientious',
    targetWordHardClue: 'Wishing to do one’s work or duty thoroughly and carefully',
    missingPieceSentence: 'Remember the orthographic rule: put "i" before "e" except after "c", as seen in the word ________.',
    missingPieceAnswer: 'ceiling',
    missingPieceDistractors: ['cieiling', 'celing', 'ceeling'],
    analogyA: 'Mis + Spell',
    analogyB: 'Misspell',
    analogyC: 'Un + Necessary',
    analogyAnswer: 'Unnecessary',
    analogyDistractors: ['Unecessary', 'Unneccessary', 'Unnecesary'],
  },
  {
    id: 'g8-q4-m1',
    gradeLevel: 8,
    quarter: 4,
    moduleNumber: 15,
    quarterModuleIndex: 1,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: 'Academic & Research Vocabulary Synthesis',
    topicType: 'vocabulary',
    melcCode: 'EN8V-IVa-15',
    overview:
      'When synthesizing information from multiple sources, writers replace casual everyday expressions with precise academic vocabulary—such as "demonstrate," "corroborate," "synthesize," and "implication."',
    targetWordEasy: 'source',
    targetWordEasyClue: 'A book, document, or person that provides information for research',
    targetWordMod: 'evidence',
    targetWordModClue: 'The available body of facts or information indicating whether a proposition is true',
    targetWordHard: 'synthesize',
    targetWordHardClue: 'To combine ideas from multiple sources into a coherent whole',
    missingPieceSentence: 'To avoid plagiarism, researchers must always ________ the original authors of their sources.',
    missingPieceAnswer: 'cite',
    missingPieceDistractors: ['ignore', 'erase', 'exaggerate'],
    analogyA: 'Find out (Informal)',
    analogyB: 'Investigate (Academic)',
    analogyC: 'Show (Informal)',
    analogyAnswer: 'Demonstrate (Academic)',
    analogyDistractors: ['Guess (Casual)', 'Hide (Informal)', 'Forget (Slang)'],
  },
  {
    id: 'g8-q4-m2',
    gradeLevel: 8,
    quarter: 4,
    moduleNumber: 16,
    quarterModuleIndex: 2,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: 'Active & Passive Voice in Journalistic Texts',
    topicType: 'grammar',
    melcCode: 'EN8G-IVb-13',
    overview:
      'In Active Voice, the subject performs the action ("The students planted mangroves"). In Passive Voice, the subject receives the action ("The mangroves were planted by the students"). Active voice creates direct, energetic sentences, while passive voice emphasizes the receiver or result.',
    targetWordEasy: 'active',
    targetWordEasyClue: 'The grammatical voice in which the subject performs the action of the verb',
    targetWordMod: 'passive',
    targetWordModClue: 'The grammatical voice in which the subject is acted upon by the verb',
    targetWordHard: 'participle',
    targetWordHardClue: 'A verb form (such as "written" or "restored") used with "be" to form the passive voice',
    missingPieceSentence: 'In the active sentence "The lighthouse guided the fishermen," the subject "lighthouse" ________ the action.',
    missingPieceAnswer: 'performs',
    missingPieceDistractors: ['receives', 'cancels', 'questions'],
    analogyA: 'The choir sang the hymn',
    analogyB: 'Active Voice',
    analogyC: 'The hymn was sung by the choir',
    analogyAnswer: 'Passive Voice',
    analogyDistractors: ['Imperative Mood', 'Future Progressive', 'Sentence Fragment'],
  },
  {
    id: 'g8-q4-m3',
    gradeLevel: 8,
    quarter: 4,
    moduleNumber: 17,
    quarterModuleIndex: 3,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: 'South & West Asian Literary Classics',
    topicType: 'literature',
    melcCode: 'EN8LT-IVa-12',
    overview:
      'South and West Asian literature—from Indian classics like Rabindranath Tagore’s poetry and the Panchatantra fables to Arabian tales and Khalil Gibran’s reflections—celebrates truth, moral courage, and spiritual insight.',
    targetWordEasy: 'fable',
    targetWordEasyClue: 'A short tale, typically with animals as characters, conveying a clear moral',
    targetWordMod: 'parable',
    targetWordModClue: 'A simple story used to illustrate a moral or spiritual lesson',
    targetWordHard: 'allegory',
    targetWordHardClue: 'A story or poem that can be interpreted to reveal a hidden moral or political meaning',
    missingPieceSentence: 'In Rabindranath Tagore’s poem "Where the Mind is Without Fear," the speaker prays for a nation guided by ________ and truth.',
    missingPieceAnswer: 'reason',
    missingPieceDistractors: ['superstition', 'division', 'fearfulness'],
    analogyA: 'Panchatantra',
    analogyB: 'Indian Animal Fables',
    analogyC: 'One Thousand and One Nights',
    analogyAnswer: 'Arabian Folk Tales',
    analogyDistractors: ['Norse Mythology', 'English Sonnets', 'American Tall Tales'],
  },
  {
    id: 'g8-q4-m4',
    gradeLevel: 8,
    quarter: 4,
    moduleNumber: 18,
    quarterModuleIndex: 4,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: 'Synthesizing Essential Information & Essay Craft',
    topicType: 'sentence-construction',
    melcCode: 'EN8WC-IVc-3.4',
    overview:
      'A well-crafted informative or persuasive essay contains three essential parts: an engaging Introduction with a clear thesis statement, Body paragraphs supported by synthesized evidence, and a memorable Conclusion that reinforces the central message.',
    targetWordEasy: 'thesis',
    targetWordEasyClue: 'The central statement or main argument of an academic essay',
    targetWordMod: 'coherent',
    targetWordModClue: 'Logical, orderly, and consistent so that all parts of an essay fit together smoothly',
    targetWordHard: 'conclusion',
    targetWordHardClue: 'The final section of an essay that restates the thesis and leaves a lasting impression',
    missingPieceSentence: 'Every body paragraph should begin with a clear ________ that states the paragraph’s main idea.',
    missingPieceAnswer: 'topic sentence',
    missingPieceDistractors: ['bibliography list', 'closing signature', 'random anecdote'],
    analogyA: 'Introduction',
    analogyB: 'Thesis Statement',
    analogyC: 'Body Paragraph',
    analogyAnswer: 'Topic Sentence & Supporting Evidence',
    analogyDistractors: ['Cover Illustration', 'Table of Contents', 'Index Appendix'],
  },
];

function buildOtherGradeModules(grade: GradeLevel): Module[] {
  const islandMeta: Record<GradeLevel, { q1: string; q2: string; q3: string; q4: string }> = {
    7: {
      q1: 'San Victor Island',
      q2: 'Oak Island',
      q3: 'Waniban Island',
      q4: 'Pujada Island',
    },
    8: {
      q1: 'San Victor Island',
      q2: 'Oak Island',
      q3: 'Waniban Island',
      q4: 'Pujada Island',
    },
    9: {
      q1: 'San Victor Island',
      q2: 'Oak Island',
      q3: 'Waniban Island',
      q4: 'Pujada Island',
    },
    10: {
      q1: 'San Victor Island',
      q2: 'Oak Island',
      q3: 'Waniban Island',
      q4: 'Pujada Island',
    },
  };

  const colors = ['#0284C7', '#059669', '#D97706', '#7C3AED'];

  const curriculumByGrade: Record<
    9 | 10,
    Array<{
      title: string;
      topic: TopicType;
      melc: string;
      easyW: string;
      easyC: string;
      modW: string;
      modC: string;
      hardW: string;
      hardC: string;
      sentence: string;
      ans: string;
      dist: string[];
    }>
  > = {
    9: [
      {
        title: 'Conditionals in Expressing Arguments',
        topic: 'grammar',
        melc: 'EN9G-IIe-20',
        easyW: 'result',
        easyC: 'The outcome clause in an "if-then" conditional sentence',
        modW: 'condition',
        modC: 'A requirement or "if-clause" that must happen before a result occurs',
        hardW: 'hypothetical',
        hardC: 'Based on an imagined or counterfactual situation rather than actual fact',
        sentence: 'If we had planted more trees along the riverbank last decade, the soil erosion ________ been prevented.',
        ans: 'would have',
        dist: ['will have', 'can has', 'shall'],
      },
      {
        title: 'Communicative Styles: Intimate to Frozen',
        topic: 'vocabulary',
        melc: 'EN9V-IIa-27',
        easyW: 'casual',
        easyC: 'Relaxed, everyday speech style used among close friends and classmates',
        modW: 'consultative',
        modC: 'Professional speech style used between a teacher and student or doctor and patient',
        hardW: 'frozen',
        hardC: 'The most formal communicative style used in national pledges and ceremonies',
        sentence: 'Reciting the Patriotic Oath (Panatang Makabayan) during flag ceremony is an example of the ________ speech style.',
        ans: 'frozen',
        dist: ['casual', 'intimate', 'slang'],
      },
      {
        title: 'Anglo-American Poetry & Dramatic Monologue',
        topic: 'literature',
        melc: 'EN9LT-Ia-14',
        easyW: 'stanza',
        easyC: 'A grouped set of lines within a poem',
        modW: 'metaphor',
        modC: 'A figure of speech directly comparing two unlike things without using "like" or "as"',
        hardW: 'monologue',
        hardC: 'A long speech delivered by a single character in a play or poem',
        sentence: 'In William Ernest Henley’s poem "Invictus," the speaker declares: "I am the master of my fate, I am the ________ of my soul."',
        ans: 'captain',
        dist: ['passenger', 'spectator', 'stranger'],
      },
      {
        title: 'Faulty Logic, Unsupported Facts & Emotional Appeal',
        topic: 'reading',
        melc: 'EN9RC-IIIg-20',
        easyW: 'logic',
        easyC: 'Clear, sound reasoning supported by verifiable facts',
        modW: 'fallacy',
        modC: 'A mistaken belief or flawed argument based on unsound reasoning',
        hardW: 'credible',
        hardC: 'Worthy of belief; trustworthy and backed by reliable evidence',
        sentence: 'Critical listeners evaluate whether a speaker’s claim is backed by ________ evidence rather than mere rumor.',
        ans: 'verifiable',
        dist: ['exaggerated', 'unfounded', 'fictional'],
      },
    ],
    10: [
      {
        title: 'Formal Definitions: Term, Class & Differentiating Characteristics',
        topic: 'vocabulary',
        melc: 'EN10V-IIa-13.9',
        easyW: 'genus',
        easyC: 'The general class or category to which a defined term belongs',
        modW: 'definition',
        modC: 'An exact statement of the meaning of a word or concept',
        hardW: 'differentia',
        hardC: 'The distinguishing characteristic that separates a term from others in its class',
        sentence: 'In a formal definition, "A thermometer is an instrument that measures temperature," the word "instrument" is the ________.',
        ans: 'general class',
        dist: ['punctuation mark', 'slang idiom', 'closing summary'],
      },
      {
        title: 'Reflexive & Intensive Pronouns in Persuasive Essays',
        topic: 'grammar',
        melc: 'EN10G-Ia-27',
        easyW: 'himself',
        easyC: 'A singular masculine -self pronoun used reflexively or intensively',
        modW: 'reflexive',
        modC: 'A pronoun ending in -self/-selves that functions as the direct object of a verb',
        hardW: 'intensive',
        hardC: 'A -self pronoun used solely to add emphasis to a noun or pronoun already named',
        sentence: 'The barangay captain ________ led the coastal clean-up drive at dawn.',
        ans: 'himself',
        dist: ['hisself', 'theirselves', 'him'],
      },
      {
        title: 'World Literature Masterpieces & Moral Archetypes',
        topic: 'literature',
        melc: 'EN10LT-Ia-14.2',
        easyW: 'hero',
        easyC: 'A character admired for courage, noble achievements, and moral strength',
        modW: 'archetype',
        modC: 'A recurring symbol, character type, or theme found across world mythology',
        hardW: 'hubris',
        hardC: 'Excessive pride or self-confidence that leads to a tragic hero’s downfall',
        sentence: 'In the Greek myth of Daedalus and Icarus, Icarus ignored his father’s warning and flew too close to the ________.',
        ans: 'sun',
        dist: ['ocean floor', 'labyrinth wall', 'northern star'],
      },
      {
        title: 'Argumentative Claims: Fact, Value & Policy',
        topic: 'sentence-construction',
        melc: 'EN10WC-IIb-13.2',
        easyW: 'claim',
        easyC: 'A statement or assertion that an author argues is true or should be enacted',
        modW: 'policy',
        modC: 'A claim arguing that a specific rule, law, or course of action should be adopted',
        hardW: 'rebuttal',
        hardC: 'A reasoned counter-argument that refutes an opposing viewpoint',
        sentence: 'A statement containing the modal verb "should" that proposes a new school rule is a Claim of ________.',
        ans: 'Policy',
        dist: ['Fiction', 'Narration', 'Rhyme'],
      },
    ],
  };

  const result: Module[] = [];
  const gradeTemplates = curriculumByGrade[grade as 9 | 10];

  for (let q = 1; q <= 4; q++) {
    const quarter = q as QuarterNumber;
    const islandName = islandMeta[grade][`q${quarter}` as 'q1' | 'q2' | 'q3' | 'q4'];
    const color = colors[q - 1];

    for (let m = 1; m <= 4; m++) {
      const modIndex = m as 1 | 2 | 3 | 4;
      const overallNum = (q - 1) * 4 + m;
      const tmpl = gradeTemplates[m - 1];
      const suffix = q > 1 ? ` (Quarter ${q} Mastery)` : '';

      result.push(
        buildPlayableModule({
          id: `g${grade}-q${quarter}-m${modIndex}`,
          gradeLevel: grade,
          quarter,
          moduleNumber: overallNum,
          quarterModuleIndex: modIndex,
          islandName,
          islandThemeColor: color,
          title: `${tmpl.title}${suffix}`,
          topicType: tmpl.topic,
          melcCode: tmpl.melc,
          overview: `Welcome to Grade ${grade} Quarter ${quarter} on ${islandName}! This module develops your mastery of ${tmpl.title.toLowerCase()} through interactive DepEd Davao Oriental examples and gamified challenges.`,
          targetWordEasy: tmpl.easyW,
          targetWordEasyClue: tmpl.easyC,
          targetWordMod: tmpl.modW,
          targetWordModClue: tmpl.modC,
          targetWordHard: tmpl.hardW,
          targetWordHardClue: tmpl.hardC,
          missingPieceSentence: tmpl.sentence,
          missingPieceAnswer: tmpl.ans,
          missingPieceDistractors: tmpl.dist,
          analogyA: tmpl.easyW.charAt(0).toUpperCase() + tmpl.easyW.slice(1),
          analogyB: 'Foundational Concept',
          analogyC: tmpl.hardW.charAt(0).toUpperCase() + tmpl.hardW.slice(1),
          analogyAnswer: 'Advanced Mastery Concept',
          analogyDistractors: ['Unrelated Distractor', 'Informal Slang', 'Incorrect Syntax'],
        })
      );
    }
  }

  return result;
}

export const ALL_MODULES: Module[] = [
  ...ALL_GRADE_7_MODULES,
  ...ALL_GRADE_8_MODULES,
  ...ALL_GRADE_9_MODULES,
  ...ALL_GRADE_10_MODULES,
].map(expandModuleTo25Questions);

export const INITIAL_TEACHERS: TeacherAccount[] = [
  {
    id: 'tch-grade7',
    role: 'teacher',
    status: 'approved',
    name: 'Ms. Elena M. Santos',
    schoolName: 'Mati National Comprehensive High School (City of Mati)',
    department: 'Grade 7 English Faculty - Mati National Comprehensive HS',
    employeeId: 'DEPED-DO-7001',
    depEdEmail: 'teacher.grade7@deped.gov.ph',
    email: 'teacher.grade7@deped.gov.ph',
    classCode: 'LQ-G7-1007',
    gradeLevels: [7],
    gradeClassCodes: { 7: 'LQ-G7-1007' },
    staffRole: 'Teacher',
    username: 'teacher.grade7',
    password: 'TeacherG7@2026',
    isActive: true,
    joinedDate: '2026-08-01',
  },
  {
    id: 'tch-grade8',
    role: 'teacher',
    status: 'approved',
    name: 'Mr. Marco V. Solis',
    schoolName: 'Mati National Comprehensive High School (City of Mati)',
    department: 'Grade 8 English Faculty - Mati National Comprehensive HS',
    employeeId: 'DEPED-DO-8001',
    depEdEmail: 'teacher.grade8@deped.gov.ph',
    email: 'teacher.grade8@deped.gov.ph',
    classCode: 'LQ-G8-1008',
    gradeLevels: [8],
    gradeClassCodes: { 8: 'LQ-G8-1008' },
    staffRole: 'Teacher',
    username: 'teacher.grade8',
    password: 'TeacherG8@2026',
    isActive: true,
    joinedDate: '2026-08-01',
  },
  {
    id: 'tch-grade9',
    role: 'teacher',
    status: 'approved',
    name: 'Mrs. Clarissa R. Dela Cruz',
    schoolName: 'Lupon Vocational High School (Lupon)',
    department: 'Grade 9 English Faculty - Lupon Vocational High School',
    employeeId: 'DEPED-DO-9001',
    depEdEmail: 'teacher.grade9@deped.gov.ph',
    email: 'teacher.grade9@deped.gov.ph',
    classCode: 'LQ-G9-1009',
    gradeLevels: [9],
    gradeClassCodes: { 9: 'LQ-G9-1009' },
    staffRole: 'Teacher',
    username: 'teacher.grade9',
    password: 'TeacherG9@2026',
    isActive: true,
    joinedDate: '2026-08-01',
  },
  {
    id: 'tch-grade10',
    role: 'teacher',
    status: 'approved',
    name: 'Mr. Rafael L. Mendoza',
    schoolName: 'Cateel Vocational High School (Cateel)',
    department: 'Grade 10 English Faculty - Cateel Vocational High School',
    employeeId: 'DEPED-DO-1001',
    depEdEmail: 'teacher.grade10@deped.gov.ph',
    email: 'teacher.grade10@deped.gov.ph',
    classCode: 'LQ-G10-1010',
    gradeLevels: [10],
    gradeClassCodes: { 10: 'LQ-G10-1010' },
    staffRole: 'Teacher',
    username: 'teacher.grade10',
    password: 'TeacherG10@2026',
    isActive: true,
    joinedDate: '2026-08-01',
  },
];

export const INITIAL_STUDENTS: StudentAccount[] = [
  {
    id: 'stu-grade7',
    role: 'student',
    status: 'approved',
    enrollmentStatus: 'approved',
    name: 'Joshua Gabriel Dizon',
    email: 'student.grade7@deped-davaoor.edu.ph',
    learnerId: '129485070001',
    lrn: '129485070001',
    gradeLevel: 7,
    schoolName: 'Mati National Comprehensive High School (City of Mati)',
    section: 'Mabini',
    classCode: 'LQ-G7-1007',
    teacherId: 'tch-grade7',
    username: 'student.grade7',
    password: 'StudentG7@2026',
    points: 200,
    badges: ['first_lesson'],
    completedModules: [],
    progressByModule: {},
    personalizationHistory: [],
    writingSubmissions: [],
    isActive: true,
    joinedDate: '2026-08-10',
  },
  {
    id: 'stu-grade8',
    role: 'student',
    status: 'approved',
    enrollmentStatus: 'approved',
    name: 'Maria Clara Santos',
    email: 'student.grade8@deped-davaoor.edu.ph',
    learnerId: '129485080001',
    lrn: '129485080001',
    gradeLevel: 8,
    schoolName: 'Mati National Comprehensive High School (City of Mati)',
    section: 'Rizal',
    classCode: 'LQ-G8-1008',
    teacherId: 'tch-grade8',
    username: 'student.grade8',
    password: 'StudentG8@2026',
    points: 200,
    badges: ['first_lesson'],
    completedModules: [],
    progressByModule: {},
    personalizationHistory: [],
    writingSubmissions: [],
    isActive: true,
    joinedDate: '2026-08-10',
  },
  {
    id: 'stu-grade9',
    role: 'student',
    status: 'approved',
    enrollmentStatus: 'approved',
    name: 'Katrina Joy Bautista',
    email: 'student.grade9@deped-davaoor.edu.ph',
    learnerId: '129485090001',
    lrn: '129485090001',
    gradeLevel: 9,
    schoolName: 'Lupon Vocational High School (Lupon)',
    section: 'Luna',
    classCode: 'LQ-G9-1009',
    teacherId: 'tch-grade9',
    username: 'student.grade9',
    password: 'StudentG9@2026',
    points: 200,
    badges: ['first_lesson'],
    completedModules: [],
    progressByModule: {},
    personalizationHistory: [],
    writingSubmissions: [],
    isActive: true,
    joinedDate: '2026-08-10',
  },
  {
    id: 'stu-grade10',
    role: 'student',
    status: 'approved',
    enrollmentStatus: 'approved',
    name: 'Lorenzo Miguel Aquino',
    email: 'student.grade10@deped-davaoor.edu.ph',
    learnerId: '129485100001',
    lrn: '129485100001',
    gradeLevel: 10,
    schoolName: 'Cateel Vocational High School (Cateel)',
    section: 'Del Pilar',
    classCode: 'LQ-G10-1010',
    teacherId: 'tch-grade10',
    username: 'student.grade10',
    password: 'StudentG10@2026',
    points: 200,
    badges: ['first_lesson'],
    completedModules: [],
    progressByModule: {},
    personalizationHistory: [],
    writingSubmissions: [],
    isActive: true,
    joinedDate: '2026-08-10',
  },
];

export const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: 'admin-deped-davao-oriental',
    role: 'admin',
    status: 'approved',
    name: 'Department of Education Davao Oriental',
    email: 'admin.davaooriental@deped.gov.ph',
    username: 'deped.davaooriental',
    password: 'DavOr@Admin2026!',
    adminTitle: 'Division Administrative Office & Executive Main Administrator',
    employeeId: 'DEPED-DO-ADMIN-4091',
    isActive: true,
    joinedDate: '2026-07-15',
    isMainAdmin: true,
    adminLevel: 'main',
    permissions: {
      canApproveTeachers: true,
      canManageModules: true,
      canViewStudentProgress: true,
      canManageSubAdmins: true,
    },
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-seed-g7',
    adminId: 'admin-deped-davao-oriental',
    adminName: 'Department of Education Davao Oriental',
    adminEmail: 'admin.davaooriental@deped.gov.ph',
    actionType: 'teacher_approved',
    targetId: 'tch-grade7',
    targetName: 'Ms. Elena M. Santos',
    details: 'Verified DepEd employee ID DEPED-DO-7001. Approved Grade 7 Faculty account and assigned class code LQ-G7-1007.',
    timestamp: '2026-08-01 09:00:00',
  },
  {
    id: 'log-seed-g8',
    adminId: 'admin-deped-davao-oriental',
    adminName: 'Department of Education Davao Oriental',
    adminEmail: 'admin.davaooriental@deped.gov.ph',
    actionType: 'teacher_approved',
    targetId: 'tch-grade8',
    targetName: 'Mr. Marco V. Solis',
    details: 'Verified DepEd employee ID DEPED-DO-8001. Approved Grade 8 Faculty account and assigned class code LQ-G8-1008.',
    timestamp: '2026-08-01 09:15:00',
  },
  {
    id: 'log-seed-g9',
    adminId: 'admin-deped-davao-oriental',
    adminName: 'Department of Education Davao Oriental',
    adminEmail: 'admin.davaooriental@deped.gov.ph',
    actionType: 'teacher_approved',
    targetId: 'tch-grade9',
    targetName: 'Mrs. Clarissa R. Dela Cruz',
    details: 'Verified DepEd employee ID DEPED-DO-9001. Approved Grade 9 Faculty account and assigned class code LQ-G9-1009.',
    timestamp: '2026-08-01 09:30:00',
  },
  {
    id: 'log-seed-g10',
    adminId: 'admin-deped-davao-oriental',
    adminName: 'Department of Education Davao Oriental',
    adminEmail: 'admin.davaooriental@deped.gov.ph',
    actionType: 'teacher_approved',
    targetId: 'tch-grade10',
    targetName: 'Mr. Rafael L. Mendoza',
    details: 'Verified DepEd employee ID DEPED-DO-1001. Approved Grade 10 Faculty account and assigned class code LQ-G10-1010.',
    timestamp: '2026-08-01 09:45:00',
  },
];


