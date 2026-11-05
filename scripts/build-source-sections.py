"""Split original PDF content at source heading/line boundaries; never classify a whole mixed page as discussion."""
import pathlib,json,re,hashlib,base64,io,collections,shutil
import fitz
from PIL import Image
R=pathlib.Path(__file__).resolve().parents[1];RAW=R.parent/'lingoquest-v4/.curriculum-sources';OUT=R/'public/assets/curriculum';BACK=R/'.main-baseline/pdf-before-source-tabs';BACK.mkdir(exist_ok=True)
HEADINGS={
'whatineedtoknow':('need-to-know','What I Need to Know','objectives'),
'whatiknow':('what-i-know','What I Know','activity'),
'whatsin':('whats-in','What’s In','activity'),'whatisin':('whats-in','What’s In','activity'),
'whatsnew':('whats-new','What’s New','activity'),
'whatisit':('concepts','Concepts & Rules','discussion'),'whatsit':('concepts','Concepts & Rules','discussion'),
'discussion':('concepts','Concepts & Rules','discussion'),'briefintroduction':('concepts','Concepts & Rules','discussion'),
'whatsmore':('whats-more','What’s More','activity'),
'whatihavelearned':('learned','What I Have Learned','review'),
'whaticando':('can-do','What I Can Do','activity'),
'assessment':('assessment','Assessment','assessment'),'posttest':('assessment','Post-Test','assessment'),
'pretest':('what-i-know','Pre-Test','assessment'),
'additionalactivities':('additional','Additional Activities','activity'),
'answerkey':('answer-key','Answer Key','answers'),'keytocorrection':('answer-key','Key to Correction','answers'),
'learningcompetency':('objectives','Learning Competency','objectives'),
'learningcompetencies':('objectives','Learning Competencies','objectives'),
'learningobjectives':('objectives','Learning Objectives','objectives'),'objectives':('objectives','Objectives','objectives'),
'exercisesactivities':('activities','Exercises / Activities','activity'),'exercises':('activities','Exercises','activity'),
'activities':('activities','Activities','activity'),'summary':('summary','Summary','review'),
'expectations':('expectations','Expectations','objectives'),'remember':('remember','Remember','review'),'checkyourunderstanding':('understanding','Check Your Understanding','activity'),'keytocorrections':('answer-key','Key to Corrections','answers'),
'references':('references','References','omit'),'bibliography':('references','Bibliography','omit')}
def norm(t):return re.sub(r'[^a-z0-9]','',t.lower())
def clean(t):return re.sub(r'\s+',' ',t).strip()
def useful(t):return bool(t) and not re.search(r'CO[_ -]|UNIFIED SUPPLEMENTARY|Government Property|Not For Sale|Department of Education - Bureau|^Grade 9 English$',t,re.I) and not re.fullmatch(r'[\divx_.\s]+',t,re.I)
def activity(t):return bool(re.match(r'^(?:(?:Directions?|Instructions?)\s*:|(?:Activity|Exercise|Task|Assessment)\s*\d+[\s.:]|Answer the following|Choose the (?:letter|correct|best)|Fill (?:in|the)|Complete the following|Now,? answer|Write your answers|Test yourself)',t,re.I))
def profile(raw):
 im=Image.open(io.BytesIO(raw)).convert('RGB');im.thumbnail((48,48));pixels=list(im.getdata());return sum(max(p)-min(p)<18 for p in pixels)/max(1,len(pixels))>.96
OCR=json.loads((R/'.main-baseline/source-heading-ocr.json').read_text())
report=[]
for meta in sorted((R/'src/data/curriculum/pdf').glob('*.json')):
 backup=BACK/meta.name
 if not backup.exists():shutil.copy2(meta,backup)
 modules=json.loads(backup.read_text())
 for m in modules:
  cp=OUT/'content'/(m['id']+'.json');d=json.loads(cp.read_text());fid=m['source']['fileId'];doc=fitz.open(RAW/(fid+'.pdf'))
  assert hashlib.sha256((RAW/(fid+'.pdf')).read_bytes()).hexdigest()==m['source']['sha256']
  oldblocks=list(d['blocks'].values());geometric={}
  for b in oldblocks:
   if b['type'] in ['figure','table','diagram'] and 'bbox' in b:geometric[(b['page'],b['type'],tuple(round(v,1) for v in b['bbox']))]=b
  sections={};state=None;current_title='';newblocks={};overview=m['overview'];line_count=0
  def add(block,active):
   if not active or active[2]=='omit':return
   sid,title,kind=active
   section=sections.setdefault(sid,{'id':sid,'title':title,'kind':kind,'entries':[]})
   bid=hashlib.sha256(json.dumps(block,sort_keys=True,ensure_ascii=False).encode()).hexdigest()[:20]
   newblocks[bid]=block
   if not section['entries'] or section['entries'][-1]['page']!=block['page']:section['entries'].append({'page':block['page'],'blockIds':[]})
   if bid not in section['entries'][-1]['blockIds']:section['entries'][-1]['blockIds'].append(bid)
  for pn,page in enumerate(doc,1):
   native=page.get_text('dict')['blocks'];lines=[]
   for b in native:
    if b['type']!=0:continue
    for line in b['lines']:
     t=clean(''.join(s['text'] for s in line['spans']))
     if not useful(t) or line['bbox'][1]<32 or line['bbox'][3]>page.rect.height-30:continue
     lines.append({'text':t,'bbox':list(line['bbox']),'size':max(s['size'] for s in line['spans']),'bold':all(s['flags']&16 for s in line['spans'])})
   lines.sort(key=lambda x:(round(x['bbox'][1]/3),x['bbox'][0]))
   events=[];consumed=set();heading_images=set()
   for image in native:
    if image['type']!=1:continue
    rect=fitz.Rect(image['bbox'])
    if image['height']>260 or rect.height>120 or rect.width/max(1,rect.height)<1.7:continue
    name=hashlib.sha256(image['image']).hexdigest()[:24]+'.webp'
    labels=[line['text'] for line in OCR.get(name,[]) if line.get('confidence',0)>.94 and re.search(r'[A-Za-z]{3}',line.get('text',''))]
    key=norm(' '.join(labels))
    if key in HEADINGS:
     events.append((rect.y0-1,HEADINGS[key],' '.join(labels)));heading_images.add(name)

   for i,line in enumerate(lines):
    if i in consumed:continue
    for length in [1,2,3]:
     group=lines[i:i+length]
     if len(group)!=length or (length>1 and (group[-1]['bbox'][1]-group[0]['bbox'][1]>48 or any(len(x['text'])>40 for x in group))):continue
     title=' '.join(x['text'] for x in group);key=norm(re.sub(r'^(?:[IVX]+|[0-9]+)[.)]\s*','',title.rstrip(':'),flags=re.I))
     if key in HEADINGS:
      role=HEADINGS[key]
      if len(title)>90:continue
      events.append((line['bbox'][1]-1,role,title));consumed.update(range(i,i+length));break
   # Source overview anchors also handle image-only section headings and source-specific names.
   if pn==overview['page']:
    target=norm(overview['text'])[:50]
    for i,line in enumerate(lines):
     if target and norm(' '.join(x['text'] for x in lines[i:i+5])).startswith(target):
      events.append((line['bbox'][1]-.4,('concepts','Concepts & Rules','discussion'),'Instructional discussion'));break
   events.sort(key=lambda x:x[0])
   initial=state;intervals=[];start=0
   for y,role,title in events:
    if state and role[2]=='objectives' and state[2]=='objectives':role=state
    if state and state[2]=='answers' and role[2] not in ['answers','omit']:continue
    intervals.append((start,y,state));state=role;start=y
   intervals.append((start,page.rect.height,state));state_at_end=state
   def at(y):
    return next((role for lo,hi,role in intervals if lo<=y<hi),state_at_end)
   # Explicit tasks inside an instructional page are separated at their own line boundaries.
   for line in lines:
    y=line['bbox'][1];active=at(y)
    if (not active or active[2]!='answers') and activity(line['text']) and (not active or active[2]=='discussion'):
     old=intervals;intervals=[]
     for lo,hi,role in old:
      if lo<=y<hi:
       intervals.extend([(lo,y,role),(y,hi,('practice','Activities & Assessment','activity'))])
       if hi==page.rect.height:state_at_end=('practice','Activities & Assessment','activity')
      else:intervals.append((lo,hi,role))
   state=state_at_end
   graphics=[]
   for (pg,kind,box),b in geometric.items():
    if pg!=pn or kind=='figure':continue
    active=at((b['bbox'][1]+b['bbox'][3])/2)
    # Never move a table/diagram across a source section boundary.
    if active and at(b['bbox'][1]+1)==at(b['bbox'][3]-1):graphics.append((b,active))
   for b in native:
    if b['type']!=1:continue
    rect=fitz.Rect(b['bbox']);active=at((rect.y0+rect.y1)/2)
    if not active or active[2]=='omit' or rect.y0<80 or rect.y1>page.rect.height-32:continue
    if rect.width<18 or rect.height<18 or rect.width*rect.height<300:continue
    if b['width']==220 and b['height']==220 and abs(rect.width-72)<3:continue
    if rect.width*rect.height/(page.rect.width*page.rect.height)>.65:continue
    name=hashlib.sha256(b['image']).hexdigest()[:24]+'.webp'
    if name in heading_images:continue
    ref='/assets/curriculum/figures/'+name;physical=OUT/'figures'/name
    if ref not in d.get('assets',{}) and not physical.exists():
     im=Image.open(io.BytesIO(b['image'])).convert('RGB');im.thumbnail((1100,1100));buf=io.BytesIO();im.save(buf,'WEBP',quality=85);raw=buf.getvalue()
     if len(raw)<=16384:d.setdefault('assets',{})[ref]='data:image/webp;base64,'+base64.b64encode(raw).decode()
     else:physical.write_bytes(raw)
    if at(rect.y0+1)!=at(rect.y1-1):
     mixed=[role for lo,hi,role in intervals if role and role[2] in ['activity','assessment','review'] and lo<rect.y1 and hi>rect.y0]
     if mixed:active=mixed[0]
     else:continue
    old=geometric.get((pn,'figure',tuple(round(v,1) for v in b['bbox'])),{})
    block={'type':'figure','page':pn,'bbox':list(rect),'src':ref,'width':b['width'],'height':b['height'],'monochrome':profile(b['image'])}
    if old.get('transcript'):block['transcript']=old['transcript']
    graphics.append((block,active))
   items=[]
   for b,active in graphics:items.append((b['bbox'][1],b['bbox'][0],b,active))
   for i,line in enumerate(lines):
    if i in consumed:continue
    active=at(line['bbox'][1]);t=line['text']
    if not active or active[2]=='omit':continue
    if any(fitz.Rect(b['bbox']).contains(fitz.Point(line['bbox'][0]+1,line['bbox'][1]+1)) for b,_ in graphics if b['type']!='figure'):continue
    kind='heading' if len(t)<105 and (line['size']>14 or line['bold']) else 'paragraph'
    items.append((line['bbox'][1],line['bbox'][0],{'type':kind,'page':pn,'text':t,'bbox':line['bbox']},active))
   # Join native wrapped lines only inside the same source section and paragraph.
   items.sort(key=lambda x:(round(x[0]/3),x[1]));pending=None
   for y,x,b,active in items:
    if pending and b['type']=='paragraph' and pending[0]['type']=='paragraph' and active==pending[1] and b['bbox'][1]-pending[0]['bbox'][3]<10 and abs(b['bbox'][0]-pending[0]['bbox'][0])<24:
     pending[0]['text']+=' '+b['text'];pending[0]['bbox'][2]=max(pending[0]['bbox'][2],b['bbox'][2]);pending[0]['bbox'][3]=b['bbox'][3]
    else:
     if pending:add(*pending)
     pending=(b,active)
   if pending:add(*pending)
  if 'concepts' not in sections:
   add({'type':'paragraph','page':overview['page'],'text':overview['text']},('concepts','Concepts & Rules','discussion'))
  ordered=[sections['concepts']]+[s for key,s in sections.items() if key!='concepts' and s['entries']]
  d['sourceSections']=ordered;d['blocks'].update(newblocks)
  # Replace the former mixed-page concept excerpts at their data source.
  m['concepts']=[]
  for entry in sections['concepts']['entries']:
   text='\n\n'.join(newblocks[k].get('text','') for k in entry['blockIds'] if newblocks[k].get('text'))
   if text:m['concepts'].append({'page':entry['page'],'text':text,'kind':'discussion'})
  for key in list(d['excerptBlocks']):
   if key.startswith('concepts:'):del d['excerptBlocks'][key]
  ci=0
  for entry in sections['concepts']['entries']:
   if any(newblocks[k].get('text') for k in entry['blockIds']):d['excerptBlocks']['concepts:'+str(ci)]=entry['blockIds'];ci+=1
  if not m['concepts']:
   extra={'type':'paragraph','page':overview['page'],'text':overview['text']};add(extra,('concepts','Concepts & Rules','discussion'));m['concepts']=[{'page':overview['page'],'text':overview['text'],'kind':'discussion'}];d['excerptBlocks']['concepts:0']=sections['concepts']['entries'][-1]['blockIds']
  m['source']['verifiedRecallPages']=m['source']['discussionPages']
  m['source']['discussionPages']=list(dict.fromkeys(e['page'] for e in sections['concepts']['entries']))
  m['sourceSections']=[{'id':s['id'],'title':s['title'],'kind':s['kind'],'pages':list(dict.fromkeys(e['page'] for e in s['entries']))} for s in ordered]
  used={k for refs in d['excerptBlocks'].values() for k in refs}|{k for s in ordered for e in s['entries'] for k in e['blockIds']};d['blocks']={k:v for k,v in d['blocks'].items() if k in used}
  cp.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
  report.append({'moduleId':m['id'],'fileId':fid,'sections':m['sourceSections'],'discussionBlocks':sum(len(e['blockIds']) for e in sections['concepts']['entries'])})
 meta.write_text(json.dumps(modules,ensure_ascii=False,indent=2)+'\n')
 print(meta.stem,'completed',len(modules),'modules',flush=True)
(R/'docs/curriculum/source-section-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('Source sections built for',len(report),'PDFs',flush=True)

# The owner requires discussion-only publication; full sections above are extraction intermediates.
import subprocess,sys
subprocess.run([sys.executable,str(R/'scripts/publish-discussion-only.py')],check=True)
