// ─── SOUND & CHOREOGRAPHY ──────────────────────────────────────────────────────
// Every sound in the house is synthesised at runtime with the Web Audio API —
// no files, no licences, nothing to load. And every sound is *paired*: the
// door creak rides the swing, the thud rides the drop helper, the slam rides
// the shake. window.SFX_LOG records what fired (the QA suite reads it).
window.SFX_LOG = [];
const SFX = (() => {
  let ctx = null, master = null;

  // Must be called from a user gesture (the Enter button) — autoplay policy.
  function unlock(){
    if(!ctx){
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      } catch(e){ return; }
    }
    if(ctx.state === 'suspended') ctx.resume();
  }
  const ready = () => !!(ctx && ctx.state === 'running');
  const note  = (n) => { SFX_LOG.push(n); if(SFX_LOG.length > 80) SFX_LOG.shift(); };

  // attack/decay envelope
  function env(g, t0, a, d, peak){
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }
  function noiseBuf(dur){
    const b = ctx.createBuffer(1, Math.max(1, (dur * ctx.sampleRate) | 0), ctx.sampleRate);
    const d = b.getChannelData(0);
    for(let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  // A floorboard creak — dry stick-slip. Sawtooth wobble through a bandpass.
  function creak(intensity){
    intensity = intensity || 1;
    note('creak');
    if(!ready()) return;
    const t0 = ctx.currentTime;
    const f  = 70 + Math.random() * 60;
    const o  = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(f, t0);
    o.frequency.linearRampToValueAtTime(f * (0.6 + Math.random() * 0.8), t0 + 0.28 * intensity);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 3; bp.Q.value = 6;
    const g  = ctx.createGain(); env(g, t0, 0.02, 0.3 * intensity, 0.12 * intensity);
    o.connect(bp); bp.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + 0.5 * intensity + 0.1);
  }

  // The door — a longer, unhurried hinge creak, rising in pitch as it swings.
  function doorCreak(){
    note('doorCreak');
    if(!ready()) return;
    const t0 = ctx.currentTime;
    const o  = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(55, t0);
    o.frequency.exponentialRampToValueAtTime(120, t0 + 0.55);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 8;
    bp.frequency.setValueAtTime(300, t0);
    bp.frequency.exponentialRampToValueAtTime(900, t0 + 0.55);
    const g  = ctx.createGain(); env(g, t0, 0.05, 0.6, 0.16);
    o.connect(bp); bp.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + 0.8);
  }

  // A thud — the body knock of an object landing, plus a little settling clatter.
  function thud(size){
    size = size || 1;
    note('thud');
    if(!ready()) return;
    const t0 = ctx.currentTime;
    const o  = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(90 * size, t0);
    o.frequency.exponentialRampToValueAtTime(38 * size, t0 + 0.12);
    const g  = ctx.createGain(); env(g, t0, 0.004, 0.22, 0.5);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 0.3);
    const n  = ctx.createBufferSource(); n.buffer = noiseBuf(0.15);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400;
    const ng = ctx.createGain(); env(ng, t0 + 0.005, 0.002, 0.12, 0.10);
    n.connect(hp); hp.connect(ng); ng.connect(master); n.start(t0);
  }

  // The slam — a door driven shut: deep boom and the whole frame buzzing.
  function slam(){
    note('slam');
    if(!ready()) return;
    const t0 = ctx.currentTime;
    const o  = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(70, t0);
    o.frequency.exponentialRampToValueAtTime(30, t0 + 0.4);
    const g  = ctx.createGain(); env(g, t0, 0.003, 0.5, 0.9);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 0.7);
    const n  = ctx.createBufferSource(); n.buffer = noiseBuf(0.25);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
    const ng = ctx.createGain(); env(ng, t0, 0.002, 0.24, 0.45);
    n.connect(lp); lp.connect(ng); ng.connect(master); n.start(t0);
  }

  // Rat feet — five quick ticks of claws on board.
  function skitter(){
    note('skitter');
    if(!ready()) return;
    const t0 = ctx.currentTime;
    for(let i = 0; i < 5; i++){
      const n  = ctx.createBufferSource(); n.buffer = noiseBuf(0.03);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = 2200 + Math.random() * 800; bp.Q.value = 3;
      const g  = ctx.createGain(); env(g, t0 + i * 0.045 + Math.random() * 0.012, 0.001, 0.05, 0.05);
      n.connect(bp); bp.connect(g); g.connect(master); n.start(t0 + i * 0.045);
    }
  }

  // An item knocked from its place: falls, thuds on landing, bounces, settles.
  // The animation and the sound are one gesture — this is the pairing point.
  function dropAnim(mesh, targetY, opts){
    opts = opts || {};
    const sc = mesh.getScene();
    let v = 0, bounces = 0, done = false, last = performance.now();
    const spin = opts.spin || 0;
    const obs = sc.onBeforeRenderObservable.add(() => {
      if(mesh.isDisposed()){ sc.onBeforeRenderObservable.remove(obs); return; }
      if(done) return;
      const now = performance.now();
      const dt  = Math.min(0.05, (now - last) / 1000); last = now;
      v += 9.81 * dt * 2.2;                       // a touch heavy, for drama
      mesh.position.y -= v * dt;
      if(spin) mesh.rotation.z += spin * dt;
      if(mesh.position.y <= targetY){
        mesh.position.y = targetY;
        thud(opts.size || 1);
        bounces++;
        if(v > 1.6 && bounces < 3){ v = -v * 0.3; }   // small rebound
        else {
          done = true;
          if(opts.rest) opts.rest(mesh);
          sc.onBeforeRenderObservable.remove(obs);
        }
      }
    });
  }

  // A light switch - a dry mechanical snap.
  function click(){
    note('click');
    if(!ready()) return;
    const t0 = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf(0.05);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2300; bp.Q.value = 7;
    const g = ctx.createGain(); env(g, t0, 0.002, 0.05, 0.5);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + 0.09);
  }

  return { unlock, creak, doorCreak, thud, slam, skitter, dropAnim, click };
})();
window.SFX = SFX;
