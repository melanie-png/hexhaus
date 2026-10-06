// ─── HOUSE ELEMENTS ─────────────────────────────────────────────────────────
// Ambient, animated and interactive dressing for all eight rooms.
// Builders are called from the room files with world positions; every builder
// is self-contained: meshes, materials, registration, and its own animation.

// New examineables — same voice as the rest of the house.
Object.assign(ITEMS,{
  witchhat:   { name:"Witch's Hat",       icon:'🎩', collectible:false, desc:'Slouched, patched, still warm. It hangs at exactly the height of a standing woman. You check the hook. The hook is lower than the hat.' },
  potions:    { name:'Green Potions',      icon:'🧪', collectible:false, desc:'Three flasks, thick as syrup, lit from inside. The labels are centuries of the same word in three different dead languages. The colour is not a colour you should drink.' },
  greatcauldron:{ name:"Helga's Great Cauldron", icon:'🫕', collectible:false, desc:'Big enough to bathe in. She does not bathe in it. The brew has been simmering longer than anyone can remember and, by the smell of it, it still needs three more days.' },
  grimoire:   { name:"Helga's Grimoire",      icon:'📖', collectible:false, desc:'Open on a page of measurements. Not the cooking kind. One line is underlined twice in a steady, patient hand: never on the first frost.' },
  specimens:  { name:'Specimen Jars',         icon:'🫙', collectible:false, desc:'Preserved in brine and patience, each labelled in the same small neat hand. None of the labels are names you would use. One label bears tomorrow\'s date.' },
  bsworkbench:{ name:'Preparation Table',    icon:'⚗️', collectible:false, desc:'Mortar still faintly warm. The pouch is labelled with a knot code you almost recognise. Whatever gets ground here gets ground at night.' },
  sigils:     { name:'Chalk Sigils',      icon:'🌀', collectible:false, desc:'A circle, half-scrubbed away, as if someone started removing it and lost their nerve. Inside it the floor is clean. The chalk dust outside it is not.' },
  saltline:   { name:'Salt Line',          icon:'🧂', collectible:false, desc:'A thick white line across the threshold. Nothing has crossed it. The salt is fresh. Whatever it keeps out has not tested it recently.' },
  gramophone: { name:'The Gramophone',     icon:'📻', collectible:false, desc:'The horn is warm. The crank turns one way only. There is no record on it, and nothing is playing, and yet the room is quieter when you are next to it.' },
  rockingchair:{ name:'The Rocking Chair', icon:'🪑', collectible:false, desc:'It rocks when the house is empty. You have never seen it start. You have never seen it stop. The seat is not dusty.' },
  looseboard: { name:'Loose Floorboard',   icon:'🪵', collectible:false, desc:'Under the board: a folded note. A child has drawn the house in careful pencil. Every window is a little square of yellow. One window has been crossed out so hard the paper tore.' },
  dollhouse:  { name:'The Dollhouse',     icon:'🏠', collectible:false, desc:'A perfect miniature of the house, down to the stairs. In the tiny library, a shelf is built at the wrong angle on purpose. You count the windows against the real thing. It has one more than it should.' },
  workbench:{ name:'Kitchen Workbench',  icon:'\ud83e\uded0', collectible:false, desc:'Flour worked into the grain of the wood, and older stains beneath it. Whoever kneads here rolls their sleeves down, not up. The rolling pin is worn thin in the middle, as if it is used for something narrower than dough.' },
  stonesink:{ name:'Stone Wash-Trough',  icon:'\ud83e\udeb3', collectible:false, desc:'A stone trough scrubbed pale grey. The jug beside it is full, though the well has been dry for a hundred years. The trough drains somewhere, and the pipe it drains into connects to nothing you could find on any plan of this house.' },
  kettle:{ name:'Copper Kettle',  icon:'\u2668', collectible:false, desc:'It has hung at the arch since before the range went cold. It is warm. Nothing below it is lit, and nothing in this kitchen boils, and it is warm.' },
  bathtub:{ name:'Clawfoot Bathtub',  icon:'\ud83e\udee1', collectible:false, desc:'Cast iron under chipped enamel, four brass claws curled on the tiles. The water has been sitting a very long time. It does not ripple when you breathe on it, and the room is cold enough to see why nobody ever emptied it.' },
  hightank:{ name:'High-Tank Toilet',  icon:'\ud83e\udea0', collectible:false, desc:'A cracked mahogany seat and a cistern mounted high on the wall, the way they built them when the house was young. The pull chain ends in a brass ring, patient. Something in the pipes suggests the water goes somewhere it should not.' },
  washbasin:{ name:'Washstand Basin',  icon:'\ud83d\udeb0', collectible:false, desc:'A pedestal basin with a soap dish fused to the rim by old wax. The tap is stiff and gives one dark drop, like the house deciding against you.' },
  crackedmirror:{ name:'Cracked Mirror',  icon:'🪞', collectible:false, desc:'One long crack corner to corner, old and silvered. Your reflection is late here too — later than the entrance hall mirror — and it finishes whatever you were doing after you stop.' },
  dripbucket: { name:'The Leaking Bucket',icon:'🪣', collectible:false, desc:'Placed under a drip that never misses. The bucket is emptied every morning. She still calls it the new bucket.' },
  deadflowers:{ name:'Dead Flowers',      icon:'🥀', collectible:false, desc:'Cut and arranged with care, then left to die in the vase. Whoever cut them was good at it. Whoever left them had somewhere to be.' },
  sheeted:    { name:'Sheeted Furniture', icon:'🛋️', collectible:false, desc:'Under the sheet: an armchair, or something the shape of one. The sheet was changed recently. It is not dust that made her cover it.' },
  rat:        { name:'A Rat',             icon:'🐀', collectible:false, desc:'It stops when it sees you. It has seen the house for longer than the house has seen you. Then it decides you are furniture, and moves on.' },
  herbs:      { name:'Hanging Herbs',     icon:'🌿', collectible:false, desc:'Tied in bundles from the beams. Rosemary, sage, something without a common name. They turn slowly. There is no draught.' },
});

// ── animation registry (re-attached per scene; scene is rebuilt per room) ──
const _AN={list:[],scene:null,obs:null};
function elAnim(node,fn){
  if(_AN.scene!==scene){
    _AN.scene=scene; _AN.list.length=0;
    _AN.obs=scene.onBeforeRenderObservable.add(()=>{
      const dt=Math.min(scene.getEngine().getDeltaTime()/1000,0.1), t=performance.now()/1000;
      for(let i=_AN.list.length-1;i>=0;i--){ const e=_AN.list[i];
        if(e.node.isDisposed()){ _AN.list.splice(i,1); continue; }
        e.fn(dt,t); }
    });
  }
  _AN.list.push({node,fn});
}
let _dot=null,_dotScene=null;
function dotTex(){
  if(_dotScene!==scene){
    _dotScene=scene; const dt=new BABYLON.DynamicTexture('el_dot',{width:32,height:32},scene,false);
    const c=dt.getContext(); const g=c.createRadialGradient(16,16,1,16,16,15);
    g.addColorStop(0,'rgba(255,250,240,1)'); g.addColorStop(1,'rgba(255,250,240,0)');
    c.fillStyle=g; c.fillRect(0,0,32,32); dt.update(); dt.hasAlpha=true; _dot=dt;
  }
  return _dot;
}
function _m(name,r,g,b,em){ const m=mat(name); m.diffuseColor=new BABYLON.Color3(r,g,b); if(em)m.emissiveColor=new BABYLON.Color3(em[0],em[1],em[2]); return m; }

// ── 1. cobwebs — quarter fans of line-work, corners and over doorframes ────
function makeWeb(name,x,y,z,rotY,r=0.9){
  const lines=[];
  for(let i=0;i<7;i++){ const a=i/7*Math.PI/2; lines.push([new BABYLON.Vector3(0,0,0),new BABYLON.Vector3(Math.cos(a)*r,Math.sin(a)*r,0)]); }
  for(let ring=1;ring<=3;ring++){ const rr=r*ring/3, poly=[];
    for(let i=0;i<=7;i++){ const a=i/7*Math.PI/2; poly.push(new BABYLON.Vector3(Math.cos(a)*rr,Math.sin(a)*rr,0)); }
    lines.push(poly); }
  const web=BABYLON.MeshBuilder.CreateLineSystem(name,{lines},scene);
  web.color=new BABYLON.Color3(0.62,0.60,0.55); web.alpha=0.75;
  web.position.set(x,y,z); web.rotation.y=rotY; web.isPickable=false;
  return web;
}

// ── 2. dust motes — slow drift in the window light ──────────────────────────
function makeDust(name,x,y,z){
  const ps=new BABYLON.ParticleSystem(name,40,scene);
  ps.particleTexture=dotTex(); ps.emitter=new BABYLON.Vector3(x,y,z);
  ps.minEmitBox=new BABYLON.Vector3(-1.6,-0.8,-0.8); ps.maxEmitBox=new BABYLON.Vector3(1.6,0.8,0.8);
  ps.color1=new BABYLON.Color4(1,0.97,0.88,0.10); ps.color2=new BABYLON.Color4(0.9,0.9,1,0.07);
  ps.colorDead=new BABYLON.Color4(0,0,0,0);
  ps.minSize=0.015; ps.maxSize=0.05; ps.minLifeTime=4; ps.maxLifeTime=8;
  ps.emitRate=7; ps.blendMode=BABYLON.ParticleSystem.BLENDMODE_STANDARD;
  ps.direction1=new BABYLON.Vector3(-0.02,-0.01,0); ps.direction2=new BABYLON.Vector3(0.02,0.01,0);
  ps.gravity=new BABYLON.Vector3(0,-0.004,0); ps.start();
  return ps;
}

// ── 3. wax pools at candle bases ────────────────────────────────────────────
function makeWax(name,x,z,d=0.13){
  const w=BABYLON.MeshBuilder.CreateCylinder(name,{diameter:d,height:0.03,tessellation:10},scene);
  w.position.set(x,0.015,z); w.material=_m(name+'_m',0.42,0.28,0.10,[0.10,0.06,0.02]); w.isPickable=false; return w;
}

// ── 4. witch's hat on a hook ────────────────────────────────────────────────
function makeHat(name,x,y,z,rotY){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,y,z); node.rotation.y=rotY;
  const brim=BABYLON.MeshBuilder.CreateCylinder(name+'_brim',{diameter:0.34,height:0.02,tessellation:14},scene);
  brim.parent=node; brim.material=_m(name+'_bm',0.05,0.04,0.055);
  const crown=BABYLON.MeshBuilder.CreateCylinder(name+'_crown',{diameterBottom:0.20,diameterTop:0.10,height:0.34,tessellation:14},scene);
  crown.parent=node; crown.position.set(0.03,0.17,0); crown.rotation.z=-0.18; crown.material=brim.material;
  const band=BABYLON.MeshBuilder.CreateCylinder(name+'_band',{diameter:0.205,height:0.05,tessellation:14},scene);
  band.parent=node; band.position.set(0.015,0.05,0); band.rotation.z=-0.18; band.material=_m(name+'_vmm',0.10,0.02,0.03);
  interactables.set(name+'_brim','witchhat'); interactables.set(name+'_crown','witchhat');
  return node;
}

// ── 5. herb bundles hanging from beams ──────────────────────────────────────
function makeHerbBundles(name,spots){
  spots.forEach((s,i)=>{
    const node=new BABYLON.TransformNode(name+i,scene); node.position.set(s[0],s[1],s[2]); node.rotation.y=i*1.3;
    const strM=_m(name+i+'_sm',0.4,0.36,0.3);
    const str=BABYLON.MeshBuilder.CreateBox(name+i+'_str',{width:0.012,height:0.22,depth:0.012},scene);
    str.parent=node; str.position.y=0.15; str.material=strM;
    const gM=_m(name+i+'_gm',0.16,0.20,0.09,[0.015,0.02,0.008]);
    for(let b=0;b<5;b++){ const bundle=BABYLON.MeshBuilder.CreateBox(name+i+'_b'+b,{width:0.035,height:0.4,depth:0.035},scene);
      bundle.parent=node; bundle.position.set(Math.sin(b*1.9)*0.045,-0.22,Math.cos(b*2.4)*0.045);
      bundle.rotation.z=Math.sin(b)*0.12; bundle.material=gM; }
    const tie=BABYLON.MeshBuilder.CreateBox(name+i+'_tie',{width:0.08,height:0.02,depth:0.08},scene);
    tie.parent=node; tie.position.y=-0.02; tie.material=strM;
    interactables.set(name+i+'_b0','herbs');
    elAnim(node,(dt,t)=>{ node.rotation.y=t*0.05+i; });
  });
}

// ── 6. salt line across a threshold ──────────────────────────────────────────
function makeSaltLine(name,x,z,rotY,len=1.6){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,0,z); node.rotation.y=rotY;
  const sM=_m(name+'_m',0.85,0.84,0.80,[0.06,0.06,0.06]); sM.alpha=0.9;
  const bar=BABYLON.MeshBuilder.CreateBox(name+'_bar',{width:len,height:0.018,depth:0.07},scene);
  bar.parent=node; bar.material=sM; bar.material.alpha=0.55;
  for(let g=0;g<10;g++){ const grain=BABYLON.MeshBuilder.CreateBox(name+'_g'+g,{width:0.10+((g*37)%7)*0.01,height:0.012,depth:0.02},scene);
    grain.parent=node; grain.position.set((g/9-0.5)*len+((g*29)%5)*0.01-0.02,0.012,((g*17)%5)*0.012-0.03);
    grain.rotation.y=g*0.7; grain.material=sM; }
  interactables.set(name+'_bar','saltline');
  return node;
}

// ── 7. the green potion shelf ───────────────────────────────────────────────
function makePotionShelf(name,x,y,z,rotY){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,y,z); node.rotation.y=rotY;
  const woodM=_m(name+'_wm',0.2,0.13,0.07);
  const board=BABYLON.MeshBuilder.CreateBox(name+'_board',{width:1.1,height:0.05,depth:0.24},scene);
  board.parent=node; board.material=woodM;
  const glow=new BABYLON.PointLight(name+'_L',new BABYLON.Vector3(0,0.28,0.15),scene);
  glow.parent=node; glow.diffuse=new BABYLON.Color3(0.15,0.65,0.30); glow.intensity=0.55; glow.range=2.6;
  for(let f=0;f<3;f++){
    const fx=(f-1)*0.33;
    const glassM=mat(name+'_g'+f); glassM.diffuseColor=new BABYLON.Color3(0.05,0.15,0.06);
    glassM.emissiveColor=new BABYLON.Color3(0.07,0.55,0.20); glassM.alpha=0.88;
    const body=BABYLON.MeshBuilder.CreateSphere(name+'_f'+f,{diameter:0.15,segments:8},scene);
    body.parent=node; body.position.set(fx,0.10,0.03); body.scaling.set(1,1.15,1); body.material=glassM;
    const neck=BABYLON.MeshBuilder.CreateCylinder(name+'_n'+f,{diameter:0.045,height:0.09,tessellation:8},scene);
    neck.parent=node; neck.position.set(fx,0.21,0.03); neck.material=glassM;
    const cork=BABYLON.MeshBuilder.CreateCylinder(name+'_c'+f,{diameter:0.04,height:0.03,tessellation:8},scene);
    cork.parent=node; cork.position.set(fx,0.265,0.03); cork.material=woodM;
    interactables.set(name+'_f'+f,'potions');
  }
  return node;
}

// ── 8. rats — scurry along the skirting, pause, look at you ──────────────────
function makeRat(name,path,seed){
  const node=new BABYLON.TransformNode(name,scene);
  const furM=_m(name+'_m',0.24,0.20,0.17);
  const body=BABYLON.MeshBuilder.CreateBox(name+'_body',{width:0.26,height:0.11,depth:0.13},scene);
  body.parent=node; body.position.y=0.075; body.material=furM;
  const head=BABYLON.MeshBuilder.CreateBox(name+'_head',{width:0.10,height:0.075,depth:0.09},scene);
  head.parent=node; head.position.set(0.17,0.075,0); head.material=furM;
  const snout=BABYLON.MeshBuilder.CreateBox(name+'_sn',{width:0.045,height:0.04,depth:0.045},scene);
  snout.parent=node; snout.position.set(0.235,0.065,0); snout.material=furM;
  for(const s of [-1,1]){
    const ear=BABYLON.MeshBuilder.CreateBox(name+'_e'+(s<0?'L':'R'),{width:0.03,height:0.035,depth:0.01},scene);
    ear.parent=node; ear.position.set(0.16,0.125,s*0.03); ear.material=furM; }
  const tailM=_m(name+'_tm',0.3,0.24,0.19);
  for(let seg=0;seg<3;seg++){ const tp=BABYLON.MeshBuilder.CreateBox(name+'_t'+seg,{width:0.11,height:0.012,depth:0.012},scene);
    tp.parent=node; tp.position.set(-0.17-seg*0.10,0.05+seg*0.015,0); tp.rotation.y=Math.sin(seg*1.1+seed)*0.25; tp.rotation.z=(seg-1)*0.35; tp.material=tailM; }
  const eyeM=_m(name+'_em',0.1,0.02,0.02,[0.55,0.05,0.05]);
  for(const s of [-1,1]){ const eye=BABYLON.MeshBuilder.CreateBox(name+'_ey'+(s<0?'L':'R'),{width:0.012,height:0.012,depth:0.012},scene);
    eye.parent=node; eye.position.set(0.205,0.09,s*0.025); eye.material=eyeM; }
  interactables.set(name+'_body','rat');
  // The rat model's nose points along local +X, not Babylon's usual +Z.
  let seg=0, prog=0, pause=(seed*0.7)%2.5, dir=1, look=0;
  const face=(dx,dz)=>{ node.rotation.y=Math.atan2(-dz,dx); };
  node.position.set(path[0].x,0,path[0].z);
  face(path[1].x-path[0].x,path[1].z-path[0].z);
  elAnim(node,(dt,t)=>{
    const speed=0.9;
    if(pause>0){
      pause=Math.max(0,pause-dt);
      if(look>0){
        look=Math.max(0,look-dt);
        face(camera.position.x-node.position.x,camera.position.z-node.position.z);
      }
      return;
    }
    look=0;
    const a=path[seg], next=(seg+dir+path.length)%path.length, b=path[next];
    const dx=b.x-a.x, dz=b.z-a.z, len=Math.hypot(dx,dz);
    if(len<0.0001){ seg=next; prog=0; return; }
    prog=Math.min(1,prog+speed*dt/len);
    node.position.set(a.x+dx*prog,Math.abs(Math.sin(t*22))*0.012,a.z+dz*prog);
    // dx/dz already include the chosen direction; multiplying by dir reverses it twice.
    face(dx,dz);
    if(prog>=1){
      node.position.set(b.x,0,b.z);
      prog=0; seg=next;
      if(((seg*13+seed*7)|0)%3===0){ dir=-dir; }
      pause=0.4+(((seg*29+seed*11)%10)/10)*1.8;
      if(window.SFX&&Math.random()<0.5)SFX.skitter();
      if(pause>1.2&&((seg*7)%4===0)) look=pause*0.6;
    }
  });
  return node;
}

// ── 9. moths circling a light ───────────────────────────────────────────────
function makeMoths(name,cx,cy,cz){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(cx,cy,cz);
  const wingM=_m(name+'_m',0.55,0.5,0.42,[0.08,0.07,0.05]);
  for(let i=0;i<3;i++){
    const moth=BABYLON.MeshBuilder.CreatePlane(name+'_'+i,{size:0.07},scene);
    moth.parent=node; moth.material=wingM; moth.material.backFaceCulling=false; moth.isPickable=false;
    const ph=i*2.1, rr=0.28+i*0.07, w=1.7+i*0.4;
    elAnim(node,(dt,t)=>{ if(moth.isDisposed())return;
      moth.position.set(Math.cos(t*w+ph)*rr, Math.sin(t*0.9+ph)*0.09, Math.sin(t*w+ph)*rr*0.7);
      moth.rotation.y=t*w+ph; moth.rotation.x=Math.sin(t*40+ph)*0.5; });
  }
  return node;
}

// ── 10. spider descending on a thread ───────────────────────────────────────
function makeSpiderDrop(name,x,z,ceilY){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,ceilY-0.15,z);
  const spM=_m(name+'_m',0.06,0.05,0.04);
  const abdomen=BABYLON.MeshBuilder.CreateSphere(name+'_ab',{diameter:0.09,segments:6},scene);
  abdomen.parent=node; abdomen.scaling.set(1,0.85,1); abdomen.material=spM;
  const head=BABYLON.MeshBuilder.CreateSphere(name+'_hd',{diameter:0.05,segments:6},scene);
  head.parent=node; head.position.set(0.06,0,0); head.material=spM;
  for(let l=0;l<8;l++){ const sd=(l<4)?1:-1, li=l%4;
    const leg=BABYLON.MeshBuilder.CreateBox(name+'_l'+l,{width:0.11,height:0.008,depth:0.008},scene);
    leg.parent=node; leg.position.set(0.02, -0.01, sd*(0.05+li*0.012));
    leg.rotation.y=sd*(1.3-li*0.25); leg.rotation.z=-0.5+li*0.12; leg.material=spM; }
  const silk=BABYLON.MeshBuilder.CreateCylinder(name+'_silk',{diameter:0.006,height:1,tessellation:4},scene);
  silk.material=_m(name+'_sm',0.7,0.7,0.66); silk.isPickable=false;
  interactables.set(name+'_ab','spider');
  let cyc=0, dropT=4+((x*7)%3);
  elAnim(node,(dt,t)=>{
    cyc+=dt;
    if(cyc<dropT){ node.position.y=ceilY-0.15; }                       // waiting at the ceiling
    else if(cyc<dropT+7){ const k=(cyc-dropT)/7;                       // descending
      node.position.y=ceilY-0.15-k*k*(ceilY-0.5); }
    else if(cyc<dropT+9.5){ node.position.y=0.5+Math.sin(t*2)*0.01; }   // hanging, spinning slowly
    else if(cyc<dropT+15){ const k=(cyc-dropT-9.5)/5.5;                // retracting
      node.position.y=0.5+k*k*(ceilY-0.65); }
    else { cyc=0; }
    node.rotation.y=t*0.4;
    const sy=(ceilY+node.position.y+0.03)/2, sl=ceilY-node.position.y;
    silk.position.set(x,sy,z); silk.scaling.y=Math.max(sl,0.01);
  });
  return node;
}

// ── 11. the raven on the sill ───────────────────────────────────────────────
function makeRaven(name,x,y,z,rotY){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,y,z); node.rotation.y=rotY;
  const blkM=_m(name+'_m',0.025,0.025,0.03); blkM.specularColor=new BABYLON.Color3(0.25,0.25,0.3);
  const body=BABYLON.MeshBuilder.CreateSphere(name+'_body',{diameter:0.16,segments:8},scene);
  body.parent=node; body.scaling.set(0.8,0.9,1.35); body.material=blkM;
  const hd=BABYLON.MeshBuilder.CreateSphere(name+'_head',{diameter:0.09,segments:8},scene);
  hd.parent=node; hd.position.set(0,0.11,0.12); hd.material=blkM;
  const beak=BABYLON.MeshBuilder.CreateCylinder(name+'_beak',{diameterBottom:0.03,diameterTop:0.004,height:0.09,tessellation:6},scene);
  beak.parent=node; beak.position.set(0,0.09,0.19); beak.rotation.x=Math.PI/2; beak.material=_m(name+'_bkm',0.12,0.09,0.05);
  const tail=BABYLON.MeshBuilder.CreateBox(name+'_tail',{width:0.07,height:0.02,depth:0.14},scene);
  tail.parent=node; tail.position.set(0,0.02,-0.16); tail.rotation.x=0.25; tail.material=blkM;
  const eyeM=_m(name+'_em',0.05,0.05,0.05,[0.35,0.3,0.2]);
  for(const s of [-1,1]){ const e=BABYLON.MeshBuilder.CreateSphere(name+'_ey'+(s<0?'L':'R'),{diameter:0.016,segments:4},scene);
    e.parent=node; e.position.set(s*0.028,0.125,0.15); e.material=eyeM; }
  interactables.set(name+'_body','raven');
  let turnT=3;
  elAnim(node,(dt,t)=>{
    turnT-=dt;
    const bob=Math.sin(t*1.1)*0.008;
    node.position.y=y+bob;
    if(turnT<0){ turnT=5+((t*7)%4); }
    const phase=turnT>0.55?1:turnT>0.35?0:turnT>0.15?1:0;
    hd.rotation.y=phase?0:(0.85*((t*13|0)%2===0?1:-1));
  });
  return node;
}

// ── 12. the cauldron ────────────────────────────────────────────────────────
function makeCauldron(name,x,z){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,0,z);
  const ironM=_m(name+'_m',0.06,0.06,0.07); ironM.specularColor=new BABYLON.Color3(0.12,0.12,0.14);
  const pot=BABYLON.MeshBuilder.CreateSphere(name+'_pot',{diameter:1.15,segments:10},scene);
  pot.parent=node; pot.position.y=0.55; pot.scaling.set(1,0.85,1); pot.material=ironM;
  const rim=BABYLON.MeshBuilder.CreateTorus(name+'_rim',{diameter:0.92,tessellation:12,thickness:0.09},scene);
  rim.parent=node; rim.position.y=0.92; rim.material=ironM;
  for(let l=0;l<3;l++){ const a=l/3*Math.PI*2;
    const leg=BABYLON.MeshBuilder.CreateCylinder(name+'_leg'+l,{diameter:0.07,height:0.22,tessellation:6},scene);
    leg.parent=node; leg.position.set(Math.cos(a)*0.42,0.11,Math.sin(a)*0.42); leg.rotation.x=Math.sin(a)*0.3; leg.rotation.z=Math.cos(a)*0.3; leg.material=ironM; }
  const brewM=mat(name+'_brew'); brewM.diffuseColor=new BABYLON.Color3(0.03,0.16,0.05); brewM.emissiveColor=new BABYLON.Color3(0.08,0.60,0.16);
  const brew=BABYLON.MeshBuilder.CreateDisc(name+'_brew',{radius:0.41,tessellation:18},scene);
  brew.parent=node; brew.position.y=0.86; brew.rotation.x=Math.PI/2; brew.material=brewM;
  const glow=new BABYLON.PointLight(name+'_L',new BABYLON.Vector3(x,1.25,z),scene);
  glow.diffuse=new BABYLON.Color3(0.12,0.65,0.22); glow.intensity=0.6; glow.range=4.5;
  const ps=new BABYLON.ParticleSystem(name+'_bub',14,scene);
  ps.particleTexture=dotTex(); ps.emitter=new BABYLON.Vector3(x,0.88,z);
  ps.minEmitBox=new BABYLON.Vector3(-0.3,0,-0.3); ps.maxEmitBox=new BABYLON.Vector3(0.3,0,0.3);
  ps.color1=new BABYLON.Color4(0.3,0.9,0.4,0.7); ps.color2=new BABYLON.Color4(0.1,0.7,0.25,0.5);
  ps.colorDead=new BABYLON.Color4(0,0,0,0); ps.minSize=0.02; ps.maxSize=0.05;
  ps.minLifeTime=0.5; ps.maxLifeTime=1.2; ps.emitRate=6;
  ps.direction1=new BABYLON.Vector3(0,0.25,0); ps.direction2=new BABYLON.Vector3(0,0.45,0);
  ps.gravity=new BABYLON.Vector3(0,-0.2,0); ps.start();
  interactables.set(name+'_pot','cauldron');
  elAnim(node,(dt,t)=>{ glow.intensity=0.55+Math.sin(t*1.4)*0.1+Math.sin(t*5.7)*0.03; brewM.emissiveColor.set(0.08+Math.sin(t*2.1)*0.02,0.60,0.16); });
  return node;
}

// ── 13. chalk sigils on the floor ───────────────────────────────────────────
function makeSigils(name,x,z,r=1.1){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,0.012,z); node.rotation.y=0.4;
  const chM=_m(name+'_m',0.82,0.80,0.74,[0.05,0.05,0.045]); chM.alpha=0.65;
  const ring=BABYLON.MeshBuilder.CreateTorus(name+'_ring',{diameter:r*2,tessellation:28,thickness:0.06},scene);
  ring.parent=node; ring.scaling.x=1.6; ring.material=chM;   // torus lies flat by default
  const ring2=BABYLON.MeshBuilder.CreateTorus(name+'_ring2',{diameter:r*1.16,tessellation:24,thickness:0.05},scene);
  ring2.parent=node; ring2.scaling.x=1.6; ring2.material=chM;
  for(let s=0;s<5;s++){ const a=s/5*Math.PI*2;
    const ray=BABYLON.MeshBuilder.CreateBox(name+'_ray'+s,{width:r*0.9,height:0.004,depth:0.016},scene);
    ray.parent=node; ray.position.set(Math.cos(a)*r*0.62,0,Math.sin(a)*r*0.62);
    ray.rotation.y=-a+Math.PI/2; ray.scaling.x=(s%2)?0.55:0.9; ray.material=chM; }
  interactables.set(name+'_ring','sigils');
  return node;
}

// ── 14. cracked mirror ─────────────────────────────────────────────────────
function makeMirror(name,x,y,z,rotY){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,y,z); node.rotation.y=rotY;
  const gM=mat(name+'_m'); gM.diffuseColor=new BABYLON.Color3(0.04,0.05,0.06);
  gM.specularColor=new BABYLON.Color3(0.8,0.85,0.9); gM.emissiveColor=new BABYLON.Color3(0.03,0.04,0.05); gM.alpha=0.94;
  const glass=BABYLON.MeshBuilder.CreatePlane(name+'_glass',{width:0.55,height:1.05},scene);
  glass.parent=node; glass.material=gM; glass.material.backFaceCulling=false;
  const frM=_m(name+'_fm',0.13,0.09,0.05);
  for(const s of [-1,1]){
    const side=BABYLON.MeshBuilder.CreateBox(name+'_fs'+(s<0?'L':'R'),{width:0.05,height:1.13,depth:0.04},scene);
    side.parent=node; side.position.set(s*0.30,0,0); side.material=frM; }
  for(const s of [-1,1]){
    const cap=BABYLON.MeshBuilder.CreateBox(name+'_fc'+(s<0?'T':'B'),{width:0.65,height:0.05,depth:0.04},scene);
    cap.parent=node; cap.position.set(0,s*0.55,0); cap.material=frM; }
  const cM=_m(name+'_cm',0.0,0.0,0.0);
  for(let c=0;c<3;c++){
    const crack=BABYLON.MeshBuilder.CreateBox(name+'_c'+c,{width:0.55,height:0.006,depth:0.002},scene);
    crack.parent=node; crack.position.set((c-1)*0.06,(c-1)*0.09,0.005);
    crack.rotation.z=0.35+c*0.55+(c===1?Math.PI/2:0); crack.material=cM; }
  interactables.set(name+'_glass','crackedmirror');
  return node;
}

// ── 15. the leaking bucket ─────────────────────────────────────────────────
function makeDrip(name,x,z,wallZ,ceilY){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,0,z);
  const bM=_m(name+'_m',0.19,0.19,0.22); bM.specularColor=new BABYLON.Color3(0.3,0.3,0.35);
  const bucket=BABYLON.MeshBuilder.CreateCylinder(name+'_bkt',{diameterBottom:0.24,diameterTop:0.30,height:0.26,tessellation:12},scene);
  bucket.parent=node; bucket.position.y=0.13; bucket.material=bM;
  const waterM=mat(name+'_w'); waterM.diffuseColor=new BABYLON.Color3(0.03,0.05,0.06); waterM.emissiveColor=new BABYLON.Color3(0.02,0.05,0.06);
  const water=BABYLON.MeshBuilder.CreateDisc(name+'_wtr',{radius:0.115,tessellation:12},scene);
  water.parent=node; water.position.y=0.235; water.rotation.x=Math.PI/2; water.material=waterM;
  const streak=BABYLON.MeshBuilder.CreateBox(name+'_stk',{width:0.05,height:ceilY-0.2,depth:0.01},scene);
  streak.parent=node; streak.position.set(0,(ceilY+0.2)/2,wallZ-z<0?wallZ-z+0.01:wallZ-z-0.01);
  const sM=mat(name+'_sm'); sM.diffuseColor=new BABYLON.Color3(0.1,0.11,0.12); sM.alpha=0.5; streak.material=sM;
  const drop=BABYLON.MeshBuilder.CreateSphere(name+'_drp',{diameter:0.018,segments:4},scene);
  const dM=mat(name+'_dm'); dM.diffuseColor=new BABYLON.Color3(0.3,0.5,0.6); dM.emissiveColor=new BABYLON.Color3(0.05,0.1,0.12); drop.material=dM; drop.isPickable=false;
  interactables.set(name+'_bkt','dripbucket');
  let cyc=0;
  elAnim(node,(dt,t)=>{
    cyc+=dt;
    if(cyc>2.8){ cyc=0; }
    const k=cyc<0.35?Math.pow(cyc/0.35,2):1;
    drop.position.set(0, k<1? ceilY-0.1-k*(ceilY-0.3) : 0.245, 0);
    drop.setEnabled(cyc<0.4);
  });
  return node;
}

// ── 16. sheeted furniture ──────────────────────────────────────────────────
function makeSheet(name,x,z,rotY,kind){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,0,z); node.rotation.y=rotY;
  const shM=mat(name+'_m'); shM.diffuseColor=new BABYLON.Color3(0.72,0.70,0.63); shM.alpha=0.96; shM.specularColor=new BABYLON.Color3(0.05,0.05,0.05);
  const unM=_m(name+'_um',0.12,0.09,0.06);
  const under=BABYLON.MeshBuilder.CreateBox(name+'_und',{width:kind?1.05:0.85,height:0.72,depth:kind?0.95:0.85},scene);
  under.parent=node; under.position.y=0.36; under.material=unM;
  if(kind){ const back=BABYLON.MeshBuilder.CreateBox(name+'_bk',{width:1.0,height:0.6,depth:0.18},scene);
    back.parent=node; back.position.set(0,0.95,-0.38); back.rotation.x=-0.12; back.material=unM; }
  const sheet=BABYLON.MeshBuilder.CreateBox(name+'_sh',{width:(kind?1.15:0.95),height:1.25,depth:(kind?1.05:0.95)},scene);
  sheet.parent=node; sheet.position.y=0.62; sheet.material=shM; sheet.material.backFaceCulling=false;
  interactables.set(name+'_sh','sheeted');
  return node;
}

// ── 17. dead flowers in a vase ──────────────────────────────────────────────
function makeFlowers(name,x,z,y){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,y||0,z);
  const stM=_m(name+'_st',0.45,0.38,0.30);
  const stool=BABYLON.MeshBuilder.CreateBox(name+'_stool',{width:0.42,height:0.78,depth:0.42},scene);
  stool.parent=node; stool.position.y=0.39; stool.material=stM;
  const vM=_m(name+'_vm',0.10,0.12,0.13); vM.specularColor=new BABYLON.Color3(0.3,0.3,0.3);
  const vase=BABYLON.MeshBuilder.CreateCylinder(name+'_vase',{diameterBottom:0.06,diameterTop:0.10,height:0.20,tessellation:10},scene);
  vase.parent=node; vase.position.y=0.88; vase.material=vM;
  const st2=_m(name+'_s2',0.18,0.14,0.08);
  for(let s=0;s<4;s++){
    const stem=BABYLON.MeshBuilder.CreateBox(name+'_s'+s,{width:0.012,height:0.26+s*0.03,depth:0.012},scene);
    stem.parent=node; stem.position.set(Math.sin(s*2.2)*0.02,1.02+s*0.015,Math.cos(s*1.7)*0.02);
    stem.rotation.z=Math.sin(s*2.9)*0.45; stem.rotation.x=Math.cos(s*1.3)*0.3; stem.material=st2;
    const head=BABYLON.MeshBuilder.CreateSphere(name+'_h'+s,{diameter:0.035,segments:4},scene);
    head.parent=node; head.scaling.set(1,0.6,1); head.material=st2;
    head.position.set(stem.position.x+Math.sin(s*2.9)*0.12,1.16+s*0.015,stem.position.z+Math.cos(s*1.3)*0.05);
  }
  interactables.set(name+'_vase','deadflowers');
  return node;
}

// ── 18. the gramophone ──────────────────────────────────────────────────────
function makeGramophone(name,x,z,rotY){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,0,z); node.rotation.y=rotY;
  const woodM=_m(name+'_wm',0.16,0.10,0.05);
  const base=BABYLON.MeshBuilder.CreateBox(name+'_base',{width:0.46,height:0.30,depth:0.44},scene);
  base.parent=node; base.position.y=0.15; base.material=woodM;
  const platter=BABYLON.MeshBuilder.CreateCylinder(name+'_plt',{diameter:0.30,height:0.02,tessellation:16},scene);
  platter.parent=node; platter.position.y=0.315; platter.material=_m(name+'_pm',0.03,0.03,0.035);
  const brassM=mat(name+'_bm'); brassM.diffuseColor=new BABYLON.Color3(0.38,0.28,0.12); brassM.specularColor=new BABYLON.Color3(0.7,0.6,0.4);
  const horn=BABYLON.MeshBuilder.CreateCylinder(name+'_horn',{diameterBottom:0.34,diameterTop:0.07,height:0.46,tessellation:14},scene);
  horn.parent=node; horn.position.set(-0.18,0.62,-0.10); horn.rotation.z=-0.9; horn.material=brassM;
  const neck=BABYLON.MeshBuilder.CreateCylinder(name+'_nk',{diameter:0.05,height:0.28,tessellation:8},scene);
  neck.parent=node; neck.position.set(0.06,0.42,-0.02); neck.rotation.z=0.5; neck.material=brassM;
  const crank=BABYLON.MeshBuilder.CreateBox(name+'_crk',{width:0.03,height:0.14,depth:0.03},scene);
  crank.parent=node; crank.position.set(0.24,0.28,0.14); crank.rotation.x=0.4; crank.material=brassM;
  interactables.set(name+'_base','gramophone'); interactables.set(name+'_horn','gramophone');
  return node;
}

// ── 19. the rocking chair ───────────────────────────────────────────────────
function makeRockingChair(name,x,z,rotY){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,0,z); node.rotation.y=rotY;
  const wM=_m(name+'_m',0.22,0.15,0.08);
  const seat=BABYLON.MeshBuilder.CreateBox(name+'_seat',{width:0.48,height:0.05,depth:0.44},scene);
  seat.parent=node; seat.position.y=0.42; seat.material=wM;
  for(let s=0;s<4;s++){ const slat=BABYLON.MeshBuilder.CreateBox(name+'_sl'+s,{width:0.48,height:0.10,depth:0.02},scene);
    slat.parent=node; slat.position.set(0,0.50+s*0.14,-0.21); slat.material=wM; }
  for(const sd of [-1,1]){
    const side=BABYLON.MeshBuilder.CreateBox(name+'_sd'+(sd<0?'L':'R'),{width:0.04,height:0.75,depth:0.02},scene);
    side.parent=node; side.position.set(sd*0.23,0.40,-0.21); side.material=wM;
    const rocker=BABYLON.MeshBuilder.CreateBox(name+'_rk'+(sd<0?'L':'R'),{width:0.04,height:0.03,depth:1.05},scene);
    rocker.parent=node; rocker.position.set(sd*0.23,0.015,0); rocker.material=wM;
    for(const zz of [-0.21,0.21]){ const leg=BABYLON.MeshBuilder.CreateBox(name+'_lg'+(sd<0?'L':'R')+(zz<0?'F':'B'),{width:0.035,height:0.40,depth:0.035},scene);
      leg.parent=node; leg.position.set(sd*0.23,0.21,zz); leg.material=wM; } }
  interactables.set(name+'_seat','rockingchair');
  let rock=0, amp=0;
  elAnim(node,(dt,t)=>{ rock+=dt; if(rock>17) rock=0; amp=rock<11?Math.min(amp+dt*0.3,1):Math.max(amp-dt*0.4,0); if(window.SFX&&amp>0.35&&(t%2.3)<dt)SFX.creak(0.45);   // the chair complains as it rocks
    node.rotation.x=Math.sin(t*1.9)*0.055*amp; node.position.y=-Math.abs(Math.sin(t*1.9))*0.02*amp; });
  return node;
}

// ── 20. loose floorboard ────────────────────────────────────────────────────
function makeLooseBoard(name,x,z,rotY){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,0,z); node.rotation.y=rotY;
  const bM=_m(name+'_m',0.40,0.29,0.17);
  const board=BABYLON.MeshBuilder.CreateBox(name+'_b',{width:1.35,height:0.024,depth:0.23},scene);
  board.parent=node; board.position.y=0.016; board.rotation.z=0.012; board.rotation.x=0.008; board.material=bM;
  const nv=BABYLON.MeshBuilder.CreateSphere(name+'_nv',{diameter:0.014,segments:4},scene);
  nv.parent=node; nv.position.set(0.58,0.036,0); nv.material=_m(name+'_nm',0.2,0.2,0.22);
  interactables.set(name+'_b','looseboard');
  return node;
}

// ── 21. the dollhouse ───────────────────────────────────────────────────────
function makeDollhouse(name,x,z,rotY){
  const node=new BABYLON.TransformNode(name,scene); node.position.set(x,0,z); node.rotation.y=rotY;
  const wM=_m(name+'_m',0.19,0.12,0.09);
  const g1=BABYLON.MeshBuilder.CreateBox(name+'_g1',{width:0.52,height:0.24,depth:0.40},scene);
  g1.parent=node; g1.position.y=0.12; g1.material=wM;
  const g2=BABYLON.MeshBuilder.CreateBox(name+'_g2',{width:0.44,height:0.20,depth:0.34},scene);
  g2.parent=node; g2.position.y=0.34; g2.material=wM;
  for(const s of [-1,1]){ const roof=BABYLON.MeshBuilder.CreateBox(name+'_r'+(s<0?'L':'R'),{width:0.30,height:0.02,depth:0.38},scene);
    roof.parent=node; roof.position.set(s*0.115,0.50,0); roof.rotation.z=s*0.62; roof.material=wM; }
  const winM=mat(name+'_wm'); winM.diffuseColor=new BABYLON.Color3(0.4,0.3,0.1); winM.emissiveColor=new BABYLON.Color3(0.85,0.65,0.25); winM.backFaceCulling=false;
  let wi=0;
  for(const wy of [0.13,0.35]){ for(const wx of [-0.13,0.13]){ const win=BABYLON.MeshBuilder.CreatePlane(name+'_w'+wi,{width:0.05,height:0.06},scene);
    win.parent=node; win.position.set(wx,wy,0.201); win.material=winM; wi++; } }
  const darkW=BABYLON.MeshBuilder.CreatePlane(name+'_wdark',{width:0.05,height:0.06},scene);
  darkW.parent=node; darkW.position.set(0.13,0.35,0.201);
  const dwM=mat(name+'_dwm'); dwM.diffuseColor=new BABYLON.Color3(0.02,0.02,0.02); dwM.backFaceCulling=false; darkW.material=dwM;
  interactables.set(name+'_g1','dollhouse'); interactables.set(name+'_g2','dollhouse');
  return node;
}

// ── LIGHT SWITCHES ─────────────────────────────────────────────────────────────
// The dark rooms each get a switch by the door: click it and the room comes to life.
const LIT = {
  bathroom:{ amb:'b_amb',  off:0.25, on:0.62, offD:[0.20,0.25,0.30], onD:[0.52,0.48,0.40], lamp:[0,3.0,0],  li:1.0,  lr:7  },
  pantry:  { amb:'p_amb',  off:0.42, on:0.75, offD:[0.30,0.33,0.34], onD:[0.58,0.52,0.42], lamp:[0,3.3,0],  li:1.25, lr:11 },
  basement:{ amb:'bs_amb', off:0.20, on:0.60, offD:[0.10,0.15,0.12], onD:[0.48,0.44,0.38], lamp:[0,3.5,0],  li:1.5,  lr:16 },
  attic:   { amb:'a_amb',  off:0.40, on:0.78, offD:[0.32,0.30,0.28], onD:[0.56,0.50,0.42], lamp:[0,2.55,0], li:1.3,  lr:11 }
};
function applyRoomLight(room, on){
  const cfg = LIT[room]; if(!cfg || !scene) return;
  const amb = scene.getLightByName(cfg.amb);
  if(amb){
    amb.intensity = on ? cfg.on : cfg.off;
    const d = on ? cfg.onD : cfg.offD;
    amb.diffuse = new BABYLON.Color3(d[0], d[1], d[2]);
  }
  let lamp = scene.getLightByName('sw_lamp_' + room);
  if(on){
    if(!lamp){
      lamp = new BABYLON.PointLight('sw_lamp_' + room, new BABYLON.Vector3(cfg.lamp[0], cfg.lamp[1], cfg.lamp[2]), scene);
      lamp.diffuse = new BABYLON.Color3(0.95, 0.8, 0.55);
    }
    lamp.intensity = cfg.li; lamp.range = cfg.lr;
  } else if(lamp){ lamp.intensity = 0; }
  const lever = scene.getMeshByName('sw_lever_' + room);
  if(lever){
    const target = on ? 0.022 : -0.022;
    elAnim(lever, () => { lever.position.y += (target - lever.position.y) * 0.35; });
  }
  const bulb = scene.getMeshByName('a_bulb');   // the attic bulb glows warm when its switch is on
  if(room === 'attic' && bulb && bulb.material){
    bulb.material.emissiveColor = on ? new BABYLON.Color3(1.0, 0.88, 0.55) : new BABYLON.Color3(0.6, 0.5, 0.3);
  }
}
function makeRoomSwitch(room, x, y, z, ry){
  const plate = BABYLON.MeshBuilder.CreateBox('sw_plate_' + room, {width:0.16, height:0.22, depth:0.03}, scene);
  plate.position.set(x, y, z); plate.rotation.y = ry;
  const pm = mat('sw_pm_' + room); pm.diffuseColor = new BABYLON.Color3(0.32, 0.24, 0.13); pm.specularColor = new BABYLON.Color3(0.35, 0.30, 0.20); plate.material = pm;
  const lever = BABYLON.MeshBuilder.CreateBox('sw_lever_' + room, {width:0.045, height:0.10, depth:0.025}, scene);
  lever.parent = plate; lever.position.set(0, (state.lightsOn && state.lightsOn[room]) ? 0.022 : -0.022, 0.026);
  const lm = mat('sw_lm_' + room); lm.diffuseColor = new BABYLON.Color3(0.50, 0.42, 0.25); lm.specularColor = new BABYLON.Color3(0.50, 0.45, 0.30); lever.material = lm;
  interactables.set('sw_plate_' + room, 'lightswitch_' + room);
  interactables.set('sw_lever_' + room, 'lightswitch_' + room);
  // a revisit keeps the light you switched on
  if(state.lightsOn && state.lightsOn[room]) applyRoomLight(room, true);
}
