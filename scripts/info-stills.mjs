// Recreate the lightweight, motionless counterparts from the same procedural scene.
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {once} from 'node:events';
import {createApp} from '../src/server.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const dir=mkdtempSync('/tmp/dazwischen-still-'),app=createApp({dataDir:dir});
app.server.listen(0,'127.0.0.1');await once(app.server,'listening');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:620,height:700},deviceScaleFactor:1});
 await page.goto(`http://127.0.0.1:${app.server.address().port}`);
 for(const dark of [false,true]){
  const data=await page.evaluate(async dark=>{
   const {createRoomRenderer}=await import('/info-room.mjs');
   const canvas=document.createElement('canvas');canvas.style.cssText='position:fixed;inset:0;width:620px;height:700px;';document.body.append(canvas);
   const renderer=createRoomRenderer(canvas);if(!renderer)throw Error('WebGL wird zum Erzeugen der Standbilder benötigt');
   renderer.render(1,dark);const image=canvas.toDataURL('image/webp',.88);renderer.dispose();canvas.remove();return image;
  },dark);
  const file=`public/assets/info-still-${dark?'dark':'light'}.webp`,bytes=Buffer.from(data.split(',')[1],'base64');
  writeFileSync(file,bytes);console.log(`${file}: ${bytes.length} Bytes`);
 }
}finally{await browser.close();await new Promise(resolve=>app.server.close(resolve));rmSync(dir,{recursive:true,force:true});}
