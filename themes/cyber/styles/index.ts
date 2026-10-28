/*
 * Thème cyber : hérite de base, puis surcharge les tokens qui changent.
 * L'ordre compte : surcharges.css arrive après base, avec le même
 * sélecteur (:root), donc ses valeurs l'emportent.
 */
import 'slidev-theme-calque-base/styles/index.ts'
import './surcharges.css'
