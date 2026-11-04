"""Conservatively retain instructional definitions; quarantine assessment prompts and misclassified fragments.

Exact source wording remains in the lesson/assessment sections. No replacement definitions or answers are generated.
"""
import pathlib,json,re
r=pathlib.Path(__file__).resolve().parents[1]
EXCLUDE={
'g10-q1-m1':['listening'],'g10-q1-m4':['Perseus','revelry','Zeus','Medusa'],'g10-q1-m5':['accuracy'],'g10-q1-m7':['theme'],
'g10-q1-m8':['Coherence','Cohesion'],'g10-q2-m2':['conjunctive adverbs'],'g10-q2-m3':['opinion statement'],'g10-q2-m4':['thesis statement'],
'g10-q2-m5':['claim'],'g10-q2-m7':['Linguistic','linguistic mode'],'g10-q2-m8':['speaker','audience'],'g10-q3-m1':['Argumentative essay writing'],
'g10-q3-m2a':['topic','thesis statement'],'g10-q3-m2b':['Argumentative writing'],'g10-q3-m3':['Structure'],'g10-q3-m4':['Character','narrator'],
'g10-q4-m1':['Research','Emphasis','population'],'g10-q4-m2':['Operational definition'],'g10-q4-m3':['Expanded definitions'],
'g7-q1-m2':['audience'],'g7-q1-m3':['verb'],'g7-q1-m6':['direct speech','Reported Speech','reporting verb'],
'g7-q1-m7':['gerund phrase','Infinitive'],'g7-q1-m10':['Skimming'],'g7-q2-m1':['listening','Active listening'],
'g7-q3-m1':['Interactivity'],'g7-q3-m2':['Speech delivery'],'g7-q3-m4':['PowerPoint','Painting','Photograph','Film'],
'g7-q3-m7':['Thought-Provoking Questions'],'g7-q4-m1':['Accuracy'],'g7-q4-m5':['Conflict','external conflict','Character'],
'g7-q4-m8':['informative essay'],'g8-q1-m2':['citation'],'g8-q1-m5':['must','Verb','adverb'],
'g8-q2-m2':['opinion','opinion-marking signals'],'g8-q2-m3':['diversity','Infographics'],'g8-q2-m4':['graphic organizer'],
'g8-q2-m5':['Sarcasm'],'g8-q3-m2':['Virtue words'],'g8-q3-m3':['issue'],'g8-q3-m4':['literature','fiction','narrator','characters'],
'g8-q3-m5':['pronoun','cohesive device','Clauses'],'g8-q4-m1':['Idea development','general idea','Claim','Problem-Solution'],
'g8-q4-m4':['topic sentence'],'g8-q4-m5':['Explanation','Expository text'],'g9-q1-w3':['FIRST CONDITIONAL'],
'g9-q1-w6':['conditional sentence','Third Conditional'],'g9-q2-m1':['Repetition'],'g9-q3-w2':['main idea'],'g9-q3-w6':['Facts'],
'g9-q3-w7':['claim'],'g9-q3-w8':['evidence'],'g9-q4-m6':['Listening'],'g9-q4-m12':['NON-VERBAL COMMUNICATION']}
report_path=r/'docs/curriculum/definition-source-review.json'
report=json.loads(report_path.read_text()) if report_path.exists() else []
for path in (r/'src/data/curriculum/pdf').glob('*.json'):
 modules=json.loads(path.read_text());dirty=False
 for m in modules:
  excluded={s.lower() for s in EXCLUDE.get(m['id'],[])};removed=[];keep=[]
  for i,e in enumerate(m['vocabularyBank']):
   reason=''
   if re.search(r'_{2,}|\.{5,}',e['text']):reason='Unanswered source assessment prompt; not a definition or answer.'
   elif e['page'] not in m['source']['discussionPages']:reason='Outside reviewed instructional discussion; needs source/key review before use as a definition.'
   elif e.get('term','').lower() in excluded:reason='Context-specific example, instruction, incomplete table extraction, or property misclassified as a standalone definition.'
   if reason:
    removed.append(e);report.append({'moduleId':m['id'],'fileId':m['source']['fileId'],'page':e['page'],'term':e.get('term'),'reason':reason})
   else:keep.append((i,e))
  if not removed:continue
  dirty=True;content_path=r/'public'/m['digitalContentUrl'].lstrip('/');d=json.loads(content_path.read_text())
  removed_text={e['text'] for e in removed};removed_terms={e.get('term','').lower() for e in removed}
  new_notes=[(i,e) for i,e in enumerate(m['studyCheatsheet']) if e['text'] not in removed_text or e==m['overview']]
  for section,entries in [('vocabularyBank',keep),('studyCheatsheet',new_notes)]:
   refs={key:value for key,value in d['excerptBlocks'].items() if key.startswith(section+':')}
   for key in refs:del d['excerptBlocks'][key]
   for new_i,(old_i,e) in enumerate(entries):
    old=refs.get(section+':'+str(old_i))
    if old:d['excerptBlocks'][section+':'+str(new_i)]=old
   m[section]=[e for _,e in entries]
  d['games']=[q for q in d['games'] if not(q['source']['kind']=='definition-recall' and q['answer'].lower() in removed_terms)]
  used={key for refs in d['excerptBlocks'].values() for key in refs};d['blocks']={key:value for key,value in d['blocks'].items() if key in used}
  content_path.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
 if dirty:path.write_text(json.dumps(modules,ensure_ascii=False,indent=2)+'\n')
report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
banks={p.stem:json.loads(p.read_text())['games'] for p in (r/'public/assets/curriculum/content').glob('*.json')}
(r/'src/data/curriculum/pdfQuestionBank.json').write_text(json.dumps(banks,ensure_ascii=False,separators=(',',':'))+'\n')
print('Definition candidates quarantined:',len(report),'remaining question records:',sum(len(q) for q in banks.values()))
