<!--
  Grille de cartes.
  Usage : <Cartes :colonnes="3"> <Carte …/> <Carte …/> </Cartes>
  compactes : titres et textes plus petits, pour 4 ou 5 colonnes ou des titres longs.
-->
<script setup lang="ts">
withDefaults(defineProps<{ colonnes?: number, compactes?: boolean }>(), { colonnes: 2, compactes: false })
</script>

<template>
  <div class="cartes" :class="{ 'cartes--compactes': compactes }" :style="{ '--cartes-colonnes': colonnes }">
    <slot />
  </div>
</template>

<style>
/* :where() : spécificité nulle, une classe utilitaire posée sur le composant
 * (mt-8, gap-6…) l'emporte toujours. Même principe dans tous les composants. */
:where(.cartes) {
  display: grid;
  /* minmax(0, 1fr) : sans le 0, un mot long élargit sa colonne au lieu de passer à la ligne */
  grid-template-columns: repeat(var(--cartes-colonnes), minmax(0, 1fr));
  gap: var(--espace-m);
  margin-top: var(--espace-l);
}

.slidev-layout .cartes--compactes .carte__titre {
  font-size: var(--taille-texte);
}
</style>
