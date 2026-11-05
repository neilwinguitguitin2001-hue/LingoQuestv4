"""Build source-completion challenges from module-specific, literal PDF evidence.
Difficulty changes scaffolding and response constraints, never the source facts.
"""
from pathlib import Path
import json,re,hashlib,collections
R=Path(__file__).resolve().parents[1];RAW=R.parent/'lingoquest-v4/.curriculum-sources'
TARGETS={line.split('|')[0]:line.strip().split('|')[1].split(',') for line in (R/'scripts/curriculum/game-topic-targets.txt').read_text().splitlines() if '|' in line}
def norm(t):return re.sub('[^a-z0-9]','',t.lower())
def clean(t):return re.sub(r'\s+',' ',t).strip()
def match(term,text):return re.search(r"(?<![A-Za-z\-])"+re.escape(term)+r"(?![A-Za-z]|[-'’][A-Za-z])",text,re.I)
def digest(t):return hashlib.sha256(t.encode()).hexdigest()[:20]
modules=[m for p in sorted((R/'src/data/curriculum/pdf').glob('*.json')) for m in json.loads(p.read_text())];anchors=[];failed=[]
for m in modules:
 raw=RAW/(m['source']['fileId']+'.pdf');assert hashlib.sha256(raw.read_bytes()).hexdigest()==m['source']['sha256']
 pages={p['page']:clean(p['text']) for p in json.loads((RAW/(m['source']['fileId']+'.json')).read_text())['pages']};d=json.loads((R/'public/assets/curriculum/content'/(m['id']+'.json')).read_text());quotes=[]
 for e in m['vocabularyBank']:
  if norm(e['text']) in norm(pages[e['page']]):quotes.append((0,e['page'],clean(e['text'])))
 for b in d['blocks'].values():
  if b.get('provenanceKind'):continue
  t=clean(b.get('text',''))
  if b['type'] in ['paragraph','heading'] and 5<=len(t.split())<=110 and norm(t) in norm(pages[b['page']]):quotes.append((1,b['page'],t))
 # Use full PDF definitions when sparse publication sections omit explanatory material.
 for page,text in pages.items():
  if page<5:continue
  for sentence in re.split(r'(?<=[.!?])\s+|(?<=;)\s+',text):
   sentence=clean(sentence)
   if not 5<=len(sentence.split())<=85 or re.search(r'_{2,}|\?|https?://|\b(?:Directions|Instructions|Choose|Write your|Read the following|Answer|True or False|Activity|Assessment)\b',sentence,re.I):continue
   if re.search(r'\b(?:is|are|means|refers|tells|explains|retells|lists|shows|represents|presents|include|includes|uses|describes|express|expresses)\b',sentence,re.I):quotes.append((2,page,sentence))
 chosen=[]
 for term in TARGETS[m['id']]:
  found=[]
  for rank,page,quote in quotes:
   hit=match(term,quote)
   if hit and not re.search(r'_{2,}|Activity #|Choose the|letter of|Which of|For numbers',quote,re.I):
    if term.lower() in {'fact','opinion','bias'} and len(quote.split())>65:continue
    found.append((rank,len(quote),page,quote,hit.group()))
  if found:
   rank,_,page,quote,actual=min(found);chosen.append({'term':actual,'quote':quote,'page':page,'selection':'reviewed-definition' if rank==0 else 'discussion-excerpt' if rank==1 else 'native-PDF-explanatory-sentence'})
  if len(chosen)==5:break
 if len(chosen)<5:failed.append((m['id'],len(chosen),[a['term'] for a in chosen]))
 anchors.append({'moduleId':m['id'],'title':m['title'],'fileId':m['source']['fileId'],'pdfSha256':m['source']['sha256'],'anchors':chosen})
(R/'docs/curriculum/tiered-game-anchors.json').write_text(json.dumps(anchors,indent=2,ensure_ascii=False)+'\n')
print('Anchor coverage',collections.Counter(len(r['anchors']) for r in anchors));print('Needs authoring',failed)

if failed:raise SystemExit("Some modules still need target authoring; no source bank published.")
(R/'src/data/curriculum/quizLearningTargets.json').write_text(json.dumps(anchors,ensure_ascii=False,separators=(',',':'))+'\n')
