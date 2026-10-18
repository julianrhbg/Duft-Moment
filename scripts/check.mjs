import {readdirSync,readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {defaults,sources} from '../src/catalog.mjs';
import {sourceFallback} from '../public/meta.mjs';
import {validateConfig} from '../src/validate.mjs';
const root=path.resolve(import.meta.dirname,'..');
let count=0;
for(const folder of ['src','public','scripts','test'])for(const name of readdirSync(path.join(root,folder))){if(!name.endsWith('.mjs'))continue;const file=path.join(root,folder,name);const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0){process.stderr.write(result.stderr);process.exit(result.status||1);}count++;}
validateConfig(defaults);
assert.deepEqual(sourceFallback,sources);
for(const season of ['spring','summer','autumn','winter'])for(const phase of ['morning','day','evening'])for(const variant of [0,1]){const file=path.join(root,'public/assets',`${season}-${phase}-${variant}.svg`);assert(existsSync(file));assert(readFileSync(file,'utf8').includes('<svg'));}
assert(existsSync(path.join(root,'public/assets/credits.json')));
for(const mode of ['light','dark'])assert(existsSync(path.join(root,`public/assets/info-still-${mode}.webp`)));
assert.equal(defaults.oils.length,23);
console.log(`${count} JavaScript-Dateien syntaktisch gültig; Datenmodell und 24 lokale Landschaftsmotive geprüft. Kein separater Bundle-Build erforderlich.`);
