function buildLibrary(){
  const W=16, D=14, H=5.0;
  const wallM = pbr('lib_wallM', TEX.plaster_d, TEX.plaster_n, 3, 2, new BABYLON.Color3(0.26,0.22,0.28));
  const floorM = pbr('lib_floorM', TEX.wood_d, TEX.wood_n, 4, 4, new BABYLON.Color3(0.3,0.22,0.14));
  const ceilM = pbr('lib_ceilM', TEX.beam_d, TEX.beam_n, 4, 3, new BABYLON.Color3(0.14,0.09,0.05));
  const woodM = pbr('lib_woodM', TEX.darkwood_d, TEX.darkwood_n, 3, 2, new BABYLON.Color3(0.28,0.2,0.1));

  const floor=BABYLON.MeshBuilder.CreateGround('lib_floor',{width:W,height:D,subdivisions:4},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('lib_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function libWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  libWall('lib_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); libWall('lib_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  libWall('lib_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); libWall('lib_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
  [-6,-3,0,3,6].forEach(bx=>{ const b=BABYLON.MeshBuilder.CreateBox('lib_beam'+bx,{width:0.3,height:0.28,depth:D},scene); b.position.set(bx,H-0.16,0); const bm=mat('lib_bm'+bx); bm.diffuseColor=new BABYLON.Color3(0.16,0.08,0.04); b.material=bm; });

  // Display cases with skulls
  for(let dc=0;dc<5;dc++){ const dx=-5+dc*2.5;
    const caseBox=BABYLON.MeshBuilder.CreateBox('lib_dc'+dc,{width:1.0,height:2.0,depth:0.5},scene); caseBox.position.set(dx,1.0,-D/2+0.3); caseBox.material=woodM;
    const glassM=mat('lib_glassM'); glassM.diffuseColor=new BABYLON.Color3(0.05,0.08,0.1); glassM.alpha=0.3;
    const glass=BABYLON.MeshBuilder.CreatePlane('lib_dg'+dc,{width:0.9,height:1.9},scene); glass.position.set(dx,1.0,-D/2+0.55); glass.material=glassM;
    const skullM=mat('lib_skullM'); skullM.diffuseColor=new BABYLON.Color3(0.6,0.55,0.45);
    const skull=BABYLON.MeshBuilder.CreateSphere('lib_skull'+dc,{diameter:0.2,segments:8},scene); skull.position.set(dx,1.0,-D/2+0.3); skull.scaling.y=1.2; skull.material=skullM;
  }

  // Diagonal staircase
  const STS=10, SY=H*0.5/STS, SZ=0.35, SX=2.5;
  const soX=-W/2+3, soZ=D/2-1;
  for(let s=0;s<STS;s++){ const tread=BABYLON.MeshBuilder.CreateBox('lib_tread'+s,{width:SX,height:0.05,depth:SZ},scene); tread.position.set(soX+s*0.4,s*SY+0.05,soZ-s*SZ); tread.material=woodM;
    const riser=BABYLON.MeshBuilder.CreateBox('lib_riser'+s,{width:SX,height:SY,depth:0.03},scene); riser.position.set(soX+s*0.4,s*SY+SY/2,soZ-s*SZ+SZ/2); riser.material=woodM; }

  // Leather wingback chair
  const chairM=mat('lib_chairM'); chairM.diffuseColor=new BABYLON.Color3(0.15,0.08,0.06); chairM.specularPower=8;
  const chairBase=BABYLON.MeshBuilder.CreateBox('lib_chair',{width:0.8,height:0.45,depth:0.8},scene); chairBase.position.set(W/2-2,0.45,-2); chairBase.material=chairM;
  const chairBack=BABYLON.MeshBuilder.CreateBox('lib_chairBack',{width:0.8,height:1.0,depth:0.15},scene); chairBack.position.set(W/2-2,1.0,-2-0.35); chairBack.material=chairM;

  // Red rug
  const rugM=mat('lib_rugM'); rugM.diffuseColor=new BABYLON.Color3(0.32,0.06,0.04);
  const rug=BABYLON.MeshBuilder.CreateGround('lib_rug',{width:3.5,height:4.5,subdivisions:2},scene); rug.position.set(W/2-2,0.01,-1.5); rug.material=rugM;

  // Owl with glowing eyes
  const owlM=mat('lib_owlM'); owlM.diffuseColor=new BABYLON.Color3(0.3,0.25,0.15);
  const owlBody=BABYLON.MeshBuilder.CreateSphere('lib_owl',{diameter:0.25,segments:8},scene); owlBody.position.set(-W/2+0.5,3.5,2); owlBody.scaling.set(0.8,1.2,0.8); owlBody.material=owlM;
  const owlHead=BABYLON.MeshBuilder.CreateSphere('lib_owlH',{diameter:0.15,segments:8},scene); owlHead.position.set(-W/2+0.5,3.75,2); owlHead.material=owlM;
  [[-0.04],[0.04]].forEach(([ex])=>{ const e=BABYLON.MeshBuilder.CreateSphere('lib_owlE',{diameter:0.04,segments:6},scene); e.position.set(-W/2+0.5+ex,3.78,2+0.06); e.material=emitM('lib_owlEm',0.8,0.75,0.3,0.7); });

  // Broom on wall
  const broomM=mat('lib_broomM'); broomM.diffuseColor=new BABYLON.Color3(0.2,0.14,0.06);
  const broomHandle=BABYLON.MeshBuilder.CreateCylinder('lib_broomHandle',{diameterTop:0.03,diameterBottom:0.04,height:2.0,tessellation:8},scene); broomHandle.position.set(W/2-0.3,2.5,-4); broomHandle.rotation.z=Math.PI/2+0.3; broomHandle.material=broomM;
  const broomStraw=BABYLON.MeshBuilder.CreateCylinder('lib_broomStraw',{diameterTop:0.04,diameterBottom:0.12,height:0.4,tessellation:8},scene); broomStraw.position.set(W/2-0.7,2.3,-4); broomStraw.rotation.z=Math.PI/2+0.3; broomStraw.material=broomM;

  // Locked cage
  const cageM=mat('lib_cageM'); cageM.diffuseColor=new BABYLON.Color3(0.12,0.1,0.08);
  const cage=BABYLON.MeshBuilder.CreateBox('lib_cage',{width:0.8,height:1.2,depth:0.4},scene); cage.position.set(3,2.5,D/2-0.25); cage.material=cageM;

  // Floating magic wisps
  const wisps=[];
  for(let w=0;w<5;w++){ const wp=BABYLON.MeshBuilder.CreateSphere('lib_wisp'+w,{diameter:0.15,segments:6},scene); wp.position.set((Math.random()-0.5)*W*0.6, 2+Math.random()*2, (Math.random()-0.5)*D*0.6); wp.material=emitM('lib_wm'+w,0.3,0.8,0.5,0.5); wp.material.alpha=0.4; wisps.push(wp); }

  // Lights
  const ambient=new BABYLON.HemisphericLight('lib_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.4; ambient.diffuse=new BABYLON.Color3(0.3,0.38,0.48); ambient.groundColor=new BABYLON.Color3(0.12,0.06,0.05);
  const winLight=new BABYLON.PointLight('lib_wL',new BABYLON.Vector3(0,3,-D/2+1),scene);
  winLight.diffuse=new BABYLON.Color3(0.25,0.35,0.55); winLight.intensity=1.5; winLight.range=20;
  const candleLight=new BABYLON.PointLight('lib_cL',new BABYLON.Vector3(W/2-2,1.5,-2),scene);
  candleLight.diffuse=new BABYLON.Color3(0.7,0.5,0.2); candleLight.intensity=0.8; candleLight.range=8;

  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    candleLight.intensity=flk(0.8,0.15,2.1,0);
    wisps.forEach((w,i)=>{ w.position.y+=Math.sin(ft*0.5+i*2)*0.003; w.material.emissiveColor=new BABYLON.Color3(flk(0.2,0.1,0.7+i,0),flk(0.5,0.15,0.5+i,1),flk(0.3,0.1,0.6+i,2)); });
  });

  interactables.set('lib_dc0','bookshelf'); interactables.set('lib_dc1','bookshelf');
  interactables.set('lib_owl','portrait'); interactables.set('lib_owlH','portrait');
  interactables.set('lib_cage','clock');
  interactables.set('lib_broomHandle','broom'); interactables.set('lib_broomStraw','broom');

  const doorE=BABYLON.MeshBuilder.CreateBox('door_entrance',{width:1.4,height:2.4,depth:0.1},scene); doorE.position.set(0,1.2,D/2-0.05); const deM=mat('lib_deM'); deM.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorE.material=deM;
  interactables.set('door_entrance','door_entrance');
  const doorA=BABYLON.MeshBuilder.CreateBox('door_attic',{width:1.2,height:2.4,depth:0.1},scene); doorA.position.set(soX+STS*0.2,1.2+STS*SY/2,soZ-STS*SZ+0.2); const daM=mat('lib_daM'); daM.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorA.material=daM;
  interactables.set('door_attic','door_attic');
  const doorBs=BABYLON.MeshBuilder.CreateBox('door_basement',{width:0.1,height:2.0,depth:1.0},scene); doorBs.position.set(-W/2+0.05,1.0,-D/2+3); const dbm2=mat('lib_dbm'); dbm2.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorBs.material=dbm2;
  interactables.set('door_basement','door_basement');
}

// ─── BATHROOM ──────────────────────────────────────────────────────────────────
