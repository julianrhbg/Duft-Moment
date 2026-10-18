import {choose,isMorning,availableGroups,sceneFor,dateKey} from './engine.mjs';
import {groups,activities,intensities} from './meta.mjs';
import {el,btn,icon,toast,api} from './ui.mjs';
import {openAdmin} from './admin.mjs';
const main=document.querySelector('#main');const menu=document.querySelector('#menu');const menuButton=document.querySelector('#menu-button');
let config,sources=[],version=0,answers={},step=-1,run=0,turn=0,busy=false,controller,manualTime='',lastScene='',motionPaused=false,view='home';
const seen=new Map();
function now(){const d=new Date();if(manualTime){const[h,m]=manualTime.split(':').map(Number);d.setHours(h,m,0,0);}return d;}
function updateMotion(){document.body.classList.toggle('motion-off',motionPaused||config?.settings.motion===false||matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData===true);}
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Menü öffnen');}
function showMenu(){if(!menu.hidden){closeMenu();return;}menu.replaceChildren(
 btn('Zur Startseite',()=>home()),
 btn('Warum DAZWISCHEN?',()=>{closeMenu();showInfo('about');}),
 btn('Quellen & Anwendung',()=>{closeMenu();showInfo();}),
 btn(motionPaused?'Bewegung erlauben':'Bewegung pausieren',()=>{motionPaused=!motionPaused;updateMotion();closeMenu();toast(motionPaused?'Bewegung pausiert.':'Bewegung erlaubt, sofern dein Gerät sie nicht reduziert.');}),
 el('label',{},'Uhrzeit für diesen Besuch',el('input',{type:'time',value:manualTime||now().toTimeString().slice(0,5),'aria-label':'Manuelle Uhrzeit',onchange:e=>{manualTime=e.target.value;clockChanged();}})),
 btn('Wieder Gerätezeit verwenden',()=>{manualTime='';clockChanged();closeMenu();},'quiet-button'),
 el('p',{class:'menu-small'},'Nur die Uhrzeit wird angepasst. Datum und Jahreszeit folgen deinem Gerät. Keine Wetter- oder Standortabfrage.'),
 btn('Verwaltung',()=>{closeMenu();admin();})
 );menu.hidden=false;menuButton.setAttribute('aria-expanded','true');menuButton.setAttribute('aria-label','Menü schließen');}
menuButton.addEventListener('click',showMenu);document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!menuButton.contains(e.target))closeMenu();});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menuButton.focus();}});
document.querySelector('#home').addEventListener('click',()=>home());document.querySelector('#sources-link').addEventListener('click',()=>showInfo());document.querySelector('#close-dialog').addEventListener('click',()=>document.querySelector('#info-dialog').close());document.querySelector('#info-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
async function refresh(signal){const data=await api('/api/config',{signal,headers:version?{'If-None-Match':`"${version}"`}:{}});if(!data.unchanged){config=data.config;version=data.version;sources=data.sources;document.querySelector('#brand').textContent=config.settings.title;document.title=`${config.settings.title} — Raum für deinen Moment`;updateMotion();}return config;}
function focusMain(){requestAnimationFrame(()=>{main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});});}
function mount(node){main.replaceChildren(node);focusMain();}
const seasonNames={spring:'Frühling',summer:'Sommer',autumn:'Herbst',winter:'Winter'};
const phaseNames={morning:'Am Morgen',day:'Mitten am Tag',evening:'Am Abend',night:'In der Nacht'};
const seasonLines={spring:'Es darf etwas beginnen.',summer:'Ein bisschen länger bleiben.',autumn:'Raum für das Wesentliche.',winter:'Draußen leise. Hier auch.'};
function landscape(){const scene=sceneFor(config,now());lastScene=scene.id;const image=config.settings.images&&scene.id;
 return el('aside',{class:'scene-wrap','aria-label':'Saisonale Illustration'},
 el('div',{class:'scene-top'},el('span',{},`${seasonNames[scene.season].toUpperCase()} / ${phaseNames[scene.time].toUpperCase()}`),el('span',{},'HIER. JETZT.')),
 el('div',{class:'scene'},image?el('img',{src:`/assets/${scene.id}.svg`,alt:`Illustrierte ${seasonNames[scene.season]}landschaft ${scene.time==='evening'||scene.time==='night'?'im Abendlicht':'im Tageslicht'}`,width:1400,height:1800,fetchpriority:'high'}):null,
 el('div',{class:'scene-caption'},seasonLines[scene.season],el('small',{},'EINE STIMMUNG. KEINE WETTERVORHERSAGE.'))),
 el('div',{class:'scene-circle',html:icon('leaf'),'aria-hidden':'true'}),
 el('div',{class:'scene-bottom'},el('span',{},'ZEIT, KURZ INNEZUHALTEN'),el('span',{},'01 — ∞')));
}
function layout(copy,cls){return el('div',{class:`composition ${cls} fade-in`},copy,landscape());}
function home(push=true){run++;controller?.abort();busy=false;step=-1;answers={};view='home';closeMenu();if(push)history.replaceState({run,step:-1},'','/');if(!config)return;
 mount(layout(el('section',{class:'copy'},el('div',{class:'eyebrow'},'DEIN MOMENT DÜRFTE ANDERS DUFTEN.'),
 el('h1',{},'Zwischen',el('br'),el('em',{},'gerade noch.'),el('br'),'Und gleich wieder.'),
 el('p',{class:'lead'},config.settings.intro),
 el('div',{class:'hero-actions'},btn(el('span',{},'Duft finden'),start,'primary',{'aria-label':'Duft finden'})),
 el('span',{class:'button-note'},'Drei kleine Entscheidungen. Ein Duft für deinen Raum.'),
 el('div',{class:'tiny-rule'}),el('p',{class:'manifesto'},'Nicht jeder Moment muss etwas leisten.')), 'home'));
 main.querySelector('.primary').append(el('span',{html:icon('arrow')}));
}
async function start(){if(busy)return;const id=++run;controller?.abort();controller=new AbortController();busy=true;const button=main.querySelector('.primary');if(button)button.disabled=true;
 try{await refresh(controller.signal);if(id!==run)return;answers={};step=0;view='quiz';history.pushState({run,step},'','/');renderQuiz();}catch(e){if(e.name!=='AbortError')toast('Der Bestand ist gerade nicht erreichbar. Bitte versuche es erneut.');}finally{if(id===run){busy=false;if(button)button.disabled=false;}}}
function forward(){step++;history.pushState({run,step},'','/');renderQuiz();}
function setActivity(activity){answers={activity};forward();}
function setGroup(group){answers.group=group;forward();}
function back(){if(step<=0)return home();step--;history.pushState({run,step},'','/');renderQuiz();}
function progress(){return el('div',{class:'progress','aria-label':`Schritt ${step+1} von 3`},[0,1,2].map(i=>el('span',{class:i<=step?'done':''})),el('b',{class:'progress-numbers'},`0${step+1} / 03`));}
function selectChoice(name,detail,iconName,fn,selected=false){return btn([el('span',{html:icon(iconName)}),el('span',{},el('span',{class:'choice-name'},name),detail?el('small',{},detail):null),el('span',{class:'choice-end','aria-hidden':'true'},'↗')],fn,`choice ${selected?'selected':''}`);}
function renderQuiz(){if(!config)return;if(answers.activity==='wake'&&!isMorning(now())){answers={};step=0;toast('Die Morgen-Auswahl gilt von 06:00 bis vor 11:00 Uhr. Wähle neu.');}view='quiz';
 const copy=el('section',{class:'copy'},progress());
 if(step===0){copy.append(el('div',{class:'eyebrow'},'01 — DEIN VORHABEN'),el('h1',{},config.settings.tagline),el('p',{class:'question-detail'},'Was hast du gerade vor?'));
  const choices=el('div',{class:'choices'});for(const[key,a]of Object.entries(activities)){if(key==='wake'&&!isMorning(now()))continue;choices.append(selectChoice(a.name,key==='wake'?'Nur morgens · 06–11 Uhr':a.detail,a.icon,()=>setActivity(key),answers.activity===key));}copy.append(choices);
 }else if(step===1){copy.append(el('div',{class:'eyebrow'},'02 — DEINE DUFTRICHTUNG'),el('h1',{},'Wonach steht',el('br'),'dir der Sinn?'),el('p',{class:'question-detail'},'Der Charakter, den dein Raum bekommen darf.'));
  const ids=availableGroups(config,answers.activity);const choices=el('div',{class:'choices'});for(const id of ids){const g=groups[id];choices.append(selectChoice(g.name,g.description,g.icon,()=>setGroup(id),answers.group===id));}
  if(!ids.length){choices.append(el('p',{class:'notice'},'Für diese Tätigkeit ist gerade keine exakte Duftidee verfügbar. Mit „Such du etwas aus“ prüfen wir eine verfügbare Alternative und kennzeichnen sie.'));}copy.append(choices,btn('Such du etwas aus',()=>setGroup('any'),'text-button'));
 }else{copy.append(el('div',{class:'eyebrow'},'03 — DEINE INTENSITÄT'),el('h1',{},'Ein Hauch.',el('br'),'Oder etwas mehr?'),el('p',{class:'question-detail'},'Wähle bewusst. Auch kräftig bleibt innerhalb der Rezeptgrenzen.'));
  const choices=el('div',{class:'choices'});Object.entries(intensities).forEach(([key,name],i)=>{
   const c=selectChoice(name+(config.settings.defaultIntensity===key?' · Hausstandard':''),['Leise im Hintergrund','Präsent, ohne im Mittelpunkt zu stehen','Ein ausgeprägter Duftcharakter'][i],'drop',()=>result(key),answers.intensity===key);c.firstChild.replaceChildren(el('span',{class:'intensity-dot'},Array.from({length:i+1},()=>el('i'))));choices.append(c);
  });copy.append(choices);if(config.device.review!=='verified')copy.append(el('p',{class:'help notice'},'Die Dosierungsgrundlage ist noch ungeprüft. Deine Duftidee erscheint deshalb als Verhältnis; die Intensität wird noch nicht in Tropfen umgesetzt.'));
 }
 copy.append(el('div',{class:'quiz-bottom'},btn('← Zurück',back,'quiet-button'),el('span',{class:'step-label'},'OHNE EILE.')));
 mount(layout(copy,step===0?'quiz compact':'quiz'));
}
async function result(intensity=answers.intensity){if(busy)return;answers.intensity=intensity;const id=run;controller?.abort();controller=new AbortController();busy=true;main.querySelectorAll('.choice,.result-actions button').forEach(b=>b.disabled=true);
 try{await refresh(controller.signal);if(id!==run)return;
  const key=`${answers.activity}:${answers.group}`;const historySeen=seen.get(key)||[];const selected=choose(config,answers,{date:now(),turn:turn++,seen:historySeen});
  if(selected.resetMorning){answers={};step=0;renderQuiz();return;}
  if(selected.empty){view='result';mount(layout(el('section',{class:'copy'},el('div',{class:'eyebrow'},'GERADE KEIN PASSENDER DUFT'),el('h1',{},'Auch eine Pause',el('br'),'darf duftfrei sein.'),el('p',{class:'lead'},selected.reason),btn('Auswahl ändern',()=>edit(0),'primary')),'empty'));return;}
  seen.set(key,[...historySeen.slice(-50),selected.signature]);step=3;view='result';history.pushState({run,step},'','/');renderResult(selected);
 }catch(e){if(e.name!=='AbortError')toast('Keine neue Empfehlung: Der aktuelle Bestand konnte nicht geladen werden. Bitte erneut versuchen.');}finally{if(id===run){busy=false;main.querySelectorAll('.choice,.result-actions button').forEach(b=>b.disabled=false);}}}
function edit(target=0){controller?.abort();busy=false;step=target;history.pushState({run,step},'','/');renderQuiz();}
function renderResult(selected){const r=selected.recipe;const dosed=!!selected.parts;const copy=el('section',{class:'copy'},el('div',{class:'eyebrow'},dosed?'DEIN DUFT FÜR DIESEN MOMENT':'DEINE VORLÄUFIGE DUFTIDEE'),el('h1',{},r.name),el('p',{class:'scent-description'},r.description));
 const parts=el('div',{class:'recipe-parts','aria-label':dosed?'Geprüfte Tropfenmengen':'Mischungsverhältnis, keine Dosierung'});
 for(const p of selected.parts||r.parts){const oil=config.oils.find(o=>o.id===p.oil);parts.append(el('div',{class:'part'},el('span',{class:'part-name'},oil.name),el('span',{class:'part-amount'},dosed?p.drops:p.ratio,el('small',{},dosed?(p.drops===1?'Tropfen':'Tropfen'):(p.ratio===1?'Teil':'Teile')))));}copy.append(parts);
 if(!dosed)copy.append(el('div',{class:'notice'},el('strong',{},'Verhältnis, keine Tropfenanleitung.'),'Produktvariante und Dosierungsgrundlage sind noch nicht vollständig geprüft. Vor Anwendung Herstellerhinweise prüfen. Die gewählte Intensität wird noch nicht dosiert.'));
 else copy.append(el('p',{class:'notice'},'Interne Rezeptregel für das geprüfte Gerät; keine allgemeine Sicherheitsgarantie. Wasser nur bis MAX.'));
 if(selected.fallback)copy.append(el('p',{class:'notice'},'Verfügbare Alternative: Die Duftrichtung passt, deine Tätigkeit ist diesem Rezept jedoch nicht ausdrücklich zugeordnet.'));
 const again=btn([el('span',{},'Andere Mischung'),el('span',{html:icon('refresh')})],()=>result(),'primary');
 if(!selected.alternatives){again.disabled=true;again.title='Für diese Auswahl gibt es aktuell nur diese Zusammensetzung.';}
 copy.append(el('div',{class:'result-actions'},again,btn('Auswahl ändern',()=>edit(0),'text-button')));
 if(!selected.alternatives)copy.append(el('p',{class:'button-note'},'Aktuell die einzige passende Zusammensetzung.'));
 copy.append(el('div',{class:'answer-summary','aria-label':'Antworten bearbeiten'},btn(activities[answers.activity].name,()=>edit(0),'',{'aria-label':'Tätigkeit ändern'}),btn(groups[answers.group]?.name||'Frei ausgewählt',()=>edit(1),'',{'aria-label':'Duftrichtung ändern'}),btn(`${intensities[answers.intensity]}${dosed?'':' · noch undosiert'}`,()=>edit(2),'',{'aria-label':'Intensität ändern'})),el('div',{class:'result-bottom'},btn('Quellen & Anwendung',()=>showInfo(),'quiet-button')));
 mount(layout(copy,'result'));
}
function showInfo(type='sources'){const box=document.querySelector('#dialog-content');box.replaceChildren();
 if(type==='about'){box.append(el('h2',{id:'dialog-title'},'Was liegt dazwischen?'),el('p',{},'Zwischen einem vollen Tag und einem freien Abend. Zwischen dem letzten Gedanken und dem nächsten. Manchmal ist genau dort ein bisschen Raum für dich.'),el('h3',{},'Ein Name mit offenem Ende.'),el('p',{},'DAZWISCHEN meint diesen Übergang. Ein Duft kann seine Atmosphäre begleiten. Er muss nichts verbessern, heilen oder leisten.'),el('h3',{},'Ein Fenster statt eines Feeds.'),el('p',{},'Drei bewusste Entscheidungen, eine redaktionell ausgewählte Duftidee. Ohne Account, Tracking oder laufende KI. Deine Antworten bleiben nur im Arbeitsspeicher dieses Besuchs. Home und erneutes Öffnen beginnen frisch.'),el('p',{},'Die saisonalen Landschaften sind eigens erstellte Illustrationen. Sie zeigen eine Stimmung, keine aktuelle Wetterlage.'));
 }else{box.append(el('h2',{id:'dialog-title'},'Mit Bedacht duften.'),el('p',{},'Die Rezepte sind eigene redaktionelle Duftideen. Tätigkeiten beschreiben eine Atmosphäre, keine belegte Wirkung auf Schlaf, Konzentration oder Gesundheit.'),el('h3',{},'Der aktuelle Prüfstand'),el('p',{},'Die Ausgangsquellen konnten in dieser Umgebung wegen einer Netzwerksperre nicht gelesen werden. Die 23 Produkte wurden aus deinem übermittelten Bestand übernommen. Varianten, Mischungsbestandteile und regionale Unterschiede sind noch nicht unabhängig bestätigt. Neue Produkte bleiben bis zur Freigabe ausgeschlossen.'),el('h3',{},'Verhältnis ist keine Dosierung'),el('p',{},'Bis zur dokumentierten Produkt- und Geräteprüfung zeigen wir nur Verhältnisse. Auch die Intensitätswahl erzeugt dann keine Tropfenmenge. Die Werte 2, 3 und 4 sowie maximal 4 Tropfen sind unbestätigte interne Ausgangsregeln, keine behauptete Herstellerhöchstmenge.'),el('h3',{},'Vor der Anwendung'),el('p',{},'Beachte die Anleitung deines Geräts und das Etikett der konkreten Ölflasche. Nicht einnehmen, nicht als Hautanleitung verwenden. Bei empfindlichen Personen, Kindern, Schwangerschaft oder Tieren im Raum vorher fachlichen Rat einholen; bei Beschwerden die Anwendung beenden. Duft ersetzt kein Lüften.'),el('h3',{},'Ausgangsquellen · hier noch nicht geprüft'));
 for(const s of sources)box.append(el('a',{class:'source',href:s.url,target:'_blank',rel:'noopener noreferrer'},s.title,el('small',{},`${s.kind} · externer Link`)));
 const reviewed=[...config.oils.filter(o=>o.review==='verified').map(o=>({name:o.name,url:o.source,date:o.reviewedAt})),...(config.device.review==='verified'?[{name:config.device.name,url:config.device.source,date:config.device.reviewedAt}]:[])];if(reviewed.length){box.append(el('h3',{},'In der Verwaltung dokumentierte Prüfungen'));for(const p of reviewed)box.append(el('a',{class:'source',href:p.url,target:'_blank',rel:'noopener noreferrer'},p.name,el('small',{},`Prüfdatum laut Verwaltung: ${p.date}`)));}
 box.append(el('h3',{},'Unabhängiges Projekt'),el('p',{},'Keine offizielle Partnerschaft oder Freigabe durch doTERRA oder Stadler Form. Keine externen Medienanfragen, keine Standortabfrage.'));
 }
 const dialog=document.querySelector('#info-dialog');if(!dialog.open)dialog.showModal();}
async function admin(){run++;controller?.abort();answers={};view='admin';const adminRun=run;history.pushState({view:'admin'},'','#verwaltung');await openAdmin(main,{onHome:home,isActive:()=>view==='admin'&&run===adminRun,onSaved:async()=>{version=0;await refresh();}});}
function clockChanged(){if(!config)return;if(answers.activity==='wake'&&!isMorning(now())){controller?.abort();run++;busy=false;answers={};step=0;history.replaceState({run,step},'','/');renderQuiz();toast('Es ist nicht mehr Morgen. Bitte wähle deine Tätigkeit neu.');}else if(view==='home'){const scene=main.querySelector('.scene-wrap');if(scene)scene.replaceWith(landscape());}else if(view==='quiz')renderQuiz();else if(view==='result'){const scene=main.querySelector('.scene-wrap');if(scene)scene.replaceWith(landscape());}}
window.addEventListener('popstate',e=>{closeMenu();controller?.abort();busy=false;if(location.hash==='#verwaltung')return admin();if(e.state?.run===run&&Number.isInteger(e.state.step)&&e.state.step>=0&&e.state.step<=2&&answers.activity){step=e.state.step;renderQuiz();}else home(false);});
window.addEventListener('pageshow',e=>{if(e.persisted)home();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)clockChanged();});
setInterval(()=>{if(!config)return;if(answers.activity==='wake'&&!isMorning(now()))clockChanged();else if(view!=='admin'&&sceneFor(config,now()).id!==lastScene)clockChanged();},30000);
try{await refresh();if(location.hash==='#verwaltung')await admin();else home();}catch{mount(el('section',{class:'login'},el('h1',{},'Ein Moment Geduld.'),el('p',{class:'error-box'},'Die gemeinsamen Einstellungen sind gerade nicht erreichbar. Es wird keine veraltete Empfehlung angezeigt.'),btn('Erneut versuchen',()=>location.reload(),'primary')));}
