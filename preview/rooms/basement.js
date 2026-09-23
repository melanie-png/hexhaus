function buildBasement(){
  const W=14, D=12, H=4.0;
  const wallM = pbr('bs_wallM', TEX.rock_d, TEX.rock_n, 3, 2, new BABYLON.Color3(0.15,0.12,0.14));
  const floorM = pbr('bs_floorM', TEX.wood_d, TEX.wood_n, 4, 3, new BABYLON.Color3(0.15,0.1,0.06));
  const ceilM = pbr('bs_ceilM', TEX.stone_d, TEX.stone_n, 3, 2, new BABYLON.Color3(0.1,0.08,0.1));

  const floor=BABYLON.MeshBuilder.CreateGround('bs_floor',{width:W,height:D,subdivisions:4},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('bs_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function bsWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  bsWall('bs_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); bsWall('bs_wF',W,H,new BABYLON.Vector3(0,H/2,D/2),Math.PI);
  bsWall('bs_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); bsWall('bs_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);

  // Domed leaded window
  const winM=mat('bs_winM'); winM.diffuseColor=new BABYLON.Color3(0.04,0.1,0.06); winM.emissiveColor=new BABYLON.Color3(0.06,0.16,0.08); winM.alpha=0.82;
  const win=BABYLON.MeshBuilder.CreatePlane('bs_win',{width:2.0,height:2.5},scene); win.position.set(0,2.5,-D/2+0.08); win.material=winM;
  const archM=mat('bs_archM'); archM.diffuseColor=new BABYLON.Color3(0.12,0.14,0.12);
  for(let a=0;a<7;a++){ const ang=(a/6)*Math.PI; const ax=Math.cos(ang)*0.9; const ay=3.75+Math.sin(ang)*0.4; const b=BABYLON.MeshBuilder.CreateBox('bs_arch'+a,{width:0.25,height:0.35,depth:0.3},scene); b.position.set(ax,ay,-D/2+0.1); b.material=archM; }

  // Copper alchemy still
  const copperM=mat('bs_copperM'); copperM.diffuseColor=new BABYLON.Color3(0.3,0.15,0.06); copperM.specularColor=new BABYLON.Color3(0.3,0.2,0.1); copperM.specularPower=32;
  const glassM=mat('bs_glassM'); glassM.diffuseColor=new BABYLON.Color3(0.05,0.1,0.06); glassM.emissiveColor=new BABYLON.Color3(0.04,0.15,0.08); glassM.alpha=0.5;
  const flask=BABYLON.MeshBuilder.CreateSphere('bs_flask',{diameter:0.5,segments:12},scene); flask.position.set(-3,0.6,-1); flask.material=glassM;
  const tube=BABYLON.MeshBuilder.CreateCylinder('bs_tube',{diameter:0.05,height:1.5,tessellation:8},scene); tube.position.set(-3,1.3,-1); tube.material=copperM;
  const bulb=BABYLON.MeshBuilder.CreateSphere('bs_bulb',{diameter:0.25,segments:10},scene); bulb.position.set(-3,2.1,-1); bulb.material=glassM;
  const arm=BABYLON.MeshBuilder.CreateCylinder('bs_arm',{diameter:0.04,height:0.8,tessellation:8},scene); arm.position.set(-2.7,2.1,-1); arm.rotation.z=Math.PI/2; arm.material=copperM;
  const cFlask=BABYLON.MeshBuilder.CreateSphere('bs_cflask',{diameter:0.3,segments:10},scene); cFlask.position.set(-2.3,1.8,-1); cFlask.material=glassM;
  const stand=BABYLON.MeshBuilder.CreateCylinder('bs_stand',{diameter:0.3,height:0.4,tessellation:10},scene); stand.position.set(-3,0.2,-1); stand.material=copperM;
  const heatM=emitM('bs_heatM',0.8,0.3,0.05,0.7);
  const heat=BABYLON.MeshBuilder.CreateSphere('bs_heat',{diameter:0.1,segments:6},scene); heat.position.set(-3,0.15,-1); heat.material=heatM;

  // Workbench
  const benchM=pbr('bs_benchM',TEX.darkwood_d,TEX.darkwood_n,2,1,new BABYLON.Color3(0.25,0.18,0.1));
  const bench=BABYLON.MeshBuilder.CreateBox('bs_bench',{width:2.5,height:0.9,depth:1.0},scene); bench.position.set(3,0.45,-3); bench.material=benchM;

  // Pentagram
  const pentM=mat('bs_pentM'); pentM.diffuseColor=new BABYLON.Color3(0.08,0.03,0.03); pentM.emissiveColor=new BABYLON.Color3(0.06,0.01,0.01);
  const pent=BABYLON.MeshBuilder.CreateDisc('bs_pent',{diameter:3.0,tessellation:5},scene); pent.position.set(0,0.02,1); pent.rotation.x=Math.PI/2; pent.material=pentM;
  const lineM=emitM('bs_lineM',0.4,0.05,0.02,0.5);
  for(let i=0;i<5;i++){ const a1=i/5*Math.PI*2-Math.PI/2; const a2=(i+2)/5*Math.PI*2-Math.PI/2; const r=1.3;
    const x1=Math.cos(a1)*r, z1=Math.sin(a1)*r, x2=Math.cos(a2)*r, z2=Math.sin(a2)*r;
    const lx=(x1+x2)/2, lz=(z1+z2)/2; const len=Math.sqrt((x2-x1)**2+(z2-z1)**2); const ang=Math.atan2(z2-z1,x2-x1);
    const line=BABYLON.MeshBuilder.CreateBox('bs_pline'+i,{width:len,height:0.02,depth:0.04},scene); line.position.set(lx,0.03,1+lz); line.rotation.y=-ang; line.material=lineM;
  }

  // Scattered bones
  [[1,2.5],[2,3],[1.5,2],[0.5,3.5]].forEach(([bx,bz])=>{ const bone=BABYLON.MeshBuilder.CreateCylinder('bs_bone',{diameterTop:0.02,diameterBottom:0.03,height:0.2,tessellation:6},scene); bone.position.set(bx,0.02,bz); bone.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI); const bm=mat('bs_boneM'); bm.diffuseColor=new BABYLON.Color3(0.4,0.35,0.25); bone.material=bm; });

  // Crates
  [[-5,-4],[-4.2,-4]].forEach(([cx,cz],ci)=>{ const crate=BABYLON.MeshBuilder.CreateBox('bs_crate'+ci,{width:0.7,height:0.7,depth:0.7},scene); crate.position.set(cx,0.35,cz); const cm=mat('bs_crateM'); cm.diffuseColor=new BABYLON.Color3(0.2,0.14,0.08); crate.material=cm; });

  // Stone archway to specimen nook
  for(let a=0;a<7;a++){ const ang=(a/6)*Math.PI; const ay=0.5+Math.sin(ang)*1.2; const az=-2+Math.cos(ang)*1.0; const b=BABYLON.MeshBuilder.CreateBox('bs_sArch'+a,{width:0.25,height:0.35,depth:0.3},scene); b.position.set(-W/2+0.15,ay,az); b.material=wallM; }
  for(let s=0;s<2;s++){ const shelf=BABYLON.MeshBuilder.CreateBox('bs_nShelf'+s,{width:0.8,height:0.04,depth:0.3},scene); shelf.position.set(-W/2+0.5,1.0+s*0.6,-2); shelf.material=benchM;
    for(let j=0;j<3;j++){ const jar=BABYLON.MeshBuilder.CreateCylinder('bs_nJar'+s+j,{diameterTop:0.06,diameterBottom:0.08,height:0.18,tessellation:8},scene); jar.position.set(-W/2+0.5-0.2+j*0.2,1.1+s*0.6,-2); const jm=mat('bs_njm'+s+j); jm.diffuseColor=new BABYLON.Color3(0.2+Math.random()*0.2,0.1+Math.random()*0.1,0.05+Math.random()*0.05); jar.material=jm; }
  }

  // Hanging herbs
  for(let h=0;h<4;h++){ const hz=-3+h*1.5;
    const herb=BABYLON.MeshBuilder.CreateCylinder('bs_herb'+h,{diameterTop:0.03,diameterBottom:0.1,height:0.4,tessellation:6},scene); herb.position.set(-W/2+0.2,3.0,hz); const hm=mat('bs_hm'+h); hm.diffuseColor=new BABYLON.Color3(0.2,0.22,0.1); herb.material=hm;
  }

  // Lights
  const winLight=new BABYLON.PointLight('bs_wL',new BABYLON.Vector3(0,3,-D/2+1),scene);
  winLight.diffuse=new BABYLON.Color3(0.1,0.3,0.15); winLight.intensity=1.5; winLight.range=18;
  const stillLight=new BABYLON.PointLight('bs_sL',new BABYLON.Vector3(-3,1.5,-1),scene);
  stillLight.diffuse=new BABYLON.Color3(0.4,0.8,0.3); stillLight.intensity=1.0; stillLight.range=8;
  const pentLight=new BABYLON.PointLight('bs_pL',new BABYLON.Vector3(0,0.5,1),scene);
  pentLight.diffuse=new BABYLON.Color3(0.5,0.05,0.02); pentLight.intensity=1.0; pentLight.range=6;
  const lampLight=new BABYLON.PointLight('bs_lL',new BABYLON.Vector3(3,1.5,-3),scene);
  lampLight.diffuse=new BABYLON.Color3(0.7,0.4,0.1); lampLight.intensity=1.5; lampLight.range=10;
  const ambient=new BABYLON.HemisphericLight('bs_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.2; ambient.diffuse=new BABYLON.Color3(0.1,0.15,0.12); ambient.groundColor=new BABYLON.Color3(0.08,0.03,0.02);

  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    stillLight.intensity=flk(1.0,0.2,1.8,0.5);
    pentLight.intensity=flk(1.0,0.25,0.7,1.5);
    lampLight.intensity=flk(1.5,0.2,2.1,2.0);
    if(heat) heat.material.emissiveColor=new BABYLON.Color3(flk(0.8,0.2,4,0),flk(0.3,0.1,4,1),0.02);
  });

  interactables.set('bs_flask','still'); interactables.set('bs_bulb','still'); interactables.set('bs_tube','still');
  interactables.set('bs_pent','pentagram'); interactables.set('bs_pline0','pentagram');
  interactables.set('bs_bone','bones');

  const doorP=BABYLON.MeshBuilder.CreateBox('door_pantry',{width:1.2,height:2.2,depth:0.1},scene); doorP.position.set(0,1.1,D/2-0.05); const dpM=mat('bs_dpM'); dpM.diffuseColor=new BABYLON.Color3(0.18,0.12,0.07); doorP.material=dpM;
  interactables.set('door_pantry','door_pantry');
}

// ─── ATTIC ────────────────────────────────────────────────────────────────────
