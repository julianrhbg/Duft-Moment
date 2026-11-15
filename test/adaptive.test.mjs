import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults} from '../src/catalog.mjs';
import {chooseAdaptive,nextQuestion,signature} from '../public/engine.mjs';
const date=new Date(2026,10,15,19);
test('same answers are independent of visit, turn and day hash',()=>{const a={activity:'focus',intensity:'medium',group:'any'};const first=chooseAdaptive(defaults,a,{date});for(let turn=0;turn<100;turn++)assert.equal(chooseAdaptive(defaults,a,{date,turn,seen:[first.signature]}).signature,first.signature);});
test('questions terminate within four total and wishes are respected',()=>{const walk=(a,depth)=>{assert(depth<=2);const q=nextQuestion(defaults,a);if(!q){const r=chooseAdaptive(defaults,a,{date});if(!r.empty&&a.group!=='any')assert(r.recipe.groups.includes(a.group));return;}for(const [value]of q.options)walk({...a,[q.key]:value,...(q.key==='group'?{characterAnswered:true}:{})},depth+1);};for(const activity of ['focus','sleep','pause','room','sofa'])walk({activity,intensity:'medium',group:'any'},0);});
test('exclusions remain strict',()=>{const c=structuredClone(defaults);const a={activity:'focus',intensity:'medium',group:'any'};const first=chooseAdaptive(c,a,{date});for(const p of first.recipe.parts)c.oils.find(o=>o.id===p.oil).excluded=true;const next=chooseAdaptive(c,a,{date});if(!next.empty)for(const p of next.recipe.parts)assert(!c.oils.find(o=>o.id===p.oil).excluded);});
test('explicit alternative changes composition when available',()=>{const a={activity:'focus',intensity:'medium',group:'any'},first=chooseAdaptive(defaults,a,{date});if(first.alternatives)assert.notEqual(signature(first.recipe),chooseAdaptive(defaults,a,{date,alternativeIndex:1}).signature);});
