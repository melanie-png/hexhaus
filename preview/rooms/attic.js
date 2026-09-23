function buildAttic(){
  const W=10, D=8, H=3.0;
  const wallM = pbr('a_wallM', TEX.beam_d, TEX.beam_n, 2, 2, new BABYLON.Color3(0.12,0.08,0.05));
  const floorM = pbr('a_floorM', TEX.wood_d, TEX.wood_n, 3, 2, new BABYLON.Color3(0.12,0.08,0.04));
  const ceilM = pbr('a_ceilM', TEX.beam_d, TEX.beam_n, 2, 2, new BABYLON.Color3(0.08,0.05,0.03));

  const floor=BABYLON.MeshBuilder.CreateGround('a_floor',{width:W,height:D,subdivisions:3},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('a_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function aWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  aWall('a_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); aWall('a_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  aWall('a_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); aWall('a_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
  [-3,-1,1,3].forEach(bx=>{ const b=BABYLON.MeshBuilder.CreateBox('a_rafter'+bx,{width:0.2,height:0.2,depth:D},scene); b.position.set(bx,H-0.12,0); const bm=mat('a_bm'+bx); bm.diffuseColor=new BABYLON.Color3(0.1,0.06,0.03); b.material=bm; });

  // Storage boxes
  [[-3,-2,0.8],[3,-2,0.6],[-2,2,0.7],[2,2,0.5],[0,0,0.9]].forEach(([bx,bz,h])=>{ const box=BABYLON.MeshBuilder.CreateBox('a_box',{width:h*1.2,height:h,depth:h*0.9},scene); box.position.set(bx,h/2,bz); const bm=mat('a_boxM'); bm.diffuseColor=new BABYLON.Color3(0.15+Math.random()*0.1,0.1+Math.random()*0.05,0.05); box.material=bm; });

  // Locked trunk
  const trunkM=pbr('a_trunkM',TEX.darkwood_d,TEX.darkwood_n,2,1,new BABYLON.Color3(0.2,0.14,0.08));
  const trunk=BABYLON.MeshBuilder.CreateBox('a_trunk',{width:1.2,height:0.7,depth:0.6},scene); trunk.position.set(-3,0.35,-2.5); trunk.material=trunkM;

  // Broom
  const broomM=mat('a_broomM'); broomM.diffuseColor=new BABYLON.Color3(0.2,0.14,0.06);
  const broomHandle=BABYLON.MeshBuilder.CreateCylinder('a_broomHandle',{diameterTop:0.03,diameterBottom:0.04,height:1.8,tessellation:8},scene); broomHandle.position.set(W/2-0.4,0.9,2); broomHandle.rotation.z=0.15; broomHandle.material=broomM;
  const broomStraw=BABYLON.MeshBuilder.CreateCylinder('a_broomStraw',{diameterTop:0.04,diameterBottom:0.12,height:0.35,tessellation:8},scene); broomStraw.position.set(W/2-0.55,0.2,2); broomStraw.rotation.z=0.15; broomStraw.material=broomM;

  // Cobwebs
  for(let i=0;i<4;i++){ const web=BABYLON.MeshBuilder.CreatePlane('a_web'+i,{width:1.5,height:1.0},scene); const angles=[0,Math.PI/2,-Math.PI/2,Math.PI]; web.position.set(Math.cos(i*1.57)*(W/2-0.1),H-0.4,Math.sin(i*1.57)*(D/2-0.1)); web.rotation.y=angles[i]; const wm=mat('a_wm'+i); wm.diffuseColor=new BABYLON.Color3(0.2,0.18,0.15); wm.alpha=0.15; web.material=wm; }

  // Dim flickering bulb
  const bulbM=emitM('a_bulbM',0.6,0.5,0.3,0.5);
  const bulb=BABYLON.MeshBuilder.CreateSphere('a_bulb',{diameter:0.1,segments:8},scene); bulb.position.set(0,H-0.3,0); bulb.material=bulbM;
  const bulbLight=new BABYLON.PointLight('a_bL',new BABYLON.Vector3(0,H-0.4,0),scene);
  bulbLight.diffuse=new BABYLON.Color3(0.4,0.35,0.2); bulbLight.intensity=0.8; bulbLight.range=10;
  const ambient=new BABYLON.HemisphericLight('a_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.15; ambient.diffuse=new BABYLON.Color3(0.15,0.12,0.1); ambient.groundColor=new BABYLON.Color3(0.05,0.03,0.02);

  let ft=0;
  scene.registerBeforeRender(()=>{ ft+=engine.getDeltaTime()*0.001; bulbLight.intensity=0.5+Math.sin(ft*8)*0.2+Math.random()*0.1; if(Math.random()<0.005) bulbLight.intensity=0.05; });

  interactables.set('a_trunk','attic_box'); interactables.set('a_box','attic_box');
  interactables.set('a_broomHandle','broom');

  const doorL=BABYLON.MeshBuilder.CreateBox('door_library',{width:1.0,height:2.0,depth:0.1},scene); doorL.position.set(0,1.0,D/2-0.05); const dlM=mat('a_dlM'); dlM.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorL.material=dlM;
  interactables.set('door_library','door_library');
}
