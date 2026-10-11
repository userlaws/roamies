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
| `js/site.js` | Sky, clock, windows, and the Play, Friends, Wardrobe and Capsules demos. `CONFIG` at the top holds the download link |
| `js/pet-web.js` | The pet: physics, behavior, input. The viewport is its desktop and any element marked `data-perch` is a window it can stand on |
| `js/sprites.js` | All pixel art, as rows of letters (one letter per pixel), and the item catalog |
| `js/sfx.js` | Every sound, synthesized with Web Audio. There are no audio files |

`sprites.js` and `sfx.js` are the desktop app's own files, copied over unchanged.

The page keeps a visitor's coins and outfit in `localStorage`. Nothing is sent anywhere.
