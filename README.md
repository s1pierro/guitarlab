# GuitarLab

A guitar-oriented tool to explore music theory. Interactive 3D guitar neck rendered with Three.js, chord recognition, and audio playback — packaged as an installable PWA.

**Live app:** https://s1pierro.github.io/guitarlab/

## Features

- Interactive 3D guitar neck (Three.js + OBJ model)
- Real-time chord recognition from fretted notes
- Chord library with fingering suggestions
- Interval visualization on the neck
- Audio synthesis via Tone.js (sampled strings)
- Installable as a PWA (works offline)

## Architecture

| File | Role |
|---|---|
| `gao.js` | Main application — all classes |
| `music-theory.js` | Music data: notes, intervals, chord types, `Chord` class |
| `index.html` | Bootstrap, sequential script loading |
| `service-worker.js` | PWA cache |

**Key classes in `gao.js`:**

- `Application` — entry point, wires everything together
- `GuitarModel` — single source of truth for fret state (`holds[]`)
- `GroundRender` — Three.js scene, renderer, animation loop
- `Cameraman` — camera, OrbitControls, mouse/touch events
- `ComputedGuitar` / `ComputedString` — fret click handling, audio trigger
- `ChordGuesser` — identifies chord from current fret state
- `ChordPinBoard` — chord library UI

## Running locally

Serve the root directory with any static HTTP server (direct `file://` access won't work due to service worker and module loading):

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## No build step

Vanilla JS, no npm, no bundler. Edit files and refresh.
