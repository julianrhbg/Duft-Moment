// Runs the actual renderer against a WebGL test double; no GPU/browser claims.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRoomRenderer} from '../public/info-room.mjs';
const events=new Map(),uniforms={},created=new Set(),deleted=new Set(),storage=new Map(),attributes=new Map(),frames=[];
let counter=0,bound=null,draws=0,copies=0,textureAllocations=0,rect={width:390,height:600};
const resource=()=>{const id=++counter;created.add(id);return id;};
const dispose=id=>{assert(created.has(id));assert(!deleted.has(id));deleted.add(id);};
const finite=values=>assert([...values].every(Number.isFinite));
const transform=(m,v)=>[0,1,2,3].map(i=>m[i]*v[0]+m[i+4]*v[1]+m[i+8]*v[2]+m[i+12]*v[3]);
const gl=new Proxy({
 ARRAY_BUFFER:34962,getShaderParameter:()=>true,getProgramParameter:()=>true,
 getAttribLocation:(_,name)=>name==='aPosition'?0:1,getUniformLocation:(_,name)=>name,isContextLost:()=>false,
 createShader:resource,createProgram:resource,createBuffer:resource,createTexture:resource,
 bindBuffer:(_,id)=>{bound=id;},bufferData:(_,values)=>{finite(values);storage.set(bound,values);},
 vertexAttribPointer:location=>attributes.set(location,bound),
 uniformMatrix4fv:(name,_,value)=>{finite(value);uniforms[name]=[...value];},
 uniform3fv:(name,value)=>{finite(value);uniforms[name]=[...value];},
 uniform2f:(name,...value)=>{finite(value);uniforms[name]=value;},uniform1f:(name,value)=>{assert(Number.isFinite(value));uniforms[name]=value;},
 texImage2D:()=>textureAllocations++,copyTexSubImage2D:()=>copies++,
 drawArrays:(_,start,count)=>{
  draws++;assert.equal(start,0);assert(count>0);const positions=storage.get(attributes.get(0));assert.equal(positions.length/3,count);
  frames.push({material:uniforms.uMaterial,model:uniforms.uModel.slice()});
  if(uniforms.uMaterial===2)return; // The floor deliberately extends beyond the frame.
  for(let j=0;j<positions.length;j+=3){const world=transform(uniforms.uModel,[positions[j],positions[j+1],positions[j+2],1]),clip=transform(uniforms.uViewProjection,world);finite(clip);assert(clip[3]>0);assert(Math.abs(clip[0]/clip[3])<=1.001,'horizontal clipping');assert(Math.abs(clip[1]/clip[3])<=1.001,'vertical clipping');}
 },
 deleteBuffer:dispose,deleteShader:dispose,deleteProgram:dispose,deleteTexture:dispose,
 getExtension:()=>({loseContext(){}})
},{get:(target,key)=>key in target?target[key]:(()=>{})});
const canvas={width:0,height:0,getContext:()=>gl,getBoundingClientRect:()=>rect,addEventListener:(type,fn)=>events.set(type,fn),removeEventListener:type=>events.delete(type)};
globalThis.devicePixelRatio=3;let lost=0;
const renderer=createRoomRenderer(canvas,{onLost:()=>lost++});assert(renderer);assert.equal(storage.size,10);
function render(p,dark){frames.length=0;renderer.render(p,dark);assert.equal(frames.length,5);assert.equal(uniforms.uDark,Number(dark));assert(canvas.width*canvas.height<=1102000);return JSON.stringify(frames);}
const start=render(0,false),middle=render(.5,false),end=render(1,false);assert.notEqual(start,middle);assert.notEqual(middle,end);assert.equal(render(0,false),start,'native reverse scroll restores geometry');
for(const viewport of [{width:320,height:400},{width:360,height:480},{width:390,height:620},{width:768,height:850},{width:844,height:250},{width:1440,height:900}]){
 rect=viewport;for(const p of [0,.2,.43,.54,.78,1])for(const dark of [false,true])render(p,dark);
}
assert.equal(copies,draws/5*3);assert(textureAllocations>0);
events.get('webglcontextlost')({preventDefault(){}});assert.equal(lost,1);renderer.dispose();assert.equal(events.size,0);assert.deepEqual(deleted,created);renderer.dispose();const before=draws;renderer.render(.5,false);assert.equal(draws,before);assert.equal(createRoomRenderer({getContext:()=>null}),null);
const css=await readFile('public/style.css','utf8'),demoCss=await readFile('public/info-demo.css','utf8'),html=await readFile('public/index.html','utf8');
assert(!html.includes('<footer'));assert(html.includes('id="info-button"'));assert(html.includes('name="color-scheme" content="light dark"'));assert.equal((html.match(/name="theme-color"/g)||[]).length,2);assert(!html.includes('src="/info-'));assert(demoCss.includes("[data-reduced='true']"));assert(demoCss.includes('prefers-color-scheme: dark'));
const parse=s=>Object.fromEntries([...s.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{3,8})\s*;/gi)].map(m=>[m[1],m[2]]));
const base=parse(css.slice(0,css.indexOf('@media (prefers-color-scheme: dark)'))),dark=parse(css.slice(css.indexOf('@media (prefers-color-scheme: dark)')));
const luminance=hex=>{let s=hex.slice(1);if(s.length===3)s=[...s].map(c=>c+c).join('');return [0,1,2].map(i=>parseInt(s.slice(i*2,i*2+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);};const contrast=(a,b)=>{const [hi,lo]=[luminance(a),luminance(b)].sort((a,b)=>b-a);return(hi+.05)/(lo+.05);};
for(const theme of [base,{...base,...dark}]){assert(contrast(theme['--ink'],theme['--paper'])>=4.5);assert(contrast(theme['--muted'],theme['--paper'])>=4.5);assert(contrast(theme['--button-ink'],theme['--button-fill'])>=4.5);}assert.notEqual(base['--paper'],dark['--paper']);
console.log('PASS: actual glass geometry, reversible scroll poses, finite matrices, unclipped narrow/landscape views, light/dark parameters, texture/buffer cleanup, contrast and fallbacks with test doubles. Not GPU or visual browser verification.');
