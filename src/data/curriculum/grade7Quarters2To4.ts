import type { Module } from '../../types/lingoquest.ts';

export const GRADE_7_Q2_TO_Q4_MODULES: Module[] = [
  {
    id: 'g7-q2-m1',
    gradeLevel: 7,
    quarter: 2,
    moduleNumber: 11,
    quarterModuleIndex: 1,
    islandName: 'Oak Island',
    islandThemeColor: '#059669',
    title: "Listening Strategies for Purpose and Text Difficulty",
    topicType: 'listening' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Effective listeners choose between top-down strategies (prior knowledge) and bottom-up strategies (decoding sounds and words) depending on whether their goal is general gist, specific details, or critical interpretation.",
      melcCompetency: "Use listening strategies based on purpose, familiarity with the topic, and levels of difficulty of short texts listened to (EN7LC-II-a-6)",
      keyRules: [
        "Top-Down Listening: Uses background knowledge to predict and infer spoken messages.",
        "Bottom-Up Listening: Focuses on individual words, syllables, and grammatical inflections.",
        "Listening for Gist: Aims at grasping the main topic without fixating on single unfamiliar words.",
        "Listening for Specifics: Filters audio to catch exact dates, times, names, or emergency instructions.",
        "Critical Listening: Evaluates speaker tone, objectivity, and supporting evidence."
],
      examples: [
        {
          title: "Listening for Gist",
          example: "Radio announcement: \"PAGASA warns fisherfolk in Pujada Bay to stay in port due to rough Pacific swells.\"",
          analysis: "Gist: ocean travel is hazardous today due to weather."
        },
        {
          title: "Listening for Specifics",
          example: "Advisory: \"Boat departures from Waniban Island resume tomorrow strictly at 6:30 AM.\"",
          analysis: "Focuses on the exact time (6:30 AM) and departure location."
        }
      ],
      culturalConnection: "Coastal fisherfolk in Mati City tune to provincial radio stations to monitor tide warnings and safety advisories across Pujada Bay.",
      warmupQuestion: {
        question: "What listening strategy is best when you only need to know what time a community boat departs?",
        options: ["Listening for Specific Information","Appreciative Listening","Listening for General Gist","Daydreaming"],
        correctAnswer: "Listening for Specific Information",
        feedback: "Correct! An exact departure time requires listening for specific details."
      },
      writingPrompt: {
        title: "Listening Reflection Journal",
        instructions: "Summarize a recent school or community announcement, identifying the main gist and two specific details.",
        sampleStarter: "During the flag ceremony announcement regarding the district English festival..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q2-m1-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Main Idea : Gist :: Exact Departure Time : _____",
        analogyPair: {
          firstA: "Main Idea",
          firstB: "Gist",
          secondC: "Departure Time",
          relationshipType: "Listening Purpose"
        },
        options: ["Specific Detail","Vague Guess","Poetic Rhythm","Passive Murmur"],
        answer: "Specific Detail",
        explanation: "Exact departure time is a specific detail.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m1-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Focusing on the overall topic rather than every word is listening for _____.",
        contextSentence: "Focusing on the overall topic rather than every word is listening for _____.",
        options: ["gist","spelling","accents","rhymes"],
        answer: "gist",
        explanation: "Listening for gist captures the main idea.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m1-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which visual represents top-down listening using background knowledge?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Brainstorming Mind Map", caption: "Activating prior knowledge schemata" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Audio Waveform", caption: "Raw sound frequencies" }
        ],
        answer: 'p1',
        explanation: "Mind maps activate prior knowledge for top-down comprehension.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m1-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 4-letter word for main point of a spoken text:",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 4,
          cluePrompt: "Central idea or essence"
        },
        options: ["GIST","FACT","DATA","CLUE"],
        answer: "GIST",
        explanation: "GIST means main point.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m1-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 7-letter word: Listening for S P E C I F I C information:",
        hint: "Starts with S P E C I F I C",
        answer: "specific",
        explanation: "Specific listening catches exact details.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q2-m2',
    gradeLevel: 7,
    quarter: 2,
    moduleNumber: 12,
    quarterModuleIndex: 2,
    islandName: 'Oak Island',
    islandThemeColor: '#059669',
    title: "Navigating Search Engines and Web Resources",
    topicType: 'research' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Digital research requires precise query formulation. Using Boolean operators (AND, OR, NOT), quotation marks for exact phrasing, and domain evaluation (.gov, .edu, .org) separates academic facts from online misinformation.",
      melcCompetency: "Use a search engine to conduct a guided search on a given topic (EN7SS-II-c-1.5.3)",
      keyRules: [
        "Quotation Marks (\" \"): Forces the search engine to match words in that exact order.",
        "AND Operator: Requires both search terms to appear on the indexed webpage.",
        "OR Operator: Expands search to pages containing either term.",
        "Minus / NOT (-): Excludes pages containing a specific keyword.",
        "Domain Evaluation: Academic (.edu) and government (.gov.ph) domains provide highest credibility."
],
      examples: [
        {
          title: "Exact Phrase Match",
          example: "\"Pujada Bay Protected Seascape\"",
          analysis: "Returns exclusively pages with that exact 4-word title."
        },
        {
          title: "Exclusion Search",
          example: "Hamiguitan -tourism",
          analysis: "Finds ecological research about Mount Hamiguitan while filtering out travel advertisements."
        }
      ],
      culturalConnection: "Junior high students in Mati City utilize search tools to study Mount Hamiguitan’s UNESCO World Heritage dossier.",
      warmupQuestion: {
        question: "Which query searches for the exact phrase \"Davao Oriental wildlife\"?",
        options: ["\"Davao Oriental wildlife\"","Davao + Oriental + wildlife","Davao OR wildlife","wildlife-Davao-Oriental"],
        correctAnswer: "\"Davao Oriental wildlife\"",
        feedback: "Correct! Quotation marks search for the exact phrase."
      },
      writingPrompt: {
        title: "Search Query Plan",
        instructions: "Formulate two refined search queries to research endangered species in Davao Oriental.",
        sampleStarter: "To investigate the habitat of the Philippine Eagle in Mount Hamiguitan, my search queries are..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q2-m2-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Quotation Marks : Exact Phrase :: Minus Sign : _____",
        analogyPair: {
          firstA: "Quotation Marks",
          firstB: "Exact Phrase",
          secondC: "Minus Sign",
          relationshipType: "Search Operator"
        },
        options: ["Excluded Term","Capitalization","Spelling Check","Hyperlink"],
        answer: "Excluded Term",
        explanation: "The minus sign excludes keywords.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m2-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: To require that both words appear in results, use the operator _____.",
        contextSentence: "To require that both words appear in results, use the operator _____.",
        options: ["AND","OR","NOT","IF"],
        answer: "AND",
        explanation: "AND joins terms.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m2-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which website domain belongs to an accredited educational institution?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "University Portal (.edu)", caption: "Accredited academic domain" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Commercial Blog (.com)", caption: "Sponsored commercial page" }
        ],
        answer: 'p1',
        explanation: ".edu represents academic institutions.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m2-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 6-letter search software (Google, Bing):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 6,
          cluePrompt: "Web search software"
        },
        options: ["ENGINE","PORTAL","BROWSE","SERVER"],
        answer: "ENGINE",
        explanation: "Search ENGINE queries indexes.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m2-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 7-letter word: B O O L E A N logic (AND, OR, NOT):",
        hint: "Starts with B O O L E A N",
        answer: "boolean",
        explanation: "Boolean operators refine web searches.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q2-m3',
    gradeLevel: 7,
    quarter: 2,
    moduleNumber: 13,
    quarterModuleIndex: 3,
    islandName: 'Oak Island',
    islandThemeColor: '#059669',
    title: "Evaluating Diverse Information Sources",
    topicType: 'research' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Critical researchers examine the credibility of information across print broadsheets, television broadcasts, podcasts, and digital articles by assessing currency, authority, accuracy, and objectivity.",
      melcCompetency: "Gather current information from newspapers and other print and non-print media (EN7SS-II-d-1.3.8)",
      keyRules: [
        "Currency: Verify publication date to ensure timely, non-outdated information.",
        "Authority: Confirm author credentials and institutional accountability.",
        "Objectivity: Differentiate factual news reportage from opinion-based editorials.",
        "Cross-Verification: Corroborate claims across multiple independent reputable agencies.",
        "Primary vs Secondary: Value eyewitness accounts and primary records over rumors."
],
      examples: [
        {
          title: "Vetted News Report",
          example: "Philippine News Agency headline with byline, timestamp, and quotes from municipal scientists.",
          analysis: "High credibility with transparent attribution."
        },
        {
          title: "Unverified Social Media Post",
          example: "An anonymous Facebook post warning of impending monster waves without official attribution.",
          analysis: "Lacks institutional authority and requires verification against PAGASA."
        }
      ],
      culturalConnection: "Community weeklies in Mati and Baganga chronicle coconut farming developments and coastal municipal ordinances.",
      warmupQuestion: {
        question: "What is the most reliable source for a storm advisory in Region XI?",
        options: ["PAGASA official weather bulletin","An anonymous social media post","A text forwarded by a classmate","A meme page"],
        correctAnswer: "PAGASA official weather bulletin",
        feedback: "Correct! Government scientific agencies provide verified primary data."
      },
      writingPrompt: {
        title: "Source Comparison Log",
        instructions: "Compare a verified newspaper article with a viral social media claim on an environmental topic.",
        sampleStarter: "When contrasting the official Department of Environment report with online commentary..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q2-m3-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Official Gazette : Primary Source :: Op-Ed Column : _____",
        analogyPair: {
          firstA: "Official Gazette",
          firstB: "Primary Source",
          secondC: "Op-Ed Column",
          relationshipType: "Source Type"
        },
        options: ["Opinion Commentary","Scientific Law","Factual Census","Legal Statute"],
        answer: "Opinion Commentary",
        explanation: "An op-ed column represents opinion commentary.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m3-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Checking the date of publication verifies its _____.",
        contextSentence: "Checking the date of publication verifies its _____.",
        options: ["currency","font","volume","color"],
        answer: "currency",
        explanation: "Currency measures timeliness.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m3-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which medium features editorially vetted print journalism?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Printed Daily Broadsheet", caption: "Editorially vetted journalism" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Anonymous Chatroom", caption: "Unverified rumor stream" }
        ],
        answer: 'p1',
        explanation: "Printed broadsheets undergo editorial review.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m3-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 6-letter creator of an article or book:",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 6,
          cluePrompt: "Originator of a written text"
        },
        options: ["AUTHOR","EDITOR","READER","CRITIC"],
        answer: "AUTHOR",
        explanation: "The AUTHOR writes the text.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m3-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 7-letter word: Checking dates ensures source C U R R E N C Y:",
        hint: "Starts with C U R R E N C Y",
        answer: "currency",
        explanation: "Currency ensures information is current.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q2-m4',
    gradeLevel: 7,
    quarter: 2,
    moduleNumber: 14,
    quarterModuleIndex: 4,
    islandName: 'Oak Island',
    islandThemeColor: '#059669',
    title: "Extracting Information: Summarizing, Précis, and Paraphrase",
    topicType: 'reading' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Extracting information effectively requires three complementary methods: paraphrasing (restating passage meaning completely in fresh words), summarizing (condensing overarching ideas), and précis writing (producing a balanced, concise abstract).",
      melcCompetency: "Extract information from a text using a summary, précis, and paraphrase (EN7SS-II-e-1.3.1)",
      keyRules: [
        "Paraphrase: Re-expresses full passage details in fresh vocabulary without shortening.",
        "Summary: Condenses lengthy text into main overarching points.",
        "Précis: A disciplined abstract preserving the original author’s logical flow and tone.",
        "Avoid Plagiarism: Restructure sentence grammar and synonyms rather than copying phrases.",
        "Preserve Accuracy: Maintain original authorial intent without injecting personal bias."
],
      examples: [
        {
          title: "Paraphrase Example",
          example: "Original: \"Dahican Beach hosts critical nesting grounds for endangered green turtles.\" -> Paraphrase: \"The shores of Dahican provide essential breeding habitat for threatened sea turtles.\"",
          analysis: "Preserves the entire meaning using fresh syntax and synonyms."
        },
        {
          title: "Summary Compression",
          example: "Original: 4-page article on coral reef conservation -> Summary: \"Community initiatives in Pujada Bay protect marine ecosystems from destructive fishing.\"",
          analysis: "Condenses the entire text into its core thesis."
        }
      ],
      culturalConnection: "Exhibits at Subangan Provincial Museum summarize centuries of Mandaya folklore and marine biodiversity for visitors.",
      warmupQuestion: {
        question: "What is the main distinction between paraphrasing and summarizing?",
        options: ["Paraphrasing keeps full detail in new words, while summarizing condenses to main ideas","Paraphrasing is shorter than a summary","Summarizing copies exact sentences with quotes","They are completely identical"],
        correctAnswer: "Paraphrasing keeps full detail in new words, while summarizing condenses to main ideas",
        feedback: "Correct! Paraphrasing maintains detail while summarizing condenses."
      },
      writingPrompt: {
        title: "Paraphrase and Summary Task",
        instructions: "Paraphrase a paragraph about Mount Hamiguitan and then summarize it into one concise sentence.",
        sampleStarter: "The original excerpt highlights the pygmy bonsai forest of Mount Hamiguitan..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q2-m4-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Paraphrase : Detailed Restatement :: Summary : _____",
        analogyPair: {
          firstA: "Paraphrase",
          firstB: "Detailed Restatement",
          secondC: "Summary",
          relationshipType: "Comprehension Strategy"
        },
        options: ["Condensed Overview","Verbatim Copy","Poetic Meter","Word Expansion"],
        answer: "Condensed Overview",
        explanation: "A summary condenses main ideas.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m4-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Restating a passage in your own words while retaining its full meaning is a _____.",
        contextSentence: "Restating a passage in your own words while retaining its full meaning is a _____.",
        options: ["paraphrase","plagiarism","quotation","misinterpretation"],
        answer: "paraphrase",
        explanation: "Paraphrasing preserves meaning in new words.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m4-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which process condenses an entire chapter into a single summary page?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Summarizing Funnel", caption: "Distilling main ideas" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Photocopy Machine", caption: "Duplicating every word" }
        ],
        answer: 'p1',
        explanation: "Summarizing distills core concepts.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m4-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 6-letter concise structured abstract:",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 6,
          cluePrompt: "Concise summary or abstract"
        },
        options: ["PRECIS","REPORT","REVIEW","DRAFT"],
        answer: "PRECIS",
        explanation: "A PRECIS is a concise summary.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m4-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 7-letter word: Condensing main ideas into a S U M M A R Y:",
        hint: "Starts with S U M M A R Y",
        answer: "summary",
        explanation: "A summary highlights essential points.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q2-m5',
    gradeLevel: 7,
    quarter: 2,
    moduleNumber: 15,
    quarterModuleIndex: 5,
    islandName: 'Oak Island',
    islandThemeColor: '#059669',
    title: "Print vs Broadcast Media and Linear vs Non-Linear Texts",
    topicType: 'viewing' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Texts are organized either linearly (read sequentially from start to end) or non-linearly (read through visual graphics like tables, flowcharts, Venn diagrams, and infographics). Transcoding converts text between these two presentation formats.",
      melcCompetency: "Transcode information from linear to non-linear texts and explain illustrations in diverse media (EN7RC-II-f-10)",
      keyRules: [
        "Linear Text: Follows sequential narrative order (newspaper articles, stories, speeches).",
        "Non-Linear Text: Follows multi-directional visual flow (charts, graphs, diagrams, maps).",
        "Transcoding: Converting narrative text into a graphic organizer or turning data charts into written paragraphs.",
        "Flowcharts: Illustrate procedural steps and sequential decision points.",
        "Venn Diagrams: Highlight shared features and distinct differences between topics."
],
      examples: [
        {
          title: "Linear to Non-Linear Transcoding",
          example: "Text: \"Pujada Bay visitor numbers reached 20,000 in 2024 and 35,000 in 2025.\" -> Transcoded to a 2-bar vertical comparison graph.",
          analysis: "Visual bar chart enables rapid data comparison."
        },
        {
          title: "Graphic to Linear Transcoding",
          example: "Reading a temperature and rainfall line graph of Mati City and explaining the wet season in a written paragraph.",
          analysis: "Visual trends are converted into descriptive sentences."
        }
      ],
      culturalConnection: "Provincial eco-tourism brochures feature non-linear infographics showing travel routes from Davao City to Mati and Baganga.",
      warmupQuestion: {
        question: "Which of the following represents a non-linear text?",
        options: ["A Venn diagram comparing two islands","A printed novel chapter","A formal letter of request","A personal journal entry"],
        correctAnswer: "A Venn diagram comparing two islands",
        feedback: "Correct! Venn diagrams are non-linear graphic organizers."
      },
      writingPrompt: {
        title: "Transcoding Synthesis Exercise",
        instructions: "Examine a table of tourist arrivals in Davao Oriental and write a descriptive linear paragraph summarizing the trends.",
        sampleStarter: "Based on the municipal tourism table, travel to Waniban Island surged during summer months..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q2-m5-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Newspaper Article : Linear Text :: Infographic : _____",
        analogyPair: {
          firstA: "Newspaper Article",
          firstB: "Linear Text",
          secondC: "Infographic",
          relationshipType: "Text Format"
        },
        options: ["Non-Linear Text","Audio Podcast","Printed Novel","Spoken Monologue"],
        answer: "Non-Linear Text",
        explanation: "An infographic is a non-linear text.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m5-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Converting narrative paragraphs into graphic flowcharts is an act of _____.",
        contextSentence: "Converting narrative paragraphs into graphic flowcharts is an act of _____.",
        options: ["transcoding","memorizing","spelling","deleting"],
        answer: "transcoding",
        explanation: "Transcoding converts between linear and visual formats.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m5-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which diagram is used to compare overlapping traits between two concepts?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Venn Diagram (Overlapping circles)", caption: "Comparative traits" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Linear Timeline", caption: "Sequential dates" }
        ],
        answer: 'p1',
        explanation: "Venn diagrams show overlapping traits.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m5-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 6-letter text read sequentially from start to finish:",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 6,
          cluePrompt: "Sequential reading structure"
        },
        options: ["LINEAR","STATIC","NATIVE","CASUAL"],
        answer: "LINEAR",
        explanation: "LINEAR text flows sequentially.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q2-m5-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 7-letter word: Converting text into graphics: T R A N S C O D E:",
        hint: "Starts with T R A N S C O D E",
        answer: "transcode",
        explanation: "Transcoding converts data across formats.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q3-m1',
    gradeLevel: 7,
    quarter: 3,
    moduleNumber: 16,
    quarterModuleIndex: 1,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: "Multimedia Resources in Oral Communication",
    topicType: 'speaking' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Oral communication is enriched by multimedia resources—slides, audio clips, charts, and video demonstrations—which clarify complex instructions, engage audience attention, and reinforce verbal delivery.",
      melcCompetency: "Use multimedia resources when orally giving information, instructions, making explanations and narrating events (EN7OL-III-b-3)",
      keyRules: [
        "Visual Synergy: Multimedia should complement spoken words, never replace the speaker.",
        "Clarity over Clutter: Keep slides concise with bullet points, high-contrast text, and relevant imagery.",
        "Audio Integration: Use recorded sound clips judiciously to illustrate real-world oral history or dialect.",
        "Audience Engagement: Maintain eye contact with the audience rather than reading directly from screens.",
        "Rehearsal: Test audio-visual equipment in advance to avoid technical disruptions."
],
      examples: [
        {
          title: "Slide Presentation",
          example: "A student delivering a report on Dahican marine life displays an infographic map while explaining sea turtle nesting sites.",
          analysis: "Visual map reinforces spoken geography."
        },
        {
          title: "Audio Demonstration",
          example: "Playing an authentic Mandaya vocal chant before explaining traditional musical rhythm.",
          analysis: "Audio provides direct sensory evidence to listeners."
        }
      ],
      culturalConnection: "Oral presentations during Mati City youth environmental summits use multimedia slides to showcase Pujada Bay conservation.",
      warmupQuestion: {
        question: "What is the primary role of multimedia during an oral presentation?",
        options: ["To enhance and clarify spoken ideas","To give the speaker an excuse not to speak","To display every single word spoken","To distract the audience with bright lights"],
        correctAnswer: "To enhance and clarify spoken ideas",
        feedback: "Correct! Multimedia should enhance and clarify oral messages."
      },
      writingPrompt: {
        title: "Multimedia Presentation Outline",
        instructions: "Plan a 3-slide oral presentation about a landmark in Davao Oriental, describing visuals and spoken talking points.",
        sampleStarter: "For my presentation on the Sleeping Dinosaur landmark in Mati City, Slide 1 will show..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q3-m1-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Spoken Words : Audio :: Slide Infographic : _____",
        analogyPair: {
          firstA: "Spoken Words",
          firstB: "Audio",
          secondC: "Slide Infographic",
          relationshipType: "Media Mode"
        },
        options: ["Visual Resource","Printed Textbook","Silent Reading","Stage Prop"],
        answer: "Visual Resource",
        explanation: "An infographic is a visual resource.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m1-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Multimedia slides should clarify ideas rather than _____ the audience.",
        contextSentence: "Multimedia slides should clarify ideas rather than _____ the audience.",
        options: ["distract","inform","engage","guide"],
        answer: "distract",
        explanation: "Slides should never distract listeners.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m1-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which visual represents effective oral presentation delivery?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Speaker engaging audience with slide visual", caption: "Balanced multimedia delivery" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Speaker reading directly off screen", caption: "Disconnected delivery" }
        ],
        answer: 'p1',
        explanation: "Effective speakers maintain eye contact while referencing visuals.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m1-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 5-letter term for electronic presentation pages:",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 5,
          cluePrompt: "Presentation graphic page"
        },
        options: ["SLIDE","FRAME","SHEET","BOARD"],
        answer: "SLIDE",
        explanation: "A SLIDE displays presentation content.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m1-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 5-letter word: Presentation visual S L I D E:",
        hint: "Starts with S L I D E",
        answer: "slide",
        explanation: "Slides support oral presentations.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q3-m2',
    gradeLevel: 7,
    quarter: 3,
    moduleNumber: 17,
    quarterModuleIndex: 2,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: "Factors of Oral Delivery, Stance, and Non-Verbal Cues",
    topicType: 'speaking' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Persuasive public speaking combines verbal clarity (volume, pitch, pace, pausing) with non-verbal cues (confident posture, deliberate hand gestures, natural eye contact, and purposeful facial expressions).",
      melcCompetency: "Employ the appropriate oral language and non-verbal cues in varied oral communication situations (EN7OL-III-d-3)",
      keyRules: [
        "Volume and Projection: Speak with sufficient breath support so listeners in the back hear clearly.",
        "Pace and Pausing: Use strategic pauses before key terms to allow concepts to settle.",
        "Posture and Stance: Stand balanced with shoulders relaxed and feet grounded to project authority.",
        "Facial Expressions: Align expressions with emotional tone (serious for crises, warm for welcoming).",
        "Eye Contact: Sweep gaze across all sections of the room to foster personal connection."
],
      examples: [
        {
          title: "Strategic Pausing",
          example: "\"Our bay is fragile. [Pause] But together... [Pause] we can preserve it.\"",
          analysis: "Pauses create dramatic emphasis and highlight resolve."
        },
        {
          title: "Non-Verbal Gestures",
          example: "Extending open hands when welcoming guest speakers versus pointing aggressively.",
          analysis: "Open gestures project warmth and inclusivity."
        }
      ],
      culturalConnection: "Mandaya tribal leaders in Davao Oriental command community gatherings through resonant voice projection and dignified stance.",
      warmupQuestion: {
        question: "What happens when a speaker speaks too quickly without pausing?",
        options: ["Listeners struggle to digest key points","The speech becomes more understandable","Volume automatically increases","Eye contact improves"],
        correctAnswer: "Listeners struggle to digest key points",
        feedback: "Correct! Rapid delivery without pausing overwhelms audience retention."
      },
      writingPrompt: {
        title: "Speech Delivery Critique",
        instructions: "Evaluate your own public speaking habits, noting one verbal strength and one non-verbal cue to improve.",
        sampleStarter: "When delivering speeches in class, I notice that my vocal projection is clear, but..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q3-m2-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Vocal Projection : Verbal Cue :: Eye Contact : _____",
        analogyPair: {
          firstA: "Vocal Projection",
          firstB: "Verbal Cue",
          secondC: "Eye Contact",
          relationshipType: "Communication Modality"
        },
        options: ["Non-Verbal Cue","Grammar Rule","Spelling Form","Written Clause"],
        answer: "Non-Verbal Cue",
        explanation: "Eye contact is a non-verbal cue.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m2-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Pausing after an important statement creates dramatic _____.",
        contextSentence: "Pausing after an important statement creates dramatic _____.",
        options: ["emphasis","confusion","volume","pitch"],
        answer: "emphasis",
        explanation: "Pauses create emphasis.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m2-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which posture conveys confidence and poise in public speaking?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Upright, balanced stance with open hands", caption: "Confident public posture" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Slouched posture with hands in pockets", caption: "Insecure stance" }
        ],
        answer: 'p1',
        explanation: "An upright, balanced stance projects confidence.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m2-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 5-letter word for highness or lowness of vocal tone:",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 5,
          cluePrompt: "Vocal tone frequency"
        },
        options: ["PITCH","SPEED","PAUSE","SOUND"],
        answer: "PITCH",
        explanation: "PITCH refers to vocal frequency.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m2-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 5-letter word: Body posture and S T A N C E in speaking:",
        hint: "Starts with S T A N C E",
        answer: "stance",
        explanation: "Stance reflects physical posture.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q3-m3',
    gradeLevel: 7,
    quarter: 3,
    moduleNumber: 18,
    quarterModuleIndex: 3,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: "Literary Influences: Culture, History, and Environment",
    topicType: 'literature' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Philippine literature reflects the interplay of historical struggles, indigenous customs, and natural landscapes. Reading regional folk narratives, legends, and poetry illuminates ancestral values and fosters empathy for neighboring cultures.",
      melcCompetency: "Discover literature as a tool to assert one's unique identity and understand other people (EN7LT-III-g-5)",
      keyRules: [
        "Cultural Reflection: Folk narratives mirror ancestral beliefs, rituals, and family values.",
        "Historical Context: Literature reflects the socio-political realities and resistance of its era.",
        "Environmental Harmony: Philippine epics frequently honor sacred rivers, seas, and mountains.",
        "Universal Themes: Love, resilience, and justice transcend regional cultural boundaries.",
        "Identity Formation: Engaging local stories deepens pride in ancestral heritage."
],
      examples: [
        {
          title: "Folktale Analysis",
          example: "The Mandaya legend of the creation of the sun and moon explains celestial balance through mythical heroism.",
          analysis: "Reflects indigenous cosmology and respect for natural forces."
        },
        {
          title: "Regional Poetry",
          example: "Verses depicting fisherfolk casting nets at dawn across Pujada Bay symbolize daily diligence.",
          analysis: "Celebrates local maritime livelihoods."
        }
      ],
      culturalConnection: "Mandaya oral epics preserved in the municipalities of Caraga, Manay, and Mati in Davao Oriental embody centuries of wisdom.",
      warmupQuestion: {
        question: "Why is studying regional folk literature valuable for young Filipinos?",
        options: ["It connects learners with ancestral values and regional identity","It forces everyone to speak in riddles","It replaces all modern scientific study","It is only useful for memorizing dates"],
        correctAnswer: "It connects learners with ancestral values and regional identity",
        feedback: "Correct! Regional literature fosters cultural pride and identity."
      },
      writingPrompt: {
        title: "Heritage Story Reflection",
        instructions: "Reflect on a local folk narrative or proverb from Davao Oriental and describe the moral lesson it teaches.",
        sampleStarter: "The traditional story of our coastal ancestors teaches us that respect for marine life..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q3-m3-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Folk Legend : Cultural Lore :: Historical Document : _____",
        analogyPair: {
          firstA: "Folk Legend",
          firstB: "Cultural Lore",
          secondC: "Historical Document",
          relationshipType: "Literary Nature"
        },
        options: ["Factual Record","Fictional Novel","Stage Prop","Rhyming Riddle"],
        answer: "Factual Record",
        explanation: "A historical document provides factual record.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m3-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Traditional Philippine oral narratives celebrate communal unity and ancestral _____.",
        contextSentence: "Traditional Philippine oral narratives celebrate communal unity and ancestral _____.",
        options: ["heritage","gadgets","machines","traffic"],
        answer: "heritage",
        explanation: "Narratives celebrate ancestral heritage.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m3-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which artistic expression represents indigenous Philippine storytelling?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Mandaya Oral Epic Chanting", caption: "Indigenous oral tradition" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Silent Reading on Tablet", caption: "Modern digital reading" }
        ],
        answer: 'p1',
        explanation: "Oral chanting preserves indigenous folklore.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m3-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 4-letter narrative of gods and cosmic origins (M _ _ H):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 4,
          cluePrompt: "Traditional sacred story"
        },
        options: ["MYTH","FACT","DATA","TALE"],
        answer: "MYTH",
        explanation: "A MYTH explains cosmic origins.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m3-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 8-letter word: Ancestral traditions and H E R I T A G E:",
        hint: "Starts with H E R I T A G E",
        answer: "heritage",
        explanation: "Heritage encompasses cultural legacy.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q3-m4',
    gradeLevel: 7,
    quarter: 3,
    moduleNumber: 19,
    quarterModuleIndex: 4,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: "Expressing Beliefs and Convictions Based on Viewed Materials",
    topicType: 'viewing' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Viewing documentaries, short films, and photojournalism prompts learners to formulate principled viewpoints. Constructing evidence-based convictions requires stating a clear claim, citing visual proof, and acknowledging alternative perspectives.",
      melcCompetency: "Express one's beliefs/convictions based on a material viewed (EN7VC-III-h-13)",
      keyRules: [
        "Clear Stance: Formulate a definitive assertion (e.g., \"I firmly believe that...\", \"The evidence demonstrates that...\").",
        "Cite Visual Evidence: Reference specific scenes, interviews, data charts, or camera angles from the viewed material.",
        "Avoid Mere Emotion: Ground convictions in observable facts rather than unexamined feelings.",
        "Ethical Reasoning: Consider community welfare, human rights, and environmental protection.",
        "Respectful Dialogue: Express firm convictions while engaging opposing viewpoints courteously."
],
      examples: [
        {
          title: "Documentary Stance",
          example: "\"After viewing the documentary on Pujada Bay coral bleaching, I am convinced that stricter municipal waste regulations are urgent.\"",
          analysis: "States a clear conviction supported by documentary evidence."
        },
        {
          title: "Photojournalism Reaction",
          example: "\"The visual depiction of plastic debris washed ashore on Dahican Beach proves that individual consumption choices impact marine life.\"",
          analysis: "Draws a reasoned ecological conviction from photojournalism."
        }
      ],
      culturalConnection: "Youth environmental clubs in Mati City view marine documentaries to advocate for conservation ordinances in local barangays.",
      warmupQuestion: {
        question: "What makes a conviction persuasive when reacting to a documentary?",
        options: ["Supporting the claim with concrete visual evidence and facts","Yelling louder than anyone else","Claiming you saw it on a meme","Ignoring all facts presented in the film"],
        correctAnswer: "Supporting the claim with concrete visual evidence and facts",
        feedback: "Correct! Citing concrete evidence makes convictions persuasive."
      },
      writingPrompt: {
        title: "Viewpoint Commentary",
        instructions: "Watch a short video clip or view a photograph of coastal conservation and write a 3-sentence statement of conviction.",
        sampleStarter: "Based on the imagery of community reef rangers in Pujada Bay, I firmly believe that..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q3-m4-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Unsubstantiated Rumor : Weak Stance :: Verified Visual Fact : _____",
        analogyPair: {
          firstA: "Unsubstantiated Rumor",
          firstB: "Weak Stance",
          secondC: "Verified Visual Fact",
          relationshipType: "Argument Strength"
        },
        options: ["Solid Conviction","Vague Guess","Blind Faith","Casual Gossip"],
        answer: "Solid Conviction",
        explanation: "Verified facts support solid convictions.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m4-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Expressing a principled conviction requires citing observable _____.",
        contextSentence: "Expressing a principled conviction requires citing observable _____.",
        options: ["evidence","rumors","guesses","fiction"],
        answer: "evidence",
        explanation: "Evidence substantiates convictions.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m4-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which medium provides visual evidence for environmental advocacy?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Environmental Documentary Video", caption: "Visual evidentiary medium" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Unlabeled Cartoon Drawing", caption: "Fictional sketch" }
        ],
        answer: 'p1',
        explanation: "Documentaries document real-world evidence.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m4-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 5-letter word for personal conviction or conviction (F _ _ _ H):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 5,
          cluePrompt: "Firm belief or confidence"
        },
        options: ["FAITH","DOUBT","TRUST","PROOF"],
        answer: "FAITH",
        explanation: "FAITH represents firm belief.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m4-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 5-letter word: Firm opinion and B E L I E F:",
        hint: "Starts with B E L I E F",
        answer: "belief",
        explanation: "Belief reflects personal conviction.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q3-m5',
    gradeLevel: 7,
    quarter: 3,
    moduleNumber: 20,
    quarterModuleIndex: 5,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: "Citing Evidence to Support a General Statement",
    topicType: 'reading' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "A general statement expresses a broad assertion or overarching claim. To be credible, it must be substantiated with specific textual evidence—statistics, verifiable facts, expert testimony, and concrete examples.",
      melcCompetency: "Cite evidence to support a general statement (EN7RC-III-i-2.1.7)",
      keyRules: [
        "General vs Specific: General statements assert broad claims; specific evidence provides concrete proof.",
        "Types of Evidence: Statistics, empirical research, quotes from authorities, and real-life examples.",
        "Signal Words: Introduce evidence using \"For instance,\", \"Research indicates that,\", \"According to the data,\".",
        "Relevance: Ensure cited proof directly substantiates the exact scope of the general statement.",
        "Sufficiency: One single anecdotal example rarely proves a sweeping universal claim."
],
      examples: [
        {
          title: "General Statement & Proof",
          example: "General Statement: \"Mount Hamiguitan harbors extraordinary biodiversity.\" -> Evidence: \"Field surveys document over 1,400 species, including 341 flora types found nowhere else on Earth.\"",
          analysis: "Exact numbers and field counts prove the broad claim."
        },
        {
          title: "Community Generalization",
          example: "General Statement: \"Mati City actively promotes eco-tourism.\" -> Evidence: \"The local government established marine reserves at Pujada Bay and regulated skimboarding zones at Dahican.\"",
          analysis: "Specific municipal initiatives corroborate the general statement."
        }
      ],
      culturalConnection: "Official reports on Davao Oriental biodiversity present general environmental summaries corroborated by species inventories.",
      warmupQuestion: {
        question: "Which of the following serves as specific evidence for the statement \"Dahican Beach is a major surfing destination\"?",
        options: ["\"It hosts the annual national skimboarding competition attracting over 200 athletes\"","\"It has sand on the beach\"","\"Water is blue in the ocean\"","\"People like summer vacations\""],
        correctAnswer: "\"It hosts the annual national skimboarding competition attracting over 200 athletes\"",
        feedback: "Correct! The annual competition with athlete counts is concrete evidence."
      },
      writingPrompt: {
        title: "Claim and Evidence Formulation",
        instructions: "Make a general statement about high school life and support it with two specific facts or examples.",
        sampleStarter: "General Statement: Junior high school develops essential life skills; for instance..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q3-m5-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Broad Claim : General Statement :: Specific Statistic : _____",
        analogyPair: {
          firstA: "Broad Claim",
          firstB: "General Statement",
          secondC: "Specific Statistic",
          relationshipType: "Argument Component"
        },
        options: ["Concrete Evidence","Random Guess","Fictional Plot","Poetic Metaphor"],
        answer: "Concrete Evidence",
        explanation: "A statistic functions as concrete evidence.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m5-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: To prove a broad claim, a writer must provide specific _____.",
        contextSentence: "To prove a broad claim, a writer must provide specific _____.",
        options: ["evidence","fonts","colors","guesses"],
        answer: "evidence",
        explanation: "Evidence validates claims.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m5-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which represents verifiable textual proof in a research study?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Scientific Census Table", caption: "Verifiable statistical data" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Empty Text Box", caption: "Unsupported blank area" }
        ],
        answer: 'p1',
        explanation: "Census tables provide concrete statistical proof.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m5-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 5-letter piece of factual proof (F _ _ T):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 5,
          cluePrompt: "Verifiable reality or truth"
        },
        options: ["FACTS","PLOTS","NOTES","IDEAS"],
        answer: "FACTS",
        explanation: "FACTS substantiate assertions.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m5-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 5-letter word: Concrete proof or F A C T S:",
        hint: "Starts with F A C T S",
        answer: "facts",
        explanation: "Facts prove general claims.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q3-m6',
    gradeLevel: 7,
    quarter: 3,
    moduleNumber: 21,
    quarterModuleIndex: 6,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: "Statements of Fact and Opinion in Discourse",
    topicType: 'reading' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Distinguishing fact (empirically verifiable through objective observation, measurement, or records) from opinion (personal judgment, emotional feeling, or aesthetic appraisal) is vital for media literacy and critical reading.",
      melcCompetency: "Differentiate between statements of fact and opinion in varied texts (EN7RC-III-j-2.13)",
      keyRules: [
        "Fact: Can be verified as true or false using evidence, official records, or scientific observation.",
        "Opinion: Expresses a belief, judgment, or feeling; cannot be proven objectively true for everyone.",
        "Opinion Signal Words: \"In my view,\", \"I believe,\", \"The best,\", \"Worst,\", \"Probably,\", \"Should,\".",
        "Factual Verifiers: Measurement units (meters, dates, percentages), historical documents, scientific data.",
        "Mixed Statements: Statements often blend factual clauses with opinionated adjectives."
],
      examples: [
        {
          title: "Fact Statement",
          example: "\"Pujada Bay covers an area of approximately 156 square kilometers in Mati City.\"",
          analysis: "Verifiable through geographical surveys and provincial records."
        },
        {
          title: "Opinion Statement",
          example: "\"Dahican Beach is the most breathtaking coastal destination in the Philippines.\"",
          analysis: "Contains the subjective superlative \"most breathtaking\", reflecting personal taste."
        }
      ],
      culturalConnection: "Provincial travel reviews feature opinions praising local seafood alongside factual municipal driving distances.",
      warmupQuestion: {
        question: "Which of the following is a statement of FACT?",
        options: ["Mount Hamiguitan has an elevation of 1,620 meters above sea level","Mount Hamiguitan is the most exciting hike in Mindanao","Mountain climbing is the best hobby for students","Sunsets in Mati are better than sunsets in Davao"],
        correctAnswer: "Mount Hamiguitan has an elevation of 1,620 meters above sea level",
        feedback: "Correct! The 1,620-meter elevation is an objectively measurable geographic fact."
      },
      writingPrompt: {
        title: "Fact vs Opinion Duality",
        instructions: "Write one statement of fact and one statement of opinion about your school or town.",
        sampleStarter: "Fact: Our high school was established in... Opinion: In my view, our campus is..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q3-m6-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Objective Proof : Fact :: Personal Judgment : _____",
        analogyPair: {
          firstA: "Objective Proof",
          firstB: "Fact",
          secondC: "Personal Judgment",
          relationshipType: "Epistemic Nature"
        },
        options: ["Opinion","Statute","Measurement","Scientific Law"],
        answer: "Opinion",
        explanation: "Personal judgment is an opinion.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m6-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Words like \"probably\", \"in my view\", and \"most beautiful\" signal an _____.",
        contextSentence: "Words like \"probably\", \"in my view\", and \"most beautiful\" signal an _____.",
        options: ["opinion","fact","equation","measurement"],
        answer: "opinion",
        explanation: "Such phrases signal opinions.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m6-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which visual represents an objective factual measurement tool?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Calibrated Thermometer", caption: "Objective empirical measurement" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Star Rating Emoji", caption: "Subjective opinion rating" }
        ],
        answer: 'p1',
        explanation: "Thermometers provide objective factual measurements.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m6-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 4-letter verifiable reality (F _ _ T):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 4,
          cluePrompt: "Objective truth or reality"
        },
        options: ["FACT","MYTH","HOAX","IDEA"],
        answer: "FACT",
        explanation: "A FACT can be proven.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m6-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 7-letter word: Personal subjective view: O P I N I O N:",
        hint: "Starts with O P I N I O N",
        answer: "opinion",
        explanation: "An opinion reflects subjective views.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q3-m7',
    gradeLevel: 7,
    quarter: 3,
    moduleNumber: 22,
    quarterModuleIndex: 7,
    islandName: 'Waniban Island',
    islandThemeColor: '#D97706',
    title: "Raising Sensible, Challenging, and Thought-Provoking Questions",
    topicType: 'speaking' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "In panel discussions and classroom debates, formulating high-level open-ended questions (evaluative, hypothetical, and analytical) deepens dialogue. Thought-provoking questions begin with \"How might...\", \"What are the long-term consequences of...\", and \"Why do you conclude...\".",
      melcCompetency: "Raise sensible, challenging, and thought-provoking questions in public forums/panel discussions (EN7OL-III-e-1.4)",
      keyRules: [
        "Avoid Closed Questions: Questions answering with simple \"yes\" or \"no\" stifle discussion.",
        "Use Wh- Openers: Frame inquiries around \"How\", \"Why\", \"Under what circumstances\", and \"To what extent\".",
        "Ground in Context: Preface the question with a brief observation from the speaker’s talk.",
        "Challenge Assumptions: Politely inquire into trade-offs, ecological impacts, or alternative solutions.",
        "Courteous Tone: Address speakers respectfully without confrontational sarcasm."
],
      examples: [
        {
          title: "Surface vs Thought-Provoking",
          example: "Surface: \"Do you like coastal tourism?\" -> Thought-Provoking: \"How can the municipality balance tourist expansion in Dahican with protecting endangered sea turtle nesting grounds?\"",
          analysis: "The revised question targets systemic policy trade-offs."
        },
        {
          title: "Grounded Inquiry",
          example: "\"Given that coral bleaching has risen by 15% in the bay, what specific community incentives could encourage local fishers to adopt sustainable gear?\"",
          analysis: "Cites data and invites actionable solutions."
        }
      ],
      culturalConnection: "Barangay assemblies and coastal resource hearings in Mati City invite youth leaders to raise thoughtful questions on fisheries protection.",
      warmupQuestion: {
        question: "Which question is most thought-provoking during a seminar on plastic pollution in Pujada Bay?",
        options: ["What economic alternatives can we provide coastal vendors to phase out single-use plastics without harming their livelihood?","Is plastic bad for the ocean?","What color are plastic bottles?","Do you sell bottled water here?"],
        correctAnswer: "What economic alternatives can we provide coastal vendors to phase out single-use plastics without harming their livelihood?",
        feedback: "Correct! It addresses the complex balance between environmental policy and vendor livelihoods."
      },
      writingPrompt: {
        title: "Panel Inquiry Formulation",
        instructions: "Imagine a panel on Mount Hamiguitan conservation. Write two high-level open-ended questions for the forest rangers.",
        sampleStarter: "To the lead conservation officer: Considering the balance between eco-tourism revenue and biodiversity..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q3-m7-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Yes/No Query : Closed Question :: Why/How Inquiry : _____",
        analogyPair: {
          firstA: "Yes/No Query",
          firstB: "Closed Question",
          secondC: "Why/How Inquiry",
          relationshipType: "Question Architecture"
        },
        options: ["Open-Ended Question","Rhetorical Silence","Unanswered Void","Monologue Speech"],
        answer: "Open-Ended Question",
        explanation: "Why/How inquiries are open-ended questions.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m7-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Thought-provoking inquiries in panel discussions promote deep critical _____.",
        contextSentence: "Thought-provoking inquiries in panel discussions promote deep critical _____.",
        options: ["thinking","silence","anger","guessing"],
        answer: "thinking",
        explanation: "Deep questions foster critical thinking.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m7-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which question format invites detailed analytical discussion?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Question mark leading to open conversation", caption: "Open-ended inquiry" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Binary Checkbox (Yes / No)", caption: "Closed binary choice" }
        ],
        answer: 'p1',
        explanation: "Open-ended questions spark rich dialogue.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m7-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 3-letter question word targeting reasons or causes (W _ Y):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 3,
          cluePrompt: "Inquiry into reason or purpose"
        },
        options: ["WHY","HOW","WHO","CAN"],
        answer: "WHY",
        explanation: "WHY explores causes and reasons.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q3-m7-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 8-letter word: Inquiring deeply: Q U E S T I O N:",
        hint: "Starts with Q U E S T I O N",
        answer: "question",
        explanation: "Questions stimulate critical inquiry.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q4-m1',
    gradeLevel: 7,
    quarter: 4,
    moduleNumber: 23,
    quarterModuleIndex: 1,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: "Features and Conventions of Academic Writing",
    topicType: 'writing' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Academic writing is formal, objective, structured, and evidenced. It avoids colloquial slang, contractions, and unsupported claims, adopting third-person objectivity, precise vocabulary, and formal transitional cohesion.",
      melcCompetency: "Distinguish the features of academic writing and appreciate its importance in intellectual inquiry (EN7WC-IV-a-2.2)",
      keyRules: [
        "Formality: Avoid colloquialisms, texting acronyms (u, btw), and conversational contractions (can’t -> cannot).",
        "Objectivity: Focus on evidence and logical analysis rather than personal emotional bias.",
        "Hedging and Caution: Use cautious language (suggests, indicates, appears) instead of absolute assertions.",
        "Explicit Structure: Include clear introductory thesis, body paragraphs with topic sentences, and logical conclusion.",
        "Citation Integrity: Attribute all source data, statistics, and definitions to avoid plagiarism."
],
      examples: [
        {
          title: "Informal vs Academic",
          example: "Informal: \"Lots of trash is messing up the beach real bad.\" -> Academic: \"Substantial marine debris significantly degrades the ecological equilibrium of coastal habitats.\"",
          analysis: "Demonstrates formal vocabulary, objective tone, and syntactic precision."
        },
        {
          title: "Hedging in Academic Prose",
          example: "Absolute: \"This law will fix all coral reef damage.\" -> Hedged: \"This municipal ordinance is likely to mitigate coral reef degradation across Pujada Bay.\"",
          analysis: "Demonstrates scientific caution and academic nuance."
        }
      ],
      culturalConnection: "High school research projects presented at the Davao Oriental Division Science and English Fairs adhere to academic writing standards.",
      warmupQuestion: {
        question: "Which sentence best exemplifies formal academic style?",
        options: ["The experimental data indicate a statistically significant increase in marine biodiversity.","The results were totally cool and super awesome for the fish!","I think it is pretty obvious that things worked out great, you know?","Fish were like everywhere in the bay!"],
        correctAnswer: "The experimental data indicate a statistically significant increase in marine biodiversity.",
        feedback: "Correct! It uses objective vocabulary, precise phrasing, and formal syntax."
      },
      writingPrompt: {
        title: "Academic Transformation Practice",
        instructions: "Rewrite three informal sentences about conservation into formal academic prose.",
        sampleStarter: "Informal: People shouldn’t throw junk in the river -> Academic: Municipal residents ought to refrain from..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q4-m1-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Conversational Slang : Informal Speech :: Objective Prose : _____",
        analogyPair: {
          firstA: "Conversational Slang",
          firstB: "Informal Speech",
          secondC: "Objective Prose",
          relationshipType: "Register Classification"
        },
        options: ["Academic Writing","Casual Text Message","Playground Banter","Comic Book Script"],
        answer: "Academic Writing",
        explanation: "Objective prose characterizes academic writing.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m1-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Academic papers avoid conversational contractions like \"won’t\" in favor of \"_____\".",
        contextSentence: "Academic papers avoid conversational contractions like \"won’t\" in favor of \"_____\".",
        options: ["will not","wont","cannot","is not"],
        answer: "will not",
        explanation: "Formal style expands contractions.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m1-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which document represents formal academic research?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Peer-Reviewed Research Journal", caption: "Formal academic publication" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Graffiti Wall Note", caption: "Informal message" }
        ],
        answer: 'p1',
        explanation: "Peer-reviewed journals observe academic conventions.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m1-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 6-letter term for serious, non-casual style (F _ _ _ _ L):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 6,
          cluePrompt: "Official, serious writing style"
        },
        options: ["FORMAL","CASUAL","DIRECT","NATIVE"],
        answer: "FORMAL",
        explanation: "FORMAL writing avoids slang.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m1-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 8-letter word: Scholarly prose: A C A D E M I C:",
        hint: "Starts with A C A D E M I C",
        answer: "academic",
        explanation: "Academic writing follows disciplined standards.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q4-m2',
    gradeLevel: 7,
    quarter: 4,
    moduleNumber: 24,
    quarterModuleIndex: 2,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: "Interpersonal Communication: Dialogues, Conversations, and Interviews",
    topicType: 'speaking' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Interpersonal communication spans casual conversations, structured dialogues, and formal interviews. Success relies on active listening, polite turn-taking, open-ended question prompts, clarifying feedback, and culturally appropriate non-verbal politeness.",
      melcCompetency: "Employ a range of verbal and non-verbal strategies in conversations, dialogues, and interviews (EN7OL-IV-b-1.26)",
      keyRules: [
        "Turn-Taking: Allow conversational partners to complete their thoughts without rude interruption.",
        "Active Attending: Nod, maintain comfortable eye contact, and use vocal affirmations (e.g., \"I see\", \"Indeed\").",
        "Clarification Prompts: Ask polite follow-up questions when instructions are unclear (\"Could you please clarify...?\").",
        "Interview Rapport: Begin with professional greetings, state the interview objective, and thank the subject.",
        "Cultural Politeness: Observe Filipino courtesy markers (po, opo, respectful address terms) appropriate to social status."
],
      examples: [
        {
          title: "Interview Dialogue",
          example: "Student: \"Good morning, Barangay Captain. Thank you for your time. Could you describe how your council protects the San Victor clam reserve?\"",
          analysis: "Begins with respectful greeting and asks a focused open-ended question."
        },
        {
          title: "Polite Clarification",
          example: "Learner: \"Pardon me, Mr. Solis; to confirm, is the English research portfolio due this Friday or next Monday?\"",
          analysis: "Clarifies deadlines professionally without confusion."
        }
      ],
      culturalConnection: "Interviews with Mandaya elders and coastal village leaders in Baganga require respectful interpersonal protocols.",
      warmupQuestion: {
        question: "What is the most effective approach when you do not understand an interviewee’s response?",
        options: ["Politely ask for clarification: \"Could you elaborate on what you meant by that?\"","Pretend you understood and write down made-up notes","Interrupt the interviewee loudly and change the subject","Laugh dismissively and walk away"],
        correctAnswer: "Politely ask for clarification: \"Could you elaborate on what you meant by that?\"",
        feedback: "Correct! Courteous clarification ensures accuracy in interviews."
      },
      writingPrompt: {
        title: "Interview Script Drafting",
        instructions: "Write a 4-turn interview dialogue between a student reporter and an eco-tourism guide at San Victor Island.",
        sampleStarter: "REPORTER: Good afternoon, sir. Welcome to our campus broadcast. GUIDE: Good afternoon..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q4-m2-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "One-Way Speech : Monologue :: Two-Way Exchange : _____",
        analogyPair: {
          firstA: "One-Way Speech",
          firstB: "Monologue",
          secondC: "Two-Way Exchange",
          relationshipType: "Communication Structure"
        },
        options: ["Dialogue","Soliloquy","Silent Reading","Echo"],
        answer: "Dialogue",
        explanation: "A two-way exchange is a dialogue.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m2-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Waiting for your conversational partner to finish before responding shows proper turn-_____.",
        contextSentence: "Waiting for your conversational partner to finish before responding shows proper turn-_____.",
        options: ["taking","making","breaking","running"],
        answer: "taking",
        explanation: "Turn-taking ensures courteous dialogue.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m2-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which scene demonstrates collaborative interpersonal communication?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Two individuals listening and taking turns speaking", caption: "Balanced interpersonal dialogue" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "One person shouting over another", caption: "Hostile conversational breakdown" }
        ],
        answer: 'p1',
        explanation: "Taking turns and active listening foster interpersonal dialogue.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m2-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 8-letter term for formal question-and-answer exchange:",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 9,
          cluePrompt: "Formal question-and-answer session"
        },
        options: ["INTERVIEW","BROADCAST","MONOLOGUE","SOLILOQUY"],
        answer: "INTERVIEW",
        explanation: "An INTERVIEW gathers first-hand information.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m2-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 8-letter word: Two-way conversation: D I A L O G U E:",
        hint: "Starts with D I A L O G U E",
        answer: "dialogue",
        explanation: "A dialogue involves mutual exchange.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q4-m3',
    gradeLevel: 7,
    quarter: 4,
    moduleNumber: 25,
    quarterModuleIndex: 3,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: "Determining the Worth of Ideas in Listened Texts",
    topicType: 'listening' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Critical listeners do not passively absorb spoken claims; they weigh the worth, ethical value, logical soundess, and applicability of ideas. Evaluating a spoken text involves assessing whether recommendations are practical, just, and supported by facts.",
      melcCompetency: "Determine the worth of ideas mentioned in the text listened to (EN7LC-IV-c-2.7)",
      keyRules: [
        "Assess Practicality: Determine whether the speaker’s proposed plan is realistic and feasible.",
        "Check Logical Soundness: Identify whether premises lead naturally to the speaker’s conclusions.",
        "Detect Fallacies: Watch for emotional manipulation, hasty generalizations, and bandwagons.",
        "Evaluate Ethical Impact: Consider how proposed actions affect vulnerable community members.",
        "Weigh Personal Applicability: Reflect on how the spoken message can be adopted into daily student habits."
],
      examples: [
        {
          title: "Evaluating a Policy Proposal",
          example: "Speaker: \"To stop plastic pollution, all grocery stores should immediately close.\" -> Listener Evaluation: Impractical and harmful to basic food supply; better to regulate packaging rather than shut down stores.",
          analysis: "Critical evaluation discovers flaws in an extreme recommendation."
        },
        {
          title: "Sound Community Proposal",
          example: "Speaker: \"Community mangrove planting along Baganga coastlines creates natural barriers against typhoon storm surges.\"",
          analysis: "Listener values the proposal as ecologically proven, low-cost, and life-saving."
        }
      ],
      culturalConnection: "Public hearings in Baganga, Davao Oriental assess municipal plans for giant clam reef rehabilitation.",
      warmupQuestion: {
        question: "When evaluating a speaker’s proposed solution to community flooding, what is the primary question to ask?",
        options: ["Is the solution scientifically feasible, fair, and supported by evidence?","Does the speaker wear expensive shoes?","Is the speech longer than two hours?","Did the speaker use big words I do not know?"],
        correctAnswer: "Is the solution scientifically feasible, fair, and supported by evidence?",
        feedback: "Correct! Practicality, fairness, and evidentiary support determine the worth of ideas."
      },
      writingPrompt: {
        title: "Spoken Idea Evaluation Critique",
        instructions: "Summarize a proposal you heard regarding school cleanliness and evaluate whether the ideas are practical and fair.",
        sampleStarter: "In our class meeting, a proposal was made to enforce daily campus cleanup patrols..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q4-m3-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Unsubstantiated Boast : Low Value :: Feasible Evidence-Based Plan : _____",
        analogyPair: {
          firstA: "Unsubstantiated Boast",
          firstB: "Low Value",
          secondC: "Feasible Plan",
          relationshipType: "Idea Worth"
        },
        options: ["High Value","Negative Void","False Rumor","Broken Promise"],
        answer: "High Value",
        explanation: "Feasible, evidence-based plans have high value.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m3-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Critical listeners evaluate whether a speaker’s arguments are logically _____.",
        contextSentence: "Critical listeners evaluate whether a speaker’s arguments are logically _____.",
        options: ["sound","loud","silent","fast"],
        answer: "sound",
        explanation: "Sound arguments are logically valid.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m3-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which tool symbolizes weighing the worth and fairness of competing ideas?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Scales of Justice", caption: "Weighing worth and balance" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Megaphone", caption: "Loud volume projection" }
        ],
        answer: 'p1',
        explanation: "The scales of justice symbolize weighing ideas critically.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m3-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 5-letter word for value, merit, or importance (W _ _ _ H):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 5,
          cluePrompt: "Value or merit of ideas"
        },
        options: ["WORTH","PRICE","SPEED","MONEY"],
        answer: "WORTH",
        explanation: "WORTH measures intellectual value.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m3-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 5-letter word: Value and merit of ideas: W O R T H:",
        hint: "Starts with W O R T H",
        answer: "worth",
        explanation: "Worth reflects the value of ideas.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q4-m4',
    gradeLevel: 7,
    quarter: 4,
    moduleNumber: 26,
    quarterModuleIndex: 4,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: "Literary Conflicts in Selections and Non-Violent Resolutions",
    topicType: 'literature' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Conflict is the engine of narrative literature. Understanding four classic conflict types—Man vs. Man, Man vs. Nature, Man vs. Society, and Man vs. Self—enables readers to appreciate how mature protagonists achieve non-violent, ethical resolutions through dialogue, empathy, and courage.",
      melcCompetency: "Discover the conflicts presented in literary selections and the need to resolve these conflicts in non-violent ways (EN7LT-IV-d-2.2)",
      keyRules: [
        "Man vs. Man: External dispute between two or more characters over goals, values, or territory.",
        "Man vs. Nature: Struggle against natural disasters, fierce wildlife, rough seas, or harsh climates.",
        "Man vs. Society: Struggle against unjust laws, oppressive traditions, or systemic prejudice.",
        "Man vs. Self: Internal psychological dilemma over ethical choices, duty, fear, or guilt.",
        "Non-Violent Resolution: Resolving tension through negotiation, reconciliation, empathy, and forgiveness."
],
      examples: [
        {
          title: "Man vs. Self Dilemma",
          example: "A young fisherman hesitates whether to report illegal dynamite fishing practiced by his neighbor, torn between loyalty and ocean preservation.",
          analysis: "Internal ethical dilemma (Man vs. Self)."
        },
        {
          title: "Man vs. Society Resolution",
          example: "A young indigenous weaver advocates for tribal intellectual property protection through community dialogue rather than violence.",
          analysis: "Man vs. Society resolved through civic advocacy."
        }
      ],
      culturalConnection: "Mandaya oral narratives and Baganga coastal folklore feature heroes resolving tribal disputes through council mediation and peace pacts.",
      warmupQuestion: {
        question: "What type of conflict is shown when a character struggles internally between telling the truth and protecting a friend?",
        options: ["Man vs. Self","Man vs. Nature","Man vs. Machine","Man vs. Supernatural"],
        correctAnswer: "Man vs. Self",
        feedback: "Correct! Internal moral struggle is Man vs. Self."
      },
      writingPrompt: {
        title: "Non-Violent Conflict Resolution Narrative",
        instructions: "Describe a fictional conflict between two students and outline how they resolve it through mediation and non-violent dialogue.",
        sampleStarter: "Marco and Joshua both claimed credit for the school environmental poster; however, instead of arguing..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q4-m4-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Stormy Sea : Man vs Nature :: Inner Guilt : _____",
        analogyPair: {
          firstA: "Stormy Sea",
          firstB: "Man vs Nature",
          secondC: "Inner Guilt",
          relationshipType: "Conflict Classification"
        },
        options: ["Man vs Self","Man vs Society","Man vs Machine","Man vs Alien"],
        answer: "Man vs Self",
        explanation: "Inner guilt is an internal Man vs. Self conflict.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m4-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Resolving disputes through respectful negotiation rather than force is a _____-violent resolution.",
        contextSentence: "Resolving disputes through respectful negotiation rather than force is a _____-violent resolution.",
        options: ["non","ultra","super","anti"],
        answer: "non",
        explanation: "Non-violent resolution uses dialogue.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m4-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which scene exemplifies peaceful conflict resolution?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Two individuals shaking hands across a table", caption: "Mediation and reconciliation" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Two individuals shouting in anger", caption: "Escalating violence" }
        ],
        answer: 'p1',
        explanation: "A handshake symbolizes peaceful resolution.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m4-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 5-letter word for peaceful state without strife (P _ _ _ E):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 5,
          cluePrompt: "State of harmony and reconciliation"
        },
        options: ["PEACE","FIGHT","ANGER","STRIFE"],
        answer: "PEACE",
        explanation: "PEACE represents non-violent harmony.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m4-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 8-letter word: Core story struggle: C O N F L I C T:",
        hint: "Starts with C O N F L I C T",
        answer: "conflict",
        explanation: "Conflict drives story plots.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q4-m5',
    gradeLevel: 7,
    quarter: 4,
    moduleNumber: 27,
    quarterModuleIndex: 5,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: "Determining the Truthfulness and Accuracy of Materials Viewed",
    topicType: 'viewing' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "In an era of deepfakes, altered images, and clickbait videos, viewers must critically inspect visual media. Verifying truthfulness involves examining camera angles, lighting anomalies, audio-video synchronization, source provenance, and corroborating claims with trusted fact-checkers.",
      melcCompetency: "Determine the truthfulness and accuracy of the material viewed (EN7VC-IV-e-11)",
      keyRules: [
        "Visual Inspection: Look for unnatural pixelation, awkward facial shadows, or mismatched audio dubbing.",
        "Reverse Image Search: Track the original upload date and context of viral photographs.",
        "Check Provenance: Determine who recorded and published the video and whether they possess a verifiable identity.",
        "Contextual Accuracy: Confirm whether authentic video footage has been misleadingly captioned to misrepresent events.",
        "Cross-Reference: Validate sensational visual claims against official news reports and science organizations."
],
      examples: [
        {
          title: "Miscaptioned Video",
          example: "A viral video of storm surges from 2012 falsely claimed to depict Baganga coastlines yesterday.",
          analysis: "Reverse image searching reveals old recycled footage used out of context."
        },
        {
          title: "Authentic Documented Footage",
          example: "Municipal footage of giant clam seeding in San Victor Island with verified ranger timestamps and provincial tags.",
          analysis: "Demonstrates verifiable provenance and truthfulness."
        }
      ],
      culturalConnection: "Environmental rangers on San Victor Island document giant clam (Taklobo) health using date-stamped underwater photography.",
      warmupQuestion: {
        question: "What is a common indicator that a viral video may be misleading or untruthful?",
        options: ["It has no verifiable date, author attribution, or original source context","It is recorded in high definition","It shows real people speaking","It is under three minutes long"],
        correctAnswer: "It has no verifiable date, author attribution, or original source context",
        feedback: "Correct! Lack of source provenance is a major red flag for misinformation."
      },
      writingPrompt: {
        title: "Visual Fact-Checking Report",
        instructions: "Explain the steps you would take to verify a sensational video clip claiming a monster crocodile was sighted in Pujada Bay.",
        sampleStarter: "To confirm the truthfulness of the crocodile sighting video, my first step would be..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q4-m5-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Fabricated Deepfake : Falsehood :: Verified Footage : _____",
        analogyPair: {
          firstA: "Fabricated Deepfake",
          firstB: "Falsehood",
          secondC: "Verified Footage",
          relationshipType: "Media Authenticity"
        },
        options: ["Truthfulness","Deception","Rumor","Optical Illusion"],
        answer: "Truthfulness",
        explanation: "Verified footage establishes truthfulness.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m5-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: To confirm whether a viral image is recycled from years ago, perform a reverse _____ search.",
        contextSentence: "To confirm whether a viral image is recycled from years ago, perform a reverse _____ search.",
        options: ["image","sound","voice","movie"],
        answer: "image",
        explanation: "Reverse image search tracks image history.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m5-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which symbol represents verified accuracy in media fact-checking?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Green Checkmark on Document", caption: "Verified accuracy seal" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Questionable Warning Icon", caption: "Unverified warning" }
        ],
        answer: 'p1',
        explanation: "A verified checkmark indicates confirmed accuracy.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m5-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 5-letter word for factual correctness and reality (T _ _ _ H):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 5,
          cluePrompt: "Conformity with fact or reality"
        },
        options: ["TRUTH","MYTHS","LIES","TALES"],
        answer: "TRUTH",
        explanation: "TRUTH represents factual accuracy.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m5-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 8-letter word: Exactness and correctness: A C C U R A C Y:",
        hint: "Starts with A C C U R A C Y",
        answer: "accuracy",
        explanation: "Accuracy reflects factual precision.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q4-m6',
    gradeLevel: 7,
    quarter: 4,
    moduleNumber: 28,
    quarterModuleIndex: 6,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: "Literature as a Tool to Assert Unique Identity and Empathy",
    topicType: 'literature' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "Literature serves as both a mirror (affirming our own cultural identity, memories, and roots) and a window (giving insight into the lived experiences of diverse ethnic groups, generations, and communities). Through literary empathy, stereotypes dissolve.",
      melcCompetency: "Discover literature as a tool to assert one's unique identity and to better understand other people (EN7LT-IV-f-2.2.3)",
      keyRules: [
        "Literature as a Mirror: Reflects personal cultural identity, native dialects, and community traditions.",
        "Literature as a Window: Provides glimpses into the joys, hardships, and perspectives of other cultures.",
        "Empathy Building: Immersing in characters from different backgrounds fosters compassion and tolerance.",
        "Challenging Stereotypes: Nuanced literary characterization dismantles simplistic cultural caricatures.",
        "Voice Assertion: Writing our own stories asserts our cultural contribution to Philippine nationhood."
],
      examples: [
        {
          title: "Cultural Mirror",
          example: "A student from Davao Oriental reads a poem celebrating Mandaya weaving patterns and feels deep ancestral pride.",
          analysis: "Acts as a mirror reinforcing indigenous cultural identity."
        },
        {
          title: "Cultural Window",
          example: "Reading a short story about an urban street child in Manila allows a rural coastal learner to understand urban poverty.",
          analysis: "Acts as a window building empathy for different socio-economic realities."
        }
      ],
      culturalConnection: "Mandaya oral poetry and woven Dagmay tapestries in Davao Oriental preserve ancestral identity across generations.",
      warmupQuestion: {
        question: "What does it mean when literature acts as a \"mirror\"?",
        options: ["It reflects your own cultural identity, traditions, and lived experiences","It physically shines light back into your eyes","It only shows characters from other planets","It can only be read in front of glass"],
        correctAnswer: "It reflects your own cultural identity, traditions, and lived experiences",
        feedback: "Correct! A literary mirror reflects our own roots and cultural identity."
      },
      writingPrompt: {
        title: "Mirror and Window Reflection",
        instructions: "Describe a story or poem you read that acted as a mirror (reflecting your life) or a window (teaching you about others).",
        sampleStarter: "Reading the narrative of an indigenous Mandaya family served as a mirror for me because..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q4-m6-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Own Identity : Literary Mirror :: Other Lives : _____",
        analogyPair: {
          firstA: "Own Identity",
          firstB: "Literary Mirror",
          secondC: "Other Lives",
          relationshipType: "Literary Function"
        },
        options: ["Literary Window","Dark Wall","Blind Fold","Locked Door"],
        answer: "Literary Window",
        explanation: "Other lives are viewed through a literary window.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m6-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Stepping into the emotional shoes of literary characters fosters deep _____.",
        contextSentence: "Stepping into the emotional shoes of literary characters fosters deep _____.",
        options: ["empathy","hostility","jealousy","amnesia"],
        answer: "empathy",
        explanation: "Literature fosters empathy.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m6-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which visual represents understanding diverse human cultures?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Diverse individuals holding hands around globe", caption: "Empathy and mutual respect" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Isolated individual in dark box", caption: "Cultural isolation" }
        ],
        answer: 'p1',
        explanation: "Unity in diversity symbolizes literary empathy.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m6-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 7-letter capacity to share another person’s feelings (E _ _ _ _ _ Y):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 7,
          cluePrompt: "Understanding another’s feelings"
        },
        options: ["EMPATHY","SYMPATHY","CRITIQUE","APATHY"],
        answer: "EMPATHY",
        explanation: "EMPATHY is emotional understanding.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m6-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 8-letter word: Unique self and cultural I D E N T I T Y:",
        hint: "Starts with I D E N T I T Y",
        answer: "identity",
        explanation: "Identity reflects personal and cultural self.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q4-m7',
    gradeLevel: 7,
    quarter: 4,
    moduleNumber: 29,
    quarterModuleIndex: 7,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: "Philippine Literature in the Global Village & Cultural Cooperation",
    topicType: 'literature' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "In an interconnected world, Philippine literature highlights the traditional concept of \"Bayanihan\" (communal unity and mutual assistance) as a vital model for solving global crises like climate change, poverty, and environmental degradation.",
      melcCompetency: "Discover through Philippine literature the need to work cooperatively and responsibly in today’s global village (EN7LT-IV-g-2.3)",
      keyRules: [
        "Bayanihan Tradition: Communal cooperation where community members unite voluntarily for common good.",
        "Global Village Concept: The world is interconnected through technology, trade, and shared climate destiny.",
        "Environmental Stewardship: Regional Philippine literature emphasizes that natural resources are shared trusts.",
        "Cross-Border Responsibility: Local actions (marine conservation in Davao Oriental) contribute to global planetary health.",
        "Cultural Diplomacy: Sharing Philippine literary values builds international respect and cooperation."
],
      examples: [
        {
          title: "Bayanihan in Literature",
          example: "Classic short story depicting neighbors carrying a house together across coastal shores to escape high tide.",
          analysis: "Symbolizes cooperative community resilience."
        },
        {
          title: "Global Ecological Cooperation",
          example: "Stories of international scientists collaborating with local Baganga fishers to preserve giant clams.",
          analysis: "Demonstrates global village partnership grounded in shared scientific stewardship."
        }
      ],
      culturalConnection: "Community coastal cleanups and mangrove tree plantings in Baganga embody the living spirit of Bayanihan.",
      warmupQuestion: {
        question: "What traditional Filipino cultural value best exemplifies cooperation in the global village?",
        options: ["Bayanihan (communal cooperation)","Ningas-kugon (quitting early)","Crab mentality (pulling others down)","Bahala na (careless fatalism)"],
        correctAnswer: "Bayanihan (communal cooperation)",
        feedback: "Correct! Bayanihan embodies communal unity and shared responsibility."
      },
      writingPrompt: {
        title: "Bayanihan in the Global Village Essay",
        instructions: "Explain how the Filipino value of Bayanihan can help solve a global environmental problem like ocean plastics.",
        sampleStarter: "The ancient Filipino practice of Bayanihan demonstrates that when an entire community unites..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q4-m7-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Local Community : Barangay :: Interconnected World : _____",
        analogyPair: {
          firstA: "Local Community",
          firstB: "Barangay",
          secondC: "Interconnected World",
          relationshipType: "Social Scale"
        },
        options: ["Global Village","Isolated Island","Outer Space","Private Room"],
        answer: "Global Village",
        explanation: "An interconnected world forms a global village.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m7-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: The traditional Filipino value of communal mutual help is called _____.",
        contextSentence: "The traditional Filipino value of communal mutual help is called _____.",
        options: ["bayanihan","harana","kundiman","fiesta"],
        answer: "bayanihan",
        explanation: "Bayanihan is communal cooperation.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m7-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which image symbolizes the Filipino tradition of Bayanihan?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Neighbors cooperatively lifting a house together", caption: "Bayanihan communal spirit" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Solo person working in isolation", caption: "Individual effort" }
        ],
        answer: 'p1',
        explanation: "Lifting a house together is the iconic symbol of Bayanihan.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m7-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 6-letter term for world or planetary scale (G _ _ _ _ L):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 6,
          cluePrompt: "Worldwide or planetary in scope"
        },
        options: ["GLOBAL","TRIBAL","NATIVE","LOCAL"],
        answer: "GLOBAL",
        explanation: "GLOBAL spans the entire planet.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m7-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 9-letter Filipino value: B A Y A N I H A N communal unity:",
        hint: "Starts with B A Y A N I H A N",
        answer: "bayanihan",
        explanation: "Bayanihan represents communal cooperation.",
        timeLimitSeconds: 45
      }
    ]
  },
  {
    id: 'g7-q4-m8',
    gradeLevel: 7,
    quarter: 4,
    moduleNumber: 30,
    quarterModuleIndex: 8,
    islandName: 'Pujada Island',
    islandThemeColor: '#7C3AED',
    title: "Composing an Informative Essay on Social and Environmental Responsibility",
    topicType: 'writing' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: "An informative essay educates readers on a specific socio-environmental topic using factual exposition. It features an engaging introduction with a clear thesis statement, body paragraphs backed by verifiable evidence and transitional cohesive devices, and a conclusion reinforcing practical stewardship.",
      melcCompetency: "Compose an informative essay on social and environmental responsibility (EN7WC-IV-h-2.8.6)",
      keyRules: [
        "Clear Thesis Statement: State the central informative purpose directly at the end of the introductory paragraph.",
        "Objective Exposition: Provide facts, statistics, and verifiable examples rather than unsupported emotional appeals.",
        "Paragraph Organization: Each body paragraph begins with a distinct topic sentence and provides elaboration.",
        "Transitional Cohesion: Connect paragraphs using markers like \"Furthermore,\", \"In addition,\", \"Consequently,\".",
        "Impactful Conclusion: Synthesize key takeaways and reinforce community and environmental responsibility."
],
      examples: [
        {
          title: "Thesis Formulation",
          example: "\"Preserving the marine sanctuaries of Davao Oriental requires municipal waste regulation, community mangrove reforestation, and sustainable eco-tourism practices.\"",
          analysis: "A comprehensive, 3-point informative thesis statement."
        },
        {
          title: "Cohesive Elaboration",
          example: "\"Furthermore, community reforestation along riverbanks prevents agricultural runoff from choking delicate coral reefs in Pujada Bay.\"",
          analysis: "Demonstrates transition signal and cause-and-effect factual elaboration."
        }
      ],
      culturalConnection: "Students across Davao Oriental draft informative essays advocating for Mount Hamiguitan conservation and marine protection in Pujada Bay.",
      warmupQuestion: {
        question: "What is the primary function of a thesis statement in an informative essay?",
        options: ["To state the central topic and main supporting points of the entire essay","To list the author’s favorite songs","To tell a funny joke to open the essay","To apologize for writing an essay"],
        correctAnswer: "To state the central topic and main supporting points of the entire essay",
        feedback: "Correct! A thesis statement outlines the central topic and supporting points."
      },
      writingPrompt: {
        title: "Informative Essay Outline",
        instructions: "Draft a 3-point outline for an informative essay about protecting coastal waters in Davao Oriental.",
        sampleStarter: "Thesis: Protecting coastal waters in Davao Oriental is crucial for marine biodiversity, local livelihoods, and eco-tourism..."
      }
    },
    quizQuestions: [
      {
        id: 'g7-q4-m8-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: "Architectural Blueprint : Building :: Thesis Statement : _____",
        analogyPair: {
          firstA: "Architectural Blueprint",
          firstB: "Building",
          secondC: "Thesis Statement",
          relationshipType: "Structural Foundation"
        },
        options: ["Informative Essay","Casual Tweet","Unwritten Thought","Silent Gesture"],
        answer: "Informative Essay",
        explanation: "A thesis statement anchors an informative essay.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m8-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: "Complete: Each body paragraph in an informative essay should open with a clear _____ sentence.",
        contextSentence: "Each body paragraph in an informative essay should open with a clear _____ sentence.",
        options: ["topic","rhyming","joke","false"],
        answer: "topic",
        explanation: "A topic sentence states paragraph focus.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m8-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: "Which document represents a well-structured multi-paragraph essay?",
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: "Structured 5-Paragraph Essay with Introduction, Body, and Conclusion", caption: "Organized informative essay" },
          { id: 'p2', sceneId: 'coastal_horizon', label: "Single Random Sentence", caption: "Unstructured fragment" }
        ],
        answer: 'p1',
        explanation: "An essay requires introduction, structured body, and conclusion.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m8-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: "Solve crossword: 5-letter core claim of an essay (T _ _ _ _ S):",
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: 6,
          cluePrompt: "Central proposition of an essay"
        },
        options: ["THESIS","TITLE","THEME","TOPIC"],
        answer: "THESIS",
        explanation: "A THESIS anchors an essay.",
        timeLimitSeconds: 45
      },
      {
        id: 'g7-q4-m8-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: "Type the 5-letter word: Written composition: E S S A Y:",
        hint: "Starts with E S S A Y",
        answer: "essay",
        explanation: "An essay organizes informative exposition.",
        timeLimitSeconds: 45
      }
    ]
  }
];
