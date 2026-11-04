"""Build curriculum from locally downloaded originals; never synthesize teaching text.

Input: .curriculum-sources/inventory.json and <Drive ID>.json (page text + SHA256).
Discussion page selections are editorial, not inferred from a single heading.
Page numbers are 1-based PDF pages, including covers.
"""
import json, pathlib, re, hashlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCES = ROOT / '.curriculum-sources'
OUT = ROOT / 'src/data/curriculum/pdf'
OUT.mkdir(parents=True, exist_ok=True)

# Source labels, not array offsets. A range includes both endpoints.
DISCUSSION = {
 '7-1': {'1':'7,10-12','2':'14-17','3':'8-11','4':'11-13','5':'9-10','6':'10-12','7':'7-10','8':'8-11','9':'8-12','10':'9-11'},
 '7-2': {'1':'9,17,19,22','2':'10,19','3':'10-11','4':'9-10,22-25,35-38','7':'9-12,22'},
 '7-3': {'1':'9-11','2':'8-10','3':'8','4':'10-12','5':'11,17-18','6':'10-12','7':'9-11'},
 '7-4': {'1':'10-13','2':'9-12,15-17','3':'10-12','4':'8-13','5':'10-11','6':'8,11-12','7':'8','8':'10-12'},
 '8-1': {'1':'10-15','2':'11-21','3':'9-11,17-19,26-27','4':'9-13','5':'10-12,18-19,24-27'},
 '8-2': {'1':'13-20','2':'10-17','3':'10-14','4':'11-15','5':'12-25'},
 '8-3': {'1':'9-14','2':'11-22','3':'12-20','4':'12-21','5':'11-21','6':'10-15'},
 '8-4': {'1':'11-23','2':'11-21','3':'10-15','4':'10-20','5':'11-18','6':'13-18'},
 '9-1': {'1':'4-5','2':'5-6','3':'4-5','4':'4-5','5':'5-6','6':'3-5','7':'4-5','8':'4'},
 '9-2': {'1':'11-13,19-20','2':'13-14,18-20'},
 '9-3': {'1':'4-5','2':'4-5','3':'4','4-5':'3-4','6':'3-5','7':'4-5','8':'4-6'},
 '9-4': {'1':'9-11,16-17','2':'12-13','3':'10-12','4':'9-10','5':'8,13-14,17','6':'9,12','7':'7','8':'9','9':'9-10','11':'13-14,16','12':'8-10','13':'10-12','14':'8-12'},
 '10-1': {'1':'8-11','2':'8-12','3':'9-12','4':'12-15','5':'10-16','6':'11','7':'10-12','8':'10'},
 '10-2': {'1':'6-9','2':'9','3':'9-12','4':'9,15,21-22','5':'7-11','6':'8,10-13','7':'6-7,9-10','8':'9-11'},
 '10-3': {'1':'8-9,11,16-18','2a':'9-11','2b':'9-10,13-14','3':'9-11','4':'10'},
 '10-4': {'1':'9,11-13,17-18,23-24','2':'7-8,10','3':'8'},
}

# Start anchors select substantive discussion rather than introductory questions.
# Text after these anchors remains a direct source quotation, not a paraphrase.
START = {
 '7-1-1':'An analogy is', '7-1-2':'Viewing Genre is', '7-1-3':'Voice means that',
 '7-1-4':'The simple past is', '7-1-5':'The past perfect tense',
 '7-1-6':'Direct Speech repeats', '7-1-7':'Phrase is a group', '7-1-8':'A clause contains',
 '7-1-9':'It contains a subject', '7-1-10':'Skimming and Scanning are',
 '7-2-1':'Five Key Active Listening Techniques', '7-2-2':'A search engine is',
 '7-2-3':'Information', '7-2-4':'Summarization helps', '7-2-7':'Linear text refers',
 '7-3-1':'Multimedia means', '7-3-2':'Delivery refers', '7-3-3':'Folk epic is',
 '7-3-4':'BELIEF is', '7-3-5':'The general statement', '7-3-6':'A fact is', '7-3-7':'Wh-questions begin',
 '7-4-1':'Caulfield', '7-4-2':'Communication is', '7-4-3':'It simply means',
 '7-4-4':'According to the Canadian', '7-4-5':'In literature, a conflict',
 '7-4-6':'Characters', '7-4-7':'A short story is', '7-4-8':'The word essay is',
 '8-1-1':'Context clues', '8-1-2':'When you do your research', '8-1-3':'Modal Verbs are',
 '8-1-4':'Conjunctions that join', '8-1-5':'The underlined words are verbs',
 '8-2-1':'Visual-verbal illustrations are', '8-2-2':'Opinions refer', '8-2-3':'Multimodal Texts are',
 '8-2-4':'Comparing is', '8-2-5':'Generally, language is',
 '8-3-1':'Bias refers', '8-3-2':'Propaganda.', '8-3-3':'An issue is',
 '8-3-4':'Literature.', '8-3-5':'cohesive devices', '8-3-6':'Parallel Structure means',
 '8-4-1':'Idea development is', '8-4-2':'An outline is', '8-4-3':'Synthesizing',
 '8-4-4':'A paragraph is', '8-4-5':'Text types are', '8-4-6':'Speech is',
 '9-1-1':'A modal is', '9-1-2':'ZERO CONDITIONAL SENTENCES', '9-1-3':'First Conditional',
 '9-1-4':'A conditional sentence is', '9-1-5':'The third type of conditional',
 '9-1-6':'A conditional sentence', '9-1-7':'Communicative styles are', '9-1-8':'Every person has',
 '9-2-1':'Prose is', '9-2-2':'Rhetorical device is',
 '9-3-1':'Bias refers', '9-3-2':'In contemporary times', '9-3-3':'Agreeing or disagreeing',
 '9-3-4-5':'In making sound judgments', '9-3-6':'Evidence',
 '9-3-7':'In identifying the point', '9-3-8':'The steps',
 '9-4-1':'Modal verbs include', '9-4-2':'Social issues are', '9-4-3':'As the Oxford',
 '9-4-4':'It is a visual representation', '9-4-5':'A Fact is', '9-4-6':'Listening definitely',
 '9-4-7':'Bias', '9-4-8':'Generalization is', '9-4-9':'Fallacy',
 '9-4-11':'Shakespeare’s use of figurative', '9-4-12':'There are two ways',
 '9-4-13':'Minimal pairs are', '9-4-14':'human speech communication',
 '10-1-1':'Gonzalez', '10-1-2':'Textual aids refer', '10-1-3':'By definition, a film genre',
 '10-1-4':'The activity above shows', '10-1-5':'A print source is', '10-1-6':'Analytical listening is',
 '10-1-7':'A myth is', '10-1-8':'Fluency in speaking',
 '10-2-1':'RESEARCH', '10-2-2':'Conjunctions or connectors', '10-2-3':'An opinion is',
 '10-2-4':'Modal Verbs are', '10-2-5':'A claim', '10-2-6':'A rhetorical question',
 '10-2-7':'Multimodal', '10-2-8':'Public speaking occurs',
 '10-3-1':'An argumentative essay', '10-3-2a':'An informative text',
 '10-3-2b':'Persuasive writing is', '10-3-3':'A critique is', '10-3-4':'Literary Criticism is',
 '10-4-1':'Research is collecting', '10-4-2':'A technical definition is', '10-4-3':'Expanded definition is',
}

START.update({'7-1-6': 'Direct speech has quotation marks', '7-2-3': 'An information source is', '8-1-1': 'Context clues are words', '8-3-5': 'We can ensure that our ideas are linked together', '8-4-3': 'synthesizing is pulling', '9-1-5': 'Conditional sentence type 3 talks', '9-3-6': 'In an argument, evidence refers', '9-3-8': 'When analyzing pieces of evidence', '9-4-7': 'Bias – means', '9-4-9': 'Fallacy - it is', '10-2-1': 'Research starts with a question', '10-2-5': 'A claim is the main topic', '10-2-6': 'Rhetorical questions work like that', '10-2-7': 'Many texts are multimodal', '9-1-3': 'FIRST CONDITIONAL SENTENCES or FUTURE REAL CONDITIONAL'})

def numbers(spec):
 result=[]
 for part in spec.split(','):
  n=list(map(int,part.split('-')))
  result.extend(range(n[0],n[-1]+1))
 return result

def label(f):
 name=f['name']
 if f['grade']==9 and f['quarter'] in [1,3]:
  m=re.search(r'(?:Week[-_ ]*|W)(\d+)(?:_(\d+))?',name,re.I)
  n=m[1]+('-'+m[2] if m[2] else '')
  return n, 'Weeks '+n if '-' in n else 'Week '+n
 m=re.search(r'(?:module|mod|_M)[ _]*(\d+[ab]?)',name,re.I)
 n=m[1].lower()
 return n,'Module '+n.upper()

def clean(text):
 lines=[]
 for line in text.splitlines():
  s=line.strip()
  if re.search(r'CO[_ -]',s):continue
  if re.match(r'^UNIFIED SUPPLEMENTARY LEARNING MATERIALS|^Grade 9 (?:ENGLISH|English)$',s):continue
  if re.fullmatch(r'[ivx\d]+',s,re.I):continue
  # Blank answer lines are visual writing space, not instructional text.
  if re.fullmatch(r'[_.\s]{8,}',s):continue
  lines.append(s)
 return re.sub(r'\n{3,}','\n\n','\n'.join(lines)).strip()

def title(d):
 text=re.sub(r'\s+',' ',d['pages'][0]['text']).strip()
 if d['grade']==9 and d['quarter']==1:
  return re.split(r'First Quarter',re.split(r'ENGLISH 9 |English 9 ',text)[-1],flags=re.I)[0].strip()
 if d['grade']==9 and d['quarter']==3:
  text=re.split(r'\(USLeM\)\s*',text)[-1]
  text=re.sub(r'^English Grade 9\s*','',text)
  return re.split(r'(?:Third|Second) Quarter',text)[0].strip().title()
 text=re.split(r'CO[_ -]',text)[0]
 return re.split(r'Module\s*\d+[ab]?\s*[:;,\-]?\s*',text,maxsplit=1,flags=re.I)[-1].strip()

# Stop at actual major section boundaries on a mixed page; retain content before it.
BOUNDARY=re.compile(r'(?im)^\s*(What[’\x27]?s More|What I Have Learned|What I Can Do|Assessment(?: \(.*?\))?|Additional Activities|Answer Key|References?)\s*$')
SECTION=re.compile(r'(?im)^\s*(What I Need to Know|What[’\x27]?s New|What[’\x27]?s More|What I Have Learned|What I Can Do|Assessment(?: \(.*?\))?|Post[- ](?:Test|Assessment)|Additional Activities|Answer Key|References?|Expectation|Brief Introduction|Remember|Checking? Your Understanding|Pre[- ]Test|Looking Back|Activities?)\s*$')

def excerpt(page,text,kind):
 return {'page':page,'text':text,'kind':kind}

all_data=[]; audit=[]
inventory=json.loads((SOURCES/'inventory.json').read_text())
inventory.sort(key=lambda f:(f['grade'],f['quarter'],int(re.match(r'\d+',label(f)[0])[0]),label(f)[0]))
ordinal={}
for f in inventory:
 d=json.loads((SOURCES/(f['id']+'.json')).read_text())
 # Editorial transcription of text embedded as a figure, checked against rendered PDF page 11.
 if f['id']=='1O7Uz5PO8R7RBLJpxEIXqBY-YGV9sO-m1':
  d['pages'][10]['text']='The general statement is a main idea that is supported by specific statements or details. The main idea can be identified by asking: “What key point does the author want me to know about the topic?” We can identify the general statement or idea by asking: “Who is this all about?”, “What is this all about?”\n\nSupporting statements are the details or small ideas that reinforce the main idea or general statement. Supporting details are specific information such as facts, examples, reasons, facts or statistics that elaborate or explain about the general statement or main idea. Specific statements answer the who, what, where, when and why about the topic.\n\nThe general statement or main idea with its specific statements or supporting details are needed to organize a paragraph. The main idea or general statement may be directly stated in the paragraph, usually in the first or last sentence but not all the time.'
 n,source_label=label(f);key=f"{f['grade']}-{f['quarter']}-{n}"
 selected=numbers(DISCUSSION[f"{f['grade']}-{f['quarter']}"][n])
 concepts=[]
 for pn in selected:
  t=clean(d['pages'][pn-1]['text'])
  # Remove assessment/review tails, but not discussion following an earlier heading.
  b=BOUNDARY.search(t)
  if b and b.start()>80:t=t[:b.start()].strip()
  # Only strip the heading itself; some discussions genuinely precede "What Is It".
  t=re.sub(r'(?im)^\s*What\s*(?:is|[’\x27]s)\s+It\s*\??\s*$','',t).strip()
  if t:concepts.append(excerpt(pn,t,'discussion'))
 assert concepts,key
 # Flatten whitespace to obtain complete source sentences. No generation/paraphrasing.
 anchor=START[key];overview=None
 for c in concepts:
  flat=re.sub(r'\s+',' ',c['text'])
  pos=flat.lower().find(anchor.lower())
  if pos>=0:
   end=re.search(r'[.!?](?:[”\x27\"])?(?=\s|$)',flat[pos+len(anchor):])
   finish=pos+len(anchor)+end.end() if end else min(len(flat),pos+500)
   overview=excerpt(c['page'],flat[pos:finish],'overview');break
 if key=='9-1-3':overview=excerpt(4,'a possible situation in the future ✓ predicting a likely result in the future (if condition happens)','overview')
 if not overview:
  audit.append({'id':key,'problem':'overview anchor not found','anchor':anchor})
  overview=excerpt(concepts[0]['page'],re.sub(r'\s+',' ',concepts[0]['text'])[:500],'overview')
 # Classify original activities/review/keys, preserving page references and full passages.
 guided=[];checks=[];answers=[];objectives=[]
 active=None
 start_body=2 if d['grade']==9 and d['quarter'] in (1,3) else (4 if d['grade']==7 and d['quarter'] in (1,2) else 5)
 for p in d['pages'][start_body-1:]:
  t=clean(p['text']);matches=list(SECTION.finditer(t));offset=0
  pieces=[]
  for m in matches:
   if m.start()>offset:pieces.append((active,t[offset:m.start()].strip()))
   active=m[1].lower();offset=m.end()
  if offset<len(t):pieces.append((active,t[offset:].strip()))
  for section,body in pieces:
   if not body or not section:continue
   e=excerpt(p['page'],body,section)
   if section in ['answer key']:answers.append(e)
   elif section in ['what i need to know','expectation']:objectives.append(e)
   elif re.search(r'learned|assessment|post.test|checking|check your|remember',section):checks.append(e)
   elif re.search(r'new|more|can do|^activit',section):guided.append(e)
 # Week-format PDFs use graphic section headings that are not text-searchable.
 # Their activity and review pages are selected explicitly.
 if d['grade']==9 and d['quarter']==1:
  guided=[excerpt(pn,clean(d['pages'][pn-1]['text']),'activity') for pn in [6,7]]
  checks=[excerpt(pn,clean(d['pages'][pn-1]['text']),'self-check') for pn in [2,3,7,8,9]]
  objectives=[]
 if d['grade']==9 and d['quarter']==3 and n in ['7','8']:
  guided=[excerpt(6,clean(d['pages'][5]['text']),'activity')]
 # Definitions and reminders are complete excerpts of the same discussion, never generic advice.
 vocab=[];tips=[]
 for c in concepts:
  flat=re.sub(r'\s+',' ',c['text'])
  for m in re.finditer(r'(?:^|(?<=[.!?])\s+)([A-Z][A-Za-z -]{1,65})\s+(?:is|are|refers to|means)\s+[^.!?]+[.!?]',flat):
   if len(m[0])<650 and not re.match(r'(It|This|There|They|We|You|He|She|The following|In |For |Example)',m[1]):vocab.append(excerpt(c['page'],m[0].strip(),'definition'))
  for m in re.finditer(r'(?:Remember(?:!|:| that)|Note:|Take note)[^.!?\n]{15,500}[.!?]',flat,re.I):
   tips.append(excerpt(c['page'],m[0].strip(),'reminder'))
 # Summary is extractive: select complete source definition sentences, not new claims.
 summary=(vocab[:5] or [overview])
 notes=[]
 if key=='9-3-7':notes=['Filed in Grade 9 / Quarter 3 / Week 7. The PDF cover says “Second Quarter – Week 4.” Folder placement retained at the project owner’s request.']
 if key=='7-4-3':notes=['The PDF cover says Module 3; its running footer says Module 2. Mapping follows the cover and file name.']
 ordinal[f['grade']]=ordinal.get(f['grade'],0)+1
 module={'id':f"g{f['grade']}-q{f['quarter']}-{'w' if source_label.startswith('Week') else 'm'}{n}",
  'grade':f['grade'],'quarter':f['quarter'],'sourceNumber':n,'sourceLabel':source_label,
  'moduleNumber':ordinal[f['grade']],'quarterModuleIndex':int(re.match(r'\d+',n)[0]),
  'title':title(d),'source':{'fileId':f['id'],'fileName':f['name'],'url':'https://drive.google.com/file/d/'+f['id']+'/view',
  'sha256':d['sha256'],'pageCount':d['pageCount'],'notes':notes,'discussionPages':selected},
  'overview':overview,'concepts':concepts,'guidedAnalysis':guided,'pitfallsAndTips':tips,
  'vocabularyBank':vocab,'selfCheck':objectives+checks,'studyCheatsheet':summary,'answerKey':answers}
 for c in module['concepts']:c['image']='/curriculum/'+f['id']+'-p'+str(c['page'])+'.webp'
 all_data.append(module)

for grade in range(7,11):
 for quarter in range(1,5):
  data=[m for m in all_data if m['grade']==grade and m['quarter']==quarter]
  (OUT/f'g{grade}q{quarter}.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(SOURCES/'editorial-audit.json').write_text(json.dumps(audit,indent=2))
print('Built',len(all_data),'PDF-backed modules; overview anchors needing review:',len(audit))
for a in audit:print(a)
