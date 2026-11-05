"""Read heading images only. OCR never supplies teaching text or scored answers."""
import pathlib,json,hashlib,io,concurrent.futures
import fitz
R=pathlib.Path(__file__).resolve().parents[1];RAW=R.parent/'lingoquest-v4/.curriculum-sources';CACHE=R/'.main-baseline/source-heading-ocr.json'
old=json.loads((RAW/'figure-ocr-native.json').read_text());cache=json.loads(CACHE.read_text()) if CACHE.exists() else old
candidates={}
for p in (R/'src/data/curriculum/pdf').glob('*.json'):
 for m in json.loads(p.read_text()):
  doc=fitz.open(RAW/(m['source']['fileId']+'.pdf'))
  for page in doc:
   for b in page.get_text('dict')['blocks']:
    if b['type']!=1:continue
    rect=fitz.Rect(b['bbox'])
    if b['height']>260 or rect.height>120 or rect.width/max(1,rect.height)<1.7:continue
    key=hashlib.sha256(b['image']).hexdigest()[:24]+'.webp'
    if key not in cache:candidates[key]=b['image']
_engine=None
def read(item):
 global _engine
 if _engine is None:
  from rapidocr_onnxruntime import RapidOCR
  _engine=RapidOCR(intra_op_num_threads=1,inter_op_num_threads=1)
 import numpy as np
 from PIL import Image
 key,raw=item;lines,_=_engine(np.array(Image.open(io.BytesIO(raw)).convert('RGB')))
 return key,[{'text':x[1],'confidence':float(x[2])} for x in lines or []]
if __name__=='__main__':
 print('New heading-image candidates:',len(candidates),flush=True)
 with concurrent.futures.ProcessPoolExecutor(max_workers=4) as pool:
  for key,value in pool.map(read,candidates.items()):cache[key]=value
 CACHE.write_text(json.dumps(cache,ensure_ascii=False));print('Heading OCR cached',len(cache),flush=True)
