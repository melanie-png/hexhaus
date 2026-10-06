function buildAttic(){
  const W=10, D=8, H=3.0;
  const wallM = pbr('a_wallM', TEX.beam_d, TEX.beam_n, 2, 2, new BABYLON.Color3(0.52,0.40,0.28));
  const floorM = pbr('a_floorM', TEX.wood_d, TEX.wood_n, 3, 2, new BABYLON.Color3(0.40,0.31,0.21));
  const ceilM = pbr('a_ceilM', TEX.beam_d, TEX.beam_n, 2, 2, new BABYLON.Color3(0.22,0.16,0.10));

  const floor=BABYLON.MeshBuilder.CreateGround('a_floor',{width:W,height:D,subdivisions:3},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('a_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function aWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  aWall('a_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); aWall('a_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); aWall('a_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
  doorwayWall('a_wF',W,H,0,D/2,Math.PI,wallM,[{dx:0,dz:D/2,dw:1.1,dh:2.1}]);
  makeWindow('win_aB1', 0, 1.75, -D/2, 0, 0.9, 1.2);

  // ── house elements ──
  makeWeb('el_at_web1',-4.6,2.75,-3.6,0,1.0);
  makeWeb('el_at_web2',4.55,2.75,-3.6,0,1.0);
  makeDust('el_at_dust',0,1.7,-3.3);
  makeSheet('el_at_sheet1',-3.2,1.5,0.4,false);
  makeSheet('el_at_sheet2',3.0,-1.5,-2.6,false);
  makeSpiderDrop('el_at_spider',-2.0,-2.0,3.0);
  makeRaven('el_at_raven',0.35,1.18,-3.68,0.25);
  // Dust sheets fall over furniture instead of rendering as two opaque white boxes.
  const linenTex=new BABYLON.DynamicTexture('a_linenTex',{width:128,height:128},scene,false),linenC=linenTex.getContext();
  linenC.fillStyle='#b8ae96';linenC.fillRect(0,0,128,128);linenC.fillStyle='rgba(70,57,39,0.10)';
  for(let k=0;k<260;k++)linenC.fillRect((k*37)%128,(k*71)%128,2+(k%3),1+(k%4));
  linenC.strokeStyle='rgba(77,69,55,0.15)';linenC.lineWidth=1;for(let k=0;k<128;k+=8){linenC.beginPath();linenC.moveTo(k,0);linenC.lineTo(k,128);linenC.stroke();}linenTex.update();
  ['el_at_sheet1','el_at_sheet2'].forEach(name=>{
    const original=scene.getMeshByName(name+'_sh'),parent=original.parent,material=original.material;
    original.dispose(false,false);
    const sheet=BABYLON.MeshBuilder.CreateGround(name+'_sh',{width:1.35,height:1.35,subdivisions:24,updatable:true},scene);
    const positions=sheet.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    for(let k=0;k<positions.length;k+=3){const x=positions[k],z=positions[k+2],drop=Math.max(0,Math.abs(x)-0.435,Math.abs(z)-0.435);positions[k+1]=0.745-drop*2.65+Math.sin(x*35+z*17)*0.008;}
    sheet.updateVerticesData(BABYLON.VertexBuffer.PositionKind,positions,true);
    const normals=[];BABYLON.VertexData.ComputeNormals(positions,sheet.getIndices(),normals);sheet.updateVerticesData(BABYLON.VertexBuffer.NormalKind,normals);
    sheet.parent=parent;sheet.material=material;material.diffuseTexture=linenTex;material.diffuseColor=new BABYLON.Color3(0.85,0.82,0.75);material.backFaceCulling=false;
    interactables.set(name+'_sh','sheeted');
  });

  [-3,-1,1,3].forEach(bx=>{ const b=BABYLON.MeshBuilder.CreateBox('a_rafter'+bx,{width:0.2,height:0.2,depth:D},scene); b.position.set(bx,H-0.12,0); const bm=mat('a_bm'+bx); bm.diffuseColor=new BABYLON.Color3(0.1,0.06,0.03); b.material=bm; });

  // Aged attic storage. Clear the room centre, leave the two apparition spots alone.
  const timber=pbr('a_oldTimberM',TEX.darkwood_d,TEX.darkwood_n,2,2,new BABYLON.Color3(0.44,0.31,0.19));
  const iron=mat('a_oldIronM');iron.diffuseColor=new BABYLON.Color3(0.14,0.12,0.095);iron.specularColor=new BABYLON.Color3(0.17,0.15,0.12);
  const brass=mat('a_oldBrassM');brass.diffuseColor=new BABYLON.Color3(0.48,0.34,0.15);brass.specularColor=new BABYLON.Color3(0.23,0.19,0.11);
  function prop(name,opts,x,y,z,m,key=null){const o=BABYLON.MeshBuilder.CreateBox(name,opts,scene);o.position.set(x,y,z);o.material=m;o.isPickable=!!key;if(key)interactables.set(name,key);return o;}
  function skin(name,base,kind){
    const t=new BABYLON.DynamicTexture(name,{width:256,height:256},scene,false),c=t.getContext();c.fillStyle=base;c.fillRect(0,0,256,256);
    c.fillStyle='rgba(237,220,177,0.12)';for(let k=0;k<380;k++)c.fillRect((k*37)%256,(k*71)%256,2+k%4,1+k%5);
    c.strokeStyle='rgba(30,22,15,0.30)';c.lineWidth=2;for(let k=0;k<256;k+=12){c.beginPath();c.moveTo(0,k);c.lineTo(256,k+2);c.stroke();}
    if(kind==='travel'){c.strokeStyle='#a59162';c.lineWidth=5;c.strokeRect(10,10,236,236);c.fillStyle='#b6a77c';c.fillRect(135,65,77,49);c.strokeStyle='#645740';c.lineWidth=2;c.strokeRect(141,71,65,37);c.fillStyle='#514734';for(let k=0;k<3;k++)c.fillRect(147,78+k*8,43-k*7,2);}
    if(kind==='rug'){c.fillStyle='#70544a';c.fillRect(0,0,256,256);c.strokeStyle='#bb9e73';c.lineWidth=8;for(const y of [20,37,110,127,200,217]){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();}}
    t.update();const m=mat(name+'M');m.diffuseTexture=t;m.diffuseColor=new BABYLON.Color3(0.88,0.82,0.73);m.specularColor=new BABYLON.Color3(0.04,0.035,0.025);return m;
  }
  const leather=skin('a_travelLeatherTex','#654832','travel'),rugCloth=skin('a_rolledRugTex','#684934','rug'),linen=skin('a_foldedLinenTex','#8c826b','cloth');
  function trunk(name,x,z,w,h,d,material){
    const body=prop(name,{width:w,height:h,depth:d},x,h/2,z,material,'attic_box');
    prop(name+'_lid',{width:w+0.04,height:0.06,depth:d+0.03},x,h+0.03,z,material,'attic_box');
    for(const side of [-1,1]){
      const sx=x+side*w*0.31;
      prop(name+'_strapFront'+side,{width:0.065,height:h+0.06,depth:0.02},sx,(h+0.06)/2,z+d/2+0.012,iron,'attic_box');
      prop(name+'_strapTop'+side,{width:0.065,height:0.014,depth:d+0.05},sx,h+0.066,z,iron,'attic_box');
      for(const yy of [0.10,h-0.1]){const riv=BABYLON.MeshBuilder.CreateSphere(name+'_rivet'+side+'_'+yy,{diameter:0.027,segments:6},scene);riv.position.set(sx,yy,z+d/2+0.027);riv.material=brass;riv.isPickable=false;}
      prop(name+'_cornerFront'+side,{width:0.10,height:0.10,depth:0.026},x+side*(w/2-0.045),0.065,z+d/2+0.018,iron,'attic_box');
    }
    prop(name+'_latch',{width:0.09,height:0.15,depth:0.032},x,h-0.025,z+d/2+0.027,brass,'attic_box');
    const handle=BABYLON.MeshBuilder.CreateTorus(name+'_handle',{diameter:0.19,thickness:0.024,tessellation:12},scene);handle.rotation.x=Math.PI/2;handle.scaling.y=0.55;handle.position.set(x,h*0.40,z+d/2+0.034);handle.material=iron;interactables.set(handle.name,'attic_box');return body;
  }
  // Keep the original locked trunk location and key.
  const trunkM=pbr('a_trunkM',TEX.darkwood_d,TEX.darkwood_n,2,1,new BABYLON.Color3(0.38,0.27,0.16));
  const oldTrunk=trunk('a_trunk',-3,-2.5,1.2,0.7,0.6,trunkM);
  trunk('a_travelTrunk',3.05,2.3,1.45,0.58,0.74,leather);

  // Slatted crates, not five identical sealed cubes.
  function crate(name,x,z,w,h,d){
    prop(name,{width:w,height:0.05,depth:d},x,0.025,z,timber,'attic_box');
    for(let row=0;row<4;row++){
      const y=0.12+row*(h-0.16)/3;
      for(const side of [-1,1]){
        prop(name+'_slatF'+row+'_'+side,{width:w,height:0.085,depth:0.045},x,y,z+side*(d/2-0.0225),timber,'attic_box');
        prop(name+'_slatS'+row+'_'+side,{width:0.045,height:0.085,depth:d},x+side*(w/2-0.0225),y,z,timber,'attic_box');
      }
    }
    for(const xx of [-1,1])for(const zz of [-1,1])prop(name+'_post'+xx+'_'+zz,{width:0.06,height:h,depth:0.06},x+xx*(w/2-0.045),h/2,z+zz*(d/2-0.045),timber,'attic_box');
  }
  crate('a_box',-4.15,-3.25,0.88,0.64,0.72);
  crate('a_crateFront',-4.05,2.9,1.0,0.66,0.72);
  crate('a_crateBack',2.5,-3.35,0.92,0.60,0.70);
  // Linen folded low in the front crate.
  for(let k=0;k<3;k++)prop('a_foldedBedding'+k,{width:0.66,height:0.065,depth:0.48},-4.05,0.10+k*0.065,2.9,linen);

  // Dresser: legs, overhanging top, three distinct drawers with pairs of pulls.
  const dx=3.88,dz=0.25;
  for(const xx of [-0.54,0.54])for(const zz of [-0.23,0.23])prop('a_dresserFoot'+xx+'_'+zz,{width:0.10,height:0.12,depth:0.10},dx+xx,0.06,dz+zz,timber);
  prop('a_dresserBody',{width:1.35,height:0.86,depth:0.66},dx,0.55,dz,timber);
  prop('a_dresserTop',{width:1.46,height:0.07,depth:0.76},dx,1.015,dz,timber);
  for(let row=0;row<3;row++){
    prop('a_dresserDrawer'+row,{width:1.22,height:0.235,depth:0.028},dx,0.27+row*0.255,dz+0.346,timber);
    for(const side of [-1,1]){const pull=BABYLON.MeshBuilder.CreateSphere('a_dresserPull'+row+'_'+side,{diameter:0.047,segments:8},scene);pull.position.set(dx+side*0.30,0.27+row*0.255,dz+0.386);pull.material=brass;pull.isPickable=false;}
  }

  const dresserPivot=new BABYLON.TransformNode('a_dresserPivot',scene);dresserPivot.position.set(dx,0,dz);scene.meshes.filter(m=>m.name.startsWith('a_dresser')).forEach(m=>m.setParent(dresserPivot));dresserPivot.rotation.y=-Math.PI/2;

  // A small old oil lantern gives the stored furniture a readable warm pool of light.
  const lanternX=4.05,lanternZ=0.30;
  const lanternBase=BABYLON.MeshBuilder.CreateCylinder('a_lanternBase',{diameter:0.17,height:0.035,tessellation:12},scene);lanternBase.position.set(lanternX,1.0675,lanternZ);lanternBase.material=iron;lanternBase.isPickable=false;
  const lampGlassM=mat('a_lanternGlassM');lampGlassM.diffuseColor=new BABYLON.Color3(0.46,0.32,0.13);lampGlassM.emissiveColor=new BABYLON.Color3(0.4,0.21,0.055);lampGlassM.alpha=0.65;
  const glass=BABYLON.MeshBuilder.CreateCylinder('a_lanternGlass',{diameter:0.105,height:0.18,tessellation:12},scene);glass.position.set(lanternX,1.175,lanternZ);glass.material=lampGlassM;glass.isPickable=false;
  for(let k=0;k<4;k++){const angle=k*Math.PI/2;const bar=BABYLON.MeshBuilder.CreateCylinder('a_lanternBar'+k,{diameter:0.012,height:0.22,tessellation:6},scene);bar.position.set(lanternX+Math.cos(angle)*0.062,1.195,lanternZ+Math.sin(angle)*0.062);bar.material=iron;bar.isPickable=false;}
  const cap=BABYLON.MeshBuilder.CreateCylinder('a_lanternCap',{diameterBottom:0.17,diameterTop:0.055,height:0.07,tessellation:12},scene);cap.position.set(lanternX,1.30,lanternZ);cap.material=iron;cap.isPickable=false;
  const lantern=new BABYLON.PointLight('a_lanternL',new BABYLON.Vector3(lanternX,1.27,lanternZ),scene);lantern.diffuse=new BABYLON.Color3(1.0,0.72,0.40);lantern.intensity=1.2;lantern.range=8;
  let lanternTime=0;scene.registerBeforeRender(()=>{lanternTime+=engine.getDeltaTime()*0.001;lantern.intensity=1.2+Math.sin(lanternTime*2.1+1.7)*0.065+Math.sin(lanternTime*5.3+0.4)*0.025;});

  // Broken chair, three legs still attached and the fourth lying alongside it.
  const cx=-4.08,cz=-0.18;
  prop('a_brokenChairSeat',{width:0.72,height:0.075,depth:0.68},cx,0.525,cz,timber);
  [[-0.27,-0.24],[0.27,-0.24],[-0.27,0.24]].forEach(([x,z],k)=>prop('a_brokenChairLeg'+k,{width:0.055,height:0.49,depth:0.055},cx+x,0.245,cz+z,timber));
  for(const side of [-1,1])prop('a_brokenChairBack'+side,{width:0.06,height:0.87,depth:0.06},cx+side*0.31,0.97,cz-0.28,timber);
  prop('a_brokenChairCrest',{width:0.72,height:0.10,depth:0.065},cx,1.385,cz-0.28,timber);
  prop('a_brokenChairSlat',{width:0.31,height:0.055,depth:0.055},cx-0.17,1.07,cz-0.28,timber);
  const fallen=prop('a_brokenChairFallenLeg',{width:0.50,height:0.065,depth:0.06},cx-0.15,0.038,cz+0.65,timber);fallen.rotation.y=0.32;

  // Two aged landscape pictures stacked against the east wall, resting on the floor.
  function picture(name,x,z,w,h,tilt,variant){
    const n=new BABYLON.TransformNode(name+'_node',scene);n.position.set(x,0.025,z);n.rotation.y=Math.PI/2;n.rotation.x=tilt;
    const dt=new BABYLON.DynamicTexture(name+'Tex',{width:128,height:160},scene,false),c=dt.getContext();
    c.fillStyle=variant?'#514f45':'#555341';c.fillRect(0,0,128,160);c.fillStyle='#999079';c.beginPath();c.arc(92,38,13,0,Math.PI*2);c.fill();
    c.fillStyle='#343b30';c.beginPath();c.moveTo(0,101);c.lineTo(32,69);c.lineTo(67,109);c.lineTo(93,80);c.lineTo(128,106);c.lineTo(128,160);c.lineTo(0,160);c.fill();
    c.strokeStyle='#272921';c.lineWidth=4;for(let k=0;k<4;k++){const x=13+k*29;c.beginPath();c.moveTo(x,143);c.lineTo(x-2,76+k*7);c.moveTo(x,99);c.lineTo(x-11,88);c.moveTo(x,113);c.lineTo(x+10,98);c.stroke();}
    c.fillStyle='rgba(185,165,126,0.13)';for(let k=0;k<180;k++)c.fillRect((k*37)%128,(k*67)%160,3,2);dt.update();
    const m=mat(name+'CanvasM');m.diffuseTexture=dt;m.diffuseColor=new BABYLON.Color3(0.93,0.85,0.72);m.backFaceCulling=false;
    const canvas=BABYLON.MeshBuilder.CreatePlane(name+'_canvas',{width:w-0.075,height:h-0.075},scene);canvas.parent=n;canvas.position.set(0,h/2,-0.016);canvas.material=m;canvas.isPickable=false;
    [[0,h-0.028,w,0.055],[0,0.028,w,0.055],[-w/2+0.028,h/2,0.055,h],[w/2-0.028,h/2,0.055,h]].forEach(([x,y,fw,fh],k)=>{const f=BABYLON.MeshBuilder.CreateBox(name+'_frame'+k,{width:fw,height:fh,depth:0.045},scene);f.parent=n;f.position.set(x,y,0);f.material=timber;f.isPickable=false;});
  }
  picture('a_pictureTall',4.57,-2.75,0.74,1.18,0.16,false);
  picture('a_pictureSmall',4.48,-2.30,0.58,0.78,0.20,true);

  // Rolled rug and a buckled hatbox on the leather trunk.
  const roll=BABYLON.MeshBuilder.CreateCylinder('a_rolledRug',{diameter:0.28,height:1.82,tessellation:16},scene);roll.position.set(2.42,0.14,3.25);roll.rotation.z=Math.PI/2;roll.material=rugCloth;roll.isPickable=false;
  for(const side of [-1,1]){const strap=BABYLON.MeshBuilder.CreateTorus('a_rugTie'+side,{diameter:0.289,thickness:0.015,tessellation:12},scene);strap.position.set(2.42+side*0.56,0.14,3.25);strap.rotation.z=Math.PI/2;strap.material=iron;strap.isPickable=false;}
  const hatbox=BABYLON.MeshBuilder.CreateCylinder('a_hatbox',{diameter:0.54,height:0.37,tessellation:18},scene);hatbox.position.set(3.30,0.825,2.30);hatbox.material=linen;hatbox.isPickable=false;
  const hatlid=BABYLON.MeshBuilder.CreateCylinder('a_hatboxLid',{diameter:0.58,height:0.04,tessellation:18},scene);hatlid.position.set(3.30,1.03,2.30);hatlid.material=leather;hatlid.isPickable=false;

  // Visible timber framing and braces above the stored objects.
  for(const x of [-4,-2,2,4])prop('a_wallStud'+x,{width:0.10,height:2.88,depth:0.11},x,1.44,-3.92,timber);
  for(const side of [-1,1]){const brace=prop('a_roofBrace'+side,{width:0.93,height:0.09,depth:0.11},side*3.38,2.62,-3.88,timber);brace.rotation.z=side*0.50;}

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
  bulbLight.diffuse=new BABYLON.Color3(0.9,0.74,0.50); bulbLight.intensity=0.9; bulbLight.range=10;
  const ambient=new BABYLON.HemisphericLight('a_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.40; ambient.diffuse=new BABYLON.Color3(0.32,0.30,0.28); ambient.groundColor=new BABYLON.Color3(0.12,0.09,0.065);
  const moon=new BABYLON.PointLight('a_moonL',new BABYLON.Vector3(0,1.8,-3.55),scene);moon.diffuse=new BABYLON.Color3(0.40,0.49,0.65);moon.intensity=0.60;moon.range=9;
  const cord=BABYLON.MeshBuilder.CreateCylinder('a_pendantCord',{diameter:0.012,height:0.22,tessellation:6},scene);cord.position.set(0,2.86,0);cord.material=iron;cord.isPickable=false;

  let ft=0;
  scene.registerBeforeRender(()=>{ ft+=engine.getDeltaTime()*0.001; bulbLight.intensity=0.85+Math.sin(ft*8)*0.14+Math.random()*0.04; if(Math.random()<0.005) bulbLight.intensity=0.18; });

  interactables.set('a_trunk','attic_box'); interactables.set('a_box','attic_box');
  interactables.set('a_broomHandle','broom');

  buildDoor('door_library', 0, D/2, Math.PI, 0.94, 1.98);
  makeRoomSwitch('attic', 0.85, 1.35, D/2-0.06, Math.PI);
  interactables.set('door_library','door_library');
}
