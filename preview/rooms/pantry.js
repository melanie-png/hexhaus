function buildPantry(){
  const W=10, D=8, H=3.8;
  const wallM = pbr('p_wallM', TEX.mstone_d, TEX.mstone_n, 2, 2, new BABYLON.Color3(0.22,0.25,0.27));
  const floorM = pbr('p_floorM', TEX.stone_d, TEX.stone_n, 3, 2, new BABYLON.Color3(0.18,0.2,0.22));
  const woodM = pbr('p_woodM', TEX.darkwood_d, TEX.darkwood_n, 2, 2, new BABYLON.Color3(0.28,0.2,0.1));

  const floor=BABYLON.MeshBuilder.CreateGround('p_floor',{width:W,height:D,subdivisions:3},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceilM=mat('p_ceilM'); ceilM.diffuseColor=new BABYLON.Color3(0.1,0.08,0.06); const ceil=BABYLON.MeshBuilder.CreatePlane('p_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function pWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  pWall('p_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); pWall('p_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  pWall('p_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); pWall('p_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);

  // Specimen jar grid
  for(let row=0;row<3;row++){ for(let col=0;col<6;col++){ const jx=-W/2+1+col*1.5; const jy=1.0+row*0.8;
    const jar=BABYLON.MeshBuilder.CreateCylinder('p_jar'+row+col,{diameterTop:0.12,diameterBottom:0.15,height:0.5,tessellation:10},scene); jar.position.set(jx,jy+0.25,-D/2+0.3); const jm=mat('p_jm'+row+col);
    const cols=[[0.2,0.3,0.15],[0.3,0.2,0.1],[0.15,0.25,0.3],[0.25,0.15,0.1]]; const c=cols[(row*6+col)%4]; jm.diffuseColor=new BABYLON.Color3(c[0],c[1],c[2]); jm.alpha=0.65; jar.material=jm;
    const lid=BABYLON.MeshBuilder.CreateCylinder('p_lid'+row+col,{diameter:0.14,height:0.05,tessellation:10},scene); lid.position.set(jx,jy+0.55,-D/2+0.3); lid.material=woodM;
  }}
  for(let row=0;row<3;row++){ const shelf=BABYLON.MeshBuilder.CreateBox('p_shelf'+row,{width:W-1,height:0.04,depth:0.3},scene); shelf.position.set(0,0.95+row*0.8,-D/2+0.3); shelf.material=woodM; }

  // Leaded window
  const winM=mat('p_winM'); winM.diffuseColor=new BABYLON.Color3(0.06,0.1,0.18); winM.emissiveColor=new BABYLON.Color3(0.06,0.12,0.2); winM.alpha=0.82;
  const win=BABYLON.MeshBuilder.CreatePlane('p_win',{width:1.5,height:2.0},scene); win.position.set(-W/2+0.08,2.0,0); win.rotation.y=Math.PI/2; win.material=winM;

  // Storage chest
  const chest=BABYLON.MeshBuilder.CreateBox('p_chest',{width:2.5,height:1.0,depth:0.8},scene); chest.position.set(W/2-2,0.5,1); chest.material=woodM;

  // Burlap sacks
  [[0,1],[0.6,1.5]].forEach(([sx,sz])=>{ const s=BABYLON.MeshBuilder.CreateSphere('p_sack',{diameter:0.4,segments:8},scene); s.position.set(sx,0.25,sz); s.scaling.set(1,1.2,1); const sm=mat('p_sackM'); sm.diffuseColor=new BABYLON.Color3(0.28,0.24,0.16); s.material=sm; });

  // Wicker baskets
  [[-3,2],[-3,-1],[3,-2]].forEach(([bx,bz])=>{ const b=BABYLON.MeshBuilder.CreateCylinder('p_basket',{diameter:0.4,height:0.35,tessellation:10},scene); b.position.set(bx,0.18,bz); const bm=mat('p_basketM'); bm.diffuseColor=new BABYLON.Color3(0.35,0.28,0.15); b.material=bm; });

  // Green glow
  const glowM=emitM('p_glowM',0.1,0.5,0.2,0.4); glowM.alpha=0.5;
  const glow=BABYLON.MeshBuilder.CreateSphere('p_glow',{diameter:0.15,segments:8},scene); glow.position.set(W/2-2,1.15,0.8); glow.material=glowM;

  // Lights
  const ambient=new BABYLON.HemisphericLight('p_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.3; ambient.diffuse=new BABYLON.Color3(0.25,0.3,0.35); ambient.groundColor=new BABYLON.Color3(0.1,0.08,0.05);
  const winLight=new BABYLON.PointLight('p_wL',new BABYLON.Vector3(-W/2+1,2,0),scene);
  winLight.diffuse=new BABYLON.Color3(0.2,0.3,0.5); winLight.intensity=0.8; winLight.range=10;
  const glowLight=new BABYLON.PointLight('p_gL',new BABYLON.Vector3(W/2-2,1.2,0.8),scene);
  glowLight.diffuse=new BABYLON.Color3(0.1,0.5,0.2); glowLight.intensity=0.6; glowLight.range=5;

  let ft=0;
  scene.registerBeforeRender(()=>{ ft+=engine.getDeltaTime()*0.001; glowLight.intensity=0.4+Math.sin(ft*1.5)*0.15; if(glow) glow.material.emissiveColor=new BABYLON.Color3(0.05,0.3+Math.sin(ft*1.5)*0.1,0.1); });

  interactables.set('p_jar00','jars'); interactables.set('p_jar11','jars');
  interactables.set('p_glow','crystalball');

  const doorK=BABYLON.MeshBuilder.CreateBox('door_kitchen',{width:1.2,height:2.2,depth:0.1},scene); doorK.position.set(0,1.1,D/2-0.05); const dkM=mat('p_dkM'); dkM.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorK.material=dkM;
  interactables.set('door_kitchen','door_kitchen');
  const doorBs=BABYLON.MeshBuilder.CreateBox('door_basement',{width:1.0,height:2.0,depth:0.1},scene); doorBs.position.set(W/2-0.5,1.0,-D/2+0.05); const dbM=mat('p_dbM'); dbM.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorBs.material=dbM;
  // iron keyhole plate — the crescent-moon lock the iron key answers
  const kp=BABYLON.MeshBuilder.CreateBox('p_keyplate',{width:0.1,height:0.16,depth:0.012},scene); kp.position.set(W/2-0.5,1.15,-D/2+0.11); const kpm=mat('p_kpM'); kpm.diffuseColor=new BABYLON.Color3(0.32,0.26,0.12); kpm.specularColor=new BABYLON.Color3(0.5,0.45,0.25); kpm.specularPower=48; kp.material=kpm;
  const kh=BABYLON.MeshBuilder.CreateCylinder('p_keyhole',{diameter:0.045,height:0.012,tessellation:10},scene); kh.position.set(W/2-0.5,1.15,-D/2+0.115); kh.rotation.x=Math.PI/2; const khm=mat('p_khM'); khm.diffuseColor=new BABYLON.Color3(0.01,0.01,0.01); khm.emissiveColor=new BABYLON.Color3(0.02,0.015,0.0); kh.material=khm;
  interactables.set('door_basement','door_basement');
}

// ─── BASEMENT ──────────────────────────────────────────────────────────────────
