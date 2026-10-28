'use strict';
// One scroll scheduler coordinates layout, narration and character motion.
const scenes=[...document.querySelectorAll('.scene')];
const bubble=document.querySelector('#speech');
const stage=document.querySelector('.character-stage');
const media=matchMedia('(max-width: 760px)');
let narrationTimer=0;let active='',pending=false,lastScroll=scrollY,lastTime=performance.now(),actionUntil=0;
let guide=null,guideFrame=0,guideLast=0,route={x:0,y:0,scale:1,dock:0};
function setRoute(x,y,scale,dock=0){route={x,y,scale,dock};if(!guide)guide={...route};if(!guideFrame)guideFrame=requestAnimationFrame(paintGuide);}
function paintGuide(now){const dt=guideLast?Math.min(64,now-guideLast):16;guideLast=now;const alpha=matchMedia('(prefers-reduced-motion: reduce)').matches?1:1-Math.exp(-dt/95);let error=0;for(const k of ['x','y','scale','dock']){guide[k]+=(route[k]-guide[k])*alpha;error+=Math.abs(route[k]-guide[k]);}stage.style.transform=`translate3d(${guide.x.toFixed(3)}%,${guide.y.toFixed(3)}px,0) scale(${guide.scale.toFixed(5)})`;stage.dataset.dock=guide.dock.toFixed(4);if(!media.matches){const radius=stage.clientHeight+(stage.clientWidth/2-stage.clientHeight)*guide.dock;stage.style.clipPath=`circle(${radius}px at 50% 50%)`;}else stage.style.clipPath='none';if(error>.002)guideFrame=requestAnimationFrame(paintGuide);else{guideFrame=0;guideLast=0;}}
let bubbleTimer=0;function speak(text){if(bubble.textContent===text)return;bubble.textContent=text;document.body.classList.add('show-narration');clearTimeout(bubbleTimer);bubbleTimer=setTimeout(()=>document.body.classList.remove('show-narration'),3600);}
function update(){
 pending=false;
 const now=performance.now(),delta=scrollY-lastScroll;
 const velocity=Math.max(-2,Math.min(2,delta/Math.max(16,now-lastTime)));
 lastScroll=scrollY;lastTime=now;
 let current=scenes[0];const threshold=innerHeight*.38;
 for(const scene of scenes){if(scene.getBoundingClientRect().top<threshold)current=scene;}
 const changed=active!==current.id;active=current.id;
 document.body.dataset.scene=active;document.body.dataset.active=current.dataset.theme;
 const showcase=media.matches&&['cybious','contact'].includes(active);document.body.classList.toggle('tour-docked',media.matches&&scrollY>430&&!showcase);document.body.classList.toggle('mascot-showcase',showcase);
 document.querySelectorAll('.section-nav a').forEach(a=>{const selected=a.hash==='#'+active;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 if(changed||now>actionUntil)speak(current.dataset.speech);
 if(changed)dispatchEvent(new CustomEvent('mascot:gesture',{detail:{type:['home','contact'].includes(current.id)?'wave':'explain'}}));
 const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 document.querySelector('#progress').style.width=Math.min(100,scrollY/max*100)+'%';
 // A continuous route is sampled from scroll distance, rather than section-triggered jumps.
 if(media.matches){
  const slot=current.querySelector('.mobile-mascot-slot');
  if(showcase&&slot){setRoute(0,slot.getBoundingClientRect().top,1,0);}
  else{const p=Math.max(0,Math.min(1,(scrollY-220)/320)),e=p*p*(3-2*p);setRoute((72-innerWidth*.16)/innerWidth*100*e,360*(1-e)+(innerHeight-134)*e,1-.68*e,e);}
 }else{
  const smooth=value=>{const p=Math.max(0,Math.min(1,value));return p*p*(3-2*p);};
  const w=stage.clientWidth,h=stage.clientHeight;
  const dockPose={x:(80-stage.offsetLeft-w/2)/w*100,y:innerHeight-80-stage.offsetTop-h/2,scale:120/w,dock:1};
  let pose={x:0,y:0,scale:1,dock:0};
  for(const scene of scenes.slice(1)){
   const isDock=scene.id==='portfolio',late=['expertise','process','contact'].includes(scene.id);
   // Finish every large pose at its section entrance; never shrink inside Cybious.
   const lead=isDock?0:late?.35:.85,span=isDock?.35:late?.35:.7;
   const p=smooth((scrollY-(Math.min(scene.offsetTop,document.documentElement.scrollHeight-innerHeight)-innerHeight*lead))/(innerHeight*span));if(p<=0)break;
   const left=['about','work','cybious','expertise','process'].includes(scene.id);
   const target=isDock?dockPose:{x:left?-145:0,y:0,scale:scene.id==='contact'?1.06:scene.id==='cybious'?.95:left?.85:1,dock:0};
   for(const key of Object.keys(pose))pose[key]+=(target[key]-pose[key])*p;
   if(p<1)break;
  }
  setRoute(pose.x,pose.y,pose.scale,pose.dock);
 }
 dispatchEvent(new CustomEvent('mascot:scene',{detail:{scene:active,progress:Math.max(0,Math.min(1,-current.getBoundingClientRect().top/Math.max(1,current.offsetHeight))),velocity}}));
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);media.addEventListener('change',schedule);update();
document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{actionUntil=performance.now()+4500;speak({wave:'Hello there. Ready to make something?',dance:'Great work deserves a little celebration.',spin:'A fresh perspective always helps.',think:'Every good build starts with a good question.',panic:'A little debugging. We’ve all been there.',fly:'Taking your idea a little further.',vanish:'Back in a moment.',explain:'Here’s how we turn your idea into something useful.'}[button.dataset.action]);clearTimeout(narrationTimer);narrationTimer=setTimeout(()=>{actionUntil=0;speak(scenes.find(s=>s.id===active).dataset.speech);},4600);}));
document.querySelector('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('hello@diigoo.com');const toast=document.querySelector('#toast');toast.textContent='Email copied. Let’s talk soon.';dispatchEvent(new CustomEvent('mascot:react',{detail:{type:'bell'}}));toast.style.display='block';setTimeout(()=>toast.style.display='none',2500);}catch{location.href='mailto:hello@diigoo.com';}});
document.querySelectorAll('.services details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)document.querySelectorAll('.services details').forEach(other=>{if(other!==detail)other.open=false;});}));
// Content stays visible by default, including after bfcache navigation and reduced motion.
document.querySelectorAll('.project').forEach((project,index)=>project.addEventListener('pointerenter',()=>{actionUntil=performance.now()+3000;speak(['ArthaChain. A foundation for the systems you want to build.','JenAI. Give your business a voice of its own.','Cybious. A clearer picture of your security.'][index]);}));
addEventListener('pageshow',schedule);

const trickToggle=document.querySelector('#trick-toggle'),trickMenu=document.querySelector('#trick-menu');trickToggle.addEventListener('click',()=>{const open=trickToggle.getAttribute('aria-expanded')!=='true';trickToggle.setAttribute('aria-expanded',String(open));trickMenu.hidden=!open;});addEventListener('keydown',event=>{if(event.key==='Escape'){trickMenu.hidden=true;trickToggle.setAttribute('aria-expanded','false');}});

addEventListener('mascot:unavailable',()=>{const image=document.querySelector('.mascot-fallback');image.hidden=false;document.querySelector('#sculpture').hidden=true;document.body.dataset.renderer='image';const durations={wave:3200,explain:3000,dance:3500,spin:1600,think:2600,panic:2600,fly:2600,vanish:3100};document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{image.className='mascot-fallback';void image.offsetWidth;image.className='mascot-fallback action-'+b.dataset.action;const dur=durations[b.dataset.action]||3500;setTimeout(()=>image.className='mascot-fallback',dur);}));});
// Progressive reading in the pinned introduction, preserving selectable DOM text.
const intro=document.querySelector('.about-statement'),wordNodes=[];
if(intro){const walker=document.createTreeWalker(intro,NodeFilter.SHOW_TEXT),texts=[];while(walker.nextNode())texts.push(walker.currentNode);for(const text of texts){const fragment=document.createDocumentFragment();text.textContent.split(/(\s+)/).forEach(part=>{if(!part.trim()){fragment.append(document.createTextNode(part));return;}const word=document.createElement('span');word.className='reading-word';word.textContent=part;wordNodes.push(word);fragment.append(word);});text.replaceWith(fragment);}const readProgress=()=>{if(media.matches||matchMedia('(prefers-reduced-motion: reduce)').matches){wordNodes.forEach(w=>w.style.opacity='1');return;}const section=document.querySelector('#about'),r=section.getBoundingClientRect(),progress=Math.max(0,Math.min(1,(innerHeight*.8-r.top)/(section.offsetHeight-innerHeight*.2)));wordNodes.forEach((word,i)=>word.style.opacity=String(Math.max(.18,Math.min(1,(progress*wordNodes.length-i)*.55))));};addEventListener('scroll',readProgress,{passive:true});addEventListener('resize',readProgress);readProgress();}
// One cancellable scroll timeline; avoids stacking native smooth-scroll requests.
let anchorFrame=0,anchorOriginal='';
function cancelAnchor(){if(anchorFrame)cancelAnimationFrame(anchorFrame);anchorFrame=0;document.documentElement.style.scrollBehavior=anchorOriginal;}
addEventListener('wheel',cancelAnchor,{passive:true});addEventListener('touchstart',cancelAnchor,{passive:true});
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{const target=document.querySelector(link.hash);if(!target||event.metaKey||event.ctrlKey)return;event.preventDefault();cancelAnchor();anchorOriginal=document.documentElement.style.scrollBehavior;document.documentElement.style.scrollBehavior='auto';const from=scrollY,offset=media.matches?30:30,to=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,target.getBoundingClientRect().top+scrollY-offset)),start=performance.now(),duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.min(850,450+Math.abs(to-from)*.12);history.pushState(null,'',link.hash);function tick(now){const p=duration?Math.min(1,(now-start)/duration):1,e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;scrollTo(0,from+(to-from)*e);if(p<1)anchorFrame=requestAnimationFrame(tick);else{anchorFrame=0;document.documentElement.style.scrollBehavior=anchorOriginal;schedule();}}anchorFrame=requestAnimationFrame(tick);}));
