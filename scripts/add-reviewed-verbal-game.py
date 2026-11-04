"""Source-reviewed term recall for the analogy PDF; no invented clue sentences."""
import pathlib,json,re,hashlib
r=pathlib.Path(__file__).resolve().parents[1];p=r/'public/curriculum/content/g7-q1-m1.json';d=json.loads(p.read_text());raw=json.loads((r/'.curriculum-sources'/(d['fileId']+'.json')).read_text())
items=[('Analogy',7,'An analogy is a comparison between two different and unrelated things to highlight a similarity between the two.'),('Antonyms',10,'If you say that the pairs show an opposite relationship','Antonyms.'),('Synonyms',10,'the pairs show a similar relationship','Synonyms.'),('Location',11,'If you say yes, then you are correct as sea and forest','type of analogy.'),('metaphor',11,'A metaphor is a figure of speech','another...'),('simile',11,'A simile is a figure of speech','two different things.')]
reviewed=[]
for item in items:
 term,page,start,*end=item;text=re.sub(r'\s+',' ',raw['pages'][page-1]['text'])
 assert start in text,(term,start)
 a=text.index(start);quote=start if not end else text[a:text.index(end[0],a)+len(end[0])]
 assert term.lower() in quote.lower(),term
 reviewed.append((term,page,quote))
for term,page,quote in reviewed:
 sid=hashlib.sha256((quote.lower()+'|'+term.lower()).encode()).hexdigest()[:16]
 mask=re.sub(re.escape(term),'____',quote,count=1,flags=re.I)
 source={'fileId':d['fileId'],'page':page,'quote':quote,'answerQuote':next(x.group(0) for x in re.finditer(re.escape(term),quote,re.I)),'sourceId':sid,'kind':'reviewed-source-term'}
 for mode in ['typeHunter','missingPiece','crosswordGame']:
  d['games']=[q for q in d['games'] if not(q['type']==mode and q['answer'].lower()==term.lower())]
  q={'id':'g7-q1-m1-reviewed-'+mode+'-'+sid,'type':mode,'difficulty':'easy','prompt':'Complete the source statement using the PDF’s term.','contextSentence':mask,'answer':term,'explanation':quote,'timeLimitSeconds':45,'source':source}
  if mode=='missingPiece':q['options']=[term]+[x[0] for x in reviewed if x[0].lower()!=term.lower()][:3]
  if mode=='crosswordGame':q['crosswordClue']={'direction':'ACROSS','clueNumber':1,'wordLength':len(term),'cluePrompt':mask}
  d['games'].append(q)
p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n');print('Reviewed source terms:',len(reviewed))

meta=r/'src/data/curriculum/pdf/g7q1.json'
lessons=json.loads(meta.read_text());lesson=next(m for m in lessons if m['id']=='g7-q1-m1')
lesson['vocabularyBank']=[{'term':term,'page':page,'text':quote,'kind':'definition'} for term,page,quote in reviewed]
for key in list(d['excerptBlocks']):
 if key.startswith('vocabularyBank:'):del d['excerptBlocks'][key]
for i,(term,page,quote) in enumerate(reviewed):
 key='reviewed-vocabulary-'+str(i);d['blocks'][key]={'type':'paragraph','page':page,'text':quote};d['excerptBlocks']['vocabularyBank:'+str(i)]=[key]
meta.write_text(json.dumps(lessons,ensure_ascii=False,indent=2)+'\n')
p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
