from PIL import Image,ImageDraw
import pymupdf
from pathlib import Path
pdf=pymupdf.open(r'D:\GearFlow\.presentation-build\GearFlow_DevOps_Architecture_legacy_check.pdf')
out=Path(r'D:\GearFlow\.presentation-build\legacy-renders');out.mkdir(exist_ok=True)
thumbs=[]
for i,page in enumerate(pdf):
 pix=page.get_pixmap(matrix=pymupdf.Matrix(1.2,1.2),alpha=False)
 pix.save(out/f'slide-{i+1:02d}.png')
 im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);im.thumbnail((480,270))
 card=Image.new('RGB',(500,300),'#e4eaf0');card.paste(im,((500-im.width)//2,8));ImageDraw.Draw(card).text((12,280),f'Slide {i+1}',fill='#1b2b3b');thumbs.append(card)
sheet=Image.new('RGB',(1000,1500),'#d5dee8')
for i,im in enumerate(thumbs):sheet.paste(im,((i%2)*500,(i//2)*300))
sheet.save(out/'contact-sheet.png')
print('PAGES',len(pdf),'TEXT_CHARS',[len(p.get_text()) for p in pdf])
