/* ═══════════════════════════════════════════
   HEXHAUS — game.js  v4 (multi-room)
   Babylon.js first-person 3D engine
   © 2026 Melanie Mizzi. All rights reserved.
   ═══════════════════════════════════════════ */

'use strict';

// ─── ITEMS ──────────────────────────────────────────────────────────────────
const ITEMS = {
  cloak:     { name:'The Black Cloak',    icon:'🧥', collectible:true,  desc:'Heavy wool, charcoal-black. A silver clasp shaped like a moth. It smells of woodsmoke and something older.' },
  staff:     { name:'Gnarled Staff',      icon:'🪄', collectible:true,  desc:'Twisted hawthorn wood, taller than you. Three runes carved near the tip. One is still warm.' },
  key:       { name:'Iron Key',           icon:'🗝️', collectible:true,  desc:'Heavy old iron. The bow is shaped like a crescent moon. It opens something important.' },
  letter:    { name:'Sealed Letter',      icon:'📜', collectible:true,  desc:'Black wax seal, pressed with a hexagon. The wax broke at your touch, as if it had been waiting. Her handwriting inside: "What I keep below, the books keep above."' },
  rosemary:  { name:'Dried Rosemary',     icon:'🌿', collectible:true,  desc:"Tied with red thread. Hung above a doorway, rosemary keeps what shouldn't enter from entering." },
  spellbook: { name:'Spell Book',        icon:'📓', collectible:true,  desc:'Leather-bound, locked with a clasp. The pages whisper when you open it. They whisper your name.' },
  crystalball:{ name:'Crystal Ball',     icon:'🔮', collectible:false, desc:'Swirling mist inside. You see yourself — but younger. Or older. The image is not clear.' },
  grimoire:  { name:'The Open Grimoire', icon:'📖', collectible:false, desc:'The margins are crowded with herbs, measurements and warnings. Several pages have been torn out.' },
  tea:       { name:'Tea Set',           icon:'☕', collectible:false,  desc:'Two cups. One still warm. The other has a film of dust. She was expecting someone.' },
  raven:     { name:'The Raven',         icon:'🦅', collectible:false, desc:'It watches you. It has watched everyone who has entered this room. It does not blink.' },
  helga_portrait:{ name:'Portrait of the Lady', icon:'🖼️', collectible:false, desc:'She is young here. Younger than the house. The white in her hair was already there when this was painted. The cat on her shoulders looks at you. Nothing else in the frame does.' },
  helga_apparition:{ name:'Helga', icon:'🕯️', collectible:false, desc:'She is mid-scream and no sound comes out. Her hands are black to the knuckle, the hands of someone who has worked this house for two hundred years. The candle has not burned down. She is closer than she was.' },
  helga_cat:{ name:'The Cat', icon:'🐈‍⬛', collectible:false, desc:'Green eyes, older than the cat wearing them. It looks at you the way she does. By the time you blink it is already somewhere else in the house.' },
  portrait:  { name:'Family Portrait',    icon:'🖼️', collectible:false, desc:'Four figures. Three look outward. One — the smallest — faces the wall. The paint is old. The posture is not.' },
  mirror:    { name:'Standing Mirror',    icon:'🪞', collectible:false, desc:"Your reflection is a half-second slow. It catches up when you stop moving. When you look away, it doesn't." },
  clock:     { name:'Grandfather Clock',  icon:'🕰️', collectible:false, desc:'Stopped at 3:17. The pendulum is still. But you heard it tick when you entered the room.' },
  bookshelf: { name:'The Bookshelves',    icon:'📚', collectible:false, desc:"Hundreds of volumes. Herbalism, astronomy, law, names. One shelf is labelled in a language you almost recognise." },
  fireplace: { name:'The Fireplace',      icon:'🔥', collectible:false, desc:"The fire is lit. The hearth is cold. The wood isn't burning — it just looks that way." },
  cauldron:  { name:'The Cauldron',       icon:'🫕', collectible:false, desc:'Cast iron, thicker than your fist. Something is still warm inside. The smell is botanical — but wrong.' },
  herbwall:  { name:'Drying Herbs',       icon:'🌾', collectible:false, desc:'Dozens of bundles. Wormwood, yarrow, henbane, rue. She dried them herself. This week.' },
  jars:      { name:'Specimen Jars',     icon:'🫙', collectible:false, desc:'Newt eyes. Mandrake root. Dragon scale. Powdered hooves. Each labelled in her careful hand.' },
  still:     { name:'Alchemy Still',     icon:'⚗️', collectible:false, desc:'Copper and glass, connected by thin tubes. Something distils slowly. It has been distilling for a very long time.' },
  pentagram: { name:'Carved Pentagram',   icon:'⭐', collectible:false, desc:'Cut deep into the floorboards. The grooves are dark — not with age. With use.' },
  broom:     { name:"Witch's Broom",     icon:'🧹', collectible:false, desc:'Straw and ash wood. The bristles are worn. It has been used — but not for sweeping.' },
  bones:     { name:'Scattered Bones',    icon:'🦴', collectible:false, desc:'Small bones. Bird? Or not. They are arranged in a pattern. You do not want to know what it means.' },
  herbs_dried:{ name:'Hanging Garlic',   icon:'🧄', collectible:false, desc:'Plaited and hung from the ceiling. Some bulbs are fresh. Some are dust. The smell keeps other things away.' },
  spider:    { name:'Spider Web',        icon:'🕸️', collectible:false, desc:'The web spans the entire corner. The spider is somewhere in it. It is bigger than your hand.' },
  attic_box: { name:'Storage Box',       icon:'📦', collectible:false, desc:'Dusty, unlabelled. Something shifts inside when you tilt it. You decide not to tilt it.' },
  locked_door:{ name:'The Basement Door', icon:'🔒', collectible:false, desc:'Heavy oak, bound in iron. The keyhole is shaped like a crescent moon. It does not rattle. It does not want to.' },
  secretshelf:{ name:'The Whispering Shelf', icon:'📖', collectible:false, desc:'Every book here is named, not titled. The shelf hums, very faintly, like paper about to speak.' },
};

const state = { inventory:[], activeModal:null, currentRoom:'entrance', passageOpen:false, basementUnlocked:false, helgaSeen:false };
const $ = id => document.getElementById(id);

// ─── LOADING ──────────────────────────────────────────────────────────────────
const STEPS = [
  [10,'Unlocking the front door…'],[30,'Lighting the candles…'],
  [55,'Placing the furniture…'],[75,'Listening for footsteps…'],
  [92,'She knows you are here…'],[100,'Welcome.'],
];
let si = 0;
function advanceLoad(){
  if(si>=STEPS.length) return;
  const [p,m]=STEPS[si++];
  $('load-bar').style.width=p+'%'; $('load-text').textContent=m;
  if(si<STEPS.length) setTimeout(advanceLoad,500+Math.random()*400);
  else setTimeout(()=>{ $('loading-screen').classList.add('hidden'); $('title-screen').classList.remove('hidden'); },900);
}
setTimeout(advanceLoad,300);

$('btn-enter').addEventListener('click',()=>{
  $('title-screen').classList.add('hidden');
  $('game-canvas').classList.remove('hidden');
  $('hud').classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    try { initEngine(); }
    catch(e) {
      console.error('Engine init failed:', e);
      document.body.innerHTML = '<div style="color:#fff;padding:2rem;font-family:sans-serif;background:#0a0a0a;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center"><div><h2 style="color:#c9a96e">Could not start 3D engine</h2><p style="margin-top:1rem;color:#aaa">' + e.message + '</p></div></div>';
    }
  }));
});

// ─── REAL TEXTURE URLS (CC0 — PolyHaven) ─────────────────────────────────────
const TEX = {
  stone_d:   'textures/stone_wall_diff_1k.webp',
  stone_n:   'textures/stone_wall_nor_gl_1k.webp',
  plaster_d: 'textures/plastered_stone_wall_diff_1k.webp',
  plaster_n: 'textures/plastered_stone_wall_nor_gl_1k.webp',
  wood_d:    'textures/wood_planks_dirt_diff_1k.webp',
  wood_n:    'textures/wood_planks_dirt_nor_gl_1k.webp',
  darkwood_d:'textures/wood_cabinet_worn_long_diff_1k.webp',
  darkwood_n:'textures/wood_cabinet_worn_long_nor_gl_1k.webp',
  rock_d:    'textures/rock_wall_07_diff_1k.webp',
  rock_n:    'textures/rock_wall_07_nor_gl_1k.webp',
  beam_d:    'textures/wood_planks_diff_1k.webp',
  beam_n:    'textures/wood_planks_nor_gl_1k.webp',
  mstone_d:  'textures/medieval_blocks_02_diff_1k.webp',
  mstone_n:  'textures/medieval_blocks_02_nor_gl_1k.webp',
  helga_p:   'textures/helga_portrait.webp?v=20260928p13',
};

// ─── ENGINE GLOBALS ──────────────────────────────────────────────────────────
let engine = null;
let scene  = null;
let camera = null;
let camYaw = 0, camPitch = 0;
let isDragging = false, dragStartX = 0, dragStartY = 0, lastClientX = 0, lastClientY = 0;
let tid = null;
let interactables = new Map();
const TAP = 10, SENS = 0.0025, PMIN = -0.52, PMAX = 0.52;

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
function mat(name){ const m=new BABYLON.StandardMaterial(name,scene); m.maxSimultaneousLights=8; m.specularColor=new BABYLON.Color3(0.04,0.04,0.04); return m; }

function pbr(name, diffUrl, norUrl, usc=2, vsc=2, tint=null, alpha=1.0) {
  const m = new BABYLON.StandardMaterial(name, scene);
  m.maxSimultaneousLights = 8;
  const dt = new BABYLON.Texture(diffUrl, scene);
  dt.uScale = usc; dt.vScale = vsc;
  m.diffuseTexture = dt;
  const nt = new BABYLON.Texture(norUrl, scene);
  nt.uScale = usc; nt.vScale = vsc;
  m.bumpTexture = nt;
  m.specularColor = new BABYLON.Color3(0.06, 0.06, 0.08);
  m.specularPower = 12;
  if (tint) m.diffuseColor = tint;
  if (alpha < 1) { m.alpha = alpha; m.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND; }
  return m;
}

function emitM(name,r,g,b,ei=0.8){ const m=mat(name); m.diffuseColor=new BABYLON.Color3(r,g,b); m.emissiveColor=new BABYLON.Color3(r*ei,g*ei,b*ei); return m; }


// ─── DOORS & WINDOWS ─────────────────────────────────────────────────────────
// Doors that behave like doors: real wall openings, framed hinged panels with
// knobs that swing open on click. Windows: framed night glass with a cold glow.
let DOORS = {};   // mesh name -> {hinge, open}

function cloneWallMat(base, name, wRatio, hRatio){
  const m = base.clone(name);
  try {
    if(base.diffuseTexture){ m.diffuseTexture = base.diffuseTexture.clone(); m.diffuseTexture.uScale = base.diffuseTexture.uScale*wRatio; m.diffuseTexture.vScale = base.diffuseTexture.vScale*hRatio; }
    if(base.bumpTexture){ m.bumpTexture = base.bumpTexture.clone(); m.bumpTexture.uScale = base.bumpTexture.uScale*wRatio; m.bumpTexture.vScale = base.bumpTexture.vScale*hRatio; }
  } catch(e){}
  m.backFaceCulling = false;
  return m;
}

// A wall with real doorways: side fills between openings + a header above each.
// doors: [{dx,dz,dw,dh}] — doorway centres in WORLD coords, so rooms can pass
// the same coordinates they gave the old door slabs.
function doorwayWall(baseName, wallW, wallH, wx, wz, rotY, baseMat, doors){
  const lx=Math.cos(rotY), lz=-Math.sin(rotY);
  const offs=doors.map(d=>({off:(d.dx-wx)*lx+(d.dz-wz)*lz, dw:d.dw, dh:d.dh})).sort((a,b)=>a.off-b.off);
  const node=new BABYLON.TransformNode(baseName+'_wn',scene);
  node.position.set(wx,0,wz); node.rotation.y=rotY;
  const half=wallW/2;
  const fills=[]; let prev=-half;
  for(const o of offs){
    fills.push([prev,o.off-o.dw/2,wallH,0]);          // fill from the previous edge to this opening
    fills.push([o.off,o.off+o.dw,wallH-o.dh,o.dh]);   // header above the opening
    prev=o.off+o.dw/2;
  }
  fills.push([prev,half,wallH,0]);
  fills.forEach((f,i)=>{
    const [c0,c1,sh,y0]=f;
    if(c1-c0<0.01||sh<0.01) return;
    const m=BABYLON.MeshBuilder.CreatePlane(baseName+'_seg'+i,{width:c1-c0,height:sh},scene);
    m.parent=node; m.position.set((c0+c1)/2,y0+sh/2,0);
    m.material=cloneWallMat(baseMat,baseName+'_seg'+i+'_m',(c1-c0)/wallW,sh/wallH);
  });
  return node;
}

// The door itself: jambs, lintel, a hinged panel with inset faces and a knob.
// The panel keeps the historic mesh name so ray-picking and QA carry over.
function buildDoor(name, wx, wz, rotY, dw, dh, y0=0){
  const node=new BABYLON.TransformNode(name+'_wn',scene);
  node.position.set(wx,y0,wz); node.rotation.y=rotY;
  const frameM=mat(name+'_frameM'); frameM.diffuseColor=new BABYLON.Color3(0.11,0.075,0.045); frameM.specularColor=new BABYLON.Color3(0.02,0.02,0.02);
  for(const side of [-1,1]){
    const j=BABYLON.MeshBuilder.CreateBox(name+'_jamb'+(side<0?'L':'R'),{width:0.12,height:dh+0.24,depth:0.2},scene);
    j.parent=node; j.position.set(side*(dw/2+0.06),(dh+0.24)/2,0); j.material=frameM;
  }
  const lintel=BABYLON.MeshBuilder.CreateBox(name+'_lintel',{width:dw+0.36,height:0.14,depth:0.2},scene);
  lintel.parent=node; lintel.position.set(0,dh+0.17,0); lintel.material=frameM;
  const hinge=new BABYLON.TransformNode(name+'_hinge',scene);
  hinge.parent=node; hinge.position.set(-dw/2+0.045,0.05,0);
  const pw=dw-0.09, ph=dh-0.08;
  const panel=BABYLON.MeshBuilder.CreateBox(name,{width:pw,height:ph,depth:0.055},scene);
  panel.parent=hinge; panel.position.set(pw/2,ph/2,0);
  const doorM=mat(name+'_m'); doorM.diffuseColor=new BABYLON.Color3(0.16,0.105,0.06); doorM.specularColor=new BABYLON.Color3(0.04,0.04,0.05); doorM.specularPower=24;
  panel.material=doorM;
  const insetM=mat(name+'_inM'); insetM.diffuseColor=new BABYLON.Color3(0.125,0.08,0.045); insetM.specularColor=new BABYLON.Color3(0.02,0.02,0.02);
  [[ph*0.17,ph*0.34],[-ph*0.25,ph*0.40]].forEach(([cy,ch],i)=>{
    for(const s of [1,-1]){
      const q=BABYLON.MeshBuilder.CreateBox(name+'_inset'+i+(s>0?'f':'b'),{width:pw-0.18,height:ch,depth:0.014},scene);
      q.parent=panel; q.position.set(0,cy,s*0.033); q.material=insetM;
    }
  });
  const knobM=mat(name+'_knobM'); knobM.diffuseColor=new BABYLON.Color3(0.32,0.24,0.12); knobM.specularColor=new BABYLON.Color3(0.5,0.42,0.28); knobM.specularPower=48;
  const knobY=1.02-(0.05+ph/2);
  for(const s of [1,-1]){
    const k=BABYLON.MeshBuilder.CreateSphere(name+(s>0?'_knob':'_knobB'),{diameter:0.07},scene);
    k.parent=panel; k.position.set(pw-0.11,knobY,s*0.055); k.material=knobM;
  }
  interactables.set(name,name);
  interactables.set(name+'_knob',name);
  for(const s of [1,-1]) for(const i of [0,1]) interactables.set(name+'_inset'+i+(s>0?'f':'b'),name);   // the raised inset faces are part of the door
  DOORS[name]={hinge,open:false};
  return node;
}

// The swing: opens away from you, and you walk through as it passes halfway.
function swingDoor(d, target){
  if(new URLSearchParams(location.search).has('qa')){ if(target) transitionToRoom(target); return; }   // QA asserts instantly
  const t0=performance.now(), T=650; let walked=false;
  const obs=scene.onBeforeRenderObservable.add(()=>{
    const k=Math.min(1,(performance.now()-t0)/T);
    d.hinge.rotation.y=1.9*(1-Math.pow(1-k,3));
    if(target&&k>0.55&&!walked){walked=true;setTimeout(()=>{if(!state.activeModal)transitionToRoom(target)},60);}
    if(k>=1)scene.onBeforeRenderObservable.remove(obs);
  });
}

// A window: frame, muntins, night glass, and a faint cold glow inside.
function makeWindow(name, x, y, z, rotY, ww=1.1, wh=1.7){
  const node=new BABYLON.TransformNode(name+'_wn',scene);
  node.position.set(x,y,z); node.rotation.y=rotY;
  const woodM=mat(name+'_frM'); woodM.diffuseColor=new BABYLON.Color3(0.13,0.09,0.055); woodM.specularColor=new BABYLON.Color3(0.02,0.02,0.02);
  const bar=(n,w,h,cx,cy,cz)=>{const b=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:0.12},scene);b.parent=node;b.position.set(cx,cy,cz);b.material=woodM;return b;};
  bar(name+'_t',ww+0.18,0.09,0,wh/2+0.045,0);
  bar(name+'_b',ww+0.18,0.09,0,-wh/2-0.045,0);
  bar(name+'_l',0.09,wh+0.18,-ww/2-0.045,0,0);
  bar(name+'_r',0.09,wh+0.18,ww/2+0.045,0,0);
  bar(name+'_mv',0.05,wh,0,0,0.005);
  bar(name+'_mh',ww,0.05,0,0,0.005);
  const sill=BABYLON.MeshBuilder.CreateBox(name+'_sill',{width:ww+0.34,height:0.07,depth:0.24},scene);
  sill.parent=node; sill.position.set(0,-wh/2-0.1,0.03); sill.material=woodM;
  const glass=BABYLON.MeshBuilder.CreatePlane(name+'_glass',{width:ww,height:wh},scene);
  glass.parent=node; glass.position.z=-0.04;
  const gm=mat(name+'_glM');
  gm.diffuseColor=new BABYLON.Color3(0.01,0.01,0.02);
  gm.emissiveColor=new BABYLON.Color3(0.07,0.10,0.17);
  gm.specularColor=new BABYLON.Color3(0.1,0.1,0.1);
  gm.backFaceCulling=false;
  glass.material=gm;
  const moon=new BABYLON.PointLight(name+'_L',new BABYLON.Vector3(0,0,0.55),scene);
  moon.parent=node;
  moon.diffuse=new BABYLON.Color3(0.45,0.55,0.75); moon.specular=new BABYLON.Color3(0.1,0.1,0.15);
  moon.intensity=0.25; moon.range=4.5;
  return node;
}


// ─── STAIRCASES ──────────────────────────────────────────────────────────────
// Stairs between floors. The landing (or threshold) carries the historic
// interactable name, so clicking the stairs routes through the door handler.
// mode 'down': treads descend THROUGH a wall opening, into the floor below.
// mode 'up':   treads rise INSIDE the room toward the opening in the wall.
function makeStairs(name, wx, wz, rotY, opts={}){
  const mode=opts.mode||'down', steps=opts.steps??5, rise=opts.rise??0.18, run=opts.run??0.32, width=opts.width??1.9, clickKey=opts.clickKey||name;
  const node=new BABYLON.TransformNode(name+'_stwn',scene);
  node.position.set(wx,0,wz); node.rotation.y=rotY;
  const stM=mat(name+'_stM'); stM.diffuseColor=new BABYLON.Color3(0.19,0.13,0.075); stM.specularColor=new BABYLON.Color3(0.03,0.03,0.03);
  const railM=mat(name+'_railM'); railM.diffuseColor=new BABYLON.Color3(0.14,0.095,0.055); railM.specularColor=new BABYLON.Color3(0.02,0.02,0.02);
  if(mode==='down'){
    for(let i=0;i<steps;i++){
      const t=BABYLON.MeshBuilder.CreateBox(name+'_tread'+i,{width:width,height:0.06,depth:run},scene);
      t.parent=node; t.position.set(0,-rise*(i+1),-(run*(i+0.5))-0.06); t.material=stM;
      interactables.set(t.name,clickKey);
      const r=BABYLON.MeshBuilder.CreateBox(name+'_riser'+i,{width:width,height:rise,depth:0.03},scene);
      r.parent=node; r.position.set(0,-rise*(i+1)-rise/2,-(run*(i+1))-0.045); r.material=stM;
    }
    const L=BABYLON.MeshBuilder.CreateBox(name,{width:width,height:0.06,depth:0.32},scene);
    L.parent=node; L.position.set(0,0.03,-0.16); L.material=stM;
    interactables.set(name,clickKey);
    // newel post, balusters and a sloped handrail on the right side
    const post=BABYLON.MeshBuilder.CreateBox(name+'_newel',{width:0.09,height:1.05,depth:0.09},scene);
    post.parent=node; post.position.set(width/2-0.05,0.525,-0.05); post.material=railM;
    for(let i=0;i<steps;i+=2){
      const b=BABYLON.MeshBuilder.CreateBox(name+'_bal'+i,{width:0.05,height:0.9,depth:0.05},scene);
      b.parent=node; b.position.set(width/2-0.05,-rise*(i+1)+0.45,-(run*(i+0.5))-0.06); b.material=railM;
    }
    const railLen=Math.hypot(steps*run,steps*rise)+0.4;
    const rail=BABYLON.MeshBuilder.CreateBox(name+'_rail',{width:0.07,height:0.06,depth:railLen},scene);
    rail.parent=node; rail.rotation.x=-Math.atan(rise/run);
    rail.position.set(width/2-0.05,-steps*rise/2+0.92,-(steps*run)/2-0.25); rail.material=railM;
    const glow=new BABYLON.PointLight(name+'_L',new BABYLON.Vector3(0,0.9,-1.1),scene);
    glow.parent=node; glow.diffuse=new BABYLON.Color3(0.8,0.6,0.4); glow.intensity=0.32; glow.range=3.5;
  } else {
    for(let i=0;i<steps;i++){
      const t=BABYLON.MeshBuilder.CreateBox(name+'_tread'+i,{width:width,height:0.06,depth:run},scene);
      t.parent=node; t.position.set(0,rise*(i+1),run*(steps-i-0.5)+0.35); t.material=stM;
      interactables.set(t.name,clickKey);
      const r=BABYLON.MeshBuilder.CreateBox(name+'_riser'+i,{width:width,height:rise,depth:0.03},scene);
      r.parent=node; r.position.set(0,rise*(i+1)-rise/2,run*(steps-i-1)+0.35); r.material=stM;
    }
    const L=BABYLON.MeshBuilder.CreateBox(name,{width:width,height:0.07,depth:0.4},scene);
    L.parent=node; L.position.set(0,rise*steps+0.035,0.15); L.material=stM;
    interactables.set(name,clickKey);
    // side rails so you don't step off the landing into the room below
    for(const sd of [-1,1]){
      const b=BABYLON.MeshBuilder.CreateBox(name+'_post'+(sd<0?'L':'R'),{width:0.07,height:0.95,depth:0.07},scene);
      b.parent=node; b.position.set(sd*(width/2-0.04),rise*steps+0.5,0.38); b.material=railM;
      const rl=BABYLON.MeshBuilder.CreateBox(name+'_rail'+(sd<0?'L':'R'),{width:0.05,height:0.05,depth:0.5},scene);
      rl.parent=node; rl.position.set(sd*(width/2-0.04),rise*steps+0.62,0.18); rl.material=railM;
    }
    const glow=new BABYLON.PointLight(name+'_L',new BABYLON.Vector3(0,rise*steps+1.2,0.6),scene);
    glow.parent=node; glow.diffuse=new BABYLON.Color3(0.8,0.6,0.4); glow.intensity=0.3; glow.range=3.5;
  }
  return node;
}

// ─── MODEL LOADER ───────────────────────────────────────────────────────────
const MODEL_BASE = location.pathname.includes('/preview/') ? '../models/' : 'models/';
let modelInstance = 0;
function loadModel(fileName, pos, scale, rotY, interactableKey, placement='floor') {
  const targetScene = scene;
  const instance = ++modelInstance;
  var dbg = document.getElementById('dbgLoad');
  if (dbg) dbg.textContent += fileName + '... | ';
  
  // Check if SceneLoader is available
  if (typeof BABYLON.SceneLoader === 'undefined') {
    if (dbg) dbg.textContent += 'FAIL:' + fileName + ' (no SceneLoader) | ';
    console.error('[Hexhaus] SceneLoader not available!');
    return;
  }
  
  // Use the full URL for clarity
  var fullUrl = MODEL_BASE + fileName;
  console.log('[Hexhaus] Loading model from:', fullUrl);
  
  BABYLON.SceneLoader.ImportMeshAsync(null, MODEL_BASE, fileName, targetScene).then(function(result) {
    if (targetScene !== scene) return;
    var meshes = result.meshes;
    // Babylon GLBs reuse names such as __root__; make picks unambiguous per instance.
    meshes.forEach((m, i) => { m.name = 'model_' + instance + '_' + i + '_' + m.name; });
    if (dbg && dbg.isConnected) dbg.textContent += fileName + ' OK (' + meshes.length + ') | ';
    console.log('[Hexhaus] Loaded model:', fileName, 'meshes:', meshes.length, 'scale:', scale);
    
    var root = meshes[0];
    if (!root) return;
    // Quaternius GLBs have an internal 100x authoring node; divide legacy scene scales once.
    const normalizedScale = scale * 0.01;
    root.scaling.set(normalizedScale, normalizedScale, normalizedScale);
    if (rotY) root.rotation.y = rotY;
    root.position.set(pos[0], pos[1], pos[2]);
    
    // Floor objects are grounded; wall/ceiling fixtures preserve their authored anchor.
    if (placement === 'floor') {
      root.computeWorldMatrix(true);
      let minY = Infinity;
      meshes.forEach(m => {
        m.computeWorldMatrix(true);
        if (m.getTotalVertices && m.getTotalVertices() > 0) {
          minY = Math.min(minY, m.getBoundingInfo().boundingBox.minimumWorld.y);
        }
      });
      if (Number.isFinite(minY)) root.position.y += pos[1] - minY;
    }
    
    // Reuse a converted material for meshes sharing one source material.
    const materialCache = new Map();
    meshes.forEach(function(m) {
      if (m.material && m.material.getClassName) {
        const sourceMaterial = m.material;
        if (materialCache.has(sourceMaterial)) { m.material = materialCache.get(sourceMaterial); return; }
        var stdMat = new BABYLON.StandardMaterial(m.name + '_std', targetScene);
        stdMat.maxSimultaneousLights = 8;
        if (m.material.albedoTexture) {
          stdMat.diffuseTexture = m.material.albedoTexture.clone();
        } else if (m.material.diffuseTexture) {
          stdMat.diffuseTexture = m.material.diffuseTexture.clone();
        }
        if (m.material.albedoColor) {
          stdMat.diffuseColor = m.material.albedoColor.clone();
        } else if (m.material.diffuseColor) {
          stdMat.diffuseColor = m.material.diffuseColor.clone();
        } else {
          stdMat.diffuseColor = new BABYLON.Color3(0.6, 0.5, 0.4);
        }
        stdMat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);
        stdMat.specularPower = 16;
        stdMat.alpha = sourceMaterial.alpha ?? 1;
        stdMat.backFaceCulling = sourceMaterial.backFaceCulling;
        materialCache.set(sourceMaterial, stdMat);
        m.material = stdMat;
      }
    });
    
    if (interactableKey) {
      meshes.forEach(function(m) {
        if (m.getTotalVertices && m.getTotalVertices() > 0) interactables.set(m.name, interactableKey);
      });
    }
  }).catch(function(err) {
    if (targetScene !== scene) return;
    if (dbg && dbg.isConnected) dbg.textContent += 'FAIL:' + fileName + ' (' + (err.message || err) + ') | ';
    console.error('[Hexhaus] Model load FAILED:', fileName, err);
  });
}


// ─── CAMERA ──────────────────────────────────────────────────────────────────
function applyRot(){
  const f=new BABYLON.Vector3(
    Math.sin(camYaw)*Math.cos(camPitch),
    Math.sin(camPitch),
    Math.cos(camYaw)*Math.cos(camPitch)
  );
  camera.setTarget(camera.position.add(f));
}

let recentreAnim=null;
function recentreView(){
  if(recentreAnim) clearInterval(recentreAnim);
  const startPitch=camPitch, startFov=camera.fov;
  let prog=0;
  recentreAnim=setInterval(()=>{
    prog+=0.07;
    if(prog>=1){ prog=1; clearInterval(recentreAnim); recentreAnim=null; }
    const ease=1-Math.pow(1-prog,3);
    camPitch=startPitch*(1-ease);
    camera.fov=startFov+(1.1-startFov)*ease;
    applyRot();
  },16);
}


// ─── TRANSITION ──────────────────────────────────────────────────────────────
let isTransitioning = false;
function transitionToRoom(roomId){
  if(isTransitioning) return;
  if(!ROOMS[roomId]) { console.warn('Unknown room:', roomId); return; }
  if(recentreAnim){ clearInterval(recentreAnim); recentreAnim=null; }
  document.getElementById('dbgLoad')?.remove();
  isTransitioning = true;
  const canvas = $('game-canvas');
  canvas.style.transition = 'opacity 0.4s';
  canvas.style.opacity = '0.3';
  try {
    if(scene) scene.dispose();
    interactables = new Map();
    DOORS = {};
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.04,0.08,0.12,1);
    scene.fogMode    = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogColor   = new BABYLON.Color3(0.06,0.12,0.18);
    scene.fogDensity = 0.025;
    const r = ROOMS[roomId];
    camera = new BABYLON.UniversalCamera('cam', new BABYLON.Vector3(r.camPos[0],r.camPos[1],r.camPos[2]), scene);
    // FIX: use a valid forward target, not the camera's own position (degenerate → NaN rotation)
    camera.setTarget(new BABYLON.Vector3(r.camPos[0],r.camPos[1],r.camPos[2]+1));
    camera.minZ=0.1; camera.maxZ=60; camera.fov=1.1;
    camera.inputs.clear();
    // FIX: explicitly reset rotation before applyRot to clear any stale state
    camera.rotation = new BABYLON.Vector3(0,0,0);
    camYaw=r.camYaw; camPitch=0; applyRot();
    // FIX: force view matrix recompute to discard any cached NaN
    camera.getViewMatrix(true);
    r.build();
    // Collected objects stay gone when a room is revisited.
    state.inventory.forEach(key => {
      for (const [meshName, itemKey] of interactables) {
        if (itemKey === key) scene.getMeshByName(meshName)?.setEnabled(false);
      }
    });
    state.currentRoom = roomId;
    // The house's residents drift where they please.
    if (typeof spawnApparitions === 'function') spawnApparitions(roomId);
    $('room-name').textContent = r.name;
    canvas.style.opacity = '1';
    isTransitioning = false;
  } catch(e) {
    console.error('Room build failed:', roomId, e);
    isTransitioning = false;
    canvas.style.opacity = '1';
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:60px;left:10px;right:10px;background:#300;color:#faa;padding:12px;font-family:monospace;font-size:12px;z-index:9999;white-space:pre-wrap;max-height:70vh;overflow:auto;border:1px solid #f66';
    el.textContent = 'ROOM BUILD ERROR (' + roomId + '):\n' + e.message + '\n\n' + (e.stack||'');
    document.body.appendChild(el);
  }
}

// ─── RAYPICK ─────────────────────────────────────────────────────────────────
function tryPick(cx,cy){
  if(state.activeModal) return;
  if(!scene) return;
  // Pick the nearest visible surface, not a hidden hotspot behind a wall.
  const pick=scene.pick(cx,cy,m=>m.isPickable && m.isVisible && m.isEnabled());
  if(pick.hit&&pick.pickedMesh){
    const key=interactables.get(pick.pickedMesh.name);
    if(!key) return;
    handleInteract(key);
  }
}

// ─── INTERACTION LOGIC (playable loop) ───────────────────────────────────────
function handleInteract(key){
  // The pantry basement door is locked until the iron key is used.
  if(key==='door_basement' && state.currentRoom==='pantry' && !state.basementUnlocked){
    if(state.inventory.includes('key')){
      state.basementUnlocked=true;
      showToast('🗝️ The iron key turns. The lock gives way.');
      const db=DOORS[key]; if(db){db.open=true; swingDoor(db);}   // it creaks open, then you descend
      setTimeout(()=>{ if(state.currentRoom==='pantry' && !state.activeModal) transitionToRoom('basement'); },700);
    } else {
      openModal('locked_door');
    }
    return;
  }
  // The whispering shelf swings open for whoever carries the spellbook.
  if(key==='secretshelf' && state.currentRoom==='library' && !state.passageOpen){
    if(state.inventory.includes('spellbook') && typeof openPassage==='function'){
      openPassage();
    } else {
      openModal('secretshelf');
    }
    return;
  }
  // The revealed passage leads down.
  if(key==='passage_hole'){
    state.basementUnlocked=true;
    transitionToRoom('basement');
    return;
  }
  if(key.startsWith('door_')){
    const target=key.slice(5);
    const d=DOORS[key];
    if(d && !d.open){ d.open=true; swingDoor(d, target); }
    else transitionToRoom(target);
  } else {
    openModal(key);
  }
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function openModal(key){
  if(state.inventory.includes(key)) return;
  const item=ITEMS[key]; if(!item) return;
  state.activeModal=key;
  $('modal-icon').textContent=item.icon; $('modal-name').textContent=item.name; $('modal-desc').textContent=item.desc;
  $('modal-collect').style.display=item.collectible?'':'none';
  $('examine-modal').classList.remove('hidden');
}
function closeModal(){ $('examine-modal').classList.add('hidden'); state.activeModal=null; }
// Re-reading an item already carried — no collect button, same voice.
function openInspect(key){
  if(state.activeModal) return;
  const item=ITEMS[key]; if(!item) return;
  state.activeModal=key;
  $('modal-icon').textContent=item.icon; $('modal-name').textContent=item.name; $('modal-desc').textContent=item.desc;
  $('modal-collect').style.display='none';
  $('examine-modal').classList.remove('hidden');
}

$('modal-backdrop').addEventListener('click',closeModal);
$('modal-close').addEventListener('click',closeModal);
$('modal-collect').addEventListener('click',()=>{
  const key=state.activeModal; if(!key) return;
  const item=ITEMS[key]; if(!item||!item.collectible) return;
  state.inventory.push(key);
  [...interactables.entries()].filter(([,v])=>v===key).forEach(([n])=>{ const m=scene.getMeshByName(n); if(m) m.setEnabled(false); });
  closeModal(); updateInv();
  showToast(item.icon+' '+item.name+' taken');
});

function updateInv(){
  $('inv-slots').innerHTML='';
  state.inventory.forEach(key=>{
    const item=ITEMS[key];
    const slot=document.createElement('div'); slot.className='inv-slot';
    slot.textContent=item.icon; slot.title=item.name;
    slot.style.cursor='pointer';
    slot.addEventListener('click',()=>openInspect(key));
    $('inv-slots').appendChild(slot);
  });
  const total=Object.values(ITEMS).filter(i=>i.collectible).length;
  $('item-count').textContent=state.inventory.length+' / '+total+' items';
}

function showToast(msg){
  const ex=document.getElementById('toast'); if(ex) ex.remove();
  const t=document.createElement('div'); t.id='toast'; t.textContent=msg;
  document.body.appendChild(t); setTimeout(()=>t.remove(),2500);
}

// ─── INIT ENGINE ─────────────────────────────────────────────────────────────
function initEngine(){
  const canvas = $('game-canvas');
  canvas.width  = canvas.offsetWidth  || window.innerWidth;
  canvas.height = canvas.offsetHeight || window.innerHeight;
  engine = new BABYLON.Engine(canvas, true, {
    antialias: true,
    adaptToDeviceRatio: true,
    preserveDrawingBuffer: false,
    stencil: true,
    disableWebGL2Support: false,
  });
  engine.resize();

  // Mouse look — only drag the game canvas, never the UI or modal
  canvas.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse'||state.activeModal)return; isDragging=true; dragStartX=e.clientX; dragStartY=e.clientY; lastClientX=e.clientX; lastClientY=e.clientY; },{passive:true});
  window.addEventListener('pointermove',e=>{ if(e.pointerType!=='mouse'||!isDragging||state.activeModal)return; camYaw-=(e.clientX-lastClientX)*SENS; camPitch=Math.max(PMIN,Math.min(PMAX,camPitch-(e.clientY-lastClientY)*SENS)); lastClientX=e.clientX; lastClientY=e.clientY; applyRot(); },{passive:true});
  window.addEventListener('pointerup',e=>{ if(e.pointerType!=='mouse'||!isDragging)return; const m=Math.abs(e.clientX-dragStartX)+Math.abs(e.clientY-dragStartY); isDragging=false; if(m<TAP) tryPick(e.clientX,e.clientY); },{passive:true});

  // Touch look
  $('game-canvas').addEventListener('touchstart',e=>{ if(state.activeModal||tid!==null)return; const t=e.changedTouches[0]; tid=t.identifier; isDragging=true; dragStartX=t.clientX; dragStartY=t.clientY; lastClientX=t.clientX; lastClientY=t.clientY; },{passive:true});
  $('game-canvas').addEventListener('touchmove',e=>{ if(!isDragging||state.activeModal)return; const t=[...e.changedTouches].find(tt=>tt.identifier===tid); if(!t)return; camYaw-=(t.clientX-lastClientX)*SENS; camPitch=Math.max(PMIN,Math.min(PMAX,camPitch-(t.clientY-lastClientY)*SENS)); lastClientX=t.clientX; lastClientY=t.clientY; applyRot(); },{passive:true});
  $('game-canvas').addEventListener('touchend',e=>{ const t=[...e.changedTouches].find(tt=>tt.identifier===tid); if(!t)return; const m=Math.abs(t.clientX-dragStartX)+Math.abs(t.clientY-dragStartY); isDragging=false; tid=null; if(m<TAP) tryPick(t.clientX,t.clientY); },{passive:true});

  // Pinch zoom
  const FOV_DEFAULT = 1.1, FOV_MIN = 0.45, FOV_MAX = 1.5;
  let pinchStartDist = null, pinchStartFov = FOV_DEFAULT;
  function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }
  $('game-canvas').addEventListener('touchstart', e => {
    if (e.touches.length === 2) { pinchStartDist = getTouchDist(e.touches); pinchStartFov = camera.fov; isDragging = false; tid = null; }
  }, { passive: true });
  $('game-canvas').addEventListener('touchmove', e => {
    if (e.touches.length === 2 && pinchStartDist !== null) {
      const dist = getTouchDist(e.touches);
      camera.fov = Math.max(FOV_MIN, Math.min(FOV_MAX, pinchStartFov * (pinchStartDist / dist)));
    }
  }, { passive: true });
  $('game-canvas').addEventListener('touchend', e => { if (e.touches.length < 2) pinchStartDist = null; }, { passive: true });

  // Keyboard
  window.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); if(e.key==='r'||e.key==='R') recentreView(); },{passive:true});

  $('btn-recentre').addEventListener('click', recentreView);

  // Render loop
  engine.runRenderLoop(()=>{
    if(scene) scene.render();
  });
  window.addEventListener('resize',()=>engine.resize(),{passive:true});

  // Load first room
  updateInv();
  transitionToRoom('entrance');
}


