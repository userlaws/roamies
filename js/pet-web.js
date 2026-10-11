// A Roamie on a web page. This is src/pet.js carried over: the same physics, behavior, sprites and sounds.
// What changes is the world. The "desktop" is the browser viewport, the floor is the top of the site's taskbar,
// and the "windows" are page elements marked data-perch. Scrolling the page is just a lot of windows moving at once.
// Coordinates are CSS pixels from the top-left corner of the viewport.
const Pet = (() => {
'use strict';
const GRAV = 2400;
const VISIT_SECONDS = 9;     // 25 in the app; nobody waits that long on a web page
const OUCH_SPEED = 1500;     // landing speed (px/s) that hurts: a drop of roughly 470 px
const LIP = 8;               // a window's pixel outline sits this far outside its own box

let cv, ctx, bubbles, handles, floorEl;
const world = { w: innerWidth, h: innerHeight, floors: [], wins: [], items: [], parts: [], pets: [], perches: [] };
let S = 4;                   // sprite pixel size on screen
const K = () => S / 4;       // everything measured against the pet scales by this
let me = null;               // the visitor's own pet
let nagging = false, drag = null;
const mouse = { x: 0, y: 0, at: 0, stroke: 0 };

// The page listens for these instead of the app's main process: 'stat', 'earn', 'left', 'visitor-left', 'nag-end', 'open-ui'.
const listeners = {};
const emit = (type, data) => { for (const fn of listeners[type] || []) fn(data); };

/* ---------- sound ---------- */
const sfx = (name) => SFX.play(name);
const voice = (p, name) => SFX.voice(name, p.char);

/* ---------- the viewport + surfaces ---------- */
function resize() {
  const d = Math.min(2, devicePixelRatio || 1);
  world.w = document.documentElement.clientWidth; world.h = innerHeight;
  cv.width = Math.round(world.w * d); cv.height = Math.round(world.h * d);
  ctx.setTransform(d, 0, 0, d, 0, 0);
  S = world.w < 700 ? 3 : 4;
}
const inside = (x, y) => x >= 0 && x <= world.w && y >= 0 && y <= world.h;
const floor = () => world.floors[0];

function cut(segs, a, b) {
  return segs.flatMap(([x1, x2]) => (b <= x1 || a >= x2) ? [[x1, x2]] : [[x1, Math.min(x2, a)], [Math.max(x1, b), x2]].filter(s => s[1] > s[0]));
}
// Read where everything is right now. Cheap enough to do every frame, and it means a scrolled,
// dragged or resized window is just in a new place: no events to keep in step.
function readSurfaces() {
  const fy = Math.round(floorEl.getBoundingClientRect().top);
  world.floors = [{ id: 'floor', floor: true, ox: 0, x1: 0, x2: world.w, y: fy }];
  const list = [];
  for (const el of world.perches) {
    const r = el.getBoundingClientRect();
    if (r.width < 90 || r.bottom < 0 || r.top > world.h) continue;
    list.push({ id: el.dataset.perch, x: r.left - LIP, y: Math.round(r.top - LIP), w: r.width + LIP * 2, h: r.height + LIP * 2, z: Number(el.style.zIndex) || 0 });
  }
  list.sort((a, b) => b.z - a.z);
  // list is front-to-back. A window's top edge is walkable only where no window in front covers it.
  const surfs = [];
  list.forEach((r, i) => {
    if (r.y < 50 || r.y > fy - 30) return;
    let segs = [[Math.max(r.x + 6, 30), Math.min(r.x + r.w - 6, world.w - 30)]];
    for (let j = 0; j < i; j++) { const f = list[j]; if (r.y >= f.y && r.y <= f.y + f.h) segs = cut(segs, f.x, f.x + f.w); }
    segs.forEach(([x1, x2], k) => { if (x2 - x1 > 60) surfs.push({ id: `${r.id}:${k}`, wid: r.id, ox: r.x, x1, x2, y: r.y }); });
  });
  world.wins = surfs;
}
function allSurfs() { return [...world.floors, ...world.wins]; }
function surfById(id) { return allSurfs().find(s => s.id === id); }

/* ---------- pets ---------- */
// `dir` is the way the pet faces (-1 left, 1 right). `face` is what it wears on its face.
function makePet(o) {
  return Object.assign({ kind: 'pet', name: 'Pip', char: 'cat', skin: 'classic', hat: null, face: null, buddy: null, bud: null,
    x: 200, y: 0, vx: 0, vy: 0, dir: -1, grounded: false, ride: null, ignoreId: undefined, state: 'air', t: 0, anim: 0, blinkT: 3,
    squash: 0, jumpCd: 0, mode: null, bubble: null, exiting: false, tx: 0, hurtable: false, dizzy: 0, spin: null, emote: null }, o);
}
function cleanLook(o) {
  return { char: has(CHARS, o.char) ? o.char : 'cat', skin: has(SKINS, o.skin) ? o.skin : 'classic', hat: has(HATS, o.hat) ? o.hat : null,
    face: has(FACES, o.face) ? o.face : null, buddy: has(BUDDIES, o.buddy) ? o.buddy : null };
}
// Speech bubble. With buttons it stays until one is pressed, and onPick gets the button's id.
function say(p, text, sec, buttons, onPick) {
  p.bubble = { text, buttons: buttons || null, onPick, until: buttons ? Infinity : performance.now() + (sec || 2.6) * 1000, key: text + Math.random() };
  if (/[a-z]/i.test(text)) SFX.talk(text, p.char);
}
function burst(type, x, y, n, o = {}) {
  for (let i = 0; i < n; i++) world.parts.push({ type, x: x + rand(-(o.spread || 14), o.spread || 14), y: y + rand(-10, 10), vx: rand(-(o.vx || 30), o.vx || 30), vy: rand(o.vy1 || -70, o.vy2 || -20), life: 0, max: o.max || 1.2, color: o.colors ? pick(o.colors) : null });
}
const PARTY = ['#ffb25b', '#ff7a90', '#7fd6b0', '#6ec1ff', '#ffd34d', '#b08bff', '#fffdf7'];
function confetti(n, colors) {
  for (let i = 0; i < n; i++) world.parts.push({ type: 'confetti', x: Math.random() * world.w, y: -20 - Math.random() * 200, vx: rand(-60, 60), vy: rand(140, 320), life: 0, max: 2.6 + Math.random(), color: pick(colors || PARTY), w: 8, h: 8 + 4 * Math.floor(Math.random() * 2) });
}
const hearts = (p, n = 4) => burst('heart', p.x, p.y - 60 * K(), n, { max: 1.3 });
function puff(x, y) { burst('puff', x, y - 30, 10, { spread: 18, vx: 50, vy1: -70, vy2: 10, max: .55 }); }
function fall(b, ignoreId) {
  b.ride = null; b.grounded = false; b.ignoreId = ignoreId;
  if (b.kind === 'pet' && b.state !== 'drag') b.state = 'air';
}
function stand(b, s) { b.y = s.y; b.vy = 0; b.grounded = true; b.ignoreId = undefined; b.ride = { id: s.id, dx: b.x - s.ox, floor: !!s.floor }; }
// Vanish here, drop in at the top of another surface. Used to get across awkward gaps.
function poof(p, s, x) {
  puff(p.x, p.y); sfx('poof');
  p.x = clamp(x, s.x1 + 40, s.x2 - 40); p.y = Math.max(s.y - 160, 90);
  p.vx = 0; p.vy = 0; p.hurtable = false; fall(p);
  puff(p.x, p.y);
}
function rescue(p) { poof(p, floor(), clamp(p.x, 60, world.w - 60)); }

function physics(b, dt) {
  if (b.grounded) {
    const s = b.ride && surfById(b.ride.id);
    if (!s) {
      // The window underneath scrolled away, got covered, or was dragged out of reach.
      // Scrolled under the taskbar? Step off onto it. Otherwise drop, and never get hurt by a scroll.
      const f = floor();
      if (b.y >= f.y - 2) { b.x = clamp(b.x, 40, world.w - 40); stand(b, f); if (b.kind === 'pet' && b.state === 'air') b.state = 'idle'; return; }
      fall(b); b.hurtable = false; return;
    }
    b.x = s.ox + b.ride.dx + b.vx * dt; b.y = s.y;
    if (b.x < s.x1 || b.x > s.x2) {
      // Off the end of this surface: fall, or stop at the edge of the screen.
      if (!s.floor && inside(b.x, b.y - 20)) { b.vy = -60; fall(b, s.id); return; }
      if (!b.exiting) { b.x = clamp(b.x, s.x1, s.x2); b.vx = 0; }
    } else if (s.floor && !b.exiting) {
      if (b.x < s.x1 + 30 || b.x > s.x2 - 30) { b.x = clamp(b.x, s.x1 + 30, s.x2 - 30); b.vx = 0; }
    }
    b.ride.dx = b.x - s.ox;
    return;
  }
  b.vy += GRAV * dt;
  let nx = b.x + b.vx * dt, ny = b.y + b.vy * dt;
  if (!b.exiting) {
    if (b.vx && !inside(nx + Math.sign(b.vx) * 28, clamp(b.y - 20, 1, world.h - 1))) {
      // Hit the edge of the screen.
      if (b.kind === 'pet' && b.hurtable && Math.abs(b.vx) > 700) { sfx('bonk'); voice(b, 'oof'); b.squash = .6; }
      else if (b.type === 'ball') sfx('bounce');
      nx = b.x; b.vx = -b.vx * .45;
    }
    if (b.vy < 0 && ny - 30 < 0) { b.vy = Math.abs(b.vy) * .25; ny = b.y; }
  }
  b.x = nx;
  if (b.vy >= 0) {
    let best = null;
    for (const s of allSurfs()) {
      if (s.id === b.ignoreId) continue;
      if (b.x >= s.x1 && b.x <= s.x2 && b.y <= s.y + 1 && ny >= s.y && (!best || s.y < best.y)) best = s;
    }
    if (best) { land(b, best); return; }
  }
  b.y = ny;
}
function land(b, s) {
  const impact = b.vy;
  if (b.type === 'ball' && impact > 260) { b.y = s.y; b.vy = -impact * .55; b.vx *= .75; b.ignoreId = undefined; sfx('bounce'); return; }
  stand(b, s);
  b.vx = 0;
  if (b.kind !== 'pet') { sfx('plop'); return; }
  b.squash = Math.min(1, impact / 900); b.state = 'idle'; b.t = rand(.3, .9); b.spin = null;
  if (b.hurtable && impact > OUCH_SPEED) ouch(b);
  else if (impact > 500) sfx('land');
  b.hurtable = false;
}
// Dropped or thrown from way up: ow.
function ouch(p) {
  p.state = 'ouch'; p.t = 1.7; p.dizzy = 1.7; p.squash = 1;
  sfx('thud'); voice(p, 'ow');
  p.bubble = { text: pick(['ow!', 'oof!', 'ouch!!', 'hey!!']), buttons: null, until: performance.now() + 1300, key: 'ow' + Math.random() };
  burst('star', p.x, p.y - 30 * K(), 6, { vx: 140, vy1: -260, vy2: -90, max: .7 });
  if (p === me) emit('stat', 'ows');
}
function jumpTo(p, tx, ty) {
  const dist = Math.hypot(tx - p.x, ty - p.y);
  const T = Math.max(.42, .34 + dist / 950);
  p.vx = (tx - p.x) / T; p.vy = (ty - p.y - .5 * GRAV * T * T) / T;
  // Pass through the window we jumped from, never through the floor.
  fall(p, p.ride && !p.ride.floor ? p.ride.id : undefined);
  p.hurtable = false;
  if (Math.abs(p.vx) > 1) p.dir = Math.sign(p.vx);
  p.jumpCd = 1.1;
  if (p === me) sfx('jump');
}
function hop(p, v) { p.vy = -v; p.vx = 0; p.hurtable = false; fall(p); }
function hopDown(p, dir) { jumpTo(p, clamp(p.x + dir * rand(80, 160), 40, world.w - 40), floor().y); }
function walkToward(p, speed) {
  const dx = p.tx - p.x;
  if (Math.abs(dx) <= 3) { p.vx = 0; return true; }
  p.dir = Math.sign(dx); p.vx = p.dir * Math.min(speed, Math.abs(dx) * 8); p.state = 'walk'; return false;
}
function range(p) {
  const s = p.ride && surfById(p.ride.id);
  if (!s) return [p.x, p.x];   // the surface just vanished; physics will drop the pet on the next step
  const m = s.floor ? 40 : 14;
  return [s.x1 + m, s.x2 - m];
}

// Travel to a spot on any surface: walk under it and jump, walk off an edge, or drop down.
function goTo(p, surfId, x, then) {
  p.mode = 'go'; p.go = { id: surfId, x, until: performance.now() + 9000, lastX: p.x, stuck: 0, then };
  if (p.state === 'sleep' || p.state === 'sit') p.state = 'idle';
}
function goAI(p, dt, speed) {
  const g = p.go, T = surfById(g.id);
  const done = () => { p.mode = null; p.go = null; p.state = 'idle'; p.t = .4; p.vx = 0; if (g.then) g.then(); };
  if (!T) { done(); return; }
  if (p.ride.id === T.id) {
    p.tx = clamp(g.x, T.x1 + 20, T.x2 - 20);
    if (walkToward(p, speed)) done();
    return;
  }
  g.stuck = Math.abs(p.x - g.lastX) < .3 && p.jumpCd <= 0 ? g.stuck + dt : 0; g.lastX = p.x;
  if (g.stuck > .8 || performance.now() > g.until) { g.stuck = 0; g.until = performance.now() + 9000; poof(p, T, g.x); return; }
  const tx = clamp(g.x, T.x1 + 30, T.x2 - 30);
  if (T.y < p.y - 40) {
    p.tx = clamp(p.x, T.x1 + 30, T.x2 - 30);
    if (walkToward(p, speed) && p.jumpCd <= 0) jumpTo(p, p.tx, T.y);
  } else if (T.y > p.y + 40 && p.x >= T.x1 && p.x <= T.x2 && inside(p.x, p.y + 40)) {
    p.vy = 0; fall(p, p.ride.id);
  } else { p.tx = tx; walkToward(p, speed); }
}

const BUSY = ['eat', 'ouch', 'emote'];   // states that finish on their own and shouldn't be interrupted
function ai(p, dt) {
  p.t -= dt;
  // Nothing to decide while held or in the air, or in the instant after the surface underfoot disappeared.
  if (p.state === 'drag' || p.state === 'air' || !p.ride || !surfById(p.ride.id)) return;
  const speed = (p.mode === 'leave' || p.mode === 'enter' ? 210 : p.mode === 'go' ? 170 : 75) * Math.sqrt(K());

  if (p.mode === 'leave') {
    p.exiting = true;
    if (!p.ride.floor) { if (p.jumpCd <= 0) hopDown(p, p.exitDir); return; }
    p.dir = p.exitDir; p.vx = p.exitDir * speed; p.state = 'walk';
    if (!inside(p.x, p.y - 20) && !inside(p.x - p.exitDir * 50, p.y - 20)) vanish(p);
    return;
  }
  if (p.mode === 'enter') {
    if (walkToward(p, speed)) { p.mode = null; p.exiting = false; p.state = 'idle'; p.t = .4; const f = p.afterEnter; p.afterEnter = null; if (f) f(); }
    return;
  }
  if (p.mode === 'nag') { nagAI(p, dt); return; }
  if (BUSY.includes(p.state)) {
    p.vx = 0;
    if (p.state === 'emote') emoteAI(p, dt);
    if (p.t <= 0) { p.state = p.state === 'eat' ? 'happy' : 'idle'; p.t = .8; p.emote = null; }
    return;
  }
  if (p.mode === 'go') { goAI(p, dt, speed); return; }

  const food = world.items.find(i => i.type === 'food');
  if (food && p === me) {
    if (p.state === 'sleep') p.state = 'idle';
    const same = food.grounded && food.ride.id === p.ride.id;
    if (same || !food.grounded) {
      p.tx = food.x; walkToward(p, speed * 1.35);
      if (same && Math.abs(food.x - p.x) < 10) {
        removeItem(food);
        p.state = 'eat'; p.t = 1.3; p.vx = 0; say(p, pick(['nom nom', 'fish!!', 'mmmf']), 1.4);
        sfx('crunch'); voice(p, 'nom'); emit('stat', 'snacks');
        burst('crumb', p.x + p.dir * 6, p.y - 24, 8, { vx: 70, vy1: -220, vy2: -80, max: .7 });
      }
    } else if (p.jumpCd <= 0) jumpTo(p, food.x, food.y);
    return;
  }
  const ball = world.items.find(i => i.type === 'ball');
  if (ball && p === me) {
    if (p.state === 'sleep') p.state = 'idle';
    const same = ball.grounded && ball.ride.id === p.ride.id;
    if (same || !ball.grounded) {
      p.tx = clamp(ball.x, ...range(p)); walkToward(p, speed * 1.8);
      if (same && Math.abs(ball.x - p.x) < 16) {
        ball.vx = (Math.random() < .5 ? -1 : 1) * rand(200, 480); ball.vy = -rand(500, 800); fall(ball); ball.kicks++;
        p.dir = Math.sign(ball.vx); p.squash = .5;
        sfx('kick'); emit('stat', 'kicks');
        if (Math.random() < .3) say(p, pick(['boop!', 'mine!', 'again!']), 1);
      }
    } else if (p.jumpCd <= 0) jumpTo(p, ball.x, ball.y);
    return;
  }

  switch (p.state) {
    case 'walk': if (walkToward(p, speed)) { p.state = 'idle'; p.t = rand(.6, 2); } break;
    case 'prep': {
      p.vx = 0;
      if (p.t <= 0) {
        const s = surfById(p.jt.id);
        if (s) jumpTo(p, s.x1 + p.jt.f * (s.x2 - s.x1), s.y); else p.state = 'idle';
      }
      break;
    }
    case 'sleep': p.vx = 0; if (p.t <= 0) { p.state = 'idle'; say(p, '*yawn*', 1.4); voice(p, 'yawn'); } break;
    default:
      p.vx = 0;
      // Idle pets watch the mouse when it's close and has moved lately.
      if (p === me && performance.now() - mouse.at < 2500 && Math.abs(mouse.x - p.x) > 30 && Math.hypot(mouse.x - p.x, mouse.y - p.y) < 420) p.dir = Math.sign(mouse.x - p.x);
      if (p.t <= 0) decide(p);
  }
}
function decide(p) {
  const r = Math.random(); const [a, b] = range(p);
  if (r < .32) { p.tx = rand(a, b); p.state = 'walk'; return; }
  if (r < .6) {
    const opts = world.wins.filter(s => s.id !== p.ride.id);
    if (opts.length) { p.jt = { id: pick(opts).id, f: rand(.15, .85) }; p.state = 'prep'; p.t = .35; return; }
    p.tx = rand(a, b); p.state = 'walk'; return;
  }
  if (r < .7 && !p.ride.floor) { hopDown(p, Math.random() < .5 ? -1 : 1); return; }
  if (r < .82) { p.state = 'sit'; p.t = rand(3, 6); return; }
  if (r < .87) { p.state = 'sleep'; p.t = rand(8, 14); return; }
  p.state = 'idle'; p.t = rand(1, 2.4); p.dir *= -1;
}
function frameOf(p) {
  switch (p.state) {
    case 'walk': return Math.floor(p.anim * 9) % 2 ? 'walkA' : 'walkB';
    case 'air': return p.spin ? 'happy' : p.vy > 0 ? 'dangle' : 'walkB';
    case 'drag': return Math.floor(p.anim * 7) % 2 ? 'dangle' : 'dangle2';
    case 'sit': case 'prep': return 'sit';
    case 'sleep': return 'sleep';
    case 'nag': return 'grumpy';
    case 'ouch': return 'ouch';
    case 'eat': return Math.floor(p.anim * 8) % 2 ? 'happy' : 'base';
    case 'emote': return Math.floor(p.anim * 6) % 2 ? 'happy' : 'walkA';
    case 'happy': return 'happy';
    default: return p.blinkT < 0 ? 'blink' : 'base';
  }
}

/* ---------- emotes ---------- */
function emote(p, type, quiet) {
  if (!p.grounded || p.mode === 'nag' || p.mode === 'leave' || p.mode === 'enter') return;
  if (p.mode === 'go') { p.mode = null; p.go = null; }
  if (type === 'dance') { p.state = 'emote'; p.t = 2.4; p.emote = { type, beat: 0 }; if (!quiet) sfx('dance'); }
  else if (type === 'flip') { hop(p, 620); p.spin = { t: 0, dur: 2 * 620 / GRAV }; sfx('zip'); voice(p, 'whee'); }
  else if (type === 'love') { p.state = 'happy'; p.t = 1.4; hearts(p, 10); sfx('heart'); voice(p, 'happy'); }
  else if (type === 'nap') { p.state = 'sleep'; p.t = 25; voice(p, 'yawn'); }
  if (p === me) emit('stat', 'emotes');
}
function emoteAI(p, dt) {
  const e = p.emote; if (!e) return;
  e.beat -= dt;
  if (e.beat <= 0) { e.beat = .32; p.dir *= -1; p.squash = .55; burst('note', p.x + p.dir * 20 * K(), p.y - 62 * K(), 1, { vx: 40, vy1: -90, vy2: -50, max: 1 }); }
}

/* ---------- video nudge ---------- */
// o: { perch, minutes, practice }. In the app this starts on its own after enough video; here the page starts it.
function startNag(o) {
  if (!me || away() || me.mode === 'nag' || me.mode === 'leave' || me.mode === 'enter' || me.state === 'drag') return false;
  nagging = true; me.mode = 'nag'; me.go = null; me.nagT = 0; me.nagGone = 0; me.nag = o;
  if (me.state === 'sleep' || me.state === 'sit') me.state = 'idle';
  sfx('alert'); voice(me, 'grumble');
  return true;
}
function nagAI(p, dt) {
  // Onto the video window itself, if its top edge is on screen.
  const s = world.wins.find(w => w.wid === p.nag.perch);
  p.nagT += dt;
  if (!s) { p.vx = 0; p.nagGone += dt; if (p.nagGone > 2.5) endNag('gone'); return; }
  p.nagGone = 0;
  if (p.ride.id !== s.id) { if (p.jumpCd <= 0) jumpTo(p, (s.x1 + s.x2) / 2, s.y); return; }
  p.vx = 0; p.state = 'nag';
  if (!p.bubble || p.bubble.until !== Infinity) {
    say(p, `That's ${p.nag.minutes} min of videos. Stretch break?`, 0, [['break', 'Take a break'], ['snooze', '5 more min']], endNag);
  }
  if (p.nagT > 20 && Math.random() < dt * 1.5) hop(p, 300);  // little stomps if ignored
}
function endNag(kind) {
  const o = me.nag || {};
  nagging = false; me.mode = null; me.bubble = null; me.state = 'idle'; me.t = .5; me.nag = null;
  emit('nag-end', { kind, practice: !!o.practice });
  if (kind === 'gone') return;   // the video scrolled off screen: let it go
  if (kind === 'snooze') { say(me, 'fine. five.', 2); return; }
  // "Try the break nudge" is a preview: it pays nothing.
  if (o.practice) { say(me, 'proud of you!', 2); voice(me, 'happy'); return; }
  say(me, 'proud of you!  +40', 2.4); sfx('coin'); voice(me, 'happy'); hearts(me, 5);
  emit('earn', 40); emit('stat', 'breaks');
  if (me.grounded) hop(me, 380);
}

/* ---------- friends: visits and gifts ---------- */
const away = () => !me || !world.pets.includes(me);
const occupied = () => away() || me.mode === 'nag' || me.mode === 'leave' || me.mode === 'enter' || (me.bubble && me.bubble.buttons);
// Pets arrive and leave through the edges of the screen.
function enterFrom(p, dir, frac) {
  const f = floor();
  p.x = dir < 0 ? f.x1 - 50 : f.x2 + 50; p.vx = 0;
  stand(p, f);
  p.exiting = true; p.mode = 'enter'; p.state = 'walk'; p.tx = f.x1 + (f.x2 - f.x1) * frac;
}
function sendPet(friend) {
  if (occupied() || BUSY.includes(me.state) || me.state === 'drag') return false;
  say(me, `brb, visiting ${friend.name}`, 1.8);
  me.mode = 'leave'; me.go = null; me.exitDir = 1;
  me.onExit = () => { sfx('bye'); emit('left', friend); };
  return true;
}
// Take a pet off the screen right now and run whatever was waiting for it to leave.
function vanish(p) {
  const i = world.pets.indexOf(p); if (i < 0) return;
  world.pets.splice(i, 1); p.mode = null; p.exiting = false; p.vx = 0; p.vy = 0; p.bubble = null;
  if (p.bubbleEl) { p.bubbleEl.remove(); p.bubbleEl = null; }
  if (p.handle) { p.handle.remove(); p.handle = null; }
  if (drag && drag.p === p) drag = null;
  const f = p.onExit; p.onExit = null; if (f) f();
}
function welcomeVisitor(pet) {
  const v = makePet({ name: String(pet.name || 'Pet').slice(0, 16), visitor: true, onExit: () => emit('visitor-left', pet), ...cleanLook(pet) });
  enterFrom(v, -1, .3);
  world.pets.push(v);
  sfx('doorbell');
  v.afterEnter = () => {
    say(v, `hi! I'm ${v.name}`, 2.2); voice(v, 'happy');
    // Our pet runs over to say hello.
    if (!away() && !me.mode && me.ride && v.ride && !BUSY.includes(me.state) && me.state !== 'drag' && me.grounded) {
      say(me, '!!', 1.4);
      goTo(me, v.ride.id, v.x + 80 * K(), () => { if (world.pets.includes(v)) { hearts(me, 3); hearts(v, 3); voice(me, 'happy'); me.dir = Math.sign(v.x - me.x) || 1; } });
    }
    setTimeout(() => {
      if (!world.pets.includes(v)) return;
      // A thank-you present, left where the visitor was standing.
      addItem({ type: 'gift', value: 10 + Math.floor(Math.random() * 31), x: v.x, y: v.y - 40, vy: -200 });
      say(v, 'thanks for having me!', 1.8);
      v.mode = 'leave'; v.go = null; v.exitDir = -1;
    }, VISIT_SECONDS * 1000);
  };
}
function comeHome({ gift, coins }) {
  if (!away()) return;
  world.pets.push(me); me.bud = null;
  enterFrom(me, 1, .75);
  me.afterEnter = () => {
    say(me, gift ? `back! brought ${gift}  +${coins}` : 'back!', 2.6); sfx('coin'); voice(me, 'happy');
    if (coins) emit('earn', coins);
  };
}
function openGift(g) {
  removeItem(g);
  sfx('gift');
  burst('star', g.x, g.y - 14, 10, { vx: 120, vy1: -260, vy2: -80, max: .9 });
  emit('earn', g.value);
  if (!away() && !(me.bubble && me.bubble.buttons)) say(me, `ooh!  +${g.value} coins`, 2);
}

/* ---------- things lying around: snacks, the ball, gift boxes ---------- */
function addItem(o) {
  const it = Object.assign({ kind: 'item', vx: 0, vy: 0, grounded: false, ride: null, age: 0 }, o);
  if (it.type === 'gift') {
    // A real button, so a gift can be opened by touch or from the keyboard as well as the mouse.
    it.el = document.createElement('button'); it.el.type = 'button'; it.el.className = 'gift-handle'; it.el.setAttribute('aria-label', 'Open the gift box');
    it.el.addEventListener('click', () => openGift(it));
    handles.appendChild(it.el);
  }
  world.items.push(it);
  return it;
}
function removeItem(it) {
  const i = world.items.indexOf(it); if (i >= 0) world.items.splice(i, 1);
  if (it.el) { it.el.remove(); it.el = null; }
}
function dropItem(type, extra) {
  addItem(Object.assign({ type, x: clamp(me.x + rand(-250, 250), 40, world.w - 40), y: 20 }, extra));
}

/* ---------- input: each pet has an invisible button over it ---------- */
// The app hit-tests a click-through overlay. A page can do better: a real element follows the pet,
// which gives a grab cursor, touch dragging (no page scroll under the finger) and keyboard focus for free.
function pat(p) {
  hearts(p); sfx('heart'); voice(p, 'happy');
  if (p === me) emit('stat', 'pets');
  if (p.mode !== 'nag' && p.grounded && !BUSY.includes(p.state)) hop(p, 320);
}
function addHandle(p) {
  const h = document.createElement('button'); h.type = 'button'; h.className = 'pet-handle';
  h.setAttribute('aria-label', `${p.name}. Press to pat, drag to pick up.`);
  h.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    e.preventDefault();
    // A pet on its way in or out can be patted but not grabbed: it has somewhere to be.
    if (p.mode === 'leave' || p.mode === 'enter') { hearts(p); sfx('heart'); return; }
    try { h.setPointerCapture(e.pointerId); } catch (err) { /* already gone */ }
    drag = { p, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: performance.now(), vx: 0, vy: 0, moved: false };
  });
  h.addEventListener('pointermove', (e) => {
    if (drag && drag.p === p) {
      const now = performance.now(), dtm = Math.max(1, now - drag.lt);
      drag.vx = drag.vx * .6 + ((e.clientX - drag.lx) / dtm * 1000) * .4;
      drag.vy = drag.vy * .6 + ((e.clientY - drag.ly) / dtm * 1000) * .4;
      drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 5) {
        drag.moved = true; p.state = 'drag'; p.ride = null; p.grounded = false; p.spin = null;
        voice(p, 'squeak');
      }
      if (drag.moved && inside(e.clientX, e.clientY + 24)) { p.x = e.clientX; p.y = e.clientY + 44 * K(); }
      return;
    }
    // Rubbing the mouse back and forth over the pet is petting it.
    if (p === me && p.grounded && !p.mode && !BUSY.includes(p.state)) {
      mouse.stroke += Math.abs(e.movementX || 0);
      if (mouse.stroke > 260) {
        mouse.stroke = 0; p.state = 'happy'; p.t = 1.2; p.vx = 0;
        hearts(p, 2); voice(p, 'purr'); emit('stat', 'purrs');
      }
    }
  });
  h.addEventListener('pointerleave', () => { mouse.stroke = 0; });
  const release = () => {
    if (!drag || drag.p !== p) return;
    if (!drag.moved) pat(p);
    else {
      p.vx = clamp(drag.vx, -1600, 1600); p.vy = clamp(drag.vy, -1600, 1600); p.state = 'air'; p.grounded = false; p.ignoreId = undefined;
      p.hurtable = true;
      if (p.mode === 'go') { p.mode = null; p.go = null; }
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 900) voice(p, 'whee');
      if (speed > 300 && p === me) emit('stat', 'throws');
    }
    drag = null;
  };
  h.addEventListener('pointerup', release);
  h.addEventListener('pointercancel', release);
  h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pat(p); } });
  h.addEventListener('contextmenu', (e) => { e.preventDefault(); emit('open-ui'); });
  handles.appendChild(h); p.handle = h;
}
function placeHandles() {
  const k = K();
  for (const p of world.pets) {
    if (!p.handle) addHandle(p);
    const st = p.handle.style;
    st.left = Math.round(p.x - 28 * k) + 'px'; st.top = Math.round(p.y - 60 * k) + 'px'; st.width = Math.round(56 * k) + 'px'; st.height = Math.round(62 * k) + 'px';
  }
  for (const it of world.items) if (it.el) {
    const st = it.el.style;
    st.left = Math.round(it.x - 20) + 'px'; st.top = Math.round(it.y - 34) + 'px'; st.width = '40px'; st.height = '38px';
  }
}

/* ---------- commands from the page ---------- */
function command(cmd, arg) {
  if (!me) return false;
  switch (cmd) {   // these apply even while the pet is away
    case 'look': Object.assign(me, cleanLook(arg)); me.bud = null; return true;
    case 'name': me.name = arg; if (me.handle) me.handle.setAttribute('aria-label', `${arg}. Press to pat, drag to pick up.`); return true;
    case 'visitor': welcomeVisitor(arg); return true;
    case 'home': comeHome(arg); return true;
  }
  if (away()) return false;
  const busy = me.mode === 'nag' || me.mode === 'leave' || me.mode === 'enter';
  if (cmd === 'feed') dropItem('food');
  else if (cmd === 'ball') { for (const b of world.items.filter(i => i.type === 'ball')) removeItem(b); dropItem('ball', { vx: rand(-200, 200), kicks: 0 }); }
  else if (cmd === 'pet') { if (me.grounded && !busy && !BUSY.includes(me.state)) hop(me, 320); hearts(me); sfx('heart'); voice(me, 'happy'); emit('stat', 'pets'); }
  else if (cmd === 'emote') emote(me, arg);
  else if (cmd === 'visit') return sendPet(arg);
  else if (cmd === 'nag') return startNag(arg);
  else if (cmd === 'say') { if (!occupied()) say(me, arg.text, arg.sec || 3); if (arg.sound) sfx(arg.sound); if (arg.hearts) hearts(me, arg.hearts); }
  else if (cmd === 'come' && !busy && me.state !== 'drag') {
    goTo(me, 'floor', arg.x, () => { say(me, pick(['you called?', 'here!', 'hi hi']), 1.6); });
    emit('stat', 'summons');
  }
  return true;
}

/* ---------- drawing ---------- */
function drawRows(rows, color, x, y, px) {
  ctx.fillStyle = color;
  for (let r = 0; r < rows.length; r++) for (let i = 0; i < rows[r].length; i++) if (rows[r][i] !== '.') ctx.fillRect(Math.round(x + (i - rows[r].length / 2) * px), Math.round(y + (r - rows.length / 2) * px), px, px);
}
function drawPet(p) {
  const k = K(), img = sprite(p, frameOf(p)), w = SPR_W * S, h = SPR_H * S;
  if (p.buddy && p.bud) drawBuddy(ctx, p.buddy, p.bud.x, p.bud.y + Math.sin(p.anim * 5) * 3, Math.max(2, Math.round(3 * k)), p.bud.dir > 0, p);
  ctx.save();
  if (p.grounded) { ctx.fillStyle = 'rgba(20,10,30,.25)'; ctx.fillRect(Math.round(p.x - 22 * k), Math.round(p.y), Math.round(44 * k), 4); }
  ctx.translate(Math.round(p.x), Math.round(p.y));
  if (p.spin) { ctx.translate(0, -28 * k); ctx.rotate(-p.dir * Math.min(1, p.spin.t / p.spin.dur) * Math.PI * 2); ctx.translate(0, 28 * k); }
  const sq = p.squash; ctx.scale((p.dir > 0 ? -1 : 1) * (1 + sq * .22), 1 - sq * .22);
  ctx.globalAlpha = SKINS[p.skin].alpha || 1; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
  if (p.dizzy > 0) for (let i = 0; i < 3; i++) { const a = p.anim * 6 + i * 2.1; drawRows(STAR, '#ffd34d', p.x + Math.cos(a) * 24 * k, p.y - 64 * k + Math.sin(a) * 6 * k, 2); }
  if (p.visitor) {   // visitors wear a name tag
    ctx.font = '600 15px "Pixelify Sans", ui-monospace, monospace'; const tw = Math.round(ctx.measureText(p.name).width) + 12;
    const ty = Math.round(p.y - 70 * k - (has(HATS, p.hat) ? 18 * k : 0));   // above the head, clear of the taskbar
    ctx.fillStyle = '#2a2530'; ctx.fillRect(Math.round(p.x - tw / 2), ty - 20, tw, 20);
    ctx.fillStyle = '#fffdf7'; ctx.textAlign = 'center'; ctx.fillText(p.name, Math.round(p.x), ty - 5); ctx.textAlign = 'left';
  }
}
function drawBubbles() {
  for (const p of world.pets) {
    if (p.bubble && p.bubble.until < performance.now()) p.bubble = null;
    if (!p.bubble) { if (p.bubbleEl) { p.bubbleEl.remove(); p.bubbleEl = null; } continue; }
    if (!p.bubbleEl) { p.bubbleEl = document.createElement('div'); p.bubbleEl.className = 'bubble'; bubbles.appendChild(p.bubbleEl); }
    if (p.bubbleEl.dataset.key !== p.bubble.key) {
      p.bubbleEl.textContent = p.bubble.text;
      if (p.bubble.buttons) {
        const row = document.createElement('div'); row.className = 'row';
        p.bubble.buttons.forEach(([act, label], i) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.act = act; b.textContent = label; if (i) b.className = 'ghost'; row.appendChild(b); });
        p.bubbleEl.appendChild(row);
      }
      p.bubbleEl.dataset.key = p.bubble.key;
    }
    const bw = p.bubbleEl.offsetWidth || 120;
    p.bubbleEl.style.left = Math.round(clamp(p.x, bw / 2 + 10, world.w - bw / 2 - 10)) + 'px';
    p.bubbleEl.style.top = Math.round(Math.max(p.bubbleEl.offsetHeight + 10, p.y - 74 * K())) + 'px';
  }
}
function draw() {
  ctx.clearRect(0, 0, world.w, world.h);
  for (const it of world.items) {
    const wobble = it.type === 'gift' && it.grounded ? Math.sin(it.age * 6) * .08 : 0;   // gifts wiggle: click me
    drawArt(ctx, it.type, it.x, it.y, 3, it.type === 'ball' ? it.x / 14 : wobble);
  }
  for (const p of world.pets) drawPet(p);
  for (const q of world.parts) {
    ctx.globalAlpha = clamp((1 - q.life / q.max) * 1.4, 0, 1);
    if (q.type === 'heart') drawRows(HEART, '#ff6b8a', q.x, q.y, 3);
    else if (q.type === 'star') drawRows(STAR, q.color || '#ffd34d', q.x, q.y, 2);
    else if (q.type === 'note') drawRows(NOTE, '#fffdf7', q.x, q.y, 3);
    else if (q.type === 'crumb') { ctx.fillStyle = '#7ec8e3'; ctx.fillRect(Math.round(q.x), Math.round(q.y), 3, 3); }
    else if (q.type === 'puff') { ctx.fillStyle = '#fffdf7'; ctx.fillRect(Math.round(q.x), Math.round(q.y), 6, 6); }
    else if (q.type === 'spark') { ctx.fillStyle = q.color || '#fffdf7'; ctx.fillRect(Math.round(q.x), Math.round(q.y), 6, 6); }
    else if (q.type === 'confetti') { ctx.fillStyle = q.color; ctx.fillRect(Math.round(q.x), Math.round(q.y), q.w, Math.floor(q.life * 9) % 2 ? q.h : 4); }
    else if (q.type === 'z') { ctx.fillStyle = '#dfe3ff'; ctx.font = '700 18px "Pixelify Sans", monospace'; ctx.fillText('z', q.x, q.y); }
  }
  ctx.globalAlpha = 1;
  drawBubbles();
}

/* ---------- loop ---------- */
let last = performance.now();
// Whatever goes wrong in one frame, the next one still runs: a single bad frame must never freeze the pet for good.
function frame(now) {
  try { step(now); }
  catch (err) { console.error('frame failed: ' + (err && err.stack || err)); }
  requestAnimationFrame(frame);
}
function step(now) {
  const dt = clamp((now - last) / 1000, 0, .05); last = now;
  readSurfaces();
  for (const p of [...world.pets]) {
    p.anim += dt; p.jumpCd -= dt; p.squash = Math.max(0, p.squash - dt * 4); p.dizzy = Math.max(0, p.dizzy - dt);
    p.blinkT -= dt; if (p.blinkT < -.14) p.blinkT = rand(2, 5);
    if (p.spin) p.spin.t += dt;
    ai(p, dt);
    if (world.pets.includes(p) && p.state !== 'drag') {
      physics(p, dt);
      if (!p.exiting && !inside(p.x, p.y - 20)) rescue(p);
      // Fell out of the bottom of the world while coming or going: count it as having left.
      else if (p.exiting && p.y > world.h + 300) { if (p.mode === 'leave') vanish(p); else { p.exiting = false; p.mode = null; rescue(p); } }
    }
    if (p.buddy) {
      // The buddy trails a little behind, catching up faster the further away it is.
      const tx = p.x - p.dir * 50 * K(), ty = p.y - (BUDDIES[p.buddy].hover || 0) * K();
      if (!p.bud || Math.hypot(tx - p.bud.x, ty - p.bud.y) > 900) p.bud = { x: tx, y: ty, dir: p.dir };
      const k = Math.min(1, dt * 4);
      if (Math.abs(tx - p.bud.x) > 2) p.bud.dir = Math.sign(tx - p.bud.x);
      p.bud.x += (tx - p.bud.x) * k; p.bud.y += (ty - p.bud.y) * k;
    }
    if (p.state === 'sleep' && Math.random() < dt * .9) world.parts.push({ type: 'z', x: p.x + 16, y: p.y - 56 * K(), vx: rand(8, 20), vy: -24, life: 0, max: 2 });
  }
  for (const it of world.items) { physics(it, dt); it.age += dt; }
  const hadBall = world.items.some(i => i.type === 'ball');
  for (const it of [...world.items]) {
    if (!inside(it.x, it.y - 20) || (it.type === 'ball' && (it.age > 40 || it.kicks >= 7)) || (it.type === 'gift' && it.age > 900) || (it.type === 'food' && it.age > 30)) removeItem(it);
  }
  if (hadBall && !world.items.some(i => i.type === 'ball') && !away() && !(me.bubble && me.bubble.buttons)) say(me, 'good game!', 1.6);
  for (const q of world.parts) {
    q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.type === 'crumb' || q.type === 'star' || q.type === 'spark') q.vy += 900 * dt;
    else if (q.type === 'confetti') q.vy += 120 * dt;
  }
  world.parts = world.parts.filter(q => q.life < q.max);
  placeHandles();
  draw();
}

/* ---------- wiring ---------- */
function start(o) {
  floorEl = o.floor;
  cv = document.createElement('canvas'); cv.id = 'petfx'; cv.setAttribute('aria-hidden', 'true');
  handles = document.createElement('div'); handles.id = 'pet-handles';
  bubbles = document.createElement('div'); bubbles.id = 'bubbles';
  document.body.append(cv, handles, bubbles);
  ctx = cv.getContext('2d');
  world.perches = [...document.querySelectorAll('[data-perch]')];
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.at = performance.now(); }, { passive: true });
  bubbles.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const p = world.pets.find(x => x.bubbleEl && x.bubbleEl.contains(b));
    SFX.play('click');
    if (p && p.bubble && p.bubble.onPick) p.bubble.onPick(b.dataset.act);
  });
  resize();
  me = makePet({ name: o.name, ...cleanLook(o.look), x: world.w * (o.x || .5), y: 60 });
  world.pets.push(me);
  const hour = new Date().getHours();
  say(me, hour < 5 ? 'up late, huh?' : hour < 11 ? 'good morning!' : hour >= 22 ? 'getting late...' : `hi! I'm ${o.name}`, 2.4);
  requestAnimationFrame(frame);
}
// What the pet is up to, in words the page can show.
function status() {
  if (!me) return null;
  if (away()) return { state: 'away', on: null };
  const s = me.ride && surfById(me.ride.id);
  return { state: me.mode === 'nag' ? 'nag' : me.mode === 'leave' ? 'leaving' : me.state, on: s ? (s.floor ? 'floor' : s.wid) : null };
}

return {
  start, status, world,
  on(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
  cmd: command,
  confetti,
  // Pixel sparks anywhere on the page, for the capsule reveal and the like.
  sparks(x, y, n, colors, power = 260) { burst('spark', x, y, n, { colors, spread: 10, vx: power, vy1: -power * 1.4, vy2: power * .2, max: 1 }); },
  hearts(x, y, n = 4) { burst('heart', x, y, n, { max: 1.3 }); },
  get away() { return away(); },
  get busy() { return occupied(); },
  get scale() { return S; },
};
})();
