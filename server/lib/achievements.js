// ─────────────────────────────────────────────────────────────
// Logros que se ganan en una partida
// ─────────────────────────────────────────────────────────────

export const BADGES = {
  sniper:     { icon: '🎯', label: 'Francotirador', desc: 'Acertó todas (mínimo 3)' },
  edge:       { icon: '🃏', label: 'Al filo',       desc: 'Ganó con 21 exacto' },
  onfire:     { icon: '🔥', label: 'En llamas',     desc: '3 aciertos seguidos' },
  highroller: { icon: '💎', label: 'Apostador',     desc: 'Acertó una carta Avanzada' },
  polymath:   { icon: '🧠', label: 'Todoterreno',   desc: 'Acertó en 3 temas distintos' },
  cautious:   { icon: '🧊', label: 'Sangre fría',   desc: 'Ganó con 3 cartas o menos' },
  clean:      { icon: '🛡️', label: 'Sin ayudas',    desc: 'Ganó sin usar el 50/50' },
  kamikaze:   { icon: '💥', label: 'Kamikaze',      desc: 'Se pasó de 21' },
  ace:        { icon: '🂡', label: 'As dorado',     desc: 'Acertó la carta más rara' },
}

/**
 * @param {object} p        jugador final ({ status, points, maxStreak })
 * @param {Array}  history  respuestas del jugador
 * @param {boolean} won
 * @param {boolean} usedFifty
 * @returns {string[]} claves de logros
 */
export function computeBadges({ p, history = [], won, usedFifty }) {
  const out = []
  const answered = history.length
  const correct  = history.filter(h => h.correct)

  if (answered >= 3 && correct.length === answered)          out.push('sniper')
  if (won && p.points === 21)                                 out.push('edge')
  if ((p.maxStreak ?? 0) >= 3)                                out.push('onfire')
  if (correct.some(h => h.difficulty === 'advanced'))         out.push('highroller')
  if (new Set(correct.map(h => h.topic)).size >= 3)           out.push('polymath')
  if (won && answered > 0 && answered <= 3)                   out.push('cautious')
  if (won && !usedFifty && answered > 0)                      out.push('clean')
  if (p.status === 'eliminated')                              out.push('kamikaze')
  if (correct.some(h => h.ace))                               out.push('ace')

  return out
}
