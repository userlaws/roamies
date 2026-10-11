// Roamies sound effects. Everything is synthesized with Web Audio, so there are no audio files to ship or license.
// SFX.play('coin')            a UI or world sound
// SFX.voice('ow', 'duck')     something a pet says, in that character's voice
// SFX.talk('hello', 'cat')    a short babble, one blip per syllable or so
const SFX = (() => {
  'use strict';
  let ctx = null, master = null, volume = .6, enabled = true;
  const last = new Map();   // sound name -> last start time, to stop machine-gunning

  function audio() {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain(); master.gain.value = volume;
      const squash = ctx.createDynamicsCompressor();   // keeps overlapping sounds from clipping
      master.connect(squash); squash.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const hz = (semitones, from = 440) => from * Math.pow(2, semitones / 12);

  // One pitched note. f2 glides the pitch; vib adds vibrato; trem adds a purr-style flutter.
  function tone({ type = 'square', f = 440, f2, t = 0, dur = .1, gain = .2, attack = .004, vib, trem, hold = 0 }) {
    const a = audio(), t0 = a.currentTime + t;
    const osc = a.createOscillator(), g = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, f), t0);
    if (f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
    if (vib) {
      const lfo = a.createOscillator(), depth = a.createGain();
      lfo.frequency.value = vib.rate || 8; depth.gain.value = vib.depth || f * .04;
      lfo.connect(depth); depth.connect(osc.frequency); lfo.start(t0); lfo.stop(t0 + dur + .05);
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    if (hold) g.gain.setValueAtTime(gain, t0 + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let out = g;
    if (trem) {
      const lfo = a.createOscillator(), depth = a.createGain(), am = a.createGain();
      lfo.frequency.value = trem; depth.gain.value = .5; am.gain.value = .5;
      lfo.connect(depth); depth.connect(am.gain); g.connect(am); out = am; lfo.start(t0); lfo.stop(t0 + dur + .05);
    }
    osc.connect(g); out.connect(master);
    osc.start(t0); osc.stop(t0 + dur + .05);
  }

  let noiseBuf = null;
  // A burst of filtered noise: clicks, thuds, crunches, whooshes.
  function noise({ t = 0, dur = .08, gain = .2, f = 1500, f2, q = 1, type = 'bandpass', attack = .002 }) {
    const a = audio(), t0 = a.currentTime + t;
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = a.createBufferSource(), filt = a.createBiquadFilter(), g = a.createGain();
    src.buffer = noiseBuf; src.loop = true;
    filt.type = type; filt.Q.value = q;
    filt.frequency.setValueAtTime(f, t0);
    if (f2) filt.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt); filt.connect(g); g.connect(master);
    src.start(t0, Math.random() * .5); src.stop(t0 + dur + .05);
  }
  // A run of notes: [semitones above A4, ...] played `step` seconds apart.
  function arp(notes, { step = .07, dur = .16, type = 'triangle', gain = .16, t = 0 } = {}) {
    notes.forEach((n, i) => tone({ type, f: hz(n), t: t + i * step, dur, gain }));
  }
  function sparkle(t = 0, n = 6, gain = .06) {
    for (let i = 0; i < n; i++) tone({ type: 'sine', f: hz(24 + Math.floor(Math.random() * 14)), t: t + i * .045 + Math.random() * .02, dur: .12, gain });
  }
  const coin = (t = 0, gain = .14) => { tone({ type: 'square', f: 988, t, dur: .07, gain }); tone({ type: 'square', f: 1319, t: t + .07, dur: .32, gain }); };

  /* ---------- sounds ---------- */
  const SOUNDS = {
    // interface
    hover: () => tone({ type: 'sine', f: 1700, dur: .025, gain: .035 }),
    click: () => { tone({ type: 'sine', f: 760, f2: 420, dur: .05, gain: .16 }); noise({ dur: .015, gain: .05, f: 4000, type: 'highpass' }); },
    tab: () => { tone({ type: 'triangle', f: 660, dur: .05, gain: .13 }); tone({ type: 'triangle', f: 880, t: .05, dur: .07, gain: .13 }); },
    tryon: () => tone({ type: 'triangle', f: 520, f2: 760, dur: .08, gain: .14 }),
    equip: () => { tone({ type: 'sawtooth', f: 280, f2: 900, dur: .07, gain: .07 }); tone({ type: 'sine', f: 980, f2: 620, t: .07, dur: .07, gain: .18 }); },
    deny: () => { tone({ type: 'square', f: 170, dur: .08, gain: .1 }); tone({ type: 'square', f: 150, t: .1, dur: .1, gain: .1 }); },
    on: () => tone({ type: 'triangle', f: 560, f2: 900, dur: .07, gain: .13 }),
    off: () => tone({ type: 'triangle', f: 900, f2: 520, dur: .07, gain: .13 }),
    key: () => noise({ dur: .02, gain: .07, f: 2600, q: 2 }),
    slide: () => tone({ type: 'sine', f: 900, dur: .03, gain: .08 }),
    copy: () => { tone({ type: 'sine', f: 880, dur: .05, gain: .12 }); tone({ type: 'sine', f: 1175, t: .06, dur: .1, gain: .12 }); },
    open: () => arp([3, 7, 10, 15], { step: .05, dur: .14, gain: .1 }),
    // money and rewards
    coin: () => coin(),
    coins: () => { coin(0, .11); coin(.09, .1); coin(.18, .1); },
    buy: () => {                                     // cash register, then the shine
      noise({ dur: .03, gain: .12, f: 3200, q: 3 }); noise({ t: .06, dur: .03, gain: .12, f: 3600, q: 3 });
      coin(.1); arp([19, 23, 26, 31], { t: .2, step: .055, dur: .22, gain: .12 }); sparkle(.3, 5);
    },
    fanfare: () => {                                 // epic and legendary reveals
      const lead = [[3, 0], [7, .12], [10, .24], [15, .36], [10, .6], [15, .72]];
      lead.forEach(([n, t], i) => { tone({ type: 'square', f: hz(n), t, dur: i === 3 || i === 5 ? .42 : .14, gain: .1, hold: .05 }); tone({ type: 'triangle', f: hz(n - 12), t, dur: .3, gain: .12 }); });
      sparkle(.4, 10, .07); sparkle(.8, 8, .06);
    },
    reward: () => { coin(0, .1); coin(.08, .1); arp([7, 12, 16, 19, 24], { t: .2, step: .06, dur: .2, gain: .12 }); },
    quest: () => { arp([12, 16, 19], { step: .001, dur: .2, gain: .1 }); arp([14, 17, 21, 26], { t: .18, step: .001, dur: .5, gain: .1 }); sparkle(.2, 4); },
    // capsule machine
    crank: () => { for (let i = 0; i < 7; i++) noise({ t: i * .07, dur: .03, gain: .14, f: 900 + i * 60, q: 4 }); },
    rattle: () => { for (let i = 0; i < 5; i++) tone({ type: 'sine', f: 300 + Math.random() * 500, f2: 200, t: i * .06 + Math.random() * .02, dur: .05, gain: .1 }); },
    drop: () => { tone({ type: 'sine', f: 700, f2: 180, dur: .22, gain: .16 }); noise({ t: .22, dur: .07, gain: .2, f: 220, type: 'lowpass' }); tone({ type: 'sine', f: 150, f2: 70, t: .22, dur: .1, gain: .2 }); },
    pop: () => { tone({ type: 'sine', f: 400, f2: 1200, dur: .05, gain: .2 }); noise({ dur: .04, gain: .12, f: 2500, type: 'highpass' }); sparkle(.04, 6); },
    // world
    jump: () => tone({ type: 'square', f: 300, f2: 620, dur: .09, gain: .05 }),
    land: () => { noise({ dur: .05, gain: .1, f: 260, type: 'lowpass' }); tone({ type: 'sine', f: 130, f2: 70, dur: .07, gain: .12 }); },
    thud: () => { noise({ dur: .09, gain: .22, f: 200, type: 'lowpass' }); tone({ type: 'sine', f: 110, f2: 50, dur: .14, gain: .25 }); },
    bonk: () => { tone({ type: 'triangle', f: 240, f2: 90, dur: .1, gain: .2 }); noise({ dur: .03, gain: .1, f: 1200 }); },
    poof: () => noise({ dur: .26, gain: .13, f: 400, f2: 2600, q: .8 }),
    heart: () => { tone({ type: 'sine', f: 880, f2: 1320, dur: .07, gain: .12 }); tone({ type: 'sine', f: 1320, f2: 1760, t: .07, dur: .1, gain: .1 }); },
    crunch: () => { for (let i = 0; i < 3; i++) noise({ t: i * .13, dur: .05, gain: .16, f: 1700 + Math.random() * 600, q: 1.5 }); },
    kick: () => tone({ type: 'sine', f: 520, f2: 190, dur: .09, gain: .2 }),
    bounce: () => tone({ type: 'sine', f: 320, f2: 170, dur: .06, gain: .12 }),
    plop: () => tone({ type: 'sine', f: 240, f2: 520, dur: .06, gain: .12 }),
    alert: () => { [0, .3].forEach(t => { tone({ type: 'square', f: 660, t, dur: .1, gain: .09 }); tone({ type: 'square', f: 520, t: t + .12, dur: .12, gain: .09 }); }); },
    doorbell: () => { [[784, 0, .5], [622, .32, .7]].forEach(([f, t, dur]) => { tone({ type: 'sine', f, t, dur, gain: .16 }); tone({ type: 'sine', f: f * 2.01, t, dur: dur * .6, gain: .05 }); }); },
    bye: () => { tone({ type: 'triangle', f: 660, t: 0, dur: .12, gain: .12 }); tone({ type: 'triangle', f: 494, t: .13, dur: .2, gain: .12 }); },
    hello: () => arp([7, 12, 16], { step: .08, dur: .16, gain: .12 }),
    gift: () => { tone({ type: 'sine', f: 500, f2: 1000, dur: .06, gain: .16 }); arp([12, 16, 19, 24], { t: .06, step: .05, dur: .2, gain: .12 }); sparkle(.15, 6); },
    dance: () => arp([12, 12, 19, 19, 21, 21, 19], { step: .16, dur: .14, type: 'square', gain: .06 }),
    zip: () => tone({ type: 'sawtooth', f: 200, f2: 1400, dur: .25, gain: .05 }),
    star: () => sparkle(0, 5, .07),
  };

  /* ---------- pet voices: every character has a pitch and a timbre ---------- */
  const VOICES = {
    cat: { type: 'triangle', f: 640 }, bunny: { type: 'sine', f: 860 }, bear: { type: 'sawtooth', f: 210, soft: .6 },
    duck: { type: 'sawtooth', f: 430, soft: .6 }, frog: { type: 'square', f: 170, soft: .7 }, fox: { type: 'triangle', f: 540 },
    penguin: { type: 'square', f: 500, soft: .6 }, blob: { type: 'sine', f: 320 }, shroom: { type: 'triangle', f: 780 },
    boo: { type: 'sine', f: 420, vib: true }, alien: { type: 'sine', f: 700, vib: true }, robot: { type: 'square', f: 250, soft: .6, steps: true },
  };
  const voiceOf = (ch) => VOICES[ch] || VOICES.cat;
  function say(v, { up = 1, down = 1, t = 0, dur = .12, gain = .16 }) {
    tone({ type: v.type, f: v.f * up, f2: v.f * down, t, dur, gain: gain * (v.soft || 1), vib: v.vib ? { rate: 9, depth: v.f * .06 } : null });
  }
  const VOICED = {
    // "ow!": a quick yelp up, then a long sad slide down
    ow: (v) => { say(v, { up: 1.5, down: 2, dur: .07, gain: .2 }); say(v, { up: 1.9, down: .75, t: .07, dur: .34, gain: .2 }); noise({ dur: .08, gain: .16, f: 220, type: 'lowpass' }); },
    oof: (v) => say(v, { up: 1.2, down: .7, dur: .14, gain: .18 }),
    squeak: (v) => say(v, { up: 1.4, down: 2.1, dur: .08, gain: .14 }),
    whee: (v) => { say(v, { up: 1, down: 1.9, dur: .22, gain: .1 }); say(v, { up: 1.9, down: 1.3, t: .22, dur: .25, gain: .1 }); },
    happy: (v) => { say(v, { up: 1, down: 1.5, dur: .08 }); say(v, { up: 1.5, down: 2, t: .1, dur: .12 }); },
    grumble: (v) => { say(v, { up: .8, down: .6, dur: .16 }); say(v, { up: .7, down: .55, t: .2, dur: .2 }); },
    yawn: (v) => say(v, { up: 1.3, down: .6, dur: .55, gain: .1 }),
    nom: (v) => { for (let i = 0; i < 3; i++) say(v, { up: .9, down: 1.1, t: i * .13 + .03, dur: .06, gain: .1 }); },
    purr: (v) => tone({ type: 'triangle', f: Math.min(140, v.f * .25), dur: .7, gain: .2, trem: 26, attack: .08 }),
    dizzy: (v) => tone({ type: v.type, f: v.f, dur: .7, gain: .08 * (v.soft || 1), vib: { rate: 5, depth: v.f * .25 } }),
  };

  const ok = (name, gap = .04) => {
    if (!enabled || volume <= 0) return false;
    const now = performance.now() / 1000;
    if (now - (last.get(name) || 0) < gap) return false;
    last.set(name, now); return true;
  };
  function attempt(fn) { try { fn(); } catch (err) { /* audio is never worth crashing over */ } }

  return {
    play(name) { const s = SOUNDS[name]; if (s && ok(name)) attempt(s); },
    voice(name, ch) { const s = VOICED[name]; if (s && ok('v:' + name, .12)) attempt(() => s(voiceOf(ch))); },
    // Babble: the longer the line, the more blips. Robots stick to a few fixed pitches.
    talk(text, ch) {
      if (!ok('talk', .25)) return;
      const v = voiceOf(ch), n = Math.max(2, Math.min(9, Math.round(String(text).length / 3)));
      const scale = v.steps ? [0, 0, 7, 12] : [0, 2, 4, 7, 9, 12];
      attempt(() => { for (let i = 0; i < n; i++) { const s = scale[Math.floor(Math.random() * scale.length)]; say(v, { up: hz(s, 1), down: hz(s + (Math.random() < .5 ? 1 : -1), 1), t: i * .075, dur: .055, gain: .11 }); } });
    },
    set({ volume: v, enabled: e }) {
      if (typeof v === 'number') { volume = Math.max(0, Math.min(1, v)); if (master) master.gain.value = volume; }
      if (typeof e === 'boolean') enabled = e;
    },
    // Runs every sound once (every voice for the voiced ones) and returns the names of any that threw.
    selfTest() {
      const failed = [];
      const run = (name, fn) => { try { fn(); } catch (err) { failed.push(`${name}: ${err.message}`); } };
      for (const [name, fn] of Object.entries(SOUNDS)) run(name, fn);
      for (const [name, fn] of Object.entries(VOICED)) for (const ch of Object.keys(VOICES)) run(`${name}/${ch}`, () => fn(VOICES[ch]));
      return failed;
    },
  };
})();
