// Roamies sound effects. Everything is synthesized with Web Audio, so there are no audio files to ship or license.
// SFX.play('coin')            a UI or world sound
// SFX.voice('ow', 'duck')     something a pet says, in that character's voice
// SFX.talk('hello', 'cat')    a short babble, one blip per syllable or so
const SFX = (() => {
  'use strict';
  let ctx = null, master = null, volume = .6, enabled = true, duck = 1;   // duck: turned down while the user's music plays
  const last = new Map();   // sound name -> last start time, to stop machine-gunning

  function audio() {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain(); master.gain.value = volume * duck;
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
    tryon: () => { noise({ dur: .07, gain: .045, f: 1500, f2: 3800, q: 1.2, attack: .015 }); tone({ type: 'triangle', f: 520, f2: 760, t: .02, dur: .08, gain: .13 }); },   // a swish of cloth, then the pop
    equip: () => { tone({ type: 'sawtooth', f: 280, f2: 900, dur: .07, gain: .07 }); tone({ type: 'sine', f: 980, f2: 620, t: .07, dur: .07, gain: .18 }); },
    deny: () => { tone({ type: 'square', f: 170, dur: .08, gain: .1 }); tone({ type: 'square', f: 150, t: .1, dur: .1, gain: .1 }); },
    locked: () => {                                  // a padlock rattled: "nuh-uh", with no buzz in it
      noise({ dur: .02, gain: .06, f: 1700, q: 4 });
      tone({ type: 'triangle', f: 330, f2: 300, dur: .06, gain: .085 }); tone({ type: 'triangle', f: 262, f2: 233, t: .085, dur: .1, gain: .085 });
    },
    on: () => tone({ type: 'triangle', f: 560, f2: 900, dur: .07, gain: .13 }),
    off: () => tone({ type: 'triangle', f: 900, f2: 520, dur: .07, gain: .13 }),
    key: () => noise({ dur: .02, gain: .07, f: 2600, q: 2 }),
    slide: () => tone({ type: 'sine', f: 900, dur: .03, gain: .08 }),
    copy: () => { tone({ type: 'sine', f: 880, dur: .05, gain: .12 }); tone({ type: 'sine', f: 1175, t: .06, dur: .1, gain: .12 }); },
    open: () => arp([3, 7, 10, 15], { step: .05, dur: .14, gain: .1 }),
    step: () => {                                    // a box ticked, then one clear ding
      noise({ dur: .012, gain: .08, f: 3800, type: 'highpass' }); tone({ type: 'sine', f: 880, f2: 660, dur: .03, gain: .1 });
      tone({ type: 'sine', f: hz(19), t: .05, dur: .3, gain: .12 }); tone({ type: 'sine', f: hz(19) * 2.01, t: .05, dur: .15, gain: .035 });
    },
    sparkle: () => {                                 // three glints running upward, never quite the same twice
      const n = 19 + Math.floor(Math.random() * 6);
      [0, 7, 12].forEach((k, i) => tone({ type: 'sine', f: hz(n + k), t: i * .035, dur: .09 + i * .03, gain: .05 - i * .008 }));
    },
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
    unlock: () => {                                  // ka-chunk: the shackle springs, then light pours out
      noise({ dur: .02, gain: .13, f: 2400, q: 7 });
      noise({ t: .06, dur: .03, gain: .16, f: 1300, q: 4 }); tone({ type: 'triangle', f: 280, f2: 150, t: .06, dur: .07, gain: .16 });
      tone({ type: 'sine', f: hz(7), f2: hz(19), t: .15, dur: .2, gain: .1, attack: .02 }); tone({ type: 'sine', f: hz(12), f2: hz(24), t: .15, dur: .2, gain: .07, attack: .02 });
      tone({ type: 'triangle', f: hz(24), t: .33, dur: .4, gain: .1 }); tone({ type: 'sine', f: hz(31), t: .33, dur: .3, gain: .05 }); sparkle(.36, 4, .045);
    },
    levelup: () => {                                 // a run up the scale, a chord that lands, and glitter on top
      [0, 2, 4, 5, 7, 9, 11, 12].forEach((n, i) => tone({ type: 'triangle', f: hz(n + 3), t: i * .045, dur: .09, gain: .085 }));
      [15, 19, 22, 27].forEach(n => tone({ type: 'triangle', f: hz(n), t: .38, dur: .7, gain: .055, hold: .12 }));
      tone({ type: 'sine', f: hz(3), t: .38, dur: .6, gain: .1 });
      sparkle(.42, 8, .05); sparkle(.78, 5, .04);
    },
    quest: () => { arp([12, 16, 19], { step: .001, dur: .2, gain: .1 }); arp([14, 17, 21, 26], { t: .18, step: .001, dur: .5, gain: .1 }); sparkle(.2, 4); },
    // capsule machine
    crank: () => { for (let i = 0; i < 7; i++) noise({ t: i * .07, dur: .03, gain: .14, f: 900 + i * 60, q: 4 }); },
    rattle: () => { for (let i = 0; i < 5; i++) tone({ type: 'sine', f: 300 + Math.random() * 500, f2: 200, t: i * .06 + Math.random() * .02, dur: .05, gain: .1 }); },
    drop: () => { tone({ type: 'sine', f: 700, f2: 180, dur: .22, gain: .16 }); noise({ t: .22, dur: .07, gain: .2, f: 220, type: 'lowpass' }); tone({ type: 'sine', f: 150, f2: 70, t: .22, dur: .1, gain: .2 }); },
    pop: () => { tone({ type: 'sine', f: 400, f2: 1200, dur: .05, gain: .2 }); noise({ dur: .04, gain: .12, f: 2500, type: 'highpass' }); sparkle(.04, 6); },
    // world
    jump: () => tone({ type: 'square', f: 300, f2: 620, dur: .09, gain: .05 }),
    land: () => { noise({ dur: .05, gain: .1, f: 260, type: 'lowpass' }); tone({ type: 'sine', f: 130, f2: 70, dur: .07, gain: .12 }); },
    thunder: () => { noise({ dur: .5, gain: .1, f: 140, f2: 60, type: 'lowpass', attack: .03 }); noise({ t: .12, dur: .7, gain: .06, f: 90, type: 'lowpass', attack: .1 }); },   // far off: the storm cloud hat
    thud: () => { noise({ dur: .09, gain: .22, f: 200, type: 'lowpass' }); tone({ type: 'sine', f: 110, f2: 50, dur: .14, gain: .25 }); },
    bonk: () => { tone({ type: 'triangle', f: 240, f2: 90, dur: .1, gain: .2 }); noise({ dur: .03, gain: .1, f: 1200 }); },
    // building the update house: a hammer on a nail, a hammer on something bigger, and the house at work
    tink: () => { const f = 1900 + Math.random() * 500; tone({ type: 'triangle', f, f2: f * .97, dur: .09, gain: .11 }); noise({ dur: .02, gain: .07, f: 5200, type: 'highpass' }); },
    clank: () => { tone({ type: 'square', f: 620, f2: 540, dur: .07, gain: .07 }); tone({ type: 'triangle', f: 930, f2: 880, dur: .12, gain: .08 }); noise({ dur: .04, gain: .09, f: 2600, q: 3 }); },
    whirr: () => { tone({ type: 'sawtooth', f: 180, f2: 420, dur: .26, gain: .05, trem: 46, attack: .03 }); noise({ dur: .24, gain: .03, f: 1400, f2: 3200, q: 4, attack: .04 }); },
    poof: () => noise({ dur: .26, gain: .13, f: 400, f2: 2600, q: .8 }),
    whoosh: () => {                                  // air rushing past: swells in, sweeps over, trails away
      noise({ dur: .2, gain: .07, f: 500, f2: 3200, q: 1.4, attack: .09 }); noise({ t: .17, dur: .26, gain: .055, f: 3000, f2: 500, q: 1.4, attack: .03 });
      tone({ type: 'sine', f: 260, f2: 780, dur: .2, gain: .03, attack: .06 }); tone({ type: 'sine', f: 760, f2: 300, t: .18, dur: .22, gain: .025, attack: .02 });
    },
    heart: () => { tone({ type: 'sine', f: 880, f2: 1320, dur: .07, gain: .12 }); tone({ type: 'sine', f: 1320, f2: 1760, t: .07, dur: .1, gain: .1 }); },
    crunch: () => { for (let i = 0; i < 3; i++) noise({ t: i * .13, dur: .05, gain: .16, f: 1700 + Math.random() * 600, q: 1.5 }); },
    kick: () => tone({ type: 'sine', f: 520, f2: 190, dur: .09, gain: .2 }),
    bounce: () => tone({ type: 'sine', f: 320, f2: 170, dur: .06, gain: .12 }),
    plop: () => tone({ type: 'sine', f: 240, f2: 520, dur: .06, gain: .12 }),
    alert: () => { [0, .3].forEach(t => { tone({ type: 'square', f: 660, t, dur: .1, gain: .09 }); tone({ type: 'square', f: 520, t: t + .12, dur: .12, gain: .09 }); }); },
    doorbell: () => { [[784, 0, .5], [622, .32, .7]].forEach(([f, t, dur]) => { tone({ type: 'sine', f, t, dur, gain: .16 }); tone({ type: 'sine', f: f * 2.01, t, dur: dur * .6, gain: .05 }); }); },
    bye: () => { tone({ type: 'triangle', f: 660, t: 0, dur: .12, gain: .12 }); tone({ type: 'triangle', f: 494, t: .13, dur: .2, gain: .12 }); },
    hello: () => arp([7, 12, 16], { step: .08, dur: .16, gain: .12 }),
    gift: () => {                                    // a present twinkles down out of the sky, lands softly, and its ribbon rings
      [31, 28, 24, 21, 19].forEach((n, i) => tone({ type: 'sine', f: hz(n), t: i * .05, dur: .11, gain: .07 }));
      tone({ type: 'sine', f: 900, f2: 300, dur: .26, gain: .05 });
      noise({ t: .27, dur: .07, gain: .12, f: 240, type: 'lowpass' }); tone({ type: 'sine', f: 150, f2: 80, t: .27, dur: .12, gain: .15 });
      tone({ type: 'triangle', f: hz(12), t: .36, dur: .1, gain: .1 }); tone({ type: 'triangle', f: hz(19), t: .43, dur: .3, gain: .1 }); sparkle(.42, 4, .05);
    },
    unwrap: () => { tone({ type: 'sine', f: 500, f2: 1000, dur: .06, gain: .16 }); arp([12, 16, 19, 24], { t: .06, step: .05, dur: .2, gain: .12 }); sparkle(.15, 6); },   // a present torn open
    dance: () => arp([12, 12, 19, 19, 21, 21, 19], { step: .16, dur: .14, type: 'square', gain: .06 }),
    zip: () => tone({ type: 'sawtooth', f: 200, f2: 1400, dur: .25, gain: .05 }),
    star: () => sparkle(0, 5, .07),
    // mischief
    splat: () => { noise({ dur: .07, gain: .16, f: 520, f2: 170, q: 1.1 }); tone({ type: 'sine', f: 210, f2: 80, dur: .09, gain: .14 }); },   // mud, landing
    scribble: () => { for (let i = 0; i < 4; i++) noise({ t: i * .075, dur: .06, gain: .05, f: 2100 + Math.random() * 1500, q: 5, attack: .012 }); },   // a crayon, back and forth
    rumble: () => {                                  // the whole desk shaking
      noise({ dur: .9, gain: .2, f: 90, f2: 55, type: 'lowpass', attack: .05 });
      tone({ type: 'sawtooth', f: 58, f2: 40, dur: .9, gain: .12, trem: 17, attack: .05 });
    },
    creak: () => { tone({ type: 'sawtooth', f: 150, f2: 235, dur: .28, gain: .045, trem: 30, attack: .03 }); noise({ dur: .22, gain: .025, f: 900, q: 6, attack: .04 }); },   // a rope pulled tight
    scrape: () => noise({ dur: .5, gain: .1, f: 320, f2: 180, q: 1.6, attack: .06 }),   // something heavy pushed along
    // Snack Catch
    catch: (n = 0) => { const k = Math.min(12, n); tone({ type: 'triangle', f: hz(5 + k), f2: hz(12 + k), dur: .07, gain: .13 }); },   // a snack caught: the note climbs with the streak
    golden: () => { coin(0, .12); sparkle(.05, 5, .06); },
    spike: () => { noise({ dur: .05, gain: .16, f: 900, q: 2 }); tone({ type: 'square', f: 300, f2: 90, dur: .16, gain: .12 }); },
    go: () => { tone({ type: 'square', f: hz(3), dur: .09, gain: .08 }); tone({ type: 'square', f: hz(3), t: .16, dur: .09, gain: .08 }); tone({ type: 'square', f: hz(15), t: .32, dur: .26, gain: .09, hold: .08 }); },
    timeup: () => { [12, 7, 3].forEach((n, i) => tone({ type: 'triangle', f: hz(n), t: i * .13, dur: i === 2 ? .4 : .14, gain: .12 })); },
  };

  /* ---------- pet voices: every character has a pitch and a timbre ---------- */
  const VOICES = {
    cat: { type: 'triangle', f: 640 }, bunny: { type: 'sine', f: 860 }, bear: { type: 'sawtooth', f: 210, soft: .6 },
    duck: { type: 'sawtooth', f: 430, soft: .6 }, frog: { type: 'square', f: 170, soft: .7 }, fox: { type: 'triangle', f: 540 },
    penguin: { type: 'square', f: 500, soft: .6 }, blob: { type: 'sine', f: 320 }, shroom: { type: 'triangle', f: 780 },
    boo: { type: 'sine', f: 420, vib: true }, alien: { type: 'sine', f: 700, vib: true }, robot: { type: 'square', f: 250, soft: .6, steps: true },
    // drop: every phrase ends lower (a woof). chiff: a puff of noise on the front. air: breath around the note. bub: the line comes out as bubbles.
    dog: { type: 'sawtooth', f: 340, soft: .55, drop: .85, chiff: .5 }, panda: { type: 'triangle', f: 290, vib: { rate: 24, depth: .05 } },
    owl: { type: 'sine', f: 400, air: .35, attack: .025 }, axolotl: { type: 'sine', f: 1040, bub: true },
    capy: { type: 'triangle', f: 250, soft: .8 }, cactus: { type: 'square', f: 610, soft: .5 }, crab: { type: 'square', f: 760, soft: .45, chiff: .6 },
    dino: { type: 'sawtooth', f: 150, soft: .6, drop: .8 }, toasty: { type: 'square', f: 330, soft: .55, steps: true },
    octo: { type: 'sine', f: 520, bub: true }, puffer: { type: 'sine', f: 900, bub: true }, jelly: { type: 'sine', f: 760, vib: true },
    moth: { type: 'triangle', f: 980, air: .3 }, shark: { type: 'sawtooth', f: 190, soft: .6, chiff: .3 },
    wisp: { type: 'sine', f: 1180, vib: { rate: 14, depth: .04 } }, dragon: { type: 'sawtooth', f: 300, soft: .6, air: .3 },
    monkey: { type: 'triangle', f: 820, chiff: .3 }, gorilla: { type: 'sawtooth', f: 120, soft: .7, drop: .85 },
    batty: { type: 'square', f: 1320, soft: .4, chiff: .4 }, reindeer: { type: 'triangle', f: 360, vib: { rate: 20, depth: .04 } },
    santa: { type: 'sawtooth', f: 170, soft: .65 },
    kurama: { type: 'sawtooth', f: 130, soft: .7, drop: .8, air: .3 },
    // The Naruto pack's people: one kind of voice, each at a pitch of its own.
    ...Object.fromEntries([['naruto', 'square', 620], ['sasuke', 'triangle', 400], ['sakura', 'triangle', 880], ['kakashi', 'square', 360], ['hinata', 'triangle', 940], ['itachi', 'square', 380], ['konan', 'triangle', 760]]
      .map(([id, type, f]) => [id, { type, f, soft: type === 'square' ? .5 : 1, chiff: .5 }])),
  };
  // The Sword Art Online and Seven Deadly Sins packs: one kind of voice, each at a pitch of its own.
  ['kirito', 'asuna', 'sinon', 'leafa', 'yui', 'eugeo', 'strea', 'rain', 'seven', 'alice', 'meliodas', 'diane', 'ban', 'king', 'gowther', 'merlin', 'escanor']
    .forEach((id, i) => { VOICES[id] = { type: i % 3 ? 'triangle' : 'square', f: [420, 840, 780, 900, 1180, 480, 860, 700, 1020, 760, 640, 560, 300, 720, 600, 520, 170][i], soft: i % 3 ? 1 : .5, chiff: .4 }; });
  // The Avatar pack: three people, a sky bison that rumbles and a lemur that chitters.
  Object.assign(VOICES, { aang: { type: 'triangle', f: 700, chiff: .4, air: .2 }, katara: { type: 'triangle', f: 830, chiff: .4 }, sokka: { type: 'square', f: 500, soft: .5, chiff: .4 },
    appa: { type: 'sawtooth', f: 105, soft: .75, drop: .85, air: .35 }, momo: { type: 'triangle', f: 1250, chiff: .4 } });
  const voiceOf = (ch) => VOICES[ch] || VOICES.cat;
  function say(v, { up = 1, down = 1, t = 0, dur = .12, gain = .16 }) {
    const g = gain * (v.soft || 1), end = down * (v.drop || 1);
    if (v.bub) {                                     // underwater: a string of small rising bubbles that follows the line's shape
      const n = Math.max(2, Math.round(dur / .045));
      for (let i = 0; i < n; i++) { const f = v.f * (up + (end - up) * i / n); tone({ type: v.type, f: f * .8, f2: f * 1.3, t: t + i * dur / n, dur: dur / n * .95, gain: g * (.55 - .2 * i / n) }); }
      return;
    }
    const vib = v.vib === true ? { rate: 9, depth: v.f * .06 } : v.vib ? { rate: v.vib.rate, depth: v.f * v.vib.depth } : null;
    tone({ type: v.type, f: v.f * up, f2: v.f * end, t, dur, gain: g, vib, attack: v.attack });
    if (v.chiff) noise({ t, dur: Math.min(dur, .05), gain: g * v.chiff, f: v.f * up * 2.5, q: 1.2 });
    if (v.air) noise({ t, dur, gain: g * v.air, f: v.f * up, q: 8, attack: .02 });
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
    purr: (v) => tone({ type: 'triangle', f: Math.max(90, Math.min(140, v.f * .25)), dur: .7, gain: .2, trem: 26, attack: .08 }),
    dizzy: (v) => tone({ type: v.type, f: v.f, dur: .7, gain: .08 * (v.soft || 1), vib: { rate: 5, depth: v.f * .25 } }),
  };

  // Some characters say a few lines their own way: a bark is not a rising chirp, and an owl hoots.
  const OWN = {
    dog: {
      happy: (v) => { say(v, { up: 1.7, down: 1.15, dur: .08, gain: .2 }); say(v, { up: 1.8, down: 1.2, t: .14, dur: .09, gain: .2 }); },   // arf! arf!
      grumble: (v) => tone({ type: 'sawtooth', f: v.f * .42, f2: v.f * .36, dur: .5, gain: .14, trem: 34, attack: .04 }),   // grrr
      whee: (v) => {   // awoo
        tone({ type: 'triangle', f: v.f * 1.1, f2: v.f * 2, dur: .16, gain: .1 });
        tone({ type: 'triangle', f: v.f * 2, f2: v.f * 1.8, t: .16, dur: .42, gain: .075, hold: .15, vib: { rate: 6, depth: v.f * .06 } });
      },
      purr: () => { for (let i = 0; i < 5; i++) noise({ t: i * .12, dur: .08, gain: .11, f: i % 2 ? 1500 : 1050, q: 1.2, attack: .025 }); },   // happy panting
    },
    panda: {
      happy: (v) => { say(v, { up: 1.3, down: 1.2, dur: .1 }); say(v, { up: 1.5, down: 1.25, t: .12, dur: .2 }); },   // a little bleat
      nom: (v) => { for (let i = 0; i < 3; i++) { noise({ t: i * .14, dur: .04, gain: .12, f: 2200, q: 2 }); say(v, { up: .8, down: .9, t: i * .14 + .05, dur: .06, gain: .09 }); } },   // bamboo
    },
    owl: {
      happy: (v) => { [[0, .16], [.22, .09], [.33, .26]].forEach(([t, dur]) => say(v, { up: 1, down: .93, t, dur, gain: .14 })); },   // hoo, hoo-hoo
      whee: (v) => { say(v, { up: .9, down: 1.5, dur: .2, gain: .12 }); say(v, { up: 1.5, down: 1.35, t: .2, dur: .3, gain: .12 }); },   // whoo-OOO
    },
    monkey: {
      happy: (v) => { [[0, 1, 1.25], [.1, 1, 1.25], [.22, 1.5, 1.3], [.32, 1.5, 1.3]].forEach(([t, up, down]) => say(v, { up, down, t, dur: .07, gain: .15 })); },   // ooh ooh, ah ah
    },
    gorilla: {
      happy: (v) => { for (let i = 0; i < 4; i++) noise({ t: i * .09, dur: .05, gain: .16, f: 160, type: 'lowpass' }); say(v, { up: 1, down: .8, t: .05, dur: .3, gain: .12 }); },   // a thump on the chest
    },
    batty: {
      happy: (v) => { for (let i = 0; i < 4; i++) say(v, { up: 1 + i * .12, down: 1.25 + i * .12, t: i * .055, dur: .035, gain: .12 }); },   // a run of little squeaks
    },
    reindeer: {
      happy: (v) => { say(v, { up: 1, down: 1.3, dur: .1 }); for (let i = 0; i < 3; i++) tone({ type: 'sine', f: 2600 + i * 500, t: .12 + i * .07, dur: .12, gain: .05 }); },   // a snort, and sleigh bells
    },
    santa: {
      happy: (v) => { for (let i = 0; i < 3; i++) say(v, { up: 1.25 - i * .12, down: 1 - i * .1, t: i * .17, dur: .12, gain: .17 }); },   // ho, ho, ho
    },
    naruto: {
      happy: (v) => { noise({ dur: .09, gain: .12, f: 2600, f2: 900, q: 1.5 }); say(v, { up: 1.5, down: 1.1, t: .07, dur: .07, gain: .14 }); },   // a swish, and "hah!"
    },
    appa: {
      happy: (v) => tone({ type: 'sawtooth', f: v.f * .9, f2: v.f * 1.25, dur: .55, gain: .13, trem: 22, attack: .06 }),   // a long, pleased rumble
    },
    momo: {
      happy: (v) => { for (let i = 0; i < 5; i++) say(v, { up: i % 2 ? 1.3 : 1, down: i % 2 ? 1 : 1.3, t: i * .06, dur: .04, gain: .12 }); },   // chittering
    },
    axolotl: {
      purr: () => { for (let i = 0; i < 6; i++) { const f = 500 + Math.random() * 500; tone({ type: 'sine', f, f2: f * 2.2, t: i * .1 + Math.random() * .03, dur: .05, gain: .07 }); } },   // content bubbles
    },
  };
  const lineOf = (name, ch) => (Object.hasOwn(OWN, ch) && OWN[ch][name]) || VOICED[name];

  const ok = (name, gap = .04) => {
    if (!enabled || volume <= 0) return false;
    const now = performance.now() / 1000;
    if (now - (last.get(name) || 0) < gap) return false;
    last.set(name, now); return true;
  };
  function attempt(fn) { try { fn(); } catch (err) { /* audio is never worth crashing over */ } }

  return {
    // n: for the few sounds that change as something builds up (the streak in Snack Catch).
    play(name, n) { const s = SOUNDS[name]; if (s && ok(name)) attempt(() => s(n)); },
    voice(name, ch) { const s = VOICED[name] && lineOf(name, ch); if (s && ok('v:' + name, .12)) attempt(() => s(voiceOf(ch))); },
    // Babble: the longer the line, the more blips. Robots stick to a few fixed pitches.
    talk(text, ch) {
      if (!ok('talk', .25)) return;
      const v = voiceOf(ch), n = Math.max(2, Math.min(9, Math.round(String(text).length / 3)));
      const scale = v.steps ? [0, 0, 7, 12] : [0, 2, 4, 7, 9, 12];
      attempt(() => { for (let i = 0; i < n; i++) { const s = scale[Math.floor(Math.random() * scale.length)]; say(v, { up: hz(s, 1), down: hz(s + (Math.random() < .5 ? 1 : -1), 1), t: i * .075, dur: .055, gain: .11 }); } });
    },
    set({ volume: v, enabled: e, duck: d }) {
      if (typeof v === 'number') volume = Math.max(0, Math.min(1, v));
      if (typeof d === 'number') duck = Math.max(0, Math.min(1, d));
      if (master) master.gain.value = volume * duck;
      if (typeof e === 'boolean') enabled = e;
    },
    // What there is to play: for the sound board in dev mode.
    names: () => Object.keys(SOUNDS),
    voiceNames: () => Object.keys(VOICED),
    voices: () => Object.keys(VOICES),
    // Runs every sound once (every voice for the voiced ones) and returns the names of any that threw.
    selfTest() {
      const failed = [];
      const run = (name, fn) => { try { fn(); } catch (err) { failed.push(`${name}: ${err.message}`); } };
      for (const [name, fn] of Object.entries(SOUNDS)) run(name, fn);
      for (const name of Object.keys(VOICED)) for (const ch of Object.keys(VOICES)) run(`${name}/${ch}`, () => lineOf(name, ch)(VOICES[ch]));
      return failed;
    },
  };
})();
