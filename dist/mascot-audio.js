'use strict';
// Independently implemented procedural sound, tuned to the reference's event timing and pitch behaviour.
(()=>{
 const button=document.querySelector('#sound-toggle'),speech=document.querySelector('#speech');
 if(!button)return;
 const icons={off:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/></svg>',on:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>'};
 let enabled=false,context,master,narrationTimers=[],lastText='',lastBlip=0;
 const voices=new Set();
 try{enabled=localStorage.getItem('diigoo-sound')==='on';}catch{}
 function sync(){const icon=enabled?'on':'off';if(button.dataset.icon!==icon){button.innerHTML=icons[icon];button.dataset.icon=icon;}button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'Mute sound':'Enable sound');button.title=enabled?'Sound on — click to mute':'Sound off — click to enable';button.dataset.audioState=context?.state||'off';}
 function clearNarration(){narrationTimers.forEach(clearTimeout);narrationTimers=[];}
 function stop(){clearNarration();for(const node of voices){try{node.stop();}catch{}}voices.clear();if(context&&master)master.gain.setTargetAtTime(0,context.currentTime,.008);}
 async function activate(){
  if(!enabled||document.hidden||!navigator.userActivation.hasBeenActive)return false;
  const AudioAPI=window.AudioContext||window.webkitAudioContext;if(!AudioAPI)return false;
  if(!context){context=new AudioAPI();master=context.createGain();master.gain.value=.9;master.connect(context.destination);context.onstatechange=sync;}
  if(context.state!=='running')await context.resume();
  if(!enabled||document.hidden)return false;
  master.gain.setTargetAtTime(.9,context.currentTime,.008);sync();return context.state==='running';
 }
 // A short attack and exponential tail avoid clicks; optional frequency modulation supplies the spring/wobble.
 function voice({offset=0,from,to=from,length=.1,level=.1,wave='triangle',wobble=0,depth=0}){
  const start=context.currentTime+.008+offset,osc=context.createOscillator(),amp=context.createGain();
  osc.type=wave;osc.frequency.setValueAtTime(from,start);osc.frequency.exponentialRampToValueAtTime(Math.max(20,to),start+length);
  amp.gain.setValueAtTime(0,start);amp.gain.linearRampToValueAtTime(level,start+.008);amp.gain.exponentialRampToValueAtTime(.0001,start+length);
  osc.connect(amp);amp.connect(master);voices.add(osc);osc.start(start);osc.stop(start+length+.005);
  let mod,amount;
  if(wobble){mod=context.createOscillator();amount=context.createGain();mod.frequency.value=wobble;amount.gain.setValueAtTime(depth,start);amount.gain.linearRampToValueAtTime(0,start+length);mod.connect(amount);amount.connect(osc.frequency);mod.start(start);mod.stop(start+length);voices.add(mod);mod.onended=()=>{voices.delete(mod);mod.disconnect();amount.disconnect();};}
  osc.onended=()=>{voices.delete(osc);osc.disconnect();amp.disconnect();};
 }
 const scores={
  wave:[{wave:'sine',from:523,to:587,length:.16,level:.13},{wave:'sine',offset:.13,from:659,to:784,length:.3,level:.12}],
  grab:[{from:196,to:523,length:.4,level:.14,wobble:14,depth:14}],
  drop:[{wave:'sine',from:392,to:220,length:.7,level:.15,wobble:11,depth:80}],
  spin:[{wave:'sine',from:880,to:330,length:1.2,level:.13,wobble:7,depth:70}],
  fly:[{from:262,to:784,length:1.9,level:.12,wobble:9,depth:20}],
  vanish:[{wave:'sine',from:880,to:110,length:1,level:.12,wobble:30,depth:40},{wave:'sine',offset:2,from:110,to:880,length:1,level:.12,wobble:30,depth:40}],
  dance:[523,659,784,659,587,740,880,1047].map((from,i)=>({from,offset:i*.2,length:.12,level:.11})),
  panic:Array.from({length:8},(_,i)=>({from:i%2?740:988,offset:i*.1,length:.08,level:.1})),
  bell:[0,.22].flatMap(offset=>[{wave:'sine',offset,from:1319,length:.6,level:.12},{wave:'sine',offset,from:3296,length:.3,level:.05}])
 };
 async function effect(name){
  if(!scores[name]||!await activate())return;
  button.dataset.lastSound=name;button.dataset.lastReaction=name;scores[name].forEach(voice);
 }
 async function blip(){
  if(performance.now()-lastBlip<120||!await activate())return;
  lastBlip=performance.now();const pitch=392*Math.pow(2,Math.random()*5/12);
  voice({from:pitch*1.25,to:pitch,length:.07,level:.1});button.dataset.lastSound='speech';button.dataset.speechBlips=String(Number(button.dataset.speechBlips||0)+1);
 }
 function narrate(){
  const text=speech.textContent.trim();if(text===lastText)return;lastText=text;clearNarration();
  if(!enabled||document.hidden)return;
  const words=text.match(/\S+/g)||[];let delay=0;
  for(const word of words.slice(0,36)){narrationTimers.push(setTimeout(blip,delay));delay+=/[.!?]$/.test(word)?240:140;}
 }
 new MutationObserver(narrate).observe(speech,{childList:true,subtree:true,characterData:true});
 button.addEventListener('click',async()=>{enabled=!enabled;try{localStorage.setItem('diigoo-sound',enabled?'on':'off');}catch{}if(!enabled)stop();sync();if(enabled){try{await activate();}catch{enabled=false;sync();}}});
 // Stored preference is unlocked by an actual visitor gesture, without a startup jingle.
 const unlock=()=>{if(enabled)activate().catch(()=>{});};document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock,{passive:true});
 addEventListener('mascot:acting',e=>{if(e.detail?.manual)effect(e.detail.action).catch(()=>{});});
 addEventListener('mascot:react',e=>effect(e.detail?.type).catch(()=>{}));
 document.addEventListener('visibilitychange',()=>{clearNarration();if(!context)return;if(document.hidden){stop();context.suspend().catch(()=>{});}else if(enabled)activate().catch(()=>{});});
 sync();
})();
