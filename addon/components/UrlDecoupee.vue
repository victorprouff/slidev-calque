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
-->
<script setup lang="ts">
defineProps<{
  morceaux: { texte: string, legende?: string, ton?: 'danger' | 'succes' | 'accent' }[]
}>()
</script>

<template>
  <div class="url-decoupee">
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

.url-decoupee__legende {
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
