// Roamies photo art: the photo booth's pictures and the postcards from visits, drawn on a canvas with the pets'
// own art (sprites.js). Shared by the app window (ui-photo.js) and the website's photo wall (website/photos.html,
// copied there by npm run site:sync), so a photo on the wall is drawn exactly as it was taken.
// A photo is kept anywhere as its recipe, never as a picture: { pets: [look, look?], backdrop, pose, line, title }.
const PHOTO_ART = (() => {
  'use strict';
  // A number from a string, for picking the same backdrop and stars for the same postcard every time it is drawn.
  const seedOf = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rnd = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  const BACKDROPS = [
    { id: 'sky', name: 'Sunny day' }, { id: 'sunset', name: 'Sunset' }, { id: 'night', name: 'Starry night' },
    { id: 'beach', name: 'Beach' }, { id: 'snow', name: 'Snow' }, { id: 'party', name: 'Party' },
  ];
  const POSES = [{ id: 'happy', name: 'Smile' }, { id: 'base', name: 'Stand' }, { id: 'sit', name: 'Sit' }, { id: 'sleep', name: 'Nap' }];
  // The lines a picture can carry: from a list, like everything else players can put their name to.
  const LINES = ['', 'Best friends!', 'Hi from my desktop', 'New look!', 'Happy birthday!', 'Miss you!', 'Living my best life', 'Just vibing', 'Come visit!'];
  const SITE = 'userlaws.github.io/roamies';

  /* ---------- drawing ---------- */
  // The backdrop, over the whole of x's canvas from y 0 to h, with the ground starting at gy.
  function backdrop(x, id, w, h, gy, seed) {
    const r = rnd(seed), sky = (a, b) => { const g = x.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, w, gy); };
    const block = (color, px, py, pw, ph) => { x.fillStyle = color; x.fillRect(Math.round(px), Math.round(py), Math.round(pw), Math.round(ph)); };
    const cloud = (cx, cy, s) => { block('#ffffff', cx - 3 * s, cy, 10 * s, 3 * s); block('#ffffff', cx - s, cy - 2 * s, 6 * s, 2 * s); block('#e6f3ff', cx - 3 * s, cy + 2 * s, 10 * s, s); };
    if (id === 'sky') {
      sky('#78c8ff', '#d8f1ff');
      for (let i = 0; i < 3; i++) cloud(r() * w, 30 + r() * (gy * .45), 6 + r() * 3);
      block('#78c85a', 0, gy, w, h - gy); block('#5fae46', 0, gy, w, 8);
      for (let i = 0; i < 40; i++) block('#8fd86a', r() * w, gy + 14 + r() * (h - gy - 20), 6, 6);
    } else if (id === 'sunset') {
      sky('#ff8a6b', '#ffd27a');
      x.fillStyle = '#fff1b0'; x.beginPath(); x.arc(w * .72, gy - 10, 58, Math.PI, 0); x.fill();
      for (let i = 0; i < 4; i++) block('#ffb78a', r() * w, 30 + r() * gy * .5, 60 + r() * 80, 8);
      block('#6a4c93', 0, gy, w, h - gy); block('#54397a', 0, gy, w, 8);
    } else if (id === 'night') {
      sky('#0e1230', '#2b2350');
      for (let i = 0; i < 70; i++) { x.globalAlpha = .4 + r() * .6; block('#ffffff', r() * w, r() * gy * .95, 3, 3); } x.globalAlpha = 1;
      x.fillStyle = '#fff3c4'; x.beginPath(); x.arc(w * .2, 70, 30, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#0e1230'; x.beginPath(); x.arc(w * .2 + 14, 62, 26, 0, Math.PI * 2); x.fill();
      block('#1d2a3a', 0, gy, w, h - gy); block('#273a50', 0, gy, w, 8);
    } else if (id === 'beach') {
      sky('#6fc3ff', '#c9ecff');
      cloud(w * .2, 50, 6); cloud(w * .75, 80, 5);
      const sea = gy - 46; block('#2f9be0', 0, sea, w, gy - sea); for (let i = 0; i < 14; i++) block('#9fdcff', r() * w, sea + 6 + r() * 34, 26, 4);
      block('#f4d58d', 0, gy, w, h - gy); block('#e8c070', 0, gy, w, 6);
      for (let i = 0; i < 30; i++) block('#e6c27a', r() * w, gy + 12 + r() * (h - gy - 16), 4, 4);
    } else if (id === 'snow') {
      sky('#a9c7e8', '#eef6ff');
      for (let i = 0; i < 60; i++) block('#ffffff', r() * w, r() * gy, 4, 4);
      block('#ffffff', 0, gy, w, h - gy); block('#dbe8f5', 0, gy, w, 6);
    } else {   // party
      sky('#3a2350', '#6a3b7a');
      const inks = ['#ffd34d', '#ff7a90', '#7fe7ff', '#a8ff8a', '#c39bff'];
      for (let i = 0; i < 80; i++) { x.save(); x.translate(r() * w, r() * gy); x.rotate(r() * Math.PI); block(inks[i % inks.length], -5, -2, 10, 4); x.restore(); }
      for (let i = 0; i < 7; i++) { const bx = 30 + i * (w - 60) / 6; block(inks[i % inks.length], bx - 8, 18, 16, 20); block('#ffffff55', bx - 4, 22, 4, 6); }
      block('#2a1a3a', 0, gy, w, h - gy); block('#3f2a52', 0, gy, w, 8);
    }
  }
  // One pet standing with its feet at (cx, gy), px to a sprite pixel, facing right when flip. Its shadow, aura,
  // tails, buddy and all, as it is drawn everywhere else (sprites.js).
  function pet(x, look, cx, gy, px, frame, flip, t) {
    look = { char: 'cat', skin: 'classic', hat: null, face: null, buddy: null, aura: null, ...look };
    x.save(); x.imageSmoothingEnabled = false;
    x.fillStyle = '#00000033'; x.beginPath(); x.ellipse(cx, gy, SPR_W * px * .42, px * 1.6, 0, 0, Math.PI * 2); x.fill();
    x.translate(cx, gy); if (flip) x.scale(-1, 1);
    drawAura(x, look, px, t, 'back'); drawTails(x, look, px, t);
    x.globalAlpha = (SKINS[look.skin] && SKINS[look.skin].alpha) || 1;
    x.drawImage(sprite(look, frame), -SPR_W * px / 2, -SPR_H * px, SPR_W * px, SPR_H * px);
    x.globalAlpha = 1;
    drawAura(x, look, px, t, 'front');
    if (look.buddy && BUDDIES[look.buddy]) drawBuddy(x, look.buddy, SPR_W * px * .62, -(BUDDIES[look.buddy].hover ? 11 : 0) * px, px * .5, false, look);
    x.restore();
  }
  // Text that fits in a width, made smaller until it does.
  function fit(x, text, maxW, size, weight, font) {
    let s = size; do { x.font = `${weight} ${s}px ${font}`; s -= 1; } while (x.measureText(text).width > maxW && s > 10);
  }
  const UI_FONT = '"Allo", "Segoe UI", system-ui, sans-serif';

  // A photo: a print with a white border, the scene in it, and the pet's name and the line under it.
  function photo({ pets, backdrop: bg, pose, line, title }) {
    const W = 720, H = 860, M = 36, SH = 640, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#fffdf7'; x.fillRect(0, 0, W, H);
    x.save(); x.beginPath(); x.rect(M, M, W - M * 2, SH); x.clip(); x.translate(M, M);
    const iw = W - M * 2, gy = SH - 150;
    backdrop(x, bg, iw, SH, gy, seedOf(bg + title));
    const two = pets.length > 1, px = two ? 13 : 17;
    if (two) { pet(x, pets[0], iw * .3, gy + 40, px, pose, true, 1.3); pet(x, pets[1], iw * .7, gy + 40, px, pose, false, 1.3); }
    else pet(x, pets[0], iw / 2, gy + 50, px, pose, false, 1.3);
    x.restore();
    x.fillStyle = '#2b2233'; x.textAlign = 'center';
    fit(x, title, W - 120, 46, 800, UI_FONT); x.fillText(title, W / 2, SH + M + 66);
    if (line) { x.fillStyle = '#6b5a72'; fit(x, line, W - 120, 28, 600, UI_FONT); x.fillText(line, W / 2, SH + M + 106); }
    x.fillStyle = '#b3a3b8'; x.font = `700 16px ${UI_FONT}`; x.fillText(`ROAMIES · ${SITE}`, W / 2, H - 24);
    return c;
  }

  // A postcard from a visit: the two pets side by side on the left, a stamp with the friend's pet on it, a postmark
  // with the day, and a few lines on the right, the way a postcard is written.
  function postcard(p) {
    const W = 900, H = 600, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'), seed = seedOf(p.id || p.at), bg = p.bday ? 'party' : BACKDROPS[seed % (BACKDROPS.length - 1)].id;
    x.fillStyle = '#fbf4e6'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#e3d6bd'; x.lineWidth = 2; x.strokeRect(14, 14, W - 28, H - 28);
    const PW = 470, PH = H - 60;
    x.save(); x.beginPath(); x.rect(30, 30, PW, PH); x.clip(); x.translate(30, 30);
    backdrop(x, bg, PW, PH, PH - 120, seed);
    pet(x, p.mine || {}, PW * .3, PH - 80, 11, 'happy', true, 1.3);
    pet(x, p.look || {}, PW * .7, PH - 80, 11, 'happy', false, 1.3);
    x.restore();
    // The line down the middle and the address lines.
    x.fillStyle = '#d8c9ac'; x.fillRect(540, 60, 2, H - 120);
    // The stamp: the friend's pet's face, with a perforated edge.
    const sx = W - 150, sy = 44, sw = 104, sh = 124;
    x.fillStyle = '#ffffff'; x.fillRect(sx - 6, sy - 6, sw + 12, sh + 12);
    x.fillStyle = '#fbf4e6'; for (let i = 0; i <= sw + 12; i += 10) { x.beginPath(); x.arc(sx - 6 + i, sy - 6, 3, 0, Math.PI * 2); x.arc(sx - 6 + i, sy + sh + 6, 3, 0, Math.PI * 2); x.fill(); }
    for (let i = 0; i <= sh + 12; i += 10) { x.beginPath(); x.arc(sx - 6, sy - 6 + i, 3, 0, Math.PI * 2); x.arc(sx + sw + 6, sy - 6 + i, 3, 0, Math.PI * 2); x.fill(); }
    x.save(); x.beginPath(); x.rect(sx, sy, sw, sh); x.clip();
    backdrop(x, BACKDROPS[(seed >>> 3) % (BACKDROPS.length - 1)].id, W, sy + sh, sy + sh - 18, seed + 7);
    pet(x, { ...(p.look || {}), aura: null, buddy: null }, sx + sw / 2, sy + sh + 30, 7, 'base', false, 0);
    x.restore();
    // The postmark over the stamp's corner.
    const day = new Date(p.at || Date.now());
    x.save(); x.translate(sx - 30, sy + sh - 10); x.rotate(-.25); x.strokeStyle = '#8a6a8a99'; x.lineWidth = 3;
    x.beginPath(); x.arc(0, 0, 40, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.arc(0, 0, 33, 0, Math.PI * 2); x.stroke();
    x.fillStyle = '#8a6a8acc'; x.textAlign = 'center'; x.font = `800 13px ${UI_FONT}`; x.fillText(day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase(), 0, -2);
    x.font = `700 11px ${UI_FONT}`; x.fillText(String(day.getFullYear()), 0, 14);
    for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(46, -16 + i * 10); for (let k = 0; k < 6; k++) x.quadraticCurveTo(52 + k * 14, -22 + i * 10, 59 + k * 14, -16 + i * 10); x.stroke(); }
    x.restore();
    // The writing.
    x.textAlign = 'left'; x.fillStyle = '#3b2a3f';
    const left = 570, maxW = W - left - 40;
    const where = p.bday ? `${p.name}'s birthday!` : `${p.name}'s desktop!`;
    fit(x, 'Greetings from', maxW, 30, 700, UI_FONT); x.fillText('Greetings from', left, 230);
    fit(x, where, maxW, 40, 800, UI_FONT); x.fillText(where, left, 276);
    x.fillStyle = '#6b5a72'; x.font = `600 20px ${UI_FONT}`;
    const said = p.gift && p.gift !== 'a postcard' ? `Brought home ${p.gift}.` : 'Had the best time.';
    wrap(x, said, left, 330, maxW, 28);
    x.fillStyle = '#d8c9ac'; for (let i = 0; i < 3; i++) x.fillRect(left, 420 + i * 44, maxW, 2);
    x.fillStyle = '#3b2a3f'; x.font = `700 22px ${UI_FONT}`; x.fillText(`To ${p.to || 'you'}`, left, 414);
    x.fillStyle = '#b3a3b8'; x.font = `700 14px ${UI_FONT}`; x.fillText(`ROAMIES · ${SITE}`, left, H - 40);
    return c;
  }
  function wrap(x, text, at, y, maxW, lh) {
    let line = '';
    for (const word of text.split(' ')) {
      const next = line ? line + ' ' + word : word;
      if (x.measureText(next).width > maxW && line) { x.fillText(line, at, y); y += lh; line = word; } else line = next;
    }
    if (line) x.fillText(line, at, y);
  }
  return { BACKDROPS, POSES, LINES, SITE, photo, postcard, pet, backdrop, seedOf };
})();
