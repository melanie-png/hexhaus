// ─── APPARITIONS — Helga and her cat ──────────────────────────────────────────
// The house's rare residents. Helga appears exactly once per visit, as a
// sighting: she screams, a door slams, and that is it. (Audio comes later,
// with the sound pass — the beats are timed to leave room for it.)
// The cat lives in the kitchen. Sometimes you catch her sitting there.

const APP_TEX = 'textures/helga_apparition.png?v=20260928a6';
const HANS_TEX = 'textures/hans_apparition.png?v=20261006a1';

// Spots are inset from the walls, near furniture lines, facing the room centre.
const HELGA_SPOTS = {   // where the sighting can stand in each room
  entrance: [[0,-4.4],[-6.5,1.5],[6.5,-1.5]],
  living:   [[0,-4.4],[-6,2.5],[6,-2.5]],
  kitchen:  [[0,-4.4],[5,2]],
  library:  [[-6.2,-4.2],[6.4,4.4]],
  bathroom: [[0,-1.5]],
  pantry:   [[0,-2.4],[3,1.8]],
  basement: [[0,-4.4],[5,2.5]],
  attic:    [[0,-2.4],[-3,1.6]]
};
const CAT_SPOTS = {    // the kitchen is hers
  kitchen:  [[4,3],[-4,-3],[0,-4.4]]
};

// Demo hook: open the game with ?apparition=helga (or =cat) and the resident
// stands in every room you enter — no dice rolls, no fading away. For looking.
try { window.HEXAPP_FORCE = new URLSearchParams(location.search).get('apparition'); } catch(e) {}

let appCleanup = null;

function spawnApparitions(roomId){
  if (appCleanup) { appCleanup(); appCleanup = null; }
  const qa = (typeof window !== 'undefined' && window.HEXQA_SPAWN) || null;
  if (qa === 'helga') { spawnHelgaStanding(roomId); return; }
  if (qa === 'cat')   { spawnCat(roomId); return; }
  if (window.HEXAPP_FORCE === 'helga') { state.helgaSeen = true; window.HEXAPP_FORCE = null; spawnHelgaStanding(roomId); return; }   // demo: ONE sighting, never again — like the real house
  if (window.HEXAPP_FORCE === 'cat')   { spawnCat(roomId); return; }
  // Natural play: the sighting, once, in the living room.
  if (roomId === 'living' && !state.helgaSeen) {
    state.helgaSeen = true;
    helgaSighting('living');
    return;
  }
  // Natural play: the cat, sometimes, in her kitchen.
  if (roomId === 'kitchen' && Math.random() < 0.55) { spawnCat(roomId); return; }
}

// ── HELGA — a candlelit figure that watches, and fades when seen up close ────
function spawnHelgaStanding(roomId){
  // rooms without dedicated spots still get her: demo + future rooms need a place to stand
  const spots = HELGA_SPOTS[roomId] || [[0,-4.4],[-4.5,2.5],[4.5,-2.5]];
  const [sx,sz] = spots[(Math.random()*spots.length)|0];
  const sc = scene;
  const tex = new BABYLON.Texture(APP_TEX, sc, true);
  tex.hasAlpha = true;
  tex.hasAlpha = true;   // opacity comes from the art's alpha channel
  const hH = 1.72, hW = hH * 280/831;
  const plane = BABYLON.MeshBuilder.CreatePlane('app_helga',{width:hW,height:hH},sc);
  plane.position.set(sx, hH/2 + 0.02, sz);
  const m = new BABYLON.StandardMaterial('app_helgaM',sc);
  m.diffuseTexture = tex;
  m.useAlphaFromDiffuseTexture = true;
  m.emissiveTexture = tex;
  m.emissiveColor = new BABYLON.Color3(0.92,0.85,0.72);   // candle-warm self-light
  m.specularColor = new BABYLON.Color3(0,0,0);
  m.backFaceCulling = false;
  m.alpha = 1;                          // no fade: she is already a ghost
  const glow = new BABYLON.PointLight('app_helgaL', new BABYLON.Vector3(sx,1.6,sz+0.6), sc);
  glow.diffuse = new BABYLON.Color3(0.85,0.6,0.3);
  glow.specular = new BABYLON.Color3(0.2,0.15,0.1);
  glow.intensity = 0.5; glow.range = 8;                                // plane normal lesson learned
  plane.material = m;
  plane.rotation.y = Math.atan2(-sx,-sz) + Math.PI;         // face the room centre

  const t0 = performance.now();
  const obs = sc.onBeforeRenderObservable.add(()=>{
    const t = (performance.now()-t0)/1000;
    plane.position.y = hH/2 + 0.02 + Math.sin(t*1.1)*0.008;  // she breathes
  });
  const die = ()=>{ plane.setEnabled(false); };
  const timer = setTimeout(die, 180000);   // QA-only standing sprite: hold for inspection
  interactables.set('app_helga','helga_apparition');

  // Examining her (or leaving) lets her go.
  const watch = setInterval(()=>{
    if (sc.isDisposed || !plane.isEnabled()) { clearInterval(watch); return; }
    if (state.activeModal === 'helga_apparition') { clearInterval(watch); die(); }
  }, 400);

  appCleanup = ()=>{
    clearTimeout(timer); clearInterval(watch);
    if (!sc.isDisposed) { sc.onBeforeRenderObservable.remove(obs); plane.dispose(); glow.dispose(); }
  };
}

// ── THE SIGHTING — she screams, a door slams, and that is it ────────────────
function helgaSighting(roomId){
  // rooms without dedicated spots still get her: demo + future rooms need a place to stand
  const spots = HELGA_SPOTS[roomId] || [[0,-4.4],[-4.5,2.5],[4.5,-2.5]];
  // Demo mode: always stand where the default view can see her.
  const [sx,sz] = window.HEXAPP_FORCE === 'helga' ? spots[0] : spots[(Math.random()*spots.length)|0];
  const sc = scene;
  const tex = new BABYLON.Texture(APP_TEX, sc, true);
  tex.hasAlpha = true;
  tex.hasAlpha = true;
  const hH = 1.72, hW = hH * 280/831;
  const plane = BABYLON.MeshBuilder.CreatePlane('app_helga',{width:hW,height:hH},sc);
  plane.position.set(sx, hH/2 + 0.02, sz);
  const m = new BABYLON.StandardMaterial('app_helgaM',sc);
  m.diffuseTexture = tex;
  m.useAlphaFromDiffuseTexture = true;
  m.emissiveTexture = tex;
  m.emissiveColor = new BABYLON.Color3(0.92,0.85,0.72);
  m.specularColor = new BABYLON.Color3(0,0,0);
  m.backFaceCulling = false;
  const glow = new BABYLON.PointLight('app_helgaL', new BABYLON.Vector3(sx,1.6,sz+0.6), sc);
  glow.diffuse = new BABYLON.Color3(0.85,0.6,0.3);
  glow.specular = new BABYLON.Color3(0.2,0.15,0.1);
  glow.intensity = 0.5; glow.range = 8;
  plane.material = m;
  plane.rotation.y = Math.atan2(-sx,-sz) + Math.PI;
  interactables.set('app_helga','helga_apparition');

  // Timeline: fade in 1.1s → scream hold 1.7s → door slams (shake) → she is gone.
  const t0 = performance.now();
  const FADE_IN = 1100, HOLD = 1700, SLAM = 260, FADE_OUT = 550;
  const door = sc.getMeshByName('door_entrance');
  const doorBase = door ? door.position.clone() : null;
  const camBase = camera.position.clone();
  let alpha = 0, phase = 0, shake = 0; let slammed = false;
  const obs = sc.onBeforeRenderObservable.add(()=>{
    if (plane.isEnabled() === false) { sc.onBeforeRenderObservable.remove(obs); return; }
    const t = performance.now() - t0;
    if (t < FADE_IN) { alpha = t / FADE_IN; }
    else if (t < FADE_IN + HOLD) { alpha = 1; phase = 1; }
    else if (t < FADE_IN + HOLD + SLAM) {
      phase = 2; alpha = 1; shake = 1; if(!slammed){ slammed = true; if(window.SFX) SFX.slam(); }   // the door is driven shut
      if (door && doorBase) { door.position.x = doorBase.x + (Math.random()-0.5)*0.05; door.position.y = doorBase.y + (Math.random()-0.5)*0.03; }
    }
    else if (t < FADE_IN + HOLD + SLAM + FADE_OUT) { alpha = 1 - (t - FADE_IN - HOLD - SLAM)/FADE_OUT; }
    else { alpha = 0; plane.setEnabled(false); if (door && doorBase) door.position.copyFrom(doorBase); camera.position.copyFrom(camBase); sc.onBeforeRenderObservable.remove(obs); return; }
    m.alpha = alpha;
    plane.position.y = hH/2 + 0.02 + Math.sin(t/900)*0.008;
    if (shake > 0 && phase === 2) {
      camera.position.x = camBase.x + (Math.random()-0.5)*0.05;
      camera.position.y = camBase.y + (Math.random()-0.5)*0.035;
      camera.position.z = camBase.z + (Math.random()-0.5)*0.05;
    } else if (phase >= 2) { camera.position.copyFrom(camBase); }
  });
  appCleanup = ()=>{
    if (!sc.isDisposed) { sc.onBeforeRenderObservable.remove(obs); if (door && doorBase) door.position.copyFrom(doorBase); camera.position.copyFrom(camBase); plane.dispose(); glow.dispose(); }
  };
}

// ── THE CAT — Hans: a painted sprite, self-lit, two-sided alpha art.
// He breathes where the hearth can catch his edges — and is still gone the
// moment you try to examine him.
function spawnCat(roomId){
  const spots = CAT_SPOTS[roomId]; if (!spots || !spots.length) return;
  const [sx,sz] = (window.HEXQA_SPAWN || window.HEXAPP_FORCE) ? spots[0] : spots[(Math.random()*spots.length)|0];   // demo/QA: always the first spot
  const sc = scene;
  // painted sprite — the same recipe that made Helga work: lossless PNG alpha,
  // self-lit emissive, two-sided, no backface hole
  const tex = new BABYLON.Texture(HANS_TEX, sc, true);
  tex.hasAlpha = true;
  const AW=460, AH=645;                       // art aspect
  const hH = 0.52, hW = hH * AW/AH;           // a real sitting cat is about half a metre tall
  const plane = BABYLON.MeshBuilder.CreatePlane('app_cat_body',{width:hW,height:hH},sc);
  plane.position.set(sx, hH/2 + 0.015, sz);
  const m = new BABYLON.StandardMaterial('app_catM',sc);
  m.diffuseTexture = tex;
  m.useAlphaFromDiffuseTexture = true;
  m.emissiveTexture = tex;
  m.emissiveColor = new BABYLON.Color3(0.62,0.56,0.46);   // dim candle-warm self-light — he is a shadow, not a lamp
  m.specularColor = new BABYLON.Color3(0,0,0);
  m.backFaceCulling = false;
  m.alpha = 1;
  plane.material = m;
  plane.rotation.y = Math.atan2(-sx,-sz) + Math.PI;       // face the room centre

  // the eyes carry a faint green cast onto the floor in front of him
  const glow = new BABYLON.PointLight('app_catL', new BABYLON.Vector3(sx,0.42,sz+0.35), sc);
  glow.diffuse = new BABYLON.Color3(0.30,0.75,0.42);
  glow.specular = new BABYLON.Color3(0.05,0.12,0.07);
  glow.intensity = 0.22; glow.range = 3.2;

  const t0 = performance.now();
  const obs = sc.onBeforeRenderObservable.add(()=>{
    const t = (performance.now()-t0)/1000;
    plane.position.y = hH/2 + 0.015 + Math.sin(t*1.35)*0.006;   // he breathes
  });
  interactables.set('app_cat_body','helga_cat');

  // Examined or ignored too long: one dash, and it is not there at all.
  let dashed = false;
  const dash = ()=>{
    if (dashed) return; dashed = true;
    const dir = plane.rotation.y + Math.PI/2;
    const dx = Math.sin(dir), dz = Math.cos(dir);
    const start = {x:sx, z:sz}; const d0 = performance.now();
    const o2 = sc.onBeforeRenderObservable.add(()=>{
      const k = Math.min(1,(performance.now()-d0)/650);
      plane.position.x = start.x + dx*3.2*k;
      plane.position.z = start.z + dz*3.2*k;
      m.alpha = 1-k;                                   // he thins out as he goes
      if (k>=1){ plane.setEnabled(false); sc.onBeforeRenderObservable.remove(o2); }
    });
  };
  const timer = setTimeout(dash, window.HEXQA_SPAWN ? 150000 : 30000);   // QA dwell cat lingers for visual inspection
  const watch = setInterval(()=>{
    if (sc.isDisposed || dashed) { clearInterval(watch); return; }
    if (state.activeModal === 'helga_cat') { clearInterval(watch); dash(); }
  }, 400);

  appCleanup = ()=>{
    clearTimeout(timer); clearInterval(watch);
    if (!sc.isDisposed) { sc.onBeforeRenderObservable.remove(obs); plane.dispose(); glow.dispose(); }
  };
}
