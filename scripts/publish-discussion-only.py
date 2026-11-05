"""Publish only instructional discussion. Preserve the separate, reviewed five-question game banks."""
from pathlib import Path
import json,re,hashlib
R=Path(__file__).resolve().parents[1];B=R/'public/assets/curriculum/content'
# Mixed discussion/exercise pages reviewed against their original PDF text.
DROP={
'g7-q2-m4':{'1186b4fe311feb958c17','a29351629adfc15d4b29','7ab4971cf51b2edda79a','43f9fc78f34144bd94b9','7b613aedf07ce004a890','e862c7c08d13136c8255','ac2cd369ac1958eec5dc','da40686bd3e1635d8daf'},
'g7-q2-m7':{'d5a752a8196470e41eef','eb9c981728d5e1c77166','e80f7506a1eb02d8539c','00f2104460a5bd5e380d','5ebe5a3bcdc4365069bb','56af563d05ef583bd6e6','5406d2b06bb2d3b15c64','37cec41495da2a1f32bf'},
'g10-q3-m3':{'645b81e519d29d130a50','73da8935f647c3aae0b2','0b6c4c708e229bf2af73','7f6e841a85da9482736f','9cab046d68e494425beb','84dec72d004075ff4b49','da8746709dbe6e4dec0a'},
'g9-q4-m4':{'5adc10bb1862adb54c71','9ba5035096af3511a7e2','9c26afc6ea47c95eb4d4','5541e2b547e135644037'},
'g10-q2-m3':{'e79fcaa34412ade67fff'},
'g7-q1-m10':{'96944cd2d3d3bfe7f0ce'},
'g7-q4-m6':{'976fe409a23e2ae5ac19'},
}
REPLACE={
'44ab37e8dc854a93f0a3':'Finally, here are some additional reminders that budding critics need to take note of when writing a critique:',
'e2852617befb862311ac':'complete. There are other minor yet necessary details to include, and everything must be properly organized into a cohesive essay. Structure is equally important.',
'7f3a2ad5846355bead56':'non-linear and vice-versa.',
}
CLARIFICATIONS={
'g7-q2-m4':dict(text='Paraphrasing changes wording and sentence structure while preserving the original meaning. Replacing only individual words with synonyms may leave the result too close to the original.',url='https://www.scribbr.com/citing-sources/how-to-paraphrase/',resolvedUrl='https://www.scribbr.com/working-with-sources/how-to-paraphrase/',publisher='Scribbr',title='How to Paraphrase'),
'g10-q1-m8':dict(text='Fluency concerns smooth communication. A speaker can communicate ideas clearly and naturally while still making some language mistakes.',url='https://learnenglishteens.britishcouncil.org/exams/speaking-exams/fluency',publisher='British Council',title='Fluency'),
'g10-q3-m2a':dict(text='Informative writing explains a topic with balanced factual information. Persuasive writing aims to gain agreement with a viewpoint, supporting that viewpoint with facts.',url='https://capella.libanswers.com/writingcenter/faq/260905',publisher='Capella University Writing Center',title='What is the difference between informative and persuasive writing?'),
}
report=[]
for path in sorted((R/'src/data/curriculum/pdf').glob('*.json')):
 modules=json.loads(path.read_text())
 for m in modules:
  p=B/(m['id']+'.json');d=json.loads(p.read_text());games_before=hashlib.sha256(json.dumps(d['games'],sort_keys=True).encode()).hexdigest();s=next(s for s in d['sourceSections'] if s['kind']=='discussion');removed=[];entries=[]
  for entry in s['entries']:
   ids=[]
   for bid in entry['blockIds']:
    if bid in DROP.get(m['id'],set()) or (m['id']=='g7-q4-m1' and entry['page']<8) or (m['id']=='g9-q4-m4' and entry['page']==10):removed.append(bid);continue
    block=d['blocks'][bid]
    if bid in REPLACE:block['text']=REPLACE[bid]
    # Strip URL-only credits and printed link fragments from the discussion, not illustrations/assets.
    if block.get('text') and re.match(r'^(?:Source\s*:?\s*)?(?:https?://|www\.)',block['text'],re.I):removed.append(bid);continue
    if block.get('text') and re.match(r'^(?:EwjQx6|centimeters-distribution|q55782803|Ed6D3n|uVbbiuk)',block['text']):removed.append(bid);continue
    if m['id']=='g8-q3-m5' and bid=='a36e10d62f61ae337b0f':block['text']=block['text'].replace('The passages are followed by questions. Try answering it on your own. Enjoy learning!','')
    if m['id']=='g7-q1-m7' and bid=='71ddbcfbdd6861b52d26':block['text']=block['text'][block['text'].index('A phrase is'):]
    ids.append(bid)
   if ids:entries.append({'page':entry['page'],'blockIds':ids})
  s['entries']=entries
  if m['id']=='g7-q4-m1':
   b=d['blocks']['9062f05daf2859df271c'];m['overview']={'page':b['page'],'text':b['text'],'kind':'discussion'}
  if m['id'] in CLARIFICATIONS:
   extra=CLARIFICATIONS[m['id']];bid='reference-clarification';d['blocks'][bid]={'type':'paragraph','page':m['overview']['page'],'text':extra['text'],'reference':{k:v for k,v in extra.items() if k!='text'},'provenanceKind':'printed-bibliography-reference'}
   if not any(bid in e['blockIds'] for e in entries):entries.append({'page':m['overview']['page'],'blockIds':[bid]})
  d['sourceSections']=[s];m['sourceSections']=[{'id':'concepts','title':'Concepts & Rules','kind':'discussion','pages':list(dict.fromkeys(e['page'] for e in entries))}];m['source']['discussionPages']=m['sourceSections'][0]['pages']
  m['concepts']=[];d['excerptBlocks']={}
  for entry in entries:
   text='\n\n'.join(d['blocks'][k].get('text','') for k in entry['blockIds'] if d['blocks'][k].get('text'))
   if text:d['excerptBlocks']['concepts:'+str(len(m['concepts']))]=entry['blockIds'];m['concepts'].append({'page':entry['page'],'text':text,'kind':'discussion'})
  used={k for e in entries for k in e['blockIds']};d['blocks']={k:v for k,v in d['blocks'].items() if k in used}
  assert games_before==hashlib.sha256(json.dumps(d['games'],sort_keys=True).encode()).hexdigest()
  p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n');report.append({'moduleId':m['id'],'discussionPages':m['source']['discussionPages'],'removedEmbeddedExerciseBlocks':removed,'referenceClarification':CLARIFICATIONS.get(m['id'])})
 path.write_text(json.dumps(modules,ensure_ascii=False,indent=2)+'\n')
(R/'docs/curriculum/discussion-only-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('Discussion-only modules:',len(report))
