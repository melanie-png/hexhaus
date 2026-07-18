/* ═══════════════════════════════════════════
   HEXHAUS — game.js  v3 (textures + recentre)
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
  portrait:  { name:'Family Portrait',    icon:'🖼️', collectible:false, desc:'Four figures. Three look outward. One — the smallest — faces the wall. The paint is old. The posture is not.' },
  mirror:    { name:'Standing Mirror',    icon:'🪞', collectible:false, desc:"Your reflection is a half-second slow. It catches up when you stop moving. When you look away, it doesn't." },
  clock:     { name:'Grandfather Clock',  icon:'🕰️', collectible:false, desc:'Stopped at 3:17. The pendulum is still. But you heard it tick when you entered the room.' },
  bookshelf: { name:'The Bookshelves',    icon:'📚', collectible:false, desc:"Hundreds of volumes. Herbalism, astronomy, law, names. One shelf is labelled in a language you almost recognise." },
  fireplace: { name:'The Fireplace',      icon:'🔥', collectible:false, desc:"The fire is lit. The hearth is cold. The wood isn't burning — it just looks that way." },
  cauldron:  { name:'The Cauldron',       icon:'🫕', collectible:false, desc:'Cast iron, thicker than your fist. Something is still warm inside. The smell is botanical — but wrong.' },
  herbwall:  { name:'Drying Herbs',       icon:'🌾', collectible:false, desc:'Dozens of bundles. Wormwood, yarrow, henbane, rue. She dried them herself. This week.' },
};

const state = { inventory:[], activeModal:null };
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
  initBabylon();
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

// ─── BABYLON INIT ─────────────────────────────────────────────────────────────

function initBabylon(){
  const engine = new BABYLON.Engine($('game-canvas'), true, { antialias:true });
  const scene  = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.04,0.08,0.12,1);
  scene.fogMode    = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogColor   = new BABYLON.Color3(0.06,0.12,0.18);
  scene.fogDensity = 0.025;

  // ─── REAL TEXTURE MATERIAL BUILDER ──────────────────────────────────────────
  function pbr(name, diffUrl, norUrl, usc=2, vsc=2, tint=null, alpha=1.0) {
    const m = new BABYLON.StandardMaterial(name, scene);
    // Diffuse texture
    const dt = new BABYLON.Texture(diffUrl, scene);
    dt.uScale = usc; dt.vScale = vsc;
    m.diffuseTexture = dt;
    // Normal map (bump)
    const nt = new BABYLON.Texture(norUrl, scene);
    nt.uScale = usc; nt.vScale = vsc;
    m.bumpTexture = nt;
    m.invertNormalMapX = false; m.invertNormalMapY = false;
    // Specular — low for rough surfaces
    m.specularColor = new BABYLON.Color3(0.06, 0.06, 0.08);
    m.specularPower  = 12;
    if (tint) m.diffuseColor = tint;
    if (alpha < 1) { m.alpha = alpha; m.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND; }
    return m;
  }



  // ── CAMERA ─────────────────────────────────────────────────────────────────
  const camera = new BABYLON.UniversalCamera('cam', new BABYLON.Vector3(0,1.7,0), scene);
  camera.setTarget(new BABYLON.Vector3(0,1.7,1));
  camera.minZ=0.1; camera.maxZ=60; camera.fov=1.1;
  camera.inputs.clear();

  let isDragging=false, dragStartX=0, dragStartY=0, lastClientX=0, lastClientY=0;
  let camYaw=0, camPitch=0;
  const TAP=10, SENS=0.0025, PMIN=-0.52, PMAX=0.52;

  function applyRot(){
    const f=new BABYLON.Vector3(
      Math.sin(camYaw)*Math.cos(camPitch),
      Math.sin(camPitch),
      Math.cos(camYaw)*Math.cos(camPitch)
    );
    camera.setTarget(camera.position.add(f));
  }

  // ── RECENTRE ────────────────────────────────────────────────────────────────
  let recentreAnim=null;
  function recentreView(){
    // Smoothly lerp BOTH pitch AND yaw back to zero (dead ahead, level)
    if(recentreAnim) clearInterval(recentreAnim);
    const startPitch=camPitch;
    const startYaw=camYaw;
    // Normalise yaw to shortest arc
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
  $('btn-recentre').addEventListener('click', recentreView);

  // Mouse look
  $('game-canvas').addEventListener('mousedown',e=>{ if(state.activeModal)return; isDragging=true; dragStartX=e.clientX; dragStartY=e.clientY; lastClientX=e.clientX; lastClientY=e.clientY; },{passive:true});
  window.addEventListener('mousemove',e=>{ if(!isDragging||state.activeModal)return; camYaw-=(e.clientX-lastClientX)*SENS; camPitch=Math.max(PMIN,Math.min(PMAX,camPitch-(e.clientY-lastClientY)*SENS)); lastClientX=e.clientX; lastClientY=e.clientY; applyRot(); },{passive:true});
  window.addEventListener('mouseup',e=>{ if(!isDragging)return; const m=Math.abs(e.clientX-dragStartX)+Math.abs(e.clientY-dragStartY); isDragging=false; if(m<TAP) tryPick(e.clientX,e.clientY); },{passive:true});

  // Touch look
  let tid=null;
  $('game-canvas').addEventListener('touchstart',e=>{ if(state.activeModal||tid!==null)return; const t=e.changedTouches[0]; tid=t.identifier; isDragging=true; dragStartX=t.clientX; dragStartY=t.clientY; lastClientX=t.clientX; lastClientY=t.clientY; },{passive:true});
  $('game-canvas').addEventListener('touchmove',e=>{ if(!isDragging||state.activeModal)return; const t=[...e.changedTouches].find(tt=>tt.identifier===tid); if(!t)return; camYaw-=(t.clientX-lastClientX)*SENS; camPitch=Math.max(PMIN,Math.min(PMAX,camPitch-(t.clientY-lastClientY)*SENS)); lastClientX=t.clientX; lastClientY=t.clientY; applyRot(); },{passive:true});
  $('game-canvas').addEventListener('touchend',e=>{ const t=[...e.changedTouches].find(tt=>tt.identifier===tid); if(!t)return; const m=Math.abs(t.clientX-dragStartX)+Math.abs(t.clientY-dragStartY); isDragging=false; tid=null; if(m<TAP) tryPick(t.clientX,t.clientY); },{passive:true});


  // ── PINCH/SPREAD ZOOM ──────────────────────────────────────────────────────
  const FOV_DEFAULT = 1.1;  // initial FOV (~63°)
  const FOV_MIN     = 0.45; // max zoom in (~26°)
  const FOV_MAX     = FOV_DEFAULT; // can't zoom out beyond start
  let pinchStartDist = null;
  let pinchStartFov  = FOV_DEFAULT;

  function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }

  $('game-canvas').addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      pinchStartDist = getTouchDist(e.touches);
      pinchStartFov  = camera.fov;
      // Cancel single-touch drag so pinch doesn't also pan
      isDragging = false;
      tid = null;
    }
  }, { passive: true });

  $('game-canvas').addEventListener('touchmove', e => {
    if (e.touches.length === 2 && pinchStartDist !== null) {
      const dist = getTouchDist(e.touches);
      const scale = pinchStartDist / dist; // spread = scale<1 = zoom in
      const newFov = Math.max(FOV_MIN, Math.min(FOV_MAX, pinchStartFov * scale));
      camera.fov = newFov;
    }
  }, { passive: true });

  $('game-canvas').addEventListener('touchend', e => {
    if (e.touches.length < 2) pinchStartDist = null;
  }, { passive: true });

  window.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); if(e.key==='r'||e.key==='R') recentreView(); },{passive:true});

  // ── TEXTURES ───────────────────────────────────────────────────────────────

  // ── MATERIALS ──────────────────────────────────────────────────────────────
  function mat(name){ const m=new BABYLON.StandardMaterial(name,scene); m.specularColor=new BABYLON.Color3(0.04,0.04,0.04); return m; }

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

  function emitM(name,r,g,b,ei=0.8){ const m=mat(name); m.diffuseColor=new BABYLON.Color3(r,g,b); m.emissiveColor=new BABYLON.Color3(r*ei,g*ei,b*ei); return m; }

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

  const STEPS=12, STEPY=H*0.55/STEPS, STEPZ=0.42, STEPX=3.8;
  const stairOriginZ=3.0, stairOriginX=3.5;

  for(let s=0;s<STEPS;s++){
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
  const railAngle=Math.atan2(STEPS*STEPY, STEPS*STEPZ);
  const railLen=Math.sqrt(Math.pow(STEPS*STEPY,2)+Math.pow(STEPS*STEPZ,2));
  const handrail=BABYLON.MeshBuilder.CreateCylinder('handrail',{diameter:0.07,height:railLen,tessellation:10},scene);
  handrail.position.set(stairOriginX-STEPX/2+0.12, (STEPS*STEPY)/2+0.78, stairOriginZ-(STEPS*STEPZ)/2);
  handrail.rotation.x=railAngle; handrail.material=railM;
  // Newel posts (start + end)
  [[0,0.06,stairOriginZ,0.9],[0,STEPS*STEPY+0.06,stairOriginZ-STEPS*STEPZ+0.2,0.5]].forEach(([,y,z,h],ni)=>{
    const nw=BABYLON.MeshBuilder.CreateBox('newel'+ni,{width:0.14,height:h,depth:0.14},scene);
    nw.position.set(stairOriginX-STEPX/2+0.07,y+h/2,z); nw.material=railM;
    const nwCap=BABYLON.MeshBuilder.CreateSphere('newelCap'+ni,{diameter:0.15,segments:8},scene);
    nwCap.position.set(stairOriginX-STEPX/2+0.07,y+h+0.075,z); nwCap.material=railM;
  });

  // Landing platform
  const landing=BABYLON.MeshBuilder.CreateBox('landing',{width:W/2-0.2,height:0.1,depth:3.5},scene);
  landing.position.set(stairOriginX+(W/2-0.2)/2-STEPX/2, STEPS*STEPY+0.05, stairOriginZ-STEPS*STEPZ+1.75);
  landing.material=stairM;

  // Landing balustrade
  const landRail=BABYLON.MeshBuilder.CreateBox('landRail',{width:W/2-0.2,height:0.07,depth:0.07},scene);
  landRail.position.set(stairOriginX+(W/2-0.2)/2-STEPX/2, STEPS*STEPY+0.78, stairOriginZ-STEPS*STEPZ+0.12);
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
  keystone.position.set(fpX-0.14,3.62,fpZ); keystone.material=stoneMat.clone('ksm');
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
  // Ornate frame moulding strips
  const fOrnM=goldM.clone('fOrnM');
  [[0,1.14,0.065],[0,-1.14,0.065],[0.89,0,0.065],[-0.89,0,0.065]].forEach(([ox,oy,oz],fi)=>{
    const isH=fi<2;
    const fstrip=BABYLON.MeshBuilder.CreateBox('fstrip'+fi,{width:isH?1.78:0.08,height:isH?0.08:2.28,depth:0.05},scene);
    fstrip.position.set(-4+ox,2.8+oy,D/2-0.04+oz); fstrip.material=fOrnM;
  });
  // Corner rosettes
  [[-0.89,-1.14],[0.89,-1.14],[-0.89,1.14],[0.89,1.14]].forEach(([rx,ry],ri)=>{
    const ros=BABYLON.MeshBuilder.CreateCylinder('rosette'+ri,{diameter:0.14,height:0.06,tessellation:14},scene);
    ros.position.set(-4+rx,2.8+ry,D/2-0.01); ros.rotation.x=Math.PI/2; ros.material=goldM;
    const rosC=BABYLON.MeshBuilder.CreateSphere('rosetteC'+ri,{diameter:0.07,segments:6},scene);
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
  const interactables=new Map([
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

  // ── RAYPICK ───────────────────────────────────────────────────────────────
  function tryPick(cx,cy){
    if(state.activeModal) return;
    const pick=scene.pick(cx,cy,m=>interactables.has(m.name));
    if(pick.hit&&pick.pickedMesh){
      const key=interactables.get(pick.pickedMesh.name);
      if(key) openModal(key);
    }
  }

  // ── MODAL ─────────────────────────────────────────────────────────────────
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
}
