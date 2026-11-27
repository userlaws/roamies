// The status page. Three things are looked at from the visitor's own browser, each time the page is opened:
// the friend server (a connection is opened and closed again), the downloads (GitHub is asked for the newest
// release and its installer), and this website (it loaded). The thirty days of history are not measured here:
// tools/status-check.mjs keeps that log (it asks the server's own /health, which a browser on another site can't
// read, and which wakes the database, so it is not something for every visitor to ask), run on a timer by .github/workflows/status.yml.
// What we have to say ourselves (a notice, known problems, past incidents) is status.json, edited by hand.
(() => {
'use strict';

const RELAY = 'wss://roamies.roamiesapp.workers.dev/';
const INSTALLER = 'Roamies-Setup.exe';
const LOG = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
  ? 'tools/sample-log.json'   // made by `node tools/status-check.mjs --sample`, for looking at the page before it is published
  : `https://raw.githubusercontent.com/${Pages.RELEASES}/status-log/log.json`;
const DAYS = 30, DAY = 86400;

const $ = (id) => document.getElementById(id);
const { el } = Pages;
const ago = (sec) => sec < 90 ? 'a minute ago' : sec < 3600 ? `${Math.round(sec / 60)} minutes ago` : sec < 5400 ? 'an hour ago' : sec < 86400 ? `${Math.round(sec / 3600)} hours ago` : `${Math.round(sec / 86400)} days ago`;
const dayText = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/* ---------- looking ---------- */
// The friend server: open a connection the way the app does, and close it at once. Nothing is said over it.
function askRelay() {
  return new Promise((done) => {
    const t0 = performance.now(); let over = false, ws;
    const end = (ok) => { if (over) return; over = true; clearTimeout(timer); try { ws.close(1000); } catch (err) { /* never opened */ } done({ ok, ms: Math.round(performance.now() - t0) }); };
    const timer = setTimeout(() => end(false), 9000);
    try { ws = new WebSocket(RELAY); } catch (err) { end(false); return; }
    ws.onopen = () => end(true);
    ws.onerror = () => end(false);
    ws.onclose = () => end(false);
  });
}
// The downloads: the newest release, and whether the installer is attached to it. null when GitHub would not say
// (it limits how often one address may ask), which is not the same as the download being gone.
async function askDownloads() {
  try {
    const r = await fetch(`https://api.github.com/repos/${Pages.RELEASES}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
    if (r.status === 403 || r.status === 429) return null;
    if (!r.ok) return { ok: false };
    const rel = await r.json();
    const tag = /^v\d+(\.\d+){1,3}$/.test(String(rel.tag_name)) ? rel.tag_name : '';
    return { ok: !!tag && (rel.assets || []).some((a) => a.name === INSTALLER), tag, at: Date.parse(rel.published_at) || 0 };
  } catch (err) { return null; }
}
async function getJson(url) {
  try { const r = await fetch(url, { cache: 'no-cache' }); return r.ok ? await r.json() : null; } catch (err) { return null; }
}

/* ---------- the log: thirty days, a bar a day ---------- */
// log.checks is a list of [seconds, friend server (1 or 0), milliseconds, downloads (1 or 0), website (1 or 0)].
function drawDays(log) {
  const today = Math.floor(Date.now() / 1000 / DAY), first = today - DAYS + 1;
  const rows = [{ box: $('daysRelay'), pct: $('pctRelay'), col: 1 }, { box: $('daysGet'), pct: $('pctGet'), col: 3 }];
  const checks = log && Array.isArray(log.checks) ? log.checks.filter((c) => Array.isArray(c) && Math.floor(c[0] / DAY) >= first) : [];
  for (const row of rows) {
    const days = Array.from({ length: DAYS }, () => ({ n: 0, bad: 0 }));
    for (const c of checks) { const d = days[Math.floor(c[0] / DAY) - first]; if (!d) continue; d.n++; if (!c[row.col]) d.bad++; }
    row.box.textContent = '';
    let n = 0, bad = 0;
    days.forEach((d, i) => {
      n += d.n; bad += d.bad;
      const bar = el('i', !d.n ? '' : !d.bad ? 'ok' : d.bad * 2 < d.n ? 'some' : 'bad');
      const date = dayText(new Date((first + i) * DAY * 1000));
      bar.title = !d.n ? `${date}: no checks` : !d.bad ? `${date}: all ${d.n} checks passed` : `${date}: ${d.bad} of ${d.n} checks failed`;
      row.box.append(bar);
    });
    row.pct.textContent = n ? `${(Math.floor((n - bad) / n * 10000) / 100).toFixed(n - bad === n ? 0 : 2)}% of ${n} checks` : 'no checks yet';
  }
  const last = checks.length ? checks[checks.length - 1] : null;
  $('logNote').textContent = !log ? 'The log starts with the first check. Until then, the lamps above are the whole story.'
    : `A script looks every ${log.every || 30} minutes, from outside our own server, and has since ${dayText(new Date(log.since || checks[0] && checks[0][0] * 1000 || Date.now()))}.` + (last ? ` It last looked ${ago(Date.now() / 1000 - last[0])}.` : '');
  return last;
}

/* ---------- what we have to say ---------- */
function drawNotes(notes) {
  const fill = (list, items, empty, whenKey) => {
    list.textContent = '';
    if (!items || !items.length) { list.append(el('li', 'empty', empty)); return; }
    for (const it of items) {
      const li = el('li');
      if (it[whenKey]) li.append(el('span', 'when', it[whenKey]));
      li.append(el('b', null, it.title || ''), el('p', null, it.body || ''));
      list.append(li);
    }
  };
  fill($('known'), notes && notes.known, 'Nothing we know of.', 'since');
  fill($('incidents'), notes && notes.incidents, 'None so far.', 'when');
  const n = notes && notes.notice, box = $('notice');
  box.hidden = !(n && n.title);
  if (box.hidden) return null;
  box.className = 'notice' + (n.level === 'down' ? ' down' : '');
  box.textContent = '';
  const body = el('div');
  body.append(el('b', null, n.title));
  if (n.body) body.append(el('p', null, n.body));
  if (n.at) body.append(el('small', null, n.at));
  box.append(el('i', 'lamp ' + (n.level === 'down' ? 'bad' : 'some')), body);
  return n;
}

/* ---------- the page says how things are ---------- */
function row(id, state, value, sub) {
  const li = $(id); li.className = state;
  li.querySelector('.lamp').className = 'lamp ' + state;
  li.querySelector('em').textContent = value;
  if (sub != null) li.querySelector('small').textContent = sub;
}
const RELAY_SUB = 'Friends and who is online, visits, hangouts, other players in the town, Discord sign-in, top scores, feedback.';
function mood(state, title, lede, says) {
  $('headline').textContent = title; $('lede').textContent = lede;
  const pet = $('pet'), stage = $('stage');
  stage.className = 'stage ' + (state === 'bad' ? 'storm' : 'fair');
  pet.dataset.hat = state === 'bad' ? 'storm' : ''; pet.dataset.pose = state === 'bad' ? 'grumpy' : state === 'ok' ? 'happy' : 'base';
  Pages.paintPet(pet);
  $('says').textContent = says;
  $('tabLamp').className = 'lamp ' + state;
  document.title = state === 'bad' ? 'Roamies status: trouble' : state === 'ok' ? 'Roamies status: all good' : 'Roamies status';
}

let lastRun = 0, busy = false, lastLogged = null, notice = null;
async function look() {
  if (busy) return; busy = true; lastRun = Date.now();
  $('again').disabled = true;
  row('rowRelay', 'wait', 'looking…', RELAY_SUB); row('rowGet', 'wait', 'looking…');
  mood('wait', 'Having a look…', 'Asking the friend server and the downloads how they are.', '');
  const [relay, get, log, notes] = await Promise.all([askRelay(), askDownloads(), getJson(LOG), getJson('status.json')]);
  lastLogged = drawDays(log); notice = drawNotes(notes);

  // When this browser can't get through, the log says whether it is the server or just the way from here.
  const fresh = lastLogged && Date.now() / 1000 - lastLogged[0] < 50 * 60;
  const onlyHere = !relay.ok && fresh && lastLogged[1] === 1;
  if (relay.ok) row('rowRelay', 'ok', `answering · ${relay.ms} ms`, RELAY_SUB);
  else if (onlyHere) row('rowRelay', 'some', 'no answer from here', `Our own check got through ${ago(Date.now() / 1000 - lastLogged[0])}, so this may be your connection, a VPN or a firewall.`);
  else row('rowRelay', 'bad', 'not answering', RELAY_SUB);

  if (!get) row('rowGet', 'off', "GitHub wouldn't say", 'GitHub limits how often one address may ask. Try again in a few minutes.');
  else if (get.ok) row('rowGet', 'ok', `${get.tag} ready`, `The installer and the app's own updates. Released ${get.at ? ago((Date.now() - get.at) / 1000) : 'recently'}.`);
  else row('rowGet', 'bad', 'not found', 'The newest release has no installer attached. The app in your tray is not affected.');

  const down = !relay.ok && !onlyHere, getDown = get && !get.ok;
  if (notice && notice.level === 'down') mood('bad', notice.title, notice.body || 'We are on it.', 'on it!');
  else if (down) mood('bad', "The friend server isn't answering.", 'Friends, visits and the town with other players wait until it is back. Your pet itself is fine: it lives on your computer.', 'uh oh');
  else if (getDown) mood('bad', 'Downloads are having trouble.', 'The newest installer is missing. The copy you already have keeps working.', 'hmm');
  else if (onlyHere) mood('some', "Can't reach the friend server from here.", 'Our own check got through a little while ago, so it is probably the way from your computer: a VPN, a firewall, or the network you are on.', 'hmm...');
  else mood('ok', 'All good.', `The friend server answered in ${relay.ms} ms` + (get ? `, and ${get.tag} is ready to download.` : '.'), 'all good!');

  $('checkedAt').textContent = 'Looked from your browser at ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '.';
  $('again').disabled = false; busy = false;
}
$('again').addEventListener('click', look);
// Coming back to the tab after a while is worth another look. An open tab left alone asks nothing.
document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - lastRun > 2 * 60 * 1000) look(); });
look();
})();
