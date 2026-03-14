# Architecture — GuitarLab

## Vue d'ensemble

GuitarLab est une application vanilla JS organisée en classes à responsabilité unique, découplées par injection de callbacks. Il n'y a pas de framework ni de système d'événements global : chaque dépendance est passée explicitement au constructeur.

```
Application
├── GuitarModel            — état des frettes (source de vérité)
├── GroundRender           — rendu 3D (Three.js)
│   └── Cameraman          — caméra + OrbitControls
├── ComputedGuitar         — agrégateur des 6 cordes
│   └── ComputedString ×6  — corde individuelle (UI + audio)
├── ChordGuesser           — analyse et reconnaissance d'accords
│   └── ChordPinBoard      — favoris d'accords
└── PluckPad               — pad tactile de pincement
```

Les données musicales (notes, intervalles, types d'accords) sont isolées dans `music-theory.js` et importées en ES module.

---

## Flux de données

```
[Tap 3D]──► GroundRender.raycast()
                │ onFretClick(stringIndex, fret)
                ▼
         ComputedString.hold(fret)
                │ audio (Tone.js)
                │ GuitarModel.hold(stringIndex, fret)
                │   │ onStateChange()
                │   ▼
                │  ChordGuesser.description()  ──► DOM analyse
                └►  PluckPad.update()          ──► DOM boutons

[Tap PluckPad]──► ComputedString.tap(fret)  ──► audio uniquement

[Chord favori]──► ChordPinBoard.onApplyChord(chord)
                      │
                      ▼ ComputedString.forcehold() ×6
                          │ GuitarModel.forcehold()
                          │   │ onStateChange() ──► analyse
```

---

## Classes

### `music-theory.js`
Module de données musicales, sans logique applicative.

**Exports :**
| Symbole | Type | Description |
|---|---|---|
| `notes` | `string[]` | 12 noms anglais (C, C#, D…) |
| `notesFr` | `string[]` | 12 noms français (Do, Do#, Ré…) |
| `allnotes` | `string[]` | 96 notes avec octave (C0–B7) |
| `allnotesFr` | `string[]` | idem en français |
| `intervals` | `string[]` | 12 types d'intervalles (root, b2, 2, b3…) |
| `chordtypes` | `object[]` | 50+ définitions d'accords (intervalles, symbole, musthave) |
| `Interval(s)` | constructeur | Résout un nom d'intervalle → semitons, icône, fond SVG |
| `Chord` | classe | Représentation d'un accord (frettes, notes, intervalles) |
| `extraireChiffres(s)` | fonction | Extrait les chiffres d'une chaîne |
| `extractBaseNote(s)` | fonction | Supprime l'octave d'une note (ex. "C4" → "C") |

---

### `GuitarModel`
**Responsabilité :** Source de vérité unique pour l'état des frettes. Aucune logique audio ni visuelle.

**Constructeur :** `(stringNames, onStateChange)`

**État :**
- `holds[]` — tableau de 6 entiers, `-1` = corde non jouée

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `hold(stringIndex, fret)` | Bascule frette on/off, déclenche `onStateChange` |
| `forcehold(stringIndex, fret)` | Force une frette (`'x'` pour muter), déclenche `onStateChange` |
| `getholdedstrings()` | Retourne les cordes actives avec note et octave |
| `getholdedfrets()` | Retourne tableau de frettes sous forme string (`['3','x','0'…]`) |

**Dépendances :** aucune
**Callback émis :** `onStateChange()` à chaque mutation de `holds`

---

### `ComputedString`
**Responsabilité :** Gère une corde individuelle — affichage DOM du manche, synthèse audio Tone.js, synchronisation avec `GuitarModel`.

**Constructeur :** `(def, stringIndex, model, nfrets, domdest)`

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `hold(fret)` | Appuie/relâche une frette (audio + DOM + GuitarModel) |
| `forcehold(fret)` | Force sans bascule (utilisé pour appliquer un accord sauvegardé) |
| `tap(fret)` | Attaque unique sans relâche (preview) |
| `getstate()` | Retourne l'état courant `{fret, basenote, octavednote, octave}` |
| `addNoteHelper()` | Peuple le manche avec les étiquettes de notes |

**Dépendances :** `GuitarModel`, Tone.js
**Callback émis :** aucun (mutations via `GuitarModel.onStateChange`)

---

### `ComputedGuitar`
**Responsabilité :** Agrège les 6 `ComputedString` et coordonne jeu, strumming et rendu des fingerprints.

**Constructeur :** `(guitardef, domdest, groundrender, model)`

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `strum(way)` | Joue les cordes actives en séquence (direction selon signe de `way`) |
| `play(stringIndex)` | Joue une corde solo |
| `getholdedstrings()` | Délègue à `GuitarModel` |
| `getholdedfrets()` | Délègue à `GuitarModel` |
| `fingerprintsrender()` | Projette les icônes d'intervalles sur le manche 3D |

**Dépendances :** `ComputedString ×6`, `GuitarModel`, `GroundRender`, Tone.js

---

### `ChordGuesser`
**Responsabilité :** Analyse les frettes actives, score contre 50+ définitions d'accords, affiche le meilleur match avec composition en intervalles. Détient le `ChordPinBoard`.

**Constructeur :** `(domdest, computedguitar)`

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `description()` | Analyse complète : scoring, rendu DOM, appel `fingerprintsrender()` |
| `getinterval(root, note)` | Calcule l'intervalle entre deux notes (en semitons) |

**Algorithme de scoring :** pour chaque note racine possible, calcule les intervalles de toutes les cordes actives, compare avec chaque type d'accord — score = intersection / musthave, bonus si la fondamentale est jouée, annulé si intervalles parasites.

**Dépendances :** `ComputedGuitar`, `ChordPinBoard`, music-theory.js
**Callbacks reçus/émis :** via `ChordPinBoard` (`onApplyChord`, `onStateChange`)

---

### `ChordPinBoard`
**Responsabilité :** CRUD de la liste des accords favoris. Affichage et application d'un accord sauvegardé.

**Constructeur :** `(domdest, onApplyChord, onStateChange)`

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `pinchord(chord)` | Ajoute ou retire un accord (bascule) |
| `pushchord(chord)` | Déclenche `onApplyChord(chord)` |
| `kickchord(chord)` | Retire un accord de la liste |
| `has(chord)` | Vérifie si un accord est déjà sauvegardé |
| `update()` | Rafraîchit le DOM |

**Callbacks émis :**
- `onApplyChord(chord)` — au clic sur un accord sauvegardé
- `onStateChange()` — à chaque mutation de la liste

---

### `PluckPad`
**Responsabilité :** Six boutons tactiles, un par corde. Affiche la note courante et déclenche l'audio au toucher.

**Constructeur :** `(strings, domdest)`

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `pluck(string)` | Déclenche l'attaque audio sur une corde |
| `update()` | Régénère les boutons (notes courantes) |

**Dépendances :** `ComputedString ×6`, Tone.js

---

### `Cameraman`
**Responsabilité :** Caméra Three.js avec OrbitControls. Suit la position souris/touch. Déclenche les re-renders. Projection 3D → 2D.

**Constructeur :** `(onNeedRender)`

**Configuration caméra :**
- FOV 25°, contraintes angulaires fixes (pas de rotation azimutale)
- Target fixe sur le manche

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `update()` | Applique les mouvements OrbitControls en attente |
| `resize(width, height)` | Met à jour le ratio d'aspect |
| `getScreenCoordinates(obj)` | Projette un objet 3D en coordonnées écran |

**Callbacks émis :** `onNeedRender()` sur mousemove, touchstart, touchmove, wheel

---

### `GroundRender`
**Responsabilité :** Pipeline graphique Three.js — scène, renderer WebGL, chargement du modèle OBJ, raycasting des frettes, gestion du resize.

**Constructeur :** `(domdest, onFretClick, onAfterRender)`

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `init()` | Setup scène, lumières, renderer, Cameraman |
| `loadWavefrontGuitar(obj, mtl, path)` | Charge le modèle 3D async, génère les définitions de cordes |
| `raycast()` | Détecte le hit sur `guitar.fingerboard`, identifie corde et frette, appelle `onFretClick` |
| `render()` | Met à jour la caméra, rend la scène, appelle `onAfterRender` |
| `genStringDef(...)` | Génère la définition d'une corde avec positions 3D des frettes |
| `getScreenCoordinates(obj)` | Délègue à `Cameraman` |

**Dépendances :** `Cameraman`, Three.js (Scene, WebGLRenderer, Raycaster, Loaders)
**Callbacks émis :**
- `onFretClick(stringIndex, fret)` — au tap sur le manche 3D
- `onAfterRender()` — après chaque frame rendue

---

### `Application`
**Responsabilité :** Point d'entrée. Crée la hiérarchie DOM, instancie toutes les classes, câble tous les callbacks.

**Constructeur :** initialisation complète en une passe

**Ordre d'initialisation :**
1. `Tone.start()` — contexte Web Audio
2. Création des couches DOM (`app-body`, `touch-layer`, `render-layer`, `analyser-side`)
3. `GroundRender` — charge le modèle 3D
4. `GuitarModel` — avec `onStateChange` → `ChordGuesser.description()` + `PluckPad.update()`
5. `ComputedGuitar` — 6 cordes instanciées
6. `ChordGuesser` — analyse + favoris
7. `PluckPad` — boutons de pincement
8. Event listeners clavier et clic

**Câblage des callbacks :**
| Source | Callback | Cible |
|---|---|---|
| `GroundRender` | `onFretClick(si, fret)` | `ComputedString[si].hold(fret)` |
| `GroundRender` | `onAfterRender()` | `ComputedGuitar.fingerprintsrender()` |
| `GuitarModel` | `onStateChange()` | `ChordGuesser.description()` + `PluckPad.update()` |
| `ChordPinBoard` | `onApplyChord(chord)` | `ComputedString[i].forcehold()` ×6 |
| `ChordPinBoard` | `onStateChange()` | `ChordGuesser.description()` |
| Strum button | `click` | `ComputedGuitar.strum()` |
| Keyboard K–P | `keydown` | `ComputedGuitar.play(i)` |
