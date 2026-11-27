// The status page's log keeper. No dependencies; needs Node 22 or newer (for WebSocket).
//
//   node tools/status-check.mjs <log.json>    look once, and add the result to that file (made if it isn't there)
//   node tools/status-check.mjs --dry         look once and print the result, writing nothing
//   node tools/status-check.mjs --sample      write tools/sample-log.json, a made-up month, for looking at
//                                             status.html on localhost before anything is published
//
// .github/workflows/status.yml runs the first form every half hour and keeps the file on the status-log branch,
// where status.html reads it. A line of the log is
//   [seconds since 1970, friend server (1 or 0), milliseconds it took, downloads (1 or 0), website (1 or 0)]
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const RELAY = 'wss://roamies.roamiesapp.workers.dev/';
const RELAY_HTTP = 'https://roamies.roamiesapp.workers.dev/';
const HEALTH = RELAY_HTTP + 'health';   // the friend server's own check: its database and its relay both answering
const RELEASES = 'https://api.github.com/repos/userlaws/roamies/releases/latest';
const INSTALLER = 'Roamies-Setup.exe';
const SITE = 'https://userlaws.github.io/roamies/';
const EVERY = 30;        // minutes between looks, as the workflow's timer has it
const KEEP_DAYS = 90;    // older lines are dropped
const TRIES = 3;         // a look fails only if it fails this many times in a row, a few seconds apart

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const within = (ms) => AbortSignal.timeout(ms);

// The friend server is up when its own check says so and it accepts a connection, as the app needs it to.
// Its check is GET /health: 200 "roamies ok: database and relay answering", or 503 naming what isn't. This is the
// same address and keyword the Uptime Kuma monitor uses. A server from before that check answers 404 there, and
// is asked for the plain line at "/" instead, which only shows the Worker is running.
async function relayOnce() {
  const t0 = Date.now();
  let r = await fetch(HEALTH, { signal: within(12000), cache: 'no-store' }), body = await r.text();
  if (r.status === 404) { r = await fetch(RELAY_HTTP, { signal: within(10000), cache: 'no-store' }); body = await r.text(); }
  if (!r.ok || !/roamies (relay )?ok/.test(body)) throw new Error(`health: ${r.status} ${body.trim().slice(0, 80)}`);
  await new Promise((done, fail) => {
    const ws = new WebSocket(RELAY);
    const timer = setTimeout(() => { try { ws.close(); } catch { /* not open */ } fail(new Error('no connection in 10 s')); }, 10000);
    ws.onopen = () => { clearTimeout(timer); ws.close(1000); done(); };
    ws.onerror = () => { clearTimeout(timer); fail(new Error('connection refused')); };
  });
  return Date.now() - t0;
}
// The downloads are up when the newest release has the installer attached and the link to it answers.
async function downloadsOnce() {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'roamies-status' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
  const r = await fetch(RELEASES, { headers, signal: within(15000) });
  if (!r.ok) throw new Error('releases: ' + r.status);
  const asset = ((await r.json()).assets || []).find((a) => a.name === INSTALLER);
  if (!asset) throw new Error('no installer on the newest release');
  const head = await fetch(asset.browser_download_url, { method: 'HEAD', redirect: 'follow', signal: within(20000) });
  if (!head.ok) throw new Error('installer link: ' + head.status);
}
async function siteOnce() {
  const r = await fetch(SITE, { signal: within(15000), cache: 'no-store' });
  if (!r.ok) throw new Error('site: ' + r.status);
}
async function sure(name, once) {
  let why = '';
  for (let i = 0; i < TRIES; i++) {
    try { return { ok: true, value: await once() }; } catch (err) { why = err.message; if (i < TRIES - 1) await sleep(5000); }
  }
  console.error(`[status] ${name} failed: ${why}`);
  return { ok: false };
}

async function look() {
  const [relay, downloads, site] = await Promise.all([sure('friend server', relayOnce), sure('downloads', downloadsOnce), sure('website', siteOnce)]);
  return [Math.floor(Date.now() / 1000), relay.ok ? 1 : 0, relay.ok ? relay.value : 0, downloads.ok ? 1 : 0, site.ok ? 1 : 0];
}

async function sample() {
  const now = Math.floor(Date.now() / 1000), checks = [];
  let seed = 7; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let t = now - 22 * 86400; t <= now; t += EVERY * 60) {
    const day = Math.floor((now - t) / 86400);
    const relay = day === 9 ? rand() > .7 : day === 4 ? rand() > .08 : true;
    checks.push([t, relay ? 1 : 0, relay ? 60 + Math.floor(rand() * 90) : 0, day === 15 && rand() > .9 ? 0 : 1, 1]);
  }
  const file = fileURLToPath(new URL('./sample-log.json', import.meta.url));
  await writeFile(file, JSON.stringify({ v: 1, since: new Date(checks[0][0] * 1000).toISOString(), every: EVERY, checks }));
  console.log(`[status] wrote ${checks.length} made-up checks to ${file}`);
}

const arg = process.argv[2];
if (!arg) { console.error('usage: node tools/status-check.mjs <log.json> | --dry | --sample'); process.exit(2); }
else if (arg === '--sample') await sample();
else {
  const line = await look();
  console.log('[status]', JSON.stringify(line));
  if (arg !== '--dry') {
    let log;
    try { log = JSON.parse(await readFile(arg, 'utf8')); } catch { log = null; }
    if (!log || !Array.isArray(log.checks)) log = { v: 1, since: new Date(line[0] * 1000).toISOString(), every: EVERY, checks: [] };
    log.every = EVERY;
    log.checks.push(line);
    const oldest = line[0] - KEEP_DAYS * 86400;
    log.checks = log.checks.filter((c) => c[0] >= oldest);
    await writeFile(arg, JSON.stringify(log));
  }
  process.exit(0);   // a failed look is a line in the log, not a failed run
}
