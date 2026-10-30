// Actual frontend modules executed with DOM/WebGL test doubles. This is not a browser/rendering test.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {defaults,sources} from '../src/catalog.mjs';
const fixtures={config:structuredClone(defaults),sources,version:1};
const listeners=new Map(),themes=new Map(),raf=new Map();let nextFrame=1,removed=0,requests=0;
const fire=(target,type,props={})=>{for(const fn of target.events?.get(type)||[])fn({target,currentTarget:target,preventDefault(){},...props});};
class N{constructor(tag='div',text=''){this.tagName=tag.toUpperCase();this.children=[];this.events=new Map();this.attrs={};this.dataset={};this.parentNode=null;this._text=text;this.open=false;this.scrollTop=0;this.offsetHeight=1400;this.clientHeight=600;this.disabled=false;this.style={setProperty(k,v){this[k]=String(v);}};this.className='';this.classList={toggle:(c,on)=>{const a=new Set(this.className.split(' ').filter(Boolean));if(on)a.add(c);else a.delete(c);this.className=[...a].join(' ');}};}
 get firstChild(){return this.children[0]||null;}
 get isConnected(){return this===document.body||this===document.head||!!this.parentNode?.isConnected;}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}set textContent(t){this._text=String(t);this.children=[];}
 append(...nodes){for(const item of nodes){const n=item instanceof N?item:new N('#text',String(item));n.parentNode=this;this.children.push(n);if(this===document.head&&n.tagName==='LINK')queueMicrotask(()=>fire(n,'load'));}}
 prepend(n){n.parentNode=this;this.children.unshift(n);}replaceChildren(...nodes){this.children.forEach(n=>n.parentNode=null);this.children=[];this._text='';this.append(...nodes);}remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(c=>c!==this);this.parentNode=null;removed++;}}
 setAttribute(k,v){if(k==='class')this.className=String(v);else this.attrs[k]=String(v);if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,a)=>a.toUpperCase())]=String(v);}getAttribute(k){return k==='class'?this.className:this.attrs[k]??null;}removeAttribute(k){delete this.attrs[k];}
 addEventListener(type,fn,options={}){if(!this.events.has(type))this.events.set(type,[]);this.events.get(type).push(fn);options.signal?.addEventListener('abort',()=>{this.events.set(type,this.events.get(type).filter(f=>f!==fn));},{once:true});}removeEventListener(type,fn){this.events.set(type,(this.events.get(type)||[]).filter(f=>f!==fn));}
 matches(s){if(s.startsWith('#'))return this.attrs.id===s.slice(1);if(s.startsWith('.'))return this.className.split(' ').includes(s.slice(1));return this.tagName===s.toUpperCase();}
 querySelectorAll(s){const descendants=[];for(const c of this.children){descendants.push(c,...c.querySelectorAll('*'));}if(s==='*')return descendants;return descendants.filter(n=>s.split(',').some(selector=>{const parts=selector.trim().split(/\s+/);if(!n.matches(parts.at(-1)))return false;if(parts.length===1)return true;let p=n.parentNode;while(p){if(p.matches(parts[0]))return true;p=p.parentNode;}return false;}));}querySelector(s){return this.querySelectorAll(s)[0]||null;}
 focus(){document.activeElement=this;}showModal(){this.open=true;this.attrs.open='';}close(){this.open=false;delete this.attrs.open;fire(this,'close');}getBoundingClientRect(){return {left:0,top:0,right:390,bottom:600,width:390,height:600};}getContext(){return null;}
}
const document={body:new N('body'),head:new N('head'),activeElement:null,hidden:false,title:'',events:new Map(),createElement:t=>new N(t),createTextNode:t=>new N('#text',t),querySelector(s){return this.body.querySelector(s)||this.head.querySelector(s);},addEventListener:N.prototype.addEventListener};document.activeElement=document.body;
for(const [tag,id]of [['button','home'],['span','brand'],['button','menu-button'],['button','info-button'],['dialog','menu'],['dialog','info-dialog'],['div','dialog-content'],['button','close-dialog'],['div','main'],['div','toast']]){const n=new N(tag);n.setAttribute('id',id);document.body.append(n);}
const win={events:new Map(),addEventListener:N.prototype.addEventListener,scrollTo(){}};
const location={hash:'',pathname:'/'};let entries=[{state:null,url:'/'}],position=0;
const history={get state(){return entries[position].state;},replaceState(state,_,url){entries[position]={state,url};location.hash=url.includes('#')?url.slice(url.indexOf('#')):'';},pushState(state,_,url){entries=entries.slice(0,position+1);entries.push({state,url});position++;location.hash=url.includes('#')?url.slice(url.indexOf('#')):'';},back(){if(position){position--;location.hash=entries[position].url.includes('#')?entries[position].url.slice(entries[position].url.indexOf('#')):'';fire(win,'popstate',{state:this.state});}},forward(){if(position<entries.length-1){position++;location.hash=entries[position].url.includes('#')?entries[position].url.slice(entries[position].url.indexOf('#')):'';fire(win,'popstate',{state:this.state});}}};
const matchMedia=query=>{if(!themes.has(query)){const t={matches:false,events:new Map(),addEventListener:N.prototype.addEventListener};themes.set(query,t);}return themes.get(query);};
const navigator={connection:{saveData:false},deviceMemory:8,hardwareConcurrency:8};
const context=vm.createContext({console,Node:N,document,window:win,history,location,navigator,matchMedia,AbortController,Date,crypto,devicePixelRatio:1,ResizeObserver:class{observe(){}disconnect(){}},requestAnimationFrame:fn=>{const id=nextFrame++;raf.set(id,fn);return id;},cancelAnimationFrame:id=>raf.delete(id),setInterval(){},setTimeout:()=>0,clearTimeout(){},queueMicrotask,fetch:async()=>{requests++;return {ok:true,status:200,json:async()=>structuredClone(fixtures)};}});
const root=path.resolve('public'),modules=new Map();
async function moduleFor(name){if(modules.has(name))return modules.get(name);let code=await readFile(path.join(root,name),'utf8');if(name==='app.mjs')code+='\nexport const testing={state:()=>({step,answers:{...answers},view,run,turn}),showSources,home};';const m=new vm.SourceTextModule(code,{context,identifier:name,importModuleDynamically:async(specifier,parent)=>{const child=await moduleFor(path.posix.join(path.posix.dirname(parent.identifier),specifier));if(child.status==='unlinked')await child.link(link);if(child.status==='linked')await child.evaluate();return child;}});modules.set(name,m);return m;}
const link=(specifier,parent)=>moduleFor(path.posix.join(path.posix.dirname(parent.identifier),specifier));
const app=await moduleFor('app.mjs');await app.link(link);await app.evaluate();
const tick=async()=>{for(let n=0;n<12;n++){await new Promise(r=>setTimeout(r,2));const frames=[...raf.values()];raf.clear();frames.forEach(fn=>fn());}};
const findButton=(text,root=document.body)=>root.querySelectorAll('button').find(n=>n.textContent===text||n.textContent.startsWith(text));
await tick();assert(document.querySelector('#main').textContent.includes('Was hastdu vor?'));assert(!modules.has('info-demo.mjs'));assert(!modules.has('info-room.mjs'));
findButton('Lernen & Arbeiten').events.get('click')[0]();await tick();assert.equal(app.namespace.testing.state().step,1);findButton('Lesen & verstehen').events.get('click')[0]();await tick();assert.equal(app.namespace.testing.state().step,2);findButton('Warm & holzig').events.get('click')[0]();await tick();assert.equal(app.namespace.testing.state().step,3);
const previous=JSON.stringify(app.namespace.testing.state()),beforeRequests=requests;
fire(document.querySelector('#info-button'),'click');await tick();
const info=document.querySelector('#info-dialog');
assert(info.open);assert(!document.querySelector('.info-experience'));
assert(!modules.has('info-demo.mjs'));assert(!modules.has('info-room.mjs'));
assert.equal(location.hash,'');
assert.equal(document.querySelector('#dialog-content').querySelectorAll('a').length,fixtures.sources.length+fixtures.config.oils.filter(o=>o.review==='verified').length+(fixtures.config.device.review==='verified'?1:0));
assert.equal(JSON.stringify(app.namespace.testing.state()),previous);assert.equal(requests,beforeRequests);
fire(document.querySelector('#close-dialog'),'click');assert(!info.open);
// Old browser history entries still lead to sources, never the retired demo.
fire(win,'popstate',{state:{overlay:'info'}});await tick();assert(info.open);assert(!modules.has('info-demo.mjs'));fire(document.querySelector('#close-dialog'),'click');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');reduced.matches=true;fire(reduced,'change');
fire(document.querySelector('#info-button'),'click');await tick();assert(info.open);fire(document.querySelector('#close-dialog'),'click');
fire(findButton('Deutlich'),'click');await tick();assert.equal(app.namespace.testing.state().step,4);assert(document.querySelector('#main').querySelector('.recipe-parts'));
const resultBefore=document.querySelector('#main').textContent;
fire(document.querySelector('#info-button'),'click');await tick();assert(info.open);fire(document.querySelector('#close-dialog'),'click');await tick();assert.equal(document.querySelector('#main').textContent,resultBefore);
fire(document.querySelector('#menu-button'),'click');fire(findButton('Anwendung & Quellen',document.querySelector('#menu')),'click');await tick();assert(info.open);assert(!document.querySelector('#menu').open);fire(document.querySelector('#close-dialog'),'click');
assert(!modules.has('info-demo.mjs'));assert(!modules.has('info-room.mjs'));
app.namespace.testing.home();await tick();assert.equal(app.namespace.testing.state().step,0);assert.equal(Object.keys(app.namespace.testing.state().answers).length,0);
console.log('PASS: Info opens sources directly; quiz answers/result survive; menu and legacy history work; retired demo modules are never imported. DOM test doubles, not visual browser verification.');
