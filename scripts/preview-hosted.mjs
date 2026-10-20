// Local QA only. Uses the actual built Worker with disposable memory storage.
// This Node process is never part of the published Worker artifact.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
const root=new URL('../',import.meta.url),file=new URL('worker/index.js',root);
let worker,modified=0;
class Bucket {
  data=null; revision=0;
  async get(){return this.data?{etag:String(this.revision),json:async()=>JSON.parse(this.data)}:null;}
  async put(key,data,{onlyIf}){if(onlyIf.etagMatches&&onlyIf.etagMatches!==String(this.revision)||onlyIf.etagDoesNotMatch==='*'&&this.data)return null;this.data=data;return{etag:String(++this.revision)};}
}
const env={BUCKET:new Bucket()};
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://'+req.headers.host);
  if(url.pathname==='/__qa/phone'){
   const w=Math.min(1000,Math.max(320,Number(url.searchParams.get('width'))||390)),h=Math.min(1100,Math.max(300,Number(url.searchParams.get('height'))||844));
   const scheme=url.searchParams.get('scheme')==='dark'?'dark':'light';
   const src=url.searchParams.has('intro')?`/__qa/intro?ms=${Math.min(5900,Math.max(0,Number(url.searchParams.get('intro'))||0))}`:`/?qa-scheme=${scheme}`;
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(`<!doctype html><html lang="de"><title>Mobile Vorschau</title><body style="margin:0;background:#888;display:grid;place-items:start center"><iframe title="Duft Moment · mobile Vorschau" src="${src}" style="width:${w}px;height:${h}px;border:0"></iframe></body></html>`);return;
  }
  if(url.pathname==='/__qa/intro'){
   const ms=Math.min(5900,Math.max(0,Number(url.searchParams.get('ms'))||0));
   const html=await readFile(new URL('public/index.html',root),'utf8');
   const opening=html.match(/<div id="opening"[\s\S]*?<\/div><\/div>/)[0].replace(' hidden','');
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(`<!doctype html><html lang="de"><title>Einstieg · Standbild</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/intro.css"><style>.opening,.opening-line{animation-play-state:paused;animation-delay:-${ms}ms}</style><body>${opening}</body></html>`);return;
  }
  const stamp=(await stat(file)).mtimeMs;if(!worker||stamp!==modified){worker=(await import('data:text/javascript;base64,'+Buffer.from(await readFile(file)).toString('base64'))).default;modified=stamp;}
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  const body=chunks.length?Buffer.concat(chunks):undefined;
  const response=await worker.fetch(new Request(url,{method:req.method,headers:req.headers,body}),env);
  const headers=Object.fromEntries(response.headers);let output=Buffer.from(await response.arrayBuffer());
  if(url.pathname==='/'&&url.searchParams.has('qa-scheme'))output=Buffer.from(output.toString().replace('href="/style.css"',`href="/style.css?qa-scheme=${url.searchParams.get('qa-scheme')==='dark'?'dark':'light'}"`));
  if(url.pathname==='/style.css'&&url.searchParams.has('qa-scheme'))output=Buffer.from(output.toString().replaceAll('@media (prefers-color-scheme: dark)',url.searchParams.get('qa-scheme')==='dark'?'@media all':'@media not all'));
  delete headers['content-length'];res.writeHead(response.status,headers);res.end(output);
 }catch{res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});res.end('Lokale Vorschau nicht verfügbar. Bitte zuerst npm run build ausführen.');}
});
server.listen(Number(process.env.PORT)||4173,'0.0.0.0',()=>console.log('Worker preview ready; disposable memory storage.'));
