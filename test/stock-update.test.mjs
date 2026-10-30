import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults,newOils,stockUpdateRecipes} from '../src/catalog.mjs';
import {choose,dose,focusContexts} from '../public/engine.mjs';
import {validateConfig} from '../public/validate.mjs';
const date=new Date(2026,9,30,21);
const checked=()=>{const c=structuredClone(defaults);c.device.review='verified';for(const o of c.oils)if(!['on-guard','holiday-peace','valerian'].includes(o.id))o.review='verified';return c;};
test('Vier neue eindeutige Produkte und neun bewusst verfasste Duftideen',()=>{
 assert.deepEqual(newOils.map(o=>o.id),['on-guard','eucalyptus','valerian','holiday-peace']);assert.equal(stockUpdateRecipes.length,9);validateConfig(defaults);
 for(const id of ['on-guard','holiday-peace','valerian'])assert.equal(defaults.oils.find(o=>o.id===id).review,'declared');
 assert.equal(defaults.oils.find(o=>o.id==='oregano').cap,1);
});
test('Alle neuen Öle sind erreichbar, unklare regionale Varianten bleiben undosiert',()=>{
 const c=checked();for(const oil of newOils){const r=c.recipes.find(r=>r.parts.some(p=>p.oil===oil.id));const local={...c,recipes:[r]};const out=choose(local,{activity:r.activities[0],group:r.groups[0],intensity:'strong'},{date:new Date(2026,9,30,8)});assert(out.recipe);if(oil.review==='declared')assert.equal(out.parts,null);else assert(out.parts);}
});
test('Konkrete Lerntätigkeiten verändern den passenden Kandidatenkreis; keine Wirkversprechen',()=>{
 const c=checked(),pools={};for(const context of Object.keys(focusContexts)){const seen=[];pools[context]=new Set();for(let turn=0;turn<25;turn++){const out=choose(c,{activity:'focus',context,group:'any',intensity:'medium'},{date,turn,seen});assert(out.recipe.activities.includes('focus'));assert(out.recipe.contexts.includes(context));if(seen.length)assert.notEqual(out.signature,seen.at(-1));seen.push(out.signature);pools[context].add(out.signature);}assert(pools[context].size>=3);}
 assert.notDeepEqual(pools.read,pools.practice);assert.notDeepEqual(pools.practice,pools.create);
 assert.throws(()=>choose(c,{activity:'sleep',context:'read',group:'any',intensity:'medium'},{date}));
 // Old/custom recipes without context remain eligible; no forced invented alternative.
 c.recipes=[{...c.recipes[0],contexts:undefined}];delete c.recipes[0].contexts;
 assert(choose(c,{activity:'focus',context:'read',group:'fresh',intensity:'medium'},{date}).recipe);
});
test('Neue Rezeptdosierung respektiert Gesamtmenge, dominante Einzelnoten und Bestandsausschlüsse',()=>{
 const c=checked();for(const r of stockUpdateRecipes)for(const intensity of ['subtle','medium','strong']){const parts=dose(r,c,intensity);if(parts){assert.equal(parts.reduce((s,p)=>s+p.drops,0),c.device.totals[intensity]);for(const p of parts)assert(p.drops>=1&&p.drops<=c.oils.find(o=>o.id===p.oil).cap);}}
 for(const oil of newOils){const local=structuredClone(c);local.oils.find(o=>o.id===oil.id).excluded=true;for(let turn=0;turn<40;turn++){const out=choose(local,{activity:'surprise',group:'any',intensity:'strong'},{date,turn});assert(!out.recipe.parts.some(p=>p.oil===oil.id));}}
 const bad=structuredClone(c);bad.recipes[0].contexts=['medical'];assert.throws(()=>validateConfig(bad));
});
