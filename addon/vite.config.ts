import { editeurTokens } from './editeur/serveur.ts'

/*
 * Slidev fusionne ce fichier avec sa propre configuration Vite.
 * Le plugin ne s'active qu'en développement (slidev, pas slidev build).
 */
export default {
  plugins: [editeurTokens()],
}
