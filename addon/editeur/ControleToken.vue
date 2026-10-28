<!--
  Un token dans l'éditeur : le bon contrôle selon sa famille
  (couleur, longueur, nombre, graisse, police), ou un champ texte.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'

export interface Token {
  nom: string
  valeur: string
  groupe: string
  source: 'theme' | 'parent'
  valeurParent?: string
}

const props = defineProps<{
  token: Token
  valeur: string
  modifie: boolean
  heritable: boolean
  couleurs: string[]
  polices: string[]
}>()

const emit = defineEmits<{
  (e: 'change', valeur: string): void
  (e: 'heriter'): void
}>()

const RE_LONGUEUR = /^(-?\d*\.?\d+)(rem|px|em|%)$/
const RE_VAR = /^var\((--[\w-]+)\)$/
const RE_HEX = /^#[0-9a-f]{3,8}$/i

const genre = computed(() => {
  const n = props.token.nom
  if (n.startsWith('--couleur') || props.token.groupe.startsWith('Palette'))
    return 'couleur'
  if (n.startsWith('--police'))
    return 'police'
  if (n.startsWith('--graisse'))
    return 'graisse'
  if (n.startsWith('--interligne'))
    return 'nombre'
  if (RE_LONGUEUR.test(props.valeur))
    return 'longueur'
  return 'texte'
})

// ---------- Couleurs ----------
const reference = computed(() => props.valeur.match(RE_VAR)?.[1] ?? null)
const estHex = computed(() => RE_HEX.test(props.valeur))
const echantillon = ref<HTMLElement>()

/** Couleur affichée par l'échantillon, en hexadécimal (le sélecteur natif n'accepte que ça). */
function hexAffiche(): string {
  if (estHex.value && props.valeur.length === 7)
    return props.valeur
  const rgb = echantillon.value ? getComputedStyle(echantillon.value).backgroundColor : ''
  const m = rgb.match(/\d+(\.\d+)?/g)
  if (!m)
    return '#000000'
  return `#${m.slice(0, 3).map(x => Math.round(+x).toString(16).padStart(2, '0')).join('')}`
}

function choisirReference(choix: string) {
  emit('change', choix === 'perso' ? hexAffiche() : `var(${choix})`)
}

// ---------- Longueurs ----------
const longueur = computed(() => {
  const m = props.valeur.match(RE_LONGUEUR)
  return m ? { nombre: +m[1], unite: m[2] } : null
})
const bornes = computed(() => {
  const u = longueur.value?.unite
  if (u === 'px')
    return { max: Math.max(40, (longueur.value?.nombre ?? 0) * 2), pas: 1 }
  return { max: Math.max(4, Math.ceil((longueur.value?.nombre ?? 0) * 2)), pas: 0.05 }
})
function changerLongueur(nombre: number, unite = longueur.value?.unite ?? 'rem') {
  emit('change', `${+nombre.toFixed(3)}${unite}`)
}

const nomCourt = computed(() => props.token.nom.slice(2))
</script>

<template>
  <div class="ctl" :class="{ 'ctl--modifie': modifie, 'ctl--herite': token.source === 'parent' && !modifie }">
    <div class="ctl__entete">
      <code class="ctl__nom" :title="token.nom">{{ nomCourt }}</code>
      <span v-if="token.source === 'parent' && !modifie" class="ctl__badge">hérité</span>
      <button
        v-else-if="heritable && token.source === 'theme'"
        class="ctl__lien"
        title="Supprimer la surcharge et reprendre la valeur du parent"
        @click="emit('heriter')"
      >
        reprendre le parent
      </button>
    </div>

    <!-- Couleur -->
    <div v-if="genre === 'couleur'" class="ctl__ligne">
      <span ref="echantillon" class="ctl__echantillon" :style="{ background: `var(${token.nom})` }" />
      <select :value="reference ?? (estHex ? 'perso' : 'avance')" @change="choisirReference(($event.target as HTMLSelectElement).value)">
        <option value="perso">Couleur personnalisée</option>
        <option v-if="!reference && !estHex" value="avance" disabled>Formule</option>
        <option v-for="c in couleurs.filter(c => c !== token.nom)" :key="c" :value="c">= {{ c.slice(2) }}</option>
      </select>
      <input
        v-if="estHex"
        type="color"
        :value="hexAffiche()"
        @input="emit('change', ($event.target as HTMLInputElement).value)"
      >
    </div>
    <input
      v-if="genre === 'couleur' && !reference && !estHex"
      class="ctl__texte"
      :value="valeur"
      spellcheck="false"
      @change="emit('change', ($event.target as HTMLInputElement).value)"
    >

    <!-- Longueur -->
    <div v-else-if="genre === 'longueur' && longueur" class="ctl__ligne">
      <input
        type="range" min="0" :max="bornes.max" :step="bornes.pas" :value="longueur.nombre"
        @input="changerLongueur(+($event.target as HTMLInputElement).value)"
      >
      <input
        type="number" class="ctl__nombre" :step="bornes.pas" :value="longueur.nombre"
        @change="changerLongueur(+($event.target as HTMLInputElement).value)"
      >
      <select :value="longueur.unite" @change="changerLongueur(longueur.nombre, ($event.target as HTMLSelectElement).value)">
        <option>rem</option>
        <option>px</option>
        <option>em</option>
        <option>%</option>
      </select>
    </div>

    <!-- Nombre sans unité (interligne) -->
    <div v-else-if="genre === 'nombre'" class="ctl__ligne">
      <input
        type="range" min="0.8" max="2" step="0.05" :value="valeur"
        @input="emit('change', ($event.target as HTMLInputElement).value)"
      >
      <input
        type="number" class="ctl__nombre" step="0.05" :value="valeur"
        @change="emit('change', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <!-- Graisse -->
    <select v-else-if="genre === 'graisse'" :value="valeur" @change="emit('change', ($event.target as HTMLSelectElement).value)">
      <option v-for="g in [100, 200, 300, 400, 500, 600, 700, 800, 900]" :key="g" :value="String(g)">
        {{ g }}
      </option>
    </select>

    <!-- Police : texte libre, avec les polices chargées en suggestions -->
    <template v-else-if="genre === 'police'">
      <input
        class="ctl__texte" :value="valeur" :list="`polices-${nomCourt}`" spellcheck="false"
        :style="{ fontFamily: `var(${token.nom})` }"
        @change="emit('change', ($event.target as HTMLInputElement).value)"
      >
      <datalist :id="`polices-${nomCourt}`">
        <option v-for="p in polices" :key="p" :value="`'${p}', sans-serif`" />
      </datalist>
    </template>

    <!-- Tout le reste : texte -->
    <input
      v-else-if="genre !== 'couleur'"
      class="ctl__texte" :value="valeur" spellcheck="false"
      @change="emit('change', ($event.target as HTMLInputElement).value)"
    >

    <div v-if="token.source === 'theme' && token.valeurParent !== undefined" class="ctl__parent">
      parent : {{ token.valeurParent }}
    </div>
  </div>
</template>

<style scoped>
.ctl {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
}
.ctl--modifie {
  border-color: #e0a84a;
  background: rgba(224, 168, 74, 0.08);
}
.ctl--herite .ctl__nom {
  opacity: 0.6;
}
.ctl__entete {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}
.ctl__nom {
  font-size: 12px;
  color: #d8dde3;
}
.ctl__badge {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8a96a3;
}
.ctl__lien {
  margin-left: auto;
  font-size: 11px;
  color: #8ab4f8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.ctl__ligne {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ctl__ligne input[type='range'] {
  flex: 1;
  min-width: 0;
}
.ctl__echantillon {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.ctl__nombre {
  width: 64px;
}
.ctl__texte {
  width: 100%;
  margin-top: 4px;
  font-family: ui-monospace, monospace;
  font-size: 12px;
}
.ctl__parent {
  margin-top: 3px;
  font-size: 11px;
  color: #8a96a3;
  font-family: ui-monospace, monospace;
}
select, input {
  background: #161b22;
  color: #d8dde3;
  border: 1px solid #30363d;
  border-radius: 4px;
  padding: 3px 5px;
  font-size: 12px;
}
select {
  flex: 1;
  min-width: 0;
}
input[type='color'] {
  width: 34px;
  height: 24px;
  padding: 1px;
  flex: none;
}
input[type='range'] {
  padding: 0;
  border: none;
  background: none;
}
</style>
