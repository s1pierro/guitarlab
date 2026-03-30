# GuitarLab

Application web pour l'exploration de la théorie musicale à la guitare. Manche 3D interactif rendu avec Three.js, reconnaissance d'accords en temps réel, séquenceur, accordeur micro — packagée en PWA installable.

**Application :** https://s1pierro.github.io/guitarlab/

![GuitarLab](https://s1pierro.github.io/guitarlab/assets/screenshot-wide.png) ![GuitarLab](https://s1pierro.github.io/guitarlab/assets/screenshot-narrow.png)

---

## Fonctionnalités

- **Manche 3D interactif** — Three.js, modèle OBJ, raycasting par frette et par corde
- **Reconnaissance d'accords en temps réel** — scoring sur 50+ types d'accords, affichage des intervalles sur le manche
- **Catalogue de voicings** — filtres par tonique, qualité, écart, nombre de cordes, position
- **Bibliothèque d'accords** — sauvegarde en sets nommés, navigation par pastilles
- **Séquenceur** — piste d'accords + grille de picking 6×N, durées variables [1 2 4 8], lecture avec Tone.js
- **Accordeur** — détection de pitch par autocorrélation (micro), visualiseur à aiguille graduée
- **Cameraman** — cadrages automatiques du manche (full, I, V, IX, XII), recalcul au resize/orientation
- **Synthèse audio** — échantillons de cordes par Tone.js, strumming, PluckPad tactile
- **Définition de guitare externalisée** — modèle, accordage et géométrie dans `guitars/*.json`
- **PWA** — installable, fonctionne hors ligne

---

## Architecture

Aucune étape de build. Vanilla JS servi directement depuis ce répertoire.

| Fichier | Rôle |
|---|---|
| `gao.js` | Application principale — toutes les classes |
| `music-theory.js` | Données musicales : notes, intervalles, 50+ types d'accords |
| `index.html` | Bootstrap, chargement séquentiel des scripts |
| `service-worker.js` | Cache PWA |
| `guitars/classique-6.json` | Définition de la guitare (accordage, géométrie 3D, synthèse) |

**Hiérarchie principale dans `gao.js` :**

```
Application
├── AppStorage             — persistance localStorage
├── GuitarModel            — état des frettes (source de vérité)
├── GroundRender           — rendu Three.js
│   └── Cameraman          — caméra, OrbitControls, cadrages automatiques
├── ComputedGuitar         — agrégateur des cordes
│   └── ComputedString ×N  — corde individuelle (DOM + audio Tone.js)
├── ChordWizard            — analyse, catalogue, favoris
│   └── ChordPinBoard      — sets d'accords favoris
├── PartitionManager       — séquenceur multi-séquences
├── UXStack                — pile de panneaux expand/collapse
│   ├── PanelBibliotheque
│   ├── PanelCatalogue
│   ├── PanelPartitions    — séquenceur
│   ├── PanelEcoute        — accordeur
│   ├── PanelParametres
│   └── PanelNotation
└── PluckPad               — pad tactile flottant
```

Documentation détaillée : [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`DESIGN.md`](DESIGN.md)

---

## Lancer l'application

Servir ce répertoire avec n'importe quel serveur HTTP statique (l'accès direct `file://` ne fonctionne pas — service worker et chargement de modules) :

```bash
python3 -m http.server 8080
# ou
npx serve .
```

Puis ouvrir `http://localhost:8080`.

Le contexte audio (Tone.js) nécessite une interaction utilisateur pour s'initialiser — c'est une contrainte navigateur, pas un bug.

---

## Ajouter un modèle de guitare

La définition de l'instrument est externalisée dans `guitars/classique-6.json`. Pour créer un nouveau modèle (7 cordes, accordage alternatif, etc.) :

→ Voir [`docs/ajouter-un-modele-guitare.md`](docs/ajouter-un-modele-guitare.md)

---

## Licence

Usage non commercial — voir [`LICENSE`](LICENSE).

Copyright © Thomas Saint Pierre (s1pierro / saintpierro) & Claude Sonnet 4.6 (Anthropic)
