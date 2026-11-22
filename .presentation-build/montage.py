from PIL import Image, ImageDraw
from pathlib import Path
root=Path(r'D:\GearFlow\.presentation-build')
thumbs=[]
for i in range(1,11):
 im=Image.open(root/f'slide-{i:02d}.png').convert('RGB')
 im.thumbnail((480,270))
 card=Image.new('RGB',(500,300),'#e4eaf0')
 card.paste(im,((500-im.width)//2,8))
 ImageDraw.Draw(card).text((12,280),f'Slide {i}',fill='#1b2b3b')
 thumbs.append(card)
sheet=Image.new('RGB',(1000,1500),'#d5dee8')
for i,im in enumerate(thumbs):sheet.paste(im,((i%2)*500,(i//2)*300))
sheet.save(root/'contact-sheet.png')
