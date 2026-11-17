export const focusContexts={read:'Lesen & verstehen',practice:'Üben & wiederholen',create:'Schreiben & gestalten'};
export const groupIds=['fresh','soft','warm'];
export const activityIds=['wake','focus','pause','sleep','sofa','room','surprise'];
export const intensityIds=['subtle','medium','strong'];
export function isMorning(date=new Date()){return date.getHours()>=6&&date.getHours()<11;}
export function timeOfDay(date=new Date()){const h=date.getHours();return h>=6&&h<11?'morning':h>=11&&h<18?'day':h>=18&&h<23?'evening':'night';}
export function seasonOf(date=new Date()){return ['winter','winter','spring','spring','spring','summer','summer','summer','autumn','autumn','autumn','winter'][date.getMonth()];}
export function dateKey(date=new Date()){return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;}
export function signature(recipe){return recipe.parts.map(p=>p.oil).sort().join('|');}
function hash(value){let n=2166136261;for(const c of value)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
function usable(o){return o.available&&!o.excluded&&o.variant==='oil'&&['declared','verified'].includes(o.review);}
export function baseCandidates(config){const map=new Map(config.oils.map(o=>[o.id,o]));return config.recipes.filter(r=>r.enabled&&r.parts.length>0&&r.parts.length<=4&&new Set(r.parts.map(p=>p.oil)).size===r.parts.length&&r.parts.every(p=>p.ratio>0&&usable(map.get(p.oil)??{}))&&r.parts.filter(p=>map.get(p.oil)?.blend).length<=1);}
export function availableGroups(config,activity){return groupIds.filter(g=>baseCandidates(config).some(r=>(activity==='surprise'||r.activities.includes(activity))&&r.groups.includes(g)));}
export function dose(recipe,config,intensity){const oils=new Map(config.oils.map(o=>[o.id,o]));
 if(config.device.review!=='verified'||recipe.parts.some(p=>oils.get(p.oil)?.review!=='verified'))return null;
 const total=config.device.totals[intensity];if(!Number.isInteger(total)||total>Math.min(config.device.maxDrops,4)||total<recipe.parts.length)return null;
 const sum=recipe.parts.reduce((s,p)=>s+p.ratio,0);let best=null,bestError=Infinity;
 function visit(i,left,counts){if(i===recipe.parts.length){if(left!==0)return;const error=counts.reduce((s,n,j)=>s+(n/total-recipe.parts[j].ratio/sum)**2,0);if(error<bestError){bestError=error;best=counts;}return;}
  const part=recipe.parts[i];const oilCap=oils.get(part.oil)?.cap??0;const shareCap=oilCap===1&&recipe.parts.length>1?Math.floor(total*part.ratio/sum):total;const cap=Math.min(oilCap,left,shareCap);for(let n=1;n<=cap;n++)visit(i+1,left-n,[...counts,n]);}
 visit(0,total,[]);return best?recipe.parts.map((p,i)=>({...p,drops:best[i]})):null;
}
export function choose(config,answers,{date=new Date(),turn=0,seen=[]}={}){
 if(!activityIds.includes(answers.activity)||!intensityIds.includes(answers.intensity)||!(answers.group==='any'||groupIds.includes(answers.group)))throw Error('Bitte vervollständige deine Auswahl.');
 if(answers.context&&(!Object.hasOwn(focusContexts,answers.context)||answers.activity!=='focus'))throw Error('Bitte wähle deine Tätigkeit neu.');
 if(answers.activity==='wake'&&!isMorning(date))return {resetMorning:true};
 let pool=baseCandidates(config);
 if(!pool.length)return {empty:true,reason:'Im Moment ist keine freigegebene Duftidee mit deinem verfügbaren Bestand möglich.'};
 const exact=pool.filter(r=>(answers.activity==='surprise'||r.activities.includes(answers.activity))&&(answers.group==='any'||r.groups.includes(answers.group)));
 let fallback=false;
 if(exact.length)pool=exact;else{
  // The alternative may relax activity, but never silently change the requested fragrance group.
  pool=pool.filter(r=>answers.group==='any'||r.groups.includes(answers.group));fallback=true;
  if(!pool.length)return {empty:true,reason:'Für diese Duftrichtung ist gerade keine passende Mischung verfügbar. Ändere deine Auswahl.'};
 }
 // Dosability is a requirement for verified recipes, not a rank bonus.
 pool=pool.filter(r=>r.parts.length<=config.device.totals[answers.intensity]&&(!(config.device.review==='verified'&&r.parts.every(p=>config.oils.find(o=>o.id===p.oil)?.review==='verified'))||dose(r,config,answers.intensity)));
 if(!pool.length)return {empty:true,reason:'Diese Intensität ist mit den geprüften Rezeptgrenzen nicht dosierbar. Bitte ändere die Auswahl.'};
 const unique=new Map();for(const r of pool){const key=signature(r);if(!unique.has(key)||unique.get(key).priority<r.priority)unique.set(key,r);}pool=[...unique.values()];
 const contextFit=r=>answers.context&&r.contexts?.includes(answers.context)?3:0;
 const score=r=>contextFit(r)+Math.min(2,Math.max(-2,r.priority))+(r.times.includes(timeOfDay(date))?1:0);
 const top=Math.max(...pool.map(score));pool=pool.filter(r=>score(r)>=top-2);
 pool.sort((a,b)=>a.id.localeCompare(b.id));
 const unseen=pool.filter(r=>!seen.includes(signature(r)));const previous=seen.at(-1);
 const choices=unseen.length?unseen:pool.filter(r=>signature(r)!==previous);
 const eligible=choices.length?choices:pool;
 // Weight only after exact fit, dosing, priority window, deduplication and unseen rotation.
 // A ready-made blend never needs two additions just to win the three-product preference.
 const weighted=eligible.flatMap(r=>Array(answers.group==='any'?1:r.parts.length===3&&r.parts.every(p=>!config.oils.find(o=>o.id===p.oil)?.blend)?3:1).fill(r));
 const index=(hash(`${dateKey(date)}:${answers.activity}:${answers.group}:${answers.context||''}`)+turn)%weighted.length;
 const recipe=weighted[index];return {recipe,signature:signature(recipe),parts:dose(recipe,config,answers.intensity),fallback,alternatives:pool.length>1};
}
export function sceneFor(config,date=new Date()){
 const season=config.settings.season==='auto'?seasonOf(date):config.settings.season;
 const time=timeOfDay(date);const phase=['evening','night'].includes(time)?'evening':time==='morning'?'morning':'day';
 const options=[0,1].map(i=>`${season}-${phase}-${i}`).filter(id=>!config.settings.disabledScenes.includes(id));
 return {season,time,id:options.length?options[hash(dateKey(date))%options.length]:null};
}

// Context refines editorial atmosphere only; no claim about physiological effects.
export function adaptivePool(config,answers){
 let pool=baseCandidates(config).filter(r=>answers.activity==='surprise'||r.activities.includes(answers.activity));
 if(answers.intensity)pool=pool.filter(r=>r.parts.length<=config.device.totals[answers.intensity]&&(!(config.device.review==='verified'&&r.parts.every(p=>config.oils.find(o=>o.id===p.oil)?.review==='verified'))||dose(r,config,answers.intensity)));
 if(answers.after&&answers.after!=='open')pool=pool.filter(r=>r.activities.includes(answers.after));
 return pool;
}
const noteOils={citrus:['lemon','lime','wild-orange','grapefruit','bergamot','citrus-bliss'],mint:['peppermint','air','eucalyptus','lemon-eucalyptus'],floral:['lavender','serenity','adaptiv'],wood:['copaiba','frankincense','balance','holiday-peace'],herbal:['bergamot-mint','tulsi','oregano','lemongrass','valerian']};
const noteNames={citrus:'Zitrusschale',mint:'Minze & Eukalyptus',floral:'Blüten & Lavendel',wood:'Holz & Harz',herbal:'Kräuter'};
function hasNote(r,n){return r.parts.some(p=>noteOils[n]?.includes(p.oil));}
function preferencePool(config,answers){return adaptivePool(config,answers).filter(r=>(!answers.group||answers.group==='any'||r.groups.includes(answers.group))&&(!answers.note||answers.note==='any'||hasNote(r,answers.note)));}
export function nextQuestion(config,answers){
 const pool=preferencePool(config,answers);if(new Set(pool.map(signature)).size<=1)return null;
 if(answers.note===undefined){const choices=Object.entries(noteNames).filter(([id])=>{const n=pool.filter(r=>hasNote(r,id)).length;return n>0&&n<pool.length;});if(choices.length>1)return {key:'note',title:'Wie soll es duften?',options:[...choices,['any','Passend zu meinem Moment']]};}
 return null;
}
export function chooseAdaptive(config,answers,{date=new Date(),alternativeIndex=0}={}){
 if(!activityIds.includes(answers.activity)||!intensityIds.includes(answers.intensity)||!(answers.group==='any'||groupIds.includes(answers.group))||answers.note!==undefined&&answers.note!=='any'&&!Object.hasOwn(noteOils,answers.note))throw Error('Bitte vervollständige deine Auswahl.');
 if(answers.activity==='wake'&&!isMorning(date))return {resetMorning:true};
 const unique=new Map();
 const score=r=>Math.min(2,Math.max(-2,r.priority))*10+(r.times.includes(timeOfDay(date))?1:0);
 for(const r of preferencePool(config,answers)){const key=signature(r),old=unique.get(key);if(!old||score(r)>score(old)||score(r)===score(old)&&r.id<old.id)unique.set(key,r);}
 const recipes=[...unique.values()].sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id));
 if(!recipes.length)return {empty:true,reason:'Für diese Auswahl ist mit deinem Bestand keine passende Mischung verfügbar. Ändere deine Auswahl.'};
 const recipe=recipes[Math.max(0,alternativeIndex)%recipes.length];
 return {recipe,signature:signature(recipe),parts:dose(recipe,config,answers.intensity),fallback:false,alternatives:recipes.length>1};
}
