<!--
  Exercice « légitime ou piège ? » sur une adresse web.
  Avant `revele` : l'adresse brute, à faire deviner.
  Après : le vrai domaine ressort, le verdict et l'explication apparaissent.
  Usage :
    <ExerciceLien url="https://microsoft.com.authent.eu/login" domaine="authent.eu"
                  verdict="piege" explication="Le vrai domaine est authent.eu." :revele="$clicks >= 1" />
  domaine : partie de l'adresse à faire ressortir (sa première occurrence)
  verdict : "piege", "legitime" ou "doute"
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  url: string
  domaine: string
  verdict: 'piege' | 'legitime' | 'doute'
  explication?: string
  revele?: boolean
}>()

const morceaux = computed(() => {
  const i = props.url.indexOf(props.domaine)
  if (i === -1)
    return { avant: props.url, domaine: '', apres: '' }
  return { avant: props.url.slice(0, i), domaine: props.domaine, apres: props.url.slice(i + props.domaine.length) }
})

const etiquettes = { piege: '✗ Piège', legitime: '✓ Légitime', doute: '? Dans le doute' }
</script>

<template>
  <div class="exercice-lien" :class="[`exercice-lien--${verdict}`, { 'exercice-lien--revele': revele }]">
    <div class="exercice-lien__url">
      <span>{{ morceaux.avant }}</span><span class="exercice-lien__domaine">{{ morceaux.domaine }}</span><span>{{ morceaux.apres }}</span>
    </div>
    <div class="exercice-lien__verdict">
      {{ revele ? etiquettes[verdict] : '?' }}
    </div>
    <div v-if="revele && explication" class="exercice-lien__explication">
      {{ explication }}
    </div>
  </div>
</template>

<style>
:where(.exercice-lien) {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: var(--espace-l);
  align-items: center;
  padding: var(--espace-s) 0;
  border-bottom: var(--trait-fin) solid var(--couleur-bordure);
}

.exercice-lien__url {
  font-family: var(--police-code);
  font-size: var(--taille-texte);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--couleur-texte);
}

.exercice-lien__domaine {
  transition: color 0.3s;
}

.exercice-lien__verdict {
  min-width: 9rem;
  text-align: center;
  font-family: var(--police-titre);
  font-size: var(--taille-texte);
  font-weight: var(--graisse-forte);
  padding: 0.1rem var(--espace-s);
  border: var(--trait-fin) dashed var(--couleur-bordure);
  border-radius: var(--rayon-pilule);
  color: var(--couleur-texte-attenue);
}

.exercice-lien__explication {
  grid-column: 1 / -1;
  margin-top: var(--espace-xs);
  font-size: var(--taille-petit);
  color: var(--couleur-texte-attenue);
}

/* Une fois révélé : le domaine et le verdict prennent la couleur du verdict */
.exercice-lien--revele .exercice-lien__verdict { border-style: solid; }
.exercice-lien--revele.exercice-lien--piege .exercice-lien__domaine,
.exercice-lien--revele.exercice-lien--piege .exercice-lien__verdict { color: var(--couleur-danger); border-color: var(--couleur-danger); }
.exercice-lien--revele.exercice-lien--legitime .exercice-lien__domaine,
.exercice-lien--revele.exercice-lien--legitime .exercice-lien__verdict { color: var(--couleur-succes); border-color: var(--couleur-succes); }
.exercice-lien--revele.exercice-lien--doute .exercice-lien__domaine,
.exercice-lien--revele.exercice-lien--doute .exercice-lien__verdict { color: var(--couleur-accent); border-color: var(--couleur-accent); }
.exercice-lien--revele .exercice-lien__domaine { text-decoration: underline; text-underline-offset: 0.25em; text-decoration-thickness: 2px; }
</style>
