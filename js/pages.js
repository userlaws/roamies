// The side pages (info, what's new, status, and the one for a wrong address): the small things they share. Icons and pets drawn from the
// app's own sprite sheet, and the newest version's number wherever a page shows it.
const Pages = (() => {
'use strict';

const RELEASES = 'userlaws/roamies';   // the GitHub repo whose releases are the app's versions

// The sprite sheet holds a few characters the app keeps back. The same rule as js/site.js: change both together.
for (const id of Object.keys(CHARS)) if (CHARS[id].season === 'SAO' || id === 'kurama') delete CHARS[id];

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

/* ---------- pixel icons, as on the front page ---------- */
const ICONS = {
  paw: [".o....o.", ".o.oo.o.", "...oo...", "........", "..oooo..", ".oooooo.", ".oooooo.", "..o..o.."],
  down: ["...oo...", "...oo...", "...oo...", "oooooooo", ".oooooo.", "..oooo..", "...oo...", "oooooooo"],
  doc: [".ooooo..", ".oxxxoo.", ".oxxxxo.", ".oxooxo.", ".oxxxxo.", ".oxooxo.", ".oxxxxo.", ".oooooo."],
  win: ["oooooooo", "oooooooo", "oxxxxxxo", "oxxxxxxo", "oxxxxxxo", "oxxxxxxo", "oooooooo", "........"],
  heart: [".oo..oo.", "oooooooo", "oooooooo", "oooooooo", ".oooooo.", "..oooo..", "...oo...", "........"],
  star: ["...oo...", "...oo...", "oooooooo", ".oooooo.", "..oooo..", ".oooooo.", ".oo..oo.", "........"],
  chat: [".oooooo.", "oxxxxxxo", "oxoxoxxo", "oxxxxxxo", ".oooooo.", "..oo....", ".o......", "........"],
  gear: ["..o..o..", ".oooooo.", "ooo..ooo", ".o....o.", ".o....o.", "ooo..ooo", ".oooooo.", "..o..o.."],
  clock: ["..oooo..", ".oxxoxo.", "oxxxoxxo", "oxxxoxxo", "oxxxooxo", "oxxxxxxo", ".oxxxxo.", "..oooo.."],
  monitor: ["oooooooo", "oxxxxxxo", "oxxxxxxo", "oxxxxxxo", "oooooooo", "...oo...", "..oooo..", "........"],
  info: ["..oooo..", ".oo..oo.", "oooooooo", "ooo..ooo", "ooo..ooo", "ooo..ooo", ".oooooo.", "..oooo.."],
  box: ["oooooooo", "oxxooxxo", "oxxooxxo", "oooooooo", "oxxooxxo", "oxxooxxo", "oooooooo", "........"],
  pulse: ["........", "...o....", "...o....", "..o.o...", "oo..o.oo", "....o...", "....o...", "........"],
  lock: ["..oooo..", ".o....o.", ".o....o.", "oooooooo", "ooo..ooo", "ooo..ooo", "oooooooo", "........"],
};
function paintIcon(c) {
  const rows = ICONS[c.dataset.ico]; if (!rows) return;
  c.width = 8; c.height = 8;
  const x = c.getContext('2d'); x.fillStyle = getComputedStyle(c).color;
  rows.forEach((row, r) => [...row].forEach((k, i) => { if (k === '.') return; x.globalAlpha = k === 'o' ? 1 : .4; x.fillRect(i, r, 1, 1); }));
}

/* ---------- pets ---------- */
// <canvas data-pet="cat" data-skin="classic" data-hat="" data-face="glasses" data-pose="sit">: a whole pet, standing still.
const lookOf = (c) => ({ char: c.dataset.pet || 'cat', skin: c.dataset.skin || 'classic', hat: c.dataset.hat || '', face: c.dataset.face || '' });
function paintPet(c, pose) {
  const img = sprite(lookOf(c), pose || c.dataset.pose || 'base');
  c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0);
}
// A pet's head, cropped from its sprite, for the taskbar's start button.
function paintFace(c) {
  c.width = 16; c.height = 14;
  const x = c.getContext('2d'); x.clearRect(0, 0, 16, 14);
  x.drawImage(sprite({ char: 'cat', skin: 'classic', hat: '', face: '' }, 'base'), 0, 6, 16, 14, 0, 0, 16, 14);
}
// They blink now and then, unless they are asleep or making a face.
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
function blink() {
  for (const c of document.querySelectorAll('canvas[data-pet]')) {
    const pose = c.dataset.pose || 'base';
    if (pose !== 'base' && pose !== 'sit') continue;
    paintPet(c, 'blink');
    setTimeout(() => paintPet(c), 170);
  }
}

/* ---------- the newest version ---------- */
// Every release is tagged v<version> on GitHub. The number written into the page is what shows until the answer
// arrives, or if it never does. The front page keeps its answer under the same name, so one asking serves both.
async function latest() {
  const KEY = 'roamies-latest';
  const show = (v) => { for (const n of document.querySelectorAll('[data-version]')) n.textContent = v; };
  try {
    const kept = JSON.parse(localStorage.getItem(KEY));
    if (kept && kept.v) { show(kept.v); if (Date.now() - kept.at < 10 * 60 * 1000) return; }
  } catch (err) { /* nothing kept */ }
  try {
    const r = await fetch(`https://api.github.com/repos/${RELEASES}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) return;
    const tag = String((await r.json()).tag_name || '');
    if (!/^v\d+(\.\d+){1,3}$/.test(tag)) return;
    show(tag);
    try { localStorage.setItem(KEY, JSON.stringify({ v: tag, at: Date.now() })); } catch (err) { /* private window */ }
  } catch (err) { /* offline, or GitHub is busy: the written-in number stays */ }
}

/* ---------- the pet's things ---------- */
// A buddy, from the sheet: <canvas data-buddy="bee">. Shown at the pets' own scale, three screen pixels to one.
function paintBuddy(c) {
  const b = BUDDIES[c.dataset.buddy]; if (!b) return;
  const w = Math.max(...b.rows.map((r) => r.length)), h = b.rows.length;
  c.width = w; c.height = h; c.style.width = w * 3 + 'px';
  const x = c.getContext('2d');
  b.rows.forEach((row, r) => [...row].forEach((k, i) => { if (k === '.' || !b.pal[k]) return; x.fillStyle = b.pal[k]; x.fillRect(i, r, 1, 1); }));
}
// How a version arrives: a crate on a parachute. <canvas data-art="drop">, 20 by 24.
function paintDrop(c) {
  const INK = '#2a2530', ROPE = '#b8b0c4', PINK = '#ff7a90', CREAM = '#fffdf7', WOOD = '#d99a4e', DARK = '#b0752f';
  c.width = 20; c.height = 24;
  const x = c.getContext('2d'), dot = (i, r, k) => { x.fillStyle = k; x.fillRect(i, r, 1, 1); };
  const half = [4, 7, 9, 10, 10, 10, 10];   // the canopy, row by row, as half its width
  half.forEach((n, r) => {
    for (let i = 10 - n; i < 10 + n; i++) {
      const rim = i === 10 - n || i === 10 + n - 1 || r === 0 || (r === 6 && i % 4 === 1);
      dot(i, r, rim ? INK : Math.floor((i + 2) / 4) % 2 ? PINK : CREAM);
    }
  });
  for (let r = 7; r < 14; r++) { dot(r - 7, r, ROPE); dot(19 - (r - 7), r, ROPE); if (r % 2) { dot(Math.round(6 + (r - 7) * .3), r, ROPE); dot(Math.round(13 - (r - 7) * .3), r, ROPE); } }
  for (let r = 14; r < 24; r++) for (let i = 5; i < 15; i++) {
    const rim = r === 14 || r === 23 || i === 5 || i === 14;
    dot(i, r, rim ? INK : (r === 18 || r === 19 || i === 7 || i === 12) ? DARK : WOOD);
  }
}

document.querySelectorAll('canvas[data-ico]').forEach(paintIcon);
document.querySelectorAll('canvas[data-buddy]').forEach(paintBuddy);
document.querySelectorAll('canvas[data-art="drop"]').forEach(paintDrop);
document.querySelectorAll('canvas[data-pet]').forEach((c) => paintPet(c));
const face = document.getElementById('brandFace'); if (face) paintFace(face);
if (!calm) setInterval(blink, 3400);
if (document.querySelector('[data-version]') && !document.body.dataset.noLatest) latest();

// How many of each thing there is to wear, counted from the sheet.
const counts = () => ({ characters: Object.keys(CHARS).length, colors: Object.keys(SKINS).length, hats: Object.keys(HATS).length, faces: Object.keys(FACES).length, buddies: Object.keys(BUDDIES).length });

return { el, paintIcon, paintPet, counts, RELEASES };
})();
