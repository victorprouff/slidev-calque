/*
 * Ajoute la page de l'éditeur de tokens (/__calque), en développement seulement.
 * Slidev appelle cette fonction avec ses routes et garde celles qu'elle renvoie.
 */
export default function (routes: any[]) {
  if (!import.meta.env.DEV)
    return routes
  return [
    ...routes,
    {
      name: 'calque-editeur',
      path: '/__calque',
      component: () => import('../editeur/Editeur.vue'),
    },
  ]
}
