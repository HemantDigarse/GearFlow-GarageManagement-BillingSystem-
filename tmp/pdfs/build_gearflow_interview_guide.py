from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Flowable, HRFlowable
)
from reportlab.pdfbase.pdfmetrics import stringWidth
from xml.sax.saxutils import escape
from datetime import date
from pathlib import Path

OUT = Path(r'D:\GearFlow\output\pdf\GearFlow_Project_Interview_Guide.pdf')
OUT.parent.mkdir(parents=True, exist_ok=True)

NAVY = HexColor('#10233F')
BLUE = HexColor('#2563EB')
CYAN = HexColor('#0EA5A4')
INK = HexColor('#1F2937')
MUTED = HexColor('#5B6778')
PALE = HexColor('#F3F7FB')
LINE = HexColor('#DCE5EF')
GREEN = HexColor('#16845B')
AMBER = HexColor('#B7791F')
RED = HexColor('#B23A48')
WHITE = colors.white

PAGE_W, PAGE_H = letter
LEFT = RIGHT = 0.68 * inch
TOP = 0.72 * inch
BOTTOM = 0.62 * inch
CONTENT_W = PAGE_W - LEFT - RIGHT

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='Kicker', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=BLUE, spaceAfter=5, tracking=1.2))
styles.add(ParagraphStyle(name='TitleMain', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=31, leading=35, textColor=NAVY, alignment=TA_LEFT, spaceAfter=8))
styles.add(ParagraphStyle(name='SubtitleMain', parent=styles['Normal'], fontName='Helvetica', fontSize=13, leading=18, textColor=MUTED, spaceAfter=10))
styles.add(ParagraphStyle(name='H1x', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=20, leading=24, textColor=NAVY, spaceBefore=0, spaceAfter=8, keepWithNext=True))
styles.add(ParagraphStyle(name='H2x', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=NAVY, spaceBefore=8, spaceAfter=5, keepWithNext=True))
styles.add(ParagraphStyle(name='Bodyx', parent=styles['BodyText'], fontName='Helvetica', fontSize=9.2, leading=13.4, textColor=INK, spaceAfter=5))
styles.add(ParagraphStyle(name='Smallx', parent=styles['BodyText'], fontName='Helvetica', fontSize=8, leading=11, textColor=MUTED, spaceAfter=3))
styles.add(ParagraphStyle(name='Calloutx', parent=styles['BodyText'], fontName='Helvetica', fontSize=9.5, leading=14.2, textColor=INK, spaceAfter=0))
styles.add(ParagraphStyle(name='TableHeadx', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=WHITE))
styles.add(ParagraphStyle(name='TableCellx', parent=styles['Normal'], fontName='Helvetica', fontSize=8.1, leading=11, textColor=INK))
styles.add(ParagraphStyle(name='Qx', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.3, leading=12.5, textColor=NAVY, spaceAfter=2))
styles.add(ParagraphStyle(name='Ax', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=INK))
styles.add(ParagraphStyle(name='Tagx', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.4, leading=9, textColor=BLUE, alignment=TA_CENTER))
styles.add(ParagraphStyle(name='CoverSmall', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=HexColor('#D8E6F8')))
styles.add(ParagraphStyle(name='CoverTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=34, leading=38, textColor=WHITE))
styles.add(ParagraphStyle(name='CoverSub', parent=styles['Normal'], fontName='Helvetica', fontSize=13, leading=18, textColor=HexColor('#D8E6F8')))


def P(text, style='Bodyx'):
    return Paragraph(text, styles[style])

def bullet(text, style='Bodyx'):
    return Paragraph('- ' + text, styles[style])

def heading(kicker, title, subtitle=None):
    items = [P(kicker.upper(), 'Kicker'), P(title, 'H1x')]
    if subtitle:
        items.append(P(subtitle, 'Bodyx'))
    items.append(Spacer(1, 5))
    return items

def callout(label, body, accent=BLUE, bg=PALE):
    content = [P(f'<font color="{accent.hexval()}"><b>{label}</b></font><br/>{body}', 'Calloutx')]
    t = Table([[content]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('BOX', (0,0), (-1,-1), 0.5, LINE),
        ('LINEBEFORE', (0,0), (0,-1), 3.5, accent),
        ('LEFTPADDING', (0,0), (-1,-1), 12), ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 9), ('BOTTOMPADDING', (0,0), (-1,-1), 9),
    ]))
    return t

def data_table(rows, widths, header=True, font=8):
    converted=[]
    for i,row in enumerate(rows):
        converted.append([P(str(cell), 'TableHeadx' if header and i==0 else 'TableCellx') for cell in row])
    t=Table(converted, colWidths=widths, repeatRows=1 if header else 0, hAlign='LEFT')
    cmds=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),('LINEBELOW',(0,0),(-1,-1),0.35,LINE)]
    if header:
        cmds.extend([('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[WHITE,PALE])])
    else:
        cmds.extend([('ROWBACKGROUNDS',(0,0),(-1,-1),[WHITE,PALE])])
    t.setStyle(TableStyle(cmds))
    return t

def qa(question, answer, tag=None):
    q = P(question + (f' <font color="{BLUE.hexval()}">[{tag}]</font>' if tag else ''), 'Qx')
    a = P(answer, 'Ax')
    t = Table([[q],[a]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),WHITE),
        ('BOX',(0,0),(-1,-1),0.45,LINE),
        ('LINEBEFORE',(0,0),(0,-1),2,BLUE),
        ('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),
        ('TOPPADDING',(0,0),(-1,0),6),('BOTTOMPADDING',(0,0),(-1,0),1),
        ('TOPPADDING',(0,1),(-1,1),1),('BOTTOMPADDING',(0,1),(-1,1),7),
    ]))
    return t

class ArchitectureDiagram(Flowable):
    def __init__(self, width=CONTENT_W, height=126):
        super().__init__(); self.width=width; self.height=height
    def draw(self):
        c=self.canv; w=self.width
        boxes=[('React UI','Pages, forms, charts'),('Axios API','Bearer token'),('Spring REST','Controllers'),('Services','Rules, validation'),('JPA','Repositories'),('MySQL','Records')]
        gap=8; n=len(boxes); bw=(w-gap*(n-1))/n; y=48; bh=48
        for i,(title,sub) in enumerate(boxes):
            x=i*(bw+gap)
            c.setFillColor(PALE if i%2==0 else HexColor('#EAF1FF'))
            c.setStrokeColor(LINE); c.roundRect(x,y,bw,bh,6,fill=1,stroke=1)
            c.setFillColor(NAVY); c.setFont('Helvetica-Bold',7.6); c.drawCentredString(x+bw/2,y+29,title)
            c.setFillColor(MUTED); c.setFont('Helvetica',6.4); c.drawCentredString(x+bw/2,y+15,sub)
            if i<n-1:
                x1=x+bw+1; x2=x+bw+gap-2; cy=y+bh/2
                c.setStrokeColor(BLUE); c.setLineWidth(1.1); c.line(x1,cy,x2,cy)
                c.line(x2-3,cy+3,x2,cy); c.line(x2-3,cy-3,x2,cy)
        c.setFillColor(NAVY); c.setFont('Helvetica-Bold',7.2)
        c.drawString(2,27,'SIGN IN:')
        c.setFillColor(MUTED); c.setFont('Helvetica',7.2)
        c.drawString(53,27,'AuthContext stores the user and JWT; Axios sends the token; Spring Security validates it per request.')
        c.setStrokeColor(LINE); c.line(0,17,w,17)
        c.setFillColor(MUTED); c.setFont('Helvetica',6.8)
        c.drawString(2,5,'API prefix: /api     Vite development proxy: localhost:3000 -> localhost:8080')

class CoverHero(Flowable):
    def __init__(self, width=CONTENT_W, height=205):
        super().__init__(); self.width=width; self.height=height
    def draw(self):
        c=self.canv; w=self.width; h=self.height
        c.setFillColor(NAVY); c.roundRect(0,0,w,h,13,fill=1,stroke=0)
        c.setFillColor(BLUE); c.roundRect(0,0,8,h,4,fill=1,stroke=0)
        c.setFillColor(CYAN); c.circle(w-32,h-31,5,fill=1,stroke=0)
        c.setFillColor(HexColor('#243C5C')); c.circle(w-65,40,25,fill=1,stroke=0)
        c.setFillColor(HexColor('#1D4F8A')); c.circle(w-30,40,15,fill=1,stroke=0)
        p=Paragraph('FULL-STACK PROJECT / INTERVIEW PREP', styles['CoverSmall']); p.wrapOn(c,w-48,40); p.drawOn(c,24,h-47)
        p=Paragraph('GearFlow', styles['CoverTitle']); p.wrapOn(c,w-48,45); p.drawOn(c,24,h-94)
        p=Paragraph('Garage maintenance and billing management', styles['CoverSub']); p.wrapOn(c,w-48,30); p.drawOn(c,24,h-119)
        c.setStrokeColor(HexColor('#45627F')); c.line(24,h-137,w-24,h-137)
        p=Paragraph('A practical guide to explaining the product, architecture, approval workflow, billing domain, security, and tradeoffs.', styles['CoverSmall']); p.wrapOn(c,w-50,38); p.drawOn(c,24,h-163)
        c.setFillColor(HexColor('#A9BED8')); c.setFont('Helvetica',7.5)
        c.drawString(24,16,'PROJECT-SPECIFIC EDITION  |  15 NOVEMBER 2026')

class GearFlowDoc(BaseDocTemplate):
    def __init__(self, filename, **kw):
        super().__init__(filename, **kw)
        frame=Frame(LEFT,BOTTOM,CONTENT_W,PAGE_H-TOP-BOTTOM,id='normal',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
        self.addPageTemplates([PageTemplate(id='main',frames=[frame],onPage=self.decorate)])
    def decorate(self, canvas, doc):
        if doc.page == 1:
            return
        canvas.saveState()
        canvas.setFillColor(NAVY); canvas.rect(0,PAGE_H-7,PAGE_W,7,fill=1,stroke=0)
        canvas.setFillColor(MUTED); canvas.setFont('Helvetica-Bold',7.2)
        canvas.drawString(LEFT,PAGE_H-25,'GEARFLOW')
        canvas.setFont('Helvetica',7.2); canvas.drawRightString(PAGE_W-RIGHT,PAGE_H-25,'PROJECT INTERVIEW GUIDE')
        canvas.setStrokeColor(LINE); canvas.setLineWidth(0.5); canvas.line(LEFT, BOTTOM-10, PAGE_W-RIGHT, BOTTOM-10)
        canvas.setFillColor(MUTED); canvas.setFont('Helvetica',7)
        canvas.drawString(LEFT,BOTTOM-23,'Prepared from the current GearFlow codebase')
        canvas.drawRightString(PAGE_W-RIGHT,BOTTOM-23,f'{doc.page:02d}')
        canvas.restoreState()

story=[]
# Page 1 - cover
story += [Spacer(1,0.35*inch), CoverHero(), Spacer(1,0.30*inch)]
story += [P('PROJECT SNAPSHOT','Kicker')]
snapshot=[
    [P('<b>Frontend</b><br/>React 18, Vite, React Router, Axios, Tailwind CSS, Recharts','TableCellx'), P('<b>Backend</b><br/>Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA','TableCellx')],
    [P('<b>Database</b><br/>MySQL with Hibernate-managed entities','TableCellx'), P('<b>Product roles</b><br/>Administrator and garage owner','TableCellx')],
]
t=Table(snapshot,colWidths=[CONTENT_W/2,CONTENT_W/2])
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PALE),('BOX',(0,0),(-1,-1),0.6,LINE),('INNERGRID',(0,0),(-1,-1),0.5,LINE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),11),('RIGHTPADDING',(0,0),(-1,-1),11),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10)]))
story += [t, Spacer(1,0.23*inch), callout('Use this guide to prepare, not to memorize.', 'Keep the examples truthful to your own contribution. Be ready to open the code and trace one request from the browser to the database.', CYAN, HexColor('#ECF9F7'))]
story += [PageBreak()]

# Page 2 - summary
story += heading('01 / Your opening','A clear project introduction','Use this as a structure for a 60 to 90 second answer. Put your own role and contribution into the brackets.')
story += [callout('Sample introduction', 'GearFlow is a full-stack garage operations application. It gives garage owners tools to manage customers, vehicles, services, job cards, appointments, invoices, payments, and reports. Administrators manage garage registrations and platform activity. The frontend is a React single-page app, the backend is a layered Spring Boot REST API, and MySQL stores the domain data through JPA. Authentication uses JWTs with role-based access. A key workflow is garage registration: a new garage starts in PENDING, an administrator reviews it, and the owner can use the workspace after approval. My contribution was [describe your actual work], and one technical challenge I solved was [choose a real example from this guide].', BLUE)]
story += [P('Product problem and users','H2x')]
story += [bullet('<b>Garage owner:</b> runs day-to-day service operations and billing from a role-protected workspace.'), bullet('<b>Platform administrator:</b> reviews newly registered garages, manages owners, and views platform-level metrics.'), bullet('<b>Operational outcome:</b> customer, vehicle, repair, invoice, and payment records are connected instead of managed as separate lists.')]
story += [P('A concise demo narrative','H2x')]
story += [data_table([
    ['Step','Show','Explain'],
    ['1. Register','Garage registration form','The account and garage are created with PENDING status.'],
    ['2. Review','Admin overview approval queue','Admin inspects the application and approves or rejects it.'],
    ['3. Operate','Customers, vehicles, job cards','Garage data is scoped to the authenticated owner.'],
    ['4. Bill','Invoice detail and payment','A completed job card can become an invoice; payments update its balance.'],
], [0.72*inch,1.80*inch,CONTENT_W-2.52*inch])]
story += [Spacer(1,8), callout('Interview signal', 'State the problem, users, stack, one end-to-end workflow, and your own contribution. Avoid listing every library before explaining the value.', AMBER, HexColor('#FFF8E8'))]
story += [PageBreak()]

# Page 3 - architecture
story += heading('02 / Architecture','How a request moves','The project separates UI concerns, HTTP routing, business logic, persistence, and database storage.')
story += [ArchitectureDiagram(), Spacer(1,9)]
story += [P('Layer map','H2x')]
story += [data_table([
    ['Layer','GearFlow examples','Responsibility'],
    ['Frontend','pages, layouts, context, services/api.js','Renders role-specific screens, holds auth state, calls JSON APIs.'],
    ['Controller','AuthController, JobCardController, InvoiceController','Maps HTTP paths and request/response DTOs.'],
    ['Service','AuthService, InvoiceService, AdminService','Enforces business rules and coordinates repositories.'],
    ['Repository','Spring Data JPA interfaces','Queries and persists entities.'],
    ['Database','MySQL','Stores garages, users, service work, invoices, and payments.'],
], [0.82*inch,2.05*inch,CONTENT_W-2.87*inch])]
story += [P('Why use a service layer?','H2x')]
story += [P('Controllers stay thin and focused on HTTP. Services hold rules such as garage ownership checks, job completion requirements for invoicing, duplicate invoice prevention, and payment balance updates. Repositories isolate persistence queries. This structure makes the flow easier to explain and gives business rules a clear home.', 'Bodyx')]
story += [callout('Technology details', 'Frontend: React 18, Vite, React Router 6, Axios, Tailwind CSS, Recharts, lucide-react, react-hot-toast. Backend: Java 17, Spring Boot 3.2.5, Spring Web, Spring Security, Spring Data JPA, Bean Validation, JJWT, Lombok, and MySQL Connector/J.', CYAN, HexColor('#ECF9F7'))]
story += [PageBreak()]

# Page 4 - data and workflows
story += heading('03 / Domain','Core records and business flows','Explain how one garage operation moves through the domain instead of describing tables in isolation.')
story += [P('Typical service-to-payment flow','H2x')]
flow=[
    [P('<b>Customer</b><br/>contact record','TableCellx'),P('<b>Vehicle</b><br/>owned by customer','TableCellx'),P('<b>Job card</b><br/>work and services','TableCellx'),P('<b>Invoice</b><br/>charges and tax','TableCellx'),P('<b>Payment</b><br/>amount received','TableCellx')]
]
t=Table(flow,colWidths=[CONTENT_W/5]*5)
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PALE),('BOX',(0,0),(-1,-1),0.5,LINE),('INNERGRID',(0,0),(-1,-1),0.5,LINE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9)]))
story += [t, Spacer(1,7)]
story += [P('Key relationships','H2x')]
story += [bullet('<b>User and Garage:</b> a garage belongs to its owner user; registration creates both records.'), bullet('<b>Garage to operations:</b> customers, vehicles, employees, services, appointments, and job cards are associated with a garage.'), bullet('<b>Job card to billing:</b> job cards contain line items; invoice items preserve descriptions, quantities, unit prices, and totals.'), bullet('<b>Invoice to payments:</b> invoices track grand total, amount paid, remaining balance, and payment status.')]
story += [P('Registration and approval state','H2x')]
story += [data_table([
    ['Status','Meaning','Admin action'],
    ['PENDING','New garage is awaiting a review.','Approve to ACTIVE or reject to INACTIVE.'],
    ['ACTIVE','Garage owner can sign in and use the workspace.','Admin can later deactivate.'],
    ['INACTIVE','Garage is disabled or rejected.','Admin can reactivate when appropriate.'],
], [0.9*inch,2.45*inch,CONTENT_W-3.35*inch])]
story += [Spacer(1,6), callout('Tenant boundary', 'For owner operations, derive the garage from the authenticated user and verify that referenced customers, vehicles, job cards, invoices, or payments belong to that garage. Never trust a client-supplied garage ID as authorization.', RED, HexColor('#FFF1F2'))]
story += [PageBreak()]

# Page 5 - technical Q&A first half
story += heading('04 / Interview questions','Frontend and API design','Answer in your own words. Each sample answer is a compact starting point, not a script.')
qa_items=[
('How is the frontend organized?','Routes in App.jsx separate public, admin, and garage-owner areas. Layouts provide shared navigation; pages handle screens; reusable components cover common states; AuthContext shares login state; services/api.js centralizes Axios calls.'),
('How does protected navigation work?','ProtectedRoute checks the authenticated user and role before rendering an admin or garage-owner layout. The API remains the authority: Spring Security checks the JWT and role on every protected request.'),
('How does login work end to end?','The login form calls POST /api/auth/login. The backend authenticates credentials, returns a JWT and user/role data, and the frontend stores the token and user. Axios sends the token as a Bearer header on subsequent requests.'),
('Why use DTOs instead of returning JPA entities?','DTOs keep the API contract deliberate, avoid exposing persistence internals, and let services shape the response. They also help avoid serializing lazy JPA relationships directly.'),
('How are request errors presented?','The backend has a global exception handler that maps validation, not-found, bad-request, and authentication failures to structured API responses. The frontend surfaces messages through form feedback and toast notifications.'),
('What caused the registration fields to lose focus while typing?','The Field component was declared inside RegisterPage. Each state update recreated that component type, so React remounted the inputs. Moving Field to module scope kept the input identity stable.'),
('How did you fix the registration 403?','The frontend Vite server runs at localhost:3000, but the backend CORS allow-list initially only included localhost:5173. The allow-list now includes both development origins, and requests from port 3000 reach backend validation.'),
]
for q,a in qa_items: story += [qa(q,a), Spacer(1,5)]
story += [PageBreak()]

# Page 6 - backend/security/billing Q&A
story += heading('05 / Interview questions','Backend, security, and billing','Be specific about the rule, where it lives, and what the API returns.')
qa_items2=[
('How is role-based access enforced?','Spring Security is stateless. Public auth endpoints are permitted; /api/admin paths require ADMIN; /api/garage paths require GARAGE_OWNER; profile endpoints require authentication. JWT claims identify the user, and authorities carry the role.'),
('How does garage approval affect sign-in?','Registration creates a garage in PENDING. The admin approval queue changes it to ACTIVE or INACTIVE. AuthService checks the garage status during owner login: pending owners receive an approval message, and inactive owners are blocked.'),
('How do you prevent one garage from reading another garage\'s records?','Owner-facing services resolve the current garage from the authenticated user and scope repository queries or verify ownership after lookup. This boundary should be checked for every ID-based operation, not only the list endpoints.'),
('How is an invoice total calculated?','The service adds job-card service line totals, spare-parts charges, and labor charges. It computes tax from the subtotal and percentage, subtracts the discount, then sets initial paid amount to zero and remaining balance to the grand total.'),
('How are partial payments represented?','Payment records are associated with invoices. The invoice tracks amount paid and remaining balance; status can move among UNPAID, PARTIALLY_PAID, and PAID as payments are applied.'),
('Why use @Transactional?','Related database changes should succeed or roll back together. Registration creates an owner and garage; invoice generation creates an invoice with line items; payment processing updates both a payment record and invoice balance.'),
('How did you change invalid login from 500 to 401?','Bad credentials are Spring AuthenticationException types. The global handler now maps authentication failures to 401 with a safe, user-facing message instead of falling through to a generic internal-server-error response.'),
('Why model states with enums?','Enums constrain values for garage, job, appointment, invoice, payment, and employment status. This makes invalid state values easier to reject and status transitions easier to reason about.'),
]
for q,a in qa_items2: story += [qa(q,a), Spacer(1,5)]
story += [PageBreak()]

# Page 7 - demo/testing/challenges
story += heading('06 / Practical prep','Demo, verification, and project stories','A good interview answer separates what is implemented from what you would improve next.')
story += [P('Five-minute demo route','H2x')]
story += [data_table([
    ['Minute','Action','Point to explain'],
    ['0:00-0:45','Introduce the product and two roles.','Operational workflow plus platform review.'],
    ['0:45-1:45','Open admin overview and pending queue.','Admin reviews the garage registration and approves or rejects.'],
    ['1:45-2:45','Open customers, vehicles, and a job card.','Records form a connected service workflow scoped to a garage.'],
    ['2:45-3:45','Open a completed job card and invoice.','Invoice rules and stored line-item details.'],
    ['3:45-4:30','Show payments and a report.','Payment balance/status and operational reporting.'],
    ['4:30-5:00','Close with a tradeoff and next step.','Test coverage and configuration hardening.'],
], [0.82*inch,2.25*inch,CONTENT_W-3.07*inch])]
story += [P('Useful project stories','H2x')]
story += [qa('Debugging story: registration 403','A useful debugging narrative is to compare the browser origin, Vite proxy, and backend CORS configuration. Here the app used port 3000 while the server allowed only 5173. The allow-list was updated, and a request from port 3000 was verified to reach backend validation.','DEBUGGING'), Spacer(1,5)]
story += [qa('React story: input remount','Typing changed parent state, which recreated a nested Field component. Moving Field outside the page component kept its identity stable. The fields then retained focus through renders.','REACT'), Spacer(1,5)]
story += [P('Verification commands','H2x')]
story += [data_table([
    ['Area','Command','What it checks'],
    ['Frontend','npm run build','Vite production bundle compiles.'],
    ['Backend','mvn -DskipTests package','Java sources compile and Spring Boot packages.'],
    ['Runtime','npm run dev / mvn spring-boot:run','Starts frontend and backend for a manual workflow demo.'],
], [0.82*inch,2.35*inch,CONTENT_W-3.17*inch])]
story += [Spacer(1,6), callout('Be honest about test coverage', 'The current repository has no backend test source files and no frontend test script. Build success is not the same as full workflow coverage. A strong next step is service tests plus API integration tests for registration, approval, tenant isolation, invoice math, and partial payments.', AMBER, HexColor('#FFF8E8'))]
story += [PageBreak()]

# Page 8 - code map, tradeoffs, cheat sheet
story += heading('07 / Final review','Code map and strong closing answers','Use these pointers to navigate the repository quickly during a live discussion.')
story += [data_table([
    ['Concern','Where to look'],
    ['Routes and role layouts','gearflow-frontend/src/App.jsx; layouts/AdminLayout.jsx and GarageOwnerLayout.jsx'],
    ['Login and registration UI','gearflow-frontend/src/pages/auth/LoginPage.jsx and RegisterPage.jsx'],
    ['HTTP client and token header','gearflow-frontend/src/services/api.js; context/AuthContext.jsx'],
    ['Backend route entry points','gearflow-backend/src/main/java/com/gearflow/controller'],
    ['Business rules','gearflow-backend/src/main/java/com/gearflow/service'],
    ['Persistence and domain','gearflow-backend/src/main/java/com/gearflow/entity and repository'],
    ['Authorization/JWT','gearflow-backend/src/main/java/com/gearflow/security'],
    ['Database/JPA config','gearflow-backend/src/main/resources/application.properties'],
], [2.35*inch,CONTENT_W-2.35*inch])]
story += [P('Likely tradeoffs and next improvements','H2x')]
story += [bullet('<b>Configuration:</b> move database credentials and the JWT signing key out of application.properties into environment-specific secrets; rotate the development defaults before deployment.'), bullet('<b>Quality:</b> add frontend component tests and backend unit/integration tests, then exercise the full register-to-approval-to-invoice workflow.'), bullet('<b>Operations:</b> add pagination for large garage/customer lists and structured request logging with correlation IDs.'), bullet('<b>Security:</b> review every ownership check, rate-limit login, validate all state transitions, and use short-lived tokens with a considered refresh/revocation strategy.')]
story += [P('Rapid-fire review','H2x')]
story += [callout('Remember these five points', '1. React/Vite frontend, Spring Boot REST backend, MySQL database.<br/>2. Role-based admin and garage-owner experiences.<br/>3. JWT bearer authentication with stateless Spring Security.<br/>4. Garage registration starts PENDING; admin approval activates the owner workspace.<br/>5. The core business journey is customer -> vehicle -> job card -> invoice -> payment.', BLUE)]
story += [Spacer(1,10), P('One strong closing statement','H2x')]
story += [P('GearFlow demonstrates a connected business workflow rather than isolated CRUD screens. The most important engineering concerns are preserving garage boundaries, keeping billing calculations consistent, and making account state transitions clear to both the administrator and garage owner. The next step is to strengthen automated coverage and production configuration.', 'Bodyx')]
story += [Spacer(1,7), P('Glossary: DTO = Data Transfer Object. JPA = Java Persistence API. JWT = JSON Web Token. CORS = Cross-Origin Resource Sharing. ORM = Object-Relational Mapping.', 'Smallx')]


doc=GearFlowDoc(str(OUT), pagesize=letter, leftMargin=LEFT, rightMargin=RIGHT, topMargin=TOP, bottomMargin=BOTTOM, title='GearFlow Project Interview Guide', author='OpenAI')
doc.build(story)
print(str(OUT))



