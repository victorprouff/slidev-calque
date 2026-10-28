/*
 * Lecture et écriture des tokens dans un fichier CSS.
 * On ne touche qu'au premier bloc `:root { … }` et ligne par ligne :
 * commentaires, ordre et mise en forme du fichier restent tels quels.
 */

export interface TokenLu {
  nom: string
  valeur: string
  groupe: string
}

const RE_DECLARATION = /^(\s*)(--[\w-]+)(\s*:\s*)([^;]+?)(\s*;.*)$/
// Titre de groupe : /* ---------- Couleurs : rôles ---------- */
const RE_GROUPE = /\/\*\s*-{3,}\s*(.+?)\s*-{3,}\s*\*\//

/** Position du contenu du premier bloc :root (entre ses accolades), commentaires ignorés. */
function blocRoot(css: string): { debut: number, fin: number } | null {
  let i = 0
  let profondeur = 0
  let debut = -1
  while (i < css.length) {
    if (css.startsWith('/*', i)) {
      const finCommentaire = css.indexOf('*/', i + 2)
      i = finCommentaire === -1 ? css.length : finCommentaire + 2
      continue
    }
    const c = css[i]
    if (c === '{') {
      if (profondeur === 0 && debut === -1 && /:root\s*$/.test(css.slice(0, i)))
        debut = i + 1
      profondeur++
    }
    else if (c === '}') {
      profondeur--
      if (profondeur === 0 && debut !== -1)
        return { debut, fin: i }
    }
    i++
  }
  return null
}

export function lireTokens(css: string): TokenLu[] {
  const bloc = blocRoot(css)
  if (!bloc)
    return []
  const tokens: TokenLu[] = []
  let groupe = ''
  for (const ligne of css.slice(bloc.debut, bloc.fin).split('\n')) {
    const titre = ligne.match(RE_GROUPE)
    if (titre) {
      groupe = titre[1]
      continue
    }
    const m = ligne.match(RE_DECLARATION)
    if (m)
      tokens.push({ nom: m[2], valeur: m[4].trim(), groupe })
  }
  return tokens
}

/**
 * Applique des changements : une valeur remplace celle du token (ou l'ajoute
 * en fin de bloc s'il n'y est pas), null supprime la déclaration.
 */
export function ecrireTokens(css: string, changements: Record<string, string | null>): string {
  let bloc = blocRoot(css)
  if (!bloc) {
    css = `${css.trimEnd()}\n\n:root {\n}\n`
    bloc = blocRoot(css)!
  }
  const restants = new Map(Object.entries(changements))
  const lignes = css.slice(bloc.debut, bloc.fin).split('\n')
  const nouvelles: string[] = []
  for (const ligne of lignes) {
    const m = ligne.match(RE_DECLARATION)
    if (m && restants.has(m[2])) {
      const valeur = restants.get(m[2])
      restants.delete(m[2])
      if (valeur !== null)
        nouvelles.push(`${m[1]}${m[2]}${m[3]}${valeur}${m[5]}`)
      continue
    }
    nouvelles.push(ligne)
  }
  const ajouts = [...restants].filter(([, v]) => v !== null).map(([nom, v]) => `  ${nom}: ${v};`)
  if (ajouts.length) {
    // Avant la dernière ligne, qui ne contient que l'indentation précédant « } »
    const derniere = nouvelles.pop() ?? ''
    nouvelles.push(...ajouts, derniere)
  }
  return css.slice(0, bloc.debut) + nouvelles.join('\n') + css.slice(bloc.fin)
}

/** Refuse ce qui pourrait sortir de la déclaration ou casser le fichier. */
export function valeurAcceptable(valeur: string): boolean {
  return valeur.trim().length > 0
    && valeur.length <= 300
    && !/[;{}\n\r]|\/\*|\*\//.test(valeur)
}
