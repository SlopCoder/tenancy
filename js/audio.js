/* ============================================================
   AUDIO
   The drone is the room itself, the stings are moments of
   wrongness. Everything is synthesized — no external assets.
   ============================================================ */

const audio = {
  ctx: null,
  enabled: true,
  started: false,
  drone: null,
  droneAct: 0,
  ambient: null,
  ambientRoom: null,
  heartbeat: null,
  heartbeatTimer: null,
};

function initAudio() {
  if (audio.started) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audio.ctx = new AC();
    audio.started = true;
  } catch (e) {
    audio.started = false;
  }
}

function startDrone(act) {
  if (!audio.ctx || !audio.enabled) return;
  if (audio.drone) stopDrone();
  const ctx = audio.ctx;
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.connect(ctx.destination);

  // Three low sines, slightly detuned. Act III adds dissonance.
  const base = act === 1 ? 55 : act === 2 ? 58.27 : 62.5;
  const intervals = act === 3 ? [1, 1.494, 2.13] : [1, 1.5, 2.001];
  const oscs = intervals.map((mult, i) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = base * mult + i * 0.31;
    return o;
  });

  // Low-pass filter for warmth — slowly modulated by an LFO
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = act === 3 ? 620 : 420;
  filter.Q.value = 0.4;

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.06;
  lfoGain.gain.value = 65;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  // Filtered noise as "room tone"
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) noiseData[i] = (Math.random() - 0.5) * 0.5;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 220;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.025;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);

  oscs.forEach(o => o.connect(filter));
  filter.connect(master);

  oscs.forEach(o => o.start(now));
  lfo.start(now);
  noise.start(now);

  const target = act === 3 ? 0.06 : 0.04;
  master.gain.exponentialRampToValueAtTime(target, now + 5);

  audio.drone = { master, oscs, lfo, noise };
  audio.droneAct = act;

  // Start heartbeat on Act III
  if (act === 3) startHeartbeat();
  else stopHeartbeat();
}

function stopDrone() {
  if (!audio.drone || !audio.ctx) return;
  const ctx = audio.ctx;
  const now = ctx.currentTime;
  const d = audio.drone;
  audio.drone = null;
  try {
    d.master.gain.cancelScheduledValues(now);
    d.master.gain.setValueAtTime(d.master.gain.value, now);
    d.master.gain.exponentialRampToValueAtTime(0.00001, now + 2.5);
  } catch (e) {}
  setTimeout(() => {
    try {
      d.oscs.forEach(o => o.stop());
      d.lfo.stop();
      d.noise.stop();
    } catch (e) {}
  }, 3000);
}

function fadeOutDrone(duration) {
  if (!audio.drone || !audio.ctx) return;
  const ctx = audio.ctx;
  const now = ctx.currentTime;
  try {
    audio.drone.master.gain.cancelScheduledValues(now);
    audio.drone.master.gain.setValueAtTime(audio.drone.master.gain.value, now);
    audio.drone.master.gain.exponentialRampToValueAtTime(0.00001, now + duration);
  } catch (e) {}
  stopAmbient(duration);
  stopHeartbeat();
}

function transitionDrone(newAct) {
  if (!audio.ctx || !audio.enabled) return;
  stopDrone();
  setTimeout(() => startDrone(newAct), 2600);
}

/* -- Per-room ambient layers ------------------------------ */

function startAmbient(roomKind) {
  if (!audio.ctx || !audio.enabled) return;
  if (audio.ambientRoom === roomKind) return;
  stopAmbient(1.5);
  if (!roomKind) return;

  const ctx = audio.ctx;
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.connect(ctx.destination);

  const nodes = { master, sources: [], timers: [] };

  if (roomKind === 'kitchen') {
    // Faint refrigerator hum
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = 60;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 180;
    const g = ctx.createGain();
    g.gain.value = 0.06;
    o.connect(filt); filt.connect(g); g.connect(master);
    o.start(now);
    nodes.sources.push(o);
    master.gain.exponentialRampToValueAtTime(0.5, now + 3);
  }
  else if (roomKind === 'bathroom') {
    // Slow filtered noise modulated like breath, with rare wood creaks and
    // very faint high distant tones — the half-heard thing through the wall.

    // Base: low-pass-filtered noise as a "presence" layer
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() - 0.5);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 280;
    filt.Q.value = 0.7;
    const breathGain = ctx.createGain();
    breathGain.gain.value = 0.35;

    // LFO at 0.16 Hz (~6s cycle) modulates the gain — slow inhale/exhale shape
    const breathLFO = ctx.createOscillator();
    const breathLFODepth = ctx.createGain();
    breathLFO.type = 'sine';
    breathLFO.frequency.value = 0.16;
    breathLFODepth.gain.value = 0.32;
    breathLFO.connect(breathLFODepth);
    breathLFODepth.connect(breathGain.gain);

    noise.connect(filt);
    filt.connect(breathGain);
    breathGain.connect(master);
    noise.start(now);
    breathLFO.start(now);
    nodes.sources.push(noise, breathLFO);

    // Rare wood creaks — a single descending pop, sparse and irregular
    const creak = setInterval(() => {
      if (!audio.ambient) return;
      if (Math.random() > 0.35) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(140 + Math.random() * 80, t);
      o.frequency.exponentialRampToValueAtTime(55, t + 0.45);
      const cg = ctx.createGain();
      cg.gain.setValueAtTime(0.0001, t);
      cg.gain.linearRampToValueAtTime(0.028, t + 0.05);
      cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      const cflt = ctx.createBiquadFilter();
      cflt.type = 'lowpass';
      cflt.frequency.value = 500;
      o.connect(cflt); cflt.connect(cg); cg.connect(master);
      o.start(t); o.stop(t + 0.9);
    }, 11000);
    nodes.timers.push(creak);

    // Faint distant high tone — the half-heard thing through the wall.
    // Very rare and very quiet; the player will notice it only by absence.
    const distant = setInterval(() => {
      if (!audio.ambient) return;
      if (Math.random() > 0.22) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = 1100 + Math.random() * 500;
      const dg = ctx.createGain();
      dg.gain.setValueAtTime(0.0001, t);
      dg.gain.linearRampToValueAtTime(0.014, t + 0.9);
      dg.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
      o.connect(dg); dg.connect(master);
      o.start(t); o.stop(t + 3.4);
    }, 17000);
    nodes.timers.push(distant);

    master.gain.exponentialRampToValueAtTime(1, now + 3);
  }
  else if (roomKind === 'basement') {
    // Deeper boiler hum + occasional pipe knock
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sine'; o1.frequency.value = 42;
    o2.type = 'sine'; o2.frequency.value = 84.3;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 200;
    const g = ctx.createGain();
    g.gain.value = 0.5;
    o1.connect(filt); o2.connect(filt); filt.connect(g); g.connect(master);
    o1.start(now); o2.start(now);
    nodes.sources.push(o1, o2);

    // Occasional pipe knock
    const knock = setInterval(() => {
      if (!audio.ambient) return;
      if (Math.random() > 0.35) return;
      const t = ctx.currentTime;
      const ko = ctx.createOscillator();
      ko.type = 'triangle';
      ko.frequency.setValueAtTime(180, t);
      ko.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      const kg = ctx.createGain();
      kg.gain.setValueAtTime(0.0001, t);
      kg.gain.linearRampToValueAtTime(0.04, t + 0.01);
      kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      ko.connect(kg); kg.connect(master);
      ko.start(t); ko.stop(t + 0.3);
    }, 8000);
    nodes.timers.push(knock);
    master.gain.exponentialRampToValueAtTime(0.5, now + 3);
  }
  else if (roomKind === 'attic') {
    // Wind through eaves: heavily filtered noise with slow modulation
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() - 0.5);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 400;
    filt.Q.value = 1.5;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filt.frequency);
    const g = ctx.createGain();
    g.gain.value = 0.4;
    noise.connect(filt); filt.connect(g); g.connect(master);
    noise.start(now); lfo.start(now);
    nodes.sources.push(noise, lfo);
    master.gain.exponentialRampToValueAtTime(1, now + 3);
  }

  audio.ambient = nodes;
  audio.ambientRoom = roomKind;
}

function stopAmbient(fade = 2) {
  if (!audio.ambient || !audio.ctx) return;
  const a = audio.ambient;
  const ctx = audio.ctx;
  const now = ctx.currentTime;
  audio.ambient = null;
  audio.ambientRoom = null;
  try {
    a.master.gain.cancelScheduledValues(now);
    a.master.gain.setValueAtTime(a.master.gain.value, now);
    a.master.gain.exponentialRampToValueAtTime(0.00001, now + fade);
  } catch (e) {}
  a.timers.forEach(t => clearInterval(t));
  setTimeout(() => {
    a.sources.forEach(s => { try { s.stop(); } catch (e) {} });
  }, fade * 1000 + 500);
}

/* -- Heartbeat (Act III only) ----------------------------- */

function startHeartbeat() {
  if (!audio.ctx || !audio.enabled || audio.heartbeatTimer) return;
  const ctx = audio.ctx;
  function thump() {
    if (!audio.enabled) return;
    const t = ctx.currentTime;
    const playOne = (offset) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(80, t + offset);
      o.frequency.exponentialRampToValueAtTime(40, t + offset + 0.2);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + offset);
      g.gain.linearRampToValueAtTime(0.07, t + offset + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.4);
      o.connect(g); g.connect(ctx.destination);
      o.start(t + offset); o.stop(t + offset + 0.5);
    };
    playOne(0);
    playOne(0.35);
  }
  thump();
  audio.heartbeatTimer = setInterval(thump, 4200);
  audio.heartbeat = true;
}

function stopHeartbeat() {
  if (audio.heartbeatTimer) clearInterval(audio.heartbeatTimer);
  audio.heartbeatTimer = null;
  audio.heartbeat = false;
}

function sting(type) {
  if (!audio.ctx || !audio.enabled) return;
  const ctx = audio.ctx;
  const now = ctx.currentTime;

  if (type === 'recognition') {
    const osc = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 130.81;
    filt.type = 'lowpass';
    filt.frequency.value = 600;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4);
    osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 4.2);
  }
  else if (type === 'mirror') {
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const gain = ctx.createGain();
    o1.type = 'sine'; o2.type = 'sine';
    o1.frequency.value = 196;
    o2.frequency.value = 197.6;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
    o1.connect(gain); o2.connect(gain); gain.connect(ctx.destination);
    o1.start(now); o2.start(now);
    o1.stop(now + 3.7); o2.stop(now + 3.7);
  }
  else if (type === 'foreign') {
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    o1.type = 'triangle'; o2.type = 'sine';
    o1.frequency.value = 87.3;
    o2.frequency.value = 138.6;
    filt.type = 'lowpass';
    filt.frequency.value = 900;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 6);
    o1.connect(filt); o2.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    o1.start(now); o2.start(now);
    o1.stop(now + 6.2); o2.stop(now + 6.2);
  }
  else if (type === 'discovery') {
    // Found an item: a warm pluck with a partial 5th above
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    o1.type = 'sine'; o2.type = 'sine';
    o1.frequency.value = 261.6;  // C4
    o2.frequency.value = 392;    // G4
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(2000, now);
    filt.frequency.exponentialRampToValueAtTime(600, now + 1.5);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
    o1.connect(filt); o2.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    o1.start(now); o2.start(now);
    o1.stop(now + 2.7); o2.stop(now + 2.7);
  }
  else if (type === 'revelation') {
    // Major story beat: deep, long, with a third voice rising
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const o3 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    o1.type = 'sine';
    o2.type = 'sine';
    o3.type = 'sine';
    o1.frequency.value = 65.4;
    o2.frequency.value = 98.0;
    o3.frequency.setValueAtTime(130.8, now);
    o3.frequency.exponentialRampToValueAtTime(196, now + 4);
    filt.type = 'lowpass';
    filt.frequency.value = 1100;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.4);
    gain.gain.linearRampToValueAtTime(0.08, now + 4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 8);
    o1.connect(filt); o2.connect(filt); o3.connect(filt);
    filt.connect(gain); gain.connect(ctx.destination);
    o1.start(now); o2.start(now); o3.start(now);
    o1.stop(now + 8.2); o2.stop(now + 8.2); o3.stop(now + 8.2);
  }
  else if (type === 'paper') {
    // Inventory/notebook open: short noise burst, mid-filtered
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() - 0.5);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 2500;
    filt.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    src.start(now); src.stop(now + 0.4);
  }
}

function toggleAudio() {
  audio.enabled = !audio.enabled;
  if (audio.enabled) {
    initAudio();
    startDrone(state.act || 1);
    if (state.currentRoom) startAmbient(roomToAmbient(state.currentRoom));
    audioToggle.innerHTML = '<span class="sym">♪</span>on';
  } else {
    stopDrone();
    stopAmbient(0.5);
    stopHeartbeat();
    audioToggle.innerHTML = '<span class="sym">♪</span>off';
  }
}

function roomToAmbient(room) {
  if (!room) return null;
  if (room === 'kitchen') return 'kitchen';
  if (room === 'bathroom') return 'bathroom';
  if (room === 'basement') return 'basement';
  if (room === 'attic') return 'attic';
  return null;
}
