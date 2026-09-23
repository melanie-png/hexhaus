function buildEntranceHall(){
  // ── MATERIALS ──────────────────────────────────────────────────────────────
  // Dark plaster walls with warm green-brown tint (witch's cottage, not Victorian)
  const wallM = pbr('wallM', TEX.plaster_d, TEX.plaster_n, 3, 2,
    new BABYLON.Color3(0.52, 0.55, 0.46));

  const floorM = pbr('floorM', TEX.wood_d, TEX.wood_n, 5, 4, new BABYLON.Color3(0.48, 0.36, 0.25));
  floorM.specularColor = new BABYLON.Color3(0.06, 0.04, 0.02); floorM.specularPower = 20;

  // Dark wood beam ceiling
  const ceilM = pbr('ceilM', TEX.beam_d, TEX.beam_n, 4, 3,
    new BABYLON.Color3(0.25, 0.19, 0.12));

  // Dark wood for furniture/trim
  const woodM = pbr('woodM', TEX.darkwood_d, TEX.darkwood_n, 3, 2,
    new BABYLON.Color3(0.42, 0.31, 0.19));

  // Stone for fireplace
  const stoneM = pbr('stoneM', TEX.rock_d, TEX.rock_n, 2, 2,
    new BABYLON.Color3(0.54, 0.51, 0.46));

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
  const hearth = BABYLON.MeshBuilder.CreateBox('hearth', {width:3.2, height:2.6, depth:0.12}, scene);
  hearth.position.set(fpX, 1.3, fpZ - 0.22); hearth.material = stoneM;
  [-1.35,1.35].forEach((x,i)=>{
    const pillar=BABYLON.MeshBuilder.CreateBox('hearthPillar'+i,{width:0.5,height:2.6,depth:0.7},scene);
    pillar.position.set(x,1.3,fpZ+0.12); pillar.material=stoneM;
    interactables.set(pillar.name,'fireplace');
  });

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
  firebox.position.set(fpX, 0.8, fpZ + 0.38); firebox.material = fbM;

  // Glowing embers
  const emberM = mat('emberM');
  emberM.emissiveColor = new BABYLON.Color3(0.7, 0.22, 0.04);
  const embers = BABYLON.MeshBuilder.CreateBox('embers', {width:1.2, height:0.04, depth:0.35}, scene);
  embers.position.set(fpX, 0.12, fpZ + 0.53); embers.material = emberM;

  // Small flame cones
  for (let f = 0; f < 3; f++) {
    const flame = BABYLON.MeshBuilder.CreateCylinder('flame'+f, {diameterTop:0.02, diameterBottom:0.15, height:0.35+f*0.08, tessellation:6}, scene);
    flame.position.set(fpX - 0.3 + f*0.3, 0.3, fpZ + 0.55);
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

  // ── STAFF AND SPELL BOOK (complete the six-item room loop) ────────────────
  const staffM = mat('staffM'); staffM.diffuseColor = new BABYLON.Color3(0.17,0.10,0.05);
  const staffStem = BABYLON.MeshBuilder.CreateCylinder('staffStem', {diameterTop:0.055,diameterBottom:0.09,height:1.85,tessellation:8}, scene);
  staffStem.position.set(-5,0.93,-3); staffStem.rotation.z=0.12; staffStem.material=staffM;
  const staffTip = BABYLON.MeshBuilder.CreateSphere('staffTip', {diameter:0.16,segments:8}, scene);
  staffTip.position.set(-5.12,1.85,-3); staffTip.material=emitM('staffTipM',0.18,0.22,0.12,0.35);

  const bookM = mat('spellbookM'); bookM.diffuseColor=new BABYLON.Color3(0.16,0.04,0.07);
  const spellbook = BABYLON.MeshBuilder.CreateBox('spellbookMesh', {width:0.22,height:0.065,depth:0.18}, scene);
  spellbook.position.set(-2.08,0.89,D/2-0.25); spellbook.material=bookM;

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

  // ── HERBALIST'S SHELF (to the left of the hearth, clear of the bathroom door) ──
  const specimenShelf = BABYLON.MeshBuilder.CreateBox('specimenShelf',
    {width:1.42,height:0.09,depth:0.34},scene);
  specimenShelf.position.set(-4.15,1.45,-D/2+0.42); specimenShelf.material=woodM;
  const glassTints = [[0.34,0.25,0.11],[0.13,0.26,0.16],[0.26,0.15,0.23]];
  glassTints.forEach(([r,g,b],i)=>{
    const x=-4.56+i*0.41, z=-D/2+0.46;
    const jarM=mat('specimenJarM'+i);
    jarM.diffuseColor=new BABYLON.Color3(r,g,b);
    jarM.emissiveColor=new BABYLON.Color3(r*0.12,g*0.12,b*0.12);
    const jar=BABYLON.MeshBuilder.CreateCylinder('specimenJar'+i,
      {diameter:0.15,height:0.29,tessellation:12},scene);
    jar.position.set(x,1.64,z);jar.material=jarM;
    const lid=BABYLON.MeshBuilder.CreateCylinder('specimenLid'+i,
      {diameter:0.16,height:0.055,tessellation:12},scene);
    lid.position.set(x,1.81,z);lid.material=woodM;
    interactables.set(jar.name,'jars');interactables.set(lid.name,'jars');
  });

  // Model diagnostics are opt-in: add ?debug=1 to the URL.
  if(new URLSearchParams(location.search).get('debug') === '1'){
    const dbgEl=document.createElement('div'); dbgEl.id='dbgLoad';
    dbgEl.style.cssText='position:fixed;top:40px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#0f0;font:11px monospace;padding:4px 8px;z-index:9999;max-width:90%;pointer-events:none';
    document.body.appendChild(dbgEl);
  }

  // ── LIGHTS ──────────────────────────────────────────────────────────────────
  // Fireplace glow (warm amber)
  const fireLight = new BABYLON.PointLight('fireLight', new BABYLON.Vector3(fpX, 0.8, fpZ + 0.2), scene);
  fireLight.diffuse = new BABYLON.Color3(1.0, 0.5, 0.15);
  fireLight.intensity = 1.8; fireLight.range = 10;

  // Moonlight from window (cool blue)
  const moonLight = new BABYLON.PointLight('moonLight', new BABYLON.Vector3(4.5, 3, D/2 - 0.5), scene);
  moonLight.diffuse = new BABYLON.Color3(0.25, 0.35, 0.55);
  moonLight.intensity = 0.8; moonLight.range = 12;

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
  ambient.intensity = 0.95; ambient.diffuse = new BABYLON.Color3(0.5, 0.45, 0.4); ambient.groundColor = new BABYLON.Color3(0.25, 0.2, 0.15);
  ambient.diffuse = new BABYLON.Color3(0.75, 0.67, 0.56);
  ambient.groundColor = new BABYLON.Color3(0.42, 0.34, 0.26);

  // ── FLICKERING ──────────────────────────────────────────────────────────────
  let ft = 0;
  function flk(base, amp, sp, off) {
    return base + amp * (Math.sin(ft*sp + off)*0.5 + Math.sin(ft*sp*2.3 + off*1.7)*0.3 + Math.sin(ft*sp*0.41 + off*0.9)*0.2);
  }
  scene.registerBeforeRender(() => {
    ft += engine.getDeltaTime() * 0.001;
    fireLight.intensity = flk(1.8, 0.25, 3.7, 1.2);
    candleLight.intensity = flk(1.0, 0.15, 4.1, 0.5);
    sconceLights.forEach((sl, i) => {
      sl.intensity = flk(1.2, 0.12, 2.1 + i*0.7, i*1.3);
    });
    if (embers) embers.material.emissiveColor = new BABYLON.Color3(flk(0.7, 0.15, 3.7, 0.5), flk(0.22, 0.06, 3.7, 1.0), 0.02);
    // Flicker candle flame
    if (candleFlame) candleFlame.material.emissiveColor = new BABYLON.Color3(flk(1.0, 0.15, 4.1, 0.3), flk(0.65, 0.08, 4.1, 0.7), 0.12);
  });

  // ── INTERACTABLES ───────────────────────────────────────────────────────────
  interactables.set('staffStem', 'staff');
  interactables.set('staffTip', 'staff');
  interactables.set('spellbookMesh', 'spellbook');
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
  // Use the open procedural hearth; the imported solid mesh concealed its flames.
  
  // Chandelier hanging from ceiling
  loadModel('Light_Chandelier.glb', [0, H - 1.0, 0], 200, 0, null, 'ceiling');
  
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
  loadModel('Scythe.glb', [W/2 - 0.5, 1.8, -1], 35, -Math.PI/2, null, 'wall');
  
  // Chest in corner
  loadModel('Chest_Closed.glb', [-W/2 + 1.0, 0, -D/2 + 1.0], 100, 0, null);

  // Lived-in details at the edges of the room; keep the center and door sightlines open.
  loadModel('Houseplant_3.glb', [-7.1, 0, -1.1], 300, 0, null);
  loadModel('Barrel.glb', [7.1, 0, 0.5], 350, 0, null);
  // Two small cups complete the already-interactive tea table.
  loadModel('Chalice.glb', [-0.26, 0.59, 3], 25, 0, 'tea');
  loadModel('Chalice.glb', [0.26, 0.59, 3], 25, 0, 'tea');

  // Door to Living Room (left wall)
  const doorLR = BABYLON.MeshBuilder.CreateBox('door_living', {width:0.1, height:2.4, depth:1.4}, scene);
  doorLR.position.set(-W/2 + 0.05, 1.2, 3);
  const dLR_M = mat('dLR_M'); dLR_M.diffuseColor = new BABYLON.Color3(0.18,0.12,0.07); doorLR.material = dLR_M;
  interactables.set('door_living', 'door_living');

  // Door to Library (right wall)
  const doorLib = BABYLON.MeshBuilder.CreateBox('door_library', {width:0.1, height:2.4, depth:1.4}, scene);
  doorLib.position.set(W/2 - 0.05, 1.2, 3);
  const dLib_M = mat('dLib_M'); dLib_M.diffuseColor = new BABYLON.Color3(0.18,0.12,0.07); doorLib.material = dLib_M;
  interactables.set('door_library', 'door_library');

  // Door to Kitchen (back wall, right of fireplace)
  const doorKit = BABYLON.MeshBuilder.CreateBox('door_kitchen', {width:1.2, height:2.4, depth:0.1}, scene);
  doorKit.position.set(W/2 - 2.5, 1.2, -D/2 + 0.05);
  const dKit_M = mat('dKit_M'); dKit_M.diffuseColor = new BABYLON.Color3(0.18,0.12,0.07); doorKit.material = dKit_M;
  interactables.set('door_kitchen', 'door_kitchen');

  // Door to Bathroom (back wall, left of fireplace)
  const doorBath = BABYLON.MeshBuilder.CreateBox('door_bathroom', {width:1.2, height:2.4, depth:0.1}, scene);
  doorBath.position.set(-W/2 + 2.5, 1.2, -D/2 + 0.05);
  const dBath_M = mat('dBath_M'); dBath_M.diffuseColor = new BABYLON.Color3(0.18,0.12,0.07); doorBath.material = dBath_M;
  interactables.set('door_bathroom', 'door_bathroom');
}
