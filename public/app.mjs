import {choose,isMorning,availableGroups,sceneFor} from './engine.mjs';
import {groups,activities,intensities,sourceFallback} from './meta.mjs';
import {el,btn,icon,toast,api} from './ui.mjs';
import {openAdmin} from './admin.mjs';

const main=document.querySelector('#main');
const menu=document.querySelector('#menu');
const menuButton=document.querySelector('#menu-button');
const dialog=document.querySelector('#info-dialog');
let config,sources=sourceFallback,version=0,answers={},step=0,run=0,turn=0,busy=false,controller;
let manualTime='',lastScene='',motionPaused=false,view='quiz';
const seen=new Map();
const infoButton=document.querySelector('#info-button');
function motionReduced(){return motionPaused||config?.settings.motion===false||matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData===true;}
// The optional demo stays in the project, but has no visitor-facing entry point.
infoButton.addEventListener('click',showSources);

function now(){const d=new Date();if(manualTime){const[h,m]=manualTime.split(':').map(Number);d.setHours(h,m,0,0);}return d;}
function updateMotion(){const reduced=motionReduced();document.body.classList.toggle('motion-off',reduced);}
function closeMenu(){if(menu.open)menu.close();menuButton.setAttribute('aria-expanded','false');}
menu.addEventListener('close',()=>menuButton.setAttribute('aria-expanded','false'));
function showMenu(){
 if(menu.open)return closeMenu();
 menu.replaceChildren(
  el('div',{class:'menu-top'},el('span',{},'Menü'),btn('×',closeMenu,'icon-button',{'aria-label':'Menü schließen'})),
  btn('Neu beginnen',()=>home(),'menu-item'),
  btn('Anwendung & Quellen',()=>{closeMenu();showSources();},'menu-item'),
  btn(motionPaused?'Bewegung erlauben':'Bewegung pausieren',()=>{motionPaused=!motionPaused;updateMotion();closeMenu();},'menu-item'),
  el('details',{class:'clock-settings'},el('summary',{},'Uhrzeit anpassen'),
   el('label',{},'Uhrzeit für diesen Besuch',el('input',{type:'time',value:manualTime||now().toTimeString().slice(0,5),'aria-label':'Manuelle Uhrzeit',onchange:e=>{manualTime=e.target.value;clockChanged();}})),
   btn('Gerätezeit verwenden',()=>{manualTime='';clockChanged();closeMenu();},'text-button')),
  btn('Verwaltung',()=>{closeMenu();admin();},'menu-item'));
 menuButton.setAttribute('aria-expanded','true');menu.showModal();
}
menuButton.addEventListener('click',showMenu);
menu.addEventListener('click',e=>{if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeMenu();}});
document.querySelector('#home').addEventListener('click',()=>home());
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});

async function refresh(signal){
 const data=await api('/api/config',{signal,headers:version?{'If-None-Match':`"${version}"`}:{}});
 if(!data.unchanged){config=data.config;version=data.version;sources=data.sources;document.querySelector('#brand').textContent=config.settings.title;document.title=`${config.settings.title} — Duft finden`;updateMotion();}
 return config;
}
function focusMain(){requestAnimationFrame(()=>{if(document.querySelector('#opening:not([hidden])'))return;main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});});}
function mount(node){main.replaceChildren(node);document.body.dataset.view=view;focusMain();}
function atmosphere(){
 const scene=sceneFor(config,now());lastScene=scene.id;
 return el('aside',{class:'atmosphere','aria-hidden':'true','data-time':scene.time},
  el('div',{class:'light-body'},el('div',{class:'lens-surface'},
   config.settings.images&&scene.id?el('img',{src:`/assets/${scene.id}.svg`,alt:'',width:1400,height:1800,decoding:'async',fetchpriority:'high',onerror:e=>e.currentTarget.remove()}):null),
   el('div',{class:'lens-rim'})),el('div',{class:'cast-shadow'}));
}
function layout(copy,cls){return el('div',{class:`composition ${cls} enter`},copy,atmosphere());}
function questionTitle(){return config.settings.tagline==='Was braucht dein Dazwischen?'?'Was hast du vor?':config.settings.tagline;}
function home(push=true){
 run++;controller?.abort();busy=false;step=0;answers={};view='quiz';closeMenu();if(dialog.open)dialog.close();
 main.removeAttribute('aria-busy');if(push)history.replaceState({run,step:0},'','/');if(config)renderQuiz();
}
function forward(){step++;history.pushState({run,step},'','/');renderQuiz();}
async function setActivity(activity){
 if(busy)return;const id=run;answers={activity};controller?.abort();controller=new AbortController();busy=true;
 main.setAttribute('aria-busy','true');main.querySelectorAll('.choice').forEach(b=>b.disabled=true);
 const error=main.querySelector('.flow-error');if(error)error.textContent='';
 const progressLabel=main.querySelector('.progress');if(progressLabel)progressLabel.textContent='Prüfen …';
 try{await refresh(controller.signal);if(id===run)forward();}
 catch(e){if(e.name!=='AbortError'&&id===run){if(error)error.textContent='Der aktuelle Bestand ist nicht erreichbar. Bitte erneut versuchen.';if(progressLabel)progressLabel.replaceChildren('1',el('span',{},'/ 3'));}}
 finally{if(id===run){busy=false;main.removeAttribute('aria-busy');main.querySelectorAll('.choice').forEach(b=>b.disabled=false);}}
}
function setGroup(group){answers.group=group;forward();}
function back(){if(step<=0)return home();step--;history.pushState({run,step},'','/');renderQuiz();}
function progress(){return el('div',{class:'flow-nav'},step>0?btn(el('span',{html:icon('back')}),back,'back-button',{'aria-label':'Zurück'}):el('span',{class:'flow-context'},'Duft finden'),el('span',{class:'progress','aria-label':`Frage ${step+1} von 3`},`${step+1}`,el('span',{},'/ 3')));}
function selectChoice(name,detail,fn,selected=false){return btn([el('span',{class:'choice-copy'},el('span',{class:'choice-name'},name),detail?el('small',{},detail):null),el('span',{class:'selection-mark','aria-hidden':'true'})],fn,`choice${selected?' selected':''}`,{'aria-pressed':selected});}
function renderQuiz(){
 if(!config)return;
 if(answers.activity==='wake'&&!isMorning(now())){answers={};step=0;toast('Aufwachen ist von 06:00 bis vor 11:00 Uhr verfügbar. Bitte wähle neu.');}
 view='quiz';const copy=el('section',{class:'copy'},progress());
 if(step===0){
  copy.append(config.settings.tagline==='Was braucht dein Dazwischen?'?el('h1',{},'Was hast',el('br'),'du vor?'):el('h1',{},questionTitle()));
  const choices=el('div',{class:'choices activity-choices','aria-label':'Tätigkeit'});
  for(const[key,a]of Object.entries(activities)){
   if(key==='wake'&&!isMorning(now()))continue;
   choices.append(selectChoice(a.name,key==='wake'?'Nur morgens':null,()=>setActivity(key),answers.activity===key));
  }copy.append(choices);
 }else if(step===1){
  copy.append(el('h1',{},'Welche',el('br'),'Duftrichtung?'));
  const ids=availableGroups(config,answers.activity);const choices=el('div',{class:'choices fragrance-choices','aria-label':'Duftrichtung'});
  for(const id of ids){const g=groups[id];choices.append(selectChoice(g.name,g.description,()=>setGroup(id),answers.group===id));}
  if(!ids.length)choices.append(el('p',{class:'notice'},'Keine exakte Duftidee verfügbar. Wir können eine gekennzeichnete Alternative prüfen.'));
  copy.append(choices,btn('Such du etwas aus',()=>setGroup('any'),'text-button surrender'));
 }else{
  copy.append(el('h1',{},'Wie',el('br'),'intensiv?'));
  const choices=el('div',{class:'choices intensity-choices','aria-label':'Intensität'});
  for(const[key,name]of Object.entries(intensities))choices.append(selectChoice(name,config.settings.defaultIntensity===key?'Hausstandard':null,()=>result(key),answers.intensity===key));
  copy.append(choices);
  if(config.device.review!=='verified')copy.append(el('p',{class:'dose-note'},'Noch keine Tropfenmengen: Die Dosierungsgrundlage ist ungeprüft.'));
 }
 copy.append(el('div',{class:'flow-error',role:'alert'}));mount(layout(copy,`quiz step-${step}`));
}
async function result(intensity=answers.intensity){
 if(busy)return;answers.intensity=intensity;const id=run;controller?.abort();controller=new AbortController();busy=true;
 main.setAttribute('aria-busy','true');const action=main.querySelector('.result-actions .primary');if(action)action.textContent='Wird geprüft …';
 main.querySelectorAll('.choice,.result-actions button').forEach(b=>b.disabled=true);
 const error=main.querySelector('.flow-error');if(error)error.textContent='';
 try{
  await refresh(controller.signal);if(id!==run)return;
  const key=`${answers.activity}:${answers.group}`,historySeen=seen.get(key)||[];
  const selected=choose(config,answers,{date:now(),turn:turn++,seen:historySeen});
  if(selected.resetMorning){answers={};step=0;renderQuiz();return;}
  if(selected.empty){view='result';mount(layout(el('section',{class:'copy'},el('h1',{},'Gerade kein passender Duft.'),el('p',{class:'empty-detail'},selected.reason),btn('Auswahl ändern',()=>edit(0),'primary')),'empty'));return;}
  seen.set(key,[...historySeen.slice(-50),selected.signature]);step=3;view='result';history.pushState({run,step},'','/');renderResult(selected);
 }catch(e){
  if(e.name!=='AbortError'&&id===run){const message='Der aktuelle Bestand ist nicht erreichbar. Bitte erneut versuchen.';if(error)error.textContent=message;else toast(message);if(action)action.textContent='Andere Mischung';}
 }finally{if(id===run){busy=false;main.removeAttribute('aria-busy');main.querySelectorAll('.choice,.result-actions button').forEach(b=>{if(b.dataset.only==='true')return;b.disabled=false;});}}
}
function edit(target=0){controller?.abort();busy=false;main.removeAttribute('aria-busy');if(dialog.open)dialog.close();step=target;history.pushState({run,step},'','/');renderQuiz();}
function showSelection(){
 const box=document.querySelector('#dialog-content');box.replaceChildren(el('h2',{id:'dialog-title'},'Auswahl ändern'),
  el('div',{class:'edit-choices'},
   selectChoice(activities[answers.activity].name,'Tätigkeit',()=>edit(0)),
   selectChoice(groups[answers.group]?.name||'Frei ausgewählt','Duftrichtung',()=>edit(1)),
   selectChoice(intensities[answers.intensity],'Intensität',()=>edit(2))));
 const buttons=box.querySelectorAll('button');['Tätigkeit ändern','Duftrichtung ändern','Intensität ändern'].forEach((s,i)=>buttons[i].setAttribute('aria-label',s));dialog.showModal();
}
function renderResult(selected){
 const r=selected.recipe,dosed=!!selected.parts;
 const copy=el('section',{class:'copy'},el('h1',{},r.name));
 const parts=el('dl',{class:'recipe-parts','aria-label':dosed?'Geprüfte Tropfenmengen':'Mischungsverhältnis, keine Dosierung'});
 for(const p of selected.parts||r.parts){const oil=config.oils.find(o=>o.id===p.oil);parts.append(el('div',{class:'part'},el('dt',{class:'part-name'},oil.name),el('dd',{class:'part-amount'},dosed?p.drops:p.ratio,el('span',{},dosed?'Tropfen':p.ratio===1?'Teil':'Teile'))));}
 copy.append(parts,el('p',{class:'scent-description'},r.description));
 if(!dosed)copy.append(el('div',{class:'recipe-note'},el('strong',{},'Verhältnis, keine Tropfenangabe.'),el('span',{},'Produkt- oder Geräteprüfung steht aus. Die Intensität ist noch undosiert.'),btn('Details',()=>showSources(),'inline-link',{'aria-label':'Hinweise zur ungeprüften Dosierung'})));
 else copy.append(el('p',{class:'recipe-note'},'Interne Rezeptregel. Wasser nur bis MAX.',btn('Anwendung',()=>showSources(),'inline-link')));
 if(selected.fallback)copy.append(el('p',{class:'notice fallback'},'Alternative: Die Duftrichtung passt, die Tätigkeit ist diesem Rezept nicht ausdrücklich zugeordnet.'));
 const again=btn('Andere Mischung',()=>result(),'primary');
 if(!selected.alternatives){again.disabled=true;again.dataset.only='true';again.title='Keine weitere passende Zusammensetzung verfügbar.';}
 copy.append(el('div',{class:'result-actions'},again,btn('Auswahl ändern',showSelection,'text-button')));
 if(!selected.alternatives)copy.append(el('p',{class:'availability-note'},'Aktuell die einzige passende Zusammensetzung.'));
 copy.append(el('div',{class:'flow-error',role:'alert'}));mount(layout(copy,'result'));
}
function showSources(){
 const box=document.querySelector('#dialog-content');box.replaceChildren(
  el('h2',{id:'dialog-title'},'Anwendung & Quellen'),
  el('p',{},'Eigene redaktionelle Duftideen. Keine belegte Wirkung auf Schlaf, Konzentration oder Gesundheit.'),
  el('details',{class:'info-detail'},el('summary',{},'Prüfstand & Dosierung'),
   el('p',{},'Die Produkt- und Geräteangaben wurden aus der bisherigen Installation übernommen. Freigaben sind dokumentierte Verwaltungsentscheidungen, keine allgemeine Sicherheitsgarantie. Beachte konkrete Produktvarianten und regionale Unterschiede.'),
   el('p',{},'Nur bei dokumentierter Produkt- und Gerätegrundlage werden Tropfen angezeigt, sonst Verhältnisse. Ein Teil bedeutet nicht ein Tropfen. Die Stufen 2, 3 und 4 und die Grenze von 4 Tropfen sind interne Rezeptregeln, keine Herstellerhöchstmenge. Die Lucy-Anleitung nennt 2–3 Tropfen zum Einstieg; bei einem neuen Duft zurückhaltend beginnen.')),
  el('details',{class:'info-detail'},el('summary',{},'Vor der Anwendung'),
   el('p',{},'Beachte die Anleitung deines Geräts und das Etikett der konkreten Ölflasche. Nicht einnehmen und nicht als Hautanleitung verwenden. Bei empfindlichen Personen, Kindern, Schwangerschaft oder Tieren im Raum vorher fachlichen Rat einholen; bei Beschwerden die Anwendung beenden. Duft ersetzt kein Lüften.')),
  el('h3',{},'Ausgangsquellen'));
 for(const s of sources)box.append(el('a',{class:'source',href:s.url,target:'_blank',rel:'noopener noreferrer'},s.title,el('small',{},s.kind)));
 const reviewed=[...(config?.oils??[]).filter(o=>o.review==='verified').map(o=>({name:o.name,url:o.source,date:o.reviewedAt})),...(config?.device?.review==='verified'?[{name:config.device.name,url:config.device.source,date:config.device.reviewedAt}]:[])];
 if(reviewed.length){box.append(el('h3',{},'Dokumentierte Prüfungen'));for(const p of reviewed)box.append(el('a',{class:'source',href:p.url,target:'_blank',rel:'noopener noreferrer'},p.name,el('small',{},`Prüfdatum laut Verwaltung: ${p.date}`)));}
 box.append(el('details',{class:'info-detail'},el('summary',{},'Projekt & Darstellung'),el('p',{},'Keine offizielle Partnerschaft oder Freigabe durch doTERRA oder Stadler Form. Die saisonalen Landschaften sind eigene Illustrationen, keine Wetterdaten. Keine externen Medienanfragen und keine Standortabfrage. Quizantworten werden nicht dauerhaft gespeichert.')));
 if(!dialog.open)dialog.showModal();
}
async function admin(){
 run++;controller?.abort();answers={};view='admin';busy=false;main.removeAttribute('aria-busy');const adminRun=run;
 history.pushState({view:'admin'},'','#verwaltung');document.body.dataset.view='admin';
 await openAdmin(main,{onHome:home,isActive:()=>view==='admin'&&run===adminRun,onSaved:async()=>{version=0;await refresh();}});
}
function clockChanged(){
 if(!config)return;
 if(answers.activity==='wake'&&!isMorning(now())){controller?.abort();run++;busy=false;main.removeAttribute('aria-busy');answers={};step=0;history.replaceState({run,step},'','/');renderQuiz();toast('Es ist nicht mehr Morgen. Bitte wähle deine Tätigkeit neu.');}
 else if(view==='quiz')renderQuiz();else if(view==='result'){const scene=main.querySelector('.atmosphere');if(scene)scene.replaceWith(atmosphere());}
}
window.addEventListener('popstate',e=>{closeMenu();if(e.state?.overlay==='info'||location.hash==='#info'){showSources();return;}controller?.abort();busy=false;main.removeAttribute('aria-busy');if(dialog.open)dialog.close();if(location.hash==='#verwaltung')return admin();if(e.state?.run===run&&Number.isInteger(e.state.step)&&e.state.step>=0&&e.state.step<=2&&(e.state.step===0||answers.activity)){step=e.state.step;renderQuiz();}else home(false);});
window.addEventListener('pageshow',e=>{if(e.persisted)home();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)clockChanged();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',updateMotion);
setInterval(()=>{if(!config)return;if(answers.activity==='wake'&&!isMorning(now()))clockChanged();else if(view!=='admin'&&sceneFor(config,now()).id!==lastScene)clockChanged();},30000);
try{const startOnInfo=location.hash==='#info';await refresh();if(location.hash==='#verwaltung')await admin();else{home(true);if(startOnInfo)showSources();}}
catch{mount(el('section',{class:'login'},el('h1',{},'Bestand nicht erreichbar.'),el('p',{class:'error-box'},'Bitte versuche es erneut. Ohne aktuellen Bestand geben wir keine Empfehlung aus.'),btn('Erneut versuchen',()=>location.reload(),'primary')));}
