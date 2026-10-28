<!--
  Grille de cartes.
  Usage : <Cartes :colonnes="3"> <Carte …/> <Carte …/> </Cartes>
-->
<script setup lang="ts">
withDefaults(defineProps<{ colonnes?: number }>(), { colonnes: 2 })
</script>

<template>
  <div class="cartes" :style="{ '--cartes-colonnes': colonnes }">
    <slot />
  </div>
</template>

<style>
.cartes {
  display: grid;
  /* minmax(0, 1fr) : sans le 0, un mot long élargit sa colonne au lieu de passer à la ligne */
  grid-template-columns: repeat(var(--cartes-colonnes), minmax(0, 1fr));
  gap: var(--espace-m);
  margin-top: var(--espace-l);
}
</style>
