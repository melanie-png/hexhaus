function buildKitchen(){
  const W=14, D=12, H=4.0;
  const wallM = pbr('k_wallM', TEX.mstone_d, TEX.mstone_n, 2, 2, new BABYLON.Color3(0.25,0.28,0.30));
  const floorM = pbr('k_floorM', TEX.stone_d, TEX.stone_n, 4, 3, new BABYLON.Color3(0.22,0.24,0.26));
  const ceilM = pbr('k_ceilM', TEX.beam_d, TEX.beam_n, 3, 3, new BABYLON.Color3(0.14,0.09,0.05));
  const woodM = pbr('k_woodM', TEX.darkwood_d, TEX.darkwood_n, 3, 2, new BABYLON.Color3(0.3,0.22,0.12));

  const floor=BABYLON.MeshBuilder.CreateGround('k_floor',{width:W,height:D,subdivisions:4},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('k_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function kWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  kWall('k_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); kWall('k_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
  doorwayWall('k_wF',W,H,0,D/2,Math.PI,wallM,[{dx:0,dz:D/2,dw:1.5,dh:2.5}]);
  doorwayWall('k_wB',W,H,0,-D/2,0,wallM,[{dx:-W/2+3,dz:-D/2,dw:1.3,dh:2.5}]);
  makeWindow('win_kB1',  3.2, 2.6, -D/2, 0);
  makeWindow('win_kB2', -4.0, 2.6, -D/2, 0);

  // ── house elements ──
  makeWeb('el_kit_web1',-6.75,3.55,-5.6,0,0.95);
  makeDust('el_kit_dust',3.2,2.3,-5.35);
  makeWax('el_kit_wax1',4.5,-5.85,0.10);
  makePotionShelf('el_kit_potions',-6.85,1.5,-1.0,Math.PI/2);
  makeHerbBundles('el_kit_herbs',[[-2.5,3.35,-2.5],[0.5,3.30,-3.0],[2.6,3.28,-1.6]]);
  makeSaltLine('el_kit_salt',4.5,-5.72,0,1.5);
  makeRat('el_kit_rat',[{x:1.0,z:-5.35},{x:4.3,z:-5.45},{x:6.4,z:-5.4},{x:3.0,z:-5.4}],5);
  [-4,-1,2].forEach(bx=>{ const b=BABYLON.MeshBuilder.CreateBox('k_beam'+bx,{width:0.28,height:0.26,depth:D},scene); b.position.set(bx,H-0.14,0); const bm=mat('k_bm'+bx); bm.diffuseColor=new BABYLON.Color3(0.14,0.07,0.03); b.material=bm; });

  // Stone hearth with cauldron
  const hearthM=pbr('k_hearthM',TEX.rock_d,TEX.rock_n,2,2,new BABYLON.Color3(0.28,0.32,0.35));
  const hearth=BABYLON.MeshBuilder.CreateBox('k_hearth',{width:3.5,height:2.8,depth:0.8},scene); hearth.position.set(0,1.4,-D/2+0.4); hearth.material=hearthM;
  for(let a=0;a<6;a++){ const ang=(a/5)*Math.PI; const ax=Math.cos(ang)*1.2; const ay=2.5+Math.sin(ang)*0.5; const b=BABYLON.MeshBuilder.CreateBox('k_hArch'+a,{width:0.28,height:0.35,depth:0.4},scene); b.position.set(ax,ay,-D/2+0.4); b.material=hearthM; }
  const cauldM=mat('k_cauldM'); cauldM.diffuseColor=new BABYLON.Color3(0.08,0.06,0.08);
  const cauldron=BABYLON.MeshBuilder.CreateSphere('k_cauldron',{diameter:0.8,segments:12},scene); cauldron.position.set(0,0.35,-D/2+0.5); cauldron.scaling.y=0.7; cauldron.material=cauldM;
  const brewM=mat('k_brewM'); brewM.emissiveColor=new BABYLON.Color3(0.05,0.4,0.15); brewM.alpha=0.75;
  const brew=BABYLON.MeshBuilder.CreateDisc('k_brew',{radius:0.3,tessellation:16},scene); brew.position.set(0,0.55,-D/2+0.5); brew.rotation.x=Math.PI/2; brew.material=brewM;
  const smokeM=mat('k_smokeM'); smokeM.diffuseColor=new BABYLON.Color3(0.08,0.15,0.08); smokeM.emissiveColor=new BABYLON.Color3(0.03,0.08,0.03); smokeM.alpha=0.1;
  const smoke=BABYLON.MeshBuilder.CreateCylinder('k_smoke',{diameterTop:0.5,diameterBottom:0.1,height:1.5,tessellation:8},scene); smoke.position.set(0,1.3,-D/2+0.5); smoke.material=smokeM;

  // Copper pot rack
  const rackM=mat('k_rackM'); rackM.diffuseColor=new BABYLON.Color3(0.3,0.18,0.08); rackM.specularColor=new BABYLON.Color3(0.3,0.2,0.1);
  const rackBar=BABYLON.MeshBuilder.CreateBox('k_rack',{width:3.5,height:0.06,depth:0.06},scene); rackBar.position.set(0,H-0.6,0); rackBar.material=rackM;
  [-1.6,1.6].forEach((cx,ci)=>{ const ch=BABYLON.MeshBuilder.CreateCylinder('k_rackchain'+ci,{diameter:0.012,height:0.6,tessellation:6},scene); ch.position.set(cx,H-0.3,0); ch.material=rackM; });
  for(let p=0;p<5;p++){ const px=-1.5+p*0.75;
    const pan=BABYLON.MeshBuilder.CreateCylinder('k_pan'+p,{diameterTop:0.3,diameterBottom:0.25,height:0.12,tessellation:12},scene); pan.position.set(px,H-0.9,0); pan.material=rackM;
    const hook=BABYLON.MeshBuilder.CreateCylinder('k_hook'+p,{diameter:0.01,height:0.3,tessellation:4},scene); hook.position.set(px,H-0.75,0); hook.material=rackM;
  }

  // Leaded window
  const winM=mat('k_winM'); winM.diffuseColor=new BABYLON.Color3(0.06,0.10,0.18); winM.emissiveColor=new BABYLON.Color3(0.06,0.12,0.2); winM.alpha=0.82;
  const win=BABYLON.MeshBuilder.CreatePlane('k_win',{width:2.0,height:2.4},scene); win.position.set(-W/2+0.08,2.0,0); win.rotation.y=Math.PI/2; win.material=winM;
  for(let h=0;h<3;h++){ const herb=BABYLON.MeshBuilder.CreateCylinder('k_winHerb'+h,{diameterTop:0.03,diameterBottom:0.06,height:0.25,tessellation:6},scene); herb.position.set(-W/2+0.15,0.85,-0.5+h*0.5); const hm=mat('k_whm'+h); hm.diffuseColor=new BABYLON.Color3(0.25,0.3,0.12); herb.material=hm; }

  // Butcher's block
  const blockM=pbr('k_blockM',TEX.wood_d,TEX.wood_n,2,1,new BABYLON.Color3(0.32,0.24,0.14));
  const block=BABYLON.MeshBuilder.CreateBox('k_block',{width:1.5,height:0.9,depth:1.0},scene); block.position.set(W/2-2,0.45,1); block.material=blockM;
  const cleaverM=mat('k_cleaverM'); cleaverM.diffuseColor=new BABYLON.Color3(0.3,0.28,0.3); cleaverM.specularColor=new BABYLON.Color3(0.5,0.5,0.5);
  const cleaver=BABYLON.MeshBuilder.CreateBox('k_cleaver',{width:0.04,height:0.25,depth:0.15},scene); cleaver.position.set(W/2-2,0.95,0.8); cleaver.material=cleaverM;
  for(let k=0;k<4;k++){ const knife=BABYLON.MeshBuilder.CreateBox('k_knife'+k,{width:0.02,height:0.02,depth:0.2},scene); knife.position.set(W/2-2-0.4+k*0.25,0.92,1.1); knife.material=cleaverM; }

  // Spice shelves
  for(let s=0;s<3;s++){ const shelf=BABYLON.MeshBuilder.CreateBox('k_spice'+s,{width:2.5,height:0.05,depth:0.25},scene); shelf.position.set(W/2-2.5,1.0+s*0.5,-D/2+0.15); shelf.material=woodM;
    for(let j=0;j<6;j++){ const jar=BABYLON.MeshBuilder.CreateCylinder('k_sjar'+s+'_'+j,{diameterTop:0.04,diameterBottom:0.05,height:0.15,tessellation:8},scene); jar.position.set(W/2-3.2+j*0.4,1.1+s*0.5,-D/2+0.2); const jm=mat('k_sjm'+s+j); jm.diffuseColor=new BABYLON.Color3(0.3+Math.random()*0.3,0.15+Math.random()*0.15,0.05+Math.random()*0.1); jar.material=jm; }
  }

  // Red rug
  const rugM=mat('k_rugM'); rugM.diffuseColor=new BABYLON.Color3(0.35,0.08,0.06);
  const rug=BABYLON.MeshBuilder.CreateGround('k_rug',{width:3.0,height:4.0,subdivisions:2},scene); rug.position.set(0,0.01,2); rug.material=rugM;

  // Hanging garlic
  [[-4,-3],[-4,3],[2,-3],[2,3]].forEach(([gx,gz],gi)=>{
    const str=BABYLON.MeshBuilder.CreateCylinder('k_gstr'+gi,{diameter:0.008,height:0.35,tessellation:4},scene); str.position.set(gx,H-0.45,gz); str.material=rackM;
    const g=BABYLON.MeshBuilder.CreateCylinder('k_garlic'+gi,{diameterTop:0.04,diameterBottom:0.15,height:0.4,tessellation:8},scene); g.position.set(gx,H-0.62,gz); const gm=mat('k_gm'+gi); gm.diffuseColor=new BABYLON.Color3(0.28,0.24,0.16); g.material=gm;
  });

  // Flour workbench along the left wall
  const benchTop=BABYLON.MeshBuilder.CreateBox('k_benchTop',{width:1.0,height:0.07,depth:4.6},scene); benchTop.position.set(-6.3,0.92,-0.75); benchTop.material=woodM;
  [[-6.72,-2.95],[-5.88,-2.95],[-6.72,1.45],[-5.88,1.45]].forEach(([lx,lz],li)=>{
    const leg=BABYLON.MeshBuilder.CreateCylinder('k_bleg'+li,{diameter:0.08,height:0.9,tessellation:8},scene); leg.position.set(lx,0.45,lz); leg.material=woodM;
  });
  const bshelf=BABYLON.MeshBuilder.CreateBox('k_bshelf',{width:0.9,height:0.05,depth:4.3},scene); bshelf.position.set(-6.3,0.35,-0.75); bshelf.material=woodM;
  const rpin=BABYLON.MeshBuilder.CreateCylinder('k_rpin',{diameter:0.06,height:0.38,tessellation:10},scene); rpin.rotation.x=Math.PI/2; rpin.position.set(-6.3,0.985,-2.2); rpin.material=woodM;
  const bowlM=mat('k_bowlM'); bowlM.diffuseColor=new BABYLON.Color3(0.55,0.5,0.42);
  const bowl=BABYLON.MeshBuilder.CreateCylinder('k_bowl',{diameterTop:0.24,diameterBottom:0.14,height:0.11,tessellation:12},scene); bowl.position.set(-6.3,0.99,-0.2); bowl.material=bowlM;
  const dough=BABYLON.MeshBuilder.CreateSphere('k_dough',{diameter:0.2,segments:8},scene); dough.scaling.y=0.5; dough.position.set(-6.3,1.0,-0.2); dough.material=bowlM;
  const sackM=mat('k_sackM'); sackM.diffuseColor=new BABYLON.Color3(0.45,0.38,0.28);
  const sack=BABYLON.MeshBuilder.CreateSphere('k_sack',{diameter:0.3,segments:8},scene); sack.scaling.set(1,1.15,0.75); sack.position.set(-6.45,1.06,0.9); sack.material=sackM;
  const sackTie=BABYLON.MeshBuilder.CreateCylinder('k_sackTie',{diameterTop:0.02,diameterBottom:0.06,height:0.1,tessellation:6},scene); sackTie.position.set(-6.45,1.26,0.9); sackTie.material=sackM;

  // Stone wash-trough sink, right wall
  const sinkM=pbr('k_sinkM',TEX.rock_d,TEX.rock_n,1,1,new BABYLON.Color3(0.42,0.44,0.45));
  const sink=BABYLON.MeshBuilder.CreateBox('k_sink',{width:0.7,height:0.64,depth:1.3},scene); sink.position.set(6.55,0.32,3.0); sink.material=sinkM;
  const basinM=mat('k_basinM'); basinM.diffuseColor=new BABYLON.Color3(0.1,0.12,0.13);
  const basinIn=BABYLON.MeshBuilder.CreateBox('k_basinIn',{width:0.5,height:0.04,depth:1.05},scene); basinIn.position.set(6.55,0.58,3.0); basinIn.material=basinM;
  const jug=BABYLON.MeshBuilder.CreateCylinder('k_jug',{diameterTop:0.09,diameterBottom:0.16,height:0.34,tessellation:10},scene); jug.position.set(6.55,0.76,3.85); jug.material=bowlM;

  // Firewood and bellows beside the hearth
  const logM=pbr('k_logM',TEX.wood_d,TEX.wood_n,1,1,new BABYLON.Color3(0.3,0.2,0.1));
  [[-5.55,0.07],[-5.32,0.07],[-5.44,0.2],[-5.55,0.33],[-5.32,0.33]].forEach(([lz,ly],li)=>{
    const log=BABYLON.MeshBuilder.CreateCylinder('k_woodlog'+li,{diameter:0.13,height:0.55,tessellation:8},scene); log.rotation.z=Math.PI/2; log.position.set(2.0,ly,lz-0.1); log.material=logM;
  });
  const belA=BABYLON.MeshBuilder.CreateBox('k_belA',{width:0.5,height:0.03,depth:0.18},scene); belA.position.set(1.1,0.04,-5.5); belA.rotation.y=0.3; belA.material=woodM;
  const belB=BABYLON.MeshBuilder.CreateBox('k_belB',{width:0.5,height:0.03,depth:0.18},scene); belB.position.set(1.1,0.1,-5.5); belB.rotation.x=0.22; belB.rotation.y=0.3; belB.material=woodM;

  // Copper kettle hung at the hearth arch
  const ketM=mat('k_ketM'); ketM.diffuseColor=new BABYLON.Color3(0.45,0.26,0.1); ketM.specularColor=new BABYLON.Color3(0.6,0.4,0.2);
  const karm=BABYLON.MeshBuilder.CreateCylinder('k_karm',{diameter:0.014,height:0.45,tessellation:6},scene); karm.rotation.x=Math.PI/2; karm.position.set(0.9,2.05,-5.3); karm.material=rackM;
  const khook=BABYLON.MeshBuilder.CreateCylinder('k_khook',{diameter:0.012,height:0.25,tessellation:4},scene); khook.position.set(0.9,1.95,-5.08); khook.material=rackM;
  const kettle=BABYLON.MeshBuilder.CreateSphere('k_kettle',{diameter:0.28,segments:10},scene); kettle.scaling.y=0.8; kettle.position.set(0.9,1.76,-5.08); kettle.material=ketM;
  const kspout=BABYLON.MeshBuilder.CreateCylinder('k_kspout',{diameter:0.03,height:0.14,tessellation:6},scene); kspout.rotation.z=Math.PI/3; kspout.position.set(1.03,1.78,-5.08); kspout.material=ketM;
  const khandle=BABYLON.MeshBuilder.CreateTorus('k_khandle',{diameter:0.14,thickness:0.014,tessellation:10},scene); khandle.rotation.x=Math.PI/2; khandle.position.set(0.9,1.86,-5.08); khandle.material=ketM;

  // Cast-iron skillet on the butcher's block
  const skillet=BABYLON.MeshBuilder.CreateCylinder('k_skillet',{diameter:0.26,height:0.035,tessellation:14},scene); skillet.position.set(5.0,0.94,0.75); skillet.material=cauldM;
  const skh=BABYLON.MeshBuilder.CreateBox('k_skhandle',{width:0.2,height:0.02,depth:0.04},scene); skh.position.set(5.2,0.94,0.75); skh.material=cauldM;

  // Storage barrels by the pantry door
  const barrelM=pbr('k_barrelM',TEX.wood_d,TEX.wood_n,1,1,new BABYLON.Color3(0.35,0.26,0.15));
  [[-5.2,-5.25],[-2.8,-5.5]].forEach(([bx,bz],bi)=>{
    const bar=BABYLON.MeshBuilder.CreateCylinder('k_barrel'+bi,{diameterTop:0.44,diameterBottom:0.4,height:0.62,tessellation:12},scene); bar.position.set(bx,0.31,bz); bar.material=barrelM;
  });

  // Lights
  const hearthLight=new BABYLON.PointLight('k_hL',new BABYLON.Vector3(0,0.8,-D/2+0.5),scene);
  hearthLight.diffuse=new BABYLON.Color3(0.1,0.6,0.2); hearthLight.intensity=1.5; hearthLight.range=10;
  const winLight=new BABYLON.PointLight('k_wL',new BABYLON.Vector3(-W/2+1,2.5,0),scene);
  winLight.diffuse=new BABYLON.Color3(0.2,0.3,0.5); winLight.intensity=1.0; winLight.range=12;
  const ambient=new BABYLON.HemisphericLight('k_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.4; ambient.diffuse=new BABYLON.Color3(0.3,0.35,0.4); ambient.groundColor=new BABYLON.Color3(0.1,0.08,0.05);

  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    hearthLight.intensity=flk(1.5,0.3,2.5,0.5);
    if(brew) brew.material.emissiveColor=new BABYLON.Color3(0.03,flk(0.4,0.1,1.8,2),0.12);
    if(smoke) { smoke.rotation.y=ft*0.3; smoke.position.y=1.3+Math.sin(ft*0.5)*0.1; }
  });

  interactables.set('k_cauldron','cauldron'); interactables.set('k_brew','cauldron');
  interactables.set('k_hearth','fireplace');
  interactables.set('k_garlic0','herbs_dried'); interactables.set('k_garlic1','herbs_dried');
  interactables.set('k_benchTop','workbench'); interactables.set('k_bowl','workbench');
  interactables.set('k_sink','stonesink'); interactables.set('k_kettle','kettle');

  buildDoor('door_entrance', 0, D/2, Math.PI, 1.34, 2.38);
  interactables.set('door_entrance','door_entrance');
  buildDoor('door_pantry', -W/2+3, -D/2, 0, 1.14, 2.38);
  interactables.set('door_pantry','door_pantry');
}

// ─── LIBRARY ──────────────────────────────────────────────────────────────────
