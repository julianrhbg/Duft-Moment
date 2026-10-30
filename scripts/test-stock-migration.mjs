import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {defaults,newOilIds,restockedOilIds,stockUpdateRecipes} from '../src/catalog.mjs';
const worker=(await import('data:text/javascript;base64,'+Buffer.from(await readFile(new URL('../worker/index.js',import.meta.url))).toString('base64'))).default;
const config=structuredClone(defaults);config.oils=config.oils.filter(o=>!newOilIds.includes(o.id));config.recipes=config.recipes.filter(r=>!stockUpdateRecipes.some(x=>x.id===r.id));config.recipes.forEach(r=>delete r.contexts);
config.oils.find(o=>o.id==='serenity').available=false;config.oils.find(o=>o.id==='serenity').excluded=true;
config.oils[0].excluded=true;config.oils[1].available=false;config.settings.title='Eigener Titel';config.device.totals.medium=2;config.recipes[0].priority=-2;
config.recipes.push({...structuredClone(config.recipes[0]),id:'custom',name:'Mein eigenes Rezept'});
const initial={config,version:8,hostingRelease:6,trioLibraryVersion:1,auth:{salt:'keep',hash:'keep'},sessions:[{hash:'keep',expires:123}],rates:{custom:{start:1,n:2}},legacyBackup:{keep:true}};
class Bucket{constructor(state){this.data=JSON.stringify(state);this.rev=1;this.conflict=false;}async get(){return{etag:String(this.rev),json:async()=>JSON.parse(this.data)};}async put(k,v,{onlyIf}){if(this.conflict){this.conflict=false;const state=JSON.parse(this.data);state.config.settings.intro='Gleichzeitige Bearbeitung';this.data=JSON.stringify(state);this.rev++;return null;}if(onlyIf.etagMatches!==String(this.rev))return null;this.data=v;return{etag:String(++this.rev)};}}
const get=b=>worker.fetch(new Request('https://test.example/api/config'),{BUCKET:b});
const bucket=new Bucket(initial);assert.equal((await get(bucket)).status,200);const saved=JSON.parse(bucket.data);
assert.equal(saved.version,9);assert.equal(saved.stockUpdateVersion,1);assert.equal(saved.config.oils.length,27);assert.equal(saved.config.recipes.length,config.recipes.length+9);
for(const key of ['auth','sessions','rates','legacyBackup'])assert.deepEqual(saved[key],initial[key]);
for(const key of ['device','settings'])assert.deepEqual(saved.config[key],config[key]);
for(const old of config.oils){const expected=structuredClone(old);if(restockedOilIds.includes(old.id)){expected.available=true;expected.excluded=false;}assert.deepEqual(saved.config.oils.find(o=>o.id===old.id),expected);}
for(const old of config.recipes){const actual=structuredClone(saved.config.recipes.find(r=>r.id===old.id));delete actual.contexts;assert.deepEqual(actual,old);}
let rev=bucket.rev;await get(bucket);assert.equal(bucket.rev,rev);
// Later administration decisions always win, including explicit removal.
saved.config.oils.find(o=>o.id==='serenity').excluded=true;saved.config.oils.find(o=>o.id==='oregano').available=false;
saved.config.recipes=saved.config.recipes.filter(r=>!r.parts.some(p=>p.oil==='valerian'));saved.config.oils=saved.config.oils.filter(o=>o.id!=='valerian');bucket.data=JSON.stringify(saved);
await get(bucket);assert.deepEqual(JSON.parse(bucket.data),saved);
const collision=structuredClone(initial);collision.config.oils.push({...structuredClone(defaults.oils.find(o=>o.id==='eucalyptus')),name:'Eigene Variante',review:'pending',cap:1});const cb=new Bucket(collision);await get(cb);assert.equal(JSON.parse(cb.data).config.oils.find(o=>o.id==='eucalyptus').review,'pending');assert.equal(JSON.parse(cb.data).config.oils.find(o=>o.id==='eucalyptus').name,'Eigene Variante');
const concurrent=new Bucket(initial);concurrent.conflict=true;assert.equal((await get(concurrent)).status,200);assert.equal(JSON.parse(concurrent.data).config.settings.intro,'Gleichzeitige Bearbeitung');assert.equal(JSON.parse(concurrent.data).version,9);
console.log('PASS: stock update, explicit restocks, unchanged private state/device/caps/custom recipes, collisions, idempotency, later removals, concurrent write preservation.');
