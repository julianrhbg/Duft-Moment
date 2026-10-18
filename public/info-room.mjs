// Three bevelled panels, one scroll-controlled transformation. No textures or dependencies.
const PI=Math.PI;
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t);};
const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function multiply(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r;}
function transform(position,rx=0,ry=0){const cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry);const x=identity(),y=identity(),t=identity();x[5]=cx;x[6]=sx;x[9]=-sx;x[10]=cx;y[0]=cy;y[2]=-sy;y[8]=sy;y[10]=cy;t[12]=position[0];t[13]=position[1];t[14]=position[2];return multiply(t,multiply(y,x));}
function perspective(aspect){const f=1/Math.tan(35*PI/360),near=.1,far=40;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
function viewMatrix(eye,target){
 const norm=a=>{const n=Math.hypot(...a);return a.map(v=>v/n);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 const z=norm(eye.map((v,i)=>v-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);
 return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
}
function panelGeometry(){
 const positions=[],normals=[];
 const triangle=(a,b,c,na,nb,nc)=>{positions.push(...a,...b,...c);normals.push(...na,...nb,...nc);};
 // Rounded rectangle boundary travels counterclockwise from the top-right corner.
 function boundary(inset,z,sign,bevel){
  const pts=[],h=1.25-inset,r=.14-inset;
  for(let c=0;c<4;c++)for(let j=0;j<=8;j++){
   const angle=(c*90+j*90/8)*PI/180;
   const centers=[[h-r,h-r],[-h+r,h-r],[-h+r,-h+r],[h-r,-h+r]];
   const nx=Math.cos(angle),ny=Math.sin(angle);
   pts.push({p:[centers[c][0]+nx*r,centers[c][1]+ny*r,z],n:[nx*Math.sin(bevel),ny*Math.sin(bevel),sign*Math.cos(bevel)]});
  }return pts;
 }
 const depth=.05,edge=.025;
 for(const sign of [1,-1]){
  const rings=[];
  for(let k=0;k<=3;k++){const a=k/3*PI/2;rings.push(boundary(edge*(1-Math.sin(a)),sign*(depth-edge+edge*Math.cos(a)),sign,a));}
  const front=rings[0];for(let i=0;i<front.length;i++){const a=front[i],b=front[(i+1)%front.length];triangle([0,0,sign*depth],a.p,b.p,[0,0,sign],a.n,b.n);}
  for(let k=0;k<rings.length-1;k++)for(let i=0;i<front.length;i++){
   const j=(i+1)%front.length,a=rings[k][i],b=rings[k][j],c=rings[k+1][i],d=rings[k+1][j];triangle(a.p,b.p,c.p,a.n,b.n,c.n);triangle(b.p,d.p,c.p,b.n,d.n,c.n);
  }
 }
 // A thin, solid side joins the bevels.
 const a=boundary(0,depth-edge,1,PI/2),b=boundary(0,-depth+edge,-1,PI/2);
 for(let i=0;i<a.length;i++){const j=(i+1)%a.length;triangle(a[i].p,b[i].p,a[j].p,a[i].n,b[i].n,a[j].n);triangle(a[j].p,b[i].p,b[j].p,a[j].n,b[i].n,b[j].n);}
 return {positions:new Float32Array(positions),normals:new Float32Array(normals),count:positions.length/3};
}
const vertex=`
attribute vec3 aPosition; attribute vec3 aNormal;
uniform mat4 uModel; uniform mat4 uViewProjection;
varying vec3 vPosition; varying vec3 vNormal; varying vec3 vLocal;
void main(){vec4 world=uModel*vec4(aPosition,1.);vPosition=world.xyz;vNormal=mat3(uModel)*aNormal;vLocal=aPosition;gl_Position=uViewProjection*world;}`;
const fragment=`
precision mediump float;
varying vec3 vPosition;varying vec3 vNormal;varying vec3 vLocal;
uniform vec3 uColor;uniform vec3 uEye;uniform float uDark;uniform float uPanel;uniform float uProgress;uniform float uShadow;
void main(){
 if(uShadow>.5){float edge=max(0.,1.-length(vLocal.xy)/1.24);float a=edge*edge*mix(.22,.48,uDark);gl_FragColor=vec4(vec3(.10,.12,.09),a);return;}
 vec3 N=normalize(vNormal);vec3 V=normalize(uEye-vPosition);if(dot(N,V)<0.)N=-N;
 vec3 L=normalize(vec3(-2.5,5.,4.));vec3 H=normalize(L+V);
 float diffuse=max(dot(N,L),0.);float spec=pow(max(dot(N,H),0.),55.);
 float fresnel=pow(1.-max(dot(N,V),0.),4.);
 float grain=(fract(sin(dot(vLocal.xy,vec2(127.1,311.7)))*43758.5)-.5)*.012;
 float occlusion=1.-.13*exp(-abs(vPosition.y+1.25)*4.)*smoothstep(.45,1.,uProgress);
 vec3 color=uColor*(.48+.52*diffuse)*occlusion+vec3(.88,.86,.77)*spec*.19+fresnel*.035+grain;
 if(uPanel>1.5){float pool=exp(-dot(vLocal.xy-vec2(-.2,.15),vLocal.xy-vec2(-.2,.15))*1.1);color+=vec3(.10,.07,.035)*pool*smoothstep(.45,1.,uProgress);}
 color*=mix(1.,.73,uDark);gl_FragColor=vec4(color,1.);
}`;
export function createRoomRenderer(canvas,{onLost}={}){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});if(!gl)return null;
 let disposed=false;
 const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw Error('Shader nicht verfügbar');}return s;};
 let vs,fs,program,buffers=[];
 try{vs=shader(gl.VERTEX_SHADER,vertex);fs=shader(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Grafik nicht verfügbar');}
 catch{if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);if(program)gl.deleteProgram(program);return null;}
 const mesh=panelGeometry();gl.useProgram(program);
 function attribute(name,data){const b=gl.createBuffer();buffers.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0);}
 attribute('aPosition',mesh.positions);attribute('aNormal',mesh.normals);
 const uniforms=Object.fromEntries(['uModel','uViewProjection','uColor','uEye','uDark','uPanel','uProgress','uShadow'].map(n=>[n,gl.getUniformLocation(program,n)]));
 gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
 const lost=e=>{if(disposed)return;e.preventDefault();onLost?.();};canvas.addEventListener('webglcontextlost',lost);
 const colorsLight=[[.76,.73,.65],[.50,.58,.46],[.72,.55,.39]],colorsDark=[[.48,.52,.43],[.33,.46,.35],[.56,.43,.30]];
 return {
  render(p,dark){
   if(disposed||gl.isContextLost())return;
   const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);
   let w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));const scale=Math.min(1,Math.sqrt(1100000/(w*h)));w=Math.round(w*scale);h=Math.round(h*scale);
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   const unfold=smooth((p-.24)/.6),spread=smooth(p/.28)*(1-smooth((p-.35)/.5));
   const poses=[
    {pos:[-.85*spread,0,mix(-.12,-1.25,unfold)],rx:0,ry:-.06*spread},
    {pos:[mix(0,-1.25,unfold)-.4*spread,.08*spread,0],rx:0,ry:unfold*PI/2+.18*spread},
    {pos:[1.05*spread,mix(0,-1.25,unfold),.12*(1-unfold)+.4*spread],rx:-unfold*PI/2,ry:-.12*spread}
   ];
   const models=poses.map(pose=>transform(pose.pos,pose.rx,pose.ry));
   let eye=[mix(4.5,3.25,unfold),mix(2.6,2.5,unfold),mix(7.2,5.5,unfold)];const target=[0,-.12,0];
   const basis=viewMatrix(eye,target),direction=eye.map((v,i)=>v-target[i]);const baseDistance=Math.hypot(...direction);
   let distance=baseDistance;const tangent=Math.tan(35*PI/360);
   // Fit the actual animated geometry, preserving margins even on narrow phones.
   for(const m of models)for(const x of [-1.25,1.25])for(const y of [-1.25,1.25])for(const z of [-.05,.05]){
    const d=[m[0]*x+m[4]*y+m[8]*z+m[12]-target[0],m[1]*x+m[5]*y+m[9]*z+m[13]-target[1],m[2]*x+m[6]*y+m[10]*z+m[14]-target[2]];
    const horizontal=basis[0]*d[0]+basis[4]*d[1]+basis[8]*d[2],vertical=basis[1]*d[0]+basis[5]*d[1]+basis[9]*d[2],depth=basis[2]*d[0]+basis[6]*d[1]+basis[10]*d[2];
    distance=Math.max(distance,depth+Math.abs(horizontal)/(tangent*(w/h)*.82),depth+Math.abs(vertical)/(tangent*.80));
   }
   eye=target.map((v,i)=>v+direction[i]/baseDistance*distance);
   const vp=multiply(perspective(w/h),viewMatrix(eye,target));
   gl.uniformMatrix4fv(uniforms.uViewProjection,false,vp);gl.uniform3fv(uniforms.uEye,eye);gl.uniform1f(uniforms.uDark,dark?1:0);gl.uniform1f(uniforms.uProgress,p);
   const colors=dark?colorsDark:colorsLight;
   const shadow=transform([.25,-1.37,.15],-PI/2,0);for(let i=0;i<3;i++){shadow[i]*=2.8;shadow[4+i]*=2.8;}
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.uniform1f(uniforms.uShadow,1);gl.uniformMatrix4fv(uniforms.uModel,false,shadow);gl.drawArrays(gl.TRIANGLES,0,mesh.count);
   gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1f(uniforms.uShadow,0);
   for(let i=0;i<3;i++){gl.uniformMatrix4fv(uniforms.uModel,false,models[i]);gl.uniform3fv(uniforms.uColor,colors[i]);gl.uniform1f(uniforms.uPanel,i);gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
  },
  dispose(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextlost',lost);for(const b of buffers)gl.deleteBuffer(b);buffers=[];gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);gl.getExtension('WEBGL_lose_context')?.loseContext();}
 };
}
