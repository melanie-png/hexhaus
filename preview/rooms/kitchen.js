function buildKitchen(){
  const W=14, D=12, H=4.0;
  const wallM = pbr('k_wallM', TEX.mstone_d, TEX.mstone_n, 2, 2, new BABYLON.Color3(0.25,0.28,0.30));
  const floorM = pbr('k_floorM', TEX.stone_d, TEX.stone_n, 4, 3, new BABYLON.Color3(0.22,0.24,0.26));
  const ceilM = pbr('k_ceilM', TEX.beam_d, TEX.beam_n, 3, 3, new BABYLON.Color3(0.14,0.09,0.05));
  const woodM = pbr('k_woodM', TEX.darkwood_d, TEX.darkwood_n, 3, 2, new BABYLON.Color3(0.3,0.22,0.12));

  const floor=BABYLON.MeshBuilder.CreateGround('k_floor',{width:W,height:D,subdivisions:4},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('k_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function kWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  kWall('k_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); kWall('k_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  kWall('k_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); kWall('k_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
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
  [[-3,-3],[3,-3],[-3,3],[3,3]].forEach(([gx,gz],gi)=>{ const g=BABYLON.MeshBuilder.CreateCylinder('k_garlic'+gi,{diameterTop:0.04,diameterBottom:0.15,height:0.4,tessellation:8},scene); g.position.set(gx,H-0.4,gz); const gm=mat('k_gm'+gi); gm.diffuseColor=new BABYLON.Color3(0.28,0.24,0.16); g.material=gm; });

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

  const doorE=BABYLON.MeshBuilder.CreateBox('door_entrance',{width:1.4,height:2.4,depth:0.1},scene); doorE.position.set(0,1.2,D/2-0.05); const deM=mat('k_deM'); deM.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorE.material=deM;
  interactables.set('door_entrance','door_entrance');
  const doorP=BABYLON.MeshBuilder.CreateBox('door_pantry',{width:1.2,height:2.4,depth:0.1},scene); doorP.position.set(-W/2+3,1.2,-D/2+0.05); const dpM=mat('k_dpM'); dpM.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorP.material=dpM;
  interactables.set('door_pantry','door_pantry');
}

// ─── LIBRARY ──────────────────────────────────────────────────────────────────
