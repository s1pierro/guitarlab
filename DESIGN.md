# GuitarLab — Principes graphiques

## Philosophie

**Épuré.** Pas de bordures décoratives, pas de fonds de carte, pas de boîtes. L'interface ne doit pas se voir — elle doit s'effacer au profit du contenu.

**Densité maximale.** Chaque pixel doit porter de l'information. Espacement minimal, taille de texte compacte, pas de padding de confort superflu.

**Hiérarchie par le texte.** On ne crée pas de niveaux visuels avec des éléments tiers (badges, pills, cards). On les crée par deux seuls leviers : la **taille** et le **contraste** (opacité/couleur du texte).

---

## Typographie

- **Police :** Comfortaa (variable, `font/Comfortaa-VariableFont_wght.ttf`), déclarée sur `#app-body`
- Toujours `font-family: inherit` sur `<button>`, `<input>`, `<select>`, `<label>`

### Niveaux d'intensité

| Niveau | Usage | Opacité / couleur |
|---|---|---|
| **Primaire** | Titre, valeur clé, action principale | `color: #333`, opacité 1 |
| **Secondaire** | Label, métadonnée, contexte | `color: #666` ou `opacity: 0.6` |
| **Tertiaire** | Indication discrète, inactif | `color: #999` ou `opacity: 0.4` |
| **Accent** | Élément actif, sélectionné | `color: #7c3aed` |
| **Danger** | Action destructrice | `color: #c0392b` |

La taille renforce le niveau : primaire ≥ 1em, secondaire ~0.85em, tertiaire ~0.75em.

---

## Interactions

- **Liens / actions :** pas de bouton encadré — texte avec icône, opacité réduite au repos, pleine au survol
- **Hover :** variation d'opacité ou de couleur uniquement, jamais de fond ou de bordure apparaissant
- **Actif / sélectionné :** couleur accent `#7c3aed`, pas de fond

---

## Icônes

Police `gao-fonticons-max`, toujours `<i class="icon-xxx"></i>`.
L'icône accompagne le texte — elle ne le remplace pas. Taille identique au texte porteur.

Icônes disponibles :

| Classe | Usage |
|---|---|
| `icon-sliders` | En-tête app |
| `icon-cog-alt` | Paramètres |
| `icon-wrench` | Outils |
| `icon-book` | Catalogue |
| `icon-attach-2` | Bibliothèque |
| `icon-note` / `icon-note-beamed` | Musique, partition |
| `icon-play` / `icon-stop` / `icon-pause` | Transport |
| `icon-loop` | Boucle |
| `icon-record` | Enregistrement |
| `icon-to-start` / `icon-to-end` | Navigation |
| `icon-fast-forward` / `icon-fast-backward` | Navigation rapide |
| `icon-trash` | Supprimer |
| `icon-doc` | Exporter |
| `icon-folder-empty` / `icon-folder-open-empty` | Ouvrir / Charger |
| `icon-cloud` | Sauvegarde |
| `icon-plus` / `icon-minus` | Ajouter / Retirer |
| `icon-cancel-1` | Fermer |
| `icon-pencil` | Éditer |
| `icon-lock` / `icon-lock-open` | Verrouillage |
| `icon-star-empty` / `icon-star-1` | Favoris |
| `icon-th` / `icon-th-list` | Vue grille / liste |
| `icon-mic` | Micro |
| `icon-help` / `icon-info` | Aide |
| `icon-keyboard` | Clavier |

---

## Séparateurs

Un seul séparateur autorisé : `border-top: 1px solid #ddd` entre sections de la pile UX. Jamais à l'intérieur d'une section.

## Exception : éléments sur canvas

Le PluckPad et tout élément flottant posé sur le canvas 3D utilisent un fond sombre (`#000a`) avec texte `#ffffff99` — contraste inversé pour rester lisible sur la scène.
