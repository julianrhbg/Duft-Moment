import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync,rmSync,mkdirSync} from 'node:fs';
import {once} from 'node:events';
import {createApp} from '../src/server.mjs';
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright'));}catch{throw Error('Für die Browserprüfung ist Playwright erforderlich. Siehe README.');}
const dir=mkdtempSync('/tmp/dazwischen-browser-');
const app=createApp({dataDir:dir});app.server.listen(0,'127.0.0.1');await once(app.server,'listening');
const base=`http://127.0.0.1:${app.server.address().port}`;
mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const errors=[],external=[];let count=0;
async function check(name,fn){await fn();count++;console.log(`✓ ${name}`);}
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'de-DE',timezoneId:'Europe/Berlin',reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});
async function firstQuestion(){await page.getByRole('heading',{name:'Was hast du vor?',exact:true}).waitFor();}
async function home(){await page.getByRole('button',{name:'DAZWISCHEN · Zur Startseite'}).click();await firstQuestion();}
async function begin(activity='Lernen & Arbeiten',group='Warm & holzig'){
 await page.getByRole('button',{name:new RegExp(`^${activity}`)}).click();
 await page.getByRole('button',{name:new RegExp(`^${group}`)}).click();
}
async function manual(time){
 await page.getByRole('button',{name:'Menü öffnen'}).click();
 await page.getByText('Uhrzeit anpassen',{exact:true}).click();
 await page.getByLabel('Manuelle Uhrzeit').fill(time);
 await page.getByLabel('Manuelle Uhrzeit').dispatchEvent('change');
 await page.getByRole('button',{name:'Menü schließen'}).click();
}
async function noOverflow(){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Horizontales Überlaufen');}
async function touchTargets(selector='.choices button'){
 const sizes=await page.locator(selector).evaluateAll(elements=>elements.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
 assert(sizes.length>0);assert(sizes.every(s=>s.w>=44&&s.h>=44),'Touchflächen unter 44 Pixel');
}
try{
 await check('Direkte erste Auswahl bei 320×568, 360×640 und 390×844; große Touchflächen',async()=>{
  await page.goto(base);await firstQuestion();
  for(const [width,height]of [[320,568],[360,640],[390,844]]){
   await page.setViewportSize({width,height});await noOverflow();await touchTargets();
   await page.screenshot({path:`test-results/start-${width}.png`,fullPage:true});
  }
  assert.equal(await page.locator('.eyebrow,.scene-caption,.manifesto,.header-note,.answer-summary').count(),0);
 });
 await check('Desktop 1440×950 und Tablet 768×1024: keine Überläufe oder überdeckten Auswahlen',async()=>{
  const desktop=await browser.newPage({viewport:{width:1440,height:950},locale:'de-DE',reducedMotion:'reduce'});
  desktop.on('pageerror',e=>errors.push(e.message));await desktop.goto(base);
  await desktop.getByRole('heading',{name:'Was hast du vor?',exact:true}).waitFor();
  await desktop.screenshot({path:'test-results/start-1440.png',fullPage:true});
  for(const size of [{width:1440,height:950},{width:768,height:1024}]){
   await desktop.setViewportSize(size);
   assert(await desktop.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   for(const choice of await desktop.locator('.choices button').all()){
    const box=await choice.boundingBox();assert(box);
    assert(await desktop.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('.choice')!==null,{x:box.x+box.width/2,y:box.y+box.height/2}));
   }
  }
  await desktop.close();
 });
 await check('Drei Fragen, genau ein Verhältnis-Rezept; Alternative ist eine andere Zusammensetzung',async()=>{
  await begin();await page.screenshot({path:'test-results/intensitaet-mobile.png',fullPage:true});
  await page.getByRole('button',{name:/^Deutlich/}).click();
  await page.getByText('Verhältnis, keine Tropfenangabe.',{exact:true}).waitFor();
  const first=await page.locator('.part-name').allTextContents();assert(first.length>0);await noOverflow();
  await page.screenshot({path:'test-results/ergebnis-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Andere Mischung',exact:true}).click();
  await page.waitForFunction(first=>JSON.stringify([...document.querySelectorAll('.part-name')].map(e=>e.textContent))!==JSON.stringify(first),first);
  assert.notDeepEqual(await page.locator('.part-name').allTextContents(),first);
 });
 await check('Antworten bleiben über einen gezielten Änderungsdialog bearbeitbar; Browser-Zurück funktioniert',async()=>{
  await page.getByRole('button',{name:'Auswahl ändern',exact:true}).click();
  await page.getByRole('button',{name:'Duftrichtung ändern',exact:true}).click();
  await page.getByRole('heading',{name:'Welche Duftrichtung?',exact:true}).waitFor();await touchTargets();
  await page.screenshot({path:'test-results/duftrichtung-mobile.png',fullPage:true});
  await page.getByRole('button',{name:/^Frisch & spritzig/}).click();await page.goBack();
  await page.getByRole('heading',{name:'Welche Duftrichtung?',exact:true}).waitFor();
 });
 await check('Home und Neuladen beginnen bei Frage 1; keine Besucherantworten in Cookies oder Local Storage',async()=>{
  await home();await page.reload();await firstQuestion();
  assert.equal(await page.evaluate(()=>localStorage.length),0);assert.equal((await context.cookies()).length,0);
  assert.equal(await page.locator('.choice[aria-pressed=true]').count(),0);
 });
 await check('Morgen-Auswahl 10:59 vorhanden; 11:00 führt nachvollziehbar zurück',async()=>{
  await manual('10:59');await page.getByRole('button',{name:/^Aufwachen/}).click();
  await page.getByRole('heading',{name:'Welche Duftrichtung?',exact:true}).waitFor();
  await manual('11:00');await firstQuestion();assert.equal(await page.getByRole('button',{name:/^Aufwachen/}).count(),0);
  await home();
 });
 await check('Auswahl abgeben funktioniert; nie mehr als drei Duftgruppen',async()=>{
  await page.getByRole('button',{name:/^Pause machen/}).click();
  await page.getByRole('heading',{name:'Welche Duftrichtung?',exact:true}).waitFor();
  assert((await page.locator('.fragrance-choices button').count())<=3);
  await page.getByRole('button',{name:'Such du etwas aus',exact:true}).click();
  await page.getByRole('button',{name:/^Dezent/}).click();await page.locator('.recipe-parts').waitFor();await home();
 });
 await check('Verspätete Netzwerkanfrage überschreibt keinen Neustart',async()=>{
  await begin();let release;const gate=new Promise(resolve=>release=resolve);
  await page.route('**/api/config',async route=>{await gate;await route.continue().catch(()=>{});});
  await page.getByRole('button',{name:/^Deutlich/}).click();await home();release();
  await page.unrouteAll({behavior:'wait'});await firstQuestion();assert.equal(await page.locator('.recipe-parts').count(),0);
  assert.equal(await page.locator('main').getAttribute('aria-busy'),null);
 });
 await check('BFCache-pageshow setzt das Quiz zurück',async()=>{
  await begin();await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await firstQuestion();
 });
 await check('Anwendung und alle Quellen sind erreichbar; reduzierte Bewegung bleibt statisch',async()=>{
  await page.locator('#sources-link').click();await page.getByRole('dialog',{name:'Anwendung & Quellen'}).waitFor();
  assert.equal(await page.locator('#info-dialog a.source').count(),5);
  await page.getByText('Prüfstand & Dosierung',{exact:true}).click();
  await page.getByText('Ein Teil bedeutet nicht ein Tropfen.',{exact:false}).waitFor();
  await page.getByRole('button',{name:'Schließen',exact:true}).click();
  assert(await page.locator('body').evaluate(e=>e.classList.contains('motion-off')));
 });
 await check('Tastatur: Auswahl per Enter, sichtbarer Fokus, Menü-Escape mit Fokusrückgabe',async()=>{
  const keyboard=await browser.newPage({viewport:{width:1280,height:850}});
  keyboard.on('pageerror',e=>errors.push(e.message));await keyboard.goto(base);
  const focus=keyboard.getByRole('button',{name:/^Lernen & Arbeiten/});await focus.waitFor();await focus.focus();
  assert.equal(await focus.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
  await keyboard.keyboard.press('Enter');await keyboard.getByRole('heading',{name:'Welche Duftrichtung?',exact:true}).waitFor();
  await keyboard.getByRole('button',{name:'Menü öffnen'}).click();await keyboard.keyboard.press('Escape');
  assert.equal(await keyboard.locator('#menu').evaluate(e=>e.open),false);
  assert.equal(await keyboard.evaluate(()=>document.activeElement?.id),'menu-button');
  await keyboard.screenshot({path:'test-results/duftrichtung-desktop.png',fullPage:true});await keyboard.close();
 });
 await check('Fehlende Bilder und Datensparmodus behalten einen ruhigen, bedienbaren Material-Fallback',async()=>{
  const fallback=await browser.newPage({viewport:{width:320,height:568},isMobile:true,hasTouch:true});
  fallback.on('pageerror',e=>errors.push(e.message));
  await fallback.addInitScript(()=>Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:true}}));
  await fallback.route('**/assets/*.svg',route=>route.abort());await fallback.goto(base);
  await fallback.getByRole('heading',{name:'Was hast du vor?',exact:true}).waitFor();
  await fallback.waitForFunction(()=>document.querySelector('.lens-surface')&&!document.querySelector('.lens-surface img'));
  assert(await fallback.locator('body').evaluate(e=>e.classList.contains('motion-off')));
  assert.notEqual(await fallback.locator('.lens-surface').evaluate(e=>getComputedStyle(e).backgroundImage),'none');
  await fallback.getByRole('button',{name:/^Lernen & Arbeiten/}).click();
  await fallback.getByRole('heading',{name:'Welche Duftrichtung?',exact:true}).waitFor();await fallback.close();
 });
 await check('Ladefehler geben keine alte Empfehlung aus und lassen sich erneut versuchen',async()=>{
  await home();await begin();
  await page.route('**/api/config',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Nicht erreichbar'})}));
  await page.getByRole('button',{name:/^Deutlich/}).click();
  await page.getByRole('alert').filter({hasText:'Der aktuelle Bestand ist nicht erreichbar.'}).waitFor();
  assert.equal(await page.locator('.recipe-parts').count(),0);
  await page.unrouteAll({behavior:'wait'});await page.getByRole('button',{name:/^Deutlich/}).click();await page.locator('.recipe-parts').waitFor();await home();
 });
 await check('Geschützte Ersteinrichtung, Bestand speichern und erneut laden',async()=>{
  await page.getByRole('button',{name:'Menü öffnen'}).click();await page.getByRole('button',{name:'Verwaltung',exact:true}).click();
  await page.getByLabel('Einmaliger Einrichtungsschlüssel').fill(readFileSync(app.tokenPath,'utf8').trim());
  await page.getByLabel('Eigenes Passwort · mindestens 12 Zeichen').fill('Browser-Test-Passwort-2026!');
  await page.getByLabel('Passwort wiederholen').fill('Browser-Test-Passwort-2026!');
  await page.screenshot({path:'test-results/einrichtung-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Zugang einrichten',exact:true}).click();await page.getByRole('button',{name:'Ölbestand',exact:true}).waitFor();
  const card=page.locator('.admin-card').filter({has:page.getByRole('heading',{name:'Bergamot Mint',exact:true})});
  await card.getByLabel('Vorübergehend ausschließen').check();await page.getByRole('button',{name:'Gemeinsam speichern',exact:true}).click();
  await page.getByText(/Gemeinsamer Stand · Version 2/).waitFor();await page.reload();await page.getByRole('button',{name:'Ölbestand',exact:true}).waitFor();
  assert(await page.locator('.admin-card').filter({has:page.getByRole('heading',{name:'Bergamot Mint',exact:true})}).getByLabel('Vorübergehend ausschließen').isChecked());
  await noOverflow();await page.screenshot({path:'test-results/verwaltung-mobile.png',fullPage:false});
 });
 await check('Neue Produkte bleiben ungeprüft; Rezepte, Gerät, Darstellung und Daten sind bedienbar',async()=>{
  await page.getByRole('button',{name:'+ Weiteres Öl hinzufügen',exact:true}).click();assert.equal(await page.locator('.admin-card').count(),24);
  await page.getByRole('button',{name:'Rezepte',exact:true}).click();await page.getByLabel('Rezept auswählen').waitFor();
  await page.getByLabel('Rezeptname').fill('Eine bearbeitete Duftidee');await page.getByRole('button',{name:'Gerät & Mengen',exact:true}).click();
  await page.getByLabel('Diffusermodell').waitFor();await page.getByRole('button',{name:'Atmosphäre',exact:true}).click();
  assert.equal(await page.locator('.scene-settings img').count(),24);await noOverflow();
  await page.getByRole('button',{name:'Daten',exact:true}).click();await page.getByText('Export & Import',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Gemeinsam speichern',exact:true}).click();await page.getByText(/Gemeinsamer Stand · Version 3/).waitFor();
 });
 await check('Neue Empfehlungen und angebotene Gruppen berücksichtigen aktuelle Bestandsänderungen',async()=>{
  const data=await (await context.request.get(base+'/api/admin')).json();data.config.oils.forEach(o=>o.available=false);
  const saved=await context.request.put(base+'/api/admin',{headers:{Origin:base},data:{version:data.version,config:data.config}});assert.equal(saved.status(),200);
  await home();await page.getByRole('button',{name:/^Lernen & Arbeiten/}).click();
  await page.getByRole('heading',{name:'Welche Duftrichtung?',exact:true}).waitFor();assert.equal(await page.locator('.choices button').count(),0);
  await page.getByRole('button',{name:'Such du etwas aus',exact:true}).click();await page.getByRole('button',{name:/^Deutlich/}).click();
  await page.getByRole('heading',{name:'Gerade kein passender Duft.',exact:true}).waitFor();assert.equal(await page.locator('.recipe-parts').count(),0);
  await page.screenshot({path:'test-results/leerer-bestand-mobile.png',fullPage:true});
 });
 await check('Benutzerdefinierte Frage und alle gespeicherten Inhalte bleiben erhalten',async()=>{
  const data=await (await context.request.get(base+'/api/admin')).json();data.config.settings.tagline='Was möchtest du gerade tun?';
  const before=structuredClone(data.config);const saved=await context.request.put(base+'/api/admin',{headers:{Origin:base},data:{version:data.version,config:data.config}});assert.equal(saved.status(),200);
  await home();await page.getByRole('button',{name:/^Lernen & Arbeiten/}).click();
  await page.getByRole('heading',{name:'Welche Duftrichtung?',exact:true}).waitFor();
  await page.getByRole('button',{name:'DAZWISCHEN · Zur Startseite'}).click();
  await page.getByRole('heading',{name:'Was möchtest du gerade tun?',exact:true}).waitFor();
  assert.deepEqual((await (await context.request.get(base+'/api/admin')).json()).config,before);
 });
 await check('Abmelden entzieht den Verwaltungszugriff',async()=>{
  await page.getByRole('button',{name:'Menü öffnen'}).click();await page.getByRole('button',{name:'Verwaltung',exact:true}).click();
  await page.getByRole('button',{name:'Abmelden',exact:true}).click();await page.getByRole('button',{name:'Anmelden',exact:true}).waitFor();
  assert.equal((await context.request.get(base+'/api/admin')).status(),401);
 });
 assert.deepEqual(errors,[],'JavaScript-Fehler im Browser');assert.deepEqual(external,[],'Fremde Netzwerkzugriffe');
 console.log(`${count} Browserprüfungen bestanden; keine JavaScript-Fehler und keine externen Anfragen.`);
}finally{await context.close();await browser.close();await new Promise(resolve=>app.server.close(resolve));rmSync(dir,{recursive:true,force:true});}
