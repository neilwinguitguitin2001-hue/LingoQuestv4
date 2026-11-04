"""Editorial term allowlist: filter incidental sentences/questions from vocabulary.
Every published term must occur in the definition's own PDF wording; no new definitions.
"""
import pathlib,json,re,hashlib
r=pathlib.Path(__file__).resolve().parents[1]
TERMS='''g7-q1-m1|analogy|metaphor|simile|antonyms|synonyms|location
g7-q1-m2|viewing genre|audience|genre
g7-q1-m3|voice|active voice|passive voice|verb|passive verb
g7-q1-m4|simple past
g7-q1-m5|past perfect|conditional perfect|reported speech
g7-q1-m6|direct speech|reported speech|reporting verb
g7-q1-m7|phrase|noun phrase|verb phrase|gerund phrase|infinitive|prepositional phrase
g7-q1-m8|clause|independent clause|dependent clause
g7-q1-m9|sentence|subject|predicate|dependent clause
g7-q1-m10|skimming|scanning
g7-q2-m1|listening|active listening|familiarity
g7-q2-m2|search engine|keyword|browser
g7-q2-m3|information source|encyclopedia|journal|database
g7-q2-m4|summary|summarize|precis|précis|paraphrase|paraphrasing
g7-q2-m7|linear text|non-linear text|transcoding
g7-q3-m1|multimedia|interactivity|animation|audio|video
g7-q3-m2|speech delivery|delivery|verbal communication|extemporaneous speech
g7-q3-m3|folk epic
g7-q3-m4|belief|conviction|powerpoint|drawing|painting|photograph|film|sculpture
g7-q3-m5|general statement|supporting details|supporting statements|evidence
g7-q3-m6|fact|opinion
g7-q3-m7|wh-questions|thought-provoking questions
g7-q4-m1|academic writing|accuracy|objectivity
g7-q4-m2|communication|interpersonal communication|verbal communication|non-verbal communication|non- verbal communication|conversation|dialogue|open-ended questions|interview
g7-q4-m3|filtering|important information|interesting information
g7-q4-m4|truth|accuracy|misleading content|imposter content|fabricated content
g7-q4-m5|internal conflict|external conflict|conflict|character
g7-q4-m6|characters|plot|conflict|resolution|setting|theme
g7-q4-m7|short story|setting|characterization|plot
g7-q4-m8|essay|informative essay|thesis statement
g8-q1-m1|context clues|mallet|smite|shiver|writhing|cunning|foundry|rekindled
g8-q1-m2|bibliography|citation|plagiarism
g8-q1-m3|modal verbs|modal nouns|modal adverbs|modality
g8-q1-m4|transition signals|conjunctions
g8-q1-m5|must|emotional response|adjective|adverb|verb
g8-q2-m1|visual-verbal illustrations|graph|line graph|bar graph|table|map|chart|pie chart|flowchart|infographic|concept map
g8-q2-m2|opinion|opinion-marking signals
g8-q2-m3|diversity|multimodal texts|infographics
g8-q2-m4|opinion|comparing|contrasting|graphic organizer
g8-q2-m5|sarcasm|proverb|literal|figurative
g8-q3-m1|bias|diction
g8-q3-m2|propaganda|virtue words|bandwagon|testimonial|name-calling
g8-q3-m3|issue|crime|poverty|moral issues|social issues|economic issues|stealing
g8-q3-m4|literature|fiction|non-fiction|narrator|characters
g8-q3-m5|synonyms|pronoun|cohesive device|cohesive devices|clauses
g8-q3-m6|parallel structure
g8-q4-m1|idea development|grammatical signals|pattern of idea development|general idea|claim|problem-solution
g8-q4-m2|outline|topic outline|sentence outline|supporting details|primary source|secondary source
g8-q4-m3|synthesis|synthesizing|summarize|paraphrase|analyze|infer
g8-q4-m4|paragraph|topic sentence|unity|coherence|development
g8-q4-m5|text types|expository text|narrative|explanation|persuasive
g8-q4-m6|speech|good speech
g9-q1-w1|modal|permission|obligation|prohibition
g9-q1-w2|zero conditional|if clause|main clause
g9-q1-w3|first conditional
g9-q1-w4|conditional sentence|second conditional
g9-q1-w5|conditional sentence|third type of conditional sentence
g9-q1-w6|conditional sentence|condition|second conditional|third conditional|arguments
g9-q1-w7|communicative styles|speech style
g9-q1-w8|consultative style|casual style|intimate style
g9-q2-m1|prose|poetry|repetition|rhythm|adverb
g9-q2-m2|rhetorical device|literary device|tone|venn diagram|inference
g9-q3-w1|bias|prejudice
g9-q3-w2|evaluation|main idea|supporting idea
g9-q3-w3|agreement|disagreement
g9-q3-w4-5|relevance|accuracy|bias|reliability
g9-q3-w6|argument|evidence|facts|statistics|quotes|anecdotes
g9-q3-w7|main idea|claim|evidence
g9-q3-w8|evidence|claim|sufficient|relevant|representative
g9-q4-m1|descriptive words|modifier|adjective|adverb|modal
g9-q4-m2|social issues
g9-q4-m3|metaphor|allegory|simile|parable|personification
g9-q4-m4|infographic
g9-q4-m5|fact|opinion|nonfiction
g9-q4-m6|listening
g9-q4-m7|bias|prejudice
g9-q4-m8|generalization|valid generalization|faulty generalization
g9-q4-m9|fallacy|fact|opinion|bias|context clues
g9-q4-m11|figurative language|theme
g9-q4-m12|verbal communication|non-verbal communication
g9-q4-m13|voiced consonants|minimal pairs
g9-q4-m14|pitch|falling intonation|rising intonation|stress|primary stress|minimal or weak stress|secondary stress|juncture
g10-q1-m1|information gathering|mind mapping method|informational listening|listening
g10-q1-m2|textual aids
g10-q1-m3|genre|comedy|drama|subtext
g10-q1-m4|revelry|medusa|perseus|zeus
g10-q1-m5|print source|scholarly articles|accuracy
g10-q1-m6|analytical listening|validity|evidences
g10-q1-m7|myth|theme|persuasive essay
g10-q1-m8|accuracy|reading rate|prosody|fluency|speech rate|cohesion|coherence|tone
g10-q2-m1|significance|treatment|conclusion|observation|advocacy|campaign
g10-q2-m2|conjunctive adverbs|conjunctions|transitions
g10-q2-m3|opinion|opinion statement|commonplace assertion
g10-q2-m4|modal verbs|modal adverbs|argumentative essay|thesis statement
g10-q2-m5|claim|claim of fact|claim of value|claim of policy
g10-q2-m6|rhetorical questions
g10-q2-m7|linguistic mode|linguistic|multimodal|emojis
g10-q2-m8|public speaking|audience|speaker
g10-q3-m1|argumentative essay|argumentative essay writing|claim
g10-q3-m2a|informative text|topic|thesis statement|thesis sentence
g10-q3-m2b|persuasive writing|argumentative writing
g10-q3-m3|critique|structure
g10-q3-m4|literary criticism|critic|character|tone|narrator|second person
g10-q4-m1|research|concept|theory|variables|population|emphasis
g10-q4-m2|technical definition|operational definition
g10-q4-m3|expanded definition|expanded definitions'''
allow={row.split('|')[0]:row.split('|')[1:] for row in TERMS.splitlines()}
backup=r/'.curriculum-sources/vocabulary-before-digital-review.json'
files=list((r/'src/data/curriculum/pdf').glob('*.json'));modules=[m for p in files for m in json.loads(p.read_text())]
if not backup.exists():backup.write_text(json.dumps({m['id']:m['vocabularyBank'] for m in modules},ensure_ascii=False))
old=json.loads(backup.read_text());count=0
for path in files:
 data=json.loads(path.read_text())
 for m in data:
  glossary=[];seen=set()
  for e in old[m['id']]:
   text=re.sub(r'\s+',' ',e['text']).strip();prefix=re.split(r'\b(?:is|are|means|refers to)\b',text,maxsplit=1)[0].lower()
   # Longer named concepts take precedence over a generic word inside the term.
   for term in sorted(allow[m['id']],key=len,reverse=True):
    if term not in seen and re.search(r'(?<!\w)'+re.escape(term)+r'(?!\w)',prefix):
     actual=re.search(re.escape(term),text,re.I).group(0)
     glossary.append({**e,'term':actual});seen.add(term);break
  m['vocabularyBank']=glossary
  candidates=[m['overview']]+glossary[:5];seen_quotes=set();summary=[]
  for e in candidates:
   if e['text'] in seen_quotes:continue
   seen_quotes.add(e['text']);summary.append(e)
  m['studyCheatsheet']=summary;count+=len(glossary)
  target=r/'public/curriculum/content'/(m['id']+'.json')
  if target.exists():
   d=json.loads(target.read_text())
   for section in ['vocabularyBank','studyCheatsheet']:
    for k in list(d['excerptBlocks']):
     if k.startswith(section+':'):del d['excerptBlocks'][k]
    for i,e in enumerate(m[section]):
     block={'type':'paragraph','text':e['text'],'page':e['page']};bid=hashlib.sha256(json.dumps(block,sort_keys=True).encode()).hexdigest()[:20];d['blocks'][bid]=block;d['excerptBlocks'][section+':'+str(i)]=[bid]
   used={b for refs in d['excerptBlocks'].values() for b in refs};d['blocks']={k:v for k,v in d['blocks'].items() if k in used}
   target.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
 path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Source-reviewed vocabulary definitions:',count,'modules:',len(modules))
