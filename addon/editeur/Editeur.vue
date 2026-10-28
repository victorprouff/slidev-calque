<!--
  Éditeur de tokens : page /__calque du serveur de développement.
  À gauche les tokens du thème choisi, à droite la présentation en direct.
  Les modifications s'appliquent tout de suite à l'aperçu ; « Enregistrer »
  les écrit dans le fichier de tokens du thème.
-->
<script setup lang="ts">
import type { Token } from './ControleToken.vue'
import configs from '#slidev/configs'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import ControleToken from './ControleToken.vue'

interface Theme { nom: string, parent: string | null }

const API = `${import.meta.env.BASE_URL}__calque/api/`

const themes = ref<Theme[]>([])
const themeChoisi = ref('')
const tokens = ref<Token[]>([])
const modifications = reactive(new Map<string, string | null>())
const message = ref('')
const erreur = ref(false)
const enregistrement = ref(false)
const filtre = ref('')
const numeroSlide = ref(1)
const apercu = ref<HTMLIFrameElement>()
const polices = ref<string[]>([])

const theme = computed(() => themes.value.find(t => t.nom === themeChoisi.value))
const heritable = computed(() => !!theme.value?.parent)

// ---------- Chargement ----------
async function appel(chemin: string, options?: RequestInit) {
  const reponse = await fetch(API + chemin, options)
  const corps = await reponse.json()
  if (!reponse.ok)
    throw new Error(corps.erreur ?? reponse.statusText)
  return corps
}

/** Thème de la présentation ouverte : dernier segment de `theme:` dans l'en-tête. */
function themeDeLaPresentation(liste: Theme[]): string {
  const segment = String(configs.theme ?? '').split('/').filter(Boolean).pop() ?? ''
  return liste.find(t => t.nom === segment || t.nom.endsWith(`-${segment}`))?.nom
    ?? liste.find(t => t.parent)?.nom
    ?? liste[0]?.nom
    ?? ''
}

async function chargerTokens() {
  if (!themeChoisi.value)
    return
  const donnees = await appel(`tokens?theme=${encodeURIComponent(themeChoisi.value)}`)
  // Le pont vers Slidev (--slidev-*) se déduit des autres tokens : on ne l'édite pas ici
  tokens.value = donnees.tokens.filter((t: Token) => !t.nom.startsWith('--slidev-'))
}

onMounted(async () => {
  try {
    themes.value = await appel('themes')
    themeChoisi.value = themeDeLaPresentation(themes.value)
  }
  catch (e) {
    afficher(String(e), true)
  }
  await document.fonts.ready
  polices.value = [...new Set([...document.fonts].map(f => f.family.replace(/["']/g, '')))].sort()
})

watch(themeChoisi, async (nouveau, ancien) => {
  if (ancien && modifications.size && !confirm('Des modifications ne sont pas enregistrées. Les abandonner ?')) {
    themeChoisi.value = ancien
    return
  }
  annuler()
  await chargerTokens()
})

// ---------- Groupes ----------
const groupes = computed(() => {
  const resultat = new Map<string, Token[]>()
  const f = filtre.value.trim().toLowerCase()
  for (const t of tokens.value) {
    if (f && !t.nom.includes(f))
      continue
    // « Palette : propre à ce thème, … » → « Palette »
    const nom = (t.groupe || 'Autres').split(':')[0].trim()
    if (!resultat.has(nom))
      resultat.set(nom, [])
    resultat.get(nom)!.push(t)
  }
  return resultat
})

const couleurs = computed(() => tokens.value
  .filter(t => t.nom.startsWith('--couleur') || t.groupe.startsWith('Palette'))
  .map(t => t.nom))

// ---------- Aperçu en direct ----------
/** Les deux documents à mettre à jour : cette page (échantillons) et l'aperçu. */
function documents(): HTMLElement[] {
  const racines = [document.documentElement]
  const autre = apercu.value?.contentDocument?.documentElement
  if (autre)
    racines.push(autre)
  return racines
}

function appliquer(nom: string, valeur: string | null) {
  for (const racine of documents()) {
    if (valeur === null)
      racine.style.removeProperty(nom)
    else
      racine.style.setProperty(nom, valeur)
  }
}

/** L'aperçu se recharge en changeant de slide : on y réapplique les modifications en cours. */
function reappliquer() {
  for (const [nom, valeur] of modifications)
    appliquer(nom, valeurEffective(nom, valeur))
}

function valeurEffective(nom: string, valeur: string | null): string | null {
  // Reprendre le parent : on prévisualise la valeur du parent
  return valeur === null ? (tokens.value.find(t => t.nom === nom)?.valeurParent ?? null) : valeur
}

function valeurAffichee(t: Token): string {
  if (!modifications.has(t.nom))
    return t.valeur
  return modifications.get(t.nom) ?? t.valeurParent ?? t.valeur
}

function modifier(t: Token, valeur: string) {
  if (valeur === t.valeur && t.source === 'theme')
    modifications.delete(t.nom)
  else
    modifications.set(t.nom, valeur)
  appliquer(t.nom, valeur)
}

function heriter(t: Token) {
  modifications.set(t.nom, null)
  appliquer(t.nom, valeurEffective(t.nom, null))
}

// ---------- Enregistrer / annuler ----------
function afficher(texte: string, estErreur = false) {
  message.value = texte
  erreur.value = estErreur
  if (!estErreur)
    setTimeout(() => message.value === texte && (message.value = ''), 3000)
}

function annuler() {
  for (const nom of modifications.keys())
    appliquer(nom, null)
  modifications.clear()
}

async function enregistrer() {
  if (!modifications.size)
    return
  enregistrement.value = true
  try {
    const changements = Object.fromEntries(modifications)
    const donnees = await appel(`tokens?theme=${encodeURIComponent(themeChoisi.value)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changements }),
    })
    tokens.value = donnees.tokens.filter((t: Token) => !t.nom.startsWith('--slidev-'))
    const nombre = modifications.size
    // On laisse le rechargement à chaud appliquer le fichier avant de retirer l'aperçu en ligne
    setTimeout(annuler, 400)
    afficher(`${nombre} token${nombre > 1 ? 's' : ''} enregistré${nombre > 1 ? 's' : ''} dans ${themeChoisi.value}`)
  }
  catch (e) {
    afficher(String(e), true)
  }
  finally {
    enregistrement.value = false
  }
}

function retenirSiModifie(e: BeforeUnloadEvent) {
  if (modifications.size)
    e.preventDefault()
}
onMounted(() => window.addEventListener('beforeunload', retenirSiModifie))
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', retenirSiModifie)
  // Sans ça, l'aperçu non enregistré resterait appliqué en revenant aux slides
  annuler()
})

const lienSlide = computed(() => `${import.meta.env.BASE_URL}${numeroSlide.value}`)
// clicks=999 : Slidev le ramène au dernier clic de la slide, tout est donc affiché
const srcApercu = computed(() => `${lienSlide.value}?embedded=true&clicks=999`)
</script>

<template>
  <div class="editeur">
    <aside class="panneau">
      <header class="panneau__entete">
        <div class="panneau__titre">
          Éditeur de tokens
        </div>
        <label class="champ">
          <span>Thème</span>
          <select v-model="themeChoisi">
            <option v-for="t in themes" :key="t.nom" :value="t.nom">
              {{ t.nom }}{{ t.parent ? ` (hérite de ${t.parent})` : '' }}
            </option>
          </select>
        </label>
        <input v-model="filtre" class="filtre" placeholder="Filtrer : couleur, taille, rayon…" spellcheck="false">
      </header>

      <div class="panneau__liste">
        <section v-for="[nom, liste] in groupes" :key="nom" class="groupe">
          <h2>{{ nom }}</h2>
          <ControleToken
            v-for="t in liste"
            :key="t.nom"
            :token="t"
            :valeur="valeurAffichee(t)"
            :modifie="modifications.has(t.nom)"
            :heritable="heritable"
            :couleurs="couleurs"
            :polices="polices"
            @change="modifier(t, $event)"
            @heriter="heriter(t)"
          />
        </section>
      </div>

      <footer class="panneau__pied">
        <div v-if="message" class="message" :class="{ 'message--erreur': erreur }">
          {{ message }}
        </div>
        <div class="actions">
          <button :disabled="!modifications.size" @click="annuler">
            Annuler
          </button>
          <button class="principal" :disabled="!modifications.size || enregistrement" @click="enregistrer">
            Enregistrer{{ modifications.size ? ` (${modifications.size})` : '' }}
          </button>
        </div>
      </footer>
    </aside>

    <main class="apercu">
      <div class="apercu__barre">
        <button @click="numeroSlide = Math.max(1, numeroSlide - 1)">
          ←
        </button>
        <label>Slide <input v-model.number="numeroSlide" type="number" min="1"></label>
        <button @click="numeroSlide++">
          →
        </button>
        <a :href="lienSlide" target="_blank">ouvrir dans un onglet</a>
      </div>
      <iframe ref="apercu" :src="srcApercu" class="apercu__cadre" @load="reappliquer" />
    </main>
  </div>
</template>

<style scoped>
/* Interface volontairement neutre : elle ne dépend pas des tokens qu'elle modifie */
.editeur {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: 380px 1fr;
  background: #0d1117;
  color: #d8dde3;
  font: 13px/1.4 system-ui, sans-serif;
  text-align: left;
}
.panneau {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid #30363d;
}
.panneau__entete {
  padding: 14px;
  border-bottom: 1px solid #30363d;
  display: grid;
  gap: 10px;
}
.panneau__titre {
  font-weight: 600;
  font-size: 15px;
}
.champ {
  display: grid;
  gap: 4px;
  font-size: 11px;
  color: #8a96a3;
}
.panneau__liste {
  flex: 1;
  overflow-y: auto;
  padding: 6px 8px 16px;
}
.groupe h2 {
  margin: 14px 6px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8a96a3;
}
.panneau__pied {
  padding: 12px 14px;
  border-top: 1px solid #30363d;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.message {
  margin-bottom: 8px;
  font-size: 12px;
  color: #7ee2a8;
}
.message--erreur {
  color: #ff8b7b;
}
.apercu {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.apercu__barre {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #30363d;
}
.apercu__barre input {
  width: 56px;
}
.apercu__barre a {
  margin-left: auto;
  color: #8ab4f8;
}
.apercu__cadre {
  flex: 1;
  border: none;
  background: #000;
}
select, input, button {
  background: #161b22;
  color: #d8dde3;
  border: 1px solid #30363d;
  border-radius: 4px;
  padding: 4px 8px;
  font: inherit;
}
button {
  cursor: pointer;
}
button:disabled {
  opacity: 0.4;
  cursor: default;
}
button.principal:not(:disabled) {
  background: #238636;
  border-color: #2ea043;
  color: #fff;
}
</style>
