"""Reviewed visual bank: each figure and definition is explicitly labeled in this PDF.

No pictures are substituted from other modules. Coordinates identify the actual source
figure, not a full-page rendering. Keep other visual banks locked pending source review.
"""
import json,pathlib,hashlib,re,fitz
r=pathlib.Path(__file__).resolve().parents[1];p=r/'public/curriculum/content/g8-q2-m1.json';d=json.loads(p.read_text());fid=d['fileId']
source=json.loads((r/'.curriculum-sources'/(fid+'.json')).read_text())
items=[('Line Graph',13,'diagram',365,'Line Graph is a kind of graph that presents information trends using data dots connected by straight line segments.'),('Bar Graph',13,'diagram',573,'Bar Graph is a kind of graph that characterizes categorical data with rectangular bars of equal width.'),('Map',14,'figure',376,'Map is a diagram or visual representation that shows the relative position of the parts of something.'),('Pie Chart',15,'diagram',517,'Pie Chart is circular in form that presents how a whole is sliced into parts.'),('Infographic',16,'figure',405,'Infographic is a combination of visual images and text presentation of specific information.')]
options=[]
for i,(term,page,kind,y,quote) in enumerate(items):
 raw=re.sub(r'\s+',' ',source['pages'][page-1]['text']);assert quote in raw,term
 blocks=[b for b in d['blocks'].values() if b['page']==page and b['type']==kind and abs(b.get('bbox',[0,0])[1]-y)<3]
 option={'id':'source-visual-'+str(i),'sceneId':'magnifying_clue','label':chr(65+i),'caption':term+' · PDF p. '+str(page)}
 if kind=='figure':
  assert blocks,term
  option['sourceImageUrl']=blocks[0]['src']
 else:
  # Rebuild the reviewed chart from its own native PDF paths/labels and original bar/pie texture.
  areas={'Line Graph':(86.2,365.85,507.3,498.95),'Bar Graph':(86.25,573.29,507.35,729.29),'Pie Chart':(88.5,517.97,514.6,662.47)}
  area=fitz.Rect(areas[term]);doc=fitz.open(r/'.curriculum-sources'/(fid+'.pdf'));pg=doc[page-1]
  graphic={'type':'diagram','page':page,'width':area.width,'height':area.height,'shapes':[],'labels':[],'images':[]}
  for draw in pg.get_drawings():
   if not area.intersects(draw['rect']):continue
   commands=[]
   for it in draw['items']:
    if it[0]=='l':
     a,b=it[1:];commands.append(f'M{a.x-area.x0},{a.y-area.y0} L{b.x-area.x0},{b.y-area.y0}')
    elif it[0]=='c':
     a,b,c,z=it[1:];commands.append(f'M{a.x-area.x0},{a.y-area.y0} C{b.x-area.x0},{b.y-area.y0} {c.x-area.x0},{c.y-area.y0} {z.x-area.x0},{z.y-area.y0}')
    elif it[0]=='re':
     z=it[1];commands.append(f'M{z.x0-area.x0},{z.y0-area.y0} h{z.width} v{z.height} h{-z.width} Z')
   cv=lambda col: '#'+''.join(f'{int(v*255):02x}' for v in col[:3]) if col else 'none'
   graphic['shapes'].append({'d':' '.join(commands),'stroke':cv(draw.get('color')),'fill':cv(draw.get('fill')),'width':draw.get('width') or 1})
  for block in pg.get_text('dict')['blocks']:
   if block['type']!=0:continue
   for line in block['lines']:
    for sp in line['spans']:
     if area.contains(fitz.Rect(sp['bbox'])):graphic['labels'].append({'text':sp['text'],'x':sp['origin'][0]-area.x0,'y':sp['origin'][1]-area.y0,'size':sp['size']})
  for block in d['blocks'].values():
   if block['page']==page and block['type']=='figure' and area.contains(fitz.Rect(block['bbox'])):
    x0,y0,x1,y1=block['bbox'];graphic['images'].append({'src':block['src'],'x':x0-area.x0,'y':y0-area.y0,'width':x1-x0,'height':y1-y0})
  assert graphic['labels'],term
  option['sourceGraphic']=graphic
 options.append(option)
for i,(term,page,kind,y,quote) in enumerate(items):
 sid=hashlib.sha256((quote.lower()+'|'+term.lower()).encode()).hexdigest()[:16]
 q={'id':'g8-q2-m1-picture-'+sid,'type':'pictureHunt','difficulty':'easy','prompt':'Select the source illustration that matches this definition: '+quote.replace(term+' is ','',1),'pictureOptions':options,'answer':options[i]['id'],'explanation':quote,'timeLimitSeconds':45,'source':{'fileId':fid,'page':page,'quote':quote,'answerQuote':term,'sourceId':sid,'kind':'reviewed-labeled-source-figure'}}
 d['games']=[q0 for q0 in d['games'] if q0['id']!=q['id']]+[q]
p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
p=r/'docs/source-game-review.json';rows=json.loads(p.read_text());row=next(x for x in rows if x['moduleId']=='g8-q2-m1');row['modes']['pictureHunt']={'verified':5,'status':'ready','reason':'Definitions and five explicitly labeled source figures reviewed on PDF pages 13–16.'};p.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print('Reviewed Picture Hunt: 5 source-defined visuals, Grade 8 Q2 Module 1, PDF pp. 13–16.')
