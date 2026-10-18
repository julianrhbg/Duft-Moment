import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,createHash,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {mkdirSync,readFileSync,writeFileSync,existsSync,statSync,createReadStream,chmodSync,unlinkSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defaults,sources} from './catalog.mjs';
import {validateConfig} from './validate.mjs';
const scrypt=promisify(scryptCallback);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const digest=s=>createHash('sha256').update(s).digest('hex');
const random=()=>randomBytes(32).toString('base64url');
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.mp4':'video/mp4','.png':'image/png','.webp':'image/webp'};
export function createApp({dataDir=process.env.DATA_DIR||path.join(root,'.data'),origin=process.env.APP_ORIGIN||'',sessionMs=8*60*60*1000,now=()=>Date.now(),secureCookies=origin.startsWith('https:')}={}){
 if(process.env.NODE_ENV==='production'&&!origin.startsWith('https://'))throw Error('Für den Produktivbetrieb ist APP_ORIGIN mit HTTPS erforderlich.');
 mkdirSync(dataDir,{recursive:true,mode:0o700});
 const db=new DatabaseSync(path.join(dataDir,'state.sqlite'));db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 db.exec(`CREATE TABLE IF NOT EXISTS content(id INTEGER PRIMARY KEY CHECK(id=1),version INTEGER NOT NULL,json TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS account(id INTEGER PRIMARY KEY CHECK(id=1),salt TEXT NOT NULL,hash TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY,failures INTEGER NOT NULL,until INTEGER NOT NULL);`);
 chmodSync(path.join(dataDir,'state.sqlite'),0o600);
 db.prepare('INSERT OR IGNORE INTO content VALUES(1,1,?)').run(JSON.stringify(validateConfig(defaults)));
 const tokenPath=path.join(dataDir,'setup-token');
 if(!db.prepare('SELECT id FROM account').get()){
  let token;if(existsSync(tokenPath))token=readFileSync(tokenPath,'utf8').trim();else{token=random();writeFileSync(tokenPath,token+'\n',{mode:0o600,flag:'wx'});}
  db.prepare('INSERT OR REPLACE INTO meta VALUES(?,?)').run('setupHash',digest(token));
 }else if(existsSync(tokenPath))unlinkSync(tokenPath);
 function current(){const row=db.prepare('SELECT * FROM content WHERE id=1').get();return {version:row.version,config:JSON.parse(row.json)};}
 function send(res,status,obj,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(obj));}
 function auth(req){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('dz_session='))?.slice(11);if(!token||token.length>100)return false;return !!db.prepare('SELECT hash FROM sessions WHERE hash=? AND expires>?').get(digest(token),now());}
 function cookie(res,token,maxAge=sessionMs/1000){res.setHeader('Set-Cookie',`dz_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(maxAge)}${secureCookies?'; Secure':''}`);}
 function makeSession(res){const token=random();db.prepare('DELETE FROM sessions WHERE expires<=?').run(now());db.prepare('INSERT INTO sessions VALUES(?,?)').run(digest(token),now()+sessionMs);cookie(res,token);}
 function limited(key){db.prepare('DELETE FROM attempts WHERE until<=?').run(now());const row=db.prepare('SELECT * FROM attempts WHERE key=?').get(key);return !!row&&row.failures>=8;}
 function fail(key){db.prepare('INSERT INTO attempts VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET failures=failures+1').run(key,now()+15*60*1000);}
 async function json(req){if(!(req.headers['content-type']||'').startsWith('application/json'))throw Object.assign(Error('Bitte JSON senden.'),{status:415});let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>512000)throw Object.assign(Error('Die Datei ist zu groß.'),{status:413});chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString());}catch{throw Object.assign(Error('Ungültiges JSON.'),{status:400});}}
 function write(res,input,version){let clean;try{clean=validateConfig(input);}catch(error){return send(res,400,{error:error.message});}if(!Number.isInteger(version))return send(res,400,{error:'Die Versionsnummer fehlt.'});const row=db.prepare('UPDATE content SET json=?,version=version+1 WHERE id=1 AND version=?').run(JSON.stringify(clean),version);if(!row.changes)return send(res,409,{error:'Die Einstellungen wurden inzwischen geändert. Lade sie neu, bevor du erneut speicherst.'});send(res,200,current());}
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; font-src 'self'; media-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  if(secureCookies)res.setHeader('Strict-Transport-Security','max-age=31536000');
  try{
   const url=new URL(req.url,'http://localhost');const pathname=url.pathname;
   if(pathname.startsWith('/api/')){
    if(!['GET','POST','PUT'].includes(req.method))return send(res,405,{error:'Diese Methode ist nicht erlaubt.'});
    const configured=origin||`http://${req.headers.host}`;
    if(req.method!=='GET'&&req.headers.origin!==configured)return send(res,403,{error:'Diese Anfrage stammt nicht von dieser Webseite.'});
    if(req.method==='GET'&&pathname==='/api/config'){
     const data=current();const etag=`"${data.version}"`;if(req.headers['if-none-match']===etag){res.writeHead(304,{'ETag':etag,'Cache-Control':'no-cache'});return res.end();}return send(res,200,{...data,sources},{'ETag':etag,'Cache-Control':'no-cache'});
    }
    if(req.method==='GET'&&pathname==='/api/session')return send(res,200,{authenticated:auth(req),setupRequired:!db.prepare('SELECT id FROM account').get()});
    if(req.method==='POST'&&(pathname==='/api/login'||pathname==='/api/setup')){
     const key=req.socket.remoteAddress||'local';if(limited(key))return send(res,429,{error:'Zu viele Versuche. Bitte warte 15 Minuten.'},{'Retry-After':'900'});
     const body=await json(req);
     if(typeof body.password!=='string'||body.password.length>256){fail(key);return send(res,400,{error:'Bitte ein gültiges Passwort eingeben.'});}
     if(pathname==='/api/setup'){
      if(db.prepare('SELECT id FROM account').get())return send(res,409,{error:'Die Ersteinrichtung ist bereits abgeschlossen.'});
      const setup=db.prepare('SELECT value FROM meta WHERE key=?').get('setupHash')?.value;
      if(typeof body.token!=='string'||!equal(digest(body.token),setup)){fail(key);return send(res,403,{error:'Der Einrichtungsschlüssel ist ungültig.'});}
      if(body.password.length<12||/^\d{1,11}$/.test(body.password)||new Set(body.password).size<5)return send(res,400,{error:'Wähle mindestens 12 Zeichen und mindestens 5 unterschiedliche Zeichen.'});
      const salt=randomBytes(16).toString('hex');const hash=(await scrypt(body.password,salt,64)).toString('hex');
      // Unique account key also protects concurrent setup requests across await.
      try{db.prepare('INSERT INTO account VALUES(1,?,?)').run(salt,hash);}catch{return send(res,409,{error:'Die Ersteinrichtung ist bereits abgeschlossen.'});}
      db.prepare('DELETE FROM meta WHERE key=?').run('setupHash');if(existsSync(tokenPath))unlinkSync(tokenPath);
     }else{
      const account=db.prepare('SELECT * FROM account WHERE id=1').get();
      const actual=(await scrypt(body.password,account?.salt||'no-account-salt',64)).toString('hex');
      if(!account||!equal(actual,account.hash)){fail(key);return send(res,401,{error:'Die Anmeldung ist fehlgeschlagen.'});}
     }
     db.prepare('DELETE FROM attempts WHERE key=?').run(key);makeSession(res);return send(res,200,{ok:true});
    }
    if(!auth(req))return send(res,401,{error:'Bitte melde dich in der Verwaltung an.'});
    if(req.method==='POST'&&pathname==='/api/logout'){
     const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('dz_session='))?.slice(11);if(token)db.prepare('DELETE FROM sessions WHERE hash=?').run(digest(token));cookie(res,'',0);return send(res,200,{ok:true});
    }
    if(req.method==='GET'&&(pathname==='/api/admin'||pathname==='/api/export'))return send(res,200,{...current(),schemaVersion:1},pathname==='/api/export'?{'Content-Disposition':'attachment; filename="dazwischen-einstellungen.json"'}:{});
    if(req.method==='PUT'&&pathname==='/api/admin'){const body=await json(req);return write(res,body.config,body.version);}
    if(req.method==='POST'&&pathname==='/api/reset'){const body=await json(req);return write(res,defaults,body.version);}
    return send(res,404,{error:'Nicht gefunden.'});
   }
   if(!['GET','HEAD'].includes(req.method))return send(res,405,{error:'Diese Methode ist nicht erlaubt.'});
   let decoded;try{decoded=decodeURIComponent(pathname);}catch{return send(res,400,{error:'Ungültige Adresse.'});}
   const file=path.resolve(root,'public',decoded==='/'?'index.html':'.'+decoded);
   if(!file.startsWith(path.join(root,'public')+path.sep)||!existsSync(file)||!statSync(file).isFile())return send(res,404,{error:'Diese Seite wurde nicht gefunden.'});
   const stat=statSync(file);res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control',pathname.startsWith('/assets/')?'public, max-age=3600':'no-cache');res.setHeader('Accept-Ranges','bytes');
   let start=0,end=stat.size-1,status=200;
   if(req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!match||(match[1]===''&&match[2]==='')){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
    if(match[1]===''){const length=Number(match[2]);start=Math.max(0,stat.size-length);}else start=Number(match[1]);
    end=match[1]!==''&&match[2]!==''?Math.min(Number(match[2]),stat.size-1):stat.size-1;
    if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);}
   res.setHeader('Content-Length',end-start+1);res.writeHead(status);if(req.method==='HEAD')return res.end();createReadStream(file,{start,end}).pipe(res);
  }catch(error){if(res.headersSent){res.destroy();return;}send(res,error.status||((error instanceof SyntaxError||error.message?.includes('ungültig'))?400:500),{error:error.status?error.message:'Die Anfrage konnte nicht verarbeitet werden. Bitte prüfe deine Eingaben und versuche es erneut.'});}
 });
 server.once('close',()=>db.close());return {server,current,db,tokenPath};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const app=createApp();const host=process.env.HOST||'127.0.0.1';const port=Number(process.env.PORT||3000);
 app.server.listen(port,host,()=>console.log(`DAZWISCHEN läuft auf Port ${port}. Datenordner: ${process.env.DATA_DIR||path.join(root,'.data')}.`));
 for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>app.server.close(()=>process.exit(0)));
}
