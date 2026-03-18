# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GuitarLab2 is a client-side PWA for interactive guitar learning and music theory exploration. It requires no build process — the entire app is static HTML/CSS/JS served directly from this directory.

## Running the App

Serve this directory with any HTTP server and open `index.html`:

```bash
python3 -m http.server 8080
# or
npx serve .
```

Audio context (Tone.js) requires a user click/tap to initialize — this is browser-enforced, not a bug.

## Architecture

**Main files:**
- `gao.js` — all app logic (~3800 lines)
- `music-theory.js` — notes, intervals, chord types
- `css/style.css` — all styles
- `js/dom-utils.js` — helpers: `ic(name)` (SVG mask icon), `loadIcons()`, `createElement()`
- `icons/index.json` — icon registry (SVG filenames → camelCase keys for `ic()`)
- `guitar-bank.json` — list of available guitars + `selected` field
- `guitars/classique-6.json` — guitar definition (strings, 3D coords, tuning, partials)

**Core class hierarchy in `gao.js`:**
- `Application` — top-level orchestrator, wires all components together
- `ComputedGuitar` — 6-string guitar, composed of `ComputedString` instances (each with its own Tone.js sampler)
- `GroundRender` — Three.js 3D guitar visualization (OBJ/MTL from `guitars/`)
- `PluckPad` — floating draggable pad; mode `master` (minimize + clone) or `pad` (chord snapshot, close only)
- `ChordWizard` — analyzes active fret positions and scores against chord definitions
- `ChordPinBoard` — chord sets: save/apply named chord collections (used by PanelBibliotheque)
- `UXStack` / `UXPanel` — panel system with expand/collapse/reorder (↑ ↓ −) and FLIP animations
- `PartitionManager` — sequencer: chord track + 6×N picking grid

**UX panels:**
- `PanelMultipads` — ChordPad scene manager (save/load/delete named sets of cloned pads)
- `PanelBibliotheque` — chord library with named sets, apply chord to guitar
- `PanelCatalogue` — chord catalogue filtered by root + quality + voicing badges
- `PanelPartitions` — sequencer
- `PanelEcoute` — tuner (mic + pitch detection)
- `PanelReperes` — notation reference (interval icons via `ic()`)
- `ConfigOverlay` — settings: guitar selection + per-string tuning

**ChordPads:**
- Cloned from master PluckPad; capture a frozen chord snapshot (name + notes + intervals + synth refs)
- Not affected by `onStateChange`; persisted as normalized positions (rx/ry) in `chord-pads` storage key
- Spawned before `uxstack.mount()` so PanelMultipads shows correct count on first render

**Music theory data** (in `music-theory.js`):
- 96 notes (8 octaves × 12 semitones)
- 12 interval types (root, b2, 2, b3, 3, 4, b5, 5, m5, 6, b7, 7)
- 50+ chord types with interval definitions and symbols

**Dependencies — all local (no CDN):**
- `js/three.min.js` — 3D rendering
- `js/Tone.js` — Web Audio synthesis
- `js/OrbitControls.js` — Three.js camera controls

**PWA configuration:**
- `manifest.json` — theme `#2d1b4e`, background `#0a0a1a`
- `service-worker.js` — cache `gao-2.0`; HTML/JS/CSS/JSON always from network, assets cached

## Icons

`ic(name)` from `js/dom-utils.js` returns a `<span class="icon">` with `mask-image` set to the SVG URL.
Icon names are camelCase derived from filenames: `it-m5.svg` → `itM5`, `up.svg` → `up`.
Add new icons: drop SVG in `icons/`, add filename to `icons/index.json`.

## Code Style Notes

Code uses a mix of English and French comments — this is intentional. Music theory terms appear in French (e.g., "accords", "intervalles"). Commit messages follow conventional commits in French.
