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

// ─── MODEL LOADER ───────────────────────────────────────────────────────────
const MODEL_BASE = 'models/';
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


