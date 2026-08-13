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

// ─── MODEL LOADER ───────────────────────────────────────────────────────────
const MODEL_BASE = 'models/';
function loadModel(fileName, pos, scale, rotY, interactableKey) {
  BABYLON.SceneLoader.ImportMesh(null, MODEL_BASE, fileName, scene, function(meshes) {
    const root = meshes[0];
    if (!root) return;
    root.position.set(pos[0], pos[1], pos[2]);
    root.scaling.set(scale, scale, scale);
    if (rotY) root.rotation.y = rotY;
    // Convert PBR materials to StandardMaterial so they work with the scene's point lights
    meshes.forEach(function(m) {
      if (m.material && m.material.getClassName) {
        var cls = m.material.getClassName();
        var stdMat = new BABYLON.StandardMaterial(m.name + '_std', scene);
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
        if (m.material.bumpTexture) {
          stdMat.bumpTexture = m.material.bumpTexture.clone();
        }
        stdMat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);
        stdMat.specularPower = 16;
        m.material = stdMat;
      }
    });
    if (interactableKey) {
      meshes.forEach(function(m) {
        if (m.getTotalVertices && m.getTotalVertices() > 0) interactables.set(m.name, interactableKey);
      });
    }
    console.log('[Hexhaus] Loaded model:', fileName, 'meshes:', meshes.length);
  }, null, function(s,msg,e){ console.warn('[Hexhaus] Model load failed:', fileName, msg); });
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
  try {
    if(scene) scene.dispose();
    interactables = new Map();
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
    state.currentRoom = roomId;
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
  engine.runRenderLoop(()=>{
    if(scene) scene.render();
  });
  window.addEventListener('resize',()=>engine.resize(),{passive:true});

  // Load first room
  transitionToRoom('entrance');
}


// ─── ENTRANCE HALL ────────────────────────────────────────────────────────────
// ─── ENTRANCE HALL ────────────────────────────────────────────────────────────
function buildEntranceHall(){
  // ── MATERIALS ──────────────────────────────────────────────────────────────
  // Dark plaster walls with warm green-brown tint (witch's cottage, not Victorian)
  const wallM = pbr('wallM', TEX.plaster_d, TEX.plaster_n, 3, 2,
    new BABYLON.Color3(0.20, 0.22, 0.18));

  const floorM = pbr('floorM', TEX.wood_d, TEX.wood_n, 5, 4, new BABYLON.Color3(0.28, 0.20, 0.12));
  floorM.specularColor = new BABYLON.Color3(0.06, 0.04, 0.02); floorM.specularPower = 20;

  // Dark wood beam ceiling
  const ceilM = pbr('ceilM', TEX.beam_d, TEX.beam_n, 4, 3,
    new BABYLON.Color3(0.12, 0.08, 0.04));

  // Dark wood for furniture/trim
  const woodM = pbr('woodM', TEX.darkwood_d, TEX.darkwood_n, 3, 2,
    new BABYLON.Color3(0.25, 0.18, 0.10));

  // Stone for fireplace
  const stoneM = pbr('stoneM', TEX.rock_d, TEX.rock_n, 2, 2,
    new BABYLON.Color3(0.22, 0.20, 0.18));

  // ── ROOM SHELL ─────────────────────────────────────────────────────────────
  const W=18, D=12, H=4.8;
  // Override global fog for this room (warmer, lighter)
  scene.fogColor = new BABYLON.Color3(0.08, 0.06, 0.05);
  scene.fogDensity = 0.012;
  scene.clearColor = new BABYLON.Color4(0.03, 0.025, 0.02, 1);

  // Floor
  const floor = BABYLON.MeshBuilder.CreateGround('floor',{width:W,height:D,subdivisions:4},scene);
  floor.material = floorM; floor.receiveShadows = true;

  // Ceiling
  const ceil = BABYLON.MeshBuilder.CreatePlane('ceil',{width:W,height:D},scene);
  ceil.position.y = H; ceil.rotation.x = Math.PI/2;
  ceilM.backFaceCulling = false; ceil.material = ceilM;

  // Walls
  function wall(name,w,h,pos,rotY){
    const m = BABYLON.MeshBuilder.CreatePlane(name,{width:w,height:h},scene);
    m.position.copyFrom(pos); m.rotation.y = rotY;
    const wm = wallM.clone(name+'_m'); wm.backFaceCulling = false;
    m.material = wm; return m;
  }
  wall('wBack',  W, H, new BABYLON.Vector3(0, H/2, -D/2), 0);
  wall('wFront', W, H, new BABYLON.Vector3(0, H/2,  D/2), Math.PI);
  wall('wLeft',  D, H, new BABYLON.Vector3(-W/2, H/2, 0), Math.PI/2);
  wall('wRight', D, H, new BABYLON.Vector3( W/2, H/2, 0), -Math.PI/2);

  // Exposed ceiling beams
  const beamPositions = [-7, -3.5, 0, 3.5, 7];
  beamPositions.forEach((bx, i) => {
    const beam = BABYLON.MeshBuilder.CreateBox('beam'+i, {width:0.32, height:0.28, depth:D}, scene);
    beam.position.set(bx, H-0.16, 0);
    const bm = mat('bm'+i); bm.diffuseColor = new BABYLON.Color3(0.14, 0.07, 0.03);
    bm.emissiveColor = new BABYLON.Color3(0.005, 0.003, 0.001);
    beam.material = bm;
  });

  // Skirting boards (dark wood)
  function skirt(nm, len, pos, ry=0) {
    const b = BABYLON.MeshBuilder.CreateBox(nm, {width:len, height:0.18, depth:0.06}, scene);
    b.position.copyFrom(pos); b.rotation.y = ry; b.material = woodM;
  }
  skirt('sB', W, new BABYLON.Vector3(0, 0.09, -D/2+0.04));
  skirt('sF', W, new BABYLON.Vector3(0, 0.09,  D/2-0.04), Math.PI);
  skirt('sL', D, new BABYLON.Vector3(-W/2+0.04, 0.09, 0), Math.PI/2);
  skirt('sR', D, new BABYLON.Vector3( W/2-0.04, 0.09, 0), -Math.PI/2);

  // ── FIREPLACE (back wall, stone with fire) ─────────────────────────────────
  const fpX = 0, fpZ = -D/2 + 0.4;
  const hearth = BABYLON.MeshBuilder.CreateBox('hearth', {width:3.2, height:2.6, depth:0.7}, scene);
  hearth.position.set(fpX, 1.3, fpZ); hearth.material = stoneM;

  // Arch over fireplace opening
  for (let a = 0; a < 7; a++) {
    const ang = (a/6) * Math.PI;
    const ax = Math.cos(ang) * 1.0;
    const ay = 2.3 + Math.sin(ang) * 0.4;
    const b = BABYLON.MeshBuilder.CreateBox('fpArch'+a, {width:0.22, height:0.32, depth:0.35}, scene);
    b.position.set(ax, ay, fpZ); b.material = stoneM;
  }

  // Firebox (dark interior)
  const fbM = mat('fbM');
  fbM.diffuseColor = new BABYLON.Color3(0.03, 0.02, 0.01);
  fbM.emissiveColor = new BABYLON.Color3(0.015, 0.008, 0.002);
  const firebox = BABYLON.MeshBuilder.CreateBox('firebox', {width:1.6, height:1.4, depth:0.4}, scene);
  firebox.position.set(fpX, 0.8, fpZ + 0.1); firebox.material = fbM;

  // Glowing embers
  const emberM = mat('emberM');
  emberM.emissiveColor = new BABYLON.Color3(0.7, 0.22, 0.04);
  const embers = BABYLON.MeshBuilder.CreateBox('embers', {width:1.2, height:0.04, depth:0.35}, scene);
  embers.position.set(fpX, 0.12, fpZ + 0.05); embers.material = emberM;

  // Small flame cones
  for (let f = 0; f < 3; f++) {
    const flame = BABYLON.MeshBuilder.CreateCylinder('flame'+f, {diameterTop:0.02, diameterBottom:0.15, height:0.35+f*0.08, tessellation:6}, scene);
    flame.position.set(fpX - 0.3 + f*0.3, 0.3, fpZ + 0.05);
    flame.material = emitM('flameM'+f, 0.9, 0.45, 0.1, 0.8);
  }

  // Wooden mantel
  const mantel = BABYLON.MeshBuilder.CreateBox('mantel', {width:2.0, height:0.08, depth:0.5}, scene);
  mantel.position.set(fpX, 1.75, fpZ + 0.05); mantel.material = woodM;

  // Candle on mantel
  const candleBase = BABYLON.MeshBuilder.CreateCylinder('candleBase', {diameter:0.08, height:0.25, tessellation:8}, scene);
  candleBase.position.set(fpX + 0.6, 1.92, fpZ + 0.05);
  candleBase.material = mat('candleMat'); candleBase.material.diffuseColor = new BABYLON.Color3(0.5, 0.45, 0.3);
  const candleFlame = BABYLON.MeshBuilder.CreateSphere('candleFlame', {diameter:0.04, segments:6}, scene);
  candleFlame.position.set(fpX + 0.6, 2.1, fpZ + 0.05);
  candleFlame.scaling.y = 2.0;
  candleFlame.material = emitM('candleFlameM', 1.0, 0.65, 0.15, 1.0);

  // ── GRANDFATHER CLOCK (right wall, stopped at 3:17) ─────────────────────────
  const clockX = W/2 - 0.3;
  const clockBody = BABYLON.MeshBuilder.CreateBox('clockBody', {width:0.8, height:2.4, depth:0.35}, scene);
  clockBody.position.set(clockX, 1.2, -3); clockBody.material = woodM;
  const clockFace = BABYLON.MeshBuilder.CreateCylinder('clockFace', {diameter:0.4, height:0.03, tessellation:16}, scene);
  clockFace.position.set(clockX - 0.18, 1.8, -3);
  clockFace.rotation.z = Math.PI/2;
  clockFace.material = mat('clockFaceM'); clockFace.material.diffuseColor = new BABYLON.Color3(0.3, 0.28, 0.22);
  // Clock hands (fixed at 3:17)
  const hourHand = BABYLON.MeshBuilder.CreateBox('hourHand', {width:0.02, height:0.08, depth:0.01}, scene);
  hourHand.position.set(clockX - 0.18, 1.82, -3); hourHand.rotation.z = -Math.PI/6; // ~3 o'clock
  hourHand.material = mat('hourHandM'); hourHand.material.diffuseColor = new BABYLON.Color3(0.1, 0.08, 0.06);
  const minHand = BABYLON.MeshBuilder.CreateBox('minHand', {width:0.02, height:0.13, depth:0.01}, scene);
  minHand.position.set(clockX - 0.18, 1.82, -3); minHand.rotation.z = -Math.PI/3 * 0.57; // ~17 min
  minHand.material = mat('minHandM'); minHand.material.diffuseColor = new BABYLON.Color3(0.1, 0.08, 0.06);
  // Pendulum (still)
  const pendRod = BABYLON.MeshBuilder.CreateCylinder('pendRod', {diameter:0.01, height:0.6, tessellation:4}, scene);
  pendRod.position.set(clockX - 0.18, 1.2, -3); pendRod.material = mat('pendRodM'); pendRod.material.diffuseColor = new BABYLON.Color3(0.15, 0.12, 0.08);
  const pendBob = BABYLON.MeshBuilder.CreateSphere('pendBob', {diameter:0.12, segments:8}, scene);
  pendBob.position.set(clockX - 0.18, 0.85, -3); pendBob.material = mat('pendBobM'); pendBob.material.diffuseColor = new BABYLON.Color3(0.2, 0.15, 0.08);

  // ── FAMILY PORTRAIT (left wall) ─────────────────────────────────────────────
  const portFrame = BABYLON.MeshBuilder.CreateBox('portFrame', {width:1.0, height:1.3, depth:0.06}, scene);
  portFrame.position.set(-W/2 + 0.06, 2.8, -2);
  portFrame.rotation.y = Math.PI/2;
  portFrame.material = woodM;
  const portCanvas = BABYLON.MeshBuilder.CreatePlane('portCanvas', {width:0.85, height:1.15}, scene);
  portCanvas.position.set(-W/2 + 0.09, 2.8, -2);
  portCanvas.rotation.y = Math.PI/2;
  portCanvas.material = mat('portCanvasM');
  portCanvas.material.diffuseColor = new BABYLON.Color3(0.12, 0.10, 0.08);
  portCanvas.material.emissiveColor = new BABYLON.Color3(0.02, 0.015, 0.01);

  // ── STANDING MIRROR (left-front corner) ─────────────────────────────────────
  const mirFrame = BABYLON.MeshBuilder.CreateBox('mirFrame', {width:0.8, height:2.0, depth:0.08}, scene);
  mirFrame.position.set(-W/2 + 0.3, 1.0, D/2 - 1);
  mirFrame.rotation.y = Math.PI * 0.15;
  mirFrame.material = woodM;
  const mirGlass = BABYLON.MeshBuilder.CreatePlane('mirGlass', {width:0.6, height:1.7}, scene);
  mirGlass.position.set(-W/2 + 0.32, 1.0, D/2 - 1);
  mirGlass.rotation.y = Math.PI * 0.15;
  const mirM = mat('mirM');
  mirM.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.08);
  mirM.emissiveColor = new BABYLON.Color3(0.008, 0.008, 0.015);
  mirM.specularColor = new BABYLON.Color3(0.15, 0.15, 0.2);
  mirM.specularPower = 64;
  mirM.alpha = 0.55;
  mirGlass.material = mirM;

  // ── COAT RACK WITH BLACK CLOAK (right-front corner) ─────────────────────────
  const rackPole = BABYLON.MeshBuilder.CreateCylinder('rackPole', {diameterTop:0.05, diameterBottom:0.07, height:2.0, tessellation:8}, scene);
  rackPole.position.set(W/2 - 0.8, 1.0, D/2 - 1);
  rackPole.material = woodM;
  // Hook arms
  for (let h = 0; h < 3; h++) {
    const hook = BABYLON.MeshBuilder.CreateCylinder('hook'+h, {diameter:0.03, height:0.15, tessellation:4}, scene);
    hook.position.set(W/2 - 0.8, 1.6 - h*0.25, D/2 - 1 + 0.08);
    hook.rotation.x = Math.PI/2;
    hook.material = woodM;
  }
  // The Black Cloak hanging
  const cloakM = mat('cloakM');
  cloakM.diffuseColor = new BABYLON.Color3(0.04, 0.03, 0.05);
  cloakM.specularColor = new BABYLON.Color3(0.08, 0.06, 0.1);
  cloakM.specularPower = 4;
  const cloakBody = BABYLON.MeshBuilder.CreateBox('cloakMesh', {width:0.5, height:1.2, depth:0.15}, scene);
  cloakBody.position.set(W/2 - 0.8, 1.0, D/2 - 1 + 0.1);
  cloakBody.material = cloakM;
  // Silver moth clasp
  const clasp = BABYLON.MeshBuilder.CreateSphere('clasp', {diameter:0.05, segments:8}, scene);
  clasp.position.set(W/2 - 0.8, 1.5, D/2 - 1 + 0.15);
  clasp.material = mat('claspM'); clasp.material.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.42);
  clasp.material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.55); clasp.material.specularPower = 48;

  // ── CONSOLE TABLE WITH SEALED LETTER (front wall) ───────────────────────────
  const console = BABYLON.MeshBuilder.CreateBox('console', {width:1.2, height:0.85, depth:0.4}, scene);
  console.position.set(-2.5, 0.43, D/2 - 0.25);
  console.material = woodM;
  // Drawer detail
  const drawer = BABYLON.MeshBuilder.CreateBox('drawer', {width:1.0, height:0.25, depth:0.02}, scene);
  drawer.position.set(-2.5, 0.55, D/2 - 0.06); drawer.material = woodM;
  const knob = BABYLON.MeshBuilder.CreateSphere('knob', {diameter:0.04, segments:6}, scene);
  knob.position.set(-2.5, 0.55, D/2 - 0.03); knob.material = mat('knobM'); knob.material.diffuseColor = new BABYLON.Color3(0.2, 0.15, 0.08);

  // Sealed Letter on console
  const letterM = mat('letterM');
  letterM.diffuseColor = new BABYLON.Color3(0.55, 0.45, 0.30);
  const letter = BABYLON.MeshBuilder.CreateBox('letterMesh', {width:0.22, height:0.01, depth:0.15}, scene);
  letter.position.set(-2.5, 0.87, D/2 - 0.25);
  letter.material = letterM;
  // Black wax seal
  const seal = BABYLON.MeshBuilder.CreateSphere('seal', {diameter:0.04, segments:8}, scene);
  seal.position.set(-2.5, 0.88, D/2 - 0.25);
  seal.scaling.y = 0.4;
  seal.material = mat('sealM'); seal.material.diffuseColor = new BABYLON.Color3(0.05, 0.03, 0.08);
  seal.material.emissiveColor = new BABYLON.Color3(0.01, 0.005, 0.02);

  // ── IRON KEY ON HOOK (near the door) ────────────────────────────────────────
  const keyHook = BABYLON.MeshBuilder.CreateCylinder('keyHook', {diameter:0.02, height:0.08, tessellation:4}, scene);
  keyHook.position.set(2.5, 1.8, D/2 - 0.06);
  keyHook.rotation.x = Math.PI/2;
  keyHook.material = woodM;
  const keyM = mat('keyM');
  keyM.diffuseColor = new BABYLON.Color3(0.2, 0.18, 0.16);
  keyM.specularColor = new BABYLON.Color3(0.3, 0.28, 0.25);
  const keyBow = BABYLON.MeshBuilder.CreateTorus('keyBow', {diameter:0.08, thickness:0.015, tessellation:12}, scene);
  keyBow.position.set(2.5, 1.72, D/2 - 0.06);
  keyBow.material = keyM;
  const keyShaft = BABYLON.MeshBuilder.CreateBox('keyShaft', {width:0.02, height:0.15, depth:0.02}, scene);
  keyShaft.position.set(2.5, 1.63, D/2 - 0.06);
  keyShaft.material = keyM;

  // ── DRIED ROSEMARY ABOVE DOORWAY (left wall, hanging) ───────────────────────
  const rosemaryM = mat('rosemaryM');
  rosemaryM.diffuseColor = new BABYLON.Color3(0.22, 0.26, 0.14);
  for (let r = 0; r < 2; r++) {
    const bundle = BABYLON.MeshBuilder.CreateCylinder('rosemary'+r, {diameterTop:0.03, diameterBottom:0.08, height:0.3, tessellation:6}, scene);
    bundle.position.set(-W/2 + 0.12, 2.8, -3.5 + r*1.5);
    bundle.rotation.z = Math.PI/2 + (r%2 ? 0.1 : -0.1);
    bundle.rotation.y = Math.PI/2;
    bundle.material = rosemaryM;
  }

  // ── HANGING DRIED HERBS FROM BEAMS ──────────────────────────────────────────
  const herbPositions = [[-5, -1], [3, 2], [-2, 3], [5, -3], [0, 0]];
  herbPositions.forEach(([hx, hz], hi) => {
    const herb = BABYLON.MeshBuilder.CreateCylinder('herb'+hi, {diameterTop:0.03, diameterBottom:0.1, height:0.35, tessellation:6}, scene);
    herb.position.set(hx, H - 0.45, hz);
    const hm = mat('herbM'+hi);
    hm.diffuseColor = new BABYLON.Color3(0.20 + Math.random()*0.08, 0.24 + Math.random()*0.06, 0.10 + Math.random()*0.04);
    herb.material = hm;
    // String
    const string = BABYLON.MeshBuilder.CreateCylinder('herbStr'+hi, {diameter:0.005, height:0.25, tessellation:4}, scene);
    string.position.set(hx, H - 0.25, hz);
    string.material = mat('herbStrM'+hi); string.material.diffuseColor = new BABYLON.Color3(0.15, 0.12, 0.08);
  });

  // ── RED PERSIAN RUG ─────────────────────────────────────────────────────────
  const rugM = mat('rugM');
  rugM.diffuseColor = new BABYLON.Color3(0.30, 0.06, 0.04);
  rugM.specularColor = new BABYLON.Color3(0.05, 0.02, 0.01);
  const rug = BABYLON.MeshBuilder.CreateGround('rug', {width:4.0, height:5.5, subdivisions:2}, scene);
  rug.position.set(0, 0.01, 0.5); rug.material = rugM;
  // Rug border (slightly lighter)
  const rugBorderM = mat('rugBorderM');
  rugBorderM.diffuseColor = new BABYLON.Color3(0.35, 0.12, 0.06);
  const rugBorder = BABYLON.MeshBuilder.CreateGround('rugBorder', {width:4.3, height:5.8, subdivisions:1}, scene);
  rugBorder.position.set(0, 0.008, 0.5); rugBorder.material = rugBorderM;

  // ── COBWEBS IN CORNERS ──────────────────────────────────────────────────────
  const webM = mat('webM');
  webM.diffuseColor = new BABYLON.Color3(0.25, 0.22, 0.18);
  webM.alpha = 0.15;
  const corners = [
    {pos: [-W/2+0.1, H-0.5, -D/2+0.1], rot: 0},
    {pos: [ W/2-0.1, H-0.5, -D/2+0.1], rot: Math.PI/2},
    {pos: [-W/2+0.1, H-0.5,  D/2-0.1], rot: -Math.PI/2},
    {pos: [ W/2-0.1, H-0.5,  D/2-0.1], rot: Math.PI},
  ];
  corners.forEach((c, ci) => {
    const web = BABYLON.MeshBuilder.CreatePlane('web'+ci, {width:1.8, height:1.5}, scene);
    web.position.set(c.pos[0], c.pos[1], c.pos[2]);
    web.rotation.y = c.rot;
    web.material = webM.clone('webM'+ci);
  });

  // ── WALL SCONCES (amber candle light) ──────────────────────────────────────
  function sconce(nm, pos, rotY) {
    const bracket = BABYLON.MeshBuilder.CreateBox(nm+'_bracket', {width:0.08, height:0.25, depth:0.12}, scene);
    bracket.position.copyFrom(pos); bracket.rotation.y = rotY;
    bracket.material = woodM;
    const candle = BABYLON.MeshBuilder.CreateCylinder(nm+'_candle', {diameter:0.05, height:0.18, tessellation:8}, scene);
    candle.position.set(pos.x, pos.y + 0.12, pos.z); candle.rotation.y = rotY;
    candle.material = mat(nm+'_cM'); candle.material.diffuseColor = new BABYLON.Color3(0.5, 0.45, 0.3);
    const flame = BABYLON.MeshBuilder.CreateSphere(nm+'_flame', {diameter:0.03, segments:6}, scene);
    flame.position.set(pos.x, pos.y + 0.25, pos.z);
    flame.scaling.y = 2.0;
    flame.material = emitM(nm+'_fM', 1.0, 0.62, 0.12, 1.0);
  }
  sconce('sconceL1', new BABYLON.Vector3(-W/2 + 0.1, 2.5, 0), Math.PI/2);
  sconce('sconceR1', new BABYLON.Vector3(W/2 - 0.1, 2.5, 0), -Math.PI/2);
  sconce('sconceB1', new BABYLON.Vector3(-4, 2.5, -D/2 + 0.1), 0);
  sconce('sconceB2', new BABYLON.Vector3(4, 2.5, -D/2 + 0.1), 0);

  // ── SMALL WINDOW WITH MOONLIGHT (front wall, high up) ───────────────────────
  const winM = mat('winM');
  winM.diffuseColor = new BABYLON.Color3(0.04, 0.08, 0.16);
  winM.emissiveColor = new BABYLON.Color3(0.06, 0.10, 0.18);
  winM.alpha = 0.82;
  const winGlass = BABYLON.MeshBuilder.CreatePlane('winGlass', {width:1.6, height:2.0}, scene);
  winGlass.position.set(4.5, 2.8, D/2 - 0.08);
  winGlass.rotation.y = Math.PI;
  winGlass.material = winM;
  // Window frame
  const winFrameM = mat('winFrameM'); winFrameM.diffuseColor = new BABYLON.Color3(0.15, 0.10, 0.06);
  const winTop = BABYLON.MeshBuilder.CreateBox('winTop', {width:1.8, height:0.08, depth:0.1}, scene);
  winTop.position.set(4.5, 3.8, D/2 - 0.05); winTop.material = winFrameM;
  const winBot = BABYLON.MeshBuilder.CreateBox('winBot', {width:1.8, height:0.08, depth:0.1}, scene);
  winBot.position.set(4.5, 1.8, D/2 - 0.05); winBot.material = winFrameM;
  const winLeft = BABYLON.MeshBuilder.CreateBox('winLeft', {width:0.08, height:2.0, depth:0.1}, scene);
  winLeft.position.set(3.7, 2.8, D/2 - 0.05); winLeft.material = winFrameM;
  const winRight = BABYLON.MeshBuilder.CreateBox('winRight', {width:0.08, height:2.0, depth:0.1}, scene);
  winRight.position.set(5.3, 2.8, D/2 - 0.05); winRight.material = winFrameM;
  // Mullion
  const mullion = BABYLON.MeshBuilder.CreateBox('mullion', {width:0.04, height:2.0, depth:0.06}, scene);
  mullion.position.set(4.5, 2.8, D/2 - 0.06); mullion.material = winFrameM;

  // ── LIGHTS ──────────────────────────────────────────────────────────────────
  // Fireplace glow (warm amber)
  const fireLight = new BABYLON.PointLight('fireLight', new BABYLON.Vector3(fpX, 0.8, fpZ + 0.2), scene);
  fireLight.diffuse = new BABYLON.Color3(1.0, 0.5, 0.15);
  fireLight.intensity = 4.5; fireLight.range = 22;

  // Moonlight from window (cool blue)
  const moonLight = new BABYLON.PointLight('moonLight', new BABYLON.Vector3(4.5, 3, D/2 - 0.5), scene);
  moonLight.diffuse = new BABYLON.Color3(0.25, 0.35, 0.55);
  moonLight.intensity = 2.5; moonLight.range = 16;

  // Sconce lights (warm amber, flickering)
  const sconceLights = [];
  const sconcePositions = [
    {pos: [-W/2 + 0.5, 2.6, 0], color: [0.7, 0.5, 0.2], range: 6},
    {pos: [W/2 - 0.5, 2.6, 0], color: [0.7, 0.5, 0.2], range: 6},
    {pos: [-4, 2.6, -D/2 + 0.5], color: [0.65, 0.45, 0.18], range: 6},
    {pos: [4, 2.6, -D/2 + 0.5], color: [0.65, 0.45, 0.18], range: 6},
  ];
  sconcePositions.forEach((sp, si) => {
    const sl = new BABYLON.PointLight('sconceLight'+si, new BABYLON.Vector3(sp.pos[0], sp.pos[1], sp.pos[2]), scene);
    sl.diffuse = new BABYLON.Color3(sp.color[0], sp.color[1], sp.color[2]);
    sl.intensity = 1.2; sl.range = sp.range * 1.5;
    sconceLights.push(sl);
  });

  // Candle light (mantel)
  const candleLight = new BABYLON.PointLight('candleLight', new BABYLON.Vector3(fpX + 0.6, 2.1, fpZ), scene);
  candleLight.diffuse = new BABYLON.Color3(0.8, 0.55, 0.2);
  candleLight.intensity = 1.0; candleLight.range = 6;

  // Ambient (very low, warm)
  const ambient = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), scene);
  ambient.intensity = 0.55;
  ambient.diffuse = new BABYLON.Color3(0.32, 0.28, 0.22);
  ambient.groundColor = new BABYLON.Color3(0.14, 0.10, 0.06);

  // ── FLICKERING ──────────────────────────────────────────────────────────────
  let ft = 0;
  function flk(base, amp, sp, off) {
    return base + amp * (Math.sin(ft*sp + off)*0.5 + Math.sin(ft*sp*2.3 + off*1.7)*0.3 + Math.sin(ft*sp*0.41 + off*0.9)*0.2);
  }
  scene.registerBeforeRender(() => {
    ft += engine.getDeltaTime() * 0.001;
    fireLight.intensity = flk(4.5, 0.6, 3.7, 1.2);
    candleLight.intensity = flk(1.0, 0.15, 4.1, 0.5);
    sconceLights.forEach((sl, i) => {
      sl.intensity = flk(1.2, 0.12, 2.1 + i*0.7, i*1.3);
    });
    if (embers) embers.material.emissiveColor = new BABYLON.Color3(flk(0.7, 0.15, 3.7, 0.5), flk(0.22, 0.06, 3.7, 1.0), 0.02);
    // Flicker candle flame
    if (candleFlame) candleFlame.material.emissiveColor = new BABYLON.Color3(flk(1.0, 0.15, 4.1, 0.3), flk(0.65, 0.08, 4.1, 0.7), 0.12);
  });

  // ── INTERACTABLES ───────────────────────────────────────────────────────────
  interactables.set('cloakMesh', 'cloak');
  interactables.set('letterMesh', 'letter');
  interactables.set('keyBow', 'key');
  interactables.set('keyShaft', 'key');
  interactables.set('rosemary0', 'rosemary');
  interactables.set('rosemary1', 'rosemary');
  interactables.set('clockBody', 'clock');
  interactables.set('clockFace', 'clock');
  interactables.set('portFrame', 'portrait');
  interactables.set('portCanvas', 'portrait');
  interactables.set('mirGlass', 'mirror');
  interactables.set('mirFrame', 'mirror');
  interactables.set('firebox', 'fireplace');
  interactables.set('embers', 'fireplace');
  interactables.set('hearth', 'fireplace');
  interactables.set('herb0', 'herbwall');
  interactables.set('herb1', 'herbwall');
  interactables.set('herb2', 'herbwall');
  interactables.set('herb3', 'herbwall');
  interactables.set('herb4', 'herbwall');

  // ── DOORS ───────────────────────────────────────────────────────────────────
  // ── REAL 3D MODELS (Quaternius CC0) ───────────────────────────────────────
  // Fireplace model on back wall
  loadModel('Fireplace.glb', [0, 0, -D/2 + 0.6], 90, 0, 'fireplace');
  
  // Chandelier hanging from ceiling
  loadModel('Light_Chandelier.glb', [0, H - 1.0, 0], 200, 0, null);
  
  // Large carpet in center of room
  loadModel('Carpet_1.glb', [0, 0.02, 0], 150, 0, null);
  
  // Two chairs flanking the fireplace
  loadModel('Chair_1.glb', [-2.5, 0, -D/2 + 2.5], 65, Math.PI/4, null);
  loadModel('Chair_2.glb', [2.5, 0, -D/2 + 2.5], 65, -Math.PI/4, null);
  
  // Bookshelf on left wall
  loadModel('Bookshelf.glb', [-W/2 + 0.5, 0, 2], 75, Math.PI/2, 'bookshelf');
  
  // Cauldron near the fireplace (witch's house!)
  loadModel('Cauldron.glb', [3.5, 0, -D/2 + 1.5], 250, 0, 'cauldron');
  
  // Round table near the front
  loadModel('Table_RoundSmall.glb', [0, 0, 3], 50, 0, 'tea');
  
  // Bone decoration in corner
  loadModel('Bone.glb', [-W/2 + 1.5, 0, D/2 - 1.5], 30, 0, 'bones');
  
  // Scythe on the wall (classic witch prop)
  loadModel('Scythe.glb', [W/2 - 0.5, 1.8, -1], 35, -Math.PI/2, null);
  
  // Chest in corner
  loadModel('Chest_Closed.glb', [-W/2 + 1.0, 0, -D/2 + 1.0], 100, 0, null);

  // Door to Living Room (left wall)
  const doorLR = BABYLON.MeshBuilder.CreateBox('door_living', {width:0.1, height:2.4, depth:1.4}, scene);
  doorLR.position.set(-W/2 + 0.05, 1.2, 3);
  const dLR_M = mat('dLR_M'); dLR_M.alpha = 0.01; doorLR.material = dLR_M;
  interactables.set('door_living', 'door_living');

  // Door to Library (right wall)
  const doorLib = BABYLON.MeshBuilder.CreateBox('door_library', {width:0.1, height:2.4, depth:1.4}, scene);
  doorLib.position.set(W/2 - 0.05, 1.2, 3);
  const dLib_M = mat('dLib_M'); dLib_M.alpha = 0.01; doorLib.material = dLib_M;
  interactables.set('door_library', 'door_library');

  // Door to Kitchen (back wall, right of fireplace)
  const doorKit = BABYLON.MeshBuilder.CreateBox('door_kitchen', {width:1.2, height:2.4, depth:0.1}, scene);
  doorKit.position.set(W/2 - 2.5, 1.2, -D/2 + 0.05);
  const dKit_M = mat('dKit_M'); dKit_M.alpha = 0.01; doorKit.material = dKit_M;
  interactables.set('door_kitchen', 'door_kitchen');

  // Door to Bathroom (back wall, left of fireplace)
  const doorBath = BABYLON.MeshBuilder.CreateBox('door_bathroom', {width:1.2, height:2.4, depth:0.1}, scene);
  doorBath.position.set(-W/2 + 2.5, 1.2, -D/2 + 0.05);
  const dBath_M = mat('dBath_M'); dBath_M.alpha = 0.01; doorBath.material = dBath_M;
  interactables.set('door_bathroom', 'door_bathroom');
}

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

