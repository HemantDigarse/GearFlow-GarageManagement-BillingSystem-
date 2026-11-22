from pathlib import Path
import pymupdf as fitz
from PIL import Image, ImageOps, ImageDraw
pdf=Path(r'D:\GearFlow\output\pdf\GearFlow_Project_Interview_Guide.pdf')
out=Path(r'D:\GearFlow\tmp\pdfs\rendered')
out.mkdir(parents=True,exist_ok=True)
doc=fitz.open(pdf)
thumbs=[]
for i,page in enumerate(doc):
    pix=page.get_pixmap(matrix=fitz.Matrix(1.25,1.25),alpha=False)
    path=out/f'page-{i+1:02d}.png'; pix.save(path)
    img=Image.open(path).convert('RGB')
    img.thumbnail((410,530))
    card=Image.new('RGB',(430,560),'#e7edf4')
    card.paste(img,((430-img.width)//2,12))
    draw=ImageDraw.Draw(card); draw.text((12,540),f'Page {i+1}',fill='#26364a')
    thumbs.append(card)
cols=2; rows=(len(thumbs)+1)//2
sheet=Image.new('RGB',(cols*430,rows*560),'#d6dee8')
for i,img in enumerate(thumbs): sheet.paste(img,((i%2)*430,(i//2)*560))
sheet.save(out/'contact-sheet.png')
print('pages',len(doc),'sizes',[tuple(round(v,1) for v in p.rect[2:]) for p in doc])
for i,page in enumerate(doc):
    text=page.get_text()
    print(i+1,'chars',len(text),'top',repr(text[:75].replace('\n',' | ')),'bottom',repr(text[-80:].replace('\n',' | ')))

