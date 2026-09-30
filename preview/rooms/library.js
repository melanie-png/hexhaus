function buildLibrary(){
  const W=16, D=14, H=5.0;
  const wallM = pbr('lib_wallM', TEX.plaster_d, TEX.plaster_n, 3, 2, new BABYLON.Color3(0.26,0.22,0.28));
  const floorM = pbr('lib_floorM', TEX.wood_d, TEX.wood_n, 4, 4, new BABYLON.Color3(0.3,0.22,0.14));
  const ceilM = pbr('lib_ceilM', TEX.beam_d, TEX.beam_n, 4, 3, new BABYLON.Color3(0.14,0.09,0.05));
  const woodM = pbr('lib_woodM', TEX.darkwood_d, TEX.darkwood_n, 3, 2, new BABYLON.Color3(0.28,0.2,0.1));
  const walnutM = pbr('lib_walnutM', TEX.darkwood_d, TEX.darkwood_n, 2, 2, new BABYLON.Color3(0.22,0.14,0.08));
  const oakM = pbr('lib_oakM', TEX.wood_d, TEX.wood_n, 2, 2, new BABYLON.Color3(0.35,0.24,0.14));

  const floor=BABYLON.MeshBuilder.CreateGround('lib_floor',{width:W,height:D,subdivisions:4},scene); floor.material=floorM; floor.receiveShadows=true;
  const ceil=BABYLON.MeshBuilder.CreatePlane('lib_ceil',{width:W,height:D},scene); ceil.position.y=H; ceil.rotation.x=Math.PI/2; ceilM.backFaceCulling=false; ceil.material=ceilM;
  function libWall(n,w,h,pos,ry){ const m=BABYLON.MeshBuilder.CreatePlane(n,{width:w,height:h},scene); m.position.copyFrom(pos); m.rotation.y=ry; const wm=wallM.clone(n+'_m'); wm.backFaceCulling=false; m.material=wm; }
  libWall('lib_wB',W,H,new BABYLON.Vector3(0,H/2,-D/2),0); libWall('lib_wL',D,H,new BABYLON.Vector3(-W/2,H/2,0),Math.PI/2); libWall('lib_wR',D,H,new BABYLON.Vector3(W/2,H/2,0),-Math.PI/2);
  doorwayWall('lib_wF',W,H,0,D/2,Math.PI,wallM,[{dx:0,dz:D/2,dw:2.0,dh:2.9}]);
  makeStairs('door_entrance', 0, D/2, Math.PI, {mode:'up', steps:5, rise:0.18, run:0.32, width:1.9});   // back up to the entrance hall
  makeWindow('win_libR1', W/2, 3.2, 3.5, -Math.PI/2);
  makeWindow('win_libB1', 4.8, 3.3, -D/2, 0);

  // ── house elements ──
  makeWeb('el_lib_web1',-7.6,4.35,6.4,0,1.05);
  makeWeb('el_lib_web2',7.5,4.35,-6.5,0,1.05);
  makeDust('el_lib_dust',4.8,2.7,-6.0);
  makeSheet('el_lib_sheet',-6.5,5.8,0.7,true);
  makeDollhouse('el_lib_doll',6.6,5.2,-2.5);
  [-6,-3,0,3,6].forEach(bx=>{ const b=BABYLON.MeshBuilder.CreateBox('lib_beam'+bx,{width:0.3,height:0.28,depth:D},scene); b.position.set(bx,H-0.16,0); const bm=mat('lib_bm'+bx); bm.diffuseColor=new BABYLON.Color3(0.16,0.08,0.04); b.material=bm; });

  // ── Renovated Display Cases with Skulls (believable framed open glass cases) ──
  // Original mesh names retained: lib_dc0..4, lib_dg0..4, lib_skull0..4
  const glassM=mat('lib_glassM'); glassM.diffuseColor=new BABYLON.Color3(0.08,0.12,0.15); glassM.alpha=0.25; glassM.specularColor=new BABYLON.Color3(0.8,0.8,0.8);
  const skullM=mat('lib_skullM'); skullM.diffuseColor=new BABYLON.Color3(0.65,0.60,0.50); skullM.specularColor=new BABYLON.Color3(0.05,0.05,0.05);
  const brassM=mat('lib_brassM'); brassM.diffuseColor=new BABYLON.Color3(0.65,0.50,0.20); brassM.specularColor=new BABYLON.Color3(0.8,0.7,0.3);
  const dcXs=[-6.5, -1.5, 0, 1.5, 6.5];
  glassM.backFaceCulling=false;

  for(let dc=0;dc<5;dc++){ const dx=dcXs[dc];
    // Open framed cabinet structure
    const caseBox=BABYLON.MeshBuilder.CreateBox('lib_dc'+dc,{width:0.95,height:1.9,depth:0.035},scene);
    caseBox.position.set(dx,0.95,-D/2+0.07); caseBox.material=walnutM;
    for(const side of [-1,1]){
      const edge=BABYLON.MeshBuilder.CreateBox('lib_caseSide'+dc+'_'+side,{width:0.05,height:1.9,depth:0.44},scene);
      edge.position.set(dx+side*0.45,0.95,-D/2+0.28);edge.material=walnutM;edge.isPickable=false;
    }
    for(const yy of [0.045,1.94]){
      const edge=BABYLON.MeshBuilder.CreateBox('lib_caseCap'+dc+'_'+yy,{width:1.0,height:0.08,depth:0.46},scene);
      edge.position.set(dx,yy,-D/2+0.28);edge.material=walnutM;edge.isPickable=false;
    }
    
    // Internal shelf
    const intShelf=BABYLON.MeshBuilder.CreateBox('lib_dcshelf'+dc,{width:0.87,height:0.04,depth:0.36},scene);
    intShelf.position.set(dx,0.90,-D/2+0.25); intShelf.material=walnutM; intShelf.isPickable=false;

    // Front clear glass panel
    const glass=BABYLON.MeshBuilder.CreatePlane('lib_dg'+dc,{width:0.85,height:1.8},scene);
    glass.position.set(dx,0.95,-D/2+0.46); glass.material=glassM;

    // Brass corner trim
    for(const sx of [-0.44, 0.44]){
      const trim=BABYLON.MeshBuilder.CreateBox('lib_dctrim'+dc+'_'+(sx<0?'L':'R'),{width:0.04,height:1.88,depth:0.04},scene);
      trim.position.set(dx+sx,0.95,-D/2+0.46); trim.material=brassM; trim.isPickable=false;
    }

    // Skull resting visibly inside on shelf
    const skull=BABYLON.MeshBuilder.CreateSphere('lib_skull'+dc,{diameter:0.22,segments:8},scene);
    skull.position.set(dx,1.05,-D/2+0.32); skull.scaling.set(0.9,1.15,1.05); skull.material=skullM;
  }

  // ── Tall Walnut Bookcases (Back wall flanking central portrait & West wall north end) ──
  const shelfPalette=[[0.28,0.08,0.06],[0.10,0.12,0.22],[0.08,0.18,0.10],[0.32,0.22,0.08],[0.20,0.10,0.18],[0.12,0.15,0.14],[0.22,0.14,0.08]];
  
  const shelfBookM=shelfPalette.map((col,i)=>{const m=mat('lib_bookLeather'+i);m.diffuseColor=new BABYLON.Color3(...col).scale(1.6);m.emissiveColor=new BABYLON.Color3(...col).scale(0.08);return m;});
  function buildBookcase(prefix, x, y, z, width, height, depth, rotY, isWest=false){
    const node=new BABYLON.TransformNode(prefix+'_node',scene);
    node.position.set(x,y,z); node.rotation.y=rotY;
    
    // Carcass frame
    const back=BABYLON.MeshBuilder.CreateBox(prefix+'_back',{width:width,height:height,depth:0.05},scene);
    back.parent=node; back.position.set(0,height/2,0); back.material=walnutM; back.isPickable=false;
    const sideL=BABYLON.MeshBuilder.CreateBox(prefix+'_sideL',{width:0.06,height:height,depth:depth},scene);
    sideL.parent=node; sideL.position.set(-width/2+0.03,height/2,depth/2); sideL.material=walnutM; sideL.isPickable=false;
    const sideR=BABYLON.MeshBuilder.CreateBox(prefix+'_sideR',{width:0.06,height:height,depth:depth},scene);
    sideR.parent=node; sideR.position.set(width/2-0.03,height/2,depth/2); sideR.material=walnutM; sideR.isPickable=false;
    const topCap=BABYLON.MeshBuilder.CreateBox(prefix+'_topCap',{width:width+0.1,height:0.1,depth:depth+0.08},scene);
    topCap.parent=node; topCap.position.set(0,height+0.05,depth/2); topCap.material=walnutM; topCap.isPickable=false;

    const numShelves=5;
    for(let r=0;r<numShelves;r++){
      const sy=0.2+r*(height-0.3)/numShelves;
      const sh=BABYLON.MeshBuilder.CreateBox(prefix+'_sh'+r,{width:width-0.08,height:0.04,depth:depth-0.04},scene);
      sh.parent=node; sh.position.set(0,sy,depth/2); sh.material=walnutM; sh.isPickable=false;

      // Fill shelf with books
      let bx=-width/2+0.12;
      while(bx<width/2-0.12){
        const bw=Math.min(0.12+(Math.abs(r*5+Math.round(bx*20))%4)*0.018,width/2-0.12-bx);if(bw<0.055)break;
        const bh=0.44+(Math.abs(r*3+Math.round(bx*17))%5)*0.04;
        const bd=depth*0.65;
        const book=BABYLON.MeshBuilder.CreateBox(prefix+'_book_'+r+'_'+Math.round((bx+5)*100),{width:bw,height:bh,depth:bd},scene);
        book.parent=node; book.position.set(bx+bw/2, sy+bh/2+0.02, depth/2);
        book.material=shelfBookM[(r+Math.round((bx+5)*10))%shelfPalette.length];
        interactables.set(book.name,'bookshelf');
        bx+=bw+0.012;
      }
    }
  }

  // Back wall left bookcase (flanking portrait on west side)
  buildBookcase('lib_bcL', -4.0, 0, -D/2+0.25, 2.2, 4.2, 0.45, 0);
  // Back wall right bookcase (flanking portrait on east side, before window at x=4.8)
  buildBookcase('lib_bcR', 2.8, 0, -D/2+0.25, 2.0, 4.2, 0.45, 0);
  // West wall north end bookcase (away from secret shelf at x=-7.74, z=-4.6)
  buildBookcase('lib_bcW', -W/2+0.25, 0, -1.2, 2.2, 4.2, 0.45, Math.PI/2, true);

  // Diagonal staircase
  const STS=10, SY=H*0.5/STS, SZ=0.35, SX=2.5;
  const soX=-W/2+3, soZ=D/2-1;
  for(let s=0;s<STS;s++){ const tread=BABYLON.MeshBuilder.CreateBox('lib_tread'+s,{width:SX,height:0.05,depth:SZ},scene); tread.position.set(soX+s*0.4,s*SY+0.05,soZ-s*SZ); tread.material=woodM;
    const riser=BABYLON.MeshBuilder.CreateBox('lib_riser'+s,{width:SX,height:SY,depth:0.03},scene); riser.position.set(soX+s*0.4,s*SY+SY/2,soZ-s*SZ+SZ/2); riser.material=woodM; }

  // ── Renovated Oak Study Desk & Accessories ──
  // Positioned at x=2.7, z=-2.0 while keeping center x=0, z=0 unobstructed
  const deskX=2.7, deskZ=-2.0, deskH=0.76;
  const deskTop=BABYLON.MeshBuilder.CreateBox('lib_deskTop',{width:2.1,height:0.06,depth:1.1},scene);
  deskTop.position.set(deskX,deskH,deskZ); deskTop.material=oakM; deskTop.isPickable=false;
  
  // Leather writing inlay
  const leatherM=mat('lib_deskLeatherM'); leatherM.diffuseColor=new BABYLON.Color3(0.12,0.08,0.06); leatherM.specularPower=12;
  const deskInlay=BABYLON.MeshBuilder.CreateBox('lib_deskInlay',{width:1.2,height:0.005,depth:0.7},scene);
  deskInlay.position.set(deskX,deskH+0.031,deskZ); deskInlay.material=leatherM; deskInlay.isPickable=false;

  // Desk pedestals & drawers
  [-0.75, 0.75].forEach((ox, pIdx)=>{
    const ped=BABYLON.MeshBuilder.CreateBox('lib_deskPed'+pIdx,{width:0.52,height:deskH-0.03,depth:0.95},scene);
    ped.position.set(deskX+ox,(deskH-0.03)/2,deskZ); ped.material=oakM; ped.isPickable=false;
    // Drawer pulls
    for(let dr=0;dr<3;dr++){
      const pull=BABYLON.MeshBuilder.CreateSphere('lib_deskPull'+pIdx+'_'+dr,{diameter:0.04,segments:6},scene);
      pull.position.set(deskX+ox, 0.18+dr*0.2, deskZ+0.49); pull.material=brassM; pull.isPickable=false;
    }
  });

  // Desk Accessories: Lamp/Candle, Inkwell, Quill, Open Book, Papers
  // Brass desk lamp with warm glow
  const lampBase=BABYLON.MeshBuilder.CreateCylinder('lib_lampBase',{diameter:0.16,height:0.03,tessellation:12},scene);
  lampBase.position.set(deskX-0.75,deskH+0.045,deskZ-0.25); lampBase.material=brassM; lampBase.isPickable=false;
  const lampStem=BABYLON.MeshBuilder.CreateCylinder('lib_lampStem',{diameter:0.025,height:0.35,tessellation:8},scene);
  lampStem.position.set(deskX-0.75,deskH+0.22,deskZ-0.25); lampStem.material=brassM; lampStem.isPickable=false;
  const lampShade=BABYLON.MeshBuilder.CreateCylinder('lib_lampShade',{diameterTop:0.1,diameterBottom:0.22,height:0.14,tessellation:12},scene);
  lampShade.position.set(deskX-0.75,deskH+0.38,deskZ-0.25);
  const shadeM=mat('lib_shadeM'); shadeM.diffuseColor=new BABYLON.Color3(0.12,0.28,0.18); shadeM.emissiveColor=new BABYLON.Color3(0.08,0.18,0.10);
  lampShade.material=shadeM; lampShade.isPickable=false;

  // Warm Desk Light (point light on desk)
  const deskLight=new BABYLON.PointLight('lib_deskL',new BABYLON.Vector3(deskX-0.75,deskH+0.32,deskZ-0.25),scene);
  deskLight.diffuse=new BABYLON.Color3(0.9,0.65,0.35); deskLight.intensity=0.85; deskLight.range=5.5;

  // Inkwell & Quill
  const inkM=mat('lib_inkM'); inkM.diffuseColor=new BABYLON.Color3(0.05,0.05,0.06); inkM.specularPower=32;
  const inkwell=BABYLON.MeshBuilder.CreateCylinder('lib_inkwell',{diameter:0.08,height:0.08,tessellation:10},scene);
  inkwell.position.set(deskX+0.65,deskH+0.07,deskZ-0.2); inkwell.material=inkM; inkwell.isPickable=false;
  const quillM=mat('lib_quillM'); quillM.diffuseColor=new BABYLON.Color3(0.9,0.88,0.80);
  const quill=BABYLON.MeshBuilder.CreateCylinder('lib_quill',{diameterTop:0.002,diameterBottom:0.02,height:0.32,tessellation:6},scene);
  quill.position.set(deskX+0.63,deskH+0.18,deskZ-0.18); quill.rotation.z=-0.35; quill.material=quillM; quill.isPickable=false;

  const feather=BABYLON.MeshBuilder.CreateSphere('lib_quillFeather',{diameter:0.11,segments:10},scene);feather.scaling.set(0.48,1.8,0.18);feather.position.set(deskX+0.59,deskH+0.30,deskZ-0.18);feather.rotation.z=-0.35;feather.material=quillM;feather.isPickable=false;
  // Open Book & Papers on desk
  const paperM=mat('lib_paperM'); paperM.diffuseColor=new BABYLON.Color3(0.82,0.76,0.65);paperM.backFaceCulling=false;
  const paper1=BABYLON.MeshBuilder.CreatePlane('lib_paper1',{width:0.22,height:0.30},scene);
  paper1.position.set(deskX+0.25,deskH+0.035,deskZ+0.08); paper1.rotation.x=Math.PI/2; paper1.rotation.y=0.15; paper1.material=paperM; paper1.isPickable=false;
  const paper2=BABYLON.MeshBuilder.CreatePlane('lib_paper2',{width:0.22,height:0.30},scene);
  paper2.position.set(deskX+0.32,deskH+0.036,deskZ+0.05); paper2.rotation.x=Math.PI/2; paper2.rotation.y=-0.22; paper2.material=paperM; paper2.isPickable=false;

  const openBookL=BABYLON.MeshBuilder.CreateBox('lib_openBookL',{width:0.18,height:0.015,depth:0.26},scene);
  openBookL.position.set(deskX-0.09,deskH+0.04,deskZ); openBookL.rotation.z=0.08; openBookL.material=paperM; openBookL.isPickable=false;
  const openBookR=BABYLON.MeshBuilder.CreateBox('lib_openBookR',{width:0.18,height:0.015,depth:0.26},scene);
  openBookR.position.set(deskX+0.09,deskH+0.04,deskZ); openBookR.rotation.z=-0.08; openBookR.material=paperM; openBookR.isPickable=false;

  // ── Renovated Burgundy Leather Wingback Chair ──
  // Preserving core mesh names lib_chair and lib_chairBack
  const burgundyM=mat('lib_burgundyM'); burgundyM.diffuseColor=new BABYLON.Color3(0.28,0.05,0.08); burgundyM.specularPower=12;
  const chairX=W/2-2, chairZ=-2.0; // x=6.0, z=-2.0

  const chairBase=BABYLON.MeshBuilder.CreateBox('lib_chair',{width:0.85,height:0.38,depth:0.85},scene);
  chairBase.position.set(chairX,0.38,chairZ); chairBase.material=burgundyM;
  const chairCushion=BABYLON.MeshBuilder.CreateBox('lib_chairCushion',{width:0.80,height:0.12,depth:0.80},scene);
  chairCushion.position.set(chairX,0.52,chairZ); chairCushion.material=burgundyM; chairCushion.isPickable=false;

  const chairBack=BABYLON.MeshBuilder.CreateBox('lib_chairBack',{width:0.85,height:1.1,depth:0.16},scene);
  chairBack.position.set(chairX,1.10,chairZ-0.36); chairBack.rotation.x=-0.08; chairBack.material=burgundyM;

  for(let r=0;r<3;r++)for(let c=0;c<3;c++){const stud=BABYLON.MeshBuilder.CreateSphere('lib_chairButton'+r+'_'+c,{diameter:0.035,segments:6},scene);stud.position.set(chairX-0.24+c*0.24,0.87+r*0.24,chairZ-0.25);stud.material=burgundyM;stud.isPickable=false;}
  // Wings & Armrests
  for(const sd of [-1,1]){
    const wing=BABYLON.MeshBuilder.CreateBox('lib_chairWing'+(sd<0?'L':'R'),{width:0.12,height:0.65,depth:0.32},scene);
    wing.position.set(chairX+sd*0.40,1.30,chairZ-0.24); wing.rotation.y=sd*0.25; wing.material=burgundyM; wing.isPickable=false;
    const arm=BABYLON.MeshBuilder.CreateBox('lib_chairArm'+(sd<0?'L':'R'),{width:0.14,height:0.25,depth:0.75},scene);
    arm.position.set(chairX+sd*0.42,0.68,chairZ-0.02); arm.material=burgundyM; arm.isPickable=false;
  }
  // Turned wooden legs
  [[-0.35,-0.35],[0.35,-0.35],[-0.35,0.35],[0.35,0.35]].forEach(([lx,lz],i)=>{
    const leg=BABYLON.MeshBuilder.CreateCylinder('lib_chairLeg'+i,{diameterTop:0.06,diameterBottom:0.03,height:0.20,tessellation:8},scene);
    leg.position.set(chairX+lx,0.10,chairZ+lz); leg.material=woodM; leg.isPickable=false;
  });

  // ── Renovated Patterned Victorian Reading Rug ──
  // Retaining mesh name lib_rug and material lib_rugM
  let rugTex=null;
  if(typeof BABYLON.DynamicTexture !== 'undefined'){
    const dt=new BABYLON.DynamicTexture('lib_rugTex',{width:256,height:256},scene,false);
    const ctx=dt.getContext();
    // Rich burgundy base
    ctx.fillStyle='#3a080c'; ctx.fillRect(0,0,256,256);
    // Outer gold border frame
    ctx.strokeStyle='#c89632'; ctx.lineWidth=10; ctx.strokeRect(12,12,232,232);
    ctx.strokeStyle='#5a1218'; ctx.lineWidth=4; ctx.strokeRect(22,22,212,212);
    // Inner filigree pattern & diamond medallion
    ctx.strokeStyle='#d4a242'; ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(128,40); ctx.lineTo(216,128); ctx.lineTo(128,216); ctx.lineTo(40,128); ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); ctx.arc(128,128,35,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='#5a1218'; ctx.fill();
    dt.update(); rugTex=dt;
  }
  const rugM=mat('lib_rugM');
  if(rugTex) rugM.diffuseTexture=rugTex;
  else rugM.diffuseColor=new BABYLON.Color3(0.32,0.06,0.04);

  const rug=BABYLON.MeshBuilder.CreateGround('lib_rug',{width:3.6,height:4.8,subdivisions:2},scene);
  rug.position.set(W/2-2,0.01,-1.5); rug.material=rugM;

  // Owl with glowing eyes
  const owlM=mat('lib_owlM'); owlM.diffuseColor=new BABYLON.Color3(0.3,0.25,0.15);
  const owlBody=BABYLON.MeshBuilder.CreateSphere('lib_owl',{diameter:0.25,segments:8},scene); owlBody.position.set(-W/2+0.5,3.5,2); owlBody.scaling.set(0.8,1.2,0.8); owlBody.material=owlM;
  const owlHead=BABYLON.MeshBuilder.CreateSphere('lib_owlH',{diameter:0.15,segments:8},scene); owlHead.position.set(-W/2+0.5,3.75,2); owlHead.material=owlM;
  [[-0.04],[0.04]].forEach(([ex])=>{ const e=BABYLON.MeshBuilder.CreateSphere('lib_owlE',{diameter:0.04,segments:6},scene); e.position.set(-W/2+0.5+ex,3.78,2+0.06); e.material=emitM('lib_owlEm',0.8,0.75,0.3,0.7); });

  // Broom on wall
  const broomM=mat('lib_broomM'); broomM.diffuseColor=new BABYLON.Color3(0.2,0.14,0.06);
  const broomHandle=BABYLON.MeshBuilder.CreateCylinder('lib_broomHandle',{diameterTop:0.03,diameterBottom:0.04,height:2.0,tessellation:8},scene); broomHandle.position.set(W/2-0.3,2.5,-4); broomHandle.rotation.z=Math.PI/2+0.3; broomHandle.material=broomM;
  const broomStraw=BABYLON.MeshBuilder.CreateCylinder('lib_broomStraw',{diameterTop:0.04,diameterBottom:0.12,height:0.4,tessellation:8},scene); broomStraw.position.set(W/2-0.7,2.3,-4); broomStraw.rotation.z=Math.PI/2+0.3; broomStraw.material=broomM;

  // Portrait of the Lady (Helga + cat) — framed, examineable
  const hpX=0, hpY=2.9, hpZ=-D/2+0.28;
  const hpCanvas=BABYLON.MeshBuilder.CreatePlane('lib_helgaP',{width:1.15,height:1.15},scene);
  hpCanvas.position.set(hpX,hpY,hpZ);
  const hpM=mat('lib_helgaM'); const hpT=new BABYLON.Texture(TEX.helga_p,scene);
  hpT.uScale=1; hpT.vScale=1; hpM.diffuseTexture=hpT; hpM.specularColor=new BABYLON.Color3(0.02,0.02,0.02);
  // candlelit source reads black under scene lights — self-lit canvas with a warm tint
  hpM.emissiveTexture=hpT; hpM.emissiveColor=new BABYLON.Color3(0.8,0.72,0.6);
  hpM.backFaceCulling=false; // default plane normal faces the wall — without this the canvas is culled and you see the wall through the frame
  hpCanvas.material=hpM;
  const frameM=mat('lib_frameM'); frameM.diffuseColor=new BABYLON.Color3(0.13,0.09,0.04);
  const fw=1.35, fh=1.35, frt=0.07;
  [[0,fh/2-frt/2,fw,frt],[0,-fh/2+frt/2,fw,frt],[-fw/2+frt/2,0,frt,fh],[fw/2-frt/2,0,frt,fh]].forEach(([ox,oy,w,h])=>{
    const bar=BABYLON.MeshBuilder.CreateBox('lib_helgaF',{width:w,height:h,depth:0.05},scene);
    bar.position.set(hpX+ox,hpY+oy,hpZ-0.02); bar.material=frameM;
  });
  interactables.set('lib_helgaP','helga_portrait');
  interactables.set('lib_helgaF','helga_portrait');

  // Locked cage
  const cageM=mat('lib_cageM'); cageM.diffuseColor=new BABYLON.Color3(0.12,0.1,0.08);
  const cage=BABYLON.MeshBuilder.CreateBox('lib_cage',{width:0.8,height:1.2,depth:0.4},scene); cage.position.set(3,2.5,D/2-0.25); cage.material=cageM;

  // Floating magic wisps
  const wisps=[];
  for(let w=0;w<5;w++){ const wp=BABYLON.MeshBuilder.CreateSphere('lib_wisp'+w,{diameter:0.09,segments:6},scene); wp.isPickable=false; wp.position.set((Math.random()-0.5)*W*0.6, 2+Math.random()*2, (Math.random()-0.5)*D*0.6); wp.material=emitM('lib_wm'+w,0.3,0.8,0.5,0.5); wp.material.alpha=0.22; wisps.push(wp); }

  // Lights
  const ambient=new BABYLON.HemisphericLight('lib_amb',new BABYLON.Vector3(0,1,0),scene);
  ambient.intensity=0.65; ambient.diffuse=new BABYLON.Color3(0.35,0.42,0.5); ambient.groundColor=new BABYLON.Color3(0.16,0.09,0.08);
  const winLight=new BABYLON.PointLight('lib_wL',new BABYLON.Vector3(0,3,-D/2+1),scene);
  winLight.diffuse=new BABYLON.Color3(0.25,0.35,0.55); winLight.intensity=2.2; winLight.range=20;
  const helgaLight=new BABYLON.PointLight('lib_helgaL',new BABYLON.Vector3(hpX,hpY-0.1,hpZ+1.6),scene);
  helgaLight.diffuse=new BABYLON.Color3(0.85,0.72,0.55); helgaLight.intensity=1.3; helgaLight.range=6;
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

  // the entrance hall is a floor up — the stairs carry the name

  buildDoor('door_attic', soX+STS*0.2, soZ-STS*SZ+0.2, 0, 1.1, 2.36, STS*SY/2);   // freestanding at the stair top
  // ── SECRET PASSAGE — the whispering shelf ──────────────────────────────────
  // A bookshelf against the west wall hides a stairwell down to the basement.
  // Carrying the spellbook makes it swing open (openPassage below, core.js routes it).
  const SPx=-W/2+0.26, SPz=-4.6, SPw=2.2, SPh=2.7, SPd=0.34;
  const hingeZ=SPz-SPw/2;                                       // hinge at the south edge
  const pivot=new BABYLON.TransformNode('lib_shelfPivot',scene); pivot.position.set(SPx,0,hingeZ);
  const shWood=mat('lib_shWoodM'); shWood.diffuseColor=new BABYLON.Color3(0.16,0.09,0.05);
  const parts=[];
  const shelfPart=(name,opts,px,py,pz)=>{
    const m=BABYLON.MeshBuilder.CreateBox(name,opts,scene);
    // px/pz are offsets from the hinge; convert to world before parenting
    m.position.set(SPx+px,py,hingeZ+pz); m.material=shWood; parts.push(m); return m;
  };
  // carcass (relative to pivot: back at x=0, opening faces +x into the room)
  shelfPart('lib_ssBack',{width:SPd,height:SPh,depth:SPw},0,SPh/2,SPw/2);
  for(let r=0;r<4;r++) shelfPart('lib_ssBoard'+r,{width:SPd-0.06,height:0.05,depth:SPw-0.06},0.02,0.35+r*0.72,SPw/2);
  shelfPart('lib_ssTop',{width:SPd+0.04,height:0.08,depth:SPw+0.04},0,SPh+0.04,SPw/2);
  // named books — each a different dark colour, one gap where a book is missing
  const bookCols=[[0.25,0.08,0.06],[0.13,0.1,0.2],[0.1,0.17,0.1],[0.28,0.2,0.09],[0.18,0.12,0.16],[0.09,0.14,0.13]];
  for(let r=0;r<4;r++){ let z=0.12;
    while(z<SPw-0.12){ const bw=0.09+((r*7+Math.round(z*10))%3)*0.03, bh=0.5+((r*5+Math.round(z*13))%3)*0.06;
      if(!((r===2)&&(z>1.2)&&(z<1.7))){ // the gap where one book is missing
        const b=shelfPart('lib_ssBook'+r+'_'+Math.round(z*100),{width:0.22,height:bh,depth:bw},0.28,0.38+r*0.72+bh/2,z+bw/2);
        const bm=mat('lib_ssbm'+r+'_'+Math.round(z*100)); bm.diffuseColor=new BABYLON.Color3(...bookCols[(r+Math.round(z*10))%6]); b.material=bm;
      }
      z+=bw+0.02;
    }
  }
  parts.forEach(m=>{ m.setParent(pivot); interactables.set(m.name,'secretshelf'); });
  // the dark stairwell behind the shelf — visible once it swings open
  const holeM=mat('lib_holeM'); holeM.diffuseColor=new BABYLON.Color3(0.005,0.006,0.008); holeM.emissiveColor=new BABYLON.Color3(0.0,0.004,0.003); holeM.backFaceCulling=false;
  const hole=BABYLON.MeshBuilder.CreatePlane('passage_hole',{width:1.8,height:2.5},scene);
  hole.position.set(-W/2+0.03,1.3,SPz); hole.rotation.y=Math.PI/2; hole.material=holeM;
  interactables.set('passage_hole','passage_hole');
  const jambM=mat('lib_jambM'); jambM.diffuseColor=new BABYLON.Color3(0.2,0.19,0.17);
  [[-0.95,0],[0.95,0]].forEach(([jz],i)=>{ const j=BABYLON.MeshBuilder.CreateBox('lib_jamb'+i,{width:0.28,height:2.6,depth:0.16},scene); j.position.set(-W/2+0.14,1.32,SPz+jz); j.material=jambM; });
  for(let s=0;s<2;s++){ const st=BABYLON.MeshBuilder.CreateBox('lib_pstep'+s,{width:0.24,height:0.14,depth:1.7},scene); st.position.set(-W/2+0.32-s*0.12,0.52-s*0.2,SPz); st.material=jambM; }
  // passage glow — only once the shelf is open (builds open on revisit, too)
  let passageLight=null;
  const addPassageGlow=()=>{
    if(passageLight) return;
    passageLight=new BABYLON.PointLight('lib_pl',new BABYLON.Vector3(-W/2+0.6,1.0,SPz),scene);
    passageLight.diffuse=new BABYLON.Color3(0.15,0.45,0.3); passageLight.intensity=0.7; passageLight.range=7;
  };
  if(state.passageOpen){ pivot.rotation.y=1.05; addPassageGlow(); }

  // Called by core.js when the spellbook is carried and the shelf is clicked.
  window.openPassage=function(){
    if(state.passageOpen) return false;
    state.passageOpen=true;
    showToast('📓 The spellbook hums. The shelf swings open.');
    addPassageGlow();
    let t0=null;
    const anim=(ts)=>{
      const node=scene&&scene.getTransformNodeByName('lib_shelfPivot');
      if(!node){ return; }
      t0??=ts; const k=Math.min(1,(ts-t0)/1400); const e=1-Math.pow(1-k,3);
      node.rotation.y=1.05*e;
      if(k<1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
    return true;
  };
}

// ─── BATHROOM ──────────────────────────────────────────────────────────────────
