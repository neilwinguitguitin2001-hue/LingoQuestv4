import * as fs from 'fs';
import * as path from 'path';
import { generateModuleCode, ModuleBlueprint } from './buildCurriculum';

// --- GRADE 7 QUARTERS 2 TO 4 (20 Modules: Q2: 5, Q3: 7, Q4: 8) ---
const G7_BLUEPRINTS: ModuleBlueprint[] = [
  // QUARTER 2 (5 Modules, overall 11 to 15)
  {
    grade: 7, quarter: 2, qIdx: 1, overallNum: 11,
    title: 'Listening Strategies for Purpose and Text Difficulty',
    topic: 'listening',
    melc: 'Use listening strategies based on purpose, familiarity with the topic, and levels of difficulty of short texts listened to (EN7LC-II-a-6).',
    overview: 'Listening is an active receptive skill. Effective listeners adapt their strategy—top-down (activating background knowledge) or bottom-up (decoding sounds and vocabulary)—depending on whether they need the general gist, specific details, or critical evaluation.',
    rules: [
      'Top-Down Listening: Use prior knowledge of the topic and situation to predict meaning.',
      'Bottom-Up Listening: Focus on specific grammatical markers, keywords, and phonetic clues.',
      'Listening for Gist: Grasp the overall main idea without stressing over unfamiliar terms.',
      'Listening for Specifics: Zero in on crucial numbers, dates, locations, or directions.',
      'Critical Listening: Appraise the speaker’s tone, objective evidence, and potential bias.'
    ],
    examples: [
      { title: 'Gist vs Detail', example: 'Radio bulletin: "A gale warning is in effect over Pujada Bay; fishermen must dock before 4 PM."', analysis: 'Gist: weather danger; Specifics: 4 PM docking deadline.' },
      { title: 'Top-Down Activation', example: 'Before an interview on mangrove restoration, recalling terms like "coastal barrier" and "estuary" accelerates comprehension.', analysis: 'Activating schemata reduces listening anxiety.' }
    ],
    cultural: 'Fisherfolk communities in Mati City rely on marine radio alerts across Pujada Bay to navigate changing coastal tides.',
    warmup: {
      question: 'Which listening strategy is used when listening to a broadcast solely to note the storm signal number?',
      options: ['Listening for Specific Information', 'Bottom-Up exclusively', 'Listening for Gist', 'Appreciative Listening'],
      correctAnswer: 'Listening for Specific Information',
      feedback: 'Correct! Listening for a single datum like a storm signal number targets specific information.'
    },
    writing: {
      title: 'Listening Strategy Reflection',
      instructions: 'Summarize a recent public announcement or advisory in Davao Oriental. State the gist and two specific details.',
      sampleStarter: 'During the municipal environmental advisory regarding coastal cleanup in Dahican...'
    },
    quiz: {
      analogyPrompt: 'Main Idea : Listening for Gist :: Departure Time : _____',
      analogyA: 'Main Idea', analogyB: 'Listening for Gist', analogyC: 'Departure Time',
      analogyType: 'Listening Strategy Target', analogyAnswer: 'Listening for Specifics',
      analogyDistractors: ['Passive Hearing', 'Creative Daydreaming', 'Appreciative Listening'],
      analogyExp: 'Targeting an exact time requires listening for specific details.',
      missingPrompt: 'Complete the sentence: To catch overall meaning without translating every single word, use listening for _____.',
      missingSentence: 'To catch overall meaning without translating every single word, use listening for _____.',
      missingAnswer: 'gist', missingDistractors: ['grammar', 'spelling', 'accents'],
      missingExp: 'Listening for gist focuses on the central theme.',
      picturePrompt: 'Which visual represents Top-Down listening (using prior background knowledge)?',
      pictureLabel1: 'Mind Map of Prior Knowledge', pictureCaption1: 'Activating stored mental schemata',
      pictureLabel2: 'Word-by-word transcript', pictureCaption2: 'Decoding phonetic syllables',
      pictureAnswer: 'p1', pictureExp: 'Activating prior knowledge schemata exemplifies top-down listening.',
      crosswordPrompt: 'Solve crossword: 4-letter word for the general essence or main topic:',
      crosswordWord: 'GIST', crosswordClue: 'General meaning or main point',
      crosswordDistractors: ['DATA', 'FACT', 'NOTE'],
      crosswordExp: 'GIST is the central idea of a spoken text.',
      typePrompt: 'Type the 7-letter strategy: Listening for S P E C I F I C details:',
      typeWord: 'specific', typeHint: 'Starts with S P E C I F I C',
      typeExp: 'Specific listening catches exact facts like names and numbers.'
    }
  },
  {
    grade: 7, quarter: 2, qIdx: 2, overallNum: 12,
    title: 'Navigating Search Engines and Web Resources',
    topic: 'research',
    melc: 'Use a search engine to conduct a guided search on a given topic (EN7SS-II-c-1.5.3).',
    overview: 'Modern research requires evaluating digital query syntax. Using Boolean operators (AND, OR, NOT), quotation marks for exact phrasing, and domain verification (.gov, .edu, .org) filters credible sources from internet clutter.',
    rules: [
      'Quotation Marks (" "): Search for an exact multi-word phrase in that specific order.',
      'Boolean Operator AND: Limits searches by requiring both keywords to appear.',
      'Boolean Operator OR: Expands search to include results with either keyword.',
      'Minus / NOT (-): Excludes irrelevant or off-topic keywords from search results.',
      'Domain Evaluation: Prioritize reputable academic (.edu) and government (.gov.ph) repositories.'
    ],
    examples: [
      { title: 'Exact Phrase Search', example: '"Mount Hamiguitan wildlife sanctuary"', analysis: 'Returns only webpages containing that exact sequence of words.' },
      { title: 'Exclusion Operator', example: 'jaguar -car', analysis: 'Finds the wild feline animal while removing car brand articles.' }
    ],
    cultural: 'Students in Davao Oriental search online repositories of Subangan Provincial Museum to discover artefacts and biodiversity records.',
    warmup: {
      question: 'Which search query retrieves only documents with the exact phrase "Pujada Bay marine protected area"?',
      options: ['"Pujada Bay marine protected area"', 'Pujada + Bay + marine + protected', 'Pujada OR marine OR area', 'marine-protected-Pujada'],
      correctAnswer: '"Pujada Bay marine protected area"',
      feedback: 'Correct! Quotation marks ensure search engines match the exact phrase.'
    },
    writing: {
      title: 'Digital Search Strategy Log',
      instructions: 'Write a search query with Boolean operators to research an environmental topic in Davao Oriental, explaining each keyword.',
      sampleStarter: 'To research pitcher plant conservation on Mount Hamiguitan, my search query is...'
    },
    quiz: {
      analogyPrompt: 'Quotation Marks : Exact Phrase :: Minus Sign : _____',
      analogyA: 'Quotation Marks', analogyB: 'Exact Phrase', analogyC: 'Minus Sign',
      analogyType: 'Search Operator Function', analogyAnswer: 'Excluded Term',
      analogyDistractors: ['Boolean Union', 'Wildcard Search', 'Case Sensitivity'],
      analogyExp: 'The minus sign excludes unwanted terms from search queries.',
      missingPrompt: 'Complete: To require that both "marine" and "conservation" appear on a page, use the operator _____.',
      missingSentence: 'To require that both terms appear on a webpage, use the operator _____.',
      missingAnswer: 'AND', missingDistractors: ['OR', 'NOT', 'NEAR'],
      missingExp: 'AND mandates the inclusion of both query terms.',
      picturePrompt: 'Which domain extension indicates an accredited academic educational institution?',
      pictureLabel1: 'University domain (.edu)', pictureCaption1: 'Academic research repository',
      pictureLabel2: 'Commercial blog (.com)', pictureCaption2: 'Sponsored commercial website',
      pictureAnswer: 'p1', pictureExp: '.edu domains belong to accredited universities and schools.',
      crosswordPrompt: 'Solve crossword: 6-letter search software like Google, Bing, or DuckDuckGo:',
      crosswordWord: 'ENGINE', crosswordClue: 'Web search tool',
      crosswordDistractors: ['BROWSE', 'SERVER', 'PORTAL'],
      crosswordExp: 'A search ENGINE parses web indexes to locate data.',
      typePrompt: 'Type the 7-letter operator: B O O L E A N logic (AND, OR, NOT):',
      typeWord: 'boolean', typeHint: 'Starts with B O O L E A N',
      typeExp: 'Boolean logic guides refined internet research.'
    }
  },
  {
    grade: 7, quarter: 2, qIdx: 3, overallNum: 13,
    title: 'Evaluating Diverse Information Sources',
    topic: 'research',
    melc: 'Gather current information from newspapers and other print and non-print media (EN7SS-II-d-1.3.8).',
    overview: 'Researchers consult diverse media—print newspapers, broadcast news, peer-reviewed journals, and web portals. Determining authority, timeliness, objectivity, and verifiable evidence ensures reliable information.',
    rules: [
      'Currency: Check publication or broadcast dates to ensure information is timely and up to date.',
      'Authority: Identify the author, institutional affiliation, and editorial review process.',
      'Objectivity: Distinguish factual reportage from opinion columns and sponsored commercial content.',
      'Cross-Verification: Confirm breaking claims across multiple independent reputable news sources.',
      'Primary vs Secondary: Value eyewitness accounts and primary records over third-party commentary.'
    ],
    examples: [
      { title: 'Print News Verification', example: 'A local newspaper front page features an official provincial disaster council announcement with byline and timestamp.', analysis: 'Provides verifiable authority and accountability.' },
      { title: 'Web Source Verification', example: 'An unsigned blog post without dates or citations claims a tsunami warning.', analysis: 'Lacks credibility and must be verified against government bulletins like PAGASA or PHIVOLCS.' }
    ],
    cultural: 'Local weeklies and provincial news desks in Mati City document agricultural yields, coconut farming, and fishing harvests.',
    warmup: {
      question: 'Which source provides the highest credibility for an earthquake magnitude report in Mindanao?',
      options: ['PHIVOLCS official bulletin', 'An anonymous social media post', 'A text forwarded by a stranger', 'A meme on an entertainment forum'],
      correctAnswer: 'PHIVOLCS official bulletin',
      feedback: 'Correct! Government scientific agencies provide primary verifiable data.'
    },
    writing: {
      title: 'Source Credibility Critique',
      instructions: 'Compare two information sources on a community event and evaluate which source is more credible and why.',
      sampleStarter: 'When comparing our municipal bulletin with an unverified Facebook comment...'
    },
    quiz: {
      analogyPrompt: 'Official Gazette : Primary Source :: Opinion Column : _____',
      analogyA: 'Official Gazette', analogyB: 'Primary Source', analogyC: 'Opinion Column',
      analogyType: 'Information Classification', analogyAnswer: 'Secondary Commentary',
      analogyDistractors: ['Scientific Fact', 'Statutory Law', 'Unverifiable Rumor'],
      analogyExp: 'An opinion column is secondary interpretive commentary.',
      missingPrompt: 'Complete: To confirm that information is timely and relevant, evaluate its _____.',
      missingSentence: 'To confirm that information is timely and relevant, evaluate its _____.',
      missingAnswer: 'currency', missingDistractors: ['font', 'length', 'color'],
      missingExp: 'Currency measures how recent and updated a source is.',
      picturePrompt: 'Which media source represents print journalism with editorial accountability?',
      pictureLabel1: 'Broadsheet Newspaper', pictureCaption1: 'Editorially vetted print media',
      pictureLabel2: 'Anonymous Chatroom', pictureCaption2: 'Unverified online rumor thread',
      pictureAnswer: 'p1', pictureExp: 'Printed broadsheets undergo editorial vetting and journalistic scrutiny.',
      crosswordPrompt: 'Solve crossword: 6-letter term for the writer of a published article:',
      crosswordWord: 'AUTHOR', crosswordClue: 'Creator or writer of a text',
      crosswordDistractors: ['EDITOR', 'READER', 'CRITIC'],
      crosswordExp: 'The AUTHOR is the originator of a text.',
      typePrompt: 'Type the 7-letter word: Checking dates ensures source C U R R E N C Y:',
      typeWord: 'currency', typeHint: 'Starts with C U R R E N C Y',
      typeExp: 'Currency verifies timeliness in research.'
    }
  },
  {
    grade: 7, quarter: 2, qIdx: 4, overallNum: 14,
    title: 'Extracting Information: Summarizing, Précis, and Paraphrase',
    topic: 'reading',
    melc: 'Extract information from a text using a summary, précis, and paraphrase (EN7SS-II-e-1.3.1).',
    overview: 'Synthesizing dense text requires three key techniques: summarizing (condensing main ideas in one’s own words), writing a précis (a concise, structured abstract preserving tone and proportion), and paraphrasing (re-expressing a specific passage in fresh language while maintaining full detail).',
    rules: [
      'Paraphrase: Retains all key details and length of the original passage, reworded entirely.',
      'Summary: Condenses a long passage to its overarching main ideas, omitting minor examples.',
      'Précis: A highly disciplined, concise abstract (about one-third the original length) maintaining logical flow.',
      'Avoid Plagiarism: Always restructure sentence syntax and use synonyms rather than copying strings of words.',
      'Preserve Original Meaning: Never introduce personal opinions or distort the original author’s intent.'
    ],
    examples: [
      { title: 'Original vs Paraphrase', example: 'Original: "Mount Hamiguitan harbors hundreds of endemic pitcher plant species." -> Paraphrase: "The mountain ecosystem serves as home to numerous native pitcher plants found nowhere else."', analysis: 'Preserves the complete meaning using alternative syntax and vocabulary.' },
      { title: 'Summary Compression', example: 'Original: 3-page article on coral reef bleaching in Pujada Bay -> Summary: "Rising water temperatures in Pujada Bay have induced widespread coral bleaching, prompting marine biologists to call for local conservation measures."', analysis: 'Captures the whole narrative in two concise sentences.' }
    ],
    cultural: 'Documentaries about the Mandaya Dagmay weaving process at Subangan Museum are often summarized by students for regional heritage fairs.',
    warmup: {
      question: 'What is the primary difference between a paraphrase and a summary?',
      options: [
        'A paraphrase preserves all detailed points in fresh words, while a summary condenses only the main ideas',
        'A paraphrase adds fictional elements, while a summary must be short',
        'A summary copies exact sentences with quotes, while a paraphrase is a poem',
        'There is no difference between them'
      ],
      correctAnswer: 'A paraphrase preserves all detailed points in fresh words, while a summary condenses only the main ideas',
      feedback: 'Correct! Paraphrasing preserves full detail, whereas summarizing condenses.'
    },
    writing: {
      title: 'Paraphrase and Summary Exercise',
      instructions: 'Take a paragraph describing an endangered species in Davao Oriental. First paraphrase it, then condense it into a one-sentence summary.',
      sampleStarter: 'Original text describes the Philippine Eagle nesting on Mount Hamiguitan...'
    },
    quiz: {
      analogyPrompt: 'Paraphrase : Detailed Restatement :: Summary : _____',
      analogyA: 'Paraphrase', analogyB: 'Detailed Restatement', analogyC: 'Summary',
      analogyType: 'Comprehension Strategy', analogyAnswer: 'Condensed Main Idea',
      analogyDistractors: ['Verbatim Copy', 'Word Expansion', 'Rhyming Couplet'],
      analogyExp: 'A summary condenses main ideas into a brief overview.',
      missingPrompt: 'Complete: Rewording an author’s passage in your own voice while preserving its full length is a _____.',
      missingSentence: 'Rewording an author’s passage in your own voice while preserving its full length is a _____.',
      missingAnswer: 'paraphrase', missingDistractors: ['plagiarism', 'quotation', 'bibliography'],
      missingExp: 'Paraphrasing re-expresses ideas without changing meaning.',
      picturePrompt: 'Which strategy condenses a 500-word essay into a 50-word synthesis?',
      pictureLabel1: 'Summarizing Funnel', pictureCaption1: 'Compressing to core thesis',
      pictureLabel2: 'Word-for-Word Transcription', pictureCaption2: 'Direct copying',
      pictureAnswer: 'p1', pictureExp: 'Summarizing extracts core thesis points while eliminating minor details.',
      crosswordPrompt: 'Solve crossword: 6-letter word for a concise structured abstract (P _ _ _ _ S):',
      crosswordWord: 'PRECIS', crosswordClue: 'Concise summary or abstract',
      crosswordDistractors: ['REPORT', 'REVIEW', 'DRAFT'],
      crosswordExp: 'A PRECIS is a concise, proportional summary.',
      typePrompt: 'Type the 7-letter word: Condensing a text into core points: S U M M A R Y:',
      typeWord: 'summary', typeHint: 'Starts with S U M M A R Y',
      typeExp: 'A summary condenses text into essential takeaways.'
    }
  },
  {
    grade: 7, quarter: 2, qIdx: 5, overallNum: 15,
    title: 'Print vs Broadcast Media and Linear vs Non-Linear Texts',
    topic: 'viewing',
    melc: 'Transcode information from linear to non-linear texts and explain illustrations in diverse media (EN7RC-II-f-10).',
    overview: 'Information presents in two structural formats: linear texts (read sequentially from start to end like news articles and short stories) and non-linear texts (read non-sequentially like bar charts, flowcharts, infographics, and maps). Transcoding transforms linear data into visual representations and vice versa.',
    rules: [
      'Linear Texts: Read chronologically or sequentially from top-left to bottom-right (novels, articles, letters).',
      'Non-Linear Texts: Multi-directional reading path guided by visual layout (pie charts, venn diagrams, line graphs).',
      'Transcoding: Converting textual narrative data into a graphic organizer or turning a graph into a written report.',
      'Flowcharts: Represent sequence, decision-making, and chronological steps in a process.',
      'Venn Diagrams: Contrast similarities and differences between two or more categories.'
    ],
    examples: [
      { title: 'Linear to Non-Linear', example: 'Text: "Coconut harvest in 2024 was 100 tons, but grew to 150 tons in 2025." -> Transcoded to a 2-bar vertical chart.', analysis: 'Visual bar comparison allows instant perceptual understanding.' },
      { title: 'Graphic to Written Synthesis', example: 'Interpreting a population pie chart of Mati City barangays and explaining the largest slice in a paragraph.', analysis: 'Non-linear graphical data is decoded into linear prose.' }
    ],
    cultural: 'Infographics displaying sea turtle (Pawikan) nesting numbers along Dahican Beach transcode ecological field counts into accessible charts.',
    warmup: {
      question: 'Which of the following is an example of a non-linear text?',
      options: ['A comparative Venn diagram', 'A narrative short story', 'A traditional newspaper column', 'A diary entry'],
      correctAnswer: 'A comparative Venn diagram',
      feedback: 'Correct! Venn diagrams are non-linear graphic organizers.'
    },
    writing: {
      title: 'Transcoding Practice',
      instructions: 'Write a short linear paragraph explaining data from a chart on tourist arrivals in Pujada Bay, highlighting peak and off-peak months.',
      sampleStarter: 'According to the provincial tourism chart, tourist arrivals to Pujada Bay peaked in April...'
    },
    quiz: {
      analogyPrompt: 'Short Story : Linear Text :: Infographic : _____',
      analogyA: 'Short Story', analogyB: 'Linear Text', analogyC: 'Infographic',
      analogyType: 'Text Structure Classification', analogyAnswer: 'Non-Linear Text',
      analogyDistractors: ['Printed Novel', 'Audio Recording', 'Unformatted Script'],
      analogyExp: 'An infographic is a non-linear visual text format.',
      missingPrompt: 'Complete: Converting a paragraph into a flowchart is an act of _____.',
      missingSentence: 'Converting a paragraph into a flowchart is an act of _____.',
      missingAnswer: 'transcoding', missingDistractors: ['memorizing', 'spelling', 'deleting'],
      missingExp: 'Transcoding changes information between linear and graphical forms.',
      picturePrompt: 'Which diagram is ideal for showing similarities and differences?',
      pictureLabel1: 'Venn Diagram (Overlapping circles)', pictureCaption1: 'Comparative classification',
      pictureLabel2: 'Timeline chart', pictureCaption2: 'Chronological progression',
      pictureAnswer: 'p1', pictureExp: 'Venn diagrams compare and contrast overlapping traits.',
      crosswordPrompt: 'Solve crossword: 6-letter text read from beginning to end without jumping (L _ _ _ _ R):',
      crosswordWord: 'LINEAR', crosswordClue: 'Sequential reading format',
      crosswordDistractors: ['STATIC', 'NATIVE', 'FORMAL'],
      crosswordExp: 'LINEAR texts are read sequentially.',
      typePrompt: 'Type the 6-letter word: A visual circular data chart is a P I E chart:',
      typeWord: 'circle', typeHint: 'Round graphic slice chart',
      typeExp: 'Pie charts display fractional proportions.'
    }
  }
];

console.log('Grade 7 Quarter 2 blueprints defined: 5 modules');

export { G7_BLUEPRINTS };
