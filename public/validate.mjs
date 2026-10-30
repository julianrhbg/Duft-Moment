import {activityIds,groupIds,intensityIds,focusContexts} from './engine.mjs';
const text=(s,max=500)=>typeof s==='string'&&s.length<=max&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s);
const nonempty=(s,max=100)=>text(s,max)&&s.trim().length>0;
const url=s=>s===''||(text(s,1000)&&(()=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}})());
const id=s=>typeof s==='string'&&/^[a-z0-9][a-z0-9-]{0,63}$/.test(s);
const list=(a,valid)=>Array.isArray(a)&&a.length>0&&new Set(a).size===a.length&&a.every(x=>valid.includes(x));
const bool=v=>typeof v==='boolean';
const integer=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
function assert(condition,message){if(!condition)throw new Error(message);}
function exact(obj,keys){assert(obj&&typeof obj==='object'&&!Array.isArray(obj),'Ungültiger Datensatz.');assert(Object.keys(obj).every(k=>keys.includes(k)),'Unbekannte Datenfelder.');}
export function validateConfig(input){
 assert(input&&typeof input==='object'&&!Array.isArray(input),'Ungültige Einstellungen.');
 exact(input,['schemaVersion','oils','recipes','device','settings']);assert(input.schemaVersion===1,'Unbekannte Datenversion.');
 assert(Array.isArray(input.oils)&&input.oils.length<=150,'Maximal 150 Produkte.');
 const ids=new Set();
 for(const o of input.oils){exact(o,['id','name','profile','groups','cap','brand','variant','available','excluded','review','source','reviewedAt','blend','notes']);
  assert(id(o.id)&&!ids.has(o.id),'Produkt-ID fehlt oder ist doppelt.');ids.add(o.id);
  assert(nonempty(o.name)&&text(o.profile,300)&&text(o.brand,100)&&text(o.notes,2000),'Produkttexte sind ungültig.');
  assert(list(o.groups,groupIds)&&integer(o.cap,1,4),'Produktgruppe oder Einzelölgrenze ist ungültig.');
  assert(['oil','touch','supplement','cleaner','other'].includes(o.variant),'Produktvariante fehlt.');
  assert(['pending','declared','verified','blocked'].includes(o.review)&&bool(o.available)&&bool(o.excluded)&&bool(o.blend),'Produktstatus ist ungültig.');
  assert(url(o.source)&&text(o.reviewedAt,10),'Produktquelle ist ungültig.');
  if(o.review==='verified')assert(o.variant==='oil'&&o.source&&/^\d{4}-\d{2}-\d{2}$/.test(o.reviewedAt),'Geprüfte Produkte brauchen Ölvariante, HTTPS-Quelle und Prüfdatum.');
 }
 assert(Array.isArray(input.recipes)&&input.recipes.length<=300,'Maximal 300 Rezepte.');
 const recipeIds=new Set();for(const r of input.recipes){exact(r,['id','name','parts','groups','activities','description','times','priority','enabled','contexts']);
  assert(id(r.id)&&!recipeIds.has(r.id),'Rezept-ID fehlt oder ist doppelt.');recipeIds.add(r.id);
  if(r.contexts!==undefined)assert(Array.isArray(r.contexts)&&new Set(r.contexts).size===r.contexts.length&&r.contexts.every(c=>Object.hasOwn(focusContexts,c)),'Ungültige konkrete Tätigkeiten.');
  assert(nonempty(r.name)&&text(r.description,300),'Rezepttext ist ungültig.');
  assert(Array.isArray(r.parts)&&r.parts.length>0&&r.parts.length<=4&&new Set(r.parts.map(p=>p.oil)).size===r.parts.length,'Ein Rezept braucht 1–4 unterschiedliche Produkte.');
  for(const p of r.parts){exact(p,['oil','ratio']);assert(ids.has(p.oil)&&integer(p.ratio,1,20),'Unbekanntes Produkt oder ungültiges Verhältnis.');}
  assert(r.parts.filter(p=>input.oils.find(o=>o.id===p.oil).blend).length<=1,'Höchstens eine fertige Mischung pro Rezept.');
  assert(list(r.groups,groupIds)&&list(r.activities,activityIds.filter(x=>x!=='surprise')),'Rezeptzuordnungen fehlen.');
  assert(Array.isArray(r.times)&&r.times.every(t=>['morning','day','evening','night'].includes(t))&&new Set(r.times).size===r.times.length,'Tageszeiten sind ungültig.');
  assert(integer(r.priority,-2,2)&&bool(r.enabled),'Rezeptpriorität oder Status ist ungültig.');
 }
 const d=input.device;exact(d,['name','waterMl','review','source','reviewedAt','notes','maxDrops','totals']);
 assert(nonempty(d.name)&&integer(d.waterMl,1,1000)&&['pending','verified'].includes(d.review)&&url(d.source)&&text(d.notes,2000)&&text(d.reviewedAt,10),'Geräteangaben sind ungültig.');
 assert(integer(d.maxDrops,1,4),'Interne Höchstmenge: 1–4 Tropfen.');exact(d.totals,intensityIds);
 assert(intensityIds.every(i=>integer(d.totals[i],1,d.maxDrops)),'Ungültige Gesamttropfenzahl.');
 assert(d.totals.subtle<=d.totals.medium&&d.totals.medium<=d.totals.strong,'Intensitätsmengen müssen aufsteigend sein.');
 if(d.review==='verified')assert(d.source&&/^\d{4}-\d{2}-\d{2}$/.test(d.reviewedAt),'Geprüfte Dosierung braucht HTTPS-Quelle und Prüfdatum.');
 const s=input.settings;exact(s,['defaultIntensity','motion','season','images','disabledScenes','title','tagline','intro']);
 assert(intensityIds.includes(s.defaultIntensity)&&bool(s.motion)&&bool(s.images),'Darstellung ist ungültig.');
 assert(['auto','spring','summer','autumn','winter'].includes(s.season),'Jahreszeit ist ungültig.');
 assert(Array.isArray(s.disabledScenes)&&s.disabledScenes.length<=24&&s.disabledScenes.every(v=>/^(spring|summer|autumn|winter)-(morning|day|evening)-[01]$/.test(v)),'Bildauswahl ist ungültig.');
 assert(nonempty(s.title,40)&&nonempty(s.tagline,100)&&text(s.intro,150),'Seitentexte sind ungültig.');
 return structuredClone(input);
}
