// Preview-only exhaustive room/navigation diagnostics.
if (new URLSearchParams(location.search).has('qa')) {
  const report=document.createElement('pre');report.id='qa-report';report.style.cssText='position:fixed;top:5%;left:3%;width:94%;height:85%;overflow:auto;background:#0a0a0aee;color:#fff;padding:14px;z-index:999999;font:13px/1.5 monospace;white-space:pre-wrap';document.body.appendChild(report);
  const log=s=>{report.textContent+=s+'\n';console.log('[qa]',s)};
  let failures=0,checks=0;
  const check=(v,msg)=>{checks++;if(!v)failures++;log((v?'PASS':'FAIL')+' '+msg)};
  addEventListener('error',e=>log('ERROR '+e.message));
  addEventListener('unhandledrejection',e=>log('REJECTION '+e.reason));
  const run=()=>{
    try{
      const roomIds=['entrance','living','kitchen','library','bathroom','pantry','basement','attic'];
      for(let i=0;i<3;i++) check(interactables.get('specimenJar'+i)==='jars','specimen jar '+i+' is selectable');
      for(const [model,min] of [['Houseplant_3',1],['Barrel',1],['Chalice',2]]){
        const meshes=scene.meshes.filter(m=>m.name.includes('_'+model)&&m.getTotalVertices()>0);
        check(meshes.length>=min,model+' loaded ('+meshes.length+' visible meshes)');
        for(const m of meshes){
          m.computeWorldMatrix(true);
          const b=m.getBoundingInfo().boundingBox;
          const lo=b.minimumWorld,hi=b.maximumWorld;
          check(lo.y>=-0.05&&hi.y<=4.8&&lo.x>=-9&&hi.x<=9&&lo.z>=-6&&hi.z<=6,model+' within room bounds '+lo.asArray().map(n=>n.toFixed(2))+' / '+hi.asArray().map(n=>n.toFixed(2)));
        }
      }
      for(const roomId of roomIds){
        if(state.currentRoom!==roomId)transitionToRoom(roomId);
        check(state.currentRoom===roomId,roomId+' builds');
        check(camera.position.x===0&&camera.position.z===0,roomId+' centered camera');
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
      log('DONE '+(checks-failures)+'/'+checks+' checks; '+failures+' failures');
    }catch(e){log('FATAL '+e.stack)}
  };
  let ticks=0;
  const timer=setInterval(()=>{
    if(state.currentRoom==='entrance'&&scene&&scene.meshes.length>100){clearInterval(timer);setTimeout(run,2500)}
    else if(++ticks>80){clearInterval(timer);log('TIMEOUT waiting for entrance')}
  },250);
}
