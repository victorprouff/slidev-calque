<!--
  Grand chiffre et sa légende.
  Usage : <GrandChiffre valeur="43 %" variante="danger">des incidents viennent d'un **mail**</GrandChiffre>
  taille : "grand", "moyen" ou "petit". Sans taille : la plus grande (un chiffre seul ou deux côte à côte).
  variante : "danger" ou "succes". Sans variante : couleur d'accent.
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  valeur: string | number
  taille?: 'grand' | 'moyen' | 'petit'
  variante?: 'danger' | 'succes'
}>()

const classes = computed(() => [
  props.taille && `grand-chiffre--${props.taille}`,
  props.variante && `grand-chiffre--${props.variante}`,
])
</script>

<template>
  <div class="grand-chiffre" :class="classes">
    <div class="grand-chiffre__valeur">{{ valeur }}</div>
    <div v-if="$slots.default" class="grand-chiffre__legende">
      <slot />
    </div>
  </div>
</template>

<style>
.grand-chiffre__valeur {
  font-family: var(--police-titre);
  font-size: var(--taille-chiffre);
  font-weight: var(--graisse-forte);
  line-height: var(--interligne-serre);
  /* Barlow descend sous sa ligne de base : sans cette marge, la légende colle au chiffre */
  padding-bottom: 0.15em;
  color: var(--couleur-accent);
}

.grand-chiffre--grand .grand-chiffre__valeur { font-size: var(--taille-chiffre-grand); }
.grand-chiffre--moyen .grand-chiffre__valeur { font-size: var(--taille-chiffre-moyen); }
.grand-chiffre--petit .grand-chiffre__valeur { font-size: var(--taille-chiffre-petit); }

.grand-chiffre--danger .grand-chiffre__valeur { color: var(--couleur-danger); }
.grand-chiffre--succes .grand-chiffre__valeur { color: var(--couleur-succes); }

.grand-chiffre__legende {
  margin-top: var(--espace-s);
  font-size: var(--taille-moyen);
  line-height: var(--interligne-normal);
  max-width: var(--largeur-legende);
}

/* Dans un bloc centré, la légende (de largeur limitée) se centre aussi */
.text-center .grand-chiffre__legende {
  margin-inline: auto;
}

.grand-chiffre__legende > p {
  margin: 0;
}
</style>
