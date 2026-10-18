// A single composition of three swept glass ribbons. Geometry and light are local.
const PI=Math.PI,TAU=PI*2;
const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t);};
const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function multiply(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r;}
function transform(position,rx=0,ry=0,rz=0){
 const x=identity(),y=identity(),z=identity(),t=identity();const cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz);
 x[5]=cx;x[6]=sx;x[9]=-sx;x[10]=cx;y[0]=cy;y[2]=-sy;y[8]=sy;y[10]=cy;z[0]=cz;z[1]=sz;z[4]=-sz;z[5]=cz;
 t[12]=position[0];t[13]=position[1];t[14]=position[2];return multiply(t,multiply(y,multiply(x,z)));
}
function perspective(aspect){const f=1/Math.tan(31*PI/360),near=.1,far=70;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
function viewMatrix(eye,target){const z=norm(eye.map((v,i)=>v-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function meshBuilder(){const positions=[],normals=[];return{triangle(a,b,c,na,nb,nc){positions.push(...a,...b,...c);normals.push(...na,...nb,...nc);},get mesh(){return{positions:new Float32Array(positions),normals:new Float32Array(normals),count:positions.length/3};}};}
// A rounded rectangular cross-section follows a non-planar elliptical loop.
// The three profiles share a silhouette; opening their offsets exposes each note.
function ribbonGeometry(index){
 const builder=meshBuilder(),steps=160,around=24;
 const point=(u,v)=>{
  const theta=u*TAU,phase=index*.18,r=1.30+index*.10;
  const radial=norm([Math.cos(theta),Math.sin(theta)*.84,0]);
  const twist=.80*Math.sin(theta+.4)+.36*Math.sin(theta*3);
  const width=.14+.085*Math.sin(theta+.7)**2;
  const ca=Math.cos(v),sa=Math.sin(v),a=Math.sign(ca)*Math.abs(ca)**.64*width,b=Math.sign(sa)*Math.abs(sa)**.64*.044;
  const along=a*Math.cos(twist)-b*Math.sin(twist),depth=a*Math.sin(twist)+b*Math.cos(twist);
  return[(r+.10*Math.sin(3*theta+phase))*Math.cos(theta)+radial[0]*along,(r*1.14+.10*Math.cos(2*theta))*Math.sin(theta)+radial[1]*along,.46*Math.sin(theta*2+.55)+.10*Math.cos(3*theta+phase)+depth+index*.045];
 };
 const ring=(u,j)=>{
  const v=j/around*TAU,p=point(u,v),beforeU=point(u-.00001,v),beforeV=point(u,v-.00001),du=point(u+.00001,v).map((n,i)=>n-beforeU[i]),dv=point(u,v+.00001).map((n,i)=>n-beforeV[i]);
  return{p,n:norm(cross(dv,du))};
 };
 for(let i=0;i<steps;i++)for(let j=0;j<around;j++){
  const a=ring(i/steps,j),b=ring((i+1)/steps,j),c=ring(i/steps,j+1),d=ring((i+1)/steps,j+1);
  builder.triangle(a.p,b.p,c.p,a.n,b.n,c.n);builder.triangle(b.p,d.p,c.p,b.n,d.n,c.n);
 }
 return builder.mesh;
}
function discGeometry(){
 const b=meshBuilder(),steps=128,r=1.85,y=-1.86,h=.07;
 for(let i=0;i<steps;i++){
  const a=i/steps*TAU,c=(i+1)/steps*TAU,pa=[Math.cos(a)*r,y,Math.sin(a)*r],pc=[Math.cos(c)*r,y,Math.sin(c)*r],qa=[pa[0],y-h,pa[2]],qc=[pc[0],y-h,pc[2]],na=[Math.cos(a),0,Math.sin(a)],nc=[Math.cos(c),0,Math.sin(c)];
  b.triangle([0,y,0],pc,pa,[0,1,0],[0,1,0],[0,1,0]);b.triangle(pa,pc,qa,na,nc,na);b.triangle(pc,qc,qa,nc,nc,na);
 }
 return b.mesh;
}
function floorGeometry(){const b=meshBuilder(),n=[0,1,0];b.triangle([-30,-1.94,-30],[30,-1.94,-30],[-30,-1.94,30],n,n,n);b.triangle([30,-1.94,-30],[30,-1.94,30],[-30,-1.94,30],n,n,n);return b.mesh;}
const vertex=`
attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uModel;uniform mat4 uViewProjection;
varying vec3 vPosition;varying vec3 vNormal;
void main(){vec4 world=uModel*vec4(aPosition,1.);vPosition=world.xyz;vNormal=mat3(uModel)*aNormal;gl_Position=uViewProjection*world;}`;
const fragment=`
precision mediump float;
varying vec3 vPosition;varying vec3 vNormal;
uniform vec3 uColor;uniform vec3 uEye;uniform float uDark;uniform float uMaterial;uniform vec2 uResolution;uniform sampler2D uBehind;
vec3 studio(vec3 r){
 float window=pow(max(0.,dot(r,normalize(vec3(-.7,1.4,1.8)))),12.);
 float strip=pow(max(0.,1.-abs(dot(r,normalize(vec3(.9,.12,.25))))),38.);
 float warm=pow(max(0.,dot(r,normalize(vec3(2.,.8,-.8)))),22.);
 vec3 base=mix(vec3(.40,.37,.30),vec3(.23,.27,.22),uDark);
 return base+mix(vec3(1.45,1.38,1.2),vec3(.60,.68,.58),uDark)*window+vec3(1.3,1.26,1.10)*strip*.65+vec3(.6,.32,.12)*warm;
}
void main(){
 vec3 N=normalize(vNormal),V=normalize(uEye-vPosition);if(dot(N,V)<0.)N=-N;
 vec3 L=normalize(vec3(-3.,6.,4.)),H=normalize(L+V);float diffuse=max(dot(N,L),0.);
 if(uMaterial>.5){
  vec3 paper=mix(vec3(.945098,.933333,.905882),vec3(.066667,.082353,.070588),uDark);
  float shadow=exp(-dot(vPosition.xz, vPosition.xz)*.20)*.13;
  if(uMaterial>1.5){
   vec2 uv=gl_FragCoord.xy/uResolution;
   float fade=smoothstep(0.,.20,uv.x)*smoothstep(0.,.20,1.-uv.x)*smoothstep(0.,.14,uv.y)*smoothstep(0.,.3,1.-uv.y);
   gl_FragColor=vec4(paper*(1.-shadow*1.4*fade),1.);return;
  }
  float occlusion=exp(-vPosition.z*vPosition.z*3.)*exp(-vPosition.x*vPosition.x*.45)*.11;
  float grain=(fract(sin(dot(vPosition.xz,vec2(127.1,311.7)))*43758.5)-.5)*.008;
  vec3 stone=mix(vec3(.80,.785,.75),vec3(.145,.16,.139),uDark);float edge=pow(1.-max(dot(N,V),0.),4.);
  gl_FragColor=vec4(stone*(.60+.40*diffuse-occlusion)+edge*.035+grain,1.);return;
 }
 float ndv=max(.001,dot(N,V)),fresnel=.075+.925*pow(1.-ndv,4.);
 vec3 reflected=studio(reflect(-V,N));
 float thickness=.12+.65*pow(1.-ndv,1.5);
 vec3 absorption=exp(-(vec3(1.)-uColor)*thickness*4.0);
 vec2 uv=gl_FragCoord.xy/uResolution;
 vec2 offset=N.xy*(.018+.012*(1.-ndv));
 vec3 transmitted=texture2D(uBehind,clamp(uv+offset,vec2(.001),vec2(.999))).rgb*absorption;
 transmitted+=uColor*(.17+.25*diffuse)*uDark;
 float caustic=pow(max(0.,dot(reflect(-L,N),V)),85.);
 vec3 color=mix(transmitted,reflected,fresnel*.88);
 color+=vec3(1.,.94,.77)*caustic*mix(.70,.36,uDark);
 float edgeLight=pow(max(0.,dot(N,normalize(vec3(3.,1.,-2.)))),42.)*.15;
 color+=edgeLight;
 gl_FragColor=vec4(color,1.);
}`;
export function createRoomRenderer(canvas,{onLost}={}){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});if(!gl)return null;
 let disposed=false,vs,fs,program,textureWidth=0,textureHeight=0;const buffers=[];
 const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw Error('Shader nicht verfügbar');}return s;};
 try{vs=shader(gl.VERTEX_SHADER,vertex);fs=shader(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Grafik nicht verfügbar');}
 catch{if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);if(program)gl.deleteProgram(program);return null;}
 gl.useProgram(program);
 const attributes=['aPosition','aNormal'].map(n=>gl.getAttribLocation(program,n));
 function upload(mesh){
  const handles=[mesh.positions,mesh.normals].map(data=>{const b=gl.createBuffer();buffers.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return b;});
  return{...mesh,handles};
 }
 const meshes=[...Array.from({length:3},(_,i)=>upload(ribbonGeometry(i))),upload(discGeometry()),upload(floorGeometry())];
 const behind=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,behind);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const uniforms=Object.fromEntries(['uModel','uViewProjection','uColor','uEye','uDark','uMaterial','uResolution','uBehind'].map(n=>[n,gl.getUniformLocation(program,n)]));
 gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
 const lost=e=>{if(disposed)return;e.preventDefault();onLost?.();};canvas.addEventListener('webglcontextlost',lost);
 return{
  render(p,dark){
   if(disposed||gl.isContextLost())return;
   const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);let w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));const scale=Math.min(1,Math.sqrt(1100000/(w*h)));w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.bindTexture(gl.TEXTURE_2D,behind);if(textureWidth!==w||textureHeight!==h){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);textureWidth=w;textureHeight=h;}gl.viewport(0,0,w,h);gl.clearColor(...(dark?[17/255,21/255,18/255,1]:[241/255,238/255,231/255,1]));gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   const opening=ease(p/.43),closing=ease((p-.54)/.46),spread=opening*(1-closing);
   const turn=mix(-.36,.48,ease(p)),tilt=mix(.10,-.12,closing);
   const models=Array.from({length:3},(_,i)=>transform([(i-1)*.91*spread,.26*spread*(i===1?1:-.2),(i-1)*.72*spread],tilt,turn+(i-1)*mix(.38,.95,closing)+(i-1)*.48*spread,(i-1)*.20*spread));
   const target=[0,-.06,0],direction=[.08,1.1,7.8];let distance=8.8;
   // Frame the actual ribbon vertices in every pose, including narrow viewports.
   const basis=viewMatrix(direction,target),tangent=Math.tan(31*PI/360);
   for(let i=0;i<4;i++){
    const m=models[i]||identity(),v=meshes[i].positions;
    for(let j=0;j<v.length;j+=12){const x=v[j],y=v[j+1],z=v[j+2],d=[m[0]*x+m[4]*y+m[8]*z+m[12]-target[0],m[1]*x+m[5]*y+m[9]*z+m[13]-target[1],m[2]*x+m[6]*y+m[10]*z+m[14]-target[2]];
     const horizontal=basis[0]*d[0]+basis[4]*d[1]+basis[8]*d[2],vertical=basis[1]*d[0]+basis[5]*d[1]+basis[9]*d[2],depth=basis[2]*d[0]+basis[6]*d[1]+basis[10]*d[2];
     distance=Math.max(distance,depth+Math.abs(horizontal)/(tangent*(w/h)*.83),depth+Math.abs(vertical)/(tangent*.78));
    }
   }
   const axis=norm(direction.map((v,i)=>v-target[i])),eye=target.map((v,i)=>v+axis[i]*distance);
   const vp=multiply(perspective(w/h),viewMatrix(eye,target));gl.uniformMatrix4fv(uniforms.uViewProjection,false,vp);gl.uniform3fv(uniforms.uEye,eye);gl.uniform1f(uniforms.uDark,dark?1:0);gl.uniform2f(uniforms.uResolution,w,h);gl.uniform1i(uniforms.uBehind,0);
   function draw(mesh,model,material,color){
    mesh.handles.forEach((b,i)=>{gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(attributes[i]);gl.vertexAttribPointer(attributes[i],3,gl.FLOAT,false,0,0);});
    gl.uniformMatrix4fv(uniforms.uModel,false,model);gl.uniform1f(uniforms.uMaterial,material);gl.uniform3fv(uniforms.uColor,color);gl.drawArrays(gl.TRIANGLES,0,mesh.count);
   }
   draw(meshes[4],identity(),2,[1,1,1]);draw(meshes[3],identity(),1,[1,1,1]);
   const colors=[[.48,.72,.53],[.94,.63,.17],[.80,.84,.74]];
   const order=[0,1,2].sort((a,b)=>models[a][14]-models[b][14]);
   for(const i of order){gl.bindTexture(gl.TEXTURE_2D,behind);gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,w,h);draw(meshes[i],models[i],0,colors[i]);}
  },
  dispose(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextlost',lost);for(const b of buffers)gl.deleteBuffer(b);buffers.length=0;gl.deleteTexture(behind);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);gl.getExtension('WEBGL_lose_context')?.loseContext();}
 };
}
