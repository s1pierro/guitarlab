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

**Single-file application:** All app logic lives in `gao.js` (~1445 lines). `gao-b.js` is a backup copy.

**Core class hierarchy in `gao.js`:**
- `Application` — top-level orchestrator, wires all components together
- `ComputedGuitar` — 6-string guitar, composed of `ComputedString` instances (each string has its own Tone.js sampler)
- `GroundRender` — Three.js 3D guitar visualization (uses OBJ/MTL models from `gao-beta-*.obj`)
- `PluckPad` — touch/mouse input handler for fret interaction
- `ChordGuesser` — analyzes active fret positions and scores against chord definitions
- `ChordPinBoard` — UI for saving/managing chord favorites

**Music theory data is hard-coded** in `gao.js`:
- 96 notes (8 octaves × 12 semitones)
- 12 interval types (root, b2, 2, b3, 3, 4, b5, 5, m5, 6, b7, 7)
- 50+ chord types with interval definitions and symbols

**Dependencies are all local** (no CDN):
- `js/three.min.js` — 3D rendering
- `js/Tone.js` — Web Audio synthesis
- `js/ammo.js` — Physics engine
- `js/OrbitControls.js` — Three.js camera controls

**PWA configuration:**
- `manifest.json` — app name, icons, fullscreen display mode
- `service-worker.js` — offline caching (cache version `gao-0.2`)

## Code Style Notes

Code uses a mix of English and French comments — this is intentional, not an error. Music theory terms often appear in French (e.g., "accords", "intervales").
