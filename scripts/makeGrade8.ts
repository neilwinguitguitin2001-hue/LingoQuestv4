import * as fs from 'fs';
import { RawModDef, formatModule } from './buildCurriculumData';

const G8_MODULES: RawModDef[] = [
  // --- QUARTER 1: PUJADA ISLAND (5 Modules: M1 to M5) ---
  {
    grade: 8, quarter: 1, qIdx: 1, overallNum: 1,
    title: 'Determining Meaning of Words and Expressions Using Context Clues',
    topic: 'vocabulary', melcCode: 'EN8V-Ia-10.2',
    melcText: 'Determine the meaning of words and expressions through context clues and collocations',
    overview: 'Context clues are linguistic hints embedded within sentences that allow readers to decipher unfamiliar words without interrupting reading flow. Five major types include definition, restatement/synonym, contrast/antonym, example/illustration, and cause-and-effect.',
    rules: [
      'Definition Clues: The unfamiliar word is explicitly defined using "is", "means", "refers to".',
      'Synonym / Restatement Clues: Words with similar meaning appear nearby, often framed by commas or dashes.',
      'Antonym / Contrast Clues: Signal words ("unlike", "however", "whereas") contrast opposite meanings.',
      'Example Clues: Concrete examples introduced by "such as", "for instance", "including" clarify the term.',
      'Collocations: Words naturally co-occurring in habitual partnerships ("make an effort", "commit a crime").'
    ],
    example1: { title: 'Contrast Context Clue', text: 'Unlike his gregarious brother who loved crowded festivals in Mati, Carlo was reticent and preferred solitude.', analysis: '"Unlike his gregarious brother" contrasts outgoing behavior with reticent (quiet/reserved).' },
    example2: { title: 'Definition Context Clue', text: 'Mount Hamiguitan is renowned for its pygmy forest—an ecosystem characterized by miniaturized century-old trees.', analysis: 'The phrase following the dash directly defines pygmy forest.' },
    cultural: 'Folk narratives from Davao Oriental describe coastal fishermen reading subtle sea currents as environmental context clues.',
    warmupQ: 'What type of context clue is in: "The sea was tranquil, unlike the turbulent Pacific storm yesterday"?',
    warmupOpts: ['Contrast / Antonym clue', 'Definition clue', 'Collocation clue', 'Etymology clue'],
    warmupAns: 'Contrast / Antonym clue',
    warmupFeedback: 'Correct! "Unlike" signals an opposite contrast between tranquil and turbulent.'
    ,
    writingTitle: 'Context Clue Sentence Crafting',
    writingInstr: 'Compose two sentences using an advanced vocabulary word: one with an antonym clue and one with an example clue.',
    writingStarter: 'Although the coastal winds were turbulent during the typhoon, the harbor remained tranquil...'
    ,
    analogy: { prompt: 'Tranquil : Peaceful :: Turbulent : _____', a: 'Tranquil', b: 'Peaceful', c: 'Turbulent', rel: 'Synonym Relationship', ans: 'Stormy / Violent', dist: ['Gentle', 'Silent', 'Pristine'], exp: 'Turbulent means stormy or violent.' },
    missing: { prompt: 'Complete: Words that signal an antonym context clue include "however", "although", and "_____".', sentence: 'Words that signal an antonym context clue include "however", "although", and "_____".', ans: 'unlike', dist: ['because', 'therefore', 'furthermore'], exp: '"Unlike" signals a contrast.' },
    picture: { prompt: 'Which image illustrates peaceful and tranquil waters?', l1: 'Calm glassy sea at sunrise', c1: 'Tranquil coastal surface', l2: 'Crashing stormy waves on rocks', c2: 'Turbulent storm swells', ans: 'p1', exp: 'Calm glassy waters depict tranquility.' },
    crossword: { prompt: 'Solve crossword: 4-letter word for hints surrounding unfamiliar terms (C _ _ E):', word: 'CLUE', clue: 'Hint or sign indicating meaning', dist: ['FACT', 'DATA', 'WORD'], exp: 'A CLUE hints at meaning.' },
    type: { prompt: 'Type the 7-letter word: Words surrounding a term form C O N T E X T:', word: 'context', hint: 'Starts with C O N T E X T', exp: 'Context provides surrounding meaning.' }
  },
  {
    grade: 8, quarter: 1, qIdx: 2, overallNum: 2,
    title: 'Conventions in Citing Sources and Compiling a Bibliography',
    topic: 'research', melcCode: 'EN8SS-Ia-5.1',
    melcText: 'Use conventions in citing sources and compiling a working bibliography (APA Style)',
    overview: 'Ethical scholarship requires acknowledging source provenance. Using standard citation formats (such as APA 7th Edition) avoids plagiarism and allows readers to verify data through in-text parenthetical citations and alphabetized reference lists.',
    rules: [
      'In-Text Citation: Author’s surname and publication year enclosed in parentheses: (Santos, 2024).',
      'Direct Quotation: Include specific page number along with author and year: (Santos, 2024, p. 45).',
      'Alphabetical Ordering: Bibliography entries are arranged alphabetically by lead author’s last name.',
      'Hanging Indent: Second and subsequent lines of an APA bibliographic reference are indented 0.5 inches.',
      'Core Reference Components: Author, Date, Title (italicized for books/periodicals), Source / Publisher / DOI.'
    ],
    example1: { title: 'Book Citation in APA', text: 'Mendoza, C. M. (2023). Marine Biodiversity of Pujada Bay. Davao Academic Press.', analysis: 'Author surname, initials, year, italicized book title, and publisher.' },
    example2: { title: 'In-Text Narrative Citation', text: 'According to Solis (2024), sea turtle hatchling survival on Dahican Beach rose by 18%.', analysis: 'Author integrated into sentence narrative with publication year in parentheses.' },
    cultural: 'Scientific surveys conducted by Davao Oriental State University document marine life in Pujada Bay using rigorous APA documentation.',
    warmupQ: 'What is the correct APA in-text citation format for a paraphrased idea from author Maria Santos published in 2025?',
    warmupOpts: ['(Santos, 2025)', 'Santos (2025, page 10)', '(Maria Santos: 2025)', 'Santos, M. 2025.'],
    warmupAns: '(Santos, 2025)',
    warmupFeedback: 'Correct! (Author, Year) is standard APA in-text parenthetical format.'
    ,
    writingTitle: 'Bibliography Entry Drafting',
    writingInstr: 'Create a full APA reference entry for an imaginary book about the wildlife of Mount Hamiguitan.',
    writingStarter: 'Aquino, R. L. (2024). Flora and Fauna of Mount Hamiguitan...'
    ,
    analogy: { prompt: 'Author : Creator :: Bibliography : _____', a: 'Author', b: 'Creator', c: 'Bibliography', rel: 'Function Partnership', ans: 'List of Sources', dist: ['Fictional Novel', 'Index of Songs', 'Stage Dialogue'], exp: 'A bibliography lists cited sources.' },
    missing: { prompt: 'Complete: Unacknowledged copying of another author’s words or ideas constitutes _____.', sentence: 'Unacknowledged copying of another author’s words or ideas constitutes _____.', ans: 'plagiarism', dist: ['paraphrasing', 'summarizing', 'synthesizing'], exp: 'Plagiarism is intellectual theft.' },
    picture: { prompt: 'Which visual represents proper academic source attribution?', l1: 'Book with author name and citation footnote', c1: 'Proper source attribution', l2: 'Copy-pasted text without credit', c2: 'Unattributed copying', ans: 'p1', exp: 'Citing sources provides attribution.' },
    crossword: { prompt: 'Solve crossword: 6-letter term for formal acknowledgment of a source (C _ _ _ E):', word: 'CITING', clue: 'Acknowledging a source', dist: ['EDITING', 'READING', 'WRITING'], exp: 'CITING gives credit to authors.' },
    type: { prompt: 'Type the 7-letter word: In-text academic C I T A T I O N:', word: 'citation', hint: 'Starts with C I T A T I O N', exp: 'A citation attributes scholarship.' }
  },
  {
    grade: 8, quarter: 1, qIdx: 3, overallNum: 3,
    title: 'Modal Verbs, Nouns, and Adverbs in Expressing Stances',
    topic: 'grammar', melcCode: 'EN8G-Ia-7',
    melcText: 'Use modal verbs, modal nouns, and modal adverbs appropriately in expressing stance and attitude',
    overview: 'Modals qualify statements with nuances of ability, permission, obligation, possibility, and certainty. They manifest across three word classes: modal verbs (must, can, should), modal nouns (necessity, obligation, probability), and modal adverbs (certainly, definitely, possibly).',
    rules: [
      'Modal Verbs: Auxiliary verbs followed by base form verbs: "Students must protect (not must protects) coral reefs."',
      'Modal Nouns: Nouns expressing degrees of certainty or duty: "necessity", "obligation", "permission", "possibility".',
      'Modal Adverbs: Adverbs modifying sentences with certainty levels: "definitely", "probably", "possibly", "rarely".',
      'High vs Low Modality: "Must" and "certainly" indicate strong certainty; "might" and "possibly" express tentative stance.',
      'Hedging in Argumentation: Modals prevent overgeneralization in academic and diplomatic discourse.'
    ],
    example1: { title: 'Modal Across Word Classes', text: 'Modal Verb: "Visitors must register." | Modal Noun: "It is an obligation." | Modal Adverb: "Trek regulations are strictly enforced."', analysis: 'Demonstrates grammatical shift across verb, noun, and adverb while maintaining high modality.' },
    example2: { title: 'Tentative Scientific Stance', text: '"Rising water temperatures may possibly impact turtle breeding cycles."', analysis: 'Modal verb "may" and adverb "possibly" qualify the hypothesis prudently.' },
    cultural: 'Park signboards at Mount Hamiguitan Natural Heritage Park use modal verbs to mandate wildlife protection rules.',
    warmupQ: 'Which modal verb expresses strong moral obligation?',
    warmupOpts: ['must', 'might', 'could', 'may'],
    warmupAns: 'must',
    warmupFeedback: 'Correct! "Must" denotes strong necessity and mandatory obligation.'
    ,
    writingTitle: 'Modal Regulation Drafting',
    writingInstr: 'Write three park regulations for Pujada Bay: one using a modal verb, one with a modal noun, and one with a modal adverb.',
    writingStarter: '1. Visitors must not throw plastics (verb); 2. There is a necessity to register (noun)...'
    ,
    analogy: { prompt: 'Must : Strong Obligation :: Might : _____', a: 'Must', b: 'Strong Obligation', c: 'Might', rel: 'Modality Degree', ans: 'Tentative Possibility', dist: ['Absolute Law', 'Past Tense Fact', 'Refused Action'], exp: '"Might" expresses tentative possibility.' },
    missing: { prompt: 'Complete: "Definitely" and "possibly" function grammatically as modal _____.', sentence: '"Definitely" and "possibly" function grammatically as modal _____.', ans: 'adverbs', dist: ['verbs', 'nouns', 'pronouns'], exp: 'They are modal adverbs.' },
    picture: { prompt: 'Which sign indicates strict mandatory prohibition?', l1: 'Red circle with diagonal slash over trash', c1: 'Strict prohibition (Must not)', l2: 'Green open pathway', c2: 'Optional suggestion', ans: 'p1', exp: 'Red circle with slash denotes mandatory prohibition.' },
    crossword: { prompt: 'Solve crossword: 5-letter auxiliary expressing advice or recommendation (S _ _ _ _ D):', word: 'SHOULD', clue: 'Modal verb expressing advice', dist: ['MIGHT', 'WOULD', 'COULD'], exp: 'SHOULD expresses advice.' },
    type: { prompt: 'Type the 5-letter word: Modal auxiliary M O D A L:', word: 'modal', hint: 'Starts with M O D A L', exp: 'Modals express modality and stance.' }
  },
  {
    grade: 8, quarter: 1, qIdx: 4, overallNum: 4,
    title: 'Transition Signals and Sentence Connectors for Coherence',
    topic: 'grammar', melcCode: 'EN8G-Ia-8',
    melcText: 'Identify and use transition signals to indicate coherence in paragraphs and speeches',
    overview: 'Transition signals are cohesive bridges that link sentences and paragraphs logically. They signal chronological order, cause-and-effect, addition, comparison/contrast, emphasis, and summary, ensuring reader comprehension.',
    rules: [
      'Chronological / Sequence Signals: first, subsequently, meanwhile, finally, simultaneously.',
      'Comparison and Contrast: similarly, in contrast, however, on the contrary, nevertheless.',
      'Cause and Effect: consequently, as a result, therefore, thus, owing to.',
      'Additive / Elaboration: furthermore, in addition, moreover, additionally.',
      'Punctuation with Transitions: Conjunctive adverbs at sentence starts require a trailing comma: "Consequently, the event..."'
    ],
    example1: { title: 'Cause and Effect Transition', text: '"Heavy monsoons hit the Pacific coast of Davao Oriental; consequently, classes were suspended across Mati City."', analysis: '"Consequently" establishes direct causal relationship between the storm and class suspension.' },
    example2: { title: 'Contrast Transition', text: '"Waniban Island features flat coralline sands; on the other hand, Pujada Island boasts forested ridgelines."', analysis: '"On the other hand" smoothly contrasts physical island topographies.' },
    cultural: 'Historical narratives of Davao Oriental trace the founding of municipalities using chronological transitions.',
    warmupQ: 'Which transition signal shows contrast between two opposing ideas?',
    warmupOpts: ['However', 'Furthermore', 'Consequently', 'Similarly'],
    warmupAns: 'However',
    warmupFeedback: 'Correct! "However" signals contrast between differing ideas.'
    ,
    writingTitle: 'Cohesive Paragraph Construction',
    writingInstr: 'Write a 4-sentence paragraph describing a day in Dahican Beach, using at least three distinct transition signals.',
    writingStarter: 'First, the morning sun rose over the Pacific horizon; meanwhile, skimboarders prepared their boards...'
    ,
    analogy: { prompt: 'Addition : Furthermore :: Contrast : _____', a: 'Addition', b: 'Furthermore', c: 'Contrast', rel: 'Transition Function', ans: 'Nevertheless', dist: ['In conclusion', 'As a result', 'Secondly'], exp: 'Nevertheless signals contrast.' },
    missing: { prompt: 'Complete: Transition signals like "therefore" and "as a result" establish _____ and effect.', sentence: 'Transition signals like "therefore" and "as a result" establish _____ and effect.', ans: 'cause', dist: ['time', 'color', 'noise'], exp: 'They establish cause and effect.' },
    picture: { prompt: 'Which symbol represents a logical bridge connecting two ideas?', l1: 'Two islands connected by an arched bridge', c1: 'Cohesive transition bridge', l2: 'Two disconnected cliffs', c2: 'Fragmented separation', ans: 'p1', exp: 'A bridge represents cohesive transitions.' },
    crossword: { prompt: 'Solve crossword: 4-letter signal word meaning "for that reason" (T _ _ S):', word: 'THUS', clue: 'As a result; consequently', dist: ['ALSO', 'THEN', 'YET'], exp: 'THUS expresses cause and effect.' },
    type: { prompt: 'Type the 9-letter word: Logical connection: C O H E R E N C E:', word: 'coherence', hint: 'Starts with C O H E R E N C E', exp: 'Coherence binds text together.' }
  },
  {
    grade: 8, quarter: 1, qIdx: 5, overallNum: 5,
    title: 'Expressing Emotional Response and Reactions to Persuade',
    topic: 'writing', melcCode: 'EN8WC-Ia-1.1',
    melcText: 'Express emotional response and reactions to an issue to persuade using a range of verbs, adjectives, and adverbs',
    overview: 'Persuasive advocacy blends objective facts with emotive rhetoric. Using evocative verbs (advocate, imperil, champion), evaluative adjectives (alarming, monumental, indispensable), and emphatic adverbs (urgently, passionately) inspires civic action.',
    rules: [
      'Emotional Resonance: Select emotive vocabulary that evokes empathy, civic responsibility, and urgency.',
      'Evaluative Adjectives: Replace bland adjectives with vivid words (alarming vs bad; monumental vs big).',
      'Action-Oriented Verbs: Use dynamic verbs (rehabilitate, safeguard, revitalize) to call readers to action.',
      'Ethical Balance: Avoid demagoguery; ground emotional appeals in verifiable community truths.',
      'Audience Awareness: Adapt persuasive intensity to match community values and respectful discourse.'
    ],
    example1: { title: 'Emotive Environmental Appeal', text: '"We must urgently safeguard our fragile marine sanctuaries before irreversible pollution destroys our children\'s heritage."', analysis: 'Employs "urgently", "safeguard", "fragile", and "irreversible" to persuade.' },
    example2: { title: 'Civic Pride Persuasion', text: '"It is our indispensable civic duty to champion the protection of Mount Hamiguitan\'s ancestral forest."', analysis: 'Uses "indispensable" and "champion" to rally civic pride.' },
    cultural: 'Speeches delivered by youth environmental ambassadors in Davao Oriental rally community stewardship of coastal waters.',
    warmupQ: 'Which sentence uses persuasive emotive vocabulary to inspire action?',
    warmupOpts: [
      'We urgently plead with all citizens to safeguard our endangered marine sanctuary from catastrophic pollution.',
      'Some fish are in the water and plastic is there too.',
      'A report was written about the bay.',
      'Water has chemicals.'
    ],
    warmupAns: 'We urgently plead with all citizens to safeguard our endangered marine sanctuary from catastrophic pollution.',
    warmupFeedback: 'Correct! It uses evocative words like "urgently plead", "safeguard", and "catastrophic".'
    ,
    writingTitle: 'Persuasive Environmental Appeal',
    writingInstr: 'Write a persuasive paragraph calling on tourists to respect Dahican Beach, using at least three evaluative adjectives.',
    writingStarter: 'Dahican Beach is an indispensable ecological sanctuary; therefore, every conscious traveler must passionately defend...'
    ,
    analogy: { prompt: 'Objective Report : Neutral Fact :: Persuasive Essay : _____', a: 'Objective Report', b: 'Neutral Fact', c: 'Persuasive Essay', rel: 'Rhetorical Purpose', ans: 'Emotive Conviction', dist: ['Silent Number', 'Empty Page', 'Passive Stance'], exp: 'Persuasive essays use emotive conviction.' },
    missing: { prompt: 'Complete: Words that evoke feelings and persuade readers are called _____ vocabulary.', sentence: 'Words that evoke feelings and persuade readers are called _____ vocabulary.', ans: 'emotive', dist: ['silent', 'boring', 'unclear'], exp: 'Emotive words inspire feelings.' },
    picture: { prompt: 'Which image conveys passionate community advocacy?', l1: 'Youth holding eco-conservation banners on shore', c1: 'Passionate civic advocacy', l2: 'Empty beach without people', c2: 'Passive scenery', ans: 'p1', exp: 'Youth with banners symbolize advocacy.' },
    crossword: { prompt: 'Solve crossword: 8-letter word meaning to convince or win over (P _ _ _ _ _ _ E):', word: 'PERSUADE', clue: 'To convince someone of a stance', dist: ['DISMISS', 'COMMAND', 'SILENCE'], exp: 'PERSUADE means to convince.' },
    type: { prompt: 'Type the 7-letter word: E M O T I V E vocabulary:', word: 'emotive', hint: 'Starts with E M O T I V E', exp: 'Emotive language stirs feelings.' }
  },

  // --- QUARTER 2: WANIBAN ISLAND (5 Modules: M6 to M10) ---
  {
    grade: 8, quarter: 2, qIdx: 1, overallNum: 6,
    title: 'Visual-Verbal Relationships in Tables, Graphs, and Maps',
    topic: 'viewing', melcCode: 'EN8RC-IIa-2.22',
    melcText: 'Explain visual-verbal relationships illustrated in tables, graphs, and information maps',
    overview: 'Comprehending multimodal texts requires interpreting visual elements (axes, keys, legends, shaded bars) and integrating them with accompanying explanatory prose. Charts highlight trends, proportions, and spatial distributions.',
    rules: [
      'Identify Visual Elements: Inspect titles, x/y axes, legends, labels, and units of measurement.',
      'Determine Trends: Identify upward slopes (growth), downward slopes (decline), and plateaus (stability).',
      'Compare Proportions: In pie charts, note which segment constitutes the majority or minority.',
      'Spatial Relationships: On information maps, note orientation compass points and geographic legends.',
      'Synthesize with Text: Verify whether verbal statements accurately reflect visual empirical data.'
    ],
    example1: { title: 'Line Graph Interpretation', text: 'A line graph shows Pawikan turtle nests on Dahican Beach rising from 50 in 2020 to 180 in 2024.', analysis: 'Visual upward slope illustrates steady conservation success.' },
    example2: { title: 'Information Map Reading', text: 'A map of Pujada Bay displays three marine protected zones marked with green buoy legends.', analysis: 'Legend symbols transcode spatial protection boundaries.' },
    cultural: 'Provincial planning maps in Mati delineate sustainable fishing zones and protected coral sanctuaries in Pujada Bay.',
    warmupQ: 'What does a sharp upward line on a multi-year fish population graph indicate?',
    warmupOpts: ['A significant increase in fish numbers over time', 'A catastrophic decline in fish population', 'No change occurred', 'The chart was drawn upside down'],
    warmupAns: 'A significant increase in fish numbers over time',
    warmupFeedback: 'Correct! Upward slopes in line graphs indicate growth or increase.'
    ,
    writingTitle: 'Graph Interpretation Report',
    writingInstr: 'Describe the trends shown in a hypothetical bar chart comparing tourist visits to Waniban and Pujada islands.',
    writingStarter: 'According to the comparative bar chart, visits to Waniban Island peaked during the summer dry season...'
    ,
    analogy: { prompt: 'Table : Rows and Columns :: Bar Graph : _____', a: 'Table', b: 'Rows and Columns', c: 'Bar Graph', rel: 'Visual Format', ans: 'Horizontal or Vertical Bars', dist: ['Musical Staves', 'Blank Lines', 'Written Paragraphs'], exp: 'Bar graphs use visual bars.' },
    missing: { prompt: 'Complete: In a graphic chart, the visual key that explains symbols and colors is the _____.', sentence: 'In a graphic chart, the visual key that explains symbols and colors is the _____.', ans: 'legend', dist: ['title', 'margin', 'paper'], exp: 'A legend explains symbols.' },
    picture: { prompt: 'Which graphic organizer is best for showing percentages of a total budget?', l1: 'Pie Chart with percentage slices', c1: 'Proportional pie chart', l2: 'Simple Line Rule', c2: 'Linear ruler', ans: 'p1', exp: 'Pie charts display proportional parts of a whole.' },
    crossword: { prompt: 'Solve crossword: 5-letter visual table with axes (G _ _ _ H):', word: 'GRAPH', clue: 'Visual diagram showing data', dist: ['CHART', 'PHOTO', 'SKETCH'], exp: 'A GRAPH displays data trends.' },
    type: { prompt: 'Type the 6-letter word: Visual L E G E N D explaining symbols:', word: 'legend', hint: 'Starts with L E G E N D', exp: 'A legend decodes map and chart symbols.' }
  },
  {
    grade: 8, quarter: 2, qIdx: 2, overallNum: 7,
    title: 'Opinion-Marking Signals to Share Perspectives',
    topic: 'speaking', melcCode: 'EN8RC-IIc-2.13',
    melcText: 'Use opinion-marking signals to share perspectives and ideas in academic discourse',
    overview: 'Scholarly discussions require distinguishing verified facts from personal perspectives. Opinion-marking signals (e.g., "From my perspective,", "It seems to me that,", "I contend that,") clarify that a claim reflects subjective interpretation.',
    rules: [
      'Perspective Markers: Use "From my perspective,", "In my view,", "Personally, I believe,".',
      'Cautious Assertion: Soften claims with "It appears that,", "Evidence seems to suggest that,".',
      'Avoid Dogmatism: Acknowledge that reasonable scholars may hold differing viewpoints.',
      'Support with Reasons: Follow opinion markers with logical justifications: "In my view, ... because ...".',
      'Respectful Exchange: Respond to others’ opinions with polite reframing ("While I appreciate your viewpoint, ...").'
    ],
    example1: { title: 'Opinion Signal Usage', text: '"In my view, prioritizing community-based eco-tourism over massive resort development produces more sustainable revenue for Mati City."', analysis: '"In my view" frames the recommendation as a reasoned perspective.' },
    example2: { title: 'Tentative Scholarly Perspective', text: '"It appears to me that coastal erosion along Dahican could be mitigated by restoring native dune vegetation."', analysis: '"It appears to me" signals an analytical viewpoint open to discussion.' },
    cultural: 'Youth environmental roundtables in Mati City feature students using polite opinion-marking signals during debates.',
    warmupQ: 'Which phrase functions as an opinion-marking signal?',
    warmupOpts: ['From my perspective', 'According to official census data', 'The thermometer reads 30°C', 'In the year 1998'],
    warmupAns: 'From my perspective',
    warmupFeedback: 'Correct! "From my perspective" introduces a subjective viewpoint.'
    ,
    writingTitle: 'Perspectives on Coastal Development',
    writingInstr: 'Write three sentences about tourist regulations in Waniban Island using different opinion-marking signals.',
    writingStarter: 'From my perspective, tourist capacity on Waniban Island should be strictly capped...'
    ,
    analogy: { prompt: 'Factual Marker : According to official records :: Opinion Marker : _____', a: 'Factual Marker', b: 'According to official records', c: 'Opinion Marker', rel: 'Discourse Marker', ans: 'In my judgment', dist: ['Water freezes at 0°C', 'Calculated by math', 'Historical treaty date'], exp: '"In my judgment" marks an opinion.' },
    missing: { prompt: 'Complete: Phrases like "In my view" and "I believe" are opinion-_____ signals.', sentence: 'Phrases like "In my view" and "I believe" are opinion-_____ signals.', ans: 'marking', dist: ['deleting', 'shouting', 'erasing'], exp: 'They are opinion-marking signals.' },
    picture: { prompt: 'Which image portrays respectful dialogue sharing diverse perspectives?', l1: 'Two students conversing thoughtfully in library', c1: 'Polite exchange of viewpoints', l2: 'One student covering their ears', c2: 'Refusal to listen', ans: 'p1', exp: 'Thoughtful dialogue models respectful sharing of views.' },
    crossword: { prompt: 'Solve crossword: 4-letter word for opinion or perspective (V _ _ W):', word: 'VIEW', clue: 'Opinion or perspective', dist: ['FACT', 'SIGHT', 'LOOK'], exp: 'VIEW denotes a personal perspective.' },
    type: { prompt: 'Type the 6-letter word: Personal S T A N C E or perspective:', word: 'stance', hint: 'Starts with S T A N C E', exp: 'A stance reflects one’s perspective.' }
  },
  {
    grade: 8, quarter: 2, qIdx: 3, overallNum: 8,
    title: 'Comparing and Contrasting Own Opinions with Viewed Materials',
    topic: 'viewing', melcCode: 'EN8VC-IIb-1.3',
    melcText: 'Compare and contrast one’s opinions with those presented in familiar texts or viewed materials',
    overview: 'Critical viewers examine visual media (documentaries, news broadcasts, public awareness commercials) and compare their prior beliefs against the arguments, evidence, and conclusions framed on screen.',
    rules: [
      'State Prior Opinion: Articulate your existing belief before viewing the material.',
      'Analyze Screen Message: Extract the core thesis and perspective communicated by the film/video.',
      'Identify Convergences: Note points where your opinion aligns with the visual message.',
      'Identify Divergences: Point out where your perspective differs from or questions the screen narrative.',
      'Synthesize Revised Stance: Formulate an enriched viewpoint integrating the new visual evidence.'
    ],
    example1: { title: 'Comparing Perspectives on Surfing', text: 'Prior View: "Surfing is just recreation." -> After Video: "The documentary demonstrated that surfing in Dahican also drives sea turtle conservation and youth discipline."', analysis: 'Viewer expands their initial opinion based on documentary insights.' },
    example2: { title: 'Contrasting Views on Fishing', text: 'Video Claim: "All commercial fishing in the bay should cease." -> Viewer Contrast: "While I agree the bay is fragile, small-scale artisan fishers must be provided alternative livelihoods first."', analysis: 'Respectfully questions a sweeping media proposal with localized nuance.' },
    cultural: 'Documentaries on Pujada Bay protected seascape challenge students to compare traditional fishing practices with modern marine biology.',
    warmupQ: 'What is the goal when comparing your opinion with a documentary?',
    warmupOpts: [
      'To critically evaluate where your ideas agree or diverge from the visual evidence presented',
      'To automatically change your mind without thinking',
      'To dismiss the documentary without watching it',
      'To copy down the video credits word-for-word'
    ],
    warmupAns: 'To critically evaluate where your ideas agree or diverge from the visual evidence presented',
    warmupFeedback: 'Correct! Comparing viewpoints encourages critical thinking and nuanced evaluation.'
    ,
    writingTitle: 'Viewer Opinion Comparison',
    writingInstr: 'Watch a short public service announcement and write a paragraph comparing your viewpoint with the video’s message.',
    writingStarter: 'Before watching the video on Dahican marine life, I believed... However, after viewing...'
    ,
    analogy: { prompt: 'Agreement : Convergence :: Disagreement : _____', a: 'Agreement', b: 'Convergence', c: 'Disagreement', rel: 'Viewpoint Relationship', ans: 'Divergence', dist: ['Exact Twin', 'Identical Echo', 'Total Clone'], exp: 'Divergence reflects disagreement in views.' },
    missing: { prompt: 'Complete: Finding common ground between your view and a video is finding a point of _____.', sentence: 'Finding common ground between your view and a video is finding a point of _____.', ans: 'agreement', dist: ['anger', 'hostility', 'refusal'], exp: 'Agreement identifies common ground.' },
    picture: { prompt: 'Which diagram is ideal for comparing personal views with film views?', l1: 'Two overlapping comparison circles (Venn)', c1: 'Comparing and contrasting perspectives', l2: 'Single isolated bar', c2: 'Single metric', ans: 'p1', exp: 'Venn diagrams map commonalities and differences.' },
    crossword: { prompt: 'Solve crossword: 5-letter term for evaluating differences (V _ _ _ S):', word: 'VIEWS', clue: 'Perspectives or opinions', dist: ['DATES', 'LAWS', 'FACTS'], exp: 'VIEWS are personal perspectives.' },
    type: { prompt: 'Type the 7-letter word: Highlighting differences: C O N T R A S T:', word: 'contrast', hint: 'Starts with C O N T R A S T', exp: 'Contrasting identifies differences.' }
  },
  {
    grade: 8, quarter: 2, qIdx: 4, overallNum: 9,
    title: 'Recognizing Positive and Negative Messages in Discourse',
    topic: 'reading', melcCode: 'EN8RC-IIe-11',
    melcText: 'Recognize positive and negative messages conveyed in a text',
    overview: 'Writers convey positive or negative connotations through word choice (diction), tone, and figurative devices. Skilled readers detect subtle optimism, commendation, criticism, or cynicism behind ostensibly neutral reporting.',
    rules: [
      'Connotation vs Denotation: Denotation is dictionary definition; connotation is emotional association.',
      'Positive Tone Signals: Words implying hope, progress, resilience, courage, and harmony.',
      'Negative Tone Signals: Words implying decay, failure, danger, neglect, and despair.',
      'Loaded Words: Emotionally charged words designed to sway audience sentiment favorably or unfavorably.',
      'Contextual Tone: Analyze overall paragraph context; sarcasm may employ positive words with negative intent.'
    ],
    example1: { title: 'Positive Message Diction', text: '"Through tireless community diligence, the pristine shores of Waniban Island flourished under dedicated youth stewardship."', analysis: 'Diction like "diligence", "pristine", "flourished", and "stewardship" establishes an uplifting, positive message.' },
    example2: { title: 'Negative Message Diction', text: '"Callous disregard and suffocating debris threaten to devastate the fragile coastal reefs of the municipality."', analysis: 'Diction like "callous disregard", "suffocating", and "devastate" signals an alarming, critical message.' },
    cultural: 'Speeches celebrating coastal cleanups in Mati City balance warnings about debris with positive praise for volunteer spirit.',
    warmupQ: 'Which phrase conveys a POSITIVE message of hope and restoration?',
    warmupOpts: [
      'The community successfully revitalized the coral sanctuary with radiant vigor.',
      'The coast suffered catastrophic devastation under thick suffocating soot.',
      'A bleak and hopeless future confronts the dying shoreline.',
      'Trash was discarded everywhere without care.'
    ],
    warmupAns: 'The community successfully revitalized the coral sanctuary with radiant vigor.',
    warmupFeedback: 'Correct! Words like "revitalized" and "radiant vigor" carry strong positive connotations.'
    ,
    writingTitle: 'Connotation Transformation Exercise',
    writingInstr: 'Rewrite a neutral factual sentence twice: first using positive diction, then using negative diction.',
    writingStarter: 'Neutral: Tourists visited the beach. Positive: Delighted travelers celebrated the pristine shores...'
    ,
    analogy: { prompt: 'Pristine : Positive Connotation :: Toxic : _____', a: 'Pristine', b: 'Positive Connotation', c: 'Toxic', rel: 'Semantic Connotation', ans: 'Negative Connotation', dist: ['Neutral State', 'Cheerful Melody', 'Sunny Sky'], exp: 'Toxic has a negative connotation.' },
    missing: { prompt: 'Complete: The emotional feeling or association evoked by a word is its _____.', sentence: 'The emotional feeling or association evoked by a word is its _____.', ans: 'connotation', dist: ['alphabet', 'length', 'syllables'], exp: 'Connotation is emotional association.' },
    picture: { prompt: 'Which visual represents a positive, uplifting environmental message?', l1: 'Healthy coral reef teeming with vibrant fish', c1: 'Positive ecological vitality', l2: 'Bleached dying corals on dark ocean bed', c2: 'Negative ecological degradation', ans: 'p1', exp: 'Vibrant reefs convey positive ecological health.' },
    crossword: { prompt: 'Solve crossword: 4-letter word for emotional attitude of a text (T _ _ E):', word: 'TONE', clue: 'Authorial attitude or emotional mood', dist: ['PLOT', 'FORM', 'PAGE'], exp: 'TONE conveys emotional attitude.' },
    type: { prompt: 'Type the 8-letter word: Emotional word flavor: C O N N O T E:', word: 'connote', hint: 'Starts with C O N N O T E', exp: 'Words connote positive or negative feelings.' }
  },
  {
    grade: 7, quarter: 2, qIdx: 5, overallNum: 10,
    title: 'Analyzing Messages Conveyed in a Text (Literal vs Figurative)',
    topic: 'literature', melcCode: 'EN8LT-IIg-2.2',
    melcText: 'Explain how the elements specific to a genre contribute to the theme of a particular literary selection',
    overview: 'Literary texts communicate on two planes: the literal (exact dictionary meaning of events and objects) and the figurative/symbolic (deeper metaphorical meaning that points toward universal human themes like resilience, love, and sacrifice).',
    rules: [
      'Literal Level: What literally happens on the surface of the plot (characters, settings, tangible actions).',
      'Figurative Level: Metaphorical and symbolic meanings that represent abstract human experiences.',
      'Literary Symbolism: An object representing a deeper concept (e.g., a lighthouse symbolizing moral guidance).',
      'Theme: The overarching universal insight about life communicated through character actions and outcomes.',
      'Synthesizing Levels: Understand the literal story first before unlocking symbolic and thematic significance.'
    ],
    example1: { title: 'Literal vs Figurative Ocean', text: 'Literal: An old fisherman navigates rough waves in Pujada Bay. | Figurative: The turbulent ocean represents life’s unpredictable hardships and human perseverance.', analysis: 'The physical sea becomes a metaphor for existential struggle.' },
    example2: { title: 'Symbolism of Woven Cloth', text: 'Literal: A Mandaya weaver interlaces abaca fibers into Dagmay cloth. | Figurative: The interwoven threads symbolize the unity of families across generations.', analysis: 'Physical cloth symbolizes communal solidarity.' },
    cultural: 'Oral narratives and Mandaya poetry in Davao Oriental use mountain peaks and ocean tides as rich literary symbols of endurance.',
    warmupQ: 'In literature, what does a lighthouse shining through storm clouds most commonly symbolize on a figurative level?',
    warmupOpts: ['Hope, guidance, and safety amidst adversity', 'A tall concrete cylinder with a lightbulb', 'High electricity bills', 'A dangerous place to avoid'],
    warmupAns: 'Hope, guidance, and safety amidst adversity',
    warmupFeedback: 'Correct! A lighthouse is a universal symbol of hope and guidance.'
    ,
    writingTitle: 'Symbolic Interpretation Essay',
    writingInstr: 'Select a natural element from Davao Oriental (e.g., sea turtle, mangrove tree, sleeping dinosaur) and explain its symbolic meaning.',
    writingStarter: 'The mangrove tree, standing firm in salty tidal waters, symbolically represents Filipino resilience because...'
    ,
    analogy: { prompt: 'Surface Fact : Literal Meaning :: Deeper Symbol : _____', a: 'Surface Fact', b: 'Literal Meaning', c: 'Deeper Symbol', rel: 'Interpretive Depth', ans: 'Figurative Meaning', dist: ['Exact Word Count', 'Dictionary Spelling', 'Punctuation Mark'], exp: 'Symbols convey figurative meaning.' },
    missing: { prompt: 'Complete: When an author uses an eagle to represent national freedom, the eagle functions as a _____.', sentence: 'When an author uses an eagle to represent national freedom, the eagle functions as a _____.', ans: 'symbol', dist: ['number', 'clause', 'rhyme'], exp: 'A symbol represents deeper abstract concepts.' },
    picture: { prompt: 'Which image carries deep figurative symbolism of wisdom and endurance?', l1: 'Ancient century-old bonsai tree rooted on Mount Hamiguitan', c1: 'Symbol of endurance and timeless resilience', l2: 'Plastic cup on sidewalk', c2: 'Litter debris', ans: 'p1', exp: 'Ancient bonsai trees symbolize enduring strength.' },
    crossword: { prompt: 'Solve crossword: 5-letter central universal message of a story (T _ _ _ E):', word: 'THEME', clue: 'Central insight or message of literature', dist: ['TITLE', 'SCENE', 'TALE'], exp: 'The THEME is the central message.' },
    type: { prompt: 'Type the 6-letter word: Deeper literary S Y M B O L:', word: 'symbol', hint: 'Starts with S Y M B O L', exp: 'A symbol embodies figurative significance.' }
  },

  // --- QUARTER 3: OAK ISLAND (6 Modules: M11 to M16) ---
  {
    grade: 8, quarter: 3, qIdx: 1, overallNum: 11,
    title: 'Examining Biases in Written Texts',
    topic: 'reading', melcCode: 'EN8RC-IIIa-12.1',
    melcText: 'Recognize bias and prejudice in written and digital texts and identify indicators of one-sided reporting',
    overview: 'Bias occurs when an author presents a disproportionate, one-sided perspective that unfairly favors or opposes an idea, person, or group. Recognizing loaded words, selective evidence omission, and unverified stereotypes allows readers to detect bias.',
    rules: [
      'Slanted Language: Biased authors use extreme adjectives or derogatory labels to sway emotions.',
      'Omission of Opposing Facts: One-sided texts deliberately ignore counter-arguments and data.',
      'Overgeneralization: Attributing negative or positive traits to an entire demographic or culture.',
      'Vested Interest: Authors with financial or political stakes frequently display persuasive bias.',
      'Balanced Journalism: Fair reporting presents multiperspective viewpoints with equal dignity.'
    ],
    example1: { title: 'Biased Commentary', text: '"Only reckless, uneducated youths engage in skimboarding on our shores."', analysis: 'Displays prejudice through sweeping insults ("reckless, uneducated") while ignoring disciplined athletes.' },
    example2: { title: 'Balanced Reporting', text: '"While some residents express concern over coastal crowds, local coaches emphasize that skimboarding fosters athletic discipline among youth in Dahican."', analysis: 'Presents both community perspectives fairly.' },
    cultural: 'Provincial sports journals in Davao Oriental examine fair coverage of indigenous youth athletes in regional competitions.',
    warmupQ: 'What is a clear indicator that an article is biased against coastal tourism?',
    warmupOpts: [
      'It uses harsh, one-sided insults and completely ignores economic benefits to local vendors',
      'It quotes both business owners and marine conservationists',
      'It includes verifiable statistics from official provincial surveys',
      'It has a neutral and respectful tone throughout'
    ],
    warmupAns: 'It uses harsh, one-sided insults and completely ignores economic benefits to local vendors',
    warmupFeedback: 'Correct! One-sided emotional insults indicate bias.'
    ,
    writingTitle: 'Bias Detection and Revision',
    writingInstr: 'Take a biased statement about teenagers and rewrite it into a fair, balanced, and objective paragraph.',
    writingStarter: 'Biased: All teenagers spend all day wasting time on cellphones. Balanced: Although many adolescents...'
    ,
    analogy: { prompt: 'Objective Report : Neutral Balance :: Slanted Article : _____', a: 'Objective Report', b: 'Neutral Balance', c: 'Slanted Article', rel: 'Media Quality', ans: 'Unfair Bias', dist: ['Scientific Truth', 'Encyclopedic Record', 'Universal Harmony'], exp: 'Slanted articles exhibit unfair bias.' },
    missing: { prompt: 'Complete: When an author presents only one side of an issue, the writing shows _____.', sentence: 'When an author presents only one side of an issue, the writing shows _____.', ans: 'bias', dist: ['clarity', 'truth', 'fairness'], exp: 'Bias favors one side unfairly.' },
    picture: { prompt: 'Which visual represents an unbalanced, biased presentation of ideas?', l1: 'Scales heavily tipped to one side', c1: 'One-sided slanted bias', l2: 'Balanced horizontal scales', c2: 'Equitable balance', ans: 'p1', exp: 'Tipped scales symbolize bias.' },
    crossword: { prompt: 'Solve crossword: 4-letter word for one-sided favoritism (B _ _ S):', word: 'BIAS', clue: 'Unfair preference or prejudice', dist: ['FAIR', 'EQUAL', 'JUST'], exp: 'BIAS is one-sided preference.' },
    type: { prompt: 'Type the 4-letter word: Slanted perspective: B I A S:', word: 'bias', hint: 'Starts with B I A S', exp: 'Bias slants writing unfairly.' }
  },
  {
    grade: 8, quarter: 3, qIdx: 2, overallNum: 12,
    title: 'Propaganda Techniques and Media Literacy',
    topic: 'reading', melcCode: 'EN8RC-IIIb-12.1',
    melcText: 'Analyze propaganda techniques used in advertisements, campaigns, and commercial discourses',
    overview: 'Propaganda uses emotional appeals and psychological triggers to influence opinions and consumer habits. Common techniques include bandwagon, testimonial, plain folks, name-calling, card stacking, transfer, and glittering generalities.',
    rules: [
      'Bandwagon: Persuades by claiming "everyone is doing it, so you should join too."',
      'Testimonial: Uses famous celebrity endorsements to promote products outside their expertise.',
      'Plain Folks: Presents wealthy figures as ordinary humble citizens to gain trust.',
      'Glittering Generalities: Uses virtuous words (freedom, honor, miracle) without substance.',
      'Card Stacking: Highlighting only positive features while burying dangerous drawbacks.'
    ],
    example1: { title: 'Bandwagon Technique', text: '"Over 90% of students in Davao Oriental drink this brand of juice; don\'t be left behind!"', analysis: 'Appeals to peer pressure and fear of social exclusion.' },
    example2: { title: 'Testimonial Technique', text: '"Famous movie star says: \'I drink this herbal tea to stay healthy.\'"', analysis: 'Relies on celebrity glamour rather than medical evidence.' },
    cultural: 'Commercial billboards along national highways in Mindanao employ plain folks imagery of local farmers to promote fertilizers.',
    warmupQ: 'Which propaganda technique is used when an ad claims "Join the millions who already switched!"?',
    warmupOpts: ['Bandwagon', 'Plain Folks', 'Name-Calling', 'Card Stacking'],
    warmupAns: 'Bandwagon',
    warmupFeedback: 'Correct! Urging people to join the crowd is the bandwagon technique.'
    ,
    writingTitle: 'Commercial Propaganda Analysis',
    writingInstr: 'Select a popular television or online advertisement and identify the primary propaganda technique used.',
    writingStarter: 'The commercial for skin whitening soap employs the testimonial technique by featuring a famous celebrity...'
    ,
    analogy: { prompt: 'Celebrity Endorsement : Testimonial :: Peer Pressure : _____', a: 'Celebrity Endorsement', b: 'Testimonial', c: 'Peer Pressure', rel: 'Propaganda Classification', ans: 'Bandwagon', dist: ['Plain Folks', 'Name-Calling', 'Card Stacking'], exp: 'Peer pressure characterizes the bandwagon technique.' },
    missing: { prompt: 'Complete: Propaganda that highlights only positive points while hiding negative flaws is card _____.', sentence: 'Propaganda that highlights only positive points while hiding negative flaws is card _____.', ans: 'stacking', dist: ['playing', 'dropping', 'folding'], exp: 'Card stacking conceals negative facts.' },
    picture: { prompt: 'Which image illustrates the bandwagon propaganda technique?', l1: 'Crowd running together following a trend', c1: 'Bandwagon peer pressure', l2: 'Individual reading scientific facts', c2: 'Independent research', ans: 'p1', exp: 'Following the crowd represents the bandwagon technique.' },
    crossword: { prompt: 'Solve crossword: 5-letter word for common everyday people: P _ _ _ N folks:', word: 'PLAIN', clue: 'Ordinary, simple, or unadorned', dist: ['FANCY', 'PROUD', 'GRAND'], exp: 'PLAIN folks presents relatable figures.' },
    type: { prompt: 'Type the 9-letter word: Persuasive media manipulation: B A N D W A G O N:', word: 'bandwagon', hint: 'Starts with B A N D W A G O N', exp: 'Bandwagon pressures conformity.' }
  },
  {
    grade: 8, quarter: 3, qIdx: 3, overallNum: 13,
    title: 'Social, Moral, and Economic Issues in Literature & Media',
    topic: 'literature', melcCode: 'EN8RC-IIIc-2.13',
    melcText: 'Differentiate social, moral, and economic issues in texts and provide constructive reactions',
    overview: 'Literature and media reflect human struggles across three distinct categories: social issues (community relations, discrimination, civic rights), moral issues (personal ethics, integrity, right vs wrong), and economic issues (poverty, employment, resource distribution).',
    rules: [
      'Social Issues: Involve systemic community relationships, gender roles, bullying, and institutional equity.',
      'Moral Issues: Involve personal ethical conscience, honesty, fidelity, betrayal, and compassion.',
      'Economic Issues: Involve financial livelihood, poverty, inflation, unemployment, and fair wages.',
      'Interconnectedness: A single crisis often spans all three dimensions (e.g., poverty creates moral stress).',
      'Constructive Action: Readers evaluate issues not merely to criticize, but to formulate practical reforms.'
    ],
    example1: { title: 'Economic Issue in Literature', text: 'A story depicting coastal fishers struggling to afford boat fuel amid rising inflation.', analysis: 'Focuses on financial livelihood and resource scarcity (Economic).' },
    example2: { title: 'Moral Issue in Literature', text: 'A student finding a wallet full of cash in the school corridor and wrestling with whether to return it.', analysis: 'Focuses on personal ethical integrity and conscience (Moral).' },
    cultural: 'Literary works by Mindanao authors examine how typhoons impact the economic livelihood of copra farmers in Davao Oriental.',
    warmupQ: 'Which of the following is classified as an ECONOMIC issue?',
    warmupOpts: [
      'High inflation and unemployment affecting household food security',
      'A character deciding whether to tell a lie to save face',
      'Racial discrimination in public transport',
      'A child disobeying their parents'
    ],
    warmupAns: 'High inflation and unemployment affecting household food security',
    warmupFeedback: 'Correct! Inflation and unemployment deal with financial and economic livelihood.'
    ,
    writingTitle: 'Socio-Economic Issue Response',
    writingInstr: 'Select an issue affecting your community and explain how it has social, moral, and economic dimensions.',
    writingStarter: 'The issue of coastal waste in our barangay is economic because it damages fishing revenue; socially, it affects...'
    ,
    analogy: { prompt: 'Dishonesty : Moral Issue :: Poverty : _____', a: 'Dishonesty', b: 'Moral Issue', c: 'Poverty', rel: 'Issue Classification', ans: 'Economic Issue', dist: ['Scientific Law', 'Grammar Rule', 'Poetic Rhyme'], exp: 'Poverty is an economic issue.' },
    missing: { prompt: 'Complete: Discrimination and inequality in community institutions constitute a _____ issue.', sentence: 'Discrimination and inequality in community institutions constitute a _____ issue.', ans: 'social', dist: ['weather', 'musical', 'sports'], exp: 'Discrimination is a social issue.' },
    picture: { prompt: 'Which image represents an economic livelihood concern?', l1: 'Fisherman mending nets next to coin scales', c1: 'Economic livelihood and income', l2: 'Two characters debating ethics', c2: 'Moral deliberation', ans: 'p1', exp: 'Fishing livelihood represents economic reality.' },
    crossword: { prompt: 'Solve crossword: 5-letter word for ethical principles of right and wrong (M _ _ _ L):', word: 'MORAL', clue: 'Concerned with right and wrong', dist: ['LEGAL', 'CIVIC', 'TOTAL'], exp: 'MORAL issues concern ethics.' },
    type: { prompt: 'Type the 6-letter word: Community issues: S O C I A L:', word: 'social', hint: 'Starts with S O C I A L', exp: 'Social issues affect communities.' }
  },
  {
    grade: 8, quarter: 3, qIdx: 4, overallNum: 14,
    title: 'Literature as a Mirror to a Shared Heritage',
    topic: 'literature', melcCode: 'EN8LT-IIId-2.2',
    melcText: 'Explain how literature serves as a mirror to a shared Afro-Asian and Philippine cultural heritage',
    overview: 'Afro-Asian and Philippine literature mirrors shared historical values: reverence for ancestors, strong family solidarity, harmony with the natural environment, spiritual humility, and heroic resilience in the face of colonization.',
    rules: [
      'Shared Afro-Asian Values: Communal identity, respect for elders, filial piety, and hospitality.',
      'Oral Traditions: Folktales, proverbs, and epics passed across generations preserve wisdom.',
      'Colonial Experience: Shared historical narratives of resistance against foreign domination.',
      'Harmony with Nature: Sacred reverence for rivers, trees, and animals in indigenous folklore.',
      'Literary Reflection: Literature serves as a mirror preserving ancestral heritage for modern youth.'
    ],
    example1: { title: 'Filial Piety in Literature', text: 'Classic Asian folktale of a young daughter who sacrifices her comfort to nurse her ailing mother.', analysis: 'Exemplifies shared Afro-Asian values of family loyalty and respect.' },
    example2: { title: 'Mandaya Oral Lore', text: 'The epic chant of hero Lumabat navigating celestial challenges to secure eternal peace for his people.', analysis: 'Mirrors ancestral bravery and cosmological harmony in Davao Oriental.' },
    cultural: 'Mandaya communities in Caraga and Manay celebrate ancestral heritage through epic chants that mirror Afro-Asian oral epics.',
    warmupQ: 'What common value is prominently shared across Philippine and Afro-Asian folk literature?',
    warmupOpts: ['Deep reverence for family, elders, and communal harmony', 'Obsession with mechanical gadgets', 'Complete disregard for traditions', 'Individual selfishness'],
    warmupAns: 'Deep reverence for family, elders, and communal harmony',
    warmupFeedback: 'Correct! Afro-Asian literature deeply honors family solidarity and elders.'
    ,
    writingTitle: 'Shared Cultural Heritage Reflection',
    writingInstr: 'Compare a Philippine folktale with an Asian or African story you read, identifying one shared ancestral value.',
    writingStarter: 'Both the Philippine legend of Mount Hamiguitan and the African tale of the Baobab tree emphasize...'
    ,
    analogy: { prompt: 'Family Loyalty : Filial Piety :: Ancestral Legacy : _____', a: 'Family Loyalty', b: 'Filial Piety', c: 'Ancestral Legacy', rel: 'Cultural Concept', ans: 'Shared Heritage', dist: ['Modern Fashion', 'Foreign Slang', 'Temporary Trend'], exp: 'Ancestral legacy constitutes shared heritage.' },
    missing: { prompt: 'Complete: Traditional proverbs and epics handed down through spoken word form our _____ tradition.', sentence: 'Traditional proverbs and epics handed down through spoken word form our _____ tradition.', ans: 'oral', dist: ['silent', 'written', 'digital'], exp: 'Oral tradition preserves folklore.' },
    picture: { prompt: 'Which image portrays ancestral storytelling and heritage?', l1: 'Elder sharing stories with youth around hearth', c1: 'Oral transmission of heritage', l2: 'Person working alone on laptop', c2: 'Modern digital workspace', ans: 'p1', exp: 'Elders sharing stories embodies oral heritage.' },
    crossword: { prompt: 'Solve crossword: 5-letter word for ancestral wisdom or folk knowledge (L _ _ E):', word: 'LORE', clue: 'Traditional knowledge or folklore', dist: ['TALE', 'NOTE', 'MYTH'], exp: 'LORE is traditional knowledge.' },
    type: { prompt: 'Type the 8-letter word: Cultural legacy: H E R I T A G E:', word: 'heritage', hint: 'Starts with H E R I T A G E', exp: 'Heritage embodies ancestral legacy.' }
  },
  {
    grade: 8, quarter: 3, qIdx: 5, overallNum: 15,
    title: 'Cohesive Devices in Informative & Persuasive Speeches',
    topic: 'speaking', melcCode: 'EN8G-IIIe-3.6',
    melcText: 'Use cohesive devices in formulating informative and persuasive speeches',
    overview: 'Mastering cohesive devices—pronoun reference, transitional adverbs, lexical repetition, and parallel structures—weaves spoken paragraphs into a seamless, flowing speech that holds audience attention and reinforces key arguments.',
    rules: [
      'Pronoun Referents: Use pronouns (this, these, they, it) to refer back to previously stated nouns without awkward repetition.',
      'Logical Connectors: Guide listeners using transitional phrases ("To illustrate this point,", "Consequently,").',
      'Lexical Repetition: Strategically repeat key power words for rhetorical emphasis (anaphora).',
      'Substitution: Replace repeated clauses with concise substitutes ("We must protect our bay; doing so ensures our future.").',
      'Signposting: Announce speech structure clearly ("First, I will examine... Next, I will present...").'
    ],
    example1: { title: 'Anaphora Cohesion', text: '"We need courage to protect our forests. We need courage to clean our shores. We need courage to stand for our future."', analysis: 'Rhetorical repetition of "We need courage" unifies the speech with persuasive momentum.' },
    example2: { title: 'Signposting in Speeches', text: '"Having examined the economic crisis facing local fishers, let us now turn our attention to sustainable solutions."', analysis: 'Explicit signpost transitions between speech sections smoothly.' },
    cultural: 'Valedictory speeches in Davao Oriental high schools employ cohesive signposts to celebrate academic journeys.',
    warmupQ: 'What is the rhetorical effect of using anaphora (repeating words at the start of consecutive sentences) in a speech?',
    warmupOpts: ['It builds emotional rhythm, unity, and memorable persuasive impact', 'It confuses listeners and causes boredom', 'It proves the speaker forgot their vocabulary', 'It decreases speech volume'],
    warmupAns: 'It builds emotional rhythm, unity, and memorable persuasive impact',
    warmupFeedback: 'Correct! Anaphora creates powerful rhetorical rhythm and cohesion.'
    ,
    writingTitle: 'Cohesive Speech Introduction',
    writingInstr: 'Write a 3-sentence speech opening about marine conservation using signposting and deliberate repetition for cohesion.',
    writingStarter: 'Fellow citizens of Davao Oriental: Today, our bay calls for our dedication. Today, our bay calls for our protection...'
    ,
    analogy: { prompt: 'Mortar : Brick Wall :: Cohesive Devices : _____', a: 'Mortar', b: 'Brick Wall', c: 'Cohesive Devices', rel: 'Unifying Function', ans: 'Unified Speech', dist: ['Broken Fragment', 'Random Word List', 'Silent Pause'], exp: 'Cohesive devices bind speech paragraphs together.' },
    missing: { prompt: 'Complete: Words that explicitly guide listeners through speech points are called speech _____ markers.', sentence: 'Words that explicitly guide listeners through speech points are called speech _____ markers.', ans: 'signpost', dist: ['stop', 'blank', 'hidden'], exp: 'Signpost markers guide listeners.' },
    picture: { prompt: 'Which image portrays a cohesive, well-connected speech flow?', l1: 'Interlinked golden chain links', c1: 'Connected cohesion', l2: 'Broken scattered links', c2: 'Disjointed fragmentation', ans: 'p1', exp: 'Interlinked chains symbolize cohesion.' },
    crossword: { prompt: 'Solve crossword: 6-letter term for formal oral address to an audience (S _ _ _ _ H):', word: 'SPEECH', clue: 'Formal spoken address', dist: ['REPORT', 'LESSON', 'SERMON'], exp: 'A SPEECH addresses an audience.' },
    type: { prompt: 'Type the 8-letter word: Unified connection: C O H E S I O N:', word: 'cohesion', hint: 'Starts with C O H E S I O N', exp: 'Cohesion binds discourse.' }
  },
  {
    grade: 8, quarter: 3, qIdx: 6, overallNum: 16,
    title: 'Parallel Structures in Sentence Construction & Rhetoric',
    topic: 'grammar', melcCode: 'EN8G-IIIf-3.6',
    melcText: 'Use parallel structures in composing sentences, paragraphs, and speeches',
    overview: 'Parallelism involves using matching grammatical forms for words, phrases, or clauses joined in a series or by coordinating conjunctions (and, but, or). Parallel construction brings rhythm, balance, and clarity to written and spoken English.',
    rules: [
      'Matching Word Forms: Pair nouns with nouns, adjectives with adjectives, and verbs with verbs.',
      'Verb Gerund Parallelism: "She enjoys swimming, hiking, and camping" (NOT "swimming, to hike, and camping").',
      'Infinitive Parallelism: "To conserve our forests, to protect our reefs, and to educate our youth."',
      'Correlative Conjunctions: Ensure parallelism after "either...or", "neither...nor", and "not only...but also".',
      'Rhetorical Impact: Parallel structures enhance memorability in speeches, slogans, and essays.'
    ],
    example1: { title: 'Faulty vs Parallel Structure', text: 'Faulty: "Carlo loves skimboarding, to hike mountains, and photography." -> Parallel: "Carlo loves skimboarding, hiking mountains, and photographing wildlife."', analysis: 'Aligns all three activities into parallel -ing gerunds.' },
    example2: { title: 'Correlative Parallelism', text: '"The mayor sought not only to restore the coastal park but also to revitalize local vendors."', analysis: 'Maintains infinitive verbs after both correlative parts.' },
    cultural: 'Mati City environmental slogans employ parallel rhythm: "Protect our Bay, Preserve our Heritage, Promote our Future."',
    warmupQ: 'Which sentence demonstrates correct grammatical parallel structure?',
    warmupOpts: [
      'The students volunteered by cleaning the beach, planting mangroves, and painting trash bins.',
      'The students volunteered by cleaning the beach, to plant mangroves, and painted trash bins.',
      'The students volunteered to clean the beach, planting mangroves, and paint trash bins.',
      'The students clean beach, to planting, and painted.'
    ],
    warmupAns: 'The students volunteered by cleaning the beach, planting mangroves, and painting trash bins.',
    warmupFeedback: 'Correct! All three items use parallel gerund forms (-ing verbs).'
    ,
    writingTitle: 'Parallel Slogan and Speech Drafting',
    writingInstr: 'Create a 3-part campaign slogan for Mount Hamiguitan conservation using parallel grammatical structure.',
    writingStarter: 'To climb with respect, to explore with caution, and to leave without trace...'
    ,
    analogy: { prompt: 'Lopsided Scale : Faulty Syntax :: Balanced Weight : _____', a: 'Lopsided Scale', b: 'Faulty Syntax', c: 'Balanced Weight', rel: 'Structural Balance', ans: 'Parallel Structure', dist: ['Run-On Sentence', 'Comma Splice', 'Fragmented Clause'], exp: 'Parallel structure ensures grammatical balance.' },
    missing: { prompt: 'Complete: When elements in a series share the same grammatical form, they exhibit _____.', sentence: 'When elements in a series share the same grammatical form, they exhibit _____.', ans: 'parallelism', dist: ['confusion', 'spelling', 'rhyme'], exp: 'Parallelism balances syntax.' },
    picture: { prompt: 'Which image symbolizes balanced parallel structures?', l1: 'Three identical aligned balance columns', c1: 'Symmetrical parallel alignment', l2: 'Three mismatched crooked pillars', c2: 'Faulty asymmetrical structure', ans: 'p1', exp: 'Aligned columns symbolize parallelism.' },
    crossword: { prompt: 'Solve crossword: 8-letter term for parallel or even balance (P _ _ _ _ _ _ L):', word: 'PARALLEL', clue: 'Side-by-side matching grammatical form', dist: ['BALANCED', 'SYMMETRIC', 'HARMONIC'], exp: 'PARALLEL forms match grammatically.' },
    type: { prompt: 'Type the 8-letter word: Matching structure: P A R A L L E L:', word: 'parallel', hint: 'Starts with P A R A L L E L', exp: 'Parallelism creates syntactic harmony.' }
  },

  // --- QUARTER 4: SAN VICTOR ISLAND (6 Modules: M17 to M22) ---
  {
    grade: 8, quarter: 4, qIdx: 1, overallNum: 17,
    title: 'Synthesizing Essential Information from Diverse Sources',
    topic: 'reading', melcCode: 'EN8SS-IVa-1.5',
    melcText: 'Synthesize essential information found in a given text and cross-reference with diverse sources',
    overview: 'Synthesis merges information from multiple independent texts into a cohesive, comprehensive understanding. Readers compare findings, resolve contradictions, and draw overarching conclusions not found in any single source.',
    rules: [
      'Read Multiple Accounts: Consult at least two or three diverse texts on the same subject.',
      'Identify Common Ground: Note where different sources corroborate key statistics and facts.',
      'Analyze Discrepancies: Note where sources disagree and investigate why perspectives differ.',
      'Organize by Theme: Group synthesized findings by thematic ideas rather than summarizing source-by-source.',
      'Formulate New Insight: Conclude with a synthesized perspective that unifies all consulted evidence.'
    ],
    example1: { title: 'Cross-Source Synthesis', text: 'Source A: Marine biologist report on Pujada Bay coral bleaching. Source B: Local fisher interviews on catch volume. -> Synthesis: Rising sea temperatures have depleted inshore fisheries, necessitating deeper offshore trips and marine reserves.', analysis: 'Merges biological research with community field testimony.' },
    example2: { title: 'Historical Synthesis', text: 'Comparing colonial Spanish records with Mandaya oral legends regarding early settlement in Caraga.', analysis: 'Combines written archival history with indigenous oral tradition.' },
    cultural: 'Senior high school thesis researchers in Davao Oriental synthesize regional agricultural data with marine sanctuary reports.',
    warmupQ: 'What is the defining characteristic of synthesizing information?',
    warmupOpts: [
      'Combining facts from multiple sources to create a unified new understanding',
      'Copying the longest paragraph from the first book you find',
      'Deleting all sources that disagree with your first opinion',
      'Memorizing a single page without questioning it'
    ],
    warmupAns: 'Combining facts from multiple sources to create a unified new understanding',
    warmupFeedback: 'Correct! Synthesis combines multiple sources into a coherent whole.'
    ,
    writingTitle: 'Multi-Source Synthesis Paragraph',
    writingInstr: 'Combine information from two hypothetical articles on coastal erosion in Davao Oriental into one synthesized paragraph.',
    writingStarter: 'While meteorological data highlight increased Pacific typhoons, coastal surveys indicate that mangrove depletion...'
    ,
    analogy: { prompt: 'Single Thread : Isolated Fact :: Woven Fabric : _____', a: 'Single Thread', b: 'Isolated Fact', c: 'Woven Fabric', rel: 'Integration Scale', ans: 'Synthesized Text', dist: ['Blank Canvas', 'Torn Rag', 'Single Knot'], exp: 'Synthesized text weaves multiple facts together.' },
    missing: { prompt: 'Complete: Integrating ideas from multiple texts into a unified report is _____.', sentence: 'Integrating ideas from multiple texts into a unified report is _____.', ans: 'synthesis', dist: ['memorization', 'division', 'erasure'], exp: 'Synthesis unifies diverse sources.' },
    picture: { prompt: 'Which image portrays the synthesis of diverse research inputs?', l1: 'Multiple puzzle pieces fitting together into one picture', c1: 'Synthesis of puzzle pieces', l2: 'A single disconnected jigsaw piece', c2: 'Isolated fragment', ans: 'p1', exp: 'Jigsaw pieces fitting together illustrate synthesis.' },
    crossword: { prompt: 'Solve crossword: 6-letter word for combining ideas into one whole (S _ _ _ _ H):', word: 'SYNTH', clue: 'Short for synthesis or integration', dist: ['MERGE', 'BLEND', 'UNIFY'], exp: 'SYNTH relates to synthesis.' },
    type: { prompt: 'Type the 9-letter word: Information integration: S Y N T H E S I S:', word: 'synthesis', hint: 'Starts with S Y N T H E S I S', exp: 'Synthesis unifies research insights.' }
  },
  {
    grade: 8, quarter: 4, qIdx: 2, overallNum: 18,
    title: 'Composing Effective Paragraphs with Varied Sentence Structures',
    topic: 'writing', melcCode: 'EN8WC-IVb-3.4',
    melcText: 'Compose effective paragraphs using varied sentence structures and transitional markers',
    overview: 'Sophisticated writing avoids monotonous syntax by blending simple, compound, complex, and compound-complex sentences. Varying sentence length and structure establishes engaging rhythm and emphasizes key concepts.',
    rules: [
      'Simple Sentences: One independent clause delivering crisp, direct emphasis (e.g., "Pujada Bay is pristine.").',
      'Compound Sentences: Two independent clauses joined by coordinating conjunction (FANBOYS) or semicolon.',
      'Complex Sentences: One independent clause joined with one or more dependent subordinating clauses.',
      'Compound-Complex Sentences: At least two independent clauses plus at least one dependent clause.',
      'Sentence Variety: Alternate between short punchy sentences and longer descriptive structures.'
    ],
    example1: { title: 'Syntax Variety in Action', text: '"Pujada Bay is fragile [Simple]. Although eco-tourism brings economic vitality, unchecked plastic pollution threatens marine life [Complex], and local leaders must act before damage becomes irreversible [Compound-Complex]."', analysis: 'Demonstrates smooth pacing across simple, complex, and compound-complex sentences.' },
    example2: { title: 'Rhythmic Sentence Craft', text: '"The waves crashed. As dawn broke over Dahican Beach, local skimboarders sprinted toward the surf, and early risers cheered from the sand."', analysis: 'Short sentence creates drama; longer compound-complex sentence provides rich atmosphere.' },
    cultural: 'Essays by Davao Oriental student journalists in regional press conferences win awards through varied syntactic rhythm.',
    warmupQ: 'What sentence type is: "Although the storm raged across Baganga, the giant clams survived because the reef protected them"?',
    warmupOpts: ['Complex sentence', 'Simple sentence', 'Compound sentence', 'Sentence fragment'],
    warmupAns: 'Complex sentence',
    warmupFeedback: 'Correct! It contains one independent clause and two dependent adverbial clauses.'
    ,
    writingTitle: 'Syntactic Variety Paragraph',
    writingInstr: 'Write a 4-sentence paragraph describing San Victor Island containing one simple, one compound, and one complex sentence.',
    writingStarter: 'San Victor Island is a tropical gem [Simple]. Coconut palms sway gently, and azure waves lap against powdery coral shores [Compound]...'
    ,
    analogy: { prompt: 'One Independent Clause : Simple :: Independent + Dependent : _____', a: 'One Independent Clause', b: 'Simple', c: 'Independent + Dependent', rel: 'Sentence Architecture', ans: 'Complex Sentence', dist: ['Fragment', 'Run-on', 'Single Word'], exp: 'Independent plus dependent forms a complex sentence.' },
    missing: { prompt: 'Complete: Joining two independent clauses with "and" or "but" creates a _____ sentence.', sentence: 'Joining two independent clauses with "and" or "but" creates a _____ sentence.', ans: 'compound', dist: ['simple', 'fragmented', 'silent'], exp: 'Two independent clauses form a compound sentence.' },
    picture: { prompt: 'Which visual represents rhythmically varied writing?', l1: 'A wave pattern with varied high and low crests', c1: 'Dynamic rhythmic sentence variety', l2: 'A completely flat straight line', c2: 'Monotonous flat syntax', ans: 'p1', exp: 'Varied wave patterns represent dynamic sentence flow.' },
    crossword: { prompt: 'Solve crossword: 7-letter sentence type with dependent clause (C _ _ _ _ _ X):', word: 'COMPLEX', clue: 'Sentence with independent and dependent clauses', dist: ['COMPOUND', 'SIMPLE', 'PARALLEL'], exp: 'A COMPLEX sentence features dependent clauses.' },
    type: { prompt: 'Type the 7-letter word: Sentence structure: V A R I E T Y:', word: 'variety', hint: 'Starts with V A R I E T Y', exp: 'Variety enhances paragraph flow.' }
  },
  {
    grade: 8, quarter: 4, qIdx: 3, overallNum: 19,
    title: 'Expanding Definitions of Words and Conceptual Terms',
    topic: 'vocabulary', melcCode: 'EN8V-IVc-15',
    melcText: 'Use expanded definitions of words and conceptual terms in composing expository texts',
    overview: 'While formal definitions state genus and differentia in one sentence, expanded definitions explore abstract terms through multiple expansion techniques: historical etymology, concrete examples, analogies, negation (what it is NOT), and operational descriptions.',
    rules: [
      'Formal Definition: Species = Genus + Differentia ("A mangrove is a shrub [genus] that thrives in coastal saline water [differentia]").',
      'Expansion by Example: Provide concrete instances of the term in action.',
      'Expansion by Negation: Clarify boundaries by stating what the concept does not mean.',
      'Expansion by Analogy: Compare the unfamiliar concept to a familiar real-world mechanism.',
      'Operational Definition: Define terms through measurable actions or observable conditions.'
    ],
    example1: { title: 'Expanded Definition by Analogy and Negation', text: '"Biodiversity is not merely a scientific catalog of animal names (Negation). Rather, it functions like the intricate structural web of a suspension bridge (Analogy), where removing even a single species weakens the stability of the entire ecosystem."', analysis: 'Uses negation and architectural analogy to elucidate biodiversity.' },
    example2: { title: 'Expansion by Etymology and Function', text: '"Eco-tourism, derived from the Greek \'oikos\' meaning home, refers to responsible travel that conserves natural ecosystems while sustaining local community livelihoods in places like Pujada Bay."', analysis: 'Combines linguistic root with socioeconomic function.' },
    cultural: 'Ecological interpretive signs at Subangan Provincial Museum expand scientific terms like "endemic" and "keystone species" for visitors.',
    warmupQ: 'Which technique is used when an author defines a term by explaining what it is NOT?',
    warmupOpts: ['Definition by Negation', 'Definition by Etymology', 'Definition by Rhyme', 'Definition by Illustration'],
    warmupAns: 'Definition by Negation',
    warmupFeedback: 'Correct! Negation clarifies boundaries by stating what a term is not.'
    ,
    writingTitle: 'Expanded Definition Composition',
    writingInstr: 'Write an expanded definition paragraph for the concept of "Environmental Stewardship" using at least two expansion techniques.',
    writingStarter: 'Environmental stewardship is not simply passive observation of nature (negation); rather, it is an active moral responsibility...'
    ,
    analogy: { prompt: 'Dictionary Sentence : Formal Definition :: Full Paragraph Breakdown : _____', a: 'Dictionary Sentence', b: 'Formal Definition', c: 'Full Paragraph Breakdown', rel: 'Definitional Scope', ans: 'Expanded Definition', dist: ['Spelling Test', 'Word List', 'Random Guess'], exp: 'A paragraph breakdown represents an expanded definition.' },
    missing: { prompt: 'Complete: Explaining a word’s historical language origin is expansion by _____.', sentence: 'Explaining a word’s historical language origin is expansion by _____.', ans: 'etymology', dist: ['negation', 'analogy', 'abbreviation'], exp: 'Etymology traces word origins.' },
    picture: { prompt: 'Which graphic represents defining a term through multiple branching facets?', l1: 'Mind map tree branching into definitions, examples, and analogies', c1: 'Expanded multifaceted definition', l2: 'Single isolated index card with one line', c2: 'Brief formal entry', ans: 'p1', exp: 'Branching mind maps embody expanded definitions.' },
    crossword: { prompt: 'Solve crossword: 6-letter category in formal definition (G _ _ _ S):', word: 'GENUS', clue: 'Broad classification class in formal definition', dist: ['SPECIES', 'DIFFER', 'NATURE'], exp: 'GENUS is the broad category.' },
    type: { prompt: 'Type the 8-letter word: E X P A N D E D definition:', word: 'expanded', hint: 'Starts with E X P A N D E D', exp: 'Expanded definitions explore concepts in depth.' }
  },
  {
    grade: 8, quarter: 4, qIdx: 4, overallNum: 20,
    title: 'Active and Passive Voice in Journalistic & Academic Discourses',
    topic: 'grammar', melcCode: 'EN8G-IVd-14',
    melcText: 'Use active and passive voices appropriately in journalistic, scientific, and academic texts',
    overview: 'Skilled writers choose grammatical voice purposefully. Active voice emphasizes the doer of the action (vigorous, direct, dynamic—ideal for narrative and news leads). Passive voice emphasizes the receiver or the action itself (objective, impersonal—ideal for scientific experiments and legal bulletins).',
    rules: [
      'Active Voice Formula: Subject (Doer) + Verb + Object (Receiver): "Park rangers tagged the sea turtle."',
      'Passive Voice Formula: Object (Receiver) + Form of "be" + Past Participle + (by + Doer): "The sea turtle was tagged by park rangers."',
      'Journalistic Active Voice: Use active voice for punchy headlines and narrative drive ("Fishermen rescued stranded dolphin").',
      'Scientific Passive Voice: Use passive voice when the researcher is irrelevant compared to the result ("The water samples were tested").',
      'Tactful Passive Voice: Use passive to avoid direct blame ("An administrative error was made" vs "You made an error").'
    ],
    example1: { title: 'Scientific Passive', text: '"Ten juvenile giant clams were successfully relocated to the San Victor Marine Sanctuary."', analysis: 'Passive voice places proper scientific focus on the clams rather than the divers.' },
    example2: { title: 'Journalistic Active', text: '"Mayor Malanyaon inaugurated the new coastal highway connecting Mati to Baganga."', analysis: 'Active voice highlights the public official driving the civic milestone.' },
    cultural: 'News bulletins from the Davao Oriental Provincial Information Office employ active voice for announcements and passive for scientific surveys.',
    warmupQ: 'Why do scientific lab reports frequently use passive voice (e.g., "The seawater was tested")?',
    warmupOpts: [
      'To emphasize the scientific procedure and result rather than the personal researcher',
      'Because scientists do not know how to write active sentences',
      'To make the paper longer and harder to understand',
      'To confuse the public'
    ],
    warmupAns: 'To emphasize the scientific procedure and result rather than the personal researcher',
    warmupFeedback: 'Correct! Passive voice maintains objective focus on experimental results.'
    ,
    writingTitle: 'Voice Transformation Exercise',
    writingInstr: 'Take two news headlines in passive voice and transform them into active voice, then explain the change in focus.',
    writingStarter: 'Passive: The beach was cleaned by 500 volunteers -> Active: Five hundred volunteers cleaned the beach...'
    ,
    analogy: { prompt: 'Doer Focus : Active Voice :: Receiver Focus : _____', a: 'Doer Focus', b: 'Active Voice', c: 'Receiver Focus', rel: 'Grammatical Voice', ans: 'Passive Voice', dist: ['Imperative Mood', 'Subjunctive Verb', 'Past Tense'], exp: 'Receiver focus characterizes passive voice.' },
    missing: { prompt: 'Complete: In passive voice, the verb phrase always contains a form of "be" plus a past _____.', sentence: 'In passive voice, the verb phrase always contains a form of "be" plus a past _____.', ans: 'participle', dist: ['present', 'future', 'noun'], exp: 'Passive uses past participles.' },
    picture: { prompt: 'Which diagram shows active voice flow (Doer directly performing action)?', l1: 'Arrow pointing directly from Actor to Target', c1: 'Direct active voice flow', l2: 'Arrow circling back to the object receiver', c2: 'Passive receiver focus', ans: 'p1', exp: 'Direct actor-to-target arrows represent active voice.' },
    crossword: { prompt: 'Solve crossword: 6-letter voice where subject acts directly (A _ _ _ _ E):', word: 'ACTIVE', clue: 'Voice where subject performs the action', dist: ['PASSIV', 'DIRECT', 'NATIVE'], exp: 'ACTIVE voice highlights the doer.' },
    type: { prompt: 'Type the 7-letter word: P A S S I V E grammatical voice:', word: 'passive', hint: 'Starts with P A S S I V E', exp: 'Passive voice highlights the action receiver.' }
  },
  {
    grade: 8, quarter: 4, qIdx: 5, overallNum: 21,
    title: 'Developing Arguments and Persuasive Stances',
    topic: 'writing', melcCode: 'EN8RC-IVe-13',
    melcText: 'Formulate claims of fact, policy, and value and develop coherent persuasive arguments',
    overview: 'Persuasive rhetoric requires understanding three types of claims: claims of fact (whether something exists or is true), claims of value (whether something is good, bad, or moral), and claims of policy (advocating a specific rule, law, or action). Strong arguments substantiate claims with evidence and address counterclaims.',
    rules: [
      'Claim of Fact: Asserts whether a condition is true or verifiable ("Pujada Bay faces rising plastic runoff").',
      'Claim of Value: Evaluates morality, worth, or aesthetics ("Protecting marine sanctuaries is morally imperative").',
      'Claim of Policy: Recommends specific rules, laws, or civic actions ("The municipality must ban single-use plastics").',
      'Counterclaim Rebuttal: Anticipate opposing objections and refute them respectfully with data.',
      'Rhetorical Proofs: Combine logos (logic and data), pathos (empathy and values), and ethos (credibility).'
    ],
    example1: { title: 'Three Claims in One Campaign', text: 'Fact: "Baganga coral reefs have lost 20% live cover." | Value: "Allowing our marine heritage to perish is unethical." | Policy: "The municipal council should establish permanent patrol outposts at San Victor Island."', analysis: 'Demonstrates progression from empirical fact to moral value to concrete policy.' },
    example2: { title: 'Rebutting a Counterclaim', text: '"Opponents claim plastic bans hurt vendors; however, municipal subsidies for reusable woven bags have increased local artisan revenue in Mati by 15%."', analysis: 'Acknowledges economic objection and refutes it with empirical success data.' },
    cultural: 'Debate societies in Davao Oriental high schools tackle regional policy motions regarding mineral extraction and marine preservation.',
    warmupQ: 'What type of claim is: "The provincial government should allocate 10% of revenue to marine sanctuaries"?',
    warmupOpts: ['Claim of Policy', 'Claim of Fact', 'Claim of Value', 'Casual Opinion'],
    warmupAns: 'Claim of Policy',
    warmupFeedback: 'Correct! Proposing rules, laws, or institutional actions is a Claim of Policy.'
    ,
    writingTitle: 'Three-Claim Argument Outline',
    writingInstr: 'Select a school issue and draft one claim of fact, one claim of value, and one claim of policy addressing it.',
    writingStarter: 'Fact: Our school canteen generates 50 kilograms of plastic weekly; Value: It is irresponsible to ignore campus waste...'
    ,
    analogy: { prompt: 'True/False Condition : Claim of Fact :: Action Mandate : _____', a: 'True/False Condition', b: 'Claim of Fact', c: 'Action Mandate', rel: 'Claim Classification', ans: 'Claim of Policy', dist: ['Claim of Value', 'Poetic Verse', 'Casual Gossip'], exp: 'Action mandates are claims of policy.' },
    missing: { prompt: 'Complete: In argumentation, an opposing viewpoint that you acknowledge and refute is a _____.', sentence: 'In argumentation, an opposing viewpoint that you acknowledge and refute is a _____.', ans: 'counterclaim', dist: ['thesis', 'title', 'headline'], exp: 'A counterclaim is an opposing argument.' },
    picture: { prompt: 'Which symbol represents policy legislation in civic debate?', l1: 'Gavel resting on legal policy document', c1: 'Policy legislation mandate', l2: 'Emotional heart emoji', c2: 'Value judgment', ans: 'p1', exp: 'A gavel symbolizes policy enactments.' },
    crossword: { prompt: 'Solve crossword: 6-letter term for formal policy proposal (P _ _ _ _ Y):', word: 'POLICY', clue: 'Course of action or rule proposed', dist: ['FACTS', 'VALUES', 'CLAIMS'], exp: 'POLICY advocates concrete rules.' },
    type: { prompt: 'Type the 5-letter word: Core argument C L A I M:', word: 'claim', hint: 'Starts with C L A I M', exp: 'A claim asserts a thesis.' }
  },
  {
    grade: 8, quarter: 4, qIdx: 6, overallNum: 22,
    title: 'Composing a Multiperspective Research Report on Community Issues',
    topic: 'research', melcCode: 'EN8WC-IVf-7',
    melcText: 'Compose a comprehensive research report on a relevant social or environmental issue',
    overview: 'A research report synthesizes empirical inquiry into a structured document. It features an introduction (background, problem statement, research questions), literature review, methodology, findings/discussion, and actionable recommendations grounded in evidence.',
    rules: [
      'Structured Sections: Title, Abstract, Introduction, Methodology, Findings, Discussion, Recommendations, References.',
      'Objective Academic Tone: Use third-person pronouns and avoid conversational first-person chatter.',
      'Data Presentation: Support narrative claims with tables, graphs, and transcribed interview evidence.',
      'Actionable Recommendations: Propose realistic, concrete measures tailored to local government and school stakeholders.',
      'Reference List: Ensure every in-text citation corresponds to an alphabetized entry in the bibliography.'
    ],
    example1: { title: 'Problem Statement Drafting', text: '"Despite conservation legislation, plastic runoff into Pujada Bay has increased by 12% over two years, jeopardizing endangered green sea turtle habitats along Dahican Beach."', analysis: 'Concise, evidence-based problem statement defining scope and stakes.' },
    example2: { title: 'Actionable Recommendation', text: '"Recommendation 1: The Mati City Environment Office should partner with coastal schools to install community debris booms at river mouths."', analysis: 'Specifies actor, action, and target location.' },
    cultural: 'Division research fairs in Davao Oriental showcase high school field investigations on giant clam conservation at San Victor Island.',
    warmupQ: 'Which section of a research report outlines the exact steps and instruments used to gather data?',
    warmupOpts: ['Methodology', 'Introduction', 'Abstract', 'Recommendations'],
    warmupAns: 'Methodology',
    warmupFeedback: 'Correct! The methodology section explains how data was collected and analyzed.'
    ,
    writingTitle: 'Research Report Abstract Drafting',
    writingInstr: 'Draft a 4-sentence abstract for a research report on protecting San Victor Island’s giant clam sanctuary.',
    writingStarter: 'This research investigation examined the ecological health of the giant clam sanctuary on San Victor Island, Baganga...'
    ,
    analogy: { prompt: 'Hypothesis : Scientific Question :: Recommendations : _____', a: 'Hypothesis', b: 'Scientific Question', c: 'Recommendations', rel: 'Report Section Function', ans: 'Actionable Solutions', dist: ['Past History', 'Grammar Rule', 'Random Gossip'], exp: 'Recommendations provide actionable solutions.' },
    missing: { prompt: 'Complete: The brief summary appearing at the very beginning of a research report is the _____.', sentence: 'The brief summary appearing at the very beginning of a research report is the _____.', ans: 'abstract', dist: ['index', 'appendix', 'margin'], exp: 'An abstract summarizes the paper.' },
    picture: { prompt: 'Which document represents a formal multi-page research investigation?', l1: 'Structured Research Report with data charts and citations', c1: 'Formal research report', l2: 'Single sticky note', c2: 'Informal note', ans: 'p1', exp: 'Formal reports contain methodology, findings, and citations.' },
    crossword: { prompt: 'Solve crossword: 6-letter term for formal research document (R _ _ _ _ T):', word: 'REPORT', clue: 'Structured written presentation of findings', dist: ['ESSAY', 'POEM', 'STORY'], exp: 'A REPORT presents research findings.' },
    type: { prompt: 'Type the 8-letter word: Academic R E S E A R C H:', word: 'research', hint: 'Starts with R E S E A R C H', exp: 'Research discovers systematic evidence.' }
  }
];

const fileContent = `import { Module } from '../../types/lingoquest';

export const ALL_GRADE_8_MODULES: Module[] = [
${G8_MODULES.map(formatModule).join(',\n')}
];
`;

fs.writeFileSync('./src/data/curriculum/grade8.ts', fileContent, 'utf-8');
console.log('Successfully wrote grade8.ts with all 22 modules! (Q1: 5, Q2: 5, Q3: 6, Q4: 6)');
