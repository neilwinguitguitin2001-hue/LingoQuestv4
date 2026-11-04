"""Distinguish prose frames from data tables using the original PDF geometry."""
import pathlib,json,re
import fitz
r=pathlib.Path(__file__).resolve().parents[1];count=0;tables=0
for p in (r/'public/curriculum/content').glob('*.json'):
 d=json.loads(p.read_text());doc=fitz.open(r/'.curriculum-sources'/(d['fileId']+'.pdf'));cache={};changed=False
 for b in d['blocks'].values():
  if b['type'] not in ('table','paragraph') or 'bbox' not in b:continue
  pn=b['page'];page=doc[pn-1]
  if pn not in cache:
   try:cache[pn]=page.find_tables().tables
   except Exception:cache[pn]=[]
  match=next((t for t in cache[pn] if all(abs(a-v)<.2 for a,v in zip(t.bbox,b['bbox']))),None)
  if match is None:continue
  rows=[[re.sub(r'\s+',' ',x or '').strip() for x in row] for row in match.extract()];width=max(map(len,rows));columns=[sum(bool(row[c].strip()) for row in rows if c<len(row)) for c in range(width)]
  if sum(n>=2 for n in columns)>=2:
   b['type']='table';b['rows']=rows;b['text']=' '.join(x for row in rows for x in row);tables+=1
  else:
   rect=fitz.Rect(b['bbox']);lines=[]
   for block in page.get_text('dict')['blocks']:
    if block['type']!=0:continue
    for line in block['lines']:
     spans=[s['text'] for s in line['spans'] if rect.contains(fitz.Point((s['bbox'][0]+s['bbox'][2])/2,(s['bbox'][1]+s['bbox'][3])/2))]
     if spans:lines.append(''.join(spans))
   b['type']='paragraph';b['text']='\n'.join(lines);b.pop('rows',None);count+=1
  changed=True
 if changed:p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
print('Prose frames:',count,'data tables:',tables)
