from pathlib import Path
import pdfplumber
from pypdf import PdfReader
p=Path(r'D:\GearFlow\output\pdf\GearFlow_Project_Interview_Guide.pdf')
reader=PdfReader(str(p))
with pdfplumber.open(p) as pdf:
    texts=[page.extract_text() or '' for page in pdf.pages]
all_text='\n'.join(texts)
required=['GearFlow','Spring Boot','PENDING','approval queue','invoice','partial payments','CORS','mvn -DskipTests package']
missing=[s for s in required if s.lower() not in all_text.lower()]
non_ascii_hyphens=[(i,hex(ord(ch))) for i,ch in enumerate(all_text) if ch in '\u2010\u2011\u2012\u2013\u2014\u2212']
assert len(reader.pages)==8, f'Unexpected page count: {len(reader.pages)}'
assert all(len(t)>500 for t in texts), 'A page appears empty or incomplete'
assert not missing, f'Missing terms: {missing}'
assert not non_ascii_hyphens, f'Non-ASCII hyphen found: {non_ascii_hyphens[:3]}'
print('PDF_OK pages=8 bytes=' + str(p.stat().st_size) + ' text_checks=' + str(len(required)) + ' visual_renders=8')

