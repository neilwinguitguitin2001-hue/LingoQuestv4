"""PDF geometry -> selectable text, HTML tables, source figure crops and SVG diagrams.

Never rasterize a PDF page. Teaching text and labels are copied from the same PDF;
geometry is retained only for individual diagrams. Uncertain assets are reported.
"""
import pathlib, json, re, hashlib, math
import fitz

ROOT=pathlib.Path(__file__).resolve().parents[1]
RAW=ROOT/'.curriculum-sources'
OUT=ROOT/'public/curriculum/figures'
OUT.mkdir(parents=True,exist_ok=True)
CONTENT=ROOT/'public/curriculum/content';CONTENT.mkdir(parents=True,exist_ok=True)
REPORT=[];COUNTS={'modules':0,'paragraphs':0,'tables':0,'diagrams':0,'figures':0}

def flat(s):return re.sub(r'\s+',' ',s).strip()
def norm(s):return re.sub(r'[^\w]+',' ',s.lower()).strip()
def relevant(text, excerpt):
    a=norm(text);b=norm(excerpt)
    return a in b or (len(a)>20 and sum(w in b for w in a.split())/max(1,len(a.split()))>.85)
def valid_text(text):
    return bool(text.strip()) and not re.search(r'CO[_ -]|Government Property|P a g e|Not For Sale|UNIFIED SUPPLEMENTARY|^Grade 9 English$|^Grade 9 ENGLISH$',text) and not re.fullmatch(r'[\d\s_.ivx]+',text,re.I)
def overlaps(a,b):return fitz.Rect(a).intersects(fitz.Rect(b))
def color(c):return '#'+''.join(f'{int(max(0,min(1,x))*255):02x}' for x in c[:3]) if c else 'none'
def vector(drawing,area):
    paths=[]
    for item in drawing['items']:
        if item[0]=='l':
            a,b=item[1:];paths.append(f'M{a.x-area.x0:.2f},{a.y-area.y0:.2f} L{b.x-area.x0:.2f},{b.y-area.y0:.2f}')
        elif item[0]=='re':
            r=item[1];paths.append(f'M{r.x0-area.x0:.2f},{r.y0-area.y0:.2f} h{r.width:.2f} v{r.height:.2f} h{-r.width:.2f} Z')
        elif item[0]=='c':
            a,b,c,d=item[1:];paths.append(f'M{a.x-area.x0:.2f},{a.y-area.y0:.2f} C{b.x-area.x0:.2f},{b.y-area.y0:.2f} {c.x-area.x0:.2f},{c.y-area.y0:.2f} {d.x-area.x0:.2f},{d.y-area.y0:.2f}')
        elif item[0]=='qu':
            q=item[1];pts=[q.ul,q.ur,q.lr,q.ll];paths.append('M'+' L'.join(f'{p.x-area.x0:.2f},{p.y-area.y0:.2f}' for p in pts)+' Z')
    return {'d':' '.join(paths),'stroke':color(drawing.get('color')),'fill':color(drawing.get('fill')),'width':max(.7,(drawing.get('width') or 1))}

def extract_page(doc,page_num,fid):
    page=doc[page_num-1];data=page.get_text('dict');fullarea=(page.rect.width*page.rect.height)
    spans=[]
    for block in data['blocks']:
        if block['type']!=0:continue
        for line in block['lines']:
            for span in line['spans']:
                spans.append(span)
    tables=[]
    try:
        for t in page.find_tables().tables:
            rows=[[flat(x or '') for x in row] for row in t.extract()]
            if len(rows)>1 and len(rows[0])>1 and sum(sum(bool(row[c].strip()) for row in rows if c<len(row))>=2 for c in range(len(rows[0])))>=2 and sum(len(x) for row in rows for x in row)>35:
                tables.append({'type':'table','rows':rows,'bbox':list(t.bbox),'text':' '.join(x for row in rows for x in row)})
    except Exception as e:REPORT.append({'fileId':fid,'page':page_num,'reason':'Table extraction requires review','detail':str(e)})
    diagrams=[];drawings=page.get_drawings()
    for rect in page.cluster_drawings():
        area=fitz.Rect(rect)
        if area.width<110 or area.height<40 or (area.width*area.height)>.65*fullarea or area.y0<125:continue
        if any(overlaps(area,t['bbox']) for t in tables):continue
        labels=[s for s in spans if area.contains(fitz.Rect(s['bbox'])) and valid_text(s['text'])]
        if len(labels)<2:continue
        parts=[d for d in drawings if area.intersects(d['rect'])]
        if len(parts)<2 and sum(i[0]=='re' for d in parts for i in d['items'])<2:continue
        shapes=[vector(d,area) for d in parts]
        shapes=[s for s in shapes if s['d']]
        if not shapes:continue
        diagrams.append({'type':'diagram','bbox':list(area),'width':round(area.width,2),'height':round(area.height,2),
            'shapes':shapes,'labels':[{'text':s['text'],'x':round(s['origin'][0]-area.x0,2),'y':round(s['origin'][1]-area.y0,2),'size':round(s['size'],2)} for s in labels],
            'text':' '.join(s['text'] for s in labels)})
    figures=[]
    for block in data['blocks']:
        if block['type']!=1:continue
        rect=fitz.Rect(block['bbox'])
        if rect.width<18 or rect.height<18 or (rect.width*rect.height)<300:continue
        if block['width']==220 and block['height']==220 and abs(rect.width-72)<3 and abs(rect.height-72)<3:continue
        if (rect.width*rect.height)>.65*fullarea:
            REPORT.append({'fileId':fid,'page':page_num,'reason':'Large embedded image needs selective figure/text review; not published as a page image'});continue
        digest=hashlib.sha256(block['image']).hexdigest()[:24];name=digest+'.webp';target=OUT/name
        if not target.exists():
            from PIL import Image
            import io
            image=Image.open(io.BytesIO(block['image'])).convert('RGB');image.thumbnail((1100,1100));image.save(target,'WEBP',quality=85)
        figures.append({'type':'figure','bbox':list(rect),'src':'/curriculum/figures/'+name,'text':'','width':block['width'],'height':block['height']})
    blocks=[]
    for block in data['blocks']:
        if block['type']!=0:continue
        lines=[];sizes=[];bold=[]
        for line in block['lines']:
            # Table and diagram labels are rendered once, inside their semantic element.
            if any(fitz.Rect(t['bbox']).contains(fitz.Rect(line['bbox']).tl) for t in tables+diagrams):continue
            text=flat(''.join(s['text'] for s in line['spans']))
            if not valid_text(text):continue
            if re.fullmatch(r'[_\s.]{6,}',text):continue
            lines.append(text);sizes.extend(s['size'] for s in line['spans']);bold.extend(bool(s['flags']&16) for s in line['spans'])
        if not lines:continue
        text='\n'.join(lines) if any(re.match(r'^(?:\d+[.)]|[•●✓✔])\s*',x) for x in lines) else ' '.join(lines)
        if len(text)<3:continue
        is_heading=len(text)<120 and (max(sizes,default=0)>14 or (bold and all(bold)))
        blocks.append({'type':'heading' if is_heading else 'paragraph','text':text,'bbox':list(block['bbox'])})
    return sorted(blocks+tables+diagrams+figures,key=lambda b:(round(b['bbox'][1]/12),b['bbox'][0]))

for path in sorted((ROOT/'src/data/curriculum/pdf').glob('*.json')):
    modules=json.loads(path.read_text())
    for module in modules:
        digital={'fileId':module['source']['fileId'],'sourceSha256':module['source']['sha256'],'blocks':{},'excerptBlocks':{},'games':[]}
        fid=module['source']['fileId'];doc=fitz.open(RAW/(fid+'.pdf'));cache={}
        assert hashlib.sha256((RAW/(fid+'.pdf')).read_bytes()).hexdigest()==module['source']['sha256']
        for section in ['concepts','guidedAnalysis','pitfallsAndTips','vocabularyBank','selfCheck','studyCheatsheet','answerKey']:
            for excerpt_index,excerpt in enumerate(module[section]):
                pn=excerpt['page']
                if pn not in cache:cache[pn]=extract_page(doc,pn,fid)
                candidates=cache[pn]
                # Short extractive summaries/reminders must not expand to unrelated page content.
                if section in ['vocabularyBank','pitfallsAndTips','studyCheatsheet']:
                    excerpt['blocks']=[{'type':'paragraph','text':excerpt['text']}]
                else:
                    text_blocks=[b for b in candidates if b['type']!='figure' and relevant(b.get('text',''),excerpt['text'])]
                    figures=[b for b in candidates if b['type']=='figure']
                    if section=='concepts' and fid=='1O7Uz5PO8R7RBLJpxEIXqBY-YGV9sO-m1' and pn==11:
                        # The original image's text was transcribed in the source import.
                        text_blocks=[{'type':'paragraph','text':t} for t in excerpt['text'].split('\n\n')]
                    excerpt['blocks']=sorted(text_blocks+figures,key=lambda b:(b.get('bbox',[0,0])[1],b.get('bbox',[0,0])[0])) or [{'type':'paragraph','text':excerpt['text']}]
                excerpt.pop('image',None)
                refs=[]
                for b in excerpt['blocks']:
                    bid=hashlib.sha256(json.dumps({'page':pn,'block':b},sort_keys=True).encode()).hexdigest()[:20]
                    digital['blocks'][bid]={**b,'page':pn};refs.append(bid)
                digital['excerptBlocks'][section+':'+str(excerpt_index)]=refs
                for b in excerpt['blocks']:
                    COUNTS[{'paragraph':'paragraphs','heading':'paragraphs','table':'tables','diagram':'diagrams','figure':'figures'}[b['type']]]+=1
        for section in ['concepts','guidedAnalysis','pitfallsAndTips','vocabularyBank','selfCheck','studyCheatsheet','answerKey']:
            for excerpt in module[section]:excerpt.pop('blocks',None)
        module['digitalContentUrl']='/curriculum/content/'+module['id']+'.json'
        (CONTENT/(module['id']+'.json')).write_text(json.dumps(digital,ensure_ascii=False,separators=(',',':'))+'\n')
        COUNTS['modules']+=1
    path.write_text(json.dumps(modules,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/digital-extraction-review.json').write_text(json.dumps({'counts':COUNTS,'needsReview':REPORT},ensure_ascii=False,indent=2)+'\n')
print(json.dumps(COUNTS));print('Review flags:',len(REPORT))
