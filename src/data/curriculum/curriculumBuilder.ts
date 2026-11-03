import type {
  DifficultyLevel,
  GradeLevel,
  LessonContent,
  LessonExampleCard,
  Module,
  PictureOption,
  QuarterNumber,
  QuizGameType,
  QuizQuestion,
  TopicType,
} from '../../types/lingoquest.ts';

export interface ModuleSpec {
  id: string;
  gradeLevel: GradeLevel;
  quarter: QuarterNumber;
  moduleNumber: number;
  quarterModuleIndex: number;
  islandName: string;
  islandThemeColor: string;
  title: string;
  topicType: TopicType;
  melcCompetency: string;
  overview: string;
  keyRules: string[];
  examples: LessonExampleCard[];
  culturalConnection: string;
  warmupQuestion: {
    question: string;
    options: string[];
    correctAnswer: string;
    feedback: string;
  };
  writingPrompt: {
    title: string;
    instructions: string;
    sampleStarter: string;
  };
  detailedGuideSections?: {
    heading: string;
    subheading?: string;
    content: string;
    bulletPoints?: string[];
    formulaOrStructure?: string;
    signalWords?: string[];
  }[];
  vocabularyGlossary?: {
    term: string;
    partOfSpeech?: string;
    definition: string;
    exampleSentence: string;
  }[];
  commonMistakesAndTips?: {
    mistake: string;
    correction: string;
    why: string;
  }[];
  studyChecklist?: string[];
  analogy: {
    prompt: string;
    firstA: string;
    firstB: string;
    secondC: string;
    rel: string;
    answer: string;
    options: string[];
    explanation: string;
  };
  missingPiece: {
    prompt: string;
    sentence: string;
    answer: string;
    options: string[];
    explanation: string;
  };
  crossword: {
    prompt: string;
    cluePrompt: string;
    answer: string;
    options: string[];
    explanation: string;
  };
  pictureHunt: {
    prompt: string;
    options: PictureOption[];
    answer: string;
    explanation: string;
  };
  typeHunter: {
    prompt: string;
    hint: string;
    answer: string;
    explanation: string;
  };
}

// Builds exactly 5 questions per mode (overall 25 questions per module)
export function createComprehensiveModule(spec: ModuleSpec): Module {
  const amQuestions: QuizQuestion[] = [
    {
      id: `${spec.id}-am1`,
      type: 'analogyMaster',
      difficulty: 'easy',
      prompt: spec.analogy.prompt,
      analogyPair: {
        firstA: spec.analogy.firstA,
        firstB: spec.analogy.firstB,
        secondC: spec.analogy.secondC,
        relationshipType: spec.analogy.rel,
      },
      options: spec.analogy.options,
      answer: spec.analogy.answer,
      explanation: spec.analogy.explanation,
      timeLimitSeconds: 45,
    },
    {
      id: `${spec.id}-am2`,
      type: 'analogyMaster',
      difficulty: 'easy',
      prompt: `Which relationship best connects the primary rule in "${spec.title}"?`,
      analogyPair: {
        firstA: spec.title,
        firstB: 'Core Principle',
        secondC: 'Application Practice',
        relationshipType: 'Rule to Outcome',
      },
      options: ['Mastery of Skill', 'Passive Guesswork', 'Careless Reading', 'Syntax Omission'],
      answer: 'Mastery of Skill',
      explanation: `In "${spec.title}", learning the core principle leads directly to mastery of skill through deliberate application.`,
      timeLimitSeconds: 45,
    },
    {
      id: `${spec.id}-am3`,
      type: 'analogyMaster',
      difficulty: 'moderate',
      prompt: `Complete the analogy based on standard English principles:`,
      analogyPair: {
        firstA: 'Clarity',
        firstB: 'Understanding',
        secondC: 'Confusion',
        relationshipType: 'Cause and Effect',
      },
      options: ['Misinterpretation', 'Knowledge', 'Enlightenment', 'Fluency'],
      answer: 'Misinterpretation',
      explanation: `Clarity produces understanding, while grammatical confusion causes misinterpretation.`,
      timeLimitSeconds: 30,
    },
    {
      id: `${spec.id}-am4`,
      type: 'analogyMaster',
      difficulty: 'moderate',
      prompt: `Analyze the structural relationship: Evidence : Argument :: Foundation : [?]`,
      analogyPair: {
        firstA: 'Evidence',
        firstB: 'Argument',
        secondC: 'Foundation',
        relationshipType: 'Part to Whole',
      },
      options: ['Building', 'Roof', 'Window', 'Chimney'],
      answer: 'Building',
      explanation: `Evidence forms the vital part of an argument just as a foundation supports a building.`,
      timeLimitSeconds: 30,
    },
    {
      id: `${spec.id}-am5`,
      type: 'analogyMaster',
      difficulty: 'hard',
      prompt: `Which term completes the evaluative analogy for "${spec.title}"?`,
      analogyPair: {
        firstA: 'Objective Fact',
        firstB: 'Verifiable Truth',
        secondC: 'Biased Claim',
        relationshipType: 'Concept to Quality',
      },
      options: ['Subjective Opinion', 'Empirical Proof', 'Scientific Law', 'Universal Consensus'],
      answer: 'Subjective Opinion',
      explanation: `An objective fact possesses verifiable truth, whereas a biased claim reflects subjective opinion.`,
      timeLimitSeconds: 20,
    },
  ];

  const mpQuestions: QuizQuestion[] = [
    {
      id: `${spec.id}-mp1`,
      type: 'missingPiece',
      difficulty: 'easy',
      prompt: spec.missingPiece.prompt,
      contextSentence: spec.missingPiece.sentence,
      options: spec.missingPiece.options,
      answer: spec.missingPiece.answer,
      explanation: spec.missingPiece.explanation,
      timeLimitSeconds: 45,
    },
    {
      id: `${spec.id}-mp2`,
      type: 'missingPiece',
      difficulty: 'easy',
      prompt: `Select the missing term that correctly completes the grammatical rule:`,
      contextSentence: `When analyzing "${spec.title}", a skilled student always identifies the ________ before forming a conclusion.`,
      options: ['evidence', 'rumor', 'guess', 'distraction'],
      answer: 'evidence',
      explanation: `Grammatical and communicative analysis requires concrete textual evidence rather than unsupported assumptions.`,
      timeLimitSeconds: 45,
    },
    {
      id: `${spec.id}-mp3`,
      type: 'missingPiece',
      difficulty: 'moderate',
      prompt: `Choose the missing bridge term that maintains coherent discourse:`,
      contextSentence: `The researcher presented verifiable data; ________, the listeners remained convinced of the findings.`,
      options: ['consequently', 'despite', 'whereas', 'unless'],
      answer: 'consequently',
      explanation: `"Consequently" serves as the causal transition showing the direct result of presenting verifiable data.`,
      timeLimitSeconds: 30,
    },
    {
      id: `${spec.id}-mp4`,
      type: 'missingPiece',
      difficulty: 'moderate',
      prompt: `Fill in the missing piece in this contextual passage:`,
      contextSentence: `Across Davao Oriental, conservationists protect the Philippine eagle, ________ is celebrated as the national bird.`,
      options: ['which', 'whom', 'whose', 'where'],
      answer: 'which',
      explanation: `The relative pronoun "which" correctly introduces non-restrictive information referring to the national bird.`,
      timeLimitSeconds: 30,
    },
    {
      id: `${spec.id}-mp5`,
      type: 'missingPiece',
      difficulty: 'hard',
      prompt: `Select the precise syntactic piece that correctly finishes the analytical statement:`,
      contextSentence: `Neither the speaker's emotional plea nor the audience's cheers ________ the factual inaccuracy of the claim.`,
      options: ['altered', 'altering', 'was alter', 'to alter'],
      answer: 'altered',
      explanation: `The past tense indicative verb "altered" correctly completes the predicate following the correlative "Neither... nor" subject.`,
      timeLimitSeconds: 20,
    },
  ];

  const cwQuestions: QuizQuestion[] = [
    {
      id: `${spec.id}-cw1`,
      type: 'crosswordGame',
      difficulty: 'easy',
      prompt: spec.crossword.prompt,
      crosswordClue: {
        direction: 'ACROSS',
        clueNumber: 1,
        wordLength: spec.crossword.answer.length,
        cluePrompt: spec.crossword.cluePrompt,
      },
      options: spec.crossword.options,
      answer: spec.crossword.answer.toUpperCase(),
      explanation: spec.crossword.explanation,
      timeLimitSeconds: 45,
    },
    {
      id: `${spec.id}-cw2`,
      type: 'crosswordGame',
      difficulty: 'easy',
      prompt: `Solve the crossword clue for the 5-letter term for the central message or rule:`,
      crosswordClue: {
        direction: 'DOWN',
        clueNumber: 2,
        wordLength: 5,
        cluePrompt: 'The underlying subject or unifying main idea of a text or lesson',
      },
      options: ['THEME', 'TOPIC', 'STYLE', 'GENRE'],
      answer: 'THEME',
      explanation: `THEME represents the underlying lesson or overarching message in literature and communication.`,
      timeLimitSeconds: 45,
    },
    {
      id: `${spec.id}-cw3`,
      type: 'crosswordGame',
      difficulty: 'moderate',
      prompt: `Solve the crossword entry for the 6-letter grammatical element:`,
      crosswordClue: {
        direction: 'ACROSS',
        clueNumber: 3,
        wordLength: 6,
        cluePrompt: 'The systematic arrangement of words and phrases to create well-formed sentences',
      },
      options: ['SYNTAX', 'RHYME', 'DIALECT', 'SYLLABLE'],
      answer: 'SYNTAX',
      explanation: `SYNTAX governs the structural rules ordering words into clear, meaningful sentences.`,
      timeLimitSeconds: 30,
    },
    {
      id: `${spec.id}-cw4`,
      type: 'crosswordGame',
      difficulty: 'moderate',
      prompt: `Solve the crossword clue for the 4-letter term for the author's attitude:`,
      crosswordClue: {
        direction: 'DOWN',
        clueNumber: 4,
        wordLength: 4,
        cluePrompt: 'The attitude or emotional perspective expressed by a speaker or writer toward the subject',
      },
      options: ['TONE', 'MOOD', 'PACE', 'FORM'],
      answer: 'TONE',
      explanation: `TONE reveals the author or speaker's viewpoint, whether formal, critical, compassionate, or satirical.`,
      timeLimitSeconds: 30,
    },
    {
      id: `${spec.id}-cw5`,
      type: 'crosswordGame',
      difficulty: 'hard',
      prompt: `Solve the crossword clue for the 5-letter term for logical reasoning:`,
      crosswordClue: {
        direction: 'ACROSS',
        clueNumber: 5,
        wordLength: 5,
        cluePrompt: 'The classical rhetorical appeal grounded in rational evidence and sequential reasoning',
      },
      options: ['LOGOS', 'PATHOS', 'ETHOS', 'MYTHOS'],
      answer: 'LOGOS',
      explanation: `LOGOS appeals directly to intellect, valid arguments, and verifiable empirical logic.`,
      timeLimitSeconds: 20,
    },
  ];

  const phQuestions: QuizQuestion[] = [
    {
      id: `${spec.id}-ph1`,
      type: 'pictureHunt',
      difficulty: 'easy',
      prompt: spec.pictureHunt.prompt,
      pictureOptions: spec.pictureHunt.options,
      answer: spec.pictureHunt.answer,
      explanation: spec.pictureHunt.explanation,
      timeLimitSeconds: 45,
    },
    {
      id: `${spec.id}-ph2`,
      type: 'pictureHunt',
      difficulty: 'easy',
      prompt: `Which visual scene best depicts critical textual scrutiny and reading evidence?`,
      pictureOptions: [
        { id: 'p1', sceneId: 'magnifying_clue', label: 'Critical Scrutiny', caption: 'Examining words with a magnifier for evidence and context clues.' },
        { id: 'p2', sceneId: 'mountain_campfire', label: 'Campfire Leisure', caption: 'Casual recreation around a crackling campfire.' },
        { id: 'p3', sceneId: 'fishing_vinta', label: 'Traditional Fishing', caption: 'Navigating coastal waves on a wooden banca.' },
        { id: 'p4', sceneId: 'festival_dancers', label: 'Festival Dance', caption: 'Cultural choreography at a town celebration.' },
      ],
      answer: 'p1',
      explanation: 'The magnifying glass examining clues signifies active textual analysis and evidence gathering.',
      timeLimitSeconds: 45,
    },
    {
      id: `${spec.id}-ph3`,
      type: 'pictureHunt',
      difficulty: 'moderate',
      prompt: `Which scene illustrates balanced and objective evaluation without prejudice?`,
      pictureOptions: [
        { id: 'p1', sceneId: 'scales_justice', label: 'Impartial Balance', caption: 'Weighing both perspectives fairly on balanced scales.' },
        { id: 'p2', sceneId: 'megaphone_speech', label: 'Loud Propaganda', caption: 'Shouting one-sided slogans to sway the crowd.' },
        { id: 'p3', sceneId: 'lighthouse_storm', label: 'Stormy Sea', caption: 'Crashing breakers against sea walls in bad weather.' },
        { id: 'p4', sceneId: 'hourglass_time', label: 'Countdown Hourglass', caption: 'Sand slipping through an ancient glass timer.' },
      ],
      answer: 'p1',
      explanation: 'Balanced scales represent fair, objective, and unbiased evaluation of arguments.',
      timeLimitSeconds: 30,
    },
    {
      id: `${spec.id}-ph4`,
      type: 'pictureHunt',
      difficulty: 'moderate',
      prompt: `Which visual pair represents cause and effect relationship?`,
      pictureOptions: [
        { id: 'p1', sceneId: 'cause_effect_rain', label: 'Rain & Growth', caption: 'Rainfall causing fertile soil and lush seedlings.' },
        { id: 'p2', sceneId: 'opposites_contrast', label: 'Light & Shadow', caption: 'Direct contrast between light and darkness.' },
        { id: 'p3', sceneId: 'location_habitat', label: 'Marine Haven', caption: 'Coral reef habitat sheltering marine life.' },
        { id: 'p4', sceneId: 'part_whole_puzzle', label: 'Puzzle Tile', caption: 'Interlocking pieces connecting into a larger map.' },
      ],
      answer: 'p1',
      explanation: 'Rainfall directly causing plant sprouting demonstrates the cause and effect relationship.',
      timeLimitSeconds: 30,
    },
    {
      id: `${spec.id}-ph5`,
      type: 'pictureHunt',
      difficulty: 'hard',
      prompt: `Which artwork represents collaborative discourse, mutual agreement, and respectful communication?`,
      pictureOptions: [
        { id: 'p1', sceneId: 'handshake_harmony', label: 'Bayanihan Accord', caption: 'Firm handshake symbolizing mutual respect and concord.' },
        { id: 'p2', sceneId: 'megaphone_speech', label: 'Unilateral Address', caption: 'One person broadcasting without listening to feedback.' },
        { id: 'p3', sceneId: 'bamboo_bridge', label: 'Crossing the Chasm', caption: 'A lone traveler walking across a suspended bamboo bridge.' },
        { id: 'p4', sceneId: 'science_microscope', label: 'Laboratory Slide', caption: 'Observing cellular specimens through an ocular lens.' },
      ],
      answer: 'p1',
      explanation: 'The handshake represents civil discourse, harmonious collaboration, and mutual understanding in communication.',
      timeLimitSeconds: 20,
    },
  ];

  const cleanThAnswer = spec.typeHunter.answer.toLowerCase().trim();
  const thQuestions: QuizQuestion[] = [
    {
      id: `${spec.id}-th1`,
      type: 'typeHunter',
      difficulty: 'easy',
      prompt: spec.typeHunter.prompt,
      contextSentence: spec.overview.slice(0, 110),
      answer: cleanThAnswer,
      explanation: spec.typeHunter.explanation,
      timeLimitSeconds: 45,
    },
    {
      id: `${spec.id}-th2`,
      type: 'typeHunter',
      difficulty: 'easy',
      prompt: `Type the 4-letter word for the foundational guideline governing language use:`,
      contextSentence: `Every grammatical ________ guides writers toward clarity and accuracy.`,
      answer: 'rule',
      explanation: 'A "rule" is the foundational standard that ensures consistent communication.',
      timeLimitSeconds: 45,
    },
    {
      id: `${spec.id}-th3`,
      type: 'typeHunter',
      difficulty: 'moderate',
      prompt: `Type the 7-letter noun for the surrounding textual evidence needed to decode meaning:`,
      contextSentence: `Writers and readers must validate their interpretations using the surrounding ________.`,
      answer: 'context',
      explanation: '"Context" provides the surrounding information necessary to accurately interpret meaning.',
      timeLimitSeconds: 30,
    },
    {
      id: `${spec.id}-th4`,
      type: 'typeHunter',
      difficulty: 'moderate',
      prompt: `Type the 7-letter noun for clear, transparent communication:`,
      contextSentence: `Effective public speakers strive for utmost ________ in both speech and thought.`,
      answer: 'clarity',
      explanation: '"Clarity" ensures the listener understands the message without confusion.',
      timeLimitSeconds: 30,
    },
    {
      id: `${spec.id}-th5`,
      type: 'typeHunter',
      difficulty: 'hard',
      prompt: `Type the 7-letter noun for high-level skill achieved through dedicated quest practice:`,
      contextSentence: `Consistent engagement with language quests leads learners to complete ________.`,
      answer: 'mastery',
      explanation: '"Mastery" denotes complete command and expert proficiency over the curriculum standard.',
      timeLimitSeconds: 20,
    },
  ];

  // Combined exactly 25 questions: 5 of each mode
  const quizQuestions: QuizQuestion[] = [
    ...amQuestions,
    ...mpQuestions,
    ...cwQuestions,
    ...phQuestions,
    ...thQuestions,
  ];

  return {
    id: spec.id,
    gradeLevel: spec.gradeLevel,
    quarter: spec.quarter,
    moduleNumber: spec.moduleNumber,
    quarterModuleIndex: spec.quarterModuleIndex,
    islandName: spec.islandName,
    islandThemeColor: spec.islandThemeColor,
    title: spec.title,
    topicType: spec.topicType,
    requiredPassingScore: 75,
    lessonContent: {
      overview: spec.overview,
      melcCompetency: spec.melcCompetency,
      keyRules: spec.keyRules,
      examples: spec.examples,
      culturalConnection: spec.culturalConnection,
      warmupQuestion: spec.warmupQuestion,
      writingPrompt: spec.writingPrompt,
      detailedGuideSections: spec.detailedGuideSections,
      vocabularyGlossary: spec.vocabularyGlossary,
      commonMistakesAndTips: spec.commonMistakesAndTips,
      studyChecklist: spec.studyChecklist,
    },
    quizQuestions,
  };
}

// Expands any existing or custom module to guarantee exactly 5 questions per mode (overall 25 questions)
export function expandModuleTo25Questions(mod: Module): Module {
  const existingQuestions = mod.quizQuestions || [];

  const getByType = (type: QuizGameType) => existingQuestions.filter((q) => q.type === type);

  const existingAM = getByType('analogyMaster');
  const existingMP = getByType('missingPiece');
  const existingCW = getByType('crosswordGame');
  const existingPH = getByType('pictureHunt');
  const existingTH = getByType('typeHunter');

  // If already exactly 5 each (25 total), return as is
  if (
    existingAM.length >= 5 &&
    existingMP.length >= 5 &&
    existingCW.length >= 5 &&
    existingPH.length >= 5 &&
    existingTH.length >= 5
  ) {
    return {
      ...mod,
      quizQuestions: [
        ...existingAM.slice(0, 5),
        ...existingMP.slice(0, 5),
        ...existingCW.slice(0, 5),
        ...existingPH.slice(0, 5),
        ...existingTH.slice(0, 5),
      ],
    };
  }

  // Generate fallback templates for any mode that has fewer than 5
  const fallbackAM: QuizQuestion[] = [
    {
      id: `${mod.id}-am-gen1`,
      type: 'analogyMaster',
      difficulty: 'easy',
      prompt: `Which relationship best connects the primary rule in "${mod.title}"?`,
      analogyPair: {
        firstA: mod.title,
        firstB: 'Concept',
        secondC: 'Application',
        relationshipType: 'Rule to Outcome',
      },
      options: ['Mastery of Skill', 'Guesswork', 'Careless Reading', 'Syntax Error'],
      answer: 'Mastery of Skill',
      explanation: `Mastering "${mod.title}" leads directly to competence and linguistic fluency.`,
      timeLimitSeconds: 45,
    },
    {
      id: `${mod.id}-am-gen2`,
      type: 'analogyMaster',
      difficulty: 'easy',
      prompt: `Complete the analogy: Accuracy : Fluency :: Practice : [?]`,
      analogyPair: {
        firstA: 'Accuracy',
        firstB: 'Fluency',
        secondC: 'Practice',
        relationshipType: 'Cause and Effect',
      },
      options: ['Mastery', 'Hesitation', 'Error', 'Forgetfulness'],
      answer: 'Mastery',
      explanation: 'Diligent practice leads to mastery just as accuracy supports fluency.',
      timeLimitSeconds: 45,
    },
    {
      id: `${mod.id}-am-gen3`,
      type: 'analogyMaster',
      difficulty: 'moderate',
      prompt: `Complete the analogy based on standard discourse rules:`,
      analogyPair: {
        firstA: 'Clarity',
        firstB: 'Understanding',
        secondC: 'Ambiguity',
        relationshipType: 'Cause and Effect',
      },
      options: ['Confusion', 'Knowledge', 'Insight', 'Certainty'],
      answer: 'Confusion',
      explanation: 'Ambiguity causes confusion just as clarity produces understanding.',
      timeLimitSeconds: 30,
    },
    {
      id: `${mod.id}-am-gen4`,
      type: 'analogyMaster',
      difficulty: 'moderate',
      prompt: `Analyze the structural relationship: Evidence : Claim :: Foundation : [?]`,
      analogyPair: {
        firstA: 'Evidence',
        firstB: 'Claim',
        secondC: 'Foundation',
        relationshipType: 'Part to Whole',
      },
      options: ['Structure', 'Roof', 'Window', 'Door'],
      answer: 'Structure',
      explanation: 'Evidence supports a claim just as a foundation supports a structure.',
      timeLimitSeconds: 30,
    },
    {
      id: `${mod.id}-am-gen5`,
      type: 'analogyMaster',
      difficulty: 'hard',
      prompt: `Which term completes the critical evaluation analogy for "${mod.title}"?`,
      analogyPair: {
        firstA: 'Objective Fact',
        firstB: 'Verifiable Proof',
        secondC: 'Biased Claim',
        relationshipType: 'Concept to Quality',
      },
      options: ['Subjective Opinion', 'Scientific Law', 'Universal Truth', 'Empirical Data'],
      answer: 'Subjective Opinion',
      explanation: 'Biased claims reflect subjective opinion rather than verifiable proof.',
      timeLimitSeconds: 20,
    },
  ];

  const fallbackMP: QuizQuestion[] = [
    {
      id: `${mod.id}-mp-gen1`,
      type: 'missingPiece',
      difficulty: 'easy',
      prompt: `Select the missing term that correctly completes the rule in "${mod.title}":`,
      contextSentence: `When analyzing language in "${mod.title}", a skilled reader examines the ________ carefully.`,
      options: ['evidence', 'rumor', 'guess', 'distraction'],
      answer: 'evidence',
      explanation: 'Careful examination of textual evidence leads to sound conclusions.',
      timeLimitSeconds: 45,
    },
    {
      id: `${mod.id}-mp-gen2`,
      type: 'missingPiece',
      difficulty: 'easy',
      prompt: `Complete the sentence with the appropriate grammatical component:`,
      contextSentence: `Standard English conventions require that sentences maintain structural ________ throughout.`,
      options: ['consistency', 'conflict', 'randomness', 'irregularity'],
      answer: 'consistency',
      explanation: 'Consistency in grammatical structure creates clear and readable sentences.',
      timeLimitSeconds: 45,
    },
    {
      id: `${mod.id}-mp-gen3`,
      type: 'missingPiece',
      difficulty: 'moderate',
      prompt: `Choose the missing transitional piece that maintains logical flow:`,
      contextSentence: `The speaker presented verifiable proof; ________, the audience accepted the conclusion.`,
      options: ['therefore', 'although', 'whereas', 'unless'],
      answer: 'therefore',
      explanation: '"Therefore" indicates the logical consequence of presenting verifiable proof.',
      timeLimitSeconds: 30,
    },
    {
      id: `${mod.id}-mp-gen4`,
      type: 'missingPiece',
      difficulty: 'moderate',
      prompt: `Fill in the missing piece in this contextual passage:`,
      contextSentence: `Across Davao Oriental, students protect heritage sites ________ celebrate local culture.`,
      options: ['that', 'who', 'whom', 'whose'],
      answer: 'that',
      explanation: 'The relative pronoun "that" correctly introduces information regarding the heritage sites.',
      timeLimitSeconds: 30,
    },
    {
      id: `${mod.id}-mp-gen5`,
      type: 'missingPiece',
      difficulty: 'hard',
      prompt: `Select the precise syntactic piece that correctly finishes the analytical statement:`,
      contextSentence: `Neither emotional bias nor external pressure ________ the verifiable facts of the record.`,
      options: ['altered', 'altering', 'to alter', 'was alter'],
      answer: 'altered',
      explanation: 'The finite past tense verb "altered" correctly completes the predicate.',
      timeLimitSeconds: 20,
    },
  ];

  const fallbackCW: QuizQuestion[] = [
    {
      id: `${mod.id}-cw-gen1`,
      type: 'crosswordGame',
      difficulty: 'easy',
      prompt: `Solve the crossword entry for the 5-letter term for the central message or rule:`,
      crosswordClue: {
        direction: 'ACROSS',
        clueNumber: 1,
        wordLength: 5,
        cluePrompt: 'The central unifying idea of a text or lesson',
      },
      options: ['THEME', 'TOPIC', 'STYLE', 'GENRE'],
      answer: 'THEME',
      explanation: 'THEME represents the central message or idea in a literary or informative text.',
      timeLimitSeconds: 45,
    },
    {
      id: `${mod.id}-cw-gen2`,
      type: 'crosswordGame',
      difficulty: 'easy',
      prompt: `Solve the crossword clue for the 6-letter term for sentence structure:`,
      crosswordClue: {
        direction: 'DOWN',
        clueNumber: 2,
        wordLength: 6,
        cluePrompt: 'The grammatical arrangement of words into phrases and sentences',
      },
      options: ['SYNTAX', 'RHYME', 'DIALECT', 'SYLLABLE'],
      answer: 'SYNTAX',
      explanation: 'SYNTAX governs the structural rules that determine how words combine into sentences.',
      timeLimitSeconds: 45,
    },
    {
      id: `${mod.id}-cw-gen3`,
      type: 'crosswordGame',
      difficulty: 'moderate',
      prompt: `Solve the crossword clue for the 4-letter term for the author's attitude:`,
      crosswordClue: {
        direction: 'ACROSS',
        clueNumber: 3,
        wordLength: 4,
        cluePrompt: 'The attitude or emotional tone conveyed by the author',
      },
      options: ['TONE', 'MOOD', 'PACE', 'FORM'],
      answer: 'TONE',
      explanation: 'TONE conveys the author\'s attitude toward the subject matter.',
      timeLimitSeconds: 30,
    },
    {
      id: `${mod.id}-cw-gen4`,
      type: 'crosswordGame',
      difficulty: 'moderate',
      prompt: `Solve the crossword clue for the 5-letter term for logical reasoning:`,
      crosswordClue: {
        direction: 'DOWN',
        clueNumber: 4,
        wordLength: 5,
        cluePrompt: 'The classical rhetorical appeal using logic and empirical reasoning',
      },
      options: ['LOGOS', 'PATHOS', 'ETHOS', 'MYTHOS'],
      answer: 'LOGOS',
      explanation: 'LOGOS appeals directly to logic and sound reasoning.',
      timeLimitSeconds: 30,
    },
    {
      id: `${mod.id}-cw-gen5`,
      type: 'crosswordGame',
      difficulty: 'hard',
      prompt: `Solve the crossword clue for the 5-letter term for credible authority:`,
      crosswordClue: {
        direction: 'ACROSS',
        clueNumber: 5,
        wordLength: 5,
        cluePrompt: 'The rhetorical appeal based on the speaker or author\'s ethical character and credibility',
      },
      options: ['ETHOS', 'PATHOS', 'LOGOS', 'CHRONOS'],
      answer: 'ETHOS',
      explanation: 'ETHOS establishes authorial credibility and ethical trustworthiness.',
      timeLimitSeconds: 20,
    },
  ];

  const fallbackPH: QuizQuestion[] = [
    {
      id: `${mod.id}-ph-gen1`,
      type: 'pictureHunt',
      difficulty: 'easy',
      prompt: `Which visual scene best depicts critical textual scrutiny and reading evidence?`,
      pictureOptions: [
        { id: 'p1', sceneId: 'magnifying_clue', label: 'Critical Scrutiny', caption: 'Examining words with a magnifier for evidence and context clues.' },
        { id: 'p2', sceneId: 'mountain_campfire', label: 'Campfire Leisure', caption: 'Casual recreation around a crackling campfire.' },
        { id: 'p3', sceneId: 'fishing_vinta', label: 'Traditional Fishing', caption: 'Navigating coastal waves on a wooden banca.' },
        { id: 'p4', sceneId: 'festival_dancers', label: 'Festival Dance', caption: 'Cultural choreography at a town celebration.' },
      ],
      answer: 'p1',
      explanation: 'The magnifying glass examining clues signifies active textual analysis and evidence gathering.',
      timeLimitSeconds: 45,
    },
    {
      id: `${mod.id}-ph-gen2`,
      type: 'pictureHunt',
      difficulty: 'easy',
      prompt: `Which scene illustrates balanced and objective evaluation without prejudice?`,
      pictureOptions: [
        { id: 'p1', sceneId: 'scales_justice', label: 'Impartial Balance', caption: 'Weighing both perspectives fairly on balanced scales.' },
        { id: 'p2', sceneId: 'megaphone_speech', label: 'Loud Propaganda', caption: 'Shouting one-sided slogans to sway the crowd.' },
        { id: 'p3', sceneId: 'lighthouse_storm', label: 'Stormy Sea', caption: 'Crashing breakers against sea walls in bad weather.' },
        { id: 'p4', sceneId: 'hourglass_time', label: 'Countdown Hourglass', caption: 'Sand slipping through an ancient glass timer.' },
      ],
      answer: 'p1',
      explanation: 'Balanced scales represent fair, objective, and unbiased evaluation of arguments.',
      timeLimitSeconds: 45,
    },
    {
      id: `${mod.id}-ph-gen3`,
      type: 'pictureHunt',
      difficulty: 'moderate',
      prompt: `Which visual pair represents cause and effect relationship?`,
      pictureOptions: [
        { id: 'p1', sceneId: 'cause_effect_rain', label: 'Rain & Growth', caption: 'Rainfall causing fertile soil and lush seedlings.' },
        { id: 'p2', sceneId: 'opposites_contrast', label: 'Light & Shadow', caption: 'Direct contrast between light and darkness.' },
        { id: 'p3', sceneId: 'location_habitat', label: 'Marine Haven', caption: 'Coral reef habitat sheltering marine life.' },
        { id: 'p4', sceneId: 'part_whole_puzzle', label: 'Puzzle Tile', caption: 'Interlocking pieces connecting into a larger map.' },
      ],
      answer: 'p1',
      explanation: 'Rainfall directly causing plant sprouting demonstrates the cause and effect relationship.',
      timeLimitSeconds: 30,
    },
    {
      id: `${mod.id}-ph-gen4`,
      type: 'pictureHunt',
      difficulty: 'moderate',
      prompt: `Which artwork represents collaborative discourse, mutual agreement, and respectful communication?`,
      pictureOptions: [
        { id: 'p1', sceneId: 'handshake_harmony', label: 'Bayanihan Accord', caption: 'Firm handshake symbolizing mutual respect and concord.' },
        { id: 'p2', sceneId: 'megaphone_speech', label: 'Unilateral Address', caption: 'One person broadcasting without listening to feedback.' },
        { id: 'p3', sceneId: 'bamboo_bridge', label: 'Crossing the Chasm', caption: 'A lone traveler walking across a suspended bamboo bridge.' },
        { id: 'p4', sceneId: 'science_microscope', label: 'Laboratory Slide', caption: 'Observing cellular specimens through an ocular lens.' },
      ],
      answer: 'p1',
      explanation: 'The handshake represents civil discourse, harmonious collaboration, and mutual understanding in communication.',
      timeLimitSeconds: 30,
    },
    {
      id: `${mod.id}-ph-gen5`,
      type: 'pictureHunt',
      difficulty: 'hard',
      prompt: `Which visual scene symbolizes steady guidance, clarity, and direction amid challenges?`,
      pictureOptions: [
        { id: 'p1', sceneId: 'lighthouse_storm', label: 'Lighthouse Beacon', caption: 'Beaming clear navigational light through dense darkness.' },
        { id: 'p2', sceneId: 'mountain_campfire', label: 'Campfire', caption: 'Warm embers providing localized warmth.' },
        { id: 'p3', sceneId: 'fishing_vinta', label: 'Banca on Waves', caption: 'Sailing along serene turquoise shallows.' },
        { id: 'p4', sceneId: 'festival_dancers', label: 'Pageant Celebration', caption: 'Dancers performing under festive banners.' },
      ],
      answer: 'p1',
      explanation: 'The lighthouse beacon symbolizes illuminating clarity that dispels confusion and guides navigation.',
      timeLimitSeconds: 20,
    },
  ];

  const fallbackTH: QuizQuestion[] = [
    {
      id: `${mod.id}-th-gen1`,
      type: 'typeHunter',
      difficulty: 'easy',
      prompt: `Type the 4-letter word for the foundational guideline governing language use:`,
      contextSentence: `Every grammatical ________ guides writers toward clarity and accuracy.`,
      answer: 'rule',
      explanation: 'A "rule" is the foundational standard that ensures consistent communication.',
      timeLimitSeconds: 45,
    },
    {
      id: `${mod.id}-th-gen2`,
      type: 'typeHunter',
      difficulty: 'easy',
      prompt: `Type the 7-letter noun for the surrounding textual evidence needed to decode meaning:`,
      contextSentence: `Writers and readers must validate their interpretations using the surrounding ________.`,
      answer: 'context',
      explanation: '"Context" provides the surrounding information necessary to accurately interpret meaning.',
      timeLimitSeconds: 45,
    },
    {
      id: `${mod.id}-th-gen3`,
      type: 'typeHunter',
      difficulty: 'moderate',
      prompt: `Type the 7-letter noun for clear, transparent communication:`,
      contextSentence: `Effective public speakers strive for utmost ________ in both speech and thought.`,
      answer: 'clarity',
      explanation: '"Clarity" ensures the listener understands the message without confusion.',
      timeLimitSeconds: 30,
    },
    {
      id: `${mod.id}-th-gen4`,
      type: 'typeHunter',
      difficulty: 'moderate',
      prompt: `Type the 7-letter noun for high-level skill achieved through dedicated quest practice:`,
      contextSentence: `Consistent engagement with language quests leads learners to complete ________.`,
      answer: 'mastery',
      explanation: '"Mastery" denotes complete command and expert proficiency over the curriculum standard.',
      timeLimitSeconds: 30,
    },
    {
      id: `${mod.id}-th-gen5`,
      type: 'typeHunter',
      difficulty: 'hard',
      prompt: `Type the 5-letter noun for logical reasoning and valid arguments:`,
      contextSentence: `Sound analytical essays rely on clear ________ and verified evidence.`,
      answer: 'logic',
      explanation: '"Logic" is the science of correct reasoning and sound deduction.',
      timeLimitSeconds: 20,
    },
  ];

  const completeAM = [...existingAM, ...fallbackAM].slice(0, 5);
  const completeMP = [...existingMP, ...fallbackMP].slice(0, 5);
  const completeCW = [...existingCW, ...fallbackCW].slice(0, 5);
  const completePH = [...existingPH, ...fallbackPH].slice(0, 5);
  const completeTH = [...existingTH, ...fallbackTH].slice(0, 5);

  return {
    ...mod,
    quizQuestions: [
      ...completeAM,
      ...completeMP,
      ...completeCW,
      ...completePH,
      ...completeTH,
    ],
  };
}
