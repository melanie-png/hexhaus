// ─── APPARITIONS — Helga and her cat ──────────────────────────────────────────
// The house's rare residents. Helga appears exactly once per visit, as a
// sighting: she screams, a door slams, and that is it. (Audio comes later,
// with the sound pass — the beats are timed to leave room for it.)
// The cat lives in the kitchen. Sometimes you catch her sitting there.

const APP_TEX = 'textures/helga_apparition.png?v=20260928a6';

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

// ── THE CAT — a proper sitting silhouette: haunches, chest, paws, wrapped tail.
// She watches you (head tracks the camera), blinks, twitches an ear — and is
// still gone the moment you try to examine her.
function spawnCat(roomId){
  const spots = CAT_SPOTS[roomId]; if (!spots || !spots.length) return;
  const [sx,sz] = (window.HEXQA_SPAWN || window.HEXAPP_FORCE) ? spots[0] : spots[(Math.random()*spots.length)|0];   // demo/QA: always the first spot
  const sc = scene;
  const root = new BABYLON.TransformNode('app_cat',sc);
  const fur = new BABYLON.StandardMaterial('app_catM',sc);
  fur.diffuseColor = new BABYLON.Color3(0.025,0.025,0.032);
  fur.specularColor = new BABYLON.Color3(0.05,0.05,0.06);
  const eyeM = new BABYLON.StandardMaterial('app_catEyeM',sc);
  eyeM.emissiveColor = new BABYLON.Color3(0.25,0.95,0.45);
  eyeM.diffuseColor = new BABYLON.Color3(0,0,0);
  eyeM.specularColor = new BABYLON.Color3(0,0,0);

  const parts=[];
  const mk=(n,fn)=>{const me=fn(n);me.parent=root;me.material=fur;parts.push(me);return me;};
  // haunches + chest: the sitting pear
  const body=mk('app_cat_body',n=>BABYLON.MeshBuilder.CreateSphere(n,{diameterX:0.34,diameterY:0.36,diameterZ:0.3},sc));
  body.position.set(-0.07,0.18,0);
  const chest=mk('app_cat_chest',n=>BABYLON.MeshBuilder.CreateSphere(n,{diameterX:0.24,diameterY:0.3,diameterZ:0.22},sc));
  chest.position.set(0.08,0.2,0);
  // front legs, straight and prim
  for(const z of [-0.055,0.055]){
    const leg=mk('app_cat_leg'+(z<0?'l':'r'),n=>BABYLON.MeshBuilder.CreateCylinder(n,{diameter:0.045,height:0.34},sc));
    leg.position.set(0.14,0.17,z);
    const paw=mk('app_cat_paw'+(z<0?'l':'r'),n=>BABYLON.MeshBuilder.CreateSphere(n,{diameter:0.075},sc));
    paw.position.set(0.15,0.035,z); paw.scaling.y=0.55;
  }
  // head with a muzzle; eyes ride on the head so they follow her gaze
  const head=mk('app_cat_head',n=>BABYLON.MeshBuilder.CreateSphere(n,{diameter:0.15},sc));
  head.position.set(0.17,0.42,0); head.scaling.set(1,0.92,0.95);
  const muzzle=mk('app_cat_muzzle',n=>BABYLON.MeshBuilder.CreateSphere(n,{diameter:0.07},sc));
  muzzle.parent=head; muzzle.position.set(0.05,-0.012,0); muzzle.scaling.set(0.9,0.7,1);
  const e1=BABYLON.MeshBuilder.CreateSphere('app_cat_e1',{diameter:0.027},sc);
  const e2=BABYLON.MeshBuilder.CreateSphere('app_cat_e2',{diameter:0.027},sc);
  for(const e of [e1,e2]){ e.parent=head; e.material=eyeM; parts.push(e); }
  e1.position.set(0.072,0.028,0.04); e2.position.set(0.072,0.028,-0.04);
  // cone ears
  const ear1=mk('app_cat_ear1',n=>BABYLON.MeshBuilder.CreateCylinder(n,{diameterTop:0.004,diameterBottom:0.045,height:0.078},sc));
  ear1.parent=head; ear1.position.set(-0.005,0.083,0.048); ear1.rotation.x=-0.22;
  const ear2=mk('app_cat_ear2',n=>BABYLON.MeshBuilder.CreateCylinder(n,{diameterTop:0.004,diameterBottom:0.045,height:0.078},sc));
  ear2.parent=head; ear2.position.set(-0.005,0.083,-0.048); ear2.rotation.x=0.22;
  // tail: a tube that curls from her haunches around the front paws
  const tp=[[-0.19,0.05,0.12],[-0.235,0.04,0.0],[-0.18,0.035,-0.13],[-0.05,0.03,-0.21],[0.09,0.03,-0.215],[0.16,0.035,-0.14],[0.19,0.055,-0.05]]
    .map(v=>new BABYLON.Vector3(v[0],v[1],v[2]));
  const tail=mk('app_cat_tail',n=>BABYLON.MeshBuilder.CreateTube(n,{path:tp,radius:0.017,tessellation:8,cap:BABYLON.Mesh.CAP_ALL},sc));

  root.position.set(sx,0,sz);
  root.rotation.y = Math.atan2(-sx,-sz);          // facing the room centre

  // a faint hearth-glow so her silhouette reads against the dark kitchen
  const glow = new BABYLON.PointLight('app_catL', new BABYLON.Vector3(sx,0.75,sz+0.45), sc);
  glow.diffuse = new BABYLON.Color3(0.72,0.55,0.32);
  glow.specular = new BABYLON.Color3(0.15,0.1,0.06);
  glow.intensity = 0.35; glow.range = 5;

  const t0=performance.now();
  let nextBlink=t0+2500+(Math.random()*3000), blinkT=0;
  let nextTwitch=t0+3500+(Math.random()*4500), twitchT=0;
  const obs=sc.onBeforeRenderObservable.add(()=>{
    const t=performance.now()-t0;
    // tail sway
    tail.rotation.y=Math.sin(t/650)*0.07;
    // breathing
    chest.scaling.y=1+Math.sin(t/1100)*0.035;
    // she watches you: head turns toward the camera (clamped, smoothed)
    try{
      const inv=root.getWorldMatrix().clone().invert();
      const local=BABYLON.Vector3.TransformCoordinates(camera.position,inv);
      const yaw=Math.max(-0.85,Math.min(0.85,Math.atan2(-local.z,Math.max(0.05,local.x))));
      const pitch=Math.max(-0.3,Math.min(0.45,Math.atan2(local.y-0.42,Math.hypot(local.x,local.z))));
      head.rotation.y+=(yaw-head.rotation.y)*0.06;
      head.rotation.z+=(pitch-head.rotation.z)*0.06;
    }catch(e){}
    // blink
    if(t+ t0>nextBlink){ blinkT=performance.now(); nextBlink=performance.now()+2800+Math.random()*4200; }
    const bo=performance.now()-(blinkT||-1e9);
    const es=(bo>=0&&bo<140)?0.1:1;
    e1.scaling.y=es; e2.scaling.y=es;
    // ear twitch
    if(performance.now()>nextTwitch){ twitchT=performance.now(); nextTwitch=performance.now()+4000+Math.random()*6000; }
    const wo=performance.now()-(twitchT||-1e9);
    if(wo>=0&&wo<220){ ear1.rotation.x=-0.22+Math.sin(wo/35)*0.3; }
    else ear1.rotation.x=-0.22;
  });
  parts.forEach(p=>interactables.set(p.name,'helga_cat'));

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
  const timer = setTimeout(dash, window.HEXQA_SPAWN ? 150000 : 30000);   // QA dwell cat lingers for visual inspection
  const watch = setInterval(()=>{
    if (sc.isDisposed || dashed) { clearInterval(watch); return; }
    if (state.activeModal === 'helga_cat') { clearInterval(watch); dash(); }
  }, 400);

  appCleanup = ()=>{
    clearTimeout(timer); clearInterval(watch);
    if (!sc.isDisposed) { sc.onBeforeRenderObservable.remove(obs); parts.forEach(p=>p.dispose()); glow.dispose(); root.dispose(); }
  };
}
