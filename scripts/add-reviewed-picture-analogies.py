"""Digitize the PDF's five Picture Analysis items and printed answer key.

Individual embedded drawings are preserved, never full-page screenshots.
The question composition mirrors A:B::C:? using the original images.
"""
import pathlib,json,fitz,hashlib,io
from PIL import Image
r=pathlib.Path(__file__).resolve().parents[1];path=r/'public/curriculum/content/g7-q1-m1.json';d=json.loads(path.read_text());doc=fitz.open(r/'.curriculum-sources'/(d['fileId']+'.pdf'));out=r/'public/curriculum/figures'
instructions='Study the first pair of pictures that will guide you to figure out the object that will match the third picture. Choose the letter of the best answer.'
raw=' '.join(doc[4].get_text().split());assert instructions in raw
answers=['c','b','a','b','c']
labels=[['monkey','bananas','elephant','question mark','ice cream','mango','grass'],['rain cloud','umbrella','sun','question mark','wristwatch','sunglasses','backpack'],['rooster','eggs','cow','question mark','milk','bread','juice'],['chalkboard','eraser and chalk','notebook','question mark','pencil sharpener','pencil','scissors'],['ball of wool','sheep','honey','question mark','grasshopper','butterfly','bee']]
for i in range(5):
 page=5 if i<3 else 6;blocks=[b for b in doc[page-1].get_text('dict')['blocks'] if b['type']==1]
 if page==5:blocks=blocks[1:]
 blocks=blocks[(i if i<3 else i-3)*7:((i if i<3 else i-3)+1)*7];assert len(blocks)==7
 urls=[]
 for b in blocks:
  name=hashlib.sha256(b['image']).hexdigest()[:24]+'.webp';p=out/name
  if not p.exists():Image.open(io.BytesIO(b['image'])).convert('RGB').save(p,'WEBP',quality=90)
  urls.append('/curriculum/figures/'+name)
 graphic={'type':'diagram','page':page,'width':500,'height':115,'shapes':[],'images':[{'src':urls[j],'x':x,'y':8,'width':74,'height':72,'alt':labels[i][j]} for j,x in [(0,5),(1,135),(2,300)]],'labels':[{'text':':','x':102,'y':55,'size':28},{'text':'::','x':245,'y':55,'size':28},{'text':':','x':400,'y':55,'size':28},{'text':'?','x':452,'y':55,'size':34}]}
 options=[{'id':letter,'sceneId':'magnifying_clue','label':letter.upper(),'caption':labels[i][4+j],'sourceImageUrl':urls[4+j]} for j,letter in enumerate('abc')]
 sid='picture-analysis-'+str(i+1)
 q={'id':'g7-q1-m1-'+sid,'type':'pictureHunt','difficulty':'easy','prompt':instructions,'sourceGraphic':graphic,'pictureOptions':options,'answer':answers[i],'explanation':f'What I Know — Task 1, item {i+1}: {answers[i]}. “By determining the relationship of the images in the first pair.” (Answer Key, PDF p. 18.)','timeLimitSeconds':45,'source':{'fileId':d['fileId'],'page':page,'quote':instructions,'answerQuote':answers[i],'sourceId':sid,'kind':'reviewed-picture-analysis','instructionPage':5,'answerKeyPage':18,'answerKeyQuote':f'{answers[i]} {i+1}.'}}
 d['games']=[old for old in d['games'] if old['id']!=q['id']]+[q]
path.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n');print('Reviewed all five original Picture Analysis items, including their source answer key.')
