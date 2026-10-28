# Contrat de tokens

Liste des variables CSS que le thème `base` définit et que l'addon utilise.
Valeurs de départ : la présentation `conference` (dépôt des slides, `decks/conference/style.css`).

Un composant de l'addon n'utilise **que** les tokens de rôle décrits ici. Un thème enfant
peut surcharger n'importe lequel d'entre eux.

## Deux niveaux : palette et rôles

```css
/* 1. Palette : les teintes du thème. Déclarée et utilisée uniquement dans le thème. */
--canard: #153644;
--sable: #dcc29a;

/* 2. Rôles : ce que les composants utilisent. */
--couleur-fond: var(--canard);
--couleur-accent: var(--sable);
```

Pourquoi deux niveaux : si un composant écrivait `var(--sable)`, un thème qui veut un accent
bleu devrait donner à `--sable` une valeur bleue, ce qui rend le code illisible. En passant
par le rôle, le thème enfant écrit `--couleur-accent: #3b82f6` et tout suit.

La palette n'est pas un contrat : chaque thème nomme ses teintes comme il veut. Seuls les
rôles sont stables.

## Conventions de nommage

- En français, minuscules, mots séparés par des tirets.
- Forme `--<famille>-<rôle>[-<variante>]` : `--couleur-texte-attenue`, `--taille-chiffre-grand`.
- Familles : `couleur`, `police`, `graisse`, `taille`, `interligne`, `approche`, `espace`,
  `rayon`, `trait`, `ombre`.
- Pas de préfixe commun : Slidev utilise `--slidev-*` et UnoCSS `--un-*`, les noms français
  n'entrent pas en collision.

## Couleurs

| Token | Rôle | Valeur `base` (palette conférence) |
|---|---|---|
| `--couleur-fond` | fond des slides | `#153644` (canard) |
| `--couleur-fond-profond` | sections, zones sombres, texte sur fond clair | `#0e2631` (canard-deep) |
| `--couleur-fond-intense` | slide de tension (`noir`) | `#08171e` |
| `--couleur-surface` | cartes, cases, pistes de barres | `#1e4757` (canard-soft) |
| `--couleur-bordure` | bordure des cartes, traits de séparation, axes | `#2d5a6b` (canard-line) |
| `--couleur-texte` | texte courant | `#efe7d8` (crème) |
| `--couleur-texte-attenue` | texte secondaire, légendes, sources | crème à 68 % |
| `--couleur-accent` | titres, emphase, liens, puces | `#dcc29a` (sable) |
| `--couleur-danger` | attaque, risque — usage parcimonieux | `#e4795f` (corail) |
| `--couleur-succes` | bonne pratique, « ça marche » | `#8fbfa3` (sauge) |
| `--couleur-sur-accent` | texte posé sur un fond accent (pastille, case résultat) | `var(--couleur-fond-profond)` |
| `--couleur-fond-clair` | fond blanc derrière un logo ou un QR code | `#ffffff` |

### Teintes transparentes

Le deck écrit aujourd'hui `rgba(220, 194, 154, 0.07)` : c'est le sable recopié à la main.
Si le thème change l'accent, ce fond reste sable. On le remplace par `color-mix()`, qui
mélange une couleur avec du transparent :

```css
background: color-mix(in srgb, var(--couleur-accent) 7%, transparent);
```

Le résultat est identique, et il suit l'accent du thème. `color-mix()` est géré par Chromium,
donc par Slidev et par l'export PDF (Playwright).

Tokens dérivés définis dans `base` (un thème enfant n'a en général pas à y toucher) :

| Token | Calcul | Usage actuel |
|---|---|---|
| `--couleur-texte-attenue` | texte 68 % | `.c-dim`, légendes |
| `--couleur-accent-voile` | accent 7 % | fond de `.regle` |
| `--couleur-accent-souligne` | accent 40 % | soulignement des liens |
| `--couleur-danger-voile` | danger 12 % | fond du tampon « MYTHE » |
| `--couleur-succes-voile` | succès 8 % | zone « Repartir » du schéma des couches |

## Polices

| Token | Rôle | Valeur |
|---|---|---|
| `--police-titre` | titres, grands chiffres, numéros | `'Barlow Condensed', 'Miso', sans-serif` |
| `--police-texte` | texte courant | `'Miso', 'Inter', ui-sans-serif, system-ui, sans-serif` |
| `--police-svg` | texte dans les schémas SVG | `'MisoSVG', sans-serif` |
| `--police-titre-svg` | titres dans les schémas SVG | `'Barlow Condensed', 'MisoSVG', sans-serif` |
| `--police-code` | code | `'Fira Code', monospace` |

Pourquoi une police SVG à part : les métriques d'origine de Miso font mal dessiner le `<text>`
SVG dans Chromium (glyphes coupés). `MisoSVG` est le même fichier avec des métriques corrigées.
Les déclarations `@font-face` vivent dans le thème, pas dans l'addon.

| Token | Valeur |
|---|---|
| `--graisse-legere` | `300` |
| `--graisse-normale` | `400` |
| `--graisse-forte` | `700` |

## Tailles de texte

Le deck utilise 37 tailles différentes, de 0,75 à 9 rem. On les ramène à une échelle courte.
Une taille qui ne tombe pas sur l'échelle prend la plus proche.

| Token | Valeur | Remplace | Usage |
|---|---|---|---|
| `--taille-mini` | `0.8rem` | 0,75 – 0,9 | source, kicker, mention sous un champ |
| `--taille-petit` | `1.05rem` | 0,95 – 1,1 | texte des cartes compactes |
| `--taille-texte` | `1.25rem` | 1,15 – 1,3 | texte courant (taille de base de la slide) |
| `--taille-moyen` | `1.5rem` | 1,35 – 1,6 | titre de carte, légende de grand chiffre, encadré compact |
| `--taille-fort` | `1.8rem` | 1,7 – 2 | encadré « règle », éléments de liste en gros |
| `--taille-titre` | `2.1rem` | 2,1 – 2,3 | titre de slide (`h1`) |
| `--taille-chiffre-carte` | `2.6rem` | 2,6 – 3 | numéro dans une carte, opérateurs |
| `--taille-titre-section` | `4rem` | 3,4 – 4 | titre des slides de section et de couverture |
| `--taille-chiffre-petit` | `3.5rem` | 3,5 | `.big.petit` |
| `--taille-chiffre-moyen` | `4.5rem` | 4,5 | `.big.moyen` |
| `--taille-chiffre-grand` | `5.5rem` | 5,5 | `.big.grand` |
| `--taille-chiffre` | `7rem` | 7 | `.big` |
| `--taille-numero-section` | `9rem` | 9 | `.sec-num` |

Les classes UnoCSS (`text-xl`, `text-2xl`…) restent utilisables dans les slides : elles
appartiennent à Slidev, pas à la surcouche. Les composants, eux, n'utilisent que ces tokens.

### Cas des schémas SVG

Dans un SVG, `font-size: 18px` est mesuré dans le repère du `viewBox`, pas à l'écran : le
schéma est mis à l'échelle en entier. Ces tailles font partie du dessin, au même titre que
les coordonnées. **Exception admise** : elles restent écrites dans le composant. Les couleurs
et les polices d'un SVG passent en revanche toujours par les tokens.

## Interlignes et approches

| Token | Valeur | Usage |
|---|---|---|
| `--interligne-serre` | `1.1` | titres, grands chiffres |
| `--interligne-normal` | `1.35` | cartes, texte courant |
| `--interligne-aere` | `1.45` | paragraphes longs dans les cartes |
| `--approche-titre` | `-0.01em` | `h1` |
| `--approche-etiquette` | `0.2em` | kicker, étiquettes en majuscules |

« Approche » est le terme typographique pour l'espacement entre lettres (`letter-spacing`).

## Espacements

| Token | Valeur | Usage |
|---|---|---|
| `--espace-xs` | `0.35rem` | sous un titre de carte |
| `--espace-s` | `0.6rem` | entre un libellé et sa valeur |
| `--espace-m` | `1rem` | écart entre cartes |
| `--espace-l` | `1.4rem` | marge au-dessus d'une grille de cartes |
| `--espace-xl` | `2.5rem` | écart entre colonnes |
| `--marge-slide` | `3.5rem` | marge latérale (alignée sur Slidev), position des sources |
| `--marge-section` | `5rem` | retrait gauche des slides de section |
| `--marge-noir` | `6rem` | retrait latéral de la slide de tension |
| `--remplissage-carte` | `1.1rem 1.25rem` | intérieur d'une carte |
| `--remplissage-encadre` | `1.4rem 1.8rem` | intérieur de l'encadré « règle » |

## Formes

| Token | Valeur | Usage |
|---|---|---|
| `--rayon-encart` | `6px` | cartes, encadrés, cases, boîtes des schémas |
| `--rayon-petit` | `3px` | trait sous les titres, barres |
| `--rayon-touche` | `10px` | touches de clavier |
| `--rayon-pilule` | `999px` | étiquettes arrondies |
| `--trait-fin` | `1px` | bordure de carte, séparateurs |
| `--trait-moyen` | `1.5px` | étiquettes, contour des cases désactivées |
| `--trait-fort` | `2px` | encadré « règle », contour du numéro de section |
| `--trait-titre` | `4px` | épaisseur du trait sous les titres |
| `--largeur-trait-titre` | `3.6rem` | longueur du trait sous les titres |
| `--largeur-legende` | `34rem` | largeur maximale de la légende d'un grand chiffre |
| `--ombre-touche` | `0 5px 0 color-mix(in srgb, var(--couleur-texte) 75%, black)` | relief des touches |

`--rayon-encart` garde son nom actuel : il est déjà utilisé dans le deck et ses composants.

## Lien avec Slidev

Le thème `base` alimente aussi les variables de Slidev, pour que ses éléments internes
(barre de navigation, blocs de code) suivent :

```css
--slidev-theme-primary: var(--couleur-accent);
--slidev-code-background: var(--couleur-fond-profond); /* sous html.dark */
```

## Hors contrat

Ces valeurs restent dans le deck, elles ne passent pas dans le socle :

- **Palette « Matrix » de `MytheHacker.vue`** (`#3ddc84`, noirs `#050c0f`, `#0b1215`…) :
  c'est une illustration, pas une identité. Elle reste propre au composant.
- **Fond `#000` de la slide vidéo** : le noir derrière une vidéo ne dépend pas du thème.

## Valeurs en dur à reprendre dans le deck

Relevées pendant l'inventaire, à corriger lors du passage à la surcouche :

| Fichier | Valeur | Remplacée par |
|---|---|---|
| `style.css` (`.noir`) | `#08171e` | `--couleur-fond-intense` |
| `style.css` (`kbd.key`) | `#b9ab90` | `--ombre-touche` |
| `style.css` (`.regle`, liens) | `rgba(220, 194, 154, …)` | `--couleur-accent-voile`, `--couleur-accent-souligne` |
| `Couches.vue` | `#b9a27c`, `#c3aa83`, `#ccb38c`, `#d6bd95` | `color-mix()` de `--couleur-accent` avec du noir (16 %, 12 %, 7 %, 3 %) |
| `Couches.vue` | `#b4d3c1` | `color-mix()` de `--couleur-succes` avec 32 % de blanc |
| `Couches.vue`, `FraudeRib.vue`… | `'Barlow Condensed', 'MisoSVG'` | `--police-titre-svg` |
| `Couches.vue` | `#fff` / `#000` du masque SVG | inchangé : un masque SVG se définit en blanc/noir par nature |
| styles locaux des slides | `rgba(...)`, tailles hors échelle | tokens ci-dessus |
