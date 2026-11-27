# Roamies website

The site for [Roamies](https://userlaws.github.io/roamies/), a pixel pet that lives on top of your desktop.

The page is a desktop. The taskbar at the bottom is the nav, the content sits in windows you can drag by their title bars, the sky runs from morning to midnight as you scroll, and a Roamie walks the taskbar and climbs the windows. Poke it, throw it, feed it, dress it.

## Run it

```bash
node serve.mjs
```

Then open http://localhost:4173. There is no build step and nothing to install: it is plain HTML, CSS and JavaScript, and any static host will serve it.

## What's where

| File | Job |
|---|---|
| `index.html`, `css/site.css` | The page |
| `js/site.js` | Sky, clock, windows, the Play, Friends, Wardrobe and Capsules demos, and the Town picture viewer. `CONFIG` at the top holds the download link |
| `js/pet-web.js` | The pet: physics, behavior, input. The viewport is its desktop and any element marked `data-perch` is a window it can stand on |
| `js/sprites.js` | All pixel art, as rows of letters (one letter per pixel), and the item catalog |
| `js/sfx.js` | Every sound, synthesized with Web Audio. There are no audio files |
| `img/town/` | Seven pictures taken in the app's Town tab, 1280 by 746, for the Town window |

`sprites.js` and `sfx.js` are the desktop app's own files, copied over unchanged.

The page keeps a visitor's coins and outfit in `localStorage`. Nothing is sent anywhere.

## The side pages

`info.html`, `changelog.html`, `status.html` and `404.html` are the app's own window rather than the desktop: `css/pages.css` (which stands alone, without `site.css`), the Allo typeface in `fonts/` (its license sits next to it and has to stay there), and `js/pages.js` for the icons, the pets and the version number.

| Page | What it is | Kept up by |
|---|---|---|
| `info.html` | Roamies in short: what it is, what it does, how we do things, questions | Hand. The counts come from `js/sprites.js` |
| `changelog.html` | Every version in a few lines, newest first | Hand: after a release, add one `<li class="rel newest">` at the top and take `newest` off the one below |
| `status.html` | Whether the friend server and the downloads are up | Itself, plus `status.json` |
| `404.html` | Any wrong address. GitHub Pages serves it by that name, and so does `serve.mjs` | Nothing |

### The status page

It has three sources.

- **Right now** is looked at from the visitor's browser each time the page opens (`js/status.js`): a connection to the friend server is opened and closed, and GitHub is asked for the newest release.
- **The last 30 days** is a log kept by a script that asks the friend server's own check, `GET /health` (database and relay, the same one the Uptime Kuma monitor uses; a server without it is asked for the plain line at `/`), and opens a connection. It is `.github/workflows/status.yml`, which runs `tools/status-check.mjs` every half hour and keeps `log.json` on the `status-log` branch (one commit, replaced each time). The page reads it from there. Run the workflow once by hand from the Actions tab to start the log.
- **What we have to say** is `status.json`, edited by hand and pushed:

```json
{
  "notice": { "level": "down", "title": "The friend server is down", "body": "We are moving it. Back within the hour.", "at": "24 Nov, 5:10 PM" },
  "known": [ { "title": "…", "body": "…" } ],
  "incidents": [ { "when": "21 to 22 October 2026", "title": "…", "body": "…" } ]
}
```

`notice` is `null` when there is nothing to say. With `"level": "down"` it becomes the page's headline whatever the lamps show; any other level is a yellow note above them. When it is over, set it back to `null` and add a line to `incidents`.

`node tools/status-check.mjs --dry` looks once and prints the result. `node tools/status-check.mjs --sample` writes a made-up month that `status.html` shows on localhost only.
