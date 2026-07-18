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

// ─── PROCEDURAL TEXTURE HELPERS ───────────────────────────────────────────────
function makeStoneWallTexture(scene, size=512){
  const tex = new BABYLON.DynamicTexture('stoneTex', size, scene, false);
  const ctx = tex.getContext();
  // Base purple-mauve plaster
  ctx.fillStyle = '#2a0e40';
  ctx.fillRect(0,0,size,size);
  // Stone block grid
  const bw=80, bh=50;
  ctx.strokeStyle='#1a0828'; ctx.lineWidth=2;
  for(let r=0;r<size/bh+1;r++){
    const offset=(r%2)*40;
    for(let c=-1;c<size/bw+1;c++){
      const x=c*bw+offset, y=r*bh;
      ctx.strokeRect(x+2,y+2,bw-4,bh-4);
      // Mortar fill per block — slight colour variation
      const v=Math.random()*18-9;
      ctx.fillStyle=`rgba(${50+v},${18+v},${70+v},0.4)`;
      ctx.fillRect(x+3,y+3,bw-6,bh-6);
    }
  }
  // Noise grain overlay
  const imgData=ctx.getImageData(0,0,size,size);
  const d=imgData.data;
  for(let i=0;i<d.length;i+=4){
    const n=(Math.random()-0.5)*22;
    d[i]  =Math.max(0,Math.min(255,d[i]+n));
    d[i+1]=Math.max(0,Math.min(255,d[i+1]+n));
    d[i+2]=Math.max(0,Math.min(255,d[i+2]+n));
  }
  ctx.putImageData(imgData,0,0);
  // Cracks
  ctx.strokeStyle='rgba(10,4,18,0.5)'; ctx.lineWidth=1;
  for(let k=0;k<6;k++){
    ctx.beginPath();
    let cx=Math.random()*size, cy=Math.random()*size;
    ctx.moveTo(cx,cy);
    for(let s=0;s<8;s++){ cx+=Math.random()*20-10; cy+=Math.random()*15; ctx.lineTo(cx,cy); }
    ctx.stroke();
  }
  tex.update();
  return tex;
}

function makeWoodFloorTexture(scene, size=512){
  const tex = new BABYLON.DynamicTexture('woodTex', size, scene, false);
  const ctx = tex.getContext();
  ctx.fillStyle='#1a0c05'; ctx.fillRect(0,0,size,size);
  const plankW=size/4;
  for(let col=0;col<4;col++){
    // Each plank column — staggered
    const x=col*plankW;
    for(let row=0;row<3;row++){
      const pY=row*(size/3+(Math.random()*20-10));
      // Plank base colour
      const b=10+Math.floor(Math.random()*18);
      ctx.fillStyle=`rgb(${30+b},${14+b},${5+b})`;
      ctx.fillRect(x+1,pY,plankW-2,size/3-1);
      // Wood grain lines
      ctx.strokeStyle=`rgba(0,0,0,0.18)`; ctx.lineWidth=1;
      for(let g=0;g<6;g++){
        const gy=pY+Math.random()*(size/3);
        ctx.beginPath(); ctx.moveTo(x,gy);
        for(let s=0;s<5;s++) ctx.lineTo(x+(s+1)*plankW/5, gy+(Math.random()-0.5)*4);
        ctx.stroke();
      }
      // Nail dots
      ctx.fillStyle='#0e0805';
      ctx.beginPath(); ctx.arc(x+10,pY+12,2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x+plankW-10,pY+12,2,0,Math.PI*2); ctx.fill();
    }
  }
  // Noise
  const imgData=ctx.getImageData(0,0,size,size);
  const d=imgData.data;
  for(let i=0;i<d.length;i+=4){
    const n=(Math.random()-0.5)*12;
    d[i]=Math.max(0,Math.min(255,d[i]+n));
    d[i+1]=Math.max(0,Math.min(255,d[i+1]+n));
    d[i+2]=Math.max(0,Math.min(255,d[i+2]+n));
  }
  ctx.putImageData(imgData,0,0);
  tex.update(); return tex;
}

function makeBeamCeilingTexture(scene, size=512){
  const tex = new BABYLON.DynamicTexture('ceilTex', size, scene, false);
  const ctx = tex.getContext();
  // Dark ceiling field
  ctx.fillStyle='#0d0616'; ctx.fillRect(0,0,size,size);
  // Exposed timber beams
  const beamW=60, gap=120;
  for(let bx=0;bx<size;bx+=gap){
    ctx.fillStyle='#1e0e06';
    ctx.fillRect(bx,0,beamW,size);
    // Beam grain
    ctx.strokeStyle='rgba(0,0,0,0.25)'; ctx.lineWidth=1.5;
    for(let g=0;g<8;g++){
      const gx=bx+5+g*(beamW/8);
      ctx.beginPath(); ctx.moveTo(gx,0);
      for(let s=0;s<6;s++) ctx.lineTo(gx+(Math.random()-0.5)*5, (s+1)*size/6);
      ctx.stroke();
    }
    // Beam edge shadow
    const grad=ctx.createLinearGradient(bx,0,bx+beamW,0);
    grad.addColorStop(0,'rgba(0,0,0,0.4)');
    grad.addColorStop(0.5,'rgba(0,0,0,0)');
    grad.addColorStop(1,'rgba(0,0,0,0.35)');
    ctx.fillStyle=grad; ctx.fillRect(bx,0,beamW,size);
  }
  // Cobweb hints in corners
  ctx.strokeStyle='rgba(80,50,100,0.35)'; ctx.lineWidth=0.8;
  for(let w=0;w<4;w++){
    const wx=w%2===0?0:size, wy=w<2?0:size;
    for(let r=0;r<6;r++){
      ctx.beginPath(); ctx.moveTo(wx,wy);
      ctx.lineTo(wx+(wx?-1:1)*(40+r*10), wy+(wy?-1:1)*(30+r*8));
      ctx.stroke();
    }
  }
  tex.update(); return tex;
}

function makeStoneFireplaceTexture(scene, size=256){
  const tex = new BABYLON.DynamicTexture('fpTex', size, scene, false);
  const ctx = tex.getContext();
  ctx.fillStyle='#1e1520'; ctx.fillRect(0,0,size,size);
  // Rough stone blocks
  const bw=50, bh=38;
  for(let r=0;r<size/bh+1;r++){
    const off=(r%2)*25;
    for(let c=-1;c<size/bw+1;c++){
      const x=c*bw+off, y=r*bh;
      const v=Math.random()*15-7;
      ctx.fillStyle=`rgb(${42+v},${30+v},${50+v})`;
      ctx.fillRect(x+2,y+2,bw-4,bh-4);
      ctx.strokeStyle='#120e1a'; ctx.lineWidth=2;
      ctx.strokeRect(x+2,y+2,bw-4,bh-4);
    }
  }
  // Soot smear near firebox
  const sg=ctx.createRadialGradient(size/2,size,10,size/2,size,120);
  sg.addColorStop(0,'rgba(0,0,0,0.7)'); sg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=sg; ctx.fillRect(0,0,size,size);
  tex.update(); return tex;
}

function makeBookSpineTexture(scene, size=64, colHex='#7a1a1a'){
  const tex = new BABYLON.DynamicTexture('bookTex_'+Math.random().toString(36).slice(2), size, scene, false);
  const ctx = tex.getContext();
  ctx.fillStyle=colHex; ctx.fillRect(0,0,size,size);
  // Spine line
  ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(4,0); ctx.lineTo(4,size); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(size-4,0); ctx.lineTo(size-4,size); ctx.stroke();
  // Gold title band
  ctx.fillStyle='rgba(180,140,40,0.35)';
  ctx.fillRect(6,size*0.3,size-12,size*0.15);
  tex.update(); return tex;
}

function makeDirtFloorTexture(scene, size=256){
  const tex = new BABYLON.DynamicTexture('dirtTex', size, scene, false);
  const ctx = tex.getContext();
  ctx.fillStyle='#1a0e08'; ctx.fillRect(0,0,size,size);
  const imgData=ctx.getImageData(0,0,size,size);
  const d=imgData.data;
  for(let i=0;i<d.length;i+=4){
    const n=Math.random()*30;
    d[i]=Math.max(0,20+n); d[i+1]=Math.max(0,10+n*0.5); d[i+2]=Math.max(0,4+n*0.3); d[i+3]=255;
  }
  ctx.putImageData(imgData,0,0);
  tex.update(); return tex;
}

// ─── BABYLON INIT ─────────────────────────────────────────────────────────────
function initBabylon(){
  const engine = new BABYLON.Engine($('game-canvas'), true, { antialias:true });
  const scene  = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.03,0.01,0.05,1);
  scene.fogMode    = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogColor   = new BABYLON.Color3(0.03,0.01,0.05);
  scene.fogDensity = 0.038;

  // ── CAMERA ─────────────────────────────────────────────────────────────────
  const camera = new BABYLON.UniversalCamera('cam', new BABYLON.Vector3(0,1.7,-7), scene);
  camera.setTarget(new BABYLON.Vector3(0,1.7,0));
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
    // Smoothly lerp pitch back to 0, keep yaw (forward direction)
    if(recentreAnim) clearInterval(recentreAnim);
    const startPitch=camPitch;
    let prog=0;
    recentreAnim=setInterval(()=>{
      prog+=0.08;
      if(prog>=1){ prog=1; clearInterval(recentreAnim); recentreAnim=null; }
      // Ease out cubic
      const t=1-Math.pow(1-prog,3);
      camPitch=startPitch*(1-t);
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

  window.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); if(e.key==='r'||e.key==='R') recentreView(); },{passive:true});

  // ── TEXTURES ───────────────────────────────────────────────────────────────
  const stoneTex    = makeStoneWallTexture(scene);
  stoneTex.uScale=4; stoneTex.vScale=3;
  const woodTex     = makeWoodFloorTexture(scene);
  woodTex.uScale=6; woodTex.vScale=4;
  const ceilTex     = makeBeamCeilingTexture(scene);
  ceilTex.uScale=5; ceilTex.vScale=3;
  const fpTex       = makeStoneFireplaceTexture(scene);
  const dirtTex     = makeDirtFloorTexture(scene);

  // ── MATERIALS ──────────────────────────────────────────────────────────────
  function mat(name){ const m=new BABYLON.StandardMaterial(name,scene); m.specularColor=new BABYLON.Color3(0.04,0.04,0.04); return m; }

  const wallM = mat('wallM');
  wallM.diffuseTexture = stoneTex;
  wallM.diffuseColor   = new BABYLON.Color3(0.55, 0.4, 0.7); // tint
  wallM.specularColor  = new BABYLON.Color3(0.02,0.01,0.03);

  const floorM = mat('floorM');
  floorM.diffuseTexture = woodTex;
  floorM.specularColor  = new BABYLON.Color3(0.06,0.04,0.02);

  const ceilM = mat('ceilM');
  ceilM.diffuseTexture = ceilTex;

  const fpStoneM = mat('fpStoneM');
  fpStoneM.diffuseTexture = fpTex;

  const woodTrimM = mat('woodTrimM');
  woodTrimM.diffuseColor = new BABYLON.Color3(0.22,0.1,0.04);

  const goldM = mat('goldM');
  goldM.diffuseColor  = new BABYLON.Color3(0.5,0.36,0.1);
  goldM.specularColor = new BABYLON.Color3(0.7,0.55,0.2);
  goldM.specularPower = 48;

  const darkWoodM = mat('darkWoodM');
  darkWoodM.diffuseColor = new BABYLON.Color3(0.14,0.07,0.03);

  const dirtM = mat('dirtM');
  dirtM.diffuseTexture = dirtTex;

  function emitM(name,r,g,b,ei=0.8){ const m=mat(name); m.diffuseColor=new BABYLON.Color3(r,g,b); m.emissiveColor=new BABYLON.Color3(r*ei,g*ei,b*ei); return m; }

  // ── ROOM SHELL ─────────────────────────────────────────────────────────────
  const W=22, D=14, H=5.5;

  // Floor
  const floor=BABYLON.MeshBuilder.CreateGround('floor',{width:W,height:D,subdivisions:4},scene);
  floor.material=floorM; floor.receiveShadows=true;

  // Ceiling
  const ceil=BABYLON.MeshBuilder.CreatePlane('ceil',{width:W,height:D},scene);
  ceil.position.y=H; ceil.rotation.x=Math.PI/2;
  const ceilMI=ceilM.clone('ceilMI'); ceilMI.backFaceCulling=false;
  ceil.material=ceilMI;

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

  // ── FIREPLACE (right wall) ─────────────────────────────────────────────────
  const fpX=W/2-0.12, fpZ=1.5;

  // Stone surround — two side pillars + lintel
  const fpL=BABYLON.MeshBuilder.CreateBox('fpL',{width:0.28,height:3.2,depth:0.55},scene);
  fpL.position.set(fpX-0.15,1.6,fpZ-1.25); fpL.material=fpStoneM;
  const fpR=BABYLON.MeshBuilder.CreateBox('fpR',{width:0.28,height:3.2,depth:0.55},scene);
  fpR.position.set(fpX-0.15,1.6,fpZ+1.25); fpR.material=fpStoneM;
  const lintel=BABYLON.MeshBuilder.CreateBox('lintel',{width:0.28,height:0.35,depth:2.8},scene);
  lintel.position.set(fpX-0.15,3.05,fpZ); lintel.material=fpStoneM;

  // Mantelshelf (wood, with gold edge)
  const mantel=BABYLON.MeshBuilder.CreateBox('mantel',{width:0.38,height:0.1,depth:3.0},scene);
  mantel.position.set(fpX-0.18,3.25,fpZ); mantel.material=darkWoodM;
  const mantelEdge=BABYLON.MeshBuilder.CreateBox('mantelEdge',{width:0.04,height:0.12,depth:3.05},scene);
  mantelEdge.position.set(fpX-0.36,3.25,fpZ); mantelEdge.material=goldM;

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
      const btex=makeBookSpineTexture(scene,64,col);
      const bm=mat('bm'+sh+Math.floor(bz*10));
      bm.diffuseTexture=btex;
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

  // ── PORTRAIT (back wall) ───────────────────────────────────────────────────
  const portM=mat('portM'); portM.diffuseColor=new BABYLON.Color3(0.2,0.1,0.15); portM.emissiveColor=new BABYLON.Color3(0.04,0.02,0.03);
  const portMesh=BABYLON.MeshBuilder.CreatePlane('portrait_mesh',{width:1.6,height:2.1},scene);
  portMesh.position.set(-4,2.8,D/2-0.06); portMesh.material=portM;
  const pfM=goldM.clone('pfM');
  const portFrame=BABYLON.MeshBuilder.CreateBox('portFrame',{width:1.78,height:2.28,depth:0.06},scene);
  portFrame.position.set(-4,2.8,D/2-0.04); portFrame.material=pfM;

  // ── MIRROR (back wall right) ───────────────────────────────────────────────
  const mirM=mat('mirM'); mirM.diffuseColor=new BABYLON.Color3(0.35,0.3,0.42); mirM.specularColor=new BABYLON.Color3(0.6,0.55,0.7); mirM.specularPower=64; mirM.emissiveColor=new BABYLON.Color3(0.03,0.02,0.05);
  const mirMesh=BABYLON.MeshBuilder.CreatePlane('mirror_mesh',{width:1.0,height:2.4},scene);
  mirMesh.position.set(4,2.7,D/2-0.06); mirMesh.material=mirM;
  const mfM=goldM.clone('mfM');
  const mirFrame=BABYLON.MeshBuilder.CreateBox('mirFrame',{width:1.14,height:2.55,depth:0.06},scene);
  mirFrame.position.set(4,2.7,D/2-0.04); mirFrame.material=mfM;

  // ── CLOAK (hook near front door) ──────────────────────────────────────────
  const cloakM=mat('cloakM'); cloakM.diffuseColor=new BABYLON.Color3(0.07,0.04,0.09);
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
  const tipM=mat('tipM'); tipM.emissiveColor=new BABYLON.Color3(0.4,0.08,0.8); tipM.diffuseColor=new BABYLON.Color3(0.2,0.04,0.4);
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

  // ── CHANDELIER ──────────────────────────────────────────────────────────────
  const chanY=H-0.3;
  const chainM=mat('chainM'); chainM.diffuseColor=new BABYLON.Color3(0.4,0.3,0.1);
  const chain=BABYLON.MeshBuilder.CreateCylinder('chain',{diameter:0.06,height:1.2,tessellation:6},scene);
  chain.position.set(0,chanY-0.5,0); chain.material=chainM;
  const ring=BABYLON.MeshBuilder.CreateTorus('ring',{diameter:1.6,thickness:0.07,tessellation:28},scene);
  ring.position.set(0,chanY-1.1,0); ring.rotation.x=Math.PI/2; ring.material=goldM;
  for(let a=0;a<6;a++){
    const angle=(a/6)*Math.PI*2;
    const ax=Math.sin(angle)*0.8, az=Math.cos(angle)*0.8;
    const arm=BABYLON.MeshBuilder.CreateBox('arm'+a,{width:0.04,height:0.04,depth:0.84},scene);
    arm.position.set(ax*0.4,chanY-1.1,az*0.4); arm.rotation.y=angle; arm.material=goldM;
    const can=BABYLON.MeshBuilder.CreateCylinder('cc'+a,{diameterTop:0.04,diameterBottom:0.055,height:0.2,tessellation:8},scene);
    can.position.set(ax,chanY-1.12,az); can.material=mat('cw'+a); can.material.diffuseColor=new BABYLON.Color3(0.92,0.87,0.75);
    const fl=BABYLON.MeshBuilder.CreateSphere('cf'+a,{diameter:0.07,segments:5},scene);
    fl.position.set(ax,chanY-0.99,az); fl.scaling.y=1.5;
    fl.material=emitM('cfm'+a,1,0.6,0.1,0.9);
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
  const ambient=new BABYLON.HemisphericLight('amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.07; ambient.diffuse=new BABYLON.Color3(0.38,0.18,0.55);
  ambient.groundColor=new BABYLON.Color3(0.04,0.02,0.06);

  const chanLight=new BABYLON.PointLight('chanL',new BABYLON.Vector3(0,chanY-1.1,0),scene);
  chanLight.diffuse=new BABYLON.Color3(0.9,0.72,0.38); chanLight.intensity=0.85; chanLight.range=20;

  const fireLight=new BABYLON.PointLight('fireL',new BABYLON.Vector3(fpX-0.8,0.9,fpZ),scene);
  fireLight.diffuse=new BABYLON.Color3(1,0.48,0.12); fireLight.intensity=1.2; fireLight.range=11;

  // Green cauldron glow
  const cauldLight=new BABYLON.PointLight('cauldL',new BABYLON.Vector3(-3,0.7,2),scene);
  cauldLight.diffuse=new BABYLON.Color3(0.2,0.9,0.35); cauldLight.intensity=0.55; cauldLight.range=5;

  const sconceL=new BABYLON.PointLight('scL',new BABYLON.Vector3(-6,2.8,-3),scene);
  sconceL.diffuse=new BABYLON.Color3(0.85,0.62,0.32); sconceL.intensity=0.5; sconceL.range=9;
  const sconceR=new BABYLON.PointLight('scR',new BABYLON.Vector3(6,2.8,-3),scene);
  sconceR.diffuse=new BABYLON.Color3(0.85,0.62,0.32); sconceR.intensity=0.5; sconceR.range=9;

  // ── FLICKER ───────────────────────────────────────────────────────────────
  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    chanLight.intensity=flk(0.85,0.18,2.1,0);
    fireLight.intensity=flk(1.2,0.38,3.7,1.2);
    cauldLight.intensity=flk(0.55,0.18,1.8,3.0);
    sconceL.intensity  =flk(0.50,0.12,1.8,0.6);
    sconceR.intensity  =flk(0.50,0.12,2.4,2.1);
    // Ember pulse
    if(embers) embers.material.emissiveColor=new BABYLON.Color3(flk(0.6,0.15,3.7,0.5),flk(0.18,0.06,3.7,1.0),0.02);
    // Cauldron brew shimmer
    if(brew) brew.material.emissiveColor=new BABYLON.Color3(0.03,flk(0.35,0.1,1.8,3.0),0.1);
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
