import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync,rmSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {once} from 'node:events';
import {createApp} from '../src/server.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const dir=mkdtempSync('/tmp/dazwischen-info-'),app=createApp({dataDir:dir});
app.server.listen(0,'127.0.0.1');await once(app.server,'listening');const base=`http://127.0.0.1:${app.server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
mkdirSync('test-results',{recursive:true});
const errors=[],requests=[];let count=0;
const context=await browser.newContext({viewport:{width:1280,height:850},colorScheme:'light',reducedMotion:'no-preference',locale:'de-DE',timezoneId:'Europe/Berlin'});
await context.addInitScript(()=>{
 Object.defineProperty(navigator,'hardwareConcurrency',{value:8,configurable:true});Object.defineProperty(navigator,'deviceMemory',{value:8,configurable:true});
 window.__gpu={buffers:0,deletedBuffers:0,programs:0,deletedPrograms:0,shaders:0,deletedShaders:0,draws:0};
 const proto=WebGLRenderingContext.prototype;
 for(const [name,counter]of Object.entries({createBuffer:'buffers',deleteBuffer:'deletedBuffers',createProgram:'programs',deleteProgram:'deletedPrograms',createShader:'shaders',deleteShader:'deletedShaders',drawArrays:'draws'})){
  const original=proto[name];proto[name]=function(...args){window.__gpu[counter]++;return original.apply(this,args);};
 }
});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
async function check(name,fn){await fn();count++;console.log(`✓ ${name}`);}
async function initial(p=page){await p.getByRole('heading',{name:'Was hast du vor?',exact:true}).waitFor();}
async function open(p=page){await p.getByRole('button',{name:'Info',exact:true}).click();await p.locator('.info-experience[open]').waitFor();}
async function close(p=page){await p.getByRole('button',{name:'Info schließen',exact:true}).click();await p.locator('.info-experience').waitFor({state:'detached'});}
async function frames(p=page){await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function scroll(fraction,p=page){await p.locator('.info-experience').evaluate((e,f)=>e.scrollTop=(e.scrollHeight-e.clientHeight)*f,fraction);await frames(p);}
async function noOverflow(p=page){assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
function ratio(a,b){const lum=c=>{const rgb=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};const[x,y]=[lum(a),lum(b)].sort((x,y)=>x-y);return(y+.05)/(x+.05);}
async function assertColors(p=page){const colors=await p.evaluate(()=>({text:getComputedStyle(document.body).color,background:getComputedStyle(document.body).backgroundColor,root:getComputedStyle(document.documentElement).backgroundColor,muted:getComputedStyle(document.querySelector('#info-button')).color}));const bg=colors.background==='rgba(0, 0, 0, 0)'?colors.root:colors.background;assert(ratio(colors.text,bg)>=4.5);assert(ratio(colors.muted,bg)>=4.5);const choice=await p.locator('.choice').first().count();if(choice){const color=await p.locator('.choice').first().evaluate(e=>getComputedStyle(e).color);assert(ratio(color,bg)>=4.5,'Textkontrast beim unmittelbaren Schemawechsel');}}
try{
 await check('Normaler Start: kein Footer-Link, Info ≥44 px, kein Demo-Code oder WebGL geladen',async()=>{
  await page.goto(base);await initial();assert.equal(await page.locator('footer,#sources-link').count(),0);
  const box=await page.getByRole('button',{name:'Info',exact:true}).boundingBox();assert(box.width>=44&&box.height>=44);
  assert(!requests.some(url=>/info-(demo|room)\.(mjs|css)/.test(url)));assert.equal((await page.evaluate(()=>window.__gpu)).buffers,0);
  await assertColors();await page.screenshot({path:'test-results/schema-light-desktop.png'});
 });
 await check('Echte 3D-Demo wird erst bei Info geladen; Quellen sind vor jedem Scrollen erreichbar',async()=>{
  await page.getByRole('button',{name:/^Lernen & Arbeiten/}).click();await page.getByRole('button',{name:/^Warm & holzig/}).click();
  await page.getByRole('heading',{name:'Wie intensiv?',exact:true}).waitFor();await open();
  await page.waitForFunction(()=>document.querySelector('.demo-stage')?.dataset.renderer==='webgl');await frames();
  assert(requests.some(url=>url.endsWith('/info-room.mjs')));assert.equal(await page.locator('.info-experience').evaluate(e=>e.scrollTop),0);
  assert(await page.getByRole('button',{name:'Anwendung & Quellen',exact:true}).isVisible());
  await page.getByRole('button',{name:'Anwendung & Quellen',exact:true}).click();await page.getByRole('dialog',{name:'Anwendung & Quellen'}).waitFor();
  assert.equal(await page.locator('#info-dialog a.source').count(),5);await page.getByRole('button',{name:'Schließen',exact:true}).click();
  assert(await page.locator('.info-experience').evaluate(e=>e.open));await page.screenshot({path:'test-results/info-light-start.png'});
 });
 await check('Scrollen führt von gestapelten Flächen zum Raum; Canvas-Bilder ändern sich, Eingabe bleibt nativ',async()=>{
  const first=await page.locator('.demo-stage canvas').screenshot();
  await page.mouse.move(700,450);await page.mouse.wheel(0,450);await frames();
  assert((await page.locator('.info-experience').evaluate(e=>e.scrollTop))>300);
  await scroll(.5);await page.screenshot({path:'test-results/info-light-middle.png'});
  await scroll(1);const last=await page.locator('.demo-stage canvas').screenshot();
  assert.notEqual(createHash('sha256').update(first).digest('hex'),createHash('sha256').update(last).digest('hex'));
  assert.equal(await page.locator('.demo-label').innerText(),'Eine Mischung');await page.screenshot({path:'test-results/info-light-room.png'});
 });
 await check('Live-Systemwechsel gestaltet Hauptansicht und offene 3D-Materialien dunkel, ohne Motive zu tauschen',async()=>{
  const src=await page.locator('main .lens-surface img').getAttribute('src');await page.emulateMedia({colorScheme:'dark'});await frames();
  assert.equal(await page.locator('main .lens-surface img').getAttribute('src'),src);await assertColors();
  assert.equal(await page.locator('meta[name=theme-color]').count(),2);await page.screenshot({path:'test-results/info-dark-room.png'});
 });
 await check('Schließen erhält den Quizschritt und Antworten; Fokus geht zur Info-Schaltfläche',async()=>{
  const before=await page.locator('main').innerHTML();const apiCount=requests.filter(u=>u.includes('/api/config')).length;
  await close();await page.getByRole('heading',{name:'Wie intensiv?',exact:true}).waitFor();assert.equal(await page.locator('main').innerHTML(),before);
  assert.equal(requests.filter(u=>u.includes('/api/config')).length,apiCount);assert.equal(await page.evaluate(()=>document.activeElement.id),'info-button');
 });
 await check('Browser-Zurück schließt Info ohne Quiz-Rücksprung; Vorwärts öffnet sie erneut',async()=>{
  await open();await page.goBack();await page.locator('.info-experience').waitFor({state:'detached'});await page.getByRole('heading',{name:'Wie intensiv?',exact:true}).waitFor();
  await page.goForward();await page.locator('.info-experience[open]').waitFor();await page.keyboard.press('Escape');await page.locator('.info-experience').waitFor({state:'detached'});
  await open();await page.getByRole('button',{name:'Info schließen',exact:true}).evaluate(e=>{e.click();e.click();});await page.locator('.info-experience').waitFor({state:'detached'});await page.getByRole('heading',{name:'Wie intensiv?',exact:true}).waitFor();
 });
 await check('Ergebnis bleibt nach Info einschließlich direktem Quellenzugang dieselbe Empfehlung',async()=>{
  await page.getByRole('button',{name:/^Deutlich/}).click();await page.locator('.recipe-parts').waitFor();const before=await page.locator('main').innerHTML();const apiCount=requests.filter(u=>u.includes('/api/config')).length;
  await open();await page.getByRole('button',{name:'Anwendung & Quellen',exact:true}).click();await page.getByRole('button',{name:'Schließen',exact:true}).click();await close();
  assert.equal(await page.locator('main').innerHTML(),before);assert.equal(requests.filter(u=>u.includes('/api/config')).length,apiCount);
  assert(await page.getByText('Verhältnis, keine Tropfenangabe.',{exact:true}).isVisible());await page.screenshot({path:'test-results/ergebnis-dark-desktop.png'});
 });
 await check('Reduzierte Bewegung zur Laufzeit gibt alle GPU-Ressourcen frei und zeigt einen statischen Raum',async()=>{
  await open();await page.waitForFunction(()=>document.querySelector('.demo-stage')?.dataset.renderer==='webgl');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.info-experience')?.dataset.reduced==='true');await frames();
  assert.equal(await page.locator('.info-experience canvas').count(),0);assert.equal(await page.locator('.demo-label').innerText(),'Eine Mischung');
  await page.screenshot({path:'test-results/info-dark-reduced.png'});await close();await page.emulateMedia({reducedMotion:'no-preference'});
 });
 await check('Wiederholtes Öffnen/Schließen löscht Buffer, Shader und Programme; keine geschlossene Renderarbeit',async()=>{
  for(let i=0;i<3;i++){await open();await page.waitForFunction(()=>document.querySelector('.demo-stage')?.dataset.renderer==='webgl');await frames();await close();}
  const gpu=await page.evaluate(()=>window.__gpu);assert.equal(gpu.buffers,gpu.deletedBuffers);assert.equal(gpu.programs,gpu.deletedPrograms);assert.equal(gpu.shaders,gpu.deletedShaders);
  assert.equal(await page.locator('.info-experience, .info-experience canvas').count(),0);
  await frames();assert.equal((await page.evaluate(()=>window.__gpu)).draws,gpu.draws);
 });
 await check('Telefon 390×844: dunkler Hauptablauf und 3D mit erreichbarer Kopfzeile',async()=>{
  await page.getByRole('button',{name:'DAZWISCHEN · Zur Startseite'}).click();await initial();await page.setViewportSize({width:390,height:844});await noOverflow();
  await page.screenshot({path:'test-results/start-dark-mobile.png'});await open();await page.waitForFunction(()=>document.querySelector('.demo-stage')?.dataset.renderer==='webgl');await scroll(.62);
  await noOverflow();assert(await page.getByRole('button',{name:'Info schließen',exact:true}).isVisible());assert(await page.getByRole('button',{name:'Anwendung & Quellen',exact:true}).isVisible());
  await page.screenshot({path:'test-results/info-dark-mobile.png'});await close();await page.emulateMedia({colorScheme:'light'});await assertColors();await page.screenshot({path:'test-results/start-light-mobile.png'});
 });
 await check('Ohne WebGL bleibt ein hochwertiger statischer Raum; keine leere lange Scrollstrecke',async()=>{
  const fallback=await browser.newPage({viewport:{width:320,height:568},colorScheme:'dark'});
  fallback.on('pageerror',e=>errors.push(e.message));await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:original.call(this,type,...args);};});
  await fallback.goto(base);await initial(fallback);await open(fallback);await fallback.waitForFunction(()=>document.querySelector('.info-experience')?.dataset.fallback==='true');await frames(fallback);
  assert.equal(await fallback.locator('.info-experience canvas').count(),0);assert(await fallback.locator('.room-model').isVisible());
  assert(await fallback.locator('.info-experience').evaluate(e=>e.scrollHeight-e.clientHeight<60));await fallback.screenshot({path:'test-results/info-no-webgl-320.png'});await close(fallback);await fallback.close();
 });
 await check('Verlorener Grafikkontext wechselt zuverlässig zur statischen Raumansicht',async()=>{
  await open();await page.waitForFunction(()=>document.querySelector('.demo-stage')?.dataset.renderer==='webgl');
  await page.locator('.demo-stage canvas').evaluate(c=>c.getContext('webgl').getExtension('WEBGL_lose_context').loseContext());
  await page.waitForFunction(()=>document.querySelector('.info-experience')?.dataset.fallback==='true');
  assert.equal(await page.locator('.info-experience canvas').count(),0);assert(await page.locator('.room-model').isVisible());await close();
 });
 await check('Schwaches Geräteprofil verwendet die statische Demo ohne 3D-Modul',async()=>{
  const low=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});const urls=[];low.on('request',r=>urls.push(r.url()));
  await low.addInitScript(()=>{Object.defineProperty(navigator,'deviceMemory',{value:1,configurable:true});});
  await low.goto(base);await initial(low);await open(low);await frames(low);assert(!urls.some(u=>u.includes('info-room.mjs')));assert.equal(await low.locator('.info-experience canvas').count(),0);await close(low);await low.close();
 });
 await check('Datensparen/reduzierte Bewegung laden kein 3D-Modul; Quellen bleiben direkt erreichbar',async()=>{
  const quiet=await browser.newPage({viewport:{width:390,height:844},colorScheme:'light',reducedMotion:'reduce'});const urls=[];quiet.on('request',r=>urls.push(r.url()));
  await quiet.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));await quiet.goto(base);await initial(quiet);await open(quiet);await frames(quiet);
  assert(!urls.some(u=>u.includes('info-room.mjs')));assert.equal(await quiet.locator('.info-experience canvas').count(),0);
  await quiet.getByRole('button',{name:'Anwendung & Quellen',exact:true}).click();assert.equal(await quiet.locator('#info-dialog a.source').count(),5);
  await quiet.getByRole('button',{name:'Schließen',exact:true}).click();await quiet.screenshot({path:'test-results/info-light-reduced.png'});await close(quiet);await quiet.close();
 });
 await check('Navigation während des Lazy-Ladens öffnet später keine veraltete Infoansicht',async()=>{
  const delayed=await browser.newPage({viewport:{width:390,height:844}});await delayed.goto(base);await initial(delayed);
  await delayed.getByRole('button',{name:/^Lernen & Arbeiten/}).click();await delayed.getByRole('button',{name:/^Warm & holzig/}).click();
  let release;const gate=new Promise(resolve=>release=resolve);await delayed.route('**/info-demo.css',async route=>{await gate;await route.continue().catch(()=>{});});
  await delayed.getByRole('button',{name:'Info',exact:true}).click();await delayed.goBack();await delayed.getByRole('heading',{name:'Welche Duftrichtung?',exact:true}).waitFor();
  release();await delayed.unrouteAll({behavior:'wait'});await frames(delayed);assert.equal(await delayed.locator('.info-experience[open]').count(),0);await delayed.close();
 });
 await check('Tageszeit und Farbschema bleiben unabhängig',async()=>{
  await page.getByRole('button',{name:'Menü öffnen'}).click();await page.getByText('Uhrzeit anpassen',{exact:true}).click();await page.getByLabel('Manuelle Uhrzeit').fill('20:00');await page.getByLabel('Manuelle Uhrzeit').dispatchEvent('change');await page.getByRole('button',{name:'Menü schließen'}).click();
  const evening=await page.locator('main .lens-surface img').getAttribute('src');assert(evening.includes('evening'));
  await page.emulateMedia({colorScheme:'dark'});assert.equal(await page.locator('main .lens-surface img').getAttribute('src'),evening);
  await page.emulateMedia({colorScheme:'light'});assert.equal(await page.locator('main .lens-surface img').getAttribute('src'),evening);
 });
 await check('Auch ohne Konfiguration sind Info, Anwendung und alle Quellen in beiden Schemata erreichbar',async()=>{
  const offline=await browser.newPage({viewport:{width:390,height:844},colorScheme:'dark',reducedMotion:'reduce'});
  offline.on('pageerror',e=>errors.push(e.message));await offline.route('**/api/config',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Nicht erreichbar'})}));
  await offline.goto(base);await offline.getByRole('heading',{name:'Bestand nicht erreichbar.',exact:true}).waitFor();await assertColors(offline);
  await offline.screenshot({path:'test-results/fehler-dark-mobile.png'});await open(offline);
  await offline.getByRole('button',{name:'Anwendung & Quellen',exact:true}).click();assert.equal(await offline.locator('#info-dialog a.source').count(),5);
  await offline.screenshot({path:'test-results/quellen-dark-mobile.png'});await offline.getByRole('button',{name:'Schließen',exact:true}).click();await close(offline);
  await offline.emulateMedia({colorScheme:'light'});await assertColors(offline);await offline.screenshot({path:'test-results/fehler-light-mobile.png'});await offline.close();
 });
 await check('Verwaltung, Dialoge und Eingaben wechseln vollständig das Schema; ungespeicherter Text bleibt',async()=>{
  const token=readFileSync(app.tokenPath,'utf8').trim();const setup=await context.request.post(base+'/api/setup',{headers:{Origin:base},data:{token,password:'Test-Info-Passwort-2026!'}});assert.equal(setup.status(),200);
  const configBefore=structuredClone(app.current());await page.getByRole('button',{name:'Menü öffnen'}).click();await page.getByRole('button',{name:'Verwaltung',exact:true}).click();await page.getByRole('button',{name:'Atmosphäre',exact:true}).click();
  const input=page.getByLabel('Anzeigename',{exact:true});await input.fill('Nicht gespeichert');await page.emulateMedia({colorScheme:'dark'});await noOverflow();
  const bg=await input.evaluate(e=>getComputedStyle(e).backgroundColor);assert.notEqual(bg,'rgb(250, 249, 245)');assert.equal(await input.inputValue(),'Nicht gespeichert');
  await page.screenshot({path:'test-results/verwaltung-dark-mobile.png'});await page.emulateMedia({colorScheme:'light'});assert.equal(await input.inputValue(),'Nicht gespeichert');assert.deepEqual(app.current(),configBefore);
 });
 assert.deepEqual(errors,[]);assert(requests.every(url=>url.startsWith(base)),'Externe Anfrage');
 console.log(`${count} Info-/Farbschema-Prüfungen bestanden. WebGL unter echtem Chromium mit Software-Grafiktreiber gerendert; keine externen Anfragen.`);
}finally{await context.close();await browser.close();await new Promise(resolve=>app.server.close(resolve));rmSync(dir,{recursive:true,force:true});}
