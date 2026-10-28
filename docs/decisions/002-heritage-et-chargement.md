# 002 — Héritage des thèmes et chargement depuis le dépôt des slides

Date : 2026-10-27

## Décision

- **Héritage** : Slidev ne charge qu'un seul thème. Le thème enfant importe donc lui-même
  `base` en tête de son `styles/index.ts` (`import 'slidev-theme-calque-base/styles/index.ts'`),
  puis ses propres surcharges de tokens. Même sélecteur (`:root`), déclaré après : l'enfant l'emporte.
- **Workspaces npm** à la racine de ce dépôt : `npm install` lie `slidev-theme-calque-base`
  dans `node_modules/`. L'enfant référence ainsi base par son nom de paquet, ce qui marchera
  tel quel une fois publié.
- **`vite.config.ts` dans le thème enfant** : autorise le dossier de base dans `server.fs.allow`.
  Slidev n'autorise que les dossiers de la présentation, du thème et des addons ; sans ça, les
  polices de base sont refusées en développement. Slidev fusionne ce fichier avec sa configuration.
- **Points d'entrée en `index.ts`**, pas en `index.css` : base importe
  `@slidev/client/styles/layouts-base.css` (hauteur pleine, marges intérieures, comme les thèmes
  officiels). Ce fichier contient des `@apply` UnoCSS, transformés seulement s'il est importé
  depuis du JavaScript.
- **Règles d'habillage en `:where(.slidev-layout) …`** quand une classe doit pouvoir les
  surcharger (liens, `strong`, puces) : `:where()` ramène la spécificité à celle d'une balise.
- **Composants de l'addon en styles non scopés**, préfixés par le nom du composant
  (`.carte__titre`, `.grand-chiffre--danger`) : une présentation peut les ajuster sans `:deep()`.

## Chemins depuis une présentation

```yaml
theme: ../../../../slidev-calque/themes/cyber   # relatif au dossier de slides.md
addons:
  - ../../../slidev-calque/addon                # relatif au dossier PARENT de slides.md
```

Le chemin d'un addon a un `../` de moins : Slidev le résout depuis le parent du dossier de la
présentation (comportement de Slidev 53, `resolveAddon(addon, userRoot)` puis `dirname`).

## Vérifié (Slidev 53.0.0, deck `decks/calque-test` du dépôt des slides)

- Rendu identique à la conférence (couleurs, polices, cartes, encadré, grands chiffres).
- Une surcharge de `--couleur-accent` dans `cyber` se propage partout, teintes `color-mix()`
  comprises, et s'applique à chaud sans recharger la page.
- `import { computed } from 'vue'` fonctionne depuis un composant de l'addon.
- `slidev build` embarque les polices du thème dans `dist/assets/`.
