import type {
  Module,
  PictureOption,
  QuizQuestion,
} from '../types/lingoquest.ts';

// Supporting visual art sets for Grade 8 Quarter 3 (Oak Island)
const OAK_ISLAND_PICTURES: Record<string, PictureOption[]> = {
  bias_detection: [
    {
      id: 'pic-bias-scales',
      sceneId: 'scales_justice',
      label: 'Balanced vs. Slanted Scales',
      caption: 'Impartial weighing of facts represents objective writing, while tilted scales indicate bias.',
    },
    {
      id: 'pic-bias-magnifier',
      sceneId: 'magnifying_clue',
      label: 'Critical Evidence Examination',
      caption: 'Scrutinizing text for loaded words and omitted facts reveals authorial bias.',
    },
    {
      id: 'pic-bias-scroll',
      sceneId: 'ancient_scroll',
      label: 'Editorial Commentary',
      caption: 'Opinion columns often contain strong subjective viewpoints that require careful evaluation.',
    },
    {
      id: 'pic-bias-sanctuary',
      sceneId: 'planting_mangroves',
      label: 'Environmental Fact Reporting',
      caption: 'Objective news reports state verifiable scientific data on coastal ecosystems.',
    },
  ],
  propaganda_devices: [
    {
      id: 'pic-prop-megaphone',
      sceneId: 'megaphone_speech',
      label: 'Public Address & Bandwagon Appeal',
      caption: 'Urging the crowd to join in because "everyone is doing it" exemplifies the Bandwagon technique.',
    },
    {
      id: 'pic-prop-scholar',
      sceneId: 'library_scholar',
      label: 'Expert vs. Celebrity Endorsement',
      caption: 'Distinguishing credible scientific expertise from paid celebrity testimonials.',
    },
    {
      id: 'pic-prop-harmony',
      sceneId: 'handshake_harmony',
      label: 'Plain Folks & Transfer Symbols',
      caption: 'Public figures presenting themselves as simple common folk to win popular trust.',
    },
    {
      id: 'pic-prop-vinta',
      sceneId: 'fishing_vinta',
      label: 'Glittering Generalities',
      caption: 'Using inspiring patriotic imagery like the colorful vinta to evoke uncritical emotional support.',
    },
  ],
  social_moral_economic: [
    {
      id: 'pic-issue-mangrove',
      sceneId: 'planting_mangroves',
      label: 'Community Resource Conservation',
      caption: 'Protecting coastal mangrove reserves balances economic livelihoods with ecological duty.',
    },
    {
      id: 'pic-issue-scales',
      sceneId: 'scales_justice',
      label: 'Moral Integrity & Ethical Dilemmas',
      caption: 'Choosing between personal gain and communal welfare reflects fundamental moral decisions.',
    },
    {
      id: 'pic-issue-scholar',
      sceneId: 'library_scholar',
      label: 'Educational Equity (Social Issue)',
      caption: 'Ensuring every student has access to learning materials addresses systemic social disparities.',
    },
    {
      id: 'pic-issue-vinta',
      sceneId: 'fishing_vinta',
      label: 'Fisherfolk Livelihood (Economic Issue)',
      caption: 'Sustainable fishing practices support the economic wellbeing of coastal families in Davao Oriental.',
    },
  ],
  shared_heritage: [
    {
      id: 'pic-heritage-scroll',
      sceneId: 'ancient_scroll',
      label: 'Ancient Chronicles & Folktales',
      caption: 'Traditional literary epics preserve moral virtues, filial piety, and community wisdom.',
    },
    {
      id: 'pic-heritage-bridge',
      sceneId: 'bamboo_bridge',
      label: 'Bayanihan & Communal Solidarity',
      caption: 'Shared Southeast Asian values emphasize neighbors lifting together to overcome adversity.',
    },
    {
      id: 'pic-heritage-pygmy',
      sceneId: 'philippine_eagle',
      label: 'Reverence for the Natural World',
      caption: 'Indigenous Mandaya folklore honors the sacred mountain forests of Mount Hamiguitan.',
    },
    {
      id: 'pic-heritage-campfire',
      sceneId: 'mountain_campfire',
      label: 'Oral Storytelling Around the Hearth',
      caption: 'Elders passing down moral parables like "The Aged Mother" to guide younger generations.',
    },
  ],
  cohesive_devices: [
    {
      id: 'pic-cohesion-bridge',
      sceneId: 'bamboo_bridge',
      label: 'Connecting Bridge of Thought',
      caption: 'Cohesive devices act like bridges connecting clauses into a seamless, logical flow.',
    },
    {
      id: 'pic-cohesion-compass',
      sceneId: 'compass_voyage',
      label: 'Directional Transition Markers',
      caption: 'Transition words guide the listener through chronological, contrasting, and causal paths.',
    },
    {
      id: 'pic-cohesion-megaphone',
      sceneId: 'megaphone_speech',
      label: 'Fluent Public Address',
      caption: 'Skillful orators use connectors like "furthermore" and "consequently" to unify speeches.',
    },
    {
      id: 'pic-cohesion-scroll',
      sceneId: 'ancient_scroll',
      label: 'Structured Discourse',
      caption: 'Clear paragraph transitions ensure ideas follow an orderly, persuasive sequence.',
    },
  ],
  parallel_structures: [
    {
      id: 'pic-parallel-scales',
      sceneId: 'scales_justice',
      label: 'Rhythmic Grammatical Balance',
      caption: 'Parallel structure balances matching grammatical forms (gerund with gerund, clause with clause).',
    },
    {
      id: 'pic-parallel-contrast',
      sceneId: 'opposites_contrast',
      label: 'Balanced Coordinate Structures',
      caption: 'Harmonious phrasing with correlative conjunctions (not only... but also).',
    },
    {
      id: 'pic-parallel-bridge',
      sceneId: 'bamboo_bridge',
      label: 'Symmetrical Construction',
      caption: 'Equal structural weight on both sides of a coordinate conjunction builds strength.',
    },
    {
      id: 'pic-parallel-vinta',
      sceneId: 'fishing_vinta',
      label: 'Synchronized Paddling',
      caption: 'Words in a series must work in identical rhythm just like rowers propelling a sea vinta.',
    },
  ],
};

export const GRADE_8_QUARTER_3_MODULES: Module[] = [
  // -------------------------------------------------------------------------
  // MODULE 1 (Overall #9): Examining Biases in Written Texts
  // -------------------------------------------------------------------------
  {
    id: 'g8-q3-m1',
    gradeLevel: 8,
    quarter: 3,
    moduleNumber: 9,
    quarterModuleIndex: 1,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: 'Examining Biases in Written Texts',
    topicType: 'reading',
    requiredPassingScore: 75,
    lessonContent: {
      overview:
        'Bias is a disproportionate weight in favor of or against an idea, person, or group, usually in a way that is closed-minded, prejudicial, or unfair. Critical readers must detect whether an author presents balanced evidence or uses loaded language and one-sided details to sway public opinion.',
      melcCompetency:
        'EN8RC-IIIg-3.1.12: Examine biases (for or against) made by the author in print and digital texts.',
      keyRules: [
        'Recognize Loaded Words: Authors with bias use emotionally charged words (e.g., "reckless", "disastrous", "masterpiece") instead of neutral descriptors.',
        'Watch for One-Sided Evidence: An author who presents only benefits while deliberately concealing disadvantages is displaying a bias in favor.',
        'Identify Overgeneralization: Blanket statements using words like "always", "never", "all", or "none" signal unexamined bias.',
        'Distinguish Objective vs. Subjective Tone: Objective text relies on verifiable facts, statistics, and multiple perspectives; subjective text relies on personal feelings and favoritism.',
      ],
      examples: [
        {
          title: 'Biased Against',
          example:
            'The stubborn city council foolishly wasted public funds on an unnecessary coastal boardwalk project.',
          analysis:
            'Words like "stubborn" and "foolishly wasted" reveal strong authorial hostility rather than a fair presentation of facts.',
        },
        {
          title: 'Objective / Balanced Statement',
          example:
            'The city council allocated twelve million pesos to construct a coastal boardwalk, citing projected tourism growth while critics raised concerns over construction delays.',
          analysis:
            'Presents both the financial allocation, intended purpose, and opposing viewpoints neutrally without derogatory adjectives.',
        },
      ],
      culturalConnection:
        'When local newspapers report on eco-tourism projects around Pujada Bay and Oak Island in Mati City, readers must evaluate whether reports objectively present scientific conservation studies alongside community interests.',
      warmupQuestion: {
        question:
          'Which statement displays an obvious authorial bias rather than objective reporting?',
        options: [
          'The annual rainfall in Mati City was recorded at 2,100 millimeters by PAGASA.',
          'Our town’s brilliant mayor single-handedly saved our entire province from ruin.',
          'The Department of Agriculture distributed seedlings to three barangays on Tuesday.',
          'Banaybanay National High School enrolled 1,400 junior high students this school year.',
        ],
        correctAnswer:
          'Our town’s brilliant mayor single-handedly saved our entire province from ruin.',
        feedback:
          'Correct! Using words like "brilliant" and "single-handedly saved" reflects exaggerated praise and subjective bias in favor of the official.',
      },
      writingPrompt: {
        title: 'Balanced News Bulletin: Oak Island Conservation',
        instructions:
          'Write a 3-sentence balanced paragraph about a proposed eco-tourism policy on Oak Island. State one viewpoint favoring the policy and one viewpoint expressing caution, maintaining an objective tone without loaded words.',
        sampleStarter:
          'Proponents argue that regulated boat tours to Oak Island will boost local employment among fisherfolk. However, marine biologists caution that increased motorboat traffic could disturb seagrass meadows. Both groups agreed to hold a public forum before implementation...',
      },
    },
    quizQuestions: [
      {
        id: 'g8-q3-m1-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: 'Complete the analogy reflecting analytical reading terms:',
        analogyPair: {
          firstA: 'Fact',
          firstB: 'Objective',
          secondC: 'Bias',
          relationshipType: 'Characteristics',
        },
        options: ['Subjective', 'Mathematical', 'Unchanging', 'Permanent'],
        answer: 'Subjective',
        explanation: 'A fact is objective; a bias is inherently subjective.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m1-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: 'Select the word that accurately completes the definition of authorial bias:',
        contextSentence:
          'When an author displays an inclination or preference that prevents impartial judgment, they are showing ________.',
        options: ['bias', 'rhyme', 'syntax', 'fluency'],
        answer: 'bias',
        explanation: 'Bias refers to prejudice or favoritism that undermines impartiality.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m1-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt:
          'Which visual illustration best symbolizes an unbiased, objective weighing of evidence?',
        pictureOptions: OAK_ISLAND_PICTURES.bias_detection,
        answer: 'pic-bias-scales',
        explanation:
          'Evenly balanced scales symbolize fair, impartial evaluation without slant.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m1-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: 'Solve the crossword entry for a 4-letter term meaning unfair slant or prejudice:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 4,
          cluePrompt: 'A leaning towards or against something, hindering fairness',
          letterGrid: [
            { index: 0, letter: 'B', isGiven: true },
            { index: 2, letter: 'A', isGiven: true },
          ],
        },
        options: ['BIAS', 'FACT', 'TRUE', 'VIEW'],
        answer: 'BIAS',
        explanation: 'BIAS is a four-letter noun signifying unfair partiality.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m1-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt:
          'Type the 6-letter term for words chosen intentionally to provoke strong positive or negative feelings (Starts with L O A D E D):',
        contextSentence: 'Writers with bias rely heavily on ________ words to influence readers.',
        hint: 'Starts with L O A D E D',
        answer: 'loaded',
        explanation: 'Loaded words carry intense emotional connotations beyond their literal definitions.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m1-q6',
        type: 'missingPiece',
        difficulty: 'moderate',
        prompt: 'Identify the indicator of bias in this sentence:',
        contextSentence:
          'The phrase "Every single resident in Mati despises the new parking ordinance" demonstrates an invalid ________.',
        options: ['overgeneralization', 'alliteration', 'metaphor', 'onomatopoeia'],
        answer: 'overgeneralization',
        explanation:
          'Claiming that "every single resident" feels the same way without polling is an overgeneralization.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m1-q7',
        type: 'analogyMaster',
        difficulty: 'moderate',
        prompt: 'Complete the conceptual analogy:',
        analogyPair: {
          firstA: 'Impartial Witness',
          firstB: 'Neutral Account',
          secondC: 'Biased Partisan',
          relationshipType: 'Cause and Effect',
        },
        options: ['One-sided Argument', 'Scientific Formula', 'Dictionary Entry', 'Factual Census'],
        answer: 'One-sided Argument',
        explanation:
          'An impartial witness yields a neutral account; a biased partisan produces a one-sided argument.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m1-q8',
        type: 'crosswordGame',
        difficulty: 'moderate',
        prompt: 'Solve the crossword entry for a 9-letter term meaning free from personal bias or feelings:',
        crosswordClue: {
          direction: 'DOWN',
          clueNumber: 2,
          wordLength: 9,
          cluePrompt: 'Impartial and based solely on observable, verifiable facts',
          letterGrid: [
            { index: 0, letter: 'O', isGiven: true },
            { index: 3, letter: 'E', isGiven: true },
            { index: 8, letter: 'E', isGiven: true },
          ],
        },
        options: ['OBJECTIVE', 'SUBJECTIV', 'INVENTIVE', 'SELECTIVE'],
        answer: 'OBJECTIVE',
        explanation: 'OBJECTIVE means dealing with facts without distortion by personal feelings.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q3-m1-q9',
        type: 'typeHunter',
        difficulty: 'hard',
        prompt:
          'Type the 5-letter term for the angle or bias from which an author presents facts (Starts with S L A N T):',
        contextSentence: 'The editorial writer gave the report a distinctly unfavorable ________.',
        hint: 'Starts with S L A N T',
        answer: 'slant',
        explanation: 'Slant refers to the particular emphasis, angle, or bias given to a story.',
        timeLimitSeconds: 25,
      },
      {
        id: 'g8-q3-m1-q10',
        type: 'analogyMaster',
        difficulty: 'hard',
        prompt: 'Complete the advanced critical reading analogy:',
        analogyPair: {
          firstA: 'Omission of Facts',
          firstB: 'Hidden Bias',
          secondC: 'Verification of Data',
          relationshipType: 'Technique to Outcome',
        },
        options: ['Credible Assessment', 'Fictional Plot', 'Loaded Slogan', 'Propaganda Trap'],
        answer: 'Credible Assessment',
        explanation:
          'Omitting facts leads to hidden bias; verifying data results in a credible assessment.',
        timeLimitSeconds: 30,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // MODULE 2 (Overall #10): Propaganda Techniques & Media Literacy
  // -------------------------------------------------------------------------
  {
    id: 'g8-q3-m2',
    gradeLevel: 8,
    quarter: 3,
    moduleNumber: 10,
    quarterModuleIndex: 2,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: 'Propaganda Techniques & Media Literacy',
    topicType: 'vocabulary',
    requiredPassingScore: 75,
    lessonContent: {
      overview:
        'Propaganda refers to information, ideas, or rumors deliberately spread widely to help or harm a person, group, movement, or product. By studying classic propaganda techniques, Grade 8 learners build media literacy to recognize emotional manipulation and make sound, independent choices.',
      melcCompetency:
        'EN8V-IIIg-26: Analyze intention of words or expressions used in propaganda techniques.',
      keyRules: [
        'Bandwagon: Pressures people into following a trend by claiming that "everyone else is already doing it" (fear of being left out).',
        'Testimonial: Uses a famous celebrity, athlete, or respected public figure to promote an idea or commercial product, regardless of actual expertise.',
        'Transfer: Carries over positive feelings from a revered symbol (e.g., national flag, hero statue) to an unrelated product or candidate.',
        'Plain Folks: Portrays wealthy leaders or corporate heads as simple, ordinary provincial citizens to win emotional affinity.',
        'Name-Calling: Links a person or proposal to a negative, hateful label to cause rejection without examining merits.',
        'Glittering Generalities: Employs vague, emotionally appealing virtue words (e.g., "freedom", "prosperity", "honor") that have no tangible substance.',
        'Card Stacking: Manipulates perception by presenting only positive facts while deliberately concealing flaws, warnings, or opposing data.',
      ],
      examples: [
        {
          title: 'Bandwagon Technique',
          example:
            '"Nine out of ten students in Davao Oriental carry this water canteen—don’t be the only one left behind!"',
          analysis:
            'Appeals to peer pressure and the desire to conform rather than describing the durability of the canteen.',
        },
        {
          title: 'Plain Folks Technique',
          example:
            'A candidate wearing a straw hat and rubber boots eating fried bananas with local fishermen on camera.',
          analysis:
            'Designed to convince voters that the candidate understands the daily hardships of common citizens.',
        },
      ],
      culturalConnection:
        'During tourism campaigns in Mati City, promotional slogans like "Experience Pure Wonder in Pujada Bay" use glittering generalities to invite travelers, which students can analyze as persuasive rhetoric.',
      warmupQuestion: {
        question:
          'Which propaganda device is being used when a famous basketball star endorses a brand of laundry soap?',
        options: ['Testimonial', 'Card Stacking', 'Name-Calling', 'Plain Folks'],
        correctAnswer: 'Testimonial',
        feedback:
          'Correct! Using a celebrity or famous figure to endorse a product is the Testimonial technique.',
      },
      writingPrompt: {
        title: 'Media Literacy Critique: Analyzing Slogans',
        instructions:
          'Identify a popular advertisement you have seen online or on television. Name the propaganda device it utilizes, explain the intention behind its wording, and state whether the message is fair or manipulative.',
        sampleStarter:
          'The advertisement for the local energy drink uses the Bandwagon technique by declaring "All champions in Davao drink this." The intention is to make buyers feel that buying this drink guarantees athletic success...',
      },
    },
    quizQuestions: [
      {
        id: 'g8-q3-m2-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: 'Complete the propaganda classification analogy:',
        analogyPair: {
          firstA: 'Celebrity Endorsement',
          firstB: 'Testimonial',
          secondC: 'Join the Crowd',
          relationshipType: 'Technique Definition',
        },
        options: ['Bandwagon', 'Name-Calling', 'Card Stacking', 'Transfer'],
        answer: 'Bandwagon',
        explanation: 'Celebrity endorsement is Testimonial; joining the crowd is Bandwagon.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m2-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: 'Complete the sentence with the correct propaganda device:',
        contextSentence:
          'An advertisement showing an official in simple farmer clothes eating street food is using the ________ technique.',
        options: ['Plain Folks', 'Card Stacking', 'Glittering Generalities', 'Name-Calling'],
        answer: 'Plain Folks',
        explanation: 'Plain Folks portrays prominent people as simple, average citizens to build rapport.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m2-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt:
          'Which visual illustration best connects to persuasive public address and loudspeaker propaganda campaigns?',
        pictureOptions: OAK_ISLAND_PICTURES.propaganda_devices,
        answer: 'pic-prop-megaphone',
        explanation:
          'A megaphone addressing a gathered audience symbolizes loudspeaker mass persuasion and Bandwagon appeals.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m2-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: 'Solve the crossword entry for a 9-letter term for the "everyone is doing it" propaganda technique:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 9,
          cluePrompt: 'A persuasive appeal urging people to follow the majority',
          letterGrid: [
            { index: 0, letter: 'B', isGiven: true },
            { index: 4, letter: 'W', isGiven: true },
            { index: 8, letter: 'N', isGiven: true },
          ],
        },
        options: ['BANDWAGON', 'TRANSFER', 'PLAINFOLK', 'TESTIFYIN'],
        answer: 'BANDWAGON',
        explanation: 'BANDWAGON appeals to the human impulse to conform with the majority.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m2-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt:
          'Type the 11-letter word for the technique where a celebrity endorses a product (Starts with T E S T I M O N I A L):',
        contextSentence: 'The athlete appeared in a commercial to provide a glowing ________ for the sports shoe.',
        hint: 'Starts with T E S T I M O N I A L',
        answer: 'testimonial',
        explanation: 'A testimonial is a formal endorsement by an individual to promote an idea or product.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m2-q6',
        type: 'missingPiece',
        difficulty: 'moderate',
        prompt: 'Select the propaganda device matching this scenario:',
        contextSentence:
          'When a soda company highlights delicious fruit flavor while concealing that a single can contains 45 grams of sugar, it uses ________.',
        options: ['Card Stacking', 'Testimonial', 'Bandwagon', 'Transfer'],
        answer: 'Card Stacking',
        explanation:
          'Card Stacking presents only favorable facts while deliberately omitting negative information.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m2-q7',
        type: 'analogyMaster',
        difficulty: 'moderate',
        prompt: 'Complete the propaganda terms analogy:',
        analogyPair: {
          firstA: 'Derogatory Label',
          firstB: 'Name-Calling',
          secondC: 'Virtuous Vague Word',
          relationshipType: 'Technique to Device',
        },
        options: ['Glittering Generalities', 'Plain Folks', 'Card Stacking', 'Bandwagon'],
        answer: 'Glittering Generalities',
        explanation:
          'A derogatory label defines Name-Calling; a virtuous but vague word defines Glittering Generalities.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m2-q8',
        type: 'crosswordGame',
        difficulty: 'moderate',
        prompt: 'Solve the crossword entry for an 8-letter technique associating an idea with a revered symbol or emotion:',
        crosswordClue: {
          direction: 'DOWN',
          clueNumber: 3,
          wordLength: 8,
          cluePrompt: 'Carrying over positive feelings from a respected symbol to an unrelated product',
          letterGrid: [
            { index: 0, letter: 'T', isGiven: true },
            { index: 2, letter: 'A', isGiven: true },
            { index: 7, letter: 'R', isGiven: true },
          ],
        },
        options: ['TRANSFER', 'ALLIANCE', 'PRESUMED', 'ENDORSER'],
        answer: 'TRANSFER',
        explanation: 'TRANSFER links positive associations from an authority or symbol to a product.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q3-m2-q9',
        type: 'typeHunter',
        difficulty: 'hard',
        prompt:
          'Type the 10-letter propaganda term for using negative, insulting labels against a competitor (Starts with N A M E C A L L I N G):',
        contextSentence: 'Calling opponents "cowards" and "saboteurs" is an extreme form of ________.',
        hint: 'Starts with N A M E C A L L I N G',
        answer: 'namecalling',
        explanation: 'Name-calling uses derogatory language to incite fear or prejudice.',
        timeLimitSeconds: 25,
      },
      {
        id: 'g8-q3-m2-q10',
        type: 'analogyMaster',
        difficulty: 'hard',
        prompt: 'Complete the advanced media literacy analogy:',
        analogyPair: {
          firstA: 'Critical Reader',
          firstB: 'Fact-Checker',
          secondC: 'Uncritical Consumer',
          relationshipType: 'Behavioral Role',
        },
        options: ['Propaganda Victim', 'Literary Scholar', 'Authoritative Source', 'Objective Historian'],
        answer: 'Propaganda Victim',
        explanation:
          'A critical reader verifies facts; an uncritical consumer easily falls victim to deceptive propaganda.',
        timeLimitSeconds: 30,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // MODULE 3 (Overall #11): Social, Moral, and Economic Issues
  // -------------------------------------------------------------------------
  {
    id: 'g8-q3-m3',
    gradeLevel: 8,
    quarter: 3,
    moduleNumber: 11,
    quarterModuleIndex: 3,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: 'Social, Moral, and Economic Issues in Literature & Media',
    topicType: 'reading',
    requiredPassingScore: 75,
    lessonContent: {
      overview:
        'Texts we listen to and read mirror the challenges of our world. Learning to categorize these concerns into Social, Moral, and Economic issues sharpens analytical comprehension, fosters empathy, and prepares learners to propose constructive solutions for community development.',
      melcCompetency:
        'EN8LC-IIIh-7.4: Determine various social, moral, and economic issues discussed in the text listened to / read.',
      keyRules: [
        'Social Issues: Problems affecting how groups interact, interpersonal relationships, equality, and societal structures (e.g., cyberbullying, racial or gender discrimination, youth alienation, lack of access to public healthcare).',
        'Moral Issues: Questions dealing with personal conscience, right versus wrong, human virtue, honesty, betrayal, cheating, corruption, and ethical responsibility.',
        'Economic Issues: Problems concerning financial resources, livelihood, production, inflation, poverty, unemployment, fair wages, and unequal distribution of wealth.',
        'Analyze Interconnectedness: Many complex issues are linked—poverty (economic) can lead to dropping out of school (social), which may tempt individuals into dishonesty (moral).',
      ],
      examples: [
        {
          title: 'Economic Issue Example',
          example:
            'Due to rising fuel costs, small motorboat operators in Mati cannot afford fuel for their daily fishing runs, reducing family income.',
          analysis:
            'Directly involves financial resources, livelihood, and cost of living (Economic).',
        },
        {
          title: 'Moral Issue Example',
          example:
            'A treasurer pocketed money raised by the student council intended to buy school supplies for underprivileged classmates.',
          analysis:
            'Pertains to personal honesty, theft of trust, and ethical betrayal (Moral).',
        },
      ],
      culturalConnection:
        'Coastal communities along Pujada Bay balance seasonal fishing bans (an economic sacrifice for fisherfolk) with environmental stewardship (a moral duty to safeguard marine life for future generations).',
      warmupQuestion: {
        question:
          'Which issue is categorized as an ECONOMIC issue?',
        options: [
          'High unemployment rates and rising inflation in coastal municipalities',
          'Cheating during the division achievement examination',
          'Bullying a classmate on social media platforms',
          'Spreading false gossip about a community leader',
        ],
        correctAnswer:
          'High unemployment rates and rising inflation in coastal municipalities',
        feedback:
          'Correct! Unemployment and inflation deal directly with money, jobs, and financial livelihood (Economic).',
      },
      writingPrompt: {
        title: 'Youth Community Proposal: Addressing Local Issues',
        instructions:
          'Select one issue (social, moral, or economic) present in your community or school. Write a 3-sentence proposal explaining the root cause of the issue and suggesting one realistic action junior high students can take to help resolve it.',
        sampleStarter:
          'An urgent social issue in our school is the spread of unverified rumors online, which hurts classmates. To counter this, our English club proposes holding monthly media literacy workshops. By teaching students to verify sources before reposting, we promote kindness and truth...',
      },
    },
    quizQuestions: [
      {
        id: 'g8-q3-m3-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: 'Complete the issue classification analogy:',
        analogyPair: {
          firstA: 'Bribery and Graft',
          firstB: 'Moral Issue',
          secondC: 'Poverty and Inflation',
          relationshipType: 'Problem to Category',
        },
        options: ['Economic Issue', 'Spelling Rule', 'Grammar Topic', 'Poetic Meter'],
        answer: 'Economic Issue',
        explanation: 'Bribery is a moral issue; poverty and inflation are economic issues.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m3-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: 'Complete the sentence with the appropriate category of issue:',
        contextSentence:
          'Problems that affect human relationships and equality across society, such as discrimination, are called ________ issues.',
        options: ['social', 'economic', 'botanical', 'meteorological'],
        answer: 'social',
        explanation: 'Social issues involve interpersonal relationships and societal structures.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m3-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt:
          'Which visual illustration best symbolizes ethical dilemmas and weighing right versus wrong (Moral Issue)?',
        pictureOptions: OAK_ISLAND_PICTURES.social_moral_economic,
        answer: 'pic-issue-scales',
        explanation:
          'Scales of justice symbolize conscience, personal ethics, and moral integrity.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m3-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: 'Solve the crossword entry for a 6-letter term meaning issues concerning society and social relationships:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 6,
          cluePrompt: 'Relating to society or communal human interactions',
          letterGrid: [
            { index: 0, letter: 'S', isGiven: true },
            { index: 2, letter: 'C', isGiven: true },
            { index: 5, letter: 'L', isGiven: true },
          ],
        },
        options: ['SOCIAL', 'CIVICS', 'PUBLIC', 'ETHICS'],
        answer: 'SOCIAL',
        explanation: 'SOCIAL issues concern community structures, equality, and societal health.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m3-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt:
          'Type the 8-letter category term for problems involving money, jobs, and financial livelihoods (Starts with E C O N O M I C):',
        contextSentence: 'Widespread unemployment is an urgent ________ challenge for developing provinces.',
        hint: 'Starts with E C O N O M I C',
        answer: 'economic',
        explanation: 'Economic issues pertain to finances, employment, production, and resources.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m3-q6',
        type: 'missingPiece',
        difficulty: 'moderate',
        prompt: 'Select the issue classification matching this narrative scenario:',
        contextSentence:
          'When a factory supervisor accepts hush money to conceal toxic wastewater dumped into Pujada Bay, they have committed a ________ failure.',
        options: ['moral', 'spelling', 'grammatical', 'lexical'],
        answer: 'moral',
        explanation:
          'Accepting hush money and betraying public safety is a violation of ethical and moral duty.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m3-q7',
        type: 'analogyMaster',
        difficulty: 'moderate',
        prompt: 'Complete the multi-category analogy:',
        analogyPair: {
          firstA: 'Cyberbullying',
          firstB: 'Social Issue',
          secondC: 'Dishonesty in Public Office',
          relationshipType: 'Issue Classification',
        },
        options: ['Moral Issue', 'Economic Issue', 'Literary Genre', 'Pronunciation Guide'],
        answer: 'Moral Issue',
        explanation:
          'Cyberbullying is a social issue; dishonesty in office is fundamentally a moral issue.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m3-q8',
        type: 'crosswordGame',
        difficulty: 'moderate',
        prompt: 'Solve the crossword entry for an 8-letter word meaning issues concerning finance, employment, and production:',
        crosswordClue: {
          direction: 'DOWN',
          clueNumber: 2,
          wordLength: 8,
          cluePrompt: 'Pertaining to commerce, livelihoods, and financial resources',
          letterGrid: [
            { index: 0, letter: 'E', isGiven: true },
            { index: 2, letter: 'O', isGiven: true },
            { index: 7, letter: 'C', isGiven: true },
          ],
        },
        options: ['ECONOMIC', 'DOMESTIC', 'FINANCIAL', 'COMMERCE'],
        answer: 'ECONOMIC',
        explanation: 'ECONOMIC issues relate to financial systems and community livelihood.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q3-m3-q9',
        type: 'typeHunter',
        difficulty: 'hard',
        prompt:
          'Type the 5-letter term for the set of standards of good conduct and moral righteousness (Starts with M O R A L):',
        contextSentence: 'Fostering strong ________ values empowers youths to reject dishonesty.',
        hint: 'Starts with M O R A L',
        answer: 'moral',
        explanation: 'Moral principles distinguish right actions from wrong actions.',
        timeLimitSeconds: 25,
      },
      {
        id: 'g8-q3-m3-q10',
        type: 'analogyMaster',
        difficulty: 'hard',
        prompt: 'Complete the cause-and-effect issue analogy:',
        analogyPair: {
          firstA: 'Equitable Education',
          firstB: 'Social Harmony',
          secondC: 'Job Creation Initiatives',
          relationshipType: 'Action to Benefit',
        },
        options: ['Economic Growth', 'Literary Conflict', 'Unchecked Inflation', 'Biased Reporting'],
        answer: 'Economic Growth',
        explanation:
          'Equitable education promotes social harmony; job creation initiatives spur economic growth.',
        timeLimitSeconds: 30,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // MODULE 4 (Overall #12): Literature as a Mirror to a Shared Heritage
  // -------------------------------------------------------------------------
  {
    id: 'g8-q3-m4',
    gradeLevel: 8,
    quarter: 3,
    moduleNumber: 12,
    quarterModuleIndex: 4,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: 'Literature as a Mirror to a Shared Heritage',
    topicType: 'literature',
    requiredPassingScore: 75,
    lessonContent: {
      overview:
        'Literature acts as a cultural mirror reflecting the values, historical struggles, and philosophies of a people. Through Afro-Asian and Southeast Asian folk epics, poems, and parables, learners discover that diverse cultures share universal bonds: reverence for elders, loyalty to family, love of nature, and fortitude in adversity.',
      melcCompetency:
        'EN8LT-IIIa-11: Analyze literature as a mirror to a shared heritage of people with diverse backgrounds.',
      keyRules: [
        'Literature as Cultural Mirror: Characters, conflicts, and resolutions in folk narratives illuminate what a society cherishes or condemns.',
        'Shared Southeast Asian Heritage: Themes of filial piety (respect for parents/ancestors), communal solidarity (Bayanihan in the Philippines, Gotong Royong in Indonesia), and hospitality bridge diverse nationalities.',
        'Symbolism of Nature: Asian folklore frequently depicts mountains, rivers, and trees as sacred homes of spiritual guardians, advocating ecological balance.',
        'The Hero’s Journey in Epics: Epic heroes (e.g., Lam-ang in the Philippines, Rama in India) undertake trials not for selfish glory, but to protect family and uphold cosmic justice.',
      ],
      examples: [
        {
          title: 'Filial Piety in "The Aged Mother" (Japanese Folktale by Matsuo Basho)',
          example:
            'A poor farmer refuses to abandon his elderly mother on the mountain, and her profound wisdom ultimately saves their province from a tyrant governor.',
          analysis:
            'Demonstrates the universal Asian belief that elderly people possess invaluable wisdom that must be honored rather than discarded.',
        },
        {
          title: 'Communal Solidarity Across Borders',
          example:
            'The Filipino tradition of Bayanihan mirrors the Indonesian concept of Gotong Royong—neighbors uniting without pay to rebuild fallen homes.',
          analysis:
            'Shows how different languages share an identical cultural foundation of mutual aid and collective strength.',
        },
      ],
      culturalConnection:
        'The indigenous Mandaya of Davao Oriental preserve oral chants (Bayok) and epics celebrating the guardian spirits of Mount Hamiguitan, mirroring Thai and Burmese nature tales that treat the forest with spiritual reverence.',
      warmupQuestion: {
        question:
          'In Matsuo Basho’s Japanese folktale "The Aged Mother," what central cultural value is mirrored?',
        options: [
          'Profound respect and reverence for elderly family members',
          'The accumulation of personal gold and material wealth',
          'Strict military conquest of neighboring islands',
          'Abandoning traditional customs in favor of modern machines',
        ],
        correctAnswer:
          'Profound respect and reverence for elderly family members',
        feedback:
          'Correct! The tale celebrates filial piety and the enduring wisdom of elderly ancestors.',
      },
      writingPrompt: {
        title: 'Tribute to Ancestral Wisdom: Family Reflection',
        instructions:
          'Write a 3-sentence tribute describing an important lesson or tradition taught to you by an elder (grandparent, parent, or community leader) and explain how practicing this lesson reflects our shared cultural heritage.',
        sampleStarter:
          'My grandmother taught me that true strength lies in humility and helping neighbors during times of crisis. Whenever our barangay holds a coastal cleanup, I remember her words about honoring our ancestral waters. Carrying on this tradition keeps our community united and resilient...',
      },
    },
    quizQuestions: [
      {
        id: 'g8-q3-m4-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: 'Complete the cultural concept analogy:',
        analogyPair: {
          firstA: 'Philippines',
          firstB: 'Bayanihan',
          secondC: 'Indonesia',
          relationshipType: 'Country to Communal Value',
        },
        options: ['Gotong Royong', 'Individualism', 'Isolation', 'Competition'],
        answer: 'Gotong Royong',
        explanation:
          'Bayanihan in the Philippines corresponds to Gotong Royong in Indonesia, both meaning communal cooperation.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m4-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: 'Complete the sentence reflecting Southeast Asian literary themes:',
        contextSentence:
          'In Asian literature, the deep devotion and respect children show toward their parents and ancestors is called ________ piety.',
        options: ['filial', 'fictional', 'formal', 'financial'],
        answer: 'filial',
        explanation: 'Filial piety is the virtue of honoring and caring for one’s parents and ancestors.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m4-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt:
          'Which visual illustration best symbolizes ancient folklore, oral heritage, and cultural epics?',
        pictureOptions: OAK_ISLAND_PICTURES.shared_heritage,
        answer: 'pic-heritage-scroll',
        explanation:
          'An ancient scroll and manuscript symbolizes literary heritage preserved across generations.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m4-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: 'Solve the crossword entry for an 8-letter term meaning valued traditions and culture passed down through generations:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 8,
          cluePrompt: 'Valued cultural traditions inherited from past generations',
          letterGrid: [
            { index: 0, letter: 'H', isGiven: true },
            { index: 3, letter: 'I', isGiven: true },
            { index: 7, letter: 'E', isGiven: true },
          ],
        },
        options: ['HERITAGE', 'FOLKLORE', 'ANCESTOR', 'CUSTOMS'],
        answer: 'HERITAGE',
        explanation: 'HERITAGE comprises the shared traditions, literature, and beliefs passed down over centuries.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m4-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt:
          'Type the 6-letter term for traditional stories handed down among a people (Starts with L E G E N D):',
        contextSentence: 'The mountain elders shared an ancient ________ about the origins of Pujada Bay.',
        hint: 'Starts with L E G E N D',
        answer: 'legend',
        explanation: 'A legend is a traditional story popularly regarded as historical but unauthenticated.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m4-q6',
        type: 'missingPiece',
        difficulty: 'moderate',
        prompt: 'Complete the sentence regarding classical world literature:',
        contextSentence:
          'In Matsuo Basho’s tale, the aged mother left a trail of snapped ________ so her son could safely find his way down the treacherous mountain.',
        options: ['twigs', 'stones', 'bread crumbs', 'coins'],
        answer: 'twigs',
        explanation:
          'The mother lovingly snapped twigs and dropped them along the path to ensure her son would not get lost.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m4-q7',
        type: 'analogyMaster',
        difficulty: 'moderate',
        prompt: 'Complete the literary epic analogy:',
        analogyPair: {
          firstA: 'Biag ni Lam-ang',
          firstB: 'Ilocano Epic',
          secondC: 'Ramayana',
          relationshipType: 'Work to Tradition',
        },
        options: ['Indian Epic', 'Greek Myth', 'Roman History', 'Modern Novel'],
        answer: 'Indian Epic',
        explanation:
          'Biag ni Lam-ang is a famous Ilocano epic; the Ramayana is a foundational Indian epic.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m4-q8',
        type: 'crosswordGame',
        difficulty: 'moderate',
        prompt: 'Solve the crossword entry for a 7-letter word for the traditional beliefs, customs, and stories of a community:',
        crosswordClue: {
          direction: 'DOWN',
          clueNumber: 2,
          wordLength: 8,
          cluePrompt: 'Traditional beliefs, myths, and oral stories of a community',
          letterGrid: [
            { index: 0, letter: 'F', isGiven: true },
            { index: 4, letter: 'L', isGiven: true },
            { index: 7, letter: 'E', isGiven: true },
          ],
        },
        options: ['FOLKLORE', 'PROVERBS', 'PARABLES', 'EPICPOEM'],
        answer: 'FOLKLORE',
        explanation: 'FOLKLORE preserves the unwritten customs and stories of a cultural community.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q3-m4-q9',
        type: 'typeHunter',
        difficulty: 'hard',
        prompt:
          'Type the 7-letter term for a long narrative poem recounting the heroic deeds of legendary figures (Starts with E P I C):',
        contextSentence: 'The Darangen is an ancient Maranao ________ preserved through generations.',
        hint: 'Starts with E P I C (Noun: epic poem or epic)',
        answer: 'epic',
        explanation: 'An epic is a lengthy narrative poem celebrating heroic adventures and cultural identity.',
        timeLimitSeconds: 25,
      },
      {
        id: 'g8-q3-m4-q10',
        type: 'analogyMaster',
        difficulty: 'hard',
        prompt: 'Complete the thematic literature analogy:',
        analogyPair: {
          firstA: 'The Aged Mother',
          firstB: 'Filial Wisdom',
          secondC: 'Panchatantra Tales',
          relationshipType: 'Work to Moral Theme',
        },
        options: ['Moral Prudence and Wit', 'Revenge and War', 'Greed and Sloth', 'Colonial Conquest'],
        answer: 'Moral Prudence and Wit',
        explanation:
          'The Aged Mother demonstrates filial wisdom; the animal fables of the Panchatantra teach moral prudence and practical wit.',
        timeLimitSeconds: 30,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // MODULE 5 (Overall #13): Cohesive Devices in Speeches
  // -------------------------------------------------------------------------
  {
    id: 'g8-q3-m5',
    gradeLevel: 8,
    quarter: 3,
    moduleNumber: 13,
    quarterModuleIndex: 5,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: 'Cohesive Devices in Informative & Persuasive Speeches',
    topicType: 'grammar',
    requiredPassingScore: 75,
    lessonContent: {
      overview:
        'Cohesive devices (transitions, connectives, and linking phrases) serve as linguistic bridges between clauses, sentences, and paragraphs. In public speaking and written prose, appropriate cohesive markers guide the audience through the speaker’s logic smoothly without confusion.',
      melcCompetency:
        'EN8G-IIIe-12: Use appropriate cohesive devices in various types of speeches.',
      keyRules: [
        'Addition Markers: Reinforce or expand an idea (furthermore, moreover, in addition, besides, also).',
        'Contrast / Adversative Markers: Introduce an opposing idea or limitation (however, on the other hand, nevertheless, yet, whereas).',
        'Causal / Result Markers: Show cause, reason, or consequence (therefore, consequently, as a result, hence, thus).',
        'Sequential / Chronological Markers: Outline time, stages, or steps (first, subsequently, meanwhile, finally, in conclusion).',
        'Avoid Redundancy: Do not use conflicting transition signals in the same clause (e.g., avoid "Although... but").',
      ],
      examples: [
        {
          title: 'Cause-and-Effect in Speech',
          example:
            'The volunteer students planted five hundred mangrove propagules along the coast; consequently, the tidal erosion along the shoreline decreased remarkably.',
          analysis:
            '"Consequently" signals that the reduction in coastal erosion is the direct result of the mangrove planting.',
        },
        {
          title: 'Contrast / Adversative Marker',
          example:
            'The hike up Mount Hamiguitan was strenuous and steep; nevertheless, the researchers persevered to document the pygmy forest.',
          analysis:
            '"Nevertheless" establishes that the researchers continued their mission despite the difficulty.',
        },
      ],
      culturalConnection:
        'Student leaders delivering campaign speeches at Banaybanay and Mati high schools rely on cohesive markers like "furthermore" and "in conclusion" to present clear platforms for campus improvement.',
      warmupQuestion: {
        question:
          'Which cohesive device best shows a CONTRAST between two statements?',
        options: ['however', 'furthermore', 'moreover', 'consequently'],
        correctAnswer: 'however',
        feedback:
          'Correct! "However" is used to introduce a statement that contrasts with what was previously said.',
      },
      writingPrompt: {
        title: 'Persuasive Speech Draft: Youth Marine Protection',
        instructions:
          'Write a 3-sentence speech excerpt persuading your classmates to stop using single-use plastics during beach visits to Oak Island. Incorporate at least one cohesive device of addition (e.g., moreover) and one of cause-and-effect (e.g., therefore).',
        sampleStarter:
          'Single-use plastics discarded along our shores endanger sea turtles in Pujada Bay. Moreover, microplastics pollute the marine food chain upon which local families depend. Therefore, let us commit to carrying reusable tumblers whenever we visit Oak Island...',
      },
    },
    quizQuestions: [
      {
        id: 'g8-q3-m5-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: 'Complete the cohesive device function analogy:',
        analogyPair: {
          firstA: 'Furthermore',
          firstB: 'Addition',
          secondC: 'Therefore',
          relationshipType: 'Signal to Purpose',
        },
        options: ['Cause and Effect', 'Physical Location', 'Opening Salutation', 'Dictionary Pronunciation'],
        answer: 'Cause and Effect',
        explanation: '"Furthermore" indicates addition; "therefore" signals cause and effect.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m5-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: 'Select the cohesive device that best connects these ideas logically:',
        contextSentence:
          'The sky turned dark with heavy rain clouds; ________, the fishermen secured their vintas to the shore posts.',
        options: ['therefore', 'however', 'conversely', 'on the other hand'],
        answer: 'therefore',
        explanation: 'Securing the boats is the logical result of the stormy sky, so "therefore" is correct.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m5-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt:
          'Which visual illustration best symbolizes cohesive devices bridging ideas smoothly across a speech?',
        pictureOptions: OAK_ISLAND_PICTURES.cohesive_devices,
        answer: 'pic-cohesion-bridge',
        explanation:
          'A bamboo footbridge symbolizes linking two separate sides into one continuous, traversable whole.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m5-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: 'Solve the crossword entry for a 9-letter causal cohesive device meaning "for that reason" or "as a result":',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 9,
          cluePrompt: 'A transitional adverb meaning consequently or for that reason',
          letterGrid: [
            { index: 0, letter: 'T', isGiven: true },
            { index: 4, letter: 'E', isGiven: true },
            { index: 8, letter: 'E', isGiven: true },
          ],
        },
        options: ['THEREFORE', 'HOWBEIT', 'FURTHERMORE', 'CONVERSE'],
        answer: 'THEREFORE',
        explanation: 'THEREFORE is a formal transition indicating a logical deduction or result.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m5-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt:
          'Type the 7-letter transition word used to introduce a statement that contrasts with a previous one (Starts with H O W E V E R):',
        contextSentence: 'The storm was fierce; ________, our roof held strong.',
        hint: 'Starts with H O W E V E R',
        answer: 'however',
        explanation: '"However" introduces an adversative contrast between two independent clauses.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m5-q6',
        type: 'missingPiece',
        difficulty: 'moderate',
        prompt: 'Complete the sentence with an appropriate transition of addition:',
        contextSentence:
          'The school library acquired fifty new English references; ________, it opened ten internet terminals for student research.',
        options: ['moreover', 'on the contrary', 'otherwise', 'nevertheless'],
        answer: 'moreover',
        explanation: '"Moreover" adds a related, supporting point of equal or greater importance.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m5-q7',
        type: 'analogyMaster',
        difficulty: 'moderate',
        prompt: 'Complete the transition markers analogy:',
        analogyPair: {
          firstA: 'However',
          firstB: 'Contrast',
          secondC: 'Meanwhile',
          relationshipType: 'Function to Type',
        },
        options: ['Time and Sequence', 'Direct Causation', 'Formal Addition', 'Final Conclusion'],
        answer: 'Time and Sequence',
        explanation: '"However" expresses contrast; "meanwhile" indicates concurrent time / sequence.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m5-q8',
        type: 'crosswordGame',
        difficulty: 'moderate',
        prompt: 'Solve the crossword entry for a 7-letter cohesive device meaning "besides" or "in addition":',
        crosswordClue: {
          direction: 'DOWN',
          clueNumber: 2,
          wordLength: 8,
          cluePrompt: 'A formal connective meaning in addition or furthermore',
          letterGrid: [
            { index: 0, letter: 'M', isGiven: true },
            { index: 4, letter: 'E', isGiven: true },
            { index: 7, letter: 'R', isGiven: true },
          ],
        },
        options: ['MOREOVER', 'HOWEVER', 'LIKEWISE', 'ALTHOUGH'],
        answer: 'MOREOVER',
        explanation: 'MOREOVER adds extra information that supports the prior point.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q3-m5-q9',
        type: 'typeHunter',
        difficulty: 'hard',
        prompt:
          'Type the 12-letter transition word meaning "in spite of that" or "nonetheless" (Starts with N E V E R T H E L E S S):',
        contextSentence: 'The sea was choppy; ________, the coast guard launched the rescue vessel.',
        hint: 'Starts with N E V E R T H E L E S S',
        answer: 'nevertheless',
        explanation: '"Nevertheless" conveys that an action occurred despite a potential obstacle.',
        timeLimitSeconds: 25,
      },
      {
        id: 'g8-q3-m5-q10',
        type: 'analogyMaster',
        difficulty: 'hard',
        prompt: 'Complete the speech transitions analogy:',
        analogyPair: {
          firstA: 'First and Subsequently',
          firstB: 'Chronological Sequence',
          secondC: 'On the other hand and Conversely',
          relationshipType: 'Marker to Category',
        },
        options: ['Opposing Contrast', 'Strict Causality', 'Simple Addition', 'Summary Restatement'],
        answer: 'Opposing Contrast',
        explanation:
          '"First/subsequently" mark chronology; "on the other hand/conversely" signal opposing contrast.',
        timeLimitSeconds: 30,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // MODULE 6 (Overall #14): Parallel Structures
  // -------------------------------------------------------------------------
  {
    id: 'g8-q3-m6',
    gradeLevel: 8,
    quarter: 3,
    moduleNumber: 14,
    quarterModuleIndex: 6,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: 'Parallel Structures in Sentence Construction & Rhetoric',
    topicType: 'sentence-construction',
    requiredPassingScore: 75,
    lessonContent: {
      overview:
        'Parallel structure (also called parallelism) is the repetition of a chosen grammatical form within a sentence. By matching coordinate words, phrases, or clauses, writers and speakers create balance, clarity, and rhetorical rhythm that makes ideas memorable.',
      melcCompetency:
        'EN8G-Ia-7: Use parallel structures in words, phrases, clauses, and coordinate sentences.',
      keyRules: [
        'Parallel Words in a Series: Coordinate words must share the exact grammatical form (e.g., all nouns, all adjectives, or all gerunds: "swimming, hiking, and camping").',
        'Parallel Infinitive Phrases: Either repeat "to" before every verb or use "to" only once before the first verb (e.g., "to read, to write, and to speak" OR "to read, write, and speak").',
        'Parallel Clauses: Coordinate clauses linked by "and" or "but" must maintain structural symmetry (e.g., "what we say and what we do").',
        'Correlative Conjunctions: Structures following pairs like "not only... but also", "either... or", "neither... nor" must be grammatically identical.',
        'Faulty Parallelism: Mixing disparate forms (e.g., "She likes reading, swimming, and to dance" - INCORRECT; should be "and dancing").',
      ],
      examples: [
        {
          title: 'Faulty vs. Correct Parallelism',
          example:
            'Faulty: The island guide is knowledgeable, courteous, and exhibits great patience.\nCorrect: The island guide is knowledgeable, courteous, and patient.',
          analysis:
            'In the faulty sentence, two adjectives are paired with a verb phrase. The correction balances three parallel adjectives.',
        },
        {
          title: 'Parallelism with Correlative Conjunctions',
          example:
            'The young athlete aims not only to win the regional trophy, but also to inspire her schoolmates.',
          analysis:
            'Both "not only" and "but also" are followed by parallel infinitive phrases ("to win...", "to inspire...").',
        },
      ],
      culturalConnection:
        'The civic motto of Davao Oriental—"Protect our seas, preserve our forests, and empower our communities"—employs a parallel triad of imperative verbs that resonates with rhythmic pride.',
      warmupQuestion: {
        question:
          'Which sentence correctly follows the rule of parallel structure?',
        options: [
          'Maria likes reading poetry, baking bibingka, and to swim in Pujada Bay.',
          'Maria likes reading poetry, baking bibingka, and swimming in Pujada Bay.',
          'Maria likes to read poetry, baking bibingka, and swims in Pujada Bay.',
          'Maria likes poetry, to bake bibingka, and swimming in Pujada Bay.',
        ],
        correctAnswer:
          'Maria likes reading poetry, baking bibingka, and swimming in Pujada Bay.',
        feedback:
          'Correct! All three activities in the series use the gerund (-ing) form: reading, baking, and swimming.',
      },
      writingPrompt: {
        title: 'Rhetorical Parallelism: School Club Creed',
        instructions:
          'Compose a 3-sentence creed for an environmental club in your school using parallel structures. Include one sentence with parallel verbs, one with parallel prepositional phrases, and one using "not only... but also".',
        sampleStarter:
          'As guardians of Oak Island, we pledge to clean our shores, to protect our reefs, and to educate our peers. We work with dedication in our classrooms, along the beaches, and throughout our barangay. Our mission is not only to preserve natural beauty, but also to inspire lasting change...',
      },
    },
    quizQuestions: [
      {
        id: 'g8-q3-m6-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: 'Complete the grammatical parallelism analogy:',
        analogyPair: {
          firstA: 'Hiking',
          firstB: 'Swimming',
          secondC: 'Reading',
          relationshipType: 'Gerund Parallelism',
        },
        options: ['Writing', 'To write', 'Wrote', 'Written by him'],
        answer: 'Writing',
        explanation: 'Hiking, swimming, reading, and writing all share the coordinate gerund form.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m6-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: 'Select the phrase that maintains parallel structure:',
        contextSentence:
          'The environmental volunteer was praised for her courage, her compassion, and ________.',
        options: ['her dedication', 'she was dedicated', 'being very dedicated', 'acting with great dedication'],
        answer: 'her dedication',
        explanation:
          '"her courage, her compassion, and her dedication" balances three coordinate possessive noun phrases.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m6-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt:
          'Which visual illustration best symbolizes the harmonious balance of parallel structures?',
        pictureOptions: OAK_ISLAND_PICTURES.parallel_structures,
        answer: 'pic-parallel-scales',
        explanation:
          'Even scales symbolize equal grammatical weight and balance in coordinate sentences.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m6-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: 'Solve the crossword entry for an 8-letter term meaning matching grammatical forms in coordinate series:',
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 8,
          cluePrompt: 'Side-by-side matching grammatical structure in writing',
          letterGrid: [
            { index: 0, letter: 'P', isGiven: true },
            { index: 3, letter: 'A', isGiven: true },
            { index: 7, letter: 'L', isGiven: true },
          ],
        },
        options: ['PARALLEL', 'BALANCED', 'SYMMETRY', 'EQUALISE'],
        answer: 'PARALLEL',
        explanation: 'PARALLEL sentence structure matches identical grammatical patterns.',
        timeLimitSeconds: 40,
      },
      {
        id: 'g8-q3-m6-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt:
          'Type the 7-letter word for the state of equilibrium achieved through parallel structures (Starts with B A L A N C E):',
        contextSentence: 'Parallel sentence architecture brings clarity, rhythm, and ________ to speeches.',
        hint: 'Starts with B A L A N C E',
        answer: 'balance',
        explanation: 'Balance is the harmonious equality of structural parts in a sentence.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m6-q6',
        type: 'missingPiece',
        difficulty: 'moderate',
        prompt: 'Choose the word that corrects the faulty parallelism:',
        contextSentence:
          'The team captain told the players to practice daily, to eat nutritious meals, and ________ adequate sleep.',
        options: ['to get', 'getting', 'get', 'they must get'],
        answer: 'to get',
        explanation:
          'Repeats the infinitive marker "to" consistently: "to practice, to eat, and to get".',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m6-q7',
        type: 'analogyMaster',
        difficulty: 'moderate',
        prompt: 'Complete the correlative conjunction parallelism analogy:',
        analogyPair: {
          firstA: 'Either ... Or',
          firstB: 'Alternative Choices',
          secondC: 'Not only ... But also',
          relationshipType: 'Conjunction to Rhetorical Effect',
        },
        options: ['Cumulative Emphasis', 'Direct Contradiction', 'Single Option', 'Mathematical Equality'],
        answer: 'Cumulative Emphasis',
        explanation:
          '"Either... or" introduces alternatives; "not only... but also" provides cumulative parallel emphasis.',
        timeLimitSeconds: 35,
      },
      {
        id: 'g8-q3-m6-q8',
        type: 'crosswordGame',
        difficulty: 'moderate',
        prompt: 'Solve the crossword entry for a 6-letter term for the -ing verbal form frequently used in parallel lists:',
        crosswordClue: {
          direction: 'DOWN',
          clueNumber: 2,
          wordLength: 6,
          cluePrompt: 'A verb form functioning as a noun ending in -ing',
          letterGrid: [
            { index: 0, letter: 'G', isGiven: true },
            { index: 2, letter: 'R', isGiven: true },
            { index: 5, letter: 'D', isGiven: true },
          ],
        },
        options: ['GERUND', 'CLAUSE', 'PHRASE', 'SYNTAX'],
        answer: 'GERUND',
        explanation: 'GERUND lists (e.g. running, swimming, sailing) must maintain identical forms.',
        timeLimitSeconds: 30,
      },
      {
        id: 'g8-q3-m6-q9',
        type: 'typeHunter',
        difficulty: 'hard',
        prompt:
          'Type the 10-letter adjective for paired conjunctions like "neither... nor" and "not only... but also" (Starts with C O R R E L A T I V E):',
        contextSentence: 'Parallel forms must always follow ________ conjunction pairs.',
        hint: 'Starts with C O R R E L A T I V E',
        answer: 'correlative',
        explanation: 'Correlative conjunctions link grammatically equal sentence elements.',
        timeLimitSeconds: 25,
      },
      {
        id: 'g8-q3-m6-q10',
        type: 'analogyMaster',
        difficulty: 'hard',
        prompt: 'Complete the rhetorical style analogy:',
        analogyPair: {
          firstA: 'Faulty Parallelism',
          firstB: 'Jarring Rhythm',
          secondC: 'Flawless Parallelism',
          relationshipType: 'Technique to Audience Effect',
        },
        options: ['Rhetorical Elegance', 'Unclear Ambiguity', 'Passive Voice', 'Punctuation Error'],
        answer: 'Rhetorical Elegance',
        explanation:
          'Faulty parallelism results in jarring rhythm; flawless parallelism produces rhetorical elegance and clarity.',
        timeLimitSeconds: 30,
      },
    ],
  },
];
