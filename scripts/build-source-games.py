"""Compile recall tasks from explicit PDF definitions and printed analogies only.

No generated facts, distractor sentences, answer-key guesses or cross-module items.
Each answer is a literal term in its own cited source statement. Insufficient banks
are reported for review; they are never padded to five.
"""
import pathlib,json,re,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
norm=lambda s:re.sub(r'\s+',' ',s).strip()
banks={};reports=[]
for path in sorted((ROOT/'src/data/curriculum/pdf').glob('*.json')):
 for m in json.loads(path.read_text()):
  definitions=[];seen=set()
  for e in m['vocabularyBank']:
   text=norm(e['text'])
   term=e.get('term','').strip()
   if not term or term.lower() not in text.lower():continue
   if term.lower() in seen:continue
   seen.add(term.lower());definitions.append({'term':term,'quote':text,'page':e['page']})
  questions=[]
  for item in definitions:
   term=item['term'];quote=item['quote'];page=item['page']
   sid=hashlib.sha256((quote.lower()+'|'+term.lower()).encode()).hexdigest()[:16]
   source={'fileId':m['source']['fileId'],'page':page,'quote':quote,'answerQuote':term,'sourceId':sid,'kind':'definition-recall'}
   candidates=[d['term'] for d in definitions if d['term'].lower()!=term.lower()][:3]
   cloze=re.sub(re.escape(term),'____',quote,count=1,flags=re.I)
   base={'difficulty':'easy','answer':term,'explanation':quote,'timeLimitSeconds':45,'source':source}
   questions.append({**base,'id':m['id']+'-type-'+sid,'type':'typeHunter','prompt':'Type the PDF term that completes this source statement.','contextSentence':cloze})
   if len(candidates)==3:
    questions.append({**base,'id':m['id']+'-missing-'+sid,'type':'missingPiece','prompt':'Complete the statement using the PDF’s term.','contextSentence':cloze,'options':[term]+candidates})
   if re.fullmatch(r'[A-Za-z]{3,18}',term):
    questions.append({**base,'id':m['id']+'-crossword-'+sid,'type':'crosswordGame','prompt':'Complete the word grid using the source definition.','crosswordClue':{'direction':'ACROSS','clueNumber':1,'wordLength':len(term),'cluePrompt':cloze}})
  analogy=[];pair_seen=set()
  for e in m['concepts']+m['guidedAnalysis']:
   for line in e['text'].splitlines():
    # Require all four terms printed together; never solve an unanswered analogy.
    match=re.search(r'\b([A-Za-z]+(?: [A-Za-z]+){0,2})\s*:\s*([A-Za-z]+(?: [A-Za-z]+){0,2})\s*::\s*([A-Za-z]+(?: [A-Za-z]+){0,2})\s*:\s*([A-Za-z]+(?: [A-Za-z]+){0,2})(?=[.,;()\s]*$)',line.strip())
    if not match:continue
    a,b,c,d=[s.strip() for s in match.groups()];quote=match[0].strip();key=(a.lower(),b.lower(),c.lower(),d.lower())
    if key in pair_seen:continue
    pair_seen.add(key);analogy.append({'a':a,'b':b,'c':c,'d':d,'page':e['page'],'quote':quote})
  for item in analogy:
   sid=hashlib.sha256(item['quote'].lower().encode()).hexdigest()[:16]
   choices=list(dict.fromkeys([item['d']]+[x['d'] for x in analogy if x['d'].lower()!=item['d'].lower()]))[:4]
   if len(choices)<2:continue
   questions.append({'id':m['id']+'-analogy-'+sid,'type':'analogyMaster','difficulty':'easy','prompt':'Complete the analogy printed in the PDF.','analogyPair':{'firstA':item['a'],'firstB':item['b'],'secondC':item['c'],'relationshipType':''},'options':choices,'answer':item['d'],'explanation':item['quote'],'timeLimitSeconds':45,'source':{'fileId':m['source']['fileId'],'page':item['page'],'quote':item['quote'],'answerQuote':item['d'],'sourceId':sid,'kind':'printed-analogy'}})
  banks[m['id']]=questions
  target=ROOT/'public/curriculum/content'/(m['id']+'.json')
  content=json.loads(target.read_text());content['games']=questions;target.write_text(json.dumps(content,ensure_ascii=False,separators=(',',':'))+'\n')
  counts={mode:len([q for q in questions if q['type']==mode]) for mode in ['typeHunter','missingPiece','crosswordGame','analogyMaster','pictureHunt']}
  reports.append({'moduleId':m['id'],'grade':m['grade'],'quarter':m['quarter'],'sourceLabel':m['sourceLabel'],'pdf':m['source']['fileName'],'modes':{mode:{'verified':count,'status':'ready' if count>=5 else 'needs-source-review','reason':'' if count>=5 else 'Fewer than five validated items. Additional PDF activities/keys or visual mappings require source review.'} for mode,count in counts.items()}})

(ROOT/'docs/source-game-review.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n')
print('Question items:',sum(map(len,banks.values())),'Modules:',len(banks))
print('Ready module/mode banks:',sum(x['status']=='ready' for r in reports for x in r['modes'].values()),'of',len(reports)*5)
