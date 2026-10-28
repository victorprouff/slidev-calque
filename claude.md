# Surcouche Slidev

Outil pour créer et faire évoluer mes présentations de formation (cybersécurité) avec Slidev : composants unifiés, thèmes héritables, et à terme une interface graphique pour régler l'apparence sans écrire de CSS.

## Principe non négociable : compatibilité totale avec Slidev

- Une présentation reste un projet Slidev standard, utilisable sans cette surcouche.
- La surcouche ne lit/écrit que des fichiers que Slidev comprend déjà :
  CSS, frontmatter, composants Vue, package.json.
- Aucun format propriétaire, aucun fork de Slidev.

## Vocabulaire

- **Token** : valeur de design nommée, sous forme de variable CSS (ex. `--couleur-principale`, `--arrondi-card`). Seule source des valeurs visuelles.
- **Thème** : un jeu de tokens (fond, couleurs, polices, arrondis…). Une présentation utilise un seul thème.
- **Addon socle** : composants (Card, encadrés, listes…) et layouts partagés. Ne contient aucune valeur en dur, uniquement des références aux tokens.

## Architecture

- `addon/` → paquet `slidev-addon-calque` : composants et layouts, noms stables et unifiés.
- `themes/base/` → paquet `slidev-theme-calque-base` : thème parent, définit tous les tokens.
- `themes/<nom>/` → paquet `slidev-theme-calque-<nom>` : thèmes enfants, importent les tokens de `base` et ne surchargent que ce qui change.
- Interface graphique (plus tard) : éditeur de tokens (formulaire + aperçu en direct) qui écrit dans les fichiers de tokens.

## Organisation

- Ce dépôt contient l'outil uniquement. Les présentations sont dans un dépôt séparé (`../Slides`, projet Slidev dans `slides/`, une présentation par dossier `slides/decks/<nom>/`).
- Pendant le développement, les présentations référencent l'outil par chemin relatif. Depuis `slides/decks/<nom>/slides.md` :
  - `theme: ../../../../slidev-calque/themes/cyber` (relatif au dossier de `slides.md`) ;
  - `addons: [../../../slidev-calque/addon]` (relatif au dossier **parent** : un `../` de moins, voir `docs/decisions/002-heritage-et-chargement.md`).
- Présentation de test : `slides/decks/calque-test` (`make calque-test` dans `../Slides`).
- Après un clone : `npm install` à la racine de ce dépôt (workspaces npm, lie `base` pour le thème enfant).
- Une fois stable : publication en paquets versionnés.
- Les décisions importantes sont notées dans `docs/decisions/`.

## Étapes

1. Contrat de tokens : liste et nommage des variables, à partir de mes présentations existantes → `docs/tokens.md`.
2. Socle minimal : addon avec 2-3 composants, un thème parent, un thème enfant, chargés depuis le dépôt des slides. Valide l'héritage et le chargement par chemin relatif (rechargement à chaud, résolution des dépendances).
3. Éditeur graphique de tokens.

## Conventions

- Jamais de couleur, police ou taille en dur dans un composant : toujours un token.
- Les noms de composants et de tokens sont en français ou en anglais, mais cohérents partout (à trancher à l'étape 1).
- Je suis développeur mais pas expert CSS : expliquer les choix non évidents.