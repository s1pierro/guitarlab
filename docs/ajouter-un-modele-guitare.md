# Ajouter un modèle de guitare

GuitarLab charge la définition de l'instrument depuis un fichier JSON au démarrage. Ce fichier contient tout ce dont l'application a besoin : le modèle 3D, l'accordage, la géométrie des cordes, et les paramètres de synthèse audio.

---

## Structure du fichier

```json
{
    "name": "classique-6",
    "label": "Guitare classique 6 cordes",
    "wavefront": "gao-beta-6.obj",
    "material": "gao-beta-6.mtl",
    "stringdefs": [ ... ]
}
```

| Champ | Type | Description |
|---|---|---|
| `name` | string | Identifiant interne (sans espaces) |
| `label` | string | Nom affiché dans l'interface |
| `wavefront` | string | Nom du fichier `.obj` (dans le même répertoire que le JSON) |
| `material` | string | Nom du fichier `.mtl` associé |
| `stringdefs` | array | Définitions des cordes, de la plus grave à la plus aiguë |

---

## Définition d'une corde (`stringdefs`)

Chaque élément de `stringdefs` décrit une corde :

```json
{
    "pitch": "E2",
    "thickness": 0.80,
    "nfret": 18,
    "neckxyz": { "x": -0.021849, "y":  0.326, "z": 0.000887 },
    "topxyz":  { "x": -0.024034, "y": -0.326, "z": 0.005246 },
    "partials": [0.8, 0.2, 0.1, 0.05, 0.025]
}
```

### `pitch`

Note à vide de la corde, en notation anglo-saxonne avec octave.

Exemples d'accordages courants :

| Accordage | Cordes (grave → aigu) |
|---|---|
| Standard | `E2 A2 D3 G3 B3 E4` |
| Drop D | `D2 A2 D3 G3 B3 E4` |
| Open G | `D2 G2 D3 G3 B3 D4` |
| Standard 7 cordes | `B1 E2 A2 D3 G3 B3 E4` |

Les noms de notes reconnus : `C D E F G A B` avec `#` ou `b` pour les altérations, suivi du numéro d'octave (`0` à `7`). Exemples : `C#3`, `Bb2`, `F#4`.

### `thickness`

Épaisseur visuelle de la corde dans la scène 3D (unités Three.js). Valeurs typiques :

| Corde | Épaisseur |
|---|---|
| Mi grave (E2) | `0.80` |
| Mi aigu (E4) | `0.50` |

Réduire progressivement de la corde la plus grave à la plus aiguë pour un rendu réaliste.

### `nfret`

Nombre de frettes du manche. Toutes les cordes doivent avoir la même valeur. Valeurs courantes : `12`, `18`, `19`, `20`, `22`, `24`.

### `neckxyz` et `topxyz`

Positions 3D des extrémités de la corde dans l'espace du modèle Three.js :

- **`neckxyz`** — position côté sillet (tête du manche, frette 0)
- **`topxyz`** — position côté chevalet (corps de la guitare)

Le repère utilisé :

```
Y  ← axe du manche (longueur)
X  ← axe transversal (répartition des cordes)
Z  ← axe de profondeur (hauteur au-dessus du manche)
```

Les coordonnées `y` sont symétriques : `+0.326` côté sillet, `-0.326` côté chevalet.
Les coordonnées `x` varient selon la position transversale de chaque corde.
Les coordonnées `z` sont légèrement positives (cordes surélevées au-dessus du manche).

**Comment obtenir ces valeurs :**

Pour un modèle créé dans un logiciel 3D, mesurer les positions des extrémités de chaque corde dans le repère du modèle exporté. Les valeurs doivent correspondre précisément à la géométrie du `.obj` pour que le raycasting et la projection des étiquettes soient corrects.

Le paramètre `wideness` (non stocké dans le JSON, calculé à la modélisation) représente l'écart transversal entre la première et la dernière corde. La valeur `1.1` a été utilisée pour `classique-6`.

### `partials`

Amplitudes des partiels harmoniques utilisés par Tone.js pour la synthèse additive. Le premier partiel est la fondamentale.

```json
"partials": [0.8, 0.2, 0.1, 0.05, 0.025]
```

- Les cordes graves bénéficient de plus de partiels (timbre plus riche)
- Les cordes aiguës peuvent se limiter à 2 partiels
- Les valeurs doivent être décroissantes et rester entre `0` et `1`

---

## Ajouter un nouveau modèle

1. Placer les fichiers `.obj`, `.mtl` et le JSON dans le répertoire `guitars/`
2. Dans `index.html` (ou dans le script de démarrage), modifier l'URL de chargement :

```js
const guitardef = await fetch('guitars/mon-modele.json').then(r => r.json());
```

Cette ligne se trouve dans le bloc `DOMContentLoaded` de `gao.js`, juste avant l'instanciation de `Application`.

3. Les textures éventuelles référencées dans le `.mtl` doivent être dans le même répertoire que le `.mtl`.

---

## Exemple : guitare 7 cordes

Pour ajouter une corde `B1` en dessous de la corde `E2` standard, ajouter en tête du tableau `stringdefs` :

```json
{
    "pitch": "B1",
    "thickness": 0.90,
    "nfret": 18,
    "neckxyz": { "x": -0.030000, "y":  0.326, "z": 0.000887 },
    "topxyz":  { "x": -0.033000, "y": -0.326, "z": 0.005246 },
    "partials": [0.8, 0.2, 0.1, 0.05, 0.025, 0.012]
}
```

L'application s'adapte automatiquement au nombre de cordes présentes dans `stringdefs` — le catalogue d'accords, le séquenceur et le PluckPad se redimensionnent sans modification de code.

---

## Notes de modélisation

Le modèle OBJ doit exposer un objet nommé `fingerboard` (ou contenant ce terme) pour que le raycasting fonctionne. C'est sur cet objet que les clics/touches sont détectés pour identifier la frette et la corde.

Les matériaux dans le `.mtl` peuvent utiliser des maps de texture (`map_Kd`) — les chemins sont résolus relativement au fichier `.mtl`.

---

*Pour créer de nouveaux modèles 3D, voir le projet [forg.x](../forg.x/) — éditeur 3D léger développé en parallèle.*
