"""Inline small original image crops once per module; retain large optimized assets."""
import pathlib,json,base64
r=pathlib.Path(__file__).resolve().parents[1];archive=r/'.curriculum-sources/packed-figures';archive.mkdir(exist_ok=True)
used=set();packed=set()
def refs(v):
 if isinstance(v,dict):
  for x in v.values():yield from refs(x)
 elif isinstance(v,list):
  for x in v:yield from refs(x)
 elif isinstance(v,str) and v.startswith('/curriculum/figures/'):yield v
for p in (r/'public/curriculum/content').glob('*.json'):
 d=json.loads(p.read_text());d.pop('assets',None);assets={}
 for ref in set(refs(d)):
  f=r/'public'/ref.lstrip('/');fallback=archive/f.name
  raw=f.read_bytes() if f.exists() else fallback.read_bytes()
  used.add(f.name)
  if len(raw)<=16384:assets[ref]='data:image/webp;base64,'+base64.b64encode(raw).decode();packed.add(f.name)
 d['assets']=assets;p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
for f in (r/'public/curriculum/figures').glob('*.webp'):
 if f.name in packed or f.name not in used:f.replace(archive/f.name)
print('Inline figure assets',len(packed),'external',len(used-packed))
