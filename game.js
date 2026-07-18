/* ═══════════════════════════════════════════
   HEXHAUS — game.js
   Babylon.js first-person 3D engine
   © 2026 Melanie Mizzi. All rights reserved.
   ═══════════════════════════════════════════ */

'use strict';

// ─── ITEMS ──────────────────────────────────────────────────────────────────
const ITEMS = {
  cloak: {
    name: 'The Black Cloak',      icon: '🧥', collectible: true,
    desc: 'Heavy wool, charcoal-black. A silver clasp shaped like a moth. It smells of woodsmoke and something older.'
  },
  staff: {
    name: 'Gnarled Staff',        icon: '🪄', collectible: true,
    desc: 'Twisted hawthorn wood, taller than you. Three runes carved near the tip. One is still warm.'
  },
  key: {
    name: 'Iron Key',             icon: '🗝️', collectible: true,
    desc: 'Heavy old iron. The bow is shaped like a crescent moon. It opens something important.'
  },
  letter: {
    name: 'Sealed Letter',        icon: '📜', collectible: true,
    desc: 'Black wax seal, pressed with a hexagon. The paper is warm. It hums faintly when held close.'
  },
  rosemary: {
    name: 'Dried Rosemary',       icon: '🌿', collectible: true,
    desc: 'Tied with red thread. Hung above a doorway, rosemary keeps what shouldn\'t enter from entering.'
  },
  portrait: {
    name: 'Family Portrait',      icon: '🖼️', collectible: false,
    desc: 'Four figures. Three look outward. One — the smallest — faces the wall. The paint is old. The posture is not.'
  },
  mirror: {
    name: 'Standing Mirror',      icon: '🪞', collectible: false,
    desc: 'Your reflection is a half-second slow. It catches up when you stop moving. When you look away, it doesn\'t.'
  },
  clock: {
    name: 'Grandfather Clock',    icon: '🕰️', collectible: false,
    desc: 'Stopped at 3:17. The pendulum is still. But you heard it tick when you entered the room.'
  },
  bookshelf: {
    name: 'The Bookshelves',      icon: '📚', collectible: false,
    desc: 'Hundreds of volumes. Herbalism, astronomy, law, names. One shelf is labelled in a language you almost recognise.'
  },
  fireplace: {
    name: 'The Fireplace',        icon: '🔥', collectible: false,
    desc: 'The fire is lit. The hearth is cold. The wood isn\'t burning — it just looks that way.'
  },
};

// ─── STATE ───────────────────────────────────────────────────────────────────
const state = { inventory: [], activeModal: null };

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const loadScreen  = $('loading-screen');
const loadBar     = $('load-bar');
const loadText    = $('load-text');
const titleScreen = $('title-screen');
const gameCanvas  = $('game-canvas');
const hud         = $('hud');
const modal       = $('examine-modal');
const modalIcon   = $('modal-icon');
const modalName   = $('modal-name');
const modalDesc   = $('modal-desc');
const modalCollect= $('modal-collect');
const modalClose  = $('modal-close');
const modalBdrop  = $('modal-backdrop');
const invSlots    = $('inv-slots');
const itemCount   = $('item-count');

// ─── LOADING SEQUENCE ─────────────────────────────────────────────────────────
const LOAD_STEPS = [
  [10, 'Unlocking the front door…'],
  [30, 'Lighting the candles…'],
  [55, 'Placing the furniture…'],
  [75, 'Listening for footsteps…'],
  [92, 'She knows you are here…'],
  [100,'Welcome.'],
];
let stepIdx = 0;
function advanceLoad() {
  if (stepIdx >= LOAD_STEPS.length) return;
  const [pct, msg] = LOAD_STEPS[stepIdx++];
  loadBar.style.width = pct + '%';
  loadText.textContent = msg;
  if (stepIdx < LOAD_STEPS.length) setTimeout(advanceLoad, 600 + Math.random() * 400);
  else setTimeout(showTitle, 900);
}
setTimeout(advanceLoad, 300);

function showTitle() {
  loadScreen.classList.add('hidden');
  titleScreen.classList.remove('hidden');
}

$('btn-enter').addEventListener('click', () => {
  titleScreen.classList.add('hidden');
  gameCanvas.classList.remove('hidden');
  hud.classList.remove('hidden');
  initBabylon();
});

// ─── BABYLON INIT ─────────────────────────────────────────────────────────────
function initBabylon() {
  const engine = new BABYLON.Engine(gameCanvas, true, {
    preserveDrawingBuffer: false,
    stencil: false,
    antialias: true,
  });

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.04, 0.02, 0.06, 1);

  // Fog for atmosphere
  scene.fogMode    = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogColor   = new BABYLON.Color3(0.04, 0.02, 0.06);
  scene.fogDensity = 0.045;

  // ── CAMERA ─────────────────────────────────────────────────────────────────
  const camera = new BABYLON.UniversalCamera(
    'cam', new BABYLON.Vector3(0, 1.7, -7), scene
  );
  camera.setTarget(new BABYLON.Vector3(0, 1.7, 0));
  camera.minZ = 0.1;
  camera.maxZ = 60;
  camera.fov  = 1.1; // ~63° — natural first person

  // No pointer lock — free cursor. Manually handle look drag.
  // Remove default inputs so we control everything ourselves.
  camera.inputs.clear();

  // ── LOOK DRAG (mouse + touch) ───────────────────────────────────────────────
  let isDragging   = false;
  let dragStartX   = 0, dragStartY = 0;
  let camYaw       = 0, camPitch   = 0;
  let lastClientX  = 0, lastClientY= 0;
  const TAP_THRESHOLD = 10; // px — less than this = tap, not drag

  const PITCH_MIN = -0.55; // look down limit (rad)
  const PITCH_MAX =  0.55; // look up limit (rad)
  const SENSITIVITY = 0.0025;

  function applyRotation() {
    const forward = new BABYLON.Vector3(
      Math.sin(camYaw) * Math.cos(camPitch),
      Math.sin(camPitch),
      Math.cos(camYaw) * Math.cos(camPitch)
    );
    camera.setTarget(camera.position.add(forward));
  }

  // Mouse
  gameCanvas.addEventListener('mousedown', e => {
    if (state.activeModal) return;
    isDragging = true;
    dragStartX = e.clientX; dragStartY = e.clientY;
    lastClientX = e.clientX; lastClientY = e.clientY;
  }, { passive: true });

  window.addEventListener('mousemove', e => {
    if (!isDragging || state.activeModal) return;
    const dx = e.clientX - lastClientX;
    const dy = e.clientY - lastClientY;
    lastClientX = e.clientX; lastClientY = e.clientY;
    camYaw   -= dx * SENSITIVITY;
    camPitch  = Math.max(PITCH_MIN, Math.min(PITCH_MAX, camPitch - dy * SENSITIVITY));
    applyRotation();
  }, { passive: true });

  window.addEventListener('mouseup', e => {
    if (!isDragging) return;
    const moved = Math.abs(e.clientX - dragStartX) + Math.abs(e.clientY - dragStartY);
    isDragging = false;
    if (moved < TAP_THRESHOLD) tryPickObject(e.clientX, e.clientY, scene, camera);
  }, { passive: true });

  // Touch
  let activeTouchId = null;
  gameCanvas.addEventListener('touchstart', e => {
    if (state.activeModal) return;
    if (activeTouchId !== null) return;
    const t = e.changedTouches[0];
    activeTouchId = t.identifier;
    isDragging = true;
    dragStartX = t.clientX; dragStartY = t.clientY;
    lastClientX = t.clientX; lastClientY = t.clientY;
  }, { passive: true });

  gameCanvas.addEventListener('touchmove', e => {
    if (!isDragging || state.activeModal) return;
    const t = [...e.changedTouches].find(tt => tt.identifier === activeTouchId);
    if (!t) return;
    const dx = t.clientX - lastClientX;
    const dy = t.clientY - lastClientY;
    lastClientX = t.clientX; lastClientY = t.clientY;
    camYaw   -= dx * SENSITIVITY;
    camPitch  = Math.max(PITCH_MIN, Math.min(PITCH_MAX, camPitch - dy * SENSITIVITY));
    applyRotation();
  }, { passive: true });

  gameCanvas.addEventListener('touchend', e => {
    const t = [...e.changedTouches].find(tt => tt.identifier === activeTouchId);
    if (!t) return;
    const moved = Math.abs(t.clientX - dragStartX) + Math.abs(t.clientY - dragStartY);
    isDragging = false;
    activeTouchId = null;
    if (moved < TAP_THRESHOLD) tryPickObject(t.clientX, t.clientY, scene, camera);
  }, { passive: true });

  // Escape closes modal
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ── MATERIALS ──────────────────────────────────────────────────────────────
  function solidMat(name, hex, roughness = 0.85) {
    const m = new BABYLON.StandardMaterial(name, scene);
    m.diffuseColor = BABYLON.Color3.FromHexString(hex);
    m.specularColor = new BABYLON.Color3(roughness * 0.08, roughness * 0.08, roughness * 0.08);
    return m;
  }
  function emitMat(name, hex, intensity = 0.6) {
    const m = new BABYLON.StandardMaterial(name, scene);
    m.emissiveColor = BABYLON.Color3.FromHexString(hex).scale(intensity);
    m.diffuseColor  = BABYLON.Color3.FromHexString(hex).scale(0.3);
    return m;
  }

  // Wall — deep purple-mauve plaster
  const wallMat  = solidMat('wall',  '#3a1555');
  wallMat.diffuseColor = new BABYLON.Color3(0.18, 0.07, 0.27);

  // Floor — dark aged wood
  const floorMat = solidMat('floor', '#1e0c06');
  floorMat.diffuseColor = new BABYLON.Color3(0.12, 0.06, 0.02);

  // Ceiling — very dark
  const ceilMat  = solidMat('ceil',  '#0e0618');
  ceilMat.diffuseColor = new BABYLON.Color3(0.06, 0.02, 0.09);

  // Stone — for fireplace
  const stoneMat = solidMat('stone', '#2a1e35');
  stoneMat.diffuseColor = new BABYLON.Color3(0.14, 0.1, 0.18);

  // Wood trim — skirting, dado
  const woodMat  = solidMat('wood',  '#2a1205');
  woodMat.diffuseColor = new BABYLON.Color3(0.16, 0.07, 0.02);

  // Gold trim
  const goldMat  = solidMat('gold',  '#7a5a20');
  goldMat.diffuseColor = new BABYLON.Color3(0.48, 0.34, 0.1);
  goldMat.specularColor = new BABYLON.Color3(0.6, 0.5, 0.2);
  goldMat.specularPower = 32;

  // ── ROOM GEOMETRY ──────────────────────────────────────────────────────────
  // Entrance Hall: 22m wide × 14m deep × 5.5m tall
  const W = 22, D = 14, H = 5.5;

  // Floor
  const floor = BABYLON.MeshBuilder.CreateGround('floor', { width: W, height: D }, scene);
  floor.material = floorMat;
  floor.receiveShadows = true;

  // Ceiling
  const ceil = BABYLON.MeshBuilder.CreatePlane('ceil', { width: W, height: D }, scene);
  ceil.position.y = H;
  ceil.rotation.x = Math.PI / 2;
  ceil.material = ceilMat;

  // Back wall
  const backWall = BABYLON.MeshBuilder.CreatePlane('backWall', { width: W, height: H }, scene);
  backWall.position.set(0, H/2, D/2);
  backWall.material = wallMat;

  // Front wall (behind camera start)
  const frontWall = BABYLON.MeshBuilder.CreatePlane('frontWall', { width: W, height: H }, scene);
  frontWall.position.set(0, H/2, -D/2);
  frontWall.rotation.y = Math.PI;
  frontWall.material = wallMat;

  // Left wall
  const leftWall = BABYLON.MeshBuilder.CreatePlane('leftWall', { width: D, height: H }, scene);
  leftWall.position.set(-W/2, H/2, 0);
  leftWall.rotation.y = Math.PI/2;
  leftWall.material = wallMat;

  // Right wall
  const rightWall = BABYLON.MeshBuilder.CreatePlane('rightWall', { width: D, height: H }, scene);
  rightWall.position.set(W/2, H/2, 0);
  rightWall.rotation.y = -Math.PI/2;
  rightWall.material = wallMat;

  // Dado rail (horizontal moulding ~1m height)
  function dadoRail(name, w, posX, posY, posZ, rotY = 0) {
    const r = BABYLON.MeshBuilder.CreateBox(name, { width: w, height: 0.06, depth: 0.08 }, scene);
    r.position.set(posX, posY, posZ);
    r.rotation.y = rotY;
    r.material = woodMat;
    return r;
  }
  dadoRail('dado_back',  W,  0,      1.05, D/2 - 0.05);
  dadoRail('dado_front', W,  0,      1.05, -D/2 + 0.05, Math.PI);
  dadoRail('dado_left',  D,  -W/2+0.05, 1.05, 0, Math.PI/2);
  dadoRail('dado_right', D,  W/2-0.05,  1.05, 0, -Math.PI/2);

  // Skirting boards
  function skirting(name, w, posX, posY, posZ, rotY = 0) {
    const s = BABYLON.MeshBuilder.CreateBox(name, { width: w, height: 0.18, depth: 0.06 }, scene);
    s.position.set(posX, posY, posZ);
    s.rotation.y = rotY;
    s.material = woodMat;
    return s;
  }
  skirting('sk_back',  W, 0,     0.09, D/2 - 0.04);
  skirting('sk_front', W, 0,     0.09, -D/2 + 0.04, Math.PI);
  skirting('sk_left',  D, -W/2+0.04, 0.09, 0, Math.PI/2);
  skirting('sk_right', D, W/2-0.04,  0.09, 0, -Math.PI/2);

  // Crown moulding
  function crown(name, w, posX, posY, posZ, rotY = 0) {
    const c = BABYLON.MeshBuilder.CreateBox(name, { width: w, height: 0.1, depth: 0.1 }, scene);
    c.position.set(posX, posY, posZ);
    c.rotation.y = rotY;
    c.material = goldMat;
    return c;
  }
  crown('cr_back',  W, 0,     H-0.06, D/2 - 0.06);
  crown('cr_front', W, 0,     H-0.06, -D/2 + 0.06, Math.PI);
  crown('cr_left',  D, -W/2+0.06, H-0.06, 0, Math.PI/2);
  crown('cr_right', D, W/2-0.06,  H-0.06, 0, -Math.PI/2);

  // Floorboards grain strips
  for (let i = -5; i <= 5; i++) {
    const plank = BABYLON.MeshBuilder.CreateBox(`plank_${i}`, { width: 0.02, height: 0.005, depth: D }, scene);
    plank.position.set(i * 2, 0.002, 0);
    plank.material = woodMat;
  }

  // ── FIREPLACE (right wall, mid-depth) ─────────────────────────────────────
  const fpX = W/2 - 0.1, fpZ = 1;

  // Surround
  const fpBase = BABYLON.MeshBuilder.CreateBox('fpBase', { width: 0.3, height: 2.8, depth: 3.2 }, scene);
  fpBase.position.set(fpX - 0.15, 1.4, fpZ);
  fpBase.material = stoneMat;

  // Mantelshelf
  const mantel = BABYLON.MeshBuilder.CreateBox('mantel', { width: 0.4, height: 0.12, depth: 3.6 }, scene);
  mantel.position.set(fpX - 0.2, 2.9, fpZ);
  mantel.material = woodMat;

  // Firebox (dark recess)
  const firebox = BABYLON.MeshBuilder.CreateBox('firebox', { width: 0.15, height: 1.2, depth: 2.2 }, scene);
  firebox.position.set(fpX, 0.7, fpZ);
  const fireboxMat = new BABYLON.StandardMaterial('fireboxMat', scene);
  fireboxMat.diffuseColor = new BABYLON.Color3(0.05, 0.02, 0.01);
  firebox.material = fireboxMat;

  // Grate bars
  for (let g = -3; g <= 3; g++) {
    const bar = BABYLON.MeshBuilder.CreateBox(`grate_${g}`, { width: 0.04, height: 0.6, depth: 0.04 }, scene);
    bar.position.set(fpX - 0.02, 0.3, fpZ + g * 0.28);
    bar.material = solidMat(`gm_${g}`, '#1a1a1a');
  }

  // Chequered tiles before fireplace
  for (let tx = -3; tx <= 3; tx++) {
    for (let tz = 0; tz <= 2; tz++) {
      const tile = BABYLON.MeshBuilder.CreateBox(`tile_${tx}_${tz}`, { width: 0.48, height: 0.01, depth: 0.48 }, scene);
      tile.position.set(W/2 - 1.0 - tx * 0.5, 0.006, fpZ - 0.8 + tz * 0.5);
      const dark = (tx + tz) % 2 === 0;
      tile.material = solidMat(`tm_${tx}_${tz}`, dark ? '#1a1020' : '#3a2850');
    }
  }

  // ── BOOKSHELF (left wall) ──────────────────────────────────────────────────
  const bsX = -W/2 + 0.15, bsZ = -1;
  const bsW = 4.5, bsH = 4.2, bsD = 0.5;

  const bsBack = BABYLON.MeshBuilder.CreateBox('bsBack', { width: bsD, height: bsH, depth: bsW }, scene);
  bsBack.position.set(bsX, bsH/2, bsZ);
  bsBack.material = woodMat;

  // Shelves
  for (let sh = 0; sh < 5; sh++) {
    const shelf = BABYLON.MeshBuilder.CreateBox(`shelf_${sh}`, { width: bsD + 0.05, height: 0.06, depth: bsW }, scene);
    shelf.position.set(bsX, 0.5 + sh * 0.75, bsZ);
    shelf.material = woodMat;

    // Books on each shelf
    const bookColors = ['#7a1a1a','#1a4a2a','#2a2a6a','#6a4a1a','#4a1a5a','#1a3a4a','#5a2a1a'];
    let bookPos = bsZ - bsW/2 + 0.1;
    while (bookPos < bsZ + bsW/2 - 0.1) {
      const bw = 0.08 + Math.random() * 0.12;
      const bh = 0.5  + Math.random() * 0.22;
      const book = BABYLON.MeshBuilder.CreateBox(`book_${sh}_${Math.floor(bookPos*10)}`,
        { width: 0.15, height: bh, depth: bw }, scene);
      book.position.set(bsX + 0.12, 0.53 + sh * 0.75 + bh/2, bookPos + bw/2);
      const col = bookColors[Math.floor(Math.random() * bookColors.length)];
      book.material = solidMat(`bm_${sh}_${Math.floor(bookPos*10)}`, col);
      bookPos += bw + 0.01;
    }
  }

  // ── GRANDFATHER CLOCK ──────────────────────────────────────────────────────
  const ckX = -W/2 + 0.2, ckZ = 3.5;

  const ckBase = BABYLON.MeshBuilder.CreateBox('ckBase', { width: 0.5, height: 0.3, depth: 0.5 }, scene);
  ckBase.position.set(ckX, 0.15, ckZ);
  ckBase.material = woodMat;

  const ckBody = BABYLON.MeshBuilder.CreateBox('ckBody', { width: 0.55, height: 2.8, depth: 0.55 }, scene);
  ckBody.position.set(ckX, 1.7, ckZ);
  ckBody.material = woodMat;

  const ckTop = BABYLON.MeshBuilder.CreateBox('ckTop', { width: 0.65, height: 0.45, depth: 0.6 }, scene);
  ckTop.position.set(ckX, 3.33, ckZ);
  ckTop.material = woodMat;

  // Clock face
  const ckFace = BABYLON.MeshBuilder.CreatePlane('ckFace', { width: 0.38, height: 0.38 }, scene);
  ckFace.position.set(ckX + 0.28, 2.9, ckZ);
  ckFace.rotation.y = -Math.PI/2;
  const ckFaceMat = new BABYLON.StandardMaterial('ckFaceMat', scene);
  ckFaceMat.emissiveColor = new BABYLON.Color3(0.7, 0.65, 0.45);
  ckFace.material = ckFaceMat;

  // Pendulum
  const pendulum = BABYLON.MeshBuilder.CreateBox('pendulum', { width: 0.04, height: 1.2, depth: 0.04 }, scene);
  pendulum.position.set(ckX + 0.05, 1.4, ckZ);
  pendulum.material = goldMat;

  // ── CHANDELIER ──────────────────────────────────────────────────────────────
  const chandelierY = H - 0.3;

  // Chain
  const chain = BABYLON.MeshBuilder.CreateCylinder('chain', { diameter: 0.05, height: 1.2, tessellation: 6 }, scene);
  chain.position.set(0, chandelierY - 0.5, 0);
  chain.material = goldMat;

  // Ring
  const ring = BABYLON.MeshBuilder.CreateTorus('ring', { diameter: 1.4, thickness: 0.06, tessellation: 24 }, scene);
  ring.position.set(0, chandelierY - 1.1, 0);
  ring.rotation.x = Math.PI/2;
  ring.material = goldMat;

  // Arms + candles
  for (let a = 0; a < 6; a++) {
    const angle = (a / 6) * Math.PI * 2;
    const ax = Math.sin(angle) * 0.7;
    const az = Math.cos(angle) * 0.7;

    const arm = BABYLON.MeshBuilder.CreateCylinder(`arm_${a}`, { diameter: 0.04, height: 0.72, tessellation: 6 }, scene);
    arm.position.set(ax * 0.5, chandelierY - 1.1, az * 0.5);
    arm.rotation.z = Math.sign(ax) * 0.6;
    arm.rotation.x = Math.sign(az) * 0.3;
    arm.material = goldMat;

    const candle = BABYLON.MeshBuilder.CreateCylinder(`ccandle_${a}`, { diameterTop: 0.045, diameterBottom: 0.055, height: 0.22, tessellation: 8 }, scene);
    candle.position.set(ax, chandelierY - 1.12, az);
    candle.material = solidMat(`candlemat_${a}`, '#f5f0e0');

    const flame = BABYLON.MeshBuilder.CreateSphere(`cflame_${a}`, { diameter: 0.08, segments: 5 }, scene);
    flame.position.set(ax, chandelierY - 0.98, az);
    flame.material = emitMat(`cflameMat_${a}`, '#ff9020', 1.2);
    flame.scaling.y = 1.5;
  }

  // ── PORTRAIT (back wall left) ───────────────────────────────────────────────
  const portrait = BABYLON.MeshBuilder.CreatePlane('portrait_mesh', { width: 1.6, height: 2.1 }, scene);
  portrait.position.set(-4, 2.8, D/2 - 0.05);
  const portMat = new BABYLON.StandardMaterial('portMat', scene);
  portMat.diffuseColor  = new BABYLON.Color3(0.28, 0.16, 0.22);
  portMat.emissiveColor = new BABYLON.Color3(0.08, 0.04, 0.06);
  portrait.material = portMat;

  // Frame
  const portFrame = BABYLON.MeshBuilder.CreateBox('portFrame', { width: 1.75, height: 2.25, depth: 0.05 }, scene);
  portFrame.position.set(-4, 2.8, D/2 - 0.04);
  portFrame.material = goldMat;

  // ── MIRROR (back wall right) ────────────────────────────────────────────────
  const mirror = BABYLON.MeshBuilder.CreatePlane('mirror_mesh', { width: 1.0, height: 2.4 }, scene);
  mirror.position.set(4, 2.6, D/2 - 0.05);
  const mirMat = new BABYLON.StandardMaterial('mirMat', scene);
  mirMat.diffuseColor  = new BABYLON.Color3(0.35, 0.3, 0.42);
  mirMat.specularColor = new BABYLON.Color3(0.6, 0.55, 0.7);
  mirMat.specularPower = 64;
  mirMat.emissiveColor = new BABYLON.Color3(0.04, 0.03, 0.06);
  mirror.material = mirMat;

  const mirFrame = BABYLON.MeshBuilder.CreateBox('mirFrame', { width: 1.15, height: 2.55, depth: 0.06 }, scene);
  mirFrame.position.set(4, 2.6, D/2 - 0.04);
  mirFrame.material = goldMat;

  // ── CLOAK (near front door, left side) ────────────────────────────────────
  const cloak = BABYLON.MeshBuilder.CreateBox('cloak_mesh', { width: 0.6, height: 1.4, depth: 0.15 }, scene);
  cloak.position.set(-6, 1.1, -D/2 + 0.4);
  const cloakMat = new BABYLON.StandardMaterial('cloakMat', scene);
  cloakMat.diffuseColor = new BABYLON.Color3(0.08, 0.05, 0.1);
  cloak.material = cloakMat;

  // ── STAFF (leaning left wall, mid) ────────────────────────────────────────
  const staff = BABYLON.MeshBuilder.CreateCylinder('staff_mesh',
    { diameterTop: 0.04, diameterBottom: 0.06, height: 1.8, tessellation: 8 }, scene);
  staff.position.set(-W/2 + 0.4, 0.9, -2);
  staff.rotation.z = 0.18;
  const staffMat = new BABYLON.StandardMaterial('staffMat', scene);
  staffMat.diffuseColor = new BABYLON.Color3(0.22, 0.12, 0.06);
  staff.material = staffMat;

  // Staff tip glow
  const staffTip = BABYLON.MeshBuilder.CreateSphere('staffTip', { diameter: 0.1 }, scene);
  staffTip.position.set(-W/2 + 0.5, 1.78, -2.1);
  staffTip.material = emitMat('staffTipMat', '#8020ff', 0.9);

  // ── KEY (on mantelshelf) ───────────────────────────────────────────────────
  const key = BABYLON.MeshBuilder.CreateCylinder('key_mesh',
    { diameter: 0.12, height: 0.04, tessellation: 12 }, scene);
  key.position.set(fpX - 0.4, 2.98, fpZ + 0.5);
  key.rotation.x = Math.PI/2;
  key.material = goldMat;

  // ── LETTER (on mantelshelf) ────────────────────────────────────────────────
  const letter = BABYLON.MeshBuilder.CreateBox('letter_mesh', { width: 0.22, height: 0.02, depth: 0.32 }, scene);
  letter.position.set(fpX - 0.4, 2.97, fpZ - 0.5);
  const letterMat = new BABYLON.StandardMaterial('letterMat', scene);
  letterMat.diffuseColor  = new BABYLON.Color3(0.85, 0.78, 0.62);
  letterMat.emissiveColor = new BABYLON.Color3(0.05, 0.02, 0.01);
  letter.material = letterMat;

  // ── ROSEMARY (above front doorway) ────────────────────────────────────────
  const rosemary = BABYLON.MeshBuilder.CreateBox('rosemary_mesh', { width: 0.35, height: 0.06, depth: 0.08 }, scene);
  rosemary.position.set(0, 2.7, -D/2 + 0.15);
  const roseMat = new BABYLON.StandardMaterial('roseMat', scene);
  roseMat.diffuseColor  = new BABYLON.Color3(0.2, 0.35, 0.15);
  roseMat.emissiveColor = new BABYLON.Color3(0.03, 0.06, 0.02);
  rosemary.material = roseMat;

  // ── INTERACTABLE MAPPING ────────────────────────────────────────────────────
  const interactables = new Map([
    ['cloak_mesh',     'cloak'],
    ['staff_mesh',     'staff'],
    ['key_mesh',       'key'],
    ['letter_mesh',    'letter'],
    ['rosemary_mesh',  'rosemary'],
    ['portrait_mesh',  'portrait'],
    ['portFrame',      'portrait'],
    ['mirror_mesh',    'mirror'],
    ['mirFrame',       'mirror'],
    ['ckBody',         'clock'],
    ['ckTop',          'clock'],
    ['ckFace',         'clock'],
    ['bsBack',         'bookshelf'],
    ['fpBase',         'fireplace'],
    ['firebox',        'fireplace'],
    ['mantel',         'fireplace'],
  ]);

  // ── LIGHTING ───────────────────────────────────────────────────────────────
  // Ambient — very dim so walls read correctly
  const ambient = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), scene);
  ambient.intensity = 0.08;
  ambient.diffuse   = new BABYLON.Color3(0.4, 0.2, 0.6);
  ambient.groundColor = new BABYLON.Color3(0.05, 0.02, 0.08);

  // Chandelier point light
  const chanLight = new BABYLON.PointLight('chanLight', new BABYLON.Vector3(0, chandelierY - 1.1, 0), scene);
  chanLight.diffuse    = new BABYLON.Color3(0.95, 0.75, 0.4);
  chanLight.specular   = new BABYLON.Color3(0.3, 0.2, 0.1);
  chanLight.intensity  = 0.9;
  chanLight.range      = 18;

  // Fireplace point light
  const fireLight = new BABYLON.PointLight('fireLight', new BABYLON.Vector3(fpX - 0.6, 0.8, fpZ), scene);
  fireLight.diffuse    = new BABYLON.Color3(1.0, 0.5, 0.15);
  fireLight.specular   = new BABYLON.Color3(0.4, 0.15, 0.0);
  fireLight.intensity  = 1.1;
  fireLight.range      = 10;

  // Left wall sconce
  const sconceL = new BABYLON.PointLight('sconceL', new BABYLON.Vector3(-6, 2.8, -3), scene);
  sconceL.diffuse   = new BABYLON.Color3(0.85, 0.6, 0.35);
  sconceL.intensity = 0.55;
  sconceL.range     = 9;

  // Right wall sconce
  const sconceR = new BABYLON.PointLight('sconceR', new BABYLON.Vector3(6, 2.8, -3), scene);
  sconceR.diffuse   = new BABYLON.Color3(0.85, 0.6, 0.35);
  sconceR.intensity = 0.55;
  sconceR.range     = 9;

  // ── FLICKER ANIMATION ──────────────────────────────────────────────────────
  let t = 0;
  function flicker(base, amp, speed, offset) {
    return base + amp * (
      Math.sin(t * speed + offset) * 0.5 +
      Math.sin(t * speed * 2.3 + offset * 1.7) * 0.3 +
      Math.sin(t * speed * 0.4 + offset * 0.9) * 0.2
    );
  }

  // ── WALL SCONCES (geometry) ────────────────────────────────────────────────
  function makeSconce(name, x, z) {
    const bracket = BABYLON.MeshBuilder.CreateBox(`${name}_br`, { width: 0.08, height: 0.35, depth: 0.22 }, scene);
    bracket.position.set(x > 0 ? x - 0.12 : x + 0.12, 2.7, z);
    bracket.material = goldMat;

    const cyl = BABYLON.MeshBuilder.CreateCylinder(`${name}_c`, { diameterTop: 0.05, diameterBottom: 0.06, height: 0.18 }, scene);
    cyl.position.set(x > 0 ? x - 0.18 : x + 0.18, 2.75, z);
    cyl.material = solidMat(`${name}_cm`, '#f5f0e0');

    const fl = BABYLON.MeshBuilder.CreateSphere(`${name}_fl`, { diameter: 0.07 }, scene);
    fl.position.set(x > 0 ? x - 0.18 : x + 0.18, 2.86, z);
    fl.material = emitMat(`${name}_fm`, '#ffaa40', 1.0);
    fl.scaling.y = 1.4;
    return fl;
  }
  makeSconce('sl', -W/2 + 0.25, -3);
  makeSconce('sr',  W/2 - 0.25, -3);

  // ── RENDER LOOP ─────────────────────────────────────────────────────────────
  scene.registerBeforeRender(() => {
    t += engine.getDeltaTime() * 0.001;
    chanLight.intensity = flicker(0.9, 0.18, 2.1, 0.0);
    fireLight.intensity = flicker(1.1, 0.35, 3.7, 1.2);
    sconceL.intensity   = flicker(0.55, 0.12, 1.8, 0.6);
    sconceR.intensity   = flicker(0.55, 0.12, 2.4, 2.1);
  });

  engine.runRenderLoop(() => scene.render());
  window.addEventListener('resize', () => engine.resize(), { passive: true });

  // ── RAYPICK ────────────────────────────────────────────────────────────────
  function tryPickObject(clientX, clientY, sc, cam) {
    if (state.activeModal) return;
    const pick = sc.pick(clientX, clientY, mesh => interactables.has(mesh.name));
    if (pick.hit && pick.pickedMesh) {
      const itemKey = interactables.get(pick.pickedMesh.name);
      if (itemKey) openModal(itemKey);
    }
  }

  // ── MODAL ──────────────────────────────────────────────────────────────────
  function openModal(key) {
    if (state.inventory.includes(key)) return; // already collected
    const item = ITEMS[key];
    if (!item) return;
    state.activeModal = key;
    modalIcon.textContent = item.icon;
    modalName.textContent = item.name;
    modalDesc.textContent = item.desc;
    modalCollect.style.display = item.collectible ? '' : 'none';
    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
    state.activeModal = null;
  }

  modalBdrop.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);

  modalCollect.addEventListener('click', () => {
    const key = state.activeModal;
    if (!key) return;
    const item = ITEMS[key];
    if (!item || !item.collectible) return;
    state.inventory.push(key);

    // Remove mesh from scene so it can't be picked again
    const meshNames = [...interactables.entries()]
      .filter(([, v]) => v === key)
      .map(([k]) => k);
    meshNames.forEach(name => {
      const mesh = scene.getMeshByName(name);
      if (mesh) mesh.setEnabled(false);
    });

    closeModal();
    updateInventoryUI();
    showToast(`${item.icon} ${item.name} added to inventory`);
  });

  function updateInventoryUI() {
    invSlots.innerHTML = '';
    state.inventory.forEach(key => {
      const item = ITEMS[key];
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      slot.textContent = item.icon;
      slot.title = item.name;
      invSlots.appendChild(slot);
    });
    const collectibles = Object.values(ITEMS).filter(i => i.collectible).length;
    itemCount.textContent = `${state.inventory.length} / ${collectibles} items`;
  }

  function showToast(msg) {
    const existing = document.getElementById('toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
}
