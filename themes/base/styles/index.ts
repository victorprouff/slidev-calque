/*
 * Point d'entrée du thème base. Slidev charge ce fichier automatiquement
 * (styles/index.ts à la racine du thème). Un thème enfant l'importe en
 * premier, puis surcharge les tokens.
 *
 * Imports en JavaScript plutôt qu'en @import CSS : le fichier de Slidev
 * ci-dessous contient des directives UnoCSS (@apply), qui ne sont
 * transformées que s'il est importé ainsi.
 */

// Mise en page de base fournie par Slidev (hauteur pleine, marges intérieures).
// Les thèmes officiels l'importent aussi : sans elle, le fond ne couvre que le contenu.
import '@slidev/client/styles/layouts-base.css'

import './polices.css'
import './tokens.css'
import './elements.css'
