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
  letter:    { name:'Sealed Letter',      icon:'📜', collectible:true,  desc:'Black wax seal, pressed with a hexagon. The paper is warm. It hums faintly when held close.' },
  rosemary:  { name:'Dried Rosemary',     icon:'🌿', collectible:true,  desc:"Tied with red thread. Hung above a doorway, rosemary keeps what shouldn't enter from entering." },
  spellbook: { name:'Spell Book',        icon:'📓', collectible:true,  desc:'Leather-bound, locked with a clasp. The pages whisper when you open it. They whisper your name.' },
  crystalball:{ name:'Crystal Ball',     icon:'🔮', collectible:false, desc:'Swirling mist inside. You see yourself — but younger. Or older. The image is not clear.' },
  tea:       { name:'Tea Set',           icon:'☕', collectible:false,  desc:'Two cups. One still warm. The other has a film of dust. She was expecting someone.' },
  raven:     { name:'The Raven',         icon:'🦅', collectible:false, desc:'It watches you. It has watched everyone who has entered this room. It does not blink.' },
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
};

const state = { inventory:[], activeModal:null, currentRoom:'entrance' };
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
  stone_d:   'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/stone_wall/stone_wall_diff_1k.jpg',
  stone_n:   'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/stone_wall/stone_wall_nor_gl_1k.jpg',
  plaster_d: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/plastered_stone_wall/plastered_stone_wall_diff_1k.jpg',
  plaster_n: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/plastered_stone_wall/plastered_stone_wall_nor_gl_1k.jpg',
  wood_d:    'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_planks_dirt/wood_planks_dirt_diff_1k.jpg',
  wood_n:    'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_planks_dirt/wood_planks_dirt_nor_gl_1k.jpg',
  darkwood_d:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg',
  darkwood_n:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.jpg',
  rock_d:    'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rock_wall_07/rock_wall_07_diff_1k.jpg',
  rock_n:    'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rock_wall_07/rock_wall_07_nor_gl_1k.jpg',
  beam_d:    'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_planks/wood_planks_diff_1k.jpg',
  beam_n:    'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_planks/wood_planks_nor_gl_1k.jpg',
  mstone_d:  'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/medieval_blocks_02/medieval_blocks_02_diff_1k.jpg',
  mstone_n:  'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/medieval_blocks_02/medieval_blocks_02_nor_gl_1k.jpg',
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
function mat(name){ const m=new BABYLON.StandardMaterial(name,scene); m.specularColor=new BABYLON.Color3(0.04,0.04,0.04); return m; }

function pbr(name, diffUrl, norUrl, usc=2, vsc=2, tint=null, alpha=1.0) {
  const m = new BABYLON.StandardMaterial(name, scene);
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
  const startPitch=camPitch, startYaw=camYaw;
  let normYaw=((startYaw%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  if(normYaw>Math.PI) normYaw-=Math.PI*2;
  let prog=0;
  recentreAnim=setInterval(()=>{
    prog+=0.07;
    if(prog>=1){ prog=1; clearInterval(recentreAnim); recentreAnim=null; }
    const ease=1-Math.pow(1-prog,3);
    camPitch=startPitch*(1-ease);
    camYaw=normYaw*(1-ease);
    applyRot();
  },16);
}

// ─── ROOM REGISTRY ───────────────────────────────────────────────────────────
const ROOMS = {
  entrance: { name:'The Entrance Hall',    build:buildEntranceHall,    camPos:[0,1.7,0],     camYaw:0 },
  living:   { name:'The Living Room',       build:buildLivingRoom,      camPos:[0,1.7,5],     camYaw:Math.PI },
  kitchen:  { name:'The Kitchen',          build:buildKitchen,         camPos:[0,1.7,5],     camYaw:Math.PI },
  library:  { name:'The Library',           build:buildLibrary,        camPos:[0,1.7,5],     camYaw:Math.PI },
  bathroom: { name:'The Bathroom',          build:buildBathroom,        camPos:[0,1.7,2],     camYaw:Math.PI },
  pantry:   { name:'The Pantry',            build:buildPantry,          camPos:[0,1.7,3],     camYaw:Math.PI },
  basement: { name:'The Basement',          build:buildBasement,        camPos:[0,1.7,3],     camYaw:Math.PI },
  attic:    { name:'The Attic',             build:buildAttic,           camPos:[0,1.7,2],     camYaw:Math.PI },
};

// ─── TRANSITION ──────────────────────────────────────────────────────────────
let isTransitioning = false;
function transitionToRoom(roomId){
  if(isTransitioning) return;
  isTransitioning = true;
  const canvas = $('game-canvas');
  canvas.style.transition = 'opacity 0.4s';
  canvas.style.opacity = '0.3';
  setTimeout(() => {
    if(scene) scene.dispose();
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.04,0.08,0.12,1);
    scene.fogMode    = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogColor   = new BABYLON.Color3(0.06,0.12,0.18);
    scene.fogDensity = 0.025;
    const r = ROOMS[roomId];
    camera = new BABYLON.UniversalCamera('cam', new BABYLON.Vector3(r.camPos[0],r.camPos[1],r.camPos[2]), scene);
    camera.setTarget(new BABYLON.Vector3(0,1.7,0));
    camera.minZ=0.1; camera.maxZ=60; camera.fov=1.1;
    camera.inputs.clear();
    camYaw=r.camYaw; camPitch=0; applyRot();
    r.build();
    state.currentRoom = roomId;
    $('room-name').textContent = r.name;
    canvas.style.opacity = '1';
    isTransitioning = false;
  }, 400);
}

// ─── RAYPICK ─────────────────────────────────────────────────────────────────
function tryPick(cx,cy){
  if(state.activeModal) return;
  const pick=scene.pick(cx,cy,m=>interactables.has(m.name));
  if(pick.hit&&pick.pickedMesh){
    const key=interactables.get(pick.pickedMesh.name);
    if(!key) return;
    if(key.startsWith('door_')){
      transitionToRoom(key.slice(5));
    } else {
      openModal(key);
    }
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

  // Mouse look — pointer events on window
  window.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse'||state.activeModal)return; isDragging=true; dragStartX=e.clientX; dragStartY=e.clientY; lastClientX=e.clientX; lastClientY=e.clientY; },{passive:true});
  window.addEventListener('pointermove',e=>{ if(e.pointerType!=='mouse'||!isDragging||state.activeModal)return; camYaw-=(e.clientX-lastClientX)*SENS; camPitch=Math.max(PMIN,Math.min(PMAX,camPitch-(e.clientY-lastClientY)*SENS)); lastClientX=e.clientX; lastClientY=e.clientY; applyRot(); },{passive:true});
  window.addEventListener('pointerup',e=>{ if(e.pointerType!=='mouse'||!isDragging)return; const m=Math.abs(e.clientX-dragStartX)+Math.abs(e.clientY-dragStartY); isDragging=false; if(m<TAP) tryPick(e.clientX,e.clientY); },{passive:true});

  // Touch look
  $('game-canvas').addEventListener('touchstart',e=>{ if(state.activeModal||tid!==null)return; const t=e.changedTouches[0]; tid=t.identifier; isDragging=true; dragStartX=t.clientX; dragStartY=t.clientY; lastClientX=t.clientX; lastClientY=t.clientY; },{passive:true});
  $('game-canvas').addEventListener('touchmove',e=>{ if(!isDragging||state.activeModal)return; const t=[...e.changedTouches].find(tt=>tt.identifier===tid); if(!t)return; camYaw-=(t.clientX-lastClientX)*SENS; camPitch=Math.max(PMIN,Math.min(PMAX,camPitch-(t.clientY-lastClientY)*SENS)); lastClientX=t.clientX; lastClientY=t.clientY; applyRot(); },{passive:true});
  $('game-canvas').addEventListener('touchend',e=>{ const t=[...e.changedTouches].find(tt=>tt.identifier===tid); if(!t)return; const m=Math.abs(t.clientX-dragStartX)+Math.abs(t.clientY-dragStartY); isDragging=false; tid=null; if(m<TAP) tryPick(t.clientX,t.clientY); },{passive:true});

  // Pinch zoom
  const FOV_DEFAULT = 1.1, FOV_MIN = 0.45, FOV_MAX = FOV_DEFAULT;
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
  engine.runRenderLoop(()=>{ if(scene) scene.render(); });
  window.addEventListener('resize',()=>engine.resize(),{passive:true});

  // Load first room
  transitionToRoom('entrance');
}


// ─── ENTRANCE HALL ────────────────────────────────────────────────────────────
function buildEntranceHall(){
  // ── MATERIALS ──────────────────────────────────────────────────────────────

  // Real stone wall texture with normal map
  const wallM = pbr('wallM', TEX.stone_d, TEX.stone_n, 4, 3,
    new BABYLON.Color3(0.32, 0.40, 0.48)); // cold blue-grey tint over stone

  const floorM = pbr('floorM', TEX.wood_d, TEX.wood_n, 6, 5, new BABYLON.Color3(0.38,0.28,0.18));
  floorM.specularColor = new BABYLON.Color3(0.08,0.06,0.03); floorM.specularPower = 28;

  // Real wood beam ceiling
  const ceilM = pbr('ceilM', TEX.beam_d, TEX.beam_n, 5, 3,
    new BABYLON.Color3(0.18, 0.12, 0.07));

  // Real rock/stone for fireplace
  const fpStoneM = pbr('fpStoneM', TEX.rock_d, TEX.rock_n, 2, 2,
    new BABYLON.Color3(0.3, 0.36, 0.4));

  // Real dark wood trim
  const woodTrimM = pbr('woodTrimM', TEX.darkwood_d, TEX.darkwood_n, 8, 1,
    new BABYLON.Color3(0.4, 0.3, 0.18));

  const goldM = mat('goldM');
  goldM.diffuseColor  = new BABYLON.Color3(0.28,0.38,0.32);
  goldM.specularColor = new BABYLON.Color3(0.4,0.55,0.45);
  goldM.specularPower = 48;

  // Real dark wood for bookshelf/clock
  const darkWoodM = pbr('darkWoodM', TEX.darkwood_d, TEX.darkwood_n, 3, 6,
    new BABYLON.Color3(0.3, 0.22, 0.12));

  const dirtM = mat('dirtM');
  dirtM.diffuseColor = new BABYLON.Color3(0.12, 0.09, 0.06);


  // ── ROOM SHELL ─────────────────────────────────────────────────────────────
  const W=22, D=14, H=5.5;

  // Floor
  const floor=BABYLON.MeshBuilder.CreateGround('floor',{width:W,height:D,subdivisions:4},scene);
  floor.material=floorM; floor.receiveShadows=true;

  // Ceiling
  const ceil=BABYLON.MeshBuilder.CreatePlane('ceil',{width:W,height:D},scene);
  ceil.position.y=H; ceil.rotation.x=Math.PI/2;
  ceilM.backFaceCulling=false;
  ceil.material=ceilM;

  // Walls
  function wall(name,w,h,pos,rotY){
    const m=BABYLON.MeshBuilder.CreatePlane(name,{width:w,height:h},scene);
    m.position.copyFrom(pos); m.rotation.y=rotY;
    const wm=wallM.clone(name+'_m'); wm.backFaceCulling=false;
    m.material=wm; return m;
  }
  wall('wBack', W, H, new BABYLON.Vector3(0,H/2,D/2), 0);
  wall('wFront',W, H, new BABYLON.Vector3(0,H/2,-D/2), Math.PI);
  wall('wLeft', D, H, new BABYLON.Vector3(-W/2,H/2,0), Math.PI/2);
  wall('wRight',D, H, new BABYLON.Vector3(W/2,H/2,0), -Math.PI/2);

  // Dado rail
  function dado(nm,len,pos,ry=0){ const b=BABYLON.MeshBuilder.CreateBox(nm,{width:len,height:0.07,depth:0.09},scene); b.position.copyFrom(pos); b.rotation.y=ry; b.material=woodTrimM; }
  dado('dB',W, new BABYLON.Vector3(0,1.05,D/2-0.06));
  dado('dF',W, new BABYLON.Vector3(0,1.05,-D/2+0.06),Math.PI);
  dado('dL',D, new BABYLON.Vector3(-W/2+0.06,1.05,0),Math.PI/2);
  dado('dR',D, new BABYLON.Vector3(W/2-0.06,1.05,0),-Math.PI/2);

  // Crown moulding
  function crown(nm,len,pos,ry=0){ const b=BABYLON.MeshBuilder.CreateBox(nm,{width:len,height:0.09,depth:0.1},scene); b.position.copyFrom(pos); b.rotation.y=ry; b.material=goldM; }
  crown('cB',W, new BABYLON.Vector3(0,H-0.06,D/2-0.07));
  crown('cF',W, new BABYLON.Vector3(0,H-0.06,-D/2+0.07));
  crown('cL',D, new BABYLON.Vector3(-W/2+0.07,H-0.06,0),Math.PI/2);
  crown('cR',D, new BABYLON.Vector3(W/2-0.07,H-0.06,0),-Math.PI/2);

  // Skirting boards
  function skirt(nm,len,pos,ry=0){ const b=BABYLON.MeshBuilder.CreateBox(nm,{width:len,height:0.2,depth:0.07},scene); b.position.copyFrom(pos); b.rotation.y=ry; b.material=woodTrimM; }
  skirt('sB',W, new BABYLON.Vector3(0,0.1,D/2-0.05));
  skirt('sF',W, new BABYLON.Vector3(0,0.1,-D/2+0.05));
  skirt('sL',D, new BABYLON.Vector3(-W/2+0.05,0.1,0),Math.PI/2);
  skirt('sR',D, new BABYLON.Vector3(W/2-0.05,0.1,0),-Math.PI/2);

  // Exposed ceiling beams
  const beamPositions=[-8,-4,0,4,8];
  beamPositions.forEach((bx,i)=>{
    const beam=BABYLON.MeshBuilder.CreateBox('beam'+i,{width:0.38,height:0.32,depth:D},scene);
    beam.position.set(bx,H-0.18,0);
    const bm=mat('bm'+i); bm.diffuseColor=new BABYLON.Color3(0.18,0.09,0.04);
    bm.emissiveColor=new BABYLON.Color3(0.01,0.005,0.002);
    beam.material=bm;
  });


  // ── WALL PANELLING (Victorian raised panels — Scooby-Doo mansion style) ──
  // Panels sit between dado rail (y=1.05) and crown (y=H-0.06)
  // Back wall panels
  const panelMat = mat('panelMat');
  panelMat.diffuseColor = new BABYLON.Color3(0.32, 0.42, 0.50); // slightly lighter stone
  panelMat.emissiveColor = new BABYLON.Color3(0.0, 0.0, 0.0);

  const panelTrimMat = mat('panelTrimMat');
  panelTrimMat.diffuseColor = new BABYLON.Color3(0.22, 0.28, 0.35); // dark grey stone trim
  panelTrimMat.specularColor = new BABYLON.Color3(0.12, 0.08, 0.04);
  panelTrimMat.specularPower = 16;

  function makeWallPanel(name, px, py, pz, pw, ph, ry=0) {
    // Inset panel face
    const face = BABYLON.MeshBuilder.CreatePlane(name+'_f', {width:pw-0.12, height:ph-0.12}, scene);
    face.position.set(px, py, pz); face.rotation.y = ry;
    const fm = panelMat.clone(name+'_fm'); fm.backFaceCulling = false;
    face.material = fm;
    // Outer frame strips (top, bottom, left, right)
    const strips = [
      {w:pw, h:0.06, ox:0, oy:ph/2-0.03},   // top
      {w:pw, h:0.06, ox:0, oy:-ph/2+0.03},  // bottom
      {w:0.06, h:ph, ox:-pw/2+0.03, oy:0},  // left
      {w:0.06, h:ph, ox:pw/2-0.03, oy:0},   // right
    ];
    strips.forEach((s,i) => {
      const strip = BABYLON.MeshBuilder.CreatePlane(name+'_s'+i, {width:s.w, height:s.h}, scene);
      strip.position.set(px+s.ox, py+s.oy, pz+(ry===0?-0.005:0.005));
      strip.rotation.y = ry;
      const sm = panelTrimMat.clone(name+'_sm'+i); sm.backFaceCulling = false;
      strip.material = sm;
    });
  }

  // Back wall — 4 panels
  const panelH = H - 1.05 - 0.2; // from dado to crown, with margin
  const panelY = 1.05 + panelH/2 + 0.1;
  const panelZ = D/2 - 0.04;
  makeWallPanel('pB0', -7,   panelY, panelZ, 3.2, panelH);
  makeWallPanel('pB1', -2.2, panelY, panelZ, 3.2, panelH);
  makeWallPanel('pB2',  2.2, panelY, panelZ, 3.2, panelH);
  makeWallPanel('pB3',  7,   panelY, panelZ, 3.2, panelH);

  // Left wall — 3 panels
  const panelZL = -W/2 + 0.04;
  makeWallPanel('pL0', panelZL, panelY, -4,  3.0, panelH, Math.PI/2);
  makeWallPanel('pL1', panelZL, panelY,  0,  3.0, panelH, Math.PI/2);
  makeWallPanel('pL2', panelZL, panelY,  4,  3.0, panelH, Math.PI/2);

  // Right wall — 2 panels (fireplace takes up the rest)
  const panelZR = W/2 - 0.04;
  makeWallPanel('pR0', panelZR, panelY, -4,  3.0, panelH, -Math.PI/2);
  makeWallPanel('pR1', panelZR, panelY, -0.5, 3.0, panelH, -Math.PI/2);



  // ── GRAND STAIRCASE (right of centre, curving up to landing) ──────────────
  const stairM=pbr('stairM', TEX.darkwood_d, TEX.darkwood_n, 4, 1, new BABYLON.Color3(0.32,0.22,0.1));
  const railM=mat('railM'); railM.diffuseColor=new BABYLON.Color3(0.28,0.18,0.08); railM.specularColor=new BABYLON.Color3(0.15,0.1,0.04); railM.specularPower=16;
  const balM=mat('balM'); balM.diffuseColor=new BABYLON.Color3(0.22,0.15,0.07); balM.specularColor=new BABYLON.Color3(0.12,0.08,0.03);

  const STAIR_STEPS=12, STEPY=H*0.55/STAIR_STEPS, STEPZ=0.42, STEPX=3.8;
  const stairOriginZ=3.0, stairOriginX=3.5;

  for(let s=0;s<STAIR_STEPS;s++){
    // Tread
    const tread=BABYLON.MeshBuilder.CreateBox('tread'+s,{width:STEPX,height:0.06,depth:STEPZ},scene);
    tread.position.set(stairOriginX, s*STEPY+0.06, stairOriginZ-s*STEPZ);
    tread.material=stairM;
    // Riser
    const riser=BABYLON.MeshBuilder.CreateBox('riser'+s,{width:STEPX,height:STEPY,depth:0.04},scene);
    riser.position.set(stairOriginX, s*STEPY+STEPY/2, stairOriginZ-s*STEPZ+STEPZ/2);
    riser.material=stairM;
    // Nosing (rounded front edge strip)
    const nos=BABYLON.MeshBuilder.CreateCylinder('nos'+s,{diameter:0.07,height:STEPX,tessellation:10},scene);
    nos.position.set(stairOriginX, s*STEPY+0.035, stairOriginZ-s*STEPZ+STEPZ/2);
    nos.rotation.z=Math.PI/2; nos.material=railM;

    // 2 balusters per step
    if(s>0){
      [0.3,0.7].forEach((t,bi)=>{
        const baly=s*STEPY+0.06;
        const bh=0.72;
        // Turned baluster — base + spindle + top
        const bbase=BABYLON.MeshBuilder.CreateCylinder('bbase'+s+bi,{diameter:0.06,height:0.08,tessellation:10},scene);
        bbase.position.set(stairOriginX-STEPX/2+t*STEPX, baly+0.04, stairOriginZ-s*STEPZ);
        bbase.material=balM;
        const bspin=BABYLON.MeshBuilder.CreateCylinder('bspin'+s+bi,{diameterTop:0.035,diameterBottom:0.04,height:bh-0.16,tessellation:10},scene);
        bspin.position.set(stairOriginX-STEPX/2+t*STEPX, baly+bh/2, stairOriginZ-s*STEPZ);
        bspin.material=balM;
        // Mid-swell
        const bswl=BABYLON.MeshBuilder.CreateSphere('bswl'+s+bi,{diameter:0.065,segments:6},scene);
        bswl.position.set(stairOriginX-STEPX/2+t*STEPX, baly+bh*0.45, stairOriginZ-s*STEPZ);
        bswl.material=balM;
        const btop=BABYLON.MeshBuilder.CreateCylinder('btop'+s+bi,{diameter:0.055,height:0.08,tessellation:10},scene);
        btop.position.set(stairOriginX-STEPX/2+t*STEPX, baly+bh, stairOriginZ-s*STEPZ);
        btop.material=balM;
      });
    }
  }
  // Handrail — box at angle following stair pitch
  const railAngle=Math.atan2(STAIR_STEPS*STEPY, STAIR_STEPS*STEPZ);
  const railLen=Math.sqrt(Math.pow(STAIR_STEPS*STEPY,2)+Math.pow(STAIR_STEPS*STEPZ,2));
  const handrail=BABYLON.MeshBuilder.CreateCylinder('handrail',{diameter:0.07,height:railLen,tessellation:10},scene);
  handrail.position.set(stairOriginX-STEPX/2+0.12, (STAIR_STEPS*STEPY)/2+0.78, stairOriginZ-(STAIR_STEPS*STEPZ)/2);
  handrail.rotation.x=railAngle; handrail.material=railM;
  // Newel posts (start + end)
  [[0,0.06,stairOriginZ,0.9],[0,STAIR_STEPS*STEPY+0.06,stairOriginZ-STAIR_STEPS*STEPZ+0.2,0.5]].forEach(([,y,z,h],ni)=>{
    const nw=BABYLON.MeshBuilder.CreateBox('newel'+ni,{width:0.14,height:h,depth:0.14},scene);
    nw.position.set(stairOriginX-STEPX/2+0.07,y+h/2,z); nw.material=railM;
    const nwCap=BABYLON.MeshBuilder.CreateSphere('newelCap'+ni,{diameter:0.15,segments:8},scene);
    nwCap.position.set(stairOriginX-STEPX/2+0.07,y+h+0.075,z); nwCap.material=railM;
  });

  // Landing platform
  const landing=BABYLON.MeshBuilder.CreateBox('landing',{width:W/2-0.2,height:0.1,depth:3.5},scene);
  landing.position.set(stairOriginX+(W/2-0.2)/2-STEPX/2, STAIR_STEPS*STEPY+0.05, stairOriginZ-STAIR_STEPS*STEPZ+1.75);
  landing.material=stairM;

  // Landing balustrade
  const landRail=BABYLON.MeshBuilder.CreateBox('landRail',{width:W/2-0.2,height:0.07,depth:0.07},scene);
  landRail.position.set(stairOriginX+(W/2-0.2)/2-STEPX/2, STAIR_STEPS*STEPY+0.78, stairOriginZ-STAIR_STEPS*STEPZ+0.12);
  landRail.material=railM;

  // ── FIREPLACE (right wall) ─────────────────────────────────────────────────
  const fpX=W/2-0.12, fpZ=1.5;

  // Fireplace: corbelled arch surround
  // Side pilasters (base + shaft + capital)
  [[fpZ-1.18],[fpZ+1.18]].forEach(([pz],pi)=>{
    // Base block
    const base=BABYLON.MeshBuilder.CreateBox('fpBase'+pi,{width:0.35,height:0.22,depth:0.68},scene);
    base.position.set(fpX-0.18,0.11,pz); base.material=fpStoneM;
    // Shaft
    const shaft=BABYLON.MeshBuilder.CreateBox('fpShaft'+pi,{width:0.28,height:2.55,depth:0.56},scene);
    shaft.position.set(fpX-0.14,1.39,pz); shaft.material=fpStoneM;
    // Capital (stepped)
    const cap=BABYLON.MeshBuilder.CreateBox('fpCap'+pi,{width:0.36,height:0.18,depth:0.68},scene);
    cap.position.set(fpX-0.18,2.75,pz); cap.material=fpStoneM;
    const cap2=BABYLON.MeshBuilder.CreateBox('fpCap2'+pi,{width:0.32,height:0.12,depth:0.62},scene);
    cap2.position.set(fpX-0.16,2.90,pz); cap2.material=fpStoneM;
  });
  // Arch spanning lintel — segments approximate a round arch
  const archSteps=7;
  for(let ai=0;ai<archSteps;ai++){
    const ang=(ai/(archSteps-1))*Math.PI; // 0 to PI
    const r=1.2;
    const ax=fpX-0.16;
    const ay=3.05+Math.sin(ang)*0.55;
    const az=fpZ+Math.cos(ang)*r;
    const block=BABYLON.MeshBuilder.CreateBox('archB'+ai,{width:0.3,height:0.38,depth:0.34},scene);
    block.position.set(ax,ay,az);
    block.rotation.x=-ang+Math.PI/2;
    block.material=fpStoneM;
  }
  // Keystone
  const keystone=BABYLON.MeshBuilder.CreateBox('keystone',{width:0.32,height:0.42,depth:0.28},scene);
  keystone.position.set(fpX-0.14,3.62,fpZ); keystone.material=fpStoneM.clone('ksm');
  keystone.material.diffuseColor=new BABYLON.Color3(0.32,0.4,0.46);

  // Mantelshelf — thick with stepped profile
  const mantel=BABYLON.MeshBuilder.CreateBox('mantel',{width:0.48,height:0.12,depth:3.1},scene);
  mantel.position.set(fpX-0.22,3.15,fpZ); mantel.material=darkWoodM;
  const mantelFront=BABYLON.MeshBuilder.CreateBox('mantelFront',{width:0.06,height:0.22,depth:3.1},scene);
  mantelFront.position.set(fpX-0.44,3.09,fpZ); mantelFront.material=darkWoodM;
  // Bracket corbels under mantel (2 of them)
  [fpZ-0.8,fpZ+0.8].forEach((bz,bi)=>{
    const brk=BABYLON.MeshBuilder.CreateBox('corbel'+bi,{width:0.14,height:0.28,depth:0.14},scene);
    brk.position.set(fpX-0.35,2.96,bz); brk.material=darkWoodM;
    // Angled cut face
    const brkA=BABYLON.MeshBuilder.CreateBox('corbelA'+bi,{width:0.12,height:0.16,depth:0.12},scene);
    brkA.position.set(fpX-0.36,2.84,bz); brkA.rotation.x=0.4; brkA.material=darkWoodM;
  });
  // Gold rail along mantel front edge
  const mantelEdge=BABYLON.MeshBuilder.CreateBox('mantelEdge',{width:0.03,height:0.06,depth:3.12},scene);
  mantelEdge.position.set(fpX-0.46,3.17,fpZ); mantelEdge.material=goldM;

  // Flanking columns (stone, full height)
  [fpZ-1.35, fpZ+1.35].forEach((cz,ci)=>{
    const cBase=BABYLON.MeshBuilder.CreateCylinder('colBase'+ci,{diameter:0.32,height:0.22,tessellation:16},scene);
    cBase.position.set(fpX-0.16,0.11,cz); cBase.material=fpStoneM;
    const cShaft=BABYLON.MeshBuilder.CreateCylinder('colShaft'+ci,{diameterTop:0.22,diameterBottom:0.26,height:3.0,tessellation:16},scene);
    cShaft.position.set(fpX-0.16,1.72,cz); cShaft.material=fpStoneM;
    const cCap=BABYLON.MeshBuilder.CreateCylinder('colCap'+ci,{diameter:0.34,height:0.18,tessellation:16},scene);
    cCap.position.set(fpX-0.16,3.31,cz); cCap.material=fpStoneM;
    const cAbac=BABYLON.MeshBuilder.CreateBox('colAbac'+ci,{width:0.38,height:0.12,depth:0.38},scene);
    cAbac.position.set(fpX-0.16,3.46,cz); cAbac.material=fpStoneM;
  });

  // Log pile in firebox
  const logM=mat('logM'); logM.diffuseColor=new BABYLON.Color3(0.18,0.1,0.04);
  [[0,-0.55,0.22],[0,-0.55,-0.22],[0.04,-0.42,0],[0.04,-0.42,0.44],[0.04,-0.42,-0.44]].forEach(([lx,ly,lz],li)=>{
    const log=BABYLON.MeshBuilder.CreateCylinder('log'+li,{diameter:0.09,height:2.0,tessellation:8},scene);
    log.position.set(fpX+lx,0.15+(-ly),fpZ+lz); log.rotation.x=Math.PI/2;
    log.material=logM;
  });

  // Firebox
  const fbM=mat('fbM'); fbM.diffuseColor=new BABYLON.Color3(0.04,0.02,0.01); fbM.emissiveColor=new BABYLON.Color3(0.02,0.01,0);
  const firebox=BABYLON.MeshBuilder.CreateBox('firebox',{width:0.12,height:1.35,depth:2.2},scene);
  firebox.position.set(fpX,0.75,fpZ); firebox.material=fbM;

  // Iron grate
  const grateM=mat('grateM'); grateM.diffuseColor=new BABYLON.Color3(0.12,0.1,0.1);
  [-0.6,-0.3,0,0.3,0.6].forEach((gz,gi)=>{
    const bar=BABYLON.MeshBuilder.CreateCylinder('gr'+gi,{diameter:0.04,height:0.7,tessellation:6},scene);
    bar.position.set(fpX-0.04,0.35,fpZ+gz); bar.material=grateM;
  });

  // Ash tile (hearth)
  const hearth=BABYLON.MeshBuilder.CreateBox('hearth',{width:0.35,height:0.02,depth:2.4},scene);
  hearth.position.set(fpX-0.3,0.01,fpZ); hearth.material=fpStoneM;

  // Ember glow layer
  const emberM=mat('emberM');
  emberM.emissiveColor=new BABYLON.Color3(0.6,0.18,0.02);
  emberM.diffuseColor =new BABYLON.Color3(0.4,0.1,0.01);
  const embers=BABYLON.MeshBuilder.CreateBox('embers',{width:0.06,height:0.04,depth:1.8},scene);
  embers.position.set(fpX-0.01,0.04,fpZ); embers.material=emberM;

  // Fireback tile (decorative back panel)
  const firebackM=mat('firebackM');
  firebackM.diffuseColor=new BABYLON.Color3(0.08,0.06,0.05);
  firebackM.emissiveColor=new BABYLON.Color3(0.04,0.01,0);
  const fireback=BABYLON.MeshBuilder.CreateBox('fireback',{width:0.06,height:1.4,depth:2.0},scene);
  fireback.position.set(fpX+0.01,0.8,fpZ); fireback.material=firebackM;

  // Chequered tile floor before fireplace
  for(let tx=-4;tx<=4;tx++){
    for(let tz=-2;tz<=1;tz++){
      const t=BABYLON.MeshBuilder.CreateBox(`ftile_${tx}_${tz}`,{width:0.48,height:0.01,depth:0.48},scene);
      t.position.set(W/2-1.0-tx*0.5,0.006,fpZ+tz*0.5);
      const dm=(tx+tz)%2===0;
      const tm=mat(`ftm_${tx}_${tz}`); tm.diffuseColor=new BABYLON.Color3(dm?0.06:0.22,dm?0.04:0.14,dm?0.06:0.20);
      t.material=tm;
    }
  }


  // ── STONE STATUE (flanking staircase foot — gothic manor style) ──────────
  const statM=pbr('statM', TEX.mstone_d, TEX.mstone_n, 1, 1, new BABYLON.Color3(0.35,0.42,0.48));
  statM.emissiveColor=new BABYLON.Color3(0.01,0.015,0.02);
  const statX=1.0, statZ=4.2;
  // Plinth
  const plinth=BABYLON.MeshBuilder.CreateBox('plinth',{width:0.44,height:0.5,depth:0.44},scene);
  plinth.position.set(statX,0.25,statZ); plinth.material=statM;
  // Plinth top step
  const pTop=BABYLON.MeshBuilder.CreateBox('plinthTop',{width:0.36,height:0.08,depth:0.36},scene);
  pTop.position.set(statX,0.54,statZ); pTop.material=statM;
  // Robes/body
  const body=BABYLON.MeshBuilder.CreateCylinder('statBody',{diameterTop:0.3,diameterBottom:0.38,height:1.0,tessellation:14},scene);
  body.position.set(statX,1.08,statZ); body.material=statM;
  // Torso
  const torso=BABYLON.MeshBuilder.CreateCylinder('statTorso',{diameterTop:0.26,diameterBottom:0.3,height:0.55,tessellation:14},scene);
  torso.position.set(statX,1.83,statZ); torso.material=statM;
  // Head
  const head=BABYLON.MeshBuilder.CreateSphere('statHead',{diameter:0.24,segments:10},scene);
  head.position.set(statX,2.23,statZ); head.scaling.y=1.15; head.material=statM;
  // Hood/cowl
  const hood=BABYLON.MeshBuilder.CreateCylinder('statHood',{diameterTop:0.06,diameterBottom:0.28,height:0.28,tessellation:14},scene);
  hood.position.set(statX,2.32,statZ); hood.material=statM;
  // Arms (outstretched slightly)
  [[-1,0.05],[1,-0.05]].forEach(([dir,tilt],ai)=>{
    const arm=BABYLON.MeshBuilder.CreateCylinder('statArm'+ai,{diameterTop:0.05,diameterBottom:0.08,height:0.48,tessellation:8},scene);
    arm.position.set(statX+dir*0.28,1.76,statZ); arm.rotation.z=dir*0.7+tilt; arm.material=statM;
    // Hand
    const hand=BABYLON.MeshBuilder.CreateSphere('statHand'+ai,{diameter:0.1,segments:6},scene);
    hand.position.set(statX+dir*0.56,1.58,statZ); hand.material=statM;
  });

  // ── BOOKSHELF (left wall) ──────────────────────────────────────────────────
  const bsX=-W/2+0.18, bsZ=-1;

  const bsBack=BABYLON.MeshBuilder.CreateBox('bsBack',{width:0.32,height:4.4,depth:4.2},scene);
  bsBack.position.set(bsX,2.2,bsZ); bsBack.material=darkWoodM;

  // Side panels
  [-2.1,2.1].forEach((oz,si)=>{
    const side=BABYLON.MeshBuilder.CreateBox('bsSide'+si,{width:0.32,height:4.4,depth:0.12},scene);
    side.position.set(bsX+0.08,2.2,bsZ+oz); side.material=darkWoodM;
  });

  const BOOK_COLS=['#7a1a1a','#1a3a6b','#2d5a1a','#6b4a1a','#4a1a5a','#1a4a3a','#8b5a10','#2a1a6a'];
  for(let sh=0;sh<5;sh++){
    const shelfY=0.55+sh*0.78;
    const shelf=BABYLON.MeshBuilder.CreateBox('shelf'+sh,{width:0.38,height:0.07,depth:4.1},scene);
    shelf.position.set(bsX+0.04,shelfY,bsZ); shelf.material=darkWoodM;
    // Books
    let bz=bsZ-1.9;
    while(bz<bsZ+1.9){
      const bw=0.08+Math.random()*0.14;
      const bh=0.38+Math.random()*0.24;
      const tilt=(Math.random()-0.5)*0.12;
      const book=BABYLON.MeshBuilder.CreateBox('bk'+sh+'_'+Math.floor(bz*10),{width:0.14,height:bh,depth:bw},scene);
      book.position.set(bsX+0.14,shelfY+bh/2+0.04,bz+bw/2);
      book.rotation.x=tilt;
      const col=BOOK_COLS[Math.floor(Math.random()*BOOK_COLS.length)];
      // Book spine — solid colour from BOOK_COLS palette with dark wood texture overlay
      const bm=mat('bm'+sh+Math.floor(bz*10));
      bm.diffuseTexture=new BABYLON.Texture(TEX.darkwood_d,scene);
      bm.diffuseTexture.uScale=1; bm.diffuseTexture.vScale=4;
      // Parse hex colour string as diffuse tint
      const r=parseInt(col.slice(1,3),16)/255;
      const g=parseInt(col.slice(3,5),16)/255;
      const b=parseInt(col.slice(5,7),16)/255;
      bm.diffuseColor=new BABYLON.Color3(r*1.4,g*1.4,b*1.4);
      bm.specularColor=new BABYLON.Color3(0.04,0.04,0.04);
      book.material=bm;
      bz+=bw+0.008;
    }
  }

  // ── GRANDFATHER CLOCK ──────────────────────────────────────────────────────
  const ckX=-W/2+0.22, ckZ=4;
  const ckBM=mat('ckBM'); ckBM.diffuseColor=new BABYLON.Color3(0.16,0.08,0.03);
  const ckBox=BABYLON.MeshBuilder.CreateBox('ckBody',{width:0.56,height:2.9,depth:0.56},scene);
  ckBox.position.set(ckX,1.55,ckZ); ckBox.material=ckBM;
  const ckHood=BABYLON.MeshBuilder.CreateBox('ckHood',{width:0.64,height:0.5,depth:0.6},scene);
  ckHood.position.set(ckX,3.28,ckZ); ckHood.material=ckBM;
  const ckBase2=BABYLON.MeshBuilder.CreateBox('ckBase',{width:0.62,height:0.28,depth:0.6},scene);
  ckBase2.position.set(ckX,0.14,ckZ); ckBase2.material=ckBM;
  // Clock glass panel (dark)
  const ckGlassM=mat('ckGlass'); ckGlassM.diffuseColor=new BABYLON.Color3(0.02,0.01,0.04); ckGlassM.alpha=0.7;
  const ckGlass=BABYLON.MeshBuilder.CreateBox('ckGlass',{width:0.08,height:1.5,depth:0.4},scene);
  ckGlass.position.set(ckX+0.28,1.5,ckZ); ckGlass.material=ckGlassM;
  // Clock face (emissive)
  const ckFaceM=mat('ckFaceM'); ckFaceM.emissiveColor=new BABYLON.Color3(0.55,0.5,0.35);
  const ckFace=BABYLON.MeshBuilder.CreatePlane('ckFace',{width:0.36,height:0.36},scene);
  ckFace.position.set(ckX+0.29,2.88,ckZ); ckFace.rotation.y=-Math.PI/2; ckFace.material=ckFaceM;

  // ── CAULDRON (centre left floor) ──────────────────────────────────────────
  const cauldM=mat('cauldM'); cauldM.diffuseColor=new BABYLON.Color3(0.1,0.08,0.1);
  cauldM.specularColor=new BABYLON.Color3(0.12,0.12,0.12); cauldM.specularPower=16;
  const cauldron=BABYLON.MeshBuilder.CreateSphere('cauldron_mesh',{diameter:0.88,segments:12},scene);
  cauldron.position.set(-3,0.38,2); cauldron.scaling.y=0.72; cauldron.material=cauldM;
  // Cauldron legs
  [[-0.28,-0.22],[-0.28,0.22],[0.32,0]].forEach(([lx,lz],li)=>{
    const leg=BABYLON.MeshBuilder.CreateCylinder('cauldLeg'+li,{diameter:0.07,height:0.35,tessellation:6},scene);
    leg.position.set(-3+lx,0.18,2+lz); leg.material=cauldM;
  });
  // Liquid surface glow
  const brewM=mat('brewM'); brewM.emissiveColor=new BABYLON.Color3(0.05,0.35,0.12); brewM.alpha=0.75;
  const brew=BABYLON.MeshBuilder.CreateDisc('brew',{radius:0.34,tessellation:20},scene);
  brew.position.set(-3,0.58,2); brew.rotation.x=Math.PI/2; brew.material=brewM;

  // ── DRYING HERB BUNDLES (back wall) ───────────────────────────────────────
  const herbPositions=[[-6,4.2,D/2-0.1],[-3,4.0,D/2-0.1],[1,4.3,D/2-0.1],[4,4.1,D/2-0.1]];
  herbPositions.forEach(([hx,hy,hz],hi)=>{
    // Hanging string
    const strM=mat('strM'+hi); strM.diffuseColor=new BABYLON.Color3(0.55,0.4,0.2);
    const str=BABYLON.MeshBuilder.CreateCylinder('herbStr'+hi,{diameter:0.015,height:0.35,tessellation:4},scene);
    str.position.set(hx,hy+0.18,hz); str.material=strM;
    // Bundle
    const hm=mat('hm'+hi); hm.diffuseColor=new BABYLON.Color3(0.28+hi*0.04,0.32,0.14);
    const bundle=BABYLON.MeshBuilder.CreateCylinder('herbwall_mesh_'+hi,{diameterTop:0.05,diameterBottom:0.14,height:0.4,tessellation:8},scene);
    bundle.position.set(hx,hy-0.02,hz); bundle.material=hm;
  });


  // ── TALL GOTHIC WINDOW REVEALS (front wall, flanking entrance) ──────────
  const winStoneM=fpStoneM.clone('winStoneM');
  winStoneM.diffuseColor=new BABYLON.Color3(0.2,0.26,0.32);
  [[-5.5],[5.5]].forEach(([wx],wi)=>{
    // Deep stone reveal (side jambs)
    [[-0.48],[0.48]].forEach(([wo],ji)=>{
      const jamb=BABYLON.MeshBuilder.CreateBox('jamb'+wi+'_'+ji,{width:0.38,height:3.0,depth:0.55},scene);
      jamb.position.set(wx+wo,-D/2+0.3+3.0/2+0.1,-D/2+0.3);
      jamb.rotation.y=0; jamb.position.z=-D/2+0.3;
      jamb.position.set(wx+wo,2.2,-D/2+0.3); jamb.material=winStoneM;
    });
    // Sill
    const sill=BABYLON.MeshBuilder.CreateBox('sill'+wi,{width:1.2,height:0.12,depth:0.55},scene);
    sill.position.set(wx,0.85,-D/2+0.3); sill.material=winStoneM;
    // Lintel (flat arch)
    const wlin=BABYLON.MeshBuilder.CreateBox('wlin'+wi,{width:1.2,height:0.2,depth:0.45},scene);
    wlin.position.set(wx,3.62,-D/2+0.28); wlin.material=winStoneM;
    // Window glass (dark teal, slightly emissive — cold outside light)
    const glassM=mat('glassM'+wi);
    glassM.diffuseColor=new BABYLON.Color3(0.08,0.14,0.22);
    glassM.emissiveColor=new BABYLON.Color3(0.06,0.12,0.2);
    glassM.alpha=0.82;
    const glass=BABYLON.MeshBuilder.CreatePlane('glass'+wi,{width:0.85,height:2.65},scene);
    glass.position.set(wx,2.2,-D/2+0.12); glass.material=glassM;
    // Window mullion (vertical centre bar)
    const mull=BABYLON.MeshBuilder.CreateBox('mull'+wi,{width:0.04,height:2.65,depth:0.06},scene);
    mull.position.set(wx,2.2,-D/2+0.14); mull.material=winStoneM;
    // Horizontal transom
    const trans=BABYLON.MeshBuilder.CreateBox('trans'+wi,{width:0.88,height:0.04,depth:0.06},scene);
    trans.position.set(wx,2.5,-D/2+0.14); trans.material=winStoneM;
  });

  // ── PORTRAIT (back wall) ───────────────────────────────────────────────────
  const portM=mat('portM'); portM.diffuseColor=new BABYLON.Color3(0.2,0.1,0.15); portM.emissiveColor=new BABYLON.Color3(0.04,0.02,0.03);
  const portMesh=BABYLON.MeshBuilder.CreatePlane('portrait_mesh',{width:1.6,height:2.1},scene);
  portMesh.position.set(-4,2.8,D/2-0.06); portMesh.material=portM;
  const pfM=goldM.clone('pfM');
  const portFrame=BABYLON.MeshBuilder.CreateBox('portFrame',{width:1.78,height:2.28,depth:0.06},scene);
  portFrame.position.set(-4,2.8,D/2-0.04); portFrame.material=pfM;
  // Ornate moulding strips on frame
  const fOrnM=goldM.clone('fOrnM');
  [[0,1.14,0.07],[0,-1.14,0.07],[0.89,0,0.07],[-0.89,0,0.07]].forEach(([ox,oy,oz],fi)=>{
    const isH=fi<2;
    const fstrip=BABYLON.MeshBuilder.CreateBox('fstrip'+fi,{width:isH?1.78:0.08,height:isH?0.08:2.28,depth:0.04},scene);
    fstrip.position.set(-4+ox,2.8+oy,D/2-0.04+oz); fstrip.material=fOrnM;
  });
  // Corner rosettes
  [[-0.89,-1.14],[0.89,-1.14],[-0.89,1.14],[0.89,1.14]].forEach(([rx,ry],ri)=>{
    const ros=BABYLON.MeshBuilder.CreateCylinder('rosette'+ri,{diameter:0.13,height:0.05,tessellation:14},scene);
    ros.position.set(-4+rx,2.8+ry,D/2-0.01); ros.rotation.x=Math.PI/2; ros.material=goldM;
    const rosC=BABYLON.MeshBuilder.CreateSphere('rosetteC'+ri,{diameter:0.065,segments:6},scene);
    rosC.position.set(-4+rx,2.8+ry,D/2+0.02); rosC.material=goldM;
  });

  // ── MIRROR (back wall right) ───────────────────────────────────────────────
  const mirM=mat('mirM'); mirM.diffuseColor=new BABYLON.Color3(0.35,0.3,0.42); mirM.specularColor=new BABYLON.Color3(0.6,0.55,0.7); mirM.specularPower=64; mirM.emissiveColor=new BABYLON.Color3(0.03,0.02,0.05);
  const mirMesh=BABYLON.MeshBuilder.CreatePlane('mirror_mesh',{width:1.0,height:2.4},scene);
  mirMesh.position.set(4,2.7,D/2-0.06); mirMesh.material=mirM;
  const mfM=goldM.clone('mfM');
  const mirFrame=BABYLON.MeshBuilder.CreateBox('mirFrame',{width:1.14,height:2.55,depth:0.06},scene);
  mirFrame.position.set(4,2.7,D/2-0.04); mirFrame.material=mfM;

  // ── CLOAK (hook near front door) ──────────────────────────────────────────
  const cloakM=mat('cloakM'); cloakM.diffuseColor=new BABYLON.Color3(0.06,0.08,0.12);
  const cloak=BABYLON.MeshBuilder.CreateBox('cloak_mesh',{width:0.6,height:1.4,depth:0.15},scene);
  cloak.position.set(-6,1.1,-D/2+0.4); cloak.material=cloakM;
  // Coat hook
  const hookM=goldM.clone('hookM');
  const hook=BABYLON.MeshBuilder.CreateTorus('hook',{diameter:0.12,thickness:0.02,tessellation:12},scene);
  hook.position.set(-6,1.9,-D/2+0.24); hook.rotation.x=Math.PI/2; hook.material=hookM;

  // ── STAFF (leaning left wall) ──────────────────────────────────────────────
  const stM=mat('stM'); stM.diffuseColor=new BABYLON.Color3(0.24,0.14,0.06);
  const staff=BABYLON.MeshBuilder.CreateCylinder('staff_mesh',{diameterTop:0.04,diameterBottom:0.07,height:1.9,tessellation:8},scene);
  staff.position.set(-W/2+0.42,0.95,-2.5); staff.rotation.z=0.2; staff.material=stM;
  const tipM=mat('tipM'); tipM.emissiveColor=new BABYLON.Color3(0.1,0.6,0.55); tipM.diffuseColor=new BABYLON.Color3(0.05,0.3,0.28);
  const tip=BABYLON.MeshBuilder.CreateSphere('staffTip',{diameter:0.11},scene);
  tip.position.set(-W/2+0.58,1.88,-2.6); tip.material=tipM;

  // ── KEY (on mantelshelf) ───────────────────────────────────────────────────
  const keyM=mat('keyM'); keyM.diffuseColor=new BABYLON.Color3(0.3,0.28,0.3); keyM.specularColor=new BABYLON.Color3(0.5,0.5,0.5); keyM.specularPower=32;
  const key=BABYLON.MeshBuilder.CreateCylinder('key_mesh',{diameter:0.1,height:0.03,tessellation:14},scene);
  key.position.set(fpX-0.5,3.32,fpZ+0.6); key.rotation.x=Math.PI/2; key.material=keyM;

  // ── LETTER (on mantelshelf) ────────────────────────────────────────────────
  const letM=mat('letM'); letM.diffuseColor=new BABYLON.Color3(0.82,0.75,0.58); letM.emissiveColor=new BABYLON.Color3(0.04,0.03,0.01);
  const letter=BABYLON.MeshBuilder.CreateBox('letter_mesh',{width:0.22,height:0.02,depth:0.3},scene);
  letter.position.set(fpX-0.5,3.31,fpZ-0.55); letter.material=letM;
  // Wax seal disc
  const sealM=mat('sealM'); sealM.diffuseColor=new BABYLON.Color3(0.5,0.08,0.08); sealM.emissiveColor=new BABYLON.Color3(0.08,0.01,0.01);
  const seal=BABYLON.MeshBuilder.CreateCylinder('seal',{diameter:0.06,height:0.025,tessellation:8},scene);
  seal.position.set(fpX-0.5,3.33,fpZ-0.55); seal.material=sealM;

  // ── ROSEMARY (above front door frame) ─────────────────────────────────────
  const roseM=mat('roseM'); roseM.diffuseColor=new BABYLON.Color3(0.22,0.38,0.16); roseM.emissiveColor=new BABYLON.Color3(0.02,0.05,0.01);
  const rosemary=BABYLON.MeshBuilder.CreateCylinder('rosemary_mesh',{diameterTop:0.04,diameterBottom:0.1,height:0.4,tessellation:8},scene);
  rosemary.position.set(0,2.8,-D/2+0.16); rosemary.rotation.z=Math.PI/2; rosemary.material=roseM;
  // Red thread tie
  const threadM=mat('threadM'); threadM.emissiveColor=new BABYLON.Color3(0.5,0.05,0.05);
  const thread=BABYLON.MeshBuilder.CreateCylinder('thread',{diameter:0.12,height:0.04,tessellation:10},scene);
  thread.position.set(0,2.8,-D/2+0.14); thread.rotation.z=Math.PI/2; thread.material=threadM;

  // ── CHANDELIER: wrought iron with wax tapers ──────────────────────────────
  const chanY=H-0.3;
  const ironM=mat('ironM'); ironM.diffuseColor=new BABYLON.Color3(0.12,0.12,0.14); ironM.specularColor=new BABYLON.Color3(0.25,0.25,0.28); ironM.specularPower=24;

  // Ceiling rose
  const rose=BABYLON.MeshBuilder.CreateCylinder('chanRose',{diameter:0.28,height:0.08,tessellation:20},scene);
  rose.position.set(0,chanY-0.01,0); rose.material=ironM;
  // Chain links (stacked rings)
  for(let cl=0;cl<5;cl++){
    const lnk=BABYLON.MeshBuilder.CreateTorus('clink'+cl,{diameter:0.06,thickness:0.015,tessellation:10},scene);
    lnk.position.set(0,chanY-0.12-cl*0.14,0); lnk.rotation.x=(cl%2)*Math.PI/2; lnk.material=ironM;
  }
  // Central hub (turned iron ball)
  const hub=BABYLON.MeshBuilder.CreateSphere('chanHub',{diameter:0.22,segments:10},scene);
  hub.position.set(0,chanY-0.9,0); hub.material=ironM;
  // Decorative bottom finial
  const fin=BABYLON.MeshBuilder.CreateCylinder('chanFin',{diameterTop:0.0,diameterBottom:0.1,height:0.22,tessellation:10},scene);
  fin.position.set(0,chanY-1.07,0); fin.rotation.x=Math.PI; fin.material=ironM;

  // 6 curved arms with S-scroll suggestion
  for(let a=0;a<6;a++){
    const angle=(a/6)*Math.PI*2;
    const ax=Math.sin(angle), az=Math.cos(angle);
    // Inner arm segment
    const arm1=BABYLON.MeshBuilder.CreateCylinder('arm1_'+a,{diameter:0.028,height:0.55,tessellation:8},scene);
    arm1.position.set(ax*0.28,chanY-0.9,az*0.28);
    arm1.rotation.z= Math.cos(angle)*0.55; arm1.rotation.x=-Math.sin(angle)*0.55;
    arm1.material=ironM;
    // Outer arm segment
    const arm2=BABYLON.MeshBuilder.CreateCylinder('arm2_'+a,{diameter:0.022,height:0.48,tessellation:8},scene);
    arm2.position.set(ax*0.65,chanY-1.08,az*0.65);
    arm2.rotation.z= Math.cos(angle)*0.18; arm2.rotation.x=-Math.sin(angle)*0.18;
    arm2.material=ironM;
    // Candle cup (bobèche)
    const cup=BABYLON.MeshBuilder.CreateCylinder('cup_'+a,{diameterTop:0.14,diameterBottom:0.06,height:0.06,tessellation:14},scene);
    cup.position.set(ax*0.82,chanY-1.22,az*0.82); cup.material=ironM;
    // Candle taper (white, slightly off-vertical per candle)
    const tilt=(Math.random()-0.5)*0.06;
    const taper=BABYLON.MeshBuilder.CreateCylinder('taper_'+a,{diameterTop:0.03,diameterBottom:0.045,height:0.28,tessellation:10},scene);
    taper.position.set(ax*0.82,chanY-1.07,az*0.82); taper.rotation.z=tilt;
    const waxM=mat('wax'+a); waxM.diffuseColor=new BABYLON.Color3(0.93,0.88,0.78); waxM.emissiveColor=new BABYLON.Color3(0.04,0.03,0.01);
    taper.material=waxM;
    // Wax drip
    const drip=BABYLON.MeshBuilder.CreateCylinder('drip_'+a,{diameterTop:0.04,diameterBottom:0.02,height:0.07,tessellation:8},scene);
    drip.position.set(ax*0.82+0.01,chanY-1.21,az*0.82); drip.material=waxM;
    // Flame
    const fl=BABYLON.MeshBuilder.CreateSphere('cf'+a,{diameter:0.055,segments:6},scene);
    fl.position.set(ax*0.82,chanY-0.92,az*0.82); fl.scaling.y=1.8;
    fl.material=emitM('cfm'+a,1,0.62,0.12,1.0);
  }

  // ── WALL SCONCES ──────────────────────────────────────────────────────────
  [[-W/2+0.14,-3,0],[W/2-0.14,-3,Math.PI]].forEach(([sx,sz,ry],i)=>{
    const bkt=BABYLON.MeshBuilder.CreateBox('scBkt'+i,{width:0.09,height:0.32,depth:0.2},scene);
    bkt.position.set(sx+(i?-0.1:0.1),2.7,sz); bkt.rotation.y=ry; bkt.material=goldM;
    const sfl=BABYLON.MeshBuilder.CreateSphere('sfl'+i,{diameter:0.07},scene);
    sfl.position.set(sx+(i?-0.2:0.2),2.82,sz); sfl.scaling.y=1.4;
    sfl.material=emitM('sfm'+i,1,0.6,0.15,0.9);
  });

  // ── INTERACTABLES MAP ──────────────────────────────────────────────────────
  interactables=new Map([
    ['cloak_mesh','cloak'],['hook','cloak'],
    ['staff_mesh','staff'],['staffTip','staff'],
    ['key_mesh','key'],
    ['letter_mesh','letter'],['seal','letter'],
    ['rosemary_mesh','rosemary'],['thread','rosemary'],
    ['portrait_mesh','portrait'],['portFrame','portrait'],
    ['mirror_mesh','mirror'],['mirFrame','mirror'],
    ['ckBody','clock'],['ckHood','clock'],['ckFace','clock'],['ckGlass','clock'],
    ['bsBack','bookshelf'],
    ['fpL','fireplace'],['fpR','fireplace'],['lintel','fireplace'],['firebox','fireplace'],['mantel','fireplace'],['embers','fireplace'],
    ['cauldron_mesh','cauldron'],['brew','cauldron'],
  ]);
  // Herb bundles
  for(let hi=0;hi<4;hi++) interactables.set('herbwall_mesh_'+hi,'herbwall');

  // ── LIGHTS ────────────────────────────────────────────────────────────────

  // Gloomy overcast window light (simulates grey daylight through tall windows)
  const windowLight = new BABYLON.PointLight('winLight', new BABYLON.Vector3(0, 3.5, -D/2+1), scene);
  windowLight.diffuse   = new BABYLON.Color3(0.3, 0.5, 0.75); // cold blue moonlight
  windowLight.specular  = new BABYLON.Color3(0.1, 0.1, 0.15);
  windowLight.intensity = 2.0;
  windowLight.range     = 26;

  // Second fill — from the staircase landing (mysterious light from upstairs)
  const stairLight = new BABYLON.PointLight('stairLight', new BABYLON.Vector3(3, 4.2, 2), scene);
  stairLight.diffuse   = new BABYLON.Color3(0.28, 0.45, 0.65);
  stairLight.intensity = 1.0;
  stairLight.range     = 16;



  // Dark red environmental glow — emanates from the walls/floor, like cursed hearth light
  const redEnvLight = new BABYLON.PointLight('redEnv', new BABYLON.Vector3(0, 0.4, 0), scene);
  redEnvLight.diffuse   = new BABYLON.Color3(0.72, 0.08, 0.04);
  redEnvLight.specular  = new BABYLON.Color3(0.3, 0.02, 0.0);
  redEnvLight.intensity = 1.2;
  redEnvLight.range     = 30;

  // Second red fill — from the far end of the room (back wall bleed)
  const redBackLight = new BABYLON.PointLight('redBack', new BABYLON.Vector3(0, 1.5, D/2 - 1), scene);
  redBackLight.diffuse   = new BABYLON.Color3(0.6, 0.05, 0.03);
  redBackLight.specular  = new BABYLON.Color3(0.0, 0.0, 0.0);
  redBackLight.intensity = 0.8;
  redBackLight.range     = 22;

  const ambient=new BABYLON.HemisphericLight('amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.65; ambient.diffuse=new BABYLON.Color3(0.48,0.58,0.72);
  ambient.groundColor=new BABYLON.Color3(0.18,0.06,0.06);

  const chanLight=new BABYLON.PointLight('chanL',new BABYLON.Vector3(0,chanY-1.1,0),scene);
  chanLight.diffuse=new BABYLON.Color3(0.6,0.72,0.88); chanLight.intensity=1.4; chanLight.range=28;

  const fireLight=new BABYLON.PointLight('fireL',new BABYLON.Vector3(fpX-0.8,0.9,fpZ),scene);
  fireLight.diffuse=new BABYLON.Color3(1.0,0.6,0.18); fireLight.intensity=3.5; fireLight.range=18;

  // Green cauldron glow
  const cauldLight=new BABYLON.PointLight('cauldL',new BABYLON.Vector3(-3,0.7,2),scene);
  cauldLight.diffuse=new BABYLON.Color3(0.1,0.75,0.55); cauldLight.intensity=0.8; cauldLight.range=7;

  const sconceL=new BABYLON.PointLight('scL',new BABYLON.Vector3(-6,2.8,-3),scene);
  sconceL.diffuse=new BABYLON.Color3(0.5,0.68,0.88); sconceL.intensity=0.9; sconceL.range=14;
  const sconceR=new BABYLON.PointLight('scR',new BABYLON.Vector3(6,2.8,-3),scene);
  sconceR.diffuse=new BABYLON.Color3(0.5,0.68,0.88); sconceR.intensity=0.9; sconceR.range=14;

  // ── FLICKER ───────────────────────────────────────────────────────────────
  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    chanLight.intensity=flk(1.4,0.2,2.1,0);
    fireLight.intensity=flk(3.5,0.6,3.7,1.2);
    cauldLight.intensity=flk(0.55,0.18,1.8,3.0);
    sconceL.intensity  =flk(0.9,0.15,1.8,0.6);
    sconceR.intensity  =flk(0.9,0.15,2.4,2.1);
    // Ember pulse
    if(embers) embers.material.emissiveColor=new BABYLON.Color3(flk(0.6,0.15,3.7,0.5),flk(0.18,0.06,3.7,1.0),0.02);
    // Cauldron brew shimmer
    if(brew) brew.material.emissiveColor=new BABYLON.Color3(0.03,flk(0.35,0.1,1.8,3.0),0.1);
    if(redEnvLight) redEnvLight.intensity=flk(1.2,0.2,0.8,1.5);
  });

  engine.runRenderLoop(()=>scene.render());
  window.addEventListener('resize',()=>engine.resize(),{passive:true});


  // Door triggers — invisible boxes at exits
  const doorLiving = BABYLON.MeshBuilder.CreateBox('door_living',{width:0.1,height:2.4,depth:1.4},scene);
  doorLiving.position.set(-W/2+0.05, 1.2, 0);
  const doorMat = mat('doorMat_living'); doorMat.alpha = 0.01; doorLiving.material = doorMat;
  interactables.set('door_living','door_living');

  const doorKitchen = BABYLON.MeshBuilder.CreateBox('door_kitchen',{width:1.4,height:2.4,depth:0.1},scene);
  doorKitchen.position.set(0, 1.2, D/2-0.05);
  const dkm = mat('doorMat_kitchen'); dkm.alpha = 0.01; doorKitchen.material = dkm;
  interactables.set('door_kitchen','door_kitchen');

  const doorLibrary = BABYLON.MeshBuilder.CreateBox('door_library',{width:0.1,height:2.4,depth:1.4},scene);
  doorLibrary.position.set(-W/2+0.05, 1.2, -D/2+2);
  const dlm = mat('doorMat_library'); dlm.alpha = 0.01; doorLibrary.material = dlm;
  interactables.set('door_library','door_library');

  const doorBathroom = BABYLON.MeshBuilder.CreateBox('door_bathroom',{width:0.1,height:2.4,depth:1.4},scene);
  doorBathroom.position.set(W/2-0.05, 1.2, -3);
  const dbm = mat('doorMat_bathroom'); dbm.alpha = 0.01; doorBathroom.material = dbm;
  interactables.set('door_bathroom','door_bathroom');
}

// ─── LIVING ROOM ──────────────────────────────────────────────────────────────
function buildLivingRoom(){
  const W=16, D=12, H=4.5;
  const wallM = pbr('lr_wallM', TEX.plaster_d, TEX.plaster_n, 3, 2, new BABYLON.Color3(0.28,0.24,0.30));
  const floorM = pbr('lr_floorM', TEX.wood_d, TEX.wood_n, 5, 4, new BABYLON.Color3(0.35,0.25,0.16));
  const ceilM = pbr('lr_ceilM', TEX.beam_d, TEX.beam_n, 4, 3, new BABYLON.Color3(0.15,0.10,0.06));
  const woodM = pbr('lr_woodM', TEX.darkwood_d, TEX.darkwood_n, 3, 1, new BABYLON.Color3(0.3,0.22,0.12));

  const floor=BABYLON.MeshBuilder.CreateGround('lr_floor',{width:W,height:D,subdivisions:4},scene);
  floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('lr_ceil',{width:W,height:D},scene);
  ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function lrWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  lrWall('lr_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); lrWall('lr_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  lrWall('lr_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); lrWall('lr_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);

  [-5,-2,1,4].forEach(bx=>{ const b=BABYLON.MeshBuilder.CreateBox('lr_beam'+bx,{width:0.3,height:0.28,depth:D},scene); b.position.set(bx,H-0.16,0); const bm=mat('lr_bm'+bx); bm.diffuseColor=new BABYLON.Color3(0.16,0.08,0.04); b.material=bm; });

  // Large arched window (back wall) — moonlight
  const winM=mat('lr_winM'); winM.diffuseColor=new BABYLON.Color3(0.06,0.10,0.18); winM.emissiveColor=new BABYLON.Color3(0.08,0.14,0.24); winM.alpha=0.82;
  const winGlass=BABYLON.MeshBuilder.CreatePlane('lr_winGlass',{width:3.2,height:3.0},scene);
  winGlass.position.set(0,2.4,-D/2+0.08); winGlass.material=winM;
  const archM=mat('lr_archM'); archM.diffuseColor=new BABYLON.Color3(0.2,0.26,0.32);
  for(let a=0;a<8;a++){ const ang=(a/7)*Math.PI; const ax=Math.cos(ang)*1.5; const ay=3.9+Math.sin(ang)*0.5; const b=BABYLON.MeshBuilder.CreateBox('lr_archB'+a,{width:0.3,height:0.4,depth:0.3},scene); b.position.set(ax,ay,-D/2+0.1); b.material=archM; }
  [[0,2.4],[-0.8,2.4],[0.8,2.4]].forEach(([mx])=>{ const m=BABYLON.MeshBuilder.CreateBox('lr_mull'+mx,{width:0.04,height:3.0,depth:0.06},scene); m.position.set(mx,2.4,-D/2+0.1); m.material=archM; });

  // Fireplace (right wall)
  const fpX=W/2-0.15, fpZ=0;
  const fpM=pbr('lr_fpM',TEX.rock_d,TEX.rock_n,2,2,new BABYLON.Color3(0.3,0.36,0.4));
  [[fpZ-0.9],[fpZ+0.9]].forEach(([pz])=>{ const s=BABYLON.MeshBuilder.CreateBox('lr_fpSide',{width:0.28,height:2.6,depth:0.5},scene); s.position.set(fpX-0.14,1.3,pz); s.material=fpM; });
  const mantel=BABYLON.MeshBuilder.CreateBox('lr_mantel',{width:0.4,height:0.1,depth:2.2},scene); mantel.position.set(fpX-0.2,2.7,fpZ); mantel.material=woodM;
  const fbm=mat('lr_fbM'); fbm.diffuseColor=new BABYLON.Color3(0.04,0.02,0.01); fbm.emissiveColor=new BABYLON.Color3(0.02,0.01,0);
  const fb=BABYLON.MeshBuilder.CreateBox('lr_firebox',{width:0.1,height:1.2,depth:1.6},scene); fb.position.set(fpX,0.7,fpZ); fb.material=fbm;
  const emberM=mat('lr_emberM'); emberM.emissiveColor=new BABYLON.Color3(0.6,0.18,0.02);
  const embers=BABYLON.MeshBuilder.CreateBox('lr_embers',{width:0.05,height:0.03,depth:1.4},scene); embers.position.set(fpX-0.01,0.03,fpZ); embers.material=emberM;

  // Leather couch (left side)
  const couchM=mat('lr_couchM'); couchM.diffuseColor=new BABYLON.Color3(0.2,0.1,0.08); couchM.specularPower=8;
  const couchBase=BABYLON.MeshBuilder.CreateBox('lr_couch',{width:3.0,height:0.5,depth:1.2},scene); couchBase.position.set(-W/2+2.5,0.5,1); couchBase.material=couchM;
  const couchBack=BABYLON.MeshBuilder.CreateBox('lr_couchBack',{width:3.0,height:0.9,depth:0.2},scene); couchBack.position.set(-W/2+2.5,1.1,1-0.5); couchBack.material=couchM;

  // Round table (center)
  const tabletop=BABYLON.MeshBuilder.CreateCylinder('lr_table',{diameter:1.0,height:0.06,tessellation:16},scene); tabletop.position.set(0,0.75,0); tabletop.material=woodM;
  const tableleg=BABYLON.MeshBuilder.CreateCylinder('lr_tleg',{diameter:0.08,height:0.72,tessellation:8},scene); tableleg.position.set(0,0.36,0); tableleg.material=woodM;

  // Crystal ball (glowing)
  const cbM=mat('lr_cbM'); cbM.diffuseColor=new BABYLON.Color3(0.08,0.12,0.2); cbM.emissiveColor=new BABYLON.Color3(0.06,0.1,0.18); cbM.specularColor=new BABYLON.Color3(0.3,0.4,0.6); cbM.specularPower=64; cbM.alpha=0.7;
  const crystalBall=BABYLON.MeshBuilder.CreateSphere('lr_crystalBall',{diameter:0.45,segments:16},scene);
  crystalBall.position.set(-W/2+3.5,0.25,-2); crystalBall.material=cbM;

  // Pentacle inlay
  const pentM=mat('lr_pentM'); pentM.diffuseColor=new BABYLON.Color3(0.15,0.1,0.05); pentM.emissiveColor=new BABYLON.Color3(0.04,0.02,0.01);
  const pent=BABYLON.MeshBuilder.CreateDisc('lr_pent',{diameter:2.5,tessellation:5},scene); pent.position.set(0,0.02,0); pent.rotation.x=Math.PI/2; pent.material=pentM;

  // Bookshelf with specimen jars
  const bsX=4, bsZ=-D/2+0.15;
  const bsBack=BABYLON.MeshBuilder.CreateBox('lr_bsBack',{width:3.0,height:3.5,depth:0.3},scene); bsBack.position.set(bsX,1.75,bsZ); bsBack.material=woodM;
  for(let sh=0;sh<4;sh++){ const shelf=BABYLON.MeshBuilder.CreateBox('lr_bs'+sh,{width:2.8,height:0.06,depth:0.4},scene); shelf.position.set(bsX,0.4+sh*0.85,bsZ+0.05); shelf.material=woodM;
    for(let j=0;j<4;j++){ const jar=BABYLON.MeshBuilder.CreateCylinder('lr_jar'+sh+'_'+j,{diameterTop:0.08,diameterBottom:0.1,height:0.25,tessellation:10},scene); jar.position.set(bsX-1.0+j*0.65,0.55+sh*0.85,bsZ+0.1); const jm=mat('lr_jm'+sh+j); jm.diffuseColor=new BABYLON.Color3(0.3+Math.random()*0.3,0.2+Math.random()*0.2,0.1+Math.random()*0.1); jm.alpha=0.6; jar.material=jm; }
  }

  // Chandelier with dried herbs
  const chanY=H-0.5;
  const chanRing=BABYLON.MeshBuilder.CreateTorus('lr_chanRing',{diameter:1.5,thickness:0.04,tessellation:16},scene); chanRing.position.set(0,chanY,0); chanRing.material=mat('lr_chanM'); chanRing.material.diffuseColor=new BABYLON.Color3(0.12,0.1,0.08);
  for(let h=0;h<8;h++){ const ang=h/8*Math.PI*2; const hx=Math.cos(ang)*0.7, hz=Math.sin(ang)*0.7;
    const herb=BABYLON.MeshBuilder.CreateCylinder('lr_chanHerb'+h,{diameterTop:0.03,diameterBottom:0.08,height:0.3,tessellation:6},scene); herb.position.set(hx,chanY-0.2,hz); const hm=mat('lr_hm'+h); hm.diffuseColor=new BABYLON.Color3(0.25,0.3,0.12); herb.material=hm;
    const fl=BABYLON.MeshBuilder.CreateSphere('lr_cf'+h,{diameter:0.05,segments:6},scene); fl.position.set(hx,chanY+0.05,hz); fl.scaling.y=1.6; fl.material=emitM('lr_cfm'+h,1,0.62,0.12,1.0);
  }

  // Raven on windowsill
  const ravenM=mat('lr_ravenM'); ravenM.diffuseColor=new BABYLON.Color3(0.02,0.02,0.03);
  const ravenBody=BABYLON.MeshBuilder.CreateSphere('lr_raven',{diameter:0.25,segments:8},scene); ravenBody.position.set(1.2,1.0,-D/2+0.3); ravenBody.scaling.set(1.3,0.8,1); ravenBody.material=ravenM;
  const ravenHead=BABYLON.MeshBuilder.CreateSphere('lr_ravenHead',{diameter:0.1,segments:6},scene); ravenHead.position.set(1.35,1.12,-D/2+0.3); ravenHead.material=ravenM;

  // Lights
  const moonLight=new BABYLON.PointLight('lr_moonL',new BABYLON.Vector3(0,3,-D/2+1),scene);
  moonLight.diffuse=new BABYLON.Color3(0.25,0.35,0.55); moonLight.intensity=2.0; moonLight.range=20;
  const fireLight=new BABYLON.PointLight('lr_fireL',new BABYLON.Vector3(fpX-0.5,0.8,fpZ),scene);
  fireLight.diffuse=new BABYLON.Color3(1.0,0.5,0.15); fireLight.intensity=2.5; fireLight.range=14;
  const cbLight=new BABYLON.PointLight('lr_cbL',new BABYLON.Vector3(-W/2+3.5,0.4,-2),scene);
  cbLight.diffuse=new BABYLON.Color3(0.1,0.2,0.5); cbLight.intensity=0.6; cbLight.range=5;
  const ambient=new BABYLON.HemisphericLight('lr_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.5; ambient.diffuse=new BABYLON.Color3(0.35,0.4,0.55); ambient.groundColor=new BABYLON.Color3(0.15,0.08,0.06);
  const chanLight=new BABYLON.PointLight('lr_chanL',new BABYLON.Vector3(0,chanY-0.5,0),scene);
  chanLight.diffuse=new BABYLON.Color3(0.6,0.5,0.3); chanLight.intensity=1.0; chanLight.range=12;

  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    fireLight.intensity=flk(2.5,0.5,3.7,1.2);
    chanLight.intensity=flk(1.0,0.15,2.1,0);
    if(embers) embers.material.emissiveColor=new BABYLON.Color3(flk(0.6,0.15,3.7,0.5),flk(0.18,0.06,3.7,1.0),0.02);
    if(crystalBall) crystalBall.material.emissiveColor=new BABYLON.Color3(0.04,flk(0.1,0.04,1.5,2),flk(0.18,0.06,1.5,3));
  });

  interactables.set('lr_crystalBall','crystalball');
  interactables.set('lr_raven','raven'); interactables.set('lr_ravenHead','raven');
  interactables.set('lr_table','tea');
  interactables.set('lr_bsBack','bookshelf');
  interactables.set('lr_embers','fireplace'); interactables.set('lr_firebox','fireplace'); interactables.set('lr_mantel','fireplace');

  const doorE=BABYLON.MeshBuilder.CreateBox('door_entrance',{width:1.4,height:2.4,depth:0.1},scene); doorE.position.set(0,1.2,D/2-0.05); const deM=mat('lr_deM'); deM.alpha=0.01; doorE.material=deM;
  interactables.set('door_entrance','door_entrance');
  const doorK=BABYLON.MeshBuilder.CreateBox('door_kitchen',{width:0.1,height:2.4,depth:1.4},scene); doorK.position.set(W/2-0.05,1.2,-3); const dkM=mat('lr_dkM'); dkM.alpha=0.01; doorK.material=dkM;
  interactables.set('door_kitchen','door_kitchen');
}

// ─── KITCHEN ──────────────────────────────────────────────────────────────────
function buildKitchen(){
  const W=14, D=12, H=4.0;
  const wallM = pbr('k_wallM', TEX.mstone_d, TEX.mstone_n, 2, 2, new BABYLON.Color3(0.25,0.28,0.30));
  const floorM = pbr('k_floorM', TEX.stone_d, TEX.stone_n, 4, 3, new BABYLON.Color3(0.22,0.24,0.26));
  const ceilM = pbr('k_ceilM', TEX.beam_d, TEX.beam_n, 3, 3, new BABYLON.Color3(0.14,0.09,0.05));
  const woodM = pbr('k_woodM', TEX.darkwood_d, TEX.darkwood_n, 3, 2, new BABYLON.Color3(0.3,0.22,0.12));

  const floor=BABYLON.MeshBuilder.CreateGround('k_floor',{width:W,height:D,subdivisions:4},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('k_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function kWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  kWall('k_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); kWall('k_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  kWall('k_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); kWall('k_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
  [-4,-1,2].forEach(bx=>{ const b=BABYLON.MeshBuilder.CreateBox('k_beam'+bx,{width:0.28,height:0.26,depth:D},scene); b.position.set(bx,H-0.14,0); const bm=mat('k_bm'+bx); bm.diffuseColor=new BABYLON.Color3(0.14,0.07,0.03); b.material=bm; });

  // Stone hearth with cauldron
  const hearthM=pbr('k_hearthM',TEX.rock_d,TEX.rock_n,2,2,new BABYLON.Color3(0.28,0.32,0.35));
  const hearth=BABYLON.MeshBuilder.CreateBox('k_hearth',{width:3.5,height:2.8,depth:0.8},scene); hearth.position.set(0,1.4,-D/2+0.4); hearth.material=hearthM;
  for(let a=0;a<6;a++){ const ang=(a/5)*Math.PI; const ax=Math.cos(ang)*1.2; const ay=2.5+Math.sin(ang)*0.5; const b=BABYLON.MeshBuilder.CreateBox('k_hArch'+a,{width:0.28,height:0.35,depth:0.4},scene); b.position.set(ax,ay,-D/2+0.4); b.material=hearthM; }
  const cauldM=mat('k_cauldM'); cauldM.diffuseColor=new BABYLON.Color3(0.08,0.06,0.08);
  const cauldron=BABYLON.MeshBuilder.CreateSphere('k_cauldron',{diameter:0.8,segments:12},scene); cauldron.position.set(0,0.35,-D/2+0.5); cauldron.scaling.y=0.7; cauldron.material=cauldM;
  const brewM=mat('k_brewM'); brewM.emissiveColor=new BABYLON.Color3(0.05,0.4,0.15); brewM.alpha=0.75;
  const brew=BABYLON.MeshBuilder.CreateDisc('k_brew',{radius:0.3,tessellation:16},scene); brew.position.set(0,0.55,-D/2+0.5); brew.rotation.x=Math.PI/2; brew.material=brewM;
  const smokeM=mat('k_smokeM'); smokeM.diffuseColor=new BABYLON.Color3(0.08,0.15,0.08); smokeM.emissiveColor=new BABYLON.Color3(0.03,0.08,0.03); smokeM.alpha=0.1;
  const smoke=BABYLON.MeshBuilder.CreateCylinder('k_smoke',{diameterTop:0.5,diameterBottom:0.1,height:1.5,tessellation:8},scene); smoke.position.set(0,1.3,-D/2+0.5); smoke.material=smokeM;

  // Copper pot rack
  const rackM=mat('k_rackM'); rackM.diffuseColor=new BABYLON.Color3(0.3,0.18,0.08); rackM.specularColor=new BABYLON.Color3(0.3,0.2,0.1);
  const rackBar=BABYLON.MeshBuilder.CreateBox('k_rack',{width:3.5,height:0.06,depth:0.06},scene); rackBar.position.set(0,H-0.6,0); rackBar.material=rackM;
  for(let p=0;p<5;p++){ const px=-1.5+p*0.75;
    const pan=BABYLON.MeshBuilder.CreateCylinder('k_pan'+p,{diameterTop:0.3,diameterBottom:0.25,height:0.12,tessellation:12},scene); pan.position.set(px,H-0.9,0); pan.material=rackM;
    const hook=BABYLON.MeshBuilder.CreateCylinder('k_hook'+p,{diameter:0.01,height:0.3,tessellation:4},scene); hook.position.set(px,H-0.75,0); hook.material=rackM;
  }

  // Leaded window
  const winM=mat('k_winM'); winM.diffuseColor=new BABYLON.Color3(0.06,0.10,0.18); winM.emissiveColor=new BABYLON.Color3(0.06,0.12,0.2); winM.alpha=0.82;
  const win=BABYLON.MeshBuilder.CreatePlane('k_win',{width:2.0,height:2.4},scene); win.position.set(-W/2+0.08,2.0,0); win.rotation.y=Math.PI/2; win.material=winM;
  for(let h=0;h<3;h++){ const herb=BABYLON.MeshBuilder.CreateCylinder('k_winHerb'+h,{diameterTop:0.03,diameterBottom:0.06,height:0.25,tessellation:6},scene); herb.position.set(-W/2+0.15,0.85,-0.5+h*0.5); const hm=mat('k_whm'+h); hm.diffuseColor=new BABYLON.Color3(0.25,0.3,0.12); herb.material=hm; }

  // Butcher's block
  const blockM=pbr('k_blockM',TEX.wood_d,TEX.wood_n,2,1,new BABYLON.Color3(0.32,0.24,0.14));
  const block=BABYLON.MeshBuilder.CreateBox('k_block',{width:1.5,height:0.9,depth:1.0},scene); block.position.set(W/2-2,0.45,1); block.material=blockM;
  const cleaverM=mat('k_cleaverM'); cleaverM.diffuseColor=new BABYLON.Color3(0.3,0.28,0.3); cleaverM.specularColor=new BABYLON.Color3(0.5,0.5,0.5);
  const cleaver=BABYLON.MeshBuilder.CreateBox('k_cleaver',{width:0.04,height:0.25,depth:0.15},scene); cleaver.position.set(W/2-2,0.95,0.8); cleaver.material=cleaverM;
  for(let k=0;k<4;k++){ const knife=BABYLON.MeshBuilder.CreateBox('k_knife'+k,{width:0.02,height:0.02,depth:0.2},scene); knife.position.set(W/2-2-0.4+k*0.25,0.92,1.1); knife.material=cleaverM; }

  // Spice shelves
  for(let s=0;s<3;s++){ const shelf=BABYLON.MeshBuilder.CreateBox('k_spice'+s,{width:2.5,height:0.05,depth:0.25},scene); shelf.position.set(W/2-2.5,1.0+s*0.5,-D/2+0.15); shelf.material=woodM;
    for(let j=0;j<6;j++){ const jar=BABYLON.MeshBuilder.CreateCylinder('k_sjar'+s+'_'+j,{diameterTop:0.04,diameterBottom:0.05,height:0.15,tessellation:8},scene); jar.position.set(W/2-3.2+j*0.4,1.1+s*0.5,-D/2+0.2); const jm=mat('k_sjm'+s+j); jm.diffuseColor=new BABYLON.Color3(0.3+Math.random()*0.3,0.15+Math.random()*0.15,0.05+Math.random()*0.1); jar.material=jm; }
  }

  // Red rug
  const rugM=mat('k_rugM'); rugM.diffuseColor=new BABYLON.Color3(0.35,0.08,0.06);
  const rug=BABYLON.MeshBuilder.CreateGround('k_rug',{width:3.0,height:4.0,subdivisions:2},scene); rug.position.set(0,0.01,2); rug.material=rugM;

  // Hanging garlic
  [[-3,-3],[3,-3],[-3,3],[3,3]].forEach(([gx,gz],gi)=>{ const g=BABYLON.MeshBuilder.CreateCylinder('k_garlic'+gi,{diameterTop:0.04,diameterBottom:0.15,height:0.4,tessellation:8},scene); g.position.set(gx,H-0.4,gz); const gm=mat('k_gm'+gi); gm.diffuseColor=new BABYLON.Color3(0.28,0.24,0.16); g.material=gm; });

  // Lights
  const hearthLight=new BABYLON.PointLight('k_hL',new BABYLON.Vector3(0,0.8,-D/2+0.5),scene);
  hearthLight.diffuse=new BABYLON.Color3(0.1,0.6,0.2); hearthLight.intensity=1.5; hearthLight.range=10;
  const winLight=new BABYLON.PointLight('k_wL',new BABYLON.Vector3(-W/2+1,2.5,0),scene);
  winLight.diffuse=new BABYLON.Color3(0.2,0.3,0.5); winLight.intensity=1.0; winLight.range=12;
  const ambient=new BABYLON.HemisphericLight('k_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.4; ambient.diffuse=new BABYLON.Color3(0.3,0.35,0.4); ambient.groundColor=new BABYLON.Color3(0.1,0.08,0.05);

  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    hearthLight.intensity=flk(1.5,0.3,2.5,0.5);
    if(brew) brew.material.emissiveColor=new BABYLON.Color3(0.03,flk(0.4,0.1,1.8,2),0.12);
    if(smoke) { smoke.rotation.y=ft*0.3; smoke.position.y=1.3+Math.sin(ft*0.5)*0.1; }
  });

  interactables.set('k_cauldron','cauldron'); interactables.set('k_brew','cauldron');
  interactables.set('k_hearth','fireplace');
  interactables.set('k_garlic0','herbs_dried'); interactables.set('k_garlic1','herbs_dried');

  const doorE=BABYLON.MeshBuilder.CreateBox('door_entrance',{width:1.4,height:2.4,depth:0.1},scene); doorE.position.set(0,1.2,D/2-0.05); const deM=mat('k_deM'); deM.alpha=0.01; doorE.material=deM;
  interactables.set('door_entrance','door_entrance');
  const doorP=BABYLON.MeshBuilder.CreateBox('door_pantry',{width:1.2,height:2.4,depth:0.1},scene); doorP.position.set(-W/2+3,1.2,-D/2+0.05); const dpM=mat('k_dpM'); dpM.alpha=0.01; doorP.material=dpM;
  interactables.set('door_pantry','door_pantry');
}

// ─── LIBRARY ──────────────────────────────────────────────────────────────────
function buildLibrary(){
  const W=16, D=14, H=5.0;
  const wallM = pbr('lib_wallM', TEX.plaster_d, TEX.plaster_n, 3, 2, new BABYLON.Color3(0.26,0.22,0.28));
  const floorM = pbr('lib_floorM', TEX.wood_d, TEX.wood_n, 4, 4, new BABYLON.Color3(0.3,0.22,0.14));
  const ceilM = pbr('lib_ceilM', TEX.beam_d, TEX.beam_n, 4, 3, new BABYLON.Color3(0.14,0.09,0.05));
  const woodM = pbr('lib_woodM', TEX.darkwood_d, TEX.darkwood_n, 3, 2, new BABYLON.Color3(0.28,0.2,0.1));

  const floor=BABYLON.MeshBuilder.CreateGround('lib_floor',{width:W,height:D,subdivisions:4},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('lib_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function libWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  libWall('lib_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); libWall('lib_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  libWall('lib_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); libWall('lib_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
  [-6,-3,0,3,6].forEach(bx=>{ const b=BABYLON.MeshBuilder.CreateBox('lib_beam'+bx,{width:0.3,height:0.28,depth:D},scene); b.position.set(bx,H-0.16,0); const bm=mat('lib_bm'+bx); bm.diffuseColor=new BABYLON.Color3(0.16,0.08,0.04); b.material=bm; });

  // Display cases with skulls
  for(let dc=0;dc<5;dc++){ const dx=-5+dc*2.5;
    const caseBox=BABYLON.MeshBuilder.CreateBox('lib_dc'+dc,{width:1.0,height:2.0,depth:0.5},scene); caseBox.position.set(dx,1.0,-D/2+0.3); caseBox.material=woodM;
    const glassM=mat('lib_glassM'); glassM.diffuseColor=new BABYLON.Color3(0.05,0.08,0.1); glassM.alpha=0.3;
    const glass=BABYLON.MeshBuilder.CreatePlane('lib_dg'+dc,{width:0.9,height:1.9},scene); glass.position.set(dx,1.0,-D/2+0.55); glass.material=glassM;
    const skullM=mat('lib_skullM'); skullM.diffuseColor=new BABYLON.Color3(0.6,0.55,0.45);
    const skull=BABYLON.MeshBuilder.CreateSphere('lib_skull'+dc,{diameter:0.2,segments:8},scene); skull.position.set(dx,1.0,-D/2+0.3); skull.scaling.y=1.2; skull.material=skullM;
  }

  // Diagonal staircase
  const STS=10, SY=H*0.5/STS, SZ=0.35, SX=2.5;
  const soX=-W/2+3, soZ=D/2-1;
  for(let s=0;s<STS;s++){ const tread=BABYLON.MeshBuilder.CreateBox('lib_tread'+s,{width:SX,height:0.05,depth:SZ},scene); tread.position.set(soX+s*0.4,s*SY+0.05,soZ-s*SZ); tread.material=woodM;
    const riser=BABYLON.MeshBuilder.CreateBox('lib_riser'+s,{width:SX,height:SY,depth:0.03},scene); riser.position.set(soX+s*0.4,s*SY+SY/2,soZ-s*SZ+SZ/2); riser.material=woodM; }

  // Leather wingback chair
  const chairM=mat('lib_chairM'); chairM.diffuseColor=new BABYLON.Color3(0.15,0.08,0.06); chairM.specularPower=8;
  const chairBase=BABYLON.MeshBuilder.CreateBox('lib_chair',{width:0.8,height:0.45,depth:0.8},scene); chairBase.position.set(W/2-2,0.45,-2); chairBase.material=chairM;
  const chairBack=BABYLON.MeshBuilder.CreateBox('lib_chairBack',{width:0.8,height:1.0,depth:0.15},scene); chairBack.position.set(W/2-2,1.0,-2-0.35); chairBack.material=chairM;

  // Red rug
  const rugM=mat('lib_rugM'); rugM.diffuseColor=new BABYLON.Color3(0.32,0.06,0.04);
  const rug=BABYLON.MeshBuilder.CreateGround('lib_rug',{width:3.5,height:4.5,subdivisions:2},scene); rug.position.set(W/2-2,0.01,-1.5); rug.material=rugM;

  // Owl with glowing eyes
  const owlM=mat('lib_owlM'); owlM.diffuseColor=new BABYLON.Color3(0.3,0.25,0.15);
  const owlBody=BABYLON.MeshBuilder.CreateSphere('lib_owl',{diameter:0.25,segments:8},scene); owlBody.position.set(-W/2+0.5,3.5,2); owlBody.scaling.set(0.8,1.2,0.8); owlBody.material=owlM;
  const owlHead=BABYLON.MeshBuilder.CreateSphere('lib_owlH',{diameter:0.15,segments:8},scene); owlHead.position.set(-W/2+0.5,3.75,2); owlHead.material=owlM;
  [[-0.04],[0.04]].forEach(([ex])=>{ const e=BABYLON.MeshBuilder.CreateSphere('lib_owlE',{diameter:0.04,segments:6},scene); e.position.set(-W/2+0.5+ex,3.78,2+0.06); e.material=emitM('lib_owlEm',0.8,0.75,0.3,0.7); });

  // Broom on wall
  const broomM=mat('lib_broomM'); broomM.diffuseColor=new BABYLON.Color3(0.2,0.14,0.06);
  const broomHandle=BABYLON.MeshBuilder.CreateCylinder('lib_broomHandle',{diameterTop:0.03,diameterBottom:0.04,height:2.0,tessellation:8},scene); broomHandle.position.set(W/2-0.3,2.5,-4); broomHandle.rotation.z=Math.PI/2+0.3; broomHandle.material=broomM;
  const broomStraw=BABYLON.MeshBuilder.CreateCylinder('lib_broomStraw',{diameterTop:0.04,diameterBottom:0.12,height:0.4,tessellation:8},scene); broomStraw.position.set(W/2-0.7,2.3,-4); broomStraw.rotation.z=Math.PI/2+0.3; broomStraw.material=broomM;

  // Locked cage
  const cageM=mat('lib_cageM'); cageM.diffuseColor=new BABYLON.Color3(0.12,0.1,0.08);
  const cage=BABYLON.MeshBuilder.CreateBox('lib_cage',{width:0.8,height:1.2,depth:0.4},scene); cage.position.set(3,2.5,D/2-0.25); cage.material=cageM;

  // Floating magic wisps
  const wisps=[];
  for(let w=0;w<5;w++){ const wp=BABYLON.MeshBuilder.CreateSphere('lib_wisp'+w,{diameter:0.15,segments:6},scene); wp.position.set((Math.random()-0.5)*W*0.6, 2+Math.random()*2, (Math.random()-0.5)*D*0.6); wp.material=emitM('lib_wm'+w,0.3,0.8,0.5,0.5); wp.material.alpha=0.4; wisps.push(wp); }

  // Lights
  const ambient=new BABYLON.HemisphericLight('lib_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.4; ambient.diffuse=new BABYLON.Color3(0.3,0.38,0.48); ambient.groundColor=new BABYLON.Color3(0.12,0.06,0.05);
  const winLight=new BABYLON.PointLight('lib_wL',new BABYLON.Vector3(0,3,-D/2+1),scene);
  winLight.diffuse=new BABYLON.Color3(0.25,0.35,0.55); winLight.intensity=1.5; winLight.range=20;
  const candleLight=new BABYLON.PointLight('lib_cL',new BABYLON.Vector3(W/2-2,1.5,-2),scene);
  candleLight.diffuse=new BABYLON.Color3(0.7,0.5,0.2); candleLight.intensity=0.8; candleLight.range=8;

  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    candleLight.intensity=flk(0.8,0.15,2.1,0);
    wisps.forEach((w,i)=>{ w.position.y+=Math.sin(ft*0.5+i*2)*0.003; w.material.emissiveColor=new BABYLON.Color3(flk(0.2,0.1,0.7+i,0),flk(0.5,0.15,0.5+i,1),flk(0.3,0.1,0.6+i,2)); });
  });

  interactables.set('lib_dc0','bookshelf'); interactables.set('lib_dc1','bookshelf');
  interactables.set('lib_owl','portrait'); interactables.set('lib_owlH','portrait');
  interactables.set('lib_cage','clock');
  interactables.set('lib_broomHandle','broom'); interactables.set('lib_broomStraw','broom');

  const doorE=BABYLON.MeshBuilder.CreateBox('door_entrance',{width:1.4,height:2.4,depth:0.1},scene); doorE.position.set(0,1.2,D/2-0.05); const deM=mat('lib_deM'); deM.alpha=0.01; doorE.material=deM;
  interactables.set('door_entrance','door_entrance');
  const doorA=BABYLON.MeshBuilder.CreateBox('door_attic',{width:1.2,height:2.4,depth:0.1},scene); doorA.position.set(soX+STS*0.2,1.2+STS*SY/2,soZ-STS*SZ+0.2); const daM=mat('lib_daM'); daM.alpha=0.01; doorA.material=daM;
  interactables.set('door_attic','door_attic');
  const doorBs=BABYLON.MeshBuilder.CreateBox('door_basement',{width:0.1,height:2.0,depth:1.0},scene); doorBs.position.set(-W/2+0.05,1.0,-D/2+3); const dbm2=mat('lib_dbm'); dbm2.alpha=0.01; doorBs.material=dbm2;
  interactables.set('door_basement','door_basement');
}

// ─── BATHROOM ──────────────────────────────────────────────────────────────────
function buildBathroom(){
  const W=6, D=5, H=3.5;
  const wallM = pbr('b_wallM', TEX.plaster_d, TEX.plaster_n, 2, 2, new BABYLON.Color3(0.20,0.22,0.24));
  const floorM = pbr('b_floorM', TEX.stone_d, TEX.stone_n, 3, 2, new BABYLON.Color3(0.15,0.18,0.20));
  const ceilM = mat('b_ceilM'); ceilM.diffuseColor=new BABYLON.Color3(0.1,0.12,0.14);

  const floor=BABYLON.MeshBuilder.CreateGround('b_floor',{width:W,height:D,subdivisions:2},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('b_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function bWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  bWall('b_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); bWall('b_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  bWall('b_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); bWall('b_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);

  // Bathtub
  const tubM=mat('b_tubM'); tubM.diffuseColor=new BABYLON.Color3(0.5,0.48,0.42);
  const tub=BABYLON.MeshBuilder.CreateBox('b_tub',{width:1.6,height:0.7,depth:0.8},scene); tub.position.set(0,0.35,-D/2+1.2); tub.material=tubM;
  const waterM=mat('b_waterM'); waterM.diffuseColor=new BABYLON.Color3(0.08,0.1,0.06); waterM.alpha=0.6;
  const water=BABYLON.MeshBuilder.CreateBox('b_water',{width:1.4,height:0.02,depth:0.6},scene); water.position.set(0,0.65,-D/2+1.2); water.material=waterM;

  // Sink + cracked mirror
  const sink=BABYLON.MeshBuilder.CreateBox('b_sink',{width:0.6,height:0.4,depth:0.4},scene); sink.position.set(W/2-0.5,0.8,-D/2+2.5); sink.material=tubM;
  const mirM=mat('b_mirM'); mirM.diffuseColor=new BABYLON.Color3(0.08,0.08,0.1); mirM.emissiveColor=new BABYLON.Color3(0.01,0.01,0.02);
  const mirror=BABYLON.MeshBuilder.CreatePlane('b_mirror',{width:0.5,height:0.7},scene); mirror.position.set(W/2-0.5,1.3,-D/2+2.5+0.21); mirror.material=mirM;

  // Spider webs
  const webM=mat('b_webM'); webM.diffuseColor=new BABYLON.Color3(0.35,0.32,0.28); webM.alpha=0.2;
  [[-W/2+0.1,0,0],[W/2-0.1,0,Math.PI/2],[-W/2+0.1,0,-Math.PI/2],[W/2-0.1,0,Math.PI]].forEach(([cx,cz,ry],i)=>{
    const web=BABYLON.MeshBuilder.CreatePlane('b_web'+i,{width:2.0,height:1.8},scene); web.position.set(cx,H-0.8,cz); web.rotation.y=ry; web.material=webM.clone('b_wm'+i);
  });

  // Giant spider
  const spiderM=mat('b_spiderM'); spiderM.diffuseColor=new BABYLON.Color3(0.05,0.04,0.03);
  const spiderBody=BABYLON.MeshBuilder.CreateSphere('b_spider',{diameter:0.15,segments:8},scene); spiderBody.position.set(-W/2+0.3,H-0.8,-D/2+0.3); spiderBody.scaling.set(1,0.6,1); spiderBody.material=spiderM;
  for(let l=0;l<8;l++){ const ang=l/8*Math.PI*2; const leg=BABYLON.MeshBuilder.CreateCylinder('b_leg'+l,{diameterTop:0.01,diameterBottom:0.02,height:0.4,tessellation:4},scene); leg.position.set(-W/2+0.3+Math.cos(ang)*0.15,H-0.8,-D/2+0.3+Math.sin(ang)*0.15); leg.rotation.x=Math.sin(ang)*0.5; leg.rotation.z=Math.cos(ang)*0.5; leg.material=spiderM; }

  // Dim lights
  const ambient=new BABYLON.HemisphericLight('b_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.25; ambient.diffuse=new BABYLON.Color3(0.2,0.25,0.3); ambient.groundColor=new BABYLON.Color3(0.08,0.06,0.05);
  const dimLight=new BABYLON.PointLight('b_dim',new BABYLON.Vector3(W/2-1,2,-D/2+2),scene);
  dimLight.diffuse=new BABYLON.Color3(0.15,0.15,0.18); dimLight.intensity=0.5; dimLight.range=8;

  interactables.set('b_spider','spider'); interactables.set('b_leg0','spider');
  interactables.set('b_mirror','mirror');

  const doorE=BABYLON.MeshBuilder.CreateBox('door_entrance',{width:1.0,height:2.2,depth:0.1},scene); doorE.position.set(0,1.1,D/2-0.05); const deM=mat('b_deM'); deM.alpha=0.01; doorE.material=deM;
  interactables.set('door_entrance','door_entrance');
}

// ─── PANTRY ────────────────────────────────────────────────────────────────────
function buildPantry(){
  const W=10, D=8, H=3.8;
  const wallM = pbr('p_wallM', TEX.mstone_d, TEX.mstone_n, 2, 2, new BABYLON.Color3(0.22,0.25,0.27));
  const floorM = pbr('p_floorM', TEX.stone_d, TEX.stone_n, 3, 2, new BABYLON.Color3(0.18,0.2,0.22));
  const woodM = pbr('p_woodM', TEX.darkwood_d, TEX.darkwood_n, 2, 2, new BABYLON.Color3(0.28,0.2,0.1));

  const floor=BABYLON.MeshBuilder.CreateGround('p_floor',{width:W,height:D,subdivisions:3},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceilM=mat('p_ceilM'); ceilM.diffuseColor=new BABYLON.Color3(0.1,0.08,0.06); const ceil=BABYLON.MeshBuilder.CreatePlane('p_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function pWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  pWall('p_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); pWall('p_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  pWall('p_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); pWall('p_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);

  // Specimen jar grid
  for(let row=0;row<3;row++){ for(let col=0;col<6;col++){ const jx=-W/2+1+col*1.5; const jy=1.0+row*0.8;
    const jar=BABYLON.MeshBuilder.CreateCylinder('p_jar'+row+col,{diameterTop:0.12,diameterBottom:0.15,height:0.5,tessellation:10},scene); jar.position.set(jx,jy+0.25,-D/2+0.3); const jm=mat('p_jm'+row+col);
    const cols=[[0.2,0.3,0.15],[0.3,0.2,0.1],[0.15,0.25,0.3],[0.25,0.15,0.1]]; const c=cols[(row*6+col)%4]; jm.diffuseColor=new BABYLON.Color3(c[0],c[1],c[2]); jm.alpha=0.65; jar.material=jm;
    const lid=BABYLON.MeshBuilder.CreateCylinder('p_lid'+row+col,{diameter:0.14,height:0.05,tessellation:10},scene); lid.position.set(jx,jy+0.55,-D/2+0.3); lid.material=woodM;
  }}
  for(let row=0;row<3;row++){ const shelf=BABYLON.MeshBuilder.CreateBox('p_shelf'+row,{width:W-1,height:0.04,depth:0.3},scene); shelf.position.set(0,0.95+row*0.8,-D/2+0.3); shelf.material=woodM; }

  // Leaded window
  const winM=mat('p_winM'); winM.diffuseColor=new BABYLON.Color3(0.06,0.1,0.18); winM.emissiveColor=new BABYLON.Color3(0.06,0.12,0.2); winM.alpha=0.82;
  const win=BABYLON.MeshBuilder.CreatePlane('p_win',{width:1.5,height:2.0},scene); win.position.set(-W/2+0.08,2.0,0); win.rotation.y=Math.PI/2; win.material=winM;

  // Storage chest
  const chest=BABYLON.MeshBuilder.CreateBox('p_chest',{width:2.5,height:1.0,depth:0.8},scene); chest.position.set(W/2-2,0.5,1); chest.material=woodM;

  // Burlap sacks
  [[0,1],[0.6,1.5]].forEach(([sx,sz])=>{ const s=BABYLON.MeshBuilder.CreateSphere('p_sack',{diameter:0.4,segments:8},scene); s.position.set(sx,0.25,sz); s.scaling.set(1,1.2,1); const sm=mat('p_sackM'); sm.diffuseColor=new BABYLON.Color3(0.28,0.24,0.16); s.material=sm; });

  // Wicker baskets
  [[-3,2],[-3,-1],[3,-2]].forEach(([bx,bz])=>{ const b=BABYLON.MeshBuilder.CreateCylinder('p_basket',{diameter:0.4,height:0.35,tessellation:10},scene); b.position.set(bx,0.18,bz); const bm=mat('p_basketM'); bm.diffuseColor=new BABYLON.Color3(0.35,0.28,0.15); b.material=bm; });

  // Green glow
  const glowM=emitM('p_glowM',0.1,0.5,0.2,0.4); glowM.alpha=0.5;
  const glow=BABYLON.MeshBuilder.CreateSphere('p_glow',{diameter:0.15,segments:8},scene); glow.position.set(W/2-2,1.15,0.8); glow.material=glowM;

  // Lights
  const ambient=new BABYLON.HemisphericLight('p_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.3; ambient.diffuse=new BABYLON.Color3(0.25,0.3,0.35); ambient.groundColor=new BABYLON.Color3(0.1,0.08,0.05);
  const winLight=new BABYLON.PointLight('p_wL',new BABYLON.Vector3(-W/2+1,2,0),scene);
  winLight.diffuse=new BABYLON.Color3(0.2,0.3,0.5); winLight.intensity=0.8; winLight.range=10;
  const glowLight=new BABYLON.PointLight('p_gL',new BABYLON.Vector3(W/2-2,1.2,0.8),scene);
  glowLight.diffuse=new BABYLON.Color3(0.1,0.5,0.2); glowLight.intensity=0.6; glowLight.range=5;

  let ft=0;
  scene.registerBeforeRender(()=>{ ft+=engine.getDeltaTime()*0.001; glowLight.intensity=0.4+Math.sin(ft*1.5)*0.15; if(glow) glow.material.emissiveColor=new BABYLON.Color3(0.05,0.3+Math.sin(ft*1.5)*0.1,0.1); });

  interactables.set('p_jar00','jars'); interactables.set('p_jar11','jars');
  interactables.set('p_glow','crystalball');

  const doorK=BABYLON.MeshBuilder.CreateBox('door_kitchen',{width:1.2,height:2.2,depth:0.1},scene); doorK.position.set(0,1.1,D/2-0.05); const dkM=mat('p_dkM'); dkM.alpha=0.01; doorK.material=dkM;
  interactables.set('door_kitchen','door_kitchen');
  const doorBs=BABYLON.MeshBuilder.CreateBox('door_basement',{width:1.0,height:2.0,depth:0.1},scene); doorBs.position.set(W/2-0.5,1.0,-D/2+0.05); const dbM=mat('p_dbM'); dbM.alpha=0.01; doorBs.material=dbM;
  interactables.set('door_basement','door_basement');
}

// ─── BASEMENT ──────────────────────────────────────────────────────────────────
function buildBasement(){
  const W=14, D=12, H=4.0;
  const wallM = pbr('bs_wallM', TEX.rock_d, TEX.rock_n, 3, 2, new BABYLON.Color3(0.15,0.12,0.14));
  const floorM = pbr('bs_floorM', TEX.wood_d, TEX.wood_n, 4, 3, new BABYLON.Color3(0.15,0.1,0.06));
  const ceilM = pbr('bs_ceilM', TEX.stone_d, TEX.stone_n, 3, 2, new BABYLON.Color3(0.1,0.08,0.1));

  const floor=BABYLON.MeshBuilder.CreateGround('bs_floor',{width:W,height:D,subdivisions:4},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('bs_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function bsWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  bsWall('bs_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); bsWall('bs_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  bsWall('bs_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); bsWall('bs_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);

  // Domed leaded window
  const winM=mat('bs_winM'); winM.diffuseColor=new BABYLON.Color3(0.04,0.1,0.06); winM.emissiveColor=new BABYLON.Color3(0.06,0.16,0.08); winM.alpha=0.82;
  const win=BABYLON.MeshBuilder.CreatePlane('bs_win',{width:2.0,height:2.5},scene); win.position.set(0,2.5,-D/2+0.08); win.material=winM;
  const archM=mat('bs_archM'); archM.diffuseColor=new BABYLON.Color3(0.12,0.14,0.12);
  for(let a=0;a<7;a++){ const ang=(a/6)*Math.PI; const ax=Math.cos(ang)*0.9; const ay=3.75+Math.sin(ang)*0.4; const b=BABYLON.MeshBuilder.CreateBox('bs_arch'+a,{width:0.25,height:0.35,depth:0.3},scene); b.position.set(ax,ay,-D/2+0.1); b.material=archM; }

  // Copper alchemy still
  const copperM=mat('bs_copperM'); copperM.diffuseColor=new BABYLON.Color3(0.3,0.15,0.06); copperM.specularColor=new BABYLON.Color3(0.3,0.2,0.1); copperM.specularPower=32;
  const glassM=mat('bs_glassM'); glassM.diffuseColor=new BABYLON.Color3(0.05,0.1,0.06); glassM.emissiveColor=new BABYLON.Color3(0.04,0.15,0.08); glassM.alpha=0.5;
  const flask=BABYLON.MeshBuilder.CreateSphere('bs_flask',{diameter:0.5,segments:12},scene); flask.position.set(-3,0.6,-1); flask.material=glassM;
  const tube=BABYLON.MeshBuilder.CreateCylinder('bs_tube',{diameter:0.05,height:1.5,tessellation:8},scene); tube.position.set(-3,1.3,-1); tube.material=copperM;
  const bulb=BABYLON.MeshBuilder.CreateSphere('bs_bulb',{diameter:0.25,segments:10},scene); bulb.position.set(-3,2.1,-1); bulb.material=glassM;
  const arm=BABYLON.MeshBuilder.CreateCylinder('bs_arm',{diameter:0.04,height:0.8,tessellation:8},scene); arm.position.set(-2.7,2.1,-1); arm.rotation.z=Math.PI/2; arm.material=copperM;
  const cFlask=BABYLON.MeshBuilder.CreateSphere('bs_cflask',{diameter:0.3,segments:10},scene); cFlask.position.set(-2.3,1.8,-1); cFlask.material=glassM;
  const stand=BABYLON.MeshBuilder.CreateCylinder('bs_stand',{diameter:0.3,height:0.4,tessellation:10},scene); stand.position.set(-3,0.2,-1); stand.material=copperM;
  const heatM=emitM('bs_heatM',0.8,0.3,0.05,0.7);
  const heat=BABYLON.MeshBuilder.CreateSphere('bs_heat',{diameter:0.1,segments:6},scene); heat.position.set(-3,0.15,-1); heat.material=heatM;

  // Workbench
  const benchM=pbr('bs_benchM',TEX.darkwood_d,TEX.darkwood_n,2,1,new BABYLON.Color3(0.25,0.18,0.1));
  const bench=BABYLON.MeshBuilder.CreateBox('bs_bench',{width:2.5,height:0.9,depth:1.0},scene); bench.position.set(3,0.45,-3); bench.material=benchM;

  // Pentagram
  const pentM=mat('bs_pentM'); pentM.diffuseColor=new BABYLON.Color3(0.08,0.03,0.03); pentM.emissiveColor=new BABYLON.Color3(0.06,0.01,0.01);
  const pent=BABYLON.MeshBuilder.CreateDisc('bs_pent',{diameter:3.0,tessellation:5},scene); pent.position.set(0,0.02,1); pent.rotation.x=Math.PI/2; pent.material=pentM;
  const lineM=emitM('bs_lineM',0.4,0.05,0.02,0.5);
  for(let i=0;i<5;i++){ const a1=i/5*Math.PI*2-Math.PI/2; const a2=(i+2)/5*Math.PI*2-Math.PI/2; const r=1.3;
    const x1=Math.cos(a1)*r, z1=Math.sin(a1)*r, x2=Math.cos(a2)*r, z2=Math.sin(a2)*r;
    const lx=(x1+x2)/2, lz=(z1+z2)/2; const len=Math.sqrt((x2-x1)**2+(z2-z1)**2); const ang=Math.atan2(z2-z1,x2-x1);
    const line=BABYLON.MeshBuilder.CreateBox('bs_pline'+i,{width:len,height:0.02,depth:0.04},scene); line.position.set(lx,0.03,1+lz); line.rotation.y=-ang; line.material=lineM;
  }

  // Scattered bones
  [[1,2.5],[2,3],[1.5,2],[0.5,3.5]].forEach(([bx,bz])=>{ const bone=BABYLON.MeshBuilder.CreateCylinder('bs_bone',{diameterTop:0.02,diameterBottom:0.03,height:0.2,tessellation:6},scene); bone.position.set(bx,0.02,bz); bone.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI); const bm=mat('bs_boneM'); bm.diffuseColor=new BABYLON.Color3(0.4,0.35,0.25); bone.material=bm; });

  // Crates
  [[-5,-4],[-4.2,-4]].forEach(([cx,cz],ci)=>{ const crate=BABYLON.MeshBuilder.CreateBox('bs_crate'+ci,{width:0.7,height:0.7,depth:0.7},scene); crate.position.set(cx,0.35,cz); const cm=mat('bs_crateM'); cm.diffuseColor=new BABYLON.Color3(0.2,0.14,0.08); crate.material=cm; });

  // Stone archway to specimen nook
  for(let a=0;a<7;a++){ const ang=(a/6)*Math.PI; const ay=0.5+Math.sin(ang)*1.2; const az=-2+Math.cos(ang)*1.0; const b=BABYLON.MeshBuilder.CreateBox('bs_sArch'+a,{width:0.25,height:0.35,depth:0.3},scene); b.position.set(-W/2+0.15,ay,az); b.material=wallM; }
  for(let s=0;s<2;s++){ const shelf=BABYLON.MeshBuilder.CreateBox('bs_nShelf'+s,{width:0.8,height:0.04,depth:0.3},scene); shelf.position.set(-W/2+0.5,1.0+s*0.6,-2); shelf.material=benchM;
    for(let j=0;j<3;j++){ const jar=BABYLON.MeshBuilder.CreateCylinder('bs_nJar'+s+j,{diameterTop:0.06,diameterBottom:0.08,height:0.18,tessellation:8},scene); jar.position.set(-W/2+0.5-0.2+j*0.2,1.1+s*0.6,-2); const jm=mat('bs_njm'+s+j); jm.diffuseColor=new BABYLON.Color3(0.2+Math.random()*0.2,0.1+Math.random()*0.1,0.05+Math.random()*0.05); jar.material=jm; }
  }

  // Hanging herbs
  for(let h=0;h<4;h++){ const hz=-3+h*1.5;
    const herb=BABYLON.MeshBuilder.CreateCylinder('bs_herb'+h,{diameterTop:0.03,diameterBottom:0.1,height:0.4,tessellation:6},scene); herb.position.set(-W/2+0.2,3.0,hz); const hm=mat('bs_hm'+h); hm.diffuseColor=new BABYLON.Color3(0.2,0.22,0.1); herb.material=hm;
  }

  // Lights
  const winLight=new BABYLON.PointLight('bs_wL',new BABYLON.Vector3(0,3,-D/2+1),scene);
  winLight.diffuse=new BABYLON.Color3(0.1,0.3,0.15); winLight.intensity=1.5; winLight.range=18;
  const stillLight=new BABYLON.PointLight('bs_sL',new BABYLON.Vector3(-3,1.5,-1),scene);
  stillLight.diffuse=new BABYLON.Color3(0.4,0.8,0.3); stillLight.intensity=1.0; stillLight.range=8;
  const pentLight=new BABYLON.PointLight('bs_pL',new BABYLON.Vector3(0,0.5,1),scene);
  pentLight.diffuse=new BABYLON.Color3(0.5,0.05,0.02); pentLight.intensity=1.0; pentLight.range=6;
  const lampLight=new BABYLON.PointLight('bs_lL',new BABYLON.Vector3(3,1.5,-3),scene);
  lampLight.diffuse=new BABYLON.Color3(0.7,0.4,0.1); lampLight.intensity=1.5; lampLight.range=10;
  const ambient=new BABYLON.HemisphericLight('bs_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.2; ambient.diffuse=new BABYLON.Color3(0.1,0.15,0.12); ambient.groundColor=new BABYLON.Color3(0.08,0.03,0.02);

  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    stillLight.intensity=flk(1.0,0.2,1.8,0.5);
    pentLight.intensity=flk(1.0,0.25,0.7,1.5);
    lampLight.intensity=flk(1.5,0.2,2.1,2.0);
    if(heat) heat.material.emissiveColor=new BABYLON.Color3(flk(0.8,0.2,4,0),flk(0.3,0.1,4,1),0.02);
  });

  interactables.set('bs_flask','still'); interactables.set('bs_bulb','still'); interactables.set('bs_tube','still');
  interactables.set('bs_pent','pentagram'); interactables.set('bs_pline0','pentagram');
  interactables.set('bs_bone','bones');

  const doorP=BABYLON.MeshBuilder.CreateBox('door_pantry',{width:1.2,height:2.2,depth:0.1},scene); doorP.position.set(0,1.1,D/2-0.05); const dpM=mat('bs_dpM'); dpM.alpha=0.01; doorP.material=dpM;
  interactables.set('door_pantry','door_pantry');
}

// ─── ATTIC ────────────────────────────────────────────────────────────────────
function buildAttic(){
  const W=10, D=8, H=3.0;
  const wallM = pbr('a_wallM', TEX.beam_d, TEX.beam_n, 2, 2, new BABYLON.Color3(0.12,0.08,0.05));
  const floorM = pbr('a_floorM', TEX.wood_d, TEX.wood_n, 3, 2, new BABYLON.Color3(0.12,0.08,0.04));
  const ceilM = pbr('a_ceilM', TEX.beam_d, TEX.beam_n, 2, 2, new BABYLON.Color3(0.08,0.05,0.03));

  const floor=BABYLON.MeshBuilder.CreateGround('a_floor',{width:W,height:D,subdivisions:3},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('a_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function aWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  aWall('a_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); aWall('a_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  aWall('a_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); aWall('a_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
  [-3,-1,1,3].forEach(bx=>{ const b=BABYLON.MeshBuilder.CreateBox('a_rafter'+bx,{width:0.2,height:0.2,depth:D},scene); b.position.set(bx,H-0.12,0); const bm=mat('a_bm'+bx); bm.diffuseColor=new BABYLON.Color3(0.1,0.06,0.03); b.material=bm; });

  // Storage boxes
  [[-3,-2,0.8],[3,-2,0.6],[-2,2,0.7],[2,2,0.5],[0,0,0.9]].forEach(([bx,bz,h])=>{ const box=BABYLON.MeshBuilder.CreateBox('a_box',{width:h*1.2,height:h,depth:h*0.9},scene); box.position.set(bx,h/2,bz); const bm=mat('a_boxM'); bm.diffuseColor=new BABYLON.Color3(0.15+Math.random()*0.1,0.1+Math.random()*0.05,0.05); box.material=bm; });

  // Locked trunk
  const trunkM=pbr('a_trunkM',TEX.darkwood_d,TEX.darkwood_n,2,1,new BABYLON.Color3(0.2,0.14,0.08));
  const trunk=BABYLON.MeshBuilder.CreateBox('a_trunk',{width:1.2,height:0.7,depth:0.6},scene); trunk.position.set(-3,0.35,-2.5); trunk.material=trunkM;

  // Broom
  const broomM=mat('a_broomM'); broomM.diffuseColor=new BABYLON.Color3(0.2,0.14,0.06);
  const broomHandle=BABYLON.MeshBuilder.CreateCylinder('a_broomHandle',{diameterTop:0.03,diameterBottom:0.04,height:1.8,tessellation:8},scene); broomHandle.position.set(W/2-0.4,0.9,2); broomHandle.rotation.z=0.15; broomHandle.material=broomM;
  const broomStraw=BABYLON.MeshBuilder.CreateCylinder('a_broomStraw',{diameterTop:0.04,diameterBottom:0.12,height:0.35,tessellation:8},scene); broomStraw.position.set(W/2-0.55,0.2,2); broomStraw.rotation.z=0.15; broomStraw.material=broomM;

  // Cobwebs
  for(let i=0;i<4;i++){ const web=BABYLON.MeshBuilder.CreatePlane('a_web'+i,{width:1.5,height:1.0},scene); const angles=[0,Math.PI/2,-Math.PI/2,Math.PI]; web.position.set(Math.cos(i*1.57)*(W/2-0.1),H-0.4,Math.sin(i*1.57)*(D/2-0.1)); web.rotation.y=angles[i]; const wm=mat('a_wm'+i); wm.diffuseColor=new BABYLON.Color3(0.2,0.18,0.15); wm.alpha=0.15; web.material=wm; }

  // Dim flickering bulb
  const bulbM=emitM('a_bulbM',0.6,0.5,0.3,0.5);
  const bulb=BABYLON.MeshBuilder.CreateSphere('a_bulb',{diameter:0.1,segments:8},scene); bulb.position.set(0,H-0.3,0); bulb.material=bulbM;
  const bulbLight=new BABYLON.PointLight('a_bL',new BABYLON.Vector3(0,H-0.4,0),scene);
  bulbLight.diffuse=new BABYLON.Color3(0.4,0.35,0.2); bulbLight.intensity=0.8; bulbLight.range=10;
  const ambient=new BABYLON.HemisphericLight('a_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.15; ambient.diffuse=new BABYLON.Color3(0.15,0.12,0.1); ambient.groundColor=new BABYLON.Color3(0.05,0.03,0.02);

  let ft=0;
  scene.registerBeforeRender(()=>{ ft+=engine.getDeltaTime()*0.001; bulbLight.intensity=0.5+Math.sin(ft*8)*0.2+Math.random()*0.1; if(Math.random()<0.005) bulbLight.intensity=0.05; });

  interactables.set('a_trunk','attic_box'); interactables.set('a_box','attic_box');
  interactables.set('a_broomHandle','broom');

  const doorL=BABYLON.MeshBuilder.CreateBox('door_library',{width:1.0,height:2.0,depth:0.1},scene); doorL.position.set(0,1.0,D/2-0.05); const dlM=mat('a_dlM'); dlM.alpha=0.01; doorL.material=dlM;
  interactables.set('door_library','door_library');
}

