"""Keep only current source-section blocks and reachable source assets; scored games are untouched."""
import pathlib,json,collections
r=pathlib.Path(__file__).resolve().parents[1];base=r/'public/assets/curriculum';external=set();counts=collections.Counter()
def refs(v):
 if isinstance(v,str) and v.startswith('/assets/curriculum/figures/'):yield v
 elif isinstance(v,list):
  for x in v:yield from refs(x)
 elif isinstance(v,dict):
  for key,x in v.items():
   if key!='assets':yield from refs(x)
for p in (base/'content').glob('*.json'):
 d=json.loads(p.read_text());used={key for s in d['sourceSections'] for entry in s['entries'] for key in entry['blockIds']}
 d['blocks']={key:value for key,value in d['blocks'].items() if key in used}
 d['excerptBlocks']={key:ids for key,ids in d['excerptBlocks'].items() if key.startswith('concepts:')}
 used_refs=set(refs(d));d['assets']={key:value for key,value in d.get('assets',{}).items() if key in used_refs}
 external.update(ref for ref in used_refs if ref not in d['assets']);counts.update(b['type'] for b in d['blocks'].values())
 p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
for p in (base/'figures').glob('*.webp'):
 if '/assets/curriculum/figures/'+p.name not in external:p.unlink()
print('Current source blocks',dict(counts),'external figures',len(external))

import subprocess,sys
subprocess.run([sys.executable,str(r/'scripts/build-bundled-lessons.py')],check=True)
