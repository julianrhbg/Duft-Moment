import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../public/intro.js',import.meta.url),'utf8');
function setup({reduced=false,hidden=false,hash='',fail=false}={}){
 const layer=new EventTarget();layer.hidden=true;layer.removed=0;layer.remove=()=>layer.removed++;
 const document=new EventTarget();document.hidden=hidden;document.querySelector=()=>layer;
 const window=new EventTarget(),media=new EventTarget();media.matches=reduced;
 const timers=new Map();let time=0,id=0;
 const sandbox={document,window,location:{hash},AbortController,matchMedia:()=>{if(fail)throw Error('unavailable');return media;},setTimeout:(fn,ms)=>{assert(ms<=6000);timers.set(++id,{fn,at:time+ms});return id;},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(code,sandbox);
 function event(target,type,fields={}){const e=new Event(type,{cancelable:true});for(const[k,v]of Object.entries(fields))Object.defineProperty(e,k,{value:v});target.dispatchEvent(e);return e;}
 function advance(ms){time+=ms;for(const[key,t]of [...timers])if(t.at<=time){timers.delete(key);t.fn();}}
 return{layer,document,window,media,timers,event,advance};
}
test('Einstieg endet bei 6000 ms und bleibt entfernt',()=>{const t=setup();assert.equal(t.layer.hidden,false);t.advance(5999);assert.equal(t.layer.removed,0);t.advance(1);assert.equal(t.layer.removed,1);assert.equal(t.timers.size,0);t.event(t.window,'pageshow',{persisted:false});t.event(t.document,'visibilitychange');assert.equal(t.layer.removed,1);});
test('Klick überspringt und konsumiert den Klick; Escape und Tab räumen sofort auf',()=>{
 const t=setup();let later=0;t.layer.addEventListener('click',()=>later++);const e=t.event(t.layer,'click');assert(e.defaultPrevented);assert.equal(later,0);assert.equal(t.layer.removed,1);assert.equal(t.timers.size,0);
 for(const key of ['Escape','Tab']){const s=setup();const e=s.event(s.document,'keydown',{key});assert.equal(s.layer.removed,1);assert.equal(e.defaultPrevented,key==='Escape');assert.equal(s.timers.size,0);}
});
test('Reduzierte Bewegung, verdeckter Start und direkte Verwaltung/Info starten ohne Wartezeit',()=>{for(const args of [{reduced:true},{hidden:true},{hash:'#verwaltung'},{hash:'#info'},{fail:true}]){const t=setup(args);assert.equal(t.layer.removed,1);assert.equal(t.timers.size,0);}});
test('BFCache, Verlassen des Tabs und dynamische Bewegungsreduktion beenden ohne Neustart',()=>{
 for(const action of [t=>t.event(t.window,'pageshow',{persisted:true}),t=>t.event(t.window,'pagehide'),t=>{t.document.hidden=true;t.event(t.document,'visibilitychange');},t=>t.event(t.media,'change',{matches:true})]){const t=setup();action(t);assert.equal(t.layer.removed,1);assert.equal(t.timers.size,0);t.document.hidden=false;t.event(t.document,'visibilitychange');t.advance(7000);assert.equal(t.layer.removed,1);}
});
test('CSS-Ende räumt auf; dekorative Texte und No-JS-Fallback sind korrekt',async()=>{
 const t=setup();t.event(t.layer,'animationend',{animationName:'opening-exit'});assert.equal(t.layer.removed,1);assert.equal(t.timers.size,0);
 const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8'),css=await readFile(new URL('../public/intro.css',import.meta.url),'utf8');
 assert(html.includes('aria-hidden="true" hidden'));for(const text of ['Drei Düfte.','Ein Moment.','DAZWISCHEN'])assert(html.includes(text));assert(css.includes('6000ms'));assert(css.includes('prefers-reduced-motion: reduce'));assert(!/fetch\(|localStorage|sessionStorage|\.focus\(|history\./.test(code));
});
