/*
 * Plugin Vite de l'éditeur de tokens (serveur de développement uniquement).
 *
 *   GET /__calque/api/themes                → thèmes trouvés
 *   GET /__calque/api/tokens?theme=<nom>    → tokens du thème, héritage résolu
 *   PUT /__calque/api/tokens?theme=<nom>    → { changements: { "--nom": "valeur" | null } }
 *
 * Un thème est éditable s'il déclare dans son package.json :
 *   "calque": { "tokens": "styles/tokens.css", "parent": "<paquet du thème parent>" }
 * Les thèmes sont cherchés dans les node_modules, en remontant depuis l'addon
 * et depuis la présentation.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ecrireTokens, lireTokens, valeurAcceptable } from './css.ts'

interface Theme {
  nom: string
  parent?: string
  fichier: string
}

const PREFIXE = '/__calque/api/'

function trouverThemes(departs: string[]): Map<string, Theme> {
  const themes = new Map<string, Theme>()
  for (const depart of departs) {
    let dossier = path.resolve(depart)
    while (true) {
      const modules = path.join(dossier, 'node_modules')
      if (fs.existsSync(modules)) {
        for (const entree of fs.readdirSync(modules)) {
          if (!entree.startsWith('slidev-theme-') || themes.has(entree))
            continue
          const racine = fs.realpathSync(path.join(modules, entree))
          const fichierPaquet = path.join(racine, 'package.json')
          if (!fs.existsSync(fichierPaquet))
            continue
          const paquet = JSON.parse(fs.readFileSync(fichierPaquet, 'utf-8'))
          if (paquet.calque?.tokens)
            themes.set(paquet.name, { nom: paquet.name, parent: paquet.calque.parent, fichier: path.join(racine, paquet.calque.tokens) })
        }
      }
      const parent = path.dirname(dossier)
      if (parent === dossier)
        break
      dossier = parent
    }
  }
  return themes
}

/** Le thème et ses ancêtres, du plus ancien au plus récent. */
function lignee(themes: Map<string, Theme>, nom: string): Theme[] {
  const chaine: Theme[] = []
  let courant = themes.get(nom)
  while (courant && !chaine.includes(courant)) {
    chaine.unshift(courant)
    courant = courant.parent ? themes.get(courant.parent) : undefined
  }
  return chaine
}

function tokensResolus(themes: Map<string, Theme>, nom: string) {
  const chaine = lignee(themes, nom)
  const resultat = new Map<string, { nom: string, valeur: string, groupe: string, source: 'theme' | 'parent', valeurParent?: string }>()
  for (const theme of chaine) {
    const propre = theme.nom === nom
    for (const t of lireTokens(fs.readFileSync(theme.fichier, 'utf-8'))) {
      const existant = resultat.get(t.nom)
      resultat.set(t.nom, {
        nom: t.nom,
        valeur: t.valeur,
        groupe: existant?.groupe || t.groupe,
        source: propre ? 'theme' : 'parent',
        valeurParent: propre ? existant?.valeur : undefined,
      })
    }
  }
  return { theme: nom, parent: themes.get(nom)?.parent ?? null, tokens: [...resultat.values()] }
}

function repondre(res: ServerResponse, statut: number, corps: unknown) {
  res.statusCode = statut
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(corps))
}

async function lireCorps(req: IncomingMessage): Promise<any> {
  let texte = ''
  for await (const morceau of req)
    texte += morceau
  return JSON.parse(texte || '{}')
}

export function editeurTokens(): Plugin {
  const dossierAddon = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
  return {
    name: 'calque:editeur-tokens',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(PREFIXE))
          return next()
        try {
          const url = new URL(req.url, 'http://localhost')
          const route = url.pathname.slice(PREFIXE.length)
          // Relu à chaque requête : un thème ajouté ou modifié à la main est pris en compte
          const themes = trouverThemes([dossierAddon, server.config.root, process.cwd()])

          if (route === 'themes' && req.method === 'GET')
            return repondre(res, 200, [...themes.values()].map(t => ({ nom: t.nom, parent: t.parent ?? null })))

          if (route === 'tokens') {
            const nom = url.searchParams.get('theme') ?? ''
            const theme = themes.get(nom)
            if (!theme)
              return repondre(res, 404, { erreur: `Thème inconnu : ${nom}` })

            if (req.method === 'GET')
              return repondre(res, 200, tokensResolus(themes, nom))

            if (req.method === 'PUT') {
              const { changements } = await lireCorps(req)
              const connus = new Set(tokensResolus(themes, nom).tokens.map(t => t.nom))
              for (const [cle, valeur] of Object.entries<string | null>(changements ?? {})) {
                if (!connus.has(cle))
                  return repondre(res, 400, { erreur: `Token inconnu : ${cle}` })
                if (valeur === null && !theme.parent)
                  return repondre(res, 400, { erreur: `${cle} : un thème sans parent doit définir tous ses tokens` })
                if (valeur !== null && !valeurAcceptable(valeur))
                  return repondre(res, 400, { erreur: `Valeur refusée pour ${cle} : ${valeur}` })
              }
              const css = fs.readFileSync(theme.fichier, 'utf-8')
              fs.writeFileSync(theme.fichier, ecrireTokens(css, changements))
              return repondre(res, 200, tokensResolus(themes, nom))
            }
          }
          repondre(res, 404, { erreur: 'Route inconnue' })
        }
        catch (e) {
          repondre(res, 500, { erreur: String(e) })
        }
      })
    },
  }
}
