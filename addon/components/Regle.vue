<!--
  Encadré « règle d'or » : le message à retenir de la slide.
  Usage : <Regle>Tout changement de RIB se vérifie par un **appel sortant**.</Regle>
-->
<template>
  <div class="regle">
    <slot />
  </div>
</template>

<style>
:where(.regle) {
  border: var(--trait-fort) solid var(--couleur-accent);
  border-radius: var(--rayon-encart);
  padding: var(--remplissage-encadre);
  font-size: var(--taille-fort);
  line-height: var(--interligne-normal);
  background: var(--couleur-accent-voile);
}

.regle > p {
  margin: 0;
}
</style>
