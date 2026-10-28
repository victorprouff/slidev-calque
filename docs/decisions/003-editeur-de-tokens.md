# 003 — Éditeur graphique de tokens

Date : 2026-10-28

## Utilisation

1. Lancer une présentation qui utilise l'addon (`make conference`, `make calque-test`…).
2. Ouvrir `/__calque` (ou le bouton palette de la barre de navigation).
3. Choisir le thème à modifier : par défaut, celui de la présentation.
4. Modifier : l'aperçu à droite change tout de suite. « Enregistrer » écrit dans le fichier de
   tokens du thème, « Annuler » abandonne. Pour un thème enfant, « reprendre le parent »
   supprime la surcharge.

## Décisions

- **Intégré à Slidev**, dans l'addon, en développement uniquement :
  - `addon/vite.config.ts` ajoute un plugin Vite (`apply: 'serve'`) qui lit et écrit les fichiers ;
  - `addon/setup/routes.ts` ajoute la page `/__calque` ;
  - `addon/custom-nav-controls.vue` ajoute le bouton.
  Rien de tout ça n'existe dans `slidev build` ni dans l'export.
- **Un thème déclare son fichier de tokens** dans son `package.json`, champ `calque`
  (`tokens`, `parent`). Slidev ignore ce champ ; l'éditeur s'en sert pour savoir où écrire et
  de qui hériter. Les thèmes sont cherchés dans les `node_modules` en remontant depuis l'addon
  et depuis la présentation.
- **Écriture ligne par ligne** dans le premier bloc `:root` : commentaires, ordre et mise en
  forme sont conservés, le fichier reste éditable à la main. Un thème enfant ne contient que
  ses surcharges.
- **Garde-fous serveur** : thème connu uniquement, tokens existant dans la lignée uniquement,
  valeurs sans `;`, `{`, `}`, retour à la ligne ni commentaire, et pas de suppression dans un
  thème sans parent.
- **Aperçu en direct** : les valeurs en cours sont posées en style en ligne sur la racine de la
  page et de l'aperçu (`style.setProperty`). Le style en ligne l'emporte sur les fichiers ;
  il est retiré après l'enregistrement, quand le rechargement à chaud a appliqué le fichier,
  ou en quittant la page.
- **Contrôle selon la famille** : couleur (référence à un autre token, couleur personnalisée
  ou formule `color-mix()` en texte), longueur (curseur, nombre, unité), interligne, graisse,
  police (avec les polices chargées en suggestions), texte pour le reste.
- **Groupes** repris des titres de section de `themes/base/styles/tokens.css`
  (`/* ---------- Titre ---------- */`). Les tokens `--slidev-*` ne sont pas affichés : ils se
  déduisent des autres.
- **Interface neutre** : elle n'utilise aucun token, pour rester lisible quoi qu'on modifie.
