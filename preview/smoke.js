// Preview-only instrumentation: never ship this file into the live game's root.
if (new URLSearchParams(location.search).has('smoke')) {
  const report = document.createElement('pre');
  report.id='smoke-report';
  report.style.cssText='position:fixed;left:4%;bottom:9%;max-width:92%;max-height:45%;overflow:auto;background:#13110f;color:#ecdfb8;padding:12px;z-index:999999;font:12px/1.4 monospace;white-space:pre-wrap';
  document.body.appendChild(report);
  const log = message => { report.textContent+=message+'\n'; console.log('[smoke]',message); };
  const targets=['cloakMesh','letterMesh','keyBow','rosemary0','staffStem','spellbookMesh','door_living','door_library','door_kitchen','door_bathroom'];
  const run = () => {
    if (!scene || !camera || state.currentRoom !== 'entrance') return;
    const originalYaw=camYaw, originalPitch=camPitch;
    log('Entrance Hall ready: '+scene.meshes.length+' meshes; '+interactables.size+' hotspots.');
    for (const name of targets) {
      const mesh=scene.getMeshByName(name);
      if(!mesh){log('MISSING '+name);continue;}
      mesh.computeWorldMatrix(true);
      const target=mesh.getBoundingInfo().boundingSphere.centerWorld;
      camera.setTarget(target);camera.getViewMatrix(true);scene.render();
      const pick=scene.pick(engine.getRenderWidth()/2, engine.getRenderHeight()/2,m=>m.isPickable&&m.isVisible&&m.isEnabled());
      const picked=pick?.pickedMesh?.name||'none';
      log(name+' => '+picked+' ['+(interactables.get(picked)||'blocked')+']');
    }
    camYaw=originalYaw;camPitch=originalPitch;applyRot();
    // Check state survives entering another room and returning.
    openModal('staff');document.getElementById('modal-collect').click();
    log('Collected staff: '+state.inventory.join(',')+'; count='+document.getElementById('item-count').textContent);
    transitionToRoom('living');transitionToRoom('entrance');
    log('Return to Entrance: '+state.currentRoom+'; staff disabled='+!scene.getMeshByName('staffStem').isEnabled());
  };
  let ticks=0;
  const timer=setInterval(()=>{
    if(state.currentRoom==='entrance' && scene && scene.meshes.length>100){clearInterval(timer);setTimeout(run,1500);}
    else if(++ticks>80){clearInterval(timer);log('TIMEOUT waiting for entrance');}
  },250);
}
