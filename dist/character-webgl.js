import * as THREE from './vendor/three.module.js';
import { SoftwareRenderer } from './software-renderer.js';
// An independently modelled DIIGOO studio host. All geometry and motion are local.
const canvas=document.getElementById('sculpture');
if(canvas){
let renderer;try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});canvas.dataset.renderer='webgl';}catch(error){try{renderer=new SoftwareRenderer({canvas});canvas.dataset.renderer='software';}catch(fallbackError){canvas.dataset.renderer='unavailable';setTimeout(()=>window.dispatchEvent(new CustomEvent('mascot:unavailable',{detail:{reason:'context'}})),0);}}
if(renderer){
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-2.5,2.5,2.8,-2.8,.1,40);camera.position.set(0,.35,9);camera.lookAt(0,.22,0);
scene.add(new THREE.HemisphereLight(0xfff8ed,0xa8aca5,2.6));const key=new THREE.DirectionalLight(0xfff5e8,4.2);key.position.set(-3.5,5,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.normalBias=.03;key.shadow.radius=4;scene.add(key);const fill=new THREE.DirectionalLight(0xdce8ff,1.3);fill.position.set(4,1,3);scene.add(fill);const rim=new THREE.DirectionalLight(0xffddbc,2);rim.position.set(2,4,-4);scene.add(rim);
const skin=new THREE.MeshStandardMaterial({color:'#fbf3ec',roughness:.7}),hair=new THREE.MeshStandardMaterial({color:'#77573d',roughness:.85}),beard=new THREE.MeshStandardMaterial({color:'#c49c74',roughness:.94}),sweater=new THREE.MeshStandardMaterial({color:'#a4ad9b',roughness:.95}),ink=new THREE.MeshStandardMaterial({color:'#262523',roughness:.5}),glint=new THREE.MeshBasicMaterial({color:'#ffffff'}),inside=new THREE.MeshStandardMaterial({color:'#854e42',roughness:.85});const sphere=new THREE.SphereGeometry(1,renderer.isSoftware?16:40,renderer.isSoftware?12:28),capsule=new THREE.CapsuleGeometry(1,1,8,20);
function ball(parent,mat,x,y,z,sx,sy,sz){const mesh=new THREE.Mesh(sphere,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function pill(parent,mat,x,y,z,r,length,rz=0){const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(r,length,renderer.isSoftware?4:8,renderer.isSoftware?10:20),mat);mesh.position.set(x,y,z);mesh.rotation.z=rz;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function curve(parent,points,r,material){const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,32,r,8,false),material);parent.add(mesh);return mesh;}
const ditherMaterials=[skin,hair,beard,sweater,ink,glint,inside];
for(const material of ditherMaterials){material.onBeforeCompile=shader=>{shader.uniforms.uDitherScale={value:Math.min(devicePixelRatio||1,1.8)};shader.fragmentShader='uniform float uDitherScale;\nfloat orderedThreshold(vec2 p){vec2 q=mod(floor(p),4.0);float x=q.x,y=q.y;if(y<1.0)return x<1.0?0.0:x<2.0?8.0:x<3.0?2.0:10.0;if(y<2.0)return x<1.0?12.0:x<2.0?4.0:x<3.0?14.0:6.0;if(y<3.0)return x<1.0?3.0:x<2.0?11.0:x<3.0?1.0:9.0;return x<1.0?15.0:x<2.0?7.0:x<3.0?13.0:5.0;}\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\nfloat lum=dot(gl_FragColor.rgb,vec3(0.2126,0.7152,0.0722));float threshold=(orderedThreshold(gl_FragCoord.xy/uDitherScale)+0.5)/16.0;gl_FragColor.rgb=mix(vec3(0.043),vec3(0.984),step(threshold,lum));');};material.customProgramCacheKey=()=> 'diigoo-ordered-monochrome-v1';}
const root=new THREE.Group();scene.add(root);const torso=new THREE.Group();root.add(torso);ball(torso,sweater,0,-.59,0,.75,.88,.49);ball(torso,sweater,0,-1.08,.02,.64,.3,.43);const collar=new THREE.Mesh(new THREE.TorusGeometry(.245,.064,12,50),sweater);collar.rotation.x=Math.PI/2;collar.position.y=.19;torso.add(collar);ball(torso,skin,0,.25,0,.22,.27,.23);
const headPivot=new THREE.Group();headPivot.position.set(0,.36,0);root.add(headPivot);const head=new THREE.Group();headPivot.add(head);const faceSkin=ball(head,skin,0,.68,0,.72,.84,.63);faceSkin.userData.faceHead=true;const beardShell=new THREE.Mesh(new THREE.SphereGeometry(1,renderer.isSoftware?20:48,renderer.isSoftware?12:28,0,Math.PI*2,Math.PI*.55,Math.PI*.45),beard);beardShell.position.y=.68;beardShell.scale.set(.737,.86,.65);beardShell.visible=!renderer.isSoftware;head.add(beardShell);ball(head,skin,0,.39,.55,.32,.17,.10);ball(head,skin,-.72,.63,0,.135,.205,.14);ball(head,skin,.72,.63,0,.135,.205,.14);ball(head,new THREE.MeshStandardMaterial({color:'#e5bcb0',roughness:.9}),-.773,.64,.055,.052,.1,.045);ball(head,skin,0,.61,.635,.09,.115,.115);
// A broad swept hair silhouette, matching the rounded cap shape in the visual reference.
const cap=new THREE.Mesh(new THREE.SphereGeometry(1,40,24,0,Math.PI*2,0,1.38),hair);cap.position.set(0,.68,-.1);cap.scale.set(.755,.91,.67);cap.rotation.set(-.2,0,-.13);head.add(cap);
ball(head,hair,-.15,1.3,.1,.64,.34,.54);ball(head,hair,-.5,1.13,-.1,.25,.27,.45);ball(head,hair,.53,1.1,-.19,.22,.3,.42);
// Brows, eyes and a mouth that can speak and smile.
const eyes=[],brows=[];for(const side of[-1,1]){const eye=ball(head,ink,side*.235,.77,.593,.085,.14,.038);eyes.push(eye);ball(head,glint,side*.235-.025,.816,.63,.019,.028,.01);brows.push(curve(head,[[side*.235-.1,.965,.555],[side*.235,.993,.58],[side*.235+.09,.97,.555]],.032,ink));}
const smile=curve(head,[[-.19,.39,.61],[-.1,.335,.641],[0,.32,.65],[.1,.335,.641],[.19,.39,.61]],.018,ink);const speaking=ball(head,ink,0,.337,.645,.16,.09,.023);speaking.visible=false;ball(head,beard,0,.14,.46,.22,.095,.07);
const arms=[];
function arm(side){const shoulder=new THREE.Group();shoulder.position.set(side*.6,-.05,0);torso.add(shoulder);pill(shoulder,sweater,0,-.22,0,.19,.3);const elbow=new THREE.Group();elbow.position.y=-.43;shoulder.add(elbow);pill(elbow,skin,0,-.22,0,.123,.31);const wrist=new THREE.Group();wrist.position.set(0,-.49,.005);elbow.add(wrist);ball(wrist,skin,0,-.075,0,.13,.17,.09);const fingers=[];for(let i=0;i<4;i++){const finger=new THREE.Group();finger.position.set((i-1.5)*.056,-.17,.005);wrist.add(finger);pill(finger,skin,0,-.065,0,.033,.085+(i===1||i===2?.035:0));fingers.push(finger);}const thumb=pill(wrist,skin,-side*.13,-.09,.025,.047,.08,side*-.6);return{side,shoulder,elbow,wrist,fingers,thumb};}arms.push(arm(-1),arm(1));
const shadowPlane=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.ShadowMaterial({opacity:.09}));shadowPlane.rotation.x=-Math.PI/2;shadowPlane.position.y=-1.92;shadowPlane.receiveShadow=true;scene.add(shadowPlane);
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduce.matches,time=0,last=0,yaw=-.09,targetYaw=-.09,gazeX=0,gazeY=0,dragging=false,pointerX=0,pointerY=0,lift=0,targetLift=0,scrollSpeed=0,scrollBefore=scrollY,sceneProgress=0,sceneName='home',spinBase=0,current=null,queued=null,frameBlend=.1;
const weights={wave:0,explain:0,dance:0,panic:0,fly:0,vanish:0,sneeze:0,think:0};
const durations={wave:3.6,explain:4.8,dance:5,spin:3.2,panic:3.2,fly:4,vanish:4,think:4,sneeze:2.5};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*t*(t*(t*6-15)+10);
const targetQ=new THREE.Quaternion(),euler=new THREE.Euler();
function pose(object,x,y,z){targetQ.setFromEuler(euler.set(x,y,z));object.quaternion.slerp(targetQ,frameBlend);}
function gesture(type,manual=false){
 if(!(type in durations))return;
 if(current?.type===type&&time-current.start<800)return;
 // Never snap a half-completed turn or interrupt a visitor's action on scroll.
 if(current?.type==='spin'||(current?.manual&&!manual)){queued={type,manual};return;}
 current={type,start:time,duration:durations[type],manual};
 dispatchEvent(new CustomEvent('mascot:acting',{detail:{action:type,manual}}));
}
document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>gesture(button.dataset.action,true)));
addEventListener('mascot:gesture',event=>gesture(typeof event.detail==='string'?event.detail:event.detail?.type||event.detail?.gesture||event.detail?.action));
addEventListener('mascot:scene',event=>{const d=event.detail||{};sceneName=d.scene||sceneName;if(!dragging)targetYaw=['about','work','cybious','expertise','process'].includes(sceneName)?.25:-.25;sceneProgress=Number(d.progress)||0;if(Number.isFinite(d.velocity))scrollSpeed=clamp(d.velocity,-1,1);});
addEventListener('scroll',()=>{const y=scrollY;scrollSpeed=clamp((y-scrollBefore)/100,-1,1);scrollBefore=y;},{passive:true});
canvas.style.touchAction='pan-y';canvas.style.cursor='grab';canvas.addEventListener('pointerdown',e=>{dragging=true;dispatchEvent(new CustomEvent('mascot:react',{detail:{type:'grab'}}));pointerX=e.clientX;pointerY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';targetLift=.15;});canvas.addEventListener('pointermove',e=>{if(dragging){targetYaw+=(e.clientX-pointerX)*.009;targetLift=clamp(targetLift-(e.clientY-pointerY)*.003,-.1,.5);pointerX=e.clientX;pointerY=e.clientY;}else if(e.pointerType!=='touch'){const r=canvas.getBoundingClientRect();gazeX=((e.clientX-r.left)/r.width-.5)*.45;gazeY=((e.clientY-r.top)/r.height-.5)*.22;}});function release(){if(dragging)dispatchEvent(new CustomEvent('mascot:react',{detail:{type:'drop'}}));dragging=false;targetLift=0;canvas.style.cursor='grab';}canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);canvas.addEventListener('pointerleave',()=>{if(!dragging){gazeX=gazeY=0;targetYaw=['about','work','cybious','expertise','process'].includes(sceneName)?.25:-.25;}});
const toggle=document.getElementById('motion-toggle');function sync(){if(toggle){toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'Play motion':'Pause motion';}}sync();toggle?.addEventListener('click',()=>{paused=!paused;sync();});reduce.addEventListener('change',e=>{paused=e.matches;sync();});document.addEventListener('visibilitychange',()=>last=0);
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);const aspect=w/h,vertical=2.8;camera.left=-vertical*aspect;camera.right=vertical*aspect;camera.top=vertical;camera.bottom=-vertical;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas);resize();gesture('wave');
let lastPaint=0;
function frame(now){
 if(renderer.isSoftware&&now-lastPaint<50){requestAnimationFrame(frame);return;}lastPaint=now;
 const dt=last?now-last:16;last=now;
 if(document.hidden){requestAnimationFrame(frame);return;}
 if(paused){renderer.render(scene,camera);canvas.dataset.renderedFrame=String(Math.floor(time));requestAnimationFrame(frame);return;}
 time+=dt;const t=time/1000;frameBlend=1-Math.exp(-dt/125);
 let spin=0,phase=0;const desired={};
 if(current){phase=(time-current.start)/1000;const p=clamp(phase/current.duration,0,1),envelope=ease(clamp(phase/.6,0,1))*ease(clamp((current.duration-phase)/.75,0,1));desired[current.type]=envelope;
 if(current.type==='spin')spin=Math.PI*2*ease(p);
 if(p>=1){if(current.type==='spin')spinBase+=Math.PI*2;current=null;spin=0;if(queued){const next=queued;queued=null;gesture(next.type,next.manual);phase=0;}}
 }
 const weightBlend=1-Math.exp(-dt/150),tracking=1-Math.exp(-dt/180);
 for(const key of Object.keys(weights))weights[key]=lerp(weights[key],desired[key]||0,weightBlend);
 yaw=lerp(yaw,targetYaw,tracking);lift=lerp(lift,targetLift,1-Math.exp(-dt/210));scrollSpeed*=Math.exp(-dt/180);
 const dance=weights.dance,panic=weights.panic,fly=weights.fly,vanish=weights.vanish,think=weights.think,explain=weights.explain;
 const local=current?phase:t,beat=Math.sin(local*Math.PI*2*1.25),greet=Math.sin(local*Math.PI*2*1.7);
 root.rotation.y=yaw+spinBase+spin;
 root.position.set(Math.sin(local*9)*panic*.035,Math.sin(t*1.55)*.012+lift+fly*.48+Math.sin(local*5)*dance*.025,0);
 root.scale.setScalar(1-vanish*.985);
 pose(torso,Math.sin(local*4)*dance*.055,0,Math.sin(local*4)*dance*.09+scrollSpeed*.018);
 const contentLook=['about','work','expertise','process'].includes(sceneName)?.09:-.025;
 pose(headPivot,gazeY+Math.sin(local*3)*explain*.04,gazeX+contentLook+Math.sin(t*.7)*.012,Math.sin(local*3)*dance*.06+think*.1);
 const blink=Math.pow(Math.max(0,Math.cos(t*1.04+2)),80)>.6;
 eyes.forEach(eye=>{eye.scale.y=blink?.012:.14*(1+panic*.28);eye.scale.x=.085*(1+panic*.15);});brows.forEach((brow,i)=>{brow.position.y=.025*explain+.06*panic+(i===0?.05*think:0);});
 smile.visible=explain<.12&&panic<.1;speaking.visible=!smile.visible;
 speaking.scale.y=.055+explain*(.035+Math.abs(Math.sin(local*8))*.025)+panic*.06;
 for(const arm of arms){const side=arm.side,right=side===1,wave=right?weights.wave:0,present=(sceneName==='jen'? !right:right)?explain:explain*.18;
 const sway=Math.sin(local*4+side*.4)*dance*.38;
 pose(arm.shoulder,-fly*.3-present*.22+Math.sin(local*9)*panic*.09,present*-.15,side*(.16+wave*1.95+present*.93+fly*1.35+panic*1.4)+sway);
 pose(arm.elbow,-.1-present*(.45+beat*.06)-think*(right?.85:0),0,side*(wave*(.32+greet*.12)+present*.25));
 pose(arm.wrist,-present*.25,weights.wave*greet*.12,side*greet*wave*.2+think*(right?-.38:0));
 arm.fingers.forEach((finger,i)=>pose(finger,present?(i===0?.03:.65):wave?-.035:.14,0,(i-1.5)*(wave?.085:.05)));
 }
 const mobile=matchMedia('(max-width:760px)').matches,dock=Number(canvas.parentElement.dataset.dock||0),dockZoom=mobile?2.35:92*5.6/(1.7*canvas.clientHeight*(120/canvas.clientWidth));camera.zoom=lerp(camera.zoom,1+(dockZoom-1)*dock,tracking);const viewY=.22+.82*dock;camera.position.y=lerp(camera.position.y,.35+.69*dock,tracking);camera.lookAt(0,viewY,0);camera.updateProjectionMatrix();canvas.dataset.renderedFrame=String(Math.floor(time));canvas.dataset.motion=JSON.stringify({action:current?.type||'idle',phase:Number(phase.toFixed(3)),yaw:Number(root.rotation.y.toFixed(3)),arm:Number(arms[1].shoulder.rotation.z.toFixed(3))});
 renderer.render(scene,camera);requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
}}
