export type PictureScene = 'opposites'|'similarity'|'comparison'|'parallel'|'thought'|'speech'|'listening'|'sound'|'presentation'|'conversation'|'formalTalk'|'friendlyTalk'|'gesture'|'reading'|'writing'|'editing'|'notes'|'outline'|'summary'|'connecting'|'sentence'|'phrase'|'noun'|'action'|'active'|'passive'|'calendarPast'|'calendarFuture'|'conditional'|'permission'|'prohibition'|'obligation'|'research'|'evidence'|'fact'|'opinion'|'scales'|'community'|'help'|'crowd'|'crime'|'stage'|'cinema'|'story'|'character'|'setting'|'conflict'|'resolution'|'epic'|'poetry'|'drawing'|'sculpture'|'search'|'source'|'citation'|'truth'|'misleading'|'lineGraph'|'barGraph'|'table'|'mindMap'|'map'|'diagram'|'video'|'collage'|'machine'|'expanded'|'label'|'question';
const groups:Partial<Record<PictureScene,string>>={
 opposites:'antonyms|antonym|contrast|contrasting|differences|non-linear|non-verbal|disagree|disagreeing|disagreement',
 similarity:'synonyms|synonym|similarities|agree|agreeing|agreement|connections',
 comparison:'analogy|comparison|comparing|metaphor|simile|allegory',parallel:'parallel structure|parallel|structures',
 thought:'belief|conviction|convictions|subtext|purpose|meaning|ideas|understanding|mental|theme|hypothesis|judgment|evaluation|worth|value|choice|point',
 speech:'speech|good speech|oral|verbal|verbal communication|delivery|verbal communication|express|expressing|reactions|emotional|confidence',
 listening:'listening|analytical listening|attention|concentrate|focus|filtering|feedback',
 sound:'sound|audio|aural|prosody|fluency|speech rate|reading rate|pitch|falling intonation|rising intonation|stress|primary stress|voiced consonants|minimal pairs|voiceless|consonants|tone',
 presentation:'public speaking|extemporaneous speech|impromptu|prepared|audience|campaign|advocacy|persuasive writing|persuasive essay|persuasive|argumentative|argumentative essay|arguments|argument|rhetorical questions|claim|claims|claim of fact',
 conversation:'conversation|communication|communicative|communicative styles|styles|dialogue|interpersonal|consultative|situational|appropriate',
 formalTalk:'formal|formality',friendlyTalk:'intimate style',gesture:'gestural|gestures',
 reading:'reading|skimming|scanning|literature|literary|literary criticism|critic|critique|critiques|nonfiction|texts|text',
 writing:'writer|essay|academic writing|informative|informational|text types|narrative|explanation|expository|procedural|development|thesis sentence|thesis statement',
 editing:'accuracy|accuracy|correctness|complexity|precision|technical terms|terms|diction|adjective|adjectives|adverb|adverbs|modifier|modal adverbs|modal nouns',
 notes:'notes|information gathering|information|inform|documents|manuscript|observation',
 outline:'outline|sentence outline|topic outline|structure|introduction|body|conclusion|main idea|topic|general statement|statement|supporting details|label',
 summary:'summary|summarize|precis|paraphrase|main ideas|synthesizing|synthesis|synthesize|retells',
 connecting:'conjunctions|transitions|transition|transition signals|grammatical signals|signals|connecting|cohesive devices|cohesive|devices|connects|coherence|unity|pattern',
 sentence:'sentence|sentences|independent|subject|predicate|clauses|conditional sentence',phrase:'phrase|phrases|prepositional|dependent|dependent clause',noun:'noun',
 action:'verb|verbs|transitive|simple present',active:'voice|active',passive:'passive verb|passive',
 calendarPast:'simple past|tense|past|simple|past perfect|conditional perfect|reported speech|perfect|reported|direct|reporting|third',
 calendarFuture:'simple future|future|predicting|occurrence|result',conditional:'zero conditional|first conditional|second conditional|condition|conditionals|conditional|unreal',
 permission:'permission|can|may',prohibition:'prohibition',obligation:'obligation|must|modal|modal verbs|policy|certainty|possibility',
 research:'research|variables|theory|problem|solving|analysis|critical|statistics|data|source|sources|information source|print source|scholarly articles',
 evidence:'evidence|evidences|reliability|relevance|relevant|sufficient|extent|materials|presented|material',fact:'fact|facts|truth',opinion:'opinion|opinions|assertion|commonplace',
 scales:'bias|biases|prejudice|lean|disposition|unfair|favoritism|skewed|faulty|valid|invalid|generalization|generalizations',
 community:'social issues|moral issues|economic issues|society|problems|discrimination|heritage|values|experiences|wisdom',
 help:'poverty',crowd:'overpopulation',crime:'crime|stealing',
 stage:'viewing genre|opera|genre|play',cinema:'movies|news|trailer|video',story:'myth|plot|short story|story|characterization',
 character:'characters|character',setting:'setting|location',conflict:'internal conflict|external conflict|conflict|tension',resolution:'resolution',epic:'folk epic|epic|ramayana|rama|ravana',poetry:'poetry|prose|literary device|rhetorical device|figurative language|figurative|literal',
 drawing:'drawing',sculpture:'sculpture',search:'search engine|search|engine|keywords|sites|database',citation:'bibliography|citing|author|publication|plagiarism|cite',
 truth:'truthfulness',misleading:'misleading content|imposter content|fabricated content|fallacy',
 lineGraph:'line graph|graphs|graph',barGraph:'bar graph|charts',table:'table',mindMap:'mind mapping|venn diagram',map:'map',diagram:'textual aids|pictograph|visual representation|visuals|infographic|imagery',
 collage:'multimodal|multimodal texts|multimedia|slideshows|visual|linguistic|resources|elements|semiotic',machine:'technical definition|operational|technical|machine|wheels',expanded:'expanded definition|expanded|definitions|definition|examples|context clues|words',question:'questions|what|when|where|why'
};
export const normalizePictureTerm=(value:string)=>value.toLowerCase().trim().replace(/\s+/g,' ').replace(/[‐‑–—]/g,'-');
const catalogue=new Map<string,PictureScene>();
const additional:Partial<Record<PictureScene,string>>={table:'tables',stage:'entertain',summary:'synopsis',calendarPast:'timeliness|flashback',conflict:'cliffhanger|negativity',resolution:'positivity',question:'answer',presentation:'practice|counterclaim|techniques|leadership|delivering|propaganda|testimonial',writing:'thesis|formalist',conversation:'second person|messages|conveyed',reading:'linear text|linear|viewed|primary',scales:'objectivity|tendency',editing:'marking|grammatical',crowd:'bandwagon',truth:'glittering',conditional:'would|zero',obligation:'modals',community:'issues|scenarios'};
for(const [scene,terms] of Object.entries(additional))groups[scene as PictureScene]=(groups[scene as PictureScene]||'')+'|'+terms;
for(const [scene,terms] of Object.entries(groups))for(const term of terms!.split('|'))catalogue.set(normalizePictureTerm(term),scene as PictureScene);
catalogue.set('non-linear','mindMap');
catalogue.set('non-verbal','gesture');
catalogue.set('speeches','presentation');
catalogue.set('proverb','story');
catalogue.set('paragraph','writing');
catalogue.set('topic sentence','sentence');
export function pictureSceneFor(term:string,topic=''):PictureScene|undefined{
 const exact=catalogue.get(normalizePictureTerm(term));if(exact)return exact;
 // Topic scenes are reserved for the ungraded clue illustration, not for unmapped answers.
 if(!topic)return undefined;
 const key=normalizePictureTerm(topic);
 if(/listening|spoken|sound|suprasegmental/.test(key))return 'listening';
 if(/communic|speech|speaking|rhetorical/.test(key))return 'speech';
 if(/tense|conditional/.test(key))return 'conditional';
 if(/phrase|clause|sentence|verb|grammar|parallel/.test(key))return 'sentence';
 if(/story|literature|literary|epic|conflict|play/.test(key))return 'story';
 if(/sources|research|evidence|truth|bias|judgment|information/.test(key))return 'evidence';
 if(/visual|multimedia|multimodal|viewing/.test(key))return 'collage';
 if(/writing|paragraph|outline|essay|synthesi|summary|paraphrase/.test(key))return 'writing';
 if(/word|vocab|analogy|context|question|reading/.test(key))return 'expanded';
 return undefined;
}
