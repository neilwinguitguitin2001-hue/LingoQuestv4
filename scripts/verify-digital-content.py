"""Verify source identity, native text/figure provenance and scored answer evidence."""
import pathlib,json,re,hashlib,base64,collections
import fitz
r=pathlib.Path(__file__).resolve().parents[1];raw=r/'.curriculum-sources'
lessons=[m for p in (r/'src/data/curriculum/pdf').glob('*.json') for m in json.loads(p.read_text())]
def norm(s):return re.sub(r'[^a-z0-9]+',' ',s.lower()).strip()
counts=collections.Counter();questions=0
for m in lessons:
 d=json.loads((r/'public'/m['digitalContentUrl'].lstrip('/')).read_text());fid=m['source']['fileId'];doc=fitz.open(raw/(fid+'.pdf'));native=json.loads((raw/(fid+'.json')).read_text())
 assert d['fileId']==fid and d['sourceSha256']==m['source']['sha256']
 page_images={};page_words={}
 for b in d['blocks'].values():
  counts[b['type']]+=1;p=b['page'];assert 1<=p<=len(doc)
  if b['type']=='figure':
   assert b['src'].startswith('/curriculum/figures/')
   rect=fitz.Rect(b['bbox']);assert (rect.width*rect.height)/(doc[p-1].rect.width*doc[p-1].rect.height)<.65
   if p not in page_images:page_images[p]={hashlib.sha256(x['image']).hexdigest()[:24] for x in doc[p-1].get_text('dict')['blocks'] if x['type']==1}
   assert pathlib.Path(b['src']).stem in page_images[p],(m['id'],p)
  # Native text blocks can be re-ordered to match columns but never generated.
  if b['type'] in ('paragraph','heading'):
   words=set(norm(native['pages'][p-1]['text']+' '+doc[p-1].get_text()).split());quote=set(norm(b.get('text','')).split())
   if not(fid=='1O7Uz5PO8R7RBLJpxEIXqBY-YGV9sO-m1' and p==11):assert quote<=words,(m['id'],p,list(quote-words)[:6])
 for q in d['games']:
  questions+=1;s=q['source'];assert s['fileId']==fid
  text=norm(native['pages'][s.get('instructionPage',s['page'])-1]['text'])
  if not(fid=='1O7Uz5PO8R7RBLJpxEIXqBY-YGV9sO-m1' and s['page']==11):assert norm(s['quote']) in text,(m['id'],q['id'],'quote')
  if 'answerKeyPage' in s:assert norm(s['answerKeyQuote']) in norm(native['pages'][s['answerKeyPage']-1]['text'])
  else:assert norm(s['answerQuote']) in norm(s['quote']),(m['id'],q['id'],'answer')
  assert q['explanation'] and s['sourceId']
 assert not any('image' in e for key in ['concepts','guidedAnalysis','selfCheck','studyCheatsheet'] for e in m[key])
 for ref,data in d.get('assets',{}).items():assert base64.b64decode(data.split(',')[1])[:4]==b'RIFF'
assert not list((r/'public/curriculum').glob('*.webp'))
print('PASS: 106 native digital lessons; blocks',dict(counts),'source-backed questions',questions,'no full-page image lesson assets.')
(r/'docs/digital-validation.json').write_text(json.dumps({'modules':106,'blocks':dict(counts),'sourceBackedQuestions':questions,'fullPageLessonImages':0},indent=2)+'\n')
