import { fileURLToPath } from 'node:url'

/*
 * Slidev n'autorise que les fichiers de la présentation, du thème et des addons.
 * Le thème base (ses polices, notamment) est en dehors : on ajoute son dossier.
 * Slidev fusionne ce fichier avec sa propre configuration Vite.
 *
 * Utile seulement en développement, quand base est lié depuis ce dépôt.
 * Une fois publié, base est installé dans node_modules de la présentation,
 * qui est déjà autorisé.
 */
export default {
  server: {
    fs: {
      allow: [fileURLToPath(new URL('../base', import.meta.url))],
    },
  },
}
