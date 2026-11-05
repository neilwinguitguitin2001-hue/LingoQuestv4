"""Bundle the verified lesson package with the app; no per-module JSON request is required."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1];result={}
for p in sorted((R/'src/data/curriculum/pdf').glob('*.json')):
 for lesson in json.loads(p.read_text()):
  content=json.loads((R/'public/assets/curriculum/content'/(lesson['id']+'.json')).read_text())
  assert content['fileId']==lesson['source']['fileId'] and content['sourceSha256']==lesson['source']['sha256']
  content.pop('games',None);result[lesson['id']]=content
assert len(result)==106
out=R/'src/data/curriculum/bundled';out.mkdir(exist_ok=True)
imports=[];names=[];size=0
for grade in range(7,11):
 for quarter in range(1,5):
  name=f'g{grade}q{quarter}';batch={k:v for k,v in result.items() if k.startswith(f'g{grade}-q{quarter}-')};path=out/(name+'.json');path.write_text(json.dumps(batch,ensure_ascii=False,separators=(',',':'))+'\n');size+=path.stat().st_size
  imports.append(f"import {name} from './bundled/{name}.json';");names.append(name)
(R/'src/data/curriculum/bundledLessons.ts').write_text('\n'.join(imports)+"\nexport default Object.assign({},"+','.join(names)+");\n")
print('Bundled',len(result),'lesson packages in 16 batches;',size,'bytes; question banks stored separately')
