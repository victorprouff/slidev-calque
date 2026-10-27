# 001 — Nommage des tokens

Date : 2026-10-27

## Décision

- Les tokens sont nommés **en français**, au format `--<famille>-<rôle>[-<variante>]`.
- Les couleurs ont **deux niveaux** : une palette nommée d'après les teintes (`--canard`,
  `--sable`), propre à chaque thème, et des rôles (`--couleur-fond`, `--couleur-accent`,
  `--couleur-danger`) que les composants utilisent seuls.
- Les teintes transparentes sont dérivées des rôles par `color-mix()` au lieu d'être recopiées
  en `rgba()`.
- Les tailles de texte dans les SVG (repère du `viewBox`) restent écrites dans les composants ;
  leurs couleurs et polices passent par les tokens.

## Raisons

- Le deck de référence (`conference`) est déjà en français (`--rayon-encart`, `.regle`,
  `.pastille`) : on garde la même langue partout.
- Un nom de teinte dans un composant empêche un thème enfant de changer de couleur sans rendre
  le code trompeur (un `--sable` qui vaudrait du bleu). Le rôle, lui, reste vrai.
- `rgba()` recopie la couleur : si l'accent change, le voile ne suit pas. `color-mix()` suit.
- Une taille SVG est mise à l'échelle avec le schéma : c'est une coordonnée de dessin, pas
  une valeur de design réglable.

## Conséquences

- La liste complète est dans `docs/tokens.md`.
- Le passage du deck `conference` à la surcouche demande de renommer `--canard`, `--sable`…
  dans ses composants (relevé en fin de `docs/tokens.md`).
