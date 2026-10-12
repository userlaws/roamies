// The Roamies website. The page is a desktop: this file runs the sky, the windows, the taskbar,
// and the little copies of the app's own tabs (Play, Friends, Wardrobe, Capsules) that drive the pet on the page.
(() => {
'use strict';

/* ---------- fill these in when there is something to hand out ---------- */
const CONFIG = {
  windowsUrl: 'https://github.com/userlaws/roamies/releases/latest/download/Roamies-Setup.exe',   // link to the Windows installer. Empty: the button says "coming soon".
  notifyUrl: '',    // a waitlist, newsletter or Discord link to offer until then. Empty: no second button.
  releases: 'userlaws/roamies',   // the GitHub repo whose releases are the app's versions. The page shows the newest one's tag.
};

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- what this page remembers about you ---------- */
const STORE = 'roamies-site-v1';
const blank = () => ({ coins: 600, name: 'Pip', look: { char: 'cat', skin: 'classic', hat: null, face: null, buddy: null }, won: [], quests: [], sound: true, soundSet: false, nagPaid: false, code: '' });
function load() {
  try {
    const s = Object.assign(blank(), JSON.parse(localStorage.getItem(STORE)) || {}); s.look = Object.assign(blank().look, s.look);
    if (!s.soundSet) s.sound = true;   // sound is on unless this visitor has used the switch themselves
    return s;
  }
  catch (err) { return blank(); }
}
const state = load();
function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (err) { /* private window: fine, nothing persists */ } }

/* ---------- sound: on by default, from the visitor's first click, tap or key press ---------- */
// Browsers don't let a page make noise before that, and anything scheduled early would all play at once when they do.
let armed = false;
SFX.set({ enabled: false, volume: .55 });
function applySound() {
  SFX.set({ enabled: armed && state.sound });
  $('sound').setAttribute('aria-pressed', String(state.sound));
  paintIcon($('sound').firstElementChild);
  $('stSound').textContent = state.sound ? 'on. turn it off?' : 'off. turn it on?';
}
function setSound(on) {
  state.sound = on; state.soundSet = true; armed = true; applySound(); save();
  if (on) SFX.play('on');
}
const arm = () => {
  if (armed) return;
  // Wait for an action the browser itself counts (a scroll or a Tab press doesn't), or the audio stays suspended.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  armed = true; applySound();
};
for (const type of ['pointerdown', 'pointerup', 'keydown', 'click']) addEventListener(type, arm, { capture: true });
$('sound').addEventListener('click', () => setSound(!state.sound));
$('stSound').addEventListener('click', () => setSound(!state.sound));
// Anything with data-snd makes that sound when clicked, like the app window does.
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-snd]');
  if (t && t.dataset.snd !== 'none') SFX.play(t.dataset.snd);
});

/* ---------- pixel icons, drawn the way the app draws its tab icons ---------- */
const ICONS = {
  shirt: [".oo..oo.", "oooooooo", "oooooooo", ".oooooo.", ".oooooo.", ".oooooo.", ".oooooo.", "........"],
  capsule: ["..oooo..", ".oooooo.", "oooooooo", "oooooooo", "xxxxxxxx", "xxxxxxxx", ".xxxxxx.", "..xxxx.."],
  heart: [".oo..oo.", "oooooooo", "oooooooo", "oooooooo", ".oooooo.", "..oooo..", "...oo...", "........"],
  star: ["...oo...", "...oo...", "oooooooo", ".oooooo.", "..oooo..", ".oooooo.", ".oo..oo.", "........"],
  pad: ["........", ".oooooo.", "oooooooo", "oxooooxo", "oooooooo", "oo....oo", "o......o", "........"],
  gear: ["..o..o..", ".oooooo.", "ooo..ooo", ".o....o.", ".o....o.", "ooo..ooo", ".oooooo.", "..o..o.."],
  doc: [".ooooo..", ".oxxxoo.", ".oxxxxo.", ".oxooxo.", ".oxxxxo.", ".oxooxo.", ".oxxxxo.", ".oooooo."],
  win: ["oooooooo", "oooooooo", "oxxxxxxo", "oxxxxxxo", "oxxxxxxo", "oxxxxxxo", "oooooooo", "........"],
  clock: ["..oooo..", ".oxxoxo.", "oxxxoxxo", "oxxxoxxo", "oxxxooxo", "oxxxxxxo", ".oxxxxo.", "..oooo.."],
  note: ["...oooo.", "...o..o.", "...o..o.", "...o..o.", ".ooo.ooo", "oooo.ooo", ".oo...o.", "........"],
  monitor: ["oooooooo", "oxxxxxxo", "oxxxxxxo", "oxxxxxxo", "oooooooo", "...oo...", "..oooo..", "........"],
  down: ["...oo...", "...oo...", "...oo...", "oooooooo", ".oooooo.", "..oooo..", "...oo...", "oooooooo"],
  paw: [".o....o.", ".o.oo.o.", "...oo...", "........", "..oooo..", ".oooooo.", ".oooooo.", "..o..o.."],
  sun: ["...o....", ".o...o..", "..ooo...", "o.ooo.o.", "..ooo...", ".o...o..", "...o....", "........"],
  moon: ["..ooo...", ".ooo....", "ooo.....", "ooo.....", "ooo....o", ".ooo..oo", "..ooooo.", "........"],
  coin: ["..oooo..", ".oxxxxo.", "oxxooxxo", "oxxoxxxo", "oxxoxxxo", "oxxooxxo", ".oxxxxo.", "..oooo.."],
  play: [".o......", ".ooo....", ".ooooo..", ".ooooooo", ".ooooo..", ".ooo....", ".o......", "........"],
  chat: [".oooooo.", "oxxxxxxo", "oxoxoxxo", "oxxxxxxo", ".oooooo.", "..oo....", ".o......", "........"],
  hand: ["...o....", "..ooo...", ".ooooo..", "...o....", "...o....", ".ooooo..", "..ooo...", "...o...."],
};
function paintIcon(c) {
  const rows = ICONS[c.dataset.ico]; if (!rows) return;
  c.width = 8; c.height = 8;
  const x = c.getContext('2d'); x.fillStyle = getComputedStyle(c).color;
  rows.forEach((row, r) => [...row].forEach((k, i) => { if (k === '.') return; x.globalAlpha = k === 'o' ? 1 : .4; x.fillRect(i, r, 1, 1); }));
}
function paintArt(c) {
  const name = c.dataset.art;
  const a = ART[name] || (name === 'heart' ? { rows: HEART, pal: { r: '#ff6b8a' } } : { rows: ICONS[name], pal: { o: '#2a2530', x: '#2a253066' } });
  const w = a.rows[0].length, h = a.rows.length, n = Math.max(w, h);
  c.width = n; c.height = n;
  const x = c.getContext('2d'), ox = Math.floor((n - w) / 2), oy = Math.floor((n - h) / 2);
  a.rows.forEach((row, r) => [...row].forEach((k, i) => { if (k === '.') return; x.fillStyle = a.pal[k]; x.fillRect(i + ox, r + oy, 1, 1); }));
}
// A pet's head, cropped from its sprite. Tall ears and all.
function paintFace(c, look) {
  c.width = 16; c.height = 14;
  const x = c.getContext('2d'); x.clearRect(0, 0, 16, 14);
  x.drawImage(sprite(look, 'base'), 0, 6, 16, 14, 0, 0, 16, 14);
}
function paintWhole(c, look, frame) {
  c.width = SPR_W; c.height = SPR_H;
  const x = c.getContext('2d'); x.clearRect(0, 0, SPR_W, SPR_H);
  x.globalAlpha = SKINS[look.skin] && SKINS[look.skin].alpha || 1;
  x.drawImage(sprite(look, frame || 'base'), 0, 0);
}
document.querySelectorAll('canvas[data-ico]').forEach(paintIcon);
document.querySelectorAll('canvas[data-art]').forEach(paintArt);
paintFace($('brandFace'), { char: 'cat', skin: 'classic' });

/* ---------- toasts ---------- */
function toast(text) {
  const t = el('div', 'toast', text);
  $('toasts').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, 3200);
  while ($('toasts').children.length > 3) $('toasts').firstElementChild.remove();
}

/* ---------- coins ---------- */
function showCoins(bump) {
  $('coins').textContent = state.coins - capsuleHeld;
  if (bump) { const p = $('coinPill'); p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
  renderCapsule();
}
function earn(n) { state.coins += n; save(); showCoins(true); }
// The app pays a coin for every minute the pet is out on your desktop. So does this page.
setInterval(() => { if (!document.hidden && !Pet.away) earn(1); }, 60000);

/* ---------- the sky: a low-resolution canvas, dithered, that runs from morning to midnight ---------- */
const Sky = (() => {
  const cv = $('sky'), cx = cv.getContext('2d');
  const CELL = 6, BANDS = 11;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const rgb = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  // hour, then: top of the sky, the horizon, far hills, near hills, clouds
  const KEYS = [
    [6, '#f0a591', '#ffe2bd', '#8fb873', '#6a9a5c', '#fff0e0'],
    [8.5, '#6dbcf0', '#ffe9cf', '#9ccf7a', '#6fae5e', '#ffffff'],
    [12.5, '#3f9bea', '#bfe8ff', '#8fc86a', '#5fa352', '#ffffff'],
    [16.75, '#5a8fdc', '#ffd08f', '#a3b85e', '#6f964a', '#fff1dc'],
    [18.6, '#4d3f8f', '#ff9d6e', '#6a5a86', '#473a63', '#ffb59a'],
    [20, '#2b2350', '#8a5a78', '#3a2f55', '#2a2240', '#6f5682'],
    [22.5, '#161228', '#33295a', '#231c38', '#18132a', '#2b2350'],
    [24, '#0e0b18', '#261f42', '#1b1630', '#120e20', '#221b3a'],
  ].map(([h, ...c]) => ({ h, c: c.map(hex) }));
  const CLOUDS = [
    ["........oooooo..............", "......oooooooooo....oooo....", "...oooooooooooooooooooooo...", ".oooooooooooooooooooooooooo.", "oooooooooooooooooooooooooooo", ".xxxxxxxxxxxxxxxxxxxxxxxxxx."],
    ["....ooooo.........", "..ooooooooo.ooo...", ".ooooooooooooooo..", "oooooooooooooooooo", ".xxxxxxxxxxxxxxxx."],
    ["...oooo.....", ".oooooooo...", "oooooooooooo", ".xxxxxxxxxx."],
  ];
  let W = 0, H = 0, img = null, hour = 8.5, dirty = true, lastDraw = 0;
  // A fixed scatter, so the sky is the same sky every visit.
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const stars = Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd(), v: 1 + rnd() * 3, p: rnd() * 6, big: rnd() < .12 }));
  const clouds = Array.from({ length: 9 }, (_, i) => ({ x: (i + rnd() * .7) / 9, y: .03 + rnd() * .42, v: .25 + rnd() * .5, shape: CLOUDS[i % 3] }));
  const trees = Array.from({ length: 9 }, () => rnd());

  function palette(h) {
    let i = 0; while (i < KEYS.length - 2 && h > KEYS[i + 1].h) i++;
    const a = KEYS[i], b = KEYS[i + 1], t = clamp((h - a.h) / (b.h - a.h), 0, 1);
    return a.c.map((c, k) => mix(c, b.c[k], t));
  }
  function resize() {
    // A tab opened in the background can report a zero-sized window; draw something anyway and catch up on the next frame.
    W = Math.max(8, Math.ceil(innerWidth / CELL)); H = Math.max(8, Math.ceil(innerHeight / CELL));
    cv.width = W; cv.height = H; img = cx.createImageData(W, H); dirty = true;
  }
  function disc(x0, y0, r, color) {
    cx.fillStyle = color; x0 = Math.round(x0); y0 = Math.round(y0);
    for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y) + .35); cx.fillRect(x0 - w, y0 + y, w * 2 + 1, 1); }
  }
  const hillFar = (x) => 14 + 6 * Math.sin(x * .043 + 1.3) + 3 * Math.sin(x * .11 + .4);
  const hillNear = (x) => 6 + 4 * Math.sin(x * .067 + 3.1) + 2 * Math.sin(x * .19);

  function render(now) {
    const [top, hor, far, near, cloud] = palette(hour);
    const t = calm ? 0 : now / 1000;
    // the sky itself: flat bands with a dithered seam between each
    const bands = []; for (let i = 0; i <= BANDS + 1; i++) bands.push(mix(top, hor, Math.min(1, i / BANDS)));
    const d = img.data;
    for (let y = 0; y < H; y++) {
      const f = Math.pow(y / (H - 1), 1.1) * BANDS, i = Math.floor(f), fr = f - i, seam = fr < .45 ? 0 : (fr - .45) / .55;
      for (let x = 0; x < W; x++) {
        const c = bands[i + (seam > (BAYER[(y & 3) * 4 + (x & 3)] + .5) / 16 ? 1 : 0)], o = (y * W + x) * 4;
        d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
    }
    cx.putImageData(img, 0, 0);
    // stars come out after sunset
    const night = clamp((hour - 18.4) / 2.2, 0, 1);
    if (night > 0) {
      cx.fillStyle = '#ffffff';
      for (const s of stars) {
        cx.globalAlpha = night * (.25 + .75 * (.5 + .5 * Math.sin(t * s.v + s.p)));
        const x = Math.floor(s.x * W), y = Math.floor(s.y * H * .82);
        cx.fillRect(x, y, 1, 1);
        if (s.big) { cx.fillRect(x - 1, y, 3, 1); cx.fillRect(x, y - 1, 1, 3); }
      }
      cx.globalAlpha = 1;
    }
    // sun: up on the right in the morning, down on the left by evening
    const u = (hour - 4) / 14.6;
    if (u > 0 && u < 1.05) {
      // On a wide screen the morning sun sits in the gap between the headline and the windows; on a narrow one, top right.
      const sx = W * ((innerWidth >= 1080 ? .78 : 1.06) - .72 * u), sy = H * (.96 - .9 * Math.pow(Math.max(0, Math.sin(Math.PI * u)), .6));
      const low = clamp((hour - 15.5) / 3, 0, 1);
      disc(sx, sy, 8, rgb(mix(hex('#ffe27a'), hex('#ff8a4d'), low)));
      disc(sx, sy, 6, rgb(mix(hex('#fff6c2'), hex('#ffc46b'), low)));
    }
    // moon
    const m = (hour - 19) / 9;
    if (m > 0) {
      const mx = W * (.1 + .7 * m), my = H * (.96 - .82 * Math.pow(Math.sin(Math.PI * m), .6));
      disc(mx, my, 7, '#e9d48e'); disc(mx - 1, my - 1, 6, '#fff3c4');
      cx.fillStyle = '#e9d48e'; cx.fillRect(Math.round(mx) - 3, Math.round(my) - 2, 2, 1); cx.fillRect(Math.round(mx) + 1, Math.round(my) + 2, 1, 1);
    }
    // clouds
    const shade = rgb(mix(cloud, top, .38)), white = rgb(cloud);
    for (const c of clouds) {
      const w = c.shape[0].length, x0 = Math.floor(((c.x * (W + 60) + t * c.v) % (W + 60)) - 30), y0 = Math.floor(c.y * H);
      c.shape.forEach((row, r) => { for (let i = 0; i < w; i++) { if (row[i] === '.') continue; cx.fillStyle = row[i] === 'o' ? white : shade; cx.fillRect(x0 + i, y0 + r, 1, 1); } });
    }
    // hills, poking up from behind the taskbar
    const tb = Math.ceil(60 / CELL);
    const farC = rgb(far), rim = rgb(mix(far, hor, .28)), tree = rgb(mix(far, [20, 14, 30], .32));
    for (let x = 0; x < W; x++) { const y = H - tb - Math.round(hillFar(x)); cx.fillStyle = farC; cx.fillRect(x, y, 1, H - y); cx.fillStyle = rim; cx.fillRect(x, y, 1, 1); }
    cx.fillStyle = tree;
    for (const f of trees) { const x = Math.floor(f * W), y = H - tb - Math.round(hillFar(x)); cx.fillRect(x - 1, y - 4, 3, 3); cx.fillRect(x, y - 5, 1, 1); cx.fillRect(x, y - 1, 1, 2); }
    const nearC = rgb(near), rim2 = rgb(mix(near, hor, .2));
    for (let x = 0; x < W; x++) { const y = H - tb - Math.round(hillNear(x)); cx.fillStyle = nearC; cx.fillRect(x, y, 1, H - y); cx.fillStyle = rim2; cx.fillRect(x, y, 1, 1); }
  }
  function tick(now) {
    if (Math.abs(Math.ceil(innerWidth / CELL) - W) > 1 || Math.abs(Math.ceil(innerHeight / CELL) - H) > 1) resize();
    // Clouds and stars only need a few frames a second; a scroll redraws straight away.
    if (dirty || now - lastDraw > (calm ? 1e9 : 110)) { render(now); dirty = false; lastDraw = now; }
    requestAnimationFrame(tick);
  }
  addEventListener('resize', resize);
  resize(); requestAnimationFrame(tick);
  return { set(h) { if (Math.abs(h - hour) > .004) { hour = h; dirty = true; } } };
})();

/* ---------- the day goes by as you scroll: sky, taskbar clock, and which app is "open" ---------- */
const scenes = [...document.querySelectorAll('.scene')];
const navLinks = [...document.querySelectorAll('#tbApps a')];
let stops = [];
function measure() { stops = scenes.map(s => ({ id: s.id, top: s.offsetTop, y: s.offsetTop + innerHeight * .5, hour: Number(s.dataset.hour) })); }
function clockText(h) {
  h %= 24; const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${hh >= 12 ? 'PM' : 'AM'}`;
}
function onScroll() {
  const y = scrollY + innerHeight * .5;
  let hour = stops[0].hour;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i], b = stops[i + 1];
    if (y >= a.y) hour = a.hour + (b.hour - a.hour) * clamp((y - a.y) / (b.y - a.y), 0, 1);
  }
  // The last stretch of the page always lands on midnight, however short the final scene is.
  const end = document.documentElement.scrollHeight - innerHeight;
  if (end - scrollY < 300) hour = Math.max(hour, 24 - (end - scrollY) / 300 * (24 - hour));
  Sky.set(hour);
  $('clock').textContent = clockText(hour);
  let here = stops[0].id;
  for (const s of stops) if (y >= s.top + 80) here = s.id;
  for (const a of navLinks) a.classList.toggle('on', a.getAttribute('href') === '#' + here);
}
measure(); onScroll();
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { measure(); onScroll(); });
addEventListener('load', () => { measure(); onScroll(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); onScroll(); });

/* ---------- windows drag by their title bar, and the pet rides them ---------- */
let zTop = 10;
for (const win of document.querySelectorAll('.win')) {
  const bar = win.querySelector('.win-bar'); if (!bar) continue;
  let d = null;
  bar.addEventListener('pointerdown', (e) => {
    if (e.button || e.pointerType === 'touch') return;
    e.preventDefault(); bar.setPointerCapture(e.pointerId);
    d = { x: e.clientX, y: e.clientY, sy: scrollY, dx: parseFloat(win.style.getPropertyValue('--dx')) || 0, dy: parseFloat(win.style.getPropertyValue('--dy')) || 0 };
    win.classList.add('dragging'); win.style.zIndex = ++zTop;
    SFX.play('click');
  });
  bar.addEventListener('pointermove', (e) => {
    if (!d) return;
    win.style.setProperty('--dx', d.dx + e.clientX - d.x + 'px');
    win.style.setProperty('--dy', d.dy + e.clientY - d.y + scrollY - d.sy + 'px');
    const st = Pet.status();
    if (st && st.on === win.dataset.perch && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 70) quest('ride');
  });
  const drop = () => { if (!d) return; d = null; win.classList.remove('dragging'); SFX.play('plop'); };
  bar.addEventListener('pointerup', drop);
  bar.addEventListener('pointercancel', drop);
  bar.addEventListener('dblclick', () => { win.style.setProperty('--dx', '0px'); win.style.setProperty('--dy', '0px'); SFX.play('slide'); });
}
// Each window opens the first time it comes on screen: its top has to clear the taskbar, so a window is open before the pet can reach it.
// Checked by hand on every scroll rather than with an observer, so nothing can be left invisible by a callback that never came.
let shut = [...document.querySelectorAll('.win')];
function openWindows() {
  if (!shut.length) return;
  let n = 0;
  shut = shut.filter((w) => {
    const r = w.getBoundingClientRect();
    if (r.top > innerHeight - 70 || r.bottom < 0) return true;
    setTimeout(() => w.classList.add('open'), n++ * 90);
    return false;
  });
}
addEventListener('scroll', openWindows, { passive: true });
addEventListener('resize', openWindows);
addEventListener('load', openWindows);
openWindows();
const titleOf = (perch) => { const w = document.querySelector(`[data-perch="${perch}"]`); return w ? w.dataset.title : perch; };

/* ---------- readme.txt: four things to try, ticked off as you do them ---------- */
// On a touch screen two of the four don't apply and are hidden, so "all done" means all the ones on show.
const questsLeft = () => [...$('todo').children].filter(li => getComputedStyle(li).display !== 'none' && !state.quests.includes(li.dataset.quest)).length;
function showQuests(pop) {
  for (const li of $('todo').children) {
    const done = state.quests.includes(li.dataset.quest);
    if (done && !li.classList.contains('done') && pop) { li.classList.add('pop'); }
    li.classList.toggle('done', done);
  }
  if (!questsLeft()) $('todoNote').textContent = 'All done. The capsule machine further down takes coins.';
}
function quest(id) {
  if (state.quests.includes(id)) return;
  state.quests.push(id); earn(15); showQuests(true);
  SFX.play(questsLeft() ? 'coin' : 'quest');
  if (!questsLeft()) { Pet.confetti(60); Pet.cmd('say', { text: 'you get me.', sec: 2.4, hearts: 6 }); }
  else toast('+15 coins');
}

/* ---------- pip.status ---------- */
const DOING = { idle: 'looking around', walk: 'walking', sit: 'sitting', sleep: 'asleep', air: 'in the air', drag: 'being carried', ouch: 'seeing stars', nag: 'waiting for an answer',
  eat: 'eating', emote: 'dancing', happy: 'happy', prep: 'about to jump', away: 'out visiting', leaving: 'heading out' };
setInterval(() => {
  const st = Pet.status(); if (!st) return;
  $('stDoing').textContent = DOING[st.state] || st.state;
  $('stWhere').textContent = st.state === 'away' ? "Dani's desktop" : st.on === 'floor' ? 'on the taskbar' : st.on ? `on "${titleOf(st.on)}"` : 'mid-air';
}, 200);

/* ---------- Play ---------- */
let lastMouseX = innerWidth / 2;
addEventListener('pointermove', (e) => { lastMouseX = e.clientX; }, { passive: true });
function act(name, x) {
  if (Pet.away) { toast(`${state.name} is out visiting. Back in a moment.`); return; }
  const [cmd, arg] = name.split(':');
  if (cmd === 'come') Pet.cmd('come', { x });
  else Pet.cmd(cmd, arg);
}
for (const b of document.querySelectorAll('#actions button, #emotes button')) {
  b.addEventListener('click', () => { const r = b.getBoundingClientRect(); act(b.dataset.act, r.left + r.width / 2); });
}
// The app's hotkey works here too, while the page has focus.
addEventListener('keydown', (e) => { if (e.ctrlKey && e.altKey && e.code === 'KeyP') { e.preventDefault(); act('come', lastMouseX); } });

for (const [id, c] of Object.entries(CHARS)) {
  const b = el('button'); b.type = 'button'; b.dataset.snd = 'none'; b.title = `Hear the ${c.name.toLowerCase()}`;
  const face = el('canvas'); paintFace(face, { char: id, skin: 'classic' });
  b.append(face, el('span', null, c.name));
  b.addEventListener('click', () => {
    if (!state.sound) { setSound(true); toast('Sound is on. The speaker in the taskbar turns it off.'); }
    SFX.voice('happy', id); setTimeout(() => SFX.talk('hello there you', id), 320);
    b.classList.remove('said'); void b.offsetWidth; b.classList.add('said');
  });
  $('voices').appendChild(b);
}

/* ---------- Breaks: a video that has been on for 45 minutes ---------- */
const Video = (() => {
  const cv = $('fishcam'), cx = cv.getContext('2d'), W = 128, H = 72;
  let sec = 44 * 60 + 38, rate = 1, phase = 'idle', visible = false, last = 0, retry = 0;
  const fishes = [
    { x: 30, y: 22, v: -9, s: 2, body: '#ffb25b' }, { x: 90, y: 40, v: 6, s: 1, body: '#ff7a90' }, { x: 60, y: 52, v: -5, s: 1, body: '#ffd34d' },
    { x: 110, y: 14, v: 4, s: 1, body: '#7fd6b0' }, { x: 10, y: 34, v: 7, s: 2, body: '#7ec8e3' },
  ];
  const bubbles = Array.from({ length: 9 }, (_, i) => ({ x: 12 + i * 13.7 % W, y: Math.random() * H, v: 6 + Math.random() * 8 }));
  function draw(t) {
    const water = ['#0e3a63', '#12507f', '#17679c', '#1d7fb6'];
    for (let y = 0; y < H; y++) { cx.fillStyle = water[Math.min(3, Math.floor((y + (y % 2 ? 3 : 0)) / 18))]; cx.fillRect(0, y, W, 1); }
    cx.fillStyle = '#e6c98a'; cx.fillRect(0, H - 7, W, 7);
    cx.fillStyle = '#c9a868'; for (let x = 3; x < W; x += 11) cx.fillRect(x, H - 4 + (x % 3), 2, 1);
    for (let i = 0; i < 6; i++) {   // seaweed
      const x0 = 9 + i * 22 + (i % 2) * 5, h = 9 + (i * 7) % 8;
      cx.fillStyle = i % 2 ? '#3fa37a' : '#2f8f6a';
      for (let k = 0; k < h; k++) cx.fillRect(x0 + Math.round(Math.sin(t * 1.6 + i + k * .5) * (k / h) * 2), H - 8 - k, 2, 1);
    }
    cx.fillStyle = '#cfeeff';
    for (const b of bubbles) cx.fillRect(Math.round(b.x + Math.sin(t * 2 + b.v)), Math.round(b.y), 1, 1);
    for (const f of fishes) {
      const rows = ART.food.rows, w = rows[0].length, bob = Math.round(Math.sin(t * 2 + f.x * .1));
      for (let r = 0; r < rows.length; r++) for (let i = 0; i < w; i++) {
        const k = rows[r][f.v < 0 ? i : w - 1 - i]; if (k === '.') continue;
        cx.fillStyle = k === 'b' ? f.body : '#1d1a2b';
        cx.fillRect(Math.round(f.x) + i * f.s, f.y + bob + r * f.s, f.s, f.s);
      }
    }
  }
  function ask(practice) {
    if (Pet.cmd('nag', { perch: 'video', minutes: 45, practice })) { phase = 'asked'; $('timecode').classList.add('hot'); return true; }
    return false;
  }
  function tick(now) {
    requestAnimationFrame(tick);
    if (!visible || now - last < 80) return;
    const dt = Math.min(.3, (now - last) / 1000); last = now;
    if (phase !== 'asked') sec += dt * rate;
    for (const f of fishes) { f.x += f.v * dt; if (f.x < -26) f.x = W + 4; if (f.x > W + 6) f.x = -24; }
    for (const b of bubbles) { b.y -= b.v * dt; if (b.y < 0) b.y = H - 8; }
    if (phase === 'counting' && sec >= 45 * 60) {
      sec = 45 * 60; rate = 1;
      // If the pet is busy (out visiting, being carried), keep the clock at 45:00 and ask again shortly.
      if (now > retry && !ask(state.nagPaid)) retry = now + 1200;
    }
    draw(calm ? 0 : now / 1000);
    $('timecode').textContent = `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (e.intersectionRatio > .7 && phase === 'idle') { phase = 'counting'; rate = 5; }
  }, { threshold: [0, .7] }).observe(cv);
  Pet.on('nag-end', ({ kind, practice }) => {
    $('timecode').classList.remove('hot');
    if (kind === 'break') { sec = 0; if (!practice) { state.nagPaid = true; save(); } phase = 'done'; }
    else if (kind === 'snooze') { phase = 'done'; }
    else phase = 'done';
    $('nagTry').textContent = 'Try the break nudge';
  });
  $('nagTry').addEventListener('click', () => {
    if (phase === 'asked') return;
    cv.closest('.win').scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' });
    sec = 45 * 60;
    // Give the scroll a moment, so the video's top edge is on screen for the pet to climb onto.
    setTimeout(() => { if (!ask(state.nagPaid)) toast(`${state.name} is busy. Try again in a second.`); }, 500);
  });
  draw(0); requestAnimationFrame(tick);
})();

/* ---------- Friends: Dani, who lives in a small window ---------- */
const DANI = { name: 'Dani', char: 'bunny', skin: 'strawberry', hat: 'beanie' };
const Dani = (() => {
  const cv = $('daniScreen'), cx = cv.getContext('2d'), W = 160, H = 90, FLOOR = 80;
  const dani = { x: 108, tx: 108, dir: -1, t: 2, here: true, look: DANI };
  let guest = null, gift = null, hearts = [], visible = false, last = 0, anim = 0;
  function walk(a, dt, speed) {
    if (Math.abs(a.tx - a.x) > .6) { a.dir = Math.sign(a.tx - a.x); a.x += a.dir * speed * dt; a.moving = true; } else a.moving = false;
  }
  function drawPet(a) {
    const frame = a.moving ? (Math.floor(anim * 9) % 2 ? 'walkA' : 'walkB') : a.happy > 0 ? 'happy' : 'base';
    const img = sprite(a.look, frame), lift = a.happy > 0 ? Math.round(Math.abs(Math.sin(a.happy * 9)) * 3) : 0;
    cx.save(); cx.translate(Math.round(a.x), FLOOR - lift); if (a.dir > 0) cx.scale(-1, 1);
    cx.drawImage(img, -8, -SPR_H); cx.restore();
  }
  function draw() {
    const bands = ['#33295a', '#463466', '#5a3f6e', '#744c74', '#8a5a78'];
    for (let y = 0; y < FLOOR; y++) { cx.fillStyle = bands[Math.min(4, Math.floor((y + (y % 2 ? 4 : 0)) / 17))]; cx.fillRect(0, y, W, 1); }
    cx.fillStyle = '#fff3c4'; cx.fillRect(134, 9, 6, 6); cx.fillRect(133, 10, 8, 4); cx.fillRect(135, 8, 4, 8);
    // two of Dani's windows
    const win = (x, y, w, h, bar) => { cx.fillStyle = '#2a2530'; cx.fillRect(x - 1, y - 1, w + 2, h + 2); cx.fillStyle = '#fff6e4'; cx.fillRect(x, y, w, h); cx.fillStyle = bar; cx.fillRect(x, y, w, 4);
      cx.fillStyle = '#d9c9a8'; for (let k = 0; k < 3; k++) cx.fillRect(x + 3, y + 8 + k * 5, w - 6 - k * 6, 2); };
    win(14, 24, 52, 30, '#ff7a90'); win(92, 34, 46, 26, '#7fd6b0');
    cx.fillStyle = '#2a2530'; cx.fillRect(0, FLOOR, W, 1); cx.fillStyle = '#221b2e'; cx.fillRect(0, FLOOR + 1, W, H - FLOOR - 1);
    cx.fillStyle = '#ffb25b'; cx.fillRect(3, FLOOR + 3, 12, 5); cx.fillStyle = '#3d3352'; for (let k = 0; k < 4; k++) cx.fillRect(20 + k * 8, FLOOR + 4, 5, 3);
    if (gift) drawArt(cx, 'gift', gift.x, FLOOR, 1, 0);
    if (dani.here) drawPet(dani);
    if (guest) drawPet(guest);
    cx.fillStyle = '#ff6b8a';
    for (const h of hearts) HEART.forEach((row, r) => [...row].forEach((k, i) => { if (k !== '.') cx.fillRect(Math.round(h.x) + i - 3, Math.round(h.y) + r, 1, 1); }));
  }
  function tick(now) {
    requestAnimationFrame(tick);
    if (!visible || now - last < 60) return;
    const dt = Math.min(.2, (now - last) / 1000); last = now; anim += dt;
    for (const a of [dani, guest]) if (a) a.happy = Math.max(0, (a.happy || 0) - dt);
    if (dani.here) {
      if (!guest && !dani.leaving) { dani.t -= dt; if (dani.t <= 0) { dani.tx = 24 + Math.random() * 112; dani.t = 2 + Math.random() * 4; } }
      walk(dani, dt, dani.leaving ? 46 : 16);
      if (dani.leaving && dani.x > W + 8) { dani.here = false; dani.leaving = false; }
    }
    if (guest) {
      walk(guest, dt, 46);
      if (guest.phase === 'in' && !guest.moving) {
        guest.phase = 'stay'; guest.t = 4.2; guest.happy = dani.happy = 1.2; dani.dir = Math.sign(guest.x - dani.x) || -1;
        for (let i = 0; i < 4; i++) hearts.push({ x: (guest.x + dani.x) / 2 + (i - 1.5) * 7, y: FLOOR - 28 - i % 2 * 4, life: 1.4 });
      } else if (guest.phase === 'stay') {
        guest.t -= dt;
        if (guest.t <= 0) { gift = { x: guest.x, t: 9 }; guest.phase = 'out'; guest.tx = -14; }
      } else if (guest.phase === 'out' && guest.x < -10) { const f = guest.done; guest = null; f(); }
    }
    if (gift) { gift.t -= dt; if (gift.t <= 0) gift = null; }
    for (const h of hearts) { h.y -= 10 * dt; h.life -= dt; }
    hearts = hearts.filter(h => h.life > 0);
    draw();
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);
  draw(); requestAnimationFrame(tick);
  return {
    // Your pet turns up on Dani's screen, says hello, leaves a gift and heads home.
    host(look, done) { dani.tx = clamp(dani.x, 70, 120); guest = { x: -12, tx: dani.tx - 26, dir: 1, look, phase: 'in', done }; },
    leave() { dani.leaving = true; dani.tx = W + 20; },
    back() { dani.here = true; dani.leaving = false; dani.x = W + 10; dani.tx = 108; dani.t = 3; },
  };
})();
(() => {
  const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';   // no 0/O or 1/I/L: codes get read out loud
  if (!/^[2-9A-Z]{8}$/.test(state.code)) { state.code = Array.from({ length: 8 }, () => pick([...ALPHABET])).join(''); save(); }
  [...state.code].forEach((ch, i) => { if (i === 4) $('code').appendChild(el('u', null, '-')); $('code').appendChild(el('i', null, ch)); });
  paintWhole($('daniFace'), DANI);
  const line = (text, on) => { $('daniLine').replaceChildren(Object.assign(el('i', 'dot' + (on ? ' on' : ''))), document.createTextNode(text)); };
  const lock = (on) => { $('sendPet').disabled = on; $('inviteDani').disabled = on; };
  let busy = false;
  $('sendPet').addEventListener('click', () => {
    if (busy) return;
    if (!Pet.cmd('visit', DANI)) { toast(`${state.name} is busy. Try again in a second.`); return; }
    busy = true; lock(true); line(`${state.name} is on the way`, true);
  });
  Pet.on('left', () => {
    line(`${state.name} is at Dani's`, true);
    Dani.host({ ...state.look }, () => {
      Pet.cmd('home', { gift: 'a postcard', coins: 25 });
      line('Online', true);
      setTimeout(() => { busy = false; lock(false); }, 3500);
    });
  });
  $('inviteDani').addEventListener('click', () => {
    if (busy) return;
    busy = true; lock(true); line('On the way over', true);
    Dani.leave();
    setTimeout(() => { Pet.cmd('visitor', DANI); line('On your desktop', true); }, 1500);
  });
  Pet.on('visitor-left', () => { Dani.back(); line('Online', true); busy = false; lock(false); });
})();

/* ---------- Wardrobe ---------- */
const KIND_LIST = [
  { key: 'char', label: 'Characters', one: 'character' }, { key: 'skin', label: 'Colors', one: 'color' },
  { key: 'hat', label: 'Hats', one: 'hat', none: true }, { key: 'face', label: 'Face', one: 'face item', none: true }, { key: 'buddy', label: 'Buddies', one: 'buddy', none: true },
];
const RARITY_COLOR = { common: '#9aa3b2', rare: '#5aa9ff', epic: '#b47bff', legendary: '#ffcf3f' };
const wonKey = (k, id) => k + ':' + id;
let kind = KIND_LIST[0];
const center = (node) => { const r = node.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

const pv = $('preview'), pctx = pv.getContext('2d');
pv.width = 44; pv.height = SPR_H + 4;
let hopT = 9;                // seconds since the last hop; small values lift the pet
function popPreview() { pv.classList.remove('pop'); void pv.offsetWidth; pv.classList.add('pop'); }
function drawPreview(t) {
  const l = state.look;
  const frame = hopT < .45 ? 'happy' : t % 7 > 5.2 ? (Math.floor(t * 9) % 2 ? 'walkA' : 'walkB') : t % 3.1 < .14 ? 'blink' : 'base';
  const lift = hopT < .45 ? Math.round(Math.sin(hopT / .45 * Math.PI) * 5) : 0;
  pctx.clearRect(0, 0, pv.width, pv.height);
  pctx.fillStyle = 'rgba(10,6,20,.3)'; pctx.fillRect(9, pv.height - 2, 14 - lift, 1);
  pctx.globalAlpha = SKINS[l.skin].alpha || 1;
  pctx.drawImage(sprite(l, frame), 8, pv.height - SPR_H - 1 - lift);
  pctx.globalAlpha = 1;
  if (l.buddy) drawBuddy(pctx, l.buddy, 36, pv.height - 1 - (BUDDIES[l.buddy].hover ? 11 : 0) + Math.round(Math.sin(t * 5)), 1, false, l);
}
$('stage').addEventListener('click', (e) => {
  hopT = 0; Pet.hearts(e.clientX, e.clientY - 20, 4);
  SFX.play('heart'); SFX.voice('happy', state.look.char);
});
for (let i = 0; i < 12; i++) {
  const s = el('div', 'twinkle');
  s.style.left = 4 * Math.round(1 + Math.random() * 66) + 'px'; s.style.top = 4 * Math.round(1 + Math.random() * 30) + 'px'; s.style.animationDelay = -Math.random() * 2.4 + 's';
  $('stage').appendChild(s);
}
function thumb(k, id, base) {
  const c = el('canvas'); c.width = SPR_W; c.height = SPR_H;
  const x = c.getContext('2d');
  if (k === 'buddy') { if (id) drawBuddy(x, id, 8, SPR_H - 5, 1, false, base); }
  else x.drawImage(sprite({ ...base, [k]: id }, 'base'), 0, 0);
  if (k === 'skin' && SKINS[id].alpha) c.style.opacity = SKINS[id].alpha;
  return c;
}
function card(K, id, item, i) {
  const k = K.key, c = el('button', 'card'), worn = (state.look[k] || null) === id;
  c.type = 'button'; c.dataset.snd = 'none'; c.style.setProperty('--i', i);
  if (item) c.classList.add('r-' + rarityOf(item));
  if (worn) c.classList.add('on');
  c.setAttribute('aria-pressed', String(worn));
  c.appendChild(thumb(k, id, { ...state.look, [k]: id }));
  c.appendChild(el('b', null, item ? item.name : 'None'));
  const tag = el('small');
  if (worn) tag.textContent = 'Wearing';
  else if (!item) tag.textContent = 'Go without';
  else if (item.price == null) tag.textContent = 'Earned';
  else if (!item.price) tag.textContent = 'Starter';
  else { tag.textContent = item.price; tag.className = 'price'; }
  c.appendChild(tag);
  if (item && state.won.includes(wonKey(k, id))) c.appendChild(el('span', 'tag', 'WON'));
  else if (item && item.season) c.appendChild(el('span', 'tag season', item.season.toUpperCase()));
  if (item && item.unlock) c.title = 'In the app you earn this: ' + item.unlock.toLowerCase();
  // Clicking what the pet is already wearing takes it off, where going without is possible.
  c.addEventListener('click', () => wear(k, worn && K.none ? null : id, c));
  return c;
}
function renderWardrobe(animate) {
  const kinds = $('kinds'); kinds.replaceChildren();
  for (const K of KIND_LIST) {
    const b = el('button', K === kind ? 'on' : '', K.label);
    b.type = 'button'; b.dataset.snd = 'tab'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(K === kind));
    b.appendChild(el('small', null, Object.keys(KINDS[K.key]).length));
    b.addEventListener('click', () => { kind = K; renderWardrobe(true); });
    kinds.appendChild(b);
  }
  const grid = $('grid'), at = grid.scrollTop;
  grid.classList.toggle('still', !animate);
  grid.replaceChildren();
  let i = 0;
  if (kind.none) grid.appendChild(card(kind, null, null, i++));
  for (const [id, item] of Object.entries(KINDS[kind.key])) grid.appendChild(card(kind, id, item, i++));
  if (!animate) grid.scrollTop = at;
}
// Everything on the page that shows the visitor's own pet.
function showLook() {
  Pet.cmd('look', state.look);
  paintWhole($('footPet'), state.look, 'sleep');
  for (const n of document.querySelectorAll('[data-petname]')) n.textContent = state.name;
}
function wear(k, id, from) {
  if ((state.look[k] || null) === id) return;
  state.look[k] = id; save(); showLook();
  SFX.play('equip'); if (k === 'char') SFX.voice('happy', id);
  popPreview(); hopT = 0;
  const item = id && KINDS[k][id], p = center($('stage'));
  Pet.sparks(p.x, p.y + 30, 10, [RARITY_COLOR[item ? rarityOf(item) : 'common'], '#fffdf7'], 180);
  renderWardrobe(false);
  if (from) { const again = [...$('grid').children].find(c => c.classList.contains('on')); if (again) again.focus({ preventScroll: true }); }
}
$('shuffle').addEventListener('click', () => {
  const any = (cat) => pick(Object.keys(cat));
  state.look = { char: any(CHARS), skin: any(SKINS), hat: Math.random() < .8 ? any(HATS) : null, face: Math.random() < .35 ? any(FACES) : null, buddy: Math.random() < .4 ? any(BUDDIES) : null };
  save(); showLook(); popPreview(); hopT = 0;
  SFX.play('pop'); SFX.voice('happy', state.look.char);
  const p = center($('stage')); Pet.sparks(p.x, p.y + 30, 16, ['#ffb25b', '#ff7a90', '#7fd6b0', '#fffdf7'], 220);
  renderWardrobe(false);
});
$('name').value = state.name;
$('name').addEventListener('input', () => {
  state.name = $('name').value.trim().slice(0, 16) || 'Pip'; save();
  Pet.cmd('name', state.name);
  for (const n of document.querySelectorAll('[data-petname]')) n.textContent = state.name;
});
$('name').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('name').blur(); });
$('counts').textContent = `${Object.keys(CHARS).length} characters, ${Object.keys(SKINS).length} colors, ${Object.keys(HATS).length} hats, ${Object.keys(FACES).length} face items and ${Object.keys(BUDDIES).length} buddies.`;

/* ---------- Capsules ---------- */
const CAPSULE_COST = 120;
const CAPSULE_ODDS = { common: 60, rare: 28, epic: 10, legendary: 2 };
// What a capsule pays when it holds something this visitor has won already (CAPSULE.dupe in the app's game.mjs).
const CAPSULE_DUPE = { common: 30, rare: 50, epic: 80, legendary: 110 };
// Everything a capsule may hold: whatever costs coins, won already or not.
function capsulePool() {
  const pool = [];
  for (const K of KIND_LIST) for (const [id, item] of Object.entries(KINDS[K.key])) if (item.price > 0) pool.push({ k: K.key, id, item, r: rarityOf(item) });
  return pool;
}
// Pick a tier by the printed odds, then anything in it.
function drawCapsule() {
  const pool = capsulePool(), tiers = RARITIES.filter(r => pool.some(p => p.r === r));
  if (!tiers.length) return null;
  let n = Math.random() * tiers.reduce((sum, r) => sum + CAPSULE_ODDS[r], 0), tier = tiers[tiers.length - 1];
  for (const r of tiers) { n -= CAPSULE_ODDS[r]; if (n < 0) { tier = r; break; } }
  return pick(pool.filter(p => p.r === tier));
}
let spinning = false, prize = null;
// Coins a duplicate has paid that the taskbar counter is not showing yet.
let capsuleHeld = 0;
function renderCapsule() {
  const b = $('spin'); if (!b) return;
  b.disabled = spinning;
  b.textContent = prize ? 'Open your capsule!' : spinning ? '...' : `Spin · ${CAPSULE_COST} coins`;
  b.classList.toggle('ready', !b.disabled && (!!prize || state.coins >= CAPSULE_COST));
  $('capsuleDupe').textContent = `A duplicate pays ${RARITIES.map(r => CAPSULE_DUPE[r]).join(', ').replace(/, (\d+)$/, ' or $1')} coins, by how rare it is.`;
}
function spin() {
  if (spinning) return;
  if (prize) { openPrize(); return; }
  if (state.coins < CAPSULE_COST) { SFX.play('deny'); toast(`A capsule costs ${CAPSULE_COST} coins. ${CAPSULE_COST - state.coins} to go: play with the pet to earn more.`); return; }
  const won = drawCapsule(); if (!won) return;
  // Paid for and recorded up front, so a reload mid-spin can't eat the coins. A duplicate's coins go in now too;
  // the counter in the taskbar keeps them back until the capsule has been opened, so it doesn't give it away.
  state.coins -= CAPSULE_COST;
  if (state.won.includes(wonKey(won.k, won.id))) { won.coins = CAPSULE_DUPE[won.r]; state.coins += won.coins; capsuleHeld = won.coins; }
  else state.won.push(wonKey(won.k, won.id));
  save();
  spinning = true; showCoins(true);
  $('machine').classList.add('spinning'); $('knob').classList.add('turn');
  SFX.play('crank'); setTimeout(() => SFX.play('rattle'), 380);
  setTimeout(() => {
    spinning = false; prize = won;
    $('machine').classList.remove('spinning'); $('knob').classList.remove('turn');
    $('prize').style.setProperty('--c', RARITY_COLOR[won.r]); $('prize').hidden = false;
    SFX.play('drop'); renderCapsule();
  }, 1050);
}
function openPrize() {
  if (!prize) return;
  const won = prize; prize = null; $('prize').hidden = true;
  SFX.play('pop'); showReveal(won.k, won.id, won.coins); renderCapsule();
}
$('spin').addEventListener('click', spin);
$('knob').addEventListener('click', spin);
$('prize').addEventListener('click', openPrize);
for (let i = 0; i < 14; i++) {
  const b = el('div', 'ball');
  b.style.left = 10 + Math.random() * 180 + 'px'; b.style.top = 60 + Math.random() * 110 + 'px';
  b.style.setProperty('--c', pick(['#ff7a90', '#ffb25b', '#7fd6b0', '#5aa9ff', '#b47bff', '#ffcf3f']));
  b.style.setProperty('--rot', Math.round(Math.random() * 360) + 'deg'); b.style.setProperty('--i', i);
  $('balls').appendChild(b);
}
// The four things you can't buy or win, each on a cat.
for (const [k, id] of [['skin', 'gold'], ['hat', 'nightcap'], ['face', 'bandage'], ['buddy', 'heart']]) {
  const item = KINDS[k][id], li = el('li'), text = el('div');
  text.append(el('b', null, item.name), el('span', null, item.unlock));
  li.append(thumb(k, id, { char: 'cat', skin: 'classic', [k]: id }), text);
  $('earned').appendChild(li);
}

/* ---------- reveal: the big moment for a new item ---------- */
let revealed = null;
// dupe: the coins the capsule paid because this one was won already. It is shown as what it was and what it
// turned into; there is nothing new to wear.
function showReveal(k, id, dupe) {
  const item = KINDS[k][id], r = rarityOf(item), box = $('reveal').firstElementChild;
  revealed = { k, id };
  box.className = 'reveal-box r-' + r + (dupe ? ' dupe' : '');
  $('revealRarity').textContent = dupe ? 'duplicate' : r;
  $('revealName').textContent = item.name;
  $('revealKind').textContent = dupe ? `You have this one already, so it turned into ${dupe} coins.` : 'New ' + KIND_LIST.find(K => K.key === k).one;
  $('revealWear').hidden = !!dupe;
  $('revealOk').textContent = dupe ? `+${dupe} coins` : 'Nice!';
  const art = $('revealArt'), x = art.getContext('2d'); art.width = SPR_W; art.height = SPR_H;
  x.drawImage(thumb(k, id, { ...state.look, [k]: id }), 0, 0);
  $('reveal').hidden = false;
  if (dupe) { $('revealOk').focus(); SFX.play('coins'); Pet.sparks(innerWidth / 2, innerHeight / 2 - 40, 18, ['#ffd34d', '#fffdf7'], 240); return; }
  $('revealWear').focus();
  const big = r === 'epic' || r === 'legendary';
  SFX.play(big ? 'fanfare' : 'buy');
  Pet.sparks(innerWidth / 2, innerHeight / 2 - 40, big ? 50 : 26, [RARITY_COLOR[r], '#fffdf7', '#ffd34d'], big ? 420 : 300);
  if (big) Pet.confetti(r === 'legendary' ? 160 : 90);
}
function closeReveal() {
  $('reveal').hidden = true; revealed = null;
  if (capsuleHeld) { capsuleHeld = 0; showCoins(true); }   // the taskbar is back in view: now the duplicate's coins land
  renderWardrobe(false); $('spin').focus({ preventScroll: true });
}
$('revealOk').addEventListener('click', closeReveal);
$('revealWear').addEventListener('click', () => { const r = revealed; closeReveal(); if (r) { kind = KIND_LIST.find(K => K.key === r.k); wear(r.k, r.id); renderWardrobe(false); } });
$('reveal').addEventListener('click', (e) => { if (e.target === $('reveal')) closeReveal(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('reveal').hidden) closeReveal(); });

/* ---------- getting it ---------- */
if (CONFIG.windowsUrl) {
  $('download').href = CONFIG.windowsUrl; $('downloadLabel').textContent = 'Download for Windows';
  const shipped = el('span', null, document.querySelector('[data-version]').textContent); shipped.dataset.version = '';
  $('downloadNote').replaceChildren('Free. Windows 10 and 11. The latest is ', shipped, '.');
  // The installer isn't code-signed yet, so say what the blue SmartScreen box is before it surprises anyone.
  $('downloadNote').append(el('br'), el('span', 'fine', 'Windows may stop the installer the first time: press "More info", then "Run anyway".'));
  for (const a of document.querySelectorAll('a[href="#get"]')) if (a !== $('download') && a.classList.contains('big')) a.href = CONFIG.windowsUrl;
} else {
  $('download').classList.add('waiting');
  $('download').addEventListener('click', (e) => {
    e.preventDefault(); SFX.play('deny');
    if (!Pet.cmd('say', { text: 'not yet! soon.', sec: 2.4 })) toast('Not yet. Soon.');
  });
  if (CONFIG.notifyUrl) {
    const a = el('a', 'btn huge ghost', 'Tell me when it ships'); a.href = CONFIG.notifyUrl; a.dataset.snd = 'click';
    $('download').after(a);
  }
}

/* ---------- which version is out ---------- */
// Every release is tagged v<version> on GitHub, so the page asks there and never needs editing for a release.
// The number written into the HTML is only what shows until the answer arrives, or if it never does.
(async () => {
  const KEY = 'roamies-latest';
  const show = (v) => { for (const n of document.querySelectorAll('[data-version]')) n.textContent = v; };
  try {
    const kept = JSON.parse(localStorage.getItem(KEY));
    if (kept && kept.v) { show(kept.v); if (Date.now() - kept.at < 10 * 60 * 1000) return; }   // asked within the last ten minutes
  } catch (err) { /* nothing kept */ }
  try {
    const r = await fetch(`https://api.github.com/repos/${CONFIG.releases}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) return;
    const tag = String((await r.json()).tag_name || '');
    if (!/^v\d+(\.\d+){1,3}$/.test(tag)) return;
    show(tag);
    try { localStorage.setItem(KEY, JSON.stringify({ v: tag, at: Date.now() })); } catch (err) { /* private window */ }
  } catch (err) { /* offline, or GitHub is busy: the written-in number stays */ }
})();

$('resetSite').addEventListener('click', () => { try { localStorage.removeItem(STORE); } catch (err) { /* nothing to clear */ } location.reload(); });

/* ---------- the pet ---------- */
Pet.on('earn', earn);
Pet.on('stat', (name) => {
  if (name === 'pets') quest('pat');
  else if (name === 'purrs') quest('purr');
  else if (name === 'throws') quest('throw');
});
Pet.on('open-ui', () => $('wardrobe').scrollIntoView({ behavior: calm ? 'auto' : 'smooth' }));   // right-click opens the app window; here, the wardrobe
Pet.start({ floor: $('taskbar'), name: state.name, look: state.look, x: .66 });

// It has something to say the first time you reach each part of the page.
const REMARKS = { roam: 'ooh, ledges', play: 'snack? snack.', friends: 'can Dani come over?', wardrobe: 'hats!!', capsules: 'spin it spin it', get: 'take me home?' };
const seen = new Set();
const remarks = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting || seen.has(e.target.id) || !REMARKS[e.target.id]) continue;
    seen.add(e.target.id);
    if (!Pet.busy) Pet.cmd('say', { text: REMARKS[e.target.id], sec: 2.2 });
  }
}, { rootMargin: '-45% 0px -45% 0px' });
scenes.forEach(s => remarks.observe(s));
setTimeout(() => { if (!state.quests.length && scrollY < 200 && !Pet.busy) Pet.cmd('say', { text: 'psst. click me', sec: 3 }); }, 7000);

// Small things that move.
const monPet = $('monPet');
let t0 = performance.now(), lastSmall = 0;
function small(now) {
  const t = (now - t0) / 1000;
  hopT += 1 / 60;
  drawPreview(t);
  if (now - lastSmall > 110) { lastSmall = now; paintWhole(monPet, state.look, Math.floor(t * 9) % 2 ? 'walkA' : 'walkB'); }
  requestAnimationFrame(small);
}
showQuests(false); showCoins(false); showLook(); applySound(); renderWardrobe(true); renderCapsule();
requestAnimationFrame(small);
})();
