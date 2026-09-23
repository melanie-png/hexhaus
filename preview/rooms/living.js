function buildLivingRoom(){
  const W=16, D=12, H=4.5;
  const wallM = pbr('lr_wallM', TEX.plaster_d, TEX.plaster_n, 3, 2, new BABYLON.Color3(0.28,0.24,0.30));
  const floorM = pbr('lr_floorM', TEX.wood_d, TEX.wood_n, 5, 4, new BABYLON.Color3(0.35,0.25,0.16));
  const ceilM = pbr('lr_ceilM', TEX.beam_d, TEX.beam_n, 4, 3, new BABYLON.Color3(0.15,0.10,0.06));
  const woodM = pbr('lr_woodM', TEX.darkwood_d, TEX.darkwood_n, 3, 1, new BABYLON.Color3(0.3,0.22,0.12));

  const floor=BABYLON.MeshBuilder.CreateGround('lr_floor',{width:W,height:D,subdivisions:4},scene);
  floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('lr_ceil',{width:W,height:D},scene);
  ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function lrWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  lrWall('lr_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); lrWall('lr_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  lrWall('lr_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); lrWall('lr_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);

  [-5,-2,1,4].forEach(bx=>{ const b=BABYLON.MeshBuilder.CreateBox('lr_beam'+bx,{width:0.3,height:0.28,depth:D},scene); b.position.set(bx,H-0.16,0); const bm=mat('lr_bm'+bx); bm.diffuseColor=new BABYLON.Color3(0.16,0.08,0.04); b.material=bm; });

  // Large arched window (back wall) — moonlight
  const winM=mat('lr_winM'); winM.diffuseColor=new BABYLON.Color3(0.06,0.10,0.18); winM.emissiveColor=new BABYLON.Color3(0.08,0.14,0.24); winM.alpha=0.82;
  const winGlass=BABYLON.MeshBuilder.CreatePlane('lr_winGlass',{width:3.2,height:3.0},scene);
  winGlass.position.set(0,2.4,-D/2+0.08); winGlass.material=winM;
  const archM=mat('lr_archM'); archM.diffuseColor=new BABYLON.Color3(0.2,0.26,0.32);
  for(let a=0;a<8;a++){ const ang=(a/7)*Math.PI; const ax=Math.cos(ang)*1.5; const ay=3.9+Math.sin(ang)*0.5; const b=BABYLON.MeshBuilder.CreateBox('lr_archB'+a,{width:0.3,height:0.4,depth:0.3},scene); b.position.set(ax,ay,-D/2+0.1); b.material=archM; }
  [[0,2.4],[-0.8,2.4],[0.8,2.4]].forEach(([mx])=>{ const m=BABYLON.MeshBuilder.CreateBox('lr_mull'+mx,{width:0.04,height:3.0,depth:0.06},scene); m.position.set(mx,2.4,-D/2+0.1); m.material=archM; });

  // Fireplace (right wall)
  const fpX=W/2-0.15, fpZ=0;
  const fpM=pbr('lr_fpM',TEX.rock_d,TEX.rock_n,2,2,new BABYLON.Color3(0.3,0.36,0.4));
  [[fpZ-0.9],[fpZ+0.9]].forEach(([pz])=>{ const s=BABYLON.MeshBuilder.CreateBox('lr_fpSide',{width:0.28,height:2.6,depth:0.5},scene); s.position.set(fpX-0.14,1.3,pz); s.material=fpM; });
  const mantel=BABYLON.MeshBuilder.CreateBox('lr_mantel',{width:0.4,height:0.1,depth:2.2},scene); mantel.position.set(fpX-0.2,2.7,fpZ); mantel.material=woodM;
  const fbm=mat('lr_fbM'); fbm.diffuseColor=new BABYLON.Color3(0.04,0.02,0.01); fbm.emissiveColor=new BABYLON.Color3(0.02,0.01,0);
  const fb=BABYLON.MeshBuilder.CreateBox('lr_firebox',{width:0.1,height:1.2,depth:1.6},scene); fb.position.set(fpX,0.7,fpZ); fb.material=fbm;
  const emberM=mat('lr_emberM'); emberM.emissiveColor=new BABYLON.Color3(0.6,0.18,0.02);
  const embers=BABYLON.MeshBuilder.CreateBox('lr_embers',{width:0.05,height:0.03,depth:1.4},scene); embers.position.set(fpX-0.01,0.03,fpZ); embers.material=emberM;

  // Leather couch (left side)
  const couchM=mat('lr_couchM'); couchM.diffuseColor=new BABYLON.Color3(0.2,0.1,0.08); couchM.specularPower=8;
  const couchBase=BABYLON.MeshBuilder.CreateBox('lr_couch',{width:3.0,height:0.5,depth:1.2},scene); couchBase.position.set(-W/2+2.5,0.5,1); couchBase.material=couchM;
  const couchBack=BABYLON.MeshBuilder.CreateBox('lr_couchBack',{width:3.0,height:0.9,depth:0.2},scene); couchBack.position.set(-W/2+2.5,1.1,1-0.5); couchBack.material=couchM;

  // Round table (center)
  const tabletop=BABYLON.MeshBuilder.CreateCylinder('lr_table',{diameter:1.0,height:0.06,tessellation:16},scene); tabletop.position.set(0,0.75,0); tabletop.material=woodM;
  const tableleg=BABYLON.MeshBuilder.CreateCylinder('lr_tleg',{diameter:0.08,height:0.72,tessellation:8},scene); tableleg.position.set(0,0.36,0); tableleg.material=woodM;

  // Crystal ball (glowing)
  const cbM=mat('lr_cbM'); cbM.diffuseColor=new BABYLON.Color3(0.08,0.12,0.2); cbM.emissiveColor=new BABYLON.Color3(0.06,0.1,0.18); cbM.specularColor=new BABYLON.Color3(0.3,0.4,0.6); cbM.specularPower=64; cbM.alpha=0.7;
  const crystalBall=BABYLON.MeshBuilder.CreateSphere('lr_crystalBall',{diameter:0.45,segments:16},scene);
  crystalBall.position.set(-W/2+3.5,0.25,-2); crystalBall.material=cbM;

  // Pentacle inlay
  const pentM=mat('lr_pentM'); pentM.diffuseColor=new BABYLON.Color3(0.15,0.1,0.05); pentM.emissiveColor=new BABYLON.Color3(0.04,0.02,0.01);
  const pent=BABYLON.MeshBuilder.CreateDisc('lr_pent',{diameter:2.5,tessellation:5},scene); pent.position.set(0,0.02,0); pent.rotation.x=Math.PI/2; pent.material=pentM;

  // Bookshelf with specimen jars
  const bsX=4, bsZ=-D/2+0.15;
  const bsBack=BABYLON.MeshBuilder.CreateBox('lr_bsBack',{width:3.0,height:3.5,depth:0.3},scene); bsBack.position.set(bsX,1.75,bsZ); bsBack.material=woodM;
  for(let sh=0;sh<4;sh++){ const shelf=BABYLON.MeshBuilder.CreateBox('lr_bs'+sh,{width:2.8,height:0.06,depth:0.4},scene); shelf.position.set(bsX,0.4+sh*0.85,bsZ+0.05); shelf.material=woodM;
    for(let j=0;j<4;j++){ const jar=BABYLON.MeshBuilder.CreateCylinder('lr_jar'+sh+'_'+j,{diameterTop:0.08,diameterBottom:0.1,height:0.25,tessellation:10},scene); jar.position.set(bsX-1.0+j*0.65,0.55+sh*0.85,bsZ+0.1); const jm=mat('lr_jm'+sh+j); jm.diffuseColor=new BABYLON.Color3(0.3+Math.random()*0.3,0.2+Math.random()*0.2,0.1+Math.random()*0.1); jm.alpha=0.6; jar.material=jm; }
  }

  // Chandelier with dried herbs
  const chanY=H-0.5;
  const chanRing=BABYLON.MeshBuilder.CreateTorus('lr_chanRing',{diameter:1.5,thickness:0.04,tessellation:16},scene); chanRing.position.set(0,chanY,0); chanRing.material=mat('lr_chanM'); chanRing.material.diffuseColor=new BABYLON.Color3(0.12,0.1,0.08);
  for(let h=0;h<8;h++){ const ang=h/8*Math.PI*2; const hx=Math.cos(ang)*0.7, hz=Math.sin(ang)*0.7;
    const herb=BABYLON.MeshBuilder.CreateCylinder('lr_chanHerb'+h,{diameterTop:0.03,diameterBottom:0.08,height:0.3,tessellation:6},scene); herb.position.set(hx,chanY-0.2,hz); const hm=mat('lr_hm'+h); hm.diffuseColor=new BABYLON.Color3(0.25,0.3,0.12); herb.material=hm;
    const fl=BABYLON.MeshBuilder.CreateSphere('lr_cf'+h,{diameter:0.05,segments:6},scene); fl.position.set(hx,chanY+0.05,hz); fl.scaling.y=1.6; fl.material=emitM('lr_cfm'+h,1,0.62,0.12,1.0);
  }

  // Raven on windowsill
  const ravenM=mat('lr_ravenM'); ravenM.diffuseColor=new BABYLON.Color3(0.02,0.02,0.03);
  const ravenBody=BABYLON.MeshBuilder.CreateSphere('lr_raven',{diameter:0.25,segments:8},scene); ravenBody.position.set(1.2,1.0,-D/2+0.3); ravenBody.scaling.set(1.3,0.8,1); ravenBody.material=ravenM;
  const ravenHead=BABYLON.MeshBuilder.CreateSphere('lr_ravenHead',{diameter:0.1,segments:6},scene); ravenHead.position.set(1.35,1.12,-D/2+0.3); ravenHead.material=ravenM;

  // Lights
  const moonLight=new BABYLON.PointLight('lr_moonL',new BABYLON.Vector3(0,3,-D/2+1),scene);
  moonLight.diffuse=new BABYLON.Color3(0.25,0.35,0.55); moonLight.intensity=2.0; moonLight.range=20;
  const fireLight=new BABYLON.PointLight('lr_fireL',new BABYLON.Vector3(fpX-0.5,0.8,fpZ),scene);
  fireLight.diffuse=new BABYLON.Color3(1.0,0.5,0.15); fireLight.intensity=2.5; fireLight.range=14;
  const cbLight=new BABYLON.PointLight('lr_cbL',new BABYLON.Vector3(-W/2+3.5,0.4,-2),scene);
  cbLight.diffuse=new BABYLON.Color3(0.1,0.2,0.5); cbLight.intensity=0.6; cbLight.range=5;
  const ambient=new BABYLON.HemisphericLight('lr_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.5; ambient.diffuse=new BABYLON.Color3(0.35,0.4,0.55); ambient.groundColor=new BABYLON.Color3(0.15,0.08,0.06);
  const chanLight=new BABYLON.PointLight('lr_chanL',new BABYLON.Vector3(0,chanY-0.5,0),scene);
  chanLight.diffuse=new BABYLON.Color3(0.6,0.5,0.3); chanLight.intensity=1.0; chanLight.range=12;

  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    fireLight.intensity=flk(2.5,0.5,3.7,1.2);
    chanLight.intensity=flk(1.0,0.15,2.1,0);
    if(embers) embers.material.emissiveColor=new BABYLON.Color3(flk(0.6,0.15,3.7,0.5),flk(0.18,0.06,3.7,1.0),0.02);
    if(crystalBall) crystalBall.material.emissiveColor=new BABYLON.Color3(0.04,flk(0.1,0.04,1.5,2),flk(0.18,0.06,1.5,3));
  });

  interactables.set('lr_crystalBall','crystalball');
  interactables.set('lr_raven','raven'); interactables.set('lr_ravenHead','raven');
  interactables.set('lr_table','tea');
  interactables.set('lr_bsBack','bookshelf');
  interactables.set('lr_embers','fireplace'); interactables.set('lr_firebox','fireplace'); interactables.set('lr_mantel','fireplace');

  const doorE=BABYLON.MeshBuilder.CreateBox('door_entrance',{width:1.4,height:2.4,depth:0.1},scene); doorE.position.set(0,1.2,D/2-0.05); const deM=mat('lr_deM'); deM.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorE.material=deM;
  interactables.set('door_entrance','door_entrance');
  const doorK=BABYLON.MeshBuilder.CreateBox('door_kitchen',{width:0.1,height:2.4,depth:1.4},scene); doorK.position.set(W/2-0.05,1.2,-3); const dkM=mat('lr_dkM'); dkM.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorK.material=dkM;
  interactables.set('door_kitchen','door_kitchen');
}

// ─── KITCHEN ──────────────────────────────────────────────────────────────────
