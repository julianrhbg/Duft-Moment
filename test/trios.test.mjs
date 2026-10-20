import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults,trioRecipes} from '../src/catalog.mjs';
import {choose,dose,signature} from '../public/engine.mjs';
const date=new Date(2026,9,20,20),answers={activity:'focus',group:'fresh',intensity:'medium'};
const verified=()=>{const c=structuredClone(defaults);c.device.review='verified';for(const o of c.oils)o.review='verified';return c;};
test('Fünf Dreier-Kompositionen, ausschließlich bekannte Einzelöle; Dosis 3/4 möglich, 2 unmöglich',()=>{
 const c=verified();assert.equal(trioRecipes.length,5);
 for(const r of trioRecipes){assert.equal(r.parts.length,3);assert(r.parts.every(p=>!c.oils.find(o=>o.id===p.oil).blend));assert.equal(dose(r,c,'subtle'),null);
  for(const intensity of ['medium','strong']){const parts=dose(r,c,intensity);assert(parts);assert.equal(parts.reduce((sum,p)=>sum+p.drops,0),c.device.totals[intensity]);assert(parts.every(p=>p.drops>=1&&p.drops<=c.oils.find(o=>o.id===p.oil).cap));}}
});
test('Dreier-Präferenz wirkt innerhalb gleicher Passung, niemals über klare Priorität oder Tätigkeit hinweg',()=>{
 const c=verified(),pair=structuredClone(c.recipes.find(r=>r.id==='citrus-page')),trio=structuredClone(trioRecipes[0]);pair.times=[];trio.times=[];c.recipes=[pair,trio];let threes=0;
 for(let turn=0;turn<400;turn++)if(choose(c,answers,{date,turn}).recipe.parts.length===3)threes++;
 assert.equal(threes,300);pair.priority=2;trio.priority=-2;
 for(let turn=0;turn<20;turn++)assert.equal(choose(c,answers,{date,turn}).recipe.id,pair.id);
 trio.priority=0;trio.activities=['sleep'];pair.priority=0;
 for(let turn=0;turn<20;turn++)assert.equal(choose(c,answers,{date,turn}).recipe.id,pair.id);
});
test('Rotation bleibt fair: alle ungesehenen Kandidaten vor Wiederholung, keine unmittelbare gleiche Mischung',()=>{
 const c=verified(),seen=[];let firstCycle=[];
 for(let turn=0;turn<30;turn++){const r=choose(c,answers,{date,turn,seen});assert.notEqual(r.signature,seen.at(-1));if(turn===0){const pool=c.recipes.filter(x=>x.enabled&&x.groups.includes('fresh')&&x.activities.includes('focus')&&dose(x,c,'medium'));firstCycle=pool.map(signature);}
  if(turn<firstCycle.length)assert(!seen.includes(r.signature));seen.push(r.signature);}
 assert(seen.some(s=>s.split('|').length===3));assert(seen.some(s=>s.split('|').length<3));
});
test('Dezent bleibt höchstens zwei Zutaten, auch bei fehlender Prüfgrundlage; fertige Mischung bleibt möglich',()=>{
 for(const c of [verified(),structuredClone(defaults)])for(let turn=0;turn<40;turn++){const r=choose(c,{...answers,intensity:'subtle'},{date,turn});assert(r.recipe.parts.length<=2);if(r.parts)assert.equal(r.parts.reduce((s,p)=>s+p.drops,0),2);}
 const c=verified();c.recipes=c.recipes.filter(r=>r.id==='serenity');const r=choose(c,{activity:'sleep',group:'soft',intensity:'medium'},{date});assert.equal(r.recipe.parts.length,1);assert.equal(r.parts[0].oil,'serenity');
});
test('Gesperrte Zutaten entfernen Dreier-Rezepte; ausstehende Prüfung zeigt weiterhin nur Verhältnisse',()=>{
 const c=verified();c.oils.find(o=>o.id==='frankincense').excluded=true;
 for(let turn=0;turn<40;turn++){const r=choose(c,answers,{date,turn});assert(!r.recipe.parts.some(p=>p.oil==='frankincense'));}
 c.device.review='pending';for(let turn=0;turn<20;turn++)assert.equal(choose(c,answers,{date,turn}).parts,null);
});
