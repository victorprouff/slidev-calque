<!--
  Bouton de la barre de navigation vers l'éditeur de tokens (développement seulement).
-->
<script setup lang="ts">
const dev = import.meta.env.DEV
const lien = `${import.meta.env.BASE_URL}__calque`
</script>

<template>
  <a v-if="dev" :href="lien" class="slidev-icon-btn" title="Éditeur de tokens">
    <div class="i-carbon:color-palette" />
  </a>
</template>
