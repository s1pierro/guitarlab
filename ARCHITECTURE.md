# Architecture — GuitarLab

## Vue d'ensemble

GuitarLab est une application vanilla JS organisée en classes à responsabilité unique, découplées par injection de callbacks. Il n'y a pas de framework ni de système d'événements global : chaque dépendance est passée explicitement au constructeur.

```
Application
├── AppStorage             — persistance localStorage
├── GuitarModel            — état des frettes (source de vérité)
├── GroundRender           — rendu 3D (Three.js)
│   └── Cameraman          — caméra + OrbitControls
├── ComputedGuitar         — agrégateur des 6 cordes
│   └── ComputedString ×6  — corde individuelle (UI + audio)
├── ChordWizard            — analyse, catalogue et favoris d'accords
│   └── ChordPinBoard      — favoris d'accords
└── PluckPad               — pad tactile de pincement (flottant, déplaçable)
```

Les données musicales (notes, intervalles, types d'accords) sont isolées dans `music-theory.js` et importées en ES module.

---

## Flux de données

```
[Tap 3D]──► GroundRender.raycast()          (whitelist: #touch-layer / #render-layer)
                │ onFretClick(stringIndex, fret)
                ▼
         ComputedString.hold(fret)
                │ audio (Tone.js)
                │ GuitarModel.hold(stringIndex, fret)
                │   │ onStateChange()
                │   ▼
                │  ChordWizard.guess() + print()  ──► #onair-chord
                │  AppStorage.set('onair-frets')
                └►  PluckPad.update()             ──► DOM boutons

[Tap PluckPad]──► ComputedString.tap(fret)  ──► audio uniquement

[Chord favori]──► ChordPinBoard.onApplyChord(chord)
                      │
                      ▼ ComputedString.forcehold() ×6
                          │ GuitarModel.forcehold()
                          │   │ onStateChange() ──► analyse + AppStorage

[Catalogue]──► ChordWizard.printCatalog()
                   │ buildVoicings() + _guessFromVoicing()
                   ▼ ComputedString.forcehold() ×6 + GroundRender.render()

[OrbitControls change]──► AppStorage.set('camera-views[orientation]')

[Orientation change]──► GroundRender.setView() + render()
                         PluckPad position restaurée
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
| `Chord` | classe | Représentation d'un accord (frets, name, root, type, desc, bass, notes, intervals) |
| `extraireChiffres(s)` | fonction | Extrait les chiffres d'une chaîne |
| `extractBaseNote(s)` | fonction | Supprime l'octave d'une note (ex. "C4" → "C") |

---

### `AppStorage`
**Responsabilité :** Wrapper namespaced autour de `localStorage` avec sérialisation JSON et gestion silencieuse des erreurs (quota, mode privé).

**Constructeur :** `(ns = 'guitarlab')`

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `get(key, fallback)` | Lit et désérialise une valeur, retourne `fallback` si absente |
| `set(key, value)` | Sérialise et stocke une valeur |
| `remove(key)` | Supprime une entrée |

**Clés utilisées par `Application` :**
| Clé | Contenu |
|---|---|
| `pinboard` | Liste des accords favoris (tableau de `Chord` sérialisés) |
| `ux-open` | État ouvert/fermé des `<details>` (`pinboard`, `catalog`) |
| `catalog-filters` | Filtres du catalogue (root, chordTypeIndex, maxSpan, minNotes, maxNotes, allowInversion, minFret, maxFret) |
| `onair-frets` | Tableau de frettes actives au dernier changement d'état |
| `pluck-pos` | Position du PluckPad par orientation (`portrait`, `landscape`) |
| `camera-views` | Vue caméra par orientation (`portrait`, `landscape`) |

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
| `fingerprintsrender()` | Projette les icônes d'intervalles sur le manche 3D, vide le `#touch-layer` |

**Dépendances :** `ComputedString ×6`, `GuitarModel`, `GroundRender`, Tone.js

---

### `ChordWizard`
**Responsabilité :** Analyse les frettes actives, score contre 50+ définitions d'accords, affiche le meilleur match. Gère le catalogue de voicings et détient le `ChordPinBoard`.

**Constructeur :** `(onApplyChord, onStateChange)`

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `guess(notes, frets)` | Analyse complète : scoring de toutes les combinaisons racine × type |
| `print(domdest)` | Rend le meilleur accord trouvé dans le DOM (`#onair-chord`) |
| `getStringIntervals()` | Retourne la map `stringIndex → intervalle` pour le meilleur accord |
| `getinterval(root, note)` | Calcule l'intervalle entre deux notes (en semitons) |
| `mountPinBoard(domdest)` | Monte le DOM du `ChordPinBoard` |
| `setInstrument(def)` | Configure l'accordage et le nombre de frettes pour le catalogue |
| `buildVoicings(root, chordTypeIndex, filters)` | Génère tous les voicings valides par produit cartésien filtré |
| `_guessFromVoicing(voicing)` | Reconnaissance non-mutante d'un voicing → `{root, chordtypeindex, score}` |
| `printCatalog(domdest, onApplyVoicing, storage)` | Rend le catalogue interactif avec filtres persistés |

**Filtres de `buildVoicings` :**
| Filtre | Défaut | Description |
|---|---|---|
| `maxSpan` | 4 | Écart max entre la frette la plus basse et la plus haute |
| `minNotes` | 3 | Nombre minimum de cordes jouées |
| `maxNotes` | 6 | Nombre maximum de cordes jouées |
| `allowInversion` | true | Autorise les renversements (basse ≠ fondamentale) |
| `requireOpen` | false | Au moins une corde à vide obligatoire |
| `maxFret` | nfrets | Frette maximum |
| `minFret` | 0 | Frette minimum (0 = pas de contrainte) |
| `noInteriorMutes` | false | Interdit les cordes muettes entre deux cordes jouées |

**Algorithme de scoring :** pour chaque note racine possible, calcule les intervalles de toutes les cordes actives, compare avec chaque type d'accord — score = intersection / musthave, bonus si la fondamentale est jouée, annulé si intervalles parasites. `_guessFromVoicing` applique le même algorithme sans modifier l'état.

**Dépendances :** `ChordPinBoard`, music-theory.js

---

### `ChordPinBoard`
**Responsabilité :** CRUD de la liste des accords favoris. Affichage et application d'un accord sauvegardé.

**Constructeur :** `(onApplyChord, onStateChange)`

**Méthodes / accesseurs principaux :**
| Méthode | Description |
|---|---|
| `get chords` | Retourne `pinnedchords[]` |
| `set chords(list)` | Restaure une liste en recréant les instances `Chord` (revival depuis JSON) |
| `pinchord(chord)` | Ajoute ou retire un accord (bascule) |
| `pushchord(chord)` | Déclenche `onApplyChord(chord)` |
| `kickchord(chord)` | Retire un accord de la liste |
| `has(chord)` | Vérifie si un accord est déjà sauvegardé (via `Chord.sameAs`) |
| `update()` | Rafraîchit le DOM |

**Note :** le setter `chords` recrée des instances `Chord` à partir des données JSON brutes afin de garantir la disponibilité de `sameAs()` après restauration depuis `localStorage`.

**Callbacks émis :**
- `onApplyChord(chord)` — au clic sur un accord sauvegardé
- `onStateChange()` — à chaque mutation de la liste

---

### `PluckPad`
**Responsabilité :** Six boutons tactiles, un par corde. Affiche la note courante et déclenche l'audio au toucher. Monté dans un `<details>` flottant et déplaçable, dont la position est persistée par orientation.

**Constructeur :** `(strings, domdest)`

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `pluck(string)` | Déclenche l'attaque audio sur une corde |
| `update()` | Régénère les boutons (notes courantes) |

**Note :** `ev.preventDefault()` sur `touchstart` pour bloquer les événements click synthétiques qui parasiteraient le raycast.

**Dépendances :** `ComputedString ×6`, Tone.js

---

### `Cameraman`
**Responsabilité :** Caméra Three.js avec OrbitControls. Suit la position souris/touch. Déclenche les re-renders. Projection 3D → 2D. Expose la vue courante pour persistance.

**Constructeur :** `(onNeedRender, domElement)`

**Configuration caméra :**
- FOV 25°, contraintes angulaires fixes (pas de rotation azimutale)
- `domElement` restreint aux listeners (par défaut `#touch-layer`)

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `update()` | Applique les mouvements OrbitControls en attente |
| `resize(width, height)` | Met à jour le ratio d'aspect |
| `getScreenCoordinates(obj)` | Projette un objet 3D en coordonnées écran |
| `getView()` | Retourne `{pos, target}` sérialisable |
| `setView(v)` | Restaure position et target, appelle `controls.update()` |
| `onViewChange(cb)` | Abonne `cb` aux événements `change` d'OrbitControls |

**Callbacks émis :** `onNeedRender()` sur mousemove, touchstart, touchmove, wheel

---

### `GroundRender`
**Responsabilité :** Pipeline graphique Three.js — scène, renderer WebGL, chargement du modèle OBJ, raycasting des frettes, gestion du resize.

**Constructeur :** `(domdest, onFretClick, onAfterRender, onReady)`

**Méthodes principales :**
| Méthode | Description |
|---|---|
| `init()` | Setup scène, lumières, renderer, Cameraman |
| `loadWavefrontGuitar(obj, mtl, path)` | Charge le modèle 3D async, génère les définitions de cordes, appelle `onReady` |
| `raycast()` | Détecte le hit sur `guitar.fingerboard`, identifie corde et frette, appelle `onFretClick` |
| `render()` | Met à jour la caméra, rend la scène, appelle `onAfterRender` |
| `genStringDef(...)` | Génère la définition d'une corde avec positions 3D des frettes |
| `getScreenCoordinates(obj)` | Délègue à `Cameraman` |
| `getView()` / `setView(v)` / `onViewChange(cb)` | Proxies vers `Cameraman` |

**Dépendances :** `Cameraman`, Three.js (Scene, WebGLRenderer, Raycaster, Loaders)
**Callbacks émis :**
- `onFretClick(stringIndex, fret)` — au tap sur le manche 3D
- `onAfterRender()` — après chaque frame rendue
- `onReady()` — après chargement complet du modèle 3D

---

### `Application`
**Responsabilité :** Point d'entrée. Crée la hiérarchie DOM, instancie toutes les classes, câble tous les callbacks, orchestre la persistance.

**Constructeur :** `(onReady)` — initialisation complète en une passe

**Structure DOM créée :**
```
#app-body
├── #app-stamp          — indicateur de chargement / branding
├── #touch-layer        — zone de touch pour OrbitControls + raycast
├── #render-layer       — canvas WebGL
├── #ux                 — panneau droit (66 vw), pointer-events isolés
│   ├── #ux-brand
│   ├── #onair-chord    — accord reconnu en temps réel
│   └── #chord-library
│       ├── <details>   — pinboard (favoris)
│       └── <details>   — catalogue
└── #pluck-pad-wrap     — <details> flottant déplaçable
```

**Ordre d'initialisation :**
1. `AppStorage` — wrapper localStorage
2. `GroundRender` — charge le modèle 3D ; dans `onReady` : restauration vue caméra + écoute changements
3. `GuitarModel` — `onStateChange` → guess + print + `AppStorage.set('onair-frets')`
4. `ComputedGuitar` — 6 cordes + restauration `onair-frets`
5. `ChordWizard` + `ChordPinBoard` — restauration pinboard depuis storage
6. Catalogue — `<details>` avec `printCatalog` déclenché au `toggle`
7. `PluckPad` — flottant draggable, position restaurée par orientation

**Câblage des callbacks :**
| Source | Callback | Cible |
|---|---|---|
| `GroundRender` | `onFretClick(si, fret)` | `ComputedString[si].hold(fret)` |
| `GroundRender` | `onAfterRender()` | `ComputedGuitar.fingerprintsrender()` |
| `GroundRender` | `onReady()` | restauration vue caméra + `onViewChange` → storage |
| `GuitarModel` | `onStateChange()` | `ChordWizard.guess/print` + `PluckPad.update` + storage |
| `ChordPinBoard` | `onApplyChord(chord)` | `ComputedString[i].forcehold()` ×6 + `render()` |
| `ChordPinBoard` | `onStateChange()` | `AppStorage.set('pinboard')` |
| OrbitControls | `change` | `AppStorage.set('camera-views[orient]')` |
| `matchMedia` | `change` (orientation) | restauration vue caméra + position PluckPad |
| Strum button | `click` | `ComputedGuitar.strum()` |
| Keyboard K–P | `keydown` | `ComputedGuitar.play(i)` |

**Raycast whitelist :** le handler `click` ne déclenche le raycast que si `e.target` est dans `#touch-layer` ou `#render-layer`, évitant les actions parasites depuis `#ux` et `#pluck-pad-wrap`.
