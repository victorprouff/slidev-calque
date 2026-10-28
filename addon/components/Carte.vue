<!--
  Carte : numéro (ou chiffre) facultatif, surtitre, titre, texte.
  Usage : <Carte num="2 / 3" titre="des attaques visent les PME" variante="danger">Source…</Carte>
  surtitre : petit libellé en majuscules au-dessus du titre (lieu, date…).
  variante : "danger" (corail) ou "succes" (sauge). Sans variante : couleurs normales.
-->
<script setup lang="ts">
defineProps<{
  num?: string | number
  surtitre?: string
  titre?: string
  variante?: 'danger' | 'succes'
}>()
</script>

<template>
  <div class="carte" :class="[variante && `carte--${variante}`, { 'carte--texte-seul': num === undefined && !surtitre && !titre && !$slots.titre }]">
    <div v-if="num !== undefined" class="carte__num">{{ num }}</div>
    <div v-if="surtitre" class="carte__surtitre">{{ surtitre }}</div>
    <h3 v-if="titre || $slots.titre" class="carte__titre">
      <slot name="titre">{{ titre }}</slot>
    </h3>
    <div v-if="$slots.default" class="carte__texte">
      <slot />
    </div>
  </div>
</template>

<style>
:where(.carte) {
  background: var(--couleur-surface);
  border: var(--trait-fin) solid var(--couleur-bordure);
  border-radius: var(--rayon-encart);
  padding: var(--remplissage-carte);
  line-height: var(--interligne-normal);
}

.carte__num {
  font-family: var(--police-titre);
  font-size: var(--taille-chiffre-carte);
  font-weight: var(--graisse-forte);
  line-height: 1;
  color: var(--couleur-accent);
}

/* .slidev-layout devant : passe avant la règle générale des h3 du thème */
.slidev-layout .carte__titre {
  font-size: var(--taille-moyen);
  line-height: var(--interligne-serre);
  margin: 0 0 var(--espace-xs);
}

.carte__surtitre {
  font-size: var(--taille-mini);
  letter-spacing: var(--approche-etiquette);
  text-transform: uppercase;
  color: var(--couleur-texte-attenue);
  margin-bottom: var(--espace-xs);
}

.carte__num + .carte__titre {
  margin-top: var(--espace-s);
}

.carte__texte {
  font-size: var(--taille-petit);
  color: var(--couleur-texte-attenue);
}

/* Carte sans titre ni numéro : son texte est le contenu principal, pas une légende */
.carte--texte-seul .carte__texte {
  font-size: var(--taille-texte);
  color: var(--couleur-texte);
}

/* Le texte passé en Markdown arrive dans des <p> : on retire leurs marges */
.carte__texte > p {
  margin: 0;
}

.carte--danger { border-color: var(--couleur-danger); }
.carte--danger .carte__num,
.slidev-layout .carte--danger .carte__titre { color: var(--couleur-danger); }

.carte--succes { border-color: var(--couleur-succes); }
.carte--succes .carte__num,
.slidev-layout .carte--succes .carte__titre { color: var(--couleur-succes); }
</style>
