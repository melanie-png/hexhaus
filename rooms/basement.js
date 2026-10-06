function buildBasement(){
  const W=14, D=12, H=4.0;
  const wallM = pbr('bs_wallM', TEX.rock_d, TEX.rock_n, 3, 2, new BABYLON.Color3(0.15,0.12,0.14));
  const floorM = pbr('bs_floorM', TEX.wood_d, TEX.wood_n, 4, 3, new BABYLON.Color3(0.15,0.1,0.06));
  const ceilM = pbr('bs_ceilM', TEX.stone_d, TEX.stone_n, 3, 2, new BABYLON.Color3(0.1,0.08,0.1));

  const floor=BABYLON.MeshBuilder.CreateGround('bs_floor',{width:W,height:D,subdivisions:4},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('bs_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function bsWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  bsWall('bs_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); bsWall('bs_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); bsWall('bs_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
  doorwayWall('bs_wF',W,H,0,D/2,Math.PI,wallM,[{dx:0,dz:D/2,dw:1.3,dh:2.3}]);

  // Domed leaded window
  const winM=mat('bs_winM'); winM.diffuseColor=new BABYLON.Color3(0.04,0.1,0.06); winM.emissiveColor=new BABYLON.Color3(0.06,0.16,0.08); winM.alpha=0.82;
  const win=BABYLON.MeshBuilder.CreatePlane('bs_win',{width:2.0,height:2.5},scene); win.position.set(0,2.5,-D/2+0.08); win.material=winM;
  const archM=mat('bs_archM'); archM.diffuseColor=new BABYLON.Color3(0.12,0.14,0.12);
  for(let a=0;a<7;a++){ const ang=(a/6)*Math.PI; const ax=Math.cos(ang)*0.9; const ay=3.75+Math.sin(ang)*0.4; const b=BABYLON.MeshBuilder.CreateBox('bs_arch'+a,{width:0.25,height:0.35,depth:0.3},scene); b.position.set(ax,ay,-D/2+0.1); b.material=archM; }

  // ─── THE GREAT CAULDRON — ritual chamber centrepiece ───
  const CXC=0, CZC=-2.6;                       // cauldron centre
  const ironM=pbr('bs_ironM',TEX.rock_d,TEX.rock_n,2,2,new BABYLON.Color3(0.09,0.09,0.11)); ironM.specularColor=new BABYLON.Color3(0.25,0.25,0.28); ironM.specularPower=48;
  // Bulbous body
  const body=BABYLON.MeshBuilder.CreateSphere('bs_greatcauldron',{diameter:2.6,segments:20},scene); body.scaling.y=0.82; body.position.set(CXC,1.45,CZC); body.material=ironM;
  // Heavy rim
  const rim=BABYLON.MeshBuilder.CreateTorus('bs_gcrim',{diameter:1.98,thickness:0.14,tessellation:28},scene); rim.position.set(CXC,2.38,CZC); rim.material=ironM;
  // Belly bands
  for(let bI=0;bI<2;bI++){ const band=BABYLON.MeshBuilder.CreateTorus('bs_gband'+bI,{diameter:2.35-bI*0.35,thickness:0.05,tessellation:24},scene); band.position.set(CXC,1.15-bI*0.55,CZC); band.material=ironM; }
  // Tripod legs (quaternion tilt, deterministic)
  for(let l=0;l<3;l++){ const la=l/3*Math.PI*2+0.5; const fx=Math.cos(la)*1.3, fz=Math.sin(la)*1.3;
    const leg=BABYLON.MeshBuilder.CreateCylinder('bs_gleg'+l,{diameter:0.13,height:2.5,tessellation:10},scene);
    leg.position.set(CXC+fx*0.55,1.2,CZC+fz*0.55);
    const up=new BABYLON.Vector3(0,1,0); const dir=new BABYLON.Vector3(fx*0.45,2.4,fz*0.45).normalize();
    const axis=BABYLON.Vector3.Cross(up,dir); const ang=Math.acos(Math.min(1,Math.max(-1,BABYLON.Vector3.Dot(up,dir))));
    leg.rotationQuaternion=BABYLON.Quaternion.RotationAxis(axis.normalize(),ang);
    leg.material=ironM; }
  // Brew surface + bubbles
  const brewM=emitM('bs_brewM',0.10,0.42,0.16,0.9);
  const brew=BABYLON.MeshBuilder.CreateDisc('bs_brew',{radius:0.86,tessellation:28},scene); brew.rotation.x=Math.PI/2; brew.position.set(CXC,2.42,CZC); brew.material=brewM;
  const bubM=emitM('bs_bubM',0.2,0.65,0.25,1.0);
  const bubbles=[];
  for(let bI=0;bI<3;bI++){ const bub=BABYLON.MeshBuilder.CreateSphere('bs_bub'+bI,{diameter:0.11,segments:8},scene); bub.material=bubM; bubbles.push(bub); }
  // Fire beneath
  const flameM=emitM('bs_gflameM',0.8,0.32,0.06,0.85);
  const flames=[];
  for(let f=0;f<3;f++){ const fa=f/3*Math.PI*2+1.0; const fl=BABYLON.MeshBuilder.CreateCylinder('bs_gfire'+f,{diameterTop:0.02,diameterBottom:0.26,height:0.55,tessellation:8},scene);
    fl.position.set(CXC+Math.cos(fa)*0.5,0.3,CZC+Math.sin(fa)*0.5); fl.material=flameM; flames.push(fl); }
  const emberM=emitM('bs_emberM',0.5,0.15,0.03,0.6);
  const ember=BABYLON.MeshBuilder.CreateDisc('bs_gember',{radius:0.75,tessellation:20},scene); ember.rotation.x=Math.PI/2; ember.position.set(CXC,0.02,CZC); ember.material=emberM;
  // Ladle leaning on the rim
  const ladleM=pbr('bs_ladleM',TEX.darkwood_d,TEX.darkwood_n,1,1,new BABYLON.Color3(0.2,0.14,0.08));
  const ladle=BABYLON.MeshBuilder.CreateCylinder('bs_ladle',{diameter:0.05,height:1.5,tessellation:8},scene); ladle.position.set(CXC+1.15,2.0,CZC+0.55); ladle.rotation.z=0.85; ladle.rotation.x=0.25; ladle.material=ladleM;
  const lcup=BABYLON.MeshBuilder.CreateSphere('bs_ladlecup',{diameter:0.2,segments:8},scene); lcup.position.set(CXC+1.68,2.72,CZC+0.85); lcup.scaling.y=0.6; lcup.material=ironM;

  // ─── Ritual circle around the cauldron ───
  const chalkM=mat('bs_chalkM'); chalkM.diffuseColor=new BABYLON.Color3(0.35,0.33,0.30); chalkM.emissiveColor=new BABYLON.Color3(0.12,0.11,0.10);
  const ring=BABYLON.MeshBuilder.CreateTorus('bs_pent',{diameter:3.9,thickness:0.055,tessellation:40},scene); ring.position.set(CXC,0.015,CZC); ring.material=chalkM;
  for(let t=0;t<8;t++){ const ta=t/8*Math.PI*2; const tick=BABYLON.MeshBuilder.CreateBox('bs_rtick'+t,{width:0.14,height:0.02,depth:0.06},scene); tick.position.set(CXC+Math.cos(ta)*1.95,0.02,CZC+Math.sin(ta)*1.95); tick.rotation.y=-ta; tick.material=chalkM; }
  // Pentagram star inside the ring
  const lineM=emitM('bs_lineM',0.4,0.05,0.02,0.5);
  for(let i=0;i<5;i++){ const a1=i/5*Math.PI*2-Math.PI/2; const a2=(i+2)/5*Math.PI*2-Math.PI/2; const r=1.65;
    const x1=Math.cos(a1)*r, z1=Math.sin(a1)*r, x2=Math.cos(a2)*r, z2=Math.sin(a2)*r;
    const lx=(x1+x2)/2, lz=(z1+z2)/2; const len=Math.sqrt((x2-x1)**2+(z2-z1)**2); const ang=Math.atan2(z2-z1,x2-x1);
    const line=BABYLON.MeshBuilder.CreateBox('bs_pline'+i,{width:len,height:0.02,depth:0.045},scene); line.position.set(CXC+lx,0.03,CZC+lz); line.rotation.y=-ang; line.material=lineM; }
  // Candle ring on the chalk line
  const waxM=mat('bs_waxM'); waxM.diffuseColor=new BABYLON.Color3(0.82,0.78,0.68);
  const tipM=emitM('bs_tipM',1.0,0.62,0.22,0.95);
  for(let c=0;c<10;c++){ const ca=c/10*Math.PI*2+0.31; const cx=CXC+Math.cos(ca)*1.95, cz=CZC+Math.sin(ca)*1.95;
    const hgt=0.12+((c*37)%5)*0.02; const cnd=BABYLON.MeshBuilder.CreateCylinder('bs_candle'+c,{diameter:0.07,height:hgt,tessellation:8},scene); cnd.position.set(cx,hgt/2+0.01,cz); cnd.material=waxM;
    if(c===3||c===7){ cnd.rotation.z=0.9; cnd.position.y=0.05; }
    else { const tip=BABYLON.MeshBuilder.CreateSphere('bs_ctip'+c,{diameter:0.05,segments:6},scene); tip.position.set(cx,hgt+0.02,cz); tip.material=tipM; } }

  // ─── Grimoire lectern, facing the circle ───
  const lectM=pbr('bs_lectM',TEX.darkwood_d,TEX.darkwood_n,1,1,new BABYLON.Color3(0.16,0.11,0.07));
  [[-0.28,-0.2],[0.28,-0.2],[-0.28,0.2],[0.28,0.2]].forEach(([lx,lz],li)=>{ const legb=BABYLON.MeshBuilder.CreateBox('bs_lleg'+li,{width:0.07,height:1.05,depth:0.07},scene); legb.position.set(3.4+lx,0.52,0.9+lz); legb.material=lectM; });
  const slant=BABYLON.MeshBuilder.CreateBox('bs_ltop',{width:0.85,height:0.06,depth:0.65},scene); slant.position.set(3.4,1.13,0.9); slant.rotation.x=-0.42; slant.material=lectM;
  const pageM=mat('bs_pageM'); pageM.diffuseColor=new BABYLON.Color3(0.45,0.42,0.36); pageM.emissiveColor=new BABYLON.Color3(0.16,0.15,0.12);
  const pgL=BABYLON.MeshBuilder.CreateBox('bs_gpageL',{width:0.4,height:0.02,depth:0.55},scene); pgL.position.set(3.19,1.19,0.9); pgL.rotation.x=-0.42; pgL.rotation.y=0.10; pgL.material=pageM;
  const pgR=BABYLON.MeshBuilder.CreateBox('bs_gpageR',{width:0.4,height:0.02,depth:0.55},scene); pgR.position.set(3.61,1.19,0.9); pgR.rotation.x=-0.42; pgR.rotation.y=-0.10; pgR.material=pageM;
  const runeM=emitM('bs_runeM',0.5,0.12,0.4,0.7);
  for(let r=0;r<4;r++){ const rune=BABYLON.MeshBuilder.CreateBox('bs_rune'+r,{width:0.05,height:0.015,depth:0.05},scene); rune.position.set(3.02+r*0.25,1.235,0.78+((r%2)*0.1)); rune.material=runeM; }
  const grimoire=pgR; grimoire.name='bs_grimoire'; pgL.name='bs_grimoireL';

  // ─── Bone heap + skull, east wall ───
  const boneM=mat('bs_boneM'); boneM.diffuseColor=new BABYLON.Color3(0.4,0.35,0.25);
  [[6.15,-1.3,0.3],[6.4,-1.75,0.5],[5.95,-2.0,0.15],[6.35,-2.4,0.4],[6.1,-1.05,0.55]].forEach(([hx,hz,hy],hi)=>{ const bnh=BABYLON.MeshBuilder.CreateCylinder('bs_heapBone'+hi,{diameterTop:0.025,diameterBottom:0.04,height:0.35,tessellation:6},scene); bnh.position.set(hx,hy,hz); bhn_fix(bnh); bnh.material=boneM; });
  function bhn_fix(m){ m.rotation.set(1.2+Math.random()*0.4,Math.random()*Math.PI,0.5+Math.random()*0.6); }
  const skull=BABYLON.MeshBuilder.CreateSphere('bs_skull',{diameter:0.26,segments:10},scene); skull.position.set(6.28,0.62,-1.7); skull.scaling.y=0.85; skull.material=boneM;
  const jaw=BABYLON.MeshBuilder.CreateBox('bs_skulljaw',{width:0.16,height:0.06,depth:0.12},scene); jaw.position.set(6.28,0.49,-1.6); jaw.material=boneM;
  const eyeM=emitM('bs_skulleyeM',0.55,0.1,0.05,0.6);
  [[6.36,0.63,-1.63],[6.22,0.63,-1.63]].forEach(([ex,ey,ez],ei)=>{ const socket=BABYLON.MeshBuilder.CreateSphere('bs_skulleye'+ei,{diameter:0.05,segments:6},scene); socket.position.set(ex,ey,ez); socket.material=eyeM; });

  // ─── Specimen jars by the nook ───
  const jarGlassM=mat('bs_jglassM'); jarGlassM.diffuseColor=new BABYLON.Color3(0.1,0.14,0.10); jarGlassM.emissiveColor=new BABYLON.Color3(0.05,0.1,0.05); jarGlassM.alpha=0.55;
  const floatM=emitM('bs_jfloatM',0.45,0.55,0.15,0.8);
  [[-6.35,-0.9],[-6.35,-1.35],[-6.9,-0.65]].forEach(([jx,jz],ji)=>{ const jar=BABYLON.MeshBuilder.CreateCylinder('bs_specjar'+ji,{diameterTop:0.15,diameterBottom:0.17,height:0.3,tessellation:10},scene); jar.position.set(jx,0.15,jz); jar.material=jarGlassM;
    const spec=BABYLON.MeshBuilder.CreateSphere('bs_specobj'+ji,{diameter:0.09,segments:8},scene); spec.position.set(jx,0.17+ji*0.04,jz); spec.material=floatM; });

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

  // Workbench with mortar & pestle, pouch, candle
  const benchM=pbr('bs_benchM',TEX.darkwood_d,TEX.darkwood_n,2,1,new BABYLON.Color3(0.25,0.18,0.1));
  const bench=BABYLON.MeshBuilder.CreateBox('bs_bench',{width:2.5,height:0.9,depth:1.0},scene); bench.position.set(3.6,0.45,-3); bench.material=benchM;
  const mortar=BABYLON.MeshBuilder.CreateCylinder('bs_mortar',{diameterTop:0.16,diameterBottom:0.1,height:0.14,tessellation:10},scene); mortar.position.set(3.0,0.97,-2.8); mortar.material=ironM;
  const pestle=BABYLON.MeshBuilder.CreateCylinder('bs_pestle',{diameterTop:0.02,diameterBottom:0.035,height:0.2,tessellation:6},scene); pestle.position.set(3.02,1.1,-2.75); pestle.rotation.z=0.4; pestle.material=stoneMat();
  function stoneMat(){ const s=mat('bs_stoneM'); s.diffuseColor=new BABYLON.Color3(0.35,0.34,0.3); return s; }
  const pouch=BABYLON.MeshBuilder.CreateSphere('bs_pouch',{diameter:0.22,segments:8},scene); pouch.position.set(4.1,0.97,-3.2); pouch.scaling.y=0.7; const pm=mat('bs_pouchM'); pm.diffuseColor=new BABYLON.Color3(0.16,0.1,0.06); pouch.material=pm;
  const bCandle=BABYLON.MeshBuilder.CreateCylinder('bs_bcandle',{diameter:0.06,height:0.18,tessellation:8},scene); bCandle.position.set(4.5,0.99,-2.7); bCandle.material=waxM;
  const bTip=BABYLON.MeshBuilder.CreateSphere('bs_bctip',{diameter:0.04,segments:6},scene); bTip.position.set(4.5,1.1,-2.7); bTip.material=tipM;

  // Scattered approach bones
  [[1,2.5],[2,3],[1.5,2],[0.5,3.5]].forEach(([bx,bz])=>{ const bone=BABYLON.MeshBuilder.CreateCylinder('bs_bone',{diameterTop:0.02,diameterBottom:0.03,height:0.2,tessellation:6},scene); bone.position.set(bx,0.02,bz); bone.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI); const bm=mat('bs_boneM'); bm.diffuseColor=new BABYLON.Color3(0.4,0.35,0.25); bone.material=bm; });

  // Crates
  // ── house elements ──
  makeWeb('el_bs_web1',-6.7,3.55,-5.6,0,1.05);
  makeWeb('el_bs_web2',6.7,3.55,5.6,Math.PI,1.05);
  makeCauldron('el_bs_cauldron',-3.0,0.5);
  makeSigils('el_bs_sigils',3.2,2.2,1.05);
  makeDrip('el_bs_bucket',5.5,4.6,6,4.0);

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
  const fireLight=new BABYLON.PointLight('bs_pL',new BABYLON.Vector3(CXC,0.5,CZC),scene);
  fireLight.diffuse=new BABYLON.Color3(0.6,0.16,0.03); fireLight.intensity=1.1; fireLight.range=6;
  const brewLight=new BABYLON.PointLight('bs_brewL',new BABYLON.Vector3(CXC,2.7,CZC),scene);
  brewLight.diffuse=new BABYLON.Color3(0.25,0.75,0.28); brewLight.intensity=1.0; brewLight.range=10;
  const lampLight=new BABYLON.PointLight('bs_lL',new BABYLON.Vector3(3.6,1.5,-3),scene);
  lampLight.diffuse=new BABYLON.Color3(0.7,0.4,0.1); lampLight.intensity=1.5; lampLight.range=10;
  const ambient=new BABYLON.HemisphericLight('bs_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.2; ambient.diffuse=new BABYLON.Color3(0.1,0.15,0.12); ambient.groundColor=new BABYLON.Color3(0.08,0.03,0.02);

  let ft=0;
  function flk(base,amp,sp,off){ return base+amp*(Math.sin(ft*sp+off)*0.5+Math.sin(ft*sp*2.3+off*1.7)*0.3+Math.sin(ft*sp*0.41+off*0.9)*0.2); }
  scene.registerBeforeRender(()=>{
    ft+=engine.getDeltaTime()*0.001;
    stillLight.intensity=flk(1.0,0.2,1.8,0.5);
    fireLight.intensity=flk(1.1,0.3,3.2,1.5);
    brewLight.intensity=flk(1.0,0.25,0.9,2.5);
    lampLight.intensity=flk(1.5,0.2,2.1,2.0);
    if(heat) heat.material.emissiveColor=new BABYLON.Color3(flk(0.8,0.2,4,0),flk(0.3,0.1,4,1),0.02);
    // brew glow pulse
    brewM.emissiveColor=new BABYLON.Color3(flk(0.10,0.03,0.8,0.3),flk(0.42,0.08,0.8,0.3),flk(0.16,0.03,0.8,0.3));
    bubbles.forEach((bub,bI)=>{ const ba=ft*0.7+bI*2.1; const br=0.45+0.25*Math.sin(bI*2.4);
      bub.position.set(CXC+Math.cos(ba)*br, 2.42+0.06*Math.abs(Math.sin(ba*1.7)), CZC+Math.sin(ba)*br);
      bub.scaling.setAll(0.7+0.5*Math.abs(Math.sin(ba*1.7))); });
    flames.forEach((fl,fI)=>{ const s=0.85+0.25*Math.sin(ft*5.5+fI*2.0)+0.1*Math.sin(ft*9.1+fI); fl.scaling.x=s; fl.scaling.z=s; fl.scaling.y=0.9+0.2*Math.sin(ft*4.2+fI*1.3); });
  });

  interactables.set('bs_flask','still'); interactables.set('bs_bulb','still'); interactables.set('bs_tube','still');
  interactables.set('bs_greatcauldron','greatcauldron'); interactables.set('bs_gcrim','greatcauldron'); interactables.set('bs_brew','greatcauldron'); interactables.set('bs_gleg0','greatcauldron');
  interactables.set('bs_pent','pentagram'); interactables.set('bs_pline0','pentagram');
  interactables.set('bs_bone','bones'); interactables.set('bs_skull','bones');
  for(let hb=0;hb<5;hb++) interactables.set('bs_heapBone'+hb,'bones');
  interactables.set('bs_grimoire','grimoire'); interactables.set('bs_grimoireL','grimoire');
  interactables.set('bs_specjar0','specimens'); interactables.set('bs_specjar1','specimens'); interactables.set('bs_specjar2','specimens');
  interactables.set('bs_bench','bsworkbench');

  buildDoor('door_pantry', 0, D/2, Math.PI, 1.14, 2.18);
  makeRoomSwitch('basement', 1.0, 1.4, D/2-0.06, Math.PI);
  interactables.set('door_pantry','door_pantry');
}

// ─── ATTIC ────────────────────────────────────────────────────────────────────
