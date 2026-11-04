"""Preserve original discussion layouts; text extraction alone can reorder tables."""
import json, pathlib
import fitz

root = pathlib.Path(__file__).resolve().parents[1]
out = root / 'public/curriculum'
out.mkdir(parents=True, exist_ok=True)
count = 0
for path in sorted((root / 'src/data/curriculum/pdf').glob('*.json')):
    for module in json.loads(path.read_text()):
        fid = module['source']['fileId']
        document = fitz.open(root / '.curriculum-sources' / (fid + '.pdf'))
        for page in module['source']['discussionPages']:
            target = out / (fid + '-p' + str(page) + '.webp')
            if not target.exists():
                pixmap = document[page - 1].get_pixmap(matrix=fitz.Matrix(1.6, 1.6))
                pixmap.pil_save(target, format='WEBP', quality=85)
            count += 1
print(f'Preserved {count} original discussion page layouts.')
