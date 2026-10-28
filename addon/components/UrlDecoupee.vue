<!--
  Adresse web découpée : chaque morceau souligné, avec son nom dessous.
  Usage :
    <UrlDecoupee :morceaux="[
      { texte: 'https://', legende: 'protocole' },
      { texte: 'microsoft.', legende: 'sous-domaine' },
      { texte: 'authent.eu', legende: 'nom de domaine', ton: 'danger' },
      { texte: '/login', legende: 'chemin' },
    ]" />
  ton : "danger", "succes" ou "accent" pour faire ressortir un morceau. Sans ton : neutre.
  une-ligne : police un peu plus petite et pas de retour à la ligne (adresses longues).
-->
<script setup lang="ts">
defineProps<{
  morceaux: { texte: string, legende?: string, ton?: 'danger' | 'succes' | 'accent' }[]
  uneLigne?: boolean
}>()
</script>

<template>
  <div class="url-decoupee" :class="{ 'url-decoupee--une-ligne': uneLigne }">
    <span
      v-for="(m, i) in morceaux"
      :key="i"
      class="url-decoupee__morceau"
      :class="m.ton && `url-decoupee__morceau--${m.ton}`"
    >
      <span class="url-decoupee__texte">{{ m.texte }}</span>
      <span v-if="m.legende" class="url-decoupee__legende">{{ m.legende }}</span>
    </span>
  </div>
</template>

<style>
:where(.url-decoupee) {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  row-gap: var(--espace-m);
  padding: var(--espace-m) var(--espace-l);
  background: var(--couleur-surface);
  border: var(--trait-fin) solid var(--couleur-bordure);
  border-radius: var(--rayon-encart);
}

.url-decoupee__morceau {
  display: flex;
  flex-direction: column;
  /* Un morceau trop long (identifiant…) peut passer à la ligne */
  min-width: 0;
  max-width: 100%;
}

.url-decoupee__texte {
  font-family: var(--police-code);
  font-size: var(--taille-moyen);
  word-break: break-all;
  padding: 0 0.05em var(--espace-xs);
  border-bottom: var(--trait-titre) solid var(--couleur-bordure);
}

.url-decoupee--une-ligne {
  flex-wrap: nowrap;
  /* Petit écart entre les morceaux : chaque soulignement et sa légende restent distincts */
  column-gap: 0.2em;
}

/* Les morceaux gardent leur largeur : sinon ils se compriment et les légendes se chevauchent */
.url-decoupee--une-ligne .url-decoupee__morceau {
  flex-shrink: 0;
}

.url-decoupee--une-ligne .url-decoupee__texte {
  font-size: var(--taille-petit);
  word-break: normal;
  white-space: nowrap;
}

.url-decoupee__legende {
  /* Centrée sous son morceau */
  align-self: center;
  margin-top: var(--espace-xs);
  font-size: var(--taille-mini);
  letter-spacing: var(--approche-etiquette);
  text-transform: uppercase;
  color: var(--couleur-texte-attenue);
}

.url-decoupee__morceau--danger .url-decoupee__texte { color: var(--couleur-danger); border-color: var(--couleur-danger); }
.url-decoupee__morceau--danger .url-decoupee__legende { color: var(--couleur-danger); }
.url-decoupee__morceau--succes .url-decoupee__texte { color: var(--couleur-succes); border-color: var(--couleur-succes); }
.url-decoupee__morceau--succes .url-decoupee__legende { color: var(--couleur-succes); }
.url-decoupee__morceau--accent .url-decoupee__texte { color: var(--couleur-accent); border-color: var(--couleur-accent); }
.url-decoupee__morceau--accent .url-decoupee__legende { color: var(--couleur-accent); }
</style>
