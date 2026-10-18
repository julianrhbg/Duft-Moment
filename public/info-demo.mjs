import {el,btn} from './ui.mjs';
let stylesheet;
function loadStyles(){
 if(!stylesheet)stylesheet=new Promise((resolve,reject)=>{
  const link=el('link',{rel:'stylesheet',href:'/info-demo.css',onload:resolve,onerror:()=>{link.remove();stylesheet=null;reject(Error('Stylesheet nicht erreichbar'));}});document.head.append(link);
 });
 return stylesheet;
}
const clamp=n=>Math.min(1,Math.max(0,n));
export function createExperience({onClose,onSources,reduced=false}){
 const events=new AbortController();
 const lowPower=(navigator.deviceMemory>0&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=2);
 reduced=reduced||lowPower;
 const labels=['Tätigkeit','Duftcharakter','Intensität','Eine Mischung'];
 const label=el('p',{class:'demo-label'},'Tätigkeit');
 const stage=el('div',{class:'demo-stage','data-renderer':'static'},
  el('div',{class:'quiet-room','aria-hidden':'true'},el('div',{class:'room-model'},el('div',{class:'room-plane back'}),el('div',{class:'room-plane side'}),el('div',{class:'room-plane floor'}))),label);
 const track=el('div',{class:'demo-track'},stage);
 const dialog=el('dialog',{class:'info-experience','aria-label':'Info','data-reduced':reduced},
  el('header',{class:'info-topbar'},el('h1',{},'Info'),el('div',{class:'info-top-actions'},
   btn('Anwendung & Quellen',onSources,'source-shortcut'),btn('×',onClose,'icon-button',{'aria-label':'Info schließen'}))),
  el('p',{class:'demo-description'},'Drei Flächen entfalten sich zu einem offenen Raum. Sie begleiten die drei Entscheidungen Tätigkeit, Duftcharakter und Intensität bis zur Duftmischung.'),track);
 let renderer=null,disposed=false,visible=false,qualityReduced=reduced,raf=0,lastLabel=-1,loadVersion=0,staticMode=false;
 const theme=matchMedia('(prefers-color-scheme: dark)');
 const progress=()=>(qualityReduced||staticMode)?1:clamp(dialog.scrollTop/Math.max(1,track.offsetHeight-stage.clientHeight));
 function draw(){
  raf=0;if(disposed||!visible||document.hidden)return;
  const p=progress();const idx=(qualityReduced||staticMode)?3:Math.min(3,Math.floor(p*3.99));
  if(idx!==lastLabel){label.textContent=labels[idx];lastLabel=idx;}
  renderer?.render(p,theme.matches);stage.dataset.progress=p.toFixed(3);
 }
 function schedule(){if(!raf&&visible&&!document.hidden&&!disposed)raf=requestAnimationFrame(draw);}
 function release(){loadVersion++;renderer?.dispose();renderer=null;stage.querySelector('canvas')?.remove();stage.dataset.renderer='static';}
 async function setupRenderer(){
  const version=++loadVersion;staticMode=false;dialog.dataset.fallback='false';
  if(qualityReduced){label.textContent='Eine Mischung';schedule();return;}
  try{
   const {createRoomRenderer}=await import('./info-room.mjs');
   if(disposed||version!==loadVersion||!visible)return;
   const canvas=el('canvas',{'aria-hidden':'true'});stage.prepend(canvas);
   renderer=createRoomRenderer(canvas,{onLost:()=>{release();staticMode=true;dialog.dataset.fallback='true';lastLabel=-1;schedule();}});
   if(!renderer){canvas.remove();staticMode=true;dialog.dataset.fallback='true';stage.dataset.renderer='static';}else stage.dataset.renderer='webgl';
   schedule();
  }catch{staticMode=true;dialog.dataset.fallback='true';stage.dataset.renderer='static';schedule();}
 }
 dialog.addEventListener('cancel',e=>{e.preventDefault();onClose();},{signal:events.signal});
 dialog.addEventListener('scroll',schedule,{passive:true,signal:events.signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else schedule();},{signal:events.signal});
 theme.addEventListener('change',schedule,{signal:events.signal});
 const resize=new ResizeObserver(schedule);resize.observe(stage);
 return {
  dialog,
  get isOpen(){return dialog.open;},
  async open(){
   await loadStyles();if(disposed)return;
   document.body.append(dialog);visible=true;dialog.showModal();schedule();setupRenderer();
  },
  setReduced(value){
   value=value||lowPower;if(value===qualityReduced)return;qualityReduced=value;dialog.dataset.reduced=String(value);release();lastLabel=-1;setupRenderer();schedule();
  },
  dispose(){disposed=true;visible=false;cancelAnimationFrame(raf);raf=0;events.abort();resize.disconnect();release();if(dialog.open)dialog.close();dialog.remove();}
 };
}
