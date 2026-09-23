function buildBathroom(){
  const W=6, D=5, H=3.5;
  const wallM = pbr('b_wallM', TEX.plaster_d, TEX.plaster_n, 2, 2, new BABYLON.Color3(0.20,0.22,0.24));
  const floorM = pbr('b_floorM', TEX.stone_d, TEX.stone_n, 3, 2, new BABYLON.Color3(0.15,0.18,0.20));
  const ceilM = mat('b_ceilM'); ceilM.diffuseColor=new BABYLON.Color3(0.1,0.12,0.14);

  const floor=BABYLON.MeshBuilder.CreateGround('b_floor',{width:W,height:D,subdivisions:2},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('b_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function bWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  bWall('b_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); bWall('b_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  bWall('b_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); bWall('b_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);

  // Bathtub
  const tubM=mat('b_tubM'); tubM.diffuseColor=new BABYLON.Color3(0.5,0.48,0.42);
  const tub=BABYLON.MeshBuilder.CreateBox('b_tub',{width:1.6,height:0.7,depth:0.8},scene); tub.position.set(0,0.35,-D/2+1.2); tub.material=tubM;
  const waterM=mat('b_waterM'); waterM.diffuseColor=new BABYLON.Color3(0.08,0.1,0.06); waterM.alpha=0.6;
  const water=BABYLON.MeshBuilder.CreateBox('b_water',{width:1.4,height:0.02,depth:0.6},scene); water.position.set(0,0.65,-D/2+1.2); water.material=waterM;

  // Sink + cracked mirror
  const sink=BABYLON.MeshBuilder.CreateBox('b_sink',{width:0.6,height:0.4,depth:0.4},scene); sink.position.set(W/2-0.5,0.8,-D/2+2.5); sink.material=tubM;
  const mirM=mat('b_mirM'); mirM.diffuseColor=new BABYLON.Color3(0.08,0.08,0.1); mirM.emissiveColor=new BABYLON.Color3(0.01,0.01,0.02);
  const mirror=BABYLON.MeshBuilder.CreatePlane('b_mirror',{width:0.5,height:0.7},scene); mirror.position.set(W/2-0.5,1.3,-D/2+2.5+0.21); mirror.material=mirM;

  // Spider webs
  const webM=mat('b_webM'); webM.diffuseColor=new BABYLON.Color3(0.35,0.32,0.28); webM.alpha=0.2;
  [[-W/2+0.1,0,0],[W/2-0.1,0,Math.PI/2],[-W/2+0.1,0,-Math.PI/2],[W/2-0.1,0,Math.PI]].forEach(([cx,cz,ry],i)=>{
    const web=BABYLON.MeshBuilder.CreatePlane('b_web'+i,{width:2.0,height:1.8},scene); web.position.set(cx,H-0.8,cz); web.rotation.y=ry; web.material=webM.clone('b_wm'+i);
  });

  // Giant spider
  const spiderM=mat('b_spiderM'); spiderM.diffuseColor=new BABYLON.Color3(0.05,0.04,0.03);
  const spiderBody=BABYLON.MeshBuilder.CreateSphere('b_spider',{diameter:0.15,segments:8},scene); spiderBody.position.set(-W/2+0.3,H-0.8,-D/2+0.3); spiderBody.scaling.set(1,0.6,1); spiderBody.material=spiderM;
  for(let l=0;l<8;l++){ const ang=l/8*Math.PI*2; const leg=BABYLON.MeshBuilder.CreateCylinder('b_leg'+l,{diameterTop:0.01,diameterBottom:0.02,height:0.4,tessellation:4},scene); leg.position.set(-W/2+0.3+Math.cos(ang)*0.15,H-0.8,-D/2+0.3+Math.sin(ang)*0.15); leg.rotation.x=Math.sin(ang)*0.5; leg.rotation.z=Math.cos(ang)*0.5; leg.material=spiderM; }

  // Dim lights
  const ambient=new BABYLON.HemisphericLight('b_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.25; ambient.diffuse=new BABYLON.Color3(0.2,0.25,0.3); ambient.groundColor=new BABYLON.Color3(0.08,0.06,0.05);
  const dimLight=new BABYLON.PointLight('b_dim',new BABYLON.Vector3(W/2-1,2,-D/2+2),scene);
  dimLight.diffuse=new BABYLON.Color3(0.15,0.15,0.18); dimLight.intensity=0.5; dimLight.range=8;

  interactables.set('b_spider','spider'); interactables.set('b_leg0','spider');
  interactables.set('b_mirror','mirror');

  const doorE=BABYLON.MeshBuilder.CreateBox('door_entrance',{width:1.0,height:2.2,depth:0.1},scene); doorE.position.set(0,1.1,D/2-0.05); const deM=mat('b_deM'); deM.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorE.material=deM;
  interactables.set('door_entrance','door_entrance');
}

// ─── PANTRY ────────────────────────────────────────────────────────────────────
