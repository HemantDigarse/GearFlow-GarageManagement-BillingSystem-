import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const W=1280, H=720, FONT='Arial';
const C={navy:'#10243A', navy2:'#183651', blue:'#2864DC', cyan:'#16A6A1', green:'#17835C', amber:'#D89928', red:'#BA4B54', ink:'#172536', muted:'#56677A', pale:'#F3F7FB', line:'#DCE5ED', white:'#FFFFFF', softblue:'#EAF1FF', softcyan:'#E6F6F4', softamber:'#FFF4DE', softred:'#FCEBED'};
const p=Presentation.create({slideSize:{width:W,height:H}});
const out='D:/GearFlow/.presentation-build';
await fs.mkdir(out,{recursive:true});

function rect(s,x,y,w,h,fill,opts={}){
 return s.shapes.add({geometry:opts.geometry||'roundRect',name:opts.name,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:opts.stroke||'none',width:opts.stroke?1:0},...(opts.radius?{borderRadius:opts.radius}:{})});
}
function text(s,str,x,y,w,h,size,color=C.ink,opts={}){
 const sh=s.shapes.add({geometry:'textbox',name:opts.name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{style:'solid',fill:'none',width:0}});
 sh.text=str;
 sh.text.style={fontFamily:FONT,fontSize:`${size}pt`,color,bold:!!opts.bold,alignment:opts.align||'left',verticalAlignment:opts.valign||'middle',wrap:true};
 return sh;
}
function line(s,x1,y1,x2,y2,color=C.line,width=1){
 return s.shapes.add({geometry:'line',position:{left:x1,top:y1,width:x2-x1,height:y2-y1},fill:'none',line:{style:'solid',fill:color,width}});
}
function base(title,kicker,num,sub=''){
 const s=p.slides.add(); s.background.fill=C.white;
 rect(s,0,0,W,10,C.navy,{geometry:'rect'});
 text(s,kicker.toUpperCase(),72,30,900,20,10,C.cyan,{bold:true});
 text(s,title,72,58,1130,54,29,C.navy,{bold:true});
 if(sub) text(s,sub,72,117,1120,28,13,C.muted);
 line(s,72,665,1208,665,C.line,0.8);
 text(s,'GEARFLOW  |  PROPOSED DEVOPS ARCHITECTURE',72,674,750,18,8,C.muted,{bold:true});
 text(s,String(num).padStart(2,'0'),1160,674,48,18,8,C.muted,{align:'right'});
 return s;
}
function label(s,str,x,y,w,fill,color=C.navy){rect(s,x,y,w,24,fill,{radius:'rounded-md'});text(s,str,x+6,y+1,w-12,21,9,color,{bold:true,align:'center'});}
function bulletBlock(s,items,x,y,w,lineH=43,size=16,color=C.ink,bulletColor=C.cyan){
 items.forEach((item,i)=>{const yy=y+i*lineH;rect(s,x,yy+9,7,7,bulletColor,{geometry:'ellipse'});text(s,item,x+20,yy,w-20,lineH-4,size,color);});
}
function step(s,x,y,w,title,detail,color=C.blue){
 rect(s,x,y,w,110,C.white,{stroke:C.line}); rect(s,x,y,7,110,color,{geometry:'rect'});
 text(s,title,x+20,y+17,w-36,30,16,C.navy,{bold:true}); text(s,detail,x+20,y+50,w-36,47,11,C.muted);
}

// 1: Cover
{
 const s=p.slides.add(); s.background.fill=C.navy;
 rect(s,0,0,18,H,C.cyan,{geometry:'rect'});
 text(s,'GEARFLOW  /  PLATFORM DELIVERY',76,68,800,25,11,'#80D7D0',{bold:true});
 text(s,'DevOps architecture',76,142,800,80,38,C.white,{bold:true});
 text(s,'Infrastructure as code, automated deployment, and service monitoring',76,236,830,68,22,'#D6E3F0');
 line(s,76,337,850,337,'#35516C',1.2);
 text(s,'Terraform  ·  Ansible  ·  Nagios',76,366,720,38,18,C.white,{bold:true});
 text(s,'A proposed delivery design for the GearFlow garage management platform',76,415,760,45,14,'#B7C9DB');
 // Editable architecture path
 const nodes=[['APP','React + Spring'],['INFRA','Terraform'],['CONFIG','Ansible'],['OPS','Nagios']];
 let x=76;
 for(let i=0;i<nodes.length;i++){
   rect(s,x,555,214,78,'#193651',{stroke:'#3E5E7D'});
   text(s,nodes[i][0],x+14,566,186,17,9,'#80D7D0',{bold:true});
   text(s,nodes[i][1],x+14,586,186,29,14,C.white,{bold:true});
   if(i<nodes.length-1){text(s,'→',x+219,578,36,30,22,'#80D7D0',{bold:true,align:'center'});}
   x+=256;
 }
 text(s,'DESIGN PROPOSAL  |  GEARFLOW CODEBASE REVIEW',76,678,760,18,8,'#A9BCD0',{bold:true});
}

// 2 Current state vs proposal
{
 const s=base('GearFlow today and the deployment gap','CURRENT APPLICATION','02','The codebase already has a web app and API. The infrastructure automation below is a proposed extension.');
 text(s,'IN THE REPOSITORY',82,176,420,24,11,C.blue,{bold:true});
 text(s,'DEPLOYMENT EXTENSIONS',670,176,460,24,11,C.cyan,{bold:true});
 line(s,627,174,627,580,C.line,1.2);
 bulletBlock(s,[
   'React 18 + Vite frontend; Axios calls the /api routes',
   'Spring Boot 3 REST API with role-based JWT security',
   'MySQL persistence through Spring Data JPA',
   'Separate admin and garage-owner workflows',
 ],82,218,490,66,15,C.ink,C.blue);
 bulletBlock(s,[
   'No Terraform, Ansible, CI pipeline, or Nagios config is present today',
   'Package the React build and Spring Boot JAR as release artifacts',
   'Provision hosts/network with Terraform; configure and deploy with Ansible',
   'Add health endpoints and Nagios checks before production rollout',
 ],670,218,530,66,15,C.ink,C.cyan);
 rect(s,82,526,1110,64,C.softamber);
 text(s,'Scope note',100,537,120,20,10,C.amber,{bold:true});
 text(s,'This deck describes a deployment design to implement; it does not claim these tools are already embedded in GearFlow.',222,534,940,42,13,C.ink);
}

// 3 Architecture
{
 const s=base('Release flow connects code to operations','TARGET DELIVERY FLOW','03','One release artifact moves through tested, repeatable deployment steps.');
 const steps=[
   ['1  Commit','Source change triggers CI',C.blue],
   ['2  Build','Frontend + backend packages',C.blue],
   ['3  Provision','Terraform creates/updates hosts',C.cyan],
   ['4  Configure','Ansible deploys the release',C.cyan],
   ['5  Verify','Smoke tests + Nagios checks',C.green],
 ];
 const x0=72,gap=18,bw=210;
 steps.forEach((st,i)=>{
   step(s,x0+i*(bw+gap),242,bw,st[0],st[1],st[2]);
   if(i<steps.length-1) text(s,'›',x0+i*(bw+gap)+bw+1,277,17,34,22,C.muted,{bold:true,align:'center'});
 });
 text(s,'RELEASE CONTENTS',82,413,300,22,10,C.blue,{bold:true});
 text(s,'gearflow-frontend/dist  +  gearflow-backend JAR  +  version and checksum',82,444,1080,39,18,C.navy,{bold:true});
 line(s,82,507,1192,507,C.line,1);
 text(s,'Gates',82,532,95,24,11,C.cyan,{bold:true});
 text(s,'Tests pass  →  deployment approval  →  health checks pass  →  monitor release',178,526,990,40,14,C.ink);
}

// 4 Terraform
{
 const s=base('Terraform defines the environment','INFRASTRUCTURE AS CODE','04','Keep production topology small at first and expand only when traffic and availability needs justify it.');
 text(s,'TERRAFORM OWNS',82,190,380,22,11,C.cyan,{bold:true});
 bulletBlock(s,[
  'Network, subnets, firewall rules, and DNS',
  'Linux application host and database host or managed MySQL',
  'Private database access from the application tier only',
  'Environment variables, tags, and repeatable dev / stage / prod plans',
 ],82,229,450,55,15,C.ink,C.cyan);
 text(s,'REFERENCE ENVIRONMENT',630,190,500,22,11,C.blue,{bold:true});
 // native editable topology diagram
 rect(s,638,232,530,296,C.pale,{stroke:C.line});
 text(s,'PRIVATE CLOUD NETWORK',664,245,475,20,9,C.muted,{bold:true});
 rect(s,672,288,205,92,C.softblue,{stroke:'#C8D8F2'});
 text(s,'APP HOST',688,301,173,20,11,C.blue,{bold:true});
 text(s,'Nginx static UI\nSpring Boot API',688,326,173,42,13,C.navy);
 rect(s,936,288,205,92,C.softcyan,{stroke:'#B8E2DC'});
 text(s,'DATABASE',952,301,173,20,11,C.green,{bold:true});
 text(s,'MySQL\nprivate subnet',952,326,173,42,13,C.navy);
 line(s,877,333,936,333,C.blue,2);
 text(s,'3306',885,306,48,20,9,C.muted,{bold:true,align:'center'});
 rect(s,805,426,205,62,C.white,{stroke:C.line});
 text(s,'Nagios host / service checks',817,440,181,34,11,C.navy,{bold:true,align:'center'});
 line(s,775,380,875,426,C.cyan,1.4); line(s,936,380,1038,426,C.cyan,1.4);
 rect(s,82,554,1086,50,C.softamber);
 text(s,'State and safety',100,563,145,25,11,C.amber,{bold:true});
 text(s,'Use remote state with locking; review terraform plan before apply; keep database ingress private.',252,560,890,34,12,C.ink);
}

// 5 Ansible
{
 const s=base('Ansible configures hosts and deploys releases','CONFIGURATION MANAGEMENT','05','Use idempotent roles so repeated runs converge on the same known state.');
 const roles=[
   ['base','OS packages, users, SSH hardening'],
   ['java','JRE 17 and system dependencies'],
   ['web','Nginx config and React static files'],
   ['app','Spring Boot JAR, systemd unit, env file'],
   ['monitoring','Nagios agent/plugin setup'],
 ];
 roles.forEach((r,i)=>{
   const y=196+i*76;
   text(s,String(i+1).padStart(2,'0'),90,y+3,36,27,13,C.cyan,{bold:true});
   text(s,r[0],145,y,180,31,18,C.navy,{bold:true});
   text(s,r[1],335,y,490,31,14,C.ink);
   line(s,145,y+42,825,y+42,C.line,0.8);
 });
 rect(s,900,197,290,350,C.navy);
 text(s,'RELEASE RUN',926,219,240,25,11,'#80D7D0',{bold:true});
 text(s,'1  Stage versioned artifacts',926,270,240,38,14,C.white,{bold:true});
 text(s,'2  Render environment config',926,326,240,38,14,C.white,{bold:true});
 text(s,'3  Restart systemd service',926,382,240,38,14,C.white,{bold:true});
 text(s,'4  Check health; roll back on failure',926,438,240,54,14,C.white,{bold:true});
 text(s,'Keep secrets in a vault or CI secret store.',926,510,240,25,10,'#B7C9DB');
 text(s,'Inventory pattern',82,590,170,23,10,C.blue,{bold:true});
 text(s,'inventories/dev  |  inventories/stage  |  inventories/prod',250,583,850,32,13,C.muted);
}

// 6 CI/CD
{
 const s=base('CI pipeline validates each release','CONTINUOUS INTEGRATION AND DELIVERY','06','Jenkins is one suitable pipeline runner; the stages matter more than the brand.');
 const stage=[
  ['Source','Push / pull request'],['Build','npm ci + npm build\nMaven package'],['Quality','Unit checks\ndependency scan'],['Release','Version artifacts\nchecksum'],['Deploy','Terraform plan\nAnsible rollout'],['Verify','HTTP smoke test\nNagios status'],
 ];
 const x0=72,bw=171,gap=23;
 stage.forEach((st,i)=>{
   const x=x0+i*(bw+gap);
   rect(s,x,246,bw,140,i<4?C.pale:C.softcyan,{stroke:C.line});
   text(s,String(i+1).padStart(2,'0'),x+14,260,38,22,10,i<4?C.blue:C.green,{bold:true});
   text(s,st[0],x+14,292,bw-28,31,16,C.navy,{bold:true});
   text(s,st[1],x+14,330,bw-28,46,11,C.muted);
   if(i<stage.length-1) text(s,'›',x+bw+2,295,gap-2,26,20,C.muted,{bold:true,align:'center'});
 });
 text(s,'PROMOTION RULE',82,442,210,22,10,C.cyan,{bold:true});
 text(s,'Build once, promote the same version from staging to production.',82,472,820,35,18,C.navy,{bold:true});
 bulletBlock(s,[
  'Require a human approval before production infrastructure changes.',
  'Separate CI credentials by environment; record who released which version.',
 ],82,532,1040,39,13,C.ink,C.amber);
}

// 7 Nagios
{
 const s=base('Nagios watches host health and user-facing services','MONITORING AND ALERTING','07','Add an explicit health endpoint before configuring an HTTP health check.');
 text(s,'CHECK',82,196,220,22,10,C.blue,{bold:true});
 text(s,'SIGNAL',355,196,265,22,10,C.cyan,{bold:true});
 text(s,'RESPONSE',748,196,280,22,10,C.green,{bold:true});
 const checks=[
  ['Host','CPU, memory, disk, reachability','On-call alert; investigate capacity'],
  ['Process','Spring Boot systemd service','Restart policy; inspect application logs'],
  ['HTTP','Nginx plus /actuator/health','Page on failure; roll back recent release'],
  ['Database','MySQL availability and connections','Check service, access, and connection pool'],
 ];
 checks.forEach((r,i)=>{
   const y=232+i*74;
   text(s,r[0],82,y,205,35,16,C.navy,{bold:true});
   text(s,r[1],355,y,340,39,13,C.ink);
   text(s,r[2],748,y,418,43,12,C.muted);
   line(s,82,y+51,1190,y+51,C.line,0.8);
 });
 rect(s,82,551,1100,68,C.softamber);
 text(s,'Implementation note',100,561,180,23,10,C.amber,{bold:true});
 text(s,'Spring Boot Actuator is not currently a dependency in the repository. Add and secure it before relying on /actuator/health.',286,556,865,44,13,C.ink);
}

// 8 Security & environments
{
 const s=base('Environment separation protects releases and data','SECRETS AND ACCESS','08','Keep operational credentials outside source control and limit each layer to the access it needs.');
 const envs=[['DEV','Fast iteration','non-production data'],['STAGE','Release rehearsal','production-like config'],['PROD','Approved release','backups + alerting']];
 envs.forEach((e,i)=>{
  const x=82+i*371;
  text(s,e[0],x,195,300,25,11,[C.blue,C.cyan,C.green][i],{bold:true});
  text(s,e[1],x,228,310,35,17,C.navy,{bold:true});
  text(s,e[2],x,266,310,32,12,C.muted);
  if(i<2) line(s,x+300,242,x+350,242,C.line,1.5);
 });
 line(s,82,322,1190,322,C.line,1);
 const col1=[
  'Terraform state: remote storage, locking, restricted access',
  'Ansible secrets: encrypted vault or managed secret service',
  'CI credentials: least privilege and rotation',
 ];
 const col2=[
  'Database: private network path; no public MySQL port',
  'Application: non-root service account and protected config',
  'Operations: audit deployments and keep rollback artifacts',
 ];
 text(s,'CONTROL PLANE',82,352,430,24,10,C.blue,{bold:true});
 bulletBlock(s,col1,82,390,510,57,14,C.ink,C.blue);
 text(s,'RUNTIME',670,352,430,24,10,C.cyan,{bold:true});
 bulletBlock(s,col2,670,390,510,57,14,C.ink,C.cyan);
 rect(s,82,584,1100,42,C.navy);
 text(s,'The database password and JWT signing key must move from application.properties into environment-specific secrets.',98,591,1064,25,11,C.white,{bold:true});
}

// 9 Rollout plan
{
 const s=base('A staged rollout reduces deployment risk','IMPLEMENTATION PLAN','09','Start with repeatable delivery in staging, then promote after measurable checks pass.');
 const items=[
  ['01','Package','Document versioned frontend and backend build outputs.'],
  ['02','Provision','Create dev/stage hosts and private network rules with Terraform.'],
  ['03','Configure','Deploy the same release using Ansible roles and inventories.'],
  ['04','Observe','Add Actuator health endpoint and Nagios host/service checks.'],
  ['05','Promote','Run smoke tests, approve production, and rehearse rollback.'],
 ];
 items.forEach((r,i)=>{
  const y=190+i*75;
  text(s,r[0],90,y+3,48,28,14,i===4?C.green:C.cyan,{bold:true});
  text(s,r[1],158,y,180,34,18,C.navy,{bold:true});
  text(s,r[2],350,y,810,42,13,C.ink);
  if(i<items.length-1) line(s,112,y+37,112,y+68,C.line,1.2);
 });
 rect(s,82,583,1100,49,C.softcyan);
 text(s,'Success criteria',100,593,155,24,10,C.green,{bold:true});
 text(s,'Repeatable deploy  •  verified health  •  private database  •  tested rollback',264,589,875,34,13,C.navy,{bold:true});
}

// 10 Close
{
 const s=p.slides.add(); s.background.fill=C.navy;
 rect(s,0,0,18,H,C.cyan,{geometry:'rect'});
 text(s,'GEARFLOW',76,68,600,24,11,'#80D7D0',{bold:true});
 text(s,'A clear path from code\nto monitored service',76,146,880,132,34,C.white,{bold:true});
 text(s,'Terraform provisions. Ansible configures. Nagios monitors.',76,319,985,45,20,'#D6E3F0');
 line(s,76,400,850,400,'#35516C',1.2);
 text(s,'Pipeline runner: Jenkins (example)',76,433,740,30,15,C.white,{bold:true});
 text(s,'Deployment model: versioned artifacts, gated promotion, health checks, rollback',76,476,980,52,14,'#B7C9DB');
 text(s,'PROPOSED ARCHITECTURE  |  NOT YET CONFIGURED IN THE CURRENT REPOSITORY',76,678,1080,18,8,'#A9BCD0',{bold:true});
}

async function saveBlob(file,blob){await fs.writeFile(file,new Uint8Array(await blob.arrayBuffer()));}
for(let i=0;i<p.slides.items.length;i++){
 const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await saveBlob(path.join(out,`slide-${String(i+1).padStart(2,'0')}.png`),b);
}
const pptx=await PresentationFile.exportPptx(p);
await pptx.save(path.join(out,'GearFlow_DevOps_Architecture_Draft.pptx'));
console.log(JSON.stringify({slideCount:p.slides.items.length, draft:path.join(out,'GearFlow_DevOps_Architecture_Draft.pptx')}));


