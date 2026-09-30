// Preview-only exhaustive room/navigation diagnostics.
if (new URLSearchParams(location.search).has('qa')) {
  // ?qa&look=x,y,z — frame a specific view for screenshots (no checks run)
  const _lk=new URLSearchParams(location.search).get('look');
  const _rm=new URLSearchParams(location.search).get('room');
  if(_lk){
    const [lx,ly,lz]=_lk.split(',').map(Number);
    let _ticks=0,_jumped=false;
    setInterval(()=>{
      if(typeof engine!=='undefined'&&engine&&typeof camera!=='undefined'&&camera&&typeof state!=='undefined'&&state.currentRoom){
        if(_rm&&!_jumped&&state.currentRoom!==_rm){ if(_ticks<10){_ticks++;return;} _jumped=true; transitionToRoom(_rm); return; }
        camera.setTarget(new BABYLON.Vector3(lx,ly,lz)); camera.getViewMatrix(true); scene.render();
      }
    },300);
  } else {
  const report=document.createElement('pre');report.id='qa-report';report.style.cssText='position:fixed;top:5%;left:3%;width:94%;height:85%;overflow:auto;background:#0a0a0aee;color:#fff;padding:14px;z-index:999999;font:13px/1.5 monospace;white-space:pre-wrap';document.body.appendChild(report);
  const log=s=>{report.textContent+=s+'\n';console.log('[qa]',s)};
  let failures=0,checks=0;
  const failLines=[];const check=(v,msg)=>{checks++;if(!v){failures++;failLines.push(msg.slice(0,64))}log((v?'PASS':'FAIL')+' '+msg)};
  addEventListener('error',e=>log('ERROR '+e.message));
  addEventListener('error',e=>{document.title='QAERR '+e.message.slice(0,200)});
  addEventListener('unhandledrejection',e=>log('REJECTION '+e.reason));
  const run=()=>{
    try{
      const roomIds=['entrance','living','kitchen','library','bathroom','pantry','basement','attic'];
      for(let i=0;i<3;i++) check(interactables.get('specimenJar'+i)==='jars','specimen jar '+i+' is selectable');
      check(ITEMS.grimoire?.collectible===false,'open grimoire has its own inspect text');
      for(const [model,min] of [['Houseplant_3',1],['Barrel',1],['Chalice',2],['Crate',1],['Book3_Open',1]]){
        const meshes=scene.meshes.filter(m=>m.name.includes('_'+model)&&m.getTotalVertices()>0);
        check(meshes.length>=min,model+' loaded ('+meshes.length+' visible meshes)');
        for(const m of meshes){
          m.computeWorldMatrix(true);
          const b=m.getBoundingInfo().boundingBox;
          const lo=b.minimumWorld,hi=b.maximumWorld;
          check(lo.y>=-0.05&&hi.y<=4.8&&lo.x>=-9&&hi.x<=9&&lo.z>=-6&&hi.z<=6,model+' within room bounds '+lo.asArray().map(n=>n.toFixed(2))+' / '+hi.asArray().map(n=>n.toFixed(2)));
        }
      }
      // ── Phase 1: locked door and sealed passage with empty inventory ──
      transitionToRoom('pantry');
      check(interactables.get('door_basement')==='door_basement','pantry basement door present');
      handleInteract('door_basement');
      check(state.activeModal==='locked_door','locked door shows the lock without the key');
      closeModal();
      check(state.currentRoom==='pantry','no descent while locked');
      transitionToRoom('library');
      check(![...interactables.values()].includes('door_basement'),'library basement door hidden behind the shelf');
      const shelfMesh=scene.getMeshByName('lib_ssBack');
      check(!!shelfMesh,'whispering shelf built');
      if(shelfMesh){shelfMesh.computeWorldMatrix(true);
        camera.setTarget(shelfMesh.getBoundingInfo().boundingSphere.centerWorld);camera.getViewMatrix(true);scene.render();
        const spick=scene.pick(engine.getRenderWidth()/2,engine.getRenderHeight()/2,m=>m.isPickable&&m.isVisible&&m.isEnabled());
        check(interactables.get(spick?.pickedMesh?.name)==='secretshelf','shelf ray-selects as the whispering shelf');}
      handleInteract('secretshelf');
      check(state.activeModal==='secretshelf','shelf only hums without the spellbook');
      closeModal();
      // ── Helga portrait: framed, visible, examineable ──
      const hpMesh=scene.getMeshByName('lib_helgaP');
      check(!!hpMesh,'portrait of the lady built');
      check(interactables.get('lib_helgaP')==='helga_portrait'&&interactables.get('lib_helgaF')==='helga_portrait','portrait frame and canvas are examineable');
      if(hpMesh){hpMesh.computeWorldMatrix(true);
        camera.setTarget(hpMesh.getBoundingInfo().boundingSphere.centerWorld);camera.getViewMatrix(true);scene.render();
        const ppick=scene.pick(engine.getRenderWidth()/2,engine.getRenderHeight()/2,m=>m.isPickable&&m.isVisible&&m.isEnabled());
        check(interactables.get(ppick?.pickedMesh?.name)==='helga_portrait','portrait ray-selects from center view' + (interactables.get(ppick?.pickedMesh?.name)==='helga_portrait' ? '' : ' (picked: '+(ppick?.pickedMesh?.name||'nothing')+')'));}
      check(ITEMS.helga_portrait?.collectible===false&&!!ITEMS.helga_portrait?.desc,'portrait has inspect text and is not collectible');
      handleInteract('helga_portrait');
      check(state.activeModal==='helga_portrait','portrait opens the examine modal');
      closeModal();

      for(const roomId of roomIds){
        if(state.currentRoom!==roomId)transitionToRoom(roomId);
        check(state.currentRoom===roomId,roomId+' builds');
        check(camera.position.x===0&&camera.position.z===0,roomId+' centered camera');
        if(roomId==='living'){
          for(const n of ['lr_couch','lr_couchBack','lr_parlourRug','lr_backDrapes_pole','lr_windowSill','lr_chimneyBreast','lr_fpKeyStone','lr_orbPedestal','lr_mantelMirrorFrame'])check(!!scene.getMeshByName(n),'parlour feature '+n+' built');
          for(let f=0;f<5;f++)check(!!scene.getMeshByName('lr_fireFlame'+f),'living fire flame '+f+' built');
          for(const [n,key] of [['lr_crystalBall','crystalball'],['lr_table','tea'],['lr_firebox','fireplace'],['lr_mantel','fireplace'],['door_entrance','door_entrance'],['door_kitchen','door_kitchen']]){
            const m=scene.getMeshByName(n);m.computeWorldMatrix(true);camera.setTarget(m.getBoundingInfo().boundingSphere.centerWorld);camera.getViewMatrix(true);scene.render();
            const hit=scene.pick(engine.getRenderWidth()/2,engine.getRenderHeight()/2,m=>m.isPickable&&m.isVisible&&m.isEnabled());
            check(interactables.get(hit?.pickedMesh?.name)===key,'parlour '+n+' ray-selects ('+(hit?.pickedMesh?.name||'none')+')');
          }
          check(scene.getMeshByName('lr_wL').material.diffuseTexture.name==='lr_damaskTex','damask wallpaper is shared rather than blank-cloned');
          const orb=scene.getMeshByName('lr_crystalBall');check(orb.position.y>1,'crystal ball raised onto its pedestal');
        }

        const doors=[...interactables.entries()].filter(([mesh,key])=>key.startsWith('door_'));
        check(doors.length>0,roomId+' has exits ('+doors.length+')');
        let rayCount=0;
        for(const [meshName,destination] of doors){
          const mesh=scene.getMeshByName(meshName);
          if(!mesh){log('MISSING door mesh '+roomId+'/'+meshName);continue}
          mesh.computeWorldMatrix(true);
          camera.setTarget(mesh.getBoundingInfo().boundingSphere.centerWorld);
          camera.getViewMatrix(true);scene.render();
          const pick=scene.pick(engine.getRenderWidth()/2,engine.getRenderHeight()/2,m=>m.isPickable&&m.isVisible&&m.isEnabled());
          if(interactables.get(pick?.pickedMesh?.name)===destination){rayCount++;log('  visible '+meshName+' -> '+destination)}
          else log('  OCCLUDED '+meshName+' by '+(pick?.pickedMesh?.name||'none'));
        }
        check(rayCount>0,roomId+' has at least one ray-selectable exit ('+rayCount+'/'+doors.length+')');
        // Doors v2 + windows: real panels, knobs, lintels, night glass
        if(roomId==='entrance'){
          ['door_living','door_kitchen','door_bathroom'].forEach(dn=>{
            check(!!scene.getMeshByName(dn),dn+' has a real panel');
            check(!!scene.getMeshByName(dn+'_knob'),dn+' has a knob');
            check(!!scene.getMeshByName(dn+'_lintel'),dn+' has a lintel');
          });
          check(interactables.get('door_kitchen_knob')==='door_kitchen','the door knob is clickable');
          check(!!scene.getMeshByName('e_wB_seg1'),'entrance doorway wall has header fills');
        }
        const STAIRS={entrance:['door_library'],library:['door_entrance']};
        const ELEMENTS={
          entrance:[['el_entr_web1',null],['el_entr_web2',null],['el_entr_dust',null],['el_entr_wax1',null],['el_entr_hat','witchhat',1],['el_entr_board','looseboard',1],['el_entr_gram','gramophone',0],['el_entr_rat','rat',0],['el_entr_moths',null]],
          living:[['el_liv_web1',null],['el_liv_dust',null],['el_liv_rock','rockingchair',0],['el_liv_sheet','sheeted',0],['el_liv_flowers','deadflowers',0],['el_liv_moths',null],['el_liv_wax1',null]],
          kitchen:[['el_kit_web1',null],['el_kit_dust',null],['el_kit_potions','potions',1],['el_kit_salt','saltline',0],['el_kit_herbs0',null],['el_kit_herbs1',null],['el_kit_herbs2',null],['el_kit_rat','rat',0],['el_kit_wax1',null],['k_benchTop','workbench',1],['k_sink','stonesink',1],['k_kettle','kettle',1],['k_woodlog0',null],['k_hearth','fireplace',1],['k_cauldron','cauldron',1]],
          library:[['el_lib_web1',null],['el_lib_web2',null],['el_lib_dust',null],['el_lib_sheet','sheeted',0],['el_lib_doll','dollhouse',0]],
          bathroom:[['el_bath_web1',null],['el_bath_mirror','crackedmirror',1],['b_tub','bathtub',1],['b_wc_bowl','hightank',1],['b_sinkbasin','washbasin',1],['b_wainscotB',null]],
          pantry:[['el_pan_web1',null],['el_pan_dust',null],['el_pan_salt','saltline',0],['el_pan_rat','rat',0]],
          basement:[['el_bs_web1',null],['el_bs_web2',null],['el_bs_cauldron','cauldron',1],['el_bs_sigils','sigils',[4.544,0.012,2.415]],['el_bs_bucket','dripbucket',0]],
          attic:[['el_at_web1',null],['el_at_web2',null],['el_at_dust',null],['el_at_sheet1','sheeted',0],['el_at_sheet2',null],['el_at_spider','spider',0],['el_at_raven','raven',1]],
        };
        (STAIRS[roomId]||[]).forEach(sn=>check(!!scene.getMeshByName(sn+'_tread0'),roomId+' staircase '+sn+' has treads'));
        (ELEMENTS[roomId]||[]).forEach(([mn,key,ray])=>{
          // elements may be a mesh, a TransformNode with children, or a ParticleSystem
          const em=scene.getMeshByName(mn)||scene.getTransformNodeByName(mn)||scene.particleSystems.find(ps=>ps.name===mn);
          check(!!em, roomId+' element '+mn+' exists');
          if(!em) return;
          if(key){
            check(interactables.get(mn)===key||[...interactables.values()].includes(key), roomId+' element '+mn+' is examineable');
            check(ITEMS[key]&&ITEMS[key].desc.length>10, roomId+' element '+mn+' has inspect text');
          }
          if(ray){
            const aim=Array.isArray(ray)?new BABYLON.Vector3(ray[0],ray[1],ray[2]):em.getHierarchyBoundingVectors().min.add(em.getHierarchyBoundingVectors().max).scale(0.5);
            camera.setTarget(aim); scene.render();
            const pick=scene.pick(scene.getEngine().getRenderWidth()/2, scene.getEngine().getRenderHeight()/2);
            const ok=pick.hit&&(pick.pickedMesh&&(pick.pickedMesh.name===mn||pick.pickedMesh.name.startsWith(mn+'_')||interactables.get(pick.pickedMesh.name)===key));
            check(ok, roomId+' element '+mn+' ray hit '+(pick.hit&&pick.pickedMesh?pick.pickedMesh.name.slice(0,28):'NOTHING'));
          }
        });
        const WINS={entrance:['win_eF1','win_eF2','win_eL1','win_eR1'],living:['win_lB1','win_lF1','win_lF2'],kitchen:['win_kB1','win_kB2'],library:['win_libR1','win_libB1'],bathroom:['win_bB1'],pantry:['win_pL1'],attic:['win_aB1']};
        (WINS[roomId]||[]).forEach(wn=>check(!!scene.getMeshByName(wn+'_glass'),roomId+' window '+wn+' glass is in the wall'));
        // Test one door through the same ray-picking function used by clicks.
        const door=doors.find(([meshName,key])=>{
          const mesh=scene.getMeshByName(meshName);if(!mesh)return false;
          camera.setTarget(mesh.getBoundingInfo().boundingSphere.centerWorld);camera.getViewMatrix(true);scene.render();
          const pick=scene.pick(engine.getRenderWidth()/2,engine.getRenderHeight()/2,m=>m.isPickable&&m.isVisible&&m.isEnabled());
          return interactables.get(pick?.pickedMesh?.name)===key;
        });
        if(door){const dest=door[1].slice(5);tryPick(engine.getRenderWidth()/2,engine.getRenderHeight()/2);check(state.currentRoom===dest,roomId+' click navigates to '+dest);}
        else check(false,roomId+' clickable navigation');
      }
      transitionToRoom('entrance');
      for(const key of ['cloak','staff','key','letter','rosemary','spellbook']){
        if(!state.inventory.includes(key)){openModal(key);document.getElementById('modal-collect').click();}
      }
      check(state.inventory.length===6,'all six items collected');
      transitionToRoom('library');transitionToRoom('entrance');
      check(state.inventory.length===6,'inventory persists across room changes');
      const uncollected=[...interactables.entries()].filter(([name,key])=>state.inventory.includes(key)&&scene.getMeshByName(name)?.isEnabled());
      check(uncollected.length===0,'collected item meshes stay disabled on revisit');

      // ── Phase 2: the iron key unlocks the pantry door ──
      transitionToRoom('pantry');
      handleInteract('door_basement');
      check(state.basementUnlocked===true,'iron key unlocks the pantry door');
      check(state.currentRoom==='pantry','unlock beat holds before the descent');
      setTimeout(()=>{
        try{
        check(state.currentRoom==='basement','key path descends to the basement');
        // ── Phase 3: the spellbook opens the hidden passage ──
        transitionToRoom('library');
        check(state.passageOpen===false,'passage still sealed before the spellbook reveals it');
        handleInteract('secretshelf');
        check(state.passageOpen===true,'spellbook opens the whispering shelf');
        check(state.activeModal===null,'the opening is an event, not a modal');
        setTimeout(()=>{
          try{
          const pivot=scene&&scene.getTransformNodeByName('lib_shelfPivot');
          check(pivot&&pivot.rotation.y>1.0,'shelf swung open on its hinge');
          const hole=scene.getMeshByName('passage_hole');
          check(!!hole&&hole.isEnabled(),'stairwell revealed');
          camera.setTarget(hole.getBoundingInfo().boundingSphere.centerWorld);camera.getViewMatrix(true);scene.render();
          const hpick=scene.pick(engine.getRenderWidth()/2,engine.getRenderHeight()/2,m=>m.isPickable&&m.isVisible&&m.isEnabled());
          check(interactables.get(hpick?.pickedMesh?.name)==='passage_hole','stairwell ray-selects as the way down');
          transitionToRoom('pantry');transitionToRoom('library');
          check(scene.getTransformNodeByName('lib_shelfPivot').rotation.y>1.0,'shelf stays open on revisit');
          handleInteract('passage_hole');
          check(state.currentRoom==='basement','passage leads down to the basement');
          // ── Phase 4: both routes now open, letter re-readable ──
          transitionToRoom('pantry');
          handleInteract('door_basement');
          check(state.currentRoom==='basement','unlocked pantry door descends freely');
          openInspect('letter');
          check(state.activeModal==='letter'&&document.getElementById('modal-collect').style.display==='none','inventory re-reads the letter clue');
          closeModal();
          // textures load async and rooms die fast — return to the library and
          // give the live scene a real 2.5s dwell before asserting readiness
          transitionToRoom('library');
          setTimeout(()=>{
            // ground-truth probe: material state + actual framebuffer pixels at the painting
            try{
              const hpP=scene.getMeshByName('lib_helgaP'); const hpM2=hpP.material; const tx2=hpM2.diffuseTexture;
              log('PROBE url='+(tx2?.url||'?')+' ready='+(tx2?.isReady())+' size='+(tx2?.getSize?JSON.stringify(tx2.getSize()):'?')+' emisTx='+(hpM2.emissiveTexture?'set':'none')+' emisCol='+(hpM2.emissiveColor?hpM2.emissiveColor.asArray().map(n=>n.toFixed(2)):'?')+' alpha='+hpM2.alpha+' cull='+hpM2.backFaceCulling+' vis='+hpP.visibility+' en='+hpP.isEnabled());
              const proj=BABYLON.Vector3.Project(hpP.getAbsolutePosition(),BABYLON.Matrix.Identity(),scene.getTransformMatrix(),camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight()));
              scene.render();
              Promise.resolve(engine.readPixels(Math.max(0,Math.round(proj.x)-1),Math.max(0,Math.round(proj.y)-1),3,3)).then(b=>{const u=b instanceof Uint8Array?b:new Uint8Array(b.buffer||b);log('PROBE fbPixel @'+Math.round(proj.x)+','+Math.round(proj.y)+' = '+Array.from(u.slice(0,12)).join(','));}).catch(e=>log('PROBE fbErr '+e.message));
              if(tx2.readPixels){tx2.readPixels().then(b=>{const u=b instanceof Uint8Array?b:new Uint8Array(b.buffer||b);const n=u.length;log('PROBE gpuTex n='+n+' head='+Array.from(u.slice(0,12)).join(',')+' mid='+Array.from(u.slice(n>>1,(n>>1)+12)).join(','));}).catch(e=>log('PROBE gpuErr '+e.message));}else log('PROBE no readPixels on texture');
            }catch(e){log('PROBE error '+e.message);}
            check(scene.getMeshByName('lib_helgaP')?.material?.diffuseTexture?.isReady()===true,'portrait texture loaded');
            check(scene.meshes.find(m=>m.material?.name==='lib_wallM')?.material?.diffuseTexture?.isReady()===true,'control wall texture loaded');
            // apparitions
            window.HEXQA_SPAWN='cat'; spawnApparitions('kitchen');
            const catB=scene.getMeshByName('app_cat_body');
            check(!!catB,'the cat spawns on demand');
            if(catB){
              check(interactables.get('app_cat_body')==='helga_cat','the cat is examineable');
              const ec=scene.getMeshByName('app_cat_e1').material.emissiveColor;
              check(ec.g>0.5&&ec.g>ec.r,'the cat has green eyes');
            }
            // ── sound + animation pass ──
            // light switch pass: every dark room gets a working switch
            ['bathroom','pantry','basement','attic'].forEach(rm=>{
              transitionToRoom(rm);
              const sw = scene.getMeshByName('sw_plate_'+rm), lv = scene.getMeshByName('sw_lever_'+rm);
              check(!!(sw&&lv), rm+' light switch built');
              const ambName = {bathroom:'b_amb',pantry:'p_amb',basement:'bs_amb',attic:'a_amb'}[rm];
              const amb = scene.getLightByName(ambName); const before = amb ? amb.intensity : -1;
              handleInteract('lightswitch_'+rm);
              const amb2 = scene.getLightByName(ambName);
              check(state.lightsOn[rm]===true && amb2 && amb2.intensity > before + 0.2, rm+' light switch raises the light');
              const lamp = scene.getLightByName('sw_lamp_'+rm);
              check(!!lamp && lamp.intensity > 0, rm+' lamp is lit');
            });
            check(SFX_LOG.includes('click'), 'light switch click sound fired');
            check(typeof SFX==='object'&&typeof SFX.doorCreak==='function'&&typeof SFX.slam==='function'&&typeof SFX.dropAnim==='function','SFX engine present (creak/doorCreak/thud/slam/skitter/dropAnim)');
            check(SFX_LOG.includes('doorCreak'),'door creak fired on a door swing');
            check(SFX_LOG.includes('creak'),'floorboard creak fired on room entry');
            window.HEXQA_SPAWN=null;
            check(state.helgaSeen===true,'the first sighting happened when the living room was entered');
            spawnApparitions('living');
            check(!scene.getMeshByName('app_helga'),'the sighting never repeats');
            window.HEXQA_SPAWN='helga'; spawnApparitions('library');
            const hm=scene.getMeshByName('app_helga');
            check(!!hm,'helga sprite renders for inspection');
            if(hm){
              check(interactables.get('app_helga')==='helga_apparition','helga is examineable');
              check(hm.material.backFaceCulling===false,'helga sprite is two-sided');
              check(hm.material.useAlphaFromDiffuseTexture===true,'helga sprite alpha comes from the art');
              camera.setTarget(hm.getAbsolutePosition());
              setTimeout(()=>{
                try{
                  const vpt=camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight());
                  const hp=BABYLON.Vector3.Project(hm.getAbsolutePosition(),BABYLON.Matrix.Identity(),scene.getTransformMatrix(),vpt);
                  const px=Math.max(0,Math.round(hp.x)-1), py=Math.max(0,Math.round(engine.getRenderHeight()-hp.y)-1);
                  Promise.resolve(engine.readPixels(px,py,3,3)).then(b=>{const bb=b instanceof Uint8Array?b:new Uint8Array(b.buffer||b);log('PROBE helgaFb alpha='+hm.material.alpha.toFixed(2)+' pos='+hm.position.toString()+' @'+px+','+py+' = '+Array.from(bb.slice(0,12)).join(','));}).catch(e=>log('PROBE helgaFbErr '+e.message));
                  log('PROBE helgaTex ready='+hm.material.diffuseTexture.isReady()+' hasAlpha='+hm.material.diffuseTexture.hasAlpha+' size='+JSON.stringify(hm.material.diffuseTexture.getSize()));
                }catch(e){log('PROBE helgaProjErr '+e.message)}
              },3000);
            }
            window.HEXQA_SPAWN=null;
            log('DONE '+(checks-failures)+'/'+checks+' checks; '+failures+' failures');
            document.title='QA '+(checks-failures)+'/'+checks+(failLines.length?' | '+failLines.join(' ; ').slice(0,700):'');
            // final dwell: the kitchen, camera parked on the cat — for visual QA
            setTimeout(()=>{
              try{
                window.HEXQA_SPAWN='cat';
                state.kJarDropped=false;   // re-arm: the pot drops during the dwell — thud checked late
                transitionToRoom('kitchen');
                setTimeout(()=>{
                  const cb2=scene.getMeshByName('app_cat_body');
                  if(cb2){
                    const cp=cb2.getAbsolutePosition();
                    camera.position.set(cp.x-2.1, 1.05, cp.z+2.3);
                    camera.setTarget(new BABYLON.Vector3(cp.x, 0.45, cp.z));
                    scene.render();
                  }
                },700);
                setTimeout(()=>{
                  check(SFX_LOG.includes('thud'),'item drop thud fired (pot lands in the final dwell) LOG='+SFX_LOG.slice(-12).join(',')+' kJar='+state.kJarDropped+' room='+state.currentRoom+' pot='+!!(scene&&scene.getMeshByName('fx_k_pot')));
                  document.title='QA '+(checks-failures)+'/'+checks+(failLines.length?' | '+failLines.join(' ; ').slice(0,700):'');
                  log('DONE '+(checks-failures)+'/'+checks+' checks; '+failures+' failures');
                },2400);
              }catch(e){log('FATAL catDwell '+e.stack)}
            },3600);
          },2500);
          setTimeout(()=>{report.style.display='none'},4500);
          }catch(e){log('FATAL '+e.stack)}
        },1800);
        }catch(e){log('FATAL '+e.stack)}
      },1000);
    }catch(e){log('FATAL '+e.stack)}
  };
  let ticks=0;
  const timer=setInterval(()=>{
    if(state.currentRoom==='entrance'&&scene&&scene.meshes.length>100){clearInterval(timer);setTimeout(run,2500)}
    else if(++ticks>80){clearInterval(timer);log('TIMEOUT waiting for entrance')}
  },250);
}
}
