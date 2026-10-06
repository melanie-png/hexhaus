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
  // Floor with a stairwell opening cut at the right wall (x 7..9, z 2.05..3.95) —
  // the flight to the library descends through it.
  const fA = BABYLON.MeshBuilder.CreateGround('floor',{width:W-2,height:D,subdivisions:4},scene);
  fA.position.x = -1; fA.material = floorM; fA.receiveShadows = true;
  const fB = BABYLON.MeshBuilder.CreateGround('floorB',{width:2,height:2.05+D/2,subdivisions:2},scene);   // z -6 .. 2.05
  fB.position.set(8, 0, (2.05-D/2)/2); fB.material = floorM; fB.receiveShadows = true;
  const fC = BABYLON.MeshBuilder.CreateGround('floorC',{width:2,height:(D/2)-3.95,subdivisions:2},scene);
  fC.position.set(8, 0, 3.95+(D/2-3.95)/2); fC.material = floorM; fC.receiveShadows = true;

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
  wall('wFront', W, H, new BABYLON.Vector3(0, H/2,  D/2), Math.PI);
  // Walls with real doorways — the doors open and close like doors.
  doorwayWall('e_wB', W, H, 0, -D/2, 0, wallM, [
    {dx:-W/2+2.5, dz:-D/2, dw:1.3, dh:2.5},
    {dx: W/2-2.5, dz:-D/2, dw:1.3, dh:2.5}
  ]);
  doorwayWall('e_wL', D, H, -W/2, 0, Math.PI/2, wallM, [{dx:-W/2, dz:3, dw:1.5, dh:2.5}]);
  doorwayWall('e_wR', D, H,  W/2, 0, -Math.PI/2, wallM, [{dx: W/2, dz:3, dw:2.0, dh:2.8}]);
  makeStairs('door_library', W/2, 3, -Math.PI/2, {mode:'downIn', steps:6, rise:0.17, run:0.30, width:1.9});   // down to the library, through the floor opening
  // Moonlit windows
  makeWindow('win_eF1', -4.5, 3.0, D/2, Math.PI);
  makeWindow('win_eF2',  4.5, 3.0, D/2, Math.PI);
  makeWindow('win_eL1', -W/2, 3.0, -4.2, Math.PI/2);
  makeWindow('win_eR1',  W/2, 3.0, -4.2, -Math.PI/2);

  // ── house elements ──
  makeWeb('el_entr_web1',-8.6,4.5,5.55,0,1.0);
  makeWeb('el_entr_web2',-8.95,3.05,-0.8,Math.PI/2,0.8);
  makeDust('el_entr_dust',-4.5,2.6,5.1);
  makeWax('el_entr_wax1',-0.4,4.72); makeWax('el_entr_wax2',0.55,4.6,0.10); makeWax('el_entr_wax3',-0.85,4.55,0.09);
  makeHat('el_entr_hat',5.6,1.72,5.88,Math.PI);
  makeLooseBoard('el_entr_board',5.0,-2.8,0);
  makeGramophone('el_entr_gram',-7.8,4.8,2.2);
  makeRat('el_entr_rat',[{x:-5.2,z:-5.35},{x:-1.5,z:-5.4},{x:1.6,z:-5.35},{x:-0.6,z:-5.4}],3);
  makeMoths('el_entr_moths',0.2,1.05,4.9);

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

  // ── Hearth depth: lintel, chimney breast, hearth slab, logs ──────────────
  const fpLintel = BABYLON.MeshBuilder.CreateBox('fpLintel', {width:3.3, height:0.32, depth:0.72}, scene);
  fpLintel.position.set(fpX, 2.72, fpZ+0.12); fpLintel.material = stoneM;
  const fpBreast = BABYLON.MeshBuilder.CreateBox('fpBreast', {width:2.6, height:H-2.88, depth:0.62}, scene);
  fpBreast.position.set(fpX, 2.88+(H-2.88)/2, -D/2+0.31); fpBreast.material = stoneM;
  fpBreast.isPickable = false;
  const fpSlab = BABYLON.MeshBuilder.CreateBox('fpSlab', {width:3.4, height:0.07, depth:0.9}, scene);
  fpSlab.position.set(fpX, 0.035, fpZ+0.85); fpSlab.material = stoneM; fpSlab.isPickable = false;
  // Soot blackening around the opening
  const sootM = mat('fpSootM');
  sootM.diffuseColor=new BABYLON.Color3(0.05,0.04,0.035); sootM.emissiveColor=new BABYLON.Color3(0.01,0.008,0.006);
  [[-0.95],[0.95]].forEach(([sx])=>{
    const sm=BABYLON.MeshBuilder.CreatePlane('fpSoot'+(sx<0?'L':'R'),{width:0.5,height:1.8},scene);
    sm.position.set(fpX+sx,0.95,fpZ+0.403); sm.material=sootM; sm.isPickable=false;
  });
  const sootTop=BABYLON.MeshBuilder.CreatePlane('fpSootT',{width:2.2,height:0.8},scene);
  sootTop.position.set(fpX,1.9,fpZ+0.403); sootTop.material=sootM; sootTop.isPickable=false;
  // Andirons + log pile (the wood that isn't burning)
  const fpIronM = mat('fpIronM'); fpIronM.diffuseColor=new BABYLON.Color3(0.12,0.11,0.10); fpIronM.specularColor=new BABYLON.Color3(0.2,0.18,0.16); fpIronM.specularPower=32;
  [[-0.38],[0.38]].forEach(([ax])=>{
    const bar=BABYLON.MeshBuilder.CreateCylinder('fpAndiron'+(ax<0?'L':'R'),{diameter:0.028,height:0.72,tessellation:6},scene);
    bar.rotation.x=Math.PI/2; bar.position.set(fpX+ax,0.09,fpZ+0.62); bar.material=fpIronM; bar.isPickable=false;
  });
  const fpLogM = pbr('fpLogM', TEX.wood_d, TEX.wood_n, 1, 1, new BABYLON.Color3(0.30, 0.20, 0.12));
  [[0.0,0.17,-5.3],[-0.15,0.17,-5.12],[0.14,0.29,-5.22],[-0.05,0.41,-5.18]].forEach(([lx,ly,lz],li)=>{
    const lg=BABYLON.MeshBuilder.CreateCylinder('fpLog'+li,{diameterTop:0.11,diameterBottom:0.13,height:0.75,tessellation:8},scene);
    lg.rotation.x=Math.PI/2; lg.rotation.y=li*0.7; lg.position.set(fpX+lx,ly,lz); lg.material=fpLogM; lg.isPickable=false;
  });
  const fpAshM = mat('fpAshM'); fpAshM.diffuseColor=new BABYLON.Color3(0.22,0.20,0.18);
  const fpAsh = BABYLON.MeshBuilder.CreateSphere('fpAsh',{diameter:0.55,segments:8},scene);
  fpAsh.scaling.y=0.22; fpAsh.position.set(fpX+0.32,0.03,fpZ+0.52); fpAsh.material=fpAshM; fpAsh.isPickable=false;

  // ── GRANDFATHER CLOCK (right wall, stopped at 3:17) ─────────────────────────
  const clockX = W/2 - 0.22;
  const clockM = pbr('clockM', TEX.darkwood_d, TEX.darkwood_n, 1, 2, new BABYLON.Color3(0.32, 0.21, 0.11));
  const clockBody = BABYLON.MeshBuilder.CreateBox('clockBody', {width:0.34, height:2.4, depth:0.82}, scene);
  clockBody.position.set(clockX, 1.2, -3); clockBody.material = clockM;
  const clockCaseL = BABYLON.MeshBuilder.CreateBox('clockCaseL', {width:0.36, height:2.4, depth:0.06}, scene);
  clockCaseL.position.set(clockX, 1.2, -3.44); clockCaseL.material = clockM;
  const clockCaseR = clockCaseL.clone('clockCaseR'); clockCaseR.position.z = -2.56;
  const clockBack = BABYLON.MeshBuilder.CreateBox('clockBack', {width:0.02, height:2.4, depth:0.94}, scene);
  clockBack.position.set(clockX+0.16, 1.2, -3); clockBack.material = clockM;
  const clockHood = BABYLON.MeshBuilder.CreateBox('clockHood', {width:0.42, height:0.5, depth:0.94}, scene);
  clockHood.position.set(clockX, 2.64, -3); clockHood.material = clockM;
  const clockCrown = BABYLON.MeshBuilder.CreateBox('clockCrown', {width:0.5, height:0.09, depth:1.02}, scene);
  clockCrown.position.set(clockX, 2.935, -3); clockCrown.material = clockM;
  const entrBrassM = mat('entrBrassM'); entrBrassM.diffuseColor=new BABYLON.Color3(0.36,0.29,0.15); entrBrassM.specularColor=new BABYLON.Color3(0.55,0.45,0.25); entrBrassM.specularPower=48;
  const clockFinial = BABYLON.MeshBuilder.CreateSphere('clockFinial', {diameter:0.1, segments:8}, scene);
  clockFinial.position.set(clockX, 3.03, -3); clockFinial.material = entrBrassM;
  const clockPlinth = BABYLON.MeshBuilder.CreateBox('clockPlinth', {width:0.42, height:0.18, depth:0.94}, scene);
  clockPlinth.position.set(clockX, 0.09, -3); clockPlinth.material = clockM;
  // Painted dial — Roman numerals, hands stopped at 3:17
  const dialTex = new BABYLON.DynamicTexture('entr_dialTex', {width:256, height:256}, scene, false);
  const dc = dialTex.getContext();
  dc.fillStyle='#ddd0b0'; dc.fillRect(0,0,256,256);
  dc.strokeStyle='#3a2410'; dc.lineWidth=6; dc.beginPath(); dc.arc(128,128,120,0,Math.PI*2); dc.stroke();
  dc.strokeStyle='#7a5a30'; dc.lineWidth=3; dc.beginPath(); dc.arc(128,128,110,0,Math.PI*2); dc.stroke();
  for(let b=0;b<26;b++){ dc.fillStyle='rgba(120,90,50,'+(0.04+Math.random()*0.05)+')'; dc.beginPath(); dc.arc(20+Math.random()*216,20+Math.random()*216,8+Math.random()*20,0,Math.PI*2); dc.fill(); }
  dc.fillStyle='#2a1a08'; dc.textAlign='center'; dc.textBaseline='middle'; dc.font='bold 24px Georgia, serif';
  ['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI'].forEach((n,i)=>{
    const a=i/12*Math.PI*2-Math.PI/2; dc.fillText(n,128+Math.cos(a)*92,128+Math.sin(a)*92);
  });
  dc.strokeStyle='#2a1a08';
  for(let t=0;t<60;t++){ const a=t/60*Math.PI*2-Math.PI/2; const r2=(t%5===0)?96:101;
    dc.lineWidth=(t%5===0)?2.5:1.2; dc.beginPath(); dc.moveTo(128+Math.cos(a)*104,128+Math.sin(a)*104); dc.lineTo(128+Math.cos(a)*r2,128+Math.sin(a)*r2); dc.stroke();
  }
  const hA=(3+17/60)/12*Math.PI*2-Math.PI/2, mA=(17/60)*Math.PI*2-Math.PI/2;
  dc.strokeStyle='#1a0e04'; dc.lineCap='round';
  dc.lineWidth=7; dc.beginPath(); dc.moveTo(128,128); dc.lineTo(128+Math.cos(hA)*58,128+Math.sin(hA)*58); dc.stroke();
  dc.lineWidth=4; dc.beginPath(); dc.moveTo(128,128); dc.lineTo(128+Math.cos(mA)*88,128+Math.sin(mA)*88); dc.stroke();
  dc.fillStyle='#1a0e04'; dc.beginPath(); dc.arc(128,128,7,0,Math.PI*2); dc.fill();
  dialTex.update();
  const clockFace = BABYLON.MeshBuilder.CreateDisc('clockFace', {radius:0.23, tessellation:32}, scene);
  clockFace.rotation.y = -Math.PI/2;
  clockFace.position.set(clockX - 0.19, 1.85, -3);
  const dialM = mat('entrDialM'); dialM.diffuseTexture = dialTex; dialM.emissiveTexture = dialTex;
  dialM.emissiveColor = new BABYLON.Color3(0.32, 0.28, 0.2); clockFace.material = dialM;
  const clockGlass = BABYLON.MeshBuilder.CreatePlane('clockGlass', {width:0.62, height:1.05}, scene);
  clockGlass.rotation.y = -Math.PI/2;
  clockGlass.position.set(clockX - 0.19, 1.28, -3);
  const cgM = mat('entrClockGlassM'); cgM.diffuseColor=new BABYLON.Color3(0.05,0.05,0.06);
  cgM.emissiveColor=new BABYLON.Color3(0.015,0.015,0.02); cgM.specularColor=new BABYLON.Color3(0.25,0.25,0.3); cgM.specularPower=96; cgM.alpha=0.16;
  clockGlass.material = cgM;
  const pendRod = BABYLON.MeshBuilder.CreateCylinder('pendRod', {diameter:0.012, height:0.72, tessellation:6}, scene);
  pendRod.position.set(clockX - 0.05, 1.15, -3); pendRod.material = entrBrassM;
  const pendBob = BABYLON.MeshBuilder.CreateSphere('pendBob', {diameter:0.13, segments:10}, scene);
  pendBob.position.set(clockX - 0.05, 0.74, -3); pendBob.material = entrBrassM;
  [[-2.86],[-3.14]].forEach(([wz],wi)=>{
    const chain=BABYLON.MeshBuilder.CreateCylinder('clockChain'+wi,{diameter:0.008,height:0.7,tessellation:4},scene);
    chain.position.set(clockX-0.02,1.9,wz); chain.material=entrBrassM;
    const weight=BABYLON.MeshBuilder.CreateCylinder('clockWeight'+wi,{diameter:0.055,height:0.16,tessellation:8},scene);
    weight.position.set(clockX-0.02,1.47,wz); weight.material=entrBrassM;
  });

  // ── FAMILY PORTRAIT (left wall) ─────────────────────────────────────────────
  const portFrame = BABYLON.MeshBuilder.CreateBox('portFrame', {width:1.0, height:1.3, depth:0.06}, scene);
  portFrame.position.set(-W/2 + 0.06, 2.8, -2);
  portFrame.rotation.y = Math.PI/2;
  portFrame.material = woodM;
  const portCanvas = BABYLON.MeshBuilder.CreatePlane('portCanvas', {width:0.85, height:1.15}, scene);
  portCanvas.position.set(-W/2 + 0.09, 2.8, -2);
  portCanvas.rotation.y = Math.PI/2;
  // Painted family group — three face outward, the smallest faces the wall
  const famTex = new BABYLON.DynamicTexture('entr_familyTex', {width:256, height:344}, scene, false);
  const fc = famTex.getContext();
  fc.fillStyle='#1c130a'; fc.fillRect(0,0,256,344);
  fc.fillStyle='#241a10'; fc.fillRect(0,60,256,220);
  fc.fillStyle='#0e0906'; fc.fillRect(0,280,256,64);
  for(let b=0;b<40;b++){ fc.fillStyle='rgba(90,60,30,'+(0.03+Math.random()*0.06)+')'; fc.beginPath(); fc.arc(Math.random()*256,Math.random()*344,10+Math.random()*26,0,Math.PI*2); fc.fill(); }
  function fig(fx, fy, fh, facing){
    fc.fillStyle='#0a0705';
    fc.beginPath(); fc.moveTo(fx-fh*0.22,fy); fc.quadraticCurveTo(fx,fy+fh*0.08,fx+fh*0.22,fy); fc.lineTo(fx+fh*0.30,fy+fh*0.85); fc.lineTo(fx-fh*0.30,fy+fh*0.85); fc.closePath(); fc.fill();
    fc.beginPath(); fc.arc(fx,fy-fh*0.30,fh*0.16,0,Math.PI*2); fc.fill();
    if(facing){
      fc.fillStyle='#9a8568'; fc.beginPath(); fc.arc(fx,fy-fh*0.28,fh*0.11,0,Math.PI*2); fc.fill();
      fc.fillStyle='#3d2e1a'; fc.beginPath(); fc.arc(fx,fy-fh*0.40,fh*0.12,Math.PI,0); fc.fill();
    }
  }
  fig(64,140,110,true); fig(128,140,120,true); fig(192,140,110,true); fig(160,150,70,false);
  fc.strokeStyle='rgba(20,14,8,0.5)'; fc.lineWidth=0.6;
  for(let c=0;c<46;c++){ fc.beginPath(); let cx=Math.random()*256, cy=Math.random()*344; fc.moveTo(cx,cy);
    for(let sgm=0;sgm<4;sgm++){ cx+=(Math.random()-0.5)*30; cy+=(Math.random()-0.5)*30; fc.lineTo(cx,cy);} fc.stroke(); }
  const vg = fc.createRadialGradient(128,172,80,128,172,230); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(8,5,2,0.55)');
  fc.fillStyle=vg; fc.fillRect(0,0,256,344);
  famTex.update();
  const portM = mat('portCanvasM'); portM.diffuseTexture = famTex; portM.emissiveTexture = famTex;
  portM.emissiveColor = new BABYLON.Color3(0.55, 0.48, 0.38); portM.backFaceCulling = false;
  portCanvas.material = portM;
  // Gilt inner frame + corner rosettes
  const entrGiltM = mat('entrGiltM'); entrGiltM.diffuseColor=new BABYLON.Color3(0.32,0.25,0.12); entrGiltM.specularColor=new BABYLON.Color3(0.5,0.4,0.2); entrGiltM.specularPower=40;
  [[0.0,0.575,0.9,0.045],[0.0,-0.575,0.9,0.045],[-0.435,0.0,0.045,1.2],[0.435,0.0,0.045,1.2]].forEach(([oz,oy,bw,bh],bi)=>{
    const bar=BABYLON.MeshBuilder.CreateBox('portGilt'+bi,{width:0.018,height:bh,depth:bw},scene);
    bar.position.set(-W/2+0.088, 2.8+oy, -2+oz); bar.material=entrGiltM; bar.isPickable=false;
  });
  [[-0.62,-0.47],[0.62,-0.47],[-0.62,0.47],[0.62,0.47]].forEach(([oy,oz],ri)=>{
    const ros=BABYLON.MeshBuilder.CreateSphere('portRos'+ri,{diameter:0.09,segments:8},scene);
    ros.position.set(-W/2+0.05, 2.8+oy, -2+oz); ros.material=entrGiltM; ros.isPickable=false;
  });

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
  const console = BABYLON.MeshBuilder.CreateBox('console', {width:1.2, height:0.07, depth:0.42}, scene);
  console.position.set(-2.5, 0.83, D/2 - 0.25);
  console.material = woodM;
  [[-0.52,-0.14],[0.52,-0.14],[-0.52,0.14],[0.52,0.14]].forEach(([lx,lz],li)=>{
    const leg=BABYLON.MeshBuilder.CreateCylinder('consoleLeg'+li,{diameterTop:0.05,diameterBottom:0.07,height:0.8,tessellation:8},scene);
    leg.position.set(-2.5+lx,0.4,D/2-0.25+lz); leg.material=woodM;
  });
  const consoleApron=BABYLON.MeshBuilder.CreateBox('consoleApron',{width:1.05,height:0.09,depth:0.04},scene);
  consoleApron.position.set(-2.5,0.76,D/2-0.39); consoleApron.material=woodM;
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
  let rugTex = null;
  if(typeof BABYLON.DynamicTexture !== 'undefined'){
    const dt=new BABYLON.DynamicTexture('entr_rugTex',{width:256,height:352},scene,false);
    const rc=dt.getContext();
    rc.fillStyle='#4a0a0e'; rc.fillRect(0,0,256,352);
    rc.strokeStyle='#c89632'; rc.lineWidth=8; rc.strokeRect(10,10,236,332);
    rc.strokeStyle='#7a1a20'; rc.lineWidth=4; rc.strokeRect(20,20,216,312);
    rc.strokeStyle='#d4a242'; rc.lineWidth=3;
    rc.beginPath(); rc.moveTo(128,70); rc.lineTo(196,176); rc.lineTo(128,282); rc.lineTo(60,176); rc.closePath(); rc.stroke();
    rc.beginPath(); rc.arc(128,176,34,0,Math.PI*2); rc.stroke();
    rc.fillStyle='#3a080c'; rc.fill();
    rc.fillStyle='rgba(212,162,66,0.35)';
    for(let d=0;d<90;d++){ rc.beginPath(); rc.arc(28+Math.random()*200,28+Math.random()*296,1.6,0,Math.PI*2); rc.fill(); }
    rc.strokeStyle='rgba(0,0,0,0.10)'; rc.lineWidth=1;
    for(let ry=0;ry<352;ry+=3){ rc.beginPath(); rc.moveTo(0,ry); rc.lineTo(256,ry); rc.stroke(); }
    dt.update(); rugTex=dt;
  }
  const rugM = mat('rugM');
  if(rugTex){ rugM.diffuseTexture = rugTex; rugM.emissiveColor=new BABYLON.Color3(0.20,0.16,0.12); }
  else { rugM.diffuseColor = new BABYLON.Color3(0.30, 0.06, 0.04); }
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

  // ── WAINSCOT PANELING (dado rail + raised panels, front + left walls) ─────
  const entrPanelM = pbr('entrPanelM', TEX.darkwood_d, TEX.darkwood_n, 2, 1, new BABYLON.Color3(0.38, 0.28, 0.16));
  const entrRailM = mat('entrRailM'); entrRailM.diffuseColor=new BABYLON.Color3(0.16,0.10,0.05);
  const frtRail=BABYLON.MeshBuilder.CreateBox('entrRailF',{width:W,height:0.1,depth:0.12},scene);
  frtRail.position.set(0,1.22,D/2-0.05); frtRail.material=entrRailM; frtRail.isPickable=false;
  const frtBase=BABYLON.MeshBuilder.CreateBox('entrBaseF',{width:W,height:0.16,depth:0.1},scene);
  frtBase.position.set(0,0.08,D/2-0.05); frtBase.material=entrRailM; frtBase.isPickable=false;
  for(let pi=0;pi<13;pi++){
    const px=-7.5+pi*1.25;
    const pn=BABYLON.MeshBuilder.CreateBox('entrFPanel'+pi,{width:0.95,height:0.72,depth:0.035},scene);
    pn.position.set(px,0.62,D/2-0.06); pn.material=entrPanelM; pn.isPickable=false;
    const bd=BABYLON.MeshBuilder.CreateBox('entrFBead'+pi,{width:0.81,height:0.58,depth:0.02},scene);
    bd.position.set(px,0.62,D/2-0.048); bd.material=entrPanelM; bd.isPickable=false;
  }
  // Left wall run (clear of the living-room door at z 2.25..3.75 and the corner mirror)
  const lwRail=BABYLON.MeshBuilder.CreateBox('entrRailL',{width:0.12,height:0.1,depth:8.1},scene);
  lwRail.position.set(-W/2+0.05,1.22,-1.85); lwRail.material=entrRailM; lwRail.isPickable=false;
  const lwBase=BABYLON.MeshBuilder.CreateBox('entrBaseL',{width:0.1,height:0.16,depth:8.1},scene);
  lwBase.position.set(-W/2+0.05,0.08,-1.85); lwBase.material=entrRailM; lwBase.isPickable=false;
  for(let pi=0;pi<7;pi++){
    const pz=-5.4+pi*1.25;
    const pn=BABYLON.MeshBuilder.CreateBox('entrLPanel'+pi,{width:0.035,height:0.72,depth:0.95},scene);
    pn.position.set(-W/2+0.07,0.62,pz); pn.material=entrPanelM; pn.isPickable=false;
    const bd=BABYLON.MeshBuilder.CreateBox('entrLBead'+pi,{width:0.02,height:0.58,depth:0.81},scene);
    bd.position.set(-W/2+0.052,0.62,pz); bd.material=entrPanelM; bd.isPickable=false;
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

  // A well-worn firewood crate and a grimoire beside the two teacups.
  loadModel('Crate.glb', [-4.2, 0, -4.2], 350, -0.25, null);
  loadModel('Book3_Open.glb', [0, 0.585, 2.75], 45, 0, 'grimoire');

  // Real doors, hinged and latched
  buildDoor('door_living',   -W/2, 3,  Math.PI/2, 1.34, 2.38);
  // the library is a floor down — the stairs carry the name

  buildDoor('door_kitchen',  W/2-2.5, -D/2, 0, 1.14, 2.38);
  buildDoor('door_bathroom', -W/2+2.5, -D/2, 0, 1.14, 2.38);
}
