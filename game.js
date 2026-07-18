/* ═══════════════════════════════════════════
   HEXHAUS — game.js
   Babylon.js first-person 3D engine
   Free-mouse look (no pointer lock)
   Tap/click to interact, drag to look
   ═══════════════════════════════════════════ */

// ─── STATE ────────────────────────────────────
const G = {
  engine: null,
  scene: null,
  camera: null,
  canvas: null,
  inventory: [],
  collected: new Set(),
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  lastTouchX: 0,
  lastTouchY: 0,
  cameraPitch: 0,    // vertical angle (radians)
  cameraYaw: 0,      // horizontal angle (radians)
  TAP_THRESHOLD: 10, // px — less than this = tap, more = drag
  lights: [],        // flickering lights ref
  interactables: [], // meshes that can be clicked
  modalOpen: false,
  notifTimer: null,
};

// ─── ITEM DEFINITIONS ────────────────────────
const ITEMS = {
  cloak: {
    name: 'The Black Cloak',
    icon: '🧥',
    collectible: true,
    desc: 'Heavy wool, charcoal-black. A silver clasp shaped like a moth. It smells of woodsmoke and something older.',
  },
  staff: {
    name: 'Gnarled Staff',
    icon: '🪄',
    collectible: true,
    desc: 'Twisted hawthorn wood, taller than you. Three runes carved near the tip. One is still warm to the touch.',
  },
  key: {
    name: 'Iron Key',
    icon: '🗝️',
    collectible: true,
    desc: 'Heavy, old iron. The bow is shaped like a crescent moon. It opens something important.',
  },
  letter: {
    name: 'Sealed Letter',
    icon: '📜',
    collectible: true,
    desc: 'Black wax seal pressed with a hexagon. The paper is warm. It hums faintly when held close.',
  },
  rosemary: {
    name: 'Dried Rosemary',
    icon: '🌿',
    collectible: true,
    desc: 'Tied with red thread. Hung above a doorway — rosemary keeps what shouldn\'t enter from entering.',
  },
  portrait: {
    name: 'Family Portrait',
    icon: '🖼️',
    collectible: false,
    desc: 'Seven figures painted in oils. Six look outward. The seventh, half-hidden by a curtain, faces the wrong way.',
  },
  mirror: {
    name: 'The Long Mirror',
    icon: '🪞',
    collectible: false,
    desc: 'Foxed glass in a tarnished silver frame. Your reflection is a half-second behind you. Or ahead.',
  },
  clock: {
    name: 'Grandfather Clock',
    icon: '🕰️',
    collectible: false,
    desc: 'Stopped at 3:17. The pendulum is still, but something inside ticks. Not a clock tick. Something wet.',
  },
  bookshelf: {
    name: 'The Bookshelf',
    icon: '📚',
    collectible: false,
    desc: 'Packed tight. All the spines face inward. One book has been pulled half out — you didn\'t touch it.',
  },
  fireplace: {
    name: 'The Fireplace',
    icon: '🔥',
    collectible: false,
    desc: 'The fire is lit. The grate is cold. Both of these things are true at the same time.',
  },
};

// ─── BOOT ────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  simulateLoad(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('title-screen').classList.remove('hidden');
    document.getElementById('btn-enter').addEventListener('click', startGame);
  });
});

function simulateLoad(cb) {
  const bar = document.getElementById('load-bar');
  const txt = document.getElementById('load-text');
  const msgs = [
    'Entering the house…',
    'The door was already open…',
    'Something is watching…',
    'She knows you are here…',
  ];
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 18 + 4;
    if (p >= 100) { p = 100; clearInterval(iv); setTimeout(cb, 400); }
    bar.style.width = p + '%';
    txt.textContent = msgs[Math.min(Math.floor(p / 30), msgs.length - 1)];
  }, 200);
}

// ─── START GAME ──────────────────────────────
function startGame() {
  document.getElementById('title-screen').classList.add('hidden');
  const canvas = document.getElementById('game-canvas');
  canvas.classList.remove('hidden');
  document.getElementById('hud').classList.remove('hidden');

  // Add notification div
  const notif = document.createElement('div');
  notif.id = 'notif';
  document.body.appendChild(notif);

  G.canvas = canvas;
  G.engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  G.scene = buildScene();

  // Input handlers
  setupInput(canvas);

  // Render loop
  G.engine.runRenderLoop(() => {
    G.scene.render();
    flickerLights();
  });

  window.addEventListener('resize', () => G.engine.resize());

  // Close modal on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Modal buttons
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-collect').addEventListener('click', collectItem);
}

// ─── SCENE BUILDER ───────────────────────────
function buildScene() {
  const scene = new BABYLON.Scene(G.engine);
  scene.clearColor = new BABYLON.Color4(0.04, 0.02, 0.06, 1);
  scene.gravity = new BABYLON.Vector3(0, -0.15, 0);
  scene.collisionsEnabled = true;
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
  scene.fogColor = new BABYLON.Color3(0.04, 0.02, 0.07);
  scene.fogDensity = 0.018;

  // ── Camera ──
  const camera = new BABYLON.FreeCamera('cam', new BABYLON.Vector3(0, 1.7, 0), scene);
  camera.setTarget(new BABYLON.Vector3(0, 1.7, 1));
  camera.applyGravity = true;
  camera.checkCollisions = true;
  camera.ellipsoid = new BABYLON.Vector3(0.4, 0.85, 0.4);
  camera.minZ = 0.1;
  camera.speed = 0;          // we control movement manually later
  camera.inertia = 0;
  // Don't attach controls — we handle input ourselves
  G.camera = camera;
  G.cameraYaw = 0;
  G.cameraPitch = 0;

  // ── Ambient light (very dim) ──
  const ambient = new BABYLON.HemisphericLight('amb', new BABYLON.Vector3(0,1,0), scene);
  ambient.intensity = 0.06;
  ambient.diffuse = new BABYLON.Color3(0.4, 0.2, 0.5);
  ambient.groundColor = new BABYLON.Color3(0.1, 0.05, 0.08);

  // ── Chandelier point light ──
  const chanLight = new BABYLON.PointLight('chan', new BABYLON.Vector3(0, 4.5, 2), scene);
  chanLight.diffuse = new BABYLON.Color3(1, 0.75, 0.3);
  chanLight.intensity = 1.8;
  chanLight.range = 18;
  G.lights.push({ light: chanLight, base: 1.8, speed: 0.7 + Math.random() * 0.5 });

  // ── Fireplace light ──
  const fireLight = new BABYLON.PointLight('fire', new BABYLON.Vector3(8, 1.2, -4.5), scene);
  fireLight.diffuse = new BABYLON.Color3(1, 0.5, 0.1);
  fireLight.intensity = 2.2;
  fireLight.range = 10;
  G.lights.push({ light: fireLight, base: 2.2, speed: 1.4 + Math.random() * 0.6 });

  // ── Left candle sconce ──
  const sconceL = new BABYLON.PointLight('scL', new BABYLON.Vector3(-7, 2.8, -1), scene);
  sconceL.diffuse = new BABYLON.Color3(1, 0.7, 0.25);
  sconceL.intensity = 0.9;
  sconceL.range = 7;
  G.lights.push({ light: sconceL, base: 0.9, speed: 0.9 + Math.random() * 0.4 });

  // ── Right candle sconce ──
  const sconceR = new BABYLON.PointLight('scR', new BABYLON.Vector3(7, 2.8, -1), scene);
  sconceR.diffuse = new BABYLON.Color3(1, 0.7, 0.25);
  sconceR.intensity = 0.9;
  sconceR.range = 7;
  G.lights.push({ light: sconceR, base: 0.9, speed: 1.1 + Math.random() * 0.3 });

  // ── Build room geometry ──
  buildRoom(scene);

  // ── Place interactable objects ──
  placeObjects(scene);

  return scene;
}

// ─── ROOM GEOMETRY ───────────────────────────
function buildRoom(scene) {
  const mat = (r, g, b) => {
    const m = new BABYLON.StandardMaterial('m' + Math.random(), scene);
    m.diffuseColor = new BABYLON.Color3(r, g, b);
    m.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    return m;
  };

  // Floor — dark wood planks
  const floor = BABYLON.MeshBuilder.CreateBox('floor', { width: 20, height: 0.1, depth: 14 }, scene);
  floor.position = new BABYLON.Vector3(0, 0, 0);
  floor.checkCollisions = true;
  const floorMat = mat(0.12, 0.07, 0.03);
  floorMat.diffuseColor = new BABYLON.Color3(0.15, 0.09, 0.04);
  // Add subtle checker via emissive
  floorMat.emissiveColor = new BABYLON.Color3(0.01, 0.005, 0.002);
  floor.material = floorMat;

  // Ceiling
  const ceil = BABYLON.MeshBuilder.CreateBox('ceil', { width: 20, height: 0.1, depth: 14 }, scene);
  ceil.position = new BABYLON.Vector3(0, 5.2, 0);
  const ceilMat = mat(0.08, 0.04, 0.10);
  ceil.material = ceilMat;

  // Back wall (deep end, z = -7)
  const wallB = BABYLON.MeshBuilder.CreateBox('wallB', { width: 20, height: 5.3, depth: 0.15 }, scene);
  wallB.position = new BABYLON.Vector3(0, 2.6, -7);
  wallB.checkCollisions = true;
  wallB.material = wallMat(scene);

  // Front wall (entry, z = 7) — with doorway gap
  const wallFL = BABYLON.MeshBuilder.CreateBox('wallFL', { width: 7, height: 5.3, depth: 0.15 }, scene);
  wallFL.position = new BABYLON.Vector3(-6.5, 2.6, 7);
  wallFL.checkCollisions = true;
  wallFL.material = wallMat(scene);

  const wallFR = BABYLON.MeshBuilder.CreateBox('wallFR', { width: 7, height: 5.3, depth: 0.15 }, scene);
  wallFR.position = new BABYLON.Vector3(6.5, 2.6, 7);
  wallFR.checkCollisions = true;
  wallFR.material = wallMat(scene);

  const wallFTop = BABYLON.MeshBuilder.CreateBox('wallFT', { width: 6, height: 1.5, depth: 0.15 }, scene);
  wallFTop.position = new BABYLON.Vector3(0, 4.5, 7);
  wallFTop.checkCollisions = true;
  wallFTop.material = wallMat(scene);

  // Left wall (x = -10)
  const wallL = BABYLON.MeshBuilder.CreateBox('wallL', { width: 0.15, height: 5.3, depth: 14 }, scene);
  wallL.position = new BABYLON.Vector3(-10, 2.6, 0);
  wallL.checkCollisions = true;
  wallL.material = wallMat(scene);

  // Right wall (x = 10)
  const wallR = BABYLON.MeshBuilder.CreateBox('wallR', { width: 0.15, height: 5.3, depth: 14 }, scene);
  wallR.position = new BABYLON.Vector3(10, 2.6, 0);
  wallR.checkCollisions = true;
  wallR.material = wallMat(scene);

  // ── Staircase (right of centre, goes up to balcony) ──
  for (let i = 0; i < 10; i++) {
    const step = BABYLON.MeshBuilder.CreateBox('step'+i, { width: 3.5, height: 0.18, depth: 0.4 }, scene);
    step.position = new BABYLON.Vector3(2.5, 0.18 + i * 0.38, 3.5 - i * 0.55);
    step.checkCollisions = true;
    const sm = new BABYLON.StandardMaterial('sm'+i, scene);
    sm.diffuseColor = new BABYLON.Color3(0.18, 0.10, 0.04);
    sm.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    step.material = sm;
  }

  // Bannister post
  for (let i = 0; i < 5; i++) {
    const post = BABYLON.MeshBuilder.CreateBox('post'+i, { width: 0.06, height: 1.1, depth: 0.06 }, scene);
    post.position = new BABYLON.Vector3(1.0, 0.55 + i * 0.76, 3.5 - i * 1.1);
    const pm = new BABYLON.StandardMaterial('pm'+i, scene);
    pm.diffuseColor = new BABYLON.Color3(0.22, 0.12, 0.05);
    post.material = pm;
  }
  const rail = BABYLON.MeshBuilder.CreateBox('rail', { width: 0.08, height: 0.08, depth: 5.5 }, scene);
  rail.position = new BABYLON.Vector3(1.0, 1.1, 1.0);
  rail.rotation.x = Math.PI / 14;
  const rm = new BABYLON.StandardMaterial('rm', scene);
  rm.diffuseColor = new BABYLON.Color3(0.25, 0.14, 0.06);
  rail.material = rm;

  // ── Fireplace nook (right wall, back) ──
  const fp_back = BABYLON.MeshBuilder.CreateBox('fp_b', { width: 3.5, height: 3, depth: 0.3 }, scene);
  fp_back.position = new BABYLON.Vector3(8.5, 1.5, -5.5);
  const fpm = new BABYLON.StandardMaterial('fpm', scene);
  fpm.diffuseColor = new BABYLON.Color3(0.2, 0.15, 0.12);
  fpm.emissiveColor = new BABYLON.Color3(0.08, 0.03, 0.01);
  fp_back.material = fpm;

  // Fireplace surround (left pillar)
  const fpL = BABYLON.MeshBuilder.CreateBox('fpL', { width: 0.3, height: 3.2, depth: 0.6 }, scene);
  fpL.position = new BABYLON.Vector3(6.9, 1.6, -5.3);
  fpL.checkCollisions = true;
  fpL.material = stoneMat(scene);

  // Fireplace surround (right pillar)
  const fpR = BABYLON.MeshBuilder.CreateBox('fpR', { width: 0.3, height: 3.2, depth: 0.6 }, scene);
  fpR.position = new BABYLON.Vector3(10.1, 1.6, -5.3);
  fpR.checkCollisions = true;
  fpR.material = stoneMat(scene);

  // Fireplace mantel
  const mantel = BABYLON.MeshBuilder.CreateBox('mantel', { width: 3.8, height: 0.15, depth: 0.7 }, scene);
  mantel.position = new BABYLON.Vector3(8.5, 3.1, -5.2);
  mantel.checkCollisions = true;
  mantel.material = stoneMat(scene);

  // ── Bookshelf (left wall) ──
  const shelf = BABYLON.MeshBuilder.CreateBox('shelf', { width: 0.4, height: 4, depth: 3 }, scene);
  shelf.position = new BABYLON.Vector3(-9.7, 2, -3);
  shelf.checkCollisions = true;
  const shm = new BABYLON.StandardMaterial('shm', scene);
  shm.diffuseColor = new BABYLON.Color3(0.16, 0.09, 0.04);
  shelf.material = shm;

  // Books (decorative boxes)
  const bookColors = [
    [0.4,0.1,0.1],[0.1,0.2,0.35],[0.3,0.25,0.05],
    [0.15,0.25,0.15],[0.35,0.15,0.3],[0.2,0.1,0.05],
  ];
  bookColors.forEach((c, i) => {
    const bk = BABYLON.MeshBuilder.CreateBox('bk'+i, { width: 0.08, height: 0.35, depth: 0.28 }, scene);
    bk.position = new BABYLON.Vector3(-9.52, 1.1 + Math.floor(i/2)*1.1, -3.4 + (i%2)*0.35 + (i*0.12));
    const bm = new BABYLON.StandardMaterial('bm'+i, scene);
    bm.diffuseColor = new BABYLON.Color3(...c);
    bk.material = bm;
  });

  // ── Chandelier (hanging from ceiling centre) ──
  const chanBase = BABYLON.MeshBuilder.CreateSphere('chanB', { diameter: 0.4 }, scene);
  chanBase.position = new BABYLON.Vector3(0, 4.9, 2);
  const chm = new BABYLON.StandardMaterial('chm', scene);
  chm.diffuseColor = new BABYLON.Color3(0.3, 0.25, 0.1);
  chm.emissiveColor = new BABYLON.Color3(0.15, 0.10, 0.02);
  chanBase.material = chm;

  // Chandelier arms
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const arm = BABYLON.MeshBuilder.CreateBox('arm'+i, { width: 0.04, height: 0.04, depth: 1.1 }, scene);
    arm.position = new BABYLON.Vector3(Math.sin(angle)*0.55, 4.65, 2 + Math.cos(angle)*0.55);
    arm.rotation.y = angle;
    arm.material = chm;
  }
}

function wallMat(scene) {
  const m = new BABYLON.StandardMaterial('wall_' + Math.random(), scene);
  m.diffuseColor = new BABYLON.Color3(0.22, 0.10, 0.28);
  m.specularColor = new BABYLON.Color3(0.02, 0.01, 0.03);
  m.emissiveColor = new BABYLON.Color3(0.01, 0.005, 0.015);
  return m;
}

function stoneMat(scene) {
  const m = new BABYLON.StandardMaterial('stone_' + Math.random(), scene);
  m.diffuseColor = new BABYLON.Color3(0.28, 0.22, 0.20);
  m.specularColor = new BABYLON.Color3(0.03, 0.03, 0.03);
  return m;
}

// ─── INTERACTABLE OBJECTS ────────────────────
function placeObjects(scene) {
  // Each object: mesh + metadata for examine modal
  const objects = [
    {
      id: 'cloak',
      pos: new BABYLON.Vector3(-8.5, 1.5, 5.5),
      size: { width: 0.6, height: 1.4, depth: 0.2 },
      color: [0.06, 0.04, 0.08],
      emissive: [0.01, 0.005, 0.02],
    },
    {
      id: 'staff',
      pos: new BABYLON.Vector3(-7.5, 1.2, -0.5),
      size: { width: 0.12, height: 2.4, depth: 0.12 },
      color: [0.18, 0.11, 0.05],
      emissive: [0.02, 0.01, 0.0],
    },
    {
      id: 'key',
      pos: new BABYLON.Vector3(0, 3.15, -4.8),
      size: { width: 0.15, height: 0.15, depth: 0.08 },
      color: [0.3, 0.3, 0.32],
      emissive: [0.04, 0.04, 0.05],
    },
    {
      id: 'letter',
      pos: new BABYLON.Vector3(8.5, 3.22, -5.0),
      size: { width: 0.35, height: 0.04, depth: 0.28 },
      color: [0.85, 0.80, 0.65],
      emissive: [0.06, 0.05, 0.02],
    },
    {
      id: 'rosemary',
      pos: new BABYLON.Vector3(3.0, 3.5, 6.8),
      size: { width: 0.08, height: 0.5, depth: 0.08 },
      color: [0.15, 0.35, 0.12],
      emissive: [0.01, 0.03, 0.01],
    },
    {
      id: 'portrait',
      pos: new BABYLON.Vector3(-6, 2.8, -6.85),
      size: { width: 1.4, height: 1.8, depth: 0.06 },
      color: [0.15, 0.08, 0.05],
      emissive: [0.02, 0.01, 0.0],
    },
    {
      id: 'mirror',
      pos: new BABYLON.Vector3(6, 2.6, -6.85),
      size: { width: 0.8, height: 1.6, depth: 0.06 },
      color: [0.55, 0.55, 0.6],
      emissive: [0.05, 0.05, 0.08],
    },
    {
      id: 'clock',
      pos: new BABYLON.Vector3(0.8, 2.0, -6.85),
      size: { width: 0.55, height: 2.0, depth: 0.35 },
      color: [0.14, 0.08, 0.04],
      emissive: [0.01, 0.005, 0.0],
    },
    {
      id: 'bookshelf',
      pos: new BABYLON.Vector3(-9.55, 2.0, -3.0),
      size: { width: 0.3, height: 3.5, depth: 3.2 },
      color: [0.0, 0.0, 0.0],
      emissive: [0.0, 0.0, 0.0],
      invisible: true, // click zone only
    },
    {
      id: 'fireplace',
      pos: new BABYLON.Vector3(8.5, 1.4, -5.4),
      size: { width: 2.8, height: 2.4, depth: 0.5 },
      color: [0.0, 0.0, 0.0],
      emissive: [0.0, 0.0, 0.0],
      invisible: true,
    },
  ];

  objects.forEach(obj => {
    const mesh = BABYLON.MeshBuilder.CreateBox('obj_' + obj.id, obj.size, scene);
    mesh.position = obj.pos.clone();
    mesh.isPickable = true;
    mesh.metadata = { itemId: obj.id };

    if (obj.invisible) {
      mesh.visibility = 0;
    } else {
      const mat = new BABYLON.StandardMaterial('mat_' + obj.id, scene);
      mat.diffuseColor = new BABYLON.Color3(...obj.color);
      mat.emissiveColor = new BABYLON.Color3(...obj.emissive);
      mat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
      mesh.material = mat;
    }

    G.interactables.push(mesh);
  });
}

// ─── LIGHT FLICKER ───────────────────────────
let _flickerT = 0;
function flickerLights() {
  _flickerT += G.engine.getDeltaTime() * 0.001;
  G.lights.forEach(({ light, base, speed }, i) => {
    const noise =
      Math.sin(_flickerT * speed * 3.7 + i) * 0.10 +
      Math.sin(_flickerT * speed * 7.1 + i * 1.3) * 0.05 +
      Math.sin(_flickerT * speed * 13.3 + i * 2.1) * 0.03;
    light.intensity = base + noise * base;
  });
}

// ─── INPUT ───────────────────────────────────
function setupInput(canvas) {
  // ── MOUSE ──
  let mouseDown = false;
  let mouseStartX = 0, mouseStartY = 0;
  let moved = false;

  canvas.addEventListener('mousedown', e => {
    mouseDown = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    moved = false;
  });

  canvas.addEventListener('mousemove', e => {
    if (!mouseDown || G.modalOpen) return;
    const dx = e.clientX - mouseStartX;
    const dy = e.clientY - mouseStartY;
    if (Math.abs(dx) > G.TAP_THRESHOLD || Math.abs(dy) > G.TAP_THRESHOLD) {
      moved = true;
    }
    if (moved) {
      rotateCamera(e.movementX, e.movementY);
    }
  });

  canvas.addEventListener('mouseup', e => {
    if (!moved && !G.modalOpen) {
      // It was a click/tap
      tryInteract(e.clientX, e.clientY);
    }
    mouseDown = false;
    moved = false;
  });

  // ── TOUCH ──
  let touchStartX = 0, touchStartY = 0;
  let touchLastX = 0, touchLastY = 0;
  let touchMoved = false;

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchLastX = t.clientX;
    touchLastY = t.clientY;
    touchMoved = false;
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (G.modalOpen) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > G.TAP_THRESHOLD || Math.abs(dy) > G.TAP_THRESHOLD) {
      touchMoved = true;
    }
    if (touchMoved) {
      const movX = t.clientX - touchLastX;
      const movY = t.clientY - touchLastY;
      rotateCamera(movX, movY);
    }
    touchLastX = t.clientX;
    touchLastY = t.clientY;
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    if (!touchMoved && !G.modalOpen) {
      const t = e.changedTouches[0];
      tryInteract(t.clientX, t.clientY);
    }
  }, { passive: false });
}

// ─── CAMERA ROTATION ─────────────────────────
function rotateCamera(dx, dy) {
  const sensitivity = 0.0025;
  G.cameraYaw   += dx * sensitivity;
  G.cameraPitch -= dy * sensitivity;
  // Clamp vertical look — can't look past straight up/down
  G.cameraPitch = Math.max(-Math.PI * 0.42, Math.min(Math.PI * 0.42, G.cameraPitch));

  const cam = G.camera;
  const yawQ   = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, G.cameraYaw);
  const pitchQ = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, G.cameraPitch);
  const q = yawQ.multiply(pitchQ);
  const forward = new BABYLON.Vector3(0, 0, 1);
  const dir = forward.applyRotationQuaternion(q);
  cam.setTarget(cam.position.add(dir));
}

// ─── RAY PICKING / INTERACT ──────────────────
function tryInteract(clientX, clientY) {
  if (G.modalOpen) return;

  const scene = G.scene;
  const canvas = G.canvas;

  // Convert screen position to picking ray
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;

  const ray = scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), G.camera);
  const hit = scene.pickWithRay(ray, mesh => G.interactables.includes(mesh));

  if (hit.hit && hit.pickedMesh) {
    const itemId = hit.pickedMesh.metadata?.itemId;
    if (itemId) openModal(itemId, hit.pickedMesh);
  }
}

// ─── MODAL ───────────────────────────────────
let _currentItemId = null;
let _currentMesh   = null;

function openModal(itemId, mesh) {
  if (G.collected.has(itemId)) {
    showNotif('Already taken.');
    return;
  }
  const item = ITEMS[itemId];
  if (!item) return;

  _currentItemId = itemId;
  _currentMesh   = mesh;
  G.modalOpen    = true;

  document.getElementById('modal-icon').textContent = item.icon;
  document.getElementById('modal-name').textContent = item.name;
  document.getElementById('modal-desc').textContent = item.desc;

  const collectBtn = document.getElementById('modal-collect');
  collectBtn.textContent = item.collectible ? 'Take it' : 'Step back';
  collectBtn.style.display = item.collectible ? '' : 'none';

  document.getElementById('examine-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('examine-modal').classList.add('hidden');
  G.modalOpen    = false;
  _currentItemId = null;
  _currentMesh   = null;
}

function collectItem() {
  if (!_currentItemId) return;
  const item = ITEMS[_currentItemId];
  if (!item || !item.collectible) return;
  if (G.inventory.length >= 5) {
    showNotif('Your hands are full.');
    closeModal();
    return;
  }

  G.collected.add(_currentItemId);
  G.inventory.push(_currentItemId);

  // Hide the mesh
  if (_currentMesh) _currentMesh.visibility = 0;

  updateInventoryUI();
  closeModal();
  showNotif(item.icon + '  ' + item.name + ' taken.');
}

// ─── INVENTORY UI ────────────────────────────
function updateInventoryUI() {
  const slots = document.getElementById('inv-slots');
  slots.innerHTML = '';
  G.inventory.forEach(id => {
    const item = ITEMS[id];
    const slot = document.createElement('div');
    slot.className = 'inv-slot';
    slot.textContent = item.icon;
    slot.title = item.name;
    slot.addEventListener('click', () => openModal(id, null));
    slots.appendChild(slot);
  });
  document.getElementById('item-count').textContent =
    G.inventory.length + ' / 5 items';
}

// ─── NOTIFICATION ────────────────────────────
function showNotif(msg) {
  let el = document.getElementById('notif');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(G.notifTimer);
  G.notifTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
