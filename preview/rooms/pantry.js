function buildPantry(){
  const W=10, D=8, H=3.8;
  const wallM = pbr('p_wallM', TEX.mstone_d, TEX.mstone_n, 2, 2, new BABYLON.Color3(0.22,0.25,0.27));
  const floorM = pbr('p_floorM', TEX.stone_d, TEX.stone_n, 3, 2, new BABYLON.Color3(0.18,0.2,0.22));
  const woodM = pbr('p_woodM', TEX.darkwood_d, TEX.darkwood_n, 2, 2, new BABYLON.Color3(0.28,0.2,0.1));

  const floor=BABYLON.MeshBuilder.CreateGround('p_floor',{width:W,height:D,subdivisions:3},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceilM=mat('p_ceilM'); ceilM.diffuseColor=new BABYLON.Color3(0.1,0.08,0.06); const ceil=BABYLON.MeshBuilder.CreatePlane('p_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function pWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  pWall('p_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); pWall('p_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
  doorwayWall('p_wF',W,H,0,D/2,Math.PI,wallM,[{dx:0,dz:D/2,dw:1.3,dh:2.3}]);
  doorwayWall('p_wB',W,H,0,-D/2,0,wallM,[{dx:W/2-0.5,dz:-D/2,dw:1.1,dh:2.1}]);
  makeWindow('win_pL1', -W/2, 2.6, 1.5, Math.PI/2, 0.8, 1.1);

  // ── house elements ──
  makeWeb('el_pan_web1',-4.65,3.4,-3.55,0,0.85);
  makeDust('el_pan_dust',-4.7,2.3,1.4);
  makeSaltLine('el_pan_salt',4.5,-3.62,0,1.5);
  makeRat('el_pan_rat',[{x:2.2,z:-3.2},{x:5.6,z:-3.3},{x:6.8,z:-2.0},{x:4.9,z:-3.15}],2);

  // Preserved-goods wall: labelled ingredient jars, varied sizes, wax seals, two tipped on their sides.
  const glassM=mat('p_glassM'); glassM.diffuseColor=new BABYLON.Color3(0.62,0.66,0.60); glassM.alpha=0.55; glassM.specularColor=new BABYLON.Color3(0.35,0.4,0.38); glassM.specularPower=48;
  const waxM=mat('p_waxM'); waxM.diffuseColor=new BABYLON.Color3(0.42,0.10,0.09); waxM.specularColor=new BABYLON.Color3(0.06,0.02,0.02);
  const contentCols=[[0.18,0.30,0.10],[0.34,0.20,0.05],[0.08,0.20,0.14],[0.30,0.24,0.04],[0.14,0.22,0.24]];
  const contentMats=contentCols.map((c,i)=>{const m=mat('p_contentM'+i);m.diffuseColor=new BABYLON.Color3(c[0],c[1],c[2]);m.emissiveColor=new BABYLON.Color3(c[0]*0.22,c[1]*0.22,c[2]*0.22);return m;});
  const labelTex=new BABYLON.DynamicTexture('p_labelTex',{width:48,height:64},scene,false),lc=labelTex.getContext();
  lc.fillStyle='#b8a37c';lc.fillRect(0,0,48,64);lc.fillStyle='#4a3d28';for(let k=0;k<4;k++)lc.fillRect(8,14+k*8,30-(k%2)*6,2);lc.strokeStyle='#6b5a3c';lc.lineWidth=2;lc.strokeRect(3,3,42,58);labelTex.update();
  const labelM=mat('p_labelM'); labelM.diffuseTexture=labelTex; labelM.backFaceCulling=false;
  const tipped=(r,c)=>(r===2&&c===4)||(r===0&&c===5);
  for(let row=0;row<3;row++){ for(let col=0;col<6;col++){
    const jx=-W/2+1+col*1.5, shelfY=0.95+row*0.8;
    const h=0.36+((row*5+col*3)%3)*0.07, d=0.13+((row*7+col*2)%3)*0.02;
    const node=new BABYLON.TransformNode('p_jarNode'+row+col,scene);
    const base=tipped(row,col)?{x:jx+0.1,y:shelfY+d/2,z:-D/2+0.34}:{x:jx,y:shelfY,z:-D/2+0.34};
    node.position.set(base.x,base.y,base.z);
    if(tipped(row,col)){ node.rotation.y=0.5+col*0.13; node.rotation.z=Math.PI/2-0.06; }
    const jar=BABYLON.MeshBuilder.CreateCylinder('p_jar'+row+col,{diameterTop:d*0.82,diameterBottom:d,height:h,tessellation:10},scene);
    jar.parent=node; jar.position.y=h/2; jar.material=glassM;
    if(!(row===0&&col===0)&&!(row===1&&col===1)) jar.isPickable=false;
    const fill=BABYLON.MeshBuilder.CreateCylinder('p_jarFill'+row+col,{diameter:d*0.72,height:h*0.62,tessellation:10},scene);
    fill.parent=node; fill.position.y=h*0.42; fill.material=contentMats[(row*3+col)%5]; fill.isPickable=false;
    const lid=BABYLON.MeshBuilder.CreateCylinder('p_lid'+row+col,{diameter:d*0.9,height:0.045,tessellation:10},scene);
    lid.parent=node; lid.position.y=h+0.02; lid.material=woodM; lid.isPickable=false;
    if((row+col)%3===0&&!tipped(row,col)){ const wax=BABYLON.MeshBuilder.CreateCylinder('p_wax'+row+col,{diameter:d*0.98,height:0.02,tessellation:10},scene); wax.parent=node; wax.position.y=h+0.052; wax.material=waxM; wax.isPickable=false; }
    if(!tipped(row,col)&&col<4){ const label=BABYLON.MeshBuilder.CreatePlane('p_label'+row+col,{width:0.075,height:0.10},scene); label.parent=node; label.position.set(0,h*0.38,d/2+0.004); label.material=labelM; label.isPickable=false; }
  }}
  // Chunky shelf boards with lips and wooden corbels.
  for(let row=0;row<3;row++){
    const shelf=BABYLON.MeshBuilder.CreateBox('p_shelf'+row,{width:W-1,height:0.04,depth:0.34},scene); shelf.position.set(0,0.95+row*0.8,-D/2+0.32); shelf.material=woodM;
    const lip=BABYLON.MeshBuilder.CreateBox('p_shelfLip'+row,{width:W-1,height:0.10,depth:0.03},scene); lip.position.set(0,0.99+row*0.8,-D/2+0.475); lip.material=woodM; lip.isPickable=false;
    for(const bx of [-3.6,0,3.6]){ const corbel=BABYLON.MeshBuilder.CreateBox('p_corbel'+row+'_'+Math.round((bx+4)*10),{width:0.14,height:0.22,depth:0.06},scene); corbel.position.set(bx,0.83+row*0.8,-D/2+0.42); corbel.rotation.x=-0.25; corbel.material=woodM; corbel.isPickable=false; }
  }
  // Hanging dried herbs above the shelves.
  const railM=mat('p_railM'); railM.diffuseColor=new BABYLON.Color3(0.24,0.16,0.08);
  for(const seg of [-1,1]){ const rail=BABYLON.MeshBuilder.CreateCylinder('p_hangRail'+seg,{diameter:0.05,height:4.6,tessellation:8},scene); rail.rotation.z=Math.PI/2; rail.position.set(seg*2.55,3.25,-D/2+0.42); rail.material=railM; rail.isPickable=false;
    for(const hx of [seg*1.55,seg*3.55]){ const drop=BABYLON.MeshBuilder.CreateBox('p_hangDrop'+seg+'_'+hx,{width:0.03,height:3.8-3.25,depth:0.03},scene); drop.position.set(hx,3.52,-D/2+0.42); drop.material=railM; drop.isPickable=false; } }
  const herbM=mat('p_herbM'); herbM.diffuseColor=new BABYLON.Color3(0.20,0.24,0.10); herbM.emissiveColor=new BABYLON.Color3(0.02,0.03,0.01);
  for(let i=0;i<7;i++){ const hx=-3.3+i*1.1, sl=0.28+((i*13)%3)*0.09;
    const str=BABYLON.MeshBuilder.CreateCylinder('p_herbStr'+i,{diameter:0.012,height:sl,tessellation:6},scene); str.position.set(hx,3.25-sl/2,-D/2+0.42); str.material=railM; str.isPickable=false;
    for(let l=0;l<3;l++){ const leaf=BABYLON.MeshBuilder.CreateSphere('p_herb'+i+'_'+l,{diameter:0.075,segments:6},scene); leaf.scaling.set(1,1.8,1); leaf.position.set(hx+(l-1)*0.028,3.25-sl-0.05-l*0.045,-D/2+0.42+(l%2)*0.02); leaf.material=herbM; leaf.isPickable=false; }
  }

  // Leaded window
  const winM=mat('p_winM'); winM.diffuseColor=new BABYLON.Color3(0.06,0.1,0.18); winM.emissiveColor=new BABYLON.Color3(0.06,0.12,0.2); winM.alpha=0.82;
  const win=BABYLON.MeshBuilder.CreatePlane('p_win',{width:1.5,height:2.0},scene); win.position.set(-W/2+0.08,2.0,0); win.rotation.y=Math.PI/2; win.material=winM;

  // Storage chest with iron banding and a raised lid seam.
  const chest=BABYLON.MeshBuilder.CreateBox('p_chest',{width:2.5,height:1.0,depth:0.8},scene); chest.position.set(W/2-2,0.5,1); chest.material=woodM;
  const chestIron=mat('p_chestIronM'); chestIron.diffuseColor=new BABYLON.Color3(0.13,0.11,0.09); chestIron.specularColor=new BABYLON.Color3(0.15,0.14,0.12);
  for(const bx of [-0.78,0.78]){ const band=BABYLON.MeshBuilder.CreateBox('p_chestBand'+Math.round(bx*10),{width:0.09,height:1.02,depth:0.84},scene); band.position.set(W/2-2+bx,0.5,1); band.material=chestIron; band.isPickable=false; }
  const seam=BABYLON.MeshBuilder.CreateBox('p_chestSeam',{width:2.52,height:0.05,depth:0.82},scene); seam.position.set(W/2-2,0.80,1); seam.material=chestIron; seam.isPickable=false;
  const clasp=BABYLON.MeshBuilder.CreateBox('p_chestClasp',{width:0.12,height:0.16,depth:0.03},scene); clasp.position.set(W/2-2,0.72,1+0.415); clasp.material=chestIron; clasp.isPickable=false;

  // Burlap sacks slumped against the north-west corner, tied at the neck.
  const burlapTex=new BABYLON.DynamicTexture('p_burlapTex',{width:128,height:128},scene,false),bc=burlapTex.getContext();
  bc.fillStyle='#6e5f42';bc.fillRect(0,0,128,128);bc.fillStyle='rgba(42,35,20,0.35)';for(let k=0;k<420;k++)bc.fillRect((k*37)%128,(k*71)%128,2,1);bc.strokeStyle='rgba(58,49,30,0.4)';bc.lineWidth=1;for(let k=0;k<128;k+=5){bc.beginPath();bc.moveTo(0,k);bc.lineTo(128,k+3);bc.stroke();for(let j=0;j<128;j+=5){bc.beginPath();bc.moveTo(j,k);bc.lineTo(j+3,k+5);bc.stroke();}}burlapTex.update();
  const burlapM=mat('p_burlapM'); burlapM.diffuseTexture=burlapTex;
  function sack(name,x,z,r,hgt,rot){
    const node=new BABYLON.TransformNode(name+'_node',scene); node.position.set(x,0,z); node.rotation.y=rot;
    const sy=hgt/r*0.82;const body=BABYLON.MeshBuilder.CreateSphere(name,{diameter:r*2,segments:10},scene); body.parent=node; body.scaling.set(1,sy,1); body.position.y=r*sy*0.92; body.material=burlapM; body.isPickable=false;
    const neck=BABYLON.MeshBuilder.CreateCylinder(name+'_neck',{diameterTop:r*0.34,diameterBottom:r*0.62,height:r*0.55,tessellation:10},scene); neck.parent=node; neck.position.y=r*sy*0.92+r*0.32; neck.rotation.z=0.22; neck.material=burlapM; neck.isPickable=false;
    const tie=BABYLON.MeshBuilder.CreateTorus(name+'_tie',{diameter:r*0.36,thickness:0.02,tessellation:10},scene); tie.parent=node; tie.position.y=r*sy*0.92+r*0.47; tie.rotation.x=Math.PI/2; tie.rotation.z=0.22; tie.material=railM; tie.isPickable=false;
    return node;
  }
  sack('p_sack',-4.28,-2.62,0.30,0.52,0.3);
  sack('p_sack2',-4.02,-3.05,0.26,0.44,-0.4);
  sack('p_sack3',-4.28,-2.62,0.20,0.34,1.1); scene.getTransformNodeByName('p_sack3_node').position.y=0.42;

  // Woven wicker baskets, two of them with produce showing.
  const weaveTex=new BABYLON.DynamicTexture('p_weaveTex',{width:128,height:128},scene,false),wc=weaveTex.getContext();
  wc.fillStyle='#7a6136';wc.fillRect(0,0,128,128);wc.strokeStyle='rgba(43,32,15,0.55)';wc.lineWidth=2;for(let k=0;k<128;k+=8){wc.beginPath();wc.moveTo(0,k);wc.lineTo(128,k+6);wc.stroke();wc.beginPath();wc.moveTo(k,0);wc.lineTo(k+6,128);wc.stroke();}weaveTex.update();
  const weaveM=mat('p_weaveM'); weaveM.diffuseTexture=weaveTex;
  const rootM=mat('p_rootM'); rootM.diffuseColor=new BABYLON.Color3(0.32,0.24,0.12);
  const podM=mat('p_podM'); podM.diffuseColor=new BABYLON.Color3(0.36,0.30,0.14);
  [[-3,2,true],[-3,-1,false],[3,-2,true]].forEach(([bx,bz,filled],bi)=>{
    const b=BABYLON.MeshBuilder.CreateCylinder('p_basket',{diameterTop:0.44,diameterBottom:0.34,height:0.35,tessellation:12},scene); b.position.set(bx,0.175,bz); b.material=weaveM; b.isPickable=false;
    const rim=BABYLON.MeshBuilder.CreateTorus('p_basketRim'+bi,{diameter:0.44,thickness:0.022,tessellation:12},scene); rim.position.set(bx,0.35,bz); rim.material=weaveM; rim.isPickable=false;
    if(filled)for(let k=0;k<4;k++){ const item=BABYLON.MeshBuilder.CreateSphere('p_basketFill'+bi+'_'+k,{diameter:0.085,segments:6},scene); item.scaling.set(1,0.8,1); item.position.set(bx+(k%2)*0.09-0.05,0.30+((k===1||k===2)?0.02:0),bz+(k>1?0.08:-0.04)); item.material=(bi===0)?rootM:podM; item.isPickable=false; }
  });

  // Produce crates under the west window: potatoes, onions and a winter squash.
  const crateM=pbr('p_crateM',TEX.darkwood_d,TEX.darkwood_n,2,2,new BABYLON.Color3(0.36,0.25,0.12));
  function produceCrate(name,x,z,w,h,d){
    const bottom=BABYLON.MeshBuilder.CreateBox(name+'_bottom',{width:w,height:0.04,depth:d},scene); bottom.position.set(x,0.02,z); bottom.material=crateM; bottom.isPickable=false;
    for(let row=0;row<3;row++){ const y=0.085+row*(h-0.14)/2;
      for(const side of [-1,1]){ const f=BABYLON.MeshBuilder.CreateBox(name+'_slat'+row+'_'+side,{width:w,height:0.07,depth:0.032},scene); f.position.set(x,y,z+side*(d/2-0.016)); f.material=crateM; f.isPickable=false; } }
    for(const xx of [-1,1])for(const zz of [-1,1]){ const post=BABYLON.MeshBuilder.CreateBox(name+'_post'+xx+'_'+zz,{width:0.05,height:h,depth:0.05},scene); post.position.set(x+xx*(w/2-0.0375),h/2,z+zz*(d/2-0.0375)); post.material=crateM; post.isPickable=false; }
  }
  const potatoM=mat('p_potatoM'); potatoM.diffuseColor=new BABYLON.Color3(0.36,0.28,0.15);
  const onionM=mat('p_onionM'); onionM.diffuseColor=new BABYLON.Color3(0.62,0.48,0.24);
  produceCrate('p_produceCrate0',-4.02,0.72,0.82,0.34,0.62);
  for(let k=0;k<6;k++){ const t=BABYLON.MeshBuilder.CreateSphere('p_potato'+k,{diameter:0.10+((k*7)%3)*0.014,segments:6},scene); t.scaling.set(1.25,0.9,1); t.position.set(-4.02+(k%3)*0.2-0.2,0.29+((k>2)?0.07:0),0.72+(k>2?0.06:0)); t.rotation.y=k*1.3; t.material=potatoM; t.isPickable=false; }
  produceCrate('p_produceCrate1',-4.02,1.95,0.82,0.34,0.62);
  for(let k=0;k<5;k++){ const o=BABYLON.MeshBuilder.CreateSphere('p_onion'+k,{diameter:0.09,segments:6},scene); o.scaling.y=1.1; o.position.set(-4.02+(k%3)*0.2-0.18,0.285+((k>2)?0.075:0),1.95+(k>2?0.07:0)); o.material=onionM; o.isPickable=false; }
  const squash=BABYLON.MeshBuilder.CreateSphere('p_squash',{diameter:0.20,segments:8},scene); squash.scaling.set(1,0.72,1); squash.position.set(-4.02,0.455,0.72); squash.material=onionM; squash.isPickable=false;

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

  buildDoor('door_kitchen', 0, D/2, Math.PI, 1.14, 2.18);
  makeRoomSwitch('pantry', 1.0, 1.4, D/2-0.06, Math.PI);
  interactables.set('door_kitchen','door_kitchen');
  buildDoor('door_basement', W/2-0.5, -D/2, 0, 0.94, 1.98);

  // iron keyhole plate — the crescent-moon lock the iron key answers
  const kp=BABYLON.MeshBuilder.CreateBox('p_keyplate',{width:0.1,height:0.16,depth:0.012},scene); kp.position.set(W/2-0.5,1.15,-D/2+0.11); const kpm=mat('p_kpM'); kpm.diffuseColor=new BABYLON.Color3(0.32,0.26,0.12); kpm.specularColor=new BABYLON.Color3(0.5,0.45,0.25); kpm.specularPower=48; kp.material=kpm;
  const kh=BABYLON.MeshBuilder.CreateCylinder('p_keyhole',{diameter:0.045,height:0.012,tessellation:10},scene); kh.position.set(W/2-0.5,1.15,-D/2+0.115); kh.rotation.x=Math.PI/2; const khm=mat('p_khM'); khm.diffuseColor=new BABYLON.Color3(0.01,0.01,0.01); khm.emissiveColor=new BABYLON.Color3(0.02,0.015,0.0); kh.material=khm;
  interactables.set('door_basement','door_basement');
}

// ─── BASEMENT ──────────────────────────────────────────────────────────────────
