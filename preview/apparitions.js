// ─── APPARITIONS — Helga and her cat ──────────────────────────────────────────
// Rare residents. On most visits the house is empty. Sometimes it isn't.
// Spawned after each room build: never both at once, usually neither.

const APP_TEX = 'textures/helga_apparition.webp?v=20260928a1';

// Spots are inset from the walls, near furniture lines, facing the room centre.
const HELGA_SPOTS = {
  entrance: [[0,-4.4],[-6.5,1.5],[6.5,-1.5]],
  living:   [[0,-4.4],[-6,2.5],[6,-2.5]],
  kitchen:  [[0,-4.4],[5,2]],
  library:  [[-6.2,-4.2],[6.4,4.4]],
  bathroom: [[0,-1.5]],
  pantry:   [[0,-2.4],[3,1.8]],
  basement: [[0,-4.4],[5,2.5]],
  attic:    [[0,-2.4],[-3,1.6]]
};
const CAT_SPOTS = {
  entrance: [[4.5,-2.5],[-4.5,2.5]],
  living:   [[5,3.2],[-5,-3]],
  kitchen:  [[4,3],[-4,-3]],
  library:  [[4.5,-4],[-4.5,4]],
  bathroom: [[1.4,-0.8]],
  pantry:   [[2.2,1.5],[-2.2,-1.5]],
  basement: [[4,3.5],[-4,-3.5]],
  attic:    [[2,1.8],[-2,-1.8]]
};

let appCleanup = null;

function spawnApparitions(roomId){
  if (appCleanup) { appCleanup(); appCleanup = null; }
  const qa = (typeof window !== 'undefined' && window.HEXQA_SPAWN) || null;
  let kind = null;
  if (qa) kind = qa;
  else {
    const roll = Math.random();
    if (roll < 0.14) kind = 'helga';
    else if (roll < 0.42) kind = 'cat';
  }
  if (!kind) return;
  if (kind === 'helga') spawnHelga(roomId); else spawnCat(roomId);
}

// ── HELGA — a candlelit figure that watches, and fades when seen up close ────
function spawnHelga(roomId){
  const spots = HELGA_SPOTS[roomId]; if (!spots || !spots.length) return;
  const [sx,sz] = spots[(Math.random()*spots.length)|0];
  const sc = scene;
  const tex = new BABYLON.Texture(APP_TEX, sc, true);
  tex.hasAlpha = true;
  const hH = 1.72, hW = hH * 280/831;
  const plane = BABYLON.MeshBuilder.CreatePlane('app_helga',{width:hW,height:hH},sc);
  plane.position.set(sx, hH/2 + 0.02, sz);
  const m = new BABYLON.StandardMaterial('app_helgaM',sc);
  m.diffuseTexture = tex;
  m.useAlphaFromDiffuseTexture = true;
  m.emissiveTexture = tex;
  m.emissiveColor = new BABYLON.Color3(0.75,0.68,0.58);   // candle-warm self-light
  m.specularColor = new BABYLON.Color3(0,0,0);
  m.backFaceCulling = false;                                // plane normal lesson learned
  plane.material = m;
  plane.rotation.y = Math.atan2(-sx,-sz) + Math.PI;         // face the room centre

  let alpha = 0, dying = false;
  const t0 = performance.now();
  const obs = sc.onBeforeRenderObservable.add(()=>{
    const t = (performance.now()-t0)/1000;
    const target = dying ? 0 : Math.min(1, t/2.2);
    alpha += (target - alpha) * 0.035;
    m.alpha = alpha;
    plane.position.y = hH/2 + 0.02 + Math.sin(t*1.1)*0.008;  // she breathes
    if (dying && alpha <= 0.012) plane.setEnabled(false);
  });
  const die = ()=>{ dying = true; };
  const timer = setTimeout(die, 26000);
  interactables.set('app_helga','helga_apparition');

  // Examining her (or leaving) lets her go.
  const watch = setInterval(()=>{
    if (sc.isDisposed || !plane.isEnabled()) { clearInterval(watch); return; }
    if (state.activeModal === 'helga_apparition') { clearInterval(watch); die(); }
  }, 400);

  appCleanup = ()=>{
    clearTimeout(timer); clearInterval(watch);
    if (!sc.isDisposed) { sc.onBeforeRenderObservable.remove(obs); plane.dispose(); }
  };
}

// ── THE CAT — sits, watches with green eyes, and is gone when you look ──────
function spawnCat(roomId){
  const spots = CAT_SPOTS[roomId]; if (!spots || !spots.length) return;
  const [sx,sz] = spots[(Math.random()*spots.length)|0];
  const sc = scene;
  const root = new BABYLON.TransformNode('app_cat',sc);
  const fur = new BABYLON.StandardMaterial('app_catM',sc);
  fur.diffuseColor = new BABYLON.Color3(0.025,0.025,0.032);
  fur.specularColor = new BABYLON.Color3(0.02,0.02,0.026);
  const eyeM = new BABYLON.StandardMaterial('app_catEyeM',sc);
  eyeM.emissiveColor = new BABYLON.Color3(0.25,0.95,0.45);
  eyeM.diffuseColor = new BABYLON.Color3(0,0,0);
  eyeM.specularColor = new BABYLON.Color3(0,0,0);

  const mk = (n,fn)=>{ const me = fn(n); me.parent = root; return me; };
  const body = mk('app_cat_body',n=>BABYLON.MeshBuilder.CreateSphere(n,{diameterX:0.5,diameterY:0.3,diameterZ:0.26},sc));
  body.position.set(0,0.17,0); body.material = fur;
  const head = mk('app_cat_head',n=>BABYLON.MeshBuilder.CreateSphere(n,{diameter:0.16},sc));
  head.position.set(0.3,0.26,0); head.scaling.set(0.85,0.8,0.9); head.material = fur;
  const e1 = mk('app_cat_e1',n=>BABYLON.MeshBuilder.CreateSphere(n,{diameter:0.028},sc));
  e1.position.set(0.365,0.28,0.045); e1.material = eyeM;
  const e2 = mk('app_cat_e2',n=>BABYLON.MeshBuilder.CreateSphere(n,{diameter:0.028},sc));
  e2.position.set(0.365,0.28,-0.045); e2.material = eyeM;
  const tail = mk('app_cat_tail',n=>BABYLON.MeshBuilder.CreateCylinder(n,{diameterTop:0.02,diameterBottom:0.03,height:0.4},sc));
  tail.position.set(-0.26,0.33,0); tail.rotation.z = 0.6; tail.material = fur;
  const ear1 = mk('app_cat_ear1',n=>BABYLON.MeshBuilder.CreateCylinder(n,{diameterTop:0.006,diameterBottom:0.05,height:0.07},sc));
  ear1.position.set(0.3,0.36,0.05); ear1.material = fur;
  const ear2 = mk('app_cat_ear2',n=>BABYLON.MeshBuilder.CreateCylinder(n,{diameterTop:0.006,diameterBottom:0.05,height:0.07},sc));
  ear2.position.set(0.3,0.36,-0.05); ear2.material = fur;

  root.position.set(sx,0,sz);
  root.rotation.y = Math.atan2(-sx,-sz);          // facing the room centre

  const t0 = performance.now();
  const obs = sc.onBeforeRenderObservable.add(()=>{
    tail.rotation.z = 0.6 + Math.sin((performance.now()-t0)/380)*0.12;
  });
  const parts = [body,head,e1,e2,tail,ear1,ear2];
  ['app_cat_body','app_cat_head','app_cat_e1','app_cat_e2','app_cat_tail','app_cat_ear1','app_cat_ear2']
    .forEach(n=>interactables.set(n,'helga_cat'));

  // Examined or ignored too long: one dash, and it is not there at all.
  let dashed = false;
  const dash = ()=>{
    if (dashed) return; dashed = true;
    const dir = root.rotation.y + Math.PI/2;
    const dx = Math.sin(dir), dz = Math.cos(dir);
    const start = {x:sx, z:sz}; const d0 = performance.now();
    const o2 = sc.onBeforeRenderObservable.add(()=>{
      const k = Math.min(1,(performance.now()-d0)/650);
      root.position.x = start.x + dx*3.2*k;
      root.position.z = start.z + dz*3.2*k;
      if (k>=1){ parts.forEach(p=>p.setEnabled(false)); sc.onBeforeRenderObservable.remove(o2); }
    });
  };
  const timer = setTimeout(dash, 30000);
  const watch = setInterval(()=>{
    if (sc.isDisposed || dashed) { clearInterval(watch); return; }
    if (state.activeModal === 'helga_cat') { clearInterval(watch); dash(); }
  }, 400);

  appCleanup = ()=>{
    clearTimeout(timer); clearInterval(watch);
    if (!sc.isDisposed) { sc.onBeforeRenderObservable.remove(obs); parts.forEach(p=>p.dispose()); root.dispose(); }
  };
}
