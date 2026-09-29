function buildBathroom(){
  const W=6, D=5, H=3.5;
  const wallM = pbr('b_wallM', TEX.plaster_d, TEX.plaster_n, 2, 2, new BABYLON.Color3(0.20,0.22,0.24));
  const floorM = pbr('b_floorM', TEX.stone_d, TEX.stone_n, 3, 2, new BABYLON.Color3(0.15,0.18,0.20));
  const ceilM = mat('b_ceilM'); ceilM.diffuseColor=new BABYLON.Color3(0.1,0.12,0.14);

  const floor=BABYLON.MeshBuilder.CreateGround('b_floor',{width:W,height:D,subdivisions:2},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('b_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function bWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  bWall('b_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); bWall('b_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); bWall('b_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
  doorwayWall('b_wF',W,H,0,D/2,Math.PI,wallM,[{dx:0,dz:D/2,dw:1.1,dh:2.3}]);
  makeWindow('win_bB1', 1.3, 2.3, -D/2, 0, 0.7, 1.0);

  // ── house elements ──
  makeWeb('el_bath_web1',-2.65,3.15,-2.2,0,0.75);
  makeMirror('el_bath_mirror',-0.9,1.75,-2.42,0);

  // Procedural ceramic tiles: aged white with grout and grime
  function drawTiles(n,cells,px){
    const dt=new BABYLON.DynamicTexture(n,{width:px,height:px},scene,false);
    const c=dt.getContext(); c.fillStyle='#3d3832'; c.fillRect(0,0,px,px);
    const ts=px/cells, g=Math.max(2,Math.floor(ts*0.09));
    for(let yy=0;yy<cells;yy++)for(let xx=0;xx<cells;xx++){
      const v=178+Math.floor(Math.random()*40), grim=Math.random()<0.14;
      c.fillStyle=grim?('rgb('+Math.floor(v*0.6)+','+Math.floor(v*0.55)+','+Math.floor(v*0.45)+')'):('rgb('+v+','+Math.floor(v*0.96)+','+Math.floor(v*0.86)+')');
      c.fillRect(xx*ts+g,yy*ts+g,ts-2*g,ts-2*g);
    }
    dt.update(); return dt;
  }
  const fTileM=mat('b_ftileM'); fTileM.diffuseTexture=drawTiles('b_ftile',16,512); fTileM.specularColor=new BABYLON.Color3(0.15,0.15,0.15);
  floor.material=fTileM;
  const wTileM=mat('b_wtileM'); wTileM.diffuseTexture=drawTiles('b_wtile',8,512); wTileM.specularColor=new BABYLON.Color3(0.12,0.12,0.12); wTileM.backFaceCulling=false;
  function wainscot(n,wd,pos,ry){ const p=BABYLON.MeshBuilder.CreatePlane(n,{width:wd,height:1.1},scene); p.position.copyFrom(pos); p.rotation.y=ry; p.material=wTileM; }
  wainscot('b_wainscotB',W,new BABYLON.Vector3(0,0.55,-D/2+0.015),0);
  wainscot('b_wainscotL',D,new BABYLON.Vector3(-W/2+0.015,0.55,0),Math.PI/2);
  wainscot('b_wainscotR',D,new BABYLON.Vector3(W/2-0.015,0.55,0),-Math.PI/2);
  wainscot('b_wainscotFL',2.45,new BABYLON.Vector3(-1.775,0.55,D/2-0.015),Math.PI);
  wainscot('b_wainscotFR',2.45,new BABYLON.Vector3(1.775,0.55,D/2-0.015),Math.PI);

  // Brass + porcelain materials
  const brassM=mat('b_brassM'); brassM.diffuseColor=new BABYLON.Color3(0.45,0.32,0.12); brassM.specularColor=new BABYLON.Color3(0.8,0.7,0.4);
  const porcM=mat('b_porM'); porcM.diffuseColor=new BABYLON.Color3(0.84,0.81,0.75); porcM.specularColor=new BABYLON.Color3(0.5,0.5,0.5);
  const tubM=porcM.clone('b_tubM'); tubM.diffuseColor=new BABYLON.Color3(0.86,0.83,0.76);

  // Clawfoot bathtub, centred under the window
  const tub=BABYLON.MeshBuilder.CreateCapsule('b_tub',{height:1.7,radius:0.42,tessellation:16},scene);
  tub.scaling.set(0.72,1,1); tub.rotation.z=Math.PI/2; tub.position.set(0,0.62,-D/2+1.1); tub.material=tubM;
  const rim=BABYLON.MeshBuilder.CreateTorus('b_tubrim',{diameter:0.88,thickness:0.05,tessellation:28},scene);
  rim.scaling.set(1.1,1,0.78); rim.position.set(0,0.9,-D/2+1.1); rim.material=brassM;
  const waterM=mat('b_waterM'); waterM.diffuseColor=new BABYLON.Color3(0.05,0.08,0.06); waterM.alpha=0.75; waterM.backFaceCulling=false;
  const water=BABYLON.MeshBuilder.CreatePlane('b_water',{width:1.45,height:0.52},scene);
  water.rotation.x=Math.PI/2; water.position.set(0,0.845,-D/2+1.1); water.material=waterM;
  [[-0.6,-0.22],[0.6,-0.22],[-0.6,0.22],[0.6,0.22]].forEach(([fx,fz],i)=>{
    const foot=BABYLON.MeshBuilder.CreateSphere('b_foot'+i,{diameter:0.12,segments:6},scene);
    foot.scaling.y=1.8; foot.position.set(fx,0.15,-D/2+1.1+fz); foot.material=brassM;
  });
  const tfauc1=BABYLON.MeshBuilder.CreateCylinder('b_tfauc1',{diameter:0.045,height:0.3,tessellation:8},scene); tfauc1.position.set(0.78,0.98,-D/2+1.1); tfauc1.material=brassM;
  const tfauc2=BABYLON.MeshBuilder.CreateCylinder('b_tfauc2',{diameter:0.035,height:0.16,tessellation:8},scene); tfauc2.rotation.z=Math.PI/2; tfauc2.position.set(0.7,1.1,-D/2+1.1); tfauc2.material=brassM;
  const matM=mat('b_matM'); matM.diffuseColor=new BABYLON.Color3(0.3,0.07,0.06); matM.backFaceCulling=false;
  const bathmat=BABYLON.MeshBuilder.CreatePlane('b_bathmat',{width:0.75,height:0.45},scene);
  bathmat.rotation.x=Math.PI/2; bathmat.position.set(0,0.012,-0.35); bathmat.material=matM;

  // High-tank toilet against the left wall
  const wcBowl=BABYLON.MeshBuilder.CreateCylinder('b_wc_bowl',{diameterTop:0.44,diameterBottom:0.3,height:0.34,tessellation:16},scene); wcBowl.position.set(-2.42,0.17,0.6); wcBowl.material=porcM;
  const wcSeat=BABYLON.MeshBuilder.CreateTorus('b_wc_seat',{diameter:0.4,thickness:0.05,tessellation:20},scene); wcSeat.position.set(-2.42,0.36,0.6); wcSeat.material=porcM;
  const wcLid=BABYLON.MeshBuilder.CreateBox('b_wc_lid',{width:0.4,height:0.03,depth:0.36},scene); wcLid.rotation.x=-0.35; wcLid.position.set(-2.4,0.42,0.52); wcLid.material=porcM;
  const wcPipe=BABYLON.MeshBuilder.CreateCylinder('b_wc_pipe',{diameter:0.11,height:1.35,tessellation:10},scene); wcPipe.position.set(-2.6,1.02,0.6); wcPipe.material=brassM;
  const wcTank=BABYLON.MeshBuilder.CreateBox('b_wc_cistern',{width:0.32,height:0.44,depth:0.36},scene); wcTank.position.set(-2.82,2.05,0.6); wcTank.material=porcM;
  const tankM=mat('b_tankM'); tankM.diffuseColor=new BABYLON.Color3(0.3,0.2,0.1); wcTank.material=tankM;
  for(let ci=0;ci<5;ci++){ const seg=BABYLON.MeshBuilder.CreateCylinder('b_wc_chain'+ci,{diameter:0.012,height:0.06,tessellation:6},scene); seg.position.set(-2.62,1.74-ci*0.065,0.6); seg.material=brassM; }
  const wcRing=BABYLON.MeshBuilder.CreateTorus('b_wc_ring',{diameter:0.07,thickness:0.014,tessellation:10},scene); wcRing.position.set(-2.62,1.42,0.6); wcRing.material=brassM;

  // Pedestal washstand basin against the right wall
  const ped=BABYLON.MeshBuilder.CreateCylinder('b_sinkped',{diameterTop:0.15,diameterBottom:0.22,height:0.72,tessellation:12},scene); ped.position.set(2.55,0.36,0); ped.material=porcM;
  const basin=BABYLON.MeshBuilder.CreateSphere('b_sinkbasin',{diameter:0.55,segments:12},scene); basin.scaling.set(0.9,0.4,0.78); basin.position.set(2.55,0.8,0); basin.material=porcM;
  const sfauc1=BABYLON.MeshBuilder.CreateCylinder('b_sfauc1',{diameter:0.04,height:0.22,tessellation:8},scene); sfauc1.position.set(2.78,0.95,0); sfauc1.material=brassM;
  const sfauc2=BABYLON.MeshBuilder.CreateCylinder('b_sfauc2',{diameter:0.03,height:0.14,tessellation:8},scene); sfauc2.rotation.z=Math.PI/2; sfauc2.position.set(2.7,1.04,0); sfauc2.material=brassM;
  const mirM=mat('b_mirM'); mirM.diffuseColor=new BABYLON.Color3(0.08,0.08,0.1); mirM.emissiveColor=new BABYLON.Color3(0.01,0.01,0.02); mirM.backFaceCulling=false;
  const mirror=BABYLON.MeshBuilder.CreatePlane('b_mirror',{width:0.55,height:0.75},scene); mirror.rotation.y=-Math.PI/2; mirror.position.set(W/2-0.03,1.45,0); mirror.material=mirM;

  // Towel rail on the right wall
  const railA=BABYLON.MeshBuilder.CreateCylinder('b_railA',{diameter:0.025,height:0.5,tessellation:8},scene); railA.position.set(2.97,1.4,1.15); railA.material=brassM;
  const railB=BABYLON.MeshBuilder.CreateCylinder('b_railB',{diameter:0.025,height:0.5,tessellation:8},scene); railB.position.set(2.97,1.4,1.75); railB.material=brassM;
  const railBar=BABYLON.MeshBuilder.CreateCylinder('b_railBar',{diameter:0.02,height:0.6,tessellation:8},scene); railBar.rotation.x=Math.PI/2; railBar.position.set(2.97,1.4,1.45); railBar.material=brassM;
  const towelM=mat('b_towelM'); towelM.diffuseColor=new BABYLON.Color3(0.5,0.46,0.38);
  const towel=BABYLON.MeshBuilder.CreateBox('b_towel',{width:0.04,height:0.42,depth:0.42},scene); towel.position.set(2.95,1.15,1.45); towel.material=towelM;

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
  interactables.set('b_tub','bathtub'); interactables.set('b_tubrim','bathtub');
  interactables.set('b_wc_bowl','hightank'); interactables.set('b_wc_seat','hightank'); interactables.set('b_wc_cistern','hightank'); interactables.set('b_wc_ring','hightank');
  interactables.set('b_sinkbasin','washbasin'); interactables.set('b_sinkped','washbasin');

  buildDoor('door_entrance', 0, D/2, Math.PI, 0.94, 2.18);
  makeRoomSwitch('bathroom', 0.85, 1.35, D/2-0.06, Math.PI);
  interactables.set('door_entrance','door_entrance');
}

// ─── PANTRY ────────────────────────────────────────────────────────────────────
