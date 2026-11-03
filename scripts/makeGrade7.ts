import * as fs from 'fs';
import * as path from 'path';
import { RawModDef, formatModule } from './buildCurriculumData';

const G7_QUARTERS_2_TO_4: RawModDef[] = [
  // --- QUARTER 2: WANIBAN ISLAND (5 Modules: M11 to M15) ---
  {
    grade: 7, quarter: 2, qIdx: 1, overallNum: 11,
    title: 'Listening Strategies for Purpose and Text Difficulty',
    topic: 'listening', melcCode: 'EN7LC-II-a-6',
    melcText: 'Use listening strategies based on purpose, familiarity with the topic, and levels of difficulty of short texts listened to',
    overview: 'Effective listeners choose between top-down strategies (prior knowledge) and bottom-up strategies (decoding sounds and words) depending on whether their goal is general gist, specific details, or critical interpretation.',
    rules: [
      'Top-Down Listening: Uses background knowledge to predict and infer spoken messages.',
      'Bottom-Up Listening: Focuses on individual words, syllables, and grammatical inflections.',
      'Listening for Gist: Aims at grasping the main topic without fixating on single unfamiliar words.',
      'Listening for Specifics: Filters audio to catch exact dates, times, names, or emergency instructions.',
      'Critical Listening: Evaluates speaker tone, objectivity, and supporting evidence.'
    ],
    example1: { title: 'Listening for Gist', text: 'Radio announcement: "PAGASA warns fisherfolk in Pujada Bay to stay in port due to rough Pacific swells."', analysis: 'Gist: ocean travel is hazardous today due to weather.' },
    example2: { title: 'Listening for Specifics', text: 'Advisory: "Boat departures from Waniban Island resume tomorrow strictly at 6:30 AM."', analysis: 'Focuses on the exact time (6:30 AM) and departure location.' },
    cultural: 'Coastal fisherfolk in Mati City tune to provincial radio stations to monitor tide warnings and safety advisories across Pujada Bay.',
    warmupQ: 'What listening strategy is best when you only need to know what time a community boat departs?',
    warmupOpts: ['Listening for Specific Information', 'Appreciative Listening', 'Listening for General Gist', 'Daydreaming'],
    warmupAns: 'Listening for Specific Information',
    warmupFeedback: 'Correct! An exact departure time requires listening for specific details.',
    writingTitle: 'Listening Reflection Journal',
    writingInstr: 'Summarize a recent school or community announcement, identifying the main gist and two specific details.',
    writingStarter: 'During the flag ceremony announcement regarding the district English festival...',
    analogy: { prompt: 'Main Idea : Gist :: Exact Departure Time : _____', a: 'Main Idea', b: 'Gist', c: 'Departure Time', rel: 'Listening Purpose', ans: 'Specific Detail', dist: ['Vague Guess', 'Poetic Rhythm', 'Passive Murmur'], exp: 'Exact departure time is a specific detail.' },
    missing: { prompt: 'Complete: Focusing on the overall topic rather than every word is listening for _____.', sentence: 'Focusing on the overall topic rather than every word is listening for _____.', ans: 'gist', dist: ['spelling', 'accents', 'rhymes'], exp: 'Listening for gist captures the main idea.' },
    picture: { prompt: 'Which visual represents top-down listening using background knowledge?', l1: 'Brainstorming Mind Map', c1: 'Activating prior knowledge schemata', l2: 'Audio Waveform', c2: 'Raw sound frequencies', ans: 'p1', exp: 'Mind maps activate prior knowledge for top-down comprehension.' },
    crossword: { prompt: 'Solve crossword: 4-letter word for main point of a spoken text:', word: 'GIST', clue: 'Central idea or essence', dist: ['FACT', 'DATA', 'CLUE'], exp: 'GIST means main point.' },
    type: { prompt: 'Type the 7-letter word: Listening for S P E C I F I C information:', word: 'specific', hint: 'Starts with S P E C I F I C', exp: 'Specific listening catches exact details.' }
  },
  {
    grade: 7, quarter: 2, qIdx: 2, overallNum: 12,
    title: 'Navigating Search Engines and Web Resources',
    topic: 'research', melcCode: 'EN7SS-II-c-1.5.3',
    melcText: 'Use a search engine to conduct a guided search on a given topic',
    overview: 'Digital research requires precise query formulation. Using Boolean operators (AND, OR, NOT), quotation marks for exact phrasing, and domain evaluation (.gov, .edu, .org) separates academic facts from online misinformation.',
    rules: [
      'Quotation Marks (" "): Forces the search engine to match words in that exact order.',
      'AND Operator: Requires both search terms to appear on the indexed webpage.',
      'OR Operator: Expands search to pages containing either term.',
      'Minus / NOT (-): Excludes pages containing a specific keyword.',
      'Domain Evaluation: Academic (.edu) and government (.gov.ph) domains provide highest credibility.'
    ],
    example1: { title: 'Exact Phrase Match', text: '"Pujada Bay Protected Seascape"', analysis: 'Returns exclusively pages with that exact 4-word title.' },
    example2: { title: 'Exclusion Search', text: 'Hamiguitan -tourism', analysis: 'Finds ecological research about Mount Hamiguitan while filtering out travel advertisements.' },
    cultural: 'Junior high students in Mati City utilize search tools to study Mount Hamiguitan’s UNESCO World Heritage dossier.',
    warmupQ: 'Which query searches for the exact phrase "Davao Oriental wildlife"?',
    warmupOpts: ['"Davao Oriental wildlife"', 'Davao + Oriental + wildlife', 'Davao OR wildlife', 'wildlife-Davao-Oriental'],
    warmupAns: '"Davao Oriental wildlife"',
    warmupFeedback: 'Correct! Quotation marks search for the exact phrase.',
    writingTitle: 'Search Query Plan',
    writingInstr: 'Formulate two refined search queries to research endangered species in Davao Oriental.',
    writingStarter: 'To investigate the habitat of the Philippine Eagle in Mount Hamiguitan, my search queries are...',
    analogy: { prompt: 'Quotation Marks : Exact Phrase :: Minus Sign : _____', a: 'Quotation Marks', b: 'Exact Phrase', c: 'Minus Sign', rel: 'Search Operator', ans: 'Excluded Term', dist: ['Capitalization', 'Spelling Check', 'Hyperlink'], exp: 'The minus sign excludes keywords.' },
    missing: { prompt: 'Complete: To require that both words appear in results, use the operator _____.', sentence: 'To require that both words appear in results, use the operator _____.', ans: 'AND', dist: ['OR', 'NOT', 'IF'], exp: 'AND joins terms.' },
    picture: { prompt: 'Which website domain belongs to an accredited educational institution?', l1: 'University Portal (.edu)', c1: 'Accredited academic domain', l2: 'Commercial Blog (.com)', c2: 'Sponsored commercial page', ans: 'p1', exp: '.edu represents academic institutions.' },
    crossword: { prompt: 'Solve crossword: 6-letter search software (Google, Bing):', word: 'ENGINE', clue: 'Web search software', dist: ['PORTAL', 'BROWSE', 'SERVER'], exp: 'Search ENGINE queries indexes.' },
    type: { prompt: 'Type the 7-letter word: B O O L E A N logic (AND, OR, NOT):', word: 'boolean', hint: 'Starts with B O O L E A N', exp: 'Boolean operators refine web searches.' }
  },
  {
    grade: 7, quarter: 2, qIdx: 3, overallNum: 13,
    title: 'Evaluating Diverse Information Sources',
    topic: 'research', melcCode: 'EN7SS-II-d-1.3.8',
    melcText: 'Gather current information from newspapers and other print and non-print media',
    overview: 'Critical researchers examine the credibility of information across print broadsheets, television broadcasts, podcasts, and digital articles by assessing currency, authority, accuracy, and objectivity.',
    rules: [
      'Currency: Verify publication date to ensure timely, non-outdated information.',
      'Authority: Confirm author credentials and institutional accountability.',
      'Objectivity: Differentiate factual news reportage from opinion-based editorials.',
      'Cross-Verification: Corroborate claims across multiple independent reputable agencies.',
      'Primary vs Secondary: Value eyewitness accounts and primary records over rumors.'
    ],
    example1: { title: 'Vetted News Report', text: 'Philippine News Agency headline with byline, timestamp, and quotes from municipal scientists.', analysis: 'High credibility with transparent attribution.' },
    example2: { title: 'Unverified Social Media Post', text: 'An anonymous Facebook post warning of impending monster waves without official attribution.', analysis: 'Lacks institutional authority and requires verification against PAGASA.' },
    cultural: 'Community weeklies in Mati and Baganga chronicle coconut farming developments and coastal municipal ordinances.',
    warmupQ: 'What is the most reliable source for a storm advisory in Region XI?',
    warmupOpts: ['PAGASA official weather bulletin', 'An anonymous social media post', 'A text forwarded by a classmate', 'A meme page'],
    warmupAns: 'PAGASA official weather bulletin',
    warmupFeedback: 'Correct! Government scientific agencies provide verified primary data.'
    ,
    writingTitle: 'Source Comparison Log',
    writingInstr: 'Compare a verified newspaper article with a viral social media claim on an environmental topic.',
    writingStarter: 'When contrasting the official Department of Environment report with online commentary...',
    analogy: { prompt: 'Official Gazette : Primary Source :: Op-Ed Column : _____', a: 'Official Gazette', b: 'Primary Source', c: 'Op-Ed Column', rel: 'Source Type', ans: 'Opinion Commentary', dist: ['Scientific Law', 'Factual Census', 'Legal Statute'], exp: 'An op-ed column represents opinion commentary.' },
    missing: { prompt: 'Complete: Checking the date of publication verifies its _____.', sentence: 'Checking the date of publication verifies its _____.', ans: 'currency', dist: ['font', 'volume', 'color'], exp: 'Currency measures timeliness.' },
    picture: { prompt: 'Which medium features editorially vetted print journalism?', l1: 'Printed Daily Broadsheet', c1: 'Editorially vetted journalism', l2: 'Anonymous Chatroom', c2: 'Unverified rumor stream', ans: 'p1', exp: 'Printed broadsheets undergo editorial review.' },
    crossword: { prompt: 'Solve crossword: 6-letter creator of an article or book:', word: 'AUTHOR', clue: 'Originator of a written text', dist: ['EDITOR', 'READER', 'CRITIC'], exp: 'The AUTHOR writes the text.' },
    type: { prompt: 'Type the 7-letter word: Checking dates ensures source C U R R E N C Y:', word: 'currency', hint: 'Starts with C U R R E N C Y', exp: 'Currency ensures information is current.' }
  },
  {
    grade: 7, quarter: 2, qIdx: 4, overallNum: 14,
    title: 'Extracting Information: Summarizing, Précis, and Paraphrase',
    topic: 'reading', melcCode: 'EN7SS-II-e-1.3.1',
    melcText: 'Extract information from a text using a summary, précis, and paraphrase',
    overview: 'Extracting information effectively requires three complementary methods: paraphrasing (restating passage meaning completely in fresh words), summarizing (condensing overarching ideas), and précis writing (producing a balanced, concise abstract).',
    rules: [
      'Paraphrase: Re-expresses full passage details in fresh vocabulary without shortening.',
      'Summary: Condenses lengthy text into main overarching points.',
      'Précis: A disciplined abstract preserving the original author’s logical flow and tone.',
      'Avoid Plagiarism: Restructure sentence grammar and synonyms rather than copying phrases.',
      'Preserve Accuracy: Maintain original authorial intent without injecting personal bias.'
    ],
    example1: { title: 'Paraphrase Example', text: 'Original: "Dahican Beach hosts critical nesting grounds for endangered green turtles." -> Paraphrase: "The shores of Dahican provide essential breeding habitat for threatened sea turtles."', analysis: 'Preserves the entire meaning using fresh syntax and synonyms.' },
    example2: { title: 'Summary Compression', text: 'Original: 4-page article on coral reef conservation -> Summary: "Community initiatives in Pujada Bay protect marine ecosystems from destructive fishing."', analysis: 'Condenses the entire text into its core thesis.' },
    cultural: 'Exhibits at Subangan Provincial Museum summarize centuries of Mandaya folklore and marine biodiversity for visitors.',
    warmupQ: 'What is the main distinction between paraphrasing and summarizing?',
    warmupOpts: ['Paraphrasing keeps full detail in new words, while summarizing condenses to main ideas', 'Paraphrasing is shorter than a summary', 'Summarizing copies exact sentences with quotes', 'They are completely identical'],
    warmupAns: 'Paraphrasing keeps full detail in new words, while summarizing condenses to main ideas',
    warmupFeedback: 'Correct! Paraphrasing maintains detail while summarizing condenses.'
    ,
    writingTitle: 'Paraphrase and Summary Task',
    writingInstr: 'Paraphrase a paragraph about Mount Hamiguitan and then summarize it into one concise sentence.',
    writingStarter: 'The original excerpt highlights the pygmy bonsai forest of Mount Hamiguitan...'
    ,
    analogy: { prompt: 'Paraphrase : Detailed Restatement :: Summary : _____', a: 'Paraphrase', b: 'Detailed Restatement', c: 'Summary', rel: 'Comprehension Strategy', ans: 'Condensed Overview', dist: ['Verbatim Copy', 'Poetic Meter', 'Word Expansion'], exp: 'A summary condenses main ideas.' },
    missing: { prompt: 'Complete: Restating a passage in your own words while retaining its full meaning is a _____.', sentence: 'Restating a passage in your own words while retaining its full meaning is a _____.', ans: 'paraphrase', dist: ['plagiarism', 'quotation', 'misinterpretation'], exp: 'Paraphrasing preserves meaning in new words.' },
    picture: { prompt: 'Which process condenses an entire chapter into a single summary page?', l1: 'Summarizing Funnel', c1: 'Distilling main ideas', l2: 'Photocopy Machine', c2: 'Duplicating every word', ans: 'p1', exp: 'Summarizing distills core concepts.' },
    crossword: { prompt: 'Solve crossword: 6-letter concise structured abstract:', word: 'PRECIS', clue: 'Concise summary or abstract', dist: ['REPORT', 'REVIEW', 'DRAFT'], exp: 'A PRECIS is a concise summary.' },
    type: { prompt: 'Type the 7-letter word: Condensing main ideas into a S U M M A R Y:', word: 'summary', hint: 'Starts with S U M M A R Y', exp: 'A summary highlights essential points.' }
  },
  {
    grade: 7, quarter: 2, qIdx: 5, overallNum: 15,
    title: 'Print vs Broadcast Media and Linear vs Non-Linear Texts',
    topic: 'viewing', melcCode: 'EN7RC-II-f-10',
    melcText: 'Transcode information from linear to non-linear texts and explain illustrations in diverse media',
    overview: 'Texts are organized either linearly (read sequentially from start to end) or non-linearly (read through visual graphics like tables, flowcharts, Venn diagrams, and infographics). Transcoding converts text between these two presentation formats.',
    rules: [
      'Linear Text: Follows sequential narrative order (newspaper articles, stories, speeches).',
      'Non-Linear Text: Follows multi-directional visual flow (charts, graphs, diagrams, maps).',
      'Transcoding: Converting narrative text into a graphic organizer or turning data charts into written paragraphs.',
      'Flowcharts: Illustrate procedural steps and sequential decision points.',
      'Venn Diagrams: Highlight shared features and distinct differences between topics.'
    ],
    example1: { title: 'Linear to Non-Linear Transcoding', text: 'Text: "Pujada Bay visitor numbers reached 20,000 in 2024 and 35,000 in 2025." -> Transcoded to a 2-bar vertical comparison graph.', analysis: 'Visual bar chart enables rapid data comparison.' },
    example2: { title: 'Graphic to Linear Transcoding', text: 'Reading a temperature and rainfall line graph of Mati City and explaining the wet season in a written paragraph.', analysis: 'Visual trends are converted into descriptive sentences.' },
    cultural: 'Provincial eco-tourism brochures feature non-linear infographics showing travel routes from Davao City to Mati and Baganga.',
    warmupQ: 'Which of the following represents a non-linear text?',
    warmupOpts: ['A Venn diagram comparing two islands', 'A printed novel chapter', 'A formal letter of request', 'A personal journal entry'],
    warmupAns: 'A Venn diagram comparing two islands',
    warmupFeedback: 'Correct! Venn diagrams are non-linear graphic organizers.'
    ,
    writingTitle: 'Transcoding Synthesis Exercise',
    writingInstr: 'Examine a table of tourist arrivals in Davao Oriental and write a descriptive linear paragraph summarizing the trends.',
    writingStarter: 'Based on the municipal tourism table, travel to Waniban Island surged during summer months...'
    ,
    analogy: { prompt: 'Newspaper Article : Linear Text :: Infographic : _____', a: 'Newspaper Article', b: 'Linear Text', c: 'Infographic', rel: 'Text Format', ans: 'Non-Linear Text', dist: ['Audio Podcast', 'Printed Novel', 'Spoken Monologue'], exp: 'An infographic is a non-linear text.' },
    missing: { prompt: 'Complete: Converting narrative paragraphs into graphic flowcharts is an act of _____.', sentence: 'Converting narrative paragraphs into graphic flowcharts is an act of _____.', ans: 'transcoding', dist: ['memorizing', 'spelling', 'deleting'], exp: 'Transcoding converts between linear and visual formats.' },
    picture: { prompt: 'Which diagram is used to compare overlapping traits between two concepts?', l1: 'Venn Diagram (Overlapping circles)', c1: 'Comparative traits', l2: 'Linear Timeline', c2: 'Sequential dates', ans: 'p1', exp: 'Venn diagrams show overlapping traits.' },
    crossword: { prompt: 'Solve crossword: 6-letter text read sequentially from start to finish:', word: 'LINEAR', clue: 'Sequential reading structure', dist: ['STATIC', 'NATIVE', 'CASUAL'], exp: 'LINEAR text flows sequentially.' },
    type: { prompt: 'Type the 7-letter word: Converting text into graphics: T R A N S C O D E:', word: 'transcode', hint: 'Starts with T R A N S C O D E', exp: 'Transcoding converts data across formats.' }
  },

  // --- QUARTER 3: OAK ISLAND (7 Modules: M16 to M22) ---
  {
    grade: 7, quarter: 3, qIdx: 1, overallNum: 16,
    title: 'Multimedia Resources in Oral Communication',
    topic: 'speaking', melcCode: 'EN7OL-III-b-3',
    melcText: 'Use multimedia resources when orally giving information, instructions, making explanations and narrating events',
    overview: 'Oral communication is enriched by multimedia resources—slides, audio clips, charts, and video demonstrations—which clarify complex instructions, engage audience attention, and reinforce verbal delivery.',
    rules: [
      'Visual Synergy: Multimedia should complement spoken words, never replace the speaker.',
      'Clarity over Clutter: Keep slides concise with bullet points, high-contrast text, and relevant imagery.',
      'Audio Integration: Use recorded sound clips judiciously to illustrate real-world oral history or dialect.',
      'Audience Engagement: Maintain eye contact with the audience rather than reading directly from screens.',
      'Rehearsal: Test audio-visual equipment in advance to avoid technical disruptions.'
    ],
    example1: { title: 'Slide Presentation', text: 'A student delivering a report on Dahican marine life displays an infographic map while explaining sea turtle nesting sites.', analysis: 'Visual map reinforces spoken geography.' },
    example2: { title: 'Audio Demonstration', text: 'Playing an authentic Mandaya vocal chant before explaining traditional musical rhythm.', analysis: 'Audio provides direct sensory evidence to listeners.' },
    cultural: 'Oral presentations during Mati City youth environmental summits use multimedia slides to showcase Pujada Bay conservation.',
    warmupQ: 'What is the primary role of multimedia during an oral presentation?',
    warmupOpts: ['To enhance and clarify spoken ideas', 'To give the speaker an excuse not to speak', 'To display every single word spoken', 'To distract the audience with bright lights'],
    warmupAns: 'To enhance and clarify spoken ideas',
    warmupFeedback: 'Correct! Multimedia should enhance and clarify oral messages.'
    ,
    writingTitle: 'Multimedia Presentation Outline',
    writingInstr: 'Plan a 3-slide oral presentation about a landmark in Davao Oriental, describing visuals and spoken talking points.',
    writingStarter: 'For my presentation on the Sleeping Dinosaur landmark in Mati City, Slide 1 will show...'
    ,
    analogy: { prompt: 'Spoken Words : Audio :: Slide Infographic : _____', a: 'Spoken Words', b: 'Audio', c: 'Slide Infographic', rel: 'Media Mode', ans: 'Visual Resource', dist: ['Printed Textbook', 'Silent Reading', 'Stage Prop'], exp: 'An infographic is a visual resource.' },
    missing: { prompt: 'Complete: Multimedia slides should clarify ideas rather than _____ the audience.', sentence: 'Multimedia slides should clarify ideas rather than _____ the audience.', ans: 'distract', dist: ['inform', 'engage', 'guide'], exp: 'Slides should never distract listeners.' },
    picture: { prompt: 'Which visual represents effective oral presentation delivery?', l1: 'Speaker engaging audience with slide visual', c1: 'Balanced multimedia delivery', l2: 'Speaker reading directly off screen', c2: 'Disconnected delivery', ans: 'p1', exp: 'Effective speakers maintain eye contact while referencing visuals.' },
    crossword: { prompt: 'Solve crossword: 5-letter term for electronic presentation pages:', word: 'SLIDE', clue: 'Presentation graphic page', dist: ['FRAME', 'SHEET', 'BOARD'], exp: 'A SLIDE displays presentation content.' },
    type: { prompt: 'Type the 5-letter word: Presentation visual S L I D E:', word: 'slide', hint: 'Starts with S L I D E', exp: 'Slides support oral presentations.' }
  },
  {
    grade: 7, quarter: 3, qIdx: 2, overallNum: 17,
    title: 'Factors of Oral Delivery, Stance, and Non-Verbal Cues',
    topic: 'speaking', melcCode: 'EN7OL-III-d-3',
    melcText: 'Employ the appropriate oral language and non-verbal cues in varied oral communication situations',
    overview: 'Persuasive public speaking combines verbal clarity (volume, pitch, pace, pausing) with non-verbal cues (confident posture, deliberate hand gestures, natural eye contact, and purposeful facial expressions).',
    rules: [
      'Volume and Projection: Speak with sufficient breath support so listeners in the back hear clearly.',
      'Pace and Pausing: Use strategic pauses before key terms to allow concepts to settle.',
      'Posture and Stance: Stand balanced with shoulders relaxed and feet grounded to project authority.',
      'Facial Expressions: Align expressions with emotional tone (serious for crises, warm for welcoming).',
      'Eye Contact: Sweep gaze across all sections of the room to foster personal connection.'
    ],
    example1: { title: 'Strategic Pausing', text: '"Our bay is fragile. [Pause] But together... [Pause] we can preserve it."', analysis: 'Pauses create dramatic emphasis and highlight resolve.' },
    example2: { title: 'Non-Verbal Gestures', text: 'Extending open hands when welcoming guest speakers versus pointing aggressively.', analysis: 'Open gestures project warmth and inclusivity.' },
    cultural: 'Mandaya tribal leaders in Davao Oriental command community gatherings through resonant voice projection and dignified stance.',
    warmupQ: 'What happens when a speaker speaks too quickly without pausing?',
    warmupOpts: ['Listeners struggle to digest key points', 'The speech becomes more understandable', 'Volume automatically increases', 'Eye contact improves'],
    warmupAns: 'Listeners struggle to digest key points',
    warmupFeedback: 'Correct! Rapid delivery without pausing overwhelms audience retention.'
    ,
    writingTitle: 'Speech Delivery Critique',
    writingInstr: 'Evaluate your own public speaking habits, noting one verbal strength and one non-verbal cue to improve.',
    writingStarter: 'When delivering speeches in class, I notice that my vocal projection is clear, but...'
    ,
    analogy: { prompt: 'Vocal Projection : Verbal Cue :: Eye Contact : _____', a: 'Vocal Projection', b: 'Verbal Cue', c: 'Eye Contact', rel: 'Communication Modality', ans: 'Non-Verbal Cue', dist: ['Grammar Rule', 'Spelling Form', 'Written Clause'], exp: 'Eye contact is a non-verbal cue.' },
    missing: { prompt: 'Complete: Pausing after an important statement creates dramatic _____.', sentence: 'Pausing after an important statement creates dramatic _____.', ans: 'emphasis', dist: ['confusion', 'volume', 'pitch'], exp: 'Pauses create emphasis.' },
    picture: { prompt: 'Which posture conveys confidence and poise in public speaking?', l1: 'Upright, balanced stance with open hands', c1: 'Confident public posture', l2: 'Slouched posture with hands in pockets', c2: 'Insecure stance', ans: 'p1', exp: 'An upright, balanced stance projects confidence.' },
    crossword: { prompt: 'Solve crossword: 5-letter word for highness or lowness of vocal tone:', word: 'PITCH', clue: 'Vocal tone frequency', dist: ['SPEED', 'PAUSE', 'SOUND'], exp: 'PITCH refers to vocal frequency.' },
    type: { prompt: 'Type the 5-letter word: Body posture and S T A N C E in speaking:', word: 'stance', hint: 'Starts with S T A N C E', exp: 'Stance reflects physical posture.' }
  },
  {
    grade: 7, quarter: 3, qIdx: 3, overallNum: 18,
    title: 'Literary Influences: Culture, History, and Environment',
    topic: 'literature', melcCode: 'EN7LT-III-g-5',
    melcText: 'Discover literature as a tool to assert one\'s unique identity and understand other people',
    overview: 'Philippine literature reflects the interplay of historical struggles, indigenous customs, and natural landscapes. Reading regional folk narratives, legends, and poetry illuminates ancestral values and fosters empathy for neighboring cultures.',
    rules: [
      'Cultural Reflection: Folk narratives mirror ancestral beliefs, rituals, and family values.',
      'Historical Context: Literature reflects the socio-political realities and resistance of its era.',
      'Environmental Harmony: Philippine epics frequently honor sacred rivers, seas, and mountains.',
      'Universal Themes: Love, resilience, and justice transcend regional cultural boundaries.',
      'Identity Formation: Engaging local stories deepens pride in ancestral heritage.'
    ],
    example1: { title: 'Folktale Analysis', text: 'The Mandaya legend of the creation of the sun and moon explains celestial balance through mythical heroism.', analysis: 'Reflects indigenous cosmology and respect for natural forces.' },
    example2: { title: 'Regional Poetry', text: 'Verses depicting fisherfolk casting nets at dawn across Pujada Bay symbolize daily diligence.', analysis: 'Celebrates local maritime livelihoods.' },
    cultural: 'Mandaya oral epics preserved in the municipalities of Caraga, Manay, and Mati in Davao Oriental embody centuries of wisdom.',
    warmupQ: 'Why is studying regional folk literature valuable for young Filipinos?',
    warmupOpts: ['It connects learners with ancestral values and regional identity', 'It forces everyone to speak in riddles', 'It replaces all modern scientific study', 'It is only useful for memorizing dates'],
    warmupAns: 'It connects learners with ancestral values and regional identity',
    warmupFeedback: 'Correct! Regional literature fosters cultural pride and identity.'
    ,
    writingTitle: 'Heritage Story Reflection',
    writingInstr: 'Reflect on a local folk narrative or proverb from Davao Oriental and describe the moral lesson it teaches.',
    writingStarter: 'The traditional story of our coastal ancestors teaches us that respect for marine life...'
    ,
    analogy: { prompt: 'Folk Legend : Cultural Lore :: Historical Document : _____', a: 'Folk Legend', b: 'Cultural Lore', c: 'Historical Document', rel: 'Literary Nature', ans: 'Factual Record', dist: ['Fictional Novel', 'Stage Prop', 'Rhyming Riddle'], exp: 'A historical document provides factual record.' },
    missing: { prompt: 'Complete: Traditional Philippine oral narratives celebrate communal unity and ancestral _____.', sentence: 'Traditional Philippine oral narratives celebrate communal unity and ancestral _____.', ans: 'heritage', dist: ['gadgets', 'machines', 'traffic'], exp: 'Narratives celebrate ancestral heritage.' },
    picture: { prompt: 'Which artistic expression represents indigenous Philippine storytelling?', l1: 'Mandaya Oral Epic Chanting', c1: 'Indigenous oral tradition', l2: 'Silent Reading on Tablet', c2: 'Modern digital reading', ans: 'p1', exp: 'Oral chanting preserves indigenous folklore.' },
    crossword: { prompt: 'Solve crossword: 4-letter narrative of gods and cosmic origins (M _ _ H):', word: 'MYTH', clue: 'Traditional sacred story', dist: ['FACT', 'DATA', 'TALE'], exp: 'A MYTH explains cosmic origins.' },
    type: { prompt: 'Type the 8-letter word: Ancestral traditions and H E R I T A G E:', word: 'heritage', hint: 'Starts with H E R I T A G E', exp: 'Heritage encompasses cultural legacy.' }
  },
  {
    grade: 7, quarter: 3, qIdx: 4, overallNum: 19,
    title: 'Expressing Beliefs and Convictions Based on Viewed Materials',
    topic: 'viewing', melcCode: 'EN7VC-III-h-13',
    melcText: 'Express one\'s beliefs/convictions based on a material viewed',
    overview: 'Viewing documentaries, short films, and photojournalism prompts learners to formulate principled viewpoints. Constructing evidence-based convictions requires stating a clear claim, citing visual proof, and acknowledging alternative perspectives.',
    rules: [
      'Clear Stance: Formulate a definitive assertion (e.g., "I firmly believe that...", "The evidence demonstrates that...").',
      'Cite Visual Evidence: Reference specific scenes, interviews, data charts, or camera angles from the viewed material.',
      'Avoid Mere Emotion: Ground convictions in observable facts rather than unexamined feelings.',
      'Ethical Reasoning: Consider community welfare, human rights, and environmental protection.',
      'Respectful Dialogue: Express firm convictions while engaging opposing viewpoints courteously.'
    ],
    example1: { title: 'Documentary Stance', text: '"After viewing the documentary on Pujada Bay coral bleaching, I am convinced that stricter municipal waste regulations are urgent."', analysis: 'States a clear conviction supported by documentary evidence.' },
    example2: { title: 'Photojournalism Reaction', text: '"The visual depiction of plastic debris washed ashore on Dahican Beach proves that individual consumption choices impact marine life."', analysis: 'Draws a reasoned ecological conviction from photojournalism.' },
    cultural: 'Youth environmental clubs in Mati City view marine documentaries to advocate for conservation ordinances in local barangays.',
    warmupQ: 'What makes a conviction persuasive when reacting to a documentary?',
    warmupOpts: ['Supporting the claim with concrete visual evidence and facts', 'Yelling louder than anyone else', 'Claiming you saw it on a meme', 'Ignoring all facts presented in the film'],
    warmupAns: 'Supporting the claim with concrete visual evidence and facts',
    warmupFeedback: 'Correct! Citing concrete evidence makes convictions persuasive.'
    ,
    writingTitle: 'Viewpoint Commentary',
    writingInstr: 'Watch a short video clip or view a photograph of coastal conservation and write a 3-sentence statement of conviction.',
    writingStarter: 'Based on the imagery of community reef rangers in Pujada Bay, I firmly believe that...'
    ,
    analogy: { prompt: 'Unsubstantiated Rumor : Weak Stance :: Verified Visual Fact : _____', a: 'Unsubstantiated Rumor', b: 'Weak Stance', c: 'Verified Visual Fact', rel: 'Argument Strength', ans: 'Solid Conviction', dist: ['Vague Guess', 'Blind Faith', 'Casual Gossip'], exp: 'Verified facts support solid convictions.' },
    missing: { prompt: 'Complete: Expressing a principled conviction requires citing observable _____.', sentence: 'Expressing a principled conviction requires citing observable _____.', ans: 'evidence', dist: ['rumors', 'guesses', 'fiction'], exp: 'Evidence substantiates convictions.' },
    picture: { prompt: 'Which medium provides visual evidence for environmental advocacy?', l1: 'Environmental Documentary Video', c1: 'Visual evidentiary medium', l2: 'Unlabeled Cartoon Drawing', c2: 'Fictional sketch', ans: 'p1', exp: 'Documentaries document real-world evidence.' },
    crossword: { prompt: 'Solve crossword: 5-letter word for personal conviction or conviction (F _ _ _ H):', word: 'FAITH', clue: 'Firm belief or confidence', dist: ['DOUBT', 'TRUST', 'PROOF'], exp: 'FAITH represents firm belief.' },
    type: { prompt: 'Type the 5-letter word: Firm opinion and B E L I E F:', word: 'belief', hint: 'Starts with B E L I E F', exp: 'Belief reflects personal conviction.' }
  },
  {
    grade: 7, quarter: 3, qIdx: 5, overallNum: 20,
    title: 'Citing Evidence to Support a General Statement',
    topic: 'reading', melcCode: 'EN7RC-III-i-2.1.7',
    melcText: 'Cite evidence to support a general statement',
    overview: 'A general statement expresses a broad assertion or overarching claim. To be credible, it must be substantiated with specific textual evidence—statistics, verifiable facts, expert testimony, and concrete examples.',
    rules: [
      'General vs Specific: General statements assert broad claims; specific evidence provides concrete proof.',
      'Types of Evidence: Statistics, empirical research, quotes from authorities, and real-life examples.',
      'Signal Words: Introduce evidence using "For instance,", "Research indicates that,", "According to the data,".',
      'Relevance: Ensure cited proof directly substantiates the exact scope of the general statement.',
      'Sufficiency: One single anecdotal example rarely proves a sweeping universal claim.'
    ],
    example1: { title: 'General Statement & Proof', text: 'General Statement: "Mount Hamiguitan harbors extraordinary biodiversity." -> Evidence: "Field surveys document over 1,400 species, including 341 flora types found nowhere else on Earth."', analysis: 'Exact numbers and field counts prove the broad claim.' },
    example2: { title: 'Community Generalization', text: 'General Statement: "Mati City actively promotes eco-tourism." -> Evidence: "The local government established marine reserves at Pujada Bay and regulated skimboarding zones at Dahican."', analysis: 'Specific municipal initiatives corroborate the general statement.' }
  ,
    cultural: 'Official reports on Davao Oriental biodiversity present general environmental summaries corroborated by species inventories.',
    warmupQ: 'Which of the following serves as specific evidence for the statement "Dahican Beach is a major surfing destination"?',
    warmupOpts: ['"It hosts the annual national skimboarding competition attracting over 200 athletes"', '"It has sand on the beach"', '"Water is blue in the ocean"', '"People like summer vacations"'],
    warmupAns: '"It hosts the annual national skimboarding competition attracting over 200 athletes"',
    warmupFeedback: 'Correct! The annual competition with athlete counts is concrete evidence.'
    ,
    writingTitle: 'Claim and Evidence Formulation',
    writingInstr: 'Make a general statement about high school life and support it with two specific facts or examples.',
    writingStarter: 'General Statement: Junior high school develops essential life skills; for instance...'
    ,
    analogy: { prompt: 'Broad Claim : General Statement :: Specific Statistic : _____', a: 'Broad Claim', b: 'General Statement', c: 'Specific Statistic', rel: 'Argument Component', ans: 'Concrete Evidence', dist: ['Random Guess', 'Fictional Plot', 'Poetic Metaphor'], exp: 'A statistic functions as concrete evidence.' },
    missing: { prompt: 'Complete: To prove a broad claim, a writer must provide specific _____.', sentence: 'To prove a broad claim, a writer must provide specific _____.', ans: 'evidence', dist: ['fonts', 'colors', 'guesses'], exp: 'Evidence validates claims.' },
    picture: { prompt: 'Which represents verifiable textual proof in a research study?', l1: 'Scientific Census Table', c1: 'Verifiable statistical data', l2: 'Empty Text Box', c2: 'Unsupported blank area', ans: 'p1', exp: 'Census tables provide concrete statistical proof.' },
    crossword: { prompt: 'Solve crossword: 5-letter piece of factual proof (F _ _ T):', word: 'FACTS', clue: 'Verifiable reality or truth', dist: ['PLOTS', 'NOTES', 'IDEAS'], exp: 'FACTS substantiate assertions.' },
    type: { prompt: 'Type the 5-letter word: Concrete proof or F A C T S:', word: 'facts', hint: 'Starts with F A C T S', exp: 'Facts prove general claims.' }
  },
  {
    grade: 7, quarter: 3, qIdx: 6, overallNum: 21,
    title: 'Statements of Fact and Opinion in Discourse',
    topic: 'reading', melcCode: 'EN7RC-III-j-2.13',
    melcText: 'Differentiate between statements of fact and opinion in varied texts',
    overview: 'Distinguishing fact (empirically verifiable through objective observation, measurement, or records) from opinion (personal judgment, emotional feeling, or aesthetic appraisal) is vital for media literacy and critical reading.',
    rules: [
      'Fact: Can be verified as true or false using evidence, official records, or scientific observation.',
      'Opinion: Expresses a belief, judgment, or feeling; cannot be proven objectively true for everyone.',
      'Opinion Signal Words: "In my view,", "I believe,", "The best,", "Worst,", "Probably,", "Should,".',
      'Factual Verifiers: Measurement units (meters, dates, percentages), historical documents, scientific data.',
      'Mixed Statements: Statements often blend factual clauses with opinionated adjectives.'
    ],
    example1: { title: 'Fact Statement', text: '"Pujada Bay covers an area of approximately 156 square kilometers in Mati City."', analysis: 'Verifiable through geographical surveys and provincial records.' },
    example2: { title: 'Opinion Statement', text: '"Dahican Beach is the most breathtaking coastal destination in the Philippines."', analysis: 'Contains the subjective superlative "most breathtaking", reflecting personal taste.' },
    cultural: 'Provincial travel reviews feature opinions praising local seafood alongside factual municipal driving distances.',
    warmupQ: 'Which of the following is a statement of FACT?',
    warmupOpts: ['Mount Hamiguitan has an elevation of 1,620 meters above sea level', 'Mount Hamiguitan is the most exciting hike in Mindanao', 'Mountain climbing is the best hobby for students', 'Sunsets in Mati are better than sunsets in Davao'],
    warmupAns: 'Mount Hamiguitan has an elevation of 1,620 meters above sea level',
    warmupFeedback: 'Correct! The 1,620-meter elevation is an objectively measurable geographic fact.'
    ,
    writingTitle: 'Fact vs Opinion Duality',
    writingInstr: 'Write one statement of fact and one statement of opinion about your school or town.',
    writingStarter: 'Fact: Our high school was established in... Opinion: In my view, our campus is...'
    ,
    analogy: { prompt: 'Objective Proof : Fact :: Personal Judgment : _____', a: 'Objective Proof', b: 'Fact', c: 'Personal Judgment', rel: 'Epistemic Nature', ans: 'Opinion', dist: ['Statute', 'Measurement', 'Scientific Law'], exp: 'Personal judgment is an opinion.' },
    missing: { prompt: 'Complete: Words like "probably", "in my view", and "most beautiful" signal an _____.', sentence: 'Words like "probably", "in my view", and "most beautiful" signal an _____.', ans: 'opinion', dist: ['fact', 'equation', 'measurement'], exp: 'Such phrases signal opinions.' },
    picture: { prompt: 'Which visual represents an objective factual measurement tool?', l1: 'Calibrated Thermometer', c1: 'Objective empirical measurement', l2: 'Star Rating Emoji', c2: 'Subjective opinion rating', ans: 'p1', exp: 'Thermometers provide objective factual measurements.' },
    crossword: { prompt: 'Solve crossword: 4-letter verifiable reality (F _ _ T):', word: 'FACT', clue: 'Objective truth or reality', dist: ['MYTH', 'HOAX', 'IDEA'], exp: 'A FACT can be proven.' },
    type: { prompt: 'Type the 7-letter word: Personal subjective view: O P I N I O N:', word: 'opinion', hint: 'Starts with O P I N I O N', exp: 'An opinion reflects subjective views.' }
  },
  {
    grade: 7, quarter: 3, qIdx: 7, overallNum: 22,
    title: 'Raising Sensible, Challenging, and Thought-Provoking Questions',
    topic: 'speaking', melcCode: 'EN7OL-III-e-1.4',
    melcText: 'Raise sensible, challenging, and thought-provoking questions in public forums/panel discussions',
    overview: 'In panel discussions and classroom debates, formulating high-level open-ended questions (evaluative, hypothetical, and analytical) deepens dialogue. Thought-provoking questions begin with "How might...", "What are the long-term consequences of...", and "Why do you conclude...".',
    rules: [
      'Avoid Closed Questions: Questions answering with simple "yes" or "no" stifle discussion.',
      'Use Wh- Openers: Frame inquiries around "How", "Why", "Under what circumstances", and "To what extent".',
      'Ground in Context: Preface the question with a brief observation from the speaker’s talk.',
      'Challenge Assumptions: Politely inquire into trade-offs, ecological impacts, or alternative solutions.',
      'Courteous Tone: Address speakers respectfully without confrontational sarcasm.'
    ],
    example1: { title: 'Surface vs Thought-Provoking', text: 'Surface: "Do you like coastal tourism?" -> Thought-Provoking: "How can the municipality balance tourist expansion in Dahican with protecting endangered sea turtle nesting grounds?"', analysis: 'The revised question targets systemic policy trade-offs.' },
    example2: { title: 'Grounded Inquiry', text: '"Given that coral bleaching has risen by 15% in the bay, what specific community incentives could encourage local fishers to adopt sustainable gear?"', analysis: 'Cites data and invites actionable solutions.' },
    cultural: 'Barangay assemblies and coastal resource hearings in Mati City invite youth leaders to raise thoughtful questions on fisheries protection.',
    warmupQ: 'Which question is most thought-provoking during a seminar on plastic pollution in Pujada Bay?',
    warmupOpts: [
      'What economic alternatives can we provide coastal vendors to phase out single-use plastics without harming their livelihood?',
      'Is plastic bad for the ocean?',
      'What color are plastic bottles?',
      'Do you sell bottled water here?'
    ],
    warmupAns: 'What economic alternatives can we provide coastal vendors to phase out single-use plastics without harming their livelihood?',
    warmupFeedback: 'Correct! It addresses the complex balance between environmental policy and vendor livelihoods.'
    ,
    writingTitle: 'Panel Inquiry Formulation',
    writingInstr: 'Imagine a panel on Mount Hamiguitan conservation. Write two high-level open-ended questions for the forest rangers.',
    writingStarter: 'To the lead conservation officer: Considering the balance between eco-tourism revenue and biodiversity...'
    ,
    analogy: { prompt: 'Yes/No Query : Closed Question :: Why/How Inquiry : _____', a: 'Yes/No Query', b: 'Closed Question', c: 'Why/How Inquiry', rel: 'Question Architecture', ans: 'Open-Ended Question', dist: ['Rhetorical Silence', 'Unanswered Void', 'Monologue Speech'], exp: 'Why/How inquiries are open-ended questions.' },
    missing: { prompt: 'Complete: Thought-provoking inquiries in panel discussions promote deep critical _____.', sentence: 'Thought-provoking inquiries in panel discussions promote deep critical _____.', ans: 'thinking', dist: ['silence', 'anger', 'guessing'], exp: 'Deep questions foster critical thinking.' },
    picture: { prompt: 'Which question format invites detailed analytical discussion?', l1: 'Question mark leading to open conversation', c1: 'Open-ended inquiry', l2: 'Binary Checkbox (Yes / No)', c2: 'Closed binary choice', ans: 'p1', exp: 'Open-ended questions spark rich dialogue.' },
    crossword: { prompt: 'Solve crossword: 3-letter question word targeting reasons or causes (W _ Y):', word: 'WHY', clue: 'Inquiry into reason or purpose', dist: ['HOW', 'WHO', 'CAN'], exp: 'WHY explores causes and reasons.' },
    type: { prompt: 'Type the 8-letter word: Inquiring deeply: Q U E S T I O N:', word: 'question', hint: 'Starts with Q U E S T I O N', exp: 'Questions stimulate critical inquiry.' }
  },

  // --- QUARTER 4: SAN VICTOR ISLAND (8 Modules: M23 to M30) ---
  {
    grade: 7, quarter: 4, qIdx: 1, overallNum: 23,
    title: 'Features and Conventions of Academic Writing',
    topic: 'writing', melcCode: 'EN7WC-IV-a-2.2',
    melcText: 'Distinguish the features of academic writing and appreciate its importance in intellectual inquiry',
    overview: 'Academic writing is formal, objective, structured, and evidenced. It avoids colloquial slang, contractions, and unsupported claims, adopting third-person objectivity, precise vocabulary, and formal transitional cohesion.',
    rules: [
      'Formality: Avoid colloquialisms, texting acronyms (u, btw), and conversational contractions (can’t -> cannot).',
      'Objectivity: Focus on evidence and logical analysis rather than personal emotional bias.',
      'Hedging and Caution: Use cautious language (suggests, indicates, appears) instead of absolute assertions.',
      'Explicit Structure: Include clear introductory thesis, body paragraphs with topic sentences, and logical conclusion.',
      'Citation Integrity: Attribute all source data, statistics, and definitions to avoid plagiarism.'
    ],
    example1: { title: 'Informal vs Academic', text: 'Informal: "Lots of trash is messing up the beach real bad." -> Academic: "Substantial marine debris significantly degrades the ecological equilibrium of coastal habitats."', analysis: 'Demonstrates formal vocabulary, objective tone, and syntactic precision.' },
    example2: { title: 'Hedging in Academic Prose', text: 'Absolute: "This law will fix all coral reef damage." -> Hedged: "This municipal ordinance is likely to mitigate coral reef degradation across Pujada Bay."', analysis: 'Demonstrates scientific caution and academic nuance.' },
    cultural: 'High school research projects presented at the Davao Oriental Division Science and English Fairs adhere to academic writing standards.',
    warmupQ: 'Which sentence best exemplifies formal academic style?',
    warmupOpts: [
      'The experimental data indicate a statistically significant increase in marine biodiversity.',
      'The results were totally cool and super awesome for the fish!',
      'I think it is pretty obvious that things worked out great, you know?',
      'Fish were like everywhere in the bay!'
    ],
    warmupAns: 'The experimental data indicate a statistically significant increase in marine biodiversity.',
    warmupFeedback: 'Correct! It uses objective vocabulary, precise phrasing, and formal syntax.'
    ,
    writingTitle: 'Academic Transformation Practice',
    writingInstr: 'Rewrite three informal sentences about conservation into formal academic prose.',
    writingStarter: 'Informal: People shouldn’t throw junk in the river -> Academic: Municipal residents ought to refrain from...'
    ,
    analogy: { prompt: 'Conversational Slang : Informal Speech :: Objective Prose : _____', a: 'Conversational Slang', b: 'Informal Speech', c: 'Objective Prose', rel: 'Register Classification', ans: 'Academic Writing', dist: ['Casual Text Message', 'Playground Banter', 'Comic Book Script'], exp: 'Objective prose characterizes academic writing.' },
    missing: { prompt: 'Complete: Academic papers avoid conversational contractions like "won’t" in favor of "_____".', sentence: 'Academic papers avoid conversational contractions like "won’t" in favor of "_____".', ans: 'will not', dist: ['wont', 'cannot', 'is not'], exp: 'Formal style expands contractions.' },
    picture: { prompt: 'Which document represents formal academic research?', l1: 'Peer-Reviewed Research Journal', c1: 'Formal academic publication', l2: 'Graffiti Wall Note', c2: 'Informal message', ans: 'p1', exp: 'Peer-reviewed journals observe academic conventions.' },
    crossword: { prompt: 'Solve crossword: 6-letter term for serious, non-casual style (F _ _ _ _ L):', word: 'FORMAL', clue: 'Official, serious writing style', dist: ['CASUAL', 'DIRECT', 'NATIVE'], exp: 'FORMAL writing avoids slang.' },
    type: { prompt: 'Type the 8-letter word: Scholarly prose: A C A D E M I C:', word: 'academic', hint: 'Starts with A C A D E M I C', exp: 'Academic writing follows disciplined standards.' }
  },
  {
    grade: 7, quarter: 4, qIdx: 2, overallNum: 24,
    title: 'Interpersonal Communication: Dialogues, Conversations, and Interviews',
    topic: 'speaking', melcCode: 'EN7OL-IV-b-1.26',
    melcText: 'Employ a range of verbal and non-verbal strategies in conversations, dialogues, and interviews',
    overview: 'Interpersonal communication spans casual conversations, structured dialogues, and formal interviews. Success relies on active listening, polite turn-taking, open-ended question prompts, clarifying feedback, and culturally appropriate non-verbal politeness.',
    rules: [
      'Turn-Taking: Allow conversational partners to complete their thoughts without rude interruption.',
      'Active Attending: Nod, maintain comfortable eye contact, and use vocal affirmations (e.g., "I see", "Indeed").',
      'Clarification Prompts: Ask polite follow-up questions when instructions are unclear ("Could you please clarify...?").',
      'Interview Rapport: Begin with professional greetings, state the interview objective, and thank the subject.',
      'Cultural Politeness: Observe Filipino courtesy markers (po, opo, respectful address terms) appropriate to social status.'
    ],
    example1: { title: 'Interview Dialogue', text: 'Student: "Good morning, Barangay Captain. Thank you for your time. Could you describe how your council protects the San Victor clam reserve?"', analysis: 'Begins with respectful greeting and asks a focused open-ended question.' },
    example2: { title: 'Polite Clarification', text: 'Learner: "Pardon me, Mr. Solis; to confirm, is the English research portfolio due this Friday or next Monday?"', analysis: 'Clarifies deadlines professionally without confusion.' },
    cultural: 'Interviews with Mandaya elders and coastal village leaders in Baganga require respectful interpersonal protocols.',
    warmupQ: 'What is the most effective approach when you do not understand an interviewee’s response?',
    warmupOpts: [
      'Politely ask for clarification: "Could you elaborate on what you meant by that?"',
      'Pretend you understood and write down made-up notes',
      'Interrupt the interviewee loudly and change the subject',
      'Laugh dismissively and walk away'
    ],
    warmupAns: 'Politely ask for clarification: "Could you elaborate on what you meant by that?"',
    warmupFeedback: 'Correct! Courteous clarification ensures accuracy in interviews.'
    ,
    writingTitle: 'Interview Script Drafting',
    writingInstr: 'Write a 4-turn interview dialogue between a student reporter and an eco-tourism guide at San Victor Island.',
    writingStarter: 'REPORTER: Good afternoon, sir. Welcome to our campus broadcast. GUIDE: Good afternoon...'
    ,
    analogy: { prompt: 'One-Way Speech : Monologue :: Two-Way Exchange : _____', a: 'One-Way Speech', b: 'Monologue', c: 'Two-Way Exchange', rel: 'Communication Structure', ans: 'Dialogue', dist: ['Soliloquy', 'Silent Reading', 'Echo'], exp: 'A two-way exchange is a dialogue.' },
    missing: { prompt: 'Complete: Waiting for your conversational partner to finish before responding shows proper turn-_____.', sentence: 'Waiting for your conversational partner to finish before responding shows proper turn-_____.', ans: 'taking', dist: ['making', 'breaking', 'running'], exp: 'Turn-taking ensures courteous dialogue.' },
    picture: { prompt: 'Which scene demonstrates collaborative interpersonal communication?', l1: 'Two individuals listening and taking turns speaking', c1: 'Balanced interpersonal dialogue', l2: 'One person shouting over another', c2: 'Hostile conversational breakdown', ans: 'p1', exp: 'Taking turns and active listening foster interpersonal dialogue.' },
    crossword: { prompt: 'Solve crossword: 8-letter term for formal question-and-answer exchange:', word: 'INTERVIEW', clue: 'Formal question-and-answer session', dist: ['BROADCAST', 'MONOLOGUE', 'SOLILOQUY'], exp: 'An INTERVIEW gathers first-hand information.' },
    type: { prompt: 'Type the 8-letter word: Two-way conversation: D I A L O G U E:', word: 'dialogue', hint: 'Starts with D I A L O G U E', exp: 'A dialogue involves mutual exchange.' }
  },
  {
    grade: 7, quarter: 4, qIdx: 3, overallNum: 25,
    title: 'Determining the Worth of Ideas in Listened Texts',
    topic: 'listening', melcCode: 'EN7LC-IV-c-2.7',
    melcText: 'Determine the worth of ideas mentioned in the text listened to',
    overview: 'Critical listeners do not passively absorb spoken claims; they weigh the worth, ethical value, logical soundess, and applicability of ideas. Evaluating a spoken text involves assessing whether recommendations are practical, just, and supported by facts.',
    rules: [
      'Assess Practicality: Determine whether the speaker’s proposed plan is realistic and feasible.',
      'Check Logical Soundness: Identify whether premises lead naturally to the speaker’s conclusions.',
      'Detect Fallacies: Watch for emotional manipulation, hasty generalizations, and bandwagons.',
      'Evaluate Ethical Impact: Consider how proposed actions affect vulnerable community members.',
      'Weigh Personal Applicability: Reflect on how the spoken message can be adopted into daily student habits.'
    ],
    example1: { title: 'Evaluating a Policy Proposal', text: 'Speaker: "To stop plastic pollution, all grocery stores should immediately close." -> Listener Evaluation: Impractical and harmful to basic food supply; better to regulate packaging rather than shut down stores.', analysis: 'Critical evaluation discovers flaws in an extreme recommendation.' },
    example2: { title: 'Sound Community Proposal', text: 'Speaker: "Community mangrove planting along Baganga coastlines creates natural barriers against typhoon storm surges."', analysis: 'Listener values the proposal as ecologically proven, low-cost, and life-saving.' },
    cultural: 'Public hearings in Baganga, Davao Oriental assess municipal plans for giant clam reef rehabilitation.',
    warmupQ: 'When evaluating a speaker’s proposed solution to community flooding, what is the primary question to ask?',
    warmupOpts: [
      'Is the solution scientifically feasible, fair, and supported by evidence?',
      'Does the speaker wear expensive shoes?',
      'Is the speech longer than two hours?',
      'Did the speaker use big words I do not know?'
    ],
    warmupAns: 'Is the solution scientifically feasible, fair, and supported by evidence?',
    warmupFeedback: 'Correct! Practicality, fairness, and evidentiary support determine the worth of ideas.'
    ,
    writingTitle: 'Spoken Idea Evaluation Critique',
    writingInstr: 'Summarize a proposal you heard regarding school cleanliness and evaluate whether the ideas are practical and fair.',
    writingStarter: 'In our class meeting, a proposal was made to enforce daily campus cleanup patrols...'
    ,
    analogy: { prompt: 'Unsubstantiated Boast : Low Value :: Feasible Evidence-Based Plan : _____', a: 'Unsubstantiated Boast', b: 'Low Value', c: 'Feasible Plan', rel: 'Idea Worth', ans: 'High Value', dist: ['Negative Void', 'False Rumor', 'Broken Promise'], exp: 'Feasible, evidence-based plans have high value.' },
    missing: { prompt: 'Complete: Critical listeners evaluate whether a speaker’s arguments are logically _____.', sentence: 'Critical listeners evaluate whether a speaker’s arguments are logically _____.', ans: 'sound', dist: ['loud', 'silent', 'fast'], exp: 'Sound arguments are logically valid.' },
    picture: { prompt: 'Which tool symbolizes weighing the worth and fairness of competing ideas?', l1: 'Scales of Justice', c1: 'Weighing worth and balance', l2: 'Megaphone', c2: 'Loud volume projection', ans: 'p1', exp: 'The scales of justice symbolize weighing ideas critically.' },
    crossword: { prompt: 'Solve crossword: 5-letter word for value, merit, or importance (W _ _ _ H):', word: 'WORTH', clue: 'Value or merit of ideas', dist: ['PRICE', 'SPEED', 'MONEY'], exp: 'WORTH measures intellectual value.' },
    type: { prompt: 'Type the 5-letter word: Value and merit of ideas: W O R T H:', word: 'worth', hint: 'Starts with W O R T H', exp: 'Worth reflects the value of ideas.' }
  },
  {
    grade: 7, quarter: 4, qIdx: 4, overallNum: 26,
    title: 'Literary Conflicts in Selections and Non-Violent Resolutions',
    topic: 'literature', melcCode: 'EN7LT-IV-d-2.2',
    melcText: 'Discover the conflicts presented in literary selections and the need to resolve these conflicts in non-violent ways',
    overview: 'Conflict is the engine of narrative literature. Understanding four classic conflict types—Man vs. Man, Man vs. Nature, Man vs. Society, and Man vs. Self—enables readers to appreciate how mature protagonists achieve non-violent, ethical resolutions through dialogue, empathy, and courage.',
    rules: [
      'Man vs. Man: External dispute between two or more characters over goals, values, or territory.',
      'Man vs. Nature: Struggle against natural disasters, fierce wildlife, rough seas, or harsh climates.',
      'Man vs. Society: Struggle against unjust laws, oppressive traditions, or systemic prejudice.',
      'Man vs. Self: Internal psychological dilemma over ethical choices, duty, fear, or guilt.',
      'Non-Violent Resolution: Resolving tension through negotiation, reconciliation, empathy, and forgiveness.'
    ],
    example1: { title: 'Man vs. Self Dilemma', text: 'A young fisherman hesitates whether to report illegal dynamite fishing practiced by his neighbor, torn between loyalty and ocean preservation.', analysis: 'Internal ethical dilemma (Man vs. Self).' },
    example2: { title: 'Man vs. Society Resolution', text: 'A young indigenous weaver advocates for tribal intellectual property protection through community dialogue rather than violence.', analysis: 'Man vs. Society resolved through civic advocacy.' },
    cultural: 'Mandaya oral narratives and Baganga coastal folklore feature heroes resolving tribal disputes through council mediation and peace pacts.',
    warmupQ: 'What type of conflict is shown when a character struggles internally between telling the truth and protecting a friend?',
    warmupOpts: ['Man vs. Self', 'Man vs. Nature', 'Man vs. Machine', 'Man vs. Supernatural'],
    warmupAns: 'Man vs. Self',
    warmupFeedback: 'Correct! Internal moral struggle is Man vs. Self.'
    ,
    writingTitle: 'Non-Violent Conflict Resolution Narrative',
    writingInstr: 'Describe a fictional conflict between two students and outline how they resolve it through mediation and non-violent dialogue.',
    writingStarter: 'Marco and Joshua both claimed credit for the school environmental poster; however, instead of arguing...'
    ,
    analogy: { prompt: 'Stormy Sea : Man vs Nature :: Inner Guilt : _____', a: 'Stormy Sea', b: 'Man vs Nature', c: 'Inner Guilt', rel: 'Conflict Classification', ans: 'Man vs Self', dist: ['Man vs Society', 'Man vs Machine', 'Man vs Alien'], exp: 'Inner guilt is an internal Man vs. Self conflict.' },
    missing: { prompt: 'Complete: Resolving disputes through respectful negotiation rather than force is a _____-violent resolution.', sentence: 'Resolving disputes through respectful negotiation rather than force is a _____-violent resolution.', ans: 'non', dist: ['ultra', 'super', 'anti'], exp: 'Non-violent resolution uses dialogue.' },
    picture: { prompt: 'Which scene exemplifies peaceful conflict resolution?', l1: 'Two individuals shaking hands across a table', c1: 'Mediation and reconciliation', l2: 'Two individuals shouting in anger', c2: 'Escalating violence', ans: 'p1', exp: 'A handshake symbolizes peaceful resolution.' },
    crossword: { prompt: 'Solve crossword: 5-letter word for peaceful state without strife (P _ _ _ E):', word: 'PEACE', clue: 'State of harmony and reconciliation', dist: ['FIGHT', 'ANGER', 'STRIFE'], exp: 'PEACE represents non-violent harmony.' },
    type: { prompt: 'Type the 8-letter word: Core story struggle: C O N F L I C T:', word: 'conflict', hint: 'Starts with C O N F L I C T', exp: 'Conflict drives story plots.' }
  },
  {
    grade: 7, quarter: 4, qIdx: 5, overallNum: 27,
    title: 'Determining the Truthfulness and Accuracy of Materials Viewed',
    topic: 'viewing', melcCode: 'EN7VC-IV-e-11',
    melcText: 'Determine the truthfulness and accuracy of the material viewed',
    overview: 'In an era of deepfakes, altered images, and clickbait videos, viewers must critically inspect visual media. Verifying truthfulness involves examining camera angles, lighting anomalies, audio-video synchronization, source provenance, and corroborating claims with trusted fact-checkers.',
    rules: [
      'Visual Inspection: Look for unnatural pixelation, awkward facial shadows, or mismatched audio dubbing.',
      'Reverse Image Search: Track the original upload date and context of viral photographs.',
      'Check Provenance: Determine who recorded and published the video and whether they possess a verifiable identity.',
      'Contextual Accuracy: Confirm whether authentic video footage has been misleadingly captioned to misrepresent events.',
      'Cross-Reference: Validate sensational visual claims against official news reports and science organizations.'
    ],
    example1: { title: 'Miscaptioned Video', text: 'A viral video of storm surges from 2012 falsely claimed to depict Baganga coastlines yesterday.', analysis: 'Reverse image searching reveals old recycled footage used out of context.' },
    example2: { title: 'Authentic Documented Footage', text: 'Municipal footage of giant clam seeding in San Victor Island with verified ranger timestamps and provincial tags.', analysis: 'Demonstrates verifiable provenance and truthfulness.' },
    cultural: 'Environmental rangers on San Victor Island document giant clam (Taklobo) health using date-stamped underwater photography.',
    warmupQ: 'What is a common indicator that a viral video may be misleading or untruthful?',
    warmupOpts: [
      'It has no verifiable date, author attribution, or original source context',
      'It is recorded in high definition',
      'It shows real people speaking',
      'It is under three minutes long'
    ],
    warmupAns: 'It has no verifiable date, author attribution, or original source context',
    warmupFeedback: 'Correct! Lack of source provenance is a major red flag for misinformation.'
    ,
    writingTitle: 'Visual Fact-Checking Report',
    writingInstr: 'Explain the steps you would take to verify a sensational video clip claiming a monster crocodile was sighted in Pujada Bay.',
    writingStarter: 'To confirm the truthfulness of the crocodile sighting video, my first step would be...'
    ,
    analogy: { prompt: 'Fabricated Deepfake : Falsehood :: Verified Footage : _____', a: 'Fabricated Deepfake', b: 'Falsehood', c: 'Verified Footage', rel: 'Media Authenticity', ans: 'Truthfulness', dist: ['Deception', 'Rumor', 'Optical Illusion'], exp: 'Verified footage establishes truthfulness.' },
    missing: { prompt: 'Complete: To confirm whether a viral image is recycled from years ago, perform a reverse _____ search.', sentence: 'To confirm whether a viral image is recycled from years ago, perform a reverse _____ search.', ans: 'image', dist: ['sound', 'voice', 'movie'], exp: 'Reverse image search tracks image history.' },
    picture: { prompt: 'Which symbol represents verified accuracy in media fact-checking?', l1: 'Green Checkmark on Document', c1: 'Verified accuracy seal', l2: 'Questionable Warning Icon', c2: 'Unverified warning', ans: 'p1', exp: 'A verified checkmark indicates confirmed accuracy.' },
    crossword: { prompt: 'Solve crossword: 5-letter word for factual correctness and reality (T _ _ _ H):', word: 'TRUTH', clue: 'Conformity with fact or reality', dist: ['MYTHS', 'LIES', 'TALES'], exp: 'TRUTH represents factual accuracy.' },
    type: { prompt: 'Type the 8-letter word: Exactness and correctness: A C C U R A C Y:', word: 'accuracy', hint: 'Starts with A C C U R A C Y', exp: 'Accuracy reflects factual precision.' }
  },
  {
    grade: 7, quarter: 4, qIdx: 6, overallNum: 28,
    title: 'Literature as a Tool to Assert Unique Identity and Empathy',
    topic: 'literature', melcCode: 'EN7LT-IV-f-2.2.3',
    melcText: 'Discover literature as a tool to assert one\'s unique identity and to better understand other people',
    overview: 'Literature serves as both a mirror (affirming our own cultural identity, memories, and roots) and a window (giving insight into the lived experiences of diverse ethnic groups, generations, and communities). Through literary empathy, stereotypes dissolve.',
    rules: [
      'Literature as a Mirror: Reflects personal cultural identity, native dialects, and community traditions.',
      'Literature as a Window: Provides glimpses into the joys, hardships, and perspectives of other cultures.',
      'Empathy Building: Immersing in characters from different backgrounds fosters compassion and tolerance.',
      'Challenging Stereotypes: Nuanced literary characterization dismantles simplistic cultural caricatures.',
      'Voice Assertion: Writing our own stories asserts our cultural contribution to Philippine nationhood.'
    ],
    example1: { title: 'Cultural Mirror', text: 'A student from Davao Oriental reads a poem celebrating Mandaya weaving patterns and feels deep ancestral pride.', analysis: 'Acts as a mirror reinforcing indigenous cultural identity.' },
    example2: { title: 'Cultural Window', text: 'Reading a short story about an urban street child in Manila allows a rural coastal learner to understand urban poverty.', analysis: 'Acts as a window building empathy for different socio-economic realities.' },
    cultural: 'Mandaya oral poetry and woven Dagmay tapestries in Davao Oriental preserve ancestral identity across generations.',
    warmupQ: 'What does it mean when literature acts as a "mirror"?',
    warmupOpts: [
      'It reflects your own cultural identity, traditions, and lived experiences',
      'It physically shines light back into your eyes',
      'It only shows characters from other planets',
      'It can only be read in front of glass'
    ],
    warmupAns: 'It reflects your own cultural identity, traditions, and lived experiences',
    warmupFeedback: 'Correct! A literary mirror reflects our own roots and cultural identity.'
    ,
    writingTitle: 'Mirror and Window Reflection',
    writingInstr: 'Describe a story or poem you read that acted as a mirror (reflecting your life) or a window (teaching you about others).',
    writingStarter: 'Reading the narrative of an indigenous Mandaya family served as a mirror for me because...'
    ,
    analogy: { prompt: 'Own Identity : Literary Mirror :: Other Lives : _____', a: 'Own Identity', b: 'Literary Mirror', c: 'Other Lives', rel: 'Literary Function', ans: 'Literary Window', dist: ['Dark Wall', 'Blind Fold', 'Locked Door'], exp: 'Other lives are viewed through a literary window.' },
    missing: { prompt: 'Complete: Stepping into the emotional shoes of literary characters fosters deep _____.', sentence: 'Stepping into the emotional shoes of literary characters fosters deep _____.', ans: 'empathy', dist: ['hostility', 'jealousy', 'amnesia'], exp: 'Literature fosters empathy.' },
    picture: { prompt: 'Which visual represents understanding diverse human cultures?', l1: 'Diverse individuals holding hands around globe', c1: 'Empathy and mutual respect', l2: 'Isolated individual in dark box', c2: 'Cultural isolation', ans: 'p1', exp: 'Unity in diversity symbolizes literary empathy.' },
    crossword: { prompt: 'Solve crossword: 7-letter capacity to share another person’s feelings (E _ _ _ _ _ Y):', word: 'EMPATHY', clue: 'Understanding another’s feelings', dist: ['SYMPATHY', 'CRITIQUE', 'APATHY'], exp: 'EMPATHY is emotional understanding.' },
    type: { prompt: 'Type the 8-letter word: Unique self and cultural I D E N T I T Y:', word: 'identity', hint: 'Starts with I D E N T I T Y', exp: 'Identity reflects personal and cultural self.' }
  },
  {
    grade: 7, quarter: 4, qIdx: 7, overallNum: 29,
    title: 'Philippine Literature in the Global Village & Cultural Cooperation',
    topic: 'literature', melcCode: 'EN7LT-IV-g-2.3',
    melcText: 'Discover through Philippine literature the need to work cooperatively and responsibly in today’s global village',
    overview: 'In an interconnected world, Philippine literature highlights the traditional concept of "Bayanihan" (communal unity and mutual assistance) as a vital model for solving global crises like climate change, poverty, and environmental degradation.',
    rules: [
      'Bayanihan Tradition: Communal cooperation where community members unite voluntarily for common good.',
      'Global Village Concept: The world is interconnected through technology, trade, and shared climate destiny.',
      'Environmental Stewardship: Regional Philippine literature emphasizes that natural resources are shared trusts.',
      'Cross-Border Responsibility: Local actions (marine conservation in Davao Oriental) contribute to global planetary health.',
      'Cultural Diplomacy: Sharing Philippine literary values builds international respect and cooperation.'
    ],
    example1: { title: 'Bayanihan in Literature', text: 'Classic short story depicting neighbors carrying a house together across coastal shores to escape high tide.', analysis: 'Symbolizes cooperative community resilience.' },
    example2: { title: 'Global Ecological Cooperation', text: 'Stories of international scientists collaborating with local Baganga fishers to preserve giant clams.', analysis: 'Demonstrates global village partnership grounded in shared scientific stewardship.' },
    cultural: 'Community coastal cleanups and mangrove tree plantings in Baganga embody the living spirit of Bayanihan.',
    warmupQ: 'What traditional Filipino cultural value best exemplifies cooperation in the global village?',
    warmupOpts: ['Bayanihan (communal cooperation)', 'Ningas-kugon (quitting early)', 'Crab mentality (pulling others down)', 'Bahala na (careless fatalism)'],
    warmupAns: 'Bayanihan (communal cooperation)',
    warmupFeedback: 'Correct! Bayanihan embodies communal unity and shared responsibility.'
    ,
    writingTitle: 'Bayanihan in the Global Village Essay',
    writingInstr: 'Explain how the Filipino value of Bayanihan can help solve a global environmental problem like ocean plastics.',
    writingStarter: 'The ancient Filipino practice of Bayanihan demonstrates that when an entire community unites...'
    ,
    analogy: { prompt: 'Local Community : Barangay :: Interconnected World : _____', a: 'Local Community', b: 'Barangay', c: 'Interconnected World', rel: 'Social Scale', ans: 'Global Village', dist: ['Isolated Island', 'Outer Space', 'Private Room'], exp: 'An interconnected world forms a global village.' },
    missing: { prompt: 'Complete: The traditional Filipino value of communal mutual help is called _____.', sentence: 'The traditional Filipino value of communal mutual help is called _____.', ans: 'bayanihan', dist: ['harana', 'kundiman', 'fiesta'], exp: 'Bayanihan is communal cooperation.' },
    picture: { prompt: 'Which image symbolizes the Filipino tradition of Bayanihan?', l1: 'Neighbors cooperatively lifting a house together', c1: 'Bayanihan communal spirit', l2: 'Solo person working in isolation', c2: 'Individual effort', ans: 'p1', exp: 'Lifting a house together is the iconic symbol of Bayanihan.' },
    crossword: { prompt: 'Solve crossword: 6-letter term for world or planetary scale (G _ _ _ _ L):', word: 'GLOBAL', clue: 'Worldwide or planetary in scope', dist: ['TRIBAL', 'NATIVE', 'LOCAL'], exp: 'GLOBAL spans the entire planet.' },
    type: { prompt: 'Type the 9-letter Filipino value: B A Y A N I H A N communal unity:', word: 'bayanihan', hint: 'Starts with B A Y A N I H A N', exp: 'Bayanihan represents communal cooperation.' }
  },
  {
    grade: 7, quarter: 4, qIdx: 8, overallNum: 30,
    title: 'Composing an Informative Essay on Social and Environmental Responsibility',
    topic: 'writing', melcCode: 'EN7WC-IV-h-2.8.6',
    melcText: 'Compose an informative essay on social and environmental responsibility',
    overview: 'An informative essay educates readers on a specific socio-environmental topic using factual exposition. It features an engaging introduction with a clear thesis statement, body paragraphs backed by verifiable evidence and transitional cohesive devices, and a conclusion reinforcing practical stewardship.',
    rules: [
      'Clear Thesis Statement: State the central informative purpose directly at the end of the introductory paragraph.',
      'Objective Exposition: Provide facts, statistics, and verifiable examples rather than unsupported emotional appeals.',
      'Paragraph Organization: Each body paragraph begins with a distinct topic sentence and provides elaboration.',
      'Transitional Cohesion: Connect paragraphs using markers like "Furthermore,", "In addition,", "Consequently,".',
      'Impactful Conclusion: Synthesize key takeaways and reinforce community and environmental responsibility.'
    ],
    example1: { title: 'Thesis Formulation', text: '"Preserving the marine sanctuaries of Davao Oriental requires municipal waste regulation, community mangrove reforestation, and sustainable eco-tourism practices."', analysis: 'A comprehensive, 3-point informative thesis statement.' },
    example2: { title: 'Cohesive Elaboration', text: '"Furthermore, community reforestation along riverbanks prevents agricultural runoff from choking delicate coral reefs in Pujada Bay."', analysis: 'Demonstrates transition signal and cause-and-effect factual elaboration.' },
    cultural: 'Students across Davao Oriental draft informative essays advocating for Mount Hamiguitan conservation and marine protection in Pujada Bay.',
    warmupQ: 'What is the primary function of a thesis statement in an informative essay?',
    warmupOpts: [
      'To state the central topic and main supporting points of the entire essay',
      'To list the author’s favorite songs',
      'To tell a funny joke to open the essay',
      'To apologize for writing an essay'
    ],
    warmupAns: 'To state the central topic and main supporting points of the entire essay',
    warmupFeedback: 'Correct! A thesis statement outlines the central topic and supporting points.'
    ,
    writingTitle: 'Informative Essay Outline',
    writingInstr: 'Draft a 3-point outline for an informative essay about protecting coastal waters in Davao Oriental.',
    writingStarter: 'Thesis: Protecting coastal waters in Davao Oriental is crucial for marine biodiversity, local livelihoods, and eco-tourism...'
    ,
    analogy: { prompt: 'Architectural Blueprint : Building :: Thesis Statement : _____', a: 'Architectural Blueprint', b: 'Building', c: 'Thesis Statement', rel: 'Structural Foundation', ans: 'Informative Essay', dist: ['Casual Tweet', 'Unwritten Thought', 'Silent Gesture'], exp: 'A thesis statement anchors an informative essay.' },
    missing: { prompt: 'Complete: Each body paragraph in an informative essay should open with a clear _____ sentence.', sentence: 'Each body paragraph in an informative essay should open with a clear _____ sentence.', ans: 'topic', dist: ['rhyming', 'joke', 'false'], exp: 'A topic sentence states paragraph focus.' },
    picture: { prompt: 'Which document represents a well-structured multi-paragraph essay?', l1: 'Structured 5-Paragraph Essay with Introduction, Body, and Conclusion', c1: 'Organized informative essay', l2: 'Single Random Sentence', c2: 'Unstructured fragment', ans: 'p1', exp: 'An essay requires introduction, structured body, and conclusion.' },
    crossword: { prompt: 'Solve crossword: 5-letter core claim of an essay (T _ _ _ _ S):', word: 'THESIS', clue: 'Central proposition of an essay', dist: ['TITLE', 'THEME', 'TOPIC'], exp: 'A THESIS anchors an essay.' },
    type: { prompt: 'Type the 5-letter word: Written composition: E S S A Y:', word: 'essay', hint: 'Starts with E S S A Y', exp: 'An essay organizes informative exposition.' }
  }
];

const fileContent = `import { Module } from '../../types/lingoquest';

export const GRADE_7_Q2_TO_Q4_MODULES: Module[] = [
${G7_QUARTERS_2_TO_4.map(formatModule).join(',\n')}
];
`;

fs.writeFileSync('./src/data/curriculum/grade7Quarters2To4.ts', fileContent, 'utf-8');
console.log('Successfully wrote grade7Quarters2To4.ts with 20 modules! Total Grade 7 = 30 modules.');
