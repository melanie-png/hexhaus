function buildLivingRoom(){
  const W=16, D=12, H=4.5;
  const wallM = pbr('lr_wallM', TEX.plaster_d, TEX.plaster_n, 3, 2, new BABYLON.Color3(0.28,0.24,0.30));
  const floorM = pbr('lr_floorM', TEX.wood_d, TEX.wood_n, 5, 4, new BABYLON.Color3(0.35,0.25,0.16));
  const ceilM = pbr('lr_ceilM', TEX.beam_d, TEX.beam_n, 4, 3, new BABYLON.Color3(0.15,0.10,0.06));
  const woodM = pbr('lr_woodM', TEX.darkwood_d, TEX.darkwood_n, 3, 1, new BABYLON.Color3(0.3,0.22,0.12));

  // Faded oxblood damask, with walnut joinery rather than bare flat plaster.
  const paperTex=new BABYLON.DynamicTexture('lr_damaskTex',{width:256,height:256},scene,false);
  const pc=paperTex.getContext();
  pc.fillStyle='#583c40'; pc.fillRect(0,0,256,256);
  pc.strokeStyle='#96725d'; pc.lineWidth=1.5;
  for(let row=-1;row<5;row++) for(let col=-1;col<5;col++){
    const x=col*64+(row%2)*32, y=row*64;
    pc.beginPath(); pc.moveTo(x,y-25);
    pc.bezierCurveTo(x+25,y-13,x+25,y+13,x,y+25);
    pc.bezierCurveTo(x-25,y+13,x-25,y-13,x,y-25); pc.stroke();
    pc.beginPath(); pc.moveTo(x,y-15); pc.quadraticCurveTo(x+12,y,x,y+15); pc.quadraticCurveTo(x-12,y,x,y-15); pc.stroke();
    pc.fillStyle='#a58566'; pc.fillRect(x-1,y-2,2,4);
  }
  paperTex.update(); paperTex.uScale=12; paperTex.vScale=3;
  wallM.diffuseTexture=paperTex; wallM.bumpTexture=null; wallM.diffuseColor=new BABYLON.Color3(0.88,0.77,0.73);
  const joinM=pbr('lr_joinM',TEX.darkwood_d,TEX.darkwood_n,1,1,new BABYLON.Color3(0.68,0.43,0.23));
  const panelM=pbr('lr_panelM',TEX.wood_d,TEX.wood_n,1,1,new BABYLON.Color3(0.40,0.25,0.14));
  const brassM=mat('lr_brassM'); brassM.diffuseColor=new BABYLON.Color3(0.53,0.36,0.13); brassM.specularColor=new BABYLON.Color3(0.30,0.23,0.12);
  function box(n,w,h,d,x,y,z,m){const b=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);b.position.set(x,y,z);b.material=m;b.isPickable=false;return b;}
  function ball(n,diam,x,y,z,m,sx=1,sy=1,sz=1){const b=BABYLON.MeshBuilder.CreateSphere(n,{diameter:diam,segments:10},scene);b.position.set(x,y,z);b.scaling.set(sx,sy,sz);b.material=m;b.isPickable=false;return b;}
  function cyl(n,diam,h,x,y,z,m){const b=BABYLON.MeshBuilder.CreateCylinder(n,{diameter:diam,height:h,tessellation:12},scene);b.position.set(x,y,z);b.material=m;b.isPickable=false;return b;}
  function trimRun(n,length,x,z,side){
    box(n+'_back',side?0.04:length,1.18,side?length:0.04,x,0.59,z,panelM);
    box(n+'_base',side?0.10:length,0.16,side?length:0.10,x,0.08,z,joinM);
    box(n+'_cap',side?0.13:length,0.085,side?length:0.13,x,1.2,z,joinM);
    const count=Math.ceil(length/1.1),step=length/count;
    for(let i=0;i<count;i++){
      const q=-length/2+(i+0.5)*step;
      const frameX=x+(side?0:q),frameZ=z+(side?q:0);
      box(n+'_recess'+i,side?0.065:step-0.1,0.76,side?step-0.1:0.065,frameX,0.62,frameZ,panelM);
      box(n+'_stile'+i,side?0.08:0.065,1.1,side?0.065:0.08,x+(side?0:q-step/2),0.62,z+(side?q-step/2:0),joinM);
      for(const y of [0.23,1.0])box(n+'_rail'+i+'_'+y,side?0.09:step-0.09,0.04,side?step-0.09:0.09,frameX,y,frameZ,joinM);
    }
  }

  const floor=BABYLON.MeshBuilder.CreateGround('lr_floor',{width:W,height:D,subdivisions:4},scene);
  floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('lr_ceil',{width:W,height:D},scene);
  ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function lrWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  lrWall('lr_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); lrWall('lr_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2);
  doorwayWall('lr_wF',W,H,0,D/2,Math.PI,wallM,[{dx:0,dz:D/2,dw:1.5,dh:2.5}]);
  doorwayWall('lr_wR',D,H,W/2,0,-Math.PI/2,wallM,[{dx:W/2,dz:-3,dw:1.5,dh:2.5}]);
  // DynamicTexture.clone() makes a blank canvas; all wall segments share the painted wallpaper.
  scene.meshes.filter(m=>/^lr_w[BLFR](?:_|$)/.test(m.name)).forEach(m=>{if(m.material)m.material.diffuseTexture=paperTex;});
  makeWindow('win_lB1', -4.5, 2.9, -D/2, 0);
  makeWindow('win_lF1', -4.2, 2.9,  D/2, Math.PI);
  makeWindow('win_lF2',  4.2, 2.9,  D/2, Math.PI);

  trimRun('lr_panelB',W,0,-5.92,false);
  trimRun('lr_panelL',D,-7.92,0,true);
  trimRun('lr_panelFL',7.15,-4.425,5.92,false);
  trimRun('lr_panelFR',7.15,4.425,5.92,false);
  trimRun('lr_panelR1',2.15,7.92,-4.925,true);
  trimRun('lr_panelR2',8.15,7.92,1.925,true);
  for(const y of [4.28,4.39]){
    box('lr_corniceB'+y,W,0.08,0.14,0,y,-5.9,joinM); box('lr_corniceF'+y,W,0.08,0.14,0,y,5.9,joinM);
    box('lr_corniceL'+y,0.14,0.08,D,-7.9,y,0,joinM); box('lr_corniceR'+y,0.14,0.08,D,7.9,y,0,joinM);
  }

  // ── house elements ──
  makeWeb('el_liv_web1',-7.6,4.05,-5.6,0,1.0);
  makeWeb('el_liv_web2',-0.9,3.15,5.9,Math.PI,0.8);
  makeDust('el_liv_dust',-4.5,2.4,-5.4);
  makeWax('el_liv_wax1',-0.5,-5.35); makeWax('el_liv_wax2',0.65,-5.45,0.10);
  makeRockingChair('el_liv_rock',-6.3,-3.3,2.7);
  makeSheet('el_liv_sheet',6.3,-3.5,-0.6,true);
  makeFlowers('el_liv_flowers',4.6,-5.3,0);
  makeMoths('el_liv_moths',-1.1,1.1,-5.3);

  [-5,-2,1,4].forEach(bx=>{ const b=BABYLON.MeshBuilder.CreateBox('lr_beam'+bx,{width:0.3,height:0.28,depth:D},scene); b.position.set(bx,H-0.16,0); const bm=mat('lr_bm'+bx); bm.diffuseColor=new BABYLON.Color3(0.16,0.08,0.04); b.material=bm; });

  // Large arched window (back wall) — moonlight
  const winM=mat('lr_winM'); winM.diffuseColor=new BABYLON.Color3(0.06,0.10,0.18); winM.emissiveColor=new BABYLON.Color3(0.08,0.14,0.24); winM.alpha=0.82;
  const winGlass=BABYLON.MeshBuilder.CreatePlane('lr_winGlass',{width:3.2,height:3.0},scene);
  winGlass.position.set(0,2.4,-D/2+0.08); winM.backFaceCulling=false; winGlass.material=winM;
  const archM=mat('lr_archM'); archM.diffuseColor=new BABYLON.Color3(0.2,0.26,0.32);
  for(let a=0;a<8;a++){ const ang=(a/7)*Math.PI; const ax=Math.cos(ang)*1.5; const ay=3.8+Math.sin(ang)*0.45; const b=BABYLON.MeshBuilder.CreateBox('lr_archB'+a,{width:0.3,height:0.4,depth:0.3},scene); b.position.set(ax,ay,-D/2+0.1); b.material=archM; }
  [[0,2.4],[-0.8,2.4],[0.8,2.4]].forEach(([mx])=>{ const m=BABYLON.MeshBuilder.CreateBox('lr_mull'+mx,{width:0.04,height:3.0,depth:0.06},scene); m.position.set(mx,2.4,-D/2+0.1); m.material=archM; });

  box('lr_windowSill',3.5,0.10,0.48,0,0.89,-5.76,joinM);
  const curtainM=mat('lr_curtainM');curtainM.diffuseColor=new BABYLON.Color3(0.22,0.32,0.31);
  const braidM=mat('lr_braidM');braidM.diffuseColor=new BABYLON.Color3(0.50,0.35,0.15);
  function curtains(n,x,z,width,front){
    const pole=cyl(n+'_pole',0.055,width+0.8,x,4.05,z,brassM);pole.rotation.z=Math.PI/2;
    for(const side of [-1,1]){
      const cx=x+side*(width/2+0.18);
      for(let i=0;i<5;i++){
        const f=ball(n+'_fold'+side+'_'+i,1,cx+(i-2)*0.12,2.03,z,curtainM,0.17,3.82,0.15);
        f.rotation.z=-side*0.035;
      }
      box(n+'_tie'+side,0.67,0.055,0.17,cx,1.6,z+(front?-0.06:0.06),braidM);
      cyl(n+'_tassel'+side,0.06,0.22,cx-side*0.23,1.45,z+(front?-0.08:0.08),braidM);
      ball(n+'_finial'+side,0.14,x+side*(width/2+0.45),4.05,z,brassM);
    }
  }
  curtains('lr_backDrapes',0,-5.65,3.2,false);
  curtains('lr_frontDrapesL',-4.2,5.66,1.35,true);
  curtains('lr_frontDrapesR',4.2,5.66,1.35,true);

  // Deep sandstone surround and open hearth on the right wall.
  const fpX=W/2-0.15, fpZ=0;
  const fpM=pbr('lr_fpM',TEX.rock_d,TEX.rock_n,1,1,new BABYLON.Color3(0.64,0.57,0.46));
  const fpDarkM=pbr('lr_fpDarkM',TEX.mstone_d,TEX.mstone_n,1,1,new BABYLON.Color3(0.48,0.43,0.36));
  box('lr_chimneyBreast',0.6,4.1,2.85,7.65,2.05,0,fpDarkM);
  const fbm=mat('lr_fbM');fbm.diffuseColor=new BABYLON.Color3(0.025,0.018,0.013);
  const fb=BABYLON.MeshBuilder.CreateBox('lr_firebox',{width:0.12,height:1.92,depth:1.95},scene);fb.position.set(7.23,1.06,0);fb.material=fbm;
  for(const z of [-1.18,1.18]){
    box('lr_fpPillar'+z,0.63,2.25,0.43,7.1,1.18,z,fpM);
    for(let row=0;row<6;row++)box('lr_fpCourse'+z+'_'+row,0.67,0.32,0.47,7.07,0.22+row*0.375,z,row%2?fpM:fpDarkM);
  }
  box('lr_fpLintel',0.69,0.42,2.8,7.08,2.4,0,fpM);
  for(const z of [-1.02,-0.52,0.52,1.02])box('lr_lintelJoint'+z,0.035,0.39,0.014,6.72,2.4,z,fpDarkM);
  box('lr_fpKeyStone',0.12,0.49,0.42,6.7,2.43,0,fpM);
  box('lr_hearthSlab',1.37,0.09,3.08,7.28,0.045,0,fpM);
  const mantel=BABYLON.MeshBuilder.CreateBox('lr_mantel',{width:0.91,height:0.15,depth:3.05},scene);mantel.position.set(7.07,2.7,0);mantel.material=joinM;
  for(let row=0;row<4;row++)for(let col=0;col<4;col++)box('lr_chimneyCourse'+row+'_'+col,0.06,0.32,0.63,7.31,2.98+row*0.37,-1.05+col*0.7,(row+col)%2?fpM:fpDarkM);
  const emberM=mat('lr_emberM');emberM.emissiveColor=new BABYLON.Color3(0.6,0.18,0.02);
  const embers=BABYLON.MeshBuilder.CreateBox('lr_embers',{width:0.55,height:0.035,depth:1.65},scene);embers.position.set(7.0,0.13,0);embers.material=emberM;
  const logM=pbr('lr_logM',TEX.beam_d,TEX.beam_n,1,1,new BABYLON.Color3(0.19,0.10,0.06));
  for(let i=0;i<3;i++){const log=cyl('lr_fireLog'+i,0.15,1.34,7.05+(i%2)*0.16,0.23+(i===2?0.12:0),-0.1,logM);log.rotation.x=Math.PI/2;log.rotation.y=(i-1)*0.18;}
  const flameM=mat('lr_fireFlameM');flameM.emissiveColor=new BABYLON.Color3(1.0,0.37,0.07);flameM.diffuseColor=new BABYLON.Color3(0.75,0.16,0.02);
  const fireFlames=[];
  for(let i=0;i<5;i++){const f=BABYLON.MeshBuilder.CreateCylinder('lr_fireFlame'+i,{diameterTop:0,diameterBottom:0.16,height:0.42+(i%3)*0.13,tessellation:7},scene);f.position.set(6.96,0.50+(i%3)*0.045,-0.58+i*0.29);f.material=flameM;f.isPickable=false;fireFlames.push(f);}
  const mirrorM=mat('lr_mirrorM');mirrorM.diffuseColor=new BABYLON.Color3(0.14,0.18,0.19);mirrorM.emissiveColor=new BABYLON.Color3(0.025,0.035,0.04);mirrorM.specularColor=new BABYLON.Color3(0.26,0.24,0.17);
  ball('lr_mantelMirrorFrame',1,7.21,3.4,0,brassM,0.11,1.10,1.63);
  ball('lr_mantelMirrorGlass',1,7.14,3.4,0,mirrorM,0.04,0.94,1.45);
  for(const z of [-1.17,1.17]){
    cyl('lr_mantelCandleFoot'+z,0.17,0.045,7.0,2.80,z,brassM);cyl('lr_mantelCandleStem'+z,0.055,0.25,7.0,2.94,z,brassM);
    const waxM=mat('lr_candleWaxM'+z);waxM.diffuseColor=new BABYLON.Color3(0.75,0.63,0.45);
    cyl('lr_mantelCandle'+z,0.075,0.26,7.0,3.15,z,waxM);ball('lr_mantelCandleFlame'+z,0.065,7.0,3.31,z,emitM('lr_candleFire'+z,1,0.56,0.16,1),0.7,1.7,0.7);
  }

  // A rolled-arm, button-tufted oxblood sofa, turned into the room.
  const couchM=mat('lr_couchM'); couchM.diffuseColor=new BABYLON.Color3(0.37,0.15,0.12); couchM.specularColor=new BABYLON.Color3(0.12,0.07,0.05); couchM.specularPower=18;
  const weltM=mat('lr_weltM'); weltM.diffuseColor=new BABYLON.Color3(0.20,0.085,0.06);
  const sofaRoot=new BABYLON.TransformNode('lr_sofaRoot',scene);sofaRoot.position.set(-6.35,0,0.75);sofaRoot.rotation.y=Math.PI/2;
  function sofaPart(m){m.parent=sofaRoot;return m;}
  sofaPart(box('lr_couch',3.1,0.34,1.24,0,0.43,0,couchM));
  sofaPart(ball('lr_couchBack',1,0,1.0,-0.51,couchM,3.08,1.13,0.38));
  for(const x of [-1.41,1.41]){
    sofaPart(ball('lr_sofaArm'+x,1,x,0.77,0,couchM,0.40,0.68,1.36));
    sofaPart(ball('lr_armRoll'+x,1,x,1.00,0,couchM,0.41,0.32,1.36));
  }
  for(let i=0;i<3;i++)sofaPart(ball('lr_sofaCushion'+i,1,-0.86+i*0.86,0.66,0.08,couchM,0.83,0.22,0.95));
  for(const x of [-1.13,1.13])for(const z of [-0.43,0.43])sofaPart(cyl('lr_sofaFoot'+x+'_'+z,0.11,0.25,x,0.125,z,joinM));
  for(let row=0;row<2;row++)for(let col=0;col<7;col++)sofaPart(ball('lr_tuft'+row+'_'+col,0.055,-1.13+col*0.375,0.91+row*0.28,-0.33,weltM));
  const pillowM=mat('lr_pillowM');pillowM.diffuseColor=new BABYLON.Color3(0.42,0.32,0.16);
  const pillow=sofaPart(ball('lr_sofaPillow',1,-0.84,0.94,-0.16,pillowM,0.48,0.48,0.18));pillow.rotation.z=-0.25;

  // An ornate low rug anchors the seating, leaving the centered camera and exits clear.
  const rugTex=new BABYLON.DynamicTexture('lr_rugTex',{width:512,height:512},scene,false);
  const rc=rugTex.getContext();rc.fillStyle='#703e37';rc.fillRect(0,0,512,512);
  rc.strokeStyle='#b09362';rc.lineWidth=10;rc.strokeRect(15,15,482,482);rc.lineWidth=3;rc.strokeRect(34,34,444,444);
  rc.strokeStyle='#3b3430';rc.lineWidth=14;rc.strokeRect(48,48,416,416);
  for(let i=0;i<16;i++){const q=65+i*25;rc.fillStyle=i%2?'#b19466':'#948071';rc.fillRect(q,22,8,8);rc.fillRect(q,482,8,8);rc.fillRect(22,q,8,8);rc.fillRect(482,q,8,8);}
  rc.save();rc.translate(256,256);rc.rotate(Math.PI/4);rc.fillStyle='#303e40';rc.fillRect(-105,-105,210,210);rc.strokeStyle='#b79a67';rc.lineWidth=6;rc.strokeRect(-105,-105,210,210);rc.fillStyle='#a57c53';rc.fillRect(-56,-56,112,112);rc.restore();
  for(let y=90;y<440;y+=65)for(let x=90;x<440;x+=65){if(Math.hypot(x-256,y-256)<130)continue;rc.beginPath();rc.moveTo(x,y-11);rc.lineTo(x+8,y);rc.lineTo(x,y+11);rc.lineTo(x-8,y);rc.closePath();rc.fillStyle='#ba9663';rc.fill();}
  rugTex.update();const rugM=mat('lr_rugM');rugM.diffuseTexture=rugTex;rugM.specularColor=new BABYLON.Color3(0,0,0);
  const rug=BABYLON.MeshBuilder.CreateGround('lr_parlourRug',{width:4.9,height:4.3},scene);rug.position.set(-4.8,0.017,0.65);rug.material=rugM;rug.isPickable=false;

  // Tea table beside the sofa, not through the player's centered viewpoint.
  const tabletop=BABYLON.MeshBuilder.CreateCylinder('lr_table',{diameter:1.25,height:0.085,tessellation:32},scene);tabletop.position.set(-3.85,0.74,0.9);tabletop.material=woodM;
  cyl('lr_tableApron',1.1,0.17,-3.85,0.62,0.9,joinM);
  for(const x of [-4.23,-3.47])for(const z of [0.52,1.28])cyl('lr_tableLeg'+x+'_'+z,0.08,0.59,x,0.295,z,joinM);
  const chinaM=mat('lr_chinaM');chinaM.diffuseColor=new BABYLON.Color3(0.82,0.76,0.62);
  cyl('lr_teaSaucer',0.23,0.018,-3.54,0.795,0.87,chinaM);
  cyl('lr_teaCup',0.13,0.14,-3.54,0.87,0.87,chinaM);
  const cupHandle=BABYLON.MeshBuilder.CreateTorus('lr_cupHandle',{diameter:0.12,thickness:0.023,tessellation:12},scene);cupHandle.position.set(-3.46,0.87,0.87);cupHandle.rotation.x=Math.PI/2;cupHandle.material=chinaM;cupHandle.isPickable=false;
  ball('lr_teaPot',0.29,-4.08,0.91,0.9,chinaM,1,0.82,1);cyl('lr_teaLid',0.17,0.025,-4.08,1.03,0.9,brassM);
  const spout=cyl('lr_teaSpout',0.048,0.20,-3.91,0.95,0.9,chinaM);spout.rotation.z=-0.86;

  // Crystal ball (glowing)
  const cbM=mat('lr_cbM'); cbM.diffuseColor=new BABYLON.Color3(0.08,0.12,0.2); cbM.emissiveColor=new BABYLON.Color3(0.06,0.1,0.18); cbM.specularColor=new BABYLON.Color3(0.3,0.4,0.6); cbM.specularPower=64; cbM.alpha=0.7;
  const crystalBall=BABYLON.MeshBuilder.CreateSphere('lr_crystalBall',{diameter:0.45,segments:16},scene);
  crystalBall.position.set(-W/2+3.5,1.18,-2); crystalBall.material=cbM;

  cyl('lr_orbPedestal',0.18,0.64,-4.5,0.32,-2,joinM);
  cyl('lr_orbFoot',0.6,0.08,-4.5,0.04,-2,joinM);
  cyl('lr_orbTray',0.65,0.07,-4.5,0.85,-2,joinM);
  const orbCradle=BABYLON.MeshBuilder.CreateTorus('lr_orbCradle',{diameter:0.3,thickness:0.055,tessellation:16},scene);orbCradle.position.set(-4.5,0.93,-2);orbCradle.material=brassM;orbCradle.isPickable=false;

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
  const fireLight=new BABYLON.PointLight('lr_fireL',new BABYLON.Vector3(6.5,0.85,fpZ),scene);
  fireLight.diffuse=new BABYLON.Color3(1.0,0.5,0.15); fireLight.intensity=2.5; fireLight.range=14;
  const cbLight=new BABYLON.PointLight('lr_cbL',new BABYLON.Vector3(-W/2+3.5,1.45,-2),scene);
  cbLight.diffuse=new BABYLON.Color3(0.1,0.2,0.5); cbLight.intensity=0.6; cbLight.range=5;
  const ambient=new BABYLON.HemisphericLight('lr_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.68; ambient.diffuse=new BABYLON.Color3(0.65,0.57,0.48); ambient.groundColor=new BABYLON.Color3(0.15,0.08,0.06);
  const chanLight=new BABYLON.PointLight('lr_chanL',new BABYLON.Vector3(0,chanY-0.5,0),scene);
  chanLight.diffuse=new BABYLON.Color3(0.6,0.5,0.3); chanLight.intensity=1.0; chanLight.range=12;

  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    fireFlames.forEach((f,i)=>{f.scaling.y=0.88+Math.sin(ft*(4.1+i*0.6)+i*1.8)*0.15;f.scaling.x=0.9+Math.sin(ft*(3.3+i*0.3)+i)*0.10;});
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

  buildDoor('door_entrance', 0, D/2, Math.PI, 1.34, 2.38);
  buildDoor('door_kitchen', W/2, -3, -Math.PI/2, 1.34, 2.38);
}

// ─── KITCHEN ──────────────────────────────────────────────────────────────────
