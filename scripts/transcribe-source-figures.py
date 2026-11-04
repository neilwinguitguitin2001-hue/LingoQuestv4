"""Recover image labels with OCR, publishing only labels corroborated by native PDF text.

Uncorroborated OCR is review evidence only: never use it for teaching/game answers.
"""
import pathlib,json,re,concurrent.futures,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
RAW=ROOT/'.curriculum-sources'
_engine=None
def recognize(path):
 global _engine
 if _engine is None:
  from rapidocr_onnxruntime import RapidOCR
  _engine=RapidOCR(intra_op_num_threads=1,inter_op_num_threads=1)
 try:
  result,_=_engine(path)
  return pathlib.Path(path).name, [{'text':x[1],'confidence':float(x[2])} for x in result or []]
 except Exception as e:return pathlib.Path(path).name,[{'error':str(e)}]
def norm(text):return re.sub(r'[^a-z0-9]+',' ',text.lower()).strip()
if __name__=='__main__':
 paths=[str(p) for p in (ROOT/'public/curriculum/figures').glob('*.webp')]
 cache_path=RAW/'figure-ocr-native.json'
 ocr=json.loads(cache_path.read_text()) if cache_path.exists() else {}
 pending=[p for p in paths if pathlib.Path(p).name not in ocr]
 with concurrent.futures.ProcessPoolExecutor(max_workers=4) as pool:
  for i,(name,lines) in enumerate(pool.map(recognize,pending)):
   ocr[name]=lines
   if i%100==0:cache_path.write_text(json.dumps(ocr));print('Image labels checked',i+1,'/',len(pending),flush=True)
 cache_path.write_text(json.dumps(ocr,ensure_ascii=False))
 report=[];published=0
 for p in (ROOT/'public/curriculum/content').glob('*.json'):
  data=json.loads(p.read_text());native=json.loads((RAW/(data['fileId']+'.json')).read_text())
  for block in data['blocks'].values():
   if block['type']!='figure':continue
   page=native['pages'][block['page']-1]['text'];page_norm=norm(page)
   lines=ocr.get(pathlib.Path(block['src']).name,[]);accepted=[];unverified=[]
   for line in lines:
    text=line.get('text','');n=norm(text)
    if len(n)>=2 and n in page_norm and line.get('confidence',0)>.9:accepted.append(text)
    elif len(n)>3:unverified.append(line)
   if accepted:block['transcript']='\n'.join(accepted);published+=1
   if unverified:report.append({'fileId':data['fileId'],'page':block['page'],'figure':block['src'],'reason':'Image-only labels need source review; uncorroborated OCR is not published.'})
  p.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
 (ROOT/'docs/source-figure-text-review.json').write_text(json.dumps({'corroboratedTranscripts':published,'needsReview':report},ensure_ascii=False,indent=2)+'\n')
 print('Corroborated image transcripts:',published,'review flags:',len(report))
